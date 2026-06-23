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
## 2024-05-18 - Avoid mocked Supabase interfaces for internal tables
**Type Smell:** Hardcoding custom mocked interfaces (`SupabaseClientOverride`) and applying double-casts (`as unknown as ...`) to bypass type checking for internal tables like `tenants` that are excluded from public generated types.
**Learning:** This approach completely circumvents Supabases strong typing and often requires double-casting, hiding potential future schema drift and violating strict TypeScript rules.
**Solution:** Locally extend the generated `Database` type (e.g., via `type ExtendedDatabase = Omit<Database, "public"> & { public: ... }`) to properly register the internal table schema, then safely cast the standard SupabaseClient using a single, validated type (`as SupabaseClient<ExtendedDatabase>`).
