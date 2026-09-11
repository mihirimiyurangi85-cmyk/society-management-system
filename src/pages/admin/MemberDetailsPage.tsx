import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSociety } from '../../context/SocietyContext';
import { db } from '../../services/db/mockDatabase';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { MemberRelative } from '../../types';
import { RelativeFormModal } from '../../components/admin/RelativeFormModal';
import { EditMemberModal } from '../../components/admin/EditMemberModal';
import { formatLKR } from '../../utils/currencyFormatter';

export const MemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { members, refreshData } = useSociety();
  const navigate = useNavigate();

  const [isRelativeModalOpen, setIsRelativeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const member = members.find((m) => m.id === id);
  const [relatives, setRelatives] = useState<MemberRelative[]>(() =>
    id ? db.getRelativesForMember(id) : []
  );

  const reloadRelatives = () => {
    if (id) {
      setRelatives(db.getRelativesForMember(id));
      refreshData();
    }
  };

  if (!member) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-base font-bold text-white mb-2">Member Not Found</p>
        <Button variant="outline" onClick={() => navigate('/admin/members')}>
          ← Back to Members List
        </Button>
      </div>
    );
  }

  const relativeColumns: Column<MemberRelative>[] = [
    { header: 'Relative Name', accessor: 'relative_name' },
    { header: 'Relationship', accessor: (r) => r.relationship_name || 'Relative' },
    { header: 'NIC Number', accessor: (r) => r.nic_number || 'N/A' },
    { header: 'Phone', accessor: (r) => r.phone_number || 'N/A' },
    {
      header: 'Eligibility Status',
      accessor: (r) => (
        <Badge variant={r.eligibility_status === 'ELIGIBLE' ? 'success' : 'danger'}>
          {r.eligibility_status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/members')} className="text-xs text-emerald-400 font-semibold mb-1">
            ← Back to Members Directory
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{member.full_name}</h1>
            <Badge variant={member.status === 'ACTIVE' ? 'success' : 'danger'}>{member.status}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Member ID: <span className="text-emerald-400 font-bold">{member.id}</span> • Joined Date: {member.join_date}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
            ✏️ Edit Profile
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsRelativeModalOpen(true)}>
            + Register Relative
          </Button>
        </div>
      </div>

      {/* Details & Relatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Member Profile Details</span>
            <span className="text-xs text-slate-400 font-normal">Username: {member.username}</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <p><strong>NIC Number:</strong> {member.nic_number}</p>
            <p><strong>Address:</strong> {member.address}</p>
            <p><strong>Phone Number:</strong> {member.phone_number}</p>
            <p><strong>WhatsApp Number:</strong> {member.whatsapp_number}</p>
            <p>
              <strong>Monthly Fee:</strong>{' '}
              <span className="font-bold text-emerald-400">{formatLKR(member.monthly_contribution)}</span>
            </p>
            <p><strong>System Role:</strong> Standard Society Member</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Registered Eligible Relatives</h3>
            <span className="text-xs font-bold text-emerald-400">{relatives.length} Registered</span>
          </div>

          <Table
            columns={relativeColumns}
            data={relatives}
            keyExtractor={(r) => r.id}
            emptyMessage="No registered relatives. Click '+ Register Relative' to add."
          />
        </div>
      </div>

      {/* Modals */}
      <RelativeFormModal
        isOpen={isRelativeModalOpen}
        onClose={() => setIsRelativeModalOpen(false)}
        memberId={member.id}
        onSuccess={reloadRelatives}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={member}
        onSuccess={refreshData}
      />
    </div>
  );
};
