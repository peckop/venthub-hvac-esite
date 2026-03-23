### Goal
Projedeki `id` vs `_id` uyu?mazl???n? ??zmek ve `process.env` hatalar?n? gidermek.

### Assumptions
- Veritaban?ndaki kolon ismi `id`'dir.
- `_id` kullan?m? yanl??l?kla veya yanl?? bir d?n???m sonucu olu?mu?tur.

### Plan
1. **Temel Tip D?zeltmeleri**
   - Files: `src/types/database.types.ts`, `src/types/db-rows.ts`
   - Change: `_id` alanlar?n? `id` olarak de?i?tir. `DbCategory`, `DbProduct` ve di?er ana tablolar?n sat?r tiplerini g?ncelle.
   - Verify: `pnpm exec tsc` (hatalar?n yer de?i?tirdi?ini ve bile?en seviyesine indi?ini do?rula).

2. **D?n??t?r?c? ve Hook G?ncellemeleri**
   - Files: `src/lib/type-converters.ts`, `src/hooks/useCategoryGateway.ts`, `src/types/ui-models.ts`
   - Change: `mapDatabaseCategoryToDomain` fonksiyonunu ve ilgili aray?zleri (`DomainCategory` vb.) `id` kullanacak ?ekilde g?ncelle.
   - Verify: Hook i?indeki tip hatalar?n?n giderildi?ini do?rula.

3. **UI ve Admin Sayfas? Onar?mlar?**
   - Files: `src/components/admin/categories/CategoryFormModal.tsx`, `src/views/admin/AdminCategoriesPage.tsx`, `src/components/category/CategoryShowcase.tsx`
   - Change: T?m `._id` referanslar?n? `.id` ile de?i?tir. `process.env` eri?imi i?in `global.d.ts` kontrol? yap veya Next.js standartlar?nda env kullan?m?n? sa?la.
   - Verify: `pnpm run lint` ve `pnpm exec tsc`.

4. **Final Kontrol ve Derleme**
   - Files: `src/`
   - Change: Lint ve tip hatalar?n?n %100 temizlendi?inden emin ol.
   - Verify: `pnpm run build`.

### Risks & mitigations
- **K?r?lmalar:** `_id` -> `id` d?n???m? geni? ?apl? bir de?i?ikliktir. Her ad?mda `tsc` ile kontrol yap?larak hatalar takip edilecektir.

### Rollback plan
- `git checkout .` veya `git stash` ile de?i?iklikler geri al?nabilir.

