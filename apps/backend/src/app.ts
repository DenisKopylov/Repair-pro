// apps/backend/src/app.ts
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import ordersRouter from "./routes/orders.route";

export const createApp = () => {
  const app = express();

  // Настраиваем CORS, чтобы фронтенд (http://localhost:3000) мог делать запросы с авторизацией
  app.use(
    cors({
      origin: ["http://localhost:3000"], // сюда добавьте ваш фронтенд, когда деплоите
      credentials: true,
    })
  );

  app.use(express.json());

  // Простейшие health-checks
  app.get("/health",  (_req, res) => res.json({ status: "ok" }));      // для ручного теста
  app.get("/healthz", (_req, res) => res.sendStatus(200));             // для Cloud Run

  // Роуты аутентификации
  // POST /auth/register, POST /auth/login
  app.use("/auth", authRouter);

  // Роуты заказов
  app.use("/orders", ordersRouter);

  return app;
};