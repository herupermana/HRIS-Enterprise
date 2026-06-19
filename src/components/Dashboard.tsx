import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, CheckCircle, Clock, Calendar, 
  DollarSign, Activity, AlertCircle, TrendingUp,
  History, Trash2, Search, Sparkles, Lightbulb, RefreshCw, Copy, Check, Coins,
  PieChart as PieChartIcon, Mail, FileText, Bell, ShieldAlert, Award, UserPlus, Cpu,
  AlertTriangle, ShoppingBag, Download, FileSpreadsheet, FileDown, Printer, ShieldCheck,
  ArrowRightLeft, UserMinus, GripVertical, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';

const AssetStatusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1">
        <p className="font-extrabold text-slate-200">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Rasio Pakai:</span>
          <span className="font-mono font-bold text-blue-400">{payload[0].value}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-450">Aset Dipinjam:</span>
          <span className="font-mono font-bold text-slate-200">{data.borrowed} Unit</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-450">Pagu Alokasi:</span>
          <span className="font-mono font-bold text-slate-400">{data.total} Unit</span>
        </div>
      </div>
    );
  }
  return null;
};

const TurnoverTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-[11px] text-white space-y-1.5 font-sans" id={`turnover-tooltip-${label}`}>
        <p className="font-extrabold text-slate-200">{data.fullName || label}</p>
        <div className="flex items-center justify-between gap-6">
          <span className="text-emerald-400 flex items-center gap-1">🟢 Karyawan Masuk:</span>
          <span className="font-mono font-bold text-white text-right">{data["Masuk"]} Orang</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-rose-400 flex items-center gap-1">🔴 Karyawan Keluar:</span>
          <span className="font-mono font-bold text-white text-right">{data["Keluar"]} Orang</span>
        </div>
        <div className="border-t border-slate-800 pt-1 flex items-center justify-between gap-6 text-[10px]">
          <span className="text-slate-400">Net Mutasi Staf:</span>
          <span className={`font-mono font-bold ${data.NetChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.NetChange > 0 ? `+${data.NetChange}` : data.NetChange} Orang
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1">
        <p className="font-extrabold text-slate-200">{label}</p>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="text-slate-400">{item.name}:</span>
            <span className="font-mono font-bold text-white">
              {item.name === 'Karyawan' ? `${item.value} Orang` : `${item.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PayrollCostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1 animate-in fade-in zoom-in-95 duration-150">
        <p className="font-extrabold text-slate-200">{label}</p>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="text-slate-400">{item.name}:</span>
            <span className="font-mono font-semibold text-white">
              Rp {Number(item.value).toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AttendanceWeeklyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1 animate-in fade-in zoom-in-95 duration-150">
        <p className="font-extrabold text-slate-200">{label}</p>
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-slate-400">{item.name}:</span>
            </div>
            <span className="font-mono font-bold text-white">
              {item.value} Karyawan ({(item.value / (item.payload.total || 1) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
        <div className="border-t border-slate-800/60 pt-1.5 mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>Total Staff:</span>
          <span className="font-mono font-bold text-slate-200">{payload[0].payload.total} Orang</span>
        </div>
      </div>
    );
  }
  return null;
};

const LatenessTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
        <p className="font-extrabold text-slate-200">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.55">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Rata-rata Terlambat:</span>
          </div>
          <span className="font-mono font-bold text-amber-400">
            {payload[0].value} Menit
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">Kasus Terlambat:</span>
          </div>
          <span className="font-mono font-bold text-rose-400">
            {data["Frekuensi Terlambat"]} Kali
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-400">Paling Terlambat:</span>
          </div>
          <span className="font-mono font-bold text-slate-200">
            {data["Durasi Maksimum (Menit)"]} Menit
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const OvertimeCostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const biayaLembur = data['Biaya Lembur'];
    const targetAnggaran = data['Target Anggaran'];
    const selisih = targetAnggaran - biayaLembur;
    const isOverBudget = selisih < 0;

    return (
      <div className="bg-slate-900/95 border border-slate-800 p-3.5 rounded-xl shadow-lg backdrop-blur-xs text-xs text-white space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
        <p className="font-extrabold text-slate-200">{label}</p>
        
        <div className="flex items-center justify-between gap-6 border-b border-slate-800/60 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400 font-medium">Beban Lembur:</span>
          </div>
          <span className="font-mono font-bold text-amber-400">
            Rp {biayaLembur.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 pb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-medium">Target Anggaran:</span>
          </div>
          <span className="font-mono font-medium text-cyan-400">
            Rp {targetAnggaran.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 pt-1">
          <span className="text-slate-400">Status Keuangan:</span>
          {isOverBudget ? (
            <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-400 font-extrabold rounded-md animate-pulse">
              Over Budget (Rp {Math.abs(selisih).toLocaleString('id-ID')})
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold rounded-md">
              Sisa Kuota (Rp {selisih.toLocaleString('id-ID')})
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom lightweight robust Markdown Renderer with beautiful designs
function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-4 text-slate-600 leading-relaxed font-sans select-text">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Headers with custom icons
        if (trimmed.startsWith('###') || trimmed.match(/^\d+\.\s+\*\*/)) {
          const cleanText = trimmed
            .replace(/^###\s*/, '')
            .replace(/^\d+\.\s+\*\*/, '')
            .replace(/\*\*/g, '')
            .replace(/:$/, '');
          return (
            <h4 key={index} className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mt-6 mb-2 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
              <span className="h-1.5 w-1.5 bg-blue-600 rounded-full inline-block" />
              {cleanText}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={index} className="text-xs font-extrabold text-blue-700 uppercase tracking-widest mt-7 mb-3 flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              {trimmed.replace(/^##\s*/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={index} className="text-sm font-black text-slate-900 border-l-4 border-blue-600 pl-3 py-1 mt-8 mb-4">
              {trimmed.replace(/^#\s*/, '')}
            </h2>
          );
        }

        // Dividers
        if (trimmed === '---') {
          return <div key={index} className="border-t border-slate-100 my-6" />;
        }

        // Bullet bullet items
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const cleanedLine = trimmed.replace(/^[-\*]\s*/, '');
          const boldMatch = cleanedLine.match(/^\*\*(.*?)\*\*(.*)/);
          if (boldMatch) {
            return (
              <div key={index} className="flex items-start gap-2.5 text-xs pl-3 py-1 group">
                <span className="text-blue-500 font-bold font-mono text-sm leading-none mt-0.5 shrink-0 transition-transform group-hover:scale-125">•</span>
                <p className="text-slate-650">
                  <strong className="text-slate-900 font-bold">{boldMatch[1]}</strong>
                  {boldMatch[2]}
                </p>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start gap-2.5 text-xs pl-3 py-1 group">
              <span className="text-blue-500 font-bold font-mono text-sm leading-none mt-0.5 shrink-0">•</span>
              <p className="text-slate-650">{cleanedLine}</p>
            </div>
          );
        }

        // Numeric Ordered listings
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
          const text = orderedMatch[2];
          const boldMatch = text.match(/^\*\*(.*?)\*\*(.*)/);
          if (boldMatch) {
            return (
              <div key={index} className="flex items-start gap-3 pl-3 py-1.5 bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all">
                <span className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 border border-blue-105 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{orderedMatch[1]}</span>
                <div className="text-xs text-slate-650">
                  <strong className="text-slate-900 font-bold">{boldMatch[1]}</strong>
                  {boldMatch[2]}
                </div>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-start gap-3 pl-3 py-1.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all">
              <span className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 border border-blue-105 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{orderedMatch[1]}</span>
              <p className="text-xs text-slate-650 mt-1">{text}</p>
            </div>
          );
        }

        // Empty lines
        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        // Generic Text paragraphs
        const boldParts = trimmed.split('**');
        if (boldParts.length > 1) {
          return (
            <p key={index} className="text-xs text-slate-650 font-medium leading-relaxed my-2">
              {boldParts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold bg-slate-100/60 px-1 py-0.5 rounded">{part}</strong> : part)}
            </p>
          );
        }

        return (
          <p key={index} className="text-xs text-slate-655 font-medium leading-relaxed my-1.5">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
import { Employee, AttendanceRecord, LeaveRequest, AuditLog, PayrollRecord, PayrollPeriod, CompanyAsset, Holiday, ViolationRecord, UserAccount, UserRole } from '../types';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  auditLogs: AuditLog[];
  onClearAuditLogs: () => void;
  onNavigate: (tab: string) => void;
  payrollRecords?: PayrollRecord[];
  periods?: PayrollPeriod[];
  onUpdateEmployee?: (emp: Employee) => void;
  assets?: CompanyAsset[];
  holidays?: Holiday[];
  violations?: ViolationRecord[];
  displayDensity?: 'ringkas' | 'lapang';
  activeUser?: UserAccount;
  onUpdateLeaveStatus?: (id: string, status: 'Disetujui' | 'Ditolak', role?: 'manager' | 'hr') => void;
}

export default function Dashboard({ 
  employees, 
  attendance, 
  leaves, 
  auditLogs = [], 
  onClearAuditLogs, 
  onNavigate,
  payrollRecords = [],
  periods = [],
  onUpdateEmployee,
  assets = [],
  holidays = [],
  violations = [],
  displayDensity = 'lapang',
  activeUser,
  onUpdateLeaveStatus
}: DashboardProps) {
  const [logSearch, setLogSearch] = React.useState('');
  const [logModuleFilter, setLogModuleFilter] = React.useState<string>('all');
  const [logStartDate, setLogStartDate] = React.useState('');
  const [logEndDate, setLogEndDate] = React.useState('');
  const [logActorSearch, setLogActorSearch] = React.useState('');
  const [visibleLogCount, setVisibleLogCount] = React.useState(5);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [exportScope, setExportScope] = React.useState<'filtered' | 'all'>('filtered');

  // ================= HR LEAVE NOTIFICATION STATES & LOGIC =================
  const [dismissedLeaveIds, setDismissedLeaveIds] = React.useState<string[]>([]);
  const [toastSuccessMessage, setToastSuccessMessage] = React.useState<string>('');

  // ================= CONTRACT NOTIFICATION SYSTEM STATES =================
  const [contractFilter, setContractFilter] = React.useState<'all' | 'critical' | 'normal'>('all');
  const [kategoriFilter, setKategoriFilter] = React.useState<'all' | 'PKWT' | 'PKWTT'>('PKWT');
  const [notifiedEmpIds, setNotifiedEmpIds] = React.useState<string[]>([]);
  const [autoEmailedEmpIds, setAutoEmailedEmpIds] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('hris_auto_emailed_contract_ids_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [isAutoEmailEnabled, setIsAutoEmailEnabled] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('hris_auto_email_reminder_enabled');
    return saved !== 'false';
  });

  React.useEffect(() => {
    localStorage.setItem('hris_auto_emailed_contract_ids_v2', JSON.stringify(autoEmailedEmpIds));
  }, [autoEmailedEmpIds]);

  React.useEffect(() => {
    localStorage.setItem('hris_auto_email_reminder_enabled', String(isAutoEmailEnabled));
  }, [isAutoEmailEnabled]);

  const [showRenewalModal, setShowRenewalModal] = React.useState(false);
  const [renewalEmp, setRenewalEmp] = React.useState<Employee | null>(null);
  const [newContractType, setNewContractType] = React.useState<'Tetap' | 'Kontrak' | 'Magang'>('Kontrak');
  const [newDurationMonths, setNewDurationMonths] = React.useState<string>('12');
  const [customNewEndDate, setCustomNewEndDate] = React.useState<string>('2027-06-30');
  const [previewSkEmp, setPreviewSkEmp] = React.useState<Employee | null>(null);
  const [isSkDownloaded, setIsSkDownloaded] = React.useState(false);
  const [showBroadcastToast, setShowBroadcastToast] = React.useState(false);
  const [broadcastTargetDept, setBroadcastTargetDept] = React.useState('');
  const [contractSuccessMsg, setContractSuccessMsg] = React.useState('');
  const [selectedTurnoverDept, setSelectedTurnoverDept] = React.useState<string>('all');

  // ================= SMART LAYOUT SYSTEM FOR ROLE SENSITIVITY =================
  const [smartLayout, setSmartLayout] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('hris_smart_layout_enabled');
    return saved !== 'false';
  });
  const [simulatedRole, setSimulatedRole] = React.useState<UserRole | 'auto'>(() => {
    const saved = localStorage.getItem('hris_smart_layout_simulated_role');
    return (saved as any) || 'auto';
  });
  const [manuallyExpanded, setManuallyExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    localStorage.setItem('hris_smart_layout_enabled', String(smartLayout));
  }, [smartLayout]);

  React.useEffect(() => {
    localStorage.setItem('hris_smart_layout_simulated_role', simulatedRole);
  }, [simulatedRole]);

  const effectiveRole = React.useMemo(() => {
    if (simulatedRole === 'auto') {
      return activeUser?.role || 'Super Admin';
    }
    return simulatedRole;
  }, [simulatedRole, activeUser]);

  const pendingHrdLeaves = React.useMemo(() => {
    const isHrManager = effectiveRole === 'HR Manager' || activeUser?.role === 'HR Manager';
    if (!isHrManager) return [];

    return leaves.filter(leave => 
      leave.managerApproval === 'Disetujui' && 
      leave.hrApproval === 'Pending' &&
      !dismissedLeaveIds.includes(leave.id)
    );
  }, [leaves, effectiveRole, activeUser, dismissedLeaveIds]);

  const handleToastApprove = (id: string, name: string) => {
    if (onUpdateLeaveStatus) {
      onUpdateLeaveStatus(id, 'Disetujui', 'hr');
      setToastSuccessMessage(`Pengajuan cuti dari ${name} berhasil disetujui!`);
      setTimeout(() => setToastSuccessMessage(''), 4000);
    }
  };

  const handleToastReject = (id: string, name: string) => {
    if (onUpdateLeaveStatus) {
      onUpdateLeaveStatus(id, 'Ditolak', 'hr');
      setToastSuccessMessage(`Pengajuan cuti dari ${name} berhasil ditolak!`);
      setTimeout(() => setToastSuccessMessage(''), 4000);
    }
  };

  const getModuleState = React.useCallback((moduleId: string): { visible: boolean; minimized: boolean } => {
    if (!smartLayout) {
      return { visible: true, minimized: false };
    }

    const role = effectiveRole;

    // Default visible/minimized configurations based on security, confidentiality & relevance
    switch (role) {
      case 'Karyawan':
        // Safe only for basic metrics, individual schedules, hide sensitive company analytics
        if ([
          'automated-contract-notification-hub',
          'dashboard-smart-insight-panel',
          'dashboard-kpi-scorecard-panel',
          'dashboard-turnover-analysis-section',
          'dashboard-audit-log-card',
          'dashboard-activity-stream',
          'dashboard-chart-dept',
          'quick-actions-panel',
          'payroll-trend',
          'salary-distribution',
          'overtime-budget',
          'asset-depreciation'
        ].includes(moduleId)) {
          return { visible: false, minimized: false };
        }
        if ([
          'dashboard-recent-activity'
        ].includes(moduleId)) {
          return { visible: true, minimized: true };
        }
        return { visible: true, minimized: false };

      case 'Division Manager':
        // Medium access: show department metrics, hide company finance and audit logs
        if ([
          'dashboard-audit-log-card',
          'dashboard-turnover-analysis-section',
          'payroll-trend',
          'salary-distribution',
          'overtime-budget'
        ].includes(moduleId)) {
          return { visible: false, minimized: false };
        }
        if ([
          'automated-contract-notification-hub',
          'dashboard-smart-insight-panel',
          'dashboard-activity-stream'
        ].includes(moduleId)) {
          return { visible: true, minimized: true };
        }
        return { visible: true, minimized: false };

      case 'HR Manager':
        // High access: full access but minimize tech logs to focus on operations
        if ([
          'dashboard-audit-log-card'
        ].includes(moduleId)) {
          return { visible: true, minimized: true };
        }
        return { visible: true, minimized: false };

      case 'Super Admin':
        // All-inclusive view
        return { visible: true, minimized: false };

      default:
        return { visible: true, minimized: false };
    }
  }, [smartLayout, effectiveRole]);

  const isModuleVisible = React.useCallback((moduleId: string) => {
    return getModuleState(moduleId).visible;
  }, [getModuleState]);

  const isModuleMinimized = React.useCallback((moduleId: string) => {
    const rules = getModuleState(moduleId);
    if (!rules.visible) return false;
    if (manuallyExpanded[moduleId] !== undefined) {
      return !manuallyExpanded[moduleId];
    }
    return rules.minimized;
  }, [getModuleState, manuallyExpanded]);

  const toggleModuleExpansion = (moduleId: string) => {
    const rules = getModuleState(moduleId);
    const initiallyCollapsed = rules.minimized;
    const currentIsCollapsed = manuallyExpanded[moduleId] !== undefined 
      ? !manuallyExpanded[moduleId] 
      : initiallyCollapsed;

    setManuallyExpanded(prev => ({
      ...prev,
      [moduleId]: currentIsCollapsed
    }));
  };

  // ================= KALENDER KERJA (STATES & UTILS) =================
  const [calendarDate, setCalendarDate] = React.useState<Date>(() => new Date(2026, 5, 17)); // Default to June 17, 2026 (matching simulated month)
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = React.useState<string>('2026-06-17');
  const [calendarFilter, setCalendarFilter] = React.useState<'all' | 'event' | 'leave' | 'deadline'>('all');
  const [showEventForm, setShowEventForm] = React.useState<boolean>(false);
  const [eventSuccessMsg, setEventSuccessMsg] = React.useState<string>('');

  const [eventFormData, setEventFormData] = React.useState({
    title: '',
    category: 'event' as 'event' | 'leave' | 'deadline',
    date: '2026-06-17',
    targetDept: 'Semua',
    description: ''
  });

  const [customCalendarEvents, setCustomCalendarEvents] = React.useState<any[]>(() => {
    const saved = localStorage.getItem('hris_custom_calendar_events_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse calendar events", e);
      }
    }
    return [
      // Event Perusahaan
      {
        id: 'EVT-001',
        title: 'Pembagian Laptop Kantor & Aset Baru',
        category: 'event',
        date: '2026-06-03',
        targetDept: 'IT & Engineering',
        description: 'Serah terima Macbook Pro M3 untuk personil developer baru dan penandatanganan berita acara pinjam pakai aset.'
      },
      {
        id: 'EVT-002',
        title: 'Evaluasi Kepatuhan Fingerprint Solution X-100C',
        category: 'event',
        date: '2026-06-12',
        targetDept: 'Semua',
        description: 'Rapat koordinasi HRD mengenai sinkronisasi log mesin sidik jari dan regulasi denda keterlambatan.'
      },
      {
        id: 'EVT-003',
        title: 'Town Hall Meeting Q2 PT Enterprise Solutions',
        category: 'event',
        date: '2026-06-19',
        targetDept: 'Semua',
        description: 'Penyampaian performa keuangan kuartal kedua, pencapaian KPI perusahaan, dan pengumuman program bonus tahunan pegawai.'
      },
      {
        id: 'EVT-004',
        title: 'Sosialisasi Hak Kepegawaian & BPJS Kesehatan',
        category: 'event',
        date: '2026-06-25',
        targetDept: 'Human Resources',
        description: 'Pemaparan kebijakan BPJS terintegrasi yang baru dikonfigurasi dan sesi tanya jawab dengan tim legal.'
      },
      // Cuti Bersama
      {
        id: 'EVT-005',
        title: 'Cuti Bersama Hari Lahir Pancasila',
        category: 'leave',
        date: '2026-06-01',
        targetDept: 'Semua',
        description: 'Hari libur nasional memperingati lahirnya dasar negara Pancasila.'
      },
      {
        id: 'EVT-006',
        title: 'Cuti Bersama Hari Raya Idul Adha 1447 H',
        category: 'leave',
        date: '2026-06-17',
        targetDept: 'Semua',
        description: 'Libur keagamaan Idul Adha/Kurban nasional.'
      },
      {
        id: 'EVT-007',
        title: 'Libur Bersama Tambahan Idul Adha',
        category: 'leave',
        date: '2026-06-18',
        targetDept: 'Semua',
        description: 'Tambahan libur bersama Idul Adha berdasarkan SKB 3 Menteri.'
      },
      // Deadline Proyek
      {
        id: 'EVT-008',
        title: 'Deadline Pengisian Rekonsiliasi Absensi Mei',
        category: 'deadline',
        date: '2026-06-10',
        targetDept: 'Semua',
        description: 'Batas akhir bagi manager divisi untuk melakukan adjustment manual dan persetujuan lembur staf di portal.'
      },
      {
        id: 'EVT-009',
        title: 'Batas Penyerahan Klaim Reimbursement Medis',
        category: 'deadline',
        date: '2026-06-15',
        targetDept: 'Finance & Accounting',
        description: 'Batas penyerahan kuitansi berobat dan form rawat jalan asli ke divisi keuangan untuk pencairan bulan berjalan.'
      },
      {
        id: 'EVT-010',
        title: 'Deadline Pembaruan Masa Kontrak Kerja Karyawan',
        category: 'deadline',
        date: '2026-06-23',
        targetDept: 'Human Resources',
        description: 'Finalisasi draf keputusan perpanjangan PKWT pegawai kritis dan penerbitan SK Direksi baru.'
      },
      {
        id: 'EVT-011',
        title: 'Finalisasi Laporan Keuangan Pajak PPh21 Juni',
        category: 'deadline',
        date: '2026-06-28',
        targetDept: 'Finance & Accounting',
        description: 'Penutupan perhitungan payroll periode berjalan, pph21, dan pengiriman berkas SPT masa tahunan.'
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('hris_custom_calendar_events_v2', JSON.stringify(customCalendarEvents));
  }, [customCalendarEvents]);

  // Merge events, leaves and holidays 
  const allMergedCalendarEvents = React.useMemo(() => {
    const list = [...customCalendarEvents];

    // Merge leaves
    leaves.forEach(leave => {
      if (leave.status === 'Disetujui' || leave.status === 'Pending') {
        try {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const current = new Date(start);
          let cap = 0;
          while (current <= end && cap < 31) {
            cap++;
            const dateStr = current.toISOString().split('T')[0];
            // Check if already merged in the leave items to avoid duplicates
            if (!list.some(e => e.id === `leave-req-${leave.id}-${dateStr}`)) {
              list.push({
                id: `leave-req-${leave.id}-${dateStr}`,
                title: `Cuti ${leave.employeeName} (${leave.type})`,
                category: 'leave',
                date: dateStr,
                targetDept: 'Human Resources',
                description: `Pengajuan cuti alasan: "${leave.reason}". Status persetujuan: ${leave.status}.`
              });
            }
            current.setDate(current.getDate() + 1);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    // Merge holidays
    holidays.forEach(holiday => {
      const isDuplicated = list.some(e => e.date === holiday.date && e.title === holiday.name);
      if (!isDuplicated) {
        list.push({
          id: `holiday-${holiday.id}`,
          title: holiday.name,
          category: holiday.type === 'Bersama' ? 'leave' : 'leave',
          date: holiday.date,
          targetDept: 'Semua',
          description: `Hari Libur ${holiday.type}: ${holiday.description || holiday.name}`
        });
      }
    });

    return list;
  }, [customCalendarEvents, leaves, holidays]);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) return;

    const newEvent = {
      id: `EVT-USR-${Date.now()}`,
      title: eventFormData.title,
      category: eventFormData.category,
      date: eventFormData.date,
      targetDept: eventFormData.targetDept,
      description: eventFormData.description || 'Agenda perusahaan tambahan.'
    };

    setCustomCalendarEvents(prev => [...prev, newEvent]);
    setSelectedCalendarDateStr(eventFormData.date);
    
    // Clear and Toast
    setEventFormData(prev => ({
      ...prev,
      title: '',
      description: ''
    }));
    setShowEventForm(false);
    
    setEventSuccessMsg('Agenda baru berhasil ditambahkan ke kalender kerja.');
    setTimeout(() => setEventSuccessMsg(''), 4000);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      if (id.startsWith('leave-req-') || id.startsWith('holiday-')) {
        window.alert('Hari libur nasional dan cuti karyawan yang berasal dari data sistem tidak dapat dihapus melalui modul kalender.');
        return;
      }
      setCustomCalendarEvents(prev => prev.filter(e => e.id !== id));
      setEventSuccessMsg('Agenda berhasil dihapus.');
      setTimeout(() => setEventSuccessMsg(''), 3000);
    }
  };

  // Drag and Drop Layout States for HRD Dashboard Metrics
  const [layoutOrder, setLayoutOrder] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('hris_dashboard_layout_order_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 12) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      'payroll-trend',
      'weekly-attendance',
      'attendance-rate-trend',
      'salary-distribution',
      'lateness-chart',
      'lateness-summary',
      'overtime-chart',
      'overtime-budget',
      'asset-utilization',
      'asset-depreciation',
      'dept-distribution',
      'age-distribution'
    ];
  });

  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== index) {
      setHoveredIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    
    const newOrder = [...layoutOrder];
    const draggedItem = newOrder[draggedIdx];
    
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setLayoutOrder(newOrder);
    localStorage.setItem('hris_dashboard_layout_order_v2', JSON.stringify(newOrder));
    
    setDraggedIdx(null);
    setHoveredIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setHoveredIdx(null);
  };

  // Buttons manual click move handlers for accessibility
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutOrder.length) return;
    
    const newOrder = [...layoutOrder];
    const item = newOrder[index];
    newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, item);
    
    setLayoutOrder(newOrder);
    localStorage.setItem('hris_dashboard_layout_order_v2', JSON.stringify(newOrder));
  };

  const resetLayout = () => {
    const defaultLayout = [
      'payroll-trend',
      'weekly-attendance',
      'attendance-rate-trend',
      'salary-distribution',
      'lateness-chart',
      'lateness-summary',
      'overtime-chart',
      'overtime-budget',
      'asset-utilization',
      'asset-depreciation',
      'dept-distribution',
      'age-distribution'
    ];
    setLayoutOrder(defaultLayout);
    localStorage.setItem('hris_dashboard_layout_order_v2', JSON.stringify(defaultLayout));
  };

  // Handle auto-date suggestion on duration change
  React.useEffect(() => {
    if (renewalEmp) {
      const today = new Date('2026-06-11');
      if (newContractType === 'Tetap') {
        setCustomNewEndDate('');
      } else {
        const months = newDurationMonths === 'tetap' ? 12 : parseInt(newDurationMonths, 10) || 12;
        const nextDate = new Date(today);
        nextDate.setMonth(today.getMonth() + months);
        setCustomNewEndDate(nextDate.toISOString().split('T')[0]);
      }
    }
  }, [newDurationMonths, newContractType, renewalEmp]);

  const handleConfirmRenewal = () => {
    if (!renewalEmp) return;
    
    const updatedEmployee: Employee = {
      ...renewalEmp,
      contractType: newContractType,
      contractEndDate: newContractType === 'Tetap' ? undefined : customNewEndDate
    };

    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmployee);
    } else {
      // Fallback update in localStorage directly
      const saved = localStorage.getItem('hris_employees');
      if (saved) {
        try {
          const emps: Employee[] = JSON.parse(saved);
          const updatedEmps = emps.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
          localStorage.setItem('hris_employees', JSON.stringify(updatedEmps));
          window.dispatchEvent(new Event('hris_employees_updated'));
        } catch (err) {
          console.error(err);
        }
      }
    }

    setContractSuccessMsg(`Kontrak ${renewalEmp.name} berhasil diperpanjang sebagai karyawan ${newContractType}${newContractType === 'Tetap' ? ' (Permanen)' : ` hingga ${customNewEndDate}`}.`);
    setShowRenewalModal(false);
    setRenewalEmp(null);
  };

  // ================= KPI SCORECARD STATE & LOGIC =================
  const [kpiSearch, setKpiSearch] = React.useState('');
  const [kpiDeptFilter, setKpiDeptFilter] = React.useState('all');
  const [kpiGradeFilter, setKpiGradeFilter] = React.useState('all');
  const [editingKpiEmpId, setEditingKpiEmpId] = React.useState<string | null>(null);
  const [isKpiPanelExpanded, setIsKpiPanelExpanded] = React.useState(true);

  const finalKpiExpanded = React.useMemo(() => {
    if (!isModuleVisible('dashboard-kpi-scorecard-panel')) return false;
    if (isModuleMinimized('dashboard-kpi-scorecard-panel')) return false;
    return isKpiPanelExpanded;
  }, [isKpiPanelExpanded, isModuleVisible, isModuleMinimized]);

  const filteredLayoutOrder = React.useMemo(() => {
    return layoutOrder.filter(moduleId => isModuleVisible(moduleId));
  }, [layoutOrder, isModuleVisible]);

  // Default KPI Target value configs:
  const [kpiTargetsMap, setKpiTargetsMap] = React.useState<Record<string, {
    targetAttendanceRate: number;
    targetLatenessMinutes: number;
    targetOvertimeHours: number;
    targetAllowedViolations: number;
  }>>(() => {
    const saved = localStorage.getItem('hris_kpi_targets_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  // State fields for editing targets
  const [editingTargetAttendance, setEditingTargetAttendance] = React.useState(95);
  const [editingTargetLateness, setEditingTargetLateness] = React.useState(45);
  const [editingTargetOvertime, setEditingTargetOvertime] = React.useState(12);
  const [editingTargetViolations, setEditingTargetViolations] = React.useState(0);

  // Success indicator for target updates
  const [kpiSuccessMsg, setKpiSuccessMsg] = React.useState('');

  const handleOpenKpiEdit = (empId: string) => {
    const defaultTargets = {
      targetAttendanceRate: 95,
      targetLatenessMinutes: 45,
      targetOvertimeHours: 12,
      targetAllowedViolations: 0
    };
    const currentTargets = kpiTargetsMap[empId] || defaultTargets;
    setEditingKpiEmpId(empId);
    setEditingTargetAttendance(currentTargets.targetAttendanceRate);
    setEditingTargetLateness(currentTargets.targetLatenessMinutes);
    setEditingTargetOvertime(currentTargets.targetOvertimeHours);
    setEditingTargetViolations(currentTargets.targetAllowedViolations);
  };

  const handleSaveKpiTargets = (empId: string, empName: string) => {
    const updatedMap = {
      ...kpiTargetsMap,
      [empId]: {
        targetAttendanceRate: editingTargetAttendance,
        targetLatenessMinutes: editingTargetLateness,
        targetOvertimeHours: editingTargetOvertime,
        targetAllowedViolations: editingTargetViolations
      }
    };
    setKpiTargetsMap(updatedMap);
    localStorage.setItem('hris_kpi_targets_map', JSON.stringify(updatedMap));
    setEditingKpiEmpId(null);
    
    // Add audit log entry
    const newLog: AuditLog = {
      id: `AUDIT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: localStorage.getItem('hris_user_email') || 'herupermana.vps@gmail.com',
      module: 'Dashboard',
      action: 'Pengaturan Sasaran KPI',
      details: `Mengubah target KPI untuk karyawan ${empName}: Kehadiran ${editingTargetAttendance}%, Toleransi Terlambat ${editingTargetLateness} mnt, Target Lembur ${editingTargetOvertime} jam, Batas Pelanggaran ${editingTargetViolations}`,
      status: 'Sukses'
    };
    
    // Save to localStorage audit logs
    const savedLogs = localStorage.getItem('hris_audit_logs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        localStorage.setItem('hris_audit_logs', JSON.stringify([newLog, ...parsed]));
      } catch (err) {}
    } else {
      localStorage.setItem('hris_audit_logs', JSON.stringify([newLog]));
    }
    // Trigger dispatch so App can sync logs
    window.dispatchEvent(new Event('hris_audit_logs_updated'));

    setKpiSuccessMsg(`Target sasaran KPI untuk ${empName} berhasil diperbarui.`);
    setTimeout(() => setKpiSuccessMsg(''), 4000);
  };

  // ================= GEMINI AI SMART INSIGHT STATE & LOGIC =================
  const [insightLoading, setInsightLoading] = React.useState(false);
  const [insightText, setInsightText] = React.useState(() => {
    return localStorage.getItem('biometric_hr_smart_insight') || '';
  });
  const [insightError, setInsightError] = React.useState('');
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  // Stepper messages for loading animation
  React.useEffect(() => {
    if (!insightLoading) return;
    const steps = [
      "Membaca data rekaman absensi sidik jari...",
      "Menganalisis korelasi keterlambatan dengan rasio kehadiran divisi...",
      "Mengekstrak tren kedisiplinan dan absensi bulanan...",
      "Menyusun rekomendasi kebijakan HR berbasis modul Solution X-100C...",
      "Memformulasikan draf laporan final..."
    ];
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [insightLoading]);

  // Aggregate stats from existing system state for June 2026 (or current)
  const computedStats = React.useMemo(() => {
    const juneRecords = attendance.filter(r => r.date.startsWith('2026-06'));
    
    const stats = {
      hadirTepatWaktu: juneRecords.filter(r => r.status === 'Hadir').length,
      terlambat: juneRecords.filter(r => r.status === 'Terlambat').length,
      pulangCepat: juneRecords.filter(r => r.status === 'Pulang Cepat').length,
      sakit: juneRecords.filter(r => r.status === 'Sakit').length,
      izin: juneRecords.filter(r => r.status === 'Izin').length,
      cuti: juneRecords.filter(r => r.status === 'Cuti').length,
      alpa: juneRecords.filter(r => r.status === 'Alpa').length,
    };

    const deptStatsMap: Record<string, { total: number; present: number; late: number; absent: number }> = {};
    
    employees.forEach(emp => {
      if (!deptStatsMap[emp.department]) {
        deptStatsMap[emp.department] = { total: 0, present: 0, late: 0, absent: 0 };
      }
      deptStatsMap[emp.department].total++;
    });

    juneRecords.forEach(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      if (emp && deptStatsMap[emp.department]) {
        if (r.status === 'Hadir' || r.status === 'Pulang Cepat' || r.status === 'Hadir (Libur)') {
          deptStatsMap[emp.department].present++;
        } else if (r.status === 'Terlambat') {
          deptStatsMap[emp.department].present++;
          deptStatsMap[emp.department].late++;
        } else if (['Sakit', 'Izin', 'Cuti', 'Alpa'].includes(r.status)) {
          deptStatsMap[emp.department].absent++;
        }
      }
    });

    const departmentStats = Object.entries(deptStatsMap).map(([name, data]) => {
      const totalDays = data.present + data.absent;
      const presenceRate = totalDays > 0 ? Math.round((data.present / totalDays) * 100) : 100;
      return {
        namaDepartemen: name,
        jumlahKaryawan: data.total,
        jumlahKehadiran: data.present,
        jumlahTerlambat: data.late,
        jumlahKetidakhadiran: data.absent,
        persentaseKehadiran: `${presenceRate}%`
      };
    });

    return {
      stats,
      departmentStats,
    };
  }, [attendance, employees]);

  const generateSmartInsight = async () => {
    setInsightLoading(true);
    setInsightError('');
    try {
      const response = await fetch('/api/gemini/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceStats: computedStats.stats,
          employeeCount: employees.length,
          departmentStats: computedStats.departmentStats,
          currentMonthName: 'Juni 2026'
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setInsightText(data.text);
        localStorage.setItem('biometric_hr_smart_insight', data.text);
      } else {
        setInsightError(data.error || 'Terjadi kesalahan sistem saat mengambil analisa.');
      }
    } catch (err) {
      console.error(err);
      setInsightError('Tidak dapat terhubung ke server HRIS. Harap periksa koneksi atau aktifkan server.');
    } finally {
      setInsightLoading(false);
    }
  };

  const handleCopyInsight = () => {
    if (!insightText) return;
    navigator.clipboard.writeText(insightText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = React.useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = 
        log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
        log.details.toLowerCase().includes(logSearch.toLowerCase()) || 
        log.actor.toLowerCase().includes(logSearch.toLowerCase());
      
      const matchModule = logModuleFilter === 'all' || log.module === logModuleFilter;
      
      const logDateStr = log.timestamp.substring(0, 10);
      const matchStartDate = !logStartDate || logDateStr >= logStartDate;
      const matchEndDate = !logEndDate || logDateStr <= logEndDate;
      
      const matchActor = !logActorSearch || log.actor.toLowerCase().includes(logActorSearch.toLowerCase());
      
      return matchSearch && matchModule && matchStartDate && matchEndDate && matchActor;
    });
  }, [auditLogs, logSearch, logModuleFilter, logStartDate, logEndDate, logActorSearch]);

  const uniqueActors = React.useMemo(() => {
    const list = auditLogs.map(log => log.actor);
    return Array.from(new Set(list)).filter(Boolean);
  }, [auditLogs]);

  // Combined audit logs memo for the compact activity stream
  const recentHrLogs = React.useMemo(() => {
    return [...auditLogs]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 5);
  }, [auditLogs]);

  const handleScrollToAuditLogs = () => {
    const el = document.getElementById('dashboard-audit-log-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExportCSV = (scope: 'filtered' | 'all') => {
    const logsToExport = scope === 'filtered' ? filteredLogs : auditLogs;
    if (logsToExport.length === 0) {
      alert('Tidak ada data log aktivitas untuk diekspor.');
      return;
    }
    
    // CSV Header row
    const headers = ['Waktu Log', 'Kategori Modul', 'Aktivitas Utama', 'Rincian Perubahan Data', 'Operator / Pengubah', 'Status'];
    
    // Process rows
    const rows = logsToExport.map(log => [
      log.timestamp,
      log.module,
      log.action,
      log.details.replace(/"/g, '""'), // escape quotes
      log.actor,
      log.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterSuffix = scope === 'all' ? 'Semua-Log' : (logModuleFilter === 'all' ? 'Filtered-Log' : logModuleFilter);
    link.setAttribute('download', `Logs_Audit_Kepatuhan_HRIS_${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAuditTrail = (scope: 'filtered' | 'all') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan di browser Anda.');
      return;
    }

    const logsToExport = scope === 'filtered' ? filteredLogs : auditLogs;
    const todayStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    const uuidSeed = Math.floor(100000 + Math.random() * 900000);

    const rowsHtml = logsToExport.map(log => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; font-family: monospace; font-size: 10px; color: #475569; white-space: nowrap;">${log.timestamp}</td>
        <td style="padding: 8px 12px; font-weight: bold; font-size: 10px; color: #1e293b; white-space: nowrap;">${log.module}</td>
        <td style="padding: 8px 12px; font-weight: bold; font-size: 10px; color: #0f172a;">${log.action}</td>
        <td style="padding: 8px 12px; font-size: 10px; color: #334155; line-height: 1.4;">${log.details}</td>
        <td style="padding: 8px 12px; font-family: monospace; font-size: 10px; color: #475569; white-space: nowrap;">${log.actor}</td>
        <td style="padding: 8px 12px; text-align: center; white-space: nowrap;">
          <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 9999px; 
            ${log.status === 'Sukses' ? 'background-color: #d1fae5; color: #065f46;' : log.status === 'Peringatan' ? 'background-color: #ffe4e6; color: #991b1b;' : 'background-color: #dbeafe; color: #1e40af;'}">
            ${log.status}
          </span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan_Audit_Trail_Compliance_${uuidSeed}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .letterhead { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; color: #0f172a; }
            .meta-info { font-size: 11px; color: #475569; margin-top: 5px; }
            .grid-meta { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            .grid-meta td { padding: 4px 0; }
            .audit-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 40px; }
            .audit-table th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 9px; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; text-align: left; }
            .footer-sig { width: 100%; border-collapse: collapse; margin-top: 50px; font-size: 11px; }
            .footer-sig td { text-align: center; width: 50%; }
            .stamp { border: 2px dashed #0284c7; color: #0284c7; padding: 10px; width: 180px; margin: 15px auto; font-family: monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; -webkit-transform: rotate(-1deg); }
            @media print {
              body { margin: 20px; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 10px;">
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #0284c7; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">Cetak Ke PDF / Printer</button>
          </div>
          
          <div class="letterhead">
            <h1 class="title">PT ENTERPRISE SOLUTIONS Tbk.</h1>
            <p style="font-size: 10px; color: #64748b; margin: 3px 0 0 0;">Gedung Cyber 2, Lt. 18, Jl. H.R. Rasuna Said, Jakarta Selatan, 12950</p>
            <p style="font-size: 9px; color: #94a3b8; margin: 2px 0 0 0;">Telp: (021) 5088-0192 | Email: compliance@enterprise-solutions.co.id</p>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="font-size: 14px; font-weight: 800; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">LAPORAN KEPATUHAN AKTIVITAS PORTAL (AUDIT TRAIL CERTIFICATE)</h2>
            <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Diterbitkan otomatis untuk keperluan verifikasi kepatuhan ISO 27001 & Aturan PSAK</p>
          </div>

          <table class="grid-meta">
            <tr>
              <td style="width: 18%; font-weight: bold; color: #334155;">Nomor Laporan:</td>
              <td style="width: 32%; font-family: monospace; font-weight: bold; color: #0284c7;">ES-HR/AUDIT/2026/${uuidSeed}</td>
              <td style="width: 18%; font-weight: bold; color: #334155;">Tanggal Generate:</td>
              <td style="width: 32%;">${todayStr}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #334155;">Petugas Pengakses:</td>
              <td>HRD Compliance Officer (Biometric-Verified)</td>
              <td style="font-weight: bold; color: #334155;">Cakupan Ekspor:</td>
              <td style="text-transform: capitalize; font-weight: bold;">${scope === 'all' ? 'Semua Log Sistem' : 'Berdasarkan Filter Aktif'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #334155;">Total Aktivitas:</td>
              <td style="font-weight: bold;">${logsToExport.length} Entri Kegiatan</td>
              <td style="font-weight: bold; color: #334155;">Status Validasi:</td>
              <td><strong style="color: #10b981;">✔ SAH & PROTECTED BY AUDIT TRAIL</strong></td>
            </tr>
          </table>

          <div style="font-size: 10px; background-color: #f8fafc; border-left: 3px solid #0284c7; padding: 10px; margin-bottom: 20px; color: #475569; line-height: 1.4;">
            <strong>Deklarasi Integritas Data:</strong> Sesuai dengan Peraturan Menteri Kominfo mengenai Penyelenggaraan Sistem Elektronik, laporan audit ini mencatat seluruh peristiwa secara non-repudiation (tidak dapat disangkal) berdasarkan identitas terenkripsi dan verifikasi biometrik operator bersangkutan. Informasi di dalamnya tidak dapat diubah (immutable) secara manual di database produksi.
          </div>

          <table class="audit-table">
            <thead>
              <tr>
                <th style="width: 15%;">Waktu Log</th>
                <th style="width: 12%;">Modul</th>
                <th style="width: 20%;">Aktivitas Utama</th>
                <th style="width: 33%;">Rincian Perubahan Data</th>
                <th style="width: 12%;">Operator</th>
                <th style="width: 8%; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <table class="footer-sig">
            <tr>
              <td>
                <p style="margin-bottom: 50px;">Disiapkan &amp; Diverifikasi oleh,</p>
                <div class="stamp">
                  PT ENTERPRISE SOLUTIONS<br/>
                  HR COMPLIANCE DEPT<br/>
                  VERIFIED SYSTEM OK
                </div>
                <strong style="text-decoration: underline; color: #0284c7;">Hani Saraswati, S.H.</strong>
                <p style="font-size: 10px; color: #64748b; margin-top: 2px;">Head of HR Compliance &amp; Legal</p>
              </td>
              <td>
                <p style="margin-bottom: 50px;">Diketahui &amp; Disahkan oleh,</p>
                <div style="height: 52px;"></div>
                <strong style="text-decoration: underline; color: #0f172a;">Bambang Setiadji, M.B.A.</strong>
                <p style="font-size: 10px; color: #64748b; margin-top: 2px;">Chief of Human Resource Officer</p>
              </td>
            </tr>
          </table>

          <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; text-align: center; font-size: 9px; color: #94a3b8;">
            Dokumen ini dicetak secara digital dan sah tanpa tanda tangan basah fisik selama stempel verifikasi sistem bernomor ES-HR/AUDIT/2026/${uuidSeed} terdeteksi utuh.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Stats calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Aktif').length;
  
  // Today is defined as 2026-06-11 in the metadata context
  const todayStr = '2026-06-11';
  const todayLogs = attendance.filter(log => log.date === todayStr);
  const presentToday = todayLogs.filter(log => log.status === 'Hadir' || log.status === 'Terlambat' || log.status === 'Pulang Cepat').length;
  const lateToday = todayLogs.filter(log => log.status === 'Terlambat').length;
  
  const attendanceRate = totalEmployees > 0 
    ? Math.round((presentToday / activeEmployees) * 100) 
    : 100;

  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  // 30 Days Contract Expiry Check (Evaluates both PKWT expiring within 30 days and PKWTT)
  const expiringEmployees = React.useMemo(() => {
    const today = (() => {
      const now = new Date();
      if (now.getFullYear() === 2026) return now;
      return new Date('2026-06-11');
    })();

    return employees
      .filter(emp => emp.contractType)
      .map(emp => {
        if (emp.contractType === 'Tetap') {
          return { emp, diffDays: Infinity };
        }
        const end = emp.contractEndDate ? new Date(emp.contractEndDate) : null;
        if (!end) {
          return { emp, diffDays: Infinity };
        }
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { emp, diffDays };
      })
      .filter(item => {
        if (item.emp.contractType === 'Tetap') {
          return true; // We always keep PKWTT in evaluated pool for category filtering
        }
        return item.diffDays <= 30; // Only keep expiring PKWT
      })
      .sort((a, b) => {
        if (a.diffDays === Infinity) return 1;
        if (b.diffDays === Infinity) return -1;
        return a.diffDays - b.diffDays;
      });
  }, [employees]);

  const filteredExpiringEmployees = React.useMemo(() => {
    let result = expiringEmployees;

    // Filter by Kategori Kontrak
    if (kategoriFilter === 'PKWT') {
      result = result.filter(item => item.emp.contractType !== 'Tetap');
    } else if (kategoriFilter === 'PKWTT') {
      result = result.filter(item => item.emp.contractType === 'Tetap');
    }

    // Filter by Urgensi Kontrak (hanya relevan untuk PKWT/Kontrak berjangka)
    if (kategoriFilter !== 'PKWTT') {
      if (contractFilter === 'critical') {
        result = result.filter(item => item.diffDays <= 15 && item.diffDays !== Infinity);
      } else if (contractFilter === 'normal') {
        result = result.filter(item => item.diffDays > 15 && item.diffDays <= 30 && item.diffDays !== Infinity);
      }
    }

    return result;
  }, [expiringEmployees, contractFilter, kategoriFilter]);

  // Automated Contract Reminders (H-30 before expiry to Division Manager)
  React.useEffect(() => {
    if (!isAutoEmailEnabled) return;
    
    let updated = false;
    const newAutoSent = [...autoEmailedEmpIds];
    
    // We only evaluate PKWT employees (with active expiry & diffDays <= 30)
    const eligibleEmployees = expiringEmployees.filter(
      item => item.diffDays !== Infinity && item.diffDays <= 30 && item.diffDays > 0
    );

    eligibleEmployees.forEach(({ emp, diffDays }) => {
      if (!newAutoSent.includes(emp.id)) {
        newAutoSent.push(emp.id);
        updated = true;
        
        const emailSubject = `[AUTOMATED REMINDER] Evaluasi 30 Hari Menjelang Berakhirnya Kontrak PKWT - ${emp.name}`;
        
        // Dispatch custom HRIS event to append log natively
        window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
          detail: {
            module: 'Kontrak',
            action: 'Email Otomatis (H-30)',
            details: `Sistem mendeteksi sisa kontrak ${emp.name} (${emp.position}) adalah ${diffDays} hari. Otomatis mengirimkan email notifikasi evaluasi kepada Manager Divisi ${emp.department} (${emp.email || 'manager@enterprise.co.id'}).`,
            status: 'Sukses'
          }
        }));
      }
    });
    
    if (updated) {
      setAutoEmailedEmpIds(newAutoSent);
      setContractSuccessMsg("Sistem mendeteksi sisa kontrak & otomatis mengirimkan email pengingat (H-30) kepada Manager Departemen terkait.");
      setTimeout(() => setContractSuccessMsg(''), 6050);
    }
  }, [expiringEmployees, isAutoEmailEnabled, autoEmailedEmpIds]);

  // Let's compute average salary budget
  const totalPayrollBudget = employees
    .filter(e => e.status === 'Aktif')
    .reduce((acc, curr) => acc + curr.basicSalary + curr.allowance, 0);

  // Department counts
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Recent attendance logs
  const recentLogs = [...attendance]
    .sort((a, b) => b.date.localeCompare(a.date) || (b.checkIn || '').localeCompare(a.checkIn || ''))
    .slice(0, 5);

  // Dynamic calculations for the trend metrics
  const juneLateRate = activeEmployees > 0 
    ? Math.round((lateToday / activeEmployees) * 100) 
    : 0;

  const attendanceTrendData = [
    { name: 'Jan', Hadir: 94, Terlambat: 6 },
    { name: 'Feb', Hadir: 92, Terlambat: 8 },
    { name: 'Mar', Hadir: 95, Terlambat: 4 },
    { name: 'Apr', Hadir: 97, Terlambat: 3 },
    { name: 'Mei', Hadir: 96, Terlambat: 5 },
    { 
      name: 'Jun', 
      Hadir: attendanceRate || 95, 
      Terlambat: juneLateRate || 5 
    }
  ];

  const salaryData = [
    { name: '< 10 Juta', Karyawan: 0 },
    { name: '10-13 Juta', Karyawan: 0 },
    { name: '13-16 Juta', Karyawan: 0 },
    { name: '> 16 Juta', Karyawan: 0 }
  ];

  employees.forEach(emp => {
    if (emp.status === 'Aktif') {
      const gross = emp.basicSalary + emp.allowance;
      if (gross < 10000000) {
        salaryData[0].Karyawan++;
      } else if (gross >= 10000000 && gross <= 13000000) {
        salaryData[1].Karyawan++;
      } else if (gross > 13000000 && gross <= 16000000) {
        salaryData[2].Karyawan++;
      } else {
        salaryData[3].Karyawan++;
      }
    }
  });

  // Calculate average delay (lateness duration) per department in the last 30 days
  const averageLatenessPerDept = React.useMemo(() => {
    const latestDate = attendance.length > 0
      ? new Date(Math.max(...attendance.map(a => new Date(a.date).getTime())))
      : new Date('2026-06-11');

    const limitDate = new Date(latestDate);
    limitDate.setDate(limitDate.getDate() - 30);

    const deptMap: Record<string, { totalMinutes: number; count: number; maxMinutes: number }> = {};
    const departments = ['IT & Engineering', 'Human Resources', 'Finance & Accounting', 'Operations', 'Marketing & Sales'];

    departments.forEach(d => {
      deptMap[d] = { totalMinutes: 0, count: 0, maxMinutes: 0 };
    });

    attendance.forEach(rec => {
      const recDate = new Date(rec.date);
      if (recDate >= limitDate) {
        const emp = employees.find(e => e.id === rec.employeeId);
        if (emp && deptMap[emp.department] !== undefined) {
          if (rec.status === 'Terlambat' || (rec.lateMinutes && rec.lateMinutes > 0)) {
            deptMap[emp.department].totalMinutes += rec.lateMinutes;
            deptMap[emp.department].count += 1;
            if (rec.lateMinutes > deptMap[emp.department].maxMinutes) {
              deptMap[emp.department].maxMinutes = rec.lateMinutes;
            }
          }
        }
      }
    });

    return departments.map(d => {
      const info = deptMap[d];
      const avg = info.count > 0 ? Math.round(info.totalMinutes / info.count) : 0;
      return {
        namaDepartemen: d,
        "Rata-rata Durasi (Menit)": avg,
        "Frekuensi Terlambat": info.count,
        "Durasi Maksimum (Menit)": info.maxMinutes,
      };
    });
  }, [attendance, employees]);

  const overtimeCostTrend = React.useMemo(() => {
    const listMonths = [
      { id: 'jul-25', name: 'Jul 2025', baseCost: 7800000, targetBudget: 12000000 },
      { id: 'agu-25', name: 'Agu 2025', baseCost: 9200000, targetBudget: 12000000 },
      { id: 'sep-25', name: 'Sep 2025', baseCost: 11500000, targetBudget: 12000000 },
      { id: 'okt-25', name: 'Okt 2025', baseCost: 13200000, targetBudget: 12000000 },
      { id: 'nov-25', name: 'Nov 2025', baseCost: 9600000, targetBudget: 12000000 },
      { id: 'des-25', name: 'Des 2025', baseCost: 16500000, targetBudget: 15000000 },
      { id: 'jan-26', name: 'Jan 2026', baseCost: 8400000, targetBudget: 12000000 },
      { id: 'feb-26', name: 'Feb 2026', baseCost: 9000000, targetBudget: 12000000 },
      { id: 'mar-26', name: 'Mar 2026', baseCost: 14800000, targetBudget: 15000000 },
      { id: 'apr-26', name: 'Apr 2026', baseCost: 11000000, targetBudget: 12000000 },
      { id: 'mei-26', name: 'Mei 2026', baseCost: 10500000, targetBudget: 12000000 },
      { id: 'jun-26', name: 'Jun 2026', baseCost: 5800000, targetBudget: 12000000 }
    ];

    return listMonths.map(m => {
      const keywordMap: Record<string, string> = {
        'jul': '07', 'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12',
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'mei': '05', 'jun': '06'
      };

      const monthPart = m.id.split('-')[0].toLowerCase();
      const yearStr = m.id.split('-')[1] === '25' ? '2025' : '2026';
      const monthNum = keywordMap[monthPart] || '06';
      const targetYearMonth = `${yearStr}-${monthNum}`;

      const logsInMonth = attendance.filter(log => log.date.startsWith(targetYearMonth));

      let computedCost = 0;
      let hasActualLogs = false;

      if (logsInMonth.length > 0) {
        hasActualLogs = true;
        let totalOvertimeMinsInMonth = 0;

        logsInMonth.forEach(log => {
          if (log.overtimeMinutes !== undefined) {
            totalOvertimeMinsInMonth += log.overtimeMinutes;
          } else if (log.checkOut) {
            const parts = log.checkOut.split(':');
            const h = parseInt(parts[0], 10) || 0;
            const min = parseInt(parts[1], 10) || 0;
            const checkoutMins = h * 60 + min;

            const stdMins = 17 * 60; // 17:00 standard shift
            const diff = checkoutMins - stdMins;
            if (diff >= 15) {
              totalOvertimeMinsInMonth += diff;
            }
          }
        });

        // 25,000 IDR rate
        computedCost = Math.round((totalOvertimeMinsInMonth / 60) * 25000);
      }

      const finalCost = hasActualLogs && computedCost > 0 ? computedCost : m.baseCost;

      return {
        name: m.name,
        'Biaya Lembur': finalCost,
        'Target Anggaran': m.targetBudget,
        isActual: hasActualLogs
      };
    });
  }, [attendance]);

  const monthlyPayrollTrend = React.useMemo(() => {
    const listMonths = [
      { id: 'jul-25', name: 'Jul 2025', baseCost: 0.92, bonusRatio: 0.05 },
      { id: 'agu-25', name: 'Agu 2025', baseCost: 0.94, bonusRatio: 0.07 },
      { id: 'sep-25', name: 'Sep 2025', baseCost: 0.95, bonusRatio: 0.04 },
      { id: 'okt-25', name: 'Okt 2025', baseCost: 0.93, bonusRatio: 0.06 },
      { id: 'nov-25', name: 'Nov 2025', baseCost: 0.96, bonusRatio: 0.05 },
      { id: 'des-25', name: 'Des 2025', baseCost: 1.05, bonusRatio: 0.15 }, // Year-end bonus bump
      { id: 'jan-26', name: 'Jan 2026', baseCost: 0.98, bonusRatio: 0.03 },
      { id: 'feb-26', name: 'Feb 2026', baseCost: 0.97, bonusRatio: 0.04 },
      { id: 'mar-26', name: 'Mar 2026', baseCost: 1.09, bonusRatio: 0.08 }, // THR or holiday period
      { id: 'apr-26', name: 'Apr 2026', baseCost: 1.00, bonusRatio: 0.05 },
      { id: 'mei-26', name: 'Mei 2026', baseCost: 1.02, bonusRatio: 0.06 },
      { id: 'jun-26', name: 'Jun 2026', baseCost: 1.00, bonusRatio: 0.05 }  // Current month
    ];

    // Reference base is total payroll budget of current active employees (~Rp 250M depending on staff)
    const baseVal = totalPayrollBudget || 180000000;

    return listMonths.map(m => {
      const keywordMap: Record<string, string> = {
        'Jul': 'Juli', 'Agu': 'Agustus', 'Sep': 'September', 'Okt': 'Oktober',
        'Nov': 'November', 'Des': 'Desember', 'Jan': 'Januari', 'Feb': 'Februari',
        'Mar': 'Maret', 'Apr': 'April', 'Mei': 'Mei', 'Jun': 'Juni'
      };
      const monthPrefix = m.name.split(' ')[0];
      const yearStr = m.name.split(' ')[1];
      const indonesianMonthName = `${keywordMap[monthPrefix]} ${yearStr}`;

      const matchedPeriod = periods.find(p => p.month.toLowerCase() === indonesianMonthName.toLowerCase());
      
      let totalCostVal = 0;
      let isActual = false;

      if (matchedPeriod) {
        // Sum from payrollRecords
        const recordsForPeriod = payrollRecords.filter(r => r.periodId === matchedPeriod.id);
        if (recordsForPeriod.length > 0) {
          totalCostVal = recordsForPeriod.reduce((sum, r) => sum + r.netSalary, 0);
          isActual = true;
        }
      }

      if (!isActual) {
        // Fallback to beautiful baseline with minor deterministic variations based on month name for visual consistency
        const seedValue = m.id.charCodeAt(0) + m.id.charCodeAt(1);
        const fluctuation = 1 + ((seedValue % 7) - 3) / 100; // -3% to +3%
        totalCostVal = Math.round(baseVal * m.baseCost * fluctuation);
      }

      return {
        name: m.name,
        'Biaya Penggajian': totalCostVal,
        isActual
      };
    });
  }, [periods, payrollRecords, totalPayrollBudget]);

  // Hitung data demografi karyawan secara dinamis berdasarkan data karyawan aktif
  const demographicsData = React.useMemo(() => {
    // 1. Distribusi Departemen
    const deptTotals: Record<string, number> = {};
    employees.forEach(emp => {
      if (emp.status === 'Aktif') {
        deptTotals[emp.department] = (deptTotals[emp.department] || 0) + 1;
      }
    });

    const deptChartData = Object.entries(deptTotals).map(([name, value]) => ({
      name,
      value
    }));

    // 2. Rasio Kelompok Usia (Menggunakan rentang usia determinis berdasarkan ID/PIN staf)
    const ageGroups = {
      'Gen Z (< 25 thn)': 0,
      'Milenial Muda (25 - 34 thn)': 0,
      'Milenial Matang (35 - 44 thn)': 0,
      'Generasi X Senior (45 - 54 thn)': 0,
      'Mendekati Pensiun (55+ thn)': 0
    };

    employees.forEach(emp => {
      if (emp.status === 'Aktif') {
        const pinVal = parseInt(emp.pin || '1000', 10) || 1000;
        const offset = pinVal % 38;
        const fakeAge = 22 + offset; // rentang usia 22 sampai 59

        if (fakeAge < 25) {
          ageGroups['Gen Z (< 25 thn)']++;
        } else if (fakeAge >= 25 && fakeAge <= 34) {
          ageGroups['Milenial Muda (25 - 34 thn)']++;
        } else if (fakeAge >= 35 && fakeAge <= 44) {
          ageGroups['Milenial Matang (35 - 44 thn)']++;
        } else if (fakeAge >= 45 && fakeAge <= 54) {
          ageGroups['Generasi X Senior (45 - 54 thn)']++;
        } else {
          ageGroups['Mendekati Pensiun (55+ thn)']++;
        }
      }
    });

    const ageChartData = Object.entries(ageGroups)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value
      }));

    return { deptChartData, ageChartData };
  }, [employees]);

  const weeklyAttendanceStatistics = React.useMemo(() => {
    let baseDateStr = '2026-06-16';
    if (attendance && attendance.length > 0) {
      const dates = attendance.map(a => a.date).filter(Boolean);
      if (dates.length > 0) {
        dates.sort();
        const maxDate = dates[dates.length - 1];
        if (maxDate > baseDateStr) {
          baseDateStr = maxDate;
        }
      }
    }

    const baseDate = new Date(baseDateStr + 'T00:00:00');
    const result = [];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const totalEmpCount = employees.length || 10;

      const presentRecs = attendance.filter(a => a.date === dateString && a.checkIn);
      const presentCount = presentRecs.length;

      const onLeaveCount = leaves.filter(l => {
        return l.status === 'Disetujui' && 
               dateString >= l.startDate && 
               dateString <= l.endDate;
      }).length;

      const absenceCount = Math.max(0, totalEmpCount - presentCount - onLeaveCount);

      result.push({
        date: dateString,
        label: `${dayName} (${dateString.substring(8)})`,
        Hadir: presentCount,
        'Cuti / Izin': onLeaveCount,
        Absen: absenceCount,
        total: totalEmpCount
      });
    }
    return result;
  }, [employees, attendance, leaves]);

  // ================= ASSET UTILIZATION & DEPRECIATION =================
  const assetUtilizationData = React.useMemo(() => {
    const empMap = new Map<string, Employee>();
    employees.forEach(emp => empMap.set(emp.id, emp));

    const depts = Array.from(new Set(employees.map(e => e.department)));
    const deptUtil: Record<string, { dept: string; borrowed: number; total: number; ratio: number }> = {};
    
    depts.forEach(dept => {
      let limit = 5;
      if (dept.toLowerCase().includes('it') || dept.toLowerCase().includes('engineering')) limit = 8;
      if (dept.toLowerCase().includes('operations') || dept.toLowerCase().includes('operasional')) limit = 6;
      if (dept.toLowerCase().includes('hr') || dept.toLowerCase().includes('finance')) limit = 4;
      
      deptUtil[dept] = {
        dept,
        borrowed: 0,
        total: limit,
        ratio: 0
      };
    });

    if (assets && assets.length > 0) {
      assets.forEach(asset => {
        if (asset.status === 'Dipinjam' && asset.loanedToId) {
          const emp = empMap.get(asset.loanedToId);
          if (emp && deptUtil[emp.department]) {
            deptUtil[emp.department].borrowed += 1;
          }
        }
      });
    }

    return Object.values(deptUtil).map(item => {
      const total = Math.max(item.total, item.borrowed, 1);
      return {
        ...item,
        total,
        ratio: Math.round((item.borrowed / total) * 100)
      };
    });
  }, [assets, employees]);

  const depreciatedAssets = React.useMemo(() => {
    if (!assets || assets.length === 0) return [];
    
    const assetDetails: Record<string, { purchaseDate: string; lifespanYears: number }> = {
      'AST-001': { purchaseDate: '2025-12-01', lifespanYears: 3 }, // MacBook Pro - 0.5 years old, not depreciated
      'AST-002': { purchaseDate: '2022-02-15', lifespanYears: 3 }, // ThinkPad - 4.3 years old, EXCEEDED operational lifespan (Depresiasi 100%)
      'AST-003': { purchaseDate: '2023-01-10', lifespanYears: 2 }, // Kartu Akses - 3.4 years old, EXCEEDED lifespan
      'AST-004': { purchaseDate: '2026-01-01', lifespanYears: 1 }, // Seragam - 0.5 years old, OK
      'AST-005': { purchaseDate: '2020-05-20', lifespanYears: 5 }, // Kunci Brankas - 6.1 years old, EXCEEDED lifespan
    };

    const today = new Date('2026-06-17'); // current date in mock context

    return assets.map(asset => {
      const details = assetDetails[asset.id] || { purchaseDate: '2023-01-01', lifespanYears: 3 };
      const purchase = new Date(details.purchaseDate);
      const diffTime = Math.abs(today.getTime() - purchase.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      const isOverLimit = diffYears > details.lifespanYears;
      const depreciationPct = Math.min(100, Math.round((diffYears / details.lifespanYears) * 100));

      return {
        ...asset,
        purchaseDate: details.purchaseDate,
        lifespanYears: details.lifespanYears,
        ageYears: diffYears.toFixed(1),
        depreciationPct,
        isOverLimit
      };
    }).filter(item => item.isOverLimit);
  }, [assets]);

  // ================= TURNOVER KARYAWAN & PERENCANAAN SUKSESI =================
  const turnoverStatistics = React.useMemo(() => {
    const months = [
      { key: '2025-07', label: "Jul '25", name: "Juli 2025" },
      { key: '2025-08', label: "Agu '25", name: "Agustus 2025" },
      { key: '2025-09', label: "Sep '25", name: "September 2025" },
      { key: '2025-10', label: "Okt '25", name: "Oktober 2025" },
      { key: '2025-11', label: "Nov '25", name: "November 2025" },
      { key: '2025-12', label: "Des '25", name: "Desember 2025" },
      { key: '2026-01', label: "Jan '26", name: "Januari 2026" },
      { key: '2026-02', label: "Feb '26", name: "Februari 2026" },
      { key: '2026-03', label: "Mar '26", name: "Maret 2026" },
      { key: '2026-04', label: "Apr '26", name: "April 2026" },
      { key: '2026-05', label: "Mei '26", name: "Mei 2026" },
      { key: '2026-06', label: "Jun '26", name: "Juni 2026" }
    ];

    // Baseline historical turnovers per department: { in: hires, out: quits }
    const historicalSeed: Record<string, Record<string, { in: number; out: number }>> = {
      '2025-07': {
        'IT & Engineering': { in: 1, out: 0 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 0, out: 0 },
        'Operations': { in: 2, out: 1 },
        'Marketing & Sales': { in: 1, out: 0 }
      },
      '2025-08': {
        'IT & Engineering': { in: 2, out: 1 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 1, out: 0 },
        'Operations': { in: 1, out: 0 },
        'Marketing & Sales': { in: 1, out: 1 }
      },
      '2025-09': {
        'IT & Engineering': { in: 0, out: 0 },
        'Human Resources': { in: 1, out: 0 },
        'Finance & Accounting': { in: 0, out: 1 },
        'Operations': { in: 3, out: 2 },
        'Marketing & Sales': { in: 0, out: 0 }
      },
      '2025-10': {
        'IT & Engineering': { in: 1, out: 0 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 0, out: 0 },
        'Operations': { in: 1, out: 1 },
        'Marketing & Sales': { in: 2, out: 1 }
      },
      '2025-11': {
        'IT & Engineering': { in: 3, out: 1 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 1, out: 0 },
        'Operations': { in: 2, out: 0 },
        'Marketing & Sales': { in: 1, out: 0 }
      },
      '2025-12': {
        'IT & Engineering': { in: 0, out: 1 },
        'Human Resources': { in: 0, out: 1 },
        'Finance & Accounting': { in: 0, out: 0 },
        'Operations': { in: 1, out: 1 },
        'Marketing & Sales': { in: 0, out: 0 }
      },
      '2026-01': {
        'IT & Engineering': { in: 4, out: 0 },
        'Human Resources': { in: 1, out: 0 },
        'Finance & Accounting': { in: 1, out: 0 },
        'Operations': { in: 3, out: 1 },
        'Marketing & Sales': { in: 2, out: 1 }
      },
      '2026-02': {
        'IT & Engineering': { in: 1, out: 2 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 0, out: 1 },
        'Operations': { in: 1, out: 0 },
        'Marketing & Sales': { in: 1, out: 0 }
      },
      '2026-03': {
        'IT & Engineering': { in: 2, out: 0 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 1, out: 0 },
        'Operations': { in: 2, out: 1 },
        'Marketing & Sales': { in: 0, out: 1 }
      },
      '2026-04': {
        'IT & Engineering': { in: 0, out: 1 },
        'Human Resources': { in: 1, out: 0 },
        'Finance & Accounting': { in: 0, out: 0 },
        'Operations': { in: 1, out: 0 },
        'Marketing & Sales': { in: 3, out: 1 }
      },
      '2026-05': {
        'IT & Engineering': { in: 1, out: 0 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 0, out: 0 },
        'Operations': { in: 2, out: 1 },
        'Marketing & Sales': { in: 1, out: 0 }
      },
      '2026-06': {
        'IT & Engineering': { in: 2, out: 0 },
        'Human Resources': { in: 0, out: 0 },
        'Finance & Accounting': { in: 1, out: 0 },
        'Operations': { in: 0, out: 0 },
        'Marketing & Sales': { in: 1, out: 0 }
      }
    };

    // Prepare structure
    const monthlySummary = months.map(m => {
      const detail: Record<string, { in: number; out: number }> = {};
      const deptsList = ['IT & Engineering', 'Human Resources', 'Finance & Accounting', 'Operations', 'Marketing & Sales'];
      
      deptsList.forEach(dept => {
        detail[dept] = { 
          in: historicalSeed[m.key]?.[dept]?.in || 0, 
          out: historicalSeed[m.key]?.[dept]?.out || 0 
        };
      });

      return {
        key: m.key,
        label: m.label,
        name: m.name,
        detail
      };
    });

    // Aggregate additional actual hires based on active list
    employees.forEach(emp => {
      if (emp.joinDate) {
        const joinMonthPrefix = emp.joinDate.substring(0, 7); // YYYY-MM
        const targetMonth = monthlySummary.find(m => m.key === joinMonthPrefix);
        if (targetMonth && targetMonth.detail[emp.department]) {
          targetMonth.detail[emp.department].in += 1;
        }
        
        if (emp.status === 'Nonaktif') {
          const targetExitMonth = monthlySummary.find(m => m.key === '2026-06');
          if (targetExitMonth && targetExitMonth.detail[emp.department]) {
            targetExitMonth.detail[emp.department].out += 1;
          }
        }
      }
    });

    // Filter or average based on selectedTurnoverDept
    const trendData = monthlySummary.map(m => {
      let hires = 0;
      let exits = 0;

      if (selectedTurnoverDept === 'all') {
        Object.values(m.detail).forEach(val => {
          hires += val.in;
          exits += val.out;
        });
      } else {
        if (m.detail[selectedTurnoverDept]) {
          hires = m.detail[selectedTurnoverDept].in;
          exits = m.detail[selectedTurnoverDept].out;
        }
      }

      return {
        month: m.label,
        fullName: m.name,
        "Masuk": hires,
        "Keluar": exits,
        "NetChange": hires - exits
      };
    });

    // Calculate totals
    let totalIn = 0;
    let totalOut = 0;
    trendData.forEach(d => {
      totalIn += d["Masuk"];
      totalOut += d["Keluar"];
    });

    // Calculate base active employee count as average divisor
    let activeDivisor = 0;
    if (selectedTurnoverDept === 'all') {
      activeDivisor = employees.length || 1;
    } else {
      activeDivisor = employees.filter(e => e.department === selectedTurnoverDept).length || 1;
    }

    // Estimate turnover rate
    const turnoverRateVal = Math.round((totalOut / activeDivisor) * 1000) / 10;
    const turnoverRateStr = (turnoverRateVal || 0).toFixed(1) + '%';

    // Succession & Risk evaluation
    let riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' = 'Rendah';
    let riskBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let riskText = 'Sangat Stabil';
    let recommendation = '';

    if (turnoverRateVal > 15) {
      riskLevel = 'Tinggi';
      riskBg = 'bg-rose-50 text-rose-800 border-rose-200';
      riskText = 'Kritis & Rawan Kekosongan Jabatan';
      recommendation = 'Segera lakukan Penelaahan Bakat (Talent Review) untuk semua posisi kepemimpinan (Key Positions). Percepat program kaderisasi, perbarui Rencana Suksesi Darurat (Emergency Successor), dan optimalkan strategi retensi melalui audit gaji dan tinjauan kepemimpinan.';
    } else if (turnoverRateVal > 7) {
      riskLevel = 'Sedang';
      riskBg = 'bg-amber-50 text-amber-800 border-amber-200';
      riskText = 'Perlu Pemantauan & Mitigasi';
      recommendation = 'Lakukan tinjauan pipeline suksesi pada level manajerial tingkat menengah (Middle Executive). Tingkatkan inisiatif bimbingan (Mentoring), rancang rencana pengembangan berbasis jalur karier, serta tinjau ulang faktor pemicu retensi di divisi ini.';
    } else {
      riskLevel = 'Rendah';
      riskBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      riskText = 'Sangat Stabil & Aman';
      recommendation = 'Kondisi suksesi sangat stabil. Fokus harian diarahkan pada pengembangan kompetensi lanjutan bagi talenta berpotensi tinggi (Hi-Po), serta pembaharuan rutin terhadap cadangan talenta (Talent Pool) untuk pos-pos masa depan.';
    }

    return {
      trendData,
      totalIn,
      totalOut,
      turnoverRate: turnoverRateStr,
      turnoverRateVal,
      riskLevel,
      riskBg,
      riskText,
      recommendation
    };
  }, [employees, selectedTurnoverDept]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  const renderAnalyticCardContent = (moduleId: string, index: number) => {
    switch (moduleId) {
      case 'payroll-trend':
        return (
          <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-violet-600" /> Tren Total Biaya Penggajian Bulanan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Estimasi total pembayaran gaji &amp; tunjangan staff selama 12 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-bold bg-violet-50 text-violet-700 rounded border border-violet-100 uppercase tracking-widest font-mono shrink-0">
                  IDR / RUPIAH (Rp)
                </span>
              </div>
            </div>

            <div className="h-72 text-xs" id="payroll-trend-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyPayrollTrend}
                  margin={{ top: 5, right: 10, left: 15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBiaya" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<PayrollCostTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={32} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area 
                    name="Total Biaya Penggajian"
                    type="monotone" 
                    dataKey="Biaya Penggajian" 
                    stroke="#7C3AED" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorBiaya)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'weekly-attendance':
        return (
          <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-600 animate-pulse" /> Statistik Absensi Mingguan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Rasio kehadiran, cuti, dan mangkir harian secara real-time</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase tracking-widest font-mono shrink-0">
                  Presensi Staf
                </span>
              </div>
            </div>

            <div className="h-72 text-xs" id="weekly-attendance-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyAttendanceStatistics}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<AttendanceWeeklyTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={32} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar 
                    name="Hadir" 
                    dataKey="Hadir" 
                    stackId="attendance-weekly-stack" 
                    fill="#10B981" 
                  />
                  <Bar 
                    name="Cuti / Izin" 
                    dataKey="Cuti / Izin" 
                    stackId="attendance-weekly-stack" 
                    fill="#F59E0B" 
                  />
                  <Bar 
                    name="Tanpa Keterangan / Mangkir" 
                    dataKey="Absen" 
                    stackId="attendance-weekly-stack" 
                    fill="#EF4444" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'attendance-rate-trend':
        return (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Analisa Tren Absensi Bulanan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Rasio persentase kehadiran vs terlambat (Jan - Jun 2026)</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase tracking-widest shrink-0 font-mono">
                PERSENTASE (%)
              </span>
            </div>
            
            <div className="h-68 text-xs" id="attendance-trend-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceTrendData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area 
                    name="Tingkat Hadir"
                    type="monotone" 
                    dataKey="Hadir" 
                    stroke="#2563EB" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorHadir)" 
                  />
                  <Area 
                    name="Tingkat Terlambat"
                    type="monotone" 
                    dataKey="Terlambat" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'salary-distribution':
        return (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Distribusi Gaji Karyawan Aktif
                </h3>
                <p className="text-xs text-slate-400 mt-1">Pengelompokan remunerasi (Gaji Pokok + Tunjangan Khusus)</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded border border-emerald-100 uppercase tracking-widest shrink-0 font-mono">
                JUMLAH STAF
              </span>
            </div>

            <div className="h-68 text-xs" id="salary-dist-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar 
                    name="Karyawan" 
                    dataKey="Karyawan" 
                    fill="#10B981" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  >
                    {salaryData.map((entry, index) => {
                      const barColors = ['#A7F3D0', '#34D399', '#059669', '#064E3B'];
                      return <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'lateness-chart':
        return (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Analisis Keterlambatan Departemen
                </h3>
                <p className="text-xs text-slate-400 mt-1">Rata-rata durasi keterlambatan (dalam menit) per departemen dalam satu bulan terakhir</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 rounded border border-amber-100 uppercase tracking-widest font-mono shrink-0">
                Rata-rata (Menit)
              </span>
            </div>

            <div className="h-68 text-xs" id="lateness-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={averageLatenessPerDept}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="namaDepartemen" 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (val === 'IT & Engineering') return 'IT';
                      if (val === 'Finance & Accounting') return 'Finance';
                      if (val === 'Marketing & Sales') return 'Marketing';
                      return val;
                    }}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val} M`}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<LatenessTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar 
                    name="Rata-rata Durasi (Menit)" 
                    dataKey="Rata-rata Durasi (Menit)" 
                    fill="#F59E0B" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  >
                    {averageLatenessPerDept.map((entry, index) => {
                      const avgValue = entry["Rata-rata Durasi (Menit)"];
                      let barColor = '#34D399';
                      if (avgValue >= 20) {
                        barColor = '#EF4444';
                      } else if (avgValue >= 10) {
                        barColor = '#F59E0B';
                      } else if (avgValue > 0) {
                        barColor = '#60A5FA';
                      }
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-4 pt-2 border-t border-slate-50 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Aman (&lt;10 m)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sedang (10-20 m)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Tinggi (&ge;20 m)</span>
            </div>
          </>
        );
      case 'lateness-summary':
        return (
          <>
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-emerald-600" /> Detail Kasus &amp; Tindakan Disiplin
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Daftar peringkat keterlambatan per bagian dan rekomendasi kebijakan operasional</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded border border-slate-200 uppercase tracking-widest font-mono shrink-0">
                    RESUME 30 HARI
                  </span>
                </div>

                <div className="space-y-3.5 mt-2 overflow-y-auto max-h-72 pr-1">
                  {averageLatenessPerDept.map((entry) => {
                    const avgValue = entry["Rata-rata Durasi (Menit)"];
                    const freqValue = entry["Frekuensi Terlambat"];
                    const maxValue = entry["Durasi Maksimum (Menit)"];
                    
                    let severityText = 'Aman';
                    let severityBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    let progressBg = 'bg-emerald-500';
                    
                    if (avgValue >= 20) {
                      severityText = 'Sangat Tinggi';
                      severityBg = 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
                      progressBg = 'bg-rose-500';
                    } else if (avgValue >= 10) {
                      severityText = 'Sedang';
                      severityBg = 'bg-amber-50 text-amber-700 border-amber-100';
                      progressBg = 'bg-amber-500';
                    } else if (avgValue > 0) {
                      severityText = 'Sangat Rendah';
                      severityBg = 'bg-blue-50 text-blue-700 border-blue-100';
                      progressBg = 'bg-blue-500';
                    } else {
                      severityText = 'Nihil';
                      severityBg = 'bg-slate-50 text-slate-500 border-slate-100';
                      progressBg = 'bg-slate-200';
                    }

                    return (
                      <div key={entry.namaDepartemen} className="text-xs border border-slate-100 hover:border-slate-200 p-3 rounded-xl transition-all hover:shadow-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-slate-750">{entry.namaDepartemen}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityBg}`}>
                            {severityText}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 py-1.5 text-[10px] text-slate-500 font-medium">
                          <div>
                            <p className="text-slate-400">Rataan Telat</p>
                            <p className="font-mono text-slate-800 font-bold mt-0.5">{avgValue} Menit</p>
                          </div>
                          <div>
                            <p className="text-slate-455">Total Kasus</p>
                            <p className="font-mono text-slate-800 font-bold mt-0.5">{freqValue} Kali</p>
                          </div>
                          <div>
                            <p className="text-slate-455">Max Keterlambatan</p>
                            <p className="font-mono text-slate-800 font-bold mt-0.5">{maxValue} Menit</p>
                          </div>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${progressBg} transition-all rounded-full`} 
                            style={{ width: `${Math.min((avgValue / 40) * 100, 100) || 2}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-600">
                <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-800 block">Rekomendasi Kebijakan (Solution X-100C):</span>
                  Untuk departemen dengan rata-rata &ge;10 menit, disarankan menjadwalkan kalibrasi jam fingerprint mandiri atau penyesuaian toleransi keterlambatan shift di pengaturan.
                </div>
              </div>
            </div>
          </>
        );
      case 'overtime-chart':
        return (
          <>
            <div className="flex justify-between items-start gap-3 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-amber-500" /> Analisis Biaya Lembur Bulanan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Akumulasi pengeluaran uang lembur bulanan dibandingkan target pagu anggaran perusahaan</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 rounded border border-amber-100 uppercase tracking-widest font-mono shrink-0">
                Grafik Area
              </span>
            </div>

            <div className="h-68 text-xs" id="overtime-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={overtimeCostTrend}
                  margin={{ top: 5, right: 5, left: 15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLembur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorAnggaran" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<OvertimeCostTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area 
                    name="Beban Lembur Realisasi"
                    type="monotone" 
                    dataKey="Biaya Lembur" 
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorLembur)" 
                  />
                  <Area 
                    name="Target Anggaran Pagu"
                    type="monotone" 
                    dataKey="Target Anggaran" 
                    stroke="#06B6D4" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorAnggaran)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-amber-500" /> Realisasi Pengeluaran</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-1 border-b border-dashed border-cyan-500" /> Target Anggaran Pagu Kantor</span>
            </div>
          </>
        );
      case 'overtime-budget':
        return (
          <>
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-805 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" /> Status Efisiensi Anggaran Lembur
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Persentase utilisasi pengeluaran bulanan dibandingkan batas budget tahunan komparatif</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded border border-slate-200 uppercase tracking-widest font-mono shrink-0">
                    METRIK BUDGET
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold block">RATA-RATA PENGELUARAN</p>
                    <p className="text-sm font-extrabold text-slate-800 font-mono mt-1">
                      Rp {Math.round(overtimeCostTrend.reduce((sum, item) => sum + item['Biaya Lembur'], 0) / overtimeCostTrend.length).toLocaleString('id-ID')}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Per bulan (12 bulan terakhir)</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold block">PUNCAK LEMBUR BULANAN</p>
                    <p className="text-sm font-extrabold text-rose-600 font-mono mt-1">
                      Rp {Math.max(...overtimeCostTrend.map(item => item['Biaya Lembur'])).toLocaleString('id-ID')}
                    </p>
                    <p className="text-[9px] text-rose-500 font-medium mt-0.5">Terjadi pada Desember 2025</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  {(() => {
                    const juneData = overtimeCostTrend.find(item => item.name === 'Jun 2026') || { 'Biaya Lembur': 5800000, 'Target Anggaran': 12000000 };
                    const bLembur = juneData['Biaya Lembur'];
                    const tAnggaran = juneData['Target Anggaran'];
                    const percent = Math.min(Math.round((bLembur / tAnggaran) * 100), 100);
                    const isSafe = bLembur <= tAnggaran;

                    return (
                      <div className="border border-slate-100 p-3 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="font-extrabold text-slate-700 text-xs">Utilisasi Anggaran Bulan Ini (Juni 2026)</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Realisasi berdasarkan log Solution X-100C aktif</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isSafe ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'}`}>
                            {percent}% Terpakai
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500 hover:bg-rose-600'} transition-all rounded-full`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-2">
                          <span className="font-mono">Rp {bLembur.toLocaleString('id-ID')}</span>
                          <span className="font-mono text-slate-400">Target Maks: Rp {tAnggaran.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-600">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-800 block">Rekomendasi Kontrol Fiskal SDM:</span>
                  Realisasi lembur rata-rata terkendali di bawah pagu (efisiensi fiskal optimal). Pertahankan koordinasi shift kerja dan validasi biometric checkout pra-persetujuan untuk mencegah pembengkakan sisa kas tahunan.
                </div>
              </div>
            </div>
          </>
        );
      case 'asset-utilization':
        return (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-805 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-blue-600" /> Analisis Utilisasi Aset per Departemen
                </h3>
                <p className="text-xs text-slate-400 mt-1">Rasio persentase pemakaian aset yang dipinjam dibanding pagu alokasi per divisi</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-750 rounded border border-blue-105 uppercase tracking-widest font-mono shrink-0">
                UTILISASI (%)
              </span>
            </div>

            <div className="h-68 text-xs" id="asset-utilization-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assetUtilizationData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dept" 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (val === 'IT & Engineering') return 'IT';
                      if (val === 'Finance & Accounting') return 'Finance';
                      if (val === 'Marketing & Sales') return 'Marketing';
                      return val;
                    }}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<AssetStatusTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={32} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Bar 
                    name="Rasio Pemakaian (%)" 
                    dataKey="ratio" 
                    fill="#3B82F6" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  >
                    {assetUtilizationData.map((entry, index) => {
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'asset-depreciation':
        return (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-805 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" /> Peringatan Depresiasi &amp; Masa Pakai
                </h3>
                <p className="text-xs text-slate-400 mt-1">Daftar aset korporasi yang telah melebihi batas estimasi usia ekonomis pakai</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 rounded border border-rose-100 uppercase tracking-widest font-mono shrink-0">
                {depreciatedAssets.length} Kritis
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {depreciatedAssets.length === 0 ? (
                <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-400 text-xs font-semibold">
                  Sempurna! Tidak ada aset yang melebihi batas masa pakai ekonomis.
                </div>
              ) : (
                depreciatedAssets.map((asset: any) => (
                  <div 
                    key={asset.id} 
                    className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold mr-1.5">
                          {asset.tagNumber}
                        </span>
                        <strong className="text-slate-800 font-semibold">{asset.name}</strong>
                      </div>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-mono">
                        Depresiasi {asset.depreciationPct}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium">
                      <div>
                        Cat: <strong className="text-slate-600">{asset.category}</strong>
                      </div>
                      <div>
                        Kondisi: <strong className={`${asset.condition === 'Rusak/Perbaikan' ? 'text-rose-600' : 'text-amber-600'}`}>{asset.condition}</strong>
                      </div>
                      <div>
                        Tgl Beli: <strong className="text-slate-600">{asset.purchaseDate}</strong>
                      </div>
                      <div>
                        Masa Pakai: <strong className="text-slate-655">{asset.ageYears} / {asset.lifespanYears} thn</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-450 border-t border-slate-100 pt-1.5 mt-1">
                      <span>Status: <strong className="text-slate-655 font-bold">{asset.status}</strong></span>
                      {asset.loanedToName && (
                        <span>Peminjam: <strong className="text-slate-655">{asset.loanedToName}</strong></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-655 leading-normal">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-805 block">SOP Depresiasi &amp; PSAK No.16:</span>
                Aset dengan persentase depresiasi mencapai 100% harus segera dijadwalkan untuk audit fisik, revitalisasi, atau write-off neraca operasional.
              </div>
            </div>
          </>
        );
      case 'dept-distribution':
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-805 tracking-tight flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600 animate-pulse" /> Distribusi Departemen Karyawan
                </h3>
                <p className="text-xs text-slate-400 mt-1">Komparasi proporsi total staf aktif per unit operasional</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-100 uppercase tracking-widest font-mono shrink-0">
                Donut Chart
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="w-full sm:w-1/2 h-56 flex justify-center items-center relative" id="dept-donut-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData.deptChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {demographicsData.deptChartData.map((entry, index) => {
                        const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} Orang`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AKTIF</span>
                  <span className="text-xl font-extrabold text-slate-800 leading-tight">
                    {employees.filter(e => e.status === 'Aktif').length}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Staf</span>
                </div>
              </div>

              <div className="w-full sm:w-1/2 space-y-2">
                {demographicsData.deptChartData.map((item, index) => {
                  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];
                  const total = demographicsData.deptChartData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs border-b border-dashed border-slate-100 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-655 font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-805 font-bold">{item.value}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      case 'age-distribution':
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-855 tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Rasio Demografi Usia Staf
                </h3>
                <p className="text-xs text-slate-400 mt-1">Penyebaran usia staf aktif berdasarkan klasifikasi generasi kerja</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded border border-emerald-100 uppercase tracking-widest font-mono shrink-0">
                Rasio Usia
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="w-full sm:w-1/2 h-56 flex justify-center items-center relative" id="age-donut-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData.ageChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {demographicsData.ageChartData.map((entry, index) => {
                        const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#A855F7'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} Orang`, name]}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">RATA-RATA</span>
                  <span className="text-xl font-extrabold text-slate-800 leading-tight">
                    33.5
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Tahun</span>
                </div>
              </div>

              <div className="w-full sm:w-1/2 space-y-2.5">
                {demographicsData.ageChartData.map((item, index) => {
                  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#A855F7'];
                  const total = demographicsData.ageChartData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs border-b border-dashed border-slate-100 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-655 font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-805 font-bold">{item.value}</span>
                        <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Real-time KPI entries compiled for all active employees
  const compiledKpis = React.useMemo(() => {
    return employees.map(emp => {
      const defaultTargets = {
        targetAttendanceRate: 95,
        targetLatenessMinutes: 45,
        targetOvertimeHours: 12,
        targetAllowedViolations: 0
      };
      
      const target = kpiTargetsMap[emp.id] || defaultTargets;
      
      // Calculate actual values for June 2026
      const empLogs = attendance.filter(log => log.employeeId === emp.id && log.date.startsWith('2026-06'));
      const presentCount = empLogs.filter(log => 
        log.status === 'Hadir' || 
        log.status === 'Terlambat' || 
        log.status === 'Pulang Cepat' || 
        log.status === 'Hadir (Libur)'
      ).length;
      
      // Total approved leaves in June 2026
      const empLeaves = leaves.filter(lv => 
        lv.employeeId === emp.id && 
        lv.status === 'Disetujui' && 
        (lv.startDate.startsWith('2026-06') || lv.endDate.startsWith('2026-06'))
      );
      const totalLeaveDays = empLeaves.reduce((acc, lv) => acc + (lv.duration || 0), 0);
      
      // Attendance rate formula: (present days + excused leave days) / total logged calendar capacity
      const totalScheduledDays = Math.max(12, empLogs.length); // standard base shift duration
      const actualAttendanceRate = totalScheduledDays > 0 
        ? Math.min(100, Math.round(((presentCount + totalLeaveDays) / totalScheduledDays) * 100)) 
        : 100;
      
      // Actual accumulated lateness minutes
      const actualLateness = empLogs.reduce((acc, log) => acc + (log.lateMinutes || 0), 0);
      
      // Actual accumulated overtime hours
      const actualOvertimeMinutes = empLogs.reduce((acc, log) => acc + (log.overtimeMinutes || 0), 0);
      const actualOvertime = Math.round((actualOvertimeMinutes / 60) * 10) / 10;
      
      // Actual active violations count
      const actualViolations = violations.filter(v => v.employeeId === emp.id && v.status === 'Aktif').length;
      
      // SCORING LOGIC
      // 1. Attendance penalty (2 pts per 1% below target)
      const attDiff = target.targetAttendanceRate - actualAttendanceRate;
      const attPenalty = attDiff > 0 ? attDiff * 2 : 0;
      
      // 2. Lateness penalty (1.5 pts per 10 mins over target)
      const lateExceeded = actualLateness - target.targetLatenessMinutes;
      const latePenalty = lateExceeded > 0 ? (lateExceeded / 10) * 1.5 : 0;
      
      // 3. Overtime bonus (1.5 pts per hour up to max +15 pts)
      const otEarned = actualOvertime;
      const otBonus = Math.min(15, otEarned * 1.5);
      
      // 4. Violation penalty (20 pts per excess violation)
      const violationExceeded = actualViolations - target.targetAllowedViolations;
      const violationPenalty = violationExceeded > 0 ? violationExceeded * 20 : 0;
      
      // Calculate final score
      const finalScore = Math.min(100, Math.max(0, Math.round(100 - attPenalty - latePenalty + otBonus - violationPenalty)));
      
      // Determine Grade
      let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
      let gradeLabel = 'Cukup';
      if (finalScore >= 90) {
        grade = 'A';
        gradeLabel = 'Sangat Baik';
      } else if (finalScore >= 80) {
        grade = 'B';
        gradeLabel = 'Baik';
      } else if (finalScore >= 70) {
        grade = 'C';
        gradeLabel = 'Cukup';
      } else if (finalScore >= 60) {
        grade = 'D';
        gradeLabel = 'Kurang';
      } else {
        grade = 'E';
        gradeLabel = 'Buruk / Pelanggaran';
      }
      
      return {
        id: emp.id,
        employee: emp,
        target,
        actual: {
          attendanceRate: actualAttendanceRate,
          lateness: actualLateness,
          overtime: actualOvertime,
          violations: actualViolations
        },
        score: finalScore,
        grade,
        gradeLabel
      };
    });
  }, [employees, attendance, leaves, violations, kpiTargetsMap]);

  // KPI average score per department for chart rendering
  const kpiDeptAverageData = React.useMemo(() => {
    const departments = ['IT & Engineering', 'Human Resources', 'Finance & Accounting', 'Operations', 'Marketing & Sales'];
    return departments.map(dept => {
      const deptKpis = compiledKpis.filter(item => item.employee.department === dept);
      const avgScore = deptKpis.length > 0
        ? Math.round(deptKpis.reduce((acc, item) => acc + item.score, 0) / deptKpis.length)
        : 75; // baseline fallback
      return {
        name: dept,
        Score: avgScore
      };
    });
  }, [compiledKpis]);

  // Overall organization stats
  const kpiSummaryStats = React.useMemo(() => {
    if (compiledKpis.length === 0) return { avgScore: 0, countA: 0, countB: 0, countC: 0, countD: 0, countE: 0 };
    const totalScore = compiledKpis.reduce((acc, item) => acc + item.score, 0);
    const avgScore = Math.round(totalScore / compiledKpis.length);
    
    return {
      avgScore,
      countA: compiledKpis.filter(i => i.grade === 'A').length,
      countB: compiledKpis.filter(i => i.grade === 'B').length,
      countC: compiledKpis.filter(i => i.grade === 'C').length,
      countD: compiledKpis.filter(i => i.grade === 'D').length,
      countE: compiledKpis.filter(i => i.grade === 'E').length
    };
  }, [compiledKpis]);

  // High Performers (Top 3 Grade A/B)
  const topPerformers = React.useMemo(() => {
    return [...compiledKpis]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(item => item.score >= 80);
  }, [compiledKpis]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`space-y-6 ${displayDensity === 'ringkas' ? 'density-ringkas' : ''}`}
      id="dashboard-container"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants} 
        className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-sm text-white"
        id="dashboard-welcome"
      >
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight">Selamat Datang di Portal HRIS Enterprise</h2>
          <p className="text-slate-300 mt-2 text-sm leading-relaxed">
            Sistem pemantauan SDM real-time terintegrasi dengan Mesin Fingerprint **Solution X-100C**. 
            Kelola data absensi karyawan, pengajuan cuti, dan slip penggajian secara akurat.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button 
              onClick={() => onNavigate('absensi')} 
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg transition-colors border border-blue-500/20 shadow-sm cursor-pointer"
              id="btn-quick-sync"
            >
              <Activity className="w-3.5 h-3.5" /> Ambil Data Fingerprint
            </button>
            <button 
              onClick={() => onNavigate('payroll')} 
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg transition-colors border border-white/10 cursor-pointer"
              id="btn-quick-payroll"
            >
              Kelola Gaji Periode Ini
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
          <TrendingUp className="w-80 h-80 text-white" />
        </div>
      </motion.div>

      {/* ================= SMART LAYOUT CONTROL PANEL ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-slate-50 to-indigo-50/20 border border-slate-200 rounded-2xl p-5 shadow-xs"
        id="dashboard-smart-layout-control"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-850 tracking-tight">Dashboard Smart Layout™</h3>
                {smartLayout ? (
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                    AKTIF (ROLE-BASED)
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded-full">
                    NONAKTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Secara otomatis menyesuaikan visual, menyembunyikan modul sensitif (Audit Trail, Gaji, dll.), dan meminimalkan alat kerja berdasarkan hak akses peran pengguna secara real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            {/* Toggle Smart Layout Switch */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl p-2 px-3 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-700">Aktifkan Filter Peran</span>
              <button
                type="button"
                onClick={() => setSmartLayout(!smartLayout)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  smartLayout ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                id="toggle-smart-layout"
                title="Aktifkan untuk memfilter modul secara cerdas"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                    smartLayout ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Simulated Role Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 px-2.5 shadow-2xs w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-550 whitespace-nowrap">Simulasi Peran:</span>
              <select
                value={simulatedRole}
                onChange={(e) => setSimulatedRole(e.target.value as any)}
                className="bg-transparent border-none text-[11px] font-bold text-blue-700 focus:outline-none cursor-pointer pr-1 py-1"
                id="select-simulated-role"
              >
                <option value="auto">Deteksi Otomatis (Default)</option>
                <option value="Super Admin">Super Admin (Akses Penuh)</option>
                <option value="HR Manager">HR Manager (Akses Operasional)</option>
                <option value="Division Manager">Division Manager (Akses Sedang)</option>
                <option value="Karyawan">Karyawan (Akses Sederhana/Rendah)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informational Status Row */}
        {smartLayout && (
          <div className="mt-4 pt-3.5 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 bg-slate-100/40 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Hak Akses Berjalan: <strong className="text-slate-800 bg-slate-250 border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">{effectiveRole}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold sm:justify-center">
              <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
              <span>
                Simulasi: {simulatedRole === 'auto' ? (
                  <span className="text-emerald-600 font-bold">Log In ({activeUser?.role || 'Super Admin'})</span>
                ) : (
                  <span className="text-rose-600 font-bold">Manual Overridden ({simulatedRole})</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold sm:justify-end">
              <div className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-750 font-bold px-2 py-0.5 rounded border border-blue-150">
                <span>Tersembunyi: <strong>{12 - filteredLayoutOrder.length} Modul Grafik</strong></span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions Panel */}
      {isModuleVisible('quick-actions-panel') && (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          id="quick-actions-panel"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Akses Pintas Cepat (Quick Actions)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Shortcut operasional HRD untuk peningkatan efisiensi tugas administratif harian</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md">3 Shortcuts Aktif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action 1: Tambah Karyawan Baru */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                onNavigate('karyawan');
                setTimeout(() => {
                  window.dispatchEvent(new Event('hris_open_add_employee'));
                }, 150);
              }}
              className="flex items-center gap-3.5 p-4 bg-gradient-to-br from-emerald-50/60 to-emerald-50/20 hover:from-emerald-50 hover:to-emerald-100/50 border border-emerald-100 hover:border-emerald-200 rounded-2xl text-left transition-all cursor-pointer group"
              id="qa-btn-tambah-karyawan"
            >
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">Tambah Karyawan Baru</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Daftarkan profil staff & PIN mesin fingerprint otomatis.</p>
              </div>
            </motion.button>

            {/* Action 2: Tarik Data Absensi */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                onNavigate('absensi');
                setTimeout(() => {
                  window.dispatchEvent(new Event('hris_trigger_pull_logs'));
                }, 150);
              }}
              className="flex items-center gap-3.5 p-4 bg-gradient-to-br from-blue-50/60 to-blue-50/20 hover:from-blue-50 hover:to-blue-100/50 border border-blue-100 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer group"
              id="qa-btn-tarik-absensi"
            >
              <div className="p-3 bg-blue-500 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">Tarik Data Absensi</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Sinkronisasi log biner Solution X-100C via TCP/IP.</p>
              </div>
            </motion.button>

            {/* Action 3: Generate Slip Gaji */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                onNavigate('payroll');
                setTimeout(() => {
                  window.dispatchEvent(new Event('hris_open_generate_payroll'));
                }, 150);
              }}
              className="flex items-center gap-3.5 p-4 bg-gradient-to-br from-indigo-50/60 to-indigo-50/20 hover:from-indigo-50 hover:to-indigo-100/50 border border-indigo-100 hover:border-indigo-200 rounded-2xl text-left transition-all cursor-pointer group"
              id="qa-btn-generate-payroll"
            >
              <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">Generate Slip Gaji</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Proses penggajian bulanan batch seluruh departemen.</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Pusat Notifikasi Otomatis & Monitor Jatuh Tempo Kontrak */}
      {isModuleVisible('automated-contract-notification-hub') && (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
          id="automated-contract-notification-hub"
        >
          <div className="flex flex-col gap-4 pb-3 border-b border-indigo-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 tracking-tight flex items-center gap-2">
                    Pusat Notifikasi Otomatis Jatuh Tempo Kontrak (PKWT/PKWTT)
                    {expiringEmployees.filter(e => e.diffDays !== Infinity).length > 0 && (
                      <span className="bg-rose-500 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                        {expiringEmployees.filter(e => e.diffDays !== Infinity).length}
                      </span>
                    )}
                    {isModuleMinimized('automated-contract-notification-hub') && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">MINIMIZED</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-450 font-medium">Memantau staf PKWT (Jatuh tempo &le; 30 hari) &amp; PKWTT (Karyawan Tetap) secara real-time</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Manual action expand toggle */}
                <button
                  type="button"
                  onClick={() => toggleModuleExpansion('automated-contract-notification-hub')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-350 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center gap-1.5 text-[10px] font-bold"
                  title={isModuleMinimized('automated-contract-notification-hub') ? "Sembunyikan / Perkecil" : "Tampilkan Detail"}
                >
                  {isModuleMinimized('automated-contract-notification-hub') ? (
                    <>
                      <span>Lihat Detail</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Perkecil</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {!isModuleMinimized('automated-contract-notification-hub') ? (
            <>
              {/* Auto Email Toggle switches */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-700">Auto Email Pengingat (H-30)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAutoEmailEnabled(prev => !prev);
                        window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
                          detail: {
                            module: 'Kontrak',
                            action: 'Konfigurasi',
                            details: `Mengubah pengaturan email pengingat otomatis (H-30) menjadi: ${!isAutoEmailEnabled ? 'AKTIF' : 'NONAKTIF'}.`,
                            status: 'Sukses'
                          }
                        }));
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        isAutoEmailEnabled ? 'bg-indigo-600' : 'bg-slate-350'
                      }`}
                      id="toggle-auto-contract-reminders"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                          isAutoEmailEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-150">
            {/* Filter 1: Kategori Kontrak */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Kategori Kontrak (PKWT/PKWTT):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setKategoriFilter('all')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    kategoriFilter === 'all'
                      ? 'bg-slate-800 text-white border border-slate-800 shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-105'
                  }`}
                >
                  Semua ({employees.filter(e => e.contractType).length})
                </button>
                <button
                  type="button"
                  onClick={() => setKategoriFilter('PKWT')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    kategoriFilter === 'PKWT'
                      ? 'bg-indigo-600 text-white border border-indigo-650 shadow-sm'
                      : 'bg-white text-indigo-600 border border-indigo-150 hover:bg-indigo-50/40'
                  }`}
                >
                  PKWT / Kontrak ({employees.filter(e => e.contractType && e.contractType !== 'Tetap').length})
                </button>
                <button
                  type="button"
                  onClick={() => setKategoriFilter('PKWTT')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    kategoriFilter === 'PKWTT'
                      ? 'bg-emerald-600 text-white border border-emerald-650 shadow-sm'
                      : 'bg-white text-emerald-600 border border-emerald-150 hover:bg-emerald-50/40'
                  }`}
                >
                  PKWTT / Tetap ({employees.filter(e => e.contractType === 'Tetap').length})
                </button>
              </div>
            </div>

            {/* Filter 2: Urgensi Kontrak (Tenggat Expiry) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Urgensi Kontrak (Tenggat Expiry):</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={kategoriFilter === 'PKWTT'}
                  onClick={() => setContractFilter('all')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    kategoriFilter === 'PKWTT' 
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
                      : contractFilter === 'all'
                        ? 'bg-slate-800 text-white border border-slate-800 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-105'
                  }`}
                >
                  Semua PKWT ({expiringEmployees.filter(e => e.emp.contractType !== 'Tetap').length})
                </button>
                <button
                  type="button"
                  disabled={kategoriFilter === 'PKWTT'}
                  onClick={() => setContractFilter('critical')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    kategoriFilter === 'PKWTT' 
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
                      : contractFilter === 'critical'
                        ? 'bg-rose-600 text-white border border-rose-600 shadow-sm'
                        : 'bg-white text-rose-655 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  Tinggi (&le; 15 Hari) ({expiringEmployees.filter(e => e.emp.contractType !== 'Tetap' && e.diffDays <= 15).length})
                </button>
                <button
                  type="button"
                  disabled={kategoriFilter === 'PKWTT'}
                  onClick={() => setContractFilter('normal')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    kategoriFilter === 'PKWTT' 
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
                      : contractFilter === 'normal'
                        ? 'bg-amber-500 text-white border border-amber-500 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-105'
                  }`}
                >
                  Menengah (16-30 Hari) ({expiringEmployees.filter(e => e.emp.contractType !== 'Tetap' && e.diffDays > 15).length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {contractSuccessMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {contractSuccessMsg}
            </span>
            <button 
              onClick={() => setContractSuccessMsg('')} 
              className="text-emerald-500 hover:text-emerald-700 font-extrabold text-sm ml-2 cursor-pointer"
            >
              &times;
            </button>
          </motion.div>
        )}

        {/* Broadcast notification banner */}
        {showBroadcastToast && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-indigo-50 border border-indigo-150 text-indigo-800 rounded-xl text-xs font-bold flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
              Notifikasi evaluasi kinerja dipercepat otomatis terkirim ke Manager Divisi {broadcastTargetDept}!
            </span>
            <button 
              onClick={() => setShowBroadcastToast(false)} 
              className="text-indigo-500 hover:text-indigo-700 font-extrabold text-sm ml-2 cursor-pointer"
            >
              &times;
            </button>
          </motion.div>
        )}

        {filteredExpiringEmployees.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Tidak ada kontrak kerja yang membutuhkan perhatian saat ini.</p>
            <p className="text-[10px] text-slate-450">Seluruh durasi kontrak karyawan non-permanen dalam filter ini berada dalam batas aman.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpiringEmployees.map(({ emp, diffDays }) => {
              const isTetap = emp.contractType === 'Tetap' || diffDays === Infinity;
              const isExpired = !isTetap && diffDays < 0;
              const isCritical = !isTetap && diffDays <= 15;
              const percentUsed = isTetap ? 100 : Math.max(0, Math.min(100, Math.round(((30 - Math.max(0, diffDays)) / 30) * 100)));
              const isNotified = notifiedEmpIds.includes(emp.id);
              const isAutoEmailed = autoEmailedEmpIds.includes(emp.id);

              return (
                <div 
                  key={emp.id} 
                  className={`p-4 border rounded-xl flex flex-col justify-between gap-3.5 transition-all outline-none ${
                    isTetap
                      ? 'bg-emerald-50/25 border-emerald-200 hover:border-emerald-300 shadow-xs'
                      : isExpired 
                        ? 'bg-rose-50/40 border-rose-300 shadow-rose-50/10' 
                        : isCritical 
                          ? 'bg-amber-50/25 border-amber-200 hover:border-amber-300' 
                          : 'bg-slate-50/20 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 truncate min-w-0">
                      {emp.photoUrl ? (
                        <img 
                          src={emp.photoUrl} 
                          alt={emp.name} 
                          className="w-11 h-11 rounded-full border border-slate-250 object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center rounded-full border border-indigo-100 shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 leading-snug">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-extrabold text-slate-800 text-xs block truncate leading-tight">{emp.name}</span>
                          {isTetap ? (
                            <span className="bg-emerald-100 text-emerald-805 text-[8px] px-1.5 py-0.2 rounded-md font-black tracking-wide uppercase">PKWTT</span>
                          ) : (
                            <span className="bg-indigo-100 text-indigo-850 text-[8px] px-1.5 py-0.2 rounded-md font-black tracking-wide uppercase">PKWT</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block truncate mt-0.5">{emp.position}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold inline-block mt-1">
                          {emp.department} • {emp.contractType || 'Tetap'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isTetap ? (
                        <span className="bg-emerald-50 text-emerald-750 text-[9px] px-2 py-0.5 rounded font-black border border-emerald-200 uppercase tracking-wider">
                          Aktif Permanen
                        </span>
                      ) : isExpired ? (
                        <span className="bg-rose-100 text-rose-700 text-[9px] px-2 py-0.5 rounded font-black border border-rose-200 uppercase tracking-wider">
                          Sudah Habis
                        </span>
                      ) : diffDays === 0 ? (
                        <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded font-black border border-rose-600 animate-pulse uppercase tracking-wider">
                          HARI INI
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold border uppercase tracking-wider ${
                          isCritical 
                            ? 'bg-rose-50 text-rose-750 border-rose-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-250'
                        }`}>
                          {diffDays} Hari Sisa
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 block mt-1.5 font-mono font-medium">
                        {isTetap ? 'Skema: Tanpa Batas Waktu' : `Jatuh tempo: ${emp.contractEndDate}`}
                      </span>
                    </div>
                  </div>

                  {/* Expiry Warning Progress gauge */}
                  {isTetap ? (
                    <div className="p-2.5 bg-emerald-50/55 rounded-lg border border-emerald-100 flex items-center gap-1.5 text-[9.5px] text-emerald-850 leading-relaxed font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Hubungan kerja PKWTT aktif definitif tanpa kewajiban evaluasi perpanjangan berkala. Pelaporan tahunan terstruktur.</span>
                    </div>
                  ) : !isExpired ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>Pemberitahuan Kadaluarsa</span>
                          {isAutoEmailed && (
                            <span className="text-indigo-600 font-extrabold flex items-center gap-0.5">
                              • 📧 Email H-30 Otomatis Sent
                            </span>
                          )}
                        </div>
                        <span>{percentUsed}% Urgensi</span>
                      </div>
                      <div className="w-full bg-slate-105 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-[#3B82F6]'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100 flex items-center gap-1.5 text-[9px] text-rose-850 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                      <span>Masa kontrak PKWT habis! Hubungan kerja harus segera diamandemen atau diperpanjang.</span>
                    </div>
                  )}

                  {/* Actions Bar per employee */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRenewalEmp(emp);
                          setNewContractType(emp.contractType === 'Magang' ? 'Magang' : 'Kontrak');
                          setNewDurationMonths('12');
                          setShowRenewalModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        {isTetap ? 'Ubah Status Kontrak' : 'Perbarui Kontrak'}
                      </button>

                      <button
                        onClick={() => {
                          setPreviewSkEmp(emp);
                          setIsSkDownloaded(false);
                        }}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        title={isTetap ? "Tinjau SK Pengangkatan Karyawan Tetap" : "Tinjau draft SK (Perjanjian Kerja)"}
                      >
                        <FileText className="w-3.5 h-3.5" /> SK
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAutoEmailed && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-lg flex items-center gap-1" title="Sistem otomatis mengirim pengingat ke manajer tepat 30 hari sebelum kontrak berakhir.">
                          <Check className="w-3 h-3 text-indigo-650 shrink-0" /> H-30 Otomatis
                        </span>
                      )}

                      <button
                        onClick={() => {
                          if (!notifiedEmpIds.includes(emp.id)) {
                            setNotifiedEmpIds(prev => [...prev, emp.id]);
                          }
                          setBroadcastTargetDept(emp.department);
                          setShowBroadcastToast(true);
                          
                          // Track in Audit Log
                          window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
                            detail: {
                              module: 'Kontrak',
                              action: 'Kirim Email Manual',
                              details: `HRD mengirimkan email pengingat evaluasi manual untuk ${emp.name} kepada Manager Divisi ${emp.department} (${emp.email || 'manager@enterprise.co.id'}).`,
                              status: 'Sukses'
                            }
                          }));

                          setTimeout(() => setShowBroadcastToast(false), 8000);
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          isNotified 
                            ? 'bg-emerald-50 text-emerald-750 border border-emerald-150 font-extrabold' 
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-180 text-slate-600'
                        }`}
                      >
                        {isNotified ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            Reminder Terkirim
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            Kirim Pengingat
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button 
            onClick={() => onNavigate('karyawan')}
            className="text-[10.5px] font-extrabold text-indigo-700 hover:text-indigo-800 transition-all flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-110 px-3 py-1.5 rounded-xl cursor-pointer"
            id="btn-go-to-employees-from-alert"
          >
            Lihat Semua Manajemen Kontrak &rarr;
          </button>
        </div>
            </>
          ) : (
            <div className="bg-rose-50/50 border border-slate-250 p-3.5 rounded-xl flex items-center justify-between text-xs text-rose-800">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                ⚠️ Ada {expiringEmployees.filter(e => e.diffDays !== Infinity).length} Karyawan dengan kontrak/PKWT yang mendekati masa jatuh tempo (H-30).
              </span>
              <button
                onClick={() => toggleModuleExpansion('automated-contract-notification-hub')}
                className="text-[10px] text-indigo-700 bg-white hover:bg-slate-100/50 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
              >
                Lihat Semua Detil Kontrak
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* KPI Stats Block */}
      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        id="dashboard-kpi-grid"
      >
        {/* KPI 1 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-slate-300 transition-all flex items-center gap-4"
          id="kpi-total-employees"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-550 uppercase tracking-wider">Total Karyawan</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{totalEmployees} Karyawan</h3>
            <p className="text-[11px] text-slate-400 mt-1">{activeEmployees} Aktif | {totalEmployees - activeEmployees} Cuti/Nonaktif</p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-slate-300 transition-all flex items-center gap-4"
          id="kpi-attendance"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-550 uppercase tracking-wider">Hadir Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{attendanceRate}%</h3>
            <p className="text-[11px] text-slate-400 mt-1">{presentToday} dari {activeEmployees} karyawan aktif</p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-slate-300 transition-all flex items-center gap-4"
          id="kpi-late"
        >
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-550 uppercase tracking-wider">Terlambat Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{lateToday} Orang</h3>
            <p className="text-[11px] text-orange-600 font-medium mt-1">Butuh review toleransi shift</p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          variants={itemVariants}
          className="bg-blue-600 border border-blue-700 shadow-md rounded-xl p-5 text-white flex items-center gap-4"
          id="kpi-leaves"
        >
          <div className="p-3 bg-white/10 text-white rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Cuti & Pengajuan</p>
            <h3 className="text-xl font-bold text-white mt-1">{pendingLeavesCount} Tertunda</h3>
            <button 
              onClick={() => onNavigate('cuti')}
              className="text-[11px] text-blue-100 hover:text-white font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
              id="kpi-link-cuti"
            >
              Proses Persetujuan &rarr;
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= GEMINI SMART INSIGHT PANEL ================= */}
      {isModuleVisible('dashboard-smart-insight-panel') && (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          id="dashboard-smart-insight-panel"
        >
          <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/10 to-transparent border-b border-slate-150 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-850 tracking-tight flex items-center gap-2">
                  Smart HR Insight &amp; Strategi Kebijakan
                  {isModuleMinimized('dashboard-smart-insight-panel') && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">MINIMIZED</span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-450 font-medium mt-0.5">Analisis tren presensi otomatis &amp; rekomendasi regulasi berbasis Gemini AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => toggleModuleExpansion('dashboard-smart-insight-panel')}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold text-[10px] rounded-lg border border-slate-250 cursor-pointer transition-all flex items-center gap-1.5"
              >
                {isModuleMinimized('dashboard-smart-insight-panel') ? (
                  <>
                    <span>Lihat Detil Insight</span>
                    <ChevronDown className="w-3" />
                  </>
                ) : (
                  <>
                    <span>Perkecil</span>
                    <ChevronUp className="w-3" />
                  </>
                )}
              </button>

              {!isModuleMinimized('dashboard-smart-insight-panel') && insightText && !insightLoading && (
                <>
                  <button
                    onClick={handleCopyInsight}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all cursor-pointer"
                    id="btn-copy-insight"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin' : 'Salin Laporan'}
                  </button>
                  <button
                    onClick={generateSmartInsight}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-150 font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all cursor-pointer"
                    id="btn-regenerate-insight"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Analisis Ulang
                  </button>
                </>
              )}
            </div>
          </div>

          {!isModuleMinimized('dashboard-smart-insight-panel') ? (
            <div className="p-6">
          {insightLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4" id="insight-loader">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-600/10 w-16 h-16 animate-ping" />
                <div className="relative p-4 bg-blue-50 text-blue-600 rounded-full border border-blue-100/50">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="text-slate-800 font-extrabold text-xs">Menyusun Analisa HRIS...</p>
                <p className="text-slate-450 text-[11px] h-4 font-mono animate-pulse">
                  {loadingStep === 0 && "Membaca data rekaman absensi sidik jari..."}
                  {loadingStep === 1 && "Menganalisis korelasi keterlambatan dengan kehadiran divisi..."}
                  {loadingStep === 2 && "Mengekstrak tren kedisiplinan & absensi bulanan..."}
                  {loadingStep === 3 && "Menyusun rekomendasi kebijakan terkait Solution X-100C..."}
                  {loadingStep === 4 && "Memformulasikan draf laporan final..."}
                </p>
              </div>
            </div>
          ) : insightError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3.5" id="insight-error-container">
              <AlertCircle className="w-5.5 h-5.5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">Analisis Gagal Diproses</h4>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">{insightError}</p>
                <button
                  onClick={generateSmartInsight}
                  className="mt-3.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Coba Hubungkan Ulang
                </button>
              </div>
            </div>
          ) : !insightText ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-4" id="insight-empty">
              <div className="p-3 bg-blue-50/70 text-blue-500 rounded-full border border-blue-50/30">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Hasilkan Laporan Kinerja &amp; Rekomendasi HR</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Sistem akan mengompilasi data tarikan sidik jari Solution X-100C, tren tingkat keterlambatan divisi, rasio sakit/alpa, lalu menganalisisnya menggunakan Gemini AI untuk merekomendasikan draf kebijakan kerja yang optimal bagi perusahaan Anda.
                </p>
              </div>
              <button
                onClick={generateSmartInsight}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-all cursor-pointer"
                id="btn-trigger-ai-analysis"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" /> Mulai Analisa Cerdas (Gemini AI)
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              id="insight-content"
            >
              <div className="border border-slate-150 rounded-2xl bg-slate-50/30 p-5 overflow-auto max-h-[450px] shadow-inner scrollbar-thin">
                <MarkdownPreview content={insightText} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Kuantifikasi Data: {employees.length} staf &bull; {attendance.filter(r => r.date.startsWith('2026-06')).length} catatan presensi Juni
                </span>
                <span className="italic">Data-driven analysis &bull; PT BIOMETRIC PORTAL UTAMA</span>
              </div>
            </motion.div>
          )}
        </div>
          ) : (
            <div className="bg-indigo-50/30 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse shrink-0" />
                Gemini AI Smart Insight siap menganalisis {employees.length} log aktif &amp; tren regulasi perusahaan.
              </span>
              <button
                onClick={() => toggleModuleExpansion('dashboard-smart-insight-panel')}
                className="text-[10px] text-blue-700 bg-white hover:bg-slate-100 border border-blue-200 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
              >
                Buka &amp; Analisa Sekarang
              </button>
            </div>
          )}
        </motion.div>
      )}
      
      {/* ================= MODUL KPI SCORECARD & ANALISA KINERJA PEGAWAI ================= */}
      {isModuleVisible('dashboard-kpi-scorecard-panel') && (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          id="dashboard-kpi-scorecard-panel"
        >
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/5 to-transparent border-b border-slate-150 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/10">
                <Award className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-850 tracking-tight flex items-center gap-2">
                  Evaluasi Kinerja &amp; KPI Scorecard Pegawai (Real-Time)
                  <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Data Terintegrasi
                  </span>
                  {isModuleMinimized('dashboard-kpi-scorecard-panel') && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-black tracking-normal">MINIMIZED</span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-450 font-medium mt-0.5">
                  Mengukur real-time indeks kedisiplinan (X-100C), jam lembur biometrik, ketetapan cuti, serta catatan sanksi divisi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  if (isModuleMinimized('dashboard-kpi-scorecard-panel')) {
                    toggleModuleExpansion('dashboard-kpi-scorecard-panel');
                    setIsKpiPanelExpanded(true);
                  } else {
                    setIsKpiPanelExpanded(!isKpiPanelExpanded);
                  }
                }}
                className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-650 transition-all border border-slate-200 cursor-pointer text-[10px] font-bold rounded-lg flex items-center gap-1"
                title={finalKpiExpanded ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
                id="btn-toggle-kpi-panel"
              >
                <span>{finalKpiExpanded ? 'Sembunyikan' : 'Tampilkan Detail'}</span>
                {finalKpiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {finalKpiExpanded && (
            <div className="p-5 space-y-6">
            
            {/* Success Success feedback row */}
            {kpiSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-bold leading-normal flex items-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                {kpiSuccessMsg}
              </div>
            )}

            {/* SECTION 1: GLOBAL INSIGHTS & CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard Stat Box 1: Overall Average Organization Score */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between" id="kpi-score-avg-card">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rata-Rata Kinerja Kantor</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{kpiSummaryStats.avgScore}</span>
                    <span className="text-slate-400 font-bold text-sm">/ 100</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-2 font-medium leading-relaxed">
                    Indeks agregat berbasis pencapaian tingkat kehadiran, kedisiplinan jam masuk, jam lembur, dan tingkat kepatuhan sanksi karyawan berkelanjutan.
                  </p>
                </div>
                
                {/* Distribution of Grades list */}
                <div className="border-t border-slate-200/60 pt-3 mt-4 space-y-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Proporsi Mutu Kinerja (Grades)</span>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 px-0.5">
                      <span className="text-[10px] font-black text-emerald-800 block font-sans">A</span>
                      <span className="text-[11px] font-bold text-emerald-950 font-mono mt-0.5 block">{kpiSummaryStats.countA}</span>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-lg py-1.5 px-0.5">
                      <span className="text-[10px] font-black text-teal-850 block font-sans">B</span>
                      <span className="text-[11px] font-bold text-teal-950 font-mono mt-0.5 block">{kpiSummaryStats.countB}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg py-1.5 px-0.5">
                      <span className="text-[10px] font-black text-amber-850 block font-sans">C</span>
                      <span className="text-[11px] font-bold text-amber-950 font-mono mt-0.5 block">{kpiSummaryStats.countC}</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg py-1.5 px-0.5">
                      <span className="text-[10px] font-black text-orange-850 block font-sans">D</span>
                      <span className="text-[11px] font-bold text-orange-950 mt-0.5 font-mono block">{kpiSummaryStats.countD}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-lg py-1.5 px-0.5">
                      <span className="text-[10px] font-black text-rose-850 block font-sans">E</span>
                      <span className="text-[11px] font-bold text-rose-950 font-mono mt-0.5 block">{kpiSummaryStats.countE}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BarChart: Average KPI per Department */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between" id="kpi-department-chart-card">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rata-Rata KPI per Departemen</span>
                  <div className="h-44 text-xs mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kpiDeptAverageData} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} 
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#64748B', fontSize: 8 }} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#fff' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Bar dataKey="Score" radius={[4, 4, 0, 0]} barSize={20}>
                          {kpiDeptAverageData.map((entry, index) => {
                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 text-center italic mt-1 block">
                  Departemen dengan mutu tertinggi berhak atas bonus tunjangan apresiasi divisi.
                </span>
              </div>

              {/* Top Performers (Top 3 Grade A / B) */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between" id="kpi-leaderboard-card">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Peringkat 3 Pegawai Terbaik Bulan Ini</span>
                  <div className="space-y-2.5 mt-3 animate-in fade-in duration-300">
                    {topPerformers.map((item, index) => {
                      const medalStyles = [
                        { icon: '🥇', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
                        { icon: '🥈', bg: 'bg-slate-200 text-slate-800 border-slate-300' },
                        { icon: '🥉', bg: 'bg-orange-100 text-orange-850 border-orange-200' }
                      ];
                      const style = medalStyles[index] || { icon: '⭐', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
                      
                      return (
                        <div key={item.employee.id} className="flex items-center justify-between p-2 bg-white border border-slate-200/80 rounded-xl hover:shadow-xs transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-8 h-8 rounded-lg ${style.bg} border flex items-center justify-center text-sm font-black`}>
                              {style.icon}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{item.employee.name}</h4>
                              <p className="text-[9px] text-gray-400 truncate">{item.employee.position} &bull; {item.employee.department}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-800 block font-mono">{item.score} <span className="text-[9px] text-slate-400">pts</span></span>
                            <span className="text-[9px] font-bold text-emerald-600">Grade {item.grade}</span>
                          </div>
                        </div>
                      );
                    })}
                    {topPerformers.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400">Deskripsi peringkat kosong untuk periode berjalan.</div>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-indigo-700 font-bold mt-2 leading-relaxed bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 font-sans">
                  💡 Evaluasi otomatis dilakukan secara real-time berdasarkan data absensi finger X-100C.
                </p>
              </div>

            </div>

            {/* EDIT SASARAN/TARGET DRAWER PANEL */}
            {editingKpiEmpId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-50/40 via-blue-50/20 to-white border border-indigo-200 rounded-2xl p-5"
                id="kpi-target-editor-panel"
              >
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                      <Sparkles className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Atur Sasaran &amp; Target KPI Pegawai</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        Menyesuaikan kriteria target khusus untuk karyawan: <strong className="text-slate-800">{employees.find(e => e.id === editingKpiEmpId)?.name}</strong> ({editingKpiEmpId})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingKpiEmpId(null)}
                    className="text-[10px] bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field 1: Target Attendance Rate */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Target Rasio Kehadiran (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingTargetAttendance}
                        onChange={(e) => setEditingTargetAttendance(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono text-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-600 select-none">%</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Rasio standar minimal kehadiran divisi.</p>
                  </div>

                  {/* Field 2: Target Lateness Minutes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Toleransi Terlambat (Menit/Bulan)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editingTargetLateness}
                        onChange={(e) => setEditingTargetLateness(Math.max(0, Number(e.target.value)))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono text-slate-800"
                      />
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap select-none">mnt</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Kumulasi maksimal keterlambatan per bulan.</p>
                  </div>

                  {/* Field 3: Target Overtime Hours */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Target Jam Lembur (Jam/Bulan)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editingTargetOvertime}
                        onChange={(e) => setEditingTargetOvertime(Math.max(0, Number(e.target.value)))}
                        className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono text-slate-800"
                      />
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap select-none">jam</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Alokasi target lembur pegawai demi apresiasi.</p>
                  </div>

                  {/* Field 4: Allowed Violations */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Maksimal Pelanggaran/SP</label>
                    <select
                      value={editingTargetViolations}
                      onChange={(e) => setEditingTargetViolations(Number(e.target.value))}
                      className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold text-slate-700"
                    >
                      <option value="0">0 (Tidak Ada Toleransi)</option>
                      <option value="1">1 Kasus SP1</option>
                      <option value="2">2 Kasus SP2</option>
                      <option value="3">3 Kasus SP3</option>
                    </select>
                    <p className="text-[9px] text-slate-400">Peringkat kedisplinan SOP.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-indigo-100">
                  <button
                    type="button"
                    onClick={() => setEditingKpiEmpId(null)}
                    className="px-4 py-2 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                  >
                    Batalkan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const empName = employees.find(e => e.id === editingKpiEmpId)?.name || '';
                      handleSaveKpiTargets(editingKpiEmpId, empName);
                    }}
                    className="px-4 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Sasaran KPI
                  </button>
                </div>
              </motion.div>
            )}

            {/* SECTION 2: TABLE SEARCH & FILTERS CONTROLS */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4" id="kpi-scorecard-filters-section">
              <div className="flex flex-col md:flex-row items-center gap-2.5 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={kpiSearch}
                    onChange={(e) => setKpiSearch(e.target.value)}
                    placeholder="Cari nama karyawan..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
                  />
                </div>

                <select
                  value={kpiDeptFilter}
                  onChange={(e) => setKpiDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-44 hover:bg-slate-50 cursor-pointer"
                >
                  <option value="all">Semua Departemen</option>
                  <option value="IT & Engineering">IT &amp; Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Accounting">Finance &amp; Accounting</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing & Sales">Marketing &amp; Sales</option>
                </select>

                <select
                  value={kpiGradeFilter}
                  onChange={(e) => setKpiGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-44 hover:bg-slate-50 cursor-pointer"
                >
                  <option value="all">Semua Grade Mutu</option>
                  <option value="A">Grade A (Sangat Baik)</option>
                  <option value="B">Grade B (Baik)</option>
                  <option value="C">Grade C (Cukup)</option>
                  <option value="D">Grade D (Kurang)</option>
                  <option value="E">Grade E (Pelanggaran)</option>
                </select>
              </div>

              <span className="text-[10px] text-slate-400 font-bold bg-slate-200/50 border border-slate-150 px-2.5 py-1 rounded-xl">
                Tampilan Real-Time Bulan Ini (Juni 2026)
              </span>
            </div>

            {/* SECTION 3: EMPLOYEES TARGETS & ACTUAL ACHIEVEMENT TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-bold uppercase border-b border-slate-100 text-[10px]">
                    <th className="p-3">Karyawan</th>
                    <th className="p-3">Sasaran vs Aktual</th>
                    <th className="p-3 text-center">Rasio Target Terpenuhi</th>
                    <th className="p-3">Total Skor KPI</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compiledKpis
                    .filter((item) => {
                      const matchesSearch = item.employee.name.toLowerCase().includes(kpiSearch.toLowerCase());
                      const matchesDept = kpiDeptFilter === 'all' || item.employee.department === kpiDeptFilter;
                      const matchesGrade = kpiGradeFilter === 'all' || item.grade === kpiGradeFilter;
                      return matchesSearch && matchesDept && matchesGrade;
                    })
                    .map((item) => {
                      const isWarnAttendance = item.actual.attendanceRate < item.target.targetAttendanceRate;
                      const isWarnLateness = item.actual.lateness > item.target.targetLatenessMinutes;
                      const isWarnOvertime = item.actual.overtime < item.target.targetOvertimeHours;
                      const isWarnViolations = item.actual.violations > item.target.targetAllowedViolations;
                      
                      // Calculate average achievement percent for visualization
                      const actLatenessIndex = item.actual.lateness === 0 ? 100 : Math.max(0, 100 - (item.actual.lateness / Math.max(1, item.target.targetLatenessMinutes)) * 100);
                      const actOtIndex = item.target.targetOvertimeHours === 0 ? 100 : Math.min(100, (item.actual.overtime / item.target.targetOvertimeHours) * 105);
                      const actSpIndex = item.actual.violations === 0 ? 100 : 0;
                      
                      const avgAchievementPercent = Math.min(100, Math.round(
                        (item.actual.attendanceRate + actLatenessIndex + actOtIndex + actSpIndex) / 4
                      ));

                      return (
                        <tr key={item.employee.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-none">
                          <td className="p-3">
                            <div className="font-bold text-slate-850">{item.employee.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{item.employee.position}</div>
                            <div className="text-[9px] text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded w-max mt-0.5 font-bold border border-indigo-100/50">
                              {item.employee.department}
                            </div>
                          </td>
                          <td className="p-3 space-y-1.5">
                            {/* Attendance row */}
                            <div className="flex items-center justify-between gap-4 text-[10px]">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Kehadiran:
                              </span>
                              <span className="font-mono">
                                <span className={isWarnAttendance ? 'text-rose-600 font-bold' : 'text-emerald-500 font-semibold'}>
                                  {item.actual.attendanceRate}%
                                </span>
                                <span className="text-slate-400"> (Min Tgt: {item.target.targetAttendanceRate}%)</span>
                              </span>
                            </div>

                            {/* Lateness row */}
                            <div className="flex items-center justify-between gap-4 text-[10px]">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Terlambat:
                              </span>
                              <span className="font-mono">
                                <span className={isWarnLateness ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                  {item.actual.lateness} mnt
                                </span>
                                <span className="text-slate-400"> (Bts: {item.target.targetLatenessMinutes} mnt)</span>
                              </span>
                            </div>

                            {/* Overtime row */}
                            <div className="flex items-center justify-between gap-4 text-[10px]">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Jam Lembur:
                              </span>
                              <span className="font-mono">
                                <span className={isWarnOvertime ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-bold'}>
                                  {item.actual.overtime} jam
                                </span>
                                <span className="text-slate-400"> (Tgt: {item.target.targetOvertimeHours} jam)</span>
                              </span>
                            </div>

                            {/* Active Violations SP row */}
                            <div className="flex items-center justify-between gap-4 text-[10px]">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" /> SP / Warning:
                              </span>
                              <span className="font-mono">
                                <span className={isWarnViolations ? 'text-rose-600 font-black bg-rose-50 border border-rose-200 px-1 rounded' : 'text-slate-600 bg-slate-100 rounded px-1'}>
                                  {item.actual.violations} Kasus
                                </span>
                                <span className="text-slate-400"> (Bts: {item.target.targetAllowedViolations})</span>
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1.5 justify-center">
                              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{avgAchievementPercent}%</span>
                              <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                <div 
                                  className={`h-full ${
                                    avgAchievementPercent >= 90 ? 'bg-emerald-500' :
                                    avgAchievementPercent >= 75 ? 'bg-teal-500' :
                                    avgAchievementPercent >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${avgAchievementPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-800 font-mono block">{item.score} / 100</span>
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-xl block border w-max text-right ml-auto ${
                                  item.grade === 'A' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
                                  item.grade === 'B' ? 'bg-teal-50 border-teal-200 text-teal-800' :
                                  item.grade === 'C' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                  item.grade === 'D' ? 'bg-orange-50 border-orange-200 text-orange-850' :
                                  'bg-rose-50 border-rose-300 text-rose-800'
                                }`}>
                                  {item.grade} &bull; {item.gradeLabel}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenKpiEdit(item.employee.id)}
                              className="text-[10px] font-black text-slate-700 hover:text-indigo-800 border border-slate-250 hover:border-indigo-400 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                            >
                              Ubah Target
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Minor legend details */}
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-slate-450 font-medium">
              <span>* Skor KPI dihitung dengan rumus denda multi-aspek dari database riwayat absensi finger X-100C.</span>
              <span className="font-mono text-[9px] text-indigo-650 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 mt-2 sm:mt-0">
                Formula: Base 100 - (Terlambat mnt) - (Kehadiran % diff) - (SP SP*20) + (Lembur*1.5)
              </span>
            </div>

          </div>
        )}

        {!finalKpiExpanded && isModuleMinimized('dashboard-kpi-scorecard-panel') && (
          <div className="bg-indigo-50/20 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-850">
            <span className="font-semibold flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-violet-600 shrink-0" />
              Daftar &amp; evaluasi KPI disembunyikan demi efisiensi fungsional peran Anda.
            </span>
            <button
              onClick={() => {
                toggleModuleExpansion('dashboard-kpi-scorecard-panel');
                setIsKpiPanelExpanded(true);
              }}
              className="text-[10px] text-indigo-700 bg-white hover:bg-slate-100 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
            >
              Maksimalkan Evaluasi
            </button>
          </div>
        )}
      </motion.div>
      )}
      
      {/* ================= MODUL KALENDER KERJA INTERAKTIF ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6"
        id="dashboard-work-calendar-card"
      >
        {/* Card Header banner layout with Swiss-style design */}
        <div className="bg-gradient-to-r from-blue-50/40 via-indigo-50/10 to-transparent border-b border-slate-150 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-855 tracking-tight flex items-center gap-2">
                Kalender Kerja &amp; Agenda Terintegrasi
              </h3>
              <p className="text-[11px] text-slate-450 font-medium mt-0.5">
                Pantau rapat, kegiatan korporat, jadwal cuti bersama, dan tenggatan target proyek secara interaktif.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => {
                setEventFormData(prev => ({ ...prev, date: selectedCalendarDateStr }));
                setShowEventForm(!showEventForm);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-[10px] rounded-lg tracking-wide uppercase shadow-sm cursor-pointer transition-all"
              id="btn-toggle-calendar-form"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showEventForm ? 'Tutup Form' : '+ Tambah Agenda'}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Calendar Success Alert Notification Banner */}
          {eventSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs flex items-center gap-2"
              id="calendar-toast-alert"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="font-extrabold text-emerald-950">Berhasil:</strong> {eventSuccessMsg}
            </motion.div>
          )}

          {/* Form Create New Event (Inline Expander) */}
          {showEventForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              onSubmit={handleAddCalendarEvent}
              className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 overflow-hidden"
              id="new-calendar-event-form"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-600" /> Buat Kegiatan / Agenda Baru
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Baku Form: Solution X-100C Module</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Judul Kegiatan */}
                <div className="md:col-span-6 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Judul Kegiatan / Nama Agenda <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Diskusi Teknis Biometrik Engine / Kickoff Rencana Bisnis"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    id="input-evt-title"
                  />
                </div>

                {/* Kategori */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Kategori Agenda</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value as any })}
                    className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-all font-bold cursor-pointer"
                    id="select-evt-category"
                  >
                    <option value="event">🏢 Event Perusahaan</option>
                    <option value="leave">🏖️ Cuti Bersama / Libur</option>
                    <option value="deadline">📅 Tenggat Waktu Proyek</option>
                  </select>
                </div>

                {/* Tanggal Pelaksanaan */}
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.date}
                    onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-all font-mono font-medium"
                    id="input-evt-date"
                  />
                </div>

                {/* Target Departemen */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Target Departemen / Divisi</label>
                  <select
                    value={eventFormData.targetDept}
                    onChange={(e) => setEventFormData({ ...eventFormData, targetDept: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-all font-medium cursor-pointer"
                    id="select-evt-dept"
                  >
                    <option value="Semua">Semua Divisi / Unit</option>
                    <option value="IT & Engineering">IT &amp; Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounting">Finance &amp; Accounting</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing & Sales">Marketing &amp; Sales</option>
                  </select>
                </div>

                {/* Deskripsi */}
                <div className="md:col-span-8 flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Deskripsi / Keterangan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Berikan detail lokasi, waktu, link koordinasi, atau instruksi kerja..."
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-all font-medium"
                    id="input-evt-desc"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-3.5 py-1.5 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg tracking-wide uppercase transition-all cursor-pointer"
                  id="btn-evt-cancel"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg tracking-wide uppercase shadow-sm transition-all cursor-pointer"
                  id="btn-evt-submit"
                >
                  Simpan Agenda
                </button>
              </div>
            </motion.form>
          )}

          {/* Interactive Core Layout Grid of Day Grid & Sidebar Agenda */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="calendar-interactive-area-grid">
            
            {/* Left Box: Calendar Month Grid Area (7/12 Width) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4" id="calendar-grid-box">
              
              {/* Dynamic Header Toolbar (Browsing navigation & Quick filter pill buttons) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                
                {/* Previous & Next Month browses */}
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-850 font-sans text-base min-w-[130px]" id="calendar-month-year-title">
                    {(() => {
                      const monthNames = [
                        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                      ];
                      return `${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
                    })()}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-[11px] font-bold cursor-pointer transition-all"
                      title="Bulan Sebelumnya"
                      id="btn-prev-month"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date(2026, 5, 17))}
                      className="p-1 px-2 text-[10px] bg-slate-50 border border-slate-150 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-100 font-bold cursor-pointer"
                      title="Kembali ke Bulan Sekarang (Jun 2026)"
                      id="btn-current-month-reset"
                    >
                      Juni 26
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 text-[11px] font-bold cursor-pointer transition-all"
                      title="Bulan Berikutnya"
                      id="btn-next-month"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1 text-[10px] font-bold" id="calendar-filter-row">
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('all')}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                      calendarFilter === 'all'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('event')}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                      calendarFilter === 'event'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-blue-50 text-blue-750 border-blue-150 hover:bg-blue-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('leave')}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                      calendarFilter === 'leave'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 text-emerald-750 border-emerald-150 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Libur/Cuti
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarFilter('deadline')}
                    className={`px-2 py-1 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                      calendarFilter === 'deadline'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50 text-rose-750 border-rose-150 hover:bg-rose-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Deadline
                  </button>
                </div>
              </div>

              {/* Day Grid Block */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs" id="calendar-dates-grid">
                
                {/* Days of week header names */}
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`font-black uppercase tracking-wider text-[10px] py-2 border-b border-slate-100 ${
                      idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}

                {/* Calendar date cells rendering */}
                {(() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth(); // 0-based

                  const firstDayOfMonth = new Date(year, month, 1);
                  const startDayOfWeek = firstDayOfMonth.getDay(); 

                  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
                  const prevMonthDays = new Date(year, month, 0).getDate();

                  const padDaysStart = [];
                  for (let i = startDayOfWeek - 1; i >= 0; i--) {
                    const dayNum = prevMonthDays - i;
                    const paddedMonth = month === 0 ? 12 : month;
                    const paddedYear = month === 0 ? year - 1 : year;
                    const dateString = `${paddedYear}-${String(paddedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    padDaysStart.push({ dayNum, isCurrentMonth: false, dateString });
                  }

                  const currentMonthDays = [];
                  for (let d = 1; d <= totalDaysInMonth; d++) {
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    currentMonthDays.push({ dayNum: d, isCurrentMonth: true, dateString });
                  }

                  const totalCellsNeeded = Math.ceil((padDaysStart.length + currentMonthDays.length) / 7) * 7;
                  const padDaysEnd = [];
                  const nextPaddingCount = totalCellsNeeded - (padDaysStart.length + currentMonthDays.length);
                  for (let i = 1; i <= nextPaddingCount; i++) {
                    const paddedMonth = month + 2 > 12 ? 1 : month + 2;
                    const paddedYear = month + 2 > 12 ? year + 1 : year;
                    const dateString = `${paddedYear}-${String(paddedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    padDaysEnd.push({ dayNum: i, isCurrentMonth: false, dateString });
                  }

                  const allCells = [...padDaysStart, ...currentMonthDays, ...padDaysEnd];

                  return allCells.map((cell, idx) => {
                    const isToday = cell.dateString === '2026-06-17'; // Exact simulated date!
                    const isSelected = cell.dateString === selectedCalendarDateStr;
                    
                    // Filter and find what events we have on this date
                    const dayEvents = allMergedCalendarEvents.filter(e => e.date === cell.dateString);
                    
                    // Categories available on this date
                    const hasEvent = dayEvents.some(e => e.category === 'event');
                    const hasLeave = dayEvents.some(e => e.category === 'leave');
                    const hasDeadline = dayEvents.some(e => e.category === 'deadline');

                    // Filtered count based on active filter setting
                    const filteredDayEvents = dayEvents.filter(e => {
                      if (calendarFilter === 'all') return true;
                      return e.category === calendarFilter;
                    });
                    
                    const isFilteredActiveAndHasAgenda = filteredDayEvents.length > 0;

                    return (
                      <div
                        key={`${cell.dateString}-${idx}`}
                        className={`min-h-[58px] rounded-xl border p-1 flex flex-col justify-between transition-all relative cursor-pointer group text-left ${
                          cell.isCurrentMonth
                            ? 'bg-slate-50/50 hover:bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300'
                            : 'bg-slate-100/30 text-slate-350 border-slate-50 opacity-60 hover:opacity-100 hover:bg-slate-100/50 hover:border-slate-250'
                        } ${
                          isSelected 
                            ? 'bg-indigo-50/70! ring-2 ring-indigo-600 border-indigo-600! ring-offset-1 z-1' 
                            : ''
                        } ${
                          isToday 
                            ? 'border-amber-500! border-2 ring-1 ring-amber-500/30' 
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedCalendarDateStr(cell.dateString);
                        }}
                      >
                        {/* Day number count and today tag */}
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-[10px] sm:text-xs font-bold leading-none ${
                            isSelected ? 'text-indigo-700 font-extrabold' : isToday ? 'text-amber-805 text-amber-700' : 'text-slate-600'
                          }`}>
                            {cell.dayNum}
                          </span>
                          
                          {isToday && (
                            <span className="text-[7px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 px-1 py-0.5 rounded scale-90 origin-top-right">
                              Hari Ini
                            </span>
                          )}
                        </div>

                        {/* Dot indicator row (Visualizer) */}
                        <div className="flex items-center gap-1 flex-wrap min-h-3 mt-1.5" id={`indicator-dots-${cell.dateString}`}>
                          {hasEvent && (
                            <span 
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 ${
                                calendarFilter === 'event' ? 'scale-130 animate-pulse ring-1 ring-blue-300' : ''
                              }`} 
                              title="Event Perusahaan" 
                            />
                          )}
                          {hasLeave && (
                            <span 
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 ${
                                calendarFilter === 'leave' ? 'scale-130 animate-pulse ring-1 ring-emerald-300' : ''
                              }`} 
                              title="Jadwal Cuti/Libur" 
                            />
                          )}
                          {hasDeadline && (
                            <span 
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 ${
                                calendarFilter === 'deadline' ? 'scale-130 animate-pulse ring-1 ring-rose-300' : ''
                              }`} 
                              title="Tenggat Waktu Proyek" 
                            />
                          )}

                          {dayEvents.length > 3 && (
                            <span className="text-[7px] font-black text-slate-400 leading-none">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                        
                        {/* Selected overlay ring indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-indigo-50/10 pointer-events-none" />
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Standard legend summary footers */}
              <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-slate-50 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Event Perusahaan (IT/HR/All)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hari Libur / Cuti Bersama</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deadline Proyek / Laporan</span>
              </div>
            </div>

            {/* Right Box: Selected Date Agenda Details Sidemenu (5/12 Width) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col justify-between" id="calendar-agenda-pane">
              <div className="space-y-4">
                
                {/* Sidemenu Title Header */}
                <div className="flex justify-between items-start border-b border-slate-150 pb-3 gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                      Daftar Agenda Hari Ini
                    </h4>
                    <span className="text-sm font-extrabold text-slate-800 block mt-1" id="agenda-selected-date-indo">
                      {(() => {
                        if (!selectedCalendarDateStr) return 'Pilih tanggal...';
                        const parts = selectedCalendarDateStr.split('-');
                        if (parts.length !== 3) return selectedCalendarDateStr;
                        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                        const months = [
                          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                        ];
                        try {
                          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                          return `${days[d.getDay()]}, ${parseInt(parts[2], 10)} ${months[d.getMonth()]} ${parts[0]}`;
                        } catch (e) {
                          return selectedCalendarDateStr;
                        }
                      })()}
                    </span>
                  </div>
                  
                  {/* Total entries inside the sidebar */}
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-200 text-slate-700 rounded-md shrink-0 uppercase tracking-wider font-mono">
                    {
                      allMergedCalendarEvents.filter(e => {
                        const dateMatches = e.date === selectedCalendarDateStr;
                        const categoryMatches = calendarFilter === 'all' || e.category === calendarFilter;
                        return dateMatches && categoryMatches;
                      }).length
                    } Agenda
                  </span>
                </div>

                {/* Event list scrolling pane */}
                <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1" id="agenda-items-container">
                  {(() => {
                    const dayEvents = allMergedCalendarEvents.filter(e => {
                      const dateMatches = e.date === selectedCalendarDateStr;
                      const categoryMatches = calendarFilter === 'all' || e.category === calendarFilter;
                      return dateMatches && categoryMatches;
                    });

                    if (dayEvents.length === 0) {
                      return (
                        <div className="py-12 px-4 text-center space-y-3" id="agenda-empty-state">
                          <div className="w-12 h-12 bg-white rounded-full border border-slate-150 flex items-center justify-center mx-auto text-slate-350 shadow-xs">
                            <Calendar className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-800 font-extrabold text-xs">Senggang &bull; Bersih</p>
                            <p className="text-slate-450 text-[11px]">
                              Tidak ada event korporat, libur cuti bersama, atau tenggat waktu proyek aktif yang terdaftar di tanggal ini.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEventFormData({
                                title: '',
                                category: 'event',
                                date: selectedCalendarDateStr,
                                targetDept: 'Semua',
                                description: ''
                              });
                              setShowEventForm(true);
                            }}
                            className="inline-flex items-center gap-1 py-1 px-2.5 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-700 hover:bg-indigo-1100 text-[10px] font-bold cursor-pointer hover:bg-indigo-100 transition-colors"
                          >
                            + Tambah Agenda Baru
                          </button>
                        </div>
                      );
                    }

                    return dayEvents.map((item) => {
                      // Styling colors based on event categories
                      let categoryLabel = 'Event';
                      let catBadgeStyle = 'bg-blue-50 text-blue-750 border-blue-150';
                      let docCircleStyle = 'bg-blue-500';
                      
                      if (item.category === 'leave') {
                        categoryLabel = 'Cuti / Libur';
                        catBadgeStyle = 'bg-emerald-50 text-emerald-750 border-emerald-150';
                        docCircleStyle = 'bg-emerald-500';
                      } else if (item.category === 'deadline') {
                        categoryLabel = 'Tenggat Waktu';
                        catBadgeStyle = 'bg-rose-50 text-rose-750 border-rose-150';
                        docCircleStyle = 'bg-rose-500';
                      }

                      // Check if deletion is allowed (Only for user-created custom events)
                      const isUserEvent = item.id.startsWith('EVT-USR-');

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-2 hover:border-slate-300 transition-colors hover:shadow-xs group/item text-xs relative"
                          id={`agenda-item-record-${item.id}`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${docCircleStyle}`} />
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${catBadgeStyle}`}>
                                {categoryLabel}
                              </span>
                            </div>
                            
                            {/* Delete Button for custom items */}
                            {isUserEvent && (
                              <button
                                onClick={() => handleDeleteCalendarEvent(item.id)}
                                className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer p-0.5 rounded hover:bg-slate-50 opacity-100 sm:opacity-10 md:group-hover/item:opacity-100"
                                title="Hapus Agenda"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-805 leading-snug">
                              {item.title}
                            </h5>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-2 mt-1.5">
                            <span className="flex items-center gap-1 font-medium">
                              🏢 Bagian: <strong className="text-slate-600 font-bold">{item.targetDept || 'Semua'}</strong>
                            </span>
                            <span className="text-slate-350 font-mono text-[9px]">{item.id}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Operational notice footer inside the sidebar */}
              <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-650">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-800 block">SOP Kalender Operasional:</span>
                  Setiap penambahan event perusahaan dan deadline divisi secara otomatis didistribusikan ke log pre-notifikasi dashboard manager terkait yang bersangkutan.
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Visual Analytics Title & Reordering Toolbar */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-6" id="dashboard-analytic-customize-toolbar">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Tata Letak Visualisasi Analitis Kustom</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Seret &amp; lepas (drag-and-drop) kartu di bawah ini untuk memprioritaskan metrik analitis yang Anda butuhkan. Urutan diatur instan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-mono italic">
            Urutan Tersimpan Otomatis
          </span>
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 hover:text-slate-700 text-slate-600 rounded-lg text-[10px] font-extrabold border border-slate-200 transition-colors uppercase cursor-pointer"
            id="btn-reset-dashboard-layout"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atur Ulang Urutan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" id="dashboard-draggable-analytic-grid">
        {filteredLayoutOrder.map((moduleId, fIndex) => {
          const realIndex = layoutOrder.indexOf(moduleId);
          const isFirst = fIndex === 0;
          const isLast = fIndex === filteredLayoutOrder.length - 1;

          return (
            <motion.div
              key={moduleId}
              variants={itemVariants}
              draggable
              onDragStart={(e) => handleDragStart(e, realIndex)}
              onDragOver={(e) => handleDragOver(e, realIndex)}
              onDrop={(e) => handleDrop(e, realIndex)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all duration-300 relative select-none ${
                hoveredIdx === realIndex 
                  ? 'border-indigo-500 bg-indigo-50/5 ring-4 ring-indigo-500/10 scale-[1.01]' 
                  : draggedIdx === realIndex 
                    ? 'border-dashed border-slate-350 opacity-30 bg-slate-100/50' 
                    : 'border-slate-200 hover:border-slate-300/80 hover:shadow-xs'
              }`}
              style={{ cursor: draggedIdx === realIndex ? 'dragging' : 'grab' }}
              id={`draggable-wrapper-${moduleId}`}
            >
              {/* Grab Drag indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-dashed border-slate-150 pb-2.5 mb-5 shrink-0 select-none">
                <span className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing font-mono uppercase tracking-wider text-[9px] text-slate-500" title="Klik dan seret untuk memindahkan posisi">
                  <GripVertical className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" /> MODUL #{fIndex + 1}: {moduleId.toUpperCase().replace('-', ' ')}
                </span>
                <div className="flex items-center gap-1 select-none">
                  {!isFirst && (
                    <button onClick={(e) => { e.stopPropagation(); moveItem(realIndex, 'up'); }} className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded text-slate-600 font-extrabold cursor-pointer text-[10px]" title="Pindahkan ke atas">&uarr;</button>
                  )}
                  {!isLast && (
                    <button onClick={(e) => { e.stopPropagation(); moveItem(realIndex, 'down'); }} className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded text-slate-600 font-extrabold cursor-pointer text-[10px]" title="Pindahkan ke bawah">&darr;</button>
                  )}
                </div>
              </div>

              {/* Inner Content */}
              <div className="flex-1 flex flex-col justify-between">
                {renderAnalyticCardContent(moduleId, realIndex)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modul Analisis Turnover Karyawan (12 Bulan Terakhir) & Perencanaan Suksesi */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-6 animate-in fade-in duration-300"
        id="dashboard-turnover-analysis-section"
      >
        {/* Header section with Title and Department Filter Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-600" /> Analisis Turnover Karyawan &amp; Perencanaan Suksesi
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tren karyawan masuk dan keluar selama 12 bulan terakhir (Juli 2025 - Juni 2026) per departemen untuk menunjang mitigasi risiko suksesi
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 whitespace-nowrap hidden sm:inline">Definisi Divisi:</span>
            <select
              value={selectedTurnoverDept}
              onChange={(e) => setSelectedTurnoverDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-56"
              id="turnover-dept-filter-select"
            >
              <option value="all">Semua Departemen (Konsolidasi)</option>
              <option value="IT & Engineering">IT &amp; Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Accounting">Finance &amp; Accounting</option>
              <option value="Operations">Operations</option>
              <option value="Marketing & Sales">Marketing &amp; Sales</option>
            </select>
          </div>
        </div>

        {/* Core Content Structure: Grid Left (LineChart) & Right (Calculations & Advisory Board) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: 12-Month LineChart */}
          <div className="lg:col-span-2 flex flex-col justify-between" id="turnover-chart-wrapper">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Grafik Tren Keluar-Masuk bulanan
              </span>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Masuk (Pertumbuhan)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Keluar (Turnover)
                </span>
              </div>
            </div>

            {/* LineChart Render Area */}
            <div className="h-72 text-xs" id="turnover-line-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={turnoverStatistics.trendData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 'medium' }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip content={<TurnoverTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="Masuk" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    name="Karyawan Masuk"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Keluar" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    name="Karyawan Keluar"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Minor legend/explanatory notice */}
            <p className="text-[10px] text-slate-400 italic mt-3 text-center sm:text-left">
              *Catatan: Grafik mengintegrasikan baseline data historis departemen digabung secara otomatis dengan input status karyawan aktif/nonaktif terbaru dalam sistem portal.
            </p>
          </div>

          {/* Right Column: Key Succession Metrics & Advisory Board */}
          <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-150 flex flex-col justify-between space-y-4" id="turnover-advisory-board">
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                Kalkulasi Turnover Divisi
              </span>

              {/* Statistical Value Boxes */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-white p-2.5 rounded-xl border border-slate-150 text-center shadow-xs">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Hires</span>
                  <div className="flex items-center justify-center gap-0.5 text-emerald-600 mt-1">
                    <UserPlus className="w-3 h-3 shrink-0" />
                    <span className="text-sm font-extrabold font-mono">+{turnoverStatistics.totalIn}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-150 text-center shadow-xs">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Quits</span>
                  <div className="flex items-center justify-center gap-0.5 text-rose-650 mt-1">
                    <UserMinus className="w-3 h-3 shrink-0" />
                    <span className="text-sm font-extrabold font-mono text-slate-650">-{turnoverStatistics.totalOut}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-150 text-center shadow-xs">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Rate</span>
                  <div className="flex items-center justify-center gap-0.5 text-slate-800 mt-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="text-sm font-extrabold font-mono text-slate-800">{turnoverStatistics.turnoverRate}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Risk Rating Panel */}
              <div className={`p-3 rounded-xl border ${turnoverStatistics.riskBg} flex items-start gap-2.5 mb-4`}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-80 block font-sans">KERAWANAN SUKSESI:</span>
                  <strong className="text-xs font-black block font-sans">{turnoverStatistics.riskText} (Tingkat {turnoverStatistics.riskLevel})</strong>
                </div>
              </div>

              {/* Dynamic Actionable Advisory text */}
              <div className="space-y-1.5">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Rekomendasi Rencana Suksesi:</span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-justify font-sans">
                  {turnoverStatistics.recommendation}
                </p>
              </div>
            </div>

            {/* Checklist of actionable measures */}
            <div className="border-t border-slate-200/60 pt-3 space-y-1.5">
              <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest block font-sans">CHECKLIST PERENCANAAN SUKSESI:</span>
              <ul className="text-[10px] text-slate-650 space-y-1 font-sans">
                <li className="flex items-center gap-1.5"><span className="text-indigo-500 font-bold">✔</span> Identifikasi Key Positions &amp; Posisi Rentan</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500 font-bold">✔</span> Pemetaan Talent Pool &amp; Karyawan High-Potential</li>
                <li className="flex items-center gap-1.5"><span className="text-indigo-500 font-bold">✔</span> Program Mentoring &amp; Rencana Pelatihan Suksesi</li>
              </ul>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Visual Charts & Split Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-visuals">
        
        {/* SVG Department Distribution Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm col-span-1 flex flex-col justify-between"
          id="dashboard-chart-dept"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Distribusi Karyawan per Departemen
            </h3>
            <p className="text-xs text-slate-400 mt-1">Struktur organisasi enterprise saat ini</p>
          </div>

          <div className="my-6 space-y-4">
            {Object.entries(deptCounts).map(([dept, count], idx) => {
              const percentage = Math.round((count / totalEmployees) * 100);
              const barColors = [
                'bg-blue-600', 'bg-indigo-500', 'bg-slate-700', 'bg-cyan-500', 'bg-violet-600'
              ];
              const colorClass = barColors[idx % barColors.length];

              return (
                <div key={dept} className="space-y-1.5" id={`dept-row-${idx}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{dept}</span>
                    <span className="text-slate-500 font-medium">{count} Orang ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${colorClass} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-slate-500">
            <span>Remunerasi Bulanan:</span>
            <span className="font-bold text-blue-600 text-sm flex items-center bg-blue-50/70 px-2.5 py-1 rounded-lg border border-blue-100/40 self-start sm:self-auto">
              <DollarSign className="w-4 h-4 -mr-1" />
              Rp {totalPayrollBudget.toLocaleString('id-ID')}
            </span>
          </div>
        </motion.div>

        {/* COMPACT ACTIVITY STREAM CARD */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          id="dashboard-activity-stream"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-600 animate-spin-slow" /> Aliran Aktivitas HR (Stream)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sistem audit &amp; pelacakan operasi terbaru</p>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold bg-violet-50 text-violet-750 rounded border border-violet-100 uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span> Live
              </span>
            </div>

            <div className="mt-5 space-y-3.5 relative">
              {/* Vertical timeline connector line */}
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100" />

              {recentHrLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs relative z-10">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Belum ada aliran aktivitas tercatat. Lakukan transaksi data.
                </div>
              ) : (
                recentHrLogs.map((log) => {
                  // Setup custom color styles for modules
                  const bubbleBgMap: Record<string, string> = {
                    'Karyawan': 'bg-blue-500',
                    'Penggajian': 'bg-emerald-500',
                    'Absensi': 'bg-indigo-500',
                    'Cuti/Izin': 'bg-amber-500',
                    'Konfigurasi': 'bg-violet-500',
                  };
                  const color = bubbleBgMap[log.module] || 'bg-slate-400';

                  return (
                    <div key={log.id} className="flex gap-3 text-xs items-start relative z-10 pr-1 group" id={`stream-item-${log.id}`}>
                      {/* Timeline Dot with matching module color */}
                      <div className="flex-none mt-1">
                        <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-white ${color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-slate-800 truncate leading-snug">{log.action}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 whitespace-nowrap mt-0.5">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                        </div>
                        <p className="text-slate-500 text-[10.5px] line-clamp-2 mt-0.5 leading-relaxed group-hover:text-slate-700 transition-colors">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400">
                          <span className="font-semibold text-slate-450 uppercase tracking-widest bg-slate-50 px-1 rounded-sm border border-slate-100">{log.module}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-slate-400">by {log.actor.split('@')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button 
            onClick={handleScrollToAuditLogs}
            className="w-full mt-4 text-center text-xs text-violet-600 bg-violet-50/60 hover:bg-violet-100/85 hover:text-violet-700 font-bold py-2.5 rounded-lg transition-all border border-violet-100/50 cursor-pointer"
            id="view-all-auditlogs-link"
          >
            Telusuri &amp; Filter Detail Audit Log &rarr;
          </button>
        </motion.div>

        {/* Recent Fingerprint Feeds / Today Status */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          id="dashboard-recent-activity"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Log Aktivitas Fingerprint
                </h3>
                <p className="text-xs text-slate-400 mt-1">Data tarikan terbaru dari Solution X-100C</p>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase tracking-widest">
                X-100C
              </span>
            </div>

            <div className="mt-5 space-y-3.5">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Belum ada log masuk hari ini. Tarik data dari mesin absensi.
                </div>
              ) : (
                recentLogs.map((log) => {
                  const emp = employees.find(e => e.id === log.employeeId);
                  
                  return (
                    <div key={log.id} className="flex gap-3 text-xs leading-5" id={`recent-log-${log.id}`}>
                      <div className="relative flex-none">
                        {emp?.photoUrl ? (
                          <img 
                            src={emp.photoUrl} 
                            alt={emp.name} 
                            className="w-8 h-8 rounded-full border border-slate-200 shadow-sm object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 text-slate-700 font-bold flex items-center justify-center rounded-full border border-slate-200 shadow-sm">
                            {emp?.name.charAt(0) || '?'}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                          log.status === 'Hadir' ? 'bg-green-500' :
                          log.status === 'Terlambat' ? 'bg-amber-500' :
                          log.status === 'Pulang Cepat' ? 'bg-indigo-500' : 'bg-rose-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 truncate">{emp?.name || 'Karyawan PIN ' + log.pin}</span>
                          <span className="text-[10px] text-slate-400">{log.date}</span>
                        </div>
                        <p className="text-slate-400 truncate text-[11px]">
                          PIN: <span className="font-mono text-slate-600">{log.pin}</span> · {log.checkIn ? `In: ${log.checkIn}` : ''}{log.checkOut ? ` Out: ${log.checkOut}` : ''}
                        </p>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('absensi')}
            className="w-full mt-4 text-center text-xs text-blue-600 bg-blue-50/60 hover:bg-blue-100/80 hover:text-blue-700 font-bold py-2.5 rounded-lg transition-all border border-blue-100/50 cursor-pointer"
            id="view-all-attendance-link"
          >
            Lihat Analisa Presensi Lengkap &rarr;
          </button>
        </motion.div>
      </div>

      {/* Riwayat Aktivitas (Audit Log) Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
        id="dashboard-audit-log-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
              <History className="text-blue-600 w-4.5 h-4.5 animate-spin-slow" /> Riwayat Aktivitas Portal HRIS (Audit Log)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pencatatan riwayat autentik audit atas setiap modifikasi data karyawan, pengeditan penggajian, dan pendelegasian status cuti.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {auditLogs.length > 0 && (
              <>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-xl transition-all cursor-pointer border border-blue-100/30 font-semibold"
                  id="btn-export-compliance"
                >
                  <Download className="w-3.5 h-3.5" /> Ekspor Log Kepatuhan
                </button>
                <button 
                  onClick={onClearAuditLogs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-all cursor-pointer border border-rose-100/30 font-semibold"
                  id="btn-clear-audit-logs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mt-4 space-y-4 text-xs" id="audit-logs-advanced-filters">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. General Keyword search */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Kata Kunci Aktivitas / Rincian</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Cari aktivitas, aksi atau detil..."
                  value={logSearch}
                  onChange={(e) => {
                    setLogSearch(e.target.value);
                    setVisibleLogCount(5);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* 2. User/Actor Keyword search */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Cari / Pilih Operator (User)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik email atau pilih operator..."
                  list="actor-suggestions"
                  value={logActorSearch}
                  onChange={(e) => {
                    setLogActorSearch(e.target.value);
                    setVisibleLogCount(5);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs transition-all font-bold text-slate-700 font-mono"
                />
                <datalist id="actor-suggestions">
                  {uniqueActors.map(actor => (
                    <option key={actor} value={actor} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* 3. Date Range: Start Date */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Mulai Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={logStartDate}
                  onChange={(e) => {
                    setLogStartDate(e.target.value);
                    setVisibleLogCount(5);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-705 font-mono font-bold"
                />
              </div>
            </div>

            {/* 4. Date Range: End Date */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">Sampai Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={logEndDate}
                  onChange={(e) => {
                    setLogEndDate(e.target.value);
                    setVisibleLogCount(5);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-705 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Module Pills & Reset Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-500 font-bold text-[10.5px] uppercase tracking-wider shrink-0 mb-1 sm:mb-0">Kategori Modul:</span>
              <div className="flex flex-wrap gap-1">
                {['all', 'Karyawan', 'Penggajian', 'Absensi', 'Cuti/Izin', 'Konfigurasi', 'Inventaris', 'Dashboard'].map((moduleVal) => {
                  const isActive = logModuleFilter === moduleVal;
                  return (
                    <button
                      key={moduleVal}
                      onClick={() => {
                        setLogModuleFilter(moduleVal);
                        setVisibleLogCount(5); // Reset back to default list length
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold tracking-tight transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-600 border-blue-500/20 shadow-sm font-black'
                          : 'bg-white text-slate-550 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {moduleVal === 'all' ? 'Semua Modul' : moduleVal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear All active filters trigger */}
            {(logSearch || logActorSearch || logStartDate || logEndDate || logModuleFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setLogSearch('');
                  setLogActorSearch('');
                  setLogStartDate('');
                  setLogEndDate('');
                  setLogModuleFilter('all');
                  setVisibleLogCount(5);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/60 transition-all font-mono"
              >
                Atur Ulang Filter (Reset) &times;
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/15">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-550 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Waktu Log</th>
                <th className="py-3.5 px-4 font-semibold">Kategori Modul</th>
                <th className="py-3.5 px-4 font-semibold">Aktivitas Utama</th>
                <th className="py-3.5 px-4 font-semibold">Rincian Perubahan Data</th>
                <th className="py-3.5 px-4 font-semibold">Operator / Pengubah</th>
                <th className="py-3.5 px-4 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Belum ada riwayat aktivitas untuk pencarian/filter modul ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, visibleLogCount).map((log) => {
                  const moduleStyles: Record<string, string> = {
                    'Karyawan': 'bg-blue-50 text-blue-700 border-blue-100/60',
                    'Penggajian': 'bg-emerald-50 text-emerald-700 border-emerald-100/60',
                    'Absensi': 'bg-indigo-50 text-indigo-700 border-indigo-100/60',
                    'Cuti/Izin': 'bg-amber-50 text-amber-700 border-amber-100/60',
                    'Konfigurasi': 'bg-violet-50 text-violet-700 border-violet-100/60',
                    'Dashboard': 'bg-slate-55 text-slate-700 border-slate-200',
                  };

                  const statusStyles = {
                    'Sukses': 'bg-emerald-500/10 text-emerald-600 border border-emerald-550/15',
                    'Info': 'bg-blue-500/10 text-blue-600 border border-blue-550/15',
                    'Peringatan': 'bg-rose-500/10 text-rose-600 border border-rose-550/15',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-450 font-mono text-[10.5px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wider border ${
                          moduleStyles[log.module] || 'bg-slate-50 text-slate-600 border-slate-150'
                        }`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs sm:max-w-md leading-relaxed text-[11.5px]">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                        {log.actor}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${statusStyles[log.status] || 'bg-gray-100 text-gray-700'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Pagination */}
        {filteredLogs.length > 5 && (
          <div className="flex justify-center pt-2" id="audit-logs-view-controls">
            {visibleLogCount < filteredLogs.length ? (
              <button
                onClick={() => setVisibleLogCount(prev => Math.min(prev + 5, filteredLogs.length))}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 font-bold bg-blue-50/40 px-5 py-2.5 rounded-xl border border-blue-105/40 transition-all cursor-pointer flex items-center gap-1"
              >
                Lihat Aktivitas Lainnya (+{Math.min(5, filteredLogs.length - visibleLogCount)})
              </button>
            ) : (
              <button
                onClick={() => setVisibleLogCount(5)}
                className="text-xs text-slate-500 hover:text-slate-600 hover:bg-slate-100/80 font-bold bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                Tampilkan Lebih Sedikit (Reset ke 5)
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Integration Status Block */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0F172A] border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white"
        id="dashboard-device-indicator"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Status Integrasi X-100C FP Solution</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Terkoneksi via Ethernet TCP/IP (IP: 192.168.1.104 - Port: 4370)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" /> Online &amp; Terverifikasi
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Log Tarikan Terakhir: Kemarin 17:05 AM</span>
        </div>
      </motion.div>

      {/* Modal Renewal Kontrak Karyawan */}
      {showRenewalModal && renewalEmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-805 tracking-tight">Perpanjang / Amandemen Kontrak</h3>
              </div>
              <button 
                onClick={() => {
                  setShowRenewalModal(false);
                  setRenewalEmp(null);
                }} 
                className="text-slate-400 hover:text-slate-600 font-extrabold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              {/* Employee Specs */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
                {renewalEmp.photoUrl ? (
                  <img src={renewalEmp.photoUrl} alt={renewalEmp.name} className="w-10 h-10 rounded-full border object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-50 font-black text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                    {renewalEmp.name.charAt(0)}
                  </div>
                )}
                <div className="leading-snug min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-850 truncate">{renewalEmp.name}</h4>
                  <p className="text-slate-400 mt-0.5 text-[10px] truncate">{renewalEmp.position} — {renewalEmp.department}</p>
                  <p className="text-rose-600 font-bold text-[10px] mt-1">Sisa kontrak saat ini: {renewalEmp.contractEndDate}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Tipe Kontrak Baru</label>
                  <select
                    value={newContractType}
                    onChange={(e) => {
                      const val = e.target.value as 'Tetap' | 'Kontrak' | 'Magang';
                      setNewContractType(val);
                    }}
                    className="w-full border border-slate-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="Kontrak">Kontrak Berjangka (PKWT)</option>
                    <option value="Magang">Magang Terstruktur (Apprenticeship)</option>
                    <option value="Tetap">Karyawan Tetap / Permanen (PKWTT)</option>
                  </select>
                </div>

                {newContractType !== 'Tetap' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Jangka Waktu Perpanjangan</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { l: '3 Bln', v: '3' },
                          { l: '6 Bln', v: '6' },
                          { l: '1 Thn', v: '12' },
                          { l: '2 Thn', v: '24' }
                        ].map((opt) => (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => setNewDurationMonths(opt.v)}
                            className={`py-2 text-[10.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                              newDurationMonths === opt.v
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-500 font-extrabold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Tanggal Akhir Kontrak Baru</label>
                      <input
                        type="date"
                        value={customNewEndDate}
                        onChange={(e) => setCustomNewEndDate(e.target.value)}
                        className="w-full border border-slate-250 p-2 text-xs rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Secara default dihitung otomatis berdasarkan tanggal hari ini (11 Juni 2026).</p>
                    </div>
                  </>
                )}

                {newContractType === 'Tetap' && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 text-emerald-850 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="leading-snug text-[11px]">
                      <p className="font-extrabold text-emerald-900">Evaluasi Pengalihan Karyawan Tetap (PKWTT)</p>
                      <p className="text-slate-600 mt-0.5">Karyawan tidak akan lagi memiliki batas kontrak kerja di sistem utama. Seluruh tunjangan tetap PKWTT akan terkonfigurasi secara terpadu oleh divisi HR.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowRenewalModal(false);
                  setRenewalEmp(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRenewal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs shrink-0"
              >
                Simpan Perpanjangan Kontrak
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Preview SK (Draft Legal Perpanjangan) */}
      {previewSkEmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-805 tracking-tight">Pratinjau SK Perpanjangan PKWT</h3>
              </div>
              <button 
                onClick={() => {
                  setPreviewSkEmp(null);
                  setIsSkDownloaded(false);
                }} 
                className="text-slate-400 hover:text-slate-600 font-extrabold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="my-5 p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-4 font-mono text-[11px] leading-relaxed max-h-[350px] overflow-y-auto text-slate-700 shadow-inner">
              <div className="text-center font-bold text-slate-950 border-b border-slate-250 pb-3 uppercase">
                <p className="text-xs">SURAT KEPUTUSAN DIREKSI</p>
                <p className="text-xs mt-0.5" style={{ textShadow: 'none' }}>PT ENTERPRISE SOLUTIONS Tbk.</p>
                <p className="text-[10px] mt-1 text-slate-500">Nomor: SK-PKWT/{previewSkEmp.department.split(' ')[0].toUpperCase()}/{new Date().getFullYear()}/0892</p>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">TENTANG:</p>
                <p className="font-semibold text-slate-800">PERPANJANGAN PERJANJIAN KERJA WAKTU TERTENTU (PKWT)</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">MENIMBANG:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Bahwa evaluasi kinerja Saudara/i <strong>{previewSkEmp.name}</strong> menunjukkan capaian standar KPI Triwulanan yang memuaskan Divisi.</li>
                  <li>Bahwa kebutuhan operasional divisi <strong>{previewSkEmp.department}</strong> membutuhkan kesinambungan resource bersangkutan.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">MEMUTUSKAN:</p>
                <p><strong>PERTAMA:</strong> Memperpanjang Masa Hubungan Kerja Waktu Tertentu dengan:</p>
                <div className="pl-4 border-l-2 border-indigo-200 py-1 space-y-0.5 text-slate-800">
                  <p>Nama: <strong className="text-slate-950 font-bold">{previewSkEmp.name}</strong></p>
                  <p>ID Karyawan: {previewSkEmp.id}</p>
                  <p>Jabatan: {previewSkEmp.position}</p>
                  <p>Departemen: {previewSkEmp.department}</p>
                  <p>Hubungan Kerja Baru: PKWT Berjangka</p>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 italic">Disusun otomatis oleh Portal HRIS Enterprise berdasarkan notifikasi tertanggal 17 Juni 2026.</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Pratinjau otomatis sistem
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPreviewSkEmp(null);
                    setContractSuccessMsg(`Draf surat perpanjangan PKWT untuk ${previewSkEmp.name} berhasil diunduh ke komputer.`);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Unduh Dokumen SK (.docx)
                </button>
                <button
                  onClick={() => {
                    setPreviewSkEmp(null);
                    setIsSkDownloaded(false);
                  }}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Ekspor Log Kepatuhan / Audit Trail */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans" id="modal-export-compliance-wrapper">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
            id="modal-export-compliance-container"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5.5 h-5.5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 tracking-tight">Ekspor Log Kepatuhan (Audit Trail)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sertifikasi &amp; ekspor riwayat aktivitas portal untuk regulasi internal</p>
                </div>
              </div>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="text-slate-400 hover:text-slate-650 font-extrabold text-lg cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body Content */}
            <div className="my-5 space-y-4">
              {/* Option 1: Scope */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Tentukan Cakupan Ekspor</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportScope('filtered')}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      exportScope === 'filtered' 
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                        : 'border-slate-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700">Filter Aktif</span>
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{filteredLogs.length} baris</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">Hanya mengekspor log yang cocok dengan filter pencarian saat ini.</p>
                  </button>

                  <button
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      exportScope === 'all' 
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                        : 'border-slate-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700">Semua Data</span>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{auditLogs.length} baris</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">Mengekspor seluruh riwayat log aktivitas tanpa filter sistem.</p>
                  </button>
                </div>
              </div>

              {/* Option 2: Format Download */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">2. Pilih Format Output Eksport</label>
                <div className="space-y-2.5">
                  {/* CSV Export Card */}
                  <div 
                    onClick={() => {
                      handleExportCSV(exportScope);
                      setShowExportModal(false);
                    }}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white rounded-xl flex items-start gap-3 cursor-pointer transition-all group"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-200 transition-colors shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">Unduh Format Tabular CSV (.csv)</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-100 font-bold">REKOMENDASI</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Data baris mentah terstruktur untuk diulas via Microsoft Excel, Google Sheets, atau diunggah ke SIEM eksternal.
                      </p>
                    </div>
                  </div>

                  {/* PDF Export Card */}
                  <div 
                    onClick={() => {
                      handlePrintAuditTrail(exportScope);
                      setShowExportModal(false);
                    }}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white rounded-xl flex items-start gap-3 cursor-pointer transition-all group"
                  >
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-200 transition-colors shrink-0">
                      <FileDown className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">Cetak Laporan Kepatuhan PDF (.pdf)</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded border border-indigo-100 font-bold">INTERAKTIF</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Sertifikat ISO 27001 audit trail resmi berkertas kop surat korporat, tanda tangan pimpinan, dan segel verifikasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Note */}
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-650">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800 block">Kepatuhan Berkas &amp; Non-Repudiation:</span>
                  Portal HRIS secara otomatis mensertifikasi kebenaran stempel waktu (timestamps) dan IP operator. Berkas yang diterbitkan sah sebagai alat bukti audit kepatuhan ISO 27001.
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PERSATUAN CUTI HRD TOAST/POP-UP NOTIFICATION PANEL */}
      {pendingHrdLeaves.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full font-sans select-none" id="hr-leave-pending-toasts-tray">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
            id="hr-leave-toast-container"
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-950/40 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Persetujuan Cuti HRD</h4>
                  <p className="text-[9px] text-slate-400 font-medium">Ada {pendingHrdLeaves.length} pengajuan perlu diverifikasi</p>
                </div>
              </div>
              <button 
                onClick={() => setDismissedLeaveIds(prev => [...prev, ...pendingHrdLeaves.map(l => l.id)])} 
                className="text-slate-400 hover:text-slate-200 font-bold transition-colors cursor-pointer text-sm"
                title="Sembunyikan semua notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Pending Leave requests */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 p-3 space-y-2.5">
              {pendingHrdLeaves.map((leave, idx) => (
                <div key={leave.id} className="pt-2 px-1 first:pt-0 space-y-1.5" id={`leave-toast-item-${leave.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-black text-white block leading-snug">{leave.employeeName}</span>
                      <span className="text-[9px] text-slate-400 font-mono block">{leave.type} ({leave.duration} Hari)</span>
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {leave.startDate} s/d {leave.endDate}
                    </span>
                  </div>

                  {leave.reason && (
                    <p className="text-[10px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/30 line-clamp-2">
                      “{leave.reason}”
                    </p>
                  )}

                  {/* Actions for this specific leave */}
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setDismissedLeaveIds(prev => [...prev, leave.id])}
                      className="px-2 py-1 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                      title="Sembunyikan notifikasi ini saja"
                    >
                      Sembunyikan
                    </button>
                    <button
                      onClick={() => handleToastReject(leave.id, leave.employeeName)}
                      className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-rose-200 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleToastApprove(leave.id, leave.employeeName)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-sm hover:shadow transition-all shrink-0 cursor-pointer inline-flex items-center gap-0.5"
                    >
                      <Check className="w-2.5 h-2.5" /> Setujui
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom links */}
            <div className="bg-slate-955 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-mono text-[9px] text-slate-500">PT Enterprise Solutions</span>
              <button 
                onClick={() => onNavigate('cuti')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                Ulas di Portal Utama &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QUICK FLOATING SUCCESS TOAST */}
      {toastSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full font-sans animate-in fade-in slide-in-from-bottom-5 duration-300" id="hr-toast-success-popup">
          <div className="bg-emerald-600 text-white border border-emerald-500 rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-white shrink-0" />
              <div className="text-xs font-bold leading-relaxed">{toastSuccessMessage}</div>
            </div>
            <button 
              onClick={() => setToastSuccessMessage('')}
              className="text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
