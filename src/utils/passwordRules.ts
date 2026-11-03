/**
 * Parola kuralları: TEK KAYNAK (kayıt, parola sıfırlama, hesap güvenliği sayfaları).
 *
 * Prod Supabase Auth paneliyle eşit olmalıdır (OPS-212, 3 Kasım 2026):
 * minimum 8 karakter + password_requirements = lower_upper_letters_digits_symbols.
 * Aynı değerler supabase/config.toml [auth] bölümünde durur; biri değişirse hepsi değişir
 * (bekçi: src/__tests__/conformance/auth-password-policy.test.ts).
 *
 * Karakter kümeleri sunucuyla BİREBİR aynıdır (ALT-140). GoTrue her kümeyi strings.ContainsAny
 * ile arar (supabase/auth internal/api/password.go); küme tanımı Supabase CLI
 * apps/cli/src/command-internal/password-requirements.ts içindeki
 * lower_upper_letters_digits_symbols değeridir: a-z, A-Z, 0-9 ve aşağıdaki ASCII semboller.
 * Boşluk, ç ş ğ ü ö ı gibi harfler ve diğer Unicode karakterler HİÇBİR kümede yoktur
 * (Türkçe harf küçük/büyük/özel sayılmaz); eski /[^A-Za-z0-9]/ bunları özel sayıp
 * istemcide geçirir, sunucuda reddedilirdi.
 */

/** Supabase'in kabul ettiği semboller; kaynak: Supabase Auth belgesi ve CLI eşlemesi (üstteki not). */
export const PASSWORD_SYMBOLS = '!@#$%^&*()_+-=[]{};\'\\:"|<>?,./`~'

export const PASSWORD_MIN_LENGTH = 8

export type PasswordRuleKey = 'length' | 'lower' | 'upper' | 'digit' | 'special'

export const PASSWORD_RULES: ReadonlyArray<{ key: PasswordRuleKey; test: (p: string) => boolean }> = [
  { key: 'length', test: p => p.length >= PASSWORD_MIN_LENGTH },
  { key: 'lower', test: p => /[a-z]/.test(p) },
  { key: 'upper', test: p => /[A-Z]/.test(p) },
  { key: 'digit', test: p => /[0-9]/.test(p) },
  { key: 'special', test: p => [...p].some(c => PASSWORD_SYMBOLS.includes(c)) },
]

export function countPassedPasswordRules(password: string): number {
  return PASSWORD_RULES.filter(r => r.test(password)).length
}

export function passwordMeetsAllRules(password: string): boolean {
  return countPassedPasswordRules(password) === PASSWORD_RULES.length
}

/** Güç çubuğu seviyesi 0..4 (4 çubuk); yalnız tüm kurallar geçince 4. */
export function passwordStrengthLevel(password: string): number {
  const passed = countPassedPasswordRules(password)
  if (passed === PASSWORD_RULES.length) return 4
  return Math.ceil((passed * 3) / PASSWORD_RULES.length)
}
