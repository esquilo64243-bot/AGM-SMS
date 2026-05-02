import { addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const buscaInput = document.getElementById("busca");
const filtroFuncao = document.getElementById("filtroFuncao");
const filtroEmpresa = document.getElementById("filtroEmpresa");

const modalTreino = document.getElementById("modalTreino");
const salvarTreino = document.getElementById("salvarTreino");
const cancelarTreino = document.getElementById("cancelarTreino");

const dataRealizacao = document.getElementById("dataRealizacao");
const dataVencimento = document.getElementById("dataVencimento");

const totalFunc = document.getElementById("totalFunc");
const totalEmDia = document.getElementById("totalEmDia");
const totalAVencer = document.getElementById("totalAVencer");
const totalVencido = document.getElementById("totalVencido");

let funcionarios = [];
let funcionarioSelecionado = null;
let filtroAtual = null;

const lista = document.getElementById("listaFuncionarios");

async function carregarFuncionarios() {
  const snapshot = await getDocs(collection(db, "funcionarios"));

  funcionarios = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    let hist = {};

    if (Array.isArray(data.historico) && data.historico.length > 0) {
      hist = data.historico[0];
    } else if (typeof data.historico === "object" && data.historico !== null) {
      const valores = Object.values(data.historico);
      hist = valores[0] || {};
    }

    funcionarios.push({
      id: docSnap.id,
      ...data,
      nome: data.nome || hist.nome || "Sem nome",
      cargo: hist.cargo || data.setor || "Sem cargo",
      empresa: data.empresa || "Sem empresa",
      treinamentos: data.treinamentos || [],
    });
  });

  preencherFiltros();
  renderizar();
}
// 📊 STATUS
function verificarStatus(data) {
  const hoje = new Date();

  const diff = (venc - hoje) / (1000 * 60 * 60 * 24);

  if (diff < 0) return "vencido";
  if (diff <= 30) return "a-vencer";
  return "em-dia";
}

// 📈 INDICADORES
function atualizarIndicadores() {
  let emDia = 0,
    aVencer = 0,
    vencido = 0;

  funcionarios.forEach((f) => {
    [...f.treinamentos]
      .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))
      .forEach((t) => {
        const status = verificarStatus(t.vencimento);
        if (status === "em-dia") emDia++;
        if (status === "a-vencer") aVencer++;
        if (status === "vencido") vencido++;
      });
  });

  totalFunc.innerText = funcionarios.length;
  totalEmDia.innerText = emDia;
  totalAVencer.innerText = aVencer;
  totalVencido.innerText = vencido;
}

// 🎯 RENDER
function renderizar() {
  lista.innerHTML = "";

  const busca = buscaInput.value.toLowerCase();
  const funcaoFiltro = filtroFuncao.value;
  const empresaFiltro = filtroEmpresa.value;

  funcionarios
    .filter((f) => {
      const matchBusca = (f.nome || "").toLowerCase().includes(busca);
      const matchFuncao = !funcaoFiltro || f.cargo === funcaoFiltro;
      const matchEmpresa = !empresaFiltro || f.empresa === empresaFiltro;

      if (!filtroAtual) return matchBusca && matchFuncao && matchEmpresa;

      const temStatus = f.treinamentos.some(
        (t) => verificarStatus(t.vencimento) === filtroAtual,
      );

      return matchBusca && matchFuncao && matchEmpresa && temStatus;
    })

    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .forEach((f) => {
      const div = document.createElement("div");
      div.classList.add("funcionario");

      const header = document.createElement("div");
      header.classList.add("funcionario-header");

      header.innerHTML = `
        <span>${f.nome}</span>
        <small>${f.cargo} - ${f.empresa}</small>
      `;

      const treinos = document.createElement("div");
      treinos.classList.add("treinamentos");

      [...f.treinamentos]
        .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))
        .forEach((t) => {
          const status = verificarStatus(t.vencimento);

          const el = document.createElement("div");
          el.classList.add("treinamento", status);

          if (!data) return "em-dia";
          const venc = new Date(data + "T00:00:00");

          el.innerHTML = `
          <div class="treino-topo">
            <strong>${t.nome}</strong>
            <button class="btn-delete">🗑️</button>
          </div>

          Realizado: ${new Date(t.realizacao).toLocaleDateString("pt-BR")} <br>
          Vence: ${venc.toLocaleDateString("pt-BR")}
        `;

          // Excluir
          const btnDelete = el.querySelector(".btn-delete");

          btnDelete.onclick = async () => {
            const confirmar = confirm("Deseja excluir este treinamento?");
            if (!confirmar) return;

            // remove do array
            f.treinamentos = f.treinamentos.filter(
              (x) => !(x.nome === t.nome && x.vencimento === t.vencimento),
            );

            // atualiza no firebase
            await updateDoc(doc(db, "funcionarios", f.id), {
              treinamentos: f.treinamentos,
            });

            carregarFuncionarios();
          };

          treinos.appendChild(el);
        });

      const btn = document.createElement("button");
      btn.classList.add("btn-add");
      btn.innerText = "+ Adicionar Treinamento";

      btn.onclick = () => {
        funcionarioSelecionado = f;
        modalTreino.classList.add("show");
      };

      treinos.appendChild(btn);

      header.onclick = () => div.classList.toggle("open");

      div.appendChild(header);
      div.appendChild(treinos);
      lista.appendChild(div);
    });

  atualizarIndicadores();
}

// 🔽 FILTROS
function preencherFiltros() {
  filtroFuncao.innerHTML = `<option value="">Todas Funções</option>`;
  filtroEmpresa.innerHTML = `<option value="">Todas Empresas</option>`;

  [...new Set(funcionarios.map((f) => f.cargo))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach((f) => {
      filtroFuncao.innerHTML += `<option value="${f}">${f}</option>`;
    });

  [...new Set(funcionarios.map((f) => f.empresa))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach((e) => {
      filtroEmpresa.innerHTML += `<option value="${e}">${e}</option>`;
    });
}

const modalCadastroTreino = document.getElementById("modalCadastroTreino");
const btnNovoTreinamento = document.getElementById("btnNovoTreinamento");

const nomeNovoTreino = document.getElementById("nomeNovoTreino");
const validadeNovoTreino = document.getElementById("validadeNovoTreino");

const salvarCadastroTreino = document.getElementById("salvarCadastroTreino");
const cancelarCadastroTreino = document.getElementById(
  "cancelarCadastroTreino",
);

// abrir modal
btnNovoTreinamento.onclick = () => {
  modalCadastroTreino.classList.add("show");
};

// fechar
cancelarCadastroTreino.onclick = () => {
  modalCadastroTreino.classList.remove("show");
};
// TREINAMENTOS
let listaTreinamentos = [];

async function carregarTreinamentos() {
  const snapshot = await getDocs(collection(db, "treinamentos"));

  listaTreinamentos = [];

  const select = document.getElementById("selectTreinamento");
  select.innerHTML = `<option value="">Selecione um treinamento</option>`;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    listaTreinamentos.push({
      id: docSnap.id,
      ...data,
    });

    select.innerHTML += `
      <option value="${docSnap.id}">
        ${data.nome} (${data.validade} meses)
      </option>
    `;
  });
}

// 💾 SALVAR TREINAMENTO
salvarTreino.onclick = async () => {
  const treinoId = document.getElementById("selectTreinamento").value;
  const realizacao = dataRealizacao.value;

  if (!treinoId || !realizacao) {
    return alert("Preencha tudo!");
  }

  const treino = listaTreinamentos.find((t) => t.id === treinoId);

  // 🧠 calcular vencimento automático
  const dataReal = new Date(realizacao);
  const vencimento = new Date(dataReal);
  vencimento.setMonth(vencimento.getMonth() + treino.validade);

  const novoTreino = {
    nome: treino.nome,
    realizacao,
    vencimento: vencimento.toISOString().split("T")[0],
  };

  funcionarioSelecionado.treinamentos.push(novoTreino);

  await updateDoc(doc(db, "funcionarios", funcionarioSelecionado.id), {
    treinamentos: funcionarioSelecionado.treinamentos,
  });

  modalTreino.classList.remove("show");
  carregarFuncionarios();
};

window.addDoc = addDoc;

salvarCadastroTreino.onclick = async () => {
  const nome = nomeNovoTreino.value;
  const validade = Number(validadeNovoTreino.value);

  if (!nome || !validade) {
    return alert("Preencha tudo!");
  }

  await addDoc(collection(db, "treinamentos"), {
    nome,
    validade,
  });

  modalCadastroTreino.classList.remove("show");

  // limpa campos
  nomeNovoTreino.value = "";
  validadeNovoTreino.value = "";

  // atualiza lista
  carregarTreinamentos();
};

// ❌ CANCELAR
cancelarTreino.onclick = () => modalTreino.classList.remove("show");

// EVENTOS
buscaInput.addEventListener("input", renderizar);
filtroFuncao.addEventListener("change", renderizar);
filtroEmpresa.addEventListener("change", renderizar);

// INIT
carregarFuncionarios();
carregarTreinamentos();
