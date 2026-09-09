import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-KATEGORI-404-1 — OLMAYAN KATEGORİ GERÇEK 404 DÖNER, "200 + Bulunamadı" DEĞİL
 *
 * KORUNAN DEĞİŞMEZ (iki yarısı BİRLİKTE, ayrılırsa ikisi de işe yaramaz):
 *   (a) Kategori rotası, kategori bulunamadığında `notFound()` çağırır.
 *   (b) `getCachedCategoryData` sorgu HATASINDA `throw` eder — hatayı `null`'a çevirmez.
 *
 * NİÇİN İKİSİ BİRDEN (canlı ölçüm, 2026-09-08):
 *   Yalnız (a) yapılırsa TEHLİKELİDİR. Eskiden `getCachedCategoryData` sorgu hatasını da
 *   "kategori yok" gibi `null` döndürüyordu. O `null`'a bakıp 404 üretmek, GEÇİCİ bir DB
 *   arızasını KALICI bir 404'e çevirirdi — üstelik rota artık statik olduğu için o 404 CDN'e
 *   yazılır ve gerçek kategori sayfası müşteri gözünden kaybolurdu. Yani düzeltme, düzelttiği
 *   kusurdan daha büyük bir kusur doğururdu.
 *
 *   Yalnız (b) yapılırsa da eksiktir: soft-404 sürer.
 *
 * ÖLÇÜLEN KUSUR (canlı, taze anahtarla):
 *   /tr/category/boyle-bir-kategori-yok-12345 → HTTP **200**, `noindex` YOK,
 *   başlık "Kategori Bulunamadı | VentHub", ve `X-Vercel-Cache: HIT` (yani saklanıyor).
 *   Google böyle sayfaları "Kopya / standart sayfa yok" kutusuna yazar — REC-205'te şikâyet
 *   edilen kutunun ta kendisi.
 *
 * NİÇİN AST, METİN DEĞİL:
 *   Metin taraması yorumla tatmin olur; bu dosyanın kendi açıklama yorumunda `notFound()`
 *   dizesi zaten geçiyor. Dahası `ts.Node.getText()` DE yorumları taşır — bu tuzağa aynı
 *   depoda bir kez düşüldü (INV-ALTGRUP-GORSEL-1, K5 kolu sabotajı geçmişti). Bu yüzden
 *   düğümler dolaşılır, metin karşılaştırılmaz.
 *
 * BOŞ EVREN KORUMASI: dosya okunamazsa ya da hiç çağrı düğümü bulunamazsa test KIRMIZI olur —
 * "ihlal 0" ile "hiç ölçmedim" aynı çıktıyı vermemelidir.
 *
 * BU KAPININ ÖLÇMEDİĞİ (sınırı gizlemiyorum):
 *   Canlı yanıtın gerçekten 404 olduğunu ölçmez — kaynağı okur, HTTP yapmaz. Davranışsal
 *   kanıt canlı ölçümdedir (PR gövdesi). Bir e2e kolu eklenirse yeri ALTYAPI'nın smoke'udur.
 */

const KOK = join(__dirname, '..', '..', '..')
const ROTA = join(KOK, 'src', 'app', '[lang]', 'category', '[categorySlug]', 'page.tsx')
const PRELOAD = join(KOK, 'src', 'lib', 'data', 'preload.ts')

function ayristir(yol: string): ts.SourceFile {
  const kaynak = readFileSync(yol, 'utf8')
  expect(kaynak.length, `BOŞ EVREN: ${yol} okunamadı ya da boş`).toBeGreaterThan(0)
  return ts.createSourceFile(yol, kaynak, ts.ScriptTarget.Latest, true)
}

/** Adı verilen fonksiyonun çağrıldığı düğümleri sayar (yorumlar dolaşılmaz). */
function cagriSayisi(kaynak: ts.SourceFile, ad: string): number {
  let sayi = 0
  const gez = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === ad) {
      sayi += 1
    }
    ts.forEachChild(n, gez)
  }
  gez(kaynak)
  return sayi
}

describe('INV-KATEGORI-404-1 — olmayan kategori gerçek 404 döner', () => {
  it('K1: rota dosyası `notFound` sembolünü next/navigation üzerinden İTHAL EDER', () => {
    const kaynak = ayristir(ROTA)
    let bulundu = false
    let ithalSayisi = 0

    const gez = (n: ts.Node): void => {
      if (ts.isImportDeclaration(n)) {
        ithalSayisi += 1
        const modul = ts.isStringLiteral(n.moduleSpecifier) ? n.moduleSpecifier.text : ''
        const bag = n.importClause?.namedBindings
        if (modul === 'next/navigation' && bag && ts.isNamedImports(bag)) {
          for (const el of bag.elements) {
            if (el.name.text === 'notFound') bulundu = true
          }
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)

    expect(ithalSayisi, 'BOŞ EVREN: rota dosyasında hiç import bulunamadı').toBeGreaterThan(0)
    expect(bulundu, '`notFound` next/navigation üzerinden ithal EDİLMELİ').toBe(true)
  })

  it('K2: rota dosyası `notFound()` çağrısını GERÇEKTEN yapar (yorum değil, çağrı düğümü)', () => {
    const kaynak = ayristir(ROTA)
    expect(
      cagriSayisi(kaynak, 'notFound'),
      '`notFound()` en az bir kez ÇAĞRILMALI — yorumda geçmesi yetmez',
    ).toBeGreaterThanOrEqual(1)
  })

  it('K3: `preload.ts` sorgu hatasında THROW eder — hatayı null’a çevirmez', () => {
    const kaynak = ayristir(PRELOAD)
    let throwSayisi = 0
    const gez = (n: ts.Node): void => {
      if (ts.isThrowStatement(n)) throwSayisi += 1
      ts.forEachChild(n, gez)
    }
    gez(kaynak)
    expect(
      throwSayisi,
      'Sorgu hatası `null` ile temsil edilirse geçici DB arızası KALICI 404 üretir (CDN’e yazılır)',
    ).toBeGreaterThanOrEqual(1)
  })

  it('K4: hata ile yokluk AYNI dalda birleştirilmemiş — `error || !rows` deseni YASAK', () => {
    // Bu tam olarak geri alınan satırdı: `if (error || !rows || rows.length === 0) return null`.
    // AST ile ararız: içinde hem `error` hem `rows` geçen bir `||` zinciri, `return null` gövdeli
    // bir if içinde durmamalı.
    const kaynak = ayristir(PRELOAD)
    let ihlal = 0

    const ikiliIcindeIsim = (n: ts.Node, ad: string): boolean => {
      let var_ = false
      const gez = (x: ts.Node): void => {
        if (ts.isIdentifier(x) && x.text === ad) var_ = true
        ts.forEachChild(x, gez)
      }
      gez(n)
      return var_
    }

    const gez = (n: ts.Node): void => {
      if (ts.isIfStatement(n) && ts.isBinaryExpression(n.expression)) {
        const kosul = n.expression
        const veyaZinciri = kosul.operatorToken.kind === ts.SyntaxKind.BarBarToken
        if (veyaZinciri && ikiliIcindeIsim(kosul, 'error') && ikiliIcindeIsim(kosul, 'rows')) {
          ihlal += 1
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)

    expect(
      ihlal,
      '`error` ile `rows` yokluğu TEK koşulda birleştirilmiş — "ölçemedim" ile "yok" ayrımı kayboluyor',
    ).toBe(0)
  })

  it('K5: rota, `category` yokluğunu kontrol eden bir dal TAŞIR (erken çıkış)', () => {
    const kaynak = ayristir(ROTA)
    let bulundu = false

    const gez = (n: ts.Node): void => {
      if (ts.isIfStatement(n)) {
        // `if (!category)` — tekil olumsuzlama, `category` tanımlayıcısı üzerinde
        const k = n.expression
        if (
          ts.isPrefixUnaryExpression(k) &&
          k.operator === ts.SyntaxKind.ExclamationToken &&
          ts.isIdentifier(k.operand) &&
          k.operand.text === 'category'
        ) {
          bulundu = true
        }
      }
      ts.forEachChild(n, gez)
    }
    gez(kaynak)

    expect(bulundu, 'Rota `if (!category)` dalı taşımalı — yoksa 404 yolu hiç çalışmaz').toBe(true)
  })
})
