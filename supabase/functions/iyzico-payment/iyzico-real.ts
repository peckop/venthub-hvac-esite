// İyzico Real API Integration
// Bu dosyayı edge function'a entegre etmek için hazırlandı

interface IyzicoRequest {
    locale: string;
    conversationId: string;
    price: string;
    paidPrice: string;
    currency: string;
    basketId: string;
    paymentGroup: string;
    callbackUrl: string;
    enabledInstallments: number[];
    buyer: {
        id: string;
        name: string;
        surname: string;
        gsmNumber: string;
        email: string;
        identityNumber: string;
        lastLoginDate: string;
        registrationDate: string;
        registrationAddress: string;
        ip: string;
        city: string;
        country: string;
        zipCode: string;
    };
    shippingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode: string;
    };
    billingAddress: {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode: string;
    };
    basketItems: Array<{
        id: string;
        name: string;
        category1: string;
        category2: string;
        itemType: string;
        price: string;
    }>;
}

// HMAC-SHA256 signature creation for İyzico
async function createIyzicoSignature(requestBody: string, secretKey: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(requestBody));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Real İyzico Checkout Form API Call
export async function createIyzicoPayment(
    cartItems: any[], 
    customerInfo: any, 
    shippingAddress: any, 
    billingAddress: any,
    amount: number,
    orderId: string,
    conversationId: string,
    userId: string | null,
    origin: string
): Promise<any> {
    
    // Your real İyzico API keys
    const IYZICO_API_KEY = 'sandbox-Z5s0MwLxpgzXfKF1X1qzrpuVWNUcWKoU';
    const IYZICO_SECRET_KEY = 'sandbox-uFVuoDxfpeZqV1AwdSDeVVeApKJ25jfy';
    const IYZICO_BASE_URL = 'https://sandbox-api.iyzipay.com';
    
    console.log('🚀 Starting real İyzico payment with API key:', IYZICO_API_KEY);

    // Prepare İyzico payment request
    const iyzicoPaymentRequest: IyzicoRequest = {
        locale: 'tr',
        conversationId: conversationId,
        price: amount.toFixed(2),
        paidPrice: amount.toFixed(2),
        currency: 'TRY',
        basketId: orderId,
        paymentGroup: 'PRODUCT',
        callbackUrl: `${origin}/payment-success?orderId=${orderId}&conversationId=${conversationId}`,
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: userId || `guest_${Date.now()}`,
            name: customerInfo.name.split(' ')[0] || 'Test',
            surname: customerInfo.name.split(' ').slice(1).join(' ') || 'User',
            gsmNumber: customerInfo.phone || '+905350000000',
            email: customerInfo.email,
            identityNumber: customerInfo.identityNumber || '74300864791', // Default test TC
            lastLoginDate: new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationDate: new Date().toISOString().replace('T', ' ').split('.')[0],
            registrationAddress: shippingAddress.fullAddress || shippingAddress.address,
            ip: '85.34.78.112', // Default test IP
            city: shippingAddress.city,
            country: 'Turkey',
            zipCode: shippingAddress.postalCode || shippingAddress.zipCode
        },
        shippingAddress: {
            contactName: customerInfo.name,
            city: shippingAddress.city,
            country: 'Turkey',
            address: shippingAddress.fullAddress || shippingAddress.address,
            zipCode: shippingAddress.postalCode || shippingAddress.zipCode
        },
        billingAddress: {
            contactName: customerInfo.name,
            city: (billingAddress || shippingAddress).city,
            country: 'Turkey',
            address: (billingAddress || shippingAddress).fullAddress || (billingAddress || shippingAddress).address,
            zipCode: (billingAddress || shippingAddress).postalCode || (billingAddress || shippingAddress).zipCode
        },
        basketItems: cartItems.map((item, index) => ({
            id: item.product_id || `item_${index}`,
            name: item.product_name || item.name || `Ürün ${index + 1}`,
            category1: 'HVAC Equipment',
            category2: 'Industrial',
            itemType: 'PHYSICAL',
            price: (item.price * item.quantity).toFixed(2)
        }))
    };
    
    console.log('İyzico request prepared:', {
        conversationId: iyzicoPaymentRequest.conversationId,
        amount: iyzicoPaymentRequest.price,
        basketItemsCount: iyzicoPaymentRequest.basketItems.length,
        buyerEmail: iyzicoPaymentRequest.buyer.email,
        callbackUrl: iyzicoPaymentRequest.callbackUrl
    });
    
    // Create HMAC signature
    const requestString = JSON.stringify(iyzicoPaymentRequest);
    const signature = await createIyzicoSignature(requestString, IYZICO_SECRET_KEY);
    
    console.log('HMAC signature created, length:', signature.length);
    
    // Make İyzico API call
    try {
        console.log('🔄 Calling İyzico Checkout Form API...');
        const iyzicoResponse = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `IYZWS ${IYZICO_API_KEY}:${signature}`
            },
            body: requestString
        });
        
        console.log('İyzico API response status:', iyzicoResponse.status);
        
        const responseText = await iyzicoResponse.text();
        console.log('İyzico API response:', responseText);
        
        if (!iyzicoResponse.ok) {
            console.error('İyzico API HTTP error:', {
                status: iyzicoResponse.status,
                statusText: iyzicoResponse.statusText,
                response: responseText
            });
            throw new Error(`İyzico API error: ${iyzicoResponse.status} - ${responseText}`);
        }
        
        const iyzicoResult = JSON.parse(responseText);
        console.log('İyzico API success:', {
            status: iyzicoResult.status,
            paymentPageUrl: iyzicoResult.paymentPageUrl ? 'Present' : 'Missing',
            token: iyzicoResult.token ? 'Present' : 'Missing',
            errorCode: iyzicoResult.errorCode,
            errorMessage: iyzicoResult.errorMessage
        });
        
        if (iyzicoResult.status === 'success' && iyzicoResult.paymentPageUrl) {
            console.log('✅ İyzico payment successfully created!');
            return {
                success: true,
                data: {
                    status: 'success',
                    orderId: orderId,
                    conversationId: conversationId,
                    paymentPageUrl: iyzicoResult.paymentPageUrl,
                    token: iyzicoResult.token,
                    amount: parseFloat(amount.toFixed(2)),
                    currency: 'TRY',
                    mode: 'live',
                    timestamp: new Date().toISOString(),
                    demo: false
                }
            };
        } else {
            console.error('İyzico API returned error:', {
                status: iyzicoResult.status,
                errorCode: iyzicoResult.errorCode,
                errorMessage: iyzicoResult.errorMessage,
                errorGroup: iyzicoResult.errorGroup
            });
            throw new Error(iyzicoResult.errorMessage || 'İyzico ödeme başlatma hatası');
        }
        
    } catch (error) {
        console.error('İyzico integration failed:', error.message);
        throw error;
    }
}

// Test function to validate the integration
export function validateIyzicoConfig() {
    const apiKey = 'sandbox-Z5s0MwLxpgzXfKF1X1qzrpuVWNUcWKoU';
    const secretKey = 'sandbox-uFVuoDxfpeZqV1AwdSDeVVeApKJ25jfy';
    
    console.log('İyzico configuration validation:');
    console.log('✅ API Key format valid:', apiKey.startsWith('sandbox-'));
    console.log('✅ Secret Key format valid:', secretKey.startsWith('sandbox-'));
    console.log('✅ Using sandbox environment');
    
    return {
        apiKey: apiKey,
        secretKey: secretKey,
        baseUrl: 'https://sandbox-api.iyzipay.com',
        environment: 'sandbox'
    };
}
