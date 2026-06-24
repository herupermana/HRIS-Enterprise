import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, FileText, CheckCircle2, TrendingUp, 
  ArrowUpRight, Download, Eye, Coins, Calendar, X, Clock, Sliders, Info,
  Printer, Sparkles, Filter, Search, ShieldCheck, ChevronDown, ChevronUp,
  DownloadCloud, TableProperties, HelpCircle, RefreshCw, PenSquare, BadgeAlert, CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { jsPDF } from 'jspdf';
import { Employee, AttendanceRecord, PayrollRecord, PayrollPeriod } from '../types';
import { INITIAL_SHIFTS } from '../data';

interface PayrollProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  periods: PayrollPeriod[];
  onAddPeriod?: (newPeriod: PayrollPeriod) => void;
  onUpdatePeriod?: (updatedPeriod: PayrollPeriod) => void;
  onUpdatePayrollStatus: (
    recId: string, 
    status: 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer',
    fullCalculatedData?: Partial<PayrollRecord>
  ) => void;
  onUpdatePayrollApproval?: (
    recId: string,
    approval: 'Pending' | 'Disetujui' | 'Ditolak',
    fullCalculatedData?: Partial<PayrollRecord>
  ) => void;
  onGeneratePayrollForPeriod: (periodId: string) => void;
  onAddManualAttendance?: (record: AttendanceRecord) => void;
  deviceConfig?: any;
}

export default function Penggajian({
  employees,
  attendance,
  payrollRecords,
  periods,
  onAddPeriod,
  onUpdatePeriod,
  onUpdatePayrollStatus,
  onUpdatePayrollApproval,
  onGeneratePayrollForPeriod,
  onAddManualAttendance,
  deviceConfig
}: PayrollProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(periods[0]?.id || '');
  const [activePayrollRecord, setActivePayrollRecord] = useState<(PayrollRecord & { overtimePay?: number; overtimeMinutes?: number; customAllowance?: number; customDeduction?: number; remarks?: string }) | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [bonusInput, setBonusInput] = useState<{ [empId: string]: string }>({});
  const [activeRole, setActiveRole] = useState<'manager' | 'hr'>('manager');

  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [newPeriodForm, setNewPeriodForm] = useState({
    month: 'Kustom: ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [isEditingActivePeriodDates, setIsEditingActivePeriodDates] = useState(false);
  const [activePeriodFromDate, setActivePeriodFromDate] = useState('');
  const [activePeriodToDate, setActivePeriodToDate] = useState('');

  // UI Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Individual Adjustment Modal States
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingEmpId, setAdjustingEmpId] = useState<string | null>(null);
  const [adjForm, setAdjForm] = useState({
    customAllowance: 0,
    customDeduction: 0,
    remarks: '',
    bonusOverride: '',
    overrideHadirEnabled: false,
    overrideHadirCount: 0,
    customBpjsKesehatan: 0,
    customBpjsKetenagakerjaan: 0,
    customPph21: 0,
    overrideBpjsKesehatanEnabled: false,
    overrideBpjsKetenagakerjaanEnabled: false,
    overridePph21Enabled: false
  });

  // Overtime Calculation states
  const [overtimeRate, setOvertimeRate] = useState<number>(() => {
    const saved = localStorage.getItem('hris_overtime_rate');
    return saved ? parseInt(saved, 10) : 25000;
  });
  const [standardCheckOut, setStandardCheckOut] = useState<string>(() => {
    const saved = localStorage.getItem('hris_standard_checkout');
    return saved || INITIAL_SHIFTS.workingHourEnd;
  });
  const [minOvertimeMinutes, setMinOvertimeMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('hris_min_overtime');
    return saved ? parseInt(saved, 10) : 15;
  });

  // Dynamic configurations
  const [bpjsKesehatanRate, setBpjsKesehatanRate] = useState<number>(() => {
    const saved = localStorage.getItem('hris_bpjs_kesehatan_rate');
    return saved ? parseFloat(saved) : 1;
  });
  const [bpjsKetenagakerjaanRate, setBpjsKetenagakerjaanRate] = useState<number>(() => {
    const saved = localStorage.getItem('hris_bpjs_ketenagakerjaan_rate');
    return saved ? parseFloat(saved) : 2;
  });
  const [pph21Rate, setPph21Rate] = useState<number>(() => {
    const saved = localStorage.getItem('hris_pph21_rate');
    return saved ? parseFloat(saved) : 5;
  });
  const [mealTransportAllowance, setMealTransportAllowance] = useState<number>(() => {
    const saved = localStorage.getItem('hris_meal_transport_allowance');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [lateDeductionRate, setLateDeductionRate] = useState<number>(() => {
    const saved = localStorage.getItem('hris_late_deduction_rate');
    return saved ? parseInt(saved, 10) : INITIAL_SHIFTS.lateMultiplierRate;
  });

  // Keep state synced dynamically with server database configs from Settings tab
  React.useEffect(() => {
    if (deviceConfig?.shiftConfig) {
      if (deviceConfig.shiftConfig.workingHourEnd) {
        setStandardCheckOut(deviceConfig.shiftConfig.workingHourEnd);
      }
      if (deviceConfig.shiftConfig.lateMultiplierRate !== undefined) {
        setLateDeductionRate(deviceConfig.shiftConfig.lateMultiplierRate);
      }
    }
  }, [deviceConfig?.shiftConfig]);

  // Persisted manual adjustments (allowances, deductions, notes) for each period
  const [adjustments, setAdjustments] = useState<{
    [empId: string]: {
      customAllowance: number;
      customDeduction: number;
      remarks: string;
      bonusOverride: number;
      overrideHadirEnabled: boolean;
      overrideHadirCount: number;
      customBpjsKesehatan?: number;
      customBpjsKetenagakerjaan?: number;
      customPph21?: number;
      overrideBpjsKesehatanEnabled?: boolean;
      overrideBpjsKetenagakerjaanEnabled?: boolean;
      overridePph21Enabled?: boolean;
    }
  }>(() => {
    try {
      const saved = localStorage.getItem(`hris_pay_adj_${selectedPeriodId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const loadSalaryConfig = () => {
      const bHealth = localStorage.getItem('hris_bpjs_kesehatan_rate');
      const bWork = localStorage.getItem('hris_bpjs_ketenagakerjaan_rate');
      const tax = localStorage.getItem('hris_pph21_rate');
      const meal = localStorage.getItem('hris_meal_transport_allowance');
      const late = localStorage.getItem('hris_late_deduction_rate');

      if (bHealth) setBpjsKesehatanRate(parseFloat(bHealth));
      if (bWork) setBpjsKetenagakerjaanRate(parseFloat(bWork));
      if (tax) setPph21Rate(parseFloat(tax));
      if (meal) setMealTransportAllowance(parseInt(meal, 10));
      if (late) setLateDeductionRate(parseInt(late, 10));
    };

    loadSalaryConfig();
    window.addEventListener('hris_salary_config_updated', loadSalaryConfig);
    return () => {
      window.removeEventListener('hris_salary_config_updated', loadSalaryConfig);
    };
  }, []);

  // Reload period specific adjustments
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hris_pay_adj_${selectedPeriodId}`);
      setAdjustments(saved ? JSON.parse(saved) : {});
    } catch {
      setAdjustments({});
    }
  }, [selectedPeriodId]);

  useEffect(() => {
    localStorage.setItem('hris_overtime_rate', overtimeRate.toString());
  }, [overtimeRate]);

  useEffect(() => {
    localStorage.setItem('hris_standard_checkout', standardCheckOut);
  }, [standardCheckOut]);

  useEffect(() => {
    localStorage.setItem('hris_min_overtime', minOvertimeMinutes.toString());
  }, [minOvertimeMinutes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ================= AUTO PAYROLL GENERATOR STATES & LOGIC =================
  const [isAutoPayrollModalOpen, setIsAutoPayrollModalOpen] = useState(false);
  const [autoPayrollActiveTab, setAutoPayrollActiveTab] = useState<'instant' | 'scheduler'>('instant');
  const [autoPayrollStep, setAutoPayrollStep] = useState<'setup' | 'simulated'>('setup');
  const [autoDeptFilter, setAutoDeptFilter] = useState<string>('All');
  
  // Listen for dashboard quick action trigger
  useEffect(() => {
    const handleOpenGenerate = () => {
      setIsAutoPayrollModalOpen(true);
      setAutoPayrollStep('setup');
    };
    window.addEventListener('hris_open_generate_payroll', handleOpenGenerate);
    return () => window.removeEventListener('hris_open_generate_payroll', handleOpenGenerate);
  }, []);
  
  const [applyMealTransport, setApplyMealTransport] = useState(true);
  const [applyLateDeductions, setApplyLateDeductions] = useState(true);
  const [applyBpjsKesehatan, setApplyBpjsKesehatan] = useState(true);
  const [applyBpjsKetenagakerjaan, setApplyBpjsKetenagakerjaan] = useState(true);
  const [applyPph21, setApplyPph21] = useState(true);

  // States for scheduler configuration
  const [schedRuleName, setSchedRuleName] = useState('Gaji Bulanan All Departments');
  const [schedDayOfMonth, setSchedDayOfMonth] = useState('25');
  const [schedTimeOfDay, setSchedTimeOfDay] = useState('17:00');
  const [schedDept, setSchedDept] = useState('All');
  const [schedRequireVerify, setSchedRequireVerify] = useState(true);
  const [schedNotification, setSchedNotification] = useState(true);
  
  const [activeSchedules, setActiveSchedules] = useState<{
    id: string;
    ruleName: string;
    dayOfMonth: string;
    timeOfDay: string;
    department: string;
    requireVerify: boolean;
    notification: boolean;
    isActive: boolean;
    lastExecuted?: string;
  }[]>(() => {
    const saved = localStorage.getItem('hris_payroll_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'SCH-DEFAULT-001',
        ruleName: 'Batch Gaji Bulanan Otomatis (All Dept)',
        dayOfMonth: '25',
        timeOfDay: '17:00',
        department: 'All',
        requireVerify: true,
        notification: true,
        isActive: true,
        lastExecuted: '2026-05-25 17:00'
      },
      {
        id: 'SCH-DEFAULT-002',
        ruleName: 'Batch Gaji Magang Division Marketing',
        dayOfMonth: '28',
        timeOfDay: '15:00',
        department: 'Marketing & Sales',
        requireVerify: false,
        notification: true,
        isActive: true,
        lastExecuted: '2026-05-28 15:00'
      }
    ];
  });

  // Save schedules to localStorage automatically
  useEffect(() => {
    localStorage.setItem('hris_payroll_schedules', JSON.stringify(activeSchedules));
  }, [activeSchedules]);

  // Compute simulated on-the-fly batch payroll based on current configuration and active logs will be defined below calculatedPayrollList

  const timeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const hrs = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    return hrs * 60 + mins;
  };

  const formatOvertimeDuration = (totalMins: number) => {
    if (totalMins <= 0) return '0 Menit';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0 && mins > 0) {
      return `${hrs} jam ${mins} m`;
    } else if (hrs > 0) {
      return `${hrs} jam`;
    } else {
      return `${mins} mnt`;
    }
  };

  const handleCreatePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPeriod) {
      alert('Aksi pembuatan periode tidak terpasang.');
      return;
    }
    if (!newPeriodForm.month.trim() || !newPeriodForm.startDate || !newPeriodForm.endDate) {
      alert('Semua data wajib diisi!');
      return;
    }
    if (newPeriodForm.startDate > newPeriodForm.endDate) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai!');
      return;
    }

    const uniqueId = `PRD-CUSTOM-${Date.now()}`;
    const payload = {
      id: uniqueId,
      month: newPeriodForm.month,
      startDate: newPeriodForm.startDate,
      endDate: newPeriodForm.endDate,
      isClosed: false
    };

    onAddPeriod(payload);
    setSelectedPeriodId(uniqueId);
    setIsAddPeriodOpen(false);
    showToast(`Periode Baru ${newPeriodForm.month} berhasil ditambahkan!`);
  };

  const currentPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedPeriodId);
  }, [periods, selectedPeriodId]);

  const handleStartEditActivePeriod = () => {
    if (!currentPeriod) return;
    setActivePeriodFromDate(currentPeriod.startDate);
    setActivePeriodToDate(currentPeriod.endDate);
    setIsEditingActivePeriodDates(true);
  };

  const handleSaveActivePeriodDates = () => {
    if (!currentPeriod || !onUpdatePeriod) {
      alert('Fitur pembaruan periode tidak aktif.');
      return;
    }
    if (!activePeriodFromDate || !activePeriodToDate) {
      alert('Tanggal mulai dan selesai harus diisi!');
      return;
    }
    if (activePeriodFromDate > activePeriodToDate) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai!');
      return;
    }

    onUpdatePeriod({
      ...currentPeriod,
      startDate: activePeriodFromDate,
      endDate: activePeriodToDate
    });
    setIsEditingActivePeriodDates(false);
    showToast(`Rentang tanggal periode ${currentPeriod.month} berhasil disesuaikan!`);
  };

  // Dynamically calculate and build payroll items for all employees for the selected period
  const calculatedPayrollList = useMemo(() => {
    return employees.map(emp => {
      // Find existing locked record if saved in global App.tsx state
      const savedRec = payrollRecords.find(r => r.employeeId === emp.id && r.periodId === selectedPeriodId);
      
      // Load periods adjustments
      const adj = adjustments[emp.id] || { 
        customAllowance: 0, 
        customDeduction: 0, 
        remarks: '', 
        bonusOverride: 0,
        overrideHadirEnabled: false,
        overrideHadirCount: 0,
        customBpjsKesehatan: 0,
        customBpjsKetenagakerjaan: 0,
        customPph21: 0,
        overrideBpjsKesehatanEnabled: false,
        overrideBpjsKetenagakerjaanEnabled: false,
        overridePph21Enabled: false
      };

      // Calculate from attendance for this period
      const empLogs = attendance.filter(log => {
        if (log.employeeId !== emp.id) return false;
        if (!currentPeriod) return true;
        return log.date >= currentPeriod.startDate && log.date <= currentPeriod.endDate;
      });

      // Attendance metrics with possible overrides
      const calculatedHadir = empLogs.filter(l => l.status === 'Hadir' || l.status === 'Terlambat' || l.status === 'Pulang Cepat').length;
      const totalHadir = adj.overrideHadirEnabled ? adj.overrideHadirCount : calculatedHadir;
      
      const totalTerlambat = empLogs.filter(l => l.status === 'Terlambat').length;
      const totalAlpa = empLogs.filter(l => l.status === 'Alpa').length;
      const totalCutiIzin = empLogs.filter(l => l.status === 'Cuti' || l.status === 'Izin' || l.status === 'Sakit').length;

      // Sum of late minutes
      const totalLateMinutes = empLogs.reduce((sum, curr) => sum + curr.lateMinutes, 0);
      const lateDeduction = totalLateMinutes * lateDeductionRate;
      
      // Meal & Transportation allowance calculated dynamically
      const attendanceAllowance = totalHadir * mealTransportAllowance;
      const baseAllowanceSum = emp.allowance + attendanceAllowance;
      
      // Incorporate custom manual allowances
      const totalAllowanceSum = baseAllowanceSum + adj.customAllowance;

      // Overtime calculation based on fingerprint checkout or HR override
      let totalOvertimeMinutes = 0;
      let totalOvertimePay = 0;
      let draftOvertimeMinutes = 0;

      empLogs.forEach(log => {
        if (log.overtimeMinutes !== undefined) {
          totalOvertimeMinutes += log.overtimeMinutes;
          totalOvertimePay += Math.round((log.overtimeMinutes / 60) * overtimeRate);
        } else if (log.checkOut) {
          const empShift = emp.shiftPattern || 'Pagi';
          let stdEndMins = 17 * 60; // 17:00
          if (empShift === 'Siang') {
            stdEndMins = 22 * 60; // 22:00
          } else if (empShift === 'Malam') {
            stdEndMins = 6 * 60; // 06:00
          }

          const [outH, outM] = log.checkOut.split(':').map(Number);
          let outMins = outH * 60 + outM;

          if (empShift === 'Malam') {
            if (outH >= 12) {
              stdEndMins = 30 * 60; // 06:00 next day is 30 hours from starting midnight
              outMins += 24 * 60;
            }
          }

          const diff = outMins - stdEndMins;
          if (diff >= minOvertimeMinutes) {
            draftOvertimeMinutes += diff;
          }
        }
      });

      // Bonus determination
      let bonusOfItem = 0;
      if (savedRec) {
        bonusOfItem = savedRec.bonus;
      } else if (adj.bonusOverride > 0) {
        bonusOfItem = adj.bonusOverride;
      } else {
        bonusOfItem = Number(bonusInput[emp.id] || 0);
      }

      // BPJS Calculations
      const bpjsKesehatan = adj.overrideBpjsKesehatanEnabled && typeof adj.customBpjsKesehatan === 'number'
        ? adj.customBpjsKesehatan
        : Math.round(emp.basicSalary * (bpjsKesehatanRate / 100));

      const bpjsKetenagakerjaan = adj.overrideBpjsKetenagakerjaanEnabled && typeof adj.customBpjsKetenagakerjaan === 'number'
        ? adj.customBpjsKetenagakerjaan
        : Math.round(emp.basicSalary * (bpjsKetenagakerjaanRate / 100));

      // Estimated tax
      const grossIncome = emp.basicSalary + totalAllowanceSum + bonusOfItem + totalOvertimePay;
      const pph21 = adj.overridePph21Enabled && typeof adj.customPph21 === 'number'
        ? adj.customPph21
        : Math.round(grossIncome * (pph21Rate / 100));

      // Net with custom adjustments and deductions
      const baseNet = grossIncome - lateDeduction - bpjsKesehatan - bpjsKetenagakerjaan - pph21;
      const netSalary = baseNet - adj.customDeduction;

      return {
        employeeId: emp.id,
        name: emp.name,
        pin: emp.pin,
        department: emp.department,
        position: emp.position,
        basicSalary: emp.basicSalary,
        allowanceSum: totalAllowanceSum,
        bonus: bonusOfItem,
        lateDeduction,
        bpjsKesehatan,
        bpjsKetenagakerjaan,
        pph21,
        netSalary,
        overtimePay: totalOvertimePay,
        overtimeMinutes: totalOvertimeMinutes,
        draftOvertimeMinutes,
        customAllowance: adj.customAllowance,
        customDeduction: adj.customDeduction,
        remarks: adj.remarks,
        payoutStatus: savedRec ? savedRec.payoutStatus : 'Belum Dibayar',
        recordId: savedRec ? savedRec.id : `TEMP-${emp.id}`,
        managerApproval: savedRec ? (savedRec.managerApproval || 'Pending') : 'Pending',
        hrApproval: savedRec ? (savedRec.hrApproval || 'Pending') : 'Pending',
        approvedByManager: savedRec?.approvedByManager,
        approvedByHR: savedRec?.approvedByHR,
        attendanceSummary: {
          hadir: totalHadir,
          terlambat: totalTerlambat,
          cutiIzin: totalCutiIzin,
          alpa: totalAlpa
        }
      };
    });
  }, [
    employees, 
    attendance, 
    payrollRecords, 
    selectedPeriodId, 
    currentPeriod,
    bonusInput, 
    overtimeRate, 
    standardCheckOut, 
    minOvertimeMinutes,
    bpjsKesehatanRate,
    bpjsKetenagakerjaanRate,
    pph21Rate,
    mealTransportAllowance,
    lateDeductionRate,
    adjustments
  ]);

  // --- PERSURATAN / TIMEFACE INTEGRATED STATE FOR AUTOMATED OVERTIME DRAFTS ---
  const [isDraftOvertimePanelExpanded, setIsDraftOvertimePanelExpanded] = useState(true);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingDraftMinutes, setEditingDraftMinutes] = useState<number>(0);

  // Helper to extract biometric draft details for single log
  const getLogDraftDetails = (log: AttendanceRecord) => {
    const emp = employees.find(e => e.id === log.employeeId);
    if (!emp || !log.checkOut) return null;

    const empShift = emp.shiftPattern || 'Pagi';
    let stdEndMins = 17 * 60; // 17:00
    let stdEndStr = '17:00';
    if (empShift === 'Siang') {
      stdEndMins = 22 * 60;
      stdEndStr = '22:00';
    } else if (empShift === 'Malam') {
      stdEndMins = 6 * 60;
      stdEndStr = '06:00';
    }

    const [outH, outM] = log.checkOut.split(':').map(Number);
    let outMins = outH * 60 + outM;

    if (empShift === 'Malam') {
      if (outH >= 12) {
        stdEndMins = 30 * 60; // Represents 06:00 next day (24h + 6h)
        outMins += 24 * 60;
      }
    }

    const diff = outMins - stdEndMins;
    if (diff <= 0) return null;

    return {
      empName: emp.name,
      empDept: emp.department,
      empShift,
      stdEndStr,
      diffMinutes: diff,
      estimatedPay: Math.round((diff / 60) * overtimeRate)
    };
  };

  // Memoize live list of qualifying drafts in the active period
  const pendingOvertimeDrafts = useMemo(() => {
    if (!currentPeriod) return [];
    return attendance.filter(log => {
      // Must be in the active period date range
      const inPeriod = log.date >= currentPeriod.startDate && log.date <= currentPeriod.endDate;
      if (!inPeriod) return false;

      // Must not have an approved/resolved overtime state (overtimeMinutes is undefined when raw)
      if (log.overtimeMinutes !== undefined) return false;

      // Must have checkout time
      if (!log.checkOut) return false;

      // Check checkout differential
      const details = getLogDraftDetails(log);
      if (!details) return false;

      return details.diffMinutes >= minOvertimeMinutes;
    });
  }, [attendance, employees, currentPeriod, minOvertimeMinutes, overtimeRate]);

  // Handle single draft approval
  const handleApproveDraft = (log: AttendanceRecord, customMins?: number) => {
    const details = getLogDraftDetails(log);
    if (!details) return;

    const approvedMins = customMins !== undefined ? customMins : details.diffMinutes;
    const updatedRecord: AttendanceRecord = {
      ...log,
      overtimeMinutes: approvedMins,
      logDetails: `${log.logDetails || ''} | Lembur disetujui HRD: ${approvedMins} mnt pada ${new Date().toLocaleDateString('id-ID')}`.trim()
    };

    onAddManualAttendance?.(updatedRecord);
    showToast(`Lembur ${details.empName} sebesar ${formatOvertimeDuration(approvedMins)} berhasil disetujui!`);

    // Log the approval action
    window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
      detail: {
        module: 'Penggajian',
        action: 'Persetujuan Lembur',
        details: `Menyetujui draf lembur untuk ${details.empName} (${log.date}) sebesar ${approvedMins} menit (Estimasi Uang Lembur: Rp ${Math.round((approvedMins / 60) * overtimeRate).toLocaleString('id-ID')}).`,
        status: 'Sukses'
      }
    }));
  };

  // Handle single draft decline (sets overtime to 0 to dismiss it from drafts)
  const handleRejectDraft = (log: AttendanceRecord) => {
    const emp = employees.find(e => e.id === log.employeeId);
    const updatedRecord: AttendanceRecord = {
      ...log,
      overtimeMinutes: 0,
       logDetails: `${log.logDetails || ''} | Lembur ditolak HRD pada ${new Date().toLocaleDateString('id-ID')}`.trim()
    };

    onAddManualAttendance?.(updatedRecord);
    showToast(`Draf lembur untuk ${emp ? emp.name : 'PIN ' + log.pin} berhasil diabaikan/ditolak.`);

    window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
      detail: {
        module: 'Penggajian',
        action: 'Penolakan Lembur',
        details: `Menolak/Mengabaikan draf lembur untuk ${emp ? emp.name : 'PIN ' + log.pin} pada tanggal ${log.date}.`,
        status: 'Sukses'
      }
    }));
  };

  // Handle bulk approval of all pending drafts for the period
  const handleApproveAllDrafts = () => {
    if (pendingOvertimeDrafts.length === 0) return;

    pendingOvertimeDrafts.forEach(log => {
      const details = getLogDraftDetails(log);
      if (details) {
        const updatedRecord: AttendanceRecord = {
          ...log,
          overtimeMinutes: details.diffMinutes,
          logDetails: `${log.logDetails || ''} | Lembur disetujui massal HRD`.trim()
        };
        onAddManualAttendance?.(updatedRecord);
      }
    });

    showToast(`Sukses menyetujui massal ${pendingOvertimeDrafts.length} draf lembur otomatis!`);

    window.dispatchEvent(new CustomEvent('hris_add_audit_log', {
      detail: {
        module: 'Penggajian',
        action: 'Setujui Lembur Massal',
        details: `Menyetujui secara massal ${pendingOvertimeDrafts.length} entri draf lembur biometrik untuk periode ${currentPeriod?.month || ''}.`,
        status: 'Sukses'
      }
    }));
  };

  // Compute simulated on-the-fly batch payroll based on current configuration and active logs
  const simulatedBatchList = useMemo(() => {
    if (!isAutoPayrollModalOpen) return [];

    // Filter employees belonging to the selected department
    const targetEmployees = employees.filter(emp => {
      if (emp.status !== 'Aktif') return false;
      return autoDeptFilter === 'All' || emp.department === autoDeptFilter;
    });

    return targetEmployees.map(emp => {
      // Find the standard derived calculation for this employee
      const stdItem = calculatedPayrollList.find(c => c.employeeId === emp.id) || {
        basicSalary: emp.basicSalary,
        allowanceSum: emp.allowance,
        bonus: 0,
        lateDeduction: 0,
        bpjsKesehatan: Math.round(emp.basicSalary * (bpjsKesehatanRate / 100)),
        bpjsKetenagakerjaan: Math.round(emp.basicSalary * (bpjsKetenagakerjaanRate / 100)),
        pph21: Math.round((emp.basicSalary + emp.allowance) * (pph21Rate / 100)),
        netSalary: emp.basicSalary + emp.allowance,
        overtimePay: 0,
        overtimeMinutes: 0,
        attendanceSummary: { hadir: 0, terlambat: 0, cutiIzin: 0, alpa: 0 },
        recordId: `TEMP-${emp.id}`,
        name: emp.name,
        department: emp.department,
        position: emp.position
      };

      // Apply automatic configuration switches on top of standard computed items
      const basicSalary = stdItem.basicSalary;
      const allowanceSum = applyMealTransport ? stdItem.allowanceSum : emp.allowance;
      const bonus = stdItem.bonus;
      const lateDeduction = applyLateDeductions ? stdItem.lateDeduction : 0;
      const bpjsKesehatan = applyBpjsKesehatan ? stdItem.bpjsKesehatan : 0;
      const bpjsKetenagakerjaan = applyBpjsKetenagakerjaan ? stdItem.bpjsKetenagakerjaan : 0;
      
      const grossIncome = basicSalary + allowanceSum + bonus + (stdItem.overtimePay || 0);
      const pph21 = applyPph21 ? Math.round(grossIncome * (pph21Rate / 100)) : 0;
      const netSalary = grossIncome - lateDeduction - bpjsKesehatan - bpjsKetenagakerjaan - pph21;

      return {
        ...stdItem,
        allowanceSum,
        lateDeduction,
        bpjsKesehatan,
        bpjsKetenagakerjaan,
        pph21,
        netSalary
      };
    });
  }, [
    isAutoPayrollModalOpen,
    employees,
    autoDeptFilter,
    calculatedPayrollList,
    applyMealTransport,
    applyLateDeductions,
    applyBpjsKesehatan,
    applyBpjsKetenagakerjaan,
    applyPph21,
    bpjsKesehatanRate,
    bpjsKetenagakerjaanRate,
    pph21Rate
  ]);

  // Handler to post all simulated slips in a single transaction
  const handleConfirmBatchPost = () => {
    if (simulatedBatchList.length === 0) {
      alert('Tidak ada karyawan untuk dibayarkan.');
      return;
    }

    const confirmMsg = `PERINGATAN POSTING:\nSistem akan menerbitkan & mengunci ${simulatedBatchList.length} slip gaji untuk karyawan di Departemen [${autoDeptFilter}] ke dalam database utama PT Enterprise Solutions.\n\nApakah Anda yakin ingin memposting hasil perhitungan ini sekarang?`;
    
    if (!window.confirm(confirmMsg)) return;

    let postedCount = 0;
    simulatedBatchList.forEach(item => {
      onUpdatePayrollStatus(item.recordId, 'Belum Dibayar', {
        periodId: selectedPeriodId,
        basicSalary: item.basicSalary,
        allowanceSum: item.allowanceSum,
        bonus: item.bonus,
        lateDeduction: item.lateDeduction,
        bpjsKesehatan: item.bpjsKesehatan,
        bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
        pph21: item.pph21,
        netSalary: item.netSalary,
        attendanceSummary: item.attendanceSummary
      });
      postedCount++;
    });

    showToast(`Sukses! ${postedCount} slip gaji berhasil diposting ke Periode ${currentPeriod?.month || ''} secara batch.`);
    setIsAutoPayrollModalOpen(false);
    setAutoPayrollStep('setup');
  };

  // Handler to create an automated scheduled batch job
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRuleName.trim()) {
      alert('Nama Aturan Jadwal wajib diisi!');
      return;
    }

    const newSchedule = {
      id: `SCH-${Date.now()}`,
      ruleName: schedRuleName,
      dayOfMonth: schedDayOfMonth,
      timeOfDay: schedTimeOfDay,
      department: schedDept,
      requireVerify: schedRequireVerify,
      notification: schedNotification,
      isActive: true
    };

    setActiveSchedules(prev => [newSchedule, ...prev]);
    showToast(`Jadwal perhitungan otomatis "${schedRuleName}" berhasil diaktifkan!`);
    
    // Reset Form fields
    setSchedRuleName('Gaji Bulanan All Departments');
    setSchedDayOfMonth('25');
    setSchedTimeOfDay('17:00');
    setSchedDept('All');
    setSchedRequireVerify(true);
    setSchedNotification(true);
  };

  const handleDeleteSchedule = (id: string) => {
    if (!window.confirm('Hapus jadwal perhitungan otomatis ini?')) return;
    setActiveSchedules(prev => prev.filter(s => s.id !== id));
    showToast('Jadwal berhasil dihapus dari sistem.');
  };

  const handleToggleScheduleActive = (id: string) => {
    setActiveSchedules(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    showToast('Status keaktifan jadwal diperbarui.');
  };

  const handleRunScheduleNow = (id: string) => {
    const targetSched = activeSchedules.find(s => s.id === id);
    if (!targetSched) return;

    // Simulate instant batch calculations
    const activeStaffCount = employees.filter(e => {
      if (e.status !== 'Aktif') return false;
      return targetSched.department === 'All' || e.department === targetSched.department;
    }).length;

    const todayDate = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5);

    setActiveSchedules(prev => prev.map(s => s.id === id ? { ...s, lastExecuted: todayDate } : s));
    
    const confirmExec = window.confirm(
      `SIMULASI EKSEKUSI JADWAL:\n` +
      `Nama Aturan: ${targetSched.ruleName}\n` +
      `Departemen Target: ${targetSched.department}\n` +
      `Waktu Terjadwal: Setiap tanggal ${targetSched.dayOfMonth} pukul ${targetSched.timeOfDay}\n` +
      `Status Log Terkini: Sinkronisasi fingerprint Solution X-100c berhasil.\n\n` +
      `Ditemukan total ${activeStaffCount} karyawan berstatus Aktif di departemen target.\n` +
      `Apakah Anda ingin memicu eksekusi kalkulasi penggajian (batch calculation) sekarang?`
    );

    if (!confirmExec) return;

    // Simulate batch calculation action
    alert(
      `BERHASIL MEMICU ENGINE GAJI:\n\n` +
      `Sistem telah memproses kompilasi batch otomatis untuk ${activeStaffCount} karyawan.\n` +
      `Semua rincian gaji telah terisi berdasarkan log terbaru dalam server.\n` +
      `Status pengerjaan: Menunggu verifikasi posting dari manajer (Approved verification: ${targetSched.requireVerify ? 'Ya' : 'Diposting Langsung'}).`
    );

    showToast(`Pemicuan jadwal otomatis "${targetSched.ruleName}" sukses dijalankan.`);
  };

  // Overall calculations for stats cards
  const summaryStats = useMemo(() => {
    let totalPaid = 0;
    let pendingPayments = 0;
    let totalDeductions = 0;
    let totalOvertimePaid = 0;
    let totalOvertimeMinutes = 0;
    let totalBaseSalary = 0;
    let totalAllowances = 0;
    let totalBonuses = 0;

    calculatedPayrollList.forEach(item => {
      totalBaseSalary += item.basicSalary;
      totalAllowances += item.allowanceSum;
      totalBonuses += item.bonus;

      if (item.payoutStatus === 'Sudah Ditransfer') {
        totalPaid += item.netSalary;
      } else {
        pendingPayments += item.netSalary;
      }
      totalDeductions += item.lateDeduction + item.bpjsKesehatan + item.bpjsKetenagakerjaan + item.pph21 + (item.customDeduction || 0);
      totalOvertimePaid += item.overtimePay;
      totalOvertimeMinutes += item.overtimeMinutes;
    });

    return { 
      totalPaid, 
      pendingPayments, 
      totalDeductions, 
      totalOvertimePaid, 
      totalOvertimeMinutes,
      totalBaseSalary,
      totalAllowances,
      totalBonuses
    };
  }, [calculatedPayrollList]);

  // Trigger Slip viewer
  const handleOpenSlip = (empId: string) => {
    const matched = calculatedPayrollList.find(c => c.employeeId === empId);
    if (!matched) return;

    setActivePayrollRecord({
      id: matched.recordId,
      employeeId: matched.employeeId,
      periodId: selectedPeriodId,
      basicSalary: matched.basicSalary,
      allowanceSum: matched.allowanceSum,
      bonus: matched.bonus,
      lateDeduction: matched.lateDeduction,
      bpjsKesehatan: matched.bpjsKesehatan,
      bpjsKetenagakerjaan: matched.bpjsKetenagakerjaan,
      pph21: matched.pph21,
      netSalary: matched.netSalary,
      attendanceSummary: matched.attendanceSummary,
      payoutStatus: matched.payoutStatus as any,
      overtimePay: matched.overtimePay,
      overtimeMinutes: matched.overtimeMinutes,
      customAllowance: matched.customAllowance,
      customDeduction: matched.customDeduction,
      remarks: matched.remarks
    });

    setIsSlipOpen(true);
  };

  const executeStatusUpdateInState = (
    recordId: string, 
    status: 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer'
  ) => {
    const matched = calculatedPayrollList.find(c => c.recordId === recordId);
    if (!matched) return;

    // Save and commit calculations so they freeze inside App.tsx state
    onUpdatePayrollStatus(recordId, status, {
      periodId: selectedPeriodId,
      basicSalary: matched.basicSalary,
      allowanceSum: matched.allowanceSum,
      bonus: matched.bonus,
      lateDeduction: matched.lateDeduction,
      bpjsKesehatan: matched.bpjsKesehatan,
      bpjsKetenagakerjaan: matched.bpjsKetenagakerjaan,
      pph21: matched.pph21,
      netSalary: matched.netSalary,
      attendanceSummary: matched.attendanceSummary
    });
    showToast(`Status Pembayaran Karyawan ${matched.name} berhasil diperbarui!`);
  };

  // Batch Save all items
  const handleBatchLockEverything = () => {
    let saveCount = 0;
    calculatedPayrollList.forEach(item => {
      if (item.recordId.startsWith('TEMP-')) {
        onUpdatePayrollStatus(item.recordId, 'Belum Dibayar', {
          periodId: selectedPeriodId,
          basicSalary: item.basicSalary,
          allowanceSum: item.allowanceSum,
          bonus: item.bonus,
          lateDeduction: item.lateDeduction,
          bpjsKesehatan: item.bpjsKesehatan,
          bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
          pph21: item.pph21,
          netSalary: item.netSalary,
          attendanceSummary: item.attendanceSummary
        });
        saveCount++;
      }
    });

    if (saveCount > 0) {
      showToast(`Berhasil menyimpan & komit ${saveCount} slip gaji ke dalam pembukuan resmi!`);
    } else {
      showToast('Seluruh slip gaji pada periode ini sudah terkunci ke sistem.');
    }
  };

  // Batch Pay Out / collective transfer 
  const handleBatchPayoutCollective = () => {
    const confirmTransfer = window.confirm(
      `Sistem akan memproses Transfer Payroll Kolektif Bank Mandiri/BCA untuk seluruh pegawai pada periode ${currentPeriod?.month || 'Pilihan'}.\nApakah Anda ingin memproses transfer sekaligus?`
    );
    if (!confirmTransfer) return;

    calculatedPayrollList.forEach(item => {
      onUpdatePayrollStatus(item.recordId, 'Sudah Ditransfer', {
        periodId: selectedPeriodId,
        basicSalary: item.basicSalary,
        allowanceSum: item.allowanceSum,
        bonus: item.bonus,
        lateDeduction: item.lateDeduction,
        bpjsKesehatan: item.bpjsKesehatan,
        bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
        pph21: item.pph21,
        netSalary: item.netSalary,
        attendanceSummary: item.attendanceSummary
      });
    });

    // Trigger mock bank wire document file download
    handleExportBankWireSpreadsheet();
    showToast('Pembayaran kolektif sukses diproses! Bank Roll-Out File terunduh otomatis.');
  };

  // Bulk update or approve all employee payroll status
  const handleBulkUpdateStatus = (status: 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer') => {
    const listToUpdate = filteredCalculatedPayroll;
    if (listToUpdate.length === 0) {
      showToast('Tidak ada slip gaji yang cocok untuk diproses massal.');
      return;
    }

    const actionText = status === 'Diproses' ? 'menyetujui (proses)' : status === 'Sudah Ditransfer' ? 'mentransfer (bayar)' : 'mengubah status menjadi belum dibayar untuk';
    const confirmMessage = `Apakah Anda yakin ingin secara massal ${actionText} seluruh slip gaji (${listToUpdate.length} karyawan) yang tampil saat ini?`;
    
    if (!window.confirm(confirmMessage)) return;

    listToUpdate.forEach(item => {
      onUpdatePayrollStatus(item.recordId, status, {
        periodId: selectedPeriodId,
        basicSalary: item.basicSalary,
        allowanceSum: item.allowanceSum,
        bonus: item.bonus,
        lateDeduction: item.lateDeduction,
        bpjsKesehatan: item.bpjsKesehatan,
        bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
        pph21: item.pph21,
        netSalary: item.netSalary,
        attendanceSummary: item.attendanceSummary
      });
    });

    if (status === 'Sudah Ditransfer') {
      handleExportBankWireSpreadsheet();
      showToast(`Sukses memproses pembayaran massal! ${listToUpdate.length} slip gaji ditransfer. Bank Transfer File otomatis diunduh.`);
    } else if (status === 'Diproses') {
      showToast(`Sukses menyetujui ${listToUpdate.length} slip gaji sekaligus (Status: Diproses).`);
    } else {
      showToast(`Sukses memperbarui ${listToUpdate.length} slip gaji ke status Belum Dibayar.`);
    }
  };

  // Mock excel/CSV bank wire spreadsheet generation
  const handleExportBankWireSpreadsheet = () => {
    const csvHeader = 'No,NIP,Nama Pegawai,Divisi,Status Pembayaran,Rekening Bank Virtual,Rincian Bersih (Net Take Home Pay)\r\n';
    const csvRows = calculatedPayrollList.map((item, idx) => {
      const vAcc = `8006${item.pin}00${item.employeeId.replace(/[^\d]/g, '') || idx}`;
      return `${idx + 1},${item.employeeId},${item.name},${item.department},${item.payoutStatus},'${vAcc},Rp ${item.netSalary}\r\n`;
    }).join('');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvHeader + csvRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `EFT_PAYROLL_TRANSFER_${selectedPeriodId}_BATCH.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // General CSV Payroll summary download
  const handleDownloadSummaryCSV = () => {
    const csvHeader = 'ID Karyawan,Nama,Divisi,Jabatan,Hari Hadir,Gaji Pokok,Tunjangan Kerja,Lembur (Overtime),Bonus Kinerja,Denda Terlambat,Potongan BPJS,Pajak PPh21,Diterima Bersih (Take Home Pay),Status Bayar\r\n';
    const csvRows = calculatedPayrollList.map(item => {
      const details = [
        item.employeeId,
        `"${item.name}"`,
        `"${item.department}"`,
        `"${item.position}"`,
        item.attendanceSummary.hadir,
        item.basicSalary,
        item.allowanceSum,
        item.overtimePay,
        item.bonus,
        item.lateDeduction,
        (item.bpjsKesehatan + item.bpjsKetenagakerjaan),
        item.pph21,
        item.netSalary,
        item.payoutStatus
      ].join(',');
      return details + '\r\n';
    }).join('');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvHeader + csvRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `REKAP_PENGGAJIAN_${selectedPeriodId}_${currentPeriod?.month.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekapitulasi Gaji dan Tunjangan terunduh dalam format CSV.');
  };

  // Open adjustment popup
  const handleOpenAdjustmentModal = (empId: string) => {
    const matched = calculatedPayrollList.find(c => c.employeeId === empId);
    if (!matched) return;

    const matchedAdj = adjustments[empId] || {
      customAllowance: 0,
      customDeduction: 0,
      remarks: '',
      bonusOverride: 0,
      overrideHadirEnabled: false,
      overrideHadirCount: matched.attendanceSummary.hadir,
      customBpjsKesehatan: 0,
      customBpjsKetenagakerjaan: 0,
      customPph21: 0,
      overrideBpjsKesehatanEnabled: false,
      overrideBpjsKetenagakerjaanEnabled: false,
      overridePph21Enabled: false
    };

    setAdjustingEmpId(empId);
    setAdjForm({
      customAllowance: matchedAdj.customAllowance,
      customDeduction: matchedAdj.customDeduction,
      remarks: matchedAdj.remarks,
      bonusOverride: matchedAdj.bonusOverride ? matchedAdj.bonusOverride.toString() : (bonusInput[empId] || ''),
      overrideHadirEnabled: matchedAdj.overrideHadirEnabled,
      overrideHadirCount: matchedAdj.overrideHadirEnabled ? matchedAdj.overrideHadirCount : matched.attendanceSummary.hadir,
      customBpjsKesehatan: matchedAdj.customBpjsKesehatan || 0,
      customBpjsKetenagakerjaan: matchedAdj.customBpjsKetenagakerjaan || 0,
      customPph21: matchedAdj.customPph21 || 0,
      overrideBpjsKesehatanEnabled: !!matchedAdj.overrideBpjsKesehatanEnabled,
      overrideBpjsKetenagakerjaanEnabled: !!matchedAdj.overrideBpjsKetenagakerjaanEnabled,
      overridePph21Enabled: !!matchedAdj.overridePph21Enabled
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingEmpId) return;

    const matched = calculatedPayrollList.find(c => c.employeeId === adjustingEmpId);
    if (!matched) return;

    const updated = {
      ...adjustments,
      [adjustingEmpId]: {
        customAllowance: Number(adjForm.customAllowance || 0),
        customDeduction: Number(adjForm.customDeduction || 0),
        remarks: adjForm.remarks || '',
        bonusOverride: Number(adjForm.bonusOverride || 0),
        overrideHadirEnabled: adjForm.overrideHadirEnabled,
        overrideHadirCount: Number(adjForm.overrideHadirCount || 0),
        customBpjsKesehatan: Number(adjForm.customBpjsKesehatan || 0),
        customBpjsKetenagakerjaan: Number(adjForm.customBpjsKetenagakerjaan || 0),
        customPph21: Number(adjForm.customPph21 || 0),
        overrideBpjsKesehatanEnabled: adjForm.overrideBpjsKesehatanEnabled,
        overrideBpjsKetenagakerjaanEnabled: adjForm.overrideBpjsKetenagakerjaanEnabled,
        overridePph21Enabled: adjForm.overridePph21Enabled
      }
    };

    setAdjustments(updated);
    localStorage.setItem(`hris_pay_adj_${selectedPeriodId}`, JSON.stringify(updated));

    // Update the local inputs if needed
    if (adjForm.bonusOverride) {
      setBonusInput(prev => ({
        ...prev,
        [adjustingEmpId]: adjForm.bonusOverride
      }));
    }

    setIsAdjustModalOpen(false);
    setAdjustingEmpId(null);
    showToast(`Penyesuaian finansial khusus untuk ${matched.name} berhasil diterapkan!`);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!activePayrollRecord) return;
    const emp = employees.find(e => e.id === activePayrollRecord.employeeId);
    if (!emp) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color definitions
    const primaryColor = [79, 70, 229]; // Indigo [r,g,b]
    const darkColor = [30, 41, 59]; // Slate 800
    const lightGray = [226, 232, 240]; // Slate 200
    const textMuted = [100, 116, 139]; // Slate 500

    // Title / Header PT BPUI
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('PT BIOMETRIC PORTAL UTAMA INDONESIA', 105, 18, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Gedung Biometrik Suite Lt. 5, Jl. Jend. Sudirman No. 12, Jakarta Selatan', 105, 23, { align: 'center' });
    doc.text('Website: enterprise.co.id | Email: hr@biometrik.co.id | Telp: (021) 555-1234', 105, 27, { align: 'center' });

    // Header Divider Line
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.line(15, 32, 195, 32);

    // Title of Document
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text('SLIP GAJI RESMI KARYAWAN', 105, 40, { align: 'center' });
    
    // Period Subtitle
    doc.setFont('Helvetica', 'medium');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode Bulan: ${currentPeriod?.month || 'Juni 2026'}`, 105, 45, { align: 'center' });

    // Decorative line below title
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.6);
    doc.line(90, 48, 120, 48);

    // Grid - General Information
    doc.setFillColor(248, 250, 252); // slate-50 background for detail box
    doc.setDrawColor(226, 232, 240); // slate-200 border
    doc.setLineWidth(0.3);
    doc.rect(15, 54, 180, 28, 'FD'); // Fill and border

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    
    // Left side of General Info Box
    doc.text('INFORMASI KARYAWAN', 20, 60);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    
    doc.text('Nama Lengkap', 20, 66);
    doc.text('NIP / ID', 20, 71);
    doc.text('Jabatan', 20, 76);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`:  ${emp.name}`, 48, 66);
    doc.setFont('Helvetica', 'bold'); // NIP bold font mono-like
    doc.text(`:  ${activePayrollRecord.employeeId}`, 48, 71);
    doc.setFont('Helvetica', 'normal');
    doc.text(`:  ${emp.position}`, 48, 76);

    // Right side of General Info Box
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('DETIL OPERASIONAL', 115, 60);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Divisi', 115, 66);
    doc.text('PIN Fingerprint', 115, 71);
    doc.text('Status Transfer', 115, 76);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`:  ${emp.department}`, 142, 66);
    doc.text(`:  ${emp.pin}`, 142, 71);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // highlighted transfer status
    doc.text(`:  ${activePayrollRecord.payoutStatus}`, 142, 76);

    // Attendance Summary Block (Table header and record)
    doc.setFillColor(241, 245, 249); // slate-100 header
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 88, 180, 14, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('RINGKASAN KEHADIRAN (FINGERPRINT SENSOR DATA)', 20, 94);

    // Drawn inline values
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Hadir:', 105, 94);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // green
    doc.text(`${activePayrollRecord.attendanceSummary.hadir} Hari`, 115, 94);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Lambat:', 130, 94);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(239, 68, 68); // red
    doc.text(`${activePayrollRecord.attendanceSummary.terlambat}x`, 142, 94);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Cuti/Izin:', 155, 94);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // amber
    doc.text(`${activePayrollRecord.attendanceSummary.cutiIzin} Hari`, 168, 94);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Alpa:', 180, 94);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(107, 114, 128); // gray
    doc.text(`${activePayrollRecord.attendanceSummary.alpa} Hari`, 188, 94);

    // Columns: Earnings (Penerimaan) vs Deductions (Potongan)
    // Left Header for Earnings
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254);
    doc.rect(15, 107, 87, 8, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text('I. PENERIMAAN UTUH (EARNINGS)', 18, 112.5);

    // Right Header for Deductions
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 226, 226);
    doc.rect(108, 107, 87, 8, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(153, 27, 27); // red-800
    doc.text('II. POTONGAN GAJI (DEDUCTIONS)', 111, 112.5);

    // Draw detail rows
    let leftY = 120;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const formatRupiah = (num: number) => 'Rp ' + num.toLocaleString('id-ID');

    // 1. Gaji Pokok
    doc.text('Gaji Pokok Utama', 18, leftY);
    doc.text(formatRupiah(activePayrollRecord.basicSalary), 102, leftY, { align: 'right' });
    
    // BPJS or Potongan Lambat on Right
    let rightY = 120;
    doc.text(`Biometric Delay Penalty (${activePayrollRecord.attendanceSummary.terlambat}x)`, 111, rightY);
    doc.setTextColor(153, 27, 27); // red-800 for penalty text
    doc.text(formatRupiah(activePayrollRecord.lateDeduction), 195, rightY, { align: 'right' });
    doc.setTextColor(51, 65, 85);

    // 2. Tunjangan Kantor
    leftY += 6;
    const officeAllowance = emp.allowance || 0;
    doc.text('Tunjangan Operasional Kantor', 18, leftY);
    doc.text(formatRupiah(officeAllowance), 102, leftY, { align: 'right' });

    rightY += 6;
    doc.text(`Iuran BPJS Kesehatan (${bpjsKesehatanRate}%)`, 111, rightY);
    doc.text(formatRupiah(activePayrollRecord.bpjsKesehatan), 195, rightY, { align: 'right' });

    // 3. Tunjangan Meal / Transport
    leftY += 6;
    const customAllowanceAmount = activePayrollRecord.customAllowance || 0;
    const mealAllowance = activePayrollRecord.allowanceSum - officeAllowance - customAllowanceAmount;
    doc.text(`Tunjangan Meal & Transport (${activePayrollRecord.attendanceSummary.hadir}x Tap)`, 18, leftY);
    doc.text(formatRupiah(mealAllowance), 102, leftY, { align: 'right' });

    rightY += 6;
    doc.text(`Iuran BPJS Ketenagakerjaan (${bpjsKetenagakerjaanRate}%)`, 111, rightY);
    doc.text(formatRupiah(activePayrollRecord.bpjsKetenagakerjaan), 195, rightY, { align: 'right' });

    // 4. Overtime Uang Lembur
    leftY += 6;
    doc.text(`Uang Lembur (${formatOvertimeDuration(activePayrollRecord.overtimeMinutes || 0)})`, 18, leftY);
    doc.text(formatRupiah(activePayrollRecord.overtimePay || 0), 102, leftY, { align: 'right' });

    rightY += 6;
    doc.text(`Pajak Penghasilan PPh21 (${pph21Rate}%)`, 111, rightY);
    doc.text(formatRupiah(activePayrollRecord.pph21), 195, rightY, { align: 'right' });

    // 5. Bonus & Custom allowances/deductions
    leftY += 6;
    doc.text('Bonus Tambahan Kinerja', 18, leftY);
    doc.text(formatRupiah(activePayrollRecord.bonus), 102, leftY, { align: 'right' });

    rightY += 6;
    if (activePayrollRecord.customDeduction && activePayrollRecord.customDeduction > 0) {
      doc.text('Potongan Penyesuaian Kustom', 111, rightY);
      doc.text(formatRupiah(activePayrollRecord.customDeduction), 195, rightY, { align: 'right' });
    } else {
      doc.setTextColor(148, 163, 184); // light gray
      doc.text('-', 111, rightY);
      doc.text('Rp 0', 195, rightY, { align: 'right' });
      doc.setTextColor(51, 65, 85);
    }

    // 6. Custom Allowance row
    leftY += 6;
    if (customAllowanceAmount > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // green
      doc.text('Tunjangan Tambahan Kustom', 18, leftY);
      doc.text(formatRupiah(customAllowanceAmount), 102, leftY, { align: 'right' });
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    } else {
      doc.setTextColor(148, 163, 184); // light gray
      doc.text('-', 18, leftY);
      doc.text('Rp 0', 102, leftY, { align: 'right' });
      doc.setTextColor(51, 65, 85);
    }

    rightY += 6; // align right side to line spacing
    
    // Subtotals block
    const subtotalLeft = activePayrollRecord.basicSalary + activePayrollRecord.allowanceSum + activePayrollRecord.bonus + (activePayrollRecord.overtimePay || 0);
    const subtotalRight = activePayrollRecord.lateDeduction + activePayrollRecord.bpjsKesehatan + activePayrollRecord.bpjsKetenagakerjaan + activePayrollRecord.pph21 + (activePayrollRecord.customDeduction || 0);

    let maxBoxY = Math.max(leftY, rightY) + 4;
    
    // Drawing a thin line for subtotal
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, maxBoxY, 102, maxBoxY);
    doc.line(108, maxBoxY, 195, maxBoxY);

    maxBoxY += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Subtotal Penerimaan', 18, maxBoxY);
    doc.text(formatRupiah(subtotalLeft), 102, maxBoxY, { align: 'right' });

    doc.text('Subtotal Potongan', 111, maxBoxY);
    doc.text(formatRupiah(subtotalRight), 195, maxBoxY, { align: 'right' });

    // Remarks / Catatan if present
    let currentY = maxBoxY + 8;
    if (activePayrollRecord.remarks) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, currentY, 180, 10, 'FD');
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Catatan HRD: "${activePayrollRecord.remarks}"`, 18, currentY + 6);
      currentY += 14;
    } else {
      currentY += 4;
    }

    // Net Salary / Take Home Pay Block
    doc.setFillColor(79, 70, 229); // Beautiful Indigo background
    doc.setDrawColor(67, 56, 202);
    doc.rect(15, currentY, 180, 16, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL GAJI BERSIH (NET TAKE HOME PAY)', 20, currentY + 6);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(199, 210, 254);
    doc.text('Dana resmi dikreditkan via Bank Mandiri / BCA sesuai status transfer.', 20, currentY + 11);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(formatRupiah(activePayrollRecord.netSalary), 190, currentY + 10, { align: 'right' });

    // Signature Area
    const sigY = currentY + 28;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    
    // Left Signature
    doc.text('Diterima Oleh Karyawan,', 20, sigY);
    doc.line(20, sigY + 18, 70, sigY + 18);
    doc.setFont('Helvetica', 'bold');
    doc.text(emp.name, 20, sigY + 22);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Karyawan PT BPUI (ID: ${emp.id})`, 20, sigY + 25);

    // Right Signature
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Otoritas Pengesahan HRD,', 140, sigY);
    doc.line(140, sigY + 18, 190, sigY + 18);
    doc.setFont('Helvetica', 'bold');
    doc.text('Siti Aminah, S.Psi', 140, sigY + 22);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Senior HR Executive PT BPUI', 140, sigY + 25);

    // Digital authenticity watermark/footer
    const footerY = sigY + 38;
    doc.setDrawColor(241, 245, 249);
    doc.line(15, footerY, 195, footerY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('<< Dokumen Slip Gaji ini diproses secara elektronik sesuai enkripsi biner sidik jari Solution X-100C >>', 105, footerY + 6, { align: 'center' });
    doc.text(`Unduh Tanggal: ${new Date().toLocaleDateString('id-ID')} | Cetak ID: MD5-${activePayrollRecord.id.substring(0, 8).toUpperCase()}`, 105, footerY + 10, { align: 'center' });

    // Trigger save
    const fileMonthName = (currentPeriod?.month || 'Juni_2026').replace(/\s+/g, '_');
    const fileName = `Slip_Gaji_${emp.name.replace(/\s+/g, '_')}_${fileMonthName}.pdf`;
    doc.save(fileName);
    showToast(`Dokumen Slip Gaji untuk ${emp.name} berhasil diekspor sebagai berkas format PDF resmi!`);
  };

  // Chart Data preparation
  const chartCostData = useMemo(() => {
    return [
      { name: 'Gaji Pokok', Nilai: summaryStats.totalBaseSalary, fill: '#3B82F6' },
      { name: 'Tunjangan', Nilai: summaryStats.totalAllowances, fill: '#10B981' },
      { name: 'Uang Lembur', Nilai: summaryStats.totalOvertimePaid, fill: '#F59E0B' },
      { name: 'Bonus/Apresiasi', Nilai: summaryStats.totalBonuses, fill: '#8B5CF6' },
      { name: 'Total Potongan', Nilai: summaryStats.totalDeductions, fill: '#EF4444' }
    ];
  }, [summaryStats]);

  const chartDepartmentData = useMemo(() => {
    const deptTotals: { [key: string]: number } = {};
    calculatedPayrollList.forEach(item => {
      deptTotals[item.department] = (deptTotals[item.department] || 0) + item.netSalary;
    });

    return Object.keys(deptTotals).map((key, i) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
      return {
        name: key,
        Biaya: deptTotals[key],
        fill: colors[i % colors.length]
      };
    });
  }, [calculatedPayrollList]);

  // Filter logic
  const filteredCalculatedPayroll = useMemo(() => {
    return calculatedPayrollList.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.pin.toString().includes(searchQuery);

      const matchesDept = selectedDept === 'All' || item.department === selectedDept;
      
      const matchesStatus = selectedStatusFilter === 'All' || 
                            (selectedStatusFilter === 'Belum Dibayar' && item.payoutStatus === 'Belum Dibayar') ||
                            (selectedStatusFilter === 'Diproses' && item.payoutStatus === 'Diproses') ||
                            (selectedStatusFilter === 'Sudah Ditransfer' && item.payoutStatus === 'Sudah Ditransfer');

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [calculatedPayrollList, searchQuery, selectedDept, selectedStatusFilter]);

  // Department choices array
  const departmentChoices = ['All', 'IT & Engineering', 'Human Resources', 'Finance & Accounting', 'Operations', 'Marketing & Sales'];

  return (
    <div className="space-y-6" id="payroll-workspace">
      
      {/* Toast Alert pop-up */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 max-w-sm text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Period Selector Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 shadow-sm p-4 rounded-2xl" id="payroll-period-header">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-blue-600" /> Penggajian &amp; Remunerasi Finansial Karyawan
          </h3>
          <p className="text-[10px] text-gray-400">
            Komputasi remunerasi otomatis berdasar log biometric X-100C dengan penyesuaian kustom
            {currentPeriod && !isEditingActivePeriodDates && (
              <span className="ml-1.5 inline-flex items-center gap-1.5">
                <span className="text-blue-650 font-extrabold bg-blue-50 px-2 py-0.5 rounded font-mono border border-blue-100 text-[10px]">
                  {currentPeriod.startDate} s/d {currentPeriod.endDate}
                </span>
                <button
                  type="button"
                  onClick={handleStartEditActivePeriod}
                  className="text-indigo-600 hover:text-indigo-800 font-extrabold text-[9px] bg-indigo-50/60 hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 cursor-pointer transition-all inline-flex items-center gap-0.5"
                  title="Sesuaikan/Kustomisasi rentang tanggal periode gaji ini"
                >
                  ✏️ Edit Tanggal
                </button>
              </span>
            )}
            {currentPeriod && isEditingActivePeriodDates && (
              <span className="ml-1.5 inline-flex items-center gap-2 flex-wrap bg-amber-50 p-2 rounded-xl border border-amber-200 mt-1 sm:mt-0">
                <span className="text-[10px] font-bold text-amber-900">Mulai:</span>
                <input
                  type="date"
                  value={activePeriodFromDate}
                  onChange={(e) => setActivePeriodFromDate(e.target.value)}
                  className="bg-white border text-amber-950 border-amber-200 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <span className="text-[10px] font-bold text-amber-900">Selesai:</span>
                <input
                  type="date"
                  value={activePeriodToDate}
                  onChange={(e) => setActivePeriodToDate(e.target.value)}
                  className="bg-white border text-amber-950 border-amber-200 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSaveActivePeriodDates}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:text-white text-white font-extrabold text-[9px] px-2 py-1 rounded-md transition-all cursor-pointer shadow-xs"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingActivePeriodDates(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[9px] px-2 py-1 rounded-md transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">Periode Pembukuan:</span>
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="text-xs bg-slate-50 border font-bold text-slate-705 px-3 py-1.5 rounded-xl outline-none border-slate-200 cursor-pointer"
            id="payroll-period-select"
          >
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.month}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddPeriodOpen(true)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
            id="btn-trigger-add-period"
          >
            + Periode Kustom
          </button>
        </div>
      </div>

      {/* Role Simulation Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" /> Simulasi Hak Akses Persetujuan Gaji Bertingkat
          </div>
          <p className="text-[10px] text-slate-500">
            Sistem mewajibkan <strong>Manajer Divisi</strong> menyetujui detail lembur, denda, dan remunerasi staf sebelum HR dapat memproses pembayaran (transfer).
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

      {/* Konfigurasi Tarif BPJS & Pajak PPh21 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="custom-tariff-config-card">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" /> Konfigurasi Regulasi Tarif Finansial &amp; Perpajakan BPJS
            </h4>
            <p className="text-[10px] text-slate-500">
              Ubah persentase denda, potongan iuran jaminan kesehatan, jaminan ketenagakerjaan, serta kalkulasi PPh 21 secara dinamis.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
              Sinkronisasi Instant
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* BPJS Kesehatan */}
          <div className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 text-[10px] uppercase">Iuran BPJS Kesehatan</span>
              <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5">
                <input 
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={bpjsKesehatanRate}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setBpjsKesehatanRate(val);
                    localStorage.setItem('hris_bpjs_kesehatan_rate', val.toString());
                    window.dispatchEvent(new Event('hris_salary_config_updated'));
                  }}
                  className="w-10 font-bold font-mono text-indigo-600 outline-none p-0 text-center text-xs bg-transparent"
                />
                <span className="text-slate-400 text-[10px]">%</span>
              </div>
            </div>
            <input 
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={bpjsKesehatanRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setBpjsKesehatanRate(val);
                localStorage.setItem('hris_bpjs_kesehatan_rate', val.toString());
                window.dispatchEvent(new Event('hris_salary_config_updated'));
              }}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">Diambil dari upah pokok bulanan</span>
          </div>

          {/* BPJS Ketenagakerjaan */}
          <div className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 text-[10px] uppercase">BPJS Ketenagakerjaan</span>
              <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5">
                <input 
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={bpjsKetenagakerjaanRate}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setBpjsKetenagakerjaanRate(val);
                    localStorage.setItem('hris_bpjs_ketenagakerjaan_rate', val.toString());
                    window.dispatchEvent(new Event('hris_salary_config_updated'));
                  }}
                  className="w-10 font-bold font-mono text-indigo-600 outline-none p-0 text-center text-xs bg-transparent"
                />
                <span className="text-slate-400 text-[10px]">%</span>
              </div>
            </div>
            <input 
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={bpjsKetenagakerjaanRate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setBpjsKetenagakerjaanRate(val);
                localStorage.setItem('hris_bpjs_ketenagakerjaan_rate', val.toString());
                window.dispatchEvent(new Event('hris_salary_config_updated'));
              }}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">Jaminan Hari Tua (JHT) &amp; Pensiun</span>
          </div>

          {/* Pajak Penghasilan PPh21 */}
          <div className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 text-[10px] uppercase">Pajak PPh 21</span>
              <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5">
                <input 
                  type="number"
                  min="0"
                  max="35"
                  step="0.1"
                  value={pph21Rate}
                  onChange={(e) => {
                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                    setPph21Rate(val);
                    localStorage.setItem('hris_pph21_rate', val.toString());
                    window.dispatchEvent(new Event('hris_salary_config_updated'));
                  }}
                  className="w-10 font-bold font-mono text-rose-600 outline-none p-0 text-center text-xs bg-transparent"
                />
                <span className="text-slate-400 text-[10px]">%</span>
              </div>
            </div>
            <input 
              type="range"
              min="0"
              max="35"
              step="0.1"
              value={pph21Rate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPph21Rate(val);
                localStorage.setItem('hris_pph21_rate', val.toString());
                window.dispatchEvent(new Event('hris_salary_config_updated'));
              }}
              className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">Estimasi Pajak Penghasilan Karyawan</span>
          </div>

          {/* Overtime Rate */}
          <div className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 text-[10px] uppercase">Upah Lembur / Jam</span>
              <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5">
                <span className="text-slate-400 text-[10px] mr-1">Rp</span>
                <input 
                  type="number"
                  min="5000"
                  max="150000"
                  step="1000"
                  value={overtimeRate}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setOvertimeRate(val);
                    localStorage.setItem('hris_overtime_rate', val.toString());
                    window.dispatchEvent(new Event('hris_salary_config_updated'));
                  }}
                  className="w-14 font-bold font-mono text-emerald-600 outline-none p-0 text-center text-xs bg-transparent"
                />
              </div>
            </div>
            <input 
              type="range"
              min="10000"
              max="100000"
              step="1000"
              value={overtimeRate}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setOvertimeRate(val);
                localStorage.setItem('hris_overtime_rate', val.toString());
                window.dispatchEvent(new Event('hris_salary_config_updated'));
              }}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">Kompensasi lembur per jam kerja</span>
          </div>

          {/* Late Penalty Rate */}
          <div className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 text-[10px] uppercase">Denda Lambat / Menit</span>
              <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 py-0.5">
                <span className="text-slate-400 text-[10px] mr-1">Rp</span>
                <input 
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={lateDeductionRate}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    setLateDeductionRate(val);
                    localStorage.setItem('hris_late_deduction_rate', val.toString());
                    window.dispatchEvent(new Event('hris_salary_config_updated'));
                  }}
                  className="w-10 font-bold font-mono text-amber-600 outline-none p-0 text-center text-xs bg-transparent"
                />
              </div>
            </div>
            <input 
              type="range"
              min="0"
              max="2000"
              step="50"
              value={lateDeductionRate}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLateDeductionRate(val);
                localStorage.setItem('hris_late_deduction_rate', val.toString());
                window.dispatchEvent(new Event('hris_salary_config_updated'));
              }}
              className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">Potongan otomatis denda keterlambatan</span>
          </div>

        </div>
      </div>

      {/* Dynamic Summary Cards widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="payroll-stats">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-blue-200 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Payroll Ditransfer</p>
            <h4 className="text-base font-extrabold text-blue-600 mt-0.5">
              Rp {summaryStats.totalPaid.toLocaleString('id-ID')}
            </h4>
            <p className="text-[9px] text-gray-400">Telah diautentikasi bank</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-amber-250 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Outstanding / Pending</p>
            <h4 className="text-base font-extrabold text-amber-600 mt-0.5">
              Rp {summaryStats.pendingPayments.toLocaleString('id-ID')}
            </h4>
            <p className="text-[9px] text-gray-400">Menunggu transfer dana</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-emerald-250 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Subtotal Anggaran Kas</p>
            <h4 className="text-base font-extrabold text-emerald-600 mt-0.5">
              Rp {(summaryStats.totalPaid + summaryStats.pendingPayments).toLocaleString('id-ID')}
            </h4>
            <p className="text-[9px] text-gray-400">Total belanja gaji kotor</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-rose-200 transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Total Nilai Potongan</p>
            <h4 className="text-base font-extrabold text-rose-600 mt-0.5">
              Rp {summaryStats.totalDeductions.toLocaleString('id-ID')}
            </h4>
            <p className="text-[9px] text-gray-400">PPh21, BPJS Kesehatan &amp; Lambat</p>
          </div>
        </div>
      </div>

      {/* Collapsible Interactive Charts and Live Rates Adjuster Drawer */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button 
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100 hover:bg-slate-100/55 transition-colors cursor-pointer text-xs font-extrabold text-[#0F172A]"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            ANALISIS DISTRIBUSI PENGGELUARAN &amp; SIMULASI BIAYA
          </span>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
            <span>{showAnalytics ? 'Klik untuk Menyembunyikan Dashboard Visual' : 'Klik untuk Membuka Dashboard Visual'}</span>
            {showAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-slate-100">
                
                {/* Recharts 1: Component breakdown bar chart */}
                <div className="p-4 border border-slate-100 rounded-xl space-y-3 bg-slate-50/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Proporsi Struktur Gaji Karyawan</span>
                  <div className="h-48 w-full text-[10px]" style={{ minHeight: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartCostData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} />
                        <YAxis stroke="#888" fontSize={9} tickLine={false} width={45} tickFormatter={(val) => `Rp ${val/1e6}jt`} />
                        <Tooltip 
                          formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Jumlah']}
                          contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                        />
                        <Bar dataKey="Nilai" radius={[4, 4, 0, 0]}>
                          {chartCostData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recharts 2: Department Net Totals Pie Chart */}
                <div className="p-4 border border-slate-100 rounded-xl space-y-3 bg-slate-50/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Beban Gaji Bersih per Divisi</span>
                  <div className="h-48 w-full text-[10px]" style={{ minHeight: '180px' }}>
                    {chartDepartmentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartDepartmentData}
                            dataKey="Biaya"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                          >
                            {chartDepartmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Gaji Bersih']}
                            contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={6} fontSize={8} wrapperStyle={{ fontSize: '9px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">Belum ada data</div>
                    )}
                  </div>
                </div>

                {/* Slide out Live Rates Adjuster Panel inside grid */}
                <div className="p-4 border border-dashed border-blue-200 rounded-xl space-y-3.5 bg-blue-50/25">
                  <div className="flex items-center justify-between border-b pb-1.5 border-blue-100/50">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-800 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" /> Simulasi Aturan Tarif &amp; BPJS
                    </span>
                    <span className="text-[9px] bg-blue-100/80 text-blue-800 px-1.5 py-0.5 rounded-full font-bold">LIVE UPDATE</span>
                  </div>

                  <div className="space-y-3 text-[11px] font-semibold text-slate-705">
                    
                    {/* BPJS slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-600">Iuran BPJS Kesehatan:</span>
                        <span className="font-mono text-blue-700 font-extrabold">{bpjsKesehatanRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5"
                        value={bpjsKesehatanRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setBpjsKesehatanRate(val);
                          localStorage.setItem('hris_bpjs_kesehatan_rate', val.toString());
                        }}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* BPJS Ketenagakerjaan slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-600">BPJS Ketenagakerjaan:</span>
                        <span className="font-mono text-blue-700 font-extrabold">{bpjsKetenagakerjaanRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="8" 
                        step="0.5"
                        value={bpjsKetenagakerjaanRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setBpjsKetenagakerjaanRate(val);
                          localStorage.setItem('hris_bpjs_ketenagakerjaan_rate', val.toString());
                        }}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* PPh21 estimated Tax percentage rates */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-600">Estimasi Potongan PPh21:</span>
                        <span className="font-mono text-rose-600 font-extrabold">{pph21Rate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        step="1"
                        value={pph21Rate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPph21Rate(val);
                          localStorage.setItem('hris_pph21_rate', val.toString());
                        }}
                        className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="text-[10px] text-blue-800 leading-normal bg-white/70 border border-blue-50 p-2 rounded-lg font-medium">
                      💡 Tarik slider untuk mengubah potongan BPJS &amp; Pajak secara instan pada kolom data di bawah tanpa me-reload aplikasi.
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Automatic Overtime Calculator Setup Box */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4" id="overtime-calculator-setup">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-3 border-b border-gray-100">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Kalkulator Lembur Otomatis (Biometric Checkout Sync)
            </h4>
            <p className="text-[10px] text-gray-400">
              Menghitung hak lembur berdasarkan selisih waktu log keluar (Check-Out) sidik jari Solution X-100C pasca-jam kerja standarnya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-xl">
              <span className="font-medium">Total Akumulasi Lembur Kantor:</span>{' '}
              <strong className="font-extrabold">{formatOvertimeDuration(summaryStats.totalOvertimeMinutes)}</strong>
            </div>
            <div className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-805 px-2.5 py-1 rounded-xl">
              <span className="font-medium">Anggaran Lembur Kantor:</span>{' '}
              <strong className="font-extrabold">Rp {summaryStats.totalOvertimePaid.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
              Jam Pulang Standar Kantor <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Digunakan sebagai acuan awal waktu lembur" />
            </label>
            <input 
              type="time" 
              value={standardCheckOut}
              onChange={(e) => setStandardCheckOut(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">
              Tarif Kompensasi Lembur per Jam (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-slate-400 font-medium font-mono text-[11px]">Rp</span>
              <input 
                type="number" 
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">
              Batas Minimal Durasi Lembur (Menit) *
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={minOvertimeMinutes}
                onChange={(e) => setMinOvertimeMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2 pr-14 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-2.5 top-2.5 text-slate-400 font-medium text-[10px]">Menit</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: automatic biometric overtime drafts validation list */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4 font-sans" id="automated-overtime-drafts-panel">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Tinjau Draf Entri Lembur Otomatis (Validasi Mesin X-100C)
              {pendingOvertimeDrafts.length > 0 && (
                <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                  {pendingOvertimeDrafts.length} Draf Baru
                </span>
              )}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              Sistem membandingkan log waktu pulang mesin sidik jari biometrik dengan jam pulang shift masing-masing karyawan secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingOvertimeDrafts.length > 0 && (
              <button
                type="button"
                onClick={handleApproveAllDrafts}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Setujui Semua Draf
              </button>
            )}
            <button
              onClick={() => setIsDraftOvertimePanelExpanded(!isDraftOvertimePanelExpanded)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all border border-slate-200 cursor-pointer"
              title={isDraftOvertimePanelExpanded ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
            >
              {isDraftOvertimePanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isDraftOvertimePanelExpanded && (
          <div className="overflow-x-auto">
            {pendingOvertimeDrafts.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-lg">
                  ✅
                </div>
                <div className="text-slate-800 font-bold text-xs mt-1">Seluruh Log Biometrik Terverifikasi</div>
                <p className="text-[10px] text-gray-400 max-w-md">
                  Semua log ketepatan pulang dari mesin biometrik Solution X-100C untuk periode ini ({currentPeriod?.month || 'aktif'}) telah disinkronkan &amp; dikonfirmasi. Tidak ada draf lembur yang tertunda.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100 text-[10px]">
                    <th className="p-3">Karyawan</th>
                    <th className="p-3">Tanggal &amp; Shift</th>
                    <th className="p-3">Log X-100C</th>
                    <th className="p-3">Selisih Pulang / Durasi</th>
                    <th className="p-3">Estimasi Kompensasi</th>
                    <th className="p-3 text-right">Tindakan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {pendingOvertimeDrafts.map((log) => {
                    const details = getLogDraftDetails(log);
                    if (!details) return null;

                    const isEditing = editingDraftId === log.id;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{details.empName}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{details.empDept}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-700">{log.date}</div>
                          <div className="text-[10px] text-indigo-650 font-bold bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded w-max">
                            Shift: {details.empShift} (Pulang: {details.stdEndStr})
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg w-max flex items-center gap-1 text-[10px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {log.checkOut}
                          </div>
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editingDraftMinutes}
                                onChange={(e) => setEditingDraftMinutes(Number(e.target.value))}
                                className="w-16 p-1 text-xs border border-blue-400 rounded bg-white text-slate-800 font-mono focus:outline-none"
                                placeholder="Min"
                              />
                              <span className="text-[10px] text-gray-400 font-mono">mnt</span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-lg font-mono">
                                ⏱️ {formatOvertimeDuration(details.diffMinutes)}
                              </span>
                              <div className="text-[9px] text-gray-400 font-mono">
                                (Selisih: {details.diffMinutes} mnt)
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-700">
                            Rp {isEditing 
                              ? Math.round((editingDraftMinutes / 60) * overtimeRate).toLocaleString('id-ID')
                              : details.estimatedPay.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[9px] text-gray-400 font-mono">
                            Base: Rp {overtimeRate.toLocaleString('id-ID')}/jam
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  handleApproveDraft(log, editingDraftMinutes);
                                  setEditingDraftId(null);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-xl text-[10px] transition-all cursor-pointer"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDraftId(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2.5 py-1 rounded-xl text-[10px] transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveDraft(log)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer inline-flex items-center gap-0.5"
                                title="Setujui dan masukkan ke slip gaji"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDraftId(log.id);
                                  setEditingDraftMinutes(details.diffMinutes);
                                }}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-850 border border-indigo-200 font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer inline-flex items-center gap-0.5"
                                title="Koreksi jumlah jam lembur"
                              >
                                Koreksi
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectDraft(log)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-extrabold px-2.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer inline-flex items-center gap-0.5"
                                title="Abaikan / Tolak draf lembur ini"
                              >
                                Abaikan
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Polish Filter control bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between" id="payroll-filters-section">
        <div className="flex flex-col md:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NIP, FP Pin, atau nama..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-220 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            {departmentChoices.map(dept => {
              const active = selectedDept === dept;
              const count = dept === 'All' 
                ? calculatedPayrollList.length 
                : calculatedPayrollList.filter(item => item.department === dept).length;

              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    active ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-150'
                  }`}
                >
                  {dept === 'All' ? 'Semua Divisi' : dept} 
                  <span className={`ml-1.5 px-1 py-0.2 rounded-full text-[9px] ${active ? 'bg-blue-750 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <span className="text-[11px] font-bold text-slate-500">Status Pembayaran:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 font-bold text-slate-755 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="All">Semua Status Gaji</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Diproses">Diproses</option>
            <option value="Sudah Ditransfer">Sudah Ditransfer</option>
          </select>
        </div>
      </div>

      {/* Main Table listing employee salaries calculated */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="payroll-table-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-1">
          <div>
            <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
              <TableProperties className="w-4.5 h-4.5 text-blue-600" /> Rincian Penggajian Pegawai ({filteredCalculatedPayroll.length} Record)
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Suku bunga BPJS &amp; Tax PPh21 diproses realtime sesuai simulator.</p>
          </div>

          {/* Collective actions buttons triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsAutoPayrollModalOpen(true);
                setAutoPayrollStep('setup');
              }}
              title="Generate payroll bulanan secara batch & jadwalkan perhitungan otomatis"
              className="text-[10.5px] bg-indigo-650 hover:bg-indigo-600 outline-none text-white font-black px-3.5 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1.5 hover:scale-101 border border-indigo-750"
              id="btn-generate-automated-payroll"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Generate Payroll Otomatis
            </button>

            <button
              onClick={() => handleBulkUpdateStatus('Diproses')}
              title="Setujui seluruh slip gaji yang tampil saat ini ke status Diproses"
              className="text-[10.5px] bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
              id="btn-approve-all-payroll"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve All
            </button>

            <div className="relative inline-flex items-center gap-1.5 bg-slate-50 border border-slate-205 rounded-xl px-2.5 py-1 text-[11.5px] font-bold text-slate-700 shadow-xs">
              <span className="text-slate-500 text-[10px] uppercase font-black tracking-wider">Update Massal:</span>
              <select
                id="bulk-payout-status-update"
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  handleBulkUpdateStatus(val as 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer');
                  e.target.value = ""; // Reset matching option
                }}
                className="bg-transparent border-none text-[11px] font-black text-blue-700 outline-none cursor-pointer focus:ring-0 px-1 py-0.5"
              >
                <option value="" disabled hidden>-- Pilih Status --</option>
                <option value="Belum Dibayar">Belum Dibayar</option>
                <option value="Diproses">Diproses (Approve)</option>
                <option value="Sudah Ditransfer">Sudah Ditransfer</option>
              </select>
            </div>

            <button
              onClick={handleBatchLockEverything}
              title="Kunci seluruh slip gaji sementara ke database"
              className="text-[10.5px] bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Kunci Semua Slip
            </button>
            <button
              onClick={handleBatchPayoutCollective}
              title="Bayar serempak seluruh pegawai di periode ini"
              className="text-[10.5px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1"
            >
              <DownloadCloud className="w-3.5 h-3.5" /> Transfer Kolektif Bank
            </button>
            <button
              onClick={handleDownloadSummaryCSV}
              title="Unduh daftar rekapitulasi gaji dalam format CSV"
              className="text-[10.5px] bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Unduh Laporan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" id="payroll-main-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-3">Karyawan / Divisi</th>
                <th className="p-3">Gaji Pokok Utama</th>
                <th className="p-3">Tunjangan &amp; Hadir</th>
                <th className="p-3">Lembur (Biometrik Checkout)</th>
                <th className="p-3">Bonus Kinerja</th>
                <th className="p-3">Penyesuaian Kustom</th>
                <th className="p-3">Potongan Lambat &amp; BPJS</th>
                <th className="p-3">Diterima Bersih (Net)</th>
                <th className="p-3 text-center">Persetujuan MGR</th>
                <th className="p-3 text-center">Status Bayar (HRD)</th>
                <th className="p-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCalculatedPayroll.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 font-semibold">
                    <BadgeAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Tidak ada data penggajian karyawan untuk kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredCalculatedPayroll.map((item) => {
                  const isSavedRecord = !item.recordId.startsWith('TEMP-');
                  const hasCustomAdjustments = item.customAllowance > 0 || item.customDeduction > 0;
                  
                  return (
                    <tr key={item.employeeId} className="hover:bg-gray-50/50 transition-colors" id={`pay-row-${item.employeeId}`}>
                      {/* Name & NIP Column */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {item.name}
                          {isSavedRecord && (
                            <span className="text-[8.5px] font-black bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200" title="Data Gaji Terkunci &amp; Terarsip">
                              TERKUNCI
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">NIP: {item.employeeId} · FP PIN: {item.pin}</div>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded block w-max mt-1">{item.department}</span>
                      </td>

                      {/* Basic Salary */}
                      <td className="p-3 font-semibold text-slate-700">Rp {item.basicSalary.toLocaleString('id-ID')}</td>

                      {/* Allowances */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-700">Rp {item.allowanceSum.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.attendanceSummary.hadir}x Tap masuk</div>
                      </td>

                      {/* Overtime */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-700 font-mono">Rp {item.overtimePay.toLocaleString('id-ID')}</div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-emerald-600 font-bold" title="Lembur biometrik yang telah disetujui HRD">
                            ✅ Setuju: {formatOvertimeDuration(item.overtimeMinutes)}
                          </div>
                          {item.draftOvertimeMinutes > 0 && (
                            <div className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-1 py-0.5 rounded w-max animate-pulse" title="Tinjau draf lembur otomatis di atas">
                              ⏳ Draf: {formatOvertimeDuration(item.draftOvertimeMinutes)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Bonus */}
                      <td className="p-3">
                        {!isSavedRecord ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Rp</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={bonusInput[item.employeeId] || (item.bonus > 0 ? item.bonus.toString() : '')}
                              onChange={(e) => setBonusInput({ ...bonusInput, [item.employeeId]: e.target.value })}
                              className="bg-gray-50 border p-1 rounded w-20 max-w-[90px] font-mono text-[11px]"
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-700">Rp {item.bonus.toLocaleString('id-ID')}</span>
                        )}
                      </td>

                      {/* Custom Allowances & Deductions */}
                      <td className="p-3">
                        {hasCustomAdjustments ? (
                          <div className="space-y-0.5 text-[10px]">
                            {item.customAllowance > 0 && (
                              <div className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded-sm w-max" title={item.remarks}>
                                +Rp {item.customAllowance.toLocaleString('id-ID')}
                              </div>
                            )}
                            {item.customDeduction > 0 && (
                              <div className="text-rose-700 font-bold bg-rose-50 px-1 rounded-sm w-max" title={item.remarks}>
                                -Rp {item.customDeduction.toLocaleString('id-ID')}
                              </div>
                            )}
                            <div className="text-[9px] text-slate-400 truncate max-w-[120px] font-medium italic mt-0.5">
                              &apos;{item.remarks}&apos;
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Tidak ada</span>
                        )}
                      </td>

                      {/* Deductions: Late, BPJS, Tax */}
                      <td className="p-3">
                        <div className="space-y-0.5 text-[10px] font-medium text-slate-500">
                          {item.lateDeduction > 0 && (
                            <div className="text-rose-600 font-bold">
                              Denda FP: -Rp {item.lateDeduction.toLocaleString('id-ID')}
                            </div>
                          )}
                          <div className="text-slate-400">
                            BPJS: Rp {(item.bpjsKesehatan + item.bpjsKetenagakerjaan).toLocaleString('id-ID')}
                          </div>
                          <div className="text-slate-400">
                            Tax PPh21: Rp {item.pph21.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </td>

                      {/* Net Take Home Pay */}
                      <td className="p-3 font-extrabold text-blue-700 text-sm">
                        Rp {item.netSalary.toLocaleString('id-ID')}
                      </td>

                      {/* Persetujuan MGR */}
                      <td className="p-3 text-center">
                        {activeRole === 'manager' ? (
                          <select
                            value={item.managerApproval}
                            onChange={(e) => {
                              if (onUpdatePayrollApproval) {
                                onUpdatePayrollApproval(item.recordId, e.target.value as any, {
                                  periodId: selectedPeriodId,
                                  basicSalary: item.basicSalary,
                                  allowanceSum: item.allowanceSum,
                                  bonus: item.bonus,
                                  lateDeduction: item.lateDeduction,
                                  bpjsKesehatan: item.bpjsKesehatan,
                                  bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
                                  pph21: item.pph21,
                                  netSalary: item.netSalary,
                                  attendanceSummary: item.attendanceSummary
                                });
                              }
                              showToast(`Persetujuan Manajer diubah: ${e.target.value}!`);
                            }}
                            className={`text-[10px] font-bold rounded-lg px-2 py-1 select-none cursor-pointer outline-none ${
                              item.managerApproval === 'Disetujui' ? 'bg-blue-600 text-white shadow-xs' :
                              item.managerApproval === 'Ditolak' ? 'bg-rose-600 text-white shadow-xs' :
                              'bg-amber-100 text-amber-900'
                            }`}
                          >
                            <option value="Pending" className="text-slate-800 bg-white">⌛ Pending</option>
                            <option value="Disetujui" className="text-slate-800 bg-white">✓ Setujui</option>
                            <option value="Ditolak" className="text-slate-800 bg-white font-semibold text-rose-600">✗ Tolak</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                            item.managerApproval === 'Disetujui' ? 'bg-blue-50 text-blue-750 border border-blue-105' :
                            item.managerApproval === 'Ditolak' ? 'bg-rose-50 text-rose-750 border border-rose-105' :
                            'bg-amber-50 text-amber-755 border border-amber-105'
                          }`}>
                            {item.managerApproval === 'Disetujui' ? '✓ Disetujui' : item.managerApproval === 'Ditolak' ? '✗ Ditolak' : '⌛ Pending'}
                          </span>
                        )}
                      </td>

                      {/* payout status update select */}
                      <td className="p-3 text-center">
                        {item.managerApproval === 'Pending' ? (
                          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg text-slate-400 text-[9.5px] font-bold">
                            <Clock className="w-3 h-3 animate-spin" /> Menunggu MGR
                          </div>
                        ) : item.managerApproval === 'Ditolak' ? (
                          <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-150 px-2 py-1.5 rounded-lg text-rose-750 text-[9.5px] font-bold">
                            💥 Ditahan MGR
                          </div>
                        ) : (
                          <select
                            value={item.payoutStatus}
                            onChange={(e) => executeStatusUpdateInState(item.recordId, e.target.value as any)}
                            disabled={activeRole === 'manager'}
                            className={`text-[10.5px] font-bold rounded-lg px-2 py-1.5 select-none cursor-pointer outline-none ${
                              activeRole === 'manager' ? 'opacity-70 cursor-not-allowed bg-slate-100 text-slate-500' :
                              item.payoutStatus === 'Sudah Ditransfer' ? 'bg-emerald-600 text-white shadow-xs' :
                              item.payoutStatus === 'Diproses' ? 'bg-amber-500 text-white shadow-xs' :
                              'bg-slate-100 text-slate-800'
                            }`}
                          >
                            <option value="Belum Dibayar" className={activeRole !== 'manager' ? "text-slate-850 bg-white" : ""}>Belum Dibayar</option>
                            <option value="Diproses" className={activeRole !== 'manager' ? "text-slate-850 bg-white" : ""}>Diproses (HR)</option>
                            <option value="Sudah Ditransfer" className={activeRole !== 'manager' ? "text-slate-850 bg-white" : ""}>Sudah Ditransfer (HR)</option>
                          </select>
                        )}
                      </td>

                      {/* Action trigger buttons */}
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => handleOpenSlip(item.employeeId)}
                            className="inline-flex items-center gap-1.5 px-2 py-1.5 border hover:bg-slate-50 text-[10px] font-bold rounded-lg transition-all"
                            id={`btn-view-slip-${item.employeeId}`}
                            title="Unduh Slip PDF, Print / Pratinjau Formal"
                          >
                            <Eye className="w-3 h-3 text-slate-600" /> Slip
                          </button>
                          
                          <button
                            onClick={() => handleOpenAdjustmentModal(item.employeeId)}
                            className="inline-flex items-center gap-1 py-1.5 px-2 border border-blue-100 text-blue-600 hover:bg-blue-50/50 text-[10px] font-bold rounded-lg transition-all"
                            title="Fine-tune Gaji Khusus (Tunjangan / Potongan / Absen Override)"
                          >
                            <PenSquare className="w-3.5 h-3.5" /> Sesuaikan
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Employee Fine-Tuning adjustment popup modal */}
      <AnimatePresence>
        {isAdjustModalOpen && adjustingEmpId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Penyesuaian Finansial Kustom</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">NIP: {adjustingEmpId} · {employees.find(e => e.id === adjustingEmpId)?.name}</p>
                </div>
                <button
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4 text-xs font-semibold">
                
                {/* Manual override attendance check box */}
                <div className="p-3 bg-blue-50/60 rounded-xl space-y-2.5 border border-blue-100/55">
                  <label className="flex items-center gap-2 cursor-pointer text-blue-900">
                    <input
                      type="checkbox"
                      checked={adjForm.overrideHadirEnabled}
                      onChange={(e) => setAdjForm({ ...adjForm, overrideHadirEnabled: e.target.checked })}
                      className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer animate-pulse"
                    />
                    <span>Override Jumlah Kehadiran (Hadir)</span>
                  </label>
                  
                  {adjForm.overrideHadirEnabled && (
                    <div className="flex items-center gap-2 text-[11px] animate-fadeIn">
                      <span className="text-slate-600 font-medium whitespace-nowrap">Atur Total Hari Hadir:</span>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={adjForm.overrideHadirCount}
                        onChange={(e) => setAdjForm({ ...adjForm, overrideHadirCount: Number(e.target.value || 0) })}
                        className="bg-white border rounded p-1 w-16 font-mono text-center text-[11px]"
                      />
                      <span className="text-gray-400">Hari (perjalanan dinas / dsb.)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Custom Allowance */}
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Tunjangan Tambahan (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-slate-400 font-medium font-mono">Rp</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={adjForm.customAllowance || ''}
                        onChange={(e) => setAdjForm({ ...adjForm, customAllowance: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 p-2 pl-7 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Custom Deduction */}
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Potongan Khusus (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-slate-400 font-medium font-mono">Rp</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={adjForm.customDeduction || ''}
                        onChange={(e) => setAdjForm({ ...adjForm, customDeduction: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 p-2 pl-7 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Bonus */}
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Bonus Kinerja Periode ini (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-slate-400 font-medium font-mono">Rp</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={adjForm.bonusOverride || ''}
                      onChange={(e) => setAdjForm({ ...adjForm, bonusOverride: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 pl-7 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Custom BPJS and PPh Overrides */}
                <div className="p-3 bg-rose-50/40 rounded-xl space-y-3.5 border border-rose-100/50">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-850 block">
                    Penyesuaian BPJS &amp; PPh21 Kustom
                  </span>
                  
                  {/* BPJS Kesehatan Override */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#334155] font-semibold text-xs select-none">
                      <input
                        type="checkbox"
                        checked={adjForm.overrideBpjsKesehatanEnabled}
                        onChange={(e) => setAdjForm({ ...adjForm, overrideBpjsKesehatanEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                      />
                      <span>Potongan BPJS Kesehatan Kustom</span>
                    </label>
                    {adjForm.overrideBpjsKesehatanEnabled && (
                      <div className="relative pl-5 animate-fadeIn">
                        <span className="absolute left-7 top-2 text-slate-400 font-medium font-mono text-[10px]">Rp</span>
                        <input
                          type="number"
                          placeholder="Nilai BPJS Kes"
                          value={adjForm.customBpjsKesehatan || ''}
                          onChange={(e) => setAdjForm({ ...adjForm, customBpjsKesehatan: Number(e.target.value) })}
                          className="w-full bg-white border border-rose-250 py-1 pl-8 pr-2 rounded text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* BPJS Ketenagakerjaan Override */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#334155] font-semibold text-xs select-none">
                      <input
                        type="checkbox"
                        checked={adjForm.overrideBpjsKetenagakerjaanEnabled}
                        onChange={(e) => setAdjForm({ ...adjForm, overrideBpjsKetenagakerjaanEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                      />
                      <span>Potongan BPJS Ketenagakerjaan Kustom</span>
                    </label>
                    {adjForm.overrideBpjsKetenagakerjaanEnabled && (
                      <div className="relative pl-5 animate-fadeIn">
                        <span className="absolute left-7 top-2 text-slate-400 font-medium font-mono text-[10px]">Rp</span>
                        <input
                          type="number"
                          placeholder="Nilai BPJS Ket"
                          value={adjForm.customBpjsKetenagakerjaan || ''}
                          onChange={(e) => setAdjForm({ ...adjForm, customBpjsKetenagakerjaan: Number(e.target.value) })}
                          className="w-full bg-white border border-rose-250 py-1 pl-8 pr-2 rounded text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* PPh21 Tax Override */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#334155] font-semibold text-xs select-none">
                      <input
                        type="checkbox"
                        checked={adjForm.overridePph21Enabled}
                        onChange={(e) => setAdjForm({ ...adjForm, overridePph21Enabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                      />
                      <span>Potongan Pajak PPh21 Kustom</span>
                    </label>
                    {adjForm.overridePph21Enabled && (
                      <div className="relative pl-5 animate-fadeIn">
                        <span className="absolute left-7 top-2 text-slate-400 font-medium font-mono text-[10px]">Rp</span>
                        <input
                          type="number"
                          placeholder="Nilai PPh21"
                          value={adjForm.customPph21 || ''}
                          onChange={(e) => setAdjForm({ ...adjForm, customPph21: Number(e.target.value) })}
                          className="w-full bg-white border border-rose-250 py-1 pl-8 pr-2 rounded text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* remarks notes */}
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Keterangan / Alasan Penyesuaian *</label>
                  <textarea
                    required
                    placeholder="Contoh: Tambahan Uang Saku Dinas Luar Kota / Penggantian kerusakan keyboard alat..."
                    value={adjForm.remarks}
                    onChange={(e) => setAdjForm({ ...adjForm, remarks: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-medium text-[11px] outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5">Wajib ditulis agar nampak di pembukuan slip cetakan.</span>
                </div>

                {/* Subtotal preview with adjustment */}
                {(() => {
                  const currEmp = employees.find(e => e.id === adjustingEmpId);
                  if (!currEmp) return null;
                  
                  // Live math preview
                  const baseSal = currEmp.basicSalary;
                  const originalHadir = attendance.filter(log => {
                    if (log.employeeId !== adjustingEmpId) return false;
                    if (!currentPeriod) return true;
                    return log.date >= currentPeriod.startDate && log.date <= currentPeriod.endDate;
                  }).filter(l => l.status === 'Hadir' || l.status === 'Terlambat' || l.status === 'Pulang Cepat').length;

                  const finalHadir = adjForm.overrideHadirEnabled ? adjForm.overrideHadirCount : originalHadir;
                  const finalAllowance = currEmp.allowance + (finalHadir * mealTransportAllowance) + Number(adjForm.customAllowance || 0);
                  const parsedBonus = Number(adjForm.bonusOverride || 0);

                  // Estimations (incorporating overrides)
                  const bpjsH = adjForm.overrideBpjsKesehatanEnabled 
                    ? Number(adjForm.customBpjsKesehatan || 0)
                    : Math.round(baseSal * (bpjsKesehatanRate / 100));

                  const bpjsW = adjForm.overrideBpjsKetenagakerjaanEnabled 
                    ? Number(adjForm.customBpjsKetenagakerjaan || 0)
                    : Math.round(baseSal * (bpjsKetenagakerjaanRate / 100));

                  const estimGross = baseSal + finalAllowance + parsedBonus;
                  const pphValue = adjForm.overridePph21Enabled 
                    ? Number(adjForm.customPph21 || 0)
                    : Math.round(estimGross * (pph21Rate / 100));

                  const estimateNet = estimGross - bpjsH - bpjsW - pphValue - Number(adjForm.customDeduction || 0);

                  return (
                    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 mt-2 font-mono">
                      <div className="text-[9px] text-[#93C5FD] uppercase font-bold leading-none tracking-widest mb-1.5">Estimasi Take Home Pay Terkini</div>
                      <div className="flex justify-between text-[10px] text-slate-300">
                        <span>Gaji Pokok + Akhir Tunjangan</span>
                        <span>Rp {(baseSal + finalAllowance).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-300">
                        <span>Bonus &amp; Apresiasi</span>
                        <span>Rp {parsedBonus.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Potongan BPJS &amp; PPh21</span>
                        <span>-Rp {(bpjsH + bpjsW + pphValue).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-rose-300 text-slate-400 border-b pb-1.5 border-slate-700">
                        <span>Potongan Tambahan Kustom</span>
                        <span>-Rp {Number(adjForm.customDeduction || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 text-xs text-emerald-400 font-extrabold text-[12px]">
                        <span>ESTIMASI GAJI BERSIH</span>
                        <span>Rp {estimateNet.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Terapkan Penyesuaian
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Indonesian Slip Gaji (Payslip) Modal */}
      <AnimatePresence>
        {isSlipOpen && activePayrollRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto">
            
            {/* SCREEN VIEW OF MODAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-6 print:hidden my-8"
              id="slip-gaji-modal-view"
            >
              {/* Header Modal - Hide during print */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
                <h3 className="font-bold text-slate-900 text-sm">Dokumen Slip Gaji Digital</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-505 active:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    id="btn-export-slip-pdf"
                    title="Ekspor slip gaji sebagai berkas dokumen PDF"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" /> Ekspor PDF
                  </button>
                  <button
                    onClick={handlePrintSlip}
                    className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    id="btn-print-slip"
                    title="Cetak langsung menggunakan printer fisik"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak
                  </button>
                  <button
                    onClick={() => setIsSlipOpen(false)}
                    className="p-1 px-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Screen Modal Body */}
              <div className="space-y-6 text-xs p-2" id="printable-slip-body">
                {/* Company Header */}
                <div className="text-center space-y-1 pb-4 border-b">
                  <h2 className="text-base font-extrabold text-gray-900 tracking-tight uppercase">PT BIOMETRIC PORTAL UTAMA INDONESIA</h2>
                  <p className="text-[10px] text-gray-500">Gedung Biometrik Suite Lt. 5, Jl. Jend. Sudirman No. 12, Jakarta Selatan</p>
                  <p className="text-[10px] text-gray-400">Website: enterprise.co.id | Telp: (021) 555-1234</p>
                </div>

                {/* Payroll Identifier info */}
                <div className="flex justify-between items-start gap-4 text-[11px] bg-slate-50/50 p-4 rounded-xl border">
                  {(() => {
                    const emp = employees.find(e => e.id === activePayrollRecord.employeeId);
                    return (
                      <>
                        <div className="space-y-1">
                          <div><span className="text-gray-400 font-semibold">NAMA:</span> <strong className="text-gray-800 font-black ml-1 uppercase">{emp?.name}</strong></div>
                          <div><span className="text-gray-400 font-semibold">ID / NIP:</span> <span className="font-mono text-gray-700 ml-1">{activePayrollRecord.employeeId}</span></div>
                          <div><span className="text-gray-400 font-semibold">JABATAN:</span> <span className="text-gray-700 ml-1 font-medium">{emp?.position}</span></div>
                          <div><span className="text-gray-400 font-semibold">PIN FP:</span> <span className="font-mono text-blue-700 font-semibold ml-1 bg-blue-50 px-1 rounded">{emp?.pin}</span></div>
                        </div>
                        <div className="space-y-1 text-right sm:text-left">
                          <div><span className="text-gray-400 font-semibold">BULAN / PERIODE:</span> <strong className="text-gray-800 ml-1 uppercase">{currentPeriod?.month}</strong></div>
                          <div><span className="text-gray-400 font-semibold">DIVISI:</span> <span className="text-gray-700 ml-1 font-semibold">{emp?.department}</span></div>
                          <div><span className="text-gray-400 font-semibold">TANGGAL TRANSFER:</span> <span className="text-gray-700 ml-1">{activePayrollRecord.payoutStatus === 'Sudah Ditransfer' ? '12 Juni 2026' : 'Belum Ditransfer'}</span></div>
                          <div><span className="text-gray-400 font-semibold">STATUS:</span> <span className="font-bold text-blue-700 ml-1">{activePayrollRecord.payoutStatus}</span></div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Attendance Summary Row */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-slate-50/40 p-2.5 rounded-xl border border-slate-100">
                  <div className="border-r border-slate-100">
                    <span className="block text-slate-400 font-bold mb-0.5 uppercase tracking-wide">Hadir</span>
                    <strong className="text-slate-800 text-[11px] font-bold">{activePayrollRecord.attendanceSummary.hadir} Hari</strong>
                  </div>
                  <div className="border-r border-slate-100">
                    <span className="block text-slate-400 font-bold mb-0.5 uppercase tracking-wide">Terlambat</span>
                    <strong className="text-slate-800 text-[11px] font-bold">{activePayrollRecord.attendanceSummary.terlambat} Kali</strong>
                  </div>
                  <div className="border-r border-slate-100">
                    <span className="block text-slate-400 font-bold mb-0.5 uppercase tracking-wide">Cuti/Izin/Sakit</span>
                    <strong className="text-slate-800 text-[11px] font-bold">{activePayrollRecord.attendanceSummary.cutiIzin} Hari</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold mb-0.5 uppercase tracking-wide">Alpa</span>
                    <strong className="text-slate-800 text-[11px] font-bold">{activePayrollRecord.attendanceSummary.alpa} Hari</strong>
                  </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Earnings (Penerimaan) */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs text-gray-800 border-b border-slate-100 pb-1 uppercase tracking-wider text-blue-700">I. Penerimaan Utuh (Earnings)</h4>
                    <div className="space-y-1.5 font-medium text-gray-700">
                      <div className="flex justify-between">
                        <span>Gaji Pokok Utama</span>
                        <span>Rp {activePayrollRecord.basicSalary.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-normal">
                        <span className="pl-2">Tunjangan Operasional Kantor</span>
                        <span>Rp {(employees.find(e => e.id === activePayrollRecord.employeeId)?.allowance || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-normal">
                        <span className="pl-2">Tunjangan Meal/Transport FP ({activePayrollRecord.attendanceSummary.hadir}x Tap)</span>
                        <span>Rp {(activePayrollRecord.allowanceSum - (employees.find(e => e.id === activePayrollRecord.employeeId)?.allowance || 0) - (activePayrollRecord.customAllowance || 0)).toLocaleString('id-ID')}</span>
                      </div>
                      {activePayrollRecord.customAllowance && activePayrollRecord.customAllowance > 0 ? (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span className="pl-2">Tunjangan Tambahan Kustom</span>
                          <span>Rp {activePayrollRecord.customAllowance.toLocaleString('id-ID')}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-gray-600 font-normal">
                        <span className="pl-2">Uang Lembur ({formatOvertimeDuration(activePayrollRecord.overtimeMinutes || 0)})</span>
                        <span>Rp {(activePayrollRecord.overtimePay || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus Tambahan Kinerja</span>
                        <span>Rp {activePayrollRecord.bonus.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-gray-950">
                        <span>Subtotal Penerimaan</span>
                        <span>Rp {(activePayrollRecord.basicSalary + activePayrollRecord.allowanceSum + activePayrollRecord.bonus + (activePayrollRecord.overtimePay || 0)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions (Potongan) */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs text-gray-800 border-b pb-1 uppercase tracking-wider text-rose-800">II. Potongan Gaji (Deductions)</h4>
                    <div className="space-y-1.5 font-medium text-gray-700">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-1 rounded">Denda Lambat Tap Biometric ({activePayrollRecord.attendanceSummary.terlambat}x)</span>
                        <span className="text-rose-700 font-bold">Rp {activePayrollRecord.lateDeduction.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-normal">
                        <span className="pl-2">Iuran BPJS Kesehatan ({bpjsKesehatanRate}%)</span>
                        <span>Rp {activePayrollRecord.bpjsKesehatan.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-normal">
                        <span className="pl-2">Iuran BPJS Ketenagakerjaan ({bpjsKetenagakerjaanRate}%)</span>
                        <span>Rp {activePayrollRecord.bpjsKetenagakerjaan.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-normal">
                        <span className="pl-2">Estimasi Potongan PPh21 ({pph21Rate}%)</span>
                        <span>Rp {activePayrollRecord.pph21.toLocaleString('id-ID')}</span>
                      </div>
                      {activePayrollRecord.customDeduction && activePayrollRecord.customDeduction > 0 ? (
                        <div className="flex justify-between text-rose-750 font-bold">
                          <span className="pl-2">Potongan Penyesuaian Kustom</span>
                          <span>Rp {activePayrollRecord.customDeduction.toLocaleString('id-ID')}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between border-t pt-1 font-bold text-gray-950">
                        <span>Subtotal Potongan</span>
                        <span>Rp {(activePayrollRecord.lateDeduction + activePayrollRecord.bpjsKesehatan + activePayrollRecord.bpjsKetenagakerjaan + activePayrollRecord.pph21 + (activePayrollRecord.customDeduction || 0)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {activePayrollRecord.remarks && (
                  <div className="p-3 bg-slate-50 border rounded-lg text-[10px] text-slate-600 font-medium leading-relaxed italic">
                    <strong>Catatan Penyesuaian HRD:</strong> &apos;{activePayrollRecord.remarks}&apos;
                  </div>
                )}

                {/* Net Take Home Pay banner */}
                <div className="bg-blue-700 text-white rounded-xl p-4 flex justify-between items-center mt-6 shadow border border-blue-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 font-sans">Gaji Bersih Diterima Pegawai (Net Take Home Pay)</span>
                    <p className="text-[10px] text-blue-200">Dana ditransfer ke Bank Mandiri / BCA Rekening Pegawai</p>
                  </div>
                  <span className="text-base font-extrabold text-white font-mono text-[16px]">
                    Rp {activePayrollRecord.netSalary.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Authentication Seals / Tanda Tangan */}
                <div className="flex justify-between pt-8 text-[11px] font-medium text-gray-700">
                  <div className="space-y-12">
                    <p>Diterima Oleh Karyawan,</p>
                    <div className="space-y-0.5">
                      <p className="font-bold border-b border-gray-400 pb-0.5 w-max">
                        {employees.find(e => e.id === activePayrollRecord.employeeId)?.name}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono">ID: {activePayrollRecord.employeeId}</p>
                    </div>
                  </div>

                  <div className="space-y-12 text-right">
                    <p>Otoritas Pengesahan HRD,</p>
                    <div className="space-y-0.5 ml-auto text-right flex flex-col items-end">
                      <p className="font-bold border-b border-gray-400 pb-0.5 w-max">
                        Siti Aminah, S.Psi
                      </p>
                      <p className="text-[9px] text-gray-400 text-right">Senior HR Executive</p>
                    </div>
                  </div>
                </div>

                {/* Printable digital watermarks / disclaimer footer */}
                <div className="pt-8 border-t border-dashed text-center text-[10px] text-gray-400 font-mono">
                  &lt;&lt; Dokumen diproses secara elektronik sesuai enkripsi biner sidik jari Solution X-100C &gt;&gt;
                </div>
              </div>
            </motion.div>

            {/* HIGH FIDELITY PRINT PORTAL - DISPLAYED EXCLUSIVELY UNDER `@media print` */}
            <div id="slip-print-portal" className="hidden print:block bg-white text-gray-800 p-2 space-y-6">
              
              {/* Kop Surat Resmi */}
              <div className="text-center space-y-1.5 pb-4 border-b border-gray-300">
                <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">PT BIOMETRIC PORTAL UTAMA INDONESIA</h2>
                <p className="text-xs text-gray-500 font-medium font-sans">Gedung Biometrik Suite Lt. 5, Jl. Jend. Sudirman No. 12, Jakarta Selatan</p>
                <p className="text-[10px] text-gray-400 font-mono">Website: enterprise.co.id • Email: hr@biometricportal.co.id • Telp: (021) 555-1234</p>
              </div>

              {/* Title Dokumen */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest border-b border-gray-100 w-max mx-auto pb-0.5">SLIP GAJI RESMI KARYAWAN</h3>
                <p className="text-[10px] font-mono text-gray-500 tracking-wider">No Validasi: SLIP-{activePayrollRecord.id}</p>
              </div>

              {/* Rincian Identitas Karyawan & Periode */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-gray-250">
                {(() => {
                  const emp = employees.find(e => e.id === activePayrollRecord.employeeId);
                  return (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-24">Nama:</span> <strong className="text-gray-900 font-black uppercase">{emp?.name}</strong></div>
                        <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-24">NIP / ID:</span> <span className="font-mono text-gray-700 font-bold">{activePayrollRecord.employeeId}</span></div>
                        <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-24">Jabatan:</span> <span className="text-gray-700 font-semibold">{emp?.position}</span></div>
                        <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-24">PIN FP:</span> <span className="font-mono text-blue-750 font-black">{emp?.pin}</span></div>
                      </div>
                      <div className="space-y-1.5 text-right flex flex-col items-end">
                        <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-32 mr-2">Bulan Gaji:</span> <strong className="text-gray-900 uppercase font-black">{currentPeriod?.month}</strong></div>
                        <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-32 mr-2">Divisi:</span> <span className="text-gray-700 font-bold">{emp?.department}</span></div>
                        <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-32 mr-2">Tanggal Bayar:</span> <span className="text-gray-700 font-semibold">{activePayrollRecord.payoutStatus === 'Sudah Ditransfer' ? '12 Juni 2026' : 'Belum Ditransfer'}</span></div>
                        <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-32 mr-2">Status Transfer:</span> <span className="font-black text-emerald-700 uppercase bg-emerald-50 px-1 border border-emerald-100 rounded text-[10px]">{activePayrollRecord.payoutStatus}</span></div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Biometric Attendance Logs Summary */}
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-slate-50/50 p-3 rounded-xl border border-gray-200">
                <div className="border-r border-gray-250">
                  <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Hadir Kerja</span>
                  <strong className="text-gray-900 text-xs font-black">{activePayrollRecord.attendanceSummary.hadir} HARI</strong>
                </div>
                <div className="border-r border-gray-250">
                  <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Terlambat Tap</span>
                  <strong className="text-gray-900 text-xs font-black">{activePayrollRecord.attendanceSummary.terlambat} KALI</strong>
                </div>
                <div className="border-r border-gray-250">
                  <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Cuti / Sakit / Izin</span>
                  <strong className="text-gray-900 text-xs font-black">{activePayrollRecord.attendanceSummary.cutiIzin} HARI</strong>
                </div>
                <div>
                  <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Alpa (Sanksi)</span>
                  <strong className="text-gray-900 text-xs font-black">{activePayrollRecord.attendanceSummary.alpa} HARI</strong>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-8 pt-2">
                {/* Earnings (Penerimaan) */}
                <div className="space-y-2.5">
                  <h4 className="font-extrabold text-xs text-blue-900 border-b border-gray-300 pb-1 uppercase tracking-wider">I. PENERIMAAN RESMI (EARNINGS)</h4>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between font-semibold">
                      <span>Gaji Pokok Utama</span>
                      <span>Rp {activePayrollRecord.basicSalary.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="pl-2">Tunjangan Operasional Kantor</span>
                      <span>Rp {(employees.find(e => e.id === activePayrollRecord.employeeId)?.allowance || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="pl-2">Tunjangan Makan &amp; Transport ({activePayrollRecord.attendanceSummary.hadir} Hari)</span>
                      <span>Rp {(activePayrollRecord.allowanceSum - (employees.find(e => e.id === activePayrollRecord.employeeId)?.allowance || 0) - (activePayrollRecord.customAllowance || 0)).toLocaleString('id-ID')}</span>
                    </div>
                    {activePayrollRecord.customAllowance && activePayrollRecord.customAllowance > 0 ? (
                      <div className="flex justify-between text-emerald-850 font-bold">
                        <span className="pl-2">Tunjangan Khusus Kustom</span>
                        <span>Rp {activePayrollRecord.customAllowance.toLocaleString('id-ID')}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-gray-650">
                      <span className="pl-2">Uang Lembur Lembur ({formatOvertimeDuration(activePayrollRecord.overtimeMinutes || 0)})</span>
                      <span>Rp {(activePayrollRecord.overtimePay || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Insentif Kinerja</span>
                      <span>Rp {activePayrollRecord.bonus.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-400 pt-1.5 font-black text-gray-950 text-xs">
                      <span>A. TOTAL PENERIMAAN BRUTO</span>
                      <span>Rp {(activePayrollRecord.basicSalary + activePayrollRecord.allowanceSum + activePayrollRecord.bonus + (activePayrollRecord.overtimePay || 0)).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions (Potongan) */}
                <div className="space-y-2.5">
                  <h4 className="font-extrabold text-xs text-rose-905 border-b border-gray-300 pb-1 uppercase tracking-wider">II. POTONGAN RESMI (DEDUCTIONS)</h4>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Denda Telat Tap Biometrik ({activePayrollRecord.attendanceSummary.terlambat}x)</span>
                      <span>Rp {activePayrollRecord.lateDeduction.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="pl-2">Potongan Iuran BPJS Kesehatan ({bpjsKesehatanRate}%)</span>
                      <span>Rp {activePayrollRecord.bpjsKesehatan.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="pl-2">Potongan Iuran BPJS Ketenagakerjaan ({bpjsKetenagakerjaanRate}%)</span>
                      <span>Rp {activePayrollRecord.bpjsKetenagakerjaan.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="pl-2">Pemotongan Pajak PPh21 ({pph21Rate}%)</span>
                      <span>Rp {activePayrollRecord.pph21.toLocaleString('id-ID')}</span>
                    </div>
                    {activePayrollRecord.customDeduction && activePayrollRecord.customDeduction > 0 ? (
                      <div className="flex justify-between text-rose-900 font-bold">
                        <span className="pl-2">Potongan Penyesuaian Kustom</span>
                        <span>Rp {activePayrollRecord.customDeduction.toLocaleString('id-ID')}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-gray-400 pt-1.5 font-black text-gray-950 text-xs">
                      <span>B. TOTAL POTONGAN BULANAN</span>
                      <span>Rp {(activePayrollRecord.lateDeduction + activePayrollRecord.bpjsKesehatan + activePayrollRecord.bpjsKetenagakerjaan + activePayrollRecord.pph21 + (activePayrollRecord.customDeduction || 0)).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {activePayrollRecord.remarks && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium italic leading-relaxed">
                  <strong>Catatan Tambahan HRD:</strong> &apos;{activePayrollRecord.remarks}&apos;
                </div>
              )}

              {/* Net Take Home Pay banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center mt-6 border border-slate-950" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-250">Gaji Bersih Diterima Pegawai (Net Take Home Pay)</span>
                  <p className="text-[10px] text-slate-400">Telah ditransfer ke Rekening Mandiri / BCA Pegawai Terkait</p>
                </div>
                <span className="text-base font-black text-white font-mono text-[16px]">
                  Rp {activePayrollRecord.netSalary.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Hand-over validation signatures */}
              <div className="flex justify-between pt-12 text-xs font-semibold text-gray-700">
                <div className="space-y-16">
                  <p>Diterima Oleh Karyawan,</p>
                  <div className="space-y-0.5">
                    <p className="font-bold border-b border-gray-400 pb-0.5 w-max">
                      {employees.find(e => e.id === activePayrollRecord.employeeId)?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">ID: {activePayrollRecord.employeeId}</p>
                  </div>
                </div>

                <div className="space-y-16 text-right">
                  <p>Otoritas Pengesahan HRD,</p>
                  <div className="space-y-0.5 ml-auto text-right flex flex-col items-end">
                    <p className="font-bold border-b border-gray-400 pb-0.5 w-max">
                      Siti Aminah, S.Psi
                    </p>
                    <p className="text-[10px] text-gray-400 text-right">Senior HR Executive</p>
                  </div>
                </div>
              </div>

              {/* Footer cap & barcode indicators */}
              <div className="pt-12 border-t border-dashed text-center text-[10px] text-gray-400 font-mono">
                &lt;&lt; LAPORAN TRANSAKSI SLIP GAJI DIHASILKAN SECARA ELEKTRONIK • PT BIOMETRIC PORTAL UTAMA &gt;&gt;
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>

      {/* MODAL GENERATE & JADWALKAN PAYROLL OTOMATIS */}
      <AnimatePresence>
        {isAutoPayrollModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
              id="auto-payroll-modal"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-55/40 backdrop-blur-xs shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Generate & Jadwalkan Payroll Otomatis</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Kalkulasi batch bulanan terekonsiliasi data biometrik Solution X-100C</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAutoPayrollModalOpen(false);
                    setAutoPayrollStep('setup');
                  }}
                  className="p-1.5 px-2 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Tab Selector */}
              {autoPayrollStep === 'setup' && (
                <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
                  <button
                    onClick={() => setAutoPayrollActiveTab('instant')}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                      autoPayrollActiveTab === 'instant'
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <Coins className="w-4 h-4 shrink-0" /> Batch Perhitungan Instan
                  </button>
                  <button
                    onClick={() => setAutoPayrollActiveTab('scheduler')}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                      autoPayrollActiveTab === 'scheduler'
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" /> Atur Jadwal Gaji Otomatis
                  </button>
                </div>
              )}

              {/* Modal Body / Content scrollable */}
              <div className="flex-1 overflow-y-auto p-6 text-xs font-semibold">
                
                {autoPayrollStep === 'setup' ? (
                  autoPayrollActiveTab === 'instant' ? (
                    /* SETUP BATCH INSTAN */
                    <div className="space-y-5 animate-fade-in">
                      <div className="p-4 bg-indigo-50/65 rounded-2xl border border-indigo-100/50 flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed text-slate-700">
                          <p className="font-bold text-indigo-900 text-[12.5px]">Bagaimana Perhitungan Batch Bekerja?</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">Sistem akan menyaring seluruh karyawan aktif, mengalkulasi jumlah kehadiran (FP tap), terlambat instan, hitungan lembur fingerprint, potongan pajak PPh21, estimasi iuran BPJS, dan menyiapkannya untuk diterbitkan secara serempak.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Selector parameters */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">1. Pilih Departemen Target</label>
                            <select
                              value={autoDeptFilter}
                              onChange={(e) => setAutoDeptFilter(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            >
                              <option value="All">Semua Departemen (Universal)</option>
                              <option value="IT & Engineering">IT & Engineering Only</option>
                              <option value="Human Resources">Human Resources Only</option>
                              <option value="Finance & Accounting">Finance & Accounting Only</option>
                              <option value="Operations">Operations Only</option>
                              <option value="Marketing & Sales">Marketing & Sales Only</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">2. Target Periode Aktif</label>
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="font-extrabold text-slate-800">{currentPeriod?.month || 'Pilihan Gaji'}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Rentang: {currentPeriod?.startDate} s/d {currentPeriod?.endDate}</p>
                              </div>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase">Aktif</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wide text-[10px]">3. Status Sinkronisasi Log Absensi</label>
                            <div className="p-3 bg-amber-50/55 border border-amber-100 rounded-xl text-slate-700 leading-snug">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="font-extrabold text-amber-900">100% Terhubung</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">Ditemukan total {attendance.length} log absensi biometrik terekam dalam database lokal untuk periode aktif.</p>
                            </div>
                          </div>
                        </div>

                        {/* Checklist preferences toggles */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3.5">
                          <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px] border-b border-slate-200 pb-1.5">Komponen Perhitungan Otomatis</h4>
                          
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyMealTransport}
                              onChange={(e) => setApplyMealTransport(e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-slate-800 font-bold text-[11px]">Hitung Tunjangan Makan & Transportasi</p>
                              <p className="text-[10px] text-slate-400 font-medium normal-case">Nominal Rp {mealTransportAllowance.toLocaleString('id-ID')} x Jumlah Tap kehadiran real.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyLateDeductions}
                              onChange={(e) => setApplyLateDeductions(e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-slate-800 font-bold text-[11px]">Terapkan Denda Potongan Keterlambatan</p>
                              <p className="text-[10px] text-slate-400 font-medium normal-case">Total Menit terlambat x Rp {lateDeductionRate.toLocaleString('id-ID')}/menit secara proporsional.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyBpjsKesehatan}
                              onChange={(e) => setApplyBpjsKesehatan(e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-slate-800 font-bold text-[11px]">Potong BPJS Kesehatan</p>
                              <p className="text-[10px] text-slate-400 font-medium normal-case">Potongan iuran standar BPJS Kesehatan sebesar {bpjsKesehatanRate}% Gaji Pokok.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyBpjsKetenagakerjaan}
                              onChange={(e) => setApplyBpjsKetenagakerjaan(e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-slate-800 font-bold text-[11px]">Potong BPJS Ketenagakerjaan</p>
                              <p className="text-[10px] text-slate-400 font-medium normal-case">Potongan iuran wajib BPJS Ketenagakerjaan sebesar {bpjsKetenagakerjaanRate}% Gaji Pokok.</p>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyPph21}
                              onChange={(e) => setApplyPph21(e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            />
                            <div>
                              <p className="text-slate-800 font-bold text-[11px]">Estimasi PPh21 (Pajak PPh21)</p>
                              <p className="text-[10px] text-slate-400 font-medium normal-case">Potongan Pajak Penghasilan PPh21 tertanggung sebesar {pph21Rate}% dari Total Bruto.</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAutoPayrollModalOpen(false)}
                          className="px-4 py-2 border border-slate-250 text-slate-600 rounded-xl hover:bg-slate-50 font-bold cursor-pointer text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoPayrollStep('simulated')}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 text-xs"
                        >
                          <TrendingUp className="w-4 h-4 shrink-0" /> Jalankan Simulasi & Tinjau Hitungan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* AUTOMATED SCHEDULER */
                    <div className="space-y-6 animate-fade-in">
                      <div className="p-4 bg-emerald-50/75 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed text-slate-700">
                          <p className="font-bold text-emerald-900 text-[12.5px]">Manajemen Penjadwalan Payroll Otomatis</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">Konfigurasikan aturan otomatisasi agar sistem menghidupkan kalkulasi batch bulanan secara teratur pada tanggal tertentu. Manajer dapat memonitor hasil pemicuan dalam daftar histori di bawah ini.</p>
                        </div>
                      </div>

                      <form onSubmit={handleCreateSchedule} className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3.5">
                          <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[9.5px] border-b border-slate-200 pb-1">Tambah Aturan Jadwal</h4>
                          
                          <div>
                            <label className="block text-slate-500 mb-1 text-[10px]">Nama Aturan Penjadwalan *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Payroll Bulanan Semua Karyawan"
                              value={schedRuleName}
                              onChange={(e) => setSchedRuleName(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2 text-xs rounded-xl text-slate-800 font-bold outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-500 mb-1 text-[10px]">Tanggal Eksekusi (Bulanan) *</label>
                              <select
                                value={schedDayOfMonth}
                                onChange={(e) => setSchedDayOfMonth(e.target.value)}
                                className="w-full bg-white border border-slate-250 p-2 text-xs rounded-xl text-slate-800 font-bold outline-none focus:border-indigo-500"
                              >
                                {[...Array(28)].map((_, i) => (
                                  <option key={i + 1} value={(i + 1).toString()}>Tanggal {i + 1}</option>
                                ))}
                                <option value="29">Tanggal 29</option>
                                <option value="30">Tanggal 30</option>
                                <option value="31">Tanggal 31</option>
                                <option value="end">Hari Terakhir Bulan</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-500 mb-1 text-[10px]">Jam Eksekusi *</label>
                              <input
                                type="text"
                                required
                                value={schedTimeOfDay}
                                onChange={(e) => setSchedTimeOfDay(e.target.value)}
                                placeholder="17:00"
                                className="w-full bg-white border border-slate-250 p-2 text-xs rounded-xl text-slate-800 font-mono font-bold outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-500 mb-1 text-[10px]">Spesifik Departemen Target *</label>
                            <select
                              value={schedDept}
                              onChange={(e) => setSchedDept(e.target.value)}
                              className="w-full bg-white border border-slate-250 p-2 text-xs rounded-xl text-slate-800 font-bold outline-none focus:border-indigo-500"
                            >
                              <option value="All">Semua Karyawan (Universal)</option>
                              <option value="IT & Engineering">IT & Engineering</option>
                              <option value="Human Resources">Human Resources</option>
                              <option value="Finance & Accounting">Finance & Accounting</option>
                              <option value="Operations">Operations</option>
                              <option value="Marketing & Sales">Marketing & Sales</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-3 pt-4">
                            <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[9.5px] border-b border-slate-200 pb-1">Kontrol Mutu & Distribusi</h4>
                            
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={schedRequireVerify}
                                onChange={(e) => setSchedRequireVerify(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded cursor-pointer"
                              />
                              <span className="text-slate-700 text-[11px] font-bold">Harus diverifikasi Atasan sebelum Posting resmi</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={schedNotification}
                                onChange={(e) => setSchedNotification(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded cursor-pointer"
                              />
                              <span className="text-slate-700 text-[11px] font-bold">Kirim slip gaji otomatis via WA/Email setelah disetujui</span>
                            </label>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-slate-200">
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 active:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer whitespace-nowrap"
                            >
                              + Daftarkan & Aktifkan Aturan
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* Schedule Rules Table */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px] border-b border-slate-200 pb-1">Daftar Jadwal Perhitungan Sistem Terdaftar</h4>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-slate-55 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[9.5px]">
                                <th className="p-3 pl-4">Aturan Gaji</th>
                                <th className="p-3">Schedules</th>
                                <th className="p-3">Dept</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Eksekusi Terakhir</th>
                                <th className="p-3 pr-4 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeSchedules.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50">
                                  <td className="p-3 pl-4 font-extrabold text-slate-900">
                                    <p>{item.ruleName}</p>
                                    <p className="text-[9px] text-slate-400 font-normal">Auto-Notification: {item.notification ? 'Aktif' : 'Nonaktif'}</p>
                                  </td>
                                  <td className="p-3 font-mono text-indigo-650 font-bold">
                                    Setiap Tgl {item.dayOfMonth} @ {item.timeOfDay}
                                  </td>
                                  <td className="p-3 font-bold text-slate-650">
                                    {item.department === 'All' ? 'Semua Dept' : item.department}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleScheduleActive(item.id)}
                                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wide border cursor-pointer uppercase ${
                                        item.isActive
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-slate-100 text-slate-400 border-slate-200'
                                      }`}
                                    >
                                      {item.isActive ? 'Aktif' : 'Mati'}
                                    </button>
                                  </td>
                                  <td className="p-3 text-center font-mono text-slate-500 font-bold text-[10px]">
                                    {item.lastExecuted || 'Menunggu pemicuan...'}
                                  </td>
                                  <td className="p-3 pr-4 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleRunScheduleNow(item.id)}
                                      title="Simulasikan running instan jadwal ini"
                                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold rounded-lg hover:bg-indigo-100 cursor-pointer text-[9.5px]"
                                    >
                                      Run Simulation
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSchedule(item.id)}
                                      title="Hapus aturan pemicu"
                                      className="px-1.5 py-1 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer font-extrabold text-[12px]"
                                    >
                                      &times;
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  /* SIMULATED REVIEW & PRE-POSTING LIST */
                  <div className="space-y-4 animate-scale-up">
                    <div className="p-3.5 bg-indigo-55 border border-indigo-105 rounded-xl text-slate-700 leading-snug">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-650 shrink-0" />
                        <h4 className="font-extrabold text-indigo-950 text-sm">Hasil Simulasi Kalkulasi Gaji Batch</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Gaji bruto di bawah ini terhitung otomatis berdasarkan silsilah log kehadiran Solution X-100C untuk seluruh karyawan yang cocok. Harap tinjau dengan seksama sebelum melakukan posting massal ke sistem pembukuan.</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 text-center text-xs pb-1 shrink-0">
                      <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Karyawan</span>
                        <strong className="text-slate-800 text-[13px] font-black">{simulatedBatchList.length} Pegawai</strong>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bruto Gaji</span>
                        <strong className="text-slate-800 text-[13px] font-black">
                          Rp {simulatedBatchList.reduce((acc, i) => acc + (i.basicSalary + i.allowanceSum + i.bonus + (i.overtimePay || 0)), 0).toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Potongan</span>
                        <strong className="text-rose-600 text-[13px] font-black">
                          Rp {simulatedBatchList.reduce((acc, i) => acc + (i.lateDeduction + i.bpjsKesehatan + i.bpjsKetenagakerjaan + i.pph21), 0).toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Take Home Pay</span>
                        <strong className="text-emerald-700 text-[13px] font-black">
                          Rp {simulatedBatchList.reduce((acc, i) => acc + i.netSalary, 0).toLocaleString('id-ID')}
                        </strong>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner max-h-[240px] overflow-y-auto">
                      <table className="w-full text-left text-[11px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-205 text-slate-500 uppercase tracking-wider text-[9.5px] font-black">
                            <th className="p-2.5 pl-4">NIP / Karyawan</th>
                            <th className="p-2.5">Hadir</th>
                            <th className="p-2.5">Gaji Pokok</th>
                            <th className="p-2.5">Allowance</th>
                            <th className="p-2.5">Potongan</th>
                            <th className="p-2.5 text-right pr-4">Gaji NET (Take Home)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simulatedBatchList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-450 font-bold">
                                Tidak ada karyawan aktif dalam kriteria penyaringan yang terpilih.
                              </td>
                            </tr>
                          ) : (
                            simulatedBatchList.map(item => (
                              <tr key={item.employeeId} className="border-b last:border-0 hover:bg-indigo-50/20 border-slate-100">
                                <td className="p-2 pl-4">
                                  <div className="font-extrabold text-[#111]">{item.name}</div>
                                  <div className="text-[9.5px] text-slate-400 font-normal">{item.employeeId} — {item.position}</div>
                                </td>
                                <td className="p-2 font-mono font-bold text-indigo-750">
                                  {item.attendanceSummary.hadir} Hari
                                </td>
                                <td className="p-2 font-mono text-slate-700">
                                  Rp {item.basicSalary.toLocaleString('id-ID')}
                                </td>
                                <td className="p-2 font-mono text-slate-650" title={`Operasional + Meal/Transport + Bonus: Rp ${item.allowanceSum.toLocaleString('id-ID')} + Rp ${item.bonus.toLocaleString('id-ID')}`}>
                                  Rp {(item.allowanceSum + item.bonus).toLocaleString('id-ID')}
                                </td>
                                <td className="p-2 font-mono text-rose-600" title={`Telat: Rp ${item.lateDeduction.toLocaleString('id-ID')}, BPJS K: Rp ${item.bpjsKesehatan.toLocaleString('id-ID')}, BPJS TK: Rp ${item.bpjsKetenagakerjaan.toLocaleString('id-ID')}, PPh21: Rp ${item.pph21.toLocaleString('id-ID')}`}>
                                  Rp {(item.lateDeduction + item.bpjsKesehatan + item.bpjsKetenagakerjaan + item.pph21).toLocaleString('id-ID')}
                                </td>
                                <td className="p-2 text-right font-mono font-black pr-4 text-emerald-800 text-[11.5px]">
                                  Rp {item.netSalary.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-850 flex items-start gap-2 text-[10.5px]">
                      <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-620" />
                      <div>
                        <p className="font-extrabold">Informasi Legalitas & Persetujuan:</p>
                        <p className="font-medium mt-0.5">Dengan menekan tombol posting di bawah, Anda secara sadar mengesahkan slip penggajian massal di atas ke dalam server perusahaan, hal mana akan tercatat di log audit keamanan portal PT Enterprise Solutions.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setAutoPayrollStep('setup')}
                        className="px-3.5 py-2 border border-slate-205 text-slate-650 rounded-xl hover:bg-slate-50 font-bold cursor-pointer text-xs"
                      >
                        &larr; Kembali ke Aturan
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoPayrollModalOpen(false);
                            setAutoPayrollStep('setup');
                          }}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold cursor-pointer text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmBatchPost}
                          className="px-5 py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer text-xs"
                        >
                          Konfirmasi &amp; Posting Slip Gaji
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Period From-To Creator Modal */}
      <AnimatePresence>
        {isAddPeriodOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
              id="add-period-modal"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Buat Periode Gaji Kustom (From-To)</h3>
                <button
                  onClick={() => setIsAddPeriodOpen(false)}
                  className="p-1 px-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreatePeriodSubmit} className="p-5 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nama / Label Periode *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pertengahan Juni 2026 atau Recalc Kustom"
                    value={newPeriodForm.month}
                    onChange={(e) => setNewPeriodForm({ ...newPeriodForm, month: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Tanggal Mulai (From) *</label>
                    <input
                      type="date"
                      required
                      value={newPeriodForm.startDate}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Tanggal Selesai (To) *</label>
                    <input
                      type="date"
                      required
                      value={newPeriodForm.endDate}
                      onChange={(e) => setNewPeriodForm({ ...newPeriodForm, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPeriodOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow transition-all cursor-pointer text-xs"
                    id="btn-save-custom-period"
                  >
                    Terapkan &amp; Hitung Gaji
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
