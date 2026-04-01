---
id: "007"
title: "Flash Guard Rails - Post-Edit Verification"
priority: "High"
status: "Planning"
progress: 0%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-26 12:56:15"
updated_at: "2026-03-26 12:56:15"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/backlog/007-flash-guard-rails---post-edit-verification/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/backlog/007-flash-guard-rails---post-edit-verification/plan.md"
  review: "registry/P06-System-Intelligence-Registry/backlog/007-flash-guard-rails---post-edit-verification/review.md"
---
post-edit-verification/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/backlog/007-flash-guard-rails---post-edit-verification/plan.md"
  review: "registry/P06-System-Intelligence-Registry/backlog/007-flash-guard-rails---post-edit-verification/review.md"
---

# 🛠️ 007: Flash Guard Rails — Post-Edit Verification

> **Öncelik:** 🥇 EN ACİL — En düşük efor, en yüksek etki
> **Tahmini Efor:** ~1 saat
> **Vizyon Belgesi:** `agent_infrastructure_review.md` (Antigravity Artifacts)

## 🎯 Hedefler
- [ ] Flash modelin her edit sonrası otomatik `tsc` kontrolü yapmasını sağla
- [ ] `superpowers-workflow` SKILL.md'ye "Post-Edit Verification" adımı ekle
- [ ] Hata varsa düzelt-veya-geri al mekanizması tanımla
- [ ] `/bitir` workflow'una zorunlu pre-commit kontrol adımı ekle

## ✅ Alt Görevler
- [ ] 1. `superpowers-workflow/SKILL.md` → "Her edit sonrası `pnpm exec tsc --noEmit` çalıştır" talimatı ekle
- [ ] 2. `/bitir.md` workflow → lint + tsc + build sırasını zorunlu kıl (zaten kısmen var, standartlaştır)
- [ ] 3. `AGENTS.md` veya `GEMINI.md` → "Flash modeli tek seferde 3+ dosyadan fazla düzenleyemez" guard kuralı ekle
- [ ] 4. Test: Flash modelle basit bir lint temizliği yaptır, post-edit kontrolün çalıştığını doğrula

## 🏁 Başarı Kriterleri
- Flash model bir dosyayı düzenlediğinde, hemen ardından tsc kontrolü yapıyor
- Hatalı edit'ler build'i kırmadan yakalanıyor