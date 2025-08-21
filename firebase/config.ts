// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-T4UeiL4SFNaPN9wsXG4JrswmkOiesH4",
  authDomain: "fogsly-57a8e.firebaseapp.com",
  projectId: "fogsly-57a8e",
  storageBucket: "fogsly-57a8e.firebasestorage.app",
  messagingSenderId: "485284662146",
  appId: "1:485284662146:web:e143414f536737cd8d1d9b",
  measurementId: "G-BK08MG162K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
