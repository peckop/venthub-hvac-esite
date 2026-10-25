/**
 * REHBER B10 CANLI ÖLÇÜM — tek komut (ARC-206, HRT-70; rehber-yazisi-standard.md R10.1 B10, R10.6 madde 6-7).
 *
 * NİÇİN: BLG-15 ve BLG-18'de B10 ölçümü elle, parça parça yapıldı; dersler (site haritası, canonical, iç bağlantı)
 * iki kez çiğnendi. Burada B10'un makinece ölçülebilen yarısı tek komuta bağlanır. B10'un tarayıcıyla görülen
 * liste kartı ve B11-B12 buraya DAHİL DEĞİLDİR (insan/GEO-SEO).
 *
 * ÖLÇÜLENLER (hepsi canlı, yönlendirme İZLENMEZ):
 *   1. adres 200 döner (3xx = KALDI)
 *   2. site haritasında adres var ve <lastmod> var (--yayin verilirse lastmod tarihi = yayın tarihi)
 *   3. <link rel="canonical"> sayfanın kendi adresi
 *   4. noindex yok (<meta name="robots|googlebot"> ve X-Robots-Tag başlığı)
 *   5. iç bağlantılar: scripts/rehber/ic-baglanti-denetle.mjs `denetle` sıfır kırmızı; ölçülecek bağlantı
 *      yoksa (EVREN-BOS) TEMİZ değil KALDI
 *
 * Kullanım:
 *   node tools/rehber/b10-olc.mjs <yazi-adresi> [--yayin 2026-10-26] [--harita <sitemap-adresi>]
 * Çıkış: 0 hepsi GEÇTİ · 1 en az bir KALDI · 3 ölçülemedi (ağ yok vb.; KALDI yoksa).
 * BLOG'un scripts/rehber/** dosyalarına dokunmaz; yalnız dışa aktardığı `denetle`yi içe alır.
 */
import { denetle as icBaglantiDenetle } from '../../scripts/rehber/ic-baglanti-denetle.mjs'

const GECTI = 'GEÇTİ'
const KALDI = 'KALDI'
const OLCULEMEDI = 'ÖLÇÜLEMEDİ'

/** Sondaki eğik çizgi ve büyük/küçük harf farkı tek adres sayılır. */
export function adresNormal(a) {
  const u = new URL(a)
  u.hash = ''
  u.search = ''
  return `${u.origin.toLowerCase()}${u.pathname.replace(/\/+$/, '')}`
}

/** HTML → { canonical, robots[] } (öznitelik sırası serbest; tek ya da çift tırnak). */
export function metaOku(html) {
  const etiketler = [...html.matchAll(/<(link|meta)\b[^>]*>/gi)].map((m) => m[0])
  const oznitelik = (e, ad) => e.match(new RegExp(`\\b${ad}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]
  let canonical = null
  const robots = []
  for (const e of etiketler) {
    if (/^<link/i.test(e) && /canonical/i.test(oznitelik(e, 'rel') || '')) canonical ??= oznitelik(e, 'href') ?? null
    if (/^<meta/i.test(e) && /^(robots|googlebot)$/i.test(oznitelik(e, 'name') || '')) robots.push(oznitelik(e, 'content') || '')
  }
  return { canonical, robots }
}

/** Site haritası XML → adresin <url> bloğundaki lastmod (yoksa null); adres haritada yoksa undefined. */
export function haritaLastmod(xml, adres) {
  const hedef = adresNormal(adres)
  for (const b of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = b[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1]
    if (!loc) continue
    let norm
    try { norm = adresNormal(loc) } catch { continue }
    if (norm === hedef) return b[1].match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? null
  }
  return undefined
}

const madde = (ad, durum, ayrinti) => ({ ad, durum, ayrinti })

/**
 * Ağdan beklenen en dar biçim — global fetch bunu karşılar, test taklidi de.
 * @typedef {{ status: number, headers?: { get(ad: string): string | null }, text(): Promise<string> }} Cevap
 * @typedef {(adres: string, secenek?: { redirect?: 'manual' }) => Promise<Cevap>} Getir
 */
/**
 * @param {{ adres: string, yayin?: string, harita?: string, getir?: Getir }} p
 * `getir` testte taklit edilir. Dönüş: { durum: 'GEÇTİ'|'KALDI'|'ÖLÇÜLEMEDİ', maddeler }.
 */
export async function b10Olc({ adres, yayin, harita, getir = fetch }) {
  const maddeler = []
  const kok = new URL(adres).origin
  const haritaAdresi = harita || `${kok}/sitemap.xml`

  // 1 + 3 + 4: sayfa
  let html = null
  try {
    const r = await getir(adres, { redirect: 'manual' })
    if (r.status === 200) {
      maddeler.push(madde('200', GECTI, 'doğrudan 200'))
      html = await r.text()
      const xrt = r.headers?.get?.('x-robots-tag') || ''
      const { canonical, robots } = metaOku(html)
      if (!canonical) maddeler.push(madde('canonical', KALDI, 'canonical etiketi yok'))
      else if (adresNormal(new URL(canonical, adres).toString()) === adresNormal(adres)) maddeler.push(madde('canonical', GECTI, canonical))
      else maddeler.push(madde('canonical', KALDI, `kendisi değil: ${canonical}`))
      const noindex = [...robots, xrt].filter((v) => /noindex/i.test(v))
      maddeler.push(noindex.length ? madde('noindex', KALDI, `noindex var: ${noindex.join(' | ')}`) : madde('noindex', GECTI, 'meta ve X-Robots-Tag temiz'))
    } else if (r.status >= 300 && r.status < 400) {
      maddeler.push(madde('200', KALDI, `${r.status} → ${r.headers?.get?.('location') ?? '(konum yok)'}`))
    } else {
      maddeler.push(madde('200', KALDI, String(r.status)))
    }
  } catch (e) {
    maddeler.push(madde('200', OLCULEMEDI, String(e?.cause?.code || e?.message || e)))
  }

  // 2: site haritası
  try {
    const r = await getir(haritaAdresi)
    if (r.status !== 200) maddeler.push(madde('harita', OLCULEMEDI, `harita ${r.status}`))
    else {
      const son = haritaLastmod(await r.text(), adres)
      if (son === undefined) maddeler.push(madde('harita', KALDI, 'adres site haritasında yok'))
      else if (son === null) maddeler.push(madde('harita', KALDI, 'haritada var, <lastmod> yok'))
      else if (yayin && son.slice(0, 10) !== yayin) maddeler.push(madde('harita', KALDI, `lastmod ${son.slice(0, 10)} ≠ yayın tarihi ${yayin}`))
      else maddeler.push(madde('harita', GECTI, `lastmod ${son.slice(0, 10)}${yayin ? ' = yayın tarihi' : ''}`))
    }
  } catch (e) {
    maddeler.push(madde('harita', OLCULEMEDI, String(e?.cause?.code || e?.message || e)))
  }

  // 5: iç bağlantılar
  if (html === null) maddeler.push(madde('ic-baglanti', OLCULEMEDI, 'sayfa açılmadı'))
  else {
    try {
      const s = await icBaglantiDenetle({ sayfalar: [adres], getir })
      if (s.durum === 'TEMIZ') maddeler.push(madde('ic-baglanti', GECTI, `${s.ozet.baglanti} bağlantı, kırmızı 0`))
      else if (s.durum === 'EVREN-BOS') maddeler.push(madde('ic-baglanti', KALDI, 'ölçülecek iç bağlantı yok (EVREN-BOS TEMİZ değildir)'))
      else maddeler.push(madde('ic-baglanti', KALDI, s.kirmizi.map((k) => `${k.sinif} ${k.baglanti || k.sayfa} ${k.ayrinti || ''}`.trim()).slice(0, 5).join(' ; ')))
    } catch (e) {
      maddeler.push(madde('ic-baglanti', OLCULEMEDI, String(e?.message || e)))
    }
  }

  const durum = maddeler.some((m) => m.durum === KALDI) ? KALDI : maddeler.some((m) => m.durum === OLCULEMEDI) ? OLCULEMEDI : GECTI
  return { durum, maddeler }
}

// ─── komut satırı ──────────────────────────────────────────────────────────────
const buDosya = import.meta.url.replace(/\\/g, '/').toLowerCase()
const cagrilan = process.argv[1] ? `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}`.toLowerCase() : ''
if (buDosya === cagrilan) {
  const arg = process.argv.slice(2)
  const bayrak = (ad) => {
    const i = arg.indexOf(ad)
    return i >= 0 ? arg[i + 1] : undefined
  }
  const adres = arg.find((a, i) => !a.startsWith('--') && !arg[i - 1]?.startsWith('--'))
  if (!adres) {
    console.error('Kullanım: node tools/rehber/b10-olc.mjs <yazi-adresi> [--yayin YYYY-AA-GG] [--harita <adres>]')
    process.exit(2)
  }
  const s = await b10Olc({ adres, yayin: bayrak('--yayin'), harita: bayrak('--harita') })
  for (const m of s.maddeler) console.log(`${m.durum} | ${m.ad} | ${m.ayrinti}`)
  console.log(`SONUÇ: ${s.durum} | ${adres}`)
  process.exit(s.durum === GECTI ? 0 : s.durum === KALDI ? 1 : 3)
}
