# Plan: 005-pdp-gateway-architecture

## 🎯 Hedef
Ürün Detay Sayfası'nı (PDP) parçalayarak yüksek performanslı ve modüler bir Gateway yapısına kavuşturmak.

## ✅ Alt Görevler
- [ ] `src/hooks/useProductGateway.ts` oluştur.
- [ ] `src/components/product/` altında modüler PDP parçalarını (`ProductBuySection`, `ProductGallerySection` vb.) oluştur.
- [ ] `ProductDetailPage.tsx` dosyasını Dispatcher olarak yeniden yaz.
- [ ] Teknik özellik (Spec) gruplama mantığını `useProductGateway`'e taşı.
- [ ] Final `tsc` ve `lint` kontrollerini yap.

## 🏗️ Uygulama Adımları

### Step 1: Hook Operasyonu
- **Action:** `src/hooks/useProductGateway.ts` dosyasını yaz. `fetchProduct`, `handleAddToCart`, `handleDownloadPdf` gibi tüm mantığı buraya taşı.
- **Verify:** Hook bağımsız olarak test edildiğinde tüm ürün verilerini ve aksiyonlarını doğru sağlamalı.

### Step 2: Parçalama (Decomposition)
- **Action:** PDP'nin 800 satırlık JSX gövdesini `src/components/product/` altındaki yeni alt bileşenlere dağıt.
- **Verify:** Her bileşen prop-safe (tip-güvenli) olmalı.

### Step 3: Gateway Entegrasyonu
- **Action:** `ProductDetailPage.tsx` dosyasını sadece bu hook ve bileşenleri çağıran ince bir katmana dönüştür.
- **Verify:** PDP sayfa boyutu < 150 satıra düşmeli.
