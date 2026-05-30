# Scope: E2E Testing Track

## Architecture
- Opaque-box, requirement-driven testing.
- Uses Vitest testing framework for route and API simulations.
- Ensures absolute isolation between default tenant ('default') and a test tenant ('test').

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Infrastructure Design | Setup Vitest config, shared utilities, mocks, and test runner | None | DONE |
| 2 | Tier 1 & 2 Test Suite | Create Feature Coverage (Tier 1) and Boundary (Tier 2) tests for all 6 features | M1 | DONE |
| 3 | Tier 3 & 4 Test Suite | Create Pairwise Combinations (Tier 3) and Workload Scenarios (Tier 4) tests | M2 | DONE |
| 4 | Finalize & Attest | Run the test suite on default/test tenant mock data, and publish `TEST_READY.md` | M3 | DONE |

## Interface Contracts
- Path: `tests/e2e/`
- Test Runner script: `pnpm run test:e2e`
- Output: `TEST_READY.md` generated at project root once all Tiers 1-4 tests are ready and passing.
