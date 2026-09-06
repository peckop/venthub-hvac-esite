# Aile (Seri) Metninde Sayısal Değer Cetveli

> **SSOT.** Bir ürün ailesinin (serinin) açıklama metninde teknik bir sayı nasıl yazılır.
> v1.0 · 2026-09-06 — REC-157 ölçümü sonrası.
> Zorlayan kapı: `src/__tests__/conformance/aile-metni-sayisal-deger.test.ts` (INV-AILE-SAYI-1).
> **Kuralın durduğu yer:** `docs/standards/vaat-butunlugu-standard.md` **§1.7 (KAPASİTE
> vaadi)** — vaadin dördüncü kardeşi. Orası kuralı söyler, burası nasıl ölçüldüğünü.

---

## 1. Niçin — ölçülmüş olay

Müşteri aile sayfasında şunu okuyordu:

| Aile | Metinde yazan | Serinin GERÇEK aralığı | Sapma |
|---|---|---|---|
| `slimroof-roof` | "Nominal debisi **460 m3/h**" | **460 – 18.600** m³/h | **40×** |
| `slimroof-smoke` | "Maksimum debisi **2580**" | **2.580 – 22.550** m³/h | **8,7×** |
| `vort-e-atex` | "**250 mm** nominal çaplı" | **250 – 630** mm | 2,5× |

Yazılan sayı **yanlış değil, eksik**: serinin **tek bir modelinin** (çoğu vakada en
küçüğünün) değeri, serinin tamamını anlatıyormuş gibi sunuluyor. Alıcı, 18.600 m³/h
çekebilen bir seriyi "460 m³/h'lik fan" sanıp listeden çıkarabilir.

---

## 2. KURAL (İHLAL ETME)

Çok ürünlü bir ailenin metni, bir eksende **yayılma ≥ 2 kat** ise o eksen için:

- ✅ **ARALIK yazar** — "100–315 mm çap seçenekleri", "260–2890 m³/h debi aralığı"
- ✅ ya da o sayıyı **hiç vermez** (söylenmemiş şey yanıltmaz)
- ❌ **tek bir değer yazamaz** — "315 mm çaplı", "nominal debisi 460 m3/h"

**Eşik niçin 2 kat:** bir modelin değeri diğerinin iki katıysa tek sayı yazmak alıcıyı
yanıltır. Daha gevşek eşik gerçek kusurları kaçırır; daha sıkı eşik (ör. 1,5×) dar
serilerde gürültü üretir. Eşik değişirse kapıdaki borç listesi de değişir.

**Tek ürünlü aile bu kuralın dışındadır** — seri değildir, yayılma kavramı yoktur.

---

## 3. Veri paketi nasıl üretilir (kapı bunun üzerinde koşar)

Kapı **damgalı bir veri paketi** okur: `src/__tests__/fixtures/aile-metni-sayisal-<damga>.json`.
Paket şu sorguyla üretilir (prod, SALT-OKUMA):

```sql
WITH aile AS (
  SELECT f.id, f.slug, coalesce(f.description->>'tr','') AS metin
  FROM product_families f WHERE coalesce(f.description->>'tr','') ~ '[0-9]'
), s AS (
  SELECT p.family_id, count(*) AS urun,
    min(nullif(regexp_replace(p.technical_specs->>'diameter_mm','[^0-9.]','','g'),'')::numeric) AS cap_min,
    max(nullif(regexp_replace(p.technical_specs->>'diameter_mm','[^0-9.]','','g'),'')::numeric) AS cap_max,
    min(nullif(regexp_replace(p.technical_specs->>'max_delivery_m3h','[^0-9.]','','g'),'')::numeric) AS debi_min,
    max(nullif(regexp_replace(p.technical_specs->>'max_delivery_m3h','[^0-9.]','','g'),'')::numeric) AS debi_max
  FROM products p WHERE p.technical_specs IS NOT NULL GROUP BY p.family_id
)
SELECT a.slug, s.urun, a.metin, s.cap_min, s.cap_max, s.debi_min, s.debi_max
FROM aile a JOIN s ON s.family_id = a.id WHERE s.urun > 1;
```

⚠**`regexp_replace` NİÇİN VAR:** `max_delivery_m3h` değerlerinin **243'ünden 35'i**
birimi değerin İÇİNE gömüyor (`"10500 m³/h"`). Ham `::numeric` çevirimi bu satırlarda
**patlar** (ölçüldü). Diğer dört alan (`diameter_mm`, `weight_kg`, `noise_level_db_a`,
`max_static_pressure_pa`) **%100 temiz**. Bu, ayrı bir veri temizliği kalemidir.

---

## 4. Kapının ölçtüğü ve ÖLÇMEDİĞİ

| Ölçer | Ölçmez |
|---|---|
| Bilinen borcun **büyümemesi** (yeni ihlal = kırmızı) | **Canlı** veriyi — kapı damgalı pakete bakar |
| Borcun **bayatlamaması** (düzelen kalem listeden silinmeli) | Metnin doğruluğunu (sayı doğru ama eksik olabilir) |
| Ölçüt mantığının bozulmaması (sentetik vakalar) | Aralık ifadesinin **hangi eksene** ait olduğunu |

⚠**"Kapı yeşil" ≠ "canlıda kusur yok".** Canlı kol ayrı iştir: paketi üreten sorgunun CI
adımına bağlanması gerekir (workflow dosyası **ALTYAPI**'nın alanında; devredildi).

⚠**"Aralık ifadesi var" kolu bilerek gevşektir:** metnin herhangi bir yerinde aralık
görürse aileyi aklar; o aralık başka eksene ait olabilir. Gevşeklik **yanlış-kırmızı**
vermemek içindir — yani gerçek borç ölçülenden **biraz büyük** olabilir, asla daha küçük değil.

---

## 5. Ölçülen borç (2026-09-06)

**6 aile-eksen çifti.** Düzeltme, Katalog şeridinin taslak işinde; metin düzelince kapıdaki
`DONMUS_BORC` listesinden de **silinmek zorunda** (tek yönlü mandal).

| Aile | Eksen | Metinde | Aralık | Yayılma |
|---|---|---|---|---|
| `vortice-vort-heatmaster-slimroof-roof` | debi | 460 | 460–18.600 | **40,4×** |
| `vortice-vort-heatmaster-slimroof-smoke` | debi | 2580 | 2.580–22.550 | **8,7×** |
| `vortice-vort-e-atex` | çap | 250 | 250–630 | 2,5× |
| `avens-plug-fanlar` | çap | 315 | 315–630 | 2,0× |
| `vortice-vort-industrial-ventilation-axial` | çap | 350 | 300–600 | 2,0× |
| `vortice-vort-qbk-sal-kc-evo` | çap | 315 | 315–630 | 2,0× |

> Panoda bu sınıf **"10 aile"** diye bildirilmişti; bu cetvelin ölçütüyle bugün **6**
> çıkıyor. Fark, ölçütün farkıdır — yukarıdaki eşik ve "aralık ifadesi" kolu bilerek
> gevşektir. Sayı değişirse **ölçüt yazılı olduğu için** sebebi de bilinir.
