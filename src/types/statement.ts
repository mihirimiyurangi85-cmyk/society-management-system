export interface StatementRecord {
  date: string;
  description: string;
  reference: string;
  amount: number;
}

export interface MatchedTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  extractedMemberId?: string;
  memberId: string;
  memberName: string;
  status: 'MATCHED' | 'MATCHED_ALREADY_PAID' | 'UNMATCHED';
  monthYear: string; // e.g. '2026-08'
  notes?: string;
}

export interface UploadStatementResponse {
  totalProcessed: number;
  matchedCount: number;
  alreadyPaidCount: number;
  unmatchedCount: number;
  matchedTransactions: MatchedTransaction[];
  unmatchedTransactions: MatchedTransaction[];
}
