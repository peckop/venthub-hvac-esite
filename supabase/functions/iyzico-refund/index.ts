// supabase/functions/iyzico-refund/index.ts
// Refund/Cancel unified endpoint for IyziCo + DB stock restoration
// Idempotent, requires admin or order owner

import Iyzipay from "npm:iyzipay";

function parseJwt(token?: string | null): any | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const IYZ_API = Deno.env.get("IYZICO_API_KEY") || "";
    const IYZ_SEC = Deno.env.get("IYZICO_SECRET_KEY") || "";
    const IYZ_URI = Deno.env.get("IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com";

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: { code: "CONFIG_ERROR", message: "Supabase config missing" } }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!IYZ_API || !IYZ_SEC) {
      return new Response(JSON.stringify({ error: { code: "CONFIG_ERROR", message: "IyziCo config missing" } }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body?.order_id;
    const amountReq: number | undefined = typeof body?.amount === 'number' ? Number(body.amount) : undefined;
    const reason: string | undefined = body?.reason || undefined;

    if (!orderId) {
      return new Response(JSON.stringify({ error: { code: "VALIDATION_ERROR", message: "order_id gerekli" } }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // AuthN/AuthZ: allow admin or order owner
    const authHeader = req.headers.get("authorization");
    const jwt = parseJwt(authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
    const reqUserId: string | null = (jwt?.sub as string) || null;

    // Load order
    const ordResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=id,user_id,status,payment_status,total_amount,payment_debug`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
    });
    if (!ordResp.ok) {
      return new Response(JSON.stringify({ error: { code: "DB_ERROR", message: "Order fetch failed", status: ordResp.status } }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const orders = await ordResp.json().catch(() => []);
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) {
      return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Order not found" } }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Authorization check: admin OR owner
    let isAdmin = false;
    if (reqUserId) {
      const prof = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(reqUserId)}&select=role`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
      if (prof.ok) {
        const arr = await prof.json().catch(() => []);
        const row = Array.isArray(arr) ? arr[0] : null;
        isAdmin = (row?.role === 'admin');
      }
    }
    const isOwner = reqUserId && (order.user_id === reqUserId);
    if (!(isAdmin || isOwner)) {
      return new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Yetkisiz" } }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Idempotency
    if (order.payment_status === 'refunded' || order?.payment_debug?.manual_refund_applied === true) {
      return new Response(JSON.stringify({ status: 'already_refunded', order_id: orderId }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const totalAmount = Number(order.total_amount) || 0;
    const payId = order?.payment_debug?.paymentId || order?.payment_debug?.raw?.paymentId || null;
    const transactions: any[] = Array.isArray(order?.payment_debug?.raw?.itemTransactions) ? order.payment_debug.raw.itemTransactions : [];

    const sdk = new (Iyzipay as any)({ apiKey: IYZ_API, secretKey: IYZ_SEC, uri: IYZ_URI });

    let refundType: 'cancel' | 'refund' = 'cancel';
    let targetAmount = amountReq && amountReq > 0 ? amountReq : totalAmount;

    // Decide: full cancel vs partial refund
    const epsilon = 0.0001;
    const isFull = Math.abs(targetAmount - totalAmount) < epsilon || !amountReq;

    let iyzResult: any = null;
    try {
      if (isFull) {
        refundType = 'cancel';
        iyzResult = await new Promise((resolve, reject) => {
          (sdk as any).cancel.create({
            locale: (Iyzipay as any).LOCALE ? (Iyzipay as any).LOCALE.TR : 'tr',
            paymentId: payId,
            ip: req.headers.get('cf-connecting-ip') || '85.34.78.112'
          }, (err: any, res: any) => err ? reject(err) : resolve(res));
        });
      } else {
        refundType = 'refund';
        // Use first transaction id for partial amount (basic version). Could be extended to map items/amounts.
        const ptx = transactions?.[0]?.paymentTransactionId;
        if (!ptx) {
          return new Response(JSON.stringify({ error: { code: "NO_TRANSACTION", message: "Partial refund needs paymentTransactionId" } }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        iyzResult = await new Promise((resolve, reject) => {
          (sdk as any).refund.create({
            locale: (Iyzipay as any).LOCALE ? (Iyzipay as any).LOCALE.TR : 'tr',
            paymentTransactionId: ptx,
            price: String(targetAmount),
            currency: 'TRY',
            ip: req.headers.get('cf-connecting-ip') || '85.34.78.112'
          }, (err: any, res: any) => err ? reject(err) : resolve(res));
        });
      }
    } catch (e: any) {
      return new Response(JSON.stringify({ error: { code: "IYZICO_ERROR", message: e?.message || String(e) } }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ok = !!(iyzResult && (iyzResult.status === 'success' || iyzResult.status === 'SUCCESS'));
    if (!ok) {
      return new Response(JSON.stringify({ error: { code: "IYZICO_FAIL", result: iyzResult } }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Stock restore (idempotent by manual_refund_applied flag)
    try {
      const itemsResp = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items?order_id=eq.${encodeURIComponent(orderId)}&select=product_id,quantity`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
      });
      const items = itemsResp.ok ? await itemsResp.json().catch(() => []) : [];
      for (const it of items) {
        try {
          // Increase stock
          // Get current to use optimistic lock
          const pResp = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(it.product_id)}&select=id,stock_qty`, {
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
          });
          const arr = pResp.ok ? await pResp.json().catch(() => []) : [];
          const cur = Array.isArray(arr) ? arr[0] : null;
          const curStock = Number(cur?.stock_qty ?? 0);
          const newStock = curStock + Number(it.quantity || 0);
          await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(it.product_id)}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify({ stock_qty: newStock })
          });
        } catch {}
      }
    } catch {}

    // Update order: payment_status=refunded, status
    try {
      const newDebug = { ...(order.payment_debug || {}), refund_result: iyzResult, manual_refund_applied: true, manual_refund_applied_at: new Date().toISOString(), refund_type: refundType, refund_amount: targetAmount };
      const newStatus = (order.status === 'shipped' || order.status === 'delivered') ? order.status : 'cancelled';
      await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ payment_status: 'refunded', status: newStatus, payment_debug: newDebug })
      });
    } catch {}

    return new Response(JSON.stringify({ status: 'refunded', type: refundType, amount: targetAmount, order_id: orderId }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: { code: 'UNEXPECTED', message: e?.message || String(e) } }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

