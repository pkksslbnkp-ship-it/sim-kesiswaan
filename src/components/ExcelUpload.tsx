import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Download, Info } from 'lucide-react';
import { Student } from '../types';

interface ExcelUploadProps {
  onCommitImport?: (importedStudents: Student[]) => void;
  onImportSuccess?: (importedStudents: Student[]) => void;
  onImportStudents?: (importedStudents: Student[]) => void;
  existingStudents?: Student[];
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onCommitImport,
  onImportSuccess,
  onImportStudents,
}) => {
  const [parsedData, setParsedData] = useState<Student[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. FUNGSI UNDUH TEMPLATE DENGAN KOLOM BIODATA LENGKAP
  const handleDownloadTemplate = () => {
    // Header lengkap sesuai tampilan Biodata & Kontak Aplikasi
    const headers = [
      'NISN',
      'NIS',
      'NAMA SISWA',
      'KELAS',
      'GENDER',
      'AGAMA',
      'KEBUTUHAN KHUSUS',
      'TEMPAT LAHIR',
      'TANGGAL LAHIR',
      'NO TELEPON WA',
      'NAMA ORANG TUA',
      'ALAMAT LENGKAP',
      'STATUS'
    ];
    
    // Contoh data siswa dummy dengan biodata lengkap
    const sampleRows = [
      ['106590001', '2324101', 'Ahmad Rizky Pratama', '10B', 'L', 'Islam', 'Tidak Ada', 'Banyumas', '2008-05-12', '081234567890', 'Budi Pratama', 'Jl. Merdeka No. 12, Purwokerto', 'Aktif'],
      ['106590002', '2324102', 'Siti Nurhaliza', '10B', 'P', 'Islam', 'Tunagrahita', 'Sleman', '2008-09-20', '085712345678', 'Rahmat Hidayat', 'Jl. Kaliurang Km 9, Sleman', 'Aktif'],
      ['106590003', '2324103', 'Adzrul Nuriksan', '12C', 'L', 'Islam', 'Tunagrahita', 'Yogyakarta', '2007-01-15', '089611223344', 'Nurhadi', 'Jl. Magelang No. 45, Yogyakarta', 'Aktif'],
    ];

    // Gunakan titik koma (;) standar MS Excel Indonesia
    const csvRows = [
      headers.join(';'),
      ...sampleRows.map((row) => row.map((val) => `"${val}"`).join(';')),
    ];

    // Tambahkan UTF-8 BOM (\uFEFF) agar rapi saat dibuka di MS Excel
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Lengkap_Siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper mendeteksi pemisah CSV (Titik Koma ';' vs Koma ',' vs Tab '\t')
  const detectDelimiter = (text: string): string => {
    const firstLine = text.split(/\r\n|\n/)[0] || '';
    if (firstLine.includes(';')) return ';';
    if (firstLine.includes('\t')) return '\t';
    return ',';
  };

  // Helper membersihkan petik dan spasi
  const cleanValue = (val: string | undefined): string => {
    if (!val) return '';
    return val.replace(/^["']|["']$/g, '').trim();
  };

  // 2. HANDLER UPLOAD & PARSING FILE CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsProcessing(true);

    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isXlsx) {
      setErrorMsg(
        'Silakan unduh template kami terlebih dahulu atau Save As file Excel Anda menjadi "CSV (Comma delimited) (*.csv)" sebelum diunggah.'
      );
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text || text.trim() === '') {
          setErrorMsg('File kosong atau tidak dapat dibaca.');
          setIsProcessing(false);
          return;
        }

        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) {
          setErrorMsg('File harus memiliki setidaknya 1 baris header dan 1 baris data siswa.');
          setIsProcessing(false);
          return;
        }

        const delimiter = detectDelimiter(lines[0]);
        const headerCols = lines[0].split(delimiter).map((h) => cleanValue(h).toUpperCase());

        // Deteksi Otomatis Indeks Kolom Header
        let nameIdx = headerCols.findIndex((h) => h.includes('NAMA SISWA') || h.includes('NAMA'));
        let nisnIdx = headerCols.findIndex((h) => h.includes('NISN'));
        let nisIdx = headerCols.findIndex((h) => h.includes('NIS') && !h.includes('NISN'));
        let classIdx = headerCols.findIndex((h) => h.includes('KELAS') || h.includes('CLASS'));
        let genderIdx = headerCols.findIndex((h) => 
          h.includes('GENDER') || h.includes('JK') || h.includes('KELAMIN') || h.includes('P/L') || h.includes('L/P')
        );
        let religionIdx = headerCols.findIndex((h) => h.includes('AGAMA'));
        let needsIdx = headerCols.findIndex((h) => h.includes('KHUSUS') || h.includes('KEBUTUHAN'));
        
        // Indeks Biodata Baru
        let pobIdx = headerCols.findIndex((h) => h.includes('TEMPAT') || h.includes('POB'));
        let dobIdx = headerCols.findIndex((h) => h.includes('TANGGAL') || h.includes('TGL') || h.includes('DOB'));
        let phoneIdx = headerCols.findIndex((h) => h.includes('TELEPON') || h.includes('HP') || h.includes('WA') || h.includes('TELP'));
        let parentIdx = headerCols.findIndex((h) => h.includes('ORANG TUA') || h.includes('WALI') || h.includes('ORTU'));
        let addressIdx = headerCols.findIndex((h) => h.includes('ALAMAT') || h.includes('ADDRESS'));

        // Fallback jika nama header tidak terdeteksi
        if (nameIdx === -1) {
          const firstDataLine = lines[1].split(delimiter).map(cleanValue);
          nameIdx = firstDataLine.findIndex((val) => isNaN(Number(val)) && val.length > 2);
          if (nameIdx === -1) nameIdx = 2;
        }

        const dataRows = lines.slice(1);
        const importedStudents: Student[] = [];

        dataRows.forEach((row, idx) => {
          const cols = row.split(delimiter).map(cleanValue);
          
          const rawName = cols[nameIdx];
          if (!rawName || rawName.trim() === '') return;

          const genderRaw = (cols[genderIdx] || 'L').toUpperCase();
          const genderNormalized: 'L' | 'P' = genderRaw.startsWith('P') || genderRaw.includes('PEREMPUAN') ? 'P' : 'L';

          importedStudents.push({
            id: `imported-${Date.now()}-${idx}`,
            nisn: cols[nisnIdx] || `${106590000 + idx}`,
            nis: cols[nisIdx] || `${2324100 + idx}`,
            name: rawName,
            gender: genderNormalized,
            class: cols[classIdx] || '10B',
            major: 'Tunagrahita',
            religion: cols[religionIdx] || 'Islam',
            specialNeeds: cols[needsIdx] || 'Tidak Ada',
            
            // MAP DATA BIODATA & KONTAK BARU
            birthPlace: pobIdx !== -1 && cols[pobIdx] ? cols[pobIdx] : '-',
            birthDate: dobIdx !== -1 && cols[dobIdx] ? cols[dobIdx] : '-',
            phone: phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx] : '-',
            parentName: parentIdx !== -1 && cols[parentIdx] ? cols[parentIdx] : '-',
            address: addressIdx !== -1 && cols[addressIdx] ? cols[addressIdx] : '-',

            generation: '2025/2026',
            entryYear: 2025,
            status: 'Aktif',
            createdAt: new Date().toISOString(),
          });
        });

        if (importedStudents.length === 0) {
          setErrorMsg('Gagal membaca data siswa. Gunakan template resmi yang dapat diunduh di atas.');
        } else {
          setParsedData(importedStudents);
        }
      } catch (err) {
        setErrorMsg('Terjadi kesalahan saat memproses file CSV.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // 3. HANDLER SIMPAN KE UTAMA
  const handleCommit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (parsedData.length === 0) {
      setErrorMsg('Belum ada data siswa yang siap diimpor.');
      return;
    }

    if (onCommitImport) onCommitImport(parsedData);
    else if (onImportSuccess) onImportSuccess(parsedData);
    else if (onImportStudents) onImportStudents(parsedData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 font-sans space-y-6">
      
      {/* Header & Unduh Template Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Upload & Import Data Siswa Lengkap
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Unduh template CSV lengkap di samping untuk memasukkan Nama, Orang Tua, No. WA, dan Alamat sekaligus.
          </p>
        </div>

        {/* Tombol Unduh Template */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Unduh Template CSV Lengkap</span>
        </button>
      </div>

      {/* Info Petunjuk */}
      <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3 text-xs text-blue-800">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Panduan Impor Data Biodata Siswa:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
            <li>Klik tombol <strong>"Unduh Template CSV Lengkap"</strong>.</li>
            <li>Buka file di Microsoft Excel, lalu isi data orang tua, nomor WA, dan alamat siswa.</li>
            <li>Simpan (Save) dan unggah kembali file CSV tersebut di bawah.</li>
          </ol>
        </div>
      </div>

      {/* Area Upload File */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
        <input
          type="file"
          id="excel-file-input"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">
            {fileName ? fileName : 'Klik di sini untuk memilih File CSV / Excel'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Format yang didukung: <strong>File CSV (.csv)</strong>
          </span>
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Pemberitahuan:</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Preview Data Terbaca */}
      {parsedData.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Berhasil membaca {parsedData.length} data siswa beserta biodata & kontak</span>
            </div>

            <button
              type="button"
              onClick={handleCommit}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Simpan & Masukkan {parsedData.length} Siswa Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="p-3">NO</th>
                  <th className="p-3">NAMA SISWA</th>
                  <th className="p-3">ORANG TUA / WALI</th>
                  <th className="p-3">NO. TELEPON/WA</th>
                  <th className="p-3">ALAMAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3">{item.parentName || '-'}</td>
                    <td className="p-3 font-mono">{item.phone || '-'}</td>
                    <td className="p-3 truncate max-w-[200px]">{item.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;