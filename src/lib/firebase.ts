import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase Config - API Key:', firebaseConfig.apiKey);
console.log('Firebase Config - Auth Domain:', firebaseConfig.authDomain);
console.log('Firebase Config - Project ID:', firebaseConfig.projectId);
console.log('Firebase Config - Storage Bucket:', firebaseConfig.storageBucket);
console.log('Firebase Config - Messaging Sender ID:', firebaseConfig.messagingSenderId);
console.log('Firebase Config - App ID:', firebaseConfig.appId);
console.log('Firebase Config - Measurement ID:', firebaseConfig.measurementId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); 
