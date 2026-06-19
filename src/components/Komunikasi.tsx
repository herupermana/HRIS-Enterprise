import React, { useState } from 'react';
import { 
  Megaphone, Bell, Send, Users, CheckCircle2, AlertCircle, 
  Trash2, Search, Plus, Sparkles, Clock, Compass, HelpCircle, Info
} from 'lucide-react';
import { Employee, Announcement } from '../types';

interface KomunikasiProps {
  employees: Employee[];
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function Komunikasi({
  employees,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement
}: KomunikasiProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Pengumuman' | 'Instruksi PT' | 'Pengingat Presensi' | 'Informasi Slip Gaji' | 'Umum'>('Semua');
  
  // Compose form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Pengumuman' as Announcement['category'],
    author: 'HR Admin Utama',
    targetType: 'Semua' as Announcement['targetType'],
    targetValue: '',
    isImportant: false
  });

  // Pre-made quick templates
  const templates = [
    {
      name: 'Pengingat Absensi Mesin',
      title: '⚠️ Pengingat Deteksi Presensi Biometrik Solution X-100C',
      content: 'Selamat pagi rekan-rekan. Dimohon untuk selalu melakukan tap/tempel sidik jari pada mesin Solution X-100C saat Jam Kedatangan maupun Jam Kepulangan. Ketidaksesuaian log sidik jari tanpa surat izin terlampir akan mengakibatkan sistem HR secara otomatis memotong insentif kehadiran sebesar Rp 5.000 per keterlambatan menit. Terima kasih atas kerja samanya.',
      category: 'Pengingat Presensi' as Announcement['category'],
      isImportant: true
    },
    {
      name: 'Slip Gaji Diterbitkan',
      title: '💵 Slip Gaji Bulanan Resmi Berhasil Diterbitkan',
      content: 'Rekan-rekan karyawan yang terhormat, slip gaji dan laporan remunerasi PPh21 untuk periode berjalan sudah selesai dikompilasi oleh tim Finance. Anda kini dapat mengunduh berkas slip PDF resmi secara mandiri melalui Portal Karyawan Mandiri Anda masing-masing menggunakan tautan token aman Anda. Silakan hubungi tim Payroll jika terdapat ketidaksesuaian.',
      category: 'Informasi Slip Gaji' as Announcement['category'],
      isImportant: false
    },
    {
      name: 'Kebijakan Pengajuan Cuti',
      title: '📢 Ketentuan Baru Prosedur Pengajuan Cuti & Izin Kerja',
      content: 'Diberitahukan bahwa terhitung mulai bulan ini, setiap permohonan dispensasi cuti tahunan, sakit, atau izin khusus wajib diajukan selambat-lambatnya H-3 melalui Portal Karyawan Mandiri. Sistem kami akan otomatis mengecualikan Hari Libur Nasional resmi dan akhir pekan sehingga jatah tahunan Anda tersisa aman secara akurat. Harap melampirkan berkas penunjang (Surat Dokter, dll) untuk izin sakit.',
      category: 'Instruksi PT' as Announcement['category'],
      isImportant: false
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setFormData({
      ...formData,
      title: tpl.title,
      content: tpl.content,
      category: tpl.category,
      isImportant: tpl.isImportant
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Harap lengkapi judul dan isi pengumuman!');
      return;
    }

    if (formData.targetType !== 'Semua' && !formData.targetValue) {
      alert('Harap pilih departemen atau karyawan tertentu yang menjadi target!');
      return;
    }

    const newAnn: Announcement = {
      id: `ANNC-${Date.now()}`,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: formData.author.trim() || 'HR Admin',
      targetType: formData.targetType,
      targetValue: formData.targetType === 'Semua' ? undefined : formData.targetValue,
      readBy: [],
      isImportant: formData.isImportant
    };

    onAddAnnouncement(newAnn);
    setIsFormOpen(false);

    // Reset Form
    setFormData({
      title: '',
      content: '',
      category: 'Pengumuman',
      author: 'HR Admin Utama',
      targetType: 'Semua',
      targetValue: '',
      isImportant: false
    });

    alert('Pengumuman massal berhasil diterbitkan ke portal karyawan mandiri!');
  };

  // Get distinct departments from employees
  const departments = Array.from(new Set(employees.map(e => e.department)));

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = 
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Semua' || ann.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="komunikasi-layout-container">
      {/* Title Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 shadow-sm p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-850 tracking-tight">Modul Komunikasi &amp; Informasi Massal</h3>
            <p className="text-xs text-slate-400">Kirim pengumuman, instruksi PT, atau notifikasi pengingat otomatis ke portal karyawan</p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer shrink-0"
          id="btn-open-announcement-form"
        >
          <Plus className="w-4 h-4" /> Kirim Pengumuman Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="komunikasi-sections-grid">
        {/* Left Column: Announcement Management and Logs */}
        <div className="lg:col-span-2 space-y-6" id="announcement-list-segment">
          {/* Filters controls */}
          <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
              {(['Semua', 'Pengumuman', 'Instruksi PT', 'Pengingat Presensi', 'Informasi Slip Gaji'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-50 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Announcements Lists */}
          <div className="space-y-4" id="messages-history">
            {filteredAnnouncements.length === 0 ? (
              <div className="bg-white border text-center p-12 rounded-2xl shadow-sm" id="empty-ann-display">
                <Compass className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 font-bold text-xs">Belum ada pengumuman / reminder yang terkirim dalam kategori ini.</p>
                <p className="text-[10px] text-slate-400 mt-1">Gunakan tombol 'Kirim Pengumuman Baru' untuk menyebarkan edaran pertama.</p>
              </div>
            ) : (
              [...filteredAnnouncements].sort((a,b) => b.id.localeCompare(a.id)).map((ann) => {
                // Find read count
                const totalEmp = employees.length;
                const readCount = ann.readBy ? ann.readBy.length : 0;
                const readPct = totalEmp > 0 ? Math.round((readCount / totalEmp) * 100) : 0;
                
                return (
                  <div 
                    key={ann.id} 
                    className={`bg-white border rounded-2xl shadow-sm p-5 hover:border-slate-300 transition-all space-y-3 relative ${
                      ann.isImportant ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-600'
                    }`}
                    id={`card-ann-${ann.id}`}
                  >
                    {/* Header elements */}
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            ann.category === 'Pengingat Presensi' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            ann.category === 'Informasi Slip Gaji' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            ann.category === 'Instruksi PT' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            🎯 {ann.category}
                          </span>

                          {ann.isImportant && (
                            <span className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-200">
                              ⚠️ PRIORITAS PENTING
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ann.date}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug mt-1">{ann.title}</h4>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus pengumuman "${ann.title}"? Ini akan menghapusnya dari dashboard portal milik semua karyawan!`)) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content text */}
                    <div className="bg-slate-50/75 p-3 rounded-xl border border-slate-150 text-slate-700 text-xs leading-relaxed whitespace-pre-line font-medium">
                      {ann.content}
                    </div>

                    {/* Target audience tags and Tracking readership */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500 font-bold pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">Penerima Sasaran:</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                          📢 Transmisi: {ann.targetType === 'Semua' ? 'Seluruh Staf (Massal)' : `${ann.targetType}: ${ann.targetValue}`}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Dibuat Oleh:</span>
                        <span className="text-slate-700 font-mono italic">{ann.author}</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                        <div className="flex-1 sm:w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${readPct}%` }} />
                        </div>
                        <span className="text-blue-600 font-extrabold">{readPct}% Dibaca ({readCount}/{totalEmp} Pegawai)</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Pre-built templates quick view instructions */}
        <div className="space-y-6" id="komunikasi-assist-sidebar">
          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-850 tracking-tight flex items-center gap-1.5 pb-2 border-b">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" /> Template Pesan HR Instan
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Gunakan draf bawaan di bawah ini untuk menghemat waktu penulisan. Cukup tekan draf yang diinginkan untuk memuat isinya secara otomatis:
            </p>

            <div className="space-y-3">
              {templates.map((tpl, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setIsFormOpen(true);
                    handleApplyTemplate(tpl);
                  }}
                  className="p-3 border border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all space-y-1 block text-left group"
                >
                  <p className="text-xs font-bold text-blue-700 group-hover:text-blue-800 flex items-center gap-1.5">
                    🚀 {tpl.name}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {tpl.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-800 text-[11px] leading-relaxed font-semibold">
              📝 <strong>Bagaimana cara kerjanya?</strong>
              <div className="mt-1 font-medium text-slate-700">
                Setiap kali pengumuman dikirim, tautan notifikasi akan muncul secara real-time di bagian atas Dashboard Portal Karyawan Mandiri. Karyawan dapat menandai pesan sebagai 'Sudah Dibaca' sehingga HR dapat melacak keterbacaan (readership rate) pesan dalam persentase real-time guna mendeteksi tingkat kepatuhan staf.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Announcement Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" /> Tulis Pengumuman / Notifikasi Massal
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-all"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Kategori Pesan *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Instruksi PT">Instruksi PT</option>
                    <option value="Pengingat Presensi">Pengingat Presensi</option>
                    <option value="Informasi Slip Gaji">Informasi Slip Gaji</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Penerbit / Pembuat Pengumuman</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    placeholder="Contoh: HR Admin Utama, Direksi PT"
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-bold">Judul Pengumuman/Remind *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  placeholder="Masukkan tajuk judul pengumuman utama yang mencolok..."
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800 font-extrabold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Target Transmisi Pengumuman *</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-lg border">
                  {(['Semua', 'Departemen', 'Karyawan'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetType: type, targetValue: '' })}
                      className={`py-1.5 rounded-md font-bold text-[10px] cursor-pointer text-center ${
                        formData.targetType === type 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-slate-500 hover:bg-slate-200/50'
                      }`}
                    >
                      {type === 'Semua' ? 'Broadcast Massal' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Target Input Values */}
              {formData.targetType === 'Departemen' && (
                <div>
                  <label className="block text-gray-700 mb-1">Pilih Departemen Target *</label>
                  <select
                    required
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  >
                    <option value="">-- Pilih Departemen --</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetType === 'Karyawan' && (
                <div>
                  <label className="block text-gray-700 mb-1">Pilih Karyawan Penerima *</label>
                  <select
                    required
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-800"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (NIP: {e.id} / PIN: {e.pin})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Naskah Isi Pengumuman / Pesan *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  placeholder="Tulis rincian pengumuman secara gamblang di sini. Rekan-rekan akan menerima rincian isi ini secara instan di dashboard portal mereka."
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 bg-rose-50/50 p-2 border border-rose-100 rounded-lg">
                <input
                  type="checkbox"
                  id="chk-important"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="chk-important" className="text-slate-700 font-bold select-none cursor-pointer">
                  Tandai sebagai pengumuman prioritas penting (Sticky Badge)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-550 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow transition-all text-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Transmisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
