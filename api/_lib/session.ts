import jwt from 'jsonwebtoken';
import type { VercelRequest } from './http';
export function session(req: VercelRequest): { id: number; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ') || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(auth.slice(7), process.env.JWT_SECRET) as { id: number; role: string }; }
  catch { return null; }
}
