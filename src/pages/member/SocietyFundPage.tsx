import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { StatCard } from '../../components/common/StatCard';
import { formatLKR } from '../../utils/currencyFormatter';

export const SocietyFundPage: React.FC = () => {
  const { balances } = useSociety();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Society Available Welfare Fund</h1>
        <p className="text-xs text-slate-400">Public transparent society fund balance overview</p>
      </div>

      <div className="max-w-md">
        <StatCard
          title="Total Available Fund"
          value={formatLKR(balances.totalAvailableFund)}
          subtitle="Bank + Cash Book Reserve"
          variant="success"
          icon={<span className="text-2xl">🏛️</span>}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 text-xs text-slate-300">
        <h3 className="text-sm font-bold text-white">Fund Principles & Transparency</h3>
        <p>• Every active member contributes LKR 200.00 per month to the common welfare pool.</p>
        <p>• When an eligible relative of a member passes away, society financial assistance of LKR 10,000.00 is provided.</p>
        <p>• All transactions are logged in an immutable financial ledger.</p>
      </div>
    </div>
  );
};
