import type {
  User,
  Member,
  Relationship,
  MemberRelative,
  MonthlyContribution,
  FundTransaction,
  WelfareCase,
  NotificationItem,
  AuditLog,
  SocietySetting,
  FundBalances,
} from '../../types';
import {
  initialUsers,
  initialMembers,
  initialRelationships,
  initialRelatives,
  initialContributions,
  initialFundTransactions,
  initialWelfareCases,
  initialNotifications,
  initialAuditLogs,
  initialSettings,
} from './seedData';
import { calculateBalances } from '../../utils/ledgerUtils';

const STORAGE_KEYS = {
  USERS: 'sms_db_users',
  MEMBERS: 'sms_db_members',
  RELATIONSHIPS: 'sms_db_relationships',
  RELATIVES: 'sms_db_relatives',
  CONTRIBUTIONS: 'sms_db_contributions',
  TRANSACTIONS: 'sms_db_transactions',
  WELFARE: 'sms_db_welfare',
  NOTIFICATIONS: 'sms_db_notifications',
  AUDIT_LOGS: 'sms_db_audit_logs',
  SETTINGS: 'sms_db_settings',
};

class MockDatabase {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS)) {
      localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(initialRelationships));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RELATIVES)) {
      localStorage.setItem(STORAGE_KEYS.RELATIVES, JSON.stringify(initialRelatives));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(initialContributions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialFundTransactions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WELFARE)) {
      localStorage.setItem(STORAGE_KEYS.WELFARE, JSON.stringify(initialWelfareCases));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private get<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return [];
    }
  }

  private set<T>(key: string, data: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return this.get<User>(STORAGE_KEYS.USERS);
  }

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  // --- Members ---
  getMembers(): Member[] {
    return this.get<Member>(STORAGE_KEYS.MEMBERS);
  }

  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id);
  }

  addMember(memberData: Omit<Member, 'id' | 'created_at'>, actor: { id: string; name: string }): Member {
    const members = this.getMembers();
    const nextNum = members.length + 1;
    const newId = `M${String(nextNum).padStart(3, '0')}`;

    const newMember: Member = {
      ...memberData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    members.unshift(newMember);
    this.set(STORAGE_KEYS.MEMBERS, members);

    const users = this.getUsers();
    users.push({
      id: `USR-${Date.now()}`,
      username: newId,
      password_hash: 'member123',
      role: 'MEMBER',
      member_id: newId,
      full_name: memberData.full_name,
      created_at: new Date().toISOString(),
    });
    this.set(STORAGE_KEYS.USERS, users);

    this.addAuditLog(actor.id, actor.name, 'MEMBER_ADDED', 'MEMBER', newId, undefined, JSON.stringify(newMember));
    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>, actor: { id: string; name: string }): Member | undefined {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return undefined;

    const oldVal = { ...members[index] };
    const updated = { ...members[index], ...updates };
    members[index] = updated;

    this.set(STORAGE_KEYS.MEMBERS, members);
    this.addAuditLog(actor.id, actor.name, 'MEMBER_UPDATED', 'MEMBER', id, JSON.stringify(oldVal), JSON.stringify(updated));
    return updated;
  }

  // --- Relationships & Relatives ---
  getRelationships(): Relationship[] {
    return this.get<Relationship>(STORAGE_KEYS.RELATIONSHIPS);
  }

  addRelationship(name: string): Relationship {
    const rels = this.getRelationships();
    const newRel: Relationship = {
      id: `REL-${String(rels.length + 1).padStart(3, '0')}`,
      name,
      is_active: true,
    };
    rels.push(newRel);
    this.set(STORAGE_KEYS.RELATIONSHIPS, rels);
    return newRel;
  }

  getRelativesForMember(memberId: string): MemberRelative[] {
    return this.get<MemberRelative>(STORAGE_KEYS.RELATIVES).filter((r) => r.member_id === memberId);
  }

  addRelative(relative: Omit<MemberRelative, 'id' | 'created_at'>): MemberRelative {
    const relatives = this.get<MemberRelative>(STORAGE_KEYS.RELATIVES);
    const newRel: MemberRelative = {
      ...relative,
      id: `REL-${relative.member_id}-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    relatives.push(newRel);
    this.set(STORAGE_KEYS.RELATIVES, relatives);
    return newRel;
  }

  // --- Contributions & Duplicate Checks ---
  getContributions(): MonthlyContribution[] {
    return this.get<MonthlyContribution>(STORAGE_KEYS.CONTRIBUTIONS);
  }

  getContributionsForMember(memberId: string): MonthlyContribution[] {
    return this.getContributions().filter((c) => c.member_id === memberId);
  }

  isContributionPaid(memberId: string, monthYear: string): boolean {
    return this.getContributions().some((c) => c.member_id === memberId && c.month_year === monthYear);
  }

  recordContribution(
    contributionData: Omit<MonthlyContribution, 'id' | 'created_at'>,
    accountType: 'BANK' | 'CASH',
    actor: { id: string; name: string }
  ): { contribution: MonthlyContribution; transaction: FundTransaction } {
    if (this.isContributionPaid(contributionData.member_id, contributionData.month_year)) {
      throw new Error(`Contribution for member ${contributionData.member_id} for month ${contributionData.month_year} has already been paid.`);
    }

    const contributions = this.getContributions();
    const nextId = `PAY-${contributionData.month_year.replace('-', '')}-${contributionData.member_id}`;
    const newContrib: MonthlyContribution = {
      ...contributionData,
      id: nextId,
      created_at: new Date().toISOString(),
    };

    contributions.unshift(newContrib);
    this.set(STORAGE_KEYS.CONTRIBUTIONS, contributions);

    const transaction = this.recordFundTransaction(
      {
        transaction_date: contributionData.payment_date,
        type: 'INCOME',
        category: 'CONTRIBUTION',
        account_type: accountType,
        amount: contributionData.amount,
        payment_method: contributionData.payment_method,
        reference_number: contributionData.receipt_number,
        description: `Monthly Contribution (${contributionData.month_year}) - ${contributionData.member_name || contributionData.member_id}`,
        source_id: nextId,
        created_by_user_id: actor.id,
        created_by_name: actor.name,
      },
      actor
    );

    this.addAuditLog(actor.id, actor.name, 'PAYMENT_RECORDED', 'MONTHLY_CONTRIBUTION', nextId, undefined, JSON.stringify(newContrib));
    return { contribution: newContrib, transaction };
  }

  // --- Ledger & Fund Transactions ---
  getFundTransactions(): FundTransaction[] {
    return this.get<FundTransaction>(STORAGE_KEYS.TRANSACTIONS);
  }

  recordFundTransaction(
    txnData: Omit<FundTransaction, 'id' | 'created_at'>,
    actor: { id: string; name: string }
  ): FundTransaction {
    const txns = this.getFundTransactions();
    const newId = `TXN-${String(txns.length + 1).padStart(5, '0')}`;
    const newTxn: FundTransaction = {
      ...txnData,
      id: newId,
      created_at: new Date().toISOString(),
    };

    txns.unshift(newTxn);
    this.set(STORAGE_KEYS.TRANSACTIONS, txns);
    this.addAuditLog(actor.id, actor.name, 'FUND_TRANSACTION_RECORDED', 'FUND_TRANSACTION', newId, undefined, JSON.stringify(newTxn));
    return newTxn;
  }

  getBalances(): FundBalances {
    const txns = this.getFundTransactions();
    const settings = this.getSettings();
    const bankOpening = parseFloat(settings.find((s) => s.key === 'BANK_OPENING_BALANCE')?.value || '97400');
    const cashOpening = parseFloat(settings.find((s) => s.key === 'CASH_OPENING_BALANCE')?.value || '10000');

    return calculateBalances(txns, bankOpening, cashOpening);
  }

  // --- Welfare Cases ---
  getWelfareCases(): WelfareCase[] {
    return this.get<WelfareCase>(STORAGE_KEYS.WELFARE);
  }

  createWelfareCase(
    caseData: Omit<WelfareCase, 'id' | 'created_at' | 'paid_amount' | 'status'>,
    actor: { id: string; name: string }
  ): WelfareCase {
    const cases = this.getWelfareCases();
    const newId = `W${String(cases.length + 1).padStart(3, '0')}`;
    const newCase: WelfareCase = {
      ...caseData,
      id: newId,
      paid_amount: 0,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    cases.unshift(newCase);
    this.set(STORAGE_KEYS.WELFARE, cases);
    this.addAuditLog(actor.id, actor.name, 'WELFARE_CASE_CREATED', 'WELFARE_CASE', newId, undefined, JSON.stringify(newCase));
    return newCase;
  }

  updateWelfareStatus(
    id: string,
    status: WelfareCase['status'],
    actor: { id: string; name: string },
    paymentDetails?: {
      paid_amount: number;
      payment_date: string;
      payment_method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';
      receipt_number: string;
      account_type: 'BANK' | 'CASH';
    }
  ): WelfareCase | undefined {
    const cases = this.getWelfareCases();
    const index = cases.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const oldVal = { ...cases[index] };
    const wCase = { ...cases[index] };
    wCase.status = status;

    if (status === 'APPROVED') {
      wCase.approved_by_user_id = actor.id;
      wCase.approved_by_name = actor.name;
    }

    if (status === 'PAID' && paymentDetails) {
      wCase.paid_amount = paymentDetails.paid_amount;
      wCase.payment_date = paymentDetails.payment_date;
      wCase.payment_method = paymentDetails.payment_method;
      wCase.receipt_number = paymentDetails.receipt_number;

      this.recordFundTransaction(
        {
          transaction_date: paymentDetails.payment_date,
          type: 'EXPENSE',
          category: 'WELFARE_PAYMENT',
          account_type: paymentDetails.account_type,
          amount: paymentDetails.paid_amount,
          payment_method: paymentDetails.payment_method,
          reference_number: paymentDetails.receipt_number,
          description: `Welfare Assistance Payment for Case ${wCase.id} (Member ${wCase.member_name || wCase.member_id})`,
          source_id: wCase.id,
          created_by_user_id: actor.id,
          created_by_name: actor.name,
        },
        actor
      );
    }

    cases[index] = wCase;
    this.set(STORAGE_KEYS.WELFARE, cases);
    this.addAuditLog(actor.id, actor.name, `WELFARE_CASE_${status}`, 'WELFARE_CASE', id, JSON.stringify(oldVal), JSON.stringify(wCase));
    return wCase;
  }

  // --- Notifications ---
  getNotificationsForUser(userId: string, isMember: boolean, memberId?: string): NotificationItem[] {
    const notifications = this.get<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.filter((n) => n.user_id === userId || n.user_id === 'ALL' || (isMember && n.user_id === memberId));
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>): NotificationItem {
    const notifications = this.get<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    const newNotification: NotificationItem = {
      ...notification,
      id: `NTF-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  markNotificationAsRead(id: string) {
    const notifications = this.get<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS);
    const item = notifications.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  }

  private addAuditLog(
    userId: string,
    userName: string,
    actionType: string,
    entityType: string,
    entityId: string,
    prev?: string,
    next?: string
  ) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      previous_values: prev,
      new_values: next,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- Settings ---
  getSettings(): SocietySetting[] {
    return this.get<SocietySetting>(STORAGE_KEYS.SETTINGS);
  }

  updateSetting(key: string, value: string, actor: { id: string; name: string }) {
    const settings = this.getSettings();
    const setting = settings.find((s) => s.key === key);
    if (setting) {
      const prev = setting.value;
      setting.value = value;
      this.set(STORAGE_KEYS.SETTINGS, settings);
      this.addAuditLog(actor.id, actor.name, 'SETTING_UPDATED', 'SETTING', key, prev, value);
    }
  }
}

export const db = new MockDatabase();
