# Task 3 — Admin Tip Sertleştirme (Component Hardening) Planı

## Hedef
Admin Dashboard bileşenleri (AdminInventoryPage, AdminReturnsPage, CategoryBuilderView, AdminWebhookEventsPage) üzerindeki `@ts-expect-error` bloklarını ve `as unknown as` kullanımlarını sıfıra indirmek; `Density` ve `LoadState` tiplerini merkezi bir `src/types/admin-shared.ts` dosyasında toplamak.

## Varsayımlar
- `pnpm exec tsc -b tsconfig.build.json` Task 2 sonrası şu an sıfır hata vermektedir.
- Supabase şemasında `inventory_summary` view'ının `category_id` kolonu generated types'de eksik → çözüm: manuel tip genişletme.
- `ColumnsMenu.tsx` içindeki `Density` tipi merkeze taşınacak; export bu dosyada re-export olarak kalacak (geriye dönük uyumluluk).
- Aşamalı ilerleme: Her adım sonrası `pnpm exec tsc -b tsconfig.build.json` çalıştırılır.

## Plan

### Adım 1 — `src/types/admin-shared.ts` Oluştur
- **Dosyalar:** `src/types/admin-shared.ts` (yeni)
- **Değişiklik:** `Density`, `LoadState`, `TableSortDir` gibi tüm admin-genelinde paylaşılan tipleri bu dosyaya ekle.
- **Verify:** `pnpm exec tsc -b tsconfig.build.json` → sıfır hata.

### Adım 2 — `ColumnsMenu.tsx` re-export yap, yerel Density'yi sil
- **Dosyalar:** `src/components/admin/ColumnsMenu.tsx`
- **Değişiklik:** Yerel `export type Density = ...`'yi sil, `admin-shared`'den re-export ekle.
- **Verify:** `pnpm exec tsc` → ColumnsMenu kaynaklı hata yok.

### Adım 3 — `src/types/inventory.ts` temizle
- **Dosyalar:** `src/types/inventory.ts`
- **Değişiklik:** `LoadState` ve `Density`'yi buradan sil, `admin-shared`'den re-export ile geriye dönük uyumu koru.
- **Verify:** `pnpm exec tsc` → sıfır hata.

### Adım 4 — `AdminInventoryPage.tsx` — 3 @ts-expect-error bloğunu temizle
- **Dosyalar:** `src/views/admin/AdminInventoryPage.tsx`
- **Değişiklik (satır 73):** `InventorySummaryRow` lokal tipi oluştur, `category_id` alanını genişlet.
- **Değişiklik (satır 143):** `loadState` state'ini `LoadState` enum ile tiplendir.
- **Değişiklik (satır 147, 149):** `visibleCols` ve `density` başlangıç değerlerini tam uyumlu tiplerle düzelt.
- **Verify:** `pnpm exec tsc` → AdminInventoryPage.tsx hata yok.

### Adım 5 — `AdminWebhookEventsPage.tsx` — 2 @ts-expect-error bloğunu temizle
- **Dosyalar:** `src/views/admin/AdminWebhookEventsPage.tsx`
- **Değişiklik:** `WebhookEventRow` lokal interface tanımla, sorgu ve mapping tiplerini buna göre düzelt.
- **Verify:** `pnpm exec tsc` → sıfır hata.

### Adım 6 — `CategoryBuilderView.tsx` — 3 @ts-expect-error bloğunu temizle
- **Dosyalar:** `src/views/admin/CategoryBuilderView.tsx`
- **Değişiklik:** `authority_content` ve `metadata` JSON alanları için `isRecord` tipi guard kullan.
- **Verify:** `pnpm exec tsc` → sıfır hata.

### Adım 7 — Final TSC & Lint Kontrolü
- **Dosyalar:** Tüm değişen dosyalar (doğrulama amaçlı).
- **Verify:**
  ```
  pnpm exec tsc -b tsconfig.build.json
  pnpm run lint
  ```

## Riskler ve Azaltmalar
| Risk | Azaltma |
|---|---|
| Density tipinin başka sayfalarda string literal olarak kullanılması | Adım 1 sonrası TSC tam hata listesini görecek, cerrahi düzeltme yapılacak |
| inventory_summary view genişletmesinin prod'da farklı davranması | Sadece TypeScript katmanı genişletiliyor, runtime'a etki yok |
| CategoryBuilderView.tsx JSON guard'larının karmaşıklaşması | Adım 6'da lokal guard tercih edilecek |

## Geri Dönüş (Rollback) Planı
- Her adım bağımsız bir commit olacak.
- `git stash` veya `git revert` ile granüler geri alma mümkündür.
