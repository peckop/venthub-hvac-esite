import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// INV-ZAMAN-1 (ARC-302): gün adı tahmin edilmez, komut Europe/Istanbul'a göre basar (makine saat dilimine bağlı değil).
const KOK = process.cwd()
const BETIK = path.resolve(KOK, 'scripts', 'arac', 'zaman.cjs')
const mod = createRequire(import.meta.url)(BETIK) as { zamanSatiri: (an: Date) => string; isoHafta: (y: number, a: number, g: number) => number }

describe('INV-ZAMAN-1 · zaman komutu', () => {
  it('13 Kasım 2026 12:05 UTC = Cuma 15:05 TSİ, ISO hafta 46', () => {
    expect(mod.zamanSatiri(new Date('2026-11-13T12:05:00Z'))).toBe('Cuma 13 Kasım 2026 15:05 TSİ (ISO hafta 46)')
  })

  it('UTC ile TSİ günü ayrıştığında TSİ günü basar (22:30 UTC Perşembe = Cuma 01:30 TSİ)', () => {
    expect(mod.zamanSatiri(new Date('2026-11-12T22:30:00Z'))).toBe('Cuma 13 Kasım 2026 01:30 TSİ (ISO hafta 46)')
  })

  it('yıl sınırı: ISO hafta 53 ve 1 doğru (31 Aralık 2026 Perşembe = hafta 53; 4 Ocak 2027 Pazartesi = hafta 1)', () => {
    expect(mod.isoHafta(2026, 12, 31)).toBe(53)
    expect(mod.isoHafta(2027, 1, 4)).toBe(1)
    expect(mod.isoHafta(2027, 1, 3)).toBe(53)
    expect(mod.isoHafta(2027, 1, 1)).toBe(53)
  })

  it('CLI: --an verilince tek satır basar, geçersiz an çıkış 2', () => {
    const iyi = spawnSync(process.execPath, [BETIK, '--an', '2026-11-13T12:05:00Z'], { encoding: 'utf8' })
    expect(iyi.status).toBe(0)
    expect(iyi.stdout).toBe('Cuma 13 Kasım 2026 15:05 TSİ (ISO hafta 46)\n')
    const kotu = spawnSync(process.execPath, [BETIK, '--an', 'dun'], { encoding: 'utf8' })
    expect(kotu.status).toBe(2)
    expect(kotu.stderr).toContain('geçersiz an')
  })

  describe('SABOTAJ: betiğe konan her hata en az bir senaryoyu kırar', () => {
    const SABOTAJLAR: Array<[string, string, string]> = [
      ['saat dilimi UTC olur', "timeZone: 'Europe/Istanbul',\n  weekday", "timeZone: 'UTC',\n  weekday"],
      ['hafta hesabı perşembe düzeltmesi kalkar', 'd.getUTCDate() + 4 - (d.getUTCDay() || 7)', 'd.getUTCDate()'],
      ['gün adı küçük harf kalır', 'parcalar.weekday.charAt(0).toLocaleUpperCase', 'parcalar.weekday.charAt(0).toLocaleLowerCase'],
    ]
    const KAYNAK = fs.readFileSync(BETIK, 'utf8')
    it.each(SABOTAJLAR)('%s', (ad, eski, yeni) => {
      expect(KAYNAK.split(eski).length, `sabotaj noktası kaynakta TAM BİR KEZ olmalı: ${eski}`).toBe(2)
      const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'zaman-sabotaj-'))
      try {
        const yol = path.join(dizin, 'zaman.cjs')
        fs.writeFileSync(yol, KAYNAK.replace(eski, yeni), 'utf8')
        const m = createRequire(import.meta.url)(yol) as typeof mod
        const kirik = [
          () => m.zamanSatiri(new Date('2026-11-13T12:05:00Z')) !== 'Cuma 13 Kasım 2026 15:05 TSİ (ISO hafta 46)',
          () => m.zamanSatiri(new Date('2026-11-12T22:30:00Z')) !== 'Cuma 13 Kasım 2026 01:30 TSİ (ISO hafta 46)',
          () => m.isoHafta(2026, 12, 31) !== 53 || m.isoHafta(2027, 1, 1) !== 53,
        ].some((f) => {
          try {
            return f()
          } catch {
            return true
          }
        })
        expect(kirik, `sabotaj HİÇBİR senaryoyu kırmadı: ${ad}`).toBe(true)
      } finally {
        fs.rmSync(dizin, { recursive: true, force: true })
      }
    })
  })
})
