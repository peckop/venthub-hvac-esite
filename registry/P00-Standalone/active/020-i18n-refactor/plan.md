# Plan: 020 - i18n Standartlaştırma ve Metin Temizliği

## 📝 Operasyonel Adımlar

### Aşama 1: Veri Toplama ve Sözlük Hazırlığı
- [x] `src/views/admin/` dizinindeki tüm metinlerin envanterini çıkar.
- [x] `src/views/calculators/` dizinindeki tüm metinlerin envanterini çıkar.

### Aşama 2: Admin Paneli Refaktörü
- [x] `AdminAuditLogPage.tsx` i18n dönüşümü.
- [x] `AdminCategoriesPage.tsx` i18n dönüşümü.
- [x] `AdminOrdersBoard.tsx` i18n dönüşümü.
- [x] `AdminInventoryPage.tsx` i18n dönüşümü.
- [x] `AdminProductsPage.tsx` i18n dönüşümü.
- [x] `AdminSettingsPage.tsx` i18n dönüşümü.
- [x] `AdminUsersPage.tsx` i18n dönüşümü.
- [ ] `AdminReturnsPage.tsx` i18n dönüşümü.

### Aşama 3: Hesaplayıcılar Refaktörü
- [x] `AirCurtainCalcPage.tsx` i18n dönüşümü.
- [x] `JetFanCalcPage.tsx` i18n dönüşümü.

### Aşama 4: Doğrulama ve Test
- [ ] Tüm sayfaların hem TR hem EN modunda metinlerinin doğru yüklendiğini kontrol et.
- [ ] `npm run lint` ve `tsc` kontrollerini yap.
