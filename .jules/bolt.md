## 2024-06-18 - [React Re-renders in ProductDetailPageView]
**Learning:** ProductDetailPageView was suffering from unnecessary re-renders when activeSection changed during scrolling, because heavy sub-components (like ProductSmartInference and ImageGallery) weren't sufficiently memoized or detached from the scroll spy state.
**Action:** Always memoize expensive child components in complex pages with scroll spies, or lift the scroll spy state into a separate, smaller component to avoid re-rendering the entire page.
## 2024-06-18 - [Supabase Network Payload and Reduce Optimization]
**Learning:** Selecting all columns (`select('*')`) on large queries (e.g., limit 1000) causes significant unnecessary network payload. Also, chaining array methods like `reduce` and `filter` on large arrays increases iterations and memory allocation compared to a single `O(n)` standard loop.
**Action:** Always explicitly specify required columns in Supabase `select` statements instead of using `*`. When performing multiple aggregate calculations on a dataset, use a single `for` loop to compute all metrics in exactly one pass rather than chaining `.map()`, `.filter()`, or `.reduce()`.
## 2024-03-24 - Context Provider Memoization Breakage
**Learning:** Context providers that expose functions directly in their `value` object without `useCallback` or `useMemo` will break `React.memo()` optimizations in consuming components (e.g. `ProductCard`), causing widespread unnecessary re-renders across the entire frontend product grid.
**Action:** Always wrap Context provider values in `useMemo` and bounded functions in `useCallback` when optimizing large React trees to ensure descendant re-renders are actually prevented.
