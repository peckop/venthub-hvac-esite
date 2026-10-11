import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { adresKur, anahtarOku, cikisKodu, depoIcindeMi, maskele, msTarih, oku, ozetle, urlBilgiOzet, yanitCoz } from '../bing-webmaster-oku.mjs'

/**
 * INV-BING-OKU-1..3 · Bing Webmaster okuma betiği (SEO-9, OPS-106).
 *
 * NİÇİN TEST: betik anahtarı sorgu adresinde taşır; bir hata mesajı ya da çıktı dosyası anahtarı yazarsa repo PUBLIC olduğu için
 * geri dönüşü yoktur. İkinci risk "kör kapı": Bing boş yanıt döndüğünde sıfır yazmak, ölçülemeyeni "sıfır görünürlük" yapar.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: anahtar okuma, maskeleme, yanıt sınıflama ve koşucu ayrı davranışlardır.
 */

const ANAHTAR = '0123456789abcdef0123456789abcdef'
const SITE = 'https://venthub.com.tr/'
/** Bing JSON tarih biçimi: "/Date(<epoch ms><ofset>)/". */
const t = (y: number, ay: number, g: number) => `/Date(${Date.UTC(y, ay - 1, g)}-0700)/`

type Kural = { status: number; body: unknown } | Error

/** Ağ yerine geçen sahte `fetch`: yöntem adına göre kural uygular, tüm istek adreslerini kaydeder. */
function sahteAg(kurallar: Record<string, Kural>) {
  const istekler: string[] = []
  const fetchFn = async (adres: string) => {
    istekler.push(adres)
    const yontem = adres.split('/json/')[1].split('?')[0]
    const k = kurallar[yontem] ?? { status: 200, body: { d: [] } }
    if (k instanceof Error) throw k
    return { status: k.status, text: async () => JSON.stringify(k.body) }
  }
  return { fetchFn, istekler }
}

const SAGLAM: Record<string, Kural> = {
  GetUserSites: { status: 200, body: { d: [{ Url: SITE, IsVerified: true }] } },
  GetRankAndTrafficStats: { status: 200, body: { d: [{ Date: t(2026, 10, 4), Clicks: 1, Impressions: 3 }, { Date: t(2026, 10, 5), Clicks: 2, Impressions: 5 }] } },
  GetQueryStats: { status: 200, body: { d: [{ Date: t(2026, 10, 5), Query: 'hava perdesi', Impressions: 4, Clicks: 0 }] } },
  GetPageStats: { status: 200, body: { d: [{ Date: t(2026, 10, 2), Query: `${SITE}tr/about`, Impressions: 2, Clicks: 0 }] } },
  GetCrawlStats: { status: 200, body: { d: [{ Date: t(2026, 10, 4), InIndex: 27, CrawledPages: 5, CrawlErrors: 0, Code2xx: 121 }, { Date: t(2026, 10, 3), InIndex: 26, CrawledPages: 4, CrawlErrors: 0, Code2xx: 118 }] } },
  GetCrawlIssues: { status: 200, body: { d: [] } },
  GetFeeds: { status: 200, body: { d: [{ Url: `${SITE}sitemap.xml`, Status: 'Success', UrlCount: 92, LastCrawled: t(2026, 10, 9), Submitted: t(2026, 8, 29) }] } },
  GetUrlInfo: { status: 200, body: { d: { Url: `${SITE}tr/about`, HttpStatus: 200, IsPage: true, LastCrawledDate: t(2026, 10, 4), DiscoveryDate: t(2026, 9, 1), DocumentSize: 1200, AnchorCount: 3 } } },
}

describe('INV-BING-OKU-1 · anahtar yalnız dosyadan okunur ve hiçbir yerde görünmez', () => {
  it('KOL B1 · dosya yoksa ANAHTAR-DOSYASI-YOK; hata yalnız kod, yol ya da içerik taşımaz', () => {
    const r = anahtarOku('C:/yok/anahtar.txt', () => { throw new Error('ENOENT C:/yok/anahtar.txt') })
    expect(r).toEqual({ hata: 'ANAHTAR-DOSYASI-YOK' })
  })

  it('KOL B2 · biçimi bozuk anahtar (31 hane, onaltılı olmayan, boş) ANAHTAR-BICIMI verir ve değeri geri yazmaz', () => {
    for (const bozuk of [ANAHTAR.slice(1), `${ANAHTAR.slice(1)}z`, '']) {
      const r = anahtarOku('x', () => bozuk)
      expect(r).toEqual({ hata: 'ANAHTAR-BICIMI' })
      expect(JSON.stringify(r)).not.toContain(ANAHTAR.slice(2))
    }
  })

  it('KOL B3 · geçerli anahtar satır sonu ve boşluktan arındırılarak döner', () => {
    expect(anahtarOku('x', () => `${ANAHTAR}\r\n`)).toEqual({ anahtar: ANAHTAR })
  })

  it('KOL B4 · maskele anahtarı her yazımıyla (küçük, büyük) ve apikey= değerini siler', () => {
    const metin = `fetch failed ${ANAHTAR} ${ANAHTAR.toUpperCase()} https://x/y?siteUrl=a&apikey=${ANAHTAR}&url=b apikey=ffffffffffffffffffffffffffffffff`
    const m = maskele(metin, ANAHTAR)
    expect(m, 'anahtar maskelenmedi').not.toMatch(/[0-9a-f]{32}/i)
    expect(m).toContain('apikey=***')
  })

  it('KOL B5 · adresKur anahtarı yalnız apikey parametresinde taşır, siteUrl ve url kodlanır', () => {
    const a = adresKur('GetUrlInfo', { anahtar: ANAHTAR, siteUrl: SITE, url: `${SITE}tr/about?a=1&b=2` })
    expect(a.startsWith('https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?')).toBe(true)
    expect(a).toContain(`siteUrl=${encodeURIComponent(SITE)}`)
    expect(a).toContain(`url=${encodeURIComponent(`${SITE}tr/about?a=1&b=2`)}`)
    expect(a.endsWith(`apikey=${ANAHTAR}`)).toBe(true)
  })
})

describe('INV-BING-OKU-2 · yanıt sınıflama: boş yanıt sıfır değil, ölçülemedi', () => {
  it('KOL B6 · 400 InvalidApiKey → ANAHTAR-GECERSIZ; 401 ve 403 → YETKI-YOK', () => {
    expect(yanitCoz(400, JSON.stringify({ ErrorCode: 3, Message: 'InvalidApiKey' }), ANAHTAR)).toMatchObject({ durum: 'ANAHTAR-GECERSIZ', hataKodu: 3 })
    expect(yanitCoz(401, '', ANAHTAR).durum).toBe('YETKI-YOK')
    expect(yanitCoz(403, '', ANAHTAR).durum).toBe('YETKI-YOK')
    expect(yanitCoz(400, JSON.stringify({ ErrorCode: 8, Message: 'x' }), ANAHTAR).durum).toBe('API-HATASI')
  })

  it('KOL B7 · KÖR KAPI: boş liste ve d alanı olmayan yanıt OLCULEMEDI; satır yok, TAMAM değil', () => {
    for (const govde of [{ d: [] }, {}, { d: null }]) {
      const r = yanitCoz(200, JSON.stringify(govde), ANAHTAR)
      expect(r.durum, JSON.stringify(govde)).toBe('OLCULEMEDI')
      expect(r.satirlar).toBeUndefined()
    }
  })

  it('KOL B8 · bozuk gövde YANIT-BOZUK, 500 HTTP-HATASI; API mesajındaki anahtar maskelenir', () => {
    expect(yanitCoz(200, '<html>', ANAHTAR).durum).toBe('YANIT-BOZUK')
    expect(yanitCoz(500, '{}', ANAHTAR).durum).toBe('HTTP-HATASI')
    const r = yanitCoz(400, JSON.stringify({ ErrorCode: 8, Message: `bad key ${ANAHTAR}` }), ANAHTAR)
    expect(JSON.stringify(r)).not.toContain(ANAHTAR)
  })

  it('KOL B9 · msTarih epoch milisaniyeyi ISO yapar, ofsetsiz ve tanınmayan biçimi null bırakır', () => {
    expect(msTarih(t(2026, 10, 4))).toBe('2026-10-04T00:00:00.000Z')
    expect(msTarih(`/Date(${Date.UTC(2026, 9, 4)})/`)).toBe('2026-10-04T00:00:00.000Z')
    expect(msTarih('2026-10-04')).toBeNull()
    expect(msTarih(undefined)).toBeNull()
  })
})

describe('INV-BING-OKU-3 · koşucu: anahtar çıktıya sızmaz, geçersiz anahtarda durur, tazelik görünür', () => {
  const bugun = new Date('2026-10-11T12:00:00Z')

  it('KOL B10 · başarılı koşu: her istek apikey taşır, sonuç JSON\'unda anahtar YOK, son veri tarihi görünür', async () => {
    const { fetchFn, istekler } = sahteAg(SAGLAM)
    const s = await oku({ fetchFn, anahtar: ANAHTAR, siteUrl: SITE, urlBilgi: [`${SITE}tr/about`], bugun, bekleMs: 0 })
    expect(istekler.length).toBe(1 + 6 + 1)
    for (const a of istekler) expect(a).toContain(`apikey=${ANAHTAR}`)
    expect(JSON.stringify(s), 'anahtar sonuca sızdı').not.toContain(ANAHTAR)
    expect(s.yontemler.GetCrawlStats.ozet).toMatchObject({ sonTarih: '2026-10-04T00:00:00.000Z', dizindeSayfa: 27 })
    expect(s.yontemler.GetPageStats.ozet.sonTarih).toBe('2026-10-02T00:00:00.000Z')
    expect(cikisKodu(s)).toBe(0)
  })

  it('KOL B11 · ağ hatası metni adres taşısa da anahtar maskelenir; durum AG-HATASI, çıkış 1', async () => {
    const hata = new Error(`request to https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats?siteUrl=a&apikey=${ANAHTAR} failed`)
    const { fetchFn } = sahteAg({ ...SAGLAM, GetCrawlStats: hata })
    const s = await oku({ fetchFn, anahtar: ANAHTAR, siteUrl: SITE, bugun, bekleMs: 0 })
    expect(s.yontemler.GetCrawlStats.durum).toBe('AG-HATASI')
    expect(JSON.stringify(s), 'ağ hatası anahtarı sızdırdı').not.toContain(ANAHTAR)
    expect(cikisKodu(s)).toBe(1)
  })

  it('KOL B12 · anahtar geçersizse GetUserSites\'ta durulur: diğer yöntemler çağrılmaz, çıkış 1', async () => {
    const { fetchFn, istekler } = sahteAg({ GetUserSites: { status: 400, body: { ErrorCode: 3, Message: 'InvalidApiKey' } } })
    const s = await oku({ fetchFn, anahtar: ANAHTAR, siteUrl: SITE, urlBilgi: [`${SITE}tr`], bugun, bekleMs: 0 })
    expect(istekler.length).toBe(1)
    expect(s.durdu).toBe('ANAHTAR-GECERSIZ')
    expect(cikisKodu(s)).toBe(1)
  })

  it('KOL B13 · KÖR KAPI: boş yanıt OLCULEMEDI yazılır, özet ve ham yok (sıfır uydurulmaz); çıkış 0', async () => {
    const { fetchFn } = sahteAg({ ...SAGLAM, GetRankAndTrafficStats: { status: 200, body: { d: [] } } })
    const s = await oku({ fetchFn, anahtar: ANAHTAR, siteUrl: SITE, bugun, bekleMs: 0 })
    expect(s.yontemler.GetRankAndTrafficStats.durum).toBe('OLCULEMEDI')
    expect(s.yontemler.GetRankAndTrafficStats.ozet).toBeUndefined()
    expect(s.ham.GetRankAndTrafficStats).toBeUndefined()
    expect(cikisKodu(s)).toBe(0)
  })

  it('KOL B14 · GetUrlInfo sayfa bazında durumu ISO tarihle verir; HTTP hatası adres satırında HATA kalır ve çıkışı 1 yapar', async () => {
    const { fetchFn } = sahteAg(SAGLAM)
    const s = await oku({ fetchFn, anahtar: ANAHTAR, siteUrl: SITE, urlBilgi: [`${SITE}tr/about`], bugun, bekleMs: 0 })
    expect(s.urlBilgi[0]).toMatchObject({ adres: `${SITE}tr/about`, durum: 'TAMAM', httpDurum: 200, sayfaMi: true, sonTarama: '2026-10-04T00:00:00.000Z' })
    const kotu = urlBilgiOzet(`${SITE}tr`, yanitCoz(500, '{}', ANAHTAR))
    expect(kotu.durum).toBe('HTTP-HATASI')
    expect(cikisKodu({ yontemler: {}, urlBilgi: [kotu], durdu: null })).toBe(1)
  })

  it('KOL B15 · özet: tık ve gösterim yalnız pencere içindeki günleri toplar, en çok gösterimli sorgular sıralanır', () => {
    const s = { satirlar: [
      { Date: t(2026, 10, 5), Clicks: 2, Impressions: 5 },
      { Date: t(2026, 10, 4), Clicks: 1, Impressions: 3 },
      { Date: t(2026, 8, 1), Clicks: 9, Impressions: 90 },
    ] }
    expect(ozetle('GetRankAndTrafficStats', s, 30, new Date('2026-10-11T00:00:00Z'))).toMatchObject({ tik: 3, gosterim: 8, sonTarih: '2026-10-05T00:00:00.000Z' })
    const q = { satirlar: [
      { Date: t(2026, 10, 5), Query: 'a', Impressions: 1 },
      { Date: t(2026, 10, 5), Query: 'b', Impressions: 7 },
    ] }
    expect(ozetle('GetQueryStats', q, 30, new Date('2026-10-11T00:00:00Z')).enCok[0]).toEqual({ ad: 'b', gosterim: 7 })
  })

  it('KOL B16 · çıktı klasörü bir git deposunun içindeyse depoIcindeMi true (anahtar ve ham çıktı depoya girmesin)', () => {
    // Yol işletim sistemine göre kurulur (CI Linux, yerel Windows): sabit "C:/..." Linux'ta mutlak yol sayılmaz.
    const kok = resolve('/proje')
    expect(depoIcindeMi(join(kok, 'alt', 'cikti.json'), (p: string) => p === join(kok, '.git'))).toBe(true)
    expect(depoIcindeMi(join(kok, 'alt', 'cikti.json'), () => false)).toBe(false)
  })
})
