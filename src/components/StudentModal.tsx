import React, { useState, useEffect } from 'react';
import { Student, StudentStatus, Gender, Religion, SpecialNeeds } from '../types';
import { X, Save, User, ShieldCheck } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  initialData?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    nisn: '',
    nis: '',
    name: '',
    gender: 'L',
    religion: 'Islam',
    specialNeeds: 'Tidak Ada',
    class: '10 MIPA 1',
    major: 'MIPA',
    generation: '2025/2026',
    entryYear: 2025,
    status: 'Aktif',
    birthPlace: '',
    birthDate: '',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nisn: '',
        nis: '',
        name: '',
        gender: 'L',
        religion: 'Islam',
        specialNeeds: 'Tidak Ada',
        class: '10 MIPA 1',
        major: 'MIPA',
        generation: '2025/2026',
        entryYear: 2025,
        status: 'Aktif',
        birthPlace: '',
        birthDate: '',
        address: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn || !formData.class) {
      alert('Nama, NISN, dan Kelas wajib diisi!');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-900 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">
              {initialData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* NISN */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">NISN *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 0061234567"
                value={formData.nisn || ''}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* NIS */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">NIS Sekolah</label>
              <input
                type="text"
                placeholder="Contoh: 23241001"
                value={formData.nis || ''}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Nama Lengkap Siswa *</label>
              <input
                type="text"
                required
                placeholder="Nama sesuai ijazah / KK"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Jenis Kelamin</label>
              <select
                value={formData.gender || 'L'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Agama */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Agama</label>
              <select
                value={formData.religion || 'Islam'}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value as Religion })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Khonghucu">Khonghucu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Kebutuhan Khusus / Inklusi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Kebutuhan Khusus / Inklusi</label>
              <select
                value={formData.specialNeeds || 'Tidak Ada'}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value as SpecialNeeds })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tidak Ada">Tidak Ada (Non-Disabilitas)</option>
                <option value="Tunanetra (A)">Tunanetra (A)</option>
                <option value="Tunarungu (B)">Tunarungu (B)</option>
                <option value="Tunagrahita (C)">Tunagrahita (C)</option>
                <option value="Tunadaksa (D)">Tunadaksa (D)</option>
                <option value="Tunalaras (E)">Tunalaras (E)</option>
                <option value="Autis">Autis</option>
                <option value="ADHD">ADHD</option>
                <option value="Kesulitan Belajar">Kesulitan Belajar</option>
                <option value="Cerdas Istimewa">Cerdas Istimewa (Gifted)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Status Keaktifan</label>
              <select
                value={formData.status || 'Aktif'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus / Alumni</option>
                <option value="Mutasi">Mutasi / Keluar</option>
                <option value="DO">Drop Out (DO)</option>
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Kelas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 10 MIPA 1, 11 RPL 2"
                value={formData.class || ''}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jurusan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Jurusan / Peminatan</label>
              <input
                type="text"
                placeholder="Contoh: MIPA, IPS, RPL, TKJ"
                value={formData.major || ''}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Angkatan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Angkatan</label>
              <input
                type="text"
                placeholder="Contoh: 2024/2025"
                value={formData.generation || ''}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tahun Masuk */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Masuk</label>
              <input
                type="number"
                value={formData.entryYear || 2025}
                onChange={(e) => setFormData({ ...formData, entryYear: parseInt(e.target.value) || 2025 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* No HP Siswa */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">No. HP / WA Siswa</label>
              <input
                type="text"
                placeholder="08123456789"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nama Orang Tua */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Nama Orang Tua / Wali</label>
              <input
                type="text"
                placeholder="Nama Ayah/Ibu/Wali"
                value={formData.parentName || ''}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Alamat */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Alamat Tempat Tinggal</label>
              <textarea
                rows={2}
                placeholder="Alamat lengkap RT/RW, Kelurahan, Kecamatan"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Catatan Kesiswaan */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Catatan Khusus Kesiswaan / OSIS</label>
              <input
                type="text"
                placeholder="Contoh: Ketua OSIS, Jalur Beasiswa, Tahfidz"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
