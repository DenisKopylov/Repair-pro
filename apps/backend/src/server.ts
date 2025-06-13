// apps/backend/src/server.ts
import { createApp } from './app';
import dotenv from 'dotenv';
import './lib/db';

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;

async function bootstrap() {
  try {
    
    const app = createApp();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[backend] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[backend] Failed to start', err);
    process.exit(1);
  }
}

bootstrap();