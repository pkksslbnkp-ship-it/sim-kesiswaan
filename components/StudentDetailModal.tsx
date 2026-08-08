import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { X, User } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (student: Partial<Student>) => void;
  student?: Student | null;
  mode: 'add' | 'edit' | 'view';
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    nisn: '',
    nis: '',
    class: 'X IPA 1',
    major: 'IPA',
    gender: 'L',
    status: 'Aktif',
    violationPoints: 0,
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    birthPlace: '',
    birthDate: '',
    photo: '',
    notes: '',
  });

  useEffect(() => {
    if (student && (mode === 'edit' || mode === 'view')) {
      setFormData(student);
    } else {
      setFormData({
        name: '',
        nisn: '',
        nis: '',
        class: 'X IPA 1',
        major: 'IPA',
        gender: 'L',
        status: 'Aktif',
        violationPoints: 0,
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        birthPlace: '',
        birthDate: '',
        photo: '',
        notes: '',
      });
    }
  }, [student, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {mode === 'add' && 'Tambah Data Siswa'}
                {mode === 'edit' && 'Edit Data Siswa'}
                {mode === 'view' && 'Detail Data Siswa'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'view' ? 'Informasi profil dan rekam data siswa' : 'Isi formulir berikut dengan data yang valid'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Photo & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center overflow-hidden mb-2 relative group">
                {formData.photo ? (
                  <img src={formData.photo} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-slate-400">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              {!isReadOnly && (
                <input
                  type="text"
                  placeholder="URL Foto Siswa..."
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap siswa"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="10 digit NISN"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.nis || ''}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Nomor Induk Sekolah"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Class, Major, Gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={formData.class || ''}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="Contoh: X IPA 1"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jurusan *</label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={formData.major || ''}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="Contoh: IPA / IPS"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                disabled={isReadOnly}
                value={formData.gender || 'L'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          {/* Status & Violation Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Siswa</label>
              <select
                disabled={isReadOnly}
                value={formData.status || 'Aktif'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              >
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus</option>
                <option value="Pindah">Pindah</option>
                <option value="Drop Out">Drop Out</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Poin Pelanggaran</label>
              <input
                type="number"
                disabled={isReadOnly}
                value={formData.violationPoints || 0}
                onChange={(e) => setFormData({ ...formData, violationPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Siswa</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.parentName || ''}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Nama Orang Tua"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat domisili siswa..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {isReadOnly ? 'Tutup' : 'Batal'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
              >
                {mode === 'add' ? 'Simpan Siswa' : 'Perbarui Siswa'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
