## 2026-04-09 - Interpolating Mixed Text and JSX in Translations
**Learning:** VentHub UI components often contain sentences that mix plain text with styled dynamic components (e.g., `<span>{count}</span>`). The custom dictionary interpolator only supports string values.
**Action:** When translating sentences wrapping JSX elements, split the sentence into prefix and suffix keys (e.g., `systemTotalPrefix`, `itemsListed`) or extract the logic appropriately rather than attempting to pass React nodes to the string interpolator.
## 2026-04-14 - Localizing Client Components
**Learning:** To localize Client Components in VentHub, the correct import path for the `useI18n` hook is `@/i18n/client`, not relative paths like `../../i18n/I18nProvider`. If you encounter undefined variables, ensure the hook result is destructured as `const { t } = useI18n()`.
**Action:** Always verify the correct import path for `useI18n` in Client Components and use the standard `const { t } = useI18n()` pattern.
## 2025-04-18 - Strict Hierarchy and Clean Imports

**Learning:** Deep relative imports (e.g., `../../../`) for standard i18n hooks and utils break clean architecture standards. Additionally, guessing dictionary namespaces (e.g., adding keys meant for `common` into `admin.common`) breaks strict TypeScript type-checking. Translating static configuration arrays requires them to be converted to functions (e.g., `getUsageLocations(t)`) passing the hook closure so React rules are preserved.
**Action:** Always use the absolute `@/` alias mapped to the `src/` directory (e.g., `import { useI18n } from '@/i18n/I18nProvider'`). Manually cross-reference the exact JSON hierarchy in `tr.ts` before using a `t()` key. Convert static static objects/arrays to functions wrapping `t` when translating non-JSX configurations.
## 2026-05-18 - Replacing Fallback Strings with Regex
**Learning:** Using regex (e.g. `sed -E "s/ || '[^']*'//g"`) to remove `t('key') || 'Fallback'` patterns across components is dangerous. It strips necessary JavaScript logic defaults (like `|| ''` or `|| 'TR'`) from non-translation code, causing uncontrolled input errors and breaking application logic.
**Action:** Use specific, targeted replacements or tools like `jscodeshift` when updating translation keys, and never run arbitrary `|| '...'` removal regex commands against the codebase. Always manually verify form state and hook dependencies after localization sweeps.
## 2025-02-21 - Array Structures in Dictionary
**Learning:** Returning array configurations directly from `tr.ts` causes TypeScript issues because the dictionary system does not natively type-cast generic arrays. This led to 'Type Converters' enterprise rule failures when trying to use `as unknown as Record<string, string>`.
**Action:** When adding configurations containing arrays to `tr.ts`, structure them as string-indexed objects (e.g. `withoutList: { '0': 'Item 1', '1': 'Item 2' }`). In the component, retrieve them as individual strings directly (e.g. `t('category.problemSection.withoutList.0')`) or map over a static array of keys to prevent TypeScript type errors.
