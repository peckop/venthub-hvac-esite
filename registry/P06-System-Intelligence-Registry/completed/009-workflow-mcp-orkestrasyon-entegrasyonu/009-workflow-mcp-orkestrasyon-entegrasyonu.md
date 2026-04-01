---
id: "009"
title: "Workflow-MCP Orkestrasyon Entegrasyonu"
priority: "High"
status: "Completed"
progress: 100%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-26 12:56:37"
updated_at: "2026-03-26 15:14:29"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/009-workflow-mcp-orkestrasyon-entegrasyonu/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/009-workflow-mcp-orkestrasyon-entegrasyonu/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/009-workflow-mcp-orkestrasyon-entegrasyonu/review.md"
---

# 🛠️ 009: Workflow-MCP Orkestrasyon Entegrasyonu

> **Öncelik:** 🥉 — Araçları birbirine bağlar
> **Tahmini Efor:** ~1 saat
> **Dosyalar:** `.agent/workflows/*.md`, `.agent/skills/*/SKILL.md`

## 🎯 Hedefler
- [x] Mevcut workflow'lara (`/bitir`, `/yeni-ozellik`, `/supabase-bagla`) MCP araç çağrı talimatları ekle
- [x] `/bitir` workflow → registry `remember` + `progress` komutu ile senkronize et
- [x] `/yeni-ozellik` workflow → Context7 ile ilgili framework dokümantasyonu çekme adımı ekle
- [x] Superpowers plan adımlarına "Bu adımda Supabase MCP ile migration uygula" gibi MCP-aware talimatlar

## ✅ Alt Görevler
- [x] 1. `/bitir.md` → Son adıma `manage_registry.py remember` ve `complete` ekle
- [x] 2. `/yeni-ozellik.md` → İlk adıma "Context7'den framework dokümanı çek" talimatı
- [x] 3. `/supabase-bagla.md` → Supabase MCP araçlarına referans ekle
- [x] 4. `superpowers-plan` SKILL → Plan adımlarında MCP araçları önerme talimatı
- [x] 5. `superpowers-write-plan` ve `superpowers-brainstorm` Workflow dosyalarındaki jenerik yolları (artifacts/superpowers) kaldırıp Otonom Registry (Frontmatter artifacts) okumaya yönlendir.

## 🏁 Başarı Kriterleri
- `/bitir` çalıştığında registry otomatik güncelleniyor
- `/yeni-ozellik` başladığında ilgili framework dokümanı otomatik çekiliyor