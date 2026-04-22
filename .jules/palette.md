## 2025-02-23 - Focus Ring Consistency and Component Abstraction
**Learning:** Adding explicit Tailwind focus rings (`focus-visible:ring-2 focus-visible:ring-primary-navy`) alongside existing internal utility classes like `focus-ring` exposes potential fragmentation in how focus states are declared across the UI layer. Some elements utilize utility classes, others rely on direct Tailwind properties. Furthermore, translating hardcoded strings embedded deep within layout components highlights a coupling of content and presentation.
**Action:** For future sweeps, verify the existence of centralized UI primitives or global CSS utilities (e.g. standardizing `focus-ring` in `index.css`) before applying lengthy utility strings to individual generic elements, adhering to DRY principles. Continue to aggressively decouple hardcoded strings from component logic using `useI18n`.

## 2024-05-24 - Accessible Accordion Patterns
**Learning:** VentHub's custom accordion components (like FAQ and HowItWorks) often lack necessary ARIA attributes linking the toggle button to the expandable content.
**Action:** Always ensure accordion buttons have `aria-expanded` and `aria-controls`, and that the collapsible content wrapper has a matching `id`. Also, verify interactive buttons have `type="button"` to avoid implicit form submission bugs.

## 2024-05-25 - Expanding UX Coverage with Custom Interaction Elements
**Learning:** Adding explicit focus rings on pseudo-accordion and interactive step elements (`ScrollLinkedProcess`, `StepIndicator`) ensures that dynamic navigation components are fully visible to keyboard users without altering core structural functionality. Combining `type="button"` with `focus-visible:ring-primary-navy` reliably prevents unintended form behaviors and enforces standard accessibility interaction patterns.
**Action:** When inspecting non-standard navigation controls (like custom steps or timeline buttons), systematically enforce `type="button"` and `focus-visible` Tailwind rings, prioritizing screen-reader clear labels if internal text content isn't explicitly descriptive enough.
