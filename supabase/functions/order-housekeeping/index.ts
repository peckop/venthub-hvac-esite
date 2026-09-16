import { getCorsHeaders } from '../_shared/cors.ts'
import { raiseRevenueAlarm } from '../_shared/revenue_alarm.ts'
import { restSayfaOkuyucu, tumSatirlar } from '../_shared/tum_satirlar.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const cors = corsHeaders;

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ ok: false, error: 'CONFIG_MISSING' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // Allow system/cron invocation to bypass user checks
    if (authHeader !== `Bearer ${serviceRoleKey}`) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      })

      const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''))
      if (authErr || !user) {
        return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })
      }

      const roleCheck = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role`, {
        headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey }
      })

      if (roleCheck.ok) {
        const arr = await roleCheck.json().catch(() => [])
        const role = arr[0]?.role
        if (role !== 'admin' && role !== 'super_admin') {
          return new Response(JSON.stringify({ error: 'forbidden', message: 'Insufficient privileges' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
        }
      } else {
        return new Response(JSON.stringify({ error: 'internal_error', message: 'Failed to verify user role' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
    }

    const now = Date.now()
    const th30 = new Date(now - 30 * 60 * 1000).toISOString() // 30 dk
    const th15 = new Date(now - 15 * 60 * 1000).toISOString() // 15 dk

    // 1) Token YOK: 30 dk sonra cancelled
    const cancelResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?status=eq.pending&created_at=lt.${encodeURIComponent(th30)}&payment_token=is.null`, {
      method: 'PATCH',
      // `count=exact` EKLENDİ (REC-183): `return=representation` gövdesi de 1000 satırda kesilir.
      // Yazma tamamı yapılır ama RAPOR eksik kalır — "1000 iptal ettim" der, gerçekte 1400 olabilir.
      // Korunum kimliği kusuru: toplam doğru, sayının kendisi yanlış. Gerçek sayı Content-Range'den.
      headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation,count=exact' },
      body: JSON.stringify({ status: 'cancelled' })
    })
    const cancelled = cancelResp.ok ? await cancelResp.json().catch(() => []) : []
    /** Sunucunun bildirdiği GERÇEK etkilenen satır sayısı; okunamazsa gövde uzunluğuna düşer. */
    const cancelledGercekSayi = (() => {
      const cr = cancelResp.headers.get('content-range') || ''
      const parca = cr.split('/')[1]
      if (parca && parca !== '*' && Number.isFinite(Number(parca))) return Number(parca)
      return Array.isArray(cancelled) ? cancelled.length : 0
    })()

    // 2) Token VAR: 15 dk sonra 1 kez reconcile; SUCCESS değilse failed
    // ── SESSİZ TAVAN (REC-183) ────────────────────────────────────────────────
    // Bu liste eskiden `&limit=1000` ile çekiliyordu. 1000'inci siparişten sonrası o koşumda
    // hiç GÖRÜLMEZ, `{ ok: true }` yine dönerdi: hiçbir alarm çalmadan eksik iş. Sayfalama
    // artık `_shared/tum_satirlar.ts` üzerinden: önce SAY, sonra topla, sonunda KARŞILAŞTIR —
    // eksik toplanırsa FIRLATIR ve aşağıdaki catch bloğu 500 döner (sessiz "ok" yok).
    // 2026-09-07 ölçümü: bekleyen tokenli sipariş 0 → tavan bugün ISIRMIYOR, kusur GİZLİ.
    const pendWithToken = await tumSatirlar<{ id: string }>(
      restSayfaOkuyucu<{ id: string }>(
        `${supabaseUrl}/rest/v1/venthub_orders?select=id,created_at,payment_token,status&status=eq.pending&created_at=lt.${encodeURIComponent(th15)}&payment_token=not.is.null`,
        { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey },
      ),
      { ad: 'order-housekeeping/pending-token' },
    )

    const fnHost = (() => { try { const host = new URL(supabaseUrl).host; const ref = host.split('.')[0]; return `https://${ref}.functions.supabase.co`; } catch { return '' } })();

    const reconciled: string[] = []
    const failed: string[] = []
    /**
     * ⭐İNCELEME BEKLEYEN — SONLANDIRILMAYAN AMA SESSİZ DE BIRAKILMAYAN SİPARİŞLER.
     *
     * `iyzico-callback` "ödeme başarılı ama siparişle eşleşmedi" derse (`needs_review`)
     * sipariş iptal EDİLMEZ: para çekilmiş olabilir. Ama `reconciled` de sayılamaz,
     * çünkü durumu ilerlemedi. Üçüncü kova bu yüzden var — "atlanmış iş yeşil değildir":
     * kovaya girmeyen bir vaka raporda görünmez ve insan müdahalesi hiç gelmez.
     */
    const incelemeBekleyen: string[] = []
    /** Yazması GERÇEKTEN düşenler — rapor bunları saklamaz (aşağıdaki gerekçeye bak). */
    const yazilamayan: Array<{ id: string; detay: string }> = []

    /**
     * Ödenmemiş siparişi sonlandır.
     *
     * M2 (20-madde v2 · 2026-08-17) — İKİ ayrı kusur birlikte yaşıyordu:
     *
     * 1) SÖZLÜK DIŞI DEĞER: `{ status: 'failed' }` yazılıyordu. Canlı DB kısıtı
     *    (`venthub_orders_status_check`) yalnız
     *    {pending, confirmed, processing, shipped, delivered, cancelled} kabul eder —
     *    `failed` bir STATUS değeri DEĞİL, `payment_status` değeridir. Yani PATCH
     *    daima 400 dönüyordu ve sipariş `pending` kalıyordu.
     * 2) SESSİZ YUTMA: `.catch(() => {})` hatayı yutuyor, sipariş id'si yine
     *    `failed[]` listesine ekleniyor ve fonksiyon `{ ok: true }` raporluyordu.
     *    Sonuç: kalıcı `pending` sipariş + sonsuza kadar "başarıyla failed yapıldı"
     *    diyen bir rapor. Hiçbir alarm çalmaz çünkü çıktı BAŞARILI görünür.
     *
     * Doğru değer çifti kardeş fonksiyondan alındı (`release-expired-reservations`):
     * `{ status: 'cancelled', payment_status: 'failed' }` — sipariş iptal, ödeme
     * başarısız. Kardeş ayrıca hatayı YUTMUYOR (`if (updateErr) throw`); burada da
     * rapor gerçeği söyler.
     */
    async function odemesizSiparisiSonlandir(id: string): Promise<void> {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(id)}&status=eq.pending`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
        }
      ).catch((e) => { throw new Error(`ag hatasi: ${e instanceof Error ? e.message : String(e)}`) })

      if (!resp.ok) {
        const govde = await resp.text().catch(() => '')
        throw new Error(`PATCH ${resp.status}: ${govde.slice(0, 200)}`)
      }
    }

    for (const o of pendWithToken) {
      let sonlandir = false
      try {
        const cb = await fetch(`${fnHost}/iyzico-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ orderId: o.id })
        })
        const body = await cb.json().catch(() => ({})) as { status?: string }
        if (body?.status === 'success') {
          reconciled.push(o.id)
        } else if (body?.status === 'needs_review') {
          // ⛔SONLANDIRMA YOK — BU DAL BİR GELİR KAYBI YOLUNU KAPATIYOR (REC-355).
          //
          // `iyzico-callback` artık ödemenin HANGİ siparişe ait olduğunu da doğruluyor.
          // Doğrulama geçmezse İyzico tarafında ödeme BAŞARILI olabilir — yani para
          // çekilmiş olabilir. O cevabı "success değil" sayıp burada siparişi
          // `cancelled` + `payment_status='failed'` yapmak, parası çekilmiş siparişi
          // 15 dakikada iptal etmek demektir.
          //
          // ⭐DERS: bir ucun hata yolu, o ucun CEVABINI OKUYAN yerle birlikte yazılır.
          // Bu iki dosya aynı işte değişti; biri olmadan diğeri yanlış davranır.
          //
          // Sipariş `pending` kalır ve `incelemeBekleyen` olarak RAPORLANIR — sessiz
          // bırakılmaz, çünkü insan müdahalesi gerekiyor (ödeme var, eşleşme yok).
          incelemeBekleyen.push(o.id)
        } else {
          // Tek deneme sonrası hâlâ success değil → siparişi sonlandır.
          sonlandir = true
        }
      } catch {
        // Reconcile denemesi patladıysa da sipariş `pending` kalmamalı.
        sonlandir = true
      }

      if (sonlandir) {
        try {
          await odemesizSiparisiSonlandir(o.id)
          failed.push(o.id)
        } catch (e) {
          // Yazma düştüyse `failed[]`'e EKLEME — o liste "sonlandırıldı" demektir.
          // Yalanı raporda taşımaktansa görünür kıl: sipariş hâlâ `pending`.
          const detay = e instanceof Error ? e.message : String(e)
          console.error('[order-housekeeping] siparis sonlandirilamadi', { order_id: o.id, detay })
          yazilamayan.push({ id: o.id, detay })
        }
      }
    }

    /**
     * ⭐RAPORA YAZMAK, OKUNDUĞU ANLAMINA GELMEZ (REC-355, akran bulgusu).
     *
     * `inceleme_bekleyen` gövdeye eklendi ama bu gövdeyi bir cron çağırıyor ve kimse
     * okumuyor. Eşleşmeyen ödeme artık otomatik iptal EDİLMEDİĞİ için o sipariş
     * `pending` durumunda SONSUZA KADAR kalabilir — para çekilmiş, kimse görmemiş.
     *
     * Eski hâlin en az bir faydası vardı: sipariş iptal olurdu ve en azından bir
     * SONUÇ üretirdi. Yeni hâl doğru ama SESSİZ; sessizlik burada iptalden daha
     * kötü olabilir. Bu yüzden kalıcı bir yere yazılıyor.
     *
     * ⚠Bu, `iyzico-callback`teki alarmın MÜKERRERİ DEĞİL: orada "bu çağrıda eşleşme
     * olmadı" yazıyor, burada "bu sipariş hâlâ çözülmedi ve üzerinden 15 dakika geçti"
     * yazıyor. Birincisi olay, ikincisi BİRİKMİŞ BORÇ.
     */
    if (incelemeBekleyen.length > 0) {
      await raiseRevenueAlarm(supabaseUrl, serviceRoleKey, {
        fn: 'order-housekeeping',
        code: 'PAYMENT_NEEDS_REVIEW_BEKLIYOR',
        message: `${incelemeBekleyen.length} siparis odeme dogrulamasi bekliyor; otomatik iptal EDILMEDI, insan mudahalesi gerekiyor.`,
        extra: { adet: incelemeBekleyen.length, order_ids: incelemeBekleyen },
      })
    }

    // Yazması düşen varsa `ok: true` DÖNMEZ: bu fonksiyonun tek işi durumu ilerletmek;
    // ilerletemediyse "başarılı" demek, çağıranı (cron/izleme) kör eder.
    const govde = {
      ok: yazilamayan.length === 0,
      // Sunucunun bildirdiği gerçek sayı (gövde 1000'de kesilse bile doğru kalır — REC-183).
      cancelled_count: cancelledGercekSayi,
      reconciled,
      failed,
      // ⭐Boşken de yazılır: alanın yokluğu "hiç olmadı" ile "hiç bakılmadı"yı ayırt
      // ettirmez. İzleyen taraf sıfırı GÖRMELİ.
      inceleme_bekleyen: incelemeBekleyen,
      ...(yazilamayan.length > 0 ? { yazilamayan } : {})
    }
    return new Response(JSON.stringify(govde), { status: yazilamayan.length === 0 ? 200 : 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (_e) {
    const msg = _e instanceof Error ? _e.message : String(_e ?? '')
    return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
