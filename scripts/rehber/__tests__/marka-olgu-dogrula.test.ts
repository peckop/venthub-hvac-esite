/**
 * INV-MARKA-OLGU-2 · marka olgu doğrulamanın saf işlevleri (vitrin-genel-metin-standard.md M8; BLG-7).
 *
 * Her kural SABOTAJLA sınanır: kuralı bozan girdi kurulur, kapının onu YAKALADIĞI gösterilir. Yalnız "temiz
 * girdi geçer" demek kapının kör olup olmadığını söylemez (sahte yeşil). Ağ ve kaynak dizini testte yoktur.
 */
import { describe, it, expect } from 'vitest'

import { durumHesapla, kayitDenetle, markaDenetle, varlikCoz, metindekiSayilar, izinliSayilar } from '../marka-olgu-dogrula.mjs'

type Kaynak = Record<string, unknown>
type KayitOlgusu = { alan: string; durum: string; deger?: string; degerEn?: string; neden?: string; sayilar?: string[]; esdegerler?: string[]; kaynaklar: Kaynak[] }
type TestKayit = { surum: number; sonDogrulama: string; markalar: Record<string, { ad: string; olgular: KayitOlgusu[] }> }
const kaynak = (yayin: string, extra: Kaynak = {}): Kaynak => ({
  yayin, tur: 'web', url: 'https://example.com/hakkimizda', alinti: 'birebir alıntı metni', bulundu: true, sha256: 'a'.repeat(64), cekim: '2026-10-09', ...extra,
})
const olgu = (alan: string, durum: string, extra: Partial<KayitOlgusu> = {}): KayitOlgusu => ({ alan, durum, deger: 'x', degerEn: 'x', kaynaklar: [kaynak('marka-sitesi')], ...extra })
const kayit = (olgular: KayitOlgusu[], slug = 'x'): TestKayit => ({ surum: 1, sonDogrulama: '2026-10-09', markalar: { [slug]: { ad: 'X', olgular } } })

describe('INV-MARKA-OLGU-2 · saf işlevler', () => {
  it('varlikCoz: Türkçe HTML varlıklarını çözer, bilinmeyeni bozmaz', () => {
    expect(varlikCoz('m&uuml;hendis kadrosuyla kurulmu&#351;tur &amp; &ccedil;ok')).toBe('mühendis kadrosuyla kurulmuştur & çok')
    expect(varlikCoz('a &bilinmeyen; b')).toBe('a &bilinmeyen; b')
  })

  it('metindekiSayilar: yıl ve yüzdeyi bulur, küçük sayıyı bulmaz', () => {
    expect([...metindekiSayilar("1954 yılından bu yana, enerjiyi %80'e varan azaltır, 20 yıl ve 80% de")].sort()).toEqual(['%80', '1954'])
    expect([...metindekiSayilar('Waldenburg adresli 4 aile, 12 model')]).toEqual([])
  })

  it('durumHesapla: bağımsızlık = farklı yayın; aynı sitenin iki sayfası tek yayındır', () => {
    expect(durumHesapla([])).toBe('DOGRULANAMADI')
    expect(durumHesapla([kaynak('marka-sitesi')])).toBe('TEK_KAYNAK')
    expect(durumHesapla([kaynak('marka-sitesi'), kaynak('marka-sitesi', { url: 'https://example.com/baska' })])).toBe('TEK_KAYNAK')
    expect(durumHesapla([kaynak('marka-sitesi'), kaynak('uretici-katalogu')])).toBe('DOGRULANDI')
  })

  it('durumHesapla: çıkarım (dogrudan:false) ve bulunamayan kaynak bağımsızlık saymaz', () => {
    expect(durumHesapla([kaynak('marka-sitesi'), kaynak('uretici-katalogu', { dogrudan: false })])).toBe('TEK_KAYNAK')
    expect(durumHesapla([kaynak('marka-sitesi', { dogrudan: false })])).toBe('DOGRULANAMADI')
    expect(durumHesapla([kaynak('marka-sitesi'), kaynak('uretici-katalogu', { bulundu: false })])).toBe('TEK_KAYNAK')
  })
})

describe('INV-MARKA-OLGU-2 · kayitDenetle sabotajları', () => {
  const temiz = () => kayit([olgu('founded', 'TEK_KAYNAK'), olgu('country', 'DOGRULANDI', { kaynaklar: [kaynak('marka-sitesi'), kaynak('uretici-katalogu', { tur: 'dizin', url: undefined, pdf_hash: 'b'.repeat(64), sayfa: 2 })] }), olgu('headquarters', 'DOGRULANAMADI', { deger: undefined, neden: 'kaynakta yok', kaynaklar: [] })])

  it('temiz kayıt hatasız', () => {
    expect(kayitDenetle(temiz())).toEqual([])
  })

  it.each([
    ['DOGRULANDI ama tek yayın', (k: TestKayit) => { k.markalar.x.olgular[0].durum = 'DOGRULANDI' }, /hesaplanan TEK_KAYNAK/],
    ['TEK_KAYNAK ama kaynak bulunamadı', (k: TestKayit) => { k.markalar.x.olgular[0].kaynaklar[0].bulundu = false }, /hesaplanan DOGRULANAMADI/],
    ['alıntı boş', (k: TestKayit) => { k.markalar.x.olgular[0].kaynaklar[0].alinti = '' }, /alinti yok/],
    ['web kaynağı https değil', (k: TestKayit) => { k.markalar.x.olgular[0].kaynaklar[0].url = 'http://example.com' }, /https/],
    ['bulundu ama sha256 yok', (k: TestKayit) => { delete k.markalar.x.olgular[0].kaynaklar[0].sha256 }, /sha256/],
    ['bulundu ama çekim tarihi yok', (k: TestKayit) => { delete k.markalar.x.olgular[0].kaynaklar[0].cekim }, /cekim/],
    ['yazılabilir olguda değer yok', (k: TestKayit) => { delete k.markalar.x.olgular[0].deger }, /deger yok/],
    ['DOGRULANAMADI ama neden yazılmamış', (k: TestKayit) => { delete k.markalar.x.olgular[2].neden }, /neden/],
    ['aynı (marka, alan) iki kez', (k: TestKayit) => { k.markalar.x.olgular.push(olgu('founded', 'TEK_KAYNAK')) }, /iki kez/],
    ['country için İngilizce değer yok', (k: TestKayit) => { delete k.markalar.x.olgular[1].degerEn }, /degerEn/],
    ['geçersiz yayın', (k: TestKayit) => { k.markalar.x.olgular[0].kaynaklar[0].yayin = 'ajan-ozeti' }, /yayin geçersiz/],
    ['geçersiz durum', (k: TestKayit) => { k.markalar.x.olgular[0].durum = 'BELKI' }, /durum geçersiz/],
    ['DOGRULANAMADI denen olgunun kaynakları bulunmuş', (k: TestKayit) => { k.markalar.x.olgular[2].kaynaklar = [kaynak('marka-sitesi')] }, /DOGRULANAMADI ama kaynaklar/],
  ])('yakalar: %s', (_ad, boz, desen) => {
    const k = temiz()
    boz(k)
    expect(kayitDenetle(k).join('\n')).toMatch(desen)
  })

  it('ic-karar kaynağı karar numarası olmadan geçmez', () => {
    const k = kayit([olgu('avensDistributorlugu', 'TEK_KAYNAK', { kaynaklar: [{ yayin: 'ic-karar', alinti: 'karar metni burada', bulundu: true }] })])
    expect(kayitDenetle(k).join('\n')).toMatch(/karar numarası/)
    const duzgun = kayit([olgu('avensDistributorlugu', 'TEK_KAYNAK', { kaynaklar: [{ yayin: 'ic-karar', karar: '264', alinti: 'karar metni burada', bulundu: true }] })])
    expect(kayitDenetle(duzgun)).toEqual([])
  })
})

describe('INV-MARKA-OLGU-2 · markaDenetle (brands.ts × kayıt) sabotajları', () => {
  const kayitX = kayit([
    olgu('country', 'DOGRULANDI', { deger: 'Fransa', degerEn: 'France', kaynaklar: [kaynak('marka-sitesi'), kaynak('uretici-katalogu')] }),
    olgu('headquarters', 'DOGRULANDI', { deger: 'Verniolle', degerEn: 'Verniolle', kaynaklar: [kaynak('marka-sitesi'), kaynak('uretici-katalogu')] }),
    olgu('founded', 'TEK_KAYNAK', { deger: '1968', sayilar: ['1968'] }),
    olgu('website', 'TEK_KAYNAK', { deger: 'https://www.x.com', esdegerler: ['https://www.x.it'] }),
  ])
  const marka = () => ({
    slug: 'x', name: 'X',
    description: { tr: "1968'den bu yana Fransa'da üretim yapar.", en: 'Producing in France since 1968.' },
    country: { tr: 'Fransa', en: 'France' }, headquarters: { tr: 'Verniolle', en: 'Verniolle' }, founded: 1968, website: 'https://www.x.com',
  })
  const ak = { ovguVarMi: (m: string) => /lider|leader/i.test(m) }
  const anahtarlar = (b: object, k = kayitX) => markaDenetle([b], k, ak).map((i: { anahtar: string }) => i.anahtar)

  it('tutarlı marka temiz', () => {
    expect(anahtarlar(marka())).toEqual([])
  })

  it('eşdeğer adres (yönlenen alan adı) ve sondaki eğik çizgi kabul edilir', () => {
    expect(anahtarlar({ ...marka(), website: 'https://www.x.it' })).toEqual([])
    expect(anahtarlar({ ...marka(), website: 'https://www.x.com/' })).toEqual([])
  })

  it.each([
    ['yanlış kuruluş yılı', { founded: 2010 }, 'x.founded'],
    ['yanlış menşei (TR)', { country: { tr: 'İtalya', en: 'France' } }, 'x.country'],
    ['yanlış merkez (EN)', { headquarters: { tr: 'Verniolle', en: 'Paris' } }, 'x.headquarters'],
    ['yanlış web adresi', { website: 'https://www.baska-sirket.com' }, 'x.website'],
    ['izinsiz yıl açıklamada', { description: { tr: "1959'dan beri üretir.", en: 'Since 1959.' } }, 'x.description'],
    ['izinsiz yüzde açıklamada', { description: { tr: "Enerjiyi %80'e kadar azaltır.", en: 'Cuts energy.' } }, 'x.description'],
    ['üstünlük kalıbı açıklamada', { description: { tr: 'Sektörün lideri.', en: 'Industry peer.' } }, 'x.description'],
  ])('yakalar: %s', (_ad, degisim, beklenen) => {
    expect(anahtarlar({ ...marka(), ...degisim })).toContain(beklenen)
  })

  it('DOGRULANAMADI olgu brands.ts\'te yazılıysa yakalanır, yazılmıyorsa sorun değildir', () => {
    const k = kayit([olgu('founded', 'DOGRULANAMADI', { deger: undefined, neden: 'kaynakta yok', kaynaklar: [] })])
    expect(anahtarlar({ slug: 'x', name: 'X', description: { tr: 'Üretici.', en: 'Maker.' }, founded: 1959 }, k)).toContain('x.founded')
    expect(anahtarlar({ slug: 'x', name: 'X', description: { tr: 'Üretici.', en: 'Maker.' } }, k)).toEqual([])
  })

  it('kayıtta olmayan marka yakalanır', () => {
    expect(anahtarlar({ ...marka(), slug: 'yok' })).toContain('yok')
  })

  it('izinliSayilar: DOGRULANAMADI olgunun sayısı izinli sayılmaz', () => {
    const k = kayit([olgu('founded', 'DOGRULANAMADI', { deger: undefined, neden: 'yok', kaynaklar: [], sayilar: ['1959'] }), olgu('x', 'TEK_KAYNAK', { sayilar: ['1968'] })])
    expect([...izinliSayilar(k, 'x')]).toEqual(['1968'])
  })
})
