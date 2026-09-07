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

## 5. Ölçülen borç — ⭐**SIFIR** (2026-09-06 16:00, paket damgası `09:45:48Z`)

Sabah ölçülen **6 aile-eksen çifti**nin **altısı da kapandı.** URUN-KATALOG 38 ailenin TR
metnini yeniden yazıp prod'a uyguladı (REC-146 / K7.8); paket o yazımdan **sonra** yeniden
üretildi ve `DONMUS_BORC` listesi **boşaltıldı** (tek yönlü mandal, yalnız küçülür).

| Aile (sabah borçtaydı) | Eksen | Sabah | Nasıl kapandı |
|---|---|---|---|
| `vortice-vort-heatmaster-slimroof-roof` | debi | 460 / 460–18.600 (**40,4×**) | yeni metinde **hiç rakam yok** |
| `vortice-vort-heatmaster-slimroof-smoke` | debi | 2580 / 2.580–22.550 (8,7×) | yeni metinde **hiç rakam yok** |
| `avens-plug-fanlar` | çap | 315 / 315–630 | yeni metinde **hiç rakam yok** |
| `vortice-vort-industrial-ventilation-axial` | çap | 350 / 300–600 | yeni metinde **hiç rakam yok** |
| `vortice-vort-e-atex` | çap | 250 / 250–630 | metin o eksende **sayı vermiyor** (mm geçmiyor) |
| `vortice-vort-qbk-sal-kc-evo` | çap | 315 / 315–630 | metin o eksende **sayı vermiyor** |

İki meşru yol da §2'de yazılıdır: ya **aralık** yazarsın, ya **o sayıyı hiç vermezsin.**
Katalog ikincisini seçti. Dört ailenin metin uzunluğu 150–318 karakter, yani **boşaltılmadı**,
yalnızca sayısızlaştırıldı — DB'den ayrıca doğrulandı.

---

## 5.1 ⛔Kapının SESSİZ bir kusuru vardı — sabotajla bulundu, düzeltildi

Borcun kapandığını ilan etmeden önce kapıya **sahte bir ihlal** verdim:
*"Sabotaj **ailesi**: 200 mm nominal çaplı fan."* — açık bir ihlal. **Kapı yeşil kaldı.**

Sebep: `ARALIK_IFADESI` deseni `ile` ve `kadar`ı **kelime içinde** de eşleştiriyordu.
Türkçede bu felakettir — `ailesi`, `abilen`, `edilebilen`, `ileri`, `vesile` hepsi `ile`
içerir. Aile "aralık yazmış" sayılıp muaf tutuluyor, yani **hiç ölçülmüyordu.**

**Ölçüm (13 ailelik paket):** eski desen **8** aileyi muaf sayıyordu, doğrusu **4**.
Evrenin **%31'i sessizce atlanıyordu** — ve atlananların ikisi (`vort-e-atex`,
`qbk-sal-kc-evo`) tam da bu kapının izlediği **borç kalemleriydi**. Yani kapı onları
"düzeldi" diye değil, **"bakmadım"** diye temiz gösteriyor olabilirdi.

Düzeltme: kelime sınırı (`\bile\b`, `\bkadar\b`, `\baras[ıi]`). Düzeltmeden **sonra** da
canlı pakette ihlal **0** — yani borcun kapandığı, artık **keskin** bir ölçütle doğrulandı.
Kalıcı bekçi eklendi: *"MUAFİYET KELİME İÇİNDE TETİKLENEMEZ"* kolu, dört kelime-içi vakayı
ve dört gerçek aralık ifadesini **iki yönlü** sınar.

⭐**Ders (bugün filoda sekizinci kez):** **alt-dize eşleşmesi ölçüm değildir.**
Aynı sınıfın kardeşi: `returns.created`ın `returns.createdToast` içinde eşleşmesi.

---

## 5.2 Borç bittiğinde ayırt edicilik kanıtı da bitmesin

`DONMUS_BORC` boşalınca kapının *"0 ihlal"* demesi anlamsızlaşabilirdi — ölçüt kör olsa da
aynı şeyi derdi. Bu yüzden kapanan iki saha vakasının **eski metinleri** kapıya kalıcı
**sınav** olarak taşındı (*"ÖLÇÜT HÂLÂ GÖRÜYOR"* kolu). Gerçek kusur listeden çıktı, sınav
olarak kaldı. Sabotajla doğrulandı: eşik 2'den 100'e çekilince kol *"ÖLÇÜT KÖRLEŞTİ"* diye
vaka adıyla düşüyor.

> Panoda bu sınıf **"10 aile"** diye bildirilmişti; sabah bu cetvelin ölçütüyle **6**
> çıkmıştı. Fark, ölçütün farkıdır — eşik ve "aralık ifadesi" kolu bilerek gevşektir.
> Sayı değişirse **ölçüt yazılı olduğu için** sebebi de bilinir.
