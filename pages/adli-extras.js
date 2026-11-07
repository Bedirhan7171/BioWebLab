/* Adli Tıp · ek mekanikler: hataya özel PCR geri bildirimi, PCR parametre laboratuvarı,
   rastgele vaka üretici, ladder tabanlı boyut cetveli */
(() => {
  const $ = id => document.getElementById(id);
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

  /* ===================== 1) PCR karışımı: hataya özel geri bildirim ===================== */
  const NAMES = { dna: "Kalıp DNA", primer: "Primer", taq: "Taq DNA Polimeraz", dntp: "dNTP", buffer: "Buffer" };
  const MISSING = {
    dna: "çoğaltılacak bölge (kalıp) yok",
    primer: "polimeraz başlangıç noktasını bulamaz",
    taq: "yeni DNA zinciri sentezlenemez",
    dntp: "yeni zincirin yapı taşları yok",
    buffer: "enzim için uygun pH ve iyon ortamı yok"
  };
  const WRONG = {
    soap: "Sabunlu su enzimi ve DNA'yı bozabilir; PCR bileşeni değildir.",
    protein: "Protein tozu PCR'a katkı sağlamaz; DNA sentezi için nükleotit (dNTP) gerekir.",
    rna: "RNA, DNA polimeraz için kalıp değildir (RNA'dan DNA üretmek için ters transkriptaz gerekir)."
  };
  const LABEL = { soap: "Sabunlu su", protein: "Protein tozu", rna: "RNA" };

  window.checkPCRMix = function () {
    const sel = [...document.querySelectorAll('#panel3 input[type="checkbox"]:checked')].map(i => i.value);
    const box = $("mixResult"), liquid = $("tubeLiquid");
    const req = Object.keys(NAMES);
    const missing = req.filter(k => !sel.includes(k));
    const extra = sel.filter(k => !req.includes(k));
    box.replaceChildren();
    if (!missing.length && !extra.length) {
      box.textContent = "✅ PCR karışımı hazırlandı. Beş bileşenin tamamı doğru: kalıp, primer, polimeraz, nükleotitler ve buffer. Sonraki bölüm açıldı.";
      box.style.color = "#166534";
      liquid.style.height = "72%";
      if (unlockedStep < 4) { unlockedStep = 4; saveProgress(); refreshLocks(); }
      return;
    }
    liquid.style.height = "0%";
    box.style.color = "#b91c1c";
    box.append(mk("strong", null, "❌ Karışım henüz doğru değil."));
    const ul = mk("ul"); ul.style.cssText = "margin:8px 0 0 18px;text-align:left";
    extra.forEach(k => ul.append(mk("li", null, `${LABEL[k]} gerekli değil: ${WRONG[k]}`)));
    missing.forEach(k => ul.append(mk("li", null, `${NAMES[k]} eksik: ${MISSING[k]}.`)));
    if (!sel.length) ul.append(mk("li", null, "Hiçbir bileşen seçmedin."));
    box.append(ul);
  };

  /* ===================== 2) Ladder: bant konumu ↔ boyut (yarı-log) ===================== */
  const LADDER = [[110, 1000], [150, 800], [210, 600], [285, 400], [360, 250], [440, 100]]; // [top px, bç]
  function topToBp(y) {
    if (y <= LADDER[0][0]) return { bp: 1000, edge: ">" };
    if (y >= LADDER[LADDER.length - 1][0]) return { bp: 100, edge: "<" };
    for (let i = 0; i < LADDER.length - 1; i++) {
      const [y1, b1] = LADDER[i], [y2, b2] = LADDER[i + 1];
      if (y >= y1 && y <= y2) {
        const f = (y - y1) / (y2 - y1);
        return { bp: Math.pow(10, Math.log10(b1) + f * (Math.log10(b2) - Math.log10(b1))) };
      }
    }
    return { bp: 100 };
  }
  const round10 = bp => Math.max(100, Math.round(bp / 10) * 10);
  const sizeText = top => { const r = topToBp(top); return (r.edge || "") + (r.edge ? "" : "≈") + round10(r.bp); };

  /* ===================== 3) Rastgele vaka üretici ===================== */
  const COLORS = { crime: "#22c55e", A: "#f59e0b", B: "#ef4444", C: "#8b5cf6", D: "#14b8a6" };
  const LO = 122, HI = 432;

  function pickBands(n, gap) {
    for (let tries = 0; tries < 400; tries++) {
      const t = [];
      for (let guard = 0; t.length < n && guard < 200; guard++) {
        const v = LO + 5 * rnd(Math.floor((HI - LO) / 5) + 1);
        if (t.every(x => Math.abs(x - v) >= gap)) t.push(v);
      }
      if (t.length === n) return t.sort((a, b) => a - b);
    }
    // Yedek: eşit aralıklı bantlar (sonsuz döngüye girmez)
    const step = (HI - LO) / (n - 1);
    return Array.from({ length: n }, (_, i) => Math.round((LO + i * step) / 5) * 5);
  }
  const farFrom = (v, arr, d) => arr.every(x => Math.abs(x - v) >= d);

  function makeCase() {
    const crime = pickBands(5, 42);
    const names = shuffle(["A", "B", "C", "D"]);
    const match = names[0];
    const roles = shuffle(["near", "partial", "different"]);
    const prof = { crime, [match]: crime.slice() };
    const info = { [match]: { role: "match" } };

    names.slice(1).forEach((nm, i) => {
      const role = roles[i];
      let p;
      if (role === "near") {
        p = crime.slice();
        const k = 1 + rnd(2);
        shuffle([0, 1, 2, 3, 4]).slice(0, k).forEach(idx => {
          for (let t = 0; t < 60; t++) {
            const shift = (35 + rnd(36)) * (Math.random() < .5 ? -1 : 1);
            const v = Math.round((crime[idx] + shift) / 5) * 5;
            const others = p.filter((_, j) => j !== idx);
            if (v >= LO && v <= HI && farFrom(v, others, 16) && Math.abs(v - crime[idx]) >= 30) { p[idx] = v; break; }
          }
        });
        info[nm] = { role, changed: p.filter((v, j) => v !== crime[j]).length };
      } else if (role === "partial") {
        p = shuffle(crime).slice(0, 3);
        info[nm] = { role, count: 3 };
      } else {
        for (let t = 0; t < 200; t++) {
          p = pickBands(4 + rnd(2), 34);
          if (p.filter(v => !farFrom(v, crime, 14)).length <= 1) break;
        }
        info[nm] = { role };
      }
      prof[nm] = p.sort((a, b) => a - b);
    });
    return { crime, prof, match, info, attempts: 0 };
  }

  let CASE = makeCase();
  window.BWL_ADLI_CASE = CASE;

  const ROLE_LABEL = { match: "Eşleşiyor ✔", near: "Yakın ama farklı", partial: "Yetersiz eşleşme", different: "Farklı profil", ref: "Referans profil" };

  function renderBoard() {
    const board = $("gelBoard");
    if (!board) return;
    const lanes = [...board.querySelectorAll(".gel-lane")];
    const ladderFirst = lanes[0], ladderLast = lanes[lanes.length - 1];
    lanes.slice(1, -1).forEach(l => l.remove());
    const order = ["crime", "A", "B", "C", "D"];
    order.forEach(key => {
      const lane = mk("div", "gel-lane");
      lane.dataset.sample = key;
      lane.append(mk("div", "lane-title", key === "crime" ? "Olay Yeri" : "Şüpheli " + key), mk("div", "well"));
      (key === "crime" ? CASE.crime : CASE.prof[key]).forEach(top => {
        const b = mk("div", "gel-band gb");
        b.style.setProperty("--bc", COLORS[key]);
        b.style.setProperty("--final-top", top + "px");
        b.dataset.top = String(top);
        lane.append(b);
      });
      board.insertBefore(lane, ladderLast);
    });
  }

  function renderTable(revealed) {
    const t = $("profileTable");
    if (!t) return;
    t.replaceChildren();
    const row = (cells, cls) => { const r = mk("div", "profile-row" + (cls ? " " + cls : "")); cells.forEach(c => r.append(typeof c === "string" ? mk("span", null, c) : c)); t.append(r); };
    row(["Örnek", "Tahmini bant boyutları (bç)", "Yorum"], "header-row");
    const sizes = arr => arr.map(sizeText).reverse().join(" / ");
    row(["Olay Yeri", sizes(CASE.crime), ROLE_LABEL.ref]);
    ["A", "B", "C", "D"].forEach(k => {
      const role = CASE.info[k].role;
      row(["Şüpheli " + k, sizes(CASE.prof[k]), revealed ? ROLE_LABEL[role] : "🔒 Karardan sonra"]);
    });
  }

  function resetGel() {
    const board = $("gelBoard");
    board.classList.remove("samples-loaded", "running");
    gelLoaded = false; gelRunning = false;
    ["gelTask1", "gelTask2", "gelTask3"].forEach((id, i) => { const e = $(id); e.classList.remove("active-task", "done-task"); if (i === 0) e.classList.add("active-task"); });
    const fb = $("gelFeedback"); fb.textContent = ""; 
    const ruler = $("gelRuler"); if (ruler) ruler.hidden = true;
  }

  function newCase() {
    CASE = makeCase();
    window.BWL_ADLI_CASE = CASE;
    renderBoard(); resetGel();
    finalSolved = false;
    document.querySelectorAll(".suspect-choice").forEach(b => { b.classList.remove("wrong", "correct", "selected"); b.disabled = false; });
    const f = $("finalFeedback"); f.className = "final-feedback"; f.textContent = "";
    renderTable(false);
    const nb = $("newCaseBtn"); if (nb) nb.hidden = true;
    showStep(6);
  }
  window.newForensicCase = newCase;

  /* ===================== 4) Karşılaştırma: dinamik değerlendirme ===================== */
  window.checkFinalSuspect = function (choice) {
    if (currentStep < 7 || finalSolved) return;
    const fb = $("finalFeedback");
    const btns = [...document.querySelectorAll(".suspect-choice")];
    const idx = ["A", "B", "C", "D"].indexOf(choice);
    if (!fb || idx < 0) return;
    btns.forEach(b => b.classList.remove("wrong", "correct", "selected"));
    fb.classList.remove("success", "error", "show");
    btns[idx].classList.add("selected");
    CASE.attempts++;

    const inf = CASE.info[choice];
    let msg, ok = false;
    if (inf.role === "match") {
      ok = true;
      const n = CASE.attempts;
      msg = `Doğru! Şüpheli ${choice}: 5 bandın tamamı olay yeri örneğiyle aynı konumda (${n === 1 ? "ilk denemede" : n + ". denemede"}). Yine de DNA eşleşmesi tek başına suçluluğu kanıtlamaz; örneğin DNA olay yerine başka bir yolla taşınmış olabilir.`;
    } else if (inf.role === "near") {
      msg = `Şüpheli ${choice}'nin profili olay yerine çok benziyor ama ${inf.changed} bant farklı konumda. Eşleşme için tüm bantların örtüşmesi gerekir; “neredeyse aynı” yeterli değildir.`;
    } else if (inf.role === "partial") {
      msg = `Şüpheli ${choice}'de yalnızca ${inf.count} bant görünüyor. Örtüşen bantlar olsa da eksik bantlar nedeniyle eşleşme yetersiz; bu durumda analiz tekrarlanır.`;
    } else {
      msg = `Şüpheli ${choice}'nin bant konumları olay yeri örneğinden belirgin biçimde farklı.`;
    }
    if (!ok && CASE.attempts >= 2) msg += " İpucu: Bantları üstten alta tek tek say ve her bandı ladder'a göre karşılaştır; jel üzerinde cetvel kullanabilirsin.";
    fb.textContent = msg;
    fb.classList.add("show", ok ? "success" : "error");
    if (ok) {
      finalSolved = true;
      btns[idx].classList.add("correct");
      renderTable(true);
      const nb = $("newCaseBtn"); if (nb) nb.hidden = false;
    } else {
      btns[idx].classList.add("wrong");
    }
  };

  /* ===================== 5) Jel cetveli ===================== */
  function setupRuler() {
    const board = $("gelBoard");
    if (!board) return;
    const ruler = mk("div", "gel-ruler"); ruler.id = "gelRuler"; ruler.hidden = true;
    const line = mk("i"), label = mk("span");
    ruler.append(line, label);
    board.append(ruler);
    const move = e => {
      if (!board.classList.contains("running")) { ruler.hidden = true; return; }
      const lane = board.querySelector(".gel-lane");
      const lr = lane.getBoundingClientRect(), br = board.getBoundingClientRect();
      const y = e.clientY - lr.top - 1;
      if (y < 80 || y > lr.height) { ruler.hidden = true; return; }
      const r = topToBp(y);
      label.textContent = `${r.edge || "≈"} ${round10(r.bp)} bç`;
      ruler.style.top = (e.clientY - br.top) + "px";
      ruler.hidden = false;
    };
    board.addEventListener("pointermove", move);
    board.addEventListener("pointerdown", move);
    board.addEventListener("pointerleave", () => { ruler.hidden = true; });
  }

  /* ===================== 6) PCR parametre laboratuvarı ===================== */
  const TM = 60;
  const fmtN = n => {
    if (n < 1e3) return String(Math.round(n));
    const U = [[1e15, "katrilyon"], [1e12, "trilyon"], [1e9, "milyar"], [1e6, "milyon"], [1e3, "bin"]];
    for (const [v, name] of U) if (n >= v * 0.9995) { const x = n / v; return String(x >= 100 ? Math.round(x) : x >= 10 ? x.toFixed(0) : x.toFixed(1)).replace(".", ",") + " " + name; }
  };
  function anneal(T) {
    const specific = Math.round(100 * Math.exp(-Math.pow((T - (TM - 5)) / 6.5, 2)));
    const nonspec = Math.round(100 * Math.max(0, Math.min(1, (53 - T) / 11)));
    let tone, text;
    if (T > 63) { tone = "bad"; text = "Çok yüksek: primerler hedefe tutunamaz, ürün çok az ya da hiç oluşmaz."; }
    else if (T > 58) { tone = "warn"; text = "Biraz yüksek: bağlanma zayıflar, verim düşer."; }
    else if (T >= 52) { tone = "ok"; text = "Uygun aralık: primerler yalnızca hedefe bağlanır, temiz ve güçlü bir bant oluşur."; }
    else if (T >= 46) { tone = "warn"; text = "Biraz düşük: primerler hedef dışı yerlere de bağlanmaya başlar; ek bantlar görülebilir."; }
    else { tone = "bad"; text = "Çok düşük: özgül olmayan bağlanma yaygındır; jelde çok sayıda istenmeyen bant çıkar."; }
    return { specific, nonspec, tone, text };
  }
  function cycles(n, eff, start) {
    const CAP = 1e12;
    let N = start; const real = [N], ideal = [start];
    for (let i = 1; i <= n; i++) {
      N = N * (1 + eff * Math.max(0, 1 - N / CAP));
      real.push(N);
      ideal.push(start * Math.pow(2, i));
    }
    return { real, ideal, plateau: N / CAP > 0.5 };
  }
  function drawChart(svg, c, nMax) {
    const W = 360, H = 180, L = 40, R = 10, T = 10, B = 26, MAXE = 18;
    const x = i => L + (i / 40) * (W - L - R);
    const y = v => T + (1 - Math.min(Math.log10(Math.max(v, 1)), MAXE) / MAXE) * (H - T - B);
    const NS = "http://www.w3.org/2000/svg";
    const add = (tag, attrs, txt) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (txt != null) e.textContent = txt; svg.append(e); return e; };
    svg.replaceChildren();
    [0, 3, 6, 9, 12, 15, 18].forEach(p => {
      add("line", { x1: L, x2: W - R, y1: y(Math.pow(10, p)), y2: y(Math.pow(10, p)), class: "ch-grid" });
      add("text", { x: L - 6, y: y(Math.pow(10, p)) + 3, class: "ch-tick", "text-anchor": "end" }, "10" + String(p).replace(/\d/g, d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]));
    });
    [0, 10, 20, 30, 40].forEach(i => add("text", { x: x(i), y: H - 8, class: "ch-tick", "text-anchor": "middle" }, String(i)));
    add("text", { x: (W + L) / 2, y: H - 0, class: "ch-axis", "text-anchor": "middle" }, "döngü sayısı");
    const pts = arr => arr.slice(0, nMax + 1).map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    add("polyline", { points: pts(c.ideal), class: "ch-ideal" });
    add("polyline", { points: pts(c.real), class: "ch-real" });
    add("line", { x1: L, x2: W - R, y1: y(1e12), y2: y(1e12), class: "ch-cap" });
    add("text", { x: W - R - 2, y: y(1e12) - 4, class: "ch-cap-t", "text-anchor": "end" }, "reaktif sınırı");
  }

  function setupLab() {
    const range = $("annealRange");
    if (!range) return;
    const upd = () => {
      const T = Number(range.value), r = anneal(T);
      $("annealVal").textContent = T + " °C";
      $("barSpec").style.width = r.specific + "%"; $("barSpecV").textContent = r.specific + "%";
      $("barNon").style.width = r.nonspec + "%"; $("barNonV").textContent = r.nonspec + "%";
      const v = $("annealVerdict"); v.className = "lab-verdict " + r.tone; v.textContent = r.text;
      const main = $("mgMain"); main.style.opacity = String(Math.max(0.06, r.specific / 100));
      document.querySelectorAll(".mg-extra").forEach((e, i) => { e.style.opacity = String(Math.max(0, Math.min(1, (r.nonspec / 100) * 1.3 - i * 0.28))); });
    };
    range.addEventListener("input", upd); upd();

    const cr = $("cycRange"), er = $("effRange"), sr = $("startSel");
    const upd2 = () => {
      const n = Number(cr.value), e = Number(er.value) / 100, s = Number(sr.value);
      $("cycVal").textContent = n; $("effVal").textContent = "%" + er.value;
      const c = cycles(n, e, s);
      $("copyOut").textContent = fmtN(c.real[n]);
      $("idealOut").textContent = fmtN(c.ideal[n]);
      const v = $("cycVerdict");
      let tone = "ok", text;
      if (c.plateau) { tone = "warn"; text = "Plato: reaktifler tükeniyor, ek döngüler ürünü artırmaz. Gerekenden fazla döngü, özgül olmayan ürün birikimine yol açabilir."; }
      else if (c.real[n] < 1e10) { tone = "warn"; text = "Ürün miktarı henüz düşük; jelde görünür bir bant için genellikle on milyarlarca molekül gerekir. Döngü sayısını artır."; }
      else { text = "Jelde görünür bant için yeterli miktar. Verim %100'ün altına düştükçe kopya sayısı üstel olarak azalır."; }
      v.className = "lab-verdict " + tone; v.textContent = text;
      drawChart($("cycChart"), c, n);
    };
    [cr, er, sr].forEach(el => el.addEventListener("input", upd2)); upd2();
  }

  /* ===================== başlat ===================== */
  renderBoard();
  renderTable(false);
  setupRuler();
  setupLab();
  const nb = $("newCaseBtn");
  if (nb) nb.addEventListener("click", newCase);
})();
