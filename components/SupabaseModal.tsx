import React, { useState } from 'react';
import { Database, X, Key, Globe, CheckCircle } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (url: string, key: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(supabaseUrl, supabaseAnonKey);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Pengaturan Supabase
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Hubungkan aplikasi ke database Supabase milik Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="url"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Supabase Anon API Key</span>
            </label>
            <textarea
              rows={3}
              required
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhY2... (Anon Key)"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan Koneksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupabaseModal;
