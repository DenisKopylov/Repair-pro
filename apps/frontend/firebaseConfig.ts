// apps/frontend/firebaseConfig.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
  type Analytics,
} from 'firebase/analytics';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDtGZxT731ZvFQvlTi5PM1A8FbS4X8hCHA",
  authDomain: "repair-project-dbf11.firebaseapp.com",
  projectId: "repair-project-dbf11",
  storageBucket: "repair-project-dbf11.firebasestorage.app",
  messagingSenderId: "803740653297",
  appId: "1:803740653297:web:40c6c84bf262c905f7fb50",
  measurementId: "G-5KMM8355NH"
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
