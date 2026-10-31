import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * ALT-76 · Supabase → Next webhook imzası (CLAUDE.md kural 11: HMAC-SHA256 + replay guard).
 *
 * İmza biçimi: hex(HMAC-SHA256(anahtar = paylaşılan secret, mesaj = `${zaman}.${hamGövde}`)).
 * Zaman damgası saniye cinsinden Unix zamanıdır (`x-webhook-timestamp`), imza
 * `x-webhook-signature` başlığında gelir. Mesaja zaman damgası girdiği için imzalı bir
 * gövde, pencere dışında yeniden oynatılamaz.
 *
 * Bu modül SAF'tır (env/istek okumaz): rota secret listesini ve saati verir, burada karar çıkar.
 */

/** Zaman damgası toleransı: bundan eski ya da bundan ileri istek reddedilir. */
export const IMZA_PENCERESI_MS = 5 * 60 * 1000

export type ImzaSonucu = 'gecerli' | 'imza-yok' | 'gecersiz' | 'bayat'

export function imzaUret(secret: string, zamanSn: string, hamGovde: string): string {
  return createHmac('sha256', secret).update(`${zamanSn}.${hamGovde}`).digest('hex')
}

function hexEsit(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  // timingSafeEqual uzunluk eşitsizliğinde fırlatır; uzunluk bilgisi zaten gizli değil.
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/**
 * `imza` yoksa 'imza-yok' (çağıran eski secret yoluna düşebilir). İmza VARSA karar kesindir:
 * zaman damgası eksik/bozuk/pencere dışı → 'bayat', hiçbir kabul edilen secret ile
 * eşleşmiyorsa → 'gecersiz'. Bu yüzden imzalı ama geçersiz istek düz secret ile kurtarılamaz.
 */
export function imzaDogrula(args: {
  secrets: readonly string[]
  zamanSn: string | null
  imza: string | null
  hamGovde: string
  simdiMs: number
}): ImzaSonucu {
  const { secrets, zamanSn, imza, hamGovde, simdiMs } = args
  if (!imza) return 'imza-yok'
  if (!zamanSn || !/^\d{9,12}$/.test(zamanSn)) return 'bayat'
  const zamanMs = Number(zamanSn) * 1000
  if (Math.abs(simdiMs - zamanMs) > IMZA_PENCERESI_MS) return 'bayat'
  const kucuk = imza.toLowerCase()
  for (const secret of secrets) {
    if (hexEsit(kucuk, imzaUret(secret, zamanSn, hamGovde))) return 'gecerli'
  }
  return 'gecersiz'
}

/**
 * Replay koruması: pencere içinde aynı imza ikinci kez gelirse reddedilir.
 * SINIR (kasıtlı, belgelenmiş): bellek içi ve sunucusuz örnek başına; örnekler arası
 * paylaşım YOK. Asıl koruma zaman damgası penceresidir; bu küme aynı örneğe düşen
 * tekrarları keser. Kalıcı tekilleştirme (DB) migration gerektirir ve ayrı karardır.
 */
const gorulen = new Map<string, number>()
const AZAMI_KAYIT = 2000

export function imzaTekrariMi(imza: string, simdiMs: number): boolean {
  for (const [k, bitis] of gorulen) {
    if (bitis <= simdiMs) gorulen.delete(k)
  }
  if (gorulen.has(imza)) return true
  if (gorulen.size >= AZAMI_KAYIT) {
    const ilk = gorulen.keys().next().value
    if (ilk !== undefined) gorulen.delete(ilk)
  }
  gorulen.set(imza, simdiMs + IMZA_PENCERESI_MS)
  return false
}

/** Yalnız testler için. */
export function imzaTekrarKumesiniSifirla(): void {
  gorulen.clear()
}
