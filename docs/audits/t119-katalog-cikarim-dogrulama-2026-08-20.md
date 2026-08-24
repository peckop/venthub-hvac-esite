# T119 — Katalog Çıkarım Doğrulama Raporu (AŞAMA-1)

> **Tarih:** 2026-08-20 · **Şerit:** PRICING-STOK · **Emir:** OPS-AUDIT iki-aşamalı (09:48Z)
> **Kapsam:** yalnız **ÇIKARMA**. DB aktarımı (K2) bu raporun kapsamı **DIŞINDA** ve ayrı Recep kapısıdır.

## KAYNAK / CETVEL

| | |
|---|---|
| **Yöneten cetvel** | `docs/standards/catalog-ingestion-standard.md` · `docs/standards/csv-import-export-standard.md` |
| **Cetvel tazeliği** | Her ikisi de canlı; §D bulgusu `csv-import-export-standard.md §2A`'daki `model_code` **zorunlu köprü** hükmüyle **çelişiyor** (aşağıda) |
| **Kaynak veri** | `venthub-pdf-ingestor/venthub/ticaret/avensair-fiyat-listesi-2026/` — girdi `avens_fiyat_listesi_2026_HQ.pdf` (34 MB), sayfa görüntüleri `02-work/pages/page_1..74.png` (36 MB) |
| **Ölçülen çıktı** | `03-output/avensair-fiyat.csv` (484 satır, 08-20 itibarıyla) |
| **Önceki bulgu** | `docs/audits/t099-aile-icerik-uyumu-2026-08-18.md` §9–§17 + EK-A (PR #694, master'da) |
| **Düzeltme commit'i** | `venthub-pdf-ingestor@e7e5f7b` (K1.1/K1.2, **lokal**) |

## 1. Yöntem ve neden bu yöntem

74 sayfanın tamamı **görsel** okundu. Okumayı 25 **Sonnet** alt-ajanı yaptı (sayfa başına
ortalama ~60K token, 9–50 sn); yargı, karşılaştırma ve hüküm ana oturumda kaldı. **Dış vision
API kullanılmadı** — eski çıkarımı üreten `MIMO_MODEL=mimo-v2.5` çağrısı hiç yapılmadı.

Ajanlara verilen istem, K1.1/K1.2'de yazılan düzeltilmiş kuralları taşıdı: kod biçimine
varsayım yok, çeşitlendirilmiş örnekler, şema/infografik ürün değildir, ve — koşu sırasında
eklenen — **kod sütunu dışından sayı alma**.

### 1.1 Önce aleti kalibre ettim

Bulma gücünü kanıtlamak isabeti kanıtlamaz. Bu yüzden kalibrasyon kümesine yalnız **bilinen
kayıpları** (39, 47, 48, 49) değil, **kayıpsız olduğu kanıtlı** bir sayfayı da koydum:

| Sayfa | Eski CSV | Yeni çıkarım | Hüküm |
|---|---|---|---|
| **20** (kontrol) | 23 | **23** | Uydurma yok — hassasiyet tamam |
| 39 | 0 | 11 | CMS ATEX geri geldi |
| 47 | 0 | 15 | NIMUS geri geldi |
| 48 | 0 | 15 | NIMAX geri geldi |
| 49 | 3 | 9 | ENKELFAN geri geldi (o 3 satır **sahte** çıktı, §3-B1) |

Kalibrasyon geçmeden tam süpürmeye başlamadım.

## 2. Kayıp: 74 kod (önceki tahmin 50 idi — **düzeltiliyor**)

`t099` §11'de kaybı **50** olarak yazmıştım. Tam süpürme sonrası doğru rakam **74**.

| Sayfa | Adet | Aile | Kod biçimi |
|---|---|---|---|
| 39 | 11 | CMS ATEX | `253080106XN` (alfanümerik, 11 hane) |
| 47 | 15 | NIMUS | `NS311280` (alfanümerik) |
| 48 | 15 | NIMAX | `NX313290` (alfanümerik) |
| 49 | 9 | ENKELFAN | `ENKEC 155` (boşluklu) |
| **27** | **7** | AVENS dikdörtgen kanal | **`1200`, `1250`, `1316`, `1317`, `1355`, `1360`, `1410` — DÖRT haneli** |
| **21** | **9** | QE-B | **`11560`–`11568` — BEŞ haneli** |
| 69 | 6 | Sulu batarya | `13052`–`13057` |
| 44 | 1 | PTC sensör | `810105` (altı haneli) |
| 62 | 1 | VORT MASTER | `20153` |

### 2.1 Sayfa 27, kısıtın en temiz imzası

Yedi **dört haneli** kod düşmüş. Bu, kaybın "alfanümerik kodlar tanınmadı" diye
açıklanamayacağını gösterir: mesele **harf değil, UZUNLUK**. `5-digit code` talimatı beş
haneden **sapan her şeyi** eliyor — hem uzun alfanümerikleri hem kısa sayısalları.

### 2.2 Sayfa 21, açıklayamadığım kayıp

`11560`–`11568` **beş haneli** ve buna rağmen düşmüş; üstelik hemen ardındaki `11569`
CSV'de **var**. Beş hane kısıtı bunu açıklamıyor. Ayrı bir kayıp biçimi olmalı (sayfa hiç
işlenmedi, tablo yarım okundu, ya da toplu geçiş orada kesildi) — **söyleyemiyorum**.
Kaybın kendisi ölçüldü, sebebi ölçülmedi; bunu kapatılmış saymıyorum.

## 3. Sahte kayıt: 15 kod, üç ayrı biçim

Kısıt yalnız gerçek ürünleri düşürmemiş, **sahte ürün de üretmiş**.

### B1 — Başka sütundan alınmış sayı (9 kod)

| Kod | Eski CSV kaydı | Gerçekte ne |
|---|---|---|
| `13850` `16100` `18600` | ad `**`, fiyat 2.77 / 2.77 / 53.0 € | Sayfa 49 **DEBİ m³/h** sütunu (ENKEC 500/560/630 satırlarının debisi; gerçek fiyatları 2191 / 2335 / 2476 €) |
| `11300` `20700` `33000` `37400` `42500` `47300` | ad `AvenS 1500…5000` | Sayfa 69 sulu batarya **Kcal/h** değerleri |

Beş haneli sayı arayan çıkarım, kod sütunu yerine teknik sütunlardaki beş haneli sayıları
ürün kodu sanmış. Fiyat 2.77 € bir plug fan için absürt — ama hiçbir kapı bakmıyordu.

### B2 — Sayfada hiç bulunmayan kayıt (1 kod)

`60079` / ad `II` / fiyat 2.0 € / sayfa 38. Sayfa 38 yeniden okundu: 14 satırın tamamı
`403xx` kodlu VORT-E ATEX; `60079` sayfanın **hiçbir yerinde geçmiyor**.

### B3 — Uydurulmuş ardışık kod (5 kod) — bu biçimi beklemiyordum

`16076`, `16077`, `16078`, `16079`, `16080` → sayfa 26, `CA IL 4020/5035/6040/7050/8060 ES RECT`.

**Ürünler gerçek.** Kodlar değil. Sayfa 26'da KOD sütunu **var**, bu beş satırın hücreleri
**boş**, ve `16076`–`16080` aralığı sayfanın hiçbir yerinde geçmiyor. Çıkarım, boş hücreyi
ardışık sayıyla **doldurmuş**.

Bu, B1'den farklı bir mekanizma: B1 yanlış yerden **okuyor**, B3 hiç okumadan **üretiyor**.
`model_code` boş bırakılamaz kuralı (SKILL.md, cetvel) burada zararlı hale geliyor — zorunlu
alan, boşluğu uydurmayla doldurmaya **basınç uyguluyor**. Kural doğru, ama kaçış valfi
(`null` + `confidence != ok`) fiilen çalışmamış.

## 4. Fiyat karşılaştırması: 451 aynı, 18 farklı

Ortak kodlarda fiyatların **%96'sı birebir aynı**. Bu iyi haber: eski çıkarım tanıdığı
satırlarda fiyatı doğru okumuş; kusur seçimde, okumada değil.

⚠ **Kendi ölçüm hatam:** ilk koşu `0 aynı / 469 farklı` verdi. Sebep veride değil, benim
ayrıştırıcımdaydı — eski CSV'de nokta **ondalık** ayracı (`17820.0`), ben binlik sanıp sildim
ve `178200` yaptım. Aracı düzeltip yeniden koştum. Ölçüm aracı sessizce yanlış cevap
verebiliyor; rakam absürt geldiği için baktım, kapı yakaladığı için değil.

Kalan 18 farkın büyük kısmı §5'teki mükerrer kod çakışmasından doğuyor (aynı kod iki farklı
üründe, karşılaştırma ilk eşleşmeyi alıyor). Gerçek fiyat düzeltmesi olan kalemler:
`13016` (400 → **5581**), `15000` TIRACAMINO (40 → **808**), `12941` CR5N (613 → **63**).

## 5. ⭐ EN SERT BULGU — `model_code` köprü olarak TEKİL DEĞİL

543 benzersiz kodun **41'i birden fazla üründe** geçiyor; bunların **~20'si gerçek çakışma**
(farklı ürün, farklı fiyat), kalanı aynı ürünün farklı yazımı.

| Kod | Ürün 1 | Ürün 2 |
|---|---|---|
| `43151` | s36 VORT QBK SAL KC EVO 315 M4 — **1616 €** | s40 TORRETTE TR-A 315 T4 ATEX — **1675 €** |
| `43158` | s36 VORT QBK SAL KC EVO 450 T4 — **2629 €** | s40 TORRETTE TR-A 630 T6 ATEX — **3979 €** |
| `80102` | FC-51 220V 0,55kW — **475 €** | FC101P1K5 1,5kW — **678 €** (aynı sayfada, s34) |
| `11952` | s18 SUPER — **209 €** | s54 ADH-630-R — **1512 €** |
| `11944` | s18 MEDIO — **154 €** | s54 ADH-250 E2 — **267 €** |

`43151`–`43161` bloğunun tamamı (9 kod) VORT QBK SAL ile TORRETTE TR-A arasında çakışıyor.

**Neden önemli:** `csv-import-export-standard.md §2A`, `model_code`'u *"zorunlu, köprü alanı,
boş bırakılamaz"* olarak tanımlıyor ve `catalog-ingestion-standard.md §1` *"Vortice cod. =
Avensair KOD, iki kaynağı bu bağlar"* diyor. **Kaynak PDF bu varsayımı tutmuyor.** Aktarımda
`model_code` üzerinde tekillik kısıtı varsa bu satırlar birbirini **ezer** ya da aktarım
patlar — ve ezme sessiz olursa yanlış fiyat vitrine çıkar.

Bu bir **tasarım sorusu**, tek başıma vereceğim karar değil (§8).

## 6. Hassasiyet: uydurma üretmiyor muyum

Kaybı ararken kendi fantom adaylarımı üretme riskim vardı — 08-19'da tam bunu yaşamıştım.

- Kontrol sayfası 20: **23 / 23**, birebir.
- CSV'de sıfır satırı olan **22 sayfanın 19'u** gerçekten ürünsüz çıktı (kapak, içindekiler,
  infografik, notlar). Yani *"22 boş sayfa var, kayıp 50'den büyük olabilir"* şeklindeki ilk
  alarmımın **19'u yanlış alarmdı**. Sayıyı ölçmeden ilan etmediğim için rapora fantom
  girmedi.
- Ajanlar boş sayfayı ürünle **doldurmadı**; sayfa 26'da kod bulamayınca **uydurmadı**,
  `SUPHELI` işaretledi — eski çıkarımın yaptığının tam tersi.

Bir ajan, sayfa 49 doğrulamasında görüntüyü **yeniden açmadan** cevap verdi (`tool_uses: 0`).
Cevabı doğru çıktı ama kanıtı yoktu; hükmü ajanın sözüne değil, CSV'deki `**` adına ve
absürt fiyata dayandırdım.

## 7. Kök sebep zinciri — nerede duruyor

`t099` §16'da yaptığım geri çekme **duruyor**: `visual_ingest_page.py`'ın bu CSV'yi ürettiği
atfı çürüktü, geri almıyorum. Kanıtlanan şey şu:

1. CSV'nin git geçmişinde toplu çıkarım **389 satır** üretti; **389/389'u tam beş haneli**;
   hiçbir commit'te **tek bir alfanümerik kod yok** (yani sonradan düşmediler, hiç girmediler).
2. `5-digit code` talimatı, çıkarımdan **bir gün önce** depoda mevcuttu.
3. Çıkarım, kısıtın imzasını taşıyor (§2.1 dört haneli kayıp bunu tek başına gösteriyor).

Kısıt **iki kanaldan** taşınmış olabilir ve hangisi olduğunu ayırt edemiyoruz: betikteki iki
istem satırı, ya da belgelerdeki tek biçimli beş haneli örnek kümesi. Bu yüzden düzeltme
**ikisini birden** kapattı (`e7e5f7b`) — belirsizliği çözmek yerine **önemsiz** kıldı.

## 8. ÇELİŞEN-MEVCUT

Bugünkü bulgularla **çelişen** canlı kural/davranışlar:

| # | Çelişen şey | Nerede | Geri-alma / çözüm |
|---|---|---|---|
| 1 | `model_code` **zorunlu ve köprü** hükmü | `csv-import-export-standard.md §2A` | §5: kaynakta tekil değil. Cetvel ya bileşik anahtara (`model_code + avensair_section`) geçmeli, ya çakışmayı **kırmızı** sayan bir kapı tanımlamalı. **Recep kararı.** |
| 2 | `model_code` **boş bırakılamaz** | `catalog-ingestion-standard.md` + SKILL.md | §3-B3: zorunluluk, boş hücreyi uydurmaya basınç uyguladı. Kaçış valfi (`null` + `confidence != ok`) yazılı ama uygulanmamış. |
| 3 | Belgelerdeki **tek biçimli 5 haneli örnekler** | `csv-import-export-standard.md:54` (`11313`), `catalog-ingestion-standard.md:32` (`cod. 61121`) | Örnek çeşitlendirmesi ingestor deposunda yapıldı; **bu iki dosyada henüz yapılmadı** — ayrı, küçük bir PR. |
| 4 | `avensair-fiyat.csv` **prod veri kaynağı sayılıyor** | Katalog hattı | 15 sahte + 74 eksik satır taşıyor. Aktarım onayı çıkana kadar **güvenilir kabul edilmemeli**. |
| 5 | Çoğaltıcı filtre (*"yalnız Avensair'de geçeni al"*) | SKILL.md:64 | Kaldırılmadı (savunulabilir), ama artık atlanan her ürün `02-work/atlanan-vortice.md`'ye yazılıyor — kayıp sessiz düşmüyor. |

## 9. Recep'ten beklenen (AŞAMA-2)

1. **Aktarım onayı** — 74 eksik kalemin DB'ye yazılması ayrı kapı, bu rapor onu **istemiyor**, sunuyor.
2. **§5 tasarım kararı** — `model_code` tekil değilse köprü ne olacak? Aktarımın **önünde** duruyor.
3. **15 sahte satırın silinmesi** — CSV'den mi, yoksa yeniden çıkarımla mı komple değiştirilecek.

Hiçbiri benim tek başıma vereceğim karar değil.

---

### EK-A — Kayıp 74 kodun tam dökümü

**Sayfa 21 (9):** `11560` `11561` `11562` `11563` `11564` `11565` `11566` `11567` `11568`

**Sayfa 27 (7):** `1200` AVENS 40x20 346 € · `1250` AVENS 50x25 388 € · `1316` AVENS 60x30 550 € ·
`1317` AVENS 60x35 930 € · `1355` AVENS 70x40 1355 € · `1360` AVENS 80x50 1570 € · `1410` AVENS 100x50 1847 €

**Sayfa 39 (11):** `253080106XN` 764 € · `253090106XE` 775 € · `253100106XN` 793 € · `253110106XN` 992 € ·
`253260106XN` 1224 € · `253320106XN` 1723 € · `253410106XN` 1967 € · `253420106XN` 2734 € ·
`253490106XN` 3431 € · `253510106XN` 4435 € · `253530121XN` 5874 €

**Sayfa 44 (1):** `810105` PTC SENSOR 306 €

**Sayfa 47 (15):** `NS311280` 1740 € · `NS351290` 1972 € · `NS4012100` 2413 € · `NS4512132` 3108 € ·
`NS5012160` 4373 € · `NS351471` 1757 € · `NS401480` 1988 € · `NS451480` 2258 € · `NS501490` 2596 € ·
`NS5624100` 3035 € · `NS6314112` 3772 € · `NS7114132` 4890 € · `NS8014160` 7025 € · `NS9014200` 9986 € ·
`NS10014225` 12681 €

**Sayfa 48 (15):** `NX313290` 1818 € · `NX353290` 2173 € · `NX4032112` 2757 € · `NX4532132` 4159 € ·
`NX5032160` 4638 € · `NX353471` 1786 € · `NX403480` 2024 € · `NX453490` 2334 € · `NX503490` 2802 € ·
`NX5634100` 3182 € · `NX6334132` 4128 € · `NX7144160` 5869 € · `NX8034180` 7928 € · `NX9034200` 11338 € ·
`NX10034250` 14173 €

**Sayfa 49 (9):** `ENKEC 155` 300 € · `ENKEC 190` 320 € · `ENKEC 250` 410 € · `ENKEC 310` 650 € ·
`ENKEC 355` 1080 € · `ENKEC 450` 1240 € · `ENKEC 500` 2191 € · `ENKEC 560` 2335 € · `ENKEC630` 2476 €

**Sayfa 62 (1):** `20153` VORT MASTER 11622 €

**Sayfa 69 (6):** `13052` SULU BATARYA 11 KW 717 € · `13053` 14 KW 742 € · `13054` 20 KW 795 € ·
`13055` 28 KW 913 € · `13056` 36 KW 946 € · `13057` 40 KW 989 €

### EK-B — Tam çıkarım dökümü

74 sayfanın satır-satır dökümü (599 satır) koşu artefaktı olarak tutuldu. Aktarım onayı
çıkarsa `venthub-pdf-ingestor/venthub/ticaret/avensair-fiyat-listesi-2026/02-work/` altına
kalıcılaştırılacak; **bu depoya ham veri commit'lenmedi.**
