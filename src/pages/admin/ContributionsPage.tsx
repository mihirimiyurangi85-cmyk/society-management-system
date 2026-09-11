import React, { useState, useMemo } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { MonthlyContribution, Member } from '../../types';
import { formatLKR } from '../../utils/currencyFormatter';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { smsService } from '../../services/sms/mockSmsProvider';
import { db } from '../../services/db/mockDatabase';
import { useNavigate } from 'react-router-dom';
import { BankStatementUploadModal } from '../../components/admin/BankStatementUploadModal';

export const ContributionsPage: React.FC = () => {
  const { contributions, members, recordContribution } = useSociety();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'HISTORY' | 'OUTSTANDING'>('HISTORY');
  const [selectedMonthYear, setSelectedMonthYear] = useState('2026-08');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [monthYear, setMonthYear] = useState('2026-08');
  const [amount, setAmount] = useState(200);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER'>('CASH');
  const [accountType, setAccountType] = useState<'BANK' | 'CASH'>('CASH');
  const [receiptNumber, setReceiptNumber] = useState(`REC-${Date.now().toString().slice(-6)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered History
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      const matchesMonth = selectedMonthYear ? c.month_year === selectedMonthYear : true;
      const matchesSearch =
        c.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.member_name && c.member_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.receipt_number.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [contributions, selectedMonthYear, searchQuery]);

  // Outstanding/Unpaid Members Calculation for selected month
  const unpaidMembers = useMemo(() => {
    const paidMemberIds = new Set(
      contributions.filter((c) => c.month_year === selectedMonthYear).map((c) => c.member_id)
    );
    return members.filter(
      (m) => m.status === 'ACTIVE' && !paidMemberIds.has(m.id) &&
      (m.id.toLowerCase().includes(searchQuery.toLowerCase()) || m.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, contributions, selectedMonthYear, searchQuery]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      showToast('error', 'Select Member', 'Please select an active member');
      return;
    }

    setIsSubmitting(true);
    const res = await recordContribution(
      selectedMemberId,
      monthYear,
      amount,
      paymentMethod,
      receiptNumber,
      accountType,
      'Recorded by Admin'
    );
    setIsSubmitting(false);

    if (res.success) {
      showToast('success', 'Payment Recorded', `Contribution for ${monthYear} recorded successfully. SMS sent.`);
      setIsModalOpen(false);
      setSelectedMemberId('');
      setReceiptNumber(`REC-${Date.now().toString().slice(-6)}`);
    } else {
      showToast('error', 'Payment Failed', res.error || 'Could not record contribution');
    }
  };

  const sendReminder = async (m: Member) => {
    const smsMsg = `Reminder: Your society monthly contribution of LKR 200 for ${selectedMonthYear} is pending. Please make your payment. Thank you.`;
    await smsService.sendSms({
      recipientPhone: m.phone_number,
      messageText: smsMsg,
    });

    db.addNotification({
      user_id: m.id,
      title: 'Monthly Payment Reminder',
      message: smsMsg,
      type: 'PAYMENT_REMINDER',
      sms_status: 'SENT',
    });

    showToast('success', 'SMS Reminder Sent', `Sent payment reminder to ${m.full_name} (${m.phone_number}).`);
  };

  const historyColumns: Column<MonthlyContribution>[] = [
    { header: 'Receipt #', accessor: 'receipt_number' },
    { header: 'Member ID', accessor: 'member_id' },
    { header: 'Member Name', accessor: (c) => c.member_name || c.member_id },
    { header: 'Month', accessor: 'month_year' },
    { header: 'Amount', accessor: (c) => <span className="font-bold text-emerald-400">{formatLKR(c.amount)}</span> },
    { header: 'Method', accessor: 'payment_method' },
    { header: 'Date', accessor: 'payment_date' },
    {
      header: 'Actions',
      accessor: (c) => (
        <button
          onClick={() => navigate(`/admin/contributions/${c.id}`)}
          className="text-xs font-semibold text-emerald-400 hover:underline"
        >
          Receipt
        </button>
      ),
    },
  ];

  const outstandingColumns: Column<Member>[] = [
    { header: 'Member ID', accessor: 'id' },
    { header: 'Member Name', accessor: 'full_name' },
    { header: 'Phone Number', accessor: 'phone_number' },
    { header: 'Monthly Fee', accessor: (m) => formatLKR(m.monthly_contribution) },
    {
      header: 'Status',
      accessor: () => <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">PENDING</span>,
    },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedMemberId(m.id);
              setMonthYear(selectedMonthYear);
              setIsModalOpen(true);
            }}
          >
            Record Payment
          </Button>
          <Button variant="outline" size="sm" onClick={() => sendReminder(m)}>
            📲 Send SMS Reminder
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Monthly Contributions Engine</h1>
          <p className="text-xs text-slate-400">
            LKR 200/month contributions, payment ledger & automated SMS payment reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)}>
            📄 Upload Bank Statement CSV
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Record Monthly Payment
          </Button>
        </div>
      </div>

      {/* Tabs & Month Selector Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💳 Paid History ({filteredContributions.length})
          </button>
          <button
            onClick={() => setActiveTab('OUTSTANDING')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'OUTSTANDING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ Pending / Outstanding ({unpaidMembers.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400">Month:</span>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="input-field py-1 text-xs w-36"
            />
          </div>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'HISTORY' ? (
        <Table columns={historyColumns} data={filteredContributions} keyExtractor={(c) => c.id} />
      ) : (
        <Table columns={outstandingColumns} data={unpaidMembers} keyExtractor={(m) => m.id} />
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Monthly Contribution"
        subtitle="Prevents duplicate payments for the same member & month automatically"
      >
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SELECT MEMBER</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select Member --</option>
              {members.filter((m) => m.status === 'ACTIVE').map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.full_name} ({m.phone_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contribution Month"
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              required
            />
            <Input
              label="Amount (LKR)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PAYMENT METHOD</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="input-field"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online Payment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">DEPOSIT ACCOUNT</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="input-field"
              >
                <option value="CASH">Physical Cash Book</option>
                <option value="BANK">Bank Account</option>
              </select>
            </div>
          </div>

          <Input label="Receipt Number" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} required />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Record & Send Confirmation SMS
            </Button>
          </div>
        </form>
      </Modal>

      <BankStatementUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};
