# 📝 Implementation Plan: P04/015 — Server-First Slot Architecture (SSR Geçişi)
> **Skill:** superpowers-write-plan | **Model:** Gemini 3.1 Pro (High) | **Tarih:** 2026-04-01
> **Brainstorm:** P04/015 numaralı brainstorm kararları baz alınmıştır.

---

## V2 Harmanlama (Brainstorm Kararları)
- **Hedef:** Kategori sayfası ve discovery (products) sayfasının ürün verilerini Server-Side (SSR) çekmesi.
- **Strateji:** "Thin Server Shell" - `page.tsx` DB'den veriyi paralelde alıp `CategoryMasterView` bileşenine `initialProducts` olarak sunacak. `useCategoryGateway` ise URL Sync / Filtre görevinde, hydation safe modda kalacak.

---

## ✅ Uygulama Adımları

### Adım 1: Component Tip Tanımlarının Güncellenmesi
1. `src/views/CategoryMasterView.tsx` dosyasını aç.
2. `CategoryMasterViewProps` interface'ine `initialProducts?: DomainProduct[]` beklemesi için tür tanımı ekle.
3. Prop destructuring kısmına (satır 20) `initialProducts` ekle ve `useCategoryGateway` hook'una (satır 32) ikinci argüman olarak geçir.
- **Verify:** `pnpm exec tsc -b tsconfig.build.json` çalıştır, hata dönmediğini teyit et.

### Adım 2: CategoryGateway Hook'unun Hydration Güvenliğine Alınması
1. `src/hooks/useCategoryGateway.ts` dosyasını aç.
2. Hook parametrelerini `(initialCategory?: DomainCategory | null, initialProducts?: Product[])` şeklinde güncelle.
3. State tanımlarındaki (satır 59) `products` default değerini `useState<Product[]>(initialProducts ?? [])` yap.
4. `fetchData` fonksiyonu (satır 119) içinde, `if (slug)` ve ürün çekme mantığını (satır 168) yeniden ele al: Eğer `initialProducts` doluysa ve o anki `slug` ilk yüklenen sayfayı temsil ediyorsa DB fetch işlemini atla (skip early fetch). Sadece URL filtreleri (searchParams) değiştiğinde veya farklı kategoriye geçildiğinde fetch yap.
- **Verify:** Hook'un derlendiğini ve tip hataları üretmediğini teyit et.

### Adım 3: Kategori [slug] Sayfasına Paralel Veri Çekme İşlemi (SSR)
1. `src/app/category/[categorySlug]/page.tsx` dosyasını aç.
2. `getCategoryData` fonksiyonunun altına, dönen kategori ID'si (ve alt kategorileri varsa dahil) üzerinden ürünleri çekmek için `getProductsEnriched` mantığını ekle veya ikisini sarmalayan `getCategoryWithProducts` adında yeni bir yardımcı fonksiyon oluştur.
3. Kategori verisini çektikten sonra, ID'yi kullanarak ikinci bir `await` ile ürünleri çek (Sequential Fetch).
4. Dönen ürün listesini `<PageComponent initialCategory={category} initialProducts={products} />` şeklinde view'a aktar.
- **Verify:** `curl` ile local sunucu üzerinden `/category/fanlar` yolunu çağır, HTML response içinde ürün başlıklarının (Örn: "Kanal Tipi Fan") olduğunu doğrula.

### Adım 4: Alt Kategori [subCategorySlug] Sayfasının SSR Uyumlu Yapılması
1. Seçilmiş alt kategori rotası (`src/app/category/[categorySlug]/[subCategorySlug]/page.tsx` vb.) varsa aç.
2. Buranın da hem kategori detayını hem de o ID'ye ait ürün dataset'ini SSR çekmesini sağla.
3. `PageComponent` bileşenine `initialProducts` prop'unu geçir.
- **Verify:** Tarayıcıda Network tab'ında JS kapatıldığında bile ürün resim ve kartlarının ekranda belirdiğini doğrula.

### Adım 5: Tüm Ürünler (Products Discovery) SSR Desteği
1. `src/app/products/page.tsx` dosyasını aç.
2. Next.js App Router Page bileşeni olarak asenkron işaretle (`export default async function Page()`).
3. Herhangi bir kategori filtresi olmadan (`categoryIds` yokken) ilk ürün batch'ini çek (limit: 100).
4. `CategoryMasterView` bileşenine `<CategoryMasterView initialProducts={products} />` prop'unu yolla.
- **Verify:** `pnpm run build` komutunun prerender limitlerine takılmadan eksiksiz çalıştığını kontrol et.

---
**Durum:** Beklemede (Kullanıcı veya sentinel execute onayı bekliyor)

<!-- ARTIFACT_SIGNATURE:1775045393:e91590da4e8f2e8037c6dd066da68615a207dbf8bc8d28cc245eac67416f988a -->