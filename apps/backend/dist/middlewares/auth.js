"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.replace("Bearer ", "");
    if (!token)
        return res.status(401).json({ error: "no token" });
    try {
        req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET); // { _id, role, name }
        next();
    }
    catch {
        res.status(401).json({ error: "bad token" });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN")
        return res.status(403).json({ error: "admin only" });
    next();
}
