import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, AlertCircle } from 'lucide-react';
import { UserAccount } from './UserManagement';

interface LoginPageProps {
  onLogin: (role: UserRole, userAccount: UserAccount) => void;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: '1',
    name: 'Administrator Utama',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    password: 'admin123password',
    role: 'admin',
    status: 'Aktif',
  },
  {
    id: '2',
    name: 'Tim Kesiswaan',
    username: 'kesiswaan',
    email: 'kesiswaan@sekolah.sch.id',
    password: 'kesiswaan123password',
    role: 'kesiswaan',
    status: 'Aktif',
  },
  {
    id: '3',
    name: 'Wali Kelas X IPA 1',
    username: 'walikelas10',
    email: 'walikelas@sekolah.sch.id',
    password: 'walikelas123password',
    role: 'walikelas',
    status: 'Aktif',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Ambil daftar user dari localStorage atau fallback ke DEFAULT_USERS
    const savedUsers = localStorage.getItem('sim_users');
    const usersList: UserAccount[] = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

    const inputClean = usernameInput.toLowerCase().trim();

    // Cari user berdasarkan username/email AND password
    const matchedUser = usersList.find(
      (u) =>
        (u.username.toLowerCase() === inputClean || u.email.toLowerCase() === inputClean) &&
        (u.password ? u.password === passwordInput : passwordInput === '123456')
    );

    if (matchedUser) {
      if (matchedUser.status === 'Nonaktif') {
        setErrorMessage('Akun ini sedang dinonaktifkan oleh Administrator.');
        return;
      }
      localStorage.setItem('sim_active_user', JSON.stringify(matchedUser));
      onLogin(matchedUser.role, matchedUser);
    } else {
      setErrorMessage('Username/Email atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/30">
            SIM
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            SIM KESISWAAN
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Masukkan Username dan Password Anda
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Username / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username atau Email"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/25 mt-2 text-xs"
          >
            Masuk ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
};
