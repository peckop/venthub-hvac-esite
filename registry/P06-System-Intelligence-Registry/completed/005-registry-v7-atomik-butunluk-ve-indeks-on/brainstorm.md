# Brainstorm: 005-registry-v7-integrity-recovery

## 🎯 Goal
Registry sistemindeki mimari zafiyetleri (ID çakışması, senkronizasyon kaybı) gidererek veritabanı (SQL) ve indeks dosyasını (JSON) otomatiize şekilde senkronize tutmak.

## 🛡️ Constraints & Risks
- **Risk 1: Veri Kaybı.** Mevcut `repair_all` silme işlemi yaparken yanlışlıkla güncel dosyaları silebilir. (Çözüm: Dosya silecek kodu "folderize" edecek şekilde değiştir).
- **Risk 2: Geriye Dönük Uyumluluk.** `index.json` anahtar yapısı değişirse mevcut dashboard'lar bozulabilir mi? (Çözüm: `PROJECT-ID` hem benzersiz hem de takip edilebilir).
- **Risk 3: Concurrency.** Aynı anda birden fazla agent'ın JSON/SQL yazması. (Çözüm: Atomic write ve SQLite'ın kilit mekanizmasını kullan).

## 💡 Options & Recommendation
- **Seçenek A:** Sadece SQL'i koruyup JSON'u tamamen silmek. (Kabul edilmedi, JSON arama hızı için kritik).
- **Seçenek B:** JSON'u SQL'den her `sync` çağrısında yeniden üretmek. (ÖNERİLEN).

## ✅ Acceptance Criteria
- [ ] Birden fazla projede aynı ID'ye sahip görevler `index.json` içinde bir arada bulunabiliyor.
- [ ] `index.json` ve `registry.db` verileri birbirine %100 uyumlu.
- [ ] Başıboş dosyalar (leaked) silinmeden ilgili task klasörlerine taşınıyor.
