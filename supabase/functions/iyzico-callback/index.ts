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
          const got = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}&select=payment_data`, {
            headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, apikey: `${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` }
          })
          const arr = await got.json().catch(()=>[])
          const pd = Array.isArray(arr) && arr[0]?.payment_data ? arr[0].payment_data : null
          if (pd?.token) {
            token = pd.token
          }
        } catch (_) {}
      }
      if (!token) {
        // Token yine yoksa, kullanıcıyı frontend'e yönlendirip doğrulamayı orada yaptır.
        if (successUrl) {
          try {
            const target = new URL(successUrl);
            if (orderId) target.searchParams.set('orderId', orderId);
            if (conversationId) target.searchParams.set('conversationId', conversationId);
            target.searchParams.set('status', 'pending');
            const t = target.toString();
            const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){location.href=${JSON.stringify(t)}};</script></body></html>`;
            return new Response(html, { status: 302, headers: { ...corsHeaders, 'Content-Type': 'text/html', 'Location': t } });
          } catch (_) {}
        }
        // İyzi tarafında genel hata göstermemek için 200 OK dön.
        return new Response("OK", { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
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

    const result = await new Promise<any>((resolve, reject) => {
      (sdk as any).checkoutFormRetrieve.retrieve(retrieveReq, (err: any, res: any) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    // İyzico sonucu yorumla
    const paid = result && result.paymentStatus === "SUCCESS";
    const newStatus = paid ? "paid" : "failed";

    // Supabase: venthub_orders güncelle
    async function updateOrderBy(filter: string) {
      const resp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?${filter}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status: newStatus /*, payment_data: result */ }),
      });
      return resp;
    }

    // Bazı durumlarda body'de conversationId gelmez; İyzico cevabındaki conversationId'yi kullan.
    const convForUpdate = result?.conversationId || conversationId || undefined;

    let updateResp: Response | null = null;
    if (orderId) {
      updateResp = await updateOrderBy(`id=eq.${encodeURIComponent(orderId)}`);
    }
    if ((!updateResp || !updateResp.ok) && convForUpdate) {
      updateResp = await updateOrderBy(
        `conversation_id=eq.${encodeURIComponent(convForUpdate)}`
      );
    }

    const responseBody = {
      status: paid ? "success" : "failure",
      iyzico: result,
      updated: updateResp ? updateResp.ok : false,
    };

    // Redirect back to frontend success page if provided
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
        const html = `<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0;url=${t}\"><title>Redirecting...</title></head><body><a href=${JSON.stringify(t)}>Devam etmek için tıklayın</a><script>try{window.top.location.replace(${JSON.stringify(t)});}catch(e){location.href=${JSON.stringify(t)}};</script></body></html>`;
        return new Response(html, { status: 302, headers: { ...corsHeaders, 'Content-Type': 'text/html', 'Location': t } });
      }
    } catch (_) {}

    return new Response("OK", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("iyzico-callback error:", error);
    // Her koşulda 200 OK ve basit bir sayfa dön.
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>OK</title></head><body>OK</body></html>`;
    return new Response(html, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html" } });
  }
});

