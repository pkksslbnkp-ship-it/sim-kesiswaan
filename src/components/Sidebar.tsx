import React from 'react';

export type TabType = 
  | 'dashboard'
  | 'students'
  | 'mutasi' // 👈 Tab Mutasi Siswa
  | 'excel-upload'
  | 'achievements'
  | 'alumni'
  | 'users'
  | 'technical-doc';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: 'ADMIN' | 'GURU' | string;
  schoolLogo: string | null;
  counts: {
    students: number;
    achievements: number;
    alumni: number;
    mutasi: number; // 👈 Hitungan/badge data mutasi
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
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'students' as TabType, label: 'Data Siswa', icon: '👨‍🎓', count: counts.students },
    { id: 'mutasi' as TabType, label: 'Siswa Mutasi', icon: '🚚', count: counts.mutasi }, // 👈 Menu Baru Mutasi
    { id: 'excel-upload' as TabType, label: 'Impor Excel', icon: '📥' },
    { id: 'achievements' as TabType, label: 'Prestasi Siswa', icon: '🏆', count: counts.achievements },
    { id: 'alumni' as TabType, label: 'Data Alumni', icon: '🎓', count: counts.alumni },
    ...(userRole === 'ADMIN' 
      ? [{ id: 'users' as TabType, label: 'Manajemen Pengguna', icon: '👤', count: counts.users }] 
      : []),
    { id: 'technical-doc' as TabType, label: 'Rekomendasi Tech & ERD', icon: '📄', badge: 'DOCS' },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-lg border border-slate-800">
      <div className="space-y-6">
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-800/80 pb-4">
          {schoolLogo ? (
            <img src={schoolLogo} alt="Logo Sekolah" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-500/30">
              SIM
            </div>
          )}
          <div>
            <h2 className="font-bold text-base text-white tracking-wide">SIM-KESISWAAN</h2>
            <p className="text-[11px] text-slate-400 font-medium">Sistem Informasi Kesiswaan</p>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Kotak Informasi Status Akses */}
      <div className="mt-8 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
        <div className="font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <span>🔑</span> Status Akses: 
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            userRole === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {userRole === 'ADMIN' ? 'Admin (Waka)' : 'Guru'}
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          {userRole === 'ADMIN'
            ? 'Hak akses penuh CRUD data siswa, alumni, mutasi, prestasi, user & import Excel.'
            : 'Akses membaca, input data kesiswaan, serta cetak laporan.'}
        </p>
      </div>
    </aside>
  );
};