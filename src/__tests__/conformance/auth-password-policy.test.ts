import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  countPassedPasswordRules,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  passwordMeetsAllRules,
  passwordStrengthLevel,
} from '../../utils/passwordRules'

/**
 * INV-AUTH-PWPOLICY-1 — parola kuralı kod = prod (ALT-139, OPS-212, 3 Kasım 2026).
 *
 * Prod Supabase Auth paneli: minimum 8 karakter + lower_upper_letters_digits_symbols.
 * İstemci kuralı bundan gevşek olursa kullanıcı istemciyi geçer, sunucu reddeder.
 * Bu test (1) config.toml'daki iki anahtarı okur, (2) istemci kuralının sunucu
 * kuralının her bileşenini istediğini ölçer, (3) üç sayfanın tek kaynağı kullandığını kilitler.
 */
const root = join(__dirname, '..', '..', '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

describe('INV-AUTH-PWPOLICY-1: supabase/config.toml [auth] = prod panel', () => {
  const toml = read('supabase/config.toml')
  const authBlock = toml.split(/^\[auth\]\s*$/m)[1]?.split(/^\[/m)[0] ?? ''

  it('[auth] bölümü vardır', () => {
    expect(authBlock.length).toBeGreaterThan(0)
  })

  it('minimum_password_length istemci sabitiyle eşit (8)', () => {
    const m = authBlock.match(/^minimum_password_length\s*=\s*(\d+)\s*$/m)
    expect(m?.[1]).toBe('8')
    expect(Number(m?.[1])).toBe(PASSWORD_MIN_LENGTH)
  })

  it('password_requirements = lower_upper_letters_digits_symbols', () => {
    const m = authBlock.match(/^password_requirements\s*=\s*"([^"]*)"\s*$/m)
    expect(m?.[1]).toBe('lower_upper_letters_digits_symbols')
  })
})

describe('INV-AUTH-PWPOLICY-1: istemci kuralı sunucu kuralını kapsar', () => {
  it('beş kural: uzunluk, küçük, büyük, rakam, özel', () => {
    expect(PASSWORD_RULES.map(r => r.key)).toEqual(['length', 'lower', 'upper', 'digit', 'special'])
  })

  it('küçük harfsiz parola reddedilir', () => {
    expect(passwordMeetsAllRules('ABCDEF1!')).toBe(false)
    expect(countPassedPasswordRules('ABCDEF1!')).toBe(4)
  })

  it('küçük harfli parola geçer', () => {
    expect(passwordMeetsAllRules('Abcdef1!')).toBe(true)
    expect(passwordStrengthLevel('Abcdef1!')).toBe(4)
  })

  it.each([
    ['Ab1!', false], // 8 karakterden kısa
    ['abcdefg1!', false], // büyük harf yok
    ['Abcdefgh!', false], // rakam yok
    ['Abcdefg12', false], // özel yok
    ['Abcdefg1!', true],
  ])('%s -> %s', (pw, ok) => {
    expect(passwordMeetsAllRules(pw)).toBe(ok)
  })

  it('güç seviyesi yalnız tüm kurallar geçince 4', () => {
    expect(passwordStrengthLevel('ABCDEF1!')).toBeLessThan(4)
    expect(passwordStrengthLevel('')).toBe(0)
  })
})

describe('INV-AUTH-PWPOLICY-1: üç sayfa tek kaynağı kullanır', () => {
  it.each([
    'src/views/RegisterPage.tsx',
    'src/views/ResetPasswordPage.tsx',
    'src/views/account/AccountSecurityPage.tsx',
  ])('%s', file => {
    const src = read(file)
    expect(src).toContain('utils/passwordRules')
    expect(src).toContain('passwordMeetsAllRules')
    expect(src).not.toMatch(/passedRules\s*<\s*4/)
    expect(src).not.toMatch(/\/\[A-Z\]\/\.test/)
  })
})
