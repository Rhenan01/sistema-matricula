document.addEventListener("DOMContentLoaded", () => {
    const flashes = document.querySelectorAll(".flash-message");
    flashes.forEach((flash) => {
        const close = flash.querySelector(".flash-close");
        if (close) close.addEventListener("click", () => flash.remove());
        setTimeout(() => {
            if (flash.parentNode) flash.remove();
        }, 4000);
    });

    const horarioModal = document.getElementById("horarioModal");
    const horarioForm = document.getElementById("horarioForm");
    const horarioTitle = document.getElementById("horarioModalTitle");
    const horarioSubtitle = document.getElementById("horarioModalSubtitle");
    const submitHorarioBtn = document.getElementById("submitHorarioBtn");
    const cancelHorarioModal = document.getElementById("cancelHorarioModal");
    const openAddHorarioModal = document.getElementById("openAddHorarioModal");
    const openEditHorarioButtons = document.querySelectorAll(".openEditHorarioModal");

    const horarioPpcId = document.getElementById("horarioPpcId");
    const horarioDisciplina = document.getElementById("horarioDisciplina");
    const horarioDia = document.getElementById("horarioDia");
    const horarioBlocoInicio = document.getElementById("horarioBlocoInicio");
    const horarioQuantidadeBlocos = document.getElementById("horarioQuantidadeBlocos");

    function openHorarioModal() {
        horarioModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeHorarioModal() {
        horarioModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    function resetHorarioForm() {
        horarioForm.reset();
    }

    if (openAddHorarioModal) {
        openAddHorarioModal.addEventListener("click", () => {
            resetHorarioForm();
            horarioTitle.textContent = "Novo horário";
            horarioSubtitle.textContent = "Configure o horário da disciplina selecionada.";
            submitHorarioBtn.textContent = "Salvar horário";
            horarioForm.action = "/admin/horarios/adicionar";
            openHorarioModal();
        });
    }

    openEditHorarioButtons.forEach((button) => {
        button.addEventListener("click", () => {
            horarioTitle.textContent = "Editar horário";
            horarioSubtitle.textContent = "Atualize os dados do horário selecionado.";
            submitHorarioBtn.textContent = "Atualizar horário";

            const horarioId = button.dataset.horarioId;
            horarioForm.action = `/admin/horarios/editar/${horarioId}`;

            horarioPpcId.value = button.dataset.ppcId || "";
            horarioDisciplina.value = button.dataset.disciplinaId || "";
            horarioDia.value = button.dataset.diaSemanaId || "";
            horarioBlocoInicio.value = button.dataset.blocoInicio || "";
            horarioQuantidadeBlocos.value = button.dataset.quantidadeBlocos || "";

            openHorarioModal();
        });
    });

    if (cancelHorarioModal) {
        cancelHorarioModal.addEventListener("click", closeHorarioModal);
    }

    if (horarioModal) {
        horarioModal.addEventListener("click", (event) => {
            if (event.target === horarioModal) {
                closeHorarioModal();
            }
        });
    }

    const deleteHorarioModal = document.getElementById("deleteHorarioModal");
    const deleteHorarioText = document.getElementById("deleteHorarioText");
    const cancelDeleteHorario = document.getElementById("cancelDeleteHorario");
    const confirmDeleteHorario = document.getElementById("confirmDeleteHorario");
    const openDeleteHorarioButtons = document.querySelectorAll(".openDeleteHorarioModal");

    let deleteHorarioForm = null;

    function openDeleteModal(form, nome) {
        deleteHorarioForm = form;
        deleteHorarioText.textContent = `Tem certeza que deseja excluir o horário da disciplina "${nome}"?`;
        deleteHorarioModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeDeleteModal() {
        deleteHorarioModal.classList.remove("active");
        document.body.style.overflow = "";
        deleteHorarioForm = null;
    }

    openDeleteHorarioButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const form = button.closest(".delete-horario-form");
            const nome = button.dataset.disciplinaNome || "selecionada";
            openDeleteModal(form, nome);
        });
    });

    if (cancelDeleteHorario) {
        cancelDeleteHorario.addEventListener("click", closeDeleteModal);
    }

    if (confirmDeleteHorario) {
        confirmDeleteHorario.addEventListener("click", () => {
            if (deleteHorarioForm) deleteHorarioForm.submit();
        });
    }

    if (deleteHorarioModal) {
        deleteHorarioModal.addEventListener("click", (event) => {
            if (event.target === deleteHorarioModal) {
                closeDeleteModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (horarioModal.classList.contains("active")) closeHorarioModal();
            if (deleteHorarioModal.classList.contains("active")) closeDeleteModal();
        }
    });
});

const toggleAllSemestersBtn = document.getElementById("toggleAllSemesters");
const semesterSections = document.querySelectorAll(".schedule-section");

function updateToggleAllSemestersButton() {
    if (!toggleAllSemestersBtn || semesterSections.length === 0) return;

    const allOpen = Array.from(semesterSections).every((section) => section.open);

    toggleAllSemestersBtn.innerHTML = allOpen
        ? '<i class="fa-solid fa-compress"></i> Recolher todos'
        : '<i class="fa-solid fa-expand"></i> Expandir todos';
}

if (toggleAllSemestersBtn && semesterSections.length > 0) {
    toggleAllSemestersBtn.addEventListener("click", () => {
        const allOpen = Array.from(semesterSections).every((section) => section.open);

        semesterSections.forEach((section) => {
            section.open = !allOpen;
        });

        updateToggleAllSemestersButton();
    });

    semesterSections.forEach((section) => {
        section.addEventListener("toggle", updateToggleAllSemestersButton);
    });

    updateToggleAllSemestersButton();
}