# REC-146 · Karar 70 — eksik ürün açıklamaları (TASLAK)

> Durum: **TASLAK** (2026-09-22). Üretim BAŞLAMAZ: karar **79** (EN sayfada EN metin yoksa ne
> gösterilir — yapısal, URUN kodu, OPS Recep'e soruyor) gelmeden bu plan kesinleşmez.
> Canlıya yazım ayrıca Recep'in kendi sözüyle (iki anahtar).

## Ölçüm — emrin sayısı neden değişti (canlı, 2026-09-22)

Karar 70'in çıkış sayısı: **255/442 üründe `description_i18n.tr` boş.** Müşterinin gördüğü şey farklı:

| | TR sayfa | EN sayfa |
|---|---|---|
| Kendi açıklaması boş ürün | 255 | 255 |
| Sayfada ne görünüyor | 251 → **aile metni** · 4 → hiçbir şey | 251 → **TÜRKÇE aile metni** · 4 → hiçbir şey |

- PDP `src/app/_components/ProductDetailPageView.tsx:425`: `selectedVariant.description ||
  pickLang(family.description, lang)`; `pickLang` (satır 124-128) `en → tr → en` düşer.
  Canlı kanıt: `/en/products/avens-nimax?sku=AVE-NX313290` → "Product Description" altında
  "Çelik gövdeli, direkt akuple…".
- TR'de hiçbir şey görünmeyen 4 ürün (avens-bvu-ls 2, avens-hiz-anahtarlari 2) **Recep kararı
  K7.10** ile bilerek yazılmadı (`icerik-hatti-taslak-kategori-rehber-2026-09-06.md:315`,
  `aile-metni-yaz.mjs` `BEKLENEN_AILE` yorumu). **Bu plan onlara dokunmaz.**

**Sonuç:** karar 70'in müşteriye görünen karşılığı TR boşluğu değil, **EN sayfada Türkçe metin.**

## Kapsam

| Kalem | Aile | Ürün | Not |
|---|---|---|---|
| A. EN aile metni (TR metni ONAYLI) | 16 | 184 | `is_description_manual=true` — TR metin K7.8 onaylı hattan geçti |
| B. EN aile metni (TR metni onay durumu BELİRSİZ) | 7 | 67 | avens-nimax · avens-nimus · vortice-vorticent-cms-atex · avens-enkelfan-ec-plug · avens-qe-b-kasa · avens-dikdortgen-kanal-radyal · seat-atex-ptc-sensor (`is_description_manual=false`; REC-226 kayıp-ürün aktarımıyla gelen aileler) |
| C. K7.10 — yazılmaz | 2 | 4 | avens-bvu-ls · avens-hiz-anahtarlari |
| D. Aile metninden AYRIŞAN ürün | ölçülecek | ölçülecek | aile metninin iddiası ürüne uymuyorsa (ör. ATEX / ATEX'siz aynı ailede, farklı IP) ürün-başı metin |

**B önce TR onayına gider:** onayı belirsiz TR metin çevrilirse kusur iki dile çoğalır. B'nin TR
metinleri önce Recep'e sunulur (mevcut K7.8 sunum kalıbı: `toplu-sunum.py`), sonra çevrilir.

**D'nin ölçümü (adım 1):** her ürün için aile metnindeki doğrulanabilir jetonlar (IP, ATEX, sayı,
birim — `taslak-kaynak-kapisi.py`'nin jeton kümesi) ürünün `technical_specs`'iyle çelişiyor mu.
Çelişen ürün D'ye girer. Sayı ölçülmeden tahmin yazılmaz.

## KAYNAK/CETVEL

- `docs/standards/vitrin-metni-standard.md` (K4.1 olumsuz iddia, K7 blok anahtarı, iç not yasağı).
  **EN metin için kural YOK** → yazımı bu işin kapsamında (adım 2): EN = onaylı TR'nin sadık
  çevirisi; TR'de olmayan hiçbir iddia EN'e girmez; sayı/kod/birim jetonları iki dilde birebir.
- `docs/standards/catalog-ingestion-standard.md` §6.3 — terim doğrulaması kaynak dizininden
  (üretici EN belgesi varsa terim oradan: ör. "forward curved impeller", "class F insulation").
- `scripts/icerik-hatti/taslak-kaynak-kapisi.py` — jeton kapısı dile bağlı değil (satır 9-10);
  EN metne de uygulanır.
- `scripts/icerik-hatti/aile-metni-yaz.mjs` — **`description.en`'e DOKUNMUYOR** (başlık yorumu:
  "EN turu ayrı iş"). Yazıcı genişletilir (adım 5).
- Karar 79 (bekliyor) — EN metin yokken PDP davranışı.

## YÖNTEM

OPS: "aynı motor — kaynak dizini → taslak CSV → Recep onayı → yazım; aile başına Sonnet + çürütme".
Uygulanışı: **aile başına 1 Sonnet çevirmen** (girdi: onaylı TR metin + ailenin kaynak dizini
sayfaları, yalnız terim için) + **aile başına 1 bağımsız çürütücü** (EN'deki her iddia TR'de var
mı, jetonlar birebir mi, yeni iddia var mı). Çevirmen ≠ çürütücü (döngü yok). Toplam 23 aile →
46 ajan (Workflow; karar 76'daki gibi Recep opt-in'i gerekir).

## Adımlar

1. **Ölç:** D kümesi (aile metni ↔ ürün teknik verisi jeton çelişkisi); B'nin TR onay geçmişi
   (git/Linear'da K7.8 onayı var mı).
2. **Cetvel:** `vitrin-metni-standard.md`'ye EN bölümü (sadık çeviri, jeton eşitliği, terim kaynağı).
3. **B'nin TR metinleri Recep'e** (7 aile) — onaylanırsa A'ya katılır.
4. **Taslak:** Workflow (çevirmen + çürütücü) → `paket/rec146-en-<damga>.csv` (aile, tr, en,
   jeton_tr, jeton_en, çürütme hükmü) + sunum dosyası.
5. **Yazıcı:** `aile-metni-yaz.mjs --dil en` — yalnız `description.en`; dolu EN'in üstüne yazmaz;
   `admin_audit_log`; kuru koşum varsayılan; test (sabotaj: TR'yi silmez, dolu EN'i ezmez).
6. **Recep onayı** → iki anahtarlı yazım → canlı ölçüm: 23 ailenin EN sayfasında Türkçe metin 0.
7. D kümesi için ürün-başı metin: ayrı tur, aynı motor.

## Kabul ölçütü

- EN sayfada Türkçe açıklama gösteren ürün: **251 → 0** (C'deki 4 hariç; karar 79'a göre).
- Her EN metin: jeton kümesi TR ile birebir; çürütücü hükmü "yeni iddia yok".
- TR metni ve bloklar değişmez (yazıcı testi).
- Yazım idempotent; audit satırı aile başına 1.

## Açık

| # | Soru | Kime |
|---|---|---|
| 79 | EN metin yokken PDP: TR göster mi, kartı gizle mi | Recep (OPS soruyor) — yapısal, URUN kodu |
| — | B'nin 7 ailesinin TR metni onaylı mı | ölçülecek (adım 1); değilse Recep'e sunum |
| — | Workflow opt-in (46 ajan) | Recep (karar 76 ile aynı tür) |
