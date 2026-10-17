// Yalnızca bu modül yenilendiğinde kendi ilerlemesini sıfırla.
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  sessionStorage.removeItem("crisprProgress");
}

const totalSteps = 9;

document.getElementById("resetProgressBtn")?.addEventListener("click", function () {
  if (!window.confirm("Bu modülün ilerlemesi sıfırlansın mı? Diğer modüller etkilenmez.")) return;
  sessionStorage.removeItem("crisprProgress");
  window.location.reload();
});

const progressKey = "crisprProgress";
const savedProgress = JSON.parse(sessionStorage.getItem(progressKey) || "null");
let currentStep = savedProgress?.currentStep || 1;
let unlockedStep = savedProgress?.unlockedStep || 1;

function saveProgress() {
  sessionStorage.setItem(progressKey, JSON.stringify({ currentStep, unlockedStep, completed }));
}

const completed = savedProgress?.completed || {
  1: false, 2: false, 3: false, 4: false, 5: false,
  6: false, 7: false, 8: false, 9: false
};

const correctTools = new Set(["cas9", "grna", "target-dna", "pam-check", "repair-template"]);
const selectedTools = new Set();

const targetDna = "ATGCCATGG";
const correctGrna = "UACGGUACC";

let selectedMutationIndex = null;
let selectedRepair = null;
let grnaPassed = false;
let cutCompleted = false;
let currentGrnaInput = ""; // Aşama 7 (Sentez) için eklendi

document.addEventListener("DOMContentLoaded", () => {
  setupStepButtons();
  setupNavigation();
  setupMutationActivity();
  setupToolActivity();
  setupPamActivity();
  setupGrnaActivity();
  setupCutActivity();
  setupRepairActivity();
  goToStep(currentStep);
  create3DDNA();
  initCrisprAdvancedSVG();
});

function setupStepButtons() {
  document.querySelectorAll(".step-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset.step);
      if (step > unlockedStep) {
        showToast("Bu aşama henüz kilitli. Önce mevcut görevi tamamlamalısın.", "warn");
        return;
      }
      goToStep(step);
    });
  });
}

function setupNavigation() {
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = Number(btn.dataset.next);
      if (!completed[currentStep]) {
        showToast("Devam etmeden önce bu aşamadaki görevi tamamlamalısın.", "warn");
        return;
      }
      goToStep(next);
    });
  });

  document.querySelectorAll("[data-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prev = Number(btn.dataset.prev);
      goToStep(prev);
    });
  });

  document.querySelectorAll("[data-complete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      completeStep(currentStep);
    });
  });
}

// YENİLENMİŞ AŞAMA 3: PROTEİN/KODON MANTIĞI
function setupMutationActivity() {
  document.querySelectorAll(".clickable-base").forEach((base) => {
    base.addEventListener("click", () => {
      document.querySelectorAll(".clickable-base").forEach((b) => b.classList.remove("selected"));
      base.classList.add("selected");
      selectedMutationIndex = Number(base.dataset.index);
    });
  });

  const checkBtn = document.querySelector("#checkMutationBtn");
  if (!checkBtn) return;

  checkBtn.addEventListener("click", () => {
    const fb = document.querySelector("#mutationFeedback");

    if (selectedMutationIndex === null) {
      setFeedback(fb, "Önce hastanın DNA'sında hatalı olduğunu düşündüğün baza tıklamalısın.", "warn");
      return;
    }

    if (selectedMutationIndex === 6) {
      setFeedback(
        fb,
        "Harika analiz! TGG (Trp) olması gereken kodon, en baştaki T'nin A'ya dönüşmesiyle AGG (Arg) olmuş. Hedef mutasyonu doğru tespit ettin.",
        "success"
      );
      completeStep(3);
    } else {
      setFeedback(
        fb,
        "Yanlış baz. İpucu: Hastanın proteini yanlışlıkla 'Arg' üretiyor. Kodon sözlüğüne bakarak Arg üreten kodondaki hatalı harfi bulmaya çalış.",
        "error"
      );
    }
  });
}

function setupToolActivity() {
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;

      if (selectedTools.has(tool)) {
        selectedTools.delete(tool);
        btn.classList.remove("selected", "correct", "wrong");
      } else {
        selectedTools.add(tool);
        btn.classList.add("selected");

        if (correctTools.has(tool)) {
          btn.classList.add("correct");
        } else {
          btn.classList.add("wrong");
        }
      }
    });
  });

  const checkBtn = document.querySelector("#checkToolsBtn");
  if (!checkBtn) return;

  checkBtn.addEventListener("click", () => {
    const fb = document.querySelector("#toolsFeedback");
    const selectedArray = Array.from(selectedTools);

    const hasAllCorrect = Array.from(correctTools).every((tool) => selectedTools.has(tool));
    const hasWrong = selectedArray.some((tool) => !correctTools.has(tool));

    if (!selectedArray.length) {
      setFeedback(fb, "CRISPR sistemini kurmak için gerekli parçaları seçmelisin.", "warn");
      return;
    }

    if (hasAllCorrect && !hasWrong) {
      setFeedback(fb, "Harika. Cas9, gRNA, hedef DNA, PAM kontrolü ve sağlıklı onarım şablonu bu senaryo için doğru sistem parçalarıdır.", "success");
      completeStep(5);
      return;
    }

    if (hasWrong) {
      setFeedback(fb, "Bazı seçtiğin parçalar CRISPR-Cas9 sisteminin doğrudan parçası değil. Çeldiricileri ele.", "error");
      return;
    }

    setFeedback(fb, "Doğru parçaların bir kısmını seçtin ama sistem tamamlanmadı. Eksikleri tamamla.", "warn");
  });
}

// YENİLENMİŞ AŞAMA 6: PAM TARAYICI CİHAZI
function setupPamActivity() {
  const pamBases = document.querySelectorAll(".pam-base");
  const checkBtn = document.querySelector("#checkPamBtn");
  const fb = document.querySelector("#pamFeedback");
  
  let selectedStartIndex = null;
  let currentScannedSequence = "";

  pamBases.forEach((base, i) => {
    base.addEventListener("click", () => {
      if (i > pamBases.length - 3) {
        showToast("Tarayıcı dizinin dışına çıkamaz. Daha geriden seç.", "warn");
        return;
      }

      selectedStartIndex = i;
      currentScannedSequence = pamBases[i].textContent + pamBases[i+1].textContent + pamBases[i+2].textContent;

      pamBases.forEach(b => b.classList.remove("scanned"));
      
      pamBases[i].classList.add("scanned");
      pamBases[i+1].classList.add("scanned");
      pamBases[i+2].classList.add("scanned");
    });
  });

  if (!checkBtn) return;

  checkBtn.addEventListener("click", () => {
    if (selectedStartIndex === null) {
      setFeedback(fb, "Önce DNA şeridi üzerinde bir yere tıklayıp tarama yapmalısın.", "warn");
      return;
    }

    if (currentScannedSequence.endsWith("GG")) {
      setFeedback(fb, `Mükemmel! Seçtiğin [ ${currentScannedSequence} ] dizisi NGG kuralına tam uyuyor. Cas9 enzimi bu noktadan bağlanacak.`, "success");
      completeStep(6);
    } else {
      setFeedback(fb, `Yanlış bölge. Seçtiğin [ ${currentScannedSequence} ] dizisi NGG kuralına uymuyor. Son iki harfin G ve G olmasına dikkat et.`, "error");
    }
  });
}

// YENİLENMİŞ AŞAMA 7: gRNA SENTEZ KLAVYESİ
function setupGrnaActivity() {
  const keys = document.querySelectorAll(".key-btn[data-base]");
  const delBtn = document.querySelector("#delBaseBtn");
  const checkBtn = document.querySelector("#checkGrnaBtn");
  const hintBtn = document.querySelector("#hintGrnaBtn");

  if (!checkBtn) return;

  keys.forEach(key => {
    key.addEventListener("click", () => {
      if (currentGrnaInput.length < targetDna.length) {
        currentGrnaInput += key.dataset.base;
        renderMatchBoard(currentGrnaInput, false);
      } else {
        showToast("gRNA dizisi maksimum uzunluğa ulaştı. Kontrol edebilirsin.", "warn");
      }
    });
  });

  if (delBtn) {
    delBtn.addEventListener("click", () => {
      if (currentGrnaInput.length > 0) {
        currentGrnaInput = currentGrnaInput.slice(0, -1);
        renderMatchBoard(currentGrnaInput, false);
      }
    });
  }

  checkBtn.addEventListener("click", () => {
    const fb = document.querySelector("#grnaFeedback");

    if (currentGrnaInput.length === 0) {
      setFeedback(fb, "Önce nükleotid klavyesinden gRNA dizisini sentezlemelisin.", "warn");
      return;
    }

    if (currentGrnaInput.length !== correctGrna.length) {
      setFeedback(fb, `gRNA eksik. Şuan ${currentGrnaInput.length} baz girdin, tüm hedef DNA'yı (${correctGrna.length} baz) karşılamalısın.`, "warn");
      renderMatchBoard(currentGrnaInput, true);
      return;
    }

    const mismatches = countMismatches(currentGrnaInput, correctGrna);

    if (mismatches === 0) {
      grnaPassed = true;
      setFeedback(fb, "Sentez Başarılı! gRNA hedef DNA dizisine tam uyumlu. Cas9 enzimini doğru yere yönlendirebiliriz.", "success");
      renderMatchBoard(currentGrnaInput, true);
      completeStep(7);
    } else {
      setFeedback(fb, `Sentez Hatası: ${mismatches} baz eşleşmedi. Kırmızı ile işaretlenen bazları silip (⌫) tekrar sentezle.`, "error");
      renderMatchBoard(currentGrnaInput, true);
    }
  });

  if (hintBtn) {
    hintBtn.addEventListener("click", () => {
      const fb = document.querySelector("#grnaFeedback");
      setFeedback(fb, "İpucu: DNA'da A varsa klavyeden U tuşuna, T varsa A tuşuna, G varsa C tuşuna, C varsa G tuşuna basmalısın.", "warn");
    });
  }

  renderMatchBoard("", false);
}

function setupCutActivity() {
  const armBtn = document.querySelector("#armCas9Btn");
  const cutBtn = document.querySelector("#cutDnaBtn");
  const scene = document.querySelector("#cutScene");
  const fb = document.querySelector("#cutFeedback");
  
  const cutControls = document.querySelector("#cutControls");
  const cutSlider = document.querySelector("#cutSlider");

  if (!armBtn || !cutBtn || !scene) return;

  armBtn.addEventListener("click", () => {
    if (!grnaPassed) {
      setFeedback(fb, "Önce gRNA sentezini (Aşama 7) tamamlamalısın.", "warn");
      return;
    }
    
    // Cas9'u animasyonla getir
    scene.classList.add("armed");
    
    // Arayüzü değiştir
    document.querySelector("#armContainer").style.display = "none";
    cutControls.style.display = "block";
    
    setFeedback(fb, "Cas9 bağlandı! Lazer kaydırıcısını hareket ettirerek kesim noktasını (Sarı PAM kutusundan 3 harf sol tarafa) bul.", "warn");
  });

  // Slider (Kaydırıcı) Dinleyicisi
  if(cutSlider) {
    cutSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      const targetSvgLine = document.querySelector("#s8-target-line");
      
      if(targetSvgLine) {
        // SVG'deki nükleotid aralıkları: startX=60, spacing=45. Lazer tam aralığa otursun (+22.5)
        const lineX = 60 + (val * 45) + 22.5; 
        targetSvgLine.setAttribute("x1", lineX);
        targetSvgLine.setAttribute("x2", lineX);
        
        // Biyolojik doğru nokta: 5. İndeks
        if(val === 5) {
          targetSvgLine.setAttribute("stroke", "#57f287"); // Yeşil
          targetSvgLine.setAttribute("stroke-dasharray", "0"); // Düz çizgi
          cutBtn.disabled = false;
          setFeedback(fb, "HEDEF KİLİTLENDİ! Tam olarak PAM'dan 3 baz geridesin. Kesimi başlatabilirsin.", "success");
        } else {
          targetSvgLine.setAttribute("stroke", "#ff5c7a"); // Kırmızı
          targetSvgLine.setAttribute("stroke-dasharray", "5,5"); // Kesik çizgi
          cutBtn.disabled = true;
          setFeedback(fb, "Yanlış Hedef. Makasın keseceği yer PAM bölgesinden tam 3 nükleotid geride olmalı.", "error");
        }
      }
    });
  }

  cutBtn.addEventListener("click", () => {
    const dna = document.querySelector(".crispr-svg-container");
    dna.classList.add("cut");
    cutCompleted = true;
    
    // Kontrolleri gizle, sonucu göster
    cutControls.style.display = "none";
    document.querySelector("#s8-target-line").setAttribute("opacity", "0");
    
    setFeedback(fb, "Kesim Başarılı! DNA zinciri tam hedeflenen noktadan koptu. Şimdi hücrenin bu kırığı nasıl onaracağını gözlemle.", "success");
    completeStep(8);
  });
}

function setupRepairActivity() {
  const btnNHEJ = document.querySelector("#actionNHEJ");
  const btnHDR = document.querySelector("#actionHDR");
  const gap = document.querySelector("#dnaGap");
  const fb = document.querySelector("#repairFeedback");
  const checkBtn = document.querySelector("#checkRepairBtn");

  if(!btnNHEJ || !btnHDR) return;

  btnNHEJ.addEventListener("click", () => {
    if (!cutCompleted) {
      setFeedback(fb, "Uyarı: Cas9 kesimi henüz yapılmadı! Önce Aşama 8'i tamamla.", "warn"); 
      return;
    }
    
    btnNHEJ.classList.add("selected");
    btnHDR.classList.remove("selected");
    
    // NHEJ Animasyonu: Rastgele bozuk dizi çarpışarak birleşir
    gap.innerHTML = `
      <div class="nhej-repair">
         <span class="b bad">G</span><span class="b bad">X</span><span class="b bad">T</span>
      </div>`;
      
    setFeedback(fb, "HATA: NHEJ (Homolog Olmayan Uç Birleştirme) gerçekleşti. Kırık birleşti ama araya rastgele harfler girdiği için genin anlamı bozuldu (Knock-out). Hastayı iyileştirmek için diğer yöntemi dene.", "error");
    
    checkBtn.style.display = "none";
    selectedRepair = "nhej";
  });

  btnHDR.addEventListener("click", () => {
    if (!cutCompleted) {
      setFeedback(fb, "Uyarı: Cas9 kesimi henüz yapılmadı! Önce Aşama 8'i tamamla.", "warn"); 
      return;
    }

    btnHDR.classList.add("selected");
    btnNHEJ.classList.remove("selected");

    // HDR Animasyonu: Şablon yukarıdan iner ve kusursuz birleşir
    gap.innerHTML = `
      <div class="hdr-template-slide">
        <div class="template-label">Sağlıklı Şablon DNA</div>
        <div class="hdr-repair">
          <span class="b good">T</span><span class="b good">G</span><span class="b good">G</span>
        </div>
      </div>
    `;
    
    // CSS Transition'ın tetiklenmesi için küçük bir gecikme
    setTimeout(() => {
        gap.querySelector('.hdr-template-slide').classList.add('applied');
    }, 50);

    setFeedback(fb, "MÜKEMMEL! HDR (Homoloji Yönlendirmeli Onarım) ile hücreye verdiğimiz sağlıklı şablon kullanıldı ve DNA mutasyonsuz şekilde kusursuzca düzeltildi.", "success");
    
    checkBtn.style.display = "inline-block";
    selectedRepair = "hdr";
  });

  checkBtn.addEventListener("click", () => {
     if(selectedRepair === "hdr") {
        completeStep(9);
        checkBtn.textContent = "✓ Onarım Tamamlandı";
        checkBtn.disabled = true;
     }
  });
}
function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  currentStep = step;
  saveProgress();

  document.querySelectorAll(".stage").forEach((stage) => {
    stage.classList.remove("active");
  });

  const activeStage = document.querySelector(`.stage[data-stage="${step}"]`);
  if (activeStage) {
    activeStage.classList.add("active");
  }

  refreshUI();

  const mainCard = document.querySelector(".stage-card");
  if (mainCard) {
    mainCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function completeStep(step) {
  completed[step] = true;
  if (step === unlockedStep && unlockedStep < totalSteps) {
    unlockedStep += 1;
  }
  saveProgress();
  refreshUI();
}

function refreshUI() {
  document.querySelectorAll(".step-btn").forEach((btn) => {
    const step = Number(btn.dataset.step);
    btn.classList.toggle("active", step === currentStep);
    btn.classList.toggle("locked", step > unlockedStep);
    btn.classList.toggle("done", Boolean(completed[step]));

    const state = btn.querySelector(".step-state");
    if (state) {
      if (completed[step]) {
        state.textContent = "✓";
      } else if (step > unlockedStep) {
        state.textContent = "🔒";
      } else {
        state.textContent = "•";
      }
    }
  });

  const progressText = document.querySelector("#progressText");
  const progressFill = document.querySelector("#progressFill");

  const doneCount = Object.values(completed).filter(Boolean).length;
  const percent = Math.max(10, Math.round((doneCount / totalSteps) * 100));

  if (progressText) {
    progressText.textContent = `${doneCount}/${totalSteps}`;
  }

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

  document.querySelectorAll("[data-next]").forEach((btn) => {
    const next = Number(btn.dataset.next);
    btn.disabled = !completed[currentStep] || next > unlockedStep;
  });
}

// YENİLENMİŞ AŞAMA 7 MATCH BOARD
function renderMatchBoard(value, showResults) {
  const board = document.querySelector("#matchBoard");
  if (!board) return;

  const dnaRow = document.createElement("div");
  dnaRow.className = "match-row";

  const guideRow = document.createElement("div");
  guideRow.className = "match-row";

  for (let i = 0; i < targetDna.length; i++) {
    const dnaCell = document.createElement("div");
    dnaCell.className = "match-cell";
    dnaCell.textContent = targetDna[i];
    dnaRow.appendChild(dnaCell);

    const guideCell = document.createElement("div");
    guideCell.className = "match-cell";
    
    const currentBase = value[i];
    if (currentBase) {
      guideCell.textContent = currentBase;
      if (showResults) {
        const expected = correctGrna[i];
        guideCell.classList.add(currentBase === expected ? "ok" : "bad");
      }
    } else {
      guideCell.textContent = "_";
      guideCell.style.color = "rgba(255,255,255,0.15)";
    }

    guideRow.appendChild(guideCell);
  }

  board.innerHTML = "";
  board.appendChild(createMatchLabel("Hedef DNA Bölgesi"));
  board.appendChild(dnaRow);
  board.appendChild(createMatchLabel("Sentezlenen gRNA"));
  board.appendChild(guideRow);
}

function createMatchLabel(text) {
  const label = document.createElement("div");
  label.className = "mini-note";
  label.textContent = text;
  return label;
}

function countMismatches(value, expected) {
  let mismatches = 0;
  for (let i = 0; i < expected.length; i++) {
    if (value[i] !== expected[i]) {
      mismatches += 1;
    }
  }
  return mismatches;
}

function setFeedback(element, message, type) {
  if (!element) return;
  element.className = `feedback ${type || ""}`;
  element.textContent = message;
}

function showToast(message, type) {
  const toast = document.querySelector("#toast");
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.className = `toast show ${type || ""}`;

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = "toast";
  }, 2600);
}

function create3DDNA() {
  const container = document.getElementById("dnaContainer");
  if (!container) return;

  const targetSequence = "ATGCCATGGATGCCATGG"; 
  const complements = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };

  for (let i = 0; i < targetSequence.length; i++) {
    const topBase = targetSequence[i];
    const bottomBase = complements[topBase];

    const rung = document.createElement("div");
    rung.className = "dna-rung-3d";
    rung.style.animationDelay = `${i * -0.3}s`;

    rung.innerHTML = `
      <div class="backbone-dot top"></div>
      <div class="base-pair">
        <div class="base-half base-${topBase}"></div>
        <div class="base-half base-${bottomBase}"></div>
      </div>
      <div class="backbone-dot bottom"></div>
    `;

    container.appendChild(rung);
  }
}

// YENİLENMİŞ AŞAMA 8 (SARMAL VE R-LOOP)
function initCrisprAdvancedSVG() {
  const visualArea = document.getElementById('cutDna');
  if (!visualArea) return;
  visualArea.innerHTML = '';

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 900 400");
  svg.setAttribute("class", "crispr-svg");

  const defs = document.createElementNS(svgNS, "defs");
  defs.innerHTML = `
      <radialGradient id="cas9-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 209, 102, 0.18)" />
          <stop offset="100%" stop-color="rgba(255, 209, 102, 0.02)" />
      </radialGradient>
      <filter id="glow-light">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
  `;
  svg.appendChild(defs);

  const cas9Group = document.createElementNS(svgNS, "g");
  cas9Group.setAttribute("id", "s8-cas9");
  cas9Group.setAttribute("style", "opacity:0; transform: translateY(-40px) scale(0.9); transform-origin: 50% 50%; transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);");
  cas9Group.innerHTML = `
      <path d="M 200 200 C 160 100, 260 40, 480 40 C 700 40, 800 120, 740 230 C 700 320, 520 350, 420 340 C 260 320, 240 300, 200 200 Z"
            fill="url(#cas9-grad)" stroke="rgba(255, 209, 102, 0.25)" stroke-width="2"/>
      <text x="460" y="80" fill="rgba(255,255,255,0.8)" font-size="20" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="4">Cas9 NÜKLEAZ</text>
  `;
  svg.appendChild(cas9Group);

  const leftArm = document.createElementNS(svgNS, "g"); leftArm.setAttribute("id", "s8-left-arm");
  const rightArm = document.createElementNS(svgNS, "g"); rightArm.setAttribute("id", "s8-right-arm");
  const grnaGroup = document.createElementNS(svgNS, "g");

  const seq = "GATATGCCATGGCTACA";
  const comp = { 'A':'T', 'T':'A', 'C':'G', 'G':'C' };
  const colors = { 'A':'#38f8ff', 'T':'#ffd166', 'C':'#57f287', 'G':'#9b5cff', 'U':'#ff5c7a' };
  
  const startX = 60, spacing = 45, centerY = 200, amp = 45, freq = 0.035;
  const cutIndex = 5; 
  const cutX = startX + cutIndex * spacing + (spacing / 2);

  const rLoopStartIndex = 3;
  const rLoopEndIndex = 11;
  const rLoopStart = startX + rLoopStartIndex * spacing;
  const rLoopEnd = startX + rLoopEndIndex * spacing;

  function smoothstep(min, max, value) {
    let x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  function getStrandY(x) {
      let yTopHelix = centerY + Math.sin(x * freq) * amp;
      let yBotHelix = centerY + Math.sin(x * freq + Math.PI) * amp;
      let yTopBubble = centerY - 55;
      let yBotBubble = centerY + 35;
      let blendStart = smoothstep(rLoopStart - 50, rLoopStart + 20, x);
      let blendEnd = 1 - smoothstep(rLoopEnd - 20, rLoopEnd + 50, x);
      let blend = blendStart * blendEnd;

      return {
          yt: yTopHelix * (1 - blend) + yTopBubble * blend,
          yb: yBotHelix * (1 - blend) + yBotBubble * blend,
          blend: blend
      };
  }

  let ltPath="", lbPath="", rtPath="", rbPath="";
  for(let x = startX; x <= startX + (seq.length - 1) * spacing; x += 2) {
      let { yt, yb } = getStrandY(x);
      
      if (x <= cutX) {
          ltPath += (x === startX ? "M" : "L") + ` ${x} ${yt} `;
          lbPath += (x === startX ? "M" : "L") + ` ${x} ${yb} `;
      } else {
          rtPath += (rtPath === "" ? "M" : "L") + ` ${x} ${yt} `;
          rbPath += (rbPath === "" ? "M" : "L") + ` ${x} ${yb} `;
      }
  }

  leftArm.innerHTML += `
      <path d="${ltPath}" fill="none" stroke="#38f8ff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
      <path d="${lbPath}" fill="none" stroke="#4f8cff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
  `;
  rightArm.innerHTML += `
      <path d="${rtPath}" fill="none" stroke="#38f8ff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
      <path d="${rbPath}" fill="none" stroke="#4f8cff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
  `;

  let grnaPath = "";
  for(let i=0; i<seq.length; i++) {
      let x = startX + i * spacing;
      let { yt, yb, blend } = getStrandY(x);
      
      let tChar = seq[i];
      let bChar = comp[tChar];
      let tColor = colors[tChar];
      let bColor = colors[bChar];

      let isLeft = i <= cutIndex;
      let baseHTML = "";

      if (blend > 0.7) {
          let gChar = tChar === 'A' ? 'U' : (tChar === 'T' ? 'A' : (tChar === 'C' ? 'G' : 'C'));
          let gColor = colors[gChar];
          let gY = yt - 40;

          grnaPath += (i === rLoopStartIndex ? `M ${x-20} ${gY-15} Q ${x} ${gY} ` : "L ") + `${x} ${gY} `;

          baseHTML += `<line x1="${x}" y1="${yt}" x2="${x}" y2="${gY}" stroke="${tColor}" stroke-width="2" stroke-dasharray="3,3" opacity="0.6"/>`;
          baseHTML += `<circle cx="${x}" cy="${yt}" r="4" fill="${tColor}"/>
                       <text x="${x}" y="${yt + 18}" fill="${tColor}" font-size="12" font-weight="bold" text-anchor="middle">${tChar}</text>`;
          baseHTML += `<circle cx="${x}" cy="${yb}" r="4" fill="${bColor}"/>
                       <text x="${x}" y="${yb - 10}" fill="${bColor}" font-size="12" font-weight="bold" text-anchor="middle">${bChar}</text>`;
          baseHTML += `<rect x="${x-12}" y="${gY-12}" width="24" height="24" rx="6" fill="${gColor}" fill-opacity="0.15" stroke="${gColor}" stroke-width="1.5"/>
                       <text x="${x}" y="${gY+5}" fill="${gColor}" font-size="13" font-weight="bold" text-anchor="middle">${gChar}</text>`;

          if (i >= 9 && i <= 11) {
              baseHTML += `<rect x="${x-14}" y="${yb-22}" width="28" height="30" rx="8" fill="rgba(255, 209, 102, 0.1)" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="2,2"/>`;
              if(i === 10) baseHTML += `<text x="${x}" y="${yb + 26}" fill="#ffd166" font-size="10" font-weight="bold" text-anchor="middle">PAM</text>`;
          }

      } else {
          let isBack = Math.cos(x * freq) < 0;
          let opacity = (isBack && blend < 0.2) ? 0.35 : 1;
          
          baseHTML += `<g opacity="${opacity}">
              <line x1="${x}" y1="${yt}" x2="${x}" y2="${yb}" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
              <circle cx="${x}" cy="${yt}" r="4" fill="${tColor}"/>
              <text x="${x}" y="${yt + (yt < yb ? -12 : 20)}" fill="${tColor}" font-size="12" font-weight="bold" text-anchor="middle">${tChar}</text>
              <circle cx="${x}" cy="${yb}" r="4" fill="${bColor}"/>
              <text x="${x}" y="${yb + (yb < yt ? -12 : 20)}" fill="${bColor}" font-size="12" font-weight="bold" text-anchor="middle">${bChar}</text>
          </g>`;
      }

      if (isLeft) leftArm.innerHTML += baseHTML;
      else rightArm.innerHTML += baseHTML;
  }

  grnaGroup.innerHTML = `
      <path d="${grnaPath}" fill="none" stroke="#57f287" stroke-width="4" stroke-linecap="round" filter="url(#glow-light)"/>
      <text x="140" y="80" fill="#57f287" font-size="14" font-weight="bold" filter="url(#glow-light)">gRNA Rehberi</text>
  `;

  svg.appendChild(leftArm);
  svg.appendChild(rightArm);
  
  const toolsGroup = document.createElementNS(svgNS, "g");
  toolsGroup.setAttribute("id", "s8-grna");
  toolsGroup.setAttribute("style", "opacity:0; transform: translateY(-15px); transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);");
  toolsGroup.appendChild(grnaGroup);
  svg.appendChild(toolsGroup);
  // Lazerden hemen önce bu Hedef Çizgisini ekle
  const targetLine = document.createElementNS(svgNS, "line");
  targetLine.setAttribute("id", "s8-target-line");
  targetLine.setAttribute("x1", startX + 22.5); // 0. indeksten başlar
  targetLine.setAttribute("y1", "30");
  targetLine.setAttribute("x2", startX + 22.5);
  targetLine.setAttribute("y2", "370");
  targetLine.setAttribute("stroke", "transparent"); // Başlangıçta görünmez
  targetLine.setAttribute("stroke-width", "4");
  targetLine.setAttribute("stroke-dasharray", "5,5");
  targetLine.setAttribute("style", "transition: x1 0.15s ease, x2 0.15s ease;");
  svg.appendChild(targetLine);

  const laser = document.createElementNS(svgNS, "line");
  laser.setAttribute("id", "s8-laser");
  laser.setAttribute("x1", cutX);
  laser.setAttribute("y1", "40");
  laser.setAttribute("x2", cutX);
  laser.setAttribute("y2", "360");
  laser.setAttribute("stroke", "#ffffff");
  laser.setAttribute("stroke-width", "0");
  laser.setAttribute("filter", "url(#glow-light)");
  svg.appendChild(laser);

  visualArea.appendChild(svg);
}