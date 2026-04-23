// ======== Escolha atual do curso ========
const CURSO_KEY = (typeof localStorage !== 'undefined' && localStorage.getItem('cursoKey')) || 'prod-novo';

// ======== Repositório de datasets por curso ========
const DATASETS = {
  "prod-novo": [
    // 1º Semestre
    {nome:"Introdução a Administração", preReq:[], T:2, P:0, sem:1, cr:2,
      horarios:[{dia:"Ter", inicio:13, dur:2}]
    },
    {nome:"Introdução a Engenharia", preReq:[], T:2, P:0, sem:1, cr:2,
      horarios:[{dia:"Seg", inicio:11, dur:2}]
    },
    {nome:"Cálculo a uma Variável", preReq:[], T:6, P:0, sem:1, cr:6,
      horarios:[
        {dia:"Seg", inicio:7, dur:2},
        {dia:"Ter", inicio:7, dur:2},
        {dia:"Qui", inicio:7, dur:2}
      ]
    },
    {nome:"Álgebra Linear I", preReq:[], T:2, P:0, sem:1, cr:2,
      horarios:[{dia:"Qui", inicio:11, dur:2}]
    },
    {nome:"Química Geral", preReq:[], T:2, P:0, sem:1, cr:2,
      horarios:[{dia:"Qua", inicio:9, dur:2}]
    },
    {nome:"Desenho", preReq:[], T:4, P:0, sem:1, cr:4,
      horarios:[
        {dia:"Seg", inicio:9, dur:2},
        {dia:"Ter", inicio:9, dur:2}
      ]
    },

    // 2º Semestre
    {nome:"Álgebra Linear II", preReq:["Álgebra Linear I"], T:3, P:0, sem:2, cr:3,
      horarios:[{dia:"Qua", inicio:7, dur:3}]
    },
    {nome:"Cálculo a Várias Variáveis", preReq:["Cálculo a uma Variável"], T:4, P:0, sem:2, cr:4,
      horarios:[
        {dia:"Ter", inicio:11, dur:2},
        {dia:"Qua", inicio:10, dur:2}
      ]
    },
    {nome:"Física I", preReq:["Álgebra Linear I", "Cálculo a uma Variável"], T:4, P:2, sem:2, cr:5,
      horarios:[
        {dia:"Seg", inicio:11, dur:2},
        {dia:"Sex", inicio:8, dur:4}
      ]
    },
    {nome:"Introdução a Economia", preReq:[], T:2, P:0, sem:2, cr:2,
      horarios:[{dia:"Qui", inicio:10, dur:2}]
    },
    {nome:"Química Experimental", preReq:[], T:1, P:2, sem:2, cr:2,
      horarios:[{dia:"Ter", inicio:8, dur:3}]
    },
    {nome:"Programação", preReq:[], T:2, P:2, sem:2, cr:3,
      horarios:[{dia:"Seg", inicio:7, dur:4}]
    },
    {nome:"Humanidades e Ciências Sociais", preReq:[], T:2, P:0, sem:2, cr:2,
      horarios:[{dia:"Qui", inicio:8, dur:2}]
    },

    // 3º Semestre
    {nome:"Física II", preReq:["Física I"], T:4, P:2, sem:3, cr:5,
      horarios:[
        {dia:"Seg", inicio:7, dur:4},
        {dia:"Qua", inicio:13, dur:2}
      ]
    },
    {nome:"EDO", preReq:["Álgebra Linear II", "Cálculo a uma Variável"], T:4, P:0, sem:3, cr:4,
      horarios:[
        {dia:"Ter", inicio:9, dur:2},
        {dia:"Qui", inicio:9, dur:2}
      ]
    },
    {nome:"Cálculo Vetorial", preReq:["Cálculo a Várias Variáveis"], T:2, P:0, sem:3, cr:2,
      horarios:[{dia:"Ter", inicio:13, dur:2}]
    },
    {nome:"Engenharia de Métodos", preReq:["Introdução a Administração"], T:3, P:0, sem:3, cr:3,
      horarios:[{dia:"Qua", inicio:7, dur:3}]
    },
    {nome:"Cálculo Numérico", preReq:["Álgebra Linear I", "Cálculo a uma Variável", "Programação"], T:2, P:2, sem:3, cr:3,
      horarios:[
        {dia:"Seg", inicio:11, dur:2},
        {dia:"Sex", inicio:8, dur:2}
      ]
    },
    {nome:"Mecânica Geral", preReq:["Física I", "Álgebra Linear II"], T:4, P:0, sem:3, cr:4,
      horarios:[
        {dia:"Ter", inicio:11, dur:2},
        {dia:"Qui", inicio:11, dur:2}
      ]
    },
    {nome:"Economia da Produção", preReq:["Introdução a Economia"], T:3, P:0, sem:3, cr:3,
      horarios:[{dia:"Qua", inicio:10, dur:3}]
    },

    // 4º Semestre
    {nome:"EDPS", preReq:["EDO"], T:3, P:0, sem:4, cr:3,
      horarios:[{dia:"Qua", inicio:7, dur:3}]
    },
    {nome:"Estatística", preReq:["Cálculo a Várias Variáveis"], T:3, P:0, sem:4, cr:3,
      horarios:[{dia:"Ter", inicio:8, dur:3}]
    },
    {nome:"Física III", preReq:["Física II"], T:4, P:2, sem:4, cr:5,
      horarios:[
        {dia:"Seg", inicio:11, dur:2},
        {dia:"Seg", inicio:15, dur:2},
        {dia:"Ter", inicio:11, dur:2}
      ]
    },
    {nome:"Psicologia e Sociologia do Trabalho", preReq:["Introdução a Economia"], T:3, P:0, sem:4, cr:3,
      horarios:[{dia:"Qua", inicio:14, dur:3}]
    },
    {nome:"Resistência de Materiais III", preReq:["Mecânica Geral"], T:3, P:0, sem:4, cr:3,
      horarios:[{dia:"Qua", inicio:11, dur:3}]
    },
    {nome:"Desenho Técnico", preReq:["Desenho"], T:3, P:0, sem:4, cr:3,
      horarios:[{dia:"Qui", inicio:8, dur:3}]
    },
    {nome:"Metodologia Cientifica", preReq:["Introdução a Engenharia"], T:2, P:0, sem:4, cr:2,
      horarios:[{dia:"Sex", inicio:7, dur:2}]
    },

    // 5º Semestre
    {nome:"Eletricidade Aplicada", preReq:["Física II"], T:4, P:0, sem:5, cr:4,
      horarios:[
        {dia:"Seg", inicio:13, dur:2},
        {dia:"Ter", inicio:13, dur:2}
      ]
    },
    {nome:"Métodos Estatísticos", preReq:["EDPS", "Estatística"], T:3, P:0, sem:5, cr:3,
      horarios:[{dia:"Sex", inicio:15, dur:3}]
    },
    {nome:"Gestão da Informação I", preReq:["Engenharia de Métodos"], T:3, P:0, sem:5, cr:3,
      horarios:[{dia:"Qua", inicio:10, dur:3}]
    },
    {nome:"Ciência do Ambiente", preReq:[], T:2, P:0, sem:5, cr:2,
      horarios:[{dia:"Qua", inicio:11, dur:2}]
    },
    {nome:"Fenômenos de Transorte", preReq:["Física III"], T:3, P:0, sem:5, cr:3,
      horarios:[{dia:"Qui", inicio:8, dur:3}]
    },
    {nome:"Ciência dos Materiais", preReq:[], T:3, P:0, sem:5, cr:3,
      horarios:[{dia:"Ter", inicio:10, dur:3}]
    },

    // 6º Semestre
    {nome:"Ergonomia", preReq:["Psicologia e Sociologia do Trabalho"], T:2, P:0, sem:6, cr:2,
      horarios:[{dia:"Qua", inicio:12, dur:3}]
    },
    {nome:"Pesquisa Operacional I", preReq:["Cálculo Vetorial", "Gestão da Informação I"], T:3, P:0, sem:6, cr:3,
      horarios:[{dia:"Qui", inicio:8, dur:3}]
    },
    {nome:"Fundamentos da Engenharia de Segurança", preReq:["Psicologia e Sociologia do Trabalho"], T:2, P:0, sem:6, cr:2,
      horarios:[{dia:"Ter", inicio:10, dur:3}]
    },
    {nome:"Processo de Fabricação", preReq:["Ciência dos Materiais"], T:4, P:0, sem:6, cr:4,
      horarios:[
        {dia:"Seg", inicio:13, dur:3},
        {dia:"Qui", inicio:15, dur:2}
      ]
    },
    {nome:"Contabilidade Gerencial", preReq:["Introdução a Economia"], T:3, P:0, sem:6, cr:3,
      horarios:[{dia:"Sex", inicio:11, dur:3}]
    },
    {nome:"Estatística da Qualidade e Confiabilidade", preReq:["Métodos Estatísticos"], T:3, P:0, sem:6, cr:3,
      horarios:[{dia:"Sáb", inicio:3, dur:3}]
    },

    // 7º Semestre
    {nome:"Gestão Ambiental", preReq:["Ciência do Ambiente"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Qui", inicio:9, dur:3}]
    },
    {nome:"Pesquisa Operacional II", preReq:["Pesquisa Operacional I"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Sex", inicio:14, dur:3}]
    },
    {nome:"Gestão Emprendedora", preReq:["Gestão da Informação I"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Qui", inicio:11, dur:3}]
    },
    {nome:"Engenharia Econômica", preReq:["Contabilidade Gerencial"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Qua", inicio:14, dur:3}]
    },
    {nome:"Gestão da Qualidade", preReq:["Estatística da Qualidade e Confiabilidade"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Qui", inicio:11, dur:3}]
    },
    {nome:"Custos Industriais", preReq:["Contabilidade Gerencial"], T:3, P:0, sem:7, cr:3,
      horarios:[{dia:"Seg", inicio:11, dur:3}]
    },

    // 8º Semestre
    {nome:"Projeto do Produto", preReq:["Ergonomia", "Gestão da Qualidade"], T:3, P:0, sem:8, cr:3,
      horarios:[{dia:"Qui", inicio:15, dur:3}]
    },
    {nome:"Simulação", preReq:["Métodos Estatísticos", "Pesquisa Operacional II"], T:2, P:2, sem:8, cr:3,
      horarios:[
        {dia:"Seg", inicio:13, dur:2},
        {dia:"Qua", inicio:13, dur:2}
      ]
    },
    {nome:"Logística I", preReq:["Pesquisa Operacional I"], T:3, P:0, sem:8, cr:3,
      horarios:[{dia:"Qua", inicio:10, dur:3}]
    },
    {nome:"P.C.P I", preReq:["Engenharia Econômica"], T:3, P:0, sem:8, cr:3,
      horarios:[
        {dia:"Ter", inicio:15, dur:2},
        {dia:"Qua", inicio:15, dur:2}
      ]
    },
    {nome:"Gestão de Projeto", preReq:["Engenharia Econômica"], T:3, P:0, sem:8, cr:3,
      horarios:[{dia:"Ter", inicio:10, dur:3}]
    },
    {nome:"Gestão da Manutenção", preReq:["Gestão da Qualidade"], T:3, P:0, sem:8, cr:3,
      horarios:[{dia:"Qua", inicio:11, dur:3}]
    },

    // 9º Semestre
    {nome:"Projeto Final I", preReq:["140 Créditos"], T:0, P:2, sem:9, cr:1,
      horarios:[{dia:"Ter", inicio:9, dur:4}]
    },
    {nome:"Gestão Estratégica", preReq:["Gestão Emprendedora"], T:3, P:0, sem:9, cr:3,
      horarios:[{dia:"Qui", inicio:14, dur:3}]
    },
    {nome:"Gestão da Inovação", preReq:["Gestão Emprendedora"], T:3, P:0, sem:9, cr:3,
      horarios:[{dia:"Qua", inicio:10, dur:3}]
    },
    {nome:"Logística II", preReq:["Logística I"], T:3, P:0, sem:9, cr:3,
      horarios:[
        {dia:"Seg", inicio:13, dur:2},
        {dia:"Qua", inicio:13, dur:2}
      ]
    },
    {nome:"P.C.P II", preReq:["P.C.P I"], T:3, P:0, sem:9, cr:3,
      horarios:[{dia:"Qua", inicio:15, dur:2}]
    },
    {nome:"Planejamento das Instalações", preReq:["Simulação"], T:1, P:2, sem:9, cr:2,
      horarios:[{dia:"Ter", inicio:13, dur:3}]
    },

    // 10º Semestre
    {nome:"Projeto Final II", preReq:["Projeto Final I"], T:0, P:2, sem:10, cr:1,
      horarios:[{dia:"Qua", inicio:11, dur:3}]
    },
    {nome:"Análise Organizacional", preReq:["Gestão Emprendedora"], T:2, P:0, sem:10, cr:2,
      horarios:[{dia:"Seg", inicio:10, dur:3}]
    },
    {nome:"Estágio Supervisionado", preReq:["120 Créditos"], T:7, P:0, sem:10, cr:7,
      horarios:[{dia:"Qua", inicio:8, dur:2}]
    },
    {nome:"Ciência de Dados", preReq:["Pesquisa Operacional I"], T:2, P:2, sem:10, cr:3,
      horarios:[{dia:"Ter", inicio:11, dur:4}]
    },

    // Optativas
    {nome:"Excel Aplicado a Negócios", preReq:["Programação"], T:2, P:2, sem:0, cr:3,
    horarios:[{dia:"Seg", inicio:13, dur:4}]
    },
    {nome:"Int. Comércio Exterior", preReq:[], T:3, P:0, sem:0, cr:3,
      horarios:[{dia:"Qua", inicio:10, dur:3}]
    },
    {nome:"Estatística Multivariada", preReq:["Cálculo a Várias Variáveis","Pesquisa Operacional I"], T:3, P:0, sem:0, cr:3,
      horarios:[{dia:"Sex", inicio:12, dur:3}]
    },
    {nome:"Banco de Dados", preReq:["Programação"], T:2, P:2, sem:0, cr:3,
      horarios:[{dia:"Ter", inicio:7, dur:4}]
    },
    {nome:"Metrologia", preReq:["Estatística da Qualidade e Confiabilidade"], T:2, P:2, sem:0, cr:3,
      horarios:[
        {dia:"Qui", inicio:15, dur:2},
        {dia:"Sex", inicio:13, dur:2}
      ]
    },

    // Turmas Extras
    {nome:"Cálculo a uma Variável (Ext)", preReq:[], T:6, P:0, sem:11, cr:6,
      horarios:[
        {dia:"Seg", inicio:13, dur:2},
        {dia:"Ter", inicio:13, dur:2},
        {dia:"Qui", inicio:13, dur:2}
      ]
    },
    {nome:"Álgebra Linear I (Ext)", preReq:[], T:2, P:0, sem:11, cr:2,
      horarios:[
        {dia:"Sex", inicio:15, dur:2}
      ]
    },
    {nome:"Química Geral (Ext)", preReq:[], T:2, P:0, sem:11, cr:2,
      horarios:[
        {dia:"Seg", inicio:13, dur:4}
      ]
    },
    {nome:"Desenho (Ext)", preReq:[], T:4, P:0, sem:11, cr:4,
      horarios:[
        {dia:"Sáb", inicio:2, dur:4}
      ]
    }
  ],
  "prod-antigo": [

  ],
  "mec-novo":   [

  ],
  "mec-antigo": [

  ]
};

// ======== D “constante” baseado no curso escolhido ========
const D = JSON.parse(JSON.stringify(DATASETS[CURSO_KEY]));

// ---------- Mapas de equivalência entre disciplinas ----------
// Chave: disciplina normal, Valor: disciplina extra
const extraMap = new Map([
  ["Cálculo a uma Variável", "Cálculo a uma Variável (Ext)"],
  ["Álgebra Linear I", "Álgebra Linear I (Ext)"],
  ["Química Geral", "Química Geral (Ext)"],
  ["Desenho", "Desenho (Ext)"]
]);

// ---------- Horários dos blocos ----------
// Blocos da semana
const blocosSemana = [
  "07:00-07:50", "07:50-08:40", "08:40-09:30", "09:30-10:20",
  "10:40-11:30", "11:30-12:20", "12:20-13:10", "13:10-14:00",
  "14:00-14:50", "14:50-15:40", "15:40-16:30", "16:40-17:30",
  "17:30-18:20", "18:20-19:10", "19:10-20:00", "20:10-21:00",
  "21:00-21:50", "21:50-22:40"
];

// Blocos do sábado
const blocosSabado = [
  "07:00-07:50", "07:50-08:40", "08:40-09:30", "09:30-10:20",
  "10:40-11:30", "11:30-12:20", "12:20-13:10"
];

// Dias da semana
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ---------- Funções utilitárias ----------
// Calcula o tempo total de uma disciplina (T + P), exceção para estágio
const temposDisc = d => (d.nome === "Estágio Supervisionado") ? 2 : (d.T + d.P || 0);

// Agrupa array por chave definida por função
const groupBy = (arr, fn) => arr.reduce((map, item) => {
  const key = fn(item);
  if (!map[key]) map[key] = [];
  map[key].push(item);
  return map;
}, {});

// Agrupamento de disciplinas por semestre
const bySem = groupBy(D, d => d.sem);

// ---------- Paleta de cores para disciplinas ----------
const palette = [
  "#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#f43f5e",
  "#22c55e", "#38bdf8", "#e879f9", "#fb7185", "#f97316", "#10b981",
  "#93c5fd", "#fca5a5", "#bef264", "#5eead4", "#fde047", "#7dd3fc",
  "#d8b4fe", "#fecaca", "#ff7eb9", "#ff9671", "#ffc75f", "#008f7a",
  "#c34a36", "#2c73d2", "#0081a7", "#00afb9", "#f0c987", "#b7a57a",
  "#ff9f1c", "#2ec4b6", "#e71d36", "#ff1654", "#007f5f"
];

const colorMap = new Map();
let colorIdx = 0;

// ---------- Mapa MASTER: horários de cada disciplina ----------
const MASTER = new Map();

D.forEach(d => {
  const slots = d.horarios.map(h => ({ dia: h.dia, inicio: h.inicio, dur: h.dur }));
  MASTER.set(d.nome, slots);
});



// ---------- Funções de controle de disciplinas feitas ----------

// Retorna todas as disciplinas marcadas como feitas, considerando equivalentes
function getFeitas() {
  const feitas = Array.from(document.querySelectorAll('.chk.checked'))
                      .map(x => x.dataset.nome);

  const todasFeitas = new Set(feitas);

  feitas.forEach(nome => {
    // Se marcou a normal, também considera a extra como feita
    if (extraMap.has(nome)) todasFeitas.add(extraMap.get(nome));

    // Se marcou a extra, também considera a normal como feita
    for (const [normal, extra] of extraMap.entries()) {
      if (extra === nome) todasFeitas.add(normal);
    }
  });

  return Array.from(todasFeitas);
}

// ========================= Utils de CR / Estado =========================

function calcCRFeitas(lista) {
  const mapCreditos = new Map(D.map(d => [d.nome, d.cr || 0]));
  const contados = new Set();
  let total = 0;

  for (const nome of lista) {
    let normal = nome;
    let extra = extraMap.get(nome);

    if (!extra) {
      const par = [...extraMap.entries()].find(([n, e]) => e === nome);
      if (par) [normal, extra] = par;
    }

    if (!contados.has(normal) && !contados.has(extra)) {
      total += mapCreditos.get(normal) || 0;
      if (normal) contados.add(normal);
      if (extra) contados.add(extra);
    }
  }
  return total;
}

function refreshConcluidos() {
  const feitas = getFeitas();
  document.getElementById('crConcl').textContent = calcCRFeitas(feitas);
}

function prereqOK(disc, feitas, crFeitas) {
  if (!disc.preReq) return true;
  for (const p of disc.preReq) {
    if (p.endsWith("Créditos")) {
      if (crFeitas < parseInt(p)) return false;
    } else if (!feitas.includes(p)) {
      return false;
    }
  }
  return true;
}

// =============== Tooltip de pré-requisitos (explicação) ===============
function getPrereqExplanation(disc, feitas, crFeitas) {
  if (!disc.preReq || disc.preReq.length === 0) {
    return { ok: true, msg: "Sem pré-requisitos" };
  }

  let ok = true;
  const missingDiscs = [];
  let creditMsg = null;

  for (const p of disc.preReq) {
    if (p.endsWith("Créditos")) {
      const req = parseInt(p, 10);
      if (crFeitas < req) {
        ok = false;
        const falta = req - crFeitas;
        creditMsg = `Faltam ${falta} créditos (precisa ${req})`;
      }
    } else if (!feitas.includes(p)) {
      ok = false;
      missingDiscs.push(p);
    }
  }

  if (ok) return { ok: true, msg: "Você possui todos os pré-requisitos" };

  const parts = [];
  if (creditMsg) parts.push(creditMsg);
  if (missingDiscs.length) parts.push(`Falta cursar: ${missingDiscs.join(", ")}`);

  return { ok: false, msg: parts.join(" · ") };
}


// =============== PINTURA de cores (baseada no DOM atual) ===============

function getFeitasFromDOM() {
  return Array.from(document.querySelectorAll('.chk.checked'))
    .map(el => el.dataset.nome)
    .filter(Boolean);
}

function updateBoxColors(box, feitas, crFeitas) {
  const linhas = box.querySelectorAll('.disc');
  linhas.forEach(line => {
    const nome = line.dataset.nome;
    const d = D.find(dd => dd.nome === nome);
    const lbl = line.querySelector('.label');
    if (!d || !lbl) return;

    const { ok, msg } = getPrereqExplanation(d, feitas, crFeitas);

    // classes exclusivas
    lbl.classList.remove('can-pull', 'cant-pull');
    lbl.classList.add(ok ? 'can-pull' : 'cant-pull');

    // tooltip nativo
    if (msg) lbl.title = msg; else lbl.removeAttribute('title');
  });
}

function updateAllColorsDOM() {
  const feitas = getFeitasFromDOM();
  const crFeitas = calcCRFeitas(feitas);
  document.querySelectorAll('.sem').forEach(box => {
    updateBoxColors(box, feitas, crFeitas);
  });
}

// =================== Sincronização de equivalentes ===================

function sincronizarExtra(nomeDisc, marcado) {
  if (extraMap.has(nomeDisc)) {
    const eq = extraMap.get(nomeDisc);
    const chkEq = document.querySelector(`.chk[data-nome="${eq}"]`);
    if (chkEq) chkEq.classList.toggle('checked', marcado);
  }
  for (const [normal, extra] of extraMap.entries()) {
    if (extra === nomeDisc) {
      const chkNorm = document.querySelector(`.chk[data-nome="${normal}"]`);
      if (chkNorm) chkNorm.classList.toggle('checked', marcado);
    }
  }
  updateAllColorsDOM();
}

// =================== Construção das colunas de semestre ===================

function buildSemColumn(sem) {
  const box = document.createElement('div'); 
  box.className = 'sem';

  const titleContainer = document.createElement('div'); 
  titleContainer.style.display = 'flex'; 
  titleContainer.style.alignItems = 'center'; 
  titleContainer.style.justifyContent = 'space-between';

  const title = document.createElement('h3'); 
  if (sem === 0) title.textContent = 'Optativas';
  else if (sem === 11) title.textContent = 'Turmas Extras';
  else title.textContent = `${sem}º Semestre`;

  const chkAll = document.createElement('input'); 
  chkAll.type = 'checkbox';
  chkAll.className = 'custom-checkbox';

  chkAll.addEventListener('change', () => {
    const linhas = box.querySelectorAll('.disc');
    linhas.forEach(line => {
      const chk = line.querySelector('.chk');
      const nomeDisc = chk.dataset.nome;
      const d = D.find(dd => dd.nome === nomeDisc);
      const feitas = getFeitas();
      const crFeitas = calcCRFeitas(feitas);

      if (prereqOK(d, feitas, crFeitas)) {
        const marcado = chkAll.checked;
        chk.classList.toggle('checked', marcado);
        sincronizarExtra(nomeDisc, marcado);
      }
    });

    refreshConcluidos();
    updateAllColorsDOM();
  });

  titleContainer.appendChild(title);
  titleContainer.appendChild(chkAll);

  const list = document.createElement('div'); 
  list.className = 'disc-list';

  (bySem[sem] || []).forEach(d => {
    if (!colorMap.has(d.nome)) {
      colorMap.set(d.nome, palette[colorIdx % palette.length]); 
      colorIdx++; 
    }

    const line = document.createElement('div'); 
    line.className = 'disc';
    line.dataset.nome = d.nome;

    const chk = document.createElement('div'); 
    chk.className = 'chk'; 
    chk.dataset.nome = d.nome;

    const svgCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>`;
    chk.innerHTML = svgCheck;

    const lbl = document.createElement('div'); 
    lbl.className = 'label'; 
    lbl.textContent = d.nome;

    chk.addEventListener('click', () => {
      const nomeDisc = d.nome;
      const feitas = getFeitas();
      const crFeitas = calcCRFeitas(feitas);

      if (!prereqOK(d, feitas, crFeitas)) {
        alert('Você não pode marcar esta disciplina: pré-requisitos não cumpridos.');
        return;
      }

      const marcado = !chk.classList.contains('checked');
      chk.classList.toggle('checked', marcado);
      sincronizarExtra(nomeDisc, marcado);
      refreshConcluidos();
      updateAllColorsDOM();

      const todas = Array.from(box.querySelectorAll('.disc .chk'))
                         .every(c => c.classList.contains('checked'));
      chkAll.checked = todas;
    });

    line.appendChild(chk); 
    line.appendChild(lbl);
    list.appendChild(line);
  });

  box.appendChild(titleContainer);
  box.appendChild(list);

  updateBoxColors(box, getFeitasFromDOM(), calcCRFeitas(getFeitasFromDOM()));

  return box;
}

// =================== Montagem da grade ===================

const rowTop = document.getElementById('rowTop');
const rowBottom = document.getElementById('rowBottom');
const rowExtra = document.getElementById('rowExtra');

for (let sem = 1; sem <= 5; sem++) {
  rowTop.appendChild(buildSemColumn(sem));
}
for (let sem = 6; sem <= 10; sem++) {
  rowBottom.appendChild(buildSemColumn(sem));
}
rowExtra.appendChild(buildSemColumn(11));
rowExtra.appendChild(buildSemColumn(0));

document.addEventListener('DOMContentLoaded', () => {
  updateAllColorsDOM();
});

// ---------- Função utilitária para obter o horário ----------
function getHorario(dia, row) {
  const blocos = (dia === 'Sáb') ? blocosSabado : blocosSemana; // Sábado tem blocos diferentes
  return blocos[row] || ''; // Retorna horário ou string vazia se índice inválido
}

// ---------- Funções de verificação e manipulação da grade ----------

// Retorna o nome da disciplina que ocupa a célula, ou null se livre
function isOccupied(dia, row) {
    for (const [name, arr] of placed) {
        for (const b of arr) {
            if (b.dia === dia && b.row === row) return name;
        }
    }
    return null;
}

// Retorna a célula da grade baseada no dia e linha
function getCell(dia, row) {
    const headerCount = dias.length + 1; // colunas de cabeçalho
    const idx = headerCount + row * (dias.length + 1) + 1 + dias.indexOf(dia) - 0;
    return gradeEl.children[idx];
}

// Cria uma área para chips de disciplinas colocadas
function createChipsArea() {
    const c = document.createElement('div');
    c.className = 'chips';
    return c;
}

// Atualiza a interface dos chips e créditos das disciplinas colocadas
function refreshPlacedUI() {
    const chipsWrap = document.querySelector('.chips') || createChipsArea();
    chipsWrap.innerHTML = '';
    let totalCR = 0;

    for (const [name, arr] of placed) {
        const disc = D.find(x => x.nome === name);
        totalCR += (disc?.cr || 0);

        const ch = document.createElement('div');
        ch.className = 'chip';

        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.background = colorMap.get(name);

        const txt = document.createElement('div');
        txt.textContent = `${name} • CR ${disc?.cr || 0}`;

        ch.appendChild(dot);
        ch.appendChild(txt);
        chipsWrap.appendChild(ch);
    }

    document.getElementById('infoMsg').textContent = `Quantidade de créditos sugeridos na grade: ${totalCR}`;

    const gradeWrap = document.getElementById('gradeWrap');
    if (!gradeWrap.querySelector('.chips')) gradeWrap.insertAdjacentElement('afterbegin', chipsWrap);
}

// Remove uma disciplina da grade
function removePlacement(name) {
    const p = placed.get(name);
    if (!p) return;

    for (const b of p) {
        const cell = getCell(b.dia, b.row);
        if (cell) {
            cell.innerHTML = '';
            cell.classList.remove('occupied');
            cell.classList.add('drop-empty');
        }
    }

    placed.delete(name);
    refreshPlacedUI();
}

// ---------- Função para colocar disciplina na grade ----------
const placed = new Map();

function placeDisc(cell, name) {
    if (!name) return;

    const disc = D.find(x => x.nome === name);
    if (!disc) { 
        alert('Disciplina desconhecida'); 
        return; 
    }

    const feitas = getFeitas();
    const crFeitas = calcCRFeitas(feitas);
    if (!prereqOK(disc, feitas, crFeitas)) {
        alert('Pré-requisitos (ou CR) não cumpridos para essa disciplina.');
        return;
    }

    const dia = cell.dataset.dia;
    const row = parseInt(cell.dataset.row, 10);
    const dur = temposDisc(disc);
    const blocks = (dia === 'Sáb') ? blocosSabado.length : blocosSemana.length;

    if (row + dur > blocks) {
        alert('Não há espaço suficiente nesse dia para a carga dessa disciplina.');
        return;
    }

    // Verifica conflitos
    for (let t = 0; t < dur; t++) {
        const occ = isOccupied(dia, row + t);
        if (occ && occ !== name) {
            alert('Conflito com outra disciplina já colocada.');
            return;
        }
    }

    // Remove disciplina previamente colocada (se existir)
    if (placed.has(name)) removePlacement(name);

    // Insere disciplina na grade
    const arr = [];
    for (let t = 0; t < dur; t++) {
        const c = getCell(dia, row + t);
        if (!c) continue;

        c.classList.remove('drop-empty');
        c.classList.add('occupied');
        c.innerHTML = `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
            <div style="width:100%;padding:6px 8px;border-radius:8px;background:${colorMap.get(name)};color:#04121a;font-weight:800;display:flex;align-items:center;justify-content:center;position:relative">
              <span style="white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${name}</span>
              <span class="remove" title="Remover" style="position:absolute;right:6px;top:4px;cursor:pointer">✕</span>
            </div>
          </div>`;

        // Botão de remover disciplina
        c.querySelector('.remove')?.addEventListener('click', () => { removePlacement(name); });
        arr.push({ dia, row: row + t });
    }

    placed.set(name, arr);
    refreshPlacedUI();
}

// ---------- Eventos globais ----------

// Atualiza créditos ao marcar/desmarcar checkboxes
document.addEventListener('click', (e) => { 
    if (e.target.classList && e.target.classList.contains('chk')) { 
        refreshConcluidos(); 
    } 
});

// Botão "Limpar" -> remove todos os checkboxes marcados
document.getElementById('btnClear').addEventListener('click', () => {
    // Remove marcação de todos os checkboxes individuais
    document.querySelectorAll('.chk').forEach(k => k.classList.remove('checked'));

    // Remove marcação de todos os chkAll (checkbox principal por semestre)
    document.querySelectorAll('.custom-checkbox').forEach(c => c.checked = false);

    refreshConcluidos();
});

// ---------- Elementos do Modal ----------
const modal = document.getElementById('modal');
const closeModal = modal.querySelector('.close');
const materiasList = document.getElementById('materiasList');

// ---------- Abrir modal filtrando por dia específico ----------
function openModalPorDia(dia) {
    // Limpa o conteúdo anterior
    materiasList.innerHTML = '';

    const feitas = getFeitas();         // disciplinas já concluídas
    const crFeitas = calcCRFeitas(feitas);

    // Filtra disciplinas disponíveis para o dia clicado
    const disponiveis = D.filter(d => {
        if (feitas.includes(d.nome)) return false; // já concluída

        // Não mostrar se disciplina ou equivalente já estiver na grade
        if (placed.has(d.nome)) return false;
        for (const [normal, extra] of extraMap.entries()) {
            if (placed.has(normal) && d.nome === extra) return false;
            if (placed.has(extra) && d.nome === normal) return false;
        }

        if (!prereqOK(d, feitas, crFeitas)) return false; // pré-requisitos não atendidos

        const slots = MASTER.get(d.nome) || [];
        return slots.some(slot => slot.dia === dia); // tem slot no dia
    });

    // Caso não haja disciplinas disponíveis
    if (disponiveis.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma disciplina disponível neste dia';
        li.style.fontStyle = 'italic';
        li.style.color = '#888';
        materiasList.appendChild(li);
    } else {
        // Cria lista de disciplinas disponíveis
        disponiveis.forEach(d => {
            const li = document.createElement('li');
            li.textContent = d.nome;

            // Ao clicar na disciplina → tenta colocá-la na grade
            li.addEventListener('click', () => {
                const slots = MASTER.get(d.nome) || [];
                let conflito = false;
                const disciplinasConflito = new Set();

                // Verifica conflitos em todos os slots da disciplina
                slots.forEach(slot => {
                    for (let t = 0; t < slot.dur; t++) {
                        const c = getCell(slot.dia, slot.inicio + t);
                        if (c && c.classList.contains('occupied')) {
                            conflito = true;
                            const nomeDisc = c.querySelector('span')?.textContent || 'Desconhecida';
                            disciplinasConflito.add(nomeDisc);
                        }
                    }
                });

                if (conflito) {
                    const nomes = Array.from(disciplinasConflito).join(', ');
                    const msg = disciplinasConflito.size === 1
                        ? `Conflito com outra disciplina já colocada: ${nomes}`
                        : `Conflito com outras disciplinas já colocadas: ${nomes}`;
                    alert(msg);
                    return;
                }

                // Insere disciplina na grade
                slots.forEach(slot => {
                    for (let t = 0; t < slot.dur; t++) {
                        const c = getCell(slot.dia, slot.inicio + t);
                        if (!c) continue;

                        c.classList.remove('drop-empty');
                        c.classList.add('occupied');
                        c.innerHTML = `
                          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
                            <div style="width:100%;padding:6px 8px;border-radius:8px;background:${colorMap.get(d.nome)};color:#04121a;font-weight:800;display:flex;align-items:center;justify-content:center;position:relative">
                              <span style="white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${d.nome}</span>
                              <span class="remove" title="Remover" style="position:absolute;right:6px;top:4px;cursor:pointer">✕</span>
                            </div>
                          </div>`;

                        // Botão remover disciplina
                        c.querySelector('.remove')?.addEventListener('click', (event) => {
                            event.stopPropagation();
                            removePlacement(d.nome);
                        });

                        // Salva colocação
                        if (!placed.has(d.nome)) placed.set(d.nome, []);
                        placed.get(d.nome).push({ dia: slot.dia, row: slot.inicio + t });
                    }
                });

                // Fecha modal e atualiza interface
                modal.style.display = 'none';
                refreshPlacedUI();
            });

            materiasList.appendChild(li);
        });
    }

    // Exibe modal
    modal.style.display = 'block';
}

// ---------- Abrir modal filtrando por célula específica (dia + horário) ----------
function openModal(dia, row) {
    materiasList.innerHTML = '';

    const feitas = getFeitas();
    const crFeitas = calcCRFeitas(feitas);

    const disponiveis = D.filter(d => {
        if (feitas.includes(d.nome)) return false; // já concluída

        // Não mostrar se disciplina ou equivalente já estiver na grade
        if (placed.has(d.nome)) return false;
        for (const [normal, extra] of extraMap.entries()) {
            if (placed.has(normal) && d.nome === extra) return false;
            if (placed.has(extra) && d.nome === normal) return false;
        }

        if (!prereqOK(d, feitas, crFeitas)) return false;

        const slots = MASTER.get(d.nome) || [];
        // verifica se o horário específico está dentro da duração da disciplina
        return slots.some(slot => slot.dia === dia && row >= slot.inicio && row < slot.inicio + slot.dur);
    });

    if (disponiveis.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma disciplina disponível';
        li.style.fontStyle = 'italic';
        li.style.color = '#888';
        materiasList.appendChild(li);
    } else {
        disponiveis.forEach(d => {
            const li = document.createElement('li');
            li.textContent = d.nome;

            li.addEventListener('click', () => {
                const slots = MASTER.get(d.nome) || [];
                let conflito = false;
                const disciplinasConflito = new Set();

                // Checa conflito em todos os slots
                slots.forEach(slot => {
                    for (let t = 0; t < slot.dur; t++) {
                        const c = getCell(slot.dia, slot.inicio + t);
                        if (c && c.classList.contains('occupied')) {
                            conflito = true;
                            const nomeDisc = c.querySelector('span')?.textContent || 'Desconhecida';
                            disciplinasConflito.add(nomeDisc);
                        }
                    }
                });

                if (conflito) {
                    const nomes = Array.from(disciplinasConflito).join(', ');
                    const msg = disciplinasConflito.size === 1
                        ? `Conflito com outra disciplina já colocada: ${nomes}`
                        : `Conflito com outras disciplinas já colocadas: ${nomes}`;
                    alert(msg);
                    return;
                }

                // Coloca disciplina na grade
                slots.forEach(slot => {
                    for (let t = 0; t < slot.dur; t++) {
                        const c = getCell(slot.dia, slot.inicio + t);
                        if (!c) continue;

                        c.classList.remove('drop-empty');
                        c.classList.add('occupied');
                        c.innerHTML = `
                          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
                            <div style="width:100%;padding:6px 8px;border-radius:8px;background:${colorMap.get(d.nome)};color:#04121a;font-weight:800;display:flex;align-items:center;justify-content:center;position:relative">
                              <span style="white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${d.nome}</span>
                              <span class="remove" title="Remover" style="position:absolute;right:6px;top:4px;cursor:pointer">✕</span>
                            </div>
                          </div>`;

                        c.querySelector('.remove')?.addEventListener('click', (event) => {
                            event.stopPropagation();
                            removePlacement(d.nome);
                        });

                        if (!placed.has(d.nome)) placed.set(d.nome, []);
                        placed.get(d.nome).push({ dia: slot.dia, row: slot.inicio + t });
                    }
                });

                modal.style.display = 'none';
                refreshPlacedUI();
            });

            materiasList.appendChild(li);
        });
    }

    modal.style.display = 'block';
}

// ---------- Fechar modal ----------
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
};

// ---------- Evento de clique nas células da grade ----------
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', (event) => {
        // Ignora clique no botão remover
        if (event.target.classList.contains('remove')) return;

        // Ignora células já ocupadas
        if (!cell.classList.contains('drop-empty')) return;

        const dia = cell.dataset.dia;
        const row = parseInt(cell.dataset.row, 10);
        openModal(dia, row);
    });
});



const gradeEl = document.getElementById('grade');

// ---------- Função para renderizar a estrutura da grade ----------
function renderGridStructure() {
  // Limpa a grade antes de renderizar
  gradeEl.innerHTML = '';

  // === Cabeçalho da grade: coluna vazia + dias da semana ===
  ['', ...dias].forEach(h => {
    const c = document.createElement('div');
    c.className = 'cell head';   // estilo de cabeçalho
    c.textContent = h;

    // Adiciona evento apenas se for um dia válido (ignora coluna vazia)
    if (h) {
      c.addEventListener('click', () => {
        openModalPorDia(h); // abre modal com disciplinas do dia
      });
    }

    gradeEl.appendChild(c);
  });

  // Número máximo de linhas baseado nos blocos da semana
  const maxRows = blocosSemana.length;

  // === Linhas da grade (horários) ===
  for (let r = 0; r < maxRows; r++) {
    // Célula de label do horário
    const timeLabel = document.createElement('div');
    timeLabel.className = 'cell timecell';
    timeLabel.textContent = blocosSemana[r] || '';
    gradeEl.appendChild(timeLabel);

    // Células de cada dia da semana
    dias.forEach(dia => {
      const cell = document.createElement('div');
      cell.className = 'cell drop-empty';
      cell.dataset.dia = dia;
      cell.dataset.row = r;

      // Sábado: desativa células que estão fora do limite de blocos
      if (dia === 'Sáb' && r >= blocosSabado.length) {
        cell.classList.add('disabled', 'sat-muted');
        cell.textContent = '';
      } else {
        // Evento de clique para abrir modal de seleção da célula
        cell.addEventListener('click', () => {
          openModal(dia, r);
        });
      }

      gradeEl.appendChild(cell);
    });
  }
}

// ---------- Exportar grade como PDF ----------
document.getElementById('btnExportPDF').addEventListener('click', () => {
  const gradeWrap = document.getElementById('gradeWrap');

  html2canvas(gradeWrap, {
    scale: 2,
    backgroundColor: '#142b5e',
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');

    // PDF em paisagem
    const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Força a imagem ocupar toda a largura e altura do PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    pdf.save('grade.pdf');
  });
});


// =================== Limpar Grade + Repaint ===================

function clearPlaced() {
  placed.clear();
  renderGridStructure();
  refreshPlacedUI();
}

document.getElementById('btnClearGrade').addEventListener('click', () => {
  clearPlaced();
  document.getElementById('feedback').innerText = '';

  // espera o re-render completo (2 frames) antes de pintar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshConcluidos();
      updateAllColorsDOM();
    });
  });
});

// =================== OBSERVADOR DE MUDANÇAS DE DOM ===================
// por quê: clearPlaced/renderGridStructure alteram o DOM; garantimos repaint
const mo = new MutationObserver((mutations) => {
  const shouldRepaint = mutations.some(m =>
    m.type === 'childList' ||
    (m.type === 'attributes' &&
     m.attributeName === 'class' &&
     (m.target.classList?.contains('chk') || m.target.classList?.contains('disc')))
  );
  if (shouldRepaint) {
    // microtask: evita múltiplos repaints na mesma batelada
    Promise.resolve().then(updateAllColorsDOM);
  }
});
mo.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['class']
});

/** Ordem dos blocos do seletor cutoff*/
const TIME_INDEX = [
  '07:00','07:50','08:40','09:30','10:40','11:30','12:20','13:10',
  '14:00','14:50','15:40','16:40','17:30','18:20','19:10','20:10'
];

/** Converte "HH:MM" → minutos absolutos */
function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** "HH:MM" → índice de bloco (>= corte). */
function timeToBlockIndex(hhmm) {
  const i = TIME_INDEX.indexOf(hhmm);
  if (i !== -1) return i;
  // fallback: pega o primeiro bloco cujo horário >= hhmm
  const target = timeToMin(hhmm);
  for (let k = 0; k < TIME_INDEX.length; k++) {
    if (timeToMin(TIME_INDEX[k]) >= target) return k;
  }
  return TIME_INDEX.length - 1; // último bloco como fallback
}

/** Menor índice de início entre os slots da disciplina (primeiro tempo real) */
function firstStartBlock(disc) {
  const slots = MASTER.get(disc.nome) || [];
  if (!slots.length) return Infinity;
  // slots[i].inicio é índice de bloco (0-based) no seu grid
  return Math.min(...slots.map(s => s.inicio));
}

/** A disciplina passa no corte? (primeiro início ≥ bloco do corte) */
function passaCorte(disc, cutoffIdx) {
  return firstStartBlock(disc) >= cutoffIdx;
}


// ---------- Função de ordenação de candidatas ----------
function ordenarCandidatas(cands, estrategia, diaLivre) {
  // Ordenação por CR (créditos), desempata pelo semestre
  if (estrategia === 'cr') 
    return cands.sort((a, b) => (b.cr - a.cr) || (a.sem - b.sem));

  // Ordenação priorizando disciplinas fora do dia livre
  if (estrategia === 'dialivre') 
    return cands.sort((a, b) => {
      const slotsA = MASTER.get(a.nome) || [];
      const slotsB = MASTER.get(b.nome) || [];

      // Verifica se todas as turmas estão fora do diaLivre
      const foraA = slotsA.every(s => s.dia !== diaLivre);
      const foraB = slotsB.every(s => s.dia !== diaLivre);

      if (foraA !== foraB) return foraA ? -1 : 1; // prioriza quem está fora do dia livre
      return (a.sem - b.sem) || (b.cr - a.cr);    // desempate: semestre crescente, CR decrescente
    });

  // Caso padrão: disciplinas de semestre 0 vão para o final
  return cands.sort((a, b) => {
    const semA = a.sem === 0 ? 99 : a.sem; // empurra sem=0 pro final
    const semB = b.sem === 0 ? 99 : b.sem;
    return (semA - semB) || (b.cr - a.cr);
  });
}

// ---------- Função para escolher disciplinas sem conflito ----------
function escolherSemConflito(cands, qtd, preferirForaDoDia = null) {
  const ocup = new Map();       // marca horários já ocupados
  const escolhidas = [];        // array final de disciplinas escolhidas
  const escolhidasSet = new Set(); // nomes das disciplinas já escolhidas (incluindo equivalentes)

  // Função auxiliar: verifica se há conflito com horários já ocupados
  const conflitaDisciplina = (slots) => {
    for (const slot of slots) {
      for (let t = 0; t < slot.dur; t++) {
        if (ocup.has(`${slot.dia}-${slot.inicio + t}`)) {
          return true; // conflito detectado
        }
      }
    }
    return false;
  };

  for (const d of cands) {
    if (escolhidas.length >= qtd) break;

    // 1️⃣ Ignora se equivalente já foi escolhida
    const par = extraMap.get(d.nome) 
                || [...extraMap.entries()].find(([n, e]) => e === d.nome)?.[1];
    if (escolhidasSet.has(d.nome) || (par && escolhidasSet.has(par))) continue;

    const slots = MASTER.get(d.nome);
    if (!slots || slots.length === 0) continue;

    // 2️⃣ Tenta escolher slot fora do dia preferido
    let slotEscolhido = slots.find(s => (!preferirForaDoDia || s.dia !== preferirForaDoDia));
    if (!slotEscolhido) slotEscolhido = slots[0];
    if (!slotEscolhido) continue;

    // 3️⃣ Checa conflito em todos os slots da disciplina
    if (conflitaDisciplina(slots)) continue;

    // 4️⃣ Marca todos os horários da disciplina como ocupados
    for (const s of slots) {
      for (let t = 0; t < s.dur; t++) {
        ocup.set(`${s.dia}-${s.inicio + t}`, true);
      }
    }

    // 5️⃣ Adiciona disciplina escolhida ao array final
    escolhidas.push({ disc: d, slot: slotEscolhido });

    // 6️⃣ Marca disciplina e seu equivalente no Set para evitar duplicidade
    escolhidasSet.add(d.nome);
    if (extraMap.has(d.nome)) escolhidasSet.add(extraMap.get(d.nome));
    const inverso = [...extraMap.entries()].find(([n, e]) => e === d.nome);
    if (inverso) escolhidasSet.add(inverso[0]);
  }

  return escolhidas;
}

// ---------- Função principal: sugere disciplinas e renderiza na grade ----------
function suggestAndRender() {
  const feedbackEl = document.getElementById('feedback');
  feedbackEl.textContent = '';

  // Quantidade de disciplinas a sugerir (1–12)
  const qtd = Math.max(1, Math.min(12, parseInt(document.getElementById('qtd').value || '1')));
  const estrategia = document.getElementById('estrategia').value;  // estratégia de ordenação
  const diaLivre = document.getElementById('diaLivre').value;      // dia preferido livre
  const cutoffHHMM = (document.getElementById('cutoff')?.value || '07:00').trim();
  const cutoffIdx  = timeToBlockIndex(cutoffHHMM);
  const feitas = getFeitas();                                      // disciplinas já concluídas
  const crFeitas = calcCRFeitas(feitas);                           // CR acumulado das disciplinas feitas

  // Filtra disciplinas candidatas que atendem pré-requisitos e não foram feitas
  let candidatas = D.filter(d => !feitas.includes(d.nome) && prereqOK(d, feitas, crFeitas));

  candidatas = candidatas.filter(d => passaCorte(d, cutoffIdx));

  candidatas = ordenarCandidatas(candidatas, estrategia, diaLivre);

  const preferir = (estrategia === 'dialivre') ? diaLivre : null;
  const escolhidas = escolherSemConflito(candidatas, qtd, preferir);

  // Limpa a grade antes de renderizar
  clearPlaced();

  // Renderiza as disciplinas escolhidas na grade
  for (const { disc, slot } of escolhidas) {
    const slotsParaRender = MASTER.get(disc.nome) || [slot];
    let todosSlots = [];

    slotsParaRender.forEach(slotR => {
      const blocks = slotR.dia === 'Sáb' ? blocosSabado.length : blocosSemana.length;
      let start = slotR.inicio;

      // Ajusta início se ultrapassar o limite de blocos
      if (start + slotR.dur > blocks) start = Math.max(0, blocks - slotR.dur);

      // Itera sobre todos os blocos da disciplina
      for (let t = 0; t < slotR.dur; t++) {
        const c = getCell(slotR.dia, start + t);
        if (!c) continue;

        // Atualiza célula da grade com a disciplina
        c.classList.remove('drop-empty');
        c.classList.add('occupied');
        c.innerHTML = `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
            <div style="width:100%;padding:6px 8px;border-radius:8px;background:${colorMap.get(disc.nome)};color:#04121a;font-weight:800;display:flex;align-items:center;justify-content:center;position:relative">
              <span style="white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${disc.nome}</span>
              <span class="remove" title="Remover" style="position:absolute;right:6px;top:4px;cursor:pointer">✕</span>
            </div>
          </div>`;

        todosSlots.push({ dia: slotR.dia, row: start + t });

        // Botão de remover disciplina
        c.querySelector('.remove')?.addEventListener('click', (event) => {
          event.stopPropagation(); 
          const slots = placed.get(disc.nome) || [];
          slots.forEach(s => {
            const cell = getCell(s.dia, s.row);
            if (!cell) return;
            cell.classList.remove('occupied');
            cell.classList.add('drop-empty');
            cell.innerHTML = '';
          });
          placed.delete(disc.nome);
          refreshPlacedUI();
        });
      }
    });

    // Salva os blocos ocupados pela disciplina
    placed.set(disc.nome, todosSlots);
  }

  refreshPlacedUI();

  // ---------- Feedback para o usuário ----------
  if (escolhidas.length < qtd) {
    feedbackEl.textContent = `Não foi possível seguir todas as recomendações: só foi possível colocar ${escolhidas.length} de ${qtd} matérias.`;
    feedbackEl.style.color = '#ef4444'; // vermelho
  } else if (estrategia === 'dialivre' && !escolhidas.every(e => {
    const slots = placed.get(e.disc.nome) || [];
    return !slots.some(s => s.dia === diaLivre);
  })) {
    feedbackEl.textContent = `Não foi possível garantir o dia livre "${diaLivre}".`;
    feedbackEl.style.color = '#f59e0b'; // laranja
  } else {
    feedbackEl.textContent = `Grade gerada com sucesso! Todas as recomendações foram atendidas.`;
    feedbackEl.style.color = '#10b981'; // verde
  }
}

// ---------- Exibe campo de dia livre apenas se estratégia for 'dialivre' ----------
document.getElementById('estrategia').addEventListener('change', (e) => {
  document.getElementById('diaWrap').style.display = e.target.value === 'dialivre' ? 'block' : 'none';
});

// ---------- Botão para gerar grade ----------
document.getElementById('btnGerar').addEventListener('click', () => {
  suggestAndRender();
});

// Permite chamar removePlacement globalmente
window.removePlacement = removePlacement;

// ---------- Animação de digitação no topo da página ----------
new Typed('#typed', {
  strings: [
    "Sugestões automáticas de grade!",
    "Planeje seu semestre!",
    "Monte sua grade ideal!",
    "Evite conflitos de horário!"
  ],
  typeSpeed: 50,    // velocidade de digitação
  backSpeed: 30,    // velocidade de apagar
  loop: true        // repete infinitamente
});

// ---------- Inicializações importantes ao carregar a página ----------

// Atualiza a lista de disciplinas já concluídas (checkboxes .chk)
refreshConcluidos();

// Renderiza a estrutura inicial da grade (cabeçalhos e células vazias)
renderGridStructure();

// Atualiza a interface com as disciplinas já colocadas (chips)
refreshPlacedUI();



