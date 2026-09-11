import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { StatCard } from '../../components/common/StatCard';
import { formatLKR } from '../../utils/currencyFormatter';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { FundTransaction } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FundTransactionModal } from '../../components/admin/FundTransactionModal';
import { BankStatementUploadModal } from '../../components/admin/BankStatementUploadModal';

export const BankTransactionsPage: React.FC = () => {
  const { balances, transactions } = useSociety();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const bankTxns = transactions.filter((t) => t.account_type === 'BANK');

  const columns: Column<FundTransaction>[] = [
    { header: 'Txn ID', accessor: 'id' },
    { header: 'Date', accessor: 'transaction_date' },
    {
      header: 'Type',
      accessor: (t) => (
        <Badge variant={t.type === 'INCOME' ? 'success' : 'danger'}>{t.type}</Badge>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Amount',
      accessor: (t) => (
        <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {t.type === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
        </span>
      ),
    },
    { header: 'Reference', accessor: 'reference_number' },
    { header: 'Description', accessor: 'description' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Bank Balance Ledger</h1>
          <p className="text-xs text-slate-400">Opening Balance + Deposits - Withdrawals = Current Bank Balance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)}>
            📄 Upload Bank Statement CSV
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Record Bank Transaction
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <StatCard title="Current Bank Balance" value={formatLKR(balances.bankBalance)} variant="primary" />
      </div>

      <Table columns={columns} data={bankTxns} keyExtractor={(t) => t.id} emptyMessage="No bank transactions recorded" />

      <FundTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultAccountType="BANK" />

      <BankStatementUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};
