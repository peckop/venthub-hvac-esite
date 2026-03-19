# Plan: 002-dependency-visualizer

## 🎯 Hedef
Registry sistemine görsel bağımlılık analizi (Graph) yeteneği kazandırmak.

## ✅ Alt Görevler
- [ ] `manage_registry.py` dosyasına `graph` komutu ve argümanları eklendi.
- [ ] Tüm projeleri tarayan ve `depends_on` verilerini toplayan veri motoru yazıldı.
- [ ] Toplanan verileri Mermaid.js formatına dönüştüren jeneratör kodlandı.
- [ ] Terminal çıktısında ASCII tabanlı bir görselleştirme modu eklendi.
- [ ] Döngüsel bağımlılık kontrolü (Circular Check) algoritması entegre edildi.

## 🏗️ Uygulama Adımları

### Adım 1: Veri Toplama (Scanner)
- **Aksiyon:** `scan_dependencies` adında yeni bir fonksiyon yaz. Tüm görev md dosyalarını oku ve bağımlılıkları bir sözlük (dictionary) yapısında topla.
- **Doğrulama:** Sözlük çıktısının `{task_id: [deps]}` formatında olduğunu print ile gör.

### Adım 2: Görselleştirme Mantığı
- **Aksiyon:** Toplanan veriyi Mermaid diyagramına (`graph TD`) çevir. Statülere göre (completed=yeşil, active=turuncu) stillendirme yap.
- **Doğrulama:** Üretilen kodun Mermaid live editor'da doğru render edildiğini simüle et.

### Adım 3: Entegrasyon ve Test
- **Aksiyon:** `manage_registry.py` ana döngüsüne yeni fonksiyonu bağla.
- **Doğrulama:** `python manage_registry.py graph` komutuyla tüm projenin haritasını terminalde gör.
