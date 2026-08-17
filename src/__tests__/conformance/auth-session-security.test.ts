import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-3 · Oturum güvenliği conformance (kalıcı bekçi).
 *
 * 2026-08-16 T060 ölçümü: clearClaimsCacheCookie'nin TEK çağıranı hiç kullanılmayan
 * /auth/signout route'uydu; header logout yalnız client signOut() çağırıyordu.
 * sb-claims-cache httpOnly olduğu için client JS onu SİLEMEZ → admin çıkıştan sonra
 * cache TTL'i (900 sn) boyunca /admin kapısından geçebiliyordu; resolveUserClaims
 * geçerli çerezde Supabase'e hiç sormaz. Hiçbir statik kapı görmedi: iki parça da
 * tek başına "doğru"ydu, kopukluk aradaki TELDEYDİ.
 *
 * Zorlanan kurallar (cetvel: docs/standards/auth-account-standard.md §A7-A9):
 *   R1→A7: AuthContext.signOut, sunucu tarafını /auth/signout POST ile çağırmalı
 *          (yorum sıyrılır — yorumdaki '/auth/signout' kapıyı geçemez).
 *   R2→A7: /auth/signout route'u clearClaimsCacheCookie çağırmalı.
 *   R3→A7: claims cache çerezi httpOnly kalmalı ve varsayılan TTL ≤ 900 sn olmalı
 *          (httpOnly gevşetilirse R1'in gerekçesi ortadan kalkmış GİBİ görünür ama
 *          bu kez çerez XSS'e açılır — iki yönlü kilit).
 *   R4→A8/A9: cetvelde rate-limit politikası ve CAPTCHA karar satırı YAŞAMALI
 *          (politika dashboard'a emanet; cetvelden silinirse emanet iz bırakmadan kaybolur).
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
  '/src/{contexts,utils,app}/**/*.{ts,tsx}',
  { query: '?raw', import: 'default', eager: true },
)

const STANDARDS: Record<string, string> = import.meta.glob(
  '/docs/standards/auth-account-standard.md',
  { query: '?raw', import: 'default', eager: true },
)

/** Yorumları sıyır — [^\n] CRLF'te de çalışır ('.' \r ile eşleşmez tuzağına düşme). */
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

describe('INV-AUTH-3 · oturum güvenliği', () => {
  it('R1: AuthContext.signOut sunucu /auth/signout ucunu POST ile çağırır', () => {
    const src = source('/src/contexts/AuthContext.tsx')
    expect(src).toMatch(/fetch\(\s*'\/auth\/signout'\s*,\s*\{\s*method:\s*'POST'/)
  })

  it('R2: /auth/signout route claims cache çerezini temizler', () => {
    const src = source('/src/app/auth/signout/route.ts')
    expect(src).toMatch(/clearClaimsCacheCookie\s*\(/)
  })

  it('R3: claims cache çerezi httpOnly ve varsayılan TTL ≤ 900 sn', () => {
    const src = source('/src/utils/router.ts')
    const setterStart = src.indexOf('function setClaimsCacheCookie')
    expect(setterStart, 'setClaimsCacheCookie bulunamadı').toBeGreaterThan(-1)
    const setterBody = src.slice(setterStart, src.indexOf('}', src.indexOf('cookies.set', setterStart)))
    expect(setterBody).toMatch(/httpOnly:\s*true/)
    const ttlMatch = src.match(/maxAgeSeconds:\s*number\s*=\s*(\d+)/)
    expect(ttlMatch, 'varsayılan TTL bulunamadı').toBeTruthy()
    expect(Number(ttlMatch![1])).toBeLessThanOrEqual(900)
  })

  it('R4: cetvelde rate-limit politikası ve CAPTCHA karar satırı yaşıyor', () => {
    const cetvel = Object.values(STANDARDS)[0] ?? ''
    expect(cetvel, 'auth-account-standard.md okunamadı').toBeTruthy()
    expect(cetvel).toContain('Rate limit')
    expect(cetvel).toContain('CAPTCHA')
    expect(cetvel).toMatch(/middleware.*geçmez|geçmez.*middleware/i)
  })
})
