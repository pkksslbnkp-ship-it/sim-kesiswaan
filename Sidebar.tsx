import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Trophy, 
  GraduationCap, 
  UserCog, 
  FileCode, 
  FileText
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 
  | 'dashboard' 
  | 'students' 
  | 'excel-upload' 
  | 'achievements' 
  | 'alumni' 
  | 'users' 
  | 'technical-doc';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  schoolLogo?: string | null;
  counts: {
    students: number;
    achievements: number;
    alumni: number;
    users: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  schoolLogo,
  counts,
}) => {
  const isAdmin = userRole === 'admin';

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'students' as TabType,
      label: 'Data Siswa',
      icon: Users,
      badge: counts.students,
      adminOnly: false,
    },
    {
      id: 'excel-upload' as TabType,
      label: 'Upload & Import Excel',
      icon: FileSpreadsheet,
      badge: 'Admin',
      adminOnly: true,
    },
    {
      id: 'achievements' as TabType,
      label: 'Data Prestasi',
      icon: Trophy,
      badge: counts.achievements,
      adminOnly: false,
    },
    {
      id: 'alumni' as TabType,
      label: 'Data Alumni',
      icon: GraduationCap,
      badge: counts.alumni,
      adminOnly: false,
    },
    {
      id: 'users' as TabType,
      label: 'Manajemen Pengguna',
      icon: UserCog,
      badge: counts.users,
      adminOnly: true,
    },
    {
      id: 'technical-doc' as TabType,
      label: 'Rekomendasi Tech & ERD',
      icon: FileCode,
      badge: 'Docs',
      adminOnly: false,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex-shrink-0 flex flex-col justify-between p-4">
      <div className="space-y-4">
        {/* Sidebar Brand Accent with School Logo */}
        <div className="p-3 border-b border-slate-800 pb-4 bg-slate-950/60 rounded-2xl flex items-center space-x-3">
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt="Logo Sekolah"
              className="w-11 h-11 object-contain rounded-xl bg-white p-1 border border-slate-700 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black flex-shrink-0 shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-lg font-black tracking-tighter leading-none text-white truncate">
              SIM-KES
            </div>
            <div className="text-blue-400 text-[10px] font-black tracking-widest uppercase mt-0.5 truncate">
              Waka Kesiswaan
            </div>
          </div>
        </div>

        <div>
          <div className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Main Menu
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled = false;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-${item.id}`}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : isDisabled
                          ? 'text-slate-600'
                          : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.badge === 'Docs'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Access Permission Card Notice */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-200 mb-1">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>Status Akses Saat Ini</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug font-medium">
          {isAdmin ? (
            <span className="text-amber-300">
              🔑 <b>Akses Admin (Waka):</b> Hak akses penuh CRUD data siswa, alumni, prestasi, user & import Excel.
            </span>
          ) : (
            <span className="text-emerald-300">
              👁️ <b>Akses User (Guru):</b> Akses Read-only untuk melihat & memfilter data siswa, prestasi, dan alumni.
            </span>
          )}
        </p>
      </div>
    </aside>
  );
};
