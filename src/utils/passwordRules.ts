/**
 * Parola kuralları: TEK KAYNAK (kayıt, parola sıfırlama, hesap güvenliği sayfaları).
 *
 * Prod Supabase Auth paneliyle eşit olmalıdır (OPS-212, 3 Kasım 2026):
 * minimum 8 karakter + password_requirements = lower_upper_letters_digits_symbols.
 * Aynı değerler supabase/config.toml [auth] bölümünde durur; biri değişirse hepsi değişir
 * (bekçi: src/__tests__/conformance/auth-password-policy.test.ts).
 */

export const PASSWORD_MIN_LENGTH = 8

export type PasswordRuleKey = 'length' | 'lower' | 'upper' | 'digit' | 'special'

export const PASSWORD_RULES: ReadonlyArray<{ key: PasswordRuleKey; test: (p: string) => boolean }> = [
  { key: 'length', test: p => p.length >= PASSWORD_MIN_LENGTH },
  { key: 'lower', test: p => /[a-z]/.test(p) },
  { key: 'upper', test: p => /[A-Z]/.test(p) },
  { key: 'digit', test: p => /[0-9]/.test(p) },
  { key: 'special', test: p => /[^A-Za-z0-9]/.test(p) },
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
