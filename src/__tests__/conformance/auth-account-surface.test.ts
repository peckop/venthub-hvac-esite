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
 * Zorlanan kurallar (cetvel: docs/standards/auth-account-standard.md §B):
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

function source(path: string): string {
  const src = SOURCES[path]
  if (src === undefined) {
    throw new Error(`Kaynak bulunamadı: ${path} — dosya taşındıysa bu testi de güncelle.`)
  }
  return src
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
    expect(pdp).toContain('useFavorites')
    expect(pdp).not.toMatch(/useState[^)]*isWishlisted|setIsWishlisted/)
  })

  it('R4: AccountOverviewPage full_address yalın render edilmez (address_line fallback şart)', () => {
    const overview = source('/src/views/account/AccountOverviewPage.tsx')
    // Yalın kullanım deseni: {x.full_address} doğrudan JSX içinde
    expect(overview).not.toMatch(/\{\s*\w+\.full_address\s*\}/)
    expect(overview).toContain('address_line')
  })

  it('R5: StickyHeader favoriler hedefi Routes SSOT üzerinden ve sayfası mevcut', () => {
    const header = source('/src/components/StickyHeader.tsx')
    expect(header).toContain('Routes.account.favorites()')
    expect(SOURCES['/src/app/[lang]/account/favorites/page.tsx']).toBeDefined()
  })
})
