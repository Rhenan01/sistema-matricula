document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "admin_disciplinas_filtros_v1";

    const filterInput = document.getElementById("filtroDisciplinas");
    const filterSemestre = document.getElementById("filtroSemestre");
    const filterPpc = document.getElementById("filtroPpc");

    function salvarEstadoFiltros() {
        const state = {
            termo: filterInput?.value || "",
            semestre: filterSemestre?.value || "",
            ppc: filterPpc?.value || "",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function restaurarEstadoFiltros() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const state = JSON.parse(raw);

            if (filterInput && typeof state.termo === "string") {
                filterInput.value = state.termo;
            }

            if (filterSemestre && typeof state.semestre === "string") {
                filterSemestre.value = state.semestre;
            }

            if (filterPpc && typeof state.ppc === "string") {
                filterPpc.value = state.ppc;
            }
        } catch (error) {
            console.error("Erro ao restaurar filtros:", error);
        }
    }

    /* =========================================================
       FLASH MESSAGES
    ========================================================= */
    const flashMessages = document.querySelectorAll(".flash-message");

    flashMessages.forEach((flash) => {
        const closeBtn = flash.querySelector(".flash-close");

        const removeFlash = () => {
            if (!flash.classList.contains("removing")) {
                flash.classList.add("removing");

                setTimeout(() => {
                    flash.remove();
                }, 280);
            }
        };

        if (closeBtn) {
            closeBtn.addEventListener("click", removeFlash);
        }

        setTimeout(removeFlash, 4000);
    });

    /* =========================================================
       MODAL DE EXCLUSÃO
    ========================================================= */
    const deleteModal = document.getElementById("deleteModal");
    const deleteModalText = document.getElementById("deleteModalText");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    const openDeleteButtons = document.querySelectorAll(".open-delete-modal");

    let formToDelete = null;

    function openDeleteModal(form, disciplinaName) {
        formToDelete = form;
        deleteModalText.textContent = `Tem certeza que deseja excluir a disciplina "${disciplinaName}"? Essa ação não poderá ser desfeita.`;
        deleteModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeDeleteModal() {
        deleteModal.classList.remove("active");
        formToDelete = null;
        document.body.style.overflow = "";
    }

    openDeleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const form = button.closest(".delete-form");
            const disciplinaName = form.dataset.disciplinaName || "a disciplina selecionada";
            openDeleteModal(form, disciplinaName);
        });
    });

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (formToDelete) {
                salvarEstadoFiltros();
                formToDelete.submit();
            }
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener("click", (event) => {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && deleteModal.classList.contains("active")) {
            closeDeleteModal();
        }
    });

    /* =========================================================
       SEMESTRE AUTOMÁTICO POR TIPO
    ========================================================= */
    function aplicarRegraSemestre(tipoSelect, semestreInput) {
        if (!tipoSelect || !semestreInput) return;

        const tipo = (tipoSelect.value || "").toLowerCase();

        if (tipo === "optativa") {
            semestreInput.value = "0";
            semestreInput.readOnly = true;
            semestreInput.setAttribute("readonly", "readonly");
            semestreInput.classList.add("input-locked");
        } else if (tipo === "extra") {
            semestreInput.value = "11";
            semestreInput.readOnly = true;
            semestreInput.setAttribute("readonly", "readonly");
            semestreInput.classList.add("input-locked");
        } else {
            semestreInput.readOnly = false;
            semestreInput.removeAttribute("readonly");
            semestreInput.classList.remove("input-locked");

            if (semestreInput.value === "0" || semestreInput.value === "11") {
                semestreInput.value = "";
            }
        }
    }

    function inicializarRegraSemestre() {
        const tipoCreate = document.querySelector('.new-disciplina-form select[name="tipo"]');
        const semestreCreate = document.querySelector('.new-disciplina-form input[name="semestre"]');

        if (tipoCreate && semestreCreate) {
            aplicarRegraSemestre(tipoCreate, semestreCreate);
            tipoCreate.addEventListener("change", () => {
                aplicarRegraSemestre(tipoCreate, semestreCreate);
            });
        }

        document.querySelectorAll(".edit-form").forEach((form) => {
            const tipoEdit = form.querySelector('select[name="tipo"]');
            const semestreEdit = form.querySelector('input[name="semestre"]');

            if (tipoEdit && semestreEdit) {
                aplicarRegraSemestre(tipoEdit, semestreEdit);
                tipoEdit.addEventListener("change", () => {
                    aplicarRegraSemestre(tipoEdit, semestreEdit);
                });
            }
        });
    }

    inicializarRegraSemestre();

    /* =========================================================
       FILTROS
    ========================================================= */
    const items = document.querySelectorAll(".disciplina-item");
    const counter = document.getElementById("contadorDisciplinas");
    const emptySearchState = document.getElementById("emptySearchState");
    const initialEmptyState = document.getElementById("estadoVazio");

    function aplicarFiltros() {
        const term = (filterInput?.value || "").trim().toLowerCase();
        const semestreSelecionado = filterSemestre?.value || "";
        const ppcSelecionado = (filterPpc?.value || "").trim().toLowerCase();

        let visibleCount = 0;

        items.forEach((item) => {
            const nome = item.dataset.disciplinaNome || "";
            const curso = item.dataset.disciplinaCurso || "";
            const ppc = item.dataset.disciplinaPpc || "";
            const semestre = item.dataset.disciplinaSemestre || "";

            const matchesText =
                term === "" ||
                nome.includes(term) ||
                curso.includes(term) ||
                ppc.includes(term);

            const matchesSemestre =
                semestreSelecionado === "" ||
                semestre === semestreSelecionado;

            const matchesPpc =
                ppcSelecionado === "" ||
                ppc === ppcSelecionado;

            const matches = matchesText && matchesSemestre && matchesPpc;

            if (matches) {
                item.classList.remove("hidden");
                visibleCount++;
            } else {
                item.classList.add("hidden");
            }
        });

        if (counter) {
            counter.textContent = visibleCount;
        }

        const hasItems = items.length > 0;
        const noVisibleItems = visibleCount === 0;
        const hasAnyFilter =
            term !== "" ||
            semestreSelecionado !== "" ||
            ppcSelecionado !== "";

        if (emptySearchState) {
            if (hasItems && noVisibleItems && hasAnyFilter) {
                emptySearchState.classList.remove("hidden");
            } else {
                emptySearchState.classList.add("hidden");
            }
        }

        if (initialEmptyState && hasItems) {
            initialEmptyState.classList.add("hidden");
        }

        salvarEstadoFiltros();
    }

    if (filterInput) filterInput.addEventListener("input", aplicarFiltros);
    if (filterSemestre) filterSemestre.addEventListener("change", aplicarFiltros);
    if (filterPpc) filterPpc.addEventListener("change", aplicarFiltros);

    restaurarEstadoFiltros();
    aplicarFiltros();

    document.querySelectorAll(".edit-form, .new-disciplina-form, .equivalencia-form, .equivalencia-remove-form, .pre-requisito-form, .creditos-minimos-form, .pre-requisito-remove-form").forEach((form) => {
        form.addEventListener("submit", () => {
            salvarEstadoFiltros();
        });
    });

    /* =========================================================
       MODAL DE EQUIVALÊNCIAS
    ========================================================= */
    const equivalenciasModal = document.getElementById("equivalenciasModal");
    const equivalenciasModalTitle = document.getElementById("equivalenciasModalTitle");
    const equivalenciasModalSubtitle = document.getElementById("equivalenciasModalSubtitle");
    const equivalenciasList = document.getElementById("equivalenciasList");
    const equivalenciaForm = document.getElementById("equivalenciaForm");
    const equivalenciaSelect = document.getElementById("equivalenciaSelect");
    const closeEquivalenciasModal = document.getElementById("closeEquivalenciasModal");
    const openEquivalenciasButtons = document.querySelectorAll(".open-equivalencias-modal");

    function abrirModalEquivalencias() {
        equivalenciasModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function fecharModalEquivalencias() {
        equivalenciasModal.classList.remove("active");
        document.body.style.overflow = "";
        equivalenciasList.innerHTML = "";
        equivalenciaSelect.innerHTML = `<option value="" disabled selected hidden>Selecione a disciplina equivalente</option>`;
    }

    function renderizarEquivalencias(data) {
        equivalenciasModalTitle.textContent = "Disciplinas equivalentes";
        equivalenciasModalSubtitle.textContent =
            `${data.disciplina.nome} • ${data.disciplina.curso_nome} • PPC ${data.disciplina.ppc_codigo}`;

        equivalenciasList.innerHTML = "";

        if (!data.equivalencias.length) {
            equivalenciasList.innerHTML = `<div class="equivalencia-empty">Nenhuma equivalência cadastrada para esta disciplina.</div>`;
        } else {
            data.equivalencias.forEach((eq) => {
                const item = document.createElement("div");
                item.className = "equivalencia-item";

                item.innerHTML = `
                    <div class="equivalencia-item-info">
                        <strong>${eq.nome}</strong>
                        <span>${eq.curso_nome} • PPC ${eq.ppc_codigo}</span>
                    </div>
                    <form
                        method="POST"
                        action="/admin/disciplinas/${data.disciplina.id}/equivalencias/${eq.disciplina_id}/excluir"
                        class="equivalencia-remove-form"
                    >
                        <button type="submit" class="btn btn-danger icon-only" title="Remover equivalência">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </form>
                `;

                equivalenciasList.appendChild(item);
            });
        }

        equivalenciaSelect.innerHTML = `<option value="" disabled selected hidden>Selecione a disciplina equivalente</option>`;

        if (!data.disponiveis.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Nenhuma disciplina extra disponível neste mesmo PPC";
            option.disabled = true;
            equivalenciaSelect.appendChild(option);
        } else {
            data.disponiveis.forEach((disc) => {
                const option = document.createElement("option");
                option.value = disc.id;
                option.textContent = `${disc.nome} • ${disc.curso_nome} - PPC ${disc.ppc_codigo}`;
                equivalenciaSelect.appendChild(option);
            });
        }

        equivalenciaForm.action = `/admin/disciplinas/${data.disciplina.id}/equivalencias/adicionar`;
    }

    async function carregarEquivalencias(disciplinaId) {
        const response = await fetch(`/admin/disciplinas/${disciplinaId}/equivalencias/json`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Não foi possível carregar as equivalências.");
        }

        renderizarEquivalencias(data);
    }

    openEquivalenciasButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const disciplinaId = button.dataset.disciplinaId;
            equivalenciasList.innerHTML = `<div class="equivalencia-empty">Carregando equivalências...</div>`;
            abrirModalEquivalencias();

            try {
                await carregarEquivalencias(disciplinaId);
            } catch (error) {
                equivalenciasList.innerHTML = `<div class="equivalencia-empty">${error.message}</div>`;
            }
        });
    });

    if (closeEquivalenciasModal) {
        closeEquivalenciasModal.addEventListener("click", fecharModalEquivalencias);
    }

    if (equivalenciasModal) {
        equivalenciasModal.addEventListener("click", (event) => {
            if (event.target === equivalenciasModal) {
                fecharModalEquivalencias();
            }
        });
    }

    /* =========================================================
       MODAL DE PRÉ-REQUISITOS
    ========================================================= */
    const preRequisitosModal = document.getElementById("preRequisitosModal");
    const preRequisitosModalTitle = document.getElementById("preRequisitosModalTitle");
    const preRequisitosModalSubtitle = document.getElementById("preRequisitosModalSubtitle");
    const preRequisitosList = document.getElementById("preRequisitosList");
    const preRequisitoForm = document.getElementById("preRequisitoForm");
    const preRequisitoSelect = document.getElementById("preRequisitoSelect");
    const creditosMinimosForm = document.getElementById("creditosMinimosForm");
    const creditosMinimosInput = document.getElementById("creditosMinimosInput");
    const closePreRequisitosModal = document.getElementById("closePreRequisitosModal");
    const openPreRequisitosButtons = document.querySelectorAll(".open-pre-requisitos-modal");

    function abrirModalPreRequisitos() {
        preRequisitosModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function fecharModalPreRequisitos() {
        preRequisitosModal.classList.remove("active");
        document.body.style.overflow = "";
        preRequisitosList.innerHTML = "";
        preRequisitoSelect.innerHTML = `<option value="" disabled selected hidden>Selecione a disciplina pré-requisito</option>`;
        creditosMinimosInput.value = "";
    }

    function renderizarPreRequisitos(data) {
        preRequisitosModalTitle.textContent = "Pré-requisitos da disciplina";
        preRequisitosModalSubtitle.textContent =
            `${data.disciplina.nome} • ${data.disciplina.curso_nome} • PPC ${data.disciplina.ppc_codigo}`;

        preRequisitosList.innerHTML = "";

        if (!data.pre_requisitos.length && (data.creditos_minimos === null || data.creditos_minimos === undefined)) {
            preRequisitosList.innerHTML = `<div class="equivalencia-empty">Nenhum pré-requisito cadastrado para esta disciplina.</div>`;
        } else {
            if (data.pre_requisitos.length) {
                data.pre_requisitos.forEach((pr) => {
                    const item = document.createElement("div");
                    item.className = "equivalencia-item";

                    item.innerHTML = `
                        <div class="equivalencia-item-info">
                            <strong>${pr.nome}</strong>
                            <span>${pr.curso_nome} • PPC ${pr.ppc_codigo}</span>
                        </div>
                        <form
                            method="POST"
                            action="/admin/disciplinas/pre-requisitos/${pr.id}/excluir"
                            class="pre-requisito-remove-form"
                        >
                            <button type="submit" class="btn btn-danger icon-only" title="Remover pré-requisito">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </form>
                    `;
                    preRequisitosList.appendChild(item);
                });
            }

            if (data.creditos_minimos !== null && data.creditos_minimos !== undefined) {
                const item = document.createElement("div");
                item.className = "equivalencia-item";
                item.innerHTML = `
                    <div class="equivalencia-item-info">
                        <strong>Créditos mínimos</strong>
                        <span>${data.creditos_minimos} crédito(s)</span>
                    </div>
                `;
                preRequisitosList.appendChild(item);
            }
        }

        preRequisitoSelect.innerHTML = `<option value="" disabled selected hidden>Selecione a disciplina pré-requisito</option>`;

        if (!data.disponiveis.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Nenhuma disciplina disponível neste mesmo PPC";
            option.disabled = true;
            preRequisitoSelect.appendChild(option);
        } else {
            data.disponiveis.forEach((disc) => {
                const option = document.createElement("option");
                option.value = disc.id;
                option.textContent = `${disc.nome} • ${disc.curso_nome} - PPC ${disc.ppc_codigo}`;
                preRequisitoSelect.appendChild(option);
            });
        }

        preRequisitoForm.action = `/admin/disciplinas/${data.disciplina.id}/pre-requisitos/adicionar`;
        preRequisitoForm.classList.add("pre-requisito-form");

        creditosMinimosForm.action = `/admin/disciplinas/${data.disciplina.id}/pre-requisitos/creditos`;
        creditosMinimosForm.classList.add("creditos-minimos-form");
        creditosMinimosInput.value = data.creditos_minimos ?? "";
    }

    async function carregarPreRequisitos(disciplinaId) {
        const response = await fetch(`/admin/disciplinas/${disciplinaId}/pre-requisitos/json`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Não foi possível carregar os pré-requisitos.");
        }

        renderizarPreRequisitos(data);
    }

    openPreRequisitosButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const disciplinaId = button.dataset.disciplinaId;
            preRequisitosList.innerHTML = `<div class="equivalencia-empty">Carregando pré-requisitos...</div>`;
            abrirModalPreRequisitos();

            try {
                await carregarPreRequisitos(disciplinaId);
            } catch (error) {
                preRequisitosList.innerHTML = `<div class="equivalencia-empty">${error.message}</div>`;
            }
        });
    });

    if (closePreRequisitosModal) {
        closePreRequisitosModal.addEventListener("click", fecharModalPreRequisitos);
    }

    if (preRequisitosModal) {
        preRequisitosModal.addEventListener("click", (event) => {
            if (event.target === preRequisitosModal) {
                fecharModalPreRequisitos();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && equivalenciasModal.classList.contains("active")) {
            fecharModalEquivalencias();
        }
        if (event.key === "Escape" && preRequisitosModal.classList.contains("active")) {
            fecharModalPreRequisitos();
        }
    });
});