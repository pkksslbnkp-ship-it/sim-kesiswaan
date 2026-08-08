import React, { useState, useMemo } from 'react';
import { 
  Achievement, 
  AchievementLevel, 
  AchievementCategory, 
  Student, 
  UserRole 
} from '../types';
import { 
  Trophy, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  Trash2, 
  Edit, 
  Calendar, 
  X, 
  Save, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AchievementListProps {
  achievements: Achievement[];
  students: Student[];
  userRole: UserRole;
  onAddAchievement: (newAch: Omit<Achievement, 'id' | 'createdAt'>) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({
  achievements,
  students,
  userRole,
  onAddAchievement,
  onDeleteAchievement,
}) => {
  const canManage = true;

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    category: 'Akademik' as AchievementCategory,
    level: 'Provinsi' as AchievementLevel,
    organizer: '',
    rank: 'Juara 1',
    eventDate: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchStudent = a.studentName.toLowerCase().includes(q);
        const matchOrganizer = a.organizer.toLowerCase().includes(q);
        if (!matchTitle && !matchStudent && !matchOrganizer) return false;
      }

      if (selectedLevel !== 'All' && a.level !== selectedLevel) return false;
      if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;

      return true;
    });
  }, [achievements, search, selectedLevel, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.title || !formData.organizer) {
      alert('Siswa, Judul Lomba, dan Penyelenggara wajib diisi!');
      return;
    }

    const selectedStudent = students.find((s) => s.id === formData.studentId);

    onAddAchievement({
      studentId: formData.studentId,
      studentName: selectedStudent ? selectedStudent.name : 'Siswa',
      studentClass: selectedStudent ? selectedStudent.class : '-',
      title: formData.title,
      category: formData.category,
      level: formData.level,
      organizer: formData.organizer,
      rank: formData.rank,
      eventDate: formData.eventDate,
      description: formData.description,
    });

    setIsModalOpen(false);
    setFormData({
      studentId: '',
      title: '',
      category: 'Akademik',
      level: 'Provinsi',
      organizer: '',
      rank: 'Juara 1',
      eventDate: new Date().toISOString().slice(0, 10),
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modul Data Prestasi Siswa</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pencatatan rekam jejak kejuaraan akademik, olahraga, seni, dan teknologi.
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-600/20 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Prestasi</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Judul Lomba / Nama Siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">Semua Tingkat</option>
            <option value="Sekolah">Sekolah</option>
            <option value="Kabupaten/Kota">Kabupaten/Kota</option>
            <option value="Provinsi">Provinsi</option>
            <option value="Nasional">Nasional</option>
            <option value="Internasional">Internasional</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">Semua Kategori</option>
            <option value="Akademik">Akademik</option>
            <option value="Seni">Seni</option>
            <option value="Olahraga">Olahraga</option>
            <option value="Keagamaan">Keagamaan</option>
            <option value="Teknologi">Teknologi</option>
          </select>
        </div>

      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 font-bold text-xs shadow-sm">
            Belum ada catatan prestasi yang sesuai dengan filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-3 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.level === 'Internasional' || item.level === 'Nasional'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {item.level}
                  </span>

                  <span className="text-[11px] text-slate-500 font-bold flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {item.eventDate}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 mt-3 leading-snug">{item.title}</h3>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="text-xs font-black text-slate-900">{item.studentName}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">{item.studentClass}</div>
                </div>

                <div className="mt-3 text-xs space-y-1 text-slate-700 font-semibold">
                  <div>Peringkat: <strong className="text-amber-700 font-extrabold">{item.rank}</strong></div>
                  <div>Penyelenggara: <span className="text-slate-600">{item.organizer}</span></div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 mt-2 font-medium italic leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onDeleteAchievement(item.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-900 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <span>Tambah Prestasi Siswa</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              {/* Pilih Siswa */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Lomba */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul / Nama Perlombaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Juara 1 Olimpiade Matematika"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tingkat */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tingkat *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Seni">Seni</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Teknologi">Teknologi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Penyelenggara */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Penyelenggara *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dinas Pendidikan"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Rank / Peringkat */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Peringkat / Juara</label>
                  <input
                    type="text"
                    placeholder="Contoh: Juara 1 (Medali Emas)"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Keterangan Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Detail karya atau inovasi yang dilombakan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider shadow-md"
                >
                  Simpan Prestasi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
