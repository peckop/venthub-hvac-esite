# Plan: 003-registry-indexing-system

## 🎯 Goal
Registry sistemine otonom bir indeksleme motoru eklemek.

## 🏗️ Steps

### Adım 1: İndeks Veri Yapısının Tasarlanması
- `registry/index.json` dosyasının formatını netleştir.
- Her görev için tutulacak zorunlu alanlar: `id`, `title`, `project`, `state`, `path`, `updated_at`.
- **Verify:** `index.json` şeması dokümante edildi.

### Adım 2: `manage_registry.py` İçine İndeksleme Mantığının Eklenmesi
- Tüm `registry/P*` dizinlerini rekürsif tarayan `reindex()` metodunu yaz.
- MD dosyalarından YAML metadata'yı çıkaran mevcut `parse_metadata` fonksiyonunu kullan.
- **Verify:** `python manage_registry.py repair` komutu sonunda `index.json` oluşturuluyor/güncelleniyor.

### Adım 3: Gelişmiş Arama (Search) Fonksiyonu
- Mevcut `search_task` fonksiyonunu, `index.json` üzerinden arama yapacak şekilde güncelle.
- Basit ID araması yerine "anahtar kelime" (full-text) araması desteği ekle.
- **Verify:** `python manage_registry.py search "changelog"` komutu ilgili görevleri saniyeler içinde listeliyor.

### Adım 4: Otomatik Senkronizasyon (Lifecycle Integration)
- `activate_task` ve `move_task` fonksiyonlarının sonuna `reindex()` çağrısını ekle.
- **Verify:** Bir görev taşındığında `index.json` dosyasındaki `path` alanı otomatik olarak güncelleniyor.

## 🧪 Testing & Verification
- `python manage_registry.py repair` ile ilk indeksi oluştur.
- `registry/index.json` dosyasının içeriğini manuel kontrol et.
- Rastgele bir anahtar kelime ile arama yap ve sonuçların doğruluğunu teyit et.
