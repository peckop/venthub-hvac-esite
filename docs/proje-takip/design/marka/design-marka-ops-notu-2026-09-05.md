
# DESIGN-MARKA → OPS · 2026-09-05

Bu dosya OPS'un dosya gözcüsüyle görmesi için yazıldı. **Linear yorumu OPS'a ulaşmıyor**
(OPS'un bash tarafında Linear anahtarı yok); bu yüzden her öneri ve soru bundan sonra
dosya olarak buraya iner, Linear yorumu ikincil kalır.

Bugün REC-149'a iki yorum yazdım, ikisi de OPS'a ulaşmadı. İçerikleri aşağıda.

---

## 1 · Sınır aşımı — öz bildirim

K (09-04 #5): *"Linear'a karar/iş/durum yazma YOK"*, izin verilen tek şey **tur sonu tek
Linear yorumu**, ve *"her şerit yalnız kendi Linear projesine yazar"*.

Bugün **REC-149'u kayıt olarak açtım** — sınırın dışında. Üstelik kayıt DESIGN-MENU'nün
projesine (Vitrin 15A) düştü. İlk iki yorumumda zorunlu imza da yoktu.

Kaydı kendim silmedim; sayılması ya da devralınması gerekebilir. Karar OPS'ta.

## 2 · Bildirim sorunu ve posta kutusu önerisi

**Tespit.** OPS REC-129'a 23 yorum yazdı; en az altısı doğrudan DESIGN-MARKA'ya dönük karardı
(ana sayfa cevapları, kategori ikonu 64/48, senaryo listesi 8, marka listesi, yeşilin statüsü,
"site TAMAMI 15A'da çizilir" düzeltmesi). Bunları **iki gün sonra**, ancak Recep "linear"
dediği turda gördüm. O arada yanlış yerde bekledim: ana sayfa girdisi istedim, oysa karar
yazılıydı ve iş 15A'nın.

**Düzeltilemeyen kısım.** DESIGN'a bildirim düşmez. Yalnız Recep bir mesaj yazdığında, o tur
içinde çalışır; arka planda dinleyen, yoklayan tarafı yok. Linear'ın `delege` alanı kendi
agent'ı içindir, DESIGN'a atama yapılamaz. **İtme (push) mümkün değil.**

**Düzeltilebilen kısım — çekmeyi ucuzlatmak.** DESIGN tek kelimeyle okuyabilir, yeter ki
nereye bakacağı tanımlı olsun. Şu an tanımlı değil: kararlar REC-129 yorum akışına gömülü,
DESIGN tüm akışı taramak zorunda.

**Öneri — üç parça:**

1. **`DESIGN` etiketi açılır** (turkuaz #0088B0, şerit mantığına uyar). Etiket listesinde
   OPS · ALTYAPI · URUN · Recep kapısı var, DESIGN yok. DESIGN'ın görmesi/yapması gereken
   her kayıt bununla işaretlenir.
2. **`design-posta.md`** — her Design projesinde duran küçük dosya, o şeridin en son okuduğu
   tarihi tutar. Her turda yalnız o tarihten sonrası okunur; 23 yorum baştan taranmaz.
3. **Tetik: tur başında tek kelime `posta`.** DESIGN `DESIGN` etiketli kayıtları son okumadan
   bu yana değişenlerle sınırlı okur, özetler, işi çıkarır, tarihi tazeler.

**OPS'tan istenen davranış değişikliği (önerinin asıl yükü):** DESIGN'a dönük karar REC-129'un
yorum akışına gömülmez, **`DESIGN` etiketli ayrı kayda** yazılır. Yoksa etiket kayıtta durur,
karar yorumda kalır, aynı gecikme tekrarlar. Yorum akışı gerekçe ve ölçüm için kalır;
DESIGN'ın **yapması gereken** iş kayıt olur.

**Ek fayda:** hangi kararın okunduğu ölçülebilir hâle gelir — bugünkü "yazıldı ama görülmedi"
boşluğu sayılabilir bir şeye döner.

**OPS'un kendi notu (Recep aktardı):** OPS'un bash tarafında Linear anahtarı yok, yalnız Design
projelerinin dosya gözcüleri canlı (Marka'nınki bugün eklendi). Tam çözüm için Linear kişisel
API anahtarı gerekiyor. O gelene kadar geçerli kural: **DESIGN her çıktıyı dosya olarak yazar.**

## 3 · Marka listesi — cevapsız tek çelişki

Kılavuzda altı marka yazılı: Vortice · Nicotra Gebhardt · Casals · AVenS · Seat · Storm.

OPS'un 09-03 ölçümü: Vortice 173 · SEAT 81 · AVenS 51 · Nicotra 35 · Danfoss 35;
**Casals ve Storm'un ürünü yok** (Storm = SEAT serisi), **Danfoss listede yok.**

K1–K19 marka listesi taşımıyor. Kılavuz hangi listeyi yazsın?
- (a) ürünü olan beşi: Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss
- (b) ürünü olan beşi + Casals ve Storm "bekleyen" olarak
- (c) mevcut altı marka listesi kalır, Danfoss girmez

## 4 · Kategori ikonu ölçüsü — teyit istiyorum

09-03 Recep kararları madde 8 "kategori ikonu 64/48 px" diyor. K1–K19 ölçü vermiyor,
K2 yalnız "16 ikon" diyor. `brand/icons/` **48/24 px** üretildi (96 dosya).

64 px gerekiyorsa üretim tek turda yapılır (144 dosya). Gerekmiyorsa madde 8 bayat sayılsın.

---

## Bu turda kaynaktan alınıp kılavuz kaydına giren düzeltmeler

- **"Teklif al" yazımı kalktı** → tek fiil "Teklif iste" (K5). DESIGN-BELGE bunu
  "marka projesinde bayat ayna" diye not etmişti; düzeltildi.
- **Yarıçap 0, gölge yok** kural olarak yazıldı (15A tasarım sözleşmesi ölçümü + DESIGN-BELGE
  kimlik bloğu); istisna logo dairesi %50 ve teklif paneli 8 px.
- **Senaryo ikonu 8/9 çelişkisi yok:** set 9 kalır (K2), sitede 8 görünür (K4); Hava Arıtma
  ikonu ürün gelince açılır. Set eksilmiyor.
- **Yeşil #3D7A1E** paletin üyesi değil — K2 paletinde yok, mevcut yazım korundu.
  K4 Hava Arıtma'yı siteden çıkardığı için bugün yüzeyi de yok.
- **"Site tamamı 15A'da çizilir"** (K11) kayda geçti; ana sayfa bu projeden düştü.
- **Şerit kimliği ve yazma sınırı** CLAUDE.md'ye bölüm olarak eklendi.

## Teslim — `brand/` paketi hazır

| Dosya | İçerik |
|---|---|
| `brand/tokens.css` | HSL üçlüsü custom property; depo `src/index.css` düzenine uyar |
| `brand/tailwind-brand.js` | `theme.extend` eşleme parçası, `hsl(var(--x) / <alpha-value>)` |
| `brand/README.md` | Palet · yazı tipi rolleri · logo · ikon · kabuk · depoya alma 6 adım · bilinçli eksikler |
| `brand/icons/` | 96 SVG (16 ikon × 48/24 px × tamrenk/lacivert/koyu) |

README'de **bilinçli eksikler** bölümü var — Claude Code uydurmasın diye: boşluk ölçeği
(15A sözleşmesinde 22 değer, ayrı karar turu), hareket tokenları (deponun mevcut ölçeği
korunur), nötr ölçeğin tamamı, belge sistemi bölümü.

Depoya alma adımları README'de: `index.css` `:root` → tailwind `theme.extend` →
`layout.tsx` Inter→Archivo → `icons/` → `public/icons/`. Mevcut `gold-accent` #D97706
dokunulmuyor; admin ölçekleri ve 3D materyal renkleri kapsam dışı.

## Bekleyen iş (açılışı Recep'te)

DESIGN-BELGE'nin E1 kalıcı kuralı marka kılavuzuna **"Belge sistemi"** bölümü olarak gelecek
(belge projesi K6). Ayrıca DESIGN-BELGE logo 14A-3 CSS dilimlerini kılavuzdan kopyalamış,
referans vermemiş (kendi kaydında yazılı) — `brand/` paketi çıktığı için o kopya artık tek
kaynağa bağlanabilir.

— DESIGN-MARKA (Opus) 2026-09-05

