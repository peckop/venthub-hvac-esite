# Plan: 002 - Global i18n & Admin Panel Text Migration

## 📋 ADIMLAR

### 1. Hazırlık: Admin Sözlüğü Oluşturma
- [ ] `src/lib/i18n/locales/tr.ts` içine `admin` anahtarı ekle.
- [ ] Mevcut `AdminUsersPage` metinlerini buraya taşı.

### 2. AdminUsersPage Refactoring
- [ ] `useI18n()` import et ve bileşene dahil et.
- [ ] Tüm hardcoded metinleri `t('admin.users...')` ile değiştir.
- [ ] Fallback metinleri ekle (Anayasa kuralı).

### 3. AdminInventoryPage & Stock Management
- [x] `InventoryRow` ve `ReservedRow` tiplerinin standardize edilmesi.
- [x] `low_stock_threshold` dökümlerindeki `as any` risklerinin temizlenmesi.
- [ ] Tablo sütun başlıklarının (Fiziksel Stok, Satılabilir vb.) i18n'e taşınması.
- [ ] Dışa aktarma (Export) menüsü metinlerinin standardize edilmesi.

### 4. Diğer Sayfalar (Users, Webhook, Returns, Settings)
- [ ] `AdminUsersPage` metinlerini sözlüğe taşı.
- [ ] `AdminSettingsPage` güncellemeleri.
- [ ] Diğer sayfalar için benzer refactoring süreçleri.

### 5. Doğrulama
- [ ] `pnpm run lint` ve `pnpm run build` kontrolleri.
- [ ] Tarayıcıda dil değişimi testi (TR <-> EN).

## 🛡️ RİSK YÖNETİMİ
- **Metin Kaybı:** Taşıma sırasında bazı metinlerin `undefined` dönmesi riskine karşı `||` operatörü ile varsayılan metinleri koru.
- **Performans:** Çok büyük sözlük dosyalarının render süresine etkisini izle (şu an için risk düşük).
