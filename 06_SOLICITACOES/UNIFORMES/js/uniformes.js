import { db } from "../../../01_HOME/js/firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= DADOS =================
let pedidosUniforme = JSON.parse(localStorage.getItem("pedidosUniforme")) || [];

let funcionarios = [];
let mapaFuncionarios = {};
let editId = null;

// ================= ELEMENTOS =================
const buscaInput = document.getElementById("buscaNome");
const selectFuncionario = document.getElementById("selectFuncionario");
const cargoInput = document.getElementById("cargo");
const empresaInput = document.getElementById("empresa");
const itemInput = document.getElementById("item");
const tamanhoInput = document.getElementById("tamanho");
const unidadeInput = document.getElementById("unidade");

// ================= FIREBASE =================
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
      empresa: data.empresa || "Sem empresa",
    };

    funcionarios.push(f);
    mapaFuncionarios[f.id] = f;
  });

  funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));
}

// ================= BUSCA =================
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();

  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo),
  );

  preencherSelect(filtrados);
});

// ================= SELECT =================
selectFuncionario.addEventListener("change", preencherDadosFuncionario);

function preencherDadosFuncionario() {
  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return;

  cargoInput.value = f.cargo;
  empresaInput.value = f.empresa;
}

function preencherSelect(lista) {
  selectFuncionario.innerHTML = "";

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.nome} - ${f.cargo}`;
    selectFuncionario.appendChild(opt);
  });

  if (lista.length > 0) {
    selectFuncionario.value = lista[0].id;
    preencherDadosFuncionario();
  }
}

// ================= MODAL =================
function abrirModal() {
  editId = null;
  limparCampos();
  preencherSelect(funcionarios);
  document.getElementById("modal").classList.add("show");
}

function fecharModal() {
  document.getElementById("modal").classList.remove("show");
}

// ================= VALIDAR TROCA =================
function temPendenciaTroca(nome) {
  return pedidosUniforme.some(
    (p) => p.nome === nome && p.status === "AGUARDANDO TROCA",
  );
}

// ================= SALVAR =================
function salvarPedido() {
  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return alert("Selecione um funcionário!");

  if (!editId && temPendenciaTroca(f.nome)) {
    return alert("⚠️ Este colaborador possui uniforme pendente para troca!");
  }

  const item = itemInput.value.trim();
  const tamanho = tamanhoInput.value.trim();
  const unidade = unidadeInput.value.trim();

  if (!item || !tamanho || !unidade) {
    return alert("Preencha todos os campos!");
  }

  const novo = {
    id: editId || Date.now(),
    data: new Date().toISOString(),
    nome: f.nome,
    cargo: f.cargo,
    empresa: f.empresa,
    item,
    tamanho,
    unidade,
    tipo: "UNIFORME",
    status: "SOLICITADO",
  };

  if (editId) {
    pedidosUniforme = pedidosUniforme.map((p) => (p.id === editId ? novo : p));
  } else {
    pedidosUniforme.push(novo);
  }

  salvarLocal();
  render();
  fecharModal();
}

// ================= UTIL =================
function salvarLocal() {
  localStorage.setItem("pedidosUniforme", JSON.stringify(pedidosUniforme));
}

function limparCampos() {
  buscaInput.value = "";
  itemInput.value = "";
  tamanhoInput.value = "";
  unidadeInput.value = "";
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

// ================= RENDER SOLICITAÇÕES =================
function render() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const solicitacoes = pedidosUniforme.filter((p) => p.status === "SOLICITADO");

  solicitacoes.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatarData(p.data)}</td>
      <td>${p.nome}</td>
      <td>${p.cargo}</td>
      <td>${p.empresa}</td>
      <td>${p.item}</td>
      <td>${p.tamanho}</td>
      <td>${p.unidade}</td>
      <td>${p.status}</td>
      <td>
        <button class="btn-edit" onclick="editar(${p.id})">✏️</button>
        <button class="btn-delete" onclick="excluir(${p.id})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

renderEstoque();

// ================= EDITAR =================
function editar(id) {
  const p = pedidosUniforme.find((p) => p.id === id);
  if (!p) return;

  editId = id;
  abrirModal();

  const funcionario = funcionarios.find((f) => f.nome === p.nome);

  if (funcionario) {
    selectFuncionario.value = funcionario.id;
    preencherDadosFuncionario();
  }

  itemInput.value = p.item;
  tamanhoInput.value = p.tamanho;
  unidadeInput.value = p.unidade;
}

// ================= EXCLUIR =================
function excluir(id) {
  pedidosUniforme = pedidosUniforme.filter((p) => p.id !== id);
  salvarLocal();
  render();
}

// ================= STATUS =================
function abrirStatusUniformes() {
  document.getElementById("card-pedidos").style.display = "none";
  document.getElementById("card-estoque").style.display = "none";
  document.getElementById("tela-status").style.display = "block";
  renderizarStatus();
}

function voltarPedidos() {
  document.getElementById("card-pedidos").style.display = "block";
  document.getElementById("card-estoque").style.display = "block";
  document.getElementById("tela-status").style.display = "none";
  render();
}

function renderizarStatus() {
  const container = document.getElementById("lista-status");
  container.innerHTML = "";

  pedidosUniforme.forEach((pedido) => {
    container.innerHTML += `
      <div class="status-card">
        <div class="status-info">
          <p><strong>${pedido.nome}</strong></p>
          <p>${pedido.item} - ${pedido.tamanho}</p>
          <p>Qtd: ${pedido.unidade}</p>
        </div>

        <div class="status-acoes">
          <select id="status-${pedido.id}">
            <option value="SOLICITADO" ${pedido.status === "SOLICITADO" ? "selected" : ""}>SOLICITADO</option>
            <option value="ESTOQUE" ${pedido.status === "ESTOQUE" ? "selected" : ""}>ESTOQUE</option>
            <option value="AGUARDANDO TROCA" ${pedido.status === "AGUARDANDO TROCA" ? "selected" : ""}>AGUARDANDO TROCA</option>
            <option value="FINALIZADO">FINALIZADO</option>
          </select>

          <button onclick="salvarStatus(${pedido.id})">
            Salvar
          </button>
        </div>
      </div>
    `;
  });
}

function salvarStatus(id) {
  const select = document.getElementById(`status-${id}`);
  const novoStatus = select.value;

  const index = pedidosUniforme.findIndex((p) => p.id === id);

  if (index === -1) return;

  if (novoStatus === "FINALIZADO") {
    pedidosUniforme.splice(index, 1);
  } else {
    pedidosUniforme[index].status = novoStatus;
  }

  localStorage.setItem("pedidosUniforme", JSON.stringify(pedidosUniforme));

  render();
  renderizarStatus();

  alert("Status atualizado com sucesso!");
}

// ================= ESTOQUE =================
function renderEstoque() {
  const lista = document.getElementById("listaEstoque");
  lista.innerHTML = "";

  const estoque = pedidosUniforme.filter(
    (p) => p.status === "ESTOQUE" || p.status === "AGUARDANDO TROCA",
  );

  estoque.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatarData(p.data)}</td>
      <td>${p.nome}</td>
      <td>${p.cargo}</td>
      <td>${p.empresa}</td>
      <td>${p.item}</td>
      <td>${p.tamanho}</td>
      <td>${p.unidade}</td>
      <td>${p.status}</td>
    `;

    lista.appendChild(tr);
  });
}

renderEstoque();

// ================= PDF =================
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const linhas = pedidosUniforme
    .filter((p) => p.status === "SOLICITADO")
    .map((p) => [
      formatarData(p.data),
      p.nome,
      p.cargo,
      p.empresa,
      p.item,
      p.tamanho,
      p.unidade,
      p.status,
    ]);

  doc.autoTable({
    head: [
      ["Data", "Nome", "Cargo", "Empresa", "Item", "Tamanho", "Qtd", "Status"],
    ],
    body: linhas,
  });

  doc.save("Solicitacao_Uniforme.pdf");
}

// ================= INIT =================
async function init() {
  await carregarFuncionarios();
  preencherSelect(funcionarios);
  render();
}

init();

// ================= GLOBAL =================
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.salvarPedido = salvarPedido;
window.editar = editar;
window.excluir = excluir;
window.gerarPDF = gerarPDF;
window.abrirStatusUniformes = abrirStatusUniformes;
window.voltarPedidos = voltarPedidos;
window.salvarStatus = salvarStatus;
window.renderEstoque = renderEstoque;
