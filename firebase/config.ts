// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUEwOFh2xe2ZKZwkrS7Nru9-HbG0lAqoo",
  authDomain: "fogsly-first.firebaseapp.com",
  projectId: "fogsly-first",
  storageBucket: "fogsly-first.firebasestorage.app",
  messagingSenderId: "555334716330",
  appId: "1:555334716330:web:a00fd19e42462a0ddc39d3",
  measurementId: "G-R18XY2PZV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
