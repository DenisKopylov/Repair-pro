// apps/backend/src/routes/orders.route.ts

import { Router } from 'express';
import { auth, requireAdmin } from '../middlewares/auth';
import { createOrder, getOrder, updateOrder, listOrders } from '../models/Order';
const router = Router();

function buildFilter(req: any) {
  const isAdmin = req.user?.role === 'ADMIN' && req.query.all === 'true';
  const uid = req.user?.uid;
  const filter: any = isAdmin ? {} : { uid };


  if (req.query.search) {
    const s = String(req.query.search).trim();
    filter.clientName = s;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.partType) filter.partType = req.query.partType;
  if (req.query.from) filter.from = new Date(String(req.query.from));
  if (req.query.to) filter.to = new Date(String(req.query.to));

  return filter;
}

router.get('/', auth, async (req: any, res) => {
  try {
    // 1) Построим фильтр через helper
    const filter = buildFilter(req);

    let sortField = 'createdAt';
    let sortDir: 'asc' | 'desc' = 'desc';
    switch (req.query.sort) {
       case 'dateAsc':
        sortDir = 'asc';
        break;
        case 'priceAsc':
          sortField = 'repairPrice';
          sortDir = 'asc';
        break;
        case 'priceDesc':
        sortField = 'repairPrice';
        break;
    }
    const orders = await listOrders(filter, sortField, sortDir);
    res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/', auth, async (req: any, res) => {
  try {
    const uid = req.user.uid;
    const clientName = req.user.name ?? req.user.email;
    const { partType, description, images } = req.body;

    const newOrder = await createOrder({
      uid,
      clientName,
      partType,
      description,
      images,
      status: 'NEW',
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const order = await getOrder(id);
    if (!order) return res.sendStatus(404);

    if (req.user.role !== 'ADMIN' && String(order.uid) !== String(req.user.uid)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    res.json(order);
  } catch (err) {
    console.error(`GET /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: 'server error' });
  }
});

router.patch('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { defectPrice, repairPrice, workHours } = req.body;
    const updated = await updateOrder(id, { defectPrice, repairPrice, workHours, status: 'OFFERED' });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    console.error(`PATCH /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/:id/confirm', auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const order = await getOrder(id);
    if (!order) return res.sendStatus(404);

    if (String(order.uid) !== String(req.user.uid)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const ok = req.body.ok === true;
    const newStatus = ok ? 'CONFIRMED' : 'DECLINED';
    const updated = await updateOrder(id, { status: newStatus });
    res.json(updated);
  } catch (err) {
    console.error(`POST /orders/${req.params.id}/confirm error:`, err);
    res.status(500).json({ error: 'server error' });
  }
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateOrder(id, req.body);
    if (!updated) return res.sendStatus(404);

    res.json(updated);
  } catch (err) {
    console.error(`PUT /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;