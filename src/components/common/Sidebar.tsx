import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSociety } from '../../context/SocietyContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { notifications } = useSociety();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/members', label: 'Members', icon: '👥' },
    { to: '/admin/contributions', label: 'Contributions', icon: '💳' },
    { to: '/admin/welfare', label: 'Welfare Assistance', icon: '🤝' },
    { to: '/admin/fund', label: 'Fund Management', icon: '💰' },
    { to: '/admin/bank', label: 'Bank', icon: '🏦' },
    { to: '/admin/cash', label: 'Cash Book', icon: '📖' },
    { to: '/admin/transactions', label: 'Transactions', icon: '📑' },
    { to: '/admin/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    { to: '/admin/reports', label: 'Reports', icon: '📈' },
    { to: '/admin/relationships', label: 'Eligible Relatives', icon: '👨‍👩‍👧' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: '🔍' },
  ];

  const memberLinks = [
    { to: '/member/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/member/profile', label: 'My Profile', icon: '👤' },
    { to: '/member/contributions', label: 'My Contributions', icon: '💳' },
    { to: '/member/fund', label: 'Society Fund', icon: '💰' },
    { to: '/member/transactions', label: 'Transactions', icon: '📑' },
    { to: '/member/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : memberLinks;

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-500/20">
          🏛️
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight leading-none">Society Welfare</h2>
          <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">Management System</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </div>
            {link.badge !== undefined && link.badge > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-slate-950">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Role: <span className="text-emerald-400">{user?.role}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
