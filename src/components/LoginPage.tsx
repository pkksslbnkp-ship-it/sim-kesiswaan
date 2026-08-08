import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
  password?: string;
}

interface LoginPageProps {
  users: UserAccount[];
  onLogin: (role: any, userAccount?: UserAccount) => void;
  schoolLogo?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, schoolLogo }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = usernameInput.toLowerCase().trim().replace(/^@/, '');
    const cleanPassword = passwordInput.trim();

    // Utamakan daftar users dari props, fallback ke LocalStorage jika render awal
    const activeUsersList: UserAccount[] =
      users && users.length > 0
        ? users
        : JSON.parse(localStorage.getItem('sim_users') || '[]');

    const matchedUser = activeUsersList.find((u) => {
      const dbUsername = (u.username || '').toLowerCase().trim().replace(/^@/, '');
      const dbEmail = (u.email || '').toLowerCase().trim();
      return dbUsername === cleanInput || dbEmail === cleanInput;
    });

    if (matchedUser) {
      if (matchedUser.status === 'Nonaktif') {
        setErrorMessage('Akun Anda saat ini dinonaktifkan oleh Administrator.');
        return;
      }

      if (matchedUser.password === cleanPassword) {
        const updatedUser = {
          ...matchedUser,
          lastLogin: new Date().toLocaleString('id-ID'),
        };
        localStorage.setItem('sim_active_user', JSON.stringify(updatedUser));
        onLogin(matchedUser.role, updatedUser);
        return;
      } else {
        setErrorMessage('Password salah! Silakan periksa kembali password Anda.');
        return;
      }
    }

    setErrorMessage('Username atau Email tidak ditemukan dalam sistem.');
  };

  const quickFill = (username: string, pass: string) => {
    setUsernameInput(username);
    setPasswordInput(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white rounded-3xl max-w-4xl w-full grid md:grid-cols-2 shadow-2xl overflow-hidden border border-slate-100 z-10">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="Logo Sekolah"
                className="w-16 h-16 object-contain rounded-2xl bg-white p-2 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight">SIM-KESISWAAN</h1>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-1">
                Sistem Data Siswa & Alumni
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 my-8">
            <div className="flex items-center space-x-3 text-xs bg-white/10 p-3 rounded-xl border border-white/10">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Sistem Otorisasi Multi-Role Terjaga</span>
            </div>
            <div className="flex items-center space-x-3 text-xs bg-white/10 p-3 rounded-xl border border-white/10">
              <User className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Kelola Database Siswa & Manajemen Akses</span>
            </div>
          </div>

          <div className="text-[10px] text-blue-300 font-medium relative z-10">
            © 2026 SIM-KESISWAAN • Sekolah Menengah
          </div>
        </div>

        <div className="p-8 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Silakan masukkan Username dan Password Anda untuk masuk ke dalam sistem.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Masukkan username atau email"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-lg shadow-blue-600/25 mt-2 text-xs flex items-center justify-center space-x-2"
            >
              <span>MASUK KE SISTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
              Klik Isi Cepat Akun Demo:
            </span>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => quickFill('admin', 'admin123')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
              >
                Admin
              </button>
              <button
                onClick={() => quickFill('guru', 'guru123')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
              >
                Siti (Guru)
              </button>
              <button
                onClick={() => quickFill('budi', 'guru123')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
              >
                Budi (Guru)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};