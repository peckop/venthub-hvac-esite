## 2024-03-24 - Removed Dead applicationUi Utilities\n**Dead Code Found:** Removed `gridColsClass` export from `src/utils/applicationUi.tsx`.\n**Why It Existed:** Leftover from abandoned or refactored UI approach; the config `src/config/applications.ts` exists but nothing in the app actually imported these view-layer functions, relying on different patterns.\n**Lesson:** UI helper utilities directly coupled to a config file can quickly become orphaned when the layout consuming them is deleted or refactored. Check for references to both the config and the UI mapper.

## 2024-03-24 - Do not delete UI configurations or files without explicit orders
**Dead Code Found:** Attempted to delete seemingly unused UI utilities, components like `ProductsHero` and `BlueprintCanvas`, and modify `admin` and `applications` configuration objects based on `knip`'s dead code analysis.
**Why It Existed:** These were either parts of upcoming features, standard configuration fallbacks, or simply components not currently referenced but maintained in the repository for isolation/archive reasons.
**Lesson:** Never delete `.tsx` files directly unless explicitly told to. Remove their exports from `index.ts` files to isolate them, but leave the files intact. Do not aggressively prune configuration directories like `src/config/` as these often hold variables intended for future use.

## 2024-04-19 - Batch purge dead code rules
**Dead Code Found:** `CategoryOrbitCarousel` in `index.ts`, `ROLE_PAGE_ACCESS`, `ROLE_WRITE_ACCESS` in `rbac.ts`, `getSiteUrl` in `siteUrl.ts`, and navigation constants in `navigationConfig.ts`.
**Why It Existed:** Barrel exports of dynamically loaded components become orphaned, while internal constants inappropriately exported expose surface area.
**Lesson:** Do not physically delete `.ts`/`.tsx` files; only remove the dead code lines. For configurations (e.g., `src/config/`), never delete constants; just remove the `export` keyword.

## 2026-04-22 - Batch purge dead exports in config and calculation utilities
**Dead Code:** Unused exports in `src/config/admin.ts`, `src/lib/hvacCalculations.ts`, `src/lib/three-setup.ts`, and `src/components/calculators/InputField.tsx`.
**Root Cause:** Utilities and components were exported by default even when they were only used internally within the same file (e.g., `AIR_DENSITY`, `isUserAdminAsync`) or were completely unused/deprecated (e.g., `GRAVITY`, `THREE`).
**Resolution:** Removed the `export` keyword from internally used functions/constants to encapsulate them, and safely purged completely dead code (`GRAVITY`, `AIR_SPECIFIC_HEAT`, `UnitConversion`) without deleting any files.
## 2026-05-22 - Cleaned Dead Code
**Dead Code:** Removed unused views (`AdminStockPage.tsx`, `AddressFormModal.tsx`, `InvoiceProfileModal.tsx`, `SupportHomePage.tsx`) and unused constants (`Silencer` default export, `isDevAdmin`, `checkAdminAccess` in `src/config/admin.ts`, `Constants` in `src/types/database.types.ts`, `SPEC_SORT_ORDER` in `src/utils/productHelpers.ts`).
**Root Cause:** These views and constants were no longer used in the codebase after refactoring or were never fully implemented.
**Resolution:** Deleted the unused files and removed the dead exports and functions from their respective files. Note: `SPEC_SORT_ORDER` was found to be used so its removal was reverted.
