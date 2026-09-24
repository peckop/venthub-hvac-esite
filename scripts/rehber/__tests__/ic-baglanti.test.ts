/**
 * INV-REHBER-IC-BAGLANTI-1 · rehber yazısında site içi bağlantı (rehber-yazisi-standard.md R3, R8).
 *
 * Kilitlenenler:
 *   1. Ağsız yarı (`icBaglantiDenetle`, `denetle` içinde): metne düz site adresi yazılırsa KIRMIZI
 *      (mutlak, göreli, çıplak); kimlik biçimi `vh:<tür>/<anahtar>` dışındaysa KIRMIZI; dış kaynak
 *      adresi, çapa ve kimlikli bağlantı temiz.
 *   2. Ağlı yarı (`ic-baglanti-denetle.mjs`), ağ TAKLİT edilerek: 200 temiz · 3xx YONLENDIRME · 404 YOK;
 *      yönlendirme izlenmez; yalnız yazı gövdesindeki site içi bağlantılar sayılır; boş evren TEMİZ değil.
 * ⭐Niçin: adres ağacı tek yayında değişecek (REC-300); düz adres kırılmaz ama her tıklama bir
 * yönlendirme durağından geçer (Recep 2026-09-24: "URL değişirse sorun olmaz mı?").
 */
import { describe, it, expect } from 'vitest'
import { icBaglantiDenetle } from '../rehber-denetim.mjs'
import { sayfaBaglantilari, siniflandir, denetle, haritadanYazilar } from '../ic-baglanti-denetle.mjs'

const sinif = (md: string) => icBaglantiDenetle(md).map((k: { sinif: string }) => k.sinif)

describe('INV-REHBER-IC-BAGLANTI-1 · ağsız yarı (metin)', () => {
  it('kimlikli bağlantı, dış kaynak ve çapa temiz', () => {
    const md = 'Bkz. [FC 102](vh:model/131b0000) ve [frekans konvertörleri](vh:kategori/frequency-converters); [AB tüzüğü](https://eur-lex.europa.eu/eli/reg/2019/1781/oj); [yukarı](#secim).'
    expect(icBaglantiDenetle(md)).toEqual([])
  })
  it('mutlak site adresi KIRMIZI (www dahil)', () => {
    expect(sinif('[FC 51](https://venthub.com.tr/tr/products/danfoss-fc51)')).toEqual(['IC-ADRES-DUZ'])
    expect(sinif('[FC 51](https://www.venthub.com.tr/tr/products/danfoss-fc51)')).toEqual(['IC-ADRES-DUZ'])
  })
  it('göreli site adresi KIRMIZI', () => {
    expect(sinif('[kategori](/tr/category/frekans-konvertorleri)')).toEqual(['IC-ADRES-DUZ'])
    expect(sinif('[kategori](urun/danfoss-fc51)')).toEqual(['IC-ADRES-DUZ'])
  })
  it('çıplak site adresi KIRMIZI, tek kez sayılır', () => {
    expect(sinif('Ayrıntı: https://venthub.com.tr/tr/contact adresinde.')).toEqual(['IC-ADRES-DUZ'])
  })
  it('bilinmeyen kimlik türü ve bozuk biçim KIRMIZI', () => {
    expect(sinif('[x](vh:urun/fc51)')).toEqual(['IC-KIMLIK-BICIMI'])
    expect(sinif('[x](vh:model)')).toEqual(['IC-KIMLIK-BICIMI'])
    expect(sinif('[x](vh:model/FC51)')).toEqual(['IC-KIMLIK-BICIMI'])
  })
  it('benzer alan adı site sayılmaz (venthub.com.tr.example.com)', () => {
    expect(icBaglantiDenetle('[x](https://venthub.com.tr.example.com/a)')).toEqual([])
  })
})

// ── ağ taklidi ──
type Cevap = { status: number; location?: string; body?: string }
const taklit = (tablo: Record<string, Cevap>) => {
  const cagrilar: { url: string; redirect?: string }[] = []
  const getir = async (url: string, o: { redirect?: 'manual' } = {}) => {
    cagrilar.push({ url, redirect: o.redirect })
    const c = tablo[url]
    if (!c) throw new Error(`taklitte yok: ${url}`)
    return { status: c.status, headers: { get: (h: string) => (h.toLowerCase() === 'location' ? c.location ?? null : null) }, text: async () => c.body ?? '' }
  }
  return { getir, cagrilar }
}
const YAZI = 'https://venthub.com.tr/tr/bilgi-merkezi/frekans-konvertoru'
const HTML = `<html><header><a href="/tr/menu-baglantisi">Menü</a></header><main><article>
  <p><a href="/tr/urun/danfoss-fc51">FC 51</a> <a href="https://venthub.com.tr/tr/products/danfoss-fc101#x">FC 101</a>
  <a href="/tr/kategori/yok">yok</a> <a href="https://eur-lex.europa.eu/x">AB</a> <a href="#secim">çapa</a> <a href="mailto:a@b.c">e</a></p>
</article></main><footer><a href="/tr/contact">İletişim</a></footer></html>`

describe('INV-REHBER-IC-BAGLANTI-1 · ağlı yarı (taklit ağ)', () => {
  it('yalnız yazı gövdesindeki site içi bağlantılar; menü/alt bilgi, dış adres, çapa, e-posta sayılmaz', () => {
    expect(sayfaBaglantilari(HTML, YAZI)).toEqual([
      'https://venthub.com.tr/tr/urun/danfoss-fc51',
      'https://venthub.com.tr/tr/products/danfoss-fc101',
      'https://venthub.com.tr/tr/kategori/yok',
    ])
  })
  it('sınıflama: 200 temiz, 3xx yönlendirme, 404 yok', () => {
    expect(siniflandir(200).sinif).toBe('TEMIZ')
    expect(siniflandir(308, '/tr/urun/danfoss-fc101')).toEqual({ sinif: 'YONLENDIRME', ayrinti: '308 → /tr/urun/danfoss-fc101' })
    expect(siniflandir(404).sinif).toBe('YOK')
    expect(siniflandir(500).sinif).toBe('HATA')
  })
  it('⭐adres değişimi senaryosu: eski adres 308 → KIRMIZI; yönlendirme İZLENMEZ', async () => {
    const { getir, cagrilar } = taklit({
      [YAZI]: { status: 200, body: HTML },
      'https://venthub.com.tr/tr/urun/danfoss-fc51': { status: 200 },
      'https://venthub.com.tr/tr/products/danfoss-fc101': { status: 308, location: '/tr/urun/danfoss-fc101' },
      'https://venthub.com.tr/tr/kategori/yok': { status: 404 },
    })
    const s = await denetle({ sayfalar: [YAZI], getir })
    expect(s.durum).toBe('KIRMIZI')
    expect(s.kirmizi.map((k: { sinif: string }) => k.sinif).sort()).toEqual(['YOK', 'YONLENDIRME'])
    expect(cagrilar.every((c) => c.redirect === 'manual')).toBe(true)
    expect(cagrilar.map((c) => c.url)).not.toContain('https://venthub.com.tr/tr/urun/danfoss-fc101')
  })
  it('bütün bağlantılar 200 → TEMIZ', async () => {
    const { getir } = taklit({ 'https://venthub.com.tr/tr/urun/a': { status: 200 } })
    const s = await denetle({ adresler: ['https://venthub.com.tr/tr/urun/a'], getir })
    expect(s.durum).toBe('TEMIZ')
  })
  it('⭐boş evren TEMİZ DEĞİL: yazı yoksa EVREN-BOS', async () => {
    const { getir, cagrilar } = taklit({})
    const s = await denetle({ sayfalar: [], adresler: [], getir })
    expect(s.durum).toBe('EVREN-BOS')
    expect(cagrilar).toEqual([])
  })
  it('açılamayan yazı sayfası KIRMIZI', async () => {
    const { getir } = taklit({ [YAZI]: { status: 404 } })
    const s = await denetle({ sayfalar: [YAZI], getir })
    expect(s.durum).toBe('KIRMIZI')
    expect(s.kirmizi[0].sinif).toBe('SAYFA-ACILMADI')
  })
  it('site haritasından yalnız rehber yazıları seçilir', () => {
    const xml = `<urlset><url><loc>https://venthub.com.tr/tr/bilgi-merkezi/frekans-konvertoru</loc></url>
      <url><loc>https://venthub.com.tr/tr/bilgi-merkezi</loc></url><url><loc>https://venthub.com.tr/tr/products/danfoss-fc51</loc></url>
      <url><loc>https://venthub.com.tr/en/knowledge-hub/vfd</loc></url></urlset>`
    expect(haritadanYazilar(xml)).toEqual(['https://venthub.com.tr/tr/bilgi-merkezi/frekans-konvertoru', 'https://venthub.com.tr/en/knowledge-hub/vfd'])
  })
  it('betik ağ kütüphanesi dışında dosyaya yazmaz', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const kaynak = readFileSync(join(__dirname, '..', 'ic-baglanti-denetle.mjs'), 'utf8')
    expect(kaynak).not.toMatch(/writeFile|node:fs/)
  })
})
