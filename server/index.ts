import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const app = express();
const port = process.env.PORT || 5001;
const jwtSecret = process.env.JWT_SECRET || 'development-only-secret-change-me';

app.use(cors());
app.use(express.json());

interface AuthUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'MEMBER';
  member_id?: string;
  full_name: string;
  created_at: string;
}

const users: AuthUser[] = [];
const usersFilePath = path.join(process.cwd(), 'server', 'data', 'users.json');

const persistUsers = async () => {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
};

const publicUser = (user: AuthUser) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  password_hash: '',
  role: user.role,
  member_id: user.member_id,
  full_name: user.full_name,
  created_at: user.created_at,
});

const seedAuthUsers = async () => {
  try {
    const storedUsers = JSON.parse(await fs.readFile(usersFilePath, 'utf-8')) as AuthUser[];
    users.push(...storedUsers);
    return;
  } catch {
    users.push(
      {
        id: 'USR-001',
        username: 'admin',
        email: 'admin@society.local',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        full_name: 'Super Admin (Kamal Perera)',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'USR-002',
        username: 'M001',
        email: 'm001@society.local',
        passwordHash: await bcrypt.hash('member123', 10),
        role: 'MEMBER',
        member_id: 'M001',
        full_name: 'John Silva',
        created_at: '2026-01-01T00:00:00Z',
      },
    );
    try {
      await persistUsers();
    } catch (error) {
      console.warn('Initial user persistence unavailable:', error);
    }
  }
};

const authReady = seedAuthUsers();

app.use(async (_req, _res, next) => {
  await authReady;
  next();
});

app.post(['/api/register', '/register'], async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username is already registered.' });
  }

  const user: AuthUser = {
    id: `USR-${String(users.length + 1).padStart(3, '0')}`,
    username,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'MEMBER',
    full_name: username,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  try {
    await persistUsers();
  } catch (error) {
    // Serverless filesystems can be read-only; the account remains available for this instance.
    console.warn('User persistence unavailable:', error);
  }

  return res.status(201).json({ message: 'Registration successful.', user: publicUser(user) });
});

app.post(['/api/login', '/login'], async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = users.find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, {
    expiresIn: '1d',
  });
  return res.json({ token, user: publicUser(user) });
});

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
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ status: 'OK', service: 'Society Welfare Bank Statement Parser API' });
});

if (process.env.VERCEL !== '1') {
  authReady.then(() => {
  app.listen(port, () => {
    console.log(`Bank Statement Backend API listening on http://localhost:${port}`);
  });
  });
}

export default app;
