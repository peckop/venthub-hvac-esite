# T162-VH — Lineo birleştirme: ölçüm, kapı onarımı ve yazım planı

> **Tarih:** 2026-08-23 · **Şerit:** URUN · **Cetvel:** `docs/standards/catalog-depth-standard.md` §K1/§K2
> **Durum:** kod hazır (bu PR) · **prod veri yazımı Recep GO'suyla, AYRI adım**
> **Not:** `T161-VH` aynı gün EDGE tarafından kullanıldı; bu iş **T162** olarak numaralandı.

## 1. Niçin — cetvelin işaret ettiği tek ihlal

T160 cetveli indiğinde katalogda §K1'i ihlal eden **tek** yapı kaldı ve tabanda gerekçesiyle
kayıtlıydı: `vortice-lineo-quiet` şemsiyesi altında **altı çap ailesi**. Cetvel §6 "cetvel
inince önerilecektir" diyordu; bu belge o öneriyi ölçümle kurar.

## 2. Ölçüm — bölünme YANLIŞ eksende yapılmış

Canlı DB (`public.product_families` + `public.products`, 2026-08-23):

| ölçüm | sonuç |
|---|---|
| şemsiye altındaki çocuk aile | **6** |
| her ailedeki ürün | **tam 2** |
| toplam ürün | **12** |
| bölünme ekseni | **çap** (100/125/150/200/250/315) |
| aile İÇİNDEKİ tek fark | **motor tipi** — AC vs EC ("ES") |

`technical_specs` üzerinden ölçülen karar ekseni:

| çap | AC | EC (ES) |
|---|---|---|
| 100 mm | 27 W · 260 m³/h · 147,1 Pa | 23 W · 300 m³/h · 243,2 Pa |
| 315 mm | 360 W · 2890 m³/h · 525,7 Pa | 220 W · 2630 m³/h · 379,5 Pa |

Küçük çapta EC hem daha az güç çeker hem daha çok debi verir; **büyük çapta yön değişir** —
%39 enerji tasarrufu, %9 debi ve %28 basınç karşılığında alınır. Bu, §K2'nin sorduğu anlamda
**paragraf yazılabilen** bir ayrımdır. Çap ise müşterinin kanalından bellidir; paragrafı
"Lineo 150, Lineo 125'ten daha büyük çaplıdır" cümlesinden ibaret olurdu — yani spec satırı.

**Sonuç:** katalog, paragraf yazılamayan eksende (çap) **sayfa açmış**, paragraf yazılabilen
ekseni (AC/EC) her ailenin **içine gömmüş**. §K2 ölçütü tam tersini söyler.

## 3. Kapı onarımı — kural, kendisini uygulayan işi kırmızıya düşürmemeli

`family-empty` ve `family-nested` kuralları `product_families.deleted_at` süzgeci
taşımıyordu. Kusur bu işten **bağımsız** ve ölçüldü: okuma katmanı silinmiş aileyi zaten
görmüyor (`src/lib/services/family.service.ts` — dört ayrı sorguda `deleted_at is null`),
kapı görüyordu. Yani vitrinde **adresi olmayan** bir satır, kapıda "canlı adres üretiyor"
diye raporlanabilirdi; iki katman aynı soruya farklı cevap veriyordu.

**Bugünkü etkisi ölçüldü ve SIFIRDIR** — canlı DB'de silinmiş aile sayısı 0. Değişiklik
davranış değiştirmez; koruma ileri dönüktür.

Bekçi: `catalog-integrity-gate.test.ts` — iki test, biri **pozitif kontrol** (okuyucu
bilinmeyen kuralda patlamalı, süzgeci olmayan kuralı süzgeçli göstermemeli).
Sabotaj üç yönde koşuldu, **üçü de kırmızı**: (a) `family-empty` süzgecini kaldır,
(b) `family-nested` süzgecini kaldır, (c) süzgeci ilgisiz bir kurala da ekleyerek pozitif
kontrolü körleştir.

## 4. Geri alma yolunun kuru koşumu

Bölünmeyi **`scripts/db/product-data/t138-model-split.mjs`** yapmıştı ve kendi `--rollback`
yolu var; birleştirme tam olarak o yoldur. Ama o yolun **kuru koşumu yoktu**: ileri yön
(`--apply`) varsayılan olarak kuru koşarken, **kalıcı silme yapan** geri yön doğrudan
yazıyordu — betiğin en tehlikeli yolu, en az provası olan yoldu. Bu PR `--dry-run` ekler ve
kuru koşum "kaç satır etkilenirdi"i **DB'ye sorarak** sayar (niyet değil, gerçek).

**Envanter elden kuruldu** (T138 koşumunun envanteri diske yazılmış, depoya girmemiş) ve
koşumdan önce DB'ye karşı doğrulandı: ürün id kümesi 12/12, aile id kümesi 6/6, hedef aile
tekil. Kuru koşum: `PATCH products → 12/12`, `DELETE product_families → 6/6`.

## 5. Yönlendirme — ölçülerek gerekli bulundu

Ürün slug'ları model kodu taşıyor (`vortice-lineo-100-quiet-17160`) ve aile slug'ından
**farklı**. Bu yüzden:

- **12 ürün adresi** kendiliğinden çalışmaya devam eder — `resolveProductRoute` 3. adımı
  varyant slug'ını kanonik aile adresine `?sku=` ile taşır.
- **6 aile adresi** ise hiçbir şeye düşmez → yönlendirme olmadan **404**. Altısı da
  sitemap'te duruyor.

`next.config.mjs`'e altı kalıcı yönlendirme eklendi (`/:lang(tr|en)/products/vortice-lineo-<çap>-quiet`
→ `/:lang/products/vortice-lineo-quiet`).

**Sıra kasıtlı:** önce kod (yönlendirme dahil) iner, sonra veri yazılır. Ters sıra, dağıtım
penceresi boyunca altı adresi 404'e düşürürdü; bu sırada en kötü ihtimalle sayfa "aynı yerde
kalır" — kırık değil, atıl.

## 6. Bu PR'da OLMAYAN (Recep kapısı)

Prod veri yazımının kendisi: 12 ürünün `family_id`'si şemsiyeye döner, 6 çap ailesi silinir.
Komut ve envanter hazır, kuru koşumu yapıldı; **yazım ayrı ve açık GO ile**.

## 7. İlgili

- `docs/standards/catalog-depth-standard.md` — K1 derinlik, K2 yazılabilirlik ölçütü
- `scripts/db/checks/catalog-integrity.mjs` — `family-nested`, `family-empty`
- `scripts/db/product-data/t138-model-split.mjs` — bölünme + geri alma
- `docs/plans/t138-model-katmani-plani-2026-08-21.md` — bölünmenin özgün planı
