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
      origin: ["http://localhost:3000"], // сюда добавьте ваш фронтенд, если деплоите
      credentials: true,
    })
  );

  app.use(express.json());

  // Простейший health-check
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Подключаем роуты аутентификации
  // POST /auth/register, POST /auth/login
  app.use("/auth", authRouter);

  // Подключаем роуты заказов
  // Внутри ordersRouter уже есть свою аутентификация/авторизация
  app.use("/orders", ordersRouter);

  return app;
};