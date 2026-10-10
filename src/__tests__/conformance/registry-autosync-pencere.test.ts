import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-AUTOSYNC-PENCERE-1 · `registry-autosync.cjs` içindeki her alt süreç çağrısı `windowsHide: true` taşır
 * (REC-415, Ops 09-29).
 *
 * NİÇİN: betik SessionStart'ta KOPUK (detached, konsolsuz) başlatılır; içinden çalışan `git`/`node` yeni
 * konsol penceresi açabilir. `kopuk-baslat.cjs` çocuğa `--require gizli-konsol.cjs` verir ve bu yamalar
 * çağrıları kapsar; ama betik başka yoldan (elle, başka kanca) koşarsa o koruma yoktur. Açık `windowsHide`
 * ikinci savunma hattıdır.
 *
 * ⚠DÜRÜSTLÜK: bunun Recep'in gördüğü pencerelerin nedeni olduğu KANITLANMADI; olası nedendir. Birleşince
 * pencere sürerse süreç-doğum izleyicisiyle ölçülür.
 */

const KAYNAK = fs.readFileSync(path.resolve(__dirname, '../../../scripts/board/registry-autosync.cjs'), 'utf8')

/** `execFileSync(` ile başlayan çağrının kapanış parantezine kadar gövdesi (iç içe parantez sayılır). */
function cagriGovdeleri(kod: string): string[] {
  const sonuc: string[] = []
  let i = kod.indexOf('execFileSync(')
  while (i !== -1) {
    let derinlik = 0
    let j = i + 'execFileSync'.length
    for (; j < kod.length; j += 1) {
      if (kod[j] === '(') derinlik += 1
      if (kod[j] === ')') {
        derinlik -= 1
        if (derinlik === 0) break
      }
    }
    sonuc.push(kod.slice(i, j + 1))
    i = kod.indexOf('execFileSync(', j)
  }
  return sonuc
}

describe('INV-AUTOSYNC-PENCERE-1 · alt süreçler pencere açmaz', () => {
  const cagrilar = cagriGovdeleri(KAYNAK.replace(/(?<!:)\/\/.*$/gm, ''))

  it('betikte en az iki alt süreç çağrısı bulunur (kaynak değişirse test sessizce boşa geçmesin)', () => {
    expect(cagrilar.length).toBeGreaterThanOrEqual(2)
  })

  it('her execFileSync çağrısı windowsHide: true taşır', () => {
    for (const c of cagrilar) expect(c).toMatch(/windowsHide:\s*true/)
  })

  it('kaynakta kabuk açan çağrı (exec/execSync/spawn shell) yoktur', () => {
    const temiz = KAYNAK.replace(/(?<!:)\/\/.*$/gm, '')
    expect(temiz).not.toMatch(/\bexecSync\(/)
    expect(temiz).not.toMatch(/shell:\s*true/)
  })
})
