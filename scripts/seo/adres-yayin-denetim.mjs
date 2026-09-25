/**
 * ADRES YAYINI ARAMA GÖRÜNÜRLÜĞÜ DENETİMİ — REC-300 (adres ağacı tek yayın) öncesi taban, yayın günü ve
 * yayından 1 / 7 / 28 gün sonra (docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md §5 Faz 5, §6, §7, §8;
 * cetvel docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * NİÇİN: adres değişikliğinde arama görünürlüğünü koruyan tek şey, eski adresin TEK sıçramada doğru yeni
 * adrese kalıcı (308) gitmesi ve yeni adresin doğrudan 200 dönmesidir. Zincir (2+ sıçrama), geçici
 * yönlendirme, 404 ve kendini göstermeyen canonical, Google'ın sıralamayı yeni adrese taşımasını geciktirir.
 * ÖRNEKLEM DEĞİL TAM LİSTE koşulur (OPS emri 2026-09-24).
 *
 * Denetimler:
 *   1. ESKİ: verilen eski adres listesinin HER satırı → 200 (değişmedi) ya da tek 308 → hedef 200.
 *      `--harita` verilirse hedef haritadaki beklenen adres olmalı. Zincir, 302/307 (dil tespiti dışında),
 *      404/410, 5xx KIRMIZI.
 *   2. HARİTA: yeni site haritasındaki her adres yönlendirmesiz 200; model adresi (`-p-<sku>`) sayısı
 *      `--model-beklenen` ile karşılaştırılır.
 *   3. SAYFA: site haritasındaki her sayfada canonical = kendi adresi; hreflang tr + en + x-default var
 *      ve her alternatif site haritasında.
 *
 * Kullanım:
 *   node scripts/seo/adres-yayin-denetim.mjs --taban <https://site> --cikti <depo-dışı-klasör>
 *        [--eski <dosya: satır başına bir adres ya da JSON dizi>] [--harita <eski→yeni JSON>]
 *        [--model-beklenen 442] [--es-zaman 6] [--sayfa-denetimi] [--en-harita-disi-bilincli]
 *   --en-harita-disi-bilincli: EN_YAYIN kapalıyken EN alternatifinin haritada olmaması kırmızı sayılmaz,
 *   ayrı sayılır (ozet.sayfa.bilincliEn). EN_YAYIN açılınca bu bayrak KALDIRILIR.
 *   --eski verilmezse bugünkü site haritası "eski adres" evreni olarak kaydedilir (`eski-adresler.json`):
 *   TABAN koşusunda bu dosya üretilir, yayın günü `--eski` ile geri verilir.
 * Çıkış: 0 temiz · 1 KIRMIZI · 3 EVREN-BOS. Ağa çıkar; `ci`'da koşmaz. Kapıya bağlama ALTYAPI'da.
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MODEL_DESENI = /-p-[a-z0-9][a-z0-9._-]*\/?$/i

/** Site haritası XML → { adresler, hreflang: Map<adres, {dil: href}> } */
export function haritaAyristir(xml) {
  const adresler = []
  const hreflang = new Map()
  for (const u of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = u[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1]
    if (!loc) continue
    adresler.push(loc)
    const alt = {}
    for (const a of u[1].matchAll(/<xhtml:link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)) alt[a[1]] = a[2]
    hreflang.set(loc, alt)
  }
  return { adresler, hreflang }
}

/** HTML → canonical ve hreflang bağlantıları (sunucu HTML'i; istemci JS'i beklenmez — botlar da beklemez). */
export function sayfaEtiketleri(html) {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html
  const canon = [...head.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)].map((m) => m[0].match(/href=["']([^"']+)["']/i)?.[1]).filter(Boolean)
  const alt = {}
  for (const m of head.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi)) {
    const dil = m[0].match(/hreflang=["']([^"']+)["']/i)?.[1]
    const href = m[0].match(/href=["']([^"']+)["']/i)?.[1]
    if (dil && href) alt[dil] = href
  }
  return { canonical: canon, hreflang: alt }
}

const tamAdres = (konum, taban) => new URL(konum, taban).toString()
const bosluksuz = (u) => u.replace(/\/$/, '')

/**
 * Bir eski adresi sınıfla. Yönlendirme izlenmez; sıçramalar tek tek sayılır (en çok 5).
 * @returns {{ sinif: 'AYNI'|'TEK-308'|'TEK-307-DILSIZ'|'ZINCIR'|'GECICI'|'YOK'|'HATA'|'HEDEF-YANLIS', durumlar: number[], son: string }}
 */
export async function eskiSinifla(adres, getir, beklenen) {
  const durumlar = []
  let su = adres
  for (let i = 0; i < 6; i++) {
    let r
    try { r = await getir(su, { redirect: 'manual' }) } catch (e) {
      return { sinif: 'HATA', durumlar: [...durumlar, 0], son: su, ag: String(e?.cause?.code || e?.message || e) }
    }
    durumlar.push(r.status)
    if (r.status >= 300 && r.status < 400) {
      const konum = r.headers?.get?.('location')
      if (!konum) return { sinif: 'HATA', durumlar, son: su }
      su = tamAdres(konum, su)
      continue
    }
    break
  }
  const son = durumlar[durumlar.length - 1]
  const sicrama = durumlar.length - 1
  let sinif
  if (son === 404 || son === 410) sinif = 'YOK'
  else if (son !== 200) sinif = 'HATA'
  else if (sicrama === 0) sinif = 'AYNI'
  else if (sicrama > 1) sinif = 'ZINCIR'
  else if (durumlar[0] === 308 || durumlar[0] === 301) sinif = 'TEK-308'
  // Plan §4: dil öneki olmayan eski adreste dil tespiti + hedef aynı adımda → tek 307 meşrudur
  else if (durumlar[0] === 307 && !/^\/(tr|en)(\/|$)/.test(new URL(adres).pathname)) sinif = 'TEK-307-DILSIZ'
  else sinif = 'GECICI'
  if (beklenen && sicrama === 1 && sinif === 'TEK-308' && bosluksuz(su) !== bosluksuz(beklenen)) sinif = 'HEDEF-YANLIS'
  return { sinif, durumlar, son: su }
}

/** Sınırlı eşzamanlı işleyici (canlı siteyi yormamak için). */
export async function sinirli(liste, n, is) {
  const sonuc = new Array(liste.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, liste.length) }, async () => {
    while (i < liste.length) { const k = i++; sonuc[k] = await is(liste[k], k) }
  }))
  return sonuc
}

/**
 * @param {{ taban: string, eski?: string[], harita?: Record<string,string>, modelBeklenen?: number,
 *   esZaman?: number, sayfaDenetimi?: boolean, enHaritaDisiBilincli?: boolean, getir?: (u: string, o?: object) => Promise<{status:number, headers?:{get(a:string):string|null}, text():Promise<string>}> }} p
 */
export async function denetle({ taban, eski, harita, modelBeklenen, esZaman = 6, sayfaDenetimi = false, enHaritaDisiBilincli = false, getir = fetch }) {
  const kirmizi = []
  let r
  try { r = await getir(`${taban}/sitemap.xml`, { redirect: 'manual' }) } catch (e) {
    return { durum: 'KIRMIZI', kirmizi: [{ denetim: 'HARITA', sinif: 'HARITA-ACILMADI', ayrinti: String(e?.cause?.code || e?.message || e) }], ozet: {} }
  }
  if (r.status !== 200) return { durum: 'KIRMIZI', kirmizi: [{ denetim: 'HARITA', sinif: 'HARITA-ACILMADI', ayrinti: String(r.status) }], ozet: {} }
  const { adresler, hreflang } = haritaAyristir(await r.text())
  const kume = new Set(adresler.map(bosluksuz))

  // 1. Eski adresler
  const eskiListe = eski ?? adresler
  const eskiSonuc = await sinirli(eskiListe, esZaman, async (a) => ({ adres: a, ...(await eskiSinifla(a, getir, harita?.[a])) }))
  const eskiSay = {}
  for (const s of eskiSonuc) {
    eskiSay[s.sinif] = (eskiSay[s.sinif] || 0) + 1
    if (!['AYNI', 'TEK-308', 'TEK-307-DILSIZ'].includes(s.sinif)) kirmizi.push({ denetim: 'ESKI', sinif: s.sinif, adres: s.adres, ayrinti: `${s.durumlar.join('→')} ${s.son}` })
  }

  // 2. Yeni site haritası: yönlendirmesiz 200
  const haritaSonuc = await sinirli(adresler, esZaman, async (a) => {
    try {
      const x = await getir(a, { redirect: 'manual' })
      return { adres: a, durum: x.status, html: sayfaDenetimi && x.status === 200 ? await x.text() : null }
    } catch (e) {
      return { adres: a, durum: 0, html: null, ag: String(e?.cause?.code || e?.message || e) }
    }
  })
  for (const h of haritaSonuc) if (h.durum !== 200) kirmizi.push({ denetim: 'HARITA', sinif: h.durum >= 300 && h.durum < 400 ? 'HARITADA-YONLENDIRME' : h.durum === 0 ? 'AG-HATASI' : 'HARITADA-200-DEGIL', adres: h.adres, ayrinti: h.ag || String(h.durum) })
  const modelSayisi = adresler.filter((a) => MODEL_DESENI.test(new URL(a).pathname)).length
  if (modelBeklenen != null && modelSayisi !== modelBeklenen) kirmizi.push({ denetim: 'HARITA', sinif: 'MODEL-SAYISI', ayrinti: `${modelSayisi} (beklenen ${modelBeklenen})` })

  // 3. Canonical + hreflang (sunucu HTML'i)
  const sayfaSay = { denetlenen: 0, canonicalYanlis: 0, hreflangEksik: 0, bilincliEn: 0 }
  if (sayfaDenetimi) {
    for (const h of haritaSonuc) {
      if (!h.html) continue
      sayfaSay.denetlenen++
      const e = sayfaEtiketleri(h.html)
      if (e.canonical.length !== 1 || bosluksuz(tamAdres(e.canonical[0], h.adres)) !== bosluksuz(h.adres)) {
        sayfaSay.canonicalYanlis++
        kirmizi.push({ denetim: 'SAYFA', sinif: 'CANONICAL', adres: h.adres, ayrinti: e.canonical.join(' | ') || '(yok)' })
      }
      const eksik = ['tr', 'en', 'x-default'].filter((d) => !e.hreflang[d])
      // EN_YAYIN kapalıyken EN ağacı noindex ve haritada yok — bilinçli (bot-karnesi BILINCLI, cetvel R3)
      const disarida = Object.entries(e.hreflang)
        .filter(([d, u]) => !kume.has(bosluksuz(tamAdres(u, h.adres))) && !(enHaritaDisiBilincli && d === 'en'))
        .map(([, u]) => u)
      if (enHaritaDisiBilincli && e.hreflang.en && !kume.has(bosluksuz(tamAdres(e.hreflang.en, h.adres)))) sayfaSay.bilincliEn++
      if (eksik.length || disarida.length) {
        sayfaSay.hreflangEksik++
        kirmizi.push({ denetim: 'SAYFA', sinif: 'HREFLANG', adres: h.adres, ayrinti: [eksik.length ? `eksik: ${eksik.join(',')}` : '', disarida.length ? `haritada yok: ${disarida.join(' ')}` : ''].filter(Boolean).join(' · ') })
      }
    }
  }
  const ozet = { haritaAdres: adresler.length, modelAdres: modelSayisi, eski: eskiListe.length, eskiSinif: eskiSay, harita200: haritaSonuc.filter((h) => h.durum === 200).length, sayfa: sayfaSay, haritaHreflangli: [...hreflang.values()].filter((v) => Object.keys(v).length).length }
  const durum = kirmizi.length ? 'KIRMIZI' : adresler.length === 0 ? 'EVREN-BOS' : 'TEMIZ'
  return { durum, ozet, kirmizi, eskiAdresler: adresler }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const cikti = deger('--cikti')
  if (!cikti) { console.error('HATA: --cikti <klasör> zorunlu'); process.exit(2) }
  const oku = (y) => { const t = readFileSync(y, 'utf8').trim(); return t.startsWith('[') || t.startsWith('{') ? JSON.parse(t) : t.split(/\r?\n/).filter(Boolean) }
  const eski = deger('--eski') ? oku(deger('--eski')) : undefined
  const harita = deger('--harita') ? oku(deger('--harita')) : undefined
  const s = await denetle({
    taban, eski, harita,
    modelBeklenen: deger('--model-beklenen') != null ? Number(deger('--model-beklenen')) : undefined,
    esZaman: Number(deger('--es-zaman') || 6), sayfaDenetimi: arg.includes('--sayfa-denetimi'),
    enHaritaDisiBilincli: arg.includes('--en-harita-disi-bilincli'),
  })
  mkdirSync(cikti, { recursive: true })
  const damga = new Date().toISOString().replace(/[:.]/g, '-')
  writeFileSync(join(cikti, `adres-denetim-${damga}.json`), JSON.stringify({ taban, alinma: new Date().toISOString(), ...s, eskiAdresler: undefined }, null, 1))
  if (!eski) writeFileSync(join(cikti, 'eski-adresler.json'), JSON.stringify(s.eskiAdresler, null, 1))
  console.log(JSON.stringify({ durum: s.durum, ozet: s.ozet }))
  const say = {}
  for (const k of s.kirmizi) say[`${k.denetim}/${k.sinif}`] = (say[`${k.denetim}/${k.sinif}`] || 0) + 1
  console.log('kırmızı sınıfları:', JSON.stringify(say))
  for (const k of s.kirmizi.slice(0, 25)) console.log(`${k.denetim} ${k.sinif} | ${k.adres || ''} | ${k.ayrinti || ''}`)
  process.exit(s.durum === 'KIRMIZI' ? 1 : s.durum === 'EVREN-BOS' ? 3 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 1 })
}
