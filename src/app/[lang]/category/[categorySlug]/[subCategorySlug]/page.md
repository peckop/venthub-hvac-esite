---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\app\[lang]\category\[categorySlug]\[subCategorySlug]\page.tsx
skeleton_hash: 8989f94f0cfb0c58
entity_hashes:
  func:Page: 3f194a51738b081b
  func:generateMetadata: 374cf14702a129ba
  func:generateStaticParams: 01749dce9eb251b4
  func:getCachedFamilies: 0c20054405aac333
  func:parsePageParam: 478b1488bab262a0
  func:resolveLocalizedSegments: 606c139694573527
  overview: a95554f4a816ca75
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-08-25T07:24:07Z
---

## Genel Bakış

Bu modül, Next.js'in dinamik yönlendirme yapısı altında alt kategori sayfalarını oluşturan bir sayfa bileşenidir. Dil, kategori ve alt kategori slug'larına göre aile verilerini getirir, yerelleştirilmiş URL segmentlerini çözer ve SEO uyumlu meta veriler üretir. Statik sayfa üretimi, veri erişimi ve sayfa render mantığını bir arada yönetir.

## Fonksiyon Grupları

### Statik Üretim ve Yerelleştirme
Next.js'in derleme anında statik sayfaları oluşturması için gerekli parametreleri üretir ve kategori URL segmentlerinin dile göre çözümlemesini yapar.
- generateStaticParams, resolveLocalizedSegments

### Meta Veri Üretimi
Sayfanın başlık, açıklama gibi SEO meta bilgilerini dinamik olarak üretir. Kategori ve dil bilgisine göre yerelleştirilmiş meta veriler oluşturur.
- generateMetadata

### Veri Erişimi ve Parametre İşleme
Aile verilerini önbellekten getirir ve URL'den gelen sayfa parametresini güvenli bir şekilde sayıya dönüştürür. Bu fonksiyonlar sayfa bileşeni tarafından çağrılır.
- getCachedFamilies, parsePageParam

### Sayfa Bileşeni
Alt kategori sayfasının ana render mantığını içerir. Kategori ve alt kategori slug'larını, dil bilgisini ve sayfa parametrelerini alarak ilgili verileri getirir ve sayfayı oluşturur.
- Page

### Dış Bağımlılıklar
- `getCachedCategoryData` fonksiyonuna dış bağımlılık bulunur; `resolveLocalizedSegments` içinde ReturnType ile referans verilmiştir.
- Next.js framework'üne ait statik üretim ve meta veri altyapısı kullanılır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### getCachedFamilies
**Ne yapar**: Alt kategori aile listesi için önbellek mekanizması sağlar. Belirtilen dil, kiracı kimliği, kategori kimliği ve sayfa numarasına göre aile listesini döndürür.

**Nasıl yapar**: Önbellek anahtarı olarak dil (lang), kiracı kimliği (tenantId), kategori kimliği (categoryId) ve sayfa numarasının (page) birleşimini kullanır. Docstring'te belirtilen kural 12'ye uygun anahtar oluşturma yapar. Etiketler KEŞİF (discovery) alanı olarak kullanılır; ana sayfa (home-data) etiketi KULLANILMAZ (PS-042 kuralı). Fonksiyon gövdesi verilen kaynakta yer almadığından iç detay bilinmiyor.

**Parametreler**:
- lang: string — İstek yapılan dil kodu (örneğin "tr" veya "en")
- tenantId: string — Kiracı tanımlayıcısı
- categoryId: string — Alt kategori kimliği
- page: number — Sayfa numarası

**Dönüş**: Return tipi verilen kaynakta belirtilmemiş; bilinmiyor.

### parsePageParam
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### generateStaticParams
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### resolveLocalizedSegments
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### generateMetadata
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### Page
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../../../config/siteUrl::SITE_URL
- import: ../../../../../lib/cache/tags::PRODUCTS_DISCOVERY_TAG
- import: ../../../../../lib/cache/tags::discoveryTag
- import: ../../../../../lib/data/preload::getCachedCategoryData
- import: ../../../../../types/ui-models::type { FamilyListItem }
- import: ../../../../../utils/tenantServer::getTenantConfig
- import: ../../../../../views/CategoryPage::PageComponent
- import: @/i18n/dictionaries/en::en
- import: @/i18n/dictionaries/tr::tr
- import: @/i18n/getDictValue::getDictValue
- import: @/lib/services/family.service::getFamiliesEnriched
- import: @/lib/supabase/static::supabaseStaticClient
- import: @/utils/categoryHelpers::getCategoryDisplayName
- import: @/utils/categoryHelpers::getLocalizedCategorySlug
- import: next/cache::unstable_cache
- import: next/navigation::permanentRedirect
- import: react::React
- import: react::cache

---

## SABİTLER
- **getParentSlugSource** (call) — `cache(async (parentId: string) => {
  const { data } = await supabase
    ....`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::getCachedFamilies
- **params**: `lang` (string), `tenantId` (string), `categoryId` (string), `page` (number)
- **ic_degiskenler**:
  - `unstable_cache` çağrısı — `getFamiliesEnriched` fonksiyonunu `supabase` ile çağırır, `categoryIds: [categoryId]`, `limit: PAGE_SIZE`, `offset: (page - 1) * PAGE_SIZE` parametreleriyle veri çeker
  - cache key dizisi — `['subcategory-families', lang, tenantId, categoryId, String(page)]`
  - cache seçenekleri — `tags: [PRODUCTS_DISCOVERY_TAG, discoveryTag(tenantId)]`, `revalidate: 3600`
- **Dönüş**: `unstable_cache` sonucu (Promise — `getFamiliesEnriched` dönüşü)

### [N2_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::parsePageParam
- **params**: `raw` (string | string[] | undefined)
- **ic_degiskenler**:
  - `value` — `raw` dizi ise ilk elemanı (`raw[0]`), değilse `raw`'ın kendisi
  - `parsed` — `value`'nun `Number.parseInt(value ?? '1', 10)` ile sayıya çevrilmiş hali
- **Dönüş**: number — `parsed` sonlu ve 1'den büyükse `parsed`, değilse `1`

### [N3_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::generateStaticParams
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.from('categories').select('slug, metadata, parent_id').eq('is_active', true).not('parent_id', 'is', null)` sorgusunun sonucu
  - `parents` — `supabase.from('categories').select('id, slug, metadata').eq('is_active', true)` sorgusunun sonucu
  - `parentsList` — `(parents || [])` dizisi, `{ id: string, slug: string | null, metadata: unknown }` tipinde
  - `parentMap` — `parentsList`'ten üretilen `Map<string, { slug: string | null, metadata: unknown }>` — anahtar `p.id`, değer `{ slug: p.slug, metadata: p.metadata }`
  - `subCategoriesList` — `(data || [])` dizisi, `{ slug: string | null, metadata: unknown, parent_id: string | null }` tipinde
  - `c` — `subCategoriesList` üzerindeki her alt kategori elemanı
  - `parent` — `parentMap.get(c.parent_id || '')` ile bulunan üst kategori verisi
  - `lang` — `['tr', 'en']` sabit dizisi üzerindeki her dil elemanı
- **Dönüş**: `Array<{ lang: 'tr' | 'en', categorySlug: string, subCategorySlug: string }>` — her alt kategori ve her dil için `categorySlug` (üst kategorinin `getLocalizedCategorySlug(parent, lang)` sonucu, parent yoksa `'unknown'`) ve `subCategorySlug` (`getLocalizedCategorySlug(c, lang)` sonucu)

### [N4_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::resolveLocalizedSegments
- **params**: `category` (NonNullable<Awaited<ReturnType<typeof getCachedCategoryData>>>), `lang` (string), `fallbackParentSlug` (string)
- **ic_degiskenler**:
  - `subSlug` — `getLocalizedCategorySlug(category, lang)` sonucu
  - `parentSlug` — başlangıçta `fallbackParentSlug`, `category.parent_id` varsa ve `getParentSlugSource(category.parent_id)` dönüşü doluysa `getLocalizedCategorySlug(parent, lang) || fallbackParentSlug` olarak güncellenir
  - `parent` — `getParentSlugSource(category.parent_id)` çağrısının dönüşü
- **Dönüş**: `{ parentSlug: string, subSlug: string }`

### [N5_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::generateMetadata
- **params**: `{ params: Promise<{ categorySlug: string, subCategorySlug: string, lang: string }> }`
- **ic_degiskenler**:
  - `categorySlug` — `await params` ile çözümlenen üst kategori slug'ı
  - `subCategorySlug` — `await params` ile çözümlenen alt kategori slug'ı
  - `lang` — `await params` ile çözümlenen dil kodu
  - `category` — `getCachedCategoryData(subCategorySlug)` çağrısının sonucu
  - `dict` — `lang === 'en'` ise `en`, değilse `tr` sözlük nesnesi
  - `t` — `(key: string) => getDictValue(dict, key)` fonksiyonu
  - `displayName` — `getCategoryDisplayName(category, t)` sonucu
  - `desc` — `lang === 'en'` ise İngilizce, değilse Türkçe açıklama metni (`displayName` içerir)
  - `trSegments` — `resolveLocalizedSegments(category, 'tr', categorySlug)` sonucu
  - `enSegments` — `resolveLocalizedSegments(category, 'en', categorySlug)` sonucu
  - `trUrl` — `` `${SITE_URL}/tr/category/${trSegments.parentSlug}/${trSegments.subSlug}` ``
  - `enUrl` — `` `${SITE_URL}/en/category/${enSegments.parentSlug}/${enSegments.subSlug}` ``
  - `canonicalUrl` — `lang === 'en'` ise `enUrl`, değilse `trUrl`
- **Dönüş**: `{ title: string, description: string, alternates: { canonical: string, languages: { tr: string, en: string, 'x-default': string } } }` — `category` null ise `{ title: 'Category Not Found | VentHub' | 'Kategori Bulunamadı | VentHub' }`

### [N6_NASIL] AST Pointer: src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx::Page
- **params**: `{ params: Promise<{ categorySlug: string, subCategorySlug: string, lang: string }>, searchParams: Promise<{ page?: string | string[] }> }`
- **ic_degiskenler**:
  - `categorySlug` — `await params` ile çözümlenen üst kategori slug'ı
  - `subCategorySlug` — `await params` ile çözümlenen alt kategori slug'ı
  - `lang` — `await params` ile çözümlenen dil kodu
  - `pageParam` — `await searchParams` ile çözümlenen `page` değeri
  - `page` — `parsePageParam(pageParam)` sonucu (number)
  - `category` — `getCachedCategoryData(subCategorySlug)` çağrısının sonucu
  - `dict` — `lang === 'en'` ise `en`, değilse `tr` sözlük nesnesi
  - `parentSlug` — `resolveLocalizedSegments(category, lang, categorySlug)` sonucundan gelen üst kategori slug'ı
  - `subSlug` — `resolveLocalizedSegments(category, lang, categorySlug)` sonucundan gelen alt kategori slug'ı
  - `tenantId` — `(await getTenantConfig()).id` sonucu
  - `familiesPage` — `getCachedFamilies(lang, tenantId, category.id, page)` çağrısının sonucu
  - `families` — `familiesPage.items` — aile listesi dizisi, başlangıçta boş `[]`
  - `total` — `familiesPage.total` — toplam kayıt sayısı, başlangıçta `0`
- **Dönüş**: JSX — `React.Suspense` ile sarılmış `PageComponent` bileşeni (`initialCategory`, `families`, `total`, `page`, `pageSize` prop'ları ile) — `category` varsa ve slug'lar eşleşmiyorsa `permanentRedirect` ile yönlendirme yapar (dönüş yok, yan etki)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    page_tsx__Page["Page"]
    page_tsx__generateMetadata["generateMetadata"]
    page_tsx__generateStaticParams["generateStaticParams"]
    page_tsx__getCachedFamilies["getCachedFamilies"]
    page_tsx__parsePageParam["parsePageParam"]
    page_tsx__resolveLocalizedSegments["resolveLocalizedSegments"]
    page_tsx__generateMetadata --> page_tsx__resolveLocalizedSegments
    page_tsx__Page --> page_tsx__getCachedFamilies
    page_tsx__Page --> page_tsx__parsePageParam
    page_tsx__Page --> page_tsx__resolveLocalizedSegments
```

## NODE ID STANDARD

  file: page.tsx
  function: page.tsx::getCachedFamilies
  function: page.tsx::parsePageParam
  function: page.tsx::generateStaticParams
  function: page.tsx::resolveLocalizedSegments
  function: page.tsx::generateMetadata
  function: page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: generateMetadata
  export: generateStaticParams
  export: getCachedFamilies
  export: parsePageParam
  export: resolveLocalizedSegments

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-500`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `container`, `mx-auto`, `px-4`, `py-12`