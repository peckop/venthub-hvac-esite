/**
 * INV-FOY-FONT-1 — föye gömülen yazı tipi dosyaları GERÇEK yazı tipidir (URN-123).
 *
 * ⭐NİÇİN VAR — ölçülmüş vaka, 2026-10-11:
 * `public/fonts/Roboto-Regular.ttf` (308358 bayt) ve `Roboto-Bold.ttf` (308322 bayt) 7 Haziran'dan beri yazı
 * tipi değil HTML'di: ilk baytlar satır sonu + `<!DOCTYPE html>` (commit e0dfa6cae, "CDN 404" onarımı).
 * Canlı sunucu bunları HTTP 200 + `font/ttf` ile veriyordu. `fetch` ret olmadı, `response.ok` doğruydu,
 * gövde jsPDF'e gitti; jsPDF `addFont` hatasını olay yöneticisinde yutar ("No unicode cmap for font") ve
 * PDF yine üretilir. Hiçbir test dosyanın İÇİNE bakmıyordu: `pdfAssets.test.ts` yalnız URL'yi,
 * `pdfGeneratorFallback.test.ts` yalnız ret ve 404'ü sınıyordu — hata tam o boşlukta yaşadı.
 *
 * ⭐CETVEL (yazılı cetvel yok; kural bu kapıdadır, lisans ve kaynak `public/fonts/NOTICE.md`'dedir):
 *   1. `public/fonts` altındaki her `.ttf` sfnt imzası (`00 01 00 00` ya da `true`) ve jsPDF'in okuduğu
 *      tablolarla gelir; HTML, kesik ve CFF (`OTTO`) dosya girmez.
 *   2. Föyün asıl ihtiyacı: ğ Ğ ş Ş ı İ için `cmap`'te boş olmayan glif (0 = `.notdef` = kutu çizilir).
 *   3. `PDF_FONTS` yolları var olan dosyalara çıkar.
 *   4. Lisans (Apache-2.0 tam metin) ve telif bildirimi yazı tiplerinin yanındadır (Apache-2.0 §4a).
 *
 * ⚠KAPI KENDİNİ SINAR: aynı denetleyici HTML gövdeye, kesik dosyaya ve imzası bozulmuş GERÇEK dosyaya
 * verilir ve KIRMIZI vermesi beklenir; yeşil yalnız "denetleyici hep true döner" olasılığını dışlamaz.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { PDF_FONTS, yaziTipiDenetle } from '../../lib/pdfAssets'

const FONT_DIZINI = join(process.cwd(), 'public', 'fonts')
const TURKCE_HARFLER: ReadonlyArray<readonly [string, number]> = [
  ['ğ', 0x011f], ['Ğ', 0x011e], ['ş', 0x015f], ['Ş', 0x015e], ['ı', 0x0131], ['İ', 0x0130],
]

const ttfDosyalari = (): string[] => readdirSync(FONT_DIZINI).filter((ad) => ad.toLowerCase().endsWith('.ttf')).sort()
const oku = (ad: string): Uint8Array => new Uint8Array(readFileSync(join(FONT_DIZINI, ad)))

function tabloKonumu(g: DataView, etiket: string): number {
  const adet = g.getUint16(4)
  for (let i = 0; i < adet; i++) {
    const kayit = 12 + 16 * i
    const ad = String.fromCharCode(g.getUint8(kayit), g.getUint8(kayit + 1), g.getUint8(kayit + 2), g.getUint8(kayit + 3))
    if (ad === etiket) return g.getUint32(kayit + 8)
  }
  throw new Error(`tablo yok: ${etiket}`)
}

/** cmap (platform 3, kodlama 1, biçim 4) üzerinden glif numarası; 0 = tanımsız (.notdef). */
function glifNumarasi(bayt: Uint8Array, kodNoktasi: number): number {
  const g = new DataView(bayt.buffer, bayt.byteOffset, bayt.byteLength)
  const cmap = tabloKonumu(g, 'cmap')
  let altTablo = -1
  for (let i = 0; i < g.getUint16(cmap + 2); i++) {
    const kayit = cmap + 4 + 8 * i
    if (g.getUint16(kayit) === 3 && g.getUint16(kayit + 2) === 1) altTablo = cmap + g.getUint32(kayit + 4)
  }
  if (altTablo < 0) throw new Error('cmap (3,1) alt tablosu yok')
  if (g.getUint16(altTablo) !== 4) throw new Error(`cmap biçimi 4 değil: ${g.getUint16(altTablo)}`)
  const segmentBayti = g.getUint16(altTablo + 6)
  const bitis = altTablo + 14
  const baslangic = bitis + segmentBayti + 2
  const delta = baslangic + segmentBayti
  const aralik = delta + segmentBayti
  for (let s = 0; s < segmentBayti / 2; s++) {
    if (kodNoktasi > g.getUint16(bitis + 2 * s)) continue
    if (kodNoktasi < g.getUint16(baslangic + 2 * s)) return 0
    const ofset = g.getUint16(aralik + 2 * s)
    const d = g.getInt16(delta + 2 * s)
    if (ofset === 0) return (kodNoktasi + d + 65536) % 65536
    const glif = g.getUint16(aralik + 2 * s + ofset + 2 * (kodNoktasi - g.getUint16(baslangic + 2 * s)))
    return glif === 0 ? 0 : (glif + d + 65536) % 65536
  }
  return 0
}

describe('INV-FOY-FONT-1: public/fonts yazı tipi dosyaları gerçek yazı tipidir (URN-123)', () => {
  it('boş evren değil: Roboto Regular ve Bold dizinde durur', () => {
    expect(ttfDosyalari()).toEqual(expect.arrayContaining(['Roboto-Bold.ttf', 'Roboto-Regular.ttf']))
  })

  it.each(ttfDosyalari())('%s: sfnt imzası ve zorunlu tablolar', (ad) => {
    const sonuc = yaziTipiDenetle(oku(ad))
    expect(sonuc, `${ad} yazı tipi değil`).toEqual({ gecerli: true })
  })

  it.each(ttfDosyalari())('%s: ğ Ğ ş Ş ı İ için cmap\'te glif var', (ad) => {
    const bayt = oku(ad)
    const eksik = TURKCE_HARFLER.filter(([, kod]) => glifNumarasi(bayt, kod) === 0).map(([harf]) => harf)
    expect(eksik, `${ad}: bu harflerde glif yok (kutu çizilir)`).toEqual([])
  })

  it('PDF_FONTS yolları public altında var olan dosyalara çıkar', () => {
    for (const yol of [PDF_FONTS.Roboto.regular, PDF_FONTS.Roboto.bold]) {
      expect(existsSync(join(process.cwd(), 'public', yol)), `${yol} depoda yok`).toBe(true)
    }
  })

  it('Apache-2.0 tam metni ve Roboto telif/kaynak bildirimi yazı tiplerinin yanındadır', () => {
    const lisans = readFileSync(join(FONT_DIZINI, 'LICENSE'), 'utf8')
    expect(lisans).toContain('Apache License')
    expect(lisans).toContain('Version 2.0, January 2004')
    expect(lisans).toContain('TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION')
    expect(lisans).toContain('END OF TERMS AND CONDITIONS')
    const bildirim = readFileSync(join(FONT_DIZINI, 'NOTICE.md'), 'utf8')
    expect(bildirim).toContain('Google')
    expect(bildirim).toContain('Apache License, Version 2.0')
    for (const ad of ttfDosyalari()) expect(bildirim, `${ad} bildirimde anılmıyor`).toContain(ad)
  })
})

describe('INV-FOY-FONT-1 sabotaj: kapı bozuk dosyayı geçirmez', () => {
  it('HTTP 200 ile gelen HTML gövde (eski dosyaların biçimi) KIRMIZI', () => {
    const html = Uint8Array.from(Buffer.from('\r\n\r\n\r\n<!DOCTYPE html><html><body>Not Found</body></html>'.repeat(400), 'utf8'))
    expect(yaziTipiDenetle(html).gecerli).toBe(false)
  })

  it('gerçek dosyanın ilk dört baytı bozulursa KIRMIZI', () => {
    const bozuk = oku('Roboto-Regular.ttf')
    bozuk.set([0x0d, 0x0a, 0x0d, 0x0a], 0)
    expect(yaziTipiDenetle(bozuk).gecerli).toBe(false)
  })

  it('gerçek dosya yarıdan kesilirse KIRMIZI', () => {
    const tam = oku('Roboto-Regular.ttf')
    expect(yaziTipiDenetle(tam).gecerli).toBe(true) // boş evren değil: aynı dosya kesilmeden geçerli
    expect(yaziTipiDenetle(tam.subarray(0, Math.floor(tam.byteLength / 2))).gecerli).toBe(false)
  })

  it('cmap tablosu etiketi bozulursa KIRMIZI', () => {
    const bozuk = oku('Roboto-Bold.ttf')
    const g = new DataView(bozuk.buffer, bozuk.byteOffset, bozuk.byteLength)
    const adet = g.getUint16(4)
    for (let i = 0; i < adet; i++) {
      const kayit = 12 + 16 * i
      const ad = String.fromCharCode(g.getUint8(kayit), g.getUint8(kayit + 1), g.getUint8(kayit + 2), g.getUint8(kayit + 3))
      if (ad === 'cmap') bozuk.set([0x78, 0x6d, 0x61, 0x70], kayit) // 'xmap'
    }
    expect(yaziTipiDenetle(bozuk).gecerli).toBe(false)
  })
})
