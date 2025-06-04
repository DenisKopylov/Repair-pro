import { Router } from "express";
import { Order } from "../models/Order";

const router = Router();

/* ------------------ HELPERS ------------------ */
function buildFilter(req: any) {
  const isAdmin = req.query.all === "true";
  const userId  = req.headers["x-user-id"];

  const q: any = isAdmin ? {} : { userId };

  /* --- текстовый поиск --------------------- */
  if (req.query.search) {
    const s = String(req.query.search).trim();
    q.$or = [
      { clientName: { $regex: s, $options: "i" } },   // Auto Repair Center
      { _id:        s },                              // 665f6… (полный id)
    ];
  }

  /* --- фильтр по статусу / типу ------------ */
  if (req.query.status)    q.status    = req.query.status;
  if (req.query.partType)  q.partType  = req.query.partType;

  /* --- диапазон дат (ISO-строки YYYY-MM-DD) */
  if (req.query.from || req.query.to) {
    q.createdAt = {};
    if (req.query.from) q.createdAt.$gte = new Date(req.query.from as string);
    if (req.query.to)   q.createdAt.$lte = new Date(req.query.to as string);
  }

  return q;
}

/* -------- 1. Список заказов + фильтры + сортировка -------------------- */
router.get("/", async (req, res) => {
  /* 1. фильтр (как раньше) */
  const filter = buildFilter(req);

  /* 2. сортировка */
  let sort: Record<string, 1 | -1> = { createdAt: -1 };           // default = dateDesc
  switch (req.query.sort) {
    case "dateAsc":
      sort = { createdAt: 1 };
      break;

    // ─── сортировка по стоимости ───────────────────────────────
    //   по какому полю?  ▸ только цена ремонта (repairPrice)
    //   или ▸ сумма defectPrice+repairPrice?
    //   Ниже пример по repairPrice.
    case "priceAsc":
      sort = { repairPrice: 1 };
      break;
    case "priceDesc":
      sort = { repairPrice: -1 };
      break;
  }

  const orders = await Order.find(filter).sort(sort);
  res.json(orders);
});


/* -------- 2. Создать заказ ----------------- */
router.post("/", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const order  = await Order.create({ ...req.body, userId, status: "NEW" });
  res.status(201).json(order);
});

/* -------- 3. Один заказ -------------------- */
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.sendStatus(404);
  res.json(order);
});

/* -------- 4. Админ выставляет условия ------ */
router.patch("/:id", async (req, res) => {
  const { defectPrice, repairPrice, workHours } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { defectPrice, repairPrice, workHours, status: "OFFERED" },
    { new: true },
  );
  if (!order) return res.sendStatus(404);
  res.json(order);
});

/* -------- 5. Клиент подтверждает / отказывает */
router.post("/:id/confirm", async (req, res) => {
  const ok     = req.body.ok === true;
  const status = ok ? "CONFIRMED" : "DECLINED";
  const order  = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!order) return res.sendStatus(404);
  res.json(order);
});

/* -------- 6. Полный update (если нужен) ---- */
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.sendStatus(404);
  res.json(order);
});

export default router;
