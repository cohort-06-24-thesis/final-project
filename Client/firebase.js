// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// your firebase config (paste yours here)
const firebaseConfig = {
    apiKey: "AIzaSyChBvYOxzhclrY7CWm2fNl66FGSvg2oB9k",
    authDomain: "app-donation-b1654.firebaseapp.com",
    projectId: "app-donation-b1654",
    storageBucket: "app-donation-b1654.firebasestorage.app",
    messagingSenderId: "741787241981",
    appId: "1:741787241981:web:75b61644739e127c3ddd94",
    measurementId: "G-TC6TD8CX5V"
  };

// initialize firebase
const app = initializeApp(firebaseConfig);

// export auth
export const auth = getAuth(app);
