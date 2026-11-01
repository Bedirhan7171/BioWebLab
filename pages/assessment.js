/* ==========================================================================
   BioWebLab · Ölçme ve değerlendirme motoru
   - Ön test (3 soru, isteğe bağlı) ve son test (8 soru, her denemede farklı seçim/sıra)
   - Soru türleri: çoktan seçmeli, sıralama, kısa yanıt
   - Kazanım bazlı analiz, normalize öğrenme kazancı (Hake), tekrar önerileri
   - Yazdırılabilir öğrenme raporu ve ana sayfa öğrenme panosu
   Veriler yalnızca bu cihazda (localStorage) saklanır; sunucuya hiçbir şey gönderilmez.
   ========================================================================== */
(() => {
  "use strict";
  const Q = window.BWL_QUESTIONS || {};
  const KEY = "bwl-assess-v1";
  const N_POST = 8;
  const doc = document;

  /* ---------------------------- yardımcılar ---------------------------- */
  const mk = (tag, cls, txt) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const pct = (c, t) => t ? Math.round((c / t) * 100) : 0;
  const norm = s => String(s).toUpperCase().replace(/[\s\-–.,′'’]/g, "");
  const fmtDate = ts => new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const MODULES = ["adli-tip", "crispr", "protein"];

  function detectModule() {
    const p = location.pathname;
    return MODULES.find(m => p.includes(m)) || null;
  }

  /* ------------------------------- depo -------------------------------- */
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.modules) return s; } catch (e) { /* boş */ }
    return { name: "", modules: {} };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* depolama kapalı olabilir */ } }
  function modState(s, id) { return (s.modules[id] = s.modules[id] || { pre: null, attempts: [] }); }
  function lastAttempt(m) { return m.attempts.length ? m.attempts[m.attempts.length - 1] : null; }
  function bestPct(m) { return m.attempts.length ? Math.max(...m.attempts.map(a => a.pct)) : null; }

  /* Normalize kazanç (Hake): (son − ön) / (100 − ön) */
  function gainOf(prePct, postPct) {
    if (prePct == null || postPct == null) return null;
    if (prePct >= 100) return { g: null, label: "Ön testte tam puan alındığı için kazanç hesaplanamaz" };
    const g = (postPct - prePct) / (100 - prePct);
    const label = g >= 0.7 ? "Yüksek kazanç" : g >= 0.3 ? "Orta kazanç" : g >= 0 ? "Düşük kazanç" : "Düşüş (tekrar önerilir)";
    return { g: Math.round(g * 100) / 100, label };
  }

  /* --------------------------- soru seçimi ---------------------------- */
  function pickQuestions(pool, n) {
    const byObj = {};
    shuffle(pool).forEach(q => (byObj[q.obj] = byObj[q.obj] || []).push(q));
    const objs = Object.keys(byObj);
    const per = Math.floor(n / objs.length);
    let chosen = [];
    objs.forEach(o => { chosen = chosen.concat(byObj[o].slice(0, per)); });
    const rest = shuffle(pool.filter(q => !chosen.includes(q)));
    chosen = chosen.concat(rest.slice(0, Math.max(0, n - chosen.length)));
    return shuffle(chosen).slice(0, n);
  }

  /* ----------------------------- test akışı ---------------------------- */
  function runTest(root, id, mode) {
    const bank = Q[id];
    const isPre = mode === "pre";
    const pool = bank.questions.filter(q => q.set === mode);
    const list = isPre ? shuffle(pool) : pickQuestions(pool, Math.min(N_POST, pool.length));
    const st = { i: 0, res: [], t0: Date.now() };

    function header() {
      const wrap = mk("div", "bwl-q-head");
      wrap.append(mk("span", "bwl-q-count", `${isPre ? "Ön test · " : ""}Soru ${st.i + 1} / ${list.length}`));
      const bar = mk("div", "bwl-q-bar"); const fill = mk("i"); fill.style.width = (st.i / list.length * 100) + "%"; bar.append(fill);
      wrap.append(bar);
      return wrap;
    }

    function showQuestion() {
      const q = list[st.i];
      const card = mk("div", "bwl-q-card");
      card.append(header());
      card.append(mk("span", "bwl-chip", bank.objectives[q.obj].label));
      const title = mk("h3", "bwl-q-title", q.q); title.tabIndex = -1; title.id = "bwl-qt";
      card.append(title);

      let getAnswer, isCorrect, lock, ready = () => {};
      const checkBtn = mk("button", "bwl-btn", isPre ? (st.i === list.length - 1 ? "Bitir" : "Sonraki →") : "Cevabı kontrol et");
      checkBtn.type = "button"; checkBtn.disabled = true;
      const fb = mk("div", "bwl-fb"); fb.setAttribute("role", "status"); fb.setAttribute("aria-live", "polite");

      if (q.type === "mcq") {
        const opts = shuffle(q.options.map((t, i) => ({ t, i })));
        const grp = mk("div", "bwl-opts"); grp.setAttribute("role", "radiogroup"); grp.setAttribute("aria-labelledby", "bwl-qt");
        const labels = opts.map((o, k) => {
          const lab = mk("label", "bwl-opt");
          const inp = mk("input"); inp.type = "radio"; inp.name = "bwl-q"; inp.value = String(k);
          inp.addEventListener("change", () => { checkBtn.disabled = false; });
          lab.append(inp, mk("span", null, o.t));
          grp.append(lab); return lab;
        });
        card.append(grp);
        getAnswer = () => { const c = grp.querySelector("input:checked"); return c ? Number(c.value) : -1; };
        isCorrect = a => a >= 0 && opts[a].i === q.answer;
        lock = a => {
          grp.querySelectorAll("input").forEach(i => { i.disabled = true; });
          if (!isPre) {
            labels.forEach((lab, k) => { if (opts[k].i === q.answer) lab.classList.add("right"); });
            if (a >= 0 && opts[a].i !== q.answer) labels[a].classList.add("wrong");
          }
        };
      } else if (q.type === "order") {
        const items = shuffle(q.items.map((t, i) => ({ t, i })));
        let chosen = [];
        const slots = mk("ol", "bwl-slots"); const pool = mk("div", "bwl-pool");
        const render = () => {
          slots.replaceChildren(...chosen.map((o, k) => { const li = mk("li"); const b = mk("button", "bwl-chip-btn", o.t); b.type = "button"; b.title = "Geri almak için tıkla"; b.addEventListener("click", () => { if (checkBtn.dataset.done) return; chosen.splice(k, 1); render(); }); li.append(b); return li; }));
          if (!chosen.length) { const li = mk("li", "bwl-slot-empty", "Öğeleri sırayla seç"); slots.replaceChildren(li); }
          pool.replaceChildren(...items.filter(o => !chosen.includes(o)).map(o => { const b = mk("button", "bwl-chip-btn", o.t); b.type = "button"; b.addEventListener("click", () => { if (checkBtn.dataset.done) return; chosen.push(o); render(); }); return b; }));
          checkBtn.disabled = chosen.length !== items.length || !!checkBtn.dataset.done;
        };
        render();
        card.append(slots, pool);
        getAnswer = () => chosen.map(o => o.i);
        isCorrect = a => a.length === items.length && a.every((v, k) => v === k);
        lock = a => { if (!isPre) slots.classList.add(isCorrect(a) ? "right" : "wrong"); };
      } else { // input
        const inp = mk("input", "bwl-input"); inp.type = "text"; inp.placeholder = q.placeholder || "Yanıtın"; inp.autocomplete = "off"; inp.setAttribute("aria-labelledby", "bwl-qt");
        inp.addEventListener("input", () => { checkBtn.disabled = !inp.value.trim(); });
        inp.addEventListener("keydown", e => { if (e.key === "Enter" && !checkBtn.disabled) { e.preventDefault(); checkBtn.click(); } });
        card.append(inp);
        getAnswer = () => inp.value;
        isCorrect = a => q.accept.some(x => norm(x) === norm(a));
        lock = a => { inp.disabled = true; if (!isPre) inp.classList.add(isCorrect(a) ? "right" : "wrong"); };
      }

      card.append(fb, checkBtn);
      root.replaceChildren(card);
      title.focus({ preventScroll: true });

      checkBtn.addEventListener("click", () => {
        if (!checkBtn.dataset.done) {
          const ans = getAnswer(); const ok = isCorrect(ans);
          st.res.push({ id: q.id, obj: q.obj, ok });
          checkBtn.dataset.done = "1"; lock(ans);
          if (isPre) { next(); return; }
          fb.className = "bwl-fb show " + (ok ? "ok" : "bad");
          fb.replaceChildren(mk("strong", null, ok ? "✓ Doğru. " : "✗ Yanlış. "), mk("span", null, q.explain || ""));
          checkBtn.textContent = st.i === list.length - 1 ? "Sonucu gör" : "Sonraki soru →";
          checkBtn.disabled = false; checkBtn.focus();
        } else { next(); }
      });
    }

    function next() { st.i++; if (st.i < list.length) showQuestion(); else finish(); }

    function finish() {
      const c = st.res.filter(r => r.ok).length, t = st.res.length;
      const byObj = {};
      st.res.forEach(r => { const o = (byObj[r.obj] = byObj[r.obj] || { c: 0, t: 0 }); o.t++; if (r.ok) o.c++; });
      const store = load(); const m = modState(store, id);
      const rec = { c, t, pct: pct(c, t), ts: Date.now(), dur: Math.round((Date.now() - st.t0) / 1000), byObj, wrong: st.res.filter(r => !r.ok).map(r => r.id) };
      if (isPre) { if (!m.pre) m.pre = rec; } else m.attempts.push(rec);
      save(store);
      if (isPre) renderPreDone(root, id); else { renderResult(root, id, rec, m); window.dispatchEvent(new CustomEvent("bwl:quiz-done", { detail: { module: id, pct: rec.pct } })); }
    }

    showQuestion();
  }

  /* ---------------------- ön test kartı (1. adım) ---------------------- */
  function renderPreDone(root, id) {
    const m = modState(load(), id);
    root.replaceChildren(mk("div", "bwl-pre-done", `✓ Ön test kaydedildi (${m.pre.c}/${m.pre.t}). Modülün sonundaki testle karşılaştırılıp öğrenme kazancın hesaplanacak.`));
  }
  function mountPre(id) {
    const panel = doc.getElementById("panel1") || doc.querySelector('.stage[data-stage="1"]');
    if (!panel || !Q[id] || panel.querySelector(".bwl-pre")) return;
    const box = mk("div", "bwl-pre");
    const m = modState(load(), id);
    if (m.pre) { renderPreDone(box, id); }
    else {
      box.append(mk("strong", null, "📝 Ön bilgi testi (isteğe bağlı)"));
      box.append(mk("p", null, "3 kısa soru, yaklaşık 1 dakika. Modül sonundaki testle karşılaştırılarak öğrenme kazancın hesaplanır. Doğru cevaplar gösterilmez."));
      const b = mk("button", "bwl-btn", "Ön testi başlat"); b.type = "button";
      b.addEventListener("click", () => runTest(box, id, "pre"));
      box.append(b);
    }
    panel.append(box);
  }

  /* --------------------------- son test ekranı -------------------------- */
  function renderIntro(root, id) {
    const bank = Q[id]; const store = load(); const m = modState(store, id);
    const card = mk("div", "bwl-q-card bwl-intro");
    card.append(mk("h3", null, "Bilgi testi"));
    const nQ = Math.min(N_POST, bank.questions.filter(q => q.set === "post").length);
    card.append(mk("p", null, `${nQ} soru · çoktan seçmeli, sıralama ve kısa yanıt · her denemede sorular ve seçenek sırası değişir. Her sorudan sonra açıklamasını göreceksin.`));
    const ul = mk("ul", "bwl-obj-list");
    Object.values(bank.objectives).forEach(o => ul.append(mk("li", null, o.label)));
    card.append(mk("p", "bwl-sub", "Ölçülen kazanımlar:"), ul);
    if (m.attempts.length) card.append(mk("p", "bwl-prev-score", `Önceki en iyi sonucun: %${bestPct(m)} · ${m.attempts.length} deneme`));
    if (!m.pre) card.append(mk("p", "bwl-sub", "İpucu: Ön testi çözmediysen öğrenme kazancın hesaplanamaz. Ön test 1. adımın sonunda yer alır."));
    const b = mk("button", "bwl-btn", m.attempts.length ? "Testi tekrarla" : "Testi başlat"); b.type = "button";
    b.addEventListener("click", () => runTest(root, id, "post"));
    card.append(b);
    root.replaceChildren(card);
  }

  function bar(label, value, sub) {
    const row = mk("div", "bwl-bar-row");
    row.append(mk("span", "bwl-bar-label", label));
    const track = mk("div", "bwl-bar-track"); const fill = mk("i", value >= 70 ? "hi" : value >= 50 ? "mid" : "lo"); fill.style.width = value + "%"; track.append(fill);
    row.append(track, mk("b", "bwl-bar-val", sub || "%" + value));
    return row;
  }

  function levelText(p) { return p >= 90 ? "Mükemmel" : p >= 70 ? "İyi" : p >= 50 ? "Gelişiyor" : "Tekrar önerilir"; }

  function renderResult(root, id, rec, m) {
    const bank = Q[id]; const store = load();
    const card = mk("div", "bwl-q-card bwl-result");
    const score = mk("div", "bwl-score");
    score.append(mk("b", null, `%${rec.pct}`), mk("span", null, `${rec.c} / ${rec.t} doğru · ${levelText(rec.pct)}`));
    card.append(score);

    // öğrenme kazancı
    const g = m.pre ? gainOf(m.pre.pct, rec.pct) : null;
    if (g) {
      const gb = mk("div", "bwl-gain");
      gb.append(mk("strong", null, "Öğrenme kazancı"));
      gb.append(mk("p", null, `Ön test %${m.pre.pct} → Son test %${rec.pct}` + (g.g != null ? ` · normalize kazanç: ${String(g.g).replace(".", ",")} (${g.label})` : ` · ${g.label}`)));
      card.append(gb);
    } else {
      card.append(mk("p", "bwl-sub", "Ön test çözülmediği için öğrenme kazancı hesaplanamadı."));
    }

    // kazanım bazlı analiz
    card.append(mk("h4", null, "Kazanım analizi"));
    const weak = [];
    Object.entries(bank.objectives).forEach(([k, o]) => {
      const r = rec.byObj[k]; if (!r) return;
      const p = pct(r.c, r.t);
      card.append(bar(o.label, p, `${r.c}/${r.t}`));
      if (p < 70) weak.push(o);
    });

    if (weak.length) {
      const rv = mk("div", "bwl-review");
      rv.append(mk("strong", null, "Şu adımları tekrar gözden geçir:"));
      weak.forEach(o => {
        const b = mk("button", "bwl-link", `Adım ${o.step} → ${o.label}`); b.type = "button";
        b.addEventListener("click", () => {
          const btn = doc.querySelector(`.menu-item[data-step="${o.step}"], .step-btn[data-step="${o.step}"]`);
          if (btn) btn.click();
        });
        rv.append(b);
      });
      card.append(rv);
    } else {
      card.append(mk("p", "bwl-ok", "Tüm kazanımlarda %70 ve üzerindesin. Tebrikler!"));
    }

    // yanlış yapılan sorular
    if (rec.wrong.length) {
      const det = mk("details", "bwl-wrong");
      det.append(mk("summary", null, `Yanlış yaptığın sorular (${rec.wrong.length})`));
      rec.wrong.forEach(qid => {
        const q = bank.questions.find(x => x.id === qid); if (!q) return;
        const d = mk("div", "bwl-wrong-item"); d.append(mk("strong", null, q.q), mk("p", null, q.explain || "")); det.append(d);
      });
      card.append(det);
    }

    // rapor
    const nameWrap = mk("div", "bwl-name");
    const lab = mk("label", null, "Rapor için ad soyad (isteğe bağlı):"); lab.htmlFor = "bwl-name-inp";
    const inp = mk("input"); inp.type = "text"; inp.id = "bwl-name-inp"; inp.value = store.name || ""; inp.maxLength = 60; inp.autocomplete = "name";
    inp.addEventListener("input", () => { const s = load(); s.name = inp.value.trim(); save(s); });
    nameWrap.append(lab, inp);
    card.append(nameWrap);

    const acts = mk("div", "bwl-actions");
    const again = mk("button", "bwl-btn bwl-ghost", "↻ Testi tekrarla"); again.type = "button"; again.addEventListener("click", () => runTest(root, id, "post"));
    const rep = mk("button", "bwl-btn", "📄 Öğrenme raporunu aç"); rep.type = "button"; rep.addEventListener("click", openReport);
    acts.append(again, rep);
    card.append(acts);
    root.replaceChildren(card);
    card.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  /* ------------------------------- rapor ------------------------------- */
  function openReport() {
    doc.querySelectorAll(".bwl-report").forEach(e => e.remove());
    const store = load();
    const wrap = mk("div", "bwl-report"); wrap.setAttribute("role", "dialog"); wrap.setAttribute("aria-modal", "true"); wrap.setAttribute("aria-label", "Öğrenme raporu");
    const paper = mk("div", "bwl-paper");
    const bar0 = mk("div", "bwl-report-bar no-print");
    const printBtn = mk("button", "bwl-btn", "🖨 Yazdır / PDF olarak kaydet"); printBtn.type = "button"; printBtn.addEventListener("click", () => window.print());
    const close = mk("button", "bwl-btn bwl-ghost", "Kapat"); close.type = "button";
    const closeFn = () => { wrap.remove(); doc.body.classList.remove("bwl-printing"); };
    close.addEventListener("click", closeFn);
    bar0.append(printBtn, close);
    paper.append(bar0);

    paper.append(mk("h2", null, "🧬 BioWebLab Öğrenme Raporu"));
    const meta = mk("p", "bwl-report-meta");
    meta.textContent = `${store.name ? store.name + " · " : ""}${fmtDate(Date.now())}`;
    paper.append(meta);

    let any = false, sumBest = [], gains = [];
    MODULES.forEach(id => {
      const bank = Q[id]; if (!bank) return;
      const m = (store.modules[id]) || { pre: null, attempts: [] };
      const sec = mk("section", "bwl-rep-sec");
      sec.append(mk("h3", null, `${bank.icon} ${bank.title}`));
      if (!m.attempts.length && !m.pre) { sec.append(mk("p", "bwl-sub", "Bu modülde henüz test çözülmedi.")); paper.append(sec); return; }
      any = true;
      const la = lastAttempt(m), best = bestPct(m);
      const tbl = mk("div", "bwl-rep-grid");
      const cell = (k, v) => { const d = mk("div"); d.append(mk("small", null, k), mk("b", null, v)); tbl.append(d); };
      cell("Ön test", m.pre ? `%${m.pre.pct} (${m.pre.c}/${m.pre.t})` : "—");
      cell("Son test (son deneme)", la ? `%${la.pct} (${la.c}/${la.t})` : "—");
      cell("En iyi sonuç", best != null ? `%${best}` : "—");
      cell("Deneme sayısı", String(m.attempts.length));
      const g = m.pre && la ? gainOf(m.pre.pct, la.pct) : null;
      cell("Normalize kazanç", g ? (g.g != null ? `${String(g.g).replace(".", ",")} · ${g.label}` : g.label) : "—");
      if (la) cell("Süre (son deneme)", `${Math.floor(la.dur / 60)} dk ${la.dur % 60} sn`);
      sec.append(tbl);
      if (la) {
        sec.append(mk("h4", null, "Kazanım analizi (son deneme)"));
        Object.entries(bank.objectives).forEach(([k, o]) => { const r = la.byObj[k]; if (r) sec.append(bar(o.label, pct(r.c, r.t), `${r.c}/${r.t}`)); });
        sumBest.push(la.pct);
      }
      if (g && g.g != null) gains.push(g.g);
      paper.append(sec);
    });
    if (any && sumBest.length) {
      const avg = Math.round(sumBest.reduce((a, b) => a + b, 0) / sumBest.length);
      const sum = mk("p", "bwl-rep-sum", `Genel başarı ortalaması: %${avg}` + (gains.length ? ` · ortalama normalize kazanç: ${String(Math.round(gains.reduce((a, b) => a + b, 0) / gains.length * 100) / 100).replace(".", ",")}` : ""));
      paper.append(sum);
    }
    if (!any) paper.append(mk("p", null, "Henüz çözülmüş bir test yok. Modüllerin sonundaki bilgi testlerini çözdükçe rapor dolacak."));
    paper.append(mk("p", "bwl-foot", "Bu rapor tarayıcıda oluşturulur; sonuçlar yalnızca bu cihazda saklanır. Normalize kazanç (Hake): (son − ön) / (100 − ön)."));
    wrap.append(paper);
    wrap.addEventListener("keydown", e => { if (e.key === "Escape") closeFn(); });
    doc.body.append(wrap);
    doc.body.classList.add("bwl-printing");
    printBtn.focus();
  }

  /* ------------------------ ana sayfa: öğrenme panosu ------------------------ */
  function renderDashboard(root) {
    const store = load();
    root.replaceChildren();
    const grid = mk("div", "bwl-dash-grid");
    let taken = 0;
    MODULES.forEach(id => {
      const bank = Q[id]; if (!bank) return;
      const m = store.modules[id] || { pre: null, attempts: [] };
      const la = lastAttempt(m);
      const tile = mk("div", "bwl-tile");
      tile.append(mk("div", "bwl-tile-ico", bank.icon), mk("h3", null, bank.title));
      if (!la && !m.pre) {
        tile.append(mk("p", "bwl-sub", "Henüz test çözülmedi."));
      } else {
        if (la) taken++;
        if (m.pre) tile.append(bar("Ön test", m.pre.pct));
        if (la) tile.append(bar("Son test", la.pct));
        const g = m.pre && la ? gainOf(m.pre.pct, la.pct) : null;
        if (g) tile.append(mk("p", "bwl-tile-gain", g.g != null ? `Kazanç: ${String(g.g).replace(".", ",")} · ${g.label}` : g.label));
        tile.append(mk("p", "bwl-sub", `${m.attempts.length} deneme`));
      }
      grid.append(tile);
    });
    root.append(grid);
    const acts = mk("div", "bwl-actions");
    const rep = mk("button", "bwl-btn", "📄 Öğrenme raporunu aç"); rep.type = "button"; rep.addEventListener("click", openReport);
    const reset = mk("button", "bwl-btn bwl-ghost", "Verilerimi sıfırla"); reset.type = "button";
    reset.addEventListener("click", () => { if (confirm("Kayıtlı tüm test sonuçların bu cihazdan silinsin mi?")) { try { localStorage.removeItem(KEY); } catch (e) { /* sessiz */ } renderDashboard(root); } });
    acts.append(rep, reset);
    root.append(acts);
    root.append(mk("p", "bwl-sub", `Sonuçlar yalnızca bu cihazda saklanır. Tamamlanan modül testi: ${taken} / ${MODULES.length}`));
  }

  /* -------------------------------- başlat -------------------------------- */
  const id = detectModule();
  const quiz = doc.getElementById("bwl-quiz");
  if (quiz && Q[quiz.dataset.module]) { renderIntro(quiz, quiz.dataset.module); }
  if (id) mountPre(id);
  const dash = doc.getElementById("bwlDash");
  if (dash) renderDashboard(dash);

  // test paneline geçilince başa kaydır ve ana sayfa panosunu güncel tut
  window.addEventListener("pageshow", () => { if (dash) renderDashboard(dash); });

  window.BWLAssess = { openReport, load, gainOf };
})();
