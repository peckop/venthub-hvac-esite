/**
 * INV-KANCA-KART-NUMARA-1 — add_task sonrası bir sonraki kart numarası bağlama yazılır (ARC-325, OPS-292 DÜZELT).
 *
 * Kanca: .claude/hooks/kart-numara-bildirimi.cjs · çekirdek: scripts/board/siradaki-kart-no.cjs.
 * Kanca ASLA engellemez, panoya yazmaz, çıkış hep 0; add_task dışında panoyu hiç okumaz.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kart-numara-bildirimi.cjs')
const NO = path.join(KOK, 'scripts', 'board', 'siradaki-kart-no.cjs')

interface No {
  numaraCoz: (b: unknown) => { onek: string; sayi: number } | null
  siradaki: (b: string[], onek: string) => { onek: string; enBuyuk: number; siradaki: string; kartSayisi: number }
}
interface Kanca {
  satir: (g: unknown, b: string[] | null, no: No) => string | null
  ARAC_ADI: string
  VANA: string
}
const no = gerek(NO) as No
const k = gerek(KANCA) as Kanca

const BASLIKLAR = ['ARC-320 · kanca yükü', 'ARC-322 · matcher', 'ARC-19 · eski', 'OPS-300 · başka ön ek', 'ALT-38g · alt kart eki', 'REC-400 H1 · ek', 'başlıksız kart']
const YANIT = 'Task added.'
const girdi = (ek: Record<string, unknown> = {}, ti: Record<string, unknown> = {}) => ({
  tool_name: k.ARAC_ADI,
  session_id: 'abcdef12-0000',
  tool_input: { action: 'add_task', boardId: 'x', title: 'ARC-322 · matcher', ...ti },
  tool_response: YANIT,
  ...ek,
})

describe('INV-KANCA-KART-NUMARA-1 · numara çözümü ve sıradaki', () => {
  it('numaraCoz: saf ÖN-sayı; alt kart eki, numarasız ve boş girdi null', () => {
    expect(no.numaraCoz('ARC-322 · matcher')).toEqual({ onek: 'ARC', sayi: 322 })
    expect(no.numaraCoz('  arc-7: küçük harf')).toEqual({ onek: 'ARC', sayi: 7 })
    expect(no.numaraCoz('ALT-38g · alt kart eki')).toBeNull()
    expect(no.numaraCoz('başlıksız kart')).toBeNull()
    expect(no.numaraCoz(undefined)).toBeNull()
  })

  it('siradaki: yalnız o ön ekin en büyüğü + 1; başka ön ek ve alt kart eki sayılmaz', () => {
    expect(no.siradaki(BASLIKLAR, 'ARC')).toEqual({ onek: 'ARC', enBuyuk: 322, siradaki: 'ARC-323', kartSayisi: 3 })
    expect(no.siradaki(BASLIKLAR, 'OPS')).toMatchObject({ enBuyuk: 300, siradaki: 'OPS-301' })
    expect(no.siradaki(BASLIKLAR, 'ALT')).toMatchObject({ enBuyuk: 0, siradaki: 'ALT-1', kartSayisi: 0 })
    expect(no.siradaki([], 'arc')).toMatchObject({ siradaki: 'ARC-1' })
  })

  it('siradaki: büyük sayı küçük sayıdan sonra gelse de en büyük seçilir (sıra bağımsız)', () => {
    expect(no.siradaki(['ARC-9', 'ARC-10', 'ARC-2'], 'ARC').siradaki).toBe('ARC-11')
  })
})

describe('INV-KANCA-KART-NUMARA-1 · kanca satırı', () => {
  it('başarılı add_task: açılan numara + sıradaki', () => {
    expect(k.satir(girdi(), BASLIKLAR, no)).toBe('KART NUMARASI: ARC-322 açıldı. ARC önekinde en büyük numara 322, sıradaki ARC-323 (arşivsiz).')
  })

  it('add_task dışındaki işlem, başarısız yanıt, başka araç, numarasız başlık, okunamayan pano: sessiz', () => {
    expect(k.satir(girdi({}, { action: 'update_task' }), BASLIKLAR, no)).toBeNull()
    expect(k.satir(girdi({ tool_response: '[INVALID_INPUT] hata' }), BASLIKLAR, no)).toBeNull()
    expect(k.satir(girdi({ tool_name: 'mcp__baska__arac' }), BASLIKLAR, no)).toBeNull()
    expect(k.satir(girdi({}, { title: 'numarasız başlık' }), BASLIKLAR, no)).toBeNull()
    expect(k.satir(girdi(), null, no)).toBeNull()
    expect(k.satir(null, BASLIKLAR, no)).toBeNull()
  })

  it('tool_response nesne olarak gelirse de çözülür', () => {
    expect(k.satir(girdi({ tool_response: { ok: true, message: 'Task added.' } }), BASLIKLAR, no)).toContain('sıradaki ARC-323')
  })
})

describe('INV-KANCA-KART-NUMARA-1 · süreç davranışı', () => {
  const kos = (g: unknown, env: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], { input: JSON.stringify(g), encoding: 'utf8', env: { ...process.env, VITEST: '1', ...env } })

  it('add_dışı işlemde stdout boş, çıkış 0 (pano okunmaz)', () => {
    const r = kos(girdi({}, { action: 'list_tasks' }))
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })

  it('bozuk stdin ve boş stdin: çıkış 0, çıktı yok', () => {
    for (const ham of ['{bozuk', '']) {
      const r = spawnSync(process.execPath, [KANCA], { input: ham, encoding: 'utf8' })
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })

  it('vana açıkken add_task bile sessiz', () => {
    const r = kos(girdi(), { [k.VANA]: '1' })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })

  it('canlı pano varsa add_task tek satır JSON basar (additionalContext)', () => {
    const r = kos(girdi())
    expect(r.status).toBe(0)
    if (r.stdout.trim() === '') return // pano dosyası bu ortamda yok (CI): fail-open sessizdir
    const j = JSON.parse(r.stdout)
    expect(j.hookSpecificOutput.hookEventName).toBe('PostToolUse')
    expect(j.hookSpecificOutput.additionalContext).toMatch(/^KART NUMARASI: ARC-322 açıldı\. ARC önekinde en büyük numara \d+, sıradaki ARC-\d+ \(arşivsiz\)\.$/)
  })
})

describe('INV-KANCA-KART-NUMARA-1 · kayıt', () => {
  it('settings.json PostToolUse kanban_manage grubunda kayıtlı ve 10 sn zaman aşımı var', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const gruplar = (ayar.hooks.PostToolUse as Array<{ matcher: string; hooks: Array<{ command: string; timeout?: number }> }>).filter(
      (g) => g.matcher === k.ARAC_ADI,
    )
    const kayit = gruplar.flatMap((g) => g.hooks).find((h) => h.command.includes('kart-numara-bildirimi.cjs'))
    expect(kayit).toBeDefined()
    expect(kayit!.timeout).toBe(10)
  })

  it('kanca sayaç çağrısını fail-open sarar', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(kaynak).toMatch(/try \{\s*require\('\.\/kanca-sayac\.cjs'\)\.say\('kart-numara-bildirimi'/)
  })
})
