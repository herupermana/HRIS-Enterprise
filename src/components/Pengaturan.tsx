import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Shield, Landmark, MapPin, 
  HelpCircle, Settings, CheckCircle, RefreshCw, Clock, Database, Server,
  Users, Coins, Calendar, ShieldAlert, ShoppingBag, FileText, Megaphone, LayoutGrid
} from 'lucide-react';
import { Employee, SolutionDeviceConfig } from '../types';
import { INITIAL_SHIFTS } from '../data';
import { getApiUrl } from '../utils';

interface SettingsProps {
  onUpdateShiftConfig?: (cfg: any) => void;
  displayDensity?: 'ringkas' | 'lapang';
  onChangeDisplayDensity?: (density: 'ringkas' | 'lapang') => void;
  dbStatus?: {
    connected?: boolean;
    engine?: string;
    loading: boolean;
    error: string | null;
    saving: boolean;
    savingDetails: string | null;
  };
  deviceConfig: SolutionDeviceConfig;
  onUpdateDeviceConfig: (cfg: SolutionDeviceConfig) => void;
}

export default function Pengaturan({ 
  onUpdateShiftConfig, 
  displayDensity = 'lapang', 
  onChangeDisplayDensity,
  dbStatus,
  deviceConfig,
  onUpdateDeviceConfig
  }: SettingsProps) {
  const [shiftState, setShiftState] = useState(INITIAL_SHIFTS);
  const [isSaved, setIsSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Local state for active modules
  const [localModules, setLocalModules] = useState<Record<string, boolean>>(() => {
    return deviceConfig?.enabledModules || {
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
    };
  });

  // Synchronize when remote config loads
  React.useEffect(() => {
    if (deviceConfig?.enabledModules) {
      setLocalModules(deviceConfig.enabledModules);
    }
  }, [deviceConfig?.enabledModules]);

  // States for live interactive database ping & troubleshooting
  const [diagTesting, setDiagTesting] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    success: boolean;
    code?: string;
    message: string;
    details?: string;
    solution?: string;
  } | null>(null);
  
  const [useCustomDiagParams, setUseCustomDiagParams] = useState(false);
  const [diagConfig, setDiagConfig] = useState({
    host: "127.0.0.1",
    port: "3306",
    user: "",
    password: "",
    database: ""
  });

  const handleTestConnection = async () => {
    setDiagTesting(true);
    setDiagResult(null);
    try {
      const payload = useCustomDiagParams ? {
        host: diagConfig.host,
        port: diagConfig.port,
        user: diagConfig.user,
        password: diagConfig.password,
        database: diagConfig.database
      } : {}; // Empty payload triggers current .env testing

      const res = await fetch(getApiUrl("/api/db/ping"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setDiagResult(data);
    } catch (err: any) {
      setDiagResult({
        success: false,
        message: "Kesalahan Jaringan / Internal",
        details: err.message || "Gagal menghubungi API diagnostik.",
        solution: "Pastikan dev server Node.js Anda berjalan aktif di port 3000."
      });
    } finally {
      setDiagTesting(false);
    }
  };

  // General company state
  const [companyProfile, setCompanyProfile] = useState(() => {
    return deviceConfig?.companyProfile || {
      name: 'PT Enterprise Solutions',
      address: 'Gedung Tech Hub, Lantai 4, Jakarta Selatan, DKI Jakarta 12920',
      phone: '021-5550198',
      email: 'info@enterprise-solutions.co.id',
      website: 'https://enterprise-solutions.co.id',
      industry: 'Teknologi Informasi & Solusi Integrator',
      registrationNumber: 'AHU-0019283-AH.01.01.2024',
      signatoryName: 'Hendra Wijaya, M.T.',
      signatoryTitle: 'Direktur Utama',
      timezone: 'WIB (UTC+07:00)'
    };
  });

  // Synchronize when remote config loads
  React.useEffect(() => {
    if (deviceConfig?.companyProfile) {
      setCompanyProfile(deviceConfig.companyProfile);
    }
  }, [deviceConfig?.companyProfile]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onUpdateShiftConfig) {
      onUpdateShiftConfig(shiftState);
    }
    if (onUpdateDeviceConfig && deviceConfig) {
      onUpdateDeviceConfig({
        ...deviceConfig,
        enabledModules: localModules,
        companyProfile: companyProfile
      });
      // Also trigger a custom log for administrative trace
      window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
        detail: {
          module: 'Konfigurasi',
          action: 'Ubah Profil Perusahaan',
          details: `Melakukan pembaruan data profil organisasi ${companyProfile.name} secara aman di server database.`,
          status: 'Sukses'
        }
      }));
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="settings-frame-layout">
      {/* Settings Title Header */}
      <div className="flex justify-between items-center bg-white border border-slate-200 shadow-sm p-4 rounded-2xl" id="settings-heading-row">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-850 tracking-tight">Pengaturan Sistem HRIS Enterprise</h3>
            <p className="text-[10px] text-slate-400">Parameter aturan permodalan, bpjs, jam kerja &amp; remunerasi</p>
          </div>
        </div>
        
        {isSaved && (
          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Konfigurasi Disimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-flex-grid">
        {/* Left Column - Shift Rosters & Penalties */}
        <div className="lg:col-span-2 space-y-6" id="setting-form-col">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="shift-config-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Clock className="w-4.5 h-4.5 text-blue-600" /> Jam Kerja &amp; Toleransi Keterlambatan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Jam Masuk Kerja (Check-In) *</label>
                <input 
                  type="time" 
                  value={shiftState.workingHourStart}
                  onChange={(e) => setShiftState({ ...shiftState, workingHourStart: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Jam Pulang Kerja (Check-Out) *</label>
                <input 
                  type="time" 
                  value={shiftState.workingHourEnd}
                  onChange={(e) => setShiftState({ ...shiftState, workingHourEnd: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Batas Toleransi Keterlambatan (Pascamasuk) *</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={shiftState.toleranceMinutes}
                    onChange={(e) => setShiftState({ ...shiftState, toleranceMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 font-medium">Menit</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-normal">Check-in setelah batas ini dikenai denda potong gaji</p>
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Besaran Denda per Menit Lambat (Rp) *</label>
                <input 
                  type="number" 
                  value={shiftState.lateMultiplierRate}
                  onChange={(e) => setShiftState({ ...shiftState, lateMultiplierRate: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-normal">Contoh: Denda Rp {shiftState.lateMultiplierRate.toLocaleString('id-ID')} per menit telat</p>
              </div>
            </div>
          </div>

          {/* Company Profile Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="company-config-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin className="w-4.5 h-4.5 text-blue-600" /> Profil Badan Organisasi / Perusahaan
            </h4>

            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nama Badan Hukum / Perusahaan *</label>
                  <input 
                    type="text" 
                    value={companyProfile.name}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Sektor Bidang Usaha / Industri</label>
                  <input 
                    type="text" 
                    value={companyProfile.industry || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                    placeholder="Contoh: Teknologi Informasi & Integrasi"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Alamat Resmi Kantor Utama *</label>
                <textarea 
                  rows={2}
                  value={companyProfile.address}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nomor Telepon Kantor *</label>
                  <input 
                    type="text" 
                    value={companyProfile.phone}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Alamat Email Korespondensi *</label>
                  <input 
                    type="email" 
                    value={companyProfile.email}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Situs Web / Website</label>
                  <input 
                    type="text" 
                    value={companyProfile.website || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                    placeholder="https://perusahaan.co.id"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nomor Legalitas / NIB / AHU</label>
                  <input 
                    type="text" 
                    value={companyProfile.registrationNumber || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, registrationNumber: e.target.value })}
                    placeholder="AHU-00123.AH.01.2024"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nama Pejabat Penandatangan *</label>
                  <input 
                    type="text" 
                    value={companyProfile.signatoryName || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, signatoryName: e.target.value })}
                    placeholder="Contoh: Heru Permana, S.Psi."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Jabatan Resmi Pejabat *</label>
                  <input 
                    type="text" 
                    value={companyProfile.signatoryTitle || ''}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, signatoryTitle: e.target.value })}
                    placeholder="Contoh: Direktur Utama"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Module Configuration Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="module-config-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <LayoutGrid className="w-4.5 h-4.5 text-blue-600" /> Konfigurasi Aktif Modul HRIS
            </h4>
            <p className="text-[10px] text-slate-450 leading-relaxed font-normal">
              Aktifkan atau nonaktifkan modul di bawah ini secara dinamis. Modul yang dinonaktifkan akan disembunyikan secara global dari bilah navigasi utama dan hak akses pengguna di seluruh portal sistem HRIS.
            </p>

            <div className="space-y-3.5">
              {[
                {
                  id: 'karyawan',
                  title: 'Data Karyawan',
                  desc: 'Manajemen biodata, departemen, histori penyesuaian gaji, serta kontrak kerja/mutasi.',
                  icon: Users,
                  colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
                },
                {
                  id: 'absensi',
                  title: 'Tarik Absen Solution X-100C',
                  desc: 'Integrasi & penarikan otomatis atau manual log sidik jari dari mesin absensi Solution X-100C.',
                  icon: Clock,
                  colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20'
                },
                {
                  id: 'payroll',
                  title: 'Slip Penggajian',
                  desc: 'Kalkulasi otomatis iuran BPJS, PPh21, klaim lembur, dan distribusi digital slip gaji karyawan.',
                  icon: Coins,
                  colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                },
                {
                  id: 'cuti',
                  title: 'Cuti & Permisi',
                  desc: 'Formulir pengajuan dispensasi izin, sakit, dan cuti tahunan terintegrasi dengan persetujuan bertingkat.',
                  icon: Calendar,
                  colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                },
                {
                  id: 'pelanggaran',
                  title: 'Manajemen Pelanggaran',
                  desc: 'Pencatatan surat peringatan karyawan (SP-1, SP-2, SP-3) dan denda kedisiplinan log jari.',
                  icon: ShieldAlert,
                  colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20'
                },
                {
                  id: 'inventaris',
                  title: 'Inventaris & Aset',
                  desc: 'Kontrol peminjaman, kondisi pemeliharaan, dan inventori aset inventaris kantor.',
                  icon: ShoppingBag,
                  colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20'
                },
                {
                  id: 'draft-surat',
                  title: 'Draft Surat & Dokumen',
                  desc: 'Generator otomatis dokumen resmi (SK Pengangkatan, Mutasi, SP) siap cetak via template.',
                  icon: FileText,
                  colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20'
                },
                {
                  id: 'komunikasi',
                  title: 'Komunikasi Massal',
                  desc: 'Publikasi memo direksi, instruksi PT, dan pengumuman interaktif ke seluruh portal karyawan.',
                  icon: Megaphone,
                  colorClass: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20'
                }
              ].map((mod) => {
                const IconComp = mod.icon;
                const isEnabled = localModules[mod.id] !== false;
                return (
                  <div 
                    key={mod.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${mod.colorClass} shrink-0 mt-0.5`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-850 block">{mod.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal leading-normal block mt-0.5 max-w-md">{mod.desc}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLocalModules(prev => ({
                          ...prev,
                          [mod.id]: !isEnabled
                        }));
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                      id={`module-switch-${mod.id}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}

              {/* Immutable Module placeholders */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 gap-4 opacity-70">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg text-slate-400 bg-slate-100 shrink-0 mt-0.5">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Aturan Kerja (Pengaturan)
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-250 text-slate-600 font-extrabold uppercase">Sistem</span>
                    </span>
                    <span className="text-[10px] text-slate-550 font-normal leading-normal block mt-0.5">
                      Konstruksi vital penentu denda lambat presensi &amp; diagnosa koneksi database aaPanel.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Selalu Aktif</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 gap-4 opacity-70">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg text-slate-400 bg-slate-100 shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Manajemen Akses
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-250 text-slate-600 font-extrabold uppercase">Keamanan</span>
                    </span>
                    <span className="text-[10px] text-slate-550 font-normal leading-normal block mt-0.5">
                      Distribusi otorisasi hak akun login (Super Admin, HR Manager, Division Manager).
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Selalu Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* BPJS rate & submit button deck */}
        <div className="space-y-6" id="settings-sidebar-col">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="bpjs-rates-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Landmark className="w-4.5 h-4.5 text-blue-600" /> Tarif BPJS &amp; Pajak PPh21
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-500 font-medium">BPJS Kesehatan Karyawan:</span>
                <span className="font-bold text-slate-900">1% (Potong Gaji)</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-500 font-medium">BPJS Ketenagakerjaan:</span>
                <span className="font-bold text-slate-900">2% (Potong Gaji)</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-500 font-medium">Estimasi Bruto PPh21:</span>
                <span className="font-bold text-slate-900">Flat 5%</span>
              </div>

              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                Persentase iuran BPJS mengacu pada regulasi ketenagakerjaan Republik Indonesia terbaru. Pajak penghasilan dipotong otomatis pada saat slip payroll diterbitkan.
              </p>
            </div>
          </div>

          {/* Display Density Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="display-density-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sliders className="w-4.5 h-4.5 text-blue-600" /> Kepadatan Tampilan Workspace
            </h4>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Pilih tingkat kenyamanan ruang kerja untuk mengoptimalkan visualisasi dashboard HRIS sesuai ukuran layar monitor Anda.
            </p>

            <div className="grid grid-cols-2 gap-3" id="density-toggle-buttons">
              <button
                type="button"
                onClick={() => {
                  if (onChangeDisplayDensity) {
                    onChangeDisplayDensity('ringkas');
                    window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
                      detail: {
                        module: 'Pengaturan',
                        action: 'Ubah Densitas',
                        details: 'Mengubah kepadatan tampilan workspace menjadi: Ringkas (Compact).',
                        status: 'Sukses'
                      }
                    }));
                  }
                }}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayDensity === 'ringkas'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-extrabold shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
                id="density-btn-ringkas"
              >
                <span className="text-xs font-extrabold block">Mode Ringkas</span>
                <span className="text-[9px] text-center font-normal opacity-80 leading-normal">
                  Sempit &amp; Rapat. Menghemat ruang tinggi layar monitor Anda.
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded mt-1">
                  Laptop Kecil
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onChangeDisplayDensity) {
                    onChangeDisplayDensity('lapang');
                    window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
                      detail: {
                        module: 'Pengaturan',
                        action: 'Ubah Densitas',
                        details: 'Mengubah kepadatan tampilan workspace menjadi: Lapang (Spacious).',
                        status: 'Sukses'
                      }
                    }));
                  }
                }}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayDensity === 'lapang'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-extrabold shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
                id="density-btn-lapang"
              >
                <span className="text-xs font-extrabold block">Mode Lapang</span>
                <span className="text-[9px] text-center font-normal opacity-80 leading-normal">
                  Lebar &amp; Renggang. Optimal untuk monitor FHD/UHD besar desktop.
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded mt-1">
                  Monitor Besar
                </span>
              </button>
            </div>
          </div>

          {/* Database Setup & Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="db-setup-status-card">
            <h4 className="text-sm font-semibold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Database className="w-4.5 h-4.5 text-blue-600" /> Status &amp; Integrasi Database
            </h4>

            {dbStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      {dbStatus.connected ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                      ) : (
                        <>
                          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </>
                      )}
                    </div>
                    <span className="text-slate-700 font-bold text-xs">
                      {dbStatus.connected ? "MySQL Terkoneksi" : "Local Backup (Luring)"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-lg border border-blue-200">
                    {dbStatus.connected ? "aaPanel Prod" : "Disk Local"}
                  </span>
                </div>

                <div className="text-[11px] space-y-1.5 text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">Mesin Database:</span>
                    <span>{dbStatus.engine || "Koleksi JSON File-System"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-normal">Sinkronisasi Otomatis:</span>
                    <span className="text-green-600 font-bold">Aktif (Real-Time)</span>
                  </div>
                  {dbStatus.connected && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-normal">Host Koneksi:</span>
                      <span className="font-mono text-[10px]">localhost / 127.0.0.1</span>
                    </div>
                  )}
                </div>

                {dbStatus.error && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded-lg leading-snug">
                    {dbStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Sedang memuat status database asinkron...</p>
            )}

            {/* Live Interactive Database Connection Diagnostics */}
            <div className="pt-3 border-t border-slate-100" id="live-db-diagnostics-test-panel">
              <button
                type="button"
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="w-full text-left inline-flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-600" />
                  Live Diagnostik &amp; Tes Ping Port
                </span>
                <span className="text-[10px] font-mono bg-slate-150 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  {showDiagnostic ? "Tutup" : "Mulai Tes"}
                </span>
              </button>

              <AnimatePresence>
                {showDiagnostic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 text-[11.5px] space-y-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl block shadow-inner-sm"
                  >
                    <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                      <span className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        🔍 Diagnostik Jaringan &amp; Port MySQL
                      </span>
                      <label className="inline-flex items-center gap-1 cursor-pointer text-[10.5px] font-bold text-blue-600 select-none">
                        <input
                          type="checkbox"
                          checked={useCustomDiagParams}
                          onChange={(e) => {
                            setUseCustomDiagParams(e.target.checked);
                            setDiagResult(null);
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer"
                        />
                        Uji Manual
                      </label>
                    </div>

                    {!useCustomDiagParams ? (
                      <p className="text-slate-500 leading-snug text-[10.5px]">
                        Sistem akan menjalankan kueri uji ping ke alamat MySQL yang terdaftar di konfigurasi file <code className="bg-slate-200 text-slate-700 px-1 rounded font-mono">.env</code> server saat ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-1 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Host IP / Domain:</label>
                          <input
                            type="text"
                            value={diagConfig.host}
                            onChange={(e) => setDiagConfig({ ...diagConfig, host: e.target.value })}
                            placeholder="e.g. 127.0.0.1"
                            className="w-full text-[11px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Port:</label>
                          <input
                            type="text"
                            value={diagConfig.port}
                            onChange={(e) => setDiagConfig({ ...diagConfig, port: e.target.value })}
                            placeholder="3306"
                            className="w-full text-[11px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Db Name:</label>
                          <input
                            type="text"
                            value={diagConfig.database}
                            onChange={(e) => setDiagConfig({ ...diagConfig, database: e.target.value })}
                            placeholder="hris_db"
                            className="w-full text-[11px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">User Account:</label>
                          <input
                            type="text"
                            value={diagConfig.user}
                            onChange={(e) => setDiagConfig({ ...diagConfig, user: e.target.value })}
                            placeholder="root"
                            className="w-full text-[11px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Password:</label>
                          <input
                            type="password"
                            value={diagConfig.password}
                            onChange={(e) => setDiagConfig({ ...diagConfig, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full text-[11px] px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={diagTesting}
                      onClick={handleTestConnection}
                      className={`w-full font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shadow-sm
                        ${diagTesting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900"}`}
                    >
                      {diagTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Mengecek Jaringan &amp; Port...
                        </>
                      ) : (
                        "Mulai Tes Koneksi (Ping)"
                      )}
                    </button>

                    {/* Test Diagnosis Outcome Panel */}
                    {diagResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border text-[11px] space-y-1.5 leading-snug shadow-inner-sm
                          ${diagResult.success 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-red-50 border-red-200 text-red-800"}`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[11.5px]">
                          {diagResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 bg-red-600 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">!</div>
                          )}
                          <span>{diagResult.message}</span>
                        </div>
                        <div>
                          <p className="font-bold opacity-75">Detail Diagnosis:</p>
                          <p className="font-mono text-[9.5px] pl-2 border-l border-current/20 leading-normal select-all">
                            {diagResult.details || "Tidak ada rincian teknis."}
                          </p>
                        </div>
                        {diagResult.solution && (
                          <div className="pt-1.5 border-t border-current/10">
                            <p className="font-bold text-slate-850 uppercase tracking-wider text-[9px]">💡 Solusi Penyelesaian:</p>
                            <p className="text-slate-700 mt-0.5 font-medium">{diagResult.solution}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* aaPanel MySQL Configuration Portal Guide Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full text-left inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <span>{showGuide ? "▲ Sembunyikan Panduan aaPanel" : "▼ Lihat Panduan aaPanel Database"}</span>
                <span className="text-[10px] font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Tutorial VPS</span>
              </button>

              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 text-[11px] text-slate-600 leading-relaxed space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl block shadow-inner-sm"
                  >
                    <p className="font-bold text-slate-800 text-xs">🛠️ Panduan Integrasi MySQL di aaPanel:</p>
                    
                    <div className="space-y-1 mt-1.5 list-decimal text-[11.5px]">
                      <p className="font-bold text-slate-700">1. Buat Database Baru di aaPanel</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10.5px]">
                        <li>Masuk ke dasbor <strong>aaPanel</strong> Anda.</li>
                        <li>Klik menu <strong>Database</strong> di sidebar kiri, lalu klik tombol <strong>Add Database</strong>.</li>
                        <li>Set <strong>Database name</strong>: <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">hris_db</code> (bebas).</li>
                        <li>Pilih <strong>Charset</strong>: <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">utf8mb4</code>.</li>
                        <li>Username dan Password akan terbuat otomatis, salin kredensial tersebut.</li>
                      </ul>

                      <p className="font-bold text-slate-700 mt-2.5">2. Konfigurasi File <code className="font-mono bg-slate-200 px-1 rounded">.env</code> di VPS Anda</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10.5px]">
                        <li>Buka menu <strong>Files</strong> di aaPanel, navigasikan ke folder repositori Node project Anda: <code className="bg-slate-200 px-1 rounded font-mono text-[10px] text-slate-700 font-bold">/www/wwwroot/ideabuabu.web.id/hris/</code>.</li>
                        <li>Buat file baru bernama <span className="font-extrabold text-slate-800">.env</span> (atau edit file yang ada).</li>
                        <li>Salin dan tempel konfigurasi berikut, sesuaikan dengan database yang telah Anda buat:</li>
                      </ul>
                      
                      <pre className="bg-slate-900 text-slate-300 p-2.5 rounded-lg text-[9.5px] font-mono leading-relaxed select-all overflow-x-auto whitespace-pre block mt-1.5 scrollbar-thin">
{`# Database Credential
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=nama_user_database_anda
DB_PASSWORD=password_database_anda
DB_NAME=nama_database_anda

# Gemini AI (Opsional untuk Fitur Smart Advisors)
GEMINI_API_KEY=kunci_gemini_api_anda`}
                      </pre>

                      <p className="font-bold text-slate-700 mt-2.5">3. Tambahkan Domain <code className="font-mono bg-slate-200 px-1 rounded text-slate-850 font-bold">hrispwk.ideabuabu.web.id</code></p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10.5px]">
                        <li>Di aaPanel, ke menu <strong>Website</strong> &gt; klik <strong>Node Project</strong> tab.</li>
                        <li>Klik tombol <strong>Add Node Project</strong> jika belum ada, masukkan port <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">3000</code>.</li>
                        <li>Di kolom <strong>Domain</strong>, masukkan <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">hrispwk.ideabuabu.web.id</code>.</li>
                        <li>aaPanel akan otomatis membuat reservasi proxy domain ke port 3000.</li>
                      </ul>

                      <p className="font-bold text-slate-700 mt-2.5">4. Jalankan Aplikasi &amp; Restart PM2</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10.5px]">
                        <li>Buka terminal VPS atau gunakan modul Terminal di aaPanel dan jalankan perintah:</li>
                        <li><code className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10.5px] block mt-1">pm2 restart hris-app || pm2 start dist/server.cjs --name "hris-app"</code></li>
                        <li>Aplikasi kini terhubung secara aman ke database lokal MySQL aaPanel VPS Anda!</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-colors text-xs cursor-pointer flex justify-center items-center gap-1.5"
              id="btn-submit-all-settings"
            >
              Simpan Semua Konfigurasi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
