import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Shield, Landmark, MapPin, 
  HelpCircle, Settings, CheckCircle, RefreshCw, Clock 
} from 'lucide-react';
import { Employee } from '../types';
import { INITIAL_SHIFTS } from '../data';

interface SettingsProps {
  onUpdateShiftConfig?: (cfg: any) => void;
  displayDensity?: 'ringkas' | 'lapang';
  onChangeDisplayDensity?: (density: 'ringkas' | 'lapang') => void;
}

export default function Pengaturan({ 
  onUpdateShiftConfig, 
  displayDensity = 'lapang', 
  onChangeDisplayDensity 
}: SettingsProps) {
  const [shiftState, setShiftState] = useState(INITIAL_SHIFTS);
  const [isSaved, setIsSaved] = useState(false);

  // General company state
  const [companyProfile, setCompanyProfile] = useState({
    name: 'PT ENTERPRISE SOLUTIONS INDONESIA',
    address: 'Gedung Biometrik Suite Lt. 5, Jl. Jend. Sudirman No. 12, Jakarta Selatan, 12190',
    phone: '(021) 555-1234',
    email: 'hrd@enterprise.co.id',
    timezone: 'WIB (UTC+07:00)'
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onUpdateShiftConfig) {
      onUpdateShiftConfig(shiftState);
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

            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nama Badan Hukum / Perusahaan</label>
                <input 
                  type="text" 
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Alamat Resmi Kantor Utama</label>
                <textarea 
                  rows={2}
                  value={companyProfile.address}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-medium select-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nomor Telepon Kantor</label>
                  <input 
                    type="text" 
                    value={companyProfile.phone}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Alamat Email HRD</label>
                  <input 
                    type="email" 
                    value={companyProfile.email}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                  />
                </div>
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
