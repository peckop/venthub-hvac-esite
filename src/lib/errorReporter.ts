/**
 * Frontend hata raporlayıcı — T014-VH.
 *
 * ÖNCEKİ DURUM (bilinçli olarak değiştirildi): bu modül `const manualReporter = null`
 * tutuyordu; `const` olduğu için hiçbir yerden atanamıyordu, dolayısıyla `reportError()`
 * production'da HİÇBİR ŞEY yapmıyordu. Aynı anda `supabase/functions/log-client-error`
 * uç noktası canlıydı (client_errors + error_groups tablolarına yazıyor, kritik seviyede
 * Slack bildirimi atıyor, admin ekranında görünüyor) ama `src/` içinde onu çağıran tek bir
 * yer yoktu. Bu dosya o boşluğu kapatır: reportError artık o uca POST atar.
 *
 * ── log-client-error SÖZLEŞMESİ (supabase/functions/log-client-error/index.ts) ──
 *   POST /functions/v1/log-client-error   (OPTIONS = CORS preflight, diğer metodlar 405)
 *   Gövde (zod, hepsinin default'u var → hepsi teknik olarak opsiyonel):
 *     msg: string · stack: string · url: string · ua: string · release: string
 *     env: string · level: string (default 'error') · extra: Record<string, unknown> | null
 *   Auth: fonksiyon içinde REQUIRE_AUTH (default 'true') → `Authorization: Bearer <token>`
 *         ZORUNLU ve token `auth.getUser()` ile doğrulanır. Bu yüzden oturum varsa
 *         kullanıcının access_token'ını, yoksa anon key'i gönderiyoruz (anon key ile
 *         REQUIRE_AUTH=true iken 401 döner — sessizce yutulur, kullanıcı etkilenmez).
 *   Sunucu tarafı ayrıca: PII maskeleme (e-posta + 20+ karakterlik token benzeri diziler),
 *   4000 karaktere kırpma, imzaya göre gruplama ve DEDUP_SECONDS (default 5sn) dedup yapar.
 *
 * ── NE GÖNDERİYORUZ ──
 *   msg     : hata mesajı (300 karaktere kırpılmış)
 *   stack   : stack trace (2000 karaktere kırpılmış)
 *   url     : SADECE origin + pathname — query string ve hash BİLEREK ATILIR
 *             (?token=, ?email=, ?orderId= gibi parametreler PII/sır taşıyabilir)
 *   ua      : navigator.userAgent (tarayıcı/sürüm teşhisi için; sunucu ayrıca maskeler)
 *   env     : NODE_ENV · release: NEXT_PUBLIC_APP_VERSION (tanımlıysa)
 *   level   : sabit 'error'
 *   extra   : çağıranın verdiği context — hassas anahtarlar (token/jwt/secret/password/
 *             email/phone/address/card/iban/cookie/session/auth/key...) ELENİR, kalan
 *             değerler primitife indirgenip 500 karaktere kırpılır.
 *
 * ── NE GÖNDERMİYORUZ (bilerek) ──
 *   Erişim token'ı/JWT gövdede yok (yalnız Authorization başlığında), e-posta, ad-soyad,
 *   adres, telefon, kart/ödeme bilgisi, çerez, localStorage içeriği, tam URL query'si,
 *   kullanıcı kimliği (context'te gelse bile hassas-anahtar filtresine takılır).
 */

/** Çağıranların verdiği serbest metadata. */
type ErrorContext = Record<string, unknown>

/** log-client-error zod şemasının BİREBİR karşılığı. */
interface ClientErrorPayload {
  msg: string
  stack: string
  url: string
  ua: string
  release: string
  env: string
  level: string
  extra: Record<string, unknown> | null
}

const ENDPOINT_PATH = '/functions/v1/log-client-error'

/** Aynı imzalı hata bu pencere içinde yeniden gönderilmez (render döngüsü koruması). */
const DEDUP_WINDOW_MS = 30_000
/** Sayfa ömrü boyunca gönderilecek azami rapor sayısı (sonsuz döngü sigortası). */
const MAX_REPORTS_PER_PAGE = 20
/** İmza tablosu üst sınırı — bellek sızıntısı olmasın. */
const MAX_SIGNATURES = 100

const MSG_MAX = 300
const STACK_MAX = 2000
const EXTRA_VALUE_MAX = 500

/** Bu deseni içeren context anahtarları hiç gönderilmez. */
const SENSITIVE_KEY_PATTERN =
  /(token|jwt|secret|password|passwd|auth|apikey|api_key|key|email|mail|phone|tel|address|adres|card|kart|iban|pan|cvv|cvc|tckn|session|cookie|credential)/i

const lastSentAt = new Map<string, number>()
let sentCount = 0

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}

function describeError(err: unknown): { message: string; stack: string } {
  if (err instanceof Error) {
    return { message: err.message || err.name, stack: err.stack ?? '' }
  }
  if (typeof err === 'string') return { message: err, stack: '' }
  try {
    return { message: JSON.stringify(err) ?? String(err), stack: '' }
  } catch {
    return { message: String(err), stack: '' }
  }
}

/** Query/hash'siz sayfa adresi — PII sızıntısının en olası kaynağı query'dir. */
function safePageUrl(): string {
  try {
    const loc = window.location
    if (!loc) return ''
    return `${loc.origin ?? ''}${loc.pathname ?? ''}`
  } catch {
    return ''
  }
}

function safeUserAgent(): string {
  try {
    return truncate(navigator?.userAgent ?? '', 300)
  } catch {
    return ''
  }
}

/** Hassas anahtarları eler, kalan değerleri primitife indirger ve kırpar. */
function sanitizeContext(context?: ErrorContext): Record<string, unknown> | null {
  if (!context || typeof context !== 'object') return null
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue
    if (value === null || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value
      continue
    }
    if (typeof value === 'string') {
      out[key] = truncate(value, EXTRA_VALUE_MAX)
      continue
    }
    // Nesne/dizi/fonksiyon: içeriğini göndermek yerine yalnız türünü bildiriyoruz.
    out[key] = `[${typeof value}]`
  }
  return Object.keys(out).length > 0 ? out : null
}

/**
 * Oturum varsa kullanıcının access_token'ı, yoksa anon key.
 * Supabase client'ı BİLEREK dinamik import ediliyor: errorReporter global ağaçta
 * (ErrorBoundary) yer aldığı için statik import supabase-js'i her bundle'a çekerdi.
 */
async function resolveBearerToken(anonKey: string): Promise<string> {
  try {
    const { supabaseBrowserClient } = await import('./supabase/client')
    const { data } = await supabaseBrowserClient.auth.getSession()
    return data?.session?.access_token || anonKey
  } catch {
    return anonKey
  }
}

/** Fire-and-forget: await EDİLMEZ, throw ETMEZ, kullanıcı akışını bloklamaz. */
function sendToEdge(payload: ClientErrorPayload): void {
  void (async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      if (!baseUrl || !anonKey) return
      if (typeof fetch !== 'function') return

      const bearer = await resolveBearerToken(anonKey)
      await fetch(`${baseUrl}${ENDPOINT_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(payload),
        // Sayfa kapanırken de gitsin (unload sırasında iptal edilmesin).
        keepalive: true,
      })
    } catch {
      // Raporlama hatası sessizce yutulur: raporlayıcı asla yeni hata üretmez.
    }
  })()
}

/**
 * Bir hatayı `log-client-error` edge fonksiyonuna raporlar.
 *
 * Davranış:
 *  - Yalnız tarayıcıda çalışır (SSR/RSC'de no-op).
 *  - Production'da gönderir. Development'ta varsayılan olarak yalnız `console.warn` eder;
 *    `NEXT_PUBLIC_ERROR_REPORTING=on` ile dev'de de gönderim açılabilir.
 *  - Fire-and-forget + asla throw etmez: çağıranın akışı hiçbir koşulda etkilenmez.
 *  - De-dup: aynı imzalı (mesaj + ilk stack satırı + yol) hata 30 saniyede bir kez,
 *    sayfa başına toplam en fazla 20 rapor gönderilir.
 *
 * @param err - Hata nesnesi veya bilinmeyen değer
 * @param context - Opsiyonel metadata (hassas anahtarlar elenir)
 *
 * @example
 * try { throw new Error('Something went wrong') }
 * catch (e) { reportError(e, { context: 'Callback verify error' }) }
 */
export function reportError(err: unknown, context?: ErrorContext): void {
  try {
    if (typeof window === 'undefined' || !window) return

    const { message, stack } = describeError(err)
    const isProduction = process.env.NODE_ENV === 'production'
    const forceEnabled = process.env.NEXT_PUBLIC_ERROR_REPORTING === 'on'

    if (!isProduction) {
      // Dev görünürlüğü korunuyor (eski davranış).
      console.warn('[errorReporter]', err, context)
    }
    if (!isProduction && !forceEnabled) return

    const url = safePageUrl()
    const firstStackLine = stack.split('\n')[0] ?? ''
    const signature = `${message}::${firstStackLine}::${url}`

    const now = Date.now()
    const last = lastSentAt.get(signature)
    if (last !== undefined && now - last < DEDUP_WINDOW_MS) return
    if (sentCount >= MAX_REPORTS_PER_PAGE) return
    if (lastSentAt.size >= MAX_SIGNATURES) lastSentAt.clear()
    lastSentAt.set(signature, now)
    sentCount += 1

    sendToEdge({
      msg: truncate(message, MSG_MAX),
      stack: truncate(stack, STACK_MAX),
      url,
      ua: safeUserAgent(),
      release: process.env.NEXT_PUBLIC_APP_VERSION || '',
      env: process.env.NODE_ENV || '',
      level: 'error',
      extra: sanitizeContext(context),
    })
  } catch {
    // Raporlayıcının kendi hatası çağıranı ASLA etkilemez.
  }
}
