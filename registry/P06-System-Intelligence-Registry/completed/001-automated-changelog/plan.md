# Plan: 001-automated-changelog

## 🎯 Hedef
Registry taşıma operasyonlarına entegre, tam otonom bir CHANGELOG jeneratörü geliştirmek ve yayına almak.

## ✅ Alt Görevler
- [ ] `manage_registry.py` içerisindeki `move_task` fonksiyonunu kancalanabilir hale getir.
- [ ] `review.md` dosyasını parse eden merkezi bir fonksiyon geliştir.
- [ ] `docs/CHANGELOG.md` dosyasını okuyan ve yeni veriyi en başa ekleyen yazıcıyı (writer) kodla.
- [ ] Bir test görevi oluşturarak tüm akışı denetle.

## 🏗️ Uygulama Adımları

### Adım 1: Fonksiyonel Altyapı
- **Aksiyon:** `manage_registry.py` dosyasına `update_changelog` adında yeni bir fonksiyon ekle.
- **Doğrulama:** Fonksiyonun dosya yolunu alıp alabildiğini print ile test et.

### Adım 2: Veri Ayrıştırma (Parsing)
- **Aksiyon:** Regex kullanarak `## Özet` başlığı altındaki metni yakalayan mantığı kur.
- **Doğrulama:** Farklı uzunluktaki özetlerin doğru parse edildiğini gör.

### Adım 3: Dosya Senkronizasyonu
- **Aksiyon:** Mevcut CHANGELOG içeriğini oku, yeni kaydı başa ekle ve dosyayı kapat.
- **Doğrulama:** UTF-8 formatının ve Türkçe karakterlerin korunduğunu teyit et.
