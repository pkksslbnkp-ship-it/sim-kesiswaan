import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  Trophy,
  GraduationCap,
  FileSpreadsheet,
  Activity,
  BookOpen,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'students'
  | 'achievements'
  | 'alumni'
  | 'excel'
  | 'logs'
  | 'guide';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
}) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as TabType, label: 'Data Siswa', icon: Users },
    { id: 'achievements' as TabType, label: 'Data Prestasi', icon: Trophy },
    { id: 'alumni' as TabType, label: 'Data Alumni', icon: GraduationCap },
    { id: 'excel' as TabType, label: 'Import Excel', icon: FileSpreadsheet },
    { id: 'logs' as TabType, label: 'Log Aktivitas', icon: Activity },
    { id: 'guide' as TabType, label: 'Panduan Sistem', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between border-r border-slate-800">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-[11px] space-y-1">
        <div className="font-bold text-slate-200">Mode Akses</div>
        <div className="text-slate-400 text-[10px]">
          {userRole === 'admin' ? '⚡ Full Access (Waka)' : '👁️ Read-Only (Guru)'}
        </div>
      </div>
    </aside>
  );
};
