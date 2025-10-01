import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthTokenPayload = { sub: string; role: 'admin' | 'user'; email: string };

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
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

export function requireRole(role: 'admin' | 'user') {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}


