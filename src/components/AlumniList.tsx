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
  GraduationCap,
  Plus,
  X,
  Edit,
  Save
} from 'lucide-react';

interface AlumniListProps {
  alumni: Alumni[];
  userRole: 'ADMIN' | 'GURU';
  onAddAlumni: (data: Partial<Alumni>) => Promise<void>;
  onEditAlumni?: (data: Partial<Alumni>) => Promise<void>;
  onDeleteAlumni: (id: string) => Promise<void>;
}

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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'L',
    graduationYear: '2025-2026',
    birthPlace: '',
    birthDate: '',
    disabilityType: 'C',
    parentName: '',
    address: '',
    notes: '',
    phone: '',
    currentStatus: 'Kerja/Wirausaha',
  });

  const handleOpenAddModal = () => {
    setEditingAlumni(null);
    setFormData({
      name: '',
      gender: 'L',
      graduationYear: '2025-2026',
      birthPlace: 'Kulon Progo',
      birthDate: '',
      disabilityType: 'C',
      parentName: '',
      address: '',
      notes: '',
      phone: '',
      currentStatus: 'Kerja/Wirausaha',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Alumni) => {
    setEditingAlumni(item);
    setFormData({
      name: item.name || '',
      gender: (item.gender as 'L' | 'P') || 'L',
      graduationYear: String(item.graduationYear || '2025-2026'),
      birthPlace: (item as any).birthPlace || (item as any).birth_place || '',
      birthDate: (item as any).birthDate || (item as any).birth_date || '',
      disabilityType: (item as any).disabilityType || (item as any).disability_type || 'C',
      parentName: (item as any).parentName || (item as any).parent_name || '',
      address: item.address || '',
      notes: item.notes || '',
      phone: item.phone || '',
      currentStatus: item.currentStatus || 'Kerja/Wirausaha',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAlumni && onEditAlumni) {
      await onEditAlumni({
        id: editingAlumni.id,
        ...formData,
      });
    } else {
      await onAddAlumni(formData);
    }
    setIsModalOpen(false);
  };

  // Daftar Opsi Tahun Lulus
  const graduationYears = useMemo(() => {
    const years = Array.from(new Set(alumni.map((s) => String(s.graduationYear)).filter(Boolean)));
    return ['SEMUA', ...years.sort().reverse()];
  }, [alumni]);

  // Reset Filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGender('SEMUA');
    setSelectedGradYear('SEMUA');
  };

  // Filter Data Alumni
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

  // Export CSV Format Word
  const handleExportExcel = () => {
    if (filteredAlumni.length === 0) {
      alert('Tidak ada data alumni untuk di-export.');
      return;
    }

    const headers = ['NO', 'TAHUN KELULUSAN', 'NAMA', 'P/L', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'KETUNAAN', 'NAMA ORTU', 'ALAMAT', 'KET/STATUS'];
    const rows = filteredAlumni.map((s: any, idx) => [
      idx + 1,
      `"${s.graduationYear || '-'}"`,
      `"${s.name || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.birthPlace || s.birth_place || '-'}"`,
      `"${s.birthDate || s.birth_date || '-'}"`,
      `"${s.disabilityType || s.disability_type || '-'}"`,
      `"${s.parentName || s.parent_name || '-'}"`,
      `"${s.address || '-'}"`,
      `"${s.notes || s.currentStatus || '-'}"`
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
            Daftar siswa yang telah menyelesaikan masa studi / lulus dari sekolah.
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

      {/* Tabel Alumni Sesuai Format Word */}
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
                <th className="p-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAlumni.length > 0 ? (
                filteredAlumni.map((item: any, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="p-3.5 font-bold text-blue-600">{item.graduationYear || item.graduation_year || '-'}</td>
                    <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                    <td className="p-3.5 text-center font-semibold">{item.gender}</td>
                    <td className="p-3.5 text-slate-600">
                      {item.birthPlace || item.birth_place ? `${item.birthPlace || item.birth_place}, ` : ''}
                      {item.birthDate || item.birth_date || '-'}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-purple-700 bg-purple-50 rounded-md">
                      {item.disabilityType || item.disability_type || '-'}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{item.parentName || item.parent_name || '-'}</td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate" title={item.address}>{item.address || '-'}</td>
                    <td className="p-3.5 font-semibold text-emerald-700">{item.notes || item.currentStatus || '-'}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setDetailAlumni(item)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
                ))
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

      {/* Modal Input/Edit Alumni */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">
                {editingAlumni ? 'Edit Data Alumni' : 'Tambah Data Alumni Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Kelulusan</label>
                  <input
                    type="text"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="Contoh: 2025-2026"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender (P/L)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Alumni</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Alumni..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
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
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ketunaan</label>
                  <input
                    type="text"
                    value={formData.disabilityType}
                    onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                    placeholder="A / B / C / C1 / D"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Nama Orang Tua..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
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
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
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