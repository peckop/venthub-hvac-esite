#!/usr/bin/env node
/**
 * BOT KALİTESİ KARNESİ — canlı sitenin her sayfa türünü arama motoru ve yapay zekâ botu gözüyle ölçer.
 *
 * NİÇİN (REC-369 F1b, 2026-09-24): Recep "botlara yönelik kalitemiz doğru yolda mı" diye sordu. OPS'un spot
 * ölçümü iki kusur buldu: kendi hreflang'ını yazmayan sayfalar layout varsayılanına (ana sayfaya) düşüyor;
 * robots.txt'teki `/account/` gibi kök kalıpları dil önekli adreslerle (/tr/account) eşleşmiyor. Hangi sayfa
 * türlerinin etkilendiğini tek tek bakarak bulmak her seferinde yeniden yapılan bir işti; bu betik onu
 * tekrar koşulabilir kılar (sonra ALTYAPI kapıya bağlar).
 *
 * Ölçtüğü (sayfa başına): HTTP durum + yönlendirme zinciri · sunucu HTML'indeki görünür kelime sayısı (her bot
 * için ayrı: bota farklı içerik veriliyor mu) · <title> sayısı · meta açıklama · canonical · hreflang (hedef
 * 200 mü, karşılıklı mı, ana sayfaya düşüyor mu) · JSON-LD türleri + JSON geçerliliği · meta robots /
 * X-Robots-Tag · robots.txt izni (bot başına, Google'ın en uzun eşleşme kuralı) · site haritasında mı · H1
 * sayısı · iç bağlantı sayısı · yinelenen başlık/metin.
 *
 * Kullanım:
 *   node scripts/seo/bot-karnesi.mjs [--taban https://venthub.com.tr] [--cikti <dizin>] [--cwv]
 *   --cikti verilirse karne.json + karne.md oraya yazılır; verilmezse Markdown stdout'a basılır.
 *   --cwv: PageSpeed Insights API'den alan verisi (CrUX) dener; anahtarsız kota düşükse "ölçülemedi" yazar.
 *
 * Sınırlar (dürüst): bot kimliği yalnız User-Agent ile taklit edilir, IP doğrulaması yapılamaz; barındırıcının
 * bot koruması sahte botu engelliyorsa sonuç bunu gösterir, gerçek botun gördüğünü değil. HTML düzenli
 * ifadeyle ayrıştırılır (bağımlılık yok); JSON-LD şema doğrulaması değil yalnız JSON + @type ölçülür.
 * Çıkış kodu: ölçüm tamamlandıysa 0 (sorun bulunsa da), ağ/ayrıştırma hatası varsa 1.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(ad)
  return i === -1 ? varsayilan : process.argv[i + 1]
}
const TABAN = arg('--taban', 'https://venthub.com.tr').replace(/\/$/, '')
const CIKTI = arg('--cikti', null)
const CWV = process.argv.includes('--cwv')

export const BOTLAR = {
  googlebot: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  gptbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot',
  claudebot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  perplexitybot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  tarayici: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}
/** robots.txt'te aranacak ürün belirteçleri (Google-Extended yalnız robots.txt belirtecidir, tarama yapmaz). */
const ROBOTS_BELIRTECLERI = ['googlebot', 'gptbot', 'claudebot', 'perplexitybot', 'google-extended']

/** Sayfa türü → sabit adresler. Site haritasından türetilenler aşağıda eklenir. */
const SABIT = [
  ['ana', ['/tr', '/en']],
  ['kok', ['/']],
  ['urun-listesi', ['/tr/products', '/en/products']],
  ['urun-secici', ['/tr/urun-secici']],
  ['marka-listesi', ['/tr/brands']],
  ['bilgi-merkezi', ['/tr/destek/merkez', '/en/destek/merkez']],
  ['konu', ['/tr/destek/konular/hava-perdesi', '/tr/destek/konular/hrv', '/tr/destek/konular/jet-fan', '/tr/destek/konular/air-curtain', '/en/destek/konular/hrv']],
  ['destek-surec', ['/tr/destek/sss', '/tr/destek/teslimat-kargo', '/tr/destek/iade-degisim', '/tr/destek/garanti-servis', '/en/destek/sss']],
  ['hesaplayici', ['/tr/destek/hesaplayicilar/kanal', '/tr/destek/hesaplayicilar/hrv', '/tr/destek/hesaplayicilar/hava-perdesi', '/tr/destek/hesaplayicilar/jet-fan', '/en/destek/hesaplayicilar/hrv']],
  ['hakkimizda-iletisim', ['/tr/about', '/en/about', '/tr/contact']],
  ['yasal', ['/tr/legal/kvkk', '/tr/legal/gizlilik-politikasi', '/en/legal/kvkk']],
  ['sepet-hesap', ['/tr/cart', '/en/cart', '/tr/account', '/tr/checkout', '/tr/auth/login']],
]
/** Dizine girmemesi gereken türler — bunlarda "indekslenebilir" bir SORUNDUR. */
const INDEKSLENMEMELI = new Set(['sepet-hesap'])
/**
 * BİLİNÇLİ KARARLAR — kodda gerekçesi yazılı davranışlar. Karne bunları kusur saymaz, "BILINCLI" diye ayrı basar;
 * karar değişirse satır buradan silinir ve aynı işaret kusura döner.
 *  - EN_YAYIN=false (src/config/features.ts): /en ağacı `noindex, follow` (src/app/[lang]/layout.tsx).
 *  - Karar K17 (src/app/sitemap.ts): hesaplayıcıların kendi adresleri site haritasında YOK; kapı /urun-secici.
 */
const BILINCLI = [
  { sinif: 'INDEKSE-KAPALI', kosul: (s) => s.son.startsWith('/en'), gerekce: 'EN_YAYIN kapalı' },
  { sinif: 'HARITADA-YOK', kosul: (s) => s.son.startsWith('/en'), gerekce: 'EN_YAYIN kapalı' },
  { sinif: 'HARITADA-YOK', kosul: (s) => s.tur === 'hesaplayici', gerekce: 'karar K17' },
]
/** Kendi <title>'ını yazmayan sayfanın aldığı layout varsayılanı (TR/EN). */
const VARSAYILAN_BASLIK = /^VentHub — Premium HVAC (Çözümleri|Solutions)$/

// ─── yardımcılar ───────────────────────────────────────────────────────────────
const bekle = (ms) => new Promise((r) => setTimeout(r, ms))
const ozet = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12)
const mutlak = (u) => (u.startsWith('http') ? u : TABAN + u)
const yol = (u) => { try { return new URL(u, TABAN).pathname.replace(/\/$/, '') || '/' } catch { return u } }

async function getir(adres, ua, azami = 6) {
  const zincir = []
  let url = mutlak(adres)
  for (let i = 0; i < azami; i++) {
    let r
    try {
      r = await fetch(url, { redirect: 'manual', headers: { 'user-agent': ua, accept: 'text/html,application/xhtml+xml' } })
    } catch (e) {
      return { zincir, durum: 'AG-HATASI', hata: String(e.cause?.code || e.message), url }
    }
    zincir.push(r.status)
    const konum = r.headers.get('location')
    if (r.status >= 300 && r.status < 400 && konum) { url = new URL(konum, url).href; continue }
    const govde = /text\/html/.test(r.headers.get('content-type') || '') ? await r.text() : ''
    return { zincir, durum: r.status, url, govde, xRobots: r.headers.get('x-robots-tag') || '' }
  }
  return { zincir, durum: 'COK-YONLENDIRME', url }
}

const ozellik = (etiket, ad) => (etiket.match(new RegExp(`\\b${ad}\\s*=\\s*"([^"]*)"`, 'i')) || etiket.match(new RegExp(`\\b${ad}\\s*=\\s*'([^']*)'`, 'i')) || [])[1]
const etiketler = (html, ad) => html.match(new RegExp(`<${ad}\\b[^>]*>`, 'gi')) || []

export function ayristir(html) {
  const head = html
  const title = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/gi) || []).map((t) => t.replace(/<[^>]+>/g, '').trim())
  const metalar = etiketler(head, 'meta')
  const meta = (ad) => metalar.filter((m) => (ozellik(m, 'name') || '').toLowerCase() === ad).map((m) => ozellik(m, 'content') || '')
  const linkler = etiketler(head, 'link')
  const canonical = linkler.filter((l) => /\brel\s*=\s*["']canonical["']/i.test(l)).map((l) => ozellik(l, 'href'))
  const hreflang = linkler.filter((l) => /\brel\s*=\s*["']alternate["']/i.test(l) && /hreflang/i.test(l)).map((l) => ({ dil: ozellik(l, 'hreflang'), href: ozellik(l, 'href') }))
  const jsonld = []
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1])
      const dugumler = [].concat(j).flatMap((x) => (x && x['@graph'] ? x['@graph'] : [x]))
      jsonld.push(...dugumler.map((x) => ({ tur: [].concat(x?.['@type'] ?? '?').join('+'), gecerli: true })))
    } catch { jsonld.push({ tur: 'GECERSIZ-JSON', gecerli: false }) }
  }
  const govde = (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, html])[1]
  const metin = govde
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const kelime = (metin.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu) || []).length
  const h1 = (govde.match(/<h1\b/gi) || []).length
  const ic = (govde.match(/<a\b[^>]*href\s*=\s*["'](\/[^"'#]*|https?:\/\/(www\.)?venthub\.com\.tr[^"'#]*)["']/gi) || []).length
  return { title, aciklama: meta('description'), robots: meta('robots').concat(meta('googlebot')), canonical, hreflang, jsonld, kelime, metinOzet: ozet(metin), h1, ic }
}

// ─── robots.txt (Google kuralı: en özel UA grubu, en uzun eşleşen yol; eşitlikte Allow) ───
export function robotsAyristir(metin) {
  const gruplar = []
  let g = null
  let sonUa = false
  for (const ham of metin.split(/\r?\n/)) {
    const satir = ham.replace(/#.*/, '').trim()
    const m = satir.match(/^([a-z-]+)\s*:\s*(.*)$/i)
    if (!m) continue
    const [, alan, deger] = m
    const a = alan.toLowerCase()
    if (a === 'user-agent') {
      if (!sonUa || !g) { g = { ua: [], kurallar: [] }; gruplar.push(g) }
      g.ua.push(deger.toLowerCase())
      sonUa = true
    } else if ((a === 'allow' || a === 'disallow') && g) {
      g.kurallar.push({ izin: a === 'allow', desen: deger })
      sonUa = false
    } else sonUa = false
  }
  return gruplar
}
const desenEslesir = (desen, p) => {
  if (desen === '') return false
  const re = new RegExp('^' + desen.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'))
  return re.test(p)
}
export function robotsIzin(gruplar, belirtec, p) {
  const grup = gruplar.find((x) => x.ua.includes(belirtec)) || gruplar.find((x) => x.ua.includes('*'))
  if (!grup) return { izin: true, kural: 'grup-yok' }
  let en = null
  for (const k of grup.kurallar) {
    if (!desenEslesir(k.desen, p)) continue
    if (!en || k.desen.length > en.desen.length || (k.desen.length === en.desen.length && k.izin)) en = k
  }
  return en ? { izin: en.izin, kural: `${en.izin ? 'Allow' : 'Disallow'}: ${en.desen}`, grup: grup.ua.join(',') } : { izin: true, kural: 'eslesme-yok', grup: grup.ua.join(',') }
}

// ─── ana akış ──────────────────────────────────────────────────────────────────
async function main() {
  const hatalar = []
  const robotsMetin = (await getir('/robots.txt', BOTLAR.googlebot)).govde || (await (await fetch(TABAN + '/robots.txt')).text())
  const robots = robotsAyristir(robotsMetin)
  const haritaXml = await (await fetch(TABAN + '/sitemap.xml')).text()
  const haritaLoc = new Set([...haritaXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => yol(m[1])))
  const haritaAlt = new Set([...haritaXml.matchAll(/<xhtml:link[^>]*href="([^"]+)"/g)].map((m) => yol(m[1])))

  // Site haritasından her dinamik türe iki temsilci (belirlenimci: haritadaki ilk sıra) + EN karşılığı
  const locList = [...haritaXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: yol((m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1] || ''),
    en: yol((m[1].match(/hreflang="en"[^>]*href="([^"]+)"/) || m[1].match(/href="([^"]+)"[^>]*hreflang="en"/) || [])[1] || ''),
  }))
  const turet = (ad, re, n = 2) => {
    const secilen = locList.filter((x) => re.test(x.loc)).slice(0, n)
    return [ad, secilen.flatMap((x, i) => (i === 0 && x.en ? [x.loc, x.en] : [x.loc]))]
  }
  const TURLER = [
    ...SABIT,
    turet('kategori', /^\/tr\/category\/[^/]+$/),
    turet('alt-kategori', /^\/tr\/category\/[^/]+\/[^/]+$/),
    turet('aile-urun', /^\/tr\/products\/[^/]+$/, 3),
    turet('marka', /^\/tr\/brands\/[^/]+$/),
  ]

  const onbellek = new Map()
  const gGetir = async (a) => {
    const k = yol(a)
    if (!onbellek.has(k)) { onbellek.set(k, await getir(a, BOTLAR.googlebot)); await bekle(120) }
    return onbellek.get(k)
  }

  const satirlar = []
  for (const [tur, adresler] of TURLER) {
    for (const adres of adresler) {
      const g = await gGetir(adres)
      const s = { tur, adres, zincir: g.zincir.join('→'), durum: g.durum, son: yol(g.url || adres), sorunlar: [] }
      if (typeof g.durum !== 'number') { s.sorunlar.push(`GETIRILEMEDI ${g.durum} ${g.hata || ''}`); hatalar.push(adres); satirlar.push(s); continue }
      const a = g.govde ? ayristir(g.govde) : null
      // Bot başına görünür kelime + metin özeti
      s.botlar = {}
      for (const [bot, ua] of Object.entries(BOTLAR)) {
        if (bot === 'googlebot') { s.botlar[bot] = { durum: g.durum, kelime: a?.kelime ?? 0, ozet: a?.metinOzet } ; continue }
        const b = await getir(adres, ua)
        const ba = b.govde ? ayristir(b.govde) : null
        s.botlar[bot] = { durum: b.durum, kelime: ba?.kelime ?? 0, ozet: ba?.metinOzet }
        await bekle(120)
      }
      const kelimeler = Object.values(s.botlar).map((x) => x.kelime)
      if (Math.max(...kelimeler) - Math.min(...kelimeler) > Math.max(20, 0.1 * Math.max(...kelimeler))) s.sorunlar.push(`BOT-ICERIK-FARKI kelime ${kelimeler.join('/')}`)
      for (const [bot, x] of Object.entries(s.botlar)) if (x.durum !== g.durum) s.sorunlar.push(`BOT-DURUM-FARKI ${bot}=${x.durum}`)

      // robots.txt
      s.robots = Object.fromEntries(ROBOTS_BELIRTECLERI.map((b) => [b, robotsIzin(robots, b, s.son)]))
      const noindex = [...(a?.robots || []), g.xRobots].some((x) => /noindex/i.test(x || ''))
      s.noindex = noindex
      s.haritada = haritaLoc.has(s.son) ? 'loc' : haritaAlt.has(s.son) ? 'alternatif' : 'yok'
      const indekslenebilir = g.durum === 200 && !noindex && s.robots.googlebot.izin
      s.indekslenebilir = indekslenebilir
      if (INDEKSLENMEMELI.has(tur) && indekslenebilir) s.sorunlar.push('INDEKSLENMEMELI-AMA-ACIK')
      if (INDEKSLENMEMELI.has(tur) && s.haritada !== 'yok') s.sorunlar.push('INDEKSLENMEMELI-AMA-HARITADA')
      if (!INDEKSLENMEMELI.has(tur) && g.durum === 200 && !indekslenebilir) s.sorunlar.push('INDEKSE-KAPALI')
      if (!INDEKSLENMEMELI.has(tur) && tur !== 'kok' && g.durum === 200 && s.haritada === 'yok') s.sorunlar.push('HARITADA-YOK')
      if (g.zincir.length > 1 && tur !== 'kok') s.sorunlar.push(`YONLENDIRME ${s.zincir}`)
      if (g.durum !== 200 && tur !== 'kok') s.sorunlar.push(`DURUM ${g.durum}`)
      if (!a) { satirlar.push(s); continue }

      s.title = a.title.length; s.baslik = a.title[0] || ''
      s.aciklama = a.aciklama.length ? a.aciklama[0].length : 0
      s.h1 = a.h1; s.ic = a.ic; s.kelime = a.kelime; s.metinOzet = a.metinOzet
      s.jsonld = a.jsonld.map((x) => x.tur)
      if (a.title.length !== 1) s.sorunlar.push(`TITLE-SAYISI ${a.title.length}`)
      if (a.title.length === 1 && VARSAYILAN_BASLIK.test(a.title[0])) s.sorunlar.push('VARSAYILAN-BASLIK (kendi title/description yok)')
      if (!a.aciklama.length) s.sorunlar.push('ACIKLAMA-YOK')
      if (a.h1 !== 1) s.sorunlar.push(`H1-SAYISI ${a.h1}`)
      if (a.jsonld.some((x) => !x.gecerli)) s.sorunlar.push('JSONLD-GECERSIZ')

      // canonical
      s.canonical = a.canonical.map(yol)
      if (a.canonical.length !== 1) s.sorunlar.push(`CANONICAL-SAYISI ${a.canonical.length}`)
      else if (yol(a.canonical[0]) !== s.son) s.sorunlar.push(`CANONICAL-BASKA ${yol(a.canonical[0])}`)

      // hreflang
      s.hreflang = Object.fromEntries(a.hreflang.map((h) => [h.dil, yol(h.href)]))
      if (!a.hreflang.length) s.sorunlar.push('HREFLANG-YOK')
      else {
        const dil = s.son.split('/')[1]
        const kendi = s.hreflang[dil]
        const anaya = Object.entries(s.hreflang).filter(([, h]) => /^\/(tr|en)$/.test(h))
        const dusus = !/^\/(tr|en)$/.test(s.son) && anaya.length > 0
        // Ana sayfaya düşüş = layout varsayılanı; "kendini göstermiyor" onun sonucudur, ayrı sayılmaz.
        if (dusus) s.sorunlar.push(`HREFLANG-ANA-SAYFAYA-DUSUYOR ${anaya.map(([d, h]) => `${d}=${h}`).join(',')}`)
        else if (kendi && kendi !== s.son) s.sorunlar.push(`HREFLANG-KENDINI-GOSTERMIYOR ${dil}=${kendi}`)
        for (const [d, h] of Object.entries(s.hreflang)) {
          if (h === s.son) continue
          const t = await gGetir(h)
          if (t.durum !== 200 || t.zincir.length > 1) s.sorunlar.push(`HREFLANG-HEDEF ${d}=${h} ${t.zincir.join('→')}`)
          else if (t.govde) {
            const geri = Object.values(Object.fromEntries(ayristir(t.govde).hreflang.map((x) => [x.dil, yol(x.href)])))
            if (!geri.includes(s.son) && !/^\/(tr|en)$/.test(h)) s.sorunlar.push(`HREFLANG-KARSILIKSIZ ${d}=${h}`)
          }
        }
      }
      satirlar.push(s)
    }
  }

  // Yinelenen başlık / metin (200 dönen, farklı son adresler arasında)
  const say = (anahtar) => {
    const m = new Map()
    for (const s of satirlar.filter((x) => x.durum === 200 && x[anahtar])) {
      const k = s[anahtar]
      if (!m.has(k)) m.set(k, new Set())
      m.get(k).add(s.son)
    }
    return m
  }
  for (const [anahtar, etiket] of [['baslik', 'YINELENEN-BASLIK'], ['metinOzet', 'YINELENEN-METIN']]) {
    for (const [, adresler] of say(anahtar)) if (adresler.size > 1) for (const s of satirlar) if (adresler.has(s.son)) s.sorunlar.push(`${etiket} (${[...adresler].filter((x) => x !== s.son).join(', ')})`)
  }

  // Bilinçli kararları kusurdan ayır
  for (const s of satirlar) {
    s.bilincli = []
    s.sorunlar = s.sorunlar.filter((x) => {
      const b = BILINCLI.find((k) => x.startsWith(k.sinif) && k.kosul(s))
      if (b) s.bilincli.push(`${b.sinif} (${b.gerekce})`)
      return !b
    })
  }

  // Core Web Vitals (isteğe bağlı)
  let cwv = null
  if (CWV) {
    cwv = {}
    for (const p of ['/tr', satirlar.find((s) => s.tur === 'aile-urun')?.son, satirlar.find((s) => s.tur === 'kategori')?.son].filter(Boolean)) {
      try {
        const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(TABAN + p)}&strategy=mobile&category=performance`)
        const j = await r.json()
        if (!r.ok) { cwv[p] = `OLCULEMEDI ${r.status} ${j.error?.status || ''}`; continue }
        const m = j.loadingExperience?.metrics
        cwv[p] = m ? Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.percentile} ${v.category}`])) : 'alan verisi yok (CrUX örneklemi yetersiz)'
      } catch (e) { cwv[p] = `OLCULEMEDI ${e.message}` }
    }
  }

  const aiBotlar = ROBOTS_BELIRTECLERI.filter((b) => b !== 'googlebot').map((b) => `${b}: ${robots.find((g) => g.ua.includes(b)) ? 'ÖZEL GRUP' : 'grup yok → * kuralları (varsayılan açık)'}`)
  const md = raporMd({ satirlar, robotsMetin, aiBotlar, cwv, haritaSayisi: haritaLoc.size })
  if (CIKTI) {
    mkdirSync(CIKTI, { recursive: true })
    writeFileSync(join(CIKTI, 'karne.json'), JSON.stringify({ taban: TABAN, olculme: new Date().toISOString(), satirlar, robotsMetin, cwv }, null, 1))
    writeFileSync(join(CIKTI, 'karne.md'), md)
    console.log(`karne yazıldı: ${CIKTI} · ${satirlar.length} adres · sorunlu ${satirlar.filter((s) => s.sorunlar.length).length}`)
  } else process.stdout.write(md)
  if (hatalar.length) process.exitCode = 1
}

function raporMd({ satirlar, robotsMetin, aiBotlar, cwv, haritaSayisi }) {
  const L = []
  L.push(`# Bot kalitesi karnesi — ${TABAN} — ${new Date().toISOString().slice(0, 16)}Z`, '')
  L.push(`Adres ${satirlar.length} · site haritası loc ${haritaSayisi} · sorunlu adres ${satirlar.filter((s) => s.sorunlar.length).length}`, '')
  L.push('| tür | adres | zincir | kelime G/GPT/Claude/Perp/Tar | title | açıkl. | H1 | canonical | hreflang | JSON-LD | harita | robots G | noindex | iç bağ. | sorunlar | bilinçli |')
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
  for (const s of satirlar) {
    const k = s.botlar ? ['googlebot', 'gptbot', 'claudebot', 'perplexitybot', 'tarayici'].map((b) => s.botlar[b]?.kelime ?? '-').join('/') : '-'
    const hl = s.hreflang ? Object.entries(s.hreflang).map(([d, h]) => `${d}=${h}`).join(' ') : '-'
    L.push(`| ${s.tur} | ${s.adres} | ${s.zincir} | ${k} | ${s.title ?? '-'} | ${s.aciklama ?? '-'} | ${s.h1 ?? '-'} | ${(s.canonical || []).join(' ') || '-'} | ${hl} | ${(s.jsonld || []).join(', ') || '-'} | ${s.haritada ?? '-'} | ${s.robots ? (s.robots.googlebot.izin ? 'izin' : 'YASAK') : '-'} | ${s.noindex ? 'EVET' : 'hayır'} | ${s.ic ?? '-'} | ${s.sorunlar.join(' · ') || '✓'} | ${(s.bilincli || []).join(' · ') || '-'} |`)
  }
  L.push('', '## Sorun sınıfları', '')
  const sinif = new Map()
  for (const s of satirlar) for (const x of s.sorunlar) { const k = x.split(' ')[0]; if (!sinif.has(k)) sinif.set(k, []); sinif.get(k).push(s.adres) }
  L.push('| sınıf | adres sayısı | adresler |', '|---|---|---|')
  for (const [k, v] of [...sinif].sort((a, b) => b[1].length - a[1].length)) L.push(`| ${k} | ${v.length} | ${v.join(', ')} |`)
  L.push('', '## robots.txt', '', '```', robotsMetin.trim(), '```', '', 'Yapay zekâ botları: ' + aiBotlar.join(' · '))
  if (cwv) L.push('', '## Core Web Vitals (PageSpeed/CrUX, mobil)', '', '```', JSON.stringify(cwv, null, 1), '```')
  return L.join('\n') + '\n'
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('bot-karnesi.mjs')) {
  main().catch((e) => { console.error('HATA', e.stack || e.message); process.exitCode = 1 })
}
