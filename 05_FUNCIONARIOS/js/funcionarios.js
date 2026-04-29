// =========================
// FIREBASE
// =========================
import { db } from "../../01_HOME/js/firebase.js";
let idEditando = null;

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let selecionados = [];

// =========================
// LISTAS FIXAS
// =========================
const empresas = ["Serra Morena", "AGM", "AGM Florestal"];
const setores = ["Operação", "Manutenção", "Escritório"];
const cargos = [
  "JOVEM APRENDIZ",
  "ASSISTENTE ADMINISTRATIVO",
  "AUXILIAR ADMINISTRATIVO",
  "AUXILIAR DE ELETRICISTA",
  "AUXILIAR DE ESCRITÓRIO",
  "AUXILIAR DE LIMPEZA",
  "AUXILIAR DE MECÂNICO",
  "AJUDANTE DE OPERAÇÃO PORTUÁRIA",
  "ELETRICISTA",
  "ENCARREGADO DE ELÉTRICA",
  "ENCARREGADO DE MECÂNICA",
  "ENCARREGADO DE OPERAÇÃO",
  "GERENTE DE PLANEJAMENTO",
  "GERENTE DE LOGÍSTICA",
  "GERENTE DE MANUTENÇÃO",
  "GUINDASTEIRO",
  "MECÂNICO DE MANUTENÇÃO",
  "OPERADOR",
  "OPERADOR DE MÁQUINA",
  "SUPERVISOR DE DIGITAÇÃO",
  "TÉCNICO DE SEGURANÇA"
];

// =========================
// FORMATAR DATA
// =========================
function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
}

// =========================
// PREENCHER SELECTS
// =========================
function preencherSelect(id, lista) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = "";

  lista
    .slice()
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
}

// =========================
// SALVAR FUNCIONÁRIO
// =========================
async function salvar() {
  try {
    const nome = document.getElementById("nome").value;
    const empresa = document.getElementById("empresa").value;
    const setor = document.getElementById("setor").value;
    const cargo = document.getElementById("cargo").value;
    const dataEntrada = document.getElementById("dataEntrada").value;

    const email = document.getElementById("email")?.value || "";
    const telefone = document.getElementById("telefone")?.value || "";
    const sexo = document.getElementById("sexo")?.value || "";
    const notas = document.getElementById("notas")?.value || "";
    const status = document.getElementById("status")?.value || "Ativo";

    const novoCargo = document.getElementById("novoCargo")?.value;
    const dataPromocao = document.getElementById("dataPromocao")?.value;

    // ✅ VALIDAÇÃO CORRETA
    if (!nome.trim()) {
      alert("Nome obrigatório");
      return;
    }

    if (!empresa || !setor || !cargo || !dataEntrada) {
      alert("Preenche todos os campos principais!");
      return;
    }

    let historico = [];

    if (idEditando) {
      const ref = doc(db, "funcionarios", idEditando);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        historico = snap.data().historico || [];
      }

      if (novoCargo) {
        const dataFinal = dataPromocao || new Date().toISOString().split("T")[0];

        const jaExiste = historico.some(h =>
          h.cargo === novoCargo && h.data === dataFinal
        );

        if (!jaExiste) {
          historico.push({
            cargo: novoCargo,
            data: dataFinal
          });
        }
      }

let cargoFinal = cargo;

if (novoCargo && novoCargo.trim() !== "") {
  cargoFinal = novoCargo;
} else if (cargo !== snap.data().cargoAtual) {
  // se mudou o cargo manualmente
  const dataFinal = new Date().toISOString().split("T")[0];

  historico.push({
    cargo: cargo,
    data: dataFinal
  });

  cargoFinal = cargo;
} else if (historico.length) {
        cargoFinal = historico[historico.length - 1].cargo;
      }

      await updateDoc(ref, {
        nome,
        empresa,
        setor,
        cargoAtual: cargoFinal,
        dataEntrada,
        email,
        telefone,
        sexo,
        notas,
        status,
        historico
      });

      alert("Atualizado!");
      idEditando = null;

    } else {
      historico = [
        {
          cargo,
          data: dataEntrada
        }
      ];

      await addDoc(collection(db, "funcionarios"), {
        nome,
        empresa,
        setor,
        cargoAtual: cargo,
        dataEntrada,
        email,
        telefone,
        sexo,
        notas,
        status,
        historico
      });

      alert("Funcionário cadastrado!");
    }

    fecharModal();
    carregar();

  } catch (erro) {
    console.error(erro);
    alert("Erro!");
  }
}

// =========================
// CARREGAR (COM FILTRO + ORDEM)
// =========================
async function carregar() {
  const termo = document.getElementById("buscaNome")?.value?.toLowerCase() || "";
  const cargoFiltro = document.getElementById("filtroCargo")?.value?.toLowerCase() || "todos";
  const empresaFiltro = document.getElementById("filtroEmpresa")?.value?.toLowerCase() || "todas";

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "funcionarios"));

  let funcionarios = [];

  querySnapshot.forEach(docSnap => {
    funcionarios.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  // 🔥 ORDEM ALFABÉTICA
  funcionarios.sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  funcionarios.forEach(f => {

    if (!f.nome.toLowerCase().includes(termo)) return;

    const cargoAtual = (f.cargoAtual || "").toLowerCase();
    const empresa = (f.empresa || "").toLowerCase();

    if (
      (cargoFiltro !== "todos" && cargoAtual !== cargoFiltro) ||
      (empresaFiltro !== "todas" && empresa !== empresaFiltro)
    ) return;

    const div = document.createElement("div");
    div.classList.add("card");

    div.addEventListener("click", (e) => {
      if (
        e.target.closest(".btn-editar") ||
        e.target.closest(".btn-excluir") ||
        e.target.type === "checkbox"
      ) return;

      toggle(f.id);
    });

    div.innerHTML = `
      <div class="card-header">
        <div class="left">
          <h4>${f.nome}</h4>
          <p>${f.cargoAtual}</p>
        </div>

        <div class="right">
          <input 
            type="checkbox"
            data-id="${f.id}"
            ${selecionados.includes(f.id) ? "checked" : ""}
            onchange="selecionar('${f.id}', this)"
          >

          <span class="status ${(f.status || "ativo").toLowerCase()}">
            ${f.status || "Ativo"}
          </span>

          <button class="btn-editar" onclick="editar('${f.id}', event)">✏️</button>
          <button class="btn-excluir" onclick="excluir('${f.id}', event)">🗑️</button>
        </div>
      </div>

      <div class="card-body" id="body-${f.id}" style="display:none;">
        <p><strong>Email:</strong> ${f.email || "-"}</p>
        <p><strong>Sexo:</strong> ${f.sexo || "-"}</p>
        <p><strong>Setor:</strong> ${f.setor || "-"}</p>
        <p><strong>Telefone:</strong> ${f.telefone || "-"}</p>
        <p><strong>Data de Admissão:</strong> ${formatarData(f.dataEntrada)}</p>

        <p><strong>Histórico:</strong></p>
        <ul>
          ${(f.historico || []).map(h => `
            <li>${h.cargo} - ${formatarData(h.data)}</li>
          `).join("")}
        </ul>

        <p><strong>Notas:</strong></p>
        <p>${f.notas || "Sem observações"}</p>
      </div>
    `;

    lista.appendChild(div);
  });
}

// =========================
// FILTRAR
// =========================
function filtrar() {
  carregar();
}

// =========================
// EXCLUIR
// =========================
async function excluir(id, e) {
  e.stopPropagation();

  if (!confirm("Tem certeza que quer excluir?")) return;

  await deleteDoc(doc(db, "funcionarios", id));
  carregar();
}

// =========================
// TOGGLE
// =========================
function toggle(id) {
  const el = document.getElementById("body-" + id);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

// =========================
// SELECT
// =========================
function selecionar(id, checkbox) {
  if (checkbox.checked) {
    if (!selecionados.includes(id)) selecionados.push(id);
    checkbox.closest(".card").classList.add("selecionado");
  } else {
    selecionados = selecionados.filter(i => i !== id);
    checkbox.closest(".card").classList.remove("selecionado");
  }

  atualizarAcoes();
}

function atualizarAcoes() {
  const box = document.getElementById("acoesSelecionados");
  const contador = document.getElementById("contadorSelecionados");

  if (selecionados.length > 0) {
    box.style.display = "block";
    contador.textContent = `${selecionados.length} selecionado(s)`;
  } else {
    box.style.display = "none";
  }
}

// =========================
// MODAL
// =========================
function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("novoCargo").value = "";
  document.getElementById("dataPromocao").value = "";
  document.getElementById("modal").style.display = "none";
}

// =========================
// EDITAR
// =========================
async function editar(id, e) {
  e.stopPropagation();

  idEditando = id;

  const ref = doc(db, "funcionarios", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Funcionário não encontrado!");
    return;
  }

  const f = snap.data();

  document.getElementById("nome").value = f.nome;
  document.getElementById("empresa").value = f.empresa;
  document.getElementById("setor").value = f.setor;
  document.getElementById("cargo").value = f.cargoAtual;
  document.getElementById("dataEntrada").value = f.dataEntrada;
  document.getElementById("email").value = f.email || "";
  document.getElementById("telefone").value = f.telefone || "";
  document.getElementById("sexo").value = f.sexo || "";
  document.getElementById("notas").value = f.notas || "";
  document.getElementById("status").value = f.status || "Ativo";

  abrirModal();
}
// =========================
// GLOBAL
// =========================
window.onload = () => {
  preencherSelect("empresa", empresas);
  preencherSelect("setor", setores);
  preencherSelect("cargo", cargos);
  preencherSelect("novoCargo", ["", ...cargos]);
  preencherSelect("filtroCargo", ["Todos", ...cargos]);
  preencherSelect("filtroEmpresa", ["Todas", ...empresas]);

  // 🔥 RESET FILTROS
  document.getElementById("filtroCargo").value = "Todos";
  document.getElementById("filtroEmpresa").value = "Todas";

  carregar();
};

function buscar() {
  carregar();
}

// =========================
// COPY NOMES
// =========================
async function copiarNomes() {
  if (selecionados.length === 0) {
    alert("Seleciona pelo menos um funcionário!");
    return;
  }

  const querySnapshot = await getDocs(collection(db, "funcionarios"));
  let nomes = "";

  querySnapshot.forEach(docSnap => {
    if (selecionados.includes(docSnap.id)) {
      nomes += docSnap.data().nome + "\n";
    }
  });

  await navigator.clipboard.writeText(nomes);
  alert("Nomes copiados!");
}

// =========================
// COPY TUDO
// =========================
async function copiarTudo() {
  const querySnapshot = await getDocs(collection(db, "funcionarios"));

  let texto = "";

  querySnapshot.forEach(docSnap => {
    if (selecionados.includes(docSnap.id)) {
      const f = docSnap.data();

      texto += `
Nome: ${f.nome}
Cargo: ${f.cargoAtual}
Empresa: ${f.empresa}
Setor: ${f.setor}
-----------------------
`;
    }
  });

  await navigator.clipboard.writeText(texto);
  alert("Tudo copiado!");
}

// =========================
// PDF (TXT)
// =========================
async function gerarPDF() {
  const querySnapshot = await getDocs(collection(db, "funcionarios"));

  let conteudo = "";

  querySnapshot.forEach(docSnap => {
    if (selecionados.includes(docSnap.id)) {
      const f = docSnap.data();
      conteudo += `${f.nome} - ${f.cargoAtual}\n`;
    }
  });

  const blob = new Blob([conteudo], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "funcionarios.txt";
  link.click();
}

// =========================
// SELECT ALL
// =========================
function selecionarTodos() {
  const checkboxes = document.querySelectorAll("#lista input[type='checkbox']");

  checkboxes.forEach(cb => {
    cb.checked = true;

    if (!selecionados.includes(cb.dataset.id)) {
      selecionados.push(cb.dataset.id);
    }

    cb.closest(".card").classList.add("selecionado");
  });

  atualizarAcoes();
}

// =========================
// LIMPAR
// =========================
function limparSelecao() {
  selecionados = [];

  document.querySelectorAll("#lista input[type='checkbox']")
    .forEach(cb => {
      cb.checked = false;
      cb.closest(".card").classList.remove("selecionado");
    });

  atualizarAcoes();
}

// =========================
// EXPORT GLOBAL
// =========================
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.salvar = salvar;
window.editar = editar;
window.excluir = excluir;
window.buscar = buscar;
window.filtrar = filtrar;
window.toggle = toggle;
window.selecionar = selecionar;
window.copiarNomes = copiarNomes;
window.copiarTudo = copiarTudo;
window.gerarPDF = gerarPDF;
window.selecionarTodos = selecionarTodos;
window.limparSelecao = limparSelecao;