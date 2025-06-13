"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
// apps/backend/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const orders_route_1 = __importDefault(require("./routes/orders.route"));
const createApp = () => {
    const app = (0, express_1.default)();
    // ───────────────
    // Динамический CORS из переменной среды
    // В apphosting.yaml определите:
    //   FRONTEND_ORIGINS="http://localhost:3000,https://repair-project-dbf11.web.app"
    const origins = (process.env.FRONTEND_ORIGINS || "")
        .split(",")
        .map(u => u.trim())
        .filter(Boolean);
    app.use((0, cors_1.default)({
        origin: origins,
        credentials: true,
    }));
    // ───────────────
    app.use(express_1.default.json());
    // Простейшие health-checks
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    app.get("/healthz", (_req, res) => res.sendStatus(200));
    // Роуты аутентификации
    app.use("/auth", auth_route_1.default);
    // Роуты заказов
    app.use("/orders", orders_route_1.default);
    return app;
};
exports.createApp = createApp;
