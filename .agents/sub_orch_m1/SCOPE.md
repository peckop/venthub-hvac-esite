# Scope: Database & Schema Setup (Milestone 1)

## Architecture
- **Supabase CLI Migrations**: Version-controlled, idempotent migration script `supabase/migrations/YYYYMMDD_tenant_schema_setup.sql`.
- **Golden Triad Rule**: Every new table (including `tenants`) must follow: `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY` in that exact order.
- **Tenant Isolation**: Add indexed `tenant_id UUID REFERENCES tenants(id)` column to all tenant-aware tables.
- **RPC Claims Helper**: `jwt_tenant_id()` to extract tenant UUID from JWT's `app_metadata.tenant_id`.
- **RLS Update**: Update all existing RLS policies to check `tenant_id = jwt_tenant_id()`.
- **Default Tenant**: Populate a default tenant row and assign its ID to all existing data.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database Schema Analysis | Map out all 26 tables, identify tenant-aware vs tenant-agnostic tables | None | DONE |
| 2 | Migration Script Design | Write the atomic and idempotent migration SQL containing tenants table, tenant_id columns, indexes, RPC helper, and RLS policies | M1 | DONE |
| 3 | Execution & Verification | Run migrations, verify database integrity, ensure default tenant matches existing data | M2 | DONE |
| 4 | Audit & Handoff | Forensic auditor checks, type checks, and handover reports | M3 | DONE |

## Interface Contracts
- Migration file path: `supabase/migrations/`
- Helper RPC signature: `jwt_tenant_id() returns uuid`
- Constraint: `hvacCalculations.ts` is strictly tenant-agnostic (Do NOT modify!).
