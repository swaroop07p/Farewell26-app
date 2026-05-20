import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWLs0Ly92UjNmJVECpKIeahanAq52fAZs",
  authDomain: "farewell2026-5d936.firebaseapp.com",
  projectId: "farewell2026-5d936",
  storageBucket: "farewell2026-5d936.firebasestorage.app",
  messagingSenderId: "801693931771",
  appId: "1:801693931771:web:089a1d11ae88e44c8d385e",
  measurementId: "G-R2WNCJ7JR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (The real-time database)
export const db = getFirestore(app);