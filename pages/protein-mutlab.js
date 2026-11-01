/* Protein · Mutasyon Laboratuvarı (6. adım) */
(() => {
  const REF = "AUGGAAUGGCACAAAGCUUCUUGA"; // Met-Glu-Trp-His-Lys-Ala-Ser-Stop
  const AA = {
    UUU:"Phe",UUC:"Phe",UUA:"Leu",UUG:"Leu",CUU:"Leu",CUC:"Leu",CUA:"Leu",CUG:"Leu",
    AUU:"Ile",AUC:"Ile",AUA:"Ile",AUG:"Met",GUU:"Val",GUC:"Val",GUA:"Val",GUG:"Val",
    UCU:"Ser",UCC:"Ser",UCA:"Ser",UCG:"Ser",CCU:"Pro",CCC:"Pro",CCA:"Pro",CCG:"Pro",
    ACU:"Thr",ACC:"Thr",ACA:"Thr",ACG:"Thr",GCU:"Ala",GCC:"Ala",GCA:"Ala",GCG:"Ala",
    UAU:"Tyr",UAC:"Tyr",UAA:"Stop",UAG:"Stop",CAU:"His",CAC:"His",CAA:"Gln",CAG:"Gln",
    AAU:"Asn",AAC:"Asn",AAA:"Lys",AAG:"Lys",GAU:"Asp",GAC:"Asp",GAA:"Glu",GAG:"Glu",
    UGU:"Cys",UGC:"Cys",UGA:"Stop",UGG:"Trp",CGU:"Arg",CGC:"Arg",CGA:"Arg",CGG:"Arg",
    AGU:"Ser",AGC:"Ser",AGA:"Arg",AGG:"Arg",GGU:"Gly",GGC:"Gly",GGA:"Gly",GGG:"Gly"
  };

  /* Ribozom ilk AUG'yi bulur ve Stop'a kadar okur */
  function translate(rna) {
    const start = rna.indexOf("AUG");
    if (start < 0) return { start: -1, codons: [], aas: [], stopped: false };
    const codons = [], aas = [];
    let stopped = false;
    for (let i = start; i + 3 <= rna.length; i += 3) {
      const c = rna.slice(i, i + 3), a = AA[c];
      codons.push(c); aas.push(a);
      if (a === "Stop") { stopped = true; break; }
    }
    return { start, codons, aas, stopped };
  }

  /* Mutasyonu sınıflandır: referans ile mutant dizinin çevirisini karşılaştırır */
  function classify(ref, mut) {
    if (ref === mut) return { key: "none" };
    const diff = mut.length - ref.length;
    if (diff % 3 !== 0) return { key: "frameshift" };
    if (diff !== 0) return { key: "inframe" };
    const r = translate(ref), m = translate(mut);
    if (m.start < 0) return { key: "nostart" };
    if (m.start !== r.start) return { key: "startshift" };
    const ra = r.aas.join(","), ma = m.aas.join(",");
    if (ra === ma) return { key: "silent" };
    const n = Math.min(r.aas.length, m.aas.length);
    for (let i = 0; i < n; i++) {
      if (r.aas[i] !== m.aas[i]) {
        if (m.aas[i] === "Stop") return { key: "nonsense", at: i };
        if (r.aas[i] === "Stop") return { key: "stoploss", at: i };
        return { key: "missense", at: i };
      }
    }
    return { key: m.aas.length > r.aas.length ? "stoploss" : "nonsense" };
  }

  const TEXT = {
    none: ["Değişiklik yok", "Dizi referansla aynı.", ""],
    silent: ["Sessiz mutasyon", "Kodon değişti ama aynı amino asidi kodluyor; protein aynı kaldı. Genetik şifrenin “dejenere” olması (bir amino asit için birden çok kodon) bunu mümkün kılar.", "ok"],
    missense: ["Yanlış anlamlı mutasyon", "Kodon farklı bir amino asidi kodluyor. Proteinin işlevi, değişen amino asidin konumuna ve özelliğine göre azalabilir, değişebilir ya da etkilenmeyebilir.", "warn"],
    nonsense: ["Anlamsız mutasyon", "Bir amino asit kodonu Stop kodonuna dönüştü. Protein erken kesilir; çoğu zaman işlevsiz kalır.", "bad"],
    frameshift: ["Çerçeve kayması", "Eklenen ya da silinen baz sayısı 3'ün katı değil. Okuma çerçevesi kayar ve değişiklikten sonraki tüm kodonlar farklı okunur; çoğu zaman erken Stop oluşur.", "bad"],
    inframe: ["Çerçeve korunan ekleme/silme", "Baz sayısı 3'ün katı kadar değişti; okuma çerçevesi korunur, yalnızca bir veya birkaç amino asit eklenir ya da kaybolur.", "warn"],
    stoploss: ["Stop kaybı", "Stop kodonu bozuldu; ribozom okumaya devam eder ve protein uzar.", "warn"],
    nostart: ["Başlangıç kodonu kayboldu", "Dizide AUG kalmadı; ribozom çeviriyi başlatamaz ve protein üretilmez.", "bad"],
    startshift: ["Başlangıç noktası değişti", "İlk AUG başka bir yere kaydı; protein farklı bir noktadan başlar.", "warn"]
  };
  const NEED = ["silent", "missense", "nonsense", "frameshift"];

  const $ = id => document.getElementById(id);
  const root = $("panel6");
  if (!root) return;

  let mut = REF.split("");
  let sel = -1;
  const found = new Set();
  // İlerleme sıfırlandıysa (yenileme / sıfırla düğmesi) keşif listesi de sıfırlanır
  if (!sessionStorage.getItem("proteinProgress")) sessionStorage.removeItem("proteinMutFound");
  try { (JSON.parse(sessionStorage.getItem("proteinMutFound") || "[]")).forEach(k => found.add(k)); } catch (e) { /* yok */ }

  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  function renderSeq(container, arr, interactive) {
    container.replaceChildren();
    arr.forEach((b, i) => {
      const grp = Math.floor(i / 3);
      const el = mk(interactive ? "button" : "span", "mut-base mut-g" + (grp % 2), b);
      if (interactive) {
        el.type = "button";
        el.setAttribute("aria-label", `${i + 1}. baz: ${b}`);
        el.setAttribute("aria-pressed", String(i === sel));
        if (i === sel) el.classList.add("sel");
        if (REF[i] !== b || arr.length !== REF.length) el.classList.toggle("changed", REF[i] !== b);
        el.addEventListener("click", () => { sel = i; update(); });
      }
      container.appendChild(el);
      if (i % 3 === 2) container.appendChild(mk("span", "mut-gap"));
    });
  }

  const protStr = t => t.start < 0 ? "— (protein yok)" : t.aas.map(a => a === "Stop" ? "■" : a).join(" – ");

  function update() {
    const rna = mut.join("");
    renderSeq($("mutRef"), REF.split(""), false);
    renderSeq($("mutSeq"), mut, true);
    const tr = translate(REF), tm = translate(rna);
    $("mutRefProt").textContent = protStr(tr);
    $("mutNewProt").textContent = protStr(tm);
    $("mutPos").textContent = sel >= 0 ? `${sel + 1}. baz (${mut[sel]})` : "—";

    const cls = classify(REF, rna);
    const [title, text, tone] = TEXT[cls.key];
    const v = $("mutVerdict");
    v.className = "mut-verdict " + (tone || "");
    v.replaceChildren(mk("strong", null, title), mk("span", null, " — " + text));
    if (cls.key === "none") v.textContent = "Bir baz seçip değişiklik yap.";

    // Kodon tablosu
    const t = $("mutTable"); t.replaceChildren();
    const n = Math.max(tr.codons.length, tm.codons.length, 1);
    t.appendChild(mk("div", "mt-head", "#")); t.appendChild(mk("div", "mt-head", "Referans")); t.appendChild(mk("div", "mt-head", "Mutant"));
    for (let i = 0; i < n; i++) {
      const rc = tr.codons[i], mc = tm.codons[i];
      const same = rc === mc;
      t.appendChild(mk("div", "mt-n", String(i + 1)));
      t.appendChild(mk("div", "mt-cell", rc ? `${rc} → ${AA[rc]}` : "—"));
      t.appendChild(mk("div", "mt-cell" + (same ? "" : " diff"), mc ? `${mc} → ${AA[mc]}` : "—"));
    }

    // Keşif görevi
    if (NEED.includes(cls.key)) found.add(cls.key);
    try { sessionStorage.setItem("proteinMutFound", JSON.stringify([...found])); } catch (e) { /* sessiz */ }
    root.querySelectorAll("#mutChecklist li").forEach(li => {
      const ok = found.has(li.dataset.k);
      li.classList.toggle("done", ok);
      li.firstElementChild.textContent = ok ? "✓" : "○";
    });
    $("mutCount").textContent = `${found.size} / 4`;
    if (found.size === NEED.length) {
      $("mutNext").hidden = false;
      if (typeof unlockedStep !== "undefined" && unlockedStep < 7) {
        unlockedStep = 7; saveProgress(); refreshLocks();
      }
    }
  }

  function setBase(op, b) {
    if (sel < 0) { $("mutVerdict").className = "mut-verdict warn"; $("mutVerdict").textContent = "Önce mutasyonlu dizide bir baza tıkla."; return; }
    if (op === "sub") mut[sel] = b;
    if (op === "ins") { mut.splice(sel, 0, b); }
    update();
  }

  root.querySelectorAll(".mut-btns[data-op] button").forEach(btn =>
    btn.addEventListener("click", () => setBase(btn.parentElement.dataset.op, btn.dataset.b)));
  $("mutDel").addEventListener("click", () => {
    if (sel < 0) { $("mutVerdict").className = "mut-verdict warn"; $("mutVerdict").textContent = "Önce silinecek bazı seç."; return; }
    if (mut.length <= 3) return;
    mut.splice(sel, 1); if (sel >= mut.length) sel = mut.length - 1; update();
  });
  $("mutReset").addEventListener("click", () => { mut = REF.split(""); sel = -1; update(); });
  $("mutNext").addEventListener("click", () => { if (typeof unlockNextStep === "function") unlockNextStep(); });

  window.BWL_PROTEIN_MUT = { translate, classify, REF };  // test ve değerlendirme için
  update();
})();
