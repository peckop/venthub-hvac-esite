# F5-B — Aile Mimarisi Uygulama Planı (C·D·E·F·G)

> Kaynak: `docs/plans/kademe2-clean-rebuild-2026-08-11.md` §F5 · Cetvel: `docs/standards/product-schema-standard.md` (PS-039…PS-043, PS-022, PS-041, PS-042)
> Üretim: Opus mimar ajanı, 2026-08-11 (orkestratör: Fable). Dizin: venthub-wt-kademe2 · HEAD: 5856e9c2

## 0. Keşif bulguları (planı şekillendiren gerçekler)

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| B1 | `src/types/database.types.ts` bayattı (regen ✅ orkestratör yaptı) | products.Row | Her parçanın ön-koşulu |
| B2 | 26-kolonluk select literali 9× product.service.ts + 3× dışarıda kopyalı | :49,59,114,133,146,160,179,207,220 | Kolon DROP'u 12 noktayı kırar → sabit-kolon SSOT zorunlu |
| B3 | `get_products_enriched` varyant-satırı döner, technical_specs dahil (PS-041 ihlali), image_url fallback (PS-022 ihlali), total_count yok | 20260313_get_products_enriched.sql | C+G çekirdeği |
| B4 | `groupProductsBySeries` tek tüketici: CategorySeriesView — `name.split(' ')[0]` heuristiği | useCategoryViewModel.ts:85-100 | C'de silinir; family gerçeğine geçer |
| B5 | Kategori sayfaları sayfalama yok, limit:100 sabit, cache yok; yalnız /products unstable_cache | category/[categorySlug]/page.tsx:139 | C + Cache |
| B6 | PS-042 ihlali canlı: inventory_movements webhook'u products-discovery + home-data invalide ediyor | api/webhook/supabase/route.ts:128-133 | Stok hareketi = keşif cache thrash |
| B7 | PDP galeri zaten product_images'tan; image_url yalnız PDF + JSON-LD + OG'de | ProductDetailPageView.tsx:133-138 vs :213,566 | F'de kalan 3 nokta |
| B8 | Çift Product JSON-LD (sunucu page.tsx + istemci PDPView) | products/[slug]/page.tsx:97-121 | E'de tekilleşir → tek ProductGroup |
| B9 | Kategori JSON-LD URL'inde /lang prefix eksik | category/[categorySlug]/page.tsx:160 | E |
| B10 | JSON-LD'de UUID sızıntısı YOK ama ProductGroup + isPartOf eksik | aynı | E |
| B11 | sitemap 374 varyant URL × 2 dil üretiyor | src/app/sitemap.ts:18,80-95 | E: 32 aile × 2 olacak |
| B12 | Routes.product(slug) tek argümanlı, ?sku= yok | src/utils/routes.ts:36-40 | D |
| B13 | Legacy kolon okuyan mantık: engineeringIntelligence.ts:127,153 · CategoryLandingView.tsx:81 | grep | G DROP ön-koşulu |
| B14 | jwt_tenant_id() anon'da default tenant döner → aile RLS public okumayı kırmaz | 20260530220000 | Risk yok |
| B15 | product_families UNIQUE (tenant_id, slug) — global değil | f2 migration:74 | D'de slug çözümü limit(1) ile |

## 1. Hedef sınıflandırma

| Sınıf | Parçalar | Model |
|---|---|---|
| SIRALI-ÖN (herkesten önce) | W0.1 tip/kolon SSOT · W0.2 RPC v2 SQL | Orkestratör/Opus |
| TASARIM-GEREK | W2.1 aile-listeleme · W2.2 PDP family-slug + ?sku= | Opus |
| TEMİZ (Sonnet-paralel) | W1.1 görsel tek-kaynak · W1.2 cache izolasyonu · W1.3 sitemap · W3.1 JSON-LD · W3.2 legacy-okuma temizliği | Sonnet |
| SIRALI-SON (ayrı PR + KULLANICI ONAYI) | W4.1 kapanış migration'ı (DROP) | Orkestratör |

## 2. Parçalar (özet — brief taslakları orkestratör kayıtlarında)

- **W0.1 Tip tabanı + kolon SSOT:** database.types.ts regen (✅ yapıldı) · YENİ `src/lib/services/product.columns.ts` (`VARIANT_DETAIL_COLUMNS` / `VARIANT_LIST_COLUMNS` [specs YOK] / `FAMILY_LIST_COLUMNS`) · 12 kopya literal → sabit · `DbProductFamily`/`FamilyListItem` tipleri.
- **W0.2 RPC:** YENİ migration `get_product_families_enriched` (family-sayfalama, total_count window, kapak=product_images DISTINCT ON, boş-aile gizli, security invoker, limit≤96) + `get_family_detail(p_slug,p_lang)` (aile+aktif varyantlar+specs+görseller jsonb; tenant_id sızdırmaz). Eski RPC kalır → W4.1'de DROP.
- **W1.1 Görsel tek-kaynak:** YENİ `src/lib/images/productImage.ts` (storagePathToUrl + deterministik placeholder) · ProductCard, BrandDetailPage:326, EnhancedNeedsWizard:309, AddToProjectModal:92, productsApi — image_url okumaları resolver'a; ürüne-özel .webp fallback literalleri silinir. PDPView'a DOKUNMAZ (W2.2 sahası).
- **W1.2 Cache izolasyonu (PS-042):** YENİ `src/lib/cache/tags.ts` (discoveryTag/familyTag/variantStockTag) · webhook route: inventory_movements → yalnız variant-stock; products'ta yalnız status/family_id/category_id değişimi keşfi tetikler; product_families dalı eklenir. Birim test: mock revalidateTag çağrı kümesi.
- **W1.3 sitemap:** aile-tabanlı (32×2); varyant URL asla girmez; kendi minimal getAllFamilies'ini yazar (W2.1 sonra devralır).
- **W2.1 Aile-listeleme:** YENİ family.service.ts + FamilyCard (min_price null → requestQuote; sepete-ekle render edilmez) · 3 route ?page= + limit:24 sunucu-sayfalama + unstable_cache(discoveryTag) · groupProductsBySeries + SeriesGroup SİLİNİR · CategorySeriesView matris bloğu kalkar (PDP'ye taşınır) · useCategoryGateway spec-filtreleri kaldırılır (faceted-search ayrı plan; kalırsa sessiz 0-sonuç). i18n: category.family.* + common.pagination.* (merkezi merge).
- **W2.2 PDP:** family-slug canonic; varyant-slug → `permanentRedirect(/${lang}/products/${family.slug}?sku=)` 308 (önce aile ara → döngü yok); ?sku= canonical'a girmez; generateStaticParams yalnız aile; VariantSelector (router.replace scroll:false); Genel=variant.description_i18n[lang] ?? family.description[lang]; Teknik=seçili varyant specs; istemci JSON-LD bloğu silinir; image_url'ün 3 kalan noktası resolver'a; fiyatsızda sepete-ekle hiç render edilmez. Routes.product(familySlug, sku?). products.slug DROP EDİLMEZ (308 penceresi).
- **W3.1 JSON-LD:** YENİ src/lib/seo/jsonld.ts — ProductGroup (productGroupID=slug, hasVariant[]=Product+sku+mpn; fiyat yoksa offers alanı HİÇ yazılmaz), isPartOf, assertNoUuid (dev-only + birim test) · kategori JSON-LD /lang prefix (B9) + aile URL'leri.
- **W3.2 Legacy-okuma temizliği (W4.1 ön-koşulu):** engineeringIntelligence (noise/airflow → technical_specs.{value}), CategoryLandingView:81, ProductSmartInference, pdfGenerator, SearchOverlay, BrandDetailPage; product.columns.ts'ten DROP kolonları çıkar. Kanıt: `rg 'airflow_capacity|noise_level|pressure_rating|image_url' src` yalnız specs anahtarları + categories.image_url.
- **W4.1 Kapanış migration'ı (KULLANICI ONAYI):** ön-koşul DO-guard (fosil kolonlarda veri=0) → DROP: description, image_url, airflow_capacity, noise_level, pressure_rating, meta_title, meta_description, is_category_manual + get_products_enriched. KALIR: price (Fiyat Motoru'na dek, comment'li) · slug (308 penceresi) · brand text (PS-030 borcu).

## 3. Çakışma çözümleri (matristen 3 gerçek nokta)

1. products/page.tsx: W1.2 önce (yalnız etiket sabiti), W2.1 sonra.
2. category/PDP page.tsx'lerde JSON-LD: W3.1, W2.x'ten SONRAKİ dalgada; W2.x brief'i "JSON-LD sunucu bloğunu olduğu gibi bırak, istemci kopyasını sil" der.
3. tr/en sözlükleri: W2.1 (category.family.* + common.pagination.*) ve W2.2 (pdp.variant.*) ayrı namespace kilidi; merge merkezde.

## 4. Dalga sırası

```
D0 SIRALI-ÖN: W0.1 → W0.2 (migration merge=prod)     kapı: gen types · tsc · RPC smoke (32 aile/total_count)
D1 PARALEL Sonnet×3: W1.1 | W1.2 | W1.3               kapı: tsc · lint · test · build
D2 PARALEL Opus×2: W2.1 | W2.2 (i18n merge merkezde)  kapı: + Vercel preview (Recep) · 308 curl · admin smoke
D3 PARALEL Sonnet×2: W3.1 | W3.2                      kapı: jsonld birim testi · rg 0-legacy kanıtı
D4 SIRALI-SON: W4.1 DROP — AYRI PR, KULLANICI ONAYI   kapı: DO-guard · gen types · tsc · build · advisors
```

Kritik yol: W0.1 → W0.2 → W2.1 → W3.1 → W4.1.

## 4b. Vitrin tutarlılık taraması (2026-08-12, D0 öncesi) → dalga eşlemesi

Paralel salt-okunur taramanın 18 bulgusu. F5-B dalgasına oturanlar ilgili brief'e girer;
oturmayanlar **EK-x** olarak D3 sonrası küçük düzeltme dalgasında (veya bağımsız PR) kapanır.

| Bulgu | Önem | Nereye |
|---|---|---|
| Arama önerisi ürünü `/products/<UUID>` + dilsiz URL'e götürüyor → boş PDP (`get_search_suggestions` SQL + SearchOverlay) | YÜKSEK | **EK1** — bağımsız fix (RPC slug döndürür + overlay lang prefix); W2.2 slug modeline uyumlu yapılır |
| Arama önerisi kategorileri `is_active`/count>0/localized-slug filtresiz | YÜKSEK | **EK1** (aynı RPC) |
| Kategori SSR alt-kategorileri count>0 filtresiz → hydration'da kart zıplaması | YÜKSEK | **W2.1** brief'ine girer |
| `SearchOverlay.tsx:283` ham `cat.name` render (TR'ye EN sızar) | YÜKSEK | **EK2** — tek satır, `getCategoryDisplayName` |
| `sitemap.ts` boş kategorileri indeksliyor + alt-kategori rotaları hiç yok | ORTA-YÜKSEK | **W1.3** brief'ine girer |
| `useCategoryGateway` ham slug lookup (TR SPA geçişinde yanlış kategori riski) | ORTA | **W2.1** (gateway zaten yeniden yazılıyor) |
| `get_products_enriched` + `get_category_counts` + FTS `deleted_at` süzmüyor | ORTA | W2.1'de aile RPC'sine geçişle ölür; sayaç RPC'si için **EK3** migration (W4.1'e not) |
| Marka detay kartı fiyat/Teklif modelini hiç uygulamıyor | ORTA | **EK4** — ProductCard'a geçir (W1.1 resolver'ından sonra) |
| Ürün JSON-LD fiyatsıza `"0.00"` yazıyor (2 kopya) | ORTA | **W3.1** (fiyat yoksa offers hiç yazılmaz — planda var) |
| Ana sayfa kategori sırası ham `name.localeCompare` (nav `sort_order` ile çelişir) | ORTA | **EK5** — tek satır, sort_order'a geç |
| `EnhancedNeedsWizard` ham `parentSlug`→`category_slugs` (TR'de 0 sonuç) | ORTA | **EK6** — kanonik slug çevirisi (W2.1 alanı, brief'e not) |
| Fiyat/marka/spec filtreleri UI'da var ama listeye uygulanmıyor (sahte) | DÜŞÜK-ORTA | **W2.1** planda: spec filtreleri kalkar; faceted-search ayrı plan |
| `/products` `revalidate:false` (süresiz-bayat riski) | DÜŞÜK-ORTA | **W1.2** brief'ine girer (3600 emniyet kemeri) |
| Sayfalama hiçbir yüzeyde yok (100 tavanı, sessiz kayıp) | DÜŞÜK | **W2.1** çekirdeği (?page= + 24) |
| Hardcoded kategori slug'ları (ApplicationSolutions/CategoryShowcase/SearchOverlay chip) | DÜŞÜK | **EK7** — registry'den türet |
| PDP breadcrumb boş-kategori kümesinde kopuyor | DÜŞÜK | **W2.2** yeniden yazımı kapsar |
| `p_sort_by` hiç gönderilmiyor + RPC-hata fallback'i sırasız | DÜŞÜK | W2.1 ile ölür (eski RPC emekli) |
| Ölü kod: `productsApi.ts`, `HomePage initialCategories` prop | BİLGİ | **W3.2** temizlik listesine |

## 5. Açık riskler

1. database.types.ts bayatlığı sessiz any düşürür → D0 kapısı sert (regen ✅).
2. Spec filtreleri (airflow/pressure/noise) listeden düşüyor → UI'dan kaldırılmazsa sessiz 0-sonuç; faceted-search ayrı plan.
3. min_price fiyat motoruna dek ~hep NULL → price-low/high sıralaması gizlenmeli.
4. 308 döngü riski: çözücü ÖNCE aileye bakar; loader slug üretimi çakışma-kontrollü (374 benzersiz doğrulandı).
5. product_families UNIQUE (tenant_id, slug) → slug çözümü limit(1).
6. W4.1 geri alınamaz; price/slug/brand kalışı bilinçli borç → Fiyat Motoru planına not.
