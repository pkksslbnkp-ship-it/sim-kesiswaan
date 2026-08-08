import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserCog, Shield, UserCheck, Plus, Check, X, Key, Mail, Lock, Trash2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nip: '',
    role: 'guru' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Nama dan Email Pengguna wajib diisi!');
      return;
    }

    onAddUser({
      name: formData.name,
      email: formData.email,
      nip: formData.nip,
      role: formData.role,
      status: 'aktif',
    });

    setIsModalOpen(false);
    setFormData({ name: '', email: '', nip: '', role: 'guru' });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Pengguna & Matriks Hak Akses (RBAC)</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pengelolaan akun Waka Kesiswaan (Admin) dan Guru (User) serta pembatasan kewenangan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-600/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Guru / Staff</span>
        </button>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <span>Matriks Kewenangan Role-Based Access Control (RBAC)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Fitur / Fitur Aplikasi</th>
                <th className="p-3.5 text-center text-amber-800 font-black">Admin (Waka Kesiswaan)</th>
                <th className="p-3.5 text-center text-emerald-800 font-black">User (Guru/Staff)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Melihat & Mencari Data Siswa, Alumni, Prestasi</td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Tambah, Edit, Hapus (CRUD) Data Siswa</td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Upload & Parsing Excel (.xlsx/.csv) Siswa</td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Meluluskan Siswa ke Data Alumni</td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-slate-900">Kelola Akun Pengguna & Hak Akses</td>
                <td className="p-3.5 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto stroke-[3]" /></td>
                <td className="p-3.5 text-center"><X className="w-5 h-5 text-rose-500 mx-auto stroke-[3]" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base font-black text-slate-900">Daftar Akun Terdaftar ({users.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nama & NIP</th>
                <th className="p-3.5">Username / Email</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">Role System</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">NIP: {u.nip || '-'}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{u.username || u.email.split('@')[0]}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>

                  <td className="p-3.5">
                    <code className="px-2 py-1 rounded bg-slate-100 font-mono text-[11px] font-bold text-blue-700 border border-slate-200">
                      {u.password || (u.role === 'admin' ? 'admin123' : 'guru123')}
                    </code>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      {u.role === 'admin' ? 'Admin (Waka Kesiswaan)' : 'User (Guru)'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      u.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    {u.id !== currentUser.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200 transition shadow-sm"
                          title={u.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        >
                          {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>

                        {onDeleteUser && (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition shadow-sm flex items-center space-x-1"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic">(Akun Anda)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-900 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <UserCog className="w-5 h-5 text-purple-600" />
                <span>Tambah Akun Pengguna</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Endang Sri, M.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  placeholder="Contoh: 198501012010012003"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Sekolah *</label>
                <input
                  type="email"
                  required
                  placeholder="nama.guru@sekolah.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Role & Hak Akses</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="guru">Guru (User - Read Only Data Siswa & Prestasi)</option>
                  <option value="admin">Waka Kesiswaan (Admin - Full CRUD & Import Excel)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-wider shadow-md"
                >
                  Buat Akun
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
