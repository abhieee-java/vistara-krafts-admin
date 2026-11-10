import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl';
  headerActions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  headerActions
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl'
  }[maxWidth];

  const modalElement = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-md modal-backdrop-enter"
      style={{ isolation: 'isolate' }}
    >
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${widthClass} bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-[#e6e2d8] flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden modal-card-enter z-10`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#e6e2d8] flex items-center justify-between gap-3 bg-[#faf8f5]/95 backdrop-blur-xs shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1c1b18] truncate leading-tight">{title}</h3>
            {subtitle && <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};
