"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrder = getOrder;
exports.updateOrder = updateOrder;
exports.listOrders = listOrders;
// apps/backend/src/models/Order.ts
const db_1 = require("../lib/db");
const collection = db_1.db.collection('orders');
async function createOrder(data) {
    const docRef = await collection.add({ ...data, createdAt: new Date(), updatedAt: new Date() });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
}
async function getOrder(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists)
        return null;
    return { id: doc.id, ...doc.data() };
}
async function updateOrder(id, data) {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists)
        return null;
    await ref.update({ ...data, updatedAt: new Date() });
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() };
}
async function listOrders(filter, sortField, sortDir) {
    let q = collection;
    if (filter.userId)
        q = q.where('userId', '==', filter.userId);
    if (filter.status)
        q = q.where('status', '==', filter.status);
    if (filter.partType)
        q = q.where('partType', '==', filter.partType);
    if (filter.clientName)
        q = q.where('clientName', '>=', filter.clientName).where('clientName', '<=', filter.clientName + '\uf8ff');
    if (filter.from)
        q = q.where('createdAt', '>=', filter.from);
    if (filter.to)
        q = q.where('createdAt', '<=', filter.to);
    q = q.orderBy(sortField, sortDir);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
