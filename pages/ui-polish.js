/* BioWebLab · modül kullanım kolaylığı (savunmacı, mevcut JS'e dokunmaz) */
(() => {
  const toolbarButtons = ["theme-toggle", "resetProgressBtn"]
    .map(id => document.getElementById(id)).filter(Boolean);

  // Tema + sıfırla düğmelerini tek bir sabit araç çubuğunda grupla
  if (toolbarButtons.length && !document.querySelector(".module-toolbar")) {
    const bar = document.createElement("div");
    bar.className = "module-toolbar";
    toolbarButtons[0].parentNode.insertBefore(bar, toolbarButtons[0]);
    toolbarButtons.forEach(btn => bar.appendChild(btn));
  }

  const items = () => document.querySelectorAll(".menu-item, .step-btn");
  const isStacked = () => window.matchMedia("(max-width: 1100px)").matches;
  let lastActive = null;

  function syncActive() {
    const active = document.querySelector(".menu-item.active, .step-btn.active");
    if (!active || active === lastActive) return;
    const firstRun = lastActive === null;
    lastActive = active;

    // Mobilde yatay adım şeridinde aktif adımı ortala
    if (isStacked() && active.parentElement) {
      const strip = active.parentElement;
      const left = active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2;
      strip.scrollTo({ left, behavior: firstRun ? "auto" : "smooth" });
    }

    // Adım değişince içeriğin başına dön (ilk yüklemede kaydırma yapma)
    if (!firstRun) {
      const target = document.querySelector(".active-panel, .stage.active, .crispr-main");
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }
  }

  const observer = new MutationObserver(syncActive);
  const start = () => {
    items().forEach(el => observer.observe(el, { attributes: true, attributeFilter: ["class"] }));
    syncActive();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  // Sayfa açılışında otomatik kaydırma olursa (ör. CRISPR başlangıç adımı) başa dön;
  // kullanıcı henüz etkileşime girmediyse hero/başlık görünür kalsın.
  let touched = false;
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(evt =>
    window.addEventListener(evt, () => { touched = true; }, { once: true, passive: true }));
  // Açılış sonrası ilk ~1.5 sn boyunca (kullanıcı dokunmadıysa) otomatik kaydırmaları geri al
  const settleUntil = performance.now() + 1500;
  const keepTop = () => {
    if (!touched && performance.now() < settleUntil && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  window.addEventListener("scroll", keepTop, { passive: true });
  window.addEventListener("load", () => setTimeout(keepTop, 80));
})();

/* Erişilebilirlik: kilitli adımları, başlık sırasını ve etiketsiz form alanlarını düzelt */
(() => {
  const sync = () => document.querySelectorAll(".menu-item, .step-btn").forEach(b => {
    b.setAttribute("aria-disabled", b.classList.contains("locked") ? "true" : "false");
  });
  const init = () => {
    sync();
    const mo = new MutationObserver(sync);
    document.querySelectorAll(".menu-item, .step-btn").forEach(b => mo.observe(b, { attributes: true, attributeFilter: ["class"] }));
    // h1 → h3 atlaması: ekran okuyucular için düzey 2 olarak bildir
    document.querySelectorAll(".hero-info > h3").forEach(h => h.setAttribute("aria-level", "2"));
    // for özniteliği olmayan <label> + hemen ardından gelen alan → ilişkilendir
    document.querySelectorAll("label:not([for])").forEach(l => {
      if (l.querySelector("input,select,textarea")) return;
      const n = l.nextElementSibling;
      if (n && /^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) {
        if (!n.id) n.id = "bwl-f-" + Math.random().toString(36).slice(2, 7);
        l.htmlFor = n.id;
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
