/**
 * K3-b ürün segmenti çözücüsü (REC-300 Faz 3b, plan §5 Faz 3 madde 3).
 * Aile / model ayrımı, büyük harfli SKU → 308, bilinmeyen → 404, DB hatası → FIRLATIR (404 DEĞİL).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

beforeEach(() => {
  db.modelBySku.mockReset()
  db.familySlugById.mockReset()
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
    await expect(urunSegmentiniCoz('storm-10-p-SEA-61143003', 'tr')).rejects.toThrow(
      'REDIRECT:/tr/urun/storm-10-p-sea-61143003',
    )
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('EN model adresi EN önekiyle 308\'lenir', async () => {
    await expect(urunSegmentiniCoz('storm-10-p-SEA-1', 'en')).rejects.toThrow('REDIRECT:/en/products/storm-10-p-sea-1')
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
