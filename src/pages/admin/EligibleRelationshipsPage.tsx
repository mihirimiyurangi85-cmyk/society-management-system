import React, { useState } from 'react';
import { db } from '../../services/db/mockDatabase';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export const EligibleRelationshipsPage: React.FC = () => {
  const [relationships, setRelationships] = useState(() => db.getRelationships());
  const [newName, setNewName] = useState('');
  const { showToast } = useToast();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const added = db.addRelationship(newName.trim());
    setRelationships(db.getRelationships());
    showToast('success', 'Relationship Configured', `Relationship type '${added.name}' added.`);
    setNewName('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Eligible Relationship Settings</h1>
        <p className="text-xs text-slate-400">Configure eligible relative categories for welfare assistance</p>
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="New Relationship Type"
            placeholder="e.g. Guardian, Sister, Brother"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="primary">
          + Add
        </Button>
      </form>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Configured Categories</h3>
        <div className="divide-y divide-slate-800">
          {relationships.map((r) => (
            <div key={r.id} className="py-2 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">{r.name}</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
