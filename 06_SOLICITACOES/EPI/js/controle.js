console.log("CONTROLE CARREGOU");
// ===============================
// CONTROLE DE EPI (ENTRADA / SAÍDA)
// ===============================

// Carrega dados salvos
let estoqueEPI = JSON.parse(localStorage.getItem("estoqueEPI")) || {};
let historicoEPI = JSON.parse(localStorage.getItem("historicoEPI")) || [];

// ===============================
// SALVAR NO LOCALSTORAGE
// ===============================
function salvarDados() {
  localStorage.setItem("estoqueEPI", JSON.stringify(estoqueEPI));
  localStorage.setItem("historicoEPI", JSON.stringify(historicoEPI));
}

// ===============================
// REGISTRAR MOVIMENTAÇÃO (+ / -)
// ===============================
function movimentarEPI(nomeEPI, tipoMovimento, colaborador = "Desconhecido") {
  const data = new Date();

  const registro = {
    id: Date.now(),
    epi: nomeEPI,
    tipo: tipoMovimento, // "+" ou "-"
    colaborador: colaborador,
    dataISO: data.toISOString(),
    dataFormatada: data.toLocaleString("pt-BR"),
    dia: data.toLocaleDateString("pt-BR")
  };

  // garante estoque do EPI
  if (!estoqueEPI[nomeEPI]) {
    estoqueEPI[nomeEPI] = 0;
  }

  // lógica de entrada e saída
  if (tipoMovimento === "+") {
    estoqueEPI[nomeEPI] += 1;
  } else if (tipoMovimento === "-") {
    estoqueEPI[nomeEPI] -= 1;
    if (estoqueEPI[nomeEPI] < 0) estoqueEPI[nomeEPI] = 0;
  }

  historicoEPI.unshift(registro);

  salvarDados();

  console.log("Movimentação registrada:", registro);
  atualizarInterface();
  renderHistorico();
}

console.log("movimentarEPI global:", typeof window.movimentarEPI);

// ===============================
// PEGAR HISTÓRICO POR EPI
// ===============================
function filtrarHistoricoPorEPI(nomeEPI) {
  return historicoEPI.filter(item => item.epi === nomeEPI);
}

// ===============================
// PEGAR HISTÓRICO POR DIA
// ===============================
function filtrarHistoricoPorDia(dia) {
  return historicoEPI.filter(item => item.dia === dia);
}

// ===============================
// ATUALIZAR ESTOQUE NA TELA
// ===============================
function atualizarInterface() {
  const container = document.getElementById("listaEstoque");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(estoqueEPI).forEach(epi => {
    const div = document.createElement("div");

    div.innerHTML = `
      <strong>${epi}</strong> 
      <span>Quantidade: ${estoqueEPI[epi]}</span>
      <button onclick="movimentarEPI('${epi}', '+')">+</button>
      <button onclick="movimentarEPI('${epi}', '-')">-</button>
    `;

    container.appendChild(div);
  });
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

  const agrupado = {};

  historicoEPI.forEach(item => {
    const chave = `${item.epi}_${item.dia}_${item.tipo}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        epi: item.epi,
        dia: item.dia,
        tipo: item.tipo,
        qtd: 0
      };
    }

    agrupado[chave].qtd += 1;
  });

  Object.values(agrupado).forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.epi}</td>
      <td>${item.qtd}</td>
      <td>${item.dia}</td>
    `;

    if (item.tipo === "+") {
      entradas.appendChild(tr);
    } else {
      saidas.appendChild(tr);
    }
  });
}

function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");

  const entradas = [];
  const saidas = [];

  const agrupado = {};

  historicoEPI.forEach(item => {
    const chave = `${item.epi}_${item.dia}_${item.tipo}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        epi: item.epi,
        dia: item.dia,
        tipo: item.tipo,
        qtd: 0
      };
    }

    agrupado[chave].qtd += 1;
  });

  Object.values(agrupado).forEach(item => {
    const linha = [
      item.epi,
      String(item.qtd),
      item.dia
    ];

    if (item.tipo === "+") {
      entradas.push(linha);
    } else {
      saidas.push(linha);
    }
  });

  let y = 15;

  // ================= ENTRADAS =================
  doc.setFontSize(16);
  doc.text("ENTRADAS DE EPI", 14, y);
  y += 5;

  doc.autoTable({
    startY: y,
    head: [["Item", "Qtd", "Data"]],
    body: entradas,
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 3,
      valign: "middle"
    },
    headStyles: {
      fillColor: [40, 40, 40]
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ================= SAÍDAS =================
  doc.setFontSize(16);
  doc.text("SAÍDAS DE EPI", 14, y);
  y += 5;

  doc.autoTable({
    startY: y,
    head: [["Item", "Qtd", "Data"]],
    body: saidas,
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 3,
      valign: "middle"
    },
    headStyles: {
      fillColor: [80, 80, 80]
    }
  });

  doc.save("Relatorio_EPI.pdf");
}

function limparHistorico() {
  const confirmar = confirm("Tem certeza que deseja apagar todo o histórico?");

  if (!confirmar) return;

  historicoEPI = [];

  localStorage.setItem("historicoEPI", JSON.stringify(historicoEPI));

  renderHistorico();

  console.log("🧹 Histórico limpo");
}

// ===============================
// INICIALIZAÇÃO
// ===============================
function initControle() {
  atualizarInterface();
  renderHistorico();

  window.movimentarEPI = movimentarEPI;
  window.atualizarInterface = atualizarInterface;
  window.renderHistorico = renderHistorico;
  window.limparHistorico = limparHistorico;
  window.gerarPDF = gerarPDF;

  console.log("🔥 CONTROLE PRONTO GLOBAL");
}

initControle();