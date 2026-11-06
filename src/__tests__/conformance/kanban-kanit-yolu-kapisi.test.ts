/**
 * INV-KANBAN-KANIT-YOLU-1 — Kanban'a mutlak/kök dışı yolla file_exists ya da file_matches kanıtı eklenemez (ARC-93).
 *
 * Kanca: .claude/hooks/kanban-kanit-yolu-kapisi.cjs · kural: .claude/hooks/kanban-kanit-yolu-kapisi.md
 * Kök sebep: @wrongstack/kanban resolveProjectPath mutlak yolu kök kontrolünden önce reddeder (1.0.26, 1.0.36, 1.0.37).
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kanban-kanit-yolu-kapisi.cjs')

interface Kapi {
  incele: (girdi: unknown) => string | null
  yolSorunu: (yol: string) => string | null
}
const k = gerek(KANCA) as Kapi

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const cagri = (girdi: Record<string, unknown>, tool = ARAC) => ({ tool_name: tool, tool_input: girdi })
const reddedilir = (girdi: Record<string, unknown>) => k.incele(cagri(girdi)) !== null

describe('INV-KANBAN-KANIT-YOLU-1', () => {
  it('file_exists: mutlak yollar reddedilir (Windows, POSIX, ters bölü, ev dizini, kök dışı)', () => {
    for (const yol of [['C:', 'Users', 'ornek', 'x.md'].join('/'), 'C:\\tmp\\x.md', 'c:/', '/etc/hosts', '\\\\sunucu\\paylasim', '~/.claude/x', '~', '../baska/x', 'a/../../x']) {
      expect(reddedilir({ action: 'add_check', checkType: 'file_exists', checkNotes: yol }), yol).toBe(true)
    }
  })

  it('file_exists: göreli yol ve kök içinde kalan ".." geçer', () => {
    for (const yol of ['docs/audits/x.md', 'tmp/kanit.txt', './docs/x.md', 'a/../docs/x.md', 'package.json']) {
      expect(reddedilir({ action: 'add_check', checkType: 'file_exists', checkNotes: yol }), yol).toBe(false)
    }
  })

  it('yol checkNotes yoksa checkDescription\'dan okunur', () => {
    expect(reddedilir({ action: 'add_check', checkType: 'file_exists', checkDescription: 'C:/tmp/x.md' })).toBe(true)
    expect(reddedilir({ action: 'add_check', checkType: 'file_exists', checkDescription: 'docs/x.md' })).toBe(false)
  })

  it('file_matches: JSON içindeki file alanı aynı kuralla ölçülür, bozuk JSON karışılmaz', () => {
    const js = (file: string) => JSON.stringify({ file, pattern: 'x', flags: '' })
    expect(reddedilir({ action: 'add_check', checkType: 'file_matches', checkNotes: js('C:/tmp/x.md') })).toBe(true)
    expect(reddedilir({ action: 'update_check', checkType: 'file_matches', checkNotes: js('../x.md') })).toBe(true)
    expect(reddedilir({ action: 'add_check', checkType: 'file_matches', checkNotes: js('docs/x.md') })).toBe(false)
    expect(reddedilir({ action: 'add_check', checkType: 'file_matches', checkNotes: '{bozuk' })).toBe(false)
  })

  it('başka kontrol tipi, başka eylem ve başka araç sessiz geçer', () => {
    expect(reddedilir({ action: 'add_check', checkType: 'command', checkNotes: 'gh api repos/x/y/pulls/1/merge' })).toBe(false)
    expect(reddedilir({ action: 'add_check', checkType: 'manual', checkNotes: 'C:/tmp/x.md' })).toBe(false)
    // JSON gövdesi file_matches gibi görünse de tip file_matches değilse karışılmaz.
    expect(reddedilir({ action: 'add_check', checkType: 'manual', checkNotes: JSON.stringify({ file: 'C:/tmp/x.md' }) })).toBe(false)
    expect(reddedilir({ action: 'add_check', checkType: 'metric', checkNotes: JSON.stringify({ file: '/etc/hosts' }) })).toBe(false)
    expect(reddedilir({ action: 'add_note', checkType: 'file_exists', checkNotes: 'C:/tmp/x.md' })).toBe(false)
    expect(k.incele(cagri({ action: 'add_check', checkType: 'file_exists', checkNotes: 'C:/x' }, 'Bash'))).toBeNull()
    expect(k.incele(null)).toBeNull()
  })

  it('ARC-255: "command" alanıyla gelen çağrı reddedilir (araç yok sayıp sessizce manual yapıyor)', () => {
    const komut = 'gh api repos/peckop/venthub-hvac-esite/pulls/2281/merge'
    expect(reddedilir({ action: 'add_check', checkDescription: 'PR birleşti', command: komut })).toBe(true)
    expect(reddedilir({ action: 'add_check', checkType: 'manual', checkDescription: 'x', command: komut })).toBe(true)
    // checkType command ama komut checkNotes'ta yok, yalnız command alanında: yine yok sayılır
    expect(reddedilir({ action: 'add_check', checkType: 'command', checkDescription: 'x', command: komut })).toBe(true)
    const m = k.incele(cagri({ action: 'add_check', checkDescription: 'x', command: komut })) ?? ''
    expect(m).toContain('checkType "command"')
    expect(m).toContain('checkNotes')
    expect(m).toContain(komut)
  })

  it('ARC-255: doğru çağrı (checkType command + checkNotes) ve boş command alanı geçer', () => {
    const komut = 'gh api repos/peckop/venthub-hvac-esite/pulls/2281/merge'
    expect(reddedilir({ action: 'add_check', checkType: 'command', checkNotes: komut })).toBe(false)
    expect(reddedilir({ action: 'add_check', checkType: 'command', checkNotes: komut, command: komut })).toBe(false)
    expect(reddedilir({ action: 'add_check', checkType: 'manual', checkNotes: 'kanıt notu', command: '' })).toBe(false)
    expect(reddedilir({ action: 'add_note', command: komut })).toBe(false)
  })

  it('ARC-261: file_matches deseni 64K kırpmanın ötesindeyse reddedilir, başta/yok/okunamaz ise geçer', () => {
    const dizin = mkdtempSync(path.join(tmpdir(), 'kirpma-'))
    const eski = process.env.CLAUDE_PROJECT_DIR
    process.env.CLAUDE_PROJECT_DIR = dizin
    try {
      const SINIR = 65536
      const dolgu = (n: number) => 'x'.repeat(n)
      writeFileSync(path.join(dizin, 'buyuk.md'), 'BASLIK-ILK\n' + dolgu(SINIR + 100) + '\nKUYRUK-SON\n')
      writeFileSync(path.join(dizin, 'sinirda.md'), dolgu(SINIR - 4) + 'SINIR') // "SINIR" 65532'de başlar, 65536'da kesilir
      writeFileSync(path.join(dizin, 'tam-sinir.md'), dolgu(SINIR - 5) + 'SINIR') // son harf 65536. karakter: içeride
      writeFileSync(path.join(dizin, 'kucuk.md'), 'KUYRUK-SON')
      const fm = (file: string, pattern: string) =>
        reddedilir({ action: 'add_check', checkType: 'file_matches', checkNotes: JSON.stringify({ file, pattern }) })
      expect(fm('buyuk.md', 'KUYRUK-SON')).toBe(true)
      expect(fm('buyuk.md', 'BASLIK-ILK')).toBe(false)
      expect(fm('buyuk.md', 'HIC-YOK')).toBe(false)
      expect(fm('sinirda.md', 'SINIR')).toBe(true)
      expect(fm('tam-sinir.md', 'SINIR')).toBe(false)
      expect(fm('kucuk.md', 'KUYRUK-SON')).toBe(false)
      expect(fm('yok.md', 'x')).toBe(false)
      expect(fm('buyuk.md', '(bozuk')).toBe(false)
      // flags: sunucu bayrakları kullanır (denetçi S3)
      const fb = (pattern: string, flags: string) =>
        reddedilir({ action: 'add_check', checkType: 'file_matches', checkNotes: JSON.stringify({ file: 'buyuk.md', pattern, flags }) })
      expect(fb('kuyruk-son', 'i')).toBe(true)
      expect(fb('kuyruk-son', '')).toBe(false)
      expect(fb('^KUYRUK-SON$', 'm')).toBe(true)
      // baştaki boşluklu yol sunucuda trim edilir (nit)
      expect(fm(' buyuk.md', 'KUYRUK-SON')).toBe(true)
      // ReDoS (denetçi S1): felaket desen kapıyı kilitlemez, karışılmaz
      writeFileSync(path.join(dizin, 'redos.md'), 'a'.repeat(30) + '!' + 'b'.repeat(SINIR + 100))
      const t0 = Date.now()
      expect(fm('redos.md', '^(a+)+$')).toBe(false)
      expect(fm('redos.md', '^(a|aa)+$')).toBe(false)
      expect(fm('buyuk.md', 'KUYRUK-SON' + '.?'.repeat(130))).toBe(false) // 256 karakter tavanı
      expect(Date.now() - t0).toBeLessThan(2000)
      // worktree: sunucu ana ağaçta ölçer (denetçi S2); ana ağaçta dosya yoksa worktree'dekine düşer
      const wt = path.join(dizin, '.claude', 'worktrees', 'w1')
      mkdirSync(wt, { recursive: true })
      process.env.CLAUDE_PROJECT_DIR = wt
      expect(fm('buyuk.md', 'KUYRUK-SON')).toBe(true)
      writeFileSync(path.join(wt, 'sadece-wt.md'), 'x' + dolgu(SINIR + 10) + 'WT-SON')
      expect(fm('sadece-wt.md', 'WT-SON')).toBe(true)
      process.env.CLAUDE_PROJECT_DIR = dizin
      const m = k.incele(cagri({ action: 'add_check', checkType: 'file_matches', checkNotes: JSON.stringify({ file: 'buyuk.md', pattern: 'KUYRUK-SON' }) })) ?? ''
      expect(m).toContain('65536')
      expect(m).toContain('buyuk.md')
    } finally {
      if (eski === undefined) delete process.env.CLAUDE_PROJECT_DIR
      else process.env.CLAUDE_PROJECT_DIR = eski
      rmSync(dizin, { recursive: true, force: true })
    }
  })

  it('reddetme metni üç çalışan yolu ve sebebi söyler', () => {
    const m = k.incele(cagri({ action: 'add_check', checkType: 'file_exists', checkNotes: 'C:/tmp/x.md' })) ?? ''
    expect(m).toContain('mutlak yol')
    expect(m).toContain('repo-göreli')
    expect(m).toContain('tmp/')
    expect(m).toContain('gh api')
  })

  it('kanca süreç olarak: mutlak yolda deny JSON basar, göreli yolda sessiz çıkar', () => {
    const kos = (girdi: unknown) =>
      spawnSync('node', [KANCA], { input: JSON.stringify(girdi), encoding: 'utf8', windowsHide: true })
    const kotu = kos(cagri({ action: 'add_check', checkType: 'file_exists', checkNotes: 'C:/tmp/x.md' }))
    expect(kotu.status).toBe(0)
    const cikti = JSON.parse(kotu.stdout) as { hookSpecificOutput: { permissionDecision: string; permissionDecisionReason: string } }
    expect(cikti.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(cikti.hookSpecificOutput.permissionDecisionReason).toContain('ARC-93')
    const iyi = kos(cagri({ action: 'add_check', checkType: 'file_exists', checkNotes: 'docs/x.md' }))
    expect(iyi.status).toBe(0)
    expect(iyi.stdout).toBe('')
    const bozuk = spawnSync('node', [KANCA], { input: '{bozuk', encoding: 'utf8', windowsHide: true })
    expect(bozuk.status).toBe(0)
    expect(bozuk.stdout).toBe('')
  })
})
