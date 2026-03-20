---
id: 004
title: "Registry 3.0: SQLite Geçişi ve Atomik Bütünlük"
priority: "CRITICAL"
status: "Completed"
progress: 10%
project: "P06-System-Intelligence-Registry"
created_at: "2026-03-19 10:30:00"
updated_at: "2026-03-20 17:24:02"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/completed/004-registry-3-0-sqlite-gecisi-ve-atomik-but/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/completed/004-registry-3-0-sqlite-gecisi-ve-atomik-but/plan.md"
  review: "registry/P06-System-Intelligence-Registry/completed/004-registry-3-0-sqlite-gecisi-ve-atomik-but/review.md"
---

# 🛠️ 004: Registry 3.0: SQLite Geçişi ve Atomik Bütünlük
JSON tabanlı indeksi, ACID uyumlu SQLite veritabanına taşıyarak veri kaybını engellemek.

## 🎯 Hedefler
- [ ] SQLite şema tasarımı ve veritabanı kurulumu.
- [ ] Mevcut JSON verilerinin SQLite'a otonom migrasyonu.
- [ ] manage_registry.py orkestratörünün SQL motoruna geçişi.

## ✅ Alt Görevler
- [ ] Mevcut tüm registry dosyalarını yerel Git'e kaydet (`git add registry/ && git commit -m "Registry 2.5 Backup before SQL Migration"`).
- [ ] `registry.db` dosyasını oluştur ve `brainstorm.md`'deki tabloları (projects, tasks, audit_log) `CREATE TABLE` sorgularıyla kur.
- [ ] `manage_registry.py` içinde `sqlite3` kütüphanesini kullanarak bağlantı (connection) ve imleç (cursor) yapılarını kur.
- [ ] `index.json` ve mevcut `.md` dosyalarını tarayıp SQLite veritabanını dolduracak `migrate_filesystem_to_sql()` fonksiyonunu yaz ve çalıştır.
- [ ] `load_index`, `sync_pulse`, `search_tasks` ve `generate_graph` fonksiyonlarını SQL sorgularıyla çalışacak şekilde yeniden yaz.
- [ ] `move_task` ve `activate_task` fonksiyonlarına "Atomic Transaction" koruması ekle.
- [ ] Proje/Görev oluşturma sırasında klasör hiyerarşisini (`active/backlog/completed`) zorunlu kılan kontrolü ekle.
- [ ] Tüm projeyi `lint` ve `tsc` taramasından geçir. 
- [ ] `supabase.ts`'deki tip hatalarını temizle.