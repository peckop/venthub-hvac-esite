### Goal
Resolve the 'İNDUSTRİAL' English string spillover and CSS upper-case anomaly rendering bug in the `GuidedCategoryDiscovery` component, ensuring enterprise-grade TR string mapping (`dict.common.categoryList`) from Server-to-Client.

### Assumptions
- The raw slugs inside the Supabase DB are exclusively English strings (e.g., `residential`, `industrial`).
- The `RootLayout` rightfully sets `<html lang="tr">`.
- Using `uppercase` in Tailwind triggers Turkish rules (`i` -> `İ`), heavily mutating any unmapped fallback English slugs.

### Scope Limitations (Scope Police)
- **allowed_paths**: `src/app/page.tsx`, `src/components/home/GuidedCategoryDiscovery.tsx`
- **forbidden_paths**: `src/app/layout.tsx`, `src/lib/type-converters.ts`, `src/i18n/dictionaries/*`
- **max_files_changed**: 2 (Plan Bypass mode: Safe)

### Plan
1. Fix translation mapping in SSR Root Page
   - **Files**: `src/app/page.tsx`
   - **Change**: Replace faulty dictionary target `dict.categories` with `dict.common.categoryList`. Add sub-category lookup fallback (`dict.common.categoryList.sub`).
   - **Verify**: Inspect JSON props passed to Client Component via `console.log(categories)` or evaluate output on the Next.js runtime.

2. Remove Destructive CSS Uppercase from UI
   - **Files**: `src/components/home/GuidedCategoryDiscovery.tsx`
   - **Change**: Remove `uppercase` from Tailwind className sets inside `<h3>` and `<p>` nodes of the category overlay to prevent Turkish layout engine from mangling fallback strings and enforce Title Case localization.
   - **Verify**: Visual check of the frontend that category descriptions and titles render correctly.

### Risks & mitigations
- SSR Dictionary Mismatch rendering blank headers. (Mitigation: Left `c.name` and `c.menu_label` fallbacks exactly as they are).
- Missing category maps: If `sub` object lacks the category, we gracefully degrade to DB label.

### Rollback plan
Revert formatting to `uppercase` with `git checkout HEAD~1 -- src/components/home/GuidedCategoryDiscovery.tsx` and rollback the dictionary lookup path to previous fallback behavior.
