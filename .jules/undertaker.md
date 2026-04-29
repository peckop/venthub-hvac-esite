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

## 2025-02-28 - Purge 5 orphaned components & exports
**Dead Code:** Removed 4 dead components (CategoryAuthoritySection, InventoryCsvImport, InventoryDetailDrawer, InvoiceProfileModal) and 2 unused constants (`VENTHUB_LOGO_BASE64` in `pdfAssets.ts` and `brand.ts` entirely).
**Root Cause:** Heavy iteration on UI components left multiple orphaned versions. Similar leftover pieces in unused checkout/inventory modals. Constants like logo and WhatsApp link were left over after migrating to dynamic or system-level configuration without proper cleanup.
**Resolution:** Batch deleted 5 files via `git rm` and stripped the unused `VENTHUB_LOGO_BASE64` export from `src/lib/pdfAssets.ts`. Verified with rigorous Next.js 15 checks, TS, testing and building.
