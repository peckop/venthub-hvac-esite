---
id: 004
title: "Test Altyapısının Yeniden Kurulması"
status: "Completed"
progress: "100%"
priority: "Critical"
depends_on: null
artifacts:
  brainstorm: "plans/004-test-brainstorm.md"
  plan: "plans/004-test-setup-plan.md"
  review: null
---

# 004 - Test Altyapısının Yeniden Kurulması

## 🎯 Hedef
Vite temizliği sonrası silinen test altyapısını Next.js 14 uyumlu (Vitest + SWC) olarak geri kurmak.

## ✅ Alt Görevler
- [x] `vitest`, `happy-dom` ve `@vitejs/plugin-react-swc` paketlerini kur.
- [x] `vitest-setup.tsx` üzerinden Next.js Navigation, Headers, i18n ve Supabase için global mock altyapısını kur.
- [x] `.skip` yapılan testleri canlandır ve Next.js kancalarına göre refactor et.
- [x] 14 test dosyasından 12'sinin başarıyla geçmesini sağla (Kritik Views: ReviewSummary, ReturnsModal vb. düzeltildi).
- [x] `npm test` komutunu aktif et.
