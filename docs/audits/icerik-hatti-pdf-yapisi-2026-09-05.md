# İçerik hattı — kaynak PDF yapısı ölçümü (REC-146 Adım 1)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** Linear REC-146, OPS yorumu 2026-09-05 12:32 + düzeltme 12:41
**Ölçüm zamanı:** 2026-09-05T13:04Z (`date -u`) · **Kapsam:** salt okuma, kod yok, prod yok, DB yazma yok
**Kaynak:** `~/venthub-pdf-ingestor/venthub/**` (74 CSV artığı emekli — ölçülmedi)
**Ölçüm aracı:** PyMuPDF 1.27.2 (betik: `pdf_yapisi_olc.py` + `tur2.py`, oturum scratchpad'i)
**Karşılaştırma tabanı:** `product_families` (40 aile) — canlı DB, salt okuma sorgusu

## KAYNAK / CETVEL

* `docs/standards/catalog-ingestion-standard.md` — PDF→CSV hattı. **İçerik/anlatım çıkarımını kapsamıyor**;
  bu ölçüm o cetvel ekinin ham maddesidir.
* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; ölçülemeyen hücreye "veri yok" yazılır.
* Systemair ölçüm raporu (DESIGN-MENU, 2026-09-05) madde 3 — kapatılamayan tek soru: *"ingestor'daki 24
  katalog PDF'i yapısal başlık taşıyor mu? ölçemedim."* Bu rapor o soruyu kapatır.
* Kararlar — Vitrin 15A: K6 (ürün sayfası anlatımı), K7 (yoksa satır yok).
* Systemair incelemesi §3.1 — altı blok: **Gövde · Çark · Motor · Koruma · Kontrol · Montaj**.

> **Not — emirdeki blok adları ile cetvel farkı:** OPS emri blokları "genel tanım · gövde/malzeme ·
> çark-motor · kontrol · montaj · aksesuar" diye saymıştı. REC-146 başlığı ve §3.1 ise
> "Gövde · Çark · Motor · Koruma · Kontrol · Montaj" diyor. **Kanonik altı = §3.1** alındı (cetvel kazanır);
> "genel tanım" ve "aksesuar" ek sütun olarak ayrıca ölçüldü, altıya dahil edilmedi.

---

## 0 · CEVAP (tek cümle)

**HAYIR — PDF'ler Systemair kalıbında yapısal başlık taşımıyor.** 24 PDF'in **hiçbiri** altı bloğun altısını
da başlık olarak taşımıyor; **"Koruma" saf başlığı 24 PDF'te sıfır kez** geçiyor. Ama **hammadde var**:
altı bloğun karşılığı, başlık olarak değil **model altı teknik madde satırı** olarak duruyor — 24 PDF'in
18'inde en az bir blok, 3'ünde altısı da. Yani Adım 2 "başlık kopyala" değil, **"madde topla + Türkçeye çevir"** işidir.

---

## 1 · Evren — kaç PDF, ne kadar metin

| Ölçüm | Değer |
|---|---|
| PDF dosyası | **24** |
| Bayt olarak benzersiz | **23** — `vortice-brochure-mev.pdf` ile `vortice_vort_mono_range_new.pdf` **birebir aynı dosya** (sha256 `891cded60ba4dc05…`) |
| Toplam sayfa | **1201** (ort. 50, en küçük 1, en büyük 168) |
| Metin çıkarılabilir | **24 / 24** — hiçbir PDF OCR gerektirmiyor (en düşük yoğunluk 272 karakter/sayfa) |
| Görsel-only sayfa (< 20 karakter) | **20 / 1201** (%1,7) |
| Metin tablosu (fitz `find_tables`) | **1424** — teknik tablolar görsel değil, **metin**; makine okuyabilir |
| Dil | **EN 22 · TR 1 · veri yok 1** (`vortice-bravo-s.pdf`, 1 sayfa, 272 karakter — dil kararı için eşiğin altında) |

**Marka dağılımı: 23 Vortice + 1 AVenS fiyat listesi. SEAT, Nicotra Gebhardt ve Danfoss için marka kataloğu SIFIR.**

---

## 2 · PDF × yapı tablosu (24/24, her hücre ölçülmüş)

`saf başlık` = satırın tamamı blok adından ibaret (Systemair kalıbı: "Casing", "IMPELLER", "MOTOR").
`gövde` = blok anahtar kelimesi metnin herhangi bir yerinde — **zayıf gösterge**, ayırt etmez (aşağıda §3).

| PDF | Marka | Kaynak klasörü | Sayfa | Krkt/sayfa | Görsel-only | Metin tablosu | Dil | Saf başlık (6) | Gövde (6) | Çıkarım |
|---|---|---|---|---|---|---|---|---|---|---|
| 2022-11-en-ca-rm-es-radon.pdf | Vortice | radon-range | 42 | 490 | 0 | 17 | en | 0/6 (yok) | 5/6 | metin |
| Air_Conditioning_Air_Door_2.pdf | Vortice | hava-perdesi | 8 | 990 | 1 | 3 | en | 1/6 (Montaj:1) | 4/6 | metin |
| avens_fiyat_listesi_2026_HQ.pdf | AVenS (fiyat listesi) | avensair-fiyat-listesi-2026 | 74 | 1502 | 1 | 148 | tr | 2/6 (Govde:2, Motor:6) | 6/6 | metin |
| Commercial_Ventilation_in_Line_1.pdf | Vortice | vort-commercial-in-line | 88 | 1352 | 1 | 163 | en | 1/6 (Montaj:1) | 6/6 | metin |
| Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf | Vortice | deumido-range | 12 | 610 | 0 | 4 | en | 0/6 (yok) | 2/6 | metin |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | Vortice | vort-commercial-in-line | 84 | 1348 | 1 | 52 | en | 1/6 (Kontrol:11) | 6/6 | metin |
| Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf | Vortice | marka geneli | 24 | 1384 | 0 | 3 | en | 1/6 (Motor:2) | 6/6 | metin |
| Doc_Pubblicita_Residential_ventilation_Punto_Evo_Flexo_2.pdf | Vortice | punto-evo-flexo | 8 | 762 | 0 | 8 | en | 1/6 (Montaj:1) | 5/6 | metin |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | Vortice | isi-geri-kazanim | 80 | 1233 | 1 | 69 | en | 2/6 (Govde:1, Kontrol:4) | 6/6 | metin |
| Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_4.pdf | Vortice | vort-quadro-evo | 20 | 1015 | 0 | 5 | en | 1/6 (Govde:2) | 6/6 | metin |
| E_ATEX_Range_yeni_2025.pdf | Vortice | vort-e-atex | 16 | 977 | 3 | 14 | en | 0/6 (yok) | 6/6 | metin |
| heat-master-slimroof-cati-fanlari-yeni.pdf | Vortice | vort-heatmaster-slimroof | 44 | 1160 | 2 | 74 | en | 2/6 (Cark:3, Motor:2) | 6/6 | metin |
| industrial_Ventilation.pdf | Vortice | vort-industrial-ventilation | 168 | 1329 | 0 | 124 | en | 3/6 (Cark:10, Kontrol:16, Motor:4) | 6/6 | metin |
| LINEO_QUITE_KATALOG.pdf | Vortice | lineo-quiet | 40 | 999 | 6 | 22 | en | 1/6 (Cark:2) | 6/6 | metin |
| nordik-hvls-industrial-ceiling-fans-181471.pdf | Vortice | vort-nordik-hvls | 24 | 1031 | 0 | 6 | en | 3/6 (Cark:2, Montaj:1, Motor:1) | 6/6 | metin |
| nrg-range-175696-isi-geri-kazanim.pdf | Vortice | isi-geri-kazanim | 32 | 1802 | 1 | 22 | en | 1/6 (Kontrol:3) | 6/6 | metin |
| qbk-sal-kc-evo-en-yeni-2025.pdf | Vortice | vort-qbk-sal-kc-evo | 20 | 991 | 1 | 21 | en | 1/6 (Motor:1) | 6/6 | metin |
| ResidentialVentilation.pdf | Vortice | marka geneli | 168 | 1151 | 1 | 299 | en | 1/6 (Govde:1) | 6/6 | metin |
| vort-hr-w-all-100-df.pdf | Vortice | isi-geri-kazanim | 16 | 910 | 0 | 13 | en | 0/6 (yok) | 5/6 | metin |
| vortice-bravo-s.pdf | Vortice | vortice-bravo-s | 1 | 272 | 0 | 0 | veri yok | 0/6 (yok) | 0/6 | metin |
| vortice-brochure-mev.pdf | Vortice | isi-geri-kazanim | 30 | 1022 | 0 | 11 | en | 1/6 (Govde:1) | 5/6 | metin |
| vortice-brochure-radon-en.pdf | Vortice | marka geneli | 164 | 1274 | 0 | 330 | en | 2/6 (Govde:4, Montaj:1) | 6/6 | metin |
| vortice_vort_mono_range_new.pdf | Vortice | vort-mono | 30 | 1022 | 0 | 11 | en | 1/6 (Govde:1) | 5/6 | metin |
| Why-Ventilate-Brochure.pdf | Vortice | marka geneli | 8 | 847 | 1 | 5 | en | 1/6 (Govde:1) | 4/6 | metin |
---

## 3 · Asıl soru: yapısal başlık var mı? — üç farklı ölçüt, üç farklı cevap

Bu bölüm raporun çekirdeği. **Aynı PDF'e üç ölçüt uygulandı ve üçü zıt cevap veriyor** — hangi ölçütün
seçildiği, Adım 2'nin ne iş olduğunu değiştiriyor.

### Ölçüt A — anahtar kelime metinde geçiyor mu (ZAYIF, ayırt etmiyor)

| Sonuç | Değer |
|---|---|
| 6/6 blok "geçiyor" çıkan PDF | **15 / 24** |

**Bu ölçüt kullanılamaz.** "Motor" kelimesi bir fiyat tablosunun sütun başlığında da geçer. Ölçüt
ayırt etmiyor: neredeyse her katalog 6/6 veriyor, hâlbuki hiçbirinde Systemair'ın anlatımı yok.
Design'ın ölçüm raporundaki "5 örnekte Çark 0, Koruma 0" satırı da aynı sınıf ölçüttü — orada
*yokluk* gösterdiği için doğru sonuç vermişti; burada *varlık* iddiası için geçersiz.

### Ölçüt B — Systemair kalıbı SAF BAŞLIK (satır = blok adı, punto/kalınlık ile başlık)

| Blok | 24 PDF'te toplam saf başlık |
|---|---|
| Kontrol | 34 |
| Çark | 17 |
| Motor | 16 |
| Gövde | 13 |
| Montaj | 5 |
| **Koruma** | **0** |

| Sonuç | Değer |
|---|---|
| En az 1 saf başlık taşıyan PDF | 19 / 24 |
| **6/6 saf başlık taşıyan PDF** | **0 / 24** |
| En yükseği | `industrial_Ventilation.pdf` — **3/6** (Çark, Kontrol, Motor) |

**Üstelik bu 85 başlığın çoğu anlatım başlığı bile değil.** Başlık metinleri okundu (sayım değil, kanıt):

* "Kontrol" saf başlıklarının büyük kısmı **aksesuar ürün adı**: `CONTROLLERS` (27), `REGULATORS` (12),
  `C 1.5 Electronic speed controller 1.5 A` (16) — yani aksesuar kataloğu bölüm başlığı, fanın kontrol anlatımı değil.
* "Koruma" hiç saf başlık vermiyor; onun yerine **spec satırı** olarak var: `Insulation class: II` (29),
  `Protection rating: IPX4.` (18), `Protection rating: IP44.` (6).
* Gerçek anlatım başlığına en yakın olanlar: `Casing` (6), `CASINGS` (3), `IMPELLER` (7), `MOTOR` (10),
  `BLADES` (4), `INSTALLATION` (3), ve TR tarafta `GÖVDE` (2).

**Hüküm: Systemair'ın "sabit sıra, altı başlık" kalıbı bu 24 PDF'te YOK.**

### Ölçüt C — SPEC-MADDE (model altı teknik madde satırı) — **hammadde burada**

| Kaç blokta madde bulundu | PDF sayısı |
|---|---|
| 6/6 | **3** |
| 5/6 | 2 |
| 4/6 | 3 |
| 3/6 | 4 |
| 2/6 | 2 |
| 1/6 | 4 |
| 0/6 | 6 |

Örnek satırlar (ham, PDF'ten birebir): `Backward curved centrifugal impellers.` ·
`Ball bearing motor.` · `Insulation class: II` · `Protection rating: IPX4.` ·
`Mounting brackets made of galvanized steel included.` · `Impact-resistant ABS enclosures with anti-UV treatment.`

**Bu, altı bloğa doğrudan oturan cümle malzemesidir** — ama İngilizce, model düzeyinde ve dağınık.

---

## 4 · ⭐ Beklenmedik bulgu: TÜRKÇE anlatım AVenS fiyat listesinde duruyor

Emir "24 katalog PDF" diyordu; fiyat listesi de o 24'ün içinde. Ölçünce çıkan:
**`avens_fiyat_listesi_2026_HQ.pdf` (74 sayfa, TR) tek Türkçe kaynak ve 15A'nın istediği kalıbın TAM karşılığını taşıyor.**

Sayfa 41'den birebir:

```
SEAT SERİSİ
KİMYASALLARA VE AŞINDIRICI GAZLARA KARŞI DAYANIKLI SANTRİFÜJ FANLAR
-  Polipropilen gövde yapısı, asitlere ve korozyona karşı üstün dayanım
   sağlayarak maksimum koruma sunar.
-  Geniş performans aralığı sayesinde 40–2000 Pa statik basınç ve
   50–15.000 m³/h debi değerlerinde verimli çalışma sağlar
```

Bu, 15A'nın istediği **kimlik cümlesi + kalın madde** yapısının kendisi — ve *Gövde* + *Koruma* bloklarının
Türkçe hammaddesi aynı cümlede.

| Ölçüm (fiyat listesi içi) | Değer |
|---|---|
| Anlatım maddesi taşıyan sayfa | **8 / 74** |
| Bunlardan içindekiler tablosu (anlatım değil) | 2 (sayfa 4–5, 53 madde) |
| **Gerçek anlatım maddesi** | **13 madde / 6 sayfa** (s. 39, 40, 41, 42, 43, 45) |
| Kapsadığı aileler | CMS ATEX, Torrette TR-A, **SEAT Serisi**, **STORM Serisi**, **JET Serisi**, STORM/JET ATEX |

**Neden bu önemli:** 15A çizimlerinde örnek olarak kullanılan **JET ve STORM ailelerinin DB açıklaması BOŞ**
(`tr_len = 0`) ve bu iki ailenin **marka kataloğu PDF'i YOK**. Türkçe anlatımları tek yerde duruyor: bu fiyat listesi.

---

## 5 · Aile × kaynak eşlemesi — 40 ailenin kaçının kaynağı var

İki bağımsız ölçüt kullanıldı; **klasör eşlemesi** esas alındı (ingestor'un kendi dosya yerleşimi),
seri-kodu taraması yalnız çapraz kontrol.

| Sonuç | Değer |
|---|---|
| Kendi kaynak klasörü + marka kataloğu olan aile | **19 / 40** |
| Kaynak klasörü olmayan aile | **21 / 40** |

**Kaynağı olan 19 ailenin tamamı Vortice.**

**Kaynağı olmayan 21 aile:**

| Marka | Aile sayısı | Durum |
|---|---|---|
| AVenS | 9 | Marka kataloğu yok. 2'si (BVU, BVU-LS) yalnız fiyat listesinde geçiyor; 7'sinin **hiçbir PDF kaynağı yok** |
| SEAT | 3 (JET, SEAT, STORM) | Marka kataloğu yok — **ama TR anlatımı fiyat listesi s. 41-43, 45'te var** (§4) |
| Nicotra Gebhardt | 4 (ADH, AT, DD, RDH) | Marka kataloğu yok; yalnız fiyat listesinde satır olarak geçiyor |
| Danfoss | 3 (FC 51, FC 101, FC 102) | Marka kataloğu yok; FC 51 hiçbir PDF'te geçmiyor |
| Vortice | 2 (Lineo, H AD Elektrikli) | Kendi klasörü yok; içeriği kardeş ailenin klasöründe (Lineo Quiet / hava-perdesi) — **insan kararı gerekir** |

> ⚠ **Seri kodu taraması tek başına kanıt değil — yazıya geçiriyorum.** `AT` kodu (Nicotra AT ailesi)
> 22 PDF'te "eşleşti"; hepsi İngilizce/İtalyanca *"at"* kelimesi. `JET` kodu Vortice'nin "jet fan system"
> broşüründe geçiyor, SEAT'in JET ailesiyle ilgisi yok. Bu yüzden kod eşleşmesine **marka hizası filtresi**
> uygulandı ve karar klasör eşlemesine bırakıldı. Kısa kodlu aileler (AT, AD, DD) için kod taraması kullanılamaz.

---

## 6 · Adım 2 için ne anlama geliyor (ölçümden çıkan, karar değil)

1. **"PDF'ten başlık kopyala" planı yürümez.** Altı başlık kalıbı kaynakta yok (§3-B). Taslak üretimi
   = dağınık İngilizce spec maddelerini bloklara **toplama** + **Türkçeye çevirme** işi. Emek tahmini
   bu yüzden Design'ın "240 kısa metin" tahmininden yüksek.
2. **19 aile için kaynak var, 21 aile için yok.** 21'inin 12'si (AVenS 7 + Nicotra 4 + Danfoss FC51)
   için elde hiçbir metin yok — bunlar ya üretici sitesinden toplanır ya "veri yok" kalır (K7: satır çizilmez).
3. **JET ve STORM — 15A'nın örnek aileleri — çözülebilir durumda** ve kaynağı Türkçe (§4). Öncelik sırasında
   ilk sırada olmaları hem emirle hem ölçümle uyumlu.
4. **Dil:** kaynağın 22/24'ü İngilizce. TR birinci tur demek, 22 kaynağın tamamında **çeviri** demek;
   EN ikinci tur ise kaynağa daha yakın. Sıra tercihi Adım 2 emrinin konusu.
5. **Mükerrer dosya:** `vortice-brochure-mev.pdf` = `vortice_vort_mono_range_new.pdf` (bayt-ayni).
   İki farklı ailenin klasöründe duruyor; hangisinin doğru yeri olduğu **insan kararı**, ölçümle çözülmez.
6. **OCR gerekmiyor** — 24/24 metin çıkarılabilir, tablolar metin. Bu iyi haber: hat tamamen betikle kurulabilir.

## 7 · Ölçülemeyenler (uydurulmadı)

* `vortice-bravo-s.pdf` — 1 sayfa, 272 karakter: dil tespiti eşiğin altında (**veri yok**), blok 0/6.
  Katalog değil, tek sayfalık föy olabilir; sınıflandırma yapılmadı.
* Bir PDF sayfasının **hangi aileye** ait olduğu, klasör dışında ölçülmedi. Sayfa aralığı çıkarımı
  (aile → sayfa) yalnız fiyat listesi için yapıldı; Vortice çok-aileli broşürlerde (168 sayfa) sayfa
  aralığı ayrıştırması **yapılmadı** — Adım 2'nin ilk işi olmalı.
* CSV artıkları (74 dosya) emir gereği ölçülmedi.

---

**Mekanizma durumu (şeffaflık):** gözcü YEŞİL, teslimat YEŞİL (jeton `PROB-3a79-9XUWQZ`, bildirimde görüldü
ve geri yazıldı). Cron **kurulmadı** — Recep kararı "zamanlayıcı yok"; kapı bunu kırmızı sayar, **bilinen ve
kabul edilen fark**. Uyanış ölçülemez (betiğin diskte izi yoktur).

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
