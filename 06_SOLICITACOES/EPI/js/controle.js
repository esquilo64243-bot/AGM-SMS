import { db } from "../../../01_HOME/js/firebase.js";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("CONTROLE CARREGOU");

// ===============================
// CONTROLE DE HISTÓRICO DE EPI (ENTRADA / SAÍDA)
// ===============================

let historicoEPI = JSON.parse(localStorage.getItem("historicoEPI")) || [];
let funcionarios = [];
let mapaFuncionarios = {};
let movimentacaoEditandoId = null;

const TIPOS_ENTRADA = ["entrada_reposicao", "entrada_devolucao"];
const TIPOS_SAIDA = ["saida"];

// Rótulos amigáveis pros tipos de movimentação
const ROTULO_TIPO = {
  saida: "Saída",
  entrada_reposicao: "Reposição",
  entrada_devolucao: "Devolução",
};

// ================= ELEMENTOS DO MODAL DE EDIÇÃO =================
const modalEditarMovimentacao = document.getElementById("modalEditarMovimentacao");
const infoEdicaoMovimentacao = document.getElementById("infoEdicaoMovimentacao");
const tipoEntradaEdicaoBox = document.getElementById("tipoEntradaEdicaoBox");
const colaboradorEdicaoBox = document.getElementById("colaboradorEdicaoBox");
const buscaFuncionarioEdicao = document.getElementById("buscaFuncionarioEdicao");
const selectFuncionarioEdicao = document.getElementById("selectFuncionarioEdicao");
const setorFuncionarioEdicao = document.getElementById("setorFuncionarioEdicao");
const qtdEdicaoMovimentacao = document.getElementById("qtdEdicaoMovimentacao");
const dataEdicaoMovimentacao = document.getElementById("dataEdicaoMovimentacao");

// ===============================
// SALVAR NO LOCALSTORAGE (cache local)
// ===============================
function salvarDados() {
  localStorage.setItem("historicoEPI", JSON.stringify(historicoEPI));
}

// ===============================
// UTIL
// ===============================
function diaParaISO(dia) {
  if (!dia) return "";
  const [d, m, y] = dia.split("/");
  return `${y}-${m}-${d}`;
}

// ===============================
// FIREBASE: FUNCIONÁRIOS (pra edição de colaborador no histórico)
// ===============================
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

function atualizarSetorEdicao() {
  const f = mapaFuncionarios[selectFuncionarioEdicao.value];
  setorFuncionarioEdicao.textContent = f ? `Setor: ${f.setor}` : "";
}

// ===============================
// REGISTRAR MOVIMENTAÇÃO
// tipo: "saida" | "entrada_reposicao" | "entrada_devolucao"
// ===============================
async function movimentarEPI(
  epiId,
  epiNome,
  tipo,
  quantidade = 1,
  colaboradorNome = null,
  colaboradorSetor = null,
  colaboradorEmpresa = null,
  dataMovimento = null,
) {
  const dataUsada = dataMovimento
    ? new Date(`${dataMovimento}T12:00:00`)
    : new Date();

  const registro = {
    id: Date.now(),
    epiId,
    epi: epiNome,
    tipo,
    quantidade,
    colaborador: colaboradorNome,
    setor: colaboradorSetor,
    empresa: colaboradorEmpresa,
    dataISO: dataUsada.toISOString(),
    dataFormatada: dataUsada.toLocaleString("pt-BR"),
    dia: dataUsada.toLocaleDateString("pt-BR"),
    firestoreId: null,
  };

  historicoEPI.unshift(registro);
  salvarDados();
  renderHistorico();

  try {
    const refCriado = await addDoc(collection(db, "movimentacoesEpi"), {
      ...registro,
      criadoEm: serverTimestamp(),
    });

    registro.firestoreId = refCriado.id;
    salvarDados();
  } catch (e) {
    console.error("Erro ao salvar movimentação no Firebase:", e);
  }
}

// ===============================
// CARREGAR HISTÓRICO DO FIREBASE
// ===============================
async function carregarHistoricoFirebase() {
  try {
    const q = query(collection(db, "movimentacoesEpi"), orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      historicoEPI = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        historicoEPI.push({ ...data, firestoreId: docSnap.id });
      });
      salvarDados();
    }
  } catch (e) {
    console.error("Erro ao carregar histórico do Firebase, usando cache local:", e);
  }

  renderHistorico();
}

// ===============================
// FILTROS AUXILIARES
// ===============================
function filtrarHistoricoPorEPI(epiId) {
  return historicoEPI.filter((item) => item.epiId === epiId);
}

function filtrarHistoricoPorDia(dia) {
  return historicoEPI.filter((item) => item.dia === dia);
}

// ===============================
// RENDER DO HISTÓRICO
// ===============================
function renderHistorico() {
  const entradas = document.getElementById("listaEntradas");
  const saidas = document.getElementById("listaSaidas");

  if (!entradas || !saidas) return;

  entradas.innerHTML = "";
  saidas.innerHTML = "";

  historicoEPI.forEach((item) => {
    const tr = document.createElement("tr");

    if (item.tipo === "saida") {
      tr.innerHTML = `
        <td>${item.epi}</td>
        <td>${item.colaborador || "-"}</td>
        <td>${item.setor || "-"}</td>
        <td>${item.quantidade}</td>
        <td>${item.dia}</td>
        <td>
          <button class="btn-edit" onclick="abrirModalEditarMovimentacao(${item.id})">✏️</button>
          <button class="btn-delete" onclick="excluirMovimentacao(${item.id})">🗑️</button>
        </td>
      `;
      saidas.appendChild(tr);
    } else {
      tr.innerHTML = `
        <td>${item.epi}</td>
        <td>${ROTULO_TIPO[item.tipo] || item.tipo}</td>
        <td>${item.colaborador || "-"}</td>
        <td>${item.quantidade}</td>
        <td>${item.dia}</td>
        <td>
          <button class="btn-edit" onclick="abrirModalEditarMovimentacao(${item.id})">✏️</button>
          <button class="btn-delete" onclick="excluirMovimentacao(${item.id})">🗑️</button>
        </td>
      `;
      entradas.appendChild(tr);
    }
  });
}

// ===============================
// EDITAR MOVIMENTAÇÃO
// ===============================
function abrirModalEditarMovimentacao(id) {
  const item = historicoEPI.find((h) => h.id === id);
  if (!item) return;

  movimentacaoEditandoId = id;

  const rotulo = ROTULO_TIPO[item.tipo] || item.tipo;
  infoEdicaoMovimentacao.textContent = `EPI: ${item.epi} — ${rotulo}`;

  qtdEdicaoMovimentacao.value = item.quantidade;
  dataEdicaoMovimentacao.value = diaParaISO(item.dia);

  const precisaColaborador = item.tipo === "saida" || item.tipo === "entrada_devolucao";

  if (item.tipo === "saida") {
    tipoEntradaEdicaoBox.style.display = "none";
  } else {
    tipoEntradaEdicaoBox.style.display = "flex";
    const radio = document.querySelector(
      `input[name="tipoEdicaoEntrada"][value="${item.tipo === "entrada_devolucao" ? "devolucao" : "reposicao"}"]`,
    );
    if (radio) radio.checked = true;
  }

  colaboradorEdicaoBox.style.display = precisaColaborador ? "block" : "none";

  if (precisaColaborador) {
    buscaFuncionarioEdicao.value = "";
    preencherSelectFuncionarios(selectFuncionarioEdicao, funcionarios);

    const match = funcionarios.find(
      (f) => f.nome.toLowerCase() === (item.colaborador || "").toLowerCase(),
    );
    if (match) selectFuncionarioEdicao.value = match.id;

    atualizarSetorEdicao();
  }

  modalEditarMovimentacao.classList.add("show");
}

function alternarTipoEdicaoEntrada() {
  const tipo = document.querySelector('input[name="tipoEdicaoEntrada"]:checked').value;
  colaboradorEdicaoBox.style.display = tipo === "devolucao" ? "block" : "none";
}

async function confirmarEdicaoMovimentacao() {
  if (movimentacaoEditandoId === null) return;

  const index = historicoEPI.findIndex((h) => h.id === movimentacaoEditandoId);
  if (index === -1) return;

  const item = historicoEPI[index];

  const novaQtd = Number(qtdEdicaoMovimentacao.value);
  const novaData = dataEdicaoMovimentacao.value;

  if (!novaQtd || novaQtd <= 0) {
    alert("Digite uma quantidade válida!");
    return;
  }

  if (!novaData) {
    alert("Selecione a data!");
    return;
  }

  let novoTipo = item.tipo;
  let novoColaborador = item.colaborador;
  let novoSetor = item.setor;
  let novaEmpresa = item.empresa;

  if (item.tipo !== "saida") {
    const tipoSelecionado = document.querySelector('input[name="tipoEdicaoEntrada"]:checked').value;
    novoTipo = tipoSelecionado === "devolucao" ? "entrada_devolucao" : "entrada_reposicao";
  }

  const precisaColaborador = novoTipo === "saida" || novoTipo === "entrada_devolucao";

  if (precisaColaborador) {
    const f = mapaFuncionarios[selectFuncionarioEdicao.value];
    if (!f) {
      alert("Selecione o colaborador!");
      return;
    }
    novoColaborador = f.nome;
    novoSetor = f.setor;
    novaEmpresa = f.empresa;
  } else {
    novoColaborador = null;
    novoSetor = null;
    novaEmpresa = null;
  }

  const agoraSaida = novoTipo === "saida";

  let deltaEstoque = 0;
  if (agoraSaida) {
    deltaEstoque = item.quantidade - novaQtd;
  } else {
    deltaEstoque = novaQtd - item.quantidade;
  }

  if (deltaEstoque !== 0) {
    try {
      await updateDoc(doc(db, "epis", item.epiId), {
        quantidade: increment(deltaEstoque),
      });
    } catch (e) {
      console.error("Erro ao ajustar estoque no Firebase:", e);
      alert("Não foi possível ajustar o estoque no Firebase. Verifique sua conexão.");
      return;
    }
  }

  const dataUsada = new Date(`${novaData}T12:00:00`);

  const registroAtualizado = {
    ...item,
    tipo: novoTipo,
    quantidade: novaQtd,
    colaborador: novoColaborador,
    setor: novoSetor,
    empresa: novaEmpresa,
    dataISO: dataUsada.toISOString(),
    dataFormatada: dataUsada.toLocaleString("pt-BR"),
    dia: dataUsada.toLocaleDateString("pt-BR"),
  };

  if (item.firestoreId) {
    try {
      const { firestoreId, ...dadosParaSalvar } = registroAtualizado;
      await updateDoc(doc(db, "movimentacoesEpi", item.firestoreId), dadosParaSalvar);
    } catch (e) {
      console.error("Erro ao atualizar movimentação no Firebase:", e);
    }
  }

  historicoEPI[index] = registroAtualizado;
  salvarDados();
  renderHistorico();
  fecharModalHistorico();
}

// ===============================
// EXCLUIR MOVIMENTAÇÃO (com reversão de estoque)
// ===============================
async function excluirMovimentacao(id) {
  if (!confirm("Excluir este registro? O estoque do EPI será ajustado de volta.")) return;

  const index = historicoEPI.findIndex((h) => h.id === id);
  if (index === -1) return;

  const item = historicoEPI[index];

  const deltaReversao = item.tipo === "saida" ? item.quantidade : -item.quantidade;

  try {
    await updateDoc(doc(db, "epis", item.epiId), {
      quantidade: increment(deltaReversao),
    });
  } catch (e) {
    console.error("Erro ao ajustar estoque no Firebase:", e);
  }

  if (item.firestoreId) {
    try {
      await deleteDoc(doc(db, "movimentacoesEpi", item.firestoreId));
    } catch (e) {
      console.error("Erro ao excluir movimentação no Firebase:", e);
    }
  }

  historicoEPI.splice(index, 1);
  salvarDados();
  renderHistorico();
}

function fecharModalHistorico() {
  modalEditarMovimentacao.classList.remove("show");
  movimentacaoEditandoId = null;
}

// ===============================
// PDF
// ===============================
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const entradas = [];
  const saidas = [];

  historicoEPI.forEach((item) => {
    if (item.tipo === "saida") {
      saidas.push([item.epi, item.colaborador || "-", item.setor || "-", String(item.quantidade), item.dia]);
    } else {
      entradas.push([item.epi, ROTULO_TIPO[item.tipo] || item.tipo, item.colaborador || "-", String(item.quantidade), item.dia]);
    }
  });

  let y = 15;

  doc.setFontSize(16);
  doc.text("ENTRADAS DE EPI", 14, y);
  y += 5;

  doc.autoTable({
    startY: y,
    head: [["Item", "Tipo", "Colaborador", "Qtd", "Data"]],
    body: entradas,
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 3, valign: "middle" },
    headStyles: { fillColor: [40, 40, 40] },
  });

  y = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(16);
  doc.text("SAÍDAS DE EPI", 14, y);
  y += 5;

  doc.autoTable({
    startY: y,
    head: [["Item", "Colaborador", "Setor", "Qtd", "Data"]],
    body: saidas,
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 3, valign: "middle" },
    headStyles: { fillColor: [80, 80, 80] },
  });

  doc.save("Relatorio_EPI.pdf");
}

// ===============================
// LIMPAR HISTÓRICO POR TIPO (entrada ou saída, separado)
// ===============================
async function limparHistoricoPorTipo(tiposParaApagar, mensagemConfirm) {
  if (!confirm(mensagemConfirm)) return;

  try {
    const snapshot = await getDocs(collection(db, "movimentacoesEpi"));

    const promessas = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (tiposParaApagar.includes(data.tipo)) {
        promessas.push(deleteDoc(doc(db, "movimentacoesEpi", docSnap.id)));
      }
    });

    await Promise.all(promessas);

    historicoEPI = historicoEPI.filter((item) => !tiposParaApagar.includes(item.tipo));
    salvarDados();
    renderHistorico();

    alert("Histórico apagado com sucesso!");
  } catch (erro) {
    console.error("Erro ao limpar histórico:", erro);
    alert("Erro ao apagar histórico.");
  }
}

function limparHistoricoEntradas() {
  return limparHistoricoPorTipo(
    TIPOS_ENTRADA,
    "Apagar TODO o histórico de ENTRADAS (reposição + devolução)?\n\nEssa ação NÃO pode ser desfeita.",
  );
}

function limparHistoricoSaidas() {
  return limparHistoricoPorTipo(
    TIPOS_SAIDA,
    "Apagar TODO o histórico de SAÍDAS?\n\nEssa ação NÃO pode ser desfeita.",
  );
}

// ===============================
// INICIALIZAÇÃO
// ===============================
async function initControle() {
  renderHistorico();

  await carregarFuncionarios();
  await carregarHistoricoFirebase();

  if (buscaFuncionarioEdicao) {
    buscaFuncionarioEdicao.addEventListener("input", () => {
      const termo = buscaFuncionarioEdicao.value.toLowerCase();
      const filtrados = funcionarios.filter((f) => f.nome.toLowerCase().includes(termo));
      preencherSelectFuncionarios(selectFuncionarioEdicao, filtrados);
      atualizarSetorEdicao();
    });
    selectFuncionarioEdicao.addEventListener("change", atualizarSetorEdicao);
  }

  console.log("🔥 CONTROLE PRONTO GLOBAL");
}

window.movimentarEPI = movimentarEPI;
window.renderHistorico = renderHistorico;
window.limparHistoricoEntradas = limparHistoricoEntradas;
window.limparHistoricoSaidas = limparHistoricoSaidas;
window.gerarPDF = gerarPDF;
window.filtrarHistoricoPorEPI = filtrarHistoricoPorEPI;
window.filtrarHistoricoPorDia = filtrarHistoricoPorDia;
window.abrirModalEditarMovimentacao = abrirModalEditarMovimentacao;
window.confirmarEdicaoMovimentacao = confirmarEdicaoMovimentacao;
window.alternarTipoEdicaoEntrada = alternarTipoEdicaoEntrada;
window.excluirMovimentacao = excluirMovimentacao;
window.fecharModalHistorico = fecharModalHistorico;

initControle();