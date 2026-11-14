#!/usr/bin/env node
/**
 * KONUM YOLU ÖLÇÜMÜ (URN-164) — canlı sayfalarda JSON-LD BreadcrumbList halkalarını döker.
 *
 * Kullanım:
 *   node scripts/seo/konum-yolu-olc.mjs                       # site haritasındaki tüm bilgi merkezi yazıları
 *   node scripts/seo/konum-yolu-olc.mjs --taban https://venthub.com.tr --ek https://venthub.com.tr/tr/category/fanlar https://venthub.com.tr/tr/products/<slug>  (tam adres ver: Git Bash "/tr/..." yolunu bozar)
 *
 * K1 kuralı (karar 14 Kasım, cetvel urun-yapisal-veri-standard §4a): JSON-LD'de ANA SAYFA halkası yok, her halkanın item'ı
 * dolu, SON halka sayfanın kanonik adresi; 2 halkaya ulaşılamayan sayfada (kök kategori, Bilgi Merkezi liste) BreadcrumbList
 * BASILMAZ — bu sayfalar `--kirintisiz <tam adres>...` ile ilan edilir (kırıntı basarlarsa kusur).
 *
 * Çıktı: sayfa başına halka listesi (sıra, ad, item) + bayraklar: ADRESSIZ (item yok), ANA-SAYFA-HALKASI (ilk halka sitenin
 * kökü ya da /tr, /en), SON-HALKA-ADRES-FARKLI (son halkanın item'ı sayfanın kendi adresi değil), KIRINTI-YOK (beklenmedik),
 * KIRINTI-BEKLENMEZDI (`--kirintisiz` sayfası kırıntı basmış). Çıkış kodu 1: en az bir kusur var. Google'ın yol satırını
 * göstermesi GARANTİ DEĞİL (kırıntı ipucudur, satırı kendi seçer); bu betik yalnız sayfanın VERDİĞİ veriyi ölçer.
 */
const arg = process.argv.slice(2)
const tabanIdx = arg.indexOf('--taban')
const TABAN = (tabanIdx >= 0 ? arg[tabanIdx + 1] : 'https://venthub.com.tr').replace(/\/$/, '')
// `--ek` ve `--kirintisiz` değer listeleridir: bir sonraki `--` bayrağına kadar.
const degerler = (bayrak) => {
  const i = arg.indexOf(bayrak)
  if (i < 0) return []
  const cikti = []
  for (const a of arg.slice(i + 1)) {
    if (a.startsWith('--')) break
    cikti.push(a)
  }
  return cikti
}
const EK = degerler('--ek')
const KIRINTISIZ = new Set(degerler('--kirintisiz').map((a) => (a.startsWith('http') ? a : `${TABAN}${a}`).replace(/\/$/, '')))

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
// `--hepsi`: site haritasındaki TÜM `/tr/` adresleri ölçülür (ürün, kategori, marka, bilgi merkezi, ...). Kırıntı basmayan sayfa
// (ana sayfa, ürün seçici, hakkımızda, iletişim, kök kategori) bu kipte kusur DEĞİL, "KIRINTISIZ" olarak sayılır; kırıntı basan
// her sayfa K1 kuralına uymak zorundadır (0 adressiz halka, 0 Ana Sayfa halkası).
const HEPSI = arg.includes('--hepsi')
const tumTr = HEPSI ? [...harita.govde.matchAll(/<loc>([^<]*\/tr(?:\/[^<]*)?)<\/loc>/g)].map((m) => m[1]) : []
const sayfalar = [...new Set([...yazilar, ...tumTr, ...EK, ...KIRINTISIZ].map((e) => (e.startsWith('http') ? e : `${TABAN}${e}`)))]
if (sayfalar.length === 0) {
  console.error('ölçüm evreni boş (site haritasında yazı yok)')
  process.exit(1)
}

let kusur = 0
let kirintisiz = 0
for (const url of sayfalar) {
  const { durum, govde } = await metin(url)
  const listeler = halkalar(govde)
  const bayrak = []
  if (durum !== 200) bayrak.push(`HTTP-${durum}`)
  // JSON-LD yoksa RDFa/mikroveri BreadcrumbList var mı (başka siteler bu biçimi kullanır); halkaları dökmez, yalnız bildirir.
  const mikro = /typeof=["']BreadcrumbList["']|itemtype=["']https?:\/\/schema\.org\/BreadcrumbList["']/i.test(govde)
  const beklenmez = KIRINTISIZ.has(url.replace(/\/$/, ''))
  if (listeler.length === 0 && mikro) bayrak.push('YALNIZ-MIKROVERI')
  else if (listeler.length === 0 && !beklenmez && !(HEPSI && !yazilar.includes(url) && !EK.includes(url))) bayrak.push('KIRINTI-YOK')
  else if (listeler.length === 0 && HEPSI) kirintisiz++
  if (listeler.length > 0 && beklenmez) bayrak.push('KIRINTI-BEKLENMEZDI')
  if (listeler.length > 1) bayrak.push('BIRDEN-COK-LISTE')
  const liste = listeler[0] ?? []
  if (liste.some((h) => !h.item)) bayrak.push('ADRESSIZ')
  const ilk = liste[0]
  if (ilk && (/^\/?(tr|en)?\/?$/.test(ilk.item.replace(/^https?:\/\/[^/]+/, '')) || /^(ana ?sayfa|home)$/i.test(ilk.ad))) bayrak.push('ANA-SAYFA-HALKASI')
  const son = liste[liste.length - 1]
  if (son && son.item && son.item.replace(/\/$/, '') !== url.replace(/\/$/, '')) bayrak.push('SON-HALKA-ADRES-FARKLI')
  if (bayrak.length) kusur++
  console.log(`${url} ${bayrak.length ? `[${bayrak.join(',')}]` : '[TAMAM]'}`)
  for (const h of liste) console.log(`   ${h.sira}. ${h.ad} -> ${h.item || '(adres yok)'}`)
}
console.log(`\n${sayfalar.length} sayfa, ${kusur} kusurlu${HEPSI ? `, ${kirintisiz} kırıntısız (beklenen)` : ''}`)
process.exit(kusur ? 1 : 0)
