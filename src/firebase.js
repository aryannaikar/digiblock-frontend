// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfKsH_b7GN2E8DqspyawyC5U8pJsvDjKM",
  authDomain: "digilocker-64b97.firebaseapp.com",
  projectId: "digilocker-64b97",
  storageBucket: "digilocker-64b97.firebasestorage.app",
  messagingSenderId: "956165183402",
  appId: "1:956165183402:web:68ef857f7a39023cd7fdd3",
  measurementId: "G-JXX2RD2EYE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
