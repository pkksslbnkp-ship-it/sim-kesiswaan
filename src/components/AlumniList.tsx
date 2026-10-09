import React, { useState, useMemo } from 'react';
import { Alumni } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Trash2,
  Plus,
  X,
  Edit,
  Save,
  Upload,
  Loader2,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabaseConfig';

interface AlumniListProps {
  alumni: Alumni[];
  userRole: 'ADMIN' | 'GURU';
  onAddAlumni: (data: Partial<Alumni>) => Promise<void>;
  onEditAlumni?: (data: Partial<Alumni>) => Promise<void>;
  onDeleteAlumni: (id: string) => Promise<void>;
}

// Opsi Standar Ketunaan / Kekhususan
const DISABILITY_OPTIONS = [
  'Tunagrahita (C)',
  'Tunarungu (B)',
  'Tunanetra (A)',
  'Tunadaksa (D)',
  'Tunalaras (E)',
  'Autis',
  'ADHD',
  'Kesulitan Belajar',
  'Cerdas Istimewa',
  'Lainnya'
];

// Helper Normalisasi Nilai Ketunaan Lama (C/C1 -> Tunagrahita (C), B -> Tunarungu (B))
const normalizeDisability = (val: string = ''): string => {
  if (!val) return 'Tunagrahita (C)';
  const clean = val.trim().toUpperCase();

  if (clean === 'C' || clean === 'C1' || clean.includes('TUNAGRAHITA')) {
    return 'Tunagrahita (C)';
  }
  if (clean === 'B' || clean.includes('TUNARUNGU')) {
    return 'Tunarungu (B)';
  }
  if (clean === 'A' || clean.includes('TUNANETRA')) {
    return 'Tunanetra (A)';
  }
  if (clean === 'D' || clean.includes('TUNADAKSA')) {
    return 'Tunadaksa (D)';
  }
  if (clean === 'E' || clean.includes('TUNALARAS')) {
    return 'Tunalaras (E)';
  }
  if (clean.includes('AUTIS')) return 'Autis';
  if (clean.includes('ADHD')) return 'ADHD';

  return val;
};

export const AlumniList: React.FC<AlumniListProps> = ({
  alumni = [],
  userRole,
  onAddAlumni,
  onEditAlumni,
  onDeleteAlumni,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('SEMUA');
  const [selectedGradYear, setSelectedGradYear] = useState<string>('SEMUA');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [detailAlumni, setDetailAlumni] = useState<Alumni | null>(null);

  // Upload State
  const [uploadingIjazah, setUploadingIjazah] = useState(false);
  const [deletingIjazah, setDeletingIjazah] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'L',
    graduationYear: '2025-2026',
    birthPlace: 'Kulon Progo',
    birthDate: '',
    disabilityType: 'Tunagrahita (C)',
    parentName: '',
    address: '',
    notes: '',
    phone: '',
    currentStatus: 'Kerja/Wirausaha',
    ijazahUrl: '',
  });

  const handleOpenAddModal = () => {
    setEditingAlumni(null);
    setFormData({
      name: '',
      gender: 'L',
      graduationYear: '2025-2026',
      birthPlace: 'Kulon Progo',
      birthDate: '',
      disabilityType: 'Tunagrahita (C)',
      parentName: '',
      address: '',
      notes: '',
      phone: '',
      currentStatus: 'Kerja/Wirausaha',
      ijazahUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Alumni) => {
    setEditingAlumni(item);
    const rawDisability = (item as any).disabilityType || (item as any).disability_type || 'C';

    setFormData({
      name: item.name || '',
      gender: (item.gender as 'L' | 'P') || 'L',
      graduationYear: String(item.graduationYear || '2025-2026'),
      birthPlace: (item as any).birthPlace || (item as any).birth_place || '',
      birthDate: (item as any).birthDate || (item as any).birth_date || '',
      disabilityType: normalizeDisability(rawDisability),
      parentName: (item as any).parentName || (item as any).parent_name || '',
      address: item.address || '',
      notes: item.notes || '',
      phone: item.phone || '',
      currentStatus: item.currentStatus || 'Kerja/Wirausaha',
      ijazahUrl: (item as any).ijazahUrl || (item as any).ijazah_url || '',
    });
    setIsModalOpen(true);
  };

  // Upload Ijazah
  const handleIjazahUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Ukuran berkas Ijazah terlalu besar! Maksimal 500 KB.');
      e.target.value = '';
      return;
    }

    setUploadingIjazah(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ijazah_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen-siswa')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dokumen-siswa')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        ijazahUrl: publicUrlData.publicUrl,
      }));
    } catch (error: any) {
      alert(`Gagal mengunggah Ijazah: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setUploadingIjazah(false);
      e.target.value = '';
    }
  };

  // Hapus Ijazah
  const handleIjazahDelete = async () => {
    if (!formData.ijazahUrl) return;
    if (!confirm('Apakah Anda yakin ingin menghapus berkas Ijazah ini?')) return;

    setDeletingIjazah(true);

    try {
      const urlPath = formData.ijazahUrl.split('/dokumen-siswa/')[1];
      if (urlPath) {
        const decodedPath = decodeURIComponent(urlPath);
        await supabase.storage.from('dokumen-siswa').remove([decodedPath]);
      }
      setFormData((prev) => ({ ...prev, ijazahUrl: '' }));
    } catch (error: any) {
      alert(`Gagal menghapus Ijazah: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setDeletingIjazah(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAlumni && onEditAlumni) {
        await onEditAlumni({
          id: editingAlumni.id,
          ...formData,
        });
      } else {
        await onAddAlumni(formData);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(`Gagal menyimpan alumni: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opsi Tahun Lulus
  const graduationYears = useMemo(() => {
    const years = Array.from(new Set(alumni.map((s) => String(s.graduationYear)).filter(Boolean)));
    return ['SEMUA', ...years.sort().reverse()];
  }, [alumni]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGender('SEMUA');
    setSelectedGradYear('SEMUA');
  };

  const filteredAlumni = useMemo(() => {
    return alumni.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((item as any).parentName && (item as any).parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchGender = selectedGender === 'SEMUA' || item.gender === selectedGender;
      const matchYear = selectedGradYear === 'SEMUA' || String(item.graduationYear) === selectedGradYear;

      return matchSearch && matchGender && matchYear;
    });
  }, [alumni, searchTerm, selectedGender, selectedGradYear]);

  const handleExportExcel = () => {
    if (filteredAlumni.length === 0) {
      alert('Tidak ada data alumni untuk di-export.');
      return;
    }

    const headers = ['NO', 'TAHUN KELULUSAN', 'NAMA', 'P/L', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'KETUNAAN', 'NAMA ORTU', 'ALAMAT', 'KET/STATUS', 'IJAZAH TERUNGGAH'];
    const rows = filteredAlumni.map((s: any, idx) => [
      idx + 1,
      `"${s.graduationYear || '-'}"`,
      `"${s.name || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.birthPlace || s.birth_place || '-'}"`,
      `"${s.birthDate || s.birth_date || '-'}"`,
      `"${normalizeDisability(s.disabilityType || s.disability_type)}"` ,
      `"${s.parentName || s.parent_name || '-'}"`,
      `"${s.address || '-'}"`,
      `"${s.notes || s.currentStatus || '-'}"`,
      `"${s.ijazahUrl || s.ijazah_url ? 'YA' : 'TIDAK'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Alumni_SLBN_1_Kulon_Progo_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h2 className="text-xl font-bold text-slate-800">Data & Direktori Alumni SLB Negeri 1 Kulon Progo</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredAlumni.length} Alumni
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar alumni terdaftar, tracer study karir, dan pengarsipan berkas ijazah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'ADMIN' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alumni Baru</span>
            </button>
          )}

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
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Data Alumni</span>
          </div>
          {(searchTerm || selectedGender !== 'SEMUA' || selectedGradYear !== 'SEMUA') && (
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
              placeholder="Cari Nama / Ortu / Alamat Alumni..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Gender</option>
              <option value="L">Laki-Laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedGradYear}
              onChange={(e) => setSelectedGradYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Tahun Lulus</option>
              {graduationYears.filter(y => y !== 'SEMUA').map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Alumni */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">NO</th>
                <th className="p-3.5">TAHUN LULUS</th>
                <th className="p-3.5">NAMA ALUMNI</th>
                <th className="p-3.5 text-center">P/L</th>
                <th className="p-3.5">TTL</th>
                <th className="p-3.5 text-center">KETUNAAN</th>
                <th className="p-3.5">NAMA ORTU</th>
                <th className="p-3.5">ALAMAT</th>
                <th className="p-3.5">KETERANGAN</th>
                <th className="p-3.5 text-center">AKSI & IJAZAH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAlumni.length > 0 ? (
                filteredAlumni.map((item: any, index) => {
                  const ijazahUrl = item.ijazahUrl || item.ijazah_url;
                  const rawDisability = item.disabilityType || item.disability_type;
                  const displayDisability = normalizeDisability(rawDisability);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 text-center font-medium text-slate-400">{index + 1}</td>
                      <td className="p-3.5 font-bold text-blue-600">{item.graduationYear || item.graduation_year || '-'}</td>
                      <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3.5 text-center font-semibold">{item.gender}</td>
                      <td className="p-3.5 text-slate-600">
                        {item.birthPlace || item.birth_place ? `${item.birthPlace || item.birth_place}, ` : ''}
                        {item.birthDate || item.birth_date || '-'}
                      </td>
                      <td className="p-3.5 text-center font-bold text-purple-700 bg-purple-50 rounded-md">
                        {displayDisability}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{item.parentName || item.parent_name || '-'}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate" title={item.address}>{item.address || '-'}</td>
                      <td className="p-3.5 font-semibold text-emerald-700">{item.notes || item.currentStatus || '-'}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailAlumni(item)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Lihat Detail Alumni"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {ijazahUrl ? (
                            <a
                              href={ijazahUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition cursor-pointer flex items-center gap-0.5 font-black text-[10px]"
                              title="Ijazah Terunggah - Klik untuk Lihat Berkas"
                            >
                              <FileCheck className="w-4 h-4 text-purple-600" />
                              <span>IJAZAH</span>
                            </a>
                          ) : (
                            <span 
                              className="p-1.5 text-slate-300 rounded-lg flex items-center gap-0.5 font-bold text-[10px] cursor-not-allowed"
                              title="Ijazah Belum Diunggah"
                            >
                              <FileCheck className="w-4 h-4 text-slate-300" />
                              <span>IJAZAH</span>
                            </span>
                          )}

                          {userRole === 'ADMIN' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit Alumni"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteAlumni(item.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Hapus Alumni"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data alumni yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input / Edit Alumni */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {editingAlumni ? 'Edit Data Alumni' : 'Tambah Data Alumni Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Kelulusan *</label>
                  <input
                    type="text"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="Contoh: 2025-2026"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender (P/L)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Alumni *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Alumni..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="Kulon Progo"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Dropdown Ketunaan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Ketunaan</label>
                  <select
                    value={formData.disabilityType}
                    onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold cursor-pointer bg-slate-50"
                  >
                    {DISABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Orang Tua..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Pekerjaan / Kuliah</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Kuliah di PLB UNY / Wirausaha Sembako"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Upload Berkas Ijazah Alumni */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-800">Upload Berkas Ijazah</label>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Maksimal 500 KB (PDF/Gambar)
                  </span>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/60">
                  {formData.ijazahUrl ? (
                    <div className="flex items-center justify-between bg-white p-2.5 border border-slate-200 rounded-xl">
                      <a
                        href={formData.ijazahUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-purple-700 hover:underline truncate mr-2"
                      >
                        <FileCheck className="w-4 h-4 shrink-0 text-purple-600" />
                        <span className="truncate">Lihat Berkas Ijazah</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleIjazahDelete}
                        disabled={deletingIjazah}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Ijazah"
                      >
                        {deletingIjazah ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition">
                      {uploadingIjazah ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-700">Pilih Berkas Ijazah</span>
                          <span className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 500KB)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png"
                        disabled={uploadingIjazah}
                        onChange={handleIjazahUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingIjazah || deletingIjazah}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>SIMPAN DATA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Alumni */}
      {detailAlumni && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">{detailAlumni.name}</h3>
                <span className="text-xs font-bold text-blue-600">Lulusan Tahun {detailAlumni.graduationYear || (detailAlumni as any).graduation_year}</span>
              </div>
              <button 
                type="button"
                onClick={() => setDetailAlumni(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Jenis Kelamin:</span>
                  <span className="font-bold text-slate-800">{detailAlumni.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Jenis Ketunaan:</span>
                  <span className="font-bold text-purple-700">
                    {normalizeDisability((detailAlumni as any).disabilityType || (detailAlumni as any).disability_type)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Tempat, Tgl Lahir:</span>
                  <span className="font-bold text-slate-800">
                    {(detailAlumni as any).birthPlace || (detailAlumni as any).birth_place || '-'}, {(detailAlumni as any).birthDate || (detailAlumni as any).birth_date || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Nama Orang Tua:</span>
                  <span className="font-bold text-slate-800">{(detailAlumni as any).parentName || (detailAlumni as any).parent_name || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] font-bold">Alamat Lengkap:</span>
                  <span className="font-bold text-slate-800">{detailAlumni.address || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] font-bold">Keterangan / Status Karir:</span>
                  <span className="font-bold text-emerald-700">{detailAlumni.notes || detailAlumni.currentStatus || '-'}</span>
                </div>
              </div>

              {/* Dokumen Ijazah */}
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Dokumen Ijazah Kelulusan</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {(detailAlumni as any).ijazahUrl || (detailAlumni as any).ijazah_url ? 'Berkas Tersedia' : 'Belum diunggah'}
                  </div>
                </div>
                {(detailAlumni as any).ijazahUrl || (detailAlumni as any).ijazah_url ? (
                  <a
                    href={(detailAlumni as any).ijazahUrl || (detailAlumni as any).ijazah_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold flex items-center space-x-1 transition"
                  >
                    <span>Lihat Ijazah</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-400 font-bold">-</span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailAlumni(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};