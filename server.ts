import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { startMysqlMockServer } from "./server/mysql-mock";
import { initializeDatabase, loadHrisData, saveHrisCollection, getDbStatus, pingDatabase, getDetailedDbStatus, syncAllLocalToMySQL } from "./server/db";

async function startServer() {
  // Start local MySQL mock server to simulate aaPanel/VPS production database on localhost:3306
  await startMysqlMockServer();

  // Initialize the database connection (checks .env for MySQL)
  await initializeDatabase();

  const app = express();
  const PORT = 3000;

  // Enable JSON parse for POST payloads
  app.use(express.json({ limit: '10mb' }));

  // API: Smart Insight Attendance trends and HR policy advisor
  app.post("/api/gemini/insight", async (req, res) => {
    try {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(400).json({
          success: false,
          error: "GEMINI_API_KEY belum dikonfigurasi di secrets panel. Silakan tambahkan kunci API terlebih dahulu di menu Settings > Secrets."
        });
      }

      const { attendanceStats, employeeCount, departmentStats, currentMonthName } = req.body;

      if (!attendanceStats) {
        return res.status(400).json({
          success: false,
          error: "Data statistik absensi (attendanceStats) tidak ditemukan dalam payload."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Anda adalah HR Data Analyst & Policy Consultant Expert profesional di PT BIOMETRIC PORTAL UTAMA.
Tugas Anda adalah menganalisis data absensi karyawan untuk bulan ${currentMonthName || 'saat ini'} dan menyusun laporan "Smart Insight" yang komprehensif, terstruktur, berbasis data, dan mudah dibaca oleh Direksi & HR Manager.

DATA UTAMA PERUSAHAAN:
- Total Karyawan: ${employeeCount || 0} orang
- Statistik Status Kehadiran Karyawan (Total Hari Kerja akumulatif):
  * Hadir Tepat Waktu: ${attendanceStats.hadirTepatWaktu || 0} kali
  * Terlambat: ${attendanceStats.terlambat || 0} kali
  * Pulang Cepat: ${attendanceStats.pulangCepat || 0} kali
  * Sakit (S): ${attendanceStats.sakit || 0} kali
  * Izin Alasan Personal (I): ${attendanceStats.izin || 0} kali
  * Cuti Resmi (C): ${attendanceStats.cuti || 0} kali
  * Alpa (A) / Tanpa Keterangan: ${attendanceStats.alpa || 0} kali

STATISTIK PRESTASI DEPARTEMEN & RATIO KETERSETIAAN STAF:
${JSON.stringify(departmentStats || {}, null, 2)}

INSTRUKSI LAPORAN (Harus ditulis dalam Bahasa Indonesia yang formal, profesional, persuasif, tajam, dan realistis):
Laporan harus disusun menggunakan format MARKDOWN yang rapi dengan heading, list, bullet-points, bold, dan tabel (jika relevan). Jangan gunakan jargon teknis AI yang berlebihan. Laporan wajib memiliki 3 bagian utama berikut:

1. 📊 **Analisis Tren Kehadiran & Kedisiplinan**
   - Berikan ulasan singkat mengenai performa kedisiplinan bulan ini (berbasis persentase ketepatan waktu & keterlambatan).
   - Analisis rasio ketidakhadiran (Sakit, Izin, Cuti) dan berikan interpretasi terhadap angka Alpa (apakah mengkhawatirkan atau dalam batas normal).
   - Identifikasi departemen dengan rasio kehadiran tertinggi/terendah jika datanya tersedia.

2.  **Identifikasi Masalah & Akar Penyebab (Root Cause)**
   - Soroti masalah utama yang tercermin dari data (misalnya: tingkat terlambat yang tinggi, tingginya angka izin di departemen tertentu, atau adanya tren alpa).
   - Berikan penjelasan rasional mengenai perkiraan penyebab tren tersebut berdasarkan perilaku industri atau korelasi data.

3. 💡 **Rekomendasi Kebijakan HR Strategis berbasis Data**
   - Berikan minimal 3-4 rekomendasi kebijakan HR yang konkret, aplikatif, dan berbobot untuk mengatasi masalah tersebut.
   - Kebijakan dapat mencakup penyesuaian regulasi jam kerja, kebijakan insentif kehadiran (misal tunjangan kehadiran penuh), program kesehatan mental/staf, tindakan tegas preventif untuk kasus Alpa, maupun integrasi sistem absensi fingerprint Solution X-100C untuk akurasi data.
   - Rekomendasi harus realistis dipraktikkan, bukan sekadar teori umum.

Harap kembalikan laporan analitis ini langsung dalam format teks Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah konsultan HR dan analis data senior spesialis produktivitas kerja korporat Indonesia. Tulis laporan analitik yang mendalam, berbobot, berbasis angka nyata, dan menggunakan bahasa Indonesia profesional.",
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        text: response.text
      });

    } catch (error: any) {
      console.error("Gemini Insight Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Terjadi kesalahan internal saat menghubungi Gemini AI."
      });
    }
  });

  // --- DATABASE API ENDPOINTS ---
  
  // Endpoint to get database connection status with real-time ping latency & sync logs
  app.get("/api/db/status", async (req, res) => {
    try {
      const status = await getDetailedDbStatus();
      return res.json({ success: true, ...status });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint to explicitly execute full sync from local files to current active MySQL database
  app.post("/api/db/sync", async (req, res) => {
    try {
      const result = await syncAllLocalToMySQL();
      return res.json(result);
    } catch (error: any) {
      console.error("Error executing manual database sync:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat menyinkronkan database."
      });
    }
  });

  // Endpoint to load all HRIS collections
  app.get("/api/db/load", async (req, res) => {
    try {
      const data = await loadHrisData();
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error loading HRIS database:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint to save a specific HRIS collection
  app.post("/api/db/save", async (req, res) => {
    try {
      const { key, data } = req.body;
      if (!key) {
        return res.status(400).json({ success: false, error: "Query parameter 'key' is required" });
      }
      await saveHrisCollection(key, data);
      return res.json({ success: true, message: `Koleksi '${key}' berhasil disimpan.` });
    } catch (error: any) {
      console.error(`Error saving HRIS collection '${req.body?.key}':`, error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint to ping / test database connection with direct diagnosis
  app.post("/api/db/ping", async (req, res) => {
    try {
      const { host, port, user, password, database } = req.body || {};
      const result = await pingDatabase({
        host,
        port: port ? parseInt(port) : undefined,
        user,
        password,
        database
      });
      return res.json(result);
    } catch (error: any) {
      console.error("Error running connection diagnostics:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan internal saat menjalankan tes koneksi.",
        details: error.message || ""
      });
    }
  });

  // Serve static assets and Vite Client
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start the server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
