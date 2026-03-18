---
id: 001
title: "Next.js 15: Altyapı ve Güvenlik Kilidi (Infrastructure Lockdown)"
progress: "100%"
priority: "High"
created_at: "2026-03-18 10:40:00"
completed_at: "2026-03-18 16:05:00"
depends_on: []
status: Completed
artifacts:
  brainstorm: "registry/P05-Next15-Modernization/active/001-infrastructure-lockdown/brainstorm.md"
  plan: "registry/P05-Next15-Modernization/active/001-infrastructure-lockdown/plan.md"
  review: "registry/P05-Next15-Modernization/active/001-infrastructure-lockdown/review.md"
---


# 001 - Infrastructure Lockdown (Next.js 15)

## 🎯 Hedef
Next.js 15 geçişi için temel altyapı hazırlıklarını yapmak, güvenliği `server-only` ile pekiştirmek ve dinamik rotalarda async params yapısına geçmek.

## ✅ Alt Görevler
- [x] `src/lib/supabase.ts` dosyasına `server-only` ekle.
- [x] `destek/konular/[slug]/page.tsx` asenkron parametre geçişini tamamla.
- [x] Build stabilitesini doğrula.
