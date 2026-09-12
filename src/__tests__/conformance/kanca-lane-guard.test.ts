import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-LANE-GUARD-1 · `lane-guard` kancasının KARARI ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): kancanın davranışını ölçen hiçbir test yoktu. Bu
 * kanca `exit 2` ile yazmayı DURDURUR; yanlış pozitifte aynı anda birkaç oturum birden
 * durur (kendi kendine kesinti), yanlış negatifte iki şerit aynı dosyayı ezer ve çakışma
 * ancak merge anında görünür. İki hatanın ikisini de yalnız test görür.
 *
 * ⭐CANLI PANOYA DOKUNULMAZ. Panonun dizini `VENTHUB_BOARD_DIR` ile değiştirilebiliyor
 * (ölçüldü: `scripts/board/board.cjs`); her vaka kendi geçici panosunu kurar. Bu bilerek
 * böyle: testin paylaşılan canlı kayda yazması, bu projede ölçülmüş bir kusur sınıfıdır
 * (pytest canlı registry'ye yazıyordu) — kapıyı ölçerken filoyu bozmak kabul edilemez.
 *
 * Cetvel: `docs/standards/collaboration-protocol.md` (şerit sahipliği, en-erken-kazanır) ·
 * `fleet-mechanism-standard.md` (exit 0/2) · `execution-method-standard.md` §8.1.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/lane-guard.cjs')
const DEPO = 'C:/depo'

interface Talep {
  sid: string
  lane: string
  globs: string[]
  /** Kalp atışının kaç milisaniye önce atıldığı (bayatlık kolu için). */
  yasMs?: number
  ttlMs?: number
}

interface Sonuc {
  kod: number | null
  stderr: string
}

/** Geçici pano kurar, içine verilen talepleri yazar ve dizin yolunu döndürür. */
function panoKur(talepler: Talep[]): string {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-pano-'))
  for (const t of talepler) {
    const ts = new Date(Date.now() - (t.yasMs ?? 0)).toISOString()
    const satir = JSON.stringify({
      ts,
      sid: t.sid,
      type: 'claim',
      lane: t.lane,
      globs: t.globs,
      ttlMs: t.ttlMs ?? 4 * 60 * 60 * 1000,
    })
    fs.appendFileSync(path.join(dizin, `events.${t.sid}.jsonl`), satir + '\n', 'utf8')
  }
  return dizin
}

function kos(
  girdi: unknown,
  secenek: { panoDizini?: string; cwd?: string; hamGirdi?: string } = {},
): Sonuc {
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify(girdi),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
    env: { ...process.env, VENTHUB_BOARD_DIR: secenek.panoDizini ?? panoKur([]) },
  })
  return { kod: r.status, stderr: r.stderr ?? '' }
}

const yazma = (dosya: string, sid: string, ek: Record<string, unknown> = {}) => ({
  session_id: sid,
  tool_name: 'Write',
  tool_input: { file_path: `${DEPO}/${dosya}` },
  cwd: DEPO,
  ...ek,
})

describe('INV-KANCA-LANE-GUARD-1 · yabancı şeride yazma', () => {
  it('BAŞKA oturumun şeridine yazma BLOKLANIR; mesaj şeridi, oturumu ve kuralı söyler', () => {
    const pano = panoKur([{ sid: 'yabanci1', lane: 'URUN', globs: ['src/views/**'] }])
    const r = kos(yazma('src/views/urun/Sayfa.tsx', 'benim1'), { panoDizini: pano })
    expect(r.kod, 'yabancı şeride yazma bloklanmadı').toBe(2)
    expect(r.stderr, 'mesaj şerit adını söylemiyor').toContain('URUN')
    expect(r.stderr, 'mesaj kuralı (glob) söylemiyor').toContain('src/views/**')
    expect(r.stderr, 'mesaj dosyayı söylemiyor').toContain('src/views/urun/Sayfa.tsx')
  })

  it('ALT-AJAN kolu: bloklanan alt-ajana "yazma, içeriği raporla" yolu gösterilir', () => {
    // Ölçülmüş sebep: alt-ajan ebeveyninin oturum kimliğiyle koşar; blok "tanınmadı"
    // değil gerçekten yabancı şerittir. Doğru çıkış Bash ile aşmak değil raporlamaktır.
    const pano = panoKur([{ sid: 'yabanci1', lane: 'KATALOG', globs: ['docs/**'] }])
    const r = kos(yazma('docs/audits/x.md', 'benim1', { agent_id: 'alt-1' }), { panoDizini: pano })
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('ALT-AJAN')
  })
})

describe('INV-KANCA-LANE-GUARD-1 · YANLIŞ-POZİTİF kolları (kapının en olası arızası)', () => {
  it('KENDİ şeridime yazma serbest', () => {
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    expect(kos(yazma('src/lib/x.ts', 'benim1'), { panoDizini: pano }).kod).toBe(0)
  })

  it('talebin kapsamadığı dosya serbest', () => {
    const pano = panoKur([{ sid: 'yabanci1', lane: 'URUN', globs: ['src/views/**'] }])
    expect(kos(yazma('scripts/db/x.mjs', 'benim1'), { panoDizini: pano }).kod).toBe(0)
  })

  it('EN ERKEN KAZANIR: benim talebim daha kıdemliyse yabancı talep beni bloklamaz', () => {
    // Bu kol olmadan karşılıklı kilit doğar: aynı yolu iki oturum talep ederse İKİSİ de
    // yazamaz ve katmanın kendisi kesinti kaynağı olur.
    const pano = panoKur([
      { sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'], yasMs: 60_000 },
      { sid: 'yabanci1', lane: 'URUN', globs: ['src/**'], yasMs: 1_000 },
    ])
    expect(kos(yazma('src/lib/x.ts', 'benim1'), { panoDizini: pano }).kod).toBe(0)
  })

  it('BAYAT talep bloklamaz — kalp atışı TTL\'i geçmişse şerit düşmüş sayılır', () => {
    const pano = panoKur([
      { sid: 'yabanci1', lane: 'URUN', globs: ['src/**'], yasMs: 10_000, ttlMs: 1_000 },
    ])
    expect(kos(yazma('src/lib/x.ts', 'benim1'), { panoDizini: pano }).kod).toBe(0)
  })

  it('boş pano hiçbir şeyi bloklamaz', () => {
    expect(kos(yazma('src/lib/x.ts', 'benim1')).kod).toBe(0)
  })
})

describe('INV-KANCA-LANE-GUARD-1 · sözleşme sınırları', () => {
  it('bozuk / eksik girdi KARIŞMAZ (fail-open, kancanın yazılı sapması)', () => {
    expect(kos(null, { hamGirdi: 'bu JSON degil' }).kod, 'bozuk JSON bloklandı').toBe(0)
    expect(kos({ session_id: 'benim1', tool_input: {} }).kod, 'dosya yolu yokken bloklandı').toBe(0)
    expect(kos({ tool_input: { file_path: `${DEPO}/src/x.ts` } }).kod, 'oturum kimliği yokken bloklandı').toBe(0)
  })

  it('BOZUK PANO SATIRI yazmayı durdurmaz ama SESSİZ de kalmaz', () => {
    // Koordinasyon kapısı bilinçli fail-open: pano bozulursa üç oturumu birden durdurmak
    // yerine yazma serbest kalır, son emniyet git'tir. Ama uyarı stderr'e düşmek ZORUNDA.
    const pano = panoKur([{ sid: 'yabanci1', lane: 'URUN', globs: ['src/**'] }])
    fs.appendFileSync(path.join(pano, 'events.bozuk.jsonl'), '{bu satir bozuk\n', 'utf8')
    const r = kos(yazma('scripts/x.mjs', 'benim1'), { panoDizini: pano })
    expect(r.kod, 'bozuk satır yüzünden yazma durdu').toBe(0)
    expect(r.stderr.length, 'bozuk satır sessizce yutuldu').toBeGreaterThan(0)
  })

  it('KARAR CWD\'DEN BAĞIMSIZ — depo dışından koşarken de blok ayakta', () => {
    // 2026-09-12 vakası: göreli yol sınıfı bir kancayı depo dışı klasörde düşürdü ve kapı
    // "çalışmış gibi" göründü. Yol, çağıranın dizininden değil girdideki depo kökünden çözülür.
    const pano = panoKur([{ sid: 'yabanci1', lane: 'URUN', globs: ['src/views/**'] }])
    const r = kos(yazma('src/views/x.tsx', 'benim1'), { panoDizini: pano, cwd: os.tmpdir() })
    expect(r.kod, 'dışarıdan koşunca blok kayboldu').toBe(2)
    expect(r.stderr).toContain('URUN')
  })
})
