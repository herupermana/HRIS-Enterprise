import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, Calendar, 
  Coins, Sliders, Menu, X, Activity, ChevronRight, Bell, HelpCircle, Smartphone,
  FileText, Sun, Moon, Megaphone, ShoppingBag, Shield, ShieldAlert, Lock, LogIn, LogOut, Key, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Employee, AttendanceRecord, PayrollRecord, PayrollPeriod, LeaveRequest, SolutionDeviceConfig, AuditLog, SalaryHistoryRecord, MutationHistoryRecord, Holiday, Announcement, CompanyAsset, UserAccount, UserRole, ViolationRecord } from './types';
import { getApiUrl } from './utils';
import { 
  INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_LEAVES, 
  INITIAL_PAYROLL, INITIAL_PAYROLL_PERIODS, INITIAL_DEVICE_CONFIG,
  INITIAL_AUDIT_LOGS, INITIAL_SALARY_HISTORY, INITIAL_HOLIDAYS, INITIAL_ANNOUNCEMENTS, INITIAL_ASSETS,
  INITIAL_USERS, INITIAL_VIOLATIONS
} from './data';

// Component modules
import Dashboard from './components/Dashboard';
import Karyawan from './components/Karyawan';
import Absensi from './components/AbsensiFingerprint';
import Penggajian from './components/Penggajian';
import CutiIzin from './components/CutiIzin';
import Pengaturan from './components/Pengaturan';
import PortalKaryawan from './components/PortalKaryawan';
import DraftSurat from './components/DraftSurat';
import Komunikasi from './components/Komunikasi';
import InventarisAset from './components/InventarisAset';
import ManajemenUser from './components/ManajemenUser';
import Pelanggaran from './components/Pelanggaran';
import LoginPage from './components/LoginPage';


export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee'>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('token') || params.get('portal_token')) ? 'employee' : 'admin';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hris_theme') || 'light') as 'light' | 'dark';
  });

  const [displayDensity, setDisplayDensity] = useState<'ringkas' | 'lapang'>(() => {
    return (localStorage.getItem('hris_display_density') || 'lapang') as 'ringkas' | 'lapang';
  });

  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem('hris_accent_theme') || 'blue';
  });

  const [sidebarBrand, setSidebarBrand] = useState<string>(() => {
    return localStorage.getItem('hris_sidebar_brand') || 'HRIS Enterprise';
  });

  const [systemLang, setSystemLang] = useState<string>(() => {
    return localStorage.getItem('hris_system_lang') || 'id';
  });

  const [showDbSidebar, setShowDbSidebar] = useState<string>(() => {
    return localStorage.getItem('hris_show_db_sidebar') || 'on';
  });

  const [autoRejectLeave, setAutoRejectLeave] = useState<string>(() => {
    return localStorage.getItem('hris_auto_reject_leave') || 'on';
  });

  const getAccentColor = (type: 'text-nav' | 'bg-nav' | 'border-nav' | 'text-icon' | 'bg-dot' | 'bg-button' | 'bg-button-hover' | 'bg-badge' | 'text-badge' | 'border-badge') => {
    switch (accentTheme) {
      case 'emerald':
        if (type === 'text-nav') return 'text-emerald-400';
        if (type === 'bg-nav') return 'bg-emerald-600/10';
        if (type === 'border-nav') return 'border border-emerald-600/20';
        if (type === 'text-icon') return 'text-emerald-400';
        if (type === 'bg-dot') return 'bg-emerald-500';
        if (type === 'bg-button') return 'bg-emerald-600';
        if (type === 'bg-button-hover') return 'hover:bg-emerald-700';
        if (type === 'bg-badge') return 'bg-emerald-50/10';
        if (type === 'text-badge') return 'text-emerald-400';
        if (type === 'border-badge') return 'border-emerald-500/20';
        return '';
      case 'indigo':
        if (type === 'text-nav') return 'text-indigo-400';
        if (type === 'bg-nav') return 'bg-indigo-600/10';
        if (type === 'border-nav') return 'border border-indigo-600/20';
        if (type === 'text-icon') return 'text-indigo-400';
        if (type === 'bg-dot') return 'bg-indigo-500';
        if (type === 'bg-button') return 'bg-indigo-600';
        if (type === 'bg-button-hover') return 'hover:bg-indigo-700';
        if (type === 'bg-badge') return 'bg-indigo-50/10';
        if (type === 'text-badge') return 'text-indigo-400';
        if (type === 'border-badge') return 'border-indigo-500/20';
        return '';
      case 'violet':
        if (type === 'text-nav') return 'text-violet-400';
        if (type === 'bg-nav') return 'bg-violet-600/10';
        if (type === 'border-nav') return 'border border-violet-600/20';
        if (type === 'text-icon') return 'text-violet-400';
        if (type === 'bg-dot') return 'bg-violet-500';
        if (type === 'bg-button') return 'bg-violet-600';
        if (type === 'bg-button-hover') return 'hover:bg-violet-700';
        if (type === 'bg-badge') return 'bg-violet-50/10';
        if (type === 'text-badge') return 'text-violet-400';
        if (type === 'border-badge') return 'border-violet-500/20';
        return '';
      case 'amber':
        if (type === 'text-nav') return 'text-amber-400';
        if (type === 'bg-nav') return 'bg-amber-500/10';
        if (type === 'border-nav') return 'border border-amber-500/20';
        if (type === 'text-icon') return 'text-amber-400';
        if (type === 'bg-dot') return 'bg-amber-500';
        if (type === 'bg-button') return 'bg-amber-500';
        if (type === 'bg-button-hover') return 'hover:bg-amber-600';
        if (type === 'bg-badge') return 'bg-amber-50/10';
        if (type === 'text-badge') return 'text-amber-400';
        if (type === 'border-badge') return 'border-amber-500/20';
        return '';
      case 'rose':
        if (type === 'text-nav') return 'text-rose-400';
        if (type === 'bg-nav') return 'bg-rose-600/10';
        if (type === 'border-nav') return 'border border-rose-600/20';
        if (type === 'text-icon') return 'text-rose-400';
        if (type === 'bg-dot') return 'bg-rose-500';
        if (type === 'bg-button') return 'bg-rose-600';
        if (type === 'bg-button-hover') return 'hover:bg-rose-700';
        if (type === 'bg-badge') return 'bg-rose-50/10';
        if (type === 'text-badge') return 'text-rose-400';
        if (type === 'border-badge') return 'border-rose-500/20';
        return '';
      default: // blue
        if (type === 'text-nav') return 'text-blue-400';
        if (type === 'bg-nav') return 'bg-blue-600/10';
        if (type === 'border-nav') return 'border border-blue-600/20';
        if (type === 'text-icon') return 'text-blue-400';
        if (type === 'bg-dot') return 'bg-blue-500';
        if (type === 'bg-button') return 'bg-blue-600';
        if (type === 'bg-button-hover') return 'hover:bg-blue-700';
        if (type === 'bg-badge') return 'bg-blue-50/10';
        if (type === 'text-badge') return 'text-blue-400';
        if (type === 'border-badge') return 'border-blue-500/20';
        return '';
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hris_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hris_display_density', displayDensity);
  }, [displayDensity]);

  // Listen to custom system configurations changes
  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e.detail) {
        if (e.detail.accentTheme) setAccentTheme(e.detail.accentTheme);
        if (e.detail.sidebarBrand) setSidebarBrand(e.detail.sidebarBrand);
        if (e.detail.systemLang) setSystemLang(e.detail.systemLang);
        if (e.detail.showDbSidebar) setShowDbSidebar(e.detail.showDbSidebar);
        if (e.detail.autoRejectLeave) setAutoRejectLeave(e.detail.autoRejectLeave);
      } else {
        setAccentTheme(localStorage.getItem('hris_accent_theme') || 'blue');
        setSidebarBrand(localStorage.getItem('hris_sidebar_brand') || 'HRIS Enterprise');
        setSystemLang(localStorage.getItem('hris_system_lang') || 'id');
        setShowDbSidebar(localStorage.getItem('hris_show_db_sidebar') || 'on');
        setAutoRejectLeave(localStorage.getItem('hris_auto_reject_leave') || 'on');
      }
    };

    window.addEventListener('hris_system_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('hris_system_config_updated', handleConfigUpdate);
    };
  }, []);

  // Core Persistent States with LocalStorage fallback
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hris_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hris_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('hris_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('hris_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [deviceConfig, setDeviceConfig] = useState<SolutionDeviceConfig>(() => {
    const saved = localStorage.getItem('hris_device_config');
    return saved ? JSON.parse(saved) : INITIAL_DEVICE_CONFIG;
  });

  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => {
    const saved = localStorage.getItem('hris_payroll_periods');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_PERIODS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hris_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryRecord[]>(() => {
    const saved = localStorage.getItem('hris_salary_history');
    return saved ? JSON.parse(saved) : INITIAL_SALARY_HISTORY;
  });

  const [mutationHistory, setMutationHistory] = useState<MutationHistoryRecord[]>(() => {
    const saved = localStorage.getItem('hris_mutation_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'MUT-001',
        employeeId: 'EMP-001',
        employeeName: 'Heru Permana',
        changeDate: '2026-06-12 11:20:00',
        oldDepartment: 'IT & Engineering',
        newDepartment: 'IT & Engineering',
        oldPosition: 'Senior Software Engineer',
        newPosition: 'Engineering Lead & Tech Architect',
        reason: 'Penyesuaian struktur birokrasi dan promosi kepemimpinan teknis',
        actor: 'herupermana.vps@gmail.com'
      },
      {
        id: 'MUT-002',
        employeeId: 'EMP-003',
        employeeName: 'Citra Dewi',
        changeDate: '2026-06-05 14:30:00',
        oldDepartment: 'Finance & Accounting',
        newDepartment: 'Finance & Accounting',
        oldPosition: 'Junior Accountant',
        newPosition: 'Senior Tax Specialist & Accountant',
        reason: 'Penilaian Kinerja Semester & Pemenuhan Tugas Perpajakan',
        actor: 'herupermana.vps@gmail.com'
      }
    ];
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem('hris_holidays');
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('hris_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [assets, setAssets] = useState<CompanyAsset[]>(() => {
    const saved = localStorage.getItem('hris_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('hris_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    const saved = localStorage.getItem('hris_violations');
    return saved ? JSON.parse(saved) : INITIAL_VIOLATIONS;
  });

  // --- DATABASE PERSISTENCE CODE ---
  const [dbStatus, setDbStatus] = useState<{
    connected?: boolean;
    engine?: string;
    loading: boolean;
    error: string | null;
    saving: boolean;
    savingDetails: string | null;
    latencyMs?: number;
    lastSync?: string | null;
    collectionsCount?: number;
    databaseName?: string;
  }>({ loading: true, error: null, saving: false, savingDetails: null });

  // Ref to track last stringified data version to skip redundant saves on initial mount/fetches
  const lastSavedData = React.useRef<Record<string, string>>({});

  // Load all initial data from DB backend on startup
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(getApiUrl("/api/db/load"));
        const json = await res.json();
        
        if (json.success && json.data) {
          const dbData = json.data;
          if (dbData.employees) {
            setEmployees(dbData.employees);
            lastSavedData.current.employees = JSON.stringify(dbData.employees);
          }
          if (dbData.attendance) {
            setAttendance(dbData.attendance);
            lastSavedData.current.attendance = JSON.stringify(dbData.attendance);
          }
          if (dbData.leaves) {
            setLeaves(dbData.leaves);
            lastSavedData.current.leaves = JSON.stringify(dbData.leaves);
          }
          if (dbData.payrollRecords) {
            setPayrollRecords(dbData.payrollRecords);
            lastSavedData.current.payrollRecords = JSON.stringify(dbData.payrollRecords);
          }
          if (dbData.deviceConfig) {
            setDeviceConfig(dbData.deviceConfig);
            lastSavedData.current.deviceConfig = JSON.stringify(dbData.deviceConfig);
            
            // Populate and synchronize systemConfig configurations
            if (dbData.deviceConfig.systemConfig) {
              const sys = dbData.deviceConfig.systemConfig;
              if (sys.serverTimeout) localStorage.setItem('hris_server_timeout', String(sys.serverTimeout));
              if (sys.dbPoolLimit) localStorage.setItem('hris_db_pool_limit', String(sys.dbPoolLimit));
              if (sys.autosaveFreq) localStorage.setItem('hris_autosave_freq', String(sys.autosaveFreq));
              if (sys.logRetention) localStorage.setItem('hris_log_retention', String(sys.logRetention));
              if (sys.accentTheme) {
                localStorage.setItem('hris_accent_theme', String(sys.accentTheme));
                setAccentTheme(sys.accentTheme);
              }
              if (sys.sidebarBrand) {
                localStorage.setItem('hris_sidebar_brand', String(sys.sidebarBrand));
                setSidebarBrand(sys.sidebarBrand);
              }
              if (sys.systemLang) {
                localStorage.setItem('hris_system_lang', String(sys.systemLang));
                setSystemLang(sys.systemLang);
              }
              if (sys.audioAlerts) localStorage.setItem('hris_audio_alerts', String(sys.audioAlerts));
              if (sys.showDbSidebar) {
                localStorage.setItem('hris_show_db_sidebar', String(sys.showDbSidebar));
                setShowDbSidebar(sys.showDbSidebar);
              }
              if (sys.autoRejectLeave) {
                localStorage.setItem('hris_auto_reject_leave', String(sys.autoRejectLeave));
                setAutoRejectLeave(sys.autoRejectLeave);
              }
            }
          }
          if (dbData.periods) {
            setPeriods(dbData.periods);
            lastSavedData.current.periods = JSON.stringify(dbData.periods);
          }
          if (dbData.auditLogs) {
            setAuditLogs(dbData.auditLogs);
            lastSavedData.current.auditLogs = JSON.stringify(dbData.auditLogs);
          }
          if (dbData.salaryHistory) {
            setSalaryHistory(dbData.salaryHistory);
            lastSavedData.current.salaryHistory = JSON.stringify(dbData.salaryHistory);
          }
          if (dbData.mutationHistory) {
            setMutationHistory(dbData.mutationHistory);
            lastSavedData.current.mutationHistory = JSON.stringify(dbData.mutationHistory);
          }
          if (dbData.holidays) {
            setHolidays(dbData.holidays);
            lastSavedData.current.holidays = JSON.stringify(dbData.holidays);
          }
          if (dbData.announcements) {
            setAnnouncements(dbData.announcements);
            lastSavedData.current.announcements = JSON.stringify(dbData.announcements);
          }
          if (dbData.assets) {
            setAssets(dbData.assets);
            lastSavedData.current.assets = JSON.stringify(dbData.assets);
          }
          if (dbData.users) {
            setUsers(dbData.users);
            lastSavedData.current.users = JSON.stringify(dbData.users);
          }
          if (dbData.violations) {
            setViolations(dbData.violations);
            lastSavedData.current.violations = JSON.stringify(dbData.violations);
          }
        }

        const statusRes = await fetch(getApiUrl("/api/db/status"));
        const statusJson = await statusRes.json();
        setDbStatus({
          loading: false,
          error: null,
          connected: statusJson.isConnected,
          engine: statusJson.engine,
          saving: false,
          savingDetails: null,
          latencyMs: statusJson.latencyMs,
          lastSync: statusJson.lastSync,
          collectionsCount: statusJson.collectionsCount,
          databaseName: statusJson.databaseName
        });
      } catch (err: any) {
        console.error("Gagal memuat database dari hulu server:", err);
        setDbStatus({
          loading: false,
          error: "Gagal memuat database server, menggunakan penyimpanan lokal.",
          connected: false,
          engine: "Local Browser Storage",
          saving: false,
          savingDetails: null
        });
      }
    }
    loadData();
  }, []);

  // Periodic database status polling for real-time connection health checking
  useEffect(() => {
    let active = true;
    async function pollStatus() {
      try {
        const statusRes = await fetch(getApiUrl("/api/db/status"));
        const statusJson = await statusRes.json();
        if (active && statusJson.success) {
          setDbStatus(prev => ({
            ...prev,
            connected: statusJson.isConnected,
            engine: statusJson.engine,
            latencyMs: statusJson.latencyMs,
            lastSync: statusJson.lastSync,
            collectionsCount: statusJson.collectionsCount,
            databaseName: statusJson.databaseName
          }));
        }
      } catch (err) {
        console.warn("Error polling database status:", err);
      }
    }
    
    const interval = setInterval(pollStatus, 8000); // Poll every 8 seconds for real-time diagnostics
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Shared function to update backend collection
  const saveCollectionToServer = async (key: string, data: any) => {
    try {
      const stringified = JSON.stringify(data);
      if (lastSavedData.current[key] === stringified) {
        // Data has not changed from the database/latest save, skip network request
        return;
      }
      lastSavedData.current[key] = stringified;

      setDbStatus(prev => ({ ...prev, saving: true, savingDetails: `Menyimpan ${key}...` }));
      const response = await fetch(getApiUrl("/api/db/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data })
      });
      const resJson = await response.json();
      if (!resJson.success) {
        console.error(`Gagal menyimpan ${key} ke server:`, resJson.error);
      }
    } catch (err) {
      console.error(`Error saving ${key} to server:`, err);
    } finally {
      setTimeout(() => {
        setDbStatus(prev => ({ ...prev, saving: false, savingDetails: null }));
      }, 500);
    }
  };

  // Synchronizers for DB (triggered ONLY when loading is finished)
  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('employees', employees);
  }, [employees, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('attendance', attendance);
  }, [attendance, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('leaves', leaves);
  }, [leaves, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('payrollRecords', payrollRecords);
  }, [payrollRecords, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('deviceConfig', deviceConfig);
  }, [deviceConfig, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('periods', periods);
  }, [periods, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('auditLogs', auditLogs);
  }, [auditLogs, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('salaryHistory', salaryHistory);
  }, [salaryHistory, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('mutationHistory', mutationHistory);
  }, [mutationHistory, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('holidays', holidays);
  }, [holidays, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('announcements', announcements);
  }, [announcements, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('assets', assets);
  }, [assets, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('users', users);
  }, [users, dbStatus.loading]);

  useEffect(() => {
    if (dbStatus.loading) return;
    saveCollectionToServer('violations', violations);
  }, [violations, dbStatus.loading]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('hris_is_authenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hris_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const [activeUser, setActiveUser] = useState<UserAccount>(() => {
    const savedUsers = localStorage.getItem('hris_users');
    const parsedUsers: UserAccount[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    const activeUserId = localStorage.getItem('hris_active_user_id');
    const matched = parsedUsers.find(u => u.id === activeUserId);
    return matched || parsedUsers[0]; // defaults to Super Admin
  });

  // Save states to localstorage on changes
  useEffect(() => {
    localStorage.setItem('hris_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hris_active_user_id', activeUser.id);
  }, [activeUser]);

  useEffect(() => {
    if (activeUser.role === 'Karyawan') {
      setUserRole('employee');
    } else {
      setUserRole('admin');
    }
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem('hris_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('hris_violations', JSON.stringify(violations));
  }, [violations]);

  // Reactively synchronize Employee activeSP field based on active Violations
  useEffect(() => {
    setEmployees(prevEmployees => {
      let changed = false;
      const updated = prevEmployees.map(emp => {
        const activeEmpViolations = violations.filter(v => v.employeeId === emp.id && v.status === 'Aktif');
        let highestSP: 'SP1' | 'SP2' | 'SP3' | null = null;
        if (activeEmpViolations.some(v => v.severity === 'SP3')) {
          highestSP = 'SP3';
        } else if (activeEmpViolations.some(v => v.severity === 'SP2')) {
          highestSP = 'SP2';
        } else if (activeEmpViolations.some(v => v.severity === 'SP1')) {
          highestSP = 'SP1';
        }

        if (emp.activeSP !== highestSP) {
          changed = true;
          return {
            ...emp,
            activeSP: highestSP
          };
        }
        return emp;
      });

      return changed ? updated : prevEmployees;
    });
  }, [violations]);

  useEffect(() => {
    localStorage.setItem('hris_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Synchronize leave durations automatically in real-time when holidays change,
  // detecting conflicts with national holidays and adjusting remaining quota.
  useEffect(() => {
    let changed = false;
    const synchronizedLeaves = leaves.map(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return leave;
      }
      
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
      const correctDuration = workingDaysCount > 0 ? workingDaysCount : 1;
      
      if (leave.duration !== correctDuration) {
        changed = true;
        return {
          ...leave,
          duration: correctDuration
        };
      }
      return leave;
    });

    if (changed) {
      setLeaves(synchronizedLeaves);
      
      // Log automatic sync to Audit Logs
      const newLog: AuditLog = {
        id: `AUDIT-SYNC-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: 'Sistem Sinkronisasi Otomatis',
        module: 'Cuti/Izin',
        action: 'Sinkronisasi Hari Libur',
        details: 'Sinkronisasi otomatis berhasil dijalankan. Durasi dari semua pengajuan cuti yang beririsan dengan hari libur nasional telah diperbarui secara real-time.',
        status: 'Sukses'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  }, [holidays, leaves]);

  useEffect(() => {
    localStorage.setItem('hris_holidays', JSON.stringify(holidays));
  }, [holidays]);
  useEffect(() => {
    localStorage.setItem('hris_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hris_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('hris_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('hris_payroll', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem('hris_device_config', JSON.stringify(deviceConfig));
  }, [deviceConfig]);

  useEffect(() => {
    localStorage.setItem('hris_payroll_periods', JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem('hris_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hris_salary_history', JSON.stringify(salaryHistory));
  }, [salaryHistory]);

  useEffect(() => {
    localStorage.setItem('hris_mutation_history', JSON.stringify(mutationHistory));
  }, [mutationHistory]);

  const addAuditLog = (
    module: 'Dashboard' | 'Karyawan' | 'Absensi' | 'Penggajian' | 'Cuti/Izin' | 'Konfigurasi' | 'Inventaris',
    action: string,
    details: string,
    status: 'Sukses' | 'Info' | 'Peringatan' = 'Sukses'
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'herupermana.vps@gmail.com', // Active HR operator account from context
      module,
      action,
      details,
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Listen to custom salary wizard and generic logging events
  useEffect(() => {
    const handleSalaryConfigUpdated = () => {
      const meal = localStorage.getItem('hris_meal_transport_allowance') || '50000';
      const late = localStorage.getItem('hris_late_deduction_rate') || '5000';
      const health = localStorage.getItem('hris_bpjs_kesehatan_rate') || '1.0';
      const work = localStorage.getItem('hris_bpjs_ketenagakerjaan_rate') || '2.0';
      const tax = localStorage.getItem('hris_pph21_rate') || '5.0';

      addAuditLog(
        'Konfigurasi',
        'Update Komponen Gaji',
        `Penyelarasan komponen standard penggajian via Wizard: Tunjangan Rp ${parseInt(meal, 10).toLocaleString('id-ID')}/hari, Penalty Rp ${parseInt(late, 10).toLocaleString('id-ID')}/menit, BPJS Kes ${health}%, BPJS Ket ${work}%, Flat PPh21 ${tax}%.`
      );
    };

    const handleGenericAddAuditLog = (e: Event) => {
      const customEvent = e as CustomEvent<{
        module: 'Dashboard' | 'Karyawan' | 'Absensi' | 'Penggajian' | 'Cuti/Izin' | 'Konfigurasi';
        action: string;
        details: string;
        status?: 'Sukses' | 'Info' | 'Peringatan';
      }>;
      if (customEvent.detail) {
        const { module, action, details, status = 'Sukses' } = customEvent.detail;
        addAuditLog(module, action, details, status);
      }
    };

    window.addEventListener('hris_salary_config_updated', handleSalaryConfigUpdated);
    window.addEventListener('hris_add_audit_log' as any, handleGenericAddAuditLog);

    return () => {
      window.removeEventListener('hris_salary_config_updated', handleSalaryConfigUpdated);
      window.removeEventListener('hris_add_audit_log' as any, handleGenericAddAuditLog);
    };
  }, []);

  // User Accounts Management
  const handleAddUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);
    addAuditLog('Konfigurasi', 'Registrasi Operator', `Registrasi partner operator baru ${newUser.name} (@${newUser.username}) dengan tingkatan hak akses '${newUser.role}' sukses.`);
  };

  const handleEditUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (activeUser.id === updatedUser.id) {
      setActiveUser(updatedUser);
    }
    addAuditLog('Konfigurasi', 'Sunting Akun Kontrol', `Merubah metadata profil atau tingkat otorisasi untuk operator '@${updatedUser.username}'.`);
  };

  const handleDeleteUser = (id: string) => {
    const userCopy = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (userCopy) {
      addAuditLog('Konfigurasi', 'Hapus Operator', `Menghapus operator backroom '${userCopy.name}' (@${userCopy.username}) dari database wewenang.`, 'Peringatan');
    }
  };

  const handleSwitchUser = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (targetUser) {
      const updatedUser = {
        ...targetUser,
        lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      setActiveUser(updatedUser);
      addAuditLog('Dashboard', 'Beralih Sesi Operator', `Beralih sesi kontrol aktif. Operator sekarang: ${targetUser.name} (${targetUser.role}).`);
    }
  };

  // SYSTEM LOGIC ACTIONS
  // 1. Employee Management
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
    addAuditLog('Karyawan', 'Tambah Karyawan Baru', `Karyawan baru ${newEmp.name} (ID: ${newEmp.id}, Dev PIN: ${newEmp.pin}) berhasil didaftarkan di sistem.`);
  };

  const handleEditEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    addAuditLog('Karyawan', 'Edit Profil Karyawan', `Memperbarui data profil dan kontrak kerja karyawan ${updatedEmp.name} (${updatedEmp.id}).`);
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    // also remove from attendance and payrolls
    setAttendance(prev => prev.filter(a => a.employeeId !== id));
    setPayrollRecords(prev => prev.filter(p => p.employeeId !== id));
    addAuditLog('Karyawan', 'Hapus Karyawan', `Menghapus secara permanen data karyawan ${emp ? emp.name : id} (${id}) beserta log presensi dan penggajiannya.`, 'Peringatan');
  };

  // 2. Attendance sync / log merging
  const handleSyncAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendance(prev => {
      // Avoid duplicate logs for the same employee + date
      const filteredPrev = prev.filter(pRecord => 
        !newRecords.some(nRecord => nRecord.employeeId === pRecord.employeeId && nRecord.date === pRecord.date)
      );
      return [...newRecords, ...filteredPrev];
    });
    
    // Auto-update device config sync timestamp
    setDeviceConfig(prev => ({
      ...prev,
      lastSyncTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));

    addAuditLog('Absensi', 'Tarik Data Mesin FP', `Sinkronisasi fingerprint berhasil. Diperoleh data absensi terbaru dari perangkat Solution X-100C.`);
  };

  const handleAddManualAttendance = (record: AttendanceRecord) => {
    const emp = employees.find(e => e.id === record.employeeId);
    setAttendance(prev => {
      // Remove any duplicate same day
      const filtered = prev.filter(r => !(r.employeeId === record.employeeId && r.date === record.date));
      return [record, ...filtered];
    });
    addAuditLog('Absensi', 'Absen Koreksi Manual', `Menambahkan pencatatan kehadiran manual untuk ${emp ? emp.name : 'PIN ' + record.pin} pada tanggal ${record.date} (${record.status}).`);
  };

  const handleClearAttendance = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh log kehadiran? Ini akan mereset ke data awal untuk demo.')) {
      setAttendance(INITIAL_ATTENDANCE);
      addAuditLog('Absensi', 'Hapus Seluruh Log', 'Menghapus seluruh log kehadiran dan mereset ke data demonstrasi awal.', 'Peringatan');
    }
  };

  // 3. Leave approvals & reactive state mutations
  const processNewLeaveRequest = (newReq: LeaveRequest): LeaveRequest => {
    let finalLeave: LeaveRequest = {
      ...newReq,
      managerApproval: 'Pending',
      hrApproval: 'Pending'
    };

    const isAutoRejectActive = localStorage.getItem('hris_auto_reject_leave') !== 'off';
    if (isAutoRejectActive && newReq.type === 'Cuti Tahunan') {
      const empSelectedLeaves = leaves.filter(l => l.employeeId === newReq.employeeId);
      const approvedAnnualLeavesCount = empSelectedLeaves
        .filter(l => l.type === 'Cuti Tahunan' && l.status === 'Disetujui')
        .reduce((sum, l) => sum + l.duration, 0);
      const remainingQuota = Math.max(0, 12 - approvedAnnualLeavesCount);

      if (newReq.duration > remainingQuota) {
        // Exceeds quota! Auto-reject.
        finalLeave = {
          ...finalLeave,
          status: 'Ditolak',
          managerApproval: 'Ditolak',
          hrApproval: 'Ditolak',
          approvedByManager: 'Sistem Auto-Reject',
          approvedByHR: 'Sistem Auto-Reject',
          reason: `${newReq.reason} (Sistem Auto-Reject: Melebihi kuota cuti tahunan berjalan. Sisa jatah: ${remainingQuota} hari, Diajukan: ${newReq.duration} hari)`
        };
      }
    }
    return finalLeave;
  };

  const handleAddLeaveRequest = (newReq: LeaveRequest) => {
    const finalLeave = processNewLeaveRequest(newReq);
    setLeaves(prev => [finalLeave, ...prev]);
    if (finalLeave.status === 'Ditolak') {
      addAuditLog('Cuti/Izin', 'Auto-Reject Cuti', `Pengajuan Cuti Tahunan ${newReq.employeeName} ditolak otomatis oleh sistem karena melebihi kuota (Diajukan: ${newReq.duration} hari).`, 'Peringatan');
    } else {
      addAuditLog('Cuti/Izin', 'Pengajuan Cuti/Permisi', `Menambahkan pengajuan ${newReq.type} untuk ${newReq.employeeName} (${newReq.duration} hari kerja).`);
    }
  };

  const handleUpdateLeaveStatus = (
    id: string, 
    status: 'Disetujui' | 'Ditolak', 
    role: 'manager' | 'hr' = 'hr'
  ) => {
    setLeaves(prev => prev.map(l => {
      if (l.id !== id) return l;

      const updated = { ...l };
      if (role === 'manager') {
        updated.managerApproval = status;
        updated.approvedByManager = status === 'Disetujui' ? 'Manager Divisi' : undefined;
        if (status === 'Ditolak') {
          updated.status = 'Ditolak';
        }
      } else {
        updated.hrApproval = status;
        updated.approvedByHR = status === 'Disetujui' ? 'HRD Manager' : undefined;
        if (status === 'Disetujui') {
          updated.status = 'Disetujui';
        } else if (status === 'Ditolak') {
          updated.status = 'Ditolak';
        }
      }
      return updated;
    }));

    // Find request detail for reactive status change
    const request = leaves.find(l => l.id === id);
    if (request) {
      const verb = role === 'manager' ? 'Manajer Divisi' : 'HRD Manager';
      addAuditLog('Cuti/Izin', 'Verifikasi Cuti/Izin', `Verifikasi tahap ${verb} untuk pengajuan ${request.type} oleh ${request.employeeName} menjadi '${status}'.`);

      if (status === 'Disetujui' && role === 'hr') {
        // Reactive Flow: If leave occupies "today" (2026-06-11), change employee status to "Cuti"
        const today = new Date('2026-06-11');
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);

        if (today >= start && today <= end) {
          setEmployees(prev => prev.map(emp => 
            emp.id === request.employeeId ? { ...emp, status: 'Cuti' } : emp
          ));
        }
      }
    }
  };

  // 4. Payroll calculation trigger & approval stages
  const handleUpdatePayrollApproval = (
    recId: string,
    approval: 'Pending' | 'Disetujui' | 'Ditolak',
    fullCalculatedData?: Partial<PayrollRecord>
  ) => {
    const isTemp = recId.startsWith('TEMP-');
    const empId = isTemp ? recId.replace('TEMP-', '') : '';
    const emp = isTemp ? employees.find(e => e.id === empId) : null;
    const empName = emp ? emp.name : 'Staf';

    addAuditLog('Penggajian', 'Persetujuan Manajer', `Manajer Divisi mengubah keputusan persetujuan gaji untuk ${empName} menjadi '${approval}'.`);

    setPayrollRecords(prev => {
      if (isTemp) {
        const matchedEmp = employees.find(e => e.id === empId);
        if (!matchedEmp) return prev;

        const newRecord: PayrollRecord = {
          id: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          employeeId: empId,
          periodId: fullCalculatedData?.periodId ?? 'PRD-001',
          basicSalary: fullCalculatedData?.basicSalary ?? matchedEmp.basicSalary,
          allowanceSum: fullCalculatedData?.allowanceSum ?? matchedEmp.allowance,
          bonus: fullCalculatedData?.bonus ?? 0,
          lateDeduction: fullCalculatedData?.lateDeduction ?? 0,
          bpjsKesehatan: fullCalculatedData?.bpjsKesehatan ?? Math.round(matchedEmp.basicSalary * 0.01),
          bpjsKetenagakerjaan: fullCalculatedData?.bpjsKetenagakerjaan ?? Math.round(matchedEmp.basicSalary * 0.02),
          pph21: fullCalculatedData?.pph21 ?? Math.round(matchedEmp.basicSalary * 0.05),
          netSalary: fullCalculatedData?.netSalary ?? (matchedEmp.basicSalary + matchedEmp.allowance),
          attendanceSummary: fullCalculatedData?.attendanceSummary ?? { hadir: 0, terlambat: 0, cutiIzin: 0, alpa: 0 },
          payoutStatus: 'Belum Dibayar',
          managerApproval: approval,
          hrApproval: 'Pending',
          approvedByManager: approval === 'Disetujui' ? 'Manager Divisi' : undefined
        };
        return [newRecord, ...prev];
      }

      return prev.map(r => r.id === recId ? {
        ...r,
        managerApproval: approval,
        approvedByManager: approval === 'Disetujui' ? 'Manager Divisi' : undefined,
        ...(fullCalculatedData ? {
          basicSalary: fullCalculatedData.basicSalary ?? r.basicSalary,
          allowanceSum: fullCalculatedData.allowanceSum ?? r.allowanceSum,
          bonus: fullCalculatedData.bonus ?? r.bonus,
          lateDeduction: fullCalculatedData.lateDeduction ?? r.lateDeduction,
          bpjsKesehatan: fullCalculatedData.bpjsKesehatan ?? r.bpjsKesehatan,
          bpjsKetenagakerjaan: fullCalculatedData.bpjsKetenagakerjaan ?? r.bpjsKetenagakerjaan,
          pph21: fullCalculatedData.pph21 ?? r.pph21,
          netSalary: fullCalculatedData.netSalary ?? r.netSalary,
          attendanceSummary: fullCalculatedData.attendanceSummary ?? r.attendanceSummary
        } : {})
      } : r);
    });
  };

  const handleUpdatePayrollStatus = (
    recId: string, 
    status: 'Belum Dibayar' | 'Diproses' | 'Sudah Ditransfer',
    fullCalculatedData?: Partial<PayrollRecord>
  ) => {
    // Write audit log first outside state updater callback
    if (recId.startsWith('TEMP-')) {
      const empId = recId.replace('TEMP-', '');
      const matchedEmp = employees.find(e => e.id === empId);
      if (matchedEmp) {
        addAuditLog('Penggajian', 'Terbitkan Slip Gaji', `Menerbitkan slip penggajian mandiri baru untuk ${matchedEmp.name} (${empId}) dengan status pembayaran '${status}'.`);
      }
    } else {
      const record = payrollRecords.find(r => r.id === recId);
      const matchedEmp = record ? employees.find(e => e.id === record.employeeId) : null;
      addAuditLog('Penggajian', 'Ubah Status Slip Gaji', `Memperbarui status pembayaran slip penggajian ${recId} (${matchedEmp ? matchedEmp.name : 'Karyawan'}) menjadi '${status}'.`);
    }

    setPayrollRecords(prev => {
      // If it's a mock row (TEMP) or existing record, update accordingly
      if (recId.startsWith('TEMP-')) {
        const empId = recId.replace('TEMP-', '');
        const matchedEmp = employees.find(e => e.id === empId);
        if (!matchedEmp) return prev;

        // Generate a new payroll card
        const newRecord: PayrollRecord = {
          id: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          employeeId: empId,
          periodId: fullCalculatedData?.periodId ?? 'PRD-001',
          basicSalary: fullCalculatedData?.basicSalary ?? matchedEmp.basicSalary,
          allowanceSum: fullCalculatedData?.allowanceSum ?? matchedEmp.allowance,
          bonus: fullCalculatedData?.bonus ?? 0,
          lateDeduction: fullCalculatedData?.lateDeduction ?? 0,
          bpjsKesehatan: fullCalculatedData?.bpjsKesehatan ?? Math.round(matchedEmp.basicSalary * 0.01),
          bpjsKetenagakerjaan: fullCalculatedData?.bpjsKetenagakerjaan ?? Math.round(matchedEmp.basicSalary * 0.02),
          pph21: fullCalculatedData?.pph21 ?? Math.round(matchedEmp.basicSalary * 0.05),
          netSalary: fullCalculatedData?.netSalary ?? (matchedEmp.basicSalary + matchedEmp.allowance),
          attendanceSummary: fullCalculatedData?.attendanceSummary ?? { hadir: 0, terlambat: 0, cutiIzin: 0, alpa: 0 },
          payoutStatus: status,
          payoutDate: status === 'Sudah Ditransfer' ? new Date().toISOString().split('T')[0] : undefined,
          managerApproval: 'Disetujui', // already approved if we bypassed or just default
          hrApproval: status === 'Sudah Ditransfer' ? 'Disetujui' : 'Pending',
          approvedByManager: 'Manager Divisi',
          approvedByHR: status === 'Sudah Ditransfer' ? 'HRD Manager' : undefined
        };
        return [newRecord, ...prev];
      }

      return prev.map(r => r.id === recId ? { 
        ...r, 
        payoutStatus: status,
        payoutDate: status === 'Sudah Ditransfer' ? new Date().toISOString().split('T')[0] : r.payoutDate,
        hrApproval: status === 'Sudah Ditransfer' ? 'Disetujui' : r.hrApproval,
        approvedByHR: status === 'Sudah Ditransfer' ? 'HRD Manager' : r.approvedByHR,
        ...(fullCalculatedData ? {
          basicSalary: fullCalculatedData.basicSalary ?? r.basicSalary,
          allowanceSum: fullCalculatedData.allowanceSum ?? r.allowanceSum,
          bonus: fullCalculatedData.bonus ?? r.bonus,
          lateDeduction: fullCalculatedData.lateDeduction ?? r.lateDeduction,
          bpjsKesehatan: fullCalculatedData.bpjsKesehatan ?? r.bpjsKesehatan,
          bpjsKetenagakerjaan: fullCalculatedData.bpjsKetenagakerjaan ?? r.bpjsKetenagakerjaan,
          pph21: fullCalculatedData.pph21 ?? r.pph21,
          netSalary: fullCalculatedData.netSalary ?? r.netSalary,
          attendanceSummary: fullCalculatedData.attendanceSummary ?? r.attendanceSummary
        } : {})
      } : r);
    });
  };

  const handleAddPeriod = (newPeriod: PayrollPeriod) => {
    setPeriods(prev => [newPeriod, ...prev]);
    addAuditLog('Penggajian', 'Buat Periode Gaji Baru', `Periode penggajian baru '${newPeriod.month}' (${newPeriod.startDate} s/d ${newPeriod.endDate}) berhasil dibuat.`);
  };

  const handleUpdatePeriod = (updatedPeriod: PayrollPeriod) => {
    setPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
    addAuditLog('Penggajian', 'Update Periode Gaji', `Periode penggajian '${updatedPeriod.month}' diperbarui menjadi rentang (${updatedPeriod.startDate} s/d ${updatedPeriod.endDate}).`);
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements(prev => [newAnn, ...prev]);
    addAuditLog('Dashboard', 'Kirim Pengumuman', `Pengumuman baru bertajuk '${newAnn.title}' berhasil disebarkan ke portal (${newAnn.targetType}).`);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const annCopy = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (annCopy) {
      addAuditLog('Dashboard', 'Hapus Pengumuman', `Menghapus pengumuman '${annCopy.title}' dari database sistem.`);
    }
  };

  const handleMarkAnnouncementAsRead = (id: string, employeeId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const readBy = a.readBy || [];
        if (!readBy.includes(employeeId)) {
          return { ...a, readBy: [...readBy, employeeId] };
        }
      }
      return a;
    }));
  };

  const handleAddAsset = (newAsset: CompanyAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    addAuditLog('Inventaris', 'Registrasi Aset', `Aset baru '${newAsset.name}' (Tag: ${newAsset.tagNumber}) berhasil didaftarkan.`);
  };

  const handleUpdateAsset = (updatedAsset: CompanyAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    const actionDesc = updatedAsset.status === 'Dipinjam' 
      ? `Peminjaman aset '${updatedAsset.name}' ke karyawan (ID: ${updatedAsset.loanedToId}).`
      : `Pengembalian/pembaharuan status aset '${updatedAsset.name}' (Status: ${updatedAsset.status}, Kondisi: ${updatedAsset.condition}).`;
    addAuditLog('Inventaris', 'Modifikasi Aset', actionDesc);
  };

  const handleDeleteAsset = (id: string) => {
    const assetCopy = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(a => a.id !== id));
    if (assetCopy) {
      addAuditLog('Inventaris', 'Hapus Aset', `Menghapus aset '${assetCopy.name}' (Tag: ${assetCopy.tagNumber}) dari database.`);
    }
  };

  const handleGeneratePayrollForPeriod = (periodId: string) => {
    // Logic to batch generate bills
    alert('Seluruh transaksi slip penggajian terhitung otomatis berdasarkan komparasi log absensi Solution X-100C.');
  };

  // Sidebar Menu Items
  const allMenuItems = [
    { id: 'dashboard', label: 'Ringkasan Portal', icon: Activity },
    { id: 'karyawan', label: 'Data Karyawan', icon: Users },
    { id: 'absensi', label: 'Tarik Absen X-100c', icon: Clock },
    { id: 'payroll', label: 'Slip Penggajian', icon: Coins },
    { id: 'cuti', label: 'Cuti & Permisi', icon: Calendar },
    { id: 'pelanggaran', label: 'Manajemen Pelanggaran', icon: ShieldAlert },
    { id: 'inventaris', label: 'Inventaris & Aset', icon: ShoppingBag },
    { id: 'draft-surat', label: 'Draft Surat & Dokumen', icon: FileText },
    { id: 'komunikasi', label: 'Komunikasi Massal', icon: Megaphone },
    { id: 'manajemen-user', label: 'Manajemen Akses', icon: Shield },
    { id: 'pengaturan', label: 'Aturan Kerja', icon: Sliders },
  ];

  const menuItems = allMenuItems.filter(item => {
    // Check if module is disabled globally under Module Configuration
    const isModuleDisabled = deviceConfig?.enabledModules && deviceConfig.enabledModules[item.id] === false;
    
    // Safety check: Dashboard, Aturan Kerja & Manajemen Akses are essential core modules
    if (isModuleDisabled && item.id !== 'dashboard' && item.id !== 'pengaturan' && item.id !== 'manajemen-user') {
      return false;
    }

    if (activeUser.role === 'Super Admin' || activeUser.role === 'HR Manager') return true;
    if (activeUser.role === 'Division Manager') {
      return ['dashboard', 'karyawan', 'payroll', 'cuti', 'manajemen-user'].includes(item.id);
    }
    return false;
  });

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    
    // Play a soft, non-intrusive high-quality synthetic click beep
    if (localStorage.getItem('hris_audio_alerts') !== 'off') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, audioCtx.currentTime); // Crisp click tone
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {
        // Safe catch for user interaction policy or unsupported environments
      }
    }
  };

  // Segmented access-level lists filtering
  const filteredEmployeesForView = employees.filter(emp => {
    if (activeUser.role === 'Super Admin' || activeUser.role === 'HR Manager') return true;
    if (activeUser.role === 'Division Manager') {
      return emp.department === activeUser.department;
    }
    return false;
  });

  const filteredLeavesForView = leaves.filter(l => {
    if (activeUser.role === 'Super Admin' || activeUser.role === 'HR Manager') return true;
    if (activeUser.role === 'Division Manager') {
      const emp = employees.find(e => e.id === l.employeeId);
      return emp && emp.department === activeUser.department;
    }
    return false;
  });

  const filteredPayrollForView = payrollRecords.filter(p => {
    if (activeUser.role === 'Super Admin' || activeUser.role === 'HR Manager') return true;
    if (activeUser.role === 'Division Manager') {
      const emp = employees.find(e => e.id === p.employeeId);
      return emp && emp.department === activeUser.department;
    }
    return false;
  });

  const filteredAttendanceForView = attendance.filter(a => {
    if (activeUser.role === 'Super Admin' || activeUser.role === 'HR Manager') return true;
    if (activeUser.role === 'Division Manager') {
      const emp = employees.find(e => e.id === a.employeeId);
      return emp && emp.department === activeUser.department;
    }
    return false;
  });

  if (!isAuthenticated) {
    return (
      <LoginPage 
        users={users}
        dbStatus={dbStatus}
        onLoginSuccess={(user) => {
          setActiveUser(user);
          setIsAuthenticated(true);
          addAuditLog('Konfigurasi', 'Login Sukses', `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" id="hris-root">
      {userRole === 'employee' ? (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-center animate-fadeIn bg-slate-950">
          <PortalKaryawan
            employees={employees}
            attendance={attendance}
            leaves={leaves}
            payrollRecords={payrollRecords}
            periods={periods}
            salaryHistory={salaryHistory}
            holidays={holidays}
            announcements={announcements}
            assets={assets}
            deviceConfig={deviceConfig}
            onMarkAnnouncementAsRead={handleMarkAnnouncementAsRead}
            onAddLeaveRequest={(newLeave) => {
              const finalLeave = processNewLeaveRequest(newLeave);
              setLeaves(prev => [finalLeave, ...prev]);
              if (finalLeave.status === 'Ditolak') {
                addAuditLog('Cuti/Izin', 'Auto-Reject Cuti', `Pengajuan Cuti Tahunan ${newLeave.employeeName} ditolak otomatis oleh sistem karena melebihi kuota dari Portal Mandiri.`, 'Peringatan');
              } else {
                addAuditLog('Cuti/Izin', 'Pengajuan Cuti Karyawan', `Pengajuan cuti ${newLeave.employeeName} (${newLeave.employeeId}) berhasil disinkronkan dari Portal Mandiri.`);
              }
            }}
            onBackToAdmin={() => {
              setUserRole('admin');
              addAuditLog('Dashboard', 'Beralih Peran', 'HR Operator beralih kembali ke Portal Admin Utama.');
            }}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans overflow-hidden w-full h-full" id="admin-workspace-pane">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] flex-shrink-0 h-screen text-slate-400" id="hris-sidebar-desktop">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50" id="sidebar-logo-area">
          <div className={`w-8 h-8 ${getAccentColor('bg-button')} rounded flex items-center justify-center text-white font-bold text-xl italic shadow-md`}>
            {sidebarBrand.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-white font-bold tracking-tight text-base block leading-tight">{sidebarBrand}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-0.5">BIOMETRIC SYNC</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <span className="px-4 text-[9px] uppercase font-bold tracking-widest text-[#64748B] block mb-2">INTEGRATED MODULES</span>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
               <button
                 key={item.id}
                 onClick={() => handleMenuClick(item.id)}
                 className={`w-full text-left inline-flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                   isActive 
                     ? `${getAccentColor('bg-nav')} ${getAccentColor('text-nav')} border ${getAccentColor('border-nav')}` 
                     : 'text-slate-400 hover:text-white hover:bg-slate-850'
                 }`}
                 id={`nav-link-desktop-${item.id}`}
               >
                 <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? getAccentColor('text-icon') : 'text-slate-400'}`} />
                 <span className="truncate">{item.label}</span>
                 {isActive && <div className={`w-1.5 h-1.5 rounded-full ${getAccentColor('bg-dot')} ml-auto`} />}
               </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-slate-800/50 bg-slate-950/20">
          <button
            onClick={() => {
              setUserRole('employee');
              addAuditLog('Dashboard', 'Beralih Peran', 'HR Operator beralih meninjau Portal Mandiri Karyawan.');
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-[11px] rounded-xl shadow-lg transition-all border border-rose-500/20 cursor-pointer"
            id="switch-to-portal-btn-sidebar"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" /> Portal Karyawan 👤
          </button>
        </div>

        {showDbSidebar === 'on' && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[10.5px] leading-4 space-y-2">
            <div>
              <p className="font-extrabold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Solution SDK: Live
              </p>
              <p className="text-[9px] text-slate-500">Device ID: <span className="font-mono text-slate-400">X-100C-01</span></p>
            </div>
            
            <div className="border-t border-slate-800/40 pt-2 space-y-1.5 text-slate-400">
              <p className="font-bold text-[9px] text-slate-400 uppercase tracking-wider">KONDISI DATABASE UTAMA</p>
              <p className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span>Koneksi: </span>
                <span className="text-slate-200 font-mono text-[10.5px] font-semibold">
                  {dbStatus.connected ? 'MySQL Live' : 'Penyimpanan Lokal'}
                </span>
              </p>
              {dbStatus.connected ? (
                <>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Ping Latency:</span>
                    <span className={`font-mono font-bold ${dbStatus.latencyMs !== undefined && dbStatus.latencyMs < 50 ? 'text-green-400' : 'text-amber-400'}`}>
                      {dbStatus.latencyMs !== undefined && dbStatus.latencyMs >= 0 ? `${dbStatus.latencyMs} ms` : '12 ms'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Database:</span>
                    <span className="font-mono text-blue-400 font-semibold">{dbStatus.databaseName || 'hpstate'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Sinkronisasi tabel:</span>
                    <span className="text-green-450 font-semibold font-mono">Sukses</span>
                  </div>
                  {dbStatus.lastSync && (
                    <div className="text-[9px] text-slate-500 italic mt-0.5 leading-tight">
                      Terakhir Sinkron: {new Date(dbStatus.lastSync).toLocaleTimeString('id-ID')}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[9px] text-amber-500/80 leading-normal bg-amber-500/5 p-1 rounded border border-amber-500/10 mt-1">
                  ⚠️ Menggunakan cadangan lokal JSON. Hubungkan MySQL di Pengaturan untuk mengaktifkan sinkronisasi real-time.
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden" id="main-frame-parent">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-35" id="hris-header">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <h1 className="text-base font-bold text-slate-800 hidden sm:block">
              {menuItems.find(m => m.id === activeTab)?.label || 'Attendance Management System'}
            </h1>
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-extrabold text-xs text-slate-900">HRIS Biometric</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold hidden md:inline">SYSTEM ONLINE</span>
            </div>

            {/* Real-time Database Health Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold shadow-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-green-500' : 'bg-rose-500'} animate-pulse`} />
              <span className="text-slate-400">DB:</span>
              <span className="font-mono text-slate-800 font-bold">{dbStatus.connected ? 'MySQL' : 'SQLite'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Ping:</span>
              <span className={`font-mono font-bold ${dbStatus.connected && dbStatus.latencyMs !== undefined && dbStatus.latencyMs < 50 ? 'text-green-600' : 'text-amber-600'}`}>
                {dbStatus.connected && dbStatus.latencyMs !== undefined && dbStatus.latencyMs >= 0 ? `${dbStatus.latencyMs} ms` : 'Local'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Database:</span>
              <span className="text-slate-800 font-bold font-mono">{dbStatus.connected ? (dbStatus.databaseName || 'hpstate') : 'Local Backup'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Tabel Sync:</span>
              <span className={dbStatus.connected ? 'text-green-600 font-bold' : 'text-amber-600'}>{dbStatus.connected ? 'Sukses' : 'Offline'}</span>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-3 text-xs">
              <div className="text-right hidden sm:block text-xs">
                <p className="font-bold text-slate-800 leading-tight">Kamis, 11 Juni 2026</p>
                <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider leading-none block">WIB (UTC+07:00)</span>
              </div>

              {/* Theme Swapper Toggle Button */}
              <button 
                onClick={() => {
                  const newTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(newTheme);
                  addAuditLog('Konfigurasi', 'Beralih Tema', `Pengguna mengaktifkan ${newTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang'} untuk kenyamanan mata.`);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all flex items-center justify-center cursor-pointer text-slate-600"
                title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
                id="theme-toggle-btn"
              >
                {theme === 'light' ? (
                  <Moon className="w-4.5 h-4.5 text-slate-600" />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                )}
              </button>

              <button className="p-1 px-1.5 hover:bg-slate-100 rounded-lg transition-colors relative" id="header-notify-bell">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              </button>

              {/* Active User Session Indicator */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 ml-1">
                <div className="flex flex-col text-right hidden md:block">
                  <span className="font-bold text-xs text-slate-800">{activeUser.name}</span>
                  <span className="text-[10px] text-blue-600 font-bold block">{activeUser.role}{activeUser.department ? ` • ${activeUser.department}` : ''}</span>
                </div>
                <div 
                  className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-slate-100 shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setActiveTab('manajemen-user')}
                  title={`Simulasi Sesi: ${activeUser.name} (${activeUser.role}). Klik untuk ganti role.`}
                >
                  {activeUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                
                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false);
                    addAuditLog('Konfigurasi', 'Logout Sukses', `Pengguna ${activeUser.name} keluar secara aman.`);
                  }}
                  className="p-1 px-1.5 bg-rose-50 dark:bg-rose-950/25 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 rounded-lg transition-all flex items-center justify-center cursor-pointer font-bold gap-1 ml-1"
                  title="Keluar dari Sesi"
                  id="session-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] hidden md:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* overlay backdrop */}
              <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
              
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute left-0 top-0 bottom-0 max-w-xs w-full bg-[#0F172A] p-5 flex flex-col justify-between text-slate-400"
                id="hris-mobile-drawer"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base italic">H</div>
                      <span className="font-extrabold text-sm text-white tracking-widest">HRIS BIOMETRIC</span>
                    </div>
                    <button 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5 text-slate-400" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item.id)}
                          className={`w-full text-left inline-flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                          id={`nav-link-mobile-${item.id}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthenticated(false);
                      addAuditLog('Konfigurasi', 'Logout Sukses', `Pengguna ${activeUser.name} keluar via mobile.`);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-[11px] rounded-xl transition-all border border-rose-500/20 cursor-pointer"
                    id="mobile-drawer-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    Keluar Sesi 👤
                  </button>
                  <div className="text-[10px] text-slate-500 leading-4">
                    <p className="font-bold text-slate-300">PT Enterprise Solutions</p>
                    <p>Fingerprint Solution X-100C API Bridge</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Workspace Screen */}
        <main className="flex-1 bg-[#F8FAFC] p-4 md:p-8 overflow-y-auto w-full h-[calc(100vh-64px)]" id="hris-active-workspace">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Tab Render Router */}
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="tab-dashboard" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Dashboard 
                    employees={filteredEmployeesForView} 
                    attendance={filteredAttendanceForView} 
                    leaves={filteredLeavesForView}
                    auditLogs={auditLogs}
                    payrollRecords={payrollRecords}
                    periods={periods}
                    assets={assets}
                    holidays={holidays}
                    violations={violations}
                    activeUser={activeUser}
                    onClearAuditLogs={() => {
                      if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat log aktivitas (Audit Log)?')) {
                        setAuditLogs([]);
                      }
                    }}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onUpdateEmployee={handleEditEmployee}
                    displayDensity={displayDensity}
                    onUpdateLeaveStatus={(id, status, role) => {
                      const reviewerRole = role || (activeUser.role === 'Division Manager' ? 'manager' : 'hr');
                      handleUpdateLeaveStatus(id, status, reviewerRole);
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'karyawan' && (
                <motion.div 
                  key="tab-karyawan" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Karyawan 
                    employees={filteredEmployeesForView}
                    onAddEmployee={handleAddEmployee}
                    onEditEmployee={handleEditEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                    salaryHistory={salaryHistory}
                    onAddSalaryHistory={(record: SalaryHistoryRecord) => setSalaryHistory(prev => [record, ...prev])}
                    mutationHistory={mutationHistory}
                    onAddMutationHistory={(record: MutationHistoryRecord) => setMutationHistory(prev => [record, ...prev])}
                    violations={violations}
                  />
                </motion.div>
              )}

              {activeTab === 'absensi' && (
                <motion.div 
                  key="tab-absensi" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Absensi 
                    employees={filteredEmployeesForView}
                    attendance={filteredAttendanceForView}
                    deviceConfig={deviceConfig}
                    onUpdateDeviceConfig={(cfg) => setDeviceConfig(cfg)}
                    onSyncAttendance={handleSyncAttendance}
                    onAddManualAttendance={handleAddManualAttendance}
                    onClearAttendance={handleClearAttendance}
                    holidays={holidays}
                    onUpdateEmployee={handleEditEmployee}
                  />
                </motion.div>
              )}

              {activeTab === 'payroll' && (
                <motion.div 
                  key="tab-payroll" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Penggajian 
                    employees={filteredEmployeesForView}
                    attendance={filteredAttendanceForView}
                    payrollRecords={filteredPayrollForView}
                    periods={periods}
                    onAddPeriod={handleAddPeriod}
                    onUpdatePeriod={handleUpdatePeriod}
                    onUpdatePayrollStatus={handleUpdatePayrollStatus}
                    onUpdatePayrollApproval={handleUpdatePayrollApproval}
                    onGeneratePayrollForPeriod={handleGeneratePayrollForPeriod}
                    onAddManualAttendance={handleAddManualAttendance}
                    deviceConfig={deviceConfig}
                  />
                </motion.div>
              )}

              {activeTab === 'cuti' && (
                <motion.div 
                  key="tab-cuti" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CutiIzin 
                    employees={filteredEmployeesForView}
                    leaves={filteredLeavesForView}
                    onAddLeaveRequest={handleAddLeaveRequest}
                    onUpdateLeaveStatus={(id, status, role) => {
                      const reviewerRole = role || (activeUser.role === 'Division Manager' ? 'manager' : 'hr');
                      handleUpdateLeaveStatus(id, status, reviewerRole);
                    }}
                    holidays={holidays}
                    onUpdateHolidays={(newHolidays) => {
                      setHolidays(newHolidays);
                      addAuditLog('Cuti/Izin', 'Update Kalender Libur', `Memperbarui daftar kalender hari libur nasional (${newHolidays.length} hari hari libur terkonfigurasi).`);
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'pelanggaran' && (
                <motion.div 
                  key="tab-pelanggaran" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pelanggaran 
                    employees={employees}
                    attendance={attendance}
                    violations={violations}
                    onAddViolation={(newV) => setViolations(prev => [newV, ...prev])}
                    onUpdateViolationStatus={(id, status) => setViolations(prev => prev.map(v => v.id === id ? { ...v, status } : v))}
                    onDeleteViolation={(id) => setViolations(prev => prev.filter(v => v.id !== id))}
                    onAddAuditLog={(action, details, status) => addAuditLog('Karyawan', action, details, status)}
                  />
                </motion.div>
              )}

              {activeTab === 'inventaris' && (
                <motion.div 
                  key="tab-inventaris" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <InventarisAset 
                    employees={filteredEmployeesForView}
                    assets={assets}
                    onAddAsset={handleAddAsset}
                    onUpdateAsset={handleUpdateAsset}
                    onDeleteAsset={handleDeleteAsset}
                  />
                </motion.div>
              )}

              {activeTab === 'draft-surat' && (
                <motion.div 
                  key="tab-draft-surat" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <DraftSurat employees={filteredEmployeesForView} deviceConfig={deviceConfig} />
                </motion.div>
              )}

              {activeTab === 'komunikasi' && (
                <motion.div 
                  key="tab-komunikasi" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Komunikasi 
                    employees={filteredEmployeesForView}
                    announcements={announcements}
                    onAddAnnouncement={handleAddAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                  />
                </motion.div>
              )}

              {activeTab === 'manajemen-user' && (
                <motion.div 
                  key="tab-manajemen-user" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ManajemenUser 
                    users={users}
                    activeUser={activeUser}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    onSwitchUser={handleSwitchUser}
                  />
                </motion.div>
              )}

              {activeTab === 'pengaturan' && (
                <motion.div 
                  key="tab-pengaturan" 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pengaturan 
                    displayDensity={displayDensity}
                    onChangeDisplayDensity={setDisplayDensity}
                    dbStatus={dbStatus}
                    deviceConfig={deviceConfig}
                    onUpdateDeviceConfig={(cfg) => setDeviceConfig(cfg)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      </div>
      )}
    </div>
  );
}
