# REC-146 · Karar 70 — eksik ürün açıklamaları (PLAN v3)

> Durum: **PLAN v3.1** (2026-09-23). v1 3. çürütmede **BLOK** (9 madde), v2 4. çürütmede **BLOK**
> (9 madde), v3 5. çürütmede **KOŞULLU** (6 metin maddesi, "yeniden tam tur gerekmez") → v3.1 işler.
> Sürüm tabloları belgenin sonunda. Recep (OPS aktarımı): *eksik TR/EN metin karar konusu değil, onarım.* Akış: plan →
> plan-challenger → üretim → taslaklar Recep'e **tek toplu tablo** (aile başına 1 satır) → yazım
> URUN-KATALOG penceresinde Recep'in sözüyle (iki anahtar). **79** (EN sayfada EN metin yoksa TR
> gösterilmez) = URUN'un gizleme onarımı; bu plandan bağımsız.
> **K7.10 değişikliği bu planın içinde KARARLAŞTIRILMAZ** — Recep'e ayrı tek soru (aşağıda C).

## Ölçüm (canlı, 2026-09-23)

| | TR sayfa | EN sayfa |
|---|---|---|
| Kendi TR açıklaması boş ürün (`deleted_at is null`) | 255 | 255 |
| — bunlardan `status=archived` (vitrinde yok) | 1 (storm-serisi) | 1 |
| **Vitrinde, açıklaması aile metninden gelen** | 250 | 250 → **TÜRKÇE aile metni** |
| Vitrinde, hiçbir açıklama görünmeyen | 4 (BVU-LS 2 · hız anahtarı 2) | 4 |
| EN aile metni boş aile | — | **27** (aşağıda A/B/C) |

PDP `src/app/_components/ProductDetailPageView.tsx:425` `selectedVariant.description ||
pickLang(family.description)`; `pickLang` (124-128) `en → tr` düşer. **EN meta/OG/JSON-LD de aynı
düşüşü yapar:** `src/app/[lang]/products/[slug]/page.tsx:122-123`, `src/lib/seo/jsonld.ts:74`. URUN'un
79 onarımı (dil düşüşü kaldırma) inince EN'de bu 250 ürünün açıklaması, meta açıklaması ve JSON-LD
`description`'ı **boş** kalır; bu plan o boşluğu doldurur.

## Kapsam

| Kalem | Aile | Vitrindeki ürün | İş |
|---|---|---|---|
| A. EN aile metni — TR onaylı (`is_description_manual=true`) | 16 | 183 (+1 arşivli) | onaylı TR'nin sadık EN'i |
| A'. EN aile metni — TR onaylı, ürünlerin kendi TR+EN metni DOLU | 2 (vortice-h-ad-elektrikli, vortice-lineo) | 11 (PDP etkisi 0) | aile EN'i — seri sayfası + aile meta için |
| B. EN + TR — TR onaysız (`is_description_manual=false`) | 7 | 67 | TR + EN birlikte tabloya; onayla TR de onaylı olur |
| C. K7.10 aileleri (hız anahtarları 2 · BVU-LS 2) | 2 | 4 | **Recep'in ayrı cevabına bağlı** (aşağıda) |
| D. Aile metniyle çelişen ürün | ölçülecek | ölçülecek | ürün-başı metin, ayrı tur |

A'daki 16 aile: avens-elektrikli-isiticilar 6 · avens-hucreli-aspiratorler 6 · avens-hucreli-hf-s 7 ·
avens-isi-geri-kazanim 3 · avens-siginak-havalandirma-uniteleri 3 · avens-sulu-batarya 8 ·
danfoss-fc101 16 · danfoss-fc102 17 · danfoss-fc51 2 · jet-serisi 21 · nicotra-gebhardt-adh 8 ·
nicotra-gebhardt-at 8 · nicotra-gebhardt-dd 13 · nicotra-gebhardt-rdh 6 · seat-serisi 40 ·
storm-serisi 20 (19 vitrin + 1 arşivli) = 184.

B'deki 7 aile: avens-nimax 15 · avens-nimus 15 · vortice-vorticent-cms-atex 11 · avens-enkelfan-ec-plug 9 ·
avens-qe-b-kasa 9 · avens-dikdortgen-kanal-radyal 7 · seat-atex-ptc-sensor 1 = 67 (REC-226 kayıp-ürün
aktarımıyla gelen aileler; TR metni K7.8 sunumundan geçmedi).

### B'nin bugünkü TR metninde müşteriye görünen iki olgu hatası (ölçüldü 2026-09-23)

| Aile | Canlı TR | Kaynak dizini |
|---|---|---|
| vortice-vorticent-cms-atex | "alüminyum sacdan yapılmış öne eğik pervane" | 10 föyün s.1'i: "Galvanised steel sheet simple inlet forward curved impeller" |
| avens-enkelfan-ec-plug | "Sürekli çalışma sıcaklık aralığı -20 °C ile +60 °C" (ailenin tamamı için) | plug-fans s.16: −20/60 yalnız 155-310; 355-450 −25/60; 500 −30/50; 560-630 −30/40 |

İkisi de jeton kapısından YEŞİL geçer (sayı/birim doğru, anlam yanlış). Onarım bu planın B hattıdır:
iki ailenin TR'si yeniden yazılır, toplu tabloda **"canlıda olgu hatası"** işaretiyle gelir; ayrıca
yazılmaz (müşteriye görünen metin = Recep kapısı, iki anahtar). Bu iki vaka anlamsal çürütmenin
(adım 4) sabotaj örnekleridir.

### Onay sonrası değişen TR (A için ek sütun)

jet-serisi TR metni 2026-09-17'de değişti; K7.8 onayı 09-06'da. Onaylanan metin ile bugünkü metin
aynı değilse EN "onaylı TR"nin çevirisi sayılamaz. Onay kanıtı = K7.8 yükü, kalıcı konumda:
ingestor `venthub/icerik-hatti/k78-onayli-aile-yuku-2026-09-06.json` (38 aile, md5
`80dafc1e18214299f5fd3bb0e59880f1`, commit `66c296a`; 09-06 yazımının `admin_audit_log` izi yok —
aile tetiği 09-17'de başlıyor, bu dosya tek kanıt). Adım 1'de her A ailesi için yükteki `kimlik_tr` ↔
canlı `description.tr` md5 karşılaştırılır. 4. çürütme ölçümü: 17 aile aynı, **jet-serisi farklı**
(onaylanan metindeki iç not 09-17'de temizlenmiş). Farklı olan aile tabloda **"TR onaydan sonra
değişti"** sütunuyla gelir ve TR'si de onaya girer (B kuralı).

### C — K7.10 (ayrı soru)

Recep 2026-09-06 K7.10: "hız anahtarları ve BVU-LS için satılabilir ürün sayfası metni yazılmaz, kaynakta
anlatım yok". Bugün iki ailenin de kaynağında kısa kimlik bilgisi olduğu ölçüldü:

| Aile | Kaynak (kaynak dizini) | Taşıyabileceği olgular |
|---|---|---|
| hız anahtarları | AVenS fiyat listesi 2026 s.27, s.36 — `60006 … 2,5 A HIZ ANAHTARI`, `01801 … 5 A` + dikdörtgen kanal fanı eşleşme tablosu | en yüksek akım, hangi fanlarla kullanıldığı |
| BVU-LS | AVenS fiyat listesi 2026 s.5, s.56 — "AVENS BVU-LS OPSİYONEL KURŞUN SEPERATÖR", `30110 BVU-LS 1000 → BVU 1000`, `30111 BVU-LS 2000/3000` | ne olduğu, hangi BVU ile eşleştiği |

⚠ v1 "BVU-LS kaynak YOK" diyordu; yanlıştı (arama çıktısı ilk 20 satırla kesilmişti). İki aile
**aynı kuralla** ele alınır: ya ikisine kısa kimlik metni ya ikisine hiç. Bu **K7.10'u değiştirir**,
bu yüzden toplu tabloya gömülmez; OPS üzerinden Recep'e tek başına sorulur. Cevap "evet" ise:
`karar-k710.json` güncellenir, `toplu-sunum.py --yuk` (410-414) bu aileleri düşürmeyi bırakır, Kararlar
belgesine yazılır ve C, A/B ile aynı hattan geçer. "Hayır" ise 4 ürün boş kalır ve kabul ölçütünden
gerekçeyle düşülür.

### D — ölçüt (v1'deki ölçüt kördü)

v1 ölçütü "aile metnindeki jeton ↔ ürün specs çelişkisi" idi; ATEX'li ürünü yakalamaz, çünkü jet/seat/storm
aile metninde ATEX jetonu yok. `atex_*` anahtarı dolu ürün: jet 7/21 · seat 12/40 · storm 6/19; buna
adında "ATEX" geçip specs'inde ATEX anahtarı olmayan 2 ürün eklenir (SEA-51201003 "SEAT 20 ATEX",
SEA-61183003 "STORM 18 ATEX") → 13 ve 7. Yeni ölçüt: **ailede heterojen özellik** — bir ayırt edici
özellik (ATEX, gerilim, faz, IP, motor tipi, **çalışma sıcaklığı aralığı, çark/gövde malzemesi**) ailenin
bir kısmında var ya da farklıysa, aile metni onu ailenin tamamına mal edemez **ve** o özelliği taşıyan
ürünler D'ye girer. Kaynak: `technical_specs` **ve ürün adı** (specs'te olmayan ATEX adda olabilir) **ve**
ailenin kaynak sayfası (Enkelfan: çark 155/190 polyamid, diğerleri alüminyum; sıcaklık dört aralık).
`technical_specs` boş ürün "ölçülemedi" diye ayrı sayılır, D dışı sanılmaz.

## KAYNAK/CETVEL

- `docs/standards/vitrin-metni-standard.md` (K4.1, K7, iç not yasağı). **K10 (dil düşüşü) master'da
  henüz YOK** — URUN'un açık onarım dalında (79). URUN'un K10 metni "EN gövde metni boş 25 aile" der; bu
  plan 27 der — fark, TR'si de boş olan C'nin 2 ailesi. **EN metin kuralı YOK → yazımı bu işin
  kapsamında** (adım 2), **K10'un alt maddesi olarak ve URUN'un K10'u master'a girdikten SONRA** (aynı
  dosyada çakışmasın): EN = onaylı TR'nin sadık çevirisi; TR'de olmayan iddia EN'e girmez; sayı/kod/birim
  jetonları iki dilde birebir (eşdeğerlik tablosuyla); terim üreticinin EN belgesinden.
- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini (PDF açılmaz).
- `scripts/icerik-hatti/taslak-kaynak-kapisi.py` — ⚠ **PDF'i `fitz` ile açıyor (satır 44, 112) — §6.3
  ihlali**; girdi `.md` + `[KAYNAK s.NN]` (CSV değil); jeton desenleri (83-96) `A`/`mA` akımını
  tanımıyor; `%\s?[0-9]` EN'deki "90%"u jeton saymıyor. EN için ayrı kapı gerekir (adım 4).
- `scripts/icerik-hatti/aile-metni-yaz.mjs` — `description.en`'e dokunmuyor (satır 19); KAPI 1
  `BEKLENEN_AILE=38` sabit (27); KAPI 3 `kimlik_tr` ister ve "38/38" basar (89-94); tüm `description`
  JSON'unu koşulsuz PATCH'liyor (159-166). `denetim_izi_product_families` tetiği UPDATE'te
  `admin_audit_log`'a zaten yazıyor → yazıcı ikinci audit satırı yazmaz.
- `scripts/icerik-hatti/toplu-sunum.py` — K7.8 sunum kalıbı (onaylanan metin = yazılan metin). `--yuk`
  bugün yalnız `kimlik_tr`, `maddeler_tr`, `bloklar_tr` üretir (405-420) → EN sütunu eklenir (adım 5).

## YÖNTEM

Alt ajan (Agent aracı) — Workflow DEĞİL (karar 76'dan ayrı; Workflow Recep opt-in ister). Aile başına
**1 yazar (Sonnet)** + **1 çürütücü (Opus — farklı model)**: EN'deki her iddia TR'de/kaynakta var mı,
yeni iddia var mı. v1'de ikisi de Sonnet'ti; aynı modelin aynı körlüğü doğrulama sayılmaz. Ajanın sözü
kapı değildir: **deterministik jeton farkı** (adım 4) her satıra koşar ve ajan hükmünden bağımsız
KIRMIZI verebilir. Yeni yazılan her **TR** metni (B + "değişti" satırları) ayrıca **anlamsal çürütmeden**
geçer: ikinci bir ajan (Opus) her cümleyi ailenin kaynak dizini sayfa metnine karşı okur — malzeme,
aralık, "tüm modeller" kapsamı, işlev iddiası. Jeton kapısı anlamı görmez (CMS malzemesi, Enkelfan
sıcaklığı YEŞİL geçerdi); bu adım onu kapatır. A'nın 09-06'da onaylanan TR'si yalnız jeton kapısından
geçmişti; EN onun sadık çevirisi olacağı için oradaki olası olgu hatası iki dile taşınır → **örneklem:
3 A ailesi** (en çok ürünlü seat-serisi, storm-serisi ve teknik iddiası en yoğun avens-hucreli-hf-s) aynı
anlamsal çürütmeden geçer; bulgu çıkarsa 16 aileye genişler. Ajan sayısı: 25 yazar + 25 EN çürütücü +
8 TR çürütücü + 3 örneklem = **61**, dalgalar hâlinde.

## Adımlar

1. **Ölç:** D kümesi (heterojen özellik) · A ailelerinde onaylanan (K7.8 yükü, md5 sabit) ↔ bugünkü TR
   farkı · evren sayıları (bu belgedeki tablo) betikle yeniden basılır.
2. **Cetvel:** EN kuralı **şimdi bu planın eki olarak yazılır** (`docs/plans/rec146-en-metin-kurali.md`;
   yukarıdaki dört kural + eşdeğerlik tablosu) ve adım 3-8 bu eke bağlıdır — URUN merge'ünü BEKLEMEZ.
   URUN'un K10'u master'a girince ek, `vitrin-metni-standard.md`'ye K10'un alt maddesi olarak taşınır
   (aynı dosyada çakışma olmasın diye önce değil).
3. **Taslak üretimi:** aile başına `paket/rec146/<slug>.tr.md` + `<slug>.en.md` (her cümle
   `[KAYNAK s.NN]`) + özet `paket/rec146-metin-<damga>.csv` (aile, ürün_sayisi, tr_onayli, tr_degisti,
   canli_olgu_hatasi, tr_yeni, en_yeni, kaynak_sayfalari, jeton_tr, jeton_en, curutme_hukmu, not).
4. **Kapılar:**
   - `taslak-kaynak-kapisi.py` kaynak dizininden okur (`fitz` kalkar; sayfa metni
     `sayfalar.jsonl`'dan) + jeton desenine `A`/`mA` + "90%" biçimi; test + sabotaj (PDF yolu verilse
     de açılmaz).
   - **Yeni `en-jeton-kapisi.py`:** TR ↔ EN jeton kümesi birebir; EN'de TR'de olmayan jeton = KIRMIZI.
     Eşdeğerlik tablosu (her biri için sabotaj testi):

     | Kural | TR | EN |
     |---|---|---|
     | yüzde | `%90` | `90%` |
     | ondalık | `1,5` | `1.5` |
     | binlik ayırıcı | `25.000` / `25000` | `25,000` / `25000` |
     | birim çevirisi | `d/dk` | `rpm` |
     | faz | `trifaze` / `monofaze` | `three-phase` / `single-phase` |
     | boşluk | `IP55`, `380V` | `IP 55`, `380 V` |

     Sayı ayrıştırması **dile göre** yapılır: TR'de `.` binlik, `,` ondalık; EN'de `,` binlik, `.`
     ondalık. EN metinde "nokta + tam 3 hane" (`1.125`) belirsizdir → KIRMIZI (yazar `1,125` ya da
     `1125` yazmalı). Sabotaj: TR `1.125 m³/h` ↔ EN `1.125 m³/h` KIRMIZI (değer 1000 kat kaymış olur);
     TR `1.125` ↔ EN `1,125` YEŞİL; TR `1,5` ↔ EN `1.5` YEŞİL.
     İç not süzgeci iki dile. KIRMIZI satır tabloya girmez.
   - **Anlamsal çürütme (TR):** B + "değişti" satırlarının her cümlesi kaynak sayfa metnine karşı (YÖNTEM);
     sabotaj: CMS "alüminyum pervane" ve Enkelfan "tek sıcaklık aralığı" metinleri KIRMIZI vermeli.
5. **Sunum ve yük** `toplu-sunum.py`: EN sütunu (ve B için TR) sunum tablosuna **ve** `--yuk`'a aynı
   ayrıştırıcıdan yazılır (onaylanan metin = yazılan metin, iki dilde).
6. **Yazıcı** `aile-metni-yaz.mjs`:
   - Okuma `select=id,tenant_id,slug,description,is_description_manual,updated_at`.
   - Atomik koşullu PATCH: `product_families?id=eq.<id>&tenant_id=eq.<t>&updated_at=eq.<kodlu>` —
     `updated_at` ham dize `encodeURIComponent` ile (`+00:00`'daki `+` kodlanmazsa eşleşme hiç olmaz);
     `prefer: return=representation`; 0 satır → yeniden oku, 1 kez dene; yine 0 → KIRMIZI.
   - `--dil en` (A, A' — **"değişti" işaretli aile hariç**, bugün jet-serisi): gövde = okunan JSON'a
     yalnız `en` eklenmiş hâli; `en` doluysa yazmaz. "Değişti" ailesi yalnız B yolundan (tek PATCH,
     yeni TR + onun EN'i) geçer; iki kümede birden görünen aile → KIRMIZI.
   - B: **tek PATCH** — `tr` + `en` + `is_description_manual=true` birlikte; yalnız
     `is_description_manual=false` ailede ya da tabloda "değişti" işaretli ailede (onaylı TR'nin
     üstüne işaretsiz yazmaz).
   - KAPI 1 beklenen küme yazıcıya **dışarıdan** verilir: `--beklenen <dosya>` = Recep'in onayladığı
     aile listesi (onay mesajındaki slug'lar, sunum ve yükten ayrı kaydedilir); yükün slug kümesi bununla
     **küme olarak** kıyaslanır (sayı değil). Bugünkü beklenti: `--dil en` 17 (A 15 + A' 2), B yolu 8
     (B 7 + jet). KAPI 3 dile göre ölçer.
   - Audit tetiğe bırakılır. Kuru koşum varsayılan.
   - Test + sabotaj: dolu `en`'i ezmez, `bloklar_tr`/`maddeler_tr`'ye dokunmaz, `+` içeren damga eşleşir,
     değişmiş damgada 0 satır, başka `tenant_id`'ye yazmaz, onaylı TR'nin üstüne işaretsiz yazmaz.
7. **Recep'e TEK TOPLU TABLO** (aile başına 1 satır: aile · ürün sayısı · TR (B, "değişti", "canlıda
   olgu hatası" satırlarında) · EN · kaynak · not). Onay → iki anahtarlı yazım. C bu tabloda değil.
8. **Canlı ölçüm — OLUMLU** (URUN'un 79 onarımı da EN'deki Türkçeyi kaldırır; "TR → 0" tek başına bu
   planın kanıtı olamaz). Ölçüm URUN merge'ünden önce ve sonra koşar; sayfa aile başınadır:
   - 25 ailenin EN aile/ürün sayfasında açıklama bölümü **dolu ve DB'deki `description.en` ile aynı**
     (A 16 + B 7 + A' 2 seri sayfası);
   - `<meta name="description">` = `description.en`'in ilk 160 karakteri (yedek "VentHub Product
     Details" değil) — `meta_description` 27 ailenin hepsinde boş, bu yüzden aile metni kullanılır;
   - JSON-LD `description` = `description.en`;
   - EN sayfalar bugün noindex (`EN_YAYIN=false`); ölçüm HTML'den (curl), arama motorundan değil.
   - Fark raporu + paket CSV yeniden üretilir.
9. **`bloklar_en`:** bu planın kapsamında DEĞİL — `bloklar_tr`'nin vitrinde render'ı bile yok
   (REC-164, URUN). REC-146'ya yorum olarak ayrı kayıt düşüldü (Linear ücretsiz sınır dolu).
10. D kümesi: ayrı tur, aynı motor.

## Kabul ölçütü

- Her metin: TR ↔ EN jeton kümesi birebir (`en-jeton-kapisi.py` YEŞİL); TR taslakta kaynak kapısı
  YEŞİL; EN çürütme hükmü "yeni iddia yok"; TR anlamsal çürütme "kaynakla çelişki yok".
- 25 ailenin EN sayfasında açıklama = DB `description.en`; meta description ve JSON-LD aynı metinden
  (olumlu ölçüm, adım 8). Vitrinde açıklamasız kalan EN ürün: 250 → 0.
- CMS ATEX ve Enkelfan'ın canlı TR olgu hataları → 0 (onaylı yeni TR ile).
- C: Recep'in K7.10 cevabına göre 4 → 0 ya da gerekçeyle 4.
- Mevcut onaylı TR ve bloklar değişmez (yazıcı testi); yazım idempotent (ikinci koşum 0 değişiklik);
  **PATCH başına 1 audit satırı** (tetikten; B'de tek PATCH → aile başına 1).

## Açık

| Soru | Kime | Plan |
|---|---|---|
| K7.10: hız anahtarları + BVU-LS kısa kimlik metni | Recep, **ayrı tek soru** (OPS) | cevaba kadar C beklemede |
| BVU-LS föyü (uzun metin için) | AVenS (71b listesi) | kısa metin fiyat listesinden |
| `bloklar_en` | REC-146 yorumu (ayrı kayıt) | bu planda yok |

## v1 → v2 (3. çürütme, BLOK)

| v1 bulgusu | v2 |
|---|---|
| BVU-LS "kaynak YOK" yanlış; C1/C2 farklı kural | kaynak s.5/s.56 yazıldı; ikisi aynı kural |
| K7.10 değişikliği toplu tabloya gömülü | Recep'e ayrı tek soru; sonra `karar-k710.json` + `toplu-sunum.py` |
| Kaynak kapısı .md ister, A/mA ve "90%" yok, PDF'i açıyor | kapı dizinden okur + desen genişler; ayrı EN jeton kapısı |
| Yazıcı: sabit 38, KAPI 3 `kimlik_tr`, koşulsuz tüm-JSON PATCH, audit | yük sayısı; dile göre KAPI 3; `updated_at=eq` atomik; audit tetikte |
| B onaysız TR "dolu TR'ye yazmaz" ile çelişiyor | `--dil tr` yalnız `is_description_manual=false` ailede + `true` yapar |
| Evren: 1 arşivli; 25 değil 27 aile; meta/OG/JSON-LD ölçülmüyor; `bloklar_en` | 250; A' (2 aile) eklendi; meta ölçümü kabul ölçütünde; `bloklar_en` ayrı kayıt |
| D ölçütü ATEX'i göremez | heterojen jeton ölçütü; boş specs = ölçülemedi |
| Yazar ve çürütücü aynı model | çürütücü Opus + deterministik jeton farkı |
| jet-serisi TR onaydan sonra değişti | "onaylanan ↔ bugünkü" karşılaştırması, fark varsa TR de onaya |

## v2 → v3 (4. çürütme, BLOK)

| v2 bulgusu | v3 |
|---|---|
| A-1 B'nin TR'sini anlamca doğrulayan yok; canlıda 2 olgu hatası (CMS malzeme, Enkelfan sıcaklık) | TR anlamsal çürütme (Opus, kaynak sayfasına karşı) + 2 vaka sabotaj testi; tabloda "canlıda olgu hatası" |
| A-2 "TR → 0" ölçütü URUN onarımıyla kendiliğinden sağlanır | olumlu ölçüt: EN sayfa/meta/JSON-LD = DB `en`; URUN merge öncesi ve sonrası |
| A-3 yazımda `updated_at` select'te yok, `+` kodlanmıyor, `slug=eq` kiracısız | `id` + `tenant_id` + `encodeURIComponent(updated_at)`, select'e eklendi, test |
| A-4 EN sunum↔yük aynı ayrıştırıcıdan değil; KAPI 1 yükü kendisiyle kıyaslıyor | `toplu-sunum.py` EN'i sunuma ve yüke yazar; beklenen sayı onaylı tablodan |
| A-5 onay kanıtı (K7.8 yükü) geçici dizinde | ingestor'a taşındı (`66c296a`), md5 sabit |
| A-6 jeton kapısında binlik ayırıcı, d/dk↔rpm, trifaze↔three-phase yok | eşdeğerlik tablosu + her kurala sabotaj testi |
| A-7 D sayıları yanlış (12/6 anahtar + 2 adda); sıcaklık/malzeme yok | sayılar düzeltildi; ölçüt ad + kaynak sayfasını da okur; iki özellik eklendi |
| A-8 K10 master'da yok; 25↔27 farkı açıklanmamış | K10 URUN dalında; EN kuralı K10 alt maddesi, URUN merge'ünden sonra; fark = C'nin 2 ailesi |
| A-9 B'de iki PATCH → iki audit | B tek PATCH; ölçüt "PATCH başına 1" |

## v3 → v3.1 (5. çürütme, KOŞULLU — metin düzeltmeleri)

| v3 bulgusu | v3.1 |
|---|---|
| 1 binlik kuralı dilden bağımsız; `1.125` EN'e aynen kopyalanınca YEŞİL | dile göre ayrıştırma; EN "nokta + 3 hane" KIRMIZI; 3 sabotaj örneği |
| 2 jet iki yazım yolunda | "değişti" ailesi `--dil en`'den çıkar (17 / 8); kesişim KIRMIZI |
| 3 KAPI 1 sunumu yükle kıyaslıyor (aynı ayrıştırıcı) | `--beklenen` = Recep'in onayladığı slug listesi, küme kıyası |
| 4 iş sırası URUN merge'üne bağlı mı belirsiz | EN kuralı şimdi plan eki; üretim beklemez; merge sonrası K10'a taşınır |
| 5 A'nın onaylı TR'si anlamca hiç çürütülmedi | 3 ailelik örneklem; bulgu çıkarsa 16'ya genişler |
| 6 ajan sayısı ~66 tutmuyor | 61 (25 + 25 + 8 + 3) |
