# 📋 Plan: P01-016 Master Şablon (Master Template)

Bu görev, VentHub'ın tüm sayfalarını kapsayacak olan "Mimari Kabuk" yapısının inşasını kapsar.

## ✅ Alt Görevler
- [x] `src/components/layout/MainLayout.tsx` merkezi şablon bileşeni oluşturuldu.
- [x] `PageShell` yardımcı bileşeni (spacing, max-width yönetimi) yazıldı.
- [x] App Router (`app/layout.tsx`) üzerindeki dağınık yapılar bu yeni şablona taşındı.
- [x] Sayfa geçişleri için `Framer Motion` merkezi "Layout Transition" altyapısı kuruldu.
- [x] Global katmanlar (Toaster, WhatsApp) MainLayout seviyesinde tekilleştirildi.

## 🚀 Uygulama Adımları

### Step 1: Layout Consolidation
- **Action:** Projenin ana layout.tsx dosyasını temizle ve iş mantığını `MainLayout` bileşenine devret.
- **Verify:** Her sayfanın otomatik olarak Header/Footer ile sarıldığının doğrulanması.

### Step 2: PageShell Deployment
- **Action:** Kategori ve Ürün sayfalarına `PageShell` sarmalayıcısını ekle.
- **Verify:** Farklı ekran çözünürlüklerinde (responsive) hizalamaların doğrulanması.

### Step 3: Global Overlays
- **Action:** Toast bildirimleri ve WhatsApp butonunu `MainLayout` seviyesinde tekilleştir.
- **Verify:** Farklı sayfalarda etkileşim sonrası bileşenlerin mükemmel çalışması.
