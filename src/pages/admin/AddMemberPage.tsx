import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const AddMemberPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(200);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const actor = { id: user.id, name: user.full_name };
      const newMember = db.addMember(
        {
          full_name: fullName,
          nic_number: nicNumber,
          address,
          phone_number: phoneNumber,
          whatsapp_number: whatsappNumber,
          join_date: new Date().toISOString().split('T')[0],
          monthly_contribution: monthlyContribution,
          status: 'ACTIVE',
          username: '',
        },
        actor
      );

      showToast('success', 'Member Registered', `Member ${newMember.id} (${newMember.full_name}) registered successfully.`);
      navigate('/admin/members');
    } catch (e: any) {
      showToast('error', 'Error', e.message || 'Failed to add member');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Register New Society Member</h1>
        <p className="text-xs text-slate-400">Add a new member to the society welfare fund database.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="NIC Number" value={nicNumber} onChange={(e) => setNicNumber(e.target.value)} required />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          <Input label="WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
        </div>
        <Input
          label="Monthly Contribution (LKR)"
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/members')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Member Record
          </Button>
        </div>
      </form>
    </div>
  );
};
