// Yenilemede geçici ilerleme kaydını sıfırla; normal sayfa geçişlerinde koru.
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  ["adliTipProgress", "proteinProgress", "crisprProgress"].forEach(key => sessionStorage.removeItem(key));
}

const menuItems = document.querySelectorAll(".menu-item");
const panels = document.querySelectorAll(".panel");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const progressKey = "adliTipProgress";
const savedProgress = JSON.parse(sessionStorage.getItem(progressKey) || "null");
let currentStep = savedProgress?.currentStep || 1;
const totalSteps = 7;
let unlockedStep = savedProgress?.unlockedStep || 1;

function saveProgress() {
  sessionStorage.setItem(progressKey, JSON.stringify({ currentStep, unlockedStep }));
}

function showStep(stepNumber) {
  if (stepNumber > unlockedStep) return;

  currentStep = stepNumber;
  saveProgress();

  menuItems.forEach(item => {
    item.classList.remove("active");
    if (Number(item.dataset.step) === stepNumber) {
      item.classList.add("active");
    }
  });

  panels.forEach(panel => panel.classList.remove("active-panel"));

  const activePanel = document.getElementById("panel" + stepNumber);
  if (activePanel) activePanel.classList.add("active-panel");

  updateProgress();
  updatePageTitle();
}

function updateProgress() {
  const percent = (currentStep / totalSteps) * 100;
  progressFill.style.width = percent + "%";
  progressText.textContent = `${currentStep} / ${totalSteps}`;
}

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    const step = Number(item.dataset.step);
    if (step <= unlockedStep) showStep(step);
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" && currentStep < unlockedStep) {
    showStep(currentStep + 1);
  }

  if (e.key === "ArrowLeft" && currentStep > 1) {
    showStep(currentStep - 1);
  }
});

function unlockNextStep() {
  const nextStep = currentStep + 1;

  if (nextStep > totalSteps) return;

  if (unlockedStep < nextStep) {
    unlockedStep = nextStep;
    saveProgress();
    refreshLocks();
  }

  showStep(nextStep);
}

function refreshLocks() {
  menuItems.forEach(item => {
    const step = Number(item.dataset.step);
    const icon = item.querySelector("span");

    if (step <= unlockedStep) {
      item.classList.remove("locked");
      icon.textContent = step;
    } else {
      item.classList.add("locked");
      icon.textContent = "🔒";
    }
  });
}

const titles = {
  1:"Giriş",
  2:"Kavramlar",
  3:"PCR Hazırlık",
  4:"PCR Mantığı",
  5:"PCR Simülasyonu",
  6:"Jel Elektroforezi",
  7:"Karşılaştırma"
};

function updatePageTitle(){
  document.title = "Adli Tıp Laboratuvarı | " + titles[currentStep];
}

function checkPCRMix(){
  const selected = [
    ...document.querySelectorAll('#panel3 input[type="checkbox"]:checked')
  ].map(item => item.value);

  const required = ["dna", "primer", "taq", "dntp", "buffer"];

  const resultBox = document.getElementById("mixResult");
  const liquid = document.getElementById("tubeLiquid");

  const correct =
    required.every(item => selected.includes(item)) &&
    selected.length === required.length;

  if(correct){
    resultBox.innerHTML = "✅ PCR karışımı hazırlandı. Sonraki bölüm açıldı.";
    resultBox.style.color = "#166534";
    liquid.style.height = "72%";

    if(unlockedStep < 4){
      unlockedStep = 4;
      refreshLocks();
    }
  }else{
    resultBox.innerHTML = "❌ Hatalı seçim yaptınız.";
    resultBox.style.color = "#b91c1c";
    liquid.style.height = "0%";
  }
}

/* PCR SİMÜLASYONU */

let pcrOrder = [95, 55, 72];
let pcrIndex = 0;
let completedCycles = 0;
let dnaCopies = 1;

function selectTemperature(temp){
  const display = document.getElementById("temperatureDisplay");
  const feedback = document.getElementById("pcrFeedback");
  const status = document.getElementById("pcrStatus");
  const cycleCount = document.getElementById("cycleCount");
  const copies = document.getElementById("copyCount");
  const dnaArea = document.getElementById("dnaVisualArea");
  const dnaLabel = document.getElementById("dnaLabel");
  const dnaNote = document.getElementById("dnaNote");
  const cards = document.querySelectorAll(".pcr-step-card");

  display.textContent = temp + "°C";

  if(temp !== pcrOrder[pcrIndex]){
    feedback.innerHTML = "❌ Bu sıcaklık bu aşama için uygun değil. Önceki bölümdeki PCR mantığını hatırla.";
    feedback.style.color = "#b91c1c";
    return;
  }

  feedback.style.color = "#166534";
  cards.forEach(card => card.classList.remove("active-step"));
  // Yeni PCR döngüsünde DNA görselini başlangıç durumuna al
if (temp === 95) {
  dnaArea.classList.remove(
    "dna-denatured",
    "dna-primed",
    "dna-extended"
  );

  // CSS animasyonunun yeniden başlamasını sağlar.
  void dnaArea.offsetWidth;
}

  if(temp === 95){
    dnaArea.classList.add("dna-denatured");
    dnaLabel.textContent = "Denatürasyon: DNA zincirleri ayrıldı";
    dnaNote.textContent = "Yüksek sıcaklık, çift sarmalı oluşturan bağların ayrılmasını sağlar.";
    feedback.innerHTML = "✅ DNA zincirleri birbirinden ayrıldı.";
    status.textContent = "Denatürasyon tamamlandı";
    cards[0].classList.add("active-step");
  }

  if(temp === 55){
    dnaArea.classList.add("dna-primed");
    dnaLabel.textContent = "Primer Bağlanması: primerler hedef bölgeye tutundu";
    dnaNote.textContent = "Sıcaklık düşürülünce primerler hedef DNA dizilerine bağlanabilir.";
    feedback.innerHTML = "✅ Primerler hedef bölgeye bağlandı.";
    status.textContent = "Primer bağlanması tamamlandı";
    cards[1].classList.add("active-step");
  }

  if(temp === 72){
    dnaArea.classList.add("dna-extended");
    dnaLabel.textContent = "Uzama: yeni DNA zincirleri sentezlendi";
    dnaNote.textContent = "Taq DNA polimeraz, dNTP’leri kullanarak yeni zincirleri oluşturdu. Bu olay çok kez tekrarlanarak milyarlarca kez DNA kopyalanabilir";
    feedback.innerHTML = "✅ Bir PCR döngüsü tamamlandı. DNA kopya sayısı ikiye çıktı.";
    status.textContent = "Döngü tamamlandı";
    completedCycles++;
    dnaCopies *= 2;
    cycleCount.textContent = String(completedCycles);
    copies.textContent = String(dnaCopies);
    cards[2].classList.add("active-step");
    pcrIndex = -1;

    if(unlockedStep < 6){
      unlockedStep = 6;
      refreshLocks();
    }
  }

  pcrIndex++;
}

/* GERÇEKÇİ ÇİFT SARMAL (DOUBLE HELIX) MODELLEMESİ */
function initAdvancedDNA() {
    const visualArea = document.getElementById('dnaVisualArea');
    if (!visualArea) return;
    visualArea.innerHTML = ''; 

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 800 350");
    svg.setAttribute("class", "dna-svg-advanced");

    // Gerçek sarmal (helix) matematiksel sabitleri
    const startX = 40;
    const endX = 760;
    const step = 15; // Çizgileri yumuşatmak için adımları sıklaştırdık
    const centerY = 175;
    const amplitude = 55; // Çaprazlamanın belirgin olması için artırılmış genlik
    const frequency = 0.05; // Dalga sıklığı

    let origTopPath = "", origBottomPath = "";
    let newTopPath = "", newBottomPath = "";
    let origTopBases = "", origBottomBases = "";
    let newTopBases = "", newBottomBases = "";

    const baseColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6']; 

    for (let x = startX; x <= endX; x += step) {
        let angle = x * frequency;
        
        // Sarmal (helix) görünümü için zincirler arasında Pi (180 derece) faz farkı yaratıyoruz.
        // Bu sayede zincirler paralel gitmek yerine birbirleriyle çapraz kesişir.
        let yTop = centerY + Math.sin(angle) * amplitude;
        let yBottom = centerY + Math.sin(angle + Math.PI) * amplitude; 

        let cmd = (x === startX) ? "M" : "L";
        origTopPath += `${cmd} ${x} ${yTop} `;
        origBottomPath += `${cmd} ${x} ${yBottom} `;
        newTopPath += `${cmd} ${x} ${yTop} `;
        newBottomPath += `${cmd} ${x} ${yBottom} `;

        let isAT = Math.random() > 0.5;
        let cTop = isAT ? baseColors[0] : baseColors[2];
        let cBot = isAT ? baseColors[1] : baseColors[3];
        if(Math.random() > 0.5) { let t = cTop; cTop = cBot; cBot = t; }

        // Bazlar (merdiven basamakları) zincir kenarından merkeze (centerY) doğru çizilir.
        // Ayrıldıklarında tam ortadan kopmuş gibi kusursuz bir etki verir.
        origTopBases += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${centerY}" stroke="${cTop}" stroke-width="7" stroke-linecap="round"/>`;
        newBottomBases += `<line x1="${x}" y1="${centerY}" x2="${x}" y2="${yBottom}" stroke="${cBot}" stroke-width="7" stroke-linecap="round"/>`;

        origBottomBases += `<line x1="${x}" y1="${centerY}" x2="${x}" y2="${yBottom}" stroke="${cBot}" stroke-width="7" stroke-linecap="round"/>`;
        newTopBases += `<line x1="${x}" y1="${yTop}" x2="${x}" y2="${centerY}" stroke="${cTop}" stroke-width="7" stroke-linecap="round"/>`;
    }

    // SVG İçeriği ve Gruplandırmalar
    svg.innerHTML = `
        <defs>
            <linearGradient id="gradBackbone" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#334155" />
                <stop offset="50%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#334155" />
            </linearGradient>
            <linearGradient id="gradNewBackbone" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#0d9488" />
                <stop offset="50%" stop-color="#042f2e" />
                <stop offset="100%" stop-color="#0d9488" />
            </linearGradient>
            <radialGradient id="gradTaq">
                <stop offset="0%" stop-color="#bef264" />
                <stop offset="60%" stop-color="#65a30d" />
                <stop offset="100%" stop-color="#3f6212" />
            </radialGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="5" stdDeviation="4" flood-opacity="0.3"/>
            </filter>
        </defs>

        <g id="topStrandGroup" class="strand-group">
            <g class="original-strand">
                <g>${origTopBases}</g>
                <path d="${origTopPath}" fill="none" stroke="url(#gradBackbone)" stroke-width="12" stroke-linecap="round" filter="url(#shadow)" />
            </g>
            <g class="new-strand new-bottom-strand">
                <g>${newBottomBases}</g>
                <path d="${newBottomPath}" fill="none" stroke="url(#gradNewBackbone)" stroke-width="12" stroke-linecap="round" filter="url(#shadow)" />
            </g>
            <circle class="taq-enzyme taq-bottom" cx="0" cy="0" r="22" fill="url(#gradTaq)" filter="url(#shadow)"/>
        </g>

        <g id="bottomStrandGroup" class="strand-group">
            <g class="original-strand">
                <g>${origBottomBases}</g>
                <path d="${origBottomPath}" fill="none" stroke="url(#gradBackbone)" stroke-width="12" stroke-linecap="round" filter="url(#shadow)" />
            </g>
            <g class="new-strand new-top-strand">
                <g>${newTopBases}</g>
                <path d="${newTopPath}" fill="none" stroke="url(#gradNewBackbone)" stroke-width="12" stroke-linecap="round" filter="url(#shadow)" />
            </g>
            <circle class="taq-enzyme taq-top" cx="0" cy="0" r="22" fill="url(#gradTaq)" filter="url(#shadow)"/>
        </g>
    `;

    visualArea.appendChild(svg);

    // Enzim animasyon rotaları
    visualArea.style.setProperty('--path-top', `path('${newTopPath}')`);
    visualArea.style.setProperty('--path-bottom', `path('${newBottomPath}')`);
}

// Başlatma Komutları
initAdvancedDNA();
refreshLocks();
showStep(currentStep);
/* =========================
   6. AŞAMA - JEL ELEKTROFOREZİ
   Bu kodu mevcut JS dosyanın SONUNA EKLE
========================= */

let gelLoaded = false;
let gelRunning = false;

/* Örnekleri kuyucuklara yükle */

function loadGelSamples(){

  if(currentStep < 6) return;

  const board = document.getElementById("gelBoard");
  const feedback = document.getElementById("gelFeedback");

  const task1 = document.getElementById("gelTask1");
  const task2 = document.getElementById("gelTask2");

  if(!board) return;

  board.classList.add("samples-loaded");

  feedback.innerHTML =
  "✅ DNA örnekleri kuyucuklara yüklendi. Şimdi elektrik alanını başlatabilirsiniz.";

  feedback.style.color = "#166534";

  task1.classList.remove("active-task");
  task1.classList.add("done-task");

  task2.classList.add("active-task");

  gelLoaded = true;
}

/* Elektroforezi başlat */

function runGelElectrophoresis(){

  if(currentStep < 6) return;

  const board = document.getElementById("gelBoard");
  const feedback = document.getElementById("gelFeedback");

  const task2 = document.getElementById("gelTask2");
  const task3 = document.getElementById("gelTask3");

  if(!board) return;

  if(!gelLoaded){
    feedback.innerHTML =
    "❌ Önce DNA örneklerini kuyucuklara yüklemelisiniz.";

    feedback.style.color = "#b91c1c";
    return;
  }

  if(gelRunning) return;

  gelRunning = true;

  board.classList.add("running");

  feedback.innerHTML =
  "⚡ Elektrik alanı uygulandı. Negatif yüklü DNA parçaları pozitif kutba doğru ilerliyor...";

  feedback.style.color = "#1d4ed8";

  task2.classList.remove("active-task");
  task2.classList.add("done-task");

  task3.classList.add("active-task");

  /* Süreç tamamlanınca */
  setTimeout(() => {

    feedback.innerHTML =
    "✅ Bant desenleri oluştu. Olay yeri örneği ile Şüpheli A profili büyük ölçüde benzer görünüyor. Karşılaştırma aşaması açıldı.";

    feedback.style.color = "#166534";

    task3.classList.remove("active-task");
    task3.classList.add("done-task");

    /* 7. aşamayı aç */
    if(unlockedStep < 7){
      unlockedStep = 7;
      refreshLocks();
    }

  }, 2600);

}
/* =========================
   7. AŞAMA - KARŞILAŞTIRMA
   Bu kodu JS dosyanın SONUNA EKLE
========================= */

let finalSolved = false;

function checkFinalSuspect(choice){

  if(currentStep < 7) return;
  if(finalSolved) return;

  const feedback = document.getElementById("finalFeedback");
  const buttons = document.querySelectorAll(".suspect-choice");

  if(!feedback) return;

  buttons.forEach(btn=>{
    btn.classList.remove("wrong","correct");
  });

  feedback.classList.remove("success","error","show");

  /* DOĞRU CEVAP */

  if(choice === "A"){

    finalSolved = true;

    buttons[0].classList.add("correct");

    feedback.classList.add("show","success");

    feedback.innerHTML =
    "✅ Doğru seçim: Şüpheli A.<br><br>" +
    "Olay yeri örneğindeki bant konumları ile Şüpheli A profili büyük ölçüde örtüşmektedir. " +
    "Bu nedenle genetik profil açısından en güçlü eşleşme Şüpheli A'dır.<br><br>" +
    "🎉 Adli DNA analiz görevini başarıyla tamamladınız.";

    return;
  }

  /* YANLIŞ CEVAPLAR */

  let message = "";

  if(choice === "B"){
    buttons[1].classList.add("wrong");

    message =
    "❌ Şüpheli B doğru cevap değildir.<br><br>" +
    "Bantların yükseklikleri olay yeri örneğinden belirgin şekilde farklıdır. " +
    "Birçok DNA parçası farklı uzunluktadır.";
  }

  if(choice === "C"){
    buttons[2].classList.add("wrong");

    message =
    "❌ Şüpheli C doğru cevap değildir.<br><br>" +
    "Bazı bantlar benzer görünse de tüm profil uyuşmamaktadır. " +
    "Kısmi benzerlik yeterli değildir.";
  }
  if(choice === "D"){
    buttons[3].classList.add("wrong");

    message =
    "❌ Şüpheli D doğru cevap değildir.<br><br>" +
    "Hiçbir mantıklı eşleşme görülememektedir.";
  }

  feedback.classList.add("show","error");
  feedback.innerHTML = message;
}
