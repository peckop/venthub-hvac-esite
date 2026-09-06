
# DESIGN-MARKA · VentHub Design System kurulumu — notlar

Tarih: 2026-09-05 · Proje: `VentHub Design System` (`31b0824c-8d7e-4a4c-94c7-8c094a1c62b7`)
Kullanılan `/` yeteneği: **Create design system**

## Damga

| Alan | Değer |
|---|---|
| `kaynak_updatedAt` | `2026-09-05T13:03:31Z` — `1 Venthub Marka Kilavuzu.dc.html` |
| `karar_updatedAt` | `2026-09-05T12:57:54Z` — `CLAUDE.md` |
| `sozlesme_updatedAt` | `2026-09-05T11:34:16Z` — `tasarim-sozlesmesi-v1.json` |
| `varliklar_kopyalandi` | `2026-09-05` — 172 SVG |

Damga kök `styles.css` başlığına ve `readme.md`'ye yazıldı.

## Ne kuruldu

- **Kök `styles.css`** — yalnız `@import` satırları: Google Fonts bağlantısı + `tokens/` dört dosya.
- **`tokens/`** — `renk.css` · `tipografi.css` · `yuzey.css` · `kenar.css`. 50 token.
  Değerler `brand/tokens.css` ile **aynı küme**; ikinci küme üretilmedi. Tipografi ölçeği
  sözleşmenin `type_scale` ölçümünden geldi (tahmin yok).
- **Altı bileşen** (OPS onaylı kapsam, dışına çıkılmadı): `AnaEylemDugmesi` · `CerceveliDugme` ·
  `Kart` · `Cip` · `TeknikTablo` · `KabukBandi`. Her biri `.jsx` + `.d.ts` + `.prompt.md`,
  dizin başına bir kart. Yöntemin varsayılan seti (Toast · Tabs · Dialog · Avatar · Input …)
  **girmedi**; "bilinçli ekleme" listesi boş.
- **19 temel kartı** `guidelines/`: marka paleti · kapsamlı vurgu · metin renkleri · yüzeyler ·
  kenar · yarıçap-gölge yokluğu · ölçü · Archivo · Source Serif 4 · IBM Plex Mono · ölçek ·
  **üç ikon boyu yan yana (64/48/24)** · üç ikon sürümü · yedi kategori ikonu · dokuz senaryo
  ikonu · işaret yedi sürüm · kilitler · favicon/avatar/paylaşım · marka listesi (yedi).
- **Kabuk ekranı** `ui_kits/kabuk/` — koyu utility şeridi + 74 px koyu header + aydınlık gövde +
  koyu footer. İçerik **boş**, gerekçesi dosyada yazılı (K11). UI kit tam ekranı girmedi.
- **`assets/icons/` 144 SVG · `assets/logo/` 28 SVG** — türev kopya damgası `readme.md`'de:
  *"üretilmiş türev kopya, kaynak Marka Kılavuzu `brand/`, elle düzenlenmez"* + kopya tarihi.
- `readme.md` (kaynaklar · VISUAL FOUNDATIONS · CONTENT FUNDAMENTALS · ICONOGRAPHY · bileşen
  dizini · bilinçli ekleme/eksik · dosya dizini · bakım) · `SKILL.md` · `thumbnail.html`.

## Yazı tipleri

Archivo · Source Serif 4 · IBM Plex Mono — üçü Google Fonts, SIL OFL. Kök `styles.css`
**bağlantıyla** yükler; `@font-face` yazılmadı, binary taşınmadı, **ikame önerilmedi**.
Sonuç: derleyici "Fonts: (none)" der — beklenen durum, eksiklik değil.

## Ölçmediğim için yazmadıklarım

Hareket ve hover/press tokenı (sözleşmede 0 eşleşme) · boşluk ölçeği (22 değer ölçüldü, tek
sayılar bilinçli; ayrı karar turu bekliyor) · 15 kademeli nötr ölçek · semantik renk çiftleri ·
arayüz (kontur) ikon seti — sahibi DESIGN-MENU, kontur 1.5 ölçümü sözleşmede.
44 px dokunma hedefi ve 1060 px içerik ölçüsü boşluk ölçeği kararı beklediği için **token değil
kural** olarak yazıldı (Ölçü kartında ve `readme.md`'de).

## Yöntemde bir değişiklik — karar sorusu

Kurulum sırasında "Starting Points" mekanizmasının **kaldırıldığını** ölçtüm: tüketici projeler
artık başlangıç noktası sunmuyor, yerine **şablon** (`templates/<slug>/`) geldi. Kabuk ekranına
koyduğum `@startingPoint` etiketleri işlevsiz kaldığı için kaldırıldı; ekran **kart** olarak
görünüyor (Design System sekmesinde "Kabuk" grubu).

**Soru:** kabuk ekranı ayrıca `templates/kabuk/` şablonu olarak da açılsın mı? Faydası: tüketici
proje tek tıkla kabuktan başlar. Bedeli: aynı kabuk markup'ı iki dosyada durur (şablonlar kart
ızgarasına girmiyor, kart şablon listesine girmiyor) — tek-kaynak ilkesine aykırı. Kendiliğinden
açmadım.

## Doğrulama notu

Bileşen kartları derleyicinin ürettiği `_ds_bundle.js`'i okur; bundle tur sonunda yeniden
derlenir. Kurulum turunun içinde bundle henüz boş olduğu için bileşen kartları o anda boş boyandı,
temel kartları (ikon, logo, renk, tipografi) doğru boyandı. Bundle derlendikten sonra dördü de
görünür; sonraki turda gözle teyit edilecek.

## Yapmadığım

**Published kutusu işaretlenmedi** — o Recep'in kararı. Share menüsünde File type = Design System
işaretlenmesi de gerekiyor (proje türü OPS tarafından zaten doğrulandı).

— DESIGN-MARKA (Opus) 2026-09-05

