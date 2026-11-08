/**
 * INV-DIZIN-ACILIS-KANCA-1 — GEO-SEO açılış kancası (ARC-282, SEO-98 b): yalnız geo-seo-pencere'de tek satır basar, diğer pencereler sessiz,
 * her hatada çıkış 0. İçerik testleri scripts/seo/__tests__/dizin-acilis.test.ts'te (INV-DIZIN-ACILIS-1).
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'dizin-acilis.cjs')
interface Modul {
  calis: (stdin: string, ortam?: Record<string, string>, kos?: () => string, pencere?: unknown) => string
  AZAMI: number
}
const m = gerek(KANCA) as Modul

const pencere = (agent: string) => ({ agentAdi: () => agent })
const SATIR = 'DİZİN 2026-11-09: YAP/TEKRAR Google 13, Bing 1, IndexNow 2 — önce bunlar'

describe('INV-DIZIN-ACILIS-KANCA-1 · pencere tanıma ve sessizlik', () => {
  it('geo-seo-pencere: betiğin ilk dolu satırını basar; çok satırlı çıktıdan yalnız ilki, uzun satır kırpılır', () => {
    expect(m.calis('{}', {}, () => SATIR + '\n', pencere('geo-seo-pencere'))).toBe(SATIR)
    expect(m.calis('{}', {}, () => '\n  \n' + SATIR + '\nikinci satır', pencere('geo-seo-pencere'))).toBe(SATIR)
    const uzun = m.calis('{}', {}, () => 'x'.repeat(2000), pencere('geo-seo-pencere'))
    expect(uzun.length).toBe(m.AZAMI)
  })

  it('⛔ başka pencere SESSİZ ve betik HİÇ koşmaz (arka plan ölçümü boşuna başlamasın)', () => {
    let kosuldu = 0
    const kos = () => {
      kosuldu += 1
      return SATIR
    }
    for (const a of ['ops-pencere', 'arac-pencere', 'blog-pencere', '']) expect(m.calis('{}', {}, kos, pencere(a))).toBe('')
    expect(kosuldu).toBe(0)
  })

  it('vana ve hata yolları: vana sessiz; betik hata fırlatırsa ya da boş dönerse çökmez/sessiz; bozuk stdin çökmez', () => {
    expect(m.calis('{}', { VENTHUB_DIZIN_ACILIS_KAPAT: '1' }, () => SATIR, pencere('geo-seo-pencere'))).toBe('')
    expect(m.calis('{}', {}, () => '', pencere('geo-seo-pencere'))).toBe('')
    expect(
      m.calis('{}', {}, () => {
        throw new Error('betik çöktü')
      }, pencere('geo-seo-pencere')),
    ).toBe('')
    expect(m.calis('bozuk{', {}, () => SATIR, pencere('geo-seo-pencere'))).toBe(SATIR)
  })
})

describe('INV-DIZIN-ACILIS-KANCA-1 · süreç olarak', () => {
  it('çıkış kodu hep 0: bozuk girdi, başka pencere, vana; betik ve kayıt dosyası mevcut', () => {
    const env = { ...process.env, VENTHUB_PENCERE_AGENT: 'ops-pencere' }
    for (const girdi of ['bozuk{', '{}', '', JSON.stringify({ agent_type: 'blog-pencere' })]) {
      const r = spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', env })
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
    const vana = spawnSync(process.execPath, [KANCA], { input: '{}', encoding: 'utf8', env: { ...env, VENTHUB_PENCERE_AGENT: 'geo-seo-pencere', VENTHUB_DIZIN_ACILIS_KAPAT: '1' } })
    expect(vana.status).toBe(0)
    expect(vana.stdout).toBe('')
    expect(readFileSync(path.join(KOK, 'scripts', 'seo', 'dizin-acilis.mjs'), 'utf8')).toContain('VENTHUB_DIZIN_ACILIS_KAPAT')
  })
})
