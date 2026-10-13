/**
 * INV-GSC-SAYFA-OKU-1 · Tek sayfa Search Console okumasının ağsız parçaları (Kanban SEO-41; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md ve pazar-olcum-standard.md P2/P6).
 *
 * Kilitlenenler: yol tam adrese çevrilir, taban dışı alan adı reddedilir; veri olmayan gün 0 ile dolar ama
 * `veriGunu` gerçek gün sayısını söyler; son 3 gün ön veri pencerenin dışındadır; hata yanıtı sessiz sıfıra
 * çevrilmez (denetim ve gösterim ayrı ayrı "ölçülemedi"); depo içi çıktı yolu reddedilir.
 */
import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import {
  adresNormalle, adresListesi, gunlukSeri, ozetSatir, sorunlu, ciktiYoluKontrol, okuSayfa,
} from '../gsc-sayfa-oku.mjs'
import { donem } from '../../rehber/gsc-taban.mjs'

const TABAN = 'https://venthub.com.tr'
const D = { startDate: '2026-10-01', endDate: '2026-10-07' }

const yanitOk = (b: unknown, ok = true) => ({ ok, status: ok ? 200 : 403, json: async () => b })
const denetimYaniti = (kanonik = 'https://venthub.com.tr/tr/x', sonTarama = '2026-10-11T17:56:00Z') => ({
  inspectionResult: { indexStatusResult: {
    verdict: 'PASS', coverageState: 'Submitted and indexed', pageFetchState: 'SUCCESSFUL', robotsTxtState: 'ALLOWED',
    indexingState: 'INDEXING_ALLOWED', lastCrawlTime: sonTarama, crawledAs: 'MOBILE', googleCanonical: kanonik,
  } },
})

describe('INV-GSC-SAYFA-OKU-1', () => {
  it('(a) yol tam adrese çevrilir, parça (#) atılır, tekrarlar tekilleşir', () => {
    expect(adresNormalle('/tr/bilgi-merkezi/x', TABAN)).toBe('https://venthub.com.tr/tr/bilgi-merkezi/x')
    expect(adresNormalle('https://venthub.com.tr/tr/y#baslik', TABAN)).toBe('https://venthub.com.tr/tr/y')
    expect(adresListesi('/tr/a, https://venthub.com.tr/tr/a ,/tr/b', TABAN)).toEqual([
      'https://venthub.com.tr/tr/a', 'https://venthub.com.tr/tr/b',
    ])
  })

  it('(b) ⭐ayırt edici: taban dışı alan adı ve boş adres reddedilir', () => {
    expect(() => adresNormalle('https://ornek.com/tr/x', TABAN)).toThrow(/taban dışı/)
    expect(() => adresNormalle('https://www.venthub.com.tr/tr/x', TABAN)).toThrow(/taban dışı/)
    expect(() => adresNormalle('  ', TABAN)).toThrow(/boş adres/)
    expect(() => adresNormalle('ftp://venthub.com.tr/x', TABAN)).toThrow()
  })

  it('(b2) ⭐ayırt edici: Git Bash yol dönüşümü (C:/Program Files/Git/tr/x) ipucuyla reddedilir, yanlış adres okunmaz', () => {
    expect(() => adresNormalle('C:/Program Files/Git/tr/bilgi-merkezi/x', TABAN)).toThrow(/MSYS_NO_PATHCONV/)
  })

  it('(c) ⭐ayırt edici: veri olmayan gün 0 ile dolar, ilk/son gösterim günü ve veriGunu doğru', () => {
    const rows = [
      { keys: ['https://venthub.com.tr/tr/x', '2026-10-03'], clicks: 0, impressions: 4, position: 12 },
      { keys: ['https://venthub.com.tr/tr/x', '2026-10-06'], clicks: 1, impressions: 6, position: 8 },
    ]
    const s = gunlukSeri(rows, D)
    expect(s.gunler).toHaveLength(7)
    expect(s.gunler.map((g: { gosterim: number }) => g.gosterim)).toEqual([0, 0, 4, 0, 0, 6, 0])
    expect(s.ilkGosterim).toBe('2026-10-03')
    expect(s.sonGosterim).toBe('2026-10-06')
    expect(s.gosterimGunu).toBe(2)
    expect(s.veriGunu).toBe(2)
    expect(s.toplam).toEqual({ tik: 1, gosterim: 10, ortSira: 9.6 })
  })

  it('(c2) hiç satır yoksa gösterim 0, ilk gösterim null, sıra null', () => {
    const s = gunlukSeri([], D)
    expect(s.toplam).toEqual({ tik: 0, gosterim: 0, ortSira: null })
    expect(s.ilkGosterim).toBeNull()
    expect(s.veriGunu).toBe(0)
  })

  it('(e) ⭐ayırt edici: son 3 gün ön veri pencerenin dışında, pencere tam n gün', () => {
    const d = donem(new Date('2026-10-13T12:00:00Z'), 28)
    expect(d.endDate).toBe('2026-10-10')
    const s = gunlukSeri([], d)
    expect(s.gunler).toHaveLength(28)
    expect(s.gunler[s.gunler.length - 1].tarih).toBe('2026-10-10')
    expect(s.gunler.some((g: { tarih: string }) => g.tarih > '2026-10-10')).toBe(false)
  })

  it('(d) ⭐ayırt edici: denetim hatası ve gösterim hatası sessiz sıfır değil, ayrı ayrı ölçülemedi', async () => {
    const cagrilar: string[] = []
    const fetchFn = async (url: string) => {
      cagrilar.push(url)
      return url.includes('urlInspection')
        ? yanitOk({ error: { code: 403, message: 'yetki yok' } }, false)
        : yanitOk({ error: { code: 429, message: 'kota' } }, false)
    }
    const k = await okuSayfa('https://venthub.com.tr/tr/x', { jeton: 'x', d: D, fetchFn: fetchFn as never })
    expect(cagrilar).toHaveLength(2)
    expect(k.denetim.hata).toContain('403')
    expect(k.seri.hata).toContain('429')
    expect(sorunlu(k)).toBe(true)
    const satir = ozetSatir(k)
    expect(satir).toContain('denetim ölçülemedi')
    expect(satir).toContain('gösterim ölçülemedi')
    expect(satir).not.toMatch(/gösterim 0\b/)
  })

  it('(g) ağ hatası yakalanır, çökmez, sorunlu sayılır', async () => {
    const fetchFn = async () => { throw new Error('ECONNRESET') }
    const k = await okuSayfa('https://venthub.com.tr/tr/x', { jeton: 'x', d: D, fetchFn: fetchFn as never })
    expect(k.denetim.hata).toContain('ag')
    expect(k.seri.hata).toContain('ag')
    expect(sorunlu(k)).toBe(true)
  })

  it('(h) başarılı akış: sayfa filtresi gövdede, jeton gövdede/çıktıda yok, kanonik farkı satıra yazılır', async () => {
    const gonderilen: { url: string; body: string; auth: string }[] = []
    const fetchFn = async (url: string, init: { body: string; headers: Record<string, string> }) => {
      gonderilen.push({ url, body: init.body, auth: init.headers.authorization })
      return url.includes('urlInspection')
        ? yanitOk(denetimYaniti('https://venthub.com.tr/tr/BASKA'))
        : yanitOk({ rows: [{ keys: ['https://venthub.com.tr/tr/x', '2026-10-05'], clicks: 2, impressions: 9, position: 5 }] })
    }
    const k = await okuSayfa('https://venthub.com.tr/tr/x', { jeton: 'GIZLI-JETON-DEGERI', d: D, fetchFn: fetchFn as never })
    const analitik = gonderilen.find((g) => g.url.includes('searchAnalytics'))!
    expect(JSON.parse(analitik.body).dimensionFilterGroups[0].filters[0]).toEqual({
      dimension: 'page', operator: 'equals', expression: 'https://venthub.com.tr/tr/x',
    })
    expect(JSON.parse(analitik.body).dataState).toBe('final')
    expect(sorunlu(k)).toBe(false)
    const satir = ozetSatir(k)
    expect(satir).toContain('gösterim 9 (1 gün)')
    expect(satir).toContain('Google kanoniği BAŞKA')
    expect(satir).not.toContain('GIZLI-JETON-DEGERI')
    expect(JSON.stringify(k)).not.toContain('GIZLI-JETON-DEGERI')
  })

  it('(f) ⭐ayırt edici: depo içi çıktı yolu reddedilir; yok sayılıyorsa ya da depo dışıysa izinli', () => {
    const kok = resolve('/depo-koku-test')
    expect(ciktiYoluKontrol(undefined, kok, false).gecerli).toBe(false)
    expect(ciktiYoluKontrol(resolve(kok, 'tmp', 'x'), kok, false).gecerli).toBe(false)
    expect(ciktiYoluKontrol(resolve(kok, 'tmp', 'x'), kok, true).gecerli).toBe(true)
    expect(ciktiYoluKontrol(resolve('/baska-yer/arsiv'), kok, false).gecerli).toBe(true)
  })
})
