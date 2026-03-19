---
id: 002
title: "Aşama 2: Registry Bağımlılık Görselleştirici (Graph Motor)"
priority: "High"
created_at: "2026-03-19 02:40:00"
depends_on: [001]
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/backlog/002-dependency-visualizer/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/backlog/002-dependency-visualizer/plan.md"
  review: "registry/P06-System-Intelligence-Registry/backlog/002-dependency-visualizer/review.md"
started_at: "2026-03-19 02:36:06"
status: Completed
progress: 100%
completed_at: "2026-03-19 02:37:13"
updated_at: "2026-03-19 02:37:13"
---




# 002 - Registry Bağımlılık Görselleştirici (Graph Motor)

## 🎯 Hedef
Registry'deki görevlerin `depends_on` alanlarını tarayarak, hangi görevin hangisini beklediğini gösteren görsel bir tablo (veya ASCII graph) üretmek. Bu, projenin kritik yolunu (critical path) görmemizi sağlar.

## ✅ Alt Görevler
- [x] `manage_registry.py` aracına `graph` komutu eklendi.
- [x] Tüm projeleri tarayıp bağımlılık ağacını (Directed Acyclic Graph) oluşturan mantık yazıldı.
- [x] Bağımlılıkları ASCII ve Mermaid.js formatında çıktı veren jeneratör eklendi.
- [x] Statü renkleri ve hiyerarşik yapı görselleştirildi.
