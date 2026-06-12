import { db } from "../../01_HOME/js/firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let acidentes = [];

let filtroAno = new Date().getFullYear();
let filtroTipo = "Todos";
let filtroMes = [];

let tipoGraficoAtual = "bar";
let chart = null;

function fecharPaineis() {
  document.querySelectorAll(".painel").forEach((painel) => {
    painel.classList.remove("show");
  });
}


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

const dadosIniciais =
  tipoGraficoAtual === "line"
    ? dados.map(() => null)
    : dados.map(() => 0);

  chart = new Chart(ctx, {
    type: tipoGraficoAtual,

    data: {
      labels,
      datasets: [{
        label: "Total de Acidentes",
        data: dadosIniciais,

        backgroundColor: tipoGraficoAtual === "pie"
          ? [
              "#4e73df", "#1cc88a", "#36b9cc",
              "#f6c23e", "#e74a3b", "#858796",
              "#5a5c69", "#20c997", "#6610f2",
              "#fd7e14", "#6f42c1", "#17a2b8"
            ]
          : "rgba(78,115,223,0.45)",

        borderColor: tipoGraficoAtual === "pie" ? "#1d2642" : "#36b9cc",
        borderWidth: tipoGraficoAtual === "line" ? 4 : 2,
        tension: tipoGraficoAtual === "line" ? 0.45 : 0,
        fill: tipoGraficoAtual === "bar",
        pointRadius: tipoGraficoAtual === "line" ? 6 : 0,
        pointHoverRadius: tipoGraficoAtual === "line" ? 8 : 0
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 1600,
        easing: "easeOutCubic"
      },

      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#fff"
          }
        }
      },

      scales: tipoGraficoAtual === "pie"
        ? {}
        : {
            y: {
              beginAtZero: true,
              ticks: { color: "#aeb7d0" },
              grid: { color: "rgba(255,255,255,.06)" }
            },
            x: {
              ticks: { color: "#aeb7d0" },
              grid: { color: "rgba(255,255,255,.04)" }
            }
          }
    }
  });
    if (tipoGraficoAtual === "line") {
    let i = 0;

    const intervalo = setInterval(() => {
      chart.data.datasets[0].data[i] = dados[i];
      chart.update();

      i++;

      if (i >= dados.length) {
        clearInterval(intervalo);
      }
    }, 300);
  } else {
    setTimeout(() => {
      chart.data.datasets[0].data = dados;
      chart.update();
    }, 100);
  }
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

function formatarDataBR(data){

if(!data) return "-";

const partes = data.split("-");

return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =============================
// FIREBASE
// =============================

async function carregarAcidentes(){

const querySnapshot = await getDocs(collection(db,"acidentes"));

acidentes = [];

querySnapshot.forEach((documento) => {
  const dados = documento.data();

  const dataObj = dados.data ? new Date(dados.data + "T00:00:00") : new Date();

const meses=[
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const mes = meses[dataObj.getMonth()];

acidentes.push({
  id: documento.id,
  ano: dataObj.getFullYear(),
  mes: mes,
  nome: dados.nome,
  data: formatarDataBR(dados.data),
  tipo: dados.tipo,
  local: dados.local,
  descricao: dados.descricao,
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

const container = document.getElementById("listaAnos");

let html = "";

const anos =
[...new Set(acidentes.map(a=>a.ano))]
.sort((a,b)=>b-a);

anos.forEach(ano=>{

html += `<div class="ano">
<div class="ano-header">${ano}</div>
<div class="meses">`;

const acidentesAno = acidentes.filter(a=>a.ano == ano);

const ordemMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

const meses = ordemMeses.filter((mes) =>
  acidentesAno.some((a) => a.mes === mes)
);

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

const acidente =
acidentes.find(a => a.id === id);

if(!acidente) return;

acidenteSelecionado = id;

document.getElementById("detalheNome").innerText = acidente.nome;
document.getElementById("detalheData").innerText = acidente.data;
document.getElementById("detalheTipo").innerText = acidente.tipo;
document.getElementById("detalheLocal").innerText = acidente.local;
document.getElementById("detalheDescricao").innerText = acidente.descricao;

document
.getElementById("modalDetalhes")
.classList.add("show");

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
let acidenteSelecionado = null;

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
const modalDetalhes =
document.getElementById("modalDetalhes");

const voltarDetalhes =
document.getElementById("voltarDetalhes");

const excluirDetalhes =
document.getElementById("excluirDetalhes");

const btnGrafico = document.getElementById("btnGrafico");
const painelGrafico = document.getElementById("painelGrafico");

voltarDetalhes.onclick = ()=>{

modalDetalhes.classList.remove("show");

};

excluirDetalhes.onclick = async ()=>{

if(!acidenteSelecionado){
  alert("Nenhum registro selecionado.");
  return;
}

const confirmar =
confirm("Tem certeza que deseja excluir este registro?");

if(!confirmar) return;

try{

await deleteDoc(
doc(db,"acidentes",acidenteSelecionado)
);

acidenteSelecionado = null;

modalDetalhes.classList.remove("show");

await carregarAcidentes();

alert("Registro excluído com sucesso.");

}
catch(e){

console.error(e);

alert("Erro ao excluir acidente");

}

};


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

if(!nome || !data || !tipo || !local || !descricao){

  loading.style.display="none";

  alert("Preencha todos os campos antes de registrar.");

  return;
}

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
btnGrafico.onclick = (e) => {
  e.stopPropagation();

  const estavaAberto = painelGrafico.classList.contains("show");
  fecharPaineis();

  painelGrafico.innerHTML = `
    <div onclick="mudarGrafico('bar')">Barras</div>
    <div onclick="mudarGrafico('line')">Linha</div>
    <div onclick="mudarGrafico('pie')">Pizza</div>
  `;

  if (!estavaAberto) painelGrafico.classList.add("show");
};

const btnMes = document.getElementById("btnMes");
const painelMes = document.getElementById("painelMes");

painelMes.addEventListener("change", () => {

  const todos = document.getElementById("mesTodos");
  const checkboxes = painelMes.querySelectorAll(
    "input[type='checkbox']:not(#mesTodos):checked"
  );

  if (todos.checked) {
    painelMes
      .querySelectorAll("input[type='checkbox']:not(#mesTodos)")
      .forEach(cb => cb.checked = false);

    filtroMes = [];
  } else {
    filtroMes = Array.from(checkboxes).map(cb => cb.value);
  }

  atualizarGrafico();
});

btnMes.onclick = (e) => {
  e.stopPropagation();

  const estavaAberto = painelMes.classList.contains("show");
  fecharPaineis();

  painelMes.innerHTML = `
    <label><input type="checkbox" id="mesTodos" checked> Todos</label>

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

  if (!estavaAberto) painelMes.classList.add("show");
};


carregarAcidentes();

const btnTipo = document.getElementById("btnTipo");
const painelTipo = document.getElementById("painelTipo");

const btnAno = document.getElementById("btnAno");
const painelAno = document.getElementById("painelAno");

btnAno.onclick = (e) => {
  e.stopPropagation();

  const estavaAberto = painelAno.classList.contains("show");
  fecharPaineis();

  if (!estavaAberto) {
    painelAno.classList.add("show");
  }

  const anos = [...new Set(acidentes.map((a) => a.ano))].sort((a, b) => b - a);

  painelAno.innerHTML = anos
    .map((ano) => `<div onclick="selecionarAno(${ano})">${ano}</div>`)
    .join("");
};

btnTipo.onclick = (e) => {
  e.stopPropagation();

  const estavaAberto = painelTipo.classList.contains("show");
  fecharPaineis();

  painelTipo.innerHTML = `
    <div onclick="selecionarTipo('Todos')">Todos</div>
    <div onclick="selecionarTipo('Dano Material')">Dano Material</div>
    <div onclick="selecionarTipo('Sem Afastamento')">Sem Afastamento</div>
    <div onclick="selecionarTipo('Com Afastamento')">Com Afastamento</div>
  `;

  if (!estavaAberto) painelTipo.classList.add("show");
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".filtro-item")) {
    fecharPaineis();
  }
});
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

window.selecionarAno = function (ano) {
  filtroAno = ano;

  document.getElementById("anoAtual").innerText = ano;
  document.getElementById("painelAno").classList.remove("show");

  atualizarGrafico();
};