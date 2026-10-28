import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: 'pastel' | 'dark' | 'light';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  theme = 'pastel',
}) => {
  if (!isOpen) return null;

  const isPastel = theme === 'pastel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onCancel} />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl p-5 overflow-hidden transition-colors ${
          isPastel
            ? 'bg-[#ffffff] border-[#e9d5ff] text-[#2e1065]'
            : 'bg-[#1a1b21] border-[#292a2f] text-[#e3e1e9]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDangerous
                ? 'bg-[#ffdad6]/20 border border-[#ffb4ab]/50 text-[#e11d48]'
                : isPastel
                ? 'bg-[#f3e8ff] border border-[#d8b4fe] text-[#7c3aed]'
                : 'bg-[#10b981]/10 border border-[#10b981]/30 text-[#4edea3]'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className={`text-xs mt-1 leading-relaxed ${isPastel ? 'text-[#8b799f]' : 'text-[#86948a]'}`}>
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className={`p-1 rounded ${
              isPastel
                ? 'text-[#8b799f] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                : 'text-[#86948a] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex items-center justify-end gap-2.5 mt-5 pt-3 border-t ${
            isPastel ? 'border-[#e9d5ff]' : 'border-[#292a2f]'
          }`}
        >
          <button
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPastel
                ? 'text-[#6b21a8] hover:text-[#2e1065] hover:bg-[#f3e8ff]'
                : 'text-[#bbcabf] hover:text-[#e3e1e9] hover:bg-[#292a2f]'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs ${
              isDangerous
                ? 'bg-[#e11d48] text-white hover:bg-[#be123c]'
                : isPastel
                ? 'bg-[#a855f7] text-white hover:bg-[#9333ea]'
                : 'bg-[#10b981] text-[#003824] hover:bg-[#4edea3]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
