import Iyzipay from "npm:iyzipay";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  } as Record<string,string>;
  // İyzico callback istekleri Authorization header göndermez; 401'i engellemek için kendi CORS/anon kabulümüzü sağlar ve asla auth doğrulaması istemeyiz.

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
    // İsteğin JSON bekleyip beklemediğini tespit et (uygulama içi çağrılarda JSON döneceğiz)
    const accept = (req.headers.get('accept') || '').toLowerCase()
    const wantsJson = accept.includes('application/json') || !!req.headers.get('x-client-info')

    // İyzico callback'i çoğunlukla application/x-www-form-urlencoded (token=...) gönderir.
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let token: string | undefined;
    let conversationId: string | undefined;
    let orderId: string | undefined;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      token = String(form.get("token") || "");
      conversationId = form.get("conversationId")?.toString();
      orderId = form.get("orderId")?.toString();
    } else {
      const body = await req.json().catch(() => ({} as any));
      token = body?.token;
      conversationId = body?.conversationId;
      orderId = body?.orderId;
    }
    // URL query'den de parametre al (callbackUrl'e eklendi)
    let successUrl: string | null = null;
    try {
      const url = new URL(req.url);
      if (!orderId) orderId = url.searchParams.get('orderId') || undefined;
      if (!conversationId) conversationId = url.searchParams.get('conversationId') || undefined;
      successUrl = url.searchParams.get('successUrl');
    } catch (_) {}

    // Eğer successUrl yoksa, ortamdan türet (PUBLIC_SITE_URL/FRONTEND_URL/SITE_URL)
    if (!successUrl) {
      const base = (Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '').trim();
      if (base) {
        try {
          const origin = new URL(base).origin;
          successUrl = origin + '/payment-success';
        } catch {
          successUrl = base.replace(/\/$/, '') + '/payment-success';
        }
      }
    }

    if (!token) {
      // Fallback: orderId üzerinden payment_token'ı getir ve devam et
      if (orderId) {
        try {
          const got = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=payment_token`, {
            headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, apikey: `${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` }
          })
          const arr = await got.json().catch(()=>[])
          const row = Array.isArray(arr) ? arr[0] : null
          if (row?.payment_token) token = row.payment_token
        } catch (_) {}
      }
      if (!token) {
        // Token yine yoksa, uygulama çağrısı ise JSON, değilse frontend'e yönlendir (pending)
        if (wantsJson) {
          return new Response(JSON.stringify({ status: 'pending', reason: 'missing_token' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        } else if (successUrl) {
          try {
            const target = new URL(successUrl);
            if (orderId) target.searchParams.set('orderId', orderId);
            if (conversationId) target.searchParams.set('conversationId', conversationId);
            target.searchParams.set('status', 'pending');
            const t = target.toString();
            const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){location.href=${JSON.stringify(t)}};</script></body></html>`;
            return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
          } catch (_) {}
        }
        // Son çare
        return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const apiKey = Deno.env.get("IYZICO_API_KEY");
    const secretKey = Deno.env.get("IYZICO_SECRET_KEY");
    const baseUrl = "https://sandbox-api.iyzipay.com"; // isteğe göre prod ayarlanabilir

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !secretKey || !supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: { code: "CONFIG_ERROR", message: "Environment değişkenleri eksik" },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sdk = new (Iyzipay as any)({ apiKey, secretKey, uri: baseUrl });

    const retrieveReq: any = {
      locale: (Iyzipay as any).LOCALE ? (Iyzipay as any).LOCALE.TR : "tr",
      token,
    };
    if (conversationId) retrieveReq.conversationId = conversationId;

    // Token geldiyse hemen DB'ye yaz (denetim ve reconcile için)
    try {
      if (token && orderId) {
        await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ payment_token: token })
        })
      }
    } catch (_) {}

    let result: any | null = null;
    try {
      result = await new Promise<any>((resolve, reject) => {
        (sdk as any).checkoutForm.retrieve(retrieveReq, (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        });
      });
    } catch (_e) {
      // retrieve başarısızsa result=null olarak değerlendirilecek (pending)
      result = null;
    }

    // İyzico sonucu yorumla
    let paid = !!(result && result.paymentStatus === "SUCCESS");

    // Debug bilgisi hazırla
    const debugInfo: any = result ? {
      paymentStatus: result.paymentStatus ?? null,
      mdStatus: result.mdStatus ?? null,
      errorCode: result.errorCode ?? null,
      errorMessage: result.errorMessage ?? null,
      paymentId: result.paymentId ?? null,
      cardFamily: result.cardFamily ?? null,
      binNumber: result.binNumber ?? null,
      lastFourDigits: result.lastFourDigits ?? null,
      raw: result,
    } : { paymentStatus: null }

    // Supabase: venthub_orders güncelle (yalnızca kesin durumlarda yaz)
    async function patchStatus(newStatus: 'paid' | 'failed') {
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
        body: JSON.stringify({ payment_status: newStatus, status: newStatus === 'paid' ? 'confirmed' : 'pending', payment_debug: debugInfo }),
      });
      return resp;
    }

    let updateOk = false;
    let stockResult = null;
    if (paid) {
      const r = await patchStatus('paid');
      updateOk = !!(r && r.ok);
      
      // Process stock reduction after successful payment - Direct REST API approach
      try {
        if (orderId) {
          // 1. Check if stock reduction has already been processed by looking for a flag
          const orderCheckResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${orderId}&select=status,payment_debug`, {
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            }
          });
          
          if (orderCheckResp.ok) {
            const orders = await orderCheckResp.json();
            const currentOrder = orders[0];
            
            // Check if stock reduction was already processed (look for stock_processed flag)
            const stockAlreadyProcessed = currentOrder?.payment_debug?.stock_processed === true;
            
            if (!stockAlreadyProcessed) {
              // 2. Get order items
              const itemsResp = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items?order_id=eq.${orderId}&select=product_id,quantity`, {
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey
                }
              });
              
              if (itemsResp.ok) {
                const items = await itemsResp.json();
                let processedCount = 0;
                let failedProducts: string[] = [];
                
                for (const item of items) {
                  try {
                    // 3. Get current product stock with atomic read
                    const productResp = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}&select=id,name,stock_qty,low_stock_threshold`, {
                      headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                      }
                    });
                    
                    if (productResp.ok) {
                      const products = await productResp.json();
                      const product = products[0];
                      
                      if (product && (product.stock_qty || 0) >= item.quantity) {
                        // 4. Atomic stock reduction with optimistic locking
                        const newStock = (product.stock_qty || 0) - item.quantity;
                        const updateResp = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${item.product_id}&stock_qty=eq.${product.stock_qty}`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                          },
                          body: JSON.stringify({ stock_qty: newStock })
                        });
                        
                        if (updateResp.ok) {
                          processedCount++;
                          console.log(`✅ Stock reduced for ${product.name}: ${product.stock_qty} -> ${newStock}`);
                          
                          // Check if stock alert is needed after reduction
                          if (newStock <= (product.low_stock_threshold || 5)) {
                            try {
                              await fetch(`${supabaseUrl}/functions/v1/stock-alert`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${serviceRoleKey}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ productId: item.product_id })
                              });
                              console.log(`📢 Stock alert triggered for ${product.name}`);
                            } catch (alertError: any) {
                              console.warn(`⚠️ Stock alert failed for ${product.name}:`, alertError.message);
                            }
                          }
                        } else if (updateResp.status === 406) {
                          // Optimistic lock failed - stock changed during our operation
                          failedProducts.push(`${product.name} (stock changed during update)`);
                          console.warn(`⚠️ Race condition detected for ${product.name} - stock changed during update`);
                        } else {
                          failedProducts.push(product.name || 'Unknown');
                          console.warn(`❌ Failed to update stock for ${product.name}: ${updateResp.status}`);
                        }
                      } else {
                        failedProducts.push(product?.name || 'Unknown');
                        console.warn(`❌ Insufficient stock for ${product?.name}: need ${item.quantity}, have ${product?.stock_qty || 0}`);
                      }
                    }
                  } catch (itemError: any) {
                    failedProducts.push('Unknown product');
                    console.warn('❌ Error processing item:', itemError.message);
                  }
                }
                
                stockResult = {
                  success: true,
                  processed_count: processedCount,
                  failed_products: failedProducts,
                  order_id: orderId
                };
                
                console.log('✅ Stock reduction completed:', processedCount, 'items processed');
                if (failedProducts.length > 0) {
                  console.warn('⚠️ Some products failed stock reduction:', failedProducts);
                }
                
                // Mark stock as processed to prevent duplicate reductions
                try {
                  const updatedDebugInfo = { ...debugInfo, stock_processed: true, stock_processed_at: new Date().toISOString() };
                  await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${orderId}`, {
                    method: 'PATCH',
                    headers: {
                      'Authorization': `Bearer ${serviceRoleKey}`,
                      'apikey': serviceRoleKey,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ payment_debug: updatedDebugInfo })
                  });
                  console.log('✅ Stock processed flag updated');
                } catch (flagError: any) {
                  console.warn('⚠️ Failed to update stock processed flag:', flagError.message);
                }
              } else {
                console.warn('Failed to fetch order items:', itemsResp.status);
              }
            } else {
              console.log('⚠️ Stock reduction already processed for order:', orderId);
              stockResult = {
                success: true,
                processed_count: 0,
                failed_products: [],
                order_id: orderId,
                message: 'Already processed (idempotent)'
              };
            }
          } else {
            console.warn('Failed to check order status:', orderCheckResp.status);
          }
        }
      } catch (e: any) {
        console.warn('Stock reduction error:', e?.message || e);
      }
      
      // After a successful payment, clear ALL server carts for this user (defensive against duplicates)
      try {
        const su = Deno.env.get('SUPABASE_URL') || ''
        const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        if (su && sk) {
          // Fetch order row to get user_id
          let uid: string | null = null
          if (orderId) {
            const oResp = await fetch(`${su}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=user_id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
            const arr = await oResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            uid = row?.user_id || null
          } else if (result?.conversationId || conversationId) {
            const oResp = await fetch(`${su}/rest/v1/venthub_orders?conversation_id=eq.${encodeURIComponent(result?.conversationId || conversationId!)}&select=user_id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
            const arr = await oResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            uid = row?.user_id || null
          }
          if (uid) {
            // Look up ALL shopping carts for the user and clear their items
            const cResp = await fetch(`${su}/rest/v1/shopping_carts?user_id=eq.${encodeURIComponent(uid)}&select=id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
            const carts = await cResp.json().catch(()=>[])
            const cartIds: string[] = Array.isArray(carts) ? carts.map((c: any) => c?.id).filter(Boolean) : []
            for (const cid of cartIds) {
              await fetch(`${su}/rest/v1/cart_items?cart_id=eq.${encodeURIComponent(cid)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${sk}`, apikey: sk, Prefer: 'return=minimal' }
              }).catch(()=>{})
            }
          }
        }
      } catch (_) { /* best-effort */ }
    } else if (result && result.paymentStatus && String(result.paymentStatus).toUpperCase() !== 'SUCCESS') {
      const r = await patchStatus('failed');
      updateOk = !!(r && r.ok);
    }

    const responseBody = {
      status: paid ? "success" : (result ? "failure" : "pending"),
      iyzico: result,
      updated: updateOk,
    };

    // İstek JSON bekliyorsa JSON dön, değilse HTML ile yönlendir
    if (wantsJson) {
      return new Response(JSON.stringify(responseBody), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Her durumda frontende yönlendiren HTML dön (IyziCo bazı durumlarda 302'yi takip etmiyor olabilir)
    try {
      const url = new URL(req.url);
      const successUrl = url.searchParams.get('successUrl');
      let finalSuccess = successUrl;
      if (!finalSuccess) {
        const base = (Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '').trim();
        if (base) {
          try { finalSuccess = new URL(base).origin + '/payment-success'; } catch { finalSuccess = base.replace(/\/$/, '') + '/payment-success'; }
        }
      }
      if (finalSuccess) {
        const target = new URL(finalSuccess);
        if (orderId) target.searchParams.set('orderId', orderId);
        if (conversationId) target.searchParams.set('conversationId', conversationId);
        target.searchParams.set('status', paid ? 'success' : 'failure');
        const t = target.toString();
        const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){try{window.parent.location.replace(${JSON.stringify(t)});}catch(e2){location.href=${JSON.stringify(t)}}};</script></body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
    } catch (_) {}

    // Yine de base yoksa düz metin yerine bilgilendirici HTML döndür (OK kaldırıldı)
    const infoHtml = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Ödeme Sonucu</title></head><body style=\"font-family:system-ui,Arial,sans-serif;padding:16px;\"><h3>Ödeme sonucu alındı</h3><p>Bu pencereyi kapatabilirsiniz. Sonuç sayfasına yönlendirme yapılamadı.</p></body></html>`;
    return new Response(infoHtml, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  } catch (error: any) {
    console.error("iyzico-callback error:", error);
    // Hata olsa bile JSON bekleyen isteklere 'pending' JSON dön, aksi halde frontend'e 'pending' ile yönlendir
    const accept = (req.headers.get('accept') || '').toLowerCase()
    const wantsJson = accept.includes('application/json') || !!req.headers.get('x-client-info')
    if (wantsJson) {
      return new Response(JSON.stringify({ status: 'pending', error: String(error?.message || error) }), { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } });
    }
    try {
      const url = new URL(req.url);
      const orderId = url.searchParams.get('orderId') || undefined;
      const conversationId = url.searchParams.get('conversationId') || undefined;
      let finalSuccess = url.searchParams.get('successUrl');
      if (!finalSuccess) {
        const base = (Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || '').trim();
        if (base) {
          try { finalSuccess = new URL(base).origin + '/payment-success'; } catch { finalSuccess = base.replace(/\/$/, '') + '/payment-success'; }
        }
      }
      if (finalSuccess) {
        const target = new URL(finalSuccess);
        if (orderId) target.searchParams.set('orderId', orderId);
        if (conversationId) target.searchParams.set('conversationId', conversationId);
        target.searchParams.set('status', 'failure');
        const t = target.toString();
        const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){try{window.parent.location.replace(${JSON.stringify(t)});}catch(e2){location.href=${JSON.stringify(t)}}};</script></body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
    } catch (_) {}
    // Yine olmazsa bilgilendirici HTML döndür (OK kaldırıldı)
    const infoHtml2 = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Ödeme Sonucu</title></head><body style=\"font-family:system-ui,Arial,sans-serif;padding:16px;\"><h3>Ödeme sonucu alındı</h3><p>Bu pencereyi kapatabilirsiniz. Sonuç sayfasına yönlendirme yapılamadı.</p></body></html>`;
    return new Response(infoHtml2, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  }
});

