// =============================
// 🔹 IMPORTS FIREBASE
// =============================
import { db } from "../../01_HOME/js/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =============================
// 🔹 ELEMENTOS DA TELA
// =============================
const tableBody = document.getElementById("lista-extintores");
const btnNovo = document.getElementById("btnNovo");

let extintores = [];
let filtroStatusAtivo = [];
window.limparFiltrosStatus = function(){
  filtroStatusAtivo = [];
  render();
}


// =============================
// 🔹 FUNÇÃO STATUS AUTOMÁTICO
// =============================
function calcularStatus(proximaRecarga){

  if(!proximaRecarga) 
    return { texto:"Sem data", classe:"alerta" };

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  // limpa espaços
  proximaRecarga = proximaRecarga.trim();

  const partes = proximaRecarga.split("/");

  if(partes.length !== 2)
    return { texto:"Data inválida", classe:"alerta" };

  const mes = parseInt(partes[0]);
  const ano = parseInt(partes[1]);

  // último dia do mês
  const data = new Date(ano, mes, 0);

  const diff = Math.floor((data - hoje) / (1000 * 60 * 60 * 24));

  if(diff < 0)
    return { texto:"Vencido", classe:"vencido" };

  if(diff <= 60)
    return { texto:"Avencer", classe:"alerta" };

  return { texto:"OK", classe:"ok" };
}

// =============================
// 🔹 CARREGAR DADOS
// =============================
async function carregar() {
  tableBody.innerHTML = "";
  const snap = await getDocs(collection(db, "extintores"));

  extintores = [];

  snap.forEach(docSnap => {
    extintores.push({ id: docSnap.id, ...docSnap.data() });
  });

  render();
  atualizarDashboard();
}

function atualizarDashboard(){

let ok = 0;
let alerta = 0;
let vencido = 0;
let manut = 0;
let desp = 0;

extintores.forEach(e => {

const statusAuto = calcularStatus(e.proximaRecarga);

let statusFinal = statusAuto.texto;

if(e.statusManual === "Despressurizado") statusFinal = "Despressurizado";
if(e.statusManual === "Em Manutenção") statusFinal = "Em Manutenção";

if(statusFinal === "OK") ok++;
if(statusFinal === "Avencer") alerta++;
if(statusFinal === "Vencido") vencido++;
if(statusFinal === "Em Manutenção") manut++;
if(statusFinal === "Despressurizado") desp++;

});

document.getElementById("count-ok").innerText = ok;
document.getElementById("count-alerta").innerText = alerta;
document.getElementById("count-vencido").innerText = vencido;
document.getElementById("count-manut").innerText = manut;
document.getElementById("count-desp").innerText = desp;

}


// =============================
// 🔹 FILTROS AUTOMÁTICOS
// =============================
function filtrar(lista) {

  const numero = document.getElementById("filtroNumero")?.value.toLowerCase() || "";
  const classe = document.getElementById("filtroClasse")?.value.toLowerCase() || "";
  const kg = document.getElementById("filtroKg")?.value.toLowerCase() || "";
  const local = document.getElementById("filtroLocal")?.value.toLowerCase() || "";
  const setor = document.getElementById("filtroSetor")?.value.toLowerCase() || "";
  const vencimento = document.getElementById("filtroVencimento")?.value || "";

  return lista.filter(e => {

    const filtroNumeroMatch =
      e.registro?.toLowerCase().includes(numero) ||
      e.recipiente?.toLowerCase().includes(numero);

    const filtroClasseMatch = (e.classe || "").toLowerCase().includes(classe);
    const filtroKgMatch = e.kg?.toLowerCase().includes(kg);
    const filtroLocalMatch = e.local?.toLowerCase().includes(local);
    const filtroSetorMatch = e.setor?.toLowerCase().includes(setor);

    const filtroVencimentoMatch = vencimento
      ? e.proximaRecarga === vencimento
      : true;

    return (
      filtroNumeroMatch &&
      filtroClasseMatch &&
      filtroKgMatch &&
      filtroLocalMatch &&
      filtroSetorMatch &&
      filtroVencimentoMatch
    );
  });
}

// =============================
// 🔹 EXCLUIR
// =============================
window.excluir = async function(id) {
  if (!confirm("Excluir extintor?")) return;
  await deleteDoc(doc(db, "extintores", id));
  carregar();
};


// =============================
// 🔹 EDITAR
// =============================
window.editar = function(id) {
  const e = extintores.find(x => x.id === id);
  abrirModal(e);
};


// =============================
// 🔹 ABRIR MODAL
// =============================
btnNovo.addEventListener("click", () => abrirModal());

function abrirModal(dados = null) {

  const modal = document.createElement("div");
  modal.className = "modal-bg";

  modal.innerHTML = `
    <div class="modal">
      <h3>${dados ? "Editar" : "Novo"} Extintor</h3>

      <textarea id="colarLinha" placeholder="Cole a linha da planilha aqui"></textarea>
      <button id="importarLinha">Importar dados</button>

      <hr>

      <input id="registro" placeholder="N°" value="${dados?.registro || ""}">
      <input id="recipiente" placeholder="N° Recipiente" value="${dados?.recipiente || ""}">

      <select id="tipo">
        <option value="">Tipo</option>
        <option value="AP" ${dados?.tipo === "AP" ? "selected" : ""}>AP - Água Pressurizada</option>
        <option value="CO2" ${dados?.tipo === "CO2" ? "selected" : ""}>CO2 - Dióxido de Carbono</option>
        <option value="PQS" ${dados?.tipo === "PQS" ? "selected" : ""}>PQS - Pó Químico Seco</option>
      </select>

      <input id="classe" placeholder="Classe" value="${dados?.classe || ""}">
      <input id="kg" placeholder="KG" value="${dados?.kg || ""}">
      <input id="local" placeholder="Local" value="${dados?.local || ""}">
      <input id="setor" placeholder="Setor (Manutenção, Operação, Adm)" value="${dados?.setor || ""}">

      <select id="statusManual">
        <option value="OK" ${dados?.statusManual === "OK" ? "selected" : ""}>OK</option>
        <option value="Despressurizado" ${dados?.statusManual === "Despressurizado" ? "selected" : ""}>Despressurizado</option>
        <option value="Em Manutenção" ${dados?.statusManual === "Em Manutenção" ? "selected" : ""}>Em Manutenção</option>
      </select>

      <input id="ultimaRecarga" placeholder="MM/AAAA" maxlength="7" value="${dados?.ultimaRecarga || ""}">
      <input id="proximaRecarga" placeholder="MM/AAAA" maxlength="7" value="${dados?.proximaRecarga || ""}">

      <button id="salvar">Salvar</button>
    </div>
  `;

  document.body.appendChild(modal);

  // IMPORTAR LINHA DA PLANILHA
  document.getElementById("importarLinha").onclick = function(){

    const linha = document.getElementById("colarLinha").value.trim();

    if(!linha){
      alert("Cole a linha da planilha");
      return;
    }

    const dadosLinha = linha.split(/\t|\s{2,}/);

    if(dadosLinha.length < 9){
      alert("Linha inválida");
      return;
    }

    document.getElementById("registro").value = dadosLinha[0];
    document.getElementById("recipiente").value = dadosLinha[1];
    document.getElementById("local").value = dadosLinha[2];
    document.getElementById("tipo").value = dadosLinha[3];
    document.getElementById("classe").value = dadosLinha[4];
    document.getElementById("kg").value = dadosLinha[5];

    document.getElementById("ultimaRecarga").value = dadosLinha[6];

    if(dadosLinha[8]){
      document.getElementById("proximaRecarga").value =
      converterMes(dadosLinha[8]);
    }

  };

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-bg")) {
      modal.remove();
    }
  });

  document.getElementById("salvar").onclick = async () => {

    const dadosForm = {
      registro: document.getElementById("registro").value,
      recipiente: document.getElementById("recipiente").value,
      tipo: document.getElementById("tipo").value,
      classe: document.getElementById("classe").value,
      kg: document.getElementById("kg").value,
      local: document.getElementById("local").value,
      setor: document.getElementById("setor").value,
      statusManual: document.getElementById("statusManual").value,
      ultimaRecarga: document.getElementById("ultimaRecarga").value,
      proximaRecarga: document.getElementById("proximaRecarga").value
    };

    if (dados) {
      await updateDoc(doc(db, "extintores", dados.id), dadosForm);
    } else {
      await addDoc(collection(db, "extintores"), dadosForm);
    }

    modal.remove();
    carregar();
  };

}

// =============================
// 🔹 FILTRO POR STATUS
// =============================
window.filtrarStatus = function(status){

  const index = filtroStatusAtivo.indexOf(status);

  if(index > -1){
    filtroStatusAtivo.splice(index,1);
  }else{
    filtroStatusAtivo.push(status);
  }

  atualizarCardsStatus();
  render();
}


// =============================
// 🔹 ATUALIZAR CARDS VISUAIS
// =============================
function atualizarCardsStatus(){

  document.querySelectorAll(".status-card").forEach(card => {

    const status = card.getAttribute("onclick")
      .match(/'(.*?)'/)[1];

    if(filtroStatusAtivo.includes(status)){
      card.classList.add("ativo");
    }else{
      card.classList.remove("ativo");
    }

  });

}
// =============================
// 🔹 ATIVAR FILTROS AUTOMÁTICOS
// =============================
document.querySelectorAll(".filters input").forEach(input => {
  input.addEventListener("input", render);
});


// =============================
function render() {

  tableBody.innerHTML = "";

  let listaFiltrada = filtrar(extintores);
  // 🔹 aplicar filtro de status
if (filtroStatusAtivo.length > 0) {

  listaFiltrada = listaFiltrada.filter(e => {

    const statusAuto = calcularStatus(e.proximaRecarga);
    let statusFinal = statusAuto.texto;

    if (e.statusManual === "Despressurizado") statusFinal = "Despressurizado";
    if (e.statusManual === "Em Manutenção") statusFinal = "Em Manutenção";

    return filtroStatusAtivo.includes(statusFinal);

  });

}

  atualizarTipos(listaFiltrada);


  // 🔹 Ordenação
  listaFiltrada.sort((a, b) => {

    const regA = a.registro || "";
    const regB = b.registro || "";

    const isReservaA = regA.startsWith("R");
    const isReservaB = regB.startsWith("R");

    if (isReservaA && !isReservaB) return 1;
    if (!isReservaA && isReservaB) return -1;

    return regA.localeCompare(regB, undefined, { numeric: true });

  });

  listaFiltrada.forEach(e => {

    const statusAuto = calcularStatus(e.proximaRecarga);

    let statusFinal = { ...statusAuto };

    if (e.statusManual === "Despressurizado") {
      statusFinal = { texto: "Despressurizado", classe: "vencido" };
    }

    if (e.statusManual === "Em Manutenção") {
      statusFinal = { texto: "Em Manutenção", classe: "alerta" };
    }

    tableBody.innerHTML += `
      <tr>
        <td>${e.registro || "-"}</td>
        <td>${e.recipiente || "-"}</td>
        <td>${e.tipo || "-"}</td>
        <td>${e.classe || "-"}</td>
        <td>${e.kg ? e.kg + "Kg" : "-"}</td>
        <td>${e.local || "-"}</td>
        <td>${e.setor || "-"}</td>
        <td>${e.ultimaRecarga || "-"}</td>
        <td>${e.proximaRecarga || "-"}</td>
        <td>
          <span class="status ${statusFinal.classe}">
            ${statusFinal.texto}
          </span>
        </td>
        <td>
          <button onclick="editar('${e.id}')">✏️</button>
          <button onclick="excluir('${e.id}')">🗑️</button>
        </td>
      </tr>
    `;
  });
  atualizarCardsStatus();
}

function atualizarTipos(lista){

let ap = 0;
let co2 = 0;
let pqs = 0;

lista.forEach(e=>{

if(e.tipo === "AP") ap++;
if(e.tipo === "CO2") co2++;
if(e.tipo === "PQS") pqs++;

});

document.getElementById("count-ap").innerText = ap;
document.getElementById("count-co2").innerText = co2;
document.getElementById("count-pqs").innerText = pqs;

}

window.gerarPDF = function(){

const inspetor = prompt("Nome do inspetor:");
if(!inspetor) return;

const { jsPDF } = window.jspdf;

let lista = filtrar(extintores);

// aplicar filtro de status se houver
if (filtroStatusAtivo.length > 0) {

  lista = lista.filter(e => {

    const statusAuto = calcularStatus(e.proximaRecarga);
    let statusFinal = statusAuto.texto;

    if(e.statusManual === "Despressurizado") statusFinal="Despressurizado";
    if(e.statusManual === "Em Manutenção") statusFinal="Em Manutenção";

    return filtroStatusAtivo.includes(statusFinal);

  });

}

lista.sort((a,b)=>
(a.registro || "").localeCompare(b.registro || "", undefined, {numeric:true})
);

const doc = new jsPDF();


// =============================
// CABEÇALHO
// =============================

doc.setFontSize(18);
doc.text("RELATÓRIO DE INSPEÇÃO DE EXTINTORES",105,15,{align:"center"});

doc.setFontSize(11);

doc.text("Empresa: Serra Morena",14,30);
doc.text("Local: Porto de Rio Grande - RS",14,36);
doc.text("Data da inspeção: " + new Date().toLocaleDateString(),14,42);
doc.text("Inspetor responsável: " + inspetor,14,48);

doc.line(14,52,196,52);


// =============================
// TABELA
// =============================

let linhas = [];

let ap=0,co2=0,pqs=0;
let ok=0,alerta=0,vencido=0,manut=0,desp=0;

lista.forEach(e=>{

const statusAuto = calcularStatus(e.proximaRecarga);

let statusFinal = statusAuto.texto;

if(e.statusManual === "Despressurizado") statusFinal="Despressurizado";
if(e.statusManual === "Em Manutenção") statusFinal="Em Manutenção";

linhas.push([
e.registro || "-",
e.recipiente || "-",
e.tipo || "-",
e.classe || "-",
e.kg ? e.kg+"Kg" : "-",
e.local || "-",
e.setor || "-",
e.ultimaRecarga || "-",
e.proximaRecarga || "-",
statusFinal
]);

// contagem tipos
if(e.tipo==="AP") ap++;
if(e.tipo==="CO2") co2++;
if(e.tipo==="PQS") pqs++;

// contagem status
if(statusFinal==="OK") ok++;
if(statusFinal==="Avencer") alerta++;
if(statusFinal==="Vencido") vencido++;
if(statusFinal==="Em Manutenção") manut++;
if(statusFinal==="Despressurizado") desp++;

});

doc.autoTable({

startY:58,

head:[[
"Nº",
"Recipiente",
"Tipo",
"Classe",
"Carga",
"Localização",
"Setor",
"Última Recarga",
"Próxima Recarga",
"Situação"
]],

body:linhas,

theme:"grid",

styles:{
fontSize:8,
cellPadding:2
},

headStyles:{
fillColor:[40,40,40]
}

});

// =============================
// RESUMO
// =============================

let y = doc.lastAutoTable.finalY + 10;

doc.setDrawColor(180);
doc.line(14,y-4,196,y-4);

doc.setFontSize(14);
doc.text("Resumo da Inspeção",14,y);

doc.setFontSize(11);

doc.text("Total de extintores: "+lista.length,14,y+10);

let linhaResumo = [
["AP:", ap, "OK:", ok],
["CO2:", co2, "A vencer:", alerta],
["PQS:", pqs, "Vencidos:", vencido],
["", "", "Em manutenção:", manut],
["", "", "Despressurizados:", desp]
];

let posY = y + 18;

linhaResumo.forEach(l => {

doc.text(l[0] + " " + l[1], 14, posY);
doc.text(l[2] + " " + l[3], 110, posY);

posY += 6;

});


// =============================
// ASSINATURA
// =============================

y += 60;

doc.setDrawColor(0);
doc.line(60,y,150,y);

doc.setFontSize(10);
doc.text("Responsável pela inspeção",105,y+6,{align:"center"});

doc.setFontSize(11);
doc.text(inspetor,105,y+12,{align:"center"});


doc.save("inspecao_extintores.pdf");

}

carregar();

function converterMes(texto){

if(!texto) return "";

const meses = {
jan: "01",
fev: "02",
mar: "03",
abr: "04",
mai: "05",
jun: "06",
jul: "07",
ago: "08",
set: "09",
out: "10",
nov: "11",
dez: "12"
};

const partes = texto.split("-");

if(partes.length < 2) return texto;

const mes = meses[partes[0].toLowerCase()];
const ano = "20" + partes[1];

if(!mes || !ano) return texto;

return mes + "/" + ano;

}