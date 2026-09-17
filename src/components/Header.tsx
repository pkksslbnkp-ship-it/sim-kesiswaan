import React, { useState } from 'react';
import { User } from '../types';
import { 
  LogOut, 
  BookOpen, 
  Database, 
  Image as ImageIcon,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  schoolLogo: string | null;
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  onOpenDoc: () => void;
  onLogout: () => void;
  onOpenSchoolLogoModal: () => void;
  onOpenSupabaseModal: () => void;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      onLogout();
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Info Sekolah */}
          <div className="flex items-center space-x-3">
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo Sekolah" className="w-9 h-9 object-contain rounded bg-white p-0.5" />
            ) : (
              <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow">
                SIM
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SIM-KESISWAAN</span>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Waka Kesiswaan • Sistem Manajemen Data Kesiswaan & Alumni
              </p>
            </div>
          </div>

          {/* Action Buttons Top Header */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSchoolLogoModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Logo Sekolah</span>
            </button>

            <button
              onClick={onOpenSupabaseModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-400 transition border border-slate-700"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase DB</span>
            </button>

            <button
              onClick={onOpenDoc}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Dokumentasi Tech & ERD</span>
            </button>

            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Reset Data Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-left"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-400 uppercase font-bold">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-slate-800 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500">Login sebagai:</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {currentUser.role}
                    </span>
                  </div>

                  {/* RESTRIKSI KEAMANAN: Opsi Ganti Peran Hanya Tampil untuk ADMIN */}
                  {currentUser.role === 'ADMIN' && (
                    <>
                      <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Ganti Peran (Demo Admin)
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {allUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u);
                              setIsProfileOpen(false);
                            }}
                            className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 transition ${
                              u.id === currentUser.id ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase ml-2">{u.role}</span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 my-1"></div>
                    </>
                  )}

                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};