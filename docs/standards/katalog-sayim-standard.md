# Katalog Sayımı Standardı — sayısal iddia nereden gelir

**Kapsam:** kataloğa dair **sayısal** her iddia (ürün, aile, kategori, marka, doluluk,
boşluk). Panoya, Linear'a, PR gövdesine, Recep'e giden rapora yazılan sayılar.
**Kapsam dışı:** yargı gerektiren sorular ("bu ürün doğru dalda mı") — onlar karardır,
sayı değil.

**Araç:** `scripts/katalog/katalog-sayim.mjs`

---

## 0) Niçin var — ölçülmüş olay (2026-09-04)

Recep: *"ölçümler hem tekrar hem hatalı, bu nasıl iş."* Aynı gün aynı katalog soruları
elle yazılmış farklı SQL'lerle **dört kez** soruldu ve **üçü yanlış** çıktı:

| İddia | Gerçek | Yanlışın sebebi |
|---|---|---|
| "624 önek-eksik galeri alt metni" | Gerçek kusur **6 satır** | Ölçüt "ad öneki" değil "SKU tam dizesi"ni ölçüyordu |
| "375 ürünün tamamı kökte" | **365**'i alt dalda | Yalnız `category_id`'ye bakıldı; ağaç `subcategory_id`'de |
| Kök başına ürün sayısı | Anahtar sayısı raporlandı | `jsonb_each_text` satır çoğalttı, `count(*)` ürünü saymadı |

Üçü de tek başına dikkatsizlik görünür. **Üçü birden bir sistem kusurudur:** sayının
üretildiği yer her seferinde yeniden icat ediliyordu. Biri "624 satırlık prod yazımı",
biri "375 kalemlik eşleme işi" olarak **iş emrine** dönüşmüştü — yani yanlış sayı, yanlış
işi doğurdu.

---

## 1) Kural

> **Sayısal bir katalog iddiası, `docs/audits/katalog-sayim-<tarih>.md` tablosunu kaynak
> göstermeden yapılmaz.** Elden yazılan SQL yalnız **keşif** içindir; karara giden sayı
> betikten gelir.

Yeni bir katalog sorusu doğduğunda cevabı PR gövdesine SQL olarak yazılmaz — **betiğe
sayım olarak eklenir.** Böylece soru bir kez doğru çözülür ve bir daha icat edilmez.

## 2) Sayım sözleşmesi — iki tuzak, sorguya gömülü

1. **Ağaç ataması `subcategory_id`'dedir**; `category_id` yalnız **kökü** taşır.
   Yalnız birine bakan sorgu yanlış cevap verir.
2. **`jsonb_each_text` satır ÇOĞALTIR.** O birleşimde `count(*)` ürünü değil **anahtarı**
   sayar; ürün gereken yerde `count(DISTINCT ...)` yazılır.

Bu ikisi yorumda değil **sorgunun kendisinde** yaşar — yorum, kopyalanan sorguyla birlikte
gitmez.

## 3) Betiğin arayüzü (sözleşme)

| | |
|---|---|
| **Yol** | `scripts/katalog/katalog-sayim.mjs` |
| **Bağlantı** | `SUPABASE_DB_URL` (yoksa `DATABASE_URL`) |
| **TLS kökü** | `PGSSLROOTCERT` → `scripts/db/checks/supabase-root-2021-ca.pem` |
| **Bayraklar** | `--json` (stdout JSON) · `--yaz` (dosyaya yaz) |
| **Çıktı (`--yaz`)** | `docs/audits/katalog-sayim-<YYYY-MM-DD>.md` **ve** `.json` |
| **Çıkış 0** | Sayım üretildi |
| **Çıkış 1** | Bağlantı yok **veya** sorgu hatası — **sayı üretilmez** |

⭐**FAIL-CLOSED, bilerek:** bağlantı yoksa betik boş tablo ya da "0 kayıt" **döndürmez**,
çıkış 1 verir. Yoklukla ölçmek, bu betiğin düzeltmek için yazıldığı hatanın ta kendisidir.
Bunu koşan iş akışı da aynı kuralı taşımalı: **bağlantı yoksa job KIRMIZI**, "atlandı" değil.

## 4) Bu bir KAPI değil, SAYAÇ

Betik kırmızı vermez, sayı üretir. "Bu ürün doğru dalda mı" gibi **yargı** soruları
bilerek ölçülmez — ölçülseydi var olmayan bir kapı sanılırdı ve sahte güvence üretirdi.
Kapılar ayrı yaşar (`catalog-integrity.mjs`).

## 5) Çıktının ömrü

Tablo **tarihlidir ve bayatlar.** Bir sayıyı kaynak gösterirken **tarihi birlikte**
yazılır. Bayat tabloya dayanan iddia, ölçülmemiş iddiadır.

## 6) İlgili

- `scripts/db/checks/catalog-integrity.mjs` — katalog **kapısı** (kardeş, karıştırılmasın)
- `docs/standards/product-schema-standard.md` — `technical_specs` sözleşmesi
- `docs/standards/matris-gorunum-standard.md` — doluluk sayılarının tüketicisi
- `docs/standards/measurement-discipline-standard.md` — ayırt edicilik kuralı
