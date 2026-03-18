# Plan: 003-gateway-architecture

## 🎯 Goal
`CategoryPage.tsx` monolitini parçalayıp Gateway Mimarisine dönüştürmek.

## 🚧 Steps

1. **Görünüm Bileşenlerini (Views) Oluşturma:**
   - Files: `src/views/category/CategoryGridView.tsx`, `src/views/category/CategoryShowcaseView.tsx`, `src/views/category/CategoryLandingView.tsx`
   - Change: `CategoryPage.tsx` içindeki farklı `displayMode` render bloklarını bağımsız dosyalara taşı.
   - Verify: Bileşenlerin `initialProducts` ve `category` verilerini props olarak aldığını doğrula.

2. **Ortak Bileşenlerin (Components) Ayrıştırılması:**
   - Files: `src/components/category/CategoryHero.tsx`, `src/components/category/CategoryFilters.tsx`, `src/components/category/CompareBar.tsx`
   - Change: `CategoryPage.tsx` içindeki devasa TSX bloklarını (Breadcrumb, Filter Sidebar vb.) bağımsız bileşenlere dönüştür.
   - Verify: Her bileşenin kendi içinde `useI18n()` kullanarak dil uyumlu olduğunu denetle.

3. **Filtreleme Mantığının (Logic) Soyutlanması:**
   - File: `src/hooks/useCategoryFilter.ts`
   - Change: `filteredProducts` hesaplama ve state yönetimini (priceRange, selectedBrands vb.) custom hook'a taşı.
   - Verify: Hook'un `filteredProducts` listesini ve setter fonksiyonlarını doğru döndürdüğünü test et.

4. **Gateway Refactor (CategoryPage.tsx):**
   - File: `src/views/CategoryPage.tsx`
   - Change: Dosyayı sadece veri çeken (fetch) ve `display_mode`'a göre doğru `View` bileşenini çağıran bir "Gateway" haline getir.
   - Verify: Toplam satır sayısının 150'nin altına indiğini kontrol et.

5. **Lighthouse & Tip Kontrolü:**
   - Action: `pnpm run lint:ci` && `pnpm tsc --noEmit`
   - Verify: Hiçbir tip hatası veya performans kaybı olmadığını doğrula.
