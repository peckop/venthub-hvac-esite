import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ARAC-MOD-YEDEK-1 · mod deposu yedeği (ARC-134). Gerçek GitHub deposuna DOKUNMAZ: yerel çıplak depo uzak sayılır.
 * Sabotaj kolları: sır kalıbı commit'lenmez, uzak yoksa sessiz yeşil yok, itme düşerse hata.
 */
const req = createRequire(import.meta.url)
const M = req(path.resolve(__dirname, '../../../scripts/arac/mod-yedek.cjs')) as {
  yedekle: (p: { dir: string; push?: boolean }) => { durum: string; push?: boolean }
  UZAK_DAL: string
}

const git = (dir: string, ...a: string[]) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' }).trim()

function kur(uzakla: boolean) {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-mod-yedek-'))
  const dir = path.join(kok, 'mods')
  const uzak = path.join(kok, 'uzak.git')
  fs.mkdirSync(dir)
  git(dir, 'init', '-q', '-b', 'master')
  git(dir, 'config', 'user.email', 't@t')
  git(dir, 'config', 'user.name', 't')
  fs.writeFileSync(path.join(dir, 'a.txt'), 'bir')
  if (uzakla) {
    execFileSync('git', ['init', '-q', '--bare', uzak])
    git(dir, 'remote', 'add', 'origin', uzak)
  }
  return { kok, dir, uzak }
}

describe('INV-ARAC-MOD-YEDEK-1', () => {
  it('değişiklik commit edilir ve yedek dalına itilir; değişiklik yoksa yeni commit yok', () => {
    const s = kur(true)
    const r = M.yedekle({ dir: s.dir })
    expect(r).toEqual({ durum: 'commit', push: true })
    expect(git(s.uzak, 'log', '-1', '--format=%s', M.UZAK_DAL)).toMatch(/^mod yedek /)
    const once = git(s.dir, 'rev-list', '--count', 'HEAD')
    M.yedekle({ dir: s.dir })
    expect(git(s.dir, 'rev-list', '--count', 'HEAD')).toBe(once)
    fs.rmSync(s.kok, { recursive: true, force: true })
  })

  it('SABOTAJ: sır kalıbı içeren dosya commit edilmez ve indeks temizlenir', () => {
    const s = kur(true)
    fs.writeFileSync(path.join(s.dir, 'gizli.txt'), 'ghp_' + 'a'.repeat(36))
    expect(M.yedekle({ dir: s.dir }).durum).toBe('sir-kalibi')
    expect(git(s.dir, 'status', '--porcelain')).toContain('gizli.txt')
    expect(() => git(s.dir, 'rev-parse', '--verify', 'HEAD')).toThrow()
    fs.rmSync(s.kok, { recursive: true, force: true })
  })

  it('SABOTAJ: uzak depo yoksa yok-uzak (sessiz yeşil değil); --yerel itmeden commit eder', () => {
    const s = kur(false)
    expect(M.yedekle({ dir: s.dir }).durum).toBe('yok-uzak')
    expect(M.yedekle({ dir: s.dir, push: false }).durum).toBe('yerel')
    expect(git(s.dir, 'rev-list', '--count', 'HEAD')).toBe('1')
    fs.rmSync(s.kok, { recursive: true, force: true })
  })

  it('SABOTAJ: itme düşerse hata döner', () => {
    const s = kur(true)
    fs.rmSync(s.uzak, { recursive: true, force: true })
    expect(M.yedekle({ dir: s.dir }).durum).toBe('hata')
    fs.rmSync(s.kok, { recursive: true, force: true })
  })

  it('yedek dalı zaten checkout ise de itilir (branch -f hatası yok)', () => {
    const s = kur(true)
    git(s.dir, 'add', '-A')
    git(s.dir, 'commit', '-q', '-m', 'ilk')
    git(s.dir, 'checkout', '-q', '-b', M.UZAK_DAL)
    fs.writeFileSync(path.join(s.dir, 'b.txt'), 'iki')
    expect(M.yedekle({ dir: s.dir })).toEqual({ durum: 'commit', push: true })
    expect(git(s.uzak, 'log', '-1', '--format=%s', M.UZAK_DAL)).toMatch(/^mod yedek /)
    fs.rmSync(s.kok, { recursive: true, force: true })
  })

  it('depo olmayan dizin yok-depo', () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-mod-yedek-yok-'))
    expect(M.yedekle({ dir: d }).durum).toBe('yok-depo')
    fs.rmSync(d, { recursive: true, force: true })
  })
})
