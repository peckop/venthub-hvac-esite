// Çağıran sınıfı: yardımcı modül (uç değil) — dış para hareketini TEK SEFERLİK kılar.
//
// NİÇİN VAR (T053-VH · 2026-08-15 operasyon döngüsü denetimi §3)
//
// `iyzico-refund` dosyasının başlığında 2025'ten beri "Idempotent" yazıyordu. Kodda
// idempotency YOKTU. Tek koruma şuydu:
//
//     if (order.payment_status === 'refunded') return already_refunded
//
// Bu bir **read-then-act**: okuma ile İyzico çağrısı arasındaki pencerede ikinci bir
// istek aynı okumayı yapar, aynı guard'ı geçer ve GERÇEK PARA ikinci kez çıkar. Aynı
// dosyada `manual_refund_applied` diye bir bayrak yazılıyordu ama **hiçbir yerde
// okunmuyordu** — yorum "idempotent by flag" diyordu, bayrak ölüydü.
//
// Daha sinsi ikinci yol: PSP çağrısından SONRAKİ sipariş güncellemesi boş `catch {}`
// içindeydi. Yazma düşerse fonksiyon yine `200 {status:'refunded'}` dönüyordu; veritabanı
// iadeyi hiç görmüyordu, dolayısıyla bir sonraki çağrı guard'ı geçip parayı TEKRAR iade
// ediyordu. Yani "para çıktı ama kayıt düştü" hâli, kendi başına bir çift-iade üreteciydi.
//
// ── Çözümün şekli ───────────────────────────────────────────────────────────────
// Uygulama katmanında çözülemez: iki ayrı istek arasındaki yarışı ancak ortak bir
// serileştirme noktası kapatır. Burada o nokta veritabanının benzersiz indeksidir
// (`refund_attempts_key_uniq`). Sıra BİLİNÇLİ olarak şudur:
//
//     1. talebi YAZ      → unique çakıştıysa İyzico'ya HİÇ GİTME
//     2. İyzico'yu çağır
//     3. sonucu aynı satıra işle
//
// "Önce yaz" kısmı kritiktir. Tersi (önce çağır, sonra yaz) tam olarak bugünkü hatadır:
// yazma düşerse para hareketinin hiçbir izi kalmaz.
//
// ── Takılı kalan talep OTOMATİK açılmaz ─────────────────────────────────────────
// Süreç 1. ve 3. adım arasında ölürse satır `in_flight` kalır. Bu, "para çıktı mı
// BİLMİYORUZ" demektir. Zaman aşımıyla otomatik serbest bırakmak, kapatmaya çalıştığımız
// çift-iade penceresini geri açar — üstelik en kötü anda, yani PSP'nin yavaş olduğu anda.
// Bu yüzden burada fail-closed davranış, İNSAN kararı istemektir: 409 + gelir alarmı.

import { tenantFromRow } from './tenant.ts'

export type RefundAttemptState = 'in_flight' | 'succeeded' | 'failed'

export type RefundAttemptRow = {
  id: string
  order_id: string
  idempotency_key: string
  kind: 'cancel' | 'refund'
  amount: number
  state: RefundAttemptState
  psp_reference: string | null
  failure_code: string | null
  created_at: string
  settled_at: string | null
}

export type ClaimResult =
  /** Talep bize ait — PSP çağrısı YAPILABİLİR. */
  | { outcome: 'claimed'; attempt: RefundAttemptRow }
  /** Aynı anahtarla bir talep zaten SONUÇLANMIŞ — PSP'ye gitme, sonucu aynen döndür. */
  | { outcome: 'settled'; attempt: RefundAttemptRow }
  /** Aynı anahtar hâlâ uçuşta — eşzamanlı istek ya da takılı kalmış talep. */
  | { outcome: 'in_flight'; attempt: RefundAttemptRow }
  /** Defter yazılamadı. Fail-closed: PSP'ye GİTME. */
  | { outcome: 'unavailable'; status: number; message: string }

const PG_UNIQUE_VIOLATION = '23505'

/**
 * Tam iptal için sunucu tarafından türetilen anahtar.
 *
 * Bir siparişin TAM iadesi ömrü boyunca en fazla bir kez olabilir; bu yüzden anahtar
 * sipariş kimliğinden türetilir. Çift tıklama, sekme yenileme ve ağ tekrar denemesi
 * aynı satıra düşer — çağıranın bir şey hatırlaması gerekmez.
 *
 * Parsiyel iade için BİLEREK anahtar türetilmez: "aynı tutarı ikinci kez iade et"
 * meşru bir istek olabilir ve sunucu bunu kazara-tekrardan ayırt EDEMEZ. Ayırt
 * ediyormuş gibi yapmak, ya meşru iadeyi sessizce yutar ya da kazayı geçirir.
 * O yüzden parsiyelde anahtarı çağıran açıkça verir (aşağıda zorlanır).
 */
export function fullCancelKey(orderId: string): string {
  return `full:${orderId}`
}

type Ctx = { supabaseUrl: string; serviceRoleKey: string }

function restHeaders(serviceRoleKey: string, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    'Content-Type': 'application/json',
    ...extra,
  }
}

async function fetchAttempt(
  ctx: Ctx,
  orderId: string,
  key: string,
): Promise<RefundAttemptRow | null> {
  const url =
    `${ctx.supabaseUrl}/rest/v1/refund_attempts` +
    `?order_id=eq.${encodeURIComponent(orderId)}` +
    `&idempotency_key=eq.${encodeURIComponent(key)}` +
    `&select=id,order_id,idempotency_key,kind,amount,state,psp_reference,failure_code,created_at,settled_at`
  const resp = await fetch(url, { headers: restHeaders(ctx.serviceRoleKey) })
  if (!resp.ok) return null
  const rows = await resp.json().catch(() => [])
  return Array.isArray(rows) && rows[0] ? (rows[0] as RefundAttemptRow) : null
}

/**
 * Para hareketini TALEP ET. Yalnız `outcome === 'claimed'` dönerse PSP çağrılabilir.
 *
 * `unavailable` dönerse çağıran **iade işlemini durdurmalıdır**. Defter yazılamıyorsa
 * o iadenin tekrarlanıp tekrarlanmadığını bilemeyiz; bilmeden para göndermek, defterin
 * var olma sebebini ortadan kaldırır.
 */
export async function claimRefund(
  ctx: Ctx,
  input: {
    orderId: string
    idempotencyKey: string
    kind: 'cancel' | 'refund'
    amount: number
    actorUserId?: string | null
    reason?: string | null
  },
): Promise<ClaimResult> {
  // ── TENANT: çağırandan ALINMAZ, sipariş SATIRINDAN türetilir ──────────────────
  // İlk sürümde `input.tenantId` diye bir parametre vardı ve çağıran onu sipariş
  // satırından doldurduğu için "doğru" görünüyordu. R11 kapısı bunu YENİ İHLAL olarak
  // yakaladı ve haklıydı: parametrenin var olması, bir sonraki çağıranın oraya istekten
  // gelen bir değeri koyabilmesi demektir (T026'nın kök sebebi tam olarak buydu —
  // sıralamayı düzeltmek yeteneği yerinde bırakır, cetvel §3.9/R11-B).
  //
  // Parametreyi yeniden ADLANDIRIP kapıyı susturmak, kapıyı kandırmak olurdu. Doğrusu
  // yeteneği silmek: tenant burada, service_role ile okunan siparişin kendi satırından
  // `tenantFromRow` ile türetilir. Böylece bu fonksiyona yanlış tenant GEÇİRİLEMEZ.
  const ordResp = await fetch(
    `${ctx.supabaseUrl}/rest/v1/venthub_orders?id=eq.${encodeURIComponent(input.orderId)}&select=tenant_id`,
    { headers: restHeaders(ctx.serviceRoleKey) },
  ).catch(() => null)
  const ordRows = ordResp?.ok ? await ordResp.json().catch(() => []) : []
  const ordRow = Array.isArray(ordRows) && ordRows[0] ? (ordRows[0] as { tenant_id?: string | null }) : null
  const { tenantId, source: tenantSource } = tenantFromRow(ordRow)

  // Değişken adı `row` — `payload` DEĞİL. Bu depoda `payload`/`body`/`parsedBody`
  // "gelen istek gövdesi" anlamına gelir ve R11 kapısı tam olarak o adları tenant
  // okumasıyla birlikte arar. Burası gelen bir gövde değil, INSERT edilecek bir satır;
  // yanlış ad hem kapıyı yanlış-kırmızı yaktı hem de okuyanı yanıltıyordu.
  const row: Record<string, unknown> = {
    order_id: input.orderId,
    idempotency_key: input.idempotencyKey,
    kind: input.kind,
    amount: input.amount,
    state: 'in_flight',
    actor_user_id: input.actorUserId ?? null,
    reason: input.reason ?? null,
  }
  // Yalnız GERÇEKTEN satırdan türetebildiysek yazılır. `tenantFromRow` bulamazsa
  // DEFAULT'a düşer; o uydurulmuş değeri yazmak satırı yanlış tenant'a gömer, oysa
  // tablo varsayılanı zaten aynı işi dürüstçe yapar.
  if (tenantSource === 'resource_row') row.tenant_id = tenantId

  let resp: Response
  try {
    resp = await fetch(`${ctx.supabaseUrl}/rest/v1/refund_attempts`, {
      method: 'POST',
      headers: restHeaders(ctx.serviceRoleKey, { Prefer: 'return=representation' }),
      body: JSON.stringify(row),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { outcome: 'unavailable', status: 503, message: `defter yazilamadi: ${message}` }
  }

  if (resp.ok) {
    const rows = await resp.json().catch(() => [])
    const created = Array.isArray(rows) ? rows[0] : rows
    if (created?.id) return { outcome: 'claimed', attempt: created as RefundAttemptRow }
    // 2xx ama satır okunamadı: talebin yazılıp yazılmadığı belirsiz → fail-closed.
    return { outcome: 'unavailable', status: 500, message: 'defter satiri okunamadi' }
  }

  const bodyText = await resp.text().catch(() => '')

  // ★ Yarışın kaybedeni buraya düşer. Bu bir HATA değil, mekanizmanın ta kendisidir.
  if (resp.status === 409 || bodyText.includes(PG_UNIQUE_VIOLATION)) {
    const existing = await fetchAttempt(ctx, input.orderId, input.idempotencyKey)
    if (!existing) {
      // Çakışma var ama satır okunamıyor — durumu bilmeden para gönderemeyiz.
      return { outcome: 'unavailable', status: 503, message: 'cakisan talep okunamadi' }
    }
    return existing.state === 'in_flight'
      ? { outcome: 'in_flight', attempt: existing }
      : { outcome: 'settled', attempt: existing }
  }

  return {
    outcome: 'unavailable',
    status: 503,
    message: `defter yazilamadi (${resp.status}): ${bodyText.slice(0, 200)}`,
  }
}

/**
 * Talebi sonuçlandır. PSP çağrısından SONRA çağrılır.
 *
 * Bu yazma BAŞARISIZ OLURSA çağıran sessizce başarı dönmemelidir: para çıkmış ama
 * defterde `in_flight` kalmış demektir ve o satır bir sonraki denemeyi bloklayacaktır —
 * ki doğrusu budur. Çağıran 500 + alarm ile insanı çağırır.
 */
export async function settleRefund(
  ctx: Ctx,
  attemptId: string,
  outcome: { state: 'succeeded' | 'failed'; pspReference?: string | null; pspResult?: unknown; failureCode?: string | null },
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const resp = await fetch(
      `${ctx.supabaseUrl}/rest/v1/refund_attempts?id=eq.${encodeURIComponent(attemptId)}`,
      {
        method: 'PATCH',
        headers: restHeaders(ctx.serviceRoleKey, { Prefer: 'return=minimal' }),
        body: JSON.stringify({
          state: outcome.state,
          psp_reference: outcome.pspReference ?? null,
          psp_result: outcome.pspResult ?? null,
          failure_code: outcome.failureCode ?? null,
          settled_at: new Date().toISOString(),
        }),
      },
    )
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '')
      return { ok: false, message: `defter guncellenemedi (${resp.status}): ${detail.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}
