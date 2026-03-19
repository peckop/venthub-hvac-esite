# 🧠 Brainstorm: P01-018 Tüm Ana Kategoriler için Series Dönüşümü

## 🎯 Hedef
Şu an sadece "Hava Perdeleri" ve "Sessiz Fanlar" için özel olan zengin içerikli "Series/Landing" yapısını, tüm ana kategorilere (Fanlar, Isı Geri Kazanım, Nem Alma vb.) yaymak. Bu sayede her ana kategori, sadece bir ürün listesi değil, bir "Deneyim Sayfası" haline gelecek.

## 🔍 Mevcut Durum
- `CategoryLanding.tsx` içinde hardcoded `isAirCurtain` ve `isSilentFan` kontrolleri var.
- Diğer kategoriler standart "Grid" görünümüne düşüyor.
- Zengin içerik (authority_content) her kategoride tam kullanılmıyor.

## 💡 Mimari Çözüm

### 1. Abstracting the Landing Page
- `CategoryLanding.tsx` içindeki spesifik bölümleri (Problem, HowItWorks, BrandStory) jenerik bileşenlere dönüştürmek.
- Bu bileşenlerin içeriğini Supabase `categories.authority_content` (Task 006 altyapısı) üzerinden beslemek.

### 2. Series Template for All
- Tüm ana kategorilerin (Level 0) `metadata.display_mode` değerini `series` olarak güncellemek.
- Her kategori için "Öne Çıkan Özellikler", "Teknik Avantajlar" ve "Sıkça Sorulan Sorular" veri setlerini hazırlamak.

### 3. Sub-Category Integration
- Series sayfasında alt kategorilerin (Level 1) birer "Seri Seçici" (Series Selector) olarak konumlandırılması.
- Kullanıcının ana kategoriden alt serilere yumuşak bir geçiş yapmasının sağlanması.

## ✅ Başarı Kriterleri
- `/category/fanlar` veya `/category/isi-geri-kazanim-cihazlari` adreslerine girildiğinde, Hava Perdeleri'ndeki gibi zengin bir görsel anlatımla karşılaşılması.
- Kod tarafında hiçbir "Slug Check" (if slug === ...) kalmaması.
- Sayfanın tamamen veritabanındaki JSON yapısına göre otonom oluşması.
