# JULES_TASKS.md

This file contains ready-to-use, premium quality prompt templates for JULES AI. These templates are strictly scoped and fortified with security rules to prevent architecture breakage.

You can copy-paste these prompts to assign specific, well-defined tasks to JULES.

---

## 🔒 COMMON SECURITY LAYER (Must be in all prompts)
All tasks below include the following strict boundaries section. Do NOT remove it when sending the prompt to JULES.

```text
⚠️ STRICT BOUNDARIES (Sınır Kuralları):
1. DOKUNULACAK ALANLAR (Scope): Sadece sana belirtilen hedefler.
2. DOKUNULMASI KESİNLİKLE YASAK OLANLAR (No-go zones):
   - src/types/database.types.ts
   - src/lib/supabase.ts
   - supabase/ klasörü (migrations, functions)
   - tsconfig*.json
   - package.json (Dependency güncelleme taskı hariç!)
3. UYGULAMA MANTIĞI: İş mantığını (business logic) ASLA değiştirme. Sadece kodu iyileştir/temizle.
4. CI/CD ONAYLARI: PR açmadan önce yerelde şu 4 komutu sırayla çalıştır ve HEPSİNİN HATASIZ GEÇTİĞİNDEN emin ol:
   - pnpm run lint
   - pnpm exec tsc -b tsconfig.build.json
   - pnpm test -- --run
   - pnpm run build:ci
5. ANAYASA: Kök dizindeki `AGENTS.md` dosyasını oku ve oradaki tüm kurallara uy.
```

---

## Task 1: Lint & TypeScript Cleanup
```text
You are an expert code quality agent.
Your task is to fix existing ESLint warnings and TypeScript `any` types or missing prop types across the project UI components.

1. Run `pnpm run lint` and `pnpm exec tsc -b tsconfig.build.json`.
2. Analyze the errors.
3. Fix the errors component by component (e.g., inside src/components/ or src/views/).
4. Create a clean Pull Request with the fixes.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json, next.config.mjs, vite.config.ts.
- DO NOT CHANGE business logic.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 2: Unit Test Coverage Improvements
```text
You are an expert QA and Testing engineer.
Your task is to increase unit test coverage without breaking existing tests.

1. Review `src/components/` and `src/hooks/`.
2. Pick 3 critical components or hooks that lack unit tests.
3. Write Vitest + React Testing Library unit tests for them in `__tests__` or `.test.tsx` files.
4. Ensure your tests focus on rendering, accessibility, and simple user interactions.
5. Create a Pull Request with the new tests.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json.
- DO NOT CHANGE existing component code unless absolutely necessary to expose a test ID.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 3: Security & Dependency Audit
```text
You are a security auditor agent.
Your task is to patch security vulnerabilities in dependencies.

1. Run `pnpm audit`.
2. Address High and Critical vulnerabilities by updating the involved packages using `pnpm update <package>@latest`. 
   *IMPORTANT: Do NOT update across major versions (e.g., v4 to v5) if it causes breaking changes.*
3. Ensure lock file (`pnpm-lock.yaml`) is properly updated.
4. Create a Pull Request detailing the patched packages.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, supabase/ migrations.
- DO NOT perform major version upgrades without explicit approval.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 4: i18n Synchronization
```text
You are an internationalization (i18n) sync agent.
Your task is to sync missing translations between language files.

1. Read `src/i18n/dictionaries/tr.ts` (the Source of Truth).
2. Read `src/i18n/dictionaries/en.ts`.
3. Find any keys that exist in `tr.ts` but are missing in `en.ts`.
4. Provide highly context-aware English translations for those missing keys and add them to `en.ts` keeping the EXACT hierarchy. Do not alter existing English keys.
5. Create a PR with the sync changes.

⚠️ STRICT BOUNDARIES:
- ONLY TOUCH: src/i18n/dictionaries/en.ts. (Do not touch ANY other file).
- MUST PASS BEFORE PR: pnpm exec tsc -b tsconfig.build.json.
- READ: AGENTS.md.
```

## Task 5: Accessibility (a11y) Improvements
```text
You are an accessibility UI/UX expert agent.
Your task is to improve WCAG 2.1 AA compliance in UI components.

1. Scan `src/components/` for common a11y issues: Missing `alt` attributes on `<img>`, missing `aria-label` on icon-only buttons (`<button><Icon/></button>`), and bad heading hierarchy.
2. Fix these issues by providing context-aware screen reader tags. Use `useI18n` if string literals are added.
3. Open a PR with the accessibility improvements.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json.
- DO NOT break standard UI visual designs (no color changes without user consent).
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 6: Dead Code & Unused Import Cleanup
```text
You are a project optimization agent.
Your task is to safely remove dead code and unused variables without changing logic.

1. Run ESLint and TypeScript checks to identify `unused-imports`, `unused-vars`, and unreferenced interfaces.
2. Scan through `src/components/` and `src/views/`.
3. Carefully remove unused imports, unused state defaults, and dead utility functions.
4. Do absolutely NO structural refactoring.
5. Open a PR grouping all cleanups.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json.
- DO NOT remove code that is conditionally or dynamically imported, be careful.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 7: Performance Optimization
```text
You are a React Performance optimization agent.
Your task is to resolve unnecessary re-renders in the application.

1. Scan `src/components/` for expensive pure functional UI components that lack `React.memo()`.
2. Inspect complex calculation hooks or event handlers without `useMemo` or `useCallback`.
3. Apply performance primitives cautiously.
4. Open a PR specifying which components were optimized.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json.
- DO NOT OVER-MEMOIZE. Only apply memoization to heavy components or items rendered inside large lists.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```

## Task 8: SEO Meta Tag & Structured Data
```text
You are an advanced SEO Technical Auditor.
Your task is to establish robust meta tagging architecture for Next.js app pages.

1. Inspect pages inside `src/app/` or standard React routing files depending on architecture.
2. Ensure top-level pages have comprehensive `<title>`, `<meta name="description">`, and proper Open Graph tags.
3. Ensure structured data (Schema.org JSON-LD scripts) exists correctly on individual product views (`src/views/ProductDetail.tsx`).
4. Generate a PR with the SEO scaffolding.

⚠️ STRICT BOUNDARIES:
- DO NOT TOUCH: src/types/database.types.ts, src/lib/supabase.ts, supabase/, package.json.
- DO NOT change the visible content of the application. Add invisible metadata only.
- MUST PASS BEFORE PR: pnpm run lint, pnpm exec tsc -b tsconfig.build.json, pnpm test -- --run, pnpm run build:ci.
- READ: AGENTS.md.
```
