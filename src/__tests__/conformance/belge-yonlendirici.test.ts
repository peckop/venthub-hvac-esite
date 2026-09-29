/**
 * INV-BELGE-2 — konu yönlendirici (`docs/standards/belge-yonetimi-standard.md` B6, REC-400 D4).
 *
 * NİÇİN VAR: yönlendirici saf bir fonksiyon; kancanın (ARAÇ) çağıracağı sözleşme burada kilitlenir.
 * Gürültü üreten bir yönlendirici her mesajda ötüp görmezden gelinir, sessiz kalan hiç işe yaramaz:
 * iki yön de ölçülür.
 *
 * ÖLÇÜLEN: (1) gerçek belge haritasından satır çıkar; (2) katalog sorusu katalog cetvelini bulur;
 * (3) alakasız istem SESSİZ kalır; (4) en çok 2 sonuç, tekrarsız yol; (5) saflık (aynı girdi, aynı çıktı);
 * (6) SABOTAJ: eşik 0'a inerse alakasız istem de eşleşir (kapı kör kalmaz).
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Satir = { soru: string; yol: string }
type Sonuc = { yol: string; puan: number; ortak: string[] }
type Yonl = {
  satirlariCikar: (m: string) => Satir[]
  konuYonlendir: (g: { istem: string; satirlar: Satir[]; maks?: number; esik?: number }) => Sonuc[]
  katla: (m: string) => string
}

const kok = path.resolve(__dirname, '..', '..', '..')
const yonl = createRequire(import.meta.url)(path.join(kok, 'scripts', 'belge', 'konu-yonlendirici.cjs')) as Yonl
const readme = fs.readFileSync(path.join(kok, 'docs', 'README.md'), 'utf8')
const satirlar = yonl.satirlariCikar(readme)

describe('INV-BELGE-2 konu yönlendirici', () => {
  it('gerçek belge haritasından satır çıkarır ve her satırın yolu dolu', () => {
    expect(satirlar.length).toBeGreaterThan(8)
    for (const s of satirlar) {
      expect(s.soru.length).toBeGreaterThan(3)
      expect(s.yol.length).toBeGreaterThan(3)
    }
  })

  it('katalog PDF sorusu katalog kaynak cetvelini bulur', () => {
    const r = yonl.konuYonlendir({ istem: 'Katalog PDF içinde ne yazıyor?', satirlar })
    expect(r.length).toBeGreaterThan(0)
    expect(r.some((s) => s.yol.includes('catalog-ingestion-standard'))).toBe(true)
  })

  it('ölçüm defteri sorusu (e-fatura, muhasebe) olcum/README.md yolunu bulur', () => {
    const r = yonl.konuYonlendir({ istem: 'e-Fatura ve muhasebe için daha önce ölçüldü mü, tekrar ölçelim mi?', satirlar })
    expect(r.some((s) => s.yol.startsWith('olcum/'))).toBe(true)
  })

  it('alakasız istem SESSİZ kalır (gürültü üretmez)', () => {
    expect(yonl.konuYonlendir({ istem: 'merhaba nasılsın bugün hava güzel', satirlar })).toEqual([])
    expect(yonl.konuYonlendir({ istem: 'evet', satirlar })).toEqual([])
    expect(yonl.konuYonlendir({ istem: '', satirlar })).toEqual([])
  })

  it('en çok 2 sonuç ve tekrarsız yol', () => {
    const r = yonl.konuYonlendir({
      istem: 'katalog ürün fiyat cetvel belge ölçüm hangi kaynak standart yazı rehber araç',
      satirlar,
      maks: 2,
    })
    expect(r.length).toBeLessThanOrEqual(2)
    expect(new Set(r.map((s) => s.yol)).size).toBe(r.length)
  })

  it('saf: aynı girdi aynı çıktı, girdiyi değiştirmez', () => {
    const kopya = JSON.stringify(satirlar)
    const a = yonl.konuYonlendir({ istem: 'katalog PDF ürün fiyat', satirlar })
    const b = yonl.konuYonlendir({ istem: 'katalog PDF ürün fiyat', satirlar })
    expect(a).toEqual(b)
    expect(JSON.stringify(satirlar)).toBe(kopya)
  })

  it('Türkçe harf katlama: İ/ı/ş/ğ/ü/ö/ç eşleşmeyi bozmaz', () => {
    expect(yonl.katla('ÖLÇÜM İŞLEMİ ŞIĞ')).toBe('olcum islemi sig')
  })

  it('SABOTAJ: eşik 0 yapılırsa alakasız istem de eşleşir (varsayılan eşik ayırt edici)', () => {
    const gevsek = yonl.konuYonlendir({ istem: 'merhaba nasılsın bugün hava güzel', satirlar, esik: 0 })
    const sikI = yonl.konuYonlendir({ istem: 'merhaba nasılsın bugün hava güzel', satirlar })
    expect(gevsek.length).toBeGreaterThan(sikI.length)
  })
})
