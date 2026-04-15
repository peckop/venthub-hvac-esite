## 2025-04-14 - Ensure keyboard focus indicators and hide elements correctly
**Learning:** Replacing conditional rendering with CSS transitions creates a smoother experience, but using `opacity-0` alone leaves elements in the tab order (ghost focus). `pointer-events-none` prevents mouse clicks but not keyboard focus.
**Action:** When hiding elements visually, always use `invisible` (visibility: hidden) along with `tabIndex={-1}` and `aria-hidden={true}` to fully remove them from the accessibility tree and keyboard navigation.
