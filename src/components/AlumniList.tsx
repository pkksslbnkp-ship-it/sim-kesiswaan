import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  RotateCcw, 
  Users, 
  Eye, 
  Trash2,
  GraduationCap 
} from 'lucide-react';

interface AlumniListProps {
  students: Student[];
  userRole: 'ADMIN' | 'GURU';
  onViewStudentDetail: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const AlumniList: React.FC<AlumniListProps> = ({
  students = [],
  userRole,
  onViewStudentDetail,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('SEMUA');
  const [selectedGradYear, setSelectedGradYear] = useState<string>('SEMUA');

  // Khusus menyaring data siswa berpangkat / berstatus 'Lulus'
  const alumniStudents = useMemo(() => {
    return students.filter((s) => s.status === 'Lulus');
  }, [students]);

  // Daftar Opsi Tahun Lulus Dinamis
  const graduationYears = useMemo(() => {
    const years = Array.from(new Set(alumniStudents.map((s) => s.graduationYear).filter(Boolean)));
    return ['SEMUA', ...years.sort().reverse()];
  }, [alumniStudents]);

  // Reset Filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGender('SEMUA');
    setSelectedGradYear('SEMUA');
  };

  // Filter Data Alumni
  const filteredAlumni = useMemo(() => {
    return alumniStudents.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchTerm)) ||
        (student.nis && student.nis.includes(searchTerm));

      const matchGender = selectedGender === 'SEMUA' || student.gender === selectedGender;
      const matchYear = selectedGradYear === 'SEMUA' || String(student.graduationYear) === selectedGradYear;

      return matchSearch && matchGender && matchYear;
    });
  }, [alumniStudents, searchTerm, selectedGender, selectedGradYear]);

  // Rekapitulasi Data Alumni Terfilter
  const rekap = useMemo(() => {
    const total = filteredAlumni.length;
    const male = filteredAlumni.filter((s) => s.gender === 'L').length;
    const female = filteredAlumni.filter((s) => s.gender === 'P').length;

    return { total, male, female };
  }, [filteredAlumni]);

  // Export CSV
  const handleExportExcel = () => {
    if (filteredAlumni.length === 0) {
      alert('Tidak ada data alumni untuk di-export.');
      return;
    }

    const headers = ['NO', 'NISN', 'NIS', 'NAMA ALUMNI', 'GENDER', 'TAHUN LULUS', 'CATATAN / STATUS'];
    const rows = filteredAlumni.map((s, idx) => [
      idx + 1,
      `"${s.nisn || ''}"`,
      `"${s.nis || ''}"`,
      `"${s.name || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.graduationYear || '-'}"`,
      `"${s.status || 'Lulus'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Alumni_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h2 className="text-xl font-bold text-slate-800">Data & Direktori Alumni</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredAlumni.length} Alumni
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar siswa yang telah menyelesaikan masa studi / lulus.
          </p>
        </div>

        <div className="flex items-center space-x-2">
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
              placeholder="Cari Nama / NISN / NIS Alumni..."
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
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">NISN / NIS</th>
                <th className="p-4">NAMA ALUMNI</th>
                <th className="p-4">GENDER</th>
                <th className="p-4">TAHUN LULUS</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAlumni.length > 0 ? (
                filteredAlumni.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-center font-medium text-slate-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-800">{student.nisn || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.nis || '-'}</div>
                    </td>
                    <td 
                      onClick={() => onViewStudentDetail(student)}
                      className="p-4 font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition"
                    >
                      {student.name}
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{student.gender}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[11px]">
                        {student.graduationYear || 'Lulus'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onViewStudentDetail(student)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Lihat Detail Alumni"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Data Alumni"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data alumni yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Ringkasan Hasil Filter Alumni */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>Rekapitulasi Hasil Filter Data Alumni</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Alumni Terfilter</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{rekap.total}</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Laki-Laki (L)</span>
            <span className="text-2xl font-black text-blue-400 mt-0.5 block">{rekap.male}</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Perempuan (P)</span>
            <span className="text-2xl font-black text-pink-400 mt-0.5 block">{rekap.female}</span>
          </div>
        </div>
      </div>

    </div>
  );
};