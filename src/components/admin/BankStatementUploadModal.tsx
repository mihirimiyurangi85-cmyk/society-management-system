import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Table } from '../common/Table';
import type { Column } from '../common/Table';
import { useSociety } from '../../context/SocietyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { parseAndMatchBankStatement } from '../../services/api/statementParser';
import type { MatchedTransaction, UploadStatementResponse } from '../../types/statement';
import { formatLKR } from '../../utils/currencyFormatter';

interface BankStatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankStatementUploadModal: React.FC<BankStatementUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { members, contributions, recordContribution, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [targetMonthYear, setTargetMonthYear] = useState('2026-08');
  const [parsedData, setParsedData] = useState<UploadStatementResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'MATCHED' | 'UNMATCHED' | 'ALREADY_PAID'>('MATCHED');
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleCsvData = `Date,Description,Reference,Amount,Type
2026-08-15,Monthly Contribution M001 John Silva,DEP-88391,200.00,CREDIT
2026-08-15,Fund Deposit for M002 Kavinda,DEP-88392,200.00,CREDIT
2026-08-16,Transfer from Nimal Jayasinghe M003,DEP-88393,200.00,CREDIT
2026-08-16,Special Donation by M004 Sunil Shantha,DEP-88394,500.00,CREDIT
2026-08-17,Direct Deposit Unknown Ref 991823,DEP-88395,200.00,CREDIT`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (text: string) => {
    if (!text.trim()) {
      showToast('error', 'Empty CSV', 'Please upload or paste a valid CSV statement.');
      return;
    }

    const result = parseAndMatchBankStatement(text, members, contributions, targetMonthYear);
    setParsedData(result);

    showToast(
      'success',
      'Bank Statement Parsed',
      `Parsed ${result.totalProcessed} records: ${result.matchedCount} matched, ${result.unmatchedCount} unmatched.`
    );
  };

  const handleLoadSample = () => {
    processCsvText(sampleCsvData);
  };

  const handleManualMemberAssign = (txnId: string, memberId: string) => {
    if (!parsedData) return;

    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;

    const updatedUnmatched = parsedData.unmatchedTransactions.filter((t) => t.id !== txnId);
    const targetTxn = parsedData.unmatchedTransactions.find((t) => t.id === txnId);

    if (targetTxn) {
      const newlyMatched: MatchedTransaction = {
        ...targetTxn,
        memberId: targetMember.id,
        memberName: targetMember.full_name,
        extractedMemberId: targetMember.id,
        status: 'MATCHED',
        notes: `Manually matched by admin to ${targetMember.id}`,
      };

      setParsedData({
        ...parsedData,
        matchedCount: parsedData.matchedCount + 1,
        unmatchedCount: Math.max(0, parsedData.unmatchedCount - 1),
        matchedTransactions: [newlyMatched, ...parsedData.matchedTransactions],
        unmatchedTransactions: updatedUnmatched,
      });

      showToast('success', 'Member Assigned', `Transaction assigned to ${targetMember.full_name} (${targetMember.id}).`);
    }
  };

  const handleConfirmPosting = async () => {
    if (!parsedData || !user) return;

    const toProcess = parsedData.matchedTransactions.filter((t) => t.status === 'MATCHED');
    if (toProcess.length === 0) {
      showToast('warning', 'No Pending Matches', 'There are no pending matched transactions to post.');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const txn of toProcess) {
      const res = await recordContribution(
        txn.memberId,
        targetMonthYear,
        txn.amount,
        'BANK_TRANSFER',
        txn.reference || `STMT-${Date.now()}`,
        'BANK',
        `Auto-matched from Bank Statement: ${txn.description}`
      );

      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsProcessing(false);
    showToast(
      'success',
      'Auto-Matching Complete',
      `Posted ${successCount} member contributions to Bank Ledger. Sent SMS notifications.`
    );

    refreshData();
    onClose();
  };

  const matchedColumns: Column<MatchedTransaction>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Description', accessor: 'description' },
    { header: 'Member ID', accessor: (t) => <span className="font-bold text-emerald-400">{t.memberId}</span> },
    { header: 'Member Name', accessor: 'memberName' },
    { header: 'Amount', accessor: (t) => <span className="font-bold text-emerald-400">{formatLKR(t.amount)}</span> },
    {
      header: 'Status',
      accessor: () => <Badge variant="success">READY TO POST</Badge>,
    },
  ];

  const unmatchedColumns: Column<MatchedTransaction>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Description', accessor: 'description' },
    { header: 'Amount', accessor: (t) => formatLKR(t.amount) },
    {
      header: 'Assign Member',
      accessor: (t) => (
        <select
          onChange={(e) => handleManualMemberAssign(t.id, e.target.value)}
          className="input-field py-1 text-xs"
          defaultValue=""
        >
          <option value="" disabled>
            -- Assign Member --
          </option>
          {members.filter((m) => m.status === 'ACTIVE').map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} - {m.full_name}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const alreadyPaidColumns: Column<MatchedTransaction>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Member', accessor: (t) => `${t.memberName} (${t.memberId})` },
    { header: 'Amount', accessor: (t) => formatLKR(t.amount) },
    { header: 'Note', accessor: 'notes' },
    {
      header: 'Status',
      accessor: () => <Badge variant="warning">DUPLICATE / ALREADY PAID</Badge>,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Bank Statement & Auto-Match Members"
      subtitle="Parse online banking CSV statements, auto-detect Member IDs, and post contributions"
      size="xl"
    >
      <div className="space-y-5">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                1. SELECT BANK STATEMENT CSV FILE
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 file:cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  TARGET MONTH
                </label>
                <input
                  type="month"
                  value={targetMonthYear}
                  onChange={(e) => setTargetMonthYear(e.target.value)}
                  className="input-field py-1 text-xs w-36"
                />
              </div>

              <div className="pt-4 sm:pt-0">
                <Button variant="outline" size="sm" onClick={handleLoadSample}>
                  ⚡ Load Sample CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {parsedData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Processed</p>
                <p className="text-xl font-bold text-white">{parsedData.totalProcessed}</p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                <p className="text-[10px] text-emerald-400 uppercase font-semibold">Auto-Matched</p>
                <p className="text-xl font-bold text-emerald-400">{parsedData.matchedCount}</p>
              </div>

              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl">
                <p className="text-[10px] text-amber-400 uppercase font-semibold">Unmatched</p>
                <p className="text-xl font-bold text-amber-400">{parsedData.unmatchedCount}</p>
              </div>

              <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl">
                <p className="text-[10px] text-purple-400 uppercase font-semibold">Already Paid</p>
                <p className="text-xl font-bold text-purple-400">{parsedData.alreadyPaidCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('MATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'MATCHED'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Matched Members ({parsedData.matchedCount})
              </button>
              <button
                onClick={() => setActiveTab('UNMATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'UNMATCHED'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unmatched Items ({parsedData.unmatchedCount})
              </button>
              <button
                onClick={() => setActiveTab('ALREADY_PAID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ALREADY_PAID'
                    ? 'bg-purple-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Already Paid ({parsedData.alreadyPaidCount})
              </button>
            </div>

            {activeTab === 'MATCHED' && (
              <Table
                columns={matchedColumns}
                data={parsedData.matchedTransactions.filter((t) => t.status === 'MATCHED')}
                keyExtractor={(t) => t.id}
                emptyMessage="No matched transactions"
              />
            )}

            {activeTab === 'UNMATCHED' && (
              <Table
                columns={unmatchedColumns}
                data={parsedData.unmatchedTransactions}
                keyExtractor={(t) => t.id}
                emptyMessage="No unmatched transactions"
              />
            )}

            {activeTab === 'ALREADY_PAID' && (
              <Table
                columns={alreadyPaidColumns}
                data={parsedData.matchedTransactions.filter((t) => t.status === 'MATCHED_ALREADY_PAID')}
                keyExtractor={(t) => t.id}
                emptyMessage="No duplicate or already paid records"
              />
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Ready to post <strong className="text-emerald-400">{parsedData.matchedCount}</strong> matched member payments to Bank Ledger.
              </p>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmPosting}
                  isLoading={isProcessing}
                  disabled={parsedData.matchedCount === 0}
                >
                  Confirm & Post All Matched Payments
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
