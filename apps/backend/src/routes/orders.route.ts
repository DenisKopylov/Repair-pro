import { Router } from 'express';
import { Order } from '../models/Order';

const router = Router();

// GET /orders
router.get('/', async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// POST /orders
router.post('/', async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// PUT /orders/:id
router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

export default router;
