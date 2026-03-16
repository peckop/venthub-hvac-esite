---
updated_at: "2026-03-16 16:35:00"
id: 031
title: "SEO & Core Web Vitals (Performance) Audit"
status: "Backlog"
progress: "0%"
priority: "High"
depends_on: null
artifacts:
  brainstorm: null
  plan: null
  review: null
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
