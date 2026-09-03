# REC-135 Adım A — kategori ağacı boşlukları: ölçüm + öneri

> **Durum: ÖNERİ — kod/migration yazılmadı.** Adım B (uygulama) ancak bu tablo
> onaylandıktan sonra; migration içerirse **merge Recep kapısı**, self-merge yok.

## KAYNAK/CETVEL

| | |
|---|---|
| **Yöneten cetveller** | `docs/standards/category-taxonomy-standard.md` · `docs/standards/catalog-ingestion-standard.md` · Linear "Vitrin Kararlar" §3 ağaç |
| **Cetvel eksiği** | "aile → dal" eşleme cetveli yok; bu iş onu **tek sayfa** olarak yazıyor (aşağıda §4) |
| **Karne tazeliği** | Prod SELECT, 2026-09-04. Salt okuma. |
| **YÖNTEM** | Elle, worktree, docs PR. Adım B için plan-challenger. |

---

## 1) ⭐ÖNCE: işin öncülü çürüdü

**İddia:** *"375 ürünün TAMAMI kökte, hiçbir alt dal dolu değil."*

**Ölçüm:** o iddia yalnız `category_id` sütununa bakıyor. Ağaç ataması **`subcategory_id`**
sütununda yaşıyor ve **375 ürünün 365'i dolu.**

Tek sayıya güvenmedim, dört ölçütle doğruladım:

| Ölçüt | Sonuç |
|---|---|
| Gerçek bir alt dala bağlı ürün | **365** |
| Yetim referans (var olmayan kategoriye işaret) | **0** |
| Üst uyuşmazlığı (`subcategory.parent ≠ category`) | **0** |
| Kullanılan alt dal | **17 / 24** |

**Sonuç: iş 375 kalemlik değil.** 40 ailenin **37'si** zaten doğru dalda.

---

## 2) Gerçek boşluk — üç aile, on ürün

Dalsız kalan **3 aile** (40 üzerinden):

| Aile | Kök | Ürün |
|---|---|---|
| Vortice AD Ortam Havalı Hava Perdeleri | Hava Perdeleri | 4 |
| Vortice H AD Elektrikli Isıtmalı Hava Perdeleri | Hava Perdeleri | 4 |
| AVenS BVU-LS Kurşun Seperatör | Aksesuarlar | 2 |

⭐**Sebebi veri hatası DEĞİL:** bu iki kökün **hiç alt dalı yok** (ölçüldü: `Hava Perdeleri`
0 alt dal, `Aksesuarlar` 0 alt dal). Ürünler yanlış yere konmamış — **gidecek yer yok.**
Bu bir taksonomi boşluğu, bir atama hatası değil.

## 3) HÜKÜM — üç aile kök seviyesinde KALSIN

**Öneri: yeni dal açılmasın.** Gerekçeler:

1. **Hava Perdeleri'nde ayrımı zaten AİLE yapıyor.** İki ailenin adı tam olarak müşterinin
   arayacağı ayrımı taşıyor: *ortam havalı* ile *elektrikli ısıtmalı*. Aynı ayrımı bir de
   dal olarak açmak, 8 ürünlük bir kökte bir tıklama daha ekler ve **bulunabilirliği
   artırmaz.**
2. **Aksesuarlar'da evren 2 ürün.** İki ürün için dal açmak taksonomiyi şişirir.
3. **Boş dal bedava değil:** menüde, sitemap'te, breadcrumb'da yer kaplar ve müşteriyi
   1-2 ürünlü sayfalara götürür.

**Ne zaman yeniden bakılır:** bir kökte ürün sayısı **20'yi** geçtiğinde ya da aile sayısı
**4'ü** bulduğunda. Bu eşik §4'teki cetvele yazılıyor.

## 4) Boş dallar ve pasif kökler — müşteriye kapalı, ölçüldü

**7 boş alt dal** (0 ürün): `rectangular-duct-fans` · `air-conditioning-solutions` ·
`window-fans` · `ex-proof-atex-fans` · `jet-fans` · `parking-jet-fan` · `inline-duct-fans`
**Yedisi de `is_active = false`.**

**7 pasif kök** (0 ürün, hepsi eski İngilizce adlı): `air-conditioning` ·
`commercial-ventilation` · `electric-heating` · `hygiene-sanitizer` ·
`residential-ventilation` · `smart-home` · `summer-ventilation`

⭐**Müşteriye sızma riski ÖLÇÜLDÜ ve YOK:** kategori sayfası `is_active = true` süzgecini
uyguluyor ([page.tsx:68 ve 174](../../src/app/[lang]/category/[categorySlug]/page.tsx#L68)).
REC-101'de `parking-jet-fan` tam bu sınıftan kanamıştı; o onarım **genel** yapılmış ve
bugün tutuyor.

**Hüküm: pasif dallar ve kökler SİLİNMESİN.** Yol haritasının izidir, müşteriye kapalıdır,
silmek geri dönüşü zorlaştırır. Tek şart: **pasif kalmaya devam etmeleri**.

## 5) Adım B — ne yapılacak (onay sonrası)

**Bu öneri kabul edilirse yapılacak iş: HİÇBİR ŞEY.**
Ne migration, ne veri yazımı. Mevcut durum doğru; yazılması gereken tek şey **kuralın
kendisi** — "kök seviyesinde ürün meşrudur, eşik aşılınca dal açılır" — ve o da
`category-taxonomy-standard.md`'ye tek bölüm olarak eklenir.

**Bu, işin en değerli çıktısı:** 375 satırlık bir prod yazımı olarak açılan iş, ölçüm
sonrası **sıfır satırlık** bir işe indi.

## 6) Kabul ölçütleri

1. Dalsız aile sayısı **3** ve üçünün de kökü **0 alt dallı** — yani sebep taksonomi
   boşluğu, atama hatası değil.
2. Pasif dal/kök **müşteriye kapalı** (süzgeç ölçüldü).
3. Eşik kuralı (`20 ürün` / `4 aile`) cetvele yazılı.
4. Prod'a yazma **0**.
