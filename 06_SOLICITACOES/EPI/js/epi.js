import { db } from "../../../01_HOME/js/firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("epi.js carregou");

// ================= DADOS =================
let tipos = JSON.parse(localStorage.getItem("tiposEPI")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidosEPI")) || [];
let editIndex = null;

let funcionarios = [];
let mapaFuncionarios = {};

// EPI selecionado quando um modal de movimentação (saída/entrada) está aberto
let epiMovimentoAtual = null;

const inputQtdEPI = document.getElementById("qtdEPI");

// ================= ELEMENTOS =================
const modalCadastro = document.getElementById("modalCadastro");
const modalPedido = document.getElementById("modalPedido");
const modalQtd = document.getElementById("modalQtd");
const modalSaida = document.getElementById("modalSaida");
const modalEntrada = document.getElementById("modalEntrada");
const modalEditarEpi = document.getElementById("modalEditarEpi");

const inputCodigo = document.getElementById("codigoEPI");
const inputNome = document.getElementById("nomeEPI");
const inputEstoqueMinimo = document.getElementById("estoqueMinimoEPI");
const selectEPI = document.getElementById("selectEPI");
const inputQtd = document.getElementById("quantidade");
const inputObs = document.getElementById("obs");
const pesquisaEPI = document.getElementById("pesquisaEPI");
const novaQtdEPI = document.getElementById("novaQtdEPI");
const nomeQtdModal = document.getElementById("nomeQtdModal");

// elementos do modal de SAÍDA
const epiSaidaInfo = document.getElementById("epiSaidaInfo");
const buscaFuncionarioSaida = document.getElementById("buscaFuncionarioSaida");
const selectFuncionarioSaida = document.getElementById(
  "selectFuncionarioSaida",
);
const setorFuncionarioSaida = document.getElementById("setorFuncionarioSaida");
const qtdSaida = document.getElementById("qtdSaida");
const dataSaida = document.getElementById("dataSaida");

// elementos do modal de ENTRADA
const epiEntradaInfo = document.getElementById("epiEntradaInfo");
const colaboradorEntradaBox = document.getElementById("colaboradorEntradaBox");
const buscaFuncionarioEntrada = document.getElementById(
  "buscaFuncionarioEntrada",
);
const selectFuncionarioEntrada = document.getElementById(
  "selectFuncionarioEntrada",
);
const setorFuncionarioEntrada = document.getElementById(
  "setorFuncionarioEntrada",
);
const qtdEntrada = document.getElementById("qtdEntrada");
const dataEntrada = document.getElementById("dataEntrada");

// elementos do modal de EDITAR EPI
const codigoEdicaoInfo = document.getElementById("codigoEdicaoInfo");
const nomeEdicaoEPI = document.getElementById("nomeEdicaoEPI");
const estoqueMinimoEdicaoEPI = document.getElementById(
  "estoqueMinimoEdicaoEPI",
);

let qtdEditIndex = null;
let epiEditandoIndex = null;

// ================= UTIL =================
function hojeISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

// ================= MODAIS =================
function abrirModalCadastro() {
  inputCodigo.value = "";
  inputNome.value = "";
  inputQtdEPI.value = "";
  inputEstoqueMinimo.value = "";
  modalCadastro.classList.add("show");
}

function abrirModalPedido() {
  editIndex = null;
  preencherSelect();
  limparCamposPedido();
  modalPedido.classList.add("show");
}

function fecharModal() {
  modalCadastro.classList.remove("show");
  modalPedido.classList.remove("show");
  modalQtd.classList.remove("show");
  modalSaida.classList.remove("show");
  modalEntrada.classList.remove("show");
  modalEditarEpi.classList.remove("show");

  qtdEditIndex = null;
  epiMovimentoAtual = null;
  epiEditandoIndex = null;
}

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
        setor: data.setor || "Não informado",
        empresa: data.empresa || "",
      };

      funcionarios.push(f);
      mapaFuncionarios[f.id] = f;
    });

    funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));
  } catch (e) {
    console.error("Erro ao carregar funcionários:", e);
  }
}

function preencherSelectFuncionarios(selectEl, lista) {
  selectEl.innerHTML = "";

  if (lista.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum colaborador encontrado";
    selectEl.appendChild(opt);
    return;
  }

  lista.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.id;
    opt.textContent = f.nome;
    selectEl.appendChild(opt);
  });
}

// ================= FIREBASE: EPIs =================
async function carregarEpisFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "epis"));

    if (!snapshot.empty) {
      tipos = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tipos.push({
          id: docSnap.id,
          nome: data.nome,
          quantidade: data.quantidade || 0,
          estoqueMinimo: data.estoqueMinimo || 0,
        });
      });
      tipos.sort((a, b) => a.nome.localeCompare(b.nome));
      salvarTiposLocal();
    }
  } catch (e) {
    console.error("Erro ao carregar EPIs do Firebase, usando cache local:", e);
  }

  preencherSelect();
  renderTipos();
}

async function atualizarQuantidadeFirestore(epiId, novaQuantidade) {
  try {
    await updateDoc(doc(db, "epis", epiId), { quantidade: novaQuantidade });
  } catch (e) {
    console.error("Erro ao atualizar quantidade no Firebase:", e);
  }
}

// ================= CADASTRO EPI =================
async function salvarTipo() {
  const codigo = inputCodigo.value.trim();
  const nome = inputNome.value.trim();
  const quantidade = Number(inputQtdEPI.value);
  const estoqueMinimo = Number(inputEstoqueMinimo.value) || 0;

  if (!codigo) {
    alert("Digite o código do EPI");
    return;
  }

  if (!nome) {
    alert("Digite o nome do EPI");
    return;
  }

  if (quantidade < 0 || isNaN(quantidade)) {
    alert("Digite uma quantidade válida");
    return;
  }

  if (estoqueMinimo < 0) {
    alert("O estoque mínimo não pode ser negativo");
    return;
  }

  const jaExisteLocal = tipos.some(
    (t) => t.id.toLowerCase() === codigo.toLowerCase(),
  );

  if (jaExisteLocal) {
    alert("Já existe um EPI cadastrado com esse código!");
    return;
  }

  try {
    const refExistente = await getDoc(doc(db, "epis", codigo));
    if (refExistente.exists()) {
      alert("Já existe um EPI cadastrado com esse código no Firebase!");
      return;
    }

    await setDoc(doc(db, "epis", codigo), {
      nome,
      quantidade,
      estoqueMinimo,
    });
  } catch (e) {
    console.error("Erro ao salvar EPI no Firebase:", e);
    alert("Não foi possível salvar no Firebase. Verifique sua conexão.");
    return;
  }

  const novoEPI = { id: codigo, nome, quantidade, estoqueMinimo };

  tipos.push(novoEPI);
  salvarTiposLocal();

  preencherSelect();
  renderTipos();
  fecharModal();
}

// ================= EDITAR EPI (nome / estoque mínimo) =================
function abrirModalEditarEpi(i) {
  const epi = tipos[i];
  if (!epi) return;

  epiEditandoIndex = i;

  codigoEdicaoInfo.textContent = `Código: ${epi.id} (não pode ser alterado)`;
  nomeEdicaoEPI.value = epi.nome;
  estoqueMinimoEdicaoEPI.value = epi.estoqueMinimo || 0;

  modalEditarEpi.classList.add("show");
}

async function salvarEdicaoEpi() {
  if (epiEditandoIndex === null) return;

  const epi = tipos[epiEditandoIndex];
  const novoNome = nomeEdicaoEPI.value.trim();
  const novoEstoqueMinimo = Number(estoqueMinimoEdicaoEPI.value);

  if (!novoNome) {
    alert("Digite o nome do EPI");
    return;
  }

  if (isNaN(novoEstoqueMinimo) || novoEstoqueMinimo < 0) {
    alert("Digite um estoque mínimo válido");
    return;
  }

  try {
    await updateDoc(doc(db, "epis", epi.id), {
      nome: novoNome,
      estoqueMinimo: novoEstoqueMinimo,
    });
  } catch (e) {
    console.error("Erro ao editar EPI no Firebase:", e);
    alert("Não foi possível salvar no Firebase. Verifique sua conexão.");
    return;
  }

  tipos[epiEditandoIndex].nome = novoNome;
  tipos[epiEditandoIndex].estoqueMinimo = novoEstoqueMinimo;

  salvarTiposLocal();
  preencherSelect();
  renderTipos();
  fecharModal();
}

// ================= SELECT =================
function preencherSelect() {
  selectEPI.innerHTML = "<option value=''>Selecione um EPI</option>";

  tipos.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.nome;
    opt.textContent = t.nome;
    selectEPI.appendChild(opt);
  });
}

// ================= PEDIDOS =================
function salvarPedido() {
  const item = selectEPI.value;
  const qtd = inputQtd.value;
  const obs = inputObs.value;

  if (!item || !qtd) {
    alert("Preencha os campos!");
    return;
  }

  const novo = { item, qtd, obs };

  if (editIndex !== null) {
    pedidos[editIndex] = novo;
    editIndex = null;
  } else {
    pedidos.push(novo);
  }

  localStorage.setItem("pedidosEPI", JSON.stringify(pedidos));

  fecharModal();
  render();
}

// ================= RENDER =================
function render() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  pedidos.forEach((p, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.item}</td>
      <td>${p.qtd}</td>
      <td>${p.obs || "-"}</td>
      <td>
        <button class="btn-edit" onclick="editar(${i})">✏️</button>
        <button class="btn-delete" onclick="excluir(${i})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

function renderTipos() {
  const listaTipos = document.getElementById("listaTipos");
  listaTipos.innerHTML = "";

  const termo = pesquisaEPI.value.toLowerCase().trim();

  const tiposFiltrados = tipos.filter(
    (epi) =>
      epi.nome.toLowerCase().includes(termo) ||
      epi.id.toLowerCase().includes(termo),
  );

  tiposFiltrados.forEach((epi) => {
    const i = tipos.findIndex((t) => t.id === epi.id);
    if (i === -1) return;

    const minimo = epi.estoqueMinimo || 0;
    const abaixoDoMinimo = minimo > 0 && (epi.quantidade ?? 0) < minimo;

    const tr = document.createElement("tr");
    if (abaixoDoMinimo) tr.classList.add("estoque-baixo");

    tr.innerHTML = `
      <td>${epi.id}</td>
      <td>
        ${epi.nome}
        ${abaixoDoMinimo ? `<span class="badge-minimo" title="Abaixo do estoque mínimo (${minimo})">⚠️ Repor</span>` : ""}
      </td>

      <td>
        <div class="qtd-box">
          <button class="btn-qtd" onclick="registrarSaida(${i})">-</button>

          <span class="qtd-num" onclick="editarQtd(${i})">
            ${epi.quantidade ?? 0}
          </span>

          <button class="btn-qtd" onclick="registrarEntrada(${i})">+</button>
        </div>
      </td>

      <td>
        <button class="btn-edit" onclick="abrirModalEditarEpi(${i})">✏️</button>
        <button class="btn-delete" onclick="excluirTipo(${i})">🗑️</button>
      </td>
    `;

    listaTipos.appendChild(tr);
  });
}

// ================= EXCLUIR (pedidos) =================
function excluir(i) {
  if (!confirm("Deseja excluir este pedido?")) return;
  pedidos.splice(i, 1);
  localStorage.setItem("pedidosEPI", JSON.stringify(pedidos));
  render();
}

function salvarTiposLocal() {
  localStorage.setItem("tiposEPI", JSON.stringify(tipos));
}

function salvarTipos() {
  salvarTiposLocal();
  renderTipos();
}

// ================= EDITAR QUANTIDADE MANUAL =================
function editarQtd(i) {
  qtdEditIndex = i;
  nomeQtdModal.textContent = `EPI: ${tipos[i].nome} (${tipos[i].id})`;
  novaQtdEPI.value = tipos[i].quantidade || 0;
  modalQtd.classList.add("show");
}

async function salvarQtdModal() {
  const valor = Number(novaQtdEPI.value);

  if (qtdEditIndex === null) return;

  if (isNaN(valor) || valor < 0) {
    alert("Digite uma quantidade válida.");
    return;
  }

  tipos[qtdEditIndex].quantidade = valor;
  await atualizarQuantidadeFirestore(tipos[qtdEditIndex].id, valor);

  salvarTipos();
  fecharModal();
}

// ================= EDITAR (pedidos) =================
function editar(i) {
  const p = pedidos[i];
  editIndex = i;

  preencherSelect();
  modalPedido.classList.add("show");

  selectEPI.value = p.item;
  inputQtd.value = p.qtd;
  inputObs.value = p.obs;
}

// ================= EXCLUIR EPI =================
async function excluirTipo(i) {
  if (!confirm("Deseja excluir este EPI?")) return;

  const epiId = tipos[i].id;

  try {
    await deleteDoc(doc(db, "epis", epiId));
  } catch (e) {
    console.error("Erro ao excluir EPI no Firebase:", e);
  }

  tipos.splice(i, 1);
  salvarTiposLocal();

  preencherSelect();
  renderTipos();
}

// ================= UTIL =================
function limparCamposPedido() {
  selectEPI.value = "";
  inputQtd.value = "";
  inputObs.value = "";
}

// ================= MODAL DE SAÍDA =================
function registrarSaida(i) {
  const epi = tipos[i];
  if (!epi) return;

  if ((epi.quantidade || 0) <= 0) {
    alert("Não há estoque disponível desse EPI!");
    return;
  }

  epiMovimentoAtual = { index: i, epi };

  epiSaidaInfo.textContent = `EPI: ${epi.nome} (${epi.id}) — estoque atual: ${epi.quantidade || 0}`;
  buscaFuncionarioSaida.value = "";
  preencherSelectFuncionarios(selectFuncionarioSaida, funcionarios);
  atualizarSetorSaida();

  qtdSaida.value = 1;
  qtdSaida.max = epi.quantidade || 1;
  dataSaida.value = hojeISO();

  modalSaida.classList.add("show");
}

function atualizarSetorSaida() {
  const f = mapaFuncionarios[selectFuncionarioSaida.value];
  setorFuncionarioSaida.textContent = f ? `Setor: ${f.setor}` : "";
}

async function confirmarSaida() {
  if (!epiMovimentoAtual) return;

  const { index, epi } = epiMovimentoAtual;
  const f = mapaFuncionarios[selectFuncionarioSaida.value];
  const qtd = Number(qtdSaida.value);
  const data = dataSaida.value;

  if (!f) {
    alert("Selecione o colaborador!");
    return;
  }

  if (!qtd || qtd <= 0) {
    alert("Digite uma quantidade válida!");
    return;
  }

  if (qtd > (epi.quantidade || 0)) {
    alert("Quantidade maior que o estoque disponível!");
    return;
  }

  if (!data) {
    alert("Selecione a data!");
    return;
  }

  const novaQuantidade = (epi.quantidade || 0) - qtd;
  tipos[index].quantidade = novaQuantidade;

  await atualizarQuantidadeFirestore(epi.id, novaQuantidade);

  if (window.movimentarEPI) {
    await window.movimentarEPI(
      epi.id,
      epi.nome,
      "saida",
      qtd,
      f.nome,
      f.setor,
      f.empresa,
      data,
    );
  }

  salvarTipos();
  fecharModal();
}

// ================= MODAL DE ENTRADA =================
function registrarEntrada(i) {
  const epi = tipos[i];
  if (!epi) return;

  epiMovimentoAtual = { index: i, epi };

  epiEntradaInfo.textContent = `EPI: ${epi.nome} (${epi.id}) — estoque atual: ${epi.quantidade || 0}`;

  document.querySelector(
    'input[name="tipoEntrada"][value="reposicao"]',
  ).checked = true;
  colaboradorEntradaBox.style.display = "none";

  buscaFuncionarioEntrada.value = "";
  preencherSelectFuncionarios(selectFuncionarioEntrada, funcionarios);
  atualizarSetorEntrada();

  qtdEntrada.value = 1;
  dataEntrada.value = hojeISO();

  modalEntrada.classList.add("show");
}

function alternarTipoEntrada() {
  const tipo = document.querySelector(
    'input[name="tipoEntrada"]:checked',
  ).value;
  colaboradorEntradaBox.style.display = tipo === "devolucao" ? "block" : "none";
}

function atualizarSetorEntrada() {
  const f = mapaFuncionarios[selectFuncionarioEntrada.value];
  setorFuncionarioEntrada.textContent = f ? `Setor: ${f.setor}` : "";
}

async function confirmarEntrada() {
  if (!epiMovimentoAtual) return;

  const { index, epi } = epiMovimentoAtual;
  const tipo = document.querySelector(
    'input[name="tipoEntrada"]:checked',
  ).value;
  const qtd = Number(qtdEntrada.value);
  const data = dataEntrada.value;

  if (!qtd || qtd <= 0) {
    alert("Digite uma quantidade válida!");
    return;
  }

  if (!data) {
    alert("Selecione a data!");
    return;
  }

  let f = null;
  if (tipo === "devolucao") {
    f = mapaFuncionarios[selectFuncionarioEntrada.value];
    if (!f) {
      alert("Selecione o colaborador que está devolvendo o EPI!");
      return;
    }
  }

  const novaQuantidade = (epi.quantidade || 0) + qtd;
  tipos[index].quantidade = novaQuantidade;

  await atualizarQuantidadeFirestore(epi.id, novaQuantidade);

  if (window.movimentarEPI) {
    await window.movimentarEPI(
      epi.id,
      epi.nome,
      tipo === "devolucao" ? "entrada_devolucao" : "entrada_reposicao",
      qtd,
      f ? f.nome : null,
      f ? f.setor : null,
      f ? f.empresa : null,
      data,
    );
  }

  salvarTipos();
  fecharModal();
}

// ================= INIT =================
async function init() {
  preencherSelect();
  render();
  renderTipos();

  await carregarFuncionarios();
  await carregarEpisFirebase();
}

pesquisaEPI.addEventListener("input", renderTipos);
buscaFuncionarioSaida.addEventListener("input", () => {
  const termo = buscaFuncionarioSaida.value.toLowerCase();
  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo),
  );
  preencherSelectFuncionarios(selectFuncionarioSaida, filtrados);
  atualizarSetorSaida();
});
selectFuncionarioSaida.addEventListener("change", atualizarSetorSaida);

buscaFuncionarioEntrada.addEventListener("input", () => {
  const termo = buscaFuncionarioEntrada.value.toLowerCase();
  const filtrados = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(termo),
  );
  preencherSelectFuncionarios(selectFuncionarioEntrada, filtrados);
  atualizarSetorEntrada();
});
selectFuncionarioEntrada.addEventListener("change", atualizarSetorEntrada);

init();

// ================= GLOBAL =================
window.abrirModalCadastro = abrirModalCadastro;
window.abrirModalPedido = abrirModalPedido;
window.salvarTipo = salvarTipo;
window.salvarPedido = salvarPedido;
window.editar = editar;
window.excluirTipo = excluirTipo;
window.fecharModal = fecharModal;
window.editarQtd = editarQtd;
window.excluir = excluir;
window.salvarQtdModal = salvarQtdModal;
window.registrarEntrada = registrarEntrada;
window.registrarSaida = registrarSaida;
window.confirmarSaida = confirmarSaida;
window.confirmarEntrada = confirmarEntrada;
window.alternarTipoEntrada = alternarTipoEntrada;
window.salvarTipos = salvarTipos;
window.abrirModalEditarEpi = abrirModalEditarEpi;
window.salvarEdicaoEpi = salvarEdicaoEpi;
