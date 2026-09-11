import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { StatCard } from '../../components/common/StatCard';
import { formatLKR } from '../../utils/currencyFormatter';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { members, contributions, welfareCases, balances } = useSociety();
  const navigate = useNavigate();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
  const inactiveMembers = totalMembers - activeMembers;

  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const thisMonthPaidCount = contributions.filter((c) => c.month_year === currentMonthYear).length;
  const pendingContributionsCount = Math.max(0, activeMembers - thisMonthPaidCount);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time society welfare fund metrics, membership status & financial overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/contributions')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-colors"
          >
            + Record Contribution
          </button>
          <button
            onClick={() => navigate('/admin/welfare')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
          >
            + New Welfare Case
          </button>
        </div>
      </div>

      {/* Main Financial & Membership Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Available Fund"
          value={formatLKR(balances.totalAvailableFund)}
          subtitle="Bank + Cash Ledger Balance"
          variant="success"
          icon={<span className="text-xl">💰</span>}
        />
        <StatCard
          title="Bank Balance"
          value={formatLKR(balances.bankBalance)}
          subtitle="Verified Bank Account Ledger"
          variant="primary"
          icon={<span className="text-xl">🏦</span>}
        />
        <StatCard
          title="Cash Book Balance"
          value={formatLKR(balances.cashBalance)}
          subtitle="Physical Cash Box Balance"
          variant="default"
          icon={<span className="text-xl">📖</span>}
        />
        <StatCard
          title="This Month Collection"
          value={formatLKR(balances.totalIncomeThisMonth)}
          subtitle={`Paid Members: ${thisMonthPaidCount}`}
          variant="purple"
          icon={<span className="text-xl">💳</span>}
        />
      </div>

      {/* Membership & Expense Secondary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Society Members"
          value={totalMembers}
          subtitle={`Active: ${activeMembers} | Inactive: ${inactiveMembers}`}
          icon={<span className="text-xl">👥</span>}
        />
        <StatCard
          title="Pending Contributions"
          value={pendingContributionsCount}
          subtitle="Active members pending this month"
          variant={pendingContributionsCount > 0 ? 'warning' : 'default'}
          icon={<span className="text-xl">⚠️</span>}
        />
        <StatCard
          title="This Month Expenses"
          value={formatLKR(balances.totalExpenseThisMonth)}
          subtitle="Welfare payouts & Admin costs"
          icon={<span className="text-xl">📉</span>}
        />
        <StatCard
          title="Welfare Cases"
          value={welfareCases.length}
          subtitle="Total cases processed"
          icon={<span className="text-xl">🤝</span>}
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Contributions Preview */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Monthly Contributions</h3>
            <button
              onClick={() => navigate('/admin/contributions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {contributions.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs">
                <div>
                  <p className="font-bold text-white">{c.member_name || c.member_id}</p>
                  <p className="text-slate-400 text-[11px]">{c.month_year} • Receipt: {c.receipt_number}</p>
                </div>
                <span className="font-bold text-emerald-400">{formatLKR(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Welfare Cases Summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Welfare & Assistance Activity</h3>
            <button
              onClick={() => navigate('/admin/welfare')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {welfareCases.slice(0, 4).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs">
                <div>
                  <p className="font-bold text-white">{w.member_name} ({w.relationship_name})</p>
                  <p className="text-slate-400 text-[11px]">Deceased: {w.deceased_person_name} • Status: {w.status}</p>
                </div>
                <span className="font-bold text-purple-400">{formatLKR(w.approved_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
