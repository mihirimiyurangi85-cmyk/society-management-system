import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Badge } from '../../components/common/Badge';

export const MyNotificationsPage: React.FC = () => {
  const { notifications } = useSociety();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">My Notifications Drawer</h1>
        <p className="text-xs text-slate-400">Personal announcements & payment notifications</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{n.title}</h4>
              <Badge variant="info">{n.type}</Badge>
            </div>
            <p className="text-xs text-slate-300">{n.message}</p>
            <p className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
