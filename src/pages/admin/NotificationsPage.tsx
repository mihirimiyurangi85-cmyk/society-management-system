import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { smsService } from '../../services/sms/mockSmsProvider';
import { db } from '../../services/db/mockDatabase';

export const NotificationsPage: React.FC = () => {
  const { notifications, members, refreshData } = useSociety();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('ALL');
  const [sendSmsOption, setSendSmsOption] = useState(true);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Validation Error', 'Please enter a title and message');
      return;
    }

    if (sendSmsOption) {
      if (targetUserId === 'ALL') {
        const activeMembers = members.filter((m) => m.status === 'ACTIVE');
        const smsList = activeMembers.map((m) => ({
          recipientPhone: m.phone_number,
          messageText: `[Society Notice] ${title}: ${message}`,
        }));
        await smsService.sendBulkSms(smsList);
      } else {
        const m = members.find((mem) => mem.id === targetUserId);
        if (m) {
          await smsService.sendSms({
            recipientPhone: m.phone_number,
            messageText: `[Society Notice] ${title}: ${message}`,
          });
        }
      }
    }

    db.addNotification({
      user_id: targetUserId,
      title,
      message,
      type: 'ANNOUNCEMENT',
      sms_status: sendSmsOption ? 'SENT' : 'NONE',
    });

    showToast('success', 'Announcement Sent', `Notification broadcasted to ${targetUserId === 'ALL' ? 'all members' : targetUserId}.`);
    setTitle('');
    setMessage('');
    setIsModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Notifications & SMS Dispatch Center</h1>
          <p className="text-xs text-slate-400">System broadcast log and SMS gateway integration interface</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Broadcast Announcement
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{n.title}</h4>
                <Badge variant="info">{n.type}</Badge>
                <Badge variant={n.sms_status === 'SENT' ? 'success' : 'neutral'}>SMS: {n.sms_status}</Badge>
              </div>
              <p className="text-xs text-slate-300">{n.message}</p>
              <p className="text-[10px] text-slate-500">
                Recipient: <span className="text-emerald-400 font-bold">{n.user_id}</span> • {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
        subtitle="Send society notification & SMS text to members"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">TARGET AUDIENCE</label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="input-field"
            >
              <option value="ALL">📢 All Active Society Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 {m.id} - {m.full_name} ({m.phone_number})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Announcement Title"
            placeholder="e.g. Annual General Meeting Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">MESSAGE CONTENT</label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Enter announcement details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={sendSmsOption}
              onChange={(e) => setSendSmsOption(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
            />
            <span>Dispatch copy via SMS Gateway to recipients</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
