---
id: "008"
title: "Registry Engine v6 - Complete ve Progress Komutlari"
priority: "High"
status: "Completed"
progress: 100%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-26 12:56:25"
updated_at: "2026-03-26 14:03:24"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/008-registry-engine-v6---complete-ve-progress-komutlari/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/008-registry-engine-v6---complete-ve-progress-komutlari/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/008-registry-engine-v6---complete-ve-progress-komutlari/review.md"
---

# 🛠️ 008: Registry Engine v6 — Complete, Progress & Dependency Guard

> **Öncelik:** 🥈 — Günlük iş akışını doğrudan hızlandırır
> **Tahmini Efor:** ~2 saat
> **Dosya:** `registry/manage_registry.py`

## 🎯 Hedefler
- [x] `complete` komutu: Görevi doğrudan "completed" statüsüne taşı + progress %100 yap
- [x] `progress` komutu: Görevin ilerleme yüzdesini güncelle (Örn: `progress P04 014 50`)
- [x] `activate` komutuna bağımlılık kontrolü ekle: `depends_on` listesindeki görevler tamamlanmadıysa uyar
- [x] `create-task` komutuna `--description` parametresi ekle (boş MD dosyası sorunu)

## ✅ Alt Görevler
- [x] 1. `manage_registry.py` → `complete` action ekle (move_task + progress=100 + status=Completed)
- [x] 2. `manage_registry.py` → `progress` action ekle (MD frontmatter'da progress güncelle)
- [x] 3. `activate` action → `depends_on` kontrolü: bağımlı görevleri DB'den sorgula, completed değilse uyar
- [x] 4. `create-task` → `--description` parametresi ile ana MD'ye anlamlı içerik yaz
- [x] 5. Argparse help'i güncelle, README'ye yeni komutları ekle
- [x] 6. Test: `complete P99 001`, `progress P04 014 25` komutlarını çalıştır ve doğrula

## 🏁 Başarı Kriterleri
- `python registry/manage_registry.py complete P04 014` → görev completed'a taşınır
- `python registry/manage_registry.py progress P04 015 50` → progress %50 olur
- `python registry/manage_registry.py activate P04 015` → "P04/014 henüz tamamlanmadı" uyarısı verir