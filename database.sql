-- =====================================================================================
-- DATABASE SCHEMA FOR SYSTEM HRIS (KARYAWAN, ABSENSI, GAJI, DAN CUTI)
-- DOMAIN PROYEK: cumalogika.space
-- DIKONFIGURASI UNTUK: MySQL 5.7+ / MariaDB 10.3+ (aaPanel VPS)
-- =====================================================================================

CREATE DATABASE IF NOT EXISTS hpstate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hpstate;

-- -------------------------------------------------------------------------------------
-- OPSI A: TABEL PENPUL DATA UTAMA (Sistem Node.js Auto-Sync Terintegrasi)
-- Catatan: Digunakan oleh server.ts untuk sinkronisasi instan & aman seluruh state data
--          tanpa resiko migrasi data pecah saat ada pembaruan fitur UI.
-- -------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hris_collections (
  id VARCHAR(100) NOT NULL COMMENT 'Kunci Koleksi (e.g., employees, attendance, leaves)',
  data_json LONGTEXT NOT NULL COMMENT 'Data isi koleksi berformat JSON terstruktur',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------------------
-- OPSI B: STRUKTUR DATA RELASIONAL NORMAL (Untuk Referensi Pemahaman & Integrasi Eksternal)
-- Jika Anda kelak ingin membuat query SQL langsung, berikut adalah relasi aslinya:
-- -------------------------------------------------------------------------------------

-- 1. Tabel Karyawan (Employees)
CREATE TABLE IF NOT EXISTS m_karyawan (
  id VARCHAR(50) NOT NULL,
  nik VARCHAR(50) UNIQUE DEFAULT NULL,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  jabatan VARCHAR(100) DEFAULT NULL,
  departemen VARCHAR(100) DEFAULT NULL,
  status_karyawan VARCHAR(50) DEFAULT 'Kontrak' COMMENT 'Kontrak, Tetap, Magang',
  tanggal_masuk DATE DEFAULT NULL,
  gaji_pokok DECIMAL(15,2) DEFAULT '0.00',
  tunjangan_tetap DECIMAL(15,2) DEFAULT '0.00',
  norek VARCHAR(50) DEFAULT NULL,
  bank VARCHAR(50) DEFAULT NULL,
  tipe_absensi VARCHAR(50) DEFAULT 'Fingerprint' COMMENT 'Fingerprint, Selfie, GPS',
  no_telp VARCHAR(20) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  sisa_cuti INT DEFAULT '12',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Absensi (Attendance)
CREATE TABLE IF NOT EXISTS t_absensi (
  id VARCHAR(50) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk TIME DEFAULT NULL,
  jam_keluar TIME DEFAULT NULL,
  status_kehadiran VARCHAR(50) NOT NULL COMMENT 'Tepat Waktu, Terlambat, Absen, Izin, Cuti',
  metode_absensi VARCHAR(50) DEFAULT 'Mesin Masuk',
  device_id VARCHAR(50) DEFAULT NULL,
  suhu_tubuh VARCHAR(10) DEFAULT NULL,
  foto_selfie TEXT DEFAULT NULL,
  koordinat_gps VARCHAR(100) DEFAULT NULL,
  keterangan TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_absensi_karyawan (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Cuti & Izin (Leaves)
CREATE TABLE IF NOT EXISTS t_cuti_izin (
  id VARCHAR(50) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  tipe_dokumen VARCHAR(50) NOT NULL COMMENT 'Cuti Tahunan, Cuti Melahirkan, Sakit, Izin Khusus',
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  durasi_hari INT NOT NULL,
  alasan TEXT NOT NULL,
  status_persetujuan VARCHAR(50) DEFAULT 'Menunggu' COMMENT 'Menunggu, Disetujui, Ditolak',
  disetujui_oleh VARCHAR(100) DEFAULT NULL,
  tanggal_pengajuan DATE DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_cuti_karyawan (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Slip Gaji & Payroll (Payroll Records)
CREATE TABLE IF NOT EXISTS t_payroll (
  id VARCHAR(50) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  periode_id VARCHAR(50) NOT NULL COMMENT 'Contoh: 2026-06',
  gaji_pokok DECIMAL(15,2) NOT NULL,
  tunjangan DECIMAL(15,2) DEFAULT '0.00',
  lembur DECIMAL(15,2) DEFAULT '0.00',
  potongan_keterlambatan DECIMAL(15,2) DEFAULT '0.00',
  potongan_bpjs DECIMAL(15,2) DEFAULT '0.00',
  pajak_pph21 DECIMAL(15,2) DEFAULT '0.00',
  gaji_bersih DECIMAL(15,2) NOT NULL,
  status_pembayaran VARCHAR(50) DEFAULT 'Draft' COMMENT 'Draft, Terkirim, Lunas',
  tanggal_transfer DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_payroll_karyawan (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Pengguna Aplikasi (Users)
CREATE TABLE IF NOT EXISTS sys_users (
  id VARCHAR(50) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  peran VARCHAR(50) NOT NULL COMMENT 'Super Admin, HRD, Direktur, Portal Karyawan',
  employee_id VARCHAR(50) DEFAULT NULL COMMENT 'Relasi jika akun adalah karyawan biasa',
  aktif TINYINT(1) DEFAULT '1',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Pelanggaran (Violations)
CREATE TABLE IF NOT EXISTS t_pelanggaran (
  id VARCHAR(50) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  jenis_pelanggaran VARCHAR(100) NOT NULL COMMENT 'Alpa, Terlambat Berulang, Unprosedural',
  deskripsi TEXT NOT NULL,
  tanggal DATE NOT NULL,
  sanksi VARCHAR(150) DEFAULT NULL COMMENT 'Teguran Lisan, SP 1, SP 2, SP 3',
  status_penyelesaian VARCHAR(50) DEFAULT 'Aktif',
  PRIMARY KEY (id),
  KEY fk_pelanggaran_karyawan (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
