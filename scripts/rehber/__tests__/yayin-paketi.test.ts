import { describe, expect, it } from 'vitest'
// @ts-expect-error: .mjs betiğinin tip bildirimi yok
import { kirikBaglantilar, PaketHatasi, paketHazirla } from '../yayin-paketi.mjs'

const kayit = (kimlik: string, slug: string, govde = 'Metin', ek = '') =>
  [
    '  {',
    `    kimlik: '${kimlik}',`,
    "    yayinTarihi: '2026-11-09',",
    "    guncellemeTarihi: '2026-11-09',",
    ...(ek ? [ek] : []),
    '    diller: {',
    '      tr: {',
    `        slug: '${slug}',`,
    `        govde: \`${govde}\`,`,
    '      },',
    '    },',
    '  },',
  ].join('\n')

const yazilar = (...kayitlar: string[]) =>
  ['const once = 1', 'export const YAZILAR: readonly RehberYazisi[] = [', ...kayitlar, ']', 'export const sonra = [', '1,', ']', ''].join('\n')

const fikstur = (...sluglar: string[]) =>
  JSON.stringify(sluglar.map((s) => ({ url: `{BASE}/tr/bilgi-merkezi/${s}`, priority: 0.6 })), null, 2)

const sitemapTest = [
  "    it('EN_YAYIN kapalı: 37 satır, altın', async () => {",
  '      expect(satirlar).toHaveLength(37)',
  '    })',
  "    it('EN_YAYIN açık: 57 satır (iki dil)', async () => {",
  '      expect(satirlar).toHaveLength(57)',
  '    })',
  '',
].join('\n')

const hedefDosyalar = () => ({
  yazilar: yazilar(kayit('a', 'a-slug')),
  sitemapAltin: fikstur('a-slug'),
  rotaFikstur: fikstur('a-slug'),
  sitemapTest,
  llms: '- [Sitemap](x): 105 indexable URLs, Turkish only\n',
  sahteKaynak: "    ['vortice-vorticent-cms-atex-santrifuj-fanlar', 'Vortice Vorticent CMS ATEX Santrifüj Fanlar'],\n",
})

const kaynakDosyalar = (govde = 'Yeni [bag](vh:yazi/a)') => ({
  yazilar: yazilar(kayit('a', 'a-slug'), kayit('b', 'b-slug', govde)),
  sitemapAltin: fikstur('a-slug', 'b-slug'),
  rotaFikstur: fikstur('a-slug', 'b-slug'),
})

const secenek = { kimlik: 'b', tarih: '2026-11-22', kart: 'BLG-64', sira: 'on yedinci' }

describe('yayin-paketi', () => {
  it('kaydı dizinin içine, tarihleri ve tarihGizli ile ekler', () => {
    const { dosyalar, ozet } = paketHazirla(hedefDosyalar(), kaynakDosyalar(), secenek)
    const diziSonu = dosyalar.yazilar.indexOf('export const sonra')
    expect(dosyalar.yazilar.indexOf("kimlik: 'b'")).toBeLessThan(diziSonu)
    expect(dosyalar.yazilar).toContain("yayinTarihi: '2026-11-22'")
    expect(dosyalar.yazilar).toContain("guncellemeTarihi: '2026-11-22',\n    tarihGizli: true,")
    expect(ozet).toMatchObject({ slug: 'b-slug', oncekiSlug: 'a-slug', kapali: 38, acik: 58, llms: 106 })
  })

  it('CRLF çalışma kopyasında kaydı yine dizinin içine koyar ve satır sonunu korur', () => {
    const hedef = hedefDosyalar()
    hedef.yazilar = hedef.yazilar.replace(/\n/g, '\r\n')
    hedef.sitemapTest = hedef.sitemapTest.replace(/\n/g, '\r\n')
    hedef.sitemapAltin = hedef.sitemapAltin.replace(/\n/g, '\r\n')
    const { dosyalar } = paketHazirla(hedef, kaynakDosyalar(), secenek)
    expect(dosyalar.yazilar.replace(/\r\n/g, '')).not.toContain('\n')
    expect(dosyalar.sitemapTest.replace(/\r\n/g, '')).not.toContain('\n')
    expect(dosyalar.yazilar.indexOf("kimlik: 'b'")).toBeLessThan(dosyalar.yazilar.indexOf('export const sonra'))
    expect(JSON.parse(dosyalar.sitemapAltin)).toHaveLength(2)
  })

  it('fikstür girdisini önceki yazının arkasına ekler, JSON geçerli kalır', () => {
    const hedef = hedefDosyalar()
    hedef.sitemapAltin = fikstur('a-slug', 'z-slug')
    const { dosyalar } = paketHazirla(hedef, kaynakDosyalar(), secenek)
    const urller = JSON.parse(dosyalar.sitemapAltin).map((g: { url: string }) => g.url.split('/').pop())
    expect(urller).toEqual(['a-slug', 'b-slug', 'z-slug'])
  })

  it('test sayılarını ve yorum satırını artırır', () => {
    const { dosyalar } = paketHazirla(hedefDosyalar(), kaynakDosyalar(), secenek)
    expect(dosyalar.sitemapTest).toContain('EN_YAYIN kapalı: 38 satır')
    expect(dosyalar.sitemapTest).toContain('toHaveLength(38)')
    expect(dosyalar.sitemapTest).toContain('EN_YAYIN açık: 58 satır')
    expect(dosyalar.sitemapTest).toContain('toHaveLength(58)')
    expect(dosyalar.sitemapTest).toContain('BLG-64 (2026-11): on yedinci rehber yazısı (b-slug)')
    expect(dosyalar.llms).toContain('106 indexable URLs')
  })

  it('kaynakta zaten tarihGizli varsa ikinci kez yazmaz', () => {
    const kaynak = kaynakDosyalar()
    kaynak.yazilar = yazilar(kayit('a', 'a-slug'), kayit('b', 'b-slug', 'Metin', '    tarihGizli: true,'))
    const { dosyalar } = paketHazirla(hedefDosyalar(), kaynak, secenek)
    expect(dosyalar.yazilar.match(/tarihGizli/g)).toHaveLength(1)
  })

  it('aileyi bir kez ekler, varsa dosyaya dokunmaz', () => {
    const aile = { ...secenek, aile: 'yeni-aile', aileAdi: 'Yeni Aile', aileYorum: 'BLG-64 ailesi' }
    const ilk = paketHazirla(hedefDosyalar(), kaynakDosyalar(), aile)
    expect(ilk.dosyalar.sahteKaynak).toContain("['yeni-aile', 'Yeni Aile']")
    const hedef = { ...hedefDosyalar(), sahteKaynak: ilk.dosyalar.sahteKaynak }
    expect(paketHazirla(hedef, kaynakDosyalar(), aile).dosyalar.sahteKaynak).toBeUndefined()
  })

  it('aile yorumundaki $ kalıbını özel anlamıyla işlemez', () => {
    const aile = { ...secenek, aile: 'yeni-aile', aileAdi: 'Yeni Aile', aileYorum: "maliyet $& ve $$ ve $' sonu" }
    const { dosyalar } = paketHazirla(hedefDosyalar(), kaynakDosyalar(), aile)
    expect(dosyalar.sahteKaynak).toContain("// maliyet $& ve $$ ve $' sonu\n")
    expect(dosyalar.sahteKaynak.match(/vorticent-cms/g)).toHaveLength(1)
  })

  it.each([
    ['aile adında tırnak', hedefDosyalar(), kaynakDosyalar(), { ...secenek, aile: 'x', aileAdi: "O'Brien", aileYorum: 'y' }, /kaçış/],
    ['var olmayan gün', hedefDosyalar(), kaynakDosyalar(), { ...secenek, tarih: '2026-13-45' }, /tarih/],
    ['gövdede kayıt sınırına benzeyen satır', hedefDosyalar(), kaynakDosyalar('ilk\n  },\ndevam'), secenek, /kesik/],
    ['kırık yazı bağlantısı', hedefDosyalar(), kaynakDosyalar('[x](vh:yazi/yok)'), secenek, /kırık/],
    ['kayıt zaten ekli', { ...hedefDosyalar(), yazilar: yazilar(kayit('b', 'b-slug')) }, kaynakDosyalar(), secenek, /zaten/],
    ['kaynakta kayıt yok', hedefDosyalar(), kaynakDosyalar(), { ...secenek, kimlik: 'c' }, /kayıt yok/],
    ['geçersiz tarih', hedefDosyalar(), kaynakDosyalar(), { ...secenek, tarih: '22.11.2026' }, /tarih/],
    ['test sayısı uyuşmuyor', { ...hedefDosyalar(), sitemapTest: sitemapTest.replace('toHaveLength(37)', 'toHaveLength(36)') }, kaynakDosyalar(), secenek, /uyuşmuyor/],
  ])('reddeder: %s', (_ad, hedef, kaynak, sec, beklenen) => {
    expect(() => paketHazirla(hedef, kaynak, sec)).toThrow(PaketHatasi)
    expect(() => paketHazirla(hedef, kaynak, sec)).toThrow(beklenen)
  })

  it('kirikBaglantilar yalnız kaydı olmayan hedefi verir', () => {
    expect(kirikBaglantilar("    kimlik: 'a',\n[x](vh:yazi/a) [y](vh:yazi/b)")).toEqual(['b'])
  })
})
