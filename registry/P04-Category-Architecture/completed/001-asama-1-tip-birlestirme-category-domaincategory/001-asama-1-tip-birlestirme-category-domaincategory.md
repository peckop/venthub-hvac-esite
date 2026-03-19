---
id: 001
title: "Aşama 1: Tip Birleştirme (Category -> DomainCategory)"
priority: "CRIT"
status: "Completed"
progress: 100%
project: "P04-Category-Architecture"
created_at: "2026-03-17 15:53:57"
updated_at: "2026-03-19 13:00:04"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/completed/001-asama-1-tip-birlestirme-category-domaincategory/brainstorm.md"
  plan: "registry/P04-Category-Architecture/completed/001-asama-1-tip-birlestirme-category-domaincategory/plan.md"
  review: "registry/P04-Category-Architecture/completed/001-asama-1-tip-birlestirme-category-domaincategory/review.md"
---


# 🛠️ 001: Aşama 1: Tip Birleştirme (Category -> DomainCategory)
Sistemde kullanılan eksik/kirli referans olan `Category` tipini (supabase.ts içinde tanımlı olan) doğrudan `ui-models.ts` içindeki güvenli `DomainCategory` türüne eşitlemek.

## 🎯 Hedefler
- [x] `src/lib/supabase.ts` dosyasında `export interface Category` tanımı kaldırılacak.
- [x] Yerine `import type { DomainCategory } from '../types/ui-models'` eklenip, `export type Category = DomainCategory` alias'ı yazılacak.

## ✅ Alt Görevler
- [x] `src/lib/supabase.ts` düzenlemesi.
- [x] Terminalden `pnpm exec tsc -b tsconfig.build.json` ve `pnpm run lint:ci` kontrolü.
