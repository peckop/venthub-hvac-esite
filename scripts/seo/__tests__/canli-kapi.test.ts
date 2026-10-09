/**
 * INV-CANLI-KAPI-1 · Canlı tarama kapısının ağsız çekirdeği (REC-461 planı; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md Y1/Y2/Y3; kural numaraları TEK-TABLO.md).
 *
 * Kilitlenenler: her kontrol için İKİ yön. Temiz sentetik veri hiç bulgu vermez (taban çizgisi); her kusur ayrı
 * "sabotaj" ile eklenir ve tam ilgili kodu üretmelidir (kapı körleşirse burada kırılır). Kalıp kontrolleri:
 * `<svg><title>` gövde içi başlık sayılmaz, `<meta>` öznitelik sırası önemsiz, gün başı lastmod toplu sayılmaz,
 * robots kalıbı yol BAŞINDAN eşleşir. `--bilinen`: bilinen KIRMIZI çıkışı 1 yapmaz (tam kod ya da KOD- ailesi),
 * yeni KIRMIZI yapar, UYARI hiçbir zaman, araç hatası daima 2.
 */
import { describe, it, expect } from 'vitest'
import {
  kontrolEt, haritaCoz, sayfaAlanlari, jsonldBloklari, robotsDisallow, robotsEslesir,
  bilinenUygula, bilinenDogrula, kayitDurumlariCek, cikisKodu, ozetSatirlari, KURAL_NO, llmsKontrolu, hamDegerHucreleri,
} from '../canli-kapi.mjs'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const TABAN = 'https://venthub.com.tr'
const ACIKLAMA_OK = 'Bu sayfa ürünün teknik özelliklerini, ölçülerini ve kullanım alanlarını ayrıntılı biçimde anlatır.'

type Sayfa = { adres: string; yol: string; durum: number; html: string | null }
type Kayit = {
  durum: number; konum?: string | null; ilk?: number[]; tur?: string; html?: string | null
  sicrama?: number; adimlar?: Array<{ adres: string; durum: number }>; sonDurum?: number; yol?: string
}
type GizliKayit = Kayit & { basliklar: Record<string, string> }
type Ek = {
  taban: string; bugun: string; robots: string
  enSayfalar: Kayit[]; varliklar: Record<string, Kayit>; gizli: Record<string, GizliKayit>
  yanitlar: Record<string, Kayit>; yonlendirmeler: Record<string, Kayit>; zincirler: Record<string, Kayit>
  llms?: string
}
type Satir = { loc: string; lastmod: string | null; changefreq: string | null; priority: string | null }
type Veri = { harita: { satirlar: Satir[]; hreflangSayisi?: number }; sayfalar: Sayfa[]; ek: Ek }
type Bulgu = { kod: string; seviye: string; adres: string; kanit: string; bilinen?: string }
type HtmlSecenek = { title?: string | null; desc?: string | null; h1?: string; lang?: string | null; icon?: boolean; ld?: unknown[]; links?: string[] }

function html(o: HtmlSecenek = {}): string {
  const { title = 'Sayfa | VentHub', desc = ACIKLAMA_OK, h1 = 'Sayfa', lang = 'tr', icon = false, ld = [], links = [] } = o
  return [
    '<!DOCTYPE html>', lang === null ? '<html>' : `<html lang="${lang}">`, '<head>',
    title === null ? '' : `<title>${title}</title>`,
    desc === null ? '' : `<meta name="description" content="${desc}"/>`,
    icon ? '<link rel="icon" href="/favicon.ico"/>' : '',
    ...ld.map((x) => '<script type="application/ld+json">' + (typeof x === 'string' ? x : JSON.stringify(x)) + '</script>'),
    '</head><body>', `<h1>${h1}</h1>`, ...links.map((l) => `<a href="${l}">bağlantı</a>`), '</body></html>',
  ].join('')
}

const sayfa = (yol: string, o: HtmlSecenek = {}, durum = 200): Sayfa => ({
  adres: TABAN + yol, yol, durum, html: durum === 200 ? html(o) : null,
})

/** Temiz taban çizgisi: 3 sayfa birbirine bağlı, benzersiz title/açıklama, doğru lang, ikon var, ek ölçümler sağlıklı. */
function temiz(): Veri {
  const yollar = ['/tr', '/tr/a', '/tr/b']
  const ozel: Record<string, HtmlSecenek> = {
    '/tr': { title: 'Ana Sayfa | VentHub', desc: 'VentHub endüstriyel havalandırma ve HVAC ürünlerini teknik veriyle, tek yerden sunar; ürünleri karşılaştırın.', h1: 'Ana Sayfa', icon: true },
    '/tr/a': { title: 'Alfa | VentHub', desc: 'Alfa ürün ailesinin teknik özelliklerini, ölçülerini ve kullanım alanlarını ayrıntılı biçimde anlatır.', h1: 'Alfa' },
    '/tr/b': { title: 'Beta | VentHub', desc: 'Beta ürün ailesinin debi, basınç ve ses seviyesi bilgilerini karşılaştırmalı olarak sunan açıklamadır.', h1: 'Beta' },
  }
  const sayfalar = yollar.map((y) => sayfa(y, { ...ozel[y], links: yollar.filter((z) => z !== y) }))
  return {
    harita: { satirlar: yollar.map((y) => ({ loc: TABAN + y, lastmod: null, changefreq: null, priority: '0.8' })) },
    sayfalar,
    ek: {
      taban: TABAN,
      bugun: '2026-09-30',
      robots: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tr/auth/\nDisallow: /tr/account\nDisallow: /tr/checkout\n',
      enSayfalar: [
        { yol: '/en', durum: 200, html: html({ lang: 'en' }) },
        { yol: '/en/products', durum: 200, html: html({ lang: 'en' }) },
      ],
      varliklar: {
        '/favicon.ico': { durum: 200, ilk: [0, 0, 1, 0, 1, 0], tur: 'ico' },
        '/icon.png': { durum: 200, ilk: [0x89, 0x50, 0x4e, 0x47], tur: 'png' },
        '/apple-icon.png': { durum: 200, ilk: [0x89, 0x50, 0x4e, 0x47], tur: 'png' },
        '/manifest.webmanifest': { durum: 200, ilk: [0x7b], tur: 'json' },
      },
      gizli: {
        '/tr/account': { durum: 200, basliklar: { 'x-robots-tag': 'noindex, follow' }, html: html() },
        '/tr/checkout': { durum: 200, basliklar: { 'x-robots-tag': 'noindex, follow' }, html: html() },
        '/tr/auth/login': { durum: 200, basliklar: { 'x-robots-tag': 'noindex, follow' }, html: html() },
        '/admin': { durum: 302, basliklar: { 'x-robots-tag': '' }, html: null },
      },
      yanitlar: {
        '/tr/products/olmayan-urun-xyz': { durum: 404 },
        '/tr/brands/olmayan-marka': { durum: 404 },
      },
      yonlendirmeler: { '/tr/kaynak': { durum: 200, konum: null } },
      zincirler: { '/category/fanlar': { durum: 200, sicrama: 1, adimlar: [{ adres: TABAN + '/category/fanlar', durum: 308 }], sonDurum: 200 } },
    },
  }
}

const kodlar = (v: Veri, kod?: string): Bulgu[] => (kontrolEt(v) as Bulgu[]).filter((b) => !kod || b.kod === kod)
const adresler = (v: Veri, kod: string): string[] => kodlar(v, kod).map((b) => b.adres)
const govdeDegistir = (s: Sayfa, ara: string | RegExp, yerine: string): void => { s.html = s.html!.replace(ara, yerine) }

describe('INV-CANLI-KAPI-1 · taban çizgisi', () => {
  it('temiz sentetik site hiç bulgu vermez (aksi halde sabotaj testleri anlamsız)', () => {
    expect(kontrolEt(temiz())).toEqual([])
  })
  it('her kodun TEK-TABLO kural numarası tanımlı', () => {
    for (const kod of ['YETIM', 'TITLE-TASLAK', 'FAVICON', 'SOFT404', 'JSONLD-ISPARTOF']) expect((KURAL_NO as Record<string, string>)[kod]).toBeTruthy()
  })
})

describe('INV-CANLI-KAPI-1 · YETIM (kural 9)', () => {
  it('sabotaj: hiçbir sayfadan bağlantı almayan sayfa KIRMIZI; <button onclick> bağlantı sayılmaz', () => {
    const v = temiz()
    v.sayfalar.push({ adres: TABAN + '/tr/yetim', yol: '/tr/yetim', durum: 200, html: html({ title: 'Yetim | VentHub', desc: 'Yetim sayfanın açıklaması benzersizdir ve yeterince uzundur; arama sonucunda düzgün görünür.' }) })
    govdeDegistir(v.sayfalar[0], '</body>', '<button onclick="location.href=\'/tr/yetim\'">kart</button></body>')
    const y = kodlar(v, 'YETIM')
    expect(y.map((b) => b.adres)).toEqual(['/tr/yetim'])
    expect(y[0].seviye).toBe('KIRMIZI')
  })
})

describe('INV-CANLI-KAPI-1 · title (kural 76/77/3)', () => {
  it('TITLE-YOK: <title> yok KIRMIZI; <svg><title> başlık sayılmaz', () => {
    const v = temiz()
    v.sayfalar[1].html = html({ title: null, desc: 'Alfa ürün ailesinin teknik özelliklerini, ölçülerini ve kullanım alanlarını ayrıntılı biçimde anlatır.', links: ['/tr', '/tr/b'] })
      .replace('</body>', '<svg><title>Simge başlığı</title></svg></body>')
    expect(adresler(v, 'TITLE-YOK')).toEqual(['/tr/a'])
  })
  it('TITLE-TEKRAR: aynı title ≥2 sayfada KIRMIZI (her sayfa için)', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[2], '<title>Beta | VentHub</title>', '<title>Alfa | VentHub</title>')
    expect(kodlar(v, 'TITLE-TEKRAR')).toHaveLength(2)
  })
  it('TITLE-UZUN: 60 karakter sınırı UYARI (61 uyarır, 60 uyarmaz)', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '<title>Alfa | VentHub</title>', `<title>${'A'.repeat(61)}</title>`)
    govdeDegistir(v.sayfalar[2], '<title>Beta | VentHub</title>', `<title>${'B'.repeat(60)}</title>`)
    const u = kodlar(v, 'TITLE-UZUN')
    expect(u.map((b) => b.adres)).toEqual(['/tr/a'])
    expect(u[0].seviye).toBe('UYARI')
  })
  it('TITLE-TASLAK: title ya da ilk h1 "Taslak" taşıyorsa KIRMIZI; "Taslaklar" gibi kelime içi eşleşme değil', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '<title>Alfa | VentHub</title>', '<title>Alfa (Taslak) | VentHub</title>')
    govdeDegistir(v.sayfalar[2], '<h1>Beta</h1>', '<h1>Beta - TASLAK</h1>')
    expect(adresler(v, 'TITLE-TASLAK').sort()).toEqual(['/tr/a', '/tr/b'])
    const u = temiz()
    govdeDegistir(u.sayfalar[1], '<h1>Alfa</h1>', '<h1>Taslaklar ve şablonlar</h1>')
    expect(kodlar(u, 'TITLE-TASLAK')).toEqual([])
  })
})

describe('INV-CANLI-KAPI-1 · meta açıklama (kural 79/5)', () => {
  it('ACIKLAMA-YOK: açıklama yok KIRMIZI; öznitelik sırası (content önce) önemsiz', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], /<meta name="description"[^>]*>/, '')
    govdeDegistir(v.sayfalar[2], /<meta name="description" content="([^"]*)"\/>/, '<meta content="$1" name="description">')
    expect(adresler(v, 'ACIKLAMA-YOK')).toEqual(['/tr/a'])
  })
  it('ACIKLAMA-TEKRAR: aynı açıklama ≥2 sayfada KIRMIZI', () => {
    const v = temiz()
    const d = /content="([^"]*)"/.exec(v.sayfalar[1].html!)![1]
    govdeDegistir(v.sayfalar[2], /<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${d}"/>`)
    expect(kodlar(v, 'ACIKLAMA-TEKRAR')).toHaveLength(2)
  })
  it('ACIKLAMA-KESIK: 150-160 krk ve cümle bitişi yok KIRMIZI; noktayla bitenle 149/161 krk olan değil', () => {
    const govde = (n: number, son: string) => 'Ürün ailesi teknik veri '.repeat(10).slice(0, n - 1) + son
    const v = temiz()
    govdeDegistir(v.sayfalar[1], /content="[^"]*"/, `content="${govde(155, 'x')}"`)
    govdeDegistir(v.sayfalar[2], /content="[^"]*"/, `content="${govde(155, '.')}"`)
    expect(adresler(v, 'ACIKLAMA-KESIK')).toEqual(['/tr/a'])
    for (const n of [149, 161]) {
      const u = temiz()
      govdeDegistir(u.sayfalar[1], /content="[^"]*"/, `content="${govde(n, 'x')}"`)
      expect(kodlar(u, 'ACIKLAMA-KESIK')).toEqual([])
    }
  })
  it('ACIKLAMA-SABLON: sayfa adı çıkarılınca ≥5 sayfada aynı kalıp KIRMIZI; 4 sayfada değil', () => {
    const adlar = ['Fanlar', 'Filtreler', 'Izgaralar', 'Damperler', 'Menfezler']
    const olustur = (n: number): Veri => {
      const v = temiz()
      const yollar = adlar.slice(0, n).map((_, i) => `/tr/category/k${i}`)
      const hepsi = ['/tr', '/tr/a', '/tr/b', ...yollar]
      yollar.forEach((y, i) => v.sayfalar.push({
        adres: TABAN + y, yol: y, durum: 200,
        html: html({ title: `${adlar[i]} | VentHub`, h1: adlar[i], desc: `${adlar[i]} kategorisindeki en kaliteli ve ekonomik havalandırma ürünlerini keşfedin, hemen inceleyin.`, links: hepsi.filter((z) => z !== y) }),
      }))
      v.sayfalar.filter((s) => !yollar.includes(s.yol)).forEach((s) => govdeDegistir(s, '</body>', yollar.map((y) => `<a href="${y}">k</a>`).join('') + '</body>'))
      return v
    }
    expect(kodlar(olustur(5), 'ACIKLAMA-SABLON')).toHaveLength(5)
    expect(kodlar(olustur(4), 'ACIKLAMA-SABLON')).toEqual([])
  })
  it('ACIKLAMA-KISA: 70 krk altı UYARI', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], /content="[^"]*"/, 'content="Kısa açıklama."')
    const k = kodlar(v, 'ACIKLAMA-KISA')
    expect(k.map((b) => b.adres)).toEqual(['/tr/a'])
    expect(k[0].seviye).toBe('UYARI')
  })
})

describe('INV-CANLI-KAPI-1 · LANG (kural 6)', () => {
  it('sabotaj: /en sayfası lang="tr" KIRMIZI; lang yok da KIRMIZI; en-US kabul', () => {
    const v = temiz()
    v.ek.enSayfalar[0].html = html({ lang: 'tr' })
    v.ek.enSayfalar[1].html = html({ lang: null })
    expect(adresler(v, 'LANG').sort()).toEqual(['/en', '/en/products'])
    const u = temiz()
    u.ek.enSayfalar[0].html = html({ lang: 'en-US' })
    expect(kodlar(u, 'LANG')).toEqual([])
  })
  it('sabotaj: /tr sayfası lang="en" KIRMIZI', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], 'lang="tr"', 'lang="en"')
    expect(adresler(v, 'LANG')).toEqual(['/tr/a'])
  })
})

describe('INV-CANLI-KAPI-1 · FAVICON (kural 2)', () => {
  it('ana sayfada <link rel=icon> yok → KIRMIZI', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[0], /<link rel="icon"[^>]*>/, '')
    expect(adresler(v, 'FAVICON')).toEqual(['/tr'])
  })
  it('favicon.ico gövdesi SVG → KIRMIZI; PNG sihirli baytı kabul', () => {
    const v = temiz()
    v.ek.varliklar['/favicon.ico'].ilk = [...'<svg xmlns="http'].map((c) => c.charCodeAt(0))
    expect(kodlar(v, 'FAVICON')[0].kanit).toContain('ICO/PNG değil')
    const u = temiz()
    u.ek.varliklar['/favicon.ico'].ilk = [0x89, 0x50, 0x4e, 0x47]
    expect(kodlar(u, 'FAVICON')).toEqual([])
  })
  it('/icon.png, /apple-icon.png, /manifest.webmanifest 5xx → KIRMIZI; 404 kırmızı değil', () => {
    const v = temiz()
    for (const y of ['/icon.png', '/apple-icon.png', '/manifest.webmanifest']) v.ek.varliklar[y].durum = 500
    expect(kodlar(v, 'FAVICON')).toHaveLength(3)
    const u = temiz()
    u.ek.varliklar['/icon.png'].durum = 404
    expect(kodlar(u, 'FAVICON')).toEqual([])
  })
})

describe('INV-CANLI-KAPI-1 · lastmod (kural 42/29)', () => {
  const satir = (n: number, lastmod: string): Satir[] => Array.from({ length: n }, (_, i) => ({ loc: `${TABAN}/tr/x${i}`, lastmod, changefreq: null, priority: null }))
  it('LASTMOD-BUGUN: lastmod bugüne eşitse KIRMIZI (saat dilimi UTC\'ye çevrilir); dünkü değil', () => {
    const v = temiz()
    v.harita.satirlar.push(...satir(1, '2026-09-30T02:30:00.000Z'), { loc: TABAN + '/tr/dun', lastmod: '2026-09-29T23:59:59.000Z', changefreq: null, priority: null })
    v.harita.satirlar.push({ loc: TABAN + '/tr/tz', lastmod: '2026-09-30T01:00:00+03:00', changefreq: null, priority: null }) // UTC 09-29 22:00: bugün değil
    expect(adresler(v, 'LASTMOD-BUGUN')).toEqual([TABAN + '/tr/x0'])
  })
  it('LASTMOD-TOPLU: ≥5 satır aynı ms damgası UYARI; 4 satır, gün başı (T00:00:00.000Z) ve farklı damgalar değil', () => {
    const toplu = temiz(); toplu.harita.satirlar.push(...satir(5, '2026-08-27T18:03:50.647Z'))
    const t = kodlar(toplu, 'LASTMOD-TOPLU')
    expect(t).toHaveLength(5)
    expect(t[0].seviye).toBe('UYARI')
    const dort = temiz(); dort.harita.satirlar.push(...satir(4, '2026-08-27T18:03:50.647Z'))
    expect(kodlar(dort, 'LASTMOD-TOPLU')).toEqual([])
    const gunBasi = temiz(); gunBasi.harita.satirlar.push(...satir(6, '2026-09-25T00:00:00.000Z'))
    expect(kodlar(gunBasi, 'LASTMOD-TOPLU')).toEqual([])
    const farkli = temiz()
    farkli.harita.satirlar.push(...Array.from({ length: 6 }, (_, i) => ({ loc: `${TABAN}/tr/f${i}`, lastmod: `2026-08-27T18:03:5${i}.647Z`, changefreq: null, priority: null })))
    expect(kodlar(farkli, 'LASTMOD-TOPLU')).toEqual([])
  })
})

describe('INV-CANLI-KAPI-1 · robots.txt kalıpları (kural 15/44)', () => {
  it('robotsDisallow yalnız "User-agent: *" grubunu okur; boş Disallow ve yorum atılır', () => {
    const r = 'User-agent: Googlebot\nDisallow: /gb\n\nUser-agent: *\nUser-agent: Bingbot\nDisallow: /x/ # yorum\nDisallow:\nAllow: /y\nDisallow: /z\n\nSitemap: https://a/sitemap.xml'
    expect(robotsDisallow(r)).toEqual(['/x/', '/z'])
  })
  it('robotsEslesir yol BAŞINDAN eşleşir; * ve $ desteklenir', () => {
    expect(robotsEslesir('/account/', '/tr/account/')).toBe(false)
    expect(robotsEslesir('/tr/account', '/tr/account/profil')).toBe(true)
    expect(robotsEslesir('/*/account', '/tr/account')).toBe(true)
    expect(robotsEslesir('/a$', '/ab')).toBe(false)
    expect(robotsEslesir('/a$', '/a')).toBe(true)
  })
  it('UYARI: kalıp hiçbir gerçek yola eşleşmiyor (kök kalıp dil önekli yola uymaz); eşleşen kalıp uyarı vermez', () => {
    const v = temiz()
    v.ek.robots = 'User-agent: *\nDisallow: /account/\nDisallow: /tr/checkout\nDisallow: /admin/\n'
    const u = kodlar(v, 'ROBOTS-KALIP').filter((b) => b.seviye === 'UYARI')
    expect(u.map((b) => b.kanit.split(' ')[1])).toEqual(['/account/'])
  })
  it('KIRMIZI: gizli yüzey ne Disallow\'lu ne noindex\'li; noindex (başlık ya da meta) ya da Disallow yeterli; yönlendiren yüzey sayılmaz', () => {
    const v = temiz()
    v.ek.robots = 'User-agent: *\nDisallow: /admin/\n'
    v.ek.gizli['/tr/account'].basliklar['x-robots-tag'] = ''
    v.ek.gizli['/tr/checkout'].basliklar['x-robots-tag'] = ''
    v.ek.gizli['/tr/checkout'].html = html().replace('</head>', '<meta name="robots" content="noindex, follow"/></head>')
    v.ek.gizli['/tr/auth/login'].basliklar['x-robots-tag'] = ''
    const k = kodlar(v, 'ROBOTS-KALIP').filter((b) => b.seviye === 'KIRMIZI')
    expect(k.map((b) => b.adres).sort()).toEqual(['/tr/account', '/tr/auth/login'])
    const u = temiz()
    u.ek.robots = 'User-agent: *\nDisallow: /tr/\n'
    u.ek.gizli['/tr/account'].basliklar['x-robots-tag'] = ''
    expect(kodlar(u, 'ROBOTS-KALIP').filter((b) => b.seviye === 'KIRMIZI')).toEqual([])
  })
})

describe('INV-CANLI-KAPI-1 · olmayan adres, yönlendirme (kural 1/54/12/14)', () => {
  it('SOFT404: 200 (ya da 3xx) KIRMIZI; 404 ve 410 temiz', () => {
    const v = temiz()
    v.ek.yanitlar['/tr/brands/olmayan-marka'] = { durum: 200 }
    v.ek.yanitlar['/tr/markalar/olmayan-marka'] = { durum: 307, konum: '/tr/brands' }
    v.ek.yanitlar['/tr/category/olmayan-kategori'] = { durum: 410 }
    expect(adresler(v, 'SOFT404').sort()).toEqual(['/tr/brands/olmayan-marka', '/tr/markalar/olmayan-marka'])
  })
  it('IC-BAGLANTI-YONLENDIRME: 301/302/307/308 veren iç bağlantı hedefi KIRMIZI, kaynak sayfa kanıtta; 200/404 değil', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '</body>', '<a href="/tr/eski">e</a></body>')
    v.ek.yonlendirmeler = { '/tr/eski': { durum: 308, konum: '/tr/yeni' }, '/tr/tamam': { durum: 200 }, '/tr/yok': { durum: 404 } }
    const k = kodlar(v, 'IC-BAGLANTI-YONLENDIRME')
    expect(k.map((b) => b.adres)).toEqual(['/tr/eski'])
    expect(k[0].kanit).toContain('/tr/a')
    expect(k[0].kanit).toContain('308')
  })
  it('YONLENDIRME-ZINCIRI: >2 sıçrama KIRMIZI; tam 2 sıçrama temiz', () => {
    const v = temiz()
    v.ek.zincirler['/category/fanlar'] = { durum: 200, sicrama: 4, adimlar: [{ adres: 'a', durum: 308 }], sonDurum: 200 }
    v.ek.zincirler['/products'] = { durum: 200, sicrama: 2, adimlar: [], sonDurum: 200 }
    expect(adresler(v, 'YONLENDIRME-ZINCIRI')).toEqual(['/category/fanlar'])
  })
  it('HARITA-ADRES-DURUM: haritadaki adres 200 değilse KIRMIZI', () => {
    const v = temiz()
    v.sayfalar.push(sayfa('/tr/kirik', {}, 404))
    expect(adresler(v, 'HARITA-ADRES-DURUM')).toEqual(['/tr/kirik'])
  })
})

describe('INV-CANLI-KAPI-1 · JSON-LD (kural 66/18/17/58/59/20/62)', () => {
  const koy = (v: Veri, ld: unknown[]): void => {
    v.sayfalar[1].html = html({ title: 'Alfa | VentHub', desc: 'Alfa ürün ailesinin teknik özelliklerini, ölçülerini ve kullanım alanlarını ayrıntılı biçimde anlatır.', h1: 'Alfa', ld, links: ['/tr', '/tr/b'] })
  }
  it('JSONLD-PARSE: bozuk JSON KIRMIZI; geçerli blok temiz', () => {
    const v = temiz(); koy(v, ['{"@context": "https://schema.org", bozuk'])
    expect(adresler(v, 'JSONLD-PARSE')).toEqual(['/tr/a'])
    const u = temiz(); koy(u, [{ '@context': 'https://schema.org', '@type': 'Organization', name: 'x' }])
    expect(kodlar(u)).toEqual([])
  })
  it('JSONLD-COLLECTIONPAGE: üst düzeyde numberOfItems/itemListElement KIRMIZI; mainEntity ItemList temiz', () => {
    const v = temiz(); koy(v, [{ '@type': 'CollectionPage', name: 'k', numberOfItems: 3 }])
    expect(adresler(v, 'JSONLD-COLLECTIONPAGE')).toEqual(['/tr/a'])
    const w = temiz(); koy(w, [{ '@type': 'CollectionPage', name: 'k', itemListElement: [] }])
    expect(adresler(w, 'JSONLD-COLLECTIONPAGE')).toEqual(['/tr/a'])
    const u = temiz(); koy(u, [{ '@type': 'CollectionPage', name: 'k', mainEntity: { '@type': 'ItemList', numberOfItems: 3, itemListElement: [] } }])
    expect(kodlar(u)).toEqual([])
  })
  it('JSONLD-ISPARTOF ve JSONLD-PRODUCTGROUP-ALAN: isPartOf KIRMIZI (@graph içinde de); name/productGroupID eksikse KIRMIZI', () => {
    const v = temiz(); koy(v, [{ '@graph': [{ '@type': 'ProductGroup', name: 'g', productGroupID: 'g1', isPartOf: { '@id': 'x' } }] }])
    expect(adresler(v, 'JSONLD-ISPARTOF')).toEqual(['/tr/a'])
    const w = temiz(); koy(w, [{ '@type': 'ProductGroup', productGroupID: 'g1' }, { '@type': ['ProductGroup'], name: 'g' }])
    expect(kodlar(w, 'JSONLD-PRODUCTGROUP-ALAN')).toHaveLength(2)
    const u = temiz(); koy(u, [{ '@type': 'ProductGroup', name: 'g', productGroupID: 'g1' }])
    expect(kodlar(u)).toEqual([])
  })
  it('JSONLD-BREADCRUMB: ilk öğe item sondaki / ile KIRMIZI; 1 öğe KIRMIZI; doğru liste temiz', () => {
    const bc = (...items: unknown[]) => ({ '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: 'n' + i, item })) })
    const v = temiz(); koy(v, [bc(TABAN + '/tr/', TABAN + '/tr/a')])
    expect(adresler(v, 'JSONLD-BREADCRUMB')).toEqual(['/tr/a'])
    const w = temiz(); koy(w, [bc({ '@id': TABAN + '/tr/' }, TABAN + '/tr/a')])
    expect(adresler(w, 'JSONLD-BREADCRUMB')).toEqual(['/tr/a'])
    const x = temiz(); koy(x, [bc(TABAN + '/tr')])
    expect(kodlar(x, 'JSONLD-BREADCRUMB')[0].kanit).toContain('1 öğe')
    const u = temiz(); koy(u, [bc(TABAN + '/tr', TABAN + '/tr/a')])
    expect(kodlar(u)).toEqual([])
  })
  it('jsonldBloklari yalnız application/ld+json script\'ini okur; yorum içindekini ve başka script türünü atar', () => {
    const h = '<script>var a = 1</script><!-- <script type="application/ld+json">{"x":1}</script> --><script type=\'application/ld+json\'>{"y":2}</script>'
    expect(jsonldBloklari(h).map((b: { veri: unknown }) => b.veri)).toEqual([{ y: 2 }])
  })
})

describe('INV-CANLI-KAPI-1 · ROBOTS-HARITA-ALAN ve ayrıştırıcılar (kural 16)', () => {
  it('haritada <changefreq> UYARI; yoksa temiz', () => {
    const v = temiz(); v.harita.satirlar[1].changefreq = 'weekly'
    const k = kodlar(v, 'ROBOTS-HARITA-ALAN')
    expect(k).toHaveLength(1)
    expect(k[0].seviye).toBe('UYARI')
  })
  it('haritaCoz loc/lastmod/changefreq okur, varlıkları çözer', () => {
    const xml = '<urlset><url><loc>https://a/x?i=1&amp;j=2</loc><lastmod>2026-01-01T00:00:00.000Z</lastmod><changefreq>weekly</changefreq></url><url><loc>https://a/y</loc></url></urlset>'
    expect(haritaCoz(xml).satirlar).toEqual([
      { loc: 'https://a/x?i=1&j=2', lastmod: '2026-01-01T00:00:00.000Z', changefreq: 'weekly', priority: null },
      { loc: 'https://a/y', lastmod: null, changefreq: null, priority: null },
    ])
  })
  it('haritaCoz hreflangSayisi: <xhtml:link hreflang> sayar; yoksa 0', () => {
    const var1 = '<urlset><url><loc>https://a/tr</loc><xhtml:link rel="alternate" hreflang="en" href="https://a/en"/><xhtml:link rel="alternate" hreflang="tr" href="https://a/tr"/></url></urlset>'
    expect(haritaCoz(var1).hreflangSayisi).toBe(2)
    expect(haritaCoz('<urlset><url><loc>https://a/tr</loc></url></urlset>').hreflangSayisi).toBe(0)
  })
  it('sayfaAlanlari: gövde içi <svg><title> sayılmaz, ilk <h1> alınır, lang okunur, script içi dizgi etiket sayılmaz', () => {
    const a = sayfaAlanlari('<html lang="en"><head><title> Gerçek &amp; Başlık </title><script>var s = "<title>sahte</title>"</script></head><body><svg><title>ikon</title></svg><h1>Bir <b>ad</b></h1><h1>ikinci</h1></body></html>')
    expect(a).toMatchObject({ title: 'Gerçek & Başlık', h1: 'Bir ad', lang: 'en' })
  })
})

describe('INV-CANLI-KAPI-1 · --bilinen ve çıkış kodu', () => {
  const k = (kod: string, seviye = 'KIRMIZI'): Bulgu => ({ kod, seviye, adres: '/x', kanit: '' })
  it('bilinen KIRMIZI çıkışı 1 yapmaz; listede olmayan yeni KIRMIZI yapar', () => {
    const bulgular = bilinenUygula([k('SOFT404'), k('LANG')], { SOFT404: 'REC-490' }) as Bulgu[]
    expect(bulgular[0].bilinen).toBe('REC-490')
    expect(bulgular[1].bilinen).toBeUndefined()
    expect(cikisKodu(bulgular)).toBe(1)
    expect(cikisKodu(bilinenUygula([k('SOFT404')], { SOFT404: 'REC-490' }))).toBe(0)
  })
  it('varsayılan (bilinen yok): her KIRMIZI çıkış 1; yalnız UYARI çıkış 0; hiç bulgu 0', () => {
    expect(cikisKodu(bilinenUygula([k('SOFT404')], {}))).toBe(1)
    expect(cikisKodu([k('TITLE-UZUN', 'UYARI')])).toBe(0)
    expect(cikisKodu([])).toBe(0)
  })
  it('KOD- ailesi eşleşir ("JSONLD" → JSONLD-ISPARTOF) ama kısmi ön ek değil ("JSON" → eşleşmez); UYARI\'ya bilinen işlenmez', () => {
    const b = bilinenUygula([k('JSONLD-ISPARTOF'), k('JSONLD-PARSE'), k('ROBOTS-KALIP', 'UYARI')], { JSONLD: 'REC-494', 'ROBOTS-KALIP': 'REC-2' }) as Bulgu[]
    expect(b.map((x) => x.bilinen)).toEqual(['REC-494', 'REC-494', undefined])
    expect((bilinenUygula([k('JSONLD-PARSE')], { JSON: 'REC-9' }) as Bulgu[])[0].bilinen).toBeUndefined()
  })
  it('araç/ağ hatası çıkışı 2 yapar (temiz ya da kırmızı olsa da: ölçüme güvenilmez)', () => {
    expect(cikisKodu([], ['/tr/a (zaman aşımı)'])).toBe(2)
    expect(cikisKodu([k('LANG')], ['/tr/a (zaman aşımı)'])).toBe(2)
  })
  it('ozetSatirlari kod başına sayı, en çok 2 örnek adres ve kural numarası verir', () => {
    expect(ozetSatirlari([k('YETIM'), k('YETIM'), k('YETIM'), k('TITLE-TASLAK')])).toEqual([
      { kod: 'YETIM', seviye: 'KIRMIZI', bilinen: null, sayi: 3, ornek: ['/x', '/x'], kural: '9' },
      { kod: 'TITLE-TASLAK', seviye: 'KIRMIZI', bilinen: null, sayi: 1, ornek: ['/x'], kural: '3' },
    ])
  })
  it('kusurlu site birden çok aileden birlikte bulgu verir (kontroller birbirini gölgelemez)', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[0], /<link rel="icon"[^>]*>/, '')
    v.ek.enSayfalar[0].html = html({ lang: 'tr' })
    v.ek.yanitlar['/tr/brands/olmayan-marka'] = { durum: 200 }
    expect(new Set(kodlar(v).map((b) => b.kod))).toEqual(new Set(['FAVICON', 'LANG', 'SOFT404']))
  })
})

describe('bilinen listesi kalıcı susturucu olamaz (OPS şartı, REC-502)', () => {
  const k = (kod: string, seviye = 'KIRMIZI'): Bulgu => ({ kod, seviye, adres: '/x', kanit: '' })
  const son =(kod: string, r: ReturnType<typeof bilinenDogrula>) =>
    [...(bilinenUygula([k(kod)], r.gecerli) as Bulgu[]), ...(r.bulgular as Bulgu[])]

  it('kaydı Done ya da Canceled olan bilinen satırı KIRMIZI olur ve susturmaz (sabotaj)', () => {
    for (const d of [{ ad: 'Done', tip: 'completed' }, { ad: 'Canceled', tip: 'canceled' }, { ad: 'Duplicate', tip: 'canceled' }]) {
      const r = bilinenDogrula({ LANG: 'REC-373' }, { 'REC-373': d })
      expect(r.gecerli).toEqual({})
      expect((r.bulgular as Bulgu[]).map((b) => [b.kod, b.seviye])).toEqual([['BILINEN-KAYIT-KAPALI', 'KIRMIZI']])
      expect(cikisKodu(son('LANG', r))).toBe(1)
    }
  })
  it('açık kayıtlı (Backlog, In Progress, In Review) satır susturur ve çıkışı 1 yapmaz', () => {
    for (const d of [{ ad: 'Backlog', tip: 'backlog' }, { ad: 'In Progress', tip: 'started' }, { ad: 'In Review', tip: 'started' }]) {
      const r = bilinenDogrula({ LANG: 'REC-373' }, { 'REC-373': d })
      expect(r.gecerli).toEqual({ LANG: 'REC-373' })
      expect(r.bulgular).toEqual([])
      expect(cikisKodu(son('LANG', r))).toBe(0)
    }
  })
  it('REC kaydına bağlı olmayan satır (boş, serbest metin, küçük harf, sayı) KIRMIZI olur', () => {
    for (const kayit of ['', 'sonra bakarız', 'REC-', 'rec-12', 42]) {
      const r = bilinenDogrula({ LANG: kayit })
      expect(r.gecerli).toEqual({})
      expect((r.bulgular as Bulgu[])[0].kod).toBe('BILINEN-KAYITSIZ')
      expect(cikisKodu(son('LANG', r))).toBe(1)
    }
  })
  it('durumu ölçülemeyen kayıt susturmayı bozmaz ama UYARI basar (ağ ya da anahtar yok)', () => {
    const r = bilinenDogrula({ LANG: 'REC-373' }, {})
    expect(r.gecerli).toEqual({ LANG: 'REC-373' })
    expect((r.bulgular as Bulgu[]).map((b) => [b.kod, b.seviye])).toEqual([['BILINEN-KAYIT-OLCULEMEDI', 'UYARI']])
  })
  it('kayitDurumlariCek anahtar yoksa ağa çıkmaz, hata verirse boş döner, cevap gelirse durumu okur', async () => {
    let cagri = 0
    const bozuk = async () => { cagri++; throw new Error('ağ yok') }
    expect(await kayitDurumlariCek(['REC-1'], '', bozuk)).toEqual({})
    expect(cagri).toBe(0)
    expect(await kayitDurumlariCek(['REC-1'], 'anahtar', bozuk)).toEqual({})
    const tamam = async () => ({ json: async () => ({ data: { issue: { state: { name: 'Done', type: 'completed' } } } }) })
    expect(await kayitDurumlariCek(['REC-1'], 'anahtar', tamam)).toEqual({ 'REC-1': { ad: 'Done', tip: 'completed' } })
  })
  it('depodaki canli-kapi-bilinen.json: her satır bir REC kaydına bağlı ve kod adı kural tablosunda ya da ailesinde var', () => {
    const bilinen = JSON.parse(readFileSync(join(__dirname, '..', 'canli-kapi-bilinen.json'), 'utf8')) as Record<string, string>
    expect(Object.keys(bilinen).length).toBeGreaterThan(0)
    const kodlar = Object.keys(KURAL_NO)
    for (const [kod, kayit] of Object.entries(bilinen)) {
      expect(kayit).toMatch(/^REC-\d+$/)
      expect(kodlar.some((x) => x === kod || x.startsWith(kod + '-')), `${kod} kural tablosunda yok`).toBe(true)
    }
  })
})

/**
 * INV-LLMS-GERCEK-1 · llms.txt'in sayfa/dil beyanı site haritasıyla çelişirse KIRMIZI (SEO-6, 2026-10-02).
 * Dosya "~190 sayfa, TR/EN hreflang, ~37 kategori" diyordu; gerçek 87 adres, yalnız TR, 24 kategori. Kural: beyan ya
 * gerçeği söyler ya kapı kırmızıdır (kontrolü olmayan kural yoktur).
 */
type HaritaSatir = { loc: string; lastmod: string | null; changefreq: string | null; priority: string | null }
const haritaSatir = (yol: string): HaritaSatir => ({ loc: TABAN + yol, lastmod: null, changefreq: null, priority: null })
function haritaKur(toplam: number, kategori: number, enSayfa = 0): { satirlar: HaritaSatir[]; hreflangSayisi: number } {
  const satirlar: HaritaSatir[] = []
  for (let i = 0; i < kategori; i++) satirlar.push(haritaSatir(`/tr/category/k${i}`))
  for (let i = 0; i < enSayfa; i++) satirlar.push(haritaSatir(`/en/products/p${i}`))
  while (satirlar.length < toplam) satirlar.push(haritaSatir(`/tr/products/p${satirlar.length}`))
  return { satirlar, hreflangSayisi: 0 }
}
const llmsMetni = (ek = ''): string => [
  '# VentHub', 'Languages (ISO 639-1): tr', '- [Sitemap](https://venthub.com.tr/sitemap.xml): 87 indexable URLs, Turkish only',
  '- Catalog across 24 categories.', ek,
].join('\n')
const llmsBulgu = (harita: { satirlar: HaritaSatir[]; hreflangSayisi?: number }, metin: string): Bulgu[] => {
  const cikti: Bulgu[] = []
  llmsKontrolu(harita, metin, cikti)
  return cikti
}

describe('INV-LLMS-GERCEK-1 · llms.txt beyanı haritayla tutarlı', () => {
  it('taban çizgisi: doğru sayfa/kategori/dil beyanı hiç bulgu vermez', () => {
    expect(llmsBulgu(haritaKur(87, 24), llmsMetni())).toEqual([])
  })
  it('sabotaj: eski bayat metin ("~190 pages", "~37 categories", dil satırı yok) hem LLMS-SAYFA hem LLMS-DIL KIRMIZI', () => {
    const eski = '# VentHub\nSitemap: all ~190 pages with TR/EN hreflang alternates\ncatalog across ~37 categories; English mirrors exist under /en/...'
    const b = llmsBulgu(haritaKur(87, 24), eski)
    expect(b.filter((x) => x.kod === 'LLMS-SAYFA')).toHaveLength(2)
    expect(b.filter((x) => x.kod === 'LLMS-DIL')).toHaveLength(1)
    expect(b.every((x) => x.seviye === 'KIRMIZI')).toBe(true)
  })
  it('sabotaj: sayfa sayısı haritadan farklıysa KIRMIZI (87 yazılı, haritada 86)', () => {
    const b = llmsBulgu(haritaKur(86, 24), llmsMetni())
    expect(b.map((x) => x.kod)).toEqual(['LLMS-SAYFA'])
    expect(b[0].kanit).toMatch(/87/)
    expect(b[0].kanit).toMatch(/86/)
  })
  it('sabotaj: kategori sayısı haritadan farklıysa KIRMIZI (24 yazılı, haritada 23)', () => {
    expect(llmsBulgu(haritaKur(87, 23), llmsMetni()).map((x) => x.kod)).toEqual(['LLMS-SAYFA'])
  })
  it('sabotaj: harita /en adresleri taşıyorken llms.txt yalnız "tr" diyorsa KIRMIZI (EN yayınlanınca dosya güncellenmeli)', () => {
    const b = llmsBulgu(haritaKur(87, 24, 10), llmsMetni())
    expect(b.map((x) => x.kod)).toEqual(['LLMS-DIL'])
    expect(b[0].kanit).toMatch(/tr/)
    expect(b[0].kanit).toMatch(/en,tr/)
  })
  it('sabotaj: haritada hreflang varken "Languages: tr" KIRMIZI; "tr, en" olunca temiz', () => {
    const h = { ...haritaKur(87, 24), hreflangSayisi: 4 }
    expect(llmsBulgu(h, llmsMetni()).map((x) => x.kod)).toEqual(['LLMS-DIL'])
    expect(llmsBulgu(h, llmsMetni().replace('Languages (ISO 639-1): tr', 'Languages (ISO 639-1): tr, en'))).toEqual([])
  })
  it('sabotaj: llms.txt EN beyan ediyor ama harita yalnız TR ise KIRMIZI (tersi de çelişki)', () => {
    const b = llmsBulgu(haritaKur(87, 24), llmsMetni().replace('Languages (ISO 639-1): tr', 'Languages (ISO 639-1): tr, en'))
    expect(b.map((x) => x.kod)).toEqual(['LLMS-DIL'])
  })
  it('kontrolEt: ek.llms verilirse çalışır, verilmezse ölçülmemiş sayılır (bulgu yok)', () => {
    const v = temiz()
    expect(kodlar(v).filter((x) => x.kod.startsWith('LLMS'))).toEqual([])
    v.ek.llms = '# VentHub\nSitemap: ~190 pages'
    expect(kodlar(v).filter((x) => x.kod.startsWith('LLMS')).map((x) => x.kod).sort()).toEqual(['LLMS-DIL', 'LLMS-SAYFA'])
  })
  it('depodaki public/llms.txt: dil satırı VAR ve src/config/features.ts EN_YAYIN bayrağıyla uyumlu (kapalıysa yalnız tr)', () => {
    const kok = join(__dirname, '..', '..', '..')
    const llms = readFileSync(join(kok, 'public', 'llms.txt'), 'utf8')
    const ozellikler = readFileSync(join(kok, 'src', 'config', 'features.ts'), 'utf8')
    const enAcik = /export const EN_YAYIN\s*=\s*true\b/.test(ozellikler)
    const satir = /^[\s>*_-]*languages\b[^:\n]*:\s*(.+)$/im.exec(llms)
    expect(satir, 'public/llms.txt "Languages (ISO 639-1): …" satırı taşımalı').not.toBeNull()
    const beyan = new Set(satir![1].toLowerCase().match(/\b(?:tr|en)\b/g) || [])
    expect([...beyan].sort().join(','), 'llms.txt dil beyanı EN_YAYIN bayrağıyla uyumsuz').toBe(enAcik ? 'en,tr' : 'tr')
    expect(llms, 'bayat sayfa beyanı geri gelmesin').not.toMatch(/~\s*\d+\s+(?:pages|categories)/i)
  })
  it('depodaki public/llms.txt gerçek haritaya (87 adres, 24 kategori, yalnız TR) KARŞI temiz; harita 86 olunca KIRMIZI', () => {
    const llms = readFileSync(join(__dirname, '..', '..', '..', 'public', 'llms.txt'), 'utf8')
    const yazilanSayfa = Number(/(\d+)\s+indexable URLs/i.exec(llms)?.[1])
    const yazilanKategori = Number(/(\d+)\s+categories/i.exec(llms)?.[1])
    expect(yazilanSayfa).toBeGreaterThan(0)
    expect(yazilanKategori).toBeGreaterThan(0)
    expect(llmsBulgu(haritaKur(yazilanSayfa, yazilanKategori), llms)).toEqual([])
    expect(llmsBulgu(haritaKur(yazilanSayfa - 1, yazilanKategori), llms).map((x) => x.kod)).toEqual(['LLMS-SAYFA'])
  })
})

describe('INV-CANLI-KAPI-1 · VITRIN-IDDIA (URN-60, karar 295)', () => {
  it('sabotaj: yasak ifade sayfanın GÖRÜNEN metninde KIRMIZI; her ifade ayrı yakalanır', () => {
    for (const ifade of ['%92 Optimizasyon', 'Çok Satanlar', 'Geniş stok ağımız', 'Dünya Devlerinin Partneri', 'Sistem.Veri.Canlı', '81 il kargo']) {
      const v = temiz()
      govdeDegistir(v.sayfalar[1], '<h1>', `<h1>${ifade} `)
      const b = kodlar(v, 'VITRIN-IDDIA')
      expect(b.length, `"${ifade}" yakalanmadı`).toBeGreaterThan(0)
      expect(b[0].adres).toBe('/tr/a')
      expect(b[0].seviye).toBe('KIRMIZI')
    }
  })
  it('URN-79 sabotaj: marka kayıtlarından kalkan üretici övgüleri (TR+EN) geri gelirse KIRMIZI; React\'in `&#x27;` yazdığı kesme işaretli hâl de yakalanır', () => {
    const geriGelenler = [
      '1954 yılından bu yana havalandırma teknolojilerinde dünya lideri',
      'A world leader in ventilation technology since 1954',
      'konut, ticari ve endüstriyel iklimlendirmede standartları belirliyor',
      'endüstriyel santrifüj fanlarda dünyanın en geniş ve teknolojik ürün gamına sahip üreticisi',
      'frekans konvertörlerinin öncüsüdür',
      'enerji tüketimini %80&#x27;e varan oranda azaltır',
      'Avens, Türkiye&#x27;nin önde gelen yerli HVAC markasıdır',
      'Yüksek Verimli Santrifüj Fanlar',
    ]
    for (const ifade of geriGelenler) {
      const v = temiz()
      govdeDegistir(v.sayfalar[1], '<h1>', `<h1>${ifade} `)
      const b = kodlar(v, 'VITRIN-IDDIA')
      expect(b.length, `"${ifade}" yakalanmadı`).toBeGreaterThan(0)
      expect(b[0].adres).toBe('/tr/a')
    }
  })
  it('URN-79: yeni marka cümleleri (nötr menşei/uzmanlık + DB özeti) yanlış alarm vermez', () => {
    const v = temiz()
    govdeDegistir(
      v.sayfalar[1],
      '<h1>',
      '<h1>İtalya menşeli havalandırma üreticisi. VentHub kataloğunda Vortice markasının ürün ailesi sayısı: 31. Kategoriler: Aksiyel Fanlar. ',
    )
    expect(kodlar(v, 'VITRIN-IDDIA')).toEqual([])
  })
  it('Türkçe büyük/küçük harf simetrisi: DETERMİNİSTİK, Deterministik, deterministik üçü de yakalanır (REC-343 körlüğü yok)', () => {
    for (const yazim of ['DETERMİNİSTİK SİSTEMLER', 'Deterministik Sistemler', 'deterministik sistemler']) {
      const v = temiz()
      govdeDegistir(v.sayfalar[2], '<h1>', `<h1>${yazim} `)
      expect(adresler(v, 'VITRIN-IDDIA'), yazim).toEqual(['/tr/b'])
    }
  })
  it('görünen metin değilse sayılmaz: <script> içi ve etiket özniteliği yanlış alarm vermez', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '</body>', '<script>var x = "Çok Satanlar %92"</script><div data-x="Geniş stok"></div></body>')
    expect(kodlar(v, 'VITRIN-IDDIA')).toEqual([])
  })
  it('temiz sentetik site hiç VITRIN-IDDIA bulgusu vermez ve kuralı kayıtlıdır', () => {
    expect(kodlar(temiz(), 'VITRIN-IDDIA')).toEqual([])
    expect(Object.keys(KURAL_NO)).toContain('VITRIN-IDDIA')
  })
})

describe('INV-CANLI-KAPI-1 · SPEC-HAM-DEGER (URN-58, karar 298)', () => {
  /** Ürün sayfasının teknik tablosundaki gerçek işaretleme kalıbı: etiket span'ı + değer span'ı (tek satır). */
  const satir = (etiket: string, deger: string): string =>
    `<div class="flex justify-between"><span class="text-xs font-bold">${etiket}</span><span class="text-xs font-black">${deger}</span></div>`

  it('sabotaj: hücrenin görünür metni tam `true`/`false` ise KIRMIZI; gövde çift olunca sayı da çift, etiket=değer kanıtta', () => {
    const v = temiz()
    const govde = [satir('Zamanlayıcı', 'false'), satir('ErP Uyumlu', 'true'), satir('Higrostat', 'false')].join('')
    govdeDegistir(v.sayfalar[1], '</body>', govde + govde + '</body>') // Lineo Quiet'te ölçülen hâl: her alan iki kez
    const b = kodlar(v, 'SPEC-HAM-DEGER')
    expect(b.map((x) => x.adres)).toEqual(['/tr/a'])
    expect(b[0].seviye).toBe('KIRMIZI')
    expect(b[0].kanit).toContain('6 teknik tablo hücresinde')
    for (const parca of ['Zamanlayıcı=false', 'ErP Uyumlu=true', 'Higrostat=false']) expect(b[0].kanit, parca).toContain(parca)
  })
  it('sabotaj: <td>/<dd> hücresi, tırnak içinde ">" taşıyan öznitelik ve React yazı-sınırı yorumu (<!-- -->) da yakalanır', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[2], '</body>',
      '<table><tr><th>Bypass</th><td>false</td></tr></table>' +
      '<dl><dt>Ters Dönüş</dt><dd data-x="a>b">true</dd></dl>' +
      '<div><span>Sensör</span><span><!-- -->false<!-- --></span></div></body>')
    const b = kodlar(v, 'SPEC-HAM-DEGER')
    expect(b.map((x) => x.adres)).toEqual(['/tr/b'])
    expect(b[0].kanit).toContain('3 teknik tablo hücresinde')
    for (const parca of ['Bypass=false', 'Ters Dönüş=true', 'Sensör=false']) expect(b[0].kanit, parca).toContain(parca)
  })
  it('iyi girdi: sözlük metni (Var/Yok, Yes/No), kod öğeleri, cümle içi sözcük, script/JSON-LD/yorum, öznitelik, büyük harf YANLIŞ ALARM vermez', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '</body>', [
      satir('Zamanlayıcı', 'Yok'), satir('ErP Uyumlu', 'Var'), satir('Timer', 'No'), satir('ErP', 'Yes'),
      '<code>true</code><pre>false</pre><kbd>true</kbd><samp>false</samp>',
      '<p>Bu ifade true değildir; false positive yoktur.</p><span>truefalse</span><span>false positive</span>',
      '<input value="true"><div data-flag="false"></div>',
      '<script>var a = "true"; window.__x = {k: false}</script><script type="application/ld+json">{"x": true}</script>',
      '<!-- <span>true</span> --><span>True</span><span>FALSE</span>',
      '</body>',
    ].join(''))
    expect(kodlar(v, 'SPEC-HAM-DEGER')).toEqual([])
  })
  it('hamDegerHucreleri: önceki kapanan öğe yoksa etiket "?"; temiz sentetik site bulgu vermez ve kural kayıtlıdır', () => {
    expect(hamDegerHucreleri('<div><span>true</span></div>')).toEqual([{ deger: 'true', etiket: '?' }])
    expect(hamDegerHucreleri('<div><b>Etiket</b> <i>false</i></div>')).toEqual([{ deger: 'false', etiket: 'Etiket' }])
    expect(hamDegerHucreleri('')).toEqual([])
    expect(kodlar(temiz(), 'SPEC-HAM-DEGER')).toEqual([])
    expect(Object.keys(KURAL_NO)).toContain('SPEC-HAM-DEGER')
  })
  it('çıkış kodu: SPEC-HAM-DEGER yeni KIRMIZI olarak çıkışı 1 yapar (bilinen listesinde yoksa susturulmaz)', () => {
    const v = temiz()
    govdeDegistir(v.sayfalar[1], '</body>', satir('Zamanlayıcı', 'false') + '</body>')
    expect(cikisKodu(kontrolEt(v))).toBe(1)
    expect(cikisKodu(kontrolEt(temiz()))).toBe(0)
  })
})
