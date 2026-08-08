import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bgIcon: 'bg-rose-100 text-rose-600 border-rose-200',
      btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      icon: Trash2,
    },
    warning: {
      bgIcon: 'bg-amber-100 text-amber-600 border-amber-200',
      btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      icon: AlertTriangle,
    },
    info: {
      bgIcon: 'bg-blue-100 text-blue-600 border-blue-200',
      btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      icon: CheckCircle2,
    },
  };

  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 transform transition-all scale-100">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${currentVariant.bgIcon}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Konfirmasi Tindakan</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition ${currentVariant.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
