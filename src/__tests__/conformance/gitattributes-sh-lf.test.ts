import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SH-LF-1 · kabuk betikleri (`*.sh`) çalışma kopyasında LF yazılır (ARC-96, 2026-10-12).
 *
 * Kök sebep: `.gitattributes` `* text=auto` + Windows `core.autocrlf` → .sh dosyaları çalışma ağacına CRLF düşer;
 * bash her satırın sonundaki `\r`'yi komuta katar ve `scripts/ci/__tests__/arka-plan.test.ts` Windows'ta düşer,
 * Linux CI yeşil kalır. Bu kapı, kuralın kendisini ölçer: izlenen her .sh için `git check-attr eol` = `lf`.
 * (Çalışma ağacındaki baytlara bakmaz: mevcut ağaçlar renormalize edilene kadar CRLF taşıyabilir; kuralın varlığı yeter.)
 */
const KOK = path.resolve(__dirname, '../../..')

function git(args: string[], girdi?: string) {
  return spawnSync('git', args, { cwd: KOK, encoding: 'utf8', input: girdi })
}

describe('INV-SH-LF-1: *.sh dosyaları eol=lf', () => {
  const liste = git(['ls-files', '-z', '--', '*.sh'])
  const dosyalar = String(liste.stdout)
    .split('\0')
    .filter((d) => d !== '')

  it('depoda izlenen .sh dosyası var (kapı boş çalışmıyor)', () => {
    expect(liste.status).toBe(0)
    expect(dosyalar.length).toBeGreaterThan(0)
  })

  it('izlenen her .sh için eol özniteliği lf', () => {
    const r = git(['check-attr', '-z', 'eol', '--stdin'], dosyalar.join('\0') + '\0')
    expect(r.status).toBe(0)
    // -z çıktısı: yol \0 öznitelik \0 değer \0 …
    const parcalar = String(r.stdout).split('\0')
    const yanlis: string[] = []
    for (let i = 0; i + 2 < parcalar.length; i += 3) {
      if (parcalar[i + 2] !== 'lf') yanlis.push(`${parcalar[i]} → ${parcalar[i + 2]}`)
    }
    expect(yanlis, `eol=lf olmayan .sh dosyaları (.gitattributes'e '*.sh text eol=lf' yaz): ${yanlis.join(', ')}`).toEqual([])
  })
})
