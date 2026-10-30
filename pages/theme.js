(() => {
  const root = document.documentElement;
  const storageKey = "theme";
  const systemTheme = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {}
    return systemTheme && systemTheme.matches ? "light" : "dark";
  }

  function applyTheme(theme, save) {
    const selected = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", selected);
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      const light = selected === "light";
      toggle.textContent = light ? "☀️" : "🌙";
      toggle.setAttribute("aria-pressed", String(light));
      const label = light ? "Koyu temaya geç" : "Açık temaya geç";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    }
    if (save !== false) {
      try { localStorage.setItem(storageKey, selected); } catch (error) {}
    }
  }

  window.toggleTheme = function () {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light", true);
  };

  applyTheme(getInitialTheme(), false);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.onclick = window.toggleTheme;
})();