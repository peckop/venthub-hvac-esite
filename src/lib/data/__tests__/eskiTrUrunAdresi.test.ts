/**
 * Eski TR ürün adresi (`/tr/products/<x>`) bayrak AÇIKKEN (REC-300 Faz 3b-2, plan madde 5, v4 Y4):
 * her çözülebilir aile / seri / model / varyant / takma ad → yeni adrese TEK 308; bulunamadı → 404;
 * veri katmanına ulaşılamadı → FIRLATIR (200 "bulunamadı" görünümü de, kalıcı 404 de değil).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  modelBySku: vi.fn(),
  familySlugById: vi.fn(),
  cozum: vi.fn(),
}))

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
}))

vi.mock('../preload', () => ({
  getCachedModelBySku: db.modelBySku,
  getCachedFamilySlugById: db.familySlugById,
  getFamilyDetailForRoute: vi.fn(),
  getCachedSeriesLanding: vi.fn(),
  getCachedProductBySlug: vi.fn(),
  getCachedTakmaAd: vi.fn(),
  getCachedVariantById: vi.fn(),
}))

vi.mock('../productRoute', () => ({ resolveProductRoute: db.cozum }))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
}))

import { eskiTrUrunAdresiniYonlendir } from '../urunSegmenti'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('eskiTrUrunAdresiniYonlendir', () => {
  it('aile slug\'ı → /tr/urun/<aile>', async () => {
    db.cozum.mockResolvedValue({ kind: 'family', detail: {} })
    await expect(eskiTrUrunAdresiniYonlendir('storm-serisi')).rejects.toThrow('REDIRECT:/tr/urun/storm-serisi')
    expect(db.cozum).toHaveBeenCalledWith('storm-serisi', 'tr', expect.any(Object))
  })

  it('seri slug\'ı → /tr/urun/<seri>', async () => {
    db.cozum.mockResolvedValue({ kind: 'series', landing: {} })
    await expect(eskiTrUrunAdresiniYonlendir('lineo-serisi')).rejects.toThrow('REDIRECT:/tr/urun/lineo-serisi')
  })

  it('varyant slug\'ı (bugün ?sku=\'lu aileye giden dal) → model adresi, SKU küçük harf, query yok', async () => {
    db.cozum.mockResolvedValue({
      kind: 'redirect',
      to: '/tr/products/storm-serisi?sku=SEA-61143003',
      hedef: { aileSlug: 'storm-serisi', sku: 'SEA-61143003' },
    })
    await expect(eskiTrUrunAdresiniYonlendir('storm-10')).rejects.toThrow('REDIRECT:/tr/urun/storm-10-p-sea-61143003')
  })

  it('aile takma adı → yeni aile adresi', async () => {
    db.cozum.mockResolvedValue({ kind: 'redirect', to: '/tr/products/yeni-aile', hedef: { aileSlug: 'yeni-aile', sku: null } })
    await expect(eskiTrUrunAdresiniYonlendir('eski-aile')).rejects.toThrow('REDIRECT:/tr/urun/yeni-aile')
  })

  it('model adresi (-p-) → SKU çözülür → /tr/urun/<metin>-p-<sku>', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'SEA-61143003', family_id: 'f1' })
    db.familySlugById.mockResolvedValue('storm-serisi')
    await expect(eskiTrUrunAdresiniYonlendir('storm-10-p-sea-61143003')).rejects.toThrow(
      'REDIRECT:/tr/urun/storm-10-p-sea-61143003',
    )
    expect(db.cozum).not.toHaveBeenCalled()
  })

  it('model adresinde büyük harfli SKU → TEK 308 küçük harfe (DB\'ye gitmeden)', async () => {
    await expect(eskiTrUrunAdresiniYonlendir('storm-10-p-SEA-61143003')).rejects.toThrow(
      'REDIRECT:/tr/urun/storm-10-p-sea-61143003',
    )
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('bilinmeyen model SKU → 404', async () => {
    db.modelBySku.mockResolvedValue(null)
    await expect(eskiTrUrunAdresiniYonlendir('x-p-yok-1')).rejects.toThrow('NOT_FOUND')
  })

  it('bulunamadı → 404', async () => {
    db.cozum.mockResolvedValue({ kind: 'not-found' })
    await expect(eskiTrUrunAdresiniYonlendir('boyle-urun-yok')).rejects.toThrow('NOT_FOUND')
  })

  it('veri katmanına ulaşılamadı → FIRLATIR (404 değil, 200 değil)', async () => {
    db.cozum.mockResolvedValue({ kind: 'unavailable' })
    await expect(eskiTrUrunAdresiniYonlendir('storm-serisi')).rejects.toThrow(/geçici arıza/)
  })

  it('model yolunda DB hatası yutulmaz', async () => {
    db.modelBySku.mockRejectedValue(new Error('db düştü'))
    await expect(eskiTrUrunAdresiniYonlendir('storm-10-p-sea-1')).rejects.toThrow('db düştü')
  })
})
