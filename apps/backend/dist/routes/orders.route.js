"use strict";
// apps/backend/src/routes/orders.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
function buildFilter(req) {
    const isAdmin = req.user?.role === 'ADMIN' && req.query.all === 'true';
    const userId = req.user?._id;
    const filter = isAdmin ? {} : { userId };
    if (req.query.search) {
        const s = String(req.query.search).trim();
        filter.clientName = s;
    }
    if (req.query.status)
        filter.status = req.query.status;
    if (req.query.partType)
        filter.partType = req.query.partType;
    if (req.query.from)
        filter.from = new Date(String(req.query.from));
    if (req.query.to)
        filter.to = new Date(String(req.query.to));
    return filter;
}
router.get('/', auth_1.auth, async (req, res) => {
    try {
        // 1) Построим фильтр через helper
        const filter = buildFilter(req);
        let sortField = 'createdAt';
        let sortDir = 'desc';
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
        const orders = await (0, Order_1.listOrders)(filter, sortField, sortDir);
        res.json(orders);
    }
    catch (err) {
        console.error('GET /orders error:', err);
        res.status(500).json({ error: 'server error' });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const clientName = req.user.name;
        const { partType, description, images } = req.body;
        const newOrder = await (0, Order_1.createOrder)({
            userId,
            clientName,
            partType,
            description,
            images,
            status: 'NEW',
        });
        res.status(201).json(newOrder);
    }
    catch (err) {
        console.error('POST /orders error:', err);
        res.status(500).json({ error: 'server error' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await (0, Order_1.getOrder)(id);
        if (!order)
            return res.sendStatus(404);
        if (req.user.role !== 'ADMIN' && String(order.userId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'forbidden' });
        }
        res.json(order);
    }
    catch (err) {
        console.error(`GET /orders/${req.params.id} error:`, err);
        res.status(500).json({ error: 'server error' });
    }
});
router.patch('/:id', auth_1.auth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { defectPrice, repairPrice, workHours } = req.body;
        const updated = await (0, Order_1.updateOrder)(id, { defectPrice, repairPrice, workHours, status: 'OFFERED' });
        if (!updated)
            return res.sendStatus(404);
        res.json(updated);
    }
    catch (err) {
        console.error(`PATCH /orders/${req.params.id} error:`, err);
        res.status(500).json({ error: 'server error' });
    }
});
router.post('/:id/confirm', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await (0, Order_1.getOrder)(id);
        if (!order)
            return res.sendStatus(404);
        if (String(order.userId) !== String(req.user._id)) {
            return res.status(403).json({ error: 'forbidden' });
        }
        const ok = req.body.ok === true;
        const newStatus = ok ? 'CONFIRMED' : 'DECLINED';
        const updated = await (0, Order_1.updateOrder)(id, { status: newStatus });
        res.json(updated);
    }
    catch (err) {
        console.error(`POST /orders/${req.params.id}/confirm error:`, err);
        res.status(500).json({ error: 'server error' });
    }
});
router.put('/:id', auth_1.auth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await (0, Order_1.updateOrder)(id, req.body);
        if (!updated)
            return res.sendStatus(404);
        res.json(updated);
    }
    catch (err) {
        console.error(`PUT /orders/${req.params.id} error:`, err);
        res.status(500).json({ error: 'server error' });
    }
});
exports.default = router;
