import { describe, expect, it } from 'vitest'

import { cakismaOlc, canliDenetle, fiyatOlc, gorunurMetin, ifadeVarMi, uclular } from '../../../tools/rehber/canli-denetim.mjs'

/**
 * INV-REHBER-CANLI-DENETIM-1 · ağlı rehber denetim kolu (ARC-206 İŞ 2, HRT-70; rehber-yazisi-standard.md R10.6 madde 1-3).
 *
 * Ağ TAKLİT edilir; her ölçünün bozma testi vardır. Ders kaynakları: BLG-15 sessiz fan (meta kopyası),
 * BLG-18 (radon 8↔5 model, olmayan seri adı CA V0, hide_price fiyat cümlesi).
 */

type Cevap = { status: number; headers: { get(a: string): string | null }; text(): Promise<string> }
const cevap = (status: number, govde = ''): Cevap => ({ status, headers: { get: () => null }, text: async () => govde })

const KAT = 'https://venthub.com.tr/tr/kategori/kanal-tipi-fanlar'
const AILE = 'https://venthub.com.tr/tr/aile/ca-rm-es'

const META = 'Sessiz fan seçerken ses basıncı, debi ve statik basınç birlikte değerlendirilir ve fiyat etkenleri açıklanır'
const sayfaHtml = (govde: string) => `<html><head><script>var x = "kanal fan sessiz"</script></head><body>${govde}</body></html>`

function ag(sayfalar: Record<string, Cevap>) {
  return async (a: string) => sayfalar[a] ?? cevap(404)
}

const durumlar = (s: { maddeler: { ad: string; durum: string }[] }, ad: string) =>
  s.maddeler.filter((m) => m.ad === ad).map((m) => m.durum)

describe('INV-REHBER-CANLI-DENETIM-1 · 3’lü dizilim çakışması (sessiz fan dersi)', () => {
  it('meta açıklaması sayfa metnine kopyalanmışsa KALDI; ilgisiz metin GEÇTİ', async () => {
    const kopya = ag({ [KAT]: cevap(200, sayfaHtml(`<p>${META}</p>`)) })
    const s = await canliDenetle({ yazi: { metaAciklama: META }, sayfalar: [KAT] }, { getir: kopya })
    expect(s.durum).toBe('KALDI')
    expect(durumlar(s, 'cakisma:metaAçıklama')).toEqual(['KALDI'])

    const temiz = ag({ [KAT]: cevap(200, sayfaHtml('<p>Kanal tipi fanlar için ürün listesi ve filtreler burada yer alır.</p>')) })
    const t = await canliDenetle({ yazi: { metaAciklama: META }, sayfalar: [KAT] }, { getir: temiz })
    expect(durumlar(t, 'cakisma:metaAçıklama')).toEqual(['GEÇTİ'])
  })

  it('kısmi çakışma (yarım cümle ortak) UYARI üretir, KALDI değil', () => {
    const c = cakismaOlc('a b c d e f g h i j', 'a b c d e f z z z z')
    expect(c.oran).toBeCloseTo(4 / 8, 5) // a-b-c, b-c-d, c-d-e, d-e-f = 4 ortak / 8 üçlü
    const esik = c.oran >= 0.5 ? 'KALDI' : c.oran >= 0.2 ? 'UYARI' : 'GEÇTİ'
    expect(esik).toBe('KALDI')
    expect(cakismaOlc('a b c d e f g h i j', 'a b c z z z z z').oran).toBeCloseTo(1 / 8, 5)
  })

  it('data-nosnippet bloğundaki (yayınlanmış rehber kartı) metin sayılmaz; script ve etiketler de', async () => {
    const html = sayfaHtml(`<div data-nosnippet><p>${META}</p></div><p>Ürün listesi.</p>`)
    expect(gorunurMetin(html)).toBe('Ürün listesi.')
    const s = await canliDenetle({ yazi: { metaAciklama: META }, sayfalar: [KAT] }, { getir: ag({ [KAT]: cevap(200, html) }) })
    expect(durumlar(s, 'cakisma:metaAçıklama')).toEqual(['GEÇTİ'])
  })

  it('yayınlanmış yazıda rehber kartının kendi başlığı KALDI sayılmaz (UYARI); meta kopyası yine KALDI', async () => {
    const BASLIK = 'Sessiz fan nasıl seçilir dB ses gücü ve kanal fanı seçimi'
    const kart = ag({ [KAT]: cevap(200, sayfaHtml(`<a>${BASLIK}</a><p>${META}</p>`)) })
    const onceki = await canliDenetle({ yazi: { baslik: BASLIK }, sayfalar: [KAT] }, { getir: kart })
    expect(durumlar(onceki, 'cakisma:başlık')).toEqual(['KALDI'])
    const sonraki = await canliDenetle({ yazi: { baslik: BASLIK, metaAciklama: META }, sayfalar: [KAT], yayinlandi: true }, { getir: kart })
    expect(durumlar(sonraki, 'cakisma:başlık')).toEqual(['UYARI'])
    expect(durumlar(sonraki, 'cakisma:metaAçıklama')).toEqual(['KALDI'])
  })

  it('üç kelimeden kısa aday ölçülemez: sessiz GEÇTİ değil UYARI', async () => {
    const s = await canliDenetle({ yazi: { baslik: 'Kısa başlık' }, sayfalar: [KAT] }, { getir: ag({ [KAT]: cevap(200, sayfaHtml('x')) }) })
    expect(durumlar(s, 'cakisma:başlık')).toEqual(['UYARI'])
  })
})

describe('INV-REHBER-CANLI-DENETIM-1 · iddia, seri adı (radon 8↔5, CA V0 dersi)', () => {
  const sayfalar = {
    [AILE]: cevap(200, sayfaHtml('<h1>CA-RM ES</h1><p>5 model • 26,1 dB(A) • CA MD</p>')),
  }

  it('canlıda olan iddia GEÇTİ (virgül/nokta gösterimi eşit); olmayan KALDI', async () => {
    const s = await canliDenetle(
      { sayfalar: [AILE], iddialar: [{ sayfa: AILE, metin: '26.1 dB(A)' }, { sayfa: AILE, metin: '8 model' }] },
      { getir: ag(sayfalar) },
    )
    expect(durumlar(s, 'iddia')).toEqual(['GEÇTİ', 'KALDI'])
    expect(s.durum).toBe('KALDI')
  })

  it('olmayan seri adı (CA V0) KALDI; var olan (CA MD) GEÇTİ', async () => {
    const s = await canliDenetle({ sayfalar: [AILE], seriler: ['CA MD', 'CA V0'] }, { getir: ag(sayfalar) })
    expect(durumlar(s, 'seri')).toEqual(['GEÇTİ', 'KALDI'])
  })

  it('sayfa açılmazsa iddia/seri sessiz geçmez: ÖLÇÜLEMEDİ', async () => {
    const s = await canliDenetle({ sayfalar: [AILE], iddialar: [{ sayfa: AILE, metin: '5 model' }], seriler: ['CA MD'] }, { getir: ag({}) })
    expect(s.durum).toBe('ÖLÇÜLEMEDİ')
    expect(s.maddeler.some((m: { durum: string }) => m.durum === 'GEÇTİ')).toBe(false)
  })
})

describe('INV-REHBER-CANLI-DENETIM-1 · fiyat / hide_price (BLG-18 dersi)', () => {
  const GIZLI = sayfaHtml('<p>Teklif İste</p><p>Teklif İste</p><p>Teklif İste</p>')
  const ACIK = sayfaHtml('<p>12.500 ₺</p><p>Teklif İste</p>')

  it('yazıda fiyat cümlesi var + sayfada görünür fiyat 0 ve Teklif > 0 → KALDI', async () => {
    const s = await canliDenetle({ sayfalar: [AILE], yazidaFiyatVar: true }, { getir: ag({ [AILE]: cevap(200, GIZLI) }) })
    expect(durumlar(s, 'fiyat')).toEqual(['KALDI'])
  })

  it('aynı sayfada yazıda fiyat cümlesi yoksa yalnız bilgi (GEÇTİ); fiyatı görünür sayfa da GEÇTİ', async () => {
    const a = await canliDenetle({ sayfalar: [AILE], yazidaFiyatVar: false }, { getir: ag({ [AILE]: cevap(200, GIZLI) }) })
    expect(durumlar(a, 'fiyat')).toEqual(['GEÇTİ'])
    const b = await canliDenetle({ sayfalar: [AILE], yazidaFiyatVar: true }, { getir: ag({ [AILE]: cevap(200, ACIK) }) })
    expect(durumlar(b, 'fiyat')).toEqual(['GEÇTİ'])
    expect(b.maddeler[0].ayrinti).toContain('₺/TL 1')
  })

  it('fiyatOlc ₺/TL ve Teklif sayar', () => {
    expect(fiyatOlc('1.250 TL ve 300 ₺ ... Teklif al, teklif iste')).toEqual({ fiyat: 2, teklif: 2 })
  })
})

describe('INV-REHBER-CANLI-DENETIM-1 · BLOG iddia tablosu (--iddia)', () => {
  const tablo = {
    iddialar: [
      { no: 1, tur: 'genel', metin: 'Genel cümle [1] 150 mm yok sayılır çünkü tur genel.' },
      { no: 21, tur: 'sayi', metin: 'Radon serisi 100, 125 ve 150 mm çaplarında, IP45 koruma sınıfıyla sunulur [5].' },
      { no: 23, tur: 'sayi', metin: 'Radon ürün grubu 8 modelden oluşur [6].' },
      { no: 24, tur: 'sayi', metin: 'Sayısı olmayan sayi satırı [7].' },
    ],
  }
  const AILE_SAYFA = sayfaHtml('<p>Çap 150 mm • IP45 • 5 model</p>')

  it('sayı+birim ifadeleri çıkarılır; atıf numaraları ve genel tur atılır', async () => {
    const { sayiIddialari, sayiTokenleri } = await import('../../../tools/rehber/canli-denetim.mjs')
    expect(sayiTokenleri('150 mm, IP45 ve 26,1 dB(A) [3, 4] ile 8 model')).toEqual(['IP45', '150 mm', '26,1 dB(A)', '8 model'])
    expect(sayiIddialari(tablo).map((i: { no: number }) => i.no)).toEqual([21, 23])
  })

  it('canlıda olmayan sayı (8 model) UYARI, tamamı canlıda olan GEÇTİ; evren boşsa sessiz geçmez', async () => {
    const s = await canliDenetle({ sayfalar: [AILE], iddiaTablosu: tablo }, { getir: ag({ [AILE]: cevap(200, AILE_SAYFA) }) })
    const t = s.maddeler.filter((m: { ad: string }) => m.ad === 'iddia-tablo')
    expect(t.map((m: { durum: string }) => m.durum)).toEqual(['GEÇTİ', 'UYARI']) // #21: 150 mm + IP45 canlıda var; #23: 8 model yok (5 model)
    expect(t[1].ayrinti).toContain('8 model')
    const tam = await canliDenetle(
      { sayfalar: [AILE], iddiaTablosu: { iddialar: [{ no: 9, tur: 'sayi', metin: 'Çap 150 mm ve IP45 [2].' }] } },
      { getir: ag({ [AILE]: cevap(200, AILE_SAYFA) }) },
    )
    expect(durumlar(tam, 'iddia-tablo')).toEqual(['GEÇTİ'])
    const bos = await canliDenetle({ sayfalar: [AILE], iddiaTablosu: tablo }, { getir: ag({}) })
    expect(durumlar(bos, 'iddia-tablo')).toEqual([])
    expect(bos.durum).toBe('ÖLÇÜLEMEDİ')
  })
})

describe('INV-REHBER-CANLI-DENETIM-1 · boş girdi ve yardımcılar', () => {
  it('hiçbir şey ölçülmediyse sessiz yeşil değil ÖLÇÜLEMEDİ', async () => {
    expect((await canliDenetle({}, { getir: ag({}) })).durum).toBe('ÖLÇÜLEMEDİ')
  })
  it('yönlendirme izlenmez: 308 → ÖLÇÜLEMEDİ', async () => {
    const s = await canliDenetle({ sayfalar: [KAT] }, { getir: ag({ [KAT]: cevap(308) }) })
    expect(s.durum).toBe('ÖLÇÜLEMEDİ')
  })
  it('uclular noktalama ve büyük/küçük harf farkını eler; ifadeVarMi sayı gösterimini eşitler', () => {
    expect([...uclular('Sessiz, FAN seçimi!')]).toEqual(['sessiz fan seçimi'])
    expect(ifadeVarMi('değer 40,2 dB(A) ölçüldü', '40.2 db(a)')).toBe(true)
  })
})
