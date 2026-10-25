/**
 * URN-144 (karar 410) — üç kademeli kategori ağacında pasif kategori çözümü: İLK AKTİF ata.
 * Adres TEK segment kalır (karar 407). Eşleyici (`lib/adres/eslestirici.ts`) pasif kategoriyi zaten ilk aktif atasına
 * götürür; çözücü doğrudan üste TEK kez bakıyordu ve üç kademede ayrışırdı (pasif orta → "tüm ürünler").
 * Fikstür gerçek dalı taklit eder (Aksesuarlar → Elektrik Aksesuarları → Frekans Konvertörleri); kimlikler test verisidir.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
}))

vi.mock('../preload', () => ({
  getCachedCategoryData: vi.fn(),
  getCachedKategoriUstById: vi.fn(),
  eskiKategoriHedefi: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => {
    throw new Error(`REDIRECT:${hedef}`)
  },
}))

import {
  type KategoriCozucuBagimliliklari,
  kategoriRotasiniUygula,
  kategoriSegmentleriniCoz,
} from '../kategoriSegmenti'
import type { KategoriUst } from '../preload'

type Satir = KategoriUst

const satir = (id: string, slug: string, tr: string, parent_id: string | null, is_active = true): Satir => ({
  id,
  slug,
  name: slug,
  menu_label: null,
  translation_key: null,
  metadata: { slug: { tr, en: slug } },
  is_active,
  parent_id,
})

const KOK = satir('k', 'accessories', 'aksesuarlar', null)
const ORTA = satir('o', 'control-systems', 'elektrik-aksesuarlari', 'k')
const YAPRAK = satir('y', 'frequency-converters', 'frekans-konvertorleri', 'o')

function bag(satirlar: Satir[], okunan: string[] = []): KategoriCozucuBagimliliklari<Satir> {
  return {
    kategoriGetir: async (slug) => satirlar.find((s) => s.slug === slug || (s.metadata as { slug: { tr: string } }).slug.tr === slug) ?? null,
    ustGetir: async (id) => {
      okunan.push(id)
      return satirlar.find((s) => s.id === id) ?? null
    },
    eskiHedef: async () => null,
  }
}

describe('üç kademe — aktif yaprak ve orta', () => {
  it('aktif yaprak: kategori olarak çizilir (üst bilgisi okunmaz); adres tek segment', async () => {
    const okunan: string[] = []
    const b = bag([KOK, ORTA, YAPRAK], okunan)
    const c = await kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', b)
    expect(c).toEqual({ tur: 'kategori', kategori: YAPRAK })
    expect(okunan).toEqual([])
    await expect(kategoriRotasiniUygula(['frekans-konvertorleri'], 'tr', '/tr/kategori/frekans-konvertorleri' as never, b)).resolves.toEqual({ kategori: YAPRAK })
  })

  it('iç içe üç segment yok sayılır (en çok iki segment kuralı değişmedi)', async () => {
    const c = await kategoriSegmentleriniCoz(['aksesuarlar', 'elektrik-aksesuarlari', 'frekans-konvertorleri'], 'tr', bag([KOK, ORTA, YAPRAK]))
    expect(c).toEqual({ tur: 'yok' })
  })
})

describe('üç kademe — pasif kategori: ilk AKTİF ata', () => {
  it('pasif yaprak, aktif orta: ortanın tek segmentli adresine', async () => {
    const pasifYaprak = { ...YAPRAK, is_active: false }
    const c = await kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', bag([KOK, ORTA, pasifYaprak]))
    expect(c).toEqual({ tur: 'yonlendir', hedef: '/tr/kategori/elektrik-aksesuarlari' })
  })

  it('pasif yaprak, PASİF orta, aktif kök: pasif ara kademe atlanır, kök adresi (eşleyiciyle aynı hüküm)', async () => {
    const pasifOrta = { ...ORTA, is_active: false }
    const pasifYaprak = { ...YAPRAK, is_active: false }
    const okunan: string[] = []
    const c = await kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', bag([KOK, pasifOrta, pasifYaprak], okunan))
    expect(c).toEqual({ tur: 'yonlendir', hedef: '/tr/kategori/aksesuarlar' })
    expect(okunan).toEqual(['o', 'k'])
    const en = await kategoriSegmentleriniCoz(['frequency-converters'], 'en', bag([KOK, pasifOrta, pasifYaprak]))
    expect(en).toEqual({ tur: 'yonlendir', hedef: '/en/category/accessories' })
  })

  it('pasif orta, aktif yaprak ALTINDA: orta kendi kökünü gösterir; yaprak kendi adresinde çizilir', async () => {
    const pasifOrta = { ...ORTA, is_active: false }
    const b = bag([KOK, pasifOrta, YAPRAK])
    expect(await kategoriSegmentleriniCoz(['elektrik-aksesuarlari'], 'tr', b)).toEqual({ tur: 'yonlendir', hedef: '/tr/kategori/aksesuarlar' })
    expect(await kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', b)).toEqual({ tur: 'kategori', kategori: YAPRAK })
  })

  it('hiç aktif ata yok: tüm ürünler', async () => {
    const pasifKok = { ...KOK, is_active: false }
    const pasifOrta = { ...ORTA, is_active: false }
    const pasifYaprak = { ...YAPRAK, is_active: false }
    const c = await kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', bag([pasifKok, pasifOrta, pasifYaprak]))
    expect(c).toEqual({ tur: 'yonlendir', hedef: '/tr/urunler' })
  })

  it('iki kademe: pasif alt aktif köküne (bugünkü davranış), kökü pasifse tüm ürünler', async () => {
    const fans = satir('f', 'fans', 'fanlar', null)
    const alt = satir('a', 'duct-fans', 'kanal-tipi-fanlar', 'f', false)
    expect(await kategoriSegmentleriniCoz(['kanal-tipi-fanlar'], 'tr', bag([fans, alt]))).toEqual({
      tur: 'yonlendir',
      hedef: '/tr/kategori/fanlar',
    })
    expect(await kategoriSegmentleriniCoz(['kanal-tipi-fanlar'], 'tr', bag([{ ...fans, is_active: false }, alt]))).toEqual({
      tur: 'yonlendir',
      hedef: '/tr/urunler',
    })
  })

  it('üst okuma hatası FIRLATILIR (kalıcı "üst yok" sanılmaz)', async () => {
    const b: KategoriCozucuBagimliliklari<Satir> = {
      ...bag([{ ...YAPRAK, is_active: false }]),
      ustGetir: async () => {
        throw new Error('ağ yok')
      },
    }
    await expect(kategoriSegmentleriniCoz(['frekans-konvertorleri'], 'tr', b)).rejects.toThrow('ağ yok')
  })
})
