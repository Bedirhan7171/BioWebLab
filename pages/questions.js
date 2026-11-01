/* ==========================================================================
   BioWebLab · Soru bankası
   - set: "pre" (ön test) veya "post" (son test)
   - type: "mcq" (çoktan seçmeli, answer = doğru seçenek indeksi),
           "order" (sıralama, items = doğru sıra),
           "input" (kısa yanıt, accept = kabul edilen yanıtlar)
   - obj: kazanım kodu (objectives içinde tanımlı)
   Öğretmenler bu dosyaya yeni soru ekleyebilir; başka bir yeri değiştirmek gerekmez.
   ========================================================================== */
window.BWL_QUESTIONS = {

  /* ============================== ADLİ TIP ============================== */
  "adli-tip": {
    title: "Adli Tıp Laboratuvarı",
    icon: "🔬",
    objectives: {
      k1: { label: "PCR bileşenlerini ve işlevlerini açıklar", step: 3 },
      k2: { label: "PCR döngüsünü ve DNA çoğalmasını açıklar", step: 4 },
      k3: { label: "Jel elektroforezinde bantları yorumlar", step: 6 },
      k4: { label: "Adli DNA bulgusunu eleştirel değerlendirir", step: 7 }
    },
    questions: [
      /* ---- Ön test ---- */
      { id: "a-p1", set: "pre", obj: "k1", type: "mcq", q: "PCR’ın temel amacı nedir?",
        options: ["DNA’nın belirli bir bölgesinin çok sayıda kopyasını üretmek", "DNA’yı parçalara ayırıp boyutlarını ölçmek", "DNA’dan protein üretmek", "DNA’yı bir hücreye aktarmak"], answer: 0,
        explain: "PCR, hedef DNA bölgesini sıcaklık döngüleriyle çoğaltır." },
      { id: "a-p2", set: "pre", obj: "k3", type: "mcq", q: "Jel elektroforezinde DNA parçaları neye göre ayrılır?",
        options: ["Boylarına (büyüklüklerine) göre", "Renklerine göre", "Baz dizilerinin harflerine göre", "Sıcaklıklarına göre"], answer: 0,
        explain: "Küçük parçalar jelde daha hızlı ve daha uzağa ilerler." },
      { id: "a-p3", set: "pre", obj: "k4", type: "mcq", q: "İki DNA örneğinin bant profili tamamen aynıysa bu ne anlama gelir?",
        options: ["Aynı kaynaktan gelmiş olma olasılığı yüksektir ama tek başına kesin kanıt değildir", "Kişinin suçlu olduğu kesindir", "Hiçbir anlam taşımaz", "DNA’lar bozulmuştur"], answer: 0,
        explain: "Profil eşleşmesi destekleyici bir bulgudur; olayın bütünü içinde değerlendirilir." },

      /* ---- Son test ---- */
      { id: "a-1", set: "post", obj: "k1", type: "mcq", q: "Primerin PCR’daki görevi nedir?",
        options: ["Çoğaltılacak bölgenin başlangıcına bağlanıp polimerazın çalışmaya başlayacağı noktayı sağlar", "DNA’yı küçük parçalara keser", "Tüpü ısıtır", "DNA’yı boyar"], answer: 0,
        explain: "DNA polimeraz yeni zinciri yalnızca bir primerin ucundan başlayarak sentezleyebilir." },
      { id: "a-2", set: "post", obj: "k1", type: "mcq", q: "Taq DNA polimeraz neden PCR’da tercih edilir?",
        options: ["Yüksek sıcaklıkta (≈95 °C) bozulmadan yeni DNA zinciri sentezleyebildiği için", "DNA’yı boyadığı için", "Primerleri ürettiği için", "Isı ürettiği için"], answer: 0,
        explain: "Taq, ısıya dayanıklı bir bakteriden (Thermus aquaticus) gelir; her döngüde yeniden enzim eklemek gerekmez." },
      { id: "a-3", set: "post", obj: "k1", type: "mcq", q: "dNTP’lerin PCR’daki görevi nedir?",
        options: ["Yeni DNA zincirinin yapı taşlarıdır (nükleotitler)", "Enzimi çalıştıran ısıyı sağlarlar", "DNA’yı keserler", "Yalnızca primerlere bağlanırlar"], answer: 0,
        explain: "Polimeraz, dNTP’leri kalıp zincire uygun biçimde ekleyerek yeni zinciri uzatır." },
      { id: "a-4", set: "post", obj: "k1", type: "mcq", q: "PCR karışımına DNA yerine RNA eklenseydi ne olurdu?",
        options: ["Taq DNA polimeraz RNA’yı kalıp olarak kullanamaz; RNA’dan DNA üretilemezdi", "RNA kendiliğinden DNA’ya dönüşüp çoğalırdı", "Primer gereksiz olurdu", "Çoğalma daha hızlı olurdu"], answer: 0,
        explain: "RNA’dan DNA yapmak için ters transkriptaz gerekir; standart PCR’da bu enzim yoktur." },
      { id: "a-5", set: "post", obj: "k2", type: "order", q: "PCR döngüsünün aşamalarını doğru sıraya diz.",
        items: ["Denatürasyon (≈95 °C)", "Primer bağlanması (≈55 °C)", "Uzama (≈72 °C)"],
        explain: "Önce zincirler ayrılır, sonra primerler tutunur, en son polimeraz yeni zinciri sentezler." },
      { id: "a-6", set: "post", obj: "k2", type: "input", q: "Her döngüde DNA miktarı tam verimle ikiye katlanıyorsa, 1 DNA molekülü 5 döngü sonunda kaç kopya olur?",
        accept: ["32"], placeholder: "Sayı yaz", explain: "Kopya sayısı 2ⁿ’dir: 2⁵ = 32." },
      { id: "a-7", set: "post", obj: "k2", type: "mcq", q: "30 döngü sonunda (tam verimle) bir molekülden yaklaşık kaç kopya elde edilir?",
        options: ["Yaklaşık 1 milyar", "Yaklaşık 30", "Yaklaşık 900", "Yaklaşık 1 milyon"], answer: 0,
        explain: "2³⁰ ≈ 1,07 milyar. Üstel artış PCR’ın gücünü açıklar." },
      { id: "a-8", set: "post", obj: "k2", type: "mcq", q: "Bağlanma (annealing) sıcaklığı primerin Tm değerinden çok daha yüksek seçilirse ne beklenir?",
        options: ["Primerler hedefe bağlanamaz; ürün azalır ya da hiç oluşmaz", "Özgül olmayan bantlar artar", "DNA daha hızlı çoğalır", "Taq daha hızlı çalışır"], answer: 0,
        explain: "Yüksek sıcaklıkta primer–kalıp bağları kararsızdır; parametre laboratuvarında bunu denedin." },
      { id: "a-9", set: "post", obj: "k2", type: "mcq", q: "Bağlanma sıcaklığı gereğinden düşük seçilirse hangi sorun görülür?",
        options: ["Primerler hedef dışı yerlere de bağlanır; jelde istenmeyen ek bantlar çıkar", "DNA hiç denatüre olmaz", "Taq polimeraz yok olur", "Tek ve temiz bir bant oluşur"], answer: 0,
        explain: "Düşük sıcaklık özgüllüğü azaltır; primerler benzer ama hedef olmayan dizilere de tutunur." },
      { id: "a-10", set: "post", obj: "k3", type: "mcq", q: "Jelde DNA hangi kutba doğru ilerler ve neden?",
        options: ["Pozitif (+) kutba; çünkü DNA’nın fosfat omurgası negatif yüklüdür", "Negatif (−) kutba; çünkü DNA pozitif yüklüdür", "Hareket etmez", "Pozitif kutba; çünkü DNA çok büyüktür"], answer: 0,
        explain: "Negatif yüklü DNA, elektrik alanında (+) kutba doğru göç eder." },
      { id: "a-11", set: "post", obj: "k3", type: "mcq", q: "Jelde kuyucuğa en yakın (en yukarıdaki) bant hakkında ne söylenebilir?",
        options: ["En büyük DNA parçasına aittir", "En küçük DNA parçasına aittir", "En çok kopyası olan parçadır", "Kalıp DNA’dır"], answer: 0,
        explain: "Büyük parçalar jelde en yavaş ilerler, bu yüzden kuyucuğa yakın kalır." },
      { id: "a-12", set: "post", obj: "k3", type: "mcq", q: "Bir bant, ladder’daki 400 bç ve 250 bç bantlarının arasında kalıyor. Bu bandın boyutu yaklaşık nedir?",
        options: ["250 ile 400 bç arasında", "100 bç’den küçük", "400 ile 600 bç arasında", "1000 bç’den büyük"], answer: 0,
        explain: "Ladder referans cetvelidir; bilinmeyen bandın boyutu komşu ladder bantları arasında kestirilir (jel cetveli bunu yapıyordu)." },
      { id: "a-13", set: "post", obj: "k4", type: "mcq", q: "Bir şüphelinin DNA profili olay yeri örneğiyle tam eşleşiyor. Doğru yorum hangisidir?",
        options: ["Bulgu şüphelinin olayla ilişkisini destekler; ancak tek başına suçluluğu kanıtlamaz", "Şüpheli kesinlikle suçludur", "Bulgu önemsizdir", "Başka şüpheli aranmaz"], answer: 0,
        explain: "DNA, olay yerine başka yollarla da taşınmış olabilir; bulgu diğer delillerle birlikte değerlendirilir." },
      { id: "a-14", set: "post", obj: "k4", type: "mcq", q: "Bir şüphelide olay yeri profilinin yalnızca 3 bandı görülüyorsa ne yapılmalıdır?",
        options: ["Eşleşme yetersiz sayılır; analiz tekrarlanır ya da ek bölgeler incelenir", "Eşleşme kesin kabul edilir", "Şüpheli suçlu ilan edilir", "Eksik bantlar yok sayılıp karar verilir"], answer: 0,
        explain: "Eksik bantlar DNA bozulması ya da yetersiz analiz belirtisi olabilir; karar için yeterli veri yoktur." },
      { id: "a-15", set: "post", obj: "k4", type: "mcq", q: "“Neredeyse aynı” bir profil neden eşleşme sayılmaz?",
        options: ["Bir bant bile farklı konumdaysa örnekler aynı kaynaktan gelmemiş olabilir", "Çünkü ladder yoktur", "Çünkü Taq yetersizdir", "Çünkü bant sayısı önemsizdir"], answer: 0,
        explain: "Eşleşme için karşılaştırılan tüm bantların aynı konumda olması gerekir." }
    ]
  },

  /* ============================== CRISPR ============================== */
  "crispr": {
    title: "CRISPR Gen Düzenleme",
    icon: "✂️",
    objectives: {
      k1: { label: "Mutasyonun protein üzerindeki etkisini açıklar", step: 3 },
      k2: { label: "CRISPR bileşenlerinin rolünü ilişkilendirir", step: 5 },
      k3: { label: "Onarım yollarını (NHEJ / HDR) karşılaştırır", step: 9 }
    },
    questions: [
      /* ---- Ön test ---- */
      { id: "c-p1", set: "pre", obj: "k2", type: "mcq", q: "CRISPR-Cas9 sisteminde DNA’yı kesen bileşen hangisidir?",
        options: ["Cas9 enzimi", "Rehber RNA (gRNA)", "PAM dizisi", "Ribozom"], answer: 0, explain: "Cas9, DNA’yı belirli bir noktada kesen enzimdir." },
      { id: "c-p2", set: "pre", obj: "k2", type: "mcq", q: "Rehber RNA (gRNA) ne işe yarar?",
        options: ["Cas9’u hedef DNA dizisine yönlendirir", "Kesilen DNA’yı onarır", "Amino asit üretir", "DNA’yı çoğaltır"], answer: 0, explain: "gRNA hedef diziyle eşleşerek Cas9’u doğru yere götürür." },
      { id: "c-p3", set: "pre", obj: "k1", type: "mcq", q: "DNA’daki tek bir bazın değişmesi proteini etkileyebilir mi?",
        options: ["Evet; kodon değişirse farklı bir amino asit gelebilir", "Hayır, protein hiçbir zaman etkilenmez", "Yalnızca RNA etkilenir", "Yalnızca hücre zarı etkilenir"], answer: 0, explain: "Kodon değişirse kodlanan amino asit de değişebilir." },

      /* ---- Son test ---- */
      { id: "c-1", set: "post", obj: "k1", type: "mcq", q: "TGG (Trp) kodonunda ilk bazın A’ya dönüşmesiyle AGG oluşuyor. Bu, proteini nasıl etkiler?",
        options: ["Trp yerine Arg gelir (yanlış anlamlı mutasyon); protein işlevi bozulabilir", "Hiçbir etkisi olmaz", "Stop kodonu oluşur", "Okuma çerçevesi kayar"], answer: 0,
        explain: "AGG arginini kodlar. Tek bir amino asit değişse bile proteinin işlevi etkilenebilir." },
      { id: "c-2", set: "post", obj: "k1", type: "mcq", q: "Sessiz mutasyon neden proteini değiştirmez?",
        options: ["Genetik şifre yedekli olduğu için yeni kodon aynı amino asidi kodlayabilir", "Hücre DNA’yı hemen onardığı için", "Ribozom hatayı yok saydığı için", "mRNA oluşmadığı için"], answer: 0,
        explain: "Bir amino asit birden fazla kodonla kodlanabilir (şifrenin dejenere olması)." },
      { id: "c-3", set: "post", obj: "k2", type: "mcq", q: "Cas9 enziminin görevi nedir?",
        options: ["Hedef DNA’yı belirli bir noktada keser", "DNA’yı sentezler", "gRNA’yı üretir", "Proteini katlar"], answer: 0, explain: "Cas9 “moleküler makas” gibi çalışır." },
      { id: "c-4", set: "post", obj: "k2", type: "mcq", q: "PAM dizisi neden gereklidir?",
        options: ["Cas9’un hedefe bağlanıp kesim yapabilmesi için hedefin yanında bulunması gereken kısa dizidir", "Hücreyi öldürmek için", "gRNA’nın uzunluğunu belirlemek için", "Şablon DNA’yı sentezlemek için"], answer: 0,
        explain: "PAM olmadan Cas9 hedefi tanıyıp kesemez; bu, rastgele kesimi önler." },
      { id: "c-5", set: "post", obj: "k2", type: "mcq", q: "SpCas9 için PAM kuralı NGG ise hangisi geçerli bir PAM’dır?",
        options: ["AGG", "AGA", "TGC", "CCA"], answer: 0, explain: "N herhangi bir baz olabilir; son iki baz GG olmalıdır. AGG kurala uyar." },
      { id: "c-6", set: "post", obj: "k2", type: "mcq", q: "Cas9, PAM dizisinin yaklaşık kaç nükleotit gerisinden keser?",
        options: ["3", "10", "20", "PAM’ın içinden keser"], answer: 0, explain: "Kesim, PAM’ın başlangıcından yaklaşık 3 nükleotit geridedir; 8. adımdaki kaydırıcı bunu gösteriyordu." },
      { id: "c-7", set: "post", obj: "k2", type: "input", q: "Bu modüldeki kurala göre (A→U, T→A, C→G, G→C) hedef DNA ATGCC için komplementer gRNA dizisi nedir?",
        accept: ["UACGG"], placeholder: "Harfleri yaz", explain: "A→U, T→A, G→C, C→G, C→G: UACGG." },
      { id: "c-8", set: "post", obj: "k2", type: "mcq", q: "CRISPR-Cas9 hangi canlıların doğal savunma sisteminden uyarlanmıştır?",
        options: ["Bakteriler (virüslere karşı)", "Bitkiler", "Mantarlar", "Memeliler"], answer: 0, explain: "Bakteriler, virüs DNA’sını tanıyıp kesmek için CRISPR sistemini kullanır." },
      { id: "c-9", set: "post", obj: "k2", type: "mcq", q: "gRNA hedef dizisiyle eşleşmezse ne olabilir?",
        options: ["Cas9 yanlış yeri keser ya da hiç kesmez (hedef dışı etki riski)", "Kesim daha güçlü olur", "DNA kendiliğinden onarılır", "Hiçbir şey olmaz"], answer: 0, explain: "Doğru tasarım, kesimin yalnızca hedefte olması için kritiktir." },
      { id: "c-10", set: "post", obj: "k3", type: "mcq", q: "NHEJ onarım yolu için hangisi doğrudur?",
        options: ["Şablon gerektirmez; hataya açıktır ve küçük ekleme/silmelere yol açabilir", "Şablon DNA gerektirir ve hatasızdır", "Yalnızca bölünmeyen hücrelerde çalışır", "DNA’yı keser"], answer: 0, explain: "NHEJ kırık uçları şablonsuz birleştirir; bu sırada baz kayıpları veya eklemeleri olabilir." },
      { id: "c-11", set: "post", obj: "k3", type: "mcq", q: "HDR için gerekli koşul nedir?",
        options: ["Hedefe homolog bir şablon DNA", "Yalnızca Cas9", "Ribozom", "Stop kodonu"], answer: 0, explain: "HDR, kırığı bir şablona bakarak onarır; istenen düzeltme şablonla verilir." },
      { id: "c-12", set: "post", obj: "k3", type: "mcq", q: "Şablon DNA verilmezse hücre kırığı çoğunlukla hangi yolla onarır?",
        options: ["NHEJ", "HDR", "Translasyon", "Transkripsiyon"], answer: 0, explain: "Şablon yoksa HDR gerçekleşemez; simülasyonda da kırıkların çoğu NHEJ ile onarıldı." },
      { id: "c-13", set: "post", obj: "k3", type: "mcq", q: "HDR en çok hangi hücre evrelerinde etkindir?",
        options: ["S ve G2 (bölünen hücreler)", "Yalnızca G1", "Yalnızca mitozun sonunda", "Hiçbir evrede"], answer: 0, explain: "HDR çoğunlukla S/G2’de çalışır; dinlenen hücrelerde verim çok düşüktür." },
      { id: "c-14", set: "post", obj: "k3", type: "mcq", q: "NHEJ ile oluşan ekleme/silmeler 3’ün katı değilse ne olur?",
        options: ["Okuma çerçevesi kayar; gen çoğu zaman devre dışı kalır", "Hiçbir değişiklik olmaz", "Gen kendiliğinden düzelir", "Protein her zaman daha uzun olur"], answer: 0, explain: "Çerçeve kayması sonraki tüm kodonları değiştirir ve çoğunlukla erken Stop oluşturur." }
    ]
  },

  /* ============================== PROTEİN ============================== */
  "protein": {
    title: "Protein Tasarım Merkezi",
    icon: "🧩",
    objectives: {
      k1: { label: "Amino asit–protein ilişkisini açıklar", step: 1 },
      k2: { label: "Kodon tablosunu kullanır", step: 3 },
      k3: { label: "DNA → mRNA → protein dönüşümünü uygular", step: 5 },
      k4: { label: "Mutasyon türlerini ayırt eder", step: 6 }
    },
    questions: [
      /* ---- Ön test ---- */
      { id: "p-p1", set: "pre", obj: "k1", type: "mcq", q: "Proteinlerin yapı taşları nelerdir?",
        options: ["Amino asitler", "Nükleotitler", "Yağ asitleri", "Basit şekerler"], answer: 0, explain: "Proteinler amino asit zincirleridir." },
      { id: "p-p2", set: "pre", obj: "k2", type: "mcq", q: "mRNA’da bir amino asidi belirleyen üçlü baz grubuna ne denir?",
        options: ["Kodon", "Gen", "Primer", "Kromozom"], answer: 0, explain: "Her kodon bir amino asidi ya da durma sinyalini temsil eder." },
      { id: "p-p3", set: "pre", obj: "k4", type: "mcq", q: "DNA’da bir bazın başka bir baza dönüşmesine ne denir?",
        options: ["Nokta mutasyonu (baz değişimi)", "Replikasyon", "Transkripsiyon", "Translasyon"], answer: 0, explain: "Tek bir bazın değişmesi nokta mutasyonudur." },

      /* ---- Son test ---- */
      { id: "p-1", set: "post", obj: "k1", type: "mcq", q: "Canlılarda kaç çeşit amino asit proteinleri oluşturur?",
        options: ["20", "4", "64", "3"], answer: 0, explain: "Proteinler 20 çeşit amino asitten yapılır." },
      { id: "p-2", set: "post", obj: "k1", type: "mcq", q: "Bir proteinin şeklini ve görevini en çok ne belirler?",
        options: ["Amino asit dizisi (sırası)", "Hücrenin rengi", "DNA’nın uzunluğu", "Ribozomun boyutu"], answer: 0, explain: "Amino asitlerin sırası katlanmayı, dolayısıyla işlevi belirler." },
      { id: "p-3", set: "post", obj: "k1", type: "mcq", q: "Protein sentezi çoğunlukla hangi kodonla başlar?",
        options: ["AUG (Metiyonin)", "UAA", "GCU", "UGA"], answer: 0, explain: "AUG hem başlangıç sinyalidir hem de Metiyonini kodlar." },
      { id: "p-4", set: "post", obj: "k1", type: "mcq", q: "Hangisi bir Stop kodonu DEĞİLDİR?",
        options: ["UGG", "UAA", "UAG", "UGA"], answer: 0, explain: "UGG Triptofanı kodlar; Stop kodonları UAA, UAG ve UGA’dır." },
      { id: "p-5", set: "post", obj: "k2", type: "mcq", q: "Genetik şifrede toplam kaç kodon vardır ve kaçı amino asit kodlar?",
        options: ["64 kodon; 61’i amino asit kodlar, 3’ü Stop’tur", "61 kodon; hepsi amino asit kodlar", "20 kodon; 20 amino asit", "64 kodon; hepsi amino asit kodlar"], answer: 0, explain: "4³ = 64 kodon vardır; 3’ü durma sinyalidir." },
      { id: "p-6", set: "post", obj: "k2", type: "mcq", q: "Bir amino asidin birden fazla kodonla kodlanmasına ne denir?",
        options: ["Genetik şifrenin dejenere (yedekli) olması", "Mutasyon", "Replikasyon", "Transkripsiyon"], answer: 0, explain: "64 kodon yalnızca 20 amino asidi kodladığı için birçok amino asidin birden çok kodonu vardır." },
      { id: "p-7", set: "post", obj: "k2", type: "input", q: "5′-AUG GCU UAA-3′ mRNA’sı çevrilirse kaç amino asit oluşur?",
        accept: ["2"], placeholder: "Sayı yaz", explain: "AUG → Met, GCU → Ala, UAA → Stop. Stop amino asit eklemez; 2 amino asit oluşur." },
      { id: "p-8", set: "post", obj: "k2", type: "input", q: "5′-AUG UUU GGC UAA-3′ mRNA’sının amino asit dizisini tek harf kodlarıyla yaz (ör. MAK).",
        accept: ["MFG"], placeholder: "Harfleri yaz", explain: "AUG → M (Met), UUU → F (Phe), GGC → G (Gly), UAA → Stop." },
      { id: "p-9", set: "post", obj: "k3", type: "mcq", q: "DNA kalıp zincirinde 3′-TAC-5′ dizisine karşılık gelen mRNA kodonu nedir?",
        options: ["AUG", "UAC", "ATG", "TAC"], answer: 0, explain: "Kalıp zincire tamamlayıcı mRNA sentezlenir: T→A, A→U, C→G." },
      { id: "p-10", set: "post", obj: "k3", type: "input", q: "DNA kalıp zinciri 3′-TACCGA-5′ ise mRNA dizisi nedir? (5′→3′ yazın)",
        accept: ["AUGGCU"], placeholder: "Harfleri yaz", explain: "T→A, A→U, C→G, C→G, G→C, A→U: AUGGCU." },
      { id: "p-11", set: "post", obj: "k3", type: "mcq", q: "DNA kodlayan zincir 5′-ATGCCC-3′ ise mRNA 5′-…-3′ nedir?",
        options: ["AUGCCC", "UACGGG", "ATGCCC", "AUGGGG"], answer: 0, explain: "Kodlayan zincir mRNA ile aynı diziye sahiptir; yalnızca T yerine U yazılır." },
      { id: "p-12", set: "post", obj: "k4", type: "mcq", q: "GCU → GCC değişimi (Ala → Ala) hangi mutasyon türüdür?",
        options: ["Sessiz", "Yanlış anlamlı", "Anlamsız", "Çerçeve kayması"], answer: 0, explain: "Her iki kodon da Alanin kodlar; protein değişmez." },
      { id: "p-13", set: "post", obj: "k4", type: "mcq", q: "UGG (Trp) → UGA değişimi hangi türdür?",
        options: ["Anlamsız (nonsense)", "Sessiz", "Yanlış anlamlı", "Çerçeve kayması"], answer: 0, explain: "UGA bir Stop kodonudur; protein erken kesilir." },
      { id: "p-14", set: "post", obj: "k4", type: "mcq", q: "GAA (Glu) → GUA (Val) değişimi hangi türdür?",
        options: ["Yanlış anlamlı (missense)", "Sessiz", "Anlamsız", "Çerçeve kayması"], answer: 0, explain: "Glu yerine Val gelir; farklı bir amino asit oluşur." },
      { id: "p-15", set: "post", obj: "k4", type: "mcq", q: "Tek bir bazın silinmesi neden ciddi sonuç doğurabilir?",
        options: ["Okuma çerçevesini kaydırır; sonraki tüm kodonlar değişir", "Yalnızca tek bir amino asidi değiştirir", "Hiçbir etkisi olmaz", "Proteini her zaman uzatır"], answer: 0, explain: "Çerçeve kayması, değişiklikten sonraki bütün kodonların farklı okunmasına yol açar." }
    ]
  }
};
