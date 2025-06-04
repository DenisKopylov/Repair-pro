// apps/backend/src/routes/auth.route.ts
import { Router } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";   // вынесите в .env

/* -------- POST /auth/register ----------------------------- */
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "email, password, name required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "email already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });

  res.status(201).json({ ok: true });
});

/* -------- POST /auth/login -------------------------------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "invalid creds" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid creds" });

  const token = jwt.sign(
    { _id: user._id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

export default router;
