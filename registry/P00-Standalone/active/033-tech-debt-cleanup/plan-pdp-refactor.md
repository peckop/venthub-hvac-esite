# Plan: ProductDetailPage Refactor (any & Type Safety)

## 🎯 Hedef
`src/views/ProductDetailPage.tsx` dosyasını VentHub Proje Anayasası'na uygun şekilde refaktör etmek, tüm `any` kullanımlarını temizlemek ve `src/types/db-rows.ts` içindeki güvenli tipleri kullanmak.

## 🛠️ Adımlar

### 1. Araştırma ve Hazırlık
- [x] `src/views/ProductDetailPage.tsx` dosyasının mevcut içeriği incelendi.
- [x] `src/types/db-rows.ts` içindeki `DbProduct`, `DbCategory`, `CategoryMetadata` ve `DbProductEnrichedRow` tipleri teyit edildi.
- [x] `src/lib/supabase.ts` içindeki `Product` ve `Category` alias'larının `DomainProduct` ve `DomainCategory` olduğu teyit edildi.

### 2. Tip Tanımları ve Import Düzenlemeleri
- `any` içeren tüm importları ve yerel tanımları temizle.
- `CategoryMetadata` tipini `src/types/db-rows.ts`'den import et.
- `Product` ve `Category` tiplerini `src/lib/supabase.ts`'den kullanmaya devam et (zaten domain modellerine cast edilmiş durumdalar).

### 3. "any" Temizliği (Surgical Edits)
- [ ] `params?.id as string` -> `params.id` (Next.js 15 asenkron params kuralına uygun `await` ve tip kontrolü).
- [ ] `(imgs || []) as { path: string; alt?: string | null }[]` -> `as DbProductImage[]` (Eğer `DbProductImage` yoksa `src/types/database.types.ts`'den al veya tanımla).
- [ ] `(mainCategory?.metadata as any)?.model_type` -> `(mainCategory?.metadata as CategoryMetadata)?.model_type`.
- [ ] `(mainCategory?.metadata as any)?.hide_price` -> `(mainCategory?.metadata as CategoryMetadata)?.hide_price`.
- [ ] `groupTechnicalSpecs(product.technical_specs as any)` -> `groupTechnicalSpecs(product.technical_specs)`.
- [ ] `eslint-disable` satırlarını kaldır.

### 4. Next.js 15 Uyumluluğu
- `useParams()` kullanımını Next.js 15 standartlarına göre gözden geçir (Client component olduğu için `useParams()` hala senkron dönebilir ancak anayasa asenkron params politikasını vurguluyor).

### 5. Doğrulama (Verification)
- [ ] Dosyayı `write_file` ile güncelle.
- [ ] `pnpm tsc` veya `npm run lint` ile tip hatalarını kontrol et.
- [ ] Runtime hatalarını (özellikle metadata erişimi) kontrol et.

## 🚀 Uygulama
Plan onaylandı, uygulamaya geçiliyor.
