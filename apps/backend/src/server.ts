// apps/backend/src/server.ts
import dotenv from 'dotenv';

dotenv.config();

import './lib/db';
import { createApp } from './app';

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap() {
  const app = createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[backend] listening on port ${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[backend] Failed to start', err);
  process.exit(1);
});