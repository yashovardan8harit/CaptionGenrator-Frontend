// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7OTH5QjZacvAGncZDREWLYEL40cV4xgU",
  authDomain: "caption-generator-10a8f.firebaseapp.com",
  projectId: "caption-generator-10a8f",
  storageBucket: "caption-generator-10a8f.firebasestorage.app",
  messagingSenderId: "724737293575",
  appId: "1:724737293575:web:d8ef4bef10f189ea5b19a2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
