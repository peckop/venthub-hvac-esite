
# DEVİR — yeni sohbet buradan başlar (DESIGN-MENU, 2026-09-06)

Bu dosya **ilk okunacak** dosyadır. `CLAUDE.md` bütün karar kaydını taşır (uzun);
bu dosya "şu an neredeyiz, sıradaki hamle ne" sorusunu 2 dakikada cevaplar.
Her tur sonunda **güncellenir** — bayat kalırsa işe yaramaz.

---

## 1 · Kimlik ve iletişim

- Şerit adım **DESIGN-MENU**, imzam **`— DESIGN-MENU (Fable) tarih`**. OPS'unkiler `— OPS`.
- **Her çıktı ÖNCE projeye dosya olarak yazılır**; Linear yorumu yalnız duyurudur.
- Karar SSOT'u **Linear** ("Vitrin 15A Yeniden Tasarım" projesi, id `d160826f-9a6b-40c7-b9b5-2cc2e523daa3`).
  Çelişkide Linear kazanır. Projedeki kopya eskiyse fark yazılır.
- **Tetik cümlesi: "Linear'a bak"** → son yorumları + `ops-emir-*.md` dosyalarını oku, farkı bildir.
- Design **okur, yazmaz**: Supabase'e yazma yok, Linear'a karar/iş yazma yok, canlıda form gönderme yok.
  İzinli tek yazma: Linear'a "tur bitti" yorumu.

## 2 · Güncel dosyalar (2026-09-06)

**Adlandırma kuralı:** arşivde `ARSIV` adın **başında** (`ARSIV Menu Tasarimi v16.dc.html`).
Önek yoksa dosya **günceldir**. Türkçe karakterli ad yalnız güncel dosyalarda (araç kısıtı).

| Dosya | Ne |
|---|---|
| `Menü Tasarımı v17.dc.html` | **TEK DOSYA, 30 kare** — 27 ekran + ana sayfa + mobil M1–M9 + satış kipi S1–S6. Kabuk v2 uygulanmış |
| `Venthub Ana Sayfa v11.dc.html` | v17 ile birebir aynı kabuk |
| `Urun Sayfasi v2 Hikaye.dc.html` | Aile PDP hikâye akışı — **v17 dışında**, emir #7 madde 2 onu v17'ye alacak |
| `Ürün Seçici Karşılaştırma.dc.html` | A/B/C karar takip sayfası (kare değil, okunan sayfa) |
| `Ürün Seçimi Alternatifleri v3.dc.html` | Emir #7 madde 1 bitince **ARŞİV** olacak |

**Notlar ve ölçümler:** `kabuk-v2-notlar.md` (en kapsamlı: kontrast tablosu, token çevirisi, yetenek
envanteri) · `bosluk-listesi-v2.md` (47 yol × 5 hâl) · `desen-envanteri-2026-09-06.md` ·
`systemair-olcum-raporu.md` · `tasarim-sozlesmesi-v1.json` · `urun-sayfasi-v2-notlar.md` ·
`v3-notlar.md` · `zorunlu-icerik-haritasi.md` · `github.md` (depo senkron kaydı)

## 3 · Nerede kaldık

**Bitti (2026-09-06):** Kabuk v2 · 55 header + 2 footer `KabukBandi` mount'u · K25/K25-b kontrast
düzeltmeleri · S1–S6 satış kipi (masaüstü + 390) · desen envanteri (24 desen, 17 aday) ·
**679 ham hex → token** (A+B kümesi 0) · mobil header hizalaması · yetenek envanteri (19, kullanım 0/19).

**Açık işler — sırayla:**

| # | İş | Kaynak | Not |
|---|---|---|---|
| **PAKET** | **Emir #10 · beş adım** (veri JSON → kural motoru → prototip → oturum kaydı → tweak) + **K37-a** (U1 · U2 · U3) | emir #10 · K37 | **Yeni sohbetin tek işi.** Ayrıntı §3b. #7 madde 1 ve #9'un yerine geçer |
| 2 | **Hikâye sayfası v17'ye kare** | emir #7 · paketten sonra | K25-b tokenlere çek · `TeknikTablo` v2 (`basliklar[]`) + `KarsilastirmaTablosu` mount. Adres hükmü: `/tr/products/<aile>` = hikâye hedef; 07/07b/07c/07d "BUGÜNKÜ (canlı)" |
| 3 | **6 eksik ekran → v17** | emir #7 · paketten sonra, statik | 404 · teklif teşekkür · nasıl teklif alınır · Hesap satış hâli · footer Yasal satış hâli · payment-success. Satış kipi olanlar "kapalı bekler" |
| U1 | Ekran 11 karşılaştırma "farkı göster" | **K37-a** — pakette | Aynı satırları katla, seçili modeli sabitle (sticky sütun) |
| U2 | Bilgi Merkezi (ekran 14) iç tasarımı | **K37-a** — pakette | İçindekiler · arama · ilgili makale · ürün bağı; uydurma başlık yok |
| U3 | Ekran 58 kendi kararı | **K37-a** — pakette | İki hâl tweak anahtarıyla tek karede; Menü önerir, karar Recep'in |
| D5 | v17'ye tweak anahtarları | **pakette adım 5** | Kip (teklif ↔ satış) · Hesap girişli/girişsiz · hareket |

**Bileşen mount'u — 1→2→3 sırasında, kare bağlamıyla:** `Cip` dört rol (`notr`·`baglam`·`varyant`·`niyet`) ·
`Kart.dolgu` (ölçüm hazır: 204 kartın 106'sı) · `TeknikTablo.basliklar[]`. Kalıpla yapılmaz —
399 öğe 44 px hedef taşıyor ve çoğu düğme.

## 3b · YÖNTEM KARARI: dinamik, statik değil (Recep, 2026-09-06)

Recep'in kendi sözleriyle: *"ben statik istemiyorum, dinamik istiyorum ki doğru şekilde analiz
edebileyim."* Bu bir tercih değil **yöntem kararı** — tasarım kararı artık statik kareye bakılarak
değil **çalıştırılarak** verilir.

**Sonuçları:**
- **İş 1 (Ürün Seçici A+C) çalışan prototip olarak yapılır**, statik kare değil. Emrin bütün
  kuralları geçerli (kanonik girdi kümesi · kip anahtarı · üç hâlli grup sekmesi · K18a), değişen
  tek şey çıktının çalışması.
- Prototip sırası: **(1)** gerçek veri JSON (Supabase ölçümü projeye yazılır, uydurma sayı 0) →
  **(2)** prototip (mahal · alan · yükseklik · kişi · devir → gerçek eğriden hüküm) →
  **(3)** oturum kaydı `localStorage` (hangi adımda kaldı, kaç dokunuş) →
  **(4)** Claude API (serbest metin → kanonik girdi; C kipinin gerçek hâli).
- **Statik kalan:** iş 3'ün 6 ekranı (404 · teşekkür · kapalı-bekler — etkileşim yok, hâl gösteriyorlar).
  İş 2 (hikâye sayfası) statik kare ama D5 tweak anahtarları oraya da girer.
- **D5 öne çıktı:** v17'ye tweak anahtarları (kip teklif ↔ satış · Hesap girişli/girişsiz · hareket).
  İki hâli tek karede anahtarla görmek de dinamik ölçümdür.
- **Kritik:** `Ürün Seçici Karşılaştırma`'daki "A 6–7 · C 7–11 dokunuş" satırları **tahmindir**.
  Prototip + oturum kaydı onları ölçüme çevirir; o zamana kadar o sayılara dayanarak karar verilmez.

**Yetenek eşlemesi:** Interactive prototype (iş 1) · Claude API in prototypes (adım 4) ·
Make tweakable (D5). Üçü de bugüne kadar **0** kez kullanıldı — `kabuk-v2-notlar.md` → "Yetenekler".

## 3b · YÖNTEM KARARI: dinamik, statik değil (Recep, 2026-09-06 · Kararlar 15A **K37**)

Recep'in kendi sözleriyle: *"ben statik istemiyorum, dinamik istiyorum ki doğru şekilde analiz
edebileyim."* Bu bir tercih değil **yöntem kararı** — tasarım kararı artık statik kareye bakılarak
değil **çalıştırılarak** verilir.

**Emir #10 bu kararı tek pakete bağladı** (`ops-emir-2026-09-06-10-menu.md`). Emir #7 madde 1'in ve
#9'un yerine geçer; emir #8 kapandı. **Yeni sohbet bu paketten başlar.**

### Paket sırası — tek sohbet, tek teslim

| # | Adım | Kural |
|---|---|---|
| 1 | **Gerçek veri JSON** `secim-veri-2026-09-06.json` | Damga + üreten SQL **dosya başında**. Uydurma sayı 0; her sayı `technical_specs`'ten. Kanal fanı ailesi + eğrili ürünler |
| 2 | **Kural motoru** `secim-kurallari.json` | **TEK KAYNAK** — kod tarafı aynı dosyadan uygular, kural HTML'e gömülmez. "Değerlendirilemedi" gizlenmez |
| 3 | **Prototip** | mahal · alan · yükseklik · kişi · devir → **gerçek eğriden** hüküm. A ve C **aynı sonuç bölgesi**. `is_interactive` |
| 4 | **Oturum kaydı** (`localStorage`) | Adım · dokunuş · vazgeçme + "kopyala" düğmesi. "A 6–7 · C 7–11" tahminleri bununla ölçüme döner |
| 5 | **D5 tweak anahtarları** v17'ye | Kip (teklif ↔ satış) · Hesap girişli/girişsiz · hareket |

**Claude API adımı YOK** — Recep + OPS hemfikir: kare dış ağa çıkamaz, anahtar proje dosyasına giremez.
C kipinin serbest metni yerine **10 örnek cümle → kanonik girdi eşleme tablosu** (json, deterministik).

### K37-a · Recep'in UI iyileştirmeleri — aynı sohbette, prototipten SONRA

- **U1 · Ekran 11 "farkı göster":** aynı satırlar katlanır, seçili model sabitlenir (sticky sütun).
  Ölçüm: fark satırı / toplam satır.
- **U2 · Bilgi Merkezi (ekran 14) iç tasarımı:** içindekiler · arama · ilgili makale · ürün bağı.
  Kaynak REC-146 aile anlatımı + mevcut rotalar; **uydurma makale başlığı yok**.
- **U3 · Ekran 58 panel mi kalıcı sütun mu:** Menü **önerir** (iki hâl tweak anahtarıyla tek karede),
  karar Recep'in.

### Teslim ölçüm satırları (sayıyla beyan)

uydurma sayı 0 · kural dosyası 1 · veri dosyasında damga+sorgu var · A ve C aynı sonuç bölgesi ·
"değerlendirilemedi" görünür · oturum kaydı alanları 3 · tweak anahtarı 3 · U1 fark satırı sayısı ·
U2 dört blok var · U3 iki hâl tek karede · ham hex 0 · kontrast ihlali (ölçülen kümede) 0.

**Emir #7 madde 2 (hikâye sayfası v17'ye) ve madde 3 (6 ekran) bu paketten SONRA, statik.**

**Kritik:** `Ürün Seçici Karşılaştırma`'daki "A 6–7 · C 7–11 dokunuş" satırları **tahmindir**.
Adım 4 onları ölçüme çevirene kadar o sayılara dayanarak karar verilmez.

**Yetenek eşlemesi:** Interactive prototype (adım 3) · Make tweakable (adım 5). İkisi de bugüne kadar
**0** kez kullanıldı — `kabuk-v2-notlar.md` → "Yetenekler".

## 3c · Prototip teknik notları (web araştırması, 2026-09-06)

Topluluk kaynakları (dev.to artifacts kılavuzu · HN · caipi.ai alan notları · GitHub
`claude-design-skill` / `bluzir/claude-code-design` / `claude-artifact-runner`) tarandı.
Emir #10'un adımlarını etkileyen beş bulgu:

**1 · `<form>` + `onSubmit` React'ta kırılıyor.** Sandbox form gönderimini engelliyor.
`onClick` ve `onChange` doğrudan kullanılır. **Adım 3'te (prototip) form etiketi yazmayacağım** —
girdiler `onChange`, hüküm düğmesi `onClick`.

**2 · `localStorage` kırılgan.** Artifact sandbox'ında **engelli**; kalıcı depolama ayrı bir API ve
dört koşula bağlı (yayınlanmış olmak · ücretli plan · yalnız metin · 20 MB) — biri eksikse
**sessizce boş döner, hata vermez**. Bizim ortamda çalışıyor ama dosya dışa aktarıldığında ya da
paylaşıldığında kaybolabilir. **Emir #10'un "kopyala düğmesi" bu yüzden doğru karar** — asıl yol o,
`localStorage` kolaylık. Adım 4'te ölçüm panosuna kopyalanabilir olacak; kayıt kaybı sessiz olmayacak.

**3 · Mobilde hover · sürükle-bırak · sağ tık çalışmıyor.** 390 karelerinde bilgi taşıyan hover
olmayacak. DS'te hover tokeni zaten yok (ölçümde 0) — kural kendiliğinden sağlanıyor.

**4 · "Scope it narrow" (9x atölye notu).** Tek küçük iş ver, çalışınca büyüt. Emir #10'un beş adımı
bu ilkeye uyuyor: her adım ayrı dosya, her biri tek başına doğrulanabilir. Adımları birleştirmeyeceğim.

**5 · "Bileşenleri önce, ekranları sonra" (Medium/Bootcamp skill notu).** Bizim sıra tersiydi:
30 kare elle çizildi, bileşenler sonra geldi → **191 elle çizilmiş kart**, `Kart` mount'u 13'te kaldı.
Prototipte bu hata tekrarlanmayacak: **sonuç kartı, hüküm kutusu ve metrik kutusu önce DS
bileşenlerinden kurulur**, sonra ekran onların üstüne yazılır.

**Doğrulanan kararımız:** OPS'un `secim-kurallari.json` "tek kaynak, HTML'e gömülmez" emri,
topluluğun `tokens.json` / `tokens.css` ayrımıyla aynı mantık — kural veriyle birlikte taşınır,
çizimin içinde saklanmaz. Aynı şekilde Claude API adımının kaldırılması da doğru: kaynaklar API
çağrısının plan ve ayar koşullarına bağlı olduğunu, koşul düşerse sessizce başarısız olduğunu
söylüyor.

## 4 · TEKRAR EDEN HATALARIM — bunları okumadan iş yapma

Bu turda **dört kez** aynı sınıf hata yaptım; her biri Recep ya da doğrulama tarafından yakalandı.

1. **Metin/kalıp eşleştirmesi ile toplu değişiklik atlar.** "Kimya lab." gibi kısaltılmış etiket,
   farklı dolgulu kardeş, `#d8d8d4` vs `#D8D8D4` — kalıp tutmaz, ben "hepsi düzeldi" derim, düzelmemiştir.
   **Kural:** kabuk/öğe taraması **DOM konumuyla** sınırlanır, metin eşleşmesiyle değil. Toplu değişiklikten
   sonra **DOM'dan ölç**, kaç eşleşti diye betiğe güvenme.
2. **Bileşen mount ederken yanındaki elle çizim geride kalır.** `AnaEylemDugmesi` 6 yerde doğru zemini
   render ediyordu, 32 elle yazılmış kardeşi düz kiremitte kalmıştı → aynı dosyada aynı düğmenin iki
   kontrastı. **Kural:** bileşen bir şeyi render ediyorsa yanındaki elle çizim aynı şeyi render etmek
   zorundadır; fark, bileşeni kullanmadığımın kanıtıdır.
3. **Kendi notumdaki ölçümü okumadan mount ettim.** `TeknikTablo`'yu `ilkSatirVurgulu` ile mount ettim;
   kendi kontrast tablomda o kombinasyonun 4,16 olduğu **yazılıydı**. **Kural:** mount etmeden önce
   `kabuk-v2-notlar.md` kontrast tablosunu oku.
4. **Koyu-bant tokenini açık zeminde kullandım.** `--text-on-dark-muted` beyaz kart üstünde 2,6:1.
   **Kural:** `--text-on-dark*` yalnız koyu bantta; açık yüzeyde `--text-body` / `--text-muted`
   (muted yalnız beyaz/kart üstünde, gömülü zeminde değil).

**Beyan disiplini:** "kontrast ihlali 0" gibi cümleleri **ölçmeden yazma**. Üç Linear yorumunda bu cümle
bir hücre yüzünden yanlış çıktı. Ölçüm betiği neyi kapsamıyorsa onu da yaz.

**Ölçüt disiplini:** ölçüt yanlışsa kusur uydurur. "Son çocuk sağa değmiyorsa kusur" ölçütü tek çocuklu
satırda 255 px "boşluk" bildirdi — kusur yoktu. Ölçütü kusuru bulduğunda **bir kez sorgula**.

## 5 · Kapalı kararlar — bir daha sorulmaz

- **K1a · site iki kipli:** satış kipi (sepet, ödeme, sipariş) **kapalı**, YOK değil. "ARŞİV" değil
  "kapalı bekler". Anahtar `NEXT_PUBLIC_ODEME_ACIK`.
- **K5 · kiremit** sayfada tek, sayfanın işini bitiren eylem; **metin rengi değil**, etiketi sayfaya özel.
- **K7 · yalnız dolu alan satır olur** — "belirtilmemiş", tire, "veri yok", "yakında" yazılmaz.
- **K18 · KARAR (istişare değil):** Ürün Seçici **A temel, C sonra, B çizilmez**. Faz 1 = A + kanal fanı.
- **K19 · alt çubuk 4 sekme:** Ana sayfa · Ürünler · Teklif/Sepet · Hesap. İletişim header'da simge →
  **alt panel** (terim "yaprak" değil). Header sağı: TR/EN çipi + bildirim (girişli) + İletişim.
- **K20 · hikâye sayfası** `/tr/products/<aile>` hedef mimari; bugünkü dört hâl canlı referans.
- **K22 · alfa yasağı:** metin tam opaklık, soluk ton ayrı token. `filter: grayscale()` ve opaklıkla
  sönükleştirme yok — soluk logo dosyadan gelir (K23: **logo elle çizilmez**).
- **K23 · logo** `brand/logo/` SVG'lerinden gelir, `clip-path` ile dilim çizmek yasak.
- **K25/K25-b · turkuaz metin değil zemin/kenar rengidir**; metin hâli `--brand-cyan-ink`.
  Kiremit düğme zemini `--action-terracotta-deep`.
- **Marka listesi yedi, 5+2 iki satır, sayı yazılmaz.** Storm marka değil (SEAT serisi).
- **3D yok · fiyat/stok/sepet vitrinde yok · "Teklif al" yazımı yasak.**

## 6 · Ölçüm alışkanlığı (her teslimde)

`ready_for_verification` öncesi DOM'dan ölç ve **sayıyla** beyan et:
kare sayısı · her ekranda 390 çerçeve var mı · ilk çocuk koyu kabuk mu · alt çubuk var mı ·
kaydırma dışı taşma 0 mı · ham hex 0 mı · kontrast ihlali (benim yazdığım metinlerde) ·
kırık görsel 0 mı · `x-import` açık/kapalı dengeli mi · bileşen mount sayıları.

Türkçe karakterli dosya adı `run_script` içinde **çalışmaz** — `_ds/a.html` gibi ASCII kopyaya
al, işle, geri kopyala, kopyayı sil.

## 7 · İlk hamle

1. `CLAUDE.md` oku (karar kaydı) → bu dosya (durum) → `kabuk-v2-notlar.md` (ölçümler).
2. Linear'ın son yorumlarını ve yeni `ops-emir-*.md` dosyalarını oku.
3. **Emir #10 paketine başla** (§3b): adım 1 gerçek veri JSON → 2 kural motoru → 3 prototip →
   4 oturum kaydı → 5 tweak; sonra K37-a (U1 · U2 · U3). Tek sohbet, tek teslim.
4. Bitince: dosyaya yaz → bu dosyayı güncelle → Linear'a imzalı yorum → `ready_for_verification`.

— DESIGN-MENU (Fable) 2026-09-06

