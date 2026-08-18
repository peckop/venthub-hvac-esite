/**
 * INV-CATALOG-1 — katalog bütünlüğü kapısının KARAR mantığı.
 *
 * NİÇİN BÖYLE: kapının kendisi prod DB'ye bakar; ama "taban dışı yeni ihlalde kırmızı" kuralının
 * doğruluğu canlı veriye bağlı olamaz — canlı veri değişir, sınav deterministik kalmalı
 * (memory: deterministic-input-cannot-flake). Bu yüzden betiğin `--fixture` yolu sınanır:
 * ihlal kümesi dosyadan gelir, karar mantığı ve ÇIKIŞ KODU gerçek CLI sözleşmesiyle ölçülür.
 *
 * Ölçülen üç hâl:
 *   1. fikstür = taban            → 0 (yeşil)
 *   2. fikstür = taban + 1 yeni   → 1 (KIRMIZI)  ← kapının varlık sebebi
 *   3. fikstür = taban − 1        → 0 + bayat taban uyarısı (bilinçli karar; betiğin başlığında gerekçesi var)
 *
 * Ayrıca tabanın kendisi denetlenir: her satırın bir GEREKÇESİ olmalı. Gerekçesiz muafiyet,
 * kapıyı sessizce delen şeydir (memory: prove-the-gate-with-deliberate-failure).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

const SCRIPT = path.join(process.cwd(), 'scripts', 'db', 'checks', 'catalog-integrity.mjs')
const BASELINE = path.join(process.cwd(), 'scripts', 'db', 'checks', 'catalog-integrity-baseline.json')

function runWithFixture(keys: string[]): { status: number; output: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-integrity-'))
  const fixture = path.join(dir, 'fixture.json')
  fs.writeFileSync(fixture, JSON.stringify(keys))
  try {
    const res = spawnSync(process.execPath, [SCRIPT, '--fixture', fixture], { encoding: 'utf8' })
    return { status: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

function baselineKeys(): string[] {
  const parsed = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as { entries: Record<string, string> }
  return Object.keys(parsed.entries)
}

describe('INV-CATALOG-1 — katalog bütünlüğü kapısı', () => {
  it('betik ve taban dosyası mevcut', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true)
    expect(fs.existsSync(BASELINE)).toBe(true)
    expect(baselineKeys().length).toBeGreaterThan(0)
  })

  it('taban ile birebir aynı ihlal kümesi YEŞİL (çıkış 0)', () => {
    const { status, output } = runWithFixture(baselineKeys())
    expect(status).toBe(0)
    expect(output).toContain('YENI ihlal yok')
  })

  it('tabanın DIŞINDA tek bir yeni ihlal KIRMIZI yapar (çıkış 1)', () => {
    const { status, output } = runWithFixture([...baselineKeys(), 'dup-name:Sinav Ailesi|Sinav Urunu'])
    expect(status).toBe(1)
    expect(output).toContain('TABANIN DISINDA YENI IHLAL VAR')
    expect(output).toContain('dup-name:Sinav Ailesi|Sinav Urunu')
  })

  it('taban satırı artık ihlal değilse UYARIR ama kırmızı yapmaz', () => {
    const keys = baselineKeys()
    const { status, output } = runWithFixture(keys.slice(1))
    expect(status).toBe(0)
    expect(output).toContain('Bayat taban satiri')
    expect(output).toContain(keys[0])
  })

  it('her taban satırının gerekçesi var (gerekçesiz muafiyet YASAK)', () => {
    const parsed = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as { entries: Record<string, string> }
    for (const [key, reason] of Object.entries(parsed.entries)) {
      expect(typeof reason, `${key} gerekçesi metin olmalı`).toBe('string')
      expect(reason.trim().length, `${key} gerekçesiz`).toBeGreaterThan(20)
      expect(reason, `${key} bir T099 bulgusuna atıf yapmalı`).toMatch(/T099/)
    }
  })

  it('kapı, doğrulanmamış TLS ile prod DB\'ye bağlanmaz', () => {
    // Yorumlar SIYRILIR: betiğin başlığı "eski betikler rejectUnauthorized: false kullanıyor"
    // diye ANLATIYOR; yorumu tarayan bir iddia bunu KOD sanır ve yanlış kırmızı verir
    // (memory: conformance-test-static-scan-gotchas). CRLF de sıyırıcıyı bozmamalı.
    const source = fs
      .readFileSync(SCRIPT, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    expect(/rejectUnauthorized:\s*false/.test(source)).toBe(false)
    expect(/rejectUnauthorized:\s*true/.test(source)).toBe(true)
  })
})
