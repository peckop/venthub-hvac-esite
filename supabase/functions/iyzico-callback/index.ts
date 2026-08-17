// Çağıran sınıfı: (c) ödeme sağlayıcısı + (a) tarayıcı dönüşü — tenant sipariş satırından türetilir
//
// TENANT (T026-VH Adım 5): bu uç İKİ ayrı çağıran tarafından vurulur — İyzico'nun kendi
// callback POST'u (form-urlencoded, hiç Authorization yok) ve tarayıcının dönüş sayfası
// (`src/views/PaymentSuccessPage.tsx`, Authorization çoğu zaman ANON key). Bu yüzden tenant
// JWT'den ALINAMAZ (plan R2: "JWT kazanır" dersek tarayıcı dönüşü kırılır) ve istekten de
// okunamaz. İki durumda da tek doğru kaynak `orderId`/`conversationId`'nin işaret ettiği
// `venthub_orders` satırıdır (`_shared/tenant.ts::tenantFromRow`).
// FAIL-CLOSED DEĞİL: sipariş bulunamazsa uç 4xx dönmez — bugünkü "pending" davranışı korunur,
// aksi hâlde ödeme dönüş sayfası kırılır (kullanıcı parasını verip beyaz ekran görür).
import { getCorsHeaders } from '../_shared/cors.ts'
import Iyzipay from "npm:iyzipay";
import { tenantFromRow } from '../_shared/tenant.ts'
import { buildAllowedOrigins, isAllowedRedirectTarget, normalizeOrigin } from '../_shared/origins.ts'

// Minimal types to avoid `any` while keeping integration flexible
type CheckoutRetrieveResponse = {
  paymentStatus?: string;
  conversationId?: string;
  errorMessage?: string;
  paymentId?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  [k: string]: unknown;
};

Deno.serve(async (req) => {
  // ── YONLENDIRME HEDEFI TEK KAPIDAN GEÇER (T043-VH) ──────────────────────────
  //
  // Query'den gelen `successUrl` daha önce HİÇ doğrulanmadan `location.replace` ile
  // açılıyordu. O değer `iyzico-payment` tarafından isteğin `Origin` başlığından
  // türetiliyordu ve o başlık saldırganın kontrolündedir: yani GERÇEK ödeme
  // tamamlandıktan sonra müşteri saldırganın sayfasına yönlendirilebiliyordu.
  //
  // KAPI HANDLER'IN EN BAŞINDA, `try`'dan ÖNCE kurulur — bilinçli. İlk düzeltmemde
  // iki çağrı yerini sarmıştım ama **üçüncüsü dış `catch` bloğundaydı** ve kapsam
  // dışında kaldığı için açıkta kalmıştı; INV-PAY-2 bunu yakaladı. Hata yolu tam da
  // gözden kaçan yoldur; kapı oraya da yetişmeli. Aynı kuralın iki kopyası olması,
  // birini düzeltip diğerini unutmaya davettir.
  const redirectAllowlist = buildAllowedOrigins({
    PUBLIC_SITE_URL: Deno.env.get('PUBLIC_SITE_URL'),
    FRONTEND_URL: Deno.env.get('FRONTEND_URL'),
    SITE_URL: Deno.env.get('SITE_URL'),
    ALLOWED_ORIGINS: Deno.env.get('ALLOWED_ORIGINS'),
  })
  /** Adayı allowlist'ten geçirir; geçemezse null döner (kanoniğe düşülür). */
  const safeRedirect = (candidate: string | null | undefined): string | null => {
    if (!candidate) return null
    if (isAllowedRedirectTarget(redirectAllowlist, candidate)) return candidate
    console.warn(`[iyzico-callback] successUrl allowlist disi, yok sayildi: ${normalizeOrigin(candidate) ?? '(cozulemedi)'}`)
    return null
  }
  /** Ortamdan türetilen kanonik dönüş adresi (allowlist başı). */
  const canonicalSuccessUrl = (): string | null =>
    redirectAllowlist[0] ? `${redirectAllowlist[0]}/payment-success` : null

  const corsHeaders = getCorsHeaders(req);
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
      const bodyJson = await req.json().catch(() => ({} as Record<string, unknown>));
      const body = bodyJson as { token?: string; conversationId?: string; orderId?: string };
      token = body?.token;
      conversationId = body?.conversationId;
      orderId = body?.orderId;
    }

    // URL query'den de parametre al (callbackUrl'_e eklendi)
    let successUrl: string | null = null;
    try {
      const url = new URL(req.url);
      if (!orderId) orderId = url.searchParams.get('orderId') || undefined;
      if (!conversationId) conversationId = url.searchParams.get('conversationId') || undefined;
      successUrl = safeRedirect(url.searchParams.get('successUrl'));
    } catch {}

    // ★ TENANT TÜRETME NOKTASI — `orderId`/`conversationId` çözüldükten SONRA, sipariş
    // satırından. Sorgu tenant ile FİLTRELENMEZ (filtreyi kuracak güvenilir değer yok);
    // satır bulunur, tenant ondan okunur. Aynı sorgu `payment_token` fallback'ini de
    // getirir — eskiden bu ayrı bir istekti ve `tenant_id=eq.<istekten gelen>` ile
    // filtreliydi, yani saldırganın verdiği değer sorgunun kapsamını belirliyordu.
    let tenantId = tenantFromRow(null).tenantId
    let tenantIsDerived = false
    let orderPaymentToken: string | undefined
    if (orderId || conversationId) {
      try {
        const su = Deno.env.get('SUPABASE_URL') || ''
        const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        if (su && sk) {
          const filter = orderId
            ? `id=eq.${encodeURIComponent(orderId)}`
            : `conversation_id=eq.${encodeURIComponent(conversationId as string)}`
          const got = await fetch(`${su}/rest/v1/venthub_orders?${filter}&select=tenant_id,payment_token`, {
            headers: { Authorization: `Bearer ${sk}`, apikey: sk }
          })
          const arr = await got.json().catch(() => [])
          const row = Array.isArray(arr) ? arr[0] : null
          // Satır YOKSA hata değil: tenant DEFAULT kalır ve akış aşağıda 'pending' ile sürer.
          const decision = tenantFromRow(row)
          tenantId = decision.tenantId
          tenantIsDerived = decision.source === 'resource_row'
          if (row?.payment_token) orderPaymentToken = String(row.payment_token)
        }
      } catch {}
    }

    // `venthub_orders`'a giden sorgular — yani tenant'ı TÜRETTİĞİMİZ satırın kendisi — tenant
    // ile ancak gerçekten türetebildiysek filtrelenir. Satır yoksa ya da tenant'ı boşsa
    // `tenantFromRow` DEFAULT'a düşer; o uydurulmuş değeri filtreye koymak sorguyu sessizce
    // boşa çıkarır — ödeme sonucu DB'ye HİÇ yazılmaz. Bu, sessiz bir fail-closed olurdu ve
    // tam da bu uçta yasak. Sipariş `id`/`conversation_id` zaten tekil; sınırı onlar çizer.
    const orderTenantFilter = tenantIsDerived ? `&tenant_id=eq.${encodeURIComponent(tenantId)}` : ''

    // successUrl yoksa (ya da allowlist'i gecemediyse) kanonik adrese dus.
    if (!successUrl) successUrl = canonicalSuccessUrl();

    if (!token) {
      // Fallback: sipariş satırındaki payment_token (yukarıdaki tenant türetme sorgusundan geldi)
      if (orderPaymentToken) token = orderPaymentToken
      if (!token) {
        // Token yine yoksa, uygulama çağrısı ise JSON, değilse frontend'_e yönlendir (pending)
        if (wantsJson) {
          return new Response(JSON.stringify({ status: 'pending', reason: 'missing_token' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        } else if (successUrl) {
          try {
            const target = new URL(successUrl);
            if (orderId) target.searchParams.set('orderId', orderId);
            if (conversationId) target.searchParams.set('conversationId', conversationId);
            target.searchParams.set('status', 'pending');
            const t = target.toString();
            const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${t}"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(_e){location.href=${JSON.stringify(t)}};</script></body></html>`;
            return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
          } catch {}
        }
        // Son çare
        return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const apiKey = Deno.env.get("IYZICO_API_KEY");
    const secretKey = Deno.env.get("IYZICO_SECRET_KEY");
    // LANSMAN ENGELİ İDİ (T022-VH, 2026-08-15): burası sandbox'ı SABİT kodluyordu.
    // Kardeşleri env'den okuyor (iyzico-payment:232, iyzico-refund:53) — yalnız callback sabitti.
    // Etki: prod anahtarları konulduğu an ödeme PROD'da başlar ama callback retrieve'i
    // SANDBOX'a sorar → para çekilir, sipariş DOĞRULANAMAZ. Aynı desene çekildi.
    const baseUrl = Deno.env.get("IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!apiKey || !secretKey || !supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: { code: "CONFIG_ERROR", message: "Environment değişkenleri eksik" },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    type IyziCtorCb = new (args: { apiKey: string; secretKey: string; uri: string }) => {
      checkoutForm: {
        retrieve: (
          req: { locale: string; token: string; conversationId?: string },
          cb: (err: unknown, res: CheckoutRetrieveResponse) => void,
        ) => void;
      };
    };
    const IyziCb = Iyzipay as unknown as IyziCtorCb;
    const sdk = new IyziCb({ apiKey, secretKey, uri: baseUrl });

    const retrieveReq: { locale: string; token: string; conversationId?: string } = {
      locale: "tr",
      token,
    };
    if (conversationId) retrieveReq.conversationId = conversationId;

    // Token geldiyse hemen DB'ye yaz (denetim ve reconcile için)
    try {
      if (token && orderId) {
        await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}${orderTenantFilter}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ payment_token: token })
        })
      }
    } catch {}

    let result: CheckoutRetrieveResponse | null = null;
    try {
      result = await new Promise<CheckoutRetrieveResponse>((resolve, reject) => {
        sdk.checkoutForm.retrieve(
          retrieveReq,
          (err: unknown, res: CheckoutRetrieveResponse) => {
            if (err) return reject(err);
            resolve(res);
          },
        );
      });
    } catch {
      // retrieve başarısızsa result=null olarak değerlendirilecek (pending)
      result = null;
    }

    // İyzico sonucu yorumla
    const paid = !!(result && result.paymentStatus === "SUCCESS");

    // Debug bilgisi hazırla
    const debugInfo: Record<string, unknown> = result ? {
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

    // ── SİPARİŞ DURUMU: İKİ KOLON, İKİ AYRI SÖZLÜK (T042-VH · 2026-08-15) ────────
    //
    // Buradaki hata, iki kolonun sözlüğünün birbirine karışmasıydı. PROD'DAN ÖLÇÜLDÜ:
    //
    //   venthub_orders_status_check          → pending · confirmed · processing ·
    //                                          shipped · delivered · cancelled
    //   venthub_orders_payment_status_check  → pending · paid · failed · refunded ·
    //                                          partial_refunded
    //
    // Yani `paid`/`failed` **yaşam döngüsü** değil **ödeme** sözlüğüne aittir. Eski kod
    // ikisini de `status` kolonuna yazmaya çalışıyordu:
    //
    //   • başarı dalında `patchStatus('paid')` reddediliyor, `'confirmed'` ile TEKRAR
    //     deneniyordu — yani kısıt reddi, akış denetimi olarak kullanılıyordu (çalışıyordu
    //     ama yanlışlıkla);
    //   • başarısızlık dalında `patchStatus('failed')` reddediliyor ve GERİ DÖNÜŞ YOKTU →
    //     reddedilen ödeme sonsuza kadar `pending` kalıyordu. `payment_debug` de
    //     yazılamıyordu, çünkü aynı PATCH ile gidiyordu: başarısızlığın izi bile kalmıyordu.
    //   • `payment_status` kolonuna bu uç HİÇ yazmıyordu → ön yüzdeki iki yoklayıcı
    //     (`useCheckoutPayment`, `PaymentWatcher`) hiçbir zaman ateşlenemezdi.
    //
    // MIGRATION GEREKMEDİ. `status` kısıtına `paid`/`failed` eklemek (Recep onayı + prod'a
    // otomatik apply) ilk akla gelen çözümdü ama YANLIŞ olurdu: iki sözlüğü kalıcı olarak
    // birbirine karıştırırdı. Doğru olan, her değeri ait olduğu kolona yazmak.
    //
    // BAŞARISIZLIKTA `status` DEĞİŞMEZ. Ödeme reddedildiğinde sipariş `pending` kalır ve
    // yalnız `payment_status='failed'` olur — çünkü yaşam döngüsü ilerlememiştir ve
    // kullanıcı aynı sipariş üzerinden tekrar deneyebilir. `cancelled` yazmak tekrar
    // denemeyi kapatırdı (CLAUDE.md §11: durumlar monoton). Süresi dolan rezervasyonları
    // `release-expired-reservations` zaten `payment_status='failed'` ile temizliyor —
    // aynı sözlük, aynı kolon, tutarlı.
    async function patchOrder(fields: { status?: string; payment_status?: string }) {
      const filterById = orderId ? `id=eq.${encodeURIComponent(orderId)}` : '';
      const filterByConv = (!orderId && (result?.conversationId || conversationId)) ? `conversation_id=eq.${encodeURIComponent(result?.conversationId || conversationId!)}` : '';
      const filter = filterById || filterByConv;
      if (!filter) return null;
      const resp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}${orderTenantFilter}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ ...fields, payment_debug: debugInfo }),
      });
      return resp;
    }

    let updateOk = false;
    let _stockResult: unknown = null;
    if (paid) {
      // Yaşam döngüsü: 'confirmed' · Ödeme: 'paid'. Tek PATCH, deneme-yanılma yok.
      const r = await patchOrder({ status: 'confirmed', payment_status: 'paid' });
      updateOk = !!(r && r.ok);
      if (!updateOk) {
        console.error(`[iyzico-callback] BASARILI odeme yazilamadi (status=${r ? r.status : 'yok'}) — para cekildi, siparis guncellenmedi.`);
      }
      
      // Send order confirmation (best-effort, only after payment success)
      try {
        let finalOrderId: string | null = orderId || null
        if (!finalOrderId && (result?.conversationId || conversationId)) {
          const oResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?conversation_id=eq.${encodeURIComponent(result?.conversationId || conversationId!) }${orderTenantFilter}&select=id`, {
            headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
          })
          if (oResp.ok) {
            const arr = await oResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            finalOrderId = row?.id || null
          }
        }
        if (finalOrderId) {
          await fetch(`${supabaseUrl}/functions/v1/order-confirmation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: finalOrderId, tenant_id: tenantId })
          })
        }
      } catch { /* ignore */ }
      
      // Kuponu finalize et: order row'dan coupon_code'yi al, varsa usage increment ve discount hesapla (best-effort)
      try {
        if (orderId) {
          const su = Deno.env.get('SUPABASE_URL') || ''
          const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
          if (su && sk) {
            const oResp = await fetch(`${su}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}${orderTenantFilter}&select=id,total_amount,coupon_code,coupon_discount`, { headers: { Authorization: `Bearer ${sk}`, apikey: sk } })
            if (oResp.ok) {
              const arr = await oResp.json().catch(()=>[])
              const row = Array.isArray(arr) ? arr[0] as { id?: string; total_amount?: number; coupon_code?: string|null; coupon_discount?: number|null } : null
              const code = (row?.coupon_code || '').trim()
              const total = Number(row?.total_amount || 0)
              if (code && total > 0) {
                // Get coupon details
                const cRes = await fetch(`${su}/rest/v1/coupons?code=eq.${encodeURIComponent(code)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=discount_type,discount_value,minimum_order_amount,is_active,valid_from,valid_until,usage_limit,used_count`, { headers: { Authorization: `Bearer ${sk}`, apikey: sk } })
                if (cRes.ok) {
                  const carr = await cRes.json().catch(()=>[])
                  const c = Array.isArray(carr) ? carr[0] as { discount_type?: string; discount_value?: number; minimum_order_amount?: number|null; is_active?: boolean; valid_from?: string|null; valid_until?: string|null; usage_limit?: number|null; used_count?: number|null } : null
                  if (c && c.is_active !== false) {
                    const now = Date.now()
                    const startsOk = !c.valid_from || new Date(c.valid_from).getTime() <= now
                    const endsOk = !c.valid_until || new Date(c.valid_until).getTime() > now
                    const minOk = (c.minimum_order_amount == null) || (total >= Number(c.minimum_order_amount))
                    const limitOk = (c.usage_limit == null) || (Number(c.used_count||0) < Number(c.usage_limit))
                    if (startsOk && endsOk && minOk && limitOk) {
                      let disc = 0
                      if (c.discount_type === 'percentage') disc = (total * Number(c.discount_value||0))/100
                      else disc = Number(c.discount_value||0)
                      if (disc > total) disc = total
                      const disc2 = Number(Number(disc).toFixed(2))
                      // Patch order with computed discount
                      await fetch(`${su}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}${orderTenantFilter}`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${sk}`, apikey: sk, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
                        body: JSON.stringify({ coupon_discount: disc2 })
                      }).catch(()=>{})
                      // Increment usage (best-effort)
                      await fetch(`${su}/rest/v1/rpc/increment_coupon_usage`, {
                        method: 'POST', headers: { Authorization: `Bearer ${sk}`, apikey: sk, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ p_code: code })
                      }).catch(()=>{})
                    }
                  }
                }
              }
            }
          }
        }
      } catch { /* ignore */ }

      // Process stock reduction after successful payment - Use DB RPC (idempotent)
      try {
        if (orderId) {
          // Call centralized RPC for atomic, idempotent stock reduction
          const rpcResp = await fetch(`${supabaseUrl}/rest/v1/rpc/process_order_stock_reduction`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_order_id: orderId })
          });

          if (rpcResp.ok) {
            const rpcJson = await rpcResp.json().catch(() => ({}));
            _stockResult = rpcJson || { success: true, processed_count: null, order_id: orderId };

            // T052-VH — SAHTE DAMGA BURADAYDI.
            //
            // Eski kod yalnizca `rpcResp.ok`'e (HTTP 200) bakip `stock_processed: true`
            // yaziyordu. Ama PostgREST, RPC `{"success": false, ...}` dondugunde de 200
            // doner — hata jsonb GOVDESINDEDIR. RPC kapisi `status IN ('paid','processing')`
            // beklerken callback `'confirmed'` yaziyordu ve `'paid'` statu sozlugunde HIC
            // YOK; yani RPC HER SEFERINDE reddediyordu. Ustune "islendi" damgasi basiliyordu.
            // Ariza boylece kendi kanitini siliyordu: log'da basari, envanterde hicbir sey.
            //
            // Artik damga RPC'nin KENDI verdictine bagli. Basarisizsa damga basilmaz,
            // sebep yazilir ve gelir yolu alarmi kalkar (`client_errors` → admin Hata
            // Gruplari ekrani; Sentry'ye BAGLANAMAZ, DSN yok — bkz. _shared/revenue_alarm.ts).
            const stockOk = (rpcJson as { success?: boolean } | null)?.success === true;

            if (!stockOk) {
              console.error('[iyzico-callback] STOK DUSMEDI — odeme alindi, envanter degismedi:', JSON.stringify(rpcJson));
              try {
                const { raiseRevenueAlarm } = await import('../_shared/revenue_alarm.ts');
                await raiseRevenueAlarm(supabaseUrl, serviceRoleKey, {
                  fn: 'iyzico-callback',
                  code: 'STOCK_REDUCTION_FAILED',
                  message: 'Odeme basarili ama siparis stogu dusurulemedi; envanter gercegi yansitmiyor.',
                  extra: { order_id: orderId, rpc_result: rpcJson },
                });
              } catch (alarmErr) {
                console.error('[iyzico-callback] stok alarmi yazilamadi:', alarmErr);
              }
            }

            // Mark stock processed flag and attach RPC summary to payment_debug
            try {
              const updatedDebugInfo = { ...debugInfo, stock_processed: stockOk, stock_processed_at: new Date().toISOString(), stock_rpc_result: rpcJson };
              await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}${orderTenantFilter}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ payment_debug: updatedDebugInfo })
              });
            } catch { /* best-effort */ }

            // Optional: trigger low stock alerts after RPC (best-effort, non-blocking)
            try {
              const itemsResp = await fetch(`${supabaseUrl}/rest/v1/venthub_order_items?order_id=eq.${orderId}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=product_id,quantity`, {
                headers: {
                  'Authorization': `Bearer ${serviceRoleKey}`,
                  'apikey': serviceRoleKey
                }
              });
              if (itemsResp.ok) {
                const items = await itemsResp.json().catch(() => []);
                for (const it of items) {
                  try {
                    const pResp = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(it.product_id)}&select=id,name,stock_qty,low_stock_threshold`, {
                      headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                      }
                    });
                    if (pResp.ok) {
                      const arr = await pResp.json().catch(() => []);
                      const pr = Array.isArray(arr) ? arr[0] : null;
                      if (pr && Number(pr.stock_qty) <= Number(pr.low_stock_threshold ?? 5)) {
                        await fetch(`${supabaseUrl}/functions/v1/stock-alert`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ _productId: it.product_id })
                        }).catch(() => {});
                      }
                    }
                  } catch { /* ignore */ }
                }
              }
            } catch { /* ignore */ }
          } else {
            const errTxt = await rpcResp.text().catch(() => '');
            console.warn('process_order_stock_reduction failed', rpcResp.status, errTxt);
          }
        }
      } catch (_e: unknown) {
        const msg = _e instanceof Error ? _e.message : String(_e ?? '')
        console.warn('Stock reduction RPC error:', msg);
      }
      
      // After a successful payment, clear ALL server carts for this user (defensive against duplicates)
      try {
        const su = Deno.env.get('SUPABASE_URL') || ''
        const sk = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        if (su && sk) {
          // Fetch order row to get user_id
          let uid: string | null = null
          if (orderId) {
            const oResp = await fetch(`${su}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}${orderTenantFilter}&select=user_id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
            const arr = await oResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            uid = row?.user_id || null
          } else if (result?.conversationId || conversationId) {
            const oResp = await fetch(`${su}/rest/v1/venthub_orders?conversation_id=eq.${encodeURIComponent(result?.conversationId || conversationId!)}${orderTenantFilter}&select=user_id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
            const arr = await oResp.json().catch(()=>[])
            const row = Array.isArray(arr) ? arr[0] : null
            uid = row?.user_id || null
          }
          if (uid) {
            // Look up ALL shopping carts for the user and clear their items
            const cResp = await fetch(`${su}/rest/v1/shopping_carts?user_id=eq.${encodeURIComponent(uid)}&tenant_id=eq.${encodeURIComponent(tenantId)}&select=id`, {
              headers: { Authorization: `Bearer ${sk}`, apikey: sk }
            })
      const carts = await cResp.json().catch(()=>[])
      const cartIds: string[] = Array.isArray(carts)
        ? (carts as Array<{ id?: string }>).map((c) => c?.id).filter((v): v is string => Boolean(v))
        : []
            for (const cid of cartIds) {
              await fetch(`${su}/rest/v1/cart_items?cart_id=eq.${encodeURIComponent(cid)}&tenant_id=eq.${encodeURIComponent(tenantId)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${sk}`, apikey: sk, Prefer: 'return=minimal' }
              }).catch(()=>{})
            }
          }
        }
      } catch { /* best-effort */ }
    } else if (result && result.paymentStatus && String(result.paymentStatus).toUpperCase() !== 'SUCCESS') {
      // Yalnız ödeme durumu yazılır; `status` 'pending' kalır (tekrar deneme açık).
      const r = await patchOrder({ payment_status: 'failed' });
      updateOk = !!(r && r.ok);
      if (!updateOk) {
        console.error(`[iyzico-callback] BASARISIZ odeme isaretlenemedi (status=${r ? r.status : 'yok'}) — siparis 'pending' gorunmeye devam edecek.`);
      }
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
      // AYNI KAPI: bu blok eskiden query'deki `successUrl`'u dogrudan hedef yapiyordu.
      // Iki ayri yerde iki ayri kural olmasi, birini duzeltip digerini unutmaya davettir.
      let finalSuccess = safeRedirect(url.searchParams.get('successUrl'));
      if (!finalSuccess) finalSuccess = canonicalSuccessUrl();
      if (finalSuccess) {
        const target = new URL(finalSuccess);
        if (orderId) target.searchParams.set('orderId', orderId);
        if (conversationId) target.searchParams.set('conversationId', conversationId);
        target.searchParams.set('status', paid ? 'success' : 'failure');
        const t = target.toString();
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${t}"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(_e){try{window.parent.location.replace(${JSON.stringify(t)});}catch(e2){location.href=${JSON.stringify(t)}}};</script></body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
    } catch {}

    // Yine de base yoksa düz metin yerine bilgilendirici HTML döndür (OK kaldırıldı)
    const infoHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Ödeme Sonucu</title></head><body style="font-family:system-ui,Arial,sans-serif;padding:16px;"><h3>Ödeme sonucu alındı</h3><p>Bu pencereyi kapatabilirsiniz. Sonuç sayfasına yönlendirme yapılamadı.</p></body></html>`;
    return new Response(infoHtml, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  } catch (error: unknown) {
    console.error("iyzico-callback error:", error);
    // Hata olsa bile JSON bekleyen isteklere 'pending' JSON dön, aksi halde frontend'_e 'pending' ile yönlendir
    const accept = (req.headers.get('accept') || '').toLowerCase()
    const wantsJson = accept.includes('application/json') || !!req.headers.get('x-client-info')
    if (wantsJson) {
      const msg = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ status: 'pending', error: msg }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    try {
      const url = new URL(req.url);
      const orderId = url.searchParams.get('orderId') || undefined;
      const conversationId = url.searchParams.get('conversationId') || undefined;
      // Hata yolu da AYNI kapıdan geçer (bkz. handler başındaki gerekçe).
      let finalSuccess = safeRedirect(url.searchParams.get('successUrl'));
      if (!finalSuccess) finalSuccess = canonicalSuccessUrl();
      if (finalSuccess) {
        const target = new URL(finalSuccess);
        if (orderId) target.searchParams.set('orderId', orderId);
        if (conversationId) target.searchParams.set('conversationId', conversationId);
        target.searchParams.set('status', 'failure');
        const t = target.toString();
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${t}"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(_e){try{window.parent.location.replace(${JSON.stringify(t)});}catch(e2){location.href=${JSON.stringify(t)}}};</script></body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
    } catch {}
    // Yine olmazsa bilgilendirici HTML döndür (OK kaldırıldı)
    const infoHtml2 = `<!doctype html><html><head><meta charset="utf-8"><title>Ödeme Sonucu</title></head><body style="font-family:system-ui,Arial,sans-serif;padding:16px;"><h3>Ödeme sonucu alındı</h3><p>Bu pencereyi kapatabilirsiniz. Sonuç sayfasına yönlendirme yapılamadı.</p></body></html>`;
    return new Response(infoHtml2, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  }
});

