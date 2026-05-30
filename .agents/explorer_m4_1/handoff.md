# Handoff Report — explorer_m4_1

## 1. Observation

A direct code-level investigation of the Deno Edge Functions in the `supabase/functions/` directory revealed a lack of tenant scoping and verification. Below are the key observed files, lines, and patterns:

1.  **Insecure Query by `order_number` without `tenant_id`:**
    *   **File Path**: `supabase/functions/shipping-webhook/index.ts`
    *   **Line Numbers**: 167–176
    *   **Verbatim Code**:
        ```typescript
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

2.  **No `tenant_id` Scoping in `iyzico-callback` Order Fetching/Patching:**
    *   **File Path**: `supabase/functions/iyzico-callback/index.ts`
    *   **Line Numbers**: 191–207 (`patchStatus` helper)
    *   **Verbatim Code**:
        ```typescript
        async function patchStatus(newStatus: 'paid' | 'failed' | 'confirmed') {
          const filterById = orderId ? `id=eq.${encodeURIComponent(orderId)}` : '';
          const filterByConv = (!orderId && (result?.conversationId || conversationId)) ? `conversation_id=eq.${encodeURIComponent(result?.conversationId || conversationId!)}` : '';
          const filter = filterById || filterByConv;
          if (!filter) return null;
          const resp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({ status: newStatus, payment_debug: debugInfo }),
          });
          return resp;
        }
        ```

3.  **Missing `tenant_id` on Order Creation (`INSERT`):**
    *   **File Path**: `supabase/functions/iyzico-payment/index.ts`
    *   **Line Numbers**: 279–311 (`orderData` definition and fetch POST)
    *   **Verbatim Code**:
        ```typescript
        const orderData = {
            id: dbGeneratedId,
            user_id: user_id || null,
            conversation_id: conversationId,
            total_amount: Number(authoritativeTotalNum.toFixed(2)),
            subtotal_snapshot: Number(authoritativeTotalNum.toFixed(2)),
            shipping_address: shipAddr,
            billing_address: billAddr || shipAddr,
            customer_email: ci.email,
            customer_name: ci.name,
            customer_phone: ci.phone || null,
            payment_method: 'iyzico',
            status: 'pending',
            invoice_type: invoiceType || null,
            invoice_info: invoiceInfo || null,
            legal_consents: legalConsents || null,
            shipping_method: (typeof shippingMethod === 'string' && shippingMethod) ? shippingMethod : 'standard',
            coupon_code: (requestData?.couponCode && typeof requestData.couponCode === 'string') ? requestData.couponCode : null,
            coupon_discount: 0
        };
        ```

4.  **No `tenant_id` Check in Admin Operations:**
    *   **File Path**: `supabase/functions/admin-update-order/index.ts`
    *   **Line Numbers**: 61–63 (verification), 79–90 (patching), and 92–98 (listing recent orders)
    *   **Verbatim Code (Listing)**:
        ```typescript
        async function listRecent(_limit = 100) {
          const res = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?select=id,conversation_id,created_at&order=created_at.desc&limit=${_limit}`, {
        ```

---

## 2. Logic Chain

1.  **Premise 1**: Multi-tenant isolation requires all database operations (both read queries and write payloads) to filter by or explicitly contain a validated `tenant_id` column.
2.  **Premise 2**: As observed in `shipping-webhook/index.ts:167-176` and `iyzico-callback/index.ts:191-207`, database selects/patches are executed using global identifiers like `order_number`, `id`, and `conversation_id` without filtering by `tenant_id`.
3.  **Premise 3**: As observed in `iyzico-payment/index.ts:279-311` and `admin-create-coupon/index.ts:93-103`, `INSERT` payloads created using the `service_role` client completely omit the `tenant_id` property.
4.  **Premise 4**: Since Deno Edge Functions bypass Row Level Security (RLS) by employing the `service_role` key, they must strictly enforce tenant checking in application logic.
5.  **Conclusion**: Currently, there is zero tenant scoping across the 12 assessed Deno Edge Functions. This leads to high-severity multi-tenant data leaks and updates (IDOR), and will cause `NOT NULL constraint violation` errors when `tenant_id` is made `NOT NULL` in the database schema.

---

## 3. Caveats

*   This analysis assumes that all database tables (e.g., `venthub_orders`, `venthub_order_items`, `coupons`, `venthub_returns`, `products`) either already contain or will be migrated to contain a `tenant_id` column of type `UUID REFERENCES tenants(id)`.
*   We did not run code-level tests (reproduction scripts) targeting an active Supabase database local sandbox as this is a read-only investigation.
*   We assume webhooks (e.g., carrier webhooks) can be registered with a query parameter `?tenant_id=xxx`. If certain carriers filter out query strings, an alternative mechanism (like unique webhook subdomains or customized HTTP headers) must be used.

---

## 4. Conclusion

The Deno Edge Functions are highly vulnerable to tenant isolation breaches. By querying orders using global sequences like `order_number` and executing updates via `service_role` without `tenant_id` filters, users, carriers, and admins can leak or modify records cross-tenant.

To resolve this, we recommend:
1.  **Carrier Webhooks**: Append `&tenant_id=YOUR_TENANT_ID` to their webhook URLs and parse it via `new URL(req.url).searchParams.get('tenant_id')`.
2.  **Authenticated Clients**: Decode the `Authorization` bearer JWT inside the Edge Function using the user's anon key and extract `app_metadata.tenant_id`.
3.  **Database Scoping**: Inject the resolved `tenant_id` into all select/patch filters and insert payloads.

---

## 5. Verification Method

To verify the findings and the proposed fixes:

1.  **Code Inspection**:
    *   Open `supabase/functions/shipping-webhook/index.ts`. Locate lines 167-176 and confirm the lookup `supabase.from('venthub_orders').select('id').eq('order_number', p.order_number)` lacks any `tenant_id` query constraint.
    *   Open `supabase/functions/iyzico-payment/index.ts`. Locate lines 279-311 and verify that the `orderData` object does not contain a `tenant_id` property.
2.  **Reproduction / Invalidation Condition**:
    *   Add a test order to the database:
        *   Order A: `id` = UUID A, `order_number` = "VH-100", `tenant_id` = Tenant A UUID.
    *   Invoke `shipping-webhook` with `tenant_id = Tenant B UUID` in the URL params and `order_number = "VH-100"` in the JSON body.
    *   If the webhook successfully matches and updates Order A's status, the vulnerability is active.
    *   If the webhook returns `404 Not Found` (meaning it tried to search `order_number = "VH-100"` within Tenant B's domain and found nothing), the fix is verified.
