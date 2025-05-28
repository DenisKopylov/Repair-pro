import { createApp } from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost/auto_parts';

const bootstrap = async () => {
  await mongoose.connect(MONGODB_URI);
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[backend] listening on port ${PORT}`);
  });
};
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
