/**
 * INV-YAYINDA-MODEL-2 — model sayfası YALNIZ yayındaki listedeki SKU için açılır (URN-31).
 *
 * Liste dışı SKU'nun model adresi: 404, DB'ye GİDİLMEDEN. Adres BİÇİMİNDEN bağımsız: segmentler
 * `adresUret` ile üretilir, çözücü onu geri çözer (karar 286 biçimi değiştirirse bu dosya değişmez).
 * "Liste dışı adres" şöyle kurulur: SKU geçici olarak listeye alınır, adres üretilir, sonra liste
 * eski hâline döner → üretilmiş ama artık yayında olmayan bir adres (yayından çekilmiş model).
 * Biçime bağlı kapılar (büyük harf 308 sırası vb.) burada YOK: `urunSegmenti.test.ts`'te.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

const db = vi.hoisted(() => ({
  modelBySku: vi.fn(),
  familySlugById: vi.fn(),
  cozum: vi.fn(),
}))

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())
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

import { adresUret } from '@/utils/adresUret'
import { modelSegmentiUret } from '@/utils/modelAdresBicimi'

import { eskiTrUrunAdresiniYonlendir, urunSegmentiniCoz } from '../urunSegmenti'

const LISTE = { modeller: { 'aile-a': ['AAA-100'] }, surumler: { 'AAA-101': 'AAA-100' } }

const segmentOf = (adres: string): string => adres.split('/').pop() ?? ''
const modelAdresi = (sku: string, dil: 'tr' | 'en' = 'tr') =>
  adresUret({ tur: 'model', aileSlug: 'aile-a', sku }, dil, true)

/** Listede OLMAYAN bir SKU için üretilmiş (yayından çekilmiş) model segmenti. */
function yayindanCekilmisSegment(sku: string, dil: 'tr' | 'en' = 'tr'): string {
  yayindaListesiAyarla({ modeller: { 'aile-a': [sku] } })
  const segment = segmentOf(modelAdresi(sku, dil))
  yayindaListesiAyarla(LISTE)
  return segment
}

beforeEach(() => {
  vi.clearAllMocks()
  yayindaListesiAyarla(LISTE)
})

describe('ön koşul — duyarlılık: üretilen segment model segmentidir', () => {
  it('liste içi model adresinin son segmenti aile adresinden FARKLI (çözücü model olarak okur)', () => {
    expect(segmentOf(modelAdresi('AAA-100'))).not.toBe('aile-a')
    expect(yayindanCekilmisSegment('ZZZ-9')).not.toBe('aile-a')
  })
})

describe('urunSegmentiniCoz — liste kapısı', () => {
  it.each(['tr', 'en'] as const)('slug metni listedekinden FARKLI (%s) → doğru adrese TEK 308 (O1), DB\'ye gitmeden', async (dil) => {
    const yanlis = modelSegmentiUret('yanlis-metin', 'AAA-100')
    await expect(urunSegmentiniCoz(yanlis, dil)).rejects.toThrow(`REDIRECT:${modelAdresi('AAA-100', dil)}`)
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('EN adresinde TR metni → EN\'in kanonik adresine 308', async () => {
    const trSegmenti = segmentOf(modelAdresi('AAA-100', 'tr'))
    await expect(urunSegmentiniCoz(trSegmenti, 'en')).rejects.toThrow(`REDIRECT:${modelAdresi('AAA-100', 'en')}`)
  })

  it('slug metni doğruysa 308 YOK (döngü yok)', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'AAA-100', family_id: 'f1' })
    db.familySlugById.mockResolvedValue('aile-a')
    await expect(urunSegmentiniCoz(segmentOf(modelAdresi('AAA-100', 'en')), 'en')).resolves.toMatchObject({ sunucuSku: 'AAA-100' })
  })

  it('liste DIŞI model + yanlış metin → 404 (308 ÖNCE verilmez: ölü adrese taşımak yok)', async () => {
    await expect(urunSegmentiniCoz(modelSegmentiUret('yanlis-metin', 'ZZZ-9'), 'tr')).rejects.toThrow('NOT_FOUND')
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('liste içi model: DB\'ye gider, aile + sunucu SKU döner', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'AAA-100', family_id: 'f1' })
    db.familySlugById.mockResolvedValue('aile-a')
    await expect(urunSegmentiniCoz(segmentOf(modelAdresi('AAA-100')), 'tr')).resolves.toEqual({
      aileSlug: 'aile-a',
      sunucuSku: 'AAA-100',
    })
    expect(db.modelBySku).toHaveBeenCalledWith('AAA-100')
  })

  it('sürüm: kendi adresi çözülür (kanonik temele, üst veride)', async () => {
    db.modelBySku.mockResolvedValue({ sku: 'AAA-101', family_id: 'f1' })
    db.familySlugById.mockResolvedValue('aile-a')
    await expect(urunSegmentiniCoz(segmentOf(modelAdresi('AAA-101')), 'tr')).resolves.toMatchObject({ sunucuSku: 'AAA-101' })
  })

  it.each(['tr', 'en'] as const)('liste DIŞI model adresi (%s) → 404 ve DB çağrılmaz', async (dil) => {
    await expect(urunSegmentiniCoz(yayindanCekilmisSegment('ZZZ-9', dil), dil)).rejects.toThrow('NOT_FOUND')
    expect(db.modelBySku).not.toHaveBeenCalled()
    expect(db.familySlugById).not.toHaveBeenCalled()
  })

  it('BOŞ LİSTE (fail-closed): daha önce üretilmiş model adresi bile 404; DB çağrılmaz', async () => {
    const segment = segmentOf(modelAdresi('AAA-100'))
    yayindaListesiAyarla({})
    await expect(urunSegmentiniCoz(segment, 'tr')).rejects.toThrow('NOT_FOUND')
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('aile adresi (model segmenti değil) liste ile ilgilenmez: DB sorgusu yok', async () => {
    await expect(urunSegmentiniCoz('aile-a', 'tr')).resolves.toEqual({ aileSlug: 'aile-a', sunucuSku: null })
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('DB hatası (liste içi) 404\'e ÇEVRİLMEZ — fırlatılır', async () => {
    db.modelBySku.mockRejectedValue(new Error('57014 statement timeout'))
    await expect(urunSegmentiniCoz(segmentOf(modelAdresi('AAA-100')), 'tr')).rejects.toThrow('57014')
  })

  it('liste içi ama DB\'de yok (silinmiş) → 404', async () => {
    db.modelBySku.mockResolvedValue(null)
    await expect(urunSegmentiniCoz(segmentOf(modelAdresi('AAA-100')), 'tr')).rejects.toThrow('NOT_FOUND')
  })
})

describe('eskiTrUrunAdresiniYonlendir — liste kapısı', () => {
  it('eski yoldaki model segmenti, liste dışı → 404 (DB yok)', async () => {
    await expect(eskiTrUrunAdresiniYonlendir(yayindanCekilmisSegment('ZZZ-9'))).rejects.toThrow('NOT_FOUND')
    expect(db.modelBySku).not.toHaveBeenCalled()
  })

  it('varyant slug\'ı, SKU liste İÇİ → modelin adresine tek 308', async () => {
    db.cozum.mockResolvedValue({ kind: 'redirect', to: 'x', hedef: { aileSlug: 'aile-a', sku: 'AAA-100' } })
    await expect(eskiTrUrunAdresiniYonlendir('eski-urun-slugi')).rejects.toThrow(
      `REDIRECT:${adresUret({ tur: 'model', aileSlug: 'aile-a', sku: 'AAA-100' }, 'tr', true)}`,
    )
  })

  it('varyant slug\'ı, SKU liste DIŞI → AİLE adresine 308, SORGUSUZ', async () => {
    db.cozum.mockResolvedValue({ kind: 'redirect', to: 'x', hedef: { aileSlug: 'aile-a', sku: 'ZZZ-9' } })
    const hedef = adresUret({ tur: 'aile', slug: 'aile-a' }, 'tr', true)
    await expect(eskiTrUrunAdresiniYonlendir('eski-urun-slugi')).rejects.toThrow(`REDIRECT:${hedef}`)
    expect(hedef).not.toContain('?')
  })
})
