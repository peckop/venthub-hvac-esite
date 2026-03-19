---
id: 001
title: "Database Type Safety & RPC Normalization"
status: "Completed"
progress: "100%"
priority: "CRIT"
created_at: "2026-03-16 23:38:23"
updated_at: "2026-03-19 23:21:16"
started_at: "2026-03-16 23:38:44"
completed_at: "2026-03-16 23:46:21"
depends_on: null
artifacts:
  brainstorm: "registry/P02-Core-Quality-Guardians/completed/001-database-type-safety-rpc-normalization/brainstorm.md"
  plan: "registry/P02-Core-Quality-Guardians/completed/001-database-type-safety-rpc-normalization/plan.md"
  review: null
---

# 001 - Database Type Safety & RPC Normalization

## 🎯 Hedef
...



























































## ✅ Alt Görevler
- [ ] Supabase CLI/MCP kullanarak güncel veritabanı tiplerini üret.
- [ ] Hedef dosya: `src/types/database.types.ts`
- [ ] Doğrulama: Dosyanın varlığı ve içeriğinin tablo şemalarıyla uyumu.
- [ ] `src/lib/supabase.ts` dosyasına `Database` tipini dahil et.
- [ ] `const supabase = createClient<Database>(...)` şeklinde generic tip atamasını yap.
- [ ] `fts_search_products` için `as any` kaldır, RPC tipini tanımla.
- [ ] `get_products_enriched` için `as any` kaldır, RPC tipini tanımla.
- [ ] `get_effective_price` için `as any` kaldır, RPC tipini tanımla.
- [ ] `supabase.from('...')` çağrılarındaki tüm `as any` dökümlerini temizle.
- [ ] SQL `RPC` çağrılarını `supabase.rpc('...')` formatına (type-safe) çek.
- [ ] `pnpm exec tsc -b tsconfig.build.json` çalıştırarak tip hatalarını kontrol et.
- [ ] `pnpm run lint` ile standartları doğrula.
- [ ] `pnpm run build:ci` ile üretim build'ini test et.