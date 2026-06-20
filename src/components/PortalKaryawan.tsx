import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, Key, User, Calendar, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, LogOut, Printer, Coins, RefreshCw, 
  Clock, Plus, Info, ChevronRight, Smartphone, Compass, Download, ShieldCheck, X, Megaphone,
  Laptop, FolderOpen, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, AttendanceRecord, LeaveRequest, PayrollPeriod, PayrollRecord, SalaryHistoryRecord, Holiday, Announcement, CompanyAsset, SolutionDeviceConfig } from '../types';

interface PortalKaryawanProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrollRecords: PayrollRecord[];
  periods: PayrollPeriod[];
  salaryHistory: SalaryHistoryRecord[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onBackToAdmin: () => void;
  holidays: Holiday[];
  announcements: Announcement[];
  onMarkAnnouncementAsRead: (id: string, employeeId: string) => void;
  assets: CompanyAsset[];
  deviceConfig?: SolutionDeviceConfig;
}

export default function PortalKaryawan({
  employees,
  attendance,
  leaves,
  payrollRecords,
  periods,
  salaryHistory,
  onAddLeaveRequest,
  onBackToAdmin,
  holidays,
  announcements,
  onMarkAnnouncementAsRead,
  assets,
  deviceConfig
}: PortalKaryawanProps) {
  // Authentication stats
  const [authToken, setAuthToken] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Simulated Email Inbox Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [sentEmailData, setSentEmailData] = useState<{
    to: string;
    employeeName: string;
    token: string;
    magicLink: string;
  } | null>(null);

  // Active Sub-Tab in Employee Portal
  const [portalTab, setPortalTab] = useState<'ringkasan' | 'absensi' | 'slip-gaji' | 'cuti' | 'riwayat-gaji' | 'aset-saya' | 'dokumen'>('ringkasan');
  
  // Slip Gaji state
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  
  const getMinDateH7 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [printLeave, setPrintLeave] = useState<LeaveRequest | null>(null);
  
  // Leave Request Form state
  const [leaveForm, setLeaveForm] = useState({
    type: 'Cuti Tahunan' as LeaveRequest['type'],
    startDate: getMinDateH7(),
    endDate: getMinDateH7(),
    reason: ''
  });

  // Real-time overlapping holidays detector for employee portal leaf form
  const portalOverlappingHolidays = React.useMemo(() => {
    if (!leaveForm.startDate || !leaveForm.endDate) return [];
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

    return holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate >= start && hDate <= end;
    });
  }, [leaveForm.startDate, leaveForm.endDate, holidays]);

  const calculatedPortalDuration = React.useMemo(() => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 0;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

    let workingDaysCount = 0;
    const currentIterDate = new Date(start);
    while (currentIterDate <= end) {
      const dayOfWeek = currentIterDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = currentIterDate.toISOString().split('T')[0];
      const isDayHoliday = holidays.some(h => h.date === dateStr);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isDayHoliday) {
        workingDaysCount++;
      }
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }
    return workingDaysCount > 0 ? workingDaysCount : 1;
  }, [leaveForm.startDate, leaveForm.endDate, holidays]);

  // Check URL token parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token') || params.get('portal_token');
    if (tokenParam) {
      const matched = employees.find(
        emp => emp.portalToken && emp.portalToken.toLowerCase() === tokenParam.trim().toLowerCase()
      );
      if (matched) {
        setCurrentUser(matched);
        setAuthToken(matched.portalToken || '');
        setSuccessMsg(`Otentikasi otomatis via link aman berhasil! Selamat datang, ${matched.name}.`);
        // Remove param from URL to keep it clean
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setErrorMsg('Tautan memiliki kode token akses yang tidak valid.');
      }
    }
  }, [employees]);

  // Handle Token Sign-In
  const handleTokenLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!authToken.trim()) {
      setErrorMsg('Harap masukkan kode token akses portal Anda!');
      return;
    }

    const matched = employees.find(
      emp => emp.portalToken && emp.portalToken.trim().toUpperCase() === authToken.trim().toUpperCase()
    );

    if (matched) {
      setCurrentUser(matched);
      setSuccessMsg(`Berhasil masuk! Selamat datang kembali, ${matched.name}.`);
    } else {
      setErrorMsg('Kode token akses salah atau tidak terdaftar. Hubungi HR untuk bantuan.');
    }
  };

  // Handle Request/Send Token to Email
  const handleRequestToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!authEmail.trim()) {
      setErrorMsg('Harap masukkan alamat email kantor Anda!');
      return;
    }

    const matched = employees.find(
      emp => emp.email.trim().toLowerCase() === authEmail.trim().toLowerCase()
    );

    if (matched) {
      const token = matched.portalToken || `TOK-${matched.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const magicLink = `${window.location.origin}${window.location.pathname}?token=${token}`;
      
      setSentEmailData({
        to: matched.email,
        employeeName: matched.name,
        token: token,
        magicLink: magicLink
      });
      
      setIsEmailModalOpen(true);
      setSuccessMsg(`Token keamanan baru berhasil dikirim ke ${matched.email}!`);
    } else {
      setErrorMsg('Alamat email kantor tidak ditemukan dalam database karyawan.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    setSuccessMsg('Log out dari portal karyawan sukses.');
  };

  // Quick Stats computations for logged-in user
  const userAttendance = currentUser ? attendance.filter(a => a.employeeId === currentUser.id) : [];
  const userLeaves = currentUser ? leaves.filter(l => l.employeeId === currentUser.id) : [];
  const userSalaryLogs = currentUser ? salaryHistory.filter(h => h.employeeId === currentUser.id) : [];
  const userPayrolls = currentUser ? payrollRecords.filter(p => p.employeeId === currentUser.id) : [];
  const userAssets = currentUser ? assets.filter(a => a.loanedToId === currentUser.id) : [];

  const totalHadir = userAttendance.filter(a => a.status === 'Hadir' || a.status === 'Terlambat' || a.status === 'Pulang Cepat').length;
  const totalTelat = userAttendance.filter(a => a.status === 'Terlambat').length;
  const totalAlpa = userAttendance.filter(a => a.status === 'Alpa').length;

  // Filter and sort announcements for this user
  const activeAnnouncements = currentUser ? announcements.filter(ann => {
    if (ann.targetType === 'Semua') return true;
    if (ann.targetType === 'Departemen' && ann.targetValue === currentUser.department) return true;
    if (ann.targetType === 'Karyawan' && ann.targetValue === currentUser.id) return true;
    return false;
  }).sort((a, b) => b.id.localeCompare(a.id)) : [];

  const unreadAnnouncementsCount = currentUser 
    ? activeAnnouncements.filter(ann => !ann.readBy || !ann.readBy.includes(currentUser.id)).length 
    : 0;

  
  // Submit leave request from employee
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!leaveForm.reason.trim()) {
      alert('Harap masukkan alasan pengajuan cuti/izin Anda!');
      return;
    }

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);

    if (end < start) {
      alert('Tanggal berakhir tidak boleh mendahului tanggal mulai!');
      return;
    }

    // STRICT VALIDATION: planned leave must be at least H-7 in advance
    if (
      leaveForm.type === 'Cuti Tahunan' || 
      leaveForm.type === 'Izin Menikah' || 
      leaveForm.type === 'Izin Khusus' || 
      leaveForm.type === 'Melahirkan'
    ) {
      const today = new Date();
      const h7Limit = new Date();
      h7Limit.setDate(today.getDate() + 7);
      h7Limit.setHours(0, 0, 0, 0);

      const chosenStart = new Date(leaveForm.startDate);
      chosenStart.setHours(0, 0, 0, 0);

      if (chosenStart < h7Limit) {
        alert(`Gagal mengajukan ${leaveForm.type}! Pengajuan cuti jenis ini hanya dapat diisi minimal H-7 sebelum tanggal cuti diambil. Tanggal awal cuti tercepat adalah: ${h7Limit.toISOString().split('T')[0]}`);
        return;
      }
    }

    // Calculate days duration (inclusive) excluding weekends and national holidays automatically!
    let workingDaysCount = 0;
    const currentIterDate = new Date(start);
    while (currentIterDate <= end) {
      const dayOfWeek = currentIterDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = currentIterDate.toISOString().split('T')[0];
      const isDayHoliday = holidays.some(h => h.date === dateStr);
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isDayHoliday) {
        workingDaysCount++;
      }
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }
    const duration = workingDaysCount > 0 ? workingDaysCount : 1;

    onAddLeaveRequest({
      id: `LV-EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      duration,
      reason: leaveForm.reason,
      status: 'Pending',
      submissionDate: new Date().toISOString().split('T')[0]
    });

    // Notify user
    alert(`Sukses mengajukan ${leaveForm.type} selama ${duration} hari. Harap tunggu persetujuan dari tim HR.`);
    
    // Clear form
    setLeaveForm({
      type: 'Cuti Tahunan',
      startDate: getMinDateH7(),
      endDate: getMinDateH7(),
      reason: ''
    });

    setPortalTab('cuti');
  };

  // Calculate default selected period if empty
  useEffect(() => {
    if (currentUser && userPayrolls.length > 0 && !selectedPeriodId) {
      // Choose newest period
      setSelectedPeriodId(userPayrolls[0].periodId);
    }
  }, [currentUser, userPayrolls]);

  // Current selected payroll details
  const activePayroll = userPayrolls.find(p => p.periodId === selectedPeriodId);
  const activePeriod = periods.find(p => p.id === selectedPeriodId);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative" id="portal-karyawan-workspace">
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-rose-900/30">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight text-white uppercase">Portal Karyawan Mandiri</h2>
              <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase">Secure Link SSL</span>
            </div>
            <p className="text-[10px] text-slate-400">Sistem Presensi, Pengajuan Cuti, &amp; Slip Gaji Online</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToAdmin}
            className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Beralih ke Admin HR
          </button>
          
          {currentUser && (
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/25 hover:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          )}
        </div>
      </header>

      {/* MAIN SCREEN ROUTER */}
      {!currentUser ? (
        /* ================= AUTHENTICATION / SIGN IN SCREEN ================= */
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6" id="portal-auth-container">
          <div className="text-center max-w-lg mx-auto mb-10">
            <h3 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl">Masuk Kredensial Keamanan Anda</h3>
            <p className="text-slate-400 text-xs mt-2">
              Gunakan kode token digital unik yang diberikan HR, atau kirim token instan baru langsung ke email korporat terhubung Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Form 1: Sign in with Token */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden" id="auth-by-token">
              <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-rose-500/10 rounded-xl text-rose-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Metode A: Masuk Instan Token</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Masukkan kode token khusus yang tercantum di profil karyawan Anda.</p>
                </div>

                <form onSubmit={handleTokenLogin} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kode Akses Token *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Contoh: TOK-HERU-001"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 pl-10 pr-4 py-2 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 uppercase"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold text-xs py-2 rounded-xl border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Verifikasi Token <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </form>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 text-[10.5px] text-slate-400 mt-6 leading-relaxed">
                <p className="font-extrabold text-amber-400 flex items-center gap-1 mb-0.5">
                  <Info className="w-3.5 h-3.5" /> Tips Tester Instan:
                </p>
                Gunakan token contoh: <span className="font-mono font-bold text-white">TOK-HERU-001</span> (Heru), <span className="font-mono font-bold text-white">TOK-BUDI-002</span> (Budi), atau <span className="font-mono font-bold text-white">TOK-SITI-003</span> (Siti) untuk masuk segera.
              </div>
            </div>

            {/* Form 2: Request token via email */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden" id="auth-by-email">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Metode B: Kirim Token ke Email</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Masukkan email korporat Anda, kami akan mensimulasikan pengiriman kode &amp; magic-link.</p>
                </div>

                <form onSubmit={handleRequestToken} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Kantor Terdaftar *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="nama.kamu@enterprise.co.id"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl border border-blue-500 shadow-lg shadow-blue-900/20 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Kirim Token Akses <RefreshCw className="w-3.5 h-3.5 text-blue-200" />
                  </button>
                </form>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80 text-[10.5px] text-slate-400 mt-6 leading-relaxed">
                <p className="font-extrabold text-blue-400 flex items-center gap-1 mb-0.5">
                  <Info className="w-3.5 h-3.5" /> Email Sandbox:
                </p>
                Masukkan email: <span className="font-mono text-white font-semibold">herupermana.vps@gmail.com</span> untuk mensimulasikan sistem routing pengiriman token digital.
              </div>
            </div>
          </div>

          {/* Messages info */}
          <div className="mt-6">
            {errorMsg && (
              <div className="bg-rose-955/45 border border-rose-900/50 p-3 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-955/45 border border-emerald-900/50 p-3 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-semibold animate-fadeIn">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= LOADED PORTAL SYSTEM ================= */
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] min-h-[550px]" id="portal-workspace-grid">
          
          {/* Sider Menu tabs for employees */}
          <aside className="w-full lg:w-64 bg-slate-950/60 border-r border-slate-800/80 flex flex-col justify-between shrink-0" id="portal-sidebar">
            <div className="p-4 space-y-5">
              {/* Profile Card Summary */}
              <div className="p-4 bg-slate-900/85 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-md">
                <img
                  src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-750 placeholder-no-referrer"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate text-xs">
                  <h4 className="font-extrabold text-white truncate leading-tight">{currentUser.name}</h4>
                  <p className="text-slate-400 font-medium truncate mt-0.5">{currentUser.position}</p>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-green-400 mt-1 block px-1.5 py-0.5 bg-green-500/10 border border-green-500/10 rounded w-fit">
                    NIP: {currentUser.id}
                  </span>
                </div>
              </div>

              {/* Navigation lists */}
              <nav className="space-y-1">
                <span className="px-3 text-[9px] font-black uppercase tracking-widest text-[#475569] block mb-2">PILIHAN NAVIGASI</span>
                
                <button
                  onClick={() => setPortalTab('ringkasan')}
                  className={`w-full text-left inline-flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'ringkasan' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="inline-flex items-center gap-3 truncate">
                    <Compass className="w-4 h-4 text-rose-450" />
                    <span className="truncate">Ringkasan Portal</span>
                  </div>
                  {unreadAnnouncementsCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
                      {unreadAnnouncementsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setPortalTab('absensi')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'absensi' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 text-orange-450" />
                  <span className="truncate">Biometrik Kehadiran</span>
                </button>

                <button
                  onClick={() => setPortalTab('slip-gaji')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'slip-gaji' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Coins className="w-4 h-4 text-emerald-455" />
                  <span className="truncate">Unduh Slip Gaji</span>
                </button>

                <button
                  onClick={() => setPortalTab('cuti')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'cuti' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-blue-450" />
                  <span className="truncate">Ajukan Cuti / Izin</span>
                  {userLeaves.filter(l => l.status === 'Pending').length > 0 && (
                    <span className="bg-blue-500/15 text-blue-400 inline-block px-1.5 py-0.5 ml-auto rounded text-[9px] font-black">{userLeaves.filter(l => l.status === 'Pending').length}</span>
                  )}
                </button>

                <button
                  onClick={() => setPortalTab('riwayat-gaji')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'riwayat-gaji' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-pink-450" />
                  <span className="truncate">Revisi &amp; Riwayat Gaji</span>
                  {userSalaryLogs.length > 0 && (
                    <span className="bg-pink-500/10 text-pink-400 inline-block px-1.5 py-0.5 ml-auto rounded text-[9px] font-mono">{userSalaryLogs.length}</span>
                  )}
                </button>

                <button
                  onClick={() => setPortalTab('aset-saya')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'aset-saya' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  id="tab-employee-loaned-assets"
                >
                  <Smartphone className="w-4 h-4 text-emerald-450" />
                  <span className="truncate">Aset &amp; Inventaris Saya</span>
                  {userAssets.length > 0 && (
                    <span className="bg-emerald-500/15 text-emerald-400 inline-block px-1.5 ml-auto py-0.5 rounded text-[9px] font-mono">{userAssets.length}</span>
                  )}
                </button>

                <button
                  onClick={() => setPortalTab('dokumen')}
                  className={`w-full text-left inline-flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    portalTab === 'dokumen' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  id="tab-employee-documents"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">Dokumen &amp; Kontrak Saya</span>
                  {(currentUser.documents || []).length > 0 && (
                    <span className="bg-cyan-500/20 text-cyan-400 inline-block px-1.5 ml-auto py-0.5 rounded text-[9px] font-mono">{(currentUser.documents || []).length}</span>
                  )}
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 leading-normal space-y-1">
              <p className="font-extrabold text-slate-400">Portal Karyawan v1.0.2</p>
              <p>{deviceConfig?.companyProfile?.name || 'PT Enterprise Solutions'}</p>
              <div className="flex items-center gap-1.5 text-rose-500/80 mt-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Token Keamanan Aktif
              </div>
            </div>
          </aside>

          {/* Dynamic Content Frame */}
          <main className="flex-1 bg-[#090D16] p-6 lg:p-8 overflow-y-auto" id="portal-content-panel">
            <AnimatePresence mode="wait">
              
              {/* ================= 1. RINGKASAN SUB-TAB ================= */}
              {portalTab === 'ringkasan' && (
                <motion.div
                  key="p-tab-ringkasan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 relative overflow-hidden" id="portal-welcome-banner">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none" />
                    <h3 className="text-base font-extrabold text-white">Selamat datang kembali, {currentUser.name}! 👋</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Sistem mandiri membolehkan Anda meninjau rincian kehadiran biometrik Mesin Solution X-100C, melacak pergeseran gaji dari waktu ke waktu, mengunduh slip resmi berstandar PPh21, dan mengajukan cuti dispensasi secara transparan.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setPortalTab('cuti')}
                        className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajukan Cuti/Izin Baru
                      </button>
                      <button
                        onClick={() => setPortalTab('slip-gaji')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5 text-emerald-450" /> Lihat Slip Gaji Terakhir
                      </button>
                    </div>
                  </div>

                  {/* Announcement Board Panel */}
                  {activeAnnouncements.length > 0 && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 animate-scaleIn" id="portal-announcements-panel">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-rose-500" /> 
                          Pengumuman &amp; Pengingat Dewan HR ({unreadAnnouncementsCount} Belum Dibaca)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeAnnouncements.map((ann) => {
                          const isUnread = !ann.readBy || !ann.readBy.includes(currentUser.id);

                          return (
                            <div 
                              key={ann.id} 
                              className={`p-4 rounded-xl border transition-all ${
                                isUnread 
                                  ? 'bg-rose-500/5 border-rose-500/20 shadow-xs shadow-rose-950/20' 
                                  : 'bg-slate-900/60 border-slate-850 text-slate-350'
                              }`}
                              id={`portal-ann-item-${ann.id}`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                      ann.category === 'Pengingat Presensi' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                      ann.category === 'Informasi Slip Gaji' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                      ann.category === 'Instruksi PT' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                                      'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                                    }`}>
                                      {ann.category}
                                    </span>
                                    {ann.isImportant && (
                                      <span className="bg-red-500/15 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-500/15">
                                        PENTING
                                      </span>
                                    )}
                                    {isUnread && (
                                      <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded animate-pulse">
                                        BARU
                                      </span>
                                    )}
                                  </div>
                                  <h5 className={`font-bold text-xs leading-snug ${isUnread ? 'text-white' : 'text-slate-350'} mt-1`}>{ann.title}</h5>
                                </div>
                              </div>

                              <p className="text-[10.5px] leading-relaxed mb-3 whitespace-pre-line text-slate-400 font-medium">
                                {ann.content}
                              </p>

                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold border-t border-slate-850 pt-2">
                                <div>
                                  Oleh: <span className="text-slate-300 font-mono italic">{ann.author}</span> · {ann.date.split(' ')[0]}
                                </div>

                                {isUnread ? (
                                  <button
                                    onClick={() => onMarkAnnouncementAsRead(ann.id, currentUser.id)}
                                    className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Tandai Dibaca
                                  </button>
                                ) : (
                                  <span className="text-slate-500 inline-flex items-center gap-0.5 font-bold">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Sudah Dibaca
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="portal-stats-grid">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hadir Bulan Ini</span>
                      <p className="text-2xl font-black text-rose-400 font-mono mt-1">{totalHadir} <span className="text-xs text-slate-500 font-sans">Hari</span></p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Terlambat Datang</span>
                      <p className="text-2xl font-black text-amber-500 font-mono mt-1">{totalTelat} <span className="text-xs text-slate-500 font-sans">Kali</span></p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sisa Cuti Tahunan</span>
                      <p className="text-2xl font-black text-blue-400 font-mono mt-1">12 <span className="text-xs text-slate-500 font-sans">Hari</span></p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kehadiran Alpa</span>
                      <p className="text-2xl font-black text-red-500 font-mono mt-1">{totalAlpa} <span className="text-xs text-slate-500 font-sans">Hari</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Leave requests summary */}
                    <div className="lg:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                        <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5"><Calendar className="w-4.5 h-4.5 text-blue-450" /> Pengajuan Cuti Terkini</h4>
                        <button onClick={() => setPortalTab('cuti')} className="text-rose-400 hover:text-rose-350 text-[10px] font-bold inline-flex items-center gap-1">Semua Cuti <ChevronRight className="w-3.5 h-3.5" /></button>
                      </div>

                      {userLeaves.length === 0 ? (
                        <p className="text-slate-500 text-xs italic text-center py-6">Belum ada pengajuan cuti dalam daftar.</p>
                      ) : (
                        <div className="divide-y divide-slate-850">
                          {userLeaves.slice(0, 3).map(l => (
                            <div key={l.id} className="py-2.5 flex justify-between items-center text-xs">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-250">{l.type}</p>
                                <p className="text-[10px] text-slate-450">{l.startDate} s/d {l.endDate} ({l.duration} hari)</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                l.status === 'Disetujui' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                l.status === 'Ditolak' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {l.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick profile info */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5"><User className="w-4.5 h-4.5 text-rose-500" /> Profil Remunerasi</h4>
                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Gaji Pokok Utama:</span>
                          <span className="font-mono font-bold text-white">Rp {currentUser.basicSalary.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Tunjangan Khusus:</span>
                          <span className="font-mono font-bold text-white">Rp {currentUser.allowance.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 border-t border-slate-850 pt-2">
                          <span>Departemen:</span>
                          <span className="font-bold text-slate-200">{currentUser.department}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Tanggal Masuk:</span>
                          <span className="font-bold text-slate-200">{currentUser.joinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= 2. BIOMETRIK KEHADIRAN SUB-TAB ================= */}
              {portalTab === 'absensi' && (
                <motion.div
                  key="p-tab-absensi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2"><Clock className="w-5 h-5 text-orange-450" /> Biometrik Kehadiran Solution X-100C</h3>
                      <p className="text-[10px] text-slate-400">Data stamp ditarik otomatis dari IP BRIDGE {currentUser.id}</p>
                    </div>
                  </div>

                  {userAttendance.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-8 text-center text-slate-450 italic text-xs">
                      Belum ada data log kehadiran tercatat di sistem biometrik Anda.
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-md">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                            <th className="p-4">Tanggal Kerja</th>
                            <th className="p-4">Jam Masuk</th>
                            <th className="p-4">Jam Pulang</th>
                            <th className="p-4">Status &amp; Toleransi</th>
                            <th className="p-4 text-right">Potongan Terlambat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {userAttendance.map(a => {
                            const delayPenalty = a.lateMinutes * 5000; // Flat Rp 5,000 deduction per minute
                            
                            return (
                              <tr key={a.id} className="hover:bg-slate-900/40 text-slate-200">
                                <td className="p-4 font-bold font-mono text-slate-300">{a.date}</td>
                                <td className="p-4">
                                  {a.checkIn ? (
                                    <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 font-bold text-white">{a.checkIn}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {a.checkOut ? (
                                    <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 font-bold text-white">{a.checkOut}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                      a.status === 'Hadir' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                      a.status === 'Terlambat' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                      {a.status}
                                    </span>
                                    {a.lateMinutes > 0 && (
                                      <span className="text-[10px] text-amber-400 font-semibold">(Terlambat: {a.lateMinutes} Menit)</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-300">
                                  {delayPenalty > 0 ? (
                                    <span className="text-rose-400 font-bold">-Rp {delayPenalty.toLocaleString('id-ID')}</span>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">Lunas/Tidak Ada</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= 3. SLIP GAJI SUB-TAB ================= */}
              {portalTab === 'slip-gaji' && (
                <motion.div
                  key="p-tab-slip-gaji"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-850 pb-3" id="portal-slip-header">
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2"><Coins className="w-5 h-5 text-emerald-450" /> Unduh Slip Gaji Elektronik</h3>
                      <p className="text-[10px] text-slate-400">Verifikasi perpajakan PPh21 &amp; iuran BPJS mandiri</p>
                    </div>
                    
                    <div className="flex items-center gap-3" id="period-picker-block">
                      <span className="text-[10px] uppercase font-black text-slate-400">Pilih Periode:</span>
                      <select
                        value={selectedPeriodId}
                        onChange={(e) => setSelectedPeriodId(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs text-white p-1.5 px-3 rounded-xl focus:ring-1 focus:ring-rose-500"
                      >
                        {periods.map(p => (
                          <option key={p.id} value={p.id}>{p.month}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!activePayroll ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-8 text-center text-slate-400 italic text-xs">
                      Slip gaji untuk periode terpilih belum dihasilkan (Draft atau belum terbit). Hubungi Divisi Finance.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Interactive Printable Slip Gaji Card */}
                      <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl space-y-6 border border-slate-100 max-w-2xl mx-auto relative overflow-hidden" id="printable-payslip-canvas">
                        
                        {/* Print styles override */}
                        <style>{`
                          @media print {
                            body * {
                              visibility: hidden;
                            }
                            #printable-payslip-canvas, #printable-payslip-canvas * {
                              visibility: visible;
                            }
                            #printable-payslip-canvas {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100%;
                              border: none;
                              box-shadow: none;
                              padding: 0;
                            }
                          }
                        `}</style>

                        {/* watermark/design background */}
                        <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-slate-100 rounded-full scale-150 pointer-events-none opacity-20" />

                        {/* Letter Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                          <div>
                            <h4 className="text-base font-extrabold uppercase tracking-tight text-slate-900">{deviceConfig?.companyProfile?.name || 'PT Enterprise Solutions'}</h4>
                            <p className="text-[9px] text-slate-500 leading-normal">{deviceConfig?.companyProfile?.address || 'Gedung Wisma Teknologi, Lt. 8 • Jakarta Selatan, DKI Jakarta'}</p>
                            <div className="text-[9px] text-slate-400 mt-0.5">Sistem Penggajian Solution X-100C Biometric Bridge</div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="font-extrabold text-[#64748B] block tracking-widest text-[9px]">OFFICIAL RECEIPT</span>
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold block mt-1">SLIP-{activePayroll.id}</span>
                          </div>
                        </div>

                        {/* Employee Bio details */}
                        <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-150">
                          <div>
                            <p className="text-slate-400">NIP / ID Karyawan:</p>
                            <p className="font-bold font-mono text-slate-800">{currentUser.id}</p>
                            <p className="text-slate-400 mt-1">Nama Lengkap:</p>
                            <p className="font-bold text-slate-800">{currentUser.name}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Departemen:</p>
                            <p className="font-bold text-slate-800">{currentUser.department}</p>
                            <p className="text-slate-400 mt-1">Periode Pembayaran:</p>
                            <p className="font-bold text-rose-700">{activePeriod?.month || 'Bulan Berjalan'}</p>
                          </div>
                        </div>

                        {/* Salary Breakdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10.5px]">
                          {/* Income column */}
                          <div className="space-y-2">
                            <h5 className="font-extrabold uppercase text-xs border-b border-slate-300 pb-1 text-slate-900">A. PENERIMAAN (INCOME)</h5>
                            
                            <div className="flex justify-between">
                              <span className="text-slate-500">Gaji Pokok Utama:</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.basicSalary.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tunjangan Operasional:</span>
                              <span className="font-mono font-bold text-slate-850">Rp {currentUser.allowance.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tunjangan Makan &amp; Transport:</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.allowanceSum.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Bonus Kinerja &amp; Lembur:</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.bonus.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-slate-900">
                              <span>Total Penerimaan Bruto:</span>
                              <span className="font-mono text-indigo-700">
                                Rp {(
                                  activePayroll.basicSalary + 
                                  currentUser.allowance + 
                                  activePayroll.allowanceSum + 
                                  activePayroll.bonus
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>

                          {/* Deductions column */}
                          <div className="space-y-2">
                            <h5 className="font-extrabold uppercase text-xs border-b border-slate-300 pb-1 text-slate-900">B. POTONGAN (DEDUCTION)</h5>
                            
                            <div className="flex justify-between">
                              <span className="text-slate-500">PPH 21 Pajak Penghasilan:</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.pph21.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Iuran BPJS Kesehatan (1%):</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.bpjsKesehatan.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">BPJS Ketenagakerjaan (2%):</span>
                              <span className="font-mono font-bold text-slate-850">Rp {activePayroll.bpjsKetenagakerjaan.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Potongan Keterlambatan Absen:</span>
                              <span className="font-mono font-bold text-rose-600">Rp {activePayroll.lateDeduction.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-slate-900">
                              <span>Total Potongan:</span>
                              <span className="font-mono text-rose-600">
                                Rp {(
                                  activePayroll.pph21 + 
                                  activePayroll.bpjsKesehatan + 
                                  activePayroll.bpjsKetenagakerjaan + 
                                  activePayroll.lateDeduction
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Net Salary Area */}
                        <div className="bg-[#EEF2F6] p-4 rounded-xl flex justify-between items-center text-slate-900 border border-slate-200">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gaji Bersih Diterima (Take Home Pay):</span>
                            <p className="text-xs text-slate-400 italic">Disalurkan otomatis via Transfer Bank Korporat</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black font-mono text-emerald-700">Rp {activePayroll.netSalary.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Footnotes disclosures */}
                        <div className="pt-4 border-t border-slate-200 text-[8.5px] text-slate-400 leading-normal flex justify-between items-center">
                          <p>Dokumen ini diterbitkan secara elektronik oleh sistem {deviceConfig?.companyProfile?.name || 'PT Enterprise Solutions'} HRIS Biometric Bridge.<br />Sah tanpa tanda tangan basah fisik.</p>
                          <p className="text-right font-semibold font-mono uppercase tracking-wider text-rose-700">STATUS: {activePayroll.payoutStatus}</p>
                        </div>
                      </div>

                      {/* Tool bar */}
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => window.print()}
                          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-lg outline-none"
                        >
                          <Printer className="w-4 h-4" /> Cetak Slip Gaji (PDF)
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= 4. AJUKAN CUTI SUB-TAB ================= */}
              {portalTab === 'cuti' && (
                <motion.div
                  key="p-tab-cuti"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-450" /> Pengajuan Dispensasi Cuti &amp; Izin Pegawai</h3>
                      <p className="text-[10px] text-slate-400">Sinkronisasi status persetujuan audit real-time</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Applying leave form */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5"><Plus className="w-4.5 h-4.5 text-blue-505" /> Form Pengisian Cuti</h4>
                      
                      <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Jenis Cuti / Dispensasi *</label>
                          <select
                            value={leaveForm.type}
                            onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                            className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg"
                          >
                            <option value="Cuti Tahunan">Cuti Tahunan</option>
                            <option value="Sakit (Surat Dokter)">Sakit (Surat Dokter)</option>
                            <option value="Izin Menikah">Izin Menikah</option>
                            <option value="Izin Khusus">Izin Khusus</option>
                            <option value="Melahirkan">Melahirkan</option>
                          </select>

                          {currentUser && (() => {
                            const empSelectedLeaves = leaves.filter(l => l.employeeId === currentUser.id);
                            const approvedAnnualLeavesCount = empSelectedLeaves
                              .filter(l => l.type === 'Cuti Tahunan' && l.status === 'Disetujui')
                              .reduce((sum, l) => sum + l.duration, 0);
                            const sisaCuti = Math.max(0, 12 - approvedAnnualLeavesCount);
                            return (
                              <div className="mt-2.5 px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] flex justify-between items-center text-slate-300">
                                <span className="font-semibold text-slate-400">Sisa Jatah Cuti Anda:</span>
                                <span className="font-extrabold font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">{sisaCuti} Hari Kerja</span>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 font-bold mb-1">Dari Tanggal *</label>
                            <input
                              type="date"
                              required
                              value={leaveForm.startDate}
                              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-bold mb-1">Sampai Tanggal *</label>
                            <input
                              type="date"
                              required
                              value={leaveForm.endDate}
                              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg font-mono"
                            />
                          </div>
                        </div>

                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl space-y-1 text-[9.5px] leading-relaxed">
                          <p className="font-extrabold flex items-center gap-1">⚠️ Aturan H-7 Pengajuan Cuti:</p>
                          <p>Pengajuan Cuti Tahunan terencana wajib diajukan minimal H-7 dari hari pelaksanaan. Pengajuan cuti tercepat saat ini adalah pada: <strong>{getMinDateH7()}</strong>.</p>
                        </div>

                        {/* Live public holiday clash info and duration calculation in form */}
                        {leaveForm.startDate && leaveForm.endDate && (
                          <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[9.5px] text-teal-300 leading-relaxed space-y-1 font-semibold">
                            <div className="font-bold flex justify-between">
                              <span>Durasi Bersih Cuti (Terhitung):</span>
                              <span className="font-mono bg-teal-500/20 text-teal-200 px-1.5 py-0.5 rounded border border-teal-500/30 font-extrabold">{calculatedPortalDuration} Hari Kerja</span>
                            </div>
                            {portalOverlappingHolidays.length > 0 ? (
                              <div className="text-rose-300 bg-rose-500/10 border border-rose-500/25 p-1.5 rounded-lg mt-1.5 space-y-1">
                                <p className="font-bold flex items-center gap-1 text-[9px]">⚠️ Bentrok Hari Libur Nasional Terdeteksi ({portalOverlappingHolidays.length} Hari):</p>
                                <ul className="list-disc pl-3 text-[9px] font-bold space-y-0.5 text-rose-400">
                                  {portalOverlappingHolidays.map(h => (
                                    <li key={h.id}>{h.name} ({h.date})</li>
                                  ))}
                                </ul>
                                <p className="text-[9px] text-emerald-400 font-bold block mt-1">Sistem Otomatis Menyinkronkan Durasi: Masa libur nasional di atas tidak mengonsumsi jatah cuti tahunan Anda.</p>
                              </div>
                            ) : (
                              <p className="text-[9px] text-slate-500">Tidak beririsan dengan hari libur nasional pada rentang tanggal ini.</p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Alasan Penjelasan Detail *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tuliskan keterangan keperluan dispensasi cuti/permisi secara formal..."
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded-lg"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                          Ajukan ke HR Supervisor <Plus className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                    {/* History panel of leaves */}
                    <div className="lg:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">Histori Status Dispensasi Pengajuan</h4>

                      {userLeaves.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 italic text-xs">
                          Belum ada histori pengajuan cuti atau dispensasi yang terekam.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {userLeaves.map(l => (
                            <div key={l.id} className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-450 font-mono">Dibuat: {l.submissionDate}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                  l.status === 'Disetujui' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                  l.status === 'Ditolak' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                  'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                                }`}>
                                  {l.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <p className="font-black text-white">{l.type}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{l.startDate} s/d {l.endDate} ({l.duration} Hari)</p>
                                </div>
                                <span className="font-bold bg-slate-800 text-slate-350 px-2 py-0.5 rounded text-[10px] font-mono">{l.id}</span>
                              </div>

                              <p className="text-[11px] text-slate-350 bg-slate-950/45 p-2 rounded italic border border-slate-800 leading-relaxed mt-1">
                                &ldquo;{l.reason}&rdquo;
                              </p>

                              {/* Deteksi Bentrok Hari Libur Nasional di Portal Karyawan */}
                              {(() => {
                                const lStart = new Date(l.startDate);
                                const lEnd = new Date(l.endDate);
                                const cardOverlaps = holidays.filter(h => {
                                  const hDate = new Date(h.date);
                                  return hDate >= lStart && hDate <= lEnd;
                                });

                                if (cardOverlaps.length === 0) return null;

                                return (
                                  <div className="mt-2 text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-300 p-2.5 rounded-lg flex items-start gap-1.5 leading-relaxed font-semibold">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-extrabold text-rose-200">Deteksi Bentrok Hari Libur ({cardOverlaps.length} Libur Resmi):</span>{' '}
                                      {cardOverlaps.map(o => `${o.name} (${o.date})`).join(', ')}.
                                      <span className="block mt-0.5 text-emerald-400 font-black">Sinkronisasi Otomatis: Hanya memotong {l.duration} hari kerja.</span>
                                    </div>
                                  </div>
                                );
                              })()}

                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800 bg-slate-950/10">
                                <span className="text-[10px] text-slate-500 font-medium">Tersedia untuk cetak resmi</span>
                                <button
                                  type="button"
                                  onClick={() => setPrintLeave(l)}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/20 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                                  title="Cetak dan Review berkas sebagai PDF resmi"
                                >
                                  <Printer className="w-3 h-3 text-amber-400" />
                                  <span>Cetak Berkas Cuti</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= 5. RIWAYAT GAJI SUB-TAB ================= */}
              {portalTab === 'riwayat-gaji' && (
                <motion.div
                  key="p-tab-riwayat-gaji"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-850 pb-3">
                    <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2"><FileText className="w-5 h-5 text-pink-450" /> Histori Penyesuaian Gaji &amp; Remunerasi</h3>
                    <p className="text-[10px] text-slate-400">Transparansi audit pergeseran nominal gaji dari waktu ke waktu</p>
                  </div>

                  {userSalaryLogs.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-10 text-center text-slate-500 italic text-xs leading-relaxed">
                      Belum ada transkrip pencatatan log perubahan remunerasi untuk profil Anda.<br />Data default didaftarkan pertama kali sebagai baseline.
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-4">
                      {userSalaryLogs
                        .sort((a, b) => b.id.localeCompare(a.id))
                        .map(log => {
                          const salaryDiff = log.newBasicSalary - log.oldBasicSalary;
                          const allowanceDiff = log.newAllowance - log.oldAllowance;
                          
                          return (
                            <div key={log.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 shadow relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-pink-500" />
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                <span className="font-bold text-pink-400">{log.changeDate}</span>
                                <span className="font-semibold bg-slate-900 border border-slate-800 px-1.5 rounded">{log.id}</span>
                              </div>

                              <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                                <Coins className="w-4 h-4 text-pink-500" /> Penyesuaian Nilai Gaji Pokok &amp; Tunjangan
                              </h4>

                              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                                  <span className="text-[10px] text-slate-400 block font-medium">Gaji Pokok Utama:</span>
                                  <div className="flex items-center gap-1 mt-1 flex-wrap font-mono">
                                    {log.oldBasicSalary > 0 && (
                                      <>
                                        <span className="line-through text-slate-500">Rp {log.oldBasicSalary.toLocaleString('id-ID')}</span>
                                        <span className="text-slate-500">→</span>
                                      </>
                                    )}
                                    <span className="font-extrabold text-slate-205">Rp {log.newBasicSalary.toLocaleString('id-ID')}</span>
                                    {log.oldBasicSalary > 0 && salaryDiff !== 0 && (
                                      <span className={`text-[10px] font-black ${salaryDiff > 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                        ({salaryDiff > 0 ? '+' : ''}{salaryDiff.toLocaleString('id-ID')})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                                  <span className="text-[10px] text-slate-400 block font-medium">Tunjangan Operasional:</span>
                                  <div className="flex items-center gap-1 mt-1 flex-wrap font-mono relative">
                                    {log.oldAllowance > 0 && (
                                      <>
                                        <span className="line-through text-slate-500">Rp {log.oldAllowance.toLocaleString('id-ID')}</span>
                                        <span className="text-slate-500">→</span>
                                      </>
                                    )}
                                    <span className="font-extrabold text-slate-205">Rp {log.newAllowance.toLocaleString('id-ID')}</span>
                                    {log.oldAllowance > 0 && allowanceDiff !== 0 && (
                                      <span className={`text-[10px] font-black ${allowanceDiff > 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                        ({allowanceDiff > 0 ? '+' : ''}{allowanceDiff.toLocaleString('id-ID')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-xs leading-normal">
                                <span className="text-[9px] uppercase font-black text-slate-450 block mb-0.5">Motif Pertimbangan HR:</span>
                                <p className="italic text-slate-300 font-semibold">&ldquo;{log.reason}&rdquo;</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= 6. ASET & INVENTARIS SAYA SUB-TAB ================= */}
              {portalTab === 'aset-saya' && (
                <motion.div
                  key="p-tab-aset-saya"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-850 pb-3">
                    <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-emerald-400" /> Daftar Aset &amp; Inventaris Perusahaan Anda
                    </h3>
                    <p className="text-[10px] text-slate-400">Gunakan dan rawat fasilitas peralatan kantor dengan bijak dan laporkan apabila terjadi kerusakan</p>
                  </div>

                  {userAssets.length === 0 ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 italic text-xs leading-relaxed">
                      Anda sedang tidak memegang atau meminjam aset administratif apapun milik perusahaan.<br />
                      <span className="text-[10px] text-slate-600 block mt-2">Semua serah terima barang (laptop, kartu akses RFID, seragam resmi) akan tercatat otomatis di atas setelah diproses operator HR.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="user-assets-list">
                      {userAssets.map(asset => {
                        const todayChar = new Date().toISOString().substring(0, 10);
                        const isPastDue = asset.expectedReturnDate && asset.expectedReturnDate < todayChar;

                        return (
                          <div key={asset.id} className="bg-[#0b1329] border border-slate-850 rounded-2xl p-5 relative overflow-hidden space-y-4" id={`user-asset-card-${asset.id}`}>
                            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl" />
                            
                            {/* Category Indicator */}
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="bg-slate-900 border border-slate-800 text-slate-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                📦 {asset.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                asset.condition === 'Sangat Baik' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                asset.condition === 'Baik' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                Kondisi: {asset.condition}
                              </span>
                            </div>

                            {/* Main descriptions */}
                            <div>
                              <h4 className="text-white text-xs font-extrabold flex items-center gap-2">
                                {asset.category === 'Laptop' && <Laptop className="w-4 h-4 text-emerald-400" />}
                                {asset.category === 'Kartu Akses' && <Key className="w-4 h-4 text-emerald-400" />}
                                {asset.name}
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-gray-400">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Nomor Tag Aset:</span>
                                  <span className="font-mono text-slate-200 font-black">{asset.tagNumber}</span>
                                </div>
                                {asset.serialNumber ? (
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Serial Number:</span>
                                    <span className="font-mono text-slate-300 truncate block" title={asset.serialNumber}>
                                      {asset.serialNumber}
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Status Inventaris:</span>
                                    <span className="text-emerald-400 font-semibold">{asset.status}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Loan Schedule */}
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-[11px] leading-relaxed">
                              <div className="flex justify-between text-slate-400">
                                <span>Tanggal Penyerahan:</span>
                                <span className="text-slate-200 font-mono font-bold">{asset.loanDate || '-'}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Batas Pengembalian:</span>
                                <span className={`font-mono font-extrabold ${isPastDue ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                                  {asset.expectedReturnDate || 'Dinas Berkelanjutan'}
                                </span>
                              </div>

                              {isPastDue && (
                                <div className="text-[10px] bg-red-950/40 text-red-400 font-extrabold p-2 rounded-lg border border-red-900/50 flex items-center gap-1.5 justify-center">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>Melebihi batas waktu! Harap koordinasikan kembali.</span>
                                </div>
                              )}
                            </div>

                            {asset.notes && (
                              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                Alokasi Tugas: {asset.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= 7. DOKUMEN & KONTRAK SAYA SUB-TAB ================= */}
              {portalTab === 'dokumen' && (
                <motion.div
                  key="p-tab-dokumen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-850 pb-3">
                    <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                       <FolderOpen className="w-5 h-5 text-cyan-400" /> Dokumen Kerja &amp; Sertifikat Digital Anda
                    </h3>
                    <p className="text-[10px] text-slate-400">Akses dokumen kontrak kerja resmi, pindaian identitas diri, dan sertifikasi pendukung yang tersimpan aman di database HR.</p>
                  </div>

                  {(!currentUser.documents || currentUser.documents.length === 0) ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                      <FolderOpen className="w-10 h-10 text-slate-705" />
                      <div>
                        <p className="font-extrabold text-slate-400 text-xs text-center">Belum Ada Dokumen Digital</p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed text-center">Saat ini belum ada salinan dokumen digital yang ditautkan ke akun Anda. Hubungi pihak HR/Administrasi untuk melakukan pengunggahan berkas kontrak kerja atau sertifikat pelatihan baru.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {currentUser.documents.map((doc) => {
                        const styleConfig = (() => {
                          switch (doc.type) {
                            case 'Kontrak Kerja':
                              return {
                                border: 'border-l-blue-500',
                                iconColor: 'text-blue-400',
                                badgeBg: 'bg-blue-500/10 text-blue-400'
                              };
                            case 'Sertifikat Pelatihan':
                              return {
                                border: 'border-l-amber-500',
                                iconColor: 'text-amber-400',
                                badgeBg: 'bg-amber-500/10 text-amber-400'
                              };
                            case 'KTP/Identitas':
                            case 'NPWP':
                              return {
                                border: 'border-l-indigo-500',
                                iconColor: 'text-indigo-400',
                                badgeBg: 'bg-indigo-500/10 text-indigo-400'
                              };
                            default:
                              return {
                                border: 'border-l-slate-550',
                                iconColor: 'text-slate-400',
                                badgeBg: 'bg-slate-500/10 text-slate-400'
                              };
                          }
                        })();

                        const downloadUrl = doc.fileUrl && doc.fileUrl !== '#' 
                          ? doc.fileUrl 
                          : 'data:text/plain;charset=utf-8,' + encodeURIComponent(
                              `=== PT BIOMETRIC PORTAL UTAMA INDONESIA ===\n\n` +
                              `SALINAN RESMI DOKUMEN MANDIRI KARYAWAN\n` +
                              `---------------------------------------------\n` +
                              `Nama Dokumen    : ${doc.name}\n` +
                              `Tipe Dokumen    : ${doc.type}\n` +
                              `Karyawan Terkait: ${currentUser.name} (NIP: ${currentUser.id})\n` +
                              `Divisi / Posisi : ${currentUser.department} / ${currentUser.position}\n` +
                              `Tanggal Unggah  : ${doc.uploadDate}\n` +
                              `Ukuran Berkas   : ${doc.fileSize}\n` +
                              `Status Keamanan : Enkripsi Terverifikasi Sistem Portal Mandiri\n\n` +
                              `Catatan Terlampir:\n` +
                              `${doc.notes || 'Tidak ada catatan tambahan.'}\n\n` +
                              `---------------------------------------------\n` +
                              `Diunduh langsung secara mandiri aman oleh Karyawan Terkait.`
                            );

                        return (
                          <div 
                            key={doc.id} 
                            className={`p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all border-l-4 ${styleConfig.border} h-full`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="space-y-1 min-w-0">
                                  <h4 className="text-white text-xs font-extrabold truncate" title={doc.name}>{doc.name}</h4>
                                  <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${styleConfig.badgeBg}`}>
                                    {doc.type}
                                  </span>
                                </div>
                                <div className={`w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0 ${styleConfig.iconColor}`}>
                                  {doc.type === 'Sertifikat Pelatihan' ? <Award className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/40 rounded-xl border border-slate-920 text-[10px] text-slate-400 font-mono">
                                <div>
                                  <span className="text-slate-555 block">Tanggal Unggah:</span>
                                  <span className="text-slate-200 font-extrabold">{doc.uploadDate}</span>
                                </div>
                                <div>
                                  <span className="text-slate-555 block">Ukuran File:</span>
                                  <span className="text-slate-300 font-extrabold">{doc.fileSize}</span>
                                </div>
                              </div>

                              {doc.notes && (
                                <div className="bg-slate-950 border border-slate-920 p-2 text-[10px] rounded-lg">
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Keterangan Administrasi:</span>
                                  <p className="italic text-slate-300 font-medium mt-0.5 leading-relaxed">&ldquo;{doc.notes}&rdquo;</p>
                                </div>
                              )}
                            </div>

                            <div className="pt-3.5 border-t border-slate-850/50 mt-3.5 flex justify-end">
                              <a
                                href={downloadUrl}
                                download={doc.name}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white font-bold rounded-lg text-[10px] tracking-wide uppercase transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> Unduh Dokumen Resmi
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      )}

      {/* SIMULATED CORPORATE EMAIL INBOX DIALOG/MODAL */}
      <AnimatePresence>
        {isEmailModalOpen && sentEmailData && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1329] border border-blue-500/30 rounded-2xl p-6 max-w-lg w-full text-slate-100 shadow-2xl relative"
              id="simulated-email-inbox"
            >
              <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Kotak Masuk SandBox (Maju Terus)</h4>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Simulated Mail Envelope */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs space-y-3 leading-normal relative">
                <div className="absolute right-3 top-3 bg-blue-500/10 text-blue-400 font-mono text-[8px] font-bold px-1 rounded uppercase">
                  SIMULATION
                </div>
                
                <div className="space-y-1 pb-2 border-b border-slate-850 text-[11px] text-slate-400">
                  <p><strong>Dari:</strong> noreply@enterprise-hris.co.id</p>
                  <p><strong>Kepada:</strong> {sentEmailData.to}</p>
                  <p><strong>Subjek:</strong> Kode Token Akses Keamanan Portal Karyawan Anda</p>
                </div>

                <div className="space-y-2 pt-1 font-sans text-slate-300">
                  <p>Halo, <strong>{sentEmailData.employeeName}</strong>,</p>
                  
                  <p>Sistem mendeteksi permintaan token masuk untuk Portal Mandiri Karyawan Anda. Berikut adalah detail verifikasi rahasia Anda:</p>
                  
                  <div className="bg-slate-920 border border-dashed border-blue-500/35 p-3.5 rounded-lg text-center my-3">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider mb-1">KODE TOKEN AKSES ANDA</span>
                    <span className="text-base font-black font-mono text-red-400 select-all tracking-wider">{sentEmailData.token}</span>
                  </div>

                  <p>Atau login secara otomatis dengan sekali klik menggunakan Tautan Cepat berstandar token berikut:</p>
                  
                  <button
                    onClick={() => {
                      setAuthToken(sentEmailData.token);
                      setCurrentUser(employees.find(e => e.email === sentEmailData.to) || null);
                      setIsEmailModalOpen(false);
                      setSuccessMsg(`Otentikasi instan via tautan surat rahasia berhasil!`);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-bold py-2 px-4 rounded-xl text-white my-2 transition-all cursor-pointer shadow shadow-blue-900 inline-block text-center text-xs"
                  >
                    Buka Portal Otomatis Sekarang (Sekali Klik)
                  </button>

                  <p className="text-[9px] text-slate-500 italic">Harap jaga kerahasiaan token akses ini. Tim HR tidak akan pernah meminta kata sandi atau token Anda via pesan langsung.</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-4 py-1.5 rounded-lg border border-slate-700 font-bold cursor-pointer"
                >
                  Tutup Simulator
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Leave Form Modal */}
      <AnimatePresence>
        {printLeave && (() => {
          const emp = employees.find(e => e.id === printLeave.employeeId);
          // Calculate active remaining leave: 12 - approved annual leaves
          const empLeaves = leaves.filter(l => l.employeeId === printLeave.employeeId);
          const approvedCount = empLeaves
            .filter(l => l.type === 'Cuti Tahunan' && l.status === 'Disetujui')
            .reduce((sum, l) => sum + l.duration, 0);
          const sisaCutiBerjalan = Math.max(0, 12 - approvedCount);

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto no-print text-slate-800" id="print-leave-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative border border-slate-200"
                id="printable-leave-form-modal"
              >
                {/* Print Styles Injection */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    /* Hide full app views */
                    body * {
                      visibility: hidden;
                    }
                    /* Show only the targeted print element and its descendants */
                    #printable-document-content, #printable-document-content * {
                      visibility: visible !important;
                    }
                    #printable-document-content {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      padding: 1.5cm !important;
                      background: white !important;
                      color: black !important;
                    }
                    /* Safe margins and layout resets */
                    @page {
                      size: A4 portrait;
                      margin: 0;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Modal close icon */}
                <button
                  type="button"
                  onClick={() => setPrintLeave(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-500 rounded-full transition-all no-print cursor-pointer border-0"
                  title="Tutup Pratampilan"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200 no-print">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Dokumen Surat Pengajuan Cuti (Format A4)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all border-0"
                    >
                      🖨️ Cetak Surat (PDF)
                    </button>
                  </div>
                </div>

                {/* Printable Document Area */}
                <div id="printable-document-content" className="p-4 bg-white rounded-lg border border-slate-100 space-y-6 text-slate-800">
                  {/* Kop Surat / Formal Letter Header */}
                  <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900">
                    <h2 className="text-lg font-black text-slate-900 tracking-wide uppercase">PT. SINAR ABADI DIGITAL</h2>
                    <p className="text-[10px] text-slate-500 font-medium font-sans">Gedung Antigravity, Lantai 12, Kav. 21, Jakarta Selatan</p>
                    <p className="text-[9px] text-slate-400 font-mono">Telp: (021) 5092-2026 | Email: hrd@sinarabadi.co.id</p>
                  </div>

                  {/* Document Title */}
                  <div className="text-center space-y-1 py-1">
                    <h3 className="text-sm font-black text-slate-900 underline tracking-wider uppercase">SURAT PENGAJUAN IZIN &amp; CUTI KARYAWAN</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Nomor Berkas: {printLeave.id}/HR-CUTI/2026</p>
                  </div>

                  {/* Section 1: Employee Details */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-blue-600 pl-2">I. DATA DIRI KARYAWAN</h4>
                    <table className="w-full text-xs text-slate-700 divide-y divide-slate-100">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold w-1/3 text-left">ID Karyawan (NIP)</td>
                          <td className="py-2 text-left">: <span className="font-mono">{printLeave.employeeId}</span></td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Nama Lengkap Karyawan</td>
                          <td className="py-2 text-left">: {printLeave.employeeName}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Unit Kerja / Departemen</td>
                          <td className="py-2 text-left">: {emp?.department || '-'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Jabatan Resmi (Posisi)</td>
                          <td className="py-2 text-left">: {emp?.position || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: Leave Details */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-blue-600 pl-2">II. DETAIL PERMOHONAN CUTI</h4>
                    <table className="w-full text-xs text-slate-700 divide-y divide-slate-100">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold w-1/3 text-left">Kategori Izin / Cuti</td>
                          <td className="py-2 text-left">: <span className="font-bold text-slate-900">{printLeave.type}</span></td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Masa Pengambilan Cuti</td>
                          <td className="py-2 text-left">: <span className="font-bold">{printLeave.startDate}</span> s/d <span className="font-bold">{printLeave.endDate}</span></td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Durasi Cuti Aktual</td>
                          <td className="py-2 text-left">: <span className="font-mono font-black text-rose-600">{printLeave.duration}</span> Hari Kerja <span className="text-[10px] text-slate-400 font-sans italic">(tidak terhitung hari libur)</span></td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-blue-700 font-extrabold text-left">Jatah Sisa Cuti Berjalan</td>
                          <td className="py-2 text-blue-700 font-extrabold text-left">: {sisaCutiBerjalan} Hari Kerja <span className="text-[10px] text-slate-450 font-sans font-medium italic">(per tanggal laporan hari ini)</span></td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-bold text-left">Alasan Penjelasan Detail</td>
                          <td className="py-2 text-left leading-relaxed">: &ldquo;{printLeave.reason}&rdquo;</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Legal Notes / Aturan H-7 */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 leading-relaxed space-y-1">
                    <p className="font-extrabold text-slate-700 flex items-center gap-1">📋 Catatan Perusahaan &amp; Ketentuan Hukum:</p>
                    <p>1. Sesuai regulasi perusahaan, permohonan Cuti Tahunan dan cuti terencana wajib diisi minimal <strong>H-7 sebelum tanggal cuti diambil</strong> demi menjaga stabilitas operasional unit divisi terkait.</p>
                    <p>2. Atas persetujuan pimpinan, jatah cuti tahunan berjalan karyawan akan dipotong otomatis setelah berkas disetujui sepenuhnya oleh pihak HRD.</p>
                  </div>

                  {/* Section 4: Signature Blocks */}
                  <div className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
                      <div className="space-y-14">
                        <p className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Karyawan Pemohon,</p>
                        <div className="space-y-0.5">
                          <p className="underline font-bold text-slate-800">{printLeave.employeeName}</p>
                          <p className="text-[9px] text-slate-400 font-mono">NIP: {printLeave.employeeId}</p>
                        </div>
                      </div>

                      <div className="space-y-14">
                        <p className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Menyetujui, Manajer Divisi,</p>
                        <div className="space-y-0.5">
                          {printLeave.managerApproval === 'Disetujui' ? (
                            <p className="underline font-bold text-blue-700 flex items-center justify-center gap-0.5">
                              ✓ {printLeave.approvedByManager || 'Atasan Divisi'}
                            </p>
                          ) : (
                            <p className="text-slate-350 italic">( Belum Ditandatangani )</p>
                          )}
                          <p className="text-[9px] text-slate-400 font-mono">Status: {printLeave.managerApproval}</p>
                        </div>
                      </div>

                      <div className="space-y-14">
                        <p className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Mengetahui, HRD Manager,</p>
                        <div className="space-y-0.5">
                          {printLeave.status === 'Disetujui' && printLeave.managerApproval === 'Disetujui' ? (
                            <p className="underline font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                              ✓ {printLeave.approvedByHR || 'HR Department'}
                            </p>
                          ) : (
                            <p className="text-slate-350 italic">( Belum Ditandatangani )</p>
                          )}
                          <p className="text-[9px] text-slate-400 font-mono">Status Akhir: {printLeave.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 no-print">
                  <button
                    type="button"
                    onClick={() => setPrintLeave(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-500 cursor-pointer text-slate-600"
                  >
                    Tutup Pratampilan
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all border-0"
                  >
                    Cetak Dokumen
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
