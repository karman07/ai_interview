import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGhjwshhAC0fDUqkbAz3jJq_iDHwFy88o",
  authDomain: "ai-interview-7e471.firebaseapp.com",
  projectId: "ai-interview-7e471",
  storageBucket: "ai-interview-7e471.firebasestorage.app",
  messagingSenderId: "388912433938",
  appId: "1:388912433938:web:7f71f3ee65f81e4bbd81cb",
  measurementId: "G-9GS2D4YBJB"
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
