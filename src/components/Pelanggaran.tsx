import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Plus, Search, Filter, Trash2, 
  X, Check, Printer, Calendar, FileText, AlertTriangle, HelpCircle,
  Building, User, Clock, AlertCircle, FileCheck, Coins, RefreshCw
} from 'lucide-react';
import { Employee, AttendanceRecord, ViolationRecord } from '../types';

interface PelanggaranProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  violations: ViolationRecord[];
  onAddViolation: (violation: ViolationRecord) => void;
  onUpdateViolationStatus: (id: string, status: ViolationRecord['status']) => void;
  onDeleteViolation: (id: string) => void;
  onAddAuditLog: (action: string, details: string, status?: 'Sukses' | 'Info' | 'Peringatan') => void;
}

export default function Pelanggaran({
  employees = [],
  attendance = [],
  violations = [],
  onAddViolation,
  onUpdateViolationStatus,
  onDeleteViolation,
  onAddAuditLog
}: PelanggaranProps) {
  // Navigation filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Modal open states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedViolationForLetter, setSelectedViolationForLetter] = useState<ViolationRecord | null>(null);

  // Form states
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formSeverity, setFormSeverity] = useState<'SP1' | 'SP2' | 'SP3'>('SP1');
  const [formViolationType, setFormViolationType] = useState<ViolationRecord['violationType']>('Keterlambatan Berulang');
  const [formIssuedDate, setFormIssuedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [formExpiryDate, setFormExpiryDate] = useState(() => {
    // Set 6 months ahead as default Expiry
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [formDescription, setFormDescription] = useState('');
  const [formPunishmentEffect, setFormPunishmentEffect] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Automatically update suggested consequence on severe level change
  React.useEffect(() => {
    if (formSeverity === 'SP1') {
      setFormPunishmentEffect('Penanggihan Bonus Kinerja Bulanan & Potongan Skorsing Gaji Proporsional Menit Terlambat.');
    } else if (formSeverity === 'SP2') {
      setFormPunishmentEffect('Pemotongan Uang Tunjangan Operasional (Makan & Transportasi) selama 1-3 bulan.');
    } else {
      setFormPunishmentEffect('Skorsing Khusus Dirumahkan dan Penundaan Kenaikan Jabatan (Promosi) selama minimal 12 bulan.');
    }
  }, [formSeverity]);

  // Adjust expiry automatically when issued date changes (default 6 months expiry range)
  const handleIssuedDateChange = (val: string) => {
    setFormIssuedDate(val);
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + 6);
        setFormExpiryDate(d.toISOString().split('T')[0]);
      }
    } catch (e) {
      // safe fallback
    }
  };

  // Get selected employee details for biometric audit triggers
  const activeSelectedEmployee = useMemo(() => {
    return employees.find(e => e.id === formEmployeeId) || null;
  }, [formEmployeeId, employees]);

  // Real-time Bio Audit: Search attendance records of selected employee to justify SP
  const biometricAuditData = useMemo(() => {
    if (!formEmployeeId) return null;
    const empLogs = attendance.filter(log => log.employeeId === formEmployeeId);
    
    const countLates = empLogs.filter(log => log.status === 'Terlambat').length;
    const countAlpa = empLogs.filter(log => log.status === 'Alpa').length;
    const countEarlyOut = empLogs.filter(log => log.status === 'Pulang Cepat').length;
    
    // Total minutes late
    const totalLateMinutes = empLogs.reduce((sum, log) => sum + (log.lateMinutes || 0), 0);

    return {
      totalLogs: empLogs.length,
      lates: countLates,
      alpas: countAlpa,
      earlyOuts: countEarlyOut,
      totalLateMinutes
    };
  }, [formEmployeeId, attendance]);

  // Calculate unique departments from employee list for filtering options
  const departmentsList = useMemo(() => {
    const list = new Set(employees.map(e => e.department));
    return ['All', ...Array.from(list)];
  }, [employees]);

  // Filtering Logic
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchSearch = v.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchSeverity = selectedSeverity === 'All' ? true : v.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'All' ? true : v.status === selectedStatus;
      const matchDept = selectedDept === 'All' ? true : v.department === selectedDept;

      return matchSearch && matchSeverity && matchStatus && matchDept;
    });
  }, [violations, searchTerm, selectedSeverity, selectedStatus, selectedDept]);

  // Submit Handler for recording new SP sanksi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId) {
      alert('Silakan pilih karyawan terlebih dahulu.');
      return;
    }

    const targetEmp = employees.find(e => e.id === formEmployeeId);
    if (!targetEmp) return;

    const newViolationId = `SKS-${Date.now().toString().slice(-4)}`;
    
    const newRecord: ViolationRecord = {
      id: newViolationId,
      employeeId: formEmployeeId,
      employeeName: targetEmp.name,
      department: targetEmp.department,
      violationType: formViolationType,
      severity: formSeverity,
      issuedDate: formIssuedDate,
      expiryDate: formExpiryDate,
      description: formDescription || `Melanggar kebijakan internal terkait ${formViolationType.toLowerCase()}.`,
      status: 'Aktif',
      approvedBy: 'herupermana.vps@gmail.com', // Logged-in admin active
      punishmentEffect: formPunishmentEffect,
      notes: formNotes
    };

    onAddViolation(newRecord);
    setIsFormOpen(false);

    // Reset Form
    setFormEmployeeId('');
    setFormDescription('');
    setFormNotes('');

    onAddAuditLog(
      'Tambah Sanksi Disiplin',
      `Menerbitkan surat peringatan ${formSeverity} (${newViolationId}) kepada ${targetEmp.name} (${formEmployeeId}) atas tindak '${formViolationType}'.`,
      'Sukses'
    );
  };

  // Status Badge Helper
  const getSeverityBadge = (sev: 'SP1' | 'SP2' | 'SP3') => {
    if (sev === 'SP3') {
      return (
        <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded font-black border border-rose-250 uppercase tracking-widest animate-pulse">
          Extreme: SP3
        </span>
      );
    }
    if (sev === 'SP2') {
      return (
        <span className="bg-amber-100 text-amber-805 text-[10px] px-2 py-0.5 rounded font-black border border-amber-250 uppercase tracking-widest">
          Medium: SP2
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-900 text-[10px] px-2 py-0.5 rounded font-extrabold border border-yellow-250 uppercase tracking-wider">
        Standard: SP1
      </span>
    );
  };

  // Main KPI summary calculations
  const statsOverview = useMemo(() => {
    const active = violations.filter(v => v.status === 'Aktif');
    const sp1 = active.filter(v => v.severity === 'SP1').length;
    const sp2 = active.filter(v => v.severity === 'SP2').length;
    const sp3 = active.filter(v => v.severity === 'SP3').length;
    const expired = violations.filter(v => v.status === 'Kedaluwarsa' || v.status === 'Dicabut').length;

    return {
      activeTotal: active.length,
      sp1,
      sp2,
      sp3,
      expired
    };
  }, [violations]);

  // Handle print preview launch
  const handleOpenLetterDraft = (violation: ViolationRecord) => {
    setSelectedViolationForLetter(violation);
    setIsLetterModalOpen(true);
  };

  return (
    <div className="space-y-6" id="disciplinary-management-module">
      
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs" id="disc-header">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Manajemen Penertiban &amp; Sanksi Disiplin
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Portal pencatatan, pengawasan surat peringatan (SP1, SP2, SP3) terpadu dengan sinkronisasi biometrik logs Solution X-100C.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 hover:shadow"
          id="btn-add-violation"
        >
          <Plus className="w-4 h-4" /> Catat Sanksi Baru (SP)
        </button>
      </div>

      {/* Bento Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="disc-stats-bento">
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          <p className="text-[10px] text-slate-405 font-bold tracking-wider uppercase block">TOTAL SP AKTIF</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono text-rose-400">{statsOverview.activeTotal}</span>
            <span className="text-[10px] text-slate-400 font-medium">Beban Berkala</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-rose-350 font-bold bg-rose-550/15 px-2 py-0.5 rounded-md inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-455 animate-ping" />
            Tinjauan Aktif
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">AKTIF SP1</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black font-mono text-yellow-600">{statsOverview.sp1}</span>
            <span className="text-[10px] text-slate-400">staff</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">Teguran Pertama</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">AKTIF SP2</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black font-mono text-amber-600">{statsOverview.sp2}</span>
            <span className="text-[10px] text-slate-400">staff</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">Teguran Keras Kedua</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs border-r-rose-200">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">AKTIF SP3</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black font-mono text-rose-600">{statsOverview.sp3}</span>
            <span className="text-[10px] text-rose-405 font-bold text-rose-500">Kritis</span>
          </div>
          <p className="text-[9px] text-rose-500 mt-2 font-black">Skorsing/PHK Stage</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">TIDAK AKTIF / PINDAH</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black font-mono text-emerald-600">{statsOverview.expired}</span>
            <span className="text-[10px] text-slate-400">kasus</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-bold mt-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Pembinaan Sukses
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden" id="disc-table-area">
        
        {/* Interactive Filtering Header */}
        <div className="p-5 border-b border-slate-100 space-y-4" id="disc-filter-controls">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Saring &amp; Cari Histori Sanksi
            </h3>
            
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="font-bold text-slate-500">{filteredViolations.length}</span> sanksi ditemukan
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIP, nama, atau ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden lg:block uppercase shrink-0">LEVEL:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer text-slate-700"
              >
                <option value="All">Semua Tingkat Sanksi</option>
                <option value="SP1">Surat Peringatan 1 (SP1)</option>
                <option value="SP2">Surat Peringatan 2 (SP2)</option>
                <option value="SP3">Surat Peringatan 3 (SP3)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden lg:block uppercase shrink-0">STATUS:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer text-slate-700"
              >
                <option value="All">Semua Status Hukuman</option>
                <option value="Aktif">Aktif (Kena Sanksi)</option>
                <option value="Kedaluwarsa">Kedaluwarsa (Expired)</option>
                <option value="Dicabut">Dicabut (Diberishkan)</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden lg:block uppercase shrink-0">DIVISI:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer text-slate-700"
              >
                <option value="All">Semua Departemen</option>
                {departmentsList.filter(d => d !== 'All').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List Table / Cards */}
        {filteredViolations.length === 0 ? (
          <div className="p-12 text-center" id="disc-empty-view">
            <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Sanksi Pelanggaran Cocok</h4>
            <p className="text-xs text-slate-400 mt-1">Harap sesuaikan kembali parameter pencarian atau filter Anda di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="disc-table">
            <table className="w-full text-left text-xs bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-widest select-none">
                  <th className="p-4">ID &amp; KARYAWAN</th>
                  <th className="p-4">TINGKATAN</th>
                  <th className="p-4">JENIS PELANGGARAN</th>
                  <th className="p-4">MASA SANKSI (TMT s.d Selesai)</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-rose-600">PINALTI REMUNERASI</th>
                  <th className="p-4 text-center">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors" id={`row-violation-${v.id}`}>
                    {/* Employee Profile and NIP Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                          {v.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 hover:text-rose-600 transition-colors cursor-pointer">{v.employeeName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{v.employeeId} · {v.department}</p>
                        </div>
                      </div>
                    </td>

                    {/* Severity level badge */}
                    <td className="p-4 font-mono">{getSeverityBadge(v.severity)}</td>

                    {/* Violation logs Type and description */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{v.violationType}</span>
                        <p className="text-[10px] text-slate-450 mt-1 line-clamp-1 truncate max-w-xs">{v.description}</p>
                      </div>
                    </td>

                    {/* Issued and expiry date tracking */}
                    <td className="p-4 text-slate-650 font-mono">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700">{v.issuedDate}</p>
                        <p className="text-[10px] text-slate-400">s/d {v.expiryDate}</p>
                      </div>
                    </td>

                    {/* Current status indicator */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase border ${
                        v.status === 'Aktif' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        v.status === 'Dicabut' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    {/* Punishment impact */}
                    <td className="p-4 text-slate-600 text-[11px] font-medium max-w-xs truncate" title={v.punishmentEffect}>
                      {v.punishmentEffect ? (
                        <div className="flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 rounded-md px-2 py-1 border border-rose-100/50 text-[10px] whitespace-pre-wrap">
                          <Coins className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{v.punishmentEffect}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-light">-</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Draft print letter */}
                        <button
                          onClick={() => handleOpenLetterDraft(v)}
                          className="bg-white hover:bg-slate-50 border border-slate-205 p-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer text-[10px]"
                          title="Cetak/Lihat Surat Peringatan Resmi (Mock)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Revoke / Change state dropdown inside actions */}
                        <select
                          value={v.status}
                          onChange={(e) => onUpdateViolationStatus(v.id, e.target.value as ViolationRecord['status'])}
                          className="bg-white border border-slate-205 text-[10px] font-bold px-1 py-1 rounded-lg focus:outline-none cursor-pointer text-slate-600"
                          title="Ubah status sanksi"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Kedaluwarsa">Expired</option>
                          <option value="Dicabut">Cabut SP</option>
                        </select>

                        {/* Delete action */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus catatan sanksi ${v.id} milik ${v.employeeName}? Semua sanksi aktif pada profil akan terpengaruh.`)) {
                              onDeleteViolation(v.id);
                              onAddAuditLog('Hapus Sanksi', `Menghapus catatan sanksi ${v.id} untuk ${v.employeeName}.`, 'Peringatan');
                            }
                          }}
                          className="hover:bg-rose-50 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus data secara permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-start gap-3 text-xs text-slate-705" id="disc-notice-note">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="font-extrabold text-amber-900 block">SOP Ketentuan Masa Berlaku Surat Peringatan:</span>
          Sesuai Peraturan PT Biometric Portal Utama d.h No. 12/HRM/2026, sanksi Surat Peringatan 1 (SP1), 2 (SP2), dan 3 (SP3) berlaku secara hukum selama <strong>6 (enam) bulan</strong> sejak tanggal ditandatangani. Jika karyawan yang bersangkutan melakukan pelanggaran yang sama atau lainnya dalam masa pembinaan, kualifikasi SP otomatis naik tingkat berturut-turut demi hukum.
        </div>
      </div>

      {/* MODAL 1: FORM CATAT SANKSI BARU (SLIDEOUT PANEL) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" id="add-violation-form-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              
              {/* Head */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-455" /> Terbitkan Dokumen Surat Peringatan
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Isi seluruh justifikasi dan sanksi pembatasan hak karyawan</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                
                {/* 1. Select Employee */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">1. Pilih Karyawan Pelanggar *</label>
                  <select
                    required
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 font-medium cursor-pointer"
                  >
                    <option value="">-- Pilih Anggota Staff --</option>
                    {employees.filter(e => e.status === 'Aktif').map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.id}) · {e.department}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reactively Render Biometric Integrity Check of Selected Employee */}
                {formEmployeeId && activeSelectedEmployee && biometricAuditData && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-rose-50/50 border border-rose-150 rounded-xl space-y-2 text-[10px] relative overflow-hidden"
                  >
                    <div className="absolute right-2 top-2 opacity-5">
                      <Clock className="w-10 h-10 text-rose-500" />
                    </div>
                    
                    <h5 className="font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" /> INTEGRITAS BIOMETRIK LOGS (SOLUTION X-100C)
                    </h5>
                    
                    <p className="text-[10px] text-slate-500 font-medium">
                      Menyaring seluruh log logs sidik jari digital untuk karyawan <strong className="text-slate-800">{activeSelectedEmployee.name}</strong>:
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center mt-2 font-mono">
                      <div className="bg-white p-1.5 rounded border border-rose-100">
                        <span className="text-[8px] text-slate-400 block font-sans">TERLAMBAT</span>
                        <strong className="text-sm font-extrabold text-rose-600">{biometricAuditData.lates}x</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-rose-100">
                        <span className="text-[8px] text-slate-400 block font-sans">MANGKIR (ALPA)</span>
                        <strong className="text-sm font-extrabold text-red-600">{biometricAuditData.alpas}x</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-rose-100">
                        <span className="text-[8px] text-slate-400 block font-sans font-medium">TOT TERLAMBAT</span>
                        <strong className="text-xs font-black text-rose-700">{biometricAuditData.totalLateMinutes} <span className="text-[8px] font-normal font-sans">menit</span></strong>
                      </div>
                    </div>

                    <div className="text-[9px] text-rose-700 font-medium italic mt-1 bg-white p-1.5 rounded border border-rose-100 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />
                      <span>
                        Penyimpangan toleransi checkout sebelum jam kantor: <strong>{biometricAuditData.earlyOuts} kali</strong> terdeteksi. Gunakan data presensi biometrik ini sebagai dasar sanksi tertulis.
                      </span>
                    </div>

                  </motion.div>
                )}

                {/* 2. Severity level and Violation Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">2. Tingkat Sanksi *</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-205 px-3 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="SP1">SP1 (Peringatan Kesatu)</option>
                      <option value="SP2">SP2 (Peringatan Kedua)</option>
                      <option value="SP3">SP3 (Peringatan Ketiga)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">3. Kategori Aturan *</label>
                    <select
                      value={formViolationType}
                      onChange={(e) => setFormViolationType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-205 px-3 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      <option value="Keterlambatan Berulang">Keterlambatan Berulang</option>
                      <option value="Mangkir Tanpa Kabar">Mangkir Tanpa Kabar</option>
                      <option value="Pulang Cepat Tanpa Izin">Pulang Cepat Tanpa Izin</option>
                      <option value="Indisipliner">Indisipliner Kerja</option>
                      <option value="Melanggar SOP">Pelanggaran SOP PT</option>
                      <option value="Peralatan Rusak">Penyalahgunaan Fasilitas</option>
                      <option value="Lainnya">Lainnya/Kustom</option>
                    </select>
                  </div>
                </div>

                {/* 3. Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">4. Mulai Berlaku sanksi (TMT) *</label>
                    <input
                      type="date"
                      required
                      value={formIssuedDate}
                      onChange={(e) => handleIssuedDateChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700">5. Kedaluwarsa Hukum *</label>
                    <input
                      type="date"
                      required
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* 4. Consequence Penalty */}
                <div className="space-y-1.5">
                  <label className="block font-extrabold text-rose-800 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-rose-600" /> 6. Konsekuensi Potongan Penggajian &amp; Hak Karyawan
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formPunishmentEffect}
                    onChange={(e) => setFormPunishmentEffect(e.target.value)}
                    placeholder="Contoh: Pemotongan bonus kinerja 100%, pembatasan lembur, skorsing dsb..."
                    className="w-full bg-slate-50 border border-rose-200/60 p-3 rounded-xl text-xs leading-relaxed font-semibold focus:ring-1 focus:ring-rose-500 text-rose-950 focus:border-rose-500"
                  />
                  <span className="text-[10px] text-slate-400 leading-snug block">
                    Penalti ini akan secara visual diperingatkan pada modul slip penggajian bulan berjalan.
                  </span>
                </div>

                {/* 5. Description */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">7. Deskripsi Detail Pelanggaran / Kronologi *</label>
                  <textarea
                    required
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ceritakan kronologi lengkap pelanggaran serta rincian data biometrik logs yang melatarbelakangi penerbitan..."
                    className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl text-xs leading-relaxed"
                  />
                </div>

                {/* 6. Notes */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">8. Catatan Internal HR / Pembinaan Tambahan</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Masukkan sanksi bimbingan atau persetujuan saksi..."
                    className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl text-xs"
                  />
                </div>

              </form>

              {/* Foot Actions */}
              <div className="p-4 border-t border-slate-100 flex gap-2 justify-end bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-205 bg-white text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" /> Terbitkan SP Resmi
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PRISTINE OFFICIAL CORRESPONDENCE PREVIEW (DRAFT SP PRINT PREVIEW) */}
      <AnimatePresence>
        {isLetterModalOpen && selectedViolationForLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="warning-letter-print-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLetterModalOpen(false)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            />

            {/* Print Document */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl text-xs">
                <span className="font-extrabold tracking-wider flex items-center gap-2 uppercase">
                  <Printer className="w-4 h-4 text-emerald-400" /> Print-Dokumen Template Preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                  </button>
                  <button
                    onClick={() => setIsLetterModalOpen(false)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Printable Correspondence Letter */}
              <div className="flex-1 overflow-y-auto p-10 font-serif leading-relaxed text-slate-900" id="printable-corresp-document">
                <div className="max-w-xl mx-auto space-y-6">
                  
                  {/* Company Letterhead */}
                  <div className="text-center border-b-2 border-slate-950 pb-5 space-y-1 select-none">
                    <h1 className="text-lg font-bold tracking-widest font-sans text-slate-900 uppercase">PT BIOMETRIC PORTAL UTAMA</h1>
                    <p className="text-[10px] font-sans text-slate-500 font-medium">Mega Tower lantai 9, Kav. 55-57, Kuningan Barat, Jakarta Selatan, 12950</p>
                    <p className="text-[9px] font-sans text-blue-600 font-bold">Telp: (021) 5088-2900 · Fax: (021) 5088-2901 · Email: hrm@enterprise.co.id</p>
                  </div>

                  {/* Letter Title */}
                  <div className="text-center space-y-1 pt-2 select-none">
                    <h3 className="text-sm font-bold underline uppercase tracking-wider font-sans text-slate-900">
                      SURAT PERINGATAN {selectedViolationForLetter.severity === 'SP1' ? 'KESATU (SP-1)' : selectedViolationForLetter.severity === 'SP2' ? 'KEDUA (SP-2)' : 'KETIGA (SP-3)'}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">Nomor: {selectedViolationForLetter.id}/HRD-SP/BPU/{selectedViolationForLetter.issuedDate.split('-')[1]}/{selectedViolationForLetter.issuedDate.split('-')[0]}</p>
                  </div>

                  {/* Employee Details Inside Document Block */}
                  <div className="space-y-2 pt-4 text-xs font-sans">
                    <p className="font-sans">Surat Peringatan ini diterbitkan dan diberikan kepada karyawan di bawah ini:</p>
                    <table className="w-full text-left" id="letter-employee-data">
                      <tbody>
                        <tr>
                          <td className="w-32 py-1 font-bold text-slate-500">Nama Lengkap</td>
                          <td className="py-1">: <strong>{selectedViolationForLetter.employeeName}</strong></td>
                        </tr>
                        <tr>
                          <td className="py-1 font-bold text-slate-500">Nomor Induk Pegawai</td>
                          <td className="py-1">: <span className="font-mono">{selectedViolationForLetter.employeeId}</span></td>
                        </tr>
                        <tr>
                          <td className="py-1 font-bold text-slate-500">Divisi / Departemen</td>
                          <td className="py-1">: {selectedViolationForLetter.department}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-bold text-slate-500">Status Tindakan</td>
                          <td className="py-1">: <span className="text-rose-600 font-extrabold">Aktif Terikat Surat Peringatan ({selectedViolationForLetter.severity})</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Description / Content Body */}
                  <div className="space-y-4 text-xs font-serif leading-relaxed text-justify">
                    <p>
                      <strong>Menimbang:</strong> Bahwa berdasarkan hasil evaluasi data kehadiran, integrasi biometric log, dan laporan kedisiplinan kerja harian karyawan, yang bersangkutan telah melakukan pelanggaran disiplin kerja yaitu berupa tindakan: <strong className="font-sans text-rose-700 bg-rose-50 px-1 py-0.5 border border-rose-100 rounded">{selectedViolationForLetter.violationType}</strong>.
                    </p>
                    <p>
                      <strong>Fakta Pelanggaran:</strong> {selectedViolationForLetter.description} {selectedViolationForLetter.notes && `Adapun catatan pendukung pembinaan: ${selectedViolationForLetter.notes}.`}
                    </p>
                    {selectedViolationForLetter.punishmentEffect && (
                      <p className="p-3 bg-rose-50/50 border border-slate-200 text-rose-900 border-l-4 border-l-rose-500 font-sans text-[11px] leading-relaxed">
                        <strong>DENGAN KONSEKUENSI REMUNERASI / SANKSI FISKAL:</strong><br />
                        {selectedViolationForLetter.punishmentEffect} Sanksi berlaku terhitung sejak tanggal diterbitkannya surat ini sampai dengan 6 (enam) bulan ke depan.
                      </p>
                    )}
                    <p>
                      Surat Peringatan ini bertujuan agar karyawan yang bersangkutan menyadari kelalaiannya, memperbaiki etos kerja, serta tidak melakukan tindakan indisipliner apa pun di masa mendatang yang dapat berakibat pada pemutusan hubungan kerja (PHK) sesuai Ketentuan Ketenagakerjaan PT Biometric Portal Utama.
                    </p>
                  </div>

                  {/* Date and Signatures */}
                  <div className="pt-8 flex justify-between font-sans text-xs select-none">
                    <div className="space-y-12">
                      <p>Penerima Peringatan,</p>
                      <div className="border-t border-slate-600 pt-1.5 w-36 text-center">
                        <p className="font-bold">{selectedViolationForLetter.employeeName}</p>
                        <p className="text-[9px] text-slate-400">Staff Karyawan</p>
                      </div>
                    </div>

                    <div className="space-y-12 text-right relative">
                      {/* Premium Badge Signature stamp overlay */}
                      <div className="absolute right-4 -top-3 opacity-15 rotate-12 scale-110 pointer-events-none">
                        <div className="border-4 border-double border-red-600 p-2 text-center text-red-600 font-extrabold text-[10px] w-28 uppercase rounded">
                          PT BIOMETRIC<br />HRD APPROVED
                        </div>
                      </div>

                      <p>Jakarta, {selectedViolationForLetter.issuedDate}<br />Direktorat Sumber Daya Manusia,</p>
                      <div className="border-t border-slate-600 pt-1.5 w-44 text-right inline-block">
                        <p className="font-bold text-slate-800">Siti Aminah, M.Psi.</p>
                        <p className="text-[9px] text-slate-400">HR Director PT BBP</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Close Button footer in dialog */}
              <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsLetterModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800 transition"
                >
                  Tutup Pratinjau
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
