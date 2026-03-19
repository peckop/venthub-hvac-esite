# Brainstorm: 001 - Frontend Hardening & UX Excellence

## 🎯 Hedef
Terminal A'nın (Orion) altyapı çalışmalarını engellemeden, kullanıcının doğrudan hissedeceği UI/UX iyileştirmelerini profesyonel ve kurumsal standartlarda hayata geçirmek.

## 🚀 Geliştirme Alanları

### 1. Gelişmiş Filtreleme UX (UI Hardening)
- **Problem:** Mevcut filtreleme paneli statik ve mobil etkileşimi zayıf.
- **Çözüm:** 
  - Framer Motion ile akıcı "Filters Drawer" (Mobil).
  - Desktop'ta "Sticky Sidebar" optimizasyonu (Sayfa kayarken filtrelere erişim).
  - Çoklu seçimlerde "Skeleton" geçişleri yerine "Soft-Overlay" yükleme indikatörü.
  - Filtre chip'leri (Aktif filtreleri hızlıca temizleme).

### 2. Mobil "Hızlı Aksiyon" Barı (Floating Bar)
- **Problem:** PDP ve Checkout sayfalarında uzun kaydırmalarda "Satın Al" veya "Teklif Al" butonları gözden kayboluyor.
- **Çözüm:** 
  - Mobilde sayfa belirli bir noktayı (örn: BuySection) geçtiğinde alttan çıkan (sticky-bottom) ince bir aksiyon barı.
  - Bar içeriği: Ürün görseli, Kısa İsim, Fiyat ve "Sepete Ekle" butonu.
  - `AnimatePresence` ile yumuşak giriş-çıkış.

### 3. Kurumsal Form Validasyonu & Masking
- **Problem:** Kullanıcılar telefon veya T.C./VKN girerken hatalı format kullanabiliyor.
- **Çözüm:**
  - `react-input-mask` veya native logic ile `(5xx) xxx xx xx` telefon maskeleme.
  - T.C. Kimlik ve VKN için 11/10 haneli numeric kısıtlama.
  - `sonner` veya `react-hot-toast` ile kurumsal "Success/Error" feedback'leri.
  - Form alanlarına "Focus-Ring" ve "Error-State" görsel iyileştirmeleri.

## 🛠️ Teknik Strateji
- **Bağımsızlık:** Mevcut Gateway mimarisine dokunmadan, sadece UI katmanında (`src/components/ui`, `src/components/product`) sarmalayıcılar veya yeni modüller ekleyerek ilerlenecek.
- **Performans:** Framer Motion animasyonları `layoutId` kullanılarak optimize edilecek.
- **i18n:** Tüm yeni metinler `tr.json` ve `en.json` dosyalarına eklenecek.
