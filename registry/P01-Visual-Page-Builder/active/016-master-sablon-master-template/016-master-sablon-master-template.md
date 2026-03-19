---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-19 23:21:15"
id: 016
title: "Master Şablon (Master Template)"
status: "Executing"
progress: "0%"
priority: "Critical"
depends_on: [015]
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/active/016-master-sablon-master-template/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/active/016-master-sablon-master-template/plan.md"
  review: "registry/P01-Visual-Page-Builder/active/016-master-sablon-master-template/review.md"
---




































# 016 - Master Şablon (Master Template)

## 🎯 Hedef
Page Builder'ın kalbi olan, tüm dinamik veriyi alıp sayfa düzenini (Layout) oluşturan ana şablonun (Master Template) teslim edilmesi.















## ✅ Alt Görevler
- [ ] `src/components/layout/MainLayout.tsx` merkezi şablon bileşeninin oluşturulması.
- [ ] Header, StickyHeader ve Footer bileşenlerinin bu şablona gömülmesi.
- [ ] Sayfa bazlı `PageShell` yardımcı bileşeninin (spacing, max-width yönetimi) yazılması.
- [ ] App Router (`app/layout.tsx`) üzerindeki dağınık yapıların bu yeni şablona taşınması.
- [ ] Sayfa geçişleri için `Framer Motion` veya CSS tabanlı merkezi bir "Layout Transition" altyapısı.