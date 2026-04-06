import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDnAjK1ynhqZn2XuhIp1LxzpMvOAZakGY",
  authDomain: "obu-student-system.firebaseapp.com",
  projectId: "obu-student-system",
  storageBucket: "obu-student-system.firebasestorage.app",
  messagingSenderId: "798203108126",
  appId: "1:798203108126:web:ca5845371226e24f67070f"
};

// 1. Main App Instances (For rendering and querying)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 2. Secondary App Instance 
// CRITICAL: Used exclusively for creating users without logging out the Admin
const secondaryApp = getApps().filter(app => app.name === "SecondaryApp").length 
  ? getApp("SecondaryApp") 
  : initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export { db, storage, auth, secondaryAuth };
