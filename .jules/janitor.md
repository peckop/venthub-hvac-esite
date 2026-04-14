## 2025-02-14 - Type Safety in Global Window Augmentation
**Debt:** The `as any` type escape and `// eslint-disable-next-line @typescript-eslint/no-explicit-any` on `(window as any).openLeadModal?.()` in `src/components/home/ClientLeadButton.tsx`.
**Root Cause:** A developer likely assumed that adding properties to the `window` object in TypeScript required bypassing the type system because they were unaware that `openLeadModal` was already correctly typed via `interface Window` in `src/types/env.d.ts`.
**Resolution:** Removed the `eslint-disable` comment and `as any` assertion. The code naturally inferred the correct types from the global declaration, ensuring full strict-mode compliance without breaking any TS definitions.
