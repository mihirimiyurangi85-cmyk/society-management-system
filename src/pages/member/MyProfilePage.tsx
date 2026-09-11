import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db/mockDatabase';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const MyProfilePage: React.FC = () => {
  const { user, member, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const relatives = member ? db.getRelativesForMember(member.id) : [];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Error', 'New passwords do not match');
      return;
    }

    const res = updatePassword(oldPassword, newPassword);
    if (res.success) {
      showToast('success', 'Password Updated', 'Your security password has been changed.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast('error', 'Update Failed', res.error || 'Could not change password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Profile & Account Security</h1>
        <p className="text-xs text-slate-400">View personal details, registered relatives & change login password</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Membership Info</h3>
          <p className="text-xs text-slate-300"><strong>Member ID:</strong> {member?.id || user?.member_id}</p>
          <p className="text-xs text-slate-300"><strong>Full Name:</strong> {member?.full_name || user?.full_name}</p>
          <p className="text-xs text-slate-300"><strong>NIC Number:</strong> {member?.nic_number}</p>
          <p className="text-xs text-slate-300"><strong>Phone Number:</strong> {member?.phone_number}</p>
          <p className="text-xs text-slate-300"><strong>WhatsApp:</strong> {member?.whatsapp_number}</p>
          <p className="text-xs text-slate-300"><strong>Address:</strong> {member?.address}</p>
          <p className="text-xs text-slate-300"><strong>Join Date:</strong> {member?.join_date}</p>
        </div>

        <form onSubmit={handlePasswordChange} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Change Password</h3>
          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full">
            Update Password
          </Button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Registered Relatives</h3>
        {relatives.length === 0 ? (
          <p className="text-xs text-slate-400">No registered relatives</p>
        ) : (
          <div className="space-y-2">
            {relatives.map((r) => (
              <div key={r.id} className="p-3 bg-slate-800/40 rounded-xl text-xs flex justify-between text-slate-200">
                <span>{r.relative_name} ({r.relationship_name})</span>
                <span className="text-emerald-400 font-bold">{r.eligibility_status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
