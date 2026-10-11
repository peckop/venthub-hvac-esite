/**
 * K3-b kategori çözücüsü (REC-300 Faz 3b-2, plan §5 Faz 3 madde 1 + 5; §12a O2, O4, O6; SEO-35 B-1).
 * Bayrak AÇIK kipte (hedef şema) ölçülür — çözücü yalnız bayrak açıkken çağrılır.
 * Evren: canlı DB'den ölçülen 31 satırlık ağaç (`fixtures/kategoriAgaci.ts`, 7 pasif satır dahil).
 *
 * SEO-35 B-1 (Recep kararı): kategori adresi TEK segmenttir. Kök `/tr/kategori/<kök>` (EN `/en/category/<kök>`)
 * DEĞİŞMEDİ; alt kategori `/tr/kategori/<alt-slug>` (EN `/en/category/<alt-slug>`), adreste kimlik soneki yok.
 * Bugünkü canlı iç içe adres (`/tr/category/<üst>/<alt>`) ve 3-C'nin iki seviyeli adresi (`/tr/kategori/<üst>/<alt>`)
 * TEK sıçramayla (iki sıçrama değil) tek segmentli kanonik adrese gider, TR ve EN.
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

import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import {
  type KategoriCozucuBagimliliklari,
  kategoriIcIceAdresiYonlendir,
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

const icIce = (seg: string[], dil: 'tr' | 'en', b = bag()) => kategoriIcIceAdresiYonlendir(seg, dil, b)

describe('fikstür evreni (ölçümün kendisi)', () => {
  it('31 satır: 7 aktif kök (Sığınak 7. kök, OPS-51), 17 aktif dal, 7 pasif', () => {
    expect(KATEGORI_AGACI).toHaveLength(31)
    expect(KATEGORI_AGACI.filter((c) => c.is_active && !c.parent_id)).toHaveLength(7)
    expect(KATEGORI_AGACI.filter((c) => c.is_active && c.parent_id)).toHaveLength(17)
    expect(KATEGORI_AGACI.find((c) => c.slug === 'shelter-ventilation')?.parent_id).toBeNull()
    expect(KATEGORI_AGACI.filter((c) => !c.is_active)).toHaveLength(7)
  })

  it('düz ad alanı: aktif kategorilerin TR ve EN slug\'ları tekil (tek segmentli adres çakışmaz)', () => {
    const aktif = KATEGORI_AGACI.filter((c) => c.is_active)
    for (const dil of ['tr', 'en'] as const) {
      const slugs = aktif.map((c) => getLocalizedCategorySlug(c, dil))
      expect(new Set(slugs).size, `${dil} slug tekrarı: kök ve dal aynı adrese düşer`).toBe(slugs.length)
    }
  })
})

describe('kanonik adres — TEK segment, iki dilde', () => {
  it('kök adresi DEĞİŞMEDİ; dal TEK segment (üst slug\'ı yok); slug o dilin görünen slug\'ı', () => {
    const fans = fiksturdenSlugIle('fans')!
    const duct = fiksturdenSlugIle('duct-fans')!
    expect(kategoriKanonikAdresi(fans, 'tr')).toBe('/tr/kategori/fanlar')
    expect(kategoriKanonikAdresi(fans, 'en')).toBe('/en/category/fans')
    expect(kategoriKanonikAdresi(duct, 'tr')).toBe('/tr/kategori/kanal-tipi-fanlar')
    expect(kategoriKanonikAdresi(duct, 'en')).toBe('/en/category/duct-fans')
  })
})

describe('TR yeni rota: istenen = kanonik → çizilir, değilse TEK 308', () => {
  it('kök adresi çizilir', async () => {
    const r = await uygula(['fanlar'], 'tr', '/tr/kategori/fanlar')
    expect(r.kategori.slug).toBe('fans')
  })

  it('tek segmentli dal adresi KANONİKTİR ve çizilir', async () => {
    const r = await uygula(['kanal-tipi-fanlar'], 'tr', '/tr/kategori/kanal-tipi-fanlar')
    expect(r.kategori.slug).toBe('duct-fans')
  })

  it('(a) 3-C iki seviyeli adres /tr/kategori/<üst>/<alt> → TEK 308 ile /tr/kategori/<alt>', async () => {
    // Rota `istenen`i yalnız ilk segmentten kurar (`adresUret({ kok })`).
    await expect(uygula(['fanlar', 'kanal-tipi-fanlar'], 'tr', '/tr/kategori/fanlar')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })

  it('(a) iki segmentli istek `istenen` kanonikle EŞİT bile olsa çizilmez (eski rota tuzağı: istenen dal ile kurulursa)', async () => {
    await expect(
      uygula(['fanlar', 'kanal-tipi-fanlar'], 'tr', '/tr/kategori/kanal-tipi-fanlar'),
    ).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
  })

  it('KÖK DEĞİŞİMİ (O6): yaprak slug karar verir, yanlış üst aynı kanonik adrese 308', async () => {
    await expect(
      uygula(['isi-geri-kazanim', 'kanal-tipi-fanlar'], 'tr', '/tr/kategori/isi-geri-kazanim'),
    ).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
  })

  it('EN biçimli slug TR adreste → TR slug\'lı kanoniğe 308 (O2), tek ve iki segmentli', async () => {
    await expect(uygula(['duct-fans'], 'tr', '/tr/kategori/duct-fans')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
    await expect(uygula(['fans', 'duct-fans'], 'tr', '/tr/kategori/fans')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })

  it('büyük harf → küçük harfli kanoniğe 308', async () => {
    await expect(uygula(['Fanlar'], 'tr', '/tr/kategori/Fanlar')).rejects.toThrow('REDIRECT:/tr/kategori/fanlar')
  })

  it('sondaki "/" (boş segment) yok sayılır — çözüm aynı kategori, tek segment sayılır', async () => {
    const c = await kategoriSegmentleriniCoz(['fanlar', ''], 'tr', bag())
    expect(c.tur === 'kategori' && c.kategori.slug).toBe('fans')
    await expect(uygula(['kanal-tipi-fanlar', ''], 'tr', '/tr/kategori/kanal-tipi-fanlar')).resolves.toMatchObject({
      kategori: { slug: 'duct-fans' },
    })
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
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })

  it('eski TR rotası (istenen = null): kanonik bir slug bile olsa her zaman 308', async () => {
    await expect(uygula(['fanlar'], 'tr', null)).rejects.toThrow('REDIRECT:/tr/kategori/fanlar')
    await expect(uygula(['kanal-tipi-fanlar'], 'tr', null)).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
  })

  it('(a) bugünkü canlı /tr/category/<üst>/<alt> → TEK 308 /tr/kategori/<alt> (iki sıçrama değil)', async () => {
    await expect(icIce(['fanlar', 'kanal-tipi-fanlar'], 'tr')).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
    // Yanlış dilde slug'lar da aynı tek sıçramayla doğru dildeki kanoniğe gider.
    await expect(icIce(['fans', 'duct-fans'], 'tr')).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
  })
})

describe('PASİF kategoriler (O4) — canlıda bugün 200 dönen 7 satırın tamamı', () => {
  // TR ve EN için beklenen adres (aktif üst varsa üstün kanonik adresi, yoksa tüm ürünler).
  const beklenen: Record<string, { tr: string; en: string }> = {
    'ticari-havalandirma': { tr: '/tr/urunler', en: '/en/products' },
    'konut-tipi-havalandirma': { tr: '/tr/urunler', en: '/en/products' },
    'ex-proof-atex-fanlar': { tr: '/tr/kategori/fanlar', en: '/en/category/fans' },
    'otopark-jet-fanlari': { tr: '/tr/kategori/fanlar', en: '/en/category/fans' },
    'otopark-jet-fan': { tr: '/tr/kategori/fanlar', en: '/en/category/fans' },
    'kanal-ici-hayalet-fanlar': { tr: '/tr/urunler', en: '/en/products' }, // üstü (konut) de pasif
    'dikdortgen-kanal-fanlari': { tr: '/tr/urunler', en: '/en/products' }, // üstü (ticari) de pasif
  }

  it('beklenti tablosu fikstürdeki pasif evreni birebir kapsar', () => {
    const pasif = KATEGORI_AGACI.filter((c) => !c.is_active).map((c) => c.metadata.slug.tr).sort()
    expect(Object.keys(beklenen).sort()).toEqual(pasif)
  })

  it.each(Object.entries(beklenen))('(c) %s → aktif üstün adresi ya da tüm ürünler (TR/EN, TR ve EN biçimli slug)', async (trSlug, hedef) => {
    const satir = fiksturdenSlugIle(trSlug)!
    for (const slug of [trSlug, satir.slug]) {
      await expect(uygula([slug], 'tr', null)).rejects.toThrow(`REDIRECT:${hedef.tr}`)
      await expect(uygula([slug], 'en', null)).rejects.toThrow(`REDIRECT:${hedef.en}`)
      // İç içe biçim de aynı hedefe gider: pasif kategori hiçbir adreste çizilmez.
      await expect(icIce(['fanlar', slug], 'tr')).rejects.toThrow(`REDIRECT:${hedef.tr}`)
      await expect(icIce(['fans', slug], 'en')).rejects.toThrow(`REDIRECT:${hedef.en}`)
    }
  })

  it('EN rota istenen adresiyle: pasif dal → EN üst kökü; pasif kök → /en/products', async () => {
    await expect(uygula(['jet-fans'], 'en', '/en/category/jet-fans')).rejects.toThrow('REDIRECT:/en/category/fans')
    await expect(uygula(['commercial-ventilation'], 'en', '/en/category/commercial-ventilation')).rejects.toThrow(
      'REDIRECT:/en/products',
    )
  })
})

describe('EN (B-1): tek segmentli dal KANONİKTİR; iç içe adres tek 308', () => {
  it('/en/category/duct-fans çizilir (eskiden iki seviyeliye 308 alırdı)', async () => {
    await expect(uygula(['duct-fans'], 'en', '/en/category/duct-fans')).resolves.toMatchObject({
      kategori: { slug: 'duct-fans' },
    })
  })

  it('/en/category/fans çizilir (kök adresi değişmedi)', async () => {
    await expect(uygula(['fans'], 'en', '/en/category/fans')).resolves.toMatchObject({ kategori: { slug: 'fans' } })
  })

  it('(a) /en/category/fans/duct-fans → TEK 308 /en/category/duct-fans (iç içe adres çizilmez)', async () => {
    await expect(icIce(['fans', 'duct-fans'], 'en')).rejects.toThrow('REDIRECT:/en/category/duct-fans')
    // `kategoriRotasiniUygula` ile iki segment verilse de kanonikle eşit `istenen` çizdirmez.
    await expect(uygula(['fans', 'duct-fans'], 'en', '/en/category/duct-fans')).rejects.toThrow(
      'REDIRECT:/en/category/duct-fans',
    )
  })

  it('EN rota TR biçimli slug ile: kanonik EN slug\'a 308', async () => {
    await expect(uygula(['kanal-tipi-fanlar'], 'en', '/en/category/kanal-tipi-fanlar')).rejects.toThrow(
      'REDIRECT:/en/category/duct-fans',
    )
  })
})

describe('kategoriIcIceAdresiYonlendir — iç içe adres HİÇBİR koşulda çizmez', () => {
  it('çözülebilen her aktif dal için atar (308); dönüş yolu yoktur', async () => {
    for (const c of KATEGORI_AGACI.filter((k) => k.is_active && k.parent_id)) {
      const ust = fiksturdenIdIle(c.parent_id!)!
      for (const dil of ['tr', 'en'] as const) {
        const hedef = kategoriKanonikAdresi(c, dil)
        await expect(icIce([getLocalizedCategorySlug(ust, dil), getLocalizedCategorySlug(c, dil)], dil)).rejects.toThrow(
          `REDIRECT:${hedef}`,
        )
      }
    }
  })

  it('bilinmeyen slug → takma ad → yoksa 404; takma ad varsa tek 308', async () => {
    await expect(icIce(['fanlar', 'boyle-bir-kategori-yok'], 'tr')).rejects.toThrow('NOT_FOUND')
    const b = bag({ eskiHedef: async (s) => (s === 'eski-kanal-fanlari' ? 'kanal-tipi-fanlar' : null) })
    await expect(icIce(['fanlar', 'eski-kanal-fanlari'], 'tr', b)).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })
})

describe('INV-ADRES-TEK-KANONIK-1 (çözücü kolu): her aktif kategori TAM BİR adreste çizilir', () => {
  const aktif = KATEGORI_AGACI.filter((c) => c.is_active)
  it.each(['tr', 'en'] as const)('%s: tek segmentli kanonik çizilir, her iç içe biçim 308 verir', async (dil) => {
    for (const c of aktif) {
      const kanonik = kategoriKanonikAdresi(c, dil)
      const seg = kanonik.split('/').slice(3)
      expect(seg, `${kanonik} tek segment değil`).toHaveLength(1)
      await expect(uygula(seg, dil, kanonik)).resolves.toMatchObject({ kategori: { id: c.id } })
      if (c.parent_id) {
        const ust = fiksturdenIdIle(c.parent_id)!
        const icIceSeg = [getLocalizedCategorySlug(ust, dil), seg[0]]
        // Rota hangi `istenen`i kurarsa kursun (ilk segment, dal ya da kanonik) çizilmez.
        for (const istenen of [kategoriKanonikAdresi(ust, dil), kanonik, null]) {
          await expect(uygula(icIceSeg, dil, istenen)).rejects.toThrow(`REDIRECT:${kanonik}`)
        }
      }
    }
  })
})

describe('aktif kategori üst sorgusu ödemez (B-1: kanonik adres üstten bağımsız)', () => {
  it('aktif kök ve dal çözümünde ustGetir ÇAĞRILMAZ; pasif dalda çağrılır', async () => {
    const ustGetir = vi.fn(async (id: string) => fiksturdenIdIle(id))
    const b = bag({ ustGetir })
    await kategoriSegmentleriniCoz(['fanlar'], 'tr', b)
    await kategoriSegmentleriniCoz(['kanal-tipi-fanlar'], 'tr', b)
    expect(ustGetir).not.toHaveBeenCalled()
    await kategoriSegmentleriniCoz(['otopark-jet-fanlari'], 'tr', b)
    expect(ustGetir).toHaveBeenCalledTimes(1)
  })
})

describe('DB hatası YUTULMAZ (geçici arıza kalıcı 404 olmasın)', () => {
  const hata = new Error('db düştü')
  it.each<[string, KategoriCozucuBagimliliklari<FiksturKategori>, string[]]>([
    ['kategoriGetir', bag({ kategoriGetir: async () => { throw hata } }), ['kanal-tipi-fanlar']],
    // Üst yalnız PASİF kategoride okunur (aktif kategorinin kanonik adresi üstten bağımsız).
    ['ustGetir', bag({ ustGetir: async () => { throw hata } }), ['otopark-jet-fanlari']],
    ['eskiHedef', bag({ eskiHedef: async () => { throw hata } }), ['boyle-bir-kategori-yok']],
  ])('%s fırlatırsa hata yukarı çıkar (404 değil)', async (_ad, b, seg) => {
    await expect(uygula(seg, 'tr', null, b)).rejects.toThrow('db düştü')
    await expect(icIce(seg, 'tr', b)).rejects.toThrow('db düştü')
  })
})
