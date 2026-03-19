# Plan: 004-registry-3-sqlite-migration

## 🏗️ Operasyonel Yol Haritası (Step-by-Step)

### Adım 1: Güvenli Liman (Snapshot)
- [ ] Mevcut tüm registry dosyalarını yerel Git'e kaydet (`git add registry/ && git commit -m "Registry 2.5 Backup before SQL Migration"`).
- **Verify:** `git status` temiz olmalı.

### Adım 2: SQLite Motorunun İnşası
- [ ] `registry.db` dosyasını oluştur ve `brainstorm.md`'deki tabloları (projects, tasks, audit_log) `CREATE TABLE` sorgularıyla kur.
- [ ] `manage_registry.py` içinde `sqlite3` kütüphanesini kullanarak bağlantı (connection) ve imleç (cursor) yapılarını kur.
- **Verify:** Boş bir `registry.db` dosyasının oluştuğunu ve tabloların hazır olduğunu teyit et.

### Adım 3: Otonom Migrasyon (JSON to SQL)
- [ ] `index.json` ve mevcut `.md` dosyalarını tarayıp SQLite veritabanını dolduracak `migrate_filesystem_to_sql()` fonksiyonunu yaz ve çalıştır.
- **Verify:** SQLite veritabanındaki görev sayısının (SELECT COUNT(*)) klasör sayısıyla eşleştiğini gör.

### Adım 4: manage_registry.py Refactoring
- [ ] `load_index`, `sync_pulse`, `search_tasks` ve `generate_graph` fonksiyonlarını SQL sorgularıyla çalışacak şekilde yeniden yaz.
- [ ] `move_task` ve `activate_task` fonksiyonlarına "Atomic Transaction" koruması ekle.
- **Verify:** `python manage_registry.py search "pdp"` komutunun SQL üzerinden milisaniyeler içinde sonuç verdiğini gör.

### Adım 5: Yapısal Bütünlük Muhafızı (Validation Guard)
- [ ] Proje/Görev oluşturma sırasında klasör hiyerarşisini (`active/backlog/completed`) zorunlu kılan kontrolü ekle.
- **Verify:** Eksik klasörlü bir proje oluşturmaya çalış ve sistemin otomatik düzeltmesini test et.

### Adım 6: Final Review & Lint Fix
- [ ] Tüm projeyi `lint` ve `tsc` taramasından geçir. 
- [ ] `supabase.ts`'deki tip hatalarını temizle.
- **Verify:** CI/CD (GitHub Actions) yerel simülasyonda YEŞİL yanmalı.
