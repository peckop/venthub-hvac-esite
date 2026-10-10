/**
 * K3-b ürün segmenti çözücüsü (REC-300 Faz 3b, plan §5 Faz 3 madde 3).
 * Aile / model ayrımı, büyük harfli SKU → 308, bilinmeyen → 404, DB hatası → FIRLATIR (404 DEĞİL).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { modellerdenVeri, yayindaVeriAyarla } from '@/config/__tests__/yayindaTestKiti'

const db = vi.hoisted(() => ({
  modelBySku: vi.fn(),
  familySlugById: vi.fn(),
}))

vi.mock('../preload', () => ({
  getCachedModelBySku: db.modelBySku,
  getCachedFamilySlugById: db.familySlugById,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
}))

import { urunSegmentiniCoz } from '../urunSegmenti'

// URN-31: model sayfası yalnız yayındaki listedeki SKU için vardır; adres metni listeden. Liste kapısı ve slug
// metni (O1) kapıları: urunSegmentiYayinda.test.ts. Bu dosya BİÇİME BAĞLI (`-p-`) örnekleri korur.
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

beforeEach(() => {
  db.modelBySku.mockReset()
  db.familySlugById.mockReset()
  yayindaVeriAyarla(
    modellerdenVeri([
      { aile: 'storm-serisi', sku: 'SEA-61143003', tr: 'storm-10-kanal-fani', en: 'storm-10-duct-fan' },
      { aile: 'storm-serisi', sku: 'SEA-1', tr: 'storm-10', en: 'storm-10' },
      { aile: 'x-serisi', sku: 'A-1', tr: 'x', en: 'x' },
    ]),
  )
})

describe('urunSegmentiniCoz', () => {
  it('-p- yoksa AİLE: DB sorgusu yapılmaz', async () => {
    await expect(urunSegmentiniCoz('storm-serisi', 'tr')).resolves.toEqual({ aileSlug: 'storm-serisi', sunucuSku: null })
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('kanonik model adresi: SKU (büyük harf) → ürün → aile; seçili SKU sunucuya verilir', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'SEA-61143003', family_id: 'fam-1' })
    db.familySlugById.mockResolvedValue('storm-serisi')
    await expect(urunSegmentiniCoz('storm-10-kanal-fani-p-sea-61143003', 'tr')).resolves.toEqual({
      aileSlug: 'storm-serisi',
      sunucuSku: 'SEA-61143003',
    })
    expect(db.modelBySku).toHaveBeenCalledWith('SEA-61143003')
  })

  it('adreste büyük harfli SKU → küçük harfli kanonik adrese 308 (DB\'ye gitmeden)', async () => {
    await expect(urunSegmentiniCoz('storm-10-kanal-fani-p-SEA-61143003', 'tr')).rejects.toThrow(
      'REDIRECT:/tr/urun/storm-10-kanal-fani-p-sea-61143003',
    )
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('adres takma adı (ſ → S): aynı SKU\'ya çözülen ama kanonik olmayan adres 200 DEĞİL, TEK 308 (çürütme bulgu 3)', async () => {
    await expect(urunSegmentiniCoz('storm-10-p-%C5%BFea-1', 'tr')).rejects.toThrow('REDIRECT:/tr/urun/storm-10-p-sea-1')
    await expect(urunSegmentiniCoz('storm-10-p-ſea-1', 'en')).rejects.toThrow('REDIRECT:/en/products/storm-10-p-sea-1')
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('büyük harfli SKU ama yayında DEĞİL → 404 (308 ölü adrese taşımaz), DB\'ye gitmeden', async () => {
    await expect(urunSegmentiniCoz('x-p-YOK-1', 'tr')).rejects.toThrow('NOT_FOUND')
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('metin yanlış VE SKU büyük harf → TEK 308 (iki düzeltme tek sıçrama)', async () => {
    await expect(urunSegmentiniCoz('yanlis-p-SEA-61143003', 'tr')).rejects.toThrow(
      'REDIRECT:/tr/urun/storm-10-kanal-fani-p-sea-61143003',
    )
  })

  it('EN model adresi EN önekiyle 308\'lenir', async () => {
    await expect(urunSegmentiniCoz('storm-10-p-SEA-1', 'en')).rejects.toThrow('REDIRECT:/en/products/storm-10-p-sea-1')
    await expect(urunSegmentiniCoz('storm-10-duct-fan-p-SEA-61143003', 'en')).rejects.toThrow(
      'REDIRECT:/en/products/storm-10-duct-fan-p-sea-61143003',
    )
  })

  it('bilinmeyen SKU → 404', async () => {
    db.modelBySku.mockResolvedValue(null)
    await expect(urunSegmentiniCoz('x-p-yok-1', 'tr')).rejects.toThrow('NOT_FOUND')
  })

  it('ailesiz ürün ya da silinmiş aile → 404', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'A-1', family_id: null })
    await expect(urunSegmentiniCoz('x-p-a-1', 'tr')).rejects.toThrow('NOT_FOUND')
    db.modelBySku.mockResolvedValue({ sku: 'A-1', family_id: 'fam-x' })
    db.familySlugById.mockResolvedValue(null)
    await expect(urunSegmentiniCoz('x-p-a-1', 'tr')).rejects.toThrow('NOT_FOUND')
  })

  it('DB hatası 404\'e ÇEVRİLMEZ — fırlatılır (geçici arıza kalıcı yokluk olarak önbelleğe girmesin)', async () => {
    db.modelBySku.mockRejectedValue(new Error('57014 statement timeout'))
    await expect(urunSegmentiniCoz('x-p-a-1', 'tr')).rejects.toThrow('57014')
  })
})
