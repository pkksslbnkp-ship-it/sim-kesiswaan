import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react';

interface SchoolLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (newLogo: string | null) => void;
}

export const SchoolLogoModal: React.FC<SchoolLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
}) => {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentLogo);
  }, [currentLogo, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran berkas logo maksimal 2 MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveLogo(preview);
    onClose();
  };

  const handleRemove = () => {
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 font-sans">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Pengaturan Logo Sekolah</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="py-6 space-y-4">
          
          {/* Box Preview Logo */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            {preview ? (
              <div className="relative group">
                <img 
                  src={preview} 
                  alt="Preview Logo" 
                  className="w-32 h-32 object-contain rounded-xl bg-white p-2 shadow-xs border border-slate-200" 
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-md transition"
                  title="Hapus Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-600">Belum ada logo terpasang</p>
                <p className="text-[10px] text-slate-400">Format PNG, JPG, atau WEBP (Maks 2MB)</p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{preview ? 'Ganti Berkas Logo' : 'Pilih Berkas Logo'}</span>
          </button>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Simpan Logo</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SchoolLogoModal;