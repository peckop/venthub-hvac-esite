// @vitest-environment node
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { bilgiMerkeziYonlendirmeleri } from '../../config/bilgiMerkeziYonlendirmeleri.mjs'
import {
  ASAMA_2_ONEKLERI,
  ROTA_DILI,
  rotaDiliHedefleriniYenile,
  rotaDiliYenidenYazimlari,
  rotaDiliYonlendirmeleri,
  zincirVarMi,
} from '../../config/rotaDili.mjs'

/**
 * INV-ROTA-DILI-ACIK-1 — AÇIK KİP KAPILARI (OPS-52 PR-D; cetvel rota-dili-standard.md §2 "Açık kip kapıları"):
 * tek hop, hedef 200 (sayfa dosyası var), hreflang karşılıklı, kanonik = sitemap, eski adrese href 0,
 * Aşama 2 eski adreste. Tablo VERİDEN okunur: Design'ın sayfaları tabloya girdikçe kapı kendiliğinden büyür;
 * yeni satırların tam değerleri yalnız "KESİN DEĞERLER" bölümünde literal olarak sabitlenir.
 *
 * ÖLÇMEDİĞİ: `next dev` / derlenmiş uygulamada gerçek HTTP davranışı (rewrite sonrası 200) — o PR-B'nin
 * matris betiğiyle (Kapı 2) ve önizleme dağıtımında ölçülür; burada kural listeleri ve dosya varlığı ölçülür.
 */

const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]
const KOK = process.cwd()
const APP = join(KOK, 'src', 'app', '[lang]')
const DILLER = ['tr', 'en'] as const
const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
const EN = 'en-US,en;q=0.9'

type Kural = { source: string; destination: string; permanent?: boolean }
type Satir = { id: string; klasor: string; tr: string; en: string; altYollar?: boolean }
const TABLO: Satir[] = ROTA_DILI

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.doUnmock('@/config/features')
  vi.doUnmock('@/lib/adres/rotaDiliTablo')
  vi.doUnmock('@/lib/supabase/static')
  vi.doUnmock('@/lib/services/category.service')
  vi.doUnmock('@/lib/services/family.service')
  vi.unstubAllEnvs()
  vi.resetModules()
})

/** `/:lang(tr|en)` kaynaklı/hedefli kuralı iki dile açar (karşılaştırma kolaylığı). */
function ac(kural: Kural): Kural[] {
  if (!kural.source.startsWith('/:lang(tr|en)')) return [kural]
  return DILLER.map((dil) => ({
    ...kural,
    source: kural.source.replace('/:lang(tr|en)', `/${dil}`),
    destination: kural.destination.replace(/^\/:lang(?=\/|$)/, `/${dil}`),
  }))
}

/** Gerçek next.config'i verilen anahtarla TAZE yükler. */
async function yapilandirma(anahtar: string | undefined) {
  if (anahtar === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = anahtar
  vi.resetModules()
  const { default: cfg } = await import('../../../next.config.mjs')
  const rewrites = await cfg.rewrites?.()
  const beforeFiles = (Array.isArray(rewrites) ? [] : (rewrites?.beforeFiles ?? [])) as Kural[]
  const redirects = ((await cfg.redirects?.()) ?? []) as Kural[]
  return { redirects, beforeFiles }
}

/** Adres üreten modülleri anahtar + EN yayın kipiyle TAZE yükler. */
async function modul(enYayin: boolean) {
  process.env[ANAHTAR] = '1'
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: enYayin,
  }))
  const { localizedHref } = await import('../../utils/routes')
  const { SITE_URL } = await import('../../config/siteUrl')
  return { localizedHref, SITE_URL }
}

async function siteHaritasi(enYayin: boolean) {
  const { SITE_URL } = await modul(enYayin)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
  vi.doMock('@/lib/supabase/static', () => {
    const zincir = {
      select: () => zincir,
      is: () => zincir,
      range: async () => ({ data: [{ slug: 'test-aile-1', updated_at: '2026-08-27T00:00:00.000Z', products: [] }], error: null }),
    }
    return { supabaseStaticClient: { from: () => zincir, rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }], error: null }) } }
  })
  vi.doMock('@/lib/services/category.service', () => ({
    getCategories: async () => [
      { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
    ],
  }))
  vi.doMock('@/lib/services/family.service', async (orijinal) => ({
    ...(await orijinal<typeof import('@/lib/services/family.service')>()),
    getAllFamilySlugs: async () => [{ slug: 'test-aile-1' }],
  }))
  const { default: sitemap } = await import('../../app/sitemap')
  return { satirlar: await sitemap(), SITE_URL }
}

const degisenler = (dil: 'tr' | 'en') => TABLO.filter((s) => s[dil] !== s.klasor)

describe('1. TABLO ↔ DİSK — her satırın sayfası var, yeni adres başka sayfayla çakışmaz', () => {
  const ustKlasorler = readdirSync(APP, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)

  it('ÖN KOŞUL — tablo en az 8 satır, üst klasör listesi dolu (boş evrende yeşil kapı ölçüm değildir)', () => {
    expect(TABLO.length).toBeGreaterThanOrEqual(8)
    expect(ustKlasorler).toEqual(expect.arrayContaining(['about', 'contact', 'destek', 'legal', 'urun-secici']))
  })

  it.each(TABLO.map((s) => [s.id, s] as const))('%s: klasörün page.tsx dosyası VAR', (_id, satir) => {
    expect(existsSync(join(APP, ...satir.klasor.split('/'), 'page.tsx')), `src/app/[lang]/${satir.klasor}/page.tsx yok`).toBe(true)
  })

  it('yeni görünen yolun ilk parçası, kendi klasörünün ilk parçası dışında hiçbir app üst klasörüyle çakışmaz', () => {
    for (const s of TABLO) {
      for (const dil of DILLER) {
        const ilk = s[dil].split('/')[0]
        const kendi = s.klasor.split('/')[0]
        if (ilk === kendi) continue
        expect(ustKlasorler, `${s.id} ${dil}: "${s[dil]}" → "${ilk}" bir app klasörü`).not.toContain(ilk)
      }
    }
  })

  it('yeni görünen yol, klasöründen farklıysa gerçek bir sayfa dosyasına denk GELMEZ (iki sayfa tek adreste yaşamaz)', () => {
    for (const s of TABLO) {
      for (const dil of DILLER) {
        if (s[dil] === s.klasor) continue
        expect(existsSync(join(APP, ...s[dil].split('/'), 'page.tsx')), `${s.id} ${dil}: ${s[dil]}`).toBe(false)
      }
    }
  })
})

describe('2. GERÇEK next.config (anahtar 1) — tek hop, rewrite, zincir yok', () => {
  it('redirects: zincir/döngü YOK (tüm kurallar, mevcut + rota dili)', async () => {
    const { redirects } = await yapilandirma('1')
    const bulgu = zincirVarMi(redirects)
    expect(bulgu, bulgu ? `${bulgu.kaynak.source} → ${bulgu.kaynak.destination} sonra ${bulgu.hedef.source}` : '').toBeNull()
  }, 60_000)

  it('her satır × dil: eski dilli adres → TEK permanent kural, hedef = görünen yol', async () => {
    const { redirects } = await yapilandirma('1')
    const acik = redirects.flatMap(ac)
    for (const dil of DILLER) {
      for (const s of degisenler(dil)) {
        const kaynak = `/${dil}/${s.klasor}${s.altYollar ? '/:path*' : ''}`
        const kurallar = acik.filter((k) => k.source === kaynak)
        expect(kurallar, `${dil} ${s.id}: ${kaynak}`).toHaveLength(1)
        expect(kurallar[0].destination).toBe(`/${dil}/${s[dil]}${s.altYollar ? '/:path*' : ''}`)
        expect(kurallar[0].permanent).toBe(true)
      }
    }
  }, 60_000)

  it('yeni adres → rewrite → klasör (her satır × dil); klasörle aynı kalan dilde kural YOK', async () => {
    const { beforeFiles } = await yapilandirma('1')
    for (const dil of DILLER) {
      for (const s of TABLO) {
        const kaynak = `/${dil}/${s[dil]}${s.altYollar ? '/:path*' : ''}`
        const eslesen = beforeFiles.filter((k) => k.source === kaynak)
        if (s[dil] === s.klasor) {
          expect(eslesen, `${dil} ${s.id}`).toHaveLength(0)
        } else {
          expect(eslesen, `${dil} ${s.id}`).toHaveLength(1)
          expect(eslesen[0].destination).toBe(`/${dil}/${s.klasor}${s.altYollar ? '/:path*' : ''}`)
        }
      }
    }
    expect(beforeFiles).toEqual(rotaDiliYenidenYazimlari(true))
  }, 60_000)

  it('rewrite zinciri YOK; hiçbir redirect rewrite\'ın iç hedefine (klasör adresine) varmaz', async () => {
    const { redirects, beforeFiles } = await yapilandirma('1')
    expect(zincirVarMi(beforeFiles)).toBeNull()
    // NOT: bir rewrite hedefi (iç klasör adresi) kendi satırının redirect KAYNAĞIDIR; bu tasarım gereğidir ve güvenlidir
    // (Next sırası: redirects → middleware → beforeFiles rewrites; rewrite sonrası redirect yeniden koşmaz — PR-A spike'ı).
    // Tehlike TERSİDİR: bir redirect'in HEDEFİNİN iç klasör adresi olması → ziyaretçi 308 veren adrese gönderilirdi.
    const icAdresler = new Set(beforeFiles.map((k) => k.destination))
    for (const k of redirects.flatMap(ac)) expect(icAdresler.has(k.destination), `${k.source} → ${k.destination}`).toBe(false)
  }, 60_000)

  it('rota dili kuralları tablodan beklenen listeyle birebir (anahtar 1 çıktısının kuyruğu)', async () => {
    const { redirects } = await yapilandirma('1')
    const rd = rotaDiliYonlendirmeleri(true)
    expect(redirects.slice(redirects.length - rd.length)).toEqual(rd)
  }, 60_000)
})

describe('3. HEDEF YENİLEME — mevcut kuralların hedefleri tabloyla yenilenir', () => {
  it('hesaplayicilar kuralı açıkta /tr → /tr/secici, /en → /en/selector (iki kurala bölünür)', async () => {
    const { redirects } = await yapilandirma('1')
    const tr = redirects.find((k) => k.source === '/tr/destek/hesaplayicilar')
    const en = redirects.find((k) => k.source === '/en/destek/hesaplayicilar')
    expect(tr).toMatchObject({ destination: '/tr/secici', permanent: true })
    expect(en).toMatchObject({ destination: '/en/selector', permanent: true })
    expect(redirects.some((k) => k.source === '/:lang(tr|en)/destek/hesaplayicilar')).toBe(false)
  }, 60_000)

  it('bilgi merkezi EN-kapalı kuralları (merkez, konular, konular/:eski*) /en/selector\'a gider', async () => {
    const { redirects } = await yapilandirma('1')
    for (const kaynak of ['/en/destek/merkez', '/en/destek/konular', '/en/destek/konular/:eski*']) {
      expect(redirects.find((k) => k.source === kaynak), kaynak).toMatchObject({ destination: '/en/selector' })
    }
    // Hiçbir mevcut kural eski klasör adresini hedeflemez (zincirin kaynağı): urun-secici yalnız rota dili KAYNAĞINDA kalır.
    const eskiHedefli = redirects.filter((k) => ac(k).some((a) => /\/urun-secici(\/|$|\?)/.test(a.destination)))
    expect(eskiHedefli).toEqual([])
  }, 60_000)

  it('kapalı kipte next.config çıktısı bugünküyle aynı: hedefler yenilenmez (hesaplayicilar kuralı /:lang/urun-secici)', async () => {
    for (const anahtar of [undefined, '0']) {
      const { redirects, beforeFiles } = await yapilandirma(anahtar)
      expect(redirects.find((k) => k.source === '/:lang(tr|en)/destek/hesaplayicilar')).toMatchObject({ destination: '/:lang/urun-secici' })
      expect(redirects.find((k) => k.source === '/en/destek/merkez')).toMatchObject({ destination: '/en/urun-secici' })
      expect(beforeFiles).toEqual([])
    }
  }, 60_000)

  it('yenilenmiş bilgi merkezi kuralları iki EN kipinde de rota dili kurallarıyla zincirsiz; yenilenmemişse zincir kurulur', () => {
    for (const enYayin of [false, true]) {
      const ham = bilgiMerkeziYonlendirmeleri(enYayin)
      const yenilenmis = rotaDiliHedefleriniYenile(ham, true, ROTA_DILI)
      expect(yenilenmis.length).toBeGreaterThanOrEqual(ham.length)
      const bulgu = zincirVarMi([...yenilenmis, ...rotaDiliYonlendirmeleri(true)])
      expect(bulgu, `EN_YAYIN=${enYayin}`).toBeNull()
      // Yenilenmemiş düzen EN kapalıyken ZİNCİR kurar (ölçüm ayırt ediyor): /en/urun-secici hem hedef hem kaynak.
      if (!enYayin) expect(zincirVarMi([...ham, ...rotaDiliYonlendirmeleri(true)])).not.toBeNull()
    }
  })
})

describe('4. ADRES ÜRETİMİ (açık kip) — iç bağlantı, kanonik, hreflang, site haritası', () => {
  it('localizedHref(/klasor, dil) = /dil/görünen yol — her satır × dil; sorgu korunur', async () => {
    const { localizedHref } = await modul(false)
    for (const s of TABLO) {
      for (const dil of DILLER) {
        expect(localizedHref(`/${s.klasor}`, dil), `${s.id} ${dil}`).toBe(`/${dil}/${s[dil]}`)
        expect(localizedHref(`/${s.klasor}?x=1#y`, dil), `${s.id} ${dil}`).toBe(`/${dil}/${s[dil]}?x=1#y`)
      }
    }
  })

  it('site haritası (EN_YAYIN açık): sitemap\'teki statik tablo sayfaları yeni adres, ESKİ adres 0', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi(true)
    const urller = new Set(satirlar.map((s) => s.url))
    const sitemapteki = TABLO.filter((s) => [...urller].some((u) => u === `${SITE_URL}/tr/${s.tr}`))
    expect(sitemapteki.map((s) => s.id)).toEqual(expect.arrayContaining(['hakkimizda', 'iletisim', 'secici', 'yasal-kvkk', 'yasal-gizlilik', 'yasal-cerez']))
    for (const s of sitemapteki) {
      for (const dil of DILLER) {
        expect(urller.has(`${SITE_URL}/${dil}/${s[dil]}`), `${s.id} ${dil} yeni adres`).toBe(true)
        if (s[dil] !== s.klasor) expect(urller.has(`${SITE_URL}/${dil}/${s.klasor}`), `${s.id} ${dil} ESKİ adres`).toBe(false)
      }
    }
    // Hiçbir sitemap adresi bir rota dili yönlendirme kaynağı değil.
    const kaynaklar = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const u of urller) expect(kaynaklar.has(u.replace(SITE_URL, '')), u).toBe(false)
  }, 60_000)

  it('site haritası (EN_YAYIN kapalı): yalnız TR satırı, yeni adres; /en yok', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi(false)
    const urller = satirlar.map((s) => s.url)
    expect(urller).toContain(`${SITE_URL}/tr/secici`)
    expect(urller).not.toContain(`${SITE_URL}/tr/urun-secici`)
    expect(urller.some((u) => u.includes('/en/'))).toBe(false)
  }, 60_000)

  /** Sitemap'te yer alan sayfaların gerçek generateMetadata'sı (canonical = sitemap adresi, hreflang karşılıklı). */
  const SAYFALAR = {
    'urun-secici': () => import('../../app/[lang]/urun-secici/page'),
    'legal/kvkk': () => import('../../app/[lang]/legal/kvkk/page'),
    'legal/gizlilik-politikasi': () => import('../../app/[lang]/legal/gizlilik-politikasi/page'),
    'legal/cerez-politikasi': () => import('../../app/[lang]/legal/cerez-politikasi/page'),
    'legal/mesafeli-satis-sozlesmesi': () => import('../../app/[lang]/legal/mesafeli-satis-sozlesmesi/page'),
    'destek/sss': () => import('../../app/[lang]/destek/sss/page'),
    about: () => import('../../app/[lang]/about/page'),
    contact: () => import('../../app/[lang]/contact/page'),
  } as const

  it('⭐KANONİK = SİTEMAP ADRESİ ve hreflang KARŞILIKLI yeni adres (EN_YAYIN açık): sitemap\'teki her tablo sayfası', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi(true)
    const urller = new Set(satirlar.map((s) => s.url))
    for (const [klasor, yukle] of Object.entries(SAYFALAR)) {
      const satir = TABLO.find((s) => s.klasor === klasor)
      expect(satir, `${klasor} tabloda yok`).toBeDefined()
      if (!satir) continue
      const sayfa = await yukle()
      const tr = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })
      const en = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
      expect(tr.alternates?.canonical, `${klasor} tr`).toBe(`${SITE_URL}/tr/${satir.tr}`)
      expect(en.alternates?.canonical, `${klasor} en`).toBe(`${SITE_URL}/en/${satir.en}`)
      if (urller.has(`${SITE_URL}/tr/${satir.tr}`)) {
        expect(urller.has(String(tr.alternates?.canonical)), `${klasor}: kanonik sitemap'te`).toBe(true)
        expect(urller.has(String(en.alternates?.canonical)), `${klasor}: EN kanonik sitemap'te`).toBe(true)
      }
      // hreflang KARŞILIKLI: iki dilin sayfası aynı çifti bildirir ve çift kendi kanoniklerine işaret eder.
      expect(tr.alternates?.languages, klasor).toEqual({ tr: tr.alternates?.canonical, en: en.alternates?.canonical, 'x-default': tr.alternates?.canonical })
      expect(en.alternates?.languages, klasor).toEqual(tr.alternates?.languages)
    }
  }, 120_000)

  it('EN_YAYIN kapalıyken hreflang YOK, canonical yeni adres', async () => {
    const { SITE_URL } = await modul(false)
    const sayfa = await SAYFALAR['legal/kvkk']()
    const tr = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })
    expect(tr.alternates?.languages).toBeUndefined()
    expect(tr.alternates?.canonical).toBe(`${SITE_URL}/tr/yasal/kvkk-aydinlatma-metni`)
  }, 60_000)

  it('canonical hiçbir zaman 308 veren eski adres değil (tüm sayfalar × iki dil)', async () => {
    const { SITE_URL } = await modul(true)
    const eskiler = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const [klasor, yukle] of Object.entries(SAYFALAR)) {
      const sayfa = await yukle()
      for (const lang of DILLER) {
        const veri = await sayfa.generateMetadata({ params: Promise.resolve({ lang }) })
        const yol = String(veri.alternates?.canonical).replace(SITE_URL, '')
        expect(eskiler.has(yol), `${klasor} ${lang}: canonical ${yol}`).toBe(false)
      }
    }
  }, 120_000)

  it('eski adrese href 0: vekilin (header / footer / menü) üretebildiği HİÇBİR bağlantı bir rota dili yönlendirme kaynağı değil', async () => {
    const { localizedHref } = await modul(false)
    const { Routes } = await import('../../utils/routes')
    const kaynaklar = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    const cikti: string[] = []
    const gez = (agac: object) => {
      for (const deger of Object.values(agac)) {
        if (typeof deger === 'function') {
          for (const dil of DILLER) cikti.push(localizedHref(String(Reflect.apply(deger, null, [])), dil))
        } else if (deger !== null && typeof deger === 'object') gez(deger)
      }
    }
    gez(Routes)
    expect(cikti.length).toBeGreaterThan(50)
    for (const u of cikti) expect(kaynaklar.has(u.split('?')[0]), u).toBe(false)
  })
})

describe('5. AŞAMA 2 ve admin / api — açık kipte hiçbir redirect / rewrite onlara dokunmaz', () => {
  it('kaynak ve hedeflerde account, cart, checkout, auth, payment-success, admin, api, _next ağaçları YOK', async () => {
    const { redirects, beforeFiles } = await yapilandirma('1')
    const yasak = new Set<string>([...ASAMA_2_ONEKLERI, 'admin', 'api', '_next'])
    const ilkParca = (yol: string) => yol.replace(/^\/(?:tr|en)(?=\/|$)/, '').split('/')[1]
    for (const k of [...redirects, ...beforeFiles].flatMap(ac)) {
      expect(yasak.has(ilkParca(k.source)), `kaynak ${k.source}`).toBe(false)
      expect(yasak.has(ilkParca(k.destination)), `hedef ${k.destination}`).toBe(false)
    }
  }, 60_000)

  it('tablo kuralları Aşama 2 ağaçlarını üretmez', () => {
    const yasak = new Set<string>([...ASAMA_2_ONEKLERI, 'admin', 'api'])
    for (const k of [...rotaDiliYonlendirmeleri(true), ...rotaDiliYenidenYazimlari(true)]) {
      expect(yasak.has(k.source.split('/')[2]), k.source).toBe(false)
      expect(yasak.has(k.destination.split('/')[2]), k.destination).toBe(false)
    }
  })
})

describe('6. DİLSİZ (gerçek middleware) — tek sıçrama, görünen yola', () => {
  async function istek(yol: string, dilBasligi: string, tablo?: Satir[]) {
    process.env[ANAHTAR] = '1'
    vi.resetModules()
    if (tablo) {
      vi.doMock('@/lib/adres/rotaDiliTablo', async (orijinal) => {
        const o = await orijinal<typeof import('@/lib/adres/rotaDiliTablo')>()
        const cekirdek = await import('@/config/rotaDiliCekirdek.mjs')
        return {
          ...o,
          ADRES_DILI_ACIK: true,
          rotaDiliDilsizOku: (y: string) => {
            const e = cekirdek.rotaDiliEsle(y, tablo, true)
            return e ? { tr: e.tr, en: e.en } : null
          },
        }
      })
    }
    const { middleware } = await import('@/middleware')
    const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', 'accept-language': dilBasligi } })
    const res = await middleware(req)
    const konum = res.headers.get('location')
    return { durum: res.status, konum: konum ? new URL(konum).pathname + new URL(konum).search : null }
  }

  it('her satırın dilsiz klasör adresi: TR başlık → /tr/<tr>, EN başlık → /en/<en> (tek 307)', async () => {
    for (const s of TABLO) {
      expect(await istek(`/${s.klasor}`, TR_CHROME), `${s.id} tr`).toEqual({ durum: 307, konum: `/tr/${s.tr}` })
      expect(await istek(`/${s.klasor}`, EN), `${s.id} en`).toEqual({ durum: 307, konum: `/en/${s.en}` })
    }
  }, 60_000)

  it('sorgu dizesi korunur (gerçek satırlarla)', async () => {
    expect(await istek('/urun-secici?arac=kanal', TR_CHROME)).toEqual({ durum: 307, konum: '/tr/secici?arac=kanal' })
    expect(await istek('/destek/sss?q=iade', EN)).toEqual({ durum: 307, konum: '/en/faq?q=iade' })
  }, 60_000)

  it('altYollar\'lı örnek satır: kuyruk ve sorgu iki dile taşınır', async () => {
    const tablo: Satir[] = [...TABLO, { id: 'deney', klasor: 'deney', tr: 'deneme', en: 'trial', altYollar: true }]
    expect(await istek('/deney/alt/yol?x=1', TR_CHROME, tablo)).toEqual({ durum: 307, konum: '/tr/deneme/alt/yol?x=1' })
    expect(await istek('/deney', EN, tablo)).toEqual({ durum: 307, konum: '/en/trial' })
  }, 60_000)

  it('Aşama 2 yüzeyleri eskisi gibi (bugünkü dil öneki 307\'si), kol ellemez', async () => {
    for (const yol of ['/cart', '/account', '/checkout', '/auth/login', '/payment-success']) {
      expect(await istek(yol, TR_CHROME), yol).toEqual({ durum: 307, konum: `/tr${yol}` })
    }
  }, 60_000)
})

describe('KESİN DEĞERLER — OPS-52 PR-D\'nin 6 yeni satırı literal (tablo bunlardan sapamaz)', () => {
  const BEKLENEN = [
    { id: 'secici', klasor: 'urun-secici', tr: 'secici', en: 'selector' },
    { id: 'sss', klasor: 'destek/sss', tr: 'sss', en: 'faq' },
    { id: 'yasal-kvkk', klasor: 'legal/kvkk', tr: 'yasal/kvkk-aydinlatma-metni', en: 'legal/privacy-notice-kvkk' },
    { id: 'yasal-gizlilik', klasor: 'legal/gizlilik-politikasi', tr: 'yasal/gizlilik-politikasi', en: 'legal/privacy-policy' },
    { id: 'yasal-cerez', klasor: 'legal/cerez-politikasi', tr: 'yasal/cerez-politikasi', en: 'legal/cookie-policy' },
    { id: 'yasal-mesafeli', klasor: 'legal/mesafeli-satis-sozlesmesi', tr: 'yasal/mesafeli-satis-sozlesmesi', en: 'legal/distance-sales-contract' },
  ]

  it('tablo karar 267/269 satırları + 6 yeni satır literal değerlerle birebir', () => {
    expect(TABLO.map((s) => s.id)).toEqual(['hakkimizda', 'iletisim', ...BEKLENEN.map((b) => b.id)])
    for (const b of BEKLENEN) expect(TABLO.find((s) => s.id === b.id)).toEqual(b)
  })

  it('üretilen kural değerleri literal: redirect ve rewrite', () => {
    const r = rotaDiliYonlendirmeleri(true)
    const w = rotaDiliYenidenYazimlari(true)
    const hedefler: [string, string][] = [
      ['/tr/urun-secici', '/tr/secici'],
      ['/en/urun-secici', '/en/selector'],
      ['/tr/destek/sss', '/tr/sss'],
      ['/en/destek/sss', '/en/faq'],
      ['/tr/legal/kvkk', '/tr/yasal/kvkk-aydinlatma-metni'],
      ['/en/legal/kvkk', '/en/legal/privacy-notice-kvkk'],
      ['/tr/legal/gizlilik-politikasi', '/tr/yasal/gizlilik-politikasi'],
      ['/en/legal/gizlilik-politikasi', '/en/legal/privacy-policy'],
      ['/tr/legal/cerez-politikasi', '/tr/yasal/cerez-politikasi'],
      ['/en/legal/cerez-politikasi', '/en/legal/cookie-policy'],
      ['/tr/legal/mesafeli-satis-sozlesmesi', '/tr/yasal/mesafeli-satis-sozlesmesi'],
      ['/en/legal/mesafeli-satis-sozlesmesi', '/en/legal/distance-sales-contract'],
    ]
    for (const [eski, yeni] of hedefler) {
      expect(r, eski).toContainEqual({ source: eski, destination: yeni, permanent: true })
      expect(w, yeni).toContainEqual({ source: yeni, destination: eski })
    }
    expect(r).toHaveLength(14) // 12 + hakkımızda/iletişim TR
    expect(w).toHaveLength(14)
  })

  it('Aşama 1 dışında kalanlar tabloda YOK: garanti-servis, iade-degisim, teslimat-kargo, hesaplayicilar, kullanim-kosullari, on-bilgilendirme-formu', () => {
    const klasorler = new Set(TABLO.map((s) => s.klasor))
    for (const disarida of [
      'destek/garanti-servis',
      'destek/iade-degisim',
      'destek/teslimat-kargo',
      'destek/hesaplayicilar',
      'legal/kullanim-kosullari',
      'legal/on-bilgilendirme-formu',
    ]) {
      expect(klasorler.has(disarida), disarida).toBe(false)
    }
  })
})
