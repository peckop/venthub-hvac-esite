import { describe, expect, it, vi } from 'vitest'

import { SITE_URL } from '../../config/siteUrl'
import { getAbsoluteAssetUrl, standartYaziTipiMetni, yaziTipiDenetle } from '../pdfAssets'

describe('getAbsoluteAssetUrl', () => {
  it('should prepend browser origin when window is defined', () => {
    const mockWindow = {
      location: {
        origin: 'https://venthub-hvac.com',
      },
    }
    vi.stubGlobal('window', mockWindow)

    const url = getAbsoluteAssetUrl('/fonts/Roboto-Regular.ttf')
    expect(url).toBe('https://venthub-hvac.com/fonts/Roboto-Regular.ttf')

    vi.unstubAllGlobals()
  })

  it('should use SITE_URL when window is undefined', () => {
    vi.stubGlobal('window', undefined)

    const url = getAbsoluteAssetUrl('/fonts/Roboto-Regular.ttf')
    const expected = new URL('/fonts/Roboto-Regular.ttf', SITE_URL).toString()
    expect(url).toBe(expected)

    vi.unstubAllGlobals()
  })
})

// URN-123 — `public/fonts/Roboto-*.ttf` 7 Haziran'dan 11 Ekim'e kadar HTML'di ve HTTP 200 ile servis ediliyordu.
// `response.ok` bu kusuru göremez; kapı dosyanın KENDİSİNE bakar. Fikstür sfnt başlığını ve tablo dizinini
// elle kurar (gerçek dosyalar için bkz. src/__tests__/conformance/foy-yazi-tipi-imza.test.ts).
const SFNT_SURUM_1 = 0x00010000
const SFNT_TRUE = 0x74727565
const SFNT_OTTO = 0x4f54544f
const TUM_TABLOLAR = ['cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp']

function sfntUret(imza: number, tablolar: readonly string[], kes?: number): Uint8Array {
  const dizinSonu = 12 + 16 * tablolar.length
  const bayt = new Uint8Array(dizinSonu + 8 * tablolar.length)
  const gorunum = new DataView(bayt.buffer)
  gorunum.setUint32(0, imza)
  gorunum.setUint16(4, tablolar.length)
  tablolar.forEach((etiket, i) => {
    const kayit = 12 + 16 * i
    for (let k = 0; k < 4; k++) gorunum.setUint8(kayit + k, etiket.charCodeAt(k))
    gorunum.setUint32(kayit + 8, dizinSonu + 8 * i)
    gorunum.setUint32(kayit + 12, 8)
  })
  return kes === undefined ? bayt : bayt.subarray(0, kes)
}

describe('yaziTipiDenetle (URN-123)', () => {
  it('sfnt 1.0 başlığı ve zorunlu tablolar: geçerli', () => {
    expect(yaziTipiDenetle(sfntUret(SFNT_SURUM_1, TUM_TABLOLAR))).toEqual({ gecerli: true })
  })

  it("Apple 'true' başlığı: geçerli", () => {
    expect(yaziTipiDenetle(sfntUret(SFNT_TRUE, TUM_TABLOLAR))).toEqual({ gecerli: true })
  })

  it('HTTP 200 ile gelen HTML hata sayfası (eski dosyanın biçimi) reddedilir ve ilk baytlar yazılır', () => {
    const html = Uint8Array.from(Buffer.from('\r\n\r\n\r\n<!DOCTYPE html><html><body>404</body></html>', 'utf8'))
    const sonuc = yaziTipiDenetle(html)
    expect(sonuc.gecerli).toBe(false)
    if (!sonuc.gecerli) expect(sonuc.sebep).toContain('0d0a0d0a')
  })

  it("CFF ('OTTO') reddedilir: jsPDF glyf/loca okur", () => {
    const sonuc = yaziTipiDenetle(sfntUret(SFNT_OTTO, ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'CFF ']))
    expect(sonuc.gecerli).toBe(false)
  })

  it('çok kısa ve boş gövde reddedilir', () => {
    expect(yaziTipiDenetle(new Uint8Array(0)).gecerli).toBe(false)
    expect(yaziTipiDenetle(new Uint8Array([0, 1, 0, 0, 0]))).toMatchObject({ gecerli: false })
  })

  it('tablo sayısı sıfırsa dizin bozuk sayılır', () => {
    expect(yaziTipiDenetle(sfntUret(SFNT_SURUM_1, []))).toMatchObject({ gecerli: false })
  })

  it.each(TUM_TABLOLAR)('zorunlu tablo eksikse reddedilir (%s)', (eksik) => {
    const sonuc = yaziTipiDenetle(sfntUret(SFNT_SURUM_1, TUM_TABLOLAR.filter((t) => t !== eksik)))
    expect(sonuc.gecerli).toBe(false)
    if (!sonuc.gecerli) expect(sonuc.sebep).toContain(eksik)
  })

  it('kesik dosya (tablo konumu dosya sınırını aşar) reddedilir', () => {
    const tam = sfntUret(SFNT_SURUM_1, TUM_TABLOLAR)
    expect(yaziTipiDenetle(tam).gecerli).toBe(true) // boş evren değil: aynı fikstür kesilmeden geçerli
    expect(yaziTipiDenetle(sfntUret(SFNT_SURUM_1, TUM_TABLOLAR, tam.byteLength - 20))).toMatchObject({ gecerli: false })
  })
})

describe('standartYaziTipiMetni (URN-123, yedek yol)', () => {
  it('WinAnsi dışı altı Türkçe harf ASCII karşılığına çevrilir', () => {
    expect(standartYaziTipiMetni('ğĞşŞıİ')).toBe('gGsSiI')
  })

  it('WinAnsi içindeki Türkçe harflere (ö ü ç) ve diğer metne dokunmaz', () => {
    expect(standartYaziTipiMetni('Çalışma Özelliği ürün 35 m³/h')).toBe('Çalisma Özelligi ürün 35 m³/h')
  })

  it('ASCII metin değişmez', () => {
    expect(standartYaziTipiMetni('Technical Datasheet')).toBe('Technical Datasheet')
  })
})
