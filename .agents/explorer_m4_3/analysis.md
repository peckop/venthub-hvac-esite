# ANALYSIS — EMAIL BRANDING ISOLATION AND TENANT CONFIGURATION

## Executive Summary
This analysis investigates how email-sending Deno Edge Functions under `supabase/functions/` utilize Resend for email delivery, how they construct HTML templates, and how they handle branding configurations. We identify that these functions currently fetch branding parameters (`brandName`, `brandLogoUrl`, `EMAIL_FROM`) either via hardcoded defaults or directly from global system environment variables (`Deno.env`). Under the multi-tenant SaaS architecture, we require complete isolation so that each tenant can define their own branding values dynamically.

Currently, the `public.tenants` database table lacks a `config` (or settings) column. We propose a database migration to add a JSONB `config` column to `public.tenants`, and introduce a unified, robust helper function inside the `_shared/` directory to resolve the `tenant_id` context, query the database, and fall back gracefully to environment variables or hardcoded values when needed.

---

## 1. Analysis of Email-Sending Edge Functions

There are five primary edge functions involved in notification/email dispatch in the project:
1. `order-confirmation`
2. `delivery-notification`
3. `shipping-notification`
4. `return-status-notification`
5. `notification-service` (Central Dispatcher)

Additionally, the `stock-alert` edge function is part of this ecosystem but does not send emails directly; instead, it delegates to `notification-service` using an HTTP POST call.

### Detailed Function-by-Function Mapping

| Function Name | Template Strategy | Branding Fetching & Parameters | How it Sends Emails | Current `EMAIL_FROM` Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **`order-confirmation`** | Reads file `./templates/email/order_confirmation.html` at request-time. Renders using a custom regex-based `renderTemplate` utility. Contains inline HTML fallback if file read fails. | Fetches from environment variables:<br>• `BRAND_NAME` (Default: `'VentHub'`)<br>• `BRAND_PRIMARY_COLOR` (Default: `'#2563eb'`)<br>• `BRAND_LOGO_URL` (Default: `''`) | `fetch('https://api.resend.com/emails')` with Bearer auth and JSON body. | `Deno.env.get('EMAIL_FROM')` (Default: `'VentHub Test <onboarding@resend.dev>'`). |
| **`delivery-notification`** | Reads file `./templates/email/delivered.html` at request-time. Renders using a simple `render` utility. Contains inline HTML fallback if file read fails. | No dynamic branding variables used in the code. Falls back to hardcoded text: `'Teslimat Tamamlandı'`, `'VentHub Ekibi'`, and `'#2563eb'`. | `fetch('https://api.resend.com/emails')` with Bearer auth and JSON body. | `Deno.env.get('EMAIL_FROM')` (Default: `'VentHub <onboarding@resend.dev>'`). |
| **`shipping-notification`** | Reads file `./templates/email/shipping.html` at request-time. Renders using regex-based `renderTemplate` utility. Contains inline HTML fallback if file read fails. | No dynamic branding variables used in the code. Falls back to hardcoded text: `'Siparişiniz Kargoya Verildi'`, `'VentHub Ekibi'`, and `'#2563eb'`. | `fetch('https://api.resend.com/emails')` with Bearer auth and JSON body. | `Deno.env.get('EMAIL_FROM')` (Default: `'VentHub <onboarding@resend.dev>'`). |
| **`return-status-notification`** | No external template file. Constructs the HTML template string dynamically in Deno code. | No dynamic branding variables used in the code. Falls back to hardcoded text: `'İade Durumu Güncellendi'`, `'VentHub Ekibi'`. | `fetch('https://api.resend.com/emails')` with Bearer auth and JSON body. | `Deno.env.get('EMAIL_FROM')` (Default: `'VentHub <info@venthub.com>'`). |
| **`notification-service`** | Formats templates passed via the request payload body using `formatTemplate`. | No dynamic branding variables used in the code. | Centralized HTTP POST fetch to `https://api.resend.com/emails`. | `Deno.env.get('EMAIL_FROM')` (Default: `'VentHub <noreply@venthub.com>'`). |

---

## 2. Database Storage of `tenants.config`

### Finding & Direct Observation
We inspected active migration files under `supabase/migrations/`, specifically:
- `20260530220000_tenant_schema_setup.sql` (Creates `public.tenants` table)
- `20260530221000_tenant_auth_integration.sql` (Triggers on `auth.users` for `tenant_id` synchronization)

The original migration `20260530220000_tenant_schema_setup.sql` creates the table as follows:
```sql
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subdomain text UNIQUE,
  custom_domain text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Crucial Finding**: 
Currently, **there are no columns in the `public.tenants` table to hold JSONB configurations** (such as `config`, `theme_config`, or `features`). 
However, according to the multi-tenant SaaS specifications in `docs/venthub_saas_faz1_prompt.md`, the database schema was planned to include JSONB fields on the `public.tenants` table:
1. `config` JSONB: Stores general configs including `brand_name`, `brand_logo_url`, `brand_primary_color`, `email_from`, etc.
2. `theme_config` JSONB: Stores CSS styling token overrides.
3. `features` JSONB (or `feature_flags`): Stores toggleable client-side and server-side feature flags.

To implement the requirements, a database migration is necessary to add these JSONB columns and provide a solid structure for storing tenant-specific properties.

---

## 3. Dynamic Fetching and Recommendation Strategy

### 3.1. Proposed Database Schema Update
We recommend adding the missing JSONB columns to the `public.tenants` table using a new migration file. The `config` column will act as the storage engine for branding variables.

```sql
-- Target: public.tenants table update
-- Add configuration, theme configuration, and feature flag JSONB columns.

BEGIN;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Populate default tenant branding settings
UPDATE public.tenants
SET config = jsonb_build_object(
  'brand_name', 'VentHub',
  'brand_logo_url', 'https://venthub-hvac-esite.vercel.app/images/logo.png',
  'brand_primary_color', '#2563eb',
  'email_from', 'VentHub <onboarding@resend.dev>'
)
WHERE id = 'd3b07384-d113-495f-a558-8c38634e0000';

COMMIT;
```

---

### 3.2. Dynamic Tenant Branding Resolution Utility
We propose creating a unified utility file `supabase/functions/_shared/tenant_config.ts` that will be imported across all email-sending edge functions. 
This utility handles:
1. **Context Resolution**: Resolves `tenant_id` from the authorization header claims (JWT) or URL query strings/payloads.
2. **Database Query**: Queries the `config` column from the `public.tenants` table using a service-role client.
3. **Graceful Fallbacks**: Cascades back to Environment variables first, and then to system hardcoded defaults if a value is missing.

#### Proposed Code: `supabase/functions/_shared/tenant_config.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

export interface TenantBranding {
  brandName: string
  brandLogoUrl: string
  brandPrimaryColor: string
  emailFrom: string
}

const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000'

/**
 * Extracts the tenant_id from either the Authorization Header JWT claims,
 * a query parameter (e.g. ?tenant_id=xxx), or a custom header.
 */
export function resolveTenantId(req: Request): string {
  try {
    const url = new URL(req.url)
    const queryTenantId = url.searchParams.get('tenant_id')
    if (queryTenantId) return queryTenantId

    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const jwtParts = token.split('.')
      if (jwtParts.length === 3) {
        const payload = JSON.parse(atob(jwtParts[1]))
        const tenantId = payload?.app_metadata?.tenant_id
        if (tenantId) return tenantId
      }
    }
  } catch (err) {
    console.error('[tenant-config] Error parsing tenant_id context:', err)
  }

  return DEFAULT_TENANT_ID
}

/**
 * Dynamically fetches branding configurations for a given tenant_id.
 * Falls back sequentially: Tenant DB Config -> Deno Environment Variables -> Hardcoded System Defaults.
 */
export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  let dbConfig: Record<string, string> = {}

  if (supabaseUrl && serviceKey && tenantId) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      })
      const { data, error } = await supabase
        .from('tenants')
        .select('config')
        .eq('id', tenantId)
        .single()

      if (!error && data?.config) {
        dbConfig = data.config as Record<string, string>
      } else if (error) {
        console.warn(`[tenant-config] Failed to fetch tenant ${tenantId} config:`, error.message)
      }
    } catch (err) {
      console.error('[tenant-config] Database fetch error:', err)
    }
  }

  // Hierarchical Resolving & Fallbacks
  const brandName = 
    dbConfig.brand_name || 
    dbConfig.brandName || 
    Deno.env.get('BRAND_NAME') || 
    'VentHub'

  const brandLogoUrl = 
    dbConfig.brand_logo_url || 
    dbConfig.brandLogoUrl || 
    Deno.env.get('BRAND_LOGO_URL') || 
    ''

  const brandPrimaryColor = 
    dbConfig.brand_primary_color || 
    dbConfig.brandPrimaryColor || 
    Deno.env.get('BRAND_PRIMARY_COLOR') || 
    '#2563eb'

  const emailFrom = 
    dbConfig.email_from || 
    dbConfig.EMAIL_FROM || 
    Deno.env.get('EMAIL_FROM') || 
    'VentHub <onboarding@resend.dev>'

  return {
    brandName,
    brandLogoUrl,
    brandPrimaryColor,
    emailFrom
  }
}
```

---

### 3.3. Integration Example
To show how clean this approach is, let's look at a snippet showing the proposed rewrite for the `order-confirmation` function.

#### Proposed rewrite inside `supabase/functions/order-confirmation/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { resolveTenantId, getTenantBranding } from "../_shared/tenant_config.ts"

// ... existing helper imports and renderTemplate utilities ...

serve(async (req) => {
  // CORS validations...
  
  try {
    const text = await req.text()
    let parsed: Record<string, unknown> = {}
    try { parsed = text ? JSON.parse(text) : {} } catch {}

    const order_id = parsed['order_id'] as string
    
    // Resolve Tenant ID and get Branding details dynamically
    const tenantId = resolveTenantId(req) || (parsed['tenant_id'] as string)
    const branding = await getTenantBranding(tenantId)

    // Using the dynamic branding variables
    const brandName = branding.brandName
    const brandPrimary = branding.brandPrimaryColor
    const brandLogoUrl = branding.brandLogoUrl
    const emailFrom = branding.emailFrom

    // The subject line and HTML template are constructed dynamically using variables:
    const subject = `${brandName} | Siparişiniz alındı - ${prettyOrderNo}`
    
    let html = ''
    try {
      const tpl = await loadTemplate()
      if (tpl) {
        html = renderTemplate(tpl, { 
          brand_name: brandName, 
          brand_primary_color: brandPrimary, 
          brand_logo_url: brandLogoUrl, 
          customer_name, 
          order_number: prettyOrderNo 
        })
      }
    } catch {}
    
    // send call...
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: emailFrom, to: toList, subject, html })
    })

    // ... handle audit and return success ...
  } catch (err) {
    // ... exception handling ...
  }
})
```

---

## 4. Evidence Chain

1. **Email sending method**: Verified by `grep_search` and `view_file` on `order-confirmation/index.ts`, `delivery-notification/index.ts`, `shipping-notification/index.ts`, `return-status-notification/index.ts`, and `notification-service/index.ts` that Deno calls `https://api.resend.com/emails` via POST utilizing standard HTTP `fetch`.
2. **Current environment variables**: Identified variables: `BRAND_NAME`, `BRAND_PRIMARY_COLOR`, `BRAND_LOGO_URL`, `EMAIL_FROM`, `EMAIL_TEST_MODE`, `EMAIL_TEST_TO`, `SHIP_EMAIL_BCC`.
3. **Database schemas**: Confirmed by inspecting migration files `supabase/migrations/20260530220000_tenant_schema_setup.sql` that `public.tenants` lacks `config` or other JSONB columns. 
4. **Planned JSONB fields**: Cited specifications from `docs/venthub_saas_faz1_prompt.md` line 29 detailing the need for `config` JSONB column holding branding, locale, and payment settings.
