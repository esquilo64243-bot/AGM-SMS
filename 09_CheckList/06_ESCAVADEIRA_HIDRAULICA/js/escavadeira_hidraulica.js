import { db } from "../../../01_HOME/js/firebase.js";
console.log("🔥 firebase.js carregado");

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

const buscar = document.getElementById("buscar");
const filtroStatus = document.getElementById("filtroStatus");

const filtroMaquina = document.getElementById("filtroMaquina");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const paginacao = document.getElementById("paginacao");

let paginaAtual = 1;
const itensPorPagina = 10;

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

  snapshot.forEach((doc) => {
    const dados = doc.data();

    if (dados.tipo === "Escavadeira Hidraulica") {
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

  preencherFiltroMaquinas();
  renderizarChecklists();
}

function preencherFiltroMaquinas() {
  const maquinaSelecionada = filtroMaquina.value;

  const maquinas = [
    ...new Set(
      checklists
        .map((checklist) => checklist.modelo)
        .filter((modelo) => modelo && String(modelo).trim() !== ""),
    ),
  ].sort();

  filtroMaquina.innerHTML = `
    <option value="">Todas as máquinas</option>
    ${maquinas
      .map((maquina) => `<option value="${maquina}">${maquina}</option>`)
      .join("")}
  `;

  filtroMaquina.value = maquinaSelecionada;
}

function renderizarPaginacao(totalItens) {
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);

  if (totalPaginas <= 1) {
    paginacao.innerHTML = "";
    return;
  }

  let html = `
    <button class="btn-pagina" data-pagina="${paginaAtual - 1}" ${
      paginaAtual === 1 ? "disabled" : ""
    }>
      ←
    </button>
  `;

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    html += `
      <button
        class="btn-pagina ${pagina === paginaAtual ? "ativo" : ""}"
        data-pagina="${pagina}"
      >
        ${pagina}
      </button>
    `;
  }

  html += `
    <button class="btn-pagina" data-pagina="${paginaAtual + 1}" ${
      paginaAtual === totalPaginas ? "disabled" : ""
    }>
      →
    </button>
  `;

  paginacao.innerHTML = html;
}

function renderizarChecklists() {
  const textoBusca = buscar.value.toLowerCase();
  const status = filtroStatus.value;
  const maquina = filtroMaquina.value;
  const inicio = dataInicio.value;
  const fim = dataFim.value;

  const filtrados = checklists.filter((checklist) => {
    const possuiNC = temNaoConformidade(checklist);

    const operador = (checklist.operador || "").toLowerCase();
    const modelo = String(checklist.modelo || "");
    const data = checklist.data || "";

    const passaBusca =
      operador.includes(textoBusca) ||
      modelo.toLowerCase().includes(textoBusca);
    const passaMaquina = maquina === "" || modelo === maquina;

    const passaStatus =
      status === "" ||
      (status === "com-nc" && possuiNC) ||
      (status === "conforme" && !possuiNC);

    const passaDataInicio = !inicio || data >= inicio;
    const passaDataFim = !fim || data <= fim;

    return (
      passaBusca &&
      passaMaquina &&
      passaStatus &&
      passaDataInicio &&
      passaDataFim
    );
  });

  totalChecklists.textContent = checklists.length;
  totalNC.textContent = checklists.filter(temNaoConformidade).length;
  totalConformes.textContent = checklists.filter(
    (checklist) => !temNaoConformidade(checklist),
  ).length;

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);

  if (paginaAtual > totalPaginas && totalPaginas > 0) {
    paginaAtual = totalPaginas;
  }

  const inicioPagina = (paginaAtual - 1) * itensPorPagina;
  const checklistsDaPagina = filtrados.slice(
    inicioPagina,
    inicioPagina + itensPorPagina,
  );

  if (filtrados.length === 0) {
    listaChecklists.innerHTML = "<p>Nenhum checklist encontrado.</p>";
    paginacao.innerHTML = "";
    return;
  }

  listaChecklists.innerHTML = checklistsDaPagina
    .map((checklist) => {
      const possuiNC = temNaoConformidade(checklist);

      return `
        <article class="check-card ${possuiNC ? "com-nc" : ""}" data-id="${checklist.id}">
          <h2>${checklist.tipo || "Checklist"}</h2>

          <div class="check-info">
            <p><strong>Operador:</strong> ${checklist.operador || "-"}</p>
            <p><strong>Máquina:</strong> ${checklist.modelo || "-"}</p>
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

  renderizarPaginacao(filtrados.length);
}

function temNaoConformidade(checklist) {
  return checklist.respostas?.some((item) => item.resposta === "NC");
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
          <img src="../../../assets/logo_AGM.png" />
        </div>

        <div class="doc-titulo">
          <h2>CHECK LIST</h2>
          <h1>Escavadeira Hidraulica</h1>
        </div>

        <div class="doc-codigo">
          <p>Código: 001</p>
          <p>Revisão: 00</p>
          <p>Pag. 1/1</p>
        </div>
      </div>

      <table class="tabela-dados">
        <tr>
          <td colspan="4"><strong>Marca / Modelo:</strong> ${checklist.modelo || ""}</td>
        </tr>
        <tr>
  <td colspan="2">
    <strong>Inspecionado por:</strong> ${checklist.operador || ""}
  </td>

  <td colspan="2">
  </td>
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

      <table style="width:100%; margin-top:15px; border-collapse:collapse;">
  <tr>
    <td style="width:50%; font-size:12px;">
      EM CONDIÇÕES DE OPERAR ( ${checklist.condicaoOperacao === "operando" ? "X" : "&nbsp;&nbsp;"} )
<br>
SEM CONDIÇÕES DE OPERAR ( ${checklist.condicaoOperacao === "parado" ? "X" : "&nbsp;&nbsp;"} )
    </td>

    <td style="width:50%; text-align:center;">
  <div style="
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:flex-end;
    height:120px;
  ">

    ${
      checklist.assinatura
        ? `<img src="${checklist.assinatura}" style="height:80px; max-width:200px; margin-bottom:6px;" />`
        : "<span style='margin-bottom:6px;'>Sem assinatura</span>"
    }

    <div style="
      width:220px;
      border-top:1px solid #000;
      margin-bottom:5px;
    "></div>

    <span style="font-size:12px;">
      Assinatura do operador
    </span>

  </div>
</td>
  </tr>
</table>

      <button class="btn-imprimir" id="btnGerarPDF">
  Gerar PDF
</button>
</div>
`;
}

document.addEventListener("click", async (event) => {
  if (event.target.id !== "btnGerarPDF") return;

  const elemento = document.querySelector(".documento-checklist");
  const botao = document.getElementById("btnGerarPDF");

  try {
    botao.style.display = "none";
    document.body.classList.add("pdf-exportando");

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1);
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("portrait", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 2;

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const finalHeight = pageHeight - margin * 2;
    const finalWidth = pageWidth - margin * 2;

    const x = (pageWidth - finalWidth) / 2;
    const y = margin;

    pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
    pdf.save("checklist-pa-carregadeira.pdf");
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro ao gerar PDF. Veja o console.");
  } finally {
    document.body.classList.remove("pdf-exportando");
    botao.style.display = "";
  }
});
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

function aplicarFiltros() {
  paginaAtual = 1;
  renderizarChecklists();
}

buscar.addEventListener("input", aplicarFiltros);
filtroStatus.addEventListener("change", aplicarFiltros);
filtroMaquina.addEventListener("change", aplicarFiltros);
dataInicio.addEventListener("change", aplicarFiltros);
dataFim.addEventListener("change", aplicarFiltros);

paginacao.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-pagina");

  if (!botao || botao.disabled) return;

  paginaAtual = Number(botao.dataset.pagina);
  renderizarChecklists();
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

carregarChecklists();
