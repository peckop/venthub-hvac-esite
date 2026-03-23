---
id: "003"
title: "Technical Debt Cleanup & Type Safety"
priority: "Medium"
status: "Completed"
progress: "100%"
depends_on: ["002"]
updated_at: "2026-03-23 11:47:30"
artifacts:
  brainstorm: "registry/P05-Next15-Modernization/completed/003-technical-debt-cleanup-type-safety/brainstorm.md"
  plan: "registry/P05-Next15-Modernization/completed/003-technical-debt-cleanup-type-safety/plan.md"
  review: "registry/P05-Next15-Modernization/completed/003-technical-debt-cleanup-type-safety/review.md"
---

# 003: Technical Debt Cleanup & Type Safety

Next.js 15 ve React 19 geçişi sırasında uygulanan geçici çözümlerin (Any casting) temizlenmesi ve tip güvenliğinin restore edilmesi.

## 🎯 Hedef
- Proje genelindeki `as any` kullanımlarını %90 oranında azaltmak.
- Supabase ve ID Mismatch (Database id vs code _id) sorunlarını kalıcı olarak çözmek.
- `pnpm run build` ve `tsc` mühürlerini geçmek.

## ✅ Alt Görevler
- [x] `admin.ts` ve `AdminCategoriesPage.tsx` üzerindeki `_id` bağımlılığını temizle.
- [x] `supabase.ts` içerisindeki proje yönetimi tiplerini modernize et (as any/as unknown kaldırıldı).
- [x] `env.d.ts` üzerinden global `process.env` tip güvenliğini sağla.
- [x] `pnpm run lint:ci` kontrolünden başarıyla geç.
- [x] `pnpm run build` ve `tsc` mühürlerini doğrula.
- [x] Registry protokolünü (Dörtlü Mühür) Superpowers ile entegre et.

---
*Görev başarılı bir şekilde tamamlanmış ve mühürlenmeye hazırdır.*
