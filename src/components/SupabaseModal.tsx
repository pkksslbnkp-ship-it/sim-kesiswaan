import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getSupabaseCredentials, supabase } from '../lib/supabaseConfig';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onStudentsUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onStudentsUpdated }) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');
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
      const { error } = await supabase.from('students').select('count', { count: 'exact', head: true });
      if (error) throw error;

      localStorage.setItem('sim_kesiswaan_supabase_url', url);
      localStorage.setItem('sim_kesiswaan_supabase_key', key);

      setStatus('success');
      setMessage('Koneksi ke Supabase BERHASIL!');
      onStudentsUpdated();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Gagal terhubung ke Supabase.');
    }
  };

  const sqlCode = `-- SQL Schema Setup
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  nisn TEXT,
  nis TEXT,
  name TEXT NOT NULL,
  "class" TEXT,
  major TEXT,
  gender TEXT,
  status TEXT,
  phone TEXT,
  parent_name TEXT,
  "parentName" TEXT,
  address TEXT,
  birth_place TEXT,
  "birthPlace" TEXT,
  birth_date TEXT,
  "birthDate" TEXT,
  religion TEXT,
  special_needs TEXT,
  "specialNeeds" TEXT,
  generation TEXT,
  entry_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Koneksi Database Supabase</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="px-6 pt-4 bg-slate-50 border-b flex gap-2">
          <button onClick={() => setActiveTab('credentials')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'credentials' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500'}`}>
            1. Pengaturan Kredensial
          </button>
          <button onClick={() => setActiveTab('sql')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'sql' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500'}`}>
            2. Script SQL
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${status === 'success' ? 'bg-emerald-50 text-emerald-800' : status === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'}`}>
              {message}
            </div>
          )}

          {activeTab === 'credentials' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">PROJECT URL</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-2 border rounded-xl font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">ANON PUBLIC KEY</label>
                <textarea rows={3} value={key} onChange={(e) => setKey(e.target.value)} className="w-full px-4 py-2 border rounded-xl font-mono text-xs" />
              </div>
              <button onClick={handleTestConnection} disabled={status === 'testing'} className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                Uji Koneksi & Simpan
              </button>
            </div>
          ) : (
            <div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">{sqlCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};