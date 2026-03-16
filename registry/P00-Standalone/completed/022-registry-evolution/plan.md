# Plan: 022-Registry Evrimi

Bu plan `manage_registry.py` dosyasını otonom bir "Registry Engine" haline getirmeyi hedefler.

## 1. Hazırlık ve Temizlik
- [ ] `manage_registry.py` içindeki `import` ve global değişkenleri (`PROJECT_ROOT`, `REGISTRY_DIR`) standartlaştır.
- [ ] Pyre2 lint hatalarını (join işlemleri) `os.path.normpath` veya tip casting ile gider.

## 2. Snapshot Sistemi Kurulumu
- [ ] `create_snapshot(project_folder, task_folder, state)` fonksiyonunu geliştir.
- [ ] `registry/.snapshots/` dizinini (`.gitkeep` ile) oluştur.
- [ ] `activate` ve `move` fonksiyonlarına snapshot çağrısı ekle.

## 3. Bağımlılık Bekçisi (Gatekeeper)
- [ ] `get_task_dependencies(task_md_path)` fonksiyonu yaz (YAML parse).
- [ ] `is_task_completed(task_id)` fonksiyonu yaz (Tüm `completed` dizinlerini tarar).
- [ ] `activate_task` fonksiyonuna kontrol mekanizmasını entegre et.

## 4. Test ve Doğrulama
- [ ] Sahte bir bağımlılık testi yap (022'ye bitmemiş bir 099 ekleyerek `activate` dene).
- [ ] `.snapshots` klasörünü kontrol et.

## 5. Finalizasyon
- [ ] `registry_sync.py` ile PULSE'u güncelle.
- [ ] `/bitir` protokolünü işlet.
