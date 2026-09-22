# REC-146 · Karar 70 — eksik ürün açıklamaları (PLAN)

> Durum: **PLAN** (2026-09-22). Recep (OPS aktarımı): *eksik TR/EN metin karar konusu değil,
> onarım.* Akış: plan → plan-challenger → üretim → taslaklar Recep'e **tek toplu tablo** (aile
> başına 1 satır, tek seferde) → yazım URUN-KATALOG penceresinde Recep'in sözüyle (iki anahtar).
> **79** (EN sayfada EN metin yoksa TR gösterilmez) = URUN'un gizleme onarımı; bu plandan bağımsız.

## Ölçüm (canlı, 2026-09-22)

| | TR sayfa | EN sayfa |
|---|---|---|
| Kendi açıklaması boş ürün | 255 | 255 |
| Sayfada ne görünüyor | 251 → aile metni · 4 → hiçbir şey | 251 → **TÜRKÇE aile metni** · 4 → hiçbir şey |

PDP `src/app/_components/ProductDetailPageView.tsx:425` `selectedVariant.description ||
pickLang(family.description)`; `pickLang` (124-128) `en → tr` düşer. Canlı kanıt:
`/en/products/avens-nimax?sku=AVE-NX313290` → "Product Description" altında "Çelik gövdeli…".
79 onarımı inince EN'de bu 251 ürünün açıklama kartı **boş** görünür → EN metin yazılana kadar
EN sayfada açıklama olmaz. Bu plan o boşluğu kapatır.

## Kapsam

| Kalem | Aile | Ürün | İş |
|---|---|---|---|
| A. EN aile metni — TR metni onaylı (`is_description_manual=true`) | 16 | 184 | onaylı TR'nin sadık EN'i |
| B. EN aile metni — TR onayı belirsiz (`is_description_manual=false`) | 7 | 67 | TR metni + EN birlikte toplu tabloya (TR de onaya girer) |
| C1. avens-hiz-anahtarlari — TR + EN | 1 | 2 | kısa kimlik metni, **yalnız kaynaktaki olgular** (aşağıda) |
| C2. avens-bvu-ls — TR + EN | 1 | 2 | **KAYNAK YOK → yazılmaz**; AVenS föy listesine (71b) eklenir |
| D. Aile metninden ayrışan ürün | ölçülecek | ölçülecek | ürün-başı metin (aynı motor, ayrı tur) |

B'deki 7 aile: avens-nimax · avens-nimus · vortice-vorticent-cms-atex · avens-enkelfan-ec-plug ·
avens-qe-b-kasa · avens-dikdortgen-kanal-radyal · seat-atex-ptc-sensor (REC-226 kayıp-ürün
aktarımıyla gelen aileler; TR metni K7.8 sunumundan geçmedi).

**C ve K7.10:** Recep 2026-09-06'da bu iki ailenin "satılabilir ürün sayfası yazılmayacak, kaynakta
anlatım yok" dedi (K7.10). OPS aktarımı bugün "2 aile TR/EN + 4 ürün" diyor. Kaynak ölçüldü:
- **Hız anahtarları: kaynak VAR** — AVenS fiyat listesi 2026 s.27 (`60006 AVenS 2,5 A HIZ ANAHTARI
  2.5 A`, `01801 AVenS 5 A HIZ ANAHTARI 5 A`, aynı sayfada AVENS dikdörtgen kanal fanlarıyla
  eşleşme tablosu) ve s.36. Metin YALNIZ bu olguları taşır (en yüksek akım, hangi fanlarla).
- **BVU-LS: kaynak YOK** — `BVU`, `30110`, `30111` dizinde 0 eşleşme (2026-09-22). Uydurma yasak
  → yazılmaz; föy AVenS'ten istenir.
- K7.10'u değiştiren satır toplu tabloda **açıkça işaretlenir**; Recep'in onayı K7.10'un yerine geçer.

**D ölçümü (adım 1):** aile metnindeki doğrulanabilir jetonlar (IP, ATEX, sayı+birim —
`taslak-kaynak-kapisi.py` jeton kümesi) ürünün `technical_specs`'iyle çelişiyorsa ürün D'ye girer.
Örnek şüphe: aynı ailede ATEX'li ve ATEX'siz ürün (storm-serisi, seat-serisi, jet-serisi).

## KAYNAK/CETVEL

- `docs/standards/vitrin-metni-standard.md` (K4.1, K7, iç not yasağı). **EN metin kuralı YOK →
  yazımı bu işin kapsamında** (adım 2): EN = onaylı TR'nin sadık çevirisi; TR'de olmayan iddia
  EN'e girmez; sayı/kod/birim jetonları iki dilde birebir; terim üreticinin EN belgesinden.
- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini (PDF açılmaz).
- `scripts/icerik-hatti/taslak-kaynak-kapisi.py` — jeton kapısı dile bağlı değil (satır 9-10).
- `scripts/icerik-hatti/aile-metni-yaz.mjs` — **`description.en`'e dokunmuyor** ("EN turu ayrı
  iş"); `BEKLENEN_AILE=38` sabit → genişletilir (adım 5).
- `scripts/icerik-hatti/toplu-sunum.py` — K7.8 sunum kalıbı (onaylanan metin = yazılan metin).

## YÖNTEM

Alt ajan (Agent aracı, Sonnet) — Workflow DEĞİL (Workflow Recep opt-in ister; iş aile başına iki
ajanla yetiyor). Aile başına **1 yazar** (girdi: onaylı TR metin + ailenin kaynak dizini sayfaları)
+ **1 bağımsız çürütücü** (EN'deki her iddia TR'de/kaynakta var mı, jetonlar birebir mi, yeni iddia
var mı). Yazar ≠ çürütücü. 25 aile → ~50 ajan çağrısı, dalgalar hâlinde.
Deterministik kapı (jeton eşitliği, iç not süzgeci) ajanın sözüne değil koda bağlı.

## Adımlar

1. **Ölç:** D kümesi · B ailelerinin TR onay geçmişi (git/Linear K7.8).
2. **Cetvel:** `vitrin-metni-standard.md`'ye EN bölümü.
3. **Taslak üretimi** (A+B+C1): yazar + çürütücü → `paket/rec146-metin-<damga>.csv`
   (aile, ürün_sayisi, tr_mevcut, tr_yeni, en_yeni, kaynak_sayfalari, jeton_tr, jeton_en,
   çürütme_hükmü, not[K7.10/onaysız TR]).
4. **Kapı:** `taslak-kaynak-kapisi.py` her satıra (TR ve EN); KIRMIZI satır tabloya girmez.
5. **Yazıcı:** `aile-metni-yaz.mjs --dil en` (+ B/C1 için tr) — yalnız boş alana yazar, dolu EN/TR
   üstüne yazmaz; `BEKLENEN_AILE` yük dosyasından; `admin_audit_log`; kuru koşum varsayılan;
   test (sabotaj: dolu metni ezmez, bloklara dokunmaz).
6. **Recep'e TEK TOPLU TABLO** (aile başına 1 satır: aile · ürün sayısı · TR · EN · kaynak · not).
   Tek tek soru yok. Onay → iki anahtarlı yazım.
7. **Canlı ölçüm:** EN sayfada açıklaması boş ürün 251 → 0 (BVU-LS 2 hariç); TR'de hiç açıklama
   görünmeyen 4 → 2 (BVU-LS); fark raporu + paket CSV yeniden üretilir.
8. D kümesi: ayrı tur, aynı motor.

## Kabul ölçütü

- Her metin: jeton kümesi kaynakla/TR ile birebir; çürütme hükmü "yeni iddia yok"; kapı YEŞİL.
- EN açıklaması boş ürün **251 → 0**; BVU-LS 2 ürün gerekçesiyle boş (kaynak yok).
- Mevcut TR metni ve bloklar değişmez (yazıcı testi); yazım idempotent; aile başına 1 audit.

## Açık

| Soru | Kime | Plan |
|---|---|---|
| BVU-LS föyü | AVenS (71b listesine eklenir) | yazılmaz |
| B ailelerinin TR metni daha önce onaylandı mı | ölçülecek (adım 1) | tabloda işaretli |
