// apps/backend/src/routes/auth.route.ts
import { Router } from 'express';
import { createUser, findUserByEmail } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/* -------- POST /auth/register ----------------------------- */
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password, name required' });

  const exists = await findUserByEmail(email);
  if (exists) return res.status(409).json({ error: 'email already used' });

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({ email, passwordHash, name, role: 'USER' });

  res.status(201).json({ ok: true });
});

/* -------- POST /auth/login -------------------------------- */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid creds' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid creds' });

  const token = jwt.sign(
    { _id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

export default router;
