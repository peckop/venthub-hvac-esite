/**
 * INV-KANCA-KARTSIZ-EMIR-1 — OPS'un SendMessage emri kart numarası taşımıyorsa tek satır uyarı (ARC-79, v1: yalnız uyarı).
 *
 * Kanca: .claude/hooks/kartsiz-emir-uyarisi.cjs · sınıflama sezgiseldir, sınırı bu dosya sabitler.
 * Örnekler 12 Ekim 2026'daki gerçek OPS mesajlarından kısaltılmıştır.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kartsiz-emir-uyarisi.cjs')

interface Kanca {
  siniflandir: (metin: unknown) => 'kartli' | 'gonderen-degil' | 'emir-degil' | 'emir'
  UYARI: string
}
const k = gerek(KANCA) as Kanca

const EMIR = 'OPS emri (12 Ekim 14:02): WrongStack 1.1.0 ayakta; şimdi kullanmadığımız özellikleri devreye alıyoruz. Kartı kendi panonda bu turda aç ve numarayı bana dön.'
const KARTLI = 'OPS → ARAÇ: ARC-109 alındı; kapsam tablosu yarın 17:00. Başla.'
const ONAY = 'OPS → ARAÇ: #1886 okundu, uygun. 4 dosyanın tam farkını okudum; ritüelle birleştir.'
const BILGI = 'OPS → ARAÇ (denetçi notu): senin pencerenin kendi MCP süreçleri de canlıya bağlı; önce kapat, sonra yükselt.'
const BASKA_GONDEREN = 'ALTYAPI → OPS: yeni iş emri verdim, başla.'

describe('INV-KANCA-KARTSIZ-EMIR-1 · sınıflama', () => {
  it('kart numarasız OPS emri → emir (uyarılır)', () => {
    expect(k.siniflandir(EMIR)).toBe('emir')
    expect(k.siniflandir('OPS → ARAÇ: #1670 rebase et ve yaz.')).toBe('emir')
  })

  it('kart numarası geçen emir → kartli (sessiz); her departman öneki tanınır', () => {
    expect(k.siniflandir(KARTLI)).toBe('kartli')
    for (const no of ['URN-12', 'ALT-5', 'SEO-39', 'KTL-3', 'BLG-1', 'HRT-26', 'TSR-11', 'STS-2', 'OPS-114', 'REC-466', 'EDG-9']) {
      expect(k.siniflandir(`OPS → X: ${no} başla.`), no).toBe('kartli')
    }
  })

  it('onay / hüküm / bilgi mesajı emir sayılmaz (kapat, yükselt fiili geçse bile)', () => {
    expect(k.siniflandir(ONAY)).toBe('emir-degil')
    expect(k.siniflandir(BILGI)).toBe('emir-degil')
    expect(k.siniflandir('OPS → ARAÇ: KARAR 336 hüküm: haftalık olsun.')).toBe('emir-degil')
  })

  it('"OPS emri" açıkça yazıyorsa onay işareti geçse bile emirdir', () => {
    expect(k.siniflandir('OPS emri: önceki iş uygun, şimdi yenisini başla.')).toBe('emir')
  })

  it('OPS dışındaki gönderen ve metin olmayan girdi → uyarı yok', () => {
    expect(k.siniflandir(BASKA_GONDEREN)).toBe('gonderen-degil')
    expect(k.siniflandir(undefined)).toBe('emir-degil')
    expect(k.siniflandir({ type: 'shutdown_request' })).toBe('emir-degil')
    expect(k.siniflandir('')).toBe('emir-degil')
  })
})

describe('INV-KANCA-KARTSIZ-EMIR-1 · gerçek süreç', () => {
  const kos = (stdin: string) =>
    spawnSync(process.execPath, [KANCA], { input: stdin, encoding: 'utf8', timeout: 15_000, windowsHide: true })
  const mesaj = (message: unknown, tool = 'SendMessage') =>
    JSON.stringify({ tool_name: tool, tool_input: { to: 'ARAÇ', message, summary: 's' } })

  it('kartsız emir → stdout additionalContext, çıkış 0 (mesajı BLOKLAMAZ)', () => {
    const r = kos(mesaj(EMIR))
    expect(r.status).toBe(0)
    const c = JSON.parse(r.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(c.hookSpecificOutput.hookEventName).toBe('PreToolUse')
    expect(c.hookSpecificOutput.additionalContext).toBe(k.UYARI)
  })

  it('kartlı emir, onay, başka gönderen, başka araç → sessiz ve çıkış 0', () => {
    for (const s of [mesaj(KARTLI), mesaj(ONAY), mesaj(BASKA_GONDEREN), mesaj(EMIR, 'Bash')]) {
      const r = kos(s)
      expect(r).toMatchObject({ status: 0, stdout: '' })
    }
  })

  it('FAIL-OPEN: bozuk stdin, boş stdin, nesne mesaj → çıkış 0 ve sessiz', () => {
    for (const s of ['{bozuk', '', mesaj({ a: 1 })]) {
      expect(kos(s)).toMatchObject({ status: 0, stdout: '' })
    }
  })
})
