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
      // Fallback: orderId üzerinden payment_data.token'ı getir ve devam et
      if (orderId) {
        try {
          const got = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=payment_token,payment_data`, {
            headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, apikey: `${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` }
          })
          const arr = await got.json().catch(()=>[])
          const row = Array.isArray(arr) ? arr[0] : null
          const pd = row?.payment_data ? row.payment_data : null
          if (row?.payment_token) token = row.payment_token
          else if (pd?.token) token = pd.token
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
        body: JSON.stringify({ status: newStatus, payment_debug: debugInfo }),
      });
      return resp;
    }

    let updateOk = false;
    if (paid) {
      const r = await patchStatus('paid');
      updateOk = !!(r && r.ok);
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
        if (token) target.searchParams.set('token', token);
        target.searchParams.set('status', paid ? 'success' : 'failure');
        const t = target.toString();
        const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){try{window.parent.location.replace(${JSON.stringify(t)});}catch(e2){location.href=${JSON.stringify(t)}}};</script></body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }
    } catch (_) {}

    // Yine de base yoksa son çare düz OK dön (görünümde OK görülebilir)
    return new Response("OK", { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
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
    // Yine olmazsa OK döneriz (en son çare)
    return new Response("OK", { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
  }
});

