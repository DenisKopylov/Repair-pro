"use strict";
// apps/backend/src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const orders_route_1 = __importDefault(require("./routes/orders.route"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Настраиваем CORS, чтобы фронтенд (http://localhost:3000) мог делать запросы с авторизацией
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000"], // сюда добавьте ваш фронтенд, если деплоите
        credentials: true,
    }));
    app.use(express_1.default.json());
    // Простейший health-check
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    // Подключаем роуты аутентификации
    // POST /auth/register, POST /auth/login
    app.use("/auth", auth_route_1.default);
    // Подключаем роуты заказов
    // Внутри ordersRouter уже есть свою аутентификация/авторизация
    app.use("/orders", orders_route_1.default);
    return app;
};
exports.createApp = createApp;
