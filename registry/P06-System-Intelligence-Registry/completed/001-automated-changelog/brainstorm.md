# Brainstorm: 001-automated-changelog

## 🎯 Hedef
Geliştiricinin manuel CHANGELOG yazma yükünü tamamen ortadan kaldırmak. Görevler tamamlandığında (completed), sistemin otonom olarak review verilerini parse edip tarihçeye işlemesini sağlamak.

## 🛡️ Risk Analizi & Teknik Bariyerler
- **Dosya Güvenliği:** CHANGELOG.md dosyasına yazarken mevcut verilerin üzerine yazılma riski (Append-only mod kullanılacak).
- **Format Karmaşası:** Review dosyalarındaki düzensiz Markdown yapısı (Regex ile katı bir pattern matching uygulanacak).
- **Türkçe Karakterler:** UTF-8 kodlama hatalarının önlenmesi için özel dosya işleme kütüphaneleri kullanılacak.

## 💡 Mimari Çözüm
- **Parser Modülü:** Python'un `re` kütüphanesiyle `## Özet` ve `## Mimar Notları` blokları çekilecek.
- **Trigger:** `manage_registry.py` içindeki `move_task` fonksiyonuna, hedef statü `completed` olduğunda tetiklenen bir kanca eklenecek.
- **Tarihçe:** Kayıtlar `[Y-m-d] [PROJE-ID] - BAŞLIK` formatında eklenecek.

## ✅ Başarı Kriterleri
- Her taşıma sonrası CHANGELOG.md dosyasında yeni bir giriş olmalı.
- Eski kayıtlar %100 korunmalı.
- Hatalı Markdown dosyalarında sistem işlemi durdurup raporlamalı.
