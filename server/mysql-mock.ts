import fs from "fs";
import path from "path";
import mysql from "mysql2";

const DATA_DIR = path.join(process.cwd(), "data");

// Helper to extract string literals from SQL (handling escapes)
function parseStrings(sql: string): string[] {
  const results: string[] = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === "'") {
      let str = "";
      i++;
      while (i < sql.length) {
        if (sql[i] === "\\") {
          str += sql[i + 1] || "";
          i += 2;
        } else if (sql[i] === "'") {
          if (sql[i + 1] === "'") {
            str += "'";
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          str += sql[i];
          i++;
        }
      }
      results.push(str);
    } else {
      i++;
    }
  }
  return results;
}

export function startMysqlMockServer(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const server = (mysql as any).createServer();

      server.on("connection", (conn: any) => {
        // Perform server handshake
        conn.serverHandshake({
          protocolVersion: 10,
          serverVersion: "8.0.25-Mock-aaPanel",
          connectionId: Math.floor(Math.random() * 1000) + 1,
          statusFlags: 2,
          characterSet: 33,
          capabilityFlags: 0xffffff
        });

        conn.on("query", (query: string) => {
          const trimmed = query.trim();
          const upper = trimmed.toUpperCase();

          // 1. SELECT 1 ping probe
          if (upper === "SELECT 1") {
            conn.writeColumns([
              {
                name: "1",
                columnLength: 1,
                columnType: 3, // MYSQL_TYPE_LONG
                flags: 0
              }
            ]);
            conn.writeTextRow(["1"]);
            conn.writeOk();
            return;
          }

          // 2. CREATE TABLE
          if (upper.startsWith("CREATE TABLE")) {
            conn.writeOk();
            return;
          }

          // 3. SELECT data_json FROM hris_collections WHERE id = 'key'
          if (upper.startsWith("SELECT DATA_JSON")) {
            const strings = parseStrings(trimmed);
            const key = strings[0];
            if (key) {
              const filePath = path.join(DATA_DIR, `${key}.json`);
              let dataJsonContent = "[]";
              if (fs.existsSync(filePath)) {
                try {
                  dataJsonContent = fs.readFileSync(filePath, "utf-8");
                } catch (e) {
                  console.error(`[MySQL Mock] Failed to read file ${key}.json:`, e);
                }
              }
              conn.writeColumns([
                {
                  name: "data_json",
                  columnLength: 16777215, // MEDIUMBLOB size
                  columnType: 252, // MYSQL_TYPE_BLOB
                  flags: 0
                }
              ]);
              conn.writeTextRow([dataJsonContent]);
              conn.writeOk();
            } else {
              conn.writeError({ message: "Collection key not found in query", code: 1054 });
            }
            return;
          }

          // 4. INSERT INTO hris_collections ... ON DUPLICATE KEY UPDATE
          if (upper.startsWith("INSERT INTO")) {
            const strings = parseStrings(trimmed);
            if (strings.length >= 2) {
              const key = strings[0];
              const jsonStr = strings[1];
              try {
                const parsed = JSON.parse(jsonStr);
                const filePath = path.join(DATA_DIR, `${key}.json`);
                fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf-8");
                console.log(`📥 [MySQL Mock Server] Synchronized collection '${key}' with local storage.`);
                conn.writeOk();
              } catch (e: any) {
                console.error(`❌ [MySQL Mock Server] Failed to save collection '${key}':`, e.message);
                conn.writeError({ message: `Failed to save JSON data: ${e.message}`, code: 1105 });
              }
            } else {
              conn.writeError({ message: "Invalid INSERT statement parameters", code: 1105 });
            }
            return;
          }

          // 5. SELECT COUNT(*) as count, MAX(updated_at) as last_sync FROM hris_collections
          if (upper.includes("SELECT COUNT(*)") || upper.includes("COUNT(*) AS COUNT")) {
            try {
              const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
              const count = files.length;
              let maxMtime = 0;
              for (const file of files) {
                const stat = fs.statSync(path.join(DATA_DIR, file));
                if (stat.mtimeMs > maxMtime) {
                  maxMtime = stat.mtimeMs;
                }
              }
              const lastSync = maxMtime 
                ? new Date(maxMtime).toISOString().replace("T", " ").substring(0, 19) 
                : new Date().toISOString().replace("T", " ").substring(0, 19);

              conn.writeColumns([
                {
                  name: "count",
                  columnLength: 10,
                  columnType: 3, // MYSQL_TYPE_LONG
                  flags: 0
                },
                {
                  name: "last_sync",
                  columnLength: 30,
                  columnType: 254, // MYSQL_TYPE_STRING
                  flags: 0
                }
              ]);
              conn.writeTextRow([String(count), lastSync]);
              conn.writeOk();
            } catch (err: any) {
              conn.writeError({ message: err.message, code: 1105 });
            }
            return;
          }

          // Fallback OK for other statements
          conn.writeOk();
        });

        conn.on("error", (err: any) => {
          // Ignore connection resets
          if (err.code !== "ECONNRESET") {
            console.warn("[MySQL Mock] Connection error:", err.message);
          }
        });
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.log("ℹ️ [MySQL Mock] Port 3306 is already in use, assuming another mock server is running.");
        } else {
          console.error("❌ [MySQL Mock] Server error:", err.message);
        }
      });

      server.listen(3306, "127.0.0.1", () => {
        console.log("🔌 [MySQL Mock Server] Running and listening on 127.0.0.1:3306");
        resolve();
      });
    } catch (e) {
      console.error("❌ [MySQL Mock] Failed to initialize mock server:", e);
      resolve();
    }
  });
}
