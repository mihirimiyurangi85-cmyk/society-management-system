import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

interface RawStatementRow {
  Date?: string;
  date?: string;
  Description?: string;
  description?: string;
  Particulars?: string;
  Reference?: string;
  reference?: string;
  'Transaction Reference'?: string;
  Amount?: string;
  amount?: string;
  'Credit Amount'?: string;
  Type?: string;
}

interface MemberRecord {
  id: string;
  full_name: string;
  status: string;
}

// POST /api/bank/upload-statement
app.post('/api/bank/upload-statement', upload.single('file'), (req: any, res: any) => {
  try {
    let csvText = '';

    if (req.file) {
      csvText = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.csvText) {
      csvText = req.body.csvText;
    } else {
      return res.status(400).json({ error: 'No CSV file or csvText provided in request.' });
    }

    const parseResult = Papa.parse<RawStatementRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ error: 'Failed to parse CSV file', details: parseResult.errors });
    }

    const members: MemberRecord[] = req.body.members ? JSON.parse(req.body.members) : [];
    const paidMemberMonthKeys: string[] = req.body.paidKeys ? JSON.parse(req.body.paidKeys) : [];
    const targetMonthYear = req.body.monthYear || new Date().toISOString().slice(0, 7);

    const matchedTransactions: any[] = [];
    const unmatchedTransactions: any[] = [];
    let matchedCount = 0;
    let alreadyPaidCount = 0;
    let unmatchedCount = 0;

    parseResult.data.forEach((row, index) => {
      const dateStr = row.Date || row.date || new Date().toISOString().split('T')[0];
      const descStr = row.Description || row.description || row.Particulars || 'Bank Transaction';
      const refStr = row.Reference || row.reference || row['Transaction Reference'] || `REF-${index + 1}`;
      const rawAmt = row.Amount || row.amount || row['Credit Amount'] || '0';
      const amount = Math.abs(parseFloat(rawAmt.replace(/[^0-9.-]+/g, '')) || 0);

      // Regex matching for Member IDs (e.g. M001, M002, M045, M250)
      const idMatch = descStr.match(/(M\d{3})/i) || refStr.match(/(M\d{3})/i);
      let matchedMember: MemberRecord | undefined = undefined;

      if (idMatch) {
        const foundId = idMatch[1].toUpperCase();
        matchedMember = members.find((m) => m.id.toUpperCase() === foundId);
      }

      // Secondary match by member full name if ID not explicitly present in text
      if (!matchedMember) {
        matchedMember = members.find(
          (m) => m.full_name && descStr.toLowerCase().includes(m.full_name.toLowerCase())
        );
      }

      const txnId = `STMT-${Date.now()}-${index + 1}`;

      if (matchedMember) {
        const paidKey = `${matchedMember.id}_${targetMonthYear}`;
        const isAlreadyPaid = paidMemberMonthKeys.includes(paidKey);

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
            notes: `Member ${matchedMember.id} already paid for ${targetMonthYear}`,
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
          notes: 'No matching Member ID found in transaction text',
        });
      }
    });

    return res.json({
      totalProcessed: parseResult.data.length,
      matchedCount,
      alreadyPaidCount,
      unmatchedCount,
      matchedTransactions,
      unmatchedTransactions,
    });
  } catch (error: any) {
    console.error('Error processing bank statement upload:', error);
    return res.status(500).json({ error: error.message || 'Internal server error processing CSV statement' });
  }
});

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', service: 'Society Welfare Bank Statement Parser API' });
});

app.listen(port, () => {
  console.log(`🚀 Bank Statement Backend API listening on http://localhost:${port}`);
});
