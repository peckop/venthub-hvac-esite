## 2024-03-24 - Bulk Upsert Type Bypass
**Debt:** The `upsert(updates as any)` workaround used during bulk price updates in `AdminProductsPage.tsx`.
**Root Cause:** The `upsert` method requires an array of objects matching the `Insert` payload. Because the bulk update map only returned `id` and `price` (omitting other `NOT NULL` columns), TypeScript threw an error. The author bypassed this with `as any`.
**Resolution:** Replaced the bulk `upsert` with a mapping of individual `.update()` promises wrapped in `Promise.all()`. This correctly satisfies the `Update` type requirements without bypassing the type system, and also prevents the silent danger of `upsert` overwriting data with stale nulls for omitted fields.
