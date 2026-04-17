## 2025-02-28 - Removed generic fallback type cast in `CategorySeriesView`
**Type Smell:** The fallback assignment for empty technical specs `(p.technical_specs as unknown as Record<string, string>) || {}` was failing to consider proper JSON schema casting natively defined in the codebase.
**Learning:** VentHub uses `isRecord` from `type-converters.ts` to identify and safely refine `unknown` types to `Record<string, unknown>`. This is the preferred approach over forced-casting nested Supabase `Json` types back to an unknown object mapping in domain models.
**Solution:** `isRecord(p.technical_specs) ? p.technical_specs : {}` properly maps the Json payload down safely while respecting the existing `DomainProduct` structure.
## 2024-04-13 - Replace type escape hatch in deep_analysis.ts
**Type Smell:** Casting Supabase response arrays blindly with `as unknown as Type[]`
**Learning:** Using `as unknown as Type[]` for Supabase `.select()` responses is risky because it completely bypasses the type-checker's knowledge of the schema and hides potential breaking changes. The `_data` variable shadow name was also indicative of trying to sidestep the expected `data` object structure.
**Solution:** Chained `.returns<Type[]>()` directly to the Supabase query to securely type the `data` array result without needing to cast it later, and correctly referenced the `data` property.
## 2026-04-17 - Redundant Window Augmentation Casts
**Type Smell:** Inline explicit casting of `window` to an augmented type (e.g., `(window as typeof window & { openLeadModal?: () => void })`).
**Learning:** `src/types/env.d.ts` already declares the `openLeadModal?: () => void` property on the global `Window` interface, making inline casting redundant and a potential source of untracked divergence.
**Solution:** Removed the inline casting and directly called `window.openLeadModal?.()` since TypeScript already knows about the property via the global declaration.
