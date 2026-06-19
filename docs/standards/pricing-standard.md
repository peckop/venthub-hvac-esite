# VentHub Fiyatlandırma Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** "Bir satış sitesinde fiyat nasıl kurulur?" sorusunun **karar veren cetveli.**
> Alış fiyatı + satıcı kârı; **üründe / markada / kategoride farklılaşan** marj; çoklu-para-birimi (USD/EUR/TRY)
> al-sat + ayarlanabilir parite + çapraz çevrim; KDV'li/KDV'siz satış — hepsi **admin-konfigüre.**
> Dünya-standardı e-ticaret platformlarının (Odoo, SAP, Salesforce CPQ, Magento, Shopify, BigCommerce)
> mekanikleri araştırılıp VentHub'ın **canlı şemasına** ve bayi yol haritasına (`dealer-module-blueprint.md`
> R0–R5→B1–B2) oturtuldu.
>
> **Neden var?** Bugün fiyat **amatör**: `product_prices` = 0 satır, çözücü bozuk (staff-rolünü segmente
> bağlıyor → her ürün düz `products.price`), currency/kur/KDV/kâr alanı yok. Bu cetvel, full ürün
> yüklemesinden **önce** kurulması gereken omurgayı tanımlar.

---

## 1. Temel model — üç katman (karıştırma)

Fiyat tek bir sayı değil, **üç katmanın** üst üste binmesidir. Hangi katmanda olduğunu bilmeden tartışma çıkmaz.

| # | Katman | Ne yapar | "Standart/sabit" mi? | Durum |
|---|---|---|---|---|
| **1** | **Maliyet-artı marj motoru** | Alış (orijinal para) × kur × (1+marj) [+KDV] → **liste/base satış fiyatı**. Marj ürün/marka/kategori/global önceliğiyle çözülür. | Otomatik (kur bile elle ezilebilir) | **YOK — bu cetvelle kurulacak** |
| **2** | **Segment overlay** (fiyat listesi) | Perakende/bayi/kurumsal **tier**'a göre farklı fiyat/iskonto. Mevcut `price_lists`/`product_prices`. | Admin kurar, kademeli | **VAR ama bozuk** → R0–R5 onarır |
| **3** | **Teklif (CPQ)** | B2B pazarlıklı satış: RFQ→Teklif→Sipariş, 8 fiyat kademesi, onay eşiği. | **Hayır — teklif başına karar** | YOK (dealer §5'te spec'li, gelecek faz) |

**Altın kural:** Fiyat **TÜRETİLİR, elle yazılmaz.** Maliyet-artı ürünlerde satış fiyatı motorun çıktısıdır;
saklanan değer bir **materialize cache**'tir (maliyet/kur/marj/KDV değişince yeniden hesaplanır). Bu, bugünkü
düz `products.price` (elle-yazılı tek TL) modelinin **tam tersi** ve Magento/Shopify/BigCommerce/Woo'nun
amatör tarafından ayrıldığımız nokta — onlarda maliyet pasif bir rapor alanı, fiyat elle yazılır.

---

## 2. Maliyet tabanı (cost basis)

- **Alış para-birimi başına, zaman-versiyonlu.** Cost tek bir TL sabiti DEĞİL: `(product, currency)` başına
  alış tutarı + **alındığı andaki kur snapshot'ı.** (Salesforce CPQ per-currency cost satırları deseni.)
- Mevcut `products.purchase_price` (tek alan) yetersiz → genişlet (bkz §10): `purchase_currency` +
  `purchase_rate_to_base` (snapshot) + türetilmiş `cost_in_base` (donmuş TL maliyet).
- **İki kur rolü asla birleşmez** (§4): *tedarik kuru* (alış→TL maliyet, alışta snapshot) ile *gösterim kuru*
  (TL base→USD/EUR vitrin, canlı) **farklı sayılardır.**

---

## 3. Marj kuralı motoru + ÖNCELİK merdiveni ⭐ (cetvelin kalbi)

Senin sorunun cevabı: **"marj üründe/grupta/markada nasıl farklılaşır?"** → tek bir kural motoru + en-özel-kazanır merdiveni.

### 3.1 Öncelik (specificity) merdiveni — en özel kazanır
Bir ürüne birden çok kural uyduğunda **en özel olan kazanır, ilk eşleşmede durur** (Odoo `applied_on` +
SAP `Exclusive` stop-at-first-hit deseni):

```
scope 0  ürün varyantı     (en özel)
scope 1  ürün
scope 2  MARKA              ← HVAC için birinci sınıf (Vortice vb.); incumbent'lerde yok
scope 3  kategori/grup      (hiyerarşik — alt kategorilere CASCADE eder)
scope 4  global varsayılan  (en genel)
```

**Sıralama anahtarı:** `scope ASC, (dealer-kitabı önce), min_quantity DESC, priority DESC, id DESC` → ilk satır kazanır.

### 3.2 Bu merdiven "üründe/markada/kategoride farklılaşma"yı bedavaya çözer
- **"X kategorisindeki tüm ürünler %35 marj"** = TEK kural `{scope:3, category_id:X, margin_pct:35}`. Alt
  kategorilere materialized-path ile cascade eder. Ürün başına satır gerekmez.
- **"Y markası %40"** = TEK kural `{scope:2, brand_id:Y, margin_pct:40}`. X kategorisinde + Y markasında bir
  ürün → **marka (scope 2) kategoriyi (scope 3) yener** → otomatik %40.
- **Ürüne özel override** = `{scope:1, product_id:P, margin_pct:28}` → hem markayı hem kategoriyi yener,
  onlara dokunmadan. Silinince anında marka/kategori kuralına geri-cascade.
- **Admin UX:** ürün başına **etkin** marjı gösteren bir matris + hangi kuralın kazandığı rozeti
  ("kategori varsayılanı %35" vs "ürün override %28") → admin cascade'i görür, satır-içi ezer. Incumbent'lerin
  düz per-SKU editöründen ayıran enterprise fark budur.

### 3.3 Hesap modu (Odoo `compute_price`/`base` + Salesforce method)
Kural başına: `method ∈ {cost_plus, fixed, percent_off_list}`, `base ∈ {cost, list_price, parent_book}`,
`margin_pct` (cost-plus markup), `surcharge` (sabit ek), `fixed_price`, marj tavanı/tabanı (`min/max_margin`).

---

## 4. Para birimi + parite (çoklu-para, çapraz, ayarlanabilir)

- **Base (operasyon/muhasebe) para birimi = TRY.** Fatura, KDV, tahsilat TL; muhasebe gerçeği TL.
- **İki ayrı kur rolü (birleştirme):**
  1. **Tedarik kuru** (alış→TL maliyet): alış kaydedildiğinde **TCMB Döviz Satış** snapshot'lanır, donar.
  2. **Gösterim kuru** (TL base→USD/EUR vitrin): canlı TCMB + admin **spread** (marka payı), yuvarlamadan önce.
- **Çapraz işlem** (EUR alış → TL veya USD satış): EUR maliyet → ×tedarik_kuru → TL maliyet → ×(1+marj) → TL net
  → vitrin için TL→USD canlı çevrim. **Marj TEK para biriminde (TL) bir kez hesaplanır** — EUR'da ve TL'de iki
  kere hesaplanırsa iki farklı cevap çıkar.
- **Kur kaynağı = TCMB** (`https://www.tcmb.gov.tr/kurlar/today.xml`): hafta sonu/tatil **404** döner → **son
  kuru taşı** (sıfırlama/hata yok); iş günü kuru **~15:30 sonrası** yayınlanır → cron 15:30 sonrası.
- **`currency_rates` tablosu append-only:** `(base_ccy, quote_ccy, rate, spread_pct, source, effective_date,
  fetched_at)`. **Elle ezme = yeni satır** (`source='manual'`, daha yüksek öncelik) — yerinde mutasyon YOK
  (denetim izi korunur). Bu, "ayarlanabilir parite" gereksinimini denetlenebilir kılar.
- **Sipariş anında kur DONDURULUR:** order satırına kullanılan **kur skaler olarak kopyalanır** (FK değil) →
  geçmiş sipariş toplamları sonradan kaymaz. (Tarihsel-kur yöntemi, evrensel muhasebe standardı.)

---

## 5. KDV (%20) — net sakla, çift mod

- **Tek gerçek = NET (KDV-hariç) fiyat.** Marj net üzerine, KDV netin üstüne biner; net tek rate-stabil ve
  iade-edilebilir figür. Gross'tan net türetmek (`gross/1.20`) her okumada yuvarlama kaybı doğurur.
- Formüller (faktör 1.20): `gross = net × 1.20` · `net = gross / 1.20` · `kdv = net × 0.20`.
- **Sıra: maliyet → +marj → NET → +KDV → GROSS.** KDV asla marj hesabına girmez (devlete pass-through, gelir değil).
- **Çift mod (B2C vs B2B):**
  - **B2C (tüketici):** **KDV-dahil (gross)** göster (Türk perakende konvansiyonu + yasal "etiket = ödenecek").
  - **B2B (bayi/Avensair):** **KDV-hariç (net)** göster; KDV faturada **ayrı satır** (Türk yasası: ticari
    faturada KDV tutarı ayrı gösterilmek zorunda; e-Fatura/e-Arşiv XML toplamlarıyla **birebir** uyuşmalı).
  - Tek `display_tax_mode = inclusive|exclusive` bayrağı aynı saklanan net üzerinden audience'a göre render eder.

---

## 6. Yuvarlama (per-currency, en SON)

- **Para tamsayı-minor saklanır** (kuruş/cent ×100); float YASAK (0.1 binary'de temsil edilemez, hata birikir).
  Precision ISO 4217'den (minor-unit exponent) türetilir, 2 sabitlenmez.
- **En son, her para sınırında bir kez yuvarla** (round-half-up). Tam precision'ı zincir boyunca taşı, yalnız
  saklanan/gösterilen para değerine inerken yuvarla.
- **Charm/yuvarlama per-kategori/per-tenant POLİTİKA** (global sabit değil): premium ürün yuvarlak (₺100),
  perakende `,90`/`,95`. Tüm maliyet/marj/iskonto matematiğinden **sonra** uygulanır.
- **e-Fatura mutabakatı:** `gross = net + yuvarlanmış_KDV` (gross'u bağımsız yuvarlama, yoksa net+kdv≠gross →
  XML reddi). Satır-bazında yuvarla, sonra topla; tolerans dokümante et.

---

## 7. Hesaplama hattı (kesin sıra — tek doğru)

```
1. purchase_price (EUR, minor int)                         [saklı, kesin]
2. × tedarik_kuru (EUR→TRY, snapshot, yüksek precision)    → cost_in_base (TL, yuvarlama YOK)
3. × (1 + margin_pct)   [marj kuralı motoru §3'ten]        → net_sale_base (TL, tam precision)
4. YUVARLA #1 → net_unit (TL kuruş)   [+ ops. charm snap]  ← ilk para sınırı
5. kdv = YUVARLA(net_unit × 0.20)  ;  gross = net_unit + kdv   (gross yeniden yuvarlanmaz)
6. Vitrin (USD/EUR): zaten-yuvarlanmış base'i çevir:
     net_present = YUVARLA(net_unit × gösterim_kuru × (1+spread))
7. Fatura toplamı = Σ yuvarlanmış satır net + Σ KDV + Σ gross.
```
TL faturası **yasal otorite**; USD/EUR açıkça "tahmini" gösterim.

---

## 8. Segment overlay — mevcut `price_lists`/`product_prices` (R0–R5 onarır)

- **Bu katman ZATEN VAR ama bozuk.** `price_lists` (3 satır, `user_type` segment) + `product_prices`
  (**0 satır**) + `organizations.tier_level`. Çözücü `user_profiles.role`'u (staff-yetkisi) segmente bağlıyor →
  asla tutmuyor → düz `products.price`.
- **Doğru sözleşme:** segment = `organizations.tier_level` (role DEĞİL). `user → organization → tier_level →
  price_list → product_prices` → bulunamazsa maliyet-artı motor çıktısı (§3). (Karar: dealer-blueprint §2, B-minimal.)
- **`product_prices` = motor çıktısının materialize cache'i:** `(product, price_list, currency)` başına net+gross.
  Motor yazar, çözücü okur. Boş tablonun anlamı buydu — seed (B2) bu cache'i doldurur.
- **RLS segment daraltması (R5, B2'den ÖNCE zorunlu):** `price_lists`/`product_prices` SELECT'ine segment
  koşulu; yoksa bayi fiyatı anon'a sızar.

---

## 9. Teklif (CPQ) katmanı — referans, gelecek faz

Asıl B2B satış burada (`dealer-network-standard.md §5/§6`): **RFQ → Teklif (temsilci pazarlık) → Sipariş.**
8 fiyat kademesi (Liste→Normal→Müşteri→Partner→Net), **onay eşiği** (marj/iskonto sınırını aşan teklif çok-seviyeli
onaya), monoton durum, proje/BOM (MTO→BOQ→BOM). **DB'de teklif tablosu YOK** → ayrı faz. Bu cetvelin katman 1–2'si
teklifin **girdi fiyatını** üretir; teklif onları pazarlıkla ezer.

---

## 10. Veri modeli (öneri — canlıya additive)

```sql
-- Maliyet (para-birimi-spesifik, zaman-versiyonlu). products genişletilir veya ayrı tablo:
ALTER TABLE products ADD COLUMN purchase_currency char(3);          -- 'EUR'|'USD'|'TRY'
ALTER TABLE products ADD COLUMN purchase_rate_to_base numeric(18,6);-- alışta snapshot TCMB
ALTER TABLE products ADD COLUMN cost_in_base numeric(14,4);         -- türetilmiş, donmuş TL
-- (margin_pct ürün-bazlı override pricing_rule scope:1 ile; products'a koyma — motor SSOT)

-- Marj kuralı motoru (Odoo pricelist.item + scope specificity + SAP exclusive)
CREATE TABLE pricing_rule (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  price_book_id uuid NULL,           -- NULL=base kitap; dolu=bayi/segment overlay
  scope smallint NOT NULL,           -- 0 varyant 1 ürün 2 marka 3 kategori 4 global
  product_id uuid NULL, brand_id uuid NULL, category_id uuid NULL,
  method text NOT NULL,              -- 'cost_plus'|'fixed'|'percent_off_list'
  base text NOT NULL,                -- 'cost'|'list_price'|'parent_book'
  margin_pct numeric, surcharge numeric, fixed_price numeric,
  vat_rate_pct numeric DEFAULT 20, price_is_vat_inclusive boolean DEFAULT false,
  min_margin_abs numeric NULL, max_margin_abs numeric NULL,
  round_to numeric NULL, charm_ending numeric NULL,
  min_quantity numeric DEFAULT 1, priority int DEFAULT 0, is_exclusive boolean DEFAULT true,
  currency char(3) NULL,             -- NULL=tüm para birimleri
  valid_from date, valid_to date, updated_at timestamptz, updated_by uuid
);

-- Parite (append-only; elle ezme = yeni yüksek-öncelik satır)
CREATE TABLE currency_rates (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  base_ccy char(3) DEFAULT 'TRY', quote_ccy char(3) NOT NULL,
  rate numeric(18,6) NOT NULL, spread_pct numeric DEFAULT 0,
  source text NOT NULL,              -- 'tcmb'|'manual'
  effective_date date NOT NULL, fetched_at timestamptz
);

-- Mevcut: price_lists (segment kitabı) + product_prices (materialize cache) — R0–R5 onarır, yeni kolon:
ALTER TABLE product_prices ADD COLUMN currency char(3) DEFAULT 'TRY';
ALTER TABLE product_prices ADD COLUMN net_price numeric, ADD COLUMN gross_price numeric, ADD COLUMN is_derived boolean DEFAULT true;
```
**Sabit kimlikler (blueprint §1):** tenant `d3b07384-…`; price_list individual/dealer/corporate `d9d138d8`/`d97fff9d`/`b3a14f1a`.

---

## 11. Çözümleme algoritması (deterministik, izlenebilir)

```
resolvePrice(supabase, product, qty, currency, userCtx):
  book = pickPriceBook(userCtx.tier_level)            # bayi kitabı varsa, yoksa base
  cost = lookupCost(product, currency)                # para-spesifik alış→TL maliyet
  rules = pricing_rule.where(tenant, book IN [book,BASE], currency IN [currency,NULL],
                             min_quantity<=qty, today IN [valid_from,valid_to], matchesScope(product))
  rules.sort(scope ASC, bookRank ASC, min_quantity DESC, priority DESC, id DESC)
  chosen = first exclusive match                      # SAP stop-at-first-hit
  p = computeBase(chosen, cost) + surcharge           # cost_plus: cost*(1+margin/100)
  p = clampMargin(p, cost, min/max_margin)
  (net, gross) = applyVat(p, vat_rate, inclusive?)
  return roundPerCurrency(net/gross, currency, round_to, charm)   # EN SON
# matchesScope: kategori → ürün.kategori veya path STARTSWITH (alt-cascade); marka → ürün.brand; vb.
```
**İzlenebilirlik zorunlu:** "hangi kural neden kazandı" trace'i (admin debug + güven).

---

## 12. Admin panel (B1 — `admin-standard.md` K1–K5'e uyar)

- **Ayarlar:** para birimleri, parite (oto TCMB + elle ezme + spread), KDV oranı + dahil/hariç modu, varsayılan
  yuvarlama/charm politikası.
- **Marj kuralları:** scope (ürün/marka/kategori/global) bazlı kural CRUD + **etkin-marj matris önizleme**.
- **Ürün başına:** alış + para birimi + (ops.) marj override + her para biriminde **canlı hesaplanan satış** önizleme.
- **K1–K5 zorunlu:** jenerik table-kit (K1), URL-state (K2), RBAC 3-katman + sunucu RLS (K3),
  `logAdminAction` gerçek-yazma (K4), 5 durum (K5). §8 skoru ≥20/24.

---

## 13. Zorunlu kurallar (CLAUDE.md + standartlar)

| Kural | Kaynak |
|---|---|
| `lib/services/*` ilk param `supabase: SupabaseClient<Database>` (DI) | CLAUDE.md §2 |
| `any` yasak, strict TS | §3 |
| Tüm okuma/yazma **tenant-scoped** (`tenant_id = jwt_tenant_id()`) | §12 |
| Yetki/segment **app_metadata**'dan (asla `user_profiles.role`/`raw_user_meta_data`) | §12 |
| Sipariş satırında **6 snapshot alanı** dolu (unit/list_id/name/sku/tax_rate/product jsonb) | blueprint §R3 |
| Idempotent seed: sabit `valid_from` + `ON CONFLICT DO NOTHING` | blueprint §B2 |
| Sipariş/teklif durumu **monoton** | §11 |
| Marj/iskonto eşiği aşımı → çok-seviyeli onay | dealer §5 |

---

## 14. Enforcement (cetvel + onu zorlayan test)

Standart-artı-zorlayan-test = kontrol. Eklenecek INV-* conformance testleri:
- **INV-PRICE-1:** `products.price` hiçbir müşteri-yüzeyi kod yolunda **doğrudan** okunmaz (motor/çözücü
  üzerinden) — düz-fiyat regresyonunu kilitler.
- **INV-PRICE-2:** çözücü `user_profiles.role`'u segment için okumaz (app_metadata/tier_level) — eski hata geri gelmez.
- **INV-PRICE-3:** sipariş-item yazan her yol 6 snapshot alanını doldurur (no-op = FAIL).
- **INV-PRICE-4:** para float saklanmaz (numeric/minor-int); `currency_rates` append-only (UPDATE policy yok).

---

## 15. Build sırası (R0–R5 ile entegre — Recep "önce temel onarım" seçti)

```
F0  Maliyet+parite temeli: products kolonları + currency_rates + TCMB günlük job (cron 15:30, 404-carry)
F1  Marj motoru: pricing_rule tablosu + resolvePrice() (DI, app_metadata) + materialize → product_prices
    ↳ bu, blueprint R2 (çözücü yeniden-yaz) ile aynı yere iner; ölü order-validate + çift-const + _text() onarılır
R0–R5 (blueprint): tablo versiyonla / kimlik (org-tier) / çözücü tek sözleşme / sipariş snapshot / tenant RLS / segment RLS
F2  Admin paneli (B1): ayarlar + marj matris + ürün fiyat önizleme (K1–K5)
F3  Seed (B2): product_prices'ı motorla doldur (idempotent); 29 borç-ürünü modele oturt (€ alış)
F4  Eski 359 ürünü modele geçir (alış+para+marj-kural); düz products.price emekli
F5  (Gelecek) Teklif/CPQ hattı: quotes/quote_items, RFQ→Teklif→Sipariş, 8 kademe, onay eşiği
```

---

## 16. Provenance

Araştırma: 3 paralel ajan — (1) cross-platform cost-plus mimarisi (Odoo `product_pricelist_item` formül motoru +
`applied_on` merdiveni, SAP condition-technique/Exclusive stop-at-first-hit, Salesforce CPQ `PricingMethod=Cost`,
Magento/Shopify/BigCommerce/Woo "native cost-plus YOK" boşluğu), (2) çoklu-para + KDV (base-TRY, iki kur rolü,
TCMB today.xml, net-sakla, e-Fatura yuvarlama), (3) VentHub canlı yer-gerçeği (`pricing.service.ts`,
`order-validate`/`iyzico-payment` bug'ları, `price_lists`/`product_prices`/`organizations` şema, R0–R5 roadmap,
admin K1–K5). Zemin: `dealer-network-standard.md`, `dealer-module-blueprint.md`, `admin-standard.md`,
memory `pricing-currency-requirements`. Kaynaklar ajan çıktılarında atıflı (Odoo 17 source, SAP Learning,
Salesforce Help, Adobe/Shopify/BigCommerce docs, TCMB, PwC Türkiye KDV, ISO 4217).

---

> v1.0 · 2026-06-19 · İlk sürüm (araştırma + sentez). Değişiklikte sürüm yükselt + provenance güncelle.
