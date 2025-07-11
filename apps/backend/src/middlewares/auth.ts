// apps/backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

export async function auth(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });

  try {
  const decoded = await getAdminAuth().verifyIdToken(token);

  // адаптуємо payload до старої схеми
  req.user = {
    _id: decoded.uid,
    name: decoded.name || decoded.email || 'No name',
    role: decoded.role || 'CLIENT',
    ...decoded,
  };

  return next();
} catch (e) {
  console.error('verifyIdToken error', e);
  return res.status(401).json({ error: 'bad token' });
  }
}

export function requireAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ error: "admin only" });
  next();
}
