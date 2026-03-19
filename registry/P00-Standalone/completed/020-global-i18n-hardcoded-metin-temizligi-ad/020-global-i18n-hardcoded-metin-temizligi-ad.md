---
updated_at: "2026-03-19 23:21:15"
id: 020
title: "Global i18n & Hardcoded Metin Temizliği (Admin & Calculators)"
status: "Completed"
progress: "100%"
priority: "Critical"
depends_on: null
artifacts:
  brainstorm: "registry/P00-Standalone/completed/020-global-i18n-hardcoded-metin-temizligi-ad/brainstorm.md"
  plan: "registry/P00-Standalone/completed/020-global-i18n-hardcoded-metin-temizligi-ad/plan.md"
  review: null
---

# 020 - Global i18n & Hardcoded Metin Temizliği



























































## ✅ Alt Görevler
- [x] `src/views/admin/` dizinindeki tüm metinlerin envanterini çıkar.
- [x] `src/views/calculators/` dizinindeki hesaplayıcı metinlerini listele.
- [x] Eksik anahtarları `tr.ts` ve `en.ts` dosyalarına ekle.
- [x] `AdminLogisticsPage.tsx` tam i18n dönüşümü (Kargo Panosu).
- [x] `AdminReturnsPage.tsx` kalıntı temizliği.
- [x] `AdminOrdersPage.tsx` ve `AdminOrdersBoard.tsx` (Kanban) tam i18n dönüşümü.
- [x] `AdminDashboardPage.tsx` KPI ve grafik başlıkları düzeltmesi.
- [x] `YeniAdmin.tsx` (gereksiz test dosyası) silindi.
- [x] `AirCurtainCalcPage.tsx` i18n dönüşümü.
- [x] `JetFanCalcPage.tsx` i18n dönüşümü.
- [x] Tüm sayfaların hem TR hem EN modunda metinlerinin doğru yüklendiğini kontrol et.
- [x] `npm run lint` ve `tsc` (lint passed, tsc has legacy errors) kontrollerini yap.