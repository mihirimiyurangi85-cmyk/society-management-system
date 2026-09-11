export type UserRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  member_id?: string;
  full_name: string;
  created_at: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface Member {
  id: string; // e.g. M001
  full_name: string;
  nic_number: string;
  address: string;
  phone_number: string;
  whatsapp_number: string;
  join_date: string;
  monthly_contribution: number; // Default 200 LKR
  status: MemberStatus;
  profile_photo_url?: string;
  username: string;
  created_at: string;
}

export interface Relationship {
  id: string;
  name: string;
  is_active: boolean;
}

export type EligibilityStatus = 'ELIGIBLE' | 'INELIGIBLE';

export interface MemberRelative {
  id: string;
  member_id: string;
  relative_name: string;
  relationship_id: string;
  relationship_name?: string;
  nic_number: string;
  phone_number: string;
  eligibility_status: EligibilityStatus;
  created_at: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';

export interface MonthlyContribution {
  id: string; // e.g. PAY-202608-M001
  member_id: string;
  member_name?: string;
  month_year: string; // e.g. '2026-08'
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  receipt_number: string;
  recorded_by_user_id: string;
  recorded_by_name?: string;
  notes?: string;
  created_at: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type AccountType = 'BANK' | 'CASH';
export type TransactionCategory =
  | 'CONTRIBUTION'
  | 'DONATION'
  | 'WELFARE_PAYMENT'
  | 'ADMIN_EXPENSE'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSE';

export interface FundTransaction {
  id: string;
  transaction_date: string;
  type: TransactionType;
  category: TransactionCategory;
  account_type: AccountType;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string;
  description: string;
  source_id?: string; // Link to Contribution ID or Welfare Case ID
  created_by_user_id: string;
  created_by_name?: string;
  is_reversal?: boolean;
  reversal_of_id?: string;
  created_at: string;
}

export type AssistanceType = 'FINANCIAL' | 'FOOD' | 'BOTH';
export type WelfareStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';

export interface WelfareCase {
  id: string; // e.g. W001
  member_id: string;
  member_name?: string;
  deceased_person_name: string;
  relationship_id: string;
  relationship_name?: string;
  date_of_death: string;
  assistance_type: AssistanceType;
  approved_amount: number;
  paid_amount: number;
  payment_date?: string;
  payment_method?: PaymentMethod;
  receipt_number?: string;
  approved_by_user_id?: string;
  approved_by_name?: string;
  status: WelfareStatus;
  notes?: string;
  created_at: string;
}

export type NotificationType =
  | 'PAYMENT_CONFIRMATION'
  | 'PAYMENT_REMINDER'
  | 'WELFARE_NOTIFICATION'
  | 'ANNOUNCEMENT'
  | 'PROFILE_UPDATE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  user_id: string; // Target user or 'ALL'
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  sms_status: 'SENT' | 'FAILED' | 'QUEUED' | 'NONE';
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  previous_values?: string;
  new_values?: string;
  timestamp: string;
}

export interface SocietySetting {
  id: string;
  key: string;
  value: string;
  description: string;
}

export interface FundBalances {
  bankBalance: number;
  cashBalance: number;
  totalAvailableFund: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
}
