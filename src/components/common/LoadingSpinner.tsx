import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
};
