---
id: 001
title: "Next.js 15: Altyapı ve Güvenlik Kilidi (Infrastructure Lockdown)"
priority: "High"
created_at: "2026-03-18 10:40:00"
depends_on: []
artifacts:
  brainstorm: "registry/P05-Next15-Modernization/completed/001-next-js-15-altyapi-ve-guvenlik-kilidi-infrastructu/brainstorm.md"
  plan: "registry/P05-Next15-Modernization/completed/001-next-js-15-altyapi-ve-guvenlik-kilidi-infrastructu/plan.md"
  review: "registry/P05-Next15-Modernization/completed/001-next-js-15-altyapi-ve-guvenlik-kilidi-infrastructu/review.md"
status: Completed
progress: 100%
completed_at: "2026-03-18 19:14:32"
updated_at: "2026-03-19 13:00:04"
---



# 001 - Infrastructure Lockdown (Next.js 15)

## 🎯 Hedef
Next.js 15 geçişi için temel altyapı hazırlıklarını yapmak, güvenliği `server-only` ile pekiştirmek ve dinamik rotalarda async params yapısına geçmek.

## ✅ Alt Görevler
- [x] `src/lib/supabase.ts` dosyasına `server-only` ekle.
- [x] `destek/konular/[slug]/page.tsx` asenkron parametre geçişini tamamla.
- [x] Build stabilitesini doğrula.
