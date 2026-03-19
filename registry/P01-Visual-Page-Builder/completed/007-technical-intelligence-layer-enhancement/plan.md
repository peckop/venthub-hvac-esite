# Plan: 007 - Teknik Zeka (Technical Intelligence)

## 📝 Operasyonel Adımlar

### Aşama 1: Zeka Motorunun İnşası (Logic Layer)
- [ ] `src/utils/engineeringIntelligence.ts` yardımcısını oluştur.
- [ ] Fonksiyon: `getNoiseInference(db: number)` -> "Kütüphane sessizliği", "Ofis konforu" vb.
- [ ] Fonksiyon: `getEfficiencyInference(percentage: number)` -> "Yüksek Enerji Tasarrufu".
- [ ] Fonksiyon: `generateTechnicalSummary(product: Product)` -> Tüm verileri birleştirip 3 cümlelik özet üret.

### Aşama 2: Frontend Entegrasyonu (UI Layer)
- [ ] `src/components/product/ProductSmartInference.tsx` bileşenini oluştur.
- [ ] Bu bileşeni `ProductDetailPage.tsx` içinde "Fiyat" ve "Sepet" alanının hemen altına yerleştir.
- [ ] Görselleştirme: "Mühendislik Notu" ikonu ve animasyonlu giriş efekti.

### Aşama 3: SEO ve Otomasyon (Metadata Layer)
- [ ] `src/utils/seoHelpers.ts` (veya ilgili dosya) içinde, teknik analiz sonuçlarını SEO title'ına enjekte eden mantığı kur.
- [ ] Örnek: "Vortice Lineo 100 - [Ultra Sessiz] Kanal Tipi Fan".

### Aşama 4: Doğrulama ve Test
- [ ] Farklı teknik özelliklere sahip 3 ürün (Sessiz, Güçlü, Verimli) seçerek üretilen metinlerin doğruluğunu manuel kontrol et.
- [ ] Lighthouse CLS skorunu kontrol et (Dinamik metinlerin sayfa düzenini kaydırmadığından emin ol).

## 📈 Başarı Kriteri
Her ürün sayfasında, kullanıcının teknik tabloyu okumasına gerek kalmadan ürünün karakterini anladığı bir "Mühendislik Özeti" bulunmalı.
