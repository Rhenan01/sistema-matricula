(function () {
    const THEME_KEY = "sistema_matricula_theme";
    const DEFAULT_THEME = "theme-dark";

    function applyTheme(theme) {
        document.body.classList.remove("theme-dark", "theme-light");
        document.body.classList.add(theme);
        localStorage.setItem(THEME_KEY, theme);
        updateThemeButtons(theme);
    }

    function updateThemeButtons(theme) {
        const isLight = theme === "theme-light";

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.innerHTML = isLight
                ? '<span>🌙</span><span>Modo escuro</span>'
                : '<span>☀️</span><span>Modo claro</span>';

            button.setAttribute(
                "title",
                isLight ? "Ativar modo escuro" : "Ativar modo claro"
            );
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
        applyTheme(savedTheme);

        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                const nextTheme = document.body.classList.contains("theme-light")
                    ? "theme-dark"
                    : "theme-light";

                applyTheme(nextTheme);
            });
        });
    });
})();