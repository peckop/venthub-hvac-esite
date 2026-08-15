/**
 * ADMIN TEMA TERCİHİ — çerez sözleşmesi
 *
 * Neden çerez, localStorage değil: localStorage SUNUCUDA okunamaz. Tercih
 * sunucuda bilinmezse ilk boyama daima varsayılan temayla yapılır ve koyu
 * temayı seçmiş kullanıcı her sayfa yüklemesinde beyaz bir kare görür
 * (FOUC). Aynı gerekçeyle sol menü tercihi de çerezde — bkz. `navCookie.ts`.
 *
 * Çerez tenant-scoped (kural 12): düz `path=/` çerezi kiracılar arasında sızar.
 *
 * DEĞER BİÇİMİ `<tercih>:<çözülmüş>` — ör. `system:dark`.
 * İki parça ayrı ayrı gereklidir:
 *  - `tercih` kullanıcının seçtiği şey ('system' dahil) — arayüzde işaretli
 *    görünecek olan budur.
 *  - `çözülmüş` yalnız 'light' | 'dark'. Sunucu `prefers-color-scheme`i
 *    OKUYAMAZ; 'system' seçen kullanıcı için doğru temayı ancak istemcinin bir
 *    önceki ziyarette yazdığı bu değerden bilebilir. Böylece 'system' modu da
 *    ilk boyamada doğru gelir; yalnız HİÇ ziyaret edilmemiş tarayıcıda tek
 *    karelik açık kare kalır (varsayılan açık olduğu için bu zaten beklenen).
 *
 * Cetvel: docs/standards/admin-design-standard.md §3.8.2
 */

export type AdminThemePreference = 'light' | 'dark' | 'system'
export type AdminThemeResolved = 'light' | 'dark'

export const ADMIN_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 yıl

/** Recep kararı (2026-08-15): varsayılan AÇIK, koyu birinci sınıf seçenek. */
export const ADMIN_THEME_DEFAULT: AdminThemePreference = 'light'
export const ADMIN_THEME_RESOLVED_DEFAULT: AdminThemeResolved = 'light'

export function adminThemeCookieName(tenantId: string): string {
  return `vh_admin_theme_${tenantId}`
}

export function serializeAdminTheme(
  preference: AdminThemePreference,
  resolved: AdminThemeResolved,
): string {
  return `${preference}:${resolved}`
}

interface ParsedAdminTheme {
  preference: AdminThemePreference
  resolved: AdminThemeResolved
}

/**
 * Tanınmayan/bozuk değer sessizce varsayılana düşer — çerez kullanıcı
 * tarafından düzenlenebilir bir girdidir, güvenilmez kabul edilir.
 */
export function parseAdminTheme(raw: string | undefined): ParsedAdminTheme {
  const [rawPreference, rawResolved] = (raw ?? '').split(':')

  const preference: AdminThemePreference =
    rawPreference === 'light' || rawPreference === 'dark' || rawPreference === 'system'
      ? rawPreference
      : ADMIN_THEME_DEFAULT

  const resolvedFromCookie: AdminThemeResolved | null =
    rawResolved === 'light' || rawResolved === 'dark' ? rawResolved : null

  // Tercih açıkça light/dark ise çözülmüş değer ondan TÜRETİLİR; çerezdeki
  // çözülmüş parça yalnız 'system' için anlamlıdır.
  const resolved: AdminThemeResolved =
    preference === 'system'
      ? resolvedFromCookie ?? ADMIN_THEME_RESOLVED_DEFAULT
      : preference

  return { preference, resolved }
}
