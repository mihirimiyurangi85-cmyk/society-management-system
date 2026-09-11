import React, { useState, useMemo } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Table } from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import type { AuditLog } from '../../types';
import { Input } from '../../components/common/Input';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === 'ALL' ? true : log.action_type === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.action_type)));
  }, [auditLogs]);

  const columns: Column<AuditLog>[] = [
    { header: 'Log ID', accessor: 'id' },
    { header: 'User', accessor: 'user_name' },
    {
      header: 'Action Type',
      accessor: (a) => <span className="font-mono text-emerald-400 font-bold">{a.action_type}</span>,
    },
    { header: 'Entity Type', accessor: 'entity_type' },
    { header: 'Target Ref ID', accessor: 'entity_id' },
    { header: 'Timestamp', accessor: (a) => new Date(a.timestamp).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">System Security & Audit Trail</h1>
        <p className="text-xs text-slate-400">
          Immutable audit log recording every administrative, payment, welfare, and security action
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search User, Action, or Target Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<span className="text-sm">🔍</span>}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field py-1.5 text-xs w-48"
          >
            <option value="ALL">All Action Types</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table columns={columns} data={filteredLogs} keyExtractor={(a) => a.id} emptyMessage="No audit logs match criteria" />
    </div>
  );
};
