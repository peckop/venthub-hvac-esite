---
id: 005
title: "Aşama 5: PDP Gateway Mimarisi (ProductDetailPage Parçalama)"
progress: "0%"
priority: "High"
created_at: "2026-03-19 02:18:00"
depends_on: [004]
status: Planning
started_at: "2026-03-19 02:18:03"
updated_at: "2026-03-19 13:00:04"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/active/005-asama-5-pdp-gateway-mimarisi-productdetailpage-par/brainstorm.md"
  plan: "registry/P04-Category-Architecture/active/005-asama-5-pdp-gateway-mimarisi-productdetailpage-par/plan.md"
  review: "registry/P04-Category-Architecture/active/005-asama-5-pdp-gateway-mimarisi-productdetailpage-par/review.md"
---










# 005 - PDP Gateway Mimarisi (ProductDetailPage Parçalama)

## 🎯 Hedef
800 satırlık devasa `ProductDetailPage.tsx` dosyasını, Gateway Pattern kullanarak modüler parçalara ayırmak ve projenin geri kalanıyla mimari uyum sağlamak.

## ✅ Alt Görevler
- [ ] `src/hooks/useProductGateway.ts` oluştur (Veri çekme, 3D modelleme kararı, PDF tetikleyici).
- [ ] PDP'yi görsel parçalara ayır (`ProductHero`, `ProductGallery`, `ProductSpecs`, `ProductActions`).
- [ ] `ProductDetailPage.tsx` dosyasını ince bir Gateway Dispatcher olarak refactor et.
- [ ] `any` dökümlerini tamamen temizle ve tip güvenliğini sağla.
- [ ] `tsc` ve `lint` kontrollerinden geç.
