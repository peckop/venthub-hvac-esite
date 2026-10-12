/**
 * INV-HAFIZA-YEDEK-1 — hafıza deposu PreCompact'ta ve eşik aşılınca yedeklenir; sır kalıbı commit'e girmez (ARC-92).
 *
 * Kanca: .claude/hooks/hafiza-yedek.cjs · modül: scripts/hijyen/hafiza-yedek.cjs · cetvel: hafiza-kancalari-standard.md §9.
 * Deneyler GEÇİCİ git deposunda koşar; gerçek hafıza dizinine dokunmaz.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK, 'scripts', 'hijyen', 'hafiza-yedek.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'hafiza-yedek.cjs')

interface Modul {
  ESIK_SN: number
  DENEME_ARALIGI_SN: number
  sirKalibiVar: (fark: string) => boolean
  yedekYasiSn: (dir: string, simdiSn: number) => number | null
  bekleyenVar: (dir: string) => boolean
  yedekle: (a: { dir: string; sebep?: string; simdi?: Date }) => { durum: string; push?: boolean }
  karar: (a: { olay: string; yasSn: number | null; bekleyen: boolean; sonDenemeYasSn: number | null }) => {
    yedekle: boolean
    satir: string | null
  }
  kancaKos: (girdi: { hook_event_name: string }, o: { dir: string; simdiSn: number }) => { cikti: unknown }
}
const m = gerek(MODUL) as Modul

const git = (dir: string, ...a: string[]) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', windowsHide: true }).trim()
const commitSayisi = (dir: string) => Number(git(dir, 'rev-list', '--count', 'HEAD'))

let dir = ''
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-yedek-'))
  git(dir, 'init', '-q', '-b', 'master')
  git(dir, 'config', 'user.email', 'test@example.invalid')
  git(dir, 'config', 'user.name', 'test')
  git(dir, 'config', 'commit.gpgsign', 'false')
  fs.writeFileSync(path.join(dir, 'MEMORY.md'), '# indeks\n')
  git(dir, 'add', '--', 'MEMORY.md')
  git(dir, 'commit', '-q', '-m', 'ilk')
})
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('INV-HAFIZA-YEDEK-1', () => {
  it('sır kalıbı: tam değerler yakalanır, kırpılmış ve kısa değerler yakalanmaz', () => {
    const uzun = (onek: string, n: number, set = 'a') => onek + set.repeat(n)
    expect(m.sirKalibiVar(uzun('sk-ant-', 70))).toBe(true)
    expect(m.sirKalibiVar(uzun('ghp_', 36))).toBe(true)
    expect(m.sirKalibiVar(uzun('lin_api_', 40))).toBe(true)
    expect(m.sirKalibiVar(uzun('sbp_', 40, 'f'))).toBe(true)
    // Bağlantı dizesi parçalardan kurulur: CI'daki sabit-bağlantı-dizesi taraması (ci.yml Secret guard) sahte örneği de yakalar.
    expect(m.sirKalibiVar(['postgresql', '://kullanici:parola@sunucu/veritabani'].join(''))).toBe(true)
    expect(m.sirKalibiVar('sk-ant-...kirpilmis')).toBe(false)
    expect(m.sirKalibiVar(uzun('ghp_', 10))).toBe(false)
    expect(m.sirKalibiVar('düz hafıza notu')).toBe(false)
  })

  it('değişiklik yoksa sessiz: yeni commit YOK', () => {
    const once = commitSayisi(dir)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('degisiklik-yok')
    expect(commitSayisi(dir)).toBe(once)
  })

  it('yeni not commit olur, push yoksa (uzak yok) sessiz kalır', () => {
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir ders\n')
    const once = commitSayisi(dir)
    const r = m.yedekle({ dir, sebep: 'precompact' })
    expect(r.durum).toBe('commit')
    expect(r.push).toBe(false)
    expect(commitSayisi(dir)).toBe(once + 1)
    expect(git(dir, 'log', '-1', '--format=%s')).toMatch(/^hafiza: precompact /)
  })

  it('sır kalıbı varsa commit ATILMAZ, günlüğe yazılır, indeks temizlenir', () => {
    const once = commitSayisi(dir)
    fs.writeFileSync(path.join(dir, 'sizinti.md'), 'anahtar ' + 'sk-ant-' + 'a'.repeat(70) + '\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('sir-kalibi')
    expect(commitSayisi(dir)).toBe(once)
    expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
    expect(fs.readFileSync(path.join(dir, '.hafiza-commit-uyari.log'), 'utf8')).toContain('SIR KALIBI')
  })

  it('yaş ve bekleyen: son commit yaşı sn olarak ölçülür, izlenmeyen md bekleyen sayılır', () => {
    const ct = Number(git(dir, 'log', '-1', '--format=%ct'))
    expect(m.yedekYasiSn(dir, ct + 4000)).toBe(4000)
    expect(m.yedekYasiSn(path.join(dir, 'yok'), ct)).toBeNull()
    expect(m.bekleyenVar(dir)).toBe(false)
    fs.writeFileSync(path.join(dir, 'yeni.md'), 'x\n')
    expect(m.bekleyenVar(dir)).toBe(true)
    fs.rmSync(path.join(dir, 'yeni.md'))
    fs.writeFileSync(path.join(dir, 'ilgisiz.txt'), 'x\n')
    expect(m.bekleyenVar(dir)).toBe(false)
  })

  it('karar: PreCompact her zaman yedekler; eşik ve bekleyen şartı; deneme aralığı', () => {
    const k = (o: Partial<Parameters<Modul['karar']>[0]>) =>
      m.karar({ olay: 'UserPromptSubmit', yasSn: 5000, bekleyen: true, sonDenemeYasSn: null, ...o })
    expect(k({ olay: 'PreCompact', yasSn: 1, bekleyen: false }).yedekle).toBe(true)
    expect(k({}).yedekle).toBe(true)
    expect(k({}).satir).toContain('⚠HAFIZA YEDEK')
    expect(k({ yasSn: m.ESIK_SN }).yedekle).toBe(false) // eşik tam sınır: ">" 3600
    expect(k({ yasSn: m.ESIK_SN + 1 }).yedekle).toBe(true)
    expect(k({ bekleyen: false }).yedekle).toBe(false)
    expect(k({ bekleyen: false }).satir).toBeNull()
    expect(k({ sonDenemeYasSn: 60 }).yedekle).toBe(false)
    expect(k({ sonDenemeYasSn: m.DENEME_ARALIGI_SN }).yedekle).toBe(true)
    expect(k({ yasSn: null }).yedekle).toBe(false)
    expect(k({ olay: 'Stop' }).yedekle).toBe(false)
  })

  it('SessionStart yaş satırını HER ZAMAN söyler (bekleyen yokken de)', () => {
    const r = m.karar({ olay: 'SessionStart', yasSn: 120, bekleyen: false, sonDenemeYasSn: null })
    expect(r.satir).toContain('son commit 2 dk önce')
    expect(r.satir).toContain('bekleyen değişiklik yok')
    expect(r.yedekle).toBe(false)
    // Eski commit olsa bile bekleyen yoksa arka plan yedeği BAŞLAMAZ (yedeklenecek bir şey yok).
    const eskiAmaTemiz = m.karar({ olay: 'SessionStart', yasSn: 9000, bekleyen: false, sonDenemeYasSn: null })
    expect(eskiAmaTemiz.yedekle).toBe(false)
    expect(eskiAmaTemiz.satir).toContain('150 dk')
    const eskiVeBekleyen = m.karar({ olay: 'SessionStart', yasSn: 9000, bekleyen: true, sonDenemeYasSn: null })
    expect(eskiVeBekleyen.yedekle).toBe(true)
    expect(eskiVeBekleyen.satir).toContain('⚠')
  })

  it('kancaKos PreCompact: elde yedek alır ve sessizdir', () => {
    fs.writeFileSync(path.join(dir, 'compact-oncesi.md'), 'kayboldu mu\n')
    const once = commitSayisi(dir)
    const r = m.kancaKos({ hook_event_name: 'PreCompact' }, { dir, simdiSn: Math.floor(Date.now() / 1000) })
    expect(r.cikti).toBeNull()
    expect(commitSayisi(dir)).toBe(once + 1)
  })

  it('kanca süreç olarak: hafıza dizini yoksa sessiz çıkış 0; SessionStart satır basar', () => {
    const kos = (girdi: unknown, hafiza: string) =>
      spawnSync('node', [KANCA], {
        input: JSON.stringify(girdi),
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, HAFIZA_DIZINI: hafiza },
      })
    const yok = kos({ hook_event_name: 'SessionStart' }, path.join(dir, 'yok-dizin'))
    expect(yok.status).toBe(0)
    expect(yok.stdout).toBe('')
    const var_ = kos({ hook_event_name: 'SessionStart' }, dir)
    expect(var_.status).toBe(0)
    const c = JSON.parse(var_.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(c.hookSpecificOutput.hookEventName).toBe('SessionStart')
    expect(c.hookSpecificOutput.additionalContext).toContain('HAFIZA YEDEK')
    const bozuk = spawnSync('node', [KANCA], { input: '{bozuk', encoding: 'utf8', windowsHide: true })
    expect(bozuk.status).toBe(0)
  })
})
