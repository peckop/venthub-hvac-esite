Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400"
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'config_error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const headers = {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    } as Record<string,string>;

    const body = await req.json().catch(()=>({}));
    const userId = (body?.user_id || body?.userId || '').toString();
    let cartId = (body?.cart_id || body?.cartId || '').toString();

    async function getJson(path: string) {
      const res = await fetch(`${supabaseUrl}${path}`, { headers });
      const txt = await res.text();
      if (!res.ok) throw new Error(`fetch ${path} -> ${res.status}: ${txt}`);
      try { return JSON.parse(txt); } catch { return null; }
    }

    function nowIso() { return new Date().toISOString(); }

    // Resolve cart_id by user if needed
    if (!cartId && userId) {
      const carts = await getJson(`/rest/v1/shopping_carts?select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`);
      cartId = Array.isArray(carts) && carts[0]?.id || '';
    }
    if (!cartId) {
      return new Response(JSON.stringify({ error: 'missing_cart', hint: 'Provide cart_id or user_id' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Load cart items
    const items = await getJson(`/rest/v1/cart_items?select=product_id,quantity,unit_price,price_list_id&cart_id=eq.${encodeURIComponent(cartId)}`) || [];
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ ok: true, items: [], mismatches: [], totals: { subtotal: 0 } }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Load products
    const productIds = Array.from(new Set(items.map((i:any)=>i.product_id)));
    const prods = await getJson(`/rest/v1/products?select=* &id=in.(${productIds.map(encodeURIComponent).join(',')})`);
    const pmap = new Map<string, any>();
    (Array.isArray(prods)?prods:[]).forEach((p:any)=>pmap.set(p.id, p));

    // Load profile + tier
    let role = 'individual';
    let orgId: string | null = null;
    let tier: number | null = null;
    if (userId) {
      const prof = await getJson(`/rest/v1/user_profiles?select=id,role,organization_id&id=eq.${encodeURIComponent(userId)}&limit=1`);
      if (Array.isArray(prof) && prof[0]) {
        role = prof[0].role || 'individual';
        orgId = prof[0].organization_id || null;
      }
      if (orgId) {
        const org = await getJson(`/rest/v1/organizations?select=id,tier_level&id=eq.${encodeURIComponent(orgId)}&limit=1`);
        if (Array.isArray(org) && org[0]) tier = org[0].tier_level ?? null;
      }
    }

    // Load active price lists
    const n = nowIso();
    const lists = await getJson(`/rest/v1/price_lists?select=* &is_active=eq.true&effective_from=lte.${encodeURIComponent(n)}&or=(effective_to.is.null,effective_to.gte.${encodeURIComponent(n)})`);
    const flists = (Array.isArray(lists)?lists:[]).filter((pl:any)=>{
      const rs = pl.allowed_user_roles as string[] | null | undefined;
      const ts = pl.organization_tiers as number[] | null | undefined;
      const roleOk = !rs || rs.length===0 || rs.includes(role);
      const tierOk = (tier==null) || !ts || ts.length===0 || ts.includes(tier);
      return roleOk && tierOk;
    });
    flists.sort((a:any,b:any)=>{
      const ad = a.is_default?1:0; const bd=b.is_default?1:0; if (ad!==bd) return ad-bd; // non-default first
      const at=a.effective_from?Date.parse(a.effective_from):0; const bt=b.effective_from?Date.parse(b.effective_from):0; return bt-at;
    });
    const chosenListId = flists[0]?.id ?? null;

    async function priceFor(product:any): Promise<{unit:number, listId:string|null}> {
      const queries: (string|null)[] = chosenListId? [chosenListId, null] : [null];
      for (const q of queries) {
        const basePath = `/rest/v1/product_prices?select=base_price,sale_price,discount_percentage,is_active,valid_from,valid_until&product_id=eq.${encodeURIComponent(product.id)}&is_active=eq.true`;
        const path = q===null ? `${basePath}&price_list_id=is.null` : `${basePath}&price_list_id=eq.${encodeURIComponent(q)}`;
        const rows = await getJson(path);
        if (!Array.isArray(rows) || rows.length===0) continue;
        const pick = rows.find((r:any)=>{ const f=!r.valid_from||Date.parse(r.valid_from)<=Date.now(); const t=!r.valid_until||Date.parse(r.valid_until)>=Date.now(); return f&&t; }) || rows[0];
        const base = Number(pick.base_price||0); const sale = pick.sale_price!=null?Number(pick.sale_price):null; const disc = Number(pick.discount_percentage||0);
        if (sale!=null && Number.isFinite(sale) && sale>0) return { unit: sale, listId: q };
        if (Number.isFinite(base) && base>0) {
          if (disc>0) { const v=base*(1-disc/100); return { unit: Math.max(0, Number(v.toFixed(2))), listId: q }; }
          return { unit: base, listId: q };
        }
      }
      // fallback product.price
      const fb = Number(product.price||0);
      return { unit: Number.isFinite(fb)?fb:0, listId: chosenListId };
    }

    const recalculated: any[] = [];
    const mismatches: any[] = [];
    const stockIssues: any[] = [];
    for (const it of items) {
      const product = pmap.get(it.product_id);
      if (!product) continue;
      const pr = await priceFor(product);
      const unit = pr.unit;
      const equal = it.unit_price!=null && Math.abs(Number(it.unit_price)-unit) < 0.005;
      // Stock check (best-effort): try common field names
      let available: number | null = null;
      const cand = [product.stock, product.quantity_available, product.inventory, product.inventory_quantity, product.available, product.on_hand];
      for (const c of cand) {
        if (typeof c === 'number') { available = c; break; }
        if (typeof c === 'string' && !isNaN(Number(c))) { available = Number(c); break; }
      }
      const qty = Number(it.quantity)||0;
      let finalQty = qty;
      if (available!=null && available>=0 && qty>available) {
        stockIssues.push({ product_id: it.product_id, requested: qty, available });
        finalQty = available; // suggestion
      }

      recalculated.push({ product_id: it.product_id, quantity: finalQty, unit_price: unit, price_list_id: pr.listId });
      if (!equal) mismatches.push({ product_id: it.product_id, had: it.unit_price, expected: unit, price_list_id: pr.listId });
    }

    const subtotal = recalculated.reduce((s, r)=> s + Number(r.unit_price)*Number(r.quantity), 0);
    const ok = mismatches.length===0 && stockIssues.length===0;

    return new Response(JSON.stringify({ ok, items: recalculated, mismatches, stock_issues: stockIssues, totals: { subtotal: Number(subtotal.toFixed(2)) }, cart_id: cartId }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
