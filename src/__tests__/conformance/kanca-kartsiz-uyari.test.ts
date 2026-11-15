// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-KANCA-KARTSIZ-UYARI-1 (ARC-329, OPS-292): iki uyarı kancasının yanlış alarm ve yineleme düzeltmesi (kapı gevşetmez, yalnız uyarı).
 * - olcum-satiri-uyarisi: ÖNCEKİ ÇALIŞMA satırındaki "ölçüldü" ölçüm isteği sayılmaz; "defter: ölçüldü/ölçülmedi" kayıt sayılır;
 *   aynı metin oturumda bir kez uyarılır.
 * - kartsiz-emir-uyarisi: aynı mesaj oturumda bir kez uyarılır, farklı mesaj yine uyarılır.
 */

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const HOOKS = path.join(KOK, '.claude', 'hooks')
const olcum = gerek(path.join(HOOKS, 'olcum-satiri-uyarisi.cjs')) as { uyari: (m: string) => string | null }

const PANO = fs.mkdtempSync(path.join(os.tmpdir(), 'kartsiz-uyari-'))
afterAll(() => fs.rmSync(PANO, { recursive: true, force: true }))

function kosGirdi(kanca: string, girdi: object): string {
  const r = spawnSync(process.execPath, [path.join(HOOKS, kanca)], {
    input: JSON.stringify(girdi),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: PANO, VENTHUB_BIR_KEZ_KAPAT: '', VITEST: '' },
  })
  expect(r.status).toBe(0)
  return r.stdout
}

describe('INV-KANCA-KARTSIZ-UYARI-1 · olcum-satiri-uyarisi', () => {
  const GOVDE = 'KAYNAK/CETVEL: is-kayit-duzeni-standard.md\nYÖNTEM: elle; kanca düzeltmesi\nGÖREV: kancayı düzelt, testini yaz ve PR aç; ayrıntı karta yazılı, sonuç raporda.\n'

  it('ÖNCEKİ ÇALIŞMA satırındaki "ölçüldü" ölçüm isteği sayılmaz (iş emri sessiz)', () => {
    const emir = GOVDE + 'ÖNCEKİ ÇALIŞMA: Kanban ARC-324 (kayıt türü ölçüldü, tablo audits altında)\n'
    expect(olcum.uyari(emir)).toBeNull()
  })

  it('gerçek ölçüm emri, satır yoksa hâlâ uyarılır', () => {
    expect(olcum.uyari(GOVDE + 'GÖREV: katalogdaki sayfa sayısını ölç ve tabloya yaz.\n')).toContain('ÖLÇÜM SATIRI YOK')
  })

  it('"defter: ölçülmedi" satırı kayıt sayılır (uyarı susar)', () => {
    expect(olcum.uyari(GOVDE + 'GÖREV: sayıyı ölç.\nÖNCEKİ ÇALIŞMA: yok; defter: ölçülmedi\n')).toBeNull()
  })

  it('süreç: aynı emir oturumda bir kez uyarılır, farklı emir yeniden', () => {
    const ayni = { tool_name: 'SendMessage', session_id: 'olcum1234', tool_input: { message: GOVDE + 'GÖREV: sayfa sayısını ölç ve rapor et.\n' } }
    expect(kosGirdi('olcum-satiri-uyarisi.cjs', ayni)).toContain('ÖLÇÜM SATIRI YOK')
    expect(kosGirdi('olcum-satiri-uyarisi.cjs', ayni)).not.toContain('ÖLÇÜM SATIRI YOK')
    const baska = { ...ayni, tool_input: { message: GOVDE + 'GÖREV: ürün sayısını ölç ve rapor et.\n' } }
    expect(kosGirdi('olcum-satiri-uyarisi.cjs', baska)).toContain('ÖLÇÜM SATIRI YOK')
  })
})

describe('INV-KANCA-KARTSIZ-UYARI-1 · kartsiz-emir-uyarisi', () => {
  const emir = (m: string, sid = 'emir12345') => ({ tool_name: 'SendMessage', session_id: sid, tool_input: { message: m } })

  it('aynı mesaj aynı oturumda bir kez uyarılır; farklı mesaj ve farklı oturum yeniden', () => {
    const a = 'OPS emri: şu kanca düzeltmesini bu turda yap ve numarayı dön.'
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', emir(a))).toContain('KARTSIZ EMİR')
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', emir(a))).not.toContain('KARTSIZ EMİR')
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', emir('OPS emri: başka bir iş yaz ve dön.'))).toContain('KARTSIZ EMİR')
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', emir(a, 'baska9999'))).toContain('KARTSIZ EMİR')
  })

  it('fail-open: oturum kimliği yoksa her seferinde uyarır (süzme sustururmaz)', () => {
    const a = 'OPS emri: kimliksiz mesaj, düzelt ve dön.'
    const g = { tool_name: 'SendMessage', tool_input: { message: a } }
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', g)).toContain('KARTSIZ EMİR')
    expect(kosGirdi('kartsiz-emir-uyarisi.cjs', g)).toContain('KARTSIZ EMİR')
  })
})

describe('INV-KANCA-KARTSIZ-UYARI-1 · bağlantı denetimi', () => {
  const oku = (f: string) => fs.readFileSync(path.join(HOOKS, f), 'utf8')
  it('iki kanca değişikliği kaynakta duruyor', () => {
    expect(oku('olcum-satiri-uyarisi.cjs')).toContain("basilsin('olcum-satiri-uyarisi'")
    expect(oku('kartsiz-emir-uyarisi.cjs')).toContain("basilsin('kartsiz-emir-uyarisi'")
  })
})
