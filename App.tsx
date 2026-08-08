import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { UserManagement, UserAccount } from './components/UserManagement';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Award,
  FileText,
  UserCheck,
  X,
  Database,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';

export function App() {
  // State User & Status Login
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('sim_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('sim_active_user');
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'admin';
  });

  // State Tab Navigasi
  const [activeTab, setActiveTab] = useState<string>('pengguna');

  // State Modals
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showTechDocModal, setShowTechDocModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Efek Sinkronisasi Role saat User Aktif Berubah
  useEffect(() => {
    if (currentUser) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  // Handler Login Berhasil
  const handleLogin = (role: UserRole, userAccount?: UserAccount) => {
    if (userAccount) {
      setCurrentUser(userAccount);
      setActiveRole(userAccount.role);
      localStorage.setItem('sim_active_user', JSON.stringify(userAccount));
    } else {
      const defaultUser: UserAccount = {
        id: '1',
        name: 'Administrator Utama',
        username: 'admin',
        email: 'admin@sekolah.sch.id',
        role: role,
        status: 'Aktif',
      };
      setCurrentUser(defaultUser);
      setActiveRole(role);
      localStorage.setItem('sim_active_user', JSON.stringify(defaultUser));
    }
    setIsLoggedIn(true);
  };

  // Handler Logout
  const handleLogout = () => {
    localStorage.removeItem('sim_active_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Handler Ganti Role (Simulasi Hak Akses)
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      localStorage.setItem('sim_active_user', JSON.stringify(updatedUser));
    }
  };

  // Jika belum login, tampilkan Halaman Login
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Header Utama */}
      <Header
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onOpenTechnicalDoc={() => setShowTechDocModal(true)}
        onOpenLogoModal={() => setShowLogoModal(true)}
        onLogout={handleLogout}
        currentUser={currentUser || undefined}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigasi Utama */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-20">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 mb-2">
              Menu Utama
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('siswa')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'siswa'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Siswa</span>
              </button>

              <button
                onClick={() => setActiveTab('pelanggaran')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'pelanggaran'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Pelanggaran & Poin</span>
              </button>

              <button
                onClick={() => setActiveTab('prestasi')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'prestasi'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Data Prestasi</span>
              </button>

              <button
                onClick={() => setActiveTab('laporan')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'laporan'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Laporan & SP</span>
              </button>

              <button
                onClick={() => setActiveTab('pengguna')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'pengguna'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Manajemen Pengguna</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Area Konten Utama */}
        <main className="flex-1 min-w-0">
          {activeTab === 'pengguna' && <UserManagement />}

          {activeTab === 'dashboard' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900">Dashboard Kesiswaan</h2>
              <p className="text-xs text-slate-500">
                Selamat datang kembali, <strong className="text-blue-600">{currentUser?.name}</strong>! Anda login sebagai <strong>{activeRole.toUpperCase()}</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="text-2xl font-black text-blue-700">1,248</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Total Siswa Aktif</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="text-2xl font-black text-amber-700">14</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Pelanggaran Bulan Ini</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-2xl font-black text-emerald-700">28</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">Prestasi Terdaftar</div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'pengguna' && activeTab !== 'dashboard' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-slate-400 font-bold text-sm mb-1">
                Modul {activeTab.toUpperCase()}
              </div>
              <p className="text-xs text-slate-500">
                Halaman ini aktif dan terhubung dengan hak akses <strong>{activeRole}</strong>.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Logo */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Logo Sekolah</h3>
                <p className="text-xs text-slate-500">Pengaturan Identitas & Logo</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Logo resmi sekolah telah terpasang dan akan ditampilkan pada Kop Surat Laporan & Surat Peringatan (SP).
            </p>
            <button
              onClick={() => setShowLogoModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Supabase */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Koneksi Supabase DB</h3>
                <p className="text-xs text-slate-500">Status Integrasi Database</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Database Supabase aktif. Data pengguna, pelanggaran, dan prestasi disinkronkan secara aman.
            </p>
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal Tech Doc */}
      {showTechDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTechDocModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Dokumentasi Teknis</h3>
                <p className="text-xs text-slate-500">Arsitektur & Skema ERD</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Aplikasi dibangun menggunakan React, TypeScript, Tailwind CSS, dan Lucide Icons.
            </p>
            <button
              onClick={() => setShowTechDocModal(false)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
