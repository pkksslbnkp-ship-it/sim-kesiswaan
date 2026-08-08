import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, X, ShieldCheck } from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  resetSupabaseClient,
  checkSupabaseConnection,
  getSupabaseTableSQL,
  syncStudentsToSupabase,
  fetchStudentsFromSupabase,
} from '../lib/supabase';
import { Student } from '../types';

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
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ isError: boolean; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setKey(config.key);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsTesting(true);

    saveSupabaseConfig(url, key);
    resetSupabaseClient();

    const res = await checkSupabaseConnection();
    setIsTesting(false);

    if (res.success) {
      setStatusMsg({ isError: false, text: res.message });
    } else {
      setStatusMsg({ isError: true, text: res.message });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    resetSupabaseClient();
    setUrl('');
    setKey('');
    setStatusMsg({ isError: false, text: 'Konfigurasi Supabase berhasil direset ke penyimpanan lokal.' });
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSupabaseTableSQL());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    const success = await syncStudentsToSupabase(students);
    setIsSyncing(false);
    if (success) {
      setStatusMsg({ isError: false, text: `Berhasil mengunggah ${students.length} data siswa ke database Supabase!` });
    } else {
      setStatusMsg({ isError: true, text: 'Gagal sinkronisasi data ke Supabase. Pastikan tabel "students" sudah dibuat menggunakan script SQL.' });
    }
  };

  const handleFetchFromCloud = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    const cloudStudents = await fetchStudentsFromSupabase();
    setIsSyncing(false);
    if (cloudStudents && cloudStudents.length > 0) {
      onStudentsUpdated(cloudStudents);
      setStatusMsg({ isError: false, text: `Berhasil mengunduh ${cloudStudents.length} data siswa dari Supabase!` });
    } else if (cloudStudents && cloudStudents.length === 0) {
      setStatusMsg({ isError: false, text: 'Tabel Supabase masih kosong.' });
    } else {
      setStatusMsg({ isError: true, text: 'Gagal mengunduh data dari Supabase. Periksa koneksi dan tabel database.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Integrasi Database Supabase
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Cloud DB</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Hubungkan SIM-KESISWAAN dengan PostgreSQL Supabase milik Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'config'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Pengaturan Kredensial
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'sql'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Script SQL Schema
          </button>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 ${
              statusMsg.isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMsg.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {activeTab === 'config' ? (
            <form onSubmit={handleSaveAndTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supabase Project URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://xyzxyz.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Dapatkan di Dashboard Supabase &gt; Project Settings &gt; API &gt; Project URL
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supabase Anon Public Key *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="eyJhY2... (Key Anon Public Supabase)"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Dapatkan di Dashboard Supabase &gt; Project Settings &gt; API &gt; Project API keys (anon public)
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-2"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Simpan & Tes Koneksi</span>
                </button>

                {url && key && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold transition"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {/* Cloud Sync Section */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Sinkronisasi Data Siswa
                </h4>
                <p className="text-xs text-slate-500">
                  Setelah koneksi berhasil, Anda dapat mengunggah data lokal ke Supabase atau mengunduh data dari cloud.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSyncing || !url || !key}
                    onClick={handleSyncToCloud}
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Upload Lokal ke Supabase ({students.length} Siswa)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncing || !url || !key}
                    onClick={handleFetchFromCloud}
                    className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Download Dari Supabase</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium">
                  Salin script SQL di bawah ini dan jalankan pada menu <strong>SQL Editor</strong> di dashboard Supabase Anda:
                </p>
                <button
                  onClick={handleCopySQL}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center space-x-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800 max-h-72 select-all">
                {getSupabaseTableSQL()}
              </pre>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Buka Supabase SQL Editor: <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">supabase.com/dashboard</a>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
