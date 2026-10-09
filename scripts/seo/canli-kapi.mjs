/**
 * CANLI TARAMA KAPISI — Google kural denetiminin (REC-461, 82 kural) yayındaki siteyi ÖLÇEN kısmı, TEK geçişte
 * (cetvel docs/standards/yayin-gorunurluk-denetim-standard.md Y1/Y2/Y3; kural numaraları TEK-TABLO.md'dendir).
 *
 * NİÇİN: 2026-09-30 denetimi 82 kuralın 57'sinde canlı siteyi ölçen otomatik kontrol olmadığını buldu; 21 kusur
 * kod testleri yeşilken canlıda duruyordu (kod doğru olabilir, yayındaki çıktı yanlış olabilir: EN sayfalar
 * lang="tr", favicon.ico aslında SVG, /icon.png 500, olmayan marka 200 ...). Dağınık betikler (adres denetimi,
 * bağlantı taraması, bot karnesi) her biri bir dilimi görür ve hiçbiri her dağıtımdan sonra koşmaz. Bu kapı
 * 12 kontrol ailesini aynı veri kümesine karşı bir kerede koşar; ağsız saf çekirdek (`kontrolEt`) INV-CANLI-KAPI-1
 * ile kilitlidir, yani bir kontrol körleşirse test kırılır — "yeşil ama kör" kapı olmaz.
 *
 * Yöntem (TEK GEÇİŞ): `<taban>/sitemap.xml` + içindeki her adresin ham HTML'i BİR kez indirilir (en çok 6
 * eşzamanlı, istek başına 20 sn, 1 yeniden deneme, `redirect: 'manual'` → 3xx görünür). Tüm kontroller bu veriden
 * ve az sayıda ek istekten çalışır: /en ve /en/products (EN sayfa dili), robots.txt, favicon ve ikon dosyaları,
 * gizli yüzeyler (hesap/ödeme/giriş/admin), 5 "olmayan adres", site içi bağlantı hedefleri (HEAD) ve 5 sabit
 * yönlendirme zinciri. JS ÇALIŞTIRILMAZ: Googlebot'un ilk gördüğü ham HTML ölçülür.
 *
 * Kontroller (kod · TEK-TABLO kural no):
 *   YETIM 9 (7, 11) · TITLE-YOK/TEKRAR 76 · TITLE-UZUN 77 · TITLE-TASLAK 3 · ACIKLAMA-YOK/TEKRAR 79 ·
 *   ACIKLAMA-KESIK/SABLON/KISA 5 · LANG 6 · FAVICON 2 · LASTMOD-BUGUN 42 · LASTMOD-TOPLU 29 · ROBOTS-KALIP 15 (44) ·
 *   SOFT404 1 (54) · IC-BAGLANTI-YONLENDIRME 12 · YONLENDIRME-ZINCIRI 14 · JSONLD-* 66/18/17/58/59/20/62 ·
 *   ROBOTS-HARITA-ALAN 16 · HARITA-ADRES-DURUM 73 (ek: haritadaki adres 200 değilse) ·
 *   LLMS-SAYFA / LLMS-DIL (ek, SEO-6: llms.txt'in sayfa/kategori sayısı ve `Languages:` beyanı haritayla çelişirse) ·
 *   SPEC-HAM-DEGER (ek, URN-58: teknik tablo hücresinin görünür metni tam `true`/`false` ise).
 *
 * Kullanım: node scripts/seo/canli-kapi.mjs [--taban https://venthub.com.tr] [--cikti <depo dışı klasör>]
 *           [--bilinen <json>] [--kayit-durum <json>] [--bugun YYYY-MM-DD]
 *   --kayit-durum: `{ "REC-nn": {"ad":"Todo","tip":"unstarted"} }`; verilmezse durum Linear'dan LINEAR_API_KEY ile çekilir.
 *   Kaydı Done/Canceled olan ya da REC'e bağlı olmayan bilinen satırı KIRMIZI sayılır (susturma kalıcı olamaz).
 *   --bilinen: `{ "KOD": "REC-nn" }`; bilinen KIRMIZI "BİLİNEN(REC-nn)" basılır ve çıkışı 1 YAPMAZ (kod adı tam eşleşir
 *   ya da `KOD-` ailesidir: "JSONLD" → JSONLD-ISPARTOF); listede olmayan yeni KIRMIZI çıkışı 1 yapar. Varsayılan:
 *   bilinen yok, her KIRMIZI çıkış 1 verir. UYARI çıkışı hiçbir zaman etkilemez.
 * Çıkış: 0 temiz (ya da yalnız bilinen KIRMIZI/UYARI) · 1 yeni KIRMIZI var · 2 araç/ağ hatası (harita ya da bir
 * istek alınamadı — ölçüme güvenilmez, sessiz geçmez).
 * Çıktı depoya girmez (pazar-olcum P6); `--cikti` klasörüne canli-kapi.json yazılır, özet sayı cetvele girer.
 * Sınır (dürüst): HTML düzenli ifadeyle ayrıştırılır (bağımlılık yok); render sonrası DOM, Core Web Vitals,
 * görünür-içerik eşleşmesi burada ölçülmez (TEK-TABLO "ÖLÇÜLMEDİ" satırları).
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gelenSay, yolaIndirge, hrefleriTopla } from './yetim-tara.mjs'

const EN_COK_ESZAMANLI = 6
const ISTEK_ZAMAN_ASIMI_MS = 20_000
const UA = 'VentHub-canli-kapi/1.0'

/** Kod → TEK-TABLO kural numarası (konsol özeti ve JSON raporu için). */
export const KURAL_NO = {
  YETIM: '9',
  'TITLE-YOK': '76',
  'TITLE-TEKRAR': '76',
  'TITLE-UZUN': '77',
  'TITLE-TASLAK': '3',
  'ACIKLAMA-YOK': '79',
  'ACIKLAMA-TEKRAR': '79',
  'ACIKLAMA-KESIK': '5',
  'ACIKLAMA-SABLON': '5',
  'ACIKLAMA-KISA': '5',
  LANG: '6',
  FAVICON: '2',
  'LASTMOD-BUGUN': '42',
  'LASTMOD-TOPLU': '29',
  'ROBOTS-KALIP': '15,44',
  SOFT404: '1,54',
  'IC-BAGLANTI-YONLENDIRME': '12',
  'YONLENDIRME-ZINCIRI': '14',
  'JSONLD-PARSE': '66',
  'JSONLD-COLLECTIONPAGE': '18',
  'JSONLD-ISPARTOF': '17',
  'JSONLD-PRODUCTGROUP-ALAN': '58,59',
  'JSONLD-BREADCRUMB': '20,62',
  'ROBOTS-HARITA-ALAN': '16',
  'HARITA-ADRES-DURUM': '73',
  'LLMS-SAYFA': '-',
  'LLMS-DIL': '-',
  'VITRIN-IDDIA': '-',
  'SPEC-HAM-DEGER': '-',
}
const KOD_SIRASI = Object.keys(KURAL_NO)

/** Sabit sondalar (kural 1/54 olmayan adresler, kural 14 zincirler, kural 15/44 gizli yüzeyler). */
export const OLMAYAN_ADRESLER = [
  '/tr/products/olmayan-urun-xyz',
  '/tr/category/olmayan-kategori',
  '/tr/bilgi-merkezi/olmayan-yazi',
  '/tr/brands/olmayan-marka',
  '/tr/markalar/olmayan-marka',
]
export const ZINCIR_YOLLARI = ['/category/fanlar', '/products', '/bilgi-merkezi', '/category/fans']
export const GIZLI_YUZEYLER = ['/tr/account', '/tr/checkout', '/tr/auth/login', '/admin']
export const EN_SAYFALAR = ['/en', '/en/products']
/** Ana sayfadaki ikon dosyaları: [yol, tür]. favicon.ico ICO ya da PNG sihirli baytı ister. */
export const IKON_DOSYALARI = [['/favicon.ico', 'ico'], ['/icon.png', 'png'], ['/apple-icon.png', 'png'], ['/manifest.webmanifest', 'json']]

// ---------------------------------------------------------------------------------------------------------------
// HTML yardımcıları (saf)

/** HTML varlıklarının bu iş için yeterli alt kümesi (yetim-tara'daki ile aynı; orada dışa açık değil). */
function varlikCoz(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|quot|apos|lt|gt);/g, (_, a) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[a])
}

const bosluksuz = (s) => varlikCoz(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const uzunluk = (s) => [...s].length

/** Etiket iç metni (`a="1" b='2' c=3 d`) → {ad: değer}; aynı öznitelik tekrarlanırsa İLKİ geçerli (tarayıcı gibi). */
export function ozellikler(icMetin) {
  const o = {}
  for (const m of String(icMetin).matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const ad = m[1].toLowerCase()
    if (!(ad in o)) o[ad] = varlikCoz(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return o
}

const ETIKET_ICI = '((?:[^>"\']|"[^"]*"|\'[^\']*\')*)'
const aciliEtiket = (ad) => new RegExp('<' + ad + '(?=[\\s/>])' + ETIKET_ICI + '>', 'gi')

/** Yorum/script/style/template atılmış HTML (script içindeki dizgiler etiket sayılmasın). */
function temizle(html) {
  return String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ')
}

/** Sayfadan kontrollerin ihtiyaç duyduğu alanlar. `<svg><title>` gibi gövde içi title SAYILMAZ: önce `<head>`. */
export function sayfaAlanlari(html) {
  const temiz = temizle(html)
  const head = /<head\b[^>]*>([\s\S]*?)<\/head\s*>/i.exec(temiz)
  const ust = head ? head[1] : temiz
  const govde = head ? temiz.slice(head.index + head[0].length) : temiz
  const t = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(ust)
  const metalar = [...ust.matchAll(aciliEtiket('meta'))].map((m) => ozellikler(m[1]))
  const aciklama = metalar.find((m) => (m.name || '').toLowerCase() === 'description')
  const robots = metalar.filter((m) => (m.name || '').toLowerCase() === 'robots').map((m) => m.content || '').join(',')
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i.exec(govde)
  const htmlEt = aciliEtiket('html').exec(temiz)
  const linkler = [...ust.matchAll(aciliEtiket('link'))].map((m) => ozellikler(m[1]))
  return {
    title: t ? bosluksuz(t[1]) : null,
    aciklama: aciklama ? bosluksuz(aciklama.content || '') : null,
    h1: h1 ? bosluksuz(h1[1]) : null,
    lang: htmlEt ? (ozellikler(htmlEt[1]).lang ?? null) : null,
    metaRobots: robots,
    ikonVar: linkler.some((l) => (l.rel || '').toLowerCase().split(/\s+/).includes('icon') && (l.href || '').trim() !== ''),
  }
}

/** Ham HTML → JSON-LD blokları [{ham, veri, hata}] (`type` "application/ld+json"; büyük/küçük harf önemsiz). */
export function jsonldBloklari(html) {
  const sonuc = []
  const govde = String(html ?? '').replace(/<!--[\s\S]*?-->/g, ' ')
  for (const m of govde.matchAll(/<script(?=[\s/>])((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi)) {
    if ((ozellikler(m[1]).type || '').toLowerCase() !== 'application/ld+json') continue
    try { sonuc.push({ ham: m[2], veri: JSON.parse(m[2]), hata: null }) } catch (e) { sonuc.push({ ham: m[2], veri: null, hata: e.message }) }
  }
  return sonuc
}

const tipler = (n) => [].concat(n['@type'] ?? []).map(String)

/** JSON-LD değerindeki tüm nesneleri (iç içe, @graph dahil) düz listeye çıkarır. */
function tumDugumler(v, cikti = []) {
  if (Array.isArray(v)) v.forEach((x) => tumDugumler(x, cikti))
  else if (v && typeof v === 'object') {
    cikti.push(v)
    for (const x of Object.values(v)) tumDugumler(x, cikti)
  }
  return cikti
}

// ---------------------------------------------------------------------------------------------------------------
// Site haritası ve robots.txt (saf)

/**
 * Site haritası XML'i → { satirlar: [{loc, lastmod, changefreq, priority}], hreflangSayisi } (alt harita dizini burada
 * çözülmez; ağ katmanı gezer). `hreflangSayisi`: `<xhtml:link … hreflang=…>` sayısı (llms.txt dil beyanı sınaması için).
 */
export function haritaCoz(xml) {
  const satirlar = []
  for (const m of String(xml).matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const al = (ad) => { const r = new RegExp('<' + ad + '>\\s*([^<]*?)\\s*</' + ad + '>').exec(m[1]); return r ? varlikCoz(r[1]) : null }
    const loc = al('loc')
    if (loc) satirlar.push({ loc, lastmod: al('lastmod'), changefreq: al('changefreq'), priority: al('priority') })
  }
  const hreflangSayisi = [...String(xml).matchAll(/<xhtml:link\b[^>]*\bhreflang\s*=/gi)].length
  return { satirlar, hreflangSayisi }
}

/** robots.txt → `User-agent: *` grubundaki boş olmayan Disallow kalıpları. */
export function robotsDisallow(metin) {
  const kalip = []
  let ajanlar = []
  let oncekiKural = true
  for (const ham of String(metin ?? '').split(/\r?\n/)) {
    const satir = ham.replace(/#.*$/, '').trim()
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(satir)
    if (!m) continue
    const alan = m[1].toLowerCase()
    if (alan === 'user-agent') {
      if (oncekiKural) ajanlar = []
      ajanlar.push(m[2].trim())
      oncekiKural = false
    } else {
      oncekiKural = true
      if (alan === 'disallow' && m[2].trim() && ajanlar.includes('*')) kalip.push(m[2].trim())
    }
  }
  return kalip
}

/** Google robots.txt kalıbı (`*` her dizi, sonda `$` bitiş) yol BAŞINDAN eşleşir. */
export function robotsEslesir(kalip, yol) {
  const sonaBagli = kalip.endsWith('$')
  const govde = (sonaBagli ? kalip.slice(0, -1) : kalip).split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')
  return new RegExp('^' + govde + (sonaBagli ? '$' : '')).test(yol)
}

// ---------------------------------------------------------------------------------------------------------------
// Kontroller (saf çekirdek)

const bulgu = (kod, seviye, adres, kanit) => ({ kod, seviye, adres, kanit })

/** Site içi bağlantı hedefleri: {yol: [kaynak sayfa yolları]} (tekil; `<a href>` dışı sayılmaz). */
export function icHedefleriTopla(sayfalar, taban) {
  const hedefler = new Map()
  for (const s of sayfalar) {
    if (s.html == null) continue
    for (const h of hrefleriTopla(s.html, taban, new URL(s.yol, taban).href)) {
      if (h === s.yol) continue
      if (!hedefler.has(h)) hedefler.set(h, [])
      hedefler.get(h).push(s.yol)
    }
  }
  return hedefler
}

const dilOnEki = (yol) => (/^\/(tr|en)(?:\/|$)/.exec(yol) || [])[1] || null
const kisalt = (s, n = 90) => (uzunluk(String(s)) > n ? [...String(s)].slice(0, n).join('') + '…' : String(s))

function baslikKontrolleri(ozet, cikti) {
  const gruplar = new Map()
  for (const { yol, a } of ozet) {
    if (!a.title) cikti.push(bulgu('TITLE-YOK', 'KIRMIZI', yol, '<title> yok ya da boş'))
    else {
      if (!gruplar.has(a.title)) gruplar.set(a.title, [])
      gruplar.get(a.title).push(yol)
      if (uzunluk(a.title) > 60) cikti.push(bulgu('TITLE-UZUN', 'UYARI', yol, `${uzunluk(a.title)} krk: ${kisalt(a.title)}`))
    }
    // "(Taslak)" / "Taslak": title'da ya da ilk h1'de (sayfa başına tek bulgu)
    if (a.title && /\btaslak\b/i.test(a.title)) cikti.push(bulgu('TITLE-TASLAK', 'KIRMIZI', yol, `<title> "Taslak" içeriyor: ${kisalt(a.title)}`))
    else if (a.h1 && /\btaslak\b/i.test(a.h1)) cikti.push(bulgu('TITLE-TASLAK', 'KIRMIZI', yol, `ilk <h1> "Taslak" içeriyor: ${kisalt(a.h1)}`))
  }
  for (const [t, yollar] of gruplar) {
    if (yollar.length >= 2) for (const y of yollar) cikti.push(bulgu('TITLE-TEKRAR', 'KIRMIZI', y, `${yollar.length} sayfada aynı title: ${kisalt(t)}`))
  }
}

/** Sayfa adı (h1, yoksa title'ın marka öncesi kısmı) — açıklama kalıbından çıkarılacak ad adayları. */
function adAdaylari(a) {
  const adaylar = []
  if (a.h1) adaylar.push(a.h1)
  if (a.title) adaylar.push(a.title.split(/\s[|–—-]\s/)[0])
  return adaylar.map((x) => x.trim()).filter((x) => uzunluk(x) >= 3)
}

function aciklamaKontrolleri(ozet, cikti) {
  const gruplar = new Map()
  const sablonlar = new Map()
  for (const { yol, a } of ozet) {
    const d = a.aciklama
    if (!d) { cikti.push(bulgu('ACIKLAMA-YOK', 'KIRMIZI', yol, '<meta name="description"> yok ya da boş')); continue }
    if (!gruplar.has(d)) gruplar.set(d, [])
    gruplar.get(d).push(yol)
    const n = uzunluk(d)
    if (n >= 150 && n <= 160 && !/[.!?…]$/.test(d)) cikti.push(bulgu('ACIKLAMA-KESIK', 'KIRMIZI', yol, `${n} krk, cümle bitişi yok (kesilmiş olabilir): ...${[...d].slice(-40).join('')}`))
    if (n < 70) cikti.push(bulgu('ACIKLAMA-KISA', 'UYARI', yol, `${n} krk: ${kisalt(d)}`))
    const kucuk = d.toLocaleLowerCase('tr')
    for (const ad of adAdaylari(a)) {
      const adK = ad.toLocaleLowerCase('tr')
      if (!kucuk.includes(adK)) continue
      const kalip = kucuk.split(adK).join('{ad}')
      if (!sablonlar.has(kalip)) sablonlar.set(kalip, [])
      sablonlar.get(kalip).push(yol)
      break
    }
  }
  for (const [d, yollar] of gruplar) {
    if (yollar.length >= 2) for (const y of yollar) cikti.push(bulgu('ACIKLAMA-TEKRAR', 'KIRMIZI', y, `${yollar.length} sayfada aynı açıklama: ${kisalt(d)}`))
  }
  for (const [kalip, yollar] of sablonlar) {
    if (yollar.length >= 5) for (const y of yollar) cikti.push(bulgu('ACIKLAMA-SABLON', 'KIRMIZI', y, `sayfa adı çıkarılınca ${yollar.length} sayfada aynı kalıp: ${kisalt(kalip)}`))
  }
}

function dilKontrolu(sayfalar, enSayfalar, cikti) {
  for (const s of [...sayfalar, ...(enSayfalar || [])]) {
    if (s.html == null) continue
    const beklenen = dilOnEki(s.yol)
    if (!beklenen) continue
    const lang = sayfaAlanlari(s.html).lang
    const gercek = lang ? lang.toLowerCase().split('-')[0] : null
    if (gercek !== beklenen) cikti.push(bulgu('LANG', 'KIRMIZI', s.yol, `URL dili ${beklenen}, <html lang> ${lang === null ? 'YOK' : `"${lang}"`}`))
  }
}

/**
 * VITRIN-IDDIA (URN-60, karar 295): vitrinde DAYANAKSIZ ya da kararla kaldırılmış iddia ifadeleri. Her ifade
 * sayfanın GÖRÜNEN metninde (script/style/etiket atıldıktan sonra) aranır. Karşılaştırma iki tarafı AYNI Türkçe
 * küçültmeyle yapar (REC-343: ASCII sabit + Türkçe küçültme "AI"yı ıi'ye çevirip eşleşmiyordu; simetri bunu önler).
 * Liste kararlarla büyür: yeni yasak ifade BURAYA, tek yerden. `kaynak` = neden yasak olduğu.
 */
export const VITRIN_YASAK_IFADELER = [
  { ifade: '%92', kaynak: 'dayanaksız "%92 Optimizasyon" (URN-60 adım 1)' },
  { ifade: 'Çok Satanlar', kaynak: 'teklif kipinde satış verisi yok; "Öne çıkanlar" (karar 295)' },
  { ifade: 'Geniş stok', kaynak: 'stok vaadi dayanaksız (URN-60 adım 1)' },
  { ifade: 'Dünya Devlerinin', kaynak: 'distribütörlük/partner iddiası yok (karar 295)' },
  { ifade: 'DETERMİNİSTİK', kaynak: 'bilgi taşımayan başlık (URN-60 adım 2)' },
  { ifade: 'Sistem.Veri.Canlı', kaynak: 'dekoratif HUD metni bağlantı metni olmamalı (URN-60 adım 3)' },
  { ifade: 'beğendiğim', kaynak: 'tasarım referansı ekran görüntüsü, şirket görseli değil (URN-60 adım 5)' },
  { ifade: '81 il', kaynak: '81 ile kargo vaadi kalktı (karar 295)' },
  { ifade: 'Partneri', kaynak: 'partner dili yalnız yetkili distribütörlük için (karar 295; yok)' },
  // URN-79 (karar 317, OPS abartı taraması 2026-10-09): marka kayıtlarından kalkan üretici öz beyanları. Her biri kaynak
  // dizininde karşılıksız ya da atıfsız; geri gelirse canlıda KIRMIZI. İfadeler bilerek marka cümlesine ÖZGÜ (genel
  // "dünya"/"lider" sözcüğü değil): başka sayfalardaki meşru kullanımı yakalamasın.
  { ifade: 'dünya lideri', kaynak: 'marka metni: kaynaksız liderlik iddiası, Vortice/Nicotra (URN-79)' },
  { ifade: 'world leader', kaynak: 'marka metni: kaynaksız liderlik iddiası, Vortice/Nicotra (URN-79)' },
  { ifade: 'standartları belirliyor', kaynak: 'marka metni: Vortice üstünlük iddiası (URN-79)' },
  { ifade: 'dünyanın en geniş', kaynak: 'marka metni: Nicotra kataloğu "dünya" demiyor (URN-79)' },
  { ifade: 'öncüsüdür', kaynak: 'marka metni: Danfoss öz beyanı, atıfsız (URN-79)' },
  // Kesme işareti İÇERMEZ: React HTML'de `'` işaretini `&#x27;` yazar, `gorunenMetin` yalnız `&amp;` çözer → "%80'e varan" eşleşmezdi.
  { ifade: 'varan oranda azaltır', kaynak: 'marka metni: Danfoss "%80\'e varan" enerji tasarrufu oranı, atıfsız; FC102 kataloğu "%50\'den fazla" (URN-79)' },
  { ifade: 'önde gelen yerli', kaynak: 'marka metni: Avens, kaynak dizininde karşılığı yok (URN-79)' },
  { ifade: 'Yüksek Verimli Santrifüj', kaynak: 'marka uzmanlık etiketi: ölçütsüz sıfat, Nicotra (URN-79)' },
]

const trKucuk = (s) => String(s).toLocaleLowerCase('tr')
const gorunenMetin = (html) => String(html)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')

function vitrinIddiaKontrolu(sayfalar, cikti) {
  for (const s of sayfalar) {
    if (s.html == null) continue
    const metin = trKucuk(gorunenMetin(s.html))
    for (const { ifade, kaynak } of VITRIN_YASAK_IFADELER) {
      if (metin.includes(trKucuk(ifade))) cikti.push(bulgu('VITRIN-IDDIA', 'KIRMIZI', s.yol, `yasak ifade "${ifade}" görünen metinde: ${kaynak}`))
    }
  }
}

/**
 * SPEC-HAM-DEGER (URN-58, karar 298): teknik tablo hücresinde ham makine değeri. Mantıksal özellik ("Zamanlayıcı",
 * "ErP Uyumlu", "Higrostat") sözlükten "Var/Yok" ("Yes/No") basılır; görünen metni TAM OLARAK `true` ya da `false`
 * olan bir hücre, biçimlendiricinin dil bilmeden `String(value)` bastığı eski hâlin izidir (canlıda Lineo Quiet
 * ailesinde ölçüldü: gövde çift olduğu için her alan iki kez). Hücre = alt öğesi olmayan öğe (`<span>`, `<td>`, `<dd>`,
 * `<div>` …); yorum/script/style/template atılır, yani JSON-LD ve RSC yükündeki `true` sayılmaz. Kod gösteren öğeler
 * (`code`, `pre`, `kbd`, `samp`) ve cümle içinde geçen sözcük sayılmaz. Büyük/küçük harf duyarlıdır: ham değer
 * küçük harftir, "True" yazılmış metin editoryal içeriktir. Çıktı sayfa başına TEK bulgu (hücre sayısı + etiket=değer).
 */
const KOD_OGELERI = new Set(['code', 'pre', 'kbd', 'samp'])
const HAM_DEGER_HUCRESI = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>\s*(true|false)\s*<\/\1\s*>/g

/** Ham HTML → [{ deger, etiket }]; `etiket` hücreden hemen önceki kapanan öğenin metni (yoksa '?'). */
export function hamDegerHucreleri(html) {
  const temiz = temizle(html)
  const bulunan = []
  for (const m of temiz.matchAll(HAM_DEGER_HUCRESI)) {
    if (KOD_OGELERI.has(m[1].toLowerCase())) continue
    const once = temiz.slice(Math.max(0, m.index - 400), m.index)
    const etiket = />([^<>]{1,80})<\/[a-zA-Z][a-zA-Z0-9-]*\s*>\s*$/.exec(once)
    bulunan.push({ deger: m[2], etiket: etiket ? bosluksuz(etiket[1]) || '?' : '?' })
  }
  return bulunan
}

function specHamDegerKontrolu(sayfalar, cikti) {
  for (const s of sayfalar) {
    if (s.html == null) continue
    const hucreler = hamDegerHucreleri(s.html)
    if (hucreler.length === 0) continue
    const ozet = [...new Set(hucreler.map((h) => `${h.etiket}=${h.deger}`))].slice(0, 6).join(', ')
    cikti.push(bulgu('SPEC-HAM-DEGER', 'KIRMIZI', s.yol,
      `${hucreler.length} teknik tablo hücresinde ham makine değeri (${ozet}); doğrusu sözlükten "Var/Yok" ("Yes/No") — formatSpecValue, URN-58`))
  }
}

const metinBaytlari = (b) => [...(b || [])].slice(0, 24).map((x) => (x >= 32 && x < 127 ? String.fromCharCode(x) : '.')).join('')
const ICO = [0, 0, 1, 0]
const PNG = [0x89, 0x50, 0x4e, 0x47]
const baslar = (bayt, sihir) => sihir.every((x, i) => (bayt || [])[i] === x)

function faviconKontrolu(sayfalar, varliklar, cikti) {
  const ana = sayfalar.find((s) => s.yol === '/tr') || sayfalar.find((s) => s.yol === '/')
  if (ana && ana.html != null && !sayfaAlanlari(ana.html).ikonVar) {
    cikti.push(bulgu('FAVICON', 'KIRMIZI', ana.yol, 'ana sayfada <link rel="icon" href> yok'))
  }
  for (const [yol, v] of Object.entries(varliklar || {})) {
    if (yol === '/favicon.ico') {
      if (v.durum !== 200) cikti.push(bulgu('FAVICON', 'KIRMIZI', yol, `HTTP ${v.durum}`))
      else if (!baslar(v.ilk, ICO) && !baslar(v.ilk, PNG)) cikti.push(bulgu('FAVICON', 'KIRMIZI', yol, `gövde ICO/PNG değil (ilk baytlar: "${metinBaytlari(v.ilk)}")`))
    } else if (v.durum >= 500) {
      cikti.push(bulgu('FAVICON', 'KIRMIZI', yol, `HTTP ${v.durum} (sunucu hatası)`))
    } else if (v.durum === 200 && v.tur === 'png' && !baslar(v.ilk, PNG)) {
      cikti.push(bulgu('FAVICON', 'KIRMIZI', yol, `gövde PNG değil (ilk baytlar: "${metinBaytlari(v.ilk)}")`))
    }
  }
}

function lastmodKontrolu(harita, bugun, cikti) {
  const zamanlar = []
  for (const s of harita.satirlar) {
    if (!s.lastmod) continue
    const t = new Date(s.lastmod)
    if (Number.isNaN(t.getTime())) continue
    zamanlar.push({ s, ms: t.getTime(), gun: t.toISOString().slice(0, 10) })
  }
  for (const z of zamanlar) {
    if (z.gun === bugun) cikti.push(bulgu('LASTMOD-BUGUN', 'KIRMIZI', z.s.loc, `lastmod ${z.s.lastmod} = bugün (${bugun}): gerçek değişiklik değil "şimdi" damgası olabilir (REC-454)`))
  }
  const damga = new Map()
  for (const z of zamanlar) { if (!damga.has(z.ms)) damga.set(z.ms, []); damga.get(z.ms).push(z) }
  for (const [ms, liste] of damga) {
    // Gün başı damgası (T00:00:00.000Z) içerik yazarının verdiği TARİHtir; aynı güne ≥5 yazı meşrudur. Toplu-yazım izi: saat içeren aynı ms.
    if (liste.length >= 5 && ms % 86_400_000 !== 0) {
      for (const z of liste) cikti.push(bulgu('LASTMOD-TOPLU', 'UYARI', z.s.loc, `${liste.length} satır aynı damga: ${z.s.lastmod} (toplu yazım izi)`))
    }
  }
}

function robotsKontrolu(harita, robots, gizli, taban, cikti) {
  const kaliplar = robotsDisallow(robots)
  const gizliYollar = Object.keys(gizli || {})
  // Gizli yüzey = dizin gibi sınanır: "/admin" için "/admin/" da denenir (crawler alt adres ister).
  const evren = [...harita.satirlar.map((s) => yolaIndirge(s.loc, 'https://' + new URL(s.loc).host)).filter(Boolean),
    ...gizliYollar, ...gizliYollar.map((y) => y + '/')]
  for (const k of kaliplar) {
    if (!evren.some((y) => robotsEslesir(k, y))) {
      cikti.push(bulgu('ROBOTS-KALIP', 'UYARI', taban + '/robots.txt', `Disallow: ${k} kalıbı gerçek yola eşleşmiyor (haritada ya da bilinen gizli yüzeylerde ${evren.length} yol denendi)`))
    }
  }
  for (const [yol, v] of Object.entries(gizli || {})) {
    if (v.durum >= 300 && v.durum < 400) continue // yönlendirir; dizine giren hedef ayrıca sınanır
    if (v.durum === 404 || v.durum === 410) continue
    const kapali = kaliplar.some((k) => robotsEslesir(k, yol) || robotsEslesir(k, yol + '/'))
    const basliktaNoindex = /noindex/i.test(v.basliklar?.['x-robots-tag'] || '')
    const metaNoindex = v.html != null && /noindex/i.test(sayfaAlanlari(v.html).metaRobots)
    if (!kapali && !basliktaNoindex && !metaNoindex) {
      cikti.push(bulgu('ROBOTS-KALIP', 'KIRMIZI', yol, `HTTP ${v.durum}: ne robots.txt Disallow'lu ne X-Robots-Tag/meta noindex'li (gizli yüzey dizine girebilir)`))
    }
  }
}

function jsonldKontrolleri(sayfalar, cikti) {
  for (const s of sayfalar) {
    if (s.html == null) continue
    for (const b of jsonldBloklari(s.html)) {
      if (b.hata) { cikti.push(bulgu('JSONLD-PARSE', 'KIRMIZI', s.yol, `JSON-LD ayrıştırılamadı: ${b.hata}`)); continue }
      for (const n of tumDugumler(b.veri)) {
        const t = tipler(n)
        if (t.includes('CollectionPage') && ('numberOfItems' in n || 'itemListElement' in n)) {
          cikti.push(bulgu('JSONLD-COLLECTIONPAGE', 'KIRMIZI', s.yol, 'CollectionPage üst düzeyde numberOfItems/itemListElement taşıyor (doğrusu mainEntity ItemList)'))
        }
        if (t.includes('ProductGroup')) {
          if ('isPartOf' in n) cikti.push(bulgu('JSONLD-ISPARTOF', 'KIRMIZI', s.yol, 'ProductGroup isPartOf taşıyor (şema uyarısı)'))
          const eksik = ['name', 'productGroupID'].filter((a) => n[a] === undefined || n[a] === null || n[a] === '')
          if (eksik.length) cikti.push(bulgu('JSONLD-PRODUCTGROUP-ALAN', 'KIRMIZI', s.yol, `ProductGroup zorunlu alan eksik: ${eksik.join(', ')}`))
        }
        if (t.includes('BreadcrumbList')) {
          const liste = [].concat(n.itemListElement ?? [])
          if (liste.length < 2) { cikti.push(bulgu('JSONLD-BREADCRUMB', 'KIRMIZI', s.yol, `BreadcrumbList ${liste.length} öğe (en az 2)`)); continue }
          const ilk = liste[0]?.item
          const adres = typeof ilk === 'string' ? ilk : ilk?.['@id']
          if (typeof adres === 'string' && /\/(?:tr|en)\/$/.test(adres)) {
            cikti.push(bulgu('JSONLD-BREADCRUMB', 'KIRMIZI', s.yol, `ilk basamak item sondaki eğik çizgiyle: ${adres} (kanonik ${adres.replace(/\/$/, '')})`))
          }
        }
      }
    }
  }
}

/** Sayıyı yazıdan okur ("1.234", "1,234" binlik ayırıcılı olabilir). */
const sayiOku = (s) => Number(String(s).replace(/[.,]/g, ''))

/**
 * llms.txt'in sayfa/dil beyanı site haritası gerçeğiyle çelişirse KIRMIZI (SEO-6, 2026-10-02: dosya "~190 sayfa, TR/EN
 * hreflang, ~37 kategori" diyordu, gerçek 87 adres, yalnız TR, 24 kategori, hreflang yok; 08-29'dan beri bayattı).
 * Beyan biçimi (makine okur): "N pages|URLs" (yalnız yazılmışsa sınanır), "N categories" (yalnız yazılmışsa sınanır) ve
 * ZORUNLU `Languages (ISO 639-1): tr[, en]` satırı. Dil kümesi haritanın `/tr|/en` yol önekleri; `<xhtml:link hreflang>`
 * varsa karşı dil de var sayılır (iki dil). Dil satırı yoksa da KIRMIZI: dil beyanı zorunlu, sessiz geçmez.
 */
export function llmsKontrolu(harita, llms, cikti, adres = '/llms.txt') {
  const metin = String(llms)
  const yollar = harita.satirlar.map((s) => { try { return new URL(s.loc).pathname } catch { return s.loc } })
  const gercekSayfa = harita.satirlar.length
  const gercekKategori = yollar.filter((y) => /\/category\//.test(y)).length
  for (const m of metin.matchAll(/(\d[\d.,]*)\s+(?:indexable\s+)?(?:pages|urls)\b/gi)) {
    if (sayiOku(m[1]) !== gercekSayfa) cikti.push(bulgu('LLMS-SAYFA', 'KIRMIZI', adres, `llms.txt "${m[0]}" diyor, site haritasında ${gercekSayfa} adres var`))
  }
  for (const m of metin.matchAll(/(\d[\d.,]*)\s+categories\b/gi)) {
    if (sayiOku(m[1]) !== gercekKategori) cikti.push(bulgu('LLMS-SAYFA', 'KIRMIZI', adres, `llms.txt "${m[0]}" diyor, site haritasında ${gercekKategori} kategori adresi var`))
  }
  const satir = /^[\s>*_-]*languages\b[^:\n]*:\s*(.+)$/im.exec(metin)
  if (!satir) {
    cikti.push(bulgu('LLMS-DIL', 'KIRMIZI', adres, 'llms.txt\'te "Languages (ISO 639-1): tr" biçiminde dil beyanı satırı yok (zorunlu)'))
    return
  }
  const beyan = new Set(satir[1].toLowerCase().match(/\b(?:tr|en)\b/g) || [])
  const gercek = new Set()
  for (const y of yollar) { const d = dilOnEki(y); if (d) gercek.add(d) }
  if ((harita.hreflangSayisi || 0) > 0) { gercek.add('tr'); gercek.add('en') }
  const yaz = (k) => [...k].sort().join(',') || 'yok'
  if (yaz(beyan) !== yaz(gercek)) cikti.push(bulgu('LLMS-DIL', 'KIRMIZI', adres, `llms.txt diller: ${yaz(beyan)}; site haritası diller: ${yaz(gercek)} (hreflang ${harita.hreflangSayisi || 0})`))
}

function yonlendirmeKontrolleri(sayfalar, ek, taban, cikti) {
  const YON = new Set([301, 302, 307, 308])
  if (ek.yonlendirmeler) {
    const hedefler = icHedefleriTopla(sayfalar, taban)
    for (const [yol, v] of Object.entries(ek.yonlendirmeler)) {
      if (!YON.has(v.durum)) continue
      const kaynak = hedefler.get(yol) || []
      cikti.push(bulgu('IC-BAGLANTI-YONLENDIRME', 'KIRMIZI', yol,
        `HTTP ${v.durum} → ${v.konum || '?'}; ${kaynak.length} sayfada bağlantı (örn. ${kaynak.slice(0, 2).join(', ')})`))
    }
  }
  for (const [ad, z] of Object.entries(ek.zincirler || {})) {
    if (z.sicrama > 2) cikti.push(bulgu('YONLENDIRME-ZINCIRI', 'KIRMIZI', ad, `${z.sicrama} sıçrama (en çok 2): ${(z.adimlar || []).map((a) => a.durum).join('→')} → ${z.sonDurum}; ${(z.adimlar || []).map((a) => a.adres).join(' > ')}`))
  }
}

/**
 * Ağsız çekirdek. `harita` {satirlar:[{loc,lastmod,changefreq}]} · `sayfalar` [{adres, yol, durum, html}] (yol = indirgenmiş
 * site içi yol; html yalnız 200'de) · `ek` {taban, bugun, robots, enSayfalar, varliklar, gizli, yanitlar, yonlendirmeler,
 * zincirler} (hepsi isteğe bağlı: verilmeyen ailenin ölçümü yapılmamıştır, yapılmış sayılmaz).
 * Dönüş: [{ kod, seviye: 'KIRMIZI'|'UYARI', adres, kanit }].
 */
export function kontrolEt({ harita, sayfalar, ek = {} }) {
  const taban = (ek.taban || 'https://venthub.com.tr').replace(/\/$/, '')
  const bugun = ek.bugun || new Date().toISOString().slice(0, 10)
  const cikti = []
  const tamam = sayfalar.filter((s) => s.html != null)

  for (const s of sayfalar) {
    if (s.durum !== 200) cikti.push(bulgu('HARITA-ADRES-DURUM', 'KIRMIZI', s.yol, `haritadaki adres HTTP ${s.durum} (200 beklenir)`))
  }

  const gelen = gelenSay(Object.fromEntries(sayfalar.map((s) => [s.yol, s.html ?? null])), taban)
  for (const [yol, n] of Object.entries(gelen)) {
    if (n === 0) cikti.push(bulgu('YETIM', 'KIRMIZI', yol, 'haritalı başka hiçbir sayfadan ham HTML <a href> almıyor'))
  }

  const ozet = tamam.map((s) => ({ yol: s.yol, a: sayfaAlanlari(s.html) }))
  baslikKontrolleri(ozet, cikti)
  aciklamaKontrolleri(ozet, cikti)
  dilKontrolu(tamam, ek.enSayfalar, cikti)
  faviconKontrolu(sayfalar, ek.varliklar, cikti)
  lastmodKontrolu(harita, bugun, cikti)
  if (ek.robots != null) robotsKontrolu(harita, ek.robots, ek.gizli, taban, cikti)
  if (ek.llms != null) llmsKontrolu(harita, ek.llms, cikti, taban + '/llms.txt')
  for (const [yol, v] of Object.entries(ek.yanitlar || {})) {
    if (v.durum !== 404 && v.durum !== 410) cikti.push(bulgu('SOFT404', 'KIRMIZI', yol, `olmayan adres HTTP ${v.durum} döndü (404 beklenir)${v.konum ? ' → ' + v.konum : ''}`))
  }
  yonlendirmeKontrolleri(tamam, ek, taban, cikti)
  jsonldKontrolleri(tamam, cikti)
  vitrinIddiaKontrolu(tamam, cikti)
  specHamDegerKontrolu(tamam, cikti)
  for (const s of harita.satirlar) {
    if (s.changefreq) cikti.push(bulgu('ROBOTS-HARITA-ALAN', 'UYARI', s.loc, `<changefreq>${s.changefreq}</changefreq>: Google yok sayar (kod anahtarı yanlış, REC-498)`))
  }

  const sira = (k) => { const i = KOD_SIRASI.indexOf(k); return i < 0 ? KOD_SIRASI.length : i }
  return cikti.sort((a, b) => sira(a.kod) - sira(b.kod) || String(a.adres).localeCompare(String(b.adres)))
}

// ---------------------------------------------------------------------------------------------------------------
// --bilinen, özet ve çıkış kodu (saf)

/** Bilinen eşlemesini uygular: tam kod ya da `KOD-` ailesi eşleşen KIRMIZI'ya `bilinen: 'REC-nn'` eklenir. */
export function bilinenUygula(bulgular, bilinen = {}) {
  return bulgular.map((b) => {
    if (b.seviye !== 'KIRMIZI') return b
    const anahtar = Object.keys(bilinen).find((k) => b.kod === k || b.kod.startsWith(k + '-'))
    return anahtar ? { ...b, bilinen: bilinen[anahtar] } : b
  })
}

const KAPALI_DURUM_TIPLERI = new Set(['completed', 'canceled'])
const KAPALI_DURUM_ADLARI = new Set(['done', 'canceled', 'cancelled', 'duplicate'])

/**
 * Bilinen listesi kalıcı susturucuya dönmesin: her satır açık bir REC kaydına bağlı olmalı ve kaydı Done/Canceled
 * olan satır KIRMIZI sayılır. `durumlar`: {'REC-nn': {ad, tip}} (Linear durumu; ölçülemeyen kayıt anahtarı yoktur).
 * Döner: {gecerli: {KOD: 'REC-nn'}, bulgular: [...]}. Ölçülemeyen kayıt susturmayı bozmaz ama UYARI basar.
 */
export function bilinenDogrula(bilinen = {}, durumlar = {}) {
  const gecerli = {}
  const bulgular = []
  for (const [kod, kayit] of Object.entries(bilinen)) {
    if (typeof kayit !== 'string' || !/^REC-\d+$/.test(kayit)) {
      bulgular.push(bulgu('BILINEN-KAYITSIZ', 'KIRMIZI', kod, `bilinen satırı açık bir REC kaydına bağlı değil (${JSON.stringify(kayit)})`))
      continue
    }
    const d = durumlar[kayit]
    if (!d) {
      gecerli[kod] = kayit
      bulgular.push(bulgu('BILINEN-KAYIT-OLCULEMEDI', 'UYARI', kod, `${kayit} durumu ölçülemedi; susturma geçerli sayıldı`))
      continue
    }
    if (KAPALI_DURUM_TIPLERI.has(String(d.tip || '').toLowerCase()) || KAPALI_DURUM_ADLARI.has(String(d.ad || '').toLowerCase())) {
      bulgular.push(bulgu('BILINEN-KAYIT-KAPALI', 'KIRMIZI', kod, `${kayit} ${d.ad || d.tip} durumunda ama kusur hâlâ canlıda; susturma geçersiz`))
      continue
    }
    gecerli[kod] = kayit
  }
  return { gecerli, bulgular }
}

/**
 * Linear'dan REC kayıtlarının durumunu çeker (LINEAR_API_KEY ortam değişkeni; anahtar yoksa ya da hata varsa boş döner).
 * @param {string[]} kayitlar
 * @param {string} [anahtar]
 * @param {(url: string, init: object) => Promise<{ json: () => Promise<{ data?: { issue?: { state?: { name: string, type: string } } } }> }>} [istekFn]
 * @returns {Promise<Record<string, { ad: string, tip: string }>>}
 */
export async function kayitDurumlariCek(kayitlar, anahtar = process.env.LINEAR_API_KEY, istekFn = fetch) {
  const durumlar = {}
  if (!anahtar) return durumlar
  for (const kayit of kayitlar) {
    try {
      const r = await istekFn('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: anahtar },
        body: JSON.stringify({ query: 'query($id:String!){issue(id:$id){identifier state{name type}}}', variables: { id: kayit } }),
        signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS),
      })
      const j = await r.json()
      const s = j?.data?.issue?.state
      if (s) durumlar[kayit] = { ad: s.name, tip: s.type }
    } catch { /* ölçülemedi: bilinenDogrula UYARI basar */ }
  }
  return durumlar
}

/** Çıkış kodu: araç hatası 2 · bilinmeyen KIRMIZI 1 · aksi 0 (UYARI ve bilinen KIRMIZI çıkışı etkilemez). */
export function cikisKodu(bulgular, aracHatalari = []) {
  if (aracHatalari.length > 0) return 2
  return bulgular.some((b) => b.seviye === 'KIRMIZI' && !b.bilinen) ? 1 : 0
}

/** Bulgular → kod başına özet [{kod, seviye, bilinen, sayi, ornek, kural}] (kod sırası sabit). */
export function ozetSatirlari(bulgular) {
  const gruplar = new Map()
  for (const b of bulgular) {
    const anahtar = b.kod + '|' + b.seviye + '|' + (b.bilinen || '')
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, { kod: b.kod, seviye: b.seviye, bilinen: b.bilinen || null, adresler: [] })
    gruplar.get(anahtar).adresler.push(b.adres)
  }
  return [...gruplar.values()].map((g) => ({
    kod: g.kod, seviye: g.seviye, bilinen: g.bilinen, sayi: g.adresler.length, ornek: g.adresler.slice(0, 2), kural: KURAL_NO[g.kod] || '-',
  }))
}

function tabloYaz(satirlar) {
  const seviye = (s) => (s.seviye === 'KIRMIZI' && s.bilinen ? `BİLİNEN(${s.bilinen})` : s.seviye)
  const satir = (k, sv, n, o, r) => `${k.padEnd(26)} ${sv.padEnd(18)} ${String(n).padStart(5)}  ${r.padEnd(6)} ${o}`
  console.log(satir('KOD', 'SEVİYE', 'SAYI', 'ÖRNEK ADRES', 'KURAL'))
  for (const s of satirlar) console.log(satir(s.kod, seviye(s), s.sayi, s.ornek.join(' · '), s.kural))
}

// ---------------------------------------------------------------------------------------------------------------
// Ağ katmanı

/** Sınırlı eşzamanlılıkla sırayla çalıştırır (yetim-tara.mjs'deki havuzla aynı; orada dışa açık değil). */
async function havuz(isler, sinir, fn) {
  let sira = 0
  await Promise.all(Array.from({ length: Math.min(sinir, isler.length) }, async () => {
    while (sira < isler.length) await fn(isler[sira++])
  }))
}

/**
 * Tek istek: yönlendirme izlenmez. Ağ hatası/zaman aşımı/5xx'te 1 yeniden deneme; hâlâ ağ hatasıysa fırlatır.
 * `govde`: 'metin' (HTML) · 'bayt' (ilk 24 bayt) · yok (HEAD ya da gövde atılır).
 */
export async function istek(adres, { yontem = 'GET', govde = null } = {}) {
  let son
  for (let deneme = 0; deneme < 2; deneme++) {
    try {
      const r = await fetch(adres, { method: yontem, redirect: 'manual', signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS), headers: { 'user-agent': UA } })
      if (r.status >= 500 && deneme === 0) { await r.body?.cancel(); continue }
      const sonuc = {
        durum: r.status,
        konum: r.headers.get('location'),
        basliklar: { 'x-robots-tag': r.headers.get('x-robots-tag') || '', 'content-type': r.headers.get('content-type') || '' },
      }
      if (govde === 'metin') sonuc.html = await r.text()
      else if (govde === 'bayt') sonuc.ilk = [...new Uint8Array(await r.arrayBuffer()).slice(0, 24)]
      else await r.body?.cancel()
      return sonuc
    } catch (e) {
      son = e
    }
  }
  throw new Error(son?.name === 'TimeoutError' ? 'zaman aşımı' : (son?.cause?.code || son?.message || String(son)))
}

/** Site haritası (dizin ise alt haritalar da) → satırlar. */
async function haritaGetir(taban) {
  const r = await istek(`${taban}/sitemap.xml`, { govde: 'metin' })
  if (r.durum !== 200) throw new Error(`sitemap.xml HTTP ${r.durum}`)
  if (!/<sitemapindex/i.test(r.html)) return haritaCoz(r.html)
  const satirlar = []
  let hreflangSayisi = 0
  for (const m of r.html.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    const alt = await istek(varlikCoz(m[1]), { govde: 'metin' })
    if (alt.durum !== 200) throw new Error(`alt harita HTTP ${alt.durum}`)
    const cozulen = haritaCoz(alt.html)
    satirlar.push(...cozulen.satirlar)
    hreflangSayisi += cozulen.hreflangSayisi
  }
  return { satirlar, hreflangSayisi }
}

/** Yönlendirme zincirini elle izler; sıçrama = 3xx yanıt sayısı. */
async function zincirIzle(baslangic, enCok = 8) {
  const adimlar = []
  let adres = baslangic
  for (let i = 0; i <= enCok; i++) {
    const r = await istek(adres)
    if (r.durum >= 300 && r.durum < 400 && r.konum) {
      adimlar.push({ adres, durum: r.durum, konum: r.konum })
      adres = new URL(r.konum, adres).href
    } else return { baslangic, adimlar, sicrama: adimlar.length, sonAdres: adres, sonDurum: r.durum }
  }
  return { baslangic, adimlar, sicrama: adimlar.length, sonAdres: adres, sonDurum: 0 }
}

/** Tek geçişte tüm veriyi toplar; dönüş: { harita, sayfalar, ek, hatalar }. */
async function topla(taban, bugun) {
  const hatalar = []
  const dene = async (etiket, fn) => { try { return await fn() } catch (e) { hatalar.push(`${etiket} (${e.message})`); return null } }

  const harita = await haritaGetir(taban)
  const evren = new Map()
  for (const s of harita.satirlar) {
    const u = new URL(s.loc)
    const yol = yolaIndirge(s.loc, 'https://' + u.host)
    if (yol && !evren.has(yol)) evren.set(yol, u.pathname)
  }
  if (!evren.size) throw new Error('site haritası boş')

  const sayfalar = []
  await havuz([...evren], EN_COK_ESZAMANLI, async ([yol, hamYol]) => {
    const r = await dene(yol, () => istek(taban + hamYol, { govde: 'metin' }))
    if (r) sayfalar.push({ adres: taban + hamYol, yol, durum: r.durum, html: r.durum === 200 ? r.html : null })
  })
  sayfalar.sort((a, b) => a.yol.localeCompare(b.yol))

  const ek = { taban, bugun, enSayfalar: [], varliklar: {}, gizli: {}, yanitlar: {}, yonlendirmeler: {}, zincirler: {} }
  const isler = []
  isler.push(async () => { const r = await dene('/robots.txt', () => istek(`${taban}/robots.txt`, { govde: 'metin' })); if (r) { if (r.durum === 200) ek.robots = r.html; else hatalar.push(`/robots.txt (HTTP ${r.durum})`) } })
  isler.push(async () => { const r = await dene('/llms.txt', () => istek(`${taban}/llms.txt`, { govde: 'metin' })); if (r) { if (r.durum === 200) ek.llms = r.html; else if (r.durum !== 404) hatalar.push(`/llms.txt (HTTP ${r.durum})`) } })
  for (const yol of EN_SAYFALAR) isler.push(async () => { const r = await dene(yol, () => istek(taban + yol, { govde: 'metin' })); if (r) ek.enSayfalar.push({ yol, durum: r.durum, html: r.durum === 200 ? r.html : null }) })
  for (const [yol, tur] of IKON_DOSYALARI) isler.push(async () => { const r = await dene(yol, () => istek(taban + yol, { govde: 'bayt' })); if (r) ek.varliklar[yol] = { durum: r.durum, ilk: r.ilk, tur } })
  for (const yol of GIZLI_YUZEYLER) isler.push(async () => { const r = await dene(yol, () => istek(taban + yol, { govde: 'metin' })); if (r) ek.gizli[yol] = { durum: r.durum, basliklar: r.basliklar, html: r.durum === 200 ? r.html : null } })
  for (const yol of OLMAYAN_ADRESLER) isler.push(async () => { const r = await dene(yol, () => istek(taban + yol)); if (r) ek.yanitlar[yol] = { durum: r.durum, konum: r.konum } })
  const zincirAdresleri = ZINCIR_YOLLARI.map((y) => taban + y)
  if (new URL(taban).protocol === 'https:' && !/vercel\.app$|localhost|127\.0\.0\.1/.test(new URL(taban).host)) {
    zincirAdresleri.push(`http://www.${new URL(taban).host.replace(/^www\./, '')}/tr`)
  }
  for (const a of zincirAdresleri) isler.push(async () => { const z = await dene(a, () => zincirIzle(a)); if (z) ek.zincirler[a.replace(taban, '') || a] = z })
  await havuz(isler, EN_COK_ESZAMANLI, (is) => is())

  // Site içi bağlantı hedefleri: haritalı (zaten 200) olanlar atlanır; geri kalanı HEAD, olmazsa GET.
  const hedefler = icHedefleriTopla(sayfalar, taban)
  const bilinen200 = new Set(sayfalar.filter((s) => s.durum === 200).map((s) => s.yol))
  const sorulacak = [...hedefler.keys()].filter((y) => !bilinen200.has(y))
  await havuz(sorulacak, EN_COK_ESZAMANLI, async (yol) => {
    const r = await dene(yol, async () => {
      const h = await istek(taban + yol, { yontem: 'HEAD' })
      return h.durum >= 200 && h.durum < 400 ? h : istek(taban + yol) // HEAD yanlış cevap verebilir: GET ile doğrula
    })
    if (r) ek.yonlendirmeler[yol] = { durum: r.durum, konum: r.konum }
  })
  ek.icHedefSayisi = hedefler.size
  return { harita, sayfalar, ek, hatalar }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const cikti = deger('--cikti')
  const bugun = deger('--bugun') || new Date().toISOString().slice(0, 10)
  let bilinen = {}
  if (deger('--bilinen')) {
    try { bilinen = JSON.parse(readFileSync(deger('--bilinen'), 'utf8')) } catch (e) {
      console.error(`HATA: --bilinen okunamadı (${e.message})`); process.exit(2)
    }
  }

  let veri
  try { veri = await topla(taban, bugun) } catch (e) {
    console.error(`HATA: ölçüm başlatılamadı (${e.message})`); process.exit(2)
  }
  let durumlar = {}
  if (deger('--kayit-durum')) {
    try { durumlar = JSON.parse(readFileSync(deger('--kayit-durum'), 'utf8')) } catch (e) {
      console.error(`HATA: --kayit-durum okunamadı (${e.message})`); process.exit(2)
    }
  } else {
    durumlar = await kayitDurumlariCek(Object.values(bilinen).filter((k) => typeof k === 'string'))
  }
  const dogrulama = bilinenDogrula(bilinen, durumlar)
  const bulgular = [...bilinenUygula(kontrolEt(veri), dogrulama.gecerli), ...dogrulama.bulgular]
  const ozet = ozetSatirlari(bulgular)
  const kirmizi = bulgular.filter((b) => b.seviye === 'KIRMIZI')
  const yeni = kirmizi.filter((b) => !b.bilinen)
  console.log(`taban ${taban} · sayfa ${veri.sayfalar.length} · site içi bağlantı hedefi ${veri.ek.icHedefSayisi} · KIRMIZI ${kirmizi.length} (yeni ${yeni.length}, bilinen ${kirmizi.length - yeni.length}) · UYARI ${bulgular.length - kirmizi.length}`)
  tabloYaz(ozet)
  if (veri.hatalar.length) console.error('ÖLÇÜLEMEDİ:\n  ' + veri.hatalar.join('\n  '))
  if (cikti) {
    mkdirSync(cikti, { recursive: true })
    writeFileSync(join(cikti, 'canli-kapi.json'), JSON.stringify({
      taban, an: new Date().toISOString(), bugun, sayfa: veri.sayfalar.length, icHedefSayisi: veri.ek.icHedefSayisi,
      kirmizi: kirmizi.length, yeniKirmizi: yeni.length, uyari: bulgular.length - kirmizi.length,
      ozet, bulgular, olculemedi: veri.hatalar,
    }, null, 2))
  }
  process.exitCode = cikisKodu(bulgular, veri.hatalar)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
