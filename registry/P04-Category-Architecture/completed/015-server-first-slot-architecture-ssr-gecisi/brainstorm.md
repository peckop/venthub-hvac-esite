# 🧠 Brainstorming: P04/015 — Server-First Slot Architecture (SSR Geçişi)
> **Skill:** superpowers-brainstorm | **Model:** Claude Sonnet (Thinking) | **Tarih:** 2026-04-01
> **Yöntem:** Skill şablonu (Goal/Constraints/Risks/Options/Recommendation/Acceptance Criteria)

---

## Goal
`CategoryMasterView` ve ilgili sayfaları, ürün listesi verilerini Google bot'un HTML içinde görebileceği şekilde **sunucu taraflı (SSR)** olarak render edecek hale getirmek. Mevcut `'use client'` barikatını aşmak, `display_mode`'u DB'den gelen bilgiyle yönlendirmek ve `useCategoryGateway` hook'unu sadece **kullanıcı etkileşimi** (filtreler, sıralama) için client'ta tutmak.

---

## Constraints
1. **Next.js 15 Async Params Kuralı:** `params` ve `searchParams` nesneleri `await` edilmeden kullanılamaz.
2. **SSR-First Policy (GEMINI.md §5):** Yeni rotalar varsayılan olarak Server Component olmalı. `ssr: false` için mimari zorunluluk kanıtlanmalı.
3. **`useCategoryGateway` Dokunulmaz Hülya:** Bu hook `useParams`, `useRouter`, `useSearchParams` kullandığı için tamamen Client Component. Kaldırılmayacak, sadece **rolü daraltılacak** (başlangıç verisi server'dan gelecek, hook sadece client-side filtre/URL sync için kalacak).
4. **Tip Güvenliği:** `any` yasak, `DomainCategory` ve `DomainProduct` tip hattı kırılmaz.
5. **i18n Kuralı:** Kullanıcıya dönük metin `useI18n()` üzerinden.

---

## Known Context
Kod incelemesinden elde edilen **gerçek tablo:**

| Dosya | Şu An | Sorun |
|---|---|---|
| `category/[categorySlug]/page.tsx` | `async` — DB'den sadece **kategori** çekiyor | Ürün verisi yok, Google bot boş HTML görüyor |
| `CategoryMasterView.tsx` | `'use client'` — tüm veri client'ta | SEO = 0, LCP yüksek |
| `useCategoryGateway.ts` | `'use client'` — `getProductsEnriched()` call'u burada | Hook tamamen client-bound, taşınamaz |
| `category/[catSlug]/[subCatSlug]/page.tsx` | `initialCategory` prop geçmiyor mu? | Sub-kategori SSR verisi eksik |
| `products/page.tsx` | `CategoryMasterView` kullanıyor | Discovery sayfası da SSR dışı |

**Kritik Bulgu:** `page.tsx` zaten `async` bir Server Component. Kategori verisini SSR'da çekiyor. Asıl eksik: **ürün verisi** SSR'da çekilmiyorBeyin fırtınasının özü budur.

---

## Risks
1. **Hydration mismatch (En Yüksek Risk):** Server HTML'de ürünler varken, `useCategoryGateway`  client mount'ta tekrar fetch edip farklı sıralama dönerse React hydration hatası oluşur.
   - **Çözüm:** Gateway hook'a `initialProducts` prop'u ekle, ilk render'da bunu kullan, client'ta sadece filtre değişince refetch yap.
2. **`CategoryContext` bağımlılığı:** `useCategoryGateway` → `useCategories()` (CategoryContext) çekiyor. Bu hook SSR'da çalışmaz.
   - **Çözüm:** Server'da `getCategoryData()` fonksiyonu zaten Supabase'den doğrudan çekiyor. Bu yolu kullan, hook'un context bağımlılığına dokunma.
3. **Sub-kategori sayfası (`[subCategorySlug]`):** `initialCategory` prop'u geçiyor mu? Geçmiyorsa double-fetch yaşanır.
4. **`products/page.tsx` SSR:** Discovery sayfasına `initialProducts` vermek gerekirm. Kategori ID'si olmadan "tüm ürünler" SSR'da çekilmeli.
5. **`generateStaticParams` + SSR Çelişkisi:** Şimdi `generateStaticParams` kullanıyor. Bu ISG (Incremental Static Generation) biçimiyle SSR uyumunu test etmek gerekecek.

---

## Options

### Seçenek A: "Thin Server Shell" (ÖNERİLEN)
**Girdi → İşlem → Çıktı:**
- `page.tsx` → `Promise.all([getCategory(), getProducts()])` paralel çekiyor
- Sonuçlar `CategoryMasterView`'e `initialCategory` + `initialProducts` prop olarak iniyor
- `CategoryMasterView` → ilk render Server Component gibi davranıyor, `useCategoryGateway`'e bu verileri `initialData` olarak geçiyor
- `useCategoryGateway` → sadece `initialCategory/initialProducts` yoksa fetch yapıyor, filtre değişimlerini client'ta yönetiyor

**Artısı:** En az değişiklik, en az hydration riski.  
**Eksileri:** `CategoryMasterView` hâlâ `'use client'`. Google bot HTML'de ürünleri görür (Suspense boundary dışı).

### Seçenek B: "Pure Server Component Split"
`CategoryMasterView`'ı ikiye böl:
- `CategoryShell` (Server Component) → statik içerik + ürün listesi HTML
- `CategoryFilters` (Client Component) → filtreler, sıralama, URL sync

**Artısı:** Mükemmel SEO.  
**Eksileri:** Büyük refactor risk. `useCategoryGateway` köklü değişim gerektirir. P04/016 i18n ile çakışabilir.

### Seçenek C: "Streaming RSC + Suspense"
Next.js 15 `loading.tsx` + React `Suspense` ile server'dan stream'le.

**Artısı:** Modern en doğru mimari.  
**Eksileri:** Supabase edge function veya server action gerektirebilir. Kapsam sürüm geçişi.

---

## Recommendation
**Seçenek A → "Thin Server Shell"** uygulanmalı.

**Gerekçe:**
- Kod tabanının mevcut karmaşıklığı yüksek. Seçenek B ve C sezon ortasında yapılacak büyük bir cerrahi.
- **Hedef:** Google bot'un ürün listesini HTML'de görmesi. Seçenek A bunu %100 karşılar.
- **Sonraki adım (P04/016 sonrası):** Seçenek B/C'ye geçiş planlanabilir.
- **Hydration fix:** `useCategoryGateway`'e `initialProducts` prop eklenerek hook "hydration-safe" yapılır.

---

## Acceptance Criteria
1. `curl https://venthub-hvac.com/category/fanlar | grep "<div"` → ürün kartı HTML'leri görünür
2. `pnpm run build` → 0 hata, 0 uyarı
3. `pnpm exec tsc -b tsconfig.build.json` → 0 tip hatası
4. `pnpm run lint` → 0 ESLint hatası
5. Sub-kategori sayfası (`[subCategorySlug]`) → `initialCategory` prop'u doğru iniyor
6. `products/page.tsx` → `initialProducts` SSR'dan geliyor

---

## 🕵️ Terminal İzleri
> **view_file** → `CategoryMasterView.tsx` satır 1-113 incelendi
> **view_file** → `useCategoryGateway.ts` satır 1-203 incelendi
> **view_file** → `category/[categorySlug]/page.tsx` satır 1-85 incelendi
> **grep_search** → `display_mode` için `src/` tarandı (7 sonuç)
> **grep_search** → `CategoryMasterView` için `src/` tarandı (7 sonuç)

<!-- ARTIFACT_SIGNATURE:1775045393:55a47766bababf55a2ccaee47e38c9fb0712ee4ad3dcf57438963900d2fa0d70 -->