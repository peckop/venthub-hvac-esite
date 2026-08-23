import { describe, expect, it } from 'vitest'

/**
 * INV-7 · CSS `uppercase` VERİ KAYNAKLI ÖZEL ADA UYGULANAMAZ.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN — kusur 2026-08-23'te CANLI VİTRİNDE görüldü (Recep bildirdi)
 *
 * `text-transform: uppercase` **dile duyarlıdır**. Eleman `lang="tr"` mirası altındaysa
 * tarayıcı Türkçe kasa kuralını uygular ve `i → İ` olur. Bu Türkçe metin için DOĞRU,
 * yabancı özel ad için YANLIŞ:
 *
 *     Vortice → VORTİCE     Lineo → LİNEO     Quiet → QUİET
 *
 * Ölçüm (canlı prod, 2026-08-23):
 *   `brands.name`           : 5 markanın 2'si `i` içeriyor (Vortice, Nicotra Gebhardt)
 *   `product_families.name` : 38 ailenin **36'sı** `i` içeriyor
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN ÇÖZÜM "elemana lang ver" DEĞİL — ölçüldü, MÜMKÜN DEĞİL
 *
 * Aile adları **karışık dilde tek dize**: `'Vortice Lineo Quiet Kanal Fanları'`.
 * Tek bir `lang` değeri iki tarafı birden doğru yapamaz:
 *   lang="tr" → VORTİCE (marka bozulur)
 *   lang="en" → ENDÜSTRIYEL, EMIŞLI (Türkçe kelimeler bozulur)
 * 38 aile adının 36'sı bu sınıfta. Dize tek kolonda yaşadığı için parçalanamaz.
 * Dolayısıyla tek doğru kural: **veri kaynaklı özel adı CSS ile büyütme.**
 *
 * KAPSAM DIŞI (bilerek): sözlükten gelen STATİK arayüz metnini `uppercase` ile basmak
 * SERBEST. `t('...')` çağrısı içeren interpolasyonlar bu yüzden elenir — o metnin dili
 * sayfanın diliyle zaten aynıdır. Kusur, metnin dili ile elemanın dili AYRILDIĞINDA doğar.
 *
 * NOT: bu kapı KOD tarar. Kök `<html lang="tr">`'nin rotadan gelmesi AYRI bir kusurdur
 * (`src/app/layout.tsx`, Altyapı alanı) ve bu kapı onu GÖREMEZ — göremediğini gizlemiyoruz.
 * ─────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const isTestFile = (p: string) => p.includes('__tests__') || p.includes('.test.')

const UPPERCASE = /\buppercase\b/
/** Veri kaynaklı özel ad taşıyan alan adları. */
const ALAN = 'name|brand|brand_name|displayName|series_code|sku|model|country|specialty|headquarters'
/**
 * `{...alan...}` interpolasyonu — AMA `t(` içerenler HARİÇ.
 * `{t('pdp.labels.sku')}` sözlük metnidir, veri değil; kapsam dışı (bkz. başlık açıklaması).
 */
const VERI_INTERP = new RegExp(`\\{(?![^}]*\\bt\\()[^}]*\\b(?:${ALAN})\\b[^}]*\\}`)

interface Bulgu {
  yer: string
  ornek: string
}

function tara(): { bulgular: Bulgu[]; tarananDosya: number } {
  const bulgular: Bulgu[] = []
  let tarananDosya = 0
  for (const [path, raw] of Object.entries(SOURCES)) {
    if (isTestFile(path)) continue
    tarananDosya++
    const satirlar = raw.split('\n')
    satirlar.forEach((ln, i) => {
      if (!UPPERCASE.test(ln)) return
      // aynı satır + sonraki 3 satır: JSX çok satırlı yazılabiliyor
      const pencere = satirlar.slice(i, i + 4).join('\n')
      const m = pencere.match(VERI_INTERP)
      if (m) {
        bulgular.push({ yer: `${path.replace(/^\//, '')}:${i + 1}`, ornek: m[0].slice(0, 44) })
      }
    })
  }
  return { bulgular, tarananDosya }
}

/**
 * DONMUŞ BORÇ — 2026-08-23 ölçümü, 21 yer.
 *
 * Ratchet: liste yalnız KÜÇÜLEBİLİR. Dosyaların çoğu ÜRÜN/GÖRSEL şeridinde; bu kapı
 * cetveli koyar, düzeltmeyi sahibi yapar ve liste küçülür. Yeni ihlal KIRMIZI.
 */
const DONMUS_BORC: ReadonlySet<string> = new Set([
  'src/app/_components/ProductDetailPageView.tsx:501',
  'src/app/_components/ProductDetailPageView.tsx:608',
  'src/components/BrandsShowcase.tsx:43',
  'src/components/HVACIcons.tsx:295',
  'src/components/LeadModal.tsx:197',
  'src/components/ProductCard.tsx:102',
  'src/components/ProductCard.tsx:173',
  'src/components/category/EnhancedNeedsWizard.tsx:318',
  'src/components/products/AddToProjectModal.tsx:100',
  'src/components/products/FamilyCard.tsx:76',
  'src/components/products/FamilyCard.tsx:131',
  'src/components/products/VariantSelector.tsx:217',
  'src/components/products/VariantSelector.tsx:269',
  'src/views/BrandDetailPage.tsx:187',
  'src/views/BrandDetailPage.tsx:254',
  'src/views/BrandsPage.tsx:89',
  'src/views/BrandsPage.tsx:94',
  'src/views/category/CategoryLandingView.tsx:192',
  'src/views/category/CategorySeriesView.tsx:95',
  'src/views/category/SeriesLandingView.tsx:104',
  'src/views/category/SeriesLandingView.tsx:133',
])

/**
 * TESPİT KANARYASI — kapının kendi körlüğünü ölçer.
 * Bu iki yer Recep'in bildirdiği kusurun TA KENDİSİ (`{series.name}` ve `{vm?.displayName}`
 * `uppercase` altında). Kapı bunları göremiyorsa kod değil KAPI bozuktur.
 */
const KANARYA = ['src/views/category/SeriesLandingView.tsx:133', 'src/views/category/CategoryLandingView.tsx:192']

describe('INV-7: veri kaynaklı özel ad CSS uppercase ile basılmaz', () => {
  const { bulgular, tarananDosya } = tara()
  const yerler = new Set(bulgular.map((b) => b.yer))

  it('KAPSAM KANARYASI: tarama gerçekten bir şeye baktı', () => {
    // "0 ihlal" ancak tarama koştuysa bilgi taşır. Glob bozulursa bekçi sessizce YEŞİL döner.
    expect(tarananDosya).toBeGreaterThan(300)
  })

  it('TESPİT KANARYASI: bilinen iki ihlal GÖRÜLMELİ', () => {
    const gorulmeyen = KANARYA.filter((k) => !yerler.has(k))
    expect(
      gorulmeyen,
      'Recep 2026-08-23\'te bu iki yerdeki kusuru CANLI vitrinde gördü (VORTİCE/LİNEO). ' +
        'Kapı göremiyorsa desen bozulmuştur: `uppercase` sınıfı ile veri interpolasyonu ' +
        'farklı satırlara düşmüş ya da alan adı listesi eksik olabilir.',
    ).toEqual([])
  })

  it('YENİ ihlal yok (donmuş borç dışında)', () => {
    const yeni = bulgular.filter((b) => !DONMUS_BORC.has(b.yer)).map((b) => `${b.yer}  ${b.ornek}`)
    expect(
      yeni,
      'Veri kaynaklı özel ad CSS `uppercase` ile basılıyor. text-transform DİLE DUYARLIDIR: ' +
        'lang="tr" altında Vortice -> VORTİCE olur. Aile adları karışık dilde tek dize olduğu ' +
        'için `lang` vermek ÇÖZMEZ (38 adın 36\'sı bu sınıfta). Çözüm: bu metni büyütme.',
    ).toEqual([])
  })

  it('donmuş borç bayatlamaz (yalnız küçülebilir)', () => {
    const gereksiz = [...DONMUS_BORC].filter((y) => !yerler.has(y))
    expect(
      gereksiz,
      'Bu yerler artık ihlal değil (düzeltildi ya da satır kaydı bayatladı). ' +
        'DONMUS_BORC listesinden de çıkar — borç kaydı yalnız küçülebilir.',
    ).toEqual([])
  })
})
