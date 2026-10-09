import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { X, User, Save, Upload, CheckCircle2, Loader2, Trash2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseConfig';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (studentData: Partial<Student>) => void;
  onSubmit?: (studentData: Partial<Student>) => Promise<void> | void;
  initialData?: Student | null;
}

const defaultFormData: Partial<Student> = {
  nisn: '',
  nis: '',
  name: '',
  gender: 'L',
  religion: 'Islam',
  specialNeeds: 'Tidak Ada',
  class: '',
  major: '',
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
  kkUrl: '',
  akteUrl: '',
};

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>(defaultFormData);
  const [uploadingKk, setUploadingKk] = useState(false);
  const [uploadingAkte, setUploadingAkte] = useState(false);
  const [deletingKk, setDeletingKk] = useState(false);
  const [deletingAkte, setDeletingAkte] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'akte') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Ukuran berkas terlalu besar! Maksimal 500 KB.');
      e.target.value = '';
      return;
    }

    const setUploading = type === 'kk' ? setUploadingKk : setUploadingAkte;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${formData.nisn || Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen-siswa')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dokumen-siswa')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        [type === 'kk' ? 'kkUrl' : 'akteUrl']: publicUrlData.publicUrl,
      }));
    } catch (error: any) {
      alert(`Gagal mengunggah berkas ${type.toUpperCase()}: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFileDelete = async (type: 'kk' | 'akte') => {
    const urlKey = type === 'kk' ? 'kkUrl' : 'akteUrl';
    const fileUrl = formData[urlKey];
    if (!fileUrl) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus berkas ${type.toUpperCase()}?`)) return;

    const setDeleting = type === 'kk' ? setDeletingKk : setDeletingAkte;
    setDeleting(true);

    try {
      const urlPath = fileUrl.split('/dokumen-siswa/')[1];
      if (urlPath) {
        const decodedPath = decodeURIComponent(urlPath);
        await supabase.storage.from('dokumen-siswa').remove([decodedPath]);
      }
      setFormData((prev) => ({ ...prev, [urlKey]: '' }));
    } catch (error: any) {
      alert(`Gagal menghapus berkas: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn || !formData.class) {
      alert('Nama, NISN, dan Kelas wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(formData);
      } else if (typeof onSave === 'function') {
        onSave(formData);
      }
      onClose();
    } catch (error: any) {
      alert(`Gagal menyimpan data: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSubmitting(false);
    }
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
            type="button"
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* NISN */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">NISN *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 0139171950"
                value={formData.nisn || ''}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* NIS */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">NIS Sekolah *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 2324286"
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
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
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
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
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
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus / Alumni</option>
                <option value="Mutasi">Mutasi / Pindah</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tempat Lahir</label>
              <input
                type="text"
                placeholder="Contoh: Kulon Progo"
                value={formData.birthPlace || ''}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Kelas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 8C"
                value={formData.class || ''}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Angkatan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Angkatan</label>
              <input
                type="text"
                placeholder="Contoh: 2025/2026"
                value={formData.generation || ''}
                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tahun Masuk */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Tahun Masuk</label>
              <input
                type="number"
                value={formData.entryYear || 2025}
                onChange={(e) => setFormData({ ...formData, entryYear: parseInt(e.target.value) || 2025 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kontak & Orang Tua */}
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">Alamat Tempat Tinggal</label>
              <textarea
                rows={2}
                placeholder="Alamat lengkap RT/RW, Pedukuhan, Kelurahan, Kecamatan"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Upload File KK & Akte Kelahiran Modern */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider">
                Dokumen Berkas Siswa
              </h4>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Maksimal 500 KB per berkas (PDF / Gambar)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Box KK */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Kartu Keluarga (KK)</span>
                  {formData.kkUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Terunggah
                    </span>
                  )}
                </div>

                {formData.kkUrl ? (
                  <div className="flex items-center justify-between bg-white p-2.5 border border-slate-200 rounded-xl">
                    <a
                      href={formData.kkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline truncate mr-2"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">Lihat Berkas KK</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleFileDelete('kk')}
                      disabled={deletingKk}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus berkas"
                    >
                      {deletingKk ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition">
                    {uploadingKk ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700">Pilih Berkas KK</span>
                        <span className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 500KB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      disabled={uploadingKk}
                      onChange={(e) => handleFileUpload(e, 'kk')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Box Akta */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Akta Kelahiran</span>
                  {formData.akteUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Terunggah
                    </span>
                  )}
                </div>

                {formData.akteUrl ? (
                  <div className="flex items-center justify-between bg-white p-2.5 border border-slate-200 rounded-xl">
                    <a
                      href={formData.akteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline truncate mr-2"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">Lihat Berkas Akta</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleFileDelete('akte')}
                      disabled={deletingAkte}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus berkas"
                    >
                      {deletingAkte ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition">
                    {uploadingAkte ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-700">Pilih Berkas Akta</span>
                        <span className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 500KB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      disabled={uploadingAkte}
                      onChange={(e) => handleFileUpload(e, 'akte')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* Catatan Kesiswaan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Catatan Khusus Kesiswaan / OSIS</label>
            <input
              type="text"
              placeholder="Contoh: Jalur Beasiswa, Prestasi Olahraga, OSIS"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingKk || uploadingAkte || deletingKk || deletingAkte}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 transition flex items-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>SIMPAN DATA</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};