import fs from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-EN-YAYIN-1 — İngilizce vitrinin YAYIN anahtarı gerçekten iki yönlü çalışır.
 *
 * NİÇİN VAR (REC-204 · Recep kararı + Google Search Console ölçümü, 2026-09-07):
 * GSC "dizine eklenmedi 115 / eklendi 101" gösteriyordu ve en büyük kalem olan
 * **"Keşfedildi ama taranmadı: 110"** örneklerinin TAMAMI `/en/…` idi. İngilizce vitrin
 * yarım (40 ailenin 8'inde EN adı = TR adı; 23 kategorinin 0'ında EN açıklaması var), ve
 * Google yarım çevrilmiş sayfaları "düşük değerli otomatik çeviri" diye damgalayabiliyor.
 * Recep'in kararı: *"bu şekilde yayınlanmasınlar, ama her zamanda olsun istemiyorum —
 * biz sorunlarımızı çözelim, sonra yayınlansınlar."*
 *
 * BU KAPI NE ÖLÇER: `EN_YAYIN` bayrağının İKİ hâlinde de doğru davranışı — kapalıyken
 * site haritasında `/en/` adresi YOK ve `/en` sayfası `noindex` basıyor; **açıkken ikisi
 * de tersine dönüyor**. Tek yönlü ölçmek yetmez: bayrak açıldığında `noindex` yerinde
 * kalırsa İngilizce vitrin sessizce dizin dışında kalır ve sebebi görünmez — geri açmanın
 * tek satır olduğu vaadi yalan olur.
 *
 * NİÇİN MOCK'LA BAYRAK ÇEVRİLİYOR: `EN_YAYIN` derleme-zamanı bir sabit (bilerek — bkz.
 * `src/config/features.ts` gerekçesi). Çalışma zamanında değiştirilemez, o yüzden modül
 * `vi.mock` ile iki hâlde de yeniden yüklenir. Ölçülen şey bayrağın DEĞERİ değil,
 * tüketicilerin ona GERÇEKTEN bağlı olmasıdır.
 *
 * BU KAPI NE ÖLÇMEZ: canlıda Google'ın ne yaptığını. Onu GSC ölçer, yayın sonrası.
 */

const KOK = path.resolve(__dirname, '../../..')
const FEATURES = path.join(KOK, 'src/config/features.ts')

/**
 * Yorumları ayıklar; kapı YALNIZ kodu ölçsün diye.
 *
 * NİÇİN (REC-205 kapısının ilk koşumunda öğrenildi, oradan KOPYALANDI — yeniden keşfetme):
 * kaldırma gerekçesini yorum olarak yazdığımda yorumdaki kelimeleri ham metin taraması
 * KOD sandı ve kapı kendi belgesini kusur diye raporladı. Ters yönü daha tehlikelidir:
 * yorumda geçen bir desen kapıyı yanlışlıkla YEŞİL yapabilir. İki hâlin de kökü aynı —
 * metin taraması kodu ve yorumu ayırmaz.
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // blok yorum (JSDoc dahil)
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // satır yorumu (http:// gibi dizeleri korur)
}

// Site haritası DB'ye gider; ağ yerine sabit bir kategori + bir aile verilir.
// (Üst düzeyde: vi.mock hoist edilir, fonksiyon içine yazmak yanıltıcı olur.)
vi.mock('../../lib/supabase/static', () => ({
  supabaseStaticClient: {
    rpc: async () => ({ data: [{ category_id: 'k1', product_count: 3 }] }),
  },
}))
vi.mock('../../lib/services/category.service', () => ({
  getCategories: async () => [
    {
      id: 'k1',
      slug: 'fans',
      metadata: { slug: { tr: 'fanlar', en: 'fans' } },
      updated_at: '2026-09-01T00:00:00.000Z',
    },
  ],
}))
vi.mock('../../lib/services/family.service', () => ({
  getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
}))

/** `EN_YAYIN` verilen değerde sabitlenir; modül grafiği sıfırdan yüklenir. */
async function bayrakla(acik: boolean) {
  vi.resetModules()
  vi.doMock('../../config/features', () => ({
    EN_YAYIN: acik,
    UC_BOYUT_MUSTERI_YUZEYINDE: false,
    YENI_KABUK_GEZINMESI: false,
  }))
  const { default: sitemap } = await import('../../app/sitemap')
  const { generateMetadata } = await import('../../app/[lang]/layout')

  const girisler = await sitemap()
  const enMeta = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
  const trMeta = await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })

  return {
    enAdresSayisi: girisler.filter((g) => g.url.includes('/en/') || g.url.endsWith('/en')).length,
    trAdresSayisi: girisler.filter((g) => g.url.includes('/tr/') || g.url.endsWith('/tr')).length,
    enMeta,
    trMeta,
  }
}

describe('INV-EN-YAYIN-1 — İngilizce vitrin yayın anahtarı', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.doUnmock('../../config/features')
    vi.resetModules()
  })

  it('K1 · bayrak KAPALIyken: site haritasında /en YOK, /en sayfası noindex basar', async () => {
    const o = await bayrakla(false)

    expect(
      o.enAdresSayisi,
      'EN_YAYIN kapalı ama site haritası hâlâ /en adresleri ilan ediyor — Google yarım vitrini taramaya davet edilir'
    ).toBe(0)

    expect(
      o.trAdresSayisi,
      'Türkçe adresler de düştü — bayrak yanlış tarafı kapatıyor'
    ).toBeGreaterThan(0)

    expect(
      o.enMeta.robots,
      'EN_YAYIN kapalı ama /en sayfası robots etiketi basmıyor — sayfa dizine girmeye açık kalır'
    ).toEqual({ index: false, follow: true })
  })

  it('K2 · SABOTAJ HEDEFİ — bayrak AÇIKken her ikisi de TERSİNE döner', async () => {
    const o = await bayrakla(true)

    expect(
      o.enAdresSayisi,
      'EN_YAYIN açık ama site haritası /en adreslerini hâlâ yazmıyor — "geri açmak tek satır" vaadi yalan'
    ).toBeGreaterThan(0)

    expect(
      o.enMeta.robots,
      'EN_YAYIN açık ama /en sayfası hâlâ noindex — vitrin sessizce dizin dışında kalır ve sebebi görünmez'
    ).toBeUndefined()
  })

  it('K3 · TÜRKÇE HİÇBİR HÂLDE ETKİLENMEZ — robots etiketi TR tarafına asla basılmaz', async () => {
    const kapali = await bayrakla(false)
    const acik = await bayrakla(true)

    expect(kapali.trMeta.robots, 'bayrak kapalıyken Türkçe sayfaya robots etiketi bastı').toBeUndefined()
    expect(acik.trMeta.robots, 'bayrak açıkken Türkçe sayfaya robots etiketi bastı').toBeUndefined()
  })

  it('K4 · bayrak gerekçesiyle birlikte yaşar — AÇILMA ŞARTI yazılı olmadan bayrak bir "kapat ve unut"tur', () => {
    const kaynak = fs.readFileSync(FEATURES, 'utf8')

    expect(kaynak, 'EN_YAYIN sabiti features.ts içinde bulunamadı').toMatch(/export const EN_YAYIN\s*=/)

    // Gerekçe YORUMDA yaşar; bu tek kol bilerek yorumsuz() KULLANMAZ.
    expect(
      kaynak.includes('AÇILMA ŞARTI'),
      'EN_YAYIN bayrağının açılma şartı yazılı değil — kapatma kalıcı olur, kimse ne zaman açılacağını bilemez'
    ).toBe(true)
  })

  it('K5 · SOĞUK OKUYUCU — iki tüketici de bayrağı GERÇEKTEN içe aktarır (kopyalanmış sabit değil)', () => {
    const sitemapKodu = yorumsuz(fs.readFileSync(path.join(KOK, 'src/app/sitemap.ts'), 'utf8'))
    const layoutKodu = yorumsuz(fs.readFileSync(path.join(KOK, 'src/app/[lang]/layout.tsx'), 'utf8'))

    for (const [ad, kod] of [
      ['sitemap.ts', sitemapKodu],
      ['[lang]/layout.tsx', layoutKodu],
    ] as const) {
      expect(
        /import\s*\{[^}]*\bEN_YAYIN\b[^}]*\}\s*from\s*['"][^'"]*config\/features['"]/.test(kod),
        `${ad} EN_YAYIN'i features.ts'ten içe aktarmıyor — bayrak ikinci bir yerde kopyalanmışsa iki değer sessizce ayrışır`
      ).toBe(true)
    }
  })
})
