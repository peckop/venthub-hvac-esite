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
        const { amount, cartItems, customerInfo, shippingAddress, billingAddress, user_id } = requestData;

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
            total_amount: parseFloat(amount.toFixed(2)),
            shipping_address: shippingAddress,
            billing_address: billingAddress || shippingAddress,
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone || null,
            payment_method: 'iyzico',
            status: 'pending'
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

        // Create order items (order_id olarak veritabanındaki gerçek id kullanılır)
        const orderItems = cartItems.map(item => ({
            order_id: dbOrderId,
            product_id: item.product_id,
            quantity: parseInt(item.quantity),
            price_at_time: parseFloat(item.price),
            product_name: item.product_name,
            product_image_url: item.product_image_url || null
        }));

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
        const basketItems = cartItems.map((item: any) => ({
            id: item.product_id,
            name: item.product_name,
            category1: 'HVAC',
            category2: 'Products',
            itemType: 'PHYSICAL',
            price: (Number(item.price) * Number(item.quantity)).toFixed(2)
        }));
        const itemsTotal = Number(basketItems.reduce((sum: number, it: any) => sum + Number(it.price), 0).toFixed(2));
        // KDV dahil fiyatlar: iyzico'ya price ve paidPrice olarak toplamdaki brüt tutarı (amount) gönderiyoruz
        const requestedAmount = typeof amount === 'number' ? Number(amount) : Number((amount || 0));
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
                ip: realIp || undefined,
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
                    amount: parseFloat(amount.toFixed(2)),
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
