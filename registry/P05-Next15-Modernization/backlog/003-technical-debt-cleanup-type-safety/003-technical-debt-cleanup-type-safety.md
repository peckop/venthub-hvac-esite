---
id: "003"
title: "Technical Debt Cleanup & Type Safety"
priority: "Medium"
status: "Planning"
progress: "0%"
depends_on: ["002"]
updated_at: "2026-03-19 23:21:18"
artifacts:
  brainstorm: "registry/P05-Next15-Modernization/backlog/003-technical-debt-cleanup-type-safety/brainstorm.md"
  plan: "registry/P05-Next15-Modernization/backlog/003-technical-debt-cleanup-type-safety/plan.md"
  review: "registry/P05-Next15-Modernization/backlog/003-technical-debt-cleanup-type-safety/review.md"
---



















# 003: Technical Debt Cleanup & Type Safety

Next.js 15 ve React 19 geçişi sırasında uygulanan geçici çözümlerin (Any casting) temizlenmesi ve tip güvenliğinin restore edilmesi.

## 🎯 Hedef
- Proje genelindeki `as any` kullanımlarını %90 oranında azaltmak.
- Lucide ikonları ve Next.js `Image` bileşenleri için kalıcı tip çözümleri üretmek.

## ✅ Alt Görevler
- [ ] `SearchOverlay.tsx` içindeki tip zorlamalarını kaldır.
- [ ] `TopicPage.tsx` bileşenini stabilize et.
- [ ] `LoginPage.tsx` ve `auth.ts` üzerindeki geçici tipleri temizle.
- [ ] `pnpm run lint:ci` kontrolünden başarıyla geç.
- [ ] Hata loglama servislerini stabilize et (after API iptal edildi).
