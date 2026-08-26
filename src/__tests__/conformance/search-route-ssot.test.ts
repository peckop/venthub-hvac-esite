import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-SEARCH-ROUTE-1 — arama katmanı ham adres itmez.
 *
 * NİÇİN BU KAPI VAR (canlı ölçüm, 2026-08-26 · REC-79):
 * `get_search_suggestions` RPC'si DİL ÖNEKSİZ adres döndürüyor (`/products/<uuid>`).
 * `SearchOverlay` bu adresi ham hâlde `router.push`'a veriyordu. Önek olmadığı için
 * middleware dili SAYFADAN değil TARAYICI `Accept-Language`'inden çözüyor; sonuç:
 *
 *   /tr → "lineo" ara → öneriye tıkla →
 *     307 /products/eb5d1303-…      → 308 /en/products/eb5d1303-…
 *     → 308 /en/products/vortice-lineo-100-quiet-17160
 *     → 200 /en/products/vortice-lineo-quiet?sku=VRT-17160
 *
 * Yani TÜRKÇE gezen müşteri İNGİLİZCE sayfaya düşüyordu. Aynı sayfadaki normal ürün
 * bağlantıları `/tr/...` taşıyordu — fark yalnız bu yoldaydı, tarayıcı dilinin yan
 * etkisi DEĞİLDİ.
 *
 * Mevcut hiçbir kapı bunu görmezdi: tip doğru (`Route` cast'i vardı), lint temiz, build
 * yeşil, sunucu tarafı curl ölçümü bile "doğru dile gidiyor" diyordu — çünkü curl'ün
 * *bulunduğu sayfa* yoktur, dolayısıyla sitenin SEÇİLİ dilinin yok sayıldığını göremez.
 *
 * KURAL (CLAUDE.md kural 7 · Routes SSOT): istemci gezinmesinde her `router.push`
 * argümanı ya `Routes.*(...)` (dil önekini proxy ekler) ya `localizedHref(url, lang)`
 * olmalıdır. Ham dize veya ham alan (`s.url`) YASAK.
 *
 * TASARIM NOTU — niçin AST, niçin metin taraması değil: metin tarayan bir kapı, dosyanın
 * YORUMUNDA geçen `router.push` ifadesiyle de tatmin olur ya da ona takılır. Burada gerçek
 * çağrı düğümleri sayılır; yorumlar ve dizeler hiç görülmez.
 */

const OVERLAY = path.join(process.cwd(), 'src', 'components', 'SearchOverlay.tsx')

/** Kaynaktaki GERÇEK `router.push(...)` çağrılarının ilk argümanları. */
function pushArguments(file: string): ts.Expression[] {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const found: ts.Expression[] = []
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'push' &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'router'
    ) {
      if (node.arguments.length > 0) found.push(node.arguments[0])
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

/** `x as Route` / `(x)` gibi sarmalları soyar — kapı cast ile atlatılamasın. */
function unwrap(expr: ts.Expression): ts.Expression {
  let cur: ts.Expression = expr
  for (;;) {
    if (ts.isParenthesizedExpression(cur)) { cur = cur.expression; continue }
    if (ts.isAsExpression(cur) || ts.isTypeAssertionExpression(cur)) { cur = cur.expression; continue }
    if (ts.isNonNullExpression(cur)) { cur = cur.expression; continue }
    return cur
  }
}

/** SSOT'a bağlı mı: `Routes.<x>(...)` ya da `localizedHref(...)`. */
function isSsotRoute(expr: ts.Expression): boolean {
  const e = unwrap(expr)
  if (!ts.isCallExpression(e)) return false
  const callee = e.expression
  if (ts.isIdentifier(callee) && callee.text === 'localizedHref') return true
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
    return callee.expression.text === 'Routes'
  }
  return false
}

describe('INV-SEARCH-ROUTE-1 — arama gezinmesi Routes SSOT üzerinden', () => {
  it('POZİTİF KONTROL — okuyucu gerçekten çağrı düğümü buluyor', () => {
    // Dosya taşınsa, adı değişse ya da AST yürüyüşü bozulsa liste boşalır ve aşağıdaki
    // asıl iddia HİÇBİR ŞEY ÖLÇMEDEN yeşil kalırdı. Bu vaka daha önce başımıza geldi:
    // "iddia doğru" ile "iddia hiç çalışmadı" aynı yeşili verir.
    expect(pushArguments(OVERLAY).length).toBeGreaterThanOrEqual(4)
  })

  it('POZİTİF KONTROL — ham adres SSOT sayılmıyor', () => {
    // Ölçütün ayırt edici olduğunu kanıtlar: eski kusurlu biçim kırmızı vermeli.
    const eski = ts.createSourceFile(
      'x.tsx',
      "router.push((s.url || '#') as import('next').Route)",
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    let arg: ts.Expression | null = null
    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n) && n.arguments.length > 0 && !arg) arg = n.arguments[0]
      ts.forEachChild(n, visit)
    }
    visit(eski)
    expect(arg).not.toBeNull()
    expect(isSsotRoute(arg!)).toBe(false)
  })

  it('SearchOverlay içindeki HER router.push argümanı SSOT üzerinden gelir', () => {
    const ihlaller = pushArguments(OVERLAY)
      .filter((a) => !isSsotRoute(a))
      .map((a) => a.getText())
    expect(ihlaller).toEqual([])
  })

  it('dil öneki elle birleştirilmez — kaçak şablon yok', () => {
    // localizedHref varken elle şablon birleştirmek SSOT'u ikinci kez kırar.
    //
    // BU İDDİA ÖNCE METİN TARAMASIYLA YAZILDI VE YANLIŞ KIRMIZI VERDİ: kuralı ANLATAN
    // yorum satırının kendisi kalıba uyuyordu. Yorum kodun kanıtı değildir — o yüzden
    // burada yalnız GERÇEK şablon-dize düğümleri okunur.
    const source = ts.createSourceFile(
      OVERLAY,
      fs.readFileSync(OVERLAY, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const kacaklar: string[] = []
    const visit = (node: ts.Node): void => {
      if (ts.isTemplateExpression(node) && /^`\/\$\{/.test(node.getText())) {
        kacaklar.push(node.getText())
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    expect(kacaklar).toEqual([])
    // POZİTİF KONTROL: doğru dosyayı okuduğumuzu ayrıca kanıtla.
    expect(fs.readFileSync(OVERLAY, 'utf8')).toContain('localizedHref')
  })
})
