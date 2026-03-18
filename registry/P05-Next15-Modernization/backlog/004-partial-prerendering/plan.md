# Plan: 004-partial-prerendering (PPR)

## 🏗️ Proposed Changes

### [Component: Configuration]
#### [MODIFY] [next.config.mjs]
- `experimental: { ppr: 'incremental' }` ayarı aktif edilecek.

### [Component: Product Detail UI]
#### [MODIFY] [ProductDetailPage.tsx]
- Dinamik fiyat ve stok bilgileri `Suspense` blokları içine alınacak.
- Shimmer/Skeleton efektli yükleme durumları eklenecek.

## ✅ Verification Plan
- [ ] "Slow 3G" network profilinde statik kabuğun anında geldiği test edilecek.
- [ ] `next build` sırasında PPR logları kontrol edilecek.
