# REC-146 · Karar 70 — eksik ürün açıklamaları (PLAN v2)

> Durum: **PLAN v2** (2026-09-23). v1 3. çürütmede **BLOK** (9 madde) — belgenin sonunda "v1 → v2"
> tablosu. Recep (OPS aktarımı): *eksik TR/EN metin karar konusu değil, onarım.* Akış: plan →
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

### Onay sonrası değişen TR (A için ek sütun)

jet-serisi TR metni 2026-09-17'de değişti; K7.8 onayı 09-06'da. Onaylanan metin ile bugünkü metin
aynı değilse EN "onaylı TR"nin çevirisi sayılamaz. Adım 1'de her A ailesi için K7.8 yük dosyasındaki
onaylanan `kimlik_tr` ↔ canlı `description.tr` karşılaştırılır; farklı olan aile tabloda **"TR onaydan
sonra değişti"** sütunuyla gelir ve TR'si de onaya girer (B kuralı).

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
aile metninde ATEX jetonu yok (jet 7/21 · seat 13/40 · storm 7/19 üründe `atex_*` dolu). Yeni ölçüt:
**ailede heterojen jeton** — bir ayırt edici özellik (ATEX, gerilim, faz, IP, motor tipi) ailenin bir
kısmında var, bir kısmında yoksa, aile metni o özellik hakkında hiçbir şey söyleyemez **ve** o özelliği
taşıyan ürünler D'ye girer. `technical_specs` boş ürün "ölçülemedi" diye ayrı sayılır, D dışı sanılmaz.

## KAYNAK/CETVEL

- `docs/standards/vitrin-metni-standard.md` (K4.1, K7, K10 dil düşüşü, iç not yasağı). **EN metin kuralı
  YOK → yazımı bu işin kapsamında** (adım 2): EN = onaylı TR'nin sadık çevirisi; TR'de olmayan iddia
  EN'e girmez; sayı/kod/birim jetonları iki dilde birebir; terim üreticinin EN belgesinden.
- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini (PDF açılmaz).
- `scripts/icerik-hatti/taslak-kaynak-kapisi.py` — ⚠ **PDF'i `fitz` ile açıyor (satır 44, 112) — §6.3
  ihlali**; girdi `.md` + `[KAYNAK s.NN]` (CSV değil); jeton desenleri (83-96) `A`/`mA` akımını
  tanımıyor; `%\s?[0-9]` EN'deki "90%"u jeton saymıyor. EN için ayrı kapı gerekir (adım 4).
- `scripts/icerik-hatti/aile-metni-yaz.mjs` — `description.en`'e dokunmuyor (satır 19); KAPI 1
  `BEKLENEN_AILE=38` sabit (27); KAPI 3 `kimlik_tr` ister ve "38/38" basar (89-94); tüm `description`
  JSON'unu koşulsuz PATCH'liyor (159-166). `denetim_izi_product_families` tetiği UPDATE'te
  `admin_audit_log`'a zaten yazıyor → yazıcı ikinci audit satırı yazmaz.
- `scripts/icerik-hatti/toplu-sunum.py` — K7.8 sunum kalıbı (onaylanan metin = yazılan metin).

## YÖNTEM

Alt ajan (Agent aracı) — Workflow DEĞİL (karar 76'dan ayrı; Workflow Recep opt-in ister). Aile başına
**1 yazar (Sonnet)** + **1 çürütücü (Opus — farklı model)**: EN'deki her iddia TR'de/kaynakta var mı,
yeni iddia var mı. v1'de ikisi de Sonnet'ti; aynı modelin aynı körlüğü doğrulama sayılmaz. Ajanın sözü
kapı değildir: **deterministik jeton farkı** (adım 4) her satıra koşar ve ajan hükmünden bağımsız
KIRMIZI verebilir. 27 aile → ~54 ajan çağrısı, dalgalar hâlinde.

## Adımlar

1. **Ölç:** D kümesi (heterojen jeton) · A ailelerinde onaylanan ↔ bugünkü TR farkı · evren sayıları
   (bu belgedeki tablo) betikle yeniden basılır.
2. **Cetvel:** `vitrin-metni-standard.md`'ye EN bölümü (yukarıdaki dört kural).
3. **Taslak üretimi:** aile başına `paket/rec146/<slug>.tr.md` + `<slug>.en.md` (her cümle
   `[KAYNAK s.NN]`) + özet `paket/rec146-metin-<damga>.csv` (aile, ürün_sayisi, tr_onayli, tr_degisti,
   tr_yeni, en_yeni, kaynak_sayfalari, jeton_tr, jeton_en, curutme_hukmu, not).
4. **Kapılar:**
   - `taslak-kaynak-kapisi.py` kaynak dizininden okur (`fitz` kalkar; sayfa metni
     `sayfalar.jsonl`'dan) + jeton desenine `A`/`mA` + "90%" biçimi; test + sabotaj (PDF yolu verilse
     de açılmaz).
   - **Yeni `en-jeton-kapisi.py`:** TR ↔ EN jeton kümesi birebir (`%90`≡`90%`, `1,5`≡`1.5`, `IP55`≡`IP 55`);
     EN'de TR'de olmayan jeton = KIRMIZI. İç not süzgeci iki dile. KIRMIZI satır tabloya girmez.
5. **Yazıcı** `aile-metni-yaz.mjs`:
   - `--dil en`: yalnız `description.en` boşsa yazar. Atomik koşullu PATCH:
     `product_families?slug=eq.<s>&updated_at=eq.<okunan>` + gövdede okunan JSON'a yalnız `en`
     eklenmiş hâli; 0 satır dönerse KIRMIZI, yeniden oku, 1 kez dene.
   - `--dil tr` (B): onaylı TR'yi yazar ve `is_description_manual=true` yapar; yalnız
     `is_description_manual=false` ailede (onaylı TR'nin üstüne yazmaz).
   - Beklenen aile sayısı yük dosyasından (sabit 38 kalkar); KAPI 3 `--dil en`'de `en` alanını ölçer.
   - Audit tetiğe bırakılır. Kuru koşum varsayılan.
   - Test + sabotaj: dolu `en`'i ezmez, `bloklar_tr`/`maddeler_tr`'ye dokunmaz, `updated_at` değişince
     yazmaz, onaylı TR'nin üstüne `--dil tr` yazmaz.
6. **Recep'e TEK TOPLU TABLO** (aile başına 1 satır: aile · ürün sayısı · TR (B ve "değişti" satırlarında) ·
   EN · kaynak · not). Onay → iki anahtarlı yazım. C bu tabloda değil; ayrı sorunun cevabına göre.
7. **Canlı ölçüm:** EN PDP'de açıklaması aile metninden TR gelen ürün **250 → 0**; EN meta/OG/JSON-LD
   `description` alanında Türkçe metin → 0 (A+B aileleri, sayfa HTML'inden ölçülür); A' ailelerinin
   EN seri sayfası; fark raporu + paket CSV yeniden üretilir.
8. **`bloklar_en`:** bu planın kapsamında DEĞİL — `bloklar_tr`'nin vitrinde render'ı bile yok
   (REC-164, URUN). REC-146'ya yorum olarak ayrı kayıt düşülür (Linear ücretsiz sınır dolu).
9. D kümesi: ayrı tur, aynı motor.

## Kabul ölçütü

- Her metin: TR ↔ EN jeton kümesi birebir (`en-jeton-kapisi.py` YEŞİL); TR taslakta kaynak kapısı
  YEŞİL; çürütme hükmü "yeni iddia yok".
- EN PDP'de TR aile metni gösteren ürün **250 → 0**; EN meta/JSON-LD'de TR → 0.
- C: Recep'in K7.10 cevabına göre 4 → 0 ya da gerekçeyle 4.
- Mevcut onaylı TR ve bloklar değişmez (yazıcı testi); yazım idempotent (ikinci koşum 0 değişiklik);
  aile başına 1 audit satırı (tetikten).

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
