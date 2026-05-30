# HANDOFF REPORT — explorer_m4_3

## 1. Observation
We examined all email-sending Deno Edge Functions and database migrations in the codebase. Below are our exact findings and direct source code quotes.

### A. Email-Sending Edge Functions

1. **`supabase/functions/order-confirmation/index.ts`**:
   - Env-based branding and default values (Lines 90–98):
     ```typescript
     const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
     const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub Test <onboarding@resend.dev>'
     ...
     const brandName = Deno.env.get('BRAND_NAME') || 'VentHub'
     const brandPrimary = Deno.env.get('BRAND_PRIMARY_COLOR') || '#2563eb'
     const brandLogoUrl = Deno.env.get('BRAND_LOGO_URL') || ''
     ```
   - Sends email via HTTP fetch using Resend API (Lines 169–173):
     ```typescript
     return await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({ from: emailFrom, to: toList, bcc: bcc.length > 0 ? bcc : undefined, subject, html, _text: `${subject}` })
     })
     ```
   - Renders template (Lines 150–155):
     ```typescript
     // Load template
     let html = ''
     try {
       const tpl = await loadTemplate()
       if (tpl) html = renderTemplate(tpl, { brand_name: brandName, brand_primary_color: brandPrimary, brand_logo_url: brandLogoUrl, customer_name, order_number: prettyOrderNo })
     } catch {}
     ```

2. **`supabase/functions/delivery-notification/index.ts`**:
   - Env variables and defaults (Lines 72–73):
     ```typescript
     const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
     const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <onboarding@resend.dev>'
     ```
   - Sends email using Resend (Lines 125–129):
     ```typescript
     const resp = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({ from: emailFrom, to: [customer_email], subject, html })
     })
     ```

3. **`supabase/functions/shipping-notification/index.ts`**:
   - Env variables and defaults (Lines 101–102):
     ```typescript
     const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
     const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'VentHub <onboarding@resend.dev>'
     ```
   - Sends email using Resend (Lines 141–145):
     ```typescript
     const resp = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({ from: EMAIL_FROM, to: [customer_email], subject, html })
     })
     ```

4. **`supabase/functions/return-status-notification/index.ts`**:
   - Env variables and defaults (Lines 166–167):
     ```typescript
     const resendApiKey = Deno.env.get('RESEND_API_KEY')
     const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <info@venthub.com>'
     ```
   - Sends inline constructed HTML using Resend (Lines 173–191):
     ```typescript
     const emailResponse = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({
         from: emailFrom,
         to: [customer_email],
         subject: subject,
         html: `...`,
       }),
     })
     ```

5. **`supabase/functions/notification-service/index.ts`**:
   - Env variables and defaults (Lines 81–82):
     ```typescript
     const resendApiKey = Deno.env.get('RESEND_API_KEY')
     const emailFrom = Deno.env.get('EMAIL_FROM') || 'VentHub <noreply@venthub.com>'
     ```
   - Sends email using Resend (Lines 236–249):
     ```typescript
     const response = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${config.apiKey}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         from,
         to: [to],
         subject: subject,
         _text: finalMessage,
         html: `<p>${finalMessage.replace(/\n/g, '<br>')}</p>`,
       }),
     })
     ```

### B. Tenants Config Table

1. **`supabase/migrations/20260530220000_tenant_schema_setup.sql`** (Lines 11–18):
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

2. **`docs/venthub_saas_faz1_prompt.md`** (Line 29):
   ```markdown
   1. tenants tablosu oluştur. Her tenant'ın bir slug'ı, opsiyonel custom domain'i, tema konfigürasyonu (CSS token override'ları için JSONB), feature flags (JSONB), ve genel config (JSONB — varsayılan dil, para birimi, ödeme geçidi ayarları, email_from, brand_name, brand_logo_url) olmalı.
   ```

---

## 2. Logic Chain
1. By examining the notification Deno Edge Functions, we confirmed they call the standard `https://api.resend.com/emails` REST endpoint directly via Deno's native `fetch`.
2. By reviewing the parameters loaded in `order-confirmation`, we found it loads `BRAND_NAME`, `BRAND_PRIMARY_COLOR`, `BRAND_LOGO_URL`, and `EMAIL_FROM` directly from `Deno.env.get(...)`.
3. The remaining notification functions (`delivery-notification`, `shipping-notification`, `return-status-notification`, `notification-service`) only load `EMAIL_FROM` from the environment and lack dynamic fetching variables for brand name, logo, or colors, reverting instead to hardcoded defaults in the Deno scripts.
4. By analyzing `20260530220000_tenant_schema_setup.sql`, we verified that `public.tenants` is defined but currently **lacks** any config JSONB columns.
5. In order to store dynamic branding configs, the `public.tenants` table must be altered to add a `config jsonb` column, as conceived in the roadmap specification (`docs/venthub_saas_faz1_prompt.md`).
6. Edge Functions can query this table using the `service_role` key bypassing standard tenant RLS policies (since they act as system dispatchers), mapping the requested `tenant_id` (extracted from auth JWT headers or query strings) to get the tenant config, falling back gracefully to Deno environment variables or system hardcoded fallbacks if fields are missing.

---

## 3. Caveats
- Edge Functions run in the Deno runtime environment. The Supabase client within edge functions must utilize the correct import (`https://esm.sh/@supabase/supabase-js@2.45.4`).
- It is assumed that Deno Edge Functions have access to `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security (RLS) when performing system-level lookup of the `tenants` configuration.
- We have not modified any source code files as per the read-only explorer constraints. The implementation has been left for the next subagent.

---

## 4. Conclusion
Email-sending functions currently fetch their branding and email sender configuration from global environment variables or fall back to hardcoded values. In the multi-tenant SaaS architecture, we must isolate these values.
To achieve this:
1. A migration should be run to add `config`, `theme_config`, and `features` JSONB columns to the `public.tenants` table.
2. A shared utility `supabase/functions/_shared/tenant_config.ts` must be created to resolve the tenant context and fetch dynamic branding variables from the `public.tenants` table, falling back to Deno environment variables and system defaults.
3. Each notification Edge Function must be updated to leverage this dynamic config helper instead of querying `Deno.env` directly.

---

## 5. Verification Method
- **Inspecting Proposed Files**: Inspect the analysis report at `c:\Users\alize\venthub-hvac\.agents\explorer_m4_3\analysis.md` to review the precise code implementation proposal.
- **SQL Migration Test**: Run the proposed database alteration query in the Supabase database and ensure the table `public.tenants` has a JSONB column named `config`.
- **Deno Execution & Type Check**: Once the implementation is complete, run Deno compilation check commands to verify that imported dynamic configurations are type-safe.
