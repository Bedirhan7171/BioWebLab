
(() => {
  const themeToggleBtn = document.getElementById("theme-toggle");

  if (!themeToggleBtn) return;

  const root = document.documentElement;
  const storageKey = "theme";
  const systemTheme = window.matchMedia?.(
    "(prefers-color-scheme: light)"
  );

  function getInitialTheme() {
    try {
      const savedTheme = localStorage.getItem(storageKey);

      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch {
      // Depolama kullanılamıyorsa varsayılan temayla devam et.
    }

    return systemTheme?.matches ? "light" : "dark";
  }

  function applyTheme(theme, save = true) {
    const isLight = theme === "light";

    if (isLight) {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }

    themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
    themeToggleBtn.setAttribute("aria-pressed", String(isLight));
    themeToggleBtn.setAttribute(
      "aria-label",
      isLight ? "Koyu temaya geç" : "Açık temaya geç"
    );
    themeToggleBtn.title = isLight
      ? "Koyu temaya geç"
      : "Açık temaya geç";

    if (save) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Tema çalışmaya devam eder; yalnızca kalıcı kayıt yapılamaz.
      }
    }
  }

  applyTheme(getInitialTheme(), false);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme =
      root.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";

    applyTheme(currentTheme === "light" ? "dark" : "light");
  });
})();
