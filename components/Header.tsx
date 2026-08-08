import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  FileCode,
  Database,
  Image as ImageIcon,
  RotateCcw,
  Check,
} from 'lucide-react';

interface HeaderProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSupabaseModal: () => void;
  onOpenTechnicalDoc: () => void;
  onOpenLogoModal: () => void;
  onLogout?: () => void;
  currentUser?: {
    name: string;
    role: string;
    username?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  onOpenSupabaseModal,
  onOpenTechnicalDoc,
  onOpenLogoModal,
  onLogout,
  currentUser,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Ambil user aktif dari prop atau localStorage
  const activeUser = currentUser || (() => {
    const saved = localStorage.getItem('sim_active_user');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Administrator Utama',
          role: 'admin',
          username: 'admin',
        };
  })();

  const handleSelectRole = (role: UserRole) => {
    onRoleChange(role);
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl font-black text-sm tracking-wider shadow-md shadow-blue-600/20">
            SIM
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">
              SIM KESISWAAN
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
              Sistem Manajemen Data Kesiswaan
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenLogoModal}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            title="Pengaturan Logo Sekolah"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Logo Sekolah</span>
          </button>

          <button
            onClick={onOpenSupabaseModal}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
            title="Koneksi Supabase Database"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase DB</span>
          </button>

          <button
            onClick={onOpenTechnicalDoc}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            title="Dokumentasi Teknis & ERD"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dokumentasi Tech</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 transition"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {activeUser.name}
                </div>
                <div className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wider">
                  {activeUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 rounded-xl mb-2">
                  <div className="text-xs font-extrabold text-slate-900">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    @{activeUser.username || 'user'} • Status: Aktif
                  </div>
                </div>

                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2 py-1">
                  Ganti Hak Akses (Simulasi)
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectRole('admin')}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                      activeRole === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Admin (Full Access)</span>
                    {activeRole === 'admin' && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleSelectRole('kesiswaan')}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                      activeRole === 'kesiswaan'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tim Kesiswaan</span>
                    {activeRole === 'kesiswaan' && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleSelectRole('walikelas')}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                      activeRole === 'walikelas'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Wali Kelas</span>
                    {activeRole === 'walikelas' && <Check className="w-4 h-4" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
