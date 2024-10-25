import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const firebaseConfig2 = {
  apiKey: process.env.FIREBASE_API_KEY_2,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN_2,
  projectId: process.env.FIREBASE_PROJECT_ID_2,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_2,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_2,
  appId: process.env.FIREBASE_APP_ID_2,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID_2,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const app2 = initializeApp(firebaseConfig2);
export const db = getFirestore(app);
export const db2 = getFirestore(app2);

