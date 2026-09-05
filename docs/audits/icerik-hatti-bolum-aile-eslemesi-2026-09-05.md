# İçerik hattı — bölüm → aile eşleme tablosu (REC-146 Adım 2a·1)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS, REC-146 yorumu 2026-09-05 13:57Z (Adım 2a)
**Kapsam:** salt okuma + belge · kod yok · prod yok · **DB'ye yazma YOK**
**Girdi:** `icerik-hatti-sayfa-araliklari-2026-09-05.md` (117 bölüm) + canlı DB `products` model adları
**Araç:** betik (`esleme.py`), elle sayım yok

## KAYNAK / CETVEL

* `docs/standards/catalog-ingestion-standard.md` · `docs/standards/vaat-butunlugu-standard.md` (uydurma yok)
* Kararlar — Vitrin 15A **K7** (kaynağı olmayan bölüm çizilmez)
* Adım 1b bulgusu: *"bölüm → aile eşlemesi çoktan-bire ve insan kararı; emirde istenmezse taslak üreten
  ajan kendi uydurur."* Bu tablo o boşluğu kapatır.

---

## 0 · Eşleme ÖLÇÜTÜ — niçin bu, niçin başkası değil

Bölüm adına bakarak "bu Quadro, şu aile Quadro Evo, olur" demek **ad benzerliğidir ve yanıltır**:
katalogda `VORT QUADRO`, `VORT QUADRO I`, `VORT QUADRO EVO`, `VORT QUADRO EP AC`, `VORT QUADRO I EP AC`
diye beş ayrı bölüm var ve bizde bunlardan **yalnız biri** satılıyor.

Kullanılan ölçüt: **bölüm adı, o ailenin DB'deki GERÇEK ürün model kodlarıyla örtüşüyor mu.**
`Vortice Vort Quadro Evo QE 100 LL` gibi 23 model `VORT QUADRO EVO RANGE` bölümüne oturuyor; `VORT QUADRO I`
bölümüne oturan **tek bir modelimiz yok**. Ölçüt satmadığımız ürünü ayıklıyor, bu yüzden ayırt edici.

Üç sonuç: **ESLESTI** (model kodları örtüşüyor) · **AILE YOK** (o bölümün ürünü bizde satılmıyor) ·
**INSAN** (örtüşme kısmi, ya da tek bölüm iki aileye düşüyor — ölçümle çözülmez).

---

## 1 · Sonuç sayıları

| | Bölüm |
|---|---|
| **ESLESTI** — model kodu örtüşüyor | **27** |
| **AILE YOK** — bölümün ürünü bizde yok | **81** |
| **INSAN** — karar gerekiyor | **9** |
| kural yazılmayan | **0** |
| **Toplam** | **117** |

**Aile tarafından bakınca:** 117 bölüm **12 aileye** kesin bağlandı. Bunların 11'i Adım 1'deki
"kaynak klasörü olan 19 aile" içinde; **1 tanesi yeni**.

> **Kendi önceki sayımı düzeltiyorum:** Adım 1'de `Vortice Lineo Kanal Fanları`'nı *"kendi klasörü yok,
> insan kararı gerekir"* diye **21 kaynaksız aile** listesine koymuştum. Bölüm ölçümü bunu çözdü:
> `LINEO RANGE` / `LINEO V0 RANGE` **ayrı bölümler** ve DB'deki `Lineo 100…315` (7 model) tam oturuyor.
> **Lineo artık kaynaklı. Kaynaksız aile 21 → 20.**

### 19 kaynak-klasörlü ailenin bölüm durumu

| Durum | Adet | Aileler |
|---|---|---|
| Kesin bölümü var | **11** | deumido · isi-geri-kazanim · lineo-quiet · punto-evo-flexo · commercial-in-line-circular · vort-e-atex · slimroof-roof · heatmaster-smoke · industrial-axial · vort-mono · quadro-evo |
| İnsan kararıyla bağlanabilir | **4** | hava-perdesi · radon-circular · radon-roof · commercial-in-line-rectangular |
| **Hiç bölüm çıkmadı** | **4** | industrial-ventilation-roof (TIRACAMINO) · nordik-hvls · qbk-sal-kc-evo · bravo-s |

**"Hiç bölüm çıkmadı" kusur değil, iki farklı şey:** `nordik-hvls`, `qbk-sal-kc-evo` ve `bravo-s`
**tek aileli PDF'ler** — bölüm sınırına ihtiyaç yok, aralık = tüm belge. **TIRACAMINO farklı ve dikkat
ister:** kaynağı `industrial_Ventilation.pdf` klasöründe görünüyor ama o katalogda TIRACAMINO bölümü
**yok**; oradaki 5 `TORRETTE …` bölümü çatı fanı, TIRACAMINO ise şömine/baca fanı. **Klasör düzeyinde
kaynak var görünmesi, bölüm düzeyinde kaynak olduğunu göstermiyor** — TIRACAMINO fiilen kaynaksız.

---

## 2 · İnsan kararı bekleyen 9 bölüm (karar bunlara ait, gerisi mekanik)

| Bölüm | Sayfa | Önerim | Niçin karar gerekiyor |
|---|---|---|---|
| `THE RADON-SPECIFIC VORTICE RANGE` | 2022-11 radon s.23–42 | **sayfa bölünerek ikiye** | Tek bölüm iki aileyi kapsıyor: `CA-RM … ES` (kanal, 5 model) ve `CA-RM … RF ES` (çatı, 3 model). Sınırın hangi sayfada olduğu ölçülmedi |
| `AIR DOOR RANGE` | Air_Conditioning s.6–8 | **ortak metin, iki aileye** | `AD 900…2000` (ortam havalı, 4) ve `H AD 900…1500` (elektrikli ısıtmalı, 4) aynı bölümde; elektrikli/ısıtmasız ayrımı bölümde ayrıştırılmamış |
| `CA IN-LINE QUIET ES RANGE` | Doc_Pubblicita_Commercial s.76–84 | **dikdörtgen aileye** | DB'de `CA IL 4020…8060 ES RECT`; `IL`=`IN-LINE` ve `ES` örtüşüyor ama bölüm adında `RECT` **yok** — yuvarlak/dikdörtgen ayrımı doğrulanmadı |
| `PUNTO EVO RANGE` | ResidentialVentilation s.28–33 | **Punto Evo / Flexo ailesine** | Aile adı "Punto Evo / Flexo" ama DB'de yalnız **Flexo** modelleri var; düz Punto Evo satılmıyor |
| `VORT HRW 20 MONO RANGE` | vmc s.10–21 | **VORT Mono'ya, boy notuyla** | DB'de 30/40/60 var, **20 yok** — aynı seri, satmadığımız boy |
| `VORT HR NETI IoT RANGE` | radon-en s.40–45 | **VORT HR'ye** | IoT varyantı; DB'de IoT modeli yok, seri aynı |
| `VORT HRI MINI RANGE` | vmc s.22–25 | **VORT HR'ye** | DB `Vort Invisible Mini Top` ile aynı ürün mü, **doğrulanmadı** |
| `VORT HRI INVISIBLE-E RANGE` | vmc s.62–71 | **VORT HR'ye** | `-E` varyantı; aynı ürün mü **doğrulanmadı** |
| `EXAMPLE OF E-ATEX RANGE` | E_ATEX s.5–16 | **VORT-E ATEX'e** | Bölüm adı "örnek"; ayrı ürün mü, aynı serinin uygulama örneği mi ayrıştırılmadı |

**OPS/Recep kararı gereken tek ticari kalem:** satmadığımız varyantların (IoT, EP, 20 boy) metni
ailemize yazılsın mı? Yazılırsa müşteri **satmadığımız özelliği** okur. Önerim: **yazılmasın** —
vaat bütünlüğü cetveli bunu zaten yasaklıyor; taslakta o cümleler ayıklanır.

---

## 3 · Tam tablo — 117 bölüm

| PDF | Bölüm | Sayfa | Kaç | Durum | Aile | Kanıt |
|---|---|---|---|---|---|---|
| industrial_Ventilation.pdf | VORTICEL E RANGE | 4–13 | 10 | OK ESLESTI | vortice-vort-industrial-ventilation-axial | DB: E 354/404/504/604 M |
| industrial_Ventilation.pdf | VORTICEL A-E RANGE | 14–23 | 10 | OK ESLESTI | vortice-vort-industrial-ventilation-axial | DB: A-E 354/454/504/564 T |
| industrial_Ventilation.pdf | VORTICEL MP RANGE | 24–31 | 8 | OK ESLESTI | vortice-vort-industrial-ventilation-axial | DB: MP 302..604 T (8 model) |
| industrial_Ventilation.pdf | VORTICEL MPC-E RANGE | 32–37 | 6 | - AILE YOK | — | DB'de MPC modeli YOK |
| industrial_Ventilation.pdf | VORT JET A RANGE | 38–43 | 6 | - AILE YOK | — | DB'de Vortice VORT JET modeli YOK (SEAT'in JET ailesiyle ilgisiz) |
| industrial_Ventilation.pdf | VORT JET A F400 RANGE | 44–49 | 6 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | VORT JET R RANGE | 50–53 | 4 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | VORT JET R F400 RANGE | 54–57 | 4 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | MPC-ED RANGE | 58–63 | 6 | - AILE YOK | — | DB'de MPC modeli YOK |
| industrial_Ventilation.pdf | MPC-HP RANGE | 64–75 | 12 | - AILE YOK | — | DB'de MPC modeli YOK |
| industrial_Ventilation.pdf | MPC-ED F400 RANGE | 76–85 | 10 | - AILE YOK | — | DB'de MPC modeli YOK |
| industrial_Ventilation.pdf | VORTICENT C E RANGE | 86–97 | 12 | - AILE YOK | — | DB'de VORTICENT modeli YOK |
| industrial_Ventilation.pdf | E-ATEX RANGE | 98–103 | 6 | OK ESLESTI | vortice-vort-e-atex | DB: E 254..606 T ATEX (14 model) |
| industrial_Ventilation.pdf | C-ATEX RANGE | 104–109 | 6 | - AILE YOK | — | DB'de VORTICENT C ATEX modeli YOK |
| industrial_Ventilation.pdf | TORRETTE RF-EU RANGE | 110–119 | 10 | - AILE YOK | — | DB'de TORRETTE modeli YOK; TIRACAMINO somine/baca, TORRETTE cati |
| industrial_Ventilation.pdf | TORRETTE TR-E RANGE | 120–127 | 8 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | TORRETTE TR-E-V RANGE | 128–135 | 8 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | TORRETTE TR-ED RANGE | 136–145 | 10 | - AILE YOK | — | ayni |
| industrial_Ventilation.pdf | TORRETTE TR-ED-V RANGE | 146–168 | 23 | - AILE YOK | — | ayni |
| ResidentialVentilation.pdf | PUNTO RANGE | 6–11 | 6 | - AILE YOK | — | DB'de duz Punto modeli YOK (yalniz Punto Evo Flexo) |
| ResidentialVentilation.pdf | PUNTO FILO RANGE | 12–15 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | PUNTO FOUR RANGE | 16–19 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | PUNTO GHOST RANGE | 20–23 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | PUNTO EVO FLEXO RANGE | 24–27 | 4 | OK ESLESTI | vortice-punto-evo-flexo | DB: Punto Evo Flexo MEX 100/120 (4 model) |
| ResidentialVentilation.pdf | PUNTO EVO RANGE | 28–33 | 6 | INSAN INSAN KARARI | vortice-punto-evo-flexo | aile adi 'Punto Evo / Flexo' ama DB'de yalniz FLEXO modeli var |
| ResidentialVentilation.pdf | PUNTO EVO ES RANGE | 34–37 | 4 | - AILE YOK | — | DB'de ES modeli YOK |
| ResidentialVentilation.pdf | PUNTO EVO GOLD RANGE | 38–41 | 4 | - AILE YOK | — | DB'de GOLD modeli YOK |
| ResidentialVentilation.pdf | VORTICE VARIO RANGE | 42–45 | 4 | - AILE YOK | — | DB'de VARIO modeli YOK |
| ResidentialVentilation.pdf | VORTICE VARIO I RANGE | 46–63 | 18 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | ARIETT RANGE | 64–67 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | ARIETT I RANGE | 68–71 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | ARIETT HABITAT RANGE | 72–75 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT PRESS RANGE | 76–79 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT PRESS I RANGE | 80–83 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT PRESS HABITAT RANGE | 84–87 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT QUADRO EVO RANGE | 88–95 | 8 | OK ESLESTI | vortice-vort-quadro-evo | DB: Vort Quadro Evo QE ... (23 model) |
| ResidentialVentilation.pdf | VORT QUADRO RANGE | 96–99 | 4 | - AILE YOK | — | DB'de duz Quadro modeli YOK (yalniz Quadro EVO) |
| ResidentialVentilation.pdf | VORT QUADRO I RANGE | 100–103 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT NOTUS RANGE | 104–107 | 4 | - AILE YOK | — | DB'de NOTUS modeli YOK (fiyat listesinde var, aile acilmamis) |
| ResidentialVentilation.pdf | VORT PLATT RANGE | 108–111 | 4 | - AILE YOK | — | DB'de PLATT modeli YOK (fiyat listesinde var) |
| ResidentialVentilation.pdf | VORT PENTA RANGE | 112–115 | 4 | - AILE YOK | — | DB'de PENTA modeli YOK (fiyat listesinde var) |
| ResidentialVentilation.pdf | VORT LETO MEV RANGE | 116–119 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT HRW MONO RANGE | 120–129 | 10 | OK ESLESTI | vortice-vort-mono | DB: VORT HRW 30/40/60 MONO EVO (8 model) |
| ResidentialVentilation.pdf | VORT PRESS EP RANGE | 130–133 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT PRESS I EP RANGE | 134–141 | 8 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT QUADRO EP AC RANGE | 142–145 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT QUADRO I EP AC RANGE | 146–149 | 4 | - AILE YOK | — | DB'de YOK |
| ResidentialVentilation.pdf | VORT PLATT EP RANGE | 150–153 | 4 | - AILE YOK | — | ayni |
| ResidentialVentilation.pdf | VORT PENTA EP RANGE | 154–168 | 15 | - AILE YOK | — | ayni |
| vortice-brochure-radon-en.pdf | VORT NOTUS RANGE | 4–7 | 4 | - AILE YOK | — | DB'de NOTUS modeli YOK (fiyat listesinde var, aile acilmamis) |
| vortice-brochure-radon-en.pdf | VORT PLATT RANGE | 8–11 | 4 | - AILE YOK | — | DB'de PLATT modeli YOK (fiyat listesinde var) |
| vortice-brochure-radon-en.pdf | VORT PENTA RANGE | 12–15 | 4 | - AILE YOK | — | DB'de PENTA modeli YOK (fiyat listesinde var) |
| vortice-brochure-radon-en.pdf | VORT MONO RANGE | 16–31 | 16 | OK ESLESTI | vortice-vort-mono | DB: VORT HRW ... MONO EVO |
| vortice-brochure-radon-en.pdf | VORT HR NETI RANGE | 32–39 | 8 | OK ESLESTI | vortice-isi-geri-kazanim | DB: Vort HR 300 Neti |
| vortice-brochure-radon-en.pdf | VORT HR NETI IoT RANGE | 40–45 | 6 | INSAN INSAN KARARI | vortice-isi-geri-kazanim | IoT varyanti; DB'de IoT modeli YOK, ayni seri |
| vortice-brochure-radon-en.pdf | VORT HR AVEL RANGE | 46–57 | 12 | OK ESLESTI | vortice-isi-geri-kazanim | DB: Vort HR 350 Avel / 350 Avel H / 450 AVEL D |
| vortice-brochure-radon-en.pdf | VORT INVISIBLE MINI RANGE | 58–63 | 6 | OK ESLESTI | vortice-isi-geri-kazanim | DB: Vort Invisible Mini Top |
| vortice-brochure-radon-en.pdf | VORT HRI FLAT RANGE | 64–69 | 6 | - AILE YOK | — | DB'de HRI FLAT modeli YOK |
| vortice-brochure-radon-en.pdf | VORT HRI FLAT IoT RANGE | 70–75 | 6 | - AILE YOK | — | DB'de YOK |
| vortice-brochure-radon-en.pdf | VORT PHANTOM RANGE | 76–85 | 10 | - AILE YOK | — | DB'de YOK |
| vortice-brochure-radon-en.pdf | VORT HRI PHANTOM IoT RANGE | 86–91 | 6 | - AILE YOK | — | DB'de YOK |
| vortice-brochure-radon-en.pdf | VORT HRI DH RANGE | 92–99 | 8 | - AILE YOK | — | DB'de YOK |
| vortice-brochure-radon-en.pdf | VORT SANIKIT RANGE | 100–164 | 65 | - AILE YOK | — | DB'de YOK (65 sayfa, en buyuk bolum — aile acilmamis) |
| Commercial_Ventilation_in_Line_1.pdf | VORTICE LINEO V0 RANGE | 6–17 | 12 | OK ESLESTI | vortice-lineo | DB: Lineo 100..315 (7 model) |
| Commercial_Ventilation_in_Line_1.pdf | LINEO ES RANGE | 18–23 | 6 | - AILE YOK | — | DB'de duz Lineo ES modeli YOK (Quiet ES var, ayri aile) |
| Commercial_Ventilation_in_Line_1.pdf | CA V0 E RANGE | 24–27 | 4 | - AILE YOK | — | DB'de V0 modeli YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA V0 EP RANGE | 28–33 | 6 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA MD and CA MD E RANGE | 34–39 | 6 | OK ESLESTI | vortice-vort-commercial-in-line-circular | DB: CA ... MD |
| Commercial_Ventilation_in_Line_1.pdf | CA MD EP RANGE | 40–45 | 6 | - AILE YOK | — | DB'de EP modeli YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA ES RANGE | 46–53 | 8 | - AILE YOK | — | DB'de duz CA ES modeli YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA WE D E RANGE | 54–57 | 4 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA WE D EP RANGE | 58–61 | 4 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA MD E W RANGE | 62–65 | 4 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA MD W EP RANGE | 66–71 | 6 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA MD E RF RANGE | 72–75 | 4 | - AILE YOK | — | DB'de YOK |
| Commercial_Ventilation_in_Line_1.pdf | CA MD RF EP RANGE | 76–88 | 13 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | LINEO RANGE | 4–4 | 1 | OK ESLESTI | vortice-lineo | DB: Lineo 100..315 |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CONSTRUCTION RANGE | 5–5 | 1 | - AILE YOK | — | urun bolumu degil, yapi/kesit anlatimi |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | LINEO V0 RANGE | 6–19 | 14 | OK ESLESTI | vortice-lineo | ayni |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | LINEO V0 ES RANGE | 20–25 | 6 | - AILE YOK | — | ayni |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA V0 RANGE | 26–31 | 6 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA MD RANGE | 32–39 | 8 | OK ESLESTI | vortice-vort-commercial-in-line-circular | DB: CA 100..315 MD (7 model) |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA ES RANGE | 40–45 | 6 | - AILE YOK | — | DB'de duz CA ES modeli YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA WE D E RANGE | 46–49 | 4 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA MD E W RANGE | 50–55 | 6 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA MD E RF RANGE | 56–61 | 6 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA IN-LINE RANGE | 62–62 | 1 | - AILE YOK | — | DB'de karsiligi YOK; dikdortgen aile CA IL ... ES RECT |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CONSTRUCTION RANGE | 63–63 | 1 | - AILE YOK | — | urun bolumu degil, yapi/kesit anlatimi |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA IN-LINE RANGE | 64–69 | 6 | - AILE YOK | — | DB'de karsiligi YOK; dikdortgen aile CA IL ... ES RECT |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA IN-LINE QUIET RANGE | 70–75 | 6 | - AILE YOK | — | ayni |
| Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf | CA IN-LINE QUIET ES RANGE | 76–84 | 9 | INSAN INSAN KARARI | vortice-vort-commercial-in-line-rectangular | DB: CA IL 4020..8060 ES RECT — IL=IN-LINE ve ES ortusuyor ama RECT bolum adinda YOK |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRW 20 MONO RANGE | 10–21 | 12 | INSAN INSAN KARARI | vortice-vort-mono | DB'de 30/40/60 var, 20 YOK — ayni seri farkli boy |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRI MINI RANGE | 22–25 | 4 | INSAN INSAN KARARI | vortice-isi-geri-kazanim | DB: Vort Invisible Mini Top ile ayni mi, DOGRULANMADI |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT PROMETEO PLUS HR 400 RANGE | 26–43 | 18 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HR 350 EXO RANGE | 44–49 | 6 | - AILE YOK | — | DB'de 350 Avel var, 350 EXO YOK |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRI DH RANGE | 50–55 | 6 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRI PHANTOM RANGE | 56–61 | 6 | - AILE YOK | — | DB'de YOK |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRI INVISIBLE-E RANGE | 62–71 | 10 | INSAN INSAN KARARI | vortice-isi-geri-kazanim | DB: Vort Invisible Mini Top; -E varyanti DOGRULANMADI |
| Doc_Pubblicita_Residential_ventilation_vmc_1.pdf | VORT HRI FLAT RANGE | 72–80 | 9 | - AILE YOK | — | DB'de HRI FLAT modeli YOK |
| heat-master-slimroof-cati-fanlari-yeni.pdf | HEATMASTER F400 SERIES | 4–25 | 22 | OK ESLESTI | vortice-vort-heatmaster-slimroof-smoke | DB: HEATMASTER F400 315..630 (10 model) |
| heat-master-slimroof-cati-fanlari-yeni.pdf | SLIMROOF ES SERIES | 26–44 | 19 | OK ESLESTI | vortice-vort-heatmaster-slimroof-roof | DB: SLIMROOF 155..630 ES (10 model) |
| 2022-11-en-ca-rm-es-radon.pdf | THE RADON-SPECIFIC VORTICE RANGE | 23–42 | 20 | INSAN INSAN KARARI | vortice-radon-range-circular + vortice-radon-range-roof | TEK bolum IKI aileyi kapsiyor: DB'de CA-RM ES (kanal, 5) ve CA-RM RF ES (cati, 3) |
| LINEO_QUITE_KATALOG.pdf | LINEO RANGE | 1–5 | 5 | OK ESLESTI | vortice-lineo | DB: Lineo 100..315 |
| LINEO_QUITE_KATALOG.pdf | LINEO QUIET RANGE | 6–11 | 6 | OK ESLESTI | vortice-lineo-quiet | DB: Lineo 100..315 Quiet (6 model) |
| LINEO_QUITE_KATALOG.pdf | LINEO QUIET ES RANGE | 12–17 | 6 | OK ESLESTI | vortice-lineo-quiet | DB: Lineo 100..315 Quiet ES (6 model) |
| LINEO_QUITE_KATALOG.pdf | LINEO QUIET RANGE | 18–23 | 6 | OK ESLESTI | vortice-lineo-quiet | DB: Lineo 100..315 Quiet (6 model) |
| LINEO_QUITE_KATALOG.pdf | LINEO RANGE | 24–33 | 10 | OK ESLESTI | vortice-lineo | DB: Lineo 100..315 |
| LINEO_QUITE_KATALOG.pdf | LINEO ES RANGE | 34–40 | 7 | - AILE YOK | — | DB'de duz Lineo ES modeli YOK (Quiet ES var, ayri aile) |
| Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf | VORT JET-A Range | 16–17 | 2 | - AILE YOK | — | ayni |
| Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf | VORT JET-R Range | 18–21 | 4 | - AILE YOK | — | ayni |
| Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf | MPC HP and MPC EC Range | 22–24 | 3 | - AILE YOK | — | DB'de MPC modeli YOK |
| Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_4.pdf | VORT QUADRO EVO RANGE | 1–20 | 20 | OK ESLESTI | vortice-vort-quadro-evo | DB: Vort Quadro Evo QE ... (23 model) |
| E_ATEX_Range_yeni_2025.pdf | E-ATEX RANGE | 3–4 | 2 | OK ESLESTI | vortice-vort-e-atex | DB: E 254..606 T ATEX (14 model) |
| E_ATEX_Range_yeni_2025.pdf | EXAMPLE OF E-ATEX RANGE | 5–16 | 12 | OK ESLESTI | vortice-vort-e-atex | ayni bolumun devami |
| Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf | DEUMIDO RANGE | 1–12 | 12 | OK ESLESTI | vortice-deumido-range | DB: DEUMIDO NG 10/16/20 |
| Air_Conditioning_Air_Door_2.pdf | AIR DOOR RANGE | 6–8 | 3 | INSAN INSAN KARARI | vortice-hava-perdesi + vortice-h-ad-elektrikli | TEK bolum IKI aileyi kapsiyor: DB'de AD 900..2000 (ortam havali, 4) ve H AD 900..1500 (elektrikli, 4) |
| Doc_Pubblicita_Residential_ventilation_Punto_Evo_Flexo_2.pdf | Punto Evo Range | 7–8 | 2 | INSAN INSAN KARARI | vortice-punto-evo-flexo | aile adi 'Punto Evo / Flexo' ama DB'de yalniz FLEXO modeli var |
---

## 4 · Ölçülemeyenler (uydurulmadı)

* `AILE YOK` çıkan 81 bölümün **hepsi gerçekten satılmıyor mu**, yoksa bir kısmı DB'de **farklı adla mı
  duruyor** — kontrol edilmedi. Ölçüt model koduna dayanıyor; ad değişmişse bölüm kaçar.
* Radon bölümünde kanal/çatı sınırının **hangi sayfada** olduğu ölçülmedi (§2).
* `VORT SANIKIT RANGE` **65 sayfayla en büyük bölüm** ve karşılığı yok — Vortice'nin sattığı, bizim
  açmadığımız bir ürün ailesi olabilir. **Ticari fırsat mı, alakasız mı: ölçmedim**, OPS'a not.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-05
