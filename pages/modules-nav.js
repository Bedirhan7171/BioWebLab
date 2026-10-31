(() => {
  const modules = [
    { id: "adli-tip", label: "Adli Tıp", short: "Adli Tıp", icon: "🧬", href: "adli-tip.html" },
    { id: "crispr", label: "CRISPR-Cas9", short: "CRISPR", icon: "✂️", href: "crispr.html" },
    { id: "protein", label: "Protein Mühendisliği", short: "Protein", icon: "🧪", href: "protein.html" }
  ];

  const pathFile = location.pathname.split("/").pop();
  const isHome = !pathFile || /^index\.html?$/i.test(pathFile);
  const base = isHome ? "pages/" : "";
  const homeHref = isHome ? "#top" : "../index.html";
  modules.forEach(item => { item.href = base + item.href; });
  const file = isHome ? "" : pathFile.replace(/\.html?$/i, "");
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

  const spacer = document.createElement("div");
  spacer.className = "module-dock-spacer";
  spacer.setAttribute("aria-hidden", "true");
  document.body.appendChild(spacer);
  document.body.appendChild(nav);
})();