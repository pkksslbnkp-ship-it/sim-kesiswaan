import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap, Shield, UserCheck, Bell, RefreshCw, ChevronDown, Check, Info, LogOut, Database, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  schoolLogo?: string | null;
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  onOpenDoc: () => void;
  onLogout: () => void;
  onOpenSchoolLogoModal?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  schoolLogo,
  onSwitchUser,
  onResetData,
  onOpenDoc,
  onLogout,
  onOpenSchoolLogoModal,
  onOpenSupabaseModal,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & School Title / Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSchoolLogoModal}
            className="group relative cursor-pointer focus:outline-none flex-shrink-0"
            title="Klik untuk Mengunggah / Mengubah Logo Sekolah"
          >
            {schoolLogo ? (
              <div className="relative">
                <img
                  src={schoolLogo}
                  alt="Logo Sekolah"
                  className="w-14 h-14 object-contain rounded-2xl border-2 border-blue-500 p-1 bg-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition"
                />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center border border-white shadow">
                  ✓
                </span>
              </div>
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black group-hover:bg-blue-700 transition">
                <GraduationCap className="w-7 h-7" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center border-2 border-white opacity-0 group-hover:opacity-100 transition shadow">
              ✎
            </span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">SIM-KESISWAAN</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-black uppercase tracking-wider">
                v2.5
              </span>
              {schoolLogo && (
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Logo Terpasang
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-bold tracking-tight hidden sm:block">
              Waka Kesiswaan • Sistem Manajemen Data Kesiswaan & Alumni
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Logo Upload Header Button */}
          {onOpenSchoolLogoModal && (
            <button
              onClick={onOpenSchoolLogoModal}
              id="btn-school-logo"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center space-x-1.5"
              title="Upload Logo Sekolah"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Logo Sekolah</span>
            </button>
          )}

          {/* Supabase Integration Button */}
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              id="btn-supabase-modal"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center space-x-1.5 shadow-sm"
              title="Integrasi Supabase Cloud Database"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Supabase DB</span>
            </button>
          )}

          {/* Quick Technical Doc Button */}
          <button
            onClick={onOpenDoc}
            id="btn-tech-doc"
            className="hidden md:flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
            title="Lihat Rekomendasi Tech Stack, ERD, & Panduan Kode"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>Dokumentasi Tech & ERD</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            id="btn-reset-demo"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center space-x-1.5"
            title="Reset Data Demo"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="btn-notifications"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition border border-slate-200"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">Notifikasi Kesiswaan</span>
                  <span className="text-[10px] font-bold text-blue-600">Terbaru</span>
                </div>
                <div className="space-y-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-amber-600">Siswa Baru Terdaftar</p>
                    <p className="text-slate-600 text-[11px] font-medium mt-0.5">25 Siswa angkatan 2025/2026 diimpor lewat Excel.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-emerald-600">Prestasi Baru Added</p>
                    <p className="text-slate-600 text-[11px] font-medium mt-0.5">Daffa Farhan meraih Juara 1 LKS Web Tech.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              id="btn-user-role-switcher"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border transition shadow-sm ${
                isAdmin
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-amber-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                )}
                <div className="text-left">
                  <div className="text-xs font-extrabold leading-tight line-clamp-1">{currentUser.name}</div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-slate-500">
                    {isAdmin ? 'Admin (Waka)' : 'User (Guru)'}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu to Switch User Role */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-800">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  Ganti Akses Pengguna (Simulasi)
                </div>
                <div className="mt-1 space-y-1">
                  {allUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              user.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              Role: {user.role === 'admin' ? 'Waka Kesiswaan (Full)' : 'Guru (Read-only)'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                  <div className="text-[10px] text-slate-500 px-2 italic font-medium">
                    💡 Toggle role ini berguna untuk menguji batasan hak akses Waka Kesiswaan vs Guru.
                  </div>
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center space-x-2 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standalone Logout Button */}
          <button
            onClick={onLogout}
            id="btn-logout"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center space-x-1.5"
            title="Keluar dari Akun"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Keluar</span>
          </button>

        </div>
      </div>
    </header>
  );
};
