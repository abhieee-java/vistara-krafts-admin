import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm transition-all transform animate-in slide-in-from-bottom-2 ${
            t.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : t.type === 'info'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-[#1c1b18] text-[#f9f8f5] border-[#cda851]/40'
          }`}
        >
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#cda851] shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs font-medium leading-relaxed">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:opacity-75 transition-opacity"
            aria-label="Close toast"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
};
