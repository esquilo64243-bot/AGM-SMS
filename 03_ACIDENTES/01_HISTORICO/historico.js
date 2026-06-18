import { db } from "../../01_HOME/js/firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let acidentes = [];
let registroSelecionado = null;

const ordemMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

const buscaHistorico = document.getElementById("buscaHistorico");
const filtroAno = document.getElementById("filtroAno");
const filtroTipo = document.getElementById("filtroTipo");
const listaHistorico = document.getElementById("listaHistorico");

const modalDetalhes = document.getElementById("modalDetalhes");
const fecharDetalhes = document.getElementById("fecharDetalhes");
const excluirRegistro = document.getElementById("excluirRegistro");

async function carregarAcidentes() {
  const querySnapshot = await getDocs(collection(db, "acidentes"));

  acidentes = [];

  querySnapshot.forEach((documento) => {
    const dados = documento.data();

    const dataObj = dados.data
      ? new Date(dados.data + "T00:00:00")
      : new Date();

    acidentes.push({
      id: documento.id,
      nome: dados.nome || "-",
      dataOriginal: dados.data || "",
      data: formatarDataBR(dados.data),
      ano: dataObj.getFullYear(),
      mes: ordemMeses[dataObj.getMonth()],
      tipo: dados.tipo || "-",
      local: dados.local || "-",
      area: dados.area || "Não informado",
      corpo: dados.corpo || "Não informado",
      agente: dados.agente || "Não informado",
      descricao: dados.descricao || "-"
    });
  });

  preencherFiltroAno();
  renderizarHistorico();
}

function preencherFiltroAno() {
  const anos = [...new Set(acidentes.map(a => a.ano))]
    .sort((a, b) => b - a);

  filtroAno.innerHTML = `
    <option value="Todos">Todos os anos</option>
    ${anos.map(ano => `<option value="${ano}">${ano}</option>`).join("")}
  `;
}

function filtrarAcidentes() {
  const termo = buscaHistorico.value.toLowerCase().trim();
  const anoSelecionado = filtroAno.value;
  const tipoSelecionado = filtroTipo.value;

  return acidentes.filter((a) => {
    const bateAno =
      anoSelecionado === "Todos" || String(a.ano) === anoSelecionado;

    const bateTipo =
      tipoSelecionado === "Todos" || a.tipo === tipoSelecionado;

    const textoBusca = `
      ${a.nome}
      ${a.local}
      ${a.area}
      ${a.corpo}
      ${a.agente}
      ${a.descricao}
      ${a.tipo}
    `.toLowerCase();

    const bateBusca = textoBusca.includes(termo);

    return bateAno && bateTipo && bateBusca;
  });
}

function renderizarHistorico() {
  const filtrados = filtrarAcidentes();

  if (filtrados.length === 0) {
    listaHistorico.innerHTML = `
      <div class="texto-vazio">
        Nenhum registro encontrado.
      </div>
    `;
    return;
  }

  const anos = [...new Set(filtrados.map(a => a.ano))]
    .sort((a, b) => b - a);

  let html = "";

  anos.forEach((ano) => {
    const acidentesAno = filtrados.filter(a => a.ano === ano);

    html += `
      <section class="ano-card open">
        <div class="ano-header">
          <span>${ano}</span>
          <small>${acidentesAno.length} registro(s)</small>
        </div>

        <div class="ano-content">
    `;

    const meses = ordemMeses.filter(mes =>
      acidentesAno.some(a => a.mes === mes)
    );

    meses.forEach((mes) => {
      const acidentesMes = acidentesAno.filter(a => a.mes === mes);

      html += `
        <div class="mes-card open">
          <div class="mes-header">
            ${mes} • ${acidentesMes.length} registro(s)
          </div>

          <div class="mes-content">
      `;

      acidentesMes
        .sort((a, b) => new Date(b.dataOriginal) - new Date(a.dataOriginal))
        .forEach((a) => {
          html += `
            <article class="registro-card ${classeTipo(a.tipo)}" data-id="${a.id}">
              <h3>${a.nome}</h3>
              <p><strong>Data:</strong> ${a.data}</p>
              <p><strong>Local:</strong> ${a.local}</p>
              <p><strong>Área:</strong> ${a.area}</p>
              <span class="status-tag">${a.tipo}</span>
            </article>
          `;
        });

      html += `
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </section>
    `;
  });

  listaHistorico.innerHTML = html;

  configurarAccordion();
  configurarCards();
}

function configurarAccordion() {
  document.querySelectorAll(".ano-header").forEach((header) => {
    header.onclick = () => {
      header.parentElement.classList.toggle("open");
    };
  });

  document.querySelectorAll(".mes-header").forEach((header) => {
    header.onclick = (e) => {
      e.stopPropagation();
      header.parentElement.classList.toggle("open");
    };
  });
}

function configurarCards() {
  document.querySelectorAll(".registro-card").forEach((card) => {
    card.onclick = () => {
      const id = card.dataset.id;
      abrirDetalhes(id);
    };
  });
}

function abrirDetalhes(id) {
  const registro = acidentes.find(a => a.id === id);
  if (!registro) return;

  registroSelecionado = id;

  document.getElementById("detalheNome").innerText = registro.nome;
  document.getElementById("detalheData").innerText = registro.data;
  document.getElementById("detalheTipo").innerText = registro.tipo;
  document.getElementById("detalheLocal").innerText = registro.local;
  document.getElementById("detalheArea").innerText = registro.area;
  document.getElementById("detalheCorpo").innerText = registro.corpo;
  document.getElementById("detalheAgente").innerText = registro.agente;
  document.getElementById("detalheDescricao").innerText = registro.descricao;

  modalDetalhes.classList.add("show");
}

function fecharModal() {
  modalDetalhes.classList.remove("show");
  registroSelecionado = null;
}

async function excluirSelecionado() {
  if (!registroSelecionado) {
    alert("Nenhum registro selecionado.");
    return;
  }

  const confirmar = confirm("Tem certeza que deseja excluir este registro?");
  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "acidentes", registroSelecionado));

    fecharModal();
    await carregarAcidentes();

    alert("Registro excluído com sucesso.");
  } catch (erro) {
    console.error("Erro ao excluir registro:", erro);
    alert("Erro ao excluir registro.");
  }
}

function classeTipo(tipo) {
  if (tipo === "Com Afastamento") return "com-afastamento";
  if (tipo === "Sem Afastamento") return "sem-afastamento";
  if (tipo === "Dano Material") return "dano-material";
  if (tipo === "Fatalidade") return "fatalidade";
  return "";
}

function formatarDataBR(data) {
  if (!data) return "--/--/----";

  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

buscaHistorico.addEventListener("input", renderizarHistorico);
filtroAno.addEventListener("change", renderizarHistorico);
filtroTipo.addEventListener("change", renderizarHistorico);

fecharDetalhes.onclick = fecharModal;
excluirRegistro.onclick = excluirSelecionado;

modalDetalhes.addEventListener("click", (e) => {
  if (e.target === modalDetalhes) {
    fecharModal();
  }
});

carregarAcidentes();