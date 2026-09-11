import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSociety } from '../../context/SocietyContext';
import { Button } from '../../components/common/Button';
import { formatLKR } from '../../utils/currencyFormatter';

export const ContributionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { contributions } = useSociety();
  const navigate = useNavigate();

  const contrib = contributions.find((c) => c.id === id);

  if (!contrib) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-base font-bold text-white mb-2">Contribution Record Not Found</p>
        <Button variant="outline" onClick={() => navigate('/admin/contributions')}>
          ← Back to Contributions
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/contributions')} className="text-xs text-emerald-400 font-semibold">
          ← Back to Contributions List
        </button>

        <Button variant="secondary" size="sm" onClick={handlePrint}>
          🖨️ Print Official Receipt
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative Stamp */}
        <div className="absolute top-4 right-4 border-2 border-emerald-500/30 text-emerald-400/40 font-black text-xs px-3 py-1 rounded-lg uppercase tracking-widest rotate-12">
          OFFICIAL PAID RECEIPT
        </div>

        {/* Receipt Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold">
            🏛️
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Society Welfare & Fund System</h2>
            <p className="text-xs text-slate-400">Official Member Contribution Receipt</p>
          </div>
        </div>

        {/* Receipt Grid */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Receipt Reference:</span>
            <span className="font-mono font-bold text-emerald-400">{contrib.receipt_number}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Member ID & Name:</span>
            <span className="font-bold text-white">{contrib.member_name} ({contrib.member_id})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Contribution Month:</span>
            <span className="font-bold text-white">{contrib.month_year}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="font-bold text-emerald-400 text-sm">{formatLKR(contrib.amount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Payment Date:</span>
            <span className="font-bold text-white">{contrib.payment_date}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Payment Method:</span>
            <span className="font-bold text-white">{contrib.payment_method}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Recorded By Admin:</span>
            <span className="font-bold text-white">{contrib.recorded_by_name || contrib.recorded_by_user_id}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950 p-3 rounded-xl text-[11px] text-slate-400 text-center">
          Thank you for your continuous contribution to the Society Welfare Fund.
        </div>
      </div>
    </div>
  );
};
