import React from 'react';
import {
  Book,
  Code2,
  Database,
  Server,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  FileCode,
  Globe,
} from 'lucide-react';

export const TechnicalDoc: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Book className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Dokumentasi Teknis Sistem
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2">
            Panduan arsitektur, konfigurasi basis data Supabase, dan alur integrasi aplikasi SIM Kesiswaan.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Status: Production</span>
          </span>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Frontend & UI</h3>
          <p className="text-xs text-slate-500 font-medium">
            React 18, TypeScript, Vite, dan Tailwind CSS untuk antarmuka yang responsif dan modern.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Backend & Database</h3>
          <p className="text-xs text-slate-500 font-medium">
            Supabase PostgreSQL untuk penyimpanan data real-time, authentikasi, dan otorisasi.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Deployment</h3>
          <p className="text-xs text-slate-500 font-medium">
            Hosted di Netlify dengan build pipeline otomatis langsung dari repositori GitHub.
          </p>
        </div>
      </div>

      {/* Database Schema / Setup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <Server className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-black text-slate-900">Variabel Lingkungan (Environment Variables)</h3>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Sistem menggunakan variabel lingkungan berikut yang dikonfigurasi di Netlify & lingkungan lokal:
        </p>
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto space-y-1">
          <div><span className="text-blue-400">VITE_SUPABASE_URL</span>=https://your-supabase-project.supabase.co</div>
          <div><span className="text-blue-400">VITE_SUPABASE_ANON_KEY</span>=your-supabase-anon-key</div>
        </div>
      </div>

      {/* Features & Structure */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <Layers className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-black text-slate-900">Modul Utama Sistem</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Manajemen Data Siswa</span>
            </div>
            <p className="text-slate-500">Pencatatan profil siswa, status aktif/alumni, dan rekam poin pelanggaran.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Manajemen Prestasi & Alumni</span>
            </div>
            <p className="text-slate-500">Pencatatan rekam jejak prestasi akademik/non-akademik serta penelusuran alumni.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Import Data Excel</span>
            </div>
            <p className="text-slate-500">Fitur unggah masal data siswa dari file spreadsheet Excel / CSV.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Otorisasi Berbasis Peran</span>
            </div>
            <p className="text-slate-500">Hak akses bertingkat untuk Admin, Tim Kesiswaan, dan Wali Kelas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDoc;
