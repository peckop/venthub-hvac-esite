# Deno Edge Functions Tenant Scoping Analysis Report

This analysis focuses on securing the Deno Edge Functions located in `supabase/functions/` to ensure robust multi-tenant isolation, preventing insecure direct object reference (IDOR) vulnerabilities, cross-tenant data leaks, and database constraint violations.

---

## 1. Database Operations & Current Tenant Scoping Audit

An audit of the edge functions was performed to identify all database `INSERT` and `UPDATE` operations and to verify if they currently parse `tenant_id` from the URL query string (`?tenant_id=xxx`) or authorization headers.

### Summary Table

| Edge Function | DB Operations | Table(s) Affected | Current Tenant Scoping Status |
| :--- | :--- | :--- | :--- |
| **`shipping-webhook`** | `INSERT` (audit), `UPDATE` (order status) | `shipping_webhook_events`, `venthub_orders` | ❌ **None** (No extraction from query string or headers) |
| **`iyzico-callback`** | `UPDATE` (payment, order status), `DELETE` (cart items) | `venthub_orders`, `cart_items` | ❌ **None** (No extraction from query string or headers) |
| **`iyzico-payment`** | `INSERT` (order, order items), `UPDATE` (payment token) | `venthub_orders`, `venthub_order_items` | ❌ **None** (Only extracts `user_id` from body; no `tenant_id`) |
| **`iyzico-refund`** | `UPDATE` (order refund details), `UPDATE` (product stock) | `venthub_orders`, `products` | ❌ **None** (Only decodes user JWT for auth; no `tenant_id` check) |
| **`returns-webhook`** | `INSERT` (audit), `UPDATE` (returns status) | `returns_webhook_events`, `venthub_returns` | ❌ **None** (No extraction from query string or headers) |
| **`order-validate`** | *Select only* (cart, products, user, org, price lists) | `shopping_carts`, `cart_items`, `products`, `price_lists`, etc. | ❌ **None** (Decodes user JWT but does not filter DB reads by `tenant_id`) |
| **`admin-create-coupon`** | `INSERT` (new coupon) | `coupons` | ❌ **None** (Will fail if `tenant_id` has `NOT NULL` constraint) |
| **`apply-coupon`** | *Select only* (coupon details) | `coupons` | ❌ **None** (Allows applying coupon from other tenants if code matches) |
| **`shipping-status`** | *Select only* (order shipping details) | `venthub_orders` | ❌ **None** (Allows public tracking lookup of other tenants' orders) |
| **`admin-update-order`** | `UPDATE` (order status) | `venthub_orders` | ❌ **None** (Allows updating orders across all tenants) |
| **`admin-update-shipping`** | `UPDATE` (shipping details), `INSERT` (logs, idempotency) | `venthub_orders`, `shipping_idempotency`, `shipping_email_events` | ❌ **None** (Allows updating shipping/tracking across all tenants) |
| **`refund-order-mock`** | `UPDATE` (refund status, product stock), `INSERT` (logs) | `venthub_orders`, `products`, `order_refund_events` | ❌ **None** (Decodes user JWT for auth but does not check `tenant_id`) |

### Detailed Vulnerability Analysis by Operation

1. **`admin-create-coupon`**:
   - **Operation**: `INSERT` into `coupons` table.
   - **Vulnerability**: Since `tenant_id` is missing from the payload, this operation will fail with a `NOT NULL constraint violation` once the column is set to `NOT NULL` in the database. Furthermore, there is no verification that the coupon is bound to the admin's specific tenant.
2. **`iyzico-payment`**:
   - **Operation**: `INSERT` into `venthub_orders` and `venthub_order_items`.
   - **Vulnerability**: The function receives the client-side `user_id` but does not perform any JWT claims verification to authenticate the user. It creates orders and order items under `service_role` bypassing RLS without injecting the `tenant_id` column. Once `tenant_id` is made `NOT NULL`, these inserts will fail.
3. **`admin-update-order` & `admin-update-shipping`**:
   - **Operation**: `UPDATE` / `PATCH` on `venthub_orders`.
   - **Vulnerability**: Admins are checked for roles (`admin` or `superadmin`) using a global lookup: `.eq('id', user.id)`. However, there is no validation that the admin's `tenant_id` matches the order's `tenant_id` being updated. An admin from Tenant A can inspect or update orders from Tenant B by simply guessing their ID or sending their `display_code` (which fetches recent orders globally using `limitRecent`).

---

## 2. Webhook Order Lookups (shipping-webhook & iyzico-callback)

Order lookups in `shipping-webhook` and `iyzico-callback` were analyzed to check for scoping vulnerabilities. Both functions contain critical security risks when querying orders:

### `shipping-webhook` Lookups

When `order_id` is not present in the carrier payload, the function attempts to lookup the order by `order_number`:
```typescript
// Line 167-176 in shipping-webhook/index.ts:
if (!orderId && p.order_number) {
  const { data, error } = await supabase
    .from<{ id: string }>('venthub_orders')
    .select('id')
    .eq('order_number', p.order_number)
    .limit(1)
    .single()
  if (error) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 })
  orderId = data?.id as string
}
```
*   **Analysis**: This lookup is completed using `.eq('order_number', p.order_number)` without a `tenant_id` filter. Because different tenants might share the same order number sequence (e.g., sequential sequences like `VH-1001`), this query is highly unsafe:
    - It can fetch an order belonging to a completely different tenant.
    - It allows an attacker to manipulate tracking/shipping status across different tenants by sending payloads with targeted order numbers.
*   **Secondary Lookup**: Even when `orderId` (UUID) is loaded, the subsequent order validation lacks a `tenant_id` check:
    ```typescript
    const { data: current, error: curErr } = await supabase
      .from<OrderRow>('venthub_orders')
      .select('id, status, shipped_at, ...')
      .eq('id', orderId)
      .single()
    ```
    This leaves the system open to cross-tenant carrier notification updates.

### `iyzico-callback` Lookups

During callback execution, the function attempts to retrieve and patch order details using multiple lookup paths:
```typescript
// Lookup 1: Retrieve payment token using orderId (Line 86-91)
const got = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=payment_token`, ...)

// Lookup 2: Update payment token by orderId (Line 150-154)
await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', body: JSON.stringify({ payment_token: token }) })

// Lookup 3: Patch order status by orderId or conversationId (Line 191-207)
const filterById = orderId ? `id=eq.${encodeURIComponent(orderId)}` : '';
const filterByConv = (!orderId && conversationId) ? `conversation_id=eq.${encodeURIComponent(conversationId)}` : '';
const resp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}`, ...)
```
*   **Analysis**: None of these lookup or update operations filter by `tenant_id`.
    - If a malicious actor generates an Iyzico webhook payload using a predicted `conversation_id` or `orderId`, they can alter order payment status across tenant boundaries.
    - Since this webhook uses `service_role` (bypassing RLS), a strict application-level `tenant_id` verification is required.

---

## 3. Recommended Fix Strategy

To implement **defense-in-depth**, we must ensure that all Edge Functions explicitly extract the `tenant_id` from authenticated user JWTs (client/admin requests) or from the URL query parameters (carrier/payment webhooks), and propagate this `tenant_id` to every query filter and write payload.

### Strategy A: Webhook & Public Callback Scoping (`shipping-webhook`, `iyzico-callback`, `returns-webhook`)

Since third-party webhooks do not support Supabase auth headers, the `tenant_id` must be passed via URL parameters during registration, and extracted in Deno.

#### 1. Registration Pipeline Update
*   When creating an Iyzico payment in `iyzico-payment/index.ts`, append the `tenantId` to the callback URL parameters:
    ```typescript
    // In iyzico-payment/index.ts:
    const callbackUrlWithParams = `${callbackBase}?orderId=${encodeURIComponent(dbOrderId)}&conversationId=${encodeURIComponent(conversationId)}&tenant_id=${encodeURIComponent(tenantId)}${successUrl ? `&successUrl=${encodeURIComponent(successUrl)}` : ''}`;
    ```
*   For carrier webhooks (`shipping-webhook`, `returns-webhook`), ensure all webhook settings configured in the admin dashboard append `?tenant_id=YOUR_TENANT_ID` to the endpoint URL.

#### 2. Deno Webhook Extraction & Scoping Template
```typescript
// Extract tenant_id from query string
const url = new URL(req.url);
const tenantId = url.searchParams.get('tenant_id');

if (!tenantId) {
  return jsonResponse({ error: 'Bad Request: tenant_id parameter is required' }, { status: 400 });
}

// Scoped Order Lookup in shipping-webhook
if (!orderId && p.order_number) {
  const { data, error } = await supabase
    .from('venthub_orders')
    .select('id')
    .eq('order_number', p.order_number)
    .eq('tenant_id', tenantId) // 🔒 Scoped to active tenant
    .limit(1)
    .single();
  
  if (error) return jsonResponse({ error: 'Order not found for given order_number' }, { status: 404 });
  orderId = data?.id;
}

// Scoped Order Status Update
const { data, error } = await supabase
  .from('venthub_orders')
  .update(patch)
  .eq('id', orderId)
  .eq('tenant_id', tenantId) // 🔒 Scoped update
  .select('id, status, ...')
  .single();
```

---

### Strategy B: Authenticated Client-Facing Scoping (`iyzico-payment`, `order-validate`, `apply-coupon`, `iyzico-refund`, `refund-order-mock`)

For functions triggered by authenticated users, extract the validated `tenant_id` claim from their Supabase JWT.

#### 1. JWT Claim Extraction Helper
Create or reuse a shared helper function in `_shared/auth.ts`:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getTenantContext(req: Request) {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  let tenantId = new URL(req.url).searchParams.get('tenant_id') || req.headers.get('x-tenant-id');
  
  if (authHeader) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error } = await authClient.auth.getUser();
    if (!error && user?.app_metadata?.tenant_id) {
      tenantId = user.app_metadata.tenant_id;
    }
  }
  return tenantId;
}
```

#### 2. Apply Coupon Scoping Example
In `apply-coupon/index.ts`, restrict coupon verification to the caller's tenant:
```typescript
const tenantId = await getTenantContext(req);
if (!tenantId) {
  return new Response(JSON.stringify({ val_id: false, reason: 'missing_tenant_context' }), { status: 400, headers: corsHeaders });
}

// 🔒 Fetch coupon restricted by code AND tenant
const { data, error } = await supabase
  .from('coupons')
  .select('code, discount_type, discount_value, minimum_order_amount, is_active, ...')
  .eq('code', code)
  .eq('tenant_id', tenantId) // 🔒 Strict scoping
  .maybeSingle();
```

#### 3. Order Placement Scoping Example
In `iyzico-payment/index.ts`, populate `tenant_id` on insertions:
```typescript
const tenantId = await getTenantContext(req);
if (!tenantId) {
  return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Missing tenant context' } }), { status: 401, headers: corsHeaders });
}

const orderData = {
  id: dbGeneratedId,
  user_id: user_id || null,
  tenant_id: tenantId, // 🔒 Populated for row-level constraint safety
  conversation_id: conversationId,
  total_amount: Number(authoritativeTotalNum.toFixed(2)),
  // ... rest of fields
};
```

---

### Strategy C: Admin Scoping (`admin-create-coupon`, `admin-update-order`, `admin-update-shipping`, `admin-iyzico-reconcile`, `admin-order-inspect`)

Verify the admin's privileges within their specific tenant domain.

#### 1. RBAC Verification with Tenant Restriction
```typescript
const tenantId = await getTenantContext(req);
const userId = user.id;

// Verify role matching ONLY in the active tenant space
const { data: profile, error: profErr } = await supabaseAdmin
  .from('user_profiles')
  .select('role')
  .eq('id', userId)
  .eq('tenant_id', tenantId) // 🔒 Prevents cross-tenant admin hijacking
  .maybeSingle();

const userRole = profile?.role || 'user';
if (!['admin', 'superadmin'].includes(userRole)) {
  return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });
}
```

#### 2. Order Update REST Call Restructuring
In `admin-update-order/index.ts`, rewrite `patch` and `listRecent` fetching:
```typescript
async function patch(filter: string) {
  // 🔒 Scoped filter prevents updating orders belonging to other tenants
  return await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ status: newStatus })
  });
}

async function listRecent(limit = 100) {
  // 🔒 Recent orders filtered by active tenant only
  const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,conversation_id,created_at&tenant_id=eq.${encodeURIComponent(tenantId)}&order=created_at.desc&limit=${limit}`, {
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
  });
  // ...
}
```

---

## 4. Verification & Testing Strategy

To verify the tenant-scoping changes, implement the following validation suite:

1.  **Positive Verification (Tenant A requests Tenant A's Resource)**:
    *   Initiate a callback/webhook using `?tenant_id=tenant_a_uuid` for `order_number` matching Tenant A.
    *   Verify the operation completes successfully and updates the database row.
2.  **Negative Verification (Cross-Tenant Hijack Prevention)**:
    *   Initiate a callback/webhook using `?tenant_id=tenant_b_uuid` pointing to Tenant A's `order_number` or `order_id`.
    *   Ensure the request returns `404 Not Found` or `401 Unauthorized` and does **not** modify Tenant A's database row.
3.  **Audit Trail Logging**:
    *   Verify that `shipping_webhook_events` and `returns_webhook_events` populate `tenant_id` matching the incoming parameter, providing a fully auditable stream of webhook occurrences per tenant.
