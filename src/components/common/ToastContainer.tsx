import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
          error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
          warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
          info: 'bg-sky-950/90 border-sky-500/50 text-sky-200',
        };

        const icons = {
          success: '✓',
          error: '✕',
          warning: '⚠',
          info: 'ℹ',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-slide-in ${bgColors[toast.type]}`}
          >
            <span className="font-bold text-lg leading-none">{icons[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              {toast.message && <p className="text-xs opacity-90 mt-0.5 break-words">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
