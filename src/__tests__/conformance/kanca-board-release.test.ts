import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-BOARD-RELEASE-1 · `board-release` kancasının ETKİSİ ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): kancanın davranışını ölçen hiçbir test yoktu. Adı
 * `arac-envanteri.test.ts` içinde geçiyordu ama orada bir TABLO SATIRI olarak geçiyor —
 * envanterde kayıtlı mı diye bakılıyor, ne yaptığına bakılmıyor.
 *
 * ⚠SINIFLANDIRMA DÜZELTMESİ (sapma, adıyla): iş emri bu kancayı da "fail-closed" saydı.
 * Ölçüm başka söylüyor — dosyada `exit 2` yolu YOK; üç çıkış da `exit 0` ve pano
 * yüklenemezse hata yutulup TTL emniyet ağına bırakılıyor. Yani bu kanca **fail-open ve
 * işi durdurma yetkisi olmayan** bir temizlik kancasıdır. Bu yüzden kolları "blokladı mı"
 * değil "ETKİSİNİ yaptı mı" diye ölçüyorum: şerit gerçekten bırakıldı mı.
 *
 * NİÇİN ÖNEMLİ: şerit kirası TTL'li (4 saat). Oturum düzgün kapandığında bırakma çalışmazsa
 * sıradaki oturum aynı dosyalara 4 saat boyunca giremez — kayıp sessizdir, kimse kırmızı
 * görmez. Yanlış yönde hata ise daha kötüdür: başkasının şeridini bırakmak.
 *
 * ⭐CANLI PANOYA DOKUNULMAZ — her vaka `VENTHUB_BOARD_DIR` ile kendi geçici panosunu kurar.
 *
 * Cetvel: `collaboration-protocol.md` (şerit kirası) · `execution-method-standard.md` §8.1.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/board-release.cjs')

/** Geçici pano kurar; verilen oturumlar için canlı talep yazar. */
function panoKur(talepler: Array<{ sid: string; lane: string; globs: string[] }>): string {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-pano-'))
  for (const t of talepler) {
    const satir = JSON.stringify({
      ts: new Date().toISOString(),
      sid: t.sid,
      type: 'claim',
      lane: t.lane,
      globs: t.globs,
      ttlMs: 4 * 60 * 60 * 1000,
    })
    fs.appendFileSync(path.join(dizin, `events.${t.sid}.jsonl`), satir + '\n', 'utf8')
  }
  return dizin
}

/** Panodaki tüm olay satırlarını okur (dosya adından bağımsız). */
function olaylar(dizin: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  for (const f of fs.readdirSync(dizin).filter((x) => x.startsWith('events.') && x.endsWith('.jsonl'))) {
    for (const s of fs.readFileSync(path.join(dizin, f), 'utf8').split('\n')) {
      if (!s.trim()) continue
      try {
        out.push(JSON.parse(s) as Record<string, unknown>)
      } catch {
        /* bozuk satır: bu testin konusu değil */
      }
    }
  }
  return out
}

function kos(
  girdi: unknown,
  secenek: { panoDizini: string; cwd?: string; hamGirdi?: string },
): number | null {
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify(girdi),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
    env: { ...process.env, VENTHUB_BOARD_DIR: secenek.panoDizini },
  })
  return r.status
}

/** Aynı koşunun `stderr`i — §9.7 kolu için (kos yalnız çıkış kodu döndürür). */
function stderrAl(hamGirdi: string, panoDizini: string): string {
  const r = spawnSync(process.execPath, [KANCA], {
    input: hamGirdi,
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_BOARD_DIR: panoDizini },
  })
  return r.stderr ?? ''
}

const birakmaSayisi = (dizin: string, sid?: string) =>
  olaylar(dizin).filter((e) => e.type === 'release' && (sid === undefined || e.sid === sid)).length

describe('INV-KANCA-BOARD-RELEASE-1 · şeridi bırakma etkisi', () => {
  it('CANLI talebi olan oturum için BIRAKMA yazılır ve sebebi kayda geçer', () => {
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    expect(kos({ session_id: 'benim1', reason: 'clear' }, { panoDizini: pano })).toBe(0)
    const birakmalar = olaylar(pano).filter((e) => e.type === 'release')
    expect(birakmalar.length, 'şerit bırakılmadı').toBe(1)
    expect(birakmalar[0].sid, 'yanlış oturum bırakıldı').toBe('benim1')
    expect(birakmalar[0].reason, 'sebep kayda geçmedi').toBe('clear')
  })

  it('sebep verilmezse `session-end` olarak yazılır — sebep alanı boş kalmaz', () => {
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    kos({ session_id: 'benim1' }, { panoDizini: pano })
    const b = olaylar(pano).find((e) => e.type === 'release')
    expect(b?.reason).toBe('session-end')
  })
})

describe('INV-KANCA-BOARD-RELEASE-1 · BAŞKASINI BIRAKMAMA kolu (asıl risk)', () => {
  it('talebi olmayan oturum için HİÇBİR bırakma yazılmaz', () => {
    // Yanlış yönde hata "bırakmayı kaçırmak"tan daha pahalıdır: yabancı bir şeridi
    // bırakmak, sahibi çalışırken dosyalarını başkasına açar.
    const pano = panoKur([{ sid: 'yabanci1', lane: 'URUN', globs: ['src/views/**'] }])
    expect(kos({ session_id: 'bende-talep-yok' }, { panoDizini: pano })).toBe(0)
    expect(birakmaSayisi(pano), 'talebi olmayan oturum bırakma yazdı').toBe(0)
  })

  it('yabancı talep BIRAKILMAZ — yalnız kendi oturumu', () => {
    const pano = panoKur([
      { sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] },
      { sid: 'yabanci1', lane: 'URUN', globs: ['src/views/**'] },
    ])
    kos({ session_id: 'benim1' }, { panoDizini: pano })
    expect(birakmaSayisi(pano, 'benim1'), 'kendi şeridi bırakılmadı').toBe(1)
    expect(birakmaSayisi(pano, 'yabanci1'), 'YABANCI şerit bırakıldı').toBe(0)
  })
})

describe('INV-KANCA-BOARD-RELEASE-1 · sözleşme: fail-open, hiçbir girdide iş durmaz', () => {
  it('bozuk / eksik girdide çıkış 0 ve pano DEĞİŞMEZ', () => {
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    const oncekiSayi = olaylar(pano).length
    expect(kos(null, { panoDizini: pano, hamGirdi: 'bu JSON degil' }), 'bozuk girdi iş durdurdu').toBe(0)
    expect(kos(null, { panoDizini: pano, hamGirdi: '' })).toBe(0)
    expect(kos({}, { panoDizini: pano }), 'oturum kimliği yokken iş durdu').toBe(0)
    expect(olaylar(pano).length, 'bozuk girdi panoya yazdı').toBe(oncekiSayi)
  })

  it('⭐bozuk / boş girdide SESSİZ KALMAZ — stderr tek satır (cetvel §9.7)', () => {
    // Bu kancada sessizliğin bedeli şeridin 4 saat kilitli kalmasıdır; kimse kırmızı görmez.
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    expect(stderrAl('bu JSON degil', pano)).toContain('stdin okunamadi')
    expect(stderrAl('', pano)).toContain('stdin okunamadi')
    // Geçerli JSON, talebi olmayan oturum: NORMAL hâl, uyarı üretmemeli.
    expect(stderrAl(JSON.stringify({ session_id: 'talebi-yok' }), pano), 'normal hâlde gürültü').toBe('')
  })

  it('ETKİ CWD\'DEN BAĞIMSIZ — depo dışından koşarken de şerit bırakılır', () => {
    // 2026-09-12 vakası: göreli yol sınıfı bir kancayı depo dışı klasörde düşürdü. Bu kanca
    // panoyu `__dirname` üzerinden yüklüyor; kol bunun gerçekten böyle olduğunu ölçer.
    const pano = panoKur([{ sid: 'benim1', lane: 'ALTYAPI', globs: ['src/**'] }])
    expect(kos({ session_id: 'benim1' }, { panoDizini: pano, cwd: os.tmpdir() })).toBe(0)
    expect(birakmaSayisi(pano, 'benim1'), 'dışarıdan koşunca bırakma kayboldu').toBe(1)
  })
})
