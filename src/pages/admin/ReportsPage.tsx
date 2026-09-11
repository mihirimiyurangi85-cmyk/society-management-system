import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { formatLKR } from '../../utils/currencyFormatter';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { members, contributions, welfareCases, transactions, balances } = useSociety();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Computed metrics
  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const inactiveMembersCount = members.filter((m) => m.status === 'INACTIVE').length;

  const monthContribs = contributions.filter((c) => c.month_year === selectedMonth);
  const totalCollectedMonth = monthContribs.reduce((sum, c) => sum + c.amount, 0);

  const totalWelfarePayouts = welfareCases
    .filter((w) => w.status === 'PAID')
    .reduce((sum, w) => sum + w.paid_amount, 0);

  const exportCSV = (filename: string, rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Report Exported', `Exported ${filename} as CSV file.`);
  };

  const exportMemberReport = () => {
    const rows = [
      ['Member ID', 'Full Name', 'NIC Number', 'Phone Number', 'Status', 'Join Date'],
      ...members.map((m) => [m.id, `"${m.full_name}"`, m.nic_number, m.phone_number, m.status, m.join_date]),
    ];
    exportCSV('Member_Report', rows);
  };

  const exportContributionReport = () => {
    const rows = [
      ['Receipt Ref', 'Member ID', 'Member Name', 'Month Year', 'Amount (LKR)', 'Method', 'Date'],
      ...monthContribs.map((c) => [
        c.receipt_number,
        c.member_id,
        `"${c.member_name}"`,
        c.month_year,
        c.amount.toString(),
        c.payment_method,
        c.payment_date,
      ]),
    ];
    exportCSV('Contribution_Report', rows);
  };

  const exportFundReport = () => {
    const rows = [
      ['Txn ID', 'Date', 'Type', 'Category', 'Account', 'Amount (LKR)', 'Reference', 'Description'],
      ...transactions.map((t) => [
        t.id,
        t.transaction_date,
        t.type,
        t.category,
        t.account_type,
        t.amount.toString(),
        t.reference_number,
        `"${t.description}"`,
      ]),
    ];
    exportCSV('Fund_Ledger_Report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Society Reports & Analytics Center</h1>
          <p className="text-xs text-slate-400">
            Generate and export financial ledger, membership & welfare performance reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Target Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field py-1.5 text-xs w-36"
          />
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Available Fund" value={formatLKR(balances.totalAvailableFund)} variant="success" />
        <StatCard title="Month Collection" value={formatLKR(totalCollectedMonth)} variant="primary" />
        <StatCard title="Total Welfare Paid" value={formatLKR(totalWelfarePayouts)} variant="purple" />
        <StatCard title="Active Membership" value={activeMembersCount} subtitle={`${inactiveMembersCount} inactive`} />
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Directory Report */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">1. Membership Directory Report</h3>
            <span className="text-xs text-slate-400">{members.length} Members</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>• Total Registered Members: <strong className="text-white">{members.length}</strong></p>
            <p>• Active Members: <strong className="text-emerald-400">{activeMembersCount}</strong></p>
            <p>• Inactive / Suspended Members: <strong className="text-rose-400">{inactiveMembersCount}</strong></p>
          </div>

          <Button variant="secondary" size="sm" className="w-full" onClick={exportMemberReport}>
            📥 Export Member Directory (CSV)
          </Button>
        </div>

        {/* Contribution Collection Report */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">2. Monthly Contribution Report</h3>
            <span className="text-xs text-emerald-400 font-bold">{selectedMonth}</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>• Paid Members ({selectedMonth}): <strong className="text-emerald-400">{monthContribs.length}</strong></p>
            <p>• Unpaid / Pending ({selectedMonth}): <strong className="text-amber-400">{Math.max(0, activeMembersCount - monthContribs.length)}</strong></p>
            <p>• Total Amount Collected: <strong className="text-emerald-400">{formatLKR(totalCollectedMonth)}</strong></p>
          </div>

          <Button variant="secondary" size="sm" className="w-full" onClick={exportContributionReport}>
            📥 Export Contribution Report (CSV)
          </Button>
        </div>

        {/* Master Fund Ledger Report */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">3. Master Fund Ledger Report</h3>
            <span className="text-xs text-slate-400">{transactions.length} Transactions</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>• Bank Balance: <strong className="text-sky-400">{formatLKR(balances.bankBalance)}</strong></p>
            <p>• Cash Book Balance: <strong className="text-amber-400">{formatLKR(balances.cashBalance)}</strong></p>
            <p>• Net Available Fund: <strong className="text-emerald-400">{formatLKR(balances.totalAvailableFund)}</strong></p>
          </div>

          <Button variant="secondary" size="sm" className="w-full" onClick={exportFundReport}>
            📥 Export Master Fund Ledger (CSV)
          </Button>
        </div>

        {/* Welfare Assistance Report */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">4. Welfare Assistance Report</h3>
            <span className="text-xs text-purple-400 font-bold">{welfareCases.length} Cases</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>• Total Welfare Cases: <strong className="text-white">{welfareCases.length}</strong></p>
            <p>• Approved & Paid Cases: <strong className="text-emerald-400">{welfareCases.filter(w => w.status === 'PAID').length}</strong></p>
            <p>• Total Disbursements: <strong className="text-purple-400">{formatLKR(totalWelfarePayouts)}</strong></p>
          </div>

          <Button variant="secondary" size="sm" className="w-full" onClick={() => window.print()}>
            🖨️ Print Welfare Performance Summary
          </Button>
        </div>
      </div>
    </div>
  );
};
