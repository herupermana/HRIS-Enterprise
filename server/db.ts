import fs from "fs";
import path from "path";
import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure local data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global DB connection pool
let dbPool: Pool | null = null;
let useMySQL = false;

// Check which collections we need to manage
const COLLECTION_KEYS = [
  "employees",
  "attendance",
  "leaves",
  "payrollRecords",
  "periods",
  "deviceConfig",
  "auditLogs",
  "salaryHistory",
  "mutationHistory",
  "holidays",
  "announcements",
  "assets",
  "users",
  "violations"
];

// Helper to write/persist verified connection configs back into security env
function saveEnvConfig(config: {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
    }

    const updates = {
      DB_HOST: config.host,
      DB_PORT: String(config.port),
      DB_USER: config.user,
      DB_PASSWORD: config.password || "",
      DB_NAME: config.database
    };

    let lines = content.split("\n");
    for (const [key, value] of Object.entries(updates)) {
      let replaced = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        lines.push(`${key}=${value}`);
      }
    }

    fs.writeFileSync(envPath, lines.join("\n"), "utf-8");
    console.log("💾 Berhasil menyimpan konfigurasi .env yang terverifikasi.");
  } catch (err: any) {
    console.error("❌ Gagal menyimpan konfigurasi .env:", err.message);
  }
}

let lastDbAttempt = 0;
const DB_ATTEMPT_COOLDOWN = 60000; // 1 minute cooldown to prevent connection attempts blocking user requests during offline sequences

// Initialize DB (attempt MySQL pool, fallback to files)
export async function initializeDatabase(force = false) {
  const now = Date.now();
  if (!force && !useMySQL && lastDbAttempt > 0 && (now - lastDbAttempt < DB_ATTEMPT_COOLDOWN)) {
    return;
  }
  
  lastDbAttempt = now;

  // Dynamically re-read .env config
  try {
    dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });
  } catch (err: any) {
    console.warn("Gagal merelasikan konfigurasi aktual .env:", err.message);
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

  // Detect whether it remains a placeholder
  const isPlaceholder = !host || 
    host === "127.0.0.1" && (
      user?.includes("ganti_dengan") || 
      password?.includes("ganti_dengan") || 
      database?.includes("ganti_dengan")
    );

  if (host && user && database && !isPlaceholder) {
    console.log(`🔌 Mencoba menghubungkan ke database MySQL (${host}:${port}, database: ${database})...`);
    try {
      if (dbPool) {
        await dbPool.end().catch(() => {});
      }

      dbPool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        connectTimeout: 5000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });

      // Simple probe query
      await dbPool.query("SELECT 1");
      useMySQL = true;
      console.log("✅ Berhasil terhubung ke database MySQL via pooling!");

      // Create a persistent table to store each collection as JSON to ensure maximum safety,
      // flexibility, and zero risk of migrations crashing the production server on schema updates.
      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS hris_collections (
          id VARCHAR(100) PRIMARY KEY,
          data_json LONGTEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("🗄️ Tabel hris_collections siap digunakan.");
    } catch (error: any) {
      console.error("❌ Gagal terhubung ke MySQL pada rintisan start:", error.message);
      console.log("⚠️ Menggunakan File-system JSON Database fallback (Data disimpan lokal di file /data/*.json) untuk stabilitas server.");
      useMySQL = false;
      dbPool = null;
    }
  } else {
    console.log("ℹ️ Variabel lingkungan MySQL belum dikonfigurasi nyata di file .env.");
    console.log("💾 Menggunakan File-system JSON Database fallback.");
    useMySQL = false;
    dbPool = null;
  }
}

// Load data from MySQL or local JSON files
export async function loadHrisData() {
  const data: Record<string, any> = {};

  // Lazily probe database on dynamic load if not already connected
  if (!useMySQL) {
    await initializeDatabase();
  }

  for (const key of COLLECTION_KEYS) {
    let loaded = false;

    if (useMySQL && dbPool) {
      try {
        const [rows]: any = await dbPool.query(
          "SELECT data_json FROM hris_collections WHERE id = ?",
          [key]
        );
        if (rows && rows.length > 0) {
          data[key] = JSON.parse(rows[0].data_json);
          loaded = true;
        }
      } catch (error: any) {
        console.error(`❌ Gagal memuat koleksi "${key}" dari MySQL:`, error.message);
      }
    }

    // Fallback to local files if MySQL failed, produced nothing, or is disabled
    if (!loaded) {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, "utf-8");
          data[key] = JSON.parse(raw);
        } catch (error: any) {
          console.error(`❌ Gagal membaca file database ${key}.json:`, error.message);
          data[key] = null;
        }
      } else {
        data[key] = null; // No saved data, front-end can provide initial states
      }
    }
  }

  return data;
}

// Save specific collection to MySQL and local file (double write for extra durability and safety)
export async function saveHrisCollection(key: string, items: any) {
  // Always save to file-system first as a secure backup
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  } catch (err: any) {
    console.error(`❌ Gagal mencadangkan koleksi "${key}" ke disk:`, err.message);
  }

  // Double-check if we need database probe
  if (!useMySQL) {
    await initializeDatabase();
  }

  // Save to MySQL if active
  if (useMySQL && dbPool) {
    try {
      const dataStr = JSON.stringify(items);
      await dbPool.query(
        "INSERT INTO hris_collections (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?",
        [key, dataStr, dataStr]
      );
    } catch (error: any) {
      console.error(`❌ Gagal menyimpan koleksi "${key}" ke MySQL:`, error.message);
      useMySQL = false;
      // Attempt quick reconnection
      try {
        console.log("🔄 Mencoba menghubungkan kembali ke MySQL...");
        await initializeDatabase();
        if (useMySQL && dbPool) {
          const dataStr = JSON.stringify(items);
          await dbPool.query(
            "INSERT INTO hris_collections (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?",
            [key, dataStr, dataStr]
          );
        }
      } catch (reconnectErr) {
        // Silently swallow reconnect errors here to avoid crashing active requests
      }
    }
  }
}

// Interface to load and save health status
export function getDbStatus() {
  return {
    engine: useMySQL ? "MySQL (aaPanel Production)" : "SQLite/JSON File-system (Local Backup)",
    isConnected: useMySQL,
    host: useMySQL ? process.env.DB_HOST : "Local disk",
    dataDirectory: DATA_DIR
  };
}

// Read-time health check including latency ping and hpstate data synchronization status
export async function getDetailedDbStatus() {
  let latencyMs = -1;
  let lastSync = null;
  let collectionsCount = 0;
  let useMySQLCurrent = useMySQL;

  if (useMySQLCurrent && dbPool) {
    try {
      const start = process.hrtime();
      await dbPool.query("SELECT 1");
      const diff = process.hrtime(start);
      latencyMs = Math.round((diff[0] * 1000) + (diff[1] / 1000000));
      
      const [rows]: any = await dbPool.query(
        "SELECT COUNT(*) as count, MAX(updated_at) as last_sync FROM hris_collections"
      );
      if (rows && rows[0]) {
        collectionsCount = rows[0].count;
        lastSync = rows[0].last_sync ? new Date(rows[0].last_sync).toISOString() : null;
      }
    } catch (err: any) {
      console.warn("Real-time ping check database failed:", err.message);
      // Fallback immediately since query timed out or failed to prevent further freezes
      useMySQL = false;
      useMySQLCurrent = false;
    }
  }

  return {
    engine: useMySQLCurrent ? "MySQL (aaPanel Production)" : "SQLite/JSON File-system (Local Backup)",
    isConnected: useMySQLCurrent,
    host: useMySQLCurrent ? process.env.DB_HOST : "Local/Remote",
    databaseName: useMySQLCurrent ? (process.env.DB_NAME || "hpstate") : "Local disk",
    dataDirectory: DATA_DIR,
    latencyMs,
    lastSync,
    collectionsCount
  };
}

// Explicitly sync all local files from the local directory into the MySQL database tables
export async function syncAllLocalToMySQL() {
  if (!useMySQL) {
    await initializeDatabase(true); // Force connect bypass
  }

  if (!useMySQL || !dbPool) {
    throw new Error("Koneksi MySQL tidak aktif atau dibatasi. Silakan hubungkan database terlebih dahulu di tab Pengaturan.");
  }

  const syncedKeys: string[] = [];
  const errors: string[] = [];

  for (const key of COLLECTION_KEYS) {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        // Verify valid JSON before sending to database
        const parsed = JSON.parse(raw);
        const dataStr = JSON.stringify(parsed);

        await dbPool.query(
          "INSERT INTO hris_collections (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?",
          [key, dataStr, dataStr]
        );
        syncedKeys.push(key);
      } catch (err: any) {
        console.error(`Gagal menyinkronkan koleksi ${key}:`, err.message);
        errors.push(`${key}: ${err.message}`);
      }
    }
  }

  // Also write an audit log for the sync
  try {
    const timestamp = new Date().toISOString();
    const [auditRows]: any = await dbPool.query("SELECT data_json FROM hris_collections WHERE id = 'auditLogs'");
    let auditLogs = [];
    if (auditRows && auditRows.length > 0) {
      auditLogs = JSON.parse(auditRows[0].data_json);
    }
    const newLog = {
      id: "log_" + Date.now(),
      timestamp,
      module: "Sistem",
      action: "Sinkronisasi Database",
      details: `Menjalankan pemindahan manual ${syncedKeys.length} tabel data dari memori lokal (Local Backup) ke database utama MySQL.`,
      status: "Sukses",
      operator: "Super Admin"
    };
    auditLogs.unshift(newLog);
    // Limit to 500 records
    if (auditLogs.length > 500) {
      auditLogs = auditLogs.slice(0, 500);
    }
    await dbPool.query(
      "INSERT INTO hris_collections (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?",
      ["auditLogs", JSON.stringify(auditLogs), JSON.stringify(auditLogs)]
    );
  } catch (auditErr: any) {
    console.warn("Audit logging for sync task failed:", auditErr.message);
  }

  return {
    success: true,
    totalSynced: syncedKeys.length,
    syncedKeys,
    errors
  };
}

// Diagnostic connection test to provide deep troubleshooting feedback
export async function pingDatabase(customConfig?: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}) {
  const host = customConfig?.host || process.env.DB_HOST;
  const user = customConfig?.user || process.env.DB_USER;
  const password = customConfig?.password || process.env.DB_PASSWORD;
  const database = customConfig?.database || process.env.DB_NAME;
  const port = customConfig?.port || (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306);

  if (!host || !user || !database) {
    return {
      success: false,
      code: "MISSING_ENV_CONFIG",
      message: "Konfigurasi database belum lengkap di file .env Anda.",
      details: "Periksa .env untuk memastikan DB_HOST, DB_USER, dan DB_NAME sudah diisi.",
      solution: "Silakan masukkan kredensial baru melalui panel uji di atas untuk langsung mengupdate otomatis file .env!"
    };
  }

  try {
    const conn = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      connectTimeout: 4000
    });
    
    // Quick ping query
    await conn.query("SELECT 1");
    await conn.end();

    // SUCCESS! If this was a custom user-submitted configuration, update the .env file and active pool live!
    if (customConfig && customConfig.host && customConfig.user && customConfig.database) {
      saveEnvConfig({
        host: customConfig.host,
        port,
        user: customConfig.user,
        password: customConfig.password,
        database: customConfig.database
      });
      // Re-initialize active pool immediately so everything starts saving directly!
      await initializeDatabase();
    } else {
      // If of current .env and success, make sure useMySQL is active
      useMySQL = true;
    }

    return {
      success: true,
      message: "Sukses! Koneksi ke server MySQL berhasil dibuat dan diverifikasi.",
      details: `Berhasil terhubung ke host '${host}' pada port ${port} menggunakan user '${user}'`,
      solution: "Koneksi database Anda berjalan 100% normal dan siap menyinkronkan seluruh data HRIS Anda secara instan!"
    };
  } catch (error: any) {
    console.error("Diagnostic Ping Failed:", error);
    const errCode = error.code || error.errno || "";
    let message = "Gagal terhubung ke database.";
    let details = error.message || "";
    let solution = "Coba periksa kredensial database Anda atau status layanan server MySQL.";

    if (errCode === "ECONNREFUSED") {
      message = "Koneksi Ditolak (ECONNREFUSED)";
      details = `Sistem gagal menghubungi server MySQL di alamat ${host}:${port}. Server menolak sambungan.`;
      solution = "Pastikan servis MySQL/MariaDB sudah AKTIF di panel kontrol aaPanel Anda (App Store > MySQL > status Run). Pastikan juga port 3306 sudah dibuka di menu Security aaPanel dan firewall sistem VPS Linux Anda.";
    } else if (errCode === "ER_ACCESS_DENIED_ERROR") {
      message = "Kredensial Salah (Access Denied)";
      details = `Username atau password untuk akun '${user}' ditolak oleh MySQL server.`;
      solution = "Periksa kembali ejaan username dan password yang dimasukkan. Anda bisa melihat/mereset password database ini langsung melalui Tab 'Database' di aaPanel.";
    } else if (errCode === "ER_BAD_DB_ERROR") {
      message = "Database Tidak Ditemukan (Bad Database)";
      details = `Koneksi berhasil ke MySQL, namun database dengan nama '${database}' tidak ada.`;
      solution = "Pastikan nama database sama persis dengan database yang Anda tambahkan di aaPanel. Anda dapat menambahkan database baru dengan nama ini melalui menu 'Database > Add Database' di aaPanel.";
    } else if (errCode === "ENOTFOUND") {
      message = "Host Tidak Ditemukan (DNS Error/ENOTFOUND)";
      details = `Alamat host '${host}' tidak dapat diselesaikan atau tidak terdaftar dalam jaringan server.`;
      solution = "Jika MySQL berada di VPS yang sama, gunakan IP Publik VPS Anda (misalnya IP cumalogika.space) agar server eksternal ini bisa menjangkaunya.";
    } else if (errCode === "ETIMEDOUT") {
      message = "Waktu Koneksi Habis (ETIMEDOUT)";
      details = `Mencoba menghubungi ${host} tetapi tidak ada respons dalam batas waktu yang ditentukan.`;
      solution = "Ini biasanya disebabkan oleh pemblokiran port 3306 oleh firewall. Periksa tab Security di aaPanel, atau setelan firewall penyedia VPS/Cloud Anda (misalnya Alibaba Cloud, AWS, DigitalOcean) untuk mengizinkan lalu lintas masuk dari luar.";
    }

    return {
      success: false,
      code: errCode,
      message,
      details,
      solution
    };
  }
}
