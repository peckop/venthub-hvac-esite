# Kademe-2: Temiz Yeniden Kuruluş — Şema-Önce + CSV Yükleme (Birleşik Plan) — 2026-08-11

> **Bu dosya nedir?** Ürün katmanının "profesyonel gerçek" kuruluş planı: mevcut amatör-dönem
> ürün verisinin kontrollü tasfiyesi + `product-schema-standard.md` cetveline hizalı şema
> (Split-Model, tenant-hazır) + 374 ürünlük CSV setinin deterministik yüklenmesi + kod dalgası.
> `product-schema-master-implementation-plan.md` (PS Wave 1-3) ile
> `catalog-commerce-pipeline-master-2026-06-20.md` (Kademe-2 loader, Faz A) bu planda **birleşir**.
>
> **Kullanıcı kararları (2026-08-11):** (1) "Profesyonel gerçek ne ise o olmalı" — cetvel tam
> uygulanır, kestirme yok. (2) Test süreçlerinde açılmış siparişler/sepetler **silinebilir**.
> (3) Sıfırdan kontrollü yeniden kuruluş onaylı (yerinde-zenginleştirme değil).

---

## 0. Neden sıfırdan? (kanıt — canlı DB, 2026-08-11)

| Ölçüm | Değer | Sonuç |
|---|---|---|
| Toplam ürün | 388 | |
| Ortalama açıklama uzunluğu | 77 karakter (348'i <120) | Şablon/sahte içerik (PS-006 ihlali) |
| model_code dolu | 54 (%14) | CSV eşleştirme köprüsü yok → enrich güvenilmez |
| Görsel (image_url) | 6 · product_images: 29 satır | Fiilen görselsiz |
| purchase_price > 0 | 0 | Maliyet verisi yok |
| Satış fiyatı > 0 | 219 (29'u sabit ×46,83 kur borcu, kalanı belgesiz) | Fiyat kökeni denetlenemez |
| Elle kategori düzeltmesi (`is_category_manual`) | 0 | Korunacak insan emeği yok |
| Sipariş bağı | 1 ürün / 3 test order-item | Canlı bağımlılık fiilen sıfır |

**Sonuç:** Korumaya değer alan yok; CSV seti (374 ürün, model_code'lu, TR/EN açıklamalı,
30+ spec kolonlu, görsel yollu) tek doğru kaynak. Ayrıca **veri boşken Split-Model migration'ı
veri-taşıma adımı gerektirmez** — şema bölünmesi en ucuz şu an yapılır.

## 0b. Açık kararların kapanışı (D1–D5 → cetvel cevapları)

| # | Karar | Sonuç (cetvel referansı) |
|---|---|---|
| D1 | description_tr/en nereye? | **JSONB i18n**: `product_families.description jsonb` = `{"tr":…,"en":…}` (şema cetveli Aksiyom 4, PS-016; ilişkisel çeviri tablosu yasak) |
| D2 | Alış fiyatı para birimi | **(a)** EUR as-is: `purchase_price numeric(12,4)` + `purchase_currency varchar(3)` (PS-010/011; load'da TRY'ye çevirme YOK) |
| D3 | Çoklu-para gösterim | Base=TRY; USD/EUR vitrin **gösterim kuru + spread** ile Fiyat Motoru fazında (pricing-standard §4) — bu planın kapsamı dışı |
| D4 | Satış fiyatı saklanan mı? | **(a) Materialize cache**: motor hesaplar → `product_prices`'a yazar; kur/marj değişince yeniden hesap (pricing-standard §1 "fiyat türetilir, elle yazılmaz") |
| D5 | Taksonomi normalize zamanı | **Bitti sayılır**: v1.2 + slug lokalizasyonu canlı; kalan 4 yeni kategori bu planın F2 migration'ında açılır |

---

## 1. Faz haritası (sıra + kapılar)

```
F0 Yedek + tasfiye ─► F1 Güvenlik hotfix (PS W1) ─► F2 Split-Model şema (PS W2)
                     ─► F3 Tenant RLS (PS W3) ─► F4 Deterministik CSV loader
                     ─► F5 Kod dalgası (Opus/Sonnet maestro) ─► [ayrı plan] Fiyat Motoru (PS W4)
```

Her faz = **master'dan taze dal + ayrı PR**. Migration içeren her PR **yalnız kullanıcı onayıyla**
merge edilir (merge = prod'a otomatik apply, CLAUDE.md Kural 13). Kod PR'larında Vercel preview
+ admin runtime smoke zorunlu.

### F0 — Yedek + kontrollü tasfiye (tek migration)

1. **Yedek:** `products`, `product_images`, `venthub_orders(+items)`, `shopping_carts(+cart_items)`
   tam dökümü → `docs/archive/db-backup-pre-kademe2/` (CSV; 219 eski satış fiyatı ileride fiyat
   motoru çapraz-kontrolü için burada yaşar). Yedek dosyaları commit'lenir (repo = sigorta).
2. **Tasfiye migration'ı** (sıra FK'ya göre): test sipariş kalemleri + siparişler + sepetler +
   `inventory_movements` (varsa) + `product_prices` + `product_images` + `products` satırları.
   `TRUNCATE` değil kayıtlı `DELETE` (audit izi migration dosyasında).
   > `inventory_movements` FK'sı önce RESTRICT'e çevrilecekse sıra F2 ile koordine edilir;
   > tasfiye boş tabloda RESTRICT'i sorunsuz kılar.

**Kapı:** Yedek dosyalarının satır sayısı = DB sayımları (script doğrular); kullanıcı onayı ile merge.

### F1 — Güvenlik hotfix'leri (PS Wave 1 birebir)

`SECURITY DEFINER search_path` (adjust_stock, set_user_admin_role) · `super_admin/superadmin`
rol uyuşmazlığı (PS-046) · `site_settings` anon INSERT kapatma · `order-validate`/`iyzico-payment`
çift-CORS SyntaxError (PS-044) → merkezi `withCors` · Dashboard: Leaked Password Protection.

**Kapı:** `get_advisors(security)` blocker=0 · edge derleme temiz · `supabase gen types` + `type-check` yeşil.

### F2 — Split-Model şema (PS Wave 2, veri-boş avantajıyla)

- `product_families` (id, tenant_id*, name, slug UNIQUE, brand_id→`brands` (yeni normalizasyon
  tablosu, PS-030), **description jsonb {tr,en}**, is_description_manual, category_id,
  subcategory_id, meta_title/meta_description jsonb, created_at/updated_at, deleted_at).
- `products` → saf varyant: family_id FK, sku NOT NULL UNIQUE CHECK, model_code, barcode,
  status ('active','draft','archived' — PS-017), purchase_price numeric(12,4) NOT NULL DEFAULT 0,
  purchase_currency varchar(3) NOT NULL DEFAULT 'TRY', tax_rate, is_taxable, weight_kg,
  width_mm/height_mm/depth_mm, technical_specs jsonb (+ `jsonb_path_ops` GIN), stock alanları,
  deleted_at. **Fosil kolonlar** (airflow_capacity/noise_level/pressure_rating, image_url,
  düz description, düz price*) kaldırılır — veri boş, taşıma yok.
  - *`products.price` kolonu fiyat motoru gelene dek **kaldırılmaz ama yazılmaz** (frontend'in
    mevcut okuma yolu F5'te `product_prices`-öncelikli çözücüye bağlanana kadar kırılmasın diye);
    F5 sonunda okuma yolu kapatılır, kolon Fiyat Motoru planında düşer. Bu, PS uygulama planının
    "price okuma yolu strictly blocked" hedefine iki-adımlı iniştir.
- CASCADE → RESTRICT: `inventory_movements.product_id`, `categories.parent_id` (PS-005/037).
- updated_at trigger'ları + duplicate trigger tekilleştirme (PS-002/025).
- **4 yeni kategori** (taksonomi §6.1): `industrial-ventilation/acid-resistant-fans`,
  `accessories/frequency-converters`, `electric-heating/electric-duct-heaters`, üst-seviye
  `parking-jet-fan` — EN kanonik slug + `metadata.slug={tr,en}` + translation_key + sözlük anahtarları.
- Kategori `level` düzeltmeleri (PS-036).
- `get_products_enriched` RPC: `product_families` üzerinden sayfalama, liste sorgusunda
  technical_specs YOK (PS-041), min-fiyat join'i motor gelene dek NULL-safe.

**Kapı:** `gen types` + `type-check` + `pnpm build` yeşil · referential_constraints RESTRICT doğrulaması.

### F3 — Tenant izolasyon (PS Wave 3)

`tenant_id NOT NULL DEFAULT jwt_tenant_id()` → products, product_families, categories,
product_images, product_authorities · RLS scalar-subquery şablonu · boş-politikalı 6 tabloya
strict politika · Storage path-RLS (`product-images/[tenant_id]/…`) · kategorilere default
tenant backfill (ürünler zaten boş).

**Kapı:** advisors `auth_rls_initplan`/`unprotected_tables` = 0 · çapraz-tenant testi yeşil.

### F4 — Deterministik CSV loader (LLM değil, script)

- **Araç:** repo içinde `scripts/kademe2-load/` (TS, `tsx` ile; DI'lı service-role client).
  Girdi: `venthub-pdf-ingestor/venthub/markalar/**/03-output/*.csv` (28 dosya, 374 satır, `;` ayraçlı, BOM'lu).
- **Aile türetme kuralı (deterministik):** her CSV dosyası = bir katalog serisi → varsayılan
  **1 CSV = 1 product_family** (name = seri adı, description = serinin TR/EN açıklaması);
  satırlar = varyantlar. Bir CSV'de birden çok belirgin seri varsa (`model_code` öneki kırılımı)
  script raporlar, eşleme dosyasıyla (`family-map.yaml`) elle onaylanır — tahmin yok.
- **Alan eşleme:** model_code→sku*+model_code · brand→brands FK · category_slug/subcategory_slug
  (kanonik EN) → category_id/subcategory_id · purchase_price_eur+currency → purchase_price+purchase_currency ·
  description_tr/en → family.description jsonb · spec_* → technical_specs jsonb (anahtar adları
  csv-import-export cetveliyle birebir; tip kontrolü) · spec_weight_kg/size_a/b/c → weight_kg/width/height/depth ·
  image_url → Storage'a yükle (`product-images/<tenant>/…`) + `product_images` satırı (tek kaynak, PS-022).
  - *SKU üretimi: `VRT-`/`AVE-`/`DAN-`/`NIC-`/`SEA-` marka öneki + model_code normalizasyonu (PS-035 regex'ine uyar).
- **Fiyat:** satış fiyatı YAZILMAZ (motor yok); vitrin "teklif alın" (F5). `confidence=missing`
  satırlar `status='draft'` girer (müşteri görmez, admin görür).
- **Çıktı raporu:** insert sayıları, atlanan satırlar+nedeni, kategori eşleşme kontrolü,
  spec doluluk histogramı → insan kapısı (kullanıcı raporu onaylar, sonra çalıştırılır).
  Prod'a yazma **yalnız kullanıcı "çalıştır" dedikten sonra** (rogue-write dersi: yapı > talimat —
  script'in anon/`service` anahtarı .env'den, commit'lenmez).

**Kapı:** Rapor onayı · yükleme sonrası doğrulama sorguları (374 varyant, family sayısı, 0 yetim,
tüm kategoriler eşleşmiş, description ≥50 kr, PS-006 sahte-şablon taraması 0).

### F5 — Kod dalgası (maestro; worker=Sonnet, yargıç/mimar=Opus)

Hedefler (Split-Model'in frontend ayağı, PS W2 frontend + W6'nın görsel tekilleştirmesi):
- PDP: `/products/[family-slug]` canonic, varyant `?sku=` (PS-043); sekmeler gerçek veriyle
  (Genel=description jsonb dil'e göre, Teknik=technical_specs, Belgeler/Şemalar iskelet kalır).
- Liste/kategori sayfaları: `groupProductsBySeries` istemci workaround'u kalkar; server-side
  family sayfalaması (PS-040); over-fetching yok (PS-041).
- Görsel: yalnız `product_images` okunur (PS-022); `<Image/>` width/height.
- **Fiyatsız durum:** `price null/0` → "Teklif Alın" CTA (sepete ekleme kapalı, i18n anahtarlı) —
  ₺0 + "stokta var" görünümü tamamen kalkar.
- sitemap/JSON-LD: family-tabanlı, ProductGroup (PS-039/043 hazırlığı).
- Cache: `products-discovery-${tenantId}` vs `variant-stock-${variantId}` etiket izolasyonu (PS-042).

**Kapı (merkezi, orkestratör koşar):** type-check · lint · test --run · `pnpm build` ·
Vercel preview görsel kontrol (Recep) · admin runtime smoke (#429) · keycheck/i18n parite.

### Sonrası (bu planın DIŞI, sıradaki planlar)

1. **Fiyat Motoru** (PS Wave 4 + pricing-standard tam uygulama; kendi planı+onayı) — 374 ürünün
   EUR maliyeti hazır olduğundan motor açıldığı gün fiyatlar türetilir.
2. FTS/SEO hizalama (PS Wave 5) ve kalan Wave 6 kalemleri (CHECK constraint'ler, enum sync).

---

## 2. İş bölümü ve model katmanı

| Rol | Kim |
|---|---|
| Plan, migration SQL, merkezi kapı, merge kararları | Fable (controller) |
| F5 kod göç/dönüşüm worker'ları | Sonnet subagent (net brief) |
| F5 yargıç + TASARIM-GEREK hedefler (PDP mimarisi) | Opus subagent |
| F4 loader | Deterministik script (LLM değil) |

## 3. Riskler / dersler

- **Migration=prod:** her migration PR'ı merge'den önce kullanıcı onayı (Kural 13).
- **`products.price` iki-adımlı iniş:** F2'de kolon kalır-yazılmaz, F5'te okuma yolu kapanır —
  tek hamlede silmek vitrin fiyat render'ını kırar.
- **RPC/tip zinciri:** her DDL sonrası `supabase gen types` + type-check + build (i18n-RSC dersi:
  yalnız `next build` prerender hatalarını yakalar).
- **Loader prod-yazma kilidi:** dry-run raporu + açık "çalıştır" onayı; alt-ajan eline DB anahtarı verilmez.
- **Peer şeridi:** skills şeridi `.claude/skills` üzerinde çalışıyor; bu plan o dosyalara dokunmaz.

> v1.0 · 2026-08-11 · SSOT ilişkisi: bu plan uygulanırken `catalog-commerce-pipeline-master` §5
> (D1-D5 → çözüldü) ve Aşama-2 satırı + `product-schema-master-implementation-plan` Wave 1-3
> durumları buradan güncellenir. Anlatı: `docs/DURUM-TAKIP.md`.
