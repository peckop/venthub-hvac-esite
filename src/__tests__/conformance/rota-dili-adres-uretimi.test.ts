// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { bilgiMerkeziYonlendirmeleri, EN_KAPALI_LISTE_HEDEFI } from '../../config/bilgiMerkeziYonlendirmeleri.mjs'
import { ROTA_DILI, rotaDiliHedefleriniYenile, rotaDiliYonlendirmeleri, zincirVarMi } from '../../config/rotaDili.mjs'

/**
 * INV-ROTA-DILI-KAPALI-2 + açık kip kabul ölçütleri — ADRES ÜRETİMİ (OPS-52 PR-C1).
 *
 * KAPALI kip: anahtar (`NEXT_PUBLIC_ADRES_DILI`) yok / `0` / `true` iken adres üreten üç yüzeyin çıktısı
 * (`localizedHref` x tüm `Routes` x iki dil, `dilDegistirYolu`, site haritası) işe BAŞLAMADAN ÖNCE alınan
 * fikstürle derin eşittir. AÇIK kip: spike'ın üç bulgusu (dil değiştirici 404, canonical eski adres,
 * iç bağlantı eski adres) test olarak sabitlenir. ALT-14 (Bilgi Merkezi dil değiştirici) anahtardan
 * BAĞIMSIZDIR ve iki kipte de ölçülür.
 */

const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]
const FIKSTUR = JSON.parse(
  readFileSync(join(process.cwd(), 'src', '__tests__', 'conformance', 'fikstur', 'rota-dili-kapali-2-oncesi.json'), 'utf8'),
) as {
  localizedHref: Record<string, Record<string, string>>
  dilDegistirYolu: Record<string, string>
  sitemap: Record<string, { url: string; alternates: unknown }[]>
}

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.doUnmock('@/config/features')
  vi.doUnmock('@/lib/supabase/static')
  vi.doUnmock('@/lib/services/category.service')
  vi.doUnmock('@/lib/services/family.service')
  vi.unstubAllEnvs()
  vi.resetModules()
})

/** Anahtarı ve EN yayını ayarlayıp modülleri TAZE yükler (anahtar derleme anı sabitidir). */
async function yukle(anahtar: string | undefined, enYayin = false) {
  if (anahtar === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = anahtar
  vi.resetModules()
  vi.doMock('@/config/features', async (orijinal) => ({
    ...(await orijinal<typeof import('@/config/features')>()),
    EN_YAYIN: enYayin,
  }))
  const routes = await import('../../utils/routes')
  const yuzey = await import('../../utils/yuzeyAdresleri')
  const ustVeri = await import('../../lib/seo/sayfaUstVerisi')
  const { SITE_URL } = await import('../../config/siteUrl')
  return { ...routes, ...yuzey, ...ustVeri, SITE_URL }
}

/** Sahte katalogla site haritası (sitemapModel.test.ts kalıbı). */
async function siteHaritasi(anahtar: string | undefined, enYayin: boolean) {
  const m = await yukle(anahtar, enYayin)
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
  const satirlar = await sitemap()
  return { satirlar, SITE_URL: m.SITE_URL }
}

/** `Routes` ağacını gezip her fonksiyonu argümansız ve örnek argümanlı çağırır (fikstür üretimiyle AYNI). */
function localizedCiktilar(localizedHref: (url: string, lang: string) => string, Routes: object, dil: string) {
  const cikti: Record<string, string> = {}
  const gez = (agac: object, onek: string) => {
    for (const [ad, deger] of Object.entries(agac)) {
      const yol = onek ? `${onek}.${ad}` : ad
      if (typeof deger === 'function') {
        cikti[`${yol}()`] = localizedHref(String(Reflect.apply(deger, null, [])), dil)
        cikti[`${yol}(ornek-slug,ornek-alt)`] = localizedHref(String(Reflect.apply(deger, null, ['ornek-slug', 'ornek-alt'])), dil)
      } else if (deger !== null && typeof deger === 'object') gez(deger, yol)
    }
  }
  gez(Routes, '')
  return cikti
}

describe('INV-ROTA-DILI-KAPALI-2 — anahtar kapalı → adres üretimi işe başlamadan önceki fikstürle DERİN EŞİT', () => {
  it('ÖN KOŞUL — fikstür dolu evren', () => {
    expect(Object.keys(FIKSTUR.localizedHref.tr).length).toBeGreaterThan(80)
    expect(FIKSTUR.localizedHref.tr['about()']).toBe('/tr/about')
    expect(FIKSTUR.sitemap['EN_YAYIN=true'].length).toBeGreaterThan(20)
    expect(Object.keys(FIKSTUR.dilDegistirYolu).length).toBeGreaterThan(40)
  })

  it.each([
    ['tanımsız', undefined],
    ['0', '0'],
    ['true', 'true'],
    ['boş', ''],
  ])('anahtar %s → localizedHref x tüm Routes x {tr,en} ve dilDegistirYolu fikstürle aynı', async (_ad, anahtar) => {
    const m = await yukle(anahtar)
    for (const dil of ['tr', 'en']) {
      expect(localizedCiktilar(m.localizedHref, m.Routes, dil), dil).toEqual(FIKSTUR.localizedHref[dil])
    }
    const dd: Record<string, string> = {}
    for (const anahtarYol of Object.keys(FIKSTUR.dilDegistirYolu)) {
      const [yol, hedef] = anahtarYol.split(' -> ')
      dd[anahtarYol] = m.dilDegistirYolu(yol, hedef as 'tr' | 'en')
    }
    expect(dd).toEqual(FIKSTUR.dilDegistirYolu)
  })

  it.each([
    ['tanımsız', undefined],
    ['0', '0'],
  ])('anahtar %s → site haritası (EN_YAYIN kapalı ve açık) fikstürle aynı', async (_ad, anahtar) => {
    for (const enYayin of [false, true]) {
      const { satirlar } = await siteHaritasi(anahtar, enYayin)
      const gercek = satirlar.map((s) => ({ url: s.url, alternates: s.alternates ?? null }))
      expect(gercek, `EN_YAYIN=${enYayin}`).toEqual(FIKSTUR.sitemap[`EN_YAYIN=${enYayin}`])
    }
  }, 30_000)

  it('⛔DUYARLILIK: anahtar "1" iken aynı karşılaştırma FARKLI çıkar (fikstür ayırt ediyor)', async () => {
    const m = await yukle('1')
    expect(localizedCiktilar(m.localizedHref, m.Routes, 'tr')).not.toEqual(FIKSTUR.localizedHref.tr)
    const { satirlar } = await siteHaritasi('1', true)
    expect(satirlar.map((s) => ({ url: s.url, alternates: s.alternates ?? null }))).not.toEqual(FIKSTUR.sitemap['EN_YAYIN=true'])
  }, 30_000)

  it('anahtar "1" iken yalnız rota dili satırlarının adresleri değişir: gerisi fikstürle aynı', async () => {
    const m = await yukle('1')
    const tr = localizedCiktilar(m.localizedHref, m.Routes, 'tr')
    const degisen = Object.keys(tr).filter((k) => tr[k] !== FIKSTUR.localizedHref.tr[k])
    expect(degisen.sort()).toEqual(
      expect.arrayContaining(['about()', 'contact()', 'contact(ornek-slug,ornek-alt)', 'urunSecici()', 'destek.sss()', 'legal.kvkk()']),
    )
    // Her değişiklik TABLODAN açıklanır: eski değer `/tr/<klasor>`, yeni değer `/tr/<satır.tr>` (sorgu hariç).
    const yolu = (u: string) => u.split('?')[0]
    for (const k of degisen) {
      const eski = yolu(FIKSTUR.localizedHref.tr[k])
      const satir = ROTA_DILI.find((r) => eski === `/tr/${r.klasor}`)
      expect(satir, `${k}: ${eski} tabloda yok`).toBeDefined()
      expect(yolu(tr[k]), k).toBe(`/tr/${satir?.tr}`)
    }
    // Tablodaki HER klasörün Routes karşılığı fikstürde var (gerçek Routes'a bağlı satır sessizce atlanmaz).
    for (const satir of ROTA_DILI) {
      const fikstur = Object.values(FIKSTUR.localizedHref.tr).filter((u) => yolu(u) === `/tr/${satir.klasor}`)
      expect(fikstur.length, `Routes'ta ${satir.klasor} yok`).toBeGreaterThan(0)
    }
  })
})

describe('açık kip — iç bağlantılar (header / footer / navigationConfig) yeni adresi taşır', () => {
  it('localizedHref: dilsiz klasör yolu dilde görünen yola çevrilir, sorgu korunur', async () => {
    const m = await yukle('1')
    expect(m.localizedHref(m.Routes.about(), 'tr')).toBe('/tr/hakkimizda')
    expect(m.localizedHref(m.Routes.about(), 'en')).toBe('/en/about')
    expect(m.localizedHref(m.Routes.contact(), 'tr')).toBe('/tr/iletisim')
    expect(m.localizedHref(m.Routes.contact(), 'en')).toBe('/en/contact')
    expect(m.localizedHref(m.Routes.contact('satis'), 'tr')).toBe('/tr/iletisim?dept=satis')
    expect(m.localizedHref('/about#ekip', 'tr')).toBe('/tr/hakkimizda#ekip')
  })

  it('dokunulmayanlar: dil önekli, /admin, /api, tabloda olmayan yol, bilinmeyen dil, kök', async () => {
    const m = await yukle('1')
    expect(m.localizedHref('/tr/about', 'tr')).toBe('/tr/about')
    expect(m.localizedHref('/en/about', 'en')).toBe('/en/about')
    expect(m.localizedHref('/admin/about', 'tr')).toBe('/admin/about')
    expect(m.localizedHref('/api/contact', 'tr')).toBe('/api/contact')
    expect(m.localizedHref('/destek/iade-degisim', 'tr')).toBe('/tr/destek/iade-degisim') // tabloda, TR adresi klasörle aynı: bugünkü adres
    expect(m.localizedHref('/destek/hesaplayicilar', 'en')).toBe('/en/destek/hesaplayicilar') // tabloda yok: bugünkü adres
    expect(m.localizedHref('/about/ekip', 'tr')).toBe('/tr/about/ekip') // altYollar kapalı: alt yol bu satırın işi değil
    expect(m.localizedHref('/aboutx', 'tr')).toBe('/tr/aboutx')
    expect(m.localizedHref('/about', 'de')).toBe('/de/about')
    expect(m.localizedHref('/', 'tr')).toBe('/tr')
  })

  it('navigationConfig: ana menü about/contact bağlantıları localizedHref ile yeni adres', async () => {
    const m = await yukle('1')
    const { NAVIGATION_PRIMARY_ITEMS, NAVIGATION_SECONDARY_ITEMS } = await import('../../utils/navigationConfig')
    const ogeler = [...NAVIGATION_PRIMARY_ITEMS, ...NAVIGATION_SECONDARY_ITEMS]
    const bul = (id: string) => ogeler.find((o) => o.id === id)?.href ?? ''
    expect(bul('about')).toBe('/about')
    expect(m.localizedHref(bul('about'), 'tr')).toBe('/tr/hakkimizda')
    expect(m.localizedHref(bul('about'), 'en')).toBe('/en/about')
    expect(m.localizedHref(bul('contact'), 'tr')).toBe('/tr/iletisim')
    expect(m.localizedHref(bul('contact'), 'en')).toBe('/en/contact')
  })

  it('hiçbir iç bağlantı bugünkü eski adrese (308 verecek /tr/about, /tr/contact) işaret etmez', async () => {
    const m = await yukle('1')
    const eskiKaynaklar = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const dil of ['tr', 'en']) {
      for (const [ad, deger] of Object.entries(localizedCiktilar(m.localizedHref, m.Routes, dil))) {
        expect(eskiKaynaklar.has(deger.split('?')[0]), `${dil} ${ad} -> ${deger}`).toBe(false)
      }
    }
  })
})

describe('açık kip — dil değiştirici (spike bulgusu: /tr/iletisim EN\'e basınca /en/iletisim 404 idi)', () => {
  it('TR ↔ EN: hakkımızda ve iletişim doğru karşı adrese gider', async () => {
    const m = await yukle('1')
    expect(m.dilDegistirYolu('/tr/iletisim', 'en')).toBe('/en/contact')
    expect(m.dilDegistirYolu('/en/contact', 'tr')).toBe('/tr/iletisim')
    expect(m.dilDegistirYolu('/tr/hakkimizda', 'en')).toBe('/en/about')
    expect(m.dilDegistirYolu('/en/about', 'tr')).toBe('/tr/hakkimizda')
  })

  it('404 üretmez: çıktı hiçbir dilde eski klasör adı değil, hiçbir kuralın kaynağı değil (tek hop, 308 yok)', async () => {
    const m = await yukle('1')
    const kaynaklar = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const [yol, hedef] of [
      ['/tr/iletisim', 'en'],
      ['/en/contact', 'tr'],
      ['/tr/hakkimizda', 'en'],
      ['/en/about', 'tr'],
    ] as const) {
      const cikti = m.dilDegistirYolu(yol, hedef)
      expect(kaynaklar.has(cikti), `${yol} -> ${cikti} bir yönlendirme kaynağı`).toBe(false)
      expect(cikti).not.toMatch(/^\/en\/(iletisim|hakkimizda)$/)
    }
  })

  it('K3B bölüm çevirisi ve tabloda olmayan sayfalar etkilenmez', async () => {
    const m = await yukle('1')
    expect(m.dilDegistirYolu('/tr/destek/sss', 'en')).toBe('/en/destek/sss')
    expect(m.dilDegistirYolu('/tr/urun/storm-serisi', 'en', true)).toBe('/en/products/storm-serisi')
    expect(m.dilDegistirYolu('/en/category/fans', 'tr', false)).toBe('/tr/category/fans')
  })

  it('dilDegistirHedefi: sorgu dizesi ve parça korunur (ALT-14 b)', async () => {
    const m = await yukle('1')
    expect(m.dilDegistirHedefi('/tr/iletisim', 'en', '?dept=satis', '#form')).toBe('/en/contact?dept=satis#form')
    expect(m.dilDegistirHedefi('/en/about', 'tr', '', '#ekip')).toBe('/tr/hakkimizda#ekip')
    expect(m.dilDegistirHedefi('/tr/destek/sss', 'en', '?q=1')).toBe('/en/destek/sss?q=1')
  })

  it('kapalı kipte de sorgu / parça korunur (ALT-14 b anahtardan bağımsız)', async () => {
    const m = await yukle(undefined)
    expect(m.dilDegistirHedefi('/tr/contact', 'en', '?dept=satis', '#form')).toBe('/en/contact?dept=satis#form')
    expect(m.dilDegistirHedefi('/tr/contact', 'en')).toBe('/en/contact')
  })
})

describe('açık kip — kanonik, og:url ve hreflang yeni görünen adresi taşır (spike bulgusu: canonical /tr/about idi)', () => {
  async function ustVeri(sayfa: 'about' | 'contact', lang: 'tr' | 'en', enYayin: boolean) {
    const m = await yukle('1', enYayin)
    const modul = sayfa === 'about' ? await import('../../app/[lang]/about/page') : await import('../../app/[lang]/contact/page')
    const veri = await modul.generateMetadata({ params: Promise.resolve({ lang }) })
    return { veri, SITE_URL: m.SITE_URL }
  }

  it('hakkımızda: canonical = og:url = görünen adres (TR /tr/hakkimizda, EN /en/about)', async () => {
    const tr = await ustVeri('about', 'tr', true)
    expect(tr.veri.alternates?.canonical).toBe(`${tr.SITE_URL}/tr/hakkimizda`)
    expect(tr.veri.openGraph?.url).toBe(`${tr.SITE_URL}/tr/hakkimizda`)
    const en = await ustVeri('about', 'en', true)
    expect(en.veri.alternates?.canonical).toBe(`${en.SITE_URL}/en/about`)
    expect(en.veri.openGraph?.url).toBe(`${en.SITE_URL}/en/about`)
  })

  it('iletişim: canonical = og:url = görünen adres', async () => {
    const tr = await ustVeri('contact', 'tr', true)
    expect(tr.veri.alternates?.canonical).toBe(`${tr.SITE_URL}/tr/iletisim`)
    expect(tr.veri.openGraph?.url).toBe(`${tr.SITE_URL}/tr/iletisim`)
    const en = await ustVeri('contact', 'en', true)
    expect(en.veri.alternates?.canonical).toBe(`${en.SITE_URL}/en/contact`)
  })

  it('EN_YAYIN açıkken hreflang çiftleri yeni adres ve x-default TR', async () => {
    const { veri, SITE_URL } = await ustVeri('about', 'tr', true)
    expect(veri.alternates?.languages).toEqual({
      tr: `${SITE_URL}/tr/hakkimizda`,
      en: `${SITE_URL}/en/about`,
      'x-default': `${SITE_URL}/tr/hakkimizda`,
    })
    const iletisim = await ustVeri('contact', 'en', true)
    expect(iletisim.veri.alternates?.languages).toEqual({
      tr: `${SITE_URL}/tr/iletisim`,
      en: `${SITE_URL}/en/contact`,
      'x-default': `${SITE_URL}/tr/iletisim`,
    })
  })

  it('EN_YAYIN kapalıyken hreflang YOK, canonical yeni adres (EN_YAYIN ayrı eksen)', async () => {
    const { veri, SITE_URL } = await ustVeri('about', 'tr', false)
    expect(veri.alternates?.languages).toBeUndefined()
    expect(veri.alternates?.canonical).toBe(`${SITE_URL}/tr/hakkimizda`)
  })

  it('⭐canonical HİÇBİR ZAMAN 308 veren eski adres değil (iki dil, iki sayfa, iki EN kipi)', async () => {
    const eskiler = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const sayfa of ['about', 'contact'] as const) {
      for (const lang of ['tr', 'en'] as const) {
        for (const enYayin of [false, true]) {
          const { veri, SITE_URL } = await ustVeri(sayfa, lang, enYayin)
          const yol = String(veri.alternates?.canonical).replace(SITE_URL, '')
          expect(eskiler.has(yol), `${sayfa} ${lang} EN_YAYIN=${enYayin}: canonical ${yol}`).toBe(false)
        }
      }
    }
  })
})

describe('açık kip — site haritası statik adresleri yeni adres, eski adres 0; kanonik = sitemap', () => {
  it('EN_YAYIN açık: tr/en x about/contact yeni adres, eski adres hiç yok, hreflang çifti yeni', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi('1', true)
    const urller = satirlar.map((s) => s.url)
    for (const yeni of ['/tr/hakkimizda', '/en/about', '/tr/iletisim', '/en/contact']) expect(urller, yeni).toContain(`${SITE_URL}${yeni}`)
    for (const eski of ['/tr/about', '/tr/contact']) expect(urller, eski).not.toContain(`${SITE_URL}${eski}`)
    const hakkimizda = satirlar.find((s) => s.url === `${SITE_URL}/tr/hakkimizda`)
    expect(hakkimizda?.alternates?.languages).toMatchObject({ tr: `${SITE_URL}/tr/hakkimizda`, en: `${SITE_URL}/en/about` })
  }, 30_000)

  it('EN_YAYIN kapalı: yalnız TR satırı, yeni adres; /en yok', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi('1', false)
    const urller = satirlar.map((s) => s.url)
    expect(urller).toContain(`${SITE_URL}/tr/hakkimizda`)
    expect(urller).toContain(`${SITE_URL}/tr/iletisim`)
    expect(urller).not.toContain(`${SITE_URL}/tr/about`)
    expect(urller.some((u) => u.includes('/en/'))).toBe(false)
  }, 30_000)

  it('⭐KANONİK = SİTEMAP ADRESİ: sayfanın canonical\'ı site haritasındaki satırın url\'iyle aynı', async () => {
    const { satirlar } = await siteHaritasi('1', true)
    const urller = new Set(satirlar.map((s) => s.url))
    for (const sayfa of ['about', 'contact'] as const) {
      for (const lang of ['tr', 'en'] as const) {
        const modul = sayfa === 'about' ? await import('../../app/[lang]/about/page') : await import('../../app/[lang]/contact/page')
        const veri = await modul.generateMetadata({ params: Promise.resolve({ lang }) })
        expect(urller.has(String(veri.alternates?.canonical)), `${sayfa} ${lang}: ${String(veri.alternates?.canonical)}`).toBe(true)
      }
    }
  }, 30_000)

  it('hiçbir sitemap adresi bir yönlendirme kaynağı değil (açık kip, tüm statik adresler)', async () => {
    const { satirlar, SITE_URL } = await siteHaritasi('1', true)
    const eskiler = new Set(rotaDiliYonlendirmeleri(true).map((k) => k.source))
    for (const s of satirlar) expect(eskiler.has(s.url.replace(SITE_URL, '')), s.url).toBe(false)
  }, 30_000)
})

describe('ALT-14 (a) — Bilgi Merkezi dil değiştirici: anahtardan BAĞIMSIZ, EN kapalıyken 404 üretmez', () => {
  /** Çıktı, `next.config` bilgi merkezi kurallarından hiçbirinin kaynağı değil → ek sıçrama yok. */
  const tekHop = (cikti: string, enYayin: boolean) =>
    zincirVarMi([{ source: '/tr/__prob', destination: cikti, permanent: true }, ...bilgiMerkeziYonlendirmeleri(enYayin)])

  it.each([undefined, '1'])('anahtar %s, EN kapalı: /tr/bilgi-merkezi* → EN_KAPALI_LISTE_HEDEFI (yönlendirme hedefiyle AYNI)', async (anahtar) => {
    const m = await yukle(anahtar, false)
    expect(EN_KAPALI_LISTE_HEDEFI).toBe('/en/urun-secici')
    // Kapalıyken bugünkü hedef; AÇIKKEN Ürün Seçici'nin görünen adresi (next.config hedefleri tabloyla yenilenir).
    const beklenen = anahtar === '1' ? '/en/selector' : '/en/urun-secici'
    for (const yol of ['/tr/bilgi-merkezi', '/tr/bilgi-merkezi/frekans-konvertoru-nedir', '/tr/bilgi-merkezi/hava-perdesi']) {
      expect(m.dilDegistirYolu(yol, 'en', false, false), yol).toBe(beklenen)
    }
    expect(tekHop(beklenen, false)).toBeNull()
  })

  it('EN kapalıyken ürettiği hedef, next.config\'in /en/destek/merkez hedefiyle aynı (iki yol aynı yere varır)', () => {
    const merkez = bilgiMerkeziYonlendirmeleri(false).find((k) => k.source === '/en/destek/merkez')
    expect(merkez?.destination).toBe(EN_KAPALI_LISTE_HEDEFI)
  })

  it('⭐AÇIKKEN de aynı: dil değiştirici hedefi = next.config\'in YENİLENMİŞ /en/destek/merkez hedefi (/en/selector)', async () => {
    const yenilenmis = rotaDiliHedefleriniYenile(bilgiMerkeziYonlendirmeleri(false), true, ROTA_DILI)
    const merkez = yenilenmis.find((k) => k.source === '/en/destek/merkez')
    expect(merkez?.destination).toBe('/en/selector')
    const m = await yukle('1', false)
    expect(m.dilDegistirYolu('/tr/bilgi-merkezi', 'en', false, false)).toBe(merkez?.destination)
  })

  it('EN açıkken liste ↔ liste (BILGI_MERKEZI_BOLUMU eşlemesi); yazıdan liste sayfasına inilir', async () => {
    const m = await yukle(undefined, true)
    expect(m.dilDegistirYolu('/tr/bilgi-merkezi', 'en', false, true)).toBe('/en/knowledge-hub')
    expect(m.dilDegistirYolu('/tr/bilgi-merkezi/frekans-konvertoru-nedir', 'en', false, true)).toBe('/en/knowledge-hub')
    expect(m.dilDegistirYolu('/en/knowledge-hub', 'tr', false, true)).toBe('/tr/bilgi-merkezi')
    expect(m.dilDegistirYolu('/en/knowledge-hub/air-curtain', 'tr', false, true)).toBe('/tr/bilgi-merkezi')
  })

  it('EN → TR yönü EN yayını kapalıyken de TR listesine gider (yazı slug\'ı eşlenemez, 404 yok)', async () => {
    const m = await yukle(undefined, false)
    expect(m.dilDegistirYolu('/en/knowledge-hub', 'tr', false, false)).toBe('/tr/bilgi-merkezi')
  })

  it('bilgi merkezi dışı sayfalar bu dalı tetiklemez; aynı dile "geçiş" yolu değiştirmez', async () => {
    const m = await yukle(undefined, false)
    expect(m.dilDegistirYolu('/tr/destek/sss', 'en', false, false)).toBe('/en/destek/sss')
    expect(m.dilDegistirYolu('/tr/bilgi-merkezi', 'tr', false, false)).toBe('/tr/bilgi-merkezi')
    expect(m.dilDegistirYolu('/tr', 'en', false, false)).toBe('/en')
  })

  it('dilDegistirHedefi Bilgi Merkezi\'nde sorgu / parçayı BIRAKIR (hedef başka sayfa)', async () => {
    const m = await yukle(undefined, false)
    expect(m.dilDegistirHedefi('/tr/bilgi-merkezi/x', 'en', '?a=1', '#bolum', false, false)).toBe('/en/urun-secici')
    expect(m.dilDegistirHedefi('/en/knowledge-hub/y', 'tr', '?a=1', '#bolum', false, true)).toBe('/tr/bilgi-merkezi')
  })
})
