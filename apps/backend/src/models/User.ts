// apps/backend/src/models/User.ts
import { db } from '../lib/db';

export type UserRole = 'USER' | 'ADMIN';

export interface IUser {
  id?: string;
  email: string;
  passwordHash: string;
  name: string; // = future clientName
  role: UserRole;
  createdAt?: Date;
}

const collection = db.collection('users');

export async function findUserByEmail(email: string): Promise<IUser | null> {
  const snap = await collection.where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<IUser, 'id'>) };
}

export async function createUser(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
  const docRef = await collection.add({ ...data, createdAt: new Date() });
  const doc = await docRef.get();
  return { id: doc.id, ...(doc.data() as Omit<IUser, 'id'>) };
}
