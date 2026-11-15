import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-SAAT-1 (ARC-102 kapı 1): her mesajda gerçek İstanbul saati satırı çıkar; vana kapatınca çıkmaz.
 * Ölçüt: satırdaki dakika, testin kendi saatinden en çok 1 dakika uzak (zaman.cjs'in kendi çıktısıyla değil,
 * bağımsız Intl hesabıyla karşılaştırılır).
 */
const KANCA = path.resolve(__dirname, '../../../.claude/hooks/defter-tazelik-satiri.cjs')

function kos(env: Record<string, string | undefined>): string {
  const r = spawnSync('node', [KANCA], { input: '{}', encoding: 'utf8', env: { ...process.env, ...env }, timeout: 20_000 })
  return r.stdout
}

function istanbulDakika(an: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(an).map(x => [x.type, x.value]))
  return Number(p.hour) * 60 + Number(p.minute)
}

describe('INV-KANCA-SAAT-1 · SAAT satırı', () => {
  it('satır var ve gerçek İstanbul saatinden en çok 1 dakika uzak', () => {
    const once = istanbulDakika(new Date())
    const cikti = kos({ VENTHUB_SAAT_SATIRI_KAPAT: undefined })
    const sonra = istanbulDakika(new Date())
    const m = /^SAAT: .* (\d{2}):(\d{2}) TSİ/m.exec(cikti)
    expect(m).not.toBeNull()
    const dk = Number(m![1]) * 60 + Number(m![2])
    // gün sınırı (23:59 → 00:00) tolerans: mod 1440 uzaklığı
    const uzak = (a: number, b: number) => Math.min(Math.abs(a - b), 1440 - Math.abs(a - b))
    expect(Math.min(uzak(dk, once), uzak(dk, sonra))).toBeLessThanOrEqual(1)
  })

  it('SABOTAJ: vana kapalıyken satır çıkmaz', () => {
    expect(kos({ VENTHUB_SAAT_SATIRI_KAPAT: '1' })).not.toContain('SAAT:')
  })
})
