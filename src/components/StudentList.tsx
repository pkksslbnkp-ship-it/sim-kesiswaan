import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Upload, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  GraduationCap,
  RotateCcw,
  Users
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  userRole: 'ADMIN' | 'GURU';
  schoolLogo?: string | null;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudentDetail: (student: Student) => void;
  onGraduateStudent: (student: Student) => void;
  onNavigateToImport: () => void;
}

// Daftar Pilihan Agama Lengkap
const RELIGION_LIST = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu',
  'Lainnya'
];

// Daftar Pilihan Jenis Kekhususan Lengkap
const SPECIAL_NEEDS_LIST = [
  'Tidak Ada',
  'Tunanetra',
  'Tunarungu',
  'Tunagrahita',
  'Tunadaksa',
  'Tunalaras',
  'Autism',
  'ADHD',
  'Kesulitan Belajar',
  'Tunaganda',
  'Lainnya'
];

export const StudentList: React.FC<StudentListProps> = ({
  students = [],
  userRole,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onViewStudentDetail,
  onGraduateStudent,
  onNavigateToImport,
}) => {
  // State Filter Multi-Kategori
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [selectedGender, setSelectedGender] = useState<string>('SEMUA');
  const [selectedReligion, setSelectedReligion] = useState<string>('SEMUA');
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');

  // Daftar Opsi Filter Kelas Dinamis dari Data Siswa
  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => s.class).filter(Boolean)));
    return ['SEMUA', ...classes.sort()];
  }, [students]);

  // Reset Semua Filter
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClass('SEMUA');
    setSelectedGender('SEMUA');
    setSelectedReligion('SEMUA');
    setSelectedSpecialNeeds('SEMUA');
    setSelectedStatus('SEMUA');
  };

  // Filter Multi-Kategori
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchTerm)) ||
        (student.nis && student.nis.includes(searchTerm));

      const matchClass = selectedClass === 'SEMUA' || student.class === selectedClass;
      const matchGender = selectedGender === 'SEMUA' || student.gender === selectedGender;
      const matchReligion = selectedReligion === 'SEMUA' || (student.religion || 'Islam') === selectedReligion;
      const matchSpecialNeeds = selectedSpecialNeeds === 'SEMUA' || (student.specialNeeds || 'Tidak Ada') === selectedSpecialNeeds;
      const matchStatus = selectedStatus === 'SEMUA' || (student.status || 'Aktif') === selectedStatus;

      return matchSearch && matchClass && matchGender && matchReligion && matchSpecialNeeds && matchStatus;
    });
  }, [students, searchTerm, selectedClass, selectedGender, selectedReligion, selectedSpecialNeeds, selectedStatus]);

  // Rekapitulasi Data Siswa
  const rekap = useMemo(() => {
    const total = filteredStudents.length;
    const male = filteredStudents.filter((s) => s.gender === 'L').length;
    const female = filteredStudents.filter((s) => s.gender === 'P').length;
    const active = filteredStudents.filter((s) => (s.status || 'Aktif') === 'Aktif').length;
    const specialNeedsCount = filteredStudents.filter((s) => s.specialNeeds && s.specialNeeds !== 'Tidak Ada').length;

    return { total, male, female, active, specialNeedsCount };
  }, [filteredStudents]);

  // Fungsi Export ke CSV/Excel
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert('Tidak ada data siswa untuk di-export.');
      return;
    }

    const headers = ['NO', 'NISN', 'NIS', 'NAMA SISWA', 'KELAS', 'GENDER', 'AGAMA', 'KEBUTUHAN KHUSUS', 'STATUS'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nisn || ''}"`,
      `"${s.nis || ''}"`,
      `"${s.name || ''}"`,
      `"${s.class || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.religion || 'Islam'}"`,
      `"${s.specialNeeds || 'Tidak Ada'}"`,
      `"${s.status || 'Aktif'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi Cetak PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-800">Manajemen & Data Siswa</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredStudents.length} siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pencarian, pemilahan filter multi-kategori (Kelamin, Agama, Kebutuhan Khusus, Kelas, Status), dan biodata kesiswaan.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
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
            onClick={handlePrintPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Cetak / Export PDF</span>
          </button>

          {userRole === 'ADMIN' && (
            <>
              <button
                type="button"
                onClick={onNavigateToImport}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>IMPORT EXCEL</span>
              </button>

              <button
                type="button"
                onClick={onAddStudent}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Siswa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Multi-Kategori & Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Multi-Kategori & Pencarian</span>
          </div>
          {(searchTerm || selectedClass !== 'SEMUA' || selectedGender !== 'SEMUA' || selectedReligion !== 'SEMUA' || selectedSpecialNeeds !== 'SEMUA' || selectedStatus !== 'SEMUA') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Grid Input Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Pencarian Nama/NISN */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama / NISN / NIS..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Kelas</option>
              {classOptions.filter(c => c !== 'SEMUA').map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
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

          {/* Filter Agama (Lengkap) */}
          <div>
            <select
              value={selectedReligion}
              onChange={(e) => setSelectedReligion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Agama</option>
              {RELIGION_LIST.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          {/* Filter Kebutuhan Khusus (Lengkap) */}
          <div>
            <select
              value={selectedSpecialNeeds}
              onChange={(e) => setSelectedSpecialNeeds(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Kekhususan</option>
              {SPECIAL_NEEDS_LIST.map((need) => (
                <option key={need} value={need}>{need}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">NISN / NIS</th>
                <th className="p-4">NAMA SISWA</th>
                <th className="p-4">KELAS</th>
                <th className="p-4">GENDER</th>
                <th className="p-4">AGAMA</th>
                <th className="p-4">KEKHUSUSAN</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
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
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px]">
                        {student.class}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{student.gender}</td>
                    <td className="p-4 font-medium text-slate-600">{student.religion || 'Islam'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        student.specialNeeds && student.specialNeeds !== 'Tidak Ada'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.specialNeeds || 'Tidak Ada'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        student.status === 'Aktif' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : student.status === 'Lulus'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {student.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onViewStudentDetail(student)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Lihat Detail Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {userRole === 'ADMIN' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditStudent(student)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {student.status === 'Aktif' && (
                              <button
                                type="button"
                                onClick={() => onGraduateStudent(student)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Luluskan Siswa ke Alumni"
                              >
                                <GraduationCap className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onDeleteStudent(student.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Data Siswa"
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
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data siswa yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekapitulasi Ringkasan Data Siswa */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>Rekapitulasi Hasil Filter Data Siswa</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Terfilter</span>
            <span className="text-xl font-black text-white mt-0.5 block">{rekap.total}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Laki-Laki (L)</span>
            <span className="text-xl font-black text-blue-400 mt-0.5 block">{rekap.male}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Perempuan (P)</span>
            <span className="text-xl font-black text-pink-400 mt-0.5 block">{rekap.female}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Status Aktif</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{rekap.active}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Kebutuhan Khusus</span>
            <span className="text-xl font-black text-purple-400 mt-0.5 block">{rekap.specialNeedsCount}</span>
          </div>
        </div>
      </div>

    </div>
  );
};