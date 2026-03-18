# Plan: 003-gateway-architecture

## 🎯 Goal
`CategoryPage.tsx` monolitini parçalayarak modüler, yüksek performanslı ve tip-güvenli bir Gateway mimarisine geçiş.

## 🏗️ Steps

### 1. Hooks ve Logic Katmanı Ayrımı
- **Action:** `src/hooks/useCategoryGateway.ts` dosyasını oluştur. `CategoryPage.tsx` içindeki tüm `fetchData`, `filter` ve `sort` mantığını (ve ilgili state'leri) buraya taşı.
- **Next.js 15 Fix:** Hook içinde `params` çözümlemesini Next.js 15 standartlarına göre ayarla.
- **Verify:** `tsc --noEmit` çalıştırıldığında hook'un tip-güvenli olduğu onaylanmalı.

### 2. Alt Görünümlerin Oluşturulması (Sub-Views)
- **Action:** `src/views/category/` dizini altında şu dosyaları oluştur:
  - `CategoryGridView.tsx`: Standart filtreli liste.
  - `CategoryShowcaseView.tsx`: Marka/Ana kategori tanıtımı.
  - `CategoryLandingView.tsx`: Seri/Ürün grubu sayfası.
- **Verify:** Her view bileşeni, `CategoryPage.tsx`'ten izole edildiğinde tek başına render edilebilmeli.

### 3. Ortak Bileşenlerin (Shared Components) Rafinasyonu
- **Action:** Mevcut devasa JSX bloklarından `CategoryHero`, `CategoryFilters` ve `CategoryBreadcrumbs` yapılarını `src/components/category/` altına (eğer yoksa) taşı veya güncelle.
- **Verify:** Filtreleme state'i View'lar arasında prop-drilling olmadan doğru şekilde akmalı.

### 4. Gateway Dispatcher (Refactor)
- **Action:** `src/views/CategoryPage.tsx` dosyasını baştan yaz. 
  - `useCategoryGateway` hook'unu çağır.
  - `displayMode`'a göre ilgili Sub-View'ı render et.
  - SEO ve Breadcrumb verilerini merkezi olarak yönet.
- **Cleanup:** Dosyadaki tüm `as any` kullanımlarını ve Vite `react-router-dom` kalıntılarını temizle.
- **Verify:** Ana kategori sayfası boyutu 800 satırdan < 150 satıra düşmeli.

### 5. Final Validasyon ve Sync
- **Action:** `pnpm run lint:ci` ve `pnpm build` komutlarını çalıştır.
- **Verify:** Build sürecinde kategori sayfaları için sıfır hata raporlanmalı.
