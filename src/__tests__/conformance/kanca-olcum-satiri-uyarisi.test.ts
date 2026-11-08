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
const { uyari, adaylar } = require_(KANCA) as {
  uyari: (m: string) => string | null
  adaylar: (m: string, calistir?: (m: string) => string) => string | null
}

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

  it('ARC-275 adaylar: emir kalıbında BULUNDU satırları bağlam olur; sabotaj kolları sessiz', () => {
    const cikti = 'ÖNCEKİ ÇALIŞMA: BULUNDU 3 — kart KTL-84 [Done]\nÖNCEKİ ÖLÇÜM: BULUNDU 2 — docs/olcum/pim-unopim.md (2026-11-04, taze)\n  git : x'
    const a = adaylar(EMIR, () => cikti)
    expect(a).toContain('docs/olcum/pim-unopim.md')
    expect(a).toContain('KTL-84')
    expect(a).not.toContain('git : x')
    // kısa mesaj ve emir kalıbı olmayan metinde koşucu hiç çağrılmaz
    let cagri = 0
    const sayac = () => (cagri++, cikti)
    expect(adaylar('ölçtüm, yeşil', sayac)).toBeNull()
    expect(adaylar('Ölçüm sonucu: test 61/61 yeşil, sabotaj kolu kırmızı, rapor ekte. '.repeat(4), sayac)).toBeNull()
    expect(cagri).toBe(0)
    // YOK/boş çıktı ve fırlatan koşucu: fail-open
    expect(adaylar(EMIR, () => 'ÖNCEKİ ÇALIŞMA: YOK\nÖNCEKİ ÖLÇÜM: YOK (3 defter)')).toBeNull()
    expect(adaylar(EMIR, () => { throw new Error('zaman aşımı') })).toBeNull()
    // tavan
    expect((adaylar(EMIR, () => 'ÖNCEKİ ÖLÇÜM: BULUNDU ' + 'x'.repeat(5000)) ?? '').length).toBeLessThanOrEqual(1200)
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
