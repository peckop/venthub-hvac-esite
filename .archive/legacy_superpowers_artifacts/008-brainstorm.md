# Brainstorm: Registry V3.1 (ID: 008)

## 1. Yeni Metadata Alanları
- **Priority:** `Low | Medium | High | Critical`. (Zaman yönetimini sağlar).
- **Depends_on:** Bir liste `[ID1, ID2]`. (Görevler arası akışı belirler).

## 2. Dashboard (PULSE.md) Tasarımı
Her `sync_registry.py` çalıştırıldığında, Registry dizinine (veya `registry/` altına) bir `PULSE.md` üretilecek.
- Format: Markdown Tablosu.
- Görsel İpuçları: `[DONE]`, `[WAITING]`, `[!!!]` (Rogue - Kaçak).

## 3. Otonom Denetim (Integrity Check)
Script, `artifacts/superpowers/` klasöründeki her dosyayı ID ile eşleştirecek. Eğer bir dosyanın (örn: `010-brainstorm.md`) karşılığı `registry/active/` altında yoksa, bu bir "Rogue Artifact" (Kaçak Operasyon) olarak işaretlenecek ve Dashboard'da uyarı verecek.

## 4. Bağımlılık (Dependency) Kontrolü
Eğer bir görevin `depends_on` listesindeki bir ID henüz `Completed` değilse, o görevin Dashboard'daki durumunun yanına `(Waiting for ID:XXX)` ibaresi eklenecek.
