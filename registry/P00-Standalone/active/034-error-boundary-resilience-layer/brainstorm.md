# 🧠 Brainstorm: Error Boundary & Resilience Layer (P00-034)

## 🔍 Sorun Analizi
PDP Gateway mimarisi (P04-005) çok fazla bağımsız parçadan (3D, Gallery, Specs, Authority) oluşuyor. Bu parçalardan birinde (örn: bir 3D model dosyasının bozuk olması) oluşacak bir JS hatası, React'in doğası gereği tüm sayfayı çökertip "White Screen" oluşturabilir.

## 🚀 Mimari Çözüm: Modüler Kalkanlar
- **GlobalErrorBoundary:** Uygulamanın en tepesinde, "Beklenmedik bir hata oluştu" mesajı veren son kale.
- **SectionErrorBoundary:** PDP'deki her modülü (Specs, 3D, Gallery) ayrı ayrı sarmalayan kalkanlar. Bir bölüm çökerse sadece o bölüm "Teknik bir hata oluştu" der, sayfanın geri kalanı çalışmaya devam eder.
- **Resilience Logger:** Hataları otomatik olarak Supabase `error_log` tablosuna mühürleyecek bir entegrasyon.

## ✅ Uygulama Planı
1. `src/components/ui/Resilience/` dizinini oluştur.
2. `SafeSection.tsx` adında bir wrapper (sarmalayıcı) kodla.
3. PDP Gateway parçalarını bu wrapper ile koruma altına al.
