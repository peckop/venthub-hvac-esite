/**
 * INV-KANCA-DUZENLEME-ANI-LINT-1 — düzenlenen src/ dosyasına tek dosya ESLint koşar, error Claude'a döner
 * (ARC-214). Mantık: scripts/board/duzenleme-ani-lint.cjs · kanca: .claude/hooks/duzenleme-ani-lint.cjs
 *
 * ESLint'in kendisi sahte çalıştırıcıyla taklit edilir (gerçek ESLint tek dosyada ~6 sn; sabotaj ve kapsam kararları
 * ölçülüyor, ESLint'in doğruluğu değil). Gerçek ESLint ile uçtan uca ölçüm PR gövdesinde.
 * SABOTAJ: warning kopyası (severity 1) sessiz kalmalı; src dışı / node_modules / uzantı dışı koşmamalı.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK_GERCEK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK_GERCEK, 'scripts', 'board', 'duzenleme-ani-lint.cjs')
const KANCA = path.join(KOK_GERCEK, '.claude', 'hooks', 'duzenleme-ani-lint.cjs')
const SETTINGS = path.join(KOK_GERCEK, '.claude', 'settings.json')

interface Hata {
  satir: number
  sutun: number
  kural: string
  mesaj: string
}
interface Modul {
  uygunMu: (d: unknown, k: string) => boolean
  hatalariCikar: (j: string) => Hata[] | null
  metin: (d: string, h: Hata[]) => string
  lintle: (
    d: string,
    k: string,
    c?: (e: string, a: string[], k: string) => { status: number; stdout: string; error?: Error },
  ) => { durum: string; hatalar?: Hata[]; sebep?: string }
}
const m = gerek(MODUL) as Modul

let sahteKok = ''
beforeAll(() => {
  sahteKok = fs.mkdtempSync(path.join(os.tmpdir(), 'arc214-'))
  fs.mkdirSync(path.join(sahteKok, 'node_modules', 'eslint', 'bin'), { recursive: true })
  fs.writeFileSync(path.join(sahteKok, 'node_modules', 'eslint', 'bin', 'eslint.js'), '')
})
afterAll(() => {
  fs.rmSync(sahteKok, { recursive: true, force: true })
})

const jsonCikti = (mesajlar: Array<{ severity: number; line: number; column: number; ruleId: string | null; message: string }>) =>
  JSON.stringify([{ filePath: 'x', messages: mesajlar }])

describe('kapsam (uygunMu)', () => {
  const k = path.resolve('/depo')
  it('src altı .ts/.tsx/.js/.mjs/.cjs uygun', () => {
    for (const d of ['src/a.ts', 'src/b/c.tsx', 'src/x.js', 'src/y.mjs', 'src/z.cjs', 'src/Q.JSX']) {
      expect(m.uygunMu(path.join(k, d), k)).toBe(true)
    }
  })
  it('src dışı, belge, node_modules, depo dışı ve boş girdi uygun değil', () => {
    for (const d of ['docs/a.md', 'scripts/b.cjs', 'src/a.json', 'src/a.css', 'src/node_modules/x/i.ts', 'srcx/a.ts', '../baska/src/a.ts']) {
      expect(m.uygunMu(path.join(k, d), k)).toBe(false)
    }
    expect(m.uygunMu('', k)).toBe(false)
    expect(m.uygunMu(undefined, k)).toBe(false)
    expect(m.uygunMu(path.resolve('/baska/src/a.ts'), k)).toBe(false)
  })
})

describe('ESLint çıktısı', () => {
  it('yalnız error (severity 2) döner; SABOTAJ: warning (severity 1) sessiz', () => {
    const h = m.hatalariCikar(
      jsonCikti([
        { severity: 2, line: 3, column: 5, ruleId: 'tailwindcss/no-arbitrary-value', message: 'Arbitrary value' },
        { severity: 1, line: 9, column: 1, ruleId: 'no-console', message: 'uyarı' },
      ]),
    )
    expect(h).toEqual([{ satir: 3, sutun: 5, kural: 'tailwindcss/no-arbitrary-value', mesaj: 'Arbitrary value' }])
  })
  it('bozuk çıktı null; boş dizi hatasız', () => {
    expect(m.hatalariCikar('{bozuk')).toBeNull()
    expect(m.hatalariCikar('{"a":1}')).toBeNull()
    expect(m.hatalariCikar('[]')).toEqual([])
  })
  it('ayrıştırma hatası (ruleId null) da error olarak gelir', () => {
    const h = m.hatalariCikar(jsonCikti([{ severity: 2, line: 1, column: 1, ruleId: null, message: 'Parsing error' }]))
    expect(h?.[0]?.kural).toBe('ayrıştırma')
  })
  it('metin: hata sayısı, dosya ve tavan; hata yoksa boş', () => {
    const hatalar = Array.from({ length: 11 }, (_, i) => ({ satir: i + 1, sutun: 1, kural: 'r', mesaj: 'm' }))
    const t = m.metin('src/a.ts', hatalar)
    expect(t).toContain('src/a.ts — 11 hata')
    expect(t).toContain('+3 hata daha')
    expect(m.metin('src/a.ts', [])).toBe('')
  })
})

describe('lintle (sahte çalıştırıcı)', () => {
  const dosya = 'src/a.ts'
  it('hata varsa durum "hata"; çalıştırıcıya --no-warn-ignored, --cache ve JSON verilir, --fix VERİLMEZ', () => {
    let gorulen: string[] = []
    const r = m.lintle(dosya, sahteKok, (_e, a) => {
      gorulen = a
      return { status: 1, stdout: jsonCikti([{ severity: 2, line: 1, column: 1, ruleId: 'x', message: 'y' }]) }
    })
    expect(r.durum).toBe('hata')
    expect(gorulen).toContain('--no-warn-ignored')
    expect(gorulen).toContain('--cache')
    expect(gorulen).toContain('json')
    expect(gorulen).not.toContain('--fix')
  })
  it('temiz çıktı "temiz"', () => {
    expect(m.lintle(dosya, sahteKok, () => ({ status: 0, stdout: '[]' })).durum).toBe('temiz')
  })
  it('çalıştırıcı hatası, çözülemeyen çıktı ve kurulu olmayan eslint "olculemedi" (hata değil)', () => {
    expect(m.lintle(dosya, sahteKok, () => ({ status: 1, stdout: '', error: new Error('ENOENT') })).durum).toBe('olculemedi')
    expect(m.lintle(dosya, sahteKok, () => ({ status: 2, stdout: 'bozuk' })).durum).toBe('olculemedi')
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'arc214-bos-'))
    try {
      expect(m.lintle(dosya, bos, () => ({ status: 0, stdout: '[]' })).durum).toBe('olculemedi')
    } finally {
      fs.rmSync(bos, { recursive: true, force: true })
    }
  })
})

describe('kanca (süreç)', () => {
  const calistir = (girdi: string) =>
    spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', timeout: 30000, env: { ...process.env, CLAUDE_PROJECT_DIR: sahteKok } })

  it('src dışı dosya, bozuk girdi ve boş girdi: çıkış 0, çıktı yok', () => {
    for (const g of [
      JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: path.join(sahteKok, 'docs', 'a.md') } }),
      JSON.stringify({ tool_name: 'Edit', tool_input: {} }),
      '{bozuk',
      '',
    ]) {
      const r = calistir(g)
      expect(r.status).toBe(0)
      expect(r.stderr).toBe('')
    }
  })

  it('kurulu ESLint olmayan kökte src dosyası: sessiz geçer (ölçemedim hata değildir)', () => {
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'arc214-k-'))
    try {
      const r = spawnSync(process.execPath, [KANCA], {
        input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: path.join(bos, 'src', 'a.ts') } }),
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, CLAUDE_PROJECT_DIR: bos },
      })
      expect(r.status).toBe(0)
      expect(r.stderr).toBe('')
    } finally {
      fs.rmSync(bos, { recursive: true, force: true })
    }
  })
})

describe('settings.json kaydı', () => {
  it('PostToolUse Edit|Write|MultiEdit altında asyncRewake ile kayıtlı (düzenlemeyi bekletmez)', () => {
    const ayar = JSON.parse(fs.readFileSync(SETTINGS, 'utf8')) as {
      hooks: { PostToolUse: Array<{ matcher: string; hooks: Array<{ command: string; asyncRewake?: boolean; timeout?: number }> }> }
    }
    const kayit = ayar.hooks.PostToolUse.flatMap((g) => g.hooks.map((h) => ({ ...h, matcher: g.matcher }))).find((h) =>
      h.command.includes('duzenleme-ani-lint.cjs'),
    )
    expect(kayit).toBeDefined()
    expect(kayit?.matcher).toBe('Edit|Write|MultiEdit')
    expect(kayit?.asyncRewake).toBe(true)
    expect(kayit?.timeout).toBeGreaterThanOrEqual(30)
  })
})
