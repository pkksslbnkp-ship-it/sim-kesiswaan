import React, { useState, useEffect } from 'react';
import { Achievement, Student } from '../types';
import { X, Save, Trophy, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseConfig';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievementData: Partial<Achievement>) => void;
  initialData?: Achievement | null;
  students: Student[]; // Untuk dropdown pilihan siswa
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  students = [],
}) => {
  const [formData, setFormData] = useState<Partial<Achievement>>({
    studentId: '',
    studentName: '',
    title: '',
    event: '',
    category: 'Akademik',
    level: 'Kabupaten/Kota',
    rank: 'Juara 1',
    year: new Date().getFullYear().toString(),
    certificateUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        studentId: '',
        studentName: '',
        title: '',
        event: '',
        category: 'Akademik',
        level: 'Kabupaten/Kota',
        rank: 'Juara 1',
        year: new Date().getFullYear().toString(),
        certificateUrl: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Pilih siswa dari dropdown
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedStudent = students.find((s) => s.id === selectedId || s.nisn === selectedId);
    setFormData((prev) => ({
      ...prev,
      studentId: selectedId,
      studentName: selectedStudent ? selectedStudent.name : '',
    }));
  };

  // Upload Sertifikat ke Bucket Supabase 'dokumen-siswa'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Ukuran berkas terlalu besar! Maksimal 500 KB.');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `sertifikat_${formData.studentId || Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen-siswa')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dokumen-siswa')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        certificateUrl: publicUrlData.publicUrl,
      }));
    } catch (error: any) {
      alert(`Gagal mengunggah sertifikat: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setUploading(false);
    }
  };

  // Hapus Sertifikat
  const handleFileDelete = async () => {
    if (!formData.certificateUrl) return;
    if (!confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) return;

    setDeleting(true);

    try {
      const urlPath = formData.certificateUrl.split('/dokumen-siswa/')[1];
      if (urlPath) {
        const decodedPath = decodeURIComponent(urlPath);
        await supabase.storage.from('dokumen-siswa').remove([decodedPath]);
      }

      setFormData((prev) => ({
        ...prev,
        certificateUrl: '',
      }));
    } catch (error: any) {
      alert(`Gagal menghapus berkas: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.title) {
      alert('Nama Siswa dan Judul Prestasi wajib diisi!');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl text-slate-900 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-900">
              {initialData ? 'Edit Data Prestasi' : 'Tambah Prestasi Siswa'}
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
            
            {/* Pilih Siswa */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Nama Siswa *</label>
              {students.length > 0 ? (
                <select
                  value={formData.studentId || ''}
                  onChange={handleStudentSelect}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id || s.nisn} value={s.id || s.nisn}>
                      {s.name} ({s.class})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa"
                  value={formData.studentName || ''}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              )}
            </div>

            {/* Judul Prestasi / Kejuaraan */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Judul / Kejuaraan Prestasi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Juara 1 Lomba LKS Web Technologies"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Nama Event / Penyelenggara */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Nama Event / Perlombaan</label>
              <input
                type="text"
                placeholder="Contoh: O2SN / FLSSN 2026"
                value={formData.event || ''}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Kategori</label>
              <select
                value={formData.category || 'Akademik'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Akademik">Akademik</option>
                <option value="Non-Akademik">Non-Akademik</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Seni & Budaya">Seni & Budaya</option>
                <option value="Keagamaan">Keagamaan</option>
              </select>
            </div>

            {/* Tingkat */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tingkat</label>
              <select
                value={formData.level || 'Kabupaten/Kota'}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Kecamatan">Kecamatan</option>
                <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                <option value="Provinsi">Provinsi</option>
                <option value="Nasional">Nasional</option>
                <option value="Internasional">Internasional</option>
              </select>
            </div>

            {/* Peringkat / Juara */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Peringkat / Juara</label>
              <select
                value={formData.rank || 'Juara 1'}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Juara 1">Juara 1</option>
                <option value="Juara 2">Juara 2</option>
                <option value="Juara 3">Juara 3</option>
                <option value="Harapan 1">Harapan 1</option>
                <option value="Harapan 2">Harapan 2</option>
                <option value="Harapan 3">Harapan 3</option>
                <option value="Peserta">Peserta / Finalis</option>
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Perolehan</label>
              <input
                type="text"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Upload Sertifikat */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Upload Sertifikat Penghargaan</span>
                {formData.certificateUrl && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading || deleting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 focus:outline-none"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center text-xs font-bold text-amber-600 space-x-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </div>
                )}
              </div>
              {formData.certificateUrl && (
                <div className="flex items-center space-x-3 mt-1.5">
                  <a
                    href={formData.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 underline font-bold"
                  >
                    Lihat Berkas Sertifikat
                  </a>
                  <button
                    type="button"
                    onClick={handleFileDelete}
                    disabled={deleting}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center space-x-0.5 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deleting ? 'Menghapus...' : 'Hapus'}</span>
                  </button>
                </div>
              )}
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
              disabled={uploading || deleting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-black uppercase tracking-wider shadow-md transition flex items-center space-x-2"
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