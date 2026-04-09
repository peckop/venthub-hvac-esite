## 2024-05-18 - Replacing upsert for bulk partial updates
**Type Smell:** Wrapping an array in `as any` to pass to `supabase.from().upsert()` because the payload lacks required table columns.
**Learning:** `upsert` in Supabase structurally demands a full row object (satisfying `TablesInsert<'tableName'>`) to prevent overwriting missing NOT NULL columns with defaults. Casting partial data to `any` bypasses this protection and risks data integrity.
**Solution:** Replace bulk `upsert` calls for partial data with an array of individual `update()` requests wrapped in `Promise.all()`. This fulfills the TypeScript constraints properly without risking unintended default overwrites or requiring any type casts.
## 2025-02-23 - Removed DbCategory escape hatch in category page
**Type Smell:** `data as unknown as DbCategory` bypassed all overlap checking, treating the Supabase return type as completely unrelated to `DbCategory`.
**Learning:** Supabase's `.select('*')` returns a type that sufficiently overlaps with `DbCategory`, making `as unknown as` an unnecessary and dangerous double-cast.
**Solution:** Reduced the cast to `data as DbCategory`, which restores TypeScript's structural overlap checking while bridging the minor differences in `Json` and nested types.
