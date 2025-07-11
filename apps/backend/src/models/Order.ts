// apps/backend/src/models/Order.ts
import { db } from '../lib/db';

export type OrderStatus =
  | 'NEW'
  | 'OFFERED'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'IN_PROGRESS'
  | 'DONE';

export interface IOrder {
  id?: string;
  uid: string;
  clientName: string;
  partType: string;
  description: string;
  status: OrderStatus;
  defectPrice?: number;
  repairPrice?: number;
  workHours?: number;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const collection = db.collection('orders');

export async function createOrder(data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> {
  const docRef = await collection.add({ ...data, createdAt: new Date(), updatedAt: new Date() });
  const doc = await docRef.get();
  return { id: doc.id, ...(doc.data() as Omit<IOrder, 'id'>) };
}

export async function getOrder(id: string): Promise<IOrder | null> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<IOrder, 'id'>) };
}

export async function updateOrder(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
  const ref = collection.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  await ref.update({ ...data, updatedAt: new Date() });
  const updated = await ref.get();
  return { id: updated.id, ...(updated.data() as Omit<IOrder, 'id'>) };
}

export async function listOrders(filter: any, sortField: string, sortDir: 'asc' | 'desc'): Promise<IOrder[]> {
  let q: FirebaseFirestore.Query = collection;
  if (filter.uid) q = q.where('uid', '==', filter.uid);
  if (filter.status) q = q.where('status', '==', filter.status);
  if (filter.partType) q = q.where('partType', '==', filter.partType);
  if (filter.clientName) q = q.where('clientName', '>=', filter.clientName).where('clientName', '<=', filter.clientName + '\uf8ff');
  if (filter.from) q = q.where('createdAt', '>=', filter.from);
  if (filter.to) q = q.where('createdAt', '<=', filter.to);
  q = q.orderBy(sortField, sortDir as any);
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<IOrder, 'id'>) }));
}