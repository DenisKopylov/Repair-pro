// apps/frontend/firebaseConfig.ts

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
  type Analytics,
} from 'firebase/analytics';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';  // если будете юзать аутентификацию

const firebaseConfig = {
  apiKey:                process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:             process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:         process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:     process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:                 process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:         process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!, // для analytics
};

let app:      FirebaseApp | undefined;
let analytics: Analytics   | undefined;
let storage:  FirebaseStorage | undefined;
let db:       Firestore    | undefined;
let auth:     Auth         | undefined;

if (typeof window !== 'undefined') {
  // инициализируем только в браузере, чтобы избежать ошибок на сервере
  app = initializeApp(firebaseConfig);

  // Analytics (опционально)
  analyticsIsSupported().then((ok) => {
    if (ok && app) analytics = getAnalytics(app);
  });

  // Storage
  storage = getStorage(app);

  // Firestore
  db = getFirestore(app);

  // Auth (опционально)
  auth = getAuth(app);
}

export { app, analytics, storage, db, auth };