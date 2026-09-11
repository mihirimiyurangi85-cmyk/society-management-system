import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSociety } from '../../context/SocietyContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { notifications, balances } = useSociety();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const notifRoute = user?.role === 'ADMIN' ? '/admin/notifications' : '/member/notifications';

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Open Mobile Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-white tracking-tight">Society Welfare & Fund System</h1>
          <p className="text-[11px] text-slate-400">Monthly Contribution: LKR 200/month</p>
        </div>
      </div>

      {/* Available Fund Pill & Notifications */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span>💰 Fund Balance:</span>
          <span className="font-bold text-white">LKR {balances.totalAvailableFund.toLocaleString()}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate(notifRoute)}
          className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Notifications"
        >
          <span className="text-lg">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center text-xs">
            {user?.full_name.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
