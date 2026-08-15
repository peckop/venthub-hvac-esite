/**
 * Sol navigasyon durumunun çerez adı — istemci ve sunucu AYNI yerden okur.
 *
 * Neden çerez, localStorage değil? localStorage sunucuda okunamaz; RSC layout
 * başlangıç değerini bilemez ve SSR daima yanlış varsayılanı render eder, ilk
 * boyada menü zıplar. (shadcn/ui Sidebar da bu sebeple çerez kullanır.)
 *
 * Neden tenant-scoped? CLAUDE.md kural 12 — düz `path=/` çerezi kiracılar arası
 * sızar. Cetvel: docs/standards/admin-design-standard.md §2.4
 */
export function navCookieName(tenantId: string): string {
  // Çerez adı token'ı olmayan karakterleri temizle (RFC 6265 cookie-name).
  const safe = String(tenantId).replace(/[^A-Za-z0-9_-]/g, '')
  return `vh_admin_nav_${safe}`
}

/** Çerez değeri `'1'` ise nav ikon rayına daraltılmış demektir. */
export const NAV_COLLAPSED_VALUE = '1'
