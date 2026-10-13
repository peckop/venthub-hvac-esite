/**
 * INV-KARNE-FARK-1 · Bot karnesinde iki koşu arası FARK (Kanban SEO-44; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md bot kalitesi karnesi satırı).
 *
 * Kilitlenenler: yeni ve giden sorun AYRI listelenir; adres eşleşmesi `tur + adres`tir (aynı adres iki türde
 * karışmaz); değişmeyen adres fark satırına girmez; sınıf farkı işaretlidir; bozuk önceki karne sessiz geçmez.
 */
import { describe, it, expect } from 'vitest'
import { karneFarki, oncekiKarneOku } from '../bot-karnesi.mjs'

type Satir = { tur: string; adres: string; sorunlar: string[]; durum?: number | null; son?: string; baslik?: string; markaBag?: number; jsonld?: string[] }
const satir = (tur: string, adres: string, sorunlar: string[] = [], extra: Partial<Satir> = {}): Satir => ({ tur, adres, sorunlar, durum: 200, son: adres, baslik: 'B', markaBag: 1, jsonld: ['Product'], ...extra })

describe('INV-KARNE-FARK-1', () => {
  it('(a) ⭐ayırt edici: yeni sorun ve giden sorun AYRI listelenir', () => {
    const onceki = { satirlar: [satir('aile-urun', '/tr/products/a', ['H1-SAYISI 2', 'ACIKLAMA-YOK'])] }
    const simdi = { satirlar: [satir('aile-urun', '/tr/products/a', ['ACIKLAMA-YOK', 'MARKA-BAGLANTISI-YOK'])] }
    const f = karneFarki(onceki, simdi)
    expect(f.degisen).toHaveLength(1)
    expect(f.degisen[0].yeniSorun).toEqual(['MARKA-BAGLANTISI-YOK'])
    expect(f.degisen[0].gidenSorun).toEqual(['H1-SAYISI 2'])
    expect(f.ozetSatirlari.join('\n')).toContain('YENİ SORUN: MARKA-BAGLANTISI-YOK')
    expect(f.ozetSatirlari.join('\n')).toContain('GİTTİ: H1-SAYISI 2')
  })

  it('(b) ⭐ayırt edici: eklenen ve çıkan adres, eşleşme tur + adrestir (aynı adres farklı türde karışmaz)', () => {
    const onceki = { satirlar: [satir('kategori', '/tr/x'), satir('aile-urun', '/tr/eski')] }
    const simdi = { satirlar: [satir('kategori', '/tr/x'), satir('aile-urun', '/tr/yeni', ['HARITADA-YOK']), satir('marka', '/tr/x')] }
    const f = karneFarki(onceki, simdi)
    expect(f.eklenen.map((e: { tur: string; adres: string }) => `${e.tur} ${e.adres}`).sort()).toEqual(['aile-urun /tr/yeni', 'marka /tr/x'])
    expect(f.cikan.map((e: { tur: string; adres: string }) => `${e.tur} ${e.adres}`)).toEqual(['aile-urun /tr/eski'])
    expect(f.degisen).toEqual([])
    expect(f.ozetSatirlari.join('\n')).toContain('EKLENDI aile-urun /tr/yeni · HARITADA-YOK')
  })

  it('(c) değişmeyen adres fark satırına girmez; hiçbir şey değişmediyse özet satırı sıfır sayar', () => {
    const k = { satirlar: [satir('ana', '/tr', []), satir('kategori', '/tr/x', ['H1-SAYISI 0'])] }
    const f = karneFarki(k, JSON.parse(JSON.stringify(k)))
    expect(f.degisen).toEqual([])
    expect(f.eklenen).toEqual([])
    expect(f.cikan).toEqual([])
    expect(f.sinifFarki).toEqual({})
    expect(f.ozetSatirlari).toHaveLength(1)
    expect(f.ozetSatirlari[0]).toContain('eklenen 0 · çıkan 0 · değişen 0')
  })

  it('(d) ⭐ayırt edici: sorun sınıfı farkı işaretli (+/−) ve yalnız değişen sınıf yazılır', () => {
    const onceki = { satirlar: [satir('a', '/1', ['H1-SAYISI 2']), satir('a', '/2', ['H1-SAYISI 0']), satir('a', '/3', ['ACIKLAMA-YOK'])] }
    const simdi = { satirlar: [satir('a', '/1', ['H1-SAYISI 1']), satir('a', '/2', []), satir('a', '/3', ['ACIKLAMA-YOK']), satir('a', '/4', ['HARITADA-YOK'])] }
    const f = karneFarki(onceki, simdi)
    expect(f.sinifFarki['H1-SAYISI']).toEqual({ once: 2, simdi: 1, fark: -1 })
    expect(f.sinifFarki['HARITADA-YOK']).toEqual({ once: 0, simdi: 1, fark: 1 })
    expect(f.sinifFarki['ACIKLAMA-YOK']).toBeUndefined()
    expect(f.ozetSatirlari.join('\n')).toContain('sınıf H1-SAYISI: 2 → 1 (-1)')
    expect(f.ozetSatirlari.join('\n')).toContain('sınıf HARITADA-YOK: 0 → 1 (+1)')
  })

  it('(e) ⭐ayırt edici: bozuk, eksik ve başka biçimli önceki karne SESSİZ geçmez (hata kodu döner)', () => {
    expect(oncekiKarneOku('k.json', () => { throw new Error('ENOENT') })).toEqual({ hata: 'ONCEKI-OKUNAMADI' })
    expect(oncekiKarneOku('k.json', () => 'bozuk {')).toEqual({ hata: 'ONCEKI-OKUNAMADI' })
    expect(oncekiKarneOku('k.json', () => '{"taban":"x"}')).toEqual({ hata: 'ONCEKI-BICIMI' })
    expect(oncekiKarneOku('k.json', () => '{"satirlar":{}}')).toEqual({ hata: 'ONCEKI-BICIMI' })
    const ok = oncekiKarneOku('k.json', () => JSON.stringify({ olculme: '2026-10-09', satirlar: [] }))
    expect('karne' in ok && ok.karne.olculme).toBe('2026-10-09')
  })

  it('(f) ORNEK-YOK satırı sessiz kalmaz: eklenen listesinde sorun metniyle görünür', () => {
    const onceki = { satirlar: [satir('model', '/tr/products/a-p-b')] }
    const simdi = { satirlar: [satir('model', '(örnek yok)', ['ORNEK-YOK model (site haritasında bu türün adresi bulunamadı)'])] }
    const f = karneFarki(onceki, simdi)
    expect(f.eklenen).toHaveLength(1)
    expect(f.cikan).toHaveLength(1)
    expect(f.ozetSatirlari.join('\n')).toContain('ORNEK-YOK model')
  })

  it('(g) alan değişimi (durum, son adres, başlık, marka bağlantısı, JSON-LD) satırda gösterilir; JSON-LD sırası fark değildir', () => {
    const onceki = { satirlar: [satir('aile-urun', '/tr/p', [], { durum: 200, son: '/tr/p', baslik: 'Eski', markaBag: 1, jsonld: ['Product', 'BreadcrumbList'] })] }
    const simdi = { satirlar: [satir('aile-urun', '/tr/p', [], { durum: 200, son: '/tr/p', baslik: 'Yeni', markaBag: 0, jsonld: ['BreadcrumbList', 'Product'] })] }
    const f = karneFarki(onceki, simdi)
    expect(f.degisen[0].alanlar.baslik).toEqual({ once: 'Eski', simdi: 'Yeni' })
    expect(f.degisen[0].alanlar.markaBag).toEqual({ once: 1, simdi: 0 })
    expect(f.degisen[0].alanlar.jsonld).toBeUndefined()
    const sadeceSira = karneFarki(
      { satirlar: [satir('x', '/a', [], { jsonld: ['Product', 'BreadcrumbList'] })] },
      { satirlar: [satir('x', '/a', [], { jsonld: ['BreadcrumbList', 'Product'] })] },
    )
    expect(sadeceSira.degisen).toEqual([])
  })
})
