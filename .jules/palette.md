
## 2024-05-18 - Keyboard Accessibility in Interactive Carousels
**Learning:** Icon-only navigation buttons in custom components like HeroCarousel were missing both ARIA labels and focus indicators, making them invisible to screen readers and keyboard-only users. Applying a strict `aria-label` with `useI18n` instead of hardcoded Turkish values ensures consistency.
**Action:** Always add `focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none` and `useI18n` mapped `aria-label`s to custom pagination and navigation buttons (`<button>`, `Link`) across the Tailwind UI to preserve accessibility standards.
