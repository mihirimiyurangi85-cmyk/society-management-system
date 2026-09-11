import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Member, MemberStatus } from '../../types';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [status, setStatus] = useState<MemberStatus>('ACTIVE');

  useEffect(() => {
    if (member) {
      setFullName(member.full_name);
      setNicNumber(member.nic_number);
      setAddress(member.address);
      setPhoneNumber(member.phone_number);
      setWhatsappNumber(member.whatsapp_number);
      setMonthlyContribution(member.monthly_contribution);
      setStatus(member.status);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated = db.updateMember(
      member.id,
      {
        full_name: fullName,
        nic_number: nicNumber,
        address,
        phone_number: phoneNumber,
        whatsapp_number: whatsappNumber,
        monthly_contribution: monthlyContribution,
        status,
      },
      { id: user.id, name: user.full_name }
    );

    if (updated) {
      showToast('success', 'Member Details Updated', `Member ${member.id} (${fullName}) updated successfully.`);
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Member: ${member.id}`}
      subtitle="Update profile details or change membership status"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="NIC Number" value={nicNumber} onChange={(e) => setNicNumber(e.target.value)} required />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          <Input label="WhatsApp Number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly Fee (LKR)"
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">MEMBERSHIP STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MemberStatus)}
              className="input-field"
            >
              <option value="ACTIVE">Active Member</option>
              <option value="INACTIVE">Inactive / Deactivated</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
