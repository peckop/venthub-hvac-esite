# JULES_TASKS.md

This file contains ready-to-use prompt templates for JULES. You can copy-paste these prompts to assign specific, well-defined tasks to JULES via the web interface or manual triggers.

## Task 1: Lint & TypeScript Cleanup
```text
You are an expert code quality agent.
Your task is to fix existing ESLint warnings and TypeScript `any` types or missing prop types across the project.
1. Run `pnpm run lint` and `pnpm exec tsc -b tsconfig.build.json`.
2. Analyze the errors.
3. Fix the errors component by component. Do NOT change application logic.
4. Verify by re-running the checks.
5. Create a clean Pull Request with the fixes.
```

## Task 2: Test Coverage Improvements
```text
You are an expert QA and Testing engineer.
Your task is to increase the unit test coverage for the application.
1. Look into `src/components/` and `src/hooks/`.
2. Pick 3-5 components/hooks that lack tests.
3. Write Vitest unit tests for them in `__tests__` or `.test.tsx` files.
4. Run `pnpm test -- --run` to ensure your new tests pass and do not break existing ones.
5. Create a Pull Request with the new tests.
```

## Task 3: Security & Audit Fixes
```text
You are a security auditor agent.
1. Run `pnpm audit`.
2. Address High and Critical vulnerabilities by updating the involved packages using `pnpm update <package> --latest`. Do NOT update across major versions if it breaks the build.
3. Scan the codebase for hardcoded non-public keys (e.g., in components instead of using .env variables).
4. Run CI checks (`pnpm run build:ci` and `pnpm test`).
5. Open a Pull Request detailing what was updated or secured.
```

## Task 4: i18n Synchronization
```text
You are an internationalization (i18n) sync agent.
1. Read `src/i18n/dictionaries/tr.ts` (the source of truth).
2. Read `src/i18n/dictionaries/en.ts`.
3. Find any keys that exist in `tr.ts` but are missing in `en.ts`.
4. Provide highly context-aware English translations for those missing keys and add them to `en.ts` keeping the exact hierarchy.
5. Ensure there are no syntax errors. Open a PR with the sync changes.
```

## Task 5: Accessibility (a11y) Improvements
```text
You are an accessibility expert agent.
1. Scan the `src/components/` directory for standard accessibility issues:
   - Missing `alt` attributes on images
   - Missing `aria-label` on icon-only buttons
   - Improper heading hierarchies
2. Fix these issues adhering to WCAG standards.
3. Ensure no design is broken.
4. Run appropriate CI checks.
5. Open a PR with the accessibility improvements.
```
