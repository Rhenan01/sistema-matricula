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
       RELAÇÃO CURSO -> PPC
    ========================================================= */
    function inicializarCursoPpc(container) {
        const cursoSelect = container.querySelector('[data-role="curso-select"]');
        const ppcSelect = container.querySelector('[data-role="ppc-select"]');

        if (!cursoSelect || !ppcSelect) return;

        const opcoesOriginais = Array.from(ppcSelect.querySelectorAll("option"))
            .filter((option) => option.value !== "")
            .map((option) => ({
                value: option.value,
                text: option.textContent,
                cursoId: option.dataset.cursoId || ""
            }));

        const valorInicialPpc = ppcSelect.value;

        function atualizarPpcs(resetSelection = false) {
            const cursoSelecionado = cursoSelect.value;
            const valorAtual = resetSelection ? "" : ppcSelect.value || valorInicialPpc;

            ppcSelect.innerHTML = '<option value="">PPC</option>';

            const opcoesFiltradas = opcoesOriginais.filter(
                (opcao) => String(opcao.cursoId) === String(cursoSelecionado)
            );

            opcoesFiltradas.forEach((opcao) => {
                const option = document.createElement("option");
                option.value = opcao.value;
                option.textContent = opcao.text;
                option.dataset.cursoId = opcao.cursoId;

                if (String(opcao.value) === String(valorAtual)) {
                    option.selected = true;
                }

                ppcSelect.appendChild(option);
            });

            const encontrouValor = opcoesFiltradas.some(
                (opcao) => String(opcao.value) === String(valorAtual)
            );

            if (!encontrouValor) {
                ppcSelect.value = "";
            }
        }

        cursoSelect.addEventListener("change", () => atualizarPpcs(true));
        atualizarPpcs(false);
    }

    const createForm = document.querySelector(".create-user-form");
    if (createForm) {
        inicializarCursoPpc(createForm);
    }

    const editFormsCursoPpc = document.querySelectorAll(".edit-user-form");
    editFormsCursoPpc.forEach((form) => inicializarCursoPpc(form));

    /* =========================================================
       VALIDAÇÃO
    ========================================================= */
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    function limparErro(field) {
        if (!field) return;
        field.classList.remove("field-invalid");
        const errorEl = field.parentElement?.querySelector(".field-error");
        if (errorEl) errorEl.textContent = "";
    }

    function setarErro(field, mensagem) {
        if (!field) return;
        field.classList.add("field-invalid");
        const errorEl = field.parentElement?.querySelector(".field-error");
        if (errorEl) errorEl.textContent = mensagem;
    }

    function validarCampoNome(input) {
        limparErro(input);
        if (!input.value.trim()) {
            setarErro(input, "Informe o nome.");
            return false;
        }
        return true;
    }

    function validarCampoEmail(input) {
        limparErro(input);
        const valor = input.value.trim();
        if (!valor) {
            setarErro(input, "Informe o e-mail.");
            return false;
        }
        if (!emailRegex.test(valor)) {
            setarErro(input, "Informe um e-mail válido.");
            return false;
        }
        return true;
    }

    function validarCampoMatricula(input) {
        limparErro(input);
        const valor = input.value.trim();

        if (!valor) {
            setarErro(input, "Informe a matrícula.");
            return false;
        }

        if (!/^\d{7}$/.test(valor)) {
            setarErro(input, "A matrícula deve ter exatamente 7 números.");
            return false;
        }

        return true;
    }

    function validarCampoSenhaCadastro(input) {
        limparErro(input);
        if (!input.value.trim()) {
            setarErro(input, "Informe a senha inicial.");
            return false;
        }
        return true;
    }

    function validarCampoSelect(select, label) {
        limparErro(select);
        if (!select.value) {
            setarErro(select, `Selecione ${label}.`);
            return false;
        }
        return true;
    }

    function aplicarRestricaoMatricula(input) {
        if (!input) return;

        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "").slice(0, 7);
            limparErro(input);
        });

        input.addEventListener("blur", () => {
            validarCampoMatricula(input);
        });
    }

    function inicializarValidacaoFormulario(form, isCadastro = false) {
        if (!form) return;

        const nome = form.querySelector('input[name="nome"]');
        const email = form.querySelector('input[name="email"]');
        const matricula = form.querySelector('input[name="matricula"]');
        const senha = form.querySelector('input[name="senha"]');
        const curso = form.querySelector('select[name="curso_id"]');
        const ppc = form.querySelector('select[name="ppc_id"]');

        if (nome) {
            nome.addEventListener("input", () => limparErro(nome));
            nome.addEventListener("blur", () => validarCampoNome(nome));
        }

        if (email) {
            email.addEventListener("input", () => limparErro(email));
            email.addEventListener("blur", () => validarCampoEmail(email));
        }

        if (matricula) {
            aplicarRestricaoMatricula(matricula);
        }

        if (senha && isCadastro) {
            senha.addEventListener("input", () => limparErro(senha));
            senha.addEventListener("blur", () => validarCampoSenhaCadastro(senha));
        }

        if (curso) {
            curso.addEventListener("change", () => limparErro(curso));
        }

        if (ppc) {
            ppc.addEventListener("change", () => limparErro(ppc));
        }

        form.addEventListener("submit", (event) => {
            let valido = true;

            if (!validarCampoNome(nome)) valido = false;
            if (!validarCampoEmail(email)) valido = false;
            if (!validarCampoMatricula(matricula)) valido = false;
            if (!validarCampoSelect(curso, "um curso")) valido = false;
            if (!validarCampoSelect(ppc, "um PPC")) valido = false;

            if (isCadastro && !validarCampoSenhaCadastro(senha)) valido = false;

            if (!valido) {
                event.preventDefault();
            }
        });
    }

    if (createForm) {
        inicializarValidacaoFormulario(createForm, true);
    }

    const editForms = document.querySelectorAll(".js-user-form");
    editForms.forEach((form) => inicializarValidacaoFormulario(form, false));

    /* =========================================================
       FILTRO LOCAL DE USUÁRIOS
    ========================================================= */
    const filterInput = document.getElementById("filtroUsuarios");
    const userCards = document.querySelectorAll("[data-user-card]");
    const counter = document.getElementById("contadorUsuarios");
    const emptySearchState = document.getElementById("emptySearchStateUsuarios");
    const usersList = document.getElementById("usuariosList");

    function atualizarContador(quantidade) {
        if (!counter) return;
        counter.textContent = `${quantidade} usuário(s)`;
    }

    if (filterInput) {
        filterInput.addEventListener("input", () => {
            const termo = filterInput.value.trim().toLowerCase();
            let visiveis = 0;

            userCards.forEach((card) => {
                const baseBusca = card.dataset.search || "";
                const corresponde = baseBusca.includes(termo);

                if (corresponde) {
                    card.classList.remove("hidden");
                    visiveis++;
                } else {
                    card.classList.add("hidden");
                }
            });

            atualizarContador(visiveis);

            if (emptySearchState) {
                if (visiveis === 0 && userCards.length > 0) {
                    emptySearchState.classList.remove("hidden");
                } else {
                    emptySearchState.classList.add("hidden");
                }
            }

            if (usersList && userCards.length === 0 && emptySearchState) {
                emptySearchState.classList.add("hidden");
            }
        });
    }

    /* =========================================================
       MODAL DE EXCLUSÃO
    ========================================================= */
    const deleteModal = document.getElementById("deleteModal");
    const deleteModalText = document.getElementById("deleteModalText");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    const cancelDeleteBtn = document.getElementById("cancelDelete");
    const openDeleteButtons = document.querySelectorAll(".open-delete-modal");

    let formToDelete = null;

    function openDeleteModal(formId, userName) {
        formToDelete = document.getElementById(formId);

        if (deleteModalText) {
            deleteModalText.textContent = `Tem certeza que deseja excluir o usuário "${userName}"? Essa ação não poderá ser desfeita.`;
        }

        if (deleteModal) {
            deleteModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }

    function closeDeleteModal() {
        if (deleteModal) {
            deleteModal.classList.remove("active");
        }

        formToDelete = null;
        document.body.style.overflow = "";
    }

    openDeleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const formId = button.dataset.formId;
            const userName = button.dataset.userName || "selecionado";
            openDeleteModal(formId, userName);
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
        if (event.key === "Escape" && deleteModal && deleteModal.classList.contains("active")) {
            closeDeleteModal();
        }
    });
});