# Slug üretim kuralı — cetvel taslağı (Emir #8, teslim 1) · 2026-09-11

**Durum: HAZIR** (OPS emri 11-09: "slug kuralı ve 308 tablosunu bitir, Vitrin projesine HAZIR yaz"). Kararlar: K3-b + Recep hükümleri 11-09 (Türkçe önek · kod = SKU · küçük harf + 308). Uygulama URUN şeridinde, tek PR zinciri. Kaynaklar: Kararlar K3-b · `docs/plans/slug-localization-2026-08-10.md` · `docs/standards/category-taxonomy-standard.md` §4 · §4.1 · Supabase SELECT ölçümü 2026-09-11.
**Yazma yok:** bu belgedeki hiçbir SQL çalıştırılmadı; ölçümler yalnız `SELECT`.

## 0 · K3-b'nin getirdiği çerçeve

- `/tr/kategori/` ve `/tr/urun/` — önek **kalır ama Türkçeleşir** (Recep hükmü 11-09; K3-b'nin "kelime aynı kalır" satırı güncelleniyor). EN yüzey `/en/category/` · `/en/products/` olarak kalır. Önek kaldırmanın SEO faydası yok; çakışma riski ve fazladan sorgu var.
- Kanonik kimlik **EN slug** (`categories.slug`), görünen URL dile göre (`metadata.slug = {tr,en}`), yanlış dil **308** (plan §1, PR #457 prod'da).
- Ürün adresi: `/tr/urun/<teknik-uzun-slug>-p-<kod>` — adres **sondaki kodla** çözülür, slug metni değişse adres bozulmaz.
- Zaman: katalog paketi bitince **tek yayında**; öncesinde canlı adres değişmez.

## 1 · Hüküm: ürün slug'ı dile bağlı olmalı (plan §4'ün "dil-nötr" notunu genişletir)

Plan §4 ürün slug'ını *dil-nötr (marka+model)* sayıp kapsam dışı bırakmış. K3-b ise slug'a **Türkçe teknik kelimeler** koyuyor (`sessiz-kanal-tipi-fan`). İkisi bir arada durmuyor: Türkçe kelime taşıyan bir slug dil-nötr değildir ve `/en/` yüzeyinde yanlış dil olur.

**Hüküm:** kategori için kurulmuş kalıp ürüne de uygulanır — `products.metadata.slug = {tr,en}`; kanonik kimlik yine SKU'dur, görünen slug dile göre çözülür, yanlış dil 308.
**Gerekçe:** (a) slug'ın SEO değeri tam olarak o Türkçe kelimelerden geliyor, atılırsa K3-b'nin amacı kalmaz; (b) çözücü ve 308 mekanizması kategori tarafında **zaten yazılmış** (plan §1), ürün için yeniden icat gerekmez; (c) kimlik kodda olduğu için iki dilin slug'ı bağımsız değişebilir, çapraz 301 doğmaz.
**Maliyet:** `products.metadata` jsonb'sine bir alan + mevcut çözücünün ürün tarafına genişletilmesi. Şema değişmez.

## 2 · Hüküm: sondaki kod **SKU** olur, DB id olmaz

Emir `-p-<id>` yazıyor, örnek `p-17161`. Ölçüm: `17161` Vortice'in katalog kodudur ve bizim SKU'muzun (`VRT-17161`) sayısal parçasıdır.

**Hüküm:** kod = **SKU, küçük harf** → `-p-vrt-17161`.
**Gerekçe:** (a) B2B alıcı **kodu arar** — SKU adreste geçerse kod aramasında sayfa birebir eşleşir, DB id'si hiçbir aramada geçmez; (b) SKU marka ön ekiyle kendi ad alanını taşır (`vrt-` · `sea-` · `ave-` · `dan-`), iki markanın aynı sayıyı kullanması adresi çakıştırmaz; (c) DB id göç/yeniden yükleme ile değişebilir, SKU üreticiye bağlı kalıcıdır; (d) katalog paketi satırının kimliği de SKU'dur — paket, DB ve adres aynı kimliği konuşur.

## 2.1 · Hüküm: SKU adreste küçük harf, çözümlemede harf duyarsız

- Kanonik biçim **küçük harf**: `-p-vrt-17161` · `-p-sea-51302000`.
- Büyük harfli gelen adres (`-p-VRT-17161`) **kabul edilir ama 200 vermez**: küçük harfli kanonik adrese **308**.

**Gerekçe (ölçüm 11-09):** URL yolu harfe duyarlıdır (RFC 3986) — iki yazımı 200 ile açmak aynı içeriği iki adreste yayınlamaktır · 442 SKU'nun **tamamı** `^[A-Z0-9-]+$` kalıbında, `lower(sku)` ile tekil sayı **442 = 442** → küçük harfe indirmek çakışma doğurmuyor, kayıp yok · B2B alıcı kodu katalogdan/e-postadan **büyük harfle** kopyalar, 404 vermek kullanıcı kaybıdır · SKU içindeki tire korunur (`sea-51302000`); başka ayırıcı ölçümde yok.

## 3 · Üretim şablonu

```
slug = [marka] + [model] + [ürün tipi] + [en fazla 3 teknik değer]
adres = /<dil>/products/<slug>-p-<sku>
```

**Alan sırası ürün tipine göredir** — tek bir küresel sıra yazılamaz, çünkü ölçüm gösteriyor ki alanların çoğu tipe göre boş:

| Ürün tipi | 1. değer | 2. değer | 3. değer |
|---|---|---|---|
| Radyal · asit/korozyon dayanımlı · plug · hücreli | debi `m3h` | basınç `pa` | çap `mm` |
| Kanal tipi · çatı tipi · konut tipi · kanal içi | çap `mm` | basınç `pa` | debi `m3h` |
| Hava perdesi | uzunluk `mm` | ısıtma tipi (`elektrikli`/`sulu`) | — |
| Sığınak ünitesi | debi `m3h` | güç `w` | — |
| Frekans konvertörü · hız anahtarı | güç `kw` | gerilim `v` | faz |
| Nem alma · kanal ısıtıcı · sulu batarya | kapasite | güç `kw` | çap `mm` |
| Aksesuar · sensör | — | — | — |

**Kurallar:**
1. **Dolu olan ilk üç değer yazılır.** Boş alan atlanır, yer tutucu konmaz (K7). Aksesuar/sensörde hiç değer olmaz; slug marka + model + tip ile kalır.
2. **Model adı bir değeri zaten taşıyorsa slug'da tekrar edilmez.** Ölçülmüş örnek: `Air Door AD 1200` model numarası kapı uzunluğudur → `ad-1200-…-1200mm` yazılmaz. Aynısı `BVU 1000-230W` için geçerli.
3. **Uzunluk tavanı:** slug metni **≤ 70 karakter** (kod hariç), **≤ 10 kelime**. Aşarsa sırayla düşen: 3. teknik değer → 2. teknik değer → ürün tipinin sıfatları.
4. **Türkçe karakter:** `ğ→g · ü→u · ş→s · ı→i · ö→o · ç→c`, büyük harf küçülür. `&→ve`, `/→-`, `%→yuzde`. Noktalama silinir, boşluk tireye döner, tekrarlanan tire tekleşir, baş/son tire olmaz.
5. **Birim yazımı bitişik ve küçük:** `2476m3h` · `250mm` · `368pa` · `1100w` · `1.1kw` → `11kw` yazılmaz, **`1-1kw`** kullanılır (ondalık tire olur) · `380v` · `1400dk`. `m³/h → m3h`. **Binlik ayraç yok.** Ondalık basınç yuvarlanır: `367.8 → 368pa`.
6. **`-p-` dizisi slug metninde geçemez** — bölme kuralını bozar. Tek harflik `p` kelimesi slug'a yazılmaz.
7. **Slug bir kez üretilir.** Sonradan metin düzeltilebilir, kod sabit kaldığı için yönlendirme gerekmez.
8. **Anahtar kelime yığını yasak.** Rakip slug'ları (Trendyol, Hepsiburada) yalnız *hangi teknik terimin arandığını* görmek için taranır; satıcı kodu, mağaza adı, "ucuz/kaliteli/orijinal" gibi doldurma kelimeler alınmaz. Değerler `technical_specs`'ten okunur, uydurulmaz.

## 4 · Beş gerçek üründe örnek (hepsi Supabase ölçümü, 2026-09-11)

| # | Ürün · SKU · ölçülen değerler | Adres |
|---|---|---|
| 1 | **SEAT 30** · `SEA-51302000` · debi 2476 m³/h · çap 250 mm · 1,1 kW · 380 V · dal: Asit Dayanımlı · aile: SEAT Serisi | `/tr/urun/seat-30-korozyon-dayanimli-radyal-fan-2476m3h-250mm-p-sea-51302000` |
| 2 | **Vortice Lineo 250 Quiet ES** · `VRT-17175` · çap 250 mm · basınç 367,8 Pa · 125 W · dal: Kanal Tipi · aile: Lineo Quiet | `/tr/urun/vortice-lineo-250-quiet-es-sessiz-kanal-tipi-fan-250mm-368pa-p-vrt-17175` |
| 3 | **Vortice CA-RM 150 RF ES** · `VRT-16257` · çap 147 mm · basınç 225 Pa · 160 W · dal: Çatı Tipi · aile: Radon Çatı Fanları | `/tr/urun/vortice-ca-rm-150-rf-es-radon-cati-tipi-fan-147mm-225pa-p-vrt-16257` |
| 4 | **Vortice Air Door AD 1200** · `VRT-65196` · 200 W · aile: AD Ortam Havalı Hava Perdeleri · **dal atanmamış** | `/tr/urun/vortice-air-door-ad-1200-ortam-havali-hava-perdesi-p-vrt-65196` |
| 5 | **AVenS BVU 1000-230W** · `AVE-30100` · 230 W · dal: Sığınak Havalandırma Fanları | `/tr/urun/avens-bvu-1000-siginak-havalandirma-unitesi-230w-p-ave-30100` |

4 ve 5 numaralı örnekler **kural 2**'nin işleyişini gösteriyor: model numarası ölçüyü (1200 mm kapı, BVU 1000) zaten taşıdığı için değer tekrar edilmedi. 4'te `debi/basınç` alanları boş olduğu için teknik değer hiç yazılmadı — uydurma yapılmadı.

EN karşılıkları aynı kalıpla, `metadata.slug.en`: ör. #2 → `vortice-lineo-250-quiet-es-silent-inline-duct-fan-250mm-368pa-p-vrt-17175`.

## 5 · Aile ve varyant ilişkisi — `?sku=` kalkar

Ölçüm: aile slug'ları DB'de **hazır** (`vortice-lineo-quiet` · `seat-serisi` · `vortice-radon-range-roof` · `avens-siginak-havalandirma-uniteleri`…). Bu yüzden ayrı bir önek gerekmiyor; ayrım **kodun varlığıdır**:

| Nesne | Adres | Kural |
|---|---|---|
| Aile (seri) | `/tr/urun/vortice-lineo-quiet` | kod **yok** → aile sayfası: anlatım + model tablosu |
| Model (kanonik) | `/tr/urun/…-p-vrt-17175` | kod **var** → teknik tablo, hesap paneli, teklif |
| Varyant | kendi SKU'su, kendi adresi | `?sku=` **kalkar** (09-08 model kanonik kararı) |

Yönlendirici tek kural: **son `-p-` varsa model, yoksa aile.** Mevcut `/tr/urun/<aile>?sku=<model>` adresleri modelin kendi adresine 308.

## 6 · Kategori adresi — hüküm: önek kalır, slug ZENGİNLEŞMEZ

Emir bu hükmü gerekçesiyle bize bırakmış. **Kategori slug'ı kısa ve kanonik kalır** (`radyal-fanlar`, `kanal-tipi-fanlar`); teknik kelime eklenmez.

**Gerekçe:**
1. **Çözücü önceliği bozulur.** Cetvel §4.1 çözücüyü üç koşulla tanımlıyor (`slug` · `metadata.slug.tr` · `metadata.slug.en`) ve *"aynı öncelikte iki satır bir VERİ kusurudur"* diyor. Zenginleştirilmiş bir TR slug (`radyal-fanlar-santrifuj-endustriyel`) ikinci bir iddia satırı üretir; kusur olasılığı bedava değildir.
2. **Kategori SEO'sunu adres taşımıyor.** Kategori sayfasının sıralama yükü H1, açıklama metni, dal ve faset adları, aile kartlarındaki model adlarıdır — hepsi sayfada. Ürün slug'ında uzun metin işe yarar çünkü ürün sayfasının metni kısadır; kategori sayfasında zaten bol metin var.
3. **Her zenginleştirme bir göç demek:** 308 zinciri, sitemap yenilemesi, `translation_key` ve sözlük dokunuşu. 22 dolu dal × iki dil = 44 adres; kazancı ölçülmemiş bir işlem için.
4. **Kanonik kimlik EN slug'dır** (plan §1). Kimliği pazarlama metniyle şişirmek, kimliğin işini bozar.

**Tek istisna — ad düzeltmesinden doğan slug:** Recep kararı `Asit Dayanımlı → Korozyon Dayanımlı Fanlar` (11-09). Burada TR slug `asit-dayanikli-fanlar` artık adı yansıtmıyor. Öneri: `metadata.slug.tr = korozyon-dayanimli-fanlar` yazılır, eski TR slug 308 ile yaşar, **kanonik EN slug `acid-resistant-fans` DEĞİŞMEZ** (kimlik sabit kalır, kod ve CSV dokunulmaz).

## 7 · Ölçülen düzeltmeler (slug tarafı)

| Kayıt | Bugün | Kusur | Öneri |
|---|---|---|---|
| `centrifugal-fans` | ad `Santrifüj / Radyal Fanlar`, tr slug `radyal-fanlar` | **ad** eğik çizgili; slug **doğru** | ad → `Radyal (Santrifüj) Fanlar`. Slug değişmez → **301 yok** |
| `acid-resistant-fans` | ad `Asit Dayanımlı Fanlar`, tr slug `asit-dayanikli-fanlar` | ad/slug "dayanımlı↔dayanıklı" tutarsız | ad → `Korozyon Dayanımlı Fanlar`, tr slug → `korozyon-dayanimli-fanlar` + 308 |
| `spare-parts-sensors` | `translation_key = null` | cetvel §4 `translation_key` zorunlu; ham `c.name` render yasak | `sub.spare-parts` açılır, sözlüğe tr+en girer |
| `jet-fans` + `parking-jet-fan` | ikisi de `is_active=false`, ürün 0 | **iki satır aynı kavram**; tr slug'lar neredeyse çakışıyor (`otopark-jet-fanlari` / `otopark-jet-fan`) | tek satıra indirilir (cetvel §6 `parking-jet-fan` kanonik), diğeri kapatılır |
| Ürün slug'ları | yok | `products.metadata.slug` alanı yok | §1 hükmü ile açılır |

**Pasif kayıtlar silinmez:** `commercial-ventilation` · `residential-ventilation` · `rectangular-duct-fans` · `inline-duct-fans` · `ex-proof-atex-fans` hepsi `is_active=false` — cetvel §1 gereği **iskele**, silme yok. (Bu, 11-09 sabahı "çöp kayıt" dediğim tespitin düzeltmesidir: kayıtlar pasif, kusur değil.)

— DESIGN-MENU (Fable) 2026-09-11

