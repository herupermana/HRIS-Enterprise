import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, Plus, Edit, Trash, 
  X, Check, Building, FileText, Mail, Phone, Calendar,
  Sliders, ArrowLeft, ArrowRight, Printer, QrCode, CreditCard, Sparkles,
  FolderOpen, UploadCloud, Download, Trash2, Paperclip, Clock, History, Coins, TrendingUp, ShieldAlert,
  Eye, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { Employee, SalaryHistoryRecord, MutationHistoryRecord, ViolationRecord, EmployeeDocument } from '../types';

interface KaryawanProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  salaryHistory: SalaryHistoryRecord[];
  onAddSalaryHistory: (record: SalaryHistoryRecord) => void;
  mutationHistory: MutationHistoryRecord[];
  onAddMutationHistory: (record: MutationHistoryRecord) => void;
  violations?: ViolationRecord[];
}

export default function Karyawan({ 
  employees, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee, 
  salaryHistory, 
  onAddSalaryHistory,
  mutationHistory,
  onAddMutationHistory,
  violations = []
}: KaryawanProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSearchStatus] = useState<string>('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryLogOpen, setIsHistoryLogOpen] = useState(false);
  const [historyActiveTab, setHistoryActiveTab] = useState<'all' | 'mutation' | 'salary'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('filtered');
  const [exportSeparator, setExportSeparator] = useState<',' | ';'>(';');
  const [isExporting, setIsExporting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'form' | 'delete-confirm' | 'id-card' | 'dokumen'>('detail');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Salary Component Config Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    mealTransportAllowance: 50000,
    lateDeductionRate: 5000,
    bpjsKesehatanRate: 1.0,
    bpjsKetenagakerjaanRate: 2.0,
    pph21Rate: 5.0,
  });

  // ID Card Template configuration states
  const [cardTheme, setCardTheme] = useState<'blue' | 'dark' | 'emerald' | 'amber'>('blue');
  const [cardOrientation, setCardOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [companyName, setCompanyName] = useState('PT BIOMETRIC PORTAL UTAMA');
  const [showBarcode, setShowBarcode] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(true);

  const handleOpenWizard = () => {
    const savedMeal = localStorage.getItem('hris_meal_transport_allowance');
    const savedLate = localStorage.getItem('hris_late_deduction_rate');
    const savedBHealth = localStorage.getItem('hris_bpjs_kesehatan_rate');
    const savedBWork = localStorage.getItem('hris_bpjs_ketenagakerjaan_rate');
    const savedTax = localStorage.getItem('hris_pph21_rate');

    setWizardData({
      mealTransportAllowance: savedMeal ? parseInt(savedMeal, 10) : 50000,
      lateDeductionRate: savedLate ? parseInt(savedLate, 10) : 5000,
      bpjsKesehatanRate: savedBHealth ? parseFloat(savedBHealth) : 1.0,
      bpjsKetenagakerjaanRate: savedBWork ? parseFloat(savedBWork) : 2.0,
      pph21Rate: savedTax ? parseFloat(savedTax) : 5.0,
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleSaveWizard = () => {
    localStorage.setItem('hris_meal_transport_allowance', wizardData.mealTransportAllowance.toString());
    localStorage.setItem('hris_late_deduction_rate', wizardData.lateDeductionRate.toString());
    localStorage.setItem('hris_bpjs_kesehatan_rate', wizardData.bpjsKesehatanRate.toString());
    localStorage.setItem('hris_bpjs_ketenagakerjaan_rate', wizardData.bpjsKetenagakerjaanRate.toString());
    localStorage.setItem('hris_pph21_rate', wizardData.pph21Rate.toString());
    
    // Dispatch custom event to notify other modules like Penggajian
    window.dispatchEvent(new Event('hris_salary_config_updated'));
    setIsWizardOpen(false);
  };

  const selectedStatusState = selectedStatus;
  const setSelectedStatus = (val: string) => {
    setSearchStatus(val);
  };

  // Form states
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    pin: '',
    name: '',
    email: '',
    phone: '',
    department: 'IT & Engineering',
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    basicSalary: 4500000,
    allowance: 500000,
    photoUrl: '',
    contractType: 'Tetap',
    contractEndDate: '',
    shiftPattern: 'Pagi'
  });
  const [salaryChangeReason, setSalaryChangeReason] = useState('');
  const [mutationChangeReason, setMutationChangeReason] = useState('');

  // States & Handlers for employee digital documents
  const [docType, setDocType] = useState<'Kontrak Kerja' | 'Sertifikat Pelatihan' | 'KTP/Identitas' | 'NPWP' | 'Ijazah' | 'Lainnya'>('Kontrak Kerja');
  const [customDocName, setCustomDocName] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docUploadProgress, setDocUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [docErrorMessage, setDocErrorMessage] = useState<string | null>(null);

  const handleDocFileUploadProcess = (file: File) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setDocErrorMessage('Berkas terlalu besar! Batas maksimal adalah 15MB.');
      return;
    }

    setDocErrorMessage(null);
    setDocUploadProgress(10);

    const interval = setInterval(() => {
      setDocUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 80);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setTimeout(() => {
        setDocUploadProgress(null);
        if (selectedEmp) {
          const extension = file.name.split('.').pop() || 'pdf';
          const defaultCleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const chosenName = customDocName.trim() || defaultCleanName;
          
          const actualFilename = chosenName.endsWith('.' + extension)
            ? chosenName
            : `${chosenName}.${extension}`;

          const newDoc = {
            id: 'DOC-' + Date.now(),
            name: actualFilename,
            type: docType,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            fileUrl: base64Data,
            notes: docNotes.trim() || undefined
          };

          const oldDocs = selectedEmp.documents || [];
          const updatedEmployee = {
            ...selectedEmp,
            documents: [...oldDocs, newDoc]
          };

          onEditEmployee(updatedEmployee);
          setSelectedEmp(updatedEmployee);

          // Clear inputs
          setCustomDocName('');
          setDocNotes('');
        }
      }, 400);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = (docId: string) => {
    if (!selectedEmp) return;
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini dari profil karyawan?')) {
      const updatedDocs = (selectedEmp.documents || []).filter(doc => doc.id !== docId);
      const updatedEmployee = {
        ...selectedEmp,
        documents: updatedDocs
      };
      
      onEditEmployee(updatedEmployee);
      setSelectedEmp(updatedEmployee);
    }
  };

  const departmentList = [
    'All',
    'IT & Engineering',
    'Human Resources',
    'Finance & Accounting',
    'Operations',
    'Marketing & Sales'
  ];

  // Filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.pin.includes(searchTerm) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleExportCSV = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const listToExport = exportScope === 'filtered' ? filteredEmployees : employees;
      if (listToExport.length === 0) {
        alert("Tidak ada data karyawan yang cocok untuk diekspor!");
        setIsExporting(false);
        return;
      }

      // Headers
      const headers = [
        "NIP / ID Karyawan",
        "PIN Fingerprint",
        "Nama Karyawan",
        "Email",
        "No. Telepon",
        "Departemen / Divisi",
        "Jabatan",
        "Tanggal Join",
        "Status Keaktifan",
        "Gaji Pokok",
        "Tunjangan Tetap",
        "Tipe Kontrak",
        "Tanggal Kontrak Selesai"
      ];

      // Format Rows
      const csvRows = listToExport.map(emp => {
        const rowValues = [
          emp.id,
          emp.pin,
          emp.name,
          emp.email,
          emp.phone,
          emp.department,
          emp.position,
          emp.joinDate,
          emp.status,
          emp.basicSalary.toString(),
          emp.allowance.toString(),
          emp.contractType || 'Tetap',
          emp.contractEndDate || '-'
        ];

        // Escape double quotes and enclose fields in double quotes
        return rowValues.map(value => {
          const stringified = (value || '').trim().replace(/"/g, '""');
          return `"${stringified}"`;
        }).join(exportSeparator);
      });

      // Excel UTF-8 BOM representation (\uFEFF) + sep= separator line
      const separatorDescriptor = `sep=${exportSeparator}\n`;
      const csvContent = "\uFEFF" + separatorDescriptor + [headers.join(exportSeparator), ...csvRows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const stamp = new Date().toISOString().substring(0, 10);
      const scopeLabel = exportScope === 'filtered' ? 'Terfilter' : 'Semua';
      const filename = `Database_Karyawan_${scopeLabel}_${stamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      setIsExportModalOpen(false);
    }, 850);
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      pin: (Math.floor(Math.random() * 9000) + 1000).toString(), // Generate random standard 4 digit PIN
      name: '',
      email: '',
      phone: '',
      department: 'IT & Engineering',
      position: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      basicSalary: 5000000,
      allowance: 1000000,
      photoUrl: '',
      contractType: 'Tetap',
      contractEndDate: '',
      shiftPattern: 'Pagi'
    });
    setSalaryChangeReason('');
    setMutationChangeReason('');
    setActiveTab('form');
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleOpenAdd = () => {
      handleOpenAddModal();
    };
    window.addEventListener('hris_open_add_employee', handleOpenAdd);
    return () => window.removeEventListener('hris_open_add_employee', handleOpenAdd);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenEditModal = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setFormData({
      pin: emp.pin,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      joinDate: emp.joinDate,
      status: emp.status,
      basicSalary: emp.basicSalary,
      allowance: emp.allowance,
      photoUrl: emp.photoUrl || '',
      contractType: emp.contractType || 'Tetap',
      contractEndDate: emp.contractEndDate || '',
      shiftPattern: emp.shiftPattern || 'Pagi'
    });
    setSalaryChangeReason('');
    setMutationChangeReason('');
    setActiveTab('form');
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setActiveTab('detail');
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmp(emp);
    setActiveTab('delete-confirm');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pin || !formData.position) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    // Check duplicate PIN
    const pinExists = employees.some(emp => emp.pin === formData.pin && (!editingEmployee || emp.id !== editingEmployee.id));
    if (pinExists) {
      alert(`PIN Fingerprint "${formData.pin}" sudah digunakan oleh karyawan lain! Tolong berikan PIN unik.`);
      return;
    }

    if (editingEmployee) {
      const isSalaryChanged = editingEmployee.basicSalary !== formData.basicSalary || editingEmployee.allowance !== formData.allowance;
      if (isSalaryChanged) {
        const record: SalaryHistoryRecord = {
          id: `SAL-${Date.now()}`,
          employeeId: editingEmployee.id,
          employeeName: editingEmployee.name,
          changeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          oldBasicSalary: editingEmployee.basicSalary,
          oldAllowance: editingEmployee.allowance,
          newBasicSalary: formData.basicSalary,
          newAllowance: formData.allowance,
          reason: salaryChangeReason || 'Penyesuaian gaji berkala via HR',
          actor: 'herupermana.vps@gmail.com'
        };
        onAddSalaryHistory(record);
      }

      const isMutationChanged = editingEmployee.department !== formData.department || editingEmployee.position !== formData.position;
      if (isMutationChanged) {
        const mutRecord: MutationHistoryRecord = {
          id: `MUT-${Date.now()}`,
          employeeId: editingEmployee.id,
          employeeName: editingEmployee.name,
          changeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          oldDepartment: editingEmployee.department,
          newDepartment: formData.department,
          oldPosition: editingEmployee.position,
          newPosition: formData.position,
          reason: mutationChangeReason || 'Pembaruan posisi atau divisi oleh HR',
          actor: 'herupermana.vps@gmail.com'
        };
        onAddMutationHistory(mutRecord);
      }

      onEditEmployee({
        ...editingEmployee,
        ...formData,
        portalToken: editingEmployee.portalToken || `TOK-${formData.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
      });
    } else {
      const newId = `EMP-0${employees.length + 1}`;
      const generatedToken = `TOK-${formData.name.split(' ')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      onAddEmployee({
        id: newId,
        ...formData,
        portalToken: generatedToken
      });

      // Add baseline salary log for new employee
      const record: SalaryHistoryRecord = {
        id: `SAL-${Date.now()}`,
        employeeId: newId,
        employeeName: formData.name,
        changeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        oldBasicSalary: 0,
        oldAllowance: 0,
        newBasicSalary: formData.basicSalary,
        newAllowance: formData.allowance,
        reason: 'Gaji awal pendaftaran karyawan baru',
        actor: 'herupermana.vps@gmail.com'
      };
      onAddSalaryHistory(record);

      // Add baseline mutation log for new employee
      const mutRecord: MutationHistoryRecord = {
        id: `MUT-${Date.now()}`,
        employeeId: newId,
        employeeName: formData.name,
        changeDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        oldDepartment: '-',
        newDepartment: formData.department,
        oldPosition: '-',
        newPosition: formData.position,
        reason: 'Penempatan jabatan awal karyawan baru',
        actor: 'herupermana.vps@gmail.com'
      };
      onAddMutationHistory(mutRecord);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEmp) {
      onDeleteEmployee(selectedEmp.id);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6" id="karyawan-section">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border border shadow-sm p-4 rounded-2xl" id="karyawan-action-bar">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text" 
              placeholder="Cari karyawan berdasarkan nama, NIP, PIN FP, jabatan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm bg-slate-55 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 font-medium placeholder-slate-400"
              id="employee-search-input"
            />
          </div>

          <div className="flex gap-2.5 shrink-0">
            {/* Dept Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-gray-50 border font-medium text-gray-700 px-3 py-1.5 rounded-xl focus:outline-none transition-colors border-gray-200"
              id="filter-dept-select"
            >
              {departmentList.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'Semua Divisi' : dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-gray-50 border font-medium text-gray-700 px-3 py-1.5 rounded-xl focus:outline-none transition-colors border-gray-200"
              id="filter-status-select"
            >
              <option value="All">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsHistoryLogOpen(true)}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 text-amber-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            id="btn-master-history-log"
            title="Lihat semua riwayat mutasi, promosi, dan perubahan gaji karyawan secara serentak"
          >
            <Clock className="w-4 h-4 text-amber-600" /> Semua Riwayat
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-emerald-800 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            id="btn-export-employees"
            title="Ekspor Database Karyawan ke format CSV / Excel secara instan"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Ekspor Data
          </button>

          <button
            onClick={handleOpenWizard}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            id="btn-salary-wizard"
          >
            <Sliders className="w-4 h-4 text-blue-600" /> Standar Komponen Gaji
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            id="btn-add-employee"
          >
            <Plus className="w-4 h-4" /> Karyawan Baru
          </button>
        </div>
      </div>

      {/* Grid List Karyawan */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center" id="employees-empty-state">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 font-medium text-sm">Tidak ditemukan karyawan dengan filter pencarian tersebut.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id="employees-grid-list"
        >
          {filteredEmployees.map((emp) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key={emp.id}
              onClick={() => handleOpenDetailModal(emp)}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              id={`emp-card-${emp.id}`}
            >
              <div className="p-5 flex gap-4">
                <div className="relative flex-shrink-0">
                  {emp.photoUrl ? (
                    <img 
                      src={emp.photoUrl} 
                      alt={emp.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-bold text-lg flex items-center justify-center rounded-2xl border border-blue-100">
                      {emp.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full border border-white font-bold ${
                    emp.status === 'Aktif' ? 'bg-blue-100 text-blue-800' :
                    emp.status === 'Cuti' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-950 group-hover:text-blue-600 transition-colors text-sm truncate">{emp.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{emp.id} · PIN FP: <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded font-bold">{emp.pin}</span></p>
                  <p className="text-xs font-semibold text-gray-700 mt-2 truncate flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {emp.department}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-1 font-medium">{emp.position}</p>

                  {/* Contract Type Indicator on Cards */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-tight border ${
                      !emp.contractType || emp.contractType === 'Tetap' ? 'bg-slate-50 text-slate-600 border-slate-150' :
                      emp.contractType === 'Magang' ? 'bg-indigo-50/70 text-indigo-700 border-indigo-150/40' :
                      'bg-orange-50/70 text-orange-700 border-orange-150/40'
                    }`}>
                      {emp.contractType || 'Tetap'}
                    </span>
                    {emp.activeSP && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border uppercase ring-2 ring-transparent tracking-wide cursor-help flex items-center gap-1 ${
                        emp.activeSP === 'SP3' ? 'bg-rose-150 text-rose-800 border-rose-350 shadow-xs ring-rose-200/50' :
                        emp.activeSP === 'SP2' ? 'bg-amber-150 text-amber-905 border-amber-300' :
                        'bg-yellow-150 text-yellow-900 border-yellow-300'
                      }`} title="Sanksi Surat Peringatan Disiplin Aktif">
                        ⚠️ {emp.activeSP}
                      </span>
                    )}
                    {emp.contractType && emp.contractType !== 'Tetap' && emp.contractEndDate && (
                      (() => {
                        const getToday = () => {
                          const now = new Date();
                          if (now.getFullYear() === 2026) return now;
                          return new Date('2026-06-11');
                        };
                        const today = getToday();
                        const end = new Date(emp.contractEndDate);
                        const diffTime = end.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                          return <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-rose-50 text-rose-700 border border-rose-150/40">Habis</span>;
                        } else if (diffDays <= 30) {
                          return <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-amber-50 text-amber-700 border border-amber-150/40 animate-pulse">{diffDays} hari lagi!</span>;
                        } else {
                          return <span className="text-[10px] px-2 py-0.5 rounded-md font-medium text-slate-400">{diffDays} hari lagi</span>;
                        }
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Join: {emp.joinDate}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => handleOpenEditModal(emp, e)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Profil"
                    id={`btn-edit-${emp.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteConfirm(emp, e)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-lg transition-colors"
                    title="Hapus Karyawan"
                    id={`btn-delete-${emp.id}`}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Multipurpose detail, edit, and delete employee popup modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`bg-white border text-gray-800 rounded-2xl overflow-hidden shadow-xl w-full flex flex-col max-h-[95vh] md:max-h-[90vh] transition-all duration-300 ${
                activeTab === 'id-card' || activeTab === 'dokumen' ? 'max-w-4xl' : 'max-w-lg'
              }`}
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2" id="employee-modal-title">
                  {activeTab === 'detail' && 'Profil Detail Karyawan'}
                  {activeTab === 'dokumen' && 'Dokumen Kerja & Sertifikasi Karyawan'}
                  {activeTab === 'form' && (editingEmployee ? 'Edit Data Karyawan' : 'Daftar Karyawan Baru')}
                  {activeTab === 'delete-confirm' && 'Konfirmasi Penghapusan'}
                  {activeTab === 'id-card' && 'Generator Cetak ID Card Karyawan'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                  id="btn-close-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TAB SELECTOR IN PROFILE DIALOG */}
              {(activeTab === 'detail' || activeTab === 'id-card' || activeTab === 'dokumen') && selectedEmp && (
                <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 pt-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('detail')}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                      activeTab === 'detail'
                        ? 'border-blue-600 text-blue-600 font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Profil Utama
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dokumen')}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                      activeTab === 'dokumen'
                        ? 'border-blue-600 text-blue-600 font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                    }`}
                    id="tab-karyawan-dokumen"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Dokumen Digital
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('id-card')}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                      activeTab === 'id-card'
                        ? 'border-blue-600 text-blue-600 font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> ID Card Generator
                  </button>
                </div>
              )}

              <div className="p-6 overflow-y-auto space-y-4">
                {/* 1. VIEW DETAILED PROFIL */}
                {activeTab === 'detail' && selectedEmp && (
                  <div className="space-y-6" id="emp-detail-view">
                    <div className="flex items-center gap-4">
                      {selectedEmp.photoUrl ? (
                        <img 
                          src={selectedEmp.photoUrl} 
                          alt={selectedEmp.name} 
                          className="w-20 h-20 rounded-2xl border border-slate-200 object-cover shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-blue-50 text-blue-800 border border-blue-100 rounded-2xl font-bold text-2xl flex items-center justify-center shadow-inner">
                          {selectedEmp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg leading-snug">{selectedEmp.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">NIP: {selectedEmp.id} · PIN FP: <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded font-bold">{selectedEmp.pin}</span></p>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          selectedEmp.status === 'Aktif' ? 'bg-blue-100 text-blue-800' :
                          selectedEmp.status === 'Cuti' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {selectedEmp.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Divisi / Departemen</span>
                        <p className="font-bold text-slate-800">{selectedEmp.department}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Jabatan</span>
                        <p className="font-bold text-slate-800">{selectedEmp.position}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Email Kantor</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedEmp.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Telepon</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedEmp.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Tanggal Bergabung</span>
                        <p className="font-bold text-slate-800 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedEmp.joinDate}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Sistem Penjaringan & Shift</span>
                        <p className="font-bold text-blue-700 flex items-center gap-1">
                          <span>Solution Biometric ·</span>
                          <span className="bg-amber-50 text-amber-800 border border-amber-150 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Shift {selectedEmp.shiftPattern || 'Pagi'}</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium">Informasi Kontrak Kerja</span>
                        <p className="font-bold text-slate-800 flex flex-wrap items-center gap-1">
                          <span>{selectedEmp.contractType || 'Tetap'}</span>
                          {selectedEmp.contractType && selectedEmp.contractType !== 'Tetap' && selectedEmp.contractEndDate && (
                            (() => {
                              const getToday = () => {
                                const now = new Date();
                                if (now.getFullYear() === 2026) return now;
                                return new Date('2026-06-11');
                              };
                              const today = getToday();
                              const end = new Date(selectedEmp.contractEndDate);
                              const diffTime = end.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (diffDays < 0) {
                                return <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-black border border-rose-250">KONTRAK HABIS</span>;
                              } else if (diffDays <= 30) {
                                return <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-black border border-amber-250 animate-pulse">Berakhir {diffDays} Hari Lagi!</span>;
                              } else {
                                return <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-bold border border-green-250">{diffDays} hari tersisa</span>;
                              }
                            })()
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-rose-500 font-extrabold flex items-center gap-1">🔑 Token Portal Karyawan</span>
                        <p className="font-mono font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block text-[11px] select-all cursor-pointer" title="Klik untuk menyalin token">
                          {selectedEmp.portalToken || `TOK-${selectedEmp.name.split(' ')[0].toUpperCase()}-112`}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3 bg-gray-50 rounded-xl p-4">
                      <h5 className="text-xs font-extrabold text-gray-800">Struktur Keuangan &amp; Remunerasi</h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-gray-400">Gaji Pokok Utama:</span>
                          <p className="font-bold text-gray-800">Rp {selectedEmp.basicSalary.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400">Tunjangan Operasional:</span>
                          <p className="font-bold text-gray-800">Rp {selectedEmp.allowance.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Riwayat Perubahan Gaji */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Riwayat Perubahan Gaji</h5>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                          {salaryHistory.filter(h => h.employeeId === selectedEmp.id).length} Catatan
                        </span>
                      </div>
                      
                      {salaryHistory.filter(h => h.employeeId === selectedEmp.id).length === 0 ? (
                        <div className="bg-slate-50 border border-dashed rounded-xl p-4 text-center text-slate-400 text-[11px] font-medium">
                          Belum ada riwayat perubahan gaji yang tercatat.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {salaryHistory
                            .filter(h => h.employeeId === selectedEmp.id)
                            .sort((a, b) => b.id.localeCompare(a.id)) // Sort by ID/time descending
                            .map((h) => {
                              const salaryDiff = h.newBasicSalary - h.oldBasicSalary;
                              const allowanceDiff = h.newAllowance - h.oldAllowance;
                              
                              return (
                                <div key={h.id} className="p-3 bg-slate-50/50 border border-slate-205 rounded-xl space-y-2 text-[11px]" id={`salary-history-row-${h.id}`}>
                                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                                    <span className="font-semibold font-mono">{h.changeDate}</span>
                                    <span className="font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={h.actor}>{h.actor.split('@')[0]}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                                    <div className="bg-white p-1.5 rounded border border-slate-100">
                                      <span className="text-[9px] text-slate-400 block font-medium">Gaji Pokok:</span>
                                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                        {h.oldBasicSalary > 0 && (
                                          <>
                                            <span className="line-through text-slate-400 font-mono">Rp {h.oldBasicSalary.toLocaleString('id-ID')}</span>
                                            <span className="text-slate-450">→</span>
                                          </>
                                        )}
                                        <span className="font-extrabold text-slate-800 font-mono">Rp {h.newBasicSalary.toLocaleString('id-ID')}</span>
                                        {salaryDiff !== 0 && h.oldBasicSalary > 0 && (
                                          <span className={`text-[9px] font-extrabold ${salaryDiff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ({salaryDiff > 0 ? '+' : ''}{salaryDiff.toLocaleString('id-ID')})
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-white p-1.5 rounded border border-slate-100">
                                      <span className="text-[9px] text-slate-400 block font-medium">Tunjangan Tetap:</span>
                                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                        {h.oldAllowance > 0 && (
                                          <>
                                            <span className="line-through text-slate-400 font-mono">Rp {h.oldAllowance.toLocaleString('id-ID')}</span>
                                            <span className="text-slate-450">→</span>
                                          </>
                                        )}
                                        <span className="font-extrabold text-slate-800 font-mono">Rp {h.newAllowance.toLocaleString('id-ID')}</span>
                                        {allowanceDiff !== 0 && h.oldAllowance > 0 && (
                                          <span className={`text-[9px] font-extrabold ${allowanceDiff > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            ({allowanceDiff > 0 ? '+' : ''}{allowanceDiff.toLocaleString('id-ID')})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-slate-500 bg-[#f8fafc] px-2 py-1.5 rounded border border-slate-100 leading-relaxed italic">
                                    &ldquo;{h.reason}&rdquo;
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Riwayat Mutasi Jabatan & Divisi */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Riwayat Mutasi Jabatan &amp; Divisi</h5>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                          {mutationHistory.filter(h => h.employeeId === selectedEmp.id).length} Catatan
                        </span>
                      </div>
                      
                      {mutationHistory.filter(h => h.employeeId === selectedEmp.id).length === 0 ? (
                        <div className="bg-slate-50 border border-dashed rounded-xl p-4 text-center text-slate-400 text-[11px] font-medium">
                          Belum ada riwayat mutasi jabatan atau divisi yang tercatat.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {mutationHistory
                            .filter(h => h.employeeId === selectedEmp.id)
                            .sort((a, b) => b.id.localeCompare(a.id)) // Sort by ID/time descending
                            .map((h) => {
                              const deptChanged = h.oldDepartment !== h.newDepartment;
                              const posChanged = h.oldPosition !== h.newPosition;
                              
                              return (
                                <div key={h.id} className="p-3 bg-slate-50/50 border border-slate-205 rounded-xl space-y-2 text-[11px]" id={`mutation-history-row-${h.id}`}>
                                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                                    <span className="font-semibold font-mono">{h.changeDate}</span>
                                    <span className="font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={h.actor}>{h.actor.split('@')[0]}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                                    <div className="bg-white p-1.5 rounded border border-slate-100">
                                      <span className="text-[9px] text-slate-405 block font-medium">Divisi / Departemen:</span>
                                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                        {h.oldDepartment && h.oldDepartment !== '-' ? (
                                          <>
                                            <span className="line-through text-slate-400">{h.oldDepartment}</span>
                                            <span className="text-slate-450">&rarr;</span>
                                          </>
                                        ) : h.oldDepartment === '-' ? (
                                          <span className="text-slate-400 italic">Baru</span>
                                        ) : null}
                                        <span className={`font-extrabold ${deptChanged ? 'text-blue-700' : 'text-slate-800'}`}>{h.newDepartment}</span>
                                      </div>
                                    </div>

                                    <div className="bg-white p-1.5 rounded border border-slate-100">
                                      <span className="text-[9px] text-slate-405 block font-medium">Jabatan / Posisi:</span>
                                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                        {h.oldPosition && h.oldPosition !== '-' ? (
                                          <>
                                            <span className="line-through text-slate-400">{h.oldPosition}</span>
                                            <span className="text-slate-450">&rarr;</span>
                                          </>
                                        ) : h.oldPosition === '-' ? (
                                          <span className="text-slate-400 italic">Baru</span>
                                        ) : null}
                                        <span className={`font-extrabold ${posChanged ? 'text-amber-700' : 'text-slate-800'}`}>{h.newPosition}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-slate-500 bg-[#f8fafc] px-2 py-1.5 rounded border border-slate-100 leading-relaxed italic">
                                    &ldquo;{h.reason}&rdquo;
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Riwayat Pelanggaran & Sanksi (SP) */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-500" /> Riwayat Sanksi Disiplin (SP)
                        </h5>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                          {violations.filter(v => v.employeeId === selectedEmp.id).length} Catatan
                        </span>
                      </div>
                      
                      {violations.filter(v => v.employeeId === selectedEmp.id).length === 0 ? (
                        <div className="bg-slate-50 border border-dashed rounded-xl p-4 text-center text-slate-400 text-[11px] font-medium">
                          Sempurna! Bersih dari segala sanksi disiplin dan pelanggaran kehadiran.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {violations
                            .filter(v => v.employeeId === selectedEmp.id)
                            .sort((a, b) => b.issuedDate.localeCompare(a.issuedDate))
                            .map((v) => {
                              return (
                                <div key={v.id} className="p-3 bg-rose-50/10 border border-slate-205 rounded-xl space-y-2 text-[11px]" id={`violation-history-row-${v.id}`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider ${
                                        v.severity === 'SP3' ? 'bg-rose-100 text-rose-805 border-rose-250 shadow-2xs animate-pulse' :
                                        v.severity === 'SP2' ? 'bg-amber-100 text-amber-850 border-amber-250' :
                                        'bg-yellow-101 text-yellow-905 border-yellow-250'
                                      }`}>
                                        {v.severity}
                                      </span>
                                      <span className="font-extrabold text-slate-750 shrink-0">{v.violationType}</span>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 font-bold rounded-md uppercase border ${
                                      v.status === 'Aktif' ? 'bg-rose-500/10 text-rose-600 border-rose-200/40' :
                                      v.status === 'Dicabut' ? 'bg-indigo-50/15 text-indigo-600 border-indigo-200/40' :
                                      'bg-slate-100 text-slate-500 border-slate-250'
                                    }`}>
                                      {v.status}
                                    </span>
                                  </div>

                                  <div className="text-slate-650 bg-white/40 p-2 rounded-lg border border-slate-100 leading-relaxed">
                                    <p className="font-medium">{v.description}</p>
                                    {v.punishmentEffect && (
                                      <p className="text-[10px] text-rose-600 font-extrabold mt-1.5 border-t border-slate-105/50 pt-1 flex items-center gap-1">
                                        📌 Konsekuensi: <span className="font-semibold text-slate-700">{v.punishmentEffect}</span>
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center text-slate-400 text-[10px] pt-1 border-t border-slate-50">
                                    <span>TMT: <strong className="font-bold text-slate-500">{v.issuedDate}</strong> s/d {v.expiryDate}</span>
                                    <span>Oleh: {v.approvedBy.split('@')[0]}</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Tutup Profil
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('id-card')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        id="btn-goto-idcard"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Hasilkan ID Card
                      </button>
                    </div>
                  </div>
                )}

                {/* 1.5 DIGITAL DOCUMENTS TAB (DOKUMEN) */}
                {activeTab === 'dokumen' && selectedEmp && (
                  <div className="space-y-6" id="emp-documents-tab">
                    
                    {/* Metrics Overview Headers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-blue-50/50 border border-blue-105 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Dokumen</span>
                          <strong className="text-sm font-black text-slate-800">{(selectedEmp.documents || []).length} Berkas</strong>
                        </div>
                      </div>

                      <div className="bg-emerald-50/50 border border-emerald-105 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Kontrak Kerja</span>
                          <strong className="text-sm font-black text-slate-800">{(selectedEmp.documents || []).filter(d => d.type === 'Kontrak Kerja').length} Kontrak</strong>
                        </div>
                      </div>

                      <div className="bg-amber-50/50 border border-amber-105 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sertifikasi &amp; Lainnya</span>
                          <strong className="text-sm font-black text-slate-800">{(selectedEmp.documents || []).filter(d => d.type !== 'Kontrak Kerja').length} Berkas</strong>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      
                      {/* Left: Document Upload Panel */}
                      <div className="lg:col-span-2 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6 text-xs">
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-3">
                          <UploadCloud className="w-4 h-4 text-blue-600" /> Unggah Dokumen Digital
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-500 font-bold mb-1">Kategori Dokumen *</label>
                            <select
                              value={docType}
                              onChange={(e) => setDocType(e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="Kontrak Kerja">Kontrak Kerja (PKWT/PKWTT)</option>
                              <option value="Sertifikat Pelatihan">Sertifikat Pelatihan &amp; Kompetensi</option>
                              <option value="KTP/Identitas">KTP / Kartu Identitas</option>
                              <option value="NPWP">NPWP / Perpajakan</option>
                              <option value="Ijazah">Ijazah Akhir</option>
                              <option value="Lainnya">Dokumen / Berkas Pendukung Lainnya</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-500 font-bold mb-1">Nama Dokumen Kustom (Opsional)</label>
                            <input
                              type="text"
                              value={customDocName}
                              onChange={(e) => setCustomDocName(e.target.value)}
                              placeholder="cth: Sertifikat AWS Cloud Practitioner"
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 font-bold mb-1">Catatan Administrasi Khusus (Opsional)</label>
                            <textarea
                              rows={2}
                              value={docNotes}
                              onChange={(e) => setDocNotes(e.target.value)}
                              placeholder="Keterangan isi file, tanggal validasi atau instruksi perpanjangan dari HR."
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                            />
                          </div>

                          {/* DRAG AND DROP ZONE */}
                          <div>
                            <label className="block text-slate-500 font-bold mb-1.5">Unggah Berkas File PDF / Gambar</label>
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOver(true);
                              }}
                              onDragLeave={() => setIsDragOver(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragOver(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleDocFileUploadProcess(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => document.getElementById('doc-file-input')?.click()}
                              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                                isDragOver 
                                  ? 'border-blue-500 bg-blue-50/40 text-blue-800' 
                                  : 'border-slate-300 hover:bg-slate-50/50 text-slate-500 hover:border-slate-400'
                              }`}
                            >
                              <Paperclip className="w-6 h-6 text-slate-400" />
                              <div>
                                <p className="font-extrabold text-slate-700 text-[11px]">Seret &amp; Letakkan berkas atau <span className="text-blue-600 underline">Pilih File</span></p>
                                <p className="text-[10px] text-slate-400 mt-1">Mendukung file PDF, PNG, JPG (Maks. 15MB)</p>
                              </div>
                              <input
                                type="file"
                                id="doc-file-input"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocFileUploadProcess(e.target.files[0]);
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Upload Progress Bar Indicator */}
                          {docUploadProgress !== null && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5">
                              <div className="flex justify-between font-bold text-[10px] text-blue-800">
                                <span className="flex items-center gap-1"><span className="animate-spin text-xs">🌀</span> Membaca &amp; Mengamankan Berkas...</span>
                                <span>{docUploadProgress}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${docUploadProgress}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Error Zone Indicator */}
                          {docErrorMessage && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-bold leading-normal">
                              ⚠️ {docErrorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Existing Documents Panel */}
                      <div className="lg:col-span-3 space-y-3 flex flex-col">
                        <div className="flex items-center justify-between mb-1 shrink-0">
                          <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <FolderOpen className="w-4 h-4 text-emerald-600" /> Repositori Dokumen Tersimpan
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                            {(selectedEmp.documents || []).length} Berkas Digital
                          </span>
                        </div>

                        {/* Document Items Scroll list */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
                          {(!selectedEmp.documents || selectedEmp.documents.length === 0) ? (
                            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3 bg-slate-50/30">
                              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                              <div className="space-y-1">
                                <p className="font-black text-slate-700 text-xs">Belum Ada Dokumen Tersimpan</p>
                                <p className="text-slate-400 text-[10px] max-w-xs mx-auto leading-relaxed">Pihak HR belum mengunggah salinan kontrak kerja, berkas KTP, maupun sertifikasi kompetensi untuk karyawan ini.</p>
                              </div>
                            </div>
                          ) : (
                            selectedEmp.documents.map((doc) => {
                              // Define styles and badges based on document type
                              const config = (() => {
                                switch (doc.type) {
                                  case 'Kontrak Kerja':
                                    return {
                                      border: 'border-l-blue-500',
                                      bg: 'bg-blue-50 text-blue-700',
                                      labelBg: 'bg-blue-100 text-blue-800'
                                    };
                                  case 'Sertifikat Pelatihan':
                                    return {
                                      border: 'border-l-amber-500',
                                      bg: 'bg-amber-50 text-amber-700',
                                      labelBg: 'bg-amber-100 text-amber-800'
                                    };
                                  case 'KTP/Identitas':
                                  case 'NPWP':
                                    return {
                                      border: 'border-l-indigo-500',
                                      bg: 'bg-indigo-50 text-indigo-700',
                                      labelBg: 'bg-indigo-100 text-indigo-800'
                                    };
                                  default:
                                    return {
                                      border: 'border-l-slate-400',
                                      bg: 'bg-slate-100 text-slate-700',
                                      labelBg: 'bg-slate-200 text-slate-800'
                                    };
                                }
                              })();

                              // Compute robust fileUrl download for safety
                              const downloadUrl = doc.fileUrl && doc.fileUrl !== '#' 
                                ? doc.fileUrl 
                                : 'data:text/plain;charset=utf-8,' + encodeURIComponent(
                                    `=== PT BIOMETRIC PORTAL UTAMA INDONESIA ===\n\n` +
                                    `BERKAS DIGITAL RESMI HR\n` +
                                    `---------------------------------------------\n` +
                                    `Nama Dokumen    : ${doc.name}\n` +
                                    `Tipe Dokumen    : ${doc.type}\n` +
                                    `Karyawan Terkait: ${selectedEmp.name} (NIP: ${selectedEmp.id})\n` +
                                    `Divisi / Posisi : ${selectedEmp.department} / ${selectedEmp.position}\n` +
                                    `Tanggal Unggah  : ${doc.uploadDate}\n` +
                                    `Ukuran Berkas   : ${doc.fileSize}\n` +
                                    `Status Keamanan : Terverifikasi Kode Enskripsi Aman SSL PT BPU\n\n` +
                                    `Catatan Administrasi:\n` +
                                    `${doc.notes || 'Tidak ada catatan tambahan.'}\n\n` +
                                    `---------------------------------------------\n` +
                                    `Keabsahan berkas dijamin sepenuhnya secara internal oleh Manajemen Sumber Daya Manusia.`
                                  );

                              return (
                                <div
                                  key={doc.id}
                                  className={`p-3 bg-white border border-slate-200 rounded-xl flex gap-3 items-start justify-between hover:border-slate-300 transition-all border-l-4 ${config.border}`}
                                >
                                  <div className="flex gap-2.5 items-start min-w-0">
                                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                                      <FileText className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="space-y-1 min-w-0 text-left">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-slate-800 text-[11px] truncate block max-w-[200px]" title={doc.name}>{doc.name}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase shrink-0 ${config.labelBg}`}>
                                          {doc.type}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                                        <span>Diunggah: {doc.uploadDate}</span>
                                        <span>·</span>
                                        <span className="bg-slate-50 px-1 rounded border text-slate-500 font-bold">{doc.fileSize}</span>
                                      </div>
                                      {doc.notes && (
                                        <p className="text-[10px] text-slate-500 bg-slate-50/55 p-1.5 rounded border border-slate-100 italic leading-relaxed mt-1">
                                          &ldquo;{doc.notes}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewDoc(doc);
                                        setPreviewZoom(100);
                                      }}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-600 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer"
                                      title="Pratinjau Dokumen"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <a
                                      href={downloadUrl}
                                      download={doc.name}
                                      className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg transition-all flex items-center justify-center shrink-0 font-bold"
                                      title="Download / Buka Berkas Digital"
                                    >
                                      <Download className="w-3.5 h-3.5 text-blue-600" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDoc(doc.id)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-lg transition-all flex items-center justify-center shrink-0"
                                      title="Hapus Dokumen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Close Modal button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Tutup Profil
                      </button>
                    </div>

                  </div>
                )}

                {/* 2. ADD & EDIT PROFIL FORM */}
                {activeTab === 'form' && (
                  <form onSubmit={handleSave} className="space-y-4 text-xs" id="emp-form-fields">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">PIN Solution X-100C *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="PIN Template di Mesin"
                            value={formData.pin}
                            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-mono text-blue-700 font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Harus sama dengan ID jari yang di-enroll di mesin</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Divisi / Departemen *</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        >
                          <option value="IT & Engineering">IT & Engineering</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Finance & Accounting">Finance & Accounting</option>
                          <option value="Operations">Operations</option>
                          <option value="Marketing & Sales">Marketing & Sales</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Nama Jabatan *</label>
                        <input
                          type="text"
                          required
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                    </div>

                    {editingEmployee && (editingEmployee.department !== formData.department || editingEmployee.position !== formData.position) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-blue-50/70 p-3 rounded-xl border border-blue-150 space-y-1.5"
                      >
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-blue-800">
                          Alasan Mutasi / Promosi Jabatan &amp; Divisi *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan alasan mutasi (misal: Promosi Kerja, Rotasi Departemen, Penugasan Khusus)"
                          value={mutationChangeReason}
                          onChange={(e) => setMutationChangeReason(e.target.value)}
                          className="w-full bg-white border border-blue-250 py-1.5 px-3 rounded-lg text-blue-900 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none placeholder-blue-350"
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Email Kerja</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Nomor Handphone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Gaji Pokok Utama (Rp) *</label>
                        <input
                          type="number"
                          required
                          value={formData.basicSalary}
                          onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Tunjangan Tetap (Rp) *</label>
                        <input
                          type="number"
                          required
                          value={formData.allowance}
                          onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                    </div>

                    {editingEmployee && (editingEmployee.basicSalary !== formData.basicSalary || editingEmployee.allowance !== formData.allowance) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-amber-50/70 p-3 rounded-xl border border-amber-150 space-y-1.5"
                      >
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-amber-800">
                          Alasan Penyesuaian Remunerasi *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan alasan penyesuaian (misal: Promosi Kerja, KGB, Penyesuaian Inflasi)"
                          value={salaryChangeReason}
                          onChange={(e) => setSalaryChangeReason(e.target.value)}
                          className="w-full bg-white border border-amber-250 py-1.5 px-3 rounded-lg text-amber-900 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none placeholder-amber-400"
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Tanggal Bergabung *</label>
                        <input
                          type="date"
                          required
                          value={formData.joinDate}
                          onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Status Karyawan *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full bg-gray-50 border p-2 rounded-lg"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Cuti">Cuti</option>
                          <option value="Nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Tipe Kontrak *</label>
                        <select
                          value={formData.contractType || 'Tetap'}
                          onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any, contractEndDate: e.target.value === 'Tetap' ? '' : formData.contractEndDate })}
                          className="w-full bg-gray-50 border p-2 rounded-lg text-xs font-semibold"
                        >
                          <option value="Tetap">Tetap (Permanent)</option>
                          <option value="Kontrak">Kontrak (Contract)</option>
                          <option value="Magang">Magang (Internship)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          Tanggal Akhir Kontrak {formData.contractType !== 'Tetap' && '*'}
                        </label>
                        <input
                          type="date"
                          disabled={formData.contractType === 'Tetap'}
                          required={formData.contractType !== 'Tetap'}
                          value={formData.contractEndDate || ''}
                          onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                          className={`w-full border p-2 rounded-lg text-xs ${formData.contractType === 'Tetap' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-850'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Pola Shift Kerja *</label>
                        <select
                          value={formData.shiftPattern || 'Pagi'}
                          onChange={(e) => setFormData({ ...formData, shiftPattern: e.target.value as any })}
                          className="w-full bg-gray-50 border p-2 rounded-lg text-xs font-semibold text-slate-800"
                        >
                          <option value="Pagi">Shift Pagi (08:00 - 17:00)</option>
                          <option value="Siang">Shift Siang (14:00 - 22:00)</option>
                          <option value="Malam">Shift Malam (22:00 - 06:00)</option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">Digunakan untuk validasi log absensi Solution X-100C.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Foto Profil URL (Opsional)</label>
                        <input
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          value={formData.photoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">Token Portal Karyawan (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Contoh: TOK-HERU-123 (Auto)"
                          value={formData.portalToken || ''}
                          onChange={(e) => setFormData({ ...formData, portalToken: e.target.value })}
                          className="w-full bg-gray-50 border p-2 rounded-lg text-xs font-mono text-rose-700 font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl shadow-sm transition-colors font-semibold cursor-pointer"
                        id="btn-save-employee-form"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. CONFIRM DELETE */}
                {activeTab === 'delete-confirm' && selectedEmp && (
                  <div className="space-y-4" id="emp-delete-form">
                    <p className="text-gray-600 text-sm">
                      Apakah Anda benar-benar yakin ingin menghapus data karyawan <strong>{selectedEmp.name}</strong> ({selectedEmp.id})? 
                      Semua histori absensi dan penggajian yang berkaitan dengannya juga akan dihapus secara permanen dari sistem.
                    </p>
                    <div className="pt-4 border-t flex justify-end gap-2">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                        id="btn-confirm-delete"
                      >
                        Hapus Permanen
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. ID CARD TEMPLATE GENERATOR */}
                {activeTab === 'id-card' && selectedEmp && (
                  <div className="space-y-6" id="emp-idcard-generator-tab">
                    <div className="flex flex-col md:flex-row gap-6">
                      
                      {/* Left: Customizer Panel */}
                      <div className="w-full md:w-72 shrink-0 space-y-4 border-r border-slate-100 pr-0 md:pr-6 md:pb-0 pb-6 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Pilih Desain Tema</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCardTheme('blue')}
                              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                cardTheme === 'blue' 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-extrabold shadow-sm' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm" />
                              Royal Blue
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardTheme('dark')}
                              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                cardTheme === 'dark' 
                                  ? 'border-slate-800 bg-slate-900 text-white font-extrabold shadow-sm' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-700 to-zinc-900 shadow-sm" />
                              Solid Dark
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardTheme('emerald')}
                              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                cardTheme === 'emerald' 
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm" />
                              Bio Emerald
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardTheme('amber')}
                              className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                cardTheme === 'amber' 
                                  ? 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold shadow-sm' 
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm" />
                              Warm Amber
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Orientasi Kartu</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCardOrientation('portrait')}
                              className={`p-2 rounded-xl border font-bold transition-all text-center ${
                                cardOrientation === 'portrait'
                                  ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                                  : 'border-slate-205 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              Tegak (Portrait)
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardOrientation('landscape')}
                              className={`p-2 rounded-xl border font-bold transition-all text-center ${
                                cardOrientation === 'landscape'
                                  ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                                  : 'border-slate-205 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              Mendatar (Landscape)
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Nama Perusahaan / Organisasi</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ganti nama perusahaan..."
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-850 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="block text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Opsi Tambahan</label>
                          
                          <label className="flex items-center gap-2 cursor-pointer py-1 font-semibold text-slate-705 text-[11px]">
                            <input
                              type="checkbox"
                              checked={showBarcode}
                              onChange={(e) => setShowBarcode(e.target.checked)}
                              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer rounded"
                            />
                            Tampilkan Simulasi Barcode NIP
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer py-1 font-semibold text-slate-705 text-[11px]">
                            <input
                              type="checkbox"
                              checked={showGuidelines}
                              onChange={(e) => setShowGuidelines(e.target.checked)}
                              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer rounded"
                            />
                            Tampilkan Panduan Keamanan RFID
                          </label>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-105/30 text-[10px] text-blue-800 leading-relaxed rounded-xl font-medium">
                          💡 <strong>Mode Cetak Cepat:</strong> Menekan tombol cetak akan otomatis mengekspor kartu ke printer dengan resolusi tinggi, siap cetak ke bahan PVC atau Kertas Foto tebal.
                        </div>
                      </div>

                      {/* Right: Live Visual Preview */}
                      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100/50 border border-dashed border-slate-200 p-6 rounded-2xl min-h-[460px] overflow-x-auto">
                        
                        {/* Theme Classes Mapping */}
                        {(() => {
                          const themeColors = {
                            blue: {
                              bg: 'bg-gradient-to-tr from-blue-600 to-indigo-805',
                              border: 'border-blue-600',
                              text: 'text-blue-720',
                              badge: 'bg-blue-50/80 text-blue-800 border-blue-100',
                              barAccent: 'bg-blue-600',
                              glow: 'shadow-blue-200'
                            },
                            dark: {
                              bg: 'bg-gradient-to-tr from-slate-800 to-zinc-950',
                              border: 'border-slate-800',
                              text: 'text-slate-800',
                              badge: 'bg-slate-50 text-slate-850 border-slate-200',
                              barAccent: 'bg-slate-800',
                              glow: 'shadow-slate-350'
                            },
                            emerald: {
                              bg: 'bg-gradient-to-tr from-emerald-600 to-teal-850',
                              border: 'border-emerald-600',
                              text: 'text-emerald-700',
                              badge: 'bg-emerald-50/80 text-emerald-800 border-emerald-100',
                              barAccent: 'bg-emerald-605',
                              glow: 'shadow-emerald-200'
                            },
                            amber: {
                              bg: 'bg-gradient-to-tr from-amber-500 to-orange-650',
                              border: 'border-amber-500',
                              text: 'text-amber-700',
                              badge: 'bg-amber-50/80 text-amber-805 border-amber-100',
                              barAccent: 'bg-amber-500',
                              glow: 'shadow-amber-200'
                            }
                          };

                          const activeTheme = themeColors[cardTheme];

                          return (
                            <div className={`flex flex-col xl:flex-row items-center gap-6 ${cardOrientation === 'landscape' ? 'xl:flex-col' : ''}`}>
                              
                              {/* 1. FRONT CARD VIEW */}
                              <div 
                                className={`bg-white border rounded-2xl relative shadow-md overflow-hidden shrink-0 flex flex-col select-none ${
                                  cardOrientation === 'portrait' 
                                    ? 'w-[245px] h-[375px]' 
                                    : 'w-[375px] h-[245px]'
                                }`}
                                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.04)' }}
                              >
                                {/* Header Wave Banner */}
                                <div className={`${activeTheme.bg} p-3.5 pb-6 text-white text-center relative`}>
                                  <div className="absolute top-2 right-2 text-white/30 truncate">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <h4 className="font-bold tracking-wider text-[9px] uppercase leading-tight truncate">{companyName}</h4>
                                  <p className="text-[7.5px] tracking-widest text-[#93C5FD] font-bold uppercase mt-0.5">EMPLOYEE ID CARD PAS</p>
                                  
                                  {/* Wave styling */}
                                  <div className="absolute -bottom-1 left-0 right-0 h-3 bg-white" style={{ borderRadius: '100% 100% 0 0' }} />
                                </div>

                                {/* Main details alignment */}
                                <div className={`flex-1 p-4 pt-1 flex ${cardOrientation === 'portrait' ? 'flex-col items-center justify-between text-center' : 'flex-row items-center justify-between text-left gap-4'}`}>
                                  
                                  {/* Photo slot */}
                                  <div className="relative z-10">
                                    <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-105 p-0.5 shadow-sm shrink-0">
                                      {selectedEmp.photoUrl ? (
                                        <img 
                                          src={selectedEmp.photoUrl} 
                                          alt={selectedEmp.name} 
                                          className="w-full h-full object-cover rounded-xl"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-50 text-slate-400 flex items-center justify-center flex-col p-1">
                                          <Users className="w-8 h-8 text-slate-300" />
                                          <span className="text-[6.5px] uppercase font-bold text-slate-400 mt-1">Photo</span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[6.5px] bg-[#10B981] text-white font-extrabold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap tracking-wide leading-none uppercase">
                                      BIOMETRI
                                    </span>
                                  </div>

                                  {/* Credentials labels */}
                                  <div className="flex-1 min-w-0 mt-2">
                                    <h3 className="font-extrabold text-slate-900 text-xs tracking-tight uppercase leading-snug truncate">{selectedEmp.name}</h3>
                                    <p className={`${activeTheme.text} text-[9.5px] font-extrabold uppercase mt-0.5 tracking-wide truncate`}>{selectedEmp.position}</p>
                                    
                                    <div className={`mt-3 divide-y divide-slate-100 ${cardOrientation === 'portrait' ? 'mx-auto max-w-[180px]' : ''}`}>
                                      <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                        <span>NIP (ID)</span>
                                        <span className="text-slate-800 font-mono tracking-tight">{selectedEmp.id}</span>
                                      </div>
                                      <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                        <span>DIVISI</span>
                                        <span className="text-slate-800 truncate">{selectedEmp.department}</span>
                                      </div>
                                      <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                        <span>FP PIN</span>
                                        <span className="text-blue-700 font-mono font-bold">{selectedEmp.pin}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Hologram symbol & Footer Strip */}
                                <div className="p-2 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center px-4 shrink-0">
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                    <span className="text-[7.5px] font-mono tracking-wider text-slate-400 font-bold">X-100C SECURE</span>
                                  </div>
                                  
                                  {/* Glassmorphic hologram badge */}
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-emerald-300 to-indigo-400 border border-white opacity-80 flex items-center justify-center shadow-2xs relative">
                                    <div className="text-[6px] font-black text-slate-800 scale-75 select-none leading-none">RFID</div>
                                  </div>
                                </div>
                                <div className={`h-1 w-full ${activeTheme.bg}`} />
                              </div>

                              {/* 2. BACK CARD VIEW */}
                              <div 
                                className={`bg-white border rounded-2xl relative shadow-md overflow-hidden shrink-0 flex flex-col justify-between select-none ${
                                  cardOrientation === 'portrait' 
                                    ? 'w-[245px] h-[375px]' 
                                    : 'w-[375px] h-[245px]'
                                }`}
                                style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.04)' }}
                              >
                                {/* Top Magnetic Stripe representation */}
                                <div className="space-y-3">
                                  <div className="h-7 bg-slate-900 w-full mt-3 block" />
                                  <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-250 to-orange-400 w-full opacity-30" />
                                </div>

                                {/* Card content */}
                                <div className="px-4.5 space-y-4 flex-1 flex flex-col justify-center">
                                  {showGuidelines && (
                                    <div className="text-[7.5px] leading-relaxed text-slate-400 space-y-1.5 text-slate-520">
                                      <p className="font-extrabold text-[8px] text-slate-800 uppercase tracking-widest leading-none">Security Guidelines:</p>
                                      <p className="leading-3">1. Kartu pengenal biometrik karyawan wajib dikenakan secara nampak dalam area kerja {companyName}.</p>
                                      <p className="leading-3">2. Penyalahgunaan kartu ini oleh pihak di luar staf terancam sanksi dan denda internal kelas A.</p>
                                      <p className="leading-3">3. Bila menemukan kartu hilang, hubungi Departemen HR di email: <strong className="text-slate-600 truncate">{selectedEmp.email || 'hr@biometric.co.id'}</strong>.</p>
                                    </div>
                                  )}

                                  {/* Direct Auth Area */}
                                  <div className="flex items-center justify-between gap-2 border-t pt-2 border-slate-100">
                                    <div className="text-left shrink-0">
                                      <div className="text-[6.5px] text-slate-400 font-extrabold uppercase leading-none">AUTHORIZED SIGN</div>
                                      <div className="w-18 h-6 bg-slate-50 border border-slate-200 mt-1 flex items-center justify-center rounded overflow-hidden p-0.5">
                                        <svg className="w-full h-full stroke-blue-700 opacity-60" viewBox="0 0 100 30" fill="none">
                                          <path d="M5 25 Q 30 5, 45 10 T 80 15 T 95 12" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                      </div>
                                    </div>

                                    {/* Simulated Stamp */}
                                    <div className="w-8 h-8 rounded-full border border-dashed border-red-500/80 flex items-center justify-center scale-90 leading-none shrink-0 text-red-500/85">
                                      <span className="text-[5px] font-black text-center select-none uppercase scale-75 block font-mono">HR DEPT<br />VERIFIED</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Simulated Barcode / QR Section */}
                                <div className="p-3 bg-slate-50 flex items-center justify-between border-t border-slate-100 px-4 shrink-0">
                                  {showBarcode ? (
                                    <div className="flex flex-col items-center flex-1 pr-4">
                                      {/* Mock Barcode strips */}
                                      <div className="flex h-5 w-full items-end bg-white border border-slate-100 p-0.5 justify-center overflow-hidden gap-[1.2px]">
                                        {[1,2,1,3,1,1,2,1,1,3,2,1,1,2,1,1,3,1,2,1,1,3,2,1,1,2,1,3,1,1,2,1,1,3,2,1,1,2].map((width, idx) => (
                                          <div key={idx} className="bg-slate-900 h-full shrink-0" style={{ width: `${width * 0.8}px` }} />
                                        ))}
                                      </div>
                                      <div className="text-[6.5px] font-mono font-bold tracking-widest text-slate-500 mt-1 uppercase scale-90 mt-0.5">
                                        *{selectedEmp.id}-{selectedEmp.pin}*
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 flex-1 select-none pr-4">
                                      <QrCode className="w-5 h-5 text-slate-500" />
                                      <span className="text-[7px] font-mono font-bold tracking-tight text-slate-400">QR SYNCHRONIZED</span>
                                    </div>
                                  )}

                                  {/* Biometric standard microchip representation */}
                                  <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border border-amber-300/40 opacity-90 shadow-2xs relative overflow-hidden flex items-center justify-center shrink-0">
                                    <div className="absolute inset-0.5 border border-amber-500/30 grid grid-cols-3 gap-px">
                                      {[...Array(9)].map((_, i) => (
                                        <div key={i} className="border-r border-b border-amber-500/20" />
                                      ))}
                                    </div>
                                    <div className="w-2.5 h-2 w-[10px] h-[8px] bg-slate-800/20 rounded z-10" />
                                  </div>
                                </div>
                              </div>

                              {/* PRINT TARGET COPIED ELEMENT - MOUNTED AS A FIXED BODY PORTAL DURING media-print */}
                              <div id="id-card-print-portal" className="hidden print:flex print:flex-row print:items-center print:justify-center print:gap-14">
                                
                                {/* FRONT COPIED FOR PRINTER */}
                                <div 
                                  className={`bg-white border rounded-2xl relative overflow-hidden flex flex-col justify-between ${
                                    cardOrientation === 'portrait' 
                                      ? 'w-[245px] h-[375px]' 
                                      : 'w-[375px] h-[245px]'
                                  }`}
                                  style={{
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    pageBreakInside: 'avoid'
                                  }}
                                >
                                  {/* Wave Header */}
                                  <div className={`${activeTheme.bg} p-3.5 pb-6 text-white text-center relative`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                    <h4 className="font-bold tracking-wider text-[9px] uppercase leading-tight truncate">{companyName}</h4>
                                    <p className="text-[7.5px] tracking-widest text-[#93C5FD] font-bold uppercase mt-0.5">EMPLOYEE ID CARD PAS</p>
                                    <div className="absolute -bottom-1 left-0 right-0 h-3 bg-white" style={{ borderRadius: '100% 100% 0 0' }} />
                                  </div>

                                  <div className={`p-4 pt-1 flex ${cardOrientation === 'portrait' ? 'flex-col items-center text-center justify-between' : 'flex-row items-center text-left justify-between gap-4'}`}>
                                    <div className="relative">
                                      <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-105 p-0.5 shrink-0">
                                        {selectedEmp.photoUrl ? (
                                          <img src={selectedEmp.photoUrl} alt={selectedEmp.name} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center flex-col">
                                            <Users className="w-8 h-8 text-slate-350" />
                                            <span className="text-[6px] uppercase font-bold text-slate-450 mt-1">Photo</span>
                                          </div>
                                        )}
                                      </div>
                                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[6.5px] bg-[#10B981] text-white font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap uppercase">
                                        BIOMETRI
                                      </span>
                                    </div>

                                    <div className="flex-1 min-w-0 mt-2">
                                      <h3 className="font-extrabold text-slate-900 text-xs tracking-tight uppercase leading-snug truncate">{selectedEmp.name}</h3>
                                      <p className={`${activeTheme.text} text-[9.5px] font-extrabold uppercase mt-0.5 tracking-wide truncate`}>{selectedEmp.position}</p>
                                      
                                      <div className={`mt-3 divide-y divide-slate-100 ${cardOrientation === 'portrait' ? 'mx-auto max-w-[180px]' : ''}`}>
                                        <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                          <span>NIP (ID)</span>
                                          <span className="text-slate-800 font-mono tracking-tight font-bold">{selectedEmp.id}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                          <span>DIVISI</span>
                                          <span className="text-slate-800 truncate font-semibold">{selectedEmp.department}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-[8.5px] font-semibold text-slate-500">
                                          <span>FP PIN</span>
                                          <span className="text-blue-700 font-mono font-bold">{selectedEmp.pin}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center px-4 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                    <span className="text-[7.5px] font-mono tracking-wider text-slate-400 font-bold">X-100C SECURE</span>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-emerald-300 to-indigo-400 border border-white opacity-85 flex items-center justify-center">
                                      <div className="text-[6px] font-black text-slate-800 scale-75 select-none leading-none">RFID</div>
                                    </div>
                                  </div>
                                  <div className={`h-1 w-full ${activeTheme.bg}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
                                </div>

                                {/* BACK COPIED FOR PRINTER */}
                                <div 
                                  className={`bg-white border rounded-2xl relative overflow-hidden flex flex-col justify-between ${
                                    cardOrientation === 'portrait' 
                                      ? 'w-[245px] h-[375px]' 
                                      : 'w-[375px] h-[245px]'
                                  }`}
                                  style={{
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    pageBreakInside: 'avoid'
                                  }}
                                >
                                  {/* Top Magnetic Stripe */}
                                  <div className="space-y-3">
                                    <div className="h-7 bg-slate-900 w-full mt-3 block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
                                    <div className="h-0.5 bg-slate-200 w-full" />
                                  </div>

                                  {/* Guidelines */}
                                  <div className="px-4.5 space-y-4 flex-1 flex flex-col justify-center">
                                    {showGuidelines && (
                                      <div className="text-[7.5px] leading-relaxed text-slate-500 space-y-1.5">
                                        <p className="font-extrabold text-[8px] text-slate-800 uppercase tracking-widest leading-none">Security Guidelines:</p>
                                        <p className="leading-3">1. Kartu pengenal biometrik karyawan wajib dikenakan secara nampak dalam area kerja {companyName}.</p>
                                        <p className="leading-3">2. Penyalahgunaan kartu ini oleh pihak di luar staf terancam sanksi dan denda internal kelas A.</p>
                                        <p className="leading-3">3. Bila menemukan kartu hilang, hubungi Departemen HR di email: <strong className="text-slate-650 truncate">{selectedEmp.email || 'hr@biometric.co.id'}</strong>.</p>
                                      </div>
                                    )}

                                    {/* Authorised Area */}
                                    <div className="flex items-center justify-between gap-2 border-t pt-2 border-slate-100">
                                      <div className="text-left shrink-0">
                                        <span className="text-[6.5px] text-slate-400 font-extrabold uppercase leading-none">AUTHORIZED SIGN</span>
                                        <div className="w-18 h-6 bg-slate-50 border border-slate-200 mt-1 flex items-center justify-center rounded overflow-hidden">
                                          <svg className="w-full h-full stroke-blue-700 opacity-60" viewBox="0 0 100 30" fill="none">
                                            <path d="M5 25 Q 30 5, 45 10 T 80 15 T 95 12" strokeWidth="2" strokeLinecap="round" />
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="w-8 h-8 rounded-full border border-dashed border-red-500/80 flex items-center justify-center scale-90 leading-none shrink-0 text-red-500/85">
                                        <span className="text-[5px] font-black text-center uppercase scale-75 block font-mono">HR DEPT<br />VERIFIED</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Barcodes / RFID Chip */}
                                  <div className="p-3 bg-slate-50 flex items-center justify-between border-t border-slate-100 px-4 shrink-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                    {showBarcode ? (
                                      <div className="flex flex-col items-center flex-1 pr-4">
                                        <div className="flex h-5 w-full items-end bg-white border border-slate-100 p-0.5 justify-center overflow-hidden gap-[1.2px]">
                                          {[1,2,1,3,1,1,2,1,1,3,2,1,1,2,1,1,3,1,2,1,1,3,2,1,1,2,1,3,1,1,2,1,1,3,2,1,1,2].map((width, idx) => (
                                            <div key={idx} className="bg-slate-900 h-full shrink-0" style={{ width: `${width * 0.8}px` }} />
                                          ))}
                                        </div>
                                        <div className="text-[6.5px] font-mono font-bold tracking-widest text-slate-500 mt-1 uppercase scale-90 mt-0.5">
                                          *{selectedEmp.id}-{selectedEmp.pin}*
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 flex-1 pr-4">
                                        <QrCode className="w-5 h-5 text-slate-500" />
                                        <span className="text-[7px] font-mono font-bold tracking-tight text-slate-400">QR SYNCHRONIZED</span>
                                      </div>
                                    )}

                                    <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 border border-amber-300/40 opacity-90 shadow-2xs relative flex items-center justify-center shrink-0">
                                      <div className="w-2.5 h-2 w-[10px] h-[8px] bg-slate-800/20 rounded z-10" />
                                    </div>
                                  </div>
                                </div>

                              </div>

                            </div>
                          );
                        })()}

                      </div>
                    </div>

                    {/* Tab Navigation Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('detail')}
                        className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-705 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Profil
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Tutup
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Quick timeout to guarantee the DOM renders the elements completely prior to print
                            setTimeout(() => {
                              window.print();
                            }, 50);
                          }}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
                          id="btn-print-id-card"
                        >
                          <Printer className="w-4 h-4" /> Cetak ID Card (Print)
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

      {/* Salary Component Configuration Step Wizard */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border text-gray-800 rounded-2xl overflow-hidden shadow-xl max-w-lg w-full flex flex-col max-h-[95vh]"
            >
              {/* Header Wizard */}
              <div className="p-5 border-b bg-slate-50/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" /> Standardisasi Komponen Gaji
                  </h3>
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Stepper Progress Bar */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider relative">
                  <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
                  <div 
                    className="absolute top-2.5 left-0 right-0 h-0.5 bg-blue-500 -z-10 transition-all duration-300"
                    style={{ 
                      width: `${((wizardStep - 1) / 3) * 100}%`,
                      maxWidth: '100%' 
                    }}
                  ></div>
                  
                  <div className="flex flex-col items-center gap-1 bg-white px-2 z-10">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all ${
                      wizardStep >= 1 ? 'border-blue-500 bg-blue-500 text-white font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>1</span>
                    <span className={wizardStep >= 1 ? 'text-blue-600' : ''}>Tunjangan</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 bg-white px-2 z-10">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all ${
                      wizardStep >= 2 ? 'border-blue-500 bg-blue-500 text-white font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>2</span>
                    <span className={wizardStep >= 2 ? 'text-blue-600' : ''}>BPJS</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 bg-white px-2 z-10">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all ${
                      wizardStep >= 3 ? 'border-blue-500 bg-blue-500 text-white font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>3</span>
                    <span className={wizardStep >= 3 ? 'text-blue-600' : ''}>Pajak</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 bg-white px-2 z-10">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] transition-all ${
                      wizardStep >= 4 ? 'border-emerald-500 bg-emerald-500 text-white font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>4</span>
                    <span className={wizardStep >= 4 ? 'text-emerald-600' : ''}>Selesai</span>
                  </div>
                </div>
              </div>

              {/* Wizard Content */}
              <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] text-xs">
                {wizardStep === 1 && (
                  <div className="space-y-4" id="wizard-step-1">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-blue-800 leading-relaxed font-semibold">
                      Langkah ini menstandarisasi tunjangan harian kehadiran karyawan (makan &amp; transport) serta denda keterlambatan biometric yang berlaku secara menyeluruh.
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Uang Makan &amp; Transportasi per Hari Kehadiran (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                          <input
                            type="number"
                            value={wizardData.mealTransportAllowance}
                            onChange={(e) => setWizardData({ ...wizardData, mealTransportAllowance: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-9 rounded-xl font-mono text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 font-bold"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Dikalikan otomatis dengan jumlah tap berangkat kerja per periode gaji.</p>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Potongan Terlambat per Menit (Rp)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rp</span>
                          <input
                            type="number"
                            value={wizardData.lateDeductionRate}
                            onChange={(e) => setWizardData({ ...wizardData, lateDeductionRate: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-9 rounded-xl font-mono text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 font-bold"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Sanksi keterlambatan harian yang merujuk pada selisih waktu toleransi sidik jari.</p>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4" id="wizard-step-2">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-indigo-800 leading-relaxed font-semibold">
                      Konfigurasikan persentase potongan program BPJS Kesehatan dan Jaminan Hari Tua Ketenagakerjaan yang diambil dari upah pokok utama karyawan.
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">Iuran BPJS Kesehatan (%)</label>
                          <span className="font-extrabold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{wizardData.bpjsKesehatanRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={wizardData.bpjsKesehatanRate}
                          onChange={(e) => setWizardData({ ...wizardData, bpjsKesehatanRate: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">Umumnya kontribusi porsi pekerja (PPU) adalah 1% dari upah standar.</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">BPJS Ketenagakerjaan (%)</label>
                          <span className="font-extrabold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{wizardData.bpjsKetenagakerjaanRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={wizardData.bpjsKetenagakerjaanRate}
                          onChange={(e) => setWizardData({ ...wizardData, bpjsKetenagakerjaanRate: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">Umumnya kontribusi porsi pekerja untuk JHT adalah sebesar 2% dari upah pokok.</p>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4" id="wizard-step-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-amber-800 leading-relaxed font-semibold">
                      Tentukan persentase pemotongan estimasi Pajak Penghasilan Pasal 21. Penaksiran disederhanakan dengan skema flat standar terhadap penerimaan bruto.
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">Skema Flat Tarif PPh 21 (%)</label>
                          <span className="font-extrabold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{wizardData.pph21Rate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={wizardData.pph21Rate}
                          onChange={(e) => setWizardData({ ...wizardData, pph21Rate: parseFloat(e.target.value) })}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">Tarif penaksiran global bracket dasar wajib pajak non-NPWP, disederhanakan 5%.</p>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4" id="wizard-step-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-slate-800 space-y-3">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                        <Check className="w-5 h-5 bg-emerald-600 text-white rounded-full p-1 shrink-0" /> Konfigurasi Standardisasi Selesai
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        Semua parameter penggajian untuk menjamin keselarasan komputasi telah divalidasi dan siap diterapkan secara masal:
                      </p>
                      
                      <div className="border border-emerald-100 bg-white rounded-xl shadow-xs divide-y text-xs font-mono p-4 space-y-2">
                        <div className="flex justify-between font-bold py-1 text-slate-700">
                          <span>Allowance Harian:</span>
                          <span className="text-emerald-700">Rp {wizardData.mealTransportAllowance.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold py-1 text-slate-700 pt-2">
                          <span>Penalty Telat Mnt:</span>
                          <span className="text-rose-600">Rp {wizardData.lateDeductionRate.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold py-1 text-slate-700 pt-2">
                          <span>BPJS Kesehatan:</span>
                          <span className="text-emerald-700">{wizardData.bpjsKesehatanRate}% (Porsi Pokok)</span>
                        </div>
                        <div className="flex justify-between font-bold py-1 text-slate-700 pt-2">
                          <span>BPJS Ketenagakerjaan:</span>
                          <span className="text-emerald-700">{wizardData.bpjsKetenagakerjaanRate}% (Porsi Pokok)</span>
                        </div>
                        <div className="flex justify-between font-bold py-1 text-slate-700 pt-2">
                          <span>Tarif Flat PPh 21:</span>
                          <span className="text-amber-700">{wizardData.pph21Rate}% (Bruto)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-400 font-medium leading-relaxed">
                      💡 Mengklik "Simpan &amp; Terapkan" di bawah ini akan memperbarui formula hitung slip gaji di tab Penggajian secara waktu-nyata (Real-time).
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Wizard */}
              <div className="p-5 border-t bg-slate-50/50 flex justify-between items-center">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className={`px-4 py-2 border rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                    wizardStep === 1 ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-150 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-250'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
                
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl shadow-xs transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Lanjut <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveWizard}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer"
                    id="btn-apply-wizard"
                  >
                    Simpan &amp; Terapkan <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Database Karyawan Modal Overlay */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border text-gray-800 rounded-2xl overflow-hidden shadow-xl max-w-md w-full flex flex-col"
              id="export-employees-modal"
            >
              {/* Header */}
              <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" /> Ekspor Database Karyawan
                </h3>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200/50 text-slate-450 hover:text-red-650 rounded-xl transition-all cursor-pointer"
                  disabled={isExporting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unduh data profil, gaji, tipe kontrak, dan detail fungsional seluruh staf Anda ke dokumen file format CSV. Format ini kompatibel penuh dengan <strong>Microsoft Excel, Google Sheets,</strong> dan <strong>sistem HRIS eksternal</strong>.
                </p>

                {/* 1. Scope Selection Area */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Cakupan Data ekspor</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Filtered scope option */}
                    <div 
                      onClick={() => !isExporting && setExportScope('filtered')}
                      className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                        exportScope === 'filtered' 
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold' 
                          : 'border-slate-200 bg-white hover:border-slate-350 text-slate-700'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="exportScope" 
                        checked={exportScope === 'filtered'} 
                        onChange={() => {}}
                        disabled={isExporting}
                        className="mt-1 accent-emerald-600 cursor-pointer text-emerald-600 bg-emerald-500"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className={`${exportScope === 'filtered' ? 'text-emerald-900 font-extrabold' : 'text-slate-900 font-bold'}`}>Data Karyawan Terfilter saja</span>
                          <span className="bg-emerald-500/15 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">{filteredEmployees.length} staf</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1 font-medium italic leading-normal">
                          Mengekspor hanya baris karyawan yang sesuai dengan input pencarian, pilihan tipe divisi, atau status keaktifan saat ini.
                        </p>
                      </div>
                    </div>

                    {/* All scope option */}
                    <div 
                      onClick={() => !isExporting && setExportScope('all')}
                      className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                        exportScope === 'all' 
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold' 
                          : 'border-slate-200 bg-white hover:border-slate-350 text-slate-700'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="exportScope" 
                        checked={exportScope === 'all'} 
                        onChange={() => {}}
                        disabled={isExporting}
                        className="mt-1 accent-emerald-650 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex justify-between items-center font-semibold">
                          <span className={`${exportScope === 'all' ? 'text-emerald-900 font-extrabold' : 'text-slate-900 font-bold'}`}>Seluruh Database Karyawan</span>
                          <span className="bg-blue-500/15 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">{employees.length} staf</span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-1 font-medium italic leading-normal">
                          Mengekspor semua entitas karyawan dalam database PT BIOMETRIC PORTAL UTAMA tanpa memedulikan filter pencarian di layar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Format Delimiter Settings */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2. Pembatas Kolom (Delimiter CSV)</label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => setExportSeparator(';')}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all text-center cursor-pointer gap-1.5 ${
                        exportSeparator === ';'
                          ? 'border-emerald-500 bg-emerald-50/10 text-emerald-900 font-extrabold shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-mono text-xs px-2 bg-slate-105 rounded-md py-0.5 font-black">&ldquo;;&rdquo; Titik Koma</span>
                      <span className="text-[9px] text-slate-400 max-w-[125px] leading-tight font-medium">Sangat Cocok untuk Excel Region Indonesia</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => setExportSeparator(',')}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all text-center cursor-pointer gap-1.5 ${
                        exportSeparator === ','
                          ? 'border-emerald-500 bg-emerald-50/10 text-emerald-900 font-extrabold shadow-xs'
                          : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-505'
                      }`}
                    >
                      <span className="font-mono text-xs px-2 bg-slate-105 rounded-md py-0.5 font-black">&ldquo;,&rdquo; Koma</span>
                      <span className="text-[9px] text-slate-400 max-w-[125px] leading-tight font-medium">Sesuai Google Sheets &amp; Excel Internasional</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Loading Progress Indicator */}
                {isExporting && (
                  <div className="bg-emerald-50/10 border border-emerald-150 rounded-2xl p-4 flex flex-col gap-2.5 animate-pulse">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-emerald-700">
                      <span>Memproses Pengodean UTF-8...</span>
                      <span>92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full animate-bounce w-[92%]" />
                    </div>
                    <span className="text-[9px] text-slate-400 text-center italic font-semibold">Mengompilasi enkripsi file aman PT BIOMETRIC PORTAL UTAMA INDONESIA</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 border-t bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-xl border border-slate-250 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportCSV}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  id="btn-confirm-export"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengekspor...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Unduh Berkas CSV
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Master History Logs Center Modal */}
      <AnimatePresence>
        {isHistoryLogOpen && (() => {
          const combinedHistory = [
            ...salaryHistory.map(sh => ({
              ...sh,
              historyType: 'salary' as const,
              timestamp: new Date(sh.changeDate).getTime() || 0,
            })),
            ...mutationHistory.map(mh => ({
              ...mh,
              historyType: 'mutation' as const,
              timestamp: new Date(mh.changeDate).getTime() || 0,
            }))
          ].sort((a, b) => b.changeDate.localeCompare(a.changeDate));

          const filteredHistory = combinedHistory.filter(item => {
            const query = historySearchQuery.toLowerCase();
            const matchesQuery = 
              item.employeeName.toLowerCase().includes(query) ||
              item.employeeId.toLowerCase().includes(query) ||
              item.reason.toLowerCase().includes(query) ||
              item.actor.toLowerCase().includes(query);
              
            if (!matchesQuery) return false;
            
            if (historyActiveTab === 'all') return true;
            if (historyActiveTab === 'salary') return item.historyType === 'salary';
            if (historyActiveTab === 'mutation') return item.historyType === 'mutation';
            return true;
          });

          const handleExportHistoryCSV = () => {
            const headers = ["ID Transaksi", "ID Karyawan", "Nama Karyawan", "Tipe Riwayat", "Tanggal Perubahan", "Keterangan Asal", "Keterangan Baru", "Alasan Perubahan", "Operator (HR)"];
            
            const rows = combinedHistory.map(item => {
              let oldDesc = '';
              let newDesc = '';
              if (item.historyType === 'salary') {
                const h = item as any;
                oldDesc = `Gaji Pokok: ${h.oldBasicSalary}, Tunjangan: ${h.oldAllowance}`;
                newDesc = `Gaji Pokok: ${h.newBasicSalary}, Tunjangan: ${h.newAllowance}`;
              } else {
                const h = item as any;
                oldDesc = `Divisi: ${h.oldDepartment}, Posisi: ${h.oldPosition}`;
                newDesc = `Divisi: ${h.newDepartment}, Posisi: ${h.newPosition}`;
              }
              return [
                item.id,
                item.employeeId,
                item.employeeName,
                item.historyType === 'salary' ? 'Perubahan Gaji' : 'Mutasi Jabatan',
                item.changeDate,
                oldDesc,
                newDesc,
                item.reason,
                item.actor
              ];
            });

            const csvRows = [headers, ...rows].map(row => 
              row.map(value => `"${(value || '').toString().trim().replace(/"/g, '""')}"`).join(';')
            ).join('\n');

            const blob = new Blob(["\uFEFF" + csvRows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Riwayat_Aktivitas_Karyawan_${new Date().toISOString().substring(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] border border-slate-200"
                id="master-employee-history-modal"
              >
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-slate-50/70 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">Pusat Riwayat &amp; Mutasi Karyawan</h3>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">Log perubahan karir, administrasi jabatan, dan slip gaji dasar karyawan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsHistoryLogOpen(false)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer border-0"
                    id="btn-close-history-modal"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Sub Bar with Search and Export Buttons */}
                <div className="px-5 py-4 border-b bg-white flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                  {/* Tabs */}
                  <div className="flex border border-slate-100 rounded-xl p-1 bg-slate-50/50 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setHistoryActiveTab('all')}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        historyActiveTab === 'all'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Semua ({combinedHistory.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryActiveTab('mutation')}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        historyActiveTab === 'mutation'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Mutasi &amp; Promosi ({mutationHistory.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryActiveTab('salary')}
                      className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        historyActiveTab === 'salary'
                          ? 'bg-white text-emerald-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Riwayat Gaji ({salaryHistory.length})
                    </button>
                  </div>

                  {/* Actions / Search */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-60">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, NIP, alasan..."
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 w-full text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                        id="history-search-input"
                      />
                      {historySearchQuery && (
                        <button
                          onClick={() => setHistorySearchQuery('')}
                          className="absolute right-2.5 top-2 ml-1 text-slate-400 hover:text-slate-600 font-bold"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleExportHistoryCSV}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Ekspor CSV
                    </button>
                  </div>
                </div>

                {/* Content Stream list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/30" id="history-stream-content">
                  {filteredHistory.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 space-y-2">
                      <History className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-semibold">Tidak ditemukan rekaman log yang sesuai pencarian.</p>
                      <p className="text-[10px] text-slate-400 font-medium font-sans">Gunakan kata kunci pencarian yang lebih umum seperti nama atau tipe perubahan.</p>
                    </div>
                  ) : (
                    filteredHistory.map((item, idx) => {
                      const isSalary = item.historyType === 'salary';
                      
                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          className="p-4 bg-white border border-slate-180 rounded-2xl shadow-xs hover:border-slate-300 transition-all space-y-3 relative group"
                        >
                          {/* Top Row: Meta info */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              {isSalary ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-150/50 uppercase tracking-widest flex items-center gap-1">
                                  <Coins className="w-3 h-3 text-emerald-600" /> Perubahan Gaji
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-150/50 uppercase tracking-widest flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-blue-600" /> Mutasi &amp; Jabatan
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono font-medium">{item.changeDate}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Operator: <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{item.actor}</span>
                            </div>
                          </div>

                          {/* Middle Row: Employee & Difference Details */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            {/* Employee column */}
                            <div className="md:col-span-4 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {item.employeeName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.employeeName}</h4>
                                <p className="text-[10px] font-mono text-slate-400 font-medium">{item.employeeId}</p>
                              </div>
                            </div>

                            {/* Details update values comparison */}
                            <div className="md:col-span-8">
                              {isSalary ? (() => {
                                const h = item as any;
                                const isSalaryChange = h.oldBasicSalary !== h.newBasicSalary;
                                const isAllowanceChange = h.oldAllowance !== h.newAllowance;

                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100/60">
                                      <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Gaji Pokok:</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-slate-400 line-through">Rp {h.oldBasicSalary.toLocaleString('id-ID')}</span>
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className={`font-extrabold ${isSalaryChange ? 'text-emerald-700' : 'text-slate-800'}`}>
                                          Rp {h.newBasicSalary.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100/60">
                                      <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Tunjangan Tetap:</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-slate-400 line-through">Rp {h.oldAllowance.toLocaleString('id-ID')}</span>
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className={`font-extrabold ${isAllowanceChange ? 'text-emerald-700' : 'text-slate-800'}`}>
                                          Rp {h.newAllowance.toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })() : (() => {
                                const h = item as any;
                                const isDeptChange = h.oldDepartment !== h.newDepartment;
                                const isPosChange = h.oldPosition !== h.newPosition;

                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100/60">
                                      <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Departemen / Divisi:</span>
                                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        {h.oldDepartment && h.oldDepartment !== '-' ? (
                                          <span className="text-slate-400 line-through">{h.oldDepartment}</span>
                                        ) : h.oldDepartment === '-' ? (
                                          <span className="text-slate-455 italic">Baru</span>
                                        ) : null}
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className={`font-extrabold ${isDeptChange ? 'text-blue-700' : 'text-slate-800'}`}>
                                          {h.newDepartment}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100/60">
                                      <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-wider">Jabatan / Posisi:</span>
                                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        {h.oldPosition && h.oldPosition !== '-' ? (
                                          <span className="text-slate-400 line-through">{h.oldPosition}</span>
                                        ) : h.oldPosition === '-' ? (
                                          <span className="text-slate-455 italic">Baru</span>
                                        ) : null}
                                        <span className="text-slate-400">&rarr;</span>
                                        <span className={`font-extrabold ${isPosChange ? 'text-amber-700' : 'text-slate-800'}`}>
                                          {h.newPosition}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Bottom Row: Reason Excerpt */}
                          <div className="p-2.5 bg-slate-950/5 text-slate-650 rounded-xl text-[11px] leading-relaxed italic border border-slate-100">
                            <strong>Alasan Perubahan:</strong> &ldquo;{item.reason}&rdquo;
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer status summary */}
                <div className="p-4 border-t bg-slate-50 flex justify-between items-center text-xs font-medium text-slate-500 shrink-0">
                  <span>Menampilkan {filteredHistory.length} dari total {combinedHistory.length} rekaman log</span>
                  <button
                    type="button"
                    onClick={() => setIsHistoryLogOpen(false)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs cursor-pointer border-0"
                  >
                    Tutup Log
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ================= REPOSITORI DOKUMEN DIGITAL PREVIEW MODAL ================= */}
      <AnimatePresence>
        {previewDoc && selectedEmp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-850 text-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col"
              id="digital-document-preview-modal"
            >
              {/* Header */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                      Repositori Dokumen Digital
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Pratinjau Langsung
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Spesimen Dokumen Resmi: <strong className="text-white">{previewDoc.name}</strong> ({previewDoc.type})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        const content = document.getElementById('print-document-content')?.innerHTML || '';
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Cetak - ${previewDoc.name}</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                              <style>
                                @media print {
                                  body { background: white; color: black; padding: 0; margin: 0; }
                                  .no-print { display: none !important; }
                                }
                              </style>
                            </head>
                            <body class="p-8">
                              <div class="max-w-2xl mx-auto border-0">${content}</div>
                              <script>
                                setTimeout(() => { window.print(); window.close(); }, 500);
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer border-0"
                    title="Cetak Dokumen"
                  >
                    <Printer className="w-4 h-4" /> Cetak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewZoom(prev => Math.max(50, prev - 25));
                    }}
                    disabled={previewZoom <= 50}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer border-0"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-1.5 rounded-lg text-slate-300 min-w-[45px] text-center">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewZoom(prev => Math.min(200, prev + 25));
                    }}
                    disabled={previewZoom >= 200}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer border-0"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(100)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer border-0"
                    title="Reset Posisi & Skala"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="w-px h-6 bg-slate-800 mx-1"></span>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg text-slate-400 transition-all cursor-pointer border-0"
                    title="Tutup Pratinjau (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Info Metadata Row */}
              <div className="bg-slate-850 border-b border-slate-800/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-medium">Jenis:</span>
                    <span className="font-extrabold text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 text-[10px] uppercase tracking-wide">
                      {previewDoc.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-medium">Ukuran:</span>
                    <span className="font-extrabold text-white font-mono">{previewDoc.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-medium">Diunggah:</span>
                    <span className="text-white font-mono">{previewDoc.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 italic font-medium bg-slate-950 px-3 py-1.5 rounded border border-slate-800 max-w-[400px] truncate">
                    &ldquo;Catatan: {previewDoc.notes || 'Tidak ada catatan khusus.'}&rdquo;
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" /> SSL SECURE RESOURCE
                </div>
              </div>

              {/* Viewer Area */}
              <div className="flex-1 bg-slate-950 overflow-auto p-8 flex items-start justify-center relative">
                <div 
                  className="transition-transform duration-100 ease-out origin-top"
                  style={{ transform: `scale(${previewZoom / 100})` }}
                  id="print-document-content"
                >
                  {/* REAL FILE PREVIEW (BASE64 DATA OR ACTUAL PDF/IMAGES) */}
                  {previewDoc.fileUrl && previewDoc.fileUrl !== '#' ? (
                    <div className="max-w-3xl w-[700px] bg-white rounded-xl shadow-xl overflow-hidden p-1 border border-slate-800">
                      {previewDoc.fileUrl.startsWith('data:image/') ? (
                        <img 
                          src={previewDoc.fileUrl} 
                          alt={previewDoc.name} 
                          className="w-full max-h-[75vh] object-contain mx-auto"
                          referrerPolicy="no-referrer"
                        />
                      ) : previewDoc.fileUrl.startsWith('data:application/pdf') || previewDoc.fileUrl.endsWith('.pdf') ? (
                        <div className="w-full h-[72vh]">
                          <object
                            data={previewDoc.fileUrl}
                            type="application/pdf"
                            className="w-full h-full"
                          >
                            <iframe 
                              src={previewDoc.fileUrl}
                              className="w-full h-full border-0 bg-white"
                              title="Pdf Real-Time Viewer"
                              style={{ minHeight: '65s0px' }}
                            />
                          </object>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-800 space-y-3 bg-white">
                          <FileText className="w-12 h-12 text-blue-600 mx-auto animate-bounce" />
                          <h4 className="font-black text-sm">Pratinjau Format File Sukses</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Aplikasi berhasil mengunggah berkas <strong className="font-extrabold text-blue-600">{previewDoc.name}</strong>. Anda dapat mengunduh dokumen secara langsung menggunakan tautan di bawah ini.
                          </p>
                          <div className="pt-2">
                            <a
                              href={previewDoc.fileUrl}
                              download={previewDoc.name}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                            >
                              <Download className="w-4 h-4" /> Unduh Berkas Sekarang ({previewDoc.fileSize})
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* HIGH FIDELITY VIRTUAL SPECIMEN DOCUMENTS PREVIEWS (FOR MOCK SEEDED DATA WITH #) */
                    <div className="max-w-3xl w-[700px] shadow-2xl transition-all select-none">
                      
                      {/* TEMPLATE 1: KONTRAK KERJA */}
                      {previewDoc.type === 'Kontrak Kerja' && (
                        <div className="bg-white text-slate-850 p-12 border border-slate-200 shadow-lg rounded-sm flex flex-col justify-between font-serif relative overflow-hidden" style={{ minHeight: '840px' }}>
                          {/* Letter Seal / Stamp Bg */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none opacity-[0.03] flex flex-col items-center pointer-events-none">
                            <Building className="w-96 h-96 text-slate-900" />
                            <span className="text-4xl font-extrabold tracking-widest uppercase mt-4">PT BIOMETRIC PORTAL UTAMA</span>
                          </div>

                          {/* Kop Surat Header */}
                          <div className="text-center border-b-2 border-slate-850 pb-5 mb-6 relative">
                            <div className="flex items-center justify-center gap-3 mb-1.5">
                              <div className="p-2.5 bg-slate-900 text-white rounded-lg font-black tracking-tighter text-sm font-sans">
                                BPU
                              </div>
                              <div className="text-left font-sans">
                                <span className="font-black tracking-tight text-lg text-slate-900 block leading-none">PT BIOMETRIC PORTAL UTAMA INDONESIA</span>
                                <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-extrabold">Enterprise Core Biometrics Solution &amp; Engineering SaaS</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mt-1">
                              Menara Prima Blok A-45, Kuningan Barat, Mampang Prapatan, Jakarta Selatan, 12710 | Telp: (021) 5092-2342 | Email: legal@enterprise.co.id
                            </p>
                          </div>

                          {/* Kontrak Title */}
                          <div className="text-center space-y-1 mb-8">
                            <h4 className="font-black text-sm uppercase tracking-wide border-b border-dashed border-slate-350 pb-1.5 max-w-sm mx-auto font-serif">
                              SURAT PERJANJIAN KERJA WAKTU TIDAK TENTU (SPK-R)
                            </h4>
                            <p className="text-[11px] font-mono text-slate-500">
                              Nomor: {selectedEmp.id}/HRD-SPK/BPU/{new Date(selectedEmp.joinDate).getFullYear()}
                            </p>
                          </div>

                          {/* Isi Surat Kontrak */}
                          <div className="space-y-4 text-xs leading-relaxed text-justify">
                            <p>
                              Pada hari ini, tanggal <strong>{new Date(selectedEmp.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>, yang bertanda tangan di bawah ini secara bersama-sama setuju untuk membuat Perjanjian Kerja Waktu Tidak Tertentu (PKWTT):
                            </p>

                            <div className="space-y-2.5 pl-4">
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-1">I.</span>
                                <div className="col-span-11">
                                  <strong>PT BIOMETRIC PORTAL UTAMA INDONESIA</strong>, berkedudukan di Jakarta Selatan, dalam hal ini diwakili oleh Departemen Sumber Daya Manusia (HRD) perusahaan, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> (Pemberi Kerja).
                                </div>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-1">II.</span>
                                <div className="col-span-11">
                                  <strong>{selectedEmp.name}</strong>, No. Karyawan: <strong>{selectedEmp.id}</strong>, berkedudukan sesuai NIK di server database internal, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong> (Pegawai).
                                </div>
                              </div>
                            </div>

                            <p>
                              Kedua belah pihak setuju dan bermufakat untuk mengikatkan diri dalam hubungan kerja profesional dengan syarat-syarat dan ketentuan sebagai berikut:
                            </p>

                            {/* Pasal-Pasal */}
                            <div className="space-y-4 pt-1">
                              <div>
                                <h5 className="font-extrabold text-[11px] uppercase text-slate-900 mb-0.5">Pasal 1: Penempatan &amp; Lingkup Pekerjaan</h5>
                                <p className="pl-4">
                                  Pihak Pertama mempekerjakan Pihak Kedua dalam posisi posisi sebagai <strong className="text-slate-900">{selectedEmp.position}</strong> pada divisi <strong>{selectedEmp.department}</strong> yang terhitung sejak tanggal gabung resmi perusahaan <strong>{selectedEmp.joinDate}</strong>.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-extrabold text-[11px] uppercase text-slate-900 mb-0.5">Pasal 2: Standar Kedisiplinan &amp; Presensi</h5>
                                <p className="pl-4">
                                  Pihak Kedua berkewajiban untuk melakukan dan melengkapi pencatatan presensi berupa verifikasi sidik jari harian melalui mesin <strong>Fingerprint Solution X-100C</strong> yang terafiliasi dengan ADMS Cloud Server demi menunjang Indeks Kedisiplinan Kinerja (X-100C) yang terverifikasi dan termonitor di sistem HRD.
                                </p>
                              </div>

                              <div>
                                <h5 className="font-extrabold text-[11px] uppercase text-slate-900 mb-0.5">Pasal 3: Hak Atas Kompensasi &amp; Tunjangan</h5>
                                <p className="pl-4">
                                  Pihak Kedua berhak mendapatkan komponen upah per bulan dari Pihak Pertama meliputi Gaji Pokok sebesar <strong>Rp {selectedEmp.basicSalary.toLocaleString('id-ID')}</strong> dengan Tunjangan Jabatan fungsional sebesar <strong>Rp {selectedEmp.allowance.toLocaleString('id-ID')}</strong>, dikurangi iuran kontribusi kesehatan BPJS Mandatori &amp; Pajak PPh21 yang dibayarkan rutin tiap akhir bulan berjalan.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Signature Row */}
                          <div className="grid grid-cols-2 gap-10 pt-16 border-t border-slate-200 mt-12 shrink-0 font-sans">
                            <div className="text-center space-y-12">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 block tracking-widest font-bold uppercase">PIHAK PERTAMA</span>
                                <span className="font-extrabold text-xs block text-slate-800">HR Director &amp; Counsel BPU</span>
                              </div>
                              <div className="relative inline-block h-16 flex items-center justify-center">
                                {/* Simulated QR check badge */}
                                <div className="p-1 border border-emerald-500/20 bg-emerald-50 rounded text-emerald-700 text-[9px] flex items-center gap-1 uppercase font-bold tracking-tight scale-100 no-print">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 scale-110" /> E-Signed &amp; Approved BPU
                                </div>
                              </div>
                              <div className="space-y-0.5 font-semibold">
                                <span className="underline block text-xs font-bold text-slate-900">Siti Aminah, M.Psi.</span>
                                <span className="text-[9px] text-slate-500 block">NIP: EMP-003</span>
                              </div>
                            </div>

                            <div className="text-center space-y-12">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 block tracking-widest font-bold uppercase">PIHAK KEDUA</span>
                                <span className="font-extrabold text-xs block text-slate-800">Karyawan Terikat</span>
                              </div>
                              <div className="relative inline-block h-16 flex items-center justify-center">
                                {/* E-Meterai Simulated Stamp */}
                                <div className="w-14 h-14 border-2 border-dashed border-indigo-500 rounded-lg bg-indigo-50/50 flex flex-col items-center justify-center text-[7px] font-bold text-indigo-700 leading-tight scale-90 rotate-6 no-print">
                                  <span>METERAI</span>
                                  <span>ELEKTRONIK</span>
                                  <span className="text-[8px] font-black tracking-widest">10000</span>
                                  <span className="text-[5px] text-slate-400">DJ-PAJAK</span>
                                </div>
                              </div>
                              <div className="space-y-0.5 font-semibold">
                                <span className="underline block text-xs font-bold text-slate-900">{selectedEmp.name}</span>
                                <span className="text-[9px] text-slate-500 block">NIP: {selectedEmp.id}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPLATE 2: KTP / IDENTITAS */}
                      {previewDoc.type === 'KTP/Identitas' && (
                        <div className="bg-gradient-to-br from-cyan-600 via-sky-500 to-blue-750 text-white w-[580px] h-[360px] rounded-2xl p-6.5 shadow-2xl relative border-2 border-sky-400 flex flex-col justify-between font-sans overflow-hidden mx-auto">
                          {/* Card Hologram Line */}
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                          <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-sky-300/40 rotate-12 pointer-events-none" />

                          {/* Kop KTP */}
                          <div className="text-center space-y-0.5 border-b border-sky-355 pb-2 shrink-0">
                            <h4 className="font-extrabold tracking-widest text-[#FFF8D6] text-sm uppercase">PROVINSI DKI JAKARTA</h4>
                            <h5 className="font-bold tracking-wider text-white text-xs uppercase">KOTA JAKARTA SELATAN</h5>
                          </div>

                          {/* NIK */}
                          <div className="mt-3 shrink-0">
                            <span className="block text-[11px] text-sky-205 uppercase font-black tracking-wider leading-none">NIK KTP ELEKTRONIK</span>
                            <span className="text-[20px] font-black text-[#FFE65C] tracking-widest leading-none font-mono">
                              3174092408{selectedEmp.pin || '9300'}001
                            </span>
                          </div>

                          {/* Main Row Content: Left Info fields, Right Photo Box */}
                          <div className="flex-1 flex gap-4 mt-3 items-stretch min-h-0 text-[10px] leading-relaxed relative">
                            {/* Left Info Fields */}
                            <div className="flex-1 space-y-1 overflow-hidden">
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Nama</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-extrabold text-white truncate text-xs uppercase">{selectedEmp.name}</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Tempat / Lahir</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-semibold text-white uppercase">JAKARTA, 17-06-1991</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Jns Kelamin</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-semibold text-white uppercase">LAKI-LAKI | GOL. DARAH: AB</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Alamat</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-semibold text-white uppercase truncate">MENARA PRIMA KUNINGAN TIMUR NO. 45</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide pl-2">Kecamatan</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-semibold text-white uppercase">SETIABUDI</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Status Kawin</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-semibold text-white uppercase">KAWIN</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide">Pekerjaan</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-extrabold text-white uppercase truncate">{selectedEmp.position}</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1.5 items-start">
                                <span className="col-span-3 text-sky-150 uppercase font-bold tracking-wide font-xs">Berlaku</span>
                                <span className="col-span-1">:</span>
                                <span className="col-span-8 font-black text-[#FFE65C] uppercase tracking-wide">SEUMUR HIDUP</span>
                              </div>
                            </div>

                            {/* Right Photo & Signature Stamp area */}
                            <div className="w-28 flex flex-col justify-between items-center bg-sky-800/20 backdrop-blur-xs border border-sky-400/30 p-2 rounded-xl text-center gap-1.5">
                              {/* Photo Avatar */}
                              <div className="w-20 h-24 bg-sky-900 border border-sky-300 rounded overflow-hidden shadow-md flex items-center justify-center relative shrink-0">
                                {selectedEmp.photoUrl ? (
                                  <img 
                                    src={selectedEmp.photoUrl} 
                                    alt="Foto Karyawan" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <Users className="w-8 h-8 text-sky-200" />
                                )}
                              </div>
                              {/* Signature Label */}
                              <div className="space-y-0.5 leading-none shrink-0 text-center">
                                <span className="text-[7px] text-sky-305 block uppercase font-bold">JAKARTA SELATAN</span>
                                <span className="text-[7px] text-white/80 font-mono italic font-bold">Digital Verified</span>
                                <div className="h-6 flex items-center justify-center p-1 border border-dashed border-sky-400 bg-sky-950/20 rounded mt-0.5 font-mono text-[7px] font-black text-sky-200">
                                  {selectedEmp.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPLATE 3: NPWP */}
                      {previewDoc.type === 'NPWP' && (
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white w-[580px] h-[340px] rounded-2xl p-6.5 shadow-2xl relative border-2 border-amber-600 flex flex-col justify-between font-sans overflow-hidden mx-auto">
                          {/* Top Border Indicator */}
                          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700" />
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

                          {/* Kop DJP */}
                          <div className="flex justify-between items-center border-b border-slate-700/80 pb-3 mt-1 shrink-0">
                            <div className="flex gap-2.5 items-center">
                              <div className="p-1.5 bg-amber-500 rounded-lg text-slate-900 font-extrabold text-[12px] leading-none shrink-0 font-sans">
                                DJP
                              </div>
                              <div className="text-left">
                                <h4 className="font-extrabold tracking-tight text-white text-[10px] leading-tight uppercase">DIREKTORAT JENDERAL PAJAK</h4>
                                <h5 className="font-bold text-amber-500 text-[8px] tracking-wider uppercase">KEMENTERIAN KEUANGAN REPUBLIK INDONESIA</h5>
                              </div>
                            </div>
                            <span className="text-right text-[10px] font-black text-amber-400 tracking-wider">NPWP DOKUMEN DIGITAL</span>
                          </div>

                          <div className="my-auto space-y-4 text-left">
                            <div className="space-y-1">
                              <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">NO. POKOK WAJIB PAJAK</span>
                              <span className="text-[22px] font-mono font-black text-amber-400 tracking-widest leading-none">
                                81.564.234.{selectedEmp.pin ? selectedEmp.pin[0] : '8'}-{selectedEmp.pin || '412'}.055
                              </span>
                            </div>

                            <div className="space-y-1.5 text-left">
                              <div>
                                <span className="text-[8px] text-slate-400 block uppercase font-bold mb-0.5">NAMA WAJIB PAJAK</span>
                                <span className="font-extrabold text-[#FFF8D6] text-[13px] tracking-wide uppercase leading-tight font-sans block">{selectedEmp.name}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold mb-0.5">KPP PENDAFTARAN</span>
                                  <span className="font-bold text-white text-[9px] uppercase font-sans">KPP PRATAMA JAKARTA SETIABUDI</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold mb-0.5">STATUS KARTU</span>
                                  <span className="font-black text-emerald-400 text-[9px] uppercase tracking-wider font-sans">AKTIF / TERVERIFIKASI</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Signature stamp with barcode */}
                          <div className="flex items-center justify-between border-t border-slate-700/80 pt-3 shrink-0">
                            <div className="flex gap-1 items-center">
                              {/* Simulated Barcode */}
                              <div className="bg-white p-1 rounded">
                                <div className="h-5 flex gap-[1.5px] items-center text-slate-900">
                                  <span className="w-1 bg-black h-full"></span>
                                  <span className="w-0.5 bg-black h-full"></span>
                                  <span className="w-1 bg-black h-full"></span>
                                  <span className="w-[3px] bg-black h-full"></span>
                                  <span className="w-0.5 bg-black h-full"></span>
                                  <span className="w-1.5 bg-black h-full"></span>
                                  <span className="w-0.5 bg-black h-full"></span>
                                  <span className="w-1 bg-black h-full"></span>
                                </div>
                              </div>
                              <span className="text-[7px] text-slate-500 font-mono uppercase tracking-widest pl-1 mt-1">DJPSEC-81564P</span>
                            </div>

                            <div className="text-[8px] text-slate-500 font-sans italic">
                              Berdasarkan ketentuan validasi integrasi data NIK-NPWP otomatis.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPLATE 4: SERTIFIKAT PELATIHAN / IJAZAH / CERTIFICATE */}
                      {(previewDoc.type === 'Sertifikat Pelatihan' || previewDoc.type === 'Ijazah') && (
                        <div className="bg-[#FFFDF4] text-slate-850 p-12 border-8 border-double border-amber-600 rounded-sm shadow-xl flex flex-col justify-between font-serif relative overflow-hidden" style={{ minHeight: '520px' }}>
                          {/* Ornamental Seals background */}
                          <div className="absolute top-4 left-4 w-12 h-12 border border-amber-600/30 rounded-full flex items-center justify-center font-bold text-amber-700/10 text-xs no-print select-none">BPU</div>
                          <div className="absolute top-4 right-4 w-12 h-12 border border-amber-600/30 rounded-full flex items-center justify-center font-bold text-amber-700/10 text-xs no-print select-none">BPU</div>
                          <div className="absolute bottom-4 left-4 w-12 h-12 border border-amber-600/30 rounded-full flex items-center justify-center font-bold text-amber-700/10 text-xs no-print select-none">BPU</div>
                          <div className="absolute bottom-4 right-4 w-12 h-12 border border-amber-600/30 rounded-full flex items-center justify-center font-bold text-amber-700/10 text-xs no-print select-none">BPU</div>

                          <div className="text-center space-y-3 relative shrink-0">
                            <span className="text-amber-700 font-bold uppercase tracking-widest text-xs font-sans block">CERTIFICATE OF ACHIEVEMENT &amp; COMPETENCE</span>
                            <h4 className="font-extrabold text-2xl uppercase text-slate-850 tracking-wide font-serif">
                              {previewDoc.type === 'Ijazah' ? 'IJAZAH AKADEMIK INTEGRAL' : 'SERTIFIKAT KOMPETENSI PROFESIONAL'}
                            </h4>
                            <div className="w-20 h-0.5 bg-amber-500 mx-auto" />
                          </div>

                          <div className="text-center space-y-6 my-auto text-xs">
                            <span className="text-slate-505 italic font-sans dark:text-slate-500">Dengan ini diumumkan dan disertifikasi bahwa karyawan berprestasi:</span>
                            
                            <h5 className="font-extrabold text-2xl text-amber-900 italic tracking-wide tracking-tight font-serif border-b border-dashed border-amber-200 pb-2 max-w-sm mx-auto">
                              {selectedEmp.name}
                            </h5>

                            <p className="max-w-md mx-auto leading-relaxed text-slate-650 font-sans p-2 px-4 bg-amber-50/50 border border-amber-100/50 rounded-xl text-center">
                              Telah lolos verifikasi berkas administrasi dan pemenuhan standard kerja tinggi untuk divisi posisi <strong className="font-bold text-slate-850">{selectedEmp.position}</strong> di bawah naungan PT Biometric Portal Utama Indonesia.
                            </p>
                          </div>

                          <div className="flex justify-between items-end mt-12 shrink-0 font-sans text-xs">
                            <div className="text-center space-y-2">
                              {/* Golden seal graphic simulation */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-400 shadow-md border-4 border-amber-200 flex items-center justify-center relative scale-90 mx-auto no-print">
                                <div className="absolute inset-2 border-2 border-dashed border-amber-100 rounded-full" />
                                <span className="text-[7px] font-black tracking-widest text-[#FFF8D6]">OFFICIAL</span>
                              </div>
                              <span className="text-[9px] text-slate-400 block tracking-widest uppercase mt-1">SEAL OF EXPERTISE</span>
                            </div>

                            <div className="text-center space-y-10">
                              <div className="space-y-0.5 leading-none">
                                <span className="text-[10px] text-slate-400 block font-bold">Direktur Utama PT BPU</span>
                                <span className="text-[9px] text-slate-300 italic">Verified Signature</span>
                              </div>
                              <div className="space-y-0.5 font-semibold">
                                <span className="underline block text-xs font-black">Budi Santoso, M.B.A.</span>
                                <span className="text-[9px] text-slate-400 block font-mono">ID: EMP-002</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TEMPLATE 5: LAINNYA / DEFAULT COMPREHENSIVE VIEW */}
                      {previewDoc.type === 'Lainnya' && (
                        <div className="bg-white text-slate-800 p-10 border border-slate-200 rounded-xl shadow-lg font-sans relative" style={{ minHeight: '480px' }}>
                          <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <div className="flex gap-2 items-center">
                              <FileText className="w-8 h-8 text-neutral-600" />
                              <div className="text-left leading-none space-y-1">
                                <h4 className="font-extrabold text-slate-800 uppercase tracking-tight text-xs">BERKAS DIGITAL PIHAK KETIGA</h4>
                                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">{previewDoc.name}</span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full font-bold text-slate-500">
                              UMUM / OTHER
                            </span>
                          </div>

                          <div className="space-y-6 text-xs text-left">
                            <div className="bg-neutral-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                              <h5 className="font-bold text-neutral-800 text-[10px] uppercase tracking-wider">1. IDENTITAS PEMILIK BERKAS</h5>
                              <div className="grid grid-cols-2 gap-3 font-medium">
                                <div>
                                  <span className="text-[9px] text-slate-400 block">NAMA LENGKAP:</span>
                                  <span className="font-extrabold text-slate-800 uppercase">{selectedEmp.name}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">NIP KARYAWAN:</span>
                                  <span className="font-black text-blue-700 font-mono">{selectedEmp.id}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">DEPARTEMEN:</span>
                                  <span className="font-bold">{selectedEmp.department}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block">JABATAN / EMAIL:</span>
                                  <span className="font-medium text-slate-600 block truncate">{selectedEmp.position} | {selectedEmp.email}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                              <h5 className="font-bold text-neutral-800 text-[10px] uppercase tracking-wider">2. CATATAN &amp; VALIDASI HRD ADMINISTRASI</h5>
                              <div className="p-3 bg-white border border-slate-150 rounded text-slate-650 leading-relaxed italic">
                                &ldquo;{previewDoc.notes || 'Administrasi HR belum melampirkan catatan audit internal khusus untuk berkas digital ini.'}&rdquo;
                              </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl text-emerald-850 space-y-1.5 text-center shadow-xs">
                              <h6 className="font-extrabold text-[11px] uppercase tracking-wide flex items-center justify-center gap-1">
                                <Check className="w-4 h-4 text-emerald-600 animate-pulse" /> TERENKRIPSI AMAN DI REPOSITORI BPU
                              </h6>
                              <p className="text-[10.5px] max-w-sm mx-auto text-emerald-700 font-medium">
                                Dokumen digital ini diproteksi oleh integrasi SSL 256-Bit dan sistem pengarsipan cloud PT Biometric Portal Utama.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>

              {/* Footer status bar */}
              <div className="bg-slate-900 border-t border-slate-800 p-4 text-xs flex justify-between items-center text-slate-400 shrink-0">
                <span className="flex items-center gap-1">
                  🔒 PT BIOMETRIC PORTAL UTAMA · ENCRYPTED DIGITAL RESOURCE STORAGE PORTAL
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors border-0"
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
