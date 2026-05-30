# E2E Test Infra: VentHub SaaS Foundation (Phase 1)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Tenant Resolution | ORIGINAL_REQUEST §R3 | 5      | 5      | ✓      |
| 2 | Database Tenant Isolation | ORIGINAL_REQUEST §R1, §R6, §R10 | 5      | 5      | ✓      |
| 3 | Auth JWT & Profiles | ORIGINAL_REQUEST §R2 | 5      | 5      | ✓      |
| 4 | Cache Key Isolation | ORIGINAL_REQUEST §R4 | 5      | 5      | ✓      |
| 5 | Feature Flags System | ORIGINAL_REQUEST §R5 | 5      | 5      | ✓      |
| 6 | Webhooks, Realtime & Storage | ORIGINAL_REQUEST §R7-R9, R11 | 5      | 5      | ✓      |

## Test Architecture
- **Test Runner**: Vitest test suites executing API and route simulation tests.
- **Location**: `tests/e2e/`
- **Invocation**: `pnpm run test:e2e`
- **Directory Layout**:
  - `tests/e2e/resolution.test.ts`
  - `tests/e2e/isolation.test.ts`
  - `tests/e2e/auth.test.ts`
  - `tests/e2e/cache.test.ts`
  - `tests/e2e/features.test.ts`
  - `tests/e2e/webhooks.test.ts`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Multi-Tenant Onboarding & Interaction | F1, F2, F3, F5 | High |
| 2 | Double-Tenant Checkout & Stok Check | F2, F6 | High |
| 3 | Cross-Tenant Leakage Attack Simulation | F1, F2, F4, F6 | Critical |
| 4 | Webhook Concurrency Collision | F6 | High |
| 5 | Custom Domain Resolution Edge Case | F1, F2 | Medium |

## Coverage Thresholds
- Tier 1: ≥30 test cases
- Tier 2: ≥30 test cases
- Tier 3: ≥6 pairwise feature interaction cases
- Tier 4: ≥5 realistic workload scenario cases
