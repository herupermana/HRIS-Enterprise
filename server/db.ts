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
