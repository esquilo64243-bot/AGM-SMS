// 01_HOME/js/firebaseMaster.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfigMaster = {
  apiKey: "AIzaSyC_LYr08NLAQEbtZozoT8QaU110p_1WnpE",
  authDomain: "sigma-master.firebaseapp.com",
  projectId: "sigma-master",
  storageBucket: "sigma-master.firebasestorage.app",
  messagingSenderId: "274652069745",
  appId: "1:274652069745:web:0a6d450999b52f4af000d0",
  measurementId: "G-1C1C5S5BFD"
};

// Inicializa o Firebase Master
export const appMaster = initializeApp(firebaseConfigMaster, "master");

// Firestore Master
export const dbMaster = getFirestore(appMaster);

// Authentication Master
export const authMaster = getAuth(appMaster);