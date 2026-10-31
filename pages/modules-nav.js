(() => {
  const modules = [
    { id: "adli-tip", label: "Adli Tıp", short: "Adli Tıp", icon: "🧬", href: "adli-tip.html" },
    { id: "crispr", label: "CRISPR-Cas9", short: "CRISPR", icon: "✂️", href: "crispr.html" },
    { id: "protein", label: "Protein Mühendisliği", short: "Protein", icon: "🧪", href: "protein.html" }
  ];

  const file = location.pathname.split("/").pop().replace(/\.html?$/i, "");
  const active = modules.find(item => item.id === file)?.id || file;
  const nav = document.createElement("nav");
  nav.className = "module-dock";
  nav.setAttribute("aria-label", "Modüller arası hızlı geçiş");

  const brand = document.createElement("a");
  brand.className = "module-dock-brand";
  brand.href = homeHref;
  brand.innerHTML = '<span class="module-dock-brand-icon">🧬</span><span>Bio<span>Web</span>Lab</span>';
  brand.setAttribute("aria-label", "BioWebLab ana sayfa");
  nav.appendChild(brand);

  const links = document.createElement("div");
  links.className = "module-dock-links";
  modules.forEach(item => {
    const link = document.createElement("a");
    link.className = "module-dock-link" + (item.id === active ? " is-active" : "");
    link.href = item.href;
    link.setAttribute("aria-label", item.label + (item.id === active ? " — açık modül" : " modülüne geç"));
    if (item.id === active) link.setAttribute("aria-current", "page");
    link.innerHTML = '<span class="module-dock-icon" aria-hidden="true">' + item.icon + '</span><span class="module-dock-label">' + item.short + '</span>' + (item.id === active ? '<span class="module-dock-dot" aria-hidden="true"></span>' : '');
    link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (item.id === active) return;
      document.body.classList.add("module-leaving");
      window.setTimeout(() => { location.href = link.href; }, 130);
    });
    links.appendChild(link);
  });
  nav.appendChild(links);

  const home = document.createElement("a");
  home.className = "module-dock-home";
  home.href = homeHref;
  home.innerHTML = '<span aria-hidden="true">⌂</span><span>Ana Sayfa</span>';
  nav.appendChild(home);

  const theme = document.createElement("button");
  theme.type = "button";
  theme.className = "module-dock-theme";
  theme.setAttribute("aria-label", "Tema değiştir");
  theme.title = "Açık / koyu temayı değiştir";
  theme.innerHTML = '<span aria-hidden="true">◐</span>';
  theme.addEventListener("click", () => {
    if (typeof window.toggleTheme === "function") {
      window.toggleTheme();
    } else {
      const light = document.documentElement.getAttribute("data-theme") !== "light";
      document.documentElement.setAttribute("data-theme", light ? "light" : "dark");
      try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (error) {}
      theme.innerHTML = light ? '<span aria-hidden="true">☀️</span>' : '<span aria-hidden="true">🌙</span>';
    }
  });
  theme.innerHTML = (document.documentElement.getAttribute("data-theme") === "light") ? '<span aria-hidden="true">☀️</span>' : '<span aria-hidden="true">🌙</span>';
  nav.appendChild(theme);

  const spacer = document.createElement("div");
  spacer.className = "module-dock-spacer";
  spacer.setAttribute("aria-hidden", "true");
  document.body.appendChild(spacer);
  document.body.appendChild(nav);
})();