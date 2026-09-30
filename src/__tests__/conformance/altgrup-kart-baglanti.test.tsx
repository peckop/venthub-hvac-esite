import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-ALTGRUP-BAGLANTI-1 — "Alt Ürün Grupları" kartı sunucuda basılan GERÇEK bağlantıdır (REC-471).
 *
 * KORUDUĞU KUSUR: kart `<button onClick>` + `router.push` idi; HTML'de `<a href>` YOKTU. Google alt kategori
 * sayfalarına hiçbir iç bağlantıyla ulaşamıyordu: 17 yetim sayfa (GEO-SEO REC-461 denetimi). `tests/smoke/
 * ssr-kurallari.ts` bunu 09-04'ten beri biliyordu ama alarmda kalıyordu (kapida:false) — bilinen kusur, kapısız kusur.
 *
 * ── SINIR, ADIYLA ── Bu kapı KAYNAK KODU okur (AST): kartın bir bağlantı bileşeni (`Link`/`a`) olduğunu ve `href`
 * taşıdığını ölçer. Bağlantının canlı HTML'de GERÇEKTEN çıktığını ve yetim sayısının 0'a indiğini ölçmez — onu
 * GEO-SEO'nun yetim taraması (`scripts/seo/yetim-tara.mjs`) canlıda söyler.
 */
const DOSYA = path.join(process.cwd(), 'src', 'views', 'category', 'CategoryShowcaseView.tsx')
const kaynak = (): string => fs.readFileSync(DOSYA, 'utf8')
const agac = (src: string) => ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

/** `subCategories.map(cb)` çağrısının döndürdüğü kök JSX elemanı (açılış etiketi). */
function kartElemani(src: string): ts.JsxOpeningElement | ts.JsxSelfClosingElement | null {
  let bulunan: ts.JsxOpeningElement | ts.JsxSelfClosingElement | null = null
  const jsxBul = (n: ts.Node): void => {
    if (bulunan) return
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      bulunan = n
      return
    }
    ts.forEachChild(n, jsxBul)
  }
  const gez = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === 'map' &&
      n.expression.expression.getText() === 'subCategories'
    ) {
      // İlk JSX düğümü (Fragment değil eleman): kartın kendisi.
      jsxBul(n.arguments[0])
      return
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulunan
}

describe('INV-ALTGRUP-BAGLANTI-1 — alt grup kartı gerçek bağlantı', () => {
  it('K1 (ön-koşul) — dosya duruyor ve alt kategori kartını `subCategories.map` ile çiziyor', () => {
    expect(fs.existsSync(DOSYA)).toBe(true)
    expect(kartElemani(kaynak()), 'subCategories.map kartı bulunamadı — kapının evreni kaymış').not.toBeNull()
  })

  it('K2 (kural) — kart `Link` ya da `a`; `button` DEĞİL, ve `href` taşıyor', () => {
    const el = kartElemani(kaynak())
    expect(el).not.toBeNull()
    const ad = el!.tagName.getText()
    expect(
      ['Link', 'a'],
      `kart <${ad}>: gerçek bağlantı değil. <button onClick> HTML'de <a href> üretmez, Google alt kategoriye ulaşamaz (REC-471).`,
    ).toContain(ad)
    const oznitelikler = el!.attributes.properties.filter(ts.isJsxAttribute).map((a) => a.name.getText())
    expect(oznitelikler, 'bağlantı `href` taşımıyor').toContain('href')
  })

  it('K3 (kural) — gezinme `router.push` ile yapılmıyor (useRouter geri gelmemiş)', () => {
    expect(kaynak(), 'router.push geri gelmiş: kart yine tıklama olayıyla gezer, bağlantı olmaz').not.toMatch(
      /router\.push\(/,
    )
  })
})

/**
 * REC-471 ikinci parça — `series` görünümü: üst kategorisi bu modda olan alt sayfa (yedek-parca-ve-sensorler) yetim
 * kalıyordu, çünkü `CategorySeriesView` alt kategori listesini HİÇ çizmiyordu (GEO-SEO taraması, 17 → 1).
 */
const SERI = path.join(process.cwd(), 'src', 'views', 'category', 'CategorySeriesView.tsx')
const MASTER = path.join(process.cwd(), 'src', 'views', 'CategoryMasterView.tsx')

/** `subCategories.map(cb)` gövdesindeki TÜM JSX etiket adları ve her birinin öznitelikleri. */
function haritaEtiketleri(src: string): Array<{ ad: string; oznitelikler: string[] }> {
  const sonuc: Array<{ ad: string; oznitelikler: string[] }> = []
  const jsxTopla = (n: ts.Node): void => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      sonuc.push({
        ad: n.tagName.getText(),
        oznitelikler: n.attributes.properties.filter(ts.isJsxAttribute).map((a) => a.name.getText()),
      })
    }
    ts.forEachChild(n, jsxTopla)
  }
  const gez = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === 'map' &&
      n.expression.expression.getText() === 'subCategories'
    ) {
      jsxTopla(n.arguments[0])
      return
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return sonuc
}

describe('INV-ALTGRUP-BAGLANTI-1 (seri görünümü) — alt kategoriler sunucuda gerçek bağlantı', () => {
  it('K4 (ön-koşul) — seri görünümü alt kategorileri `subCategories.map` ile çiziyor', () => {
    expect(haritaEtiketleri(fs.readFileSync(SERI, 'utf8')).length, 'seri görünümü alt kategori listesi çizmiyor').toBeGreaterThan(0)
  })

  it('K5 (kural) — listede `Link`/`a` + `href` var; `button` yok', () => {
    const etiketler = haritaEtiketleri(fs.readFileSync(SERI, 'utf8'))
    const baglanti = etiketler.find((e) => ['Link', 'a'].includes(e.ad))
    expect(baglanti, 'alt kategori listesinde gerçek bağlantı (Link/a) yok').toBeDefined()
    expect(baglanti!.oznitelikler, 'bağlantı `href` taşımıyor').toContain('href')
    expect(etiketler.map((e) => e.ad), 'liste `button` ile çiziliyor: HTML\'de <a href> çıkmaz').not.toContain('button')
  })

  it('K6 (kural) — `CategoryMasterView` seri kolunda alt kategorileri görünüme AKTARIYOR', () => {
    const kaynakMaster = fs.readFileSync(MASTER, 'utf8')
    const seriKolu = kaynakMaster.match(/case 'series':[\s\S]*?<CategorySeriesView([\s\S]*?)\/>/)
    expect(seriKolu, "master görünümünde `case 'series'` kolu bulunamadı — kapının evreni kaymış").not.toBeNull()
    expect(seriKolu![1], "`series` kolu `subCategories` aktarmıyor: alt sayfalar yine yetim kalır").toMatch(/subCategories=\{/)
  })
})
