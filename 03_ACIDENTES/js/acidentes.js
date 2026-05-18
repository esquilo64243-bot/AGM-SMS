import { db } from "../../01_HOME/js/firebase.js";

import {
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let acidentes = [];

let filtroAno = new Date().getFullYear();
let filtroTipo = "Todos";
let filtroMes = [];

let tipoGraficoAtual = "bar";
let chart = null;


// =============================
// GRAFICO
// =============================

function inicializarGrafico(labels = [], dados = []) {

const canvas = document.getElementById("graficoAcidentes");
if (!canvas) return;

const ctx = canvas.getContext("2d");

if (chart) {
chart.destroy();
}

chart = new Chart(ctx, {

type: tipoGraficoAtual,

data: {
labels: labels,
datasets: [{
label: "Total de Acidentes",
data: dados,

backgroundColor: tipoGraficoAtual === "pie"
? [
"#4e73df","#1cc88a","#36b9cc",
"#f6c23e","#e74a3b","#858796",
"#5a5c69","#20c997","#6610f2",
"#fd7e14","#6f42c1","#17a2b8"
]
: "rgba(78,115,223,0.4)",

borderColor: "#36b9cc",
borderWidth: tipoGraficoAtual === "line" ? 3 : 1,
tension: tipoGraficoAtual === "line" ? 0.4 : 0,
fill: tipoGraficoAtual !== "line"
}]
},

options: {
responsive: true,
maintainAspectRatio: false,
plugins:{
legend:{
display:true,
labels:{color:"#fff"}
}
}
}

});

}


// =============================
// ATUALIZAR GRAFICO
// =============================

function atualizarGrafico(){

let dadosFiltrados = acidentes.filter(a=>{
return (
a.ano === filtroAno &&
(filtroTipo === "Todos" || a.tipo == filtroTipo) &&
(filtroMes.length === 0 || filtroMes.includes(a.mes))
)
});

let agrupado = {};

dadosFiltrados.forEach(a=>{
agrupado[a.mes] = (agrupado[a.mes] || 0) + a.quantidade;
});

const labels = Object.keys(agrupado);
const dados = Object.values(agrupado);

if(labels.length === 0){
inicializarGrafico(["Sem dados"],[0]);
return;
}

inicializarGrafico(labels,dados);

}


// =============================
// ACORDEAO
// =============================

function configurarAcordeao(){

document.querySelectorAll('.ano-header').forEach(header=>{
header.addEventListener('click',()=>{
header.parentElement.classList.toggle('open');
});
});

document.querySelectorAll('.mes-header').forEach(header=>{
header.addEventListener('click',(e)=>{
e.stopPropagation();
header.parentElement.classList.toggle('open');
});
});

}


// =============================
// FIREBASE
// =============================

async function carregarAcidentes(){

const querySnapshot = await getDocs(collection(db,"acidentes"));

acidentes = [];

querySnapshot.forEach((doc)=>{

const data = doc.data();

const dataObj = data.data ? new Date(data.data) : new Date();

const meses=[
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const mes = meses[dataObj.getMonth()];

acidentes.push({
id: doc.id,
ano: dataObj.getFullYear(),
mes: mes,
nome: data.nome,
data: data.data,
tipo: data.tipo,
local: data.local,
descricao: data.descricao,
quantidade: 1
});

});

renderizarHistorico();
atualizarGrafico();
atualizarGraficoAnos();

}


// =============================
// HISTORICO
// =============================

function renderizarHistorico(){

const container = document.querySelector(".arquivos");

let html = "";

const anos = [filtroAno];

anos.forEach(ano=>{

html += `<div class="ano">
<div class="ano-header">${ano}</div>
<div class="meses">`;

const acidentesAno = acidentes.filter(a=>a.ano == ano);

const meses = [...new Set(acidentesAno.map(a=>a.mes))];

meses.forEach(mes=>{

html += `
<div class="mes">
<div class="mes-header">${mes}</div>
<div class="cats">
`;

const acidentesMes = acidentesAno.filter(a=>a.mes == mes);

acidentesMes.forEach(a=>{

html += `
<div class="cat-item" onclick="verAcidente('${a.id}')">
${a.data} - ${a.nome}
</div>
`;

});

html += `
</div>
</div>
`;

});

html += `</div></div>`;

});

container.innerHTML = html;

configurarAcordeao();

}


// =============================
// VER ACIDENTE
// =============================

window.verAcidente = function(id){

const acidente = acidentes.find(a => a.id === id);

if(!acidente) return;

alert(`ACIDENTE REGISTRADO

Nome: ${acidente.nome}
Data: ${acidente.data}
Tipo: ${acidente.tipo}
Local: ${acidente.local}

Descrição:
${acidente.descricao}`);

}


// =============================
// TROCAR GRAFICO
// =============================

window.mudarGrafico = function(tipo){

tipoGraficoAtual = tipo;

atualizarGrafico();

}


// =============================
// MODAL
// =============================

document.addEventListener("DOMContentLoaded",()=>{

configurarAcordeao();

const modal = document.getElementById("modalCAT");
const btnNovo = document.getElementById("btnNovoRegistro");
const cancelar = document.getElementById("cancelarCAT");
const registrar = document.getElementById("registrarCAT");
const loading = document.getElementById("loadingCAT");
const sucesso = document.getElementById("sucessoCAT");
const ok = document.getElementById("okCAT");
const status = document.getElementById("statusRegistro");

const btnGrafico = document.getElementById("btnGrafico");
const painelGrafico = document.getElementById("painelGrafico");


btnNovo.onclick=()=>{

modal.classList.add("show");

loading.style.display="none";
sucesso.style.display="none";

status.innerText="REGISTRO DE ACIDENTE";

};


cancelar.onclick=()=>{
modal.classList.remove("show");
};


registrar.onclick = async ()=>{

loading.style.display="block";

const nome=document.getElementById("nomeAcidentado").value;
const data=document.getElementById("dataAcidente").value;
const tipo=document.getElementById("tipoAcidente").value;
const local=document.getElementById("localAcidente").value;
const descricao=document.getElementById("descricaoAcidente").value;

try{

await addDoc(collection(db,"acidentes"),{
nome,
data,
tipo,
local,
descricao
});

await carregarAcidentes();

loading.style.display="none";
sucesso.style.display="block";

}
catch(e){

console.error("Erro ao salvar:",e);

loading.style.display="none";

alert("Erro ao salvar acidente");

}

};


ok.onclick=()=>{
modal.classList.remove("show");
};


// painel de troca de gráfico
btnGrafico.onclick = ()=>{

painelGrafico.classList.toggle("show");

painelGrafico.innerHTML = `
<div onclick="mudarGrafico('bar')" class="opcao">Barras</div>
<div onclick="mudarGrafico('line')" class="opcao">Linha</div>
<div onclick="mudarGrafico('pie')" class="opcao">Pizza</div>
`;

};

const btnMes = document.getElementById("btnMes");
const painelMes = document.getElementById("painelMes");

painelMes.addEventListener("change", () => {

const checkboxes = painelMes.querySelectorAll("input:checked");

filtroMes = Array.from(checkboxes).map(c => c.value);

atualizarGrafico();

});

btnMes.onclick = ()=>{

painelMes.classList.toggle("show");

painelMes.innerHTML = `
<label><input type="checkbox" value="Janeiro"> Janeiro</label>
<label><input type="checkbox" value="Fevereiro"> Fevereiro</label>
<label><input type="checkbox" value="Março"> Março</label>
<label><input type="checkbox" value="Abril"> Abril</label>
<label><input type="checkbox" value="Maio"> Maio</label>
<label><input type="checkbox" value="Junho"> Junho</label>
<label><input type="checkbox" value="Julho"> Julho</label>
<label><input type="checkbox" value="Agosto"> Agosto</label>
<label><input type="checkbox" value="Setembro"> Setembro</label>
<label><input type="checkbox" value="Outubro"> Outubro</label>
<label><input type="checkbox" value="Novembro"> Novembro</label>
<label><input type="checkbox" value="Dezembro"> Dezembro</label>
`;

};


carregarAcidentes();

const btnTipo = document.getElementById("btnTipo");
const painelTipo = document.getElementById("painelTipo");

btnTipo.onclick = ()=>{

painelTipo.classList.toggle("show");

painelTipo.innerHTML = `
<div onclick="selecionarTipo('Todos')">Todos</div>
<div onclick="selecionarTipo('Dano Material')">Dano Material</div>
<div onclick="selecionarTipo('Sem Afastamento')">Sem Afastamento</div>
<div onclick="selecionarTipo('Com Afastamento')">Com Afastamento</div>
`;

};
});

window.selecionarTipo = function(tipo){

filtroTipo = tipo;

document.getElementById("painelTipo").classList.remove("show");

atualizarGrafico();

}

let chartAnos = null;

function atualizarGraficoAnos(){

let agrupado = {};

acidentes.forEach(a=>{
agrupado[a.ano] = (agrupado[a.ano] || 0) + 1;
});

const labels = Object.keys(agrupado);
const dados = Object.values(agrupado);

const ctx = document.getElementById("graficoAnos").getContext("2d");

if(chartAnos){
chartAnos.destroy();
}

chartAnos = new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[{
label:"Acidentes por Ano",
data:dados,
backgroundColor:"rgba(110,168,254,0.4)",
borderColor:"#6ea8fe",
borderWidth:2
}]
},
options:{
responsive:true
}
});

}

document.getElementById("anoAtual").innerText = new Date().getFullYear();