import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDnAjK1ynhqZn2XuhIp1LxzpMvOAZakGY",
  authDomain: "obu-student-system.firebaseapp.com",
  projectId: "obu-student-system",
  storageBucket: "obu-student-system.firebasestorage.app",
  messagingSenderId: "798203108126",
  appId: "1:798203108126:web:ca5845371226e24f67070f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Attempting to create admin account...");

createUserWithEmailAndPassword(auth, "obu@gmail.edu.com", "obu@jama2018")
  .then((userCredential) => {
    console.log("SUCCESS! Admin user created with UID:", userCredential.user.uid);
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log("This admin account already exists in Firebase!");
      process.exit(0);
    } else {
      console.error("Error creating admin user:", error.message);
      process.exit(1);
    }
  });
