// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-COMPACT-3 · PreCompact kapısı durum dosyası VARKEN compact'ı durdurmaz (ARC-137, 14 Ekim).
 *
 * VAKA: Altyapı penceresinde /compact "bu oturumun HIC durum dosyasi yok" diye durduruldu; dosya ana hafıza dizininde
 * duruyordu (originSessionId doğru, 547 KB). Mekanizma ölçüldü: ana kök `git rev-parse` ile çözülüyordu; git
 * cevap vermeyince (5 sn zaman aşımı, sessiz null) ana kök worktree'ye düşüyor, ana hafıza dizini adaylara girmiyor,
 * kapı yanlış dizini tarayıp "dosya 0" diyordu. PATH'ten git çıkarılınca gerçek Altyapı girdisiyle çıkış 2 üretildi.
 *
 * İKİ AYIRIM: (1) "hafıza dizini çözülemedi" ≠ "dosya yok" (2) "dosya okunamadı" ≠ "dosya yok".
 * Gerçekten dosyasız oturum yine bloklanır (kapının tek bloklayan kolu duruyor).
 */

const gerek = createRequire(import.meta.url)
const KAPI = gerek.resolve('../../../.claude/hooks/precompact-durum-kapisi.cjs')

const SID = 'c39c7c8c-be05-418e-806e-dad2baec0e19'
const NODE_DIZINI = path.dirname(process.execPath)

const DURUM =
  `---\nname: altyapi-lane-day\nmetadata:\n  originSessionId: ${SID}\n---\n\n` +
  '## Durum\n## SON GİRDİ\nx\n## AÇIK KUYRUK\ny\n## VERİLEN SÖZLER\nz\n## BEKLEYEN KARARLAR\nw\n'

interface Kurulum {
  home: string
  anaProje: string
  worktreeProje: string
  transcript: string
  cwd: string
}

/** Sahte HOME: ana proje dizini (memory dolu/boş) + worktree proje dizini (memory YOK, transcript orada). */
function kur(opts: { durumDosyasi: boolean; anaMemory?: boolean }): Kurulum {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'arc137-'))
  const projeler = path.join(home, '.claude', 'projects')
  const anaProje = path.join(projeler, 'C--Users-x-repo')
  const worktreeProje = path.join(projeler, 'C--Users-x-repo--claude-worktrees-altyapi-pencere')
  fs.mkdirSync(worktreeProje, { recursive: true })
  if (opts.anaMemory !== false) {
    fs.mkdirSync(path.join(anaProje, 'memory'), { recursive: true })
    if (opts.durumDosyasi) fs.writeFileSync(path.join(anaProje, 'memory', 'altyapi-lane-day-2026-10-01.md'), DURUM, 'utf8')
    fs.writeFileSync(path.join(anaProje, 'memory', 'dizin-dersler.md'), '# ders dosyasi\n', 'utf8')
  } else {
    fs.mkdirSync(anaProje, { recursive: true })
  }
  return {
    home,
    anaProje,
    worktreeProje,
    transcript: path.join(worktreeProje, SID + '.jsonl'),
    cwd: path.join(home, 'x', 'repo', '.claude', 'worktrees', 'altyapi-pencere'),
  }
}

/** Kapıyı gerçek girdiyle koşar. `gitYok`: PATH'te yalnız node (git çağrıları sessizce null döner). */
function kos(k: Kurulum, o: { gitYok?: boolean; sid?: string } = {}) {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: k.home,
    USERPROFILE: k.home,
    PATH: o.gitYok ? NODE_DIZINI : process.env.PATH,
  }
  delete env.VENTHUB_ANA_PROJE_DIZINI
  delete env.VENTHUB_PRECOMPACT_KAPALI
  delete env.CLAUDE_PROJECT_DIR
  return spawnSync(process.execPath, [KAPI], {
    input: JSON.stringify({ session_id: o.sid ?? SID, transcript_path: k.transcript, cwd: k.cwd, trigger: 'manual' }),
    encoding: 'utf8',
    env,
    timeout: 45_000,
  })
}

describe('INV-COMPACT-3 · yanlış durdurma', () => {
  it('git VARKEN: worktree penceresinin dosyası ana hafıza dizininde bulunur (temel hal)', () => {
    const r = kos(kur({ durumDosyasi: true }))
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toContain('durum kapisi')
  })

  it('⭐GİT YOKKEN (vakanın mekanizması): dosya ana dizinde VAR → durdurmaz', () => {
    const r = kos(kur({ durumDosyasi: true }), { gitYok: true })
    expect(r.stderr, 'kapı dosya varken durdurdu').not.toContain('COMPACT DURDURULDU')
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/durum kapisi/)
  })

  it('GERÇEKTEN dosyasız oturum yine DURDURULUR (git var ve yok)', () => {
    for (const gitYok of [false, true]) {
      const r = kos(kur({ durumDosyasi: false }), { gitYok })
      expect(r.status, 'gitYok=' + gitYok + ': ' + r.stdout + r.stderr).toBe(2)
      expect(r.stderr).toContain('COMPACT DURDURULDU')
    }
  })

  it('başka oturumun kimliğiyle gelen girdi dosyayı kendi dosyası SANMAZ (kimlik ayırt eder)', () => {
    const r = kos(kur({ durumDosyasi: true }), { gitYok: true, sid: '99999999-aaaa-bbbb-cccc-dddddddddddd' })
    expect(r.status).toBe(2)
  })

  it('hafıza dizini hiç çözülemezse "dosya yok" DENMEZ: bloklamaz, OLCULEMEDI der', () => {
    const k = kur({ durumDosyasi: false, anaMemory: false }) // ana proje var ama memory/ yok; worktree'de de yok
    const r = kos(k, { gitYok: true })
    expect(r.status, r.stderr).toBe(0)
    expect(r.stdout).toContain('COZULEMEDI')
  })

  it('okunamayan hafıza dosyası "dosya yok" sayılmaz: bloklamaz, sebebi söyler', () => {
    const k = kur({ durumDosyasi: false })
    // Bir DİZİN .md adıyla: readFileSync EISDIR fırlatır (Windows'ta kilitli dosyanın güvenilir taklidi).
    fs.mkdirSync(path.join(k.anaProje, 'memory', 'kilitli-lane-day.md'))
    const r = kos(k)
    expect(r.status, r.stdout + r.stderr).toBe(0)
    expect(r.stdout).toContain('OLCULEMEDI')
    expect(r.stdout).toMatch(/1 hafiza dosyasi okunamadi/)
  })
})

describe('INV-COMPACT-3 · anaProjeDizinindenTuret (git\'siz)', () => {
  it('worktree proje adından ana proje dizinini çıkarır; büyük/küçük harf farkı çözülür', () => {
    const k = kur({ durumDosyasi: true })
    // os.homedir() işçi iş parçacığında süreç ortamına bağlı: işlevi sahte HOME'lu ayrı süreçte çağırıyoruz.
    const cagir = (proje: string | null, kok?: string): string | null => {
      const r = spawnSync(
        process.execPath,
        ['-e', 'const k=require(process.argv[1]);process.stdout.write(JSON.stringify(k.anaProjeDizinindenTuret(JSON.parse(process.argv[2]),JSON.parse(process.argv[3]))))', KAPI, JSON.stringify(proje), JSON.stringify(kok ?? null)],
        { encoding: 'utf8', env: { ...process.env, HOME: k.home, USERPROFILE: k.home }, timeout: 30_000 },
      )
      return JSON.parse(r.stdout) as string | null
    }
    expect(cagir(k.worktreeProje)).toBe(k.anaProje)
    expect(cagir(path.join(path.dirname(k.worktreeProje), 'C--Users-x-baska--claude-worktrees-a'))).toBeNull() // ana dizin yok
    expect(cagir(path.join(path.dirname(k.worktreeProje), 'C--Users-x-repo'))).toBeNull() // worktree adı değil
    expect(cagir(null)).toBeNull()
  })
})
