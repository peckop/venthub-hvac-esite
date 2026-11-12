/**
 * UnoPIM ürün içeriği doluluk ölçümünün SAF çekirdeği (KTL-86; defter: docs/defter/katalog-unopim-icerik.md).
 * Veritabanına, dosyaya, ağa dokunmaz; yalnız verilen veriyi sayar. Betik: `unopim-icerik-olc.mjs`. Test: `__tests__/unopim-icerik.test.ts`.
 */

/** Her ürün için aranan genel (teknik olmayan) alanlar; ölçülü/teknik her şey `teknik` sayılır. */
export const GENEL_ALANLAR = [
  'name@tr_TR', 'name@en_US',
  'description@tr_TR', 'description@en_US',
  'short_description@tr_TR', 'short_description@en_US',
  'image', 'gallery', 'image_alt_tr', 'image_alt_en', 'gallery_alt_tr', 'gallery_alt_en',
  'adres_tr', 'adres_en', 'url_key', 'brand', 'categories',
  'list_price_eur', 'list_price_source_doc', 'list_price_source_page', 'vat_rate_percent',
]

/** Genel sayılan ama ayrıca teknik tabloya girmemesi gereken sistem alanları. */
const SISTEM_ALANLAR = new Set([
  'sku', 'cost', 'price', 'manage_stock', 'tax_category_id',
  'meta_title', 'meta_description', 'meta_keywords',
])

/** Boş mu: null, boş metin, boş dizi/nesne, değeri olmayan ölçü nesnesi. */
export function bosMu(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') {
    if ('amount' in v) return v.amount === null || v.amount === undefined || String(v.amount).trim() === ''
    return Object.keys(v).length === 0
  }
  return false
}

/** Ürünün `values` nesnesini düz alan → değer tablosuna açar (yerel değerler `alan@yerel`). */
export function duzAlanlar(values) {
  const out = { ...(values?.common || {}) }
  const loc = values?.channel_locale_specific || {}
  for (const kanal of Object.values(loc)) {
    for (const [yerel, alanlar] of Object.entries(kanal || {})) {
      for (const [k, v] of Object.entries(alanlar || {})) out[`${k}@${yerel}`] = v
    }
  }
  if (values?.categories !== undefined) out.categories = values.categories
  return out
}

/**
 * @param {Array<{sku:string, aile:string, status:string, values:object}>} urunler
 * @param {Record<string,string[]>} aileAlanlari  aile kodu → ailede tanımlı öznitelik kodları
 */
export function doluluk(urunler, aileAlanlari) {
  const genel = Object.fromEntries(GENEL_ALANLAR.map((a) => [a, { n: 0, dolu: 0 }]))
  const aileler = {} // aile → { urun, alan: { kod: { dolu, bosSku[] } } }
  const durum = {}
  for (const u of urunler) {
    durum[u.status] = (durum[u.status] || 0) + 1
    const duz = duzAlanlar(u.values)
    const tanimli = new Set(aileAlanlari[u.aile] || [])
    const f = (aileler[u.aile] ||= { urun: 0, alan: {} })
    f.urun++
    // genel alanlar HER ürüne aranır (aile tanımı name/description/image gibi sistem alanlarını listelemiyor, 11-09 ölçüldü)
    for (const g of GENEL_ALANLAR) {
      genel[g].n++
      if (!bosMu(duz[g])) genel[g].dolu++
    }
    // teknik alanlar: ailede tanımlı, genel/sistem olmayan her öznitelik
    for (const kod of tanimli) {
      if (SISTEM_ALANLAR.has(kod) || GENEL_ALANLAR.some((g) => g.split('@')[0] === kod)) continue
      const kayit = (f.alan[kod] ||= { dolu: 0, bosSku: [] })
      if (bosMu(duz[kod])) kayit.bosSku.push(u.sku)
      else kayit.dolu++
    }
  }
  const teknik = []
  for (const [aile, f] of Object.entries(aileler)) {
    for (const [alan, k] of Object.entries(f.alan)) {
      if (k.bosSku.length) teknik.push({ aile, alan, urun: f.urun, dolu: k.dolu, bos: k.bosSku.length, bosSku: k.bosSku })
    }
  }
  teknik.sort((a, b) => b.bos - a.bos || a.aile.localeCompare(b.aile) || a.alan.localeCompare(b.alan))
  const kismi = teknik.filter((t) => t.dolu > 0).length
  const tamBos = teknik.filter((t) => t.dolu === 0).length
  return {
    sema: 1,
    urun: urunler.length,
    aile: Object.keys(aileler).length,
    durum,
    genel,
    teknik: { bosHucre: teknik.reduce((s, t) => s + t.bos, 0), kismiAlan: kismi, tamBosAlan: tamBos },
    teknikSatirlari: teknik,
  }
}

/** Defterin makine okunur özet bloğu: sayısal iddialar. */
export function ozetBlogu(sonuc, kaynak = null) {
  return {
    sema: 1,
    kaynak,
    urun: sonuc.urun,
    aile: sonuc.aile,
    durum: sonuc.durum,
    genel: Object.fromEntries(Object.entries(sonuc.genel).map(([k, v]) => [k, `${v.dolu}/${v.n}`])),
    teknik: sonuc.teknik,
  }
}

const BLOK = /<!-- olcum-ozet:basla\s*([\s\S]*?)\s*olcum-ozet:bitti -->/

/** Markdown içinden özet bloğunu çıkarır; yoksa null. */
export function blokOku(md) {
  const m = BLOK.exec(md)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

/**
 * Kaynak damgası farkı: ölçüm her sabah kör koşmaz, tetik KAYNAK değişikliğidir (OPS 9 Kasım).
 * Damga: UnoPIM ürün tablosunun son güncelleme zamanı + ürün sayısı, Design anlık görüntü dosyalarının birleşik sha256'sı.
 * Canlı Design damgası yoksa (dosya yok) Design tarafı karşılaştırılmaz; UnoPIM damgası her zaman karşılaştırılır.
 * @returns {string[]} fark listesi (boş = kaynak değişmedi)
 */
export function kaynakFarki(defter, canli) {
  if (!defter) return ['defterde kaynak damgası yok']
  const f = []
  if (defter.unopimSonGuncelleme !== canli.unopimSonGuncelleme) f.push(`UnoPIM son ürün güncellemesi: defter ${defter.unopimSonGuncelleme} ≠ canlı ${canli.unopimSonGuncelleme}`)
  if (defter.unopimUrunSayisi !== canli.unopimUrunSayisi) f.push(`UnoPIM ürün sayısı: defter ${defter.unopimUrunSayisi} ≠ canlı ${canli.unopimUrunSayisi}`)
  if (canli.tasarimGoruntuSha && defter.tasarimGoruntuSha !== canli.tasarimGoruntuSha) f.push(`Design anlık görüntü sha: defter ${defter.tasarimGoruntuSha} ≠ canlı ${canli.tasarimGoruntuSha}`)
  return f
}

/** Defter bloğu ile canlı ölçümü kıyaslar; fark listesi döner (boş = tutarlı). */
export function karsilastir(defter, canli) {
  const fark = []
  const bak = (yol, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) fark.push(`${yol}: defter ${JSON.stringify(a)} ≠ canlı ${JSON.stringify(b)}`) }
  bak('urun', defter.urun, canli.urun)
  bak('aile', defter.aile, canli.aile)
  bak('durum', defter.durum, canli.durum)
  for (const k of new Set([...Object.keys(defter.genel || {}), ...Object.keys(canli.genel || {})])) bak(`genel.${k}`, defter.genel?.[k], canli.genel?.[k])
  for (const k of ['bosHucre', 'kismiAlan', 'tamBosAlan']) bak(`teknik.${k}`, defter.teknik?.[k], canli.teknik?.[k])
  return fark
}
