export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'Kontrak Kerja' | 'Sertifikat Pelatihan' | 'KTP/Identitas' | 'NPWP' | 'Ijazah' | 'Lainnya';
  uploadDate: string; // YYYY-MM-DD
  fileSize: string; // e.g. "1.2 MB"
  fileUrl: string; // Data URL or placeholder source
  notes?: string;
}

export interface Employee {
  id: string; // ID Karyawan (e.g., K-001)
  pin: string; // Fingeprint PIN (e.g., 2001)
  name: string;
  email: string;
  phone: string;
  department: 'IT & Engineering' | 'Human Resources' | 'Finance & Accounting' | 'Operations' | 'Marketing & Sales';
  position: string;
  joinDate: string;
  status: 'Aktif' | 'Nonaktif' | 'Cuti';
  basicSalary: number;
  allowance: number; // Tunjangan khusus
  photoUrl?: string;
  portalToken?: string; // Secure token code for employee portal login
  contractType?: 'Tetap' | 'Kontrak' | 'Magang';
  contractEndDate?: string; // YYYY-MM-DD
  documents?: EmployeeDocument[];
  activeSP?: 'SP1' | 'SP2' | 'SP3' | null;
  shiftPattern?: 'Pagi' | 'Siang' | 'Malam';
}

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Pulang Cepat' | 'Sakit' | 'Izin' | 'Cuti' | 'Alpa' | 'Libur' | 'Hadir (Libur)';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  pin: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM:SS
  checkOut?: string; // HH:MM:SS
  status: AttendanceStatus;
  lateMinutes: number;
  earlyOutMinutes: number;
  source: 'Fingerprint Solution X-100C' | 'Manual' | 'Sistem';
  logDetails?: string; // Deskripsi detil pencatatan pin
  overtimeMinutes?: number; // Jam lembur yang diedit/custom (dalam menit)
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Cuti Tahunan' | 'Sakit (Surat Dokter)' | 'Izin Menikah' | 'Izin Khusus' | 'Melahirkan';
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  submissionDate: string;
  managerApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  hrApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  approvedByManager?: string;
  approvedByHR?: string;
}

export interface PayrollPeriod {
  id: string;
  month: string; // e.g., "Juni 2026"
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  periodId: string;
  basicSalary: number;
  allowanceSum: number; // Tunjangan Makan & Transport
  bonus: number; // Bonus Kinerja
  lateDeduction: number; // Potongan terlambat
  bpjsKesehatan: number; // Potongan BPJS Kesehatan (1%)
  bpjsKetenagakerjaan: number; // Potongan BPJS Ketenagakerjaan (2%)
  pph21: number; // Pajak Penghasilan estimasi
  netSalary: number;
  attendanceSummary: {
    hadir: number;
    terlambat: number;
    cutiIzin: number;
    alpa: number;
  };
  payoutStatus: 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer';
  payoutDate?: string;
  managerApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  hrApproval?: 'Pending' | 'Disetujui' | 'Ditolak';
  approvedByManager?: string;
  approvedByHR?: string;
}

export interface SolutionDeviceConfig {
  ipAddress: string;
  port: number;
  commKey: number;
  connectionType: 'Ethernet TCP/IP' | 'USB Flashdisk' | 'ADMS Cloud';
  status: 'Terkoneksi' | 'Terputus' | 'Dalam Pengujian';
  autoSync: boolean;
  syncIntervalHours: number;
  lastSyncTime?: string;
  enabledModules?: Record<string, boolean>;
}

export interface RawFingerprintLog {
  pin: string;
  timestamp: string; // YYYY-MM-DD HH:MM:SS
  verified: number; // 0/1/15
  mode: number; // 0=CheckIn, 1=CheckOut, status mode lainnya
}

export interface AuditLog {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:MM:SS
  actor: string;     // Who made the change (e.g. user email)
  module: 'Dashboard' | 'Karyawan' | 'Absensi' | 'Penggajian' | 'Cuti/Izin' | 'Konfigurasi' | 'Inventaris';
  action: string;    // Action description
  details: string;   // Rich context or detailed change message
  status: 'Sukses' | 'Info' | 'Peringatan';
}

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  changeDate: string; // YYYY-MM-DD HH:MM:SS
  oldBasicSalary: number;
  oldAllowance: number;
  newBasicSalary: number;
  newAllowance: number;
  reason: string;
  actor: string;
}

export interface MutationHistoryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  changeDate: string; // YYYY-MM-DD HH:MM:SS
  oldDepartment: string;
  newDepartment: string;
  oldPosition: string;
  newPosition: string;
  reason: string;
  actor: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'Nasional' | 'Bersama';
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Pengumuman' | 'Instruksi PT' | 'Pengingat Presensi' | 'Informasi Slip Gaji' | 'Umum';
  date: string; // YYYY-MM-DD HH:MM:SS
  author: string;
  targetType: 'Semua' | 'Departemen' | 'Karyawan';
  targetValue?: string; // Department name or Employee ID
  readBy: string[]; // Array of Employee IDs who have marked this as read
  isImportant?: boolean;
}

export interface CompanyAsset {
  id: string;
  tagNumber: string; // e.g., AST-2026-001
  name: string;      // e.g., Laptop ThinkPad L14
  category: 'Laptop' | 'Peralatan IT' | 'Kartu Akses' | 'Seragam' | 'Kendaraan/Kunci' | 'Lainnya';
  serialNumber?: string;
  condition: 'Sangat Baik' | 'Baik' | 'Bisa Digunakan' | 'Rusak/Perbaikan';
  status: 'Tersedia' | 'Dipinjam' | 'Hilang' | 'Diarsipkan';
  loanedToId?: string; // Employee ID
  loanedToName?: string; // Employee Name
  loanDate?: string; // YYYY-MM-DD
  expectedReturnDate?: string; // YYYY-MM-DD
  actualReturnDate?: string; // YYYY-MM-DD
  notes?: string;
}

export type UserRole = 'Super Admin' | 'HR Manager' | 'Division Manager' | 'Karyawan';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: 'Semua' | 'IT & Engineering' | 'Human Resources' | 'Finance & Accounting' | 'Operations' | 'Marketing & Sales';
  status: 'Aktif' | 'Nonaktif';
  lastActive?: string;
}

export interface ViolationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  violationType: 'Keterlambatan Berulang' | 'Mangkir Tanpa Kabar' | 'Pulang Cepat Tanpa Izin' | 'Indisipliner' | 'Pelanggaran SOP' | 'Peralatan Rusak' | 'Lainnya';
  severity: 'SP1' | 'SP2' | 'SP3';
  issuedDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  description: string;
  status: 'Aktif' | 'Kedaluwarsa' | 'Dicabut';
  approvedBy: string; // e.g. "herupermana.vps@gmail.com"
  punishmentEffect?: string; // e.g. "Penundaan bonus" or "Potongan insentif"
  notes?: string;
}


