import React, { useState, useMemo } from 'react';
import { 
  Student, 
  FilterStudentOptions, 
  UserRole, 
  StudentStatus,
  Gender,
  Religion,
  SpecialNeeds
} from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  GraduationCap, 
  Download, 
  UserCheck, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  MapPin,
  HeartHandshake,
  Users,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentListProps {
  students: Student[];
  userRole: UserRole;
  schoolLogo?: string | null;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudentDetail: (student: Student) => void;
  onGraduateStudent: (student: Student) => void;
  onNavigateToImport: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  userRole,
  schoolLogo,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onViewStudentDetail,
  onGraduateStudent,
  onNavigateToImport,
}) => {
  // Allow full action access for both Admin and Guru roles in SIM Kesiswaan
  const canManage = true;

  // Filters state
  const [filters, setFilters] = useState<FilterStudentOptions>({
    search: '',
    class: '',
    major: '',
    generation: '',
    status: 'All',
    gender: 'All',
    religion: 'All',
    specialNeeds: 'All',
    addressRegion: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive unique dropdown filter lists dynamically
  const uniqueClasses = useMemo(() => Array.from(new Set(students.map((s) => s.class))).filter(Boolean).sort(), [students]);
  const uniqueMajors = useMemo(() => Array.from(new Set(students.map((s) => s.major))).filter(Boolean).sort(), [students]);
  const uniqueGenerations = useMemo(() => Array.from(new Set(students.map((s) => s.generation))).filter(Boolean).sort(), [students]);
  
  // Derive unique religions present in dataset
  const uniqueReligions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.religion || 'Islam'))).filter(Boolean);
    const standard: Religion[] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Lainnya'];
    standard.forEach(r => { if (!list.includes(r)) list.push(r); });
    return list;
  }, [students]);

  // Derive unique special needs present
  const uniqueSpecialNeeds = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.specialNeeds || 'Tidak Ada'))).filter(Boolean);
    const standard: SpecialNeeds[] = [
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
    standard.forEach(sn => { if (!list.includes(sn)) list.push(sn); });
    return list;
  }, [students]);

  // Derive unique address regions / kecamatan / kota from address strings
  const uniqueAddressRegions = useMemo(() => {
    const regions = new Set<string>();
    students.forEach((s) => {
      if (s.address) {
        const match = s.address.match(/(Kec\.\s*[^,]+|Kota\s*[^,]+|Kab\.\s*[^,]+)/i);
        if (match) {
          regions.add(match[0].trim());
        } else {
          regions.add(s.address.trim());
        }
      }
    });
    return Array.from(regions).sort();
  }, [students]);

  // Filter implementation
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search text match (Name, NISN, NIS, Address, Class, Notes)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchName = student.name.toLowerCase().includes(query);
        const matchNisn = student.nisn.includes(query);
        const matchNis = student.nis.includes(query);
        const matchClass = student.class.toLowerCase().includes(query);
        const matchAddress = (student.address || '').toLowerCase().includes(query);
        const matchNotes = (student.notes || '').toLowerCase().includes(query);
        if (!matchName && !matchNisn && !matchNis && !matchClass && !matchAddress && !matchNotes) return false;
      }

      // Class filter
      if (filters.class && student.class !== filters.class) return false;

      // Major filter
      if (filters.major && student.major !== filters.major) return false;

      // Generation filter
      if (filters.generation && student.generation !== filters.generation) return false;

      // Status filter
      if (filters.status !== 'All' && student.status !== filters.status) return false;

      // Gender filter
      if (filters.gender !== 'All' && student.gender !== filters.gender) return false;

      // Religion filter
      if (filters.religion !== 'All' && (student.religion || 'Islam') !== filters.religion) return false;

      // Special Needs filter
      if (filters.specialNeeds !== 'All' && (student.specialNeeds || 'Tidak Ada') !== filters.specialNeeds) return false;

      // Address Region filter
      if (filters.addressRegion && !(student.address || '').toLowerCase().includes(filters.addressRegion.toLowerCase())) return false;

      return true;
    });
  }, [students, filters]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.class || 
    filters.major || 
    filters.generation || 
    filters.status !== 'All' || 
    filters.gender !== 'All' ||
    filters.religion !== 'All' ||
    filters.specialNeeds !== 'All' ||
    filters.addressRegion
  );

  const handleResetFilters = () => {
    setFilters({
      search: '',
      class: '',
      major: '',
      generation: '',
      status: 'All',
      gender: 'All',
      religion: 'All',
      specialNeeds: 'All',
      addressRegion: '',
    });
    setCurrentPage(1);
  };

  // Export filtered data to Excel (.xlsx)
  const handleExportToExcel = () => {
    const exportData = filteredStudents.map((s) => ({
      NISN: s.nisn,
      NIS: s.nis,
      'Nama Lengkap': s.name,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      Agama: s.religion || 'Islam',
      'Kebutuhan Khusus / Inklusi': s.specialNeeds || 'Tidak Ada',
      Kelas: s.class,
      Jurusan: s.major,
      Angkatan: s.generation,
      Status: s.status,
      'No. HP': s.phone || '-',
      'Nama Orang Tua': s.parentName || '-',
      Alamat: s.address || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_Kesiswaan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export filtered data to PDF / Printable Document
  const handleExportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up terblokir! Mohon izinkan pop-up di browser Anda untuk membuka cetakan PDF.');
      return;
    }

    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const logoHtml = schoolLogo
      ? `<img src="${schoolLogo}" alt="Logo" style="height: 60px; max-width: 120px; object-fit: contain;" />`
      : `<div style="width: 50px; height: 50px; background: #2563eb; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">🎓</div>`;

    const rowsHtml = filteredStudents
      .map(
        (s, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 600;">${s.nisn}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.class} (${s.major})</td>
        <td style="text-align: center;">${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
        <td>${s.phone || '-'}</td>
        <td>${s.address || '-'}</td>
        <td style="text-align: center;">${s.status}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Data Siswa - SIM-KESISWAAN</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0f172a; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
            .header-title { text-align: center; flex: 1; }
            .header-title h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .header-title h2 { margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #475569; }
            .header-title p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; }
            .meta-info { margin-bottom: 15px; font-size: 12px; font-weight: 600; color: #334155; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-transform: uppercase; font-size: 10px; color: #334155; }
            td { border: 1px solid #cbd5e1; padding: 7px; color: #0f172a; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer-sig { margin-top: 40px; display: flex; justify-content: flex-end; font-size: 12px; }
            .sig-box { text-align: center; width: 220px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoHtml}
            <div class="header-title">
              <h1>LAPORAN DATA KESISWAAN SEKOLAH</h1>
              <h2>REKAPITULASI BIODATA SISWA AKTIF</h2>
              <p>Sistem Informasi Manajemen Kesiswaan • Dicetak Secara Otomatis</p>
            </div>
            <div style="width: 60px;"></div>
          </div>

          <div class="meta-info">
            <span>Tanggal Cetak: ${today}</span>
            <span>Total Terdata: ${filteredStudents.length} Siswa</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">No</th>
                <th>NISN</th>
                <th>Nama Lengkap</th>
                <th>Kelas & Jurusan</th>
                <th>L/P</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-sig">
            <div class="sig-box">
              <p>Ditetapkan di Sekolah, ${today}</p>
              <p style="margin-top: 4px;"><strong>Waka Kesiswaan / Petugas</strong></p>
              <div style="height: 60px;"></div>
              <p>___________________________</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Stats calculation
  const maleCount = useMemo(() => filteredStudents.filter(s => s.gender === 'L').length, [filteredStudents]);
  const femaleCount = useMemo(() => filteredStudents.filter(s => s.gender === 'P').length, [filteredStudents]);
  const specialNeedsCount = useMemo(() => filteredStudents.filter(s => s.specialNeeds && s.specialNeeds !== 'Tidak Ada').length, [filteredStudents]);

  return (
    <div className="space-y-5">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen & Data Siswa</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold border border-blue-200">
              {filteredStudents.length} siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pencarian, pemilahan filter multi-kategori (Kelamin, Agama, Alamat, Kebutuhan Khusus, Kelas), dan biodata kesiswaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel */}
          <button
            onClick={handleExportToExcel}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center space-x-1.5 shadow-sm"
            title="Unduh Data Terfilter ke File Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportToPDF}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-800 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center space-x-1.5 shadow-sm"
            title="Cetak atau Simpan PDF Laporan Data Siswa"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Cetak / Export PDF</span>
          </button>

          {/* Kesiswaan Action Buttons */}
          {canManage && (
            <>
              <button
                onClick={onNavigateToImport}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={onAddStudent}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Filter Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 font-black">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Hasil Filter</div>
            <div className="text-sm font-black text-slate-900">{filteredStudents.length} Siswa</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-black">L / P</div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gender (L / P)</div>
            <div className="text-sm font-black text-slate-900">{maleCount} L • {femaleCount} P</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 font-black">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Siswa Inklusi / ABK</div>
            <div className="text-sm font-black text-purple-700">{specialNeedsCount} Siswa</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 font-black">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wilayah Terdaftar</div>
            <div className="text-sm font-black text-slate-900">{uniqueAddressRegions.length} Area</div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Pencarian & Multi Dropdown Filter Data Siswa</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="relative col-span-1 sm:col-span-2">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Cari Kata Kunci</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama, NISN, NIS, Alamat, Catatan..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* 1. Dropdown Jenis Kelamin */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Jenis Kelamin</label>
            <select
              value={filters.gender}
              onChange={(e) => {
                setFilters({ ...filters, gender: e.target.value as Gender | 'All' });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          {/* 2. Dropdown Agama */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Agama</label>
            <select
              value={filters.religion}
              onChange={(e) => {
                setFilters({ ...filters, religion: e.target.value as Religion | 'All' });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">Semua Agama</option>
              {uniqueReligions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 3. Dropdown Kebutuhan Khusus / Inklusi */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Kebutuhan Khusus (Inklusi)</label>
            <select
              value={filters.specialNeeds}
              onChange={(e) => {
                setFilters({ ...filters, specialNeeds: e.target.value as SpecialNeeds | 'All' });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">Semua Kebutuhan Khusus</option>
              {uniqueSpecialNeeds.map((sn) => (
                <option key={sn} value={sn}>{sn}</option>
              ))}
            </select>
          </div>

          {/* 4. Dropdown Wilayah / Alamat */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Wilayah / Alamat</label>
            <select
              value={filters.addressRegion}
              onChange={(e) => {
                setFilters({ ...filters, addressRegion: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Wilayah / Alamat</option>
              {uniqueAddressRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 5. Dropdown Kelas */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Kelas</label>
            <select
              value={filters.class}
              onChange={(e) => {
                setFilters({ ...filters, class: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Kelas</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 6. Dropdown Jurusan */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Jurusan</label>
            <select
              value={filters.major}
              onChange={(e) => {
                setFilters({ ...filters, major: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Jurusan</option>
              {uniqueMajors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 7. Dropdown Angkatan */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Angkatan</label>
            <select
              value={filters.generation}
              onChange={(e) => {
                setFilters({ ...filters, generation: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Semua Angkatan</option>
              {uniqueGenerations.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 8. Dropdown Status Keaktifan */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Status Keaktifan</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as any });
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">Status: Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Lulus">Lulus / Alumni</option>
              <option value="Mutasi">Mutasi / Keluar</option>
              <option value="DO">Drop Out (DO)</option>
            </select>
          </div>

        </div>

        {/* Active Filter Tags Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 font-bold mr-1">Filter Aktif:</span>

            {filters.gender !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold flex items-center space-x-1 border border-blue-200">
                <span>JK: {filters.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                <button onClick={() => setFilters({ ...filters, gender: 'All' })} className="hover:text-blue-900 ml-1">×</button>
              </span>
            )}

            {filters.religion !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold flex items-center space-x-1 border border-amber-200">
                <span>Agama: {filters.religion}</span>
                <button onClick={() => setFilters({ ...filters, religion: 'All' })} className="hover:text-amber-950 ml-1">×</button>
              </span>
            )}

            {filters.specialNeeds !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold flex items-center space-x-1 border border-purple-200">
                <span>Inklusi: {filters.specialNeeds}</span>
                <button onClick={() => setFilters({ ...filters, specialNeeds: 'All' })} className="hover:text-purple-950 ml-1">×</button>
              </span>
            )}

            {filters.addressRegion && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center space-x-1 border border-emerald-200">
                <span>Wilayah: {filters.addressRegion}</span>
                <button onClick={() => setFilters({ ...filters, addressRegion: '' })} className="hover:text-emerald-950 ml-1">×</button>
              </span>
            )}

            {filters.class && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center space-x-1 border border-slate-200">
                <span>Kelas: {filters.class}</span>
                <button onClick={() => setFilters({ ...filters, class: '' })} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}

            {filters.major && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center space-x-1 border border-slate-200">
                <span>Jurusan: {filters.major}</span>
                <button onClick={() => setFilters({ ...filters, major: '' })} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}

            {filters.generation && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center space-x-1 border border-slate-200">
                <span>Angkatan: {filters.generation}</span>
                <button onClick={() => setFilters({ ...filters, generation: '' })} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}

            {filters.status !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-extrabold flex items-center space-x-1 border border-slate-200">
                <span>Status: {filters.status}</span>
                <button onClick={() => setFilters({ ...filters, status: 'All' })} className="hover:text-slate-900 ml-1">×</button>
              </span>
            )}
          </div>
        )}

      </div>

      {/* Student Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">NISN / NIS</th>
                <th className="p-4">Nama Lengkap & Biodata</th>
                <th className="p-4">JK</th>
                <th className="p-4">Agama</th>
                <th className="p-4">Inklusi / ABK</th>
                <th className="p-4">Kelas & Jurusan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Alamat & Kontak</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 font-bold">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian filter.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* NISN / NIS */}
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-900">{s.nisn}</div>
                      <div className="text-[10px] text-slate-400 font-bold">NIS: {s.nis}</div>
                    </td>

                    {/* Nama */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onViewStudentDetail(s)}>
                        {s.name}
                      </div>
                      {s.notes && (
                        <div className="text-[10px] text-amber-700 font-bold truncate max-w-xs">{s.notes}</div>
                      )}
                    </td>

                    {/* JK */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {s.gender}
                      </span>
                    </td>

                    {/* Agama */}
                    <td className="p-4 font-bold text-slate-800">
                      {s.religion || 'Islam'}
                    </td>

                    {/* Special Needs / Inklusi Badge */}
                    <td className="p-4">
                      {s.specialNeeds && s.specialNeeds !== 'Tidak Ada' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                          {s.specialNeeds}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          Non-Disabilitas
                        </span>
                      )}
                    </td>

                    {/* Kelas & Jurusan */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{s.class}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{s.major} • {s.generation}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        s.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : s.status === 'Lulus'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Alamat & Kontak */}
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{s.phone || '-'}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]" title={s.address}>
                        {s.address || '-'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        
                        {/* View Detail */}
                        <button
                          onClick={() => onViewStudentDetail(s)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 transition"
                          title="Lihat Detail Profil Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit, Luluskan, & Delete Actions */}
                        {canManage && (
                          <>
                            <button
                              onClick={() => onEditStudent(s)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-600 transition"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {s.status === 'Aktif' && (
                              <button
                                onClick={() => onGraduateStudent(s)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 text-indigo-700 transition"
                                title="Luluskan Siswa ke Data Alumni"
                              >
                                <GraduationCap className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => onDeleteStudent(s.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-600 transition"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-semibold gap-2">
          <div>
            Menampilkan <b>{paginatedStudents.length}</b> dari <b>{filteredStudents.length}</b> total siswa terfilter.
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-800 font-extrabold">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
