/**
 * YETİM SAYFA TARAMASI — site haritasındaki her sayfaya, site içinden ham HTML `<a href>` ile ulaşılabiliyor mu
 * (REC-472, REC-471 kabul ölçütünün aracı; cetvel docs/standards/yayin-gorunurluk-denetim-standard.md Y1/Y3).
 *
 * NİÇİN: Google yalnız `<a>` etiketinde `href` özniteliği olan bağlantıyı tarar ("Google can only crawl your link if
 * it's an <a> HTML element ... with an href attribute") ve ilgilendiğin her sayfaya sitenin başka bir sayfasından
 * bağlantı olmasını ister ("Every page you care about should have a link from at least one other page on your site").
 * Site haritası bir sayfayı Google'a ADRES olarak bildirir ama onu site içinden bulunur kılmaz. `<button onClick>`
 * ile gezinen kartlar (CategoryShowcaseView) görsel olarak bağlantıdır, tarayıcı için değildir. Bu kusuru ne
 * linkinator (kırık bağlantıya bakar) ne adres denetimi (haritanın kendisine bakar) görür; ölçüm burada: JS
 * ÇALIŞTIRILMAZ, sayfanın ham HTML'i (Googlebot'un ilk gördüğü) taranır.
 *
 * Yöntem: `<taban>/sitemap.xml` içindeki her `<loc>` indirilir (en çok 6 eşzamanlı, istek başına 20 sn);
 * yalnız `<a href>` hedefleri toplanır (`<link>`, `<button>`, script/JSON-LD içindeki dizgiler SAYILMAZ); adres aynı
 * host'a indirgenir, `#` ve sorgu atılır, sondaki `/` kalkar, yüzde-kodu çözülür. "Gelen" = kendisi hariç, ona
 * `<a href>` veren FARKLI haritalı sayfa sayısı. Kovalar: 0 / 1 / 2-3 / 4-10 / 11+.
 *
 * Kullanım: node scripts/seo/yetim-tara.mjs [--taban https://venthub.com.tr] [--cikti <depo-dışı klasör>]
 *           [--izin /tr/yol-a,/tr/yol-b]   (bilinçli istisna; gerekçesi cetvelde yazılı olmalı)
 * Çıkış: 0 temiz · 1 yetim var (0 gelen, --izin dışı) · 2 ölçülemedi (harita ya da bir sayfa alınamadı — sessiz geçmez).
 * Çıktı depoya girmez (pazar-olcum P6); özet sayı cetvelin ölçüm geçmişine yazılır.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const EN_COK_ESZAMANLI = 6
const ISTEK_ZAMAN_ASIMI_MS = 20_000
const KOVALAR = ['0', '1', '2-3', '4-10', '11+']

/** HTML varlıklarının bu iş için yeterli alt kümesi (&amp; &quot; &#39; &#x27; ...). */
function varlikCoz(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|quot|apos|lt|gt);/g, (_, a) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[a])
}

/** Adres → site içi yol (host aynıysa): `#`/sorgu atılır, yüzde-kodu çözülür, sondaki `/` kalkar (kök = "/"). Başka host ya da http(s) dışı → null. */
export function yolaIndirge(adres, taban, sayfaAdresi = taban) {
  let u
  try { u = new URL(adres, sayfaAdresi) } catch { return null }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  if (u.host !== new URL(taban).host) return null
  let yol = u.pathname
  try { yol = decodeURIComponent(yol) } catch { /* bozuk yüzde-kodu: ham haliyle kalır */ }
  yol = yol.replace(/\/+$/, '')
  return yol === '' ? '/' : yol
}

/**
 * Ham HTML → `<a href>` hedefi olan TEKİL site içi yollar. Yalnız `<a>` etiketi sayılır; script/style/yorum/
 * template içeriği önce atılır (JSON-LD ve gömülü dizgiler bağlantı değildir). Öznitelikler sırayla ayrıştırılır:
 * başka bir özniteliğin değerindeki `href=` ve `data-href` bağlantı sayılmaz. `sayfaAdresi` göreli (kök-göreli
 * olmayan) href'leri çözmek içindir; verilmezse `taban`.
 */
export function hrefleriTopla(html, taban, sayfaAdresi = taban) {
  const govde = String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ')
  const yollar = new Set()
  for (const etiket of govde.matchAll(/<a(?=[\s/>])((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
    for (const o of etiket[1].matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      if (o[1].toLowerCase() !== 'href') continue
      const deger = o[2] ?? o[3] ?? o[4]
      if (deger === undefined) break
      const yol = yolaIndirge(varlikCoz(deger).trim(), taban, sayfaAdresi)
      if (yol) yollar.add(yol)
      break // aynı etiketteki ikinci href tarayıcıca yok sayılır
    }
  }
  return [...yollar]
}

/** `{yol|Map}` → Map; anahtarlar adres ya da yol olabilir, yola indirgenir. */
function haritaya(girdi, taban) {
  const cift = girdi instanceof Map ? [...girdi.entries()] : Object.entries(girdi)
  const cikis = new Map()
  for (const [k, v] of cift) {
    const yol = yolaIndirge(k, taban)
    if (yol) cikis.set(yol, v)
  }
  return cikis
}

/**
 * Haritalı sayfalar → her birinin "gelen" sayısı (kendisi hariç, ona `<a href>` veren FARKLI haritalı sayfa).
 * `sayfaHtmlHaritasi`: {adres|yol: ham HTML}; değeri null/undefined olan sayfa (alınamadı) evrende kalır ama
 * çıkan bağlantı vermez. Dönüş: {yol: gelenSayısı} — haritadaki her sayfa anahtardır (0 dahil).
 */
export function gelenSay(sayfaHtmlHaritasi, taban) {
  const sayfalar = haritaya(sayfaHtmlHaritasi, taban)
  const gelenler = new Map([...sayfalar.keys()].map((y) => [y, new Set()]))
  for (const [yol, html] of sayfalar) {
    if (html == null) continue
    for (const hedef of hrefleriTopla(html, taban, new URL(yol, taban).href)) {
      if (hedef !== yol && gelenler.has(hedef)) gelenler.get(hedef).add(yol)
    }
  }
  return Object.fromEntries([...gelenler].map(([y, k]) => [y, k.size]))
}

/** Gelen sayısı → kova adı. */
export function kovaAdi(n) {
  return n === 0 ? '0' : n === 1 ? '1' : n <= 3 ? '2-3' : n <= 10 ? '4-10' : '11+'
}

/** Gelen haritası → rapor. `izin` yollar bilinçli istisnadır: yetim sayılmaz, ayrı listelenir. */
export function ozetle(gelen, alinamayan = [], izin = [], taban = 'https://venthub.com.tr') {
  const izinKumesi = new Set(izin.map((a) => yolaIndirge(a, taban)).filter(Boolean))
  const yollar = Object.keys(gelen).sort()
  const dagilim = Object.fromEntries(KOVALAR.map((k) => [k, 0]))
  for (const y of yollar) dagilim[kovaAdi(gelen[y])]++
  const sifir = yollar.filter((y) => gelen[y] === 0)
  return {
    sayfa: yollar.length,
    yetim: sifir.filter((y) => !izinKumesi.has(y)),
    izinliYetim: sifir.filter((y) => izinKumesi.has(y)),
    birGelen: yollar.filter((y) => gelen[y] === 1),
    dagilim,
    alinamadi: [...alinamayan].sort(),
  }
}

/** Rapor → çıkış kodu: ölçüm eksikse 2 (yetim sayısına güvenilmez), yetim varsa 1, temizse 0. */
export function cikisKodu(ozet) {
  if (ozet.alinamadi.length > 0) return 2
  return ozet.yetim.length > 0 ? 1 : 0
}

async function getir(adres) {
  const r = await fetch(adres, { signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS), headers: { 'user-agent': 'VentHub-yetim-tara/1.0' } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.text()
}

/** Site haritası → `<loc>` adresleri (site haritası dizini varsa alt haritalar da gezilir). */
async function haritaAdresleri(taban) {
  const locler = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => varlikCoz(m[1]))
  const xml = await getir(`${taban}/sitemap.xml`)
  if (!/<sitemapindex/i.test(xml)) return locler(xml)
  const hepsi = []
  for (const alt of locler(xml)) hepsi.push(...locler(await getir(alt)))
  return hepsi
}

/** Sınırlı eşzamanlılıkla sırayla çalıştırır; her iş kendi hatasını yakalar. */
async function havuz(isler, sinir, fn) {
  let sira = 0
  await Promise.all(Array.from({ length: Math.min(sinir, isler.length) }, async () => {
    while (sira < isler.length) await fn(isler[sira++])
  }))
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const cikti = deger('--cikti')
  const izin = (deger('--izin') || '').split(',').map((s) => s.trim()).filter(Boolean)

  let adresler
  try { adresler = await haritaAdresleri(taban) } catch (e) {
    console.error(`HATA: site haritası alınamadı (${e.message})`); process.exit(2)
  }
  // Evren = haritadaki tekil yollar; her sayfa `--taban` üzerinden indirilir (ön izleme sitesinde de koşar).
  const evren = new Map()
  for (const a of adresler) {
    const yol = yolaIndirge(a, 'https://' + new URL(a).host)
    if (yol && !evren.has(yol)) evren.set(yol, new URL(a).pathname)
  }
  if (!evren.size) { console.error('HATA: site haritası boş'); process.exit(2) }

  const html = {}
  const alinamayan = []
  await havuz([...evren], EN_COK_ESZAMANLI, async ([yol, hamYol]) => {
    try { html[yol] = await getir(taban + hamYol) } catch (e) {
      html[yol] = null
      alinamayan.push(`${yol} (${e.name === 'TimeoutError' ? 'zaman aşımı' : e.message})`)
    }
  })

  const gelen = gelenSay(html, taban)
  const o = ozetle(gelen, alinamayan, izin, taban)
  console.log(`sayfa ${o.sayfa} · yetim (0 gelen) ${o.yetim.length} · 1 gelen ${o.birGelen.length} · alınamadı ${o.alinamadi.length}`
    + (o.izinliYetim.length ? ` · izinli yetim ${o.izinliYetim.length}` : ''))
  console.log('dağılım ' + Object.entries(o.dagilim).map(([k, n]) => `${k}:${n}`).join(' · '))
  if (o.yetim.length) console.log('YETİM:\n  ' + o.yetim.join('\n  '))
  if (o.birGelen.length) console.log('1 GELEN:\n  ' + o.birGelen.join('\n  '))
  if (o.alinamadi.length) console.log('ALINAMADI:\n  ' + o.alinamadi.join('\n  '))
  if (cikti) {
    mkdirSync(cikti, { recursive: true })
    writeFileSync(join(cikti, 'yetim-tara.json'), JSON.stringify({ taban, an: new Date().toISOString(), ozet: o, gelen }, null, 2))
  }
  process.exitCode = cikisKodu(o)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
