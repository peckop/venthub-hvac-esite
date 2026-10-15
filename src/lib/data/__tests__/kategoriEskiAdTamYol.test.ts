/**
 * URN-121 / runbook §4.11 madde 10 (kategori kolu) — kategori adı değişince ESKİ adres, TEK 308 ile YENİ B-1
 * adresine gider. TAM YOL: gerçek `eskiKategoriHedefi` + gerçek `getCachedCategoryData` / `getCachedKategoriUstById`
 * + gerçek çözücü (`kategoriBagimliliklari`); yalnız Supabase istemcisi sahte (takma ad RPC'si + `categories`).
 *
 * Niçin ayrı dosya: `kategoriSegmenti.test.ts` çözücüyü ENJEKTE edilmiş sahte bağımlılıklarla ölçer,
 * `eskiKategoriHedefi.test.ts` takma ad çözümünü tek başına ölçer. İkisinin ARASI (takma adın hedef kategoriyi
 * bulması, o kategorinin kanonik adresinin kurulması, istenen adresle karşılaştırma) hiçbir yerde birlikte
 * ölçülmüyordu. Önizleme prod veritabanını okuduğu için ad değiştirme orada kurulamaz; bu test o boşluğu kapatır.
 *
 * Bayrak AÇIK kipte ölçülür (hedef şema). Evren: `fixtures/kategoriAgaci.ts` (canlıdan ölçülen 31 satır).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/config/features', async (orijinal) => ({
  ...(await orijinal<typeof import('@/config/features')>()),
  ADRES_SEMASI_K3B: true,
}))

const rpc = vi.fn()
const kategoriSorgusu = vi.fn()

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: (...a: unknown[]) => rpc(...a),
    from: (tablo: string) => kategoriSorgusu(tablo),
  },
}))

const yonlendir = vi.fn((hedef: string) => {
  throw new Error(`REDIRECT:${hedef}`)
})

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (hedef: string) => yonlendir(hedef),
}))

import {
  kategoriBagimliliklari,
  kategoriIcIceAdresiYonlendir,
  kategoriRotasiniUygula,
} from '../kategoriSegmenti'
import { KATEGORI_AGACI } from './fixtures/kategoriAgaci'

/** [dil, eski slug, hedef kategori kimliği] — `url_takma_adlari` satırı (tetik her ad değişiminde yazar). */
type TakmaAd = [dil: string, eski: string, hedefId: string]

const DUCT_FANS = 'a77203a2' // kanal-tipi-fanlar / duct-fans (aktif dal, üstü fans)
const FANS = 'c2f5d352' // fanlar / fans (aktif kök)
const JET_FANS = 'bae47d92' // otopark-jet-fanlari / jet-fans (PASİF dal, üstü fans aktif)

let takmaAdlar: TakmaAd[] = []
let rpcHatasi: Error | null = null

function satir(f: (typeof KATEGORI_AGACI)[number]) {
  return {
    ...f,
    name: f.slug,
    menu_label: null,
    translation_key: null,
    description: null,
    authority_content: null,
  }
}

/** PostgREST `.or()` ifadesini AYNI kalıpla doğrular: sorgu biçimi değişirse test kırılır, sessizce eşleşmez. */
function orIfadesindenSlug(ifade: string): string {
  const eslesme = /^slug\.eq\.(.+),metadata->slug->>tr\.eq\.\1,metadata->slug->>en\.eq\.\1$/.exec(ifade)
  if (!eslesme) throw new Error(`beklenmeyen .or() ifadesi: ${ifade}`)
  return eslesme[1]
}

function sorguNesnesi(kategoriler: ReturnType<typeof satir>[]) {
  const sonuc = (rows: ReturnType<typeof satir>[]) =>
    Object.assign(Promise.resolve({ data: rows, error: null }), {
      maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
    })
  return {
    select: () => ({
      or: (ifade: string) => {
        const slug = orIfadesindenSlug(ifade)
        const rows = kategoriler.filter(
          (c) => c.slug === slug || c.metadata.slug.tr === slug || c.metadata.slug.en === slug,
        )
        return { limit: async () => ({ data: rows, error: null }) }
      },
      eq: (kolon: string, deger: string) => ({
        limit: () => sonuc(kategoriler.filter((c) => (kolon === 'id' ? c.id : c.slug) === deger)),
      }),
    }),
  }
}

beforeEach(() => {
  takmaAdlar = []
  rpcHatasi = null
  rpc.mockReset()
  kategoriSorgusu.mockReset()
  yonlendir.mockClear()
  kategoriSorgusu.mockImplementation((tablo: string) => {
    if (tablo !== 'categories') throw new Error(`beklenmeyen tablo: ${tablo}`)
    return sorguNesnesi(KATEGORI_AGACI.map(satir))
  })
  rpc.mockImplementation(async (ad: string, a: { p_tur: string; p_dil: string; p_eski_slug: string }) => {
    if (ad !== 'url_takma_ad_coz') throw new Error(`beklenmeyen rpc: ${ad}`)
    if (rpcHatasi) return { data: null, error: rpcHatasi }
    const bulunan = takmaAdlar.find(
      ([dil, eski]) => (dil === a.p_dil || dil === '*') && eski === a.p_eski_slug.toLowerCase(),
    )
    return { data: bulunan ? bulunan[2] : null, error: null }
  })
})

const uygula = (seg: string[], dil: 'tr' | 'en', istenen: string) =>
  kategoriRotasiniUygula(seg, dil, istenen as Parameters<typeof kategoriRotasiniUygula>[2], kategoriBagimliliklari)

describe('eski adres → YENİ B-1 adresine TEK 308 (dal, kök, iki dil)', () => {
  it('DAL yeniden adlandı, TR: /tr/kategori/<eski-ad> → /tr/kategori/kanal-tipi-fanlar', async () => {
    takmaAdlar = [['tr', 'eski-kanal-fanlari', DUCT_FANS]]
    await expect(uygula(['eski-kanal-fanlari'], 'tr', '/tr/kategori/eski-kanal-fanlari')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
    expect(yonlendir).toHaveBeenCalledTimes(1)
  })

  it('DAL yeniden adlandı, EN: /en/category/<eski-ad> → /en/category/duct-fans', async () => {
    takmaAdlar = [['en', 'old-duct-fans', DUCT_FANS]]
    await expect(uygula(['old-duct-fans'], 'en', '/en/category/old-duct-fans')).rejects.toThrow(
      'REDIRECT:/en/category/duct-fans',
    )
    expect(yonlendir).toHaveBeenCalledTimes(1)
  })

  it('KÖK yeniden adlandı: eski kök adı → kökün kanonik adresi (TR ve EN)', async () => {
    takmaAdlar = [
      ['tr', 'eski-fanlar', FANS],
      ['en', 'old-fans', FANS],
    ]
    await expect(uygula(['eski-fanlar'], 'tr', '/tr/kategori/eski-fanlar')).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar',
    )
    await expect(uygula(['old-fans'], 'en', '/en/category/old-fans')).rejects.toThrow('REDIRECT:/en/category/fans')
  })

  it('dil karışık: eski TR ad EN önekiyle gelirse DOĞRU dildeki yeni adrese TEK 308', async () => {
    takmaAdlar = [['tr', 'eski-kanal-fanlari', DUCT_FANS]]
    await expect(uygula(['eski-kanal-fanlari'], 'en', '/en/category/eski-kanal-fanlari')).rejects.toThrow(
      'REDIRECT:/en/category/duct-fans',
    )
    expect(yonlendir).toHaveBeenCalledTimes(1)
  })

  it('büyük harfli eski ad aynı kategoriye gider (arama küçük harfle)', async () => {
    takmaAdlar = [['tr', 'eski-kanal-fanlari', DUCT_FANS]]
    await expect(uygula(['Eski-Kanal-Fanlari'], 'tr', '/tr/kategori/Eski-Kanal-Fanlari')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })
})

describe('eski İÇ İÇE adres (üst + eski alt) → YENİ B-1 adresine TEK 308', () => {
  it('yaprak eski ad: yanlış ya da eski üst karar vermez, hedef yaprağın kanonik adresi', async () => {
    takmaAdlar = [
      ['tr', 'eski-kanal-fanlari', DUCT_FANS],
      ['tr', 'eski-fanlar', FANS],
    ]
    await expect(kategoriIcIceAdresiYonlendir(['fanlar', 'eski-kanal-fanlari'], 'tr', kategoriBagimliliklari)).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
    await expect(
      kategoriIcIceAdresiYonlendir(['eski-fanlar', 'eski-kanal-fanlari'], 'tr', kategoriBagimliliklari),
    ).rejects.toThrow('REDIRECT:/tr/kategori/kanal-tipi-fanlar')
    // Aynı şey `kategoriRotasiniUygula`dan (iki segment, `istenen` yalnız üstten kurulmuş) geçerse de tek 308.
    await expect(uygula(['fanlar', 'eski-kanal-fanlari'], 'tr', '/tr/kategori/fanlar')).rejects.toThrow(
      'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
    )
  })
})

describe('TEK sıçrama: hedef adresin kendisi çizilir (zincir yok)', () => {
  it('birden çok eski ad aynı kategoriye gider; hepsinin hedefi kanonik adreste 200 verir', async () => {
    takmaAdlar = [
      ['tr', 'daha-eski-kanal-fanlari', DUCT_FANS],
      ['tr', 'eski-kanal-fanlari', DUCT_FANS],
    ]
    for (const eski of ['daha-eski-kanal-fanlari', 'eski-kanal-fanlari']) {
      await expect(uygula([eski], 'tr', `/tr/kategori/${eski}`)).rejects.toThrow(
        'REDIRECT:/tr/kategori/kanal-tipi-fanlar',
      )
    }
    // Sıçramanın vardığı adres bir daha yönlendirmez: kategori orada ÇİZİLİR.
    await expect(uygula(['kanal-tipi-fanlar'], 'tr', '/tr/kategori/kanal-tipi-fanlar')).resolves.toMatchObject({
      kategori: { slug: 'duct-fans' },
    })
  })

  it('kanonik adres istenirse takma ad tablosuna HİÇ bakılmaz (her sayfa ek sorgu ödemez)', async () => {
    takmaAdlar = [['tr', 'eski-kanal-fanlari', DUCT_FANS]]
    await uygula(['kanal-tipi-fanlar'], 'tr', '/tr/kategori/kanal-tipi-fanlar')
    await uygula(['duct-fans'], 'en', '/en/category/duct-fans')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('eski ad bugün BAŞKA aktif kategorinin güncel slug\'ıysa kategori kazanır, takma ad yok sayılır', async () => {
    takmaAdlar = [['tr', 'fanlar', DUCT_FANS]]
    await expect(uygula(['fanlar'], 'tr', '/tr/kategori/fanlar')).resolves.toMatchObject({
      kategori: { slug: 'fans' },
    })
    expect(rpc).not.toHaveBeenCalled()
  })
})

describe('hedef kategori pasif ya da yok', () => {
  it('eski ad PASİF dala işaret ediyorsa aktif üstün adresine (TR ve EN) TEK 308', async () => {
    takmaAdlar = [
      ['tr', 'eski-jet-fanlari', JET_FANS],
      ['en', 'old-jet-fans', JET_FANS],
    ]
    await expect(uygula(['eski-jet-fanlari'], 'tr', '/tr/kategori/eski-jet-fanlari')).rejects.toThrow(
      'REDIRECT:/tr/kategori/fanlar',
    )
    await expect(uygula(['old-jet-fans'], 'en', '/en/category/old-jet-fans')).rejects.toThrow(
      'REDIRECT:/en/category/fans',
    )
  })

  it('takma ad var ama hedef kategori silinmiş → 404 (yönlendirme yok)', async () => {
    takmaAdlar = [['tr', 'silinmis-ad', 'ffffffff']]
    await expect(uygula(['silinmis-ad'], 'tr', '/tr/kategori/silinmis-ad')).rejects.toThrow('NOT_FOUND')
    expect(yonlendir).not.toHaveBeenCalled()
  })

  it('takma ad da yok → 404', async () => {
    await expect(uygula(['hic-boyle-bir-ad-yok'], 'tr', '/tr/kategori/hic-boyle-bir-ad-yok')).rejects.toThrow(
      'NOT_FOUND',
    )
  })
})

describe('takma ad okuması düşerse YUTULMAZ (geçici arıza kalıcı 404 olmasın)', () => {
  it('rpc hata verirse hata yukarı çıkar; ne 404 ne yönlendirme', async () => {
    takmaAdlar = [['tr', 'eski-kanal-fanlari', DUCT_FANS]]
    rpcHatasi = new Error('rpc arızası')
    await expect(uygula(['eski-kanal-fanlari'], 'tr', '/tr/kategori/eski-kanal-fanlari')).rejects.toThrow(
      'rpc arızası',
    )
    await expect(
      kategoriIcIceAdresiYonlendir(['fanlar', 'eski-kanal-fanlari'], 'tr', kategoriBagimliliklari),
    ).rejects.toThrow('rpc arızası')
    expect(yonlendir).not.toHaveBeenCalled()
  })
})
