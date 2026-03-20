# Brainstorm: 018 - Tüm Ana Kategoriler için Series Dönüşümü

## 🎯 Vizyon
VentHub kategori sayfalarını basit bir ürün listesinden ("Grid View"), kullanıcıya mühendislik çözümü sunan premium birer "Landing Page"e ("Series View") dönüştürmek.

## 🚀 Ana Fikirler

### 1. "Seri" Bazlı Gruplama (Series Component)
- **Problem:** Kullanıcı "Kanal Tipi Fanlar" kategorisine girdiğinde 50 tane benzer ürün görüyor ve kayboluyor.
- **Çözüm:** Ürünleri ailelerine göre grupla. Örn: "Lineo Serisi", "Quiet Serisi", "Vortice CA Serisi". 
- **Görsel:** Her serinin ana görseli, kısa bir mühendislik özeti ve o serideki ürün sayısını gösteren şık bir kart.

### 2. Dinamik "Hero" Bölümü
- **İçerik:** Her kategori için o kategoriye özel, yüksek çözünürlüklü bir ana görsel ve vurucu bir başlık.
- **Teknik Özet:** Kategorinin ana teknik sınırları (Örn: "2500 m³/h debiye kadar çözüm sunar").

### 3. Karşılaştırmalı Teknik Veri Tablosu
- Serilerin birbirine göre üstünlüklerini (Sessizlik, Güç, Enerji Verimliliği) gösteren radar grafiği veya karşılaştırma tablosu.

### 4. SEO & Otorite Metinleri
- Her ana kategori için SEO uzmanları tarafından hazırlanmış "Hangi fanı seçmeliyim?" rehber içeriğinin sayfa altına entegrasyonu.

## 🛠️ Teknik Altyapı
- **useCategoryGateway:** `displayMode === 'series'` durumunu zaten destekliyor, bunu UI tarafında (`CategoryView`) aktive edeceğiz.
- **SeriesCard Component:** Yeni bir atomik bileşen tasarlanacak.
- **Metadata Management:** Supabase'deki `categories.metadata` alanından `display_mode: "series"` değerini okuyacağız.
