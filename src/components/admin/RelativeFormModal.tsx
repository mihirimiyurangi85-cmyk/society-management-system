import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { db } from '../../services/db/mockDatabase';
import { useToast } from '../../context/ToastContext';
import type { EligibilityStatus } from '../../types';

interface RelativeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  onSuccess: () => void;
}

export const RelativeFormModal: React.FC<RelativeFormModalProps> = ({
  isOpen,
  onClose,
  memberId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const relationships = db.getRelationships();

  const [relativeName, setRelativeName] = useState('');
  const [relationshipId, setRelationshipId] = useState(relationships[0]?.id || 'REL-001');
  const [nicNumber, setNicNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>('ELIGIBLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relativeName.trim()) {
      showToast('error', 'Validation Error', 'Please enter relative name');
      return;
    }

    const relObj = relationships.find((r) => r.id === relationshipId);

    db.addRelative({
      member_id: memberId,
      relative_name: relativeName,
      relationship_id: relationshipId,
      relationship_name: relObj?.name || 'Relative',
      nic_number: nicNumber,
      phone_number: phoneNumber,
      eligibility_status: eligibilityStatus,
    });

    showToast('success', 'Relative Registered', `Registered ${relativeName} (${relObj?.name}) for member ${memberId}.`);
    setRelativeName('');
    setNicNumber('');
    setPhoneNumber('');
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Eligible Relative"
      subtitle={`Add registered relative for member ${memberId}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Relative Full Name"
          placeholder="e.g. Kamala Perera"
          value={relativeName}
          onChange={(e) => setRelativeName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">RELATIONSHIP TYPE</label>
            <select
              value={relationshipId}
              onChange={(e) => setRelationshipId(e.target.value)}
              className="input-field"
            >
              {relationships.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ELIGIBILITY STATUS</label>
            <select
              value={eligibilityStatus}
              onChange={(e) => setEligibilityStatus(e.target.value as EligibilityStatus)}
              className="input-field"
            >
              <option value="ELIGIBLE">Eligible for Welfare</option>
              <option value="INELIGIBLE">Ineligible / Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="NIC Number (Optional)"
            placeholder="e.g. 196512345678"
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value)}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +94771234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Relative
          </Button>
        </div>
      </form>
    </Modal>
  );
};
