// apps/backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

export async function auth(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });

  try {
    req.user = await getAdminAuth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: "bad token" });
  }
}

export function requireAdmin(req: any, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ error: "admin only" });
  next();
}
