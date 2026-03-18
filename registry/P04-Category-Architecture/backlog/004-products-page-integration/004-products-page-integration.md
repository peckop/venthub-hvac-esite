---
id: 004
title: "Aşama 4: ProductsPage Birleştirme"
status: "Pending"
progress: "0%"
priority: "Medium"
created_at: "2026-03-17 15:53:57"
updated_at: "2026-03-17 19:15:27"
started_at: null
completed_at: null
depends_on: [003]
artifacts:
  brainstorm: "registry/P04-Category-Architecture/backlog/004-products-page-integration/brainstorm.md"
  plan: "registry/P04-Category-Architecture/backlog/004-products-page-integration/plan.md"
  review: "registry/P04-Category-Architecture/backlog/004-products-page-integration/review.md"
---





















# 004 - ProductsPage Birleştirme

## 🎯 Hedef
Uygulamanın genel ürün vitrini `/products` sayfası ile `/category` sayfaları arasında UX ve filtreleme gücü standartlarını tek bir premium yapı etrafında buluşturmak. 

## ✅ Alt Görevler
- [ ] `/products` router'ını (Next.js Application Layout Page) incele.
- [ ] Eski `ProductsPage.tsx` yaklaşımı ile yeni oluşturulan Gateway Mimarisine entegre edilebilirliğini planla.
- [ ] `/products` sayfasında `CategoryProductsView`'u entegre et, initialCategories olarak tümünü seç ve ürünleri aktif liste olarak geçir.
- [ ] Gereksizleşen veya kopyası olan `ProductsPage`'in özel view dosyalarını sil.
- [ ] Uçtan uca ürün filtreleme navigasyonunu test et.
