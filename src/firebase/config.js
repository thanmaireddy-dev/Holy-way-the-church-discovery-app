import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// My web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACSmOPb8_An_eyflC1bfhFGQuYRsY2cCg",
  authDomain: "holy-way-9800e.firebaseapp.com",
  projectId: "holy-way-9800e",
  storageBucket: "holy-way-9800e.firebasestorage.app",
  messagingSenderId: "311183152434",
  appId: "1:311183152434:web:ae5b654af53354d2e3332b"
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Fallback if auth is already initialized (e.g., during fast refresh)
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
