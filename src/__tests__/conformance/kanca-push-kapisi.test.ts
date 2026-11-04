import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PUSH-KAPISI-1 · git push ayrıştıran PreToolUse kapısı (ARC-171, #1988 güvenlik incelemesi).
 * settings.json deny satırları ham desendir; kapı refspec'i, -C yolunu ve zincirleri ayrıştırır.
 * Sabotaj kolu: korunan dal / force / -C denetimleri bozulursa ilgili test kırmızıya döner.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'push-kapisi.cjs')
type Secenek = { cwd: string; mevcutDal?: (c: string) => string | null; kokler?: string[] }
const motor = require_(KANCA) as { degerlendir: (k: string, o: Secenek) => string | null; parcala: (k: string) => string[][] }

const CWD = path.resolve('/depo/calisma')
const o = (mevcut: string | null = 'feat-x'): Secenek => ({ cwd: CWD, mevcutDal: () => mevcut, kokler: [CWD, path.resolve('/depo')] })
const ret = (k: string, s: Secenek = o()) => motor.degerlendir(k, s)

describe('INV-PUSH-KAPISI-1 — izin verilen tek biçim', () => {
  it.each([
    'git push origin feat-x',
    'git push -u origin feat-x',
    'git push --set-upstream origin arac/arc171-push-kapisi',
    'git push origin HEAD',
    'git push origin HEAD:feat-x',
    'git push origin feat-a:feat-b',
    'git push -n origin feat-x',
    'git -C /depo/calisma push origin feat-x',
    'git status && git push origin feat-x',
    'git push',
    'echo "push"',
    'git log --oneline',
  ])('geçer: %s', (k) => {
    expect(ret(k)).toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — reddedilenler', () => {
  it.each([
    ['git push origin master', 'korunan'],
    ['git push origin main', 'korunan'],
    ['git push origin HEAD:master', 'korunan'],
    ['git push origin feat:refs/heads/main', 'korunan'],
    ['git push origin refs/heads/master', 'korunan'],
    ['git push -u origin master', 'korunan'],
    ['git push --force origin feat-x', 'yasak bayrak'],
    ['git push -f origin feat-x', 'yasak bayrak'],
    ['git push --force-with-lease origin feat-x', 'yasak bayrak'],
    ['git push -uf origin feat-x', 'birleşik'],
    ['git push origin +feat-x', 'force'],
    ['git push origin :feat-x', 'siler'],
    ['git push --delete origin feat-x', 'yasak bayrak'],
    ['git push --mirror origin', 'yasak bayrak'],
    ['git push --all origin', 'yasak bayrak'],
    ['git push https://github.com/x/y.git feat-x', 'adlı bir uzak değil'],
    ['git push git@github.com:x/y.git feat-x', 'adlı bir uzak değil'],
    ['git push origin HEAD:feat-*', 'joker'],
    ['git -C /baska/depo push origin feat-x', 'ağacı dışında'],
    ['git -C ../../baska push origin feat-x', 'ağacı dışında'],
    ['git status && git push origin master', 'korunan'],
    ['ls; git push -f origin x', 'yasak bayrak'],
    ['bash -c "git push origin master"', 'korunan'],
    ['eval "git push --force origin x"', 'yasak bayrak'],
    ['FOO=1 git push origin main', 'korunan'],
    ['git -c core.x=1 push origin master', 'global seçeneği'],
    ['git push --receive-pack=evil origin feat-x', 'hedefini'],
    // Otomatik güvenlik incelemesi bulguları (PR #2252): global seçenekler, hedef çözümü, komut tanıma, kabuklar, art arda -C
    ['git -c remote.origin.pushurl=evil push origin feat-x', 'global seçeneği'],
    ['git -c alias.p=push p origin master', 'global seçeneği'],
    ['git --git-dir=/x/.git push origin feat-x', 'global seçeneği'],
    ['git push origin feat:heads/master', 'korunan'],
    ['git push origin feat:refs/tags/v1', 'refs/heads/ dışında'],
    ['git push origin feat:refs/for/x', 'refs/heads/ dışında'],
    ['git push origin @:master', 'korunan'],
    ['/usr/bin/git push origin master', 'korunan'],
    ['"C:/Program Files/Git/cmd/git.exe" push origin master', 'korunan'],
    ['GIT.EXE push -f origin x', 'yasak bayrak'],
    ['env git push origin master', 'korunan'],
    ['sudo git push -f origin x', 'yasak bayrak'],
    ['xargs -n1 git push origin master', 'korunan'],
    ['bash -lc "git push origin master"', 'korunan'],
    ['pwsh -Command "git push -f origin x"', 'yasak bayrak'],
    ['cmd /c "git push origin main"', 'korunan'],
    ['git -C /baska -C . push origin feat-x', 'ağacı dışında'],
  ])('reddeder: %s', (k, parca) => {
    const sonuc = ret(k)
    expect(sonuc, k).not.toBeNull()
    expect(sonuc as string).toContain(parca)
  })

  it('mevcut dal master iken argümansız push ve HEAD reddedilir', () => {
    expect(ret('git push', o('master'))).toContain('master')
    expect(ret('git push origin HEAD', o('main'))).toContain('main')
    expect(ret('git push origin', o('master'))).toContain('master')
    expect(ret('git push origin @', o('master'))).toContain('master')
  })

  it('⛔SABOTAJ: korunan dal listesi boşalsaydı master push geçerdi (kapı gerçekten ayırt ediyor)', () => {
    expect(ret('git push origin master')).not.toBeNull()
    expect(ret('git push origin feat-x')).toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — ayrıştırıcı', () => {
  it('tırnak içindeki operatör bölmez', () => {
    expect(motor.parcala('echo "a && git push origin master"')).toEqual([['echo', 'a && git push origin master']])
  })
})

describe('INV-PUSH-KAPISI-1 — kanca süreci', () => {
  const kos = (komut: string, ek: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: komut }, cwd: KOK }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_PUSH_KAPISI_KAPAT: '', ...ek },
    })

  it('korunan dala push deny JSON basar', () => {
    const r = kos('git push origin master')
    expect(r.status).toBe(0)
    const j = JSON.parse(r.stdout)
    expect(j.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(j.hookSpecificOutput.permissionDecisionReason).toContain('[push-kapisi]')
  })

  it('izinli push, push olmayan komut ve bozuk girdi sessiz geçer; vana kapatır', () => {
    expect(kos('git push origin feat-x').stdout).toBe('')
    expect(kos('ls -la').stdout).toBe('')
    expect(kos('git push origin master', { VENTHUB_PUSH_KAPISI_KAPAT: '1' }).stdout).toBe('')
    expect(spawnSync(process.execPath, [KANCA], { input: 'bozuk', encoding: 'utf8' }).status).toBe(0)
  })
})
