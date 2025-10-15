// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB3wFJ9Hv9gANAIW8y9QZgAbo2wQxyb_kQ",
  authDomain: "servidor-fotos-166f2.firebaseapp.com",
  projectId: "servidor-fotos-166f2",
  storageBucket: "servidor-fotos-166f2.firebasestorage.app",
  messagingSenderId: "1078468627551",
  appId: "1:1078468627551:web:c6daaab275139d8f105fea"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
