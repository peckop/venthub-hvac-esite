# Plan: 005-registry-v7-integrity-recovery

## 🎯 Goal
`manage_registry.py`'yi Registry V7 ve SQL+JSON Bütünlüğü ile yeniden inşa etmek.

## 🏗️ Steps
1. **Analiz:** `manage_registry.py.bak` içindeki gelişmiş onarım mantığını `manage_registry.py` (V3 SQL) sistemine entegre et.
   - Verify: `manage_registry.py` hem SQL hem de JSON kütüphanelerini import ediyor mu?
2. **Rewrite Indexing:** `db.sync()` metoduna `index.json` dosyasını atomik olarak yazacak bir bölüm ekle.
   - Key format: `{project}_{id}` veya `{project}/{id}`.
   - Verify: `python manage_registry.py reindex` sonrası `index.json` içeriğinde birden fazla `001` görebiliyor muyuz?
3. **Safe Repair:** `repair_all` fonksiyonunu "leaked artifacts" (brainstorm vb.) dosyalarını silmek yerine ait oldukları (veya yeni açılan) task klasörüne taşıyacak hale getir.
   - Verify: Başıboş bir `.md` dosyası `repair` sonrası klasörlendi mi?
4. **Final Sync:** Tüm projeleri tarat ve `PULSE.md` ile uyumluluğunu kontrol et.
   - Tool: `python registry_sync.py`
