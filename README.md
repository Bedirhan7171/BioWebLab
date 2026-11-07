# 🧬 BioWebLab

**İnteraktif biyoteknoloji simülasyonları.** Biyoteknolojiyi ezberlemek yerine deneyerek öğrenmek için tasarlanmış, tarayıcıda çalışan sanal laboratuvar platformu. Kurulum, hesap veya sunucu gerektirmez.

![Ana sayfa](docs/screenshots/01-anasayfa.png)

## Modüller

| Modül | Adım | Kazanımlar |
|---|---|---|
| 🔬 **Adli Tıp Laboratuvarı** | 7 | PCR bileşenlerini ve işlevlerini açıklar · PCR döngüsünü ve DNA çoğalmasını açıklar · Jel elektroforezinde bantları yorumlar · Adli DNA bulgusunu eleştirel değerlendirir |
| ✂️ **CRISPR Gen Düzenleme** | 9 | Mutasyonun protein üzerindeki etkisini açıklar · CRISPR bileşenlerinin rolünü ilişkilendirir · NHEJ / HDR sonuçlarını karşılaştırır |
| 🧩 **Protein Tasarım Merkezi** | 5 | Amino asit–protein ilişkisini açıklar · Kodon tablosunu kullanır · DNA → mRNA → protein dönüşümünü uygular|

Her modül sıralı aşamalardan oluşur; bir aşamanın görevi tamamlanınca “Sonraki aşama →” düğmesi açılır. Her aşamada aynı “← Önceki aşama / Sonraki aşama →” düğmeleri bulunur.

<p>
  <img src="docs/screenshots/03-pcr-laboratuvari.png" width="49%" alt="PCR parametre laboratuvarı">
  <img src="docs/screenshots/04-jel-cetveli.png" width="49%" alt="Jel cetveli">
</p>

## Öğrenme mekanikleri

- **PCR parametre laboratuvarı:** Bağlanma (annealing) sıcaklığını değiştirerek özgül / özgül olmayan ürün oranını, döngü sayısı ve verimle kopya sayısındaki üstel artışı (reaktif sınırındaki platoyla birlikte) logaritmik grafikte gözlemle.
- **Her seferinde değişen adli vaka:** Olay yeri ve 4 şüpheli profili rastgele üretilir (tam eşleşme, “yakın ama farklı”, yetersiz ve farklı profil). Jel üzerindeki **cetvel**, ladder’a göre bant boyutunu kestirir (yarı-logaritmik). “Yeni vaka” ile tekrar denenebilir.
- **Hataya özel geri bildirim:** PCR karışımında hangi bileşenin neden yanlış ya da eksik olduğu açıklanır.
- **DNA/RNA çevirici:** Kalıp zinciri (3′→5′), kodlayan zincir (5′→3′) ve mRNA girişleri; ribozom gibi ilk AUG’yi tarar, öncesini 5′ UTR olarak ayırır.
- **Hücre popülasyonu simülasyonu (CRISPR):** Şablon DNA ve hücre evresine göre 100 hücrede HDR / NHEJ sonuçlarının rastgele dağılımı. Onarım “kusursuz” değil, olasılıksal olarak gösterilir.


## Kullanım kolaylığı ve erişilebilirlik

- **Dahili sözlük:** Metindeki noktalı çizgili terimlere tıklayınca kısa açıklama açılır; sözlükteki terimler aranabilir sözlükte listelenir.
- **Standart Önceki / Sonraki aşama düğmeleri ve aşama göstergesi** her panelde bulunur.
- **Koyu / açık tema** ve sistem tercihine uyum.
- **Okunabilirlik ayarları:** Yazı boyutu (3 kademe), animasyonları azaltma, okuma modu. Tercihler saklanır.
- **Klavye ile kullanım:** “İçeriğe geç” bağlantısı, görünür odak halkası, `?` ile yardım, `Esc` ile kapatma.
- **Mobil uyum:** Dar ekranlarda adım menüsü yatay kaydırılan şeride dönüşür.

![Mobil görünüm](docs/screenshots/11-mobil.png)

## Eğitim modeli notları

Simülasyonlar öğrenmeyi kolaylaştırmak için sadeleştirilmiştir: rehber RNA gerçekte ~20 nükleotit uzunluğundadır; bu modelde kısaltılmış dizi kullanılır. Simülasyondaki olasılıklar (örn. HDR/NHEJ oranları) eğitim amaçlı yuvarlatılmış örnek değerlerdir; gerçek verim hücre tipine, kılavuz RNA’ya ve yönteme göre çok değişir. Jel modeli yarı-logaritmik ladder yaklaşımını kullanır.

## Teknik yapı

Saf **HTML + CSS + JavaScript**; harici kütüphane veya derleme adımı yoktur.

```
index.html          Ana sayfa (kartlar, nasıl çalışır, hakkında)
style.css, main.js  Ana sayfa stilleri ve betiği
pages/
  adli-tip.*  crispr.*  protein.*     Modüllerin sayfa, stil ve betikleri
  adli-extras.js  crispr-extras.js   Ek mekanikler
  ui-tools.*        Sözlük, yardım, erişilebilirlik, adım gezinmesi
  ui-polish.*       Ortak arayüz iyileştirmeleri
  mechanics.css     Yeni mekaniklerin stilleri
  modules-nav.*  theme.js
docs/screenshots/   README görselleri
```

## Yerelde çalıştırma

```bash
git clone https://github.com/Bedirhan7171/BioWebLab.git
cd BioWebLab
python3 -m http.server 8000   # ardından http://localhost:8000
```

`index.html` dosyasını doğrudan tarayıcıda açmak da yeterlidir.

## Notlar

- Modül ilerlemesi yalnızca oturum boyunca saklanır; sayfa yenilenince başa dönülür. Görünüm tercihleri kalıcıdır.
- Font olarak Google Fonts üzerinden Inter kullanılır; çevrimdışıyken sistem fontuna geçer.
