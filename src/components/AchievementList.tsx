import React, { useState, useMemo } from 'react';
import { Achievement, Student } from '../types';
import { 
  Trophy, 
  Search, 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Edit2, 
  Trash2,
  Award,
  FileText,
  X,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseConfig';

interface AchievementListProps {
  achievements: Achievement[];
  students?: Student[];
  userRole: 'ADMIN' | 'GURU';
  onAddAchievement: (achievementData: Partial<Achievement>) => void;
  onEditAchievement: (achievementData: Partial<Achievement>) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({
  achievements = [],
  students = [],
  userRole,
  onAddAchievement,
  onEditAchievement,
  onDeleteAchievement,
}) => {
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('SEMUA');
  const [selectedRank, setSelectedRank] = useState<string>('SEMUA');

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);

  // State Form Input
  const [formData, setFormData] = useState<Partial<Achievement>>({
    studentId: '',
    studentName: '',
    title: '',
    event: '',
    category: 'Olahraga',
    level: 'Kabupaten/Kota',
    rank: 'Juara 1',
    year: new Date().getFullYear().toString(),
    certificateUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);

  // Filter Options
  const levelOptions = ['SEMUA', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'];
  const rankOptions = ['SEMUA', 'Juara 1', 'Juara 2', 'Juara 3', 'Harapan 1', 'Harapan 2', 'Harapan 3', 'Peserta'];

  // Handler Buka Modal Tambah Data
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      studentId: students[0]?.id || '',
      studentName: students[0]?.name || '',
      title: '',
      event: '',
      category: 'Olahraga',
      level: 'Kabupaten/Kota',
      rank: 'Juara 1',
      year: new Date().getFullYear().toString(),
      certificateUrl: '',
    });
    setIsModalOpen(true);
  };

  // Handler Buka Modal Edit Data
  const handleOpenEditModal = (item: Achievement) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  // Handler Reset Filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('SEMUA');
    setSelectedRank('SEMUA');
  };

  // Filter Data
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchSearch =
        (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLevel = selectedLevel === 'SEMUA' || item.level === selectedLevel;
      const matchRank = selectedRank === 'SEMUA' || item.rank === selectedRank;

      return matchSearch && matchLevel && matchRank;
    });
  }, [achievements, searchTerm, selectedLevel, selectedRank]);

  // Rekapitulasi Data
  const rekap = useMemo(() => {
    const total = filteredAchievements.length;
    const nasionalInter = filteredAchievements.filter(
      (a) => a.level === 'Nasional' || a.level === 'Internasional'
    ).length;
    const provKab = filteredAchievements.filter(
      (a) => a.level === 'Provinsi' || a.level === 'Kabupaten/Kota'
    ).length;
    const juaraUtama = filteredAchievements.filter(
      (a) => a.rank === 'Juara 1' || a.rank === 'Juara 2' || a.rank === 'Juara 3'
    ).length;

    return { total, nasionalInter, provKab, juaraUtama };
  }, [filteredAchievements]);

  // Handler Select Siswa
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    const selectedStudent = students.find((s) => (s.id || (s as any).nisn || s.name) === selectedVal);
    
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudent?.id || selectedVal,
      studentName: selectedStudent ? selectedStudent.name : selectedVal,
    }));
  };

  // Handler Upload Sertifikat ke Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Ukuran berkas terlalu besar! Maksimal 500 KB.');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen-siswa')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dokumen-siswa')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        certificateUrl: publicUrlData.publicUrl,
      }));
    } catch (error: any) {
      alert(`Gagal mengunggah berkas: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setUploading(false);
    }
  };

  // Handler Hapus Berkas Sertifikat
  const handleFileDelete = async () => {
    if (!formData.certificateUrl) return;
    if (!confirm('Apakah Anda yakin ingin menghapus file sertifikat ini?')) return;

    setDeletingFile(true);
    try {
      const urlPath = formData.certificateUrl.split('/dokumen-siswa/')[1];
      if (urlPath) {
        const decodedPath = decodeURIComponent(urlPath);
        await supabase.storage.from('dokumen-siswa').remove([decodedPath]);
      }
      setFormData((prev) => ({ ...prev, certificateUrl: '' }));
    } catch (error: any) {
      alert(`Gagal menghapus file: ${error.message}`);
    } finally {
      setDeletingFile(false);
    }
  };

  // Handler Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.title) {
      alert('Nama Siswa dan Judul/Kejuaraan wajib diisi!');
      return;
    }

    // Menyiapkan payload yang kompatibel dengan camelCase & snake_case
    const payload = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now().toString(),
      student_id: formData.studentId,
      student_name: formData.studentName,
      certificate_url: formData.certificateUrl,
    };

    if (editingItem) {
      onEditAchievement(payload);
    } else {
      onAddAchievement(payload);
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportExcel = () => {
    if (filteredAchievements.length === 0) {
      alert('Tidak ada data prestasi untuk di-export.');
      return;
    }

    const headers = ['NO', 'NAMA SISWA', 'JUDUL PRESTASI', 'EVENT / LOMBA', 'TINGKAT', 'PERINGKAT/JUARA', 'TAHUN', 'URL SERTIFIKAT'];
    const rows = filteredAchievements.map((a, idx) => [
      idx + 1,
      `"${a.studentName || (a as any).student_name || ''}"`,
      `"${a.title || ''}"`,
      `"${a.event || ''}"`,
      `"${a.level || ''}"`,
      `"${a.rank || ''}"`,
      `"${a.year || ''}"`,
      `"${a.certificateUrl || (a as any).certificate_url || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Prestasi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-800">Data Prestasi Siswa</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredAchievements.length} Penghargaan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catatan pencapaian, kejuaraan, dan perlombaan yang diraih oleh siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Cetak PDF</span>
          </button>
          
          {userRole === 'ADMIN' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Prestasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Data Prestasi</span>
          </div>
          {(searchTerm || selectedLevel !== 'SEMUA' || selectedRank !== 'SEMUA') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama / Lomba / Judul..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition"
            />
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none transition cursor-pointer"
            >
              {levelOptions.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl === 'SEMUA' ? 'Semua Tingkat' : lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none transition cursor-pointer"
            >
              {rankOptions.map((rnk) => (
                <option key={rnk} value={rnk}>{rnk === 'SEMUA' ? 'Semua Peringkat/Juara' : rnk}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Prestasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">NAMA SISWA</th>
                <th className="p-4">JUDUL & EVENT PRESTASI</th>
                <th className="p-4">TINGKAT</th>
                <th className="p-4">PERINGKAT</th>
                <th className="p-4">TAHUN</th>
                <th className="p-4 text-center">SERTIFIKAT</th>
                {userRole === 'ADMIN' && <th className="p-4 text-center">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((item, index) => {
                  const certUrl = item.certificateUrl || (item as any).certificate_url;
                  const sName = item.studentName || (item as any).student_name;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-center font-medium text-slate-400">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-800">{sName}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.event || '-'}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                          {item.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center w-fit space-x-1">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>{item.rank}</span>
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{item.year}</td>
                      <td className="p-4 text-center">
                        {certUrl ? (
                          <a
                            href={certUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Berkas</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tidak ada</span>
                        )}
                      </td>
                      {userRole === 'ADMIN' && (
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Data Prestasi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAchievement(item.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Data Prestasi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 8 : 7} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data prestasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Ringkasan */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Rekapitulasi Hasil Filter Data Prestasi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Terfilter</span>
            <span className="text-xl font-black text-white mt-0.5 block">{rekap.total}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Juara 1, 2, 3</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{rekap.juaraUtama}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Tingkat Prov / Kab</span>
            <span className="text-xl font-black text-blue-400 mt-0.5 block">{rekap.provKab}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Nasional / Inter</span>
            <span className="text-xl font-black text-purple-400 mt-0.5 block">{rekap.nasionalInter}</span>
          </div>
        </div>
      </div>

      {/* Modal Tambah & Edit Data Prestasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl text-slate-900 overflow-hidden my-8">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Data Prestasi' : 'Tambah Prestasi Siswa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Select Siswa / Nama Siswa */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Nama Siswa *</label>
                  {students && students.length > 0 ? (
                    <select
                      value={formData.studentId || formData.studentName || ''}
                      onChange={handleStudentSelect}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map((s) => {
                        const val = s.id || (s as any).nisn || s.name;
                        return (
                          <option key={val} value={val}>
                            {s.name} {(s as any).class ? `(${(s as any).class})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Siswa"
                      value={formData.studentName || ''}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>

                {/* Judul Prestasi */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Judul / Kejuaraan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Juara 1 Lomba Web Design"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Event */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Event / Lomba</label>
                  <input
                    type="text"
                    placeholder="Contoh: O2SN / LKS 2026"
                    value={formData.event || ''}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Kategori</label>
                  <select
                    value={formData.category || 'Olahraga'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni & Budaya">Seni & Budaya</option>
                    <option value="Keagamaan">Keagamaan</option>
                  </select>
                </div>

                {/* Tingkat */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tingkat</label>
                  <select
                    value={formData.level || 'Kabupaten/Kota'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>

                {/* Juara */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Peringkat / Juara</label>
                  <select
                    value={formData.rank || 'Juara 1'}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Juara 1">Juara 1</option>
                    <option value="Juara 2">Juara 2</option>
                    <option value="Juara 3">Juara 3</option>
                    <option value="Harapan 1">Harapan 1</option>
                    <option value="Harapan 2">Harapan 2</option>
                    <option value="Harapan 3">Harapan 3</option>
                    <option value="Peserta">Peserta / Finalis</option>
                  </select>
                </div>

                {/* Tahun */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Perolehan</label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Upload Sertifikat */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Upload Sertifikat Penghargaan</label>
                    {formData.certificateUrl && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploading || deletingFile}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 focus:outline-none cursor-pointer"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center text-xs font-bold text-amber-600 space-x-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah...</span>
                      </div>
                    )}
                  </div>

                  {formData.certificateUrl && (
                    <div className="flex items-center space-x-3 mt-2">
                      <a
                        href={formData.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline font-semibold"
                      >
                        Lihat Sertifikat Terunggah
                      </a>
                      <button
                        type="button"
                        onClick={handleFileDelete}
                        disabled={deletingFile}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition"
                      >
                        {deletingFile ? 'Menghapus...' : 'Hapus Berkas'}
                      </button>
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || deletingFile}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};