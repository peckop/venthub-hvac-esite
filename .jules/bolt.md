## 2024-06-18 - [React Re-renders in ProductDetailPageView]
**Learning:** ProductDetailPageView was suffering from unnecessary re-renders when activeSection changed during scrolling, because heavy sub-components (like ProductSmartInference and ImageGallery) weren't sufficiently memoized or detached from the scroll spy state.
**Action:** Always memoize expensive child components in complex pages with scroll spies, or lift the scroll spy state into a separate, smaller component to avoid re-rendering the entire page.
## 2024-06-18 - [Supabase Network Payload and Reduce Optimization]
**Learning:** Selecting all columns (`select('*')`) on large queries (e.g., limit 1000) causes significant unnecessary network payload. Also, chaining array methods like `reduce` and `filter` on large arrays increases iterations and memory allocation compared to a single `O(n)` standard loop.
**Action:** Always explicitly specify required columns in Supabase `select` statements instead of using `*`. When performing multiple aggregate calculations on a dataset, use a single `for` loop to compute all metrics in exactly one pass rather than chaining `.map()`, `.filter()`, or `.reduce()`.
## 2026-04-12 - Context Memoization

**Learning:** Missing memoization in top-level context providers (like `CartProvider`, `CategoryContext`, `AuthContext`) causes massive cascading re-render storms across the entire app whenever any minor state changes inside the provider.
**Action:** Always wrap Context `value` objects in `useMemo` and context-modifying functions in `useCallback`, taking care to include all necessary state variables in dependency arrays to satisfy exhaustive-deps while maintaining stable references.
## 2025-02-23 - [Single Pass Loop vs map/filter/reduce]
**Learning:** Using chained array methods (`.map().filter()`) and spreading results into `Math.max(...prices)` can cause O(N) memory allocations, multiple iterations, and a potential 'Maximum call stack size exceeded' error on large arrays.
**Action:** Replace `const prices = arr.map(x => x.val).filter(...); Math.max(...prices)` with a single `for` loop that safely calculates the maximum value in one pass (`O(1)` space, `O(N)` time).
## $(date +%Y-%m-%d) - Context Provider Memoization Strategy
**Learning:** In Next.js/React architectures, recomputing complex values (like using `.reduce()` over arrays) inside getter functions stored in Context causes redundant execution during every descendant re-render. Changing these API signatures from functional getters (`getCartTotal()`) to static properties (`cartTotal`) breaks numerous consumer components.
**Action:** When optimizing Context performance, use `useMemo` internally to cache the computation result based on its underlying dependencies, but retain the existing public functional API by wrapping the memoized result in `useCallback` (e.g., `useCallback(() => cartTotal, [cartTotal])`).
## 2026-04-15 - Optimize repeated array lookups
**Learning:** `Array.find()` inside a sorting function or a render loop leads to $O(N \times M)$ complexity and severe performance degradation on large lists.
**Action:** Always pre-compute a lookup `Map` (hash map) with $O(1)$ access via `useMemo` when performing cross-reference lookups during sorting or array rendering.
## 2024-05-25 - Avoid spreading mapped arrays into Math.max
**Learning:** Using `Math.max(...array.map(fn))` on potentially large datasets like `chartData` creates intermediate arrays and can throw `RangeError: Maximum call stack size exceeded`.
**Action:** Use a single-pass `for` loop or `reduce` to find the maximum value, which avoids memory bloat and call stack overflow.
## 2025-05-18 - Avoid array micro-optimizations and upserts for N+1
**Learning:** Replacing `.map` and `.filter` with `for` loops or `reduce` degrades readability for zero macro-level gain and is rejected. Fabricating payloads to use `.upsert()` for bulk updates causes severe data corruption by overwriting missing columns with empty strings.
**Action:** Solve N+1 queries mathematically at the network level by refactoring multiple discrete `.select()` calls into a single Supabase relational query (e.g., `supabase.from('orders').select('*, items(*)')`).
## 2024-05-26 - [Supabase Select Network Payload]
**Learning:** Using `.select('*')` on queries like `getCategories` or `getProducts` introduces a huge network payload, significantly impacting TTFB (Time to First Byte).
**Action:** Always extract explicitly required fields from `src/types/database.types.ts` or `src/types/db-rows.ts` and use them in `.select('field1, field2')` instead.

## 2024-05-26 - [Context O(1) Hash Map Optimization]
**Learning:** Using `categories.find()` and `categories.filter()` inside React Context getters (like `CategoryContext`) creates $O(N \times M)$ bottlenecks on pages that render many categories.
**Action:** Replace `.find` and `.filter` on large arrays inside Context providers with `useMemo` hash maps (`Map`) to enable $O(1)$ lookups without breaking consumer code.
