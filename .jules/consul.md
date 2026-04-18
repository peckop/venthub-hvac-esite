## 2026-04-09 - Interpolating Mixed Text and JSX in Translations
**Learning:** VentHub UI components often contain sentences that mix plain text with styled dynamic components (e.g., `<span>{count}</span>`). The custom dictionary interpolator only supports string values.
**Action:** When translating sentences wrapping JSX elements, split the sentence into prefix and suffix keys (e.g., `systemTotalPrefix`, `itemsListed`) or extract the logic appropriately rather than attempting to pass React nodes to the string interpolator.
## 2026-04-14 - Localizing Client Components
**Learning:** To localize Client Components in VentHub, the correct import path for the `useI18n` hook is `@/i18n/client`, not relative paths like `../../i18n/I18nProvider`. If you encounter undefined variables, ensure the hook result is destructured as `const { t } = useI18n()`.
**Action:** Always verify the correct import path for `useI18n` in Client Components and use the standard `const { t } = useI18n()` pattern.
## 2025-04-18 - Strict Hierarchy and Clean Imports

**Learning:** Deep relative imports (e.g., `../../../`) for standard i18n hooks and utils break clean architecture standards. Additionally, guessing dictionary namespaces (e.g., adding keys meant for `common` into `admin.common`) breaks strict TypeScript type-checking. Translating static configuration arrays requires them to be converted to functions (e.g., `getUsageLocations(t)`) passing the hook closure so React rules are preserved.
**Action:** Always use the absolute `@/` alias mapped to the `src/` directory (e.g., `import { useI18n } from '@/i18n/I18nProvider'`). Manually cross-reference the exact JSON hierarchy in `tr.ts` before using a `t()` key. Convert static static objects/arrays to functions wrapping `t` when translating non-JSX configurations.
