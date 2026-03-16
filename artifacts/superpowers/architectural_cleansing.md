## Goal
Vite kal?nt?lar?n? temizlemek ve window.location ba??ml?l?klar?n? Next.js standartlar?na ?ekmek.

## Constraints
- Hydration Integrity (Kritik).
- URL Consistency (SEO).

## Risks
1. Hydration Mismatch.
2. Auth/Redirect bozulmalar?.

## Options
- Se?enek A: H?zl? Refactor.
- Se?enek B: Modern Abstraction (Next.js Hooks).

## Recommendation
Se?enek B. window.location yerine usePathname, useSearchParams ve useRouter kullan?m?.

## Acceptance criteria
1. window.location sarmalanm?? olmal?.
2. Vite referanslar? kald?r?lm?? olmal?.
3. Build hatas?z tamamlanmal?.
