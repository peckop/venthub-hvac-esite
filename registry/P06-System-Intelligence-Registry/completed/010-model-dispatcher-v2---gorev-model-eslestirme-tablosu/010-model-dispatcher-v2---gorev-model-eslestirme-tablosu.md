---
id: "010"
title: "Model Dispatcher v2 - Gorev-Model Eslestirme Tablosu"
priority: "High"
status: "Completed"
progress: 100%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-26 12:57:04"
updated_at: "2026-03-26 15:53:50"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/010-model-dispatcher-v2---gorev-model-eslestirme-tablosu/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/010-model-dispatcher-v2---gorev-model-eslestirme-tablosu/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/010-model-dispatcher-v2---gorev-model-eslestirme-tablosu/review.md"
---

# 🛠️ 010: Model Dispatcher v2 — Görev-Model Eşleştirme Tablosu

> **Öncelik:** 4/5 — Kota optimizasyonu için pratik referans
> **Tahmini Efor:** ~30 dakika
> **Dosya:** `.agent/skills/model-dispatcher/SKILL.md`

## 🎯 Hedefler
- [x] VentHub'a özel görev-model eşleştirme tablosu oluştur
- [x] Her workflow komutuna varsayılan model önerisi ekle
- [x] Registry görev tipleri ile model önerisini eşleştir

## ✅ Alt Görevler
- [x] 1. SKILL.md'ye proje-özel eşleştirme tablosu ekle (dosya sayısı × risk × model)
- [x] 2. Her workflow'un başına `[Önerilen Model: Flash/High/Sonnet]` etiketi ekle
- [x] 3. Registry `create-task` komutuna `--complexity` parametresi (düşük/orta/yüksek) ekle → otomatik model önerisi

## 🏁 Başarı Kriterleri
- Herhangi bir görev açıldığında hangi modelin kullanılması gerektiği 5 saniye içinde belirlenebilir