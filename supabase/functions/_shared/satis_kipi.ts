// Çağıran sınıfı: yardımcı modül (uç değil) — ödeme oturumu açmadan önce SUNUCU TARAFI satış kipi kapısı.
//
// NİÇİN VAR (REC-355 alt işi · plan: docs/plans/rec355-satis-kipi-edge-kapisi-2026-09-29.md)
//
// Satış kipi bugün yalnız TARAYICI tarafında kontrol ediliyor (checkout RSC'si). Oturumlu bir
// kullanıcı `iyzico-payment`'a doğrudan POST atarsa kapı hiç devreye girmez: ödeme oturumu açar
// ve sipariş satırı yazar. Bu dosya kapıyı SUNUCUYA koyar.
//
// KARAR SAF FONKSİYONDUR (`satisKipiKarari`): ağ, zaman ve ortam DIŞARIDAN geçirilir, gerçek
// `Response` nesneleri döner. Handler'a gömülseydi vitest'ten sınanamazdı ve "yalnız gerçek JSON
// boolean `true` açar" iddiası kanıtsız kalırdı.
//
// FAIL-CLOSED: satır yok, bozuk, string `"true"`, sayı `1`, dizi, `null`, HTTP hatası, zaman aşımı
// → satış AÇILMAZ. Okunamayan durum (503) ile kesin KAPALI durumu (403) AYRI yanıtlardır: satış
// açıkken geçici bir DB dalgalanması sessiz "kapalı" gibi görünmesin, alarm yazılsın.
//
// DENEME İZNİ (B′ · OPS hükmü 09-29 · yedi şart):
//   1. İzin YALNIZ `resolveIyzicoBase(env).ortam === 'sandbox'` iken geçerlidir; ortam
//      belirlenemezse (null) izin YOKTUR.
//   2. Liste bir edge secret'ıdır (`SATIS_KIPI_DENEME_KULLANICILARI`), kullanıcı KİMLİĞİYLE
//      (UUID) tutulur; eşleşme doğrulanmış JWT'den gelen `userId` ile yapılır, gövdeyle değil.
//   3. İzinli sipariş denetim günlüğüne yazılır (`denemeSiparisiKaydet`); yazılamazsa sipariş
//      OLUŞMAZ (fail-closed). Bayrak `payment_debug` içine KONMAZ: `iyzico-callback` o alanı
//      ödeme sonrası tamamen yeniden yazar, bayrak kaybolurdu.
//   6. Liste doluyken ortam sandbox DEĞİLSE (canlıya geçişte liste unutulmuş) ALARM yazılır ve
//      izin verilmez.
//   İzin yalnız kesin KAPALI okumasını geçer; OKUNAMAYAN durumu (RPC yok, hata, zaman aşımı,
//   bozuk cevap) ASLA geçmez: bilinmeyen durumda herkes için kapalı.
//
// Yeni sır yok: `SATIS_KIPI_DENEME_KULLANICILARI` bir sır değil kullanıcı-kimliği listesidir ve
// kimlik doğrulamasından SONRA okunur.

import { resolveIyzicoBase } from './config_audit.ts'

export type SatisKipiNeden =
  | 'ACIK'
  | 'DENEME_IZNI'
  | 'KAPALI'
  | 'RPC_YOK'
  | 'YETKI'
  | 'HATA'
  | 'ZAMAN_ASIMI'
  | 'BOZUK_CEVAP'

export interface SatisKipiAlarm {
  code: string
  message: string
  extra: Record<string, unknown>
}

export interface SatisKipiSonuc {
  /** `null` = geç; dolu = bu yanıt aynen döndürülür. */
  engel: Response | null
  neden: SatisKipiNeden
  /** Çağıran `raiseRevenueAlarm` ile yazar; yardımcı ağa yalnız RPC okuması için çıkar. */
  alarmlar: SatisKipiAlarm[]
}

export interface SatisKipiOrtam {
  IYZICO_BASE_URL?: string
  SATIS_KIPI_DENEME_KULLANICILARI?: string
}

/** Vitest'te sahte, Deno'da gerçek `fetch`. `signal` istekle birlikte geçer. */
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal },
) => Promise<Response>

export interface SatisKipiGirdi {
  supabaseUrl: string
  serviceRoleKey: string
  /**
   * Bugün RPC'ye GİTMEZ (Faz 2 PARK, REC-88: `satis_kipi_oku()` parametresiz). İmzada durur ki
   * ileride RPC parametre alınca çağıranlar değişmesin; konformans çağıranın `caller.tenantId`
   * geçtiğini yoklar.
   */
  tenantId: string
  /** Doğrulanmış JWT'den (`caller.user.id`). İstek gövdesinden ASLA. */
  userId: string
  env: SatisKipiOrtam
  fetchImpl: FetchLike
  /** Deneme başına üst sınır; zaman aşımında BİR yeniden deneme → toplam ≤ 2 × değer. */
  zamanAsimiMs?: number
  requestId: string
  corsHeaders: Record<string, string>
}

const VARSAYILAN_ZAMAN_ASIMI_MS = 1500
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Liste ayrıştırma: virgül, noktalı virgül ve boşlukla ayrılmış UUID'ler; geçersiz girdi atılır. */
export function denemeListesiniAyristir(ham: string | undefined): string[] {
  if (!ham) return []
  return ham
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => UUID.test(s))
}

export interface DenemeIzniHukmu {
  /** Kullanıcı için izin geçerli mi (ortam sandbox VE listede). */
  var: boolean
  ortam: 'prod' | 'sandbox' | 'bilinmiyor'
  /** Ham secret boş değil (geçersiz girdiler dahil): "liste unutuldu" alarmı bunu kullanır. */
  listeDolu: boolean
}

/**
 * İzin kararı için sandbox = İyzico'nun belgelenmiş sandbox konağı, TAM eşleşme. `resolveIyzicoBase`
 * konakta "sandbox" alt dizesi arıyor (alarm/denetim için yeterli); ama para akışına dokunan bir
 * izin, `sandbox-proxy.ornek.com` gibi benzer bir konakla açılmamalı (bağımsız çürütme, bulgu 2).
 */
const SANDBOX_KONAGI = 'sandbox-api.iyzipay.com'

function tamSandboxKonagi(base: string): boolean {
  try {
    return new URL(base).hostname.toLowerCase() === SANDBOX_KONAGI
  } catch {
    return false
  }
}

export function denemeIzniHukmu(env: SatisKipiOrtam, userId: string): DenemeIzniHukmu {
  const iyz = resolveIyzicoBase({ IYZICO_BASE_URL: env.IYZICO_BASE_URL })
  // "sandbox gibi görünen" ama tam konak olmayan adres BELİRSİZ sayılır: izin açılmaz, alarm çalışır.
  const ortam: DenemeIzniHukmu['ortam'] = !iyz
    ? 'bilinmiyor'
    : iyz.ortam === 'sandbox' && !tamSandboxKonagi(iyz.base)
      ? 'bilinmiyor'
      : iyz.ortam
  const ham = (env.SATIS_KIPI_DENEME_KULLANICILARI ?? '').trim()
  const listeDolu = ham.length > 0
  const gecerli = denemeListesiniAyristir(ham)
  // Atılan girdi sessiz kalmasın: operatör "listem neden çalışmıyor" sorusunu günlükten cevaplayabilsin.
  // Yalnız SAYI yazılır, kimlik değeri yazılmaz.
  const atilan = ham.split(/[\s,;]+/).filter((s) => s.length > 0).length - gecerli.length
  if (atilan > 0) console.warn(`[satis-kipi] deneme listesinde ${atilan} geçersiz girdi atıldı (UUID bekleniyor)`)
  const listede = gecerli.includes(String(userId).trim().toLowerCase())
  return { var: ortam === 'sandbox' && listede, ortam, listeDolu }
}

type Okuma =
  | { tur: 'acik' }
  | { tur: 'kapali' }
  | { tur: 'rpc_yok' | 'yetki' | 'hata' | 'zaman_asimi' | 'bozuk'; ayrinti?: string }

/** Tek deneme: fetch + gövde okuması AYNI süre bütçesinde; sahte fetch sinyali yok sayarsa da asılmaz. */
async function birDeneme(g: SatisKipiGirdi, sureMs: number): Promise<Okuma> {
  const ctrl = new AbortController()
  let zamanlayici: ReturnType<typeof setTimeout> | undefined
  const zamanAsimi = new Promise<'zaman_asimi'>((coz) => {
    zamanlayici = setTimeout(() => {
      ctrl.abort()
      coz('zaman_asimi')
    }, sureMs)
  })
  const istek = (async (): Promise<{ status: number; metin: string }> => {
    const r = await g.fetchImpl(`${g.supabaseUrl}/rest/v1/rpc/satis_kipi_oku`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${g.serviceRoleKey}`,
        apikey: g.serviceRoleKey,
        'Content-Type': 'application/json',
      },
      // Parametresiz fonksiyon: gövdeye tenant KONMAZ (PostgREST fazladan anahtarı 404 PGRST202 ile
      // reddedip tüm satışı kapatabilir; ölçülmedi, tuzak).
      body: '{}',
      signal: ctrl.signal,
    })
    return { status: r.status, metin: await r.text() }
  })()
  // Yarışı kaybeden `istek` sonradan reddederse işlenmemiş ret olmasın.
  istek.catch(() => undefined)
  try {
    const sonuc = await Promise.race([istek, zamanAsimi])
    if (sonuc === 'zaman_asimi') return { tur: 'zaman_asimi' }
    if (sonuc.status === 404) return { tur: 'rpc_yok' }
    if (sonuc.status === 401 || sonuc.status === 403) return { tur: 'yetki' }
    if (sonuc.status < 200 || sonuc.status >= 300) return { tur: 'hata', ayrinti: `http_${sonuc.status}` }
    let cevap: unknown
    try {
      cevap = JSON.parse(sonuc.metin)
    } catch {
      return { tur: 'bozuk', ayrinti: 'json_degil' }
    }
    if (cevap === null || typeof cevap !== 'object' || Array.isArray(cevap)) {
      return { tur: 'bozuk', ayrinti: 'nesne_degil' }
    }
    const acik = (cevap as Record<string, unknown>).acik
    if (acik === true) return { tur: 'acik' }
    if (acik === false) return { tur: 'kapali' }
    // `{acik:1}`, `{acik:"true"}`, `{}`: yalnız GERÇEK boolean geçerli; ikincisi bozuk cevaptır.
    return { tur: 'bozuk', ayrinti: 'acik_boolean_degil' }
  } catch (e) {
    return { tur: 'hata', ayrinti: e instanceof Error ? e.name : 'bilinmiyor' }
  } finally {
    if (zamanlayici !== undefined) clearTimeout(zamanlayici)
  }
}

async function satisKipiniOku(g: SatisKipiGirdi): Promise<Okuma> {
  const sure = g.zamanAsimiMs ?? VARSAYILAN_ZAMAN_ASIMI_MS
  const ilk = await birDeneme(g, sure)
  // Yeniden deneme YALNIZ zaman aşımında (okuma idempotent); hata/bozuk cevap tekrarla düzelmez.
  if (ilk.tur !== 'zaman_asimi') return ilk
  return birDeneme(g, sure)
}

function yanit(g: SatisKipiGirdi, status: number, code: string, message: string, ekBaslik: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { ...g.corsHeaders, 'Content-Type': 'application/json', 'X-Request-Id': g.requestId, ...ekBaslik },
  })
}

const NEDEN_ADI: Record<Exclude<Okuma['tur'], 'acik' | 'kapali'>, SatisKipiNeden> = {
  rpc_yok: 'RPC_YOK',
  yetki: 'YETKI',
  hata: 'HATA',
  zaman_asimi: 'ZAMAN_ASIMI',
  bozuk: 'BOZUK_CEVAP',
}

export async function satisKipiKarari(g: SatisKipiGirdi): Promise<SatisKipiSonuc> {
  const alarmlar: SatisKipiAlarm[] = []
  const izin = denemeIzniHukmu(g.env, g.userId)

  // Şart 6: liste doluyken ortam sandbox değilse (canlı ya da belirsiz) HER DURUMDA alarm.
  if (izin.listeDolu && izin.ortam !== 'sandbox') {
    alarmlar.push({
      code: 'SALES_TRIAL_LIST_ON_NON_SANDBOX',
      message: 'Satış kipi deneme kullanıcı listesi dolu ama ödeme ortamı sandbox değil; liste canlıda boşaltılmalı, izin verilmedi.',
      extra: { ortam: izin.ortam },
    })
  }

  const okuma = await satisKipiniOku(g)

  if (okuma.tur === 'acik') return { engel: null, neden: 'ACIK', alarmlar }

  if (okuma.tur === 'kapali') {
    if (izin.var) return { engel: null, neden: 'DENEME_IZNI', alarmlar }
    return {
      engel: yanit(g, 403, 'SALES_CLOSED', 'Satış şu anda kapalı; teklif isteyebilirsiniz.'),
      neden: 'KAPALI',
      alarmlar,
    }
  }

  // Okunamayan durum: deneme izni GEÇMEZ; satış açıkken sessiz "kapalı" olmasın diye alarm.
  const neden = NEDEN_ADI[okuma.tur]
  alarmlar.push({
    code: 'SALES_MODE_UNREADABLE',
    message: 'Satış kipi okunamadı; ödeme oturumu açılmadı (fail-closed).',
    extra: { neden, ...(okuma.ayrinti ? { ayrinti: okuma.ayrinti } : {}) },
  })
  return {
    engel: yanit(g, 503, 'SALES_STATE_UNAVAILABLE', 'Satış durumu şu anda doğrulanamıyor; lütfen biraz sonra tekrar deneyin.', {
      'Retry-After': '30',
    }),
    neden,
    alarmlar,
  }
}

export interface DenemeKaydiGirdi {
  supabaseUrl: string
  serviceRoleKey: string
  tenantId: string
  /** Henüz yazılmamış siparişin önceden üretilmiş kimliği (`dbGeneratedId`). */
  orderId: string
  userId: string
  requestId: string
  ortam: DenemeIzniHukmu['ortam']
  fetchImpl: FetchLike
}

/**
 * Şart 3: deneme izniyle açılan HER sipariş, siparişten ÖNCE denetim günlüğüne yazılır.
 * Yazılamazsa `false` döner ve çağıran sipariş OLUŞTURMAZ (izlenemeyen deneme siparişi yan etkileri
 * — stok, kupon, e-posta, fatura — temizlenemez). `admin_audit_log` eklemeli bir tablodur;
 * `iyzico-callback` gibi sonradan yeniden yazan yolu yoktur (`payment_debug`'un aksine).
 */
export async function denemeSiparisiKaydet(g: DenemeKaydiGirdi): Promise<boolean> {
  const ctrl = new AbortController()
  const zamanlayici = setTimeout(() => ctrl.abort(), VARSAYILAN_ZAMAN_ASIMI_MS)
  try {
    const r = await g.fetchImpl(`${g.supabaseUrl}/rest/v1/admin_audit_log`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${g.serviceRoleKey}`,
        apikey: g.serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        table_name: 'venthub_orders',
        row_pk: g.orderId,
        action: 'satis_kipi_deneme_izni',
        after: { neden: 'DENEME_IZNI', user_id: g.userId, ortam: g.ortam, request_id: g.requestId },
        tenant_id: g.tenantId,
      }),
      signal: ctrl.signal,
    })
    return r.ok
  } catch {
    return false
  } finally {
    clearTimeout(zamanlayici)
  }
}
