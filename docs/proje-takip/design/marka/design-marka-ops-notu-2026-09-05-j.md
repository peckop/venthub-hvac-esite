
# DESIGN-MARKA → OPS · 2026-09-05 · DS kurulum denetimi + bayatlık sinyali uygulandı

Recep "kontrolü sen yapabilecek misin" diye sordu. Yaptım — DS projesini çapraz okuyup
ölçtüm. **Kurulum doğru, hükümlere uyuyor.** Ayrıca `bayat-2026-09-05.md` dosyasını okudum
ve bana dönük kararları kaydıma işledim.

## 1 · DS kurulum denetimi — ölçüm

| Ölçüt | Hüküm | Ölçülen | Sonuç |
|---|---|---|---|
| `assets/icons` | 144 | **144** (16 ikon × 64/48/24 × üç sürüm) | ✓ |
| `assets/logo` | 28 | **28** (işaret 7 · yatay kilit 7 · dikey kilit 7 · favicon 4 · avatar 2 · paylaşım 1) | ✓ |
| Bileşen kapsamı | yalnız altı | **tam altı**: AnaEylemDugmesi · CerceveliDugme · Kart · Cip · TeknikTablo · KabukBandi | ✓ |
| Uydurma bileşen | yasak | Toast · Tabs · Dialog · Avatar **yok** | ✓ |
| Bileşen dosya seti | `.jsx` + `.d.ts` + `.prompt.md` + grup kartı | dördü de her grupta var | ✓ |
| UI kit | yalnız kabuk | `ui_kits/kabuk/` tek klasör | ✓ |
| Kök `styles.css` | yalnız `@import` | yalnız font bağlantısı + dört token dosyası | ✓ |
| Damga | `kaynak_updatedAt` + `sozlesme_updatedAt` | üçü var (**`karar_updatedAt`** da eklenmiş) | ✓ |
| Yazı tipi | bağlantı, ikame yok | Google Fonts `@import`, üç aile, Inter yok | ✓ |
| Değer kümesi | `brand/tokens.css` ile birebir | `tokens/renk.css` HSL üçlüleri birebir aynı | ✓ |
| Foundation kartı | 12–20, üç ikon boyu yan yana | **20 kart**, `ikon-uc-boy.html` var | ✓ |
| Published | işaretlenmez | boş | ✓ |

`karar_updatedAt` damgası hükümde yoktu, DS kendiliğinden eklemiş — **iyi ekleme**: kılavuz
dosyasının ve karar kaydının tarihleri ayrı ayrı izleniyor, bayatlık iki eksende ölçülebiliyor.

**Bulamadığım kusur yok.** Görsel denetim yapamadım (başka projenin dosyasını render
edemiyorum); kart ve bileşen içerikleri metin olarak doğru.

## 2 · Bayatlık sinyali — kuruldu ve işledi

Önerimin (2. madde, bu sabah) aynı gün karşılığı geldi: `bayat-2026-09-05.md`. Okudum,
kaydıma dört madde işledim:

- **K23 · Logo elle çizilmez** — bulgum karar oldu. Kaydıma kural olarak girdi: tek kaynak
  `brand/logo/`, koyu zeminde `venthub-isaret-tamrenk-koyu.svg`, yeni yazılan hiçbir yerde
  elle çizilmez, kod tarafı `public/brand/`.
- **K23-a · Kontur satırı çıktı** — önerim kabul. Değer 1.5, sözleşme v1 ölçümü, sahibi
  DESIGN-MENU. Kaydımdaki 1.4 kaldırıldı, yerine "bizim kaydımızda tutulmaz, sahibi MENU"
  yazıldı. Bizim ikonlar dolu iki renkli, konturu yok.
- **K22 · Durum alfa ile anlatılmaz** — kural olarak girdi: `opacity` yok, soluk hâl için
  soluk hex + zemin + rozet, metin tam opaklık, istisna `<img>` şeritleri.
- **Ayna bayatlık damgası** — `kararlar-vitrin-15a-2026-09-04.md` kopyasının K19'da kaldığı
  ve yarın yenilenene kadar `bayat-2026-09-05.md` + Linear'ın geçerli olduğu yazıldı.
  Ayrıca "Linear turunun İLK işi bayat dosyasını okumaktır" kuralı kaydıma girdi.

`venthub-proje-ayarlari.md` de güncellendi: ikon 144/üç boy, logo elle çizilmez maddesi.

## 3 · Tek eksik — bayat dosyası bu projede yok

`bayat-2026-09-05.md` **yalnız DS projesinde** duruyor. Dosyanın kendi başlığı
"OPS → tüm Design projeleri" diyor ve içinde Marka'ya dönük dört madde var (K22 · K23 ·
K23-a · ayna satırları). Marka projesinde kopyası yok — bu turda DS projesini okuduğum için
gördüm; okumasaydım kaçırıyordum.

Kendim kopyalamadım: OPS'un dosyası, sahte bir kopya üretmek istemem. Bundan sonraki
sinyallerin **marka projesine de** bırakılması gerekiyor, yoksa mekanizma benim için
çalışmıyor.

## 4 · Sırada ne var

- **Published** — Recep işaretleyince çip listesine girer, üç projede Broadsheet'ten VentHub'a
  geçilir.
- **Kılavuza "Belge sistemi" bölümü** — DESIGN-BELGE K11'de kimlik yuvası (logo · unvan ·
  künye · vurgu rengi · yazı ailesi; kiracı `tenants.styles`) tanımlanmış ve bayat dosyası
  "kimlik yuvası DS ile aynı değerler" diyor. Bölümü yazarken o yuvayı da kapsayacağım.
  Açılış Recep'te.
- **K18-b grup sekmesi üç hâl** (açık · soluk · yok) DS kabuğunu ilgilendiriyor; kabuk
  ekranı bugün boş içerikle çizildi, sekme hâlleri gerekirse ayrı tur.
- Kanıt SVG'leri (3) ve dilim aralığı karar sorusu hâlâ açık, ikisi de küçük.

**Kullanılan `/` yeteneği:** bu turda yok (denetim ve kayıt güncellemesi).

— DESIGN-MARKA (Opus) 2026-09-05

