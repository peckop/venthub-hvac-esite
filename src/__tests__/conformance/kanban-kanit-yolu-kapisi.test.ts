/**
 * INV-KANBAN-KANIT-YOLU-1 — Kanban'a mutlak/kök dışı yolla file_exists ya da file_matches kanıtı eklenemez (ARC-93).
 *
 * Kanca: .claude/hooks/kanban-kanit-yolu-kapisi.cjs · kural: .claude/hooks/kanban-kanit-yolu-kapisi.md
 * Kök sebep: @wrongstack/kanban resolveProjectPath mutlak yolu kök kontrolünden önce reddeder (1.0.26, 1.0.36, 1.0.37).
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
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
    expect(reddedilir({ action: 'add_check', checkType: 'command', checkNotes: JSON.stringify({ file: '/etc/hosts' }) })).toBe(false)
    expect(reddedilir({ action: 'add_note', checkType: 'file_exists', checkNotes: 'C:/tmp/x.md' })).toBe(false)
    expect(k.incele(cagri({ action: 'add_check', checkType: 'file_exists', checkNotes: 'C:/x' }, 'Bash'))).toBeNull()
    expect(k.incele(null)).toBeNull()
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
