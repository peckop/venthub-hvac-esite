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

    if (!token) {
      // Token yoksa bile, kullanıcıyı frontend başarı sayfasına yönlendirip doğrulamayı orada veritabanından yaptır.
      if (successUrl) {
        try {
          const target = new URL(successUrl);
          if (orderId) target.searchParams.set('orderId', orderId);
          if (conversationId) target.searchParams.set('conversationId', conversationId);
          const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body><script>try{window.top.location.replace(${JSON.stringify(target.toString())});}catch(e){location.href=${JSON.stringify(target.toString())}}</script>OK</body></html>`;
          return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
        } catch (_) {}
      }
      // İyzi tarafında genel hata göstermemek için 200 OK dön.
      return new Response("OK", { status: 200, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
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
      if (successUrl) {
        const target = new URL(successUrl);
        if (orderId) target.searchParams.set('orderId', orderId);
        if (conversationId) target.searchParams.set('conversationId', conversationId);
        target.searchParams.set('status', paid ? 'success' : 'failure');
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body><script>try{window.top.location.replace(${JSON.stringify(target.toString())});}catch(e){location.href=${JSON.stringify(target.toString())}}</script>OK</body></html>`;
        return new Response(html, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
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

