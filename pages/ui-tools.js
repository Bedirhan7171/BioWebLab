/* ==========================================================================
   BioWebLab · Kullanım kolaylığı araçları (ana sayfa + 3 modül ortak)
   - Sözlük çekmecesi + metin içinde tıklanabilir terimler
   - Yardım ve okunabilirlik ayarları (yazı boyutu, animasyon azaltma, okuma modu)
   - Standart "Önceki / Sonraki aşama" gezinmesi ve aşama göstergesi (modüller)
   - Ana sayfada kart ilerleme durumu
   - "İçeriğe geç" bağlantısı, klavye kısayolları (? ve Esc)
   Mevcut modül kodlarına dokunmaz; yalnızca DOM'a ekleme yapar.
   ========================================================================== */
(() => {
  "use strict";

  const doc = document, root = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const IS_HOME = !!$(".module-card");

  function h(tag, props, ...kids) {
    const el = doc.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (k === "class") el.className = v;
        else if (k === "text") el.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
      }
    }
    kids.flat().forEach(c => { if (c != null) el.append(c); });
    return el;
  }

  /* ------------------------------ Tercihler ------------------------------ */
  const PREF_KEY = "bwl-prefs";
  const SIZES = [1, 1.12, 1.25];
  const prefs = { size: 0, calm: false, read: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}")); } catch (e) { /* varsayılan */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* sessiz */ } };

  function applyPrefs() {
    const z = SIZES[prefs.size] || 1;
    // Yalnızca içerik alanı büyür; kenar çubuğu ve dock sabit kalır
    $$(".app > .content, .crispr-main, main").forEach(el => { el.style.zoom = z === 1 ? "" : String(z); });
    root.classList.toggle("bwl-calm", !!prefs.calm);
    root.classList.toggle("bwl-read", !!prefs.read);
  }

  /* ------------------------------- Sözlük -------------------------------- */
  const G_GENEL = "Genel", G_PCR = "PCR ve Adli Tıp", G_CRISPR = "CRISPR", G_PROT = "Protein";
  const GLOSSARY = [
    { id: "komplementer", term: "Komplementer (tamamlayıcı) baz", g: G_GENEL, pat: "komplementer", def: "DNA'da A–T ve G–C, RNA'da A–U ve G–C baz çiftleri birbirini tamamlar. Bir zincirin dizisi, karşısındaki zincirin dizisini belirler." },
    { id: "baz-eslesmesi", term: "Baz eşleşmesi", g: G_GENEL, pat: "baz eşleşmesi", def: "DNA’da adenin (A) timinle (T), sitozin (C) guaninle (G) eşleşir. RNA’da timin yerine urasil (U) bulunur; A-U eşleşmesi görülür." },
    { id: "mutasyon", term: "Mutasyon", g: G_GENEL, pat: "mutasyon", def: "DNA dizisinde meydana gelen kalıcı değişikliktir. Bazı mutasyonlar proteinin yapısını ve işlevini bozabilir." },
    { id: "pcr", term: "PCR (Polimeraz Zincir Reaksiyonu)", g: G_PCR, pat: "PCR", cs: true, suf: false, def: "DNA'nın belirli bir bölgesini, tekrarlayan sıcaklık döngüleriyle kısa sürede milyonlarca kopyaya çoğaltan laboratuvar yöntemidir." },
    { id: "primer", term: "Primer", g: G_PCR, pat: "primer", def: "Çoğaltılacak bölgenin başlangıcına bağlanan kısa DNA parçasıdır. DNA polimeraz yeni zinciri ancak bu başlangıç noktasından itibaren sentezleyebilir." },
    { id: "buffer", term: "Buffer (tampon çözelti)", g: G_PCR, pat: "buffer|tampon çözelti", def: "PCR karışımının pH ve iyon dengesini uygun aralıkta tutarak DNA polimerazın çalışmasına yardımcı olan çözeltidir." },
    { id: "dntp", term: "dNTP", g: G_PCR, pat: "dNTP", cs: true, suf: false, def: "PCR sırasında DNA polimerazın yeni DNA zincirini oluştururken kullandığı yapı taşlarıdır. Her biri A, T, G veya C bazlarından birini taşır." },
    { id: "kalip-dna", term: "Kalıp DNA", g: G_PCR, pat: "kalıp DNA", def: "PCR’da çoğaltılacak bölgeyi içeren DNA örneğidir. Primerler bu DNA üzerindeki hedef bölgeye bağlanır; polimeraz yeni zinciri kalıba göre sentezler." },
    { id: "taq", term: "Taq polimeraz", g: G_PCR, pat: "Taq", cs: true, suf: false, def: "Yüksek sıcaklığa dayanıklı bir bakteriden (Thermus aquaticus) elde edilen, DNA'yı kopyalayan enzimdir. Isıya dayanıklı olduğu için PCR döngülerinde bozulmaz." },
    { id: "polimeraz", term: "DNA polimeraz", g: G_PCR, pat: "polimeraz", def: "Nükleotitleri bir kalıp zincire uygun biçimde ekleyerek yeni DNA zinciri sentezleyen enzimdir." },
    { id: "denaturasyon", term: "Denatürasyon", g: G_PCR, pat: "denatür", def: "Yüksek sıcaklıkta (genellikle 94–98 °C) DNA'nın iki zincirinin birbirinden ayrılmasıdır. PCR döngüsünün ilk aşamasıdır." },
    { id: "annealing", term: "Bağlanma (annealing)", g: G_PCR, pat: "annealing", def: "Sıcaklık düşürüldüğünde (genellikle 50–65 °C) primerlerin hedef DNA dizisine tutunmasıdır." },
    { id: "extension", term: "Uzama (extension)", g: G_PCR, pat: "extension", def: "Genellikle 72 °C'de polimerazın primerden başlayarak yeni DNA zincirini sentezlemesidir." },
    { id: "elektroforez", term: "Jel elektroforezi", g: G_PCR, pat: "elektroforez", def: "DNA parçalarını elektrik akımıyla jelin içinde boylarına göre ayıran yöntemdir. DNA negatif yüklüdür, (+) kutba doğru ilerler; küçük parçalar daha hızlı yol alır." },
    { id: "bant", term: "Bant", g: G_PCR, pat: "bant", def: "Jelde aynı uzunluktaki DNA parçalarının oluşturduğu çizgidir. Bantların konumu parçaların boyutunu gösterir; DNA profilleri bu bantlar karşılaştırılarak değerlendirilir." },
    { id: "dna-profili", term: "DNA profili", g: G_PCR, pat: "DNA profili", def: "İncelenen DNA bölgelerinden elde edilen bant desenidir. Adli karşılaştırmada örneklerin desenleri eşleştirilir; eşleşme tek başına suçluluğu kanıtlamaz." },
    { id: "crispr", term: "CRISPR-Cas9", g: G_CRISPR, pat: "CRISPR(?:-Cas9)?", cs: true, suf: false, def: "Bakterilerin virüslere karşı savunma sisteminden uyarlanmış gen düzenleme aracıdır. Rehber RNA, Cas9 enzimini hedef DNA bölgesine götürür ve orada kesim yapar." },
    { id: "cas9", term: "Cas9", g: G_CRISPR, pat: "Cas9", cs: true, suf: false, def: "DNA'yı belirli bir noktada çift zincirden kesen enzimdir; 'moleküler makas' olarak da anılır." },
    { id: "grna", term: "gRNA (rehber RNA)", g: G_CRISPR, pat: "gRNA|rehber RNA", def: "Cas9'u hedef DNA dizisine yönlendiren, yaklaşık 20 nükleotit uzunluğunda RNA'dır. Hedefle komplementer olduğu için doğru bölgeyi bulur." },
    { id: "pam", term: "PAM", g: G_CRISPR, pat: "PAM", cs: true, suf: false, def: "Cas9'un kesim yapabilmesi için hedefin hemen yanında bulunması gereken kısa dizidir (Streptococcus pyogenes Cas9 için NGG)." },
    { id: "nhej", term: "NHEJ", g: G_CRISPR, pat: "NHEJ", cs: true, suf: false, def: "Homolog olmayan uç birleştirme. Kesilen uçlar şablon kullanılmadan birleştirilir; bu süreç hataya açıktır ve genellikle küçük ekleme veya silmelere yol açar." },
    { id: "hdr", term: "HDR", g: G_CRISPR, pat: "HDR", cs: true, suf: false, def: "Homoloji yönlendirmeli onarım. Bir şablon DNA kullanılarak kesik hassas biçimde onarılır veya istenen yeni dizi eklenir." },
    { id: "mrna", term: "mRNA", g: G_PROT, pat: "mRNA", cs: true, suf: false, def: "DNA'dan kopyalanan, proteinin hangi amino asit sırasıyla yapılacağını taşıyan haberci RNA'dır." },
    { id: "ribozom", term: "Ribozom", g: G_PROT, pat: "ribozom", def: "mRNA'yı kodon kodon okuyup amino asitleri birbirine bağlayarak protein sentezleyen hücre yapısıdır." },
    { id: "kodon", term: "Kodon", g: G_PROT, pat: "kodon", def: "mRNA üzerinde bir amino asidi ya da durma sinyalini belirleyen üçlü nükleotit grubudur. Toplam 64 kodon vardır." },
    { id: "aug", term: "AUG (başlangıç kodonu)", g: G_PROT, pat: "AUG", cs: true, suf: false, def: "Metiyonin amino asidini kodlar ve protein sentezinin başlangıç sinyalidir." },
    { id: "stop", term: "Stop kodonu", g: G_PROT, pat: "stop kodon", def: "UAA, UAG ve UGA kodonlarıdır. Bir amino asit kodlamazlar; protein sentezini sonlandırırlar." },
    { id: "frameshift", term: "Çerçeve kayması", g: G_PROT, pat: "çerçeve kayması", def: "3'ün katı olmayan sayıda baz eklenmesi ya da silinmesi sonucu okuma çerçevesinin kaymasıdır; değişiklikten sonraki tüm kodonlar farklı okunur." },
    { id: "ladder", term: "Ladder (DNA merdiveni)", g: G_PCR, pat: "ladder", def: "Boyutları bilinen DNA parçalarından oluşan referans karışımdır; jelde bilinmeyen bantların boyutunu kestirmek için kullanılır." },
    { id: "aminoasit", term: "Amino asit", g: G_PROT, pat: "amino asit", def: "Proteinlerin yapı taşıdır. Canlılarda 20 çeşit amino asit bulunur; dizilişleri proteinin şeklini ve görevini belirler." }
  ];
  const BY_ID = Object.fromEntries(GLOSSARY.map(t => [t.id, t]));
  const trLower = s => s.toLocaleLowerCase("tr");

  /* ----- Metin içinde tıklanabilir terimler (yalnızca modüller) ----- */
  const SKIP = "button,a,label,select,option,textarea,input,svg,script,style,h1,h2,h3,h4,h5,h6,.gl-term," +
    ".feedback,.feedback-box,.final-feedback,.toast,.codon-table,.sequence-output,.tag-output,.bwl-stepnav,.bwl-stagenav,.lab-card,code,pre,[contenteditable]";

  function highlightTerms() {
    let rx;
    try {
      rx = GLOSSARY.map(t => ({
        t,
        re: new RegExp(`(?<![\\p{L}\\p{N}])(?:${t.pat})${t.suf === false ? "(?![\\p{L}\\p{N}])" : "[\\p{L}]*"}`, t.cs ? "u" : "iu")
      }));
    } catch (e) { return; } // eski tarayıcı: sessizce atla

    $$(".panel, .stage").forEach(container => {
      const used = new Set();
      const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = n.parentElement;
          if (!p || n.nodeValue.trim().length < 4) return NodeFilter.FILTER_REJECT;
          if (!p.closest("p,li") || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      for (let node of nodes) {
        while (node && used.size < 4) {
          let best = null;
          for (const { t, re } of rx) {
            if (used.has(t.id)) continue;
            const m = re.exec(node.nodeValue);
            if (m && (!best || m.index < best.m.index)) best = { t, m };
          }
          if (!best) break;
          const { t, m } = best;
          const hit = node.splitText(m.index);
          const rest = hit.splitText(m[0].length);
          const btn = h("button", { type: "button", class: "gl-term", "aria-haspopup": "dialog", title: "Terimin anlamını göster" }, hit.nodeValue);
          btn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); showPop(t, btn); });
          hit.replaceWith(btn);
          used.add(t.id);
          node = rest;
        }
      }
    });
  }

  /* ----- Terim balonu ----- */
  let pop = null, popFor = null;
  function closePop() { if (pop) pop.remove(); pop = null; popFor = null; }
  function showPop(t, anchor) {
    if (popFor === anchor) { closePop(); return; }
    closePop();
    pop = h("div", { class: "bwl-pop", role: "dialog", "aria-label": t.term },
      h("strong", { text: t.term }),
      h("p", { text: t.def }),
      h("button", { type: "button", class: "bwl-pop-link", text: "Sözlükte aç →", onclick: () => { const back = popFor; closePop(); openDrawer("glossary", t.id, back); } })
    );
    doc.body.append(pop);
    popFor = anchor;
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left + scrollX;
    left = Math.max(8 + scrollX, Math.min(left, scrollX + innerWidth - pw - 8));
    let top = r.bottom + scrollY + 8;
    if (r.bottom + ph + 16 > innerHeight && r.top > ph + 16) top = r.top + scrollY - ph - 8;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  /* ----------------------------- Çekmece ------------------------------- */
  let drawer = null, overlay = null, searchEl = null, listEl = null, countEl = null, lastFocus = null;
  const tabs = {};
  const panes = {};

  const HELP = [
    ["Adımlar nasıl ilerler?", [
      "Her modül sıralı aşamalardan oluşur. Bir aşamanın görevini tamamlayınca “Sonraki aşama →” düğmesi açılır.",
      "Kilitli adımlar 🔒 simgesiyle gösterilir. Açık adımlara sol menüden ya da “← Önceki aşama” düğmesiyle dönebilirsin."
    ]],
    ["İlerlemen", [
      "İlerleme yalnızca bu oturumda saklanır; sayfayı yenilersen başa dönersin.",
      "Bir modülü baştan başlatmak için sağ üstteki “İlerlemeyi Sıfırla” düğmesini kullan."
    ]],
    ["Gezinme", [
      "Ekranın altındaki çubuktan modüller arasında tek dokunuşla geçebilirsin.",
      "Sağ üstteki 🌙 / ☀️ düğmesi koyu ve açık tema arasında geçiş yapar."
    ]],
    ["Terimler", [
      "Metindeki noktalı çizgili sözcüklere tıklarsan kısa açıklamasını görürsün.",
      "Tüm terimleri “Sözlük” sekmesinde arayabilirsin."
    ]],
    ["Klavye", [
      "?  → Yardım ve sözlük    Esc → Kapat",
      "Tab ve Shift+Tab ile tüm düğmelere klavyeyle ulaşabilirsin."
    ]]
  ];

  function buildDrawer() {
    if (drawer) return;
    overlay = h("div", { class: "bwl-overlay", hidden: true, onclick: closeDrawer });

    searchEl = h("input", { type: "search", class: "bwl-search", placeholder: "Terim ara… (ör. primer, PAM, kodon)", "aria-label": "Sözlükte ara", autocomplete: "off" });
    searchEl.addEventListener("input", () => renderGlossary(searchEl.value));
    countEl = h("p", { class: "bwl-count", "aria-live": "polite" });
    listEl = h("ul", { class: "bwl-gl-list" });
    panes.glossary = h("div", { class: "bwl-pane", role: "tabpanel", id: "bwl-pane-glossary" }, searchEl, countEl, listEl);

    panes.help = h("div", { class: "bwl-pane", role: "tabpanel", id: "bwl-pane-help", hidden: true },
      HELP.map(([title, items]) => h("section", { class: "bwl-help-sec" },
        h("h3", { text: title }),
        h("ul", null, items.map(i => h("li", { text: i })))
      ))
    );

    // Görünüm / erişilebilirlik
    const sizeBtns = ["A", "A+", "A++"].map((label, i) => {
      const b = h("button", { type: "button", class: "bwl-size", "data-i": String(i), "aria-label": ["Normal yazı boyutu", "Büyük yazı boyutu", "Çok büyük yazı boyutu"][i], text: label });
      b.addEventListener("click", () => { prefs.size = i; savePrefs(); applyPrefs(); syncView(); });
      return b;
    });
    const toggle = (key, label, hint) => {
      const input = h("input", { type: "checkbox", id: "bwl-" + key });
      input.addEventListener("change", () => { prefs[key] = input.checked; savePrefs(); applyPrefs(); });
      return h("label", { class: "bwl-switch", for: "bwl-" + key }, input, h("span", { class: "bwl-switch-ui", "aria-hidden": "true" }),
        h("span", { class: "bwl-switch-text" }, h("strong", { text: label }), h("small", { text: hint })));
    };
    const reset = h("button", { type: "button", class: "bwl-reset", text: "Varsayılana dön" });
    reset.addEventListener("click", () => { prefs.size = 0; prefs.calm = false; prefs.read = false; savePrefs(); applyPrefs(); syncView(); });
    panes.view = h("div", { class: "bwl-pane", role: "tabpanel", id: "bwl-pane-view", hidden: true },
      h("section", { class: "bwl-help-sec" }, h("h3", { text: "Yazı boyutu" }), h("div", { class: "bwl-sizes" }, sizeBtns),
        h("p", { class: "bwl-note", text: "İçerik alanındaki yazılar büyür. Tarayıcı yakınlaştırması (Ctrl +) de desteklenir." })),
      h("section", { class: "bwl-help-sec" }, h("h3", { text: "Okunabilirlik" }),
        toggle("calm", "Animasyonları azalt", "Hareketli arka plan ve geçişleri kapatır."),
        toggle("read", "Okuma modu", "Satır ve harf aralığını artırır, satırları kısaltır.")),
      reset
    );

    const mkTab = (id, label) => {
      const b = h("button", { type: "button", role: "tab", class: "bwl-tab", "aria-controls": "bwl-pane-" + id, text: label });
      b.addEventListener("click", () => setTab(id));
      tabs[id] = b;
      return b;
    };
    const closeBtn = h("button", { type: "button", class: "bwl-close", "aria-label": "Kapat", text: "✕", onclick: closeDrawer });

    drawer = h("aside", { class: "bwl-drawer", role: "dialog", "aria-modal": "true", "aria-label": "Sözlük, yardım ve görünüm", hidden: true },
      h("header", { class: "bwl-drawer-head" }, h("strong", { text: "BioWebLab Yardım" }), closeBtn),
      h("div", { class: "bwl-tabs", role: "tablist" }, mkTab("glossary", "📖 Sözlük"), mkTab("help", "❓ Yardım"), mkTab("view", "Aa Görünüm")),
      h("div", { class: "bwl-drawer-body" }, panes.glossary, panes.help, panes.view)
    );
    doc.body.append(overlay, drawer);
    renderGlossary("");
    syncView();
  }

  function renderGlossary(q) {
    const query = trLower(q.trim());
    const items = GLOSSARY.filter(t => !query || trLower(t.term).includes(query) || trLower(t.def).includes(query))
      .sort((a, b) => a.term.localeCompare(b.term, "tr"));
    listEl.replaceChildren(...items.map(t => h("li", { class: "bwl-gl-item", "data-id": t.id },
      h("div", { class: "bwl-gl-top" }, h("strong", { text: t.term }), h("span", { class: "bwl-gl-tag", text: t.g })),
      h("p", { text: t.def })
    )));
    countEl.textContent = items.length ? items.length + " terim" : "Sonuç bulunamadı. Başka bir sözcük dene.";
  }

  function syncView() {
    $$(".bwl-size", drawer).forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.i) === prefs.size)));
    const calm = $("#bwl-calm", drawer), read = $("#bwl-read", drawer);
    if (calm) calm.checked = !!prefs.calm;
    if (read) read.checked = !!prefs.read;
  }

  function setTab(id) {
    Object.keys(tabs).forEach(k => {
      const on = k === id;
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      panes[k].hidden = !on;
    });
  }

  const openers = [];
  function openDrawer(tab, termId, returnTo) {
    buildDrawer();
    closePop();
    lastFocus = returnTo || doc.activeElement;
    setTab(tab || "glossary");
    overlay.hidden = false; drawer.hidden = false;
    requestAnimationFrame(() => { overlay.classList.add("open"); drawer.classList.add("open"); });
    doc.body.classList.add("bwl-lock");
    openers.forEach(b => b.setAttribute("aria-expanded", "true"));
    if (termId) {
      searchEl.value = ""; renderGlossary("");
      const li = $(`[data-id="${termId}"]`, drawer);
      if (li) { li.classList.add("flash"); li.scrollIntoView({ block: "center" }); setTimeout(() => li.classList.remove("flash"), 1800); }
      $(".bwl-close", drawer).focus();
    } else if ((tab || "glossary") === "glossary") searchEl.focus();
    else tabs[tab].focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    overlay.classList.remove("open"); drawer.classList.remove("open");
    doc.body.classList.remove("bwl-lock");
    openers.forEach(b => b.setAttribute("aria-expanded", "false"));
    setTimeout(() => { overlay.hidden = true; drawer.hidden = true; }, 230);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* --------------------- Araç düğmeleri (üst çubuk) ---------------------- */
  function addToolButtons() {
    const glossBtn = h("button", { type: "button", class: "bwl-tools-btn", "aria-haspopup": "dialog", "aria-expanded": "false", title: "Sözlük ve yardım ( ? )" },
      h("span", { "aria-hidden": "true", text: "📖" }), h("span", { class: "bwl-tools-label", text: "Sözlük" }));
    glossBtn.addEventListener("click", () => openDrawer("glossary"));
    const viewBtn = h("button", { type: "button", class: "bwl-tools-btn bwl-tools-icon", "aria-haspopup": "dialog", "aria-expanded": "false", title: "Okunabilirlik ve erişilebilirlik ayarları", "aria-label": "Okunabilirlik ve erişilebilirlik ayarları" },
      h("span", { "aria-hidden": "true", text: "Aa" }));
    viewBtn.addEventListener("click", () => openDrawer("view"));
    openers.push(glossBtn, viewBtn);

    const bar = $(".module-toolbar");
    const nav = $(".nav-links");
    if (bar) bar.prepend(glossBtn, viewBtn);
    else if (nav) { const t = $("#theme-toggle", nav); nav.insertBefore(glossBtn, t); nav.insertBefore(viewBtn, t); }
    else { const f = h("div", { class: "bwl-fab" }, glossBtn, viewBtn); doc.body.append(f); }
  }

  /* ------------------ "İçeriğe geç" bağlantısı (erişilebilirlik) ------------------ */
  function addSkipLink() {
    const main = $("main");
    if (!main) return;
    if (!main.id) main.id = "bwl-main";
    main.setAttribute("tabindex", "-1");
    doc.body.prepend(h("a", { class: "bwl-skip", href: "#" + main.id, text: "İçeriğe geç" }));
  }

  /* ------------- Modül: standart aşama gezinmesi (önceki / sonraki) ------------- */
  function addStepNav() {
    const items = $$(".menu-item[data-step], .step-btn[data-step]");
    const total = items.length;
    if (!total) return;
    const byStep = n => items.find(i => Number(i.dataset.step) === n);
    const isCrispr = typeof completeStep === "function" && typeof goToStep === "function";
    const unlocked = () => (typeof unlockedStep === "number" ? unlockedStep : 1);
    const toTop = () => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    const navs = [];

    $$(".panel[id^='panel'], .stage[data-stage]").forEach(panel => {
      const n = Number(panel.dataset.stage || panel.id.replace("panel", ""));
      if (!n) return;

      // üstte yalnızca aşama göstergesi
      panel.prepend(h("div", { class: "bwl-stepnav" }, h("span", { class: "bwl-stepinfo", text: `Aşama ${n} / ${total}` })));

      // altta her aşamada aynı iki düğme
      const prev = h("button", { type: "button", class: "bwl-stagenav-btn is-prev", text: "← Önceki aşama" });
      if (n === 1) prev.disabled = true;
      prev.addEventListener("click", () => { const t = byStep(n - 1); if (t) { t.click(); toTop(); } });

      let next;
      if (n >= total) {
        next = h("a", { class: "bwl-stagenav-btn is-next", href: "../index.html", text: "Ana sayfaya dön ⌂" });
      } else {
        next = h("button", { type: "button", class: "bwl-stagenav-btn is-next", text: "Sonraki aşama →" });
        next.addEventListener("click", () => {
          if (unlocked() <= n) {
            if (!panel.dataset.info) return;          // görev aşaması: önce görev tamamlanmalı
            if (!isCrispr) { unlockNextStep(); toTop(); return; }
            completeStep(n);
          }
          const t = byStep(n + 1); if (t) { t.click(); toTop(); }
        });
      }
      const hint = h("span", { class: "bwl-stagenav-hint", "aria-live": "polite" });
      panel.append(h("div", { class: "bwl-stagenav" }, prev, hint, next));
      navs.push({ n, panel, next, hint });
    });

    const refresh = () => navs.forEach(({ n, panel, next, hint }) => {
      if (n >= total) return;
      const open = unlocked() > n || !!panel.dataset.info;
      next.disabled = !open;
      hint.textContent = open ? "" : "Bu aşamadaki görevi tamamlayınca açılır";
    });
    refresh();
    const host = items[0].parentElement;
    if (host) new MutationObserver(refresh).observe(host, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  /* ------------------- Ana sayfa: kart ilerleme durumu ------------------- */
  function homeProgress() {
    const MAP = { "adli-tip": ["adliTipProgress", 7], crispr: ["crisprProgress", 9], protein: ["proteinProgress", 5] };
    $$(".module-card[data-module]").forEach(card => {
      const [key, total] = MAP[card.dataset.module] || [];
      if (!key) return;
      let data = null;
      try { data = JSON.parse(sessionStorage.getItem(key) || "null"); } catch (e) { /* yok say */ }
      const unlocked = data && Number(data.unlockedStep);
      if (!unlocked || unlocked < 1 || (unlocked === 1 && Number(data.currentStep) <= 1)) return;
      const box = $(".card-progress", card);
      if (!box) return;
      const pct = Math.min(100, Math.round(((unlocked - 1) / total) * 100));
      $("i", box).style.width = Math.max(pct, 6) + "%";
      $("span", box).textContent = `Devam ediyor · ${unlocked}. adıma kadar açıldı`;
      box.hidden = false;
      const link = $(".card-link", card);
      if (link && link.firstChild) link.firstChild.nodeValue = "Kaldığın yerden devam et ";
    });
  }

  /* ------------------------------ Klavye ------------------------------ */
  doc.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (pop) { closePop(); return; }
      if (drawer && !drawer.hidden) closeDrawer();
      return;
    }
    if (drawer && !drawer.hidden && e.key === "Tab") {
      const f = $$("button, input, [tabindex]:not([tabindex='-1'])", drawer).filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      e.preventDefault();
      if (drawer && !drawer.hidden) closeDrawer(); else openDrawer("help");
    }
  });
  doc.addEventListener("click", e => {
    if (pop && !pop.contains(e.target) && !e.target.closest(".gl-term")) closePop();
  });

  /* -------------------------------- Başlat -------------------------------- */
  applyPrefs();
  addSkipLink();
  addToolButtons();
  if (IS_HOME) homeProgress();
  else { addStepNav(); highlightTerms(); }
})();
