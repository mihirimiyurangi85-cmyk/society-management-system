import React from 'react';
import { Sidebar } from './Sidebar';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <Sidebar onCloseMobile={onClose} />
      </div>
    </div>
  );
};
