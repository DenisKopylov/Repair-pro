// apps/backend/src/server.ts

import { createApp } from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// В Cloud Run/Firebase Hosting PORT передаётся как строка, и
// если передать её в app.listen("8080"), сервер попытается
// слушать named pipe, а не TCP-порт.
// Поэтому явно конвертируем в число:
const PORT = Number(process.env.PORT) || 8080;

// URI берём из env или локально подключаемся к Mongo
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost/auto_parts";

async function bootstrap() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[backend] MongoDB connected: ${MONGODB_URI}`);

    const app = createApp();

    // Лучше явно указать, что слушаем на всех интерфейсах
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[backend] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[backend] Failed to start", err);
    process.exit(1);
  }
}

bootstrap();