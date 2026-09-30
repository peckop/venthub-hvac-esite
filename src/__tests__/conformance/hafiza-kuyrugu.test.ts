// @vitest-environment node
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-HAFIZA-KUYRUGU-1 · claude-mem kuyruk bekçisi (REC-422, Ops emri 2026-09-30).
 *
 * Ölçülen vaka: 09-29 16:51'de 5.469 olay kuyrukta bekliyordu; kuyruk yalnız bellekte olduğu için
 * makine kapanınca hepsi kayboldu, ve kimse görmedi. Ayırt edici çiftler: eşiğin altı SESSİZ, eşik
 * ve üstü KONUŞUR; worker kapalıyken SESSİZ (kaybedilecek şey yok); kapanış kolu boşta 0, doluda 2,
 * ölçülemezse 3 döner ve dolu kuyrukta KAÇ olay kaybolacağını yazar.
 */

interface Durum {
  calisiyor: boolean
  derinlik?: number | null
  isleniyor?: boolean
  parked?: number
}
interface Onbellek extends Durum {
  ts: number
}
interface Bekci {
  satir: (ob: Onbellek | null, simdi: number, esik?: number) => string | null
  kapanis: (o: {
    bekleSn?: number
    olc?: () => Promise<Durum>
    saat?: () => number
    uyku?: (ms: number) => Promise<void>
    yaz?: (s: string) => void
  }) => Promise<number>
  httpDurum: (port?: number, zamanAsimiMs?: number) => Promise<Durum>
  ESIK: number
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks', 'hafiza-kuyrugu.cjs')
const hk = createRequire(import.meta.url)(KANCA) as Bekci
const SIMDI = Date.parse('2026-09-30T07:00:00Z')

const ob = (derinlik: number | null, ekstra: Partial<Onbellek> = {}): Onbellek => ({
  ts: SIMDI - 30_000,
  calisiyor: true,
  derinlik,
  isleniyor: true,
  parked: 0,
  ...ekstra,
})

describe('INV-HAFIZA-KUYRUGU-1: eşik satırı eşikli ve ayırt edici', () => {
  it('eşiğin altında SESSİZ; eşikte ve üstünde KONUŞUR, olay sayısını ve kapanış komutunu söyler', () => {
    expect(hk.ESIK).toBe(300)
    expect(hk.satir(ob(299), SIMDI)).toBeNull()
    expect(hk.satir(ob(0), SIMDI)).toBeNull()
    const s = hk.satir(ob(300, { ts: SIMDI }), SIMDI)
    expect(s).toMatch(/^⚠HAFIZA KUYRUK: 300 olay islenmeyi bekliyor \(esik 300, 0 dk once olculdu\)/)
    expect(s).toMatch(/YALNIZ BELLEKTE: makine kapanirsa hepsi kaybolur/)
    expect(s).toMatch(/hafiza-kuyrugu\.cjs --kapanis --bekle 300/)
    expect(hk.satir(ob(5469), SIMDI)).toMatch(/: 5469 olay/)
  })

  it('worker kapalıyken ve derinlik bilinmiyorken SESSİZ (kaybedilecek kuyruk yok / uydurma sayı yok)', () => {
    expect(hk.satir({ ts: SIMDI, calisiyor: false }, SIMDI)).toBeNull()
    expect(hk.satir(ob(null), SIMDI)).toBeNull()
  })

  it('önbellek yoksa SESSİZ; 15 dakikadan bayatsa "OLCULEMEDI" der (ölçüm düşüyor)', () => {
    expect(hk.satir(null, SIMDI)).toBeNull()
    expect(hk.satir(ob(10, { ts: SIMDI - 14 * 60_000 }), SIMDI)).toBeNull()
    expect(hk.satir(ob(10, { ts: SIMDI - 16 * 60_000 }), SIMDI)).toMatch(/^⚠HAFIZA KUYRUK: OLCULEMEDI \(onbellek 16 dk bayat/)
  })

  it('eşik parametreyle değişir (ortam değişkeninin dayanağı)', () => {
    expect(hk.satir(ob(100), SIMDI, 100)).toMatch(/100 olay/)
    expect(hk.satir(ob(100), SIMDI, 101)).toBeNull()
  })
})

describe('INV-HAFIZA-KUYRUGU-1: kapanış kolu çıkış kodu ve kayıp sayısı', () => {
  const sessiz = () => Promise.resolve()
  const topla = () => {
    const satirlar: string[] = []
    return { satirlar, yaz: (s: string) => satirlar.push(s) }
  }

  it('worker kapalı → 0; kuyruk boş ve işlem yok → 0', async () => {
    const a = topla()
    expect(await hk.kapanis({ olc: async () => ({ calisiyor: false }), uyku: sessiz, yaz: a.yaz })).toBe(0)
    expect(a.satirlar.join('\n')).toMatch(/worker kapali/)
    const b = topla()
    expect(await hk.kapanis({ olc: async () => ({ calisiyor: true, derinlik: 0, isleniyor: false }), uyku: sessiz, yaz: b.yaz })).toBe(0)
    expect(b.satirlar.join('\n')).toMatch(/bos, islem yok/)
  })

  it('kuyruk dolu, bekleme yok → 2 ve kaç olayın kaybolacağı yazılır', async () => {
    const a = topla()
    const kod = await hk.kapanis({ olc: async () => ({ calisiyor: true, derinlik: 659, isleniyor: true }), uyku: sessiz, yaz: a.yaz })
    expect(kod).toBe(2)
    expect(a.satirlar.join('\n')).toMatch(/659 olay hala bekliyor.*KAPATIRSAN KAYBOLUR/)
  })

  it('derinlik 0 ama işlem sürüyor → boş sayılmaz (son olaylar işleniyor); işlem bitince 0', async () => {
    const seri: Durum[] = [
      { calisiyor: true, derinlik: 0, isleniyor: true },
      { calisiyor: true, derinlik: 0, isleniyor: false },
    ]
    let i = 0
    let t = 0
    const a = topla()
    const kod = await hk.kapanis({
      bekleSn: 60,
      olc: async () => seri[Math.min(i++, seri.length - 1)],
      saat: () => t,
      uyku: async (ms) => {
        t += ms
      },
      yaz: a.yaz,
    })
    expect(kod).toBe(0)
    expect(i).toBe(2)
  })

  it('--bekle: kuyruk boşalırsa 0; boşalmazsa süre dolunca 2 (sahte saatle, gerçek bekleme yok)', async () => {
    let t = 0
    const seri = [400, 250, 90, 0]
    let i = 0
    const a = topla()
    const bosalan = await hk.kapanis({
      bekleSn: 300,
      olc: async () => ({ calisiyor: true, derinlik: seri[Math.min(i++, seri.length - 1)], isleniyor: false }),
      saat: () => t,
      uyku: async (ms) => {
        t += ms
      },
      yaz: a.yaz,
    })
    expect(bosalan).toBe(0)
    expect(a.satirlar.some((s) => /bosalmasi bekleniyor/.test(s))).toBe(true)

    t = 0
    const b = topla()
    const bosalmayan = await hk.kapanis({
      bekleSn: 20,
      olc: async () => ({ calisiyor: true, derinlik: 500, isleniyor: true }),
      saat: () => t,
      uyku: async (ms) => {
        t += ms
      },
      yaz: b.yaz,
    })
    expect(bosalmayan).toBe(2)
    expect(b.satirlar[b.satirlar.length - 1]).toMatch(/500 olay hala bekliyor.*\(islem suruyor\).*\(20 sn beklendi\).*KAYBOLUR/)
  })

  it('worker açık ama sayı okunamıyorsa 3 (uydurma "boş" demez)', async () => {
    const a = topla()
    expect(await hk.kapanis({ olc: async () => ({ calisiyor: true, derinlik: null }), uyku: sessiz, yaz: a.yaz })).toBe(3)
    expect(a.satirlar.join('\n')).toMatch(/OLCULEMEDI/)
  })
})

describe('INV-HAFIZA-KUYRUGU-1: gerçek HTTP yolu (yerel sahte worker)', () => {
  let sunucu: http.Server | null = null
  afterEach(async () => {
    await new Promise<void>((coz) => (sunucu ? sunucu.close(() => coz()) : coz()))
    sunucu = null
  })

  const baslat = (govde: string, durum = 200) =>
    new Promise<number>((coz) => {
      sunucu = http.createServer((istek, yanit) => {
        if (istek.url !== '/api/processing-status') {
          yanit.statusCode = 404
          yanit.end('yok')
          return
        }
        yanit.statusCode = durum
        yanit.setHeader('content-type', 'application/json')
        yanit.end(govde)
      })
      sunucu.listen(0, '127.0.0.1', () => coz((sunucu!.address() as AddressInfo).port))
    })

  it('worker yanıtını ayrıştırır: derinlik, işlem, park edilmiş oturum', async () => {
    const p = await baslat('{"isProcessing":true,"queueDepth":713,"parkedSessions":3}')
    expect(await hk.httpDurum(p)).toEqual({ calisiyor: true, derinlik: 713, isleniyor: true, parked: 3 })
  })

  it('bozuk yanıtta derinlik null (uydurma sayı yok); kapalı portta calisiyor:false', async () => {
    const p = await baslat('bu json degil')
    expect(await hk.httpDurum(p)).toEqual({ calisiyor: true, derinlik: null })
    await new Promise<void>((coz) => sunucu!.close(() => coz()))
    sunucu = null
    expect(await hk.httpDurum(p, 500)).toEqual({ calisiyor: false })
  })

  it('CLI --kapanis: dolu kuyrukta çıkış 2 ve olay sayısı, --tazele önbelleği atomik yazar', async () => {
    const p = await baslat('{"isProcessing":false,"queueDepth":42,"parkedSessions":0}')
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-kuyrugu-'))
    const onbellek = path.join(gecici, 'kuyruk.json')
    const env = { ...process.env, VENTHUB_CLAUDE_MEM_PORT: String(p), VENTHUB_HAFIZA_KUYRUK_ONBELLEK: onbellek }
    const calistir = (args: string[]) =>
      new Promise<{ kod: number; cikti: string }>((coz) => {
        execFile(process.execPath, [KANCA, ...args], { env, windowsHide: true, timeout: 20_000 }, (hata, cikti) => {
          coz({ kod: hata ? Number((hata as NodeJS.ErrnoException & { code?: number }).code ?? 1) : 0, cikti })
        })
      })
    const k = await calistir(['--kapanis'])
    expect(k.kod).toBe(2)
    expect(k.cikti).toMatch(/42 olay hala bekliyor/)

    await calistir(['--tazele'])
    const yazilan = JSON.parse(fs.readFileSync(onbellek, 'utf8')) as Onbellek
    expect(yazilan).toMatchObject({ calisiyor: true, derinlik: 42, isleniyor: false })
    expect(typeof yazilan.ts).toBe('number')
    expect(fs.existsSync(onbellek + '.tmp')).toBe(false)
    fs.rmSync(gecici, { recursive: true, force: true })
  })
})
