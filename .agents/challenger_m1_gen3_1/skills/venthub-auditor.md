# VentHub Auditor Skill Copy
(Copied from c:\Users\alize\venthub-hvac\.agent\skills\venthub-auditor\SKILL.md)

## Integrity Guard
- Protected Objects:
  - src/components/products/visual-models/
  - src/components/navigation/
  - src/types/database.types.ts
  - .agent/, registry/, .gemini/hooks/
- Protocols:
  - Backup First: snapshot protected assets before change.
  - Time-stamp check: verify commits via hash and timestamp.
  - No-overwrite without override.

## Architectural Guardrails & Tech Review
- Next.js 15 & React 19: params/searchParams must be awaited, window checks in useEffect.
- Type safety: no "as any", `@ts-ignore`.
- i18n & Performance: translate raw strings, no console.log, dispose Three.js objects.
- Run integrity script: `python .agent/scripts/check_integrity.py`.
