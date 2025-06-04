// apps/backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function auth(req: any, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token  = header.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "no token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);   // { _id, role, name }
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
