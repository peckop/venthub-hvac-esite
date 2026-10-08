import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { adimGovdesi, type AdimSonucu, BASH, govdeKos, ileri, sonDeger, temizle, temizOrtam } from './ci-test-secimi.yardimci'

/**
 * INV-CI-SECIM-2 (hızlı yol) · belge hızlı yolunun DAVRANIŞI (ALT-38e, cetvel: docs/standards/test-karnesi-standard.md §4.3). Bağ (ci.yml metni): ci-test-secimi.test.ts (INV-CI-SECIM-1).
 * `Hızlı yol` adımının GERÇEK `run` gövdesi (ci.yml'den çıkarılır) gerçek bash ve gerçek git ile koşar: yalnız .md/.txt/.csv farkında `belge=true` yazar (Türkçe adlı dosya dahil);
 * kod/JSON/.cjs/.ts farkında, silinen-taşınan koddan gelen farkta, boş farkta ve git hatasında YAZMAZ (her kapı koşar). bash yoksa (Git Bash'siz Windows) atlanır; CI'da (ubuntu) her zaman koşar.
 */

describe.skipIf(BASH === null)('INV-CI-SECIM-2 (hızlı yol) · gövde gerçek git ile: YALNIZ .md/.txt/.csv farkında `belge=true`', () => {
  const HIZLI = adimGovdesi('ci', 'Hızlı yol (yalnız .md/.txt/.csv belgesi; kod kapıları atlanır)')
  const kos = (taban: Record<string, string>, fark: Record<string, string | null>): AdimSonucu => govdeKos(HIZLI, { taban, fark })
  const ZAMAN = 60_000
  const TABAN = { 'src/a.ts': 'export {}\n', 'docs/eski.md': 'e\n', 'docs/veri.json': '{}\n', '.claude/hooks/x.cjs': '1\n' }

  it('gövde ci.yml’den okundu', () => {
    expect(HIZLI).toContain('git diff --quiet --no-renames HEAD^1 HEAD')
  })

  const EVET: Array<[string, Record<string, string | null>]> = [
    ['yalnız bir .md', { 'docs/a.md': 'x\n' }],
    ['kök README ve .md birlikte', { 'README.md': 'degisti\n', 'docs/standards/b.md': 'y\n' }],
    ['.txt ve .csv', { 'docs/notlar.txt': 't\n', 'docs/audits/olcum.csv': 'a,b\n' }],
    ['Türkçe ve boşluklu dosya adı', { 'docs/Ölçüm raporu — Ekim.md': 'ö\n' }],
    ['.claude altında .md ve .txt', { '.claude/skills/x/NOT.md': 'n\n', '.claude/notlar.txt': 'n\n' }],
    ['silinen .md', { 'docs/eski.md': null }],
    ['.md uzantılı ama adında nokta çok olan dosya', { 'docs/a.b.c.md': 'z\n' }],
  ]
  it.each(EVET)('belge=true: %s', (_ad, fark) => {
    const s = kos(TABAN, fark)
    try {
      expect(s.cikis).toBe(0)
      expect(sonDeger(s.cikti, 'belge')).toBe('true')
      expect(s.cikti).toBe('belge=true\n')
      expect(s.ekran).toContain('::notice::hızlı yol: belge')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  const HAYIR: Array<[string, Record<string, string | null>]> = [
    ['.md + .cjs (eslint . onu tarar)', { 'docs/a.md': 'x\n', '.claude/hooks/x.cjs': '2\n' }],
    ['yalnız .cjs', { '.claude/hooks/yeni.cjs': '1\n' }],
    ['.mjs', { 'docs/araclar/y.mjs': 'export {}\n' }],
    ['.ts (tsc girdisi)', { 'docs/yeni.ts': 'export {}\n' }],
    ['.tsx', { 'docs/yeni.tsx': 'export {}\n' }],
    ['.json (test içe aktarabilir: tip denetimini değiştirir)', { 'docs/veri.json': '{"a":1}\n' }],
    ['.py ve .sh', { 'docs/a.py': 'x\n', 'docs/b.sh': 'x\n' }],
    ['.yaml', { 'docs/a.yaml': 'a: 1\n' }],
    ['uzantısız dosya', { 'docs/Makefile': 'x\n' }],
    ['.md.cjs (uzantı son ekten okunur)', { 'docs/a.md.cjs': 'x\n' }],
    ['büyük harfli .MD (Linux’ta farklı dosya türü: temkinli)', { 'docs/A.MD': 'x\n' }],
    ['site kodu', { 'src/a.ts': 'export const a = 1\n' }],
    ['.md + site kodu', { 'docs/a.md': 'x\n', 'src/a.ts': 'export const a = 1\n' }],
    ['kod dosyası silinir, aynı yola .md eklenir (taşıma numarası: eski yol kod)', { 'src/a.ts': null, 'docs/a.md': 'x\n' }],
    ['silinen .cjs', { '.claude/hooks/x.cjs': null }],
    ['paket ve kilit dosyası', { 'package.json': '{}\n' }],
    ['iş akışı', { '.github/workflows/ci.yml': 'name: x\n' }],
  ]
  it.each(HAYIR)('çıktı YOK (tüm kapılar koşar): %s', (_ad, fark) => {
    const s = kos(TABAN, fark)
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('')
      expect(s.ekran).toContain('::notice::hızlı yol: yok')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('boş fark (PR commit’i HEAD^1 ile aynı ağaç): çıktı YOK (kanıtsız hızlı yol açılmaz)', () => {
    const s = govdeKos(HIZLI, { taban: TABAN, fark: {}, readmeDegis: false })
    try {
      expect(s.cikis).toBe(0)
      expect(s.cikti).toBe('')
      expect(s.ekran).toContain('::notice::hızlı yol: yok')
    } finally {
      temizle(s)
    }
  }, ZAMAN)

  it('git hatası (HEAD^1 yok: tek commitli depo) çıktı YAZMAZ ve adımı kırmızı yapmaz', () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'vh-secim-tek-'))
    const gecici = mkdtempSync(path.join(tmpdir(), 'vh-secim-tmp-'))
    try {
      for (const a of [['init', '-q'], ['config', 'user.email', 'x@y.z'], ['config', 'user.name', 'x'], ['config', 'commit.gpgsign', 'false']]) execFileSync('git', a, { cwd: repo, stdio: 'pipe' })
      writeFileSync(path.join(repo, 'a.md'), 'x\n')
      execFileSync('git', ['add', '-A'], { cwd: repo, stdio: 'pipe' })
      execFileSync('git', ['commit', '-q', '-m', 'tek'], { cwd: repo, stdio: 'pipe' })
      const ciktiDosyasi = path.join(gecici, 'github_output')
      writeFileSync(ciktiDosyasi, '')
      const r = spawnSync(BASH as string, ['-eo', 'pipefail', '-c', HIZLI], { cwd: repo, encoding: 'utf8', env: temizOrtam({ GITHUB_OUTPUT: ileri(ciktiDosyasi) }) })
      expect(r.status).toBe(0)
      expect(readFileSync(ciktiDosyasi, 'utf8')).toBe('')
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(gecici, { recursive: true, force: true })
    }
  }, ZAMAN)
})
