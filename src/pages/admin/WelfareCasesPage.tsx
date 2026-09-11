import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { WelfareCase } from '../../types';
import { formatLKR } from '../../utils/currencyFormatter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const WelfareCasesPage: React.FC = () => {
  const { welfareCases, members, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [relationshipId, setRelationshipId] = useState('REL-002');
  const [dateOfDeath, setDateOfDeath] = useState('2026-08-12');
  const [assistanceType, setAssistanceType] = useState<'FINANCIAL' | 'FOOD' | 'BOTH'>('BOTH');
  const [amount, setAmount] = useState(10000);
  const [notes, setNotes] = useState('');

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMemberId) return;

    const member = members.find((m) => m.id === selectedMemberId);
    const rels = db.getRelationships();
    const rel = rels.find((r) => r.id === relationshipId);

    const newCase = db.createWelfareCase(
      {
        member_id: selectedMemberId,
        member_name: member?.full_name,
        deceased_person_name: deceasedName,
        relationship_id: relationshipId,
        relationship_name: rel?.name || 'Relative',
        date_of_death: dateOfDeath,
        assistance_type: assistanceType,
        approved_amount: amount,
        notes,
      },
      { id: user.id, name: user.full_name }
    );

    showToast('success', 'Welfare Case Created', `Case ${newCase.id} registered for member ${selectedMemberId}.`);
    setIsModalOpen(false);
    refreshData();
  };

  const getStatusBadge = (status: WelfareCase['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">PAID</Badge>;
      case 'APPROVED':
        return <Badge variant="purple">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<WelfareCase>[] = [
    { header: 'Case ID', accessor: 'id' },
    { header: 'Member Name', accessor: (w) => w.member_name || w.member_id },
    { header: 'Deceased Person', accessor: 'deceased_person_name' },
    { header: 'Relationship', accessor: (w) => w.relationship_name || 'Relative' },
    { header: 'Assistance', accessor: 'assistance_type' },
    { header: 'Approved Amount', accessor: (w) => <span className="font-bold text-purple-400">{formatLKR(w.approved_amount)}</span> },
    { header: 'Status', accessor: (w) => getStatusBadge(w.status) },
    {
      header: 'Actions',
      accessor: (w) => (
        <button
          onClick={() => navigate(`/admin/welfare/${w.id}`)}
          className="text-xs font-semibold text-emerald-400 hover:underline"
        >
          Manage Workflow
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Welfare & Death Assistance Module</h1>
          <p className="text-xs text-slate-400">Process society assistance claims and disbursements</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Welfare Case
        </Button>
      </div>

      <Table columns={columns} data={welfareCases} keyExtractor={(w) => w.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Welfare Case"
        subtitle="Verify eligible relative & submit claim for administrative approval"
      >
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SELECT MEMBER</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select Society Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.full_name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Deceased Person Name"
            value={deceasedName}
            onChange={(e) => setDeceasedName(e.target.value)}
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
                {db.getRelationships().map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date of Death"
              type="date"
              value={dateOfDeath}
              onChange={(e) => setDateOfDeath(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ASSISTANCE TYPE</label>
              <select
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value as any)}
                className="input-field"
              >
                <option value="BOTH">Both (Financial & Food)</option>
                <option value="FINANCIAL">Financial Assistance Only</option>
                <option value="FOOD">Food Assistance Only</option>
              </select>
            </div>

            <Input
              label="Approved Amount (LKR)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>

          <Input label="Notes & Remarks" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Welfare Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
