# İçerik hattı — kaynak PDF sayfa aralıkları (REC-146 Adım 1b)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS pano notu 2026-09-05 13:15Z (Adım 1b, isteğe bağlı)
**Ölçüm zamanı:** 2026-09-05 · **Kapsam:** salt okuma, kod yok, prod yok, DB yazma yok
**Kaynak:** `~/venthub-pdf-ingestor/venthub/**` · **Araç:** PyMuPDF 1.27.2 (betik, elle değil)
**Önceki adım:** `icerik-hatti-pdf-yapisi-2026-09-05.md` (Adım 1)

## KAYNAK / CETVEL

* `docs/standards/catalog-ingestion-standard.md` — PDF→CSV hattı; **sayfa aralığı çıkarımını kapsamıyor**.
* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; ölçülemeyen "veri yok" kalır.
* REC-146 KABUL şartı: *"taslakların her cümlesi kaynak PDF sayfasına referanslı"*. Adım 1 raporu bu
  şartın **sayfa aralığı ayrıştırması olmadan sağlanamayacağını** yazmıştı; bu rapor o boşluğu doldurur.

---

## 0 · CEVAP

**Bölüm sınırı YAPIDAN çıkarılabiliyor — tahmine gerek yok.** Vortice katalogları bölüm açılış sayfasında,
sayfanın en büyük puntosuyla **"&lt;SERİ ADI&gt; RANGE"** (bazen `SERIES`) yazıyor; ara sayfalar koşan başlık
(`INDUSTRIAL VENTILATION` vb.) taşıyor. Bu ayrım ölçülebilir ve keskin.

**Sonuç: 24 PDF'in 15'inde, toplam 117 bölüm, sayfa aralığıyla çıkarıldı.** Büyük çok-aileli broşürlerde
kapsama %89–98. Adım 2'nin "her cümle kaynak sayfaya referanslı" şartı artık **karşılanabilir**.

---

## 1 · Ölçütü bir kez değiştirdim — sebebi ölçüm

İlk denemem **ad listesiyle** eşleşmeydi (DB'deki ürün adlarını sayfa başlığında ara). Sonuç:
`industrial_Ventilation.pdf` 168 sayfada **yalnız 4 sayfa** eşleşti — yani ölçüt işe yaramadı.

Başlıkları **okuyunca** sebep göründü: sayfa başlıkları `VORTICEL E RANGE` gibi, ad listemdeki
`VORTICEL` ile eşleşiyordu ama ara sayfaların hepsi `INDUSTRIAL VENTILATION` koşan başlığıydı ve
ad listesi bunları elemiyordu; asıl kayıp, listede olmayan seriler (`MPC-ED`, `TORRETTE TR-E`,
`VORTICENT C E` …) yüzündendi. **Ad listesi kapalı bir küme; katalog ondan geniş.**

Yapısal ölçüte (`… RANGE`) geçince aynı PDF **4 sayfa yerine 19 bölüm / %98 kapsama** verdi.

> **Ders (kayda geçiyor):** aradığım şeyin adını biliyorsam ad listesi kurarım; **yapısını** bilirsem
> desen kurarım. Ad listesi bilmediğim seriyi göremez — ve göremediğini bana söylemez.
> Bu, Adım 1'deki "üç ölçüt üç cevap" ile aynı sınıf hata; orada yakalamıştım, burada tekrarladım.

---

## 2 · Bölüm × sayfa aralığı tablosu (15 PDF, 117 bölüm)

Ardışık aynı adlı bölümler birleştirildi (yayılım/spread başına tekrarlanan başlık tek bölümdür).

**industrial_Ventilation.pdf** — 168 sayfa · **19 bölüm** · kapsama %98

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORTICEL E RANGE | 4–13 | 10 |
| VORTICEL A-E RANGE | 14–23 | 10 |
| VORTICEL MP RANGE | 24–31 | 8 |
| VORTICEL MPC-E RANGE | 32–37 | 6 |
| VORT JET A RANGE | 38–43 | 6 |
| VORT JET A F400 RANGE | 44–49 | 6 |
| VORT JET R RANGE | 50–53 | 4 |
| VORT JET R F400 RANGE | 54–57 | 4 |
| MPC-ED RANGE | 58–63 | 6 |
| MPC-HP RANGE | 64–75 | 12 |
| MPC-ED F400 RANGE | 76–85 | 10 |
| VORTICENT C E RANGE | 86–97 | 12 |
| E-ATEX RANGE | 98–103 | 6 |
| C-ATEX RANGE | 104–109 | 6 |
| TORRETTE RF-EU RANGE | 110–119 | 10 |
| TORRETTE TR-E RANGE | 120–127 | 8 |
| TORRETTE TR-E-V RANGE | 128–135 | 8 |
| TORRETTE TR-ED RANGE | 136–145 | 10 |
| TORRETTE TR-ED-V RANGE | 146–168 | 23 |

**ResidentialVentilation.pdf** — 168 sayfa · **30 bölüm** · kapsama %97

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| PUNTO RANGE | 6–11 | 6 |
| PUNTO FILO RANGE | 12–15 | 4 |
| PUNTO FOUR RANGE | 16–19 | 4 |
| PUNTO GHOST RANGE | 20–23 | 4 |
| PUNTO EVO FLEXO RANGE | 24–27 | 4 |
| PUNTO EVO RANGE | 28–33 | 6 |
| PUNTO EVO ES RANGE | 34–37 | 4 |
| PUNTO EVO GOLD RANGE | 38–41 | 4 |
| VORTICE VARIO RANGE | 42–45 | 4 |
| VORTICE VARIO I RANGE | 46–63 | 18 |
| ARIETT RANGE | 64–67 | 4 |
| ARIETT I RANGE | 68–71 | 4 |
| ARIETT HABITAT RANGE | 72–75 | 4 |
| VORT PRESS RANGE | 76–79 | 4 |
| VORT PRESS I RANGE | 80–83 | 4 |
| VORT PRESS HABITAT RANGE | 84–87 | 4 |
| VORT QUADRO EVO RANGE | 88–95 | 8 |
| VORT QUADRO RANGE | 96–99 | 4 |
| VORT QUADRO I RANGE | 100–103 | 4 |
| VORT NOTUS RANGE | 104–107 | 4 |
| VORT PLATT RANGE | 108–111 | 4 |
| VORT PENTA RANGE | 112–115 | 4 |
| VORT LETO MEV RANGE | 116–119 | 4 |
| VORT HRW MONO RANGE | 120–129 | 10 |
| VORT PRESS EP RANGE | 130–133 | 4 |
| VORT PRESS I EP RANGE | 134–141 | 8 |
| VORT QUADRO EP AC RANGE | 142–145 | 4 |
| VORT QUADRO I EP AC RANGE | 146–149 | 4 |
| VORT PLATT EP RANGE | 150–153 | 4 |
| VORT PENTA EP RANGE | 154–168 | 15 |

**vortice-brochure-radon-en.pdf** — 164 sayfa · **14 bölüm** · kapsama %98

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORT NOTUS RANGE | 4–7 | 4 |
| VORT PLATT RANGE | 8–11 | 4 |
| VORT PENTA RANGE | 12–15 | 4 |
| VORT MONO RANGE | 16–31 | 16 |
| VORT HR NETI RANGE | 32–39 | 8 |
| VORT HR NETI IoT RANGE | 40–45 | 6 |
| VORT HR AVEL RANGE | 46–57 | 12 |
| VORT INVISIBLE MINI RANGE | 58–63 | 6 |
| VORT HRI FLAT RANGE | 64–69 | 6 |
| VORT HRI FLAT IoT RANGE | 70–75 | 6 |
| VORT PHANTOM RANGE | 76–85 | 10 |
| VORT HRI PHANTOM IoT RANGE | 86–91 | 6 |
| VORT HRI DH RANGE | 92–99 | 8 |
| VORT SANIKIT RANGE | 100–164 | 65 |

**Commercial_Ventilation_in_Line_1.pdf** — 88 sayfa · **13 bölüm** · kapsama %94

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORTICE LINEO V0 RANGE | 6–17 | 12 |
| LINEO ES RANGE | 18–23 | 6 |
| CA V0 E RANGE | 24–27 | 4 |
| CA V0 EP RANGE | 28–33 | 6 |
| CA MD and CA MD E RANGE | 34–39 | 6 |
| CA MD EP RANGE | 40–45 | 6 |
| CA ES RANGE | 46–53 | 8 |
| CA WE D E RANGE | 54–57 | 4 |
| CA WE D EP RANGE | 58–61 | 4 |
| CA MD E W RANGE | 62–65 | 4 |
| CA MD W EP RANGE | 66–71 | 6 |
| CA MD E RF RANGE | 72–75 | 4 |
| CA MD RF EP RANGE | 76–88 | 13 |

**Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf** — 84 sayfa · **15 bölüm** · kapsama %96

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| LINEO RANGE | 4–4 | 1 |
| CONSTRUCTION RANGE | 5–5 | 1 |
| LINEO V0 RANGE | 6–19 | 14 |
| LINEO V0 ES RANGE | 20–25 | 6 |
| CA V0 RANGE | 26–31 | 6 |
| CA MD RANGE | 32–39 | 8 |
| CA ES RANGE | 40–45 | 6 |
| CA WE D E RANGE | 46–49 | 4 |
| CA MD E W RANGE | 50–55 | 6 |
| CA MD E RF RANGE | 56–61 | 6 |
| CA IN-LINE RANGE | 62–62 | 1 |
| CONSTRUCTION RANGE | 63–63 | 1 |
| CA IN-LINE RANGE | 64–69 | 6 |
| CA IN-LINE QUIET RANGE | 70–75 | 6 |
| CA IN-LINE QUIET ES RANGE | 76–84 | 9 |

**Doc_Pubblicita_Residential_ventilation_vmc_1.pdf** — 80 sayfa · **8 bölüm** · kapsama %89

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORT HRW 20 MONO RANGE | 10–21 | 12 |
| VORT HRI MINI RANGE | 22–25 | 4 |
| VORT PROMETEO PLUS HR 400 RANGE | 26–43 | 18 |
| VORT HR 350 EXO RANGE | 44–49 | 6 |
| VORT HRI DH RANGE | 50–55 | 6 |
| VORT HRI PHANTOM RANGE | 56–61 | 6 |
| VORT HRI INVISIBLE-E RANGE | 62–71 | 10 |
| VORT HRI FLAT RANGE | 72–80 | 9 |

**heat-master-slimroof-cati-fanlari-yeni.pdf** — 44 sayfa · **2 bölüm** · kapsama %93

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| HEATMASTER F400 SERIES | 4–25 | 22 |
| SLIMROOF ES SERIES | 26–44 | 19 |

**2022-11-en-ca-rm-es-radon.pdf** — 42 sayfa · **1 bölüm** · kapsama %48

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| THE RADON-SPECIFIC VORTICE RANGE | 23–42 | 20 |

**LINEO_QUITE_KATALOG.pdf** — 40 sayfa · **6 bölüm** · kapsama %100

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| LINEO RANGE | 1–5 | 5 |
| LINEO QUIET RANGE | 6–11 | 6 |
| LINEO QUIET ES RANGE | 12–17 | 6 |
| LINEO QUIET RANGE | 18–23 | 6 |
| LINEO RANGE | 24–33 | 10 |
| LINEO ES RANGE | 34–40 | 7 |

**Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf** — 24 sayfa · **3 bölüm** · kapsama %38

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORT JET-A Range | 16–17 | 2 |
| VORT JET-R Range | 18–21 | 4 |
| MPC HP and MPC EC Range | 22–24 | 3 |

**Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_4.pdf** — 20 sayfa · **1 bölüm** · kapsama %100

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| VORT QUADRO EVO RANGE | 1–20 | 20 |

**E_ATEX_Range_yeni_2025.pdf** — 16 sayfa · **2 bölüm** · kapsama %88

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| E-ATEX RANGE | 3–4 | 2 |
| EXAMPLE OF E-ATEX RANGE | 5–16 | 12 |

**Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf** — 12 sayfa · **1 bölüm** · kapsama %100

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| DEUMIDO RANGE | 1–12 | 12 |

**Air_Conditioning_Air_Door_2.pdf** — 8 sayfa · **1 bölüm** · kapsama %38

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| AIR DOOR RANGE | 6–8 | 3 |

**Doc_Pubblicita_Residential_ventilation_Punto_Evo_Flexo_2.pdf** — 8 sayfa · **1 bölüm** · kapsama %25

| Bölüm (seri) | Sayfa | Kaç sayfa |
|---|---|---|
| Punto Evo Range | 7–8 | 2 |
---

## 3 · Bölüm sınırı ÇIKMAYAN 9 PDF (ölçüldü, uydurulmadı)

`Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf` · `nordik-hvls-…` ·
`qbk-sal-kc-evo-…` · `nrg-range-…` · `vort-hr-w-all-100-df.pdf` · `vortice-brochure-mev.pdf` ·
`vortice_vort_mono_range_new.pdf` · `Why-Ventilate-Brochure.pdf` · `vortice-bravo-s.pdf` ·
`avens_fiyat_listesi_2026_HQ.pdf`

Sebep tek değil ve **sınıflandırılmadı** (ölçmedim): bir kısmı zaten **tek aileli** (bölüm sınırına ihtiyaç
yok — `nordik-hvls`, `qbk-sal-kc-evo`, `deumido`), bir kısmı farklı şablon kullanıyor. **Tek aileli PDF'te
bölüm sınırının olmaması kusur değildir** — aralık = tüm belge. Ayrım Adım 2'de yapılmalı.

AVenS fiyat listesi ayrı: bölüm başlığı `RANGE` değil `… SERİSİ` kalıbında (TR). Adım 1 raporunda
anlatım sayfaları zaten tek tek verilmişti (s. 39, 40, 41, 42, 43, 45) — bu rapor onu tekrarlamıyor.

---

## 4 · Mükerrer PDF hakemliği — dosya adı içeriği yansıtmıyor

Adım 1'de bulunan bayt-aynı çift: `vortice-brochure-mev.pdf` (klasör: `isi-geri-kazanim`) =
`vortice_vort_mono_range_new.pdf` (klasör: `vort-mono`). Hangi klasörün doğru olduğunu **içerikten** ölçtüm:

| Terim | Geçiş |
|---|---|
| `MONO` | **84** |
| `VORT HR` | **67** |
| `heat recovery` | 42 |
| `VORT MONO` | 17 |
| **`MEV`** | **0** |
| `NRG` · `recuperator` · `single room` · `extract ventilation` | 0 |

**Hüküm:** dosya **iki aileyi birden** anlatıyor (VORT MONO **ve** VORT HR / ısı geri kazanım) — yani
mükerrerlik yanlış yerleştirme değil, **iki klasöre de ait olması**. Ama **dosya adı desteksiz**:
içerikte `MEV` **sıfır kez** geçiyor. `vortice-brochure-mev.pdf` adı içeriği yansıtmıyor.

**Öneri (karar değil):** dosyayı silmek yerine ad düzeltilsin; hangi kopyanın kalacağı ve adın ne olacağı
ingestor sahibinin kararı. Ölçüm ikisinin de içerikçe geçerli olduğunu söylüyor.

---

## 5 · Adım 2 için ne değişti

1. **KABUL şartı artık karşılanabilir.** 117 bölümün her biri sayfa aralığıyla adreslenebiliyor;
   "bu cümle şu PDF'in şu sayfasından" denebilir.
2. **Kaynak, DB ailelerinden İNCE.** Katalog `VORT QUADRO EVO`, `VORT QUADRO`, `VORT QUADRO I`,
   `VORT QUADRO EP AC`, `VORT QUADRO I EP AC` diye **beş ayrı bölüm** taşıyor; DB'de tek aile var
   (`Vortice VORT Quadro Evo`). Aynı şey Punto (8 bölüm), CA (13 bölüm), VORT HR (birçok) için geçerli.
   **Bölüm → aile eşlemesi bire bir değil, çoktan-bire** — ve hangi bölümün hangi aileye yazılacağı
   **insan kararı**, ölçümle çözülmez. Adım 2 emrinde bu eşleme tablosu istenmelidir.
3. **Kapsama boşluğu var ama küçük:** büyük broşürlerde %89–98. Kapsanmayan sayfalar genelde kapak,
   içindekiler, kurumsal giriş ve arka kapak — yani anlatım taşımayan sayfalar. Doğrulanmadı, **varsayım**.

## 6 · Ölçülemeyenler

* Bölüm sınırı çıkmayan 9 PDF'in **niçin** çıkmadığı sınıflandırılmadı (§3).
* Kapsanmayan sayfaların gerçekten kapak/içindekiler olduğu **doğrulanmadı** (§5.3).
* `RANGE` deseni **İngilizce** kalıba dayanıyor; İtalyanca/Almanca kataloglar gelirse desen genişletilmeli.
  Bugünkü evrende 22/24 PDF İngilizce olduğu için sorun çıkmadı.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
