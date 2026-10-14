/**
 * INV-BING-GONDER-1 · Bing URL Gönder betiğinin ağsız çekirdeği (Kanban SEO-47; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md Y2.1).
 *
 * Kilitlenenler: kota ÖLÇÜLEMEZSE hiçbir şey gönderilmez (fail-closed); liste sırası önceliktir ve kota yetmezse
 * sondakiler KALAN'a düşer; min(günlük, aylık) aşılmaz; toplu istek 500'ü aşmaz; GET 200 ve kanonik kendisi
 * olmayan adres gönderilmez; kuru koşuda POST yok; anahtar hiçbir çıktıda geçmez; 200 + bozuk gövde "gönderildi" sayılmaz.
 */
import { describe, it, expect } from 'vitest'
import { adresDogrula, cikisKodu, gonder, gonderimPlani, gonderYanitiCoz, kotaCoz } from '../bing-url-gonder.mjs'

const SITE = 'https://venthub.com.tr/'
// Sahte anahtar: 32 onaltılı hane (gerçek anahtar değildir).
const ANAHTAR = 'a1b2c3d4e5f60718293a4b5c6d7e8f90'
const adres = (n: number) => `https://venthub.com.tr/tr/sayfa-${n}`
const liste = (n: number) => Array.from({ length: n }, (_, i) => adres(i + 1))
const kota = (gunluk: number, aylik = 10_000) => ({ durum: 'TAMAM', gunluk, aylik })

type Cagri = { url: string; method: string; body?: string }

/** Sahte ağ: kota yanıtı, sayfa HTML'i (kanonik kendisi) ve toplu gönderim yanıtı üretir. */
function sahteAg(secenek: { gunluk?: number; aylik?: number; sayfa?: (url: string) => { status: number; html?: string }; gonderStatus?: number; gonderGovde?: string } = {}) {
  const cagrilar: Cagri[] = []
  const fetchFn = async (url: string, init: { method?: string; body?: string } = {}) => {
    cagrilar.push({ url, method: init.method ?? 'GET', body: init.body })
    if (url.includes('GetUrlSubmissionQuota')) {
      const g = secenek.gunluk
      const body = g === undefined ? '{"d":null}' : JSON.stringify({ d: { DailyQuota: g, MonthlyQuota: secenek.aylik ?? 10_000 } })
      return new Response(body, { status: 200 })
    }
    if (url.includes('SubmitUrlBatch')) return new Response(secenek.gonderGovde ?? '{"d":null}', { status: secenek.gonderStatus ?? 200 })
    const s = secenek.sayfa ? secenek.sayfa(url) : { status: 200, html: `<link rel="canonical" href="${url}">` }
    return new Response(s.html ?? '', { status: s.status })
  }
  return { fetchFn: fetchFn as unknown as typeof fetch, cagrilar }
}

describe('INV-BING-GONDER-1', () => {
  it('(a) kotaCoz: sayılar TAMAM; eksik alan ya da hata OLCULEMEDI/hata olarak geçer, sıfıra DÖNMEZ', () => {
    expect(kotaCoz({ durum: 'TAMAM', nesne: { DailyQuota: 100, MonthlyQuota: 3000 } })).toEqual({ durum: 'TAMAM', gunluk: 100, aylik: 3000 })
    expect(kotaCoz({ durum: 'TAMAM', nesne: { DailyQuota: 100 } }).durum).toBe('OLCULEMEDI')
    expect(kotaCoz({ durum: 'TAMAM', nesne: { DailyQuota: '100', MonthlyQuota: 1 } }).durum).toBe('OLCULEMEDI')
    expect(kotaCoz({ durum: 'YETKI-YOK' }).durum).toBe('YETKI-YOK')
    expect(kotaCoz(null).durum).toBe('OLCULEMEDI')
  })

  it('(b) ⭐ayırt edici: kota yetmezse liste SIRASI korunur, sondakiler KALAN\'a düşer', () => {
    const p = gonderimPlani({ adresler: liste(5), siteUrl: SITE, kota: kota(3) })
    expect(p.gonderilecek).toEqual(liste(3))
    expect(p.kalan).toEqual([adres(4), adres(5)])
    expect(p.izin).toBe(true)
  })

  it('(c) ⭐ayırt edici: kota ÖLÇÜLEMEDİYSE hiçbir şey gönderilmez, hepsi KALAN (fail-closed)', () => {
    const p = gonderimPlani({ adresler: liste(4), siteUrl: SITE, kota: { durum: 'OLCULEMEDI' } })
    expect(p.izin).toBe(false)
    expect(p.neden).toBe('KOTA-OLCULEMEDI')
    expect(p.gonderilecek).toEqual([])
    expect(p.kalan).toHaveLength(4)
  })

  it('(d) kota 0 → KOTA-DOLU; site dışı, http ve bozuk adres ayrılır; tekrar sayılır', () => {
    const p0 = gonderimPlani({ adresler: liste(2), siteUrl: SITE, kota: kota(0) })
    expect(p0.neden).toBe('KOTA-DOLU')
    expect(p0.kalan).toHaveLength(2)
    const p = gonderimPlani({
      adresler: [adres(1), adres(1), 'http://venthub.com.tr/tr/x', 'https://example.com/a', 'rastgele metin', ''],
      siteUrl: SITE,
      kota: kota(10),
    })
    expect(p.gonderilecek).toEqual([adres(1)])
    expect(p.siteDisi).toHaveLength(3)
    expect(p.tekrar).toBe(1)
  })

  it('(e) toplu istek 500\'ü aşmaz; sınır min(günlük, aylık)', () => {
    const p = gonderimPlani({ adresler: liste(1200), siteUrl: SITE, kota: kota(1200, 10_000) })
    expect(p.partiler.map((x: string[]) => x.length)).toEqual([500, 500, 200])
    const q = gonderimPlani({ adresler: liste(50), siteUrl: SITE, kota: kota(100, 7) })
    expect(q.gonderilecek).toHaveLength(7)
    expect(q.kalan).toHaveLength(43)
  })

  it('(f) gonderYanitiCoz: 200 {"d":null} gönderildi; 200 + HTML bozuk; 400 ErrorCode 3 anahtar geçersiz; 403 yetki yok', () => {
    expect(gonderYanitiCoz(200, '{"d":null}', ANAHTAR).durum).toBe('GONDERILDI')
    expect(gonderYanitiCoz(200, '', ANAHTAR).durum).toBe('GONDERILDI')
    expect(gonderYanitiCoz(200, '<html>hata</html>', ANAHTAR).durum).toBe('YANIT-BOZUK')
    expect(gonderYanitiCoz(400, JSON.stringify({ ErrorCode: 3, Message: 'InvalidApiKey' }), ANAHTAR).durum).toBe('ANAHTAR-GECERSIZ')
    expect(gonderYanitiCoz(403, '', ANAHTAR).durum).toBe('YETKI-YOK')
    expect(gonderYanitiCoz(500, '', ANAHTAR).durum).toBe('HTTP-HATASI')
  })

  it('(g) ⭐ayırt edici: akış — kota 2, 3 adres → tek POST 2 adres taşır, 1 KALAN, çıkış 3; anahtar çıktıda yok', async () => {
    const ag = sahteAg({ gunluk: 2 })
    const s = await gonder({ fetchFn: ag.fetchFn, anahtar: ANAHTAR, siteUrl: SITE, adresler: liste(3) })
    const postlar = ag.cagrilar.filter((c) => c.method === 'POST')
    expect(postlar).toHaveLength(1)
    expect(JSON.parse(postlar[0].body ?? '{}')).toEqual({ siteUrl: SITE, urlList: [adres(1), adres(2)] })
    expect(postlar[0].url).toContain('SubmitUrlBatch?apikey=')
    expect(s.kalan).toEqual([adres(3)])
    expect(cikisKodu(s)).toBe(3)
    expect(JSON.stringify(s)).not.toContain(ANAHTAR)
  })

  it('(h) ⭐ayırt edici: 404 ya da kanonik kendisi olmayan adres POST\'a GİRMEZ ve çıkış 1', async () => {
    const ag = sahteAg({
      gunluk: 10,
      sayfa: (url) => {
        if (url.endsWith('sayfa-2')) return { status: 404 }
        if (url.endsWith('sayfa-3')) return { status: 200, html: '<link rel="canonical" href="https://venthub.com.tr/tr/baska">' }
        return { status: 200, html: `<link rel="canonical" href="${url}">` }
      },
    })
    const s = await gonder({ fetchFn: ag.fetchFn, anahtar: ANAHTAR, siteUrl: SITE, adresler: liste(3) })
    const post = ag.cagrilar.find((c) => c.method === 'POST')
    expect(JSON.parse(post?.body ?? '{}').urlList).toEqual([adres(1)])
    expect(s.reddedilen.map((r: { adres: string }) => r.adres)).toEqual([adres(2), adres(3)])
    expect(cikisKodu(s)).toBe(1)
  })

  it('(i) kuru koşuda POST yok; kota ölçülemezse çıkış 1 ve POST yok', async () => {
    const kuru = sahteAg({ gunluk: 5 })
    const s = await gonder({ fetchFn: kuru.fetchFn, anahtar: ANAHTAR, siteUrl: SITE, adresler: liste(2), kuru: true })
    expect(kuru.cagrilar.some((c) => c.method === 'POST')).toBe(false)
    expect(s.partiler).toHaveLength(0)
    const olculemedi = sahteAg({})
    const s2 = await gonder({ fetchFn: olculemedi.fetchFn, anahtar: ANAHTAR, siteUrl: SITE, adresler: liste(2) })
    expect(olculemedi.cagrilar.some((c) => c.method === 'POST')).toBe(false)
    expect(cikisKodu(s2)).toBe(1)
  })

  it('(j) gönderim hatası (HTTP 500) çıkış 1; adresDogrula ağ hatasını gönderilemez sayar', async () => {
    const ag = sahteAg({ gunluk: 5, gonderStatus: 500 })
    const s = await gonder({ fetchFn: ag.fetchFn, anahtar: ANAHTAR, siteUrl: SITE, adresler: liste(2) })
    expect(s.partiler[0].durum).toBe('HTTP-HATASI')
    expect(cikisKodu(s)).toBe(1)
    const patlayan = (async () => { throw new Error('ECONNRESET') }) as unknown as typeof fetch
    const d = await adresDogrula(patlayan, adres(1))
    expect(d.tamam).toBe(false)
    expect(d.sebep).toContain('ağ hatası')
  })
})
