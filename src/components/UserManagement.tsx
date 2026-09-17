import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { UserPlus, Edit2, Trash2, Shield, CheckCircle, XCircle, X, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { fetchUsersFromSupabase, syncUserToSupabase, deleteUserFromSupabase } from '../lib/supabase';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onEditUser: (user: User) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users = [],
  currentUser,
  onAddUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag pengunci double submit

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'GURU'>('GURU');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Ambil data terbaru langsung dari Supabase saat halaman dimuat
  const loadSupabaseUsers = async () => {
    setLoading(true);
    const dbUsers = await fetchUsersFromSupabase();
    if (dbUsers && dbUsers.length > 0) {
      setLocalUsers(dbUsers);
    } else {
      setLocalUsers(users);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSupabaseUsers();
  }, []);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name || '');
    setUsername(user.username || '');
    setPassword('');
    setShowPassword(false);
    setRole(user.role || 'GURU');
    setStatus(user.status || 'aktif');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('password');
    setShowPassword(false);
    setRole('GURU');
    setStatus('aktif');
    setIsModalOpen(true);
  };

  // Fungsi Simpan ke Supabase (Terproteksi dari Double Submit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah reload halaman & double trigger
    if (isSubmitting) return; // Kunci jika sedang proses simpan

    if (!name.trim()) {
      alert('Nama Lengkap wajib diisi!');
      return;
    }
    if (!username.trim()) {
      alert('Username wajib diisi!');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        const updatedUser: User = {
          ...editingUser,
          name: name.trim(),
          username: username.trim(),
          role,
          status,
          password: password.trim() ? password.trim() : editingUser.password,
        };

        const success = await syncUserToSupabase(updatedUser);
        if (success && typeof onEditUser === 'function') {
          onEditUser(updatedUser);
        }
      } else {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          username: username.trim(),
          email: `${username.trim()}@sekolah.sch.id`,
          password: password.trim() || 'password',
          role,
          status,
          createdAt: new Date().toISOString(),
        };

        const success = await syncUserToSupabase(newUser);
        if (success && typeof onAddUser === 'function') {
          onAddUser({
            name: newUser.name,
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            status: newUser.status,
          });
        }
      }

      await loadSupabaseUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saat menyimpan user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const updatedUser: User = {
      ...user,
      status: user.status === 'aktif' ? 'nonaktif' : 'aktif',
    };
    await syncUserToSupabase(updatedUser);
    if (typeof onToggleUserStatus === 'function') {
      onToggleUserStatus(user.id);
    }
    await loadSupabaseUsers();
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      await deleteUserFromSupabase(userId);
      if (typeof onDeleteUser === 'function') {
        onDeleteUser(userId);
      }
      await loadSupabaseUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun akses sistem tersambung Supabase: nama, username, role, dan status akun.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadSupabaseUsers}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Muat Ulang Data Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Tabel Users */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Nama Lengkap & Gelar</th>
                <th className="p-4">Username / Email</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {localUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-500 font-mono">{u.username}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span>{u.role === 'ADMIN' ? 'Admin' : 'Guru / Staff'}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                        u.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.status === 'aktif' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Data Pengguna"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit / Tambah Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, M.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: nurul"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                    title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'GURU')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="ADMIN">Admin (Akses Penuh)</option>
                  <option value="GURU">User (Guru - Akses Lihat Data)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pengguna
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="aktif">Aktif (Dapat Login & Akses)</option>
                  <option value="nonaktif">Nonaktif (Akses Diblokir)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan ke Supabase</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;