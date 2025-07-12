// apps/backend/src/routes/orders.route.ts

import { Router, Request, Response, NextFunction } from 'express';
import eh from 'express-async-handler';
import { auth, requireAdmin } from '../middlewares/auth';
import {
  listOrders,
  createOrder,
  getOrder,
  updateOrder,
} from '../models/Order';

const router = Router();

/* ───────────── Helpers ─────────────── */

function buildFilter(req: Request) {
  const isAdmin = req.user?.role === 'ADMIN' && req.query.all === 'true';
  const uid     = req.user?.uid;
  const filter: any = isAdmin ? {} : { uid };

  if (req.query.search)   filter.clientName = String(req.query.search).trim();
  if (req.query.status)   filter.status     = req.query.status;
  if (req.query.partType) filter.partType   = req.query.partType;
  if (req.query.from)     filter.from       = new Date(String(req.query.from));
  if (req.query.to)       filter.to         = new Date(String(req.query.to));

  return filter;
}

/* ─────────────── Routes ─────────────── */

// GET /api/orders
router.get(
  '/',
  auth,
  eh(async (req: Request, res: Response): Promise<void> => {
    const filter = buildFilter(req);

    let sortField: 'createdAt' | 'repairPrice' = 'createdAt';
    let sortDir: 'asc' | 'desc'               = 'desc';
    switch (req.query.sort) {
      case 'dateAsc':   sortDir = 'asc';          break;
      case 'priceAsc':  sortField = 'repairPrice'; sortDir = 'asc'; break;
      case 'priceDesc': sortField = 'repairPrice'; break;
    }

    const orders = await listOrders(filter, sortField, sortDir);
    res.json(orders);                 // ничего не возвращаем
  })
);

// POST /api/orders
router.post(
  '/',
  auth,
  eh(async (req: Request, res: Response): Promise<void> => {
    const uid        = req.user!.uid;
    const clientName = req.user!.name ?? req.user!.email ?? 'Unknown';
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
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  auth,
  eh(async (req: Request, res: Response): Promise<void> => {
    const order = await getOrder(req.params.id);
    if (!order) { res.sendStatus(404); return; }

    if (req.user!.role !== 'ADMIN' && String(order.uid) !== String(req.user!.uid)) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    res.json(order);
  })
);

// PATCH /api/orders/:id  (админ предлагает цену)
router.patch(
  '/:id',
  auth,
  requireAdmin,
  eh(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { defectPrice, repairPrice, workHours } = req.body;

    const updated = await updateOrder(id, {
      defectPrice,
      repairPrice,
      workHours,
      status: 'OFFERED',
    });

    if (!updated) { res.sendStatus(404); return; }
    res.json(updated);
  })
);

// POST /api/orders/:id/confirm  (клиент принимает/отклоняет)
router.post(
  '/:id/confirm',
  auth,
  eh(async (req: Request, res: Response): Promise<void> => {
    const order = await getOrder(req.params.id);
    if (!order) { res.sendStatus(404); return; }

    if (String(order.uid) !== String(req.user!.uid)) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    const ok      = req.body.ok === true;
    const newStatus = ok ? 'CONFIRMED' : 'DECLINED';

    // ✓ ID гарантированно строка
    const updated = await updateOrder(req.params.id, { status: newStatus });

    res.json(updated);
  })
);

// PUT /api/orders/:id  (админ обновляет произвольные поля)
router.put(
  '/:id',
  auth,
  requireAdmin,
  eh(async (req: Request, res: Response): Promise<void> => {
    const updated = await updateOrder(req.params.id, req.body);
    if (!updated) { res.sendStatus(404); return; }
    res.json(updated);
  })
);
