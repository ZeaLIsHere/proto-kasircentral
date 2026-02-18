import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: Ganti konfigurasi ini dengan konfigurasi dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDFs-cxiDdH_y5fvCljjP5dMUcyDzp0gzE",
  authDomain: "kasir-central.firebaseapp.com",
  projectId: "kasir-central",
  storageBucket: "kasir-central.firebasestorage.app",
  messagingSenderId: "1045683680545",
  appId: "1:1045683680545:web:e5467fb36d718b9678fa60",
  measurementId: "G-4S9SBWB1H1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
