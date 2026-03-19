# Plan: 001 - Frontend Hardening & UX Excellence

## 📝 Özet
Kurumsal ve profesyonel UI/UX standartlarını yakalamak için; gelişmiş filtreleme etkileşimleri, mobil "Quick Action" barı ve form validasyon sistemleri hayata geçirilecek.

## 🛠️ Uygulama Adımları

### Faz 1: Kurumsal Form Validasyon & Masking 🛡️
1.  **Input Masking:** `Input` bileşenini telefon (TR: `(5xx) xxx xx xx`) ve T.C./VKN maskeleriyle güçlendir.
2.  **Validation Feedback:** `CheckoutPage` ve `LeadModal` formlarında hatalı girişlerde kenarlık (border-rose-500) ve titreme (shake) animasyonu ekle.
3.  **Verify:** Formların yanlış formatta gönderilmediğini test et.

### Faz 2: Mobil Hızlı Aksiyon Barı (Floating Bar) 📱
1.  **Bileşen:** `src/components/product/ProductMobileActionBar.tsx` oluştur.
2.  **Mantık:** `useProductGateway` hook'una `isMobileActionVisible` state'ini ekle (Scroll pozisyonuna göre).
3.  **Entegrasyon:** `ProductDetailPage`'e bu barı en alt katmanda ekle.
4.  **Verify:** Mobilde aşağı kaydırınca barın düzgünce (framer-motion) çıktığını doğrula.

### Faz 3: Gelişmiş Filtreleme UX 🔍
1.  **Mobile Drawer:** Mevcut filtre panelini mobilde alttan açılan (bottom-sheet) bir drawer'a dönüştür.
2.  **Filter Chips:** Aktif filtreleri temizlemek için "X" butonu içeren chip'leri üst tarafa ekle.
3.  **Sticky Optim:** `CategoryFilters` bileşenini desktop'ta başlık barına takılmayacak şekilde (offset) sabitle.
4.  **Verify:** Filtre seçimlerinin anında ve temiz bir şekilde (UI blink olmadan) uygulandığını test et.

## ✅ Doğrulama Kriterleri
- [ ] Tüm formlarda telefon maskesi çalışıyor.
- [ ] Mobilde ürün sayfasında aşağı kaydırınca aksiyon barı çıkıyor.
- [ ] Kategori sayfalarında filtreler mobil drawer içinde düzgün görünüyor.
- [ ] ESLint ve TypeScript kontrolleri tertemiz.
