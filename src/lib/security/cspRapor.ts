/**
 * CSP ihlal raporu — ayrıştırma, kişisel veri ayıklama ve oran sınırı (güvenlik karnesi 2026-11 C1, OPS-211).
 * Cetvel: `docs/standards/csp-standard.md` §9 · bekçi: INV-CSP-RAPOR-1
 * (`src/app/api/csp-rapor/__tests__/route.test.ts`).
 *
 * NİÇİN: CSP bugün Report-Only ve rapor ucu yoktu; tarayıcı ihlali "raporluyordu" ama rapor hiçbir yere
 * gitmiyordu. Enforce'a geçişin ön koşulu "N gün sıfır ihlal"dir ve bu uç olmadan ölçülemez.
 *
 * KİŞİSEL VERİ: rapor gövdesi ziyaretçinin tam adresini (sorgu dizesiyle), yönlendireni, betik örneğini
 * (`script-sample`, sayfadaki metinden parça taşıyabilir) ve kaynak dosya yolunu içerir. Bunların HİÇBİRİ
 * tutulmaz. Tutulan yalnız: direktif, engellenen kaynağın KÖKENİ (yol yok), belge YOLU (sorgu yok, kimlik
 * biçimli parçalar maskeli), kip (enforce/report) ve durum kodu. IP adresi loglanmaz; oran sınırında
 * yalnız bellekte anahtar olarak kullanılır ve pencere sonunda atılır.
 */

/** Gövde tavanı. Tek bir CSP raporu ~1 KB; Reporting API toplu gönderimi birkaç rapor taşır. */
export const CSP_RAPOR_GOVDE_TAVANI = 16 * 1024

/** Bir gövdeden en çok bu kadar rapor işlenir (toplu gönderimle log taşırılmasın). */
export const CSP_RAPOR_TOPLU_TAVAN = 20

type OranAyari = {
  readonly pencereMs: number
  readonly istemciBasina: number
  readonly toplam: number
  /** Bellekte tutulan istemci anahtarı tavanı; aşılırsa yeni istemci reddedilir (bellek şişmesin). */
  readonly anahtarTavani: number
}

/** Oran sınırı: istemci başına pencere içinde istek sayısı ve tüm örnek için toplam tavan. */
export const CSP_RAPOR_ORAN: OranAyari = Object.freeze({
  pencereMs: 60_000,
  istemciBasina: 30,
  toplam: 600,
  anahtarTavani: 5_000,
})

export type CspIhlali = {
  direktif: string
  engellenen: string
  belge: string
  kip: 'enforce' | 'report' | 'bilinmiyor'
  durum: number | null
}

const KIMLIK_PARCASI = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{4,}|[^/]*@[^/]*|[A-Za-z0-9_-]{32,})$/i
const DIREKTIF = /^[a-z-]{3,40}$/
const OZEL_ENGELLENEN = new Set(['inline', 'eval', 'self', 'data', 'blob', 'wasm-eval', 'trusted-types-policy', 'trusted-types-sink'])

function kisalt(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s
}

/** Engellenen kaynak → yalnız köken (`https://ornek.com`) ya da özel anahtar sözcük. Yol ve sorgu atılır. */
export function engelleneniAyikla(ham: unknown): string {
  if (typeof ham !== 'string' || ham.length === 0) return 'bilinmiyor'
  const kucuk = ham.trim().toLowerCase()
  if (OZEL_ENGELLENEN.has(kucuk)) return kucuk
  try {
    const url = new URL(ham)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'wss:' || url.protocol === 'ws:') {
      return url.origin
    }
    // data:, blob:, chrome-extension: … — yalnız şema.
    return kisalt(url.protocol.replace(/:$/, ''), 30)
  } catch {
    return 'gecersiz'
  }
}

/** Belge adresi → yalnız yol; sorgu/parça atılır, kimlik biçimli parçalar (UUID, uzun sayı, e-posta, belirteç) maskelenir. */
export function belgeYolunuAyikla(ham: unknown): string {
  if (typeof ham !== 'string' || ham.length === 0) return 'bilinmiyor'
  let yol: string
  try {
    yol = new URL(ham).pathname
  } catch {
    return 'gecersiz'
  }
  const maskeli = yol
    .split('/')
    .map((p) => {
      let cozulmus = p
      try {
        cozulmus = decodeURIComponent(p)
      } catch {
        // bozuk yüzde kodlaması: ham parçayla devam
      }
      return KIMLIK_PARCASI.test(cozulmus) ? ':id' : p
    })
    .join('/')
  return kisalt(maskeli, 120)
}

function direktifAyikla(ham: unknown): string {
  if (typeof ham !== 'string') return 'bilinmiyor'
  // `violated-directive` eski tarayıcıda tüm direktif satırını taşıyabilir: ilk sözcük yeter.
  const ilk = ham.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  return DIREKTIF.test(ilk) ? ilk : 'bilinmiyor'
}

function kipAyikla(ham: unknown): CspIhlali['kip'] {
  return ham === 'enforce' || ham === 'report' ? ham : 'bilinmiyor'
}

function durumAyikla(ham: unknown): number | null {
  return typeof ham === 'number' && Number.isInteger(ham) && ham >= 0 && ham < 1000 ? ham : null
}

function nesneMi(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

/** Eski biçim (`report-uri`, `application/csp-report`): `{ "csp-report": { ... } }`. */
function eskiBicim(r: Record<string, unknown>): CspIhlali {
  return {
    direktif: direktifAyikla(r['effective-directive'] ?? r['violated-directive']),
    engellenen: engelleneniAyikla(r['blocked-uri']),
    belge: belgeYolunuAyikla(r['document-uri']),
    kip: kipAyikla(r['disposition']),
    durum: durumAyikla(r['status-code']),
  }
}

/** Reporting API biçimi (`report-to`, `application/reports+json`): `[{ type: 'csp-violation', body: { ... } }]`. */
function yeniBicim(b: Record<string, unknown>): CspIhlali {
  return {
    direktif: direktifAyikla(b['effectiveDirective']),
    engellenen: engelleneniAyikla(b['blockedURL']),
    belge: belgeYolunuAyikla(b['documentURL']),
    kip: kipAyikla(b['disposition']),
    durum: durumAyikla(b['statusCode']),
  }
}

/**
 * Ayrıştırılmış JSON gövdesinden ayıklanmış ihlal listesi. Tanınmayan biçim → boş liste (hata değil:
 * tarayıcılar ucuza başka rapor türleri de gönderebilir; `csp-violation` dışındakiler sayılmaz).
 */
export function cspRaporlariniAyikla(govde: unknown): CspIhlali[] {
  if (nesneMi(govde) && nesneMi(govde['csp-report'])) return [eskiBicim(govde['csp-report'])]
  if (Array.isArray(govde)) {
    const out: CspIhlali[] = []
    for (const r of govde.slice(0, CSP_RAPOR_TOPLU_TAVAN)) {
      if (nesneMi(r) && r['type'] === 'csp-violation' && nesneMi(r['body'])) out.push(yeniBicim(r['body']))
    }
    return out
  }
  return []
}

/**
 * Sabit pencereli, bellek içi oran sınırlayıcı. ⚠Sunucusuz ortamda örnek başınadır (her soğuk başlangıç
 * sıfırdan sayar); bu bir kötüye kullanım FRENİ, kesin kota değil. Kesin kota gerekirse Vercel güvenlik
 * duvarı kuralı yazılır (cetvel §9).
 */
export function oranSinirlayiciKur(ayar: OranAyari = CSP_RAPOR_ORAN, saat: () => number = Date.now) {
  let pencereBasi = saat()
  let toplam = 0
  const sayac = new Map<string, number>()
  return function izinVer(anahtar: string): boolean {
    const simdi = saat()
    if (simdi - pencereBasi >= ayar.pencereMs) {
      pencereBasi = simdi
      toplam = 0
      sayac.clear()
    }
    if (toplam >= ayar.toplam) return false
    const n = sayac.get(anahtar)
    if (n === undefined && sayac.size >= ayar.anahtarTavani) return false
    if ((n ?? 0) >= ayar.istemciBasina) return false
    sayac.set(anahtar, (n ?? 0) + 1)
    toplam++
    return true
  }
}

/**
 * Gövdeyi en çok `tavan` bayt okuyarak metne çevirir; aşılırsa `null` (okuma erken kesilir, tamamı belleğe
 * alınmaz). `Content-Length` yalan söyleyebileceği için akış da sayılır.
 */
export async function govdeyiSinirliOku(akis: ReadableStream<Uint8Array> | null, tavan: number): Promise<string | null> {
  if (!akis) return ''
  const okuyucu = akis.getReader()
  const parcalar: Uint8Array[] = []
  let boy = 0
  for (;;) {
    const { done, value } = await okuyucu.read()
    if (done) break
    boy += value.byteLength
    if (boy > tavan) {
      await okuyucu.cancel().catch(() => undefined)
      return null
    }
    parcalar.push(value)
  }
  const birlesik = new Uint8Array(boy)
  let i = 0
  for (const p of parcalar) {
    birlesik.set(p, i)
    i += p.byteLength
  }
  return new TextDecoder().decode(birlesik)
}
