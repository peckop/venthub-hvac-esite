import Iyzipay from "npm:iyzipay";

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const url = new URL(req.url);
        const debugEnabled = ((Deno.env.get('IYZICO_DEBUG') || '').toLowerCase() === 'true')
          || (url.searchParams.get('debug') === '1')
          || ((req.headers.get('x-debug') || '') === '1');
        const mask = (s?: string) => typeof s === 'string' ? s.replace(/.(?=.{2})/g, '*') : s;
        const sanitize = (obj: Record<string, any>) => ({
            ...obj,
            buyer: obj?.buyer ? { ...obj.buyer, email: mask(obj.buyer.email), gsmNumber: mask(obj.buyer.gsmNumber), registrationAddress: '***', ip: '***' } : undefined,
            shippingAddress: obj?.shippingAddress ? { ...obj.shippingAddress, address: '***' } : undefined,
            billingAddress: obj?.billingAddress ? { ...obj.billingAddress, address: '***' } : undefined,
        });
        if (debugEnabled) console.log('İyzico Payment Request Started');

        // Parse request body
        const requestData = await req.json();
        const amount = requestData?.amount
        const cartItems = requestData?.cartItems
        const user_id = requestData?.user_id
        const invoiceInfo = requestData?.invoiceInfo
        const invoiceType = requestData?.invoiceType
        const legalConsents = requestData?.legalConsents
        const shippingMethod = requestData?.shippingMethod
        // Coalesce customer/shipping/billing from alternative keys and apply fallbacks
        let ci = requestData?.customerInfo || requestData?.customer || {}
        let shipAddr = requestData?.shippingAddress || requestData?.shipping || requestData?.shipping_address || null
        const billAddr = requestData?.billingAddress || requestData?.billing || requestData?.billing_address || null
        if (!shipAddr && billAddr) shipAddr = billAddr
        if (!ci?.name || String(ci.name).trim().length===0) {
            const emailStr = String(ci?.email || '')
            const prefix = emailStr.includes('@') ? emailStr.split('@')[0] : 'Musteri'
            ci = { ...(ci||{}), name: prefix }
        }

        // Validate required fields (relaxed): amount/cartItems optional; we derive authoritative items/total below
        if (!(ci?.email) || !(shipAddr?.fullAddress)) {
            const missing = [!ci?.email ? 'email' : null, !shipAddr?.fullAddress ? 'shipping.fullAddress' : null].filter(Boolean)
            return new Response(JSON.stringify({
                error: { code: 'VALIDATION_ERROR', message: 'Eksik alanlar', details: missing }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Authoritative server-side validation (prices + stock)
        let authoritativeItems: Array<{ product_id: string; quantity: number; unit_price: number; price_list_id: string | null }> = []
        let authoritativeTotalNum: number = typeof amount === 'number' ? Number(amount) : 0
        try {
            const vHeaders = {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            } as Record<string,string>;
            const vResp = await fetch(`${supabaseUrl}/functions/v1/order-validate`, {
                method: 'POST',
                headers: vHeaders,
                body: JSON.stringify({ user_id })
            });
            if (vResp.ok) {
                const validation = await vResp.json().catch(() => ({}));
                const stockIssues = Array.isArray(validation?.stock_issues) ? validation.stock_issues : [];
                const _mismatches = Array.isArray(validation?.mismatches) ? validation.mismatches : [];
                // Eski davranış: 409 döndürüp akışı durdurmak. Yeni davranış: sunucu otoritesini uygula ve devam et.
                if ((stockIssues && stockIssues.length > 0)) {
                    // Stok problemi varsa yine durdur (kullanıcı müdahalesi gerekir)
                    return new Response(JSON.stringify({ error: { code: 'VALIDATION_STOCK', message: 'Stock issue', stock_issues: stockIssues } }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                // Fiyat uyuşmazlığında: authoritativeItems ve subtotal ile devam et (ödeme bloklanmasın)
                authoritativeItems = Array.isArray(validation?.items) ? validation.items : []
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
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Maskeli anahtar logu (güvenli): ilk 6 + … + son 4
        const maskKey = (k?: string | null) => {
            if (!k) return '(missing)';
            const s = String(k);
            if (s.length <= 10) return s;
            return s.slice(0, 6) + '…' + s.slice(-4);
        };
        if (debugEnabled) console.log('Iyzico keys (masked):', maskKey(iyzicoApiKey), maskKey(iyzicoSecretKey));

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

        if (debugEnabled) console.log('Order ID:', orderId);

        // Create order in database
        // Not: venthub_orders.id NOT NULL ise, burada UUID oluşturup gönderiyoruz.
        const dbGeneratedId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const orderData = {
            id: dbGeneratedId,
            user_id: user_id || null,
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
            shipping_method: (typeof shippingMethod === 'string' && shippingMethod) ? shippingMethod : 'standard'
        };

        // Try creating order; if schema drift (shipping_method column missing), retry without it
        let orderResponse = await fetch(`${supabaseUrl}/rest/v1/venthub_orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
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
            return new Response(JSON.stringify({
                error: { code: 'DATABASE_ERROR', message: 'Sipariş oluşturulamadı' }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const createdOrders = await orderResponse.json().catch(() => null);
        const dbOrderId = (Array.isArray(createdOrders) && createdOrders[0]?.id) ? createdOrders[0].id : dbGeneratedId;

        if (debugEnabled) console.log('✅ Order created successfully with id:', dbOrderId);

        // Create order items (order_id olarak veritabanındaki gerçek id kullanılır) using authoritative items
        // Fetch product metadata for snapshots
        const ids = authoritativeItems.map((it: any) => it.product_id)
        const uniqIds = Array.from(new Set(ids))
        let prodMap = new Map<string, any>()
        try {
            if (uniqIds.length > 0) {
                const pRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,sku,image_url&id=in.(${uniqIds.map(encodeURIComponent).join(',')})`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                })
                if (pRes.ok) {
                    const rows = await pRes.json().catch(()=>[])
                    if (Array.isArray(rows)) {
                        prodMap = new Map((rows as Array<{ id: string; name?: string; sku?: string; image_url?: string | null }>).map((p) => [p.id, p]))
                    }
                }
            }
        } catch {}

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
        } catch {}

        // Şema uyumlu kolonlar: order_id, product_id, product_name, unit_price, quantity, total_price,
        // opsiyonel: price_at_time, product_image_url
        const orderItems = authoritativeItems.map((raw: any) => {
            const productId = raw.product_id ?? raw.productId
            const unitPrice = Number(raw.unit_price ?? raw.price)
            const qty = Math.max(1, Number(raw.quantity ?? 1))
            const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0
            const p = productId ? (prodMap.get(productId) || {}) : {}
            const fid = String(productId || '')
            const fallbackName = (p?.name) || nameMap.get(fid) || 'Ürün'
            const fallbackImage = (p?.image_url) || imageMap.get(fid) || null
            return {
                order_id: dbOrderId,
                product_id: productId,
                product_name: fallbackName,
                unit_price: safeUnit,
                quantity: qty,
                total_price: safeUnit * qty,
                price_at_time: safeUnit,
                product_image_url: fallbackImage,
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
            const errTxt = await itemsResp.text().catch(()=> '')
            console.error('Order items insert failed:', itemsResp.status, errTxt)
            return new Response(JSON.stringify({ error: { code: 'DATABASE_ERROR', message: 'Sipariş kalemleri eklenemedi' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // İyzico checkout form initialize request
        // Fiyat tutarlılığı: price == basketItems toplamı olmalı, paidPrice >= price olabilir.
        const to2 = (n:number)=> Number(Number(n).toFixed(2))
        const toCents = (n:number)=> Math.round(Number(n)*100)
        const basketItems = authoritativeItems.map((item: any) => ({
            id: item.product_id,
            name: (typeof prodMap.get === 'function' ? (prodMap.get(item.product_id)?.name) : undefined) || 'Ürün',
            category1: 'HVAC',
            category2: 'Products',
            itemType: 'PHYSICAL',
            price: to2(Number(item.unit_price) * Number(item.quantity)).toFixed(2)
        }));
        // Toplamı kuruş bazında hesapla ve her iki alana da aynı değeri yaz
        const subtotalCents = authoritativeItems.reduce((s:number, it:any)=> s + toCents(Number(it.unit_price)) * Number(it.quantity), 0)
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
                id: user_id || 'guest_' + Date.now(),
                name: (ci.name || '').split(' ')[0] || 'Ad',
                surname: (ci.name || '').split(' ').slice(1).join(' ') || 'Soyad',
                gsmNumber: (() => { const raw = ci.phone || '+905555555555'; const digits = raw.replace(/\s+/g,''); return digits.startsWith('+') ? digits : ('+' + digits.replace(/[^0-9]/g,'')); })(),
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
                contactName: ci.name,
                city: shipAddr.city,
                country: 'Turkey',
                address: shipAddr.fullAddress,
                zipCode: shipAddr.postalCode
            },
            billingAddress: {
                contactName: ci.name,
                city: (billAddr || shipAddr).city,
                country: 'Turkey',
                address: (billAddr || shipAddr).fullAddress,
                zipCode: (billAddr || shipAddr).postalCode
            },
            basketItems
        };

        if (debugEnabled) console.log('İyzico Request:', JSON.stringify(sanitize(iyzicoRequest), null, 2));

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

        if (debugEnabled) console.log('İyzico Result:', { status: iyzicoResult?.status, hasToken: !!iyzicoResult?.token, hasPaymentPageUrl: !!iyzicoResult?.paymentPageUrl });
        if (iyzicoResult && iyzicoResult.status === 'success' && (iyzicoResult.checkoutFormContent || iyzicoResult.paymentPageUrl || iyzicoResult.token)) {
            if (debugEnabled) console.log('✅ İyzico checkout form created successfully');
            
            // Minimal token saklama: reconcile için yeterli.
            try {
                if (iyzicoResult.token) {
                    await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(dbOrderId)}`, {
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
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e ?? '')
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
        console.error('Critical Error:', error);
        
        return new Response(JSON.stringify({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Sunucu hatası oluştu',
                details: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
