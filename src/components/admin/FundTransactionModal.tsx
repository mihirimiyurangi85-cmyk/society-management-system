import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSociety } from '../../context/SocietyContext';
import type { TransactionType, TransactionCategory, AccountType, PaymentMethod } from '../../types';

interface FundTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccountType?: AccountType;
}

export const FundTransactionModal: React.FC<FundTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultAccountType = 'BANK',
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshData } = useSociety();

  const [type, setType] = useState<TransactionType>('INCOME');
  const [category, setCategory] = useState<TransactionCategory>('DONATION');
  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);
  const [amount, setAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState(`REF-${Date.now().toString().slice(-6)}`);
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!description.trim()) {
      showToast('error', 'Validation Error', 'Please enter a description');
      return;
    }

    db.recordFundTransaction(
      {
        transaction_date: transactionDate,
        type,
        category,
        account_type: accountType,
        amount,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        description,
        created_by_user_id: user.id,
        created_by_name: user.full_name,
      },
      { id: user.id, name: user.full_name }
    );

    showToast('success', 'Transaction Posted', `${type} of LKR ${amount} posted to ${accountType} ledger.`);
    refreshData();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Ledger Transaction"
      subtitle="Post income or expense directly to society fund ledgers"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">TRANSACTION TYPE</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="input-field"
            >
              <option value="INCOME">Income (+ Fund)</option>
              <option value="EXPENSE">Expense (- Fund)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ACCOUNT LEDGER</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="input-field"
            >
              <option value="BANK">Bank Account</option>
              <option value="CASH">Physical Cash Book</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="input-field"
            >
              <option value="DONATION">Donation / Well-wisher</option>
              <option value="CONTRIBUTION">Contribution</option>
              <option value="ADMIN_EXPENSE">Administrative Expense</option>
              <option value="OTHER_INCOME">Other Income</option>
              <option value="OTHER_EXPENSE">Other Expense</option>
            </select>
          </div>

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
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="input-field"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online Payment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Input
            label="Transaction Date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>

        <Input
          label="Reference / Receipt #"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          required
        />

        <Input
          label="Transaction Description"
          placeholder="e.g. Annual audit fees, stationery purchase"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Post Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
