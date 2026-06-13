/* ============================= */
/* ELEMENTOS */
/* ============================= */

const buscarEPI =
  document.getElementById("buscarEPI");

const listaSugestoesEPI =
  document.getElementById("listaSugestoesEPI");

const episSelecionadosDiv =
  document.getElementById("episSelecionados");

let episSelecionados = [];

const btnGerarTexto = document.getElementById("btnGerarTexto");
const btnOutraVersao = document.getElementById("btnOutraVersao");

const tipoDocumento = document.getElementById("tipoDocumento");

const checkAGM = document.getElementById("checkAGM");
const checkSerra = document.getElementById("checkSerra");

const logoAGM = document.getElementById("logoAGM");
const logoSerra = document.getElementById("logoSerra");

const numeroPT = document.getElementById("numeroPT");
const dataPT = document.getElementById("dataPT");
const horaInicioPT = document.getElementById("horaInicioPT");
const horaFimPT = document.getElementById("horaFimPT");
const localPT = document.getElementById("localPT");
const setorPT = document.getElementById("setorPT");
const responsavelPT = document.getElementById("responsavelPT");
const atividadePT = document.getElementById("atividadePT");

const textoRiscosPT = document.getElementById("textoRiscosPT");

const episPT = document.getElementById("episPT");
const observacoesPT = document.getElementById("observacoesPT");

const previewNumeroPT = document.getElementById("previewNumeroPT");
const previewDataPT = document.getElementById("previewDataPT");
const previewHoraInicioPT = document.getElementById("previewHoraInicioPT");
const previewHoraFimPT = document.getElementById("previewHoraFimPT");
const previewLocalPT = document.getElementById("previewLocalPT");
const previewSetorPT = document.getElementById("previewSetorPT");
const previewResponsavelPT = document.getElementById(
  "previewResponsavelPT",
);

const previewAtividadePT = document.getElementById(
  "previewAtividadePT",
);

const previewTextoRiscosPT = document.getElementById(
  "previewTextoRiscosPT",
);

const previewEpisPT = document.getElementById(
  "previewEpisPT",
);

const previewObservacoesPT = document.getElementById(
  "previewObservacoesPT",
);

const previewTiposTrabalho = document.getElementById(
  "previewTiposTrabalho",
);

const btnExportar = document.getElementById("btnExportar");

const riscosSelecionados =
  document.querySelectorAll(".risco-check");


/* Lista de EPI */
function renderizarEPIs() {
  episSelecionadosDiv.innerHTML = "";

  episSelecionados.forEach(
    (epi, index) => {
      const tag =
        document.createElement(
          "div",
        );

      tag.className = "tag-epi";

      tag.textContent =
        epi + " ✕";

      tag.addEventListener(
        "click",
        () => {
          episSelecionados.splice(
            index,
            1,
          );

          renderizarEPIs();
        },
      );

      episSelecionadosDiv.appendChild(
        tag,
      );
    },
  );

  episPT.value =
    episSelecionados.join("\n");

  atualizarPreview();
}

buscarEPI.addEventListener("input", () => {
  const busca =
    buscarEPI.value.toLowerCase();

  listaSugestoesEPI.innerHTML = "";

  if (busca.length === 0) return;

  listaEPIs
    .filter((epi) =>
      epi.toLowerCase().includes(busca)
    )
    .slice(0, 8)
    .forEach((epi) => {
      const item =
        document.createElement("div");

      item.className =
        "sugestao-epi";

      item.textContent = epi;

      item.addEventListener(
        "click",
        () => {
          if (
            !episSelecionados.includes(
              epi
            )
          ) {
            episSelecionados.push(epi);
          }

          renderizarEPIs();

          buscarEPI.value = "";

          listaSugestoesEPI.innerHTML =
            "";
        },
      );

      listaSugestoesEPI.appendChild(
        item,
      );
    });
});

const listaEPIs = [
  "Capacete de segurança",
  "Capacete com jugular",
  "Óculos de segurança incolor",
  "Óculos de segurança escuro",
  "Óculos ampla visão",
  "Protetor facial",
  "Máscara de solda",
  "Máscara PFF1",
  "Máscara PFF2",
  "Máscara PFF3",
  "Respirador semifacial",
  "Respirador facial inteiro",
  "Filtro químico para vapores orgânicos",
  "Filtro químico para gases ácidos",
  "Filtro combinado",
  "Protetor auditivo plug",
  "Protetor auditivo concha",
  "Abafador de ruído",
  "Luva de vaqueta",
  "Luva de raspa",
  "Luva de látex",
  "Luva nitrílica",
  "Luva PVC",
  "Luva anticorte",
  "Luva térmica",
  "Luva isolante classe 00",
  "Luva isolante classe 0",
  "Luva isolante classe 1",
  "Luva isolante classe 2",
  "Luva para soldador",
  "Luva química",
  "Creme de proteção para as mãos",
  "Botina de segurança",
  "Botina com biqueira de composite",
  "Botina com biqueira de aço",
  "Botina eletricista",
  "Bota de PVC",
  "Bota de borracha",
  "Perneira de segurança",
  "Perneira de raspa",
  "Avental de raspa",
  "Avental impermeável",
  "Avental químico",
  "Mangote de raspa",
  "Mangote anticorte",
  "Blusão de raspa",
  "Calça de raspa",
  "Conjunto para soldador",
  "Cinto de segurança tipo paraquedista",
  "Talabarte duplo",
  "Talabarte em Y",
  "Talabarte com absorvedor de energia",
  "Trava-quedas",
  "Trava-quedas retrátil",
  "Linha de vida",
  "Mosquetão",
  "Cadeira suspensa",
  "Uniforme operacional",
  "Camisa manga longa",
  "Calça operacional",
  "Colete refletivo",
  "Colete salva-vidas",
  "Capa de chuva",
  "Conjunto impermeável",
  "Macacão impermeável",
  "Macacão de proteção química",
  "Macacão Tyvek",
  "Vestimenta antichama",
  "Balaclava antichama",
  "Capuz de segurança",
  "Touca árabe",
  "Respirador autônomo",
  "Máscara de fuga",
  "Detector multigás",
  "Lanterna intrinsecamente segura",
  "Rádio comunicador",
  "Protetor solar",
  "Repelente",
  "Joelheira",
  "Caneleira",
  "Cinto ergonômico",
  "Protetor de punho",
  "Calçado antiderrapante",
  "Sapato de segurança",
  "Máscara descartável",
  "Face shield",
  "Óculos contra respingos químicos",
  "Luva para eletricista",
  "Manga isolante",
  "Tapete isolante",
  "Capacete classe B",
  "Vestimenta NR-10",
  "Roupa de aproximação ao fogo",
  "Roupa aluminizada",
  "Protetor respiratório para poeira",
  "Protetor respiratório para fumos metálicos",
  "Respirador com filtro para pintura",
  "Luva para alta temperatura",
  "Luva para baixa temperatura",
  "Bota térmica",
  "Bota antiderrapante",
  "Cinto abdominal",
  "Protetor auricular descartável",
  "Protetor auricular reutilizável"
];

/* ============================= */
/* ATUALIZAR PREVIEW */
/* ============================= */

function atualizarPreview() {
  previewNumeroPT.textContent =
    numeroPT.value || "-";

  previewDataPT.textContent =
    formatarDataBR(dataPT.value) || "-";

  previewHoraInicioPT.textContent =
    horaInicioPT.value || "-";

  previewHoraFimPT.textContent =
    horaFimPT.value || "-";

  previewLocalPT.textContent =
    localPT.value || "-";

  previewSetorPT.textContent =
    setorPT.value || "-";

  previewResponsavelPT.textContent =
    responsavelPT.value || "-";

  previewAtividadePT.textContent =
    atividadePT.value || "-";

  previewTextoRiscosPT.textContent =
    textoRiscosPT.value || "-";

  previewEpisPT.textContent =
    episPT.value || "-";

  previewObservacoesPT.textContent =
    observacoesPT.value || "-";

  atualizarTiposTrabalho();
}

/* ============================= */
/* TIPOS DE TRABALHO */
/* ============================= */

function atualizarTiposTrabalho() {
  previewTiposTrabalho.innerHTML = "";

  let algumSelecionado = false;

  riscosSelecionados.forEach((item) => {
    if (item.checked) {
      algumSelecionado = true;

      const li = document.createElement("li");

      li.textContent =
        item.parentElement.textContent.trim();

      previewTiposTrabalho.appendChild(li);
    }
  });

  if (!algumSelecionado) {
    previewTiposTrabalho.innerHTML =
      "<li>-</li>";
  }
}

/* ============================= */
/* LOGOS */
/* ============================= */

function atualizarLogos() {
  logoAGM.style.display =
    checkAGM.checked ? "block" : "none";

  logoSerra.style.display =
    checkSerra.checked ? "block" : "none";
}

/* ============================= */
/* TROCAR DOCUMENTO */
/* ============================= */

tipoDocumento.addEventListener("change", () => {
  if (tipoDocumento.value === "pt") return;

  window.location.href =
    `../documentos.html?tipo=${tipoDocumento.value}`;
});

/* ============================= */
/* EVENTOS */
/* ============================= */

numeroPT.addEventListener(
  "input",
  atualizarPreview,
);

dataPT.addEventListener(
  "input",
  atualizarPreview,
);

horaInicioPT.addEventListener(
  "input",
  atualizarPreview,
);

horaFimPT.addEventListener(
  "input",
  atualizarPreview,
);

localPT.addEventListener(
  "input",
  atualizarPreview,
);

setorPT.addEventListener(
  "input",
  atualizarPreview,
);

responsavelPT.addEventListener(
  "input",
  atualizarPreview,
);

atividadePT.addEventListener(
  "input",
  atualizarPreview,
);

textoRiscosPT.addEventListener(
  "input",
  atualizarPreview,
);

episPT.addEventListener(
  "input",
  atualizarPreview,
);

observacoesPT.addEventListener(
  "input",
  atualizarPreview,
);

checkAGM.addEventListener(
  "change",
  atualizarLogos,
);

checkSerra.addEventListener(
  "change",
  atualizarLogos,
);

riscosSelecionados.forEach((item) => {
  item.addEventListener(
    "change",
    atualizarPreview,
  );
});

/* ============================= */
/* EXPORTAR PDF */
/* ============================= */

btnExportar.addEventListener(
  "click",
  () => {
    const elemento =
      document.getElementById(
        "documentoPreview",
      );

    const options = {
      margin: 0,

      filename: "pt.pdf",

      image: {
        type: "jpeg",
        quality: 1,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },

      pagebreak: {
        mode: [
          "avoid-all",
          "css",
          "legacy",
        ],
      },
    };

    html2pdf()
      .set(options)
      .from(elemento)
      .save();
  },
);

/* ============================= */
/* DATA BR */
/* ============================= */

function formatarDataBR(data) {
  if (!data) return "";

  const [ano, mes, dia] =
    data.split("-");

  return `${dia}/${mes}/${ano}`;
}

/* Textos */

function gerarTextoRiscos() {
  const selecionados = [...document.querySelectorAll(".risco-check:checked")]
    .map((item) => item.value);

  if (selecionados.length === 0) {
    textoRiscosPT.value =
      "Selecione ao menos um tipo de trabalho para gerar os riscos e medidas preventivas.";

    atualizarPreview();
    return;
  }

  let texto = "";

  if (selecionados.includes("altura")) {
    texto +=
      "Trabalho em altura: risco de queda de pessoas, queda de materiais e acesso inadequado. É obrigatório utilizar cinto de segurança tipo paraquedista, talabarte, capacete com jugular e realizar inspeção prévia dos pontos de ancoragem.\n\n";
  }

  if (selecionados.includes("solda")) {
    texto +=
      "Solda / corte a quente: risco de queimaduras, incêndio, projeção de fagulhas e inalação de fumos metálicos. Deve ser mantido extintor próximo, área isolada, uso de máscara de solda, luvas, avental e proteção contra materiais inflamáveis.\n\n";
  }

  if (selecionados.includes("espacoConfinado")) {
    texto +=
      "Espaço confinado: risco de deficiência de oxigênio, presença de gases tóxicos, atmosfera explosiva e dificuldade de resgate. É obrigatória avaliação atmosférica, ventilação, vigia, resgatista e autorização específica antes da entrada.\n\n";
  }

  if (selecionados.includes("eletricidade")) {
    texto +=
      "Eletricidade: risco de choque elétrico, arco elétrico e queimaduras. A atividade deve seguir bloqueio e etiquetagem, desenergização quando aplicável, uso de ferramentas isoladas e EPIs adequados.\n\n";
  }

  if (selecionados.includes("movimentacaoCarga")) {
    texto +=
      "Movimentação de carga: risco de queda de materiais, esmagamento, prensamento e colisões. Deve haver isolamento da área, inspeção dos acessórios de içamento e comunicação clara entre os envolvidos.\n\n";
  }

  if (selecionados.includes("produtoQuimico")) {
    texto +=
      "Produto químico: risco de contato com pele, olhos, inalação e contaminação ambiental. Consultar FISPQ, utilizar luvas, óculos, respirador quando necessário e manter kit de contenção disponível.\n\n";
  }

  if (selecionados.includes("escavacao")) {
    texto +=
      "Escavação: risco de soterramento, queda de pessoas, interferência com redes enterradas e desmoronamento. A área deve ser sinalizada, escorada quando necessário e avaliada antes do início da atividade.\n\n";
  }

  if (selecionados.includes("bloqueio")) {
    texto +=
      "Bloqueio e etiquetagem: risco de energização inesperada de máquinas e equipamentos. Deve ser realizado bloqueio das fontes de energia, identificação com etiqueta e teste de energia zero antes da intervenção.\n\n";
  }

  textoRiscosPT.value = texto.trim();
  atualizarPreview();
}

btnGerarTexto.addEventListener("click", gerarTextoRiscos);
btnOutraVersao.addEventListener("click", gerarTextoRiscos);

/* ============================= */
/* INICIALIZAÇÃO */
/* ============================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {
    atualizarPreview();

    atualizarLogos();
  },
);