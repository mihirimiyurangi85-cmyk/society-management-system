import React, { useState, useMemo } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { Member } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { EditMemberModal } from '../../components/admin/EditMemberModal';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MembersPage: React.FC = () => {
  const { members, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nic_number.includes(searchQuery) ||
        m.phone_number.includes(searchQuery);

      const matchesStatus = statusFilter === 'ALL' ? true : m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const toggleMemberStatus = (m: Member) => {
    if (!user) return;
    const newStatus = m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.updateMember(m.id, { status: newStatus }, { id: user.id, name: user.full_name });
    showToast(
      'success',
      'Status Changed',
      `Member ${m.id} (${m.full_name}) is now ${newStatus.toLowerCase()}.`
    );
    refreshData();
  };

  const columns: Column<Member>[] = [
    { header: 'Member ID', accessor: 'id' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'NIC Number', accessor: 'nic_number' },
    { header: 'Phone', accessor: 'phone_number' },
    { header: 'Join Date', accessor: 'join_date' },
    {
      header: 'Status',
      accessor: (m) => (
        <Badge variant={m.status === 'ACTIVE' ? 'success' : 'danger'}>{m.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (m) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/members/${m.id}`)}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            View
          </button>
          <button
            onClick={() => setEditingMember(m)}
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => toggleMemberStatus(m)}
            className={`text-xs font-semibold hover:underline ${
              m.status === 'ACTIVE' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {m.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & New Member Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Society Members Directory</h1>
          <p className="text-xs text-slate-400">
            Total Members: <span className="text-white font-bold">{members.length}</span> | Active:{' '}
            <span className="text-emerald-400 font-bold">
              {members.filter((m) => m.status === 'ACTIVE').length}
            </span>{' '}
            | Inactive:{' '}
            <span className="text-rose-400 font-bold">
              {members.filter((m) => m.status === 'INACTIVE').length}
            </span>
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/members/new')}>
          + Add New Member
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search ID, Name, NIC or Phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<span className="text-sm">🔍</span>}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="input-field py-1.5 text-xs w-36"
          >
            <option value="ALL">All Members</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <Table columns={columns} data={paginatedMembers} keyExtractor={(m) => m.id} />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
        <p className="text-slate-400">
          Showing <span className="text-white font-bold">{paginatedMembers.length}</span> of{' '}
          <span className="text-white font-bold">{filteredMembers.length}</span> records
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="px-3 py-1 font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onSuccess={refreshData}
      />
    </div>
  );
};
