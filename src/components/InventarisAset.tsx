import React, { useState } from 'react';
import { 
  Laptop, Key, Shield, Tag, Calendar, User, Plus, Search, 
  Trash2, Archive, RefreshCw, AlertTriangle, CheckCircle, Info,
  Filter, Pocket, HelpCircle, FileText, CheckCircle2, ShoppingBag
} from 'lucide-react';
import { Employee, CompanyAsset } from '../types';

interface InventarisAsetProps {
  employees: Employee[];
  assets: CompanyAsset[];
  onAddAsset: (asset: CompanyAsset) => void;
  onUpdateAsset: (updatedAsset: CompanyAsset) => void;
  onDeleteAsset: (id: string) => void;
}

export default function InventarisAset({
  employees,
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}: InventarisAsetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<CompanyAsset | null>(null);

  // Add Asset Form States
  const [newAsset, setNewAsset] = useState({
    tagNumber: '',
    name: '',
    category: 'Laptop' as CompanyAsset['category'],
    serialNumber: '',
    condition: 'Baik' as CompanyAsset['condition'],
    notes: ''
  });

  // Loan Asset Form States
  const [loanForm, setLoanForm] = useState({
    employeeId: '',
    expectedReturnDate: '',
    notes: ''
  });

  // Return Asset Form States
  const [returnForm, setReturnForm] = useState({
    condition: 'Baik' as CompanyAsset['condition'],
    notes: ''
  });

  // Get current active date
  const todayStr = new Date().toISOString().substring(0, 10);

  // Filters calculation
  const categories: string[] = ['Semua', 'Laptop', 'Peralatan IT', 'Kartu Akses', 'Seragam', 'Kendaraan/Kunci', 'Lainnya'];
  const statuses: string[] = ['Semua', 'Tersedia', 'Dipinjam', 'Hilang', 'Diarsipkan'];

  // Handle addition
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.tagNumber.trim() || !newAsset.name.trim()) {
      alert('Harap isi nomor tag dan nama aset!');
      return;
    }

    // Check if tag number already exists
    if (assets.some(a => a.tagNumber.toLowerCase() === newAsset.tagNumber.trim().toLowerCase())) {
      alert('Nomor tag aset sudah digunakan!');
      return;
    }

    const asset: CompanyAsset = {
      id: `AST-${Date.now()}`,
      tagNumber: newAsset.tagNumber.trim().toUpperCase(),
      name: newAsset.name.trim(),
      category: newAsset.category,
      serialNumber: newAsset.serialNumber.trim() || undefined,
      condition: newAsset.condition,
      status: 'Tersedia',
      notes: newAsset.notes.trim() || undefined
    };

    onAddAsset(asset);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewAsset({
      tagNumber: '',
      name: '',
      category: 'Laptop',
      serialNumber: '',
      condition: 'Baik',
      notes: ''
    });

    alert('Aset baru berhasil didaftarkan ke inventaris perusahaan!');
  };

  // Open Loan Modal
  const openLoanModal = (asset: CompanyAsset) => {
    setSelectedAsset(asset);
    setLoanForm({
      employeeId: '',
      expectedReturnDate: '',
      notes: asset.notes || ''
    });
    setIsLoanModalOpen(true);
  };

  // Form submit for loaning
  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    if (!loanForm.employeeId) {
      alert('Harap pilih karyawan peminjam!');
      return;
    }

    const employee = employees.find(emp => emp.id === loanForm.employeeId);
    if (!employee) {
      alert('Karyawan tidak valid!');
      return;
    }

    const updated: CompanyAsset = {
      ...selectedAsset,
      status: 'Dipinjam',
      loanedToId: employee.id,
      loanedToName: employee.name,
      loanDate: todayStr,
      expectedReturnDate: loanForm.expectedReturnDate || undefined,
      notes: loanForm.notes || selectedAsset.notes,
      actualReturnDate: undefined
    };

    onUpdateAsset(updated);
    setIsLoanModalOpen(false);
    setSelectedAsset(null);
    alert(`Aset berhasil dipinjamkan ke ${employee.name}`);
  };

  // Open Return Modal
  const openReturnModal = (asset: CompanyAsset) => {
    setSelectedAsset(asset);
    setReturnForm({
      condition: asset.condition,
      notes: asset.notes || ''
    });
    setIsReturnModalOpen(true);
  };

  // Form submit for returns
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const updated: CompanyAsset = {
      ...selectedAsset,
      status: 'Tersedia',
      condition: returnForm.condition,
      actualReturnDate: todayStr,
      notes: returnForm.notes || undefined,
      // Keep transaction logs but remove current loanee pointer
      loanedToId: undefined,
      loanedToName: undefined
    };

    onUpdateAsset(updated);
    setIsReturnModalOpen(false);
    setSelectedAsset(null);
    alert(`Aset berhasil dikembalikan dengan status kondisi: ${returnForm.condition}`);
  };

  // Change asset status directly (for lost/archived)
  const handleChangeStatus = (asset: CompanyAsset, newStatus: CompanyAsset['status']) => {
    const updated: CompanyAsset = {
      ...asset,
      status: newStatus,
      // If archived or lost, remove loan info
      ...(newStatus === 'Hilang' || newStatus === 'Diarsipkan' ? {
        loanedToId: undefined,
        loanedToName: undefined,
        loanDate: undefined,
        expectedReturnDate: undefined
      } : {})
    };
    onUpdateAsset(updated);
  };

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.loanedToName && asset.loanedToName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'Semua' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'Semua' || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate high level stats
  const totalAssets = assets.length;
  const loanedCount = assets.filter(a => a.status === 'Dipinjam').length;
  const availableCount = assets.filter(a => a.status === 'Tersedia').length;
  const lostCount = assets.filter(a => a.status === 'Hilang').length;

  // Overdue count check
  const overdueCount = assets.filter(a => {
    if (a.status !== 'Dipinjam' || !a.expectedReturnDate) return false;
    return a.expectedReturnDate < todayStr;
  }).length;

  return (
    <div className="space-y-6 animate-fadeIn" id="inventaris-layout-container">
      {/* Informative Header card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 shadow-sm p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-850 tracking-tight">Pelacakan Inventaris Aset Perusahaan</h3>
            <p className="text-xs text-slate-400">Kelola peminjaman laptop, kartu sandi pintu, seragam kerja, dan audit kondisi pengembalian karyawan</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer shrink-0"
          id="btn-register-new-asset"
        >
          <Plus className="w-4 h-4" /> Registrasi Aset Baru
        </button>
      </div>

      {/* Statistics board */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="assets-stats-panel">
        <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Aset Reg</span>
            <span className="text-lg font-black text-slate-800">{totalAssets} Unit</span>
          </div>
          <span className="p-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold font-mono">AST</span>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sedang Dipinjam</span>
            <span className="text-lg font-black text-indigo-600">{loanedCount} Unit</span>
          </div>
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold font-mono">LOAN</span>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tersedia di Gudang</span>
            <span className="text-lg font-black text-emerald-600">{availableCount} Unit</span>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold font-mono">READY</span>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Terlambat Kembali</span>
            <span className={`text-lg font-black ${overdueCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
              {overdueCount} Unit
            </span>
          </div>
          <span className={`p-2 rounded-xl text-xs font-bold font-mono ${overdueCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            OVERDUE
          </span>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Laporan Hilang</span>
            <span className="text-lg font-black text-rose-600">{lostCount} Aset</span>
          </div>
          <span className="p-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold font-mono">LOST</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between" id="assets-control-bar">
        {/* Search Input */}
        <div className="relative w-full xl:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, tag No, karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Filter segment tabs */}
        <div className="flex flex-wrap gap-4 items-center w-full xl:justify-end">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[200px]">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold p-2 rounded-xl text-slate-700 w-full"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold p-2 rounded-xl text-slate-700 w-full"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="assets-grid">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full bg-white border text-center p-16 rounded-2xl shadow-sm">
            <Archive className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-550 font-bold text-xs">Tidak ada aset atau kecocokan inventaris yang ditemukan.</p>
            <p className="text-[10px] text-slate-400 mt-1">Sesuaikan filter penelusuran atau tambahkan objek inventaris baru.</p>
          </div>
        ) : (
          filteredAssets.map(asset => {
            const isOverdue = asset.status === 'Dipinjam' && asset.expectedReturnDate && asset.expectedReturnDate < todayStr;
            
            // Get Category specific icon
            const getIcon = () => {
              switch(asset.category) {
                case 'Laptop': return <Laptop className="w-5 h-5 text-indigo-600" />;
                case 'Kartu Akses': return <Key className="w-5 h-5 text-amber-600" />;
                case 'Seragam': return <Shield className="w-5 h-5 text-emerald-600" />;
                case 'Kendaraan/Kunci': return <Key className="w-5 h-5 text-sky-600" />;
                default: return <Tag className="w-5 h-5 text-purple-600" />;
              }
            };

            return (
              <div 
                key={asset.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between ${
                  isOverdue ? 'border-2 border-red-300 bg-red-50/10' : ''
                }`}
                id={`asset-card-${asset.id}`}
              >
                <div className="space-y-2.5">
                  {/* Category and Condition header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                      📦 {asset.category}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      asset.condition === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-800' :
                      asset.condition === 'Baik' ? 'bg-blue-100 text-blue-850' :
                      asset.condition === 'Bisa Digunakan' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800 animate-pulse'
                    }`}>
                      Kondisi: {asset.condition}
                    </span>
                  </div>

                  {/* Name and Tag */}
                  <div>
                    <div className="flex items-center gap-2">
                      {getIcon()}
                      <h4 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-1" title={asset.name}>
                        {asset.name}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <span>Tag:</span>
                      <span className="font-mono text-slate-700 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-150">
                        {asset.tagNumber}
                      </span>
                      {asset.serialNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-500 truncate" title={`S/N: ${asset.serialNumber}`}>
                            SN: {asset.serialNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-2" />

                  {/* Loan assignment information */}
                  {asset.status === 'Dipinjam' ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2 text-[11px]">
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Peminjam:</span>
                        <span className="text-slate-850 font-extrabold flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {asset.loanedToName}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Tgl Pinjam:</span>
                        <span className="text-slate-700 font-mono font-semibold">{asset.loanDate}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Tgl Pengembalian:</span>
                        <span className={`font-mono font-bold ${isOverdue ? 'text-red-650' : 'text-slate-700'}`}>
                          {asset.expectedReturnDate || 'Tidak Terbatas'}
                        </span>
                      </div>

                      {isOverdue && (
                        <div className="flex items-center gap-1 text-[10px] bg-red-150 text-red-700 font-black p-1 rounded justify-center animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" /> LEWAT BATAS KEMBALI
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-2 inline-flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      {asset.status === 'Tersedia' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-150">
                          <CheckCircle className="w-3.5 h-3.5" /> Tersedia di Inventory
                        </span>
                      )}
                      
                      {asset.status === 'Hilang' && (
                        <span className="inline-flex items-center gap-1 text-red-650 bg-red-50 px-2 py-1 rounded-lg border border-red-150">
                          <AlertTriangle className="w-3.5 h-3.5" /> Kehilangan / Rusak Total
                        </span>
                      )}

                      {asset.status === 'Diarsipkan' && (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50/50 px-2 py-1 rounded-lg border border-slate-200">
                          <Archive className="w-3.5 h-3.5" /> Diarsipkan
                        </span>
                      )}
                    </div>
                  )}

                  {asset.notes && (
                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 italic font-medium">
                      Catatan: {asset.notes}
                    </p>
                  )}
                </div>

                {/* Actions buttons footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-bold">
                  {/* Left hand action: state alteration */}
                  <div className="flex items-center gap-1">
                    {asset.status === 'Tersedia' ? (
                      <button
                        onClick={() => openLoanModal(asset)}
                        className="bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-xs"
                      >
                        Pinjamkan Aset
                      </button>
                    ) : asset.status === 'Dipinjam' ? (
                      <button
                        onClick={() => openReturnModal(asset)}
                        className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-xs"
                      >
                        Proses Pengembalian
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChangeStatus(asset, 'Tersedia')}
                        className="text-indigo-600 hover:underline cursor-pointer"
                        title="Kembalikan status ke Tersedia"
                      >
                        Seting Tersedia
                      </button>
                    )}
                  </div>

                  {/* Right hand actions: Delete & other status toggle dropdowns */}
                  <div className="flex items-center gap-1.5">
                    {asset.status === 'Tersedia' && (
                      <>
                        <button
                          onClick={() => {
                            if (confirm('Ubah status aset menjadi Hilang?')) {
                              handleChangeStatus(asset, 'Hilang');
                            }
                          }}
                          className="text-rose-500 hover:bg-rose-50 px-2 py-1 rounded transition-all cursor-pointer"
                          title="Tandai Hilang"
                        >
                          Hilang
                        </button>
                        <span className="text-slate-200">|</span>
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Hapus permanen aset "${asset.name}" dari sistem data HRIS?`)) {
                          onDeleteAsset(asset.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Aset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. Modal: Register New Asset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" /> Registrasi Nomor Tag &amp; Inventaris Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-all font-bold text-base"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Nomor Tag Aset *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.tagNumber}
                    placeholder="Contoh: PT-LPT-029"
                    onChange={(e) => setNewAsset({ ...newAsset, tagNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Kategori Aset *</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  >
                    <option value="Laptop">Laptop / Komputer</option>
                    <option value="Peralatan IT">Peralatan IT / Gadget</option>
                    <option value="Kartu Akses">Kartu Akses RFID / PIN</option>
                    <option value="Seragam">Seragam Pegawai</option>
                    <option value="Kendaraan/Kunci">Kendaraan / Kunci Brankas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Nama Deskriptif Aset *</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  placeholder="Contoh: Asus ZenBook OLED, Seragam Batik PT L"
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Serial Number (Opsional)</label>
                  <input
                    type="text"
                    value={newAsset.serialNumber}
                    placeholder="S/N: C02..."
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Kondisi Awal *</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik / Normal</option>
                    <option value="Bisa Digunakan">Bisa Digunakan / Ada Lecet</option>
                    <option value="Rusak/Perbaikan">Rusak / Sedang Perbaikan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Keterangan Tambahan / Alokasi Penyimpanan</label>
                <textarea
                  rows={2}
                  value={newAsset.notes}
                  placeholder="Misal: Tersimpan di rak IT lemari C lantai 2..."
                  onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-550 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer"
                >
                  Daftarkan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Loan Asset (Check-Out) */}
      {isLoanModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" /> Form Check-out / Peminjaman Aset
              </h3>
              <button
                onClick={() => {
                  setIsLoanModalOpen(false);
                  setSelectedAsset(null);
                }}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl font-bold text-base transition-all"
              >
                ×
              </button>
            </div>

            <div className="bg-indigo-50/40 p-4 border-b border-indigo-100/50 text-xs">
              <div className="flex justify-between font-bold text-slate-500 mb-1">
                <span>Aset terpilih:</span>
                <span className="text-slate-800">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>Nomor Tag Aset:</span>
                <span className="text-slate-800 font-mono font-black">{selectedAsset.tagNumber}</span>
              </div>
            </div>

            <form onSubmit={handleLoanSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-gray-700 mb-1">Pilih Karyawan Peminjam *</label>
                <select
                  required
                  value={loanForm.employeeId}
                  onChange={(e) => setLoanForm({ ...loanForm, employeeId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                >
                  <option value="">-- Cari / Pilih Nama Karyawan --</option>
                  {employees.filter(e => e.status === 'Aktif').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID: {emp.id} · {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Ekspektasi Batas Tanggal Pengembalian (Opsional)</label>
                <input
                  type="date"
                  value={loanForm.expectedReturnDate}
                  min={todayStr}
                  onChange={(e) => setLoanForm({ ...loanForm, expectedReturnDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika peminjaman tidak dibatasi waktu dinas khusus</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Memo Deskripsi Pengeluaran / Pinjam</label>
                <textarea
                  rows={2}
                  value={loanForm.notes}
                  placeholder="Keterangan alokasi proyek atau keperluan peminjaman..."
                  onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoanModalOpen(false);
                    setSelectedAsset(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-550 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer"
                >
                  Set Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Return Asset (Check-In Audit) */}
      {isReturnModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Proses Penyerahan &amp; Pengembalian Aset
              </h3>
              <button
                onClick={() => {
                  setIsReturnModalOpen(false);
                  setSelectedAsset(null);
                }}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl font-bold text-base transition-all"
              >
                ×
              </button>
            </div>

            <div className="bg-emerald-50/40 p-4 border-b border-emerald-100/50 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-500">
                <span>Aset yang Dikembalikan:</span>
                <span className="text-slate-800 font-extrabold">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>Dari Karyawan:</span>
                <span className="text-indigo-750 font-bold">{selectedAsset.loanedToName}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>Tanggal Dipinjam:</span>
                <span className="text-slate-700 font-mono font-semibold">{selectedAsset.loanDate}</span>
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-gray-700 mb-1">Kondisi Fisik Saat Dikembalikan *</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                >
                  <option value="Sangat Baik">Sangat Baik (Sama Seperti Semula)</option>
                  <option value="Baik">Baik (Normal Lecet Pemakaian Halus)</option>
                  <option value="Bisa Digunakan">Terjadi Lecet / Ada Kurang Kelengkapan</option>
                  <option value="Rusak/Perbaikan">Rusak Berat / Perlu Servis Bengkel</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Catatan Audit Serah Terima</label>
                <textarea
                  rows={2}
                  value={returnForm.notes}
                  placeholder="Misal: Charger laptop hilang, body tergores halus, atau kembali utuh..."
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsReturnModalOpen(false);
                    setSelectedAsset(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-550 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
