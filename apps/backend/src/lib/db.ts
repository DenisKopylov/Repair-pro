// apps/backend/src/lib/db.ts
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// When running against the Firestore emulator, credentials are not required.
// Check for FIRESTORE_EMULATOR_HOST to decide whether to use applicationDefault
// or initialize with a minimal config containing only projectId.
if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = process.env.GCLOUD_PROJECT || 'demo-test';
    initializeApp({ projectId });
  } else {
    initializeApp({ credential: applicationDefault() }); // без databaseURL!
  }
  
export const db = getFirestore();

// залючаємо ігнорування undefined для Firestore
db.settings({ ignoreUndefinedProperties: true });