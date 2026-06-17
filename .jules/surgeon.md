## 2023-10-27 - Batch Type Escape Hatch Removal

**Type Smell:** Various inline type escape hatches (`as typeof`) used for global objects (`Window`, `THREE`, `globalThis`) and Supabase query builder.
**Learning:** These casts masked the absence of proper global interface extensions and accurate typing of database outputs. Inline casts of UI domain objects like `DomainCategory` to fetch optional DB fields created fragile codebase coupling.
**Solution:** Explicitly extend global types in `env.d.ts` (like `Window`), use `keyof typeof` to narrow down dynamic imports (e.g., Lucide icons), and safely fall back to the `in` operator (e.g., `'vi' in globalThis`) instead of `typeof globalThis & { vi?: unknown }`. Avoid mapping UI models directly to database rows mid-stream; instead, perform necessary property checks safely without using intersections like `category as typeof category & { ... }`.
## 2025-02-20 - Safe Window and Object Shims
**Type Smell:** `as unknown as` used to force custom properties onto global objects like `THREE.Clock` during shimming.
**Learning:** Hard-casting external library objects bypasses safety entirely when trying to mutate them.
**Solution:** Use JavaScript's native `in` operator combined with `typeof` checks to dynamically verify an object's structure and property presence before safely extending it with `Object.defineProperty`, eliminating the need for `as unknown as`.
## 2025-05-18 - Clean Type Safety Sweep
**Type Smell:** None.
**Learning:** A comprehensive diagnostic sweep of the codebase for type escape hatches (`as any`, `as unknown as`, `// @ts-ignore`, `// @ts-expect-error`) returned zero results in production code. The codebase relies entirely on strong typing, type guards (`isRecord`), and Supabase generated types (`database.types.ts`).
**Solution:** Clean sweep: zero type escape hatches found. Codebase health is optimal.
## 2026-06-17 - Tenant Server Database Type Extended
**Type Smell:** Double-casting SupabaseClient with 'as unknown as SupabaseClientOverride' for an internal 'tenants' table that is not in database.types.ts
**Learning:** Internal tables missing from auto-generated types cause double-cast escape hatches. Creating an ExtendedDatabase type intersecting missing tables with Omit allows type safe SupabaseClient.
**Solution:** Defined 'ExtendedDatabase = Omit<Database, "public"> & { public: Omit<Database["public"], "Tables"> & { Tables: Database["public"]["Tables"] & { tenants: ... } } }' and used 'as SupabaseClient<ExtendedDatabase>'.
