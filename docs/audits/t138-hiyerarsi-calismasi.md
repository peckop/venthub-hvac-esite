# T138 — Ürün Hiyerarşisi Çalışması: Kategori › Seri › Aile › Model › Varyant (2026-08-21)

> Şerit: **ÜRÜN · T138-VH** · Cetvel: product-schema-standard (Split-Model: `product_families` =
> kart, `products` = varyant/SKU + `technical_specs`), category-taxonomy-standard.
> Recep talebi: "kategori çatısı altında nasıl görünecek — birkaç anlaşılır ürünle; tüm detay değil."
> **Veri yazımı YOK, kod YOK — yalnız ölçüm ve üç seçeneğin yan yana görünümü.**

## Sözlük (tek cümle)

- **KATEGORİ:** vitrin menüsü (`categories`, 31 kayıt, 2 seviye). Örn. *Residential Ventilation › Banyo ve Tuvalet Fanları*.
- **SERİ:** üreticinin ürün hattı (Lineo Quiet, JET, AT, FC102). Bugün `product_families.series_code`.
- **AİLE = KART:** `product_families` satırı → vitrinde 1 kart, 1 sayfa (`/tr/products/<aile-slug>`).
- **MODEL:** seri içindeki boy/ölçü (Lineo **100** Quiet, JET **20**, AT **10/10**, FC102P**4K0**). Bugün ayrı kayıt DEĞİL — addan çıkar.
- **VARYANT = SKU:** `products` satırı (faz/hız/ES/ATEX…); seçici `?sku=` ile sayfa içinde seçer.

## Üç seçenek (kural tek cümle)

| | Kural | Kart sayısı (toplam) | Kartta kalan seçici eksenleri |
|---|---|---|---|
| **MEVCUT** | marka başına elle girilmiş; Vortice/Nicotra/Danfoss seri düzeyi, **SEAT 3 seri tek ailede**, AVenS kategori-gibi | **32** | tutarsız (SEAT'te 81 SKU tek kartta) |
| **A — Seri = Aile** | her seri 1 kart; model+varyant kart içinde kademeli seçilir | **~36** (SEAT 1→3; AVenS yerleşim düzeltmesi; diğerleri aynı) | model (boy) → varyant (faz/hız/ES/ATEX) |
| **B — Model = Aile** | her boy 1 kart; kartta yalnız varyant seçilir | **~222** (Vortice 19→**114**, SEAT 1→14, Nicotra 4→35, Danfoss 2→34, AVenS ~6→~25) | yalnız varyant |

B'nin Vortice sayımı ölçüldü: 19 ailenin model kırılımı 3/7/4/6/2/5/3/12/5/9/10/7/16/1/3/5/7/5/4 = **114**
(kural: addaki ilk boy/ölçü token'ına kadar = model). Nicotra ve Danfoss'ta model = SKU olduğundan B'de
her ürün kendi kartı olur (AT 8 kart, FC102 17 kart).

---

## Vortice — örnek 1: Lineo Quiet (12 SKU) · KAT: Residential Ventilation › Kanal İçi Hayalet Fanlar

```
MEVCUT = A   Kanal İçi Hayalet Fanlar
             └─ [KART] Lineo Quiet ........................ /tr/products/vortice-lineo-quiet
                  ├─ Lineo 100  ─┬─ Lineo 100 Quiet        ?sku=VRT-17160
                  │              └─ Lineo 100 Quiet ES
                  ├─ Lineo 125  ─┬─ …  / … ES
                  ├─ Lineo 150, 200, 250, 315 (her biri ×2: standart / ES)
             Seçici: BOY (100…315) → TİP (standart / ES)            → 1 kart, 6×2 matris

B            Kanal İçi Hayalet Fanlar
             ├─ [KART] Lineo 100 Quiet  ─ standart / ES            /tr/products/vortice-lineo-100-quiet
             ├─ [KART] Lineo 125 Quiet  ─ standart / ES
             ├─ … 150 · 200 · 250 · 315                              → 6 kart, her kartta 2 seçenek
```

## Vortice — örnek 2: Vort Quadro Evo (23 SKU) · KAT: Residential Ventilation › Banyo ve Tuvalet Fanları

```
MEVCUT = A   Banyo ve Tuvalet Fanları
             └─ [KART] Vort Quadro Evo .................... /tr/products/vortice-vort-quadro-evo
                  ├─ QE 60        ─ LL · LL T · LL T PIR · LL TP · LL TP HCS     (5)
                  ├─ QE 60/35     ─ (5)
                  ├─ QE 100       ─ (5)
                  ├─ QE 100/60    ─ (5)
                  └─ QE 100/60/35 ─ LL · LL TP · LL TP HCS                       (3)
             Seçici: MODEL (5 boy) → DONANIM (zamanlayıcı/PIR/nem)   → 1 kart

B            ├─ [KART] Quadro Evo QE 60 · QE 60/35 · QE 100 · QE 100/60 · QE 100/60/35 → 5 kart, 3-5 seçenek
```

**Vortice cevabı:** A'da Vortice **DEĞİŞMEZ** (19 aile zaten seri düzeyi). B'de **19 → 114 kart**.

---

## SEAT — örnek: JET 20 ve STORM 10 · KAT: Industrial Ventilation › Asit Dayanımlı Fanlar

```
MEVCUT      Asit Dayanımlı Fanlar
            └─ [KART] "SEAT Storm Jet Asit Dayanımlı Fanlar" ... /tr/products/seat-storm-jet
                 └─ 81 SKU tek listede: JET 20 ×5 + JET 20 ATEX ×3 + … STORM 10 ×7 + …   ← TANECİK HATASI
            Seçici: 81 seçenekli düz liste; üç seri birbirine karışık

A           Asit Dayanımlı Fanlar
            ├─ [KART] JET   (21) ─ JET 20 (9) · JET 25 (8) · JET 30 (4)      /tr/products/seat-jet
            ├─ [KART] SEAT  (40) ─ SEAT 15 · 20 · 25 · 30 · 35 · 50           /tr/products/seat-seat
            └─ [KART] STORM (20) ─ STORM 10 (7) · 12 · 14 · 16 · 18           /tr/products/seat-storm
            Seçici: BOY → ELEKTRİK (voltaj/devir/güç) → ATEX/XRM             → 3 kart

B           ├─ [KART] JET 20 (9) · JET 25 · JET 30 · SEAT 15 … STORM 18        → 14 kart
            Seçici: ELEKTRİK → ATEX
```

**⚠ Yan bulgu (T139 seçiciyi etkiler):** "JET 20" adlı **5 ayrı SKU** var (SEA-71201000 / 71202000 /
71202010 / 71203000 / 71203001 / 71203010…) — farkları **adda değil**, `technical_specs`'te
(voltage_v / rpm_max / max_absorbed_power_w). Hangi seçenek seçilirse seçilsin, SEAT'te seçici
eksenleri spec'ten türetilmek zorunda; ad tek başına yetmez. SEAT'te `model_code` da YOK.

---

## Nicotra Gebhardt — örnek: AT serisi (8 SKU) · KAT: Industrial Ventilation › Santrifüj | Radyal Fanlar

```
MEVCUT = A   └─ [KART] AT ─ AT 7/7 · 9/7 · 9/9 · 10/8 · 10/10 · 12/9 · 15/15 · 18/13   /tr/products/nicotra-gebhardt-at
             Seçici: BOY (8)                                             → 1 kart (ADH, DD, RDH de birer kart = 4)
B            └─ [KART] AT 7/7 · [KART] AT 9/7 · …                         → 8 kart, kartta seçenek YOK (model = SKU)
```

## Danfoss — örnek: FC102 (17 SKU) · KAT: Accessories and Components › Frekans Konvertörleri

```
MEVCUT = A   └─ [KART] VLT HVAC Drive FC102 ─ 1,1 · 1,5 · 2,2 · 3 · 4 · 5,5 · 7,5 · 11 … 90 kW   /tr/products/danfoss-fc102
             Seçici: GÜÇ (kW, 17)                                        → 1 kart (FC101 ile 2)
B            └─ 17 kart, kartta seçenek YOK
```

## AVenS — örnek: ısıtıcı + hız anahtarı (YANLIŞ YERLEŞİM örneği)

```
MEVCUT      Electric Heating › Elektrikli Kanal Isıtıcıları
            └─ [KART] "avens-elektrikli-isiticilar" (14)
                 ├─ 3/6/9/12/15/18 KW ELEKTRİKLİ ISITICI      ✓ yerinde (6)
                 ├─ SULU BATARYA 7/8 KW                       ✗ ısıtıcı değil, su bataryası (2)
                 └─ AvenS 1500/2000/3000/4000/5000×2          ✗ ISI GERİ KAZANIM cihazı, burada işi yok (6)
            Industrial Ventilation › Santrifüj | Radyal Fanlar
            └─ [KART] "avens-davlumbaz-fanlar" (3)
                 ├─ AVenS 2,5 A / 5 A HIZ ANAHTARI            ✗ aksesuar (hız kontrol), fan değil
                 └─ FC-51 frekans konvertörü                  ✗ Danfoss FC-51'in AVenS kopyası (DAN-80101 ile mükerrer)

A (önerilen düzeltme)
            Electric Heating › Elektrikli Kanal Isıtıcıları
            └─ [KART] Elektrikli Kanal Isıtıcı ─ 3 · 6 · 9 · 12 · 15 · 18 KW      (seçici: GÜÇ)
            Electric Heating › (Sulu Kanal Isıtıcıları — kategori yok, açılır mı? → tek soru)
            └─ [KART] Sulu Batarya ─ 7 · 8 KW
            VMC & Heat Recovery
            └─ [KART] AvenS Isı Geri Kazanım ─ 750 · 1000 · 1500 · 2000 · 3000 · 4000 · 5000  (mevcut 'avens-isi-geri-kazanim' ile BİRLEŞİR)
            Accessories and Components › Hız Kontrol
            └─ [KART] Hız Anahtarı ─ 2,5 A · 5 A
            FC-51 → Danfoss FC-51 kaydıyla mükerrer; biri kapanmalı (PRICING/veri-kimlik, ayrı karar)
```

AVenS'te sorun tanecik değil **yerleşim**: A kuralı uygulanınca ~6 aile → ~8 aile olur ve her biri
doğru kategoriye gider. Bu kısım T138'in ikinci adımı (Recep kararı + veri yazımı kapısı).

---

## Özet — Recep'in göreceği fark (kart sayısı)

| Marka | MEVCUT | A (seri) | B (model) |
|---|---|---|---|
| Vortice | 19 | **19** (değişmez) | 114 |
| SEAT | 1 | **3** | 14 |
| Nicotra | 4 | **4** | 35 |
| Danfoss | 2 | **2** | 34 |
| AVenS | 6 (yanlış yerleşimli) | **~8** (yerleşim düzeltilmiş) | ~25 |
| **Toplam** | 32 | **~36** | **~222** |

**Tek gerekçeli öneri: A.** Dört markada zaten yaşayan kural; SEAT'i 3 karta böler, AVenS'i doğru
kategorilere yerleştirir, kod değişmez (kart sayısı = aile kaydı sayısı), seçici eksenleri (boy → elektrik
→ ATEX) T139 kademeli seçicinin işi olur. B, Vortice'yi 114 karta böler ve Nicotra/Danfoss'ta "tek
seçenekli kart" üretir.

## Bu çalışmanın dokunmadıkları
Veri yazımı (aile ekleme/taşıma), slug/308 yönlendirme davranışı, kategori ağacına yeni dal (Sulu
Isıtıcı / Hız Kontrol) — hepsi karar sonrası plan + Recep kapısı.
