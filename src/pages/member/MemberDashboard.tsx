import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSociety } from '../../context/SocietyContext';
import { formatLKR } from '../../utils/currencyFormatter';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { useNavigate } from 'react-router-dom';

export const MemberDashboard: React.FC = () => {
  const { user, member } = useAuth();
  const { contributions, balances, notifications } = useSociety();
  const navigate = useNavigate();

  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const myContributions = contributions.filter((c) => c.member_id === (member?.id || user?.member_id));
  const isPaidThisMonth = myContributions.some((c) => c.month_year === currentMonthYear);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Welcome back, {member?.full_name || user?.full_name}!
              </h1>
              <Badge variant={member?.status === 'ACTIVE' ? 'success' : 'danger'}>
                {member?.status || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Member ID: <span className="text-emerald-400 font-bold">{member?.id || user?.member_id}</span> | Monthly Fee: <span className="text-white font-bold">LKR 200.00</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/member/contributions')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            My Contribution History →
          </button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Month Status"
          value={isPaidThisMonth ? 'PAID ✓' : 'PENDING'}
          subtitle={isPaidThisMonth ? 'August 2026 recorded' : 'Please complete LKR 200 contribution'}
          variant={isPaidThisMonth ? 'success' : 'warning'}
          icon={<span className="text-xl">{isPaidThisMonth ? '✅' : '⌛'}</span>}
        />

        <StatCard
          title="Monthly Fee"
          value="LKR 200.00"
          subtitle="Fixed Monthly Contribution"
          variant="primary"
          icon={<span className="text-xl">💳</span>}
        />

        <StatCard
          title="Society Available Fund"
          value={formatLKR(balances.totalAvailableFund)}
          subtitle="Public Society Fund Reserve"
          variant="purple"
          icon={<span className="text-xl">🏛️</span>}
        />

        <StatCard
          title="My Total Contributions"
          value={formatLKR(myContributions.reduce((sum, c) => sum + c.amount, 0))}
          subtitle={`${myContributions.length} total payments`}
          icon={<span className="text-xl">📊</span>}
        />
      </div>

      {/* Notifications & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Notifications</h3>
            <button
              onClick={() => navigate('/member/notifications')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">My Recent Payments</h3>
            <button
              onClick={() => navigate('/member/contributions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View History →
            </button>
          </div>
          <div className="space-y-3">
            {myContributions.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs">
                <div>
                  <p className="font-bold text-white">{c.month_year}</p>
                  <p className="text-slate-400 text-[11px]">Receipt: {c.receipt_number} • Method: {c.payment_method}</p>
                </div>
                <span className="font-bold text-emerald-400">{formatLKR(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
