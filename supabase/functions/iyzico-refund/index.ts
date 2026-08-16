// supabase/functions/iyzico-refund/index.ts
//
// Çağıran sınıfı: (a) — tarayıcıdan admin ya da sipariş sahibi JWT'siyle çağrılır.
// `verify_jwt` config.toml'da true; gövde yetkisi burada AYRICA doğrulanır
// (docs/standards/edge-function-security-standard.md §3.2).
//
// ─────────────────────────────────────────────────────────────────────────────
// NİÇİN YENİDEN YAZILDI (T053-VH · operasyon döngüsü denetimi 2026-08-15 §3)
// ─────────────────────────────────────────────────────────────────────────────
// Denetimin başlığı şuydu: **gerçek para iadesi hiç yapılmıyor.** Admin `refunded`
// dediğinde çağrılan şey `refund-order-mock` idi; bu fonksiyonu çağıran tek satır
// repoda yoktu. Yani bu dosya yetimdi — ve yetim kaldığı için içindeki kusurlar da
// hiç görünmedi. Ölçüldüğünde beş tanesi çıktı:
//
//   1. Başlıkta "Idempotent" yazıyordu; tek koruma `payment_status === 'refunded'`
//      OKUMASIYDI. Bu bir read-then-act: iki eşzamanlı çağrı ikisi de guard'ı geçer,
//      GERÇEK PARA iki kez çıkar. `manual_refund_applied` bayrağı yazılıyor ama
//      HİÇ okunmuyordu — yanındaki yorum "idempotent by flag" diyordu, bayrak ölüydü.
//   2. PSP çağrısından SONRAKİ sipariş güncellemesi boş `catch {}` içindeydi ve
//      fonksiyon yine `200 {status:'refunded'}` dönüyordu → DB iadeyi hiç görmüyor →
//      bir sonraki çağrı parayı TEKRAR iade ediyor. Tek başına bir çift-iade üreteci.
//   3. `isFull` ifadesinde operatör önceliği hatalıydı: 100'lük bir siparişte 50 iade
//      edilmişse, tutarsız çağrı 100 DAHA istiyordu (toplam 150).
//   4. `paymentId` null olabiliyor ve doğrudan SDK'ya veriliyordu.
//   5. Stok geri-ekleme hem oku-sonra-yaz yarışıydı hem KOŞULSUZDU ve
//      `inventory_movements`'a hiç satır yazmıyordu.
//
// ── (5) bugün DAHA TEHLİKELİ ────────────────────────────────────────────────
// T052 (#552/#556) merge edildi: düşme kapısı artık gerçek statü sözlüğünü kullanıyor
// ve **satışta stok gerçekten düşüyor.** Koşulsuz geri-ekleme dün "yalnızca" hayalî
// stok üretiyordu (hiç düşmediği için); bugün dengeleyen tarafı olan bir sisteme
// yazdığı için **çift geri-ekleme** olurdu. Bu yüzden burada kendi kanıt kontrolüm
// YOK — PRICING-STOK'un migration'ıyla gelen RPC çağrılıyor:
// `process_order_stock_restore(p_order_id, p_reason)`. Kanıt = `order_sale` hareketleri,
// idempotenslik HESAPLA (düşülen − geri verilen, ürün başına), `FOR UPDATE` kilitli.
// İki ayrı kanıt uygulaması = iki ayrı sapma yolu; tek doğru yer RPC'dir (INV-STOCK-1).
//
// ── Yeni sıra ───────────────────────────────────────────────────────────────
// `_shared/refund_guard.ts`: **talebi YAZ → PSP'yi çağır → sonucu işle.** Karşılıklı
// dışlamayı `refund_attempts` üzerindeki benzersiz indeks yapar; uygulama katmanı bu
// yarışı kapatamaz. Cetvel: edge-function-security-standard.md §3.10 (kural A–D).
//
// Bu dosyada para hareketinden SONRA boş `catch {}` YOKTUR ve olmamalıdır — yutulan
// her hata, bir sonraki çağrıda ikinci kez para göndermenin izinsiz kapısıdır.
// Bekçi: INV-PAY-3.

import { getCorsHeaders } from '../_shared/cors.ts'
import { claimRefund, fullCancelKey, settleRefund } from '../_shared/refund_guard.ts'
import { raiseRevenueAlarm } from '../_shared/revenue_alarm.ts'

import Iyzipay from "npm:iyzipay";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type PaymentTransaction = { paymentTransactionId?: string };
type PaymentDebug = {
  refunded_total?: number;
  paymentId?: string;
  raw?: { paymentId?: string; itemTransactions?: PaymentTransaction[] };
  partial_refunds?: { amount: number; at: string }[];
  [k: string]: unknown;
};
type IyziResponse = { status?: string; [k: string]: unknown };
type IyziSdk = {
  cancel: {
    create: (
      req: { locale?: unknown; paymentId: string; ip: string },
      cb: (err: unknown, res: IyziResponse) => void
    ) => void;
  };
  refund: {
    create: (
      req: { locale?: unknown; paymentTransactionId: string; price: string; currency: string; ip: string },
      cb: (err: unknown, res: IyziResponse) => void
    ) => void;
  };
};
type IyziCtor = new (args: { apiKey: string; secretKey: string; uri: string }) => IyziSdk;

/**
 * `npm:iyzipay` tip getirmiyor. Eski sürümde burada bir ÇİFT DÖNÜŞÜM vardı (önce belirsiz
 * tipe, sonra hedef tipe) — yani derleyiciye "sorma, ben biliyorum" demek. Kural olarak
 * yasak (CLAUDE.md kural 3) ve gerçekten de kör: paket biçim değiştirse hata çalışma
 * zamanında, hem de PARA yolunun ortasında patlardı.
 *
 * Yerine tek dönüşüm + GERÇEK bir çalışma-zamanı kontrolü: modülün beklenen biçimde
 * olduğunu doğrula, değilse iade daha BAŞLAMADAN net bir hatayla dur.
 */
function iyziConstructor(mod: unknown): IyziCtor {
  if (typeof mod !== 'function') {
    throw new Error('iyzipay modülü beklenen biçimde değil (constructor bekleniyordu)');
  }
  return mod as IyziCtor;
}

function iyziLocaleTr(mod: unknown): string {
  const locale = (mod as { LOCALE?: { TR?: string } } | null)?.LOCALE?.TR;
  return typeof locale === 'string' ? locale : 'tr';
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  try {
    const IYZ_API = Deno.env.get("IYZICO_API_KEY") || "";
    const IYZ_SEC = Deno.env.get("IYZICO_SECRET_KEY") || "";
    const IYZ_URI = Deno.env.get("IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com";

    if (!supabaseUrl || !serviceKey) {
      return json({ error: { code: "CONFIG_ERROR", message: "Supabase config missing" } }, 500);
    }
    if (!IYZ_API || !IYZ_SEC) {
      return json({ error: { code: "CONFIG_ERROR", message: "IyziCo config missing" } }, 500);
    }
    const ctx = { supabaseUrl, serviceRoleKey: serviceKey };

    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body?.order_id;
    const amountReq: number | undefined =
      typeof body?.amount === 'number' && isFinite(body.amount) ? Number(body.amount) : undefined;
    const reason: string | null = typeof body?.reason === 'string' ? body.reason.slice(0, 200) : null;
    const clientKey: string | null =
      typeof body?.idempotency_key === 'string' && body.idempotency_key.trim()
        ? body.idempotency_key.trim().slice(0, 120)
        : null;

    if (!orderId) return json({ error: { code: "VALIDATION_ERROR", message: "order_id gerekli" } }, 400);

    // ── AuthN: kimlik DOĞRULANMIŞ token'dan türetilir, gövdeden DEĞİL (§3.2/§3.3) ──
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return json({ error: { code: "UNAUTHORIZED", message: "Authorization header required" } }, 401);
    }
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
    if (authErr || !user) {
      return json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
    }
    const reqUserId: string = user.id;

    // ── Siparişi yükle ────────────────────────────────────────────────────────────
    const ordResp = await fetch(
      `${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}` +
        `&select=id,user_id,tenant_id,status,payment_status,total_amount,payment_debug`,
      { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
    );
    if (!ordResp.ok) {
      return json({ error: { code: "DB_ERROR", message: "Order fetch failed", status: ordResp.status } }, 500);
    }
    const orders = await ordResp.json().catch(() => []);
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) return json({ error: { code: "NOT_FOUND", message: "Order not found" } }, 404);

    // ── AuthZ: admin VEYA sipariş sahibi (§3.2 yatay yetki) ───────────────────────
    let isAdmin = false;
    const prof = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(reqUserId)}&select=role`,
      { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
    );
    if (prof.ok) {
      const arr = await prof.json().catch(() => []);
      const profileRow = Array.isArray(arr) ? arr[0] : null;
      isAdmin = profileRow?.role === 'admin' || profileRow?.role === 'super_admin' || profileRow?.role === 'superadmin';
    }
    const isOwner = order.user_id === reqUserId;
    if (!(isAdmin || isOwner)) return json({ error: { code: "FORBIDDEN", message: "Yetkisiz" } }, 403);

    const totalAmount = Number(order.total_amount) || 0;
    const prevDebug: PaymentDebug = (order?.payment_debug || {}) as PaymentDebug;
    const refundedTotalPrev = Number(prevDebug?.refunded_total || 0);
    const remaining = Math.round((totalAmount - refundedTotalPrev) * 100) / 100;

    if (!(totalAmount > 0)) {
      return json({ error: { code: "VALIDATION_ERROR", message: "Sipariş tutarı okunamadı" } }, 400);
    }
    if (remaining <= 0) {
      return json({ status: 'already_refunded', order_id: orderId, refunded_total: refundedTotalPrev }, 200);
    }

    // ── Tam iptal mi parsiyel iade mi? ────────────────────────────────────────────
    // ESKİ HATA operatör önceliğiydi; kısmen iade edilmiş bir siparişte tutarsız çağrı
    // KALAN'ı değil TOPLAM'ı istiyordu. Doğrusu: tutar verilmediyse istenen şey "kalanın
    // tamamı"dır. Tam iptal ancak hiç parsiyel yapılmamışsa söz konusudur — parsiyel
    // geçmişi varsa İyzico tarafında `cancel` değil `refund` ucu geçerlidir.
    const targetAmount = amountReq && amountReq > 0 ? Math.round(amountReq * 100) / 100 : remaining;
    if (targetAmount > remaining + 0.001) {
      return json({
        error: {
          code: "AMOUNT_EXCEEDS_REMAINING",
          message: "İstenen tutar iade edilebilir kalandan büyük",
          remaining,
          requested: targetAmount,
        },
      }, 400);
    }
    const isFull = refundedTotalPrev === 0 && Math.abs(targetAmount - totalAmount) < 0.001;

    // ── İdempotency anahtarı ──────────────────────────────────────────────────────
    // Tam iptalde türetilir: bir siparişin tam iadesi ömrü boyunca bir kezdir, dolayısıyla
    // çift tıklama/yenileme/ağ tekrarı aynı satıra düşer. Parsiyelde çağıran AÇIKÇA verir —
    // "aynı tutarı ikinci kez iade et" meşru bir istektir ve sunucu bunu kazara-tekrardan
    // ayırt EDEMEZ; ayırt ediyormuş gibi davranmak ya meşru iadeyi yutar ya kazayı geçirir.
    const idempotencyKey = isFull ? fullCancelKey(orderId) : clientKey ?? '';
    if (!idempotencyKey) {
      return json({
        error: {
          code: "IDEMPOTENCY_KEY_REQUIRED",
          message: "Parsiyel iade için idempotency_key zorunludur (aynı tutarlı iki iade birbirinden ayırt edilemez).",
        },
      }, 400);
    }

    // ══ ADIM 1: TALEBİ YAZ. Buradan sonrası ancak 'claimed' ise İyzico'ya gider. ══
    const claim = await claimRefund(ctx, {
      orderId,
      idempotencyKey,
      kind: isFull ? 'cancel' : 'refund',
      amount: targetAmount,
      actorUserId: reqUserId,
      reason,
    });

    if (claim.outcome === 'unavailable') {
      // Defter yazılamıyorsa PSP'ye GİTMEYİZ: iadenin tekrar olup olmadığını bilemeyiz
      // ve bilmeden para göndermek defterin varlık sebebini ortadan kaldırır (§3.10-A).
      await raiseRevenueAlarm(supabaseUrl, serviceKey, {
        fn: 'iyzico-refund',
        code: 'REFUND_LEDGER_UNAVAILABLE',
        message: 'İade defteri yazılamadı; iade BAŞLATILMADI (fail-closed).',
        extra: { order_id: orderId, detail: claim.message },
      });
      return json({ error: { code: "REFUND_LEDGER_UNAVAILABLE", message: claim.message } }, 503);
    }

    if (claim.outcome === 'settled') {
      return claim.attempt.state === 'succeeded'
        ? json({ status: 'already_refunded', order_id: orderId, attempt_id: claim.attempt.id, amount: claim.attempt.amount }, 200)
        : json({
            error: {
              code: "REFUND_PREVIOUSLY_FAILED",
              message: "Bu anahtarla yapılan iade daha önce BAŞARISIZ oldu. Tekrar denemek için YENİ bir idempotency_key kullanın.",
              failure_code: claim.attempt.failure_code,
            },
          }, 409);
    }

    if (claim.outcome === 'in_flight') {
      // Ya gerçekten eşzamanlı bir istek var, ya da bir süreç 1. ve 3. adım arasında öldü.
      // İkincisinde para çıkıp çıkmadığını BİLMİYORUZ; zaman aşımıyla otomatik açmak
      // çift-iade penceresini geri açar (§3.10-C). İnsan çağrılır.
      const ageMs = Date.now() - new Date(claim.attempt.created_at).getTime();
      if (ageMs > 15 * 60 * 1000) {
        await raiseRevenueAlarm(supabaseUrl, serviceKey, {
          fn: 'iyzico-refund',
          code: 'REFUND_STUCK_IN_FLIGHT',
          message: 'İade talebi 15 dakikadan uzun süredir in_flight — İyzico panelinden doğrulanmalı.',
          extra: { order_id: orderId, attempt_id: claim.attempt.id, age_minutes: Math.round(ageMs / 60000) },
        });
      }
      return json({
        error: {
          code: "REFUND_IN_PROGRESS",
          message: "Bu sipariş için bir iade zaten işleniyor. Sonuçlanmadan yenisi başlatılamaz.",
          attempt_id: claim.attempt.id,
          started_at: claim.attempt.created_at,
        },
      }, 409);
    }

    const attemptId = claim.attempt.id;

    // ══ ADIM 2: İyzico ════════════════════════════════════════════════════════════
    const payId: string | null =
      (typeof prevDebug?.paymentId === 'string' && prevDebug.paymentId) ||
      (typeof prevDebug?.raw?.paymentId === 'string' && prevDebug.raw.paymentId) ||
      null;
    const transactions: PaymentTransaction[] = Array.isArray(prevDebug?.raw?.itemTransactions)
      ? (prevDebug.raw.itemTransactions as PaymentTransaction[])
      : [];
    const ptx = transactions?.[0]?.paymentTransactionId;

    // Ödeme referansı yoksa PSP'ye anlamlı bir istek kurulamaz. Talep 'failed' kapatılır ki
    // defter takılı kalmasın; düzeltilince YENİ anahtarla tekrar denenebilir.
    if (isFull ? !payId : !ptx) {
      await settleRefund(ctx, attemptId, { state: 'failed', failureCode: 'NO_PAYMENT_REFERENCE' });
      return json({
        error: {
          code: "NO_PAYMENT_REFERENCE",
          message: isFull
            ? "Siparişte İyzico paymentId yok; iptal edilemez."
            : "Parsiyel iade için paymentTransactionId gerekli.",
        },
      }, 400);
    }

    const IyziCtorFn = iyziConstructor(Iyzipay);
    const sdk = new IyziCtorFn({ apiKey: IYZ_API, secretKey: IYZ_SEC, uri: IYZ_URI });
    const callerIp = req.headers.get('cf-connecting-ip') || '85.34.78.112';
    const LOCALE_TR = iyziLocaleTr(Iyzipay);

    let iyzResult: IyziResponse | null = null;
    try {
      iyzResult = isFull
        ? await new Promise<IyziResponse>((resolve, reject) => {
            sdk.cancel.create(
              { locale: LOCALE_TR, paymentId: payId as string, ip: callerIp },
              (err: unknown, res: IyziResponse) => (err ? reject(err) : resolve(res)),
            );
          })
        : await new Promise<IyziResponse>((resolve, reject) => {
            sdk.refund.create(
              { locale: LOCALE_TR, paymentTransactionId: ptx as string, price: String(targetAmount), currency: 'TRY', ip: callerIp },
              (err: unknown, res: IyziResponse) => (err ? reject(err) : resolve(res)),
            );
          });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // ⚠️ AĞ HATASI ≠ "para çıkmadı". İstek İyzico'ya ulaşıp cevabı yolda kaybolmuş olabilir.
      // Bu yüzden talep 'failed' DEĞİL, bilerek in_flight bırakılır: aynı anahtarla ikinci
      // deneme bloklanır ve insan İyzico panelinden doğrular (§3.10-C).
      await raiseRevenueAlarm(supabaseUrl, serviceKey, {
        fn: 'iyzico-refund',
        code: 'REFUND_PSP_UNREACHABLE',
        message: 'İyzico çağrısı hata verdi; paranın çıkıp çıkmadığı BELİRSİZ, talep in_flight bırakıldı.',
        extra: { order_id: orderId, attempt_id: attemptId, detail: msg },
      });
      return json({ error: { code: "IYZICO_ERROR", message: msg, attempt_id: attemptId } }, 502);
    }

    if (!(iyzResult && String(iyzResult.status).toLowerCase() === 'success')) {
      // İyzico açıkça reddetti → para ÇIKMADI. Talebi 'failed' kapat.
      await settleRefund(ctx, attemptId, { state: 'failed', pspResult: iyzResult, failureCode: 'IYZICO_FAIL' });
      return json({ error: { code: "IYZICO_FAIL", result: iyzResult, attempt_id: attemptId } }, 400);
    }

    // ══ BURADAN SONRASI: PARA ÇIKTI. Hiçbir hata sessizce yutulamaz (§3.10-D). ════

    // ── ADIM 3a: sipariş satırı ───────────────────────────────────────────────────
    const newRefundedTotal = Math.round((refundedTotalPrev + targetAmount) * 100) / 100;
    const fullySettled = newRefundedTotal + 0.001 >= totalAmount;
    const newPaymentStatus = fullySettled ? 'refunded' : 'partial_refunded';
    // Yaşam döngüsü statüsü yalnız tam kapanışta ve yalnız kargolanmamışsa değişir.
    const newStatus = fullySettled && order.status !== 'shipped' && order.status !== 'delivered'
      ? 'cancelled'
      : order.status;

    const partials = Array.isArray(prevDebug?.partial_refunds) ? prevDebug.partial_refunds : [];
    const newDebug: PaymentDebug = {
      ...prevDebug,
      refund_result: iyzResult,
      refund_type: isFull ? 'cancel' : 'refund',
      refund_amount: targetAmount,
      refunded_total: newRefundedTotal,
      partial_refunds: [...partials, { amount: targetAmount, at: new Date().toISOString() }],
      last_refund_attempt_id: attemptId,
    };

    const updResp = await fetch(`${supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ payment_status: newPaymentStatus, status: newStatus, payment_debug: newDebug }),
    });

    if (!updResp.ok) {
      const detail = await updResp.text().catch(() => '');
      // ESKİDEN BURASI BOŞ `catch {}` İDİ ve fonksiyon yine 200 dönüyordu: para çıkmış, DB
      // bilmiyor, bir sonraki çağrı parayı TEKRAR gönderiyor. Artık talep BİLEREK in_flight
      // bırakılır (ikinci denemeyi bloklar) ve insan çağrılır.
      await raiseRevenueAlarm(supabaseUrl, serviceKey, {
        fn: 'iyzico-refund',
        code: 'REFUND_PAID_BUT_ORDER_NOT_UPDATED',
        message: 'İyzico iadeyi ONAYLADI ama sipariş satırı güncellenemedi — elle mutabakat gerekiyor.',
        extra: { order_id: orderId, attempt_id: attemptId, amount: targetAmount, detail: detail.slice(0, 300) },
      });
      return json({
        error: {
          code: "REFUND_PAID_BUT_ORDER_NOT_UPDATED",
          message: "İade İyzico tarafında GERÇEKLEŞTİ, sipariş kaydı güncellenemedi. Tekrar denemeyin; kayıt elle düzeltilmeli.",
          attempt_id: attemptId,
        },
      }, 500);
    }

    // ── ADIM 3b: talebi kapat ─────────────────────────────────────────────────────
    const settled = await settleRefund(ctx, attemptId, {
      state: 'succeeded',
      pspReference: payId ?? ptx ?? null,
      pspResult: iyzResult,
    });
    if (!settled.ok) {
      // Sipariş doğru, defter geride kaldı. Para tekrar çıkmaz (sipariş `refunded`), ama
      // defter yalan söylüyor — sessiz geçilmez.
      await raiseRevenueAlarm(supabaseUrl, serviceKey, {
        fn: 'iyzico-refund',
        code: 'REFUND_LEDGER_NOT_SETTLED',
        message: 'İade tamamlandı ve sipariş güncellendi, ancak defter satırı in_flight kaldı.',
        extra: { order_id: orderId, attempt_id: attemptId, detail: settled.message },
      });
    }

    // ── ADIM 3c: stok — KANITA BAĞLI RPC (INV-STOCK-1) ───────────────────────────
    // Eskiden burada ürün stoğu oku-sonra-yaz ile artırılıyor ve `inventory_movements`'a
    // hiç satır yazılmıyordu. T052'den sonra satışta stok GERÇEKTEN düştüğü için o yol
    // artık çift geri-ekleme demek olurdu. RPC kanıt olarak `order_sale` hareketlerine
    // bakar, farkı (düşülen − geri verilen) hesaplar ve ikinci çağrıda no-op olur.
    let stockOutcome: Record<string, unknown> = { attempted: false };
    if (fullySettled) {
      const rpcResp = await fetch(`${supabaseUrl}/rest/v1/rpc/process_order_stock_restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_order_id: orderId, p_reason: 'order_refund' }),
      });
      // HTTP 200 tek başına başarı DEĞİL — dönen jsonb'nin `success` alanı okunur.
      const rpcBody = rpcResp.ok ? await rpcResp.json().catch(() => null) : null;
      const rpcOk = !!(rpcBody && rpcBody.success === true);
      stockOutcome = { attempted: true, ok: rpcOk, result: rpcBody };
      if (!rpcOk) {
        await raiseRevenueAlarm(supabaseUrl, serviceKey, {
          fn: 'iyzico-refund',
          code: 'REFUND_STOCK_RESTORE_FAILED',
          message: 'İade tamamlandı ama stok geri-verme RPC başarısız — envanter eksik kalmış olabilir.',
          extra: { order_id: orderId, http: rpcResp.status, result: rpcBody },
        });
      }
    }

    // ── Denetim izi (CLAUDE.md kural 11) ──────────────────────────────────────────
    // Best-effort: para hareketinin otoritesi `refund_attempts` defteridir, bu satır insan
    // okuması içindir. Yazılamazsa platform loguna düşer; akış durdurulmaz ama YUTULMAZ.
    const auditResp = await fetch(`${supabaseUrl}/rest/v1/admin_audit_log`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        actor: reqUserId,
        table_name: 'venthub_orders',
        row_pk: orderId,
        action: isFull ? 'refund_cancel' : 'refund_partial',
        after: { payment_status: newPaymentStatus, refunded_total: newRefundedTotal, amount: targetAmount, attempt_id: attemptId },
        comment: reason,
        ...(order.tenant_id ? { tenant_id: order.tenant_id } : {}),
      }),
    }).catch(() => null);
    if (!auditResp || !auditResp.ok) {
      console.error('[iyzico-refund] admin_audit_log yazilamadi', { order_id: orderId, attempt_id: attemptId });
    }

    return json({
      status: newPaymentStatus,
      type: isFull ? 'cancel' : 'refund',
      amount: targetAmount,
      refunded_total: newRefundedTotal,
      order_id: orderId,
      attempt_id: attemptId,
      stock: stockOutcome,
    }, 200);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (supabaseUrl && serviceKey) {
      await raiseRevenueAlarm(supabaseUrl, serviceKey, {
        fn: 'iyzico-refund',
        code: 'REFUND_UNEXPECTED',
        message: 'İade akışında beklenmeyen hata.',
        extra: { detail: msg },
      });
    }
    return json({ error: { code: 'UNEXPECTED', message: msg } }, 500);
  }
});
