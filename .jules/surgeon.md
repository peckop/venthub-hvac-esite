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
## 2025-05-19 - Supabase QueryData Utility for Nested Joins
**Type Smell:** Using \`as unknown as ManualInterface\` to cast complex Supabase queries containing nested joins (e.g., \`!inner()\`).
**Learning:** Manual interfaces for nested relationships are brittle and often fail to capture the \`T | T[] | null\` union correctly. Supabase provides a \`QueryData\` utility type that perfectly infers the exact return shape directly from the query builder.
**Solution:** Create a dummy query function (e.g., \`const q = (supabase) => supabase.from('...').select('...')\`) and infer the type using \`type Row = QueryData<ReturnType<typeof q>>[number]\`.

## 2025-05-19 - Extending Supabase Database Types for Missing Tables
**Type Smell:** Creating a massive manual interface representing the entire \`SupabaseClient\` and double-casting \`(supabase as unknown as SupabaseClientOverride)\` just to query a table missing from the generated \`Database\` type (like \`tenants\`).
**Learning:** Directly extending the \`Database\` type using \`Omit\` allows you to safely inject missing tables into the \`public.Tables\` schema without losing the type safety of the client or the rest of the generated types. Simple intersections (\`Database & ...\`) cause generic overlap errors.
**Solution:** Create an \`ExtendedDatabase\` type: \`type ExtendedDatabase = Omit<Database, 'public'> & { public: Omit<Database['public'], 'Tables'> & { Tables: Database['public']['Tables'] & { tenants: { Row: ... } } } }\` and cast the client \`(supabase as SupabaseClient<ExtendedDatabase>)\`.
