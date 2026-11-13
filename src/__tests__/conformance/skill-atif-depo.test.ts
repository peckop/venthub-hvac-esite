import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-ATIF-2 (ARC-306): GERÇEK depoda hiçbir SKILL.md kopuk `scripts/` atfı taşımaz.
 * Kapı: scripts/arac/skill-atif-kapisi.cjs (ARC-305; mantık ve sabotaj testi skill-atif-kapisi.test.ts).
 * Bu test onu CI'a bağlar: test-shard'larda her PR'da koşar (haritada kayıtsız test her zaman koşar), bu yüzden
 * skill dosyası değişince de kırmızı verir. Ölçülemezse (git yok) kapı fail-open uyarır ve geçer.
 * shortcut: kapının bilinen sessiz kaçışları (`:satır`, tek uçlu `**`) burada da geçerli; kapıyı sıkılaştırınca bu test de sıkılaşır.
 */
const KOK = path.resolve(__dirname, '../../..')
const { calistir } = createRequire(import.meta.url)(path.join(KOK, 'scripts/arac/skill-atif-kapisi.cjs')) as {
  calistir: (kok: string) => { kod: number; mesaj: string }
}

describe('INV-SKILL-ATIF-2 · gerçek depoda kopuk SKILL.md scripts/ atfı yok', () => {
  it('pozitif kontrol: kapının tarayacağı SKILL.md dosyaları var (git yoksa kapı fail-open geçer, bu test geçmesin)', () => {
    const izlenen = execFileSync('git', ['ls-files', '.claude/skills', '.agent/skills'], { cwd: KOK, encoding: 'utf8' })
    expect(izlenen.split('\n').filter((f) => f.endsWith('/SKILL.md')).length).toBeGreaterThan(50)
  })

  it('skill-atif-kapisi gerçek depoda temiz (kopuk atıf dosya:satır ile listelenir)', () => {
    const sonuc = calistir(KOK)
    expect(sonuc.mesaj, sonuc.mesaj).not.toMatch(/kopuk:|kontrol YAPILMADI/)
    expect(sonuc.kod).toBe(0)
  })
})
