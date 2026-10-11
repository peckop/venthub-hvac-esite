import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-PYTHON-YEDEK-1 · Skill metinleri yorumlayıcıyı KOŞULSUZ `python3` diye atamaz (YTN-9).
 *
 * ÖLÇÜLEN KUSUR: graphify SKILL.md'nin yorumlayıcı bulma yedeği `PYTHON="python3"` idi. Bu makinede
 * (Windows) `python3` çoğu zaman Microsoft Store taklidi; yedeğe düşülünce komut çalışmıyor ve
 * ardındaki her `"$PYTHON" -c ...` adımı sessizce kırılıyor.
 *
 * İKİNCİ KUSUR (OPS itirazı, ARC-14): `python3`'ü sınamak bile onu ÇAĞIRIR; bu makinede çağrı
 * Microsoft Store sayfasını Recep'in ekranında açıyor. Bu yüzden önce `python` sınanır, `python3`
 * yalnız `python` çalışmazsa denenir.
 *
 * KURAL: `PYTHON="python3"` ataması yalnız aynı satırda, ÖNCE `python -c` sonra `python3 -c` ile
 * sınanarak yapılır
 * (`if python -c ...; then PYTHON="python"; elif python3 -c ...; then PYTHON="python3"; else PYTHON="python"; fi`).
 *
 * KAPSAM: yalnız `.claude/skills` altındaki .md metinleri. `.agent/skills` ayrı ağaçtır ve bu işin
 * dışındadır. `.py` kabuk satırları (`#!/usr/bin/env python3`) ve "python ya da python3" gibi düz
 * anlatımlar doğrudur; kapı yalnız KOŞULSUZ ATAMAYI arar.
 *
 * Cetvel: yok (küçük düzeltme); skill yazım kuralları `docs/roller/YETENEK-kurallar.md`.
 */

const KOK = path.resolve(__dirname, '../../../.claude/skills')
const ATAMA = /PYTHON="python3"/
const SINAMA = /python -c .*python3 -c .*PYTHON="python3"/

function mdDosyalari(dizin: string): string[] {
  const out: string[] = []
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const yol = path.join(dizin, g.name)
    if (g.isDirectory()) out.push(...mdDosyalari(yol))
    else if (g.name.endsWith('.md')) out.push(yol)
  }
  return out
}

describe('INV-SKILL-PYTHON-YEDEK-1 · koşulsuz PYTHON="python3" ataması yok', () => {
  const dosyalar = mdDosyalari(KOK)

  it('.claude/skills altında metin dosyası taranıyor (boş tarama yeşil sayılmaz)', () => {
    expect(dosyalar.length).toBeGreaterThan(50)
  })

  it('her PYTHON="python3" ataması aynı satırda önce python -c, sonra python3 -c ile sınanıyor', () => {
    const ihlal: string[] = []
    for (const yol of dosyalar) {
      fs.readFileSync(yol, 'utf8')
        .split(/\r?\n/)
        .forEach((satir, i) => {
          if (ATAMA.test(satir) && !SINAMA.test(satir)) {
            ihlal.push(`${path.relative(KOK, yol)}:${i + 1}  ${satir.trim()}`)
          }
        })
    }
    expect(ihlal, `koşulsuz python3 ataması:\n${ihlal.join('\n')}`).toEqual([])
  })

  it('graphify yedeği önce python dener, ikisi de yoksa python\'a düşer; python3 sınaması python\'dan önce gelmez', () => {
    const metin = fs.readFileSync(path.join(KOK, 'graphify/SKILL.md'), 'utf8')
    expect(metin).toMatch(/PYTHON="python"; elif python3 -c "import sys" 2>\/dev\/null; then PYTHON="python3"; else PYTHON="python"/)
    for (const satir of metin.split(/\r?\n/)) {
      if (/python3 -c /.test(satir)) {
        expect(satir.indexOf('python -c '), satir).toBeGreaterThanOrEqual(0)
        expect(satir.indexOf('python -c '), satir).toBeLessThan(satir.indexOf('python3 -c '))
      }
    }
  })
})
