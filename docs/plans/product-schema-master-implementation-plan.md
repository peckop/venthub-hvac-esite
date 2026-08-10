# VentHub HVAC — Revize Master Uygulama Planı v2.0 (Master Implementation Plan)

> **Kaynak:** NLM Baş Kütüphaneci & Mimari Danışman — Çapraz denetimli revize
> **Girdi Belgeleri:** `product-schema-ground-truth-2026-06-21.md` (46 bulgu) + `product-schema-standard.md` (11 bölüm cetvel) + `hvac_relations_migration_plan.md` (eski 4 fazlı plan)
> **Tarih:** 2026-06-21 | **Revizyon:** v2.0 (NLM denetim düzeltmeleri uygulandı)

Bu plan, 46 kanıtlı bulgunun **tamamını** standart cetvelindeki 11 bölümlük mimari kurallarla ve eski 4 fazlı geçiş modeliyle harmanlayarak orkestre eder.

> [!IMPORTANT]
> **v2.0 Revizyonu — NLM Denetim Düzeltmeleri:**
> - 6 atlanan PS kodu eklendi (PS-007, PS-008, PS-009, PS-017, PS-018, PS-019)
> - ❌ Döngüsel bağımlılık düzeltildi: Split-Model artık Fiyat Motorundan **ÖNCE** (Wave 2)
> - PS-027 Wave 3'ten → Wave 1'e taşındı (Supabase Dashboard ayarı, migration değil)
> - PS-032 silinmeyecek, RLS ile korunarak Wave 3'e alındı
> - 3 eksik kalite kapısı eklendi: `pnpm build` prerender, `supabase gen types`, E2E checkout smoke
> - FTS kolon uyuşmazlığı (`is_fuzzy_match`) Wave 5'e dahil edildi

---

## 🌊 WAVE 1: Acil Güvenlik, Kimlik & Edge CORS Yamaları (Vulnerability Hotfixes)

**Amaç:** Platform genelindeki yetki yükseltme (privilege escalation) açıklarını kapatmak, rol uyuşmazlığından kaynaklanan kilitlenmeleri çözmek, SyntaxError sebebiyle çalışmayan Edge Function'ları kurtarmak ve leaked password korumasını aktifleştirmek.

**Kapsanan PS Kodları:** `PS-003`, `PS-004`, `PS-026`, `PS-027`, `PS-044`, `PS-046`

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB** | `adjust_stock` ve `set_user_admin_role` SQL fonksiyonlarındaki `SECURITY DEFINER` tanımlarını rehabilite et; yetki sızıntısını önlemek için her iki fonksiyona explicit `search_path = pg_catalog, public` enjekte et. `user_profiles_role_check` constraint'indeki `super_admin` (alt çizgili) rolü ile `is_user_admin()` fonksiyonunun `superadmin` (birleşik) arama koşulu arasındaki mantıksal uyumsuzluğu gider. `site_settings` tablosundaki INSERT yetkilerini anon kullanıcılara tamamen kapatacak şekilde kısıtla. |
| **API/RPC** | `order-validate` ve `iyzico-payment` Edge Function'larında yer alan, derlemeyi engelleyen (SyntaxError) çift `const cors` tanımlarını kaldır; tüm CORS yönetimini `supabase/functions/_shared/cors.ts` altındaki merkezi `withCors` middleware yapısına devret. |
| **Dashboard** | Supabase Auth Dashboard'dan **Leaked Password Protection** (HaveIBeenPwned API) özelliğini aktifleştir. Local dev ortamında `supabase/config.toml` içindeki `auth.external.password_protection` alanını etkinleştir. _(Bu bir migration değil, dashboard ayarıdır.)_ |

**Bağımlılıklar:** Yok (bağımsız — P0).
**Tahmini Karmaşıklık:** Orta (M)

**Kalite Kapısı Kriterleri:**
- [ ] `get_advisors({type: 'security'})` sorgusunda `security_definer` ve `permissive_policy` Blocker'ları **0** olmalıdır.
- [ ] `pnpm run build` komutu Edge Function'larında hiçbir derleme hatası fırlatmamalıdır.
- [ ] `supabase gen types typescript --local > src/types/database.types.ts` + `pnpm run type-check` hatasız geçmelidir.

---

## 🌊 WAVE 2: Ürün Ailesi & Varyant Ayrımı + Kategori Hiyerarşisi (The Split-Model)

> [!IMPORTANT]
> **v2.0 Kritik Düzeltme:** Bu dalga eski planda Wave 5'teydi. NLM denetimi sonucunda, Split-Model'in Fiyat Motorundan **ÖNCE** yapılması gerektiği tespit edildi. Aksi halde Wave 4'te düz tabloya göre yazılan migration'lar, tablo bölündüğünde çöker.

**Amaç:** `hvac_relations_migration_plan.md` belgesindeki 4 yapısal riski çözmek üzere, düz tablo yapısını `product_families` (parent) ve `product_variants` (child) olarak ikiye bölmek, CASCADE risklerini gidermek ve sunucu taraflı sayfalamayı kurtarmak.

**Kapsanan PS Kodları:** `PS-002`, `PS-005`, `PS-014`, `PS-025`, `PS-036`, `PS-037`, `PS-038`, `PS-040`, `PS-041`, `PS-042`, `PS-043`

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB — Split** | `product_families` tablosunu oluştur (id, tenant_id, name, slug, brand_id, description, is_description_manual, category_id, created_at, updated_at, deleted_at). `products` tablosuna `family_id (REFERENCES product_families)` enjekte et. Ortak katalog alanlarını parent tabloya taşı; products tablosunu saf variant-child tablosuna indirge. **10 temel B2B kolonu** (weight_kg, barcode, tax_rate, is_taxable, purchase_price, purchase_currency vb.) doğrudan bu dalga içinde variant şemasına enjekte et. |
| **DB — CASCADE** | `inventory_movements` → `products` FK kısıtlamasındaki `ON DELETE CASCADE` kuralını `ON DELETE RESTRICT` olarak revize et. `categories.parent_id` FK'sındaki `ON DELETE CASCADE` kuralını `ON DELETE RESTRICT` olarak revize et. |
| **DB — Trigger** | `products` ve `product_families` tabloları üzerinde `BEFORE UPDATE` updated_at tetikleyicilerini yaz. `venthub_orders` ve `venthub_order_items` tablolarındaki mükerrer updated_at trigger'larını tekilleştir. |
| **DB — Kategori** | `categories.level=0` olarak yanlış seed edilmiş olan "Ex-Proof (ATEX) Fanlar" ve "Sığınak Havalandırma Sistemleri" alt kategorilerinin hiyerarşik level değerlerini `level=1` olarak güncelle. |
| **API/RPC** | `get_products_enriched` RPC fonksiyonunu revize ederek sorguları strictly `product_families` üzerinden sayfalayacak ve en ucuz varyantın fiyatını (`MIN(price)`) join ile dönecek şekilde yeniden yaz. Liste sorgularında `technical_specs` JSONB kolonunu çekmeyi iptal et (over-fetching engellenmesi). |
| **Frontend** | Kategori listeleme sayfalarında `groupProductsBySeries` istemci taraflı workaround'unu kaldır. Sayfalamayı sunucu taraflı 10'arlı kartlar halinde dondur. Ürün detay sayfasını (`/products/[family-slug]`) parent-slug tabanlı canonic hale getir, varyantları query params (`?sku=...`) ile çöz. |
| **SEO/Sitemap** | `sitemap.ts` ve `generateStaticParams`'ı sadece `product_families` (parent) üzerinden sitemap üretecek ve varyantları canonical link ile parent'a bağlayacak şekilde güncelle. |

**Bağımlılıklar:** Wave 1
**Tahmini Karmaşıklık:** Çok Yüksek (XL)

**Kalite Kapısı Kriterleri:**
- [ ] Server-side pagination testlerinde her sayfa başına gelen kart sayısı **tam ve kararlı** olmalıdır.
- [ ] Varyant güncellemelerinin `products-discovery` önbelleğini tetiklemediği (cache thrashing olmadığı) test edilmelidir.
- [ ] `information_schema.referential_constraints` sorgulamasında `delete_rule` değerlerinin `RESTRICT` olduğu doğrulanmalıdır.
- [ ] `supabase gen types typescript --local > src/types/database.types.ts` + `pnpm run type-check` hatasız geçmelidir.
- [ ] `pnpm run build` (static prerender testi) hatasız geçmelidir.

---

## 🌊 WAVE 3: SaaS Multi-Tenant Veri İzolasyon Güvencesi (Tenant-Aware RLS)

**Amaç:** Yeni split şeması üzerinde ürün, kategori, görsel ve yetki tablolarını çoklu kiracılı (multi-tenant) mimariye yükselterek, kiracılar arası veri sızıntısını (Data Bleeding) veritabanı motoru seviyesinde kesin olarak engellemek.

**Kapsanan PS Kodları:** `PS-001`, `PS-020`, `PS-021`, `PS-024`, `PS-032`

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB** | `products`, `product_families`, `categories`, `product_images` ve `product_authorities` tablolarına `tenant_id NOT NULL DEFAULT public.jwt_tenant_id()` kolonunu enjekte et. Sorguların her satırda helper fonksiyonu tetikleyip yavaşlamasını önlemek için RLS koşullarını scalar alt sorgu (`tenant_id = (SELECT public.jwt_tenant_id())`) şablonuyla sarmala. RLS politikası etkin olmasına rağmen politikası boş olan `category_mapping_rules` dahil 6 tabloya strict tenant-scoped SELECT/INSERT/UPDATE/DELETE kurallarını yaz. `_tenant_id` indekslerini silme, B-Tree indeksi olarak koru ve optimize et. |
| **DB — PS-032** | `product_authorities` tablosu **silinmeyecek**. Boş olması bir hata değil, Page Builder entegrasyonu için dondurulmuş bir iskelettir. Tablo korunarak RLS'i `tenant_id` scalar subquery ile kilitlenecektir. |
| **Storage** | _(NLM v2.0 Ek)_ `storage.objects` üzerindeki RLS politikalarını güncelleyerek, dosya yolunun ilk klasöründeki UUID'yi aktif `jwt_tenant_id()` ile eşleştir. `product_images` tablosu tenant-izole edilse bile fiziksel dosya erişimi Storage RLS olmadan sızar. |
| **Veri** | Mevcut 388 ürünü ve 25 kategoriyi, default tenant UUID'si (`d3b07384-d113-495f-a558-8c38634e0000`) ile güncelleyerek (backfill) geçmişe yönelik veri bütünlüğünü sağla. |

**Bağımlılıklar:** Wave 2
**Tahmini Karmaşıklık:** Yüksek (L)

**Kalite Kapısı Kriterleri:**
- [ ] `get_advisors({type: 'security'})` sorgusunda `auth_rls_initplan` ve `unprotected_tables` uyarısı kalmamalıdır.
- [ ] Çapraz tenant sorgulama entegrasyon testleri (Tenant B, Tenant A'nın envanterini göremez) **%100 yeşil** dönmelidir.
- [ ] `supabase gen types typescript --local > src/types/database.types.ts` + `pnpm run type-check` hatasız geçmelidir.

---

## 🌊 WAVE 4: Çok Para Birimli Cost-Plus Fiyat Motoru ve Sipariş Snapshot'ları (B2B Price Engine & Order Snapshots)

> [!IMPORTANT]
> **v2.0 Düzeltme:** Bu dalga artık yeni split şeması (`product_families` + `product_variants`) üzerinde çalışır. `purchase_price` ve `purchase_currency` kolonları Wave 2'de variant tablosuna eklenmiş olacaktır.

**Amaç:** `pricing-standard.md` belgesindeki 3 katmanlı yapıyı hayata geçirmek, döviz tabanlı maliyetleri dinamik TL liste fiyatına dönüştürmek ve sipariş esnasında donmuş fiyat snapshot'larını sepetten sipariş kalemlerine mühürlemek.

**Kapsanan PS Kodları:** `PS-010`, `PS-011`, `PS-015`, `PS-045`

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB** | `product_prices` tablosunun `price_list_id` NOT NULL kısıtını doğrula ve eski çözücülerin `IS NULL` ölü dallarını temizle. |
| **API/RPC** | `order-validate` Edge Function'ını güncelleyerek `purchase_price`, `purchase_currency` ve TCMB kur matrisini kullanarak dinamik maliyet-artı-marj hesaplamasını doğrula. `iyzico-payment` ödeme bacağını revize ederek sepet onaylandığı anda `venthub_order_items` tablosundaki boş geçilen **6 adet snapshot alanını** (unit_price_snapshot, price_list_id_snapshot, product_name_snapshot, product_sku_snapshot, tax_rate_snapshot, product_snapshot jsonb) sepet verileriyle dondurarak yaz. |
| **Veri** | `product_prices` tablosunu `valid_from` zaman damgasıyla dondurulmuş idempotent seed ile doldur (`now()` kullanımı yasaktır, mükerrer satır oluşmasını engellemek için). |
| **API — i18n** | _(NLM v2.0 Ek)_ `order-confirmation` ve `shipping-notification` gibi müşteri iletişim Edge Function'larının, `user_locale` okuyarak e-postaları müşterinin dilinde göndermesi kuralını doğrula. |

**Bağımlılıklar:** Wave 3
**Tahmini Karmaşıklık:** Yüksek (L)

**Kalite Kapısı Kriterleri:**
- [ ] Yeni oluşturulan siparişlerde 6 snapshot alanının tamamının dolu olduğu `INV-PRICE-3` uyumluluk testiyle kanıtlanmalıdır.
- [ ] `order-validate` testlerinde sepet birim fiyatı ile sunucu fiyatı **%100 eşleşmelidir**.
- [ ] Karantinaya alınmış `checkout-smoke.e2e.ts` e2e testinin karantinası kaldırılmalı (`describe.skip` silinmeli) ve **Playwright checkout smoke testi yeşil yanmalıdır**.
- [ ] `supabase gen types typescript --local > src/types/database.types.ts` + `pnpm run type-check` hatasız geçmelidir.

---

## 🌊 WAVE 5: FTS Arama & SEO Flat-Routing Düzeltmeleri (Search & SEO Alignment)

**Amaç:** Full-text search fonksiyonlarındaki kolon uyuşmazlıklarını gidermek, arama motorunu yeni split şemasına uyumlu hale getirmek ve SEO URL yapısını standart §7'ye uyumlu düzleştirmek.

**Kapsanan PS Kodları:** `PS-039` (URL/RPC eşlemeleri), **FTS kolon uyuşmazlığı** (`is_fuzzy_match` — standart §9)

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB** | `fts_search_products` ve `get_search_suggestions` RPC fonksiyonlarını yeni split şemasına (`product_families` + `products`) göre güncelle. Fonksiyonların döndürdüğü kolon listesi (`is_fuzzy_match` dahil) ile `database.types.ts` TypeScript tipleri tam uyumlu hale getirilmelidir. GIN trigram indeksleri bu fonksiyonlarla birlikte güncellenmelidir. |
| **Frontend** | Flat URL yönlendirmesini (`/products/[family-slug]`) doğrula. Arama sonuçlarını yeni şemaya göre render et. Canonical URL kurallarını (`/products/punto-mex?size=100` → canonical `/products/punto-mex`) uygula. |
| **SEO** | JSON-LD `ProductGroup` structured data'yı yeni split yapısına göre güncelle. Sitemap'te UUID sızıntısı olmadığını doğrula. |

**Bağımlılıklar:** Wave 4
**Tahmini Karmaşıklık:** Orta (M)

**Kalite Kapısı Kriterleri:**
- [ ] FTS arama testlerinde `is_fuzzy_match` dahil tüm dönüş kolonlarının TypeScript tipleriyle eşleştiği doğrulanmalıdır.
- [ ] `pnpm run build` (static prerender) hatasız geçmelidir.
- [ ] `pnpm run type-check` hatasız geçmelidir.

---

## 🌊 WAVE 6: Katalog Veri Kalitesi & Çok Dilli (i18n) Zenginleştirme (Data Polish & i18n Sync)

**Amaç:** Geriye kalan tüm sahte açıklamaları, entegrasyon sızıntılarını, status/enum uyumsuzluklarını ve çoklu dil (i18n) standardı ihlallerini ortadan kaldırmak.

**Kapsanan PS Kodları:** `PS-006`, `PS-007`, `PS-008`, `PS-009`, `PS-012`, `PS-013`, `PS-016`, `PS-017`, `PS-018`, `PS-019`, `PS-022`, `PS-023`, `PS-028`, `PS-029`, `PS-030`, `PS-031`, `PS-033`, `PS-034`, `PS-035`

**Etkilenen Katmanlar:**

| Katman | Yapılacak İş |
|---|---|
| **DB — Veri Bütünlüğü** | `products` tablosuna soft delete (`deleted_at`) kolonunu ekle. Fosil kolonları (`airflow_capacity`, `noise_level`, `pressure_rating`) products tablosundan sil, tüm teknik verileri `technical_specs` JSONB içine migrasyonla taşı. `products` ve `product_families` üzerinde deleted_at durum kontrolü yapan trigger'ları yaz. |
| **DB — Constraint** | Negatif miktar/fiyat girilmesini engelleyen `CHECK constraint` kurgularını ekle (PS-007, PS-008). Stok hareketleri runtime veri anomalilerini engelleyen guard'ları ekle (PS-009). `products_status_check` kısıtını modern SaaS yapısına göre güncelle: `('active', 'draft', 'archived')` (PS-017). |
| **DB — Enum/Type Sync** | Veritabanı seviyesindeki enum tipleri ile Next.js schema tanımları (`database.types.ts`) arasındaki senkronizasyon boşluğunu kapat (PS-018, PS-019). |
| **Veri** | Sahte descriptions ("- Smart category mapping") yerine, `technical_specs` içinden debi/basınç çekerek gerçekçi açıklamaları dinamik generate et. 12 yetim (orphan) ürüne geçerli kategoriler ata. 67 adet subcategory_id uyuşmazlığını normalize et. `model_code` ve `slug` alanlarındaki null değerleri temizle. `brand` kolonunu normalleştirerek `brands` tablosuna bağla. Standardı bozan `65002` SKU koduna 'AVE-' veya 'VRT-' ön ekini enjekte et. |
| **Frontend** | Çift görsel modelini (`image_url` vs `product_images`) tekilleştir, frontend'in sadece `product_images` tablosunu okumasını sağla. `categories_with_counts` view/RPC yazarak boş kategorileri müşteriden gizle. |

**Bağımlılıklar:** Wave 5
**Tahmini Karmaşıklık:** Orta (M)

**Kalite Kapısı Kriterleri:**
- [ ] `INV-5 i18n-key-resolution` testi sıfır hata ile geçmelidir.
- [ ] `check_integrity.py` analizi **0 Blocker** ile tamamlanmalıdır.
- [ ] `supabase gen types typescript --local > src/types/database.types.ts` + `pnpm run type-check` hatasız geçmelidir.
- [ ] `pnpm run lint` hatasız geçmelidir.
- [ ] `pnpm run build` hatasız geçmelidir.

---

## 📐 KISITLAMALAR VE EKOSİSTEM UYUMU (Brief K1-K6 Paritesi)

1. **Migration SQL Dosyası Oluşturma Yöntemi:** Yeni şema güncellemeleri için kesinlikle manuel SQL dosyası uydurulmayacak; her zaman terminalden `supabase migration new <name>` komutu çalıştırılarak idempotent şablonlar üretilecektir.
2. **Sıfır-EAV Aksiyomu:** Dinamik teknik özellikler için dikey tablolar (EAV) kesinlikle açılmayacak; PostgreSQL'in native `jsonb_path_ops` indeksli JSONB alanı (`technical_specs`) sonuna kadar korunacaktır.
3. **JSONB i18n İzolasyonu (Aksiyom 5):** Çoklu dil çevirileri için ilişkisel tablolar (örn: `product_translations`) açılmayacak, dil verileri JSONB nesneleri içinde (`metadata->lang`) izole tutulacaktır.
4. **Maliyet Kuralları:** `products.price` alanının doğrudan müşteri yüzeyi kod yolunda okunması strictly blocked edilerek, fiyatlar daima üreticiden geldiği para birimiyle (`purchase_currency = 'EUR'`) cost-plus fiyatlandırma motoru üzerinden dinamik çözülecektir.

---

## 🔄 HER DALGA SONUNDA ZORUNLU ORTAK ADIMLAR

Her dalga sonunda, DDL migration içersin veya içermesin, aşağıdaki ortak adımlar uygulanmalıdır:

1. `supabase gen types typescript --local > src/types/database.types.ts` — TypeScript tipleri güncelle
2. `pnpm run type-check` — Tip kontrolü
3. `pnpm run lint` — Lint kontrolü
4. `pnpm run build` — Static prerender testi (RSC sınır ihlallerini yakalar)
5. Git commit + push

---

## 📊 PS Kodu → Dalga Eşleştirme Tablosu (46/46 — %100 Kapsam)

| PS Kodu | Dalga | Konu |
|---|---|---|
| PS-003, PS-004 | Wave 1 | SECURITY DEFINER |
| PS-026 | Wave 1 | site_settings permissive policy |
| PS-027 | Wave 1 | Leaked password protection (Dashboard) |
| PS-044 | Wave 1 | Edge Function çift CORS |
| PS-046 | Wave 1 | super_admin rol uyuşmazlığı |
| PS-002 | Wave 2 | updated_at trigger eksik |
| PS-005 | Wave 2 | inventory_movements CASCADE |
| PS-014 | Wave 2 | 10 destekleyici tablo eksik (Split) |
| PS-025 | Wave 2 | Duplicate trigger |
| PS-036 | Wave 2 | category level tutarsızlık |
| PS-037 | Wave 2 | categories CASCADE |
| PS-038 | Wave 2 | 2-seviye limit |
| PS-040 | Wave 2 | Sayfalama kırık |
| PS-041 | Wave 2 | Over-fetching |
| PS-042 | Wave 2 | Cache thrashing |
| PS-043 | Wave 2 | SEO duplicate content |
| PS-001 | Wave 3 | tenant_id eksik |
| PS-020 | Wave 3 | RLS policy TRUE |
| PS-021 | Wave 3 | 6 tablo RLS boş |
| PS-024 | Wave 3 | Kullanılmayan indeksler |
| PS-032 | Wave 3 | product_authorities RLS (korunacak) |
| PS-010 | Wave 4 | currency kolonu (Wave 2'de eklendi) |
| PS-011 | Wave 4 | purchase_price (Wave 2'de eklendi) |
| PS-015 | Wave 4 | İkili fiyat mekanizması |
| PS-045 | Wave 4 | Sipariş snapshot eksik |
| PS-039 | Wave 5 | URL/RPC eşlemeleri |
| FTS | Wave 5 | is_fuzzy_match kolon uyuşmazlığı |
| PS-006 | Wave 6 | Sahte description |
| PS-007 | Wave 6 | Stok miktar/veri tipi doğrulama |
| PS-008 | Wave 6 | Negatif miktar/fiyat CHECK constraint |
| PS-009 | Wave 6 | Trigger runtime veri anomalileri |
| PS-012 | Wave 6 | Soft delete yok |
| PS-013 | Wave 6 | 10 enterprise kolon eksik |
| PS-016 | Wave 6 | i18n sıfır |
| PS-017 | Wave 6 | products_status_check bayatlığı |
| PS-018 | Wave 6 | database.types.ts tip uyuşmazlığı |
| PS-019 | Wave 6 | Enum-şema farklılaşması |
| PS-022 | Wave 6 | İkili görsel sistemi |
| PS-023 | Wave 6 | SEO alanları boş |
| PS-028 | Wave 6 | model_code boş |
| PS-029 | Wave 6 | supplier_name boş |
| PS-030 | Wave 6 | brand serbest metin |
| PS-031 | Wave 6 | slug nullable |
| PS-033 | Wave 6 | Fosil kolonlar |
| PS-034 | Wave 6 | JSONB key tutarsızlığı |
| PS-035 | Wave 6 | Standart dışı SKU |
