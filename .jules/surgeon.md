## 2023-10-27 - Batch Type Escape Hatch Removal

**Type Smell:** Various inline type escape hatches (`as typeof`) used for global objects (`Window`, `THREE`, `globalThis`) and Supabase query builder.
**Learning:** These casts masked the absence of proper global interface extensions and accurate typing of database outputs. Inline casts of UI domain objects like `DomainCategory` to fetch optional DB fields created fragile codebase coupling.
**Solution:** Explicitly extend global types in `env.d.ts` (like `Window`), use `keyof typeof` to narrow down dynamic imports (e.g., Lucide icons), and safely fall back to the `in` operator (e.g., `'vi' in globalThis`) instead of `typeof globalThis & { vi?: unknown }`. Avoid mapping UI models directly to database rows mid-stream; instead, perform necessary property checks safely without using intersections like `category as typeof category & { ... }`.
