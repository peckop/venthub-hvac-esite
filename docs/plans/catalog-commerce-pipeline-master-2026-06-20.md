# Katalog → Ticaret Veri Hattı — Master Plan (SSOT) — 2026-06-20

> **Bu dosya nedir?** "Katalog PDF'inden **satılabilir, doğru fiyatlı, sitede görünen ürüne**" giden hattın
> **uçtan uca tek planı + durum panosu.** Amaç: bu konu artık parça parça konuşulmasın — **nerede olduğumuz,
> hangi parça bitti/eksik, hangi sırayla inşa edileceği** tek yerde dursun.
>
> **SSOT disiplini:** Bu plan = **orkestrasyon/durum** katmanı. *Detayı tanımlamaz, cetvellere link verir:*
> - Yöntem (çıkarım/hakem/2-kademe) → `docs/standards/catalog-ingestion-standard.md`
> - CSV format → `docs/standards/csv-import-export-standard.md`
> - Fiyat kuralları → `docs/standards/pricing-standard.md`
> - Kategori/slug → `docs/standards/category-taxonomy-standard.md`
> - Canlı "neredeyiz" anlatısı → `docs/DURUM-TAKIP.md` (bu plan oraya id-ref verir, kopyalamaz)

---

## 1. Hat — 5 aşama, her biri nerede (2026-06-20 canlı doğrulama)

| # | Aşama | Ne yapar | Durum |
|---|---|---|---|
| 0 | **Kaynaklar** | Vortice spec + Avensair € fiyat (NLM defterleri + cetvel) | ✅ Hazır |
| 1 | **Kademe 1: PDF → flat CSV** | Worker (ingestor) görsel ajan → NLM hakem → CSV | ✅ **Pilot bitti** (`vortice-konut.csv`, 4 ürün) |
| 2 | **Kademe 2: CSV → DB** | Onaylı CSV'yi DB'ye yaz/zenginleştir (controller) | ❌ **YOK — inşa edilecek (Faz A)** |
| 3a | **Fiyat seçimi** | Rol/liste/indirime göre geçerli fiyatı oku | ✅ VAR (`pricing.service.ts` + `price_lists` + `product_prices`) |
| 3b | **Fiyat hesabı** | € alış → kur × KDV × kâr → satış (çok-para-birimi) | ❌ **YOK — inşa edilecek (Faz B)**; cetveli (`pricing-standard.md`) var, kodu yok |
| 4 | **Sitede gösterim** | Spec + fiyat + görsel + i18n | ⬜ 1–3'e bağlı |

---

## 2. DB gerçeği (canlı Supabase, 2026-06-20)

- **396 ürün**; **177'si (≈%45) fiyatsız** (`price` = 0/null). Eski "29 ürün × 46,83 sabit" durumu **geçti** (artık 206 farklı fiyat var; sabit 46,83 = 0).
- **Pilot 4 ürün** (`VRT-11313/11314/11333/11334`): DB'de **var**, kategori doğru (`residential-ventilation › banyo-ve-tuvalet-fanlari`), ama **spec/açıklama yüklü değil, fiyat 0.** → Kademe 2 burada **INSERT değil ENRICH.**
- **İlgili şema (loader & motor buna oturacak):**
  - `products`: `model_code` (köprü ✓), `sku` (`VRT-{kod}`), `technical_specs` **jsonb** (spec hedefi ✓),
    `description` **(tek alan — TR/EN ayrı değil!)**, `image_url`, `purchase_price` **(€ alış hedefi ✓)**,
    `price` (düz satış), `meta_title/description`, `supplier_name`. ⚠️ **`currency` kolonu YOK.**
  - `product_prices`: `base_price`, `sale_price`, `discount_percentage`, `price_list_id`, `valid_from/until`, `tenant_id`. (Motorun yazacağı yer.) ⚠️ **`currency` YOK.**
  - `price_lists`: `name`, `user_type` (rol), `effective_from/to`, `tenant_id`.

---

## 3. İki gerçek boşluk

### Boşluk 1 — Kademe-2 loader (CSV → DB)
Onaylı flat CSV'yi okuyup DB'yi güncelleyen kod **yok.** Hat şu an CSV'de tıkanıyor; hiçbir çıkarılan veri canlıya inmiyor.

### Boşluk 2 — Fiyat hesap motoru (€ → satış)
`pricing.service.ts` fiyatı **okur** ama **hesaplamaz.** € alış → kur/KDV/kâr → satış dönüşümü hiçbir yerde yok; `product_prices` çoğunlukla boş → ürünler düz `price`'a (0) düşüyor. **`pricing-standard.md` = bu motorun spec'i; kodu yazılmadı.** (doc var ≠ iş yapıldı.)

---

## 4. İnşa sırası (fazlar + bağımlılık)

### 🅰️ Faz A — Pilot loop kapanışı (Kademe-2 loader, en küçük uçtan-uca kanıt)
- **A1** — Loader akışı: onaylı CSV oku → `model_code`/`sku` ile DB ürünü bul → `spec_*` kolonlarını
  `technical_specs` jsonb'a **katla** → `description`, `image_url`, `purchase_price` (€), `avensair_kod`, atıf yaz.
  **Satış fiyatı HARİÇ** (Faz B). `--dry-run` varsayılan; hedef = adaptör (Supabase MCP bugün).
- **A2** — 4 pilot ürünü doğrula: DB'de spec+açıklama doldu mu, sitede göründü mü.
- **Bağımlı kararlar:** D1 (description TR/EN), D2 (purchase_price para birimi). Bkz §5.
- **Çıktı:** hat uçtan uca **kanıtlandı** (4 ürün); loader tekrar-kullanılır.

### 🅱️ Faz B — Fiyat hesap motoru (asıl değer; KENDİ alt-planı + onayı)
- **B0** — Tasarım (pricing-standard.md'den türet): girdiler (purchase_price €, TCMB kur, KDV %20, kâr marjı,
  rol bazlı liste), çıktı (`product_prices.base_price/sale_price`). Çok-para-birimi (USD/EUR/TRY) al-sat.
- **B1** — Şema ekleri: **`currency`** (products/product_prices'ta yok), kur kaynağı/önbelleği, KDV+marj config
  (settings ya da price_lists). Migration → prod (merge = oto-apply, dikkat).
- **B2** — Motor: `purchase_price`'ı olan ürünler için satış hesapla → `product_prices`'a yaz.
  `pricing.service.ts` zaten oradan okuyor → **doldurunca canlı fiyat otomatik gelir.**
- **B3** — 177 fiyatsız ürünü kapsa (yalnız pilot değil).
- **Not:** Bu faz "plan çıkar → onayla → kur" gerektirir (Recep kararı); A'dan bağımsız ilerleyebilir.

### 🅲 Faz C — Ölçek (kalan kataloglar)
- **C1** — Worker Kademe-1'i kalan kataloglara koşar (batch-batch); her biri 1 CSV.
- **C2** — Loader (A1) her CSV'yi DB'ye işler.
- A1 çalışınca açılır; B'den bağımsız (spec yüklemesi fiyatı beklemez).

### 🅳 Faz D — Taksonomi temizliği (paralel, bloklamaz)
- Türkçe alt-slug → İngilizce normalize, **301 redirect'li** (URL/SEO). → `category-taxonomy-standard.md` işi.
- İthalatı durdurmaz; istediğin zaman.

**Sıra mantığı:** **A** (küçük, ucuz uçtan-uca ispat) → sonra **B** (büyük değer, ayrı onay) ∥ **C** (ölçek) ∥ **D** (hijyen).

---

## 5. Açık kararlar — ✅ ÇÖZÜLDÜ (2026-08-11)

> Beş karar da `kademe2-clean-rebuild-2026-08-11.md` §0b'de cetvel referanslarıyla kapatıldı:
> D1=JSONB i18n (family.description {tr,en}) · D2=EUR as-is + purchase_currency · D3=base TRY,
> USD/EUR vitrin Fiyat Motoru fazında · D4=materialize cache (product_prices) · D5=taksonomi bitti,
> 4 yeni kategori F2 migration'ında. Ayrıca kullanıcı kararı: mevcut 388 ürün + test siparişleri
> **tasfiye**, Kademe-2 artık ENRICH değil **temiz yeniden kuruluş** (şema-önce, PS Wave 1-3 dahil).

| # | Karar | Seçenekler / not (tarihsel) |
|---|---|---|
| **D1** | `description_tr` + `description_en` DB'de nereye? | `products.description` tek alan. i18n kuralı = çeviri JSONB (`metadata->>lang`) ama products'ta öyle bir kolon yok. → (a) description=TR + EN'i yeni JSONB/kolona, (b) technical_specs içine, (c) çeviri tablosu. |
| **D2** | `purchase_price` para birimi? | `products.purchase_price` var ama **currency yok.** → (a) € as-is sakla + `currency` kolonu ekle (temiz, B1 ile uyumlu), (b) load'da TRY'ye çevir (kur'a bağımlı, geri-dönülmez). Öneri: (a). |
| **D3** | Çok-para-birimi gösterim | Müşteri yalnız TRY mi görür, USD/EUR/TRY seçmeli mi? (Faz B kapsamı/şeması.) |
| **D4** | Satış fiyatı saklanan mı, anlık mı? | (a) hesapla→`product_prices`'a yaz (stabil, hızlı; kur değişince yeniden hesap), (b) anlık canlı kur (her okumada). Mimari seçim. |
| **D5** | Taksonomi normalize zamanı | Şimdi mi (Faz D), full-load sonrası mı? |

---

## 6. İlişki / SSOT

- **Cetveller (detay SSOT):** catalog-ingestion-standard · csv-import-export-standard · pricing-standard · category-taxonomy-standard.
- **Worker tarafı:** `venthub-pdf-ingestor` (`GOREV-katalog-ice-alim.md`, `00-AJAN-OKU.md`, skill `venthub-catalog-importer`).
- **Kod:** `src/lib/services/pricing.service.ts` (fiyat seçici — Faz B bunu besler).
- **memory:** `catalog-ingestion-system` · `pricing-currency-requirements` · `category-taxonomy-state` · `doc-committed-not-work-done`.
- **Durum anlatısı:** `docs/DURUM-TAKIP.md` (bu plan oraya id-ref verir).

---

> 2026-06-20 · v1.0 · Bu hattın tek planı. Aşama durumları değiştikçe **burada** güncellenir (parça parça konuşma yerine).
