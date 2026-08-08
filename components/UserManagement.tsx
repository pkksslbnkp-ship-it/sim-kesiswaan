import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Edit3,
  Trash2,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Key,
  AtSign,
} from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  lastLogin?: string;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: '1',
    name: 'Administrator Utama',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    password: 'admin123password',
    role: 'admin',
    status: 'Aktif',
    lastLogin: '2026-08-08 12:30',
  },
  {
    id: '2',
    name: 'Tim Kesiswaan',
    username: 'kesiswaan',
    email: 'kesiswaan@sekolah.sch.id',
    password: 'kesiswaan123password',
    role: 'kesiswaan',
    status: 'Aktif',
    lastLogin: '2026-08-07 09:15',
  },
  {
    id: '3',
    name: 'Wali Kelas X IPA 1',
    username: 'walikelas10',
    email: 'walikelas@sekolah.sch.id',
    password: 'walikelas123password',
    role: 'walikelas',
    status: 'Aktif',
    lastLogin: '2026-08-06 14:20',
  },
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sim_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'walikelas' as UserRole,
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Simpan setiap kali ada perubahan users
  useEffect(() => {
    localStorage.setItem('sim_users', JSON.stringify(users));
  }, [users]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'walikelas',
      status: 'Aktif',
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username || '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updated = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            password: formData.password ? formData.password : u.password,
          };
        }
        return u;
      });
      setUsers(updated);
    } else {
      const newUser: UserAccount = {
        id: Date.now().toString(),
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password || '123456',
        role: formData.role,
        status: formData.status,
        lastLogin: 'Belum pernah',
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Kelola akun, username, password, dan hak akses Admin, Kesiswaan, serta Wali Kelas.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari Berdasarkan Nama, Username, Email, atau Peran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Pengguna</th>
                <th className="px-4 py-3.5">Username & Email</th>
                <th className="px-4 py-3.5">Peran / Hak Akses</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Login Terakhir</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="font-bold text-blue-600 flex items-center space-x-1">
                          <AtSign className="w-3 h-3" />
                          <span>{user.username}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-medium text-[11px]">
                      {user.lastLogin}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Pengguna & Password"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Atur kredensial login (Username & Password) serta hak akses pengguna
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Drs. Ahmad Dahlan"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })
                    }
                    placeholder="Contoh: ahmad_walikelas"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ahmad@sekolah.sch.id"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password {editingUser ? '(Opsional)' : '*'}</span>
                  </span>
                  {editingUser && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      Kosongkan jika tidak ubah password
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      editingUser ? '•••••••• (Tetap password lama)' : 'Masukkan password baru'
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hak Akses (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="kesiswaan">Kesiswaan</option>
                    <option value="walikelas">Wali Kelas</option>
                    <option value="pembina">Pembina</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
