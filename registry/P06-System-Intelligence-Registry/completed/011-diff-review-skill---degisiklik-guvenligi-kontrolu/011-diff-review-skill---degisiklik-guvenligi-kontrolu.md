---
id: "011"
title: "Diff-Review Skill - Degisiklik Guvenligi Kontrolu"
priority: "High"
status: "Completed"
progress: 100%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-26 12:57:17"
updated_at: "2026-03-26 16:40:22"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/011-diff-review-skill---degisiklik-guvenligi-kontrolu/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/011-diff-review-skill---degisiklik-guvenligi-kontrolu/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/011-diff-review-skill---degisiklik-guvenligi-kontrolu/review.md"
---

# 🛠️ 011: Diff-Review Skill — Değişiklik Güvenliği Kontrolü

> **Öncelik:** 5/5 — Kalite katmanı ekler
> **Tahmini Efor:** ~1 saat
> **Dosya:** `.agent/skills/diff-review/SKILL.md` (yeni)

## 🎯 Hedefler
- [ ] Yeni bir `diff-review` skill oluştur
- [ ] Her commit öncesi `git diff` çıktısını otomatik analiz ettir
- [ ] "Bu değişiklik güvenli mi?" kontrolünü sistematize et
- [ ] Kırılma riski olan değişiklikleri (tip değişikliği, import silme, export kaldırma) otomatik işaretle

## ✅ Alt Görevler
- [x] 1. `.agent/skills/diff-review/SKILL.md` oluştur.
- [x] 2. İçerisinde riskli değişikliklerin regex veya kural setini tanımla (örn: `+.*any\b`, `\-.*export const\b`, `DROP\s+TABLE`).
- [x] 3. Bu skill'i `.agent/workflows/bitir.md` içerisine entegre et (Her commit öncesi `git diff` çıktısını otomatik analiz ettir).
- [x] 4. (Opsiyonel) Eğer `superpowers-review` ile çok çakışıyorsa, oradaki yapıyı modifiye et (Yeni ve tam statik çalışan özel bir analiz eklendi).

## 🏁 Başarı Kriterleri
- Commit öncesi diff analizi yapılıyor
- Tehlikeli kalıplar (any, drop, delete) otomatik uyarı veriyor