// supabase/functions/_shared/caller.ts
//
// NİÇİN BU DOSYA VAR
// -----------------
// Cetvel §3.2/§3.3'ün kanonik kapısı ("kimlik → yetki → ancak sonra service_role")
// bugün 5 bildirim ucunda + 3 admin ucunda KOPYALA-YAPIŞTIR hâlde duruyor ve her kopya
// birbirinden biraz farklı: kimi `getUser`'ı tenant çözümünden SONRA çağırıyor, kimi rol
// satırını `tenant_id` ile filtreliyor, kimi hata dalında sessizce devam ediyor. Sekiz
// kopya = sekiz farklı güvenlik duruşu; birini düzeltmek diğer yediyi düzeltmiyor.
// Bu modül o kapıyı TEK yere indirir: `resolveCaller(request, parsedBody)`.
//
// NİÇİN ROL VE TENANT AYNI SORGUDAN
// ----------------------------------
// Eski kod önce tenant'ı çözüyor, sonra profili `id=eq.<x>&tenant_id=eq.<tenant>` ile
// filtreliyordu — yani "kullanıcının tenant'ını öğrenmek için tenant'ı bilmek" gerekiyordu.
// Bu döngü, tenant'ın istekten okunmasının GEREKÇESİYDİ. Döngüyü kırmanın tek yolu:
// filtre YALNIZ doğrulanmış `user.id`, `select` ise `role, tenant_id` — tek satır, tek
// round-trip, sıfır ek maliyet. Tenant artık sorgunun GİRDİSİ değil, SONUCU.
//
// NİÇİN `getUser` EN FAZLA BİR KEZ
// ---------------------------------
// 12 çağıranın 8'i zaten kendi `getUser`'ını çağırıyor. Tenant modülü kendi başına bir
// `getUser` daha yapsaydı o 8 uçta İKİNCİ bir Auth round-trip'i doğardı (performans
// regresyonu). Burada tek çağrı var ve sonucu (`user` + `role` + `tenantId`) çağırana
// birlikte veriliyor; çağıranın ayrıca `getUser` çağırmasına gerek kalmaz.
//
// NİÇİN SABİT-ZAMANLI ANAHTAR KARŞILAŞTIRMASI
// --------------------------------------------
// `authHeader === 'Bearer ' + serviceKey` erken çıkışlı bir karşılaştırmadır; teorik
// olarak anahtar baytları zamanlamayla sızdırılabilir. Sır karşılaştırmasında sabit-zamanlı
// olmak cetvel §3.5'in webhook imzaları için zaten dayattığı disiplin — service_role
// anahtarı ondan daha değerli olduğu için aynı disiplin burada da uygulanır.
//
// NE YAPMAZ
// ---------
// Karar VERMEZ, yalnız KANITI TOPLAR. "Bu `kind`/`role` bu ucu çağırabilir mi?" sorusunu
// çağıran uç yanıtlar (401/403 onun sorumluluğu) — çünkü cevap uca göre değişir:
// sınıf (a) uçları rol ister, sınıf (a+b) uçları service_role'ü de kabul eder.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import {
  DEFAULT_TENANT_ID,
  tenantFromServiceBody,
  tenantFromVerifiedUser,
  type TenantProfileRow,
  type TenantSource,
  type VerifiedUser,
} from './tenant.ts'

/** Çağıran, `TenantMismatchError`'ı 403'e çevirir; ayrıca import etmek zorunda kalmasın. */
export { TenantMismatchError } from './tenant.ts'

/**
 * Cetvel §2'nin sınıflarının RUNTIME karşılığı:
 *   `service_role` → sınıf (b) · `user` → sınıf (a) · `anon` → kanıtsız çağıran.
 * Sınıf (c)/(d) burada YOKTUR: onların kanıtı HMAC imzası/`pg_cron`'dur, `Authorization`
 * başlığı değil. O uçlar `resolveCaller` kullanmaz, `tenantFromRow`'u kullanır.
 */
export type CallerKind = 'service_role' | 'user' | 'anon'

export interface CallerContext {
  readonly kind: CallerKind
  /** Yalnız `kind === 'user'` iken dolu; `id` DAİMA doğrulanmış JWT'den gelir. */
  readonly user: VerifiedUser | null
  /** `user_profiles.role` — tenant ile AYNI satırdan. Profil satırı yoksa undefined. */
  readonly role?: string
  readonly tenantId: string
  readonly source: TenantSource
}

/** Ortam değişkeni eksik — çağıran **500 CONFIG_MISSING** döner. */
export class CallerConfigError extends Error {
  constructor(missing: string) {
    super(`CONFIG_MISSING:${missing}`)
    this.name = 'CallerConfigError'
  }
}

/**
 * Profil satırı OKUNAMADI (DB/ağ hatası — "satır yok" DEĞİL). Çağıran **500/503** döner.
 * Bilerek fail-closed: sorgu hatasını "tenant'ı yok" sayıp `DEFAULT_TENANT_ID`'ye düşmek,
 * rol kapısı olmayan uçlarda (ör. `iyzico-payment`) kullanıcıyı YANLIŞ tenant'a yazardı.
 */
export class CallerLookupError extends Error {
  constructor(detail: string) {
    super(`PROFILE_LOOKUP_FAILED:${detail}`)
    this.name = 'CallerLookupError'
  }
}

const BEARER_PREFIX_RE = /^Bearer\s+/i

/** `Authorization` başlığındaki ham token (yoksa null). Başlık araması büyük/küçük harf duyarsızdır. */
function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  if (!header) return null
  const token = header.replace(BEARER_PREFIX_RE, '').trim()
  return token.length > 0 ? token : null
}

/**
 * Sabit-zamanlı dize karşılaştırması. Uzunluk farkı da zamanlamaya sızmasın diye döngü
 * UZUN olanın boyunda döner ve uzunluk farkı biriktirilen farka XOR'lanır.
 */
function timingSafeEquals(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  let diff = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0)
  }
  return diff === 0
}

/**
 * PostgREST'ten dönen satırı daraltır. SDK jenerik `Database` tipi olmadan çağrıldığı için
 * dönen değer tipsizdir; tip zorlamasıyla "öyle varsaymak" yerine RUNTIME kontrolü yapılır
 * (strict TS + proje kuralı: tip uydurmak yasak).
 */
function toProfileRow(value: unknown): TenantProfileRow | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  return {
    role: typeof record.role === 'string' ? record.role : null,
    tenant_id: typeof record.tenant_id === 'string' ? record.tenant_id : null,
  }
}

const ANONYMOUS: CallerContext = {
  kind: 'anon',
  user: null,
  tenantId: DEFAULT_TENANT_ID,
  source: 'default',
}

/**
 * Çağıranın KANITINI toplar: kimdir, hangi rolü vardır, hangi tenant'a aittir.
 *
 * Sıra sabittir ve cetvel §3.6'nın "önce kimlik → sonra yetki → ancak sonra service_role"
 * kuralının kendisidir:
 *   1. Token yok                             → `anon` (çağıran karar verir)
 *   2. Token == service_role (sabit-zamanlı) → sınıf (b); tenant gövdeden, ANCAK ŞİMDİ
 *   3. Aksi hâlde `auth.getUser(token)`      → imzayı YALNIZ Supabase doğrular (§3.3)
 *   4. Doğrulanan `id` ile TEK profil sorgusu → `role` + `tenant_id`
 *
 * `parsedBody` yalnız (2) dalında okunur. Kullanıcı JWT'siyle gelen bir istekte gövdedeki
 * `tenant_id` alanı **hiç dikkate alınmaz** — eski açığın tam olarak kapandığı yer burası.
 *
 * Atabileceği hatalar: `CallerConfigError` (500), `CallerLookupError` (500/503),
 * `TenantMismatchError` (403). Çağıran bunları HTTP durumuna çevirmekle yükümlüdür;
 * yakalamazsa uç 500 döner — yani fail-closed.
 */
export async function resolveCaller(
  request: Request,
  parsedBody?: unknown,
): Promise<CallerContext> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  if (!supabaseUrl) throw new CallerConfigError('SUPABASE_URL')
  if (!serviceRoleKey) throw new CallerConfigError('SUPABASE_SERVICE_ROLE_KEY')
  if (!anonKey) throw new CallerConfigError('SUPABASE_ANON_KEY')

  const token = bearerToken(request)
  if (token === null) return ANONYMOUS

  // (b) — anahtarı bilen zaten her tenant'a yazabilir; gövdeyi ANCAK bu doğrulamadan
  // sonra okumak meşrudur.
  if (timingSafeEquals(token, serviceRoleKey)) {
    const decision = tenantFromServiceBody(parsedBody)
    return {
      kind: 'service_role',
      user: null,
      tenantId: decision.tenantId,
      source: decision.source,
    }
  }

  // (a) — imza doğrulaması. Token AÇIKÇA geçirilir: argümansız `getUser()` edge'de
  // oturum deposu olmadığı için DAİMA 401 verir (§3.3).
  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } })
  const { data: userData, error: userError } = await authClient.auth.getUser(token)
  const authUser = userData?.user ?? null
  if (userError || !authUser) {
    // Geçersiz JWT ya da anon key ile gelen tarayıcı isteği. 401 kararı çağıranındır:
    // `iyzico-callback` gibi sınıf (c+a) uçları bu durumda da meşru çalışmalıdır.
    return ANONYMOUS
  }

  const user: VerifiedUser = {
    id: authUser.id,
    app_metadata: authUser.app_metadata ?? null,
  }

  // Rol VE tenant tek satırdan. Filtre YALNIZ doğrulanmış `id` — buraya bir tenant
  // filtresi eklemek eski döngüyü geri getirir (bkz. dosya başı).
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: profileData, error: profileError } = await admin
    .from('user_profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw new CallerLookupError(profileError.message)

  const profile = toProfileRow(profileData)
  const decision = tenantFromVerifiedUser(user, profile)

  return {
    kind: 'user',
    user,
    role: profile?.role ?? undefined,
    tenantId: decision.tenantId,
    source: decision.source,
  }
}
