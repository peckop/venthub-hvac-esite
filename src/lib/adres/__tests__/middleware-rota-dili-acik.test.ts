// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Rota dili anahtarı AÇIKKEN middleware dilsiz kolu (OPS-52 PR-C2): dilsiz eski adres (`/about`) TEK
 * yönlendirmeyle hedef dilin YENİ adresine gider. Dil seçimi `detectLocale` + 307 (A9: Türkçe-yalnız içerik
 * olmadığından deterministik TR 308 uygulanmaz; gerekçe middleware.ts kolunun yorumunda).
 */
const ANAHTAR = 'NEXT_PUBLIC_ADRES_DILI'
const ilkDeger = process.env[ANAHTAR]
const TR_CHROME = 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
const EN = 'en-US,en;q=0.9'

/** altYollar'lı satır içeren deney tablosu (varsayılan veri yalnız hakkımızda/iletişim). */
const TABLO = [
  { id: 'hakkimizda', klasor: 'about', tr: 'hakkimizda', en: 'about' },
  { id: 'iletisim', klasor: 'contact', tr: 'iletisim', en: 'contact' },
  { id: 'destek', klasor: 'destek', tr: 'destek', en: 'support', altYollar: true },
]

afterEach(() => {
  if (ilkDeger === undefined) delete process.env[ANAHTAR]
  else process.env[ANAHTAR] = ilkDeger
  vi.doUnmock('@/lib/adres/rotaDiliTablo')
  vi.doUnmock('@/config/features')
  vi.doUnmock('@/lib/adres/haritaKaynagi')
  vi.resetModules()
})

interface Secenek {
  /** Deney tablosu (altYollar) kullan; verilmezse GERÇEK veri dosyası. */
  tablo?: boolean
  k3b?: boolean
}

async function istek(yol: string, basliklar: Record<string, string> = {}, secenek: Secenek = {}) {
  process.env[ANAHTAR] = '1'
  vi.resetModules()
  if (secenek.tablo) {
    vi.doMock('@/lib/adres/rotaDiliTablo', async (orijinal) => {
      const o = await orijinal<typeof import('@/lib/adres/rotaDiliTablo')>()
      const cekirdek = await import('@/config/rotaDiliCekirdek.mjs')
      return {
        ...o,
        ADRES_DILI_ACIK: true,
        rotaDiliDilsizOku: (y: string) => {
          const e = cekirdek.rotaDiliEsle(y, TABLO, true)
          return e ? { tr: e.tr, en: e.en } : null
        },
      }
    })
  }
  if (secenek.k3b) {
    vi.doMock('@/config/features', async (asil) => ({ ...(await asil<typeof import('@/config/features')>()), ADRES_SEMASI_K3B: true }))
    vi.doMock('@/lib/adres/haritaKaynagi', async () => ({ ESKI_ADRES_HARITASI: (await import('./fikstur')).FIKSTUR_DOSYASI }))
  }
  const { middleware } = await import('@/middleware')
  const req = new NextRequest(new URL(yol, 'https://venthub.com.tr'), { headers: { host: 'venthub.com.tr', ...basliklar } })
  const res = await middleware(req)
  const konum = res.headers.get('location')
  return {
    durum: res.status,
    konum: konum ? new URL(konum).pathname + new URL(konum).search : null,
    origin: konum ? new URL(konum).origin : null,
    res,
  }
}

describe('middleware dilsiz kol — anahtar AÇIK (gerçek veri dosyası: hakkımızda / iletişim)', () => {
  it('/about: TEK yönlendirme, hedef dilin YENİ adresi (TR → /tr/hakkimizda, EN → /en/about)', async () => {
    expect(await istek('/about', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/hakkimizda' })
    expect(await istek('/about', { 'accept-language': EN })).toMatchObject({ durum: 307, konum: '/en/about' })
  })

  it('/contact: TR → /tr/iletisim, EN → /en/contact; sorgu dizesi AYNEN taşınır', async () => {
    expect(await istek('/contact', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/iletisim' })
    expect(await istek('/contact?dept=satis', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/iletisim?dept=satis' })
    expect(await istek('/contact?dept=satis&utm_source=bulten', { 'accept-language': EN })).toMatchObject({
      durum: 307,
      konum: '/en/contact?dept=satis&utm_source=bulten',
    })
  })

  it('dil tespiti çerez > Accept-Language (bugünkü detectLocale): NEXT_LOCALE=en TR tarayıcıyı da EN\'e götürür', async () => {
    const r = await istek('/about', { 'accept-language': TR_CHROME, cookie: 'NEXT_LOCALE=en' })
    expect(r).toMatchObject({ durum: 307, konum: '/en/about' })
  })

  it('K3B kolundaki gibi: kalıcı önbellek başlığı + kiracı çerezi', async () => {
    const r = await istek('/about', { 'accept-language': TR_CHROME })
    expect(r.res.headers.get('cache-control')).toBe('max-age=0, must-revalidate')
    expect(r.res.cookies.get('tenant_id')?.value).toBe('d3b07384-d113-495f-a558-8c38634e0000')
  })

  it('sondaki "/" eşleşmeyi bozmaz: /about/ de TEK yönlendirme (Next trailingSlash=false iken bu eğik çizgiyi zaten atar)', async () => {
    const r = await istek('/about/', { 'accept-language': TR_CHROME })
    expect(r.durum).toBe(307)
    expect(r.konum).toMatch(/^\/tr\/hakkimizda\/?$/)
  })

  it('GİRMEZ: dilli eski adres (/tr/about config 308 verir, middleware dokunmaz), yeni adres, alt yol (altYollar yok)', async () => {
    for (const yol of ['/tr/about', '/en/about', '/tr/contact', '/en/contact', '/tr/hakkimizda', '/tr/iletisim']) {
      expect((await istek(yol)).konum, yol).toBeNull()
    }
    // altYollar kapalı: /about/ekip bu satırın işi değil → bugünkü dil öneki akışı.
    expect(await istek('/about/ekip', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/about/ekip' })
    expect(await istek('/aboutx', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/aboutx' })
  })

  it('tabloda olmayan dilsiz yol ve dil çözülemeyen başlık: bugünkü akış', async () => {
    // karar 293: garanti-servis tabloda DEĞİL (destek altında kalır) → bugünkü akış; iade-degisim tabloda (ALT-33) → tek 307, yeni adres.
    expect(await istek('/destek/garanti-servis', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/destek/garanti-servis' })
    expect(await istek('/destek/iade-degisim', { 'accept-language': TR_CHROME })).toMatchObject({ durum: 307, konum: '/tr/yasal/iptal-ve-iade' })
    expect(await istek('/', {})).toMatchObject({ durum: 308, konum: '/tr' })
  })

  it('⭐AŞAMA 2 (karar 270): /cart, /account, /checkout, /auth, /payment-success kol tarafından ellenmez (bugünkü 307)', async () => {
    for (const yol of ['/cart', '/account', '/account/orders', '/checkout', '/auth/login', '/payment-success']) {
      expect(await istek(yol, { 'accept-language': TR_CHROME }), yol).toMatchObject({ durum: 307, konum: `/tr${yol}` })
    }
  })

  it('/admin ve /api kol tarafından ellenmez', async () => {
    expect((await istek('/admin', { 'accept-language': TR_CHROME })).konum ?? '').not.toMatch(/hakkimizda|iletisim/)
    expect((await istek('/api/health', { 'accept-language': TR_CHROME })).konum).toBeNull()
  })

  it('doğrulayıcı admin / api / _next öneklerini tabloya sokmaz (kol bunlara yönlendirme kuramaz)', async () => {
    const { rotaDiliTablosuDogrula } = await import('@/config/rotaDiliCekirdek.mjs')
    for (const onek of ['admin', 'api', 'admin/urunler']) {
      for (const alan of ['klasor', 'tr', 'en']) {
        expect(() => rotaDiliTablosuDogrula([{ id: 'x', klasor: 'ok', tr: 'ok-tr', en: 'ok-en', [alan]: onek }]), `${alan}=${onek}`).toThrow(/dokunmadığı/)
      }
    }
  })
})

describe('middleware dilsiz kol — yerleşim sırası (kaynak kapısı)', () => {
  it('kol K3B eşleyicisinden SONRA, dil öneki kolundan ÖNCE; yalnız ADRES_DILI_ACIK koşuluyla', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const kaynak = readFileSync(join(process.cwd(), 'src', 'middleware.ts'), 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    const k3b = kod.indexOf('eskiAdresEsle(')
    const kol = kod.indexOf('rotaDiliDilsizOku(')
    const dilOnekiKolu = kod.indexOf("const segments = pathname.split('/')")
    expect(k3b, 'K3B eşleyici çağrısı bulunamadı').toBeGreaterThan(0)
    expect(kol, 'dilsiz kol çağrısı bulunamadı').toBeGreaterThan(k3b)
    expect(dilOnekiKolu, 'dil öneki kolu bulunamadı').toBeGreaterThan(kol)
    expect(kod.slice(kod.lastIndexOf('if (', kol), kol)).toMatch(/ADRES_DILI_ACIK/)
    // Kural 12: kolda DB / ağ yok; yol literali yok (tablo güdümlü).
    const kolGovdesi = kod.slice(kol, dilOnekiKolu)
    expect(kolGovdesi).not.toMatch(/supabase|fetch\(|hesaplayicilar|\/about|\/contact/)
  })
})

describe('middleware dilsiz kol — altYollar\'lı satır (deney tablosu)', () => {
  it('kuyruk iki dile taşınır, sorgu AYNEN korunur', async () => {
    const t = { tablo: true }
    expect(await istek('/destek', { 'accept-language': EN }, t)).toMatchObject({ durum: 307, konum: '/en/support' })
    expect(await istek('/destek/ekip/derin?q=1', { 'accept-language': EN }, t)).toMatchObject({ durum: 307, konum: '/en/support/ekip/derin?q=1' })
    expect(await istek('/destek/ekip?q=1', { 'accept-language': TR_CHROME }, t)).toMatchObject({ durum: 307, konum: '/tr/destek/ekip?q=1' })
    expect(await istek('/about', { 'accept-language': TR_CHROME }, t)).toMatchObject({ konum: '/tr/hakkimizda' })
  })

  it('⭐OPEN REDIRECT YOK: sorguda ve yolda "//evil.com" hedef origin\'i DEĞİŞTİRMEZ', async () => {
    const t = { tablo: true }
    for (const yol of ['/about?next=//evil.com', '/about?next=https://evil.com', '/destek//evil.com', '/destek/..//evil.com?x=//evil.com', '/contact?dept=//evil.com/x']) {
      const r = await istek(yol, { 'accept-language': EN }, t)
      expect(r.origin, yol).toBe('https://venthub.com.tr')
      expect(r.konum, yol).toMatch(/^\/(?:en|tr)\//)
    }
  })

  it('gerçek veride de aynı güvence', async () => {
    const r = await istek('/about?next=//evil.com', { 'accept-language': EN })
    expect(r.origin).toBe('https://venthub.com.tr')
    expect(r.konum).toBe('/en/about?next=//evil.com')
  })
})

describe('middleware dilsiz kol — K3B açıkken de aynı (K3B kolundan SONRA, dil önekinden ÖNCE)', () => {
  it('/about, /contact kol tarafından çözülür; K3B kendi eski adreslerini yine önce çözer', async () => {
    const k = { k3b: true }
    expect(await istek('/about', { 'accept-language': TR_CHROME }, k)).toMatchObject({ durum: 307, konum: '/tr/hakkimizda' })
    expect(await istek('/contact?dept=x', { 'accept-language': EN }, k)).toMatchObject({ durum: 307, konum: '/en/contact?dept=x' })
    // K3B kolu önce: dilsiz Türkçe kategori slug'ı hâlâ tek 308 (kolun varlığı bunu bozmaz).
    expect(await istek('/category/fanlar', { 'accept-language': EN }, k)).toMatchObject({ durum: 308, konum: '/tr/kategori/fanlar' })
  })
})
