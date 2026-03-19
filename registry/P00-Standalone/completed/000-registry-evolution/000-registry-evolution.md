---
updated_at: "2026-03-19 16:05:55"
id: 022
title: "Registry Evrimi: Otonom Kapı Muhafızı ve Snapshots"
status: "Completed"
progress: "100%"
priority: "High"
depends_on: []
artifacts:
  brainstorm: "registry/P00-Standalone/completed/000-registry-evolution/brainstorm.md"
  plan: "registry/P00-Standalone/completed/000-registry-evolution/plan.md"
  review: null
---

# 022 - Registry Evrimi

## 🎯 Hedef
manage_registry.py sistemine bağımlılık kontrolü (Dependency Gatekeeper) ve geçmiş yedekleme (Snapshots) yetenekleri eklemek.



























































## ✅ Alt Görevler
- [ ] `manage_registry.py` içindeki `import` ve global değişkenleri (`PROJECT_ROOT`, `REGISTRY_DIR`) standartlaştır.
- [ ] Pyre2 lint hatalarını (join işlemleri) `os.path.normpath` veya tip casting ile gider.
- [ ] `create_snapshot(project_folder, task_folder, state)` fonksiyonunu geliştir.
- [ ] `registry/.snapshots/` dizinini (`.gitkeep` ile) oluştur.
- [ ] `activate` ve `move` fonksiyonlarına snapshot çağrısı ekle.
- [ ] `get_task_dependencies(task_md_path)` fonksiyonu yaz (YAML parse).
- [ ] `is_task_completed(task_id)` fonksiyonu yaz (Tüm `completed` dizinlerini tarar).
- [ ] `activate_task` fonksiyonuna kontrol mekanizmasını entegre et.
- [ ] Sahte bir bağımlılık testi yap (022'ye bitmemiş bir 099 ekleyerek `activate` dene).
- [ ] `.snapshots` klasörünü kontrol et.
- [ ] `registry_sync.py` ile PULSE'u güncelle.
- [ ] `/bitir` protokolünü işlet.