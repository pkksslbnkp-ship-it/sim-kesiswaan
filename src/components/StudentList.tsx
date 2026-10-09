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
  Users,
  ArrowLeftRight
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
  onMutateStudent?: (student: Student) => void;
  onNavigateToImport: () => void;
}

const RELIGION_LIST = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu',
  'Lainnya'
];

const SPECIAL_NEEDS_LIST = [
  'Tidak Ada',
  'Tunanetra (A)',
  'Tunarungu (B)',
  'Tunagrahita (C)',
  'Tunadaksa (D)',
  'Tunalaras (E)',
  'Autis',
  'ADHD',
  'Kesulitan Belajar',
  'Cerdas Istimewa',
  'Lainnya'
];

// Helper Ekstraksi Angka Kelas (misal: "11B" -> "11", "7C1" -> "7")
const extractGradeNumber = (className: string = ''): string => {
  if (!className) return '';
  const match = className.trim().match(/\b(10|11|12|[1-9])\b/) || className.trim().match(/^(\d+)/);
  return match ? match[1] : '';
};

// Helper Jenjang Pendidikan
const getJenjangFromClass = (className: string = ''): 'SD' | 'SMP' | 'SMA' | 'LAINNYA' => {
  const numStr = extractGradeNumber(className);
  if (numStr) {
    const num = parseInt(numStr, 10);
    if (num >= 1 && num <= 6) return 'SD';
    if (num >= 7 && num <= 9) return 'SMP';
    if (num >= 10 && num <= 12) return 'SMA';
  }

  const clean = className.trim().toUpperCase();
  if (/\b(XII|XI|X)\b/.test(clean)) return 'SMA';
  if (/\b(IX|VIII|VII)\b/.test(clean)) return 'SMP';
  if (/\b(VI|V|IV|III|II|I)\b/.test(clean)) return 'SD';

  return 'LAINNYA';
};

export const StudentList: React.FC<StudentListProps> = ({
  students = [],
  userRole,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onViewStudentDetail,
  onGraduateStudent,
  onMutateStudent,
  onNavigateToImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('SEMUA');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [selectedGender, setSelectedGender] = useState<string>('SEMUA');
  const [selectedReligion, setSelectedReligion] = useState<string>('SEMUA');
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');

  // Daftar Opsi Kelas yang Rapi (Hanya Angka 1-12)
  const classOptions = useMemo(() => {
    const extractedGrades = new Set<number>();

    students.forEach((s) => {
      const gradeNum = extractGradeNumber(s.class || '');
      if (gradeNum) {
        const num = parseInt(gradeNum, 10);
        
        // Filter berdasarkan Jenjang yang dipilih
        if (selectedLevel === 'SEMUA') {
          extractedGrades.add(num);
        } else if (selectedLevel === 'SD' && num >= 1 && num <= 6) {
          extractedGrades.add(num);
        } else if (selectedLevel === 'SMP' && num >= 7 && num <= 9) {
          extractedGrades.add(num);
        } else if (selectedLevel === 'SMA' && num >= 10 && num <= 12) {
          extractedGrades.add(num);
        }
      }
    });

    const sorted = Array.from(extractedGrades).sort((a, b) => a - b);
    return ['SEMUA', ...sorted.map((num) => num.toString())];
  }, [students, selectedLevel]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('SEMUA');
    setSelectedClass('SEMUA');
    setSelectedGender('SEMUA');
    setSelectedReligion('SEMUA');
    setSelectedSpecialNeeds('SEMUA');
    setSelectedStatus('SEMUA');
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (!student) return false;

      // 1. Teks Pencarian
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        term === '' ||
        (student.name || '').toLowerCase().includes(term) ||
        (student.nisn || '').toLowerCase().includes(term) ||
        (student.nis || '').toLowerCase().includes(term);

      // 2. Filter Jenjang
      const studentJenjang = getJenjangFromClass(student.class || '');
      const matchLevel = selectedLevel === 'SEMUA' || studentJenjang === selectedLevel;

      // 3. Filter Kelas Tingkat (Mencocokkan angka kelas, misal "11" cocok dengan "11A", "11B")
      const studentGradeNum = extractGradeNumber(student.class || '');
      const matchClass = selectedClass === 'SEMUA' || studentGradeNum === selectedClass;

      // 4. Filter Gender
      const rawGender = (student.gender || 'L').trim().toUpperCase();
      const matchGender = selectedGender === 'SEMUA' || rawGender === selectedGender;

      // 5. Filter Agama
      const matchReligion =
        selectedReligion === 'SEMUA' ||
        (student.religion || 'Islam').trim().toLowerCase() === selectedReligion.trim().toLowerCase();

      // 6. Filter Kebutuhan Khusus
      const rawNeeds = (student.specialNeeds || '').trim().toLowerCase();
      const cleanNeeds = rawNeeds.replace(/\s*\([^)]*\)/g, '').trim();
      const isNoNeeds =
        !rawNeeds ||
        cleanNeeds === 'tidak ada' ||
        cleanNeeds === 'tidak ada (non-disabilitas)' ||
        cleanNeeds === '-' ||
        cleanNeeds === 'none';

      let matchSpecialNeeds = false;
      if (selectedSpecialNeeds === 'SEMUA') {
        matchSpecialNeeds = true;
      } else if (selectedSpecialNeeds === 'Tidak Ada') {
        matchSpecialNeeds = isNoNeeds;
      } else {
        const targetClean = selectedSpecialNeeds.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
        matchSpecialNeeds = !isNoNeeds && (cleanNeeds.includes(targetClean) || targetClean.includes(cleanNeeds));
      }

      // 7. Filter Status
      const studentStatus = (student.status || 'Aktif').trim().toLowerCase();
      const matchStatus =
        selectedStatus === 'SEMUA' || studentStatus === selectedStatus.trim().toLowerCase();

      return (
        matchSearch &&
        matchLevel &&
        matchClass &&
        matchGender &&
        matchReligion &&
        matchSpecialNeeds &&
        matchStatus
      );
    });
  }, [students, searchTerm, selectedLevel, selectedClass, selectedGender, selectedReligion, selectedSpecialNeeds, selectedStatus]);

  const rekap = useMemo(() => {
    const total = filteredStudents.length;
    const male = filteredStudents.filter((s) => (s.gender || 'L').toUpperCase() === 'L').length;
    const female = filteredStudents.filter((s) => (s.gender || 'L').toUpperCase() === 'P').length;
    const active = filteredStudents.filter((s) => (s.status || 'Aktif') === 'Aktif').length;
    const specialNeedsCount = filteredStudents.filter((s) => {
      const needs = (s.specialNeeds || '').trim().toLowerCase();
      return needs && needs !== 'tidak ada' && needs !== 'tidak ada (non-disabilitas)' && needs !== '-';
    }).length;

    return { total, male, female, active, specialNeedsCount };
  }, [filteredStudents]);

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert('Tidak ada data siswa untuk di-export.');
      return;
    }

    const headers = ['NO', 'NISN', 'NIS', 'NAMA SISWA', 'JENJANG', 'KELAS', 'GENDER', 'AGAMA', 'KEBUTUHAN KHUSUS', 'STATUS'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nisn || ''}"`,
      `"${s.nis || ''}"`,
      `"${s.name || ''}"`,
      `"${getJenjangFromClass(s.class || '')}"`,
      `"${s.class || ''}"`,
      `"${s.gender || 'L'}"`,
      `"${s.religion || 'Islam'}"`,
      `"${s.specialNeeds || 'Tidak Ada'}"`,
      `"${s.status || 'Aktif'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_${selectedLevel !== 'SEMUA' ? selectedLevel + '_' : ''}${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-800">Manajemen & Data Siswa</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredStudents.length} dari {students.length} siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Pencarian, filter multi-kategori (Jenjang, Tingkat Kelas, Kelamin, Agama, Kekhususan, Status), dan pengelolaan data siswa.
          </p>
        </div>

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
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Cetak PDF</span>
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

      {/* Filter Multi-Kategori Layout Flexible Wrap */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Multi-Kategori & Pencarian</span>
          </div>
          {(searchTerm || selectedLevel !== 'SEMUA' || selectedClass !== 'SEMUA' || selectedGender !== 'SEMUA' || selectedReligion !== 'SEMUA' || selectedSpecialNeeds !== 'SEMUA' || selectedStatus !== 'SEMUA') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Container Flex Wrap Agar Tulisan Tidak Terpotong */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Input Cari */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama / NISN / NIS..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Jenjang */}
          <div className="min-w-[130px]">
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass('SEMUA');
              }}
              className="w-full px-2.5 py-2 bg-blue-50/80 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-600 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Jenjang</option>
              <option value="SD">Jenjang SD</option>
              <option value="SMP">Jenjang SMP</option>
              <option value="SMA">Jenjang SMA/SMK</option>
            </select>
          </div>

          {/* Filter Kelas Tingkat 1-12 */}
          <div className="min-w-[120px]">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Kelas</option>
              {classOptions.filter(c => c !== 'SEMUA').map((cls) => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          {/* Kelamin */}
          <div className="min-w-[130px]">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Kelamin</option>
              <option value="L">Laki-Laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* Agama */}
          <div className="min-w-[125px]">
            <select
              value={selectedReligion}
              onChange={(e) => setSelectedReligion(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Agama</option>
              {RELIGION_LIST.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          {/* Kekhususan */}
          <div className="min-w-[145px]">
            <select
              value={selectedSpecialNeeds}
              onChange={(e) => setSelectedSpecialNeeds(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Kekhususan</option>
              {SPECIAL_NEEDS_LIST.map((need) => (
                <option key={need} value={need}>{need}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="min-w-[120px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition cursor-pointer"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Mutasi">Mutasi</option>
              <option value="Lulus">Lulus</option>
              <option value="Keluar">Keluar</option>
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
                <th className="p-4">JENJANG / KELAS</th>
                <th className="p-4">GENDER</th>
                <th className="p-4">AGAMA</th>
                <th className="p-4">KEKHUSUSAN</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const jenjang = getJenjangFromClass(student.class || '');
                  return (
                    <tr key={student.id || index} className="hover:bg-slate-50/80 transition">
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
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            jenjang === 'SD' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : jenjang === 'SMP'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {jenjang}
                          </span>
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            {student.class || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{(student.gender || 'L').toUpperCase()}</td>
                      <td className="p-4 font-medium text-slate-600">{student.religion || 'Islam'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          student.specialNeeds && !student.specialNeeds.toLowerCase().includes('tidak ada')
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.specialNeeds || 'Tidak Ada'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          student.status === 'Aktif' || !student.status
                            ? 'bg-emerald-100 text-emerald-800' 
                            : student.status === 'Lulus'
                            ? 'bg-blue-100 text-blue-800'
                            : student.status === 'Mutasi'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
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

                              {(student.status === 'Aktif' || !student.status) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onGraduateStudent(student)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                    title="Luluskan Siswa ke Alumni"
                                  >
                                    <GraduationCap className="w-4 h-4" />
                                  </button>

                                  {onMutateStudent && (
                                    <button
                                      type="button"
                                      onClick={() => onMutateStudent(student)}
                                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                      title="Mutasikan Siswa (Pindah Sekolah)"
                                    >
                                      <ArrowLeftRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => student.id && onDeleteStudent(student.id)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada data siswa yang cocok dengan filter yang dipilih. Total siswa terdaftar di memori: <strong>{students.length}</strong>
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
          <Users className="w-4 h-4 text-blue-400" />
          <span>Rekapitulasi Hasil Filter Data Siswa ({selectedLevel === 'SEMUA' ? 'Semua Jenjang' : `Jenjang ${selectedLevel}`})</span>
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