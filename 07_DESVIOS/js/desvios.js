// 🔥 IMPORT DO TEU FIREBASE (CERTO)
import { db } from "../../01_HOME/js/firebase.js";

// =============================
// 🔹 MODAL (GLOBAL)
// =============================
window.abrirModal = function () {
  document.getElementById("modal").classList.add("show");
};

window.fecharModal = function () {
  document.getElementById("modal").classList.remove("show");
};

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
  const snapshot = await getDocs(collection(db, "funcionarios"));

  funcionarios = [];
  mapaFuncionarios = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const f = {
      id: docSnap.id,
      nome: data.nome || "Sem nome",
      cargo: data.cargoAtual || "Sem cargo",
    };

    funcionarios.push(f);
    mapaFuncionarios[f.id] = f;
  });

  funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));

  preencherSelect(funcionarios);
}

// 🔹 BUSCA DIGITANDO
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();

  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo),
  );

  preencherSelect(filtrados);
});

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

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.nome} - ${f.cargo}`;
    selectFuncionario.appendChild(opt);
  });

  // limpa os campos
  nomeInput.value = "";
  funcaoInput.value = "";
}

// =============================
// 🔹 SALVAR DESVIO
// =============================
window.salvarDesvio = async function () {
  const nome = document.getElementById("nome").value;
  const funcao = document.getElementById("funcao").value;
  const setor = document.getElementById("setor").value;
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipoDesvio").value;
  const obs = document.getElementById("observacao").value;

  if (!nome || !data || !tipo) {
    alert("Preenche os campos obrigatórios!");
    return;
  }

  document.getElementById("loading").style.display = "block";

  const dataObj = new Date(data);
  const ano = dataObj.getFullYear();
  const mes = (dataObj.getMonth() + 1).toString().padStart(2, "0");

  try {
    const refMes = collection(db, "desvios", String(ano), mes);

    await addDoc(refMes, {
      nome,
      funcao,
      setor,
      tipo,
      observacao: obs,
      data,
      createdAt: new Date(),
    });

    document.getElementById("loading").style.display = "none";
    document.getElementById("sucesso").style.display = "block";

    setTimeout(() => {
      fecharModal();
      location.reload();
    }, 1200);
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Erro ao salvar!");
  }
};

// =============================
// 🔹 CARREGAR GRÁFICO
// =============================
async function carregarGrafico() {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");

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
  } catch (erro) {
    console.error("Erro ao carregar gráfico:", erro);
  }
}

// =============================
// 🔹 INICIAR
// =============================
document.addEventListener("DOMContentLoaded", () => {
  carregarGrafico();
});

document.addEventListener("DOMContentLoaded", async () => {
  await carregarFuncionarios();
  carregarGrafico();
});
