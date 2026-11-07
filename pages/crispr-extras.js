/* CRISPR · ek mekanikler: hücre popülasyonu simülasyonu (9. adım), model notları,
   değerlendirme tamamlanınca 10. adımı işaretleme */
(() => {
  const $ = id => document.getElementById(id);
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---- Model notları: gerçek rehber RNA ~20 nt ---- */
  const note = (stage, text) => {
    const d = document.querySelector(`.stage[data-stage="${stage}"] .stage-desc`);
    if (!d || d.parentElement.querySelector(".model-note")) return;
    d.insertAdjacentElement("afterend", Object.assign(mk("p", "model-note", text)));
  };
  note(7, "Model notu: Gerçekte rehber RNA yaklaşık 20 nükleotit uzunluğundadır. Bu simülasyonda öğrenmeyi kolaylaştırmak için kısaltılmış bir dizi kullanılır.");
  note(6, "Model notu: Gerçek genomlarda NGG dizisi binlerce yerde bulunur; rehber RNA'nın hedefle eşleşmesi hangisine bağlanılacağını belirler.");

  /* ---- Hücre popülasyonu simülasyonu ---- */
  // [kesilmemiş, HDR, NHEJ] olasılıkları (eğitim amaçlı yuvarlatılmış değerler)
  const P = {
    "1-div":  [0.10, 0.30, 0.60],
    "1-rest": [0.12, 0.04, 0.84],
    "0-div":  [0.10, 0.00, 0.90],
    "0-rest": [0.12, 0.00, 0.88]
  };
  const OUT = {
    hdr:   { label: "Doğru düzeltilmiş (HDR)", cls: "o-hdr" },
    inf:   { label: "NHEJ · küçük değişiklik (çerçeve korunur)", cls: "o-inf" },
    fs:    { label: "NHEJ · çerçeve kayması (gen devre dışı)", cls: "o-fs" },
    none:  { label: "Kesilmemiş / değişmemiş", cls: "o-none" }
  };
  const GOAL = 20;

  const panel = $("repairSim");
  if (!panel) return;
  const grid = $("simGrid"), legend = $("simLegend"), verdict = $("simVerdict");
  let ran = false;

  function draw(cells) {
    grid.replaceChildren(...cells.map(k => { const s = mk("i", OUT[k].cls); s.title = OUT[k].label; return s; }));
  }
  draw(Array(100).fill("none").map(() => "none"));
  grid.classList.add("idle");

  function run() {
    const tpl = document.querySelector('input[name="simTpl"]:checked').value;
    const cell = document.querySelector('input[name="simCell"]:checked').value;
    const [pNone, pHdr, pNhej] = P[`${tpl}-${cell}`];
    const cells = [];
    for (let i = 0; i < 100; i++) {
      const r = Math.random();
      if (r < pNone) cells.push("none");
      else if (r < pNone + pHdr) cells.push("hdr");
      else cells.push(Math.random() < 2 / 3 ? "fs" : "inf");   // rastgele indel'lerin ~2/3'ü çerçeve kaydırır
    }
    // renkleri gruplayarak çiz (okunabilirlik)
    const order = ["hdr", "inf", "fs", "none"];
    const sorted = cells.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
    grid.classList.remove("idle");
    draw(sorted);
    const cnt = Object.fromEntries(order.map(k => [k, cells.filter(c => c === k).length]));
    legend.replaceChildren(...order.map(k => {
      const li = mk("li"); li.append(mk("i", OUT[k].cls), mk("span", null, `${OUT[k].label}: `), mk("b", null, String(cnt[k]))); return li;
    }));

    let tone, text;
    if (cnt.hdr >= GOAL) { tone = "ok"; text = `Hedefe ulaştın: ${cnt.hdr} hücre doğru düzeltildi. Şablon DNA ve bölünen hücreler HDR'yi mümkün kılar; yine de hücrelerin çoğu NHEJ ile onarıldı, yani sonuç %100 değil.`; }
    else if (tpl === "0") { tone = "bad"; text = `Şablon DNA olmadan HDR gerçekleşemez; kırıkların çoğu NHEJ ile onarıldı (${cnt.fs} hücrede çerçeve kayması). Şablon eklemeyi dene.`; }
    else if (cell === "rest") { tone = "warn"; text = `Dinlenen hücrelerde HDR çok seyrek çalışır (${cnt.hdr} hücre). HDR çoğunlukla S/G2 evresindeki bölünen hücrelerde etkindir; hücre evresini değiştirmeyi dene.`; }
    else { tone = "warn"; text = `Bu denemede yalnızca ${cnt.hdr} hücre düzeltildi. Sonuçlar rastgele değişir; deneyi tekrarla.`; }
    verdict.className = "lab-verdict " + tone;
    verdict.textContent = text;

    if (!ran) {
      ran = true;
      const btn = $("checkRepairBtn");
      if (btn && selectedRepair === "hdr" && !btn.disabled) btn.style.display = "inline-block";
    }
    try { window.BWL_CRISPR_SIM = { runs: (window.BWL_CRISPR_SIM?.runs || 0) + 1, best: Math.max(window.BWL_CRISPR_SIM?.best || 0, cnt.hdr) }; } catch (e) { /* sessiz */ }
  }
  $("simRun").addEventListener("click", run);

  // HDR seçilince simülasyonu göster; onay düğmesi ilk taramadan sonra açılır
  const hdr = $("actionHDR"), nhej = $("actionNHEJ"), checkBtn = $("checkRepairBtn");
  hdr.addEventListener("click", () => {
    if (typeof cutCompleted !== "undefined" && !cutCompleted) return;
    panel.hidden = false;
    // crispr.js dinleyicisi (DOMContentLoaded'da eklenir) bizden sonra çalışır; onun sonrasına bırak
    setTimeout(() => { if (!ran && checkBtn && !checkBtn.disabled) checkBtn.style.display = "none"; }, 0);
  });
  nhej.addEventListener("click", () => {
    if (typeof cutCompleted !== "undefined" && !cutCompleted) return;
    panel.hidden = false;
  });
  const fb = $("repairFeedback");
  if (fb) {
    hdr.addEventListener("click", () => setTimeout(() => {
      if (!ran && typeof cutCompleted !== "undefined" && cutCompleted) fb.textContent += " Şimdi aşağıdaki simülasyonla gerçek hücrelerde ne olacağını gör; onay düğmesi ilk taramadan sonra açılır.";
    }, 0));
  }

})();
