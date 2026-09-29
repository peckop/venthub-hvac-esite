import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-BOARD-11 · Pano PENCERE ADINI gösterir; aynı ad iki canlı oturumda ⚠ÇAKIŞMA verir (REC-404).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-27): pano oturum numarasıyla (sid), SendMessage pencere adıyla
 * (`venthub-hvac-xx`) çalışıyordu; aradaki eşleme yoktu ve URUN ile GEO-SEO AYNI adı taşıyordu
 * (`venthub-hvac-8e`). Çıplak adla gönderilen mesaj belirsiz kaldı; HARİTA'nın iki onaylı emri
 * okunmadan bekledi. Recep: "ekibindekileri sürekli karıştırıyorsun."
 *
 * Eşleme kaynağı: Claude Code'un `~/.claude/sessions/<pid>.json` dosyası (`sessionId` + `name`).
 * Testte dizin `VENTHUB_OTURUM_KAYIT_DIZINI` ile izole edilir — gerçek kayıtlara DOKUNULMAZ.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: ad gösterme, çakışma uyarısı, BAYAT şeridin çakışma
 * saymaması ve fail-open ayrı davranışlardır; biri yeşil diye ötekiler ölçülmüş olmaz.
 */

const require = createRequire(import.meta.url)
const BOARD = require.resolve('../../../scripts/board/board.cjs')

const KIMLIK_DEGISKENLERI = new Set(['CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID'])

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function benzersiz(onEk: string): string {
  sayac += 1
  return `${tmpRoot()}/${onEk}-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

function kos(
  pano: string,
  kayitDizini: string,
  args: string[],
): { kod: number; out: string; err: string } {
  const ciftler = Object.entries(process.env).filter(([ad]) => !KIMLIK_DEGISKENLERI.has(ad))
  ciftler.push(['VENTHUB_BOARD_DIR', pano], ['VENTHUB_OTURUM_KAYIT_DIZINI', kayitDizini])
  const env = Object.fromEntries(ciftler) as typeof process.env
  const r = spawnSync(process.execPath, [BOARD, ...args], { encoding: 'utf8', env })
  return { kod: typeof r.status === 'number' ? r.status : -1, out: r.stdout ?? '', err: r.stderr ?? '' }
}

/** Oturum kaydı yazar: Claude Code'un gerçek dosya biçimi (`<pid>.json`). */
function oturumKaydi(dizin: string, pid: number, sid: string, ad: string): void {
  mkdirSync(dizin, { recursive: true })
  writeFileSync(`${dizin}/${pid}.json`, JSON.stringify({ pid, sessionId: sid, name: ad, status: 'idle' }))
}

const A = 'sinav-a-1111'
const B = 'sinav-b-2222'
const C = 'sinav-c-3333'

function kur(): { pano: string; kayit: string } {
  const pano = benzersiz('board-pencere-adi')
  const kayit = benzersiz('oturum-kayit')
  return { pano, kayit }
}

describe('INV-BOARD-11 · pano pencere adini gosterir, ayni ad = CAKISMA', () => {
  it('ON KOSUL: board.cjs bu ortamda calisiyor ve `who` kosuyor (olculemedi != gecti)', () => {
    const { pano, kayit } = kur()
    const r = kos(pano, kayit, ['claim', '--sid', A, '--lane', 'URUN', '--globs', 'src/**'])
    expect(r.kod, r.err).toBe(0)
    const w = kos(pano, kayit, ['who', '--sid', A])
    expect(w.kod, w.err).toBe(0)
    expect(w.out, 'who ciktisinda serit yok — asagidaki kollar bosluk olcerdi').toContain('URUN')
  })

  it('KOL 1 · kayitli oturumun pencere adi seridin yaninda gorunur', () => {
    const { pano, kayit } = kur()
    oturumKaydi(kayit, 101, A, 'venthub-hvac-72')
    kos(pano, kayit, ['claim', '--sid', A, '--lane', 'URUN', '--globs', 'src/**'])
    const w = kos(pano, kayit, ['who', '--sid', A]).out
    expect(w).toMatch(/URUN \(venthub-hvac-72\)/)
    expect(w, 'tek ad iken CAKISMA uyarisi cikmamali').not.toContain('ÇAKIŞMA')
  })

  it('KOL 2 · AYNI ad iki CANLI oturumda → iki satirda da ⚠ÇAKIŞMA + [ref] yonergesi', () => {
    const { pano, kayit } = kur()
    oturumKaydi(kayit, 101, A, 'venthub-hvac-8e')
    oturumKaydi(kayit, 102, B, 'venthub-hvac-8e')
    kos(pano, kayit, ['claim', '--sid', A, '--lane', 'URUN', '--globs', 'src/**'])
    kos(pano, kayit, ['claim', '--sid', B, '--lane', 'GEO-SEO', '--globs', 'scripts/seo/**'])
    const satirlar = kos(pano, kayit, ['who', '--sid', A]).out.split('\n')
    const urun = satirlar.find((s) => s.includes('URUN'))
    const geo = satirlar.find((s) => s.includes('GEO-SEO'))
    expect(urun, 'URUN satiri yok').toBeDefined()
    expect(geo, 'GEO-SEO satiri yok').toBeDefined()
    for (const s of [urun, geo]) {
      expect(s).toContain('⚠ÇAKIŞMA')
      expect(s).toContain('[ref]')
    }
  })

  it('KOL 3 · kaydi OLMAYAN oturum icin pano yine calisir, ad yazilmaz (fail-open)', () => {
    const { pano, kayit } = kur() // kayit dizini HIC olusturulmadi
    kos(pano, kayit, ['claim', '--sid', C, '--lane', 'HARITA', '--globs', 'docs/**'])
    const w = kos(pano, kayit, ['who', '--sid', C])
    expect(w.kod, w.err).toBe(0)
    expect(w.out).toContain('HARITA')
    expect(w.out).not.toContain('ÇAKIŞMA')
  })

  it('KOL 4 · bozuk kayit dosyasi panoyu dusurmez, saglam kayit yine okunur', () => {
    const { pano, kayit } = kur()
    oturumKaydi(kayit, 101, A, 'venthub-hvac-72')
    writeFileSync(`${kayit}/999.json`, '{ yarim yazilmis')
    writeFileSync(`${kayit}/777.abcdef.key`, 'anahtar dosyasi: json degil')
    kos(pano, kayit, ['claim', '--sid', A, '--lane', 'URUN', '--globs', 'src/**'])
    const w = kos(pano, kayit, ['who', '--sid', A])
    expect(w.kod, w.err).toBe(0)
    expect(w.out).toMatch(/URUN \(venthub-hvac-72\)/)
  })

  it('KOL 5 · pencereAdlari() fonksiyonu sid → ad haritasi verir, dizin yoksa BOS harita', () => {
    const { pencereAdlari } = require('../../../scripts/board/board.cjs') as {
      pencereAdlari: (d?: string) => Map<string, string>
    }
    const { kayit } = kur()
    expect(pencereAdlari(kayit).size).toBe(0)
    oturumKaydi(kayit, 101, A, 'venthub-hvac-72')
    expect(pencereAdlari(kayit).get(A)).toBe('venthub-hvac-72')
  })
})
