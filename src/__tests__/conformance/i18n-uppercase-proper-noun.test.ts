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
 * DONMUŞ BORÇ — 2026-08-23 ölçümü: **14 dosya / 21 ihlal**.
 *
 * NİÇİN DOSYA→SAYI, `dosya:satır` DEĞİL — 2026-08-23'te ÖLÇÜLDÜ, master KIRMIZI verdi:
 * İlk sürüm satır numarası donduruyordu. ÜRÜN `src/views/category/**` ve
 * `src/components/category/**` dosyalarını düzenleyince satırlar kaydı ve bu kapı,
 * KOD BOZULMADIĞI HALDE üç kolundan kırmızı verdi — aynı 14 dosya, aynı 21 ihlal,
 * yalnız numaralar farklıydı. Satır-tabanlı kayıt **yanlış kırmızı üretir** ve o kırmızı
 * bütün şeritlerin CI'ını bloklar. Dosya→sayı bu sürüklenmeden bağışıktır: dosya içinde
 * satır kaysa bile sayı değişmez; YENİ bir ihlal eklenirse sayı büyür ve kapı görür.
 *
 * Ratchet: liste yalnız KÜÇÜLEBİLİR. Dosyaların çoğu ÜRÜN/GÖRSEL şeridinde; bu kapı
 * cetveli koyar, düzeltmeyi sahibi yapar ve liste küçülür. Yeni ihlal KIRMIZI.
 */
const DONMUS_BORC: ReadonlyArray<readonly [string, number]> = [
  ['src/app/_components/ProductDetailPageView.tsx', 2], // {family.brand_name} · {selectedVariant.sku}
  ['src/components/BrandsShowcase.tsx', 1], // {brand.name}
  ['src/components/HVACIcons.tsx', 1], // {brand}
  ['src/components/LeadModal.tsx', 1], // {name}
  ['src/components/ProductCard.tsx', 2], // {product.brand}
  ['src/components/category/EnhancedNeedsWizard.tsx', 1], // {p.name}
  ['src/components/products/AddToProjectModal.tsx', 1], // {product.brand}
  ['src/components/products/FamilyCard.tsx', 2], // {family.brand_name}
  ['src/components/products/VariantSelector.tsx', 2], // {v.name} · {v.sku}
  ['src/views/BrandDetailPage.tsx', 2], // {brand.country} · {brand.headquarters}
  ['src/views/BrandsPage.tsx', 2], // {brand.country} · {brand.specialty}
  ['src/views/category/CategoryLandingView.tsx', 1], // {vm?.displayName}
  ['src/views/category/CategorySeriesView.tsx', 1], // {vm?.displayName || category.name}
  ['src/views/category/SeriesLandingView.tsx', 2], // {series.series_code} · {series.name}
]

/**
 * TESPİT KANARYASI — kapının kendi körlüğünü ölçer.
 * Recep'in 2026-08-23'te CANLI vitrinde gördüğü kusurun TA KENDİSİ. Kapı bunları
 * göremiyorsa kod değil KAPI bozuktur.
 *
 * SATIRA DEĞİL İÇERİĞE bağlı: satır numarası komşu şeridin her düzenlemesinde kayar ve
 * kanaryayı yanlış yere kırmızı verdirir — bu kapı tam bunu yaşadı.
 */
const KANARYA: ReadonlyArray<readonly [string, string]> = [
  ['src/views/category/SeriesLandingView.tsx', 'series.name'],
  ['src/views/category/CategoryLandingView.tsx', 'displayName'],
]

const MESAJ_YENI =
  'Veri kaynaklı özel ad CSS `uppercase` ile basılıyor. text-transform DİLE DUYARLIDIR: ' +
  'lang="tr" altında Vortice -> VORTİCE olur. Aile adları karışık dilde tek dize olduğu ' +
  "için `lang` vermek ÇÖZMEZ (38 adın 36'sı bu sınıfta). Çözüm: bu metni büyütme."

const MESAJ_KANARYA =
  "Recep 2026-08-23'te bu iki yerdeki kusuru CANLI vitrinde gördü (VORTİCE/LİNEO). " +
  'Kapı göremiyorsa desen bozulmuştur: `uppercase` sınıfı ile veri interpolasyonu ' +
  'farklı satırlara düşmüş ya da alan adı listesi eksik olabilir.'

const MESAJ_BAYAT =
  "Bu dosyalarda ihlal AZALDI. DONMUS_BORC'u gerçek sayıya indir (0 olduysa satırı SİL) — " +
  'borç kaydı yalnız küçülebilir.'

describe('INV-7: veri kaynaklı özel ad CSS uppercase ile basılmaz', () => {
  const { bulgular, tarananDosya } = tara()
  const borcHaritasi = new Map(DONMUS_BORC.map(([d, n]) => [d, n]))
  const sayim = new Map<string, number>()
  for (const b of bulgular) {
    const dosya = b.yer.split(':')[0]
    sayim.set(dosya, (sayim.get(dosya) ?? 0) + 1)
  }

  it('KAPSAM KANARYASI: tarama gerçekten bir şeye baktı', () => {
    // "0 ihlal" ancak tarama koştuysa bilgi taşır. Glob bozulursa bekçi sessizce YEŞİL döner.
    expect(tarananDosya).toBeGreaterThan(300)
  })

  it('TESPİT KANARYASI: bilinen iki ihlal GÖRÜLMELİ (satırla değil İÇERİKLE)', () => {
    const gorulmeyen = KANARYA.filter(
      ([dosya, parca]) => !bulgular.some((b) => b.yer.startsWith(`${dosya}:`) && b.ornek.includes(parca)),
    ).map(([dosya, parca]) => `${dosya} içinde "${parca}"`)
    expect(gorulmeyen, MESAJ_KANARYA).toEqual([])
  })

  it('Donmuş listede OLMAYAN hiçbir dosya ihlal etmiyor', () => {
    const yeni = [...sayim.keys()].filter((d) => !borcHaritasi.has(d)).sort()
    expect(yeni, `${MESAJ_YENI}\nDosyalar:\n${yeni.map((d) => `  - ${d}`).join('\n')}`).toEqual([])
  })

  it('Borçlu dosyalar ihlal sayısını ARTIRMIYOR', () => {
    const artan = [...sayim.entries()]
      .filter(([d, n]) => borcHaritasi.has(d) && n > borcHaritasi.get(d)!)
      .map(([d, n]) => `${d}: ${borcHaritasi.get(d)} → ${n}`)
      .sort()
    expect(artan, `BORÇ BÜYÜDÜ:\n${artan.join('\n')}`).toEqual([])
  })

  it('MANDAL: düşen borç listede güncellenmiş (yalnız küçülebilir)', () => {
    const bayat = DONMUS_BORC.filter(([d, n]) => (sayim.get(d) ?? 0) < n)
      .map(([d, n]) => `${d}: liste ${n}, gerçek ${sayim.get(d) ?? 0}`)
      .sort()
    expect(bayat, `${MESAJ_BAYAT}\n${bayat.join('\n')}`).toEqual([])
  })
})
