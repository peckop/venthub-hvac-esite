#!/usr/bin/env node
/**
 * KONUM YOLU ÖLÇÜMÜ (URN-164) — canlı sayfalarda JSON-LD BreadcrumbList halkalarını döker.
 *
 * Kullanım:
 *   node scripts/seo/konum-yolu-olc.mjs                       # site haritasındaki tüm bilgi merkezi yazıları
 *   node scripts/seo/konum-yolu-olc.mjs --taban https://venthub.com.tr --ek https://venthub.com.tr/tr/category/fanlar https://venthub.com.tr/tr/products/<slug>  (tam adres ver: Git Bash "/tr/..." yolunu bozar)
 *
 * Çıktı: sayfa başına halka listesi (sıra, ad, item) + bayraklar: ADRESSIZ (item yok), ILK-HALKA (ad), SON-HALKA-ADRES-FARKLI
 * (son halkanın item'ı sayfanın kendi adresi değil). Çıkış kodu 1: en az bir sayfada kırıntı yok, adressiz halka var ya da
 * son halka sayfanın adresi değil. Google'ın yol satırını göstermesi GARANTİ DEĞİL (kırıntı ipucudur); bu betik yalnız
 * sayfanın VERDİĞİ veriyi ölçer.
 */
const arg = process.argv.slice(2)
const tabanIdx = arg.indexOf('--taban')
const TABAN = (tabanIdx >= 0 ? arg[tabanIdx + 1] : 'https://venthub.com.tr').replace(/\/$/, '')
const ekIdx = arg.indexOf('--ek')
const EK = ekIdx >= 0 ? arg.slice(ekIdx + 1).filter((a) => !a.startsWith('--')) : []

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; konum-yolu-olcum)' }

async function metin(url) {
  const r = await fetch(url, { headers: UA, redirect: 'follow' })
  return { durum: r.status, govde: await r.text() }
}

function halkalar(html) {
  const bulunan = []
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let j
    try {
      j = JSON.parse(m[1])
    } catch {
      continue
    }
    const kuyruk = [j]
    while (kuyruk.length) {
      const x = kuyruk.shift()
      if (!x || typeof x !== 'object') continue
      if (Array.isArray(x)) {
        kuyruk.push(...x)
        continue
      }
      if (x['@graph']) kuyruk.push(...x['@graph'])
      // WebPage.breadcrumb içine gömülü BreadcrumbList (ziehl-abegg gibi siteler)
      if (x.breadcrumb && typeof x.breadcrumb === 'object') kuyruk.push(x.breadcrumb)
      const tur = x['@type']
      if (tur === 'BreadcrumbList' || (Array.isArray(tur) && tur.includes('BreadcrumbList'))) {
        bulunan.push(
          (x.itemListElement ?? []).map((e) => ({
            sira: e.position,
            ad: e.name ?? e.item?.name ?? '',
            item: e.item ? (typeof e.item === 'string' ? e.item : e.item['@id'] ?? '') : '',
          })),
        )
      }
    }
  }
  return bulunan
}

// `--sadece-ek`: site haritası okunmaz, yalnız --ek adresleri ölçülür (başka sitelerin sayfalarını karşılaştırmak için).
const SADECE_EK = arg.includes('--sadece-ek')
const harita = SADECE_EK ? { govde: '' } : await metin(`${TABAN}/sitemap.xml`)
const yazilar = [...harita.govde.matchAll(/<loc>([^<]*\/tr\/bilgi-merkezi\/[^<]+)<\/loc>/g)].map((m) => m[1])
const sayfalar = [...yazilar, ...EK.map((e) => (e.startsWith('http') ? e : `${TABAN}${e}`))]
if (sayfalar.length === 0) {
  console.error('ölçüm evreni boş (site haritasında yazı yok)')
  process.exit(1)
}

let kusur = 0
for (const url of sayfalar) {
  const { durum, govde } = await metin(url)
  const listeler = halkalar(govde)
  const bayrak = []
  if (durum !== 200) bayrak.push(`HTTP-${durum}`)
  // JSON-LD yoksa RDFa/mikroveri BreadcrumbList var mı (başka siteler bu biçimi kullanır); halkaları dökmez, yalnız bildirir.
  const mikro = /typeof=["']BreadcrumbList["']|itemtype=["']https?:\/\/schema\.org\/BreadcrumbList["']/i.test(govde)
  if (listeler.length === 0 && mikro) bayrak.push('YALNIZ-MIKROVERI')
  else if (listeler.length === 0) bayrak.push('KIRINTI-YOK')
  if (listeler.length > 1) bayrak.push('BIRDEN-COK-LISTE')
  const liste = listeler[0] ?? []
  if (liste.some((h) => !h.item)) bayrak.push('ADRESSIZ')
  const son = liste[liste.length - 1]
  if (son && son.item && son.item.replace(/\/$/, '') !== url.replace(/\/$/, '')) bayrak.push('SON-HALKA-ADRES-FARKLI')
  if (bayrak.length) kusur++
  console.log(`${url} ${bayrak.length ? `[${bayrak.join(',')}]` : '[TAMAM]'}`)
  for (const h of liste) console.log(`   ${h.sira}. ${h.ad} -> ${h.item || '(adres yok)'}`)
}
console.log(`\n${sayfalar.length} sayfa, ${kusur} kusurlu`)
process.exit(kusur ? 1 : 0)
