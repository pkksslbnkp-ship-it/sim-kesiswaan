import React, { useState, useMemo } from 'react';
import { Achievement } from '../types';
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
  Medal
} from 'lucide-react';

interface AchievementListProps {
  achievements: Achievement[];
  userRole: 'ADMIN' | 'GURU';
  onAddAchievement: () => void;
  onEditAchievement: (achievement: Achievement) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({
  achievements = [],
  userRole,
  onAddAchievement,
  onEditAchievement,
  onDeleteAchievement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('SEMUA');
  const [selectedRank, setSelectedRank] = useState<string>('SEMUA');

  // Daftar Level/Tingkat Dinamis
  const levelOptions = ['SEMUA', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'];
  
  // Daftar Ranking/Juara Dinamis
  const rankOptions = ['SEMUA', 'Juara 1', 'Juara 2', 'Juara 3', 'Harapan 1', 'Harapan 2', 'Harapan 3', 'Peserta'];

  // Reset Filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('SEMUA');
    setSelectedRank('SEMUA');
  };

  // Filter Data Prestasi
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.event && item.event.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLevel = selectedLevel === 'SEMUA' || item.level === selectedLevel;
      const matchRank = selectedRank === 'SEMUA' || item.rank === selectedRank;

      return matchSearch && matchLevel && matchRank;
    });
  }, [achievements, searchTerm, selectedLevel, selectedRank]);

  // Rekapitulasi Data Prestasi Terfilter
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

  // Export CSV
  const handleExportExcel = () => {
    if (filteredAchievements.length === 0) {
      alert('Tidak ada data prestasi untuk di-export.');
      return;
    }

    const headers = ['NO', 'NAMA SISWA', 'JUDUL PRESTASI', 'EVENT / LOMBA', 'TINGKAT', 'PERINGKAT/JUARA', 'TAHUN'];
    const rows = filteredAchievements.map((a, idx) => [
      idx + 1,
      `"${a.studentName || ''}"`,
      `"${a.title || ''}"`,
      `"${a.event || ''}"`,
      `"${a.level || ''}"`,
      `"${a.rank || ''}"`,
      `"${a.year || ''}"`
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
              onClick={onAddAchievement}
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
                {userRole === 'ADMIN' && <th className="p-4 text-center">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-800">{item.studentName}</td>
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
                    {userRole === 'ADMIN' && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onEditAchievement(item)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data prestasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Ringkasan Hasil Filter Prestasi */}
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

    </div>
  );
};