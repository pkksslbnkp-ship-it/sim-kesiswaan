import React, { useState } from 'react';
import { Student, ExcelStudentRow } from '../types';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileCheck, 
  Trash2, 
  HelpCircle,
  Database,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { insertExcelStudentsToSupabase, getSupabaseConfig } from '../lib/supabase';

interface ExcelUploadProps {
  onCommitImport: (newStudents: Student[]) => void;
  existingStudents: Student[];
}

// Helper to find column value across multiple header variations (case-insensitive & space/punctuation tolerant)
const getColumnValue = (row: Record<string, any>, possibleKeys: string[]): string => {
  if (!row) return '';
  const keys = Object.keys(row);
  for (const possibleKey of possibleKeys) {
    const normalizedPossible = possibleKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedKey === normalizedPossible || (normalizedPossible.length >= 3 && normalizedKey.includes(normalizedPossible))) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
};

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onCommitImport,
  existingStudents,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ExcelStudentRow[]>([]);
  const [validatedData, setValidatedData] = useState<
    { 
      row: ExcelStudentRow; 
      valid: boolean; 
      errors: string[];
      warnings: string[];
      extracted: {
        nisn: string;
        nis: string;
        name: string;
        gender: 'L' | 'P';
        religion: string;
        specialNeeds: string;
        class: string;
        major: string;
        generation: string;
        entryYear: number;
        phone: string;
        parentName: string;
        address: string;
      }
    }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState('');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseSuccess, setSupabaseSuccess] = useState<string | null>(null);
  const [isUploadingSupabase, setIsUploadingSupabase] = useState(false);
  
  // Option toggles
  const [autoGenMissingNisn, setAutoGenMissingNisn] = useState(true);
  const [allowDuplicateNisn, setAllowDuplicateNisn] = useState(false);

  // Handle File Select & Drag & Drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Process Excel File with XLSX library
  const processFile = (uploadedFile: File) => {
    setIsProcessing(true);
    setFile(uploadedFile);
    setImportSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        if (!buffer) throw new Error('File buffer kosong');

        // Read ArrayBuffer with raw: false to keep formatted values (leading zeroes, phone numbers)
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 1. First convert to 2D matrix to auto-detect header row (skipping top title rows)
        const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawMatrix.length, 10); i++) {
          const rowStr = (rawMatrix[i] || []).join(' ').toLowerCase();
          if (
            rowStr.includes('nama') || 
            rowStr.includes('nisn') || 
            rowStr.includes('kelas') || 
            rowStr.includes('jk') ||
            rowStr.includes('jenis kelamin')
          ) {
            headerRowIndex = i;
            break;
          }
        }

        // 2. Parse JSON starting from the detected header row
        const rawJson: ExcelStudentRow[] = XLSX.utils.sheet_to_json(worksheet, { 
          range: headerRowIndex, 
          defval: '' 
        });

        // Clean out empty rows where name and nisn are completely blank
        const filteredJson = rawJson.filter(row => {
          const name = getColumnValue(row, ['nama lengkap', 'nama', 'nama siswa', 'nama peserta didik']);
          const nisn = getColumnValue(row, ['nisn', 'no nisn', 'nipd']);
          return name.length > 0 || nisn.length > 0;
        });

        setParsedRows(filteredJson);
        validateRows(filteredJson, autoGenMissingNisn, allowDuplicateNisn);
      } catch (error) {
        alert('Gagal membaca file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // Re-run validation whenever toggles change
  const reValidate = (genNisn: boolean, dupNisn: boolean) => {
    if (parsedRows.length > 0) {
      validateRows(parsedRows, genNisn, dupNisn);
    }
  };

  // Validate columns & check duplicate NISN
  const validateRows = (rows: ExcelStudentRow[], genNisn: boolean, dupNisn: boolean) => {
    const existingNisns = new Set(existingStudents.map((s) => s.nisn));

    const validated = rows.map((row, idx) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Flexible extraction across header variations
      let nisnVal = getColumnValue(row, ['nisn', 'no. nisn', 'nomor nisn', 'nipd', 'nisn_siswa', 'nisn/nis']);
      const nisVal = getColumnValue(row, ['nis', 'no. nis', 'nomor nis', 'no. induk', 'nis_siswa', 'nipd']) || `${25261000 + idx}`;
      const nameVal = getColumnValue(row, ['nama lengkap', 'nama', 'nama siswa', 'nama peserta didik', 'nama_lengkap']);
      const classVal = getColumnValue(row, ['kelas', 'rombel', 'rombongan belajar', 'kelas/rombel', 'tingkat']) || '10 MIPA 1';
      const majorVal = getColumnValue(row, ['jurusan', 'program keahlian', 'kompetensi keahlian', 'peminatan']) || 'MIPA';
      const genVal = getColumnValue(row, ['angkatan', 'tahun ajaran', 'tp', 'tahun masuk']) || '2025/2026';
      
      const genderRaw = getColumnValue(row, ['jenis kelamin', 'jk', 'l/p', 'gender', 'kelamin', 'sex']);
      const genderVal: 'L' | 'P' = genderRaw.toUpperCase().startsWith('P') || genderRaw.toUpperCase() === 'PEREMPUAN' ? 'P' : 'L';
      
      const religionVal = getColumnValue(row, ['agama', 'kepercayaan', 'religion']) || 'Islam';
      const specialNeedsVal = getColumnValue(row, ['kebutuhan khusus', 'disabilitas', 'inklusi', 'abk', 'special needs']) || 'Tidak Ada';
      const phoneVal = getColumnValue(row, ['no hp/wa', 'no hp', 'no. hp', 'no wa', 'no telepon', 'telepon', 'hp', 'wa']);
      const parentNameVal = getColumnValue(row, ['nama orang tua', 'nama ortu', 'nama ayah', 'nama ibu', 'nama wali', 'orang tua', 'ortu']);
      const addressVal = getColumnValue(row, ['alamat', 'alamat tinggal', 'alamat rumah', 'alamat siswa', 'domisili']);
      const statusVal = getColumnValue(row, ['status', 'status siswa', 'keaktifan', 'keterangan']) || 'Aktif';
      
      const entryYearRaw = getColumnValue(row, ['tahun masuk', 'tahun']);
      const entryYearVal = parseInt(entryYearRaw) || 2025;

      // Check Wajib: Nama
      if (!nameVal) {
        errors.push('Nama Kosong');
      }

      // Check NISN
      if (!nisnVal) {
        if (genNisn) {
          nisnVal = `00${25260000 + idx}`;
          warnings.push('NISN Kosong (Otomatis Dibuat)');
        } else {
          errors.push('NISN Kosong');
        }
      } else if (existingNisns.has(nisnVal)) {
        if (!dupNisn) {
          errors.push(`NISN ${nisnVal} Sudah Ada`);
        } else {
          warnings.push(`NISN ${nisnVal} Sudah Ada (Diizinkan)` );
        }
      }

      return {
        row,
        valid: errors.length === 0,
        errors,
        warnings,
        extracted: {
          nisn: nisnVal,
          nis: nisVal,
          name: nameVal,
          gender: genderVal,
          religion: religionVal,
          specialNeeds: specialNeedsVal,
          class: classVal,
          major: majorVal,
          generation: genVal,
          entryYear: entryYearVal,
          phone: phoneVal,
          parentName: parentNameVal,
          address: addressVal,
          status: statusVal,
        }
      };
    });

    setValidatedData(validated);
  };

  // Generate Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        NISN: '0089876543',
        NIS: '25261010',
        'Nama Lengkap': 'Muhammad Hanif Al-Fatih',
        'Jenis Kelamin': 'L',
        Agama: 'Islam',
        'Kebutuhan Khusus': 'Tidak Ada',
        Kelas: '10 MIPA 2',
        Jurusan: 'MIPA',
        Angkatan: '2025/2026',
        Status: 'Aktif',
        'Tahun Masuk': 2025,
        'No HP/WA': '081299887766',
        'Nama Orang Tua': 'Ahmad Dahlan',
        Alamat: 'Kec. Coblong, Kota Bandung',
      },
      {
        NISN: '0088765432',
        NIS: '25261011',
        'Nama Lengkap': 'Nabila Putri Zahra',
        'Jenis Kelamin': 'P',
        Agama: 'Islam',
        'Kebutuhan Khusus': 'Cerdas Istimewa',
        Kelas: '10 MIPA 2',
        Jurusan: 'MIPA',
        Angkatan: '2025/2026',
        Status: 'Aktif',
        'Tahun Masuk': 2025,
        'No HP/WA': '081388776655',
        'Nama Orang Tua': 'Budi Santoso',
        Alamat: 'Kec. Cicendo, Kota Bandung',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Import_Siswa_Kesiswaan.xlsx');
  };

  // Commit valid rows to Student State & Supabase DB directly
  const handleCommitImport = async () => {
    const validItems = validatedData.filter((v) => v.valid);
    if (validItems.length === 0) {
      alert('Tidak ada baris data valid yang siap diimpor.');
      return;
    }

    setSupabaseError(null);
    setSupabaseSuccess(null);
    setImportSuccessMessage('');
    setIsUploadingSupabase(true);

    const { url, key } = getSupabaseConfig();

    const extractedList = validItems.map((v) => ({
      nisn: v.extracted.nisn,
      nis: v.extracted.nis,
      name: v.extracted.name,
      gender: v.extracted.gender,
      class: v.extracted.class,
      major: v.extracted.major,
      generation: v.extracted.generation,
      status: v.extracted.status,
      phone: v.extracted.phone,
      parentName: v.extracted.parentName,
      address: v.extracted.address,
    }));

    if (url && key) {
      // Direct insert to Supabase using supabase.from('students').insert()
      const res = await insertExcelStudentsToSupabase(extractedList);
      setIsUploadingSupabase(false);

      if (res.success) {
        setSupabaseSuccess(res.message);
      } else {
        setSupabaseError(res.message);
        // Do not clear parsed rows so user can read error message and retry or fix
        return;
      }
    } else {
      setIsUploadingSupabase(false);
      setSupabaseSuccess('Supabase DB belum dikonfigurasi. Data siswa disimpan ke Penyimpanan Lokal.');
    }

    // Also sync to local React state
    const newStudents: Student[] = validItems.map(({ extracted }, idx) => {
      return {
        id: `std-imp-${Date.now()}-${idx}`,
        nisn: extracted.nisn,
        nis: extracted.nis,
        name: extracted.name,
        gender: extracted.gender,
        religion: extracted.religion as any,
        specialNeeds: extracted.specialNeeds as any,
        class: extracted.class,
        major: extracted.major,
        generation: extracted.generation,
        entryYear: extracted.entryYear,
        status: (extracted.status as any) || 'Aktif',
        phone: extracted.phone,
        parentName: extracted.parentName,
        address: extracted.address,
        notes: 'Diimpor via Excel Upload',
        createdAt: new Date().toISOString(),
      };
    });

    onCommitImport(newStudents);
    setFile(null);
    setParsedRows([]);
    setValidatedData([]);
  };

  // Fallback handler to commit locally if user chooses to bypass Supabase error
  const handleForceLocalImport = () => {
    const validItems = validatedData.filter((v) => v.valid);
    if (validItems.length === 0) return;

    const newStudents: Student[] = validItems.map(({ extracted }, idx) => ({
      id: `std-imp-${Date.now()}-${idx}`,
      nisn: extracted.nisn,
      nis: extracted.nis,
      name: extracted.name,
      gender: extracted.gender,
      religion: extracted.religion as any,
      specialNeeds: extracted.specialNeeds as any,
      class: extracted.class,
      major: extracted.major,
      generation: extracted.generation,
      entryYear: extracted.entryYear,
      status: (extracted.status as any) || 'Aktif',
      phone: extracted.phone,
      parentName: extracted.parentName,
      address: extracted.address,
      notes: 'Diimpor via Excel (Lokal)',
      createdAt: new Date().toISOString(),
    }));

    onCommitImport(newStudents);
    setSupabaseError(null);
    setSupabaseSuccess(`Berhasil menyimpan ${newStudents.length} siswa ke penyimpanan lokal!`);
    setFile(null);
    setParsedRows([]);
    setValidatedData([]);
  };

  const validCount = validatedData.filter((v) => v.valid).length;
  const invalidCount = validatedData.filter((v) => !v.valid).length;

  return (
    <div className="space-y-6">
      
      {/* Title & Guidance Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload & Parsing Data Excel Siswa</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pencocokan kolom otomatis, deteksi baris judul, dan toleransi format Excel Dapodik/EMIS.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 transition flex items-center space-x-2 shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Unduh Template Standard (.xlsx)</span>
        </button>
      </div>

      {/* Supabase Error Notification */}
      {supabaseError && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 space-y-3 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-black text-rose-950 text-sm">Gagal Menyimpan Data Excel ke Supabase Database</h4>
              <p className="text-xs font-semibold text-rose-800 leading-relaxed">{supabaseError}</p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-rose-200/80">
            <button
              onClick={handleCommitImport}
              disabled={isUploadingSupabase}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isUploadingSupabase ? 'animate-spin' : ''}`} />
              <span>Coba Kirim Ulang ke Supabase</span>
            </button>
            <button
              onClick={handleForceLocalImport}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
            >
              Simpan ke Memori Lokal Saja
            </button>
          </div>
        </div>
      )}

      {/* Supabase Success Notification */}
      {supabaseSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center space-x-3 shadow-md">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-emerald-900">{supabaseSuccess}</p>
            <p className="text-[11px] font-medium text-emerald-700 mt-0.5">Data siswa dapat langsung dilihat di tabel siswa dan disinkronkan di cloud Supabase.</p>
          </div>
        </div>
      )}

      {/* Legacy Success Notification */}
      {importSuccessMessage && !supabaseSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Drag & Drop File Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-300 hover:border-blue-600 bg-white rounded-2xl p-8 text-center transition cursor-pointer shadow-sm"
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900">Tarik & Lepas file Excel / CSV di sini</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Format didukung: <b>.xlsx, .xls, .csv</b></p>
          </div>

          <label className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition shadow-md shadow-blue-600/20">
            <span>Pilih File Dari Komputer</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Parsing & Preview Section */}
      {validatedData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          
          {/* Controls & Mode Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Opsi & Toleransi Validasi Impor</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenMissingNisn}
                  onChange={(e) => {
                    setAutoGenMissingNisn(e.target.checked);
                    reValidate(e.target.checked, allowDuplicateNisn);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Buat NISN Otomatis jika NISN di Excel Kosong</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicateNisn}
                  onChange={(e) => {
                    setAllowDuplicateNisn(e.target.checked);
                    reValidate(autoGenMissingNisn, e.target.checked);
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Izinkan NISN Duplikat (Sistem tetap mengimpor)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Hasil Validasi Spreadsheet ({parsedRows.length} Baris Dibaca)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                File: <b>{file?.name}</b>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-emerald-800 font-black bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-xl">
                Siap Impor: {validCount} baris
              </span>
              {invalidCount > 0 && (
                <span className="text-xs text-rose-800 font-black bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl">
                  Perlu Perhatian: {invalidCount} baris
                </span>
              )}
              <button
                onClick={handleCommitImport}
                disabled={validCount === 0 || isUploadingSupabase}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition flex items-center space-x-2"
              >
                {isUploadingSupabase ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Proses Impor {validCount} Siswa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validation Table Preview */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">NISN (Hasil Parse)</th>
                  <th className="p-3.5">Nama Lengkap</th>
                  <th className="p-3.5">JK</th>
                  <th className="p-3.5">Kelas & Jurusan</th>
                  <th className="p-3.5">Catatan Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validatedData.map(({ valid, errors, warnings, extracted }, idx) => (
                  <tr key={idx} className={valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                    <td className="p-3.5">
                      {valid ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Siap</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black uppercase inline-flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {extracted.nisn || '-'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {extracted.name || '-'}
                    </td>
                    <td className="p-3.5 font-bold">
                      {extracted.gender}
                    </td>
                    <td className="p-3.5 font-semibold">
                      {extracted.class} ({extracted.major})
                    </td>
                    <td className="p-3.5 font-bold">
                      {errors.length > 0 ? (
                        <span className="text-rose-600">{errors.join(', ')}</span>
                      ) : warnings.length > 0 ? (
                        <span className="text-amber-600">{warnings.join(', ')}</span>
                      ) : (
                        <span className="text-emerald-600">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Guide Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 text-xs text-slate-700 shadow-sm">
        <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Kenapa Upload Excel Bisa Bermasalah? Berikut Solusi & Panduan Format:</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-black text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Nama Header Kolom Beda</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Sistem sekarang otomatis mengenali variasi header seperti <b>Nama Lengkap / Nama Siswa / NAMA</b>, <b>NISN / No. NISN / NIPD</b>, dan <b>Kelas / Rombel</b>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-black text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Ada Judul di Baris Atas</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Sistem sekarang secara cerdas mendeteksi baris tabel header dan mengabaikan baris judul laporan di paling atas Excel.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-black text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">3</span>
              <span>NISN Kosong / Nol Hilang</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Format teks dipertahankan agar angka nol di awal NISN/No HP tidak hilang, serta opsi otomatisasi NISN jika kosong.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

