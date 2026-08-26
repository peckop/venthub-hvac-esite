import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { etkinGorunumModu } from '../../views/CategoryMasterView'

/**
 * INV-CATEGORY-REACH-1 — her kategori sayfası İLERİYE bir yol açar.
 *
 * NİÇİN BU KAPI VAR (canlı ölçüm, 2026-08-26 · REC-72/T141 ölçümü sırasında çıktı):
 * `CategoryShowcaseView` yalnız `subCategories` alır, `families` ALMAZ; showcase'te sayfalama
 * da kapalıdır. Yani **alt kategorisi olmayan** bir showcase kategorisi müşteriye hiçbir şey
 * listelemez. Prod'da, tarayıcıda, ana içerik bölgesi sayılarak ölçüldü:
 *
 *   /tr/category/isi-geri-kazanim                 16 aktif ürün → 0 ürün, 0 kategori bağlantısı
 *   /tr/category/endustriyel-tavan-vantilatorleri  7 aktif ürün → 0 ürün, 0 kategori bağlantısı
 *
 * Ayırt edici kontrol: aynı görünüm alt kategorisi OLAN kategoride ÇALIŞIYOR
 * (/tr/category/endustriyel-havalandirma → 7 alt kategori kartı). Bileşen bozuk değildi;
 * **veri yokken boşa düşüyordu**. Etkilenen: 27 aktif ürün.
 *
 * BU KUSURU HİÇBİR MEVCUT KAPI GÖREMEZDİ:
 *   • tsc/lint — sözdizimi ve tipler kusursuz,
 *   • HTML metin taraması — sözlük dizeleri RSC yüküne serileştiği için hem eski hem yeni
 *     hâlde sayfada geçiyor; gösterge iki durumu AYIRT ETMİYOR (ölçüldü, yanlış hüküm ürettim),
 *   • katalog bütünlüğü — veri tutarlı, kusur veri ile GÖRÜNÜM eşleşmesinde.
 *
 * KAPI İKİ ŞEY TUTAR:
 *   1. DAVRANIŞ — modu düşüren kural gerçekten çalışıyor (doğruluk tablosu).
 *   2. TEK KAYNAK — mod İKİ yerde tüketiliyor (hangi görünüm çizilecek + sayfalama gösterilecek
 *      mi). İkisi ayrı hesaplanırsa sessizce ayrışır; bu dosyada zaten bir kez ayrışmıştı.
 */

const MASTER = path.join(process.cwd(), 'src', 'views', 'CategoryMasterView.tsx')

describe('INV-CATEGORY-REACH-1 — kategori görünümü ileriye yol açar', () => {
  it('DAVRANIŞ — alt kategorisi olmayan showcase, seri görünümüne düşer', () => {
    // Kusurun ta kendisi: 0 alt kategori + showcase = boş sayfa.
    expect(etkinGorunumModu('showcase', 0)).toBe('series')
  })

  it('DAVRANIŞ — alt kategorisi OLAN showcase olduğu gibi kalır (aşırı düzeltme yok)', () => {
    // Ayırt edici kolun öteki yarısı: düzeltme çalışan hâli BOZMAMALI.
    // Tek kollu bir kapı, "her şeyi series yap" sabotajını da yeşil geçirirdi.
    expect(etkinGorunumModu('showcase', 1)).toBe('showcase')
    expect(etkinGorunumModu('showcase', 7)).toBe('showcase')
  })

  it('DAVRANIŞ — öteki modlara DOKUNULMAZ, alt kategori sayısından bağımsız', () => {
    for (const alt of [0, 1, 9]) {
      expect(etkinGorunumModu('series', alt)).toBe('series')
      expect(etkinGorunumModu('landing', alt)).toBe('landing')
      expect(etkinGorunumModu('grid', alt)).toBe('grid')
    }
  })

  it('TEK KAYNAK — ham `category.displayMode` yalnız kuralın GİRDİSİ olarak okunur', () => {
    // Dosyada `category.displayMode` erişimi TEK olmalı: etkinGorunumModu'ya verilen argüman.
    // İkinci bir erişim, "mod"un iki ayrı yerde ayrı hesaplandığı anlamına gelir — kusurun
    // geri gelme yolu tam olarak budur (sayfalama koşulu bir zamanlar ham modu okuyordu).
    //
    // AST ile okunur, metin taramasıyla DEĞİL: bu dosyanın yorumları `category.displayMode`
    // ifadesini açıklama amacıyla içerir ve metin tarayan bir iddia onlara takılırdı
    // (aynı sınıf hatayı bugün bir kez yaptım ve kapı yanlış kırmızı verdi).
    const source = ts.createSourceFile(
      MASTER,
      fs.readFileSync(MASTER, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const erisimler: string[] = []
    const visit = (node: ts.Node): void => {
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name.text === 'displayMode' &&
        node.expression.getText().startsWith('category')
      ) {
        erisimler.push(node.parent.getText().slice(0, 80))
      }
      ts.forEachChild(node, visit)
    }
    visit(source)

    // POZİTİF KONTROL: hiç bulamazsak iddia HİÇBİR ŞEY ölçmeden yeşil kalırdı.
    expect(erisimler.length).toBeGreaterThan(0)
    expect(erisimler.length).toBe(1)
    expect(erisimler[0]).toContain('etkinGorunumModu')
  })
})
