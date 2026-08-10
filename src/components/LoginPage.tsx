import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ allUsers, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State Toggle Mata
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username / Email wajib diisi!');
      return;
    }
    if (!password) {
      setError('Password wajib diisi!');
      return;
    }

    // Cari user berdasarkan Username/Email & Password
    const foundUser = allUsers.find(
      (u) =>
        (u.username.toLowerCase() === username.trim().toLowerCase() ||
         u.name.toLowerCase() === username.trim().toLowerCase()) &&
        u.password === password
    );

    if (!foundUser) {
      setError('Username atau Password yang Anda masukkan salah!');
      return;
    }

    if (foundUser.status === 'nonaktif') {
      setError('Akun Anda dinonaktifkan. Silakan hubungi Administrator.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-center text-white relative">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase">SIM-KESISWAAN</h1>
          <p className="text-xs text-blue-100/80 mt-1 font-medium">
            Sistem Informasi Manajemen Kesiswaan & Alumni
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Pesan Error */}
          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="guru@sekolah.sch.id"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Input Password + Ikon Mata (Toggle Visibility) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-blue-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none z-20 cursor-pointer"
                title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/25 active:scale-[0.98]"
            >
              Masuk ke Sistem
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default LoginPage;