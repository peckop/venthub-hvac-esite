import { getCorsHeaders } from '../_shared/cors.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
interface CartItem { product_id: string; quantity: number | string; unit_price?: number | string; price_list_id?: string | null }
interface Product {
  id: string;
  price?: number | string;
  stock_qty?: number | string; stock?: number | string; quantity_available?: number | string; inventory?: number | string; inventory_quantity?: number | string; available?: number | string; on_hand?: number | string;
}
interface PriceList { id: string; user_type?: string | null; effective_from?: string | null }
interface ProductPrice { base_price?: number | string | null; sale_price?: number | string | null; discount_percentage?: number | string | null; is_active?: boolean; valid_from?: string | null; valid_until?: string | null; price_list_id?: string | null; net_price?: number | string | null; gross_price?: number | string | null }

// W2 tek sözleşme (pricing-standard §8, INV-PRICE-2): segment = JWT app_metadata
// (price_segment, yoksa hook'un enjekte ettiği user_role) — user_profiles.role OKUNMAZ.
// pricing.service.ts::getUserPriceSegment ve public.jwt_price_segment() ile birebir aynı kural.
type PriceSegment = 'individual' | 'dealer' | 'corporate'
function segmentFromUser(u: { app_metadata?: Record<string, unknown> } | null): PriceSegment {
  const md = u?.app_metadata ?? {}
  for (const c of [md['price_segment'], md['user_role']]) {
    if (c === 'dealer' || c === 'corporate') return c
  }
  return 'individual'
}
interface RecalcItem { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }
interface MismatchItem { product_id: string; had: unknown; expected: number; price_list_id: string | null }
interface StockIssue { product_id: string; requested: number; available: number }

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: 'config_error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const headers = {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      'Content-Type': 'application/json'
    } as Record<string,string>;

    const body = await req.json().catch(()=>({}));
    const userId = user.id;
    let cartId = (body?.cart_id || body?.cartId || '').toString();

    async function getJson<T>(_path: string): Promise<T> {
      const res = await fetch(`${supabaseUrl}${_path}`, { headers });
      const txt = await res.text();
      if (!res.ok) throw new Error(`fetch ${_path} -> ${res.status}: ${txt}`);
      try { return JSON.parse(txt) as T; } catch { return null as unknown as T; }
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
    const items = await getJson<CartItem[]>(`/rest/v1/cart_items?select=product_id,quantity,unit_price,price_list_id&cart_id=eq.${encodeURIComponent(cartId)}`) || [];
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ ok: true, items: [], mismatches: [], totals: { subtotal: 0 } }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Load products
    const _productIds = Array.from(new Set(items.map((i)=>i.product_id)));
    const prods = await getJson<Product[]>(`/rest/v1/products?select=*&id=in.(${_productIds.map(encodeURIComponent).join(',')})`);
    const pmap = new Map<string, Product>();
    (Array.isArray(prods)?prods:[]).forEach((p: Product)=>pmap.set(p.id, p));

    // Segment: JWT'den (yukarıdaki tek-sözleşme kuralı). Eski sürüm user_profiles.role +
    // organizations.tier_level okuyor ve price_lists'i VAR OLMAYAN kolonlarla
    // (allowed_user_roles/organization_tiers/is_default) filtreliyordu → tüm listeler geçiyor,
    // en yeni liste (bayi olabilir!) seçilebiliyordu. Şimdi storefront çözücüsüyle birebir aynı
    // seçim: user_type = segment, en yeni effective_from kazanır.
    const segment = segmentFromUser(user);

    const n = nowIso();
    const lists = await getJson<PriceList[]>(`/rest/v1/price_lists?select=id,user_type,effective_from&is_active=eq.true&effective_from=lte.${encodeURIComponent(n)}&or=(effective_to.is.null,effective_to.gte.${encodeURIComponent(n)})`);
    const flists = (Array.isArray(lists)?lists:[]).filter((pl: PriceList)=> pl.user_type === segment || !pl.user_type);
    flists.sort((a: PriceList, b: PriceList)=>{
      if (!a.user_type !== !b.user_type) return a.user_type ? -1 : 1; // spesifik user_type önce
      const at=a.effective_from?Date.parse(a.effective_from):0; const bt=b.effective_from?Date.parse(b.effective_from):0; return bt-at;
    });
    const chosenListId = flists[0]?.id ?? null;

    async function priceFor(product: Product): Promise<{unit:number, listId:string|null}> {
      // price_list_id canlı şemada NOT NULL → eski "is.null fallback" sorgusu ölüydü, kaldırıldı.
      if (chosenListId) {
        const _path = `/rest/v1/product_prices?select=base_price,sale_price,discount_percentage,is_active,valid_from,valid_until,net_price,gross_price&product_id=eq.${encodeURIComponent(product.id)}&is_active=eq.true&price_list_id=eq.${encodeURIComponent(chosenListId)}`;
        const rows = await getJson<ProductPrice[]>(_path);
        if (Array.isArray(rows) && rows.length>0) {
          const pick = rows.find((r: ProductPrice)=>{ const f=!r.valid_from||Date.parse(r.valid_from)<=Date.now(); const t=!r.valid_until||Date.parse(r.valid_until)>=Date.now(); return f&&t; }) || rows[0];
          // W2 cache sözleşmesi: motor çıktısı varsa o kazanır — storefront çözücüsüyle AYNI kural
          // (B2C=gross KDV-dahil, B2B=net KDV-hariç), yoksa tutar karşılaştırması yanlış-mismatch üretir.
          const net = pick.net_price!=null?Number(pick.net_price):null;
          const gross = pick.gross_price!=null?Number(pick.gross_price):null;
          const derived = segment==='individual' ? (gross ?? net) : (net ?? gross);
          if (derived!=null && Number.isFinite(derived) && derived>0) return { unit: derived, listId: chosenListId };
          const base = Number(pick.base_price||0); const sale = pick.sale_price!=null?Number(pick.sale_price):null; const disc = Number(pick.discount_percentage||0);
          if (sale!=null && Number.isFinite(sale) && sale>0) return { unit: sale, listId: chosenListId };
          if (Number.isFinite(base) && base>0) {
            if (disc>0) { const v=base*(1-disc/100); return { unit: Math.max(0, Number(v.toFixed(2))), listId: chosenListId }; }
            return { unit: base, listId: chosenListId };
          }
        }
      }
      // fallback product.price
      const fb = Number(product.price||0);
      return { unit: Number.isFinite(fb)?fb:0, listId: chosenListId };
    }

    const recalculated: RecalcItem[] = [];
    const mismatches: MismatchItem[] = [];
    const stockIssues: StockIssue[] = [];
    const to2 = (n:number)=> Number(Number(n).toFixed(2));
    const toCents = (n:number)=> Math.round(Number(n)*100);

    for (const it of items) {
      const product = pmap.get(it.product_id);
      if (!product) continue;
      const pr = await priceFor(product);
      const unit = pr.unit;
      const unitNorm = to2(unit);
      const equal = it.unit_price!=null && Math.abs(Number(it.unit_price) - unitNorm) < 0.005;
      // Stock check (best-effort): try common field names
      let available: number | null = null;
      const cand = [product.stock_qty, product.stock, product.quantity_available, product.inventory, product.inventory_quantity, product.available, product.on_hand];
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

      recalculated.push({ product_id: it.product_id, quantity: finalQty, unit_price: unitNorm, price_list_id: pr.listId });
      if (!equal) mismatches.push({ product_id: it.product_id, had: it.unit_price, expected: unitNorm, price_list_id: pr.listId });
    }

    const subtotalCents = recalculated.reduce((s, r)=> s + toCents(r.unit_price)*Number(r.quantity), 0);
    const subtotal = subtotalCents/100;
    const ok = mismatches.length===0 && stockIssues.length===0;

    return new Response(JSON.stringify({ ok, items: recalculated, mismatches, stock_issues: stockIssues, totals: { subtotal, subtotal_cents: subtotalCents }, cart_id: cartId }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (_e) {
    console.error('Order validate error:', _e);
    const msg = _e instanceof Error ? _e.message : 'unknown';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
