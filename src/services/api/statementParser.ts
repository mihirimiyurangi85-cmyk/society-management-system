import Papa from 'papaparse';
import type { MatchedTransaction, UploadStatementResponse } from '../../types/statement';
import type { Member, MonthlyContribution } from '../../types';

export function parseAndMatchBankStatement(
  csvText: string,
  members: Member[],
  contributions: MonthlyContribution[],
  targetMonthYear: string
): UploadStatementResponse {
  const parseResult = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const matchedTransactions: MatchedTransaction[] = [];
  const unmatchedTransactions: MatchedTransaction[] = [];
  let matchedCount = 0;
  let alreadyPaidCount = 0;
  let unmatchedCount = 0;

  const paidKeys = new Set(
    contributions.map((c) => `${c.member_id}_${c.month_year}`)
  );

  parseResult.data.forEach((row: Record<string, string>, index: number) => {
    const dateStr =
      row['Date'] || row['date'] || row['Posting Date'] || new Date().toISOString().split('T')[0];
    const descStr =
      row['Description'] ||
      row['description'] ||
      row['Particulars'] ||
      row['Details'] ||
      row['Remarks'] ||
      'Bank Transfer Deposit';
    const refStr =
      row['Reference'] ||
      row['reference'] ||
      row['Transaction Reference'] ||
      row['Ref No'] ||
      `DEP-${Date.now().toString().slice(-4)}-${index + 1}`;

    const rawAmt =
      row['Amount'] || row['amount'] || row['Credit Amount'] || row['Credit'] || '0';
    const amount = Math.abs(parseFloat(rawAmt.replace(/[^0-9.-]+/g, '')) || 200);

    // Regex extraction for Member ID (e.g., M001, M045, M250)
    const idMatch = descStr.match(/(M\d{3})/i) || refStr.match(/(M\d{3})/i);
    let matchedMember: Member | undefined = undefined;

    if (idMatch) {
      const candidateId = idMatch[1].toUpperCase();
      matchedMember = members.find((m) => m.id.toUpperCase() === candidateId);
    }

    if (!matchedMember) {
      matchedMember = members.find(
        (m) => m.full_name && descStr.toLowerCase().includes(m.full_name.toLowerCase())
      );
    }

    const txnId = `STMT-${Date.now()}-${index + 1}`;

    if (matchedMember) {
      const paidKey = `${matchedMember.id}_${targetMonthYear}`;
      const isAlreadyPaid = paidKeys.has(paidKey);

      if (isAlreadyPaid) {
        alreadyPaidCount++;
        matchedTransactions.push({
          id: txnId,
          date: dateStr,
          description: descStr,
          reference: refStr,
          amount,
          extractedMemberId: matchedMember.id,
          memberId: matchedMember.id,
          memberName: matchedMember.full_name,
          status: 'MATCHED_ALREADY_PAID',
          monthYear: targetMonthYear,
          notes: `Member ${matchedMember.id} has already paid for ${targetMonthYear}`,
        });
      } else {
        matchedCount++;
        matchedTransactions.push({
          id: txnId,
          date: dateStr,
          description: descStr,
          reference: refStr,
          amount,
          extractedMemberId: matchedMember.id,
          memberId: matchedMember.id,
          memberName: matchedMember.full_name,
          status: 'MATCHED',
          monthYear: targetMonthYear,
          notes: `Auto-matched to Member ${matchedMember.id} (${matchedMember.full_name})`,
        });
      }
    } else {
      unmatchedCount++;
      unmatchedTransactions.push({
        id: txnId,
        date: dateStr,
        description: descStr,
        reference: refStr,
        amount,
        memberId: '',
        memberName: '',
        status: 'UNMATCHED',
        monthYear: targetMonthYear,
        notes: 'No matching Member ID found in text',
      });
    }
  });

  return {
    totalProcessed: parseResult.data.length,
    matchedCount,
    alreadyPaidCount,
    unmatchedCount,
    matchedTransactions,
    unmatchedTransactions,
  };
}
