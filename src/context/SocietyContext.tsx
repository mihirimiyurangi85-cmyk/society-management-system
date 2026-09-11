import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Member,
  MonthlyContribution,
  FundTransaction,
  WelfareCase,
  NotificationItem,
  AuditLog,
  SocietySetting,
  FundBalances,
} from '../types';
import { db } from '../services/db/mockDatabase';
import { useAuth } from './AuthContext';
import { smsService } from '../services/sms/mockSmsProvider';

interface SocietyContextType {
  members: Member[];
  contributions: MonthlyContribution[];
  transactions: FundTransaction[];
  welfareCases: WelfareCase[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  settings: SocietySetting[];
  balances: FundBalances;
  refreshData: () => void;
  recordContribution: (
    memberId: string,
    monthYear: string,
    amount: number,
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER',
    receiptNumber: string,
    accountType: 'BANK' | 'CASH',
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<MonthlyContribution[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [welfareCases, setWelfareCases] = useState<WelfareCase[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SocietySetting[]>([]);
  const [balances, setBalances] = useState<FundBalances>({
    bankBalance: 0,
    cashBalance: 0,
    totalAvailableFund: 0,
    totalIncomeThisMonth: 0,
    totalExpenseThisMonth: 0,
  });

  const refreshData = useCallback(() => {
    setMembers(db.getMembers());
    setContributions(db.getContributions());
    setTransactions(db.getFundTransactions());
    setWelfareCases(db.getWelfareCases());
    setAuditLogs(db.getAuditLogs());
    setSettings(db.getSettings());
    setBalances(db.getBalances());

    if (user) {
      const isMem = user.role === 'MEMBER';
      setNotifications(db.getNotificationsForUser(user.id, isMem, user.member_id));
    }
  }, [user]);

  useEffect(() => {
    refreshData();
    const unsubscribe = db.subscribe(refreshData);
    return () => unsubscribe();
  }, [refreshData]);

  const recordContribution = async (
    memberId: string,
    monthYear: string,
    amount: number,
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER',
    receiptNumber: string,
    accountType: 'BANK' | 'CASH',
    notes?: string
  ) => {
    if (!user) return { success: false, error: 'User unauthenticated' };

    const member = db.getMemberById(memberId);
    if (!member) return { success: false, error: 'Member not found' };

    try {
      const actor = { id: user.id, name: user.full_name };
      db.recordContribution(
        {
          member_id: memberId,
          member_name: member.full_name,
          month_year: monthYear,
          amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
          receipt_number: receiptNumber,
          recorded_by_user_id: user.id,
          recorded_by_name: user.full_name,
          notes,
        },
        accountType,
        actor
      );

      const smsMessageText = `Your society contribution of LKR ${amount} for ${monthYear} has been successfully recorded. Receipt: ${receiptNumber}. Thank you.`;
      
      await smsService.sendSms({
        recipientPhone: member.phone_number,
        messageText: smsMessageText,
      });

      db.addNotification({
        user_id: member.id,
        title: 'Contribution Payment Recorded',
        message: smsMessageText,
        type: 'PAYMENT_CONFIRMATION',
        sms_status: 'SENT',
      });

      refreshData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to record contribution' };
    }
  };

  return (
    <SocietyContext.Provider
      value={{
        members,
        contributions,
        transactions,
        welfareCases,
        notifications,
        auditLogs,
        settings,
        balances,
        refreshData,
        recordContribution,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = () => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
