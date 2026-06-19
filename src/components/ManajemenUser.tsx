import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Edit2, Trash2, 
  Check, X, RefreshCw, UserCheck, Search, Key, AlertCircle, Bookmark, CheckCircle
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface ManajemenUserProps {
  users: UserAccount[];
  activeUser: UserAccount;
  onAddUser: (u: UserAccount) => void;
  onEditUser: (u: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onSwitchUser: (id: string) => void;
}

export default function ManajemenUser({
  users,
  activeUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSwitchUser
}: ManajemenUserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  // Local state for user form
  const [formState, setFormState] = useState<Partial<UserAccount>>({
    username: '',
    name: '',
    email: '',
    role: 'Karyawan',
    department: 'Semua',
    status: 'Aktif'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormState({
      username: '',
      name: '',
      email: '',
      role: 'Karyawan',
      department: 'Semua',
      status: 'Aktif'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setFormState({ ...u });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.username || !formState.name || !formState.email) {
      alert('Semua kolom bertanda bintang (*) harus diisi!');
      return;
    }

    if (editingUser) {
      const updated: UserAccount = {
        ...editingUser,
        username: formState.username.trim().toLowerCase(),
        name: formState.name,
        email: formState.email.trim(),
        role: formState.role as UserRole,
        department: formState.department as any,
        status: formState.status as any
      };
      onEditUser(updated);
      showToast(`User ${updated.name} berhasil diperbarui!`);
    } else {
      const newUser: UserAccount = {
        id: `USR-${Date.now()}`,
        username: formState.username.trim().toLowerCase(),
        name: formState.name,
        email: formState.email.trim(),
        role: formState.role as UserRole,
        department: formState.department as any,
        status: formState.status as any,
        lastActive: '-'
      };
      onAddUser(newUser);
      showToast(`User ${newUser.name} berhasil ditambahkan!`);
    }
    setIsModalOpen(false);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'HR Manager':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Division Manager':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Karyawan':
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || 
           u.username.toLowerCase().includes(q) || 
           u.email.toLowerCase().includes(q) || 
           u.role.toLowerCase().includes(q) ||
           u.department.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="user-management-frame">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-100 bg-slate-900 border border-blue-500/30 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 shadow-sm p-5 rounded-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Manajemen User &amp; Tingkatan Akses</h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Konfigurasi registrasi operator back-office, otorisasi biometrik, dan matriks wewenang otentikasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            id="btn-add-user"
          >
            <UserPlus className="w-3.5 h-3.5" /> Registrasi User Baru
          </button>
        </div>
      </div>

      {/* Active Simulation Session QuickBar */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-indigo-400/25 border border-indigo-300/30 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Sesi Operator Aktif (Simulasi)
          </div>
          <p className="text-sm font-bold mt-1">
            Anda saat ini bertindak sebagai: <span className="underline decoration-wavy decoration-emerald-300 font-extrabold text-amber-200">{activeUser.name}</span> ({activeUser.role})
          </p>
          <p className="text-[10px] text-indigo-100 font-medium max-w-xl">
            Sistem HRIS ini mereaksi hak akses secara real-time. Klik tombol <strong>"Switch Sesi"</strong> pada tabel di bawah untuk menyamar sebagai peran lain dan menguji visualisasi limitasi menu dengan instan!
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 p-3 rounded-xl flex items-center gap-3 font-mono text-xs w-full md:w-auto">
          <Key className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="text-[11px] leading-tight flex-1">
            <span className="block font-bold text-slate-100">Scope Department:</span>
            <span className="text-amber-200">{activeUser.department === 'Semua' ? 'Seluruh PT Enterprise' : activeUser.department}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* User list Table Area */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                User Roster ({filteredUsers.length} Terdaftar)
              </h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, email, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-[11px] font-medium text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" id="user-accounts-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-indigo-50">
                    <th className="p-3">User &amp; Username</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Tingkatan Akses</th>
                    <th className="p-3">Departemen</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === activeUser.id;
                    return (
                      <tr 
                        key={u.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isSelf ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center justify-center text-xs">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                                {u.name}
                                {isSelf && (
                                  <span className="bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-widest leading-none">Me</span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium font-mono">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500 font-medium">{u.email}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${getRoleBadgeStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">{u.department}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'Aktif' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-405'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Switch simulation session */}
                            <button
                              onClick={() => {
                                onSwitchUser(u.id);
                                showToast(`Berhasil switch ke user: ${u.name}!`);
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                                isSelf 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
                              }`}
                              title="Masuk sebagai user ini"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> 
                              {isSelf ? 'Sesi Aktif' : 'Switch Sesi'}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-250 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Sunting Detail"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (isSelf) {
                                  alert('Anda tidak bisa menghapus diri Anda sendiri yang sedang aktif di-simulasikan!');
                                  return;
                                }
                                if (window.confirm(`Yakin ingin menghapus akun user ${u.name}?`)) {
                                  onDeleteUser(u.id);
                                  showToast(`User ${u.name} berhasil dihapus.`);
                                }
                              }}
                              className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-250 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 font-semibold font-sans">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs">Tidak menemukan user yang cocok.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Permissions Matrix */}
        <div className="space-y-6">
          
          {/* Access Matrix Panel */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b">
              <Shield className="w-4 h-4 text-blue-600" /> Matriks Wewenang &amp; Hak Akses
            </h4>
            
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Tingkatan hak akses mematikan atau mengunci modul visual tertentu sehingga pemisahan fungsi kontrol internal (Segregation of Duties) terjamin.
            </p>

            <div className="space-y-3">
              {/* Access Levels description cards */}
              <div className="p-3 bg-red-50/75 border border-red-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
                  Level 1: Super Admin
                </span>
                <p className="text-[10px] font-semibold text-red-950">Akses Mutlak (Unrestricted)</p>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Mampu mengakses seluruh menu administrasi, mengubah parameter jam kerja, tarif BPJS, beralih otorisasi, &amp; modifikasi database karyawan tanpa batas.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/75 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  Level 2: HR Manager
                </span>
                <p className="text-[10px] font-semibold text-emerald-950">Akses Operasional HR &amp; Biometrik</p>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Otoritas penuh pada manajemen karyawan, penarikan logs sidik jari, broadcast komunikasi massal, draft surat, serta verifikasi Final Slip Gaji (Approval Tahap 2).
                </p>
              </div>

              <div className="p-3 bg-blue-50/75 border border-blue-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                  Level 3: Division Manager
                </span>
                <p className="text-[10px] font-semibold text-blue-950">Persetujuan &amp; Review Unit Kerja</p>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Melihat profil staf khusus departemen miliknya. Memiliki tombol validasi pengajuan cuti (Tahap 1) dan lembur &amp; remunerasi penggajian (Tahap 1 MGR Approval).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                  Level 4: Karyawan
                </span>
                <p className="text-[10px] font-semibold text-slate-800">Portal Mandiri Staf (ESS Portal)</p>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Terisolasi eksklusif hanya untuk meninjau transkrip slip gaji pribadi terbayar, mengajukan form cuti-izin mandiri, serta membaca pengumuman korporasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DIALOG - REGISTER & UPDATE USER */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 font-sans space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 animate-spin" /> 
                  {editingUser ? 'Sunting Operator Account' : 'Registrasi Operator Baru'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-slate-50 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Nama Lengkap Operator *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Contoh: Heru Permana, M.T."
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Username Unik *</label>
                    <input
                      type="text"
                      required
                      value={formState.username}
                      onChange={(e) => setFormState({ ...formState, username: e.target.value.replace(/\s+/g, '') })}
                      placeholder="e.g. herup"
                      disabled={!!editingUser}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-800 disabled:opacity-60 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Alamat Email *</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. hrd@enterprise.co.id"
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Tingkatan Hak Akses *</label>
                    <select
                      value={formState.role}
                      onChange={(e) => {
                        const r = e.target.value;
                        let dept = formState.department;
                        if (r === 'Super Admin') dept = 'Semua';
                        else if (r === 'HR Manager') dept = 'Human Resources';
                        setFormState({ ...formState, role: r as any, department: dept as any });
                      }}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Division Manager">Division Manager</option>
                      <option value="Karyawan">Karyawan (ESS Portal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Cakupan Divisi *</label>
                    <select
                      value={formState.department}
                      disabled={formState.role === 'Super Admin'}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-slate-800 disabled:opacity-60 focus:outline-none"
                    >
                      <option value="Semua">Semua Divisi</option>
                      <option value="IT & Engineering">IT &amp; Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance & Accounting">Finance &amp; Accounting</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing & Sales">Marketing &amp; Sales</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Status Keaktifan Akun</label>
                  <div className="flex gap-4 p-1">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="user-status-modal"
                        checked={formState.status === 'Aktif'}
                        onChange={() => setFormState({ ...formState, status: 'Aktif' })}
                        className="cursor-pointer"
                      />
                      <span className="text-slate-700">Aktif</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="user-status-modal"
                        checked={formState.status === 'Nonaktif'}
                        onChange={() => setFormState({ ...formState, status: 'Nonaktif' })}
                        className="cursor-pointer"
                      />
                      <span className="text-slate-700">Nonaktif (Terblokir)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    {editingUser ? 'Simpan Pembaharuan' : 'Registrasi Akun'}
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
