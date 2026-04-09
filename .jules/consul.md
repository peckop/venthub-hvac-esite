## 2026-04-09 - Interpolating Mixed Text and JSX in Translations
**Learning:** VentHub UI components often contain sentences that mix plain text with styled dynamic components (e.g., `<span>{count}</span>`). The custom dictionary interpolator only supports string values.
**Action:** When translating sentences wrapping JSX elements, split the sentence into prefix and suffix keys (e.g., `systemTotalPrefix`, `itemsListed`) or extract the logic appropriately rather than attempting to pass React nodes to the string interpolator.
