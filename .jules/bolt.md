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
