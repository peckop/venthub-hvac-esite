# İçerik hattı — katalog metni boşluğu: alan sayısı değil, müşterinin gördüğü (2026-09-25)

**Sahip:** URUN-KATALOG · **Kayıt:** REC-146 (çatı REC-206) · **Tetik:** Recep önceliği 2026-09-25
(REC-206 yorumu fd959ca2): "katalog metni EN/TR + teknik açıklama önce; görsel ve fiyat geri planda".
**Cetvel:** `vitrin-metni-standard.md` (müşteriye görünen metin), `catalog-ingestion-standard.md` §6.3
(kaynak dizini), `i18n-localization-standard.md` (dil düşüşü). Yöntem emsali: karar 70 planı
`docs/plans/rec146-karar70-aciklama-2026-09-22.md` (kip `en`: onaylı TR'nin sadık çevirisi + jeton kapısı).

## 1. Neden yeniden ölçüldü

Katalog karnesi alanın DB'de dolu olup olmadığını sayar: "EN adı 24/442", "ürün açıklaması 187/442",
"kategori metni 24/31". Bu sayılar **müşterinin ne gördüğünü söylemez**, çünkü vitrin boş alanı
başka bir kaynağa düşürür. Karar 70'ten (2026-09-23) sonra aile metni TR/EN 47/47 dolu; kendi açıklaması
olmayan ürün, ailesinin metnini gösterir (`ProductDetailPageView`, `selectedVariant.description ||
pickLang(family.description, lang)`). Aynı şekilde EN adı olmayan ürün, TR adını gösterir.

Ölçüm betiği salt okur (scratchpad, canlı DB, service_role SELECT); vitrin örnekleri `curl` ile
alındı (2026-09-25 ~08:40Z).

## 2. Ölçüm

| Alan | Karnenin sayısı | Müşterinin gördüğü (aktif 441 ürün, 31 kategori) |
|---|---|---|
| Ürün açıklaması | TR 187 / EN 187 | **Metinsiz ürün 0.** 187'si kendi metnini, 254'ü aile metnini gösteriyor; TR ve EN ikisinde de. |
| Ürün EN adı | 24 / 442 | EN adı olmayan 417 ürünün **251'i dile bağlı olmayan model adı** (ör. `Vortice MP 354 T`), çeviri gerekmez. **166'sı EN sayfada Türkçe biçim taşıyor.** |
| Kategori metni | TR 24 / 31 | Aktif ürünlü 24 kategorinin **24'ünde TR var**; metinsiz 7'si pasif ve ürünsüz. **EN: 0 / 31.** EN kategori sayfasında paragraf yok, arama motoru açıklaması genel şablon ("Explore the highest quality…"). |

### 2.1 EN adındaki Türkçe biçim (166 ürün, kümeler kesişir)

| Biçim | Ürün | Marka | Örnek |
|---|---|---|---|
| `d/dk` (devir/dakika) | 80 | SEAT 80 | `SEAT 15 · 1400 d/dk · 0,18 kW · 380V` |
| ondalık virgül | 162 | SEAT 77 · AVenS 39 · Vortice 38 · Danfoss 8 | `AVenS-HF/FW 7/7 1,1 kW` |
| Türkçe kelime | 2 | AVenS 2 | `AVenS 5 A HIZ ANAHTARI` |

EN adı dolu 24 üründe emsal var: `AVenS 750 ISI GERİ KAZANIM CİHAZI → AVenS 750 Heat Recovery Unit`.

### 2.2 Yan bulgu (URUN, bu işin dışında)

EN "bulunamadı" sayfası (`/en/<olmayan-adres>`) menü ve alt bilgiyi Türkçe basıyor (sunucu HTML'i:
"İletişim" 3, "Hakkımızda" 2, başlık `VentHub - Endüstriyel Havalandırma`). Gerçek EN sayfalar
(ana sayfa, kategori, ürün, hakkımızda) temiz. OPS'a bildirildi.

## 3. Plan

Sıra, müşteriye etkisine göre. Her iş müşteriye görünen metindir: **yazım Recep'in sözüyle**, örnekler
yazımdan önce ona gösterilir. Yazım betikleri iki anahtarlı (`--yaz` + `CANLI_YAZIM_ONAYI`), yedekli,
geri okumalı; her yazımdan sonra katalog paketi yeniden üretilir (§6.7).

| # | İş | Yöntem | Kaynak | Çıktı / bitti ölçütü |
|---|---|---|---|---|
| 1 | **24 kategorinin EN metni** | Karar 70 kip `en`: onaylı canlı TR'nin sadık çevirisi (alt ajan), ikinci ajan çürütür, `en-jeton-kapisi.py` (sayı/birim/kod eşitliği) YEŞİL. `kategori-metni-yaz.mjs` bugün yalnız TR yazıyor → `--dil en` eklenir (test + sabotaj). | Canlı TR paragraf (Recep "yaz", PR #1096) | EN kategori metni 24/24; EN sayfada paragraf görünür (curl) |
| 2 | **166 ürünün EN adı** | Kural, çeviri değil: `d/dk` → `rpm`, ondalık virgül → nokta, `HIZ ANAHTARI` → kategori EN adı "Speed Controller" (canlı `speed-controllers` kategorisi). Deterministik betik, `name_i18n.en`'e yazar; ad DEĞİŞMEZ (TR sayfa aynı kalır). Yeni yazıcı gerekir (bugün `name_i18n` yazan betik yok). | Canlı TR ad; dönüşüm kuralı tablosu | 166/166; karnede "EN'de Türkçe biçim taşıyan ad 0" satırı |
| 3 | Ürüne özel açıklama | **İş yok** (boşluk değil). Aile metni seri düzeyinde tasarım gereği (REC-146 09-22 hükmü). Ürüne özel metin ancak ürün ailesinden ayrıştığında; Recep isterse ayrı iş. | — | — |
| 4 | Karne düzeltmesi | Karneye "müşterinin gördüğü" satırları eklenir (metinsiz ürün, EN'de Türkçe biçimli ad, EN metinsiz aktif kategori) ki sayı yanıltmasın. | — | karne satırı + test |

**Sınırlar:** kaynağı olmayan cümle yazılmaz; EN metin TR'de olmayan iddia taşımaz (jeton kapısı).
Pasif 7 kategori kapsam dışı. `bloklar_en` bu işin dışında (REC-164 render yok).

## 4. Açık soru

`HIZ ANAHTARI` için EN terim: "Speed Controller" (kategori adı) ile üreticinin kendi EN terimi
farklıysa üreticinin terimi kazanır — AVenS EN kaynağı dizinde yoksa kategori adı kullanılır ve bu
belgeye yazılır.
