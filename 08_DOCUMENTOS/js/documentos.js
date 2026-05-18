import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db }
from "../../01_HOME/js/firebase.js";

/* ============================= */
/* ELEMENTOS */
/* ============================= */
const areaDDS =
  document.getElementById("areaDDS");

const tituloDDS =
  document.getElementById("tituloDDS");

const tipoDDS =
  document.getElementById("tipoDDS");

const dataDDS =
  document.getElementById("dataDDS");

const conteudoDDS =
  document.getElementById("conteudoDDS");

const previewTituloDDS =
  document.getElementById("previewTituloDDS");

const previewTipoDDS =
  document.getElementById("previewTipoDDS");

const previewDataDDS =
  document.getElementById("previewDataDDS");

const previewConteudoDDS =
  document.getElementById("previewConteudoDDS");

const camposDDS =
  document.getElementById("camposDDS");

const previewDDS =
  document.getElementById("previewDDS");

const selecionarTodos =
  document.getElementById("selecionarTodos");

const gerarListaVazia =
  document.getElementById("gerarListaVazia");

const nomeTreinamento =
  document.getElementById("nomeTreinamento");

const conteudoProgramatico =
  document.getElementById("conteudoProgramatico");

const instrutorTreinamento =
  document.getElementById("instrutorTreinamento");

const horasTreinamento =
  document.getElementById("horasTreinamento");

const previewTreinamento =
  document.getElementById("previewTreinamento");

const previewInstrutor =
  document.getElementById("previewInstrutor");

const previewHoras =
  document.getElementById("previewHoras");

const previewConteudo =
  document.getElementById("previewConteudo");

const tipoDocumento =
  document.getElementById("tipoDocumento");

const areaRegistroFotografico =
  document.getElementById(
    "areaRegistroFotografico"
  );

const areaListaPresenca =
  document.getElementById(
    "areaListaPresenca"
  );

  const camposRegistroFotografico =
  document.getElementById(
    "camposRegistroFotografico"
  );

const camposListaPresenca =
  document.getElementById(
    "camposListaPresenca"
  );

const previewRegistroFotografico =
  document.getElementById(
    "previewRegistroFotografico"
  );

const previewListaPresenca =
  document.getElementById(
    "previewListaPresenca"
  );

let funcionarios = [];
let mapaFuncionarios = {};

let selecionados = [];

const empresaTreinamento =
  document.getElementById("empresaTreinamento");

const buscaColaborador =
  document.getElementById("buscaColaborador");

const listaColaboradores =
  document.getElementById("listaColaboradores");

const checkAGM =
  document.getElementById("checkAGM");

const checkSerra =
  document.getElementById("checkSerra");

const logoAGM =
  document.getElementById("logoAGM");

const logoSerra =
  document.getElementById("logoSerra");

const logoAGMLista =
  document.getElementById("logoAGMLista");

const logoSerraLista =
  document.getElementById("logoSerraLista");

const dataRegistro = document.getElementById("dataRegistro");
const localRegistro = document.getElementById("localRegistro");
const responsavelRegistro = document.getElementById("responsavelRegistro");
const servicoRegistro = document.getElementById("servicoRegistro");

const previewData = document.getElementById("previewData");
const previewLocal = document.getElementById("previewLocal");
const previewResponsavel = document.getElementById("previewResponsavel");
const previewServico = document.getElementById("previewServico");

const btnAdicionar = document.getElementById("btnAdicionar");

const registrosContainer = document.getElementById("registrosContainer");
const previewRegistros = document.getElementById("previewRegistros");

/* ============================= */
/* ATUALIZA PREVIEW */
/* ============================= */

function atualizarPreview(){

  previewData.textContent =
    dataRegistro.value || "-";

  previewLocal.textContent =
    localRegistro.value || "-";

  previewResponsavel.textContent =
    responsavelRegistro.value || "-";

  previewServico.textContent =
    servicoRegistro.value || "-";

}

/* ============================= */
/* PREVIEW LISTA PRESENÇA */
/* ============================= */

function atualizarPreviewLista() {

  previewTreinamento.textContent =
    nomeTreinamento.value || "-";

  previewInstrutor.textContent =
    instrutorTreinamento.value || "-";

  previewHoras.textContent =
    horasTreinamento.value || "-";

  const linhas =
  conteudoProgramatico.value
    .split("\n")
    .filter((linha) => linha.trim() !== "");

previewConteudo.innerHTML = "";

if(linhas.length === 0){

  previewConteudo.innerHTML =
    "<li>-</li>";

} else {

  linhas.forEach((linha) => {

    const li =
      document.createElement("li");

    li.textContent = linha;

    previewConteudo.appendChild(li);

  });

}

}

// futions dds

function atualizarPreviewDDS(){

  previewTituloDDS.textContent =
    tituloDDS.value || "-";

  previewTipoDDS.textContent =
    tipoDDS.value || "-";

  previewDataDDS.textContent =
    dataDDS.value || "-";

  previewConteudoDDS.textContent =
    conteudoDDS.value || "-";

}

/* EMPRESAS */
function atualizarLogos(){

  const mostrarAGM =
    checkAGM.checked
      ? "block"
      : "none";

  const mostrarSerra =
    checkSerra.checked
      ? "block"
      : "none";

  logoAGM.style.display =
    mostrarAGM;

  logoSerra.style.display =
    mostrarSerra;

  logoAGMLista.style.display =
    mostrarAGM;

  logoSerraLista.style.display =
    mostrarSerra;

}
/* ============================= */
/* EVENTOS INPUT */
/* ============================= */

dataRegistro.addEventListener("input", atualizarPreview);
localRegistro.addEventListener("input", atualizarPreview);
responsavelRegistro.addEventListener("input", atualizarPreview);
servicoRegistro.addEventListener("input", atualizarPreview);
nomeTreinamento.addEventListener(
  "input",
  atualizarPreviewLista
);

conteudoProgramatico.addEventListener(
  "input",
  atualizarPreviewLista
);

instrutorTreinamento.addEventListener(
  "input",
  atualizarPreviewLista
);

horasTreinamento.addEventListener(
  "input",
  atualizarPreviewLista
);

checkAGM.addEventListener(
  "change",
  atualizarLogos
);

checkSerra.addEventListener(
  "change",
  atualizarLogos
);

tituloDDS.addEventListener(
  "input",
  atualizarPreviewDDS
);

tipoDDS.addEventListener(
  "change",
  atualizarPreviewDDS
);

dataDDS.addEventListener(
  "input",
  atualizarPreviewDDS
);

conteudoDDS.addEventListener(
  "input",
  atualizarPreviewDDS
);
/* ============================= */
/* ADICIONAR REGISTRO */
/* ============================= */

btnAdicionar.addEventListener("click", () => {

  const index = document.querySelectorAll(".registro-item").length;

  /* CARD LATERAL */

  const registro = document.createElement("div");
  registro.classList.add("registro-item");

  registro.innerHTML = `
  
    <input type="file" accept="image/*" id="foto-${index}">

    <textarea
      placeholder="Descrição da foto"
      id="descricao-${index}"
    ></textarea>

  `;

  registrosContainer.appendChild(registro);

  /* PREVIEW */

  const preview = document.createElement("div");
  preview.classList.add("preview-registro");

preview.innerHTML = `
  
    <h3>Registro ${index + 1}</h3>

    <img id="preview-img-${index}" />

    <p id="preview-desc-${index}">
      -
    </p>

  `;

  previewRegistros.appendChild(preview);

  /* FOTO */

  const fotoInput = document.getElementById(`foto-${index}`);
  const previewImg = document.getElementById(`preview-img-${index}`);

  fotoInput.addEventListener("change", (event) => {

    const arquivo = event.target.files[0];

    if(arquivo){

      const reader = new FileReader();

      reader.onload = function(e){

        previewImg.src = e.target.result;

      };

      reader.readAsDataURL(arquivo);

    }

  });

  /* DESCRIÇÃO */

  const descricaoInput =
    document.getElementById(`descricao-${index}`);

  const previewDesc =
    document.getElementById(`preview-desc-${index}`);

  descricaoInput.addEventListener("input", () => {

    previewDesc.textContent =
      descricaoInput.value || "-";

  });

});

/* ============================= */
/* EXPORTAR PDF */
/* ============================= */

const btnExportar =
  document.getElementById("btnExportar");

btnExportar.addEventListener("click", () => {

  const elemento =
    document.getElementById("documentoPreview");

  const options = {

    margin:0,

    filename:
      tipoDocumento.value === "registroFotografico"
        ? "registro-fotografico.pdf"
        : "lista-presenca.pdf",

    image:{
      type:"jpeg",
      quality:1
    },

    html2canvas:{
      scale:2,
      useCORS:true,
      scrollY:0
    },

    jsPDF:{
      unit:"mm",
      format:"a4",
      orientation:"portrait"
    },

    pagebreak:{
      mode:["avoid-all"]
    }

  };

  html2pdf()
    .set(options)
    .from(elemento)
    .save();

});

/*colaboradores*/

async function carregarFuncionarios() {

  const snapshot =
    await getDocs(collection(db, "funcionarios"));

  funcionarios = [];

  mapaFuncionarios = {};

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const f = {

      id: docSnap.id,

      nome:
        data.nome || "Sem nome",

      cargo:
        data.cargoAtual || "Sem cargo",

      empresa:
        data.empresa || "Sem empresa",

    };

    funcionarios.push(f);

    mapaFuncionarios[f.id] = f;

  });

  funcionarios.sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  renderizarColaboradores();

}

//selecionar Todos
selecionarTodos.addEventListener(
  "change",
  () => {

    const empresaSelecionada =
      empresaTreinamento.value
        .toLowerCase()
        .trim();

    const funcionariosEmpresa =
      funcionarios.filter((f) => {

        return (
          (f.empresa || "")
            .toLowerCase()
            .trim()
          === empresaSelecionada
        );

      });

    if(selecionarTodos.checked){

      funcionariosEmpresa.forEach((f) => {

        if(
          !selecionados.includes(f.id)
        ){

          selecionados.push(f.id);

        }

      });

    } else {

      selecionados =
        selecionados.filter((id) => {

          const funcionario =
            mapaFuncionarios[id];

          return (
            funcionario?.empresa
              .toLowerCase()
              .trim()
            !== empresaSelecionada
          );

        });

    }

    renderizarColaboradores();

    atualizarTabelaPresenca();

  }
);

// lista Vazia
gerarListaVazia.addEventListener(
  "click",
  () => {

    const corpoTabela =
      document.getElementById(
        "corpoTabelaPresenca"
      );

    corpoTabela.innerHTML = "";

    for(let i = 0; i < 15; i++){

      const tr =
        document.createElement("tr");

      tr.innerHTML = `
      
        <td style="height:35px;"></td>

        <td></td>

        <td></td>

      `;

      corpoTabela.appendChild(tr);

    }

  }
);

// atualizar tabela de PRESENÇA

function atualizarTabelaPresenca() {

  const corpoTabela =
    document.getElementById(
      "corpoTabelaPresenca"
    );

  corpoTabela.innerHTML = "";

  const funcionariosOrdenados =
    funcionarios.filter((f) =>
      selecionados.includes(f.id)
    );

  funcionariosOrdenados.forEach((funcionario) => {

    const tr =
      document.createElement("tr");

    tr.innerHTML = `
    
      <td>${funcionario.nome}</td>

      <td>${funcionario.cargo}</td>

      <td></td>

    `;

    corpoTabela.appendChild(tr);

  });

}

function renderizarColaboradores() {

  const empresaSelecionada =
    empresaTreinamento.value
      .toLowerCase()
      .trim();

  const busca =
    buscaColaborador.value
      .toLowerCase()
      .trim();

  listaColaboradores.innerHTML = "";

  const filtrados =
    funcionarios.filter((f) => {

      const nome =
        (f.nome || "")
          .toLowerCase()
          .trim();

      const empresa =
        (f.empresa || "")
          .toLowerCase()
          .trim();

      return (
        empresa === empresaSelecionada &&
        nome.includes(busca)
      );

    });

  filtrados.forEach((f) => {

    const marcado =
      selecionados.includes(f.id);

    const div =
      document.createElement("div");

    div.classList.add("colaborador-item");

    div.innerHTML = `
    
      <input
        type="checkbox"
        class="check-colaborador"
        data-id="${f.id}"
        ${marcado ? "checked" : ""}
      >

      <label>

        <span class="nome-colab">
          ${f.nome}
        </span>

        <span class="cargo-colab">
          ${f.cargo}
        </span>

      </label>

    `;

    listaColaboradores.appendChild(div);

    const checkbox =
      div.querySelector("input");

    checkbox.addEventListener(
      "change",
      () => {

        if(checkbox.checked){

          if(
            !selecionados.includes(f.id)
          ){

            selecionados.push(f.id);

          }

        } else {

          selecionados =
            selecionados.filter(
              (id) => id !== f.id
            );

        }

        atualizarTabelaPresenca();

      }
    );

  });

}

empresaTreinamento.addEventListener(
  "change",
  renderizarColaboradores
);

buscaColaborador.addEventListener(
  "input",
  renderizarColaboradores
);

function trocarDocumento(){

  const tipo =
    tipoDocumento.value;

  /* ================================= */
  /* ESCONDER TUDO PRIMEIRO */
  /* ================================= */

  camposRegistroFotografico.style.display =
    "none";

  areaRegistroFotografico.style.display =
    "none";

  previewRegistroFotografico.style.display =
    "none";



  camposListaPresenca.style.display =
    "none";

  areaListaPresenca.style.display =
    "none";

  previewListaPresenca.style.display =
    "none";



  camposDDS.style.display =
    "none";

  previewDDS.style.display =
    "none";



  /* ================================= */
  /* REGISTRO FOTOGRÁFICO */
  /* ================================= */

  if(tipo === "registroFotografico"){

    camposRegistroFotografico.style.display =
      "block";

    areaRegistroFotografico.style.display =
      "block";

    previewRegistroFotografico.style.display =
      "block";

  }

  /* ================================= */
  /* LISTA DE PRESENÇA */
  /* ================================= */

  else if(tipo === "listaPresenca"){

    camposListaPresenca.style.display =
      "block";

    areaListaPresenca.style.display =
      "block";

    previewListaPresenca.style.display =
      "block";

  }

  /* ================================= */
  /* DDS */
  /* ================================= */

  else if(tipo === "dds"){

    camposDDS.style.display =
      "block";

    previewDDS.style.display =
      "block";

  }

}

tipoDocumento.addEventListener(
  "change",
  trocarDocumento
);

trocarDocumento();

carregarFuncionarios();

atualizarLogos();