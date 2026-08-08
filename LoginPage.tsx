import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap, Key, Lock, Eye, EyeOff, LogIn, CheckCircle2, ShieldCheck, Users, Award } from 'lucide-react';

interface LoginPageProps {
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ allUsers, onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const schoolLogo = localStorage.getItem('sim_kesiswaan_school_logo');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMsg('Mohon isi Username / Email dan Password!');
      return;
    }

    // Find user by username or email
    const matchedUser = allUsers.find((u) => {
      const matchUser = u.username?.toLowerCase() === cleanInput;
      const matchEmail = u.email.toLowerCase() === cleanInput;
      return matchUser || matchEmail;
    });

    if (!matchedUser) {
      setErrorMsg('Username atau Email tidak ditemukan dalam sistem.');
      return;
    }

    // Validate password (default password if undefined is admin123 or guru123)
    const validPassword = matchedUser.password || (matchedUser.role === 'admin' ? 'admin123' : 'guru123');

    if (cleanPass !== validPassword) {
      setErrorMsg('Password yang Anda masukkan salah!');
      return;
    }

    if (matchedUser.status === 'nonaktif') {
      setErrorMsg('Akun ini sedang dinonaktifkan oleh administrator.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Left Section: Branding & System Overview */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center space-x-3.5 mb-8">
              {schoolLogo ? (
                <img
                  src={schoolLogo}
                  alt="Logo Sekolah"
                  className="w-12 h-12 object-contain rounded-2xl bg-white p-1 border border-blue-400 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-black">
                  <GraduationCap className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">SIM-KESISWAAN</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Sistem Data Siswa & Alumni</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Platform terpadu untuk pengelolaan biodata siswa aktif, rekapitulasi prestasi kejuaraan, serta pelusuran data alumni sekolah.
              </p>

              <div className="pt-4 space-y-3">
                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Kelola Database Siswa & Excel Batch</span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Pencatatan Prestasi & Piagam Siswa</span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Sistem Otorisasi Multi-Role Terjaga</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800/80 text-[10px] text-slate-400 font-medium">
            &copy; 2026 SIM-KESISWAAN • Sekolah Menengah Kejuruan / Atas
          </div>
        </div>

        {/* Right Section: Form Input */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Silakan masukkan Username dan Password Anda untuk masuk ke dalam sistem.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username atau email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ke Sistem</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Sistem Terproteksi • Akses Kesiswaan Terenkripsi
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

