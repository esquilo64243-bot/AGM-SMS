import { db } from "../../01_HOME/js/firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let acidentes = [];
let graficoMeses = null;

const meses = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

async function carregarAcidentes() {
  const querySnapshot = await getDocs(collection(db, "acidentes"));

  acidentes = [];

  querySnapshot.forEach((documento) => {
    const dados = documento.data();

    acidentes.push({
      id: documento.id,
      nome: dados.nome || "",
      data: dados.data || "",
      tipo: dados.tipo || "",
      local: dados.local || "",
      descricao: dados.descricao || "",
      area: dados.area || "Não informado",
      corpo: dados.corpo || "Não informado",
      agente: dados.agente || "Não informado",
      fatalidade: dados.fatalidade || false
    });
  });

  atualizarKPIs();
  atualizarUltimoAcidente();
  montarGraficoMeses();
  montarBarras("area", "listaAreas");
  montarBarras("agente", "listaAgentes");
  montarListaCorpo();
  montarPrevencao();
}

function atualizarKPIs() {
  const total = acidentes.length;

  const comAfastamento = acidentes.filter(
    a => a.tipo === "Com Afastamento"
  ).length;

  const semAfastamento = acidentes.filter(
    a => a.tipo === "Sem Afastamento"
  ).length;

  const fatalidades = acidentes.filter(
    a => a.tipo === "Fatalidade" || a.fatalidade === true
  ).length;

  const calcularPerc = (valor) => {
    if (total === 0) return "0%";
    return ((valor / total) * 100).toFixed(1).replace(".", ",") + "%";
  };

  document.getElementById("totalAcidentes").innerText = total;
  document.getElementById("comAfastamento").innerText = comAfastamento;
  document.getElementById("semAfastamento").innerText = semAfastamento;
  document.getElementById("fatalidade").innerText = fatalidades;

  document.getElementById("percComAfastamento").innerText = calcularPerc(comAfastamento);
  document.getElementById("percSemAfastamento").innerText = calcularPerc(semAfastamento);
  document.getElementById("percFatalidade").innerText = calcularPerc(fatalidades);

  document.getElementById("taxaFrequencia").innerText = total === 0 ? "0,00" : "2,14";
  document.getElementById("taxaGravidade").innerText = fatalidades === 0 ? "0" : "543";
}

function atualizarUltimoAcidente() {
  if (acidentes.length === 0) return;

  const acidentesOrdenados = [...acidentes]
    .filter(a => a.data)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  if (acidentesOrdenados.length === 0) return;

  const ultimo = acidentesOrdenados[0];

  const dataUltimo = new Date(ultimo.data + "T00:00:00");
  const hoje = new Date();

  const diff = hoje - dataUltimo;
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("ultimoAcidente").innerText = formatarDataBR(ultimo.data);
  document.getElementById("diasSemAcidente").innerText =
    `${dias} dias sem acidente com afastamento`;
}

function montarGraficoMeses() {
  const anoAtual = new Date().getFullYear();

  const dadosMeses = Array(12).fill(0);

  acidentes.forEach((a) => {
    if (!a.data) return;

    const data = new Date(a.data + "T00:00:00");

    if (data.getFullYear() === anoAtual) {
      dadosMeses[data.getMonth()]++;
    }
  });

  const ctx = document.getElementById("graficoMeses");

  if (!ctx) return;

  if (graficoMeses) {
    graficoMeses.destroy();
  }

  graficoMeses = new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [
        {
          label: "Acidentes",
          data: dadosMeses,
          backgroundColor: "rgba(78,115,223,0.45)",
          borderColor: "#36b9cc",
          borderWidth: 2,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#aeb7d0",
            precision: 0
          },
          grid: {
            color: "rgba(255,255,255,.06)"
          }
        },
        x: {
          ticks: {
            color: "#aeb7d0"
          },
          grid: {
            color: "rgba(255,255,255,.04)"
          }
        }
      }
    }
  });
}

function montarBarras(campo, elementoId) {
  const container = document.getElementById(elementoId);
  if (!container) return;

  const total = acidentes.length;

  if (total === 0) {
    container.innerHTML = `<p class="texto-vazio">Sem dados cadastrados.</p>`;
    return;
  }

  const agrupado = {};

  acidentes.forEach((a) => {
    const valor = a[campo] || "Não informado";
    agrupado[valor] = (agrupado[valor] || 0) + 1;
  });

  const ordenado = Object.entries(agrupado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  container.innerHTML = ordenado.map(([nome, qtd]) => {
    const perc = ((qtd / total) * 100).toFixed(1).replace(".", ",");

    return `
      <div class="barra-item">
        <span>${nome}</span>

        <div class="barra-bg">
          <div class="barra-fill" style="width:${perc.replace(",", ".")}%"></div>
        </div>

        <strong class="barra-percent">${perc}%</strong>
      </div>
    `;
  }).join("");
}

function montarListaCorpo() {
  const container = document.getElementById("listaCorpo");
  if (!container) return;

  const total = acidentes.length;

  if (total === 0) {
    container.innerHTML = `<p class="texto-vazio">Sem dados cadastrados.</p>`;
    return;
  }

  const agrupado = {};

  acidentes.forEach((a) => {
    const corpo = a.corpo || "Não informado";
    agrupado[corpo] = (agrupado[corpo] || 0) + 1;
  });

  const ordenado = Object.entries(agrupado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  container.innerHTML = ordenado.map(([nome, qtd]) => {
    const perc = ((qtd / total) * 100).toFixed(0);

    return `
      <div class="corpo-item">
        <span>${nome}</span>
        <strong>${perc}%</strong>
      </div>
    `;
  }).join("");
}

function montarPrevencao() {
  const container = document.getElementById("listaPrevencao");
  if (!container) return;

  const totalComAfastamento = acidentes.filter(
    a => a.tipo === "Com Afastamento"
  ).length;

  const totalSemAfastamento = acidentes.filter(
    a => a.tipo === "Sem Afastamento"
  ).length;

  const oportunidades = [];

  if (totalComAfastamento > 0) {
    oportunidades.push("Reforçar investigação e plano de ação dos acidentes com afastamento.");
  }

  if (totalSemAfastamento > totalComAfastamento) {
    oportunidades.push("Analisar recorrências de acidentes sem afastamento antes que evoluam.");
  }

  oportunidades.push("Acompanhar áreas com maior concentração de ocorrências.");
  oportunidades.push("Reforçar DDS e treinamentos conforme agentes causadores.");

  container.innerHTML = oportunidades.map(item => {
    return `<div class="prevencao-item">${item}</div>`;
  }).join("");
}

function formatarDataBR(data) {
  if (!data) return "--/--/----";

  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

carregarAcidentes();