import React, { useState } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, X, Check, GraduationCap } from 'lucide-react';

interface SchoolLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logoDataUrl: string | null) => void;
}

export const SchoolLogoModal: React.FC<SchoolLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
}) => {
  const [previewLogo, setPreviewLogo] = useState<string | null>(currentLogo);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (PNG, JPG, SVG, WebP)!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file gambar maksimal 2 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    setPreviewLogo(null);
    setErrorMsg('');
  };

  const handleSave = () => {
    onSaveLogo(previewLogo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Upload Logo Sekolah</h3>
              <p className="text-xs text-slate-500 font-medium">Ubah logo resmi untuk header & cetak dokumen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Logo Preview Container */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 relative">
            {previewLogo ? (
              <div className="space-y-2 text-center">
                <img
                  src={previewLogo}
                  alt="Logo Sekolah"
                  className="w-28 h-28 object-contain rounded-2xl p-2 bg-white shadow-lg border-2 border-blue-500 mx-auto"
                />
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  ✓ Logo Kustom Terpasang
                </span>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mx-auto">
                  <GraduationCap className="w-12 h-12" />
                </div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                  Logo Default Sistem
                </span>
              </div>
            )}
            <p className="text-xs font-bold text-slate-600 mt-3 text-center">
              Logo ini akan otomatis ditampilkan di Header Aplikasi, Sidebar, Dashboard, dan KOP Surat / Dokumen Cetak Siswa.
            </p>
          </div>

          {/* Upload Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Pilih File Logo Baru (PNG / JPG / SVG)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Logo</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
