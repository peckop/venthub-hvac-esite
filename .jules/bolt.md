## 2024-06-18 - [React Re-renders in ProductDetailPageView]
**Learning:** ProductDetailPageView was suffering from unnecessary re-renders when activeSection changed during scrolling, because heavy sub-components (like ProductSmartInference and ImageGallery) weren't sufficiently memoized or detached from the scroll spy state.
**Action:** Always memoize expensive child components in complex pages with scroll spies, or lift the scroll spy state into a separate, smaller component to avoid re-rendering the entire page.
