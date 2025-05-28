import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders.route';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok'}));
  app.use('/orders', ordersRouter);

  return app;
};
