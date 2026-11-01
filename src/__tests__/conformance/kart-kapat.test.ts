// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KART-KAPAT-1 (ARC-235, OPS 1 Kasım A+B) — PR birleşince kartı kapatma hatırlatması.
 *
 * NİÇİN: Done kapısı yanlış kapanmayı engelliyordu ama PR birleşince kartı kapatmayı TETİKLEYEN adım yoktu
 * (REC-376 #1334 Eylül'de bitti, kart ay sonra To Do; 1 Kasım ayıklamada 117 açık kartın 33'ü böyleydi).
 * Üç parça aynı mantığı kullanır: merge ritüeli satırı, PostToolUse kancası, karne (kanban-uyum) kırmızısı.
 * SABOTAJ KOLLARI (OPS şartı): `Kanban:` satırı olmayan PR, iki kartlı PR, birleşmemiş PR.
 */
const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KK = require_(path.join(KOK, 'scripts', 'board', 'kart-kapat.cjs')) as {
  kanbanNumaralari: (g: string) => string[]
  kartKapatSatirlari: (pr: number | string, g: string, depo?: string) => string[]
  birlesmisPrliAcikKartlar: (
    k: { no: string; columnId?: string; status?: string }[],
    p: { number: number; body: string; mergedAt: string | null }[],
  ) => { tek: { no: string; prler: number[] }[]; cok: { no: string; prler: number[] }[] }
}
const KANCA_YOLU = path.join(KOK, '.claude', 'hooks', 'pr-birlesti-kart.cjs')
const kanca = require_(KANCA_YOLU) as {
  prNumarasi: (k: unknown) => string | null
  satir: (g: unknown, oku?: (pr: string) => { state: string; body: string } | null) => string | null
}
const UYUM = require_(path.join(KOK, 'scripts', 'board', 'kanban-uyum.cjs')) as {
  uyumHesapla: (p: unknown[], simdi: number, s?: { prler?: unknown[] | null }) => { kirmizi: string[]; birlesmisPrliAcik: { tek: string[]; cok: string[] } | null }[]
}
const GOVDE = (n: string) => `## Ne\nbir şey\n\nKanban: ${n}\n`
const BIRLESTI = '2026-11-01T10:00:00Z'

describe('INV-KART-KAPAT-1 · kanbanNumaralari', () => {
  it('tek, virgüllü ve küçük harfli numaraları okur; Fixes/Linear numarası SAYILMAZ', () => {
    expect(KK.kanbanNumaralari(GOVDE('ARC-199'))).toEqual(['ARC-199'])
    expect(KK.kanbanNumaralari('Kanban: ARC-1, OPS-22\n')).toEqual(['ARC-1', 'OPS-22'])
    expect(KK.kanbanNumaralari('kanban: arc-5')).toEqual(['ARC-5'])
    expect(KK.kanbanNumaralari('Fixes REC-376\nLinear: REC-99')).toEqual([])
  })

  it('⭐SABOTAJ: `Kanban:` satırı olmayan gövde numara üretmez', () => {
    expect(KK.kanbanNumaralari('')).toEqual([])
    expect(KK.kanbanNumaralari('ARC-199 hakkında not')).toEqual([])
  })
})

describe('INV-KART-KAPAT-1 · kartKapatSatirlari', () => {
  it('tek kart: numarayı, PR kanıtını ve "başka iş varsa kapatma" uyarısını söyler', () => {
    const s = KK.kartKapatSatirlari(2158, GOVDE('ARC-199')).join('\n')
    expect(s).toContain('KART KAPAT: ARC-199')
    expect(s).toContain('pulls/2158/merge')
    expect(s).toMatch(/KAPATMA/)
  })

  it('⭐SABOTAJ: iki kartlı PR → otomatik karar yok, "BIRDEN COK" der', () => {
    const s = KK.kartKapatSatirlari(7, 'Kanban: ARC-1, ARC-2').join('\n')
    expect(s).toContain('BIRDEN COK')
    expect(s).not.toContain('move_task done')
  })

  it('⭐SABOTAJ: Kanban: satırı olmayan PR sessiz geçmez, "bulunamadi" der', () => {
    expect(KK.kartKapatSatirlari(9, 'gövde yok').join('\n')).toContain('KART KAPAT: bulunamadi')
  })
})

describe('INV-KART-KAPAT-1 · birlesmisPrliAcikKartlar', () => {
  const acik = (no: string) => ({ no, columnId: 'todo', status: 'ready' })

  it('birleşmiş tek PR\'li açık kart → tek; iki PR\'li → cok', () => {
    const r = KK.birlesmisPrliAcikKartlar(
      [acik('ARC-1'), acik('ARC-2')],
      [
        { number: 10, body: GOVDE('ARC-1'), mergedAt: BIRLESTI },
        { number: 11, body: GOVDE('ARC-2'), mergedAt: BIRLESTI },
        { number: 12, body: GOVDE('ARC-2'), mergedAt: BIRLESTI },
      ],
    )
    expect(r.tek).toEqual([{ no: 'ARC-1', prler: [10] }])
    expect(r.cok).toEqual([{ no: 'ARC-2', prler: [11, 12] }])
  })

  it('⭐SABOTAJ: birleşmemiş PR kartı işaretlemez', () => {
    const r = KK.birlesmisPrliAcikKartlar([acik('ARC-1')], [{ number: 10, body: GOVDE('ARC-1'), mergedAt: null }])
    expect(r.tek).toEqual([])
  })

  it('⭐SABOTAJ: Kanban: satırı olmayan birleşmiş PR kartı işaretlemez', () => {
    const r = KK.birlesmisPrliAcikKartlar([acik('ARC-1')], [{ number: 10, body: 'ARC-1 üzerinde çalıştım', mergedAt: BIRLESTI }])
    expect(r.tek).toEqual([])
  })

  it('kapalı (Done/arşiv) kart işaretlenmez', () => {
    const r = KK.birlesmisPrliAcikKartlar(
      [{ no: 'ARC-1', columnId: 'done', status: 'completed' }, { no: 'ARC-3', columnId: 'todo', status: 'archived' }],
      [{ number: 10, body: 'Kanban: ARC-1, ARC-3', mergedAt: BIRLESTI }],
    )
    expect(r).toEqual({ tek: [], cok: [] })
  })
})

describe('INV-KART-KAPAT-1 · karne kırmızısı (kanban-uyum)', () => {
  const SIMDI = Date.parse('2026-11-01T12:00:00Z')
  const pano = (kartlar: unknown[]) => ({ title: 'VentHub ARAÇ', tasks: kartlar })
  const kart = (title: string, columnId: string) => ({ title, columnId, status: columnId === 'done' ? 'completed' : 'ready', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-11-01T11:00:00Z', labels: [], description: '' })

  it('prler verilirse birleşmiş PR\'li açık kart KIRMIZI verir; kartı Done olan vermez', () => {
    const prler = [{ number: 5, body: 'Kanban: ARC-9', mergedAt: BIRLESTI }]
    const [acik] = UYUM.uyumHesapla([pano([kart('ARC-9 · iş', 'todo')])], SIMDI, { prler })
    expect(acik.kirmizi.some((x) => x.startsWith('birlesmisPrliAcik 1 kart') && x.includes('ARC-9'))).toBe(true)
    const [kapali] = UYUM.uyumHesapla([pano([kart('ARC-9 · iş', 'done')])], SIMDI, { prler })
    expect(kapali.kirmizi.some((x) => x.startsWith('birlesmisPrliAcik'))).toBe(false)
  })

  it('⭐SABOTAJ: prler yok/null (gh yok) → ölçüm atlanır, kırmızı UYDURULMAZ, alan null', () => {
    const [s] = UYUM.uyumHesapla([pano([kart('ARC-9 · iş', 'todo')])], SIMDI, { prler: null })
    expect(s.birlesmisPrliAcik).toBeNull()
    expect(s.kirmizi.some((x) => x.startsWith('birlesmisPrliAcik'))).toBe(false)
  })
})

describe('INV-KART-KAPAT-1 · PostToolUse kancası', () => {
  it('yalnız doğrudan `gh pr merge <N>` PR numarası verir; ritüel ve başka komut vermez', () => {
    expect(kanca.prNumarasi('gh pr merge 2158 --squash --delete-branch')).toBe('2158')
    expect(kanca.prNumarasi('gh pr merge --squash 99')).toBe('99')
    expect(kanca.prNumarasi('node scripts/hijyen/merge-ritueli.cjs 2158 dal --merge')).toBeNull()
    expect(kanca.prNumarasi('gh pr view 2158')).toBeNull()
    expect(kanca.prNumarasi(undefined)).toBeNull()
  })

  it('birleşmiş PR → KART KAPAT satırı; birleşmemiş (merge düştü) → susar', () => {
    const girdi = { tool_input: { command: 'gh pr merge 12' } }
    expect(kanca.satir(girdi, () => ({ state: 'MERGED', body: GOVDE('ARC-4') }))).toContain('KART KAPAT: ARC-4')
    expect(kanca.satir(girdi, () => ({ state: 'OPEN', body: GOVDE('ARC-4') }))).toBeNull()
    expect(kanca.satir(girdi, () => null)).toBeNull()
  })

  it('fail-open + vana: merge olmayan komutta ve VENTHUB_PR_KART_KANCA=0 iken çıktı yok, çıkış 0', () => {
    for (const [komut, env] of [
      ['ls', {}],
      ['gh pr merge 1', { VENTHUB_PR_KART_KANCA: '0' }],
    ] as const) {
      const r = spawnSync(process.execPath, [KANCA_YOLU], { input: JSON.stringify({ tool_input: { command: komut } }), encoding: 'utf8', env: { ...process.env, ...env }, timeout: 20000 })
      expect(r.status, komut).toBe(0)
      expect(r.stdout, komut).toBe('')
    }
    expect(fs.readFileSync(KANCA_YOLU, 'utf8')).toMatch(/timeout: 15_000/)
  })

  it('kanca settings.json PostToolUse Bash\'e kayıtlı; merge ritüeli aynı ortak parçayı kullanıyor', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks: { PostToolUse: { matcher: string; hooks: { command: string }[] }[] }
    }
    const komutlar = ayar.hooks.PostToolUse.filter((b) => b.matcher.split('|').includes('Bash')).flatMap((b) => b.hooks.map((h) => h.command))
    expect(komutlar.some((c) => c.includes('pr-birlesti-kart.cjs'))).toBe(true)
    const ritüel = fs.readFileSync(path.join(KOK, 'scripts', 'hijyen', 'merge-ritueli.cjs'), 'utf8')
    expect(ritüel).toContain('kart-kapat.cjs')
    expect(ritüel).toContain('KART KAPAT: OLCEMEDI')
  })
})
