const [PPC, HIST] = await Promise.all([
  fetch("/api/ppc").then(r => r.json()),
  fetch("/api/historico-disciplinas").then(r => r.json())
]);

/* =========================
   Dados principais vindos da API
   ========================= */
const disciplinas = PPC.disciplinas || {};
const horarios = PPC.horarios || {};
const pre_requisitos = PPC.pre_requisitos || {};
const equivalencias = PPC.equivalencias || {};
const nome_para_id = PPC.nome_para_id || {};

let historico = HIST.historico || {};

/*
  Lista de disciplinas para facilitar:
  - ordenação
  - filtros
  - sugestões
*/
const disciplinasLista = Object.entries(disciplinas).map(([id, d]) => ({
  id: String(id),
  ...d
}));

/* =========================
   Estrutura da grade horária
   ========================= */
const blocosSemana = [
  "07:00-07:50", "07:50-08:40", "08:40-09:30", "09:30-10:20",
  "10:40-11:30", "11:30-12:20", "12:20-13:10", "13:10-14:00",
  "14:00-14:50", "14:50-15:40", "15:40-16:30", "16:40-17:30",
  "17:30-18:20", "18:20-19:10", "19:10-20:00", "20:10-21:00",
  "21:00-21:50", "21:50-22:40"
];

const blocosSabado = [
  "07:00-07:50", "07:50-08:40", "08:40-09:30", "09:30-10:20",
  "10:40-11:30", "11:30-12:20", "12:20-13:10"
];

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

/* =========================
   Paleta visual das disciplinas
   ========================= */
const palette = [
  "#2563eb", "#16a34a", "#d97706", "#db2777", "#7c3aed",
  "#0891b2", "#dc2626", "#65a30d", "#ea580c", "#0f766e",
  "#ca8a04", "#4f46e5", "#9333ea", "#059669", "#e11d48"
];

const colorMap = new Map();
let colorIdx = 0;

/* =========================
   Referências de elementos
   ========================= */
const gradeEl = document.getElementById("grade");
const materiasList = document.getElementById("materiasList");
const modal = document.getElementById("modal");
const closeModal = modal.querySelector(".close");

const qtdInput = document.getElementById("qtd");
const estrategiaBaseSelect = document.getElementById("estrategiaBase");
const horarioMinimoSelect = document.getElementById("horarioMinimo");
const preferirDiaLivreCheckbox = document.getElementById("preferirDiaLivre");
const diaWrap = document.getElementById("diaWrap");
const diaLivreSelect = document.getElementById("diaLivre");
const btnGerar = document.getElementById("btnGerar");
const btnToggleConcluidas = document.getElementById("btnToggleConcluidas");
const btnClearGrade = document.getElementById("btnClearGrade");
const btnExportPDF = document.getElementById("btnExportPDF");
const feedbackEl = document.getElementById("feedback");

/*
  Mapa com as disciplinas atualmente colocadas na grade.
  Estrutura:
  nomeDaDisciplina -> [{ dia, row }, ...]
*/
const placed = new Map();

/*
  Mapa mestre de horários:
  nomeDaDisciplina -> [{ dia, inicio, dur }, ...]
*/
const MASTER = new Map();

/*
  Inicializa o mapa de horários a partir dos dados vindos da API.
*/
for (const [id, disc] of Object.entries(disciplinas)) {
  const slots = (horarios[String(id)] || []).map(h => ({
    dia: h.dia,
    inicio: h.inicio,
    dur: h.dur
  }));

  MASTER.set(disc.nome, slots);
}

/* =========================
   Utilitários de dados
   ========================= */

function getEquivalentes(id) {
  return equivalencias[String(id)] || [];
}

function getDiscById(id) {
  return disciplinas[String(id)] || null;
}

function getDiscIdByName(nome) {
  return nome_para_id[nome] || null;
}

function getPreReqByDiscId(id) {
  return pre_requisitos[String(id)] || { disciplinas: [], creditos: null };
}

function normalizarDia(dia) {
  if (!dia) return "";

  const mapa = {
    "Seg": "Seg",
    "Ter": "Ter",
    "Qua": "Qua",
    "Qui": "Qui",
    "Sex": "Sex",
    "Sab": "Sab",
    "Sáb": "Sab"
  };

  return mapa[dia] || dia;
}

function disciplinaUsaDia(disc, dia) {
  const diaNormalizado = normalizarDia(dia);
  const slots = MASTER.get(disc.nome) || [];
  return slots.some(slot => normalizarDia(slot.dia) === diaNormalizado);
}

/**
 * Retorna o ID canônico de uma disciplina.
 * Isso evita duplicidade lógica entre equivalências.
 */
function getCanonicalDiscId(id) {
  const ids = [String(id), ...getEquivalentes(id).map(String)];
  const unicos = [...new Set(ids)]
    .map(x => ({ id: x, disc: disciplinas[String(x)] }))
    .filter(x => x.disc);

  const naoExtra = unicos.filter(x => (x.disc.tipo || "").toLowerCase() !== "extra");
  const base = naoExtra.length ? naoExtra : unicos;

  if (!base.length) return String(id);

  base.sort((a, b) => Number(a.id) - Number(b.id));
  return String(base[0].id);
}

/**
 * Retorna todo o grupo de equivalência conectado à disciplina.
 */
function getGrupoEquivalenciaIds(id) {
  const visitados = new Set();
  const fila = [String(id)];

  while (fila.length) {
    const atual = fila.shift();
    if (visitados.has(atual)) continue;

    visitados.add(atual);

    (getEquivalentes(atual) || []).forEach(eqId => {
      const s = String(eqId);
      if (!visitados.has(s)) fila.push(s);
    });
  }

  return Array.from(visitados);
}

/**
 * Garante uma cor fixa para cada disciplina.
 */
function ensureColor(nome) {
  if (!colorMap.has(nome)) {
    colorMap.set(nome, palette[colorIdx % palette.length]);
    colorIdx++;
  }
  return colorMap.get(nome);
}

disciplinasLista.forEach(d => ensureColor(d.nome));

/* =========================
   Histórico acadêmico
   ========================= */

/**
 * Retorna as disciplinas concluídas em formato canônico.
 */
function getHistoricoCanonicoSet() {
  const set = new Set();

  Object.entries(historico).forEach(([disciplinaId, registro]) => {
    if (registro?.concluida) {
      set.add(getCanonicalDiscId(disciplinaId));
    }
  });

  return set;
}

function getFeitasCanonicas() {
  return Array.from(getHistoricoCanonicoSet());
}

/**
 * Retorna a lista completa de disciplinas feitas,
 * incluindo equivalentes.
 */
function getFeitas() {
  const todas = new Set();

  getFeitasCanonicas().forEach(canonico => {
    getGrupoEquivalenciaIds(canonico).forEach(id => todas.add(String(id)));
  });

  return Array.from(todas);
}

/**
 * Calcula o total de créditos concluídos.
 */
function calcCRFeitas(listaIds) {
  const contados = new Set();
  let total = 0;

  for (const id of listaIds) {
    const canonico = getCanonicalDiscId(id);

    if (contados.has(canonico)) continue;

    const disc = disciplinas[String(canonico)];
    if (!disc) continue;

    total += Number(disc.creditos || 0);
    contados.add(canonico);
  }

  return total;
}

/**
 * Atualiza os indicadores visuais de concluídas e créditos.
 */
function refreshConcluidos() {
  const feitas = getFeitas();
  const feitasCanonicas = getFeitasCanonicas();

  document.getElementById("crConcl").textContent = calcCRFeitas(feitas);
  document.getElementById("qtdConcluidas").textContent = feitasCanonicas.length;

  renderHistoricoConcluidas();
}

/**
 * Retorna as disciplinas concluídas com informações completas,
 * ordenadas por semestre e nome.
 */
function getDisciplinasConcluidasDetalhadas() {
  const canonicas = getFeitasCanonicas();

  return canonicas
    .map(id => disciplinas[String(id)])
    .filter(Boolean)
    .sort((a, b) => {
      const semA = Number(a.semestre ?? 999);
      const semB = Number(b.semestre ?? 999);

      if (semA !== semB) return semA - semB;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
}

/**
 * Renderiza o painel colapsável com as disciplinas concluídas.
 */
function renderHistoricoConcluidas() {
  const wrap = document.getElementById("historicoChips");
  const resumo = document.getElementById("historicoResumo");

  if (!wrap || !resumo) return;

  const concluidas = getDisciplinasConcluidasDetalhadas();
  wrap.innerHTML = "";

  resumo.textContent = `${concluidas.length} disciplina${concluidas.length === 1 ? "" : "s"}`;

  if (!concluidas.length) {
    const empty = document.createElement("div");
    empty.className = "small-muted";
    empty.textContent = "Nenhuma disciplina concluída encontrada no histórico salvo.";
    wrap.appendChild(empty);
    return;
  }

  concluidas.forEach(d => {
    const chip = document.createElement("div");
    chip.className = "historico-chip";

    const dot = document.createElement("div");
    dot.className = "historico-chip-dot";
    dot.style.background = ensureColor(d.nome);

    const txt = document.createElement("span");
    txt.innerHTML = `${d.nome} <small class="historico-semestre">${d.semestre === 0 ? "Optativa" : d.semestre === 11 ? "Extra" : `${d.semestre}º sem`}</small>`;

    chip.appendChild(dot);
    chip.appendChild(txt);
    wrap.appendChild(chip);
  });
}

/**
 * Abre ou fecha o painel de concluídas.
 */
function togglePainelConcluidas() {
  const painel = document.getElementById("painelConcluidas");
  const btn = document.getElementById("btnToggleConcluidas");

  if (!painel || !btn) return;

  painel.classList.toggle("collapsed");
  const aberto = !painel.classList.contains("collapsed");

  btn.textContent = aberto ? "Ocultar concluídas" : "Ver concluídas";
}

/* =========================
   Pré-requisitos
   ========================= */

/**
 * Verifica se a disciplina atende os pré-requisitos.
 */
function prereqOK(disc, feitas, crFeitas) {
  const req = getPreReqByDiscId(disc.id);

  if (!req) return true;

  if (req.creditos !== null && req.creditos !== undefined) {
    if (crFeitas < Number(req.creditos)) return false;
  }

  const canonFeitas = new Set(feitas.map(x => getCanonicalDiscId(x)));
  const disciplinasReq = req.disciplinas || [];

  return disciplinasReq.every(reqId => {
    const canonReq = getCanonicalDiscId(reqId);
    return canonFeitas.has(canonReq);
  });
}

/* =========================
   Filtros de geração
   ========================= */

/**
 * Converte um label de horário para o índice da grade semanal.
 * Exemplo: "13:10-14:00" -> 7
 */
function getIndiceHorarioMinimo(valor) {
  if (!valor) return null;
  const idx = blocosSemana.indexOf(valor);
  return idx === -1 ? null : idx;
}

/**
 * Verifica se a disciplina respeita o filtro "A partir de".
 *
 * Regra:
 * - sábado é independente desse filtro
 * - para segunda a sexta, todos os slots da disciplina devem começar
 *   a partir do horário mínimo selecionado
 */
function atendeFiltroHorario(disc, horarioMinimo) {
  const indiceMinimo = getIndiceHorarioMinimo(horarioMinimo);
  if (indiceMinimo === null) return true;

  const slots = MASTER.get(disc.nome) || [];
  if (!slots.length) return true;

  const slotsUteis = slots.filter(slot => normalizarDia(slot.dia) !== "Sab");
  if (!slotsUteis.length) return true;

  return slotsUteis.every(slot => slot.inicio >= indiceMinimo);
}

/**
 * Retorna a configuração atual da geração.
 */
function getPreferenciasGeracao() {
  return {
    qtd: Math.max(1, Math.min(12, parseInt(qtdInput.value || "1", 10))),
    estrategiaBase: estrategiaBaseSelect.value,
    horarioMinimo: horarioMinimoSelect.value,
    priorizarDiaLivre: preferirDiaLivreCheckbox.checked,
    diaLivre: normalizarDia(diaLivreSelect.value)
  };
}

/**
 * Atualiza a interface dos filtros condicionais.
 */
function syncUIFiltros() {
  const diaLivreAtivo = preferirDiaLivreCheckbox.checked;

  diaWrap.classList.toggle("disabled-field", !diaLivreAtivo);
  diaLivreSelect.disabled = !diaLivreAtivo;

  if (diaLivreAtivo) {
    diaLivreSelect.removeAttribute("aria-disabled");
  } else {
    diaLivreSelect.setAttribute("aria-disabled", "true");
  }
}

/* =========================
   Chips da grade gerada
   ========================= */

function createChipsArea() {
  const c = document.createElement("div");
  c.className = "chips";
  return c;
}

/**
 * Atualiza a área de chips com as disciplinas colocadas na grade.
 */
function refreshPlacedUI() {
  const chipsWrap = document.querySelector(".chips") || createChipsArea();
  chipsWrap.innerHTML = "";

  let totalCR = 0;

  for (const [name] of placed) {
    const idDisc = getDiscIdByName(name);
    const disc = getDiscById(idDisc);

    totalCR += Number(disc?.creditos || 0);

    const ch = document.createElement("div");
    ch.className = "chip";

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.background = colorMap.get(name);

    const txt = document.createElement("div");
    txt.textContent = `${name} • CR ${disc?.creditos || 0}`;

    ch.appendChild(dot);
    ch.appendChild(txt);
    chipsWrap.appendChild(ch);
  }

  document.getElementById("infoMsg").textContent =
    `Quantidade de créditos sugeridos na grade: ${totalCR}`;

  const gradeWrap = document.getElementById("gradeWrap");
  if (!gradeWrap.querySelector(".chips")) {
    gradeWrap.insertAdjacentElement("afterbegin", chipsWrap);
  }
}

/* =========================
   Estrutura da grade
   ========================= */

function getCell(dia, row) {
  const headerCount = dias.length + 1;
  const idx = headerCount + row * (dias.length + 1) + 1 + dias.indexOf(dia);
  return gradeEl.children[idx];
}

/**
 * Remove uma disciplina já colocada na grade.
 */
function removePlacement(name) {
  const p = placed.get(name);
  if (!p) return;

  for (const b of p) {
    const cell = getCell(b.dia, b.row);

    if (cell) {
      cell.innerHTML = "";
      cell.classList.remove("occupied");
      cell.classList.add("drop-empty");
    }
  }

  placed.delete(name);
  refreshPlacedUI();
}

/**
 * Limpa toda a grade montada.
 */
function clearPlaced() {
  placed.clear();
  renderGridStructure();
  refreshPlacedUI();
}

/**
 * Renderiza a estrutura vazia da grade.
 */
function renderGridStructure() {
  gradeEl.innerHTML = "";

  ["", ...dias].forEach(h => {
    const c = document.createElement("div");
    c.className = "cell head";
    c.textContent = h;

    if (h) {
      c.addEventListener("click", () => openModalPorDia(h));
    }

    gradeEl.appendChild(c);
  });

  const maxRows = blocosSemana.length;

  for (let r = 0; r < maxRows; r++) {
    const timeLabel = document.createElement("div");
    timeLabel.className = "cell timecell";
    timeLabel.textContent = blocosSemana[r] || "";
    gradeEl.appendChild(timeLabel);

    dias.forEach(dia => {
      const cell = document.createElement("div");
      cell.className = "cell drop-empty";
      cell.dataset.dia = dia;
      cell.dataset.row = r;

      if (dia === "Sab" && r >= blocosSabado.length) {
        cell.classList.add("disabled", "sat-muted");
        cell.textContent = "";
      } else {
        cell.addEventListener("click", () => openModal(dia, r));
      }

      gradeEl.appendChild(cell);
    });
  }
}

/* =========================
   Inserção manual de disciplina
   ========================= */

/**
 * Coloca uma disciplina na grade, validando conflitos.
 */
function abrirDisciplinaNaGrade(disc) {
  const slots = MASTER.get(disc.nome) || [];
  let conflito = false;
  const disciplinasConflito = new Set();

  slots.forEach(slot => {
    for (let t = 0; t < slot.dur; t++) {
      const c = getCell(slot.dia, slot.inicio + t);

      if (c && c.classList.contains("occupied")) {
        conflito = true;
        const nomeDisc = c.querySelector(".occupied-title, span")?.textContent || "Desconhecida";
        disciplinasConflito.add(nomeDisc);
      }
    }
  });

  if (conflito) {
    const nomes = Array.from(disciplinasConflito).join(", ");
    alert(`Conflito com disciplina já colocada: ${nomes}`);
    return;
  }

  slots.forEach(slot => {
    for (let t = 0; t < slot.dur; t++) {
      const c = getCell(slot.dia, slot.inicio + t);
      if (!c) continue;

      c.classList.remove("drop-empty");
      c.classList.add("occupied");
      c.innerHTML = `
        <div class="occupied-shell">
          <div class="occupied-box" style="background:${colorMap.get(disc.nome)}" title="${disc.nome}">
            <span class="occupied-title">${disc.nome}</span>
            <span class="remove" title="Remover">✕</span>
          </div>
        </div>
      `;

      c.querySelector(".remove")?.addEventListener("click", (event) => {
        event.stopPropagation();
        removePlacement(disc.nome);
      });

      if (!placed.has(disc.nome)) placed.set(disc.nome, []);
      placed.get(disc.nome).push({ dia: slot.dia, row: slot.inicio + t });
    }
  });

  refreshPlacedUI();
}

/* =========================
   Modais de escolha manual
   ========================= */

/**
 * Abre o modal listando disciplinas disponíveis para um dia inteiro.
 * O filtro de horário mínimo também é respeitado aqui,
 * exceto para sábado.
 */
function openModalPorDia(dia) {
  materiasList.innerHTML = "";

  const feitas = getFeitas();
  const crFeitas = calcCRFeitas(feitas);
  const { horarioMinimo } = getPreferenciasGeracao();

  const disponiveis = disciplinasLista.filter(d => {
    const id = String(d.id);

    if (feitas.includes(id)) return false;
    if (placed.has(d.nome)) return false;

    const eqs = getEquivalentes(id);
    for (const eqId of eqs) {
      const eqDisc = disciplinas[String(eqId)];
      if (eqDisc && placed.has(eqDisc.nome)) return false;
    }

    if (!prereqOK(d, feitas, crFeitas)) return false;
    if (!atendeFiltroHorario(d, horarioMinimo)) return false;

    const slots = MASTER.get(d.nome) || [];
    return slots.some(slot => slot.dia === dia);
  });

  if (!disponiveis.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma disciplina disponível neste dia";
    li.style.fontStyle = "italic";
    li.style.color = "#888";
    materiasList.appendChild(li);
  } else {
    disponiveis.forEach(d => {
      const li = document.createElement("li");
      li.textContent = d.nome;

      li.addEventListener("click", () => {
        abrirDisciplinaNaGrade(d);
        modal.style.display = "none";
      });

      materiasList.appendChild(li);
    });
  }

  modal.style.display = "block";
}

/**
 * Abre o modal listando disciplinas possíveis para uma célula específica.
 * O filtro de horário mínimo também é respeitado aqui,
 * exceto para sábado.
 */
function openModal(dia, row) {
  materiasList.innerHTML = "";

  const feitas = getFeitas();
  const crFeitas = calcCRFeitas(feitas);
  const { horarioMinimo } = getPreferenciasGeracao();

  const disponiveis = disciplinasLista.filter(d => {
    const id = String(d.id);

    if (feitas.includes(id)) return false;
    if (placed.has(d.nome)) return false;

    const eqs = getEquivalentes(id);
    for (const eqId of eqs) {
      const eqDisc = disciplinas[String(eqId)];
      if (eqDisc && placed.has(eqDisc.nome)) return false;
    }

    if (!prereqOK(d, feitas, crFeitas)) return false;
    if (!atendeFiltroHorario(d, horarioMinimo)) return false;

    const slots = MASTER.get(d.nome) || [];
    return slots.some(slot => slot.dia === dia && row >= slot.inicio && row < slot.inicio + slot.dur);
  });

  if (!disponiveis.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma disciplina disponível";
    li.style.fontStyle = "italic";
    li.style.color = "#888";
    materiasList.appendChild(li);
  } else {
    disponiveis.forEach(d => {
      const li = document.createElement("li");
      li.textContent = d.nome;

      li.addEventListener("click", () => {
        abrirDisciplinaNaGrade(d);
        modal.style.display = "none";
      });

      materiasList.appendChild(li);
    });
  }

  modal.style.display = "block";
}

/* =========================
   Algoritmo de sugestão
   ========================= */

/**
 * Calcula uma pontuação para priorização quando a base é semestre.
 *
 * Hierarquia:
 * 1. Estratégia principal
 * 2. Dia livre como preferência adicional
 * 3. Créditos como desempate
 */
function scoreDisciplinaSemestre(disc, contexto) {
  const { priorizarDiaLivre, diaLivre } = contexto;

  const semNormalizado = Number(disc.semestre === 0 ? 99 : disc.semestre);
  const evitaDiaLivre = !priorizarDiaLivre || !disciplinaUsaDia(disc, diaLivre);

  return {
    chave1: semNormalizado,
    chave2: priorizarDiaLivre ? (evitaDiaLivre ? 0 : 1) : 0,
    chave3: -Number(disc.creditos || 0),
    chave4: disc.nome
  };
}

/**
 * Calcula uma pontuação para priorização quando a base é CR.
 *
 * Hierarquia:
 * 1. Estratégia principal
 * 2. Dia livre como preferência adicional
 * 3. Semestre como desempate
 */
function scoreDisciplinaCR(disc, contexto) {
  const { priorizarDiaLivre, diaLivre } = contexto;

  const evitaDiaLivre = !priorizarDiaLivre || !disciplinaUsaDia(disc, diaLivre);
  const semNormalizado = Number(disc.semestre === 0 ? 99 : disc.semestre);

  return {
    chave1: -Number(disc.creditos || 0),
    chave2: priorizarDiaLivre ? (evitaDiaLivre ? 0 : 1) : 0,
    chave3: semNormalizado,
    chave4: disc.nome
  };
}

/**
 * Compara dois objetos-score lexicograficamente.
 */
function compararScore(a, b) {
  const chaves = ["chave1", "chave2", "chave3", "chave4"];

  for (const chave of chaves) {
    if (a[chave] < b[chave]) return -1;
    if (a[chave] > b[chave]) return 1;
  }

  return 0;
}

/**
 * Ordena disciplinas candidatas conforme:
 * - estratégia principal
 * - preferência por dia livre
 *
 * Observação:
 * O filtro de horário é obrigatório e já foi aplicado antes.
 */
function ordenarCandidatas(cands, contexto) {
  return [...cands].sort((a, b) => {
    const scoreA = contexto.estrategiaBase === "cr"
      ? scoreDisciplinaCR(a, contexto)
      : scoreDisciplinaSemestre(a, contexto);

    const scoreB = contexto.estrategiaBase === "cr"
      ? scoreDisciplinaCR(b, contexto)
      : scoreDisciplinaSemestre(b, contexto);

    return compararScore(scoreA, scoreB);
  });
}

/**
 * Escolhe disciplinas sem conflito de horário.
 *
 * Regras:
 * - respeita equivalências
 * - respeita conflitos de grade
 * - respeita o filtro de horário sempre
 * - respeita o dia livre quando estiver ativado
 *
 * Observação importante:
 * O sistema NÃO relaxa mais nenhuma preferência.
 * Se não der para atingir a quantidade desejada respeitando tudo,
 * ele reduz a quantidade final recomendada.
 */
function escolherSemConflito(cands, qtd, contexto) {
  const ocup = new Map();
  const escolhidas = [];
  const escolhidasSet = new Set();

  const conflitaDisciplina = (slots) => {
    for (const slot of slots) {
      for (let t = 0; t < slot.dur; t++) {
        if (ocup.has(`${slot.dia}-${slot.inicio + t}`)) {
          return true;
        }
      }
    }
    return false;
  };

  for (const d of cands) {
    if (escolhidas.length >= qtd) break;

    const id = String(d.id);
    const eqs = getEquivalentes(id);

    if (escolhidasSet.has(id) || eqs.some(eqId => escolhidasSet.has(String(eqId)))) {
      continue;
    }

    if (!atendeFiltroHorario(d, contexto.horarioMinimo)) {
      continue;
    }

    if (contexto.priorizarDiaLivre && disciplinaUsaDia(d, contexto.diaLivre)) {
      continue;
    }

    const slots = MASTER.get(d.nome);
    if (!slots || slots.length === 0) continue;
    if (conflitaDisciplina(slots)) continue;

    for (const s of slots) {
      for (let t = 0; t < s.dur; t++) {
        ocup.set(`${s.dia}-${s.inicio + t}`, true);
      }
    }

    escolhidas.push({ disc: d });
    escolhidasSet.add(id);
    eqs.forEach(eqId => escolhidasSet.add(String(eqId)));
  }

  return escolhidas;
}

/* =========================
   Feedback da geração
   ========================= */

function getNomeEstrategia(valor) {
  return valor === "cr" ? "Maximizar CR" : "Progredir por semestre";
}

function getHorarioLabel(valor) {
  return valor ? valor.split("-")[0] : "";
}

/**
 * Monta um resumo simples e consistente do resultado.
 */
function montarResumoResultado(contexto, escolhidas) {
  const totalEscolhidas = escolhidas.length;
  const quantidadeOk = totalEscolhidas === contexto.qtd;

  const chips = [];

  if (contexto.horarioMinimo) {
    chips.push({
      tipo: "horario",
      texto: `Horário respeitado: aulas a partir de ${getHorarioLabel(contexto.horarioMinimo)}.`
    });
  }

  if (contexto.priorizarDiaLivre) {
    chips.push({
      tipo: "dia-livre",
      texto: `Dia livre respeitado: ${contexto.diaLivre}.`
    });
  }

  let titulo = "";
  let cor = "";

  if (quantidadeOk) {
    titulo = `Grade gerada com sucesso: ${totalEscolhidas} de ${contexto.qtd} disciplinas recomendadas.`;
    cor = "#10b981";
  } else {
    titulo = `Para respeitar os critérios selecionados, o sistema recomendou ${totalEscolhidas} de ${contexto.qtd} disciplinas.`;
    cor = "#f59e0b";
  }

  return { titulo, cor, chips };
}

/**
 * Renderiza um feedback mais limpo e amigável para o usuário.
 */
function renderizarFeedbackResultado(resultado) {
  const chipsHtml = resultado.chips
    .map(chip => {
      const classe =
        chip.tipo === "horario"
          ? "feedback-chip feedback-chip-horario"
          : "feedback-chip feedback-chip-dia-livre";

      return `<span class="${classe}">${chip.texto}</span>`;
    })
    .join("");

  feedbackEl.innerHTML = `
    <div class="feedback-box">
      <div class="feedback-title" style="color: ${resultado.cor};">
        ${resultado.titulo}
      </div>
      ${
        resultado.chips.length
          ? `<div class="feedback-chips">${chipsHtml}</div>`
          : ""
      }
    </div>
  `;
}

/**
 * Gera a grade automaticamente e renderiza o resultado.
 */
function suggestAndRender() {
  feedbackEl.innerHTML = "";

  const contexto = getPreferenciasGeracao();
  const feitas = getFeitas();
  const crFeitas = calcCRFeitas(feitas);

  let candidatas = disciplinasLista.filter(d => {
    const id = String(d.id);

    return (
      !feitas.includes(id) &&
      prereqOK(d, feitas, crFeitas) &&
      atendeFiltroHorario(d, contexto.horarioMinimo)
    );
  });

  candidatas = ordenarCandidatas(candidatas, contexto);

  const escolhidas = escolherSemConflito(candidatas, contexto.qtd, contexto);

  clearPlaced();

  for (const { disc } of escolhidas) {
    const slotsParaRender = MASTER.get(disc.nome) || [];
    const todosSlots = [];

    slotsParaRender.forEach(slotR => {
      const blocks = normalizarDia(slotR.dia) === "Sab" ? blocosSabado.length : blocosSemana.length;
      let start = slotR.inicio;

      if (start + slotR.dur > blocks) {
        start = Math.max(0, blocks - slotR.dur);
      }

      for (let t = 0; t < slotR.dur; t++) {
        const c = getCell(slotR.dia, start + t);
        if (!c) continue;

        c.classList.remove("drop-empty");
        c.classList.add("occupied");
        c.innerHTML = `
          <div class="occupied-shell">
            <div class="occupied-box" style="background:${colorMap.get(disc.nome)}" title="${disc.nome}">
              <span class="occupied-title">${disc.nome}</span>
              <span class="remove" title="Remover">✕</span>
            </div>
          </div>
        `;

        todosSlots.push({ dia: slotR.dia, row: start + t });

        c.querySelector(".remove")?.addEventListener("click", (event) => {
          event.stopPropagation();
          removePlacement(disc.nome);
        });
      }
    });

    placed.set(disc.nome, todosSlots);
  }

  refreshPlacedUI();

  const resultado = montarResumoResultado(contexto, escolhidas);
  renderizarFeedbackResultado(resultado);
}

/* =========================
   Eventos principais
   ========================= */

preferirDiaLivreCheckbox.addEventListener("change", () => {
  syncUIFiltros();
});

btnGerar.addEventListener("click", () => {
  suggestAndRender();
});

btnToggleConcluidas.addEventListener("click", () => {
  togglePainelConcluidas();
});

btnClearGrade.addEventListener("click", () => {
  clearPlaced();
  feedbackEl.innerHTML = "";
});

btnExportPDF.addEventListener("click", () => {
  const gradeWrap = document.getElementById("gradeWrap");

  html2canvas(gradeWrap, {
    scale: 2,
    backgroundColor: "#142b5e",
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jspdf.jsPDF("l", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("grade.pdf");
  });
});

/* =========================
   Modal
   ========================= */

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

/* =========================
   Texto animado do cabeçalho
   ========================= */

new Typed("#typed", {
  strings: [
    "Sugestões automáticas de grade!",
    "Planeje seu semestre!",
    "Monte sua grade ideal!",
    "Evite conflitos de horário!"
  ],
  typeSpeed: 50,
  backSpeed: 30,
  loop: true
});

/* =========================
   Menu de perfil
   ========================= */

const profileArea = document.getElementById("profileArea");
const profileTrigger = document.getElementById("profileTrigger");

if (profileArea && profileTrigger) {
  profileTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    profileArea.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!profileArea.contains(event.target)) {
      profileArea.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      profileArea.classList.remove("open");
    }
  });
}

/* =========================
   Inicialização da página
   ========================= */

renderGridStructure();
refreshPlacedUI();
refreshConcluidos();
syncUIFiltros();