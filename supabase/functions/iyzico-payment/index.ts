// Çağıran sınıfı: (a) oturumlu müşteri tarayıcısı — getUser(jwt) + sahiplik kapısı
//
// NİÇİN BU KAPI VAR (T026-VH Adım 4 · 2026-08-15)
// Bu uç `venthub_orders` satırı YAZAR ve `user_id` kolonunu doldurur. 2026-08-15'e kadar
// o değer doğrudan istek gövdesinden geliyordu (`requestData.user_id`) ve yalnız "boş mu"
// diye bakılıyordu. `verify_jwt = true` olması yetmez: anon key de GEÇERLİ bir JWT'dir ve
// frontend paketinde herkese açıktır → pratikte herkes BAŞKASININ `user_id`'siyle sipariş
// oluşturabiliyordu (cetvel §3.2: "gövdeden gelen user_id asla yetki kaynağı olamaz").
// Artık kimlik `resolveCaller` içindeki TEK `auth.getUser(<jwt>)` çağrısından gelir; tenant
// de aynı doğrulanmış kimliğin `user_profiles` satırından türetilir (cetvel §3.9 · plan §4).
import { getCorsHeaders } from '../_shared/cors.ts'
import Iyzipay from "npm:iyzipay";
import {
    type CallerContext,
    CallerConfigError,
    CallerLookupError,
    resolveCaller,
    TenantMismatchError,
} from '../_shared/caller.ts'


/**
 * @file Supabase Edge Function - Iyzico Payment
 * IDE help: Declare Deno for environments without Deno extension
 */
declare const Deno: {
    serve: (handler: (req: Request) => Promise<Response> | Response) => void;
    env: {
        get: (key: string) => string | undefined;
    };
};

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

    const origin = req.headers.get('origin') || '';
    const allowed = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = allowed.length === 0 || (origin && allowed.includes(origin));
    const requestId = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID() : String(Date.now());

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (!okOrigin && req.method !== 'OPTIONS') {
        return new Response(JSON.stringify({ error: 'forbidden_origin' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
        });
    }
    // Content-Type & size checks
    const ct = (req.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'unsupported_media_type' }), { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }
    const max = parseInt(Deno.env.get('MAX_BODY_KB') || '200', 10) * 1024;
    const cl = parseInt(req.headers.get('content-length') || '0', 10) || 0;
    if (cl > max) {
        return new Response(JSON.stringify({ error: 'payload_too_large' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId } });
    }

    let debugEnabled = false;
    try {
        const url = new URL(req.url);
        debugEnabled = ((Deno.env.get('IYZICO_DEBUG') || '').toLowerCase() === 'true')
            || (url.searchParams.get('debug') === '1')
            || ((req.headers.get('x-debug') || '') === '1');

        // Per-IP rate limiting
        try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
            if (supabaseUrl && serviceRoleKey) {
                const forwarded = req.headers.get('x-forwarded-for') || ''
                const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || (forwarded.split(',')[0]?.trim() || '') || 'unknown'
                const key = `iyzico:${ip}`
                const { checkRateLimit, rateLimitHeaders } = await import('../_shared/rate_limit.ts')
                const { result } = await checkRateLimit(key, supabaseUrl, serviceRoleKey, { limit: Number(Deno.env.get('PAYMENT_RATE_LIMIT_PER_MINUTE') || 30), windowSec: Number(Deno.env.get('PAYMENT_RATE_LIMIT_WINDOW_SEC') || 60) })
                if (!result.allowed) {
                    const rl = rateLimitHeaders(Number(Deno.env.get('PAYMENT_RATE_LIMIT_PER_MINUTE') || 30), result.remaining, result.resetAt)
                    return new Response(JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Çok fazla istek' } }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rl } })
                }
            }
        } catch (_e) {
            if (debugEnabled) console.warn('rate_limit skipped:', _e)
        }

        const mask = (s?: string) => typeof s === 'string' ? s.replace(/.(?=.{2})/g, '*') : s;
        type BuyerMin = { email?: string; gsmNumber?: string; registrationAddress?: string; ip?: string }
        type AddressMin = { address?: string }
        type PaymentMin = { buyer?: BuyerMin; shippingAddress?: AddressMin; billingAddress?: AddressMin;[k: string]: unknown }
        const sanitize = (obj: PaymentMin) => ({
            ...obj,
            buyer: obj?.buyer ? { ...obj.buyer, email: mask(obj.buyer.email), gsmNumber: mask(obj.buyer.gsmNumber), registrationAddress: '***', ip: '***' } : undefined,
            shippingAddress: obj?.shippingAddress ? { ...obj.shippingAddress, address: '***' } : undefined,
            billingAddress: obj?.billingAddress ? { ...obj.billingAddress, address: '***' } : undefined,
        });
        if (debugEnabled) console.warn('İyzico Payment Request Started');

        interface IyzicoPaymentRequestData {
            amount?: number | string;
            cartItems?: Array<{ product_id: string; quantity: number; price?: number }>;
            /**
             * YETKİ KAYNAĞI DEĞİL. Sipariş sahibi DAİMA doğrulanmış JWT'den (`caller.user.id`)
             * alınır; bu alan yalnız "istemci kendini kim sanıyor" tutarlılık kontrolüdür
             * (uyuşmazlıkta 403). Buradan okunup bir yere YAZILMAZ.
             */
            user_id?: string | null;
            invoiceInfo?: Record<string, unknown> | null;
            invoiceType?: string | null;
            legalConsents?: Record<string, unknown> | null;
            shippingMethod?: string | null;
            customerInfo?: { name?: string; email?: string; phone?: string } | null;
            customer?: { name?: string; email?: string; phone?: string } | null;
            shippingAddress?: { fullAddress: string; city: string; postalCode: string } | null;
            shipping?: { fullAddress: string; city: string; postalCode: string } | null;
            shipping_address?: { fullAddress: string; city: string; postalCode: string } | null;
            billingAddress?: { fullAddress: string; city: string; postalCode: string } | null;
            billing?: { fullAddress: string; city: string; postalCode: string } | null;
            billing_address?: { fullAddress: string; city: string; postalCode: string } | null;
            couponCode?: string | null;
        }

        // Parse request body safely
        let requestData: IyzicoPaymentRequestData | null = null;
        try {
            const bodyText = await req.text();
            if (!bodyText || bodyText.trim().length === 0) {
                return new Response(JSON.stringify({
                    error: { code: 'VALIDATION_ERROR', message: 'İstek gövdesi boş olamaz' }
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
                });
            }
            requestData = JSON.parse(bodyText);
        } catch (e) {
            return new Response(JSON.stringify({
                error: { code: 'VALIDATION_ERROR', message: 'Geçersiz JSON formatı', details: e instanceof Error ? e.message : String(e) }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        // ── Kimlik kapısı (cetvel §3.2 / §3.3) ─────────────────────────────────────
        // `resolveCaller` içinde `auth.getUser(<token>)` **tek kez** çağrılır — token açıkça
        // geçirilir, çünkü argümansız `getUser()` edge'de oturum deposu olmadığı için DAİMA
        // 401 verir (§3.3). Rol ve tenant AYNI `user_profiles` satırından, filtresi YALNIZ
        // doğrulanmış `id` olan tek sorguyla okunur; yani bu dosyada ikinci bir Auth ya da
        // profil round-trip'i YOKTUR.
        //
        // Gövde bilerek GEÇİLMİYOR (`resolveCaller(req)`): burası saf sınıf (a). Tek üretim
        // çağıranı `src/hooks/useCheckoutPayment.ts`; service_role ile çağıran bir kardeş uç
        // yok. Gövdeyi geçseydik service_role dalı gövdedeki `tenant_id`'yi kabul ederdi —
        // bu uçta böyle bir çağıran olmadığı için o yüzeyi hiç açmıyoruz.
        let caller: CallerContext | null = null
        try {
            caller = await resolveCaller(req)
        } catch (e) {
            if (e instanceof TenantMismatchError) {
                // Doğrulanmış `app_metadata.tenant_id` claim'i profil satırıyla çelişiyor.
                // UUID'ler YALNIZ log'a yazılır; cevap gövdesine kopyalanmaz (tenant.ts sözleşmesi).
                console.error('iyzico-payment tenant_mismatch:', requestId, e.profileTenantId, e.claimTenantId)
                return new Response(JSON.stringify({
                    error: { code: 'FORBIDDEN', message: 'Tenant doğrulanamadı' }
                }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
                });
            }
            if (e instanceof CallerConfigError || e instanceof CallerLookupError) {
                // Fail-closed: profil sorgusu HATA verdiyse (satır yok değil) tenant'ı
                // "bilinmiyor" sayıp varsayılana düşmek kullanıcıyı YANLIŞ tenant'a yazardı.
                console.error('iyzico-payment caller resolution failed:', requestId, e.message)
                return new Response(JSON.stringify({
                    error: { code: 'CONFIG_ERROR', message: 'Sunucu yapılandırma hatası' }
                }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
                });
            }
            throw e
        }

        // Authorization başlığı yok, JWT geçersiz, ya da yalnız anon key gönderilmiş
        // (`resolveCaller` bu üçünü de `kind: 'anon'` olarak döndürür) → 401.
        // `service_role` de burada reddedilir: bu uç sınıf (a)'dır, sipariş sahibi bir
        // KULLANICI olmak zorundadır.
        if (caller.kind !== 'user' || !caller.user) {
            return new Response(JSON.stringify({
                error: { code: 'UNAUTHORIZED', message: 'Oturum doğrulanamadı' }
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        // Sipariş sahibi ve tenant: ikisi de DOĞRULANMIŞ kimlikten. İstekten değil.
        const user_id = caller.user.id
        const tenantId = caller.tenantId

        // Gövdedeki `user_id` artık yalnız TUTARLILIK kontrolüdür.
        // Neden "yok say" değil de 403: meşru istemci ya kendi oturumunun id'sini gönderir
        // ya da (oturum context'i henüz hidrate olmadıysa) `null` gönderir — ikisi de
        // aşağıdaki koşulu tetiklemez. DOLU ve FARKLI bir değer üreten tek senaryo
        // taahhüt-uyuşmazlığıdır (başkası adına sipariş denemesi ya da istemcide oturum
        // karışması); ikisini de sessizce doğru id'ye çevirmek gerçek hatayı gizlerdi.
        const claimedUserId = typeof requestData?.user_id === 'string' ? requestData.user_id.trim() : ''
        if (claimedUserId.length > 0 && claimedUserId !== user_id) {
            console.error('iyzico-payment identity_mismatch:', requestId, user_id, claimedUserId)
            return new Response(JSON.stringify({
                error: { code: 'FORBIDDEN', message: 'Kimlik uyuşmazlığı' }
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        const amount = requestData?.amount
        const cartItems = requestData?.cartItems
        const invoiceInfo = requestData?.invoiceInfo
        const invoiceType = requestData?.invoiceType
        const legalConsents = requestData?.legalConsents
        const shippingMethod = requestData?.shippingMethod

        // Coalesce customer/shipping/billing from alternative keys and apply fallbacks
        let ci = requestData?.customerInfo || requestData?.customer || {}
        let shipAddr = requestData?.shippingAddress || requestData?.shipping || requestData?.shipping_address || null
        const billAddr = requestData?.billingAddress || requestData?.billing || requestData?.billing_address || null
        if (!shipAddr && billAddr) shipAddr = billAddr
        if (!ci?.name || String(ci.name).trim().length === 0) {
            const emailStr = String(ci?.email || '')
            const prefix = emailStr.includes('@') ? emailStr.split('@')[0] : 'Musteri'
            ci = { ...(ci || {}), name: prefix }
        }

        // Validate required fields (relaxed): amount/cartItems optional; we derive authoritative items/total below
        if (!(ci?.email) || !(shipAddr?.fullAddress)) {
            const missing = [!ci?.email ? 'email' : null, !shipAddr?.fullAddress ? 'shipping.fullAddress' : null].filter(Boolean)
            return new Response(JSON.stringify({
                error: { code: 'VALIDATION_ERROR', message: 'Eksik alanlar', details: missing }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        // Environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            return new Response(JSON.stringify({
                error: { code: 'CONFIG_ERROR', message: 'Sunucu yapılandırma hatası' }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        // Authoritative server-side validation (prices + stock)
        let authoritativeItems: Array<{ product_id: string; quantity: number; unit_price: number; price_list_id: string | null }> = []
        let authoritativeTotalNum: number = typeof amount === 'number' ? Number(amount) : 0
        try {
            const vHeaders = {
                'Authorization': `Bearer ${serviceRoleKey as string}`,
                'apikey': serviceRoleKey as string,
                'Content-Type': 'application/json'
            } as Record<string, string>;
            const vResp = await fetch(`${supabaseUrl}/functions/v1/order-validate`, {
                method: 'POST',
                headers: vHeaders,
                body: JSON.stringify({ user_id })
            });
            if (vResp.ok) {
                interface StockIssue { product_id: string; required: number; available: number }
                interface ValidationResponse {
                    stock_issues?: StockIssue[];
                    mismatches?: unknown[];
                    items?: { product_id: string; quantity: number; unit_price: number; price_list_id: string | null }[];
                    totals?: { subtotal: number };
                }
                const validation = await vResp.json().catch(() => ({})) as ValidationResponse;
                const stockIssues = Array.isArray(validation?.stock_issues) ? validation.stock_issues : [];
                const _mismatches = Array.isArray(validation?.mismatches) ? validation.mismatches : [];
                // Eski davranış: 409 döndürüp akışı durdurmak. Yeni davranış: sunucu otoritesini uygula ve devam et.
                if ((stockIssues && stockIssues.length > 0)) {
                    // Stok problemi varsa yine durdur (kullanıcı müdahalesi gerekir)
                    return new Response(JSON.stringify({ error: { code: 'VALIDATION_STOCK', message: 'Stock issue', stock_issues: stockIssues } }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                // Fiyat uyuşmazlığında: authoritativeItems ve subtotal ile devam et (ödeme bloklanmasın)
                authoritativeItems = Array.isArray(validation?.items) ? (validation.items || []) : []
                if (validation?.totals?.subtotal != null) {
                    authoritativeTotalNum = Number(validation.totals.subtotal)
                }
            }
        } catch {
            // fallback to client-requested cartItems
        }
        if (authoritativeItems.length === 0 && Array.isArray(cartItems)) {
            authoritativeItems = (cartItems as Array<{ product_id: string; quantity: number; price?: number }>)
                .map((ci) => ({ product_id: ci.product_id, quantity: ci.quantity, unit_price: Number(ci.price ?? 0), price_list_id: null }))
            authoritativeTotalNum = authoritativeItems.reduce((s, it) => s + Number(it.unit_price) * Number(it.quantity), 0)
        }

        // İyzico credentials (Environment)
        const iyzicoApiKey = Deno.env.get('IYZICO_API_KEY');
        const iyzicoSecretKey = Deno.env.get('IYZICO_SECRET_KEY');
        const iyzicoBaseUrl = Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';

        if (!iyzicoApiKey || !iyzicoSecretKey) {
            return new Response(JSON.stringify({
                error: { code: 'CONFIG_ERROR', message: 'IYZICO_API_KEY / IYZICO_SECRET_KEY eksik' }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': requestId }
            });
        }

        // Maskeli anahtar logu (güvenli): ilk 6 + … + son 4
        const maskKey = (k?: string | null) => {
            if (!k) return '(missing)';
            const s = String(k);
            if (s.length <= 10) return s;
            return s.slice(0, 6) + '…' + s.slice(-4);
        };
        if (debugEnabled) console.warn('Iyzico keys (masked):', maskKey(iyzicoApiKey), maskKey(iyzicoSecretKey));

        // Generate unique identifiers
        const orderId = `VH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const conversationId = `CONV-${Date.now()}`;

        // Frontend origin for redirect after callback (if available)
        let clientOrigin = req.headers.get('origin') || '';
        if (!clientOrigin) {
            const ref = req.headers.get('referer') || '';
            try { clientOrigin = ref ? new URL(ref).origin : ''; } catch { clientOrigin = ''; }
        }
        if (!clientOrigin) {
            const envOrigin = (Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '').trim();
            if (envOrigin) {
                try { clientOrigin = new URL(envOrigin).origin; } catch { clientOrigin = envOrigin.replace(/\/$/, ''); }
            }
        }

        // Resolve client IP from headers
        const forwarded = req.headers.get('x-forwarded-for') || '';
        const realIp = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || (forwarded.split(',')[0]?.trim() || '');

        if (debugEnabled) console.warn('Order ID:', orderId);

        // Create order in database
        // Not: venthub_orders.id NOT NULL ise, burada UUID oluşturup gönderiyoruz.
        const dbGeneratedId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const orderData = {
            id: dbGeneratedId,
            // Doğrulanmış JWT'den; `|| null` fallback'i KALDIRILDI — kimlik kapısı geçilmeden
            // buraya gelinemez, dolayısıyla sahipsiz sipariş satırı da üretilemez.
            user_id: user_id,
            conversation_id: conversationId,
            // order_number kolonu şemada yoksa göndermiyoruz; gerekirse ileride eklenir.
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
            coupon_discount: 0,
            tenant_id: tenantId
        };

        // Try creating order; if schema drift (shipping_method column missing), retry without it
        let orderResponse = await fetch(`${supabaseUrl}/rest/v1/venthub_orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey as string}`,
                'apikey': serviceRoleKey as string,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            // Fallback: remove shipping_method if column doesn't exist yet
            const mayRetry = /shipping_method/i.test(errorText) && /does not exist|column/i.test(errorText)
            if (mayRetry) {
                const { shipping_method: _shipping_method, ...withoutShipMethod } = orderData as Record<string, unknown>
                orderResponse = await fetch(`${supabaseUrl}/rest/v1/venthub_orders`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(withoutShipMethod)
                });
            } else {
                console.error('Order creation failed:', errorText);
            }
        }

        if (!orderResponse.ok) {
            try {
                const { slackNotify } = await import('../_shared/notify.ts')
                await slackNotify('DB error while creating order', [
                    { title: 'Request-Id', value: requestId, short: true },
                    { title: 'Status', value: String(orderResponse.status), short: true },
                ])
            } catch { }
            return new Response(JSON.stringify({
                error: { code: 'DATABASE_ERROR', message: 'Sipariş oluşturulamadı' }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const createdOrders = await orderResponse.json().catch(() => null);
        const dbOrderId = (Array.isArray(createdOrders) && createdOrders[0]?.id) ? createdOrders[0].id: dbGeneratedId;

        if (debugEnabled) console.warn('✅ Order created successfully with id:', dbOrderId);


        // Create order items (order_id olarak veritabanındaki gerçek id kullanılır) using authoritative items
        // Fetch product metadata for snapshots
        const ids = authoritativeItems.map((it) => it.product_id)
        const uniqIds = Array.from(new Set(ids))
        // F5-B D4: products.image_url kolonu DROP edildi — select listesine geri ekleme
        // (PostgREST bilinmeyen kolonda TUM sorguyu 400 ile reddeder, prodMap bos kalir).
        // Gorsel snapshot'i client-side imageMap'ten gelir; ad/SKU sunucudan dogrulanir.
        let prodMap = new Map<string, { id: string; name?: string; sku?: string }>()
        try {
            if (uniqIds.length > 0) {
                const pRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,sku&id=in.(${uniqIds.map(encodeURIComponent).join(',')})`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                })
                if (pRes.ok) {
                    const rows = await pRes.json().catch(() => [])
                    if (Array.isArray(rows)) {
                        prodMap = new Map((rows as Array<{ id: string; name?: string; sku?: string }>).map((p) => [p.id, p]))
                    }
                }
            }
        } catch { }

        // Fallback name/image maps from client cart (in case product metadata is missing)
        const nameMap = new Map<string, string>()
        const imageMap = new Map<string, string | null>()
        try {
            if (Array.isArray(cartItems)) {
                for (const ci of cartItems as Array<{ product_id: string; product_name?: string; product_image_url?: string | null }>) {
                    if (ci?.product_id) {
                        if (ci.product_name) nameMap.set(String(ci.product_id), String(ci.product_name))
                        if (ci.product_image_url !== undefined) imageMap.set(String(ci.product_id), ci.product_image_url as string | null)
                    }
                }
            }
        } catch { }

        // Şema uyumlu kolonlar: order_id, product_id, product_name, unit_price, quantity, total_price,
        // opsiyonel: price_at_time, product_image_url
        const orderItems = authoritativeItems.map((raw) => {
            const _productId = raw.product_id
            const unitPrice = Number(raw.unit_price)
            const qty = Math.max(1, Number(raw.quantity ?? 1))
            const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0
            const p = _productId ? (prodMap.get(_productId) as Record<string, unknown> || {}) : {};
            const fid = String(_productId || '')
            const fallbackName = (p.name as string) || nameMap.get(fid) || 'Ürün';
            const fallbackImage = imageMap.get(fid) || null;
            return {
                order_id: dbOrderId,
                product_id: _productId,
                product_name: fallbackName,
                unit_price: safeUnit,
                quantity: qty,
                total_price: safeUnit * qty,
                price_at_time: safeUnit,
                product_image_url: fallbackImage,
                tenant_id: tenantId
            }
        });

        // Insert order items ve sonucu kontrol et; başarısızsa işlemi durdur
        const itemsResp = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderItems)
        });
        if (!itemsResp.ok) {
            const errTxt = await itemsResp.text().catch(() => '')
            console.error('Order items insert failed:', itemsResp.status, errTxt)
            return new Response(JSON.stringify({ error: { code: 'DATABASE_ERROR', message: 'Sipariş kalemleri eklenemedi' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // İyzico checkout form initialize request
        // Fiyat tutarlılığı: price == basketItems toplamı olmalı, paidPrice >= price olabilir.
        const to2 = (n: number) => Number(Number(n).toFixed(2))
        const toCents = (n: number) => Math.round(Number(n) * 100)
        const basketItems = authoritativeItems.map((item) => ({
            id: item.product_id,
            name: (typeof prodMap.get === 'function' ? (prodMap.get(item.product_id)?.name) : undefined) || 'Ürün',
            category1: 'HVAC',
            category2: 'Products',
            itemType: 'PHYSICAL',
            price: to2(Number(item.unit_price) * Number(item.quantity)).toFixed(2)
        }));
        // Toplamı kuruş bazında hesapla ve her iki alana da aynı değeri yaz
        const subtotalCents = authoritativeItems.reduce((s: number, it) => s + toCents(Number(it.unit_price)) * Number(it.quantity), 0)
        const normalizedTotal = subtotalCents / 100
        const itemsTotal = normalizedTotal
        const paidPriceNumber = normalizedTotal

        const callbackBase = Deno.env.get('IYZICO_CALLBACK_URL') || (() => {
            const su = Deno.env.get('SUPABASE_URL') || ''
            try {
                const host = new URL(su).host // tnofewwkwlyjsqgwjjga.supabase.co
                const projectRef = host.split('.')[0]
                return `https://${projectRef}.functions.supabase.co/iyzico-callback`
            } catch {
                return ''
            }
        })();
        if (!callbackBase) {
            return new Response(JSON.stringify({ error: { code: 'CONFIG_ERROR', message: 'Callback URL çözümlenemedi' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        const successUrl = clientOrigin ? `${clientOrigin}/payment-success` : '';
        const callbackUrlWithParams = `${callbackBase}?orderId=${encodeURIComponent(dbOrderId)}&conversationId=${encodeURIComponent(conversationId)}${successUrl ? `&successUrl=${encodeURIComponent(successUrl)}` : ''}`;
        const iyzicoRequest: {
            locale: string; conversationId: string; price: string; paidPrice: string; currency: string;
            basketId: string; paymentGroup: string; paymentChannel: string; callbackUrl: string;
            enabledInstallments: number[];
            buyer: { id: string; name: string; surname: string; gsmNumber: string; email: string; identityNumber: string; lastLoginDate: string; registrationDate: string; registrationAddress: string; ip: string; city: string; country: string; zipCode: string };
            shippingAddress: { contactName: string; city: string; country: string; address: string; zipCode: string };
            billingAddress: { contactName: string; city: string; country: string; address: string; zipCode: string };
            basketItems: Array<{ id: string; name: string; category1: string; category2: string; itemType: string; price: string }>;
        } = {
            locale: 'tr',
            conversationId: conversationId,
            price: itemsTotal.toFixed(2),
            paidPrice: paidPriceNumber.toFixed(2),
            currency: 'TRY',
            basketId: orderId,
            paymentGroup: 'PRODUCT',
            paymentChannel: 'WEB',
            callbackUrl: callbackUrlWithParams,
            enabledInstallments: [1, 2, 3, 6, 9, 12],
            buyer: {
                // `'guest_' + Date.now()` dalı SİLİNDİ. Ulaşılamazdı (eski kodda da bir satır
                // yukarıda `if (!user_id) → 400` vardı) ve bir "misafir ödeme" akışını temsil
                // etmiyordu: her istekte DEĞİŞEN bir alıcı kimliği üretiyordu, yani İyzico
                // tarafında hiçbir işe yaramayan sahte bir sabitti. Ölçüm de destekliyor:
                // prod'da `venthub_orders` 0 satır — kıracak canlı misafir akışı yok.
                // Misafir ödeme gerçekten istenirse bu, sınıf beyanını değiştiren AYRI bir
                // tasarım kararıdır (anonim oturum ya da ayrı bir uç), sessiz bir fallback değil.
                id: user_id,
                name: (ci.name || '').split(' ')[0] || 'Ad',
                surname: (ci.name || '').split(' ').slice(1).join(' ') || 'Soyad',
                gsmNumber: (() => { const raw = ci.phone || '+905555555555'; const digits = raw.replace(/\s+/g, ''); return digits.startsWith('+') ? digits : ('+' + digits.replace(/[^0-9]/g, '')); })(),
                email: ci.email,
                identityNumber: '11111111110',
                lastLoginDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
                registrationDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
                registrationAddress: shipAddr.fullAddress,
                ip: realIp || '85.34.78.112',
                city: shipAddr.city,
                country: 'Turkey',
                zipCode: shipAddr.postalCode
            },
            shippingAddress: {
                contactName: ci.name || '',
                city: shipAddr.city,
                country: 'Turkey',
                address: shipAddr.fullAddress,
                zipCode: shipAddr.postalCode
            },
            billingAddress: {
                contactName: ci.name || '',
                city: (billAddr || shipAddr).city,
                country: 'Turkey',
                address: (billAddr || shipAddr).fullAddress,
                zipCode: (billAddr || shipAddr).postalCode
            },
            basketItems
        };

        if (debugEnabled) console.warn('İyzico Request:', JSON.stringify(sanitize(iyzicoRequest), null, 2));

        // İyzipay Node SDK ile isteği yap
        type IyziStatic = { PAYMENT_CHANNEL?: { WEB: string }, BASKET_ITEM_TYPE?: { PHYSICAL: string } }
        const IYZI = Iyzipay as unknown as IyziStatic
        type IyziSdk = { checkoutFormInitialize: { create: (req: Record<string, unknown>, cb: (err: unknown, res: { status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }) => void) => void } }
        const IyziCtor = Iyzipay as unknown as { new(args: { apiKey: string; secretKey: string; uri: string }): IyziSdk }
        const sdk = new IyziCtor({ apiKey: iyzicoApiKey, secretKey: iyzicoSecretKey, uri: iyzicoBaseUrl });

        const sdkRequest: Record<string, unknown> = {
            locale: iyzicoRequest.locale,
            conversationId: iyzicoRequest.conversationId,
            price: iyzicoRequest.price,
            paidPrice: iyzicoRequest.paidPrice,
            currency: iyzicoRequest.currency,
            basketId: iyzicoRequest.basketId,
            paymentGroup: iyzicoRequest.paymentGroup,
            paymentChannel: IYZI.PAYMENT_CHANNEL?.WEB ?? 'WEB',
            callbackUrl: iyzicoRequest.callbackUrl,
            enabledInstallments: iyzicoRequest.enabledInstallments,
            buyer: iyzicoRequest.buyer,
            shippingAddress: iyzicoRequest.shippingAddress,
            billingAddress: iyzicoRequest.billingAddress,
            basketItems: iyzicoRequest.basketItems.map((it) => ({
                id: it.id,
                name: it.name,
                category1: it.category1,
                category2: it.category2,
                itemType: IYZI.BASKET_ITEM_TYPE?.PHYSICAL ?? 'PHYSICAL',
                price: it.price,
            })),
        };

        const iyzicoResult = await new Promise<{ status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }>((resolve, reject) => {
            sdk.checkoutFormInitialize.create(sdkRequest, (err: unknown, res: { status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }) => {
                if (err) return reject(err);
                resolve(res);
            });
        });

        if (debugEnabled) console.warn('İyzico Result:', { status: iyzicoResult?.status, hasToken: !!iyzicoResult?.token, hasPaymentPageUrl: !!iyzicoResult?.paymentPageUrl });
        if (iyzicoResult && iyzicoResult.status === 'success' && (iyzicoResult.checkoutFormContent || iyzicoResult.paymentPageUrl || iyzicoResult.token)) {
            if (debugEnabled) console.warn('✅ İyzico checkout form created successfully');

            // Minimal token saklama: reconcile için yeterli.
            try {
                if (iyzicoResult.token) {
                    await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(dbOrderId)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ payment_token: iyzicoResult.token })
                    })
                }
            } catch (_e) {
                const msg = _e instanceof Error ? _e.message : String(_e ?? '')
                console.warn('payment_data token patch skipped:', msg)
            }

            return new Response(JSON.stringify({
                data: {
                    status: 'success',
                    orderId: dbOrderId,
                    orderNumber: orderId,
                    conversationId: conversationId,
                    checkoutFormContent: iyzicoResult.checkoutFormContent,
                    paymentPageUrl: iyzicoResult.paymentPageUrl,
                    token: iyzicoResult.token,
                    amount: Number(paidPriceNumber.toFixed(2)),
                    currency: 'TRY'
                }
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            console.error('İyzico checkout form creation failed:', iyzicoResult);
            try {
                const { slackNotify } = await import('../_shared/notify.ts')
                await slackNotify('İyzico checkout form creation failed', [
                    { title: 'Request-Id', value: requestId, short: true },
                    { title: 'Details', value: String(iyzicoResult?.errorMessage || 'unknown'), short: false },
                ])
            } catch { }

            return new Response(JSON.stringify({
                error: {
                    code: 'IYZICO_FORM_ERROR',
                    message: 'İyzico ödeme formu oluşturulamadı',
                    details: iyzicoResult.errorMessage || 'Bilinmeyen hata'
                }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        if (debugEnabled) console.error('Critical Error:', error);
        try {
            const { slackNotify } = await import('../_shared/notify.ts')
            const errMsg = error instanceof Error ? error.message : String(error)
            await slackNotify('iyzico-payment crashed', [
                { title: 'Request-Id', value: requestId, short: true },
                { title: 'Error', value: errMsg, short: false },
            ])
        } catch { }

        return new Response(JSON.stringify({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Sunucu hatası oluştu',
                details: error instanceof Error ? error.message : String(error)
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
