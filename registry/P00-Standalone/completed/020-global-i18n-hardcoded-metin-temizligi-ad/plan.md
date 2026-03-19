# Plan: 020 - i18n Standartlaştırma ve Metin Temizliği

## 📝 Operasyonel Adımlar

### Aşama 1: Veri Toplama ve Sözlük Hazırlığı
- [x] `src/views/admin/` dizinindeki tüm metinlerin envanterini çıkar.
- [x] `src/views/calculators/` dizinindeki hesaplayıcı metinlerini listele.
- [x] Eksik anahtarları `tr.ts` ve `en.ts` dosyalarına ekle.

### Aşama 2: Admin Paneli Dönüşümü
- [x] `AdminLogisticsPage.tsx` tam i18n dönüşümü (Kargo Panosu).
- [x] `AdminReturnsPage.tsx` kalıntı temizliği.
- [x] `AdminOrdersPage.tsx` ve `AdminOrdersBoard.tsx` (Kanban) tam i18n dönüşümü.
- [x] `AdminDashboardPage.tsx` KPI ve grafik başlıkları düzeltmesi.
- [x] `YeniAdmin.tsx` (gereksiz test dosyası) silindi.

### Aşama 3: Hesaplayıcılar ve Genel Alanlar
- [x] `AirCurtainCalcPage.tsx` i18n dönüşümü.
- [x] `JetFanCalcPage.tsx` i18n dönüşümü.

### Aşama 4: Doğrulama ve Test
- [x] Tüm sayfaların hem TR hem EN modunda metinlerinin doğru yüklendiğini kontrol et.
- [x] `npm run lint` ve `tsc` (lint passed, tsc has legacy errors) kontrollerini yap.
