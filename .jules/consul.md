## 2026-04-09 - Interpolating Mixed Text and JSX in Translations
**Learning:** VentHub UI components often contain sentences that mix plain text with styled dynamic components (e.g., `<span>{count}</span>`). The custom dictionary interpolator only supports string values.
**Action:** When translating sentences wrapping JSX elements, split the sentence into prefix and suffix keys (e.g., `systemTotalPrefix`, `itemsListed`) or extract the logic appropriately rather than attempting to pass React nodes to the string interpolator.
## 2026-04-14 - Localizing Client Components
**Learning:** To localize Client Components in VentHub, the correct import path for the `useI18n` hook is `@/i18n/client`, not relative paths like `../../i18n/I18nProvider`. If you encounter undefined variables, ensure the hook result is destructured as `const { t } = useI18n()`.
**Action:** Always verify the correct import path for `useI18n` in Client Components and use the standard `const { t } = useI18n()` pattern.
