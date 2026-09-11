import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { FundTransaction } from '../../types';
import { formatLKR } from '../../utils/currencyFormatter';

export const SocietyTransactionsPage: React.FC = () => {
  const { transactions } = useSociety();

  const columns: Column<FundTransaction>[] = [
    { header: 'Date', accessor: 'transaction_date' },
    { header: 'Description', accessor: 'description' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Amount',
      accessor: (t) => (
        <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {t.type === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Society Financial Transactions Log</h1>
        <p className="text-xs text-slate-400">Public financial transparency ledger for society activity</p>
      </div>

      <Table columns={columns} data={transactions} keyExtractor={(t) => t.id} />
    </div>
  );
};
