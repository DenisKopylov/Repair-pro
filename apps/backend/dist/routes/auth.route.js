"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/backend/src/routes/auth.route.ts
const express_1 = require("express");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
/* -------- POST /auth/register ----------------------------- */
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
        return res.status(400).json({ error: 'email, password, name required' });
    const exists = await (0, User_1.findUserByEmail)(email);
    if (exists)
        return res.status(409).json({ error: 'email already used' });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    await (0, User_1.createUser)({ email, passwordHash, name, role: 'USER' });
    res.status(201).json({ ok: true });
});
/* -------- POST /auth/login -------------------------------- */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await (0, User_1.findUserByEmail)(email);
    if (!user)
        return res.status(401).json({ error: 'invalid creds' });
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'invalid creds' });
    const token = jsonwebtoken_1.default.sign({ _id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
});
exports.default = router;
