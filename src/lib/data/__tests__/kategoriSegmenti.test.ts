/**
 * K3-b kategori çözücüsü (REC-300 Faz 3b-2, plan §5 Faz 3 madde 1 + 5; §12a O2, O4, O6; §12 Y4).
 * Bayrak AÇIK kipte (hedef şema) ölçülür — çözücü yalnız bayrak açıkken çağrılır.
 * Evren: canlı DB'den ölçülen 31 satırlık ağaç (`fixtures/kategoriAgaci.ts`, 7 pasif satır dahil).
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
  kategoriKanonikAdresi,
  kategoriRotasiniUygula,
  kategoriSegmentleriniCoz,
} from '../kategoriSegmenti'
import { fiksturdenIdIle, fiksturdenSlugIle, type FiksturKategori, KATEGORI_AGACI } from './fixtures/kategoriAgaci'

const bag = (ek: Partial<KategoriCozucuBagimliliklari<FiksturKategori>> = {}): KategoriCozucuBagimliliklari<FiksturKategori> => ({
  kategoriGetir: async (slug) => fiksturdenSlugIle(slug),
  ustGetir: async (id) => fiksturdenIdIle(id),
  eskiHedef: async () => null,
  ...ek,
})

const uygula = (seg: string[], dil: 'tr' | 'en', istenen: string | null, b = bag()) =>
  kategoriRotasiniUygula(seg, dil, istenen as Parameters<typeof kategoriRotasiniUygula>[2], b)

describe('fikstür evreni (ölçümün kendisi)', () => {
  it('31 satır: 6 aktif kök, 18 aktif dal, 7 pasif', () => {
    expect(KATEGORI_AGACI).toHaveLength(31)
    expect(KATEGORI_AGACI.filter((c) => c.is_active && !c.parent_id)).toHaveLength(6)
    expect(KATEGORI_AGACI.filter((c) => c.is_active && c.parent_id)).toHaveLength(18)
    expect(KATEGORI_AGACI.filter((c) => !c.is_active)).toHaveLength(7)
  })
})

describe('kanonik adres — iki seviye, iki dilde', () => {
  it('kök tek seviye, dal iki seviye; slug o dilin görünen slug\'ı', () => {
    const fans = fiksturdenSlugIle('fans')!
    const duct = fiksturdenSlugIle('duct-fans')!
    expect(kategoriKanonikAdresi(fans, null, 'tr')).toBe('/tr/kategori/fanlar')
    expect(kategoriKanonikAdresi(fans, null, 'en')).toBe('/en/category/fans')
    expect(kategoriKanonikAdresi(duct, fans, 'tr')).toBe('/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(kategoriKanonikAdresi(duct, fans, 'en')).toBe('/en/category/fans/duct-fans')
  })
})

describe('TR yeni rota: istenen = kanonik → çizilir, değilse TEK 308', () => {
  it('kök adresi çizilir', async () => {
    const r = await uygula(['fanlar'], 'tr', '/tr/kategori/fanlar')
    expect(r.kategori.slug).toBe('fans')
    expect(r.ust).toBeNull()
  })

  it('iki seviyeli dal adresi çizilir', async () => {
    const r = await uygula(['fanlar', 'kanal-tipi-fanlar'], 'tr', '/tr/kategori/fanlar/kanal-tipi-fanlar')
    expect(r.kategori.slug).toBe('duct-fans')
    expect(r.ust?.slug).toBe('fans')
  })

  it('tek seviyeli dal adresi → iki seviyeliye 308', async () => {
    await expect(uygula(['kanal-tipi-fanlar'], 'tr', '/tr/kategori/kanal-tipi-fanlar')).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar',
    )
  })

  it('KÖK DEĞİŞİMİ (O6): dal slug\'la bulunur, yanlış kök doğru köke 308', async () => {
    await expect(
      uygula(['isi-geri-kazanim', 'kanal-tipi-fanlar'], 'tr', '/tr/kategori/isi-geri-kazanim/kanal-tipi-fanlar'),
    ).rejects.toThrow('REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar')
  })

  it('EN biçimli slug TR adreste → TR slug\'lı kanoniğe 308 (O2)', async () => {
    await expect(uygula(['fans', 'duct-fans'], 'tr', '/tr/kategori/fans/duct-fans')).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar',
    )
  })

  it('büyük harf → küçük harfli kanoniğe 308', async () => {
    await expect(uygula(['Fanlar'], 'tr', '/tr/kategori/Fanlar')).rejects.toThrow('REDIRECT:/tr/kategori/fanlar')
  })

  it('sondaki "/" (boş segment) yok sayılır — çözüm aynı kategori', async () => {
    const c = await kategoriSegmentleriniCoz(['fanlar', ''], 'tr', bag())
    expect(c.tur === 'kategori' && c.kategori.slug).toBe('fans')
  })

  it('ikiden fazla segment → 404', async () => {
    await expect(uygula(['fanlar', 'kanal-tipi-fanlar', 'x'], 'tr', null)).rejects.toThrow('NOT_FOUND')
  })

  it('bilinmeyen slug, takma ad da yok → 404', async () => {
    await expect(uygula(['boyle-bir-kategori-yok'], 'tr', '/tr/kategori/boyle-bir-kategori-yok')).rejects.toThrow(
      'NOT_FOUND',
    )
  })

  it('bilinmeyen slug, takma ad VAR → bugünkü kanoniğe 308 (REC-300 Faz 1-A)', async () => {
    const b = bag({ eskiHedef: async (s) => (s === 'eski-kanal-fanlari' ? 'kanal-tipi-fanlar' : null) })
    await expect(uygula(['eski-kanal-fanlari'], 'tr', '/tr/kategori/eski-kanal-fanlari', b)).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar/kanal-tipi-fanlar',
    )
  })

  it('eski TR rotası (istenen = null): kanonik bir slug bile olsa her zaman 308', async () => {
    await expect(uygula(['fanlar'], 'tr', null)).rejects.toThrow('REDIRECT:/tr/kategori/fanlar')
  })
})

describe('PASİF kategoriler (O4) — canlıda bugün 200 dönen 7 satırın tamamı', () => {
  const beklenen: Record<string, string> = {
    'ticari-havalandirma': '/tr/urunler',
    'konut-tipi-havalandirma': '/tr/urunler',
    'ex-proof-atex-fanlar': '/tr/kategori/fanlar',
    'otopark-jet-fanlari': '/tr/kategori/fanlar',
    'otopark-jet-fan': '/tr/kategori/fanlar',
    'kanal-ici-hayalet-fanlar': '/tr/urunler', // üstü (konut) de pasif
    'dikdortgen-kanal-fanlari': '/tr/urunler', // üstü (ticari) de pasif
  }

  it('beklenti tablosu fikstürdeki pasif evreni birebir kapsar', () => {
    const pasif = KATEGORI_AGACI.filter((c) => !c.is_active).map((c) => c.metadata.slug.tr).sort()
    expect(Object.keys(beklenen).sort()).toEqual(pasif)
  })

  it.each(Object.entries(beklenen))('%s → %s (TR ve EN biçimli slug)', async (trSlug, hedef) => {
    const satir = fiksturdenSlugIle(trSlug)!
    await expect(uygula([trSlug], 'tr', null)).rejects.toThrow(`REDIRECT:${hedef}`)
    await expect(uygula([satir.slug], 'tr', null)).rejects.toThrow(`REDIRECT:${hedef}`)
  })

  it('EN: pasif dal → EN üst kökü; pasif kök → /en/products', async () => {
    await expect(uygula(['jet-fans'], 'en', '/en/category/jet-fans')).rejects.toThrow('REDIRECT:/en/category/fans')
    await expect(uygula(['commercial-ventilation'], 'en', '/en/category/commercial-ventilation')).rejects.toThrow(
      'REDIRECT:/en/products',
    )
  })
})

describe('EN (Y4): tek seviyeli dal → iki seviyeli 308; iki seviyeli ve kök çizilir', () => {
  it('/en/category/duct-fans → /en/category/fans/duct-fans', async () => {
    await expect(uygula(['duct-fans'], 'en', '/en/category/duct-fans')).rejects.toThrow(
      'REDIRECT:/en/category/fans/duct-fans',
    )
  })

  it('/en/category/fans/duct-fans çizilir; /en/category/fans çizilir', async () => {
    await expect(uygula(['fans', 'duct-fans'], 'en', '/en/category/fans/duct-fans')).resolves.toMatchObject({
      kategori: { slug: 'duct-fans' },
    })
    await expect(uygula(['fans'], 'en', '/en/category/fans')).resolves.toMatchObject({ kategori: { slug: 'fans' } })
  })
})

describe('INV-ADRES-TEK-KANONIK-1 (çözücü kolu): her aktif kategori TAM BİR adreste çizilir', () => {
  const aktif = KATEGORI_AGACI.filter((c) => c.is_active)
  it.each(['tr', 'en'] as const)('%s: kanonik adres çizilir, tek seviyeli dal adresi 308 verir', async (dil) => {
    for (const c of aktif) {
      const ust = c.parent_id ? fiksturdenIdIle(c.parent_id) : null
      const kanonik = kategoriKanonikAdresi(c, ust, dil)
      const seg = kanonik.split('/').slice(3)
      await expect(uygula(seg, dil, kanonik)).resolves.toMatchObject({ kategori: { id: c.id } })
      if (ust) {
        const yaprak = seg[seg.length - 1]
        const tekSeviye = dil === 'tr' ? `/tr/kategori/${yaprak}` : `/en/category/${yaprak}`
        await expect(uygula([yaprak], dil, tekSeviye)).rejects.toThrow(`REDIRECT:${kanonik}`)
      }
    }
  })
})

describe('DB hatası YUTULMAZ (geçici arıza kalıcı 404 olmasın)', () => {
  const hata = new Error('db düştü')
  it.each([
    ['kategoriGetir', bag({ kategoriGetir: async () => { throw hata } })],
    ['ustGetir', bag({ ustGetir: async () => { throw hata } })],
    ['eskiHedef', bag({ eskiHedef: async () => { throw hata } })],
  ])('%s fırlatırsa hata yukarı çıkar (404 değil)', async (_ad, b) => {
    const seg = _ad === 'eskiHedef' ? ['boyle-bir-kategori-yok'] : ['kanal-tipi-fanlar']
    await expect(uygula(seg, 'tr', null, b)).rejects.toThrow('db düştü')
  })
})
