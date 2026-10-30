(() => {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const storageKey = "theme";
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: light)");

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return systemTheme?.matches ? "light" : "dark";
  }

  function applyTheme(theme, save = true) {
    const isLight = theme === "light";
    root.setAttribute("data-theme", isLight ? "light" : "dark");
    if (toggle) {
      toggle.textContent = isLight ? "☀️" : "🌙";
      toggle.setAttribute("aria-pressed", String(isLight));
      const label = isLight ? "Koyu temaya geç" : "Açık temaya geç";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    }
    if (save) {
      try { localStorage.setItem(storageKey, theme); } catch {}
    }
  }

  applyTheme(getInitialTheme(), false);
  toggle?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  });
})();