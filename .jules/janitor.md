## 2024-05-18 - Resolve type escape in Category Data fetching
**Debt:** `data as unknown as DbCategory` was used to bypass the type checker in `src/app/category/[categorySlug]/page.tsx` and `src/app/category/[categorySlug]/[subCategorySlug]/page.tsx`.
**Root Cause:** The `data` returned from Supabase had missing or non-matching fields with `DbCategory` (like `menu_label` or `metadata` which required specific types) that made direct casting impossible.
**Resolution:** Replaced the `unknown` cast by explicitly destructuring the returned data, applying type assertions to the conflicting string and JSON properties, and then casting the result `as DbCategory` safely without `unknown`.
## $(date +%Y-%m-%d) - Remove broad eslint-disable in AdminInventoryPage
**Debt:** The `src/views/admin/AdminInventoryPage.tsx` file had a broad file-level `/* eslint-disable */` comment to suppress lint errors.
**Root Cause:** The lint errors were caused by an unused import (`VisibleCols`) and an unused local function (`handleUpdateThreshold`) that was never connected to the child `InventoryTable` component.
**Resolution:** Removed the file-level suppressor, the unused import, and the unused function. This allows the linter to properly analyze the file without masking other potential issues.
