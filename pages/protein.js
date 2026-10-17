// Yenilemede geçici ilerleme kaydını sıfırla; normal sayfa geçişlerinde koru.
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  ["adliTipProgress", "proteinProgress", "crisprProgress"].forEach(key => sessionStorage.removeItem(key));
}

const menuItems = document.querySelectorAll(".menu-item");
const panels = document.querySelectorAll(".panel");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const progressKey = "proteinProgress";
const savedProgress = JSON.parse(sessionStorage.getItem(progressKey) || "null");
let currentStep = savedProgress?.currentStep || 1;
const totalSteps = 5;
let unlockedStep = savedProgress?.unlockedStep || 1;

function saveProgress() {
  sessionStorage.setItem(progressKey, JSON.stringify({ currentStep, unlockedStep }));
}

const codonDict = {
  UUU:"Fenilalanin", UUC:"Fenilalanin", UUA:"Lösin", UUG:"Lösin",
  CUU:"Lösin", CUC:"Lösin", CUA:"Lösin", CUG:"Lösin",
  AUU:"İzolösin", AUC:"İzolösin", AUA:"İzolösin", AUG:"Metiyonin (Başlangıç)",
  GUU:"Valin", GUC:"Valin", GUA:"Valin", GUG:"Valin",
  UCU:"Serin", UCC:"Serin", UCA:"Serin", UCG:"Serin",
  CCU:"Prolin", CCC:"Prolin", CCA:"Prolin", CCG:"Prolin",
  ACU:"Treonin", ACC:"Treonin", ACA:"Treonin", ACG:"Treonin",
  GCU:"Alanin", GCC:"Alanin", GCA:"Alanin", GCG:"Alanin",
  UAU:"Tirozin", UAC:"Tirozin", UAA:"Stop", UAG:"Stop",
  CAU:"Histidin", CAC:"Histidin", CAA:"Glutamin", CAG:"Glutamin",
  AAU:"Asparajin", AAC:"Asparajin", AAA:"Lisin", AAG:"Lisin",
  GAU:"Aspartat", GAC:"Aspartat", GAA:"Glutamik asit", GAG:"Glutamik asit",
  UGU:"Sistein", UGC:"Sistein", UGA:"Stop", UGG:"Triptofan",
  CGU:"Arjinin", CGC:"Arjinin", CGA:"Arjinin", CGG:"Arjinin",
  AGU:"Serin", AGC:"Serin", AGA:"Arjinin", AGG:"Arjinin",
  GGU:"Glisin", GGC:"Glisin", GGA:"Glisin", GGG:"Glisin"
};

const aminoLetterMap = {
  F:"Fenilalanin", L:"Lösin", I:"İzolösin", M:"Metiyonin (Başlangıç)",
  V:"Valin", S:"Serin", P:"Prolin", T:"Treonin", A:"Alanin",
  Y:"Tirozin", H:"Histidin", Q:"Glutamin", N:"Asparajin",
  K:"Lisin", D:"Aspartat", E:"Glutamik asit", C:"Sistein",
  W:"Triptofan", R:"Arjinin", G:"Glisin", "*":"Stop"
};

function showStep(stepNumber){
  if(stepNumber > unlockedStep) return;
  currentStep = stepNumber;
  saveProgress();

  menuItems.forEach(item=>{
    item.classList.remove("active");
    if(Number(item.dataset.step) === stepNumber) item.classList.add("active");
  });

  panels.forEach(panel=>panel.classList.remove("active-panel"));
  const panel = document.getElementById("panel" + stepNumber);
  if(panel) panel.classList.add("active-panel");

  updateProgress();
  updatePageTitle();
}

function updateProgress(){
  progressFill.style.width = ((currentStep / totalSteps) * 100) + "%";
  progressText.textContent = `${currentStep} / ${totalSteps}`;
}

function unlockNextStep(){
  const nextStep = currentStep + 1;
  if(nextStep > totalSteps) return;

  if(unlockedStep < nextStep){
    unlockedStep = nextStep;
    saveProgress();
    refreshLocks();
  }

  showStep(nextStep);
}

function refreshLocks(){
  menuItems.forEach(item=>{
    const step = Number(item.dataset.step);
    const icon = item.querySelector("span");

    if(step <= unlockedStep){
      item.classList.remove("locked");
      icon.textContent = step;
    }else{
      item.classList.add("locked");
      icon.textContent = "🔒";
    }
  });
}

menuItems.forEach(item=>{
  item.addEventListener("click",()=>{
    const step = Number(item.dataset.step);
    if(step <= unlockedStep) showStep(step);
  });
});

document.addEventListener("keydown", e=>{
  if(e.key === "ArrowRight" && currentStep < unlockedStep) showStep(currentStep + 1);
  if(e.key === "ArrowLeft" && currentStep > 1) showStep(currentStep - 1);
});

const titles = {
  1:"Protein Nedir?",
  2:"Protein Üretimi",
  3:"64 Kodon Tablosu",
  4:"Protein Tasarım",
  5:"DNA/RNA Çevirici"
};

function updatePageTitle(){
  document.title = "Protein Mühendisliği | " + titles[currentStep];
}

function dnaToRna(dna){
  return dna.replace(/A/g,"U").replace(/T/g,"A").replace(/G/g,"C").replace(/C/g,"G");
}

function rnaToDna(rna){
  return rna.replace(/A/g,"T").replace(/U/g,"A").replace(/C/g,"G").replace(/G/g,"C");
}

function splitCodons(seq){
  const codons = [];
  for(let i = 0; i < seq.length; i += 3){
    const codon = seq.slice(i, i + 3);
    if(codon.length === 3) codons.push(codon);
  }
  return codons;
}

function cleanSequence(seq){
  return seq.toUpperCase().replace(/\s/g,"");
}

function isStop(codon){
  return ["UAA","UAG","UGA"].includes(codon);
}

function makeTag(text, type=""){
  const tag = document.createElement("div");
  tag.className = "tag " + type;
  tag.textContent = text;
  return tag;
}

function renderCodonTable(){
  const table = document.getElementById("codonTable");
  if(!table) return;

  table.innerHTML = "";

  Object.keys(codonDict).forEach(codon=>{
    const cell = document.createElement("div");
    let cls = "codon-cell";
    if(codon === "AUG") cls += " start";
    if(isStop(codon)) cls += " stop";

    cell.className = cls;
    cell.dataset.search = `${codon} ${codonDict[codon]}`.toLowerCase();
    cell.innerHTML = `<strong>${codon}</strong><span>${codonDict[codon]}</span>`;
    table.appendChild(cell);
  });
}

function filterCodonTable(){
  const query = document.getElementById("codonSearch").value.toLowerCase().trim();

  document.querySelectorAll(".codon-cell").forEach(cell=>{
    cell.style.display = cell.dataset.search.includes(query) ? "block" : "none";
  });
}

function convertSequence(){
  const type = document.getElementById("sequenceType").value;
  const input = cleanSequence(document.getElementById("sequenceInput").value);
  const feedback = document.getElementById("converterFeedback");

  const rnaResult = document.getElementById("rnaResult");
  const dnaResult = document.getElementById("dnaResult");
  const codonResult = document.getElementById("codonResult");
  const aminoResult = document.getElementById("aminoResult");

  feedback.className = "feedback-box show";
  rnaResult.textContent = "";
  dnaResult.textContent = "";
  codonResult.innerHTML = "";
  aminoResult.innerHTML = "";

  if(!input){
    feedback.classList.add("error");
    feedback.textContent = "❌ Dizi girmelisin.";
    return;
  }

  const valid = type === "rna" ? /^[AUCG]+$/.test(input) : /^[ATGC]+$/.test(input);

  if(!valid){
    feedback.classList.add("error");
    feedback.textContent = type === "rna"
      ? "❌ RNA dizisinde yalnızca A, U, C, G harfleri kullanılabilir."
      : "❌ DNA dizisinde yalnızca A, T, G, C harfleri kullanılabilir.";
    return;
  }

  let rna = type === "rna" ? input : dnaToRna(input);
  let dna = type === "dna" ? input : rnaToDna(input);

  rnaResult.textContent = rna.match(/.{1,3}/g)?.join(" ") || "";
  dnaResult.textContent = dna.match(/.{1,3}/g)?.join(" ") || "";

  const codons = splitCodons(rna);

  if(codons[0] !== "AUG"){
    feedback.classList.add("error");
    feedback.innerHTML = "❌ Protein üretimi doğru başlamak için mRNA dizisi AUG ile başlamalıdır.";
    return;
  }

  let stopped = false;

  for(const codon of codons){
    codonResult.appendChild(makeTag(codon, codon === "AUG" ? "start" : isStop(codon) ? "stop" : ""));

    const amino = codonDict[codon] || "Geçersiz";

    if(amino === "Stop"){
      aminoResult.appendChild(makeTag(`${codon} → Stop`, "stop"));
      stopped = true;
      break;
    }

    aminoResult.appendChild(makeTag(`${codon} → ${amino}`, codon === "AUG" ? "start" : ""));
  }

  if(!stopped){
    feedback.classList.add("info");
    feedback.innerHTML = "ℹ️ Dizi AUG ile başladı ancak Stop kodonu içermiyor. Gerçek protein sentezinde üretim Stop kodonuyla bitmelidir.";
  }else{
    feedback.classList.add("success");
    feedback.innerHTML = "✅ Dizi okundu. AUG ile başladı ve Stop kodonunda durdu.";
  }

  if(unlockedStep < 5){
    unlockedStep = 5;
    saveProgress();
    refreshLocks();
  }
}

function clearConverter(){
  document.getElementById("sequenceInput").value = "";
  document.getElementById("rnaResult").textContent = "";
  document.getElementById("dnaResult").textContent = "";
  document.getElementById("codonResult").innerHTML = "";
  document.getElementById("aminoResult").innerHTML = "";

  const feedback = document.getElementById("converterFeedback");
  feedback.className = "feedback-box";
  feedback.textContent = "";
}

function getCodonsForAmino(aminoName){
  return Object.entries(codonDict)
    .filter(([codon, amino]) => {
      if(aminoName === "Metiyonin (Başlangıç)") return codon === "AUG";
      if(aminoName === "Stop") return amino === "Stop";
      return amino === aminoName;
    })
    .map(([codon]) => codon);
}

function designFromAminoLetters(){
  const input = document.getElementById("proteinLetters").value.toUpperCase().replace(/\s/g,"");
  const feedback = document.getElementById("designerFeedback");

  const selectedAminoResult = document.getElementById("selectedAminoResult");
  const possibleRnaResult = document.getElementById("possibleRnaResult");
  const possibleDnaResult = document.getElementById("possibleDnaResult");
  const combinedResult = document.getElementById("combinedResult");

  selectedAminoResult.innerHTML = "";
  possibleRnaResult.innerHTML = "";
  possibleDnaResult.innerHTML = "";
  combinedResult.innerHTML = "";

  feedback.className = "feedback-box show";

  if(!input){
    feedback.classList.add("error");
    feedback.textContent = "❌ Amino asit harf dizisi girmelisin.";
    return;
  }

  if(input[0] !== "M"){
    feedback.classList.add("error");
    feedback.textContent = "❌ Protein dizisi M yani Metiyonin ile başlamalıdır.";
    return;
  }

  const letters = input.split("");
  const invalid = letters.find(letter => !aminoLetterMap[letter]);

  if(invalid){
    feedback.classList.add("error");
    feedback.textContent = `❌ Geçersiz harf: ${invalid}`;
    return;
  }

  const finalLetters = letters.includes("*") ? letters.slice(0, letters.indexOf("*") + 1) : [...letters, "*"];
  const codonOptions = [];

  finalLetters.forEach(letter=>{
    const amino = aminoLetterMap[letter];
    selectedAminoResult.appendChild(makeTag(`${letter} → ${amino}`, amino === "Stop" ? "stop" : letter === "M" ? "start" : ""));

    const codons = getCodonsForAmino(amino);
    codonOptions.push(codons);

    possibleRnaResult.innerHTML += `<strong>${letter}</strong>: ${codons.join(" / ")}<br>`;
    possibleDnaResult.innerHTML += `<strong>${letter}</strong>: ${codons.map(rnaToDna).join(" / ")}<br>`;
  });

  const exampleRna = codonOptions.map(options => options[0]).join("");
  const exampleDna = rnaToDna(exampleRna);

  combinedResult.innerHTML =
    `<strong>Örnek mRNA:</strong> ${exampleRna.match(/.{1,3}/g).join(" ")}<br>` +
    `<strong>Örnek DNA kalıp:</strong> ${exampleDna.match(/.{1,3}/g).join(" ")}<br><br>` +
    `Not: Bazı amino asitler birden fazla kodonla kodlanabildiği için farklı olası diziler oluşabilir.`;

  feedback.classList.add("success");
  feedback.innerHTML = "✅ Protein harf dizisinden olası mRNA ve DNA kalıp dizileri üretildi.";
  if(unlockedStep < 5){
  unlockedStep = 5;
  saveProgress();
  refreshLocks();
}
}

function clearDesigner(){
  document.getElementById("proteinLetters").value = "";
  document.getElementById("selectedAminoResult").innerHTML = "";
  document.getElementById("possibleRnaResult").innerHTML = "";
  document.getElementById("possibleDnaResult").innerHTML = "";
  document.getElementById("combinedResult").innerHTML = "";

  const feedback = document.getElementById("designerFeedback");
  feedback.className = "feedback-box";
  feedback.textContent = "";
}

renderCodonTable();
refreshLocks();
showStep(currentStep);
