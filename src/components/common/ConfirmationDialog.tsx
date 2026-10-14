import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1c1b18] hover:bg-[#2e2c27]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
