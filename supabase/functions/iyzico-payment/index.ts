import Iyzipay from "npm:iyzipay";

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        console.log('İyzico Payment Request Started');

        // Parse request body
        const requestData = await req.json();
        const { amount, cartItems, customerInfo, shippingAddress, billingAddress, user_id, invoiceInfo, invoiceType, legalConsents } = requestData;

        // Validate required fields
        if (!amount || !cartItems?.length || !customerInfo?.name || !customerInfo?.email || !shippingAddress?.fullAddress) {
            return new Response(JSON.stringify({
                error: { code: 'VALIDATION_ERROR', message: 'Gerekli alanlar eksik' }
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
        let authoritativeItems: any[] = []
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
                const mismatches = Array.isArray(validation?.mismatches) ? validation.mismatches : [];
                if ((stockIssues && stockIssues.length > 0) || (mismatches && mismatches.length > 0)) {
                    return new Response(JSON.stringify({ error: { code: 'VALIDATION_CHANGED', message: 'Prices or stock changed', stock_issues: stockIssues, mismatches } }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                authoritativeItems = Array.isArray(validation?.items) ? validation.items : []
                if (validation?.totals?.subtotal != null) {
                    authoritativeTotalNum = Number(validation.totals.subtotal)
                }
            }
        } catch (_) {
            // fallback to client-requested cartItems
        }
        if (authoritativeItems.length === 0 && Array.isArray(cartItems)) {
            authoritativeItems = cartItems.map((ci: any) => ({ product_id: ci.product_id, quantity: ci.quantity, unit_price: Number(ci.price), price_list_id: null }))
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
        console.log('Iyzico keys (masked):', maskKey(iyzicoApiKey), maskKey(iyzicoSecretKey));

        // Generate unique identifiers
        const orderId = `VH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const conversationId = `CONV-${Date.now()}`;

        // Frontend origin for redirect after callback (if available)
        let clientOrigin = req.headers.get('origin') || '';
        if (!clientOrigin) {
            const ref = req.headers.get('referer') || '';
            try { clientOrigin = ref ? new URL(ref).origin : ''; } catch (_) { clientOrigin = ''; }
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

        console.log('Order ID:', orderId);

        // Create order in database
        // Not: venthub_orders.id NOT NULL ise, burada UUID oluşturup gönderiyoruz.
        const dbGeneratedId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const orderData = {
            id: dbGeneratedId,
            user_id: user_id || null,
            conversation_id: conversationId,
            // order_number kolonu şemada yoksa göndermiyoruz; gerekirse ileride eklenir.
            total_amount: Number(authoritativeTotalNum.toFixed(2)),
            subtotal_snapshot: Number(authoritativeTotalNum.toFixed(2)),
            shipping_address: shippingAddress,
            billing_address: billingAddress || shippingAddress,
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone || null,
            payment_method: 'iyzico',
            status: 'pending',
            invoice_type: invoiceType || null,
            invoice_info: invoiceInfo || null,
            legal_consents: legalConsents || null
        };

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/venthub_orders`, {
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
            console.error('Order creation failed:', errorText);
            return new Response(JSON.stringify({
                error: { code: 'DATABASE_ERROR', message: 'Sipariş oluşturulamadı' }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const createdOrders = await orderResponse.json().catch(() => null);
        const dbOrderId = (Array.isArray(createdOrders) && createdOrders[0]?.id) ? createdOrders[0].id : dbGeneratedId;

        console.log('✅ Order created successfully with id:', dbOrderId);

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
                        prodMap = new Map(rows.map((p: any) => [p.id, p]))
                    }
                }
            }
        } catch {}

        const orderItems = authoritativeItems.map((it: any) => {
            const p = prodMap.get(it.product_id) || {}
            return {
                order_id: dbOrderId,
                product_id: it.product_id,
                quantity: parseInt(it.quantity),
                price_at_time: parseFloat(it.unit_price),
                product_name: p.name || null,
                product_image_url: p.image_url || null,
                // snapshots
                unit_price_snapshot: parseFloat(it.unit_price),
                price_list_id_snapshot: it.price_list_id || null,
                product_name_snapshot: p.name || null,
                product_sku_snapshot: p.sku || null
            }
        });

        await fetch(`${supabaseUrl}/rest/v1/venthub_order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderItems)
        });

        // İyzico checkout form initialize request
        // Fiyat tutarlılığı: price == basketItems toplamı olmalı, paidPrice >= price olabilir.
        const basketItems = authoritativeItems.map((item: any) => ({
            id: item.product_id,
            name: (typeof prodMap.get === 'function' ? (prodMap.get(item.product_id)?.name) : undefined) || 'Ürün',
            category1: 'HVAC',
            category2: 'Products',
            itemType: 'PHYSICAL',
            price: (Number(item.unit_price) * Number(item.quantity)).toFixed(2)
        }));
        const itemsTotal = Number(basketItems.reduce((sum: number, it: any) => sum + Number(it.price), 0).toFixed(2));
        // KDV dahil fiyatlar: iyzico'ya price ve paidPrice olarak toplamdaki brüt tutarı (authoritative) gönderiyoruz
        const requestedAmount = Number(authoritativeTotalNum);
        const paidPriceNumber = isNaN(requestedAmount) ? itemsTotal : Number(requestedAmount.toFixed(2));

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
        const iyzicoRequest = {
            locale: 'tr',
            conversationId: conversationId,
            price: paidPriceNumber.toFixed(2),
            paidPrice: paidPriceNumber.toFixed(2),
            currency: 'TRY',
            basketId: orderId,
            paymentGroup: 'PRODUCT',
            paymentChannel: 'WEB',
            callbackUrl: callbackUrlWithParams,
            enabledInstallments: [1, 2, 3, 6, 9, 12],
            buyer: {
                id: user_id || 'guest_' + Date.now(),
                name: customerInfo.name.split(' ')[0] || 'Ad',
                surname: customerInfo.name.split(' ').slice(1).join(' ') || 'Soyad',
                gsmNumber: (() => { const raw = customerInfo.phone || '+905555555555'; const digits = raw.replace(/\s+/g,''); return digits.startsWith('+') ? digits : ('+' + digits.replace(/[^0-9]/g,'')); })(),
                email: customerInfo.email,
                identityNumber: '11111111110',
                lastLoginDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
                registrationDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
                registrationAddress: shippingAddress.fullAddress,
                ip: realIp || '85.34.78.112',
                city: shippingAddress.city,
                country: 'Turkey',
                zipCode: shippingAddress.postalCode
            },
            shippingAddress: {
                contactName: customerInfo.name,
                city: shippingAddress.city,
                country: 'Turkey',
                address: shippingAddress.fullAddress,
                zipCode: shippingAddress.postalCode
            },
            billingAddress: {
                contactName: customerInfo.name,
                city: (billingAddress || shippingAddress).city,
                country: 'Turkey',
                address: (billingAddress || shippingAddress).fullAddress,
                zipCode: (billingAddress || shippingAddress).postalCode
            },
            basketItems
        };

        console.log('İyzico Request:', JSON.stringify(iyzicoRequest, null, 2));

        // İyzipay Node SDK ile isteği yap
        const debugEnabled = (Deno.env.get('IYZICO_DEBUG') || '').toLowerCase() === 'true';

        const sdk = new (Iyzipay as any)({
            apiKey: iyzicoApiKey,
            secretKey: iyzicoSecretKey,
            uri: iyzicoBaseUrl,
        });

        const sdkRequest: any = {
            locale: iyzicoRequest.locale,
            conversationId: iyzicoRequest.conversationId,
            price: iyzicoRequest.price,
            paidPrice: iyzicoRequest.paidPrice,
            currency: iyzicoRequest.currency,
            basketId: iyzicoRequest.basketId,
            paymentGroup: iyzicoRequest.paymentGroup,
            paymentChannel: (Iyzipay as any).PAYMENT_CHANNEL ? (Iyzipay as any).PAYMENT_CHANNEL.WEB : 'WEB',
            callbackUrl: iyzicoRequest.callbackUrl,
            enabledInstallments: iyzicoRequest.enabledInstallments,
            buyer: iyzicoRequest.buyer,
            shippingAddress: iyzicoRequest.shippingAddress,
            billingAddress: iyzicoRequest.billingAddress,
            basketItems: iyzicoRequest.basketItems.map((it: any) => ({
                id: it.id,
                name: it.name,
                category1: it.category1,
                category2: it.category2,
                itemType: (Iyzipay as any).BASKET_ITEM_TYPE ? (Iyzipay as any).BASKET_ITEM_TYPE.PHYSICAL : 'PHYSICAL',
                price: it.price,
            })),
        };

        const iyzicoResult = await new Promise<any>((resolve, reject) => {
            (sdk as any).checkoutFormInitialize.create(sdkRequest, (err: any, res: any) => {
                if (err) return reject(err);
                resolve(res);
            });
        });

        console.log('İyzico Result:', iyzicoResult);
        if (iyzicoResult && iyzicoResult.status === 'success' && (iyzicoResult.checkoutFormContent || iyzicoResult.paymentPageUrl || iyzicoResult.token)) {
            console.log('✅ İyzico checkout form created successfully');
            
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
                console.warn('payment_data token patch skipped:', (e as any)?.message)
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
