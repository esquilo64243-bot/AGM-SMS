import { db } from "../../../01_HOME/js/firebase.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const totalInspecoes = document.getElementById("totalInspecoes");
const totalNCPeriodo = document.getElementById("totalNCPeriodo");
const totalConformesPeriodo = document.getElementById("totalConformesPeriodo");
const percentualNC = document.getElementById("percentualNC");
const percentualConformes = document.getElementById("percentualConformes");
const itemMaisRecorrente = document.getElementById("itemMaisRecorrente");
const qtdItemMaisRecorrente = document.getElementById("qtdItemMaisRecorrente");
const rankingNC = document.getElementById("rankingNC");
const rankingMaquinasNC = document.getElementById("rankingMaquinasNC");
const alertaOperacional = document.getElementById("alertaOperacional");
const textoPeriodo = document.getElementById("textoPeriodo");

const botoesPeriodo = document.querySelectorAll(".btn-periodo");

let checklists = [];
let periodoSelecionado = "mes";

function temNaoConformidade(checklist) {
  return checklist.respostas?.some((item) => item.resposta === "NC");
}

function obterDataChecklist(checklist) {
  if (checklist.data) {
    const [ano, mes, dia] = checklist.data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  if (checklist.criadoEm?.seconds) {
    return new Date(checklist.criadoEm.seconds * 1000);
  }

  return null;
}

function checklistDentroPeriodo(checklist) {
  if (periodoSelecionado === "total") return true;

  const dataChecklist = obterDataChecklist(checklist);
  if (!dataChecklist) return false;

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = new Date(hoje);

  if (periodoSelecionado === "mes") {
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);
  }

  if (periodoSelecionado === "3meses") {
    inicio.setMonth(inicio.getMonth() - 3);
    inicio.setHours(0, 0, 0, 0);
  }

  return dataChecklist >= inicio && dataChecklist <= hoje;
}

function porcentagem(valor, total) {
  if (!total) return 0;
  return Math.round((valor / total) * 100);
}

function criarRanking(dados, vazio) {
  if (!dados.length) {
    return `<p class="ranking-vazio">${vazio}</p>`;
  }

  const maiorQuantidade = dados[0][1];

  return dados
    .slice(0, 5)
    .map(([nome, quantidade], index) => {
      const largura = maiorQuantidade
        ? Math.max((quantidade / maiorQuantidade) * 100, 8)
        : 0;

      return `
        <div class="ranking-item">
          <div class="ranking-info">
            <span class="ranking-posicao">${index + 1}</span>
            <strong>${nome}</strong>
            <b>${quantidade}</b>
          </div>

          <div class="ranking-barra">
            <span style="width: ${largura}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderizarDashboard() {
  const checklistsPeriodo = checklists.filter(checklistDentroPeriodo);

  const total = checklistsPeriodo.length;
  const comNC = checklistsPeriodo.filter(temNaoConformidade);
  const conformes = total - comNC.length;

  totalInspecoes.textContent = total;
  totalNCPeriodo.textContent = comNC.length;
  totalConformesPeriodo.textContent = conformes;
  percentualNC.textContent = `${porcentagem(comNC.length, total)}% das inspeções`;
  percentualConformes.textContent = `${porcentagem(conformes, total)}% das inspeções`;

  const ocorrenciasItens = {};
  const ocorrenciasMaquinas = {};

  comNC.forEach((checklist) => {
    const maquina = checklist.modelo || "Máquina não informada";

    ocorrenciasMaquinas[maquina] = (ocorrenciasMaquinas[maquina] || 0) + 1;

    checklist.respostas
      ?.filter((item) => item.resposta === "NC")
      .forEach((item) => {
        const nomeItem = item.pergunta || "Item não identificado";

        ocorrenciasItens[nomeItem] = (ocorrenciasItens[nomeItem] || 0) + 1;
      });
  });

  const rankingItens = Object.entries(ocorrenciasItens).sort(
    (a, b) => b[1] - a[1],
  );

  const rankingMaquinas = Object.entries(ocorrenciasMaquinas).sort(
    (a, b) => b[1] - a[1],
  );

  if (rankingItens.length) {
    itemMaisRecorrente.textContent = rankingItens[0][0];
    qtdItemMaisRecorrente.textContent = `${rankingItens[0][1]} ocorrência${
      rankingItens[0][1] > 1 ? "s" : ""
    }`;
  } else {
    itemMaisRecorrente.textContent = "-";
    qtdItemMaisRecorrente.textContent = "Nenhuma NC no período";
  }

  rankingNC.innerHTML = criarRanking(
    rankingItens,
    "Nenhuma não conformidade encontrada no período.",
  );

  rankingMaquinasNC.innerHTML = criarRanking(
    rankingMaquinas,
    "Nenhuma máquina com não conformidade no período.",
  );

  const textosPeriodo = {
    mes: "Neste mês",
    "3meses": "Nos últimos 3 meses",
    total: "No histórico completo",
  };

  textoPeriodo.textContent = textosPeriodo[periodoSelecionado];

  if (!total) {
    alertaOperacional.innerHTML = `
      <strong>Sem dados no período selecionado.</strong>
      <span>Altere o período para visualizar os indicadores.</span>
    `;
    alertaOperacional.classList.remove("ativo");
    return;
  }

  if (!comNC.length) {
    alertaOperacional.innerHTML = `
      <strong>Operação conforme no período.</strong>
      <span>Nenhuma não conformidade foi registrada.</span>
    `;
    alertaOperacional.classList.remove("ativo");
    return;
  }

  const itemCritico = rankingItens[0];
  const maquinaCritica = rankingMaquinas[0];

  alertaOperacional.innerHTML = `
    <strong>Atenção operacional:</strong>
    <span>
      O item <b>${itemCritico[0]}</b> apareceu ${itemCritico[1]} vez(es) como NC.
      A máquina com mais registros foi <b>${maquinaCritica[0]}</b>.
    </span>
  `;
  alertaOperacional.classList.add("ativo");
}

async function carregarDashboard() {
  try {
    const snapshot = await getDocs(collection(db, "checklists"));

    checklists = [];

    snapshot.forEach((doc) => {
      const dados = doc.data();

      if (dados.tipo === "Atracação de Navio") {
        checklists.push({
          id: doc.id,
          ...dados,
        });
      }
    });

    renderizarDashboard();
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);

    alertaOperacional.innerHTML = `
      <strong>Não foi possível carregar o dashboard.</strong>
      <span>Verifique o console e a conexão com o Firebase.</span>
    `;
    alertaOperacional.classList.add("ativo");
  }
}

botoesPeriodo.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesPeriodo.forEach((item) => item.classList.remove("ativo"));

    botao.classList.add("ativo");
    periodoSelecionado = botao.dataset.periodo;

    renderizarDashboard();
  });
});

document.querySelectorAll(".btn-pasta").forEach((botao) => {
  botao.addEventListener("click", () => {
    const pasta = botao.closest(".menu-pasta");

    document.querySelectorAll(".menu-pasta").forEach((outraPasta) => {
      if (outraPasta !== pasta) {
        outraPasta.classList.remove("aberta");
      }
    });

    pasta.classList.toggle("aberta");
  });
});

carregarDashboard();
