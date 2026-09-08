# Kategori görselleri — ölçüm (2026-09-08, URUN-KATALOG)

**YÖNTEM:** elle (tek eksen: canlı `categories` + `storage.objects` + dosya hash'i). Sapma yok.
**CETVEL:** `docs/standards/product-image-standard.md` (mevcut) — kategori görseli için kol YOK,
yazımı bu işin kapsamındadır.
**KAYNAK:** canlı DB (`tnofewwkwlyjsqgwjjga`), storage `product-images` kovası, indirilmiş
dosyaların `md5sum`'ı. Ölçüm damgası **06:20–06:25Z**.

---

## 0. Niçin bu ölçüm

Recep'in gözlemi (URUN üzerinden devredildi, lafzıyla):

> *"hava perdesi resmini daha iyisi var zaten arka planı da beyaz değil onun kirli beyaz gibi..
> aksesuar içinde resim lazım.. diğer resimlerde tam ortalı değil ve orantısız görünüyorlar.
> ve 2 anesi de aynı resim.. ısıgerikazanım doğru ama havaşartlandırmada da ısı geri kazanım
> resmi var. merkezlemeler de hepsinde elden geçmeli.. fanlar için de sessiz fan resmi kullanılsın"*

**Her maddesi doğru çıktı. İki madde ölçümde İDDİADAN BÜYÜK çıktı.**

---

## 1. Doluluk — 37 kategori

| | toplam | `image_url` BOŞ |
|---|---|---|
| üst kategori | 13 | **8** |
| yaprak | 24 | 8 |
| **toplam** | **37** | **16** |

Boş üstler: `accessories` · `air-conditioning` · `commercial-ventilation` · `electric-heating`
`hygiene-sanitizer` · `residential-ventilation` · `smart-home` · `summer-ventilation`

⛔**BOŞ 16 KATEGORİNİN HİÇBİRİNDE GÖRSELLİ ÜRÜN YOK** (ölçüldü: `gorselli_urun = 0`, hepsinde).
Sekizinin ürünü de yok. **Sonuç: bu iş "var olan havuzdan seçim" işi DEĞİL, görsel TEDARİK işidir.**
Bende görsel üretme yeteneği yok ([[no-image-generation-capability]]); kaynak marka siteleridir
([[brand-image-sources]]). Bu, işin süresini ve yöntemini değiştirir — emir buna göre yazılmalı.

## 2. ⭐"2 tanesi de aynı resim" — gerçek sayı DÖRT (kategori), DOKUZ (dosya)

Dört kategorinin görseli **byte-eşit aynı dosya** (`md5 cce86848005c…`):

| kategori | düzey | görselin ait olduğu ürün |
|---|---|---|
| `air-treatment` (İklimlendirme ve Hava Şartlandırma) | üst | AVE-13053 sulu batarya |
| `heat-recovery-vmc` (Isı Geri Kazanım) | üst | AVE-13013 ısı geri kazanım |
| `ducted-central-hrv` (Kanallı Merkezi Üniteler) | yaprak | AVE-13011 ısı geri kazanım |
| `water-coil-duct-heaters` (Sulu Batarya Kanal Tipi) | yaprak | AVE-13052 sulu batarya |

Gözle bakıldı: dosya **bir AVenS kutu tipi ısı geri kazanım cihazı** fotoğrafı.
Recep'in *"hava şartlandırmada da ısı geri kazanım resmi var"* teşhisi **birebir doğru**.

## 3. ⭐ALTINDAKİ ASIL KUSUR — altı ürün YANLIŞ FOTOĞRAFLA satılıyor

Kategori tekrarı bir **sonuç**; sebep ürün görsellerinde. Aynı ısı-geri-kazanım fotoğrafı
**dokuz ürün kaydında** duruyor ve altısı tamamen başka bir üründür:

| SKU | ürün | fotoğraf doğru mu |
|---|---|---|
| AVE-13010 / 13011 / 13013 | AVenS 750 / 1000 / 2000 ISI GERİ KAZANIM | ✔ doğru |
| **AVE-13052 · 13053 · 13054 · 13055 · 13056 · 13057** | **SULU BATARYA 11–40 KW KANAL TİPİ** | ⛔**YANLIŞ** |

Sulu batarya bir ısıtma serpantinidir; vitrinde onun yerine kutu ünite fotoğrafı görünüyor.
Üç ayrı dosya boyutunda (7108 · 8744 · 12568) aynı desen — yani **üç görselin üçü de** kopyalanmış.

**Kusurun sınırı ölçüldü:** kategori sınırını aşan görsel paylaşımı **yalnız bu grupta** var.
Diğer paylaşımların hepsi aynı kategori içi (varyant paylaşımı — meşru).
En büyük grup 23 ürün, hepsi tek kategori.

## 4. `fans` görseli

`fans` üst kategorisi = **ADH-200 E2** (NIC-11942) — gözle bakıldı: **santrifüj/salyangoz fan**.
Recep *"fanlar için sessiz fan resmi kullanılsın"* dedi; mevcut görsel sessiz fan DEĞİL. Doğru.

## 5. Kova sözleşmesi sapması — iki kategori yerel dosya gösteriyor

`air-curtains` → `/images/products/air-curtain.png` · `inline-duct-fans` → `/images/products/vortice_lineo_360.png`

Diğer 19 kategori storage URL'i taşıyor. Yani **kategori görseli için iki ayrı taşıyıcı**
yan yana yaşıyor ve hangisinin kanonik olduğu yazılı değil. Recep'in *"hava perdesi… arka planı
kirli beyaz"* şikayeti tam bu yerel PNG'ye ait.

---

## Hüküm ve sıra

1. ⛔**Sulu batarya altılısının yanlış fotoğrafı** — vitrinde yanlış ürün gösteriliyor; en ağır
   kalem. Düzeltme canlı veri değişikliğidir → **Recep kapısı**. Doğru fotoğraf elde YOK;
   kaldırma mı, tedarik mi — Recep'in kararı.
2. Kategori görseli tedariki (16 boş + `fans` + `air-curtains` değişimi) — tedarik işi, üretim değil.
3. Kova sözleşmesinin tek kaynağa alınması + kategori görseli için konformans kolu
   (bugün YOK: dört kategorinin aynı dosyayı göstermesini hiçbir kapı görmedi).
4. Merkezleme/orantı — görsel işleme; kalem 1–3 kapanmadan sıraya girmez.

**Bu belgede canlıya hiçbir yazım yapılmamıştır.**

---

## ⛔DÜZELTME — 06:35Z, ÖLÇÜTÜM DOĞRUYDU AMA EVRENİM YANLIŞTI

Yukarıdaki "16 boş kategori" sayısı **iş hacmi olarak yanlış**: `is_active` alanına bakmamıştım.

| | sayı |
|---|---|
| `image_url` boş | 16 |
| bunlardan **pasif** (`is_active=false`, vitrinde YOK) | **13** |
| **gerçekten görsel gereken AKTİF kategori** | **3** |

Görsel gereken üçü: `accessories` (üst, 2 ürün) · `electric-duct-heaters` (6 ürün) ·
`industrial-ceiling-fans` (7 ürün).

**Yani tedarik işi 16 değil 3 kalemlik.** Dün gece panoya ve URUN'e "16/37 boş, üst 13'ten 8'i
boş" diye bildirdiğim sayı bu düzeltmeyle geçersizdir; düzeltme aynı turda panoya yazıldı.

⭐**Ders (tekrarlayan):** ölçüt keskin, evren yanlış → yanlış iş emri doğar. Aynı hatayı BUILD
vakasında da yapmıştım. Kural: "kaç tane boş" sorusunda **görünürlük alanı** evrenin parçasıdır.

## ⭐YENİ BULGU — 26 ürün PASİF kategoride duruyor

Düzeltmeyi ararken çıktı; görsel işinden ayrı ve muhtemelen daha ağır:

| kategori | ürün (hepsi `status=active`) | `is_active` |
|---|---|---|
| `ex-proof-atex-fans` (Ex-Proof / ATEX Fanlar) | **12** | false |
| `rectangular-duct-fans` (Dikdörtgen Kanal Tipi) | **7** | false |
| `commercial-ventilation` (ÜST kategori) | **7** | false |

Ürünlerin kendisi aktif ama bulundukları kategori kapalı. **Bu ürünlere kategori üzerinden
erişilip erişilemediği ÖLÇÜLMEDİ** — kategori sayfası ve menü URUN'ün alanı, ölçümü ona ait.
Eğer erişilemiyorsa 26 aktif ürün vitrinde görünmüyor demektir. Ayrı kayıt açılacak.
