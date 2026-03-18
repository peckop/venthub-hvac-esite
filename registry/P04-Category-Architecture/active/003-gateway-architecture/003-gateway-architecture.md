---
id: 003
title: "Aşama 3: Gateway Mimarisi (CategoryPage Parçalama)"
progress: "0%"
priority: "High"
created_at: "2026-03-17 15:53:57"
completed_at: null
depends_on: [002]
status: Planning
started_at: "2026-03-18 11:16:29"
updated_at: "2026-03-18 11:16:29"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/active/003-gateway-architecture/brainstorm.md"
  plan: "registry/P04-Category-Architecture/active/003-gateway-architecture/plan.md"
  review: "registry/P04-Category-Architecture/active/003-gateway-architecture/review.md"
---
















# 003 - Gateway Mimarisi (CategoryPage Parçalama)

## 🎯 Hedef
800 satırlı `CategoryPage.tsx` dosyasında bulunan veri çekme ve tasarımsal yönlendirme mantıklarını Gateway Pattern eşliğinde ayırmak. `showcase_images`, `hero_description` gibi alanları farklı görünümlerde kod tekrarı olmadan (DRY prensibi) kullanmak.

## ✅ Alt Görevler
- [ ] `src/views/category/` dizini altında `CategoryGridView.tsx` oluştur (eski CategoryShowcase parçası).
- [ ] `CategoryProductsView.tsx` oluştur (alt kategori ve filtrelenebilen ürün listesi).
- [ ] `CategoryShowcaseView.tsx` premium seri için oluştur.
- [ ] Ortak `CategoryHero.tsx` ve `CategoryFilters.tsx` componentlerini `src/components/category/` içinde yarat.
- [ ] `CategoryPage.tsx` dosyasını sadece bir yönlendirici (Gateway) olacak şekilde refactor et (en fazla ~100 satır).
- [ ] Gerekli kontroller için projeyi lint (`pnpm run lint:ci`) ve type check (`tsc`) ile denetle.
