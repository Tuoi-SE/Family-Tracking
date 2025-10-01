import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo } from './config/db';
import { User } from './models/User';
import authRoutes from './routes/authRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AuthTokenPayload = { sub: string; role: 'admin' | 'user'; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = Number(process.env.PORT || 4000);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/family-tracking';
connectMongo(MONGODB_URI).catch(err => console.error('Mongo error', err));

// Ensure at least one admin exists
(async () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin1234';
  const exists = await User.findOne({ email: adminEmail }).lean();
  if (!exists) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    await User.create({ email: adminEmail, passwordHash, role: 'admin' });
    console.log('Seeded admin user:', adminEmail);
  }
})();

function signToken(user: { id: string; email: string; role: 'admin' | 'user' }): string {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded as AuthTokenPayload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role: 'admin' | 'user') {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, role } = (req.body || {}) as { email?: string; password?: string; role?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const normalizedRole: 'admin' | 'user' = role === 'admin' ? 'admin' : 'user';
  (async () => {
    try {
      const existing = await User.findOne({ email }).lean();
      if (existing) return res.status(409).json({ message: 'Email already exists' });
      const passwordHash = bcrypt.hashSync(password, 10);
      const created = await User.create({ email, passwordHash, role: normalizedRole });
      const user = { id: String(created._id), email: created.email, role: created.role };
      const token = signToken(user);
      return res.json({ token, user });
    } catch (e) {
      return res.status(500).json({ message: 'DB error' });
    }
  })();
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  (async () => {
    try {
      const row = await User.findOne({ email });
      if (!row) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = bcrypt.compareSync(password, row.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
      const user = { id: String(row._id), email: row.email, role: row.role };
      const token = signToken(user);
      return res.json({ token, user });
    } catch (e) {
      return res.status(500).json({ message: 'DB error' });
    }
  })();
});

// Me
app.get('/api/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const row = await User.findById(req.user!.sub).select('email role createdAt');
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ user: { id: String(row._id), email: row.email, role: row.role, created_at: row.createdAt } });
  } catch {
    return res.status(500).json({ message: 'DB error' });
  }
});

// Admin-only list users
app.get('/api/admin/users', authMiddleware, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const rows = await User.find().select('email role createdAt').sort({ createdAt: -1 }).lean();
    res.json({ users: rows.map(r => ({ id: String(r._id), email: r.email, role: r.role, created_at: r.createdAt })) });
  } catch {
    return res.status(500).json({ message: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// mount routes under /api
app.use('/api', authRoutes);


