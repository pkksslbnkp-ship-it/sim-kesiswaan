import React from 'react';
import {
  LayoutDashboard,
  Users,
  Upload,
  Trophy,
  GraduationCap,
  UserCheck,
  FileCode,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts?: {
    students?: number;
    achievements?: number;
    alumni?: number;
    users?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  counts = {},
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Data Siswa',
      icon: Users,
      badge: counts?.students ?? 8,
    },
    {
      id: 'excel-upload', // 👈 DIUBAH: dari 'import' menjadi 'excel-upload'
      label: 'Upload & Import Excel',
      icon: Upload,
      tag: 'Admin',
    },
    {
      id: 'achievements',
      label: 'Data Prestasi',
      icon: Trophy,
      badge: counts?.achievements ?? 5,
    },
    {
      id: 'alumni',
      label: 'Data Alumni',
      icon: GraduationCap,
      badge: counts?.alumni ?? 4,
    },
    {
      id: 'users', // 👈 DIUBAH: dari 'usermanagement' menjadi 'users'
      label: 'Manajemen Pengguna',
      icon: UserCheck,
      badge: counts?.users ?? 3,
    },
    {
      id: 'technical-doc', // 👈 DIUBAH: dari 'erd' menjadi 'technical-doc'
      label: 'Rekomendasi Tech & ERD',
      icon: FileCode,
      tag: 'Docs',
    },
  ];

  return (
    <aside className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border border-slate-800 flex flex-col justify-between min-h-[600px] font-sans">
      <div>
        {/* Header Sidebar */}
        <div className="flex items-center space-x-3 px-3 py-3 mb-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-md">
            SIM
          </div>
          <div>
            <div className="font-black text-xs tracking-wide text-white">SIM-KES</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Waka Kesiswaan
            </div>
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3 mb-2">
          Main Menu
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.tag && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        item.tag === 'Admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status Hak Akses */}
      <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 mt-6">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-wider mb-1">
          <span>Status Akses Saat Ini</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          🔑 <strong className="text-amber-400">Akses Admin (Waka):</strong> Hak akses penuh CRUD data siswa, alumni, prestasi, user & import Excel.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;