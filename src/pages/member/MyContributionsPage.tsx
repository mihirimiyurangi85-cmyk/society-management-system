import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { MonthlyContribution } from '../../types';
import { formatLKR } from '../../utils/currencyFormatter';

export const MyContributionsPage: React.FC = () => {
  const { user, member } = useAuth();
  const { contributions } = useSociety();

  const myContributions = contributions.filter((c) => c.member_id === (member?.id || user?.member_id));

  const columns: Column<MonthlyContribution>[] = [
    { header: 'Receipt #', accessor: 'receipt_number' },
    { header: 'Month / Year', accessor: 'month_year' },
    { header: 'Amount Paid', accessor: (c) => <span className="font-bold text-emerald-400">{formatLKR(c.amount)}</span> },
    { header: 'Payment Method', accessor: 'payment_method' },
    { header: 'Payment Date', accessor: 'payment_date' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Monthly Contributions History</h1>
        <p className="text-xs text-slate-400">Total payments recorded: {myContributions.length}</p>
      </div>

      <Table columns={columns} data={myContributions} keyExtractor={(c) => c.id} emptyMessage="No contribution history found" />
    </div>
  );
};
