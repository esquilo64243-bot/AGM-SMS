import { db } from "../../../01_HOME/js/firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("uniformes.js carregou");

// ================= DADOS =================
let pedidosUniforme = JSON.parse(localStorage.getItem("pedidosUniforme")) || [];

let funcionarios = [];
let mapaFuncionarios = {};
let editId = null;

// ================= ELEMENTOS =================
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const buscaInput = document.getElementById("buscaNome");
const selectFuncionario = document.getElementById("selectFuncionario");
const cargoInput = document.getElementById("cargo");
const empresaInput = document.getElementById("empresa");
const itemInput = document.getElementById("item");
const tamanhoInput = document.getElementById("tamanho");
const unidadeInput = document.getElementById("unidade");

// ================= FIREBASE: FUNCIONÁRIOS =================
async function carregarFuncionarios() {
  try {
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
  } catch (e) {
    console.error("Erro ao carregar funcionários:", e);
  }
}

// ================= BUSCA / SELECT =================
buscaInput.addEventListener("input", () => {
  const termo = buscaInput.value.toLowerCase();
  const filtrados = funcionarios.filter((f) => f.nome.toLowerCase().includes(termo));
  preencherSelect(filtrados);
});

selectFuncionario.addEventListener("change", preencherDadosFuncionario);

function preencherDadosFuncionario() {
  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) return;

  cargoInput.value = f.cargo;
  empresaInput.value = f.empresa;
}

function preencherSelect(lista) {
  selectFuncionario.innerHTML = "";

  if (lista.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum colaborador encontrado";
    selectFuncionario.appendChild(opt);
    cargoInput.value = "";
    empresaInput.value = "";
    return;
  }

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = `${f.nome} - ${f.cargo}`;
    selectFuncionario.appendChild(opt);
  });

  selectFuncionario.value = lista[0].id;
  preencherDadosFuncionario();
}

// ================= MODAL =================
function abrirModal() {
  editId = null;
  modalTitulo.textContent = "Novo Pedido";
  limparCampos();
  preencherSelect(funcionarios);
  modal.classList.add("show");
}

function fecharModal() {
  modal.classList.remove("show");
  editId = null;
}

function limparCampos() {
  buscaInput.value = "";
  itemInput.value = "";
  tamanhoInput.value = "";
  unidadeInput.value = "";
}

// ================= SALVAR (criar ou editar) =================
function salvarPedido() {
  const f = mapaFuncionarios[selectFuncionario.value];
  if (!f) {
    alert("Selecione um funcionário!");
    return;
  }

  const item = itemInput.value.trim();
  const tamanho = tamanhoInput.value.trim();
  const unidade = unidadeInput.value.trim();

  if (!item || !tamanho || !unidade) {
    alert("Preencha todos os campos!");
    return;
  }

  if (editId) {
    // Edição: mantém status e data originais, só atualiza os dados
    const index = pedidosUniforme.findIndex((p) => p.id === editId);
    if (index === -1) return;

    pedidosUniforme[index] = {
      ...pedidosUniforme[index],
      nome: f.nome,
      cargo: f.cargo,
      empresa: f.empresa,
      item,
      tamanho,
      unidade,
    };
  } else {
    pedidosUniforme.push({
      id: Date.now(),
      data: new Date().toISOString(),
      nome: f.nome,
      cargo: f.cargo,
      empresa: f.empresa,
      item,
      tamanho,
      unidade,
      status: "SOLICITADO",
    });
  }

  salvarLocal();
  renderTudo();
  fecharModal();
}

// ================= EDITAR =================
function editar(id) {
  const p = pedidosUniforme.find((p) => p.id === id);
  if (!p) return;

  editId = id;
  modalTitulo.textContent = "Editar Pedido";

  preencherSelect(funcionarios);

  const funcionario = funcionarios.find((f) => f.nome === p.nome);
  if (funcionario) {
    selectFuncionario.value = funcionario.id;
    preencherDadosFuncionario();
  }

  itemInput.value = p.item;
  tamanhoInput.value = p.tamanho;
  unidadeInput.value = p.unidade;

  modal.classList.add("show");
}

// ================= EXCLUIR =================
function excluir(id) {
  if (!confirm("Excluir este registro? Essa ação não pode ser desfeita.")) return;

  pedidosUniforme = pedidosUniforme.filter((p) => p.id !== id);
  salvarLocal();
  renderTudo();
}

// ================= ALTERAR STATUS (inline nas tabelas) =================
function alterarStatus(id, novoStatus) {
  const index = pedidosUniforme.findIndex((p) => p.id === id);
  if (index === -1) return;

  pedidosUniforme[index].status = novoStatus;
  salvarLocal();
  renderTudo();
}

// ================= LIMPAR FINALIZADOS =================
function limparFinalizados() {
  if (
    !confirm(
      "Apagar TODOS os uniformes finalizados?\n\nEssa ação NÃO pode ser desfeita.",
    )
  )
    return;

  pedidosUniforme = pedidosUniforme.filter((p) => p.status !== "FINALIZADO");
  salvarLocal();
  renderTudo();

  alert("Finalizados apagados com sucesso!");
}

// ================= UTIL =================
function salvarLocal() {
  localStorage.setItem("pedidosUniforme", JSON.stringify(pedidosUniforme));
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

// ================= RENDER =================
function renderSolicitacoes() {
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
      <td>
        <select class="status-select solicitado" onchange="alterarStatus(${p.id}, this.value)">
          <option value="SOLICITADO" selected>Solicitado</option>
          <option value="ESTOQUE">Estoque</option>
        </select>
      </td>
      <td>
        <button class="btn-edit" onclick="editar(${p.id})">✏️</button>
        <button class="btn-delete" onclick="excluir(${p.id})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

function renderEstoque() {
  const lista = document.getElementById("listaEstoque");
  lista.innerHTML = "";

  const estoque = pedidosUniforme.filter((p) => p.status === "ESTOQUE");

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
      <td>
        <select class="status-select estoque" onchange="alterarStatus(${p.id}, this.value)">
          <option value="ESTOQUE" selected>Estoque</option>
          <option value="FINALIZADO">Finalizado</option>
        </select>
      </td>
      <td>
        <button class="btn-delete" onclick="excluir(${p.id})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

function renderFinalizados() {
  const lista = document.getElementById("listaFinalizados");
  lista.innerHTML = "";

  const finalizados = pedidosUniforme.filter((p) => p.status === "FINALIZADO");

  finalizados.forEach((p) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatarData(p.data)}</td>
      <td>${p.nome}</td>
      <td>${p.cargo}</td>
      <td>${p.empresa}</td>
      <td>${p.item}</td>
      <td>${p.tamanho}</td>
      <td>${p.unidade}</td>
      <td><span class="status-badge finalizado">Finalizado</span></td>
      <td>
        <button class="btn-delete" onclick="excluir(${p.id})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

function renderTudo() {
  renderSolicitacoes();
  renderEstoque();
  renderFinalizados();
}

// ================= PDF =================
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const linhasDoStatus = (status) =>
    pedidosUniforme
      .filter((p) => p.status === status)
      .map((p) => [
        formatarData(p.data),
        p.nome,
        p.cargo,
        p.empresa,
        p.item,
        p.tamanho,
        p.unidade,
      ]);

  doc.setFontSize(16);
  doc.text("Solicitações de Uniforme", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [["Data", "Nome", "Cargo", "Empresa", "Item", "Tamanho", "Qtd"]],
    body: linhasDoStatus("SOLICITADO"),
  });

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Uniformes em Estoque", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [["Data", "Nome", "Cargo", "Empresa", "Item", "Tamanho", "Qtd"]],
    body: linhasDoStatus("ESTOQUE"),
  });

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Uniformes Finalizados (Entregues)", 14, 15);
  doc.autoTable({
    startY: 20,
    head: [["Data", "Nome", "Cargo", "Empresa", "Item", "Tamanho", "Qtd"]],
    body: linhasDoStatus("FINALIZADO"),
  });

  doc.save("Relatorio_Uniformes.pdf");
}

// ================= INIT =================
async function init() {
  await carregarFuncionarios();
  renderTudo();
}

init();

// ================= GLOBAL =================
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.salvarPedido = salvarPedido;
window.editar = editar;
window.excluir = excluir;
window.alterarStatus = alterarStatus;
window.limparFinalizados = limparFinalizados;
window.gerarPDF = gerarPDF;