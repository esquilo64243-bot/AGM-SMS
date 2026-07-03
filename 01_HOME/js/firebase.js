// 01_HOME/js/firebase.js
console.log("🔥 firebase.js carregado");

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// =========================
// CONFIGURAÇÕES DOS BANCOS
// =========================

// Serra Morena / Produção
const firebaseConfigProducao = {
  apiKey: "AIzaSyCtqfwA8RUouJx7V7Jm-LMatxdcvqpLyFM",
  authDomain: "sms-agm.firebaseapp.com",
  projectId: "sms-agm",
  storageBucket: "sms-agm.firebasestorage.app",
  messagingSenderId: "870107789537",
  appId: "1:870107789537:web:cc2c1db56d1445cc2d1fa0"
};

// Projeto Demo / PrevTech
const firebaseConfigDemo = {
  apiKey: "AIzaSyDuabv-Kc0QvFuqGD2EcojWhGjwOS79njY",
  authDomain: "fir-prevtech.firebaseapp.com",
  projectId: "fir-prevtech",
  storageBucket: "fir-prevtech.firebasestorage.app",
  messagingSenderId: "579132447424",
  appId: "1:579132447424:web:b91922d56d0320a566ab25"
};

// Projeto Informatrix
const firebaseConfigInformatrix = {
  apiKey: "AIzaSyA_B2wiahJrNiQXcIFcCoJCiPfOfcao9p8",
  authDomain: "infromatrix-8eb37.firebaseapp.com",
  projectId: "infromatrix-8eb37",
  storageBucket: "infromatrix-8eb37.firebasestorage.app",
  messagingSenderId: "23887058354",
  appId: "1:23887058354:web:fec2190efc50b2a3cf40ab"
};

// =========================
// ESCOLHE O BANCO DO USUÁRIO
// =========================

// Esse valor vem do login.js:
// localStorage.setItem("firebase", usuario.firebase);
const ambiente = localStorage.getItem("firebase");

const configuracoes = {
  producao: firebaseConfigProducao,
  demo: firebaseConfigDemo,
  informatrix: firebaseConfigInformatrix
};

let configEscolhida = configuracoes[ambiente];

// Caso alguém abra uma página sem fazer login, evita quebrar o sistema.
if (!configEscolhida) {
  console.warn(
    `⚠️ Ambiente "${ambiente}" não encontrado. Usando Produção.`
  );

  configEscolhida = firebaseConfigProducao;
}

console.log("🏢 Ambiente selecionado:", ambiente || "producao");
console.log("📦 Projeto Firebase selecionado:", configEscolhida.projectId);

// =========================
// INICIALIZA O FIREBASE
// =========================

// Usa a instância padrão, para manter compatibilidade com todos os imports atuais.
export const app = getApps().length
  ? getApp()
  : initializeApp(configEscolhida);

export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("🔥 Firestore conectado:", configEscolhida.projectId);