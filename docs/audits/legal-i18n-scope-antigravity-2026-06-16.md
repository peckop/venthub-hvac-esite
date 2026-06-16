# Legal i18n Scope Audit Report

This document presents a comprehensive scope audit for the legal internationalization (i18n-literal) campaign in the VentHub HVAC codebase. 

---

## 📂 File Audit Findings

### 1. KVKKPage.tsx
- **File**: `src/views/legal/KVKKPage.tsx`
- **Archetype**: `TR_EN_SPLIT_CONTENT`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 0
- **Chrome Literal Estimate**: 0
- **Recommendation**: `KEEP_SPLIT`
- **Suggested Namespace**: `legal`
- **Has useI18n**: `true`
- **Uses 'use client' Directive**: `true`
- **Traps**:
  - *Client-Side Hydration Overhead*: The file is marked `'use client'` to fetch the locale via `useI18n()`. This forces the static content of the legal document (even if imported via `next/dynamic` with `ssr: true`) to hydra-render on the client, introducing a layout shift/skeleton loading state (`animate-pulse h-96`).
  - *RSC Boundary Lock*: If this page component were instead implemented as a React Server Component (RSC) that reads the `lang` from the route params (e.g. `[lang]/legal/kvkk`), it could directly render the correct static HTML component (`KvkkContentTr` or `KvkkContentEn`) on the server. This would eliminate unnecessary client-side JavaScript, hydrate instantly, and optimize SEO.
- **English Idiom Risks**:
  - *Aydınlatma Metni* &rarr; Translated as "clarification text". While literal, "Privacy Notice" or "Information Notice" is more idiomatic in English legal context.
  - *Açık Rıza* &rarr; Translated as "Specific consent". Under standard GDPR/KVKK equivalence, "Explicit consent" is the preferred terminology.
  - *İlgili Kişi* &rarr; Translated as "Data Subject" (Correct).
  - *Veri Sorumlusu* &rarr; Translated as "Data Controller" (Correct).
- **Notes**: The file is completely clean of hardcoded user-facing literals. All page chrome text (`legal.kvkkTitle`, `legal.draftWarning`, `legal.disclaimer`) is properly localized. Long-form prose is delegated to dynamic subcomponents based on language selection, which is the recommended approach to avoid bloated dictionaries.

---

### 2. tr/KvkkContent.tsx
- **File**: `src/views/legal/components/tr/KvkkContent.tsx`
- **Archetype**: `TR_EN_SPLIT_CONTENT`
- **Content Type**: `LONG_FORM_LEGAL_PROSE`
- **User-Facing Literal Estimate**: 47
- **Chrome Literal Estimate**: 0
- **Recommendation**: `KEEP_SPLIT`
- **Suggested Namespace**: `legal.kvkk`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *Client-Side Rendering Context*: Even though this component does not use the `'use client'` directive, its parent wrapper (`KVKKPage.tsx`) has `'use client'`. This makes this file part of the client bundle.
  - *Manual Maintenance Risk*: Since the Turkish and English content versions are split into separate files (`tr/KvkkContent.tsx` and `en/KvkkContent.tsx`), any updates to the legal content clauses must be manually applied to both files.
  - *Typos inside prose*: There is an English word leak ("telephone" instead of "telefon") in line 24 of the Turkish version, and a Turkish typo ("operasyonlerin" instead of "operasyonların") in line 38.
- **English Idiom Risks**:
  - *Veri Sorumlusu* &rarr; "Data Controller"
  - *İşlenen Kişisel Veri Kategorileri* &rarr; "Categories of Processed Personal Data"
  - *Açık rıza* &rarr; "Specific consent" is used in the English component, whereas "Explicit consent" is the standard translation for "Açık rıza" under KVKK.
  - *Yurt Dışına Aktarım* &rarr; "International Transfers"
  - *Kurul* &rarr; "Board" (referring to the Turkish Personal Data Protection Board - KVKK)
- **Notes**: The component is part of a split layout architecture (`TR_EN_SPLIT_CONTENT`) specifically used for long-form legal agreements to avoid bloating the global localization files. The recommendation is to keep this split structure (`KEEP_SPLIT`) but correct the minor spelling typos inside the Turkish prose.

---

### 3. en/KvkkContent.tsx
- **File**: `src/views/legal/components/en/KvkkContent.tsx`
- **Archetype**: `TR_EN_SPLIT_CONTENT`
- **Content Type**: `LONG_FORM_LEGAL_PROSE`
- **User-Facing Literal Estimate**: 44
- **Chrome Literal Estimate**: 18
- **Recommendation**: `KEEP_SPLIT`
- **Suggested Namespace**: `legal.kvkk`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *RSC Boundary / Client Context Dynamic Import*: The component itself does not declare 'use client' but is dynamically imported and rendered by a client parent component (`KVKKPage.tsx`).
  - *Interpolation Risks*: Renders dynamic values from `legalConfig` (e.g., `sellerTitle`, `sellerAddress`, `sellerEmail`, etc.). These are configs and do not count as user-facing literals.
  - *HTML Tag/DOM Structure Bloat*: It embeds DOM elements such as `<strong>`, `<br />`, and `<Link>` within paragraph text. Restructuring this into a JSON dictionary key-value format would lead to fragmented keys or complex HTML string rendering in React, which degrades maintainability.
  - *Markdown Parity*: Parallel markdown files (`KvkkContent.md` in both `tr` and `en` folders) exist. Modifying code structure may require synchronizing content with those markdown assets.
- **English Idiom Risks**:
  - *Veri Sorumlusu* &rarr; Translated as "Data Controller" (Standard GDPR/KVKK translation).
  - *Açık Rıza* &rarr; Translated as "Specific consent" (Note: "Explicit consent" is more common under GDPR, but "specific consent" matches the text here).
  - *İlgili Kişi* &rarr; Translated as "Data Subject" (Standard terminology).
  - *Aydınlatma Metni* &rarr; Translated as "clarification text" (Standard KVKK translation).
  - *Kurul* &rarr; Translated as "Board" (Refers to the Personal Data Protection Board / Kişisel Verileri Koruma Kurulu).
- **Notes**: This component implements the English-specific KVKK text separately from the Turkish view. It utilizes localized links and configurations from `legalConfig`. Splitting the long-form legal prose by language is the most maintainable strategy here, keeping dictionaries clean.

---

### 4. PrivacyPolicyPage.tsx
- **File**: `src/views/legal/PrivacyPolicyPage.tsx`
- **Archetype**: `RSC_SERVER`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 35
- **Chrome Literal Estimate**: 4
- **Recommendation**: `RESTRUCTURE`
- **Suggested Namespace**: `legal.privacy`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *Missing English Version*: Unlike KVKKPage, there is currently no English translation of the Privacy Policy content in the project.
  - *Interpolation Sentence Order*: Date and config interpolations (e.g., lastUpdated) have different word ordering in English vs. Turkish (e.g., "... tarihinde güncellenmiştir" vs. "updated on ...").
  - *Static Rendering*: The page wrapper is marked static, so any dynamic imports of components must support `ssr: true`.
- **English Idiom Risks**:
  - *Veri Sorumlusu* &rarr; "Data Controller"
  - *İşleme Amaçları* &rarr; "Purposes of Processing"
  - *Açık Rıza* &rarr; "Explicit Consent"
  - *Saklama Süreleri* &rarr; "Retention Periods"
  - *KVKK m.11* &rarr; "KVKK Art. 11"
- **Notes**: The file contains hardcoded Turkish legal prose. It should be refactored to match the established pattern of the KVKK page: keep the main page as a wrapper, separate the TR and EN long-form prose into sub-components (`components/tr/PrivacyPolicyContent.tsx` and `components/en/PrivacyPolicyContent.tsx`), and dynamically import them according to the `lang` prop. Common UI Chrome (such as the title and test draft alert warning) should be placed in the global i18n dictionary.

---

### 5. CookiePolicyPage.tsx
- **File**: `src/views/legal/CookiePolicyPage.tsx`
- **Archetype**: `RSC_SERVER`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 17
- **Chrome Literal Estimate**: 4
- **Recommendation**: `RESTRUCTURE`
- **Suggested Namespace**: `legal`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - RSC rendering boundary transition (requires adding 'use client' to consume useI18n)
  - Missing English translation of the Cookie Policy in the codebase
  - Grammatical/structural interpolation risks for the last updated date sentence ("Bu Çerez Politikası {date} tarihinde güncellenmiştir." vs. "This Cookie Policy was last updated on {date}.")
- **English Idiom Risks**:
  - "Zorunlu Çerezler" &rarr; "Strictly Necessary Cookies"
  - "İşlevsel Çerezler" &rarr; "Functional Cookies"
  - "Analitik/Performans Çerezleri" &rarr; "Performance and Analytical Cookies"
  - "Üçüncü Taraf Çerezleri" &rarr; "Third-Party Cookies"
  - "Yürürlük" &rarr; "Effective Date"
- **Notes**: The file currently contains completely hardcoded Turkish legal text and some UI Chrome. It should be refactored to match the pattern used in KVKKPage.tsx: extract the long-form clauses into dedicated TR and EN sub-components, load them dynamically, add the 'use client' directive, and migrate UI Chrome (title, warning banner, date message) to the i18n dictionaries.

---

### 6. DistanceSalesAgreementPage.tsx
- **File**: `src/views/legal/DistanceSalesAgreementPage.tsx`
- **Archetype**: `RSC_SERVER`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 35
- **Chrome Literal Estimate**: 3
- **Recommendation**: `RESTRUCTURE`
- **Suggested Namespace**: `legal.distanceSales`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *Route Wrapper Decoupling*: The corresponding route wrapper `src/app/[lang]/legal/mesafeli-satis-sozlesmesi/page.tsx` does not currently extract `params` or pass the `lang` prop to `<PageComponent />`. If `DistanceSalesAgreementPage` is modified to expect `lang`, the wrapper will break until it is updated to parse and forward locale params.
  - *Architectural Boundary Inconsistency*: Currently, some pages (like `KVKKPage.tsx`) use `'use client'` with `next/dynamic` to load split TR/EN components, while others (like `PrivacyPolicyPage.tsx`) remain RSC Server Components and receive `lang` as a prop. For static legal prose, maintaining it as an RSC (Server Component) is preferred for performance (avoiding client-side JS and dynamic import hydration lag), but it requires passing `lang` from the route wrappers.
  - *No English Content*: There is currently no English copy of the Distance Sales Agreement prose in the codebase.
- **English Idiom Risks**:
  - *Mesafeli Satış Sözleşmesi* &rarr; `Distance Sales Agreement` (or `Distance Sales Contract`)
  - *Cayma Hakkı* &rarr; `Right of Withdrawal`
  - *Ayıplı Mal ve Garanti* &rarr; `Defective Goods and Warranty`
  - *Mücbir Sebepler* &rarr; `Force Majeure`
  - *Tüketici Hakem Heyeti* &rarr; `Consumer Arbitration Committee`
  - *Tüketici Mahkemesi* &rarr; `Consumer Court`
  - *Ön Bilgilendirme Formu* &rarr; `Pre-Information Form`
- **Notes**: The document is currently 100% hardcoded Turkish text. It needs to be restructured using the `TR_EN_SPLIT_CONTENT` pattern. The 12 clauses of long-form prose should be moved into subcomponents under `src/views/legal/components/tr/DistanceSalesAgreementContent.tsx` and `src/views/legal/components/en/DistanceSalesAgreementContent.tsx`. UI Chrome should be placed in `tr.ts` / `en.ts` dictionaries under the `legal` namespace.

---

### 7. PreInformationPage.tsx
- **File**: `src/views/legal/PreInformationPage.tsx`
- **Archetype**: `NEEDS_USE_CLIENT`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 24
- **Chrome Literal Estimate**: 17
- **Recommendation**: `RESTRUCTURE`
- **Suggested Namespace**: `legal`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *RSC Boundary*: The parent route wrapper `src/app/[lang]/legal/on-bilgilendirme-formu/page.tsx` is static/server component. To use client-side translation via `useI18n()`, the view component must declare `'use client'`.
  - *Missing English Version*: There is currently no English equivalent of the prose in the codebase.
  - *Interpolation & Word Order*: The Turkish text `"Bu Ön Bilgilendirme Formu {legalConfig.lastUpdated} tarihinde Tüketiciye sunulmuştur."` requires a different word order in English: `"This Pre-Information Form was presented to the Consumer on {legalConfig.lastUpdated}."` Storing this prose as JSON dictionary keys in dictionaries (`tr.ts`/`en.ts`) is brittle; utilizing separate translation-specific JSX sub-components (as done in KVKKPage.tsx) is highly recommended.
- **English Idiom Risks**:
  - *Ön Bilgilendirme Formu* &rarr; `Pre-Information Form`
  - *Cayma Hakkı* &rarr; `Right of Withdrawal`
  - *Mesafeli Sözleşmeler Yönetmeliği* &rarr; `Regulation on Distance Contracts`
  - *Tüketici Hakem Heyetleri* &rarr; `Consumer Arbitration Committees`
  - *Tüketici Mahkemeleri* &rarr; `Consumer Courts`
  - *Vergi Dairesi/No* &rarr; `Tax Office / Tax Number`
  - *Yürürlük* &rarr; `Effective Date` or `Validity`
- **Notes**: PreInformationPage contains a mix of UI labels (chrome) and long-form legal prose. Replicating the split-component architecture used in `KVKKPage.tsx` is the cleanest approach. It will keep the core dictionary files lean while allowing safe translation of legal prose and complex word-order adjustments.

---

### 8. TermsOfUsePage.tsx
- **File**: `src/views/legal/TermsOfUsePage.tsx`
- **Archetype**: `RSC_SERVER`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 22
- **Chrome Literal Estimate**: 2
- **Recommendation**: `RESTRUCTURE`
- **Suggested Namespace**: `legal`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - *RSC Boundary Transition*: Currently a React Server Component (RSC). Restructuring it to support language detection via the client-side `useI18n()` hook requires adding `'use client'` to this container file.
  - *Complete Lack of English Prose*: The long-form legal text is hardcoded in Turkish, meaning English users on the `/en/...` route will see the Turkish version.
  - *Config Translation Risks*: The `legalConfig` contains Turkish values (e.g. `1-5 iş günü`, `Bedava`) that won't localize automatically even if the prose is split.
- **English Idiom Risks**:
  - *Kullanım Koşulları* &rarr; "Terms of Use" or "Terms and Conditions"
  - *Mesafeli Satış Sözleşmesi* &rarr; "Distance Sales Agreement"
  - *Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri* &rarr; "Consumer Arbitration Committees and Consumer Courts"
  - *Uyuşmazlık Çözümü* &rarr; "Dispute Resolution"
  - *Veri kazıma* &rarr; "Data scraping"
  - *Fikri Mülkiyet* &rarr; "Intellectual Property"
  - *Sorumluluk Reddi* &rarr; "Disclaimer" / "Limitation of Liability"
- **Notes**: The file contains a mix of UI Chrome (title, warning box) and long-form legal clauses. It should be restructured using the `TR_EN_SPLIT_CONTENT` archetype, mimicking `KVKKPage.tsx`. The Turkish prose should be extracted to a separate `TermsOfUseContentTr` component, an English translation `TermsOfUseContentEn` should be created, and both should be dynamically imported depending on the current locale.

---

### 9. Route Wrappers Group
- **Files**:
  - `src/app/[lang]/legal/cerez-politikasi/page.tsx`
  - `src/app/[lang]/legal/gizlilik-politikasi/page.tsx`
  - `src/app/[lang]/legal/kullanim-kosullari/page.tsx`
  - `src/app/[lang]/legal/kvkk/page.tsx`
  - `src/app/[lang]/legal/mesafeli-satis-sozlesmesi/page.tsx`
  - `src/app/[lang]/legal/on-bilgilendirme-formu/page.tsx`
- **Archetype**: `THIN_WRAPPER`
- **Content Type**: `MIXED`
- **User-Facing Literal Estimate**: 0
- **Chrome Literal Estimate**: 0
- **Recommendation**: `RESTRUCTURE` (except `kvkk/page.tsx` which is `ALREADY_DONE`)
- **Suggested Namespace**: `legal`
- **Has useI18n**: `false`
- **Uses 'use client' Directive**: `false`
- **Traps**:
  - Route wrappers (except `kvkk` and `gizlilik-politikasi`) do not currently parse `params` or forward the dynamic `lang` parameter down to the view components. This is a critical routing trap; English dynamically-routed legal paths render the default Turkish views due to missing locale propagation.
- **English Idiom Risks**: None (thin wrappers, layout only).
- **Notes**: Extends route parameter forwarding. Requires updating wrappers to accept `params` asynchronously and pass `lang` down as a prop.

---

## 🏛️ Synthesis & Architectural Decision

### Handling of Long-Form Legal Prose
We recommend a **Hybrid Localization Architecture** instead of moving all legal text into translation dictionaries (`tr.ts` / `en.ts`).

#### 1. Language-Split Component Pattern (for Long-Form Prose)
All long-form legal documents should be maintained as locale-specific components:
* `src/views/legal/components/tr/[DocName]Content.tsx`
* `src/views/legal/components/en/[DocName]Content.tsx`

* **Rationale**:
  * **Prevention of Dictionary Bloat**: Moving hundreds of lines of legal prose into JSON/TS dictionaries would severely balloon bundle sizes, reduce IDE performance, and mix UI string keys with massive editorial copy.
  * **Rich-Text & Structural Integrity**: Legal prose relies heavily on structural formatting (nested ordered lists, bold terms, indents, citations). Storing this in raw dictionary strings requires complex formatting logic, dynamic injection (`dangerouslySetInnerHTML`), or fragile React node injection. Doing it in JSX/TSX maintains clean, readable HTML/React markup with native TS compilation safety.
  * **Legal Citation Integrity**: Legal texts contain strict numbering systems and statutory names (e.g., GDPR, KVKK Law No. 6698). Managing Turkish and English versions as separate visual documents ensures that legal experts and translators can review and update documents as coherent units rather than disjointed keys.

#### 2. Dictionary Translation Pattern (for UI Chrome & Metadata)
Only UI-specific layout elements ("UI Chrome"), metadata, dates, and dynamic variables should be placed in `tr.ts` and `en.ts` under the namespace `legal.[document]`:
* Page Titles & Headings (e.g., `legal.kvkk.title`)
* Last Updated Dates (e.g., `legal.common.lastUpdated`)
* Interactive Controls (e.g., print buttons, checkboxes, action buttons)

---

## 🌊 Migration Waves

### Wave 1: Route Wrapper & Core Layout Architecture Fixes
* **Files**:
  - `src/app/[lang]/legal/kvkk/page.tsx`
  - `src/app/[lang]/legal/privacy-policy/page.tsx`
  - `src/app/[lang]/legal/cookie-policy/page.tsx`
  - `src/app/[lang]/legal/distance-sales-agreement/page.tsx`
  - `src/app/[lang]/legal/pre-information/page.tsx`
  - `src/app/[lang]/legal/terms-of-use/page.tsx`
* **Rationale**: The route wrappers act as the entry points but currently do not correctly pass the `lang` parameter down to the view components. Fixing this is a critical prerequisite, as English URLs currently render Turkish views due to missing locale propagation.

### Wave 2: KVKK View & Split-Component Refactor
* **Files**:
  - `src/views/legal/KVKKPage.tsx`
  - `src/views/legal/components/tr/KvkkContent.tsx`
  - `src/views/legal/components/en/KvkkContent.tsx`
* **Rationale**: KVKK already has the language-split structure but is locked inside a `'use client'` parent component with hydration skeletons. This wave refactors it into a clean Server Component (RSC) rendering scheme, removes unnecessary skeleton layouts, and fixes existing typos/terminology errors in the Turkish and English content.

### Wave 3: Short-to-Medium Prose Restructuring (Cookie Policy & Terms of Use)
* **Files**:
  - `src/views/legal/CookiePolicyPage.tsx`
  - `src/views/legal/TermsOfUsePage.tsx`
* **Rationale**: Restructure these medium-complexity pages into the language-split pattern (`CookiePolicyContent.tsx` and `TermsOfUseContent.tsx`). Currently, they only contain Turkish content; we will create their corresponding English components and pull the shared UI chrome (headings, update dates) into `tr.ts`/`en.ts`.

### Wave 4: High-Complexity Transactional Prose Restructuring (Privacy Policy, Distance Sales, Pre-Information)
* **Files**:
  - `src/views/legal/PrivacyPolicyPage.tsx`
  - `src/views/legal/DistanceSalesAgreementPage.tsx`
  - `src/views/legal/PreInformationPage.tsx`
* **Rationale**: These documents are long and complex, containing dynamic variables (user info, dates, order details) and table structures. We will migrate them to the language-split pattern. We will implement structural translations for the missing English versions, ensuring that complex tables and form layouts remain statically typed in React while parameters are passed dynamically.

---

## ⚠️ Key Risks

1. **RSC & useI18n Boundaries**: If a parent wrapper demands client-side state, it forces the entire legal content block to be hydrated on the client. Keeping view files as pure server components and resolving content conditionally via the `lang` parameter ensures zero-bundle-size impact on page loads and optimizes SEO readability.
2. **English Legal Terminology Quality**: Terminology must align with standard global compliance practices. E.g., "Veri Sorumlusu" must map to "Data Controller" rather than "Data Responsible", and "Açık Rıza" must map to "Explicit Consent" or "Specific Consent" rather than "Open Consent".
3. **Silent Turkish-Leftover Risks**: When splitting components or migrating paragraphs, dynamic parameters or fallback labels might accidentally display Turkish text to English users. Strict validation of fallback properties is required.
4. **Date and Grammatical Interpolation**: Turkish verb-final word order makes direct inline string concatenation buggy (e.g., `bu sözleşme [Tarih] tarihinde güncellendi` vs `this agreement was updated on [Date]`). Phrases must be structured as complete templates with nested formatting or handled entirely inside the locale-split components.

---

## 🔄 Sequencing & Parallelism Note

* **Execution Order**: Wave 1 must be completed first to establish route parameter passing. Wave 2 should immediately follow to validate the server-component rendering flow. Waves 3 and 4 can then proceed.
* **Parallelism Safety**: Waves 3 and 4 are highly isolated and can be worked on concurrently by different developers since they touch distinct page directories and component files.
* **Avoiding Merge Conflicts**: To prevent merge conflicts on the shared translation files (`tr.ts` / `en.ts`), developers must strictly scope UI keys under distinct namespaces (e.g. `legal.cookie`, `legal.privacy`). Because we are keeping the bulk of the text in split TSX components rather than dictionaries, dictionary changes are small and self-contained, reducing conflict risks to a minimum.

---

## 📝 Executive Summary
The synthesis of the i18n audit reviews outlines a robust strategy to resolve rendering bugs and language mismatches across VentHub’s legal pages by implementing a hybrid localization architecture. By isolating long-form legal prose into language-split React components and delegating only UI chrome and metadata to the main dictionaries, we prevent bundle bloat and ensure legal document styling remains structurally intact. Correcting the route wrappers to pass the dynamic locale parameter will immediately solve the current bug where English routes render Turkish contents. The planned waves organize development systematically, from foundational routing fixes to complex transactional prose migrations, minimizing regression risk and facilitating parallel developer execution.
