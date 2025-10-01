import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export function signToken(user: { id: string; email: string; role: UserRole }) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  const { email, password, role } = (req.body || {}) as { email?: string; password?: string; role?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const normalizedRole: UserRole = role === 'admin' ? 'admin' : 'user';
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
}

export async function login(req: Request, res: Response) {
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
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
}

export async function me(req: Request, res: Response) {
  try {
    const row = await User.findById(req.user!.sub).select('email role createdAt');
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ user: { id: String(row._id), email: row.email, role: row.role, created_at: row.createdAt } });
  } catch {
    return res.status(500).json({ message: 'DB error' });
  }
}

export async function listUsers(_req: Request, res: Response) {
  try {
    const rows = await User.find().select('email role createdAt').sort({ createdAt: -1 }).lean();
    res.json({ users: rows.map(r => ({ id: String(r._id), email: r.email, role: r.role, created_at: r.createdAt })) });
  } catch {
    return res.status(500).json({ message: 'DB error' });
  }
}


