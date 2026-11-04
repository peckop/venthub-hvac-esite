// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-OLCUM-SATIRI-1 · emirde "ÖNCEKİ ÖLÇÜM:" satırı yoksa uyarı (ARC-121). Bloklamaz; kısa durum mesajlarına dokunmaz.
 * Sabotaj kolu: satır eklenince uyarı susar; emir kalıbı olmayan metinde hiç çıkmaz (kapı gerçekten ayırt ediyor).
 */

const require_ = createRequire(import.meta.url)
const KANCA = path.resolve(__dirname, '..', '..', '..', '.claude', 'hooks', 'olcum-satiri-uyarisi.cjs')
const { uyari } = require_(KANCA) as { uyari: (m: string) => string | null }

const EMIR =
  'Salt-okuma görev. KAYNAK/CETVEL: catalog-ingestion-standard.md\nYÖNTEM: elle\nGÖREV: katalog kaynak dizinindeki sayfa sayısını ölç ve rapor et; sonuçları tabloya yaz, çelişen sayıları işaretle.'

describe('INV-OLCUM-SATIRI-1', () => {
  it('ölçüm isteyen emir, satır yoksa uyarılır', () => {
    expect(uyari(EMIR)).toContain('ÖLÇÜM SATIRI YOK')
    expect(uyari(EMIR)).toContain('onceki-calisma.cjs')
  })

  it('"ÖNCEKİ ÖLÇÜM:" satırı varsa susar', () => {
    expect(uyari(EMIR + '\nÖNCEKİ ÖLÇÜM: YOK (12 defter arandı)')).toBeNull()
    expect(uyari(EMIR + '\nönceki ölçüm: docs/audits/x-2026-11-01.md taze')).toBeNull()
  })

  it('kısa durum mesajı ve ölçüm istemeyen emir sessiz', () => {
    expect(uyari('ölçtüm, yeşil')).toBeNull()
    expect(uyari('KAYNAK/CETVEL: x\nYÖNTEM: elle\nGÖREV: ' + 'şu dosyayı yaz '.repeat(15))).toBeNull()
  })

  it('emir kalıbı olmayan uzun rapor sessiz (ölçtüm geçse bile)', () => {
    expect(uyari('Ölçüm sonucu: test 61/61 yeşil, sabotaj kolu kırmızı, rapor ekte. '.repeat(4))).toBeNull()
  })

  it('kanca süreci: uyarıyı additionalContext olarak basar, bozuk girdide sessiz çıkar 0', () => {
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ tool_name: 'Agent', tool_input: { prompt: EMIR } }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_OLCUM_UYARISI_KAPAT: '' },
    })
    expect(r.status).toBe(0)
    expect(JSON.parse(r.stdout).hookSpecificOutput.additionalContext).toContain('ÖLÇÜM SATIRI YOK')
    const s = spawnSync(process.execPath, [KANCA], { input: JSON.stringify({ tool_name: 'SendMessage', tool_input: { message: EMIR } }), encoding: 'utf8' })
    expect(JSON.parse(s.stdout).hookSpecificOutput.additionalContext).toContain('ÖLÇÜM SATIRI YOK')
    expect(spawnSync(process.execPath, [KANCA], { input: 'bozuk', encoding: 'utf8' }).status).toBe(0)
    const vana = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ tool_name: 'Agent', tool_input: { prompt: EMIR } }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_OLCUM_UYARISI_KAPAT: '1' },
    })
    expect(vana.stdout).toBe('')
  })
})
