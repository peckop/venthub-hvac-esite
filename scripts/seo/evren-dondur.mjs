/**
 * ESKİ SİTE ADRES EVRENİ (donmuş liste) — Kanban SEO-76; cetvel docs/standards/dizin-sistemleri-standard.md D7 madde 12,
 * docs/standards/departman-defter-standard.md.
 *
 * NİÇİN: yeni siteye geçişte eski→yeni eşleştirme tablosu (URUN) ve geçiş günü ölçümü "eski sitede hangi adresler
 * dizindeydi ve trafik aldı" sorusunun TARİHLİ, DEĞİŞMEZ bir cevabına dayanır. Canlı site haritası tek başına yetmez:
 * Search Console'da harita dışı (EN, eski iç içe yol, http, sorgu parametreli) adresler de tık/gösterim alır.
 *
 * KAYNAKLAR: (1) canlı site haritası, (2) Search Console 90 günlük sayfa listesi (`scripts/rehber/gsc-taban.mjs` çıktısı),
 * (3) Google dizin durumu: her adres için URL Inspection API ile taze ölçülür (dizin-takip anlık görüntüsü harita dışını kapsamaz).
 * Her satır: adres, dil, tür, kaynak (harita / gsc / sorgu-parametreli), Google dizin kararı, 90 gün tık/gösterim, tarih.
 * Çıktı `adres-evreni-<gün>.json` + `.csv` ve `.sha256`; SHA dosya içeriğinin sha256'sıdır (değişmezlik kanıtı).
 *
 * ⚠VERİ DEPOYA GİRMEZ: tık/gösterim sayfa verisi PUBLIC depoya yazılmaz (P6); `--cikti` depo dışı olmalıdır.
 * Kullanım: GSC_SA_ANAHTAR=<yol> node scripts/seo/evren-dondur.mjs --gsc <gsc-taban.json> --harita <sitemap.xml>
 *           --cikti <depo-dışı-klasör>
 * Çıkış: 0 yazıldı · 2 araç koşmadı (argüman, jeton, çıktı depo içinde).
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { satirCikar } from './gsc-url-denetim.mjs'

/** Adres → dil: /tr, /en, ya da yok (dil öneksiz ya da kök). */
export function dilBul(adres) {
  const m = new URL(adres).pathname.match(/^\/(tr|en)(\/|$)/)
  return m ? m[1] : 'yok'
}

/** Adres → tür (adres yayınında değişen önekler ayrı). */
export function turBul(adres) {
  const p = new URL(adres).pathname.replace(/^\/(tr|en)(?=\/|$)/, '') || '/'
  if (/^\/(products|urun|urunler)(\/|$)/.test(p)) return 'urun'
  if (/^\/(category|kategori)(\/|$)/.test(p)) return 'kategori'
  if (/^\/(brands|markalar)(\/|$)/.test(p)) return 'marka'
  if (/^\/(bilgi-merkezi|knowledge-hub)(\/|$)/.test(p)) return 'bilgi-merkezi'
  if (/^\/destek(\/|$)/.test(p)) return 'destek'
  if (p === '/') return 'ana'
  return 'diger'
}

/** Sorgu parametresi türü: ?sku= ayrı, diğer sorgu dizeleri 'sorgu', yoksa null. */
export function sorguTuru(adres) {
  const u = new URL(adres)
  if (!u.search) return null
  return u.searchParams.has('sku') ? 'sku' : 'sorgu'
}

/**
 * Üç kaynağı birleştirir. harita: adres[]; gsc: [{adres, tik, gosterim}]; dizinDurumu: {adres → {karar, kapsam}}.
 * Satır dahil edilir: haritadaysa ve Google PASS ise (dizinli), ya da GSC'de tık/gösterim varsa (trafik).
 */
export function birlestir({ harita, gsc, dizinDurumu, tarih }) {
  const harSet = new Set(harita)
  const gscMap = new Map(gsc.map((g) => [g.adres, g]))
  const adresler = [...new Set([...harita, ...gsc.map((g) => g.adres)])].sort()
  const satirlar = []
  for (const adres of adresler) {
    const kaynak = []
    if (harSet.has(adres)) kaynak.push('harita')
    if (gscMap.has(adres)) kaynak.push('gsc')
    const st = sorguTuru(adres)
    if (st) kaynak.push(st === 'sku' ? 'sku' : 'sorgu-parametreli')
    const g = gscMap.get(adres)
    const d = dizinDurumu[adres] ?? null
    const dizinli = d?.karar === 'PASS'
    const trafik = !!g && (g.tik > 0 || g.gosterim > 0)
    if (!dizinli && !trafik) continue
    satirlar.push({
      adres, dil: dilBul(adres), tur: turBul(adres), kaynak: kaynak.join('+'),
      googleKarar: d?.karar ?? 'OLCULEMEDI', googleKapsam: d?.kapsam ?? null,
      dizinli, tik90: g?.tik ?? 0, gosterim90: g?.gosterim ?? 0, tarih,
    })
  }
  return satirlar
}

export function csvUret(satirlar) {
  const kol = ['adres', 'dil', 'tur', 'kaynak', 'googleKarar', 'googleKapsam', 'dizinli', 'tik90', 'gosterim90', 'tarih']
  const kac = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  return [kol.join(','), ...satirlar.map((s) => kol.map((k) => kac(s[k])).join(','))].join('\n') + '\n'
}

export function ozetle(satirlar) {
  const say = (f) => satirlar.reduce((m, s) => { const k = f(s); m[k] = (m[k] ?? 0) + 1; return m }, {})
  return {
    satir: satirlar.length, dil: say((s) => s.dil), tur: say((s) => s.tur), kaynak: say((s) => s.kaynak),
    googleKarar: say((s) => s.googleKarar), dizinli: satirlar.filter((s) => s.dizinli).length,
    trafikli: satirlar.filter((s) => s.tik90 > 0 || s.gosterim90 > 0).length,
    skuAdresi: satirlar.filter((s) => s.kaynak.includes('sku')).length,
  }
}

const GECIKME_MS = 150

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const [gscYol, haritaYol, cikti] = ['--gsc', '--harita', '--cikti'].map(deger)
  if (!gscYol || !haritaYol || !cikti) { console.error('HATA: --gsc --harita --cikti zorunlu'); process.exit(2) }
  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const rel = relative(kok, resolve(cikti))
  if (rel && !rel.startsWith('..') && !isAbsolute(rel)) { console.error('HATA: --cikti depo içinde (P6)'); process.exit(2) }
  const site = deger('--site') || 'sc-domain:venthub.com.tr'
  const harita = [...readFileSync(haritaYol, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const gscJson = JSON.parse(readFileSync(gscYol, 'utf8'))
  const gsc = gscJson.sayfa.map((r) => ({ adres: r.keys[0], tik: r.clicks, gosterim: r.impressions }))
  // Her adres (harita ∪ GSC) URL Inspection ile TAZE ölçülür: dizin-takip anlık görüntüsü harita dışı adresleri kapsamaz
  // ve bayatlayabilir. Ölçülemeyen adres "OLCULEMEDI" yazılır (sessiz sıfır değil).
  let jeton
  try { jeton = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim() } catch (e) {
    console.error('HATA: jeton alınamadı (GSC_SA_ANAHTAR?)', String(e.message).slice(0, 120)); process.exit(2)
  }
  const hepsi = [...new Set([...harita, ...gsc.map((g) => g.adres)])]
  const olculen = {}
  for (const adres of hepsi) {
    let yanit
    try {
      yanit = await (await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST', headers: { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: adres, siteUrl: site, languageCode: 'tr' }),
      })).json()
    } catch (e) { yanit = { error: { code: 'ag', message: e.message } } }
    const s = satirCikar(adres, yanit)
    olculen[adres] = s.hata ? { karar: null, kapsam: s.hata } : { karar: s.karar, kapsam: s.kapsam }
    await new Promise((r) => setTimeout(r, GECIKME_MS))
  }
  const tarih = new Date().toISOString().slice(0, 10)
  const satirlar = birlestir({ harita, gsc, dizinDurumu: olculen, tarih })
  mkdirSync(cikti, { recursive: true })
  const jsonYol = join(resolve(cikti), `adres-evreni-${tarih}.json`)
  const csvYol = join(resolve(cikti), `adres-evreni-${tarih}.csv`)
  writeFileSync(jsonYol, JSON.stringify({ tarih, kaynaklar: { harita: harita.length, gsc: gsc.length, gscDonem: gscJson.donem }, ozet: ozetle(satirlar), satirlar }, null, 1))
  writeFileSync(csvYol, csvUret(satirlar))
  const sha = createHash('sha256').update(readFileSync(csvYol)).digest('hex')
  writeFileSync(`${csvYol}.sha256`, `${sha}  adres-evreni-${tarih}.csv\n`)
  console.log(JSON.stringify(ozetle(satirlar)))
  console.log(`sha256 ${sha}`)
  console.log(csvYol)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
