const PPC = await fetch("/api/ppc").then(r => r.json());

/* =========================
   Dados principais vindos da API
   ========================= */
const disciplinas = PPC.disciplinas || {};
const equivalencias = PPC.equivalencias || {};
const pre_requisitos = PPC.pre_requisitos || {};

/* 
  Converte o objeto de disciplinas em lista para facilitar:
  - agrupamentos
  - ordenações
  - renderização por semestre
*/
const disciplinasLista = Object.entries(disciplinas).map(([id, d]) => ({
  id: String(id),
  ...d
}));

/* =========================
   Paleta de cores dos semestres
   ========================= */
const palette = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#0891b2",
  "#dc2626",
  "#65a30d",
  "#ea580c",
  "#0f766e",
  "#ca8a04",
  "#4f46e5",
  "#9333ea",
  "#059669",
  "#e11d48"
];

/* 
  Mapa que associa cada semestre a uma cor fixa.
  Isso evita que a cor de um semestre mude a cada re-renderização.
*/
const colorMap = new Map();
let colorIdx = 0;

/* =========================
   Utilitários gerais
   ========================= */

/**
 * Retorna as disciplinas equivalentes à disciplina informada.
 * O retorno sempre é uma lista.
 */
function getEquivalentes(id) {
  return equivalencias[String(id)] || [];
}

/**
 * Retorna a estrutura de pré-requisitos de uma disciplina.
 * Sempre devolve um objeto no formato esperado.
 */
function getPreReqByDiscId(id) {
  return pre_requisitos[String(id)] || { disciplinas: [], creditos: null };
}

/**
 * Obtém a carga teórica da disciplina,
 * aceitando diferentes variações de nome de campo.
 */
function getCargaTeorica(disc) {
  const candidatos = [
    disc?.carga_teorica,
    disc?.cargaTeorica,
    disc?.teorica,
    disc?.teorico,
    disc?.ch_teorica,
    disc?.chTeorica,
    disc?.cargaHorariaTeorica
  ];

  for (const valor of candidatos) {
    if (valor !== undefined && valor !== null && valor !== "") {
      return Number(valor) || 0;
    }
  }

  return 0;
}

/**
 * Obtém a carga prática da disciplina,
 * aceitando diferentes variações de nome de campo.
 */
function getCargaPratica(disc) {
  const candidatos = [
    disc?.carga_pratica,
    disc?.cargaPratica,
    disc?.pratica,
    disc?.ch_pratica,
    disc?.chPratica,
    disc?.cargaHorariaPratica
  ];

  for (const valor of candidatos) {
    if (valor !== undefined && valor !== null && valor !== "") {
      return Number(valor) || 0;
    }
  }

  return 0;
}

/**
 * Retorna o ID canônico de uma disciplina.
 *
 * Regra:
 * - considera a própria disciplina e suas equivalentes
 * - prioriza disciplinas que não sejam do tipo "extra"
 * - dentre as elegíveis, escolhe a de menor ID
 *
 * Isso ajuda a tratar equivalências como uma única disciplina lógica.
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
 * Agrupa uma lista de disciplinas pelo semestre.
 */
function agruparPorSemestre(lista) {
  return lista.reduce((acc, item) => {
    const sem = String(item.semestre);

    if (!acc[sem]) {
      acc[sem] = [];
    }

    acc[sem].push(item);
    return acc;
  }, {});
}

/**
 * Retorna o título amigável do semestre.
 */
function getTituloSemestre(sem) {
  if (Number(sem) === 0) return "Optativas";
  if (Number(sem) === 11) return "Turmas Extras";
  return `${sem}º Semestre`;
}

/* =========================
   Controle de seleção
   ========================= */

/**
 * Retorna os IDs das disciplinas marcadas visualmente.
 * Aqui considera apenas os elementos efetivamente marcados na interface.
 */
function getSelecionadasVisuais() {
  return Array.from(document.querySelectorAll(".disc-check.checked"))
    .map(el => String(el.dataset.id));
}

/**
 * Retorna a seleção completa, incluindo equivalentes.
 */
function getSelecionadas() {
  const checked = getSelecionadasVisuais();
  const todas = new Set(checked);

  checked.forEach(id => {
    getEquivalentes(id).forEach(eqId => todas.add(String(eqId)));
  });

  return Array.from(todas);
}

/**
 * Retorna apenas os IDs canônicos das disciplinas selecionadas.
 */
function getIdsSelecionadasCanonicas() {
  const visuais = getSelecionadasVisuais();
  const canonicas = new Set();

  visuais.forEach(id => {
    canonicas.add(getCanonicalDiscId(id));
  });

  return Array.from(canonicas);
}

/**
 * Conta quantas disciplinas únicas foram concluídas,
 * considerando equivalências.
 */
function getTotalConcluidasUnicas() {
  return getIdsSelecionadasCanonicas().length;
}

/**
 * Calcula o total de créditos concluídos,
 * sem contar duas vezes disciplinas equivalentes.
 */
function calcCRFeitas(listaIds) {
  const contados = new Set();
  let total = 0;

  for (const id of listaIds) {
    const canonico = getCanonicalDiscId(id);

    if (contados.has(canonico)) continue;

    const disc = disciplinas[canonico];
    if (!disc) continue;

    total += Number(disc.creditos || 0);
    contados.add(canonico);
  }

  return total;
}

/**
 * Mantém a marcação visual sincronizada entre disciplinas equivalentes.
 */
function sincronizarEquivalentes(id, marcado) {
  getEquivalentes(id).forEach(eqId => {
    const eqEl = document.querySelector(`.disc-check[data-id="${eqId}"]`);
    if (eqEl) {
      eqEl.classList.toggle("checked", marcado);
    }
  });
}

/**
 * Desmarca a disciplina informada e todas as equivalentes.
 */
function desmarcarDisciplinaECorrelatas(id) {
  const relacionados = [String(id), ...getEquivalentes(id).map(String)];

  relacionados.forEach(relId => {
    const el = document.querySelector(`.disc-check[data-id="${relId}"]`);
    if (el) {
      el.classList.remove("checked");
    }
  });
}

/**
 * Limpa toda a seleção e zera as reprovações.
 */
function limparSelecao() {
  document.querySelectorAll(".disc-check.checked").forEach(el => {
    el.classList.remove("checked");
  });

  document.querySelectorAll(".reprovacao-value").forEach(el => {
    el.textContent = "0";
  });

  atualizarResumo();
}

/* =========================
   Controle de reprovações
   ========================= */

/**
 * Obtém o número de reprovações da disciplina canônica.
 */
function getReprovacoesCanonicas(id) {
  const canonico = getCanonicalDiscId(id);
  const item = document.querySelector(`.disciplina-item[data-canonical-id="${canonico}"] .reprovacao-value`);
  return Number(item?.textContent || 0);
}

/**
 * Define o número de reprovações para todos os elementos
 * que representam a disciplina canônica.
 */
function setReprovacoesCanonicas(id, valor) {
  const canonico = getCanonicalDiscId(id);

  document.querySelectorAll(`.disciplina-item[data-canonical-id="${canonico}"] .reprovacao-value`)
    .forEach(el => {
      el.textContent = Math.max(0, Number(valor) || 0);
    });
}

/**
 * Altera o número de reprovações da disciplina.
 * Não permite interação quando a disciplina estiver bloqueada.
 */
function alterarReprovacao(id, delta) {
  const item = document.querySelector(`.disciplina-item[data-id="${id}"]`);

  if (item?.classList.contains("locked")) return;

  const atual = getReprovacoesCanonicas(id);
  const novo = Math.max(0, atual + delta);

  setReprovacoesCanonicas(id, novo);
}

/* =========================
   Regras de pré-requisito
   ========================= */

/**
 * Gera um texto descritivo dos pré-requisitos pendentes
 * para exibição em tooltip / title.
 */
function listarPreRequisitosTexto(disc) {
  const req = getPreReqByDiscId(disc.id);
  const partes = [];

  const disciplinasReq = req.disciplinas || [];

  if (disciplinasReq.length) {
    const nomes = disciplinasReq.map(reqId => {
      const canon = getCanonicalDiscId(reqId);
      return disciplinas[String(canon)]?.nome || disciplinas[String(reqId)]?.nome || `ID ${reqId}`;
    });

    partes.push(`Disciplinas: ${nomes.join(", ")}`);
  }

  if (req.creditos !== null && req.creditos !== undefined) {
    partes.push(`CR mínimos: ${Number(req.creditos)}`);
  }

  return partes.length ? partes.join(" • ") : "Pré-requisito pendente";
}

/**
 * Verifica se os pré-requisitos da disciplina estão atendidos.
 *
 * Regras avaliadas:
 * - créditos mínimos
 * - disciplinas pré-requisito concluídas
 */
function prereqOK(disc, feitas, crFeitas) {
  const req = getPreReqByDiscId(disc.id);

  if (!req) return true;

  if (req.creditos !== null && req.creditos !== undefined) {
    if (crFeitas < Number(req.creditos)) {
      return false;
    }
  }

  const canonFeitas = new Set(feitas.map(x => getCanonicalDiscId(x)));
  const disciplinasReq = req.disciplinas || [];

  return disciplinasReq.every(reqId => {
    const canonReq = getCanonicalDiscId(reqId);
    return canonFeitas.has(canonReq);
  });
}

/**
 * Garante consistência na seleção:
 * se uma disciplina marcada perder o pré-requisito,
 * ela é automaticamente desmarcada.
 *
 * Isso também corrige cadeias de dependência.
 */
function normalizarSelecaoPorDependencia() {
  let mudou = true;

  while (mudou) {
    mudou = false;

    const selecionadasAgora = getIdsSelecionadasCanonicas();

    for (const canonico of selecionadasAgora) {
      const disc = disciplinas[String(canonico)];
      if (!disc) continue;

      const outrasFeitas = selecionadasAgora.filter(id => id !== canonico);
      const crFeitas = calcCRFeitas(outrasFeitas);

      if (!prereqOK({ id: canonico, ...disc }, outrasFeitas, crFeitas)) {
        desmarcarDisciplinaECorrelatas(canonico);
        mudou = true;
      }
    }
  }
}

/* =========================
   Integração com API de histórico
   ========================= */

/**
 * Monta o payload que será enviado para persistência no backend.
 *
 * Regras:
 * - agrupa por disciplina canônica
 * - salva apenas disciplinas concluídas
 *   ou com pelo menos 1 reprovação
 */
function montarPayloadHistorico() {
  const canonicos = new Map();

  disciplinasLista.forEach(d => {
    const canonico = getCanonicalDiscId(d.id);

    if (!canonicos.has(canonico)) {
      canonicos.set(canonico, {
        disciplina_id: canonico,
        concluida: false,
        quantidade_reprovacoes: 0
      });
    }
  });

  getSelecionadasVisuais().forEach(id => {
    const canonico = getCanonicalDiscId(id);

    if (canonicos.has(canonico)) {
      canonicos.get(canonico).concluida = true;
    }
  });

  canonicos.forEach((registro, canonico) => {
    registro.quantidade_reprovacoes = getReprovacoesCanonicas(canonico);
  });

  return Array.from(canonicos.values()).filter(reg =>
    reg.concluida || reg.quantidade_reprovacoes > 0
  );
}

/**
 * Salva o histórico no backend.
 *
 * Parâmetros:
 * - showToast: exibe mensagem visual de sucesso/erro
 * - redirectUrl: redireciona após salvar, se informado
 */
async function salvarHistoricoAgora(showToast = false, redirectUrl = null) {
  try {
    const registros = montarPayloadHistorico();

    const response = await fetch("/api/historico-disciplinas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ registros })
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar histórico");
    }

    if (showToast) {
      mostrarToast("Histórico salvo com sucesso.");
    }

    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 400);
    }
  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao salvar histórico.");
  }
}

/**
 * Carrega o histórico salvo no banco e aplica na interface.
 */
async function carregarHistoricoDoBanco() {
  try {
    const response = await fetch("/api/historico-disciplinas");

    if (!response.ok) {
      throw new Error("Erro ao carregar histórico");
    }

    const data = await response.json();
    const historico = data.historico || {};

    Object.entries(historico).forEach(([disciplinaId, registro]) => {
      const canonico = getCanonicalDiscId(disciplinaId);

      if (registro.concluida) {
        const relacionados = [canonico, ...getEquivalentes(canonico).map(String)];

        relacionados.forEach(relId => {
          const el = document.querySelector(`.disc-check[data-id="${relId}"]`);
          if (el) {
            el.classList.add("checked");
          }
        });
      }

      setReprovacoesCanonicas(canonico, registro.quantidade_reprovacoes || 0);
    });

    normalizarSelecaoPorDependencia();
    atualizarResumo();
  } catch (error) {
    console.error(error);
    mostrarToast("Erro ao carregar histórico.");
  }
}

/* =========================
   Feedback visual e estado da UI
   ========================= */

/**
 * Exibe um toast temporário no canto da tela.
 */
function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/**
 * Atualiza o estado visual de bloqueio das disciplinas.
 *
 * Regras:
 * - disciplina não marcada e sem pré-requisito atendido fica bloqueada
 * - bloqueia checkbox
 * - bloqueia botões de reprovação
 * - exibe badge de pré-requisito pendente
 */
function atualizarBloqueios() {
  const feitas = getSelecionadas();
  const crFeitas = calcCRFeitas(feitas);

  document.querySelectorAll(".disciplina-item").forEach(item => {
    const check = item.querySelector(".disc-check");
    const lockBadge = item.querySelector(".locked-badge");
    const minusBtn = item.querySelector(".reprovacao-btn.minus");
    const plusBtn = item.querySelector(".reprovacao-btn.plus");
    const id = check?.dataset.id;

    if (!id) return;

    const disc = disciplinas[String(id)];
    if (!disc) return;

    const jaMarcada = check.classList.contains("checked");
    const podeMarcar = prereqOK({ id, ...disc }, feitas, crFeitas);

    item.classList.remove("locked");
    check.disabled = false;
    item.removeAttribute("title");

    if (lockBadge) {
      lockBadge.remove();
    }

    if (minusBtn) minusBtn.disabled = false;
    if (plusBtn) plusBtn.disabled = false;

    if (!jaMarcada && !podeMarcar) {
      item.classList.add("locked");
      check.disabled = true;

      if (minusBtn) minusBtn.disabled = true;
      if (plusBtn) plusBtn.disabled = true;

      const textoPrereq = listarPreRequisitosTexto({ id, ...disc });
      item.title = textoPrereq;

      const badge = document.createElement("div");
      badge.className = "locked-badge";
      badge.textContent = "Pré-requisito pendente";
      badge.title = textoPrereq;

      item.querySelector(".locked-slot")?.appendChild(badge);
    }
  });
}

/**
 * Atualiza os indicadores do topo:
 * - total de disciplinas concluídas
 * - total de créditos concluídos
 *
 * Em seguida, recalcula os bloqueios visuais.
 */
function atualizarResumo() {
  const feitas = getSelecionadas();
  const concluidasUnicas = getTotalConcluidasUnicas();

  const crEl = document.getElementById("crConcl");
  const totalEl = document.getElementById("totalSelecionadas");

  if (crEl) crEl.textContent = calcCRFeitas(feitas);
  if (totalEl) totalEl.textContent = concluidasUnicas;

  atualizarBloqueios();
}

/**
 * Marca ou desmarca uma disciplina.
 * Também sincroniza equivalências e normaliza dependências.
 */
function toggleDisc(id) {
  const el = document.querySelector(`.disc-check[data-id="${id}"]`);

  if (!el || el.disabled) return;

  const marcado = !el.classList.contains("checked");

  el.classList.toggle("checked", marcado);
  sincronizarEquivalentes(id, marcado);

  normalizarSelecaoPorDependencia();
  atualizarResumo();
}

/* =========================
   Renderização dos semestres
   ========================= */

/**
 * Cria o card visual de um semestre.
 */
function criarCardSemestre(sem, lista) {
  const card = document.createElement("section");
  card.className = "semester-card";
  card.dataset.sem = String(sem);

  if (!colorMap.has(String(sem))) {
    colorMap.set(String(sem), palette[colorIdx % palette.length]);
    colorIdx++;
  }

  const corSemestre = colorMap.get(String(sem));
  const disciplinasOrdenadas = [...lista].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  card.innerHTML = `
    <div class="semester-header">
      <div class="semester-title-wrap">
        <span class="semester-pill" style="background:${corSemestre}22; border-color:${corSemestre}66; color:${corSemestre};">
          ${getTituloSemestre(sem)}
        </span>
      </div>

      <div class="semester-actions">
        <button type="button" class="semester-btn mark-all">Marcar todas</button>
        <button type="button" class="semester-btn unmark-all">Desmarcar todas</button>
      </div>
    </div>

    <div class="semester-body">
      <div class="semester-list"></div>
    </div>
  `;

  const list = card.querySelector(".semester-list");

  disciplinasOrdenadas.forEach(d => {
    const cargaTeorica = getCargaTeorica(d);
    const cargaPratica = getCargaPratica(d);
    const canonico = getCanonicalDiscId(d.id);

    const item = document.createElement("article");
    item.className = "disciplina-item";
    item.dataset.nome = d.nome.toLowerCase();
    item.dataset.sem = String(d.semestre);
    item.dataset.id = String(d.id);
    item.dataset.canonicalId = canonico;

    item.innerHTML = `
      <button type="button" class="disc-check" data-id="${d.id}" aria-label="Selecionar ${d.nome}">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>

      <div class="disciplina-content">
        <div class="disciplina-top">
          <div class="disciplina-main">
            <div class="disciplina-title-row">
              <h4>${d.nome}</h4>
              <span class="disciplina-cr">CR ${d.creditos}</span>
            </div>

            <div class="disciplina-meta">
              <span>${d.tipo || "regular"}</span>
              <span>${cargaTeorica}T + ${cargaPratica}P</span>
            </div>

            <div class="disciplina-bottom-row">
              <div class="locked-slot"></div>

              <div class="disciplina-reprovacao-inline">
                <span class="reprovacao-label">Reprovações</span>

                <div class="reprovacao-control modern">
                  <button type="button" class="reprovacao-btn minus" aria-label="Diminuir reprovações">−</button>
                  <span class="reprovacao-value">0</span>
                  <button type="button" class="reprovacao-btn plus" aria-label="Aumentar reprovações">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    /* Evento de marcação da disciplina */
    item.querySelector(".disc-check").addEventListener("click", () => {
      toggleDisc(d.id);
    });

    /* Evento para diminuir reprovações */
    item.querySelector(".reprovacao-btn.minus").addEventListener("click", (event) => {
      event.stopPropagation();
      alterarReprovacao(d.id, -1);
    });

    /* Evento para aumentar reprovações */
    item.querySelector(".reprovacao-btn.plus").addEventListener("click", (event) => {
      event.stopPropagation();
      alterarReprovacao(d.id, 1);
    });

    list.appendChild(item);
  });

  /* Marca todas as disciplinas disponíveis do semestre */
  const btnMarkAll = card.querySelector(".mark-all");
  btnMarkAll.addEventListener("click", () => {
    card.querySelectorAll(".disc-check").forEach(check => {
      if (!check.disabled) {
        check.classList.add("checked");
        sincronizarEquivalentes(check.dataset.id, true);
      }
    });

    normalizarSelecaoPorDependencia();
    atualizarResumo();
  });

  /* Desmarca todas as disciplinas do semestre */
  const btnUnmarkAll = card.querySelector(".unmark-all");
  btnUnmarkAll.addEventListener("click", () => {
    card.querySelectorAll(".disc-check").forEach(check => {
      check.classList.remove("checked");
      sincronizarEquivalentes(check.dataset.id, false);
    });

    normalizarSelecaoPorDependencia();
    atualizarResumo();
  });

  return card;
}

/**
 * Renderiza todos os semestres na tela.
 */
function renderSemestres() {
  const container = document.getElementById("semestresContainer");
  if (!container) return;

  container.innerHTML = "";

  const agrupadas = agruparPorSemestre(disciplinasLista);
  const ordem = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "0", "11"];

  ordem.forEach(sem => {
    if (!agrupadas[sem]) return;
    container.appendChild(criarCardSemestre(sem, agrupadas[sem]));
  });
}

/**
 * Aplica os filtros de busca e semestre selecionado.
 */
function aplicarFiltros() {
  const termo = document.getElementById("searchDisc")?.value.trim().toLowerCase() || "";
  const sem = document.getElementById("filterSem")?.value || "todos";

  document.querySelectorAll(".semester-card").forEach(card => {
    let algumVisivel = false;

    card.querySelectorAll(".disciplina-item").forEach(item => {
      const nomeOK = item.dataset.nome.includes(termo);
      const semOK = sem === "todos" || item.dataset.sem === sem;
      const mostrar = nomeOK && semOK;

      item.style.display = mostrar ? "" : "none";

      if (mostrar) {
        algumVisivel = true;
      }
    });

    card.style.display = algumVisivel ? "" : "none";
  });
}

/* =========================
   Comportamentos secundários de interface
   ========================= */

/**
 * Inicializa o menu dropdown do perfil.
 */
function initProfileMenu() {
  const profileArea = document.getElementById("profileArea");
  const profileTrigger = document.getElementById("profileTrigger");

  if (!profileArea || !profileTrigger) return;

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

/**
 * Inicializa o texto animado do cabeçalho.
 */
function initTyped() {
  const typedTarget = document.getElementById("typed");

  if (!typedTarget || typeof Typed === "undefined") return;

  new Typed("#typed", {
    strings: [
      "Organize seu histórico antes de montar a grade.",
      "Marque apenas o que você já concluiu.",
      "Clique em salvar seleção para manter seu histórico atualizado.",
      "Informe o número de reprovações para cada disciplina."
    ],
    typeSpeed: 42,
    backSpeed: 24,
    loop: true
  });
}

/**
 * Registra os eventos globais da página.
 */
function initEventos() {
  document.getElementById("searchDisc")?.addEventListener("input", aplicarFiltros);
  document.getElementById("filterSem")?.addEventListener("change", aplicarFiltros);

  document.getElementById("btnLimpar")?.addEventListener("click", () => {
    limparSelecao();
    mostrarToast("Seleção limpa com sucesso.");
  });

  document.getElementById("btnSalvar")?.addEventListener("click", () => {
    salvarHistoricoAgora(true);
  });

  document.getElementById("btnSalvarBottom")?.addEventListener("click", () => {
    salvarHistoricoAgora(true, "/");
  });
}

/* =========================
   Inicialização da página
   ========================= */

renderSemestres();
initEventos();
initProfileMenu();
initTyped();
await carregarHistoricoDoBanco();
aplicarFiltros();