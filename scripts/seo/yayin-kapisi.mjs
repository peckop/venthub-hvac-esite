/**
 * TOPLU INDEXNOW YAYIN KAPISI (REC-405 / karar 164 A, OPS hükmü 09-29).
 *
 * NİÇİN VAR: K4 (Recep, 2026-09-03) "Bing'i değişecek adreslerle beslemeyelim" dedi; karar 164 A bunu
 * "IndexNow adres yayınıyla AYNI yayında başlar" diye kesinleştirdi. Toplu betik canlı `sitemap.xml`'i
 * okur ve SÜZGEÇSİZ hepsini gönderir. Adres şeması bayrağı (`ADRES_SEMASI_K3B`) KAPALIYKEN canlı sitemap'in
 * 87 adresinin 78'i (products 48, category 24, brands 6) yayında değişecek adrestir (ölçüm 2026-09-29):
 * o hâlde koşmak K4'ü çiğner ve Bing'e eski adresleri öğretir. Bu kapı betiği bayrak kapalıyken REDDETTİRİR.
 *
 * Bayrak değeri `src/config/features.ts` METNİNDEN okunur (.mjs TS içe aktaramaz; okuma kuralı
 * `markaYonlendirmeleri.mjs` `k3bOku` ile tek kaynak). Metin beklenen biçimde değilse `k3bOku` HATA
 * fırlatır: sessizce "açık" varsaymak yasak yönü açardı.
 */
import { k3bOku } from '../../src/config/markaYonlendirmeleri.mjs'

/**
 * @param {string} featuresMetni `src/config/features.ts` içeriği
 * @returns {{ izin: true } | { izin: false, sebep: string }}
 */
export function yayinKapisi(featuresMetni) {
  if (k3bOku(featuresMetni)) return { izin: true }
  return {
    izin: false,
    sebep:
      'ADRES_SEMASI_K3B KAPALI: canlı sitemap adreslerinin çoğu yayında DEĞİŞECEK (K4, karar 164 A). ' +
      'Toplu IndexNow bildirimi adres yayınıyla AYNI yayında, bayrak AÇILDIKTAN sonra koşar.',
  }
}

/**
 * SÜZGEÇLİ KİP (karar 249 daraltması, OPS 10-03): bayrak kapalıyken YALNIZ yayında DEĞİŞMEYEN adresler
 * bildirilebilir. K4'ün yasakladığı şey değişecek adresle Bing'i beslemektir; değişmeyen adres için yasak yoktur.
 *
 * İZİN LİSTESİ (fail-closed): yalnız bilinen değişmeyen TÜRLER geçer; tanınmayan her adres (yeni şema bölümleri
 * `urunler`/`urun`/`kategori`/`markalar`, dilsiz yol, başka dil öneki, yeni bir sitemap türü) "değişecek" sayılır ve ATILIR.
 * Yasak listesi (products/category/brands atılır, gerisi geçer) yeni türde sessizce açılırdı: çürütme 10-03 (SEO-12).
 * Değişmeyen türler (TR): ana sayfa, hakkında, iletişim, ürün seçici, yasal sayfalar, bilgi merkezi dizini ve yazıları.
 * Ürün (`products`), kategori (`category`), marka (`brands`) ağaçları dizin sayfaları dahil DEĞİŞECEKTİR.
 * Ölçüm 2026-10-03: canlı sitemap 87 adres, 9'u izin listesinde, 78'i dışında. Kural KALIPTIR; kod içinde adres listesi yoktur.
 */
const DEGISMEYEN_KALIP =
  /^\/tr(?:\/(?:about|contact|urun-secici)|\/legal(?:\/[^/]+)*|\/bilgi-merkezi(?:\/[^/]+)*)?$/

/** Süzgeç sonrası kalan adres sayısı bunu aşarsa DUR: 9 beklenir; yeni tür sitemap'e girerse sessizce büyümesin. */
export const KALAN_AZAMI = 15

/**
 * @param {string} adres mutlak ya da göreli adres
 * @returns {boolean} true = yayında DEĞİŞMEYEN bilinen tür; çözülemeyen ya da tanınmayan = false
 */
export function degismeyenMi(adres) {
  let yol
  try {
    yol = decodeURIComponent(new URL(adres, 'https://venthub.com.tr').pathname)
  } catch {
    return false
  }
  yol = yol.replace(/\/{2,}/g, '/').toLowerCase()
  if (yol.length > 1) yol = yol.replace(/\/+$/, '')
  if (/(^|\/)\.{1,2}(\/|$)/.test(yol) || yol.includes('\\')) return false
  return DEGISMEYEN_KALIP.test(yol)
}

/**
 * @param {string} adres
 * @returns {boolean} true = yayında değişecek ya da tanınmayan (güvenli yön)
 */
export function degisecekMi(adres) {
  return !degismeyenMi(adres)
}

/**
 * @param {string[]} adresler
 * @returns {{ kalan: string[], atilan: string[] }} kalan = değişmeyenler (bildirilebilir), atilan = değişecekler/tanınmayanlar
 */
export function degismeyenleriAyir(adresler) {
  const kalan = []
  const atilan = []
  for (const a of adresler) (degismeyenMi(a) ? kalan : atilan).push(a)
  return { kalan, atilan }
}

/**
 * Süzgeçli kipin kapısı. Boş küme ve üst sınır aşımı bayraktan bağımsız DURDURUR. Bayrak AÇIKSA geçer. KAPALIYSA kalanlar
 * arasında değişmeyen olarak TANINMAYAN adres varsa REDDEDER (süzgeç bozulursa ikinci savunma; bağımsız denetim için
 * `degismeyenMi`yi süzgeçle aynı yüklemden ayrı ele alır).
 * @param {string} featuresMetni
 * @param {string[]} kalan süzgeç sonrası adresler
 * @returns {{ izin: true } | { izin: false, sebep: string }}
 */
export function suzgecliKapi(featuresMetni, kalan) {
  if (kalan.length === 0) {
    return { izin: false, sebep: 'süzgeçten sonra HİÇ adres kalmadı: boş kümeyi bildirmek ölçüm değildir.' }
  }
  if (kalan.length > KALAN_AZAMI) {
    return {
      izin: false,
      sebep: `süzgeçten sonra ${kalan.length} adres kaldı, beklenen en çok ${KALAN_AZAMI} (bugün 9): sitemap'e yeni bir tür girmiş olabilir, elle incele.`,
    }
  }
  if (k3bOku(featuresMetni)) return { izin: true }
  const sizan = kalan.filter((a) => !DEGISMEYEN_KALIP.test(yolOzu(a)))
  if (sizan.length > 0) {
    return {
      izin: false,
      sebep:
        `ADRES_SEMASI_K3B KAPALI: süzgeçten sonra değişmeyen olarak TANINMAYAN ${sizan.length} adres kaldı (K4, karar 164 A): ` +
        sizan.slice(0, 3).join(', '),
    }
  }
  return { izin: true }
}

/** Kapının bağımsız yol özü (süzgeçle aynı normalizasyon, ayrı çağrı): çözülemezse tanınmaz yol döner. */
function yolOzu(adres) {
  try {
    let y = decodeURIComponent(new URL(adres, 'https://venthub.com.tr').pathname).replace(/\/{2,}/g, '/').toLowerCase()
    if (y.length > 1) y = y.replace(/\/+$/, '')
    return /(^|\/)\.{1,2}(\/|$)/.test(y) || y.includes('\\') ? '/?tanınmayan' : y
  } catch {
    return '/?tanınmayan'
  }
}

/**
 * Sayfa HTML'inden kanonik adresi çıkarır (`<link rel="canonical" href="…">`, öznitelik sırası serbest).
 * @param {string} html
 * @returns {string | null}
 */
export function kanonikAdres(html) {
  const bulunan = []
  for (const m of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<link\b[^>]*>/gi)) {
    const etiket = m[0]
    if (!/\brel\s*=\s*["']?canonical["']?(?=[\s>/"'])/i.test(etiket)) continue
    const h = etiket.match(/\bhref\s*=\s*"([^"]*)"|\bhref\s*=\s*'([^']*)'/i)
    if (h) bulunan.push(h[1] ?? h[2] ?? '')
  }
  // Yorum içindeki etiket sayılmaz; birden çok FARKLI canonical belirsizliktir: null (sınama durur).
  return bulunan.length > 0 && new Set(bulunan).size === 1 ? bulunan[0] : null
}
