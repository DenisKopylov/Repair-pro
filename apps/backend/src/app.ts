// apps/backend/src/app.ts
import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders.route";
import statsRouter from "./routes/stats.route";

export const createApp = () => {
  const app = express();

  // ───────────────
  // Динамический CORS из переменной среды
  // В apphosting.yaml определите:
  //   FRONTEND_ORIGINS="http://localhost:3000,https://repair-project-dbf11.web.app"
  const origins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map(u => u.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  );
  // ───────────────

  app.use(express.json());

  // Собираем все API-роуты под /api
  const api = express.Router();
  api.use("/orders", ordersRouter);
  api.use("/stats", statsRouter);

  app.use("/api", api);

  // Health-checks (если надо, можно добавить /api/health здесь)
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/healthz", (_req, res) => res.sendStatus(200));

  return app;};