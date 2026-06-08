# 3D ve Sepet Modüllerinin React Compiler Uyumlu Refaktörü Backlog Kartı

## Görev Tanımı
React Compiler, React 19 ile gelen otomatik bellek optimizasyonu (automatic memoization) motorudur. Kod içindeki mutasyonları (render sırasında doğrudan veri değişikliklerini) veya kural dışı hook kullanımlarını hata olarak raporlar.

Mevcut projemizde aşağıdaki 5 dosya, içerdikleri Three.js/R3F (3D render) mutasyonları veya `react-hooks/exhaustive-deps` es-disable komutları nedeniyle React Compiler kurallarına uyum sağlayamadığı için `eslint.config.cjs` dosyasında geçici olarak muafiyet listesine (`react-compiler/react-compiler: off`) alınmıştır:
- `src/components/products/3d/types/RoofFanModel.tsx`
- `src/components/products/InfiniteProductsShowcase.tsx`
- `src/components/products/OrbitalProductsShowcase.tsx`
- `src/contexts/CartProvider.tsx`
- `src/views/admin/AdminReturnsPage.tsx`

Bu görev kapsamında, bu dosyaların React kurallarına uygun olarak baştan yazılması ve muafiyetlerin kaldırılması hedeflenmektedir.

## Yapılacaklar Listesi
- [ ] `RoofFanModel.tsx` içindeki logo texture anisotropy ve diğer Three.js nesne mutasyonlarının `useEffect` içerisine veya component dışı tanımlara taşınması.
- [ ] `InfiniteProductsShowcase.tsx` ve `OrbitalProductsShowcase.tsx` içindeki R3F camera position ve render-loop mutasyonlarının React state veya ref'ler üzerinden compiler'ı tetiklemeyecek şekilde refaktör edilmesi.
- [ ] `CartProvider.tsx` ve `AdminReturnsPage.tsx` içerisindeki `eslint-disable-next-line react-hooks/exhaustive-deps` kurallarının dependency dizileri eksiksiz doldurularak ortadan kaldırılması.
- [ ] `eslint.config.cjs` dosyasındaki ilgili dosyalara ait `react-compiler/react-compiler: off` tanımlarının kaldırılması.
- [ ] `pnpm run lint` ve `pnpm run type-check` kontrollerinin sıfır hata ile tamamlanması.

## Elde Edilecek Kazançlar
1. Bu modüller de React Compiler tarafından otomatik olarak optimize edilerek bellek yönetimine dahil olur.
2. Özellikle mobil cihazlarda 3D modeller dönerken veya sepete ürün eklenip çıkarılırken oluşabilecek anlık takılmalar (fps düşüşleri) sıfıra iner.
3. Gereksiz render döngüleri duracağı için mobil cihazların pil tüketimi ve işlemci yükü azalır.
