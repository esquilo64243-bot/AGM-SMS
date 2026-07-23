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
  ca = null,
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
    ca,
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
        <td>${item.ca || "-"}</td>
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
        <td>${item.ca || "-"}</td>
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
// GRÁFICO DE BARRAS HORIZONTAIS (desenhado direto no jsPDF)
// ===============================
function desenharGraficoBarras(doc, titulo, dados, xInicio, yInicio, larguraGrafico) {
  const alturaBarra = 7;
  const espacoEntreBarras = 4;
  const larguraLabel = 55;

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(titulo, xInicio, yInicio);

  let y = yInicio + 7;

  if (!dados || dados.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text("Sem dados no período.", xInicio, y);
    return y + 8;
  }

  const maxValor = Math.max(...dados.map((d) => d.valor)) || 1;

  dados.forEach((item) => {
    const larguraBarra = (item.valor / maxValor) * larguraGrafico;

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(String(item.label).substring(0, 26), xInicio, y + alturaBarra - 2);

    doc.setFillColor(78, 115, 223);
    doc.rect(xInicio + larguraLabel, y, Math.max(larguraBarra, 1), alturaBarra, "F");

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(String(item.valor), xInicio + larguraLabel + larguraBarra + 3, y + alturaBarra - 1.5);

    y += alturaBarra + espacoEntreBarras;
  });

  return y + 6;
}

// ===============================
// GRÁFICO DE COLUNAS VERTICAIS (desenhado direto no jsPDF)
// ===============================
function desenharGraficoColunas(doc, titulo, dados, xInicio, yInicio, larguraTotal, alturaMaxima) {
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(titulo, xInicio, yInicio);

  const topoGrafico = yInicio + 8;
  const baseline = topoGrafico + alturaMaxima;

  if (!dados || dados.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text("Sem dados no período.", xInicio, topoGrafico + 10);
    return topoGrafico + 20;
  }

  const maxValor = Math.max(...dados.map((d) => d.valor)) || 1;
  const espacamento = larguraTotal / dados.length;
  const larguraColuna = Math.min(espacamento * 0.5, 18);

  dados.forEach((item, idx) => {
    const alturaColuna = (item.valor / maxValor) * alturaMaxima;
    const xColuna = xInicio + idx * espacamento + (espacamento - larguraColuna) / 2;
    const yColuna = baseline - alturaColuna;

    doc.setFillColor(78, 115, 223);
    doc.rect(xColuna, yColuna, larguraColuna, Math.max(alturaColuna, 1), "F");

    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(String(item.valor), xColuna + larguraColuna / 2 - 2, yColuna - 2, { align: "center" });

    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(String(item.label).substring(0, 16), xColuna + larguraColuna / 2, baseline + 15, {
      align: "center",
      angle: 45,
    });
  });

  doc.setDrawColor(210, 210, 210);
  doc.line(xInicio, baseline, xInicio + larguraTotal, baseline);

  return baseline + 24;
}

// ===============================
// GRÁFICO DE PIZZA (desenhado direto no jsPDF, sem plugin)
// ===============================
function desenharFatiaPizza(doc, xCentro, yCentro, raio, anguloInicioGraus, anguloFimGraus) {
  const passos = 24;
  const pontos = [[xCentro, yCentro]];

  for (let i = 0; i <= passos; i++) {
    const anguloAtual = anguloInicioGraus + ((anguloFimGraus - anguloInicioGraus) * i) / passos;
    const rad = (anguloAtual * Math.PI) / 180;
    pontos.push([xCentro + raio * Math.cos(rad), yCentro + raio * Math.sin(rad)]);
  }

  const linhas = [];
  for (let i = 1; i < pontos.length; i++) {
    linhas.push([pontos[i][0] - pontos[i - 1][0], pontos[i][1] - pontos[i - 1][1]]);
  }

  doc.lines(linhas, pontos[0][0], pontos[0][1], [1, 1], "F", true);
}

const CORES_PIZZA = [
  [78, 115, 223],
  [246, 194, 62],
  [46, 204, 113],
  [255, 91, 91],
  [155, 89, 182],
];

function desenharGraficoPizza(doc, titulo, dados, xCentro, yCentro, raio) {
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(titulo, xCentro - raio, yCentro - raio - 8);

  const total = dados.reduce((soma, d) => soma + d.valor, 0);

  if (!dados || dados.length === 0 || total === 0) {
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text("Sem dados no período.", xCentro - raio, yCentro);
    return yCentro + raio + 10;
  }

  let anguloInicial = -90;

  dados.forEach((item, idx) => {
    const fatia = (item.valor / total) * 360;
    const anguloFinal = anguloInicial + fatia;

    doc.setFillColor(...CORES_PIZZA[idx % CORES_PIZZA.length]);
    desenharFatiaPizza(doc, xCentro, yCentro, raio, anguloInicial, anguloFinal);

    anguloInicial = anguloFinal;
  });

  let yLegenda = yCentro + raio + 10;
  dados.forEach((item, idx) => {
    doc.setFillColor(...CORES_PIZZA[idx % CORES_PIZZA.length]);
    doc.rect(xCentro - raio, yLegenda - 3, 4, 4, "F");

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const porcentagem = ((item.valor / total) * 100).toFixed(1);
    doc.text(`${item.label}: ${item.valor} (${porcentagem}%)`, xCentro - raio + 7, yLegenda);

    yLegenda += 6;
  });

  return yLegenda + 6;
}

function somarQuantidadePor(lista, chave) {
  const mapa = {};
  lista.forEach((item) => {
    const k = item[chave] || "Não informado";
    mapa[k] = (mapa[k] || 0) + Number(item.quantidade || 0);
  });
  return Object.entries(mapa)
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
}

// ===============================
// PDF
// ===============================
async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("portrait");

  // ---- busca estoque atual (coleção "epis") pro resumo ----
  let epis = [];
  let estoqueTotal = 0;
  let erroEstoque = null;

  try {
    const snapshot = await getDocs(collection(db, "epis"));

    console.log("Quantidade de EPIs:", snapshot.size);

snapshot.forEach((docSnap) => {
    console.log(docSnap.id, docSnap.data());
});

    if (snapshot.empty) {
      console.warn("A coleção 'epis' voltou vazia do Firestore.");
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const qtd = Number(data.quantidade) || 0;
      epis.push({ id: docSnap.id, nome: data.nome || docSnap.id, quantidade: qtd });
      estoqueTotal += qtd;
    });
    epis.sort((a, b) => a.nome.localeCompare(b.nome));
  } catch (e) {
    console.error("Erro ao buscar estoque para o PDF:", e);
    erroEstoque = e.message || String(e);
    alert("Não foi possível carregar o estoque atual para o PDF:\n" + erroEstoque);
  }

  // ---- dados de análise (baseados nas saídas) ----
  const saidasHistorico = historicoEPI.filter((item) => item.tipo === "saida");

  const rankingEpi = somarQuantidadePor(saidasHistorico, "epi").slice(0, 5);
  const rankingSetor = somarQuantidadePor(saidasHistorico, "setor");
  const rankingColaborador = somarQuantidadePor(saidasHistorico, "colaborador").slice(0, 5);
  const rankingDias = somarQuantidadePor(saidasHistorico, "dia").slice(0, 5);

  const larguraPagina = doc.internal.pageSize.getWidth();
  const margemX = 14;
  const larguraUtil = larguraPagina - margemX * 2;

  // ---- PÁGINA 1: RESUMO — EPI mais retirado + Colaborador ----
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("RELATÓRIO DE EPI — RESUMO", margemX, 18);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margemX, 25);

  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  if (erroEstoque) {
    doc.setTextColor(214, 48, 49);
    doc.text("Estoque total atual: erro ao carregar (ver console)", margemX, 34);
  } else {
    doc.text(`Estoque total atual: ${estoqueTotal} unidades`, margemX, 34);
  }

  let y = desenharGraficoColunas(doc, "EPI mais retirado (saídas)", rankingEpi, margemX, 46, larguraUtil, 45);
  desenharGraficoBarras(doc, "Colaborador que mais retirou", rankingColaborador, margemX, y + 6, larguraUtil - 65);

  // ---- PÁGINA 2: Setor (pizza) + Dia com mais saídas ----
  doc.addPage();
  let y2 = 18;

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("SETOR E DIAS DE MAIOR SAÍDA", margemX, y2);
  y2 += 20;

  const xCentroPizza = larguraPagina / 2;
  y2 = desenharGraficoPizza(doc, "Setor que mais retira", rankingSetor, xCentroPizza, y2 + 25, 25) + 10;

  if (rankingDias.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(214, 48, 49);
    doc.text(`Dia com mais saídas: ${rankingDias[0].label} (${rankingDias[0].valor} unid.)`, margemX, y2);
    y2 += 10;
  }

  desenharGraficoColunas(doc, "Top dias com mais saídas", rankingDias, margemX, y2, larguraUtil, 45);

  // ---- PÁGINA 3: ESTOQUE ATUAL ----
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("ESTOQUE ATUAL", margemX, 18);

  if (epis.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(214, 48, 49);
    doc.text(
      erroEstoque
        ? "Não foi possível carregar o estoque (erro de conexão com o Firebase)."
        : "Nenhum EPI encontrado na coleção 'epis'.",
      margemX,
      28,
    );
  } else {
    doc.autoTable({
      startY: 25,
      head: [["Código", "Nome", "Quantidade"]],
      body: epis.map((e) => [e.id, e.nome, String(e.quantidade)]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [246, 194, 62], textColor: [30, 30, 30] },
    });
  }

  // ---- PÁGINA 4+: ENTRADAS E SAÍDAS (histórico completo) ----
  doc.addPage();

  const entradas = [];
  const saidas = [];

  historicoEPI.forEach((item) => {
    if (item.tipo === "saida") {
      saidas.push([
    item.epi,
    item.ca || "-",
    item.colaborador || "-",
    item.setor || "-",
    String(item.quantidade),
    item.dia
]);
    } else {
      entradas.push([item.epi, ROTULO_TIPO[item.tipo] || item.tipo, item.colaborador || "-", String(item.quantidade), item.dia]);
    }
  });

  let y3 = 18;

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("ENTRADAS DE EPI", margemX, y3);
  y3 += 5;

  doc.autoTable({
    startY: y3,
    head: [["Item", "Tipo", "Colaborador", "Qtd", "Data"]],
    body: entradas,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, valign: "middle" },
    headStyles: { fillColor: [40, 40, 40] },
  });

  doc.addPage();
  let y4 = 18;

  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("SAÍDAS DE EPI", margemX, y4);
  y4 += 5;

  doc.autoTable({
    startY: y4,
    head: [["Item","CA", "Colaborador", "Setor", "Qtd", "Data"]],
    body: saidas,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, valign: "middle" },
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