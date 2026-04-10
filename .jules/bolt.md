## 2024-06-18 - [React Re-renders in ProductDetailPageView]
**Learning:** ProductDetailPageView was suffering from unnecessary re-renders when activeSection changed during scrolling, because heavy sub-components (like ProductSmartInference and ImageGallery) weren't sufficiently memoized or detached from the scroll spy state.
**Action:** Always memoize expensive child components in complex pages with scroll spies, or lift the scroll spy state into a separate, smaller component to avoid re-rendering the entire page.
## 2024-06-18 - [Supabase Network Payload and Reduce Optimization]
**Learning:** Selecting all columns (`select('*')`) on large queries (e.g., limit 1000) causes significant unnecessary network payload. Also, chaining array methods like `reduce` and `filter` on large arrays increases iterations and memory allocation compared to a single `O(n)` standard loop.
**Action:** Always explicitly specify required columns in Supabase `select` statements instead of using `*`. When performing multiple aggregate calculations on a dataset, use a single `for` loop to compute all metrics in exactly one pass rather than chaining `.map()`, `.filter()`, or `.reduce()`.
