// =========================
// ELEMENTOS PRINCIPAIS
// =========================
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById("login");

// =========================
// FUNÇÃO PARA LIMPAR FORMULÁRIOS
// =========================
function limparFormularios() {
    const forms = container.querySelectorAll("form");
    forms.forEach(form => form.reset());

    if (courseSelect) {
        courseSelect.value = "";
        updateSelectColor(courseSelect);
    }

    if (ppcSelect) {
        ppcSelect.innerHTML = `
            <option value="" disabled selected hidden>PPC</option>
        `;
        ppcSelect.disabled = true;
        ppcSelect.value = "";
        updateSelectColor(ppcSelect);
    }
}

// =========================
// EVENTOS DE TOGGLE ENTRE LOGIN E REGISTRO
// =========================

// Ao clicar no botão de registro
registerBtn.addEventListener('click', () => {
    fecharMenu();
    container.classList.add("active");
    limparFormularios();
});

loginBtn.addEventListener('click', () => {
    fecharMenu();
    container.classList.remove("active");
    limparFormularios();
    validarFormularioRegistro();
});

// =========================
// FUNÇÃO PARA MOSTRAR/ESCONDER SENHA
// =========================
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    icon.addEventListener("click", () => {
        if (input.type === "password") {
            input.type = "text"; // Mostra a senha
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password"; // Esconde a senha
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
}

// Inicializa o toggle de senha para os dois formulários
togglePassword("senhaRegistro", "toggleSenhaRegistro");
togglePassword("senhaLogin", "toggleSenhaLogin");

const courseSelect = document.getElementById("courseSelect");
const ppcSelect = document.getElementById("ppcSelect");

function updateSelectColor(select) {
    if (!select || select.value === "") {
        select.classList.remove("valid");
    } else {
        select.classList.add("valid");
    }
}

if (courseSelect && ppcSelect) {
    const allPpcOptions = Array.from(ppcSelect.querySelectorAll("option"))
        .filter(option => option.value !== "");

    function resetPpcOptions() {
        ppcSelect.innerHTML = `
            <option value="" disabled selected hidden>PPC</option>
        `;
        ppcSelect.disabled = true;
        ppcSelect.value = "";
        updateSelectColor(ppcSelect);
    }

    resetPpcOptions();
    updateSelectColor(courseSelect);

    courseSelect.addEventListener("change", function () {
        const selectedCourse = this.value;

        ppcSelect.innerHTML = `
            <option value="" disabled selected hidden>PPC</option>
        `;
        ppcSelect.disabled = false;

        const filteredOptions = allPpcOptions.filter(option =>
            option.dataset.course === selectedCourse
        );

        filteredOptions.forEach(option => {
            ppcSelect.appendChild(option.cloneNode(true));
        });

        if (filteredOptions.length === 0) {
            resetPpcOptions();
        }

        updateSelectColor(courseSelect);
        updateSelectColor(ppcSelect);
    });

    ppcSelect.addEventListener("change", function () {
        updateSelectColor(ppcSelect);
    });
}

// =========================
// VALIDAÇÃO DO FORMULÁRIO DE REGISTRO
// - Habilita o botão apenas quando tudo estiver válido
// =========================
const registerName = document.getElementById("registerName");
const registerRegistration = document.getElementById("registerRegistration");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("senhaRegistro");
const registerSubmit = document.getElementById("registerSubmit");

/* Valida email com apoio da validação nativa do navegador */
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* Valida matrícula com exatamente 7 números */
function matriculaValida(matricula) {
    return /^\d{7}$/.test(matricula.trim());
}

/* Atualiza estado do botão de registrar */
function validarFormularioRegistro() {
    if (
        !registerName ||
        !registerRegistration ||
        !registerEmail ||
        !registerPassword ||
        !courseSelect ||
        !ppcSelect ||
        !registerSubmit
    ) {
        return;
    }

    const nomeOk = registerName.value.trim() !== "";
    const matriculaOk = matriculaValida(registerRegistration.value);
    const emailOk = registerEmail.value.trim() !== "" && emailValido(registerEmail.value);
    const senhaOk = registerPassword.value.trim() !== "";
    const cursoOk = courseSelect.value !== "";
    const ppcOk = ppcSelect.value !== "";

    registerSubmit.disabled = !(nomeOk && matriculaOk && emailOk && senhaOk && cursoOk && ppcOk);
}

/* Impede letras no campo matrícula */
if (registerRegistration) {
    registerRegistration.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 7);
        validarFormularioRegistro();
    });
}

/* Eventos dos demais campos */
[registerName, registerEmail, registerPassword, courseSelect, ppcSelect].forEach(campo => {
    if (campo) {
        campo.addEventListener("input", validarFormularioRegistro);
        campo.addEventListener("change", validarFormularioRegistro);
    }
});

/* Valida ao carregar */
validarFormularioRegistro();

// =========================
// AUTO REMOVER MENSAGENS FLASH
// =========================
setTimeout(() => {
    document.querySelectorAll(".flash-message").forEach(msg => {
        msg.classList.add("hide");

        // remove do DOM depois da animação
        setTimeout(() => {
            msg.remove();
        }, 400);
    });
}, 3000); // tempo que fica visível (3 segundos)

document.querySelectorAll(".close-flash").forEach(btn => {
    btn.addEventListener("click", () => {
        const msg = btn.parentElement;
        msg.classList.add("hide");
        setTimeout(() => msg.remove(), 400);
    });
});

const menuScreen = document.getElementById("menuScreen");
const backToLoginBtn = document.getElementById("backToLogin");
const usuarioLogado = window.usuarioLogado === true || window.usuarioLogado === "true";

function abrirMenu() {
    container.classList.remove("active");
    container.classList.add("show-menu");
}

function fecharMenu() {
    container.classList.remove("show-menu");
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
        fecharMenu();
        container.classList.remove("active");
    });
}
if (usuarioLogado && !container.classList.contains("show-menu")) {
    abrirMenu();
}