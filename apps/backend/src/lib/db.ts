// apps/backend/src/lib/db.ts
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() }); // без databaseURL!
export const db = getFirestore();
