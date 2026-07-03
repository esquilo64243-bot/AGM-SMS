import { authMaster, dbMaster } from "../01_HOME/js/firebaseManager.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.fazerLogin = async function () {
  const email = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.textContent = "";

  try {
    const userCredential = await signInWithEmailAndPassword(
      authMaster,
      email,
      senha
    );

    const uid = userCredential.user.uid;

    console.log("UID do usuário:", uid);

    // Use "firebase" somente se este for o nome real da coleção no Master.
    const docRef = doc(dbMaster, "firebase", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await signOut(authMaster);
      erro.textContent = "Usuário sem cadastro no sistema.";
      return;
    }

    const usuario = docSnap.data();

    if (!usuario.firebase) {
      await signOut(authMaster);
      erro.textContent = "Usuário sem ambiente Firebase definido.";
      return;
    }

    // Evita manter dados da conta anterior no navegador.
    localStorage.removeItem("empresa");
    localStorage.removeItem("firebase");
    localStorage.removeItem("nivel");
    localStorage.removeItem("nome");

    localStorage.setItem("empresa", usuario.empresa || "");
    localStorage.setItem("firebase", usuario.firebase);
    localStorage.setItem("nivel", usuario.nivel || "");
    localStorage.setItem("nome", usuario.nome || "");

    console.log("Usuário carregado:", usuario);
    console.log("Firebase selecionado:", usuario.firebase);

window.location.href = "./01_HOME/home.html";

  } catch (error) {
    console.log("❌ Erro:", error.code, error.message);
    erro.textContent = "Usuário ou senha inválidos.";
  }
};