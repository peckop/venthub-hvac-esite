import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-EGRI-NOTU-BAGLANTI-1 (URN-127, karar 348) — eğri notunun kararı TEK yerden verilir ve ürün sayfası
 * o karara seçili varyantın GERÇEK kaynak etiketini besler.
 *
 * NİÇİN KAYNAK OKUYAN KAPI: ürün sayfası (`ProductDetailPageView`) bugün hiçbir render testiyle koşmaz;
 * `PqEgriNotu` bileşeni tek başına doğru olsa bile sayfa ona `kaynak` geçirmezse etiketli 6 noktalı eğri
 * notsuz, kesin ölçüm gibi görünür ve hiçbir test kırılmaz (alan opsiyoneldir). Kapı bağın KENDİSİNİ okur
 * (AST): JSX'te `<PqEgriNotu … kaynak={…pq_curve_kaynak…}>` var mı, ve sayfada ikinci bir elle yazılmış
 * "yaklaşık mı" kararı (`egriYaklasikMi(` çağrısı) kalmadı mı.
 */

const ROOT = process.cwd()
const PDP = path.join(ROOT, 'src', 'app', '_components', 'ProductDetailPageView.tsx')
const SIHIRBAZ = path.join(ROOT, 'src', 'components', 'category', 'SilentFanWizard.tsx')
const SERVIS = path.join(ROOT, 'src', 'lib', 'services', 'wizard.service.ts')

function ayristir(dosya: string): ts.SourceFile {
  return ts.createSourceFile(dosya, fs.readFileSync(dosya, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}

function gez(kok: ts.Node, ziyaret: (n: ts.Node) => void): void {
  ziyaret(kok)
  kok.forEachChild((c) => gez(c, ziyaret))
}

function cagriVarMi(sf: ts.SourceFile, ad: string): boolean {
  let bulundu = false
  gez(sf, (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === ad) bulundu = true
  })
  return bulundu
}

function jsxOznitelik(sf: ts.SourceFile, eleman: string, oznitelik: string): string | null {
  let bulunan: string | null = null
  gez(sf, (n) => {
    const etiket = ts.isJsxSelfClosingElement(n) ? n : ts.isJsxOpeningElement(n) ? n : null
    if (!etiket || etiket.tagName.getText(sf) !== eleman) return
    for (const a of etiket.attributes.properties) {
      if (ts.isJsxAttribute(a) && a.name.getText(sf) === oznitelik && a.initializer) {
        bulunan = a.initializer.getText(sf)
      }
    }
  })
  return bulunan
}

describe('INV-EGRI-NOTU-BAGLANTI-1 · eğri notu tek karar yeri + gerçek kaynak etiketi', () => {
  it('PDP: <PqEgriNotu kaynak={… pq_curve_kaynak …}> ve egri={val} ile bağlı', () => {
    const sf = ayristir(PDP)
    const kaynak = jsxOznitelik(sf, 'PqEgriNotu', 'kaynak')
    expect(kaynak, 'PDP PqEgriNotu çizmiyor ya da kaynak geçirmiyor').not.toBeNull()
    expect(kaynak, 'kaynak seçili varyantın pq_curve_kaynak alanından gelmeli').toMatch(/selectedVariant\b.*pq_curve_kaynak/)
    expect(jsxOznitelik(sf, 'PqEgriNotu', 'egri'), 'eğri değeri satırın değerinden gelmeli').toBe('{val}')
  })

  it('PDP ve sihirbaz kartı elle "yaklaşık mı" kararı vermez (egriYaklasikMi çağrısı yok)', () => {
    for (const dosya of [PDP, SIHIRBAZ]) {
      expect(cagriVarMi(ayristir(dosya), 'egriYaklasikMi'), `${path.basename(dosya)} ikinci bir karar yeri kurmuş`).toBe(false)
    }
  })

  it('sihirbaz kartı grafik notunu AdaySonucu.egriNotu üzerinden çizer (nokta sayısını kendisi saymaz)', () => {
    const kaynak = fs.readFileSync(SIHIRBAZ, 'utf8')
    expect(kaynak).toMatch(/sonuc\.egriNotu\s*===\s*'grafikten-okundu'/)
    expect(kaynak).toMatch(/data-testid="grafik-egri-notu"/)
    expect(kaynak).not.toMatch(/\.length\s*<=\s*YAKLASIK_EGRI_NOKTA_ESIGI/)
  })

  it('aday servisi pq_curve_kaynak alanını okur ve pqCurveKaynak olarak taşır', () => {
    const kaynak = fs.readFileSync(SERVIS, 'utf8')
    expect(kaynak).toMatch(/pqCurveKaynak:\s*specs\?\.pq_curve_kaynak/)
  })
})
