// apps/backend/src/middlewares/auth.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

export const auth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;
  if (!token) {
    return res.status(401).json({ error: "no token" });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);

    // Вариант 2: «вынесли» uid, name, role и email, всё остальное — в rest
    const { uid, name, role, email, ...rest } = decoded;

    req.user = {
      
      ...rest,

      uid,
      name: name || email || "No name",
      role: role || "CLIENT",
      email,
    };

    return next();
  } catch (e) {
    console.error("verifyIdToken error", e);
    return res.status(401).json({ error: "bad token" });
  }
};

export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "admin only" });
  }
  next();
};