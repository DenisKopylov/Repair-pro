// apps/backend/src/routes/orders.route.ts

import { Router } from "express";
import { Order } from "../models/Order";
import { auth, requireAdmin } from "../middlewares/auth";
import mongoose from "mongoose";

const router = Router();

/* ------------------ HELPERS ------------------ */

function buildFilter(req: any) {
  // Если админ и запросил all=true, то он видит все заказы
  const isAdmin = req.user?.role === "ADMIN" && req.query.all === "true";

  // Если НЕ админ (или админ, но не передал all=true) — фильтруем по userId
  const userId = req.user?._id;
  const filter: any = isAdmin ? {} : { userId };

  /* --- поиск по тексту (clientName или по _id заказа) */
  if (req.query.search) {
    const s = String(req.query.search).trim();
    // Делаем поиск либо по полю clientName, либо по точному _id (если введён полный id)
    filter.$or = [
      { clientName: { $regex: s, $options: "i" } },
      { _id: mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : null }
    ].filter((clause) => clause._id !== null);
  }

  /* --- фильтр по статусу / типу детали */
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.partType) filter.partType = req.query.partType;

  /* --- диапазон дат (ISO-строки YYYY-MM-DD) */
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(String(req.query.from));
    if (req.query.to)   filter.createdAt.$lte = new Date(String(req.query.to));
  }

  return filter;
}

/* -------- 1. Список заказов + фильтры + сортировка -------------------- */
// Доступно любому залогиненному
router.get("/", auth, async (req: any, res) => {
  try {
    // 1) Построим фильтр через helper
    const filter = buildFilter(req);

    // 2) Определим сортировку
    let sort: Record<string, 1 | -1> = { createdAt: -1 }; // по умолчанию дата DESC
    switch (req.query.sort) {
      case "dateAsc":
        sort = { createdAt: 1 };
        break;
      case "priceAsc":
        sort = { repairPrice: 1 };
        break;
      case "priceDesc":
        sort = { repairPrice: -1 };
        break;
      // можно добавить другие варианты сортировки при необходимости
    }

    const orders = await Order.find(filter).sort(sort);
    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* -------- 2. Создать заказ ----------------- */
// Доступно любому залогиненному (USER или ADMIN)
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user._id; // берём из JWT
    const clientName = req.user.name; // при желании сохраняем имя клиента
    const { partType, description, images } = req.body;

    // Создаём новый заказ, привязанный к userId
    const newOrder = await Order.create({
      userId,
      clientName,
      partType,
      description,
      images,
      status: "NEW",
      createdAt: new Date(),
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* -------- 3. Получить один заказ -------------------- */
// Доступно любому залогиненному, но только если пользователь — владелец заказа или ADMIN
router.get("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(400);

    const order = await Order.findById(id);
    if (!order) return res.sendStatus(404);

    // Если текущий пользователь — не админ и не владелец, то запрет
    if (req.user.role !== "ADMIN" && String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error(`GET /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: "server error" });
  }
});

/* -------- 4. Админ выставляет условия (PATCH) ------ */
// Только ADMIN может устанавливать цены и переводить статус заказа в OFFERED
router.patch("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(400);

    const { defectPrice, repairPrice, workHours } = req.body;
    const updated = await Order.findByIdAndUpdate(
      id,
      { defectPrice, repairPrice, workHours, status: "OFFERED" },
      { new: true }
    );
    if (!updated) return res.sendStatus(404);

    res.json(updated);
  } catch (err) {
    console.error(`PATCH /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: "server error" });
  }
});

/* -------- 5. Клиент подтверждает / отказывается ------ */
// Доступно только авторизованному пользователю (USER), который является владельцем заказа
router.post("/:id/confirm", auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(400);

    const order = await Order.findById(id);
    if (!order) return res.sendStatus(404);

    // Проверяем, что текущий пользователь — владелец заказа
    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: "forbidden" });
    }

    const ok = req.body.ok === true;
    const newStatus = ok ? "CONFIRMED" : "DECLINED";
    order.status = newStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(`POST /orders/${req.params.id}/confirm error:`, err);
    res.status(500).json({ error: "server error" });
  }
});

/* -------- 6. Полное обновление заказа (PUT) ------ */
// Обычно этот маршрут нужен только ADMIN. Если действительно нужен пользователю, можно убрать requireAdmin
router.put("/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(400);

    const updated = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.sendStatus(404);

    res.json(updated);
  } catch (err) {
    console.error(`PUT /orders/${req.params.id} error:`, err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;