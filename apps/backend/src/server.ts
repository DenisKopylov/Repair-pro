// apps/backend/src/server.ts

import { createApp } from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost/auto_parts";

const bootstrap = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[backend] MongoDB connected: ${MONGODB_URI}`);

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[backend] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[backend] Failed to start", err);
    process.exit(1);
  }
};
bootstrap();