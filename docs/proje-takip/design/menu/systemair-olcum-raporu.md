
# Systemair ölçüm raporu — 7 madde (DESIGN-MENU, 2026-09-05)

İstek: Linear "Vitrin 15A Yeniden Tasarım" · OPS yorumu 09-05 06:22. Çizim yok, sayı + hâl.
Kaynak: Supabase `venthub-hvac-platform` (salt-okuma SELECT, 09-05 07:48–07:52) + depo `peckop/venthub-hvac-esite@6556a6b2`.
Hâl sözlüğü: **veri taşıyor** / **kısmen** / **taşımıyor**. Ölçülemeyen "ölçülemedi" yazıldı, değer uydurulmadı.

---

## 1 · Seri anlatımı (§3.4) — **kısmen**

| Ölçüm | Değer |
|---|---|
| `product_families` (silinmemiş) | **40** |
| `description` jsonb, `{tr,en}` biçiminde | 40/40 |
| TR açıklama > 40 karakter | **31** |
| EN açıklama > 40 karakter | **31** |
| TR açıklama ortalama uzunluk | **130 karakter** (≈1 cümle) |
| Açıklaması boş aile | **9** |
| `is_description_manual` | **40'ının hepsi `false`** (elle yazılan yok; hepsi üretilmiş) |
| `name_i18n → en` dolu | **40/40** |
| `meta_description` dolu | **0/40** |
| `series_code` dolu | **34/40** |
| Ürün → aile bağı | **375/375** (`family_id` boş ürün yok) |

Açıklaması boş dokuz aile: AVenS BVU-LS Kurşun Seperatör · AVenS Hız Anahtarları · AVenS Hücreli Aspiratörler HF/S ·
AVenS Sulu Batarya Kanal Tipi · Danfoss VLT Micro Drive FC 51 · **JET Serisi** · **STORM Serisi** ·
Vortice H AD Elektrikli Isıtmalı Hava Perdeleri · Vortice Lineo Kanal Fanları.
(JET ve STORM 15A çizimlerinde örnek olarak kullanılıyor; ikisinin de anlatımı yok.)

**Aile başına model dağılımı** (40 aile, 375 model):

| Model sayısı | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 13 | 14 | 16 | 17 | 20 | 21 | 23 | 40 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Aile adedi | 1 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 2 | 1 | 1 | 2 | 2 | 1 | 1 | 2 | 1 | 1 |

Tek modelli aile **1 tane**; iki ve altı modelli aileler 8 tane. Yani "seri sayfası tek modelli ailede ne olur"
sorusu bir aileyi ilgilendiriyor — kural: model tablosu tek satır olur, seri sayfası ayrı çizilmez, aile PDP'si yeter.

**Kapanış bedeli:** içerik işi. 9 boş + 31 tek cümlelik açıklama → 40 ailenin anlatımı yazılacak. Kod işi yok
(alan mevcut, `is_description_manual` bayrağı elle yazımı zaten bekliyor).

---

## 2 · Dört kalın madde (§3.2) — **kısmen** (kategoriye göre değişir)

Kategori başına, ürünlerin **≥%70'inde dolu** `technical_specs` anahtarları:

| Üst kategori | Ürün | ≥%70 dolu anahtar sayısı | Öne çıkan dördü (oran) |
|---|---|---|---|
| Fanlar | **295** | 6 | max_absorbed_power_w %86 · voltage_v %83 · phase %80 · diameter_mm %79 |
| Kontrol Sistemleri | 37 | 10 | drive_code · rated_output_current_a · max_voltage_v · ip_rating (hepsi %89) |
| Isı Geri Kazanım (VMC) | 16 | 20 | thermal_efficiency_pct · has_bypass · filter_classes · motor_type (hepsi %81) |
| Hava Perdeleri | 8 | 19 | airflow_speed_max_ms · number_of_speeds · size_a/b/c_mm · noise_level_db_a (hepsi %100) |
| İklimlendirme ve Hava Şartlandırma | 17 | **0** | — |
| Aksesuarlar | 2 | 1 | compatible_model %100 |

**Cevap OPS'un sorusuna:** dolmayan kategoride madde sayısı düşer, başlık değişmez. İklimlendirme'de (17 ürün)
hiçbir anahtar %70'i tutmuyor → o kategoride dört madde bloğu **hiç çizilmez** (K7 kuralı: yoksa satır yok).
Fanlar'da dördü rahat çıkıyor. Kural önerisi: en çok 4, en az 2 madde; 2'nin altına düşerse blok görünmez.

Not: kategori toplamı 375 ürünün tamamını kapsıyor ama listede **Sığınak Havalandırma yok** — o kategorinin
dallarında aktif ürün yok (ürünsüz dal sayısı 7, K3 gereği görünmez). Ayrıca `categories` tablosunda
`parent_id is null` olan **13** satır var; menü 7 kategori gösteriyor. Fark 15A ağacı ile tablo arasında;
ayrı bir kalem olarak yazıldı (aşağıda madde 7).

**Kapanış bedeli:** kod işi (küçük) + kategori başına anahtar seçim tablosu (OPS/Recep). Veri var.

---

## 3 · Yapısal altı blok (§3.1) — **taşımıyor**

| Ölçüm | Değer |
|---|---|
| `products.description_i18n → tr` dolu | **374 / 375** |
| `→ en` dolu | **374** |
| TR ortalama uzunluk | **111 karakter** |

En uzun beş açıklamada altı bloğun karşılığı arandı (anahtar kelime taraması):

| Blok | 5 örnekte geçen |
|---|---|
| Gövde / kasa | 1 |
| Çark / pervane | **0** |
| Motor | 2 |
| Koruma (IP, termik, izolasyon) | **0** |
| Kontrol (hız, kademe, 0-10 V) | **0** |
| Montaj / bağlantı | 3 |

Metinler tek cümlelik vitrin tanımı ("Duvar tipi montaja uygun, 315 mm nominal çaplı, 4 kutuplu, yüksek verimli
ex-proof aksiyel sanayi fanı"), Systemair'ın 6 bloklu anlatımı değil. 111 karakter ortalama, altı bloğa
bölünecek metin değil.

**Kaynak sorusu:** ingestor'daki 24 marka kataloğu PDF'i blok içeriğini **seri düzeyinde** taşıyabilir
(Systemair de aynı metni seri ile model arasında paylaşıyor). Ölçemediğim: PDF'lerin yapısal başlık taşıyıp
taşımadığı — ingestor çıktısına erişimim yok, **ölçülemedi**.
**Kapanış bedeli:** içerik işi, 40 aile × 6 blok = **240 kısa metin** (boş blok çizilmediği için gerçek sayı daha
düşük; fan ailelerinde 6, aksesuarda 2-3 blok). Ürün başına yazım (375 × 6) gereksiz — blok seri düzeyinde yazılır,
model sayfası devralır.

---

## 4 · Belge tipleri (§3.3) — **taşımıyor** (tablo yok)

Şema tarandı: `%document%`, `%file%`, `%asset%`, `%catalog%` kalıplarına uyan **hiçbir tablo yok**.
`products` tablosunda `*_url` kolonu yok (OPS ölçümüyle aynı). Tek dosya tablosu **`product_images`**
(`id, product_id, path, alt, sort_order`) — yalnız görsel; **339 / 375 ürün** görselli.

Yani teknik katalog, veri sayfası, kılavuz, P-Q eğrisi PDF'i, DXF, uygunluk beyanı için **veri yeri yok**.
P-Q eğrisi bir istisna: `technical_specs → pq_curve` içinde **145 ürün** (GB8 ölçümüyle aynı) — belge değil, veri.

**Kapanış bedeli:** kod işi (tablo + admin yükleme + storage) + içerik işi (dosyaların toplanması).
15A'nın "belge düğmesi yalnız dosya bağlıysa görünür" kuralı (K7) bugün **hiçbir düğmenin görünmediği** anlamına
geliyor; çizimdeki üç düğme (katalog, eğri, DXF) bugün veriye oturmuyor.

---

## 5 · Kataloglar sayfası (§3.5) — **taşımıyor**

Madde 4'ün sonucu: marka × belge tipi ızgarası bugün veriden **doldurulamaz**; boş hücre oranı **%100**.
Sayfa çizilse tamamı yer tutucu olurdu. Ölçüm sonucu: sayfa **çizilmez**, madde 4'ün tablosu açılana kadar
boşluk listesinde "GERÇEKTEN YOK — veri yeri yok" satırı olarak durur.

---

## 6 · Seri sayfası adresi (§3.4) — **düzeltme: kod BUNU ZATEN YAPIYOR**

Systemair raporumda "seri sayfası yok, sku'suz adres ilk modele düşüyor" yazmıştım. Kodu okudum, **yanlış**:

- `src/app/[lang]/products/[slug]/page.tsx` — PDP **aile kanoniktir** (F5-B W2.2). Slug bir AİLE slug'ı;
  belirli varyant **`?sku=`** ile ön-seçilir ve `?sku=` canonical'a girmez. Eski varyant slug'ları **308**
  ile aile adresine taşınır. REC-65 / K3 kararıyla birebir aynı.
- Yol çözümü `resolveProductRoute` içinde, dört sonuç: `family` → PDP · **`series` → `SeriesLandingView`
  (HTTP 200)** · `redirect` → 308 · `not-found` → 404. Yani **seri landing görünümü kodda VAR**
  (hero + breadcrumb + `FamilyCard` ızgarası + TrustSignals + BottomCTA; `showWizard={false}`).
- **Ama bugün hiç tetiklenmiyor:** `parent_family_id` dolu aile **0**, doğrudan varyantı olmayan aile **0**.
  Seri landing dalı ölü kod; 40 ailenin hepsi doğrudan varyantlı, hepsi PDP'ye düşüyor.

**Gerçek boşluk düzeltilmiş hâliyle:** eksik olan *sayfa tipi* değil, **ailenin anlatımı** (madde 1 ve 3) ve
`SeriesLandingView`'in 15A diline taşınması. Yeni sayfa tipi kararı gerekmiyor — Recep'e sorulacak soru
küçüldü: "aile PDP'sinin üstünde seri anlatımı bloğu mu, yoksa ayrı `/products/<aile>` landing mi?"
Kod ikisini de destekliyor.

**Kapanış bedeli:** kod işi küçük (mevcut görünümün stili), içerik işi büyük (madde 1 + 3).

---

## 7 · Kategori rehber paragrafı (§3.6) — **taşımıyor**

| Ölçüm | Değer |
|---|---|
| `categories` satır | **37** (13 `parent_id is null` + 24 dal) |
| `is_active` olan | **23** |
| `description` dolu | **0** |
| `authority_content` dolu | **0** |
| `metadata` dolu | **37** (hepsinde bir şey var; içeriği ayrı incelenmeli) |
| `marketing_title` dolu | 23 |
| `menu_label` dolu | 31 |
| `display_mode` dağılımı | **series 22 · showcase 11 · landing 4** |
| Aktif ürünü olmayan dal | **7** |

Rehber metni için ayrılmış iki alan (`description`, `authority_content`) **tamamen boş**. Kategori anlatım modu
(K8 üç mod) bugün metin bulamaz. `display_mode` alanı zaten üç mod taşıyor ama adları bizim çizimimizle
birebir değil (**series / showcase / landing** ↔ 15A "seri listesi / vitrin / anlatım") — eşleme yazılmalı.

**Ek bulgu (istenmedi, ölçümde çıktı):** `parent_id is null` **13** satır var, 15A ağacı **7** kategori diyor.
Fark 6; muhtemelen eski/pasif kayıtlar (`is_active` olan 23 satır bunu destekliyor). Kalem olarak yazıldı.

**Kapanış bedeli:** içerik işi (7 kategori × 1 paragraf + 24 dal isteğe bağlı) + küçük kod işi (`display_mode`
eşlemesi). Bilgi Merkezi (K14) bağı Faz 4.

---

## Özet cetvel

| Madde | Hâl | Kapanış |
|---|---|---|
| 1 · Seri anlatımı | kısmen (31/40 tek cümle, 9 boş) | içerik |
| 2 · Dört kalın madde | kısmen (5 kategoride var, İklimlendirme'de yok) | kod (küçük) + seçim tablosu |
| 3 · Yapısal altı blok | taşımıyor (111 karakter vitrin tanımı) | içerik ~240 kısa metin |
| 4 · Belge tipleri | taşımıyor (tablo yok) | kod (tablo+admin+storage) + içerik |
| 5 · Kataloglar sayfası | taşımıyor (%100 boş hücre) | madde 4'e bağlı; şimdi çizilmez |
| 6 · Seri sayfası adresi | **veri taşıyor** (kod hazır, dal ölü) | kod küçük, içerik büyük |
| 7 · Kategori rehberi | taşımıyor (iki alan da boş) | içerik + eşleme |

Ölçülemeyen tek şey: ingestor'daki 24 katalog PDF'inin yapısal başlık taşıyıp taşımadığı (madde 3).

— DESIGN-MENU (Fable) 2026-09-05

