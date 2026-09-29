import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-KANCA-BOARD-BRIEF-1 · `board-brief` kancasının PANO özet satırı PENCERE ADINI gösterir (REC-404).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-27/29): pano oturum numarasıyla (sid), SendMessage pencere adıyla çalışıyordu;
 * her turda basılan tek satırlık özet (`AD=sid8 (N desen, Xdk)`) ikisini eşlemiyordu ve iki pencere AYNI
 * adı taşıyabiliyordu (`venthub-hvac-8e` ×2). Recep: "ekibindekileri sürekli karıştırıyorsun."
 * `board.cjs who` (INV-BOARD-11) adı gösteriyordu; ama asıl okunan yüzey HER TURDA basılan bu satırdır.
 *
 * Kancanın çıktısı UserPromptSubmit `additionalContext` alanındadır; kol bunu AYRIŞTIRIR (ham metinde
 * aramak biçimi kırılganlaştırır).
 *
 * ⭐CANLI PANOYA VE GERÇEK OTURUM KAYITLARINA DOKUNULMAZ: her vaka kendi geçici panosunu
 * (`VENTHUB_BOARD_DIR`) ve oturum kayıt dizinini (`VENTHUB_OTURUM_KAYIT_DIZINI`) kurar.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: ad gösterme, çakışma uyarısı, bayat şeridin çakışma saymaması ve
 * fail-open ayrı davranışlardır.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/board-brief.cjs')
const TTL = 4 * 60 * 60 * 1000

function tmp(onEk: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), onEk))
}

function talep(pano: string, sid: string, lane: string, yasDk = 0): void {
  const satir = JSON.stringify({
    ts: new Date(Date.now() - yasDk * 60_000).toISOString(),
    sid,
    type: 'claim',
    lane,
    globs: ['src/**'],
    ttlMs: TTL,
  })
  fs.appendFileSync(path.join(pano, `events.${sid}.jsonl`), satir + '\n', 'utf8')
}

function oturum(kayit: string, pid: number, sid: string, ad: string): void {
  fs.mkdirSync(kayit, { recursive: true })
  fs.writeFileSync(path.join(kayit, `${pid}.json`), JSON.stringify({ pid, sessionId: sid, name: ad }))
}

/** Kancayı `benim` oturumu olarak koşturur; PANO satırını (varsa) döndürür. */
function panoSatiri(pano: string, kayit: string, benim = 'benim1'): { kod: number | null; satir: string } {
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: benim, prompt: 'merhaba' }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: pano, VENTHUB_OTURUM_KAYIT_DIZINI: kayit },
  })
  let ek = ''
  try {
    ek = String(JSON.parse(r.stdout || '{}').hookSpecificOutput?.additionalContext ?? '')
  } catch {
    ek = ''
  }
  return { kod: r.status, satir: ek.split('\n').find((s) => s.startsWith('PANO:')) ?? '' }
}

describe('INV-KANCA-BOARD-BRIEF-1 · PANO özet satırı pencere adını gösterir', () => {
  it('ÖN KOŞUL: kanca koşuyor ve diğer şeridi PANO satırında basıyor (ölçülemedi ≠ geçti)', () => {
    const pano = tmp('vh-brief-pano-')
    talep(pano, 'benim1', 'ALTYAPI')
    talep(pano, 'digeri1', 'URUN')
    const { kod, satir } = panoSatiri(pano, tmp('vh-brief-kayit-'))
    expect(kod).toBe(0)
    expect(satir, 'PANO satırı yok — aşağıdaki kollar boşluk ölçerdi').toContain('URUN=digeri1')
  })

  it('KOL 1 · kayıtlı pencere adı şerit adının yanında görünür: URUN[venthub-hvac-72]=…', () => {
    const pano = tmp('vh-brief-pano-')
    const kayit = tmp('vh-brief-kayit-')
    talep(pano, 'benim1', 'ALTYAPI')
    talep(pano, 'digeri1', 'URUN')
    oturum(kayit, 101, 'digeri1', 'venthub-hvac-72')
    const { satir } = panoSatiri(pano, kayit)
    expect(satir).toContain('URUN[venthub-hvac-72]=digeri1')
    expect(satir, 'tek ad iken ÇAKIŞMA çıkmamalı').not.toContain('ÇAKIŞMA')
  })

  it('KOL 2 · AYNI ad iki CANLI oturumda → iki şeritte de ⚠ÇAKIŞMA', () => {
    const pano = tmp('vh-brief-pano-')
    const kayit = tmp('vh-brief-kayit-')
    talep(pano, 'benim1', 'ALTYAPI')
    talep(pano, 'a-urun1', 'URUN')
    talep(pano, 'b-geo01', 'GEO-SEO')
    oturum(kayit, 101, 'a-urun1', 'venthub-hvac-8e')
    oturum(kayit, 102, 'b-geo01', 'venthub-hvac-8e')
    const { satir } = panoSatiri(pano, kayit)
    const parcalar = satir.split(' · ')
    const urun = parcalar.find((p) => p.includes('URUN['))
    const geo = parcalar.find((p) => p.includes('GEO-SEO['))
    expect(urun, 'URUN parçası yok').toBeDefined()
    expect(geo, 'GEO-SEO parçası yok').toBeDefined()
    expect(urun).toContain('⚠ÇAKIŞMA')
    expect(geo).toContain('⚠ÇAKIŞMA')
  })

  it('KOL 3 · BAYAT şerit çakışma SAYILMAZ: adı paylaşan biri artık canlı değilse uyarı yok', () => {
    const pano = tmp('vh-brief-pano-')
    const kayit = tmp('vh-brief-kayit-')
    talep(pano, 'benim1', 'ALTYAPI')
    talep(pano, 'canli01', 'URUN')
    talep(pano, 'bayat01', 'GEO-SEO', 5 * 60) // 5 saat önce, TTL 4 saat → BAYAT
    oturum(kayit, 101, 'canli01', 'venthub-hvac-8e')
    oturum(kayit, 102, 'bayat01', 'venthub-hvac-8e')
    const { satir } = panoSatiri(pano, kayit)
    const urun = satir.split(' · ').find((p) => p.includes('URUN['))
    expect(urun, 'URUN parçası yok').toBeDefined()
    expect(urun, 'bayat oturum yüzünden yanlış ÇAKIŞMA').not.toContain('ÇAKIŞMA')
  })

  it('KOL 4 · FAIL-OPEN: kayıt dizini yoksa/bozuksa satır ESKİ biçimde basılır, ad yazılmaz', () => {
    const pano = tmp('vh-brief-pano-')
    talep(pano, 'benim1', 'ALTYAPI')
    talep(pano, 'digeri1', 'URUN')
    // (a) hiç oluşturulmamış dizin
    const yok = path.join(tmp('vh-brief-kok-'), 'olmayan')
    const a = panoSatiri(pano, yok)
    expect(a.kod).toBe(0)
    expect(a.satir).toContain('URUN=digeri1')
    expect(a.satir).not.toContain('[')
    // (b) dizin yerine DOSYA verilmiş (okuma hata verir)
    const dosya = path.join(tmp('vh-brief-kok-'), 'dizin-degil')
    fs.writeFileSync(dosya, 'x')
    const b = panoSatiri(pano, dosya)
    expect(b.kod).toBe(0)
    expect(b.satir).toContain('URUN=digeri1')
  })
})
