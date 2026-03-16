# Brainstorm: 022-Registry Evrimi

## 1. Problemin Tanımı (Girdi)
Registry sistemi şu an manuel müdahale gerektirmiyor ancak "geleceği öngöremiyor".
- **Bağımlılık Riski:** Bir mühendis (veya agent), bağımlı olduğu iş bitmeden bir işi aktive ederse mimari tutarsızlık oluşur.
- **Veri Kaybı Riski:** Dosya taşıma veya metadata güncelleme sırasında bir hata oluşursa görevin geçmişi kaybolur.

## 2. Çözüm Önerileri (İşlem)
### A. Bağımlılık Bekçisi (Dependency Gatekeeper)
- `manage_registry.py` içindeki `activate` komutu genişletilecek.
- Taslak:
  1. Hedef dosyadaki `depends_on` listesini oku.
  2. Tüm projelerin `completed` klasörlerini tara.
  3. Eğer listedeki bir ID `completed` altında yoksa işlemi DURDUR ve hata ver.

### B. Snapshot Sistemi (Anlık Görüntü)
- Her kritik eylemde (activate, move, repair) dosyanın bir kopyası saklanmalı.
- Klasör yapısı: `registry/.snapshots/PXX/TaskID/YYYYMMDD_HHMMSS_Status.md`
- Bu klasör `.gitignore` içinde olmamalı (opsiyonel), ama registry temizliği için ayrı tutulmalı.

## 3. Beklenen Çıktı (Çıktı)
- Kendi kendini denetleyen bir görev yönetim sistemi.
- Mimari hataları en başta engelleyen "Kapı Muhafızı".
- Geçmişe dönük izlenebilirlik.

## 4. Kabul Kriterleri (Acceptance Criteria)
- [ ] `activate` komutu bağımlılıklar tamamlanmadan işi başlatmaz.
- [ ] Her `move` işleminden önce otomatik snapshot alınır.
- [ ] Orphaned dosyalar `repair` ile toplanırken de snapshot alınır.
