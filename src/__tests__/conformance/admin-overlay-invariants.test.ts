import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-OVERLAY-1/2/3 · Etkileşim yüzeyi değişmezleri (kalıcı bekçi).
 *
 * Cetvel: `docs/standards/admin-design-standard.md` §4.
 *
 * 2026-08-15 denetiminde ölçülen ve bu testin GERİ GELMESİNİ engellediği kusurlar:
 *
 *  D11  `<Toaster/>` admin ağacında mount edilmemiş → 127 `toast.*` çağrısı ölü;
 *       geri bildirim `window.confirm`/`alert`'e kaçmış.
 *  D12  21 `window.confirm` + 7 `alert`. Native kutu stilsizdir, i18n taşımaz ve
 *       mobilde "bu site tekrar sormasın" ile KALICI olarak susturulabilir →
 *       `confirm` `false` döner, silme sessizce iptal olur, kullanıcı hiçbir şey görmez.
 *  D13  ~26 bağımsız overlay implementasyonu, ortak sarmalayıcı yok.
 *  D15  Overlay katmanında ham `z-*` (tarih popover'ı `z-toast` ile modalların üstünde).
 *
 * Bu sınıfı tsc/lint/build görmez: `window.confirm` geçerli bir API'dir, tipi doğrudur
 * ve derlenir. Yalnız bu invariant yakalar.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Admin kapsamı — tam-literal kök yollar (glob yazım hatası testi sessizce boşaltır). */
const ADMIN_PREFIXES = ['/src/views/admin/', '/src/components/admin/', '/src/app/admin/'] as const

function isAdmin(path: string): boolean {
  return ADMIN_PREFIXES.some((prefix) => path.startsWith(prefix))
}

/** Yorum satırlarını at — bu testler kuralın KENDİSİNİ anlatan yorumları yakalamamalı. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')
}

const ADMIN_FILES = Object.entries(ALL)
  .filter(([path]) => isAdmin(path) && !path.includes('/__tests__/'))
  .map(([path, source]) => [path, stripComments(source)] as const)

describe('INV-ADMIN-OVERLAY-1 · native tarayıcı kutusu yasağı', () => {
  it('admin kapsamı boş değil (stale-guard)', () => {
    // Glob veya prefix yazım hatası bu testleri sessizce "hepsi temiz"e çevirirdi.
    expect(ADMIN_FILES.length).toBeGreaterThan(40)
  })

  it('window.confirm kullanılmıyor', () => {
    const offenders = ADMIN_FILES.filter(([, source]) => /window\.confirm\s*\(/.test(source)).map(
      ([path]) => path,
    )
    expect(
      offenders,
      'window.confirm YASAK → useConfirm() kullan. Native kutu mobilde kalıcı susturulabilir ' +
        've `false` dönerek SESSİZ veri kaybı üretir (cetvel §4.7).',
    ).toEqual([])
  })

  it('alert() ve prompt() kullanılmıyor', () => {
    const offenders = ADMIN_FILES.filter(([, source]) =>
      /(?<![.\w])(?:window\.)?(?:alert|prompt)\s*\(/.test(source),
    ).map(([path]) => path)
    expect(
      offenders,
      'alert()/prompt() YASAK → hata ve kritik mesaj INLINE gösterilir, sonuç özeti toast\'a ' +
        'gidebilir (cetvel §4.6: beş tasarım sistemi + APG "hata toast\'a konmaz" diyor).',
    ).toEqual([])
  })

  it('onay yüzeyi kabukta mount edilmiş', () => {
    const shell = ALL['/src/views/admin/AdminLayout.tsx']
    expect(shell, 'AdminLayout okunamadı').toBeTruthy()
    expect(
      shell,
      'ConfirmProvider admin kabuğunda mount edilmeli — yoksa useConfirm() çağıran her sayfa patlar',
    ).toMatch(/<ConfirmProvider>/)
  })
})

describe('INV-ADMIN-OVERLAY-2 · modal a11y sözleşmesi (APG)', () => {
  const dialogFiles = ADMIN_FILES.filter(([, source]) => /Dialog\.Content/.test(source))

  it('Dialog kullanan dosya var (stale-guard)', () => {
    expect(dialogFiles.length).toBeGreaterThan(5)
  })

  it.each(dialogFiles.map(([path]) => path))(
    '%s — Dialog.Overlay render ediliyor (body scroll lock oradadır)',
    (path) => {
      const source = ADMIN_FILES.find(([p]) => p === path)?.[1] ?? ''
      // Radix'te body scroll lock `<Dialog.Overlay>` içindedir (lokal dist doğrulandı).
      // "Backdrop istemiyorum" diye Overlay'i çıkaran uyarlama kilidi SESSİZCE kaybeder.
      expect(
        source,
        `${path}: Dialog.Content var ama Dialog.Overlay yok — body scroll lock kaybolur (cetvel §2.5)`,
      ).toMatch(/Dialog\.Overlay/)
    },
  )

  it.each(dialogFiles.map(([path]) => path))('%s — aria-modal elle veriliyor', (path) => {
    const source = ADMIN_FILES.find(([p]) => p === path)?.[1] ?? ''
    // Radix Dialog `aria-modal` BASMIYOR (dist grep'lendi) → elle eklenmeli.
    expect(
      source,
      `${path}: Radix aria-modal basmaz, Dialog.Content'e elle eklenmeli (cetvel §2.5, §4.8)`,
    ).toMatch(/aria-modal="true"/)
  })

  /**
   * SESSİZ-YEŞİL KAPATMA (2026-08-15, overlay göçünde ölçüldü).
   *
   * Yukarıdaki iki kural KAYNAK METNİNE bakar. Radix'te `<Dialog.Root modal={false}>`
   * iken `<Dialog.Overlay>` **null döner** — kaynakta duran Overlay hiç render
   * EDİLMEZ, gövde kaydırma kilidi kaybolur ve `aria-modal` anlamını yitirir.
   * Bu durumda üstteki iki test GEÇER ama sözleşme sağlanmaz: kapının tam da
   * yakalaması gereken şey ölçülemez hâle gelir.
   *
   * Karar: non-modal bir yüzey istiyorsan Radix Dialog KULLANMA — `AdminSidePanel`
   * kullan (§4.3 sözleşmesi: `role="region"`, perde yok, kilit yok, odak iadesi var).
   * Modal davranmayan bir yüzeyi modal işaretlemek APG'nin "severe negative
   * ramifications" dediği hatadır.
   */
  it('hiçbir Dialog `modal={false}` ile kurulmuyor (sessiz-yeşil kapısı)', () => {
    const offenders = ADMIN_FILES.filter(([, source]) => /modal=\{false\}/.test(source)).map(
      ([path]) => path,
    )
    expect(
      offenders.length,
      `Radix'te \`modal={false}\` iken <Dialog.Overlay> NULL döner: kaynakta durur ama\n` +
        `render EDİLMEZ → kaydırma kilidi sessizce kaybolur ve üstteki iki test yine GEÇER.\n` +
        `Non-modal yüzey için \`AdminSidePanel\` kullan (cetvel §4.3).\n  ${offenders.join('\n  ')}`,
    ).toBe(0)
  })
})

describe('INV-ADMIN-OVERLAY-3 · katman ölçeği (ratchet)', () => {
  /**
   * Ham `z-*` sayacı — hedef 0, ama tek dalgada erimez.
   * KURAL: yeni kod bu tavanı ARTIRAMAZ; göç dalgaları düşürür ve tavan da düşürülür.
   * (i18n INV-5 / stil INV-9 ratchet deseninin aynısı.)
   *
   * Neden önemli: `z-dropdown` (50) < `z-modal` (100) olduğu sürece Radix'in `body`'ye
   * portal ettiği bir dropdown, modalın ARKASINDA render olur. Token ölçeğinde
   * `z-popover` (110) bunu çözer — ham değerler çözmez.
   */
  // 57 → 49: envanter regresyon onarımında çekmece, CSV modalı ve InfoTooltip elle
  // yazılmış perdelerden Radix Dialog'a alındı; ham `z-40/z-50/z-10` yerine
  // `z-backdrop/z-modal/z-raised/z-popover` token'ları geldi (6 ham değer eridi).
  // Ratchet sıkılaşır: yeni kod bu tavanı ARTIRAMAZ.
  const RAW_Z_CEILING = 49

  it('ham z-* sayısı tavanı aşmıyor', () => {
    const pattern = /\bz-(?:0|10|20|30|40|50|60|\[[^\]]+\])\b/g
    let count = 0
    const perFile: Array<[string, number]> = []
    for (const [path, source] of ADMIN_FILES) {
      const hits = source.match(pattern)?.length ?? 0
      if (hits > 0) {
        count += hits
        perFile.push([path, hits])
      }
    }
    perFile.sort((a, b) => b[1] - a[1])
    expect(
      count,
      `Ham z-* sayısı ${count} (tavan ${RAW_Z_CEILING}). Yeni kod tavanı ARTIRAMAZ — ` +
        `token kullan (z-raised/z-sticky/z-backdrop/z-modal/z-popover/z-toast). ` +
        `En yoğun dosyalar: ${perFile.slice(0, 5).map(([p, n]) => `${p}(${n})`).join(', ')}`,
    ).toBeLessThanOrEqual(RAW_Z_CEILING)
  })

  it('tavan gereğinden yüksek değil (stale ratchet koruması)', () => {
    // Sayaç tavanın çok altına inerse tavan düşürülmeli; aksi halde ratchet gevşer
    // ve regresyona sessizce yer açar.
    const pattern = /\bz-(?:0|10|20|30|40|50|60|\[[^\]]+\])\b/g
    let count = 0
    for (const [, source] of ADMIN_FILES) count += source.match(pattern)?.length ?? 0
    expect(
      RAW_Z_CEILING - count,
      `Ham z-* sayısı ${count}, tavan ${RAW_Z_CEILING} — tavanı ${count}'e DÜŞÜR (ratchet sıkılaşır).`,
    ).toBeLessThanOrEqual(5)
  })
})
