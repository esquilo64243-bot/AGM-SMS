// 01_HOME/js/firebase.js
console.log("🔥 firebase.js carregado");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCtqfwA8RUouJx7V7Jm-LMatxdcvqpLyFM",
  authDomain: "sms-agm.firebaseapp.com",
  projectId: "sms-agm",
  storageBucket: "sms-agm.firebasestorage.app",
  messagingSenderId: "870107789537",
  appId: "1:870107789537:web:cc2c1db56d1445cc2d1fa0"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
console.log("🔥 Firebase inicializado");

// Inicializa Firestore
export const db = getFirestore(app);
console.log("🔥 Firestore conectado");

// 🔐 Inicializa Auth
export const auth = getAuth(app);
console.log("🔥 Firebase Auth conectado");