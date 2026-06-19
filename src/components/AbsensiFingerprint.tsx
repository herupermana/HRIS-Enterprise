import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Database, FileText, Upload, RefreshCw, 
  HelpCircle, Settings, CheckCircle2, AlertCircle, Plus, 
  Trash, Eye, ArrowDownToLine, Clock, Cpu,
  Wifi, WifiOff, HardDrive, Signal, Edit, Save,
  CalendarDays, Search, Printer
} from 'lucide-react';
import { Employee, AttendanceRecord, SolutionDeviceConfig, AttendanceStatus, Holiday } from '../types';
import { SAMPLE_X100C_DAT_FILE, INITIAL_SHIFTS } from '../data';

export interface RawMachineLog {
  id: string;
  pin: string;
  employeeName: string;
  timestamp: string;      // machine log time
  verifiedState: string;  // e.g. "Sidik Jari"
  stateMode: 'Check-In' | 'Check-Out' | 'Lainnya';
  deviceId: string;       // Solution Device ID
  syncTime: string;       // sync timestamp
}

const INITIAL_RAW_MACHINE_LOGS: RawMachineLog[] = [
  {
    id: 'RAW-1001-A',
    pin: '1001',
    employeeName: 'Rian Wijaya',
    timestamp: '2026-06-10 07:50:00',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-In',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  },
  {
    id: 'RAW-1001-B',
    pin: '1001',
    employeeName: 'Rian Wijaya',
    timestamp: '2026-06-10 17:05:00',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-Out',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  },
  {
    id: 'RAW-1002-A',
    pin: '1002',
    employeeName: 'Siti Aminah',
    timestamp: '2026-06-10 07:55:12',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-In',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  },
  {
    id: 'RAW-1002-B',
    pin: '1002',
    employeeName: 'Siti Aminah',
    timestamp: '2026-06-10 17:03:45',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-Out',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  },
  {
    id: 'RAW-1003-A',
    pin: '1003',
    employeeName: 'Budi Santoso',
    timestamp: '2026-06-10 08:00:05',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-In',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  },
  {
    id: 'RAW-1003-B',
    pin: '1003',
    employeeName: 'Budi Santoso',
    timestamp: '2026-06-10 17:15:20',
    verifiedState: 'Sidik Jari (1)',
    stateMode: 'Check-Out',
    deviceId: 'SOL-X100C-01',
    syncTime: '2026-06-10 17:05:00'
  }
];

interface AbsensiProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  deviceConfig: SolutionDeviceConfig;
  onUpdateDeviceConfig: (cfg: SolutionDeviceConfig) => void;
  onSyncAttendance: (records: AttendanceRecord[]) => void;
  onAddManualAttendance: (record: AttendanceRecord) => void;
  onClearAttendance: () => void;
  holidays: Holiday[];
  onUpdateEmployee: (emp: Employee) => void;
}

export default function Absensi({ 
  employees, 
  attendance, 
  deviceConfig, 
  onUpdateDeviceConfig, 
  onSyncAttendance,
  onAddManualAttendance,
  onClearAttendance,
  holidays,
  onUpdateEmployee
}: AbsensiProps) {
  const [activeMethod, setActiveMethod] = useState<'network' | 'file-upload'>('network');
  const [rawText, setRawText] = useState('');
  const [rawMachineLogs, setRawMachineLogs] = useState<RawMachineLog[]>(INITIAL_RAW_MACHINE_LOGS);
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [testConnStatus, setTestConnStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pendingSyncCount, setPendingSyncCount] = useState(14);
  const [deviceStorage, setDeviceStorage] = useState({
    logsUsed: 8421,
    logsCapacity: 100000,
    fingerUsed: 420,
    fingerCapacity: 3000,
    faceUsed: 110,
    faceCapacity: 1200,
  });
  
  // States helper
  const [showHelp, setShowHelp] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Attendance Filtering States
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStartDate, setAttendanceStartDate] = useState('');
  const [attendanceEndDate, setAttendanceEndDate] = useState('');
  const [attendanceOvertimeFilter, setAttendanceOvertimeFilter] = useState<'all' | 'overtimeOnly' | 'noOvertime'>('all');
  const [shiftMismatchFilter, setShiftMismatchFilter] = useState<'all' | 'mismatchOnly' | 'matchOnly'>('all');

  // Shift Filtering States
  const [shiftSearch, setShiftSearch] = useState('');
  const [shiftDept, setShiftDept] = useState('all');

  // Overtime Edit Modal
  const [isOvertimeOpen, setIsOvertimeOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AttendanceRecord | null>(null);
  const [overtimeHoursInput, setOvertimeHoursInput] = useState<string>('0');
  const [overtimeNotes, setOvertimeNotes] = useState<string>('');

  // Manual Form
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState<{
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    statusMode: 'Otomatis' | 'Sakit' | 'Cuti' | 'Izin' | 'Alpa';
  }>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '17:00',
    statusMode: 'Otomatis'
  });

  // Helper to detect if a fingerprint log check-in/out corresponds to their assigned roster shift
  const getShiftMismatchDetails = (
    checkInTime: string | undefined,
    checkOutTime: string | undefined,
    assignedShift: 'Pagi' | 'Siang' | 'Malam'
  ) => {
    if (!checkInTime) return null; // No check-in, cannot determine mismatch securely
    
    const [inH] = checkInTime.split(':').map(Number);
    let actualShift: 'Pagi' | 'Siang' | 'Malam' = 'Pagi';

    if (inH >= 5 && inH < 12) {
      actualShift = 'Pagi';
    } else if (inH >= 12 && inH < 18) {
      actualShift = 'Siang';
    } else if (inH >= 18 || inH < 5) {
      actualShift = 'Malam';
    }

    if (actualShift !== assignedShift) {
      return {
        assigned: assignedShift,
        actual: actualShift,
        reason: `Datang ${checkInTime} terdeteksi Shift ${actualShift} (Terkonfigurasi: Shift ${assignedShift})`
      };
    }
    return null;
  };

  const filteredAttendance = useMemo(() => {
    return attendance.filter(rec => {
      // 1. Search Query: matches name, ID, PIN or logDetails
      const emp = employees.find(e => e.id === rec.employeeId);
      if (attendanceSearch) {
        const query = attendanceSearch.toLowerCase();
        const name = (emp?.name || '').toLowerCase();
        const empId = rec.employeeId.toLowerCase();
        const pin = rec.pin.toString();
        const details = (rec.logDetails || '').toLowerCase();
        if (!name.includes(query) && !empId.includes(query) && !pin.includes(query) && !details.includes(query)) {
          return false;
        }
      }

      // 2. Date Filter
      if (attendanceStartDate && rec.date < attendanceStartDate) {
        return false;
      }
      if (attendanceEndDate && rec.date > attendanceEndDate) {
        return false;
      }

      // 3. Overtime Filter
      let hasOvertime = false;
      if (rec.overtimeMinutes !== undefined) {
        hasOvertime = rec.overtimeMinutes > 0;
      } else if (rec.checkOut) {
        const [outH, outM] = rec.checkOut.split(':').map(Number);
        const empShift = emp?.shiftPattern || 'Pagi';
        let stdEndMins = 17 * 60;
        let outMins = outH * 60 + outM;

        if (empShift === 'Siang') stdEndMins = 22 * 60;
        if (empShift === 'Malam') {
          if (outH < 12) {
            stdEndMins = 6 * 60;
          } else {
            stdEndMins = 30 * 60;
            outMins += 24 * 60;
          }
        }
        const diff = outMins - stdEndMins;
        if (diff >= 30) {
          hasOvertime = true;
        }
      }

      if (attendanceOvertimeFilter === 'overtimeOnly' && !hasOvertime) {
        return false;
      }
      if (attendanceOvertimeFilter === 'noOvertime' && hasOvertime) {
        return false;
      }

      // 4. Shift Mismatch Filter
      if (shiftMismatchFilter !== 'all') {
        const hasMismatch = getShiftMismatchDetails(rec.checkIn, rec.checkOut, emp?.shiftPattern || 'Pagi') !== null;
        if (shiftMismatchFilter === 'mismatchOnly' && !hasMismatch) {
          return false;
        }
        if (shiftMismatchFilter === 'matchOnly' && hasMismatch) {
          return false;
        }
      }

      return true;
    });
  }, [attendance, employees, attendanceSearch, attendanceStartDate, attendanceEndDate, attendanceOvertimeFilter, shiftMismatchFilter]);

  const printStats = useMemo(() => {
    let totalLatenessMins = 0;
    let lateCount = 0;
    let totalOvertimeMins = 0;
    let overtimeCount = 0;
    let leaveCount = 0;
    let sakitCount = 0;
    let alpaCount = 0;

    filteredAttendance.forEach(rec => {
      if (rec.lateMinutes > 0) {
        totalLatenessMins += rec.lateMinutes;
        lateCount++;
      }
      if (rec.status === 'Sakit') sakitCount++;
      else if (rec.status === 'Cuti') leaveCount++;
      else if (rec.status === 'Alpa') alpaCount++;

      // Overtime
      if (rec.overtimeMinutes !== undefined) {
        totalOvertimeMins += rec.overtimeMinutes;
        if (rec.overtimeMinutes > 0) overtimeCount++;
      } else if (rec.checkOut) {
        const emp = employees.find(e => e.id === rec.employeeId);
        const empShift = emp?.shiftPattern || 'Pagi';
        let stdEndMins = 17 * 60;
        if (empShift === 'Siang') stdEndMins = 22 * 60;
        if (empShift === 'Malam') stdEndMins = 6 * 60;
        const [outH, outM] = rec.checkOut.split(':').map(Number);
        let outMins = outH * 60 + outM;
        if (empShift === 'Malam') {
          if (outH < 12) {
            stdEndMins = 6 * 60;
          } else {
            stdEndMins = 30 * 60;
            outMins += 24 * 60;
          }
        }
        const diff = outMins - stdEndMins;
        if (diff >= 30) {
          totalOvertimeMins += diff;
          overtimeCount++;
        }
      }
    });

    return {
      totalLatenessMins,
      lateCount,
      totalOvertimeMins,
      overtimeCount,
      sakitCount,
      leaveCount,
      alpaCount,
      totalRecords: filteredAttendance.length
    };
  }, [filteredAttendance, employees]);

  // Calculate parameters according to Shift Rules (Tolerance etc)
  const calculateAttendanceStatus = (checkInTime: string | undefined, checkOutTime: string | undefined, isHoliday?: boolean, shiftPattern: 'Pagi' | 'Siang' | 'Malam' = 'Pagi') => {
    if (isHoliday) {
      if (checkInTime) {
        return { status: 'Hadir (Libur)' as any, lateMinutes: 0, earlyOutMinutes: 0 };
      }
      return { status: 'Libur' as any, lateMinutes: 0, earlyOutMinutes: 0 };
    }

    if (!checkInTime) {
      return { status: 'Alpa' as const, lateMinutes: 0, earlyOutMinutes: 0 };
    }

    // Determine shift start and end times
    let startHour = 8;
    let startMin = 0;
    let endHour = 17;
    let endMin = 0;

    if (shiftPattern === 'Siang') {
      startHour = 14;
      startMin = 0;
      endHour = 22;
      endMin = 0;
    } else if (shiftPattern === 'Malam') {
      startHour = 22;
      startMin = 0;
      endHour = 6;
      endMin = 0;
    }
    
    const [inHour, inMin] = checkInTime.split(':').map(Number);
    const tolerance = INITIAL_SHIFTS.toleranceMinutes; // 15 mins

    // Minutes late
    const checkInMinutes = inHour * 60 + inMin;
    const standardStartMinutes = startHour * 60 + startMin;
    const lateMinutes = checkInMinutes - standardStartMinutes;

    let status: AttendanceStatus = 'Hadir';
    let finalLate = 0;
    let finalEarlyVal = 0;

    if (lateMinutes > tolerance) {
      status = 'Terlambat';
      finalLate = lateMinutes;
    }

    if (checkOutTime) {
      const [outHour, outMinVal] = checkOutTime.split(':').map(Number);
      const checkOutMinutes = outHour * 60 + outMinVal;

      if (shiftPattern === 'Malam') {
        // Night shift ends at 06:00 AM next day. Let's calculate early out:
        // If the check-out is before 06:00 AM, say 05:40 AM
        if (outHour < 12) {
          const targetEndMinutes = 6 * 60; // 06:00
          const earlyOut = targetEndMinutes - checkOutMinutes;
          if (earlyOut > 0) {
            status = 'Pulang Cepat';
            finalEarlyVal = earlyOut;
          }
        } else {
          // If they checked out before midnight (e.g., 23:45)
          const targetEndMinutes = 30 * 60; // 06:00 next day is 30 hours from starting midnight
          const earlyOut = targetEndMinutes - checkOutMinutes;
          if (earlyOut > 0) {
            status = 'Pulang Cepat';
            finalEarlyVal = earlyOut;
          }
        }
      } else {
        const standardEndMinutes = endHour * 60 + endMin;
        const earlyOut = standardEndMinutes - checkOutMinutes;
        
        if (earlyOut > 0) {
          status = 'Pulang Cepat';
          finalEarlyVal = earlyOut;
        }
      }
    }

    return { status, lateMinutes: finalLate, earlyOutMinutes: finalEarlyVal };
  };

  // 1. SIMULATE SOLUTION X-100C DEVICE PING
  const handleTestConnection = () => {
    setTestConnStatus('testing');
    setTimeout(() => {
      // Simulate connection success if fields are complete
      if (deviceConfig.ipAddress && deviceConfig.port) {
        setTestConnStatus('success');
        onUpdateDeviceConfig({
          ...deviceConfig,
          status: 'Terkoneksi',
          lastSyncTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      } else {
        setTestConnStatus('failed');
      }
    }, 1500);
  };

  // 2. SIMULATE TCP/IP DIRECT LOG FETCH
  const handleDirectFetchLogs = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    
    setTimeout(() => {
      // Parse the sample simulation logs from Solution memory
      const logs = parseX100CDatText(SAMPLE_X100C_DAT_FILE);
      processAndSaveLogs(logs);
      setIsSyncing(false);
      setPendingSyncCount(0);
      setDeviceStorage(prev => ({
        ...prev,
        logsUsed: Math.min(prev.logsCapacity, prev.logsUsed + logs.length)
      }));
      setSyncFeedback(`Koneksi Sukses! Berhasil menarik ${logs.length} baris log biner langsung dari memori internal Solution X-100C (IP: ${deviceConfig.ipAddress}).`);
    }, 2000);
  };

  useEffect(() => {
    const handlePull = () => {
      handleDirectFetchLogs();
    };
    window.addEventListener('hris_trigger_pull_logs', handlePull);
    return () => window.removeEventListener('hris_trigger_pull_logs', handlePull);
  }, [deviceConfig]);

  // 3. PARSE FILE OR DIRECT COPIED DAT STREAM
  const parseX100CDatText = (text: string) => {
    const lines = text.trim().split('\n');
    const logsList: { pin: string; date: string; time: string; state: string }[] = [];

    lines.forEach(line => {
      // ZK / Solution standard format matches space or tab splits:
      // PIN YYYY-MM-DD HH:MM:SS VerifiedState StateMode
      const parts = line.replace(/\s+/g, '\t').split('\t');
      if (parts.length >= 3) {
        const pin = parts[0].trim();
        const dateTimeStr = parts[1] + ' ' + parts[2];
        const stateStr = parts[3] || '0'; // default check-in mode
        
        const [date, time] = dateTimeStr.split(' ');
        if (date && time) {
          logsList.push({
            pin,
            date: date.trim(),
            time: time.substring(0, 8),
            state: stateStr.trim()
          });
        }
      }
    });

    return logsList;
  };

  const handleApplyDatUpload = () => {
    if (!rawText.trim()) {
      alert('Tolong tempelkan format log mentah (KM1.dat/ZKTeco) atau klik contoh di samping!');
      return;
    }

    const logs = parseX100CDatText(rawText);
    processAndSaveLogs(logs);
    setPendingSyncCount(0);
    setDeviceStorage(prev => ({
      ...prev,
      logsUsed: Math.min(prev.logsCapacity, prev.logsUsed + logs.length)
    }));
    setSyncFeedback(`Selesai! Berhasil mengupload via Flashdisk, membaca ${logs.length} Baris Log Finger dan memetakan ke database karyawan.`);
  };

  // Process the compiled raw logs list to generate AttendanceRecords
  const processAndSaveLogs = (rawLogs: { pin: string; date: string; time: string; state: string }[]) => {
    // Map raw finger logs for raw machine log display
    const currentSyncTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRawLogs: RawMachineLog[] = rawLogs.map((rl, index) => {
      const emp = employees.find(e => e.pin === rl.pin);
      const employeeName = emp ? emp.name : 'Karyawan Tidak Terdaftar';
      let stateMode: 'Check-In' | 'Check-Out' | 'Lainnya' = 'Lainnya';
      if (rl.state === '0') stateMode = 'Check-In';
      else if (rl.state === '1') stateMode = 'Check-Out';
      else {
        const [h] = rl.time.split(':').map(Number);
        stateMode = h < 12 ? 'Check-In' : 'Check-Out';
      }
      return {
        id: `RAW-AUTO-${Date.now()}-${index}`,
        pin: rl.pin,
        employeeName,
        timestamp: `${rl.date} ${rl.time}`,
        verifiedState: rl.state === '15' ? 'Wajah (15)' : 'Sidik Jari (1)',
        stateMode,
        deviceId: 'SOL-X100C-01',
        syncTime: currentSyncTime
      };
    });
    setRawMachineLogs(prev => [...newRawLogs, ...prev]);

    // Group records by Employee (PIN) & Date
    const grouped: Record<string, { pin: string; date: string; ins: string[]; outs: string[] }> = {};
    
    rawLogs.forEach(rl => {
      const key = `${rl.pin}_${rl.date}`;
      if (!grouped[key]) {
        grouped[key] = { pin: rl.pin, date: rl.date, ins: [], outs: [] };
      }
      
      // state: '0' typically represents Check-In, '1' represents Check-Out
      // However, we also sort by hour just in case: earliest is In, latest is Out
      if (rl.state === '0') {
        grouped[key].ins.push(rl.time);
      } else if (rl.state === '1') {
        grouped[key].outs.push(rl.time);
      } else {
        // Fallback: allocate based on mid-day threshold
        const [h] = rl.time.split(':').map(Number);
        if (h < 12) {
          grouped[key].ins.push(rl.time);
        } else {
          grouped[key].outs.push(rl.time);
        }
      }
    });

    const newAttendanceRecords: AttendanceRecord[] = [];

    Object.values(grouped).forEach((grp, idx) => {
      const matchingEmp = employees.find(e => e.pin === grp.pin);
      if (!matchingEmp) return; // Skip unregistered Finger PINs
      
      // Find earlier inst dan latest outs
      const checkIn = grp.ins.length > 0 ? grp.ins.sort()[0] : undefined;
      const checkOut = grp.outs.length > 0 ? grp.outs.sort()[grp.outs.length - 1] : undefined;
      
      const isDayHoliday = holidays.some(h => h.date === grp.date);
      const calc = calculateAttendanceStatus(checkIn, checkOut, isDayHoliday, matchingEmp.shiftPattern || 'Pagi');

      newAttendanceRecords.push({
        id: `ATT-${Date.now()}-${idx}`,
        employeeId: matchingEmp.id,
        pin: grp.pin,
        date: grp.date,
        checkIn,
        checkOut,
        status: calc.status,
        lateMinutes: calc.lateMinutes,
        earlyOutMinutes: calc.earlyOutMinutes,
        source: 'Fingerprint Solution X-100C',
        logDetails: `FP PIN: ${grp.pin} | Mode: In (${checkIn || '-'}) Out (${checkOut || '-'})`
      });
    });

    onSyncAttendance(newAttendanceRecords);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.employeeId) {
      alert('Pilih karyawan terlebih dahulu!');
      return;
    }

    const matchingEmp = employees.find(e => e.id === manualForm.employeeId);
    if (!matchingEmp) return;

    const isOverride = manualForm.statusMode !== 'Otomatis';
    const checkInWithSeconds = isOverride ? undefined : manualForm.checkIn + ':00';
    const checkOutWithSeconds = isOverride ? undefined : manualForm.checkOut + ':00';
    
    let status: AttendanceStatus = 'Hadir';
    let lateMinutes = 0;
    let earlyOutMinutes = 0;

    if (isOverride) {
      status = manualForm.statusMode as AttendanceStatus;
    } else {
      const isDayHoliday = holidays.some(h => h.date === manualForm.date);
      const calc = calculateAttendanceStatus(checkInWithSeconds, checkOutWithSeconds, isDayHoliday, matchingEmp.shiftPattern || 'Pagi');
      status = calc.status;
      lateMinutes = calc.lateMinutes;
      earlyOutMinutes = calc.earlyOutMinutes;
    }

    onAddManualAttendance({
      id: `ATT-MANUAL-${Date.now()}`,
      employeeId: matchingEmp.id,
      pin: matchingEmp.pin,
      date: manualForm.date,
      checkIn: checkInWithSeconds,
      checkOut: checkOutWithSeconds,
      status,
      lateMinutes,
      earlyOutMinutes,
      source: 'Manual',
      logDetails: isOverride 
        ? `Otoritas log manual dengan status kustom: ${manualForm.statusMode}`
        : 'Pencatatan manual diotorisasi oleh HR Admin'
    });

    setManualForm({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '08:00',
      checkOut: '17:00',
      statusMode: 'Otomatis'
    });

    setIsManualOpen(false);
  };

  const handleOpenOvertimeModal = (rec: AttendanceRecord) => {
    setEditingLog(rec);
    if (rec.overtimeMinutes !== undefined) {
      setOvertimeHoursInput((rec.overtimeMinutes / 60).toString());
    } else {
      let defaultMins = 0;
      if (rec.checkOut) {
        const emp = employees.find(e => e.id === rec.employeeId);
        const empShift = emp?.shiftPattern || 'Pagi';
        const [outH, outM] = rec.checkOut.split(':').map(Number);
        let outMins = outH * 60 + outM;
        let stdEndMins = 17 * 60;

        if (empShift === 'Siang') stdEndMins = 22 * 60;
        if (empShift === 'Malam') {
          if (outH < 12) {
            stdEndMins = 6 * 60;
          } else {
            stdEndMins = 30 * 60;
            outMins += 24 * 60;
          }
        }
        const diff = outMins - stdEndMins;
        if (diff >= 30) {
          defaultMins = diff;
        }
      }
      setOvertimeHoursInput((defaultMins / 60).toString());
    }
    setOvertimeNotes(rec.logDetails?.includes('Lembur disesuaikan:') ? rec.logDetails.split('Lembur disesuaikan:')[1].trim() : '');
    setIsOvertimeOpen(true);
  };

  const handleSaveOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    const parsedHours = parseFloat(overtimeHoursInput);
    const mins = isNaN(parsedHours) ? 0 : Math.round(parsedHours * 60);

    const updatedRecord: AttendanceRecord = {
      ...editingLog,
      overtimeMinutes: mins,
      logDetails: `Lembur disesuaikan: ${overtimeNotes || 'Disesuaikan oleh HRD'}`
    };

    onAddManualAttendance(updatedRecord);
    setIsOvertimeOpen(false);
    setEditingLog(null);
  };

  const handleLocalClear = () => {
    setRawMachineLogs([]);
    onClearAttendance();
  };

  return (
    <div className="space-y-6" id="absensi-module-container">
      {/* Panel Status Kesehatan & Memori Mesin Solution X-100C */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="machinery-status-deck">
        
        {/* PANEL 1: KESEHATAN KONEKSI MESIN */}
        <div className="bg-white border text-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between" id="card-connection-health">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Status Konektivitas Alat</span>
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                  Solution X-100C
                </h4>
              </div>
              <div className={`p-2.5 rounded-xl ${deviceConfig.status === 'Terkoneksi' ? 'bg-emerald-50 text-emerald-600 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>
                {deviceConfig.status === 'Terkoneksi' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
            </div>

            {/* Health Meter Indicators */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500">Kesehatan Sinyal</span>
                <span className="font-bold flex items-center gap-1 text-slate-800">
                  <Signal className="w-3.5 h-3.5 text-emerald-500" />
                  {deviceConfig.status === 'Terkoneksi' ? 'Stabil (99%)' : 'No Signal (0%)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500">Latency / Response</span>
                <span className="font-mono font-bold text-slate-700">
                  {deviceConfig.status === 'Terkoneksi' ? '12ms (Rerata)' : 'RTO (Timeout)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500">Port Default TCP</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold">
                  {deviceConfig.port} (SOAP)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${deviceConfig.status === 'Terkoneksi' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                {deviceConfig.status === 'Terkoneksi' ? 'Aktif Hub' : 'Sambutan Mandek'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">Sync jam: {deviceConfig.lastSyncTime || '-'}</span>
          </div>
        </div>

        {/* PANEL 2: SISA RUANG PENYIMPANAN MEMORI */}
        <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between" id="card-memory-capacity">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Sisa Ruang Penyimpanan</span>
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                  Memori Flash Internal
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>

            {/* Storage capacity detail counts */}
            <div className="space-y-2.5 text-xs">
              {/* TRANSACTION LOG MEMORY */}
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Log Absensi Terpakai</span>
                  <span className="font-bold text-slate-800">
                    {deviceStorage.logsUsed.toLocaleString('id-ID')} / {deviceStorage.logsCapacity.toLocaleString('id-ID')} ({((deviceStorage.logsUsed/deviceStorage.logsCapacity)*100).toFixed(1)}%)
                  </span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(deviceStorage.logsUsed/deviceStorage.logsCapacity)*100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Sisa kapasitas log:</span>
                  <span className="font-bold">{(deviceStorage.logsCapacity - deviceStorage.logsUsed).toLocaleString('id-ID')} slot log ({((1 - deviceStorage.logsUsed/deviceStorage.logsCapacity)*100).toFixed(2)}% Free)</span>
                </div>
              </div>

              {/* BIOMETRIC TEMPLATES IN BRIEF */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Templates Sidik Jari</span>
                  <span className="text-xs font-bold text-slate-700">
                    {deviceStorage.fingerUsed} / {deviceStorage.fingerCapacity} <span className="text-[10px] text-slate-400 font-normal">({(100 - (deviceStorage.fingerUsed/deviceStorage.fingerCapacity)*100).toFixed(1)}% sisa)</span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Templates Wajah</span>
                  <span className="text-xs font-bold text-slate-700">
                    {deviceStorage.faceUsed} / {deviceStorage.faceCapacity} <span className="text-[10px] text-slate-400 font-normal">({(100 - (deviceStorage.faceUsed/deviceStorage.faceCapacity)*100).toFixed(1)}% sisa)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: JUMLAH LOG YANG TERTUNDA SINKRONISASINYA */}
        <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden" id="card-pending-sync-status">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Antrean Transaksi</span>
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 flex-wrap">
                  Log Tertunda Sinkronisasi
                </h4>
              </div>
              <div className={`p-2.5 rounded-xl ${pendingSyncCount > 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                <RefreshCw className={`w-5 h-5 ${pendingSyncCount > 0 && isSyncing ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="space-y-3">
              {pendingSyncCount > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1" id="pending-counter">
                    <span className="text-4xl font-black text-amber-600 tracking-tight">{pendingSyncCount}</span>
                    <span className="text-xs text-slate-500 font-bold">Baris Transaksi Log Baru</span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg text-[10px] text-amber-900 border border-amber-100 flex items-start gap-1 pb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Ada {pendingSyncCount} rekaman sidik jari baru di memori hardware yang belum ditarik ke cloud database.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1.5 text-emerald-600 font-black text-xl tracking-tight" id="synced-badge">
                    <CheckCircle2 className="w-5 h-5 inline-block shrink-0" /> Tersinkron Penuh
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sinkronisasi berhasil. Semua transaksi kehadiran di mesin telah dipetakan ke profil masing-masing karyawan secara real-time.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {pendingSyncCount > 0 ? (
              <button 
                onClick={handleDirectFetchLogs}
                disabled={isSyncing}
                className="text-[11px] text-blue-600 hover:text-blue-500 font-bold cursor-pointer hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: isSyncing ? '1s' : '0s' }} />
                <span>Tarik Sekarang &rarr;</span>
              </button>
            ) : (
              <button 
                onClick={() => setPendingSyncCount(14)}
                className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline font-bold"
                title="Tambahkan antrean transaksi secara simulatif untuk keperluan pengujian kembali"
              >
                Simulasikan 14 Log Baru
              </button>
            )}
            <span className="text-[10px] text-slate-400 font-mono">SOL-X100C-01</span>
          </div>
        </div>

      </div>

      {/* Device Configuration Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="absensi-top-layout">
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4" id="device-setting-pad">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Koneksi Mesin Solution X-100C</h3>
              <p className="text-[10px] text-gray-400">Parameter hardware &amp; protokol komunikasi</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-500 font-medium mb-1">Alamat IP Mesin (Ethernet)</label>
              <input 
                type="text" 
                value={deviceConfig.ipAddress}
                onChange={(e) => onUpdateDeviceConfig({ ...deviceConfig, ipAddress: e.target.value })}
                className="w-full bg-gray-50 border p-2 rounded-lg font-mono text-gray-800"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 font-medium mb-1">Port Default</label>
                <input 
                  type="number" 
                  value={deviceConfig.port}
                  onChange={(e) => onUpdateDeviceConfig({ ...deviceConfig, port: Number(e.target.value) })}
                  className="w-full bg-gray-50 border p-2 rounded-lg font-mono text-gray-800"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-medium mb-1">COMM Key</label>
                <input 
                  type="number" 
                  value={deviceConfig.commKey}
                  onChange={(e) => onUpdateDeviceConfig({ ...deviceConfig, commKey: Number(e.target.value) })}
                  className="w-full bg-gray-50 border p-2 rounded-lg font-mono text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 font-medium mb-1">Protokol Penarikan</label>
              <select
                value={deviceConfig.connectionType}
                onChange={(e) => onUpdateDeviceConfig({ ...deviceConfig, connectionType: e.target.value as any })}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              >
                <option value="Ethernet TCP/IP">Ethernet TCP/IP (SDK / SOAP)</option>
                <option value="USB Flashdisk">USB Flashdisk (.DAT Import)</option>
                <option value="ADMS Cloud">ADMS Cloud Server Sync</option>
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-600 text-[11px]">Koneksi Alat:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  deviceConfig.status === 'Terkoneksi' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {deviceConfig.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testConnStatus === 'testing'}
                  className="py-2 border hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px] disabled:opacity-50"
                  id="btn-test-connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testConnStatus === 'testing' ? 'animate-spin' : ''}`} /> Test IP
                </button>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="py-2 border hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Panduan
                </button>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {testConnStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-2.5 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-medium border border-blue-100 flex gap-2 items-start"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mesin X-100C Ditemukan!</strong> Socket TCP/IP terjalin sukses di port 4370. Otoritas sync biometric siap dilaksanakan.
                </div>
              </motion.div>
            )}
            {testConnStatus === 'failed' && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-2.5 bg-rose-50 text-rose-800 rounded-lg text-[10px] font-medium border border-rose-100 flex gap-2 items-start"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Koneksi Gagal!</strong> Alamat IP atau Port tidak merespons. Sediakan konfigurasi IP yang benar atau gunakan fitur impor file Flashdisk.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync panel log collector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4" id="attendance-sync-terminal">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Database className="w-5 h-5 text-blue-600" /> Sinkronisasi Biometrik Jari (Solution X-100C)
              </h3>
              <p className="text-[10px] text-slate-400">Ambil dan olah data check-in check-out presensi</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveMethod('network')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeMethod === 'network' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tarik Langsung Device
              </button>
              <button 
                onClick={() => setActiveMethod('file-upload')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeMethod === 'file-upload' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Import file Flashdisk (.dat)
              </button>
            </div>
          </div>

          <div className="flex-1 py-1">
            {activeMethod === 'network' ? (
              <div className="space-y-4 text-xs" id="network-pull-panel">
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Metode ini menggunakan koneksi socket ethernet langsung ke IP **{deviceConfig.ipAddress}**. Terhubung menggunakan protokol ZK/Solution SDK untuk menyalin transaksi log absensi karyawan dari alat fingerprint ke sistem HRIS secara dinamis.
                </p>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="font-extrabold text-blue-900 flex items-center gap-1 text-xs">
                      <Clock className="w-4 h-4 text-blue-600" /> Auto Sync Absensi Is Active
                    </span>
                    <p className="text-blue-700 text-[10px]">Tarik log otomatis berkala setiap {deviceConfig.syncIntervalHours} jam sekali.</p>
                  </div>
                  <button
                    onClick={handleDirectFetchLogs}
                    disabled={isSyncing}
                    className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors inline-flex justify-center items-center gap-1.5 cursor-pointer shadow-sm"
                    id="btn-pull-logs-solution"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Menarik Log...' : 'Tarik Log Sekarang'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs" id="file-import-panel">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-[11px]">
                    Unggah atau tempel transaksi logs biner yang diexport dari menu USB Flashdisk di mesin Solution X-100C.
                  </p>
                  <button
                    onClick={() => setRawText(SAMPLE_X100C_DAT_FILE)}
                    className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-2 py-1 rounded border"
                  >
                    Load Contoh Log Mentah (KM1.dat)
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Contoh format log:&#10;1001&#9;2026-06-11 07:48:12&#9;1&#9;0&#10;1002&#9;2026-06-11 07:55:40&#9;1&#9;0..."
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl font-mono text-[10px] text-slate-700 placeholder-slate-450 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    id="textarea-raw-logs"
                  />
                  <div className="flex justify-between gap-3">
                    <span className="text-[10px] text-slate-400 mt-0.5">Format: PIN &lt;TAB&gt; DateTime &lt;TAB&gt; Verified &lt;TAB&gt; Mode</span>
                    <button
                      onClick={handleApplyDatUpload}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                      id="btn-import-verify"
                    >
                      <Upload className="w-3.5 h-3.5" /> Parse &amp; Sinkron Absensi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sync Alerts & feedback */}
          {syncFeedback && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs flex gap-2 items-start" id="sync-feedback-view">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[11px]">Pemrosesan Biometrik Berhasil</p>
                <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">{syncFeedback}</p>
              </div>
            </div>
          )}

          {/* Quick Stats of Attendance processed */}
          <div className="bg-gray-50/50 p-3 rounded-xl border flex justify-between items-center text-xs">
            <span className="text-[11px] text-gray-500">Total Database Absensi Tersinkron:</span>
            <span className="font-extrabold text-gray-800 text-sm">{attendance.length} Record</span>
          </div>
        </div>
      </div>

      {/* Guide explanation collapses if showHelp is true */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl border border-stone-200/60 font-medium text-xs leading-5 text-stone-700"
            id="guide-help-block"
          >
            <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4 text-amber-600" /> Panduan Komunikasi Hardware Fingerprint Solution X-100C
            </h4>
            <ul className="list-decimal pl-4 space-y-1.5 text-[11px] text-stone-600 ml-1">
              <li>
                <strong>Pengenalan Alat:</strong> Solution X-100C adalah mesin absensi mandiri berkecepatan tinggi yang mendukung penarikan log via TCP/IP RJ45 atau USB Flash Drive.
              </li>
              <li>
                <strong>Pengaturan IP Mesin:</strong> Tekan tombol <kbd className="border bg-white px-1 py-0.5 rounded shadow-sm text-stone-800 font-bold">MENU</kbd> pada fisik mesin, navigasi ke <strong>Comm. (Komunikasi)</strong> &rarr; <strong>Ethernet</strong>. Isikan IP (misal: <code>192.168.1.201</code>) sesuai dengan segmen jaringan lokal Anda.
              </li>
              <li>
                <strong>Pemetaan Karyawan (Enroll ID):</strong> Pastikan PIN Fingerprint yang Anda masukkan pada saat mendaftarkan nama karyawan di sistem HRIS ini <strong>SAMA PERSIS</strong> dengan nomor User ID / PIN yang didaftarkan fisik di mesin sidik jari Solution.
              </li>
              <li>
                <strong>Format berkas KM1.dat:</strong> Jika menggunakan flashdisk, berkas log transaksi standard Solution tersimpan dalam berkas teks berpola pemisah tabulator. Fitur Upload kami melayani konversi berkas biner/teks tersebut langsung di peramban.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 MODUL MANAJEMEN SHIFT KERJA (ROSTER SHIFT KARYAWAN) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6" id="shift-roster-board">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" /> Manajemen Roster &amp; Pola Shift Kerja
            </h3>
            <p className="text-[10px] text-gray-400">Tentukan jadwal shift karyawan untuk memvalidasi log absensi dari Solution X-100C</p>
          </div>
          
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-800 px-3 py-1.5 rounded-xl text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Real-time X-100C Validation Enabled</span>
          </div>
        </div>

        {/* Pola Shift Reference Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="shift-reference-deck">
          <div className="bg-gradient-to-br from-orange-50/40 to-orange-50/10 border border-orange-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-orange-850 font-extrabold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h4>Shift Pagi (Morning Standard)</h4>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <p className="flex justify-between"><span>Jam Kerja:</span> <strong className="text-slate-800 font-mono">08:00 - 17:00</strong></p>
              <p className="flex justify-between"><span>Toleransi Telat:</span> <strong className="text-slate-800 font-mono">15 Menit</strong></p>
              <p className="flex justify-between"><span>Tipe Kedatangan:</span> <span className="text-orange-700 bg-orange-100 px-1 rounded-sm text-[9px] font-bold uppercase">Standard</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50/40 to-sky-50/10 border border-sky-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-sky-850 font-extrabold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <h4>Shift Siang (Afternoon Roster)</h4>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <p className="flex justify-between"><span>Jam Kerja:</span> <strong className="text-slate-800 font-mono">14:00 - 22:00</strong></p>
              <p className="flex justify-between"><span>Toleransi Telat:</span> <strong className="text-slate-800 font-mono">15 Menit</strong></p>
              <p className="flex justify-between"><span>Tipe Kedatangan:</span> <span className="text-sky-700 bg-sky-100 px-1 rounded-sm text-[9px] font-bold uppercase">Sore</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50/40 to-violet-50/10 border border-violet-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-violet-850 font-extrabold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
              <h4>Shift Malam (Overnight Shift)</h4>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              <p className="flex justify-between"><span>Jam Kerja:</span> <strong className="text-slate-800 font-mono">22:00 - 06:00 (H+1)</strong></p>
              <p className="flex justify-between"><span>Toleransi Telat:</span> <strong className="text-slate-800 font-mono">15 Menit</strong></p>
              <p className="flex justify-between"><span>Tipe Kedatangan:</span> <span className="text-violet-700 bg-violet-100 px-1 rounded-sm text-[9px] font-bold uppercase">Overnight</span></p>
            </div>
          </div>
        </div>

        {/* Search and Filters for Roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 text-xs" id="roster-filters-bar">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Cari Karyawan (Nama / PIN)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau PIN finger..."
                value={shiftSearch}
                onChange={(e) => setShiftSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter Departemen / Divisi</label>
            <select
              value={shiftDept}
              onChange={(e) => setShiftDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Departemen</option>
              <option value="IT & Engineering">IT & Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Operations">Operations</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
            </select>
          </div>
        </div>

        {/* Interactive Roster Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-xs text-left" id="roster-shift-table">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <th className="p-3">Karyawan / PIN</th>
                <th className="p-3">Divisi &amp; Jabatan</th>
                <th className="p-3">Jatah Jam Kerja Shift</th>
                <th className="p-3">Ubah Pola Shift Kerja</th>
                <th className="p-3 text-center">Log Terakhir (X-100C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {employees
                .filter(emp => {
                  if (shiftSearch) {
                    const query = shiftSearch.toLowerCase();
                    const matchName = emp.name.toLowerCase().includes(query);
                    const matchPin = emp.pin.includes(query);
                    if (!matchName && !matchPin) return false;
                  }
                  if (shiftDept !== 'all' && emp.department !== shiftDept) {
                    return false;
                  }
                  return true;
                })
                .map(emp => {
                  // Find their latest attendance log in database
                  const logs = attendance.filter(rec => rec.employeeId === emp.id).sort((a,b) => b.date.localeCompare(a.date));
                  const latestLog = logs[0];
                  const empShift = emp.shiftPattern || 'Pagi';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">PIN: {emp.pin} · ID: {emp.id}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{emp.department}</div>
                        <div className="text-[10px] text-slate-400">{emp.position}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {empShift === 'Pagi' ? '08:00 - 17:00' :
                             empShift === 'Siang' ? '14:00 - 22:00' :
                             '22:00 - 06:00 (+1)'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {['Pagi', 'Siang', 'Malam'].map((pattern) => (
                            <button
                              key={pattern}
                              type="button"
                              onClick={() => onUpdateEmployee({ ...emp, shiftPattern: pattern as any })}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                empShift === pattern
                                  ? pattern === 'Pagi' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' :
                                    pattern === 'Siang' ? 'bg-sky-600 text-white border-sky-600 shadow-sm' :
                                    'bg-violet-600 text-white border-violet-600 shadow-sm'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {pattern}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {latestLog ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-400">{latestLog.date}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              latestLog.status === 'Hadir' ? 'bg-blue-105 text-blue-800' :
                              latestLog.status === 'Terlambat' ? 'bg-amber-100 text-amber-800' :
                              latestLog.status === 'Pulang Cepat' ? 'bg-indigo-100 text-indigo-800' :
                              latestLog.status === 'Libur' ? 'bg-teal-50 text-teal-800' :
                              latestLog.status === 'Hadir (Libur)' ? 'bg-purple-50 text-purple-800 border' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {latestLog.status} {(latestLog.lateMinutes > 0 || latestLog.earlyOutMinutes > 0) && '⚠️'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-normal">Belum ada tap</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table processed records & Manual check-in override trigger */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5" id="attendance-history-pane">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-blue-600" /> Histori Kehadiran &amp; Integrasi Logs
            </h3>
            <p className="text-[10px] text-gray-400">Review kalkulasi keterlambatan dan kepulangan karyawan berdasarkan sensor sidik jari</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsManualOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-2 border hover:bg-gray-50 text-[11px] font-bold rounded-xl transition-colors"
              id="btn-trigger-manual-attendance"
            >
              <Plus className="w-3.5 h-3.5" /> Manual Otoritas HR
            </button>
            <button
              onClick={() => window.print()}
              disabled={filteredAttendance.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              id="btn-print-attendance-data"
              title="Cetak Laporan Rekapitulasi Absensi"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" /> Cetak Rekap Absensi
            </button>
            <button
              onClick={handleLocalClear}
              className="inline-flex items-center gap-1 px-3 py-2 border border-rose-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-[11px] font-bold rounded-xl transition-colors"
              id="btn-clear-all-attendance"
            >
              <Trash className="w-3.5 h-3.5" /> Reset Log Kehadiran
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {attendance.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs" id="attendance-filters">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Cari Karyawan / PIN / Keterangan</label>
              <input
                type="text"
                placeholder="Cari nama, ID, PIN..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={attendanceStartDate}
                onChange={(e) => setAttendanceStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={attendanceEndDate}
                onChange={(e) => setAttendanceEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Filter Jam Lembur (Overtime)</label>
              <select
                value={attendanceOvertimeFilter}
                onChange={(e) => setAttendanceOvertimeFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              >
                <option value="all">Semua Status Lembur</option>
                <option value="overtimeOnly">Hanya Ada Lembur (Overtime &gt; 0)</option>
                <option value="noOvertime">Tanpa Lembur</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Kesesuaian Roster Shift</label>
              <select
                value={shiftMismatchFilter}
                onChange={(e) => setShiftMismatchFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              >
                <option value="all">Semua Log Kehadiran</option>
                <option value="mismatchOnly">⚠️ Hanya Ketidaksesuaian Shift</option>
                <option value="matchOnly">✅ Hanya Sesuai Jadwal Shift</option>
              </select>
            </div>

            {/* Clear filters trigger */}
            {(attendanceSearch || attendanceStartDate || attendanceEndDate || attendanceOvertimeFilter !== 'all' || shiftMismatchFilter !== 'all') && (
              <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceSearch('');
                    setAttendanceStartDate('');
                    setAttendanceEndDate('');
                    setAttendanceOvertimeFilter('all');
                    setShiftMismatchFilter('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/60 transition-all font-mono"
                >
                  🧹 Bersihkan Filter
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          {attendance.length === 0 ? (
            <div className="text-center py-12 text-gray-400" id="empty-attendance-display">
              <Database className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold">Database absensi kosong.</p>
              <p className="text-[11px] text-gray-400 mt-1">Harap sinkronisasikan logs mesin X-100C atau tambahkan absensi manual di atas.</p>
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-slate-50 shadow-inner rounded-2xl border border-dashed border-slate-200" id="no-filtered-results">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-slate-700">Tidak ada data absensi/lembur yang cocok dengan kriteria filter.</p>
              <p className="text-[11px] text-gray-400 mt-1">Silakan sesuaikan filter tanggal, pencarian, atau status lembur Anda, atau tekan tombol "Bersihkan Filter" di atas.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left" id="attendance-table-records">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-3">Nama Karyawan / PIN</th>
                  <th className="p-3">Tanggal Kerja</th>
                  <th className="p-3">Datang (Check-In)</th>
                  <th className="p-3">Pulang (Check-Out)</th>
                  <th className="p-3">Status Menit</th>
                  <th className="p-3">Indikator</th>
                  <th className="p-3">Lembur (Overtime)</th>
                  <th className="p-3">Metode Tarik</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredAttendance.map((rec) => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  const isDayHoliday = holidays.some(h => h.date === rec.date);
                  const holidayInfo = holidays.find(h => h.date === rec.date);
                  const mismatch = getShiftMismatchDetails(rec.checkIn, rec.checkOut, emp?.shiftPattern || 'Pagi');
                  
                  return (
                    <tr key={rec.id} className={`hover:bg-gray-50 transition-colors ${mismatch ? 'bg-rose-50/20' : ''}`} id={`tbl-row-${rec.id}`}>
                      <td className="p-3">
                        <div className="font-semibold text-gray-900 flex flex-wrap items-center gap-1.5">
                          <span>{emp?.name || 'Karyawan PIN ' + rec.pin}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 border ${
                            (emp?.shiftPattern || 'Pagi') === 'Pagi' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            (emp?.shiftPattern || 'Pagi') === 'Siang' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                            'bg-violet-50 text-violet-700 border-violet-100'
                          }`}>
                            {emp?.shiftPattern || 'Pagi'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">PIN: {rec.pin} · ID: {rec.employeeId}</div>
                        {mismatch && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 max-w-fit" title={mismatch.reason}>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>KETIDAKSESUAIAN SHIFT</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-gray-700">
                        <div>{rec.date}</div>
                        {isDayHoliday && (
                          <div className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-150 font-extrabold px-1.5 py-0.5 rounded inline-block mt-1">
                            🎉 {holidayInfo?.name}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {rec.checkIn ? (
                          <span className="font-mono bg-stone-50 px-2 py-0.5 rounded border text-stone-700 font-bold">{rec.checkIn}</span>
                        ) : (
                          <span className="text-rose-500 font-semibold">Lupa Tap In</span>
                        )}
                      </td>
                      <td className="p-3">
                        {rec.checkOut ? (
                          <span className="font-mono bg-stone-50 px-2 py-0.5 rounded border text-stone-700 font-bold">{rec.checkOut}</span>
                        ) : (
                          <span className="text-amber-500 font-semibold font-mono">Lupa Tap Out</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                           {rec.lateMinutes > 0 && (
                            <span className="inline-block bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                              Terlambat {rec.lateMinutes} mnt
                            </span>
                          )}
                          {rec.earlyOutMinutes > 0 && (
                            <span className="inline-block bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                              Pulang Cepat {rec.earlyOutMinutes} mnt
                            </span>
                          )}
                          {rec.lateMinutes === 0 && rec.earlyOutMinutes === 0 && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Hadir' ? 'bg-blue-105 text-blue-800' :
                            rec.status === 'Terlambat' ? 'bg-amber-100 text-amber-800 font-semibold' :
                            rec.status === 'Pulang Cepat' ? 'bg-indigo-100 text-indigo-800' :
                            rec.status === 'Sakit' ? 'bg-rose-50 text-rose-700 border border-rose-100 font-semibold' :
                            rec.status === 'Cuti' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold' :
                            rec.status === 'Izin' ? 'bg-orange-50 text-orange-700 border border-orange-100 font-semibold' :
                            rec.status === 'Libur' ? 'bg-teal-50 text-teal-850 border border-teal-200 font-extrabold' :
                            rec.status === 'Hadir (Libur)' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {rec.status}
                          </span>
                          {mismatch && (
                            <div className="text-[9px] text-rose-500 font-extrabold flex items-center gap-0.5" title={mismatch.reason}>
                              ⚠️ Salah Shift
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {rec.overtimeMinutes !== undefined ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-extrabold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-mono">
                              ⏱️ {(rec.overtimeMinutes / 60).toFixed(1)} Jam (Kustom)
                            </span>
                            {rec.logDetails && rec.logDetails.includes('Lembur disesuaikan:') && (
                              <div className="text-[9px] text-slate-400 italic truncate max-w-[120px]" title={rec.logDetails.split('Lembur disesuaikan:')[1]}>
                                {rec.logDetails.split('Lembur disesuaikan:')[1]}
                              </div>
                            )}
                          </div>
                        ) : (() => {
                          const empShift = emp?.shiftPattern || 'Pagi';
                          let defaultMins = 0;
                          let stdEndMins = 17 * 60;
                          let outMinsStr = '17:00';
                          if (empShift === 'Siang') {
                            stdEndMins = 22 * 60;
                            outMinsStr = '22:00';
                          }
                          if (empShift === 'Malam') {
                            stdEndMins = 6 * 60;
                            outMinsStr = '06:00';
                          }

                          if (rec.checkOut) {
                            const [outH, outM] = rec.checkOut.split(':').map(Number);
                            let outMins = outH * 60 + outM;
                            if (empShift === 'Malam') {
                              if (outH < 12) {
                                stdEndMins = 6 * 60;
                              } else {
                                stdEndMins = 30 * 60;
                                outMins += 24 * 60;
                              }
                            }
                            const diff = outMins - stdEndMins;
                            if (diff >= 30) {
                              defaultMins = diff;
                            }
                          }
                          return defaultMins > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg font-mono" title={`Dihitung otomatis dari Check-Out ${outMinsStr}`}>
                              ⏱️ {(defaultMins / 60).toFixed(1)} Jam
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          );
                        })()}
                      </td>
                      <td className="p-3">
                        <span className="text-gray-500 font-medium text-[11px] truncate block max-w-[140px]">{rec.source}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenOvertimeModal(rec)}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                          title="Edit kustom jam lembur harian"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-600" /> Edit Lembur
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. TABEL LOG ABSENSI MENTAH (REAL-TIME MACHINE TRAFFIC STREAM) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4 font-sans" id="raw-biometric-logs-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Cpu className="w-4.5 h-4.5 text-indigo-600" /> Log Absensi Mentah (Solution X-100C Memory Stream)
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              Data biner sidik jari original yang baru saja di-pull langsung tanpa pembersihan (raw memory data) untuk keperluan audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari PIN / Nama / Device ID..."
                value={rawSearchQuery}
                onChange={(e) => setRawSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-[11px] font-medium text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
              <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {rawMachineLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-400" id="empty-raw-logs-view">
              <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-bounce" />
              <p className="text-xs font-semibold">Tidak ada log biner tersinkron.</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Tarik log biner langsung dari mesin Ethernet diatas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <table className="w-full text-xs text-left" id="raw-machine-logs-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-3">Device ID</th>
                    <th className="p-3">PIN Karyawan</th>
                    <th className="p-3">Nama Karyawan</th>
                    <th className="p-3">Waktu Transaksi (Device Log)</th>
                    <th className="p-3">Tipe Verifikasi</th>
                    <th className="p-3 text-center">Jenis Transaksi</th>
                    <th className="p-3">Timestamp Sinkronisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rawMachineLogs
                    .filter(rl => {
                      const q = rawSearchQuery.toLowerCase();
                      return rl.pin.includes(q) || 
                             rl.employeeName.toLowerCase().includes(q) || 
                             rl.deviceId.toLowerCase().includes(q) ||
                             rl.stateMode.toLowerCase().includes(q);
                    })
                    .map((rl) => (
                      <tr key={rl.id} className="hover:bg-slate-50/70 transition-all font-mono text-[11px]">
                        <td className="p-3 font-semibold">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-100 rounded-md">
                            {rl.deviceId}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{rl.pin}</td>
                        <td className="p-3 font-sans font-semibold text-slate-900">{rl.employeeName}</td>
                        <td className="p-3 font-medium text-slate-600">{rl.timestamp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                            rl.verifiedState.includes('Wajah') 
                              ? 'bg-amber-50 text-amber-750 border-amber-100' 
                              : 'bg-emerald-50 text-emerald-750 border-emerald-100'
                          }`}>
                            {rl.verifiedState}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            rl.stateMode === 'Check-In' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : rl.stateMode === 'Check-Out'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rl.stateMode}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-500 font-sans font-medium">{rl.syncTime}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-1">
                <span>* Menampilkan {
                  rawMachineLogs.filter(rl => {
                    const q = rawSearchQuery.toLowerCase();
                    return rl.pin.includes(q) || 
                           rl.employeeName.toLowerCase().includes(q) || 
                           rl.deviceId.toLowerCase().includes(q) ||
                           rl.stateMode.toLowerCase().includes(q);
                  }).length
                } dari {rawMachineLogs.length} total baris log transaksi biner di memori.</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span> Driver socket ZKAccess v4.0 Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Attendance Entry Modal Dialog */}
      <AnimatePresence>
        {isManualOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
              id="manual-attendance-modal"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Otorisasi Presensi Manual (Lupa Tap)</h3>
                <button
                  onClick={() => setIsManualOpen(false)}
                  className="p-1 px-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
               <form onSubmit={handleManualSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Pilih Karyawan *</label>
                  <select
                    required
                    value={manualForm.employeeId}
                    onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                    className="w-full bg-gray-50 border p-2 rounded-lg"
                    id="manual-emp-select"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} (PIN: {e.pin})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Pilih Tanggal Presensi *</label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full bg-gray-50 border p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Status Kehadiran *</label>
                  <select
                    value={manualForm.statusMode}
                    onChange={(e) => setManualForm({ ...manualForm, statusMode: e.target.value as any })}
                    className="w-full bg-gray-50 border p-2 rounded-lg"
                  >
                    <option value="Otomatis">Hadir / Hitung Otomatis (Check-in)</option>
                    <option value="Sakit">Sakit (Sick)</option>
                    <option value="Cuti">Cuti (Leave)</option>
                    <option value="Izin">Izin / Permisi (Permit)</option>
                    <option value="Alpa">Alpa (Absent)</option>
                  </select>
                </div>

                {manualForm.statusMode === 'Otomatis' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Datang (Tap In)</label>
                      <input
                        type="time"
                        value={manualForm.checkIn}
                        onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                        className="w-full bg-gray-50 border p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">Pulang (Tap Out)</label>
                      <input
                        type="time"
                        value={manualForm.checkOut}
                        onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                        className="w-full bg-gray-50 border p-2 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                    id="btn-save-manual-attendance"
                  >
                    Simpan Otorisasi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isOvertimeOpen && editingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
              id="overtime-custom-modal"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm">Edit Jam Lembur Harian</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsOvertimeOpen(false);
                    setEditingLog(null);
                  }}
                  className="p-1 px-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSaveOvertime} className="p-5 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 text-[13px]">
                    {employees.find(e => e.id === editingLog.employeeId)?.name || 'Karyawan'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ID: {editingLog.employeeId} · PIN: {editingLog.pin}
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-600 mt-1">
                    Tanggal: {editingLog.date}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                    <div>Check-In: <span className="font-bold text-slate-800">{editingLog.checkIn || '-'}</span></div>
                    <div>Check-Out: <span className="font-bold text-slate-800">{editingLog.checkOut || '-'}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Durasi Lembur (Jam) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      required
                      value={overtimeHoursInput}
                      onChange={(e) => setOvertimeHoursInput(e.target.value)}
                      className="w-2/3 bg-gray-50 border p-2 rounded-lg font-bold font-mono text-center text-sm"
                      id="custom-overtime-hours-input"
                    />
                    <span className="text-gray-500 font-bold shrink-0">Jam</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                    Setara dengan {Math.round(parseFloat(overtimeHoursInput || '0') * 60)} menit. Nilai ini akan menggantikan perhitungan otomatis checkout.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Keterangan / Alasan Lembur</label>
                  <textarea
                    rows={2}
                    value={overtimeNotes}
                    onChange={(e) => setOvertimeNotes(e.target.value)}
                    placeholder="Contoh: Lembur urgent rilis sistem / Perbaikan server..."
                    className="w-full bg-gray-50 border p-2 rounded-lg"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOvertimeOpen(false);
                      setEditingLog(null);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-750 text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
                    id="btn-save-custom-overtime"
                  >
                    Simpan Koreksi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH FIDELITY PRINT PORTAL - DISPLAYED EXCLUSIVELY UNDER `@media print` ================= */}
      <div id="attendance-print-portal" className="hidden print:block bg-white text-gray-800 p-2 space-y-6">
        {/* Kop Surat Resmi */}
        <div className="text-center space-y-1.5 pb-4 border-b-2 border-gray-900">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">PT BIOMETRIC PORTAL UTAMA INDONESIA</h2>
          <p className="text-xs text-gray-500 font-medium font-sans">Gedung Biometrik Suite Lt. 5, Jl. Jend. Sudirman No. 12, Jakarta Selatan</p>
          <p className="text-[10px] text-gray-400 font-mono">Website: enterprise.co.id • Email: hr@biometricportal.co.id • Telp: (021) 555-1234</p>
        </div>

        {/* Title Dokumen Laporan */}
        <div className="text-center space-y-1 py-1">
          <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest border-b border-gray-100 w-max mx-auto pb-0.5">LAPORAN REKAPITULASI PRESENSI &amp; KEHADIRAN KARYAWAN</h3>
          <p className="text-[10px] font-mono text-gray-500 tracking-wider">
            Diekstraksi pada: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </p>
        </div>

        {/* Info Saringan / Filter Aktif */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-32">Pencarian / NIP:</span> <span className="text-gray-800 font-bold font-mono">{attendanceSearch || 'Semua Karyawan'}</span></div>
            <div className="flex items-center"><span className="text-gray-400 font-bold uppercase w-32">Rentang Tanggal:</span> <span className="text-gray-800 font-bold font-mono">{(attendanceStartDate || 'Awal Database') + ' s/d ' + (attendanceEndDate || 'Akhir Database')}</span></div>
          </div>
          <div className="space-y-1 text-right flex flex-col items-end">
            <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-36 mr-2">Filter Jam Lembur:</span> <span className="text-gray-800 font-bold uppercase">{attendanceOvertimeFilter === 'all' ? 'Semua' : attendanceOvertimeFilter === 'overtimeOnly' ? 'Hanya Lembur' : 'Tanpa Lembur'}</span></div>
            <div className="flex items-center justify-end"><span className="text-gray-400 font-bold uppercase w-36 mr-2">Indikator Shift Roster:</span> <span className="text-gray-800 font-bold uppercase">{shiftMismatchFilter === 'all' ? 'Semua Roster' : shiftMismatchFilter === 'mismatchOnly' ? 'Ketidaksesuaian' : 'Sesuai Roster'}</span></div>
          </div>
        </div>

        {/* Statistik Ringkasan Data Terpilih */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-3 rounded-lg border border-gray-250">
          <div className="border-r border-gray-300">
            <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Total Log</span>
            <strong className="text-gray-900 text-lg font-black font-mono">{printStats.totalRecords}</strong>
          </div>
          <div className="border-r border-gray-300">
            <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Terlambat</span>
            <strong className="text-rose-700 text-lg font-black font-mono">{printStats.lateCount} <span className="text-[10px] font-normal font-sans text-gray-500">kali</span></strong>
            <p className="text-[8px] text-gray-400 font-semibold leading-none font-mono">({printStats.totalLatenessMins} mnt)</p>
          </div>
          <div className="border-r border-gray-300">
            <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Lembur (Overtime)</span>
            <strong className="text-emerald-700 text-lg font-black font-mono">{printStats.overtimeCount} <span className="text-[10px] font-normal font-sans text-gray-500">log</span></strong>
            <p className="text-[8px] text-gray-400 font-semibold leading-none font-mono">({(printStats.totalOvertimeMins / 60).toFixed(1)} Jam)</p>
          </div>
          <div>
            <span className="block text-gray-500 font-bold mb-0.5 uppercase tracking-wider text-[9px]">Sakit / Cuti / Alpa</span>
            <strong className="text-amber-700 text-lg font-black font-mono">{printStats.sakitCount} / {printStats.leaveCount} / {printStats.alpaCount}</strong>
          </div>
        </div>

        {/* Tabel Data Rekap Kehadiran */}
        <table className="w-full text-xs text-left border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-[9.5px] uppercase tracking-wider text-gray-700 font-bold">
              <th className="p-2 border border-gray-300 text-center w-8">No</th>
              <th className="p-2 border border-gray-300">Karyawan (ID/PIN)</th>
              <th className="p-2 border border-gray-300">Tanggal</th>
              <th className="p-2 border border-gray-300">Shift</th>
              <th className="p-2 border border-gray-300 text-center">In</th>
              <th className="p-2 border border-gray-300 text-center">Out</th>
              <th className="p-2 border border-gray-300">Deviasi Presensi</th>
              <th className="p-2 border border-gray-300">Status</th>
              <th className="p-2 border border-gray-300 text-right">Lembur</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((rec, index) => {
              const emp = employees.find(e => e.id === rec.employeeId);
              const isDayHoliday = holidays.some(h => h.date === rec.date);
              const holidayInfo = holidays.find(h => h.date === rec.date);
              const mismatch = getShiftMismatchDetails(rec.checkIn, rec.checkOut, emp?.shiftPattern || 'Pagi');
              
              const overtimeText = rec.overtimeMinutes !== undefined ? (
                `${(rec.overtimeMinutes / 60).toFixed(1)} Jam (K)`
              ) : (() => {
                const empShift = emp?.shiftPattern || 'Pagi';
                let defaultMins = 0;
                let stdEndMins = 17 * 60;
                if (empShift === 'Siang') stdEndMins = 22 * 60;
                if (empShift === 'Malam') stdEndMins = 6 * 60;

                if (rec.checkOut) {
                  const [outH, outM] = rec.checkOut.split(':').map(Number);
                  let outMins = outH * 60 + outM;
                  if (empShift === 'Malam') {
                    if (outH < 12) {
                      stdEndMins = 6 * 60;
                    } else {
                      stdEndMins = 30 * 60;
                      outMins += 24 * 60;
                    }
                  }
                  const diff = outMins - stdEndMins;
                  if (diff >= 30) {
                    defaultMins = diff;
                  }
                }
                return defaultMins > 0 ? `${(defaultMins / 60).toFixed(1)} Jam` : '-';
              })();

              return (
                <tr key={rec.id} className="border-b border-gray-200">
                  <td className="p-2 border border-gray-200 text-center text-gray-500 font-mono">{index + 1}</td>
                  <td className="p-2 border border-gray-200">
                    <div className="font-bold text-gray-900">{emp?.name || 'Karyawan PIN ' + rec.pin}</div>
                    <div className="text-[9px] text-gray-400 font-mono">ID: {rec.employeeId} · PIN: {rec.pin}</div>
                  </td>
                  <td className="p-2 border border-gray-200">
                    <div>{rec.date}</div>
                    {isDayHoliday && (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded inline-block mt-0.5 font-bold uppercase">
                        {holidayInfo?.name}
                      </span>
                    )}
                  </td>
                  <td className="p-2 border border-gray-200 text-gray-600 font-bold">{emp?.shiftPattern || 'Pagi'}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{rec.checkIn || 'Lupa Tap'}</td>
                  <td className="p-2 border border-gray-200 text-center font-mono">{rec.checkOut || 'Lupa Tap'}</td>
                  <td className="p-2 border border-gray-200">
                    <div className="space-y-0.5 text-[10px]">
                      {rec.lateMinutes > 0 && (
                        <div className="text-amber-700 font-semibold">• Terlambat {rec.lateMinutes} mnt</div>
                      )}
                      {rec.earlyOutMinutes > 0 && (
                        <div className="text-purple-700 font-semibold">• Pulang Cepat {rec.earlyOutMinutes} mnt</div>
                      )}
                      {mismatch && (
                        <div className="text-rose-600 font-black tracking-tight text-[8.5px] uppercase">⚠️ Salah Shift</div>
                      )}
                      {!rec.lateMinutes && !rec.earlyOutMinutes && !mismatch && (
                        <span className="text-center font-mono text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border border-gray-200">
                    <span className="font-extrabold text-[10px] text-slate-800 uppercase">{rec.status}</span>
                  </td>
                  <td className="p-2 border border-gray-200 text-right font-mono font-bold text-emerald-800">{overtimeText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signature Block for HR Validation */}
        <div className="grid grid-cols-2 gap-10 pt-16 border-t border-gray-300 mt-12">
          <div className="text-center space-y-12">
            <div className="space-y-1 w-full">
              <span className="text-[10px] text-gray-400 block tracking-widest font-bold uppercase">DIBUAT OLEH,</span>
              <span className="font-extrabold text-xs block text-gray-800">HRD Officer BPU</span>
            </div>
            <div className="relative inline-block h-12 flex items-center justify-center">
              {/* Simulated QR Validation Stamp */}
              <div className="p-1 border border-emerald-500/20 bg-emerald-50 rounded text-emerald-700 text-[9px] flex items-center gap-1 uppercase font-bold tracking-tight">
                E-Signed &amp; Approved BPU Attendance Sync
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="underline block text-xs font-bold text-gray-900">Siti Aminah, M.Psi.</span>
              <span className="text-[9px] text-gray-500 block">NIP: EMP-003</span>
            </div>
          </div>

          <div className="text-center space-y-12">
            <div className="space-y-1 w-full">
              <span className="text-[10px] text-gray-400 block tracking-widest font-bold uppercase">DISETUJUI OLEH,</span>
              <span className="font-extrabold text-xs block text-gray-800">Direktur Utama PT BPU</span>
            </div>
            <div className="relative inline-block h-12 flex items-center justify-center">
              <div className="w-12 h-12 border border-dashed border-indigo-400 rounded-lg flex flex-col items-center justify-center text-[7px] font-bold text-indigo-700 leading-tight">
                <span>SECURITY</span>
                <span>CERTIFIED</span>
                <span className="text-[8px] font-black">X-100C</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="underline block text-xs font-bold text-gray-900">Budi Santoso, M.B.A.</span>
              <span className="text-[9px] text-gray-500 block">NIP: EMP-002</span>
            </div>
          </div>
        </div>
        
        {/* Printable Footer / watermark */}
        <div className="pt-8 border-t border-dashed text-center text-[10px] text-gray-400 font-mono mt-8">
          &lt;&lt; Dokumen diproses secara elektronik sesuai enkripsi biner sidik jari Solution X-100C &gt;&gt;
        </div>
      </div>
    </div>
  );
}
