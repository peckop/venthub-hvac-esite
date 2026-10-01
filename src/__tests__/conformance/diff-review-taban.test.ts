// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-DIFF-REVIEW-TABAN-1 · diff-review betiği commitlenmiş dalı da tarar ve ihlal çıktısında çökmez (REC-514).
 *
 * NİÇİN: `check_diff_rules.py` yalnız `git diff HEAD` çağırıyordu. Commitlenmiş bir dalda bu diff BOŞTUR;
 * betik "[OK] Degisiklik bulunamadi" deyip çıkış 0 veriyordu — yani PR incelemesinde her zaman yeşil.
 * İkinci kusur: ihlal bulununca kutu çizim karakteri basılıyordu; Windows'un eski kod sayfalarında
 * (cp1254 vb.) bu UnicodeEncodeError verir ve ihlal raporu yerine traceback çıkar.
 *
 * ALTI KOL, hepsi geçici bir git deposunda betiği GERÇEKTEN çalıştırır:
 * (a) commitli ihlal BULUNUR (çıkış 1) — eski betikte KIRMIZI olan ayırt edici kol;
 * (b) commitli temiz dal çıkış 0, taban ilk satırda yazılı;
 * (c) cp1254 çıktı kodlamasında + ASCII dışı satırla ihlal raporu traceback'siz basılır;
 * (d) taban çözülemezse sessiz yeşil YOK: açık uyarı satırı, commitlenmemiş ihlal yine bulunur;
 * (e) `--taban` açıkça verilir; çözülemeyen `--taban` çıkış 2 verir (yeşil değil).
 *
 * İHLAL ÖRNEĞİ çalışma anında birleştirilir: bu dosyaya düz yazılsaydı depodaki `any` yasağı kancası
 * test dosyasının kendisini de ihlal sayardı.
 *
 * ⛔SINIR: testin python'a ihtiyacı var (`python` ya da `python3`; ikisi de gerçekten çalıştırılarak
 * denenir, Windows'taki Store `python3` kısayolu çalışmadığı için elenir). İkisi de yoksa test KIRMIZI
 * verir, atlamaz: atlanan kapı kapı değildir.
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, '.claude/skills/diff-review/scripts/check_diff_rules.py')
const IHLAL_TIPI = ['an', 'y'].join('')

function pythonBul(): string | null {
  for (const ad of ['python', 'python3']) {
    const r = spawnSync(ad, ['--version'], { encoding: 'utf-8' })
    if (r.status === 0 && /Python 3\./.test(`${r.stdout}${r.stderr}`)) return ad
  }
  return null
}

const PY = pythonBul()

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync(
    'git',
    ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...args],
    { cwd, encoding: 'utf-8' },
  )
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.status}: ${r.stderr}`)
  return r.stdout
}

function betikCalistir(cwd: string, args: string[] = [], env: Record<string, string> = {}) {
  const r = spawnSync(PY as string, [BETIK, ...args], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...env },
  })
  return { cikis: r.status, cikti: `${r.stdout}${r.stderr}`, stdout: r.stdout, stderr: r.stderr }
}

function ihlalSatiri(ad: string, ek = ''): string {
  return `export const ${ad}: ${IHLAL_TIPI} = ${ek || '1'}\n`
}

let kok = ''

/** Geçici depo: tabanda temiz `a.ts` commit'i; `tabanDali` adlı dal tabandır. */
function depoKur(tabanDali: string): string {
  const d = fs.mkdtempSync(path.join(kok, 'depo-'))
  git(d, 'init', '-q', '-b', tabanDali)
  fs.writeFileSync(path.join(d, 'a.ts'), 'export const a: number = 1\n')
  git(d, 'add', '.')
  git(d, 'commit', '-q', '-m', 'taban')
  return d
}

function dalliCommit(d: string, dosya: string, icerik: string): void {
  git(d, 'checkout', '-q', '-b', 'ozellik')
  fs.writeFileSync(path.join(d, dosya), icerik)
  git(d, 'add', '.')
  git(d, 'commit', '-q', '-m', 'degisiklik')
}

beforeAll(() => {
  kok = fs.mkdtempSync(path.join(os.tmpdir(), 'diff-review-taban-'))
})

afterAll(() => {
  fs.rmSync(kok, { recursive: true, force: true })
})

describe('INV-DIFF-REVIEW-TABAN-1 · diff-review betiği', () => {
  it('python bulunabilir (python ya da python3)', () => {
    expect(PY, '`python` ve `python3` ikisi de çalışmadı: bu kapı python3 ister').not.toBeNull()
  })

  it('(a) commitlenmiş dalda eklenen ihlal BULUNUR, çıkış 1 (eski betikte boş dönüp 0 veriyordu)', () => {
    const d = depoKur('master')
    dalliCommit(d, 'b.ts', ihlalSatiri('b'))
    const r = betikCalistir(d)
    expect(r.cikti).toContain('[BLOCKER]')
    expect(r.cikti).toContain('b.ts')
    expect(r.cikis).toBe(1)
  })

  it('(b) commitlenmiş temiz dal: çıkış 0 ve hangi tabanın tarandığı çıktıda yazılı', () => {
    const d = depoKur('master')
    dalliCommit(d, 'c.ts', 'export const c: number = 3\n')
    const r = betikCalistir(d)
    expect(r.cikis).toBe(0)
    expect(r.cikti).toMatch(/Taban: master/)
    expect(r.cikti).not.toContain('[BLOCKER]')
  })

  it('(c) cp1254 çıktı kodlamasında ve ASCII dışı satırla ihlal raporu traceback olmadan basılır', () => {
    const d = depoKur('master')
    dalliCommit(d, 'd.ts', ihlalSatiri('d', "'日本語'"))
    const r = betikCalistir(d, [], { PYTHONIOENCODING: 'cp1254' })
    expect(r.stderr).not.toMatch(/Traceback|UnicodeEncodeError/)
    expect(r.stdout).toContain('[BLOCKER]')
    expect(r.cikis).toBe(1)
  })

  it('(d) taban çözülemezse sessiz yeşil yok: uyarı satırı basılır, commitlenmemiş ihlal yine bulunur', () => {
    const d = depoKur('trunk')
    fs.writeFileSync(path.join(d, 'a.ts'), ihlalSatiri('a'))
    const r = betikCalistir(d)
    expect(r.cikti).toContain('[UYARI] taban bulunamadi')
    expect(r.cikti).toContain('[BLOCKER]')
    expect(r.cikis).toBe(1)
  })

  it('(e) --taban ile açıkça verilen dal taban olur; çözülemeyen --taban çıkış 2 verir (yeşil değil)', () => {
    const d = depoKur('trunk')
    dalliCommit(d, 'e.ts', ihlalSatiri('e', '5'))
    const bulunan = betikCalistir(d, ['--taban', 'trunk'])
    expect(bulunan.cikti).toMatch(/Taban: trunk/)
    expect(bulunan.cikis).toBe(1)
    const yok = betikCalistir(d, ['--taban', 'olmayan-dal'])
    expect(yok.cikti).toContain('olmayan-dal')
    expect(yok.cikis).toBe(2)
  })
})
