import { describe, expect, it } from 'vitest'

import type { CategoryDescriptionSource } from '../../utils/categoryHelpers'
import { getCategoryDescription } from '../../utils/categoryHelpers'

/**
 * INV-KATEGORI-ACIKLAMA-1 · Kategori açıklaması DİLE GÖRE çözülür (kalıcı bekçi).
 *
 * SSOT: `getCategoryDescription(category, lang)` — `src/utils/categoryHelpers.ts`.
 * Çözüm sırası: `metadata.description_i18n[lang]` → `metadata.hero_description` (legacy,
 * tek dilli) → `category.description` → `''`. Kalıp, kardeş çözücü
 * `getLocalizedCategorySlug` (`metadata.slug = {tr,en}`) ile BİREBİR aynıdır.
 *
 * NİÇİN (2026-09-06 ölçümü, REC-161): çözücü dile HİÇ bakmıyordu. Kusur o gün canlıda
 * GÖRÜNMÜYORDU — `categories.description` 37/37 satırda NULL, `hero_description` yalnız
 * 2 satırda vardı; yani vitrin sözlük yedeğine düşüyordu. Kusur LATENT'ti: katalog şeridi
 * 23 kategori paragrafını yazdığı an tek-dilli alandaki Türkçe metin İngilizce vitrinde
 * de Türkçe görünecekti.
 *
 * Bu kapı DÖRT kolu birden tutar:
 *   K1 davranış      — description_i18n varken TR/EN ayrışır
 *   K2 geriye uyum   — description_i18n YOKKEN sonuç, ESKİ algoritmanın sonucuyla birebir
 *   K3 çağrı arity   — hiçbir çağıran `lang`'sız çağırmaz (tsc'den BAĞIMSIZ ikinci kol)
 *   K4 ham kaçak     — `metadata.description_i18n` render katmanında ham okunmaz
 * artı K5 ayırt edicilik (sentetik yakalar/serbest bırakır) ve K6 boşluk muhafızı.
 *
 * NOT: Kaynağı Vite'ın `import.meta.glob('?raw')`'ı ile okuyoruz (INV-4 ile aynı sebep).
 * Yorumlar taranmadan silinir → bu dosyadaki açıklayıcı desenler bekçiyi tetiklemez.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Dile-bağlı açıklamayı meşru çözen TEK dosya. */
const SSOT_FILE = 'utils/categoryHelpers.ts'

/** Bu kapının kendi dosyası (sentetik desenler taranmamalı). */
const SELF = '__tests__/conformance/kategori-aciklama-dil-cozumu.test.ts'

/**
 * Ham `metadata.description_i18n` okuması. Alıcı token'ı BİLEREK `metadata|meta` ile
 * sınırlı: ürün tarafında `products.description_i18n` KOLONU ayrı ve meşrudur
 * (`product.description_i18n`, `dbProd.description_i18n`) — o başka şeridin dosyası,
 * bu kapı ona dokunmaz.
 */
const RAW_META_I18N = /\b(?:metadata|meta)\s*(?:\?\.|\.)\s*description_i18n\b|\b(?:metadata|meta)\s*(?:\?\.)?\[\s*['"]description_i18n['"]\s*\]/

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

/**
 * `openParenIdx` konumundaki '(' ile açılan çağrının ÜST DÜZEY argüman sayısı.
 * Dizgi/şablon içeriği atlanır, iç içe parantez/köşe/süslü sayılmaz.
 * @returns argüman sayısı · 0 = argümansız · -1 = dengesiz parantez (kusur sayılır)
 */
export function countTopLevelArgs(src: string, openParenIdx: number): number {
  let depth = 0
  let commas = 0
  let seenContent = false
  let quote: string | null = null

  for (let i = openParenIdx; i < src.length; i++) {
    const ch = src[i]
    if (quote) {
      if (ch === quote && src[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      seenContent = true
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++
      if (depth > 1) seenContent = true
      continue
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      depth--
      if (depth === 0) return seenContent ? commas + 1 : 0
      continue
    }
    if (depth === 1 && ch === ',') {
      commas++
      continue
    }
    if (!/\s/.test(ch)) seenContent = true
  }
  return -1
}

export type CallSite = { file: string; args: number }

/** Bir kaynaktaki her `getCategoryDescription(...)` ÇAĞRISINI bulur (tanım/import hariç). */
export function findResolverCalls(file: string, rawSource: string): CallSite[] {
  const src = stripComments(rawSource)
  const out: CallSite[] = []
  const re = /\bgetCategoryDescription\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    const openParen = src.indexOf('(', m.index)
    out.push({ file, args: countTopLevelArgs(src, openParen) })
  }
  return out
}

// ---------------------------------------------------------------------------
// Taranan evren (bir kez hesaplanır — K3/K6 aynı evreni paylaşır)
// ---------------------------------------------------------------------------
const SCANNED: Array<{ rel: string; clean: string }> = []
const ALL_CALLS: CallSite[] = []

for (const [key, source] of Object.entries(SOURCES)) {
  const rel = toRelPath(key)
  if (rel.endsWith('.d.ts')) continue
  if (rel === SELF) continue
  SCANNED.push({ rel, clean: stripComments(source) })
  ALL_CALLS.push(...findResolverCalls(rel, source))
}

/** Ürün kodu (test olmayan) çağrı yerleri. */
const PRODUCT_CALLS = ALL_CALLS.filter(
  (c) => !c.file.includes('__tests__') && !c.file.includes('.test.'),
)

/**
 * CANLI müşteri yüzeyine ulaşan, bu kapının ADIYLA pinlediği çağrı yerleri.
 * Pinlemenin sebebi ölçülmüş bir vaka: REC-161 iş emri `hooks/useCategoryViewModel.ts`'i
 * HİÇ listelememişti; oysa canlı kategori sayfasının gerçek yolu orasıdır
 * (CategoryMasterView → CategoryShowcaseView → vm.description). Yalnız emirdeki yerler
 * düzeltilseydi 23 paragraf kategori sayfasında hiç görünmezdi.
 * (`components/category/CategoryShowcase.tsx` BİLEREK pinlenmedi — hiçbir dosya onu
 * import etmiyor = ölü kod; silinirse bu kapı yanlış kırmızı vermemeli.)
 */
const PINNED_LIVE_CALLERS = ['app/[lang]/page.tsx', 'hooks/useCategoryViewModel.ts']

/** Değişiklikten ÖNCEKİ algoritma — geriye uyum ölçmek için referans. */
function eskiCozucu(category: CategoryDescriptionSource | null | undefined): string {
  if (!category) return ''
  const meta = category.metadata
  if (meta && typeof meta === 'object') {
    const hero = (meta as { hero_description?: unknown }).hero_description
    if (hero) return String(hero)
  }
  return category.description || ''
}

describe('INV-KATEGORI-ACIKLAMA-1 · kategori açıklaması dile göre çözülür', () => {
  // -------------------------------------------------------------------------
  it('K1 · description_i18n varken TR sayfada TR, EN sayfada EN metin döner', () => {
    const cat: CategoryDescriptionSource = {
      metadata: {
        description_i18n: { tr: 'Endustriyel mutfak fanlari', en: 'Industrial kitchen fans' },
        hero_description: 'ESKI TEK DILLI TURKCE',
      },
      description: 'kolon metni',
    }

    expect(getCategoryDescription(cat, 'tr')).toBe('Endustriyel mutfak fanlari')
    expect(getCategoryDescription(cat, 'en')).toBe('Industrial kitchen fans')
    // Asil kusur: EN sayfada TR metin sizmamali
    expect(getCategoryDescription(cat, 'en')).not.toBe('Endustriyel mutfak fanlari')
    expect(getCategoryDescription(cat, 'en')).not.toBe('ESKI TEK DILLI TURKCE')
  })

  // -------------------------------------------------------------------------
  it('K2 · description_i18n YOKKEN sonuç, eski algoritmayla BİREBİR aynı (geriye uyum)', () => {
    const legacyVakalari: CategoryDescriptionSource[] = [
      {},
      { description: 'sadece kolon' },
      { description: '' },
      { metadata: {}, description: 'bos metadata + kolon' },
      { metadata: { hero_description: 'hero kazanir' }, description: 'kolon kaybeder' },
      { metadata: { hero_description: 'hero var, kolon yok' } },
      { metadata: { hero_description: '' }, description: 'bos hero -> kolon' },
      { metadata: { slug: { tr: 'a', en: 'b' } }, description: 'ilgisiz metadata' },
      { metadata: null, description: 'null metadata' },
      { metadata: { hero_description: 'hero' }, description: null },
    ]

    for (const lang of ['tr', 'en']) {
      for (const vaka of legacyVakalari) {
        expect(
          getCategoryDescription(vaka, lang),
          `geriye uyum KIRILDI (lang=${lang}): ${JSON.stringify(vaka)}`,
        ).toBe(eskiCozucu(vaka))
      }
    }

    // null/undefined kolu da eski davranışı korumalı
    expect(getCategoryDescription(null, 'en')).toBe(eskiCozucu(null))
    expect(getCategoryDescription(undefined, 'tr')).toBe(eskiCozucu(undefined))

    // Ve dil, legacy veride sonucu DEĞİŞTİRMEMELİ (tek dilli alanın doğası)
    for (const vaka of legacyVakalari) {
      expect(getCategoryDescription(vaka, 'tr')).toBe(getCategoryDescription(vaka, 'en'))
    }
  })

  // -------------------------------------------------------------------------
  it('K3 · hiçbir çağıran `lang` geçirmeden çözücüyü çağırmıyor', () => {
    const offenders = ALL_CALLS.filter((c) => c.args < 2)

    expect(
      offenders.map((o) => `${o.file} (arg=${o.args})`),
      'getCategoryDescription `lang` argümanı OLMADAN çağrılıyor — sessizce Türkçe basar.\n' +
        'Doğrusu: getCategoryDescription(category, lang)',
    ).toEqual([])
  })

  // -------------------------------------------------------------------------
  it('K4 · render katmanında ham `metadata.description_i18n` okuması yok', () => {
    const offenders = SCANNED.filter(
      (f) => f.rel !== SSOT_FILE && RAW_META_I18N.test(f.clean),
    ).map((f) => f.rel)

    expect(
      offenders,
      'Ham (dil-çözümsüz) kategori metadata açıklaması okunuyor — ' +
        `getCategoryDescription(category, lang) kullan:\n  ${offenders.join('\n  ') || '—'}`,
    ).toEqual([])
  })

  // -------------------------------------------------------------------------
  it('⭐K4b · YENİ ham `category.description` okuyucusu DOĞAMAZ (şerit sahibi ölçümü)', () => {
    // NİÇİN BU KOL SONRADAN EKLENDİ — ölçülerek bulundu, kapının ilk hâli üzerinde:
    // `src/components/category/` altına, ham `category.description` okuyan YENİ bir
    // dosya koydum ve kapı **7/7 YEŞİL kaldı**. Yani kapı BİLİNEN çağrı yerlerini
    // koruyordu ama YARIN eklenecek kodu görmüyordu — anlık görüntü, mandal değil.
    // K3 çözücüyü `lang`siz çağıranı yakalar; K7 huniden beslenmeyen yüzeyi yakalar;
    // ama çözücüyü HİÇ çağırmayıp kolonu doğrudan okuyan bir dosya ikisinin de
    // arasından geçiyordu. Kusurun tamamı zaten buydu (REC-161'in kendi olayı:
    // `useCategoryViewModel.ts:79` tam olarak böyle bir ham okumaydı).
    //
    // ⚖MUAFİYET, ADIYLA VE GEREKÇESİYLE (ölçüldü, uydurulmadı):
    //  · `app/[lang]/category/[categorySlug]/page.tsx` — burada `s.description`
    //    RENDER EDİLMİYOR; `mapDatabaseCategoryToDomain`'e GEÇİRİLİYOR, yani alan
    //    huniye giden yolun üzerinde taşınıyor. Taşımak okumak değildir.
    //  · `admin/**` ve `lib/admin/**` — BAŞKA ŞERİDİN CLAIM'İ. Admin bir vitrin değil
    //    bir düzenleme aracıdır; ham kolonu görmesi meşrudur. Bu kapı oraya DOKUNMAZ.
    //  · SSOT_FILE — çözücünün kendisi; zincirin son yedeği olarak ham kolonu okur.
    //
    // ⚠SINIR — İKİ TANE, ikisi de ölçülerek bulundu:
    //  1. Bu kol `<değişken>.description` biçimini arar. Alan başka bir isme atanıp
    //     (`const d = cat; d.description`) okunursa GÖRMEZ. Gevşeklik bilinçli: amaç
    //     yanlış-KIRMIZI vermemek. Gerçek koruma ölçülenden biraz DAR olabilir.
    //  2. ⭐METİN TARAMASI TİP AYRIMI YAPAMAZ. `category.description` iki AYRI şey
    //     olabilir: ham DB kolonu (kusur) ya da bir görünüm-modelinin ÇÖZÜLMÜŞ metin
    //     alanı (meşru). İkisi kaynakta AYNI görünür. Bu yüzden aşağıdaki muafiyet
    //     kaçınılmaz — ve tam da bu sebeple GEREKÇESİ yazılmak zorunda.
    const MUAF = [
      SSOT_FILE,
      // Burada `s.description` RENDER EDİLMİYOR; `mapDatabaseCategoryToDomain`'e
      // GEÇİRİLİYOR — alan huniye giden yolun üzerinde taşınıyor. Taşımak okumak değil.
      'app/[lang]/category/[categorySlug]/page.tsx',
      // ⭐ÖLÇÜLDÜ, VARSAYILMADI: bu kol ilk koşumda BU DOSYAYI yakaladı ve
      // YANLIŞ-KIRMIZIydı. Sebebi: `app/[lang]/page.tsx:153` artık metni
      // `getCategoryDescription(c, lang)` ile ÇÖZÜP `CategoryViewModelLite`e koyuyor;
      // buradaki `category` o görünüm-modelidir, `DbCategory` DEĞİL. Yani okunan şey
      // ham kolon değil ZATEN ÇÖZÜLMÜŞ metin — tüketici yeniden çözmez, yalnız basar.
      // ⚠BU MUAFİYETİN BEDELİ: yarın biri buraya GERÇEK bir `DbCategory` geçirirse
      // kapı SUSAR. Onu tutan şey K3+K7'dir (üretici taraf `lang`siz çağıramaz ve
      // yüzey huniden beslenmek zorundadır), bu kol değil.
      'components/home/GuidedCategoryDiscovery.tsx',
    ]
    const HAM_KOLON = /\b(?:category|categoryRow|localizedCategory|dbCategory|cat|subCategory)\s*(?:\?\.|\.)\s*description\b(?!_i18n)/

    const offenders = SCANNED
      .filter((f) => !MUAF.includes(f.rel))
      .filter((f) => !f.rel.startsWith('components/admin/'))
      .filter((f) => !f.rel.startsWith('views/admin/'))
      .filter((f) => !f.rel.startsWith('lib/admin/'))
      .filter((f) => HAM_KOLON.test(f.clean))
      .map((f) => f.rel)

    expect(
      offenders,
      'Ham (dil-çözümsüz) `category.description` okunuyor. Kategori açıklaması artık\n' +
        'DİLE GÖRE çözülür: getCategoryDescription(category, lang) kullan, ya da metni\n' +
        'useCategoryViewModel hunisinden al. Muafiyet gerekiyorsa MUAF listesine\n' +
        'GEREKÇESİYLE eklenir — sessizce değil. İhlaller:\n  ' +
        (offenders.join('\n  ') || '—'),
    ).toEqual([])

    // AYIRT EDİCİLİK — desen hem yakalamalı hem serbest bırakmalı:
    expect(HAM_KOLON.test('const m = category.description || ""'), 'ham okumayi YAKALAMADI').toBe(true)
    expect(HAM_KOLON.test('localizedCategory?.description'), 'opsiyonel zinciri YAKALAMADI').toBe(true)
    expect(HAM_KOLON.test('category.description_i18n'), 'i18n alanini YANLISLIKLA yakaladi').toBe(false)
    expect(HAM_KOLON.test('product.description'), 'urun alanini YANLISLIKLA yakaladi').toBe(false)
    expect(HAM_KOLON.test('vm.description'), 'huni ciktisini YANLISLIKLA yakaladi').toBe(false)
  })

  // -------------------------------------------------------------------------
  it('K5 · AYIRT EDİCİ: tarayıcı sentetik kusuru YAKALAR, temizi SERBEST BIRAKIR', () => {
    // --- K3 tarayıcısı: yakalamalı ---
    const kotu = [
      'const d = getCategoryDescription(category)',
      'getCategoryDescription( cat )',
      'x = getCategoryDescription(a.b.c(d, e))', // ic ice virgul UST DUZEY degil
      'getCategoryDescription({ description: "x", metadata: null })', // tek nesne argumani
      'getCategoryDescription()',
    ]
    for (const src of kotu) {
      const calls = findResolverCalls('sentetik.ts', src)
      expect(calls.length, `cagri bulunamadi: ${src}`).toBe(1)
      expect(calls[0].args, `YAKALAMADI: ${src}`).toBeLessThan(2)
    }

    // --- K3 tarayıcısı: serbest bırakmalı ---
    const iyi = [
      'const d = getCategoryDescription(category, lang)',
      'getCategoryDescription(c, lang === "en" ? "en" : "tr")',
      'getCategoryDescription(cat, resolve(a, b))', // ic ice virgul argumani cogaltmaz
      'getCategoryDescription({ description: "x, y" }, lang)', // dizgi ici virgul sayilmaz
      'getCategoryDescription(cat, `${lang}`)',
      'description: getCategoryDescription(localizedCategory, lang),',
    ]
    for (const src of iyi) {
      const calls = findResolverCalls('sentetik.ts', src)
      expect(calls.length, `cagri bulunamadi: ${src}`).toBe(1)
      expect(calls[0].args, `YANLIS KIRMIZI: ${src}`).toBeGreaterThanOrEqual(2)
    }

    // --- Tanım ve import satırı ÇAĞRI sayılmamalı (yanlış kırmızı kaynağı) ---
    expect(
      findResolverCalls('x.ts', 'export const getCategoryDescription = (category, lang) => ""'),
    ).toEqual([])
    expect(
      findResolverCalls('x.ts', "import { getCategoryDescription, getCategoryDisplayName } from './h'"),
    ).toEqual([])

    // --- Yorum içindeki kusurlu örnek tetiklememeli ---
    expect(findResolverCalls('x.ts', '// getCategoryDescription(category)')).toEqual([])
    expect(findResolverCalls('x.ts', '/* getCategoryDescription(cat) */')).toEqual([])

    // --- K4 regex'i: yakalamalı ---
    for (const src of [
      'const x = category.metadata.description_i18n',
      'const x = cat.metadata?.description_i18n?.tr',
      'const meta = c.metadata; return meta.description_i18n',
      "const x = metadata['description_i18n']",
    ]) {
      expect(RAW_META_I18N.test(src), `K4 YAKALAMADI: ${src}`).toBe(true)
    }

    // --- K4 regex'i: serbest bırakmalı (ÜRÜN kolonu başka şeridin meşru alanı) ---
    for (const src of [
      'const x = product.description_i18n',
      'const raw = dbProd.description_i18n?.tr',
      "select('id, name, description_i18n, slug')",
      'const x = category.metadata.hero_description',
    ]) {
      expect(RAW_META_I18N.test(src), `K4 YANLIS KIRMIZI: ${src}`).toBe(false)
    }
  })

  // -------------------------------------------------------------------------
  it('K6 · BOŞLUK MUHAFIZI: tarama evreni boşalırsa kapı sahte-yeşil vermez', () => {
    // Kaynak evreni gerçekten dolu mu (glob deseni bozulursa burası düşer)
    expect(SCANNED.length, 'Kaynak evreni BOŞ — import.meta.glob deseni bozuk').toBeGreaterThan(200)

    // Çözücü gerçekten çağrılıyor mu (ürün kodunda)
    expect(
      PRODUCT_CALLS.length,
      'Ürün kodunda HİÇ getCategoryDescription çağrısı yok — çözücü devre dışı bırakılmış olabilir',
    ).toBeGreaterThanOrEqual(2)

    // Canlı yüzeyler ADIYLA yerinde mi (evren daralırsa kapı kırmızı olmalı)
    const cagiranDosyalar = new Set(PRODUCT_CALLS.map((c) => c.file))
    for (const pinned of PINNED_LIVE_CALLERS) {
      expect(
        cagiranDosyalar.has(pinned),
        `CANLI çağrı yeri kayboldu: ${pinned} — kategori açıklaması dil çözümünden çıkmış olabilir.\n` +
          `Bulunan çağıranlar: ${[...cagiranDosyalar].join(', ') || '—'}`,
      ).toBe(true)
    }

    // SSOT dosyası taranan evrende mi (allowlist yanlış yazılırsa K4 anlamsızlaşır)
    expect(
      SCANNED.some((f) => f.rel === SSOT_FILE),
      `SSOT dosyası taranan evrende yok: ${SSOT_FILE}`,
    ).toBe(true)
  })

  // -------------------------------------------------------------------------
  /**
   * K7 · HUNİ KOLU. Kategori açıklamasını basan vitrin yüzeylerinin ÇOĞU, metni
   * doğrudan değil `wrapCategory()` viewmodel'inden alır (`vm?.description`).
   * O huninin tek ağzı `useCategoryViewModel` — REC-161'de düzeltilen yer orası.
   *
   * Ölçüm (2026-09-06): huniden beslenen BEŞ dosya, ALTI render yeri —
   * CategoryShowcaseView (2) · CategoryLandingView · CategorySeriesView ·
   * CategoryHubOverlay · EliteMegaMenu. İş emri bu huniyi HİÇ listelememişti;
   * yani "3 okuyucu" sanılan iş aslında bu tek düzeltmeyle 6 yüzeyi kapatıyor.
   *
   * Bu kol, biri huniyi ATLAYIP kendi viewmodel'ini kurarsa kırmızı verir.
   */
  it('K7 · vm.description basan her yüzey metni useCategoryViewModel hunisinden alır', () => {
    const VM_DESC_RENDER = /\b\w*[Vv]m\s*\??\.\s*description\b/

    const vmRenderFiles = SCANNED.filter(
      (f) =>
        f.rel !== 'hooks/useCategoryViewModel.ts' &&
        !f.rel.includes('__tests__') &&
        !f.rel.includes('.test.') &&
        VM_DESC_RENDER.test(f.clean),
    )

    // Boşluk muhafızı: huni gerçekten kullanılıyor mu?
    expect(
      vmRenderFiles.length,
      'Kategori viewmodel açıklaması basan HİÇ dosya bulunamadı — desen bozulmuş olabilir',
    ).toBeGreaterThanOrEqual(5)

    const huniyiAtlayanlar = vmRenderFiles
      .filter((f) => !/useCategoryViewModel/.test(f.clean))
      .map((f) => f.rel)

    expect(
      huniyiAtlayanlar,
      'Kategori açıklaması viewmodel üzerinden basılıyor ama dosya `useCategoryViewModel`\n' +
        'kullanmıyor — huni atlanmış, açıklama dil çözümünden geçmiyor olabilir:\n  ' +
        (huniyiAtlayanlar.join('\n  ') || '—'),
    ).toEqual([])

    // Ayırt edicilik: desen doğru olanı serbest, kusurluyu yakalar
    expect(VM_DESC_RENDER.test('{vm?.description || fallback}')).toBe(true)
    expect(VM_DESC_RENDER.test('{subVm?.description}')).toBe(true)
    expect(VM_DESC_RENDER.test('{hoveredVm?.description}')).toBe(true)
    expect(VM_DESC_RENDER.test('{product.description}')).toBe(false)
    expect(VM_DESC_RENDER.test('{brand.description}')).toBe(false)
  })
})
