/**
 * INV-BING-FARK-1 · Bing Webmaster okumasında iki koşu arası FARK (Kanban SEO-43; cetvel
 * docs/standards/dizin-sistemleri-standard.md D3 ve yayin-gorunurluk-denetim-standard.md).
 *
 * Kilitlenenler: veri yeni mi yalnız SON VERİ TARİHİ ilerlediyse "yeni" (tarihsiz sayı tazelik kanıtı değil);
 * karşılaştırılamayan "değişmedi" sayılmaz; sayaç farkı işaretlidir; sayfa kaydı yok→var YENI-KAYIT; sayfa
 * yalnız bir koşuda varsa ayrı listelenir; durum değişimi (TAMAM→hata) görünür.
 */
import { describe, it, expect } from 'vitest'
import { farkUret, tabanOku } from '../bing-webmaster-oku.mjs'

const crawl = (sonTarih: string, dizinde: number, taranan = 10) => ({ durum: 'TAMAM', ozet: { satir: 5, sonTarih: `${sonTarih}T00:00:00.000Z`, dizindeSayfa: dizinde, taranan, hata: 0, kod2xx: 100, kod301: 0, kod4xx: 0, kod5xx: 0, robotsEngel: 0 } })
const trafik = (sonTarih: string, tik: number, gosterim: number) => ({ durum: 'TAMAM', ozet: { satir: 9, sonTarih: `${sonTarih}T00:00:00.000Z`, pencereGun: 30, tik, gosterim } })
const url = (adres: string, sonTarama: string | null, http = 200, durum = 'TAMAM') => ({ adres, durum, httpDurum: http, sayfaMi: true, sonTarama, kesif: null })

describe('INV-BING-FARK-1', () => {
  it('(a) ⭐ayırt edici: son veri tarihi aynıysa VERİ DEĞİŞMEDİ, ilerlediyse VERİ YENİ', () => {
    const onceki = { yontemler: { GetCrawlStats: crawl('2026-10-05', 27), GetRankAndTrafficStats: trafik('2026-10-08', 1, 33) } }
    const simdi = { yontemler: { GetCrawlStats: crawl('2026-10-05', 27), GetRankAndTrafficStats: trafik('2026-10-10', 1, 40) } }
    const f = farkUret(onceki, simdi)
    expect(f.yontemler.GetCrawlStats.veriYeni).toBe(false)
    expect(f.yontemler.GetRankAndTrafficStats.veriYeni).toBe(true)
    expect(f.ozetSatirlari.join('\n')).toContain('GetCrawlStats: VERİ DEĞİŞMEDİ (son veri 2026-10-05)')
    expect(f.ozetSatirlari.join('\n')).toContain('VERİ YENİ (son veri 2026-10-08 → 2026-10-10)')
  })

  it('(b) ⭐ayırt edici: sayaç farkı işaretlidir (+/−) ve değişmeyen alan satıra girmez', () => {
    const f = farkUret(
      { yontemler: { GetCrawlStats: crawl('2026-10-05', 27, 14) } },
      { yontemler: { GetCrawlStats: crawl('2026-10-07', 25, 20) } },
    )
    const a = f.yontemler.GetCrawlStats.alanlar
    expect(a.dizindeSayfa).toEqual({ once: 27, simdi: 25, fark: -2 })
    expect(a.taranan).toEqual({ once: 14, simdi: 20, fark: 6 })
    const satir = f.ozetSatirlari[0]
    expect(satir).toContain('dizindeSayfa 27 → 25 (-2)')
    expect(satir).toContain('taranan 14 → 20 (+6)')
    expect(satir).not.toContain('kod2xx')
  })

  it('(c) yöntem durumu TAMAM → hata değişimi görünür; özet yoksa veriYeni null (değişmedi sayılmaz)', () => {
    const f = farkUret(
      { yontemler: { GetCrawlIssues: { durum: 'TAMAM', ozet: { satir: 0 } }, GetFeeds: { durum: 'TAMAM', ozet: { satir: 1, haritalar: [] } } } },
      { yontemler: { GetCrawlIssues: { durum: 'AG-HATASI' }, GetFeeds: { durum: 'TAMAM', ozet: { satir: 1, haritalar: [] } } } },
    )
    expect(f.yontemler.GetCrawlIssues.durum).toEqual({ once: 'TAMAM', simdi: 'AG-HATASI' })
    expect(f.yontemler.GetCrawlIssues.veriYeni).toBeNull()
    expect(f.ozetSatirlari.join('\n')).toContain('GetCrawlIssues: KARŞILAŞTIRILAMADI · DURUM TAMAM → AG-HATASI')
  })

  it('(d) ⭐ayırt edici: sayfa kaydı yok → var YENI-KAYIT; var → yok KAYIT-KAYBOLDU; "0001" tarih kayıtsızdır', () => {
    const onceki = { yontemler: {}, urlBilgi: [url('https://a/yeni', '0001-01-01T00:00:00Z'), url('https://a/eski', '2026-10-01T10:00:00Z'), url('https://a/hata', null, 0, 'OLCULEMEDI')] }
    const simdi = { yontemler: {}, urlBilgi: [url('https://a/yeni', '2026-10-12T09:00:00Z'), url('https://a/eski', '0001-01-01T00:00:00Z'), url('https://a/hata', '2026-10-12T00:00:00Z')] }
    const f = farkUret(onceki, simdi)
    const d = Object.fromEntries(f.urlBilgi.map((u: { adres: string; degisim: string }) => [u.adres, u.degisim]))
    expect(d['https://a/yeni']).toBe('YENI-KAYIT')
    expect(d['https://a/eski']).toBe('KAYIT-KAYBOLDU')
    expect(d['https://a/hata']).toBe('YENI-KAYIT')
    expect(f.ozetSatirlari.join('\n')).toContain('sayfa YENI-KAYIT: https://a/yeni')
    expect(f.ozetSatirlari[f.ozetSatirlari.length - 1]).toContain('3 adres, 3 değişen, 2 yeni kayıt')
  })

  it('(f) adres yalnız bir koşuda varsa TABANDA-YOK / BU-KOSUDA-YOK diye ayrı listelenir; değişmeyen DEGISMEDI', () => {
    const f = farkUret(
      { yontemler: {}, urlBilgi: [url('https://a/ortak', '2026-10-01T00:00:00Z'), url('https://a/yalniz-eski', '2026-10-01T00:00:00Z')] },
      { yontemler: {}, urlBilgi: [url('https://a/ortak', '2026-10-01T00:00:00Z'), url('https://a/yalniz-yeni', '2026-10-02T00:00:00Z')] },
    )
    const d = Object.fromEntries(f.urlBilgi.map((u: { adres: string; degisim: string }) => [u.adres, u.degisim]))
    expect(d).toEqual({ 'https://a/ortak': 'DEGISMEDI', 'https://a/yalniz-eski': 'BU-KOSUDA-YOK', 'https://a/yalniz-yeni': 'TABANDA-YOK' })
  })

  it('(g) son tarama ve HTTP kodu değişimi ayrı sınıflanır; site haritası URL sayısı değişimi satırda', () => {
    const harita = (urlSayisi: number, sonTarama: string) => ({ url: 'https://venthub.com.tr/sitemap.xml', durum: 'Success', urlSayisi, sonTarama: `${sonTarama}T00:00:00.000Z` })
    const f = farkUret(
      { yontemler: { GetFeeds: { durum: 'TAMAM', ozet: { satir: 1, haritalar: [harita(92, '2026-10-06')] } } }, urlBilgi: [url('https://a/x', '2026-10-01T00:00:00Z', 200), url('https://a/y', '2026-10-01T00:00:00Z', 200)] },
      { yontemler: { GetFeeds: { durum: 'TAMAM', ozet: { satir: 1, haritalar: [harita(93, '2026-10-09')] } } }, urlBilgi: [url('https://a/x', '2026-10-05T00:00:00Z', 200), url('https://a/y', '2026-10-01T00:00:00Z', 404)] },
    )
    const d = Object.fromEntries(f.urlBilgi.map((u: { adres: string; degisim: string }) => [u.adres, u.degisim]))
    expect(d['https://a/x']).toBe('SON-TARAMA-DEGISTI')
    expect(d['https://a/y']).toBe('HTTP-DEGISTI')
    expect(f.yontemler.GetFeeds.haritalar?.[0].urlSayisi).toEqual({ once: 92, simdi: 93 })
    expect(f.ozetSatirlari.join('\n')).toContain('url 92 → 93, son tarama 2026-10-06 → 2026-10-09')
  })

  it('(i) ⭐ayırt edici: iki koşuda da kaydı olmayan sayfa KAYIT-YOK (değişim sayılmaz; "0001" ile null farkı)', () => {
    const f = farkUret(
      { yontemler: {}, urlBilgi: [url('https://a/kayitsiz', '0001-01-01T00:00:00Z')] },
      { yontemler: {}, urlBilgi: [url('https://a/kayitsiz', null)] },
    )
    expect(f.urlBilgi[0].degisim).toBe('KAYIT-YOK')
    expect(f.ozetSatirlari).toEqual(['sayfa özeti: 1 adres, 0 değişen, 0 yeni kayıt'])
  })

  it('(e) ⭐ayırt edici: bozuk, eksik ve başka biçimli taban dosyası SESSİZ geçmez (hata kodu döner)', () => {
    expect(tabanOku('x.json', () => { throw new Error('ENOENT') })).toEqual({ hata: 'TABAN-OKUNAMADI' })
    expect(tabanOku('x.json', () => 'bozuk {')).toEqual({ hata: 'TABAN-OKUNAMADI' })
    expect(tabanOku('x.json', () => '{"alinma":"2026-10-11"}')).toEqual({ hata: 'TABAN-BICIMI' })
    expect(tabanOku('x.json', () => 'null')).toEqual({ hata: 'TABAN-BICIMI' })
    const ok = tabanOku('x.json', () => JSON.stringify({ alinma: '2026-10-11', yontemler: {}, urlBilgi: [] }))
    expect('taban' in ok && ok.taban.alinma).toBe('2026-10-11')
  })

  it('(h) boş girdiler çökmez: iki taraf da boşsa yalnız sayfa özeti satırı döner', () => {
    const f = farkUret({}, {})
    expect(f.yontemler).toEqual({})
    expect(f.urlBilgi).toEqual([])
    expect(f.ozetSatirlari).toEqual(['sayfa özeti: 0 adres, 0 değişen, 0 yeni kayıt'])
  })
})
