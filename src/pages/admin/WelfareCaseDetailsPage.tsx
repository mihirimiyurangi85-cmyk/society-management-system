import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSociety } from '../../context/SocietyContext';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatLKR } from '../../utils/currencyFormatter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { smsService } from '../../services/sms/mockSmsProvider';

export const WelfareCaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { welfareCases, members, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'ONLINE' | 'OTHER'>('BANK_TRANSFER');
  const [accountType, setAccountType] = useState<'BANK' | 'CASH'>('BANK');
  const [receiptNumber, setReceiptNumber] = useState(`WELF-PAY-${Date.now().toString().slice(-5)}`);

  const wCase = welfareCases.find((w) => w.id === id);
  const member = wCase ? members.find((m) => m.id === wCase.member_id) : undefined;

  if (!wCase) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-base font-bold text-white mb-2">Welfare Case Not Found</p>
        <Button variant="outline" onClick={() => navigate('/admin/welfare')}>
          ← Back to Welfare Directory
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    if (!user) return;
    const updated = db.updateWelfareStatus(wCase.id, 'APPROVED', { id: user.id, name: user.full_name });
    if (updated) {
      showToast('success', 'Case Approved', `Welfare Case ${wCase.id} approved.`);
      refreshData();
    }
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updated = db.updateWelfareStatus(
        wCase.id,
        'PAID',
        { id: user.id, name: user.full_name },
        {
          paid_amount: wCase.approved_amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
          receipt_number: receiptNumber,
          account_type: accountType,
        }
      );

      if (updated && member) {
        // Dispatch SMS Notification
        const smsMsg = `Society welfare assistance of LKR ${wCase.approved_amount.toLocaleString()} has been recorded for Member ${member.id} on ${new Date().toLocaleDateString()}. Ref: ${receiptNumber}.`;
        await smsService.sendSms({
          recipientPhone: member.phone_number,
          messageText: smsMsg,
        });

        db.addNotification({
          user_id: member.id,
          title: 'Welfare Assistance Paid',
          message: smsMsg,
          type: 'WELFARE_NOTIFICATION',
          sms_status: 'SENT',
        });

        showToast('success', 'Welfare Disbursement Completed', `Payment of LKR ${wCase.approved_amount} posted to fund ledger and SMS dispatched.`);
        setIsPayModalOpen(false);
        refreshData();
      }
    } catch (e: any) {
      showToast('error', 'Payment Error', e.message || 'Could not disburse payment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin/welfare')} className="text-xs text-emerald-400 font-semibold mb-1">
        ← Back to Welfare Directory
      </button>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Welfare Case Workflow: {wCase.id}</h1>
            <p className="text-xs text-slate-400">Created on {new Date(wCase.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant={wCase.status === 'PAID' ? 'success' : wCase.status === 'APPROVED' ? 'purple' : 'warning'}>
            {wCase.status}
          </Badge>
        </div>

        {/* Workflow Visual Progress */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workflow Stages</p>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400">1. Case Created ✓</span>
            <span className={wCase.status !== 'PENDING' ? 'text-emerald-400' : 'text-slate-500'}>
              2. Approved {wCase.status !== 'PENDING' ? '✓' : ''}
            </span>
            <span className={wCase.status === 'PAID' ? 'text-emerald-400' : 'text-slate-500'}>
              3. Payment Disbursed {wCase.status === 'PAID' ? '✓' : ''}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
          <p><strong>Member Name:</strong> {wCase.member_name} ({wCase.member_id})</p>
          <p><strong>Deceased Person:</strong> {wCase.deceased_person_name}</p>
          <p><strong>Relationship:</strong> {wCase.relationship_name}</p>
          <p><strong>Date of Death:</strong> {wCase.date_of_death}</p>
          <p><strong>Assistance Type:</strong> {wCase.assistance_type}</p>
          <p><strong>Approved Amount:</strong> <span className="font-bold text-purple-400">{formatLKR(wCase.approved_amount)}</span></p>
          {wCase.paid_amount > 0 && (
            <p><strong>Paid Amount:</strong> <span className="font-bold text-emerald-400">{formatLKR(wCase.paid_amount)}</span></p>
          )}
          {wCase.receipt_number && <p><strong>Receipt Ref:</strong> {wCase.receipt_number}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          {wCase.status === 'PENDING' && (
            <Button variant="primary" onClick={handleApprove}>
              Approve Welfare Case
            </Button>
          )}

          {wCase.status === 'APPROVED' && (
            <Button variant="success" onClick={() => setIsPayModalOpen(true)}>
              💳 Record & Disburse Payment
            </Button>
          )}

          {wCase.status === 'PAID' && (
            <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              ✓ Payment Complete & Fund Ledger Updated
            </div>
          )}
        </div>
      </div>

      {/* Disburse Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Disburse Welfare Payment"
        subtitle="This action will deduct money from the selected fund account and send an SMS notification."
      >
        <form onSubmit={handleExecutePayment} className="space-y-4">
          <div className="bg-slate-950 p-3 rounded-xl text-xs space-y-1 text-slate-300">
            <p><strong>Approved Amount:</strong> {formatLKR(wCase.approved_amount)}</p>
            <p><strong>Beneficiary:</strong> {wCase.member_name} ({wCase.member_id})</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PAYMENT METHOD</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="input-field"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">DECREASE FROM ACCOUNT</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="input-field"
              >
                <option value="BANK">Bank Balance</option>
                <option value="CASH">Cash Book Balance</option>
              </select>
            </div>
          </div>

          <Input label="Receipt / Voucher Ref #" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} required />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Disburse & Update Ledger
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
