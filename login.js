import { auth } from "./01_HOME/js/firebase.js";
import { signInWithEmailAndPassword } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.fazerLogin = function () {

  const email = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("✅ Logado:", userCredential.user.email);
      window.location.href = "./01_HOME/home.html";
    })
    .catch((error) => {
      console.log("❌ Erro:", error.message);
      erro.textContent = "Usuário ou senha inválidos";
    });

};