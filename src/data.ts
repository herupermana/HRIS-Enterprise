import { Employee, AttendanceRecord, LeaveRequest, PayrollPeriod, PayrollRecord, SolutionDeviceConfig, AuditLog, SalaryHistoryRecord, Holiday, Announcement, CompanyAsset, UserAccount, ViolationRecord } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    pin: '1001',
    name: 'Heru Permana',
    email: 'herupermana.vps@gmail.com',
    phone: '081234567890',
    department: 'IT & Engineering',
    position: 'VP of Technology & Systems',
    joinDate: '2023-01-15',
    status: 'Aktif',
    basicSalary: 18500000,
    allowance: 2500000,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-HERU-001',
    contractType: 'Tetap',
    shiftPattern: 'Pagi',
    documents: [
      {
        id: 'DOC-101',
        name: 'Surat_Kontrak_Kerja_VP_Systems_Heru.pdf',
        type: 'Kontrak Kerja',
        uploadDate: '2023-01-15',
        fileSize: '2.4 MB',
        fileUrl: '#',
        notes: 'Dokumen perjanjian kerja waktu tidak tertentu (PKWTT) jabatan VP Systems.'
      },
      {
        id: 'DOC-102',
        name: 'AWS_Certified_Solutions_Architect.pdf',
        type: 'Sertifikat Pelatihan',
        uploadDate: '2024-05-20',
        fileSize: '1.1 MB',
        fileUrl: '#',
        notes: 'Sertifikat profesional yang diserahkan saat pengajuan tunjangan kompetensi.'
      }
    ]
  },
  {
    id: 'EMP-002',
    pin: '1002',
    name: 'Budi Santoso',
    email: 'budi.santoso@enterprise.co.id',
    phone: '081398765432',
    department: 'Finance & Accounting',
    position: 'Finance Director',
    joinDate: '2022-05-10',
    status: 'Aktif',
    basicSalary: 15000000,
    allowance: 1800000,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-BUDI-002',
    contractType: 'Tetap',
    shiftPattern: 'Pagi'
  },
  {
    id: 'EMP-003',
    pin: '1003',
    name: 'Siti Aminah',
    email: 'siti.aminah@enterprise.co.id',
    phone: '085711223344',
    department: 'Human Resources',
    position: 'Senior HR Specialist',
    joinDate: '2023-08-01',
    status: 'Aktif',
    basicSalary: 10500000,
    allowance: 1200000,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-SITI-003',
    contractType: 'Tetap',
    shiftPattern: 'Pagi',
    documents: [
      {
        id: 'DOC-301',
        name: 'PKWT_Senior_HR_Specialist_Siti_Aminah.pdf',
        type: 'Kontrak Kerja',
        uploadDate: '2023-08-01',
        fileSize: '1.8 MB',
        fileUrl: '#',
        notes: 'Sertifikasi salinan Kontrak Kerja Tetap Divisi HR.'
      },
      {
        id: 'DOC-302',
        name: 'Sertifikasi_HR_Manager_BNSP.pdf',
        type: 'Sertifikat Pelatihan',
        uploadDate: '2025-01-10',
        fileSize: '3.2 MB',
        fileUrl: '#',
        notes: 'Sertifikat kompetensi pengelolaan SDM Berlisensi Nasional BNSP.'
      },
      {
        id: 'DOC-303',
        name: 'KTP_Siti_Aminah.pdf',
        type: 'KTP/Identitas',
        uploadDate: '2023-08-01',
        fileSize: '650 KB',
        fileUrl: '#',
        notes: 'Salinan pindaian Kartu Tanda Penduduk untuk kebutuhan administratif.'
      }
    ]
  },
  {
    id: 'EMP-004',
    pin: '1004',
    name: 'Rudi Wijaya',
    email: 'rudi.wijaya@enterprise.co.id',
    phone: '082155667788',
    department: 'Operations',
    position: 'Operations Manager',
    joinDate: '2021-11-20',
    status: 'Aktif',
    basicSalary: 12000000,
    allowance: 1500000,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-RUDI-004',
    contractType: 'Kontrak',
    contractEndDate: '2026-06-25',
    shiftPattern: 'Siang'
  },
  {
    id: 'EMP-005',
    pin: '1005',
    name: 'Amalia Siregar',
    email: 'amalia.siregar@enterprise.co.id',
    phone: '081988990011',
    department: 'Marketing & Sales',
    position: 'Digital Marketer Specialist',
    joinDate: '2024-03-01',
    status: 'Aktif',
    basicSalary: 8500000,
    allowance: 900000,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-AMAL-005',
    contractType: 'Kontrak',
    contractEndDate: '2026-07-06',
    shiftPattern: 'Malam'
  },
  {
    id: 'EMP-006',
    pin: '1006',
    name: 'Diana Putri',
    email: 'diana.putri@enterprise.co.id',
    phone: '081122334455',
    department: 'IT & Engineering',
    position: 'Lead Backend Developer',
    joinDate: '2023-11-01',
    status: 'Cuti',
    basicSalary: 14000000,
    allowance: 2000000,
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&h=256&q=80',
    portalToken: 'TOK-DIAN-006',
    contractType: 'Magang',
    contractEndDate: '2026-08-15',
    shiftPattern: 'Pagi'
  }
];

export const INITIAL_SHIFTS = {
  workingHourStart: '08:00',
  workingHourEnd: '17:00',
  toleranceMinutes: 15,
  halfDayHour: '12:00',
  lateMultiplierRate: 5000, // Potongan Rp 5,000 per menit keterlambatan
};

export const INITIAL_DEVICE_CONFIG: SolutionDeviceConfig = {
  ipAddress: '192.168.1.201',
  port: 4370,
  commKey: 0,
  connectionType: 'Ethernet TCP/IP',
  status: 'Terkoneksi',
  autoSync: true,
  syncIntervalHours: 4,
  lastSyncTime: '2026-06-11 17:05:00',
  enabledModules: {
    dashboard: true,
    karyawan: true,
    absensi: true,
    payroll: true,
    cuti: true,
    pelanggaran: true,
    inventaris: true,
    'draft-surat': true,
    komunikasi: true,
    'manajemen-user': true
  },
  companyProfile: {
    name: 'PT Enterprise Solutions',
    address: 'Gedung Tech Hub, Lantai 4, Jakarta Selatan, DKI Jakarta 12920',
    phone: '021-5550198',
    email: 'info@enterprise-solutions.co.id',
    website: 'https://enterprise-solutions.co.id',
    industry: 'Teknologi Informasi & Solusi Integrator',
    registrationNumber: 'AHU-0019283-AH.01.01.2024',
    signatoryName: 'Hendra Wijaya, M.T.',
    signatoryTitle: 'Direktur Utama'
  }
};

// Raw log examples to copy/paste in Indonesian web simulator for X-100C dat pull.
// Standard ZET / Solution text structure is: PIN\tYYYY-MM-DD HH:MM:SS\tVerifiedState\tMode
export const SAMPLE_X100C_DAT_FILE = `1001\t2026-06-11 07:48:12\t1\t0
1002\t2026-06-11 07:55:40\t1\t0
1003\t2026-06-11 08:02:15\t1\t0
1004\t2026-06-11 08:14:02\t1\t0
1005\t2026-06-11 08:44:30\t1\t0
1001\t2026-06-11 17:02:44\t1\t1
1002\t2026-06-11 17:00:10\t1\t1
1003\t2026-06-11 15:45:00\t1\t1
1004\t2026-06-11 17:05:12\t1\t1
1005\t2026-06-11 17:30:22\t1\t1`;

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // 10 Juni 2026 logs
  {
    id: 'ATT-1001',
    employeeId: 'EMP-001',
    pin: '1001',
    date: '2026-06-10',
    checkIn: '07:50:00',
    checkOut: '17:05:00',
    status: 'Hadir',
    lateMinutes: 0,
    earlyOutMinutes: 0,
    source: 'Fingerprint Solution X-100C',
    logDetails: 'FP Pin 1001 Verified(1) Mode: In-Out'
  },
  {
    id: 'ATT-1002',
    employeeId: 'EMP-002',
    pin: '1002',
    date: '2026-06-10',
    checkIn: '07:56:00',
    checkOut: '17:02:00',
    status: 'Hadir',
    lateMinutes: 0,
    earlyOutMinutes: 0,
    source: 'Fingerprint Solution X-100C',
    logDetails: 'FP Pin 1002 Verified(1) Mode: In-Out'
  },
  {
    id: 'ATT-1003',
    employeeId: 'EMP-003',
    pin: '1003',
    date: '2026-06-10',
    checkIn: '08:21:00',
    checkOut: '17:00:00',
    status: 'Terlambat',
    lateMinutes: 21,
    earlyOutMinutes: 0,
    source: 'Fingerprint Solution X-100C',
    logDetails: 'FP Pin 1003 Verified(1) Terlambat 21 mnt'
  },
  {
    id: 'ATT-1004',
    employeeId: 'EMP-004',
    pin: '1004',
    date: '2026-06-10',
    checkIn: '07:44:00',
    checkOut: '16:55:00',
    status: 'Pulang Cepat',
    lateMinutes: 0,
    earlyOutMinutes: 5,
    source: 'Fingerprint Solution X-100C',
    logDetails: 'FP Pin 1004 Verified(1) Pulang cepat'
  },
  {
    id: 'ATT-1005',
    employeeId: 'EMP-005',
    pin: '1005',
    date: '2026-06-10',
    checkIn: '08:05:00',
    checkOut: '17:01:00',
    status: 'Hadir', // tolerance is 15 minutes, 08:05 is fine!
    lateMinutes: 0,
    earlyOutMinutes: 0,
    source: 'Fingerprint Solution X-100C',
    logDetails: 'FP Pin 1005 Verified(1) Hub In-Tolerance'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LV-001',
    employeeId: 'EMP-006',
    employeeName: 'Diana Putri',
    type: 'Cuti Tahunan',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    duration: 5,
    reason: 'Liburan Keluarga ke Bali',
    status: 'Disetujui',
    submissionDate: '2026-06-01',
    managerApproval: 'Disetujui',
    hrApproval: 'Disetujui',
    approvedByManager: 'Manager HR',
    approvedByHR: 'HR Director'
  },
  {
    id: 'LV-002',
    employeeId: 'EMP-003',
    employeeName: 'Siti Aminah',
    type: 'Sakit (Surat Dokter)',
    startDate: '2026-06-13',
    endDate: '2026-06-14',
    duration: 2,
    reason: 'Operasi Gigi Bungsu & Pemulihan',
    status: 'Pending',
    submissionDate: '2026-06-11',
    managerApproval: 'Pending',
    hrApproval: 'Pending'
  }
];

export const INITIAL_PAYROLL_PERIODS: PayrollPeriod[] = [
  {
    id: 'PRD-001',
    month: 'Juni 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    isClosed: false
  }
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: 'PAY-001',
    employeeId: 'EMP-001',
    periodId: 'PRD-001',
    basicSalary: 18500000,
    allowanceSum: 2500000,
    bonus: 1000000,
    lateDeduction: 0,
    bpjsKesehatan: 185000,
    bpjsKetenagakerjaan: 370000,
    pph21: 900000,
    netSalary: 20545000,
    attendanceSummary: {
      hadir: 8,
      terlambat: 0,
      cutiIzin: 0,
      alpa: 0
    },
    payoutStatus: 'Diproses',
    managerApproval: 'Disetujui',
    hrApproval: 'Pending',
    approvedByManager: 'Manager IT'
  },
  {
    id: 'PAY-002',
    employeeId: 'EMP-003',
    periodId: 'PRD-001',
    basicSalary: 10500000,
    allowanceSum: 1200000,
    bonus: 500000,
    lateDeduction: 105000, // terlambat 21 menit * 5000
    bpjsKesehatan: 105000,
    bpjsKetenagakerjaan: 210000,
    pph21: 350000,
    netSalary: 11430000,
    attendanceSummary: {
      hadir: 7,
      terlambat: 1,
      cutiIzin: 0,
      alpa: 0
    },
    payoutStatus: 'Belum Dibayar',
    managerApproval: 'Pending',
    hrApproval: 'Pending'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-06-11 17:05:22',
    actor: 'herupermana.vps@gmail.com',
    module: 'Absensi',
    action: 'Sync Absensi Mesin FP',
    details: 'Berhasil menarik 5 data log absensi harian terbaru dari perangkat Solution X-100C.',
    status: 'Sukses'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-06-11 14:32:10',
    actor: 'herupermana.vps@gmail.com',
    module: 'Cuti/Izin',
    action: 'Persetujuan Cuti',
    details: 'Menyetujui pengajuan Cuti Tahunan Diana Putri (EMP-006) periode 2026-06-08 s/d 2026-06-12.',
    status: 'Sukses'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-06-11 10:15:45',
    actor: 'herupermana.vps@gmail.com',
    module: 'Karyawan',
    action: 'Edit Profil Karyawan',
    details: 'Memperbarui informasi posisi dan data remunerasi pokok Heru Permana (EMP-001) - VP of Technology & Systems.',
    status: 'Sukses'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-06-10 16:45:00',
    actor: 'herupermana.vps@gmail.com',
    module: 'Penggajian',
    action: 'Kalkulasi Slip Gaji',
    details: 'Melakukan re-kalkulasi absensi biometric harian dan menerbitkan nominal gaji kotor untuk Budi Santoso (EMP-002).',
    status: 'Sukses'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-06-10 09:00:15',
    actor: 'herupermana.vps@gmail.com',
    module: 'Konfigurasi',
    action: 'Integrasi BPJS Wizard',
    details: 'Mengubah rate standar Iuran BPJS Kesehatan menjadi 1.0% dan BPJS Ketenagakerjaan menjadi 2.0% dari upah dasar.',
    status: 'Sukses'
  }
];

export const INITIAL_SALARY_HISTORY: SalaryHistoryRecord[] = [
  {
    id: 'SAL-001',
    employeeId: 'EMP-001',
    employeeName: 'Heru Permana',
    changeDate: '2026-06-11 10:15:45',
    oldBasicSalary: 17000000,
    oldAllowance: 2000000,
    newBasicSalary: 18500000,
    newAllowance: 2505000,
    reason: 'Penyesuaian Remunerasi Tahunan & Kenaikan Posisi',
    actor: 'herupermana.vps@gmail.com'
  },
  {
    id: 'SAL-002',
    employeeId: 'EMP-002',
    employeeName: 'Budi Santoso',
    changeDate: '2025-12-01 09:00:00',
    oldBasicSalary: 14000000,
    oldAllowance: 1500000,
    newBasicSalary: 15000000,
    newAllowance: 1800000,
    reason: 'Penyesuaian Inflasi Semester Dua',
    actor: 'herupermana.vps@gmail.com'
  },
  {
    id: 'SAL-003',
    employeeId: 'EMP-003',
    employeeName: 'Siti Aminah',
    changeDate: '2026-03-15 11:30:00',
    oldBasicSalary: 9500000,
    oldAllowance: 1000000,
    newBasicSalary: 10500000,
    newAllowance: 1200000,
    reason: 'Kenaikan Gaji Berkala (KGB)',
    actor: 'herupermana.vps@gmail.com'
  }
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'HOL-1', date: '2026-01-01', name: 'Tahun Baru Masehi', type: 'Nasional', description: 'Libur Awal Tahun Masehi' },
  { id: 'HOL-2', date: '2026-01-23', name: 'Tahun Baru Imlek 2577 Kongzili', type: 'Nasional', description: 'Tahun Baru Lunar/Cina' },
  { id: 'HOL-3', date: '2026-02-15', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'Nasional', description: 'Peringatan Isra Mi\'raj' },
  { id: 'HOL-4', date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', type: 'Nasional', description: 'Tirta Gangga & Pensucian Saka' },
  { id: 'HOL-5', date: '2026-04-03', name: 'Wafat Yesus Kristus', type: 'Nasional', description: 'Jumat Agung' },
  { id: 'HOL-6', date: '2026-04-10', name: 'Hari Raya Idul Fitri 1447 H', type: 'Nasional', description: 'Hari Raya Lebaran Pertama' },
  { id: 'HOL-7', date: '2026-04-11', name: 'Hari Raya Idul Fitri 1447 H (Hari Kedua)', type: 'Nasional', description: 'Hari Raya Lebaran Kedua' },
  { id: 'HOL-8', date: '2026-05-01', name: 'Hari Buruh Internasional', type: 'Nasional', description: 'May Day' },
  { id: 'HOL-9', date: '2026-05-14', name: 'Kenaikan Yesus Kristus', type: 'Nasional', description: 'Kenaikan Isa Almasih' },
  { id: 'HOL-10', date: '2026-05-21', name: 'Hari Raya Waisak 2570 BE', type: 'Nasional', description: 'Peringatan Tri Suci Waisak' },
  { id: 'HOL-11', date: '2026-06-01', name: 'Hari Lahir Pancasila', type: 'Nasional', description: 'Pancasila Day' },
  { id: 'HOL-12', date: '2026-06-17', name: 'Hari Raya Idul Adha 1447 H', type: 'Nasional', description: 'Hari Raya Kurban' },
  { id: 'HOL-13', date: '2026-07-07', name: 'Tahun Baru Islam 1448 H', type: 'Nasional', description: '1 Muharram 1448' },
  { id: 'HOL-14', date: '2026-08-17', name: 'Hari Kemerdekaan RI', type: 'Nasional', description: 'HUT Kemerdekaan Republik Indonesia ke-81' },
  { id: 'HOL-15', date: '2026-09-15', name: 'Maulid Nabi Muhammad SAW', type: 'Nasional', description: 'Peringatan Lahir Nabi SAW' },
  { id: 'HOL-16', date: '2026-12-25', name: 'Hari Raya Natal', type: 'Nasional', description: 'Peringatan Natal Bersama' }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANNC-1',
    title: '🌐 Sambutan Hangat & Panduan Penggunaan Portal Mandiri Pegawai',
    content: 'Selamat datang di Portal Karyawan Mandiri PT Enterprise Solutions. Melalui dashboard biometrik terintegrasi ini, seluruh pegawai dapat mencatatkan kehadiran secara presisi, meninjau perincian slip bulanan PPh21, merunut jatah cuti, dan menerima notifikasi prioritas langsung dari HR korporat secara instan.',
    category: 'Pengumuman',
    date: '2026-06-01 08:00:00',
    author: 'Siti Aminah (Senior HR)',
    targetType: 'Semua',
    readBy: ['EMP-001'],
    isImportant: false
  },
  {
    id: 'ANNC-2',
    title: '⚠️ Pengingat Penyesuaian Tap Jari Mesin Solution X-100C',
    content: 'Dihimbau kepada seluruh rekan staf IT & Engineering untuk merapikan jam kehadiran harian. Dikarenakan adanya pemeliharaan jaringan API Bridge mesin sidik jari Solution X-100C di selasar sayap timur pada tanggal 15 Juni, mohon pastikan untuk melakukan tapping cadangan di mesin loby tengah.',
    category: 'Pengingat Presensi',
    date: '2026-06-12 10:45:00',
    author: 'HR Admin Utama',
    targetType: 'Departemen',
    targetValue: 'IT & Engineering',
    readBy: [],
    isImportant: true
  }
];

export const INITIAL_ASSETS: CompanyAsset[] = [
  {
    id: 'AST-001',
    tagNumber: 'PT-LPT-001',
    name: 'MacBook Pro 14" M3 (16GB/512GB)',
    category: 'Laptop',
    serialNumber: 'C02F9X8GMD6T',
    condition: 'Sangat Baik',
    status: 'Dipinjam',
    loanedToId: 'EMP-001',
    loanedToName: 'Budi Santoso',
    loanDate: '2026-01-10',
    expectedReturnDate: '2028-01-10',
    notes: 'Unit operasional utama draf pengembangan software.'
  },
  {
    id: 'AST-002',
    tagNumber: 'PT-LPT-002',
    name: 'Lenovo ThinkPad L14 Gen 4',
    category: 'Laptop',
    serialNumber: 'PF2B9Y81',
    condition: 'Baik',
    status: 'Tersedia',
    notes: 'Unit cadangan siap pakai di kabinet IT.'
  },
  {
    id: 'AST-003',
    tagNumber: 'PT-ACC-055',
    name: 'Kartu Akses Lift & Ruang Server RFID',
    category: 'Kartu Akses',
    serialNumber: 'RFID-9981-A',
    condition: 'Baik',
    status: 'Dipinjam',
    loanedToId: 'EMP-001',
    loanedToName: 'Budi Santoso',
    loanDate: '2026-02-15',
    expectedReturnDate: '2027-02-15',
    notes: 'Hak akses tingkat administrator infra server utama.'
  },
  {
    id: 'AST-004',
    tagNumber: 'PT-UNI-101',
    name: 'Seragam Batik Pola Korporat (Size L)',
    category: 'Seragam',
    condition: 'Sangat Baik',
    status: 'Dipinjam',
    loanedToId: 'EMP-002',
    loanedToName: 'Siti Aminah',
    loanDate: '2026-03-01',
    expectedReturnDate: '2026-12-31',
    notes: 'Dipakai untuk kehumasan dan seremonial eksternal.'
  },
  {
    id: 'AST-005',
    tagNumber: 'PT-KEY-002',
    name: 'Kunci Brankas Keuangan (Selasar Utama)',
    category: 'Kendaraan/Kunci',
    condition: 'Baik',
    status: 'Tersedia',
    notes: 'Tersimpan di laci berangkas HR dengan security log.'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    username: 'herupermana',
    name: 'Heru Permana',
    email: 'herupermana.vps@gmail.com',
    role: 'Super Admin',
    department: 'Semua',
    status: 'Aktif',
    lastActive: '2026-06-12 18:45:12'
  },
  {
    id: 'USR-002',
    username: 'sitiaminah',
    name: 'Siti Aminah',
    email: 'siti.aminah@enterprise.co.id',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'Aktif',
    lastActive: '2026-06-12 19:00:00'
  },
  {
    id: 'USR-003',
    username: 'budisantoso',
    name: 'Budi Santoso',
    email: 'budi.santoso@enterprise.co.id',
    role: 'Division Manager',
    department: 'Finance & Accounting',
    status: 'Aktif',
    lastActive: '2026-06-12 16:30:20'
  },
  {
    id: 'USR-004',
    username: 'rianwijaya',
    name: 'Rian Wijaya',
    email: 'rianwijaya@enterprise.co.id',
    role: 'Karyawan',
    department: 'IT & Engineering',
    status: 'Aktif',
    lastActive: '2026-06-12 17:05:00'
  },
  {
    id: 'USR-005',
    username: 'dianaputri',
    name: 'Diana Putri',
    email: 'diana.putri@enterprise.co.id',
    role: 'Division Manager',
    department: 'Marketing & Sales',
    status: 'Aktif',
    lastActive: '2026-06-11 15:40:00'
  }
];

export const INITIAL_VIOLATIONS: ViolationRecord[] = [
  {
    id: 'SKS-001',
    employeeId: 'EMP-004',
    employeeName: 'Rian Wijaya',
    department: 'IT & Engineering',
    violationType: 'Keterlambatan Berulang',
    severity: 'SP1',
    issuedDate: '2026-06-02',
    expiryDate: '2026-12-02',
    description: 'Terlambat masuk kerja lebih dari 5 kali dalam periode 1 bulan tanpa alasan mendesak.',
    status: 'Aktif',
    approvedBy: 'siti.aminah@enterprise.co.id',
    punishmentEffect: 'Penangguhan Bonus Kinerja Bulanan',
    notes: 'Log kehadiran biometrik Solution X-100C menunjukkan rata-rata check-in pukul 09:24 pagi.'
  },
  {
    id: 'SKS-002',
    employeeId: 'EMP-005',
    employeeName: 'Amir Syarifuddin',
    department: 'Operations',
    violationType: 'Mangkir Tanpa Kabar',
    severity: 'SP2',
    issuedDate: '2026-05-10',
    expiryDate: '2026-11-10',
    description: 'Absen/mangkir tanpa keterangan tertulis maupun lisan selama 3 hari kerja berturut-turut.',
    status: 'Aktif',
    approvedBy: 'herupermana.vps@gmail.com',
    punishmentEffect: 'Potongan Uang Tunjangan Makan & Transportasi 1 bulan',
    notes: 'Teguran lisan tahap 1 telah diabaikan.'
  },
  {
    id: 'SKS-003',
    employeeId: 'EMP-002',
    employeeName: 'Bambang Pamungkas',
    department: 'Operations',
    violationType: 'Pulang Cepat Tanpa Izin',
    severity: 'SP1',
    issuedDate: '2025-11-15',
    expiryDate: '2026-05-15',
    description: 'Check-out fingerprint sebelum pukul 15:00 sebanyak 4 kali tanpa form persetujuan pulang mendahului.',
    status: 'Kedaluwarsa',
    approvedBy: 'siti.aminah@enterprise.co.id',
    punishmentEffect: 'Gaji Pokok dipotong Proporsional Menit',
    notes: 'Periode sanksi hukum sanksi telah berakhir, masa pembinaan dinilai sukses dan berkelakuan baik.'
  }
];



