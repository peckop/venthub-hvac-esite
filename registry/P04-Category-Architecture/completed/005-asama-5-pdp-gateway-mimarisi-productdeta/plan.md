# Plan: 005-pdp-gateway-architecture

## 🎯 Hedef
Ürün Detay Sayfası'nı (PDP) parçalayarak yüksek performanslı ve modüler bir Gateway yapısına kavuşturmak.

## ✅ Alt Görevler
- [x] `src/hooks/useProductGateway.ts` oluşturuldu ve mantık taşındı.
- [x] `src/components/product/` altında modüler PDP parçaları (`ProductBuySection`, `ProductVisualSection` vb.) oluşturuldu.
- [x] **Authority Integration:** `product_authorities` veritabanı tablosu ve PDP otonom "Uzman Görüşü" bileşeni.
- [x] **Dimensions Prep:** `technical_specs` içindeki `dimensions` verilerini (mm) standardize et (AR-Ready).
- [x] `ProductDetailPage.tsx` dosyasını Dispatcher olarak yeniden yazıldı.
- [x] Teknik özellik (Spec) gruplama mantığını `useProductGateway`'e taşı.
- [x] Final `tsc` ve `lint` kontrollerini yap.

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