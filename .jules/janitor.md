## 2024-05-18 - Resolve type escape in Category Data fetching
**Debt:** `data as unknown as DbCategory` was used to bypass the type checker in `src/app/category/[categorySlug]/page.tsx` and `src/app/category/[categorySlug]/[subCategorySlug]/page.tsx`.
**Root Cause:** The `data` returned from Supabase had missing or non-matching fields with `DbCategory` (like `menu_label` or `metadata` which required specific types) that made direct casting impossible.
**Resolution:** Replaced the `unknown` cast by explicitly destructuring the returned data, applying type assertions to the conflicting string and JSON properties, and then casting the result `as DbCategory` safely without `unknown`.
