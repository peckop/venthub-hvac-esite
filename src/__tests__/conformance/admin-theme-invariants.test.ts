import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-THEME-1..5 · Admin görsel katmanı değişmezleri (kalıcı bekçi).
 *
 * Cetvel: `docs/standards/admin-design-standard.md` §3 (§3.2 tipografi · §3.3 yüzey/gölge · §3.4 renk · §3.8 tema · §3.9 odak).
 *
 * NİÇİN VAR — 2026-08-15 Faz 3 ölçümü:
 *
 *  Admin kromunun TAMAMI sabit-koyu Tailwind sınıflarıyla yazılmıştı:
 *  951 ham `slate-*`, 475 `font-black`, 539 `uppercase`, 240 `tracking-widest`,
 *  18 adet Y-kayması sıfır olan `shadow-[0_0_40px…]` glow.
 *
 *  Bunların hiçbiri DERLEME HATASI DEĞİLDİR. `text-white` geçerli bir sınıftır,
 *  tsc görmez, lint görmez, test görmez, build geçer. Ama açık temada beyaz
 *  zeminde beyaz yazı üretir — yani hata KULLANICIDA ortaya çıkar, kapıda değil.
 *  Bu yüzden kural ancak statik taramayla korunabilir.
 *
 *  Kapı KANITLANDI: her blok bilerek bozularak KIRMIZI görüldü (proje doktrini —
 *  geçen bir test çalıştığını kanıtlamaz).
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

/**
 * CSS AYRI GLOB — `index.css` yukarıdaki `*.{ts,tsx}` desenine GİRMEZ.
 * İlk yazımda tek glob kullanılmıştı: `ALL['/src/index.css']` daima `undefined`
 * dönüyor, `?? ''` ile boş stringe düşüyor ve tema-değişkeni kontrolleri
 * "dosyada bulamadım" diye değil, "dosyayı hiç okumadım" diye kırılıyordu.
 * Stale-guard bunu yakaladığı için sessiz-yeşile dönüşmedi — kapının kapıyı
 * koruması tam da bu.
 */
const CSS_FILES: Record<string, string> = import.meta.glob('/src/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Tam-literal kök yollar — glob/prefix yazım hatası testi sessizce boşaltır. */
const ADMIN_PREFIXES = ['/src/views/admin/', '/src/components/admin/', '/src/app/admin/'] as const

/**
 * MUAF DOSYALAR — muafiyet ADLA verilir, desenle değil (proje doktrini).
 * `adminUi.ts` bilerek kapsam dışı: semantik token'ların ve izinli `uppercase`
 * kullanımının TANIMLANDIĞI yer orasıdır; kuralı ihlal etmez, kuralı KURAR.
 */
const EXEMPT = new Set<string>([
  '/src/components/admin/shell/themeCookie.ts',
])

/**
 * TİPOGRAFİ muafiyeti — yalnız `uppercase`/`tracking` kontrolleri için.
 * `InventoryQrLabel` yazıcıya gönderilen etiketin GERÇEK CSS'ini bir string
 * içinde üretiyor (`text-transform: uppercase`). Bu bir Tailwind sınıfı değil;
 * ayrı bir belgeye, ayrı bir ortama (yazıcı) yazılıyor ve admin temasıyla hiç
 * ilgisi yok. Muafiyet ADLA verilir, desenle değil.
 */
const TYPOGRAPHY_EXEMPT = new Set<string>([
  '/src/components/admin/InventoryQrLabel.tsx',
])

/**
 * RENK muafiyeti — yalnız sabit-beyaz kontrolü için.
 * `CategoryBuilderView`'daki cihaz çerçevesi admin kromu DEĞİL: içinde ziyaretçinin
 * göreceği VİTRİN içeriği render ediliyor. Önizleme tuvalinin zemini admin temasına
 * bağlanırsa önizleme neyi önizlediğini yansıtmaz. (Aynı gerekçe QR etiketinde.)
 */
const SURFACE_EXEMPT = new Set<string>([
  '/src/views/admin/CategoryBuilderView.tsx',
])

function isAdmin(path: string): boolean {
  return ADMIN_PREFIXES.some((prefix) => path.startsWith(prefix)) && !EXEMPT.has(path)
}

/** Yorumları at — kuralın KENDİSİNİ anlatan yorumlar bulgu sayılmamalı. */
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

function findAll(
  pattern: RegExp,
  skip: ReadonlySet<string> = new Set(),
): Array<{ path: string; match: string }> {
  const found: Array<{ path: string; match: string }> = []
  for (const [path, source] of ADMIN_FILES) {
    if (skip.has(path)) continue
    for (const m of source.matchAll(pattern)) {
      found.push({ path, match: m[0] })
    }
  }
  return found
}

function report(found: Array<{ path: string; match: string }>, limit = 12): string {
  const byFile = new Map<string, string[]>()
  for (const f of found) {
    const list = byFile.get(f.path) ?? []
    list.push(f.match)
    byFile.set(f.path, list)
  }
  return [...byFile.entries()]
    .slice(0, limit)
    .map(([path, matches]) => `  ${path} → ${[...new Set(matches)].join(', ')}`)
    .join('\n')
}

describe('INV-ADMIN-THEME · kapsam', () => {
  it('admin dosya kümesi boş değil (stale-guard)', () => {
    // Glob ya da prefix yazım hatası bu dosyadaki HER testi "hepsi temiz"e çevirirdi.
    expect(ADMIN_FILES.length).toBeGreaterThan(40)
  })
})

describe('INV-ADMIN-THEME-1 · ham renk paleti yasağı', () => {
  /**
   * Ham Tailwind renk skalası admin yüzeyinde YASAK: bu sınıflar sabittir,
   * `[data-admin-theme]` altındaki değişkenleri okumaz, temayla DÖNMEZ.
   */
  const RAW_PALETTE =
    /\b(?:bg|text|border|ring|divide|placeholder|outline|decoration)-(?:slate|gray|zinc|neutral|stone|cyan|sky|rose|red|amber|emerald|green|teal|violet|purple|fuchsia|pink|orange|yellow|blue|indigo)-\d{2,3}(?:\/\d{1,3})?\b/g

  it('ham renk skalası kullanılmıyor', () => {
    const found = findAll(RAW_PALETTE)
    expect(
      found.length,
      `Ham renk skalası temayla dönmez → açık temada okunmaz metin.\n` +
        `Yerine admin semantik token'larını kullan (bg-admin-surface, text-admin-fg,\n` +
        `text-admin-fg-muted, border-admin-border, text-admin-danger …).\n` +
        `Cetvel §3.4 · §3.8.3.\n${report(found)}`,
    ).toBe(0)
  })

  it('`text-white` / `bg-white/N` gibi sabit beyazlar kullanılmıyor', () => {
    const found = findAll(/\b(?:text|bg|border|ring|divide)-white(?:\/\d{1,3})?\b/g, SURFACE_EXEMPT)
    expect(
      found.length,
      `Sabit beyaz açık temada zeminle aynı renge gelir ve İÇERİK KAYBOLUR.\n` +
        `Renkli zemin üstündeki metin için \`text-admin-*-fg\` kullan.\n` +
        `Cetvel §3.4 · §3.8.3.\n${report(found)}`,
    ).toBe(0)
  })

  it('`glass` / `glass-strong` yardımcı sınıfları admin yüzeyinde kullanılmıyor', () => {
    const found = findAll(/\bglass(?:-strong|-md|-effect)?\b/g)
    expect(
      found.length,
      `Cam efekti yarı saydam KOYU bir katmandır; açık temada okunmaz.\n` +
        `Ayrıca her kart ayrı bir kompozisyon katmanı doğurur (uzun listede kaydırma yavaşlar).\n` +
        `Yerine \`bg-admin-surface\`. Cetvel §3.4 · §3.8.3.\n${report(found)}`,
    ).toBe(0)
  })
})

describe('INV-ADMIN-THEME-2 · tipografi', () => {
  it('`font-black` kullanılmıyor', () => {
    const found = findAll(/\bfont-black\b/g)
    expect(
      found.length,
      `Her şey en kalın ağırlıktaysa hiyerarşi YOKTUR. Başlık \`font-semibold\`,\n` +
        `gövde varsayılan. Cetvel §3.2.\n${report(found)}`,
    ).toBe(0)
  })

  it('`uppercase` bileşen dosyalarında kullanılmıyor', () => {
    const found = findAll(/\buppercase\b/g, TYPOGRAPHY_EXEMPT)
    expect(
      found.length,
      `Büyük harf okuma hızını düşürür ve TR'de "İ/ı" sorunları üretir.\n` +
        `İZİNLİ TEK YER: \`src/utils/adminUi.ts\` içindeki tablo başlığı ve etiket\n` +
        `sabitleri (ölçülü \`tracking-wide\` ile). Cetvel §3.2.\n${report(found)}`,
    ).toBe(0)
  })

  it('aşırı harf aralığı kullanılmıyor', () => {
    const found = findAll(
      /\btracking-(?:widest|wider|hvac-(?:normal|relaxed|loose|wide|snug|2[0-9]))\b/g,
      TYPOGRAPHY_EXEMPT,
    )
    expect(
      found.length,
      `0.2em+ harf aralığı kelimeyi harf dizisine çevirir; gövde metninde okunabilirliği düşürür.\n` +
        `Cetvel §3.2.\n${report(found)}`,
    ).toBe(0)
  })
})

describe('INV-ADMIN-THEME-3 · yükseklik ve gölge', () => {
  it('Y-kayması sıfır olan gölge (glow) kullanılmıyor', () => {
    const found = findAll(/\bshadow-\[0_0_[^\]]*\]/g)
    expect(
      found.length,
      `\`shadow-[0_0_…]\` gölge değil GLOW'dur: ışık kaynağı yoktur ve dört resmi\n` +
        `token setinin (MD3, Tailwind, Radix, Polaris) hiçbirinde yer almaz.\n` +
        `Açık zeminde kirli bir hale bırakır. \`shadow-admin-{sm,md,lg,overlay}\` kullan.\n` +
        `Cetvel §3.3.\n${report(found)}`,
    ).toBe(0)
  })

  it('`shadow-glow-*` kullanılmıyor', () => {
    const found = findAll(/\bshadow-(?:glow-(?:sm|md|lg)|hvac-3d-glow)\b/g)
    expect(found.length, `Marka glow'u admin kromunda kullanılmaz. Cetvel §3.3.\n${report(found)}`).toBe(0)
  })
})

describe('INV-ADMIN-THEME-4 · odak görünürlüğü', () => {
  /**
   * `focus:` fare tıklamasında da halka çizer; kullanıcılar bunu "bozuk" olarak
   * algılar ve geliştirici genelde `outline-none` ekleyip KLAVYE ODAĞINI DA
   * öldürür (WCAG 2.4.7 ihlali). `focus-visible:` bu tuzağı yapısal olarak kapatır.
   */
  it('`focus:` yerine `focus-visible:` kullanılıyor', () => {
    const found = findAll(/\bfocus:(?!within)[a-z[]/g)
    expect(
      found.length,
      `\`focus:\` fare tıklamasında da halka çizer → geliştirici \`outline-none\` ile\n` +
        `bastırır ve klavye odağı da kaybolur. \`focus-visible:\` kullan. Cetvel §3.9.\n` +
        `${report(found)}`,
    ).toBe(0)
  })
})

describe('INV-ADMIN-THEME-5 · tema düzeneği yerinde', () => {
  const layout = ALL['/src/views/admin/AdminLayout.tsx'] ?? ''
  const serverLayout = ALL['/src/app/admin/layout.tsx'] ?? ''
  /*
    CSS YORUMLARI ÖNCE AYIKLANIR. İlk yazımda ayıklanmıyordu ve blok ayrıştırması
    `[data-admin-theme]` ifadesinin ilk geçtiği yeri — yani kuralı ANLATAN yorumu —
    blok sanıyordu; token sayısı 3 çıkıyordu. Testin kendi kaynağını yanlış okuması,
    ölçtüğünü sandığı şeyi ölçmemesidir.
  */
  const css = (CSS_FILES['/src/index.css'] ?? '').replace(/\/\*[\s\S]*?\*\//g, '')

  it('kaynak dosyalar okunabildi (stale-guard)', () => {
    expect(layout.length).toBeGreaterThan(500)
    expect(serverLayout.length).toBeGreaterThan(200)
    expect(css.length).toBeGreaterThan(500)
  })

  it('kabuk kökü `data-admin-theme` basıyor', () => {
    // Öznitelik düşerse admin token'larının HİÇBİRİ tanımlı olmaz ve panel
    // tarayıcı varsayılan renkleriyle çizilir — sessiz ve tam bir görsel çöküş.
    expect(layout).toContain('data-admin-theme')
  })

  it('tema tercihi SUNUCUDA okunuyor (FOUC bekçisi)', () => {
    // Sunucu okuması düşerse koyu temayı seçen kullanıcı her yüklemede beyaz
    // sıçrama görür; çerez yazılır ama hiç okunmadığı için kalıcılık "sessizce"
    // çalışmaz — aynı tuzağa sol menü tercihinde de düşülmüştü.
    expect(serverLayout).toContain('parseAdminTheme')
    expect(serverLayout).toContain('defaultThemeResolved')
  })

  it('semantik token değişkenleri her iki temada da tanımlı', () => {
    expect(css).toContain('[data-admin-theme]')
    expect(css).toContain("[data-admin-theme='dark']")

    // Açıkta tanımlanıp koyuda unutulan bir değişken, koyu temada AÇIK değeri
    // miras alır ve tek bir yüzey beyaz kalır. Her token iki blokta da olmalı.
    const lightBlock = css.split('[data-admin-theme]')[1]?.split('}')[0] ?? ''
    const darkBlock = css.split("[data-admin-theme='dark']")[1]?.split('}')[0] ?? ''
    const names = [...lightBlock.matchAll(/--admin-[a-z0-9-]+/g)].map((m) => m[0])

    expect(names.length).toBeGreaterThan(15)
    const missing = names.filter((n) => !darkBlock.includes(n))
    expect(
      missing.length,
      `Koyu temada tanımsız token açık değeri miras alır → tek yüzey beyaz kalır: ${missing.join(', ')}`,
    ).toBe(0)
  })
})
