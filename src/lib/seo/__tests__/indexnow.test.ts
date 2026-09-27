import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { INDEXNOW_ANAHTARI } from '@/config/indexnow'
import { SITE_URL } from '@/config/siteUrl'

import { indexNowBildir, K3B_BOLUMLERI, K3B_DISI_BOLUMLER, k3bdenEtkilenirMi } from '../indexnow'

/**
 * INV-INDEXNOW-1 · IndexNow anahtarı + K4 yayın süzgeci (REC-127 → REC-405)
 *
 * RECEP KARARI K4 (2026-09-03): "Bing'i değişecek adreslerle beslemeyelim." REC-405 anahtarı ve
 * `public/<anahtar>.txt` doğrulama dosyasını girdi; ama K3-b adres şeması (`ADRES_SEMASI_K3B`)
 * kapalıyken ürün/kategori/marka adresleri yakında DEĞİŞECEK. Bu kapı üç şeyi birlikte tutar:
 *   1. bayrak KAPALI → değişecek adresler ağ isteğinin gövdesine GİRMEZ; etkilenmeyenler GİDER;
 *      hepsi etkilenmişse istek HİÇ atılmaz ama sonuç "atlandi/yayin-oncesi" olarak GÖRÜNÜR,
 *   2. bayrak AÇIK → hepsi gider,
 *   3. doğrulama dosyası var, adı ve içeriği BİREBİR sabit (satır sonu yok — IndexNow dosya
 *      içeriğini anahtarla karşılaştırır; fazladan `\n` 403 üretebilir).
 */

const bayrak = vi.hoisted(() => ({ acik: false }))

vi.mock('@/config/features', async (orijinal) => {
  const gercek = await orijinal<typeof import('@/config/features')>()
  return {
    ...gercek,
    get ADRES_SEMASI_K3B() {
      return bayrak.acik
    },
  }
})

const ORIJINAL_KEY = process.env.INDEXNOW_KEY
const KOK = process.cwd()

interface Govde {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

function govdeAl(fetchSpy: { mock: { calls: unknown[][] } }): Govde {
  const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
  return JSON.parse(String(init.body)) as Govde
}

const ETKILENEN_YOLLAR = [
  '/tr/products/lineo-quiet',
  '/en/products/lineo-quiet',
  '/tr/products',
  '/tr/category/fanlar',
  '/en/category/fans/duct-fans',
  '/tr/brands/soler-palau',
  '/tr/urunler',
  '/tr/urun/lineo-quiet',
  '/tr/kategori/fanlar',
  '/tr/markalar/soler-palau',
  '/sitemap.xml',
]

const ETKILENMEYEN_YOLLAR = [
  '/tr/bilgi-merkezi',
  '/tr/bilgi-merkezi/frekans-konvertoru-nedir',
  '/en/knowledge-hub',
  '/tr/destek/sss',
]

describe('INV-INDEXNOW-1 · anahtar ve doğrulama dosyası', () => {
  it('⭐anahtar 32 karakter küçük harf hex', () => {
    expect(INDEXNOW_ANAHTARI).toMatch(/^[0-9a-f]{32}$/)
  })

  it('⭐public/<anahtar>.txt VAR ve içeriği BİREBİR anahtar (satır sonu YOK)', () => {
    const dosya = path.join(KOK, 'public', `${INDEXNOW_ANAHTARI}.txt`)
    expect(
      existsSync(dosya),
      `doğrulama dosyası yok: public/${INDEXNOW_ANAHTARI}.txt — IndexNow 403 döner`,
    ).toBe(true)
    const icerik = readFileSync(dosya)
    expect(
      icerik.equals(Buffer.from(INDEXNOW_ANAHTARI, 'utf8')),
      'dosya içeriği anahtarla bayt bayt aynı değil (satır sonu/BOM/boşluk?)',
    ).toBe(true)
  })

  it('public/ altında başka bir 32-hex .txt yok (eski anahtar dosyası kalmamış)', () => {
    const hexTxt = readdirSync(path.join(KOK, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
    expect(hexTxt).toEqual([`${INDEXNOW_ANAHTARI}.txt`])
  })
})

describe('INV-INDEXNOW-1 · k3bdenEtkilenirMi süzgeci', () => {
  it('⭐etkilenen bölüm kümesi adresUret\'ten türedi ve bugünkü ölçümle aynı', () => {
    // Küme elle yazılmaz; burada SABİTLENİR ki adres şeması değişince kapı haber versin.
    expect([...K3B_BOLUMLERI].sort()).toEqual([
      'brands',
      'category',
      'kategori',
      'markalar',
      'products',
      'urun',
      'urunler',
    ])
  })

  it('etkilenmeyen bölüm listesinin her girdisi gerçek bir rota dizini ve kümeler ayrık', () => {
    for (const bolum of K3B_DISI_BOLUMLER) {
      const dizin = path.join(KOK, 'src', 'app', '[lang]', bolum)
      expect(existsSync(dizin) && statSync(dizin).isDirectory(), `rota dizini yok: ${bolum}`).toBe(true)
      expect(K3B_BOLUMLERI.has(bolum), `${bolum} iki kümede birden`).toBe(false)
    }
  })

  it.each(ETKILENEN_YOLLAR)('%s → etkilenir', (yol) => {
    expect(k3bdenEtkilenirMi(yol)).toBe(true)
  })

  it.each(ETKILENMEYEN_YOLLAR)('%s → etkilenmez', (yol) => {
    expect(k3bdenEtkilenirMi(yol)).toBe(false)
  })

  it('bilinmeyen bölüm ve dilsiz yol GÜVENLİ TARAFTA (etkilenir); dil kökü etkilenmez', () => {
    expect(k3bdenEtkilenirMi('/tr/yeni-bir-bolum/x'), 'bilinmeyen bölüm').toBe(true)
    expect(k3bdenEtkilenirMi('/products/x'), 'dilsiz yol').toBe(true)
    expect(k3bdenEtkilenirMi('/tr')).toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/bilgi-merkezi`), 'tam URL').toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/products/x`), 'tam URL').toBe(true)
  })
})

describe('INV-INDEXNOW-1 · bildirim sözleşmesi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.INDEXNOW_KEY
    bayrak.acik = false
  })

  afterEach(() => {
    if (ORIJINAL_KEY === undefined) delete process.env.INDEXNOW_KEY
    else process.env.INDEXNOW_KEY = ORIJINAL_KEY
    bayrak.acik = false
    vi.restoreAllMocks()
  })

  it('⭐bayrak KAPALI — ürün/kategori/marka gövdede YOK, bilgi merkezi VAR; düşen sayı görünür', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    const sonuc = await indexNowBildir([...ETKILENEN_YOLLAR, ...ETKILENMEYEN_YOLLAR])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const govde = govdeAl(fetchSpy)
    const yollar = govde.urlList.map((u) => new URL(u).pathname)
    for (const y of ETKILENEN_YOLLAR) {
      expect(yollar, `K4 ihlali: değişecek adres bildirildi → ${y}`).not.toContain(y)
    }
    expect(yollar).toEqual(ETKILENMEYEN_YOLLAR)
    expect(sonuc).toEqual({
      durum: 'gonderildi',
      gonderilen: ETKILENMEYEN_YOLLAR.length,
      dusurulen: ETKILENEN_YOLLAR.length,
      http: 200,
    })
  })

  it('⭐bayrak KAPALI + yalnız etkilenen yollar — ağ isteği HİÇ atılmaz, sonuç görünür', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(['/tr/products/a', '/en/products/a', '/tr/category/fanlar', '/sitemap.xml'])

    expect(fetchSpy, 'değişecek adreslerle istek atıldı (K4)').not.toHaveBeenCalled()
    expect(errorSpy, 'beklenen yayın-öncesi hâli hata gibi günlüğe yazıldı').not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'yayin-oncesi', dusurulen: 4 })
  })

  it('⭐bayrak AÇIK — hepsi gider; key = sabit, keyLocation = SITE_URL/<anahtar>.txt', async () => {
    bayrak.acik = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }))

    const sonuc = await indexNowBildir([...ETKILENEN_YOLLAR, ...ETKILENMEYEN_YOLLAR])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const govde = govdeAl(fetchSpy)
    expect(govde.urlList).toHaveLength(ETKILENEN_YOLLAR.length + ETKILENMEYEN_YOLLAR.length)
    expect(govde.key).toBe(INDEXNOW_ANAHTARI)
    expect(govde.keyLocation).toBe(`${SITE_URL}/${INDEXNOW_ANAHTARI}.txt`)
    expect(govde.host).toBe(new URL(SITE_URL).host)
    expect(sonuc).toEqual({
      durum: 'gonderildi',
      gonderilen: ETKILENEN_YOLLAR.length + ETKILENMEYEN_YOLLAR.length,
      dusurulen: 0,
      http: 202,
    })
  })

  it('gönderilecek yol YOK — ağ isteği denenmez', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const sonuc = await indexNowBildir([])
    expect(fetchSpy, 'boş kümeyi bildirmek ölçüm değildir').not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'yol-yok' })
  })

  it('yollar tekilleştirilir ve tam URL yapılır', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    // Webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü).
    await indexNowBildir(['/tr/bilgi-merkezi', '/tr/bilgi-merkezi', 'en/knowledge-hub'])

    const govde = govdeAl(fetchSpy)
    expect(govde.urlList, 'yollar tekilleştirilmemiş').toHaveLength(2)
    expect(govde.urlList.every((u) => u.startsWith('http')), 'IndexNow tam URL ister').toBe(true)
  })

  it('INDEXNOW_KEY tanımlıysa sabiti geçersiz kılar; boş değer kılmaz', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    process.env.INDEXNOW_KEY = 'ortam-anahtari'
    await indexNowBildir(['/tr/bilgi-merkezi'])
    expect(govdeAl(fetchSpy).key).toBe('ortam-anahtari')

    fetchSpy.mockClear()
    process.env.INDEXNOW_KEY = '  '
    await indexNowBildir(['/tr/bilgi-merkezi'])
    expect(govdeAl(fetchSpy).key, 'boş ortam değeri boş anahtar üretti').toBe(INDEXNOW_ANAHTARI)
  })

  it('⭐ağ HATA verirse modül THROW ETMEZ ve günlüğe yazar — webhook düşmez', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ag koptu'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(['/tr/bilgi-merkezi', '/tr/products/a'])

    expect(sonuc).toEqual({ durum: 'hata', mesaj: 'ag koptu', dusurulen: 1 })
    expect(errorSpy, 'gerçek arıza sessizce yutulmuş').toHaveBeenCalled()
  })
})
