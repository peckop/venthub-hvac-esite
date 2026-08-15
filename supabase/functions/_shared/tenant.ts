// supabase/functions/_shared/tenant.ts
//
// NİÇİN BU DOSYA VAR
// -----------------
// Eski `_shared/tenant_config.ts::resolveTenantId` tenant sınırını ÜÇ ayrı istek
// alanından çiziyordu: `?tenant_id=` query'si (her şeyden önce), imzası hiç
// doğrulanmadan elle çözülmüş JWT payload'ı, ve gövde. Üçü de saldırganın yazdığı yerler
// — yani tenant sınırı pratikte YOKTU. Fonksiyonlar bu değeri PostgREST filtresine
// (`tenant_id=eq.${tenantId}`) koyduğu için etki "başka tenant'ın satırını oku/yaz"a
// kadar gidiyordu (cetvel §3.9 · CLAUDE.md §12 "data bleeding = felaket").
//
// NİÇİN HTTP İSTEK NESNESİNİ HİÇ GÖRMÜYOR (stil tercihi DEĞİL, yapısal kilit)
// ---------------------------------------------------------------------------
// Kök sebep "sıra yanlıştı" değil, **tenant modülünün istek nesnesine erişebilmesiydi**.
// Erişim durdukça birileri er ya da geç yeniden "hızlıca şu query'yi de okuyalım" der.
// Bu yüzden dosya SAF tutulur: istek nesnesi, istek başlıkları, query parametreleri ve
// elle JWT çözme bu dosyada GEÇMEZ — hiçbiri, yorum içinde bile. Karar verirken elde
// yalnız ÇAĞIRANIN ZATEN DOĞRULADIĞI girdiler olur; doğrulamak çağıranın işidir
// (bkz. `_shared/caller.ts`).
// (`tenant-id-hardening-2026-08-15.md` §7-B bunu ileride statik kural olarak bağlayacak;
//  kural ham dosyayı tarasa bile bu dosya temiz kalsın diye yasak diziler yazılmadı.)
//
// NİÇİN SINIF BAŞINA AYRI FONKSİYON ("JWT kazanır" tek başına yetmez)
// -------------------------------------------------------------------
// Cetvel §2'deki çağıran sınıflarının kanıtı FARKLIDIR, dolayısıyla tenant kaynağı da
// farklı olmak zorundadır:
//   (a) oturumlu kullanıcı  → `user_profiles.tenant_id` (rol ile AYNI sorgudan)
//   (b) service_role        → anahtar doğrulandıktan SONRA gövdedeki alan
//   (c) harici sistem       → imza doğrulandıktan SONRA kaynağın KENDİ satırından
// Tek bir `resolveTenantId` bu üçünü aynı kaba koyduğu için en zayıf halka (query)
// hepsinin duruşunu belirliyordu. Üç ayrı fonksiyon, çağıranı sınıfını beyan etmeye
// zorlar; yanlış sınıfı kullanmak kodda görünür hâle gelir.
//
// NİÇİN "claim YOKSA hata değil" (ölçüme dayanır, tercihe değil)
// ---------------------------------------------------------------
// 2026-08-15 prod ölçümü: `auth.users` = 2 kullanıcı, İKİSİNİN DE
// `raw_app_meta_data->>'tenant_id'` alanı NULL; `user_profiles` = 2 satır, distinct
// tenant = 1. Yani `app_metadata.tenant_id` bugün HİÇBİR kullanıcıda yok. "Claim yoksa
// reddet" deseydik bugün canlı iki kullanıcının ikisi de kilitlenirdi. Bu yüzden claim
// bir OTORİTE değil, bir ÇAPRAZ KONTROLdür: yoksa profil kazanır, varsa profille
// UYUŞMAK ZORUNDADIR (plan R5).

/**
 * Tek canlı tenant. Yeni bir kimlik değil — `tenant_config.ts`'teki değerin aynısıdır;
 * Adım 6'da eski modül silindiğinde tek kopya bu olacak.
 */
export const DEFAULT_TENANT_ID = 'd3b07384-d113-495f-a558-8c38634e0000'

/**
 * Kararın NEREDEN geldiği. Log/telemetri için değil, DENETİM için: bir uç beklenmedik
 * bir kaynağa düşüyorsa (ör. sınıf-(a) ucunda `'default'`) bu, kapının çalışmadığının
 * işaretidir ve çağıran bunu görüp reddedebilir.
 */
export type TenantSource = 'user_profile' | 'service_body' | 'resource_row' | 'default'

export interface TenantDecision {
  readonly tenantId: string
  readonly source: TenantSource
}

/**
 * `auth.getUser(jwt)`'in döndürdüğü kullanıcının bu modülün ihtiyaç duyduğu dar yüzü.
 * Supabase'in tam `User` tipini import etmiyoruz: bu dosyanın ağ/SDK bağımlılığı olmamalı
 * ki saf kalsın ve testte düz nesneyle çağrılabilsin.
 */
export interface VerifiedUser {
  readonly id: string
  readonly app_metadata?: Record<string, unknown> | null
}

/**
 * Sınıf (a) rol sorgusunun döndürdüğü satır: `select role, tenant_id`.
 * İkisinin AYNI satırdan gelmesi bilinçli — cetvel §3.2 rolü, §3.9 tenant'ı ister ve
 * eski kod bunları iki ayrı kaynaktan alıp "önce tenant'ı bul ki profili filtreleyeyim"
 * döngüsüne düşüyordu.
 */
export interface TenantProfileRow {
  readonly role?: string | null
  readonly tenant_id?: string | null
}

/**
 * Doğrulanmış JWT claim'i profil satırıyla çelişiyor. Çağıran bunu **403**'e çevirir.
 * Mesaj bilerek jenerik (`tenant_mismatch`); UUID'ler alanlarda taşınır ki log'a yazılsın
 * ama cevap gövdesine kopyalanmasın.
 */
export class TenantMismatchError extends Error {
  readonly profileTenantId: string | null
  readonly claimTenantId: string

  constructor(profileTenantId: string | null, claimTenantId: string) {
    super('tenant_mismatch')
    this.name = 'TenantMismatchError'
    this.profileTenantId = profileTenantId
    this.claimTenantId = claimTenantId
  }
}

/**
 * Biçim kontrolü savunma katmanıdır, kozmetik değil: bu değer PostgREST sorgu dizesine
 * (`tenant_id=eq.<değer>`) giriyor. UUID olmayan her şeyi burada düşürmek, filtreye
 * operatör/virgül enjekte etme yüzeyini kapatır. Sürüm biti (v4) DAYATILMAZ —
 * `DEFAULT_TENANT_ID` de dahil mevcut kimlikler bu koşulu sağlamıyor.
 */
const TENANT_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Gövde/claim içinde kabul edilen alan yazımları (snake_case + camelCase). */
const TENANT_FIELD_KEYS: readonly string[] = ['tenant_id', 'tenantId']

/** Geçerliyse normalleştirilmiş (küçük harf) UUID, değilse `null`. */
function asTenantId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return TENANT_UUID_RE.test(trimmed) ? trimmed.toLowerCase() : null
}

/**
 * Serbest biçimli bir nesneden tenant alanını okur. `unknown` girdiyi burada daraltırız —
 * çağıranların `as` ile tip uydurmasına gerek kalmasın (proje kuralı: `any` yasak).
 */
function readTenantField(source: unknown): string | null {
  if (typeof source !== 'object' || source === null) return null
  const record = source as Record<string, unknown>
  for (const key of TENANT_FIELD_KEYS) {
    const candidate = asTenantId(record[key])
    if (candidate !== null) return candidate
  }
  return null
}

/**
 * Sınıf (a) — DOĞRULANMIŞ kullanıcı.
 *
 * Otorite `user_profiles.tenant_id`'dir; `user.app_metadata` yalnız çapraz kontroldür.
 * Üç durum:
 *   1. claim yok            → profil kazanır (bugünkü canlı durum: 2/2 kullanıcı böyle)
 *   2. claim var, eşit      → profil kazanır (aynı değer)
 *   3. claim var, farklı    → **throw** — çağıran 403 döner
 *
 * (3)'e "profil satırında tenant YOKKEN claim VAR" hâli de dâhildir: kullanıcının o
 * tenant'a ait olduğunu doğrulayamıyoruz demektir ve sessizce `DEFAULT_TENANT_ID`'ye
 * düşmek onu YANLIŞ tenant'a yazmak olurdu. Fail-closed seçiyoruz; bugün ulaşılamaz bir
 * dal (hiç claim yok), Faz 2'de tek doğru davranış.
 *
 * Profil satırı hiç yoksa VE claim de yoksa `DEFAULT_TENANT_ID`/`'default'` döner —
 * eski `resolveTenantId` davranışıyla aynı. Bu kullanıcıyı zaten sınıf-(a) uçlarının
 * rol kapısı reddeder; Faz 2'de "bilinmeyen tenant → 400" sıkılaştırması gerekir (plan R8).
 */
export function tenantFromVerifiedUser(
  user: VerifiedUser,
  profile: TenantProfileRow | null,
): TenantDecision {
  const fromProfile = asTenantId(profile?.tenant_id ?? null)
  const fromClaim = readTenantField(user.app_metadata ?? null)

  if (fromClaim !== null && fromClaim !== fromProfile) {
    throw new TenantMismatchError(fromProfile, fromClaim)
  }

  if (fromProfile !== null) return { tenantId: fromProfile, source: 'user_profile' }
  return { tenantId: DEFAULT_TENANT_ID, source: 'default' }
}

/**
 * Sınıf (b) — service_role ÇAĞIRANI DOĞRULANDIKTAN SONRA gövdeden.
 *
 * ÖN KOŞUL: bu fonksiyonu çağırmadan önce `Authorization` başlığının gerçekten
 * service_role anahtarı olduğu SABİT-ZAMANLI karşılaştırmayla doğrulanmış olmalıdır.
 * Doğrulanmadan çağrılırsa eski açığın aynısını üretir. Gerekçe: anahtarı bilen zaten
 * her tenant'a yazabilir; ondan tenant'ı gizlemek koruma değil, sadece esneklik kaybıdır.
 *
 * Fallback ZORUNLU: `stock-alert → notification-service` çağrısı gövdesinde tenant
 * GÖNDERMİYOR (plan R4). Fallback kaldırılırsa o bildirim zinciri kırılır.
 */
export function tenantFromServiceBody(parsedBody: unknown): TenantDecision {
  const claimed = readTenantField(parsedBody)
  if (claimed !== null) return { tenantId: claimed, source: 'service_body' }
  return { tenantId: DEFAULT_TENANT_ID, source: 'default' }
}

/**
 * Sınıf (c) — HMAC imzası doğrulandıktan SONRA, kaynağın KENDİ satırından.
 *
 * Kargo/ödeme sağlayıcısı bizim tenant UUID'lerimizi bilmez; `order_id` /
 * `tracking_number` bilir. Doğru hareket, istekten tenant OKUMAK değil, imzalı isteğin
 * işaret ettiği satırdan (`venthub_orders.tenant_id` / `venthub_returns.tenant_id`)
 * TÜRETMEKTİR. `shipping-webhook` bunu yarı yarıya zaten yapıyordu (satırı çekip
 * karşılaştırıyordu) — Adım 5 karşılaştırmayı türetmeye çevirir.
 *
 * Satır yoksa ya da tenant'ı boşsa `'default'` döner (eski satırlar için geriye
 * uyumluluk). Çağıran, satırın VARLIĞINI ayrıca doğrulamalıdır — bu fonksiyonun
 * `'default'` dönmesi "sipariş bulundu" anlamına GELMEZ.
 */
export function tenantFromRow(row: { tenant_id?: string | null } | null): TenantDecision {
  const fromRow = asTenantId(row?.tenant_id ?? null)
  if (fromRow !== null) return { tenantId: fromRow, source: 'resource_row' }
  return { tenantId: DEFAULT_TENANT_ID, source: 'default' }
}
