import { db } from "../../../01_HOME/js/firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const formRegistro = document.getElementById("formRegistro");
const mensagemStatus = document.getElementById("mensagemStatus");

formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipo").value;
  const local = document.getElementById("local").value.trim();

  const area = document.getElementById("area").value.trim();
  const corpo = document.getElementById("corpo").value;
  const agente = document.getElementById("agente").value;
  const diasPerdidos = Number(document.getElementById("diasPerdidos").value) || 0;

  const descricao = document.getElementById("descricao").value.trim();
  const prevencao = document.getElementById("prevencao").value.trim();

  if (!nome || !data || !tipo || !local || !descricao) {
    mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
    return;
  }

  try {
    mostrarMensagem("Salvando registro...", "carregando");

    await addDoc(collection(db, "acidentes"), {
      nome,
      data,
      tipo,
      local,
      area: area || "Não informado",
      corpo: corpo || "Não informado",
      agente: agente || "Não informado",
      diasPerdidos,
      descricao,
      prevencao: prevencao || "Não informado",
      fatalidade: tipo === "Fatalidade",
      criadoEm: new Date().toISOString()
    });

    formRegistro.reset();

    document.getElementById("diasPerdidos").value = 0;

    mostrarMensagem("Registro salvo com sucesso ✅", "sucesso");

    setTimeout(() => {
      window.location.href = "../01_HISTORICO/historico.html";
    }, 1200);

  } catch (erro) {
    console.error("Erro ao salvar acidente:", erro);
    mostrarMensagem("Erro ao salvar registro. Tente novamente.", "erro");
  }
});

function mostrarMensagem(texto, tipo) {
  mensagemStatus.innerText = texto;

  if (tipo === "erro") {
    mensagemStatus.style.color = "#ff5c5c";
  } else if (tipo === "carregando") {
    mensagemStatus.style.color = "#7ea4ff";
  } else {
    mensagemStatus.style.color = "#1cc88a";
  }
}