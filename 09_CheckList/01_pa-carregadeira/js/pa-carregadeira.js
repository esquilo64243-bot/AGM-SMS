import { db } from "../../../01_HOME/js/firebase.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const listaChecklists = document.getElementById("listaChecklists");
const totalChecklists = document.getElementById("totalChecklists");
const totalNC = document.getElementById("totalNC");
const totalConformes = document.getElementById("totalConformes");

const alertaOperacional = document.getElementById("alertaOperacional");

const botoesPeriodo = document.querySelectorAll(".btn-periodo");

let periodoSelecionado = "mes";

const itemMaisRecorrente = document.getElementById("itemMaisRecorrente");
const qtdItemMaisRecorrente = document.getElementById("qtdItemMaisRecorrente");
const equipamentoMaisNC = document.getElementById("equipamentoMaisNC");
const qtdEquipamentoMaisNC = document.getElementById("qtdEquipamentoMaisNC");
const rankingNC = document.getElementById("rankingNC");

const buscar = document.getElementById("buscar");
const filtroStatus = document.getElementById("filtroStatus");

const modalDetalhes = document.getElementById("modalDetalhes");
const conteudoModal = document.getElementById("conteudoModal");
const fecharModal = document.getElementById("fecharModal");

const modalExcluir = document.getElementById("modalExcluir");
const cancelarExclusao = document.getElementById("cancelarExclusao");
const confirmarExclusao = document.getElementById("confirmarExclusao");

let checklistParaExcluir = null;

let checklists = [];

async function carregarChecklists() {
  listaChecklists.innerHTML = "<p>Carregando checklists...</p>";

  const snapshot = await getDocs(collection(db, "checklists"));

  checklists = [];

  // Excluir depois
  //TESTE...
  //Excluir depois

  snapshot.forEach((doc) => {
    const dados = doc.data();

    if (dados.tipo === "Pá Carregadeira") {
      checklists.push({
        id: doc.id,
        ...dados,
      });
    }
  });

  checklists.sort((a, b) => {
    const dataA = a.criadoEm?.seconds || 0;
    const dataB = b.criadoEm?.seconds || 0;

    return dataB - dataA;
  });

  console.log(checklists);

  renderizarChecklists();
}

function temNaoConformidade(checklist) {
  return checklist.respostas?.some((item) => item.resposta === "NC");
}

function checklistDentroPeriodo(checklist) {
  if (periodoSelecionado === "total") {
    return true;
  }

  if (!checklist.data) return false;

  const dataChecklist = new Date(checklist.data);
  const hoje = new Date();

  if (periodoSelecionado === "mes") {
    return (
      dataChecklist.getMonth() === hoje.getMonth() &&
      dataChecklist.getFullYear() === hoje.getFullYear()
    );
  }

  if (periodoSelecionado === "3meses") {
    const limite = new Date();
    limite.setMonth(hoje.getMonth() - 3);

    return dataChecklist >= limite;
  }

  return true;
}

function renderizarDashboardNC() {
  const recorrenciaItens = {};
  const recorrenciaEquipamentos = {};

  checklists.filter(checklistDentroPeriodo).forEach((checklist) => {
    const modelo = checklist.modelo || "Não informado";

    checklist.respostas?.forEach((item) => {
      if (item.resposta !== "NC") return;

      recorrenciaItens[item.pergunta] =
        (recorrenciaItens[item.pergunta] || 0) + 1;

      recorrenciaEquipamentos[modelo] =
        (recorrenciaEquipamentos[modelo] || 0) + 1;
    });
  });

  const itensOrdenados = Object.entries(recorrenciaItens).sort(
    (a, b) => b[1] - a[1],
  );

  const equipamentosOrdenados = Object.entries(recorrenciaEquipamentos).sort(
    (a, b) => b[1] - a[1],
  );

  const itemTop = itensOrdenados[0];
  const equipamentoTop = equipamentosOrdenados[0];

  itemMaisRecorrente.textContent = itemTop ? itemTop[0] : "-";
  qtdItemMaisRecorrente.textContent = itemTop
    ? `${itemTop[1]} ocorrência(s)`
    : "0 ocorrências";

  equipamentoMaisNC.textContent = equipamentoTop ? equipamentoTop[0] : "-";
  qtdEquipamentoMaisNC.textContent = equipamentoTop
    ? `${equipamentoTop[1]} ocorrência(s)`
    : "0 ocorrências";

  if (itensOrdenados.length === 0) {
    itemMaisRecorrente.textContent = "-";
    qtdItemMaisRecorrente.textContent = "0 ocorrências";
    equipamentoMaisNC.textContent = "-";
    qtdEquipamentoMaisNC.textContent = "0 ocorrências";
    rankingNC.innerHTML = "<p>Nenhuma NC registrada neste período.</p>";
    alertaOperacional.innerHTML = "";
    return;
  }

  const maiorValor = itensOrdenados[0][1];

  rankingNC.innerHTML = itensOrdenados
    .slice(0, 5)
    .map(([item, quantidade]) => {
      const largura = (quantidade / maiorValor) * 100;

      return `
        <div class="ranking-item">
          <div class="ranking-topo">
            <span>${item}</span>
            <strong>${quantidade}</strong>
          </div>

          <div class="ranking-barra">
            <div class="ranking-preenchimento" style="width: ${largura}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  if (equipamentoTop && equipamentoTop[1] >= 5) {
    alertaOperacional.innerHTML = `
    <div class="alerta-operacional">
      <h4>⚠️ ALERTA OPERACIONAL</h4>

      <p>
        O equipamento <strong>${equipamentoTop[0]}</strong>
        apresentou <strong>${equipamentoTop[1]} NC</strong>
        no período analisado.
      </p>

      <p>
        Recomenda-se avaliação da manutenção e análise das recorrências.
      </p>
    </div>
  `;
  } else {
    alertaOperacional.innerHTML = "";
  }
}

function renderizarChecklists() {
  const textoBusca = buscar.value.toLowerCase();
  const status = filtroStatus.value;

  let filtrados = checklists.filter((checklist) => {
    const possuiNC = temNaoConformidade(checklist);

    const textoCompleto = `
      ${checklist.operador || ""}
      ${checklist.modelo || ""}
      ${checklist.data || ""}
      ${checklist.turno || ""}
    `.toLowerCase();

    const passaBusca = textoCompleto.includes(textoBusca);

    const passaStatus =
      status === "" ||
      (status === "com-nc" && possuiNC) ||
      (status === "conforme" && !possuiNC);

    return passaBusca && passaStatus;
  });

  totalChecklists.textContent = checklists.length;
  totalNC.textContent = checklists.filter(temNaoConformidade).length;
  totalConformes.textContent = checklists.filter(
    (c) => !temNaoConformidade(c),
  ).length;

  renderizarDashboardNC();

  if (filtrados.length === 0) {
    listaChecklists.innerHTML = "<p>Nenhum checklist encontrado.</p>";
    return;
  }

  listaChecklists.innerHTML = filtrados
    .map((checklist) => {
      const possuiNC = temNaoConformidade(checklist);

      return `
          <article class="check-card ${possuiNC ? "com-nc" : ""}" data-id="${checklist.id}">
            <h2>${checklist.tipo || "Checklist"}</h2>

            <div class="check-info">
              <p><strong>Operador:</strong> ${checklist.operador || "-"}</p>
              <p><strong>Modelo:</strong> ${checklist.modelo || "-"}</p>
              <p><strong>Data:</strong> ${formatarData(checklist.data)}</p>
              <p><strong>Turno:</strong> ${checklist.turno || "-"}</p>
            </div>

            <span class="badge ${possuiNC ? "nc" : "ok"}">
              ${possuiNC ? "COM NÃO CONFORMIDADE" : "SEM NÃO CONFORMIDADE"}
            </span>

            <button class="btn-excluir-checklist" data-id="${checklist.id}">
  Excluir
</button>
          </article>
        `;
    })
    .join("");
}

function abrirDetalhes(id) {
  const checklist = checklists.find((item) => item.id === id);
  if (!checklist) return;

  conteudoModal.innerHTML = gerarDocumentoChecklist(checklist);
  modalDetalhes.classList.add("ativo");
}

function respostaMarcada(checklist, pergunta, opcao) {
  const item = checklist.respostas?.find((r) => r.pergunta === pergunta);
  return item?.resposta === opcao ? "X" : "";
}

function gerarLinhaChecklist(checklist, pergunta) {
  return `
    <tr>
      <td class="pergunta">${pergunta}</td>
      <td>${respostaMarcada(checklist, pergunta, "C")}</td>
      <td>${respostaMarcada(checklist, pergunta, "NC")}</td>
      <td>${respostaMarcada(checklist, pergunta, "NA")}</td>
    </tr>
  `;
}

function gerarGrupoChecklist(checklist, titulo, itens) {
  return `
    <tr>
      <th colspan="4" class="grupo">${titulo}</th>
    </tr>
    ${itens.map((item) => gerarLinhaChecklist(checklist, item)).join("")}
  `;
}

function gerarDocumentoChecklist(checklist) {
  const gruposPdf = {
    "SISTEMA ELÉTRICO": [
      "Luz dianteira",
      "Luz traseira",
      "Luz de freio",
      "Luz de mudança de direção (setas)",
      "Pisca alerta",
      "Sistema de partida e bateria",
      "Indicador de temperatura",
      "Indicador de combustível",
    ],
    "SISTEMA HIDRÁULICO": [
      "Nível do óleo hidráulico",
      "Mangueiras em geral",
      "Vazamento de óleo",
      "Cilindro de elevação",
      "Nível óleo transmissão",
    ],
    "ESTRUTURA FÍSICA": [
      "Apresenta deformação na estrutura?",
      "Apresenta deformação na lataria?",
      "Todos os vidros em condições?",
      "Limpador de para-brisa em condições?",
      "Lubrificação pinos articulados / possíveis folgas?",
    ],
    MOTOR: [
      "Nível de óleo do motor",
      "Vazamento no motor",
      "Limpeza do radiador",
      "Nível do reservatório",
    ],
    PNEU: [
      "Calibração pneus dianteiros e conservação",
      "Calibração pneus traseiros e conservação",
    ],
    "ITENS DE SEGURANÇA": [
      "Freios",
      "Sirene de ré",
      "Cinto de segurança",
      "Giroflex",
      "Buzina",
      "Retrovisores",
      "Extintor de incêndio",
    ],
  };

  return `
    <div class="documento-checklist">
      <div class="doc-topo">
        <div class="doc-logo">
          <img src="../../../01_HOME/img/Logo_AGM.png" />
        </div>

        <div class="doc-titulo">
          <h2>CHECK LIST</h2>
          <h1>PÁ-CARREGADEIRA</h1>
        </div>

        <div class="doc-codigo">
          <p>Código: 001</p>
          <p>Revisão: 00</p>
          <p>Pag. 1/2</p>
        </div>
      </div>

      <table class="tabela-dados">
        <tr>
          <td colspan="4"><strong>Marca / Modelo:</strong> ${checklist.modelo || ""}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Inspecionado por:</strong> ${checklist.operador || ""}</td>
          <td colspan="2"><strong>Assinatura do operador:</strong></td>
        </tr>
        <tr>
          <td><strong>Data:</strong> ${formatarData(checklist.data)}</td>
          <td><strong>Turno:</strong> ${checklist.turno || ""}</td>
          <td colspan="2"><strong>Condição:</strong> ${checklist.condicaoOperacao || ""}</td>
        </tr>
      </table>

      <table class="tabela-check">
        <thead>
          <tr>
            <th>ITENS A SEREM INSPECIONADOS</th>
            <th class="mini">C</th>
<th class="mini">NC</th>
<th class="mini">NA</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(gruposPdf)
            .map(([titulo, itens]) =>
              gerarGrupoChecklist(checklist, titulo, itens),
            )
            .join("")}
        </tbody>
      </table>

      <p class="legenda">Legenda: C = Conforme | NC = Não Conforme | NA = Não se Aplica</p>

      <p class="alerta-doc">
        Se algum dos itens CRÍTICOS estiver NÃO CONFORME, equipamento não deve operar sem avaliação.
      </p>

      <table class="assinaturas">
        <tr>
          <th colspan="2">Recebido pela manutenção Mecânica</th>
        </tr>
        <tr>
          <td>Responsável:</td>
          <td>Data:</td>
        </tr>
        <tr>
          <td colspan="2">Prazo de entrega à operação:</td>
        </tr>

        <tr>
          <th colspan="2">Recebido pela manutenção Elétrica</th>
        </tr>
        <tr>
          <td>Responsável:</td>
          <td>Data:</td>
        </tr>
        <tr>
          <td colspan="2">Prazo de entrega à operação:</td>
        </tr>
      </table>

      <div class="condicoes-print">
        <span>EM CONDIÇÕES DE OPERAR ( &nbsp;&nbsp; )</span>
        <span>SEM CONDIÇÕES DE OPERAR ( &nbsp;&nbsp; )</span>
      </div>

      <button class="btn-imprimir" onclick="window.print()">Imprimir PDF</button>
    </div>
  `;
}

//Eventos liners

function formatarData(data) {
  if (!data) return "-";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

listaChecklists.addEventListener("click", (event) => {
  const botaoExcluir = event.target.closest(".btn-excluir-checklist");

  if (botaoExcluir) {
    event.stopPropagation();
    checklistParaExcluir = botaoExcluir.dataset.id;
    modalExcluir.classList.add("ativo");
    return;
  }

  const card = event.target.closest(".check-card");

  if (!card) return;

  abrirDetalhes(card.dataset.id);
});

fecharModal.addEventListener("click", () => {
  modalDetalhes.classList.remove("ativo");
});

buscar.addEventListener("input", renderizarChecklists);
filtroStatus.addEventListener("change", renderizarChecklists);

botoesPeriodo.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesPeriodo.forEach((b) => b.classList.remove("ativo"));

    botao.classList.add("ativo");
    periodoSelecionado = botao.dataset.periodo;

    renderizarDashboardNC();
  });
});

cancelarExclusao.addEventListener("click", () => {
  checklistParaExcluir = null;
  modalExcluir.classList.remove("ativo");
});

confirmarExclusao.addEventListener("click", async () => {
  if (!checklistParaExcluir) return;

  try {
    await deleteDoc(doc(db, "checklists", checklistParaExcluir));

    checklistParaExcluir = null;
    modalExcluir.classList.remove("ativo");

    await carregarChecklists();
  } catch (erro) {
    console.error("Erro ao excluir checklist:", erro);
  }
});

carregarChecklists();
