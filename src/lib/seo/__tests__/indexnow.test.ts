import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'
import { INDEXNOW_ANAHTARI } from '@/config/indexnow'
import { SITE_URL } from '@/config/siteUrl'
import { aileYollari, kategoriYollari } from '@/lib/adres/tazelemeYollari'
import { skuModelYollari } from '@/lib/adres/yayindaModelYollari'
import { type AdresDili, adresUret } from '@/utils/adresUret'

import {
  indexNowBildir,
  indexNoweGiderMi,
  K3B_BOLUMLERI,
  K3B_DISI_BOLUMLER,
  k3bdenEtkilenirMi,
  YENI_SEMA_BICIMLERI,
} from '../indexnow'

/**
 * INV-INDEXNOW-1 · IndexNow anahtarı + K4 yayın süzgeci (REC-127 → REC-405)
 * INV-INDEXNOW-2 · bayrak AÇIKKEN yalnız YENİ şema adresleri + reddedilen yanıt görünür (URN-10)
 *
 * RECEP KARARI K4 (2026-09-03): "Bing'i değişecek adreslerle beslemeyelim." REC-405 anahtarı ve
 * `public/<anahtar>.txt` doğrulama dosyasını girdi; ama K3-b adres şeması (`ADRES_SEMASI_K3B`)
 * kapalıyken ürün/kategori/marka adresleri yakında DEĞİŞECEK. Bu kapı şunları birlikte tutar:
 *   1. bayrak KAPALI → değişecek adresler ağ isteğinin gövdesine GİRMEZ; etkilenmeyenler GİDER;
 *      hepsi etkilenmişse istek HİÇ atılmaz ama sonuç "atlandi/yayin-oncesi" olarak GÖRÜNÜR,
 *   2. bayrak AÇIK → YALNIZ `adresUret(…, true)` biçimli adresler gider (eskiden "hepsi gider"di: webhook yol
 *      listesi iki şemayı birden ürettiğinden Bing'e 308 veren eski adresler, `/sitemap.xml` ve dizine kapalı EN
 *      yolları da sızıyordu; tazeleme kümesi iki şemalı KALIR, süzgeç IndexNow girişindedir),
 *   3. `EN_YAYIN` kapalıyken `/en/...` yolu bayrak AÇIKKEN gitmez (dizine kapalı sayfa); bayrak KAPALIYKEN
 *      davranış değişmedi (etkilenmeyen EN yolları bugünkü gibi gider, etkilenenler düşer),
 *   4. IndexNow 2xx DIŞI yanıt verirse sonuç "reddedildi" + http kodu ve günlüğe yazılır (eskiden "gonderildi"ydi),
 *   5. doğrulama dosyası var, adı ve içeriği BİREBİR sabit (satır sonu yok — IndexNow dosya
 *      içeriğini anahtarla karşılaştırır; fazladan `\n` 403 üretebilir).
 *
 * ÖLÇMEDİĞİ: IndexNow'un gerçek yanıtı ve Bing'in adresi dizine alması (yayın sonrası canlı ölçüm); `fetch` taklittir.
 */

const bayrak = vi.hoisted(() => ({ acik: false, enYayin: false }))

vi.mock('@/config/features', async (orijinal) => {
  const gercek = await orijinal<typeof import('@/config/features')>()
  return {
    ...gercek,
    get ADRES_SEMASI_K3B() {
      return bayrak.acik
    },
    get EN_YAYIN() {
      return bayrak.enYayin
    },
  }
})

// Üretimdeki "yayındaki modeller" listesi boştur; model yolu ölçen test kendi sentetik listesini verir (URN-31 kiti).
vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

const ORIJINAL_KEY = process.env.INDEXNOW_KEY
const ORIJINAL_KAPALI = process.env.INDEXNOW_KAPALI
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
  '/tr/destek/sss',
]

/** Şemadan etkilenmeyen ama EN: `EN_YAYIN` kapalıyken (bugün) dizine kapalı; K3-b AÇIKKEN bildirilmez (URN-10). */
const ETKILENMEYEN_EN_YOLLAR = ['/en/knowledge-hub', '/en/destek/sss']

function bayraklariSifirla() {
  bayrak.acik = false
  bayrak.enYayin = false
}

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

  it.each([...ETKILENMEYEN_YOLLAR, ...ETKILENMEYEN_EN_YOLLAR])('%s → etkilenmez', (yol) => {
    expect(k3bdenEtkilenirMi(yol)).toBe(false)
  })

  it('bilinmeyen bölüm ve dilsiz yol GÜVENLİ TARAFTA (etkilenir); dil kökü etkilenmez', () => {
    expect(k3bdenEtkilenirMi('/tr/yeni-bir-bolum/x'), 'bilinmeyen bölüm').toBe(true)
    expect(k3bdenEtkilenirMi('/products/x'), 'dilsiz yol').toBe(true)
    expect(k3bdenEtkilenirMi('/tr')).toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/bilgi-merkezi`), 'tam URL').toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/products/x`), 'tam URL').toBe(true)
  })

  it('⭐yol normalize edilir: ".." ile etkilenen bölüme kaçan yol etkilenir; düz etkilenmeyen yol geçer', () => {
    expect(k3bdenEtkilenirMi('/tr/destek/../urun/x'), 'destek/../urun').toBe(true)
    expect(k3bdenEtkilenirMi('/tr/urun-secici/../urun/x'), 'urun-secici/../urun').toBe(true)
    expect(k3bdenEtkilenirMi('/tr/destek/%2e%2e/urun/x'), 'kodlanmış ..').toBe(true)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/destek/../urun/x`), 'tam URL ile ..').toBe(true)
    expect(k3bdenEtkilenirMi('/tr/destek'), 'düz etkilenmeyen').toBe(false)
    expect(k3bdenEtkilenirMi('/tr'), 'dil kökü').toBe(false)
    expect(k3bdenEtkilenirMi('/tr/destek?x=1#a'), 'sorgu ve parça').toBe(false)
  })

  it('çözülemeyen girdi güvenli tarafta: etkilenir (düşer)', () => {
    expect(k3bdenEtkilenirMi('http://'), 'geçersiz URL').toBe(true)
    expect(k3bdenEtkilenirMi('//baska-kok/tr/destek'), 'tabanı değiştiren biçim').toBe(true)
  })

  it('⭐tam URL\'de sunucu adı kontrol edilir: başka sunucu düşer, kendi sunucu adı mevcut davranışı korur', () => {
    const kendi = new URL(SITE_URL).host
    expect(k3bdenEtkilenirMi('https://baska.com/tr/destek'), 'başka sunucu, masum yol').toBe(true)
    expect(k3bdenEtkilenirMi('https://baska.com/tr'), 'başka sunucu, dil kökü').toBe(true)
    expect(k3bdenEtkilenirMi(`https://${kendi}.baska.com/tr/destek`), 'sunucu adını önek yapan başka sunucu').toBe(true)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/destek`), 'kendi sunucu, etkilenmeyen').toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr`), 'kendi sunucu, dil kökü').toBe(false)
    expect(k3bdenEtkilenirMi(`${SITE_URL}/tr/products/x`), 'kendi sunucu, etkilenen').toBe(true)
  })
})

describe('INV-INDEXNOW-1 · süzgeç ↔ tazelemeYollari bağı', () => {
  // Webhook'un `revalidatePath` listesi bu fonksiyonlardan gelir ve sonra IndexNow'a gider. Süzgeç bu listeyi
  // yakalamazsa bayrak kapalıyken değişecek adres Bing'e sızar (K4). Yeni şema/bölüm eklenirse bu bağ kırılır.
  const kok = (dil: AdresDili) => (dil === 'tr' ? 'fanlar' : 'fans')
  const ust = (dil: AdresDili) => (dil === 'tr' ? 'havalandirma' : 'ventilation')

  const TAZELEME_YOLLARI = [
    ...aileYollari('x'),
    ...kategoriYollari(kok),
    ...kategoriYollari(kok, ust),
  ]

  afterEach(() => {
    bayraklariSifirla()
    vi.restoreAllMocks()
  })

  it('tazeleme yolları boş değil (bağ kendiliğinden boşalmasın)', () => {
    expect(aileYollari('x').length).toBeGreaterThan(0)
    expect(kategoriYollari(kok).length).toBeGreaterThan(0)
    // SEO-35 B-1: kategori adresi TEK segment; üst kategori adrese girmez, yani üst verilmesi yol kümesini
    // büyütmez (eskiden iki seviyeli yeni-şema yolu eklenirdi). Küme aynıdır ve yine boş değildir.
    expect([...kategoriYollari(kok, ust)].sort()).toEqual([...kategoriYollari(kok)].sort())
  })

  it.each(TAZELEME_YOLLARI)('⭐%s → k3bdenEtkilenirMi true', (yol) => {
    expect(k3bdenEtkilenirMi(yol), `süzgeç tazeleme yolunu kaçırdı: ${yol}`).toBe(true)
  })

  it('⭐bayrak KAPALI — tazeleme yollarının HEPSİ bildirilirse ağ isteği atılmaz, sonuç yayin-oncesi', async () => {
    bayrak.acik = false
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(TAZELEME_YOLLARI)

    expect(fetchSpy, 'tazeleme yoluyla istek atıldı (K4)').not.toHaveBeenCalled()
    expect(sonuc.durum).toBe('atlandi')
    expect(sonuc).toMatchObject({ durum: 'atlandi', sebep: 'yayin-oncesi' })
  })
})

describe('INV-INDEXNOW-1 · bildirim sözleşmesi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.INDEXNOW_KEY
    delete process.env.INDEXNOW_KAPALI
    bayraklariSifirla()
  })

  afterEach(() => {
    if (ORIJINAL_KEY === undefined) delete process.env.INDEXNOW_KEY
    else process.env.INDEXNOW_KEY = ORIJINAL_KEY
    if (ORIJINAL_KAPALI === undefined) delete process.env.INDEXNOW_KAPALI
    else process.env.INDEXNOW_KAPALI = ORIJINAL_KAPALI
    bayraklariSifirla()
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

  it('⭐bayrak AÇIK — key = sabit, keyLocation = SITE_URL/<anahtar>.txt; gövdede yalnız yeni şema TR adresleri + etkilenmeyenler', async () => {
    bayrak.acik = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }))

    const sonuc = await indexNowBildir([...ETKILENEN_YOLLAR, ...ETKILENMEYEN_YOLLAR])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const govde = govdeAl(fetchSpy)
    // URN-10: eskiden "hepsi gider"di (11 + 3 yol); şimdi yalnız yeni şema TR adresleri ve etkilenmeyenler.
    const yeniSemaTr = ['/tr/urunler', '/tr/urun/lineo-quiet', '/tr/kategori/fanlar', '/tr/markalar/soler-palau']
    expect(govde.urlList.map((u) => new URL(u).pathname)).toEqual([...yeniSemaTr, ...ETKILENMEYEN_YOLLAR])
    expect(govde.key).toBe(INDEXNOW_ANAHTARI)
    expect(govde.keyLocation).toBe(`${SITE_URL}/${INDEXNOW_ANAHTARI}.txt`)
    expect(govde.host).toBe(new URL(SITE_URL).host)
    expect(sonuc).toEqual({
      durum: 'gonderildi',
      gonderilen: yeniSemaTr.length + ETKILENMEYEN_YOLLAR.length,
      dusurulen: ETKILENEN_YOLLAR.length - yeniSemaTr.length,
      http: 202,
    })
  })

  it.each(['1', 'true', 'TRUE', ' True '])(
    '⭐INDEXNOW_KAPALI=%j — bayrak AÇIK olsa bile fetch ÇAĞRILMAZ, sonuç atlandi/kapatildi',
    async (deger) => {
      process.env.INDEXNOW_KAPALI = deger
      bayrak.acik = true
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

      const sonuc = await indexNowBildir([...ETKILENEN_YOLLAR, ...ETKILENMEYEN_YOLLAR])

      expect(fetchSpy, 'kapatma anahtarına rağmen istek atıldı').not.toHaveBeenCalled()
      expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'kapatildi' })
    },
  )

  it('INDEXNOW_KAPALI=1 iken boş yol listesi de kapatildi döner (anahtar yol kontrolünden önce)', async () => {
    process.env.INDEXNOW_KAPALI = '1'
    expect(await indexNowBildir([])).toEqual({ durum: 'atlandi', sebep: 'kapatildi' })
  })

  it.each([undefined, '', '  ', '0', 'false', 'evet'])(
    'INDEXNOW_KAPALI=%j — bildirim AÇIK, mevcut davranış değişmez',
    async (deger) => {
      if (deger !== undefined) process.env.INDEXNOW_KAPALI = deger
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

      const sonuc = await indexNowBildir(ETKILENMEYEN_YOLLAR)

      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(sonuc).toEqual({ durum: 'gonderildi', gonderilen: ETKILENMEYEN_YOLLAR.length, dusurulen: 0, http: 200 })
    },
  )

  it('gönderilecek yol YOK — ağ isteği denenmez', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const sonuc = await indexNowBildir([])
    expect(fetchSpy, 'boş kümeyi bildirmek ölçüm değildir').not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'yol-yok' })
  })

  it('yollar tekilleştirilir ve tam URL yapılır', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    // Webhook aynı yolu birden çok dalda biriktirebiliyor (zincir yürüyüşü). Başında `/` olmayan yol da tam URL olur.
    await indexNowBildir(['/tr/bilgi-merkezi', '/tr/bilgi-merkezi', 'tr/destek'])

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

describe('INV-INDEXNOW-2 · yeni şema biçimleri adresUret(…, true)\'dan türer (URN-10)', () => {
  it('⭐YENI_SEMA_BICIMLERI bugünkü ölçümle aynı: <dil>/<bölüm> → parça sayıları (dil öneki dahil)', () => {
    // Küme elle yazılmaz; burada SABİTLENİR ki adres şeması ya da bölüm adı değişince kapı haber versin.
    const olcum = Object.fromEntries([...YENI_SEMA_BICIMLERI].map(([anahtar, sayilar]) => [anahtar, [...sayilar].sort((a, b) => a - b)]))
    expect(olcum).toEqual({
      'tr/urunler': [2],
      'tr/kategori': [3],
      'tr/urun': [3],
      'tr/markalar': [2, 3],
      'en/products': [2, 3],
      'en/category': [3],
      'en/brands': [2, 3],
    })
  })

  it('⭐TR eski şema bölümleri yeni şemada YOK (düşer); EN bölümleri iki şemada AYNI (bölüm adı yetmez, parça sayısı da denetlenir)', () => {
    const nesneler = [
      { tur: 'urunler' },
      { tur: 'kategori', kok: 'k', dal: 'd' },
      { tur: 'aile', slug: 'a' },
      { tur: 'marka', slug: 'm' },
      { tur: 'markalar' },
    ] as const
    const bolum = (yol: string) => yol.split('/')[2] ?? ''
    for (const n of nesneler) {
      const trEski = bolum(adresUret(n, 'tr', false))
      const trYeni = bolum(adresUret(n, 'tr', true))
      expect(trEski, `TR eski ve yeni bölüm aynı çıktı (${n.tur}): bölüm adıyla ayrım yapılamaz`).not.toBe(trYeni)
      expect(YENI_SEMA_BICIMLERI.has(`tr/${trEski}`), `TR eski bölüm yeni şemada: ${trEski}`).toBe(false)
      expect(YENI_SEMA_BICIMLERI.has(`tr/${trYeni}`), `TR yeni bölüm yok: ${trYeni}`).toBe(true)
      expect(adresUret(n, 'en', false), `EN eski ve yeni adres ayrıştı (${n.tur}): EN bölümü şemadan bağımsız değil`).toBe(
        adresUret(n, 'en', true),
      )
    }
  })
})

describe('INV-INDEXNOW-2 · indexNoweGiderMi (tek süzgeç)', () => {
  afterEach(() => {
    bayraklariSifirla()
  })

  // [yol, K3-b açık mı, EN yayında mı, gider mi]
  const TABLO: [string, boolean, boolean, boolean][] = [
    // TR, bayrak AÇIK: yalnız yeni şema biçimi
    ['/tr/urunler', true, false, true],
    ['/tr/urun/lineo-quiet', true, false, true],
    ['/tr/kategori/fanlar', true, false, true],
    ['/tr/markalar', true, false, true],
    ['/tr/markalar/soler-palau', true, false, true],
    ['/tr/urun/lineo-quiet?sku=AAA-100', true, false, true],
    ['/tr/products', true, false, false],
    ['/tr/products/lineo-quiet', true, false, false],
    ['/tr/category/fanlar', true, false, false],
    ['/tr/brands', true, false, false],
    ['/tr/brands/soler-palau', true, false, false],
    // iç içe ve fazla derin yollar `adresUret`'in ürettiği biçim değildir (308)
    ['/tr/kategori/fanlar/sessiz-kanal-fanlari', true, false, false],
    ['/tr/category/fanlar/sessiz-kanal-fanlari', true, false, false],
    ['/tr/urun/lineo-quiet/fazla', true, false, false],
    // bilinmeyen bölüm, dilsiz yol, site haritası, çözülemeyen girdi: güvenli taraf
    ['/tr/yeni-bir-bolum/x', true, false, false],
    ['/products/lineo-quiet', true, false, false],
    ['/sitemap.xml', true, false, false],
    ['/sitemap.xml', false, false, false],
    ['http://', true, false, false],
    // normalize: `..` ile eski şemaya kaçan yol düşer
    ['/tr/destek/../products/x', true, false, false],
    ['/tr/destek/../urun/x', true, false, true],
    // tam URL: kendi sunucu aynı kuralı alır, başka sunucu düşer
    [`${SITE_URL}/tr/urun/lineo-quiet`, true, false, true],
    [`${SITE_URL}/tr/products/lineo-quiet`, true, false, false],
    ['https://baska.com/tr/urun/lineo-quiet', true, false, false],
    // şemadan etkilenmeyenler ve dil kökü: iki bayrak durumunda da gider
    ['/tr', true, false, true],
    ['/tr', false, false, true],
    ['/tr/bilgi-merkezi/frekans-konvertoru-nedir', true, false, true],
    ['/tr/bilgi-merkezi/frekans-konvertoru-nedir', false, false, true],
    // K4: bayrak KAPALI iken yeni şema adresi de düşer (davranış değişmedi)
    ['/tr/urunler', false, false, false],
    ['/tr/urun/lineo-quiet', false, false, false],
    ['/tr/products/lineo-quiet', false, false, false],
    // EN kapalı (bugün), K3-b AÇIK: hiçbir /en yolu gitmez (dizine kapalı sayfa)
    ['/en', true, false, false],
    ['/en/products/lineo-quiet', true, false, false],
    ['/en/knowledge-hub', true, false, false],
    // EN kapalı, K3-b KAPALI: davranış DEĞİŞMEDİ (K4) — etkilenmeyen yollar bugünkü gibi gider, etkilenenler düşer
    ['/en', false, false, true],
    ['/en/knowledge-hub', false, false, true],
    ['/en/products/lineo-quiet', false, false, false],
    // EN yayında: yeni şemayla aynı biçim gider, iç içe kategori yine düşer
    ['/en', true, true, true],
    ['/en/products', true, true, true],
    ['/en/products/lineo-quiet', true, true, true],
    ['/en/category/fans', true, true, true],
    ['/en/brands/soler-palau', true, true, true],
    ['/en/category/fans/duct-fans', true, true, false],
    ['/en/knowledge-hub', true, true, true],
    // EN yayında ama K3-b KAPALI: eski adres değişecek bölümdür (K4), etkilenmeyen gider
    ['/en/products/lineo-quiet', false, true, false],
    ['/en/knowledge-hub', false, true, true],
  ]

  it.each(TABLO)('%s (K3-b açık=%s, EN yayın=%s) → gider=%s', (yol, k3bAcik, enYayin, beklenen) => {
    bayrak.enYayin = enYayin
    expect(indexNoweGiderMi(yol, k3bAcik)).toBe(beklenen)
  })

  it('varsayılan K3-b değeri modülün bayrağından okunur (üretim kodu parametre vermez)', () => {
    bayrak.acik = false
    expect(indexNoweGiderMi('/tr/urunler')).toBe(false)
    bayrak.acik = true
    expect(indexNoweGiderMi('/tr/urunler')).toBe(true)
  })
})

describe('INV-INDEXNOW-2 · webhook yol kümesi IndexNow girişinde süzülür (URN-10)', () => {
  const kok = (dil: AdresDili) => (dil === 'tr' ? 'fanlar' : 'fans')
  const ust = (dil: AdresDili) => (dil === 'tr' ? 'havalandirma' : 'ventilation')

  /** Webhook'un `revalidatedPaths` kümesi: GERÇEK üreticilerden (iki şemalı, iki dilli) + site haritası + iç içe yollar. */
  function webhookKumesi(): string[] {
    const markalar = (['tr', 'en'] as const).flatMap((dil) =>
      [false, true].map((yeni) => String(adresUret({ tur: 'marka', slug: 'soler-palau' }, dil, yeni))),
    )
    return [
      ...aileYollari('lineo-quiet'),
      ...kategoriYollari(kok),
      ...kategoriYollari(kok, ust),
      ...skuModelYollari('AAA-100'),
      ...markalar,
      // İç içe kategori yolları: iki şemada da yalnız 308; tazeleme kümesine girmez ama girse IndexNow'a gitmez.
      '/tr/kategori/fanlar/sessiz-kanal-fanlari',
      '/tr/category/fanlar/sessiz-kanal-fanlari',
      '/en/category/fans/quiet-duct-fans',
      '/sitemap.xml',
    ]
  }

  const trModel = () => String(adresUret({ tur: 'model', aileSlug: 'aile-a', sku: 'AAA-100' }, 'tr', true))
  const enModel = () => String(adresUret({ tur: 'model', aileSlug: 'aile-a', sku: 'AAA-100' }, 'en', true))

  const ESKI_SEMA_TR = [
    '/tr/products/lineo-quiet',
    '/tr/category/fanlar',
    '/tr/brands/soler-palau',
    '/tr/category/fanlar/sessiz-kanal-fanlari',
    '/tr/kategori/fanlar/sessiz-kanal-fanlari',
    '/sitemap.xml',
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.INDEXNOW_KEY
    delete process.env.INDEXNOW_KAPALI
    bayraklariSifirla()
    yayindaListesiAyarla({ modeller: { 'aile-a': ['AAA-100'] } })
  })

  afterEach(() => {
    bayraklariSifirla()
    yayindaListesiAyarla({})
    vi.restoreAllMocks()
  })

  function yollar(fetchSpy: { mock: { calls: unknown[][] } }): string[] {
    return govdeAl(fetchSpy).urlList.map((u) => new URL(u).pathname)
  }

  it('⭐bayrak AÇIK, EN kapalı — gövdede YALNIZ yeni şema TR adresleri (aile, kategori üstlü/üstsüz, model, marka); eskiler, iç içeler ve /sitemap.xml YOK', async () => {
    bayrak.acik = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    expect(trModel(), 'model adresi yeni şema biçiminde değil').toMatch(/^\/tr\/urun\/.+-p-aaa-100$/)

    const girdi = webhookKumesi()
    const sonuc = await indexNowBildir(girdi)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const gonderilen = yollar(fetchSpy)
    expect([...gonderilen].sort()).toEqual(
      ['/tr/urun/lineo-quiet', '/tr/kategori/fanlar', trModel(), '/tr/markalar/soler-palau'].sort(),
    )
    for (const eski of ESKI_SEMA_TR) {
      expect(gonderilen, `eski şema / site haritası IndexNow'a gitti → ${eski}`).not.toContain(eski)
    }
    expect(gonderilen.filter((y) => y.startsWith('/en')), 'EN kapalıyken /en yolu gitti').toEqual([])
    expect(sonuc).toMatchObject({ durum: 'gonderildi', gonderilen: 4, http: 200 })
    // Girdi iki şemalı kalır (tazeleme kümesi): süzgeç IndexNow girişindedir.
    expect(girdi).toEqual(expect.arrayContaining(['/tr/products/lineo-quiet', '/tr/urun/lineo-quiet']))
  })

  it('⭐bayrak AÇIK, EN YAYINDA — EN adresleri de gider (yeni şemayla aynı biçim); eski TR, iç içe ve /sitemap.xml yine YOK', async () => {
    bayrak.acik = true
    bayrak.enYayin = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    await indexNowBildir(webhookKumesi())

    const gonderilen = yollar(fetchSpy)
    expect([...gonderilen].sort()).toEqual(
      [
        '/tr/urun/lineo-quiet',
        '/tr/kategori/fanlar',
        trModel(),
        '/tr/markalar/soler-palau',
        '/en/products/lineo-quiet',
        '/en/category/fans',
        enModel(),
        '/en/brands/soler-palau',
      ].sort(),
    )
    for (const eski of [...ESKI_SEMA_TR, '/en/category/fans/quiet-duct-fans']) {
      expect(gonderilen, `eski şema / iç içe / site haritası gitti → ${eski}`).not.toContain(eski)
    }
  })

  it('⭐bayrak KAPALI — davranış DEĞİŞMEDİ: yeni şema adresleri de düşer, yalnız etkilenmeyenler gider', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    const sonuc = await indexNowBildir([...webhookKumesi(), ...ETKILENMEYEN_YOLLAR])

    expect(yollar(fetchSpy)).toEqual(ETKILENMEYEN_YOLLAR)
    expect(sonuc).toMatchObject({ durum: 'gonderildi', gonderilen: ETKILENMEYEN_YOLLAR.length, http: 200 })
  })

  it('⭐bayrak KAPALI — yalnız webhook kümesi: ağ isteği YOK, sonuç yayin-oncesi (değişmedi)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const sonuc = await indexNowBildir(webhookKumesi())

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(sonuc).toMatchObject({ durum: 'atlandi', sebep: 'yayin-oncesi' })
  })

  it('⭐bayrak AÇIK — gidecek yol kalmazsa (yalnız eski şema + /sitemap.xml + EN) ağ isteği YOK, sebep bildirilecek-yol-yok (yayin-oncesi DEĞİL)', async () => {
    bayrak.acik = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const girdi = [...ESKI_SEMA_TR, '/en/products/lineo-quiet', '/en/category/fans']

    const sonuc = await indexNowBildir(girdi)

    expect(fetchSpy, 'eski şema adresleriyle istek atıldı').not.toHaveBeenCalled()
    expect(errorSpy, 'beklenen durum hata gibi günlüğe yazıldı').not.toHaveBeenCalled()
    expect(sonuc).toEqual({ durum: 'atlandi', sebep: 'bildirilecek-yol-yok', dusurulen: girdi.length })
  })

  it('⭐EN yayında değilken: bayrak AÇIKKEN /en yolları gitmez (TR eşi gider); bayrak KAPALIYKEN etkilenmeyen /en yolları bugünkü gibi gider (davranış değişmedi)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    const n = ETKILENMEYEN_EN_YOLLAR.length

    // KAPALI: bu iş kapalı kipi DEĞİŞTİRMEZ (K4 davranışı aynen; EN kuralı yalnız açık kipte).
    const kapali = await indexNowBildir(['/tr/bilgi-merkezi', ...ETKILENMEYEN_EN_YOLLAR])
    expect(yollar(fetchSpy)).toEqual(['/tr/bilgi-merkezi', ...ETKILENMEYEN_EN_YOLLAR])
    expect(kapali).toEqual({ durum: 'gonderildi', gonderilen: 1 + n, dusurulen: 0, http: 200 })

    // AÇIK: dizine kapalı EN sayfaları düşer, TR eşi gider.
    fetchSpy.mockClear()
    bayrak.acik = true
    const acik = await indexNowBildir(['/tr/bilgi-merkezi', ...ETKILENMEYEN_EN_YOLLAR])
    expect(yollar(fetchSpy)).toEqual(['/tr/bilgi-merkezi'])
    expect(acik).toEqual({ durum: 'gonderildi', gonderilen: 1, dusurulen: n, http: 200 })

    // AÇIK, yalnız EN etkilenmeyen yollar: istek yok, sebep bildirilecek-yol-yok.
    fetchSpy.mockClear()
    expect(await indexNowBildir(ETKILENMEYEN_EN_YOLLAR)).toEqual({
      durum: 'atlandi',
      sebep: 'bildirilecek-yol-yok',
      dusurulen: n,
    })
    expect(fetchSpy).not.toHaveBeenCalled()

    // EN yayına açılınca aynı yollar gider (iki yönlü kapı: bayrak gerçekten tüketiliyor).
    bayrak.enYayin = true
    await indexNowBildir(ETKILENMEYEN_EN_YOLLAR)
    expect(yollar(fetchSpy)).toEqual(ETKILENMEYEN_EN_YOLLAR)
  })
})

describe('INV-INDEXNOW-2 · IndexNow yanıtı: 2xx DIŞI sessiz kalmaz (URN-10)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.INDEXNOW_KEY
    delete process.env.INDEXNOW_KAPALI
    bayraklariSifirla()
  })

  afterEach(() => {
    bayraklariSifirla()
    vi.restoreAllMocks()
  })

  it.each([300, 400, 403, 422, 429, 500, 503])(
    '⭐%i → durum reddedildi + http kodu + console.error (eskiden "gonderildi" dönerdi)',
    async (kod) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: kod }))
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const sonuc = await indexNowBildir([...ETKILENMEYEN_YOLLAR, '/tr/products/a'])

      expect(sonuc).toEqual({
        durum: 'reddedildi',
        denenen: ETKILENMEYEN_YOLLAR.length,
        dusurulen: 1,
        http: kod,
      })
      expect(errorSpy, 'reddedilen yanıt günlüğe yazılmadı').toHaveBeenCalledTimes(1)
      expect(String(errorSpy.mock.calls[0]?.[0])).toContain(`http=${kod}`)
    },
  )

  it.each([200, 202, 204, 299])('%i → gonderildi ve günlük YOK', async (kod) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: kod }))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const sonuc = await indexNowBildir(ETKILENMEYEN_YOLLAR)

    expect(sonuc).toEqual({ durum: 'gonderildi', gonderilen: ETKILENMEYEN_YOLLAR.length, dusurulen: 0, http: kod })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('reddedilen yanıt da THROW ETMEZ (webhook düşmez) ve gövdede anahtar/yol listesi günlüğe sızmaz', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"hata":"x"}', { status: 403 }))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(indexNowBildir(ETKILENMEYEN_YOLLAR)).resolves.toMatchObject({ durum: 'reddedildi', http: 403 })

    const gunluk = errorSpy.mock.calls.flat().map(String).join(' ')
    expect(gunluk).not.toContain(INDEXNOW_ANAHTARI)
    expect(gunluk).not.toContain('/tr/bilgi-merkezi')
  })
})
