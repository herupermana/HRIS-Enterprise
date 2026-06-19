import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Inbox, Plus, Check, X, FileText, 
  HelpCircle, AlertCircle, Clock, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { Employee, LeaveRequest, Holiday } from '../types';

interface LeaveProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  onUpdateLeaveStatus: (id: string, status: 'Disetujui' | 'Ditolak', role?: 'manager' | 'hr') => void;
  holidays: Holiday[];
  onUpdateHolidays: (holidays: Holiday[]) => void;
}

export default function CutiIzin({ 
  employees, 
  leaves, 
  onAddLeaveRequest, 
  onUpdateLeaveStatus,
  holidays,
  onUpdateHolidays
}: LeaveProps) {
  const [activeSubTab, setActiveSubTab] = useState<'leaves' | 'holidays'>('leaves');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Pending' | 'Disetujui' | 'Ditolak'>('All');
  const [activeRole, setActiveRole] = useState<'manager' | 'hr'>('manager');

  // Submit holiday form states
  const [newHoliday, setNewHoliday] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    type: 'Nasional' as Holiday['type'],
    description: ''
  });

  const getMinDateH7 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [printLeave, setPrintLeave] = useState<LeaveRequest | null>(null);

  // Submit request form states
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'Cuti Tahunan' as LeaveRequest['type'],
    startDate: getMinDateH7(),
    endDate: getMinDateH7(),
    reason: ''
  });

  const leaveTypes: LeaveRequest['type'][] = [
    'Cuti Tahunan',
    'Sakit (Surat Dokter)',
    'Izin Menikah',
    'Izin Khusus',
    'Melahirkan'
  ];

  // Filters
  const filteredLeaves = leaves.filter(l => {
    return selectedTypeFilter === 'All' || l.status === selectedTypeFilter;
  });

  // Real-time overlapping holidays detector for the form
  const formOverlappingHolidays = React.useMemo(() => {
    if (!formData.startDate || !formData.endDate) return [];
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

    return holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate >= start && hDate <= end;
    });
  }, [formData.startDate, formData.endDate, holidays]);

  const calculatedFormDuration = React.useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
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
  }, [formData.startDate, formData.endDate, holidays]);

  // Overall database conflict tracker
  const leavesWithHolidayConflicts = React.useMemo(() => {
    return leaves.map(leave => {
      const lStart = new Date(leave.startDate);
      const lEnd = new Date(leave.endDate);
      const overlaps = holidays.filter(h => {
        const hDate = new Date(h.date);
        return hDate >= lStart && hDate <= lEnd;
      });
      return {
        leave,
        overlaps
      };
    }).filter(item => item.overlaps.length > 0);
  }, [leaves, holidays]);

  const totalSavedDays = React.useMemo(() => {
    return leavesWithHolidayConflicts.reduce((sum, item) => sum + item.overlaps.length, 0);
  }, [leavesWithHolidayConflicts]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.reason.trim()) {
      alert('Harap lengkapi semua kolom wajib!');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      alert('Tanggal berakhir cuti tidak boleh mendahului tanggal mulai!');
      return;
    }

    // STRICT VALIDATION: planned leave must be at least H-7 in advance
    if (
      formData.type === 'Cuti Tahunan' || 
      formData.type === 'Izin Menikah' || 
      formData.type === 'Izin Khusus' || 
      formData.type === 'Melahirkan'
    ) {
      const today = new Date();
      const h7Limit = new Date();
      h7Limit.setDate(today.getDate() + 7);
      h7Limit.setHours(0, 0, 0, 0);

      const chosenStart = new Date(formData.startDate);
      chosenStart.setHours(0, 0, 0, 0);

      if (chosenStart < h7Limit) {
        alert(`Gagal mengajukan ${formData.type}! Pengajuan cuti jenis ini hanya dapat diisi minimal H-7 sebelum tanggal cuti diambil. Tanggal awal cuti tercepat adalah: ${h7Limit.toISOString().split('T')[0]}`);
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

    const matchedEmp = employees.find(emp => emp.id === formData.employeeId);
    if (!matchedEmp) return;

    onAddLeaveRequest({
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: formData.employeeId,
      employeeName: matchedEmp.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration,
      reason: formData.reason,
      status: 'Pending',
      submissionDate: new Date().toISOString().split('T')[0]
    });

    setIsFormOpen(false);
    setFormData({
      employeeId: '',
      type: 'Cuti Tahunan',
      startDate: getMinDateH7(),
      endDate: getMinDateH7(),
      reason: ''
    });
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Disetujui').length;

  return (
    <div className="space-y-6" id="cuti-permits-module-container">
      {/* Sub-tab segment switcher */}
      <div className="flex bg-slate-150/80 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700 font-bold text-xs" id="cuti-subtabs-nav">
        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'leaves' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="btn-subtab-leaves"
        >
          <Inbox className="w-3.5 h-3.5" /> Pengajuan Cuti &amp; Izin
        </button>
        <button
          onClick={() => setActiveSubTab('holidays')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'holidays' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="btn-subtab-holidays"
        >
          <Calendar className="w-3.5 h-3.5" /> Kalender Hari Libur Nasional
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'leaves' ? (
          <motion.div 
            key="subtab-view-leaves"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="cuti-permits-layout"
          >
            {/* List views with filters */}
            <div className="lg:col-span-2 space-y-6" id="leave-logs-column">
              
              {/* Action and Filter buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 shadow-sm p-4 rounded-2xl" id="leave-action-header">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-850 tracking-tight">Manajemen Cuti &amp; Izin Pegawai</h3>
                    <p className="text-[10px] text-slate-400">Persetujuan dispensasi kehadiran absensi</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {/* Type tabs filters */}
                  <div className="flex bg-slate-100 p-1 rounded-xl scrollbar-none overflow-x-auto text-[11px] font-bold">
                    <button 
                      onClick={() => setSelectedTypeFilter('All')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedTypeFilter === 'All' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      Semua
                    </button>
                    <button 
                      onClick={() => setSelectedTypeFilter('Pending')}
                      className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
                        selectedTypeFilter === 'Pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 font-medium'
                      }`}
                    >
                      Pending {pendingCount > 0 && <span className="bg-amber-100 text-amber-800 px-1 rounded-full text-[9px] font-bold">{pendingCount}</span>}
                    </button>
                    <button 
                      onClick={() => setSelectedTypeFilter('Disetujui')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedTypeFilter === 'Disetujui' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      Disetujui
                    </button>
                  </div>

                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition-colors cursor-pointer"
                    id="btn-open-leave-form"
                  >
                    <Plus className="w-4 h-4" /> Ajukan Cuti
                  </button>
                </div>
              </div>

              {/* Role Simulation Bar */}
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" /> Simulasi Hak Akses Persetujuan Bertingkat (Multi-Stage Approval)
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Sistem mewajibkan Pengajuan disetujui oleh <strong>Manajer Divisi</strong> sebelum diteruskan ke <strong>Antrean HRD</strong>.
                  </p>
                </div>
                <div className="flex bg-white border p-1 rounded-xl shadow-sm font-bold text-[11px] gap-1 self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveRole('manager')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeRole === 'manager'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💼 Tahap 1: Manajer Divisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole('hr')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeRole === 'hr'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👤 Tahap 2: HRD Manager
                  </button>
                </div>
              </div>

              {/* Engine Sinkronisasi Real-Time & Deteksi Bentrok Hari Libur Nasional */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50/40 border border-teal-200 p-4 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Real-Time Holiday Sync Engine Active
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-100 font-extrabold px-2 py-0.5 rounded-full">
                    SINKRONISASI OTOMATIS
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                  Sistem mendeteksi <strong className="text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">{leavesWithHolidayConflicts.length} pengajuan cuti</strong> yang beririsan langsung dengan hari libur nasional resmi. Durasi cuti tahunan berjalan telah dipotong otomatis sehingga menghemat jatah cuti karyawan sebanyak total <strong className="text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded font-black">{totalSavedDays} hari kerja</strong>.
                </p>

                {leavesWithHolidayConflicts.length > 0 && (
                  <div className="border-t border-slate-200/60 pt-2 mt-1 space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Daftar Konflik Jadwal Terintegrasi:</span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      {leavesWithHolidayConflicts.map(({ leave, overlaps }) => (
                        <div key={leave.id} className="flex justify-between items-center text-[10px] bg-white border border-slate-100 rounded-lg p-2 hover:border-blue-200 transition-colors">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[50%]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="truncate"><strong>{leave.employeeName}</strong></span>
                            <span className="text-[9px] text-slate-400">({leave.type})</span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
                            <span>{leave.startDate} s/d {leave.endDate}</span>
                            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 border border-rose-100 rounded font-black">
                              Bentrok: {overlaps.map(o => o.name).join(', ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leaves grid or list block */}
              <div className="space-y-4" id="leaves-history-listing">
                {filteredLeaves.length === 0 ? (
                  <div className="bg-white border border-slate-200 text-center p-12 rounded-2xl shadow-sm" id="empty-leaves-display">
                    <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 font-medium text-xs">Belum ada pengajuan cuti dengan status ini dalam sistem.</p>
                  </div>
                ) : (
                  filteredLeaves.map((leave) => {
                    const emp = employees.find(e => e.id === leave.employeeId);
                    
                    return (
                      <div 
                        key={leave.id} 
                        className={`bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-all ${
                          leave.status === 'Pending' ? 'border-l-4 border-l-amber-500' :
                          leave.status === 'Disetujui' ? 'border-l-4 border-l-blue-600' :
                          'border-l-4 border-l-rose-500'
                        }`}
                        id={`leave-card-${leave.id}`}
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-gray-900 text-xs truncate">{leave.employeeName}</span>
                            <span className="text-[10px] text-gray-400">NIP: {leave.employeeId}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700">{leave.type}</span>
                          </div>

                          <p className="text-[11px] text-gray-600 font-medium bg-stone-50 p-2.5 rounded-lg border leading-relaxed">&ldquo;{leave.reason}&rdquo;</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium">
                            <span>Rentang: <strong className="text-slate-700">{leave.startDate} s/d {leave.endDate}</strong></span>
                            <span>Durasi Real: <strong className="text-blue-700 bg-blue-50 px-1 rounded font-bold">{leave.duration} Hari Kerja</strong></span>
                            <span>Diajukan: {leave.submissionDate}</span>
                          </div>

                          {/* Deteksi Bentrok Hari Libur Nasional Per-Karyawan */}
                          {(() => {
                            const lStart = new Date(leave.startDate);
                            const lEnd = new Date(leave.endDate);
                            const cardOverlaps = holidays.filter(h => {
                              const hDate = new Date(h.date);
                              return hDate >= lStart && hDate <= lEnd;
                            });

                            if (cardOverlaps.length === 0) return null;

                            return (
                              <div className="mt-2 text-[10px] bg-rose-50/70 border border-rose-200 text-rose-850 p-2.5 rounded-lg flex items-start gap-1.5 leading-relaxed font-semibold">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-heavy text-rose-700">Terdeteksi Bentrok Kalender Libur:</span>{' '}
                                  Rentang cuti ini beririsan dengan {cardOverlaps.length} hari libur nasional ({cardOverlaps.map(o => `${o.name} [${o.date}]`).join(', ')}). 
                                  <span className="block mt-0.5 text-rose-600 font-bold">Durasi disinkronkan otomatis: Hanya terpotong {leave.duration} hari kerja.</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Stepper Approval */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-500">
                            <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black">Tahapan Persetujuan:</span>
                            
                            {/* Step 1: Manager Divisi */}
                            <div className="flex items-center gap-1.5">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                leave.managerApproval === 'Disetujui' ? 'bg-blue-100 text-blue-700' :
                                leave.managerApproval === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}>
                                {leave.managerApproval === 'Disetujui' ? '✓' : leave.managerApproval === 'Ditolak' ? '✗' : '1'}
                              </span>
                              <span>
                                MGR Divisi: 
                                <strong className={`ml-1 ${
                                  leave.managerApproval === 'Disetujui' ? 'text-blue-600' :
                                  leave.managerApproval === 'Ditolak' ? 'text-rose-600' :
                                  'text-amber-600'
                                }`}>
                                  {leave.managerApproval || 'Pending'}
                                </strong>
                              </span>
                            </div>

                            <span className="text-slate-300 font-bold">&#10230;</span>

                            {/* Step 2: HRD Queue */}
                            <div className="flex items-center gap-1.5">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                leave.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                                leave.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                                leave.managerApproval === 'Pending' ? 'bg-slate-50 text-slate-300 border border-slate-100' :
                                'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}>
                                {leave.status === 'Disetujui' ? '✓' : leave.status === 'Ditolak' ? '✗' : '2'}
                              </span>
                              <span>
                                Antrean HRD: 
                                <strong className={`ml-1 ${
                                  leave.managerApproval === 'Pending' ? 'text-slate-300 font-medium italic' :
                                  leave.status === 'Disetujui' ? 'text-emerald-600' :
                                  leave.status === 'Ditolak' ? 'text-rose-600' :
                                  'text-amber-600'
                                }`}>
                                  {leave.managerApproval === 'Pending' ? 'Menunggu MGR' : (leave.hrApproval || 'Pending')}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CTAs Approve Reject status */}
                        <div className="shrink-0 flex flex-col items-end gap-2.5 w-full md:w-auto pt-2 md:pt-0 md:border-l md:pl-4 border-slate-100">
                          <div className="flex items-center gap-2 w-full justify-end">
                            {leave.status === 'Pending' ? (
                              <div className="flex gap-2 w-full justify-end">
                                {activeRole === 'manager' ? (
                                  <>
                                    {leave.managerApproval === 'Pending' ? (
                                      <>
                                        <button
                                          onClick={() => onUpdateLeaveStatus(leave.id, 'Ditolak', 'manager')}
                                          className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-xl transition-all font-bold text-[10px] cursor-pointer"
                                          id={`btn-reject-leave-manager-${leave.id}`}
                                        >
                                          Tolak (MGR)
                                        </button>
                                        <button
                                          onClick={() => onUpdateLeaveStatus(leave.id, 'Disetujui', 'manager')}
                                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs font-bold text-[10px] hover:shadow transition-all inline-flex items-center gap-1 cursor-pointer"
                                          id={`btn-approve-leave-manager-${leave.id}`}
                                        >
                                          <Check className="w-3 h-3" /> Setujui (MGR)
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded border">
                                        Diproses Manajer ({leave.managerApproval})
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {leave.managerApproval === 'Pending' ? (
                                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                                        <span className="text-[9px] text-slate-500 font-bold tracking-tight">Menunggu Persetujuan MGR</span>
                                      </div>
                                    ) : leave.managerApproval === 'Ditolak' ? (
                                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded border border-rose-100">
                                        ✗ Ditolak oleh Manager
                                      </span>
                                    ) : leave.hrApproval === 'Pending' ? (
                                      <>
                                        <button
                                          onClick={() => onUpdateLeaveStatus(leave.id, 'Ditolak', 'hr')}
                                          className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-xl transition-all font-bold text-[10px] cursor-pointer"
                                          id={`btn-reject-leave-hr-${leave.id}`}
                                        >
                                          Tolak (HRD)
                                        </button>
                                        <button
                                          onClick={() => onUpdateLeaveStatus(leave.id, 'Disetujui', 'hr')}
                                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs font-bold text-[10px] hover:shadow transition-all inline-flex items-center gap-1 cursor-pointer"
                                          id={`btn-approve-leave-hr-${leave.id}`}
                                        >
                                          <Check className="w-3 h-3" /> Setujui (HRD)
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded border">
                                        Diproses HRD ({leave.hrApproval})
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1 justify-end w-full">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                                  leave.status === 'Disetujui' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}>
                                  {leave.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3 text-blue-600" /> : <X className="w-3 h-3 text-rose-600" />} {leave.status}
                                </span>
                                <div className="text-[9px] text-slate-400 font-bold flex flex-col items-end gap-0.5 mt-1 font-mono">
                                  {leave.approvedByManager && <span>MGR: {leave.approvedByManager} ✓</span>}
                                  {leave.approvedByHR && <span>HRD: {leave.approvedByHR} ✓</span>}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Print leave action Button */}
                          <button
                            type="button"
                            onClick={() => setPrintLeave(leave)}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-120 text-amber-800 hover:text-amber-950 border border-amber-200 rounded-xl font-bold text-[10px] flex items-center gap-1 transition-all shadow-2xs shrink-0 self-end cursor-pointer"
                            title="Klik untuk membuka pratampilan cetak form surat permohonan cuti resmi"
                          >
                            <FileText className="w-3 h-3 text-amber-600" />
                            <span>Cetak Dokumen Form</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Guide Card right sidebar */}
            <div className="space-y-6" id="leave-form-column">
              {/* Statistics & leave rules widget */}
              <div id="leave-rules-pad" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Clock className="w-4.5 h-4.5 text-blue-600" /> Aturan Cuti Perusahaan
                </h4>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-slate-500 font-medium">Jatah Cuti Tahunan:</span>
                    <span className="font-extrabold text-slate-900">12 Hari / Tahun</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-slate-500 font-medium">Toleransi Sakit Dokter:</span>
                    <span className="font-extrabold text-blue-700">Gaji Tetap Utuh (100%)</span>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl space-y-1 block">
                    <span className="font-extrabold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Pemotongan Hari Libur:
                    </span>
                    <p className="text-[10px] leading-relaxed text-indigo-700 font-medium">
                      Sistem kami secara otomatis mendeteksi hari pekan (Sabtu/Minggu) serta <strong>Hari Libur Nasional</strong> dalam rentang pengajuan cuti dan <strong>menguranginya</strong> dari pemotongan kuota cuti.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-100 text-amber-900 rounded-xl space-y-1">
                    <span className="font-extrabold text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Ketentuan Sinkronisasi Absen:
                    </span>
                    <p className="text-[10px] leading-relaxed text-amber-700">
                      Karyawan dengan status <strong>&apos;Cuti&apos;</strong> tidak akan dihitung denda mangkir/Alpa pada saat penarikan logs sidik jari mesin Solution X-100C.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="subtab-view-holidays"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="holidays-layout-container"
          >
            {/* Left Column: Holiday list and stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card for Holidays */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-blue-600" /> Kalender Hari Libur Nasional &amp; Bersama
                    </h3>
                    <p className="text-[10px] text-gray-400">Total terdaftar: <strong>{holidays.length} Hari Libur</strong> di database HRIS</p>
                  </div>
                  
                  <button
                    onClick={() => setIsHolidayFormOpen(true)}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Manual
                  </button>
                </div>
                
                <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-100 leading-relaxed font-semibold">
                  💡 Status libur nasional akan secara otomatis menandai absensi karyawan sebagai <strong>'Libur'</strong> dan meniadakan denda mangkir/keterlambatan meskipun logs mesin biometrik Solution kosong. Jika ada logs tap-in, status absensi akan tercatat sebagai <strong>'Hadir (Libur)'</strong> untuk perhitungan insentif lembur.
                </div>
              </div>

              {/* Holidays Table */}
              <div className="bg-white border rounded-2xl p-5 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-gray-500 font-bold block-table text-[10px]">
                        <th className="p-3">Tanggal Libur</th>
                        <th className="p-3">Nama Hari Libur</th>
                        <th className="p-3">Jenis Libur</th>
                        <th className="p-3">Rincian Deskripsi</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...holidays].sort((a,b) => a.date.localeCompare(b.date)).map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 border border-blue-100 rounded font-bold text-[10px]">{h.date}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800">{h.name}</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              h.type === 'Nasional' 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {h.type === 'Nasional' ? 'Libur Nasional' : 'Cuti Bersama'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] italic max-w-xs truncate">
                            {h.description || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus hari libur "${h.name}" dari kalender absensi?`)) {
                                  onUpdateHolidays(holidays.filter(item => item.id !== h.id));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Hari Libur"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Mini Calendar Rules Widget */}
            <div className="space-y-6">
              <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-1.5 pb-2 border-b">
                  <HelpCircle className="w-4.5 h-4.5 text-blue-600" /> Informasi Libur Nasional 2026
                </h4>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Kalender ini memuat daftar hari besar resmi dan cuti bersama di Indonesia. Daftar hari libur ini disinkronisasikan ke dalam:
                </p>

                <ul className="list-disc pl-4 text-[11px] text-slate-650 space-y-1.5 font-medium ml-1">
                  <li>
                    <strong className="text-slate-800">Modul Absensi Biometrik</strong>: Mencegah denda 'Alpa' secara otomatis pada hari tersebut.
                  </li>
                  <li>
                    <strong className="text-slate-800">Modul Cuti Karyawan</strong>: Pengajuan cuti tidak mengurangi jatah cuti karyawan jika masanya melewati hari libur nasional.
                  </li>
                  <li>
                    <strong className="text-slate-800">Portal Mandiri Karyawan</strong>: Karyawan dapat memantau tanggal merah untuk merencanakan cuti tahunan dengan cerdas.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave application form modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
              id="leave-request-form"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Pengajuan Cuti / Izin Baru</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLeaveSubmit} className="p-5 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Karyawan Pemohon *</label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                    id="form-leave-emp-select"
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                    ))}
                  </select>

                  {formData.employeeId && (() => {
                    const empSelected = employees.find(e => e.id === formData.employeeId);
                    const empSelectedLeaves = leaves.filter(l => l.employeeId === formData.employeeId);
                    const approvedAnnualLeavesCount = empSelectedLeaves
                      .filter(l => l.type === 'Cuti Tahunan' && l.status === 'Disetujui')
                      .reduce((sum, l) => sum + l.duration, 0);
                    const sisaCuti = Math.max(0, 12 - approvedAnnualLeavesCount);
                    return (
                      <div className="mt-1.5 px-2.5 py-1.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[10.5px] text-blue-700 flex justify-between items-center">
                        <span className="font-semibold">Sisa Cuti Berjalan Karyawan:</span>
                        <span className="font-extrabold font-mono bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-200">{sisaCuti} Hari</span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Kategori Izin / Cuti *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                  >
                    {leaveTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Mulai Cuti *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Akhir Cuti *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 leading-relaxed">
                  ⚠️ <strong>Aturan H-7 Pengajuan Cuti:</strong> Pengisian tanggal mulai cuti terencana wajib berjarak minimal H-7 sebelum hari H pelaksanaan cuti (Mulai Cuti Tercepat: <strong>{getMinDateH7()}</strong>).
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-800 leading-relaxed">
                  📢 <strong>Kalkulasi Durasi Pintar:</strong> Durasi pengajuan cuti secara otomatis mengecualikan Sabtu, Minggu, serta semua daftar Hari Libur Nasional yang terdaftar di Kalender Absensi.
                </div>

                {/* Live public holiday clash info and duration calculation in form */}
                {formData.startDate && formData.endDate && (
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-[10px] text-teal-900 leading-relaxed space-y-1 font-semibold">
                    <div className="font-bold flex justify-between">
                      <span>Durasi Bersih Cuti (Terhitung):</span>
                      <span className="font-mono bg-teal-100/60 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200 font-extrabold">{calculatedFormDuration} Hari Kerja</span>
                    </div>
                    {formOverlappingHolidays.length > 0 ? (
                      <div className="text-rose-700 bg-rose-50/50 border border-rose-150 p-1.5 rounded mt-1.5 space-y-1">
                        <p className="font-bold">⚠️ Bentrok dengan Libur Nasional Terdeteksi ({formOverlappingHolidays.length} Hari):</p>
                        <ul className="list-disc pl-3 text-[9px] font-bold space-y-0.5 text-rose-600">
                          {formOverlappingHolidays.map(h => (
                            <li key={h.id}>{h.name} ({h.date})</li>
                          ))}
                        </ul>
                        <p className="text-[9px] text-emerald-600 font-bold">Sinkronisasi Aktif: Hari-hari tersebut dikecualikan secara real-time (kuota aman!).</p>
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-650">Tidak beririsan dengan hari libur nasional pada rentang tanggal ini.</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-slate-755 font-bold mb-1">Keterangan / Alasan Cuti *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.reason}
                    placeholder="Tuliskan keterangan detail keperluan Anda..."
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
                    id="form-leave-reason-textarea"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer"
                    id="btn-save-leave-form"
                  >
                    Kirim Berkas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Holiday manually add pop modal */}
      <AnimatePresence>
        {isHolidayFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
              id="holiday-add-modal"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Tambah Hari Libur Nasional / Cuti Bersama</h3>
                <button
                  onClick={() => setIsHolidayFormOpen(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newHoliday.name.trim()) {
                    alert('Harap masukkan nama hari libur!');
                    return;
                  }
                  const duplicate = holidays.some(h => h.date === newHoliday.date);
                  if (duplicate) {
                    alert('Sudah ada tanggal libur yang sama terdaftar di sistem!');
                    return;
                  }
                  
                  const created: Holiday = {
                    id: `HOL-${Date.now()}`,
                    date: newHoliday.date,
                    name: newHoliday.name.trim(),
                    type: newHoliday.type,
                    description: newHoliday.description.trim()
                  };
                  
                  onUpdateHolidays([...holidays, created]);
                  setIsHolidayFormOpen(false);
                  setNewHoliday({
                    date: new Date().toISOString().split('T')[0],
                    name: '',
                    type: 'Nasional',
                    description: ''
                  });
                }}
                className="p-5 space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Tanggal Hari Libur *</label>
                  <input
                    type="date"
                    required
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nama Hari Libur *</label>
                  <input
                    type="text"
                    required
                    value={newHoliday.name}
                    placeholder="Contoh: Tahun Baru Imlek, Nyepi..."
                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Kategori / Jenis Libur *</label>
                  <select
                    value={newHoliday.type}
                    onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as any })}
                    className="w-full bg-gray-50 border p-2.5 rounded-lg text-gray-800 font-semibold shadow-sm"
                  >
                    <option value="Nasional">Hari Libur Nasional (Tanggal Merah)</option>
                    <option value="Bersama">Cuti Bersama Perusahaan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Keterangan Singkat</label>
                  <textarea
                    rows={2}
                    value={newHoliday.description}
                    placeholder="Tulis rincian rilis SKB menteri atau info khusus..."
                    onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsHolidayFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-500 cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer"
                  >
                    Simpan Hari Libur
                  </button>
                </div>
              </form>
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto no-print" id="print-leave-modal-overlay">
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
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-500 rounded-full transition-all no-print cursor-pointer"
                  title="Tutup Pratampilan"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200 no-print">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Dokumen Surat Pengajuan Cuti (Format A4)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      🖨️ Cetak Surat (PDF)
                    </button>
                  </div>
                </div>

                {/* Printable Document Area */}
                <div id="printable-document-content" className="p-4 bg-white rounded-lg border border-slate-100 space-y-6">
                  {/* Kop Surat / Formal Letter Header */}
                  <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900">
                    <h2 className="text-lg font-black text-slate-900 tracking-wide uppercase">PT. SINAR ABADI DIGITAL</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Gedung Antigravity, Lantai 12, Kav. 21, Jakarta Selatan</p>
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
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold w-1/3">ID Karyawan (NIP)</td>
                          <td className="py-2">: <span className="font-mono">{printLeave.employeeId}</span></td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Nama Lengkap Karyawan</td>
                          <td className="py-2">: {printLeave.employeeName}</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Unit Kerja / Departemen</td>
                          <td className="py-2">: {emp?.department || '-'}</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Jabatan Resmi (Posisi)</td>
                          <td className="py-2">: {emp?.position || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: Leave Details */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-blue-600 pl-2">II. DETAIL PERMOHONAN CUTI</h4>
                    <table className="w-full text-xs text-slate-700 divide-y divide-slate-100">
                      <tbody>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold w-1/3">Kategori Izin / Cuti</td>
                          <td className="py-2">: <span className="font-bold text-slate-900">{printLeave.type}</span></td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Masa Pengambilan Cuti</td>
                          <td className="py-2">: <span className="font-bold">{printLeave.startDate}</span> s/d <span className="font-bold">{printLeave.endDate}</span></td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Durasi Cuti Aktual</td>
                          <td className="py-2">: <span className="font-mono font-black text-rose-600">{printLeave.duration}</span> Hari Kerja <span className="text-[10px] text-slate-400 font-sans italic">(tidak terhitung hari libur)</span></td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold text-blue-700 font-extrabold">Jatah Sisa Cuti Berjalan</td>
                          <td className="py-2 text-blue-700 font-extrabold">: {sisaCutiBerjalan} Hari Kerja <span className="text-[10px] text-slate-450 font-sans font-medium italic">(per tanggal laporan hari ini)</span></td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="py-2 font-bold">Alasan Penjelasan Detail</td>
                          <td className="py-2 leading-relaxed">: &ldquo;{printLeave.reason}&rdquo;</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Legal Notes / Aturan H-7 */}
                  <div className="p-3 bg-slate-50 rounded-xl border text-[10px] text-slate-600 leading-relaxed space-y-1">
                    <p className="font-extrabold text-slate-700 flex items-center gap-1">📋 Catatan Perusahaan &amp; Ketentuan Hukum:</p>
                    <p>1. Sesuai regulasi perusahaan, permohonan Cuti Tahunan dan cuti terencana wajib diisi minimal <strong>H-7 sebelum tanggal cuti diambil</strong> demi menjaga stabilitas operasional unit divisi terkait.</p>
                    <p>2. Atas persetujuan pimpinan, jatah cuti tahunan berjalan karyawan akan dipotong otomatis setelah berkas disetujui sepenuhnya oleh pihak HRD.</p>
                  </div>

                  {/* Section 4: Signature Blocks */}
                  <div className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
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
                            <p className="text-slate-300 italic">( Belum Ditandatangani )</p>
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
                            <p className="text-slate-300 italic">( Belum Ditandatangani )</p>
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
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-500 cursor-pointer"
                  >
                    Tutup Pratampilan
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
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
