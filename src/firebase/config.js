// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeI91rvD5mPGmUxAtfshYQ4eYRTIsWl7Y",
  authDomain: "restaurant-management-sy-17ce6.firebaseapp.com",
  projectId: "restaurant-management-sy-17ce6",
  storageBucket: "restaurant-management-sy-17ce6.firebasestorage.app",
  messagingSenderId: "62570885351",
  appId: "1:62570885351:web:4dcf8efea0f0ee8c387242",
  measurementId: "G-Q2ZC9NE3RQ"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;