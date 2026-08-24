import { describe, expect, it } from 'vitest'

import { splitByExistingSku } from '../csvImportGuard'

/**
 * INV-CSV-IMPORT-1 — bilinmeyen SKU sessizce "güncelleme" sayılamaz.
 *
 * `upsert(..., { onConflict: 'sku' })` eşleşme bulamazsa satırı INSERT eder. Yani bir satırı
 * yanlışlıkla `known` saymak, kopya ürün üretmenin tam yoludur — ve ekranda "başarılı
 * import" yazar. Bu testin koruduğu şey bir sayı değil, bir AYRIM: hangi satırın mevcut bir
 * ürüne dokunacağı, hangisinin yeni kayıt doğuracağı.
 */

type Row = { sku?: string | null; name: string }

const ROWS: Row[] = [
  { sku: 'AVE-13056', name: 'var' },
  { sku: 'AVE-42500', name: 'yok — eski kimlik' },
  { sku: 'DAN-80102', name: 'var' },
  { sku: 'AVE-47300', name: 'yok — eski kimlik' },
]
const MEVCUT = new Set(['AVE-13056', 'DAN-80102'])

describe('splitByExistingSku — INV-CSV-IMPORT-1', () => {
  it('(a) mevcut SKU known, olmayan unknown', () => {
    const r = splitByExistingSku(ROWS, MEVCUT)
    expect(r.known.map((x) => x.sku)).toEqual(['AVE-13056', 'DAN-80102'])
    expect(r.unknown.map((x) => x.sku)).toEqual(['AVE-42500', 'AVE-47300'])
    expect(r.unknownSkus).toEqual(['AVE-42500', 'AVE-47300'])
  })

  it('(b) ⭐SKU\'su BOS/EKSIK satir unknown sayilir — known DEGIL', () => {
    // Kanarya: bunu known saymak, SKU'suz satirin sessizce yeni urun yaratmasi demektir.
    const r = splitByExistingSku(
      [{ sku: '', name: 'bos' }, { sku: '   ', name: 'bosluk' }, { name: 'hic yok' } as Row, { sku: null, name: 'null' }],
      MEVCUT
    )
    expect(r.known).toEqual([])
    expect(r.unknown).toHaveLength(4)
    // SKU'su olmayan satirin gosterilecek bir kodu da yok — ornek listesine girmez.
    expect(r.unknownSkus).toEqual([])
  })

  it('(c) SKU bosluklu gelirse kirpilarak eslesir (CSV kaynagi bosluk birakir)', () => {
    const r = splitByExistingSku([{ sku: '  AVE-13056  ', name: 'bosluklu' }], MEVCUT)
    expect(r.known).toHaveLength(1)
    expect(r.unknown).toHaveLength(0)
  })

  it('(d) eslesme TAM dizedir — buyuk/kucuk harf farki unknown yapar', () => {
    // Gevsek eslesme burada iki yonlu tehlikelidir: yanlis urunu gunceller YA DA kopya yaratir.
    const r = splitByExistingSku([{ sku: 'ave-13056', name: 'kucuk harf' }], MEVCUT)
    expect(r.unknown).toHaveLength(1)
  })

  it('(e) ayni bilinmeyen SKU iki kez gecerse ornek listesinde BIR kez gorunur', () => {
    const r = splitByExistingSku(
      [{ sku: 'AVE-42500', name: 'a' }, { sku: 'AVE-42500', name: 'b' }],
      MEVCUT
    )
    expect(r.unknown).toHaveLength(2)      // iki satirin ikisi de yazilacak
    expect(r.unknownSkus).toEqual(['AVE-42500']) // ama kullaniciya bir kez gosterilir
  })

  it('(f) hicbiri bilinmiyorsa known bos doner (yazim tamamen yeni urun uretirdi)', () => {
    const r = splitByExistingSku(ROWS, new Set<string>())
    expect(r.known).toEqual([])
    expect(r.unknown).toHaveLength(4)
  })
})
