// ================= DADOS =================
let tipos = JSON.parse(localStorage.getItem("tiposEPI")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidosEPI")) || [];
let editIndex = null;
const inputQtdEPI = document.getElementById("qtdEPI");

// ================= ELEMENTOS =================
const modalCadastro = document.getElementById("modalCadastro");
const modalPedido = document.getElementById("modalPedido");

const inputNome = document.getElementById("nomeEPI");
const selectEPI = document.getElementById("selectEPI");
const inputQtd = document.getElementById("quantidade");
const inputObs = document.getElementById("obs");

// ================= MODAIS =================
function abrirModalCadastro() {
  inputNome.value = "";
  modalCadastro.classList.add("show");
}

function abrirModalPedido() {
  preencherSelect();
  limparCamposPedido();
  modalPedido.classList.add("show");
}

function fecharModal() {
  modalCadastro.classList.remove("show");
  modalPedido.classList.remove("show");
}

// ================= CADASTRO EPI =================
function salvarTipo() {
  const nome = inputNome.value.trim();
  const quantidade = Number(inputQtdEPI.value);

  if (!nome) {
    alert("Digite o nome do EPI");
    return;
  }

  if (quantidade < 0 || isNaN(quantidade)) {
    alert("Digite uma quantidade válida");
    return;
  }

  const jaExiste = tipos.some(
    (t) => t.nome.toLowerCase() === nome.toLowerCase(),
  );

  if (jaExiste) {
    alert("Esse EPI já existe!");
    return;
  }

  const novoEPI = {
    id: Date.now(),
    nome,
    quantidade,
  };

  tipos.push(novoEPI);

  localStorage.setItem("tiposEPI", JSON.stringify(tipos));

  preencherSelect();
  renderTipos();
  fecharModal();
}

// ================= SELECT =================
function preencherSelect() {
  selectEPI.innerHTML = "<option value=''>Selecione um EPI</option>";

  tipos.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.nome;
    opt.textContent = t.nome;
    selectEPI.appendChild(opt);
  });
}

// ================= PEDIDOS =================
function salvarPedido() {
  const item = selectEPI.value;
  const qtd = inputQtd.value;
  const obs = inputObs.value;

  if (!item || !qtd) {
    alert("Preencha os campos!");
    return;
  }

  const novo = {
    item,
    qtd,
    obs,
  };

  if (editIndex !== null) {
    pedidos[editIndex] = novo;
    editIndex = null;
  } else {
    pedidos.push(novo);
  }

  localStorage.setItem("pedidosEPI", JSON.stringify(pedidos));

  fecharModal();
  render();
}

// ================= RENDER =================
function render() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  pedidos.forEach((p, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.item}</td>
      <td>${p.qtd}</td>
      <td>${p.obs || "-"}</td>
      <td>
        <button class="btn-edit" onclick="editar(${i})">✏️</button>
        <button class="btn-delete" onclick="excluir(${i})">🗑️</button>
      </td>
    `;

    lista.appendChild(tr);
  });
}

function renderTipos() {
  const listaTipos = document.getElementById("listaTipos");
  listaTipos.innerHTML = "";

  tipos.forEach((epi, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${epi.nome}</td>

      <td>
        <div class="qtd-box">
          <button class="btn-qtd" onclick="diminuirQtd(${i})">-</button>

          <span class="qtd-num" onclick="editarQtd(${i})">
            ${epi.quantidade ?? 0}
          </span>

          <button class="btn-qtd" onclick="aumentarQtd(${i})">+</button>
        </div>
      </td>

      <td>
        <button class="btn-delete" onclick="excluirTipo(${i})">
          🗑️
        </button>
      </td>
    `;

    listaTipos.appendChild(tr);
  });
}

function aumentarQtd(i) {
  tipos[i].quantidade = (tipos[i].quantidade || 0) + 1;

  salvarTipos();
}

function diminuirQtd(i) {
  if ((tipos[i].quantidade || 0) > 0) {
    tipos[i].quantidade--;
  }

  salvarTipos();
}

function editarQtd(i) {
  const atual = tipos[i].quantidade || 0;

  const novo = prompt("Digite a nova quantidade:", atual);

  if (novo === null) return;

  const valor = Number(novo);

  if (isNaN(valor) || valor < 0) {
    alert("Valor inválido");
    return;
  }

  tipos[i].quantidade = valor;

  salvarTipos();
}

function salvarTipos() {
  localStorage.setItem("tiposEPI", JSON.stringify(tipos));
  renderTipos();
}

// ================= EDITAR =================
function editar(i) {
  const p = pedidos[i];
  editIndex = i;

  preencherSelect();
  modalPedido.classList.add("show");

  selectEPI.value = p.item;
  inputQtd.value = p.qtd;
  inputObs.value = p.obs;
}

// ================= EXCLUIR =================
function excluirTipo(i) {
  if (!confirm("Deseja excluir este EPI?")) return;

  tipos.splice(i, 1);

  localStorage.setItem("tiposEPI", JSON.stringify(tipos));

  preencherSelect();
  renderTipos();
}

// ================= UTIL =================
function limparCamposPedido() {
  selectEPI.value = "";
  inputQtd.value = "";
  inputObs.value = "";
}

// ================= INIT =================
function init() {
  preencherSelect();
  render();
  renderTipos();
}

init();

// ================= GLOBAL =================
// ================= GLOBAL =================
window.abrirModalCadastro = abrirModalCadastro;
window.abrirModalPedido = abrirModalPedido;
window.salvarTipo = salvarTipo;
window.salvarPedido = salvarPedido;
window.editar = editar;
window.excluirTipo = excluirTipo;
window.fecharModal = fecharModal;
window.aumentarQtd = aumentarQtd;
window.diminuirQtd = diminuirQtd;
window.editarQtd = editarQtd;
