import { db } from "../../../01_HOME/js/firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const listaChecklists = document.getElementById("listaChecklists");
const totalChecklists = document.getElementById("totalChecklists");
const totalNC = document.getElementById("totalNC");
const totalConformes = document.getElementById("totalConformes");

const buscar = document.getElementById("buscar");
const filtroStatus = document.getElementById("filtroStatus");

const modalDetalhes = document.getElementById("modalDetalhes");
const conteudoModal = document.getElementById("conteudoModal");
const fecharModal = document.getElementById("fecharModal");

let checklists = [];

async function carregarChecklists() {
  listaChecklists.innerHTML = "<p>Carregando checklists...</p>";

  const q = query(
    collection(db, "checklists"),
    where("tipo", "==", "Pá Carregadeira"),
    orderBy("criadoEm", "desc")
  );

  const snapshot = await getDocs(q);

  checklists = [];

  snapshot.forEach((doc) => {
    checklists.push({
      id: doc.id,
      ...doc.data()
    });
  });

  renderizarChecklists();
}

function temNaoConformidade(checklist) {
  return checklist.respostas?.some((item) => item.resposta === "NC");
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
  totalConformes.textContent = checklists.filter((c) => !temNaoConformidade(c)).length;

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
        </article>
      `;
    })
    .join("");
}

function abrirDetalhes(id) {
  const checklist = checklists.find((item) => item.id === id);

  if (!checklist) return;

  const itens = checklist.respostas || [];

  conteudoModal.innerHTML = `
    <h1>${checklist.tipo}</h1>

    <p><strong>Operador:</strong> ${checklist.operador || "-"}</p>
    <p><strong>Modelo:</strong> ${checklist.modelo || "-"}</p>
    <p><strong>Data:</strong> ${formatarData(checklist.data)}</p>
    <p><strong>Turno:</strong> ${checklist.turno || "-"}</p>
    <p><strong>Condição:</strong> ${checklist.condicaoOperacao || "-"}</p>

    <hr style="margin: 18px 0;" />

    <h2>Itens inspecionados</h2>

    ${itens
      .map((item) => {
        return `
          <div class="detalhe-item ${item.resposta === "NC" ? "nc" : ""}">
            <p><strong>${item.pergunta}</strong></p>
            <p>Resposta: ${item.resposta || "-"}</p>
            ${
              item.observacao
                ? `<p><strong>Observação:</strong> ${item.observacao}</p>`
                : ""
            }
          </div>
        `;
      })
      .join("")}

    <hr style="margin: 18px 0;" />

    <p><strong>Observações gerais:</strong></p>
    <p>${checklist.observacoes || "Sem observações."}</p>

    <button onclick="window.print()" style="
      margin-top: 20px;
      padding: 12px 18px;
      border: none;
      border-radius: 10px;
      background: #16a34a;
      color: white;
      font-weight: 700;
      cursor: pointer;
    ">
      Imprimir
    </button>
  `;

  modalDetalhes.classList.add("ativo");
}

function formatarData(data) {
  if (!data) return "-";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

listaChecklists.addEventListener("click", (event) => {
  const card = event.target.closest(".check-card");

  if (!card) return;

  abrirDetalhes(card.dataset.id);
});

fecharModal.addEventListener("click", () => {
  modalDetalhes.classList.remove("ativo");
});

buscar.addEventListener("input", renderizarChecklists);
filtroStatus.addEventListener("change", renderizarChecklists);

carregarChecklists();