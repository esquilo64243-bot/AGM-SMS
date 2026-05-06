<<<<<<< HEAD
// 🔥 IMPORT DO TEU FIREBASE (CERTO)
import { db } from "../../01_HOME/js/firebase.js";

// =============================
// 🔹 MODAL (GLOBAL)
=======
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../../01_HOME/js/firebase.js";

// =============================
// 🔹 DADOS FUNCIONÁRIOS
// =============================
let funcionarios = [];
let mapaFuncionarios = {};

// =============================
// 🔹 ELEMENTOS
// =============================
const buscaInput = document.getElementById("buscaNome");
const selectFuncionario = document.getElementById("selectFuncionario");

// =============================
// 🔹 MODAL
>>>>>>> 7f9e052 (Melhoria em sistema)
// =============================
window.abrirModal = function () {
  document.getElementById("modal").classList.add("show");
};

window.fecharModal = function () {
  document.getElementById("modal").classList.remove("show");
};

<<<<<<< HEAD
// ================= FUNCIONÁRIOS =================
import {
  collection,
  getDocs,
  addDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let funcionarios = [];
let mapaFuncionarios = {};

const buscaInput = document.getElementById("buscaNome");
const selectFuncionario = document.getElementById("selectFuncionario");
const nomeInput = document.getElementById("nome");
const funcaoInput = document.getElementById("funcao");

// 🔹 CARREGAR FUNCIONÁRIOS
async function carregarFuncionarios() {
=======
// =============================
// 🔹 CARREGAR FUNCIONÁRIOS
// =============================
async function carregarFuncionarios() {

>>>>>>> 7f9e052 (Melhoria em sistema)
  const snapshot = await getDocs(collection(db, "funcionarios"));

  funcionarios = [];
  mapaFuncionarios = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const f = {
      id: docSnap.id,
      nome: data.nome || "Sem nome",
<<<<<<< HEAD
      cargo: data.cargoAtual || "Sem cargo",
=======
      funcao: data.funcao || data.cargoAtual || "Sem função",
      setor: data.setor || "Sem setor"
>>>>>>> 7f9e052 (Melhoria em sistema)
    };

    funcionarios.push(f);
    mapaFuncionarios[f.id] = f;
  });

  funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));
<<<<<<< HEAD

  preencherSelect(funcionarios);
}

// 🔹 BUSCA DIGITANDO
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();

  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo),
=======
}

// =============================
// 🔍 BUSCA
// =============================
buscaInput.addEventListener("input", () => {

  const termo = buscaInput.value.toLowerCase();

  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo)
>>>>>>> 7f9e052 (Melhoria em sistema)
  );

  preencherSelect(filtrados);
});

<<<<<<< HEAD
// 🔹 SELECT
selectFuncionario.addEventListener("change", preencherDadosFuncionario);

function preencherDadosFuncionario() {
  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return;

  nomeInput.value = f.nome;
  funcaoInput.value = f.cargo;
}

// 🔹 PREENCHER SELECT
function preencherSelect(lista) {
  selectFuncionario.innerHTML = "";

  const optDefault = document.createElement("option");
  optDefault.value = "";
  optDefault.textContent = "Selecione um colaborador...";
  optDefault.disabled = true;
  optDefault.selected = true;
  selectFuncionario.appendChild(optDefault);
=======
// =============================
// 🔹 SELECT
// =============================
selectFuncionario.addEventListener("change", preencherDadosFuncionario);

function preencherSelect(lista) {

  selectFuncionario.innerHTML = "";
>>>>>>> 7f9e052 (Melhoria em sistema)

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
<<<<<<< HEAD
    opt.textContent = `${f.nome} - ${f.cargo}`;
    selectFuncionario.appendChild(opt);
  });

  // limpa os campos
  nomeInput.value = "";
  funcaoInput.value = "";
=======
    opt.textContent = `${f.nome} - ${f.funcao}`;
    selectFuncionario.appendChild(opt);
  });
}

function preencherDadosFuncionario() {

  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return;

  const nomeInput = document.getElementById("buscaNome");
  const funcaoInput = document.getElementById("funcao");
  const setorInput = document.getElementById("setor");

  if (!nomeInput || !funcaoInput || !setorInput) return;

  nomeInput.value = f.nome;
  funcaoInput.value = f.funcao;
  setorInput.value = f.setor;
>>>>>>> 7f9e052 (Melhoria em sistema)
}

// =============================
// 🔹 SALVAR DESVIO
// =============================
window.salvarDesvio = async function () {
<<<<<<< HEAD
  const nome = document.getElementById("nome").value;
  const funcao = document.getElementById("funcao").value;
  const setor = document.getElementById("setor").value;
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipoDesvio").value;
  const obs = document.getElementById("observacao").value;
=======

  const nome = document.getElementById("buscaNome").value.trim();
  const funcao = document.getElementById("funcao").value.trim();
  const setor = document.getElementById("setor").value.trim();
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipoDesvio").value;
  const obs = document.getElementById("observacao").value.trim();
>>>>>>> 7f9e052 (Melhoria em sistema)

  if (!nome || !data || !tipo) {
    alert("Preenche os campos obrigatórios!");
    return;
  }

  document.getElementById("loading").style.display = "block";

  const dataObj = new Date(data);
  const ano = dataObj.getFullYear();
  const mes = (dataObj.getMonth() + 1).toString().padStart(2, "0");

  try {
<<<<<<< HEAD
    const refMes = collection(db, "desvios", String(ano), mes);

    await addDoc(refMes, {
=======

    const ref = collection(db, "desvios", String(ano), mes);

    await addDoc(ref, {
>>>>>>> 7f9e052 (Melhoria em sistema)
      nome,
      funcao,
      setor,
      tipo,
      observacao: obs,
<<<<<<< HEAD
      data,
      createdAt: new Date(),
=======
      data: data,
      createdAt: new Date()
>>>>>>> 7f9e052 (Melhoria em sistema)
    });

    document.getElementById("loading").style.display = "none";
    document.getElementById("sucesso").style.display = "block";

    setTimeout(() => {
<<<<<<< HEAD
      fecharModal();
      location.reload();
    }, 1200);
=======
      window.fecharModal();
      location.reload();
    }, 1200);

>>>>>>> 7f9e052 (Melhoria em sistema)
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao salvar!");
  }
};

// =============================
<<<<<<< HEAD
// 🔹 CARREGAR GRÁFICO
// =============================
async function carregarGrafico() {
  try {
=======
// 🔹 HISTÓRICO
// =============================
async function carregarHistorico() {

  const container = document.getElementById("historicoContainer");
  container.innerHTML = "";

  const anoAtual = new Date().getFullYear();
  const meses = ["01","02","03","04","05","06","07","08","09","10","11","12"];

  for (let ano = anoAtual; ano >= 2020; ano--) {

    let temDadosNoAno = false;

    const anoDiv = document.createElement("div");
    anoDiv.classList.add("accordion-item");

    const anoHeader = document.createElement("div");
    anoHeader.classList.add("accordion-header");
    anoHeader.innerText = `📅 ${ano}`;

    const anoContent = document.createElement("div");
    anoContent.classList.add("accordion-content");

    anoHeader.onclick = () => {
      anoContent.style.display =
        anoContent.style.display === "block" ? "none" : "block";
    };

    for (const mes of meses) {

      const ref = collection(db, "desvios", String(ano), mes);
      const snapshot = await getDocs(ref);

      if (snapshot.empty) continue;

      temDadosNoAno = true;

      const mesHeader = document.createElement("div");
      mesHeader.classList.add("accordion-header");
      mesHeader.innerText = `📂 Mês ${mes}`;

      const mesContent = document.createElement("div");
      mesContent.classList.add("accordion-content");

      mesHeader.onclick = () => {
        mesContent.style.display =
          mesContent.style.display === "block" ? "none" : "block";
      };

      snapshot.forEach(docSnap => {

        const d = docSnap.data();

        const item = document.createElement("div");
        item.classList.add("desvio-item");

        item.innerHTML = `
          <div>
            <strong>${d.nome}</strong> - ${d.setor} <br>
            ${d.tipo} | ${d.data}
          </div>
          <button class="btn-delete">Excluir</button>
        `;

        item.querySelector(".btn-delete").onclick = async () => {
          if (confirm("Deseja excluir este desvio?")) {
            const docRef = doc(db, "desvios", String(ano), mes, docSnap.id);
            await deleteDoc(docRef);
            item.remove();
          }
        };

        mesContent.appendChild(item);
      });

      anoContent.appendChild(mesHeader);
      anoContent.appendChild(mesContent);
    }

    // 🔥 SÓ MOSTRA O ANO SE TIVER DADO
    if (temDadosNoAno) {
      anoDiv.appendChild(anoHeader);
      anoDiv.appendChild(anoContent);
      container.appendChild(anoDiv);
    }
  }
}
// =============================
// 🔹 GRÁFICO
// =============================
async function carregarGrafico() {

  try {

>>>>>>> 7f9e052 (Melhoria em sistema)
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");

<<<<<<< HEAD
    const refMes = collection(db, "desvios", String(ano), mes);

    const snapshot = await getDocs(refMes);

    const contagem = {};

    snapshot.forEach((doc) => {
      const tipo = doc.data().tipo;

      if (!contagem[tipo]) {
        contagem[tipo] = 0;
      }

      contagem[tipo]++;
    });

    const labels = Object.keys(contagem);
    const dados = Object.values(contagem);

    new Chart(document.getElementById("graficoDesvios"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Quantidade de Desvios",
            data: dados,
          },
        ],
      },
    });
=======
    const ref = collection(db, "desvios", String(ano), mes);
    const snapshot = await getDocs(ref);

    const contagem = {};

    snapshot.forEach(doc => {
      const tipo = doc.data().tipo;
      if (!contagem[tipo]) contagem[tipo] = 0;
      contagem[tipo]++;
    });

    new Chart(document.getElementById("graficoDesvios"), {
      type: "bar",
      data: {
        labels: Object.keys(contagem),
        datasets: [{
          label: "Quantidade de Desvios",
          data: Object.values(contagem)
        }]
      }
    });

>>>>>>> 7f9e052 (Melhoria em sistema)
  } catch (erro) {
    console.error("Erro ao carregar gráfico:", erro);
  }
}

// =============================
// 🔹 INICIAR
// =============================
<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
  carregarGrafico();
});

document.addEventListener("DOMContentLoaded", async () => {
  await carregarFuncionarios();
  carregarGrafico();
});
=======
document.addEventListener("DOMContentLoaded", async () => {

  await carregarFuncionarios();
  preencherSelect(funcionarios);

  carregarHistorico();
  carregarGrafico();
});
>>>>>>> 7f9e052 (Melhoria em sistema)
