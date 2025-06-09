// apps/frontend/firebaseConfig.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
  type Analytics,
} from 'firebase/analytics';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// ---------- ИНИЦИАЛИЗАЦИЯ ТОЛЬКО В БРАУЗЕРЕ -------------
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);

  // analytics по-желанию
  analyticsIsSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app!);
  });

  storage = getStorage(app);
}

export { app, analytics, storage };
