# 📋 Plan: P01-015 Tasarım Sistemi Otoritesi

Bu görev, VentHub'ın atomik seviyedeki tüm UI kurallarını mühürlemeyi kapsar.

## ✅ Alt Görevler
- [x] `tailwind.config.js` renk paletinin (Navy, Blue, Gray, Air) kesinleştirilmesi.
- [x] Global `borderRadius` (örn: `vh-base: 1rem`) ve `boxShadow` tanımları eklendi.
- [x] `src/components/ui/` altındaki bileşenlerin (Button, Badge, Skeleton) refaktörü/oluşturulması.
- [x] Ortak "Loading" ve "Skeleton" standartları belirlendi.
- [x] Form elemanlarının (Input) temel tip güvenliği sağlandı.
- **Verify:** `ProductCard` ve `ProductBuySection` üzerinde yeni sistem başarıyla test edildi.

## 🏗️ Uygulama Adımları

### Step 1: Design Tokens (DONE)
- **Action:** Tailwind config mühürleme.
- **Verify:** `shadow-hvac` ve `rounded-vh-base` class'larının doğrulanması.

### Step 2: Atomic Refactor (DONE)
- **Action:** `Button.tsx`, `Badge.tsx` ve `Skeleton.tsx` bileşenlerinin "Props-Driven" mimariye geçirilmesi.
- **Verify:** Merkezi UI kütüphanesinin hazır olması.

### Step 3: Deployment (DONE)
- **Action:** Ana ürün bileşenlerinde (Card, Buy Section) yeni UI elemanlarının kullanılması.
- **Verify:** Görsel tutarlılığın tüm projede hissedilmesi.
