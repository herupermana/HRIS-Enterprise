import fs from "fs";
import path from "path";
import mysql, { Connection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure local data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global DB connection
let dbConnection: Connection | null = null;
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

// Initialize DB (attempt MySQL, fallback to files)
export async function initializeDatabase() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

  if (host && user && database) {
    console.log(`🔌 Mencoba menghubungkan ke database MySQL (${host}:${port}, database: ${database})...`);
    try {
      dbConnection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port,
        connectTimeout: 5000
      });
      useMySQL = true;
      console.log("✅ Berhasil terhubung ke database MySQL!");

      // Create a persistent table to store each collection as JSON to ensure maximum safety,
      // flexibility, and zero risk of migrations crashing the production server on schema updates.
      await dbConnection.query(`
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
    }
  } else {
    console.log("ℹ️ Variabel lingkungan MySQL belum dikonfigurasi di file .env.");
    console.log("💾 Menggunakan File-system JSON Database fallback.");
    useMySQL = false;
  }
}

// Load data from MySQL or local JSON files
export async function loadHrisData() {
  const data: Record<string, any> = {};

  for (const key of COLLECTION_KEYS) {
    let loaded = false;

    if (useMySQL && dbConnection) {
      try {
        const [rows]: any = await dbConnection.query(
          "SELECT data_json FROM hris_collections WHERE id = ?",
          [key]
        );
        if (rows.length > 0) {
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

  // Save to MySQL if active
  if (useMySQL && dbConnection) {
    try {
      const dataStr = JSON.stringify(items);
      await dbConnection.query(
        "INSERT INTO hris_collections (id, data_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_json = ?",
        [key, dataStr, dataStr]
      );
    } catch (error: any) {
      console.error(`❌ Gagal menyimpan koleksi "${key}" ke MySQL:`, error.message);
      // Attempt reconnection if broken
      try {
        console.log("🔄 Mencoba menghubungkan kembali ke MySQL...");
        await initializeDatabase();
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
      solution: "Silakan edit file .env di folder project Anda melalui aaPanel File Manager / Terminal."
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

    return {
      success: true,
      message: "Sukses! Koneksi ke server MySQL berhasil dibuat dan diverifikasi.",
      details: `Berhasil terhubung ke host '${host}' pada port ${port} menggunakan user '${user}'`,
      solution: "Koneksi database Anda berjalan 100% normal dan siap menyinkronkan data HRIS!"
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
      solution = "Periksa kembali ejaan username dan password yang tercantum di file .env. Anda bisa melihat/mereset password database ini langsung melalui Tab 'Database' di aaPanel.";
    } else if (errCode === "ER_BAD_DB_ERROR") {
      message = "Database Tidak Ditemukan (Bad Database)";
      details = `Koneksi berhasil ke MySQL, namun database dengan nama '${database}' tidak ada.`;
      solution = "Pastikan nama database di file .env sama persis dengan database yang Anda tambahkan di aaPanel. Anda dapat menambahkan database baru dengan nama ini melalui menu 'Database > Add Database' di aaPanel.";
    } else if (errCode === "ENOTFOUND") {
      message = "Host Tidak Ditemukan (DNS Error/ENOTFOUND)";
      details = `Alamat host '${host}' tidak dapat diselesaikan atau tidak terdaftar dalam jaringan server.`;
      solution = "Jika MySQL berada di VPS yang sama, gunakan '127.0.0.1' atau 'localhost' sebagai DB_HOST Anda untuk rute tercepat dan teraman.";
    } else if (errCode === "ETIMEDOUT") {
      message = "Waktu Koneksi Habis (ETIMEDOUT)";
      details = `Mencoba menghubungi ${host} tetapi tidak ada respons dalam batas waktu yang ditentukan.`;
      solution = "Ini biasanya disebabkan oleh pemblokiran port 3306 oleh firewall. Periksa tab Security di aaPanel, atau setelan firewall penyedia VPS Anda (misalnya Alibaba Cloud, AWS, DigitalOcean) untuk mengizinkan lalu lintas masuk.";
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
