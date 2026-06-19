import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Award, AlertTriangle, Printer, Download, UserCheck, 
  Plus, Trash2, History, Globe, RefreshCw, FileSignature, 
  Building, Check, Copy, FileSpreadsheet, Eye
} from 'lucide-react';
import { Employee } from '../types';

interface DraftSuratProps {
  employees: Employee[];
}

interface SavedLetterDraft {
  id: string;
  type: 'contract' | 'reference' | 'warning' | 'promotion';
  letterNumber: string;
  date: string;
  employeeId: string;
  employeeName: string;
  language: 'id' | 'en';
  subject: string;
  content: string;
  signatory: string;
}

export default function DraftSurat({ employees }: DraftSuratProps) {
  // Navigation & States
  const [selectedType, setSelectedType] = useState<'contract' | 'reference' | 'warning' | 'promotion'>('contract');
  const [selectedLanguage, setSelectedLanguage] = useState<'id' | 'en'>('id');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [letterNumber, setLetterNumber] = useState<string>('');
  const [letterDate, setLetterDate] = useState<string>(() => {
    return new Date().toISOString().substring(0, 10);
  });
  
  // Custom Manual Inputs if Employee is not selected or overridden
  const [manualName, setManualName] = useState('');
  const [manualPosition, setManualPosition] = useState('');
  const [manualDepartment, setManualDepartment] = useState('');
  const [manualId, setManualId] = useState('');

  // Authorized Signatory
  const [signatoryName, setSignatoryName] = useState('Heru Permana, S.Psi.');
  const [signatoryTitle, setSignatoryTitle] = useState('Recruitment & Employee Relations Manager');

  // Contract specific settings
  const [contractDurationMonths, setContractDurationMonths] = useState('12');
  const [contractStartDate, setContractStartDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [probationMonths, setProbationMonths] = useState('3');
  const [baseSalaryOverride, setBaseSalaryOverride] = useState('');

  // Warning specific settings
  const [warningLevel, setWarningLevel] = useState<'SP1' | 'SP2' | 'SP3'>('SP1');
  const [warningReason, setWarningReason] = useState('Ketidakdisiplinan kehadiran dan keterlambatan berulang kali.');
  const [warningSanction, setWarningSanction] = useState('Surat Peringatan ini berlaku selama 6 (enam) bulan ke depan sejak diterbitkan.');

  // Reference specific settings
  const [workingPeriodYears, setWorkingPeriodYears] = useState('2');
  const [exitReason, setExitReason] = useState('Pengunduran diri secara sukses dan profesional (Resigned).');
  const [appreciationNote, setAppreciationNote] = useState('Ybs menunjukkan performa kerja dan kontribusi yang tinggi di departemennya.');

  // Promotion/Change of job specific settings
  const [newTitle, setNewTitle] = useState('Senior Specialist');
  const [promotionEffectiveDate, setPromotionEffectiveDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [salaryIncrease, setSalaryIncrease] = useState('2000000');

  // Dynamic Content state (editable text section in the preview)
  const [editableNotes, setEditableNotes] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<SavedLetterDraft[]>([]);
  const [showToast, setShowToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: '', type: 'success' });

  // References and Printable target
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Helper functions to get active employee
  const activeEmployee = employees.find(e => e.id === selectedEmpId);

  // Auto-generate a beautiful Letter Number based on Type & Date
  const generateLetterNumber = (type: string, dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const monthIndex = parseInt(dateStr.substring(5, 7), 10);
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[monthIndex - 1] || 'VI';
    const rand = Math.floor(100 + Math.random() * 900);
    
    let typeCode = 'PKWT';
    if (type === 'reference') typeCode = 'SKK';
    if (type === 'warning') typeCode = 'SP';
    if (type === 'promotion') typeCode = 'SKM';

    return `${rand}/HRD-PTES/${typeCode}/${romanMonth}/${year}`;
  };

  // Populate dynamic form when selection changes
  useEffect(() => {
    setLetterNumber(generateLetterNumber(selectedType, letterDate));
  }, [selectedType, letterDate]);

  // Load Saved Drafts on Component Init
  useEffect(() => {
    const saved = localStorage.getItem('hris_drafted_letters');
    if (saved) {
      setSavedDrafts(JSON.parse(saved));
    }
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Sync state helpers
  const getEmpName = () => activeEmployee ? activeEmployee.name : (manualName || 'John Doe');
  const getEmpId = () => activeEmployee ? activeEmployee.id : (manualId || 'EMP-999');
  const getEmpPosition = () => activeEmployee ? activeEmployee.position : (manualPosition || 'Staff Operasional');
  const getEmpDept = () => activeEmployee ? activeEmployee.department : (manualDepartment || 'Operations');
  const getEmpSalary = () => {
    if (baseSalaryOverride) return parseInt(baseSalaryOverride, 10);
    return activeEmployee ? activeEmployee.basicSalary : 6500000;
  };
  const getEmpJoinDate = () => activeEmployee ? activeEmployee.joinDate : '2024-01-15';

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  // Save Current Letter as Draft to History (Localstorage)
  const handleSaveDraft = () => {
    const newDraft: SavedLetterDraft = {
      id: `DRF-${Date.now()}`,
      type: selectedType,
      letterNumber,
      date: letterDate,
      employeeId: getEmpId(),
      employeeName: getEmpName(),
      language: selectedLanguage,
      subject: getSubjectLine(),
      content: getLetterBodyHTML(),
      signatory: signatoryName
    };

    const updatedList = [newDraft, ...savedDrafts];
    setSavedDrafts(updatedList);
    localStorage.setItem('hris_drafted_letters', JSON.stringify(updatedList));

    // Audit Log Trigger
    const customEvent = new CustomEvent('hris_add_audit_log', {
      detail: {
        module: 'Karyawan',
        action: 'Draft Surat Baru',
        details: `Draft surat rasmi '${getSubjectLine()}' untuk ${getEmpName()} berhasil digenerasikan ke sistem perarsipan.`
      }
    });
    window.dispatchEvent(customEvent);

    triggerToast('Draft surat resmi berhasil disimpan ke rekapitulasi arsip!');
  };

  const handleDeleteDraft = (id: string, name: string) => {
    if (!window.confirm(`Hapus draft surat untuk ${name}?`)) return;
    const filter = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(filter);
    localStorage.setItem('hris_drafted_letters', JSON.stringify(filter));
    triggerToast('Arsip draft berhasil dihapus.', 'info');
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (!printContent) return;

    // Create unique window context for print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan popup block tidak aktif.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedType.toUpperCase()}_${getEmpName()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Inter:wght@400;700&display=swap');
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
              line-height: 1.6;
              color: #000;
              background-color: #fff;
            }
            .a4-preview {
              max-width: 100%;
              margin: 0 auto;
            }
            .no-print {
              display: none;
            }
            .letter-header {
              border-bottom: 3px double #000;
              padding-bottom: 12px;
              margin-bottom: 24px;
              text-align: center;
            }
            .letter-title {
              text-align: center;
              font-weight: bold;
              text-decoration: underline;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .letter-number {
              text-align: center;
              font-size: 13px;
              margin-bottom: 24px;
            }
            table {
              width: 100%;
              margin: 16px 0;
              border-collapse: collapse;
            }
            td {
              padding: 4px 8px;
              vertical-align: top;
            }
            .signature-block {
              margin-top: 40px;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="a4-preview">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownloadDoc = () => {
    const textContent = printAreaRef.current?.innerText || '';
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Draft_Surat_${selectedType}_${getEmpName().replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('File draft text berhasil terunduh otomatis!');
  };

  // Format Letter Title / Subject Lines based on dynamic state
  const getSubjectLine = () => {
    if (selectedType === 'contract') {
      return selectedLanguage === 'id' 
        ? 'PERJANJIAN KERJA WAKTU TERTENTU (PKWT)' 
        : 'FIXED-TERM EMPLOYMENT AGREEMENT';
    } else if (selectedType === 'reference') {
      return selectedLanguage === 'id' 
        ? 'SURAT KETERANGAN KERJA / PAKLARING' 
        : 'CERTIFICATE OF EMPLOYMENT & REFERENCE';
    } else if (selectedType === 'warning') {
      return selectedLanguage === 'id' 
        ? `SURAT PERINGATAN KARYAWAN (${warningLevel})` 
        : `WRITTEN WARNING MEMORANDUM (${warningLevel})`;
    } else {
      return selectedLanguage === 'id' 
        ? 'SURAT KEPUTUSAN PROMOSI JABATAN' 
        : 'LETTER OF RESOLUTION FOR JOB PROMOTION';
    }
  };

  // Dynamic template rendering for Preview
  const getLetterBodyHTML = () => {
    const empName = getEmpName();
    const empId = getEmpId();
    const empPos = getEmpPosition();
    const empDept = getEmpDept();
    const empSalaryString = formatRupiah(getEmpSalary());
    const empJoinDateString = getEmpJoinDate();

    // 1. CONTRACT (PKWT) Letter Template
    if (selectedType === 'contract') {
      if (selectedLanguage === 'id') {
        return `
          <p>Perjanjian Kerja Waktu Tertentu (selanjutnya disebut "Perjanjian") ini dibuat dan disepakati pada hari ini di Jakarta, tertanggal <strong>${letterDate}</strong>, oleh dan di antara pihak-pihak di bawah ini:</p>
          
          <table style="width: 100%; font-size: 13px; margin: 12px 0;">
            <tr>
              <td style="width: 30%;"><strong>Pihak Perdana (I) :</strong></td>
              <td><strong>PT Enterprise Solutions</strong>, beralamat di Gedung Tech Hub, Lantai 4, Jakarta Selatan, dalam hal ini diwakili oleh <strong>${signatoryName}</strong> selaku <strong>${signatoryTitle}</strong>.</td>
            </tr>
            <tr>
              <td><strong>Pihak Kedua (II) :</strong></td>
              <td><strong>${empName}</strong>, No. Karyawan: <strong>${empId}</strong>, berkedudukan di Departemen <strong>${empDept}</strong> dengan jabatan awal sebagai <strong>${empPos}</strong>.</td>
            </tr>
          </table>

          <p>Para Pihak sepakat untuk mengadakan Perjanjian Kerja dengan syarat dan ketentuan yang diatur dalam pasal-pasal berikut:</p>
          
          <div style="margin-left: 12px; margin-top: 10px; font-size: 13px;">
            <p><strong>Pasal 1: Masa Kontrak &amp; Percobaan</strong><br/>
            Pihak Kedua diterima bekerja untuk jangka waktu <strong>${contractDurationMonths} bulan</strong>, terhitung sejak tanggal <strong>${contractStartDate}</strong> sampai dengan ketentuan berakhirnya kontrak secara resmi. Masa percobaan ditetapkan selama <strong>${probationMonths} bulan</strong>.</p>
            
            <p><strong>Pasal 2: Hak &amp; Kompensasi Finansial</strong><br/>
            Pihak Kedua berhak menerima Gaji Pokok sebesar <strong>${empSalaryString}</strong> per bulan beserta tunjangan kompensasi operasional resmi sesuai regulasi standard PT Enterprise Solutions.</p>
            
            <p><strong>Pasal 3: Kedisplinan &amp; Presensi</strong><br/>
            Pihak Kedua wajib mematuhi jam kerja operasional kantor dan melakukan pencatatan absensi harian melalui presensi biometric (fingerprint/portal SDK) terintegrasi.</p>
          </div>

          <p style="margin-top: 16px;">Demikian Surat Perjanjian Kerja Waktu Tertentu ini dibuat dalam rangkap dua, bermaterai cukup, dan memiliki kekuatan hukum yang setara bagi kedua belah pihak.</p>
        `;
      } else {
        return `
          <p>This Fixed-Term Employment Agreement (hereinafter referred to as the "Agreement") is made and entered into on this day of <strong>${letterDate}</strong>, in Jakarta, by and between:</p>
          
          <table style="width: 100%; font-size: 13px; margin: 12px 0;">
            <tr>
              <td style="width: 30%;"><strong>First Party (I):</strong></td>
              <td><strong>PT Enterprise Solutions</strong>, located at Tech Hub Building, 4th Floor, South Jakarta, represented herein by <strong>${signatoryName}</strong> in their capacity as <strong>${signatoryTitle}</strong>.</td>
            </tr>
            <tr>
              <td><strong>Second Party (II):</strong></td>
              <td><strong>${empName}</strong>, Employee ID: <strong>${empId}</strong>, holding the position of <strong>${empPos}</strong> under the <strong>${empDept}</strong> Division.</td>
            </tr>
          </table>

          <p>Both parties agree to establish this mutual working relationship under the following clear legal covenants:</p>
          
          <div style="margin-left: 12px; margin-top: 10px; font-size: 13px;">
            <p><strong>Article 1: Scope &amp; Period of Service</strong><br/>
            The Second Party shall serve the First Party for a specified period of <strong>${contractDurationMonths} months</strong> starting from <strong>${contractStartDate}</strong>. A mandatory performance probation of <strong>${probationMonths} months</strong> applies.</p>
            
            <p><strong>Article 2: Compensation Rates</strong><br/>
            The Second Party is entitled to a dynamic monthly basic salary of <strong>${empSalaryString}</strong> plus other operational allowances outlined in the authorized corporate policy manual.</p>
            
            <p><strong>Article 3: Intellectual Assets &amp; Compliance</strong><br/>
            The employee must log biometric fingerprints, fulfill professional work hours, maintain strict trade confidentiality, and align behavior with standard operational procedures.</p>
          </div>

          <p style="margin-top: 16px;">In witness whereof, the parties hereto have signed and executed this contract as of the date first above written, with equal legal standing.</p>
        `;
      }
    }

    // 2. REFERENCE (PAKLARING) Template
    if (selectedType === 'reference') {
      if (selectedLanguage === 'id') {
        return `
          <p>Manajemen PT Enterprise Solutions dengan ini menerangkan dan memberikan kesaksian resmi bahwa:</p>
          
          <table style="width: 100%; font-size: 13.5px; margin: 16px 0; background-color: #fafafa; border: 1px solid #e2e8f0;">
            <tr>
              <td style="width: 35%; padding: 8px;"><strong>Nama Lengkap:</strong></td>
              <td style="padding: 8px;"><strong>${empName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Nomor Induk Pegawai:</strong></td>
              <td style="padding: 8px;"><strong>${empId}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Departemen Akhir:</strong></td>
              <td style="padding: 8px;"><strong>${empDept}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Posisi Terakhir:</strong></td>
              <td style="padding: 8px;"><strong>${empPos}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Masa Bakti Kerja:</strong></td>
              <td style="padding: 8px;"><strong>${empJoinDateString} s/d ${letterDate} (± ${workingPeriodYears} Tahun)</strong></td>
            </tr>
          </table>

          <p>Ybs telah menyelesaikan masa kerjanya dengan alasan: <strong>${exitReason}</strong>.</p>
          
          <p>Selama mengabdikan keterampilannya di PT Enterprise Solutions, <strong>${appreciationNote}</strong>. Kami mengucapkan terima kasih yang sebesar-besarnya atas segala dedikasi, kontribusi, dan loyalitas yang telah dicurahkan untuk perkembangan operasional korporasi.</p>
          
          <p>Semoga Surat Keterangan Kerja resmi ini bermanfaat bagi perkembangan karir profesional ybs ke depannya di tempat tugas yang baru.</p>
        `;
      } else {
        return `
          <p>The Management in PT Enterprise Solutions hereby certifies and issues this professional testament that:</p>
          
          <table style="width: 100%; font-size: 13.5px; margin: 16px 0; background-color: #fafafa; border: 1px solid #e2e8f0;">
            <tr>
              <td style="width: 35%; padding: 8px;"><strong>Full Registered Name:</strong></td>
              <td style="padding: 8px;"><strong>${empName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Personnel ID:</strong></td>
              <td style="padding: 8px;"><strong>${empId}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Final Division:</strong></td>
              <td style="padding: 8px;"><strong>${empDept}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Final Title/Role:</strong></td>
              <td style="padding: 8px;"><strong>${empPos}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Duration of Service:</strong></td>
              <td style="padding: 8px;"><strong>${empJoinDateString} to ${letterDate} (Approx. ${workingPeriodYears} Years)</strong></td>
            </tr>
          </table>

          <p>The individual has successfully separated from service with the status/reason: <strong>${exitReason}</strong>.</p>
          
          <p>During their tenure, <strong>${appreciationNote}</strong>. We express our deep appreciation and sincere thanks for the value and dedication they contributed to our collective operational success.</p>
          
          <p>We wish them all the best in their future career endeavors and professional path.</p>
        `;
      }
    }

    // 3. WARNING LETTER (SP) Template
    if (selectedType === 'warning') {
      if (selectedLanguage === 'id') {
        return `
          <p>Surat Peringatan ini dikeluarkan atas dasar evaluasi kinerja dan kepatuhan disiplin kerja staf korporasi PT Enterprise Solutions. Diterbitkan secara resmi untuk:</p>
          
          <table style="width: 100%; font-size: 13px; margin: 12px 0;">
            <tr>
              <td style="width: 30%;"><strong>Nama Pegawai:</strong></td>
              <td><strong>${empName}</strong></td>
            </tr>
            <tr>
              <td><strong>ID Karyawan:</strong></td>
              <td><strong>${empId}</strong></td>
            </tr>
            <tr>
              <td><strong>Divisi / Unit:</strong></td>
              <td><strong>${empPos} / Departemen ${empDept}</strong></td>
            </tr>
          </table>

          <p><strong>Latar Belakang &amp; Deskripsi Masalah:</strong><br/>
          Surat Peringatan Khusus Tingkat <strong>${warningLevel}</strong> ini dikeluarkan karena: <strong>"${warningReason}"</strong> yang dinilai melanggar kesepakatan tata tertib internal perusahaan serta prosedur absensi standard.</p>
          
          <p><strong>Sanksi Ketentuan:</strong><br/>
          ${warningSanction}</p>

          <p>Pihak Manajemen mengimbau Saudara/i untuk segera melakukan perbaikan signifikan terkait disiplin kehadiran atau kinerja profesional demi kelancaran operasional tim. Pelanggaran berulang setelah masa peringatan ini dapat memicu tindakan PHK sepihak.</p>
        `;
      } else {
        return `
          <p>This Written Warning Memorandum is issued based on comprehensive behavior assessment and compliance policies of PT Enterprise Solutions. Promulgated officially to:</p>
          
          <table style="width: 100%; font-size: 13px; margin: 12px 0;">
            <tr>
              <td style="width: 30%;"><strong>Personnel Name:</strong></td>
              <td><strong>${empName}</strong></td>
            </tr>
            <tr>
              <td><strong>Employee Code:</strong></td>
              <td><strong>${empId}</strong></td>
            </tr>
            <tr>
              <td><strong>Title / Division:</strong></td>
              <td><strong>${empPos} / ${empDept} Division</strong></td>
            </tr>
          </table>

          <p><strong>Covenant Breaches &amp; Infractions:</strong><br/>
          This formal <strong>${warningLevel}</strong> Memorandum is rendered due to: <strong>"${warningReason}"</strong> which does not meet the expected professional codes, policies, or biometric tracking rules.</p>
          
          <p><strong>Sanctions and Effectiveness:</strong><br/>
          ${warningSanction}</p>

          <p>We expect immediate corrective action regarding your day-to-day discipline, and professional alignment. Failure to comply with workplace parameters may result in immediate separation or further escalation.</p>
        `;
      }
    }

    // 4. PROMOTION/MUTASI Template
    if (selectedType === 'promotion') {
      const promotionValueFormatted = formatRupiah(parseInt(salaryIncrease || '0', 10));
      if (selectedLanguage === 'id') {
        return `
          <p>Setelah melakukan peninjauan menyeluruh terhadap kontribusi kerja, kedisiplinan absensi biometric, dan prestasi sepanjang tahun kerja berjalan, PT Enterprise Solutions dengan bangga menetapkan Surat Keputusan Promosi Jabatan untuk:</p>
          
          <table style="width: 100%; font-size: 13.5px; margin: 14px 0; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <tr>
              <td style="width: 35%; padding: 6px;"><strong>Nama Karyawan:</strong></td>
              <td style="padding: 6px;"><strong>${empName}</strong> (ID: ${empId})</td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Jabatan Lama:</strong></td>
              <td style="padding: 6px;">${empPos} (Dept: ${empDept})</td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Jabatan Baru:</strong></td>
              <td style="padding: 6px;"><strong style="color: #2563eb;">${newTitle}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Ketentuan Gaji:</strong></td>
              <td style="padding: 6px;">Mengalami peningkatan tunjangan performa sebesar <strong>${promotionValueFormatted}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Tanggal Efektif:</strong></td>
              <td style="padding: 6px;"><strong>${promotionEffectiveDate}</strong></td>
            </tr>
          </table>

          <p>Manajemen berkeyakinan penuh bahwa penyesuaian kepemimpinan baru ini akan membawa percepatan positif di departemen kerja Saudara/i. Selamat bertugas dengan penuh integritas dan tanggung jawab tinggi.</p>
        `;
      } else {
        return `
          <p>Following a deliberate evaluation of work records, outstanding biometric log metrics, and performance indicators, PT Enterprise Solutions hereby issues this Promotion &amp; Assignment Directive to:</p>
          
          <table style="width: 100%; font-size: 13.5px; margin: 14px 0; background-color: #f8fafc; border: 1px solid #e2e8f0;">
            <tr>
              <td style="width: 35%; padding: 6px;"><strong>Employee Beneficiary:</strong></td>
              <td style="padding: 6px;"><strong>${empName}</strong> (ID: ${empId})</td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Former Position:</strong></td>
              <td style="padding: 6px;">${empPos} (Dept: ${empDept})</td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>New Elevated Title:</strong></td>
              <td style="padding: 6px;"><strong style="color: #2563eb;">${newTitle}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Compensation Adjustment:</strong></td>
              <td style="padding: 6px;">Granted an additional payroll allowance increment of <strong>${promotionValueFormatted}</strong></td>
            </tr>
            <tr>
              <td style="padding: 6px;"><strong>Effective Date:</strong></td>
              <td style="padding: 6px;"><strong>${promotionEffectiveDate}</strong></td>
            </tr>
          </table>

          <p>Management trusts your capability to lead your team responsibly and drive key operational values to new professional heights in our company.</p>
        `;
      }
    }
    return '';
  };

  const handleApplyPresetTemplate = (typePreset: 'absences' | 'performance_issue' | 'project_end' | 'long_term') => {
    if (selectedType === 'warning') {
      if (typePreset === 'absences') {
        setWarningReason('Tingkat ketidakhadiran kerja tanpa keterangan (alpa) melebihi batas toleransi serta keterlambatan biometric berulang kali.');
        setWarningSanction('Surat peringatan tertulis ini bermasa laku selama 6 (enam) bulan terhitung sejak diterbitkan.');
      } else if (typePreset === 'performance_issue') {
        setWarningReason('Kegagalan berturut-turut untuk mencapai sasaran kinerja (KPI) utama bulanan dan kelalaian merawat perangkat Solution Fingerprint.');
        setWarningSanction('Tunjangan khusus kinerja akan dipotong sebesar 15% selama 3 (tiga) bulan ke depan sejak SP ini ditandatangani.');
      }
    } else if (selectedType === 'reference') {
      if (typePreset === 'project_end') {
        setExitReason('Berakhirnya masa perjanjian kerja komersial (End of Fixed-Term Project contract) secara terhormat.');
        setAppreciationNote('Karyawan telah mendedikasikan kemampuannya dengan penuh disiplin, menjaga log absensi bersih, dan mematuhi etika kerja.');
      } else {
        setExitReason('Pengunduran diri sukarela (Resigned) dengan etika pemberitahuan tertulis satu bulan sebelumnya (One month notice).');
        setAppreciationNote('Ybs menunjukkan performa kerja dan kontribusi yang tinggi di departemennya.');
      }
    }
    triggerToast('Template isian berhasil disesuaikan!');
  };

  return (
    <div className="space-y-6" id="draft-surat-module">
      
      {/* Toast Notification Container */}
      {showToast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-2 bg-slate-900 border border-slate-850 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showToast.msg}</span>
        </div>
      )}

      {/* Hero Banner header */}
      <div className="bg-[#0F172A] rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden" id="draft-hero-banner">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-bold tracking-tight">Administrasi &amp; Surat Resmi Karyawan</h2>
          <p className="text-xs text-slate-400">
            Modul pengarsipan &amp; generator surat penawaran kontrak kerja (PKWT), Surat Keterangan Kerja (Paklaring), serta Memorandum SP1-SP3 terintegrasi Database.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={() => setSelectedLanguage('id')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedLanguage === 'id' ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" /> Bahasa Indonesia (ID)
          </button>
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              selectedLanguage === 'en' ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" /> English Version (EN)
          </button>
        </div>
      </div>

      {/* Main split work board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel / Inputs Customized (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Document Type Selector Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">Pilih Jenis Dokumen</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('contract')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'contract' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-extrabold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                }`}
              >
                <FileText className={`w-4 h-4 mb-2 ${selectedType === 'contract' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs block">Kontrak Kerja (PKWT)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('reference')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'reference' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-extrabold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                }`}
              >
                <Award className={`w-4 h-4 mb-2 ${selectedType === 'reference' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs block">Paklaring (Ref)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('warning')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'warning' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-extrabold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 mb-2 ${selectedType === 'warning' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs block">Surat Peringatan (SP)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('promotion')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === 'promotion' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-extrabold' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                }`}
              >
                <UserCheck className={`w-4 h-4 mb-2 ${selectedType === 'promotion' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs block">Promosi Jabatan (SKM)</span>
              </button>
            </div>
          </div>

          {/* Target Employee selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">Identitas Target Surat</h3>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Hubungkan Database Karyawan</label>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  if (e.target.value) {
                    setManualName(''); // reset manual inputs
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Buat input kustom manually --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.position} - {emp.id})</option>
                ))}
              </select>
            </div>

            {!selectedEmpId && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3 animate-fadeIn">
                <p className="text-[10px] text-slate-400 font-medium">Input manual jika pegawai belum didaftarkan di modul biometric:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">No. ID Karyawan</label>
                    <input
                      type="text"
                      placeholder="e.g. EMP-088"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Jabatan Kerja</label>
                    <input
                      type="text"
                      placeholder="e.g. Staff Ops"
                      value={manualPosition}
                      onChange={(e) => setManualPosition(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Departemen</label>
                    <input
                      type="text"
                      placeholder="e.g. Finance"
                      value={manualDepartment}
                      onChange={(e) => setManualDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Letter Settings customization (dynamic depending on selected letter type) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">Sesuaikan Berkas Dokumen</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor Surat Resmi</label>
                <input
                  type="text"
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Surat</label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold text-slate-850"
                />
              </div>
            </div>

            {/* Contract specific inputs */}
            {selectedType === 'contract' && (
              <div className="space-y-3 pb-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Durasi Kontrak (Bulan)</label>
                    <input
                      type="number"
                      value={contractDurationMonths}
                      onChange={(e) => setContractDurationMonths(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Masa Percobaan (Bulan)</label>
                    <input
                      type="number"
                      value={probationMonths}
                      onChange={(e) => setProbationMonths(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Mulai Efektif</label>
                    <input
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kustom Nominal Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      placeholder={activeEmployee ? String(activeEmployee.basicSalary) : '6500000'}
                      value={baseSalaryOverride}
                      onChange={(e) => setBaseSalaryOverride(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reference (Paklaring) specific inputs */}
            {selectedType === 'reference' && (
              <div className="space-y-3 pb-2 border-t border-slate-100 pt-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetTemplate('project_end')}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-extrabold px-2 py-1 rounded"
                  >
                    Template Selesai Kontrak
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetTemplate('long_term')}
                    className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 text-[10px] font-extrabold px-2 py-1 rounded"
                  >
                    Template Resign Sukses
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Alasan Berakhir Kerja / Exit</label>
                  <input
                    type="text"
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nilai Kinerja / Catatan Apresiasi</label>
                  <textarea
                    rows={2}
                    value={appreciationNote}
                    onChange={(e) => setAppreciationNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Estimasi Masa Bakti (Tahun)</label>
                  <input
                    type="number"
                    value={workingPeriodYears}
                    onChange={(e) => setWorkingPeriodYears(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Warning Letters specific inputs */}
            {selectedType === 'warning' && (
              <div className="space-y-3 pb-2 border-t border-slate-100 pt-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetTemplate('absences')}
                    className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-extrabold px-2 py-1 rounded"
                  >
                    Pelanggaran Absensi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetTemplate('performance_issue')}
                    className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 text-[10px] font-extrabold px-2 py-1 rounded"
                  >
                    Pelanggaran Kinerja/SOP
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tingkatan Surat Peringatan (SP)</label>
                  <div className="flex gap-2">
                    {['SP1', 'SP2', 'SP3'].map(sp => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setWarningLevel(sp as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                          warningLevel === sp 
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {sp === 'SP1' ? 'SP Kesatu (I)' : sp === 'SP2' ? 'SP Kedua (II)' : 'SP Ketiga (III)'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Deskripsi Kesalahan / Masalah Disiplin</label>
                  <textarea
                    rows={3}
                    value={warningReason}
                    onChange={(e) => setWarningReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tenggang Masa Sanksi SP</label>
                  <input
                    type="text"
                    value={warningSanction}
                    onChange={(e) => setWarningSanction(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Promotion / Mutasi specific inputs */}
            {selectedType === 'promotion' && (
              <div className="space-y-3 pb-2 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Rekomendasi Jabatan Baru</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kenaikan Gaji Bulanan (Rp)</label>
                    <input
                      type="number"
                      value={salaryIncrease}
                      onChange={(e) => setSalaryIncrease(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Mulai Berlaku Efektif</label>
                  <input
                    type="date"
                    value={promotionEffectiveDate}
                    onChange={(e) => setPromotionEffectiveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Signatory detail */}
            <div className="space-y-3 pb-2 border-t border-slate-100 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Pejabat Penandatangan</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Gelar/Jabatan Pejabat</label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Preview Side - Professional A4 Styled Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full" id="document-rendered-view">
            
            {/* Header Control for Preview */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-black text-slate-700 tracking-tight">Pratinjau Kertas Berkas Resmi</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  title="Simpan draft ke database arsip"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Simpan Draft Arsip
                </button>
                <button
                  onClick={handlePrint}
                  title="Cetak via browser print layout"
                  className="p-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadDoc}
                  title="Unduh sebagai file *.txt"
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 Paper Mockup viewport */}
            <div className="p-8 md:p-12 bg-slate-100 flex-1 overflow-y-auto max-h-[85vh] flex justify-center" id="a4-container">
              
              {/* Paper Element */}
              <div 
                ref={printAreaRef}
                className="w-full max-w-[210mm] bg-white text-black p-10 md:p-16 border rounded-sm shadow-xl min-h-[297mm] text-xs font-serif leading-relaxed relative print:shadow-none print:border-none print:px-0"
                id="a4-document-paper"
                style={{ fontFamily: 'Times New Roman, Symbol, serif' }}
              >
                
                {/* Official Corporate Letterhead Header */}
                <div className="border-b-4 border-double border-black pb-4 mb-6 text-center" id="doc-letterhead">
                  <div className="flex items-center justify-center gap-3.5">
                    <div className="w-11 h-11 bg-black text-white shrink-0 font-bold italic flex items-center justify-center text-2xl border border-black rounded-lg">
                      ES
                    </div>
                    <div className="text-left font-serif leading-tight">
                      <h1 className="text-xl font-bold tracking-tight uppercase font-serif text-black leading-tight">PT Enterprise Solutions</h1>
                      <p className="text-[10px] text-gray-700 font-sans tracking-wide">Enterprise HR Services, Biometric attendance &amp; Custom Integration platform</p>
                      <p className="text-[9px] text-gray-500 font-sans mt-0.5">Epicentre Tech Hub, L4, Jl. Rasuna Said, Jakarta Selatan &bull; Ph: (021) 8887-2115</p>
                    </div>
                  </div>
                </div>

                {/* Document Type Label & Number */}
                <div className="text-center mb-8" id="doc-title-block">
                  <h2 className="text-base font-extrabold underline tracking-wider uppercase font-serif">
                    {getSubjectLine()}
                  </h2>
                  <p className="text-xs font-serif mt-1">
                    Nomor: {letterNumber || '...'}
                  </p>
                </div>

                {/* Dynamic Content Body */}
                <div 
                  className="space-y-4 font-serif text-slate-900 leading-relaxed text-[13px]"
                  dangerouslySetInnerHTML={{ __html: getLetterBodyHTML() }}
                />

                {/* Official Legal Closing Covenants & Signature Stamp area */}
                <div className="mt-14 flex justify-between items-start pt-6 border-t border-stone-200 page-break-inside-avoid text-[12.5px]" id="doc-legal-sign">
                  <div>
                    <p className="mb-14">Diterima dan Disetujui oleh,</p>
                    <p className="font-bold underline uppercase">{getEmpName()}</p>
                    <p className="text-stone-500 text-xs font-mono">Pihak Kedua (II)</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="mb-2">Jakarta, {letterDate}</p>
                    <p className="mb-12 font-bold">PT Enterprise Solutions</p>
                    
                    {/* Tiny visual digital signed QR/seal stamp code mark */}
                    <div className="w-14 h-14 bg-stone-50 border border-stone-200/80 p-1 flex items-center justify-center my-1 select-none">
                      <div className="border-2 border-dashed border-stone-300 w-full h-full flex flex-col items-center justify-center">
                        <span className="text-[6.5px] font-sans font-black text-blue-800 scale-95 leading-none">DIGITAL YB</span>
                        <span className="text-[5.5px] font-sans text-stone-400 mt-0.5 tracking-tight font-black leading-none">VALIDATED</span>
                      </div>
                    </div>
                    
                    <p className="font-bold underline mt-2 text-right">{signatoryName}</p>
                    <p className="text-stone-500 text-xs font-sans font-semibold mt-0.5">{signatoryTitle}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* History and Archives list */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4" id="saved-drafts-history-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" /> Riwayat Rekapitulasi Draft Surat
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full">
            {savedDrafts.length} Berkas Tersimpan
          </span>
        </div>

        {savedDrafts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 border border-dashed rounded-xl text-slate-400">
            <FileSignature className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Belum ada arsip surat yang disimpan</p>
            <p className="text-[11px] text-slate-400 mt-1">Gunakan tombol "Simpan Draft Arsip" di panel atas untuk mendata korespondensi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDrafts.map((draft) => (
              <div 
                key={draft.id} 
                className="p-4 bg-slate-50 border border-slate-200 hover:border-blue-250 hover:bg-blue-50/10 rounded-xl transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
                    <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      draft.type === 'contract' ? 'bg-blue-100 text-blue-800' :
                      draft.type === 'warning' ? 'bg-rose-100 text-rose-800' :
                      draft.type === 'reference' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {draft.type === 'contract' ? 'PKWT' :
                       draft.type === 'warning' ? 'SP' :
                       draft.type === 'reference' ? 'PAKLARING' : 'PROMOSI'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-450">{draft.date}</span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1 mb-1">{draft.subject}</h4>
                  <p className="text-xs text-slate-500 font-bold">Karyawan: {draft.employeeName}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono break-all font-semibold">No: {draft.letterNumber}</p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/40">
                  <button
                    onClick={() => {
                      setSelectedType(draft.type);
                      setSelectedLanguage(draft.language);
                      setLetterNumber(draft.letterNumber);
                      setLetterDate(draft.date);
                      
                      const foundEmp = employees.find(e => e.name === draft.employeeName || e.id === draft.employeeId);
                      if (foundEmp) {
                        setSelectedEmpId(foundEmp.id);
                      } else {
                        setSelectedEmpId('');
                        setManualName(draft.employeeName);
                        setManualId(draft.employeeId);
                      }
                      setSignatoryName(draft.signatory);
                      triggerToast('Meload draft berkas lama ke layar utama.', 'info');
                    }}
                    className="text-[11px] font-black text-blue-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Buka Draft
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDraft(draft.id, draft.employeeName)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Hapus berkas ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
