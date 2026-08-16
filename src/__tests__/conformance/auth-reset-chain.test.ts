import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-1 · Şifre-sıfırlama zinciri conformance (kalıcı bekçi).
 *
 * 2026-08-16 T056 ölçümü: resetPasswordForEmail redirectTo'suz çağrılıyordu, reset-password
 * rotası repoda YOKTU ve tek şifre-değiştirme ekranı mevcut şifreyi zorunlu tutuyordu.
 * Sonuç: şifresini unutan kullanıcı e-postadaki linke tıklar, giriş yapmış olur ama şifreyi
 * ASLA değiştiremez = kalıcı hesap kilidi. Ayrıca locale'siz /auth/callback dönüşü (OAuth +
 * redirectTo hedefi) middleware muafiyeti yüzünden 404'e düşüyordu. Bu kırıkların HİÇBİRİNİ
 * mevcut kapılar görmedi: tsc/lint sözdizimi temizdi, build rota eksikliğini hata saymaz,
 * test takımı akışı hiç sormuyordu. Yalnız bu invariant yakalar.
 *
 * Zorlanan kurallar (cetvel: docs/standards/auth-account-standard.md):
 *   R1→A1: resetPasswordForEmail ÇAĞRISI redirectTo içermeli ve hedef /auth/callback +
 *          next=reset-password olmalı (çağrı-bazlı; yorumlar sıyrılır — substring yeterli değil).
 *   R2→A4: /[lang]/auth/reset-password rotası VAR olmalı; view updateUser + HIBP çağırmalı.
 *   R3→A2: locale'siz /auth/callback için query-koruyan route handler VAR olmalı ve
 *          middleware'deki locale muafiyeti (auth/callback) YERİNDE olmalı.
 *   R4→A3: AuthCallbackPage ?next= ayrımını yapmalı ve reset-password'a yönlendirmeli;
 *          PKCE ?code= akışını işlemeli.
 *   R5→A5: LoginPage hem ?redirect= hem ?from= dönüş yolunu, ayrıca ?error= parametresini okumalı.
 *   R6→A6: ForgotPasswordPage kullanıcı varlığını sızdırmamalı ("User not found" dalı YASAK).
 *
 * Bilerek-boz kanıtı: AuthContext'teki redirectTo satırı silinip koşulduğunda R1 kırmızı
 * yanar (2026-08-16'da doğrulandı — PR açıklamasında çıktı var).
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
  '/src/{views,contexts,app,utils}/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

const MIDDLEWARE: Record<string, string> = import.meta.glob('/src/middleware.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Yorumları sıyır — string literalleri koruyarak (kabaca ama bu dosyalar için yeterli). */
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

/** `fnName(` çağrısının argüman gövdesini dengeli parantezle çıkar. */
function extractCallArgs(src: string, fnName: string): string | null {
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

describe('INV-AUTH-1 · şifre-sıfırlama zinciri', () => {
  // R1: redirectTo'suz resetPasswordForEmail = kullanıcı linke tıklar, giriş yapar ama
  // şifre ekranına asla varamaz. Çağrının KENDİSİ denetlenir; yorumdaki "redirectTo"
  // kelimesi kapıyı geçemez.
  it('R1: AuthContext.resetPasswordForEmail çağrısı redirectTo ile /auth/callback?next=reset-password hedefler', () => {
    const src = source('/src/contexts/AuthContext.tsx')
    const args = extractCallArgs(src, 'resetPasswordForEmail')
    expect(args, 'resetPasswordForEmail çağrısı bulunamadı').toBeTruthy()
    expect(args!).toContain('redirectTo')
    expect(args!).toContain('/auth/callback')
    expect(args!).toContain('next=reset-password')
  })

  it('R2a: /[lang]/auth/reset-password rotası mevcut', () => {
    expect(SOURCES['/src/app/[lang]/auth/reset-password/page.tsx']).toBeDefined()
  })

  it('R2b: ResetPasswordPage yeni şifreyi updateUser ile yazar ve HIBP kontrolü yapar', () => {
    const src = source('/src/views/ResetPasswordPage.tsx')
    const updateArgs = extractCallArgs(src, 'updateUser')
    expect(updateArgs, 'supabase.auth.updateUser çağrısı yok').toBeTruthy()
    expect(updateArgs!).toContain('password')
    expect(src).toContain('hibpPwnedCount')
    // Kurtarma ekranında MEVCUT şifre sorulamaz — kullanıcı onu bilmiyor (T056'nın kök sebebi).
    expect(src).not.toContain('signInWithPassword')
  })

  it('R3a: locale\'siz /auth/callback route handler var ve query\'yi koruyarak yönlendirir', () => {
    const src = source('/src/app/auth/callback/route.ts')
    expect(src).toContain('/auth/callback')
    // nextUrl.clone() query'yi taşır; pathname dışında search'e dokunulmamalı.
    expect(src).toContain('nextUrl.clone()')
    expect(src).not.toContain('searchParams.delete')
    expect(src).toMatch(/NextResponse\.redirect/)
  })

  it('R3b: middleware auth/callback locale muafiyetini koruyor', () => {
    const src = stripComments(Object.values(MIDDLEWARE)[0] ?? '')
    expect(src, 'middleware.ts okunamadı').toBeTruthy()
    expect(src).toMatch(/segments\[1\]\s*===\s*'callback'/)
  })

  it('R4: AuthCallbackPage ?next= ayrımı yapar, reset-password\'a yönlendirir ve ?code= akışını işler', () => {
    const src = source('/src/views/AuthCallbackPage.tsx')
    expect(src).toMatch(/get\(\s*'next'\s*\)/)
    expect(src).toContain('Routes.auth.resetPassword()')
    expect(src).toContain('exchangeCodeForSession')
    expect(src).toMatch(/has\(\s*'code'\s*\)/)
  })

  it('R5: LoginPage ?redirect= ve ?from= dönüş yollarını, ?error= parametresini okur', () => {
    const src = source('/src/views/LoginPage.tsx')
    expect(src).toMatch(/get\(\s*'redirect'\s*\)/)
    expect(src).toMatch(/get\(\s*'from'\s*\)/)
    expect(src).toMatch(/get\(\s*'error'\s*\)/)
  })

  it('R6: ForgotPasswordPage kullanıcı varlığını sızdırmaz (enumerasyon dalı yasak)', () => {
    const src = source('/src/views/ForgotPasswordPage.tsx')
    expect(src).not.toContain('User not found')
    expect(src).not.toContain('userNotFound')
  })
})
