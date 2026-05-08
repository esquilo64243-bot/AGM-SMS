import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import Chart from "https://cdn.jsdelivr.net/npm/chart.js/auto/+esm";

import { db } from "../../01_HOME/js/firebase.js";

// =============================
// 🔹 DADOS FUNCIONÁRIOS
// =============================
let funcionarios = [];
let mapaFuncionarios = {};
let grafico = null;

// =============================
// 🔹 ELEMENTOS
// =============================
const buscaInput = document.getElementById("buscaNome");
const selectFuncionario = document.getElementById("selectFuncionario");

// =============================
// 🔹 MODAL
// =============================
window.abrirModal = function () {
  document.getElementById("modal").classList.add("show");
};

window.fecharModal = function () {
  document.getElementById("modal").classList.remove("show");
};

// =============================
// 🔹 CARREGAR FUNCIONÁRIOS
// =============================
async function carregarFuncionarios() {

  const snapshot = await getDocs(collection(db, "funcionarios"));

  funcionarios = [];
  mapaFuncionarios = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const f = {
      id: docSnap.id,
      nome: data.nome || "Sem nome",
      funcao: data.funcao || data.cargoAtual || "Sem função",
      setor: data.setor || "Sem setor"
    };

    funcionarios.push(f);
    mapaFuncionarios[f.id] = f;
  });

  funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));
}

// =============================
// 🔍 BUSCA
// =============================
buscaInput.addEventListener("input", () => {

  const termo = buscaInput.value.toLowerCase();

  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo)
  );

  preencherSelect(filtrados);
});

// =============================
// 🔹 SELECT
// =============================
selectFuncionario.addEventListener("change", preencherDadosFuncionario);

function preencherSelect(lista) {

  selectFuncionario.innerHTML = "";

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.nome} - ${f.funcao}`;
    selectFuncionario.appendChild(opt);
  });

  if (lista.length > 0) {
    selectFuncionario.value = lista[0].id;
    preencherDadosFuncionario();
  }
}

function preencherDadosFuncionario() {

  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return;

  const funcaoInput = document.getElementById("funcao");
  const setorInput = document.getElementById("setor");

  if (!funcaoInput || !setorInput) return;

  funcaoInput.value = f.funcao;
  setorInput.value = f.setor;
}

// =============================
// 🔹 SALVAR DESVIO
// =============================
window.salvarDesvio = async function () {

  const funcionarioSelecionado = mapaFuncionarios[selectFuncionario.value];

if (!funcionarioSelecionado) {
  alert("Selecione um colaborador!");
  return;
}

const nome = funcionarioSelecionado.nome;
  const funcao = document.getElementById("funcao").value.trim();
  const setor = document.getElementById("setor").value.trim();
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipoDesvio").value;
  const obs = document.getElementById("observacao").value.trim();

  if (
  !nome ||
  !funcao ||
  !setor ||
  !data ||
  !tipo ||
  !obs
) {
    alert("Preenche todos os campos!");
    return;
}

  document.getElementById("loading").style.display = "block";

  const dataObj = new Date(data);
  const ano = dataObj.getFullYear();
  const mes = (dataObj.getMonth() + 1).toString().padStart(2, "0");

  try {

    const ref = collection(db, "desvios", String(ano), mes);

    await addDoc(ref, {
      nome,
      funcao,
      setor,
      tipo,
      observacao: obs,
      data,
      createdAt: new Date()
    });

    document.getElementById("loading").style.display = "none";
    document.getElementById("sucesso").style.display = "block";

  setTimeout(() => {
      window.fecharModal();
      location.reload();
    }, 1200);

  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao salvar!");
  }
};

// =============================
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
  <div class="desvio-info">
    <strong>${d.nome}</strong> - ${d.setor} <br>
    ${d.tipo} | ${d.data}

    <div class="obs-box" style="display:none; margin-top:10px;">
      <strong>Observação:</strong><br>
      ${d.observacao || "Sem observação"}
    </div>
  </div>

  <button class="btn-delete">Excluir</button>
`;

const info = item.querySelector(".desvio-info");
const obsBox = item.querySelector(".obs-box");

info.onclick = () => {
  obsBox.style.display =
    obsBox.style.display === "none"
      ? "block"
      : "none";
};

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

    console.log("🔥 FUNÇÃO GRÁFICO INICIADA");

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");

    // 🔹 BUSCA DADOS NO FIREBASE
    const ref = collection(db, "desvios", String(ano), mes);
    const snapshot = await getDocs(ref);

    console.log("📦 Docs encontrados:", snapshot.size);

    // 🔹 OBJETO DE CONTAGEM
    const contagem = {};

    snapshot.forEach((docSnap) => {

      const tipo = docSnap.data().tipo;

      if (!contagem[tipo]) {
        contagem[tipo] = 0;
      }

      contagem[tipo]++;
    });

    console.log("📊 Dados:", contagem);

    // 🔹 PEGA CANVAS
    const canvas = document.getElementById("graficoDesvios");

    if (!canvas) {
      console.error("❌ Canvas não encontrado");
      return;
    }

    // 🔹 CONTEXTO 2D
    const ctx = canvas.getContext("2d");

    // 🔹 DESTRÓI GRÁFICO ANTIGO
    if (grafico) {
      grafico.destroy();
    }

    // 🔹 CRIA NOVO GRÁFICO
    grafico = new Chart(ctx, {

      type: "bar",

      data: {
        labels: Object.keys(contagem),

        datasets: [{
          label: "Quantidade de Desvios",

          data: Object.values(contagem),

          borderWidth: 1
        }]
      },

      options: {

        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            labels: {
              color: "#fff"
            }
          }
        },

        scales: {

          x: {
            ticks: {
              color: "#fff"
            }
          },

          y: {
            beginAtZero: true,

            ticks: {
              color: "#fff"
            }
          }
        }
      }
    });

    console.log("✅ GRÁFICO CRIADO");

  } catch (erro) {

    console.error("❌ Erro ao carregar gráfico:", erro);
  }
}
// =============================
// 🔹 INICIAR
// =============================
document.addEventListener("DOMContentLoaded", async () => {

  await carregarFuncionarios();
  preencherSelect(funcionarios);

  carregarHistorico();
  carregarGrafico();
});