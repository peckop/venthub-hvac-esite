import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-2 · Hesap yüzeyi conformance (kalıcı bekçi).
 *
 * 2026-08-16 T059 ölçümü: StickyHeader'ın favoriler butonu /account/favorites'e
 * gidiyordu ama o sayfa repoda YOKTU = garantili 404. Proje listeleri için servis +
 * context + modal TAMDI ama listeleme sayfası yoktu; üstelik ProjectProvider KENDİ
 * yerel context'ini yaratıyor, useProjectLists BAŞKA dosyadaki context'i okuyordu →
 * "projeye ekle" sessiz no-op'tu (kullanıcı ekledi sanır, hiçbir şey yazılmaz).
 * AccountOverviewPage full_address okuyordu, adres formu o alanı HİÇ yazmıyordu →
 * varsayılan adres kartı sonsuza dek boş. Hiçbirini tsc/lint/build görmedi.
 *
 * Zorlanan kurallar (cetvel: docs/standards/customer-account-standard.md):
 *   R1→B1: Routes.account'ta tanımlı HER yol için /src/app/[lang]/account altında
 *          page.tsx VAR olmalı (404 sınıfını kökten kapatır — yeni rota eklenirse
 *          sayfasız merge edilemez).
 *   R2→B2: Proje context'i TEK yerde yaratılır: ProjectProvider contexts/ProjectContext'ten
 *          import eder ve kendi createContext çağrısı İÇERMEZ; useProjectLists aynı
 *          dosyadan okur.
 *   R3→B3: PDP favori kalbi kalıcı kaynağa (useFavorites) bağlıdır — yerel
 *          useState(isWishlisted) yasak.
 *   R4→B4: AccountOverviewPage full_address'i YALIN render etmez; address_line
 *          fallback'i olmalı.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob(
  '/src/{views,contexts,hooks,app,utils,components}/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

/**
 * Yorumları sıyır — `https://` içindeki `//` KORUNUR (`[^:'"\`]` öneki bunu sağlar).
 * T077 bulgusu F4: bu dosya sıyırma YAPMIYORDU, yani üstteki niçin-yorumlarında geçen
 * `useFavorites`/`address_line` sözcükleri iddiaları tek başına tatmin ediyordu —
 * üretim kodu silinse bile YEŞİL kalırdı.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1')
}

function source(path: string): string {
  const src = SOURCES[path]
  if (src === undefined) {
    throw new Error(`Kaynak bulunamadı: ${path} — dosya taşındıysa bu testi de güncelle.`)
  }
  return stripComments(src)
}

/** `fnName(` ÇAĞRISININ argüman gövdesi; import satırı `fnName(` içermediği için doğal olarak atlanır. */
function callArgs(src: string, fnName: string): string | null {
  const idx = src.indexOf(`${fnName}(`)
  if (idx === -1) return null
  let depth = 0
  const start = idx + fnName.length
  for (let i = start; i < src.length; i++) {
    if (src[i] === '(') depth++
    else if (src[i] === ')') {
      depth--
      if (depth === 0) return src.slice(start + 1, i)
    }
  }
  return null
}

describe('INV-AUTH-2 · hesap yüzeyi', () => {
  it("R1: Routes.account'taki her yolun /[lang]/account altında sayfası var", () => {
    const routesSrc = source('/src/utils/routes.ts')
    // account bloğunu izole et (bir sonraki üst-düzey yorum/bölüme kadar)
    const accountBlock = routesSrc.slice(
      routesSrc.indexOf('account: {'),
      routesSrc.indexOf('admin: {'),
    )
    const paths = [...accountBlock.matchAll(/'(\/account[^'?]*)[?']/g)].map(m => m[1])
    expect(paths.length, 'Routes.account içinde hiç yol bulunamadı — regex mi bozuldu?').toBeGreaterThan(5)

    const missing = paths.filter(p => {
      const pagePath = p === '/account'
        ? '/src/app/[lang]/account/page.tsx'
        : `/src/app/[lang]${p}/page.tsx`
      return SOURCES[pagePath] === undefined
    })
    expect(missing, `Rotası olup SAYFASI olmayan yollar (garantili 404): ${missing.join(', ')}`).toEqual([])
  })

  it('R2: proje context SSOT — provider kendi createContext çağrısını içermez, tek kaynaktan okur', () => {
    const provider = source('/src/contexts/ProjectProvider.tsx')
    const hook = source('/src/hooks/useProjectLists.ts')
    expect(provider).not.toMatch(/createContext\s*[<(]/)
    expect(provider).toMatch(/import\s*\{[^}]*ProjectContext[^}]*\}\s*from\s*'\.\/ProjectContext'/)
    expect(hook).toMatch(/from\s*'\.\.\/contexts\/ProjectContext'/)
  })

  it('R3: PDP favori kalbi useFavorites ile kalıcı — yerel wishlist state yasak', () => {
    const pdp = source('/src/app/_components/ProductDetailPageView.tsx')
    // T077/F3: `toContain('useFavorites')` IMPORT satırıyla tatmin olurdu — kanca sökülse
    // bile yeşil kalırdı. Onun yerine ÇAĞRI + kancanın döndürdüğü okuyucunun KULLANIMI
    // birlikte ölçülür (üçü aynı anda bozulmadan kalp kalıcı olamaz).
    expect(pdp, 'useFavorites kancası import edilmiyor').toMatch(/from\s*'[^']*hooks\/useFavorites'/)
    expect(
      callArgs(pdp, 'useFavorites'),
      'useFavorites() ÇAĞRISI yok — import tek başına kapıyı geçmez',
    ).not.toBeNull()
    expect(
      pdp,
      'kalbin durumu isFavorite(...) ile kalıcı kaynaktan türetilmiyor',
    ).toMatch(/isFavorite\(\s*\w/)
    expect(
      pdp,
      'kalp tıklaması toggleFavorite(...) çağırmıyor — yazma yolu kopuk',
    ).toMatch(/toggleFavorite\(\s*\w/)
    expect(pdp).not.toMatch(/useState[^)]*isWishlisted|setIsWishlisted/)
  })

  it('R4: AccountOverviewPage full_address yalın render edilmez (address_line fallback şart)', () => {
    const overview = source('/src/views/account/AccountOverviewPage.tsx')
    // Yalın kullanım deseni: {x.full_address} doğrudan JSX içinde
    expect(overview).not.toMatch(/\{\s*\w+\.full_address\s*\}/)

    // T077/F1: `toContain('address_line')` rename-körüydü — o sözcük dosyada BAŞKA
    // yerlerde de geçer (tip alanı, form state), fallback silinse bile yeşil kalırdı.
    // Ölçülen şey artık fallback İFADESİNİN kendisi ve kartın onu kullanması.
    const fnIdx = overview.indexOf('const formatAddress')
    expect(
      fnIdx,
      'formatAddress yardımcısı yok — adres kartı ham alanı render ediyor olabilir (T059 kusuru)',
    ).toBeGreaterThan(-1)
    const fnBody = overview.slice(fnIdx, fnIdx + 300)
    expect(
      fnBody,
      'formatAddress içinde full_address için fallback OPERATÖRÜ (||) yok',
    ).toMatch(/full_address\s*\|\|/)
    expect(
      fnBody,
      'fallback address_line üzerinden kurulmuyor — adres formu full_address YAZMIYOR',
    ).toMatch(/address_line/)
    expect(
      overview,
      'adres kartı formatAddress(...) ile render edilmiyor — yardımcı ölü kod',
    ).toMatch(/\{\s*formatAddress\(\s*\w/)
  })

  it('R5: StickyHeader favoriler hedefi Routes SSOT üzerinden ve sayfası mevcut', () => {
    const header = source('/src/components/StickyHeader.tsx')
    expect(header).toContain('Routes.account.favorites()')
    expect(SOURCES['/src/app/[lang]/account/favorites/page.tsx']).toBeDefined()
  })

  /* ---- dedektör sağlığı: araçların KÖR olmadığı sentetik girdiyle kanıtlanır ---- */

  it('R6: yorum sıyırıcı GERÇEKTEN sıyırıyor ve URL\'leri YEMİYOR', () => {
    // Sıyırma çalışmazsa R3/R4 yorumdaki sözcüklerle tatmin olur (T077/F4 sınıfı).
    expect(stripComments('// useFavorites\nconst a = 1')).not.toContain('useFavorites')
    expect(stripComments('/* address_line */ const b = 2')).not.toContain('address_line')
    // Ters kusur da ölçülür: `https://` içindeki `//` yorum sanılırsa dedektör körleşir
    // (CRLF/URL tuzağı — aynı hata csp testlerinde canlı yaşandı).
    expect(stripComments("const u = 'https://x.dev/a' // not")).toContain('https://x.dev/a')
  })

  it('R7: callArgs IMPORT satırıyla tatmin OLMUYOR (yanlış-pozitif koruması)', () => {
    // İddianın kendisi sabotajla sınanır: sadece import varsa null dönmeli.
    expect(callArgs("import { useFavorites } from './h'\n", 'useFavorites')).toBeNull()
    // Gerçek çağrıda argüman gövdesi (boş da olsa) dönmeli — dengeli parantez.
    expect(callArgs('const { isFavorite } = useFavorites()\n', 'useFavorites')).toBe('')
    expect(callArgs('toggleFavorite(p.id, { x: (1) })', 'toggleFavorite')).toBe('p.id, { x: (1) }')
  })
})
