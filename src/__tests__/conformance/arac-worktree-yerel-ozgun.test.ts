/**
 * INV-ARAC-WT-OZGUN-1 — tools/worktree-artik-sil.cjs + tools/worktree-temizle.cjs: silmeden önce YEREL-ÖZGÜN DOSYA KAPISI (ARC-190).
 *
 * Regresyon: 19 Ekim 2026, ~117 klasör `.git`siz ya da gitignore'lu yerel dosyalarına (ölçüm çıktısı, not, .env, csv/json)
 * BAKILMADAN silindi. Kural: node_modules/.next/graphify-out/coverage/test-results dışındaki her dosya için ana deponun
 * git geçmişinde (`log --all --name-only`) adı geçmeyen varsa klasör ATLANIR, istisnasız; geçmiş okunamazsa kapı KAPALI kalır.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
interface Arac {
  gecmisKumesi: (ana: string) => Map<string, Set<string>>
  yerelOzgunDosyalar: (kok: string, gecmis: Map<string, Set<string>>) => { toplam: number; dosyalar: string[] }
  yerelOzgunKapisi: (yol: string, gecmis: Map<string, Set<string>>) => { ok: boolean; sebep: string; dosyalar: string[]; toplam: number }
}
const a = gerek(path.join(KOK, 'tools', 'worktree-artik-sil.cjs')) as Arac

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

const yaz = (kok: string, rel: string, icerik = 'x') => {
  const p = path.join(kok, ...rel.split('/'))
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, icerik)
}

describe('INV-ARAC-WT-OZGUN-1 · yerel-özgün dosya kapısı', () => {
  let gecici = ''
  let ana = ''
  let gecmis: Map<string, Set<string>>
  beforeAll(() => {
    gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-ozgun-'))
    ana = path.join(gecici, 'ana')
    fs.mkdirSync(ana)
    git(ana, 'init', '-q', '-b', 'ana-dal')
    yaz(ana, 'src/a.ts')
    yaz(ana, 'docs/not.md')
    yaz(ana, 'silinmis.txt')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'bir')
    git(ana, 'rm', '-q', 'silinmis.txt')
    git(ana, 'commit', '-q', '-m', 'sil')
    yaz(ana, 'src/surum.ts', 'v1\nsatir\n')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'surum1')
    yaz(ana, 'src/surum.ts', 'v2\nsatir\n')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'surum2')
    git(ana, 'checkout', '-q', '-b', 'baska-dal')
    yaz(ana, 'yalniz-baska-dalda/b.ts')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'iki')
    git(ana, 'checkout', '-q', 'ana-dal')
    // yalnız BİRLEŞTİRME commit'inde eklenen dosya: `log --name-only` bunu -m olmadan listelemez
    git(ana, 'merge', '-q', '--no-ff', '--no-commit', 'baska-dal')
    yaz(ana, 'sadece-birlesmede.txt')
    git(ana, 'add', '-A')
    git(ana, 'commit', '-q', '-m', 'birlestirme')
    gecmis = a.gecmisKumesi(ana)
  })
  afterAll(() => {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true })
  })

  it('geçmiş kümesi TÜM dalları ve silinmiş dosyaları kapsar', () => {
    expect(gecmis.has('src/a.ts')).toBe(true)
    expect(gecmis.has('docs/not.md')).toBe(true)
    expect(gecmis.has('silinmis.txt')).toBe(true)
    expect(gecmis.has('yalniz-baska-dalda/b.ts')).toBe(true)
    expect(gecmis.has('sadece-birlesmede.txt')).toBe(true) // birleştirme commit'inde eklendi (-m)
    expect(gecmis.has('ozgun.csv')).toBe(false)
  })

  it('TEMİZ fikstür: yalnız geçmişteki dosyalar + kökteki derleme klasörleri + her derinlikte node_modules → kapı AÇIK', () => {
    const k = path.join(gecici, 'temiz')
    yaz(k, 'src/a.ts')
    yaz(k, 'docs/not.md')
    yaz(k, 'yalniz-baska-dalda/b.ts')
    yaz(k, 'node_modules/paket/index.js')
    yaz(k, 'packages/x/node_modules/y/i.js')
    yaz(k, '.next/cache/c.bin')
    yaz(k, 'graphify-out/graph.json')
    yaz(k, 'coverage/lcov.info')
    yaz(k, 'test-results/r.xml')
    fs.writeFileSync(path.join(k, '.git'), 'gitdir: /yok')
    const r = a.yerelOzgunKapisi(k, gecmis)
    expect(r.ok).toBe(true)
    expect(r.toplam).toBe(0)
  })

  it('YEREL-ÖZGÜN dosyalı fikstür ATLANIR: ölçüm csv/json, not, .env hepsi listelenir', () => {
    const k = path.join(gecici, 'ozgun')
    yaz(k, 'src/a.ts')
    yaz(k, 'olcum/sonuc.csv')
    yaz(k, 'olcum/ham.json')
    yaz(k, 'NOTLARIM.md')
    yaz(k, '.env')
    yaz(k, 'node_modules/p/i.js')
    const r = a.yerelOzgunKapisi(k, gecmis)
    expect(r.ok).toBe(false)
    expect(r.toplam).toBe(4)
    expect(r.dosyalar).toEqual(['.env', 'NOTLARIM.md', 'olcum/ham.json', 'olcum/sonuc.csv'])
    expect(r.sebep).toMatch(/yerel-özgün 4 dosya/)
  })

  it('TEK bir yerel-özgün dosya bile yeter (istisna yok)', () => {
    const k = path.join(gecici, 'tek')
    yaz(k, 'src/a.ts')
    yaz(k, 'tek.txt')
    expect(a.yerelOzgunKapisi(k, gecmis).ok).toBe(false)
  })

  it('İZLENEN ama yerelde DEĞİŞTİRİLMİŞ dosya (yol geçmişte var, içerik hiçbir blob ile eşleşmiyor) ÖZGÜN sayılır, kapı KAPALI', () => {
    const k = path.join(gecici, 'degismis')
    yaz(k, 'src/a.ts')
    yaz(k, 'src/surum.ts', 'v2\nsatir\nCOMMIT EDILMEMIS YEREL DEGISIKLIK\n')
    const r = a.yerelOzgunKapisi(k, gecmis)
    expect(r.ok).toBe(false)
    expect(r.dosyalar).toEqual(['src/surum.ts (içerik değişmiş)'])
  })

  it('izlenen dosyanın ESKİ bir sürümü (geçmişteki başka blob) ve CRLF çalışma kopyası özgün DEĞİLDİR', () => {
    const k = path.join(gecici, 'eski-ve-crlf')
    yaz(k, 'src/a.ts')
    yaz(k, 'src/surum.ts', 'v1\nsatir\n') // eski commit'teki içerik
    yaz(k, 'docs/not.md', 'x')
    const r1 = a.yerelOzgunKapisi(k, gecmis)
    expect(r1.ok).toBe(true)
    yaz(k, 'src/surum.ts', 'v2\r\nsatir\r\n') // Windows autocrlf çalışma kopyası
    const r2 = a.yerelOzgunKapisi(k, gecmis)
    expect(r2.ok).toBe(true)
  })

  it('derleme klasörleri yalnız KÖKTE atlanır: iç içe coverage/ özgün dosya sayılır; node_modules içi hiç sayılmaz', () => {
    const k = path.join(gecici, 'ic')
    yaz(k, 'src/a.ts')
    yaz(k, 'src/coverage/elle-yazilan.md')
    yaz(k, 'src/node_modules/z/i.js')
    const r = a.yerelOzgunDosyalar(k, gecmis)
    expect(r.dosyalar).toEqual(['src/coverage/elle-yazilan.md'])
  })

  it('bağlantıya GİRİLMEZ: dışa giden bağlantı tek girdi sayılır, hedefin dosyaları listelenmez', () => {
    const k = path.join(gecici, 'baglantili')
    const dis = path.join(gecici, 'dis-hedef')
    yaz(dis, 'a.txt')
    yaz(dis, 'b.txt')
    yaz(k, 'src/a.ts')
    fs.symlinkSync(dis, path.join(k, 'dis'), 'junction')
    const r = a.yerelOzgunDosyalar(k, gecmis)
    expect(r.toplam).toBe(1)
    expect(r.dosyalar).toEqual(['dis'])
    expect(fs.existsSync(path.join(dis, 'a.txt'))).toBe(true)
  })

  it('FAIL-CLOSED: git geçmişi okunamazsa kümesi FIRLATIR (kapı açık sayılmaz); okunamayan klasör ATLANIR', () => {
    const depoDegil = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-depodegil-'))
    try {
      expect(() => a.gecmisKumesi(depoDegil)).toThrow()
    } finally {
      fs.rmSync(depoDegil, { recursive: true, force: true })
    }
    const r = a.yerelOzgunKapisi(path.join(gecici, 'hic-yok-klasor'), gecmis)
    expect(r.ok).toBe(false)
    expect(r.sebep).toMatch(/yapılamadı/)
  })

  it('BAĞLANTI: iki araç da kapıyı silme/bağlantı kaldırma adımlarından ÖNCE çağırır ve geçmiş okunamazsa 6 ile durur', () => {
    const artik = fs.readFileSync(path.join(KOK, 'tools', 'worktree-artik-sil.cjs'), 'utf8')
    const temizle = fs.readFileSync(path.join(KOK, 'tools', 'worktree-temizle.cjs'), 'utf8')
    const ai = artik.indexOf('yerelOzgunKapisi(yol, gecmis)')
    expect(ai).toBeGreaterThan(-1)
    expect(ai).toBeLessThan(artik.indexOf('const { girdi, baglantilar } = tara(yol)'))
    const ti = temizle.indexOf('yerelOzgunKapisi(yol, gecmis)')
    expect(ti).toBeGreaterThan(-1)
    expect(ti).toBeLessThan(temizle.indexOf('const baglantilar = tumBaglantilar(yol)'))
    for (const s of [artik, temizle]) expect(s).toMatch(/gecmisKumesi\(ana\)[\s\S]{0,400}process\.exit\(6\)/)
    // kapı, git worktree remove / robocopy'den önce olmalı
    expect(ti).toBeLessThan(temizle.indexOf("'worktree', 'remove'"))
    expect(ai).toBeLessThan(artik.indexOf("spawnSync('robocopy'"))
  })
})
