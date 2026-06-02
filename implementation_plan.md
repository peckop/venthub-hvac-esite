# Implementation Plan - Resolve RLS Performance Warnings & Clean Up Duplicate Policies

This plan addresses the 42 Row Level Security (RLS) performance warnings reported by the database linter. These warnings consist of:
1. **31 Multiple Permissive Policies warnings** (caused by duplicate legacy `merged_` policies and overlapping policies).
2. **11 Auth RLS Initialization Plan warnings** (caused by calling `auth.uid()`, `public.jwt_tenant_id()`, or role-check functions directly instead of wrapping them in a caching subquery `(SELECT ...)`).

---

## User Review Required

> [!IMPORTANT]
> - **Duplicate Policy Drop:** Dropping the legacy `merged_` policies on the 13 affected tables is safe since they are duplicate policies, and the standard, tenant-aware policies (e.g. `coupons_admin_all`, `coupons_public_select`, etc.) are fully configured and in place.
> - **Query Optimizer Caching:** Wrapping all function calls in RLS expressions with `(SELECT ...)` triggers PostgreSQL's `initPlan` caching. This prevents PostgreSQL from re-evaluating session/JWT functions for every row in a table scan, providing significant database performance improvements.

---

## Open Questions

None. The issues have been trace-verified directly using the database catalogs via the `supabase` MCP server.

---

## Proposed Changes

### Database Migrations

#### [NEW] [20260602120000_resolve_performance_and_duplicate_rls.sql](file:///c:/Users/alize/venthub-hvac/supabase/migrations/20260602120000_resolve_performance_and_duplicate_rls.sql)
A new migration file will be created to perform the following:

1. **Cleanup of duplicate RLS policies** (`multiple_permissive_policies` warning):
   - Drop the `admin_view_messages` policy on `public.contact_messages` (keeping the correct `Admins can view messages`).
   - Drop all legacy `merged_` policies on the 13 tables: `coupons`, `inventory_movements`, `inventory_settings`, `order_attachments`, `order_notes`, `order_refund_events`, `price_lists`, `product_prices`, `tenants`, `user_addresses`, `user_profiles`, `venthub_orders`, `venthub_returns`.

2. **Wrap functions in caching subqueries** (`auth_rls_initplan` warning):
   Redefine the 11 original policies by wrapping `auth.uid()`, `public.jwt_tenant_id()`, and `public.is_user_admin()` in `(SELECT ...)` subqueries:
   - `inventory_settings` -> `inventory_settings_update_admin`
   - `coupons` -> `coupons_admin_all`
   - `order_notes` -> `order_notes_admin_all` and `order_notes_view_policy`
   - `user_profiles` -> `user_profiles_select_policy`
   - `inventory_movements` -> `inventory_movements_select_admin`
   - `order_attachments` -> `order_attachments_admin_all` and `order_attachments_view_policy`
   - `product_prices` -> `product_prices_admin_all`
   - `price_lists` -> `price_lists_admin_all` and `price_lists_select`

---

## Verification Plan

### Automated Tests
- Run `get_advisors` with `type = 'performance'` and verify that the 42 warnings (`auth_rls_initplan` and `multiple_permissive_policies`) are resolved.
- Run local lint, type check, and build checks to ensure no regressions:
  ```powershell
  pnpm run lint
  pnpm run type-check
  pnpm run build
  ```

### Manual Verification
- Verify that admin panel features (inventory list, coupons, and orders) function correctly without any database permission issues.
