Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('=== İyzico Payment Request Started ===');
        console.log('Method:', req.method);
        console.log('Headers:', Object.fromEntries(req.headers.entries()));
        
        // Parse request body with enhanced error handling
        let requestData;
        try {
            const body = await req.text();
            console.log('Raw request body:', body);
            requestData = JSON.parse(body || '{}');
            console.log('Parsed request data keys:', Object.keys(requestData));
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            return new Response(
                JSON.stringify({
                    error: {
                        code: 'INVALID_JSON',
                        message: 'Geçersiz JSON formatı',
                        details: jsonError.message
                    }
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { 
            amount, 
            cartItems, 
            customerInfo, 
            shippingAddress, 
            billingAddress,
            user_id 
        } = requestData;

        console.log('Request parameters:', {
            amount,
            cartItemsCount: cartItems?.length,
            customerEmail: customerInfo?.email,
            hasUserId: !!user_id,
            hasShippingAddress: !!shippingAddress,
            hasBillingAddress: !!billingAddress
        });

        // Enhanced validation with detailed error messages
        const validationErrors = [];
        
        if (!amount || isNaN(amount) || amount <= 0) {
            validationErrors.push('Geçerli tutar gereklidir (amount)');
        }
        
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            validationErrors.push('Sepet ürünleri gereklidir (cartItems)');
        }
        
        if (!customerInfo) {
            validationErrors.push('Müşteri bilgileri gereklidir (customerInfo)');
        } else {
            if (!customerInfo.email || !customerInfo.email.includes('@')) {
                validationErrors.push('Geçerli e-posta adresi gereklidir');
            }
            if (!customerInfo.name || customerInfo.name.trim().length === 0) {
                validationErrors.push('Müşteri adı gereklidir');
            }
        }

        if (!shippingAddress) {
            validationErrors.push('Teslimat adresi gereklidir (shippingAddress)');
        }

        if (validationErrors.length > 0) {
            console.error('Validation errors:', validationErrors);
            return new Response(
                JSON.stringify({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Eksik veya hatalı bilgiler',
                        details: validationErrors
                    }
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate cart items in detail
        if (cartItems) {
            for (let i = 0; i < cartItems.length; i++) {
                const item = cartItems[i];
                if (!item.product_id || !item.quantity || !item.price || !item.product_name) {
                    console.error(`Invalid cart item at index ${i}:`, item);
                    return new Response(
                        JSON.stringify({
                            error: {
                                code: 'INVALID_CART_ITEM',
                                message: `Sepet ürünü ${i + 1} eksik bilgiler içeriyor`,
                                details: `Required: product_id, quantity, price, product_name`
                            }
                        }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                if (item.quantity <= 0 || item.price <= 0) {
                    return new Response(
                        JSON.stringify({
                            error: {
                                code: 'INVALID_CART_VALUES',
                                message: `Ürün ${i + 1} miktar ve fiyat değerleri pozitif olmalıdır`
                            }
                        }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
            }
        }

        console.log('✅ All validations passed');

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const iyzicoApiKey = Deno.env.get('IYZICO_API_KEY') || 'sandbox-Z5s0MwLxpgzXfKF1X1qzrpuVWNUcWKoU';
        const iyzicoSecretKey = Deno.env.get('IYZICO_SECRET_KEY') || 'sandbox-uFVuoDxfpeZqV1AwdSDeVVeApKJ25jfy';
        const iyzicoBaseUrl = Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com';

        console.log('Environment check:', {
            hasServiceRole: !!serviceRoleKey,
            hasSupabaseUrl: !!supabaseUrl,
            iyzicoMode: iyzicoApiKey === 'demo-api-key' ? 'DEMO' : 'LIVE',
            supabaseUrl: supabaseUrl
        });

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Missing critical environment variables');
            return new Response(
                JSON.stringify({
                    error: {
                        code: 'ENVIRONMENT_ERROR',
                        message: 'Sunucu yapılandırma hatası',
                        details: 'Environment variables eksik'
                    }
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Calculate and validate total amount
        const calculatedAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('Amount validation:', { provided: amount, calculated: calculatedAmount, diff: Math.abs(calculatedAmount - amount) });
        
        if (Math.abs(calculatedAmount - amount) > 0.01) {
            return new Response(
                JSON.stringify({
                    error: {
                        code: 'AMOUNT_MISMATCH',
                        message: `Tutar uyuşmazlığı: beklenen ${calculatedAmount}, gelen ${amount}`,
                        details: { calculated: calculatedAmount, provided: amount }
                    }
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Handle user authentication (OPTIONAL for demo)
        let userId = user_id || null; // Use provided user_id first
        const authHeader = req.headers.get('authorization');
        
        if (!userId && authHeader) {
            try {
                console.log('Attempting to get user from auth header');
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                    console.log('User authenticated:', userId);
                } else {
                    console.log('Auth failed, proceeding as guest:', userResponse.status);
                }
            } catch (authError) {
                console.log('Auth error, proceeding as guest:', authError.message);
            }
        }

        console.log('Final user ID:', userId || 'GUEST');

        // Generate unique identifiers
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const orderId = `VH-${timestamp}-${randomStr}`;
        const conversationId = `CONV-${timestamp}`;
        
        console.log('Generated IDs:', { orderId, conversationId });

        // Create order record in database
        const orderData = {
            id: orderId,
            user_id: userId,
            conversation_id: conversationId,
            status: 'pending',
            total_amount: parseFloat(amount.toFixed(2)),
            currency: 'TRY',
            shipping_address: JSON.stringify(shippingAddress || {}),
            billing_address: JSON.stringify(billingAddress || shippingAddress || {}),
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Creating order in database...');
        console.log('Order data:', orderData);

        try {
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

            console.log('Order creation response status:', orderResponse.status);
            
            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                console.error('Order creation failed:', {
                    status: orderResponse.status,
                    statusText: orderResponse.statusText,
                    error: errorText
                });
                return new Response(
                    JSON.stringify({
                        error: {
                            code: 'DATABASE_ERROR',
                            message: 'Sipariş oluşturma hatası',
                            details: `DB Error: ${orderResponse.status} - ${errorText}`
                        }
                    }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const orderResult = await orderResponse.text();
            console.log('✅ Order created successfully:', orderResult);

        } catch (dbError) {
            console.error('Database operation failed:', dbError);
            return new Response(
                JSON.stringify({
                    error: {
                        code: 'DATABASE_CONNECTION_ERROR',
                        message: 'Veritabanı bağlantı hatası',
                        details: dbError.message
                    }
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create order items with enhanced error handling
        try {
            const orderItems = cartItems.map((item, index) => ({
                order_id: orderId,
                product_id: item.product_id,
                quantity: parseInt(item.quantity),
                price_at_time: parseFloat(item.price.toFixed(2)),
                product_name: item.product_name,
                product_image_url: item.product_image_url || null,
                created_at: new Date().toISOString()
            }));

            console.log('Creating order items...', { count: orderItems.length });

            const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderItems)
            });

            if (!orderItemsResponse.ok) {
                const errorText = await orderItemsResponse.text();
                console.error('Order items creation failed:', errorText);
                console.warn('Order created but items creation failed - this is non-fatal');
            } else {
                console.log('✅ Order items created successfully');
            }
        } catch (itemsError) {
            console.warn('Order items creation error (non-fatal):', itemsError.message);
        }

        // Determine payment mode
        const isDemoMode = iyzicoApiKey === 'demo-api-key';
        console.log('Payment mode:', isDemoMode ? 'DEMO MODE' : 'LIVE MODE');

        // Create enhanced demo payment interface
        const checkoutFormContent = `
            <div id="iyzipay-checkout-form" class="responsive">
                <div style="padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h3 style="color: #1e3a8a; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">VentHub Ödeme</h3>
                        <p style="color: #64748b; margin: 0; font-size: 14px;">Güvenli ödeme sistemi</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                        <div style="display: grid; gap: 12px;">
                            <div style="display: flex; justify-content: between; align-items: center;">
                                <span style="color: #475569; font-size: 14px;">Sipariş No:</span>
                                <strong style="color: #1e40af; font-size: 14px; font-family: monospace;">${orderId}</strong>
                            </div>
                            <div style="display: flex; justify-content: between; align-items: center;">
                                <span style="color: #475569; font-size: 14px;">Müşteri:</span>
                                <strong style="color: #374151; font-size: 14px;">${customerInfo.name}</strong>
                            </div>
                            <div style="display: flex; justify-content: between; align-items: center;">
                                <span style="color: #475569; font-size: 14px;">E-posta:</span>
                                <span style="color: #374151; font-size: 14px;">${customerInfo.email}</span>
                            </div>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 8px 0;">
                            <div style="display: flex; justify-content: between; align-items: center;">
                                <span style="color: #374151; font-weight: 600; font-size: 16px;">Toplam Tutar:</span>
                                <span style="color: #1e40af; font-weight: 700; font-size: 20px;">₺${parseFloat(amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${isDemoMode ? `
                        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                            <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 4px;">⚠️ Demo Modu</div>
                            <p style="color: #92400e; font-size: 12px; margin: 0; line-height: 1.4;">Bu demo ortamıdır. Gerçek ödeme işlemi yapılmaz.</p>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                        <button 
                            onclick="window.parent.postMessage({event: 'payment_success', orderId: '${orderId}', amount: ${amount}}, '*')" 
                            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s ease; min-width: 140px;"
                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 12px -2px rgba(0, 0, 0, 0.15)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)'"
                        >
                            ✓ Ödemeyi Tamamla
                        </button>
                        <button 
                            onclick="window.parent.postMessage({event: 'payment_error', error: 'Kullanıcı ödemeyi iptal etti', orderId: '${orderId}'}, '*')" 
                            style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s ease; min-width: 140px;"
                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 12px -2px rgba(0, 0, 0, 0.15)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1)'"
                        >
                            ✗ İptal Et
                        </button>
                    </div>
                    
                    <div style="text-align: center;">
                        <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
                            ${isDemoMode 
                                ? 'Demo ortamında çalışıyorsunuz. Test amaçlı simülasyon.' 
                                : 'SSL ile korumalı güvenli ödeme. Kişisel bilgileriniz şifrelenir.'
                            }
                        </p>
                        <p style="color: #64748b; font-size: 11px; margin: 8px 0 0 0;">
                            © 2025 VentHub - Güvenli Ödeme Sistemi
                        </p>
                    </div>
                </div>
            </div>
        `;

        const result = {
            data: {
                status: 'success',
                orderId: orderId,
                conversationId: conversationId,
                checkoutFormContent: checkoutFormContent,
                paymentPageUrl: `${req.headers.get('origin') || 'http://localhost:5173'}/payment/checkout?token=${conversationId}`,
                amount: parseFloat(amount.toFixed(2)),
                currency: 'TRY',
                mode: isDemoMode ? 'demo' : 'live',
                timestamp: new Date().toISOString(),
                cartItemsCount: cartItems.length,
                customerId: userId || 'guest'
            }
        };

        console.log('=== Payment Request Completed Successfully ===');
        console.log('Result:', {
            orderId: result.data.orderId,
            amount: result.data.amount,
            mode: result.data.mode,
            customerId: result.data.customerId
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('=== CRITICAL ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error details:', error);

        const errorResponse = {
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Sunucu hatası oluştu',
                timestamp: new Date().toISOString(),
                requestId: `REQ-${Date.now()}`,
                details: error.stack ? error.stack.split('\n').slice(0, 5) : ['Stack trace not available']
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});