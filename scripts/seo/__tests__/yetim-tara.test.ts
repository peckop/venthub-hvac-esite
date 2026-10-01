/**
 * INV-YETIM-1 · Yetim sayfa taramasının ağsız çekirdeği (REC-472; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md Y1/Y3; REC-471 kabul ölçütünün aracı).
 *
 * Kilitlenenler: yalnız `<a href>` bağlantı sayılır (`<button onclick>`, `<link rel>`, script/JSON-LD içindeki URL,
 * başka öznitelik değerindeki `href=` ve `data-href` SAYILMAZ); göreli, mutlak, sorgulu, `#`'li, sondaki `/`'lı ve
 * yüzde-kodlu adres aynı sayfaya indirgenir; kendine bağlantı ve başka host sayılmaz; "gelen" = ona bağlantı veren
 * FARKLI haritalı sayfa sayısı (aynı sayfadan çift bağlantı tek sayılır); yetim listesi doğru, `--izin` yetimi
 * çıkarır ama ayrı listeler; alınamayan sayfa çıkış 2 verir (yetim sayısına güvenilmez).
 */
import { describe, it, expect } from 'vitest'
import { hrefleriTopla, gelenSay, ozetle, cikisKodu, kovaAdi } from '../yetim-tara.mjs'

const TABAN = 'https://venthub.com.tr'

describe('INV-YETIM-1 · hrefleriTopla', () => {
  it('⭐ayırt edici: <a href> sayılır; <button onclick>, <link rel>, JSON-LD ve script içi URL sayılmaz', () => {
    const html = `
      <head>
        <link rel="canonical" href="/tr/link-etiketi">
        <link rel="alternate" hreflang="en" href="https://venthub.com.tr/en/alternatif">
        <script type="application/ld+json">{"url":"https://venthub.com.tr/tr/jsonld","@id":"<a href='/tr/scriptte'>x</a>"}</script>
        <script>window.go = () => { location.href = "/tr/js-yonlendirme" }; var s = '<a href="/tr/dizgi">'</script>
      </head>
      <body>
        <a href="/tr/gercek">gerçek</a>
        <button onclick="location.href='/tr/dugme'" data-href="/tr/data-href">kart</button>
        <div role="link" data-href="/tr/div-link">x</div>
        <a class="x" data-href="/tr/a-data-href" href="/tr/gercek-2">iki</a>
        <a title="bkz href='/tr/oznitelik-degeri'" href="/tr/gercek-3">üç</a>
        <!-- <a href="/tr/yorum">yorum</a> -->
        <a name="ankraj">href yok</a>
        <abbr href="/tr/abbr">a ile başlayan başka etiket</abbr>
      </body>`
    expect(hrefleriTopla(html, TABAN).sort()).toEqual(['/tr/gercek', '/tr/gercek-2', '/tr/gercek-3'])
  })

  it('göreli, mutlak, sorgulu, #li, sondaki / ve yüzde-kodlu adres aynı sayfaya indirgenir', () => {
    const html = `
      <a href="/tr/kategori/a">1</a>
      <a href="/tr/kategori/a/">2</a>
      <a href="https://venthub.com.tr/tr/kategori/a">3</a>
      <a href="http://venthub.com.tr/tr/kategori/a?sayfa=2&amp;x=1">4</a>
      <a href="/tr/kategori/a#bolum">5</a>
      <a href='/tr/kategori/a'>6</a>
      <a href=/tr/kategori/a>7</a>`
    expect(hrefleriTopla(html, TABAN)).toEqual(['/tr/kategori/a'])
    expect(hrefleriTopla('<a href="/tr/%C3%BCr%C3%BCn">ü</a><a href="/tr/ürün/">u</a>', TABAN)).toEqual(['/tr/ürün'])
    expect(hrefleriTopla('<a href="/tr/bozuk%E0%A4%A">x</a>', TABAN)).toEqual(['/tr/bozuk%E0%A4%A'])
  })

  it('göreli adres sayfanın kendi adresine göre çözülür; kök "/" olur', () => {
    expect(hrefleriTopla('<a href="b">x</a><a href="../c">y</a>', TABAN, `${TABAN}/tr/kategori/a`)).toEqual(['/tr/kategori/b', '/tr/c'])
    expect(hrefleriTopla('<a href="/">ana</a><a href="https://venthub.com.tr">ana</a>', TABAN)).toEqual(['/'])
  })

  it('başka host, www alt alanı, mailto/tel/javascript sayılmaz; boş ve # bağlantı sayfanın kendisine çözülür (gelenSay eler)', () => {
    const html = `
      <a href="https://baska-site.com/tr/x">dış</a>
      <a href="https://www.venthub.com.tr/tr/www">www</a>
      <a href="mailto:a@b.c">m</a><a href="tel:+90">t</a><a href="javascript:void(0)">j</a>
      <a href="">boş</a><a href="#ust">ankraj</a>`
    expect(hrefleriTopla(html, TABAN, `${TABAN}/tr/sayfa`)).toEqual(['/tr/sayfa'])
    expect(gelenSay({ '/tr/sayfa': html }, TABAN)).toEqual({ '/tr/sayfa': 0 })
  })

  it('boş ya da undefined HTML hata vermez', () => {
    expect(hrefleriTopla('', TABAN)).toEqual([])
    expect(hrefleriTopla(undefined, TABAN)).toEqual([])
  })
})

describe('INV-YETIM-1 · gelenSay', () => {
  const sayfalar = {
    [`${TABAN}/`]: '<a href="/tr/a">a</a><a href="/tr/b/">b</a><a href="https://baska.com/tr/c">dış</a>',
    [`${TABAN}/tr/a`]: '<a href="/tr/a">kendine</a><a href="/tr/b">b</a><a href="/tr/b?x=1">b yine</a>',
    [`${TABAN}/tr/b`]: '<a href="/tr/a#ust">a</a><a href="/tr/haritada-olmayan">x</a><button onclick="go(\'/tr/c\')">c</button>',
    [`${TABAN}/tr/c`]: '<link rel="next" href="/tr/d">',
    [`${TABAN}/tr/d`]: '<script type="application/ld+json">{"url":"https://venthub.com.tr/tr/c"}</script>',
  }

  it('gelen = kendisi hariç, ona bağlantı veren farklı haritalı sayfa; aynı sayfadan çift bağlantı tek sayılır', () => {
    expect(gelenSay(sayfalar, TABAN)).toEqual({ '/': 0, '/tr/a': 2, '/tr/b': 2, '/tr/c': 0, '/tr/d': 0 })
  })

  it('başka host ve haritada olmayan hedef gelen sayılmaz; evrene hedef eklenmez', () => {
    const g = gelenSay(sayfalar, TABAN)
    expect(Object.keys(g).sort()).toEqual(['/', '/tr/a', '/tr/b', '/tr/c', '/tr/d'])
    expect(g['/tr/haritada-olmayan']).toBeUndefined()
  })

  it('Map girdisi ve yol anahtarları da kabul edilir; alınamayan (null) sayfa evrende kalır, bağlantı vermez', () => {
    const g = gelenSay(new Map<string, string | null>([['/tr/a', '<a href="/tr/b">b</a>'], ['/tr/b', null]]), TABAN)
    expect(g).toEqual({ '/tr/a': 0, '/tr/b': 1 })
  })

  it('haritadaki adresin sondaki / ve sorgusu anahtarı bozmaz', () => {
    const g = gelenSay({ [`${TABAN}/tr/a/`]: '', [`${TABAN}/tr/b`]: '<a href="/tr/a">a</a>' }, TABAN)
    expect(g).toEqual({ '/tr/a': 1, '/tr/b': 0 })
  })
})

describe('INV-YETIM-1 · ozetle ve çıkış kodu', () => {
  const gelen = { '/': 9, '/tr/a': 0, '/tr/b': 1, '/tr/c': 0, '/tr/d': 2, '/tr/e': 3, '/tr/f': 4, '/tr/g': 10, '/tr/h': 11 }

  it('yetim listesi doğru; sayfa sayısı ve dağılım kovaları toplamı tutar', () => {
    const o = ozetle(gelen)
    expect(o.sayfa).toBe(9)
    expect(o.yetim).toEqual(['/tr/a', '/tr/c'])
    expect(o.birGelen).toEqual(['/tr/b'])
    expect(o.dagilim).toEqual({ '0': 2, '1': 1, '2-3': 2, '4-10': 3, '11+': 1 })
    expect(Object.values(o.dagilim).reduce((t, n) => t + n, 0)).toBe(o.sayfa)
  })

  it('kova sınırları: 0 · 1 · 2-3 · 4-10 · 11+', () => {
    expect([0, 1, 2, 3, 4, 10, 11, 500].map(kovaAdi)).toEqual(['0', '1', '2-3', '2-3', '4-10', '4-10', '11+', '11+'])
  })

  it('⭐ayırt edici: --izin yetimi listeden çıkarır (ayrı listeler); izin dışı yetim kalır; çıkış kodu buna göre', () => {
    expect(cikisKodu(ozetle(gelen))).toBe(1)
    const kismi = ozetle(gelen, [], ['/tr/a'])
    expect(kismi.yetim).toEqual(['/tr/c'])
    expect(kismi.izinliYetim).toEqual(['/tr/a'])
    expect(cikisKodu(kismi)).toBe(1)
    const tam = ozetle(gelen, [], ['/tr/a', `${TABAN}/tr/c/`])
    expect(tam.yetim).toEqual([])
    expect(cikisKodu(tam)).toBe(0)
  })

  it('izin listesi gelen sayısı sıfırdan büyük sayfayı etkilemez', () => {
    const o = ozetle(gelen, [], ['/tr/b'])
    expect(o.izinliYetim).toEqual([])
    expect(o.birGelen).toEqual(['/tr/b'])
  })

  it('⭐alınamayan sayfa çıkış 2 verir — yetim olmasa da, yetim de olsa (sessiz geçmez)', () => {
    expect(cikisKodu(ozetle({ '/': 1, '/tr/a': 1 }, ['/tr/x (HTTP 500)']))).toBe(2)
    expect(cikisKodu(ozetle(gelen, ['/tr/x (zaman aşımı)']))).toBe(2)
    expect(ozetle({ '/': 1 }, ['/tr/z (HTTP 404)', '/tr/y (HTTP 500)']).alinamadi).toEqual(['/tr/y (HTTP 500)', '/tr/z (HTTP 404)'])
  })

  it('temiz evren: yetim 0, alınamadı 0 → çıkış 0', () => {
    expect(cikisKodu(ozetle({ '/': 2, '/tr/a': 1 }))).toBe(0)
  })
})
