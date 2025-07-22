// src/firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH_MBMZMAoh_I9ZiTDHVhVTFVWyFlEE9g",
  authDomain: "pakeladmin.firebaseapp.com",
  projectId: "pakeladmin",
  storageBucket: "pakeladmin.firebasestorage.app",
  messagingSenderId: "858281360810",
  appId: "1:858281360810:web:082b75aafe328b8c75bfd3",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dan Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
