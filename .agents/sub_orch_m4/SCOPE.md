# Scope: Webhooks, Edge Functions & Storage (Milestone 4)

## Architecture
- **Edge Functions Tenant Context**: Update DB INSERT/UPDATE Edge Functions (26 in total, including `iyzico-callback`, `returns-webhook`, `shipping-webhook`, `order-confirmation`, `delivery-notification`, etc.) to parse `tenant_id` context from URL query string (`?tenant_id=xxx`) or dynamic authentication headers.
- **Webhook Collision Guard**: Update `shipping-webhook` and `iyzico-callback` query filters to ensure order lookups use `eq('tenant_id', tenantId)` in addition to `order_number`, completely eliminating cross-tenant order update collisions.
- **Storage Isolation**: Update Supabase Storage RLS policies for the `product_images` and related buckets to verify `tenant_id` checks, preventing tenants from reading or deleting files of other tenants.
- **Email Branding Isolation**: Update email-sending Edge Functions to retrieve branding variables (`brandName`, `brandLogoUrl`, `EMAIL_FROM`) dynamically from `tenants.config` JSONB based on the resolved `tenant_id`, falling back to default VentHub configuration only if missing.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Webhook Collision Audit | Modify `shipping-webhook` and `iyzico-callback` query lookups to filter by `tenant_id` | None | DONE |
| 2 | Edge Functions Propagation | Inject `tenant_id` context into Deno DB insert/update processes and query parameters | M1 | DONE |
| 3 | Storage Bucket Isolation | Update storage policies to check matching tenant permissions | M2 | DONE |
| 4 | Email Branding Setup | Fetch dynamic branding fields from `tenants.config` within email functions | M3 | DONE |
| 5 | Verification & Forensic Audit | Type-check Deno files, verify build, and run Forensic Auditor for a CLEAN verdict | M4 | DONE |

## Interface Contracts
- Webhook URL format: `/api/webhook/shipping?tenant_id=xxx` or callback endpoints.
- Storage RLS Policy checks: verify `tenant_id` matches client claims.
- Email configuration schema: read from `tenants.config` JSONB object.
