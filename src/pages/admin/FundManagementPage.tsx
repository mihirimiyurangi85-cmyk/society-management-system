import React, { useState, useMemo } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { StatCard } from '../../components/common/StatCard';
import { formatLKR } from '../../utils/currencyFormatter';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { FundTransaction } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { FundTransactionModal } from '../../components/admin/FundTransactionModal';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const FundManagementPage: React.FC = () => {
  const { balances, transactions, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'BANK' | 'CASH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = typeFilter === 'ALL' ? true : t.type === typeFilter;
      const matchesAccount = accountFilter === 'ALL' ? true : t.account_type === accountFilter;
      const matchesSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reference_number.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesAccount && matchesSearch;
    });
  }, [transactions, typeFilter, accountFilter, searchQuery]);

  const handleReverseTransaction = (t: FundTransaction) => {
    if (!user) return;
    if (t.is_reversal) {
      showToast('error', 'Action Denied', 'Reversal entries cannot be reversed twice.');
      return;
    }

    const reversalType = t.type === 'INCOME' ? 'EXPENSE' : 'INCOME';
    db.recordFundTransaction(
      {
        transaction_date: new Date().toISOString().split('T')[0],
        type: reversalType,
        category: t.category,
        account_type: t.account_type,
        amount: t.amount,
        payment_method: t.payment_method,
        reference_number: `REV-${t.id}`,
        description: `[REVERSAL ENTRY] Reversal of transaction ${t.id} (${t.description})`,
        created_by_user_id: user.id,
        created_by_name: user.full_name,
        is_reversal: true,
        reversal_of_id: t.id,
      },
      { id: user.id, name: user.full_name }
    );

    showToast('success', 'Reversal Posted', `Reversal transaction posted for ${t.id}. Balance adjusted.`);
    refreshData();
  };

  const columns: Column<FundTransaction>[] = [
    { header: 'Txn ID', accessor: 'id' },
    { header: 'Date', accessor: 'transaction_date' },
    {
      header: 'Type',
      accessor: (t) => (
        <Badge variant={t.type === 'INCOME' ? 'success' : 'danger'}>
          {t.is_reversal ? 'REVERSAL' : t.type}
        </Badge>
      ),
    },
    { header: 'Account', accessor: 'account_type' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Amount',
      accessor: (t) => (
        <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {t.type === 'INCOME' ? '+' : '-'}{formatLKR(t.amount)}
        </span>
      ),
    },
    { header: 'Ref #', accessor: 'reference_number' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Audit Action',
      accessor: (t) => (
        <button
          onClick={() => handleReverseTransaction(t)}
          disabled={t.is_reversal}
          className={`text-xs font-semibold ${
            t.is_reversal ? 'text-slate-500 cursor-not-allowed' : 'text-amber-400 hover:underline'
          }`}
        >
          {t.is_reversal ? 'Reversed' : '↺ Reverse Entry'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Society Fund Management Ledger</h1>
          <p className="text-xs text-slate-400">
            Immutable Double-Entry Ledger: Total Fund = Bank Balance + Cash Book Balance
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Ledger Transaction
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Bank Balance" value={formatLKR(balances.bankBalance)} variant="primary" />
        <StatCard title="Cash Book Balance" value={formatLKR(balances.cashBalance)} variant="default" />
        <StatCard title="Total Available Fund" value={formatLKR(balances.totalAvailableFund)} variant="success" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search Description or Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<span className="text-sm">🔍</span>}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="input-field py-1 text-xs w-28"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400">Account:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value as any)}
              className="input-field py-1 text-xs w-28"
            >
              <option value="ALL">All Ledgers</option>
              <option value="BANK">Bank Only</option>
              <option value="CASH">Cash Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <Table columns={columns} data={filteredTransactions} keyExtractor={(t) => t.id} />

      {/* Post Modal */}
      <FundTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
