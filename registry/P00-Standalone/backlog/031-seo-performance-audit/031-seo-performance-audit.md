---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-17 19:15:27"
id: 031
title: "SEO & Core Web Vitals (Performance) Audit"
status: "Backlog"
progress: "0%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: "registry/P00-Standalone/backlog/031-seo-performance-audit/brainstorm.md"
  plan: "registry/P00-Standalone/backlog/031-seo-performance-audit/plan.md"
  review: "registry/P00-Standalone/backlog/031-seo-performance-audit/review.md"
---




















# 031 - SEO & Core Web Vitals (Performance) Audit

## 🎯 Hedef
Google Lighthouse skorlarını 95+ seviyesinde tutmak ve teknik SEO tarafındaki eksikleri (Structured Data vb.) tamamlamak.

## ✅ Alt Görevler
- [ ] **LCP Optimizasyonu:** `HomeSinevizyon` ve `ProductDetailPage` görsellerine `priority` propunun eklenmesi ve `sizes` analizi.
- [ ] **Skeleton Screens:** CSR (Client Side Rendering) olan bölümler için `Skeleton` iskelet yapılarının standartlaştırılması.
- [ ] **JSON-LD Genişletme:** Tüm sayfalara `BreadcrumbList` ve global `WebSite` Search Action eklenmesi.
- [ ] **Alt Etiketi Envanteri:** Tüm `<img>` ve `Image` etiketlerinin `alt` metinlerinin i18n uyumlu hale getirilmesi.
- [ ] **CLS Engelleme:** Dinamik yüklenen (dynamic import) bileşenlerin yüksekliklerinin (min-height) sabitlenmesi.

## 🛠️ Teknik Detaylar
- Tool: Next.js Image Optimization, Google Search Console Guidelines.
- Components: `src/components/ui/Skeleton.tsx`, `src/app/layout.tsx`.
