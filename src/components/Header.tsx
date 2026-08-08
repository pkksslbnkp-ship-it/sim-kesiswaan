import React, { useState } from 'react';
import { ChevronDown, LogOut, RefreshCw, FileText, Database, Check, Bell } from 'lucide-react';

export function Header({
  currentUser,
  allUsers = [],
  schoolLogo,
  onSwitchUser,
  onResetData,
  onOpenDoc,
  onLogout,
  onOpenSchoolLogoModal,
  onOpenSupabaseModal,
}: any) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ambil list user dari props, jika kosong ambil dari currentUser
  const userList = allUsers && allUsers.length > 0 ? allUsers : (currentUser ? [currentUser] : []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg">
            V2.5
          </span>
          <button
            onClick={onOpenSchoolLogoModal}
            className="text-xs font-extrabold text-slate-700 hover:text-blue-600 flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition"
          >
            <span>{schoolLogo ? 'Logo Terpasang' : 'Logo Sekolah'}</span>
          </button>
          <h1 className="text-sm font-black text-slate-800 hidden md:block">
            Manajemen Data Kesiswaan
          </h1>
        </div>

        {/* Buttons & Profile Dropdown */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSupabaseModal}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-emerald-200 transition"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase DB</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Dokumentasi Tech & ERD</span>
          </button>

          <button
            onClick={onResetData}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown Dinamis */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <div className="font-black text-slate-900 leading-none">
                  {currentUser?.name || 'Administrator Utama'}
                </div>
                <div className="text-[9px] font-bold text-amber-700 uppercase mt-0.5">
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                  GANTI AKSES PENGGUNA (SIMULASI)
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {userList.map((u: any, idx: number) => (
                    <button
                      key={u.id || idx}
                      onClick={() => {
                        if (onSwitchUser) onSwitchUser(u);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl transition flex items-center justify-between text-xs ${
                        currentUser?.name === u.name
                          ? 'bg-blue-600 text-white font-bold'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-black truncate">{u.name}</div>
                        <div
                          className={`text-[10px] ${
                            currentUser?.name === u.name ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          Role: {u.role}
                        </div>
                      </div>
                      {currentUser?.name === u.name && (
                        <Check className="w-4 h-4 text-white flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={onLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar / Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-extrabold flex items-center space-x-1 border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;