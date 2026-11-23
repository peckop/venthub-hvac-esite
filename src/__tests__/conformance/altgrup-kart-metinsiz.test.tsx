import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-ALTGRUP-KART-METINSIZ-1 (URN-176, OPS-368 ikinci temizlik, SEO-138) — üst kategori sayfasındaki "Alt Ürün
 * Grupları" kartı alt kategorinin tanıtım paragrafını basmaz.
 *
 * KORUDUĞU KUSUR: kart `subVm.description` basıyordu; aynı metin alt kategori sayfasının kendi girişinde de durur.
 * Geo-SEO ölçümü (23 Kasım): üst-alt sayfa çiftlerinde 18 paragraf, 29-93 kelime, birebir kopya (/fanlar × plug,
 * radyal, çatı, hücreli...). Kaynak şablondu (veri tabanı değil): metin `categories.metadata.description_i18n`'den
 * gelir ve alt sayfa hero'su da aynı alanı okur.
 *
 * SINIR, ADIYLA: bu kapı KAYNAK KODU okur (AST); canlı HTML'de 25+ kelime kopya 0 olduğunu ölçmez — onu Geo-SEO'nun
 * kopya ölçümü canlıda söyler. Kart ad + görsel/ikon + bağlantıdır; açıklama dili düşüşü (INV-DIL-DUSUSU-1) bu yüzden
 * kart için artık konu dışıdır.
 */
const DOSYA = path.join(process.cwd(), 'src', 'views', 'category', 'CategoryShowcaseView.tsx')
const kaynak = (): string => fs.readFileSync(DOSYA, 'utf8')
const agac = (src: string) => ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

/** `subCategories.map(cb)` geri çağrısının gövdesindeki tüm düğümlerden `description` okuyanlar ve test kimlikleri. */
function kartIhlalleri(src: string): { bulundu: boolean; ihlaller: string[] } {
  const ihlaller: string[] = []
  let bulundu = false
  const tara = (n: ts.Node): void => {
    if (ts.isPropertyAccessExpression(n) && n.name.text === 'description') ihlaller.push(`.description @${n.getStart()}`)
    if (ts.isJsxAttribute(n) && n.name.getText() === 'data-testid' && n.initializer?.getText().includes('alt-kategori-aciklama')) {
      ihlaller.push('data-testid="alt-kategori-aciklama"')
    }
    ts.forEachChild(n, tara)
  }
  const gez = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === 'map' &&
      n.expression.expression.getText() === 'subCategories'
    ) {
      bulundu = true
      tara(n.arguments[0])
      return
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return { bulundu, ihlaller }
}

describe('INV-ALTGRUP-KART-METINSIZ-1 — alt grup kartında tanıtım paragrafı yok', () => {
  it('kart `subCategories.map` ile çiziliyor (kapının evreni yerinde)', () => {
    expect(kartIhlalleri(kaynak()).bulundu).toBe(true)
  })

  it('kart gövdesi `description` okumaz ve `alt-kategori-aciklama` kimliğini basmaz', () => {
    expect(kartIhlalleri(kaynak()).ihlaller).toEqual([])
  })

  it('kart hâlâ ad ve gerçek bağlantı basıyor (metin kalktı, kart boşalmadı)', () => {
    const k = kaynak()
    expect(k).toMatch(/subVm\?\.displayName/)
    expect(k).toMatch(/subHref\(getLocalizedCategorySlug\(sub, lang\)\)/)
  })

  it('SABOTAJ: karta açıklama paragrafı geri eklenirse ölçüt kırmızı verir', () => {
    const bozuk = kaynak().replace(
      '<h3 className="text-2xl font-bold text-slate-950 mb-10 tracking-tight">{subVm?.displayName}</h3>',
      '<h3 className="text-2xl font-bold text-slate-950 mb-10 tracking-tight">{subVm?.displayName}</h3><p data-testid="alt-kategori-aciklama">{subVm?.description}</p>',
    )
    expect(bozuk).not.toBe(kaynak())
    const { ihlaller } = kartIhlalleri(bozuk)
    expect(ihlaller.length).toBeGreaterThanOrEqual(2)
  })
})
