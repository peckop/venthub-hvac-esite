---
id: 002
title: "Aşama 2: DB Migration (categoryMetadata.ts -> Database)"
priority: "HIGH"
status: "Completed"
progress: 100%
project: "P04-Category-Architecture"
created_at: "2026-03-17 15:53:57"
updated_at: "2026-03-19 12:50:43"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/completed/002-asama-2-db-migration-categorymetadata-ts-database/brainstorm.md"
  plan: "registry/P04-Category-Architecture/completed/002-asama-2-db-migration-categorymetadata-ts-database/plan.md"
  review: "registry/P04-Category-Architecture/completed/002-asama-2-db-migration-categorymetadata-ts-database/review.md"
---


# 🛠️ 002: Aşama 2: DB Migration (categoryMetadata.ts -> Database)
Statik kategori özelliklerini (`categoryMetadata.ts`) Supabase `categories.metadata` sütununa taşımak ve merkezi yönetimi sağlamak.

## 🎯 Hedefler
- [x] `categoryMetadata.ts` verilerini JSON formatında DB'ye taşımak.
- [x] Kod içindeki statik bağımlılığı kaldırıp tamamen DB-driven yapıya geçmek.

## ✅ Alt Görevler
- [x] SQL metadata komutlarını hazırlama ve uygulama.
- [x] `src/config/categoryMetadata.ts` dosyasını temizleme.
- [x] `CategoryPage.tsx` entegrasyonu.
