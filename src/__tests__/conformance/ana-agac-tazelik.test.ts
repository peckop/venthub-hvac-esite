import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-ANA-AGAC-TAZE-1 · ANA AĞAÇ TAZELİĞİ (REC-345, karar 44, cetvel fleet-mechanism-standard §20.2).
 *
 * ⭐NİÇİN VAR: 2026-09-17'de ana ağaç origin/master'dan 50 commit gerideydi; kancalar, CLAUDE.md ve
 * .mcp.json ana ağaçtan yüklendiği için dört merge'lü düzenek hiçbir pencerede etkin değildi ve
 * hiçbir kapı görmedi. Bu dosya ölçümü ve güvenli ileri sarmayı kollar.
 *
 * ⭐DURUM ÜRETİLİR, VARSAYILMAZ (§25): her kol geçici bir çıplak "origin", ondan klonlanmış bir ana
 * ağaç ve ona bağlı bir worktree kurar. Makinenin gerçek deposuna dokunulmaz.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const tazelik = require_(path.join(KOK, 'scripts', 'hijyen', 'ana-agac-tazelik.cjs')) as {
  anaAgacYolu: (agac: string) => string
  olc: (agac: string) => { dal: string; geride: number; ileride: number; kirli: string[] }
  ileriSar: (agac: string) => { durum: string; geride?: number; sebep?: string }
  ayarYolunaDeger: (dosyalar: string[]) => boolean
  acilisSatiri: (agac: string) => string
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

/** origin (çıplak) + ana ağaç + worktree; ana ağaç `geride` commit geride bırakılır. */
function kurulum(geride: number): { ana: string; wt: string; kok: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'ana-agac-taze-'))
  GECICI.push(kok)
  const origin = path.join(kok, 'origin.git')
  const ana = path.join(kok, 'ana')
  const wt = path.join(kok, 'wt')
  g(kok, 'init', '--bare', '-b', 'master', origin)
  g(kok, 'clone', '-q', origin, ana)
  g(ana, 'checkout', '-q', '-B', 'master')
  fs.writeFileSync(path.join(ana, 'a.txt'), '0\n')
  g(ana, 'add', 'a.txt')
  g(ana, 'commit', '-q', '-m', 'c0')
  g(ana, 'push', '-q', 'origin', 'master')
  g(ana, 'worktree', 'add', '-q', '-b', 'serit', wt, 'master')
  for (let i = 1; i <= geride; i++) {
    fs.writeFileSync(path.join(wt, 'a.txt'), `${i}\n`)
    g(wt, 'add', 'a.txt')
    g(wt, 'commit', '-q', '-m', `c${i}`)
  }
  if (geride > 0) g(wt, 'push', '-q', 'origin', 'serit:master')
  // Paylaşılan uzak ref'i worktree'den tazele — ana ağaç hiç fetch etmez (gerçek durum budur).
  g(wt, 'fetch', '-q', 'origin')
  return { ana, wt, kok }
}

describe('INV-ANA-AGAC-TAZE-1 ana ağaç tazeliği', () => {
  it('worktree içinden ana ağacı bulur ve geride sayısını ağ olmadan ölçer', () => {
    const { ana, wt } = kurulum(3)
    expect(fs.realpathSync(tazelik.anaAgacYolu(wt))).toBe(fs.realpathSync(ana))
    const o = tazelik.olc(ana)
    expect(o).toMatchObject({ dal: 'master', geride: 3, ileride: 0 })
    expect(o.kirli).toEqual([])
  })

  it('temiz ağaç ileri sarılır ve sonra 0 geride ölçülür', () => {
    const { ana } = kurulum(2)
    expect(tazelik.ileriSar(ana)).toMatchObject({ durum: 'ilerlendi', geride: 2 })
    expect(tazelik.olc(ana).geride).toBe(0)
    expect(tazelik.ileriSar(ana)).toMatchObject({ durum: 'guncel' })
  })

  it('izlenmeyen dosya engel değildir (başka şeridin ekran görüntüsü vakası)', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'ekran.png'), 'x')
    expect(tazelik.ileriSar(ana).durum).toBe('ilerlendi')
    expect(fs.existsSync(path.join(ana, 'ekran.png'))).toBe(true)
  })

  it('izlenen dosyada değişiklik varsa DOKUNULMAZ, değişiklik korunur ve sebep yazılır', () => {
    const { ana } = kurulum(1)
    fs.writeFileSync(path.join(ana, 'a.txt'), 'recep-in-yerel-satiri\n')
    const s = tazelik.ileriSar(ana)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/izlenen 1 dosyada/)
    expect(fs.readFileSync(path.join(ana, 'a.txt'), 'utf8')).toBe('recep-in-yerel-satiri\n')
    expect(tazelik.olc(ana).geride).toBe(1)
    expect(tazelik.acilisSatiri(ana)).toMatch(/ANA AGAC 1 COMMIT GERIDE[\s\S]*Ileri sarilamaz/)
  })

  it('başka dal ya da fazladan yerel commit varsa DOKUNULMAZ', () => {
    const a = kurulum(1)
    g(a.ana, 'checkout', '-q', '-b', 'deneme')
    expect(tazelik.ileriSar(a.ana)).toMatchObject({ durum: 'engelli' })
    expect(tazelik.ileriSar(a.ana).sebep).toMatch(/deneme/)

    const b = kurulum(1)
    fs.writeFileSync(path.join(b.ana, 'b.txt'), 'yerel\n')
    g(b.ana, 'add', 'b.txt')
    g(b.ana, 'commit', '-q', '-m', 'yerel')
    const s = tazelik.ileriSar(b.ana)
    expect(s.durum).toBe('engelli')
    expect(s.sebep).toMatch(/1 commit var/)
  })

  it('açılış satırı: güncelse BOŞ (sessizlik), gerideyse sayı + güvenli komut', () => {
    const guncel = kurulum(0)
    expect(tazelik.acilisSatiri(guncel.wt)).toBe('')
    const geride = kurulum(4)
    expect(tazelik.acilisSatiri(geride.wt)).toMatch(/ANA AGAC 4 COMMIT GERIDE[\s\S]*--ileri-sar/)
  })

  it('ölçemezse "geride değil" DEMEZ, ölçemedim der', () => {
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'ana-agac-yok-'))
    GECICI.push(bos)
    expect(tazelik.acilisSatiri(bos)).toMatch(/OLCULEMEDI/)
    expect(tazelik.ileriSar(bos).durum).toBe('olcemedi')
  })

  it('ayar yolu sınıflaması: kanca/ayar/araç/CLAUDE.md evet, ürün kodu hayır', () => {
    for (const d of ['.claude/hooks/x.cjs', '.claude/settings.json', '.mcp.json', 'CLAUDE.md', 'tools/wrongstack-mcp/package.json', '.githooks/pre-commit']) {
      expect(tazelik.ayarYolunaDeger([d]), d).toBe(true)
    }
    expect(tazelik.ayarYolunaDeger(['src/app/page.tsx', 'docs/CLAUDE.md', 'supabase/migrations/x.sql'])).toBe(false)
  })

  it('düzenek gerçekten bağlı: açılış kancası ve merge ritüeli modülü çağırır', () => {
    const kanca = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kanca).toMatch(/ana-agac-tazelik\.cjs'\)\)\s*\.acilisSatiri\(/)
    const ritual = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    expect(ritual).toMatch(/tazelik\.ayarYolunaDeger\(dosyalar\)/)
    expect(ritual).toMatch(/tazelik\.ileriSar\(tazelik\.anaAgacYolu\(AGAC\)\)/)
    // stash/reset/checkout ileri sarma yolunda YASAK (kirli ağaç birinin yarım işidir).
    const modul = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'), 'utf8')
    expect(modul).not.toMatch(/\[\s*'(stash|reset|checkout)'/)
  })
})
