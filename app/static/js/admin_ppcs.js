document.addEventListener("DOMContentLoaded", () => {
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

    function openDeleteModal(form, ppcName) {
        formToDelete = form;
        deleteModalText.textContent = `Tem certeza que deseja excluir "${ppcName}"? Essa ação não poderá ser desfeita.`;
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
            const ppcName = form.dataset.ppcName || "o PPC selecionado";
            openDeleteModal(form, ppcName);
        });
    });

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (formToDelete) {
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
       FILTRO LOCAL DE PPCS
    ========================================================= */
    const filterInput = document.getElementById("filtroPpcs");
    const ppcItems = document.querySelectorAll(".ppc-item");
    const counter = document.getElementById("contadorPpcs");
    const emptySearchState = document.getElementById("emptySearchState");
    const initialEmptyState = document.getElementById("estadoVazio");

    if (filterInput) {
        filterInput.addEventListener("input", () => {
            const term = filterInput.value.trim().toLowerCase();
            let visibleCount = 0;

            ppcItems.forEach((item) => {
                const code = item.dataset.ppcCode || "";
                const course = item.dataset.ppcCourse || "";
                const matches = code.includes(term) || course.includes(term);

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

            const hasPpcs = ppcItems.length > 0;
            const noVisiblePpcs = visibleCount === 0;

            if (emptySearchState) {
                if (hasPpcs && noVisiblePpcs && term !== "") {
                    emptySearchState.classList.remove("hidden");
                } else {
                    emptySearchState.classList.add("hidden");
                }
            }

            if (initialEmptyState && hasPpcs) {
                initialEmptyState.classList.add("hidden");
            }
        });
    }
});