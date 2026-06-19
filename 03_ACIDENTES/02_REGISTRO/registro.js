import { db } from "../../../01_HOME/js/firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.criarAcidentesTeste = async function () {
  const registrosTeste = [
    // ================= 2024 =================

    {
  nome: "Lucas Ferreira",
  data: "2024-01-16",
  tipo: "Sem Afastamento",
  local: "Linha de produção",
  area: "Produção",
  turno: "1º Turno",
  corpo: "Mãos",
  agente: "Ferramenta manual",
  diasPerdidos: 0,
  descricao: "Pequeno corte na mão durante ajuste de peça.",
  prevencao: "Reforçar uso de luvas anticorte e procedimento de ajuste.",
  fatalidade: false,
  criadoEm: new Date().toISOString()
},
    {
  nome: "Mateus Silva",
  data: "2024-03-08",
  tipo: "Com Afastamento",
  local: "Oficina de manutenção",
  area: "Manutenção",
  turno: "2º Turno",
  corpo: "Coluna",
  agente: "Esforço excessivo",
  diasPerdidos: 5,
  descricao: "Dor lombar após movimentação manual de carga.",
  prevencao: "Treinamento de ergonomia e uso de carrinho para transporte.",
  fatalidade: false,
  criadoEm: new Date().toISOString()
},
    {
      nome: "Anderson Costa",
      data: "2024-05-21",
      tipo: "Dano Material",
      local: "Pátio operacional",
      area: "Operação",
      turno: "3º Turno",
      corpo: "Não se aplica",
      agente: "Veículo",
      diasPerdidos: 0,
      descricao: "Colisão leve entre equipamento móvel e estrutura metálica.",
      prevencao: "Reforçar limite de velocidade e sinalização no pátio.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Roberto Almeida",
      data: "2024-07-12",
      tipo: "Sem Afastamento",
      local: "Almoxarifado",
      area: "Logística",
      turno: "1º Turno",
      corpo: "Pés",
      agente: "Queda de objeto",
      diasPerdidos: 0,
      descricao: "Objeto caiu próximo ao pé do colaborador.",
      prevencao: "Reorganizar armazenamento e reforçar inspeção de prateleiras.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Felipe Martins",
      data: "2024-09-18",
      tipo: "Com Afastamento",
      local: "Área externa",
      area: "Obras",
      turno: "2º Turno",
      corpo: "Pernas",
      agente: "Queda de mesmo nível",
      diasPerdidos: 4,
      descricao: "Escorregão em piso irregular durante deslocamento.",
      prevencao: "Corrigir irregularidades do piso e melhorar sinalização.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    // ================= 2025 =================

    {
      nome: "Thiago Ribeiro",
      data: "2025-01-14",
      tipo: "Sem Afastamento",
      local: "Área de produção",
      area: "Produção",
      corpo: "Olhos",
      agente: "Produto químico",
      diasPerdidos: 0,
      descricao: "Respingo leve durante manipulação de produto.",
      prevencao: "Reforçar uso de óculos ampla visão e revisão da FISPQ.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Bruno Souza",
      data: "2025-02-20",
      tipo: "Com Afastamento",
      local: "Oficina",
      area: "Manutenção",
      turno: "1º Turno",
      corpo: "Coluna",
      agente: "Esforço excessivo",
      diasPerdidos: 8,
      descricao: "Movimentação inadequada de componente pesado.",
      prevencao: "Implantar orientação de levantamento seguro e apoio mecânico.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Rafael Costa",
      data: "2025-04-09",
      tipo: "Sem Afastamento",
      local: "Expedição",
      area: "Expedição",
      turno: "3º Turno",
      corpo: "Mãos",
      agente: "Impacto contra objeto",
      diasPerdidos: 0,
      descricao: "Batida da mão contra pallet durante separação de carga.",
      prevencao: "Melhorar organização de pallets e rotas de circulação.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Carlos Lima",
      data: "2025-05-27",
      tipo: "Dano Material",
      local: "Pátio de manobras",
      area: "Operação",
      turno: "1º Turno",
      corpo: "Não se aplica",
      agente: "Veículo",
      diasPerdidos: 0,
      descricao: "Empilhadeira encostou em proteção metálica.",
      prevencao: "Reforçar treinamento de direção defensiva e demarcação.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "João Silva",
      data: "2025-07-03",
      tipo: "Sem Afastamento",
      local: "Linha de produção",
      area: "Produção",
      turno: "2º Turno",
      corpo: "Braços",
      agente: "Máquina / Equipamento",
      diasPerdidos: 0,
      descricao: "Contato leve com proteção lateral do equipamento.",
      prevencao: "Revisar proteção física e orientar operação segura.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Marcos Oliveira",
      data: "2025-08-22",
      tipo: "Com Afastamento",
      local: "Área de manutenção",
      area: "Manutenção",
      turno: "3º Turno",
      corpo: "Pernas",
      agente: "Queda de mesmo nível",
      diasPerdidos: 6,
      descricao: "Torção no joelho durante deslocamento em área molhada.",
      prevencao: "Melhorar drenagem, limpeza e sinalização temporária.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "André Rocha",
      data: "2025-10-15",
      tipo: "Sem Afastamento",
      local: "Armazém",
      area: "Logística",
      turno: "Administrativo",
      corpo: "Mãos",
      agente: "Ferramenta manual",
      diasPerdidos: 0,
      descricao: "Arranhão durante abertura de embalagem.",
      prevencao: "Padronizar ferramenta de corte e reforçar uso de luvas.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    // ================= 2026 =================
    // Ano demonstrativo com queda gradual para ficar bonito no gráfico.

    {
      nome: "Pedro Santos",
      data: "2026-01-06",
      tipo: "Sem Afastamento",
      local: "Produção",
      area: "Produção",
      turno: "1º Turno",
      corpo: "Mãos",
      agente: "Ferramenta manual",
      diasPerdidos: 0,
      descricao: "Pequeno corte durante ajuste manual.",
      prevencao: "DDS sobre ferramentas e luvas adequadas.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Gustavo Pereira",
      data: "2026-01-24",
      tipo: "Com Afastamento",
      local: "Oficina",
      area: "Manutenção",
      turno: "2º Turno",
      corpo: "Coluna",
      agente: "Esforço excessivo",
      diasPerdidos: 5,
      descricao: "Dor lombar após movimentação de peça.",
      prevencao: "Uso de apoio mecânico e treinamento ergonômico.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Eduardo Nunes",
      data: "2026-02-03",
      tipo: "Sem Afastamento",
      local: "Expedição",
      area: "Expedição",
      turno: "3º Turno",
      corpo: "Pés",
      agente: "Queda de objeto",
      diasPerdidos: 0,
      descricao: "Material caiu próximo ao pé durante separação.",
      prevencao: "Revisar empilhamento e organização da carga.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },
    {
      nome: "Vinícius Ramos",
      data: "2026-02-19",
      tipo: "Dano Material",
      local: "Pátio",
      area: "Operação",
      turno: "2º Turno",
      corpo: "Não se aplica",
      agente: "Veículo",
      diasPerdidos: 0,
      descricao: "Equipamento móvel atingiu barreira de proteção.",
      prevencao: "Demarcar rota de circulação e reforçar limite de velocidade.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Diego Moreira",
      data: "2026-03-11",
      tipo: "Sem Afastamento",
      local: "Área química",
      area: "Produção",
      turno: "2º Turno",
      corpo: "Olhos",
      agente: "Produto químico",
      diasPerdidos: 0,
      descricao: "Irritação ocular leve após respingo.",
      prevencao: "Reforçar uso de óculos e treinamento sobre FISPQ.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Henrique Torres",
      data: "2026-04-08",
      tipo: "Sem Afastamento",
      local: "Almoxarifado",
      area: "Logística",
      corpo: "Mãos",
      agente: "Impacto contra objeto",
      diasPerdidos: 0,
      descricao: "Batida da mão contra estrutura de armazenamento.",
      prevencao: "Melhorar organização de materiais e corredores.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Leonardo Castro",
      data: "2026-05-17",
      tipo: "Com Afastamento",
      local: "Área externa",
      turno: "Administrativo",
      area: "Obras",
      corpo: "Pernas",
      agente: "Queda de mesmo nível",
      diasPerdidos: 3,
      descricao: "Escorregão em piso úmido durante atividade externa.",
      prevencao: "Sinalizar área e melhorar rota de passagem.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Caio Fernandes",
      data: "2026-06-04",
      tipo: "Sem Afastamento",
      local: "Linha de produção",
      area: "Produção",
      turno: "2º Turno",
      corpo: "Braços",
      agente: "Máquina / Equipamento",
      diasPerdidos: 0,
      descricao: "Contato leve com lateral de equipamento parado.",
      prevencao: "Revisar procedimento de bloqueio e orientação operacional.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Samuel Gomes",
      data: "2026-07-22",
      tipo: "Sem Afastamento",
      local: "Pátio operacional",
      area: "Operação",
      turno: "3º Turno",
      corpo: "Pés",
      agente: "Impacto contra objeto",
      diasPerdidos: 0,
      descricao: "Colaborador tropeçou em peça fora do local adequado.",
      prevencao: "Aplicar 5S e padronizar armazenamento de peças.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    },

    {
      nome: "Daniel Alves",
      data: "2026-09-09",
      tipo: "Sem Afastamento",
      local: "Expedição",
      area: "Expedição",
      turno: "1º Turno",
      corpo: "Mãos",
      agente: "Ferramenta manual",
      diasPerdidos: 0,
      descricao: "Pequeno arranhão durante abertura de embalagem.",
      prevencao: "Substituir ferramenta improvisada por modelo seguro.",
      fatalidade: false,
      criadoEm: new Date().toISOString()
    }
  ];

  for (const registro of registrosTeste) {
    await addDoc(collection(db, "acidentes"), registro);
  }

  alert("Registros demonstrativos criados com sucesso!");
};

const formRegistro = document.getElementById("formRegistro");
const mensagemStatus = document.getElementById("mensagemStatus");

formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const data = document.getElementById("data").value;
  const tipo = document.getElementById("tipo").value;
  const local = document.getElementById("local").value.trim();

  const area = document.getElementById("area").value.trim();
  const turno = document.getElementById("turno").value;
  const corpo = document.getElementById("corpo").value;
  const agente = document.getElementById("agente").value;
  const diasPerdidos = Number(document.getElementById("diasPerdidos").value) || 0;

  const descricao = document.getElementById("descricao").value.trim();
  const prevencao = document.getElementById("prevencao").value.trim();

  if (!nome || !data || !tipo || !local || !descricao) {
    mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
    return;
  }

  try {
    mostrarMensagem("Salvando registro...", "carregando");

    await addDoc(collection(db, "acidentes"), {
      nome,
      data,
      tipo,
      local,
      area: area || "Não informado",
      turno: turno || "Não informado",
      corpo: corpo || "Não informado",
      agente: agente || "Não informado",
      diasPerdidos,
      descricao,
      prevencao: prevencao || "Não informado",
      fatalidade: tipo === "Fatalidade",
      criadoEm: new Date().toISOString()
    });

    formRegistro.reset();

    document.getElementById("diasPerdidos").value = 0;

    mostrarMensagem("Registro salvo com sucesso ✅", "sucesso");

    setTimeout(() => {
      window.location.href = "../01_HISTORICO/historico.html";
    }, 1200);

  } catch (erro) {
    console.error("Erro ao salvar acidente:", erro);
    mostrarMensagem("Erro ao salvar registro. Tente novamente.", "erro");
  }
});

function mostrarMensagem(texto, tipo) {
  mensagemStatus.innerText = texto;

  if (tipo === "erro") {
    mensagemStatus.style.color = "#ff5c5c";
  } else if (tipo === "carregando") {
    mensagemStatus.style.color = "#7ea4ff";
  } else {
    mensagemStatus.style.color = "#1cc88a";
  }
}