import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, getSupabaseCredentials } from '../lib/supabaseConfig';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onStudentsUpdated: (students: Student[]) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  students,
  onStudentsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');
  
  // Mengambil kredensial default secara otomatis
  const initialCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(initialCreds.url);
  const [key, setKey] = useState(initialCreds.key);

  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setKey(creds.key);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setStatus('testing');
    setMessage('Menghubungkan ke Supabase...');

    try {
      if (!url || !key) {
        throw new Error('URL dan Anon Key Supabase wajib diisi.');
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);

      const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Gagal terhubung: ${error.message}`);
      }

      // Simpan kredensial ke LocalStorage
      localStorage.setItem('sim_kesiswaan_supabase_url', url);
      localStorage.setItem('sim_kesiswaan_supabase_key', key);

      setStatus('success');
      setMessage('Koneksi ke database Supabase BERHASIL!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Gagal sinkronisasi data ke Supabase. Pastikan tabel "students" sudah dibuat.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('sim_kesiswaan_supabase_url');
    localStorage.removeItem('sim_kesiswaan_supabase_key');
    setUrl(DEFAULT_SUPABASE_URL);
    setKey(DEFAULT_SUPABASE_KEY);
    setStatus('idle');
    setMessage('');
  };

  const handleUploadToCloud = async () => {
    if (!students || students.length === 0) {
      alert('Tidak ada data siswa lokal untuk diunggah.');
      return;
    }

    setStatus('testing');
    setMessage(`Mengunggah ${students.length} data siswa ke Supabase...`);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);

      // Map data ke format ganda (snake_case & camelCase) agar cocok dengan kolom di Supabase
      const payload = students.map((s) => ({
        id: s.id,
        nisn: s.nisn,
        nis: s.nis,
        name: s.name,
        gender: s.gender,
        class: s.class,
        major: s.major,
        religion: s.religion,
        specialNeeds: s.specialNeeds,
        special_needs: s.specialNeeds,
        generation: s.generation,
        entryYear: s.entryYear,
        entry_year: s.entryYear ? String(s.entryYear) : '',
        status: s.status,
        birthPlace: s.birthPlace,
        birth_place: s.birthPlace,
        birthDate: s.birthDate,
        birth_date: s.birthDate,
        address: s.address,
        phone: s.phone,
        parentName: s.parentName,
        parent_name: s.parentName,
        parentPhone: s.parentPhone,
        parent_phone: s.parentPhone,
        notes: s.notes,
        createdAt: s.createdAt,
        created_at: s.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabase.from('students').upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      setStatus('success');
      setMessage(`Berhasil mengunggah ${students.length} data siswa ke database Supabase!`);
    } catch (err: any) {
      setStatus('error');
      setMessage(`Gagal mengunggah: ${err.message || 'Periksa struktur tabel Supabase Anda.'}`);
    }
  };

  const handleDownloadFromCloud = async () => {
    setStatus('testing');
    setMessage('Mengunduh data dari Supabase...');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);

      const { data, error } = await supabase.from('students').select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        setStatus('error');
        setMessage('Database Cloud Supabase masih kosong.');
        return;
      }

      const formattedStudents: Student[] = data.map((item: any) => ({
        id: item.id || `std-${Date.now()}-${Math.random()}`,
        nisn: item.nisn || '',
        nis: item.nis || '',
        name: item.name || 'Siswa',
        gender: (item.gender ? String(item.gender).toUpperCase() : 'L') as 'L' | 'P',
        class: item.class || '10B',
        major: item.major || 'Tunagrahita',
        religion: item.religion || 'Islam',
        specialNeeds: item.specialNeeds || item.special_needs || 'Tidak Ada',
        generation: item.generation || '2025/2026',
        entryYear: Number(item.entryYear || item.entry_year) || 2025,
        status: item.status || 'Aktif',
        birthPlace: item.birthPlace || item.birth_place || '',
        birthDate: item.birthDate || item.birth_date || '',
        address: item.address || '',
        phone: item.phone || '',
        parentName: item.parentName || item.parent_name || '',
        parentPhone: item.parentPhone || item.parent_phone || '',
        notes: item.notes || '',
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      }));

      onStudentsUpdated(formattedStudents);
      setStatus('success');
      setMessage(`Berhasil mengunduh ${formattedStudents.length} data siswa dari Supabase!`);
    } catch (err: any) {
      setStatus('error');
      setMessage(`Gagal mengunduh data: ${err.message}`);
    }
  };

  const sqlCode = `-- SQL Schema Setup untuk SIM-KESISWAAN
DROP TABLE IF EXISTS public.students CASCADE;

CREATE TABLE public.students (
  id TEXT PRIMARY KEY,
  nisn TEXT,
  nis TEXT,
  name TEXT NOT NULL,
  "class" TEXT,
  major TEXT,
  gender TEXT,
  status TEXT,
  violation_points INT DEFAULT 0,
  phone TEXT,
  parent_name TEXT,
  "parentName" TEXT,
  parent_phone TEXT,
  "parentPhone" TEXT,
  address TEXT,
  birth_place TEXT,
  "birthPlace" TEXT,
  birth_date TEXT,
  "birthDate" TEXT,
  photo TEXT,
  notes TEXT,
  religion TEXT,
  special_needs TEXT,
  "specialNeeds" TEXT,
  generation TEXT,
  entry_year TEXT,
  "entryYear" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TEXT
);

ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">Integrasi Database Supabase</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Cloud DB
                </span>
              </div>
              <p className="text-sm text-slate-500">Hubungkan SIM-KESISWAAN dengan PostgreSQL Supabase milik Sekolah</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'credentials'
                ? 'bg-white text-emerald-600 shadow-sm border-t-2 border-emerald-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Pengaturan Kredensial
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'sql'
                ? 'bg-white text-emerald-600 shadow-sm border-t-2 border-emerald-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Script SQL Schema
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 ${
              status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              status === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <div className="flex-1">{message}</div>
            </div>
          )}

          {activeTab === 'credentials' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  SUPABASE PROJECT URL *
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  SUPABASE ANON PUBLIC KEY *
                </label>
                <textarea
                  rows={3}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={status === 'testing'}
                  className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Simpan & Tes Koneksi
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all"
                >
                  Disconnect
                </button>
              </div>

              <hr className="my-6 border-slate-100" />

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">SINKRONISASI DATA SISWA</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Setelah koneksi berhasil, Anda dapat mengunggah data lokal ke Supabase atau mengunduh data dari cloud.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleUploadToCloud}
                    disabled={status === 'testing'}
                    className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Upload Lokal ke Supabase ({students.length} Siswa)
                  </button>
                  <button
                    onClick={handleDownloadFromCloud}
                    disabled={status === 'testing'}
                    className="px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Download Dari Supabase
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Salin script SQL di bawah ini, lalu jalankan di menu <strong>SQL Editor</strong> pada Dashboard Supabase Anda.
                </p>
                <button
                  onClick={copySql}
                  className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-all"
                >
                  {copied ? 'Tersalin!' : 'Copy SQL'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                {sqlCode}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};