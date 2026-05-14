/* ============================= */
/* ELEMENTOS */
/* ============================= */

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

/* EMPRESAS */
function atualizarLogos(){

  logoAGM.style.display =
    checkAGM.checked
      ? "block"
      : "none";

  logoSerra.style.display =
    checkSerra.checked
      ? "block"
      : "none";

}

/* ============================= */
/* EVENTOS INPUT */
/* ============================= */

dataRegistro.addEventListener("input", atualizarPreview);
localRegistro.addEventListener("input", atualizarPreview);
responsavelRegistro.addEventListener("input", atualizarPreview);
servicoRegistro.addEventListener("input", atualizarPreview);

checkAGM.addEventListener(
  "change",
  atualizarLogos
);

checkSerra.addEventListener(
  "change",
  atualizarLogos
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

  filename:"registro-fotografico.pdf",

  image:{
    type:"jpeg",
    quality:1
  },

  html2canvas:{
    scale:3,
    useCORS:true
  },

  jsPDF:{
    unit:"mm",
    format:"a4",
    orientation:"portrait"
  },

  pagebreak:{
    mode:["avoid-all","css","legacy"]
  }

};

  html2pdf().set(options).from(elemento).save();

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

function renderizarColaboradores() {

  const empresaSelecionada =
    empresaTreinamento.value;

  const busca =
    buscaColaborador.value.toLowerCase();

  listaColaboradores.innerHTML = "";

  const filtrados = funcionarios.filter((f) => {

    return (
      f.empresa === empresaSelecionada &&
      f.nome.toLowerCase().includes(busca)
    );

  });

  filtrados.forEach((f) => {

    const div =
      document.createElement("div");

    div.classList.add("colaborador-item");

    div.innerHTML = `
    
      <input
        type="checkbox"
      >

      <label>
        ${f.nome} - ${f.cargo}
      </label>

    `;

    listaColaboradores.appendChild(div);

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

/* ============================= */
/* TROCAR DOCUMENTO */
/* ============================= */

function trocarDocumento(){

  const tipo =
    tipoDocumento.value;

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



    camposListaPresenca.style.display =
      "none";

    areaListaPresenca.style.display =
      "none";

    previewListaPresenca.style.display =
      "none";

  }

  /* ================================= */
  /* LISTA DE PRESENÇA */
  /* ================================= */

  else if(tipo === "listaPresenca"){

    camposRegistroFotografico.style.display =
      "none";

    areaRegistroFotografico.style.display =
      "none";

    previewRegistroFotografico.style.display =
      "none";



    camposListaPresenca.style.display =
      "block";

    areaListaPresenca.style.display =
      "block";

    previewListaPresenca.style.display =
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