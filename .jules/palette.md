## 2025-04-08 - Use useI18n for aria-labels in Client Components
**Learning:** Found a hardcoded string ("Yükleniyor") inside an aria-label in the LoadingSpinner component. The application strictly enforces a "No-Hardcoded Strings" policy.
**Action:** When adding or updating `aria-label` attributes in Client Components, always use the `useI18n()` hook to fetch localized strings (e.g., `aria-label={t('common.loading')}`) instead of hardcoding text.
