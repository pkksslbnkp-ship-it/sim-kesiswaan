import React, { useState } from 'react';
import { 
  FileCode, 
  Database, 
  Layers, 
  ListOrdered, 
  Code2, 
  Copy, 
  Check, 
  Server, 
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
  UploadCloud
} from 'lucide-react';

export const TechnicalDoc: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippetExcel = `// ================================================================
// SNIPPET UTAMA: Upload & Parsing Data Excel (.xlsx / .csv)
// Tech Stack: React + XLSX (SheetJS) / Node.js
// ================================================================

import * as XLSX from 'xlsx';

// 1. Fungsi Parser Client-side (React Component Handler)
export const handleExcelUpload = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // Membaca workbook dari buffer/binary
        const workbook = XLSX.read(data, { type: 'binary' });

        // Ambil Sheet Pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert Sheet ke Array of Objects JSON
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map & Sanitize Data Siswa
        const sanitizedStudents = rawJsonData.map((row: any, idx: number) => ({
          nisn: String(row.NISN || row.nisn || '').trim(),
          nis: String(row.NIS || row.nis || '').trim(),
          name: String(row['Nama Lengkap'] || row.Nama || '').trim(),
          gender: String(row['Jenis Kelamin'] || row.JK || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
          class: String(row.Kelas || row.kelas || '').trim(),
          major: String(row.Jurusan || row.jurusan || 'MIPA').trim(),
          generation: String(row.Angkatan || row.angkatan || '2025/2026').trim(),
          entryYear: parseInt(row['Tahun Masuk'] || '2025'),
          status: 'Aktif',
          phone: String(row['No HP/WA'] || row.phone || ''),
          parentName: String(row['Nama Orang Tua'] || row.parentName || ''),
          address: String(row.Alamat || row.address || ''),
        }));

        resolve(sanitizedStudents);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsBinaryString(file);
  });
};`;

  const sqlSchemaCode = `-- ================================================================
-- DESAIN SKEMA DATABASE (POSTGRESQL / MYSQL) - SIM KESISWAAN
-- ERD Relationship: Users, Students, Achievements, Alumni, Logs
-- ================================================================

-- 1. TABEL USERS (Role-Based Access Control)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nip VARCHAR(30),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'guru')),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL STUDENTS (Data Siswa Utama)
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nis VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
    class VARCHAR(30) NOT NULL,
    major VARCHAR(50) NOT NULL,
    generation VARCHAR(20) NOT NULL,
    entry_year INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lulus', 'Mutasi', 'DO')),
    birth_place VARCHAR(50),
    birth_date DATE,
    address TEXT,
    phone VARCHAR(20),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL ACHIEVEMENTS (Data Prestasi Siswa)
CREATE TABLE achievements (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Akademik, Seni, Olahraga, Keagamaan, Teknologi
    level VARCHAR(50) NOT NULL,    -- Sekolah, Kabupaten/Kota, Provinsi, Nasional, Internasional
    organizer VARCHAR(150) NOT NULL,
    rank VARCHAR(50) NOT NULL,     -- Juara 1, Juara 2, Medali Emas
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL ALUMNI (Tracer Study Lulusan)
CREATE TABLE alumni (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE SET NULL,
    nisn VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    major VARCHAR(50) NOT NULL,
    current_status VARCHAR(50) NOT NULL, -- Kuliah, Bekerja, Wirausaha, Mencari Kerja
    institution_name VARCHAR(150),       -- PTN/PTS atau Perusahaan
    position_or_major VARCHAR(100),      -- Jurusan Kuliah atau Posisi Kerja
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEX UNTUK PERFORMA QUERY
CREATE INDEX idx_students_search ON students(name, nisn, class, major, status);
CREATE INDEX idx_achievements_level ON achievements(level, category);
CREATE INDEX idx_alumni_year ON alumni(graduation_year, current_status);`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Rekomendasi Arsitektur, ERD Database & Panduan Pengembangan
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Jawaban teknis terstruktur untuk spesifikasi sistem Waka Kesiswaan.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Rekomendasi Tech Stack */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>1. Rekomendasi Tech Stack & Alasan Pemilihan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Stack Option 1: Modern Full-Stack JavaScript */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black text-blue-950 text-sm">Opsi A: React + Node.js/Express + PostgreSQL</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider">Paling Fleksibel</span>
            </div>
            <p className="text-slate-700 font-bold leading-relaxed">
              <b>Alasan Pemilihan:</b>
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-semibold">
              <li><b>React + Vite:</b> UI super cepat, interaktif tanpa page reload untuk filter multi-kategori & preview Excel.</li>
              <li><b>Node.js (Express):</b> API RESTful ringan, sangat cepat menangani file parsing (.xlsx/.csv) secara asinkron.</li>
              <li><b>PostgreSQL / MySQL:</b> Database relasional yang solid untuk mengunci integritas data NISN unik dan foreign keys prestasi/alumni.</li>
            </ul>
          </div>

          {/* Stack Option 2: Traditional Monolith */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-900 text-sm">Opsi B: Laravel + MySQL (PHP)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">Klasik & Cepat</span>
            </div>
            <p className="text-slate-700 font-bold leading-relaxed">
              <b>Alasan Pemilihan:</b>
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-semibold">
              <li><b>Laravel Blade / Inertia:</b> Punya ekosistem lengkap (Auth, Migration, Eloquent ORM).</li>
              <li><b>Maatwebsite/Laravel-Excel:</b> Library bawaan Laravel yang sangat siap olah file Excel besar.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* SECTION 2: ERD & Database Schema Design */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-600" />
            <span>2. Desain Skema Database (ERD & SQL DDL)</span>
          </h3>
          <button
            onClick={() => copyToClipboard(sqlSchemaCode, 1)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 transition flex items-center space-x-2 shadow-sm"
          >
            {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copiedIndex === 1 ? 'Tersalin!' : 'Salin SQL DDL'}</span>
          </button>
        </div>

        {/* Visual ERD Diagram Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div className="font-black text-slate-900">Struktur Relasi Antar Tabel (Entity Relationship):</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-black text-amber-900">USERS</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Auth & Roles (Admin, Guru)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-black text-blue-900">STUDENTS (Core)</div>
              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">NISN (PK), Kelas, Status</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-black text-emerald-900">ACHIEVEMENTS</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">FK: student_id</div>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-black text-indigo-900">ALUMNI</div>
              <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">FK: student_id</div>
            </div>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 overflow-x-auto text-[11px] font-mono text-amber-300 leading-relaxed max-h-72">
          <pre>{sqlSchemaCode}</pre>
        </div>
      </div>

      {/* SECTION 3: Step-by-Step Implementation Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
          <ListOrdered className="w-5 h-5 text-emerald-600" />
          <span>3. Langkah-Langkah Pembuatan Aplikasi dari Nol</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center flex-shrink-0 text-xs">1</span>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Inisialisasi Project & Install Dependencies</h4>
              <p className="text-slate-600 font-medium mt-1 leading-relaxed">
                Jalankan <code className="text-emerald-700 font-mono font-bold bg-emerald-50 px-1 py-0.5 rounded">npm create vite@latest sim-kesiswaan -- --template react-ts</code>, lalu install <code className="text-emerald-700 font-mono font-bold bg-emerald-50 px-1 py-0.5 rounded">npm install xlsx recharts lucide-react express</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center flex-shrink-0 text-xs">2</span>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Setup Database & Skema Migrasi</h4>
              <p className="text-slate-600 font-medium mt-1 leading-relaxed">
                Jalankan script SQL DDL untuk membuat tabel <code className="text-blue-700 font-mono font-bold">users</code>, <code className="text-blue-700 font-mono font-bold">students</code>, <code className="text-blue-700 font-mono font-bold">achievements</code>, dan <code className="text-blue-700 font-mono font-bold">alumni</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center flex-shrink-0 text-xs">3</span>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Implementasi Excel Reader & Validation Layer</h4>
              <p className="text-slate-600 font-medium mt-1 leading-relaxed">
                Gunakan SheetJS (<code className="text-amber-800 font-mono font-bold">xlsx</code>) untuk mengubah file <code className="text-amber-800 font-mono font-bold">.xlsx/.csv</code> ke JSON, lalu lakukan pengecekan duplikasi NISN sebelum dikirim ke database.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center flex-shrink-0 text-xs">4</span>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Penerapan Role-Based Access Control (RBAC)</h4>
              <p className="text-slate-600 font-medium mt-1 leading-relaxed">
                Sediakan Guard / Middleware yang membatasi tombol Create/Update/Delete dan Upload Excel hanya untuk role <code className="text-purple-800 font-mono font-bold">admin</code> (Waka Kesiswaan).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Code Snippet Excel Parser */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>4. Contoh Kode Snippet Upload & Parsing Excel (.xlsx/.csv)</span>
          </h3>
          <button
            onClick={() => copyToClipboard(codeSnippetExcel, 2)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 transition flex items-center space-x-2 shadow-sm"
          >
            {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copiedIndex === 2 ? 'Tersalin!' : 'Salin Snippet TS/JS'}</span>
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 overflow-x-auto text-[11px] font-mono text-indigo-300 leading-relaxed max-h-80">
          <pre>{codeSnippetExcel}</pre>
        </div>
      </div>

      {/* SECTION 5: Panduan Deploy ke Netlify */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-teal-600" />
          <span>5. Panduan Cara Upload & Deploy Aplikasi ke Netlify</span>
        </h3>

        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 space-y-2">
          <div className="font-black text-teal-900 text-sm flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-teal-700" />
            <span>Konfigurasi Netlify Sudah Disiapkan di Project Ini!</span>
          </div>
          <p className="font-semibold text-slate-700 leading-relaxed">
            Project ini telah dilengkapi file <code className="bg-white px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-teal-800">netlify.toml</code> dan <code className="bg-white px-2 py-0.5 rounded border border-teal-200 font-mono font-bold text-teal-800">public/_redirects</code> agar tidak terjadi error 404 saat refresh halaman (SPA Routing).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Cara 1: Connect ke GitHub (Rekomendasi Utama) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">A</span>
              <span>Metode 1: Hubungkan ke GitHub (Otomatis)</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Export / Download source code project ini (atau push ke repository GitHub Anda).</li>
              <li>Buka dashboard <b>Netlify.com</b> dan klik tombol <b>"Add new site"</b> &gt; <b>"Import an existing project"</b>.</li>
              <li>Pilih <b>GitHub</b> dan hubungkan repository SIM Kesiswaan Anda.</li>
              <li>Netlify akan otomatis mendeteksi setting berikut dari <code className="font-mono text-blue-700 font-bold">netlify.toml</code>:
                <ul className="list-disc list-inside ml-4 mt-1 text-[11px] text-slate-600">
                  <li>Build Command: <code className="font-mono font-bold bg-white px-1">npm run build</code></li>
                  <li>Publish Directory: <code className="font-mono font-bold bg-white px-1">dist</code></li>
                </ul>
              </li>
              <li>Klik <b>"Deploy Site"</b> — website Anda akan langsung aktif online!</li>
            </ol>
          </div>

          {/* Cara 2: Manual Drag & Drop Folder dist */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">B</span>
              <span>Metode 2: Drag & Drop Folder Build (Tanpa Git)</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>Di komputer/terminal Anda, jalankan perintah build:
                <div className="mt-1 font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 p-2 rounded-lg">
                  npm run build
                </div>
              </li>
              <li>Perintah ini akan menghasilkan folder bernama <code className="font-mono font-bold text-slate-900">dist/</code> di direktori utama.</li>
              <li>Buka dashboard <b>app.netlify.com/drop</b> di browser.</li>
              <li>Tarik (drag) folder <code className="font-mono font-bold text-slate-900">dist/</code> tersebut lalu lepas (drop) di kotak upload Netlify.</li>
              <li>Selesai! Netlify akan langsung memberikan URL website publik yang bisa diakses siapa saja.</li>
            </ol>
          </div>

        </div>
      </div>

    </div>
  );
};
