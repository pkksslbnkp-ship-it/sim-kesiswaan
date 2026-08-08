import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage, UserAccount } from './components/LoginPage';
import { UserManagement } from './components/UserManagement';
import { Dashboard } from './components/Dashboard';
import { X, Upload, Info, Database } from 'lucide-react';

// Data Utama Sistem (Sesuai Tabel Kamu)
const DEFAULT_USERS: UserAccount[] = [
  {
    id: '1',
    name: 'Administrator Utama',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    role: 'Admin (Waka Kesiswaan)',
    status: 'Aktif',
    password: 'admin123',
    lastLogin: '2026-08-08 12:30',
  },
  {
    id: '2',
    name: 'Tim Kesiswaan',
    username: 'kesiswaan',
    email: 'kesiswaan@sekolah.sch.id',
    role: 'Guru (User)',
    status: 'Aktif',
    password: 'guru123',
    lastLogin: '2026-08-07 09:15',
  },
  {
    id: '3',
    name: 'Wali Kelas X IPA 1',
    username: 'walikelas10',
    email: 'walikelas@sekolah.sch.id',
    role: 'Guru (User)',
    status: 'Aktif',
    password: 'guru123',
    lastLogin: '2026-08-06 14:20',
  },
];

export function App() {
  // Ambil dari LocalStorage atau pakai DEFAULT_USERS
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sim_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('sim_active_user');
    return saved ? JSON.parse(saved) : users[0] || DEFAULT_USERS[0];
  });

  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => {
    return localStorage.getItem('sim_school_logo') || null;
  });

  const [activeTab, setActiveTab] = useState<string>('usermanagement');
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Otomatis Simpan ke LocalStorage Setiap Ada Tambah/Edit/Hapus
  useEffect(() => {
    localStorage.setItem('sim_users', JSON.stringify(users));
  }, [users]);

  // Fungsi Tambah/Edit Pengguna Terpusat
  const handleSaveUser = (userToSave: UserAccount) => {
    setUsers((prevUsers) => {
      const index = prevUsers.findIndex((u) => u.id === userToSave.id);
      let updated: UserAccount[];
      if (index >= 0) {
        updated = [...prevUsers];
        updated[index] = userToSave;
      } else {
        updated = [...prevUsers, userToSave];
      }
      localStorage.setItem('sim_users', JSON.stringify(updated));
      return updated;
    });
  };

  // Fungsi Hapus Pengguna
  const handleDeleteUser = (id: string) => {
    setUsers((prevUsers) => {
      const updated = prevUsers.filter((u) => u.id !== id);
      localStorage.setItem('sim_users', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = (role: any, userAccount?: UserAccount) => {
    if (userAccount) {
      setCurrentUser(userAccount);
      localStorage.setItem('sim_active_user', JSON.stringify(userAccount));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sim_active_user');
  };

  const handleSwitchUser = (selectedUser: UserAccount) => {
    setCurrentUser(selectedUser);
    localStorage.setItem('sim_active_user', JSON.stringify(selectedUser));
  };

  const handleResetData = () => {
    if (window.confirm('Reset daftar pengguna kembali ke data awal?')) {
      localStorage.removeItem('sim_users');
      setUsers(DEFAULT_USERS);
      setCurrentUser(DEFAULT_USERS[0]);
      localStorage.setItem('sim_users', JSON.stringify(DEFAULT_USERS));
      localStorage.setItem('sim_active_user', JSON.stringify(DEFAULT_USERS[0]));
      alert('Data pengguna berhasil disinkronkan!');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
        localStorage.setItem('sim_school_logo', reader.result as string);
        setShowLogoModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return <LoginPage users={users} onLogin={handleLogin} schoolLogo={schoolLogo} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <Header
        currentUser={currentUser}
        allUsers={users}
        schoolLogo={schoolLogo}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenDoc={() => setShowDocModal(true)}
        onLogout={handleLogout}
        onOpenSchoolLogoModal={() => setShowLogoModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'usermanagement' && (
            <UserManagement
              users={users}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab !== 'dashboard' && activeTab !== 'usermanagement' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Menu {activeTab}
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-bold">
                Modul siap dihubungkan dengan data kesiswaan sekolah Anda.
              </p>
            </div>
          )}
        </main>
      </div>

      {showLogoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Unggah Logo Sekolah</h3>
            <p className="text-xs text-slate-500 font-medium mb-5">Pilih file gambar logo sekolah Anda.</p>

            {schoolLogo && (
              <img
                src={schoolLogo}
                alt="Preview"
                className="w-20 h-20 object-contain mx-auto mb-4 border border-slate-200 rounded-2xl p-2"
              />
            )}

            <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-blue-600/25">
              <Upload className="w-4 h-4" />
              <span>Pilih File Gambar</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowDocModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900">Dokumentasi Sistem</h3>
            </div>
            <div className="text-xs space-y-3 text-slate-600 font-medium leading-relaxed">
              <p>SIM-KESISWAAN v2.5 - Akses Pengguna & Manajemen Siswa Terintegrasi.</p>
            </div>
          </div>
        </div>
      )}

      {showSupabaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center">
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <Database className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900">Integrasi Database Cloud</h3>
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="mt-4 w-full py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20"
            >
              Tutup Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;