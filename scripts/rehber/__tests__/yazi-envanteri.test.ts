/**
 * INV-REHBER-ENVANTER-1 · yazı envanteri betiği (rehber-yazisi-standard.md R1.3; BLG-58, OPS-254).
 *
 * Doğuran ihtiyaç: yeni yazı emrinde "ÖNCEKİ ÇALIŞMA" satırı elle taranıyordu (Kanban, git, canlı site haritası); tablo elle
 * tutulursa bayatlar. Burada sınanan: gerçek `yazilar.ts` ve `docs/mevzuat/kayit.json` ile her yayındaki yazı bir satır olur,
 * mevzuat sütunundaki her kimlik kayıtta vardır, kayıtta kalemi olmayan mevzuat ayrı sütunda görünür, dizin dosyası yoksa
 * sütun "ÖLÇÜLMEDİ" yazar (boş bırakılmaz), bilinmeyen kalem deseni fırlatır. Ağ yok.
 */
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  envanterSatirlari,
  KALEM_DESENLERI,
  markdownTablo,
  mevzuatKalemleri,
  yazilariAyristir,
} from '../yazi-envanteri.mjs'

const KOK = resolve(__dirname, '..', '..', '..')
const kaynak = readFileSync(join(KOK, 'src/data/bilgiMerkezi/yazilar.ts'), 'utf8')
const kayit = JSON.parse(readFileSync(join(KOK, 'docs/mevzuat/kayit.json'), 'utf8'))
const kimlikler = new Set<string>(kayit.kalemler.map((k: { kimlik: string }) => k.kimlik))
const yazilar = yazilariAyristir(kaynak)

describe('INV-REHBER-ENVANTER-1 · ayrıştırma (gerçek yazilar.ts)', () => {
  it('her yayındaki yazı bir kayıt olur; kimlik sayısı yazilar.ts içindeki kimlik satırı sayısına eşit', () => {
    const beklenen = (kaynak.match(/^\s{4}kimlik:\s*'[^']+'/gm) || []).length
    expect(beklenen).toBeGreaterThan(10)
    expect(yazilar).toHaveLength(beklenen)
    for (const y of yazilar) {
      expect(y.slug, y.kimlik).not.toBe('')
      expect(y.konu, y.kimlik).toMatch(/^(konfor|guvenlik|verimlilik)$/)
      expect(y.yayinTarihi, y.kimlik).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(y.h1, y.kimlik).not.toBe('')
      expect(y.govde.length, y.kimlik).toBeGreaterThan(500)
    }
  })

  it('ürün ve kategori kimlikleri vh: önekli diziden okunur', () => {
    const cati = yazilar.find((y: { kimlik: string }) => y.kimlik === 'cati-tipi-fan-nedir')
    expect(cati.urunler).toEqual(['vh:aile/vortice-slimroof-cati-fanlari'])
    expect(cati.kategoriler).toEqual(['vh:kategori/roof-fans'])
  })

  it('çok satırlı kategori dizisi (fan-cesitleri) tam okunur', () => {
    const f = yazilar.find((y: { kimlik: string }) => y.kimlik === 'fan-cesitleri')
    expect(f.kategoriler.length).toBeGreaterThanOrEqual(6)
    expect(f.kategoriler).toContain('vh:kategori/cabinet-fans')
  })
})

describe('INV-REHBER-ENVANTER-1 · mevzuat sütunu', () => {
  const satirlar = envanterSatirlari(yazilar, kimlikler, null)
  const sat = (k: string) => satirlar.find((s: { kimlik: string }) => s.kimlik === k)

  it('her desen kimliği kayit.json içinde vardır (kayıtta olmayan kimlik desene yazılamaz)', () => {
    for (const d of KALEM_DESENLERI) if (d.kayit) expect(kimlikler.has(d.kayit), d.kayit).toBe(true)
  })

  it('patlayıcı ortam yazısı ATEX kalemlerini, mevzuatsız yazılar boş liste verir', () => {
    expect(sat('patlayici-ortamda-fan-secimi-atex').mevzuat).toEqual(
      expect.arrayContaining(['AB-2014/34', 'TR-YON-ATEX-2014/34', 'AB-1999/92', 'TR-YON-ATEX-1999/92']),
    )
    for (const k of ['kanal-tipi-fan-nedir', 'plug-fan-nedir', 'cati-tipi-fan-nedir', 'hucreli-aspirator-nedir']) {
      expect(sat(k).mevzuat, k).toEqual([])
      expect(sat(k).mevzuatKayittaYok, k).toEqual([])
    }
  })

  it('kayıtta kalemi olmayan mevzuat (imar, BEP) banyo yazısında AYRI sütunda görünür (BLG-57 bulgusu)', () => {
    const b = sat('banyo-tuvalet-fani-secimi')
    expect(b.mevzuat).toEqual([])
    expect(b.mevzuatKayittaYok.join(' ')).toMatch(/İmar/)
    expect(b.mevzuatKayittaYok.join(' ')).toMatch(/Enerji Performansı/)
  })

  it('RG numarası ile anılan TR kalemleri de yakalanır (frekans: 31468 → SGM-2021/16, 31526 → SGM-2021/23)', () => {
    expect(sat('frekans-konvertoru').mevzuat).toEqual(expect.arrayContaining(['TR-SGM-2021/16', 'TR-SGM-2021/23']))
  })

  it('desen kimliği kayıtta yoksa FIRLATIR', () => {
    expect(() => mevzuatKalemleri('2024/1834 ile ilgili', new Set(['AB-327/2011']))).toThrow(/kayıtta yok/)
    expect(mevzuatKalemleri('2024/1834 ile ilgili', new Set(['AB-2024/1834'])).kalemler).toEqual(['AB-2024/1834'])
  })

  it('desen sınırı: 2019/1781 içindeki 2019/17.. 2019/15 olarak okunmaz', () => {
    expect(mevzuatKalemleri('Tüzük 2019/1781 geçerli', new Set(['AB-2019/1781', 'TR-SVGM-2019/15'])).kalemler).toEqual(['AB-2019/1781'])
  })
})

describe('INV-REHBER-ENVANTER-1 · dizin sütunu ve tablo', () => {
  it('dizin dosyası yoksa ÖLÇÜLMEDİ (boş bırakılmaz); dosyada olmayan yazı KAYITSIZ', () => {
    for (const s of envanterSatirlari(yazilar, kimlikler, null)) expect(s.dizin, s.kimlik).toBe('ÖLÇÜLMEDİ')
    const d = envanterSatirlari(yazilar, kimlikler, { 'cati-tipi-fan-nedir': { bing: 'gönderildi', google: 'bekliyor', sira: '12' } })
    expect(d.find((s: { kimlik: string }) => s.kimlik === 'cati-tipi-fan-nedir').dizin).toEqual({ bing: 'gönderildi', google: 'bekliyor', sira: '12' })
    expect(d.find((s: { kimlik: string }) => s.kimlik === 'plug-fan-nedir').dizin).toMatch(/KAYITSIZ/)
  })

  it('markdown tablo: başlık + ayraç + yazı başına tek satır; dizin hücresi sorgu verisi içermez, durumları yazar', () => {
    const d = envanterSatirlari(yazilar, kimlikler, { 'cati-tipi-fan-nedir': { bing: 'gönderildi', google: 'bekliyor', sira: '12' } })
    const md = markdownTablo(d)
    const satirlar = md.trim().split('\n')
    expect(satirlar).toHaveLength(yazilar.length + 2)
    expect(satirlar[0]).toMatch(/Dizin \/ sıra/)
    expect(md).toMatch(/G: bekliyor · B: gönderildi · sıra: 12/)
  })
})
