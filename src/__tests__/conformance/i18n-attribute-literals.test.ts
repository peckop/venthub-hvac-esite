import { describe, expect, it } from 'vitest'

/**
 * INV-I18N-ATTR · Kullanıcıya görünen ATTRIBUTE metni sözlükten gelmeli.
 *
 * NİÇİN VAR (ölçülmüş kör nokta, 2026-08-17): depoda `react/jsx-no-literals` kuralı
 * AÇIK ama iki sebeple bu sınıfı hiç görmüyor —
 *   1. `ignoreProps: true` → attribute değerleri taranmıyor,
 *   2. kural `warn` seviyesinde → fail-open, kimseyi durdurmuyor.
 * Ölçüm: 9 ham TR attribute canlıydı (LeadModal/CartPage/AddressFormModal/ResultCard/
 * CategoryFormModal/AdminSettingsPage/DataTableKit). Bunlar JSX çocuk metni değil,
 * `placeholder`/`aria-label`/`title`/`alt` içinde yaşadığı için i18n kampanyasının
 * tamamı bitmiş görünürken kullanıcıya Türkçe görünmeye devam ediyordu.
 *
 * A11Y BAĞI: `aria-label` çevrilmezse EN kullanıcı ekran okuyucuda TR duyar — bu aynı
 * anda WCAG kusurudur (3.1.2 Language of Parts sınıfı). Bu yüzden kapı, kozmetik
 * değil erişilebilirlik kapısıdır.
 *
 * ⭐ ÜÇ BİÇİM, TEK KURAL (ADMIN-CUSTOMER ölçümü, 2026-08-17): ilk sürümüm yalnız JSX
 * attribute'una bakıyordu ve AYNI dosyada 1 kalem bulurken sahibi 5 ölçtü. Kaçanlar
 * kuralı ihlal etmeyi bırakmamış, yalnız BİÇİM değiştirmişti:
 *   (a) prop varsayılanı        → `selectAllLabel = 'Tümünü seç'`  (destructuring içinde)
 *   (b) boş-birleştirici fallback → `totalLabel || 'Toplam'`, `?? 'Toplam'`
 *   (c) aynı dosyada birden çok attribute (Önceki/Sonraki) — tek isabette durmamak gerek
 * Üçü de ekran okuyucuya/kullanıcıya giden metin üretir. "Sayaç sıfırlandı" kuralın
 * bittiği anlamına gelmez — bu, ADMIN'in Faz-5'te yaşadığı `font-black` → inline
 * `fontWeight: 900` göçüyle aynı aile.
 *
 * KAPSAM BİLİNÇLİ OLARAK DAR: yalnız TÜRKÇE'ye özgü karakter içeren değerler. Böylece
 * `placeholder="https://..."`, `alt=""`, teknik/simge değerler yanlış-pozitif üretmez
 * (yanlış-KIRMIZI da kusurdur).
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

/** Kullanıcıya görünen attribute'lar. `label` HTML'de görünür metin taşıyabilir. */
const VISIBLE_ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'label'] as const

/**
 * Türkçe'ye ÖZGÜ karakterler. Yalnız bunları arıyoruz çünkü ASCII bir metnin
 * ("Save") çevrilmemiş TR mi yoksa meşru teknik değer mi ("https://...") olduğunu
 * statik olarak ayırt edemeyiz — ASCII'yi de yakalamak kapıyı yanlış-pozitif
 * fabrikasına çevirirdi. Bu bilinçli bir DUYARLILIK/KESİNLİK takasıdır:
 * kapı "her ihlali yakalar" demiyor, "yakaladığı her şey GERÇEK ihlaldir" diyor.
 */
const TURKISH_SPECIFIC = /[çğıöşüÇĞİÖŞÜ]/

/** (a) JSX attribute: `placeholder="..."` / `aria-label="..."` */
const ATTR_LITERAL = new RegExp(
  String.raw`\b(` + VISIBLE_ATTRS.join('|') + String.raw`)\s*=\s*(['"])([^'"]{2,})\2`,
  'g',
)

/**
 * (b)+(c) Görünen metin taşıyan prop/değişkenin VARSAYILANI ya da FALLBACK'i.
 * `...Label` / `...Text` / `...Title` / `...Placeholder` / `...Message` / `...Heading`
 * adlandırması bu depoda "kullanıcıya görünen metin" sözleşmesidir
 * (DataTableKit: `selectAllLabel`, `totalLabel`). Hem `=` varsayılanını hem
 * `||` / `??` fallback'ini yakalar — ikisi de attribute DEĞİL, o yüzden ilk
 * sürümüm ikisini de görmüyordu.
 */
const TEXT_PROP_LITERAL =
  /\b(\w*(?:Label|Text|Title|Placeholder|Message|Heading))\s*(?:=|\|\||\?\?)\s*(['"])([^'"]{2,})\2/g

/**
 * ADLA MUAFİYET (muafiyet = ADLA ilkesi). Boş kalması HEDEFTİR; her satır bir borçtur.
 *
 * - `components/admin/data-table/DataTableKit.tsx`: `aria-label="Önceki sayfa"` —
 *   dosya ADMIN-CUSTOMER şeridinin canlı claim'inde (2026-08-17). Ölçüldü, sahibine
 *   panodan adresli devredildi. Sahibi düzeltince BU SATIR SİLİNECEK.
 *   Kapıyı o düzeltmeyi beklerken kırmızı bırakmak, başka şeridi bloke etmek olurdu.
 */
const KNOWN_DEBT = new Set<string>([
  'components/admin/data-table/DataTableKit.tsx',
])

/**
 * Hukuk metinleri sözlükle değil DİZİNLE lokalize edilir (`legal/components/{tr,en}/`,
 * 12/12 parite ölçüldü) — 10 sayfalık sözleşmeyi sözlüğe koymak yanlış olurdu.
 * Bu bir muafiyet değil, KAPSAM DIŞI bir lokalizasyon deseni.
 */
const DIRECTORY_LOCALIZED = 'views/legal/components/'

/** Yorumları CRLF-güvenli siler — `.` bu depoda `\r` ile eşleşmez (T017 fantomu). */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
}

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

interface Offender {
  file: string
  attr: string
  value: string
}

function collectOffenders(): Offender[] {
  const offenders: Offender[] = []

  for (const [globKey, source] of Object.entries(SOURCES)) {
    const rel = toRelPath(globKey)
    if (rel.includes('__tests__') || rel.includes('.test.')) continue
    if (rel.startsWith(DIRECTORY_LOCALIZED)) continue
    if (KNOWN_DEBT.has(rel)) continue

    const clean = stripComments(source)

    for (const pattern of [ATTR_LITERAL, TEXT_PROP_LITERAL]) {
      pattern.lastIndex = 0
      let m: RegExpExecArray | null
      // `while` ile TÜM isabetler taranır — ilk isabette durmak, aynı dosyadaki
      // ikinci ihlali (Önceki/Sonraki sayfa) gizlerdi.
      while ((m = pattern.exec(clean)) !== null) {
        const [, attr, , value] = m
        if (!TURKISH_SPECIFIC.test(value)) continue
        offenders.push({ file: rel, attr, value: value.slice(0, 60) })
      }
    }
  }

  return offenders
}

describe('INV-I18N-ATTR · görünen metin sözlükten gelmeli (attribute + varsayılan + fallback)', () => {
  it('attribute, prop varsayılanı ve fallback içinde ham Türkçe literal yok', () => {
    const offenders = collectOffenders()

    expect(
      offenders,
      'Ham Türkçe attribute literali — sözlüğe taşı ve `t(...)` ile bağla ' +
        '(aria-label ise aynı zamanda a11y kusuru):\n' +
        offenders.map((o) => `  ${o.file}  ${o.attr}="${o.value}"`).join('\n'),
    ).toEqual([])
  })

  /**
   * Muafiyet listesi bayatlamasın: borç ödendiğinde satır SİLİNMELİ, yoksa liste
   * sessizce kalıcı olur ve kapı o dosyayı sonsuza dek görmez.
   * (Ratchet deseni — INV-5'in KNOWN_UNRESOLVED'ında kanıtlanmış.)
   */
  it('KNOWN_DEBT listesi bayat değil (düzelen dosya listede kalmamalı)', () => {
    const stale: string[] = []

    for (const debt of KNOWN_DEBT) {
      const entry = Object.entries(SOURCES).find(([k]) => toRelPath(k) === debt)
      if (!entry) {
        stale.push(`${debt} (dosya artık yok)`)
        continue
      }
      const clean = stripComments(entry[1])
      let hasViolation = false
      for (const pattern of [ATTR_LITERAL, TEXT_PROP_LITERAL]) {
        pattern.lastIndex = 0
        let m: RegExpExecArray | null
        while ((m = pattern.exec(clean)) !== null) {
          if (TURKISH_SPECIFIC.test(m[3])) { hasViolation = true; break }
        }
        if (hasViolation) break
      }
      if (!hasViolation) stale.push(`${debt} (düzelmiş — KNOWN_DEBT'ten SİL)`)
    }

    expect(stale, `KNOWN_DEBT bayat:\n  ${stale.join('\n  ')}`).toEqual([])
  })
})
