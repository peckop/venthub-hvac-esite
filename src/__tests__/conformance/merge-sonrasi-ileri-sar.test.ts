import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-MERGE-SONRASI-ILERI-SAR-1 (karar 165 W4, 2026-09-28).
 *
 * `gh pr merge` sonrası ana ağaç, merge ritüelinin kullandığı AYNI `ileriSar` ile ileri sarılır;
 * kirli ağaçta DURUR ve söyler. Gerekçe: .claude/hooks/merge-sonrasi-ileri-sar.cjs başlığı.
 * Durum üretilir: geçici çıplak origin + ana ağaç + worktree; gerçek depoya dokunulmaz.
 */
const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'merge-sonrasi-ileri-sar.cjs')
const k = require_(KANCA) as {
  mergeMi: (s: unknown) => boolean
  satir: (s: { durum: string; geride?: number; sebep?: string } | null) => string | null
}

const GECICI: string[] = []
afterAll(() => {
  for (const d of GECICI) fs.rmSync(d, { recursive: true, force: true })
})

function g(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

/** origin + ana ağaç + worktree; worktree origin'e 1 commit iter, ana ağaç geride kalır. */
function kurulum(): { ana: string; wt: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-ileri-'))
  GECICI.push(kok)
  const origin = path.join(kok, 'origin.git')
  const ana = path.join(kok, 'ana')
  const wt = path.join(kok, 'wt')
  g(kok, 'init', '--bare', '-b', 'master', origin)
  g(kok, 'clone', '-q', origin, ana)
  g(ana, 'checkout', '-q', '-B', 'master')
  fs.writeFileSync(path.join(ana, 'a.txt'), '0\n')
  fs.writeFileSync(path.join(ana, 'b.txt'), '0\n')
  g(ana, 'add', '.')
  g(ana, 'commit', '-q', '-m', 'c0')
  g(ana, 'push', '-q', 'origin', 'master')
  g(ana, 'worktree', 'add', '-q', '-b', 'serit', wt, 'master')
  fs.writeFileSync(path.join(wt, 'a.txt'), '1\n')
  g(wt, 'commit', '-qam', 'c1')
  g(wt, 'push', '-q', 'origin', 'serit:master')
  return { ana, wt }
}

function kos(cwd: string, komut: string): string {
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ cwd, tool_input: { command: komut } }),
    encoding: 'utf8',
    timeout: 60_000,
    windowsHide: true,
  })
  expect(r.status).toBe(0)
  return r.stdout ? (JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }).hookSpecificOutput.additionalContext : ''
}

describe('INV-MERGE-SONRASI-ILERI-SAR-1', () => {
  it('yalnız gh pr merge tetikler', () => {
    expect(k.mergeMi('gh pr merge 1457 --squash')).toBe(true)
    expect(k.mergeMi('cd x && gh  pr   merge 12')).toBe(true)
    for (const s of ['gh pr view 1457', 'git merge --ff-only origin/master', 'gh pr checks 1', undefined]) expect(k.mergeMi(s)).toBe(false)
  })

  it('merge sonrası geride ana ağaç ileri sarılır; merge değilse dokunulmaz (ayırt edici çift)', { timeout: 120_000 }, () => {
    const { ana, wt } = kurulum()
    expect(kos(wt, 'gh pr view 1')).toBe('')
    expect(g(ana, 'rev-list', '--count', 'HEAD..origin/master').length).toBeGreaterThan(0)
    const once = g(ana, 'rev-parse', 'HEAD')
    expect(kos(wt, 'gh pr merge 1 --squash')).toMatch(/1 commit ileri sarildi/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
    expect(g(ana, 'rev-parse', 'HEAD')).toBe(g(ana, 'rev-parse', 'origin/master'))
  })

  it('ilgisiz kirli dosya ileri sarmayı ENGELLEMEZ; dosya korunur (#1468 vakası, Ops 09-28)', { timeout: 120_000 }, () => {
    const { ana, wt } = kurulum()
    fs.writeFileSync(path.join(ana, 'b.txt'), 'yarim is\n')
    const once = g(ana, 'rev-parse', 'HEAD')
    expect(kos(wt, 'gh pr merge 1')).toMatch(/^ANA AGAC: merge sonrasi 1 commit ileri sarildi/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
    expect(fs.readFileSync(path.join(ana, 'b.txt'), 'utf8')).toBe('yarim is\n')
  })

  it('kanca .claude/settings.json PostToolUse Bash bloğunda KAYITLI (kayıtsız kanca hiçbir şey yapmaz)', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks: { PostToolUse: { matcher: string; hooks: { command: string }[] }[] }
    }
    const bash = ayar.hooks.PostToolUse.filter((b) => b.matcher.split('|').includes('Bash'))
    expect(bash.flatMap((b) => b.hooks.map((h) => h.command)).some((c) => c.includes('merge-sonrasi-ileri-sar.cjs'))).toBe(true)
  })

  it('güncel ağaçta susar; ölçülemeyen hâl söylenir', () => {
    expect(k.satir({ durum: 'guncel', geride: 0 })).toBeNull()
    expect(k.satir({ durum: 'olcemedi', sebep: 'git yok' })).toMatch(/olculemedi \(git yok\)/)
  })
})
