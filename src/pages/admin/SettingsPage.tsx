import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { db } from '../../services/db/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const SettingsPage: React.FC = () => {
  const { settings, refreshData } = useSociety();
  const { user } = useAuth();
  const { showToast } = useToast();

  const defaultFee = settings.find((s) => s.key === 'DEFAULT_MONTHLY_CONTRIBUTION')?.value || '200';
  const [fee, setFee] = useState(defaultFee);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    db.updateSetting('DEFAULT_MONTHLY_CONTRIBUTION', fee, { id: user.id, name: user.full_name });
    showToast('success', 'Settings Updated', `Default monthly fee set to LKR ${fee}.`);
    refreshData();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Society System Settings</h1>
        <p className="text-xs text-slate-400">Configure global parameters and monthly contribution rates</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <Input
          label="Default Monthly Contribution (LKR)"
          type="number"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          required
        />
        <Button type="submit" variant="primary">
          Save System Configuration
        </Button>
      </form>
    </div>
  );
};
