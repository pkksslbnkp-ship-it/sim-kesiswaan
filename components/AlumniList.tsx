import React, { useState, useMemo } from 'react';
import { 
  Alumni, 
  AlumniCurrentStatus, 
  UserRole 
} from '../types';
import { 
  GraduationCap, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Trash2, 
  X, 
  Save 
} from 'lucide-react';

interface AlumniListProps {
  alumni: Alumni[];
  userRole: UserRole;
  onAddAlumni: (newAlumni: Omit<Alumni, 'id' | 'updatedAt'>) => void;
  onDeleteAlumni: (id: string) => void;
}

export const AlumniList: React.FC<AlumniListProps> = ({
  alumni,
  userRole,
  onAddAlumni,
  onDeleteAlumni,
}) => {
  const canManage = true;

  // Filters
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Add Alumni Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: `std-al-${Date.now()}`,
    nisn: '',
    name: '',
    graduationYear: 2025,
    major: 'MIPA',
    currentStatus: 'Kuliah' as AlumniCurrentStatus,
    institutionName: '',
    positionOrMajor: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const uniqueYears = useMemo(
    () => Array.from(new Set(alumni.map((a) => a.graduationYear))).sort((a, b) => Number(b) - Number(a)),
    [alumni]
  );

  const filtered = useMemo(() => {
    return alumni.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchInst = (item.institutionName || '').toLowerCase().includes(q);
        const matchNisn = item.nisn.includes(q);
        if (!matchName && !matchInst && !matchNisn) return false;
      }

      if (yearFilter !== 'All' && item.graduationYear !== parseInt(yearFilter)) return false;
      if (statusFilter !== 'All' && item.currentStatus !== statusFilter) return false;

      return true;
    });
  }, [alumni, search, yearFilter, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn) {
      alert('Nama Alumni dan NISN wajib diisi!');
      return;
    }

    onAddAlumni({
      studentId: formData.studentId,
      nisn: formData.nisn,
      name: formData.name,
      graduationYear: formData.graduationYear,
      major: formData.major,
      currentStatus: formData.currentStatus,
      institutionName: formData.institutionName,
      positionOrMajor: formData.positionOrMajor,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
    });

    setIsModalOpen(false);
    setFormData({
      studentId: `std-al-${Date.now()}`,
      nisn: '',
      name: '',
      graduationYear: 2025,
      major: 'MIPA',
      currentStatus: 'Kuliah',
      institutionName: '',
      positionOrMajor: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modul Data Alumni & Tracer Study</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pelacakan aktivitas alumni (Kuliah, Bekerja, Wirausaha) pasca kelulusan.
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Alumni</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Alumni, Kampus, Perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Tahun Lulus Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Semua Tahun Lulus</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>Lulus {y}</option>
            ))}
          </select>

          {/* Status Karir Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Status: Semua</option>
            <option value="Kuliah">Kuliah</option>
            <option value="Bekerja">Bekerja</option>
            <option value="Wirausaha">Wirausaha</option>
            <option value="Mencari Kerja">Mencari Kerja</option>
          </select>
        </div>

      </div>

      {/* Alumni Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">NISN & Nama Alumni</th>
                <th className="p-3.5">Tahun Lulus & Jurusan</th>
                <th className="p-3.5">Status Karir</th>
                <th className="p-3.5">Instansi / Perusahaan / PTN</th>
                <th className="p-3.5">Program Studi / Jabatan</th>
                <th className="p-3.5">Kontak</th>
                {canManage && <th className="p-3.5 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    Tidak ada data alumni yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NISN: {item.nisn}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-indigo-700">Lulus {item.graduationYear}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{item.major}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.currentStatus === 'Kuliah'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : item.currentStatus === 'Bekerja'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : item.currentStatus === 'Wirausaha'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {item.currentStatus}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      {item.institutionName || '-'}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-600">
                      {item.positionOrMajor || '-'}
                    </td>

                    <td className="p-3.5">
                      <div className="text-emerald-700 font-mono font-bold">{item.phone}</div>
                      {item.email && <div className="text-[10px] text-slate-400">{item.email}</div>}
                    </td>

                    {canManage && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onDeleteAlumni(item.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                          title="Hapus Data Alumni"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Tambah Catatan Alumni</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  placeholder="0057890123"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap Alumni *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Alumni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tahun Lulus</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2025 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Karir Saat Ini</label>
                  <select
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kuliah">Kuliah</option>
                    <option value="Bekerja">Bekerja</option>
                    <option value="Wirausaha">Wirausaha</option>
                    <option value="Mencari Kerja">Mencari Kerja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Perguruan Tinggi / Perusahaan</label>
                <input
                  type="text"
                  placeholder="Contoh: ITB, UNPAD, PT Telkom"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Jurusan Kuliah / Jabatan Kerja</label>
                <input
                  type="text"
                  placeholder="Contoh: S1 Teknik Informatika / Software Engineer"
                  value={formData.positionOrMajor}
                  onChange={(e) => setFormData({ ...formData, positionOrMajor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">No. HP / WhatsApp Active</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider shadow-md"
                >
                  Simpan Alumni
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
