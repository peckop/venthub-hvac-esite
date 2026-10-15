// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-OPS-OTURUMU-1..3 · OPS oturum kimliği TEK kaynak (ARC-99, 2026-10-12).
 *
 * Vaka: kokpit düğmeleri, linear-zil ve session-board lider testi OPS oturum kimliğini kodda sabit tutuyordu; OPS
 * penceresi değişince Recep'in kokpit düğmesi eski pencereye düşüyordu. Kimlik artık `ops-oturumu.json`'dadır, yalnız
 * OPS penceresinin kendisi (agent: ops-pencere) açılışta yazar ve başka bir kimlik dosyadayken resume/compact yazmaz.
 */

interface Modul {
  oku: (dosya?: string) => string
  kimlikMi: (sid: string, dosya?: string) => boolean
  opsAdayiMi: (o?: { cwd?: string; agentType?: string }) => boolean
  yazmaKarari: (o: {
    mevcut: string
    sid: string
    kaynak?: string
    mevcutCanli?: boolean | null
  }) => { yaz: boolean; sebep: string }
  canliMi: (sid: string, o?: { dizin?: string; yasiyor?: (pid: number) => boolean }) => boolean | null
  etkilesimliMi: (sid: string, o?: { dizin?: string }) => boolean
  acilistaYaz: (o: {
    sid: string
    kaynak?: string
    cwd?: string
    agentType?: string
    dosya?: string
    simdi?: number
    oturumler?: string
    yasiyor?: (pid: number) => boolean
  }) => { yazildi: boolean; sebep: string; mevcut?: string; mevcutCanli?: boolean | null }
}

const KOK = process.cwd()
const req = createRequire(import.meta.url)
const mod = req(path.resolve(KOK, 'scripts', 'board', 'ops-oturumu.cjs')) as Modul

const YENI = '69c8cf17-b9d3-4ebf-8cab-a41161241d67'
const ESKI = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'

let kok: string
let n = 0
const yeni = (): string => path.join(kok, 'oturum-' + ++n + '.json')
const pencere = (ajan: string | null): string => {
  const d = path.join(kok, 'pencere-' + ++n)
  fs.mkdirSync(path.join(d, '.claude'), { recursive: true })
  if (ajan !== null) fs.writeFileSync(path.join(d, '.claude', 'settings.local.json'), JSON.stringify({ agent: ajan }))
  return d
}
/** Açık pencere kayıt dizini (Claude Code `<pid>.json`): her giriş { sessionId, pid?, kind? }. */
const kayitDizini = (girdiler: Array<{ sid: string; pid?: number; kind?: string }>): string => {
  const d = path.join(kok, 'sessions-' + ++n)
  fs.mkdirSync(d, { recursive: true })
  girdiler.forEach((g, i) => {
    const j: Record<string, unknown> = { sessionId: g.sid }
    if (g.pid !== undefined) j.pid = g.pid
    if (g.kind !== undefined) j.kind = g.kind
    fs.writeFileSync(path.join(d, String(g.pid ?? 9000 + i) + '.json'), JSON.stringify(j))
  })
  return d
}
// Sahte süreç tablosu: yalnız 111 ve 222 numaralı süreçler "yaşıyor" (gerçek pid'e bağlı test yok).
const yasiyor = (pid: number): boolean => pid === 111 || pid === 222
const OLU = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'

beforeAll(() => {
  kok = fs.mkdtempSync(path.join(os.tmpdir(), 'ops-oturumu-'))
})
afterAll(() => {
  fs.rmSync(kok, { recursive: true, force: true })
})

describe('INV-OPS-OTURUMU-1: okuma güvenli (yok/bozuk = kimlik YOK)', () => {
  it('kayıt yok, bozuk ya da geçersiz kimlik → boş ve kimlikMi false', () => {
    const yok = yeni()
    expect(mod.oku(yok)).toBe('')
    expect(mod.kimlikMi(YENI, yok)).toBe(false)
    const bozuk = yeni()
    fs.writeFileSync(bozuk, '{bozuk')
    expect(mod.oku(bozuk)).toBe('')
    const gecersiz = yeni()
    fs.writeFileSync(gecersiz, JSON.stringify({ sid: 'cb0467f1' }))
    expect(mod.oku(gecersiz)).toBe('')
  })

  it('geçerli kayıt: yalnız o oturum OPS sayılır (büyük/küçük harf fark etmez)', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: YENI.toUpperCase() }))
    expect(mod.oku(d)).toBe(YENI)
    expect(mod.kimlikMi(YENI, d)).toBe(true)
    expect(mod.kimlikMi(ESKI, d)).toBe(false)
    expect(mod.kimlikMi('', d)).toBe(false)
  })
})

describe('INV-OPS-OTURUMU-2: kim aday, kim yazar', () => {
  it('aday: settings.local.json agent = ops-pencere (üst klasöre kadar aranır); başka ajan ya da ayarsız pencere aday DEĞİL', () => {
    expect(mod.opsAdayiMi({ cwd: pencere('ops-pencere') })).toBe(true)
    const alt = path.join(pencere('ops-pencere'), 'src', 'x')
    fs.mkdirSync(alt, { recursive: true })
    expect(mod.opsAdayiMi({ cwd: alt })).toBe(true)
    expect(mod.opsAdayiMi({ cwd: pencere('arac-pencere') })).toBe(false)
    expect(mod.opsAdayiMi({ cwd: pencere(null) })).toBe(false)
    expect(mod.opsAdayiMi({ cwd: pencere(null), agentType: 'ops-pencere' })).toBe(true)
  })

  it('yazma kararı tablosu', () => {
    const k = mod.yazmaKarari
    expect(k({ mevcut: '', sid: YENI, kaynak: 'resume' }).yaz).toBe(true) // kayıt yok
    expect(k({ mevcut: YENI, sid: YENI, kaynak: 'resume' }).yaz).toBe(true) // aynı pencere yenilenir
    expect(k({ mevcut: ESKI, sid: YENI, kaynak: 'startup' }).yaz).toBe(true) // sıfırdan açılan yeni OPS
    for (const kaynak of ['resume', 'compact', 'clear', undefined]) {
      expect(k({ mevcut: ESKI, sid: YENI, kaynak }).yaz, String(kaynak)).toBe(false) // "son yazan kazanır" yok
    }
    expect(k({ mevcut: '', sid: 'bozuk', kaynak: 'startup' }).yaz).toBe(false)
  })
})

describe('INV-OPS-OTURUMU-3: açılışta yazma (iki OPS adayı, eski pencere)', () => {
  it('aday olmayan pencere HİÇ yazmaz (eski OPS, departman penceresi)', () => {
    const d = yeni()
    const r = mod.acilistaYaz({ sid: ESKI, kaynak: 'startup', cwd: pencere(null), dosya: d })
    expect(r.yazildi).toBe(false)
    expect(fs.existsSync(d)).toBe(false)
  })

  it('aday yeni OPS açılışta yazar', () => {
    const d = yeni()
    const r = mod.acilistaYaz({ sid: YENI, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d, simdi: 1 })
    expect(r.yazildi).toBe(true)
    expect(mod.oku(d)).toBe(YENI)
  })

  it('İKİ OPS ADAYI (kayıtlı kimlik CANLI): öteki adayın resume/compact/startup açılışı onu EZMEZ; kayıtlı OPS kendi resume\'unda tazeler', () => {
    const d = yeni()
    const oturumler = kayitDizini([{ sid: YENI, pid: 111 }, { sid: ESKI, pid: 222 }])
    const ortak = { dosya: d, oturumler, yasiyor }
    mod.acilistaYaz({ sid: YENI, kaynak: 'startup', cwd: pencere('ops-pencere'), ...ortak })
    for (const kaynak of ['resume', 'compact', 'startup']) {
      const r = mod.acilistaYaz({ sid: ESKI, kaynak, cwd: pencere('ops-pencere'), ...ortak })
      expect(r.yazildi, kaynak).toBe(false)
      expect(r.sebep, kaynak).toBe('kayitli-kimlik-canli')
      expect(mod.oku(d), kaynak).toBe(YENI)
    }
    expect(mod.acilistaYaz({ sid: YENI, kaynak: 'resume', cwd: pencere('ops-pencere'), ...ortak }).yazildi).toBe(true)
  })

  it('yazma hatası açılışı bozmaz (dosya yolu bir dizin)', () => {
    const r = mod.acilistaYaz({ sid: YENI, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: kok })
    expect(r.yazildi).toBe(false)
  })

  it('elle düzeltme: CLI --yaz kimliği yazar, geçersiz kimlik reddedilir', () => {
    const d = yeni()
    const ortam = { ...process.env, VH_OPS_OTURUMU_DOSYASI: d }
    const bin = path.resolve(KOK, 'scripts', 'board', 'ops-oturumu.cjs')
    const iyi = spawnSync(process.execPath, [bin, '--yaz', YENI], { env: ortam, encoding: 'utf8' })
    expect(iyi.status).toBe(0)
    expect(mod.oku(d)).toBe(YENI)
    const kotu = spawnSync(process.execPath, [bin, '--yaz', 'cb0467f1'], { env: ortam, encoding: 'utf8' })
    expect(kotu.status).toBe(2)
    expect(mod.oku(d)).toBe(YENI)
  })

  it('kodda sabit OPS oturum kimliği yok: session-board.cjs kimliği dosyadan okur', () => {
    const kaynak = fs.readFileSync(path.resolve(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kaynak).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    expect(kaynak).toContain('ops-oturumu.cjs')
  })
})

/**
 * INV-OPS-OTURUMU-4 · yazma kuralı kayıtlı kimliğin CANLILIĞINA bakar (ARC-140, 15 Ekim).
 *
 * Vaka: 14 Ekim 15:40'ta Desktop'ın açıp 15:52'de sildiği geçici worktree oturumu (OPS ajan ayarlı startup) dosyayı
 * ele geçirdi; gerçek OPS resume ile dönünce eski kural (yalnız kaynağa bakar) onu reddetti, kokpit Recep'i yabancı saydı.
 */
describe('INV-OPS-OTURUMU-4: kayıtlı kimlik ölüyse canlı aday devralır, canlıysa HİÇBİR açılış ezmez', () => {
  it('14 Ekim yeniden oynatma: dosya ölü geçici oturumda, gerçek OPS resume ile döner → devralır, eskisi onceki olur', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: OLU, ts: 1, kaynak: 'startup' }))
    const oturumler = kayitDizini([{ sid: YENI, pid: 111 }]) // OLU için pencere kaydı yok (worktree silindi)
    const r = mod.acilistaYaz({ sid: YENI, kaynak: 'resume', cwd: pencere('ops-pencere'), dosya: d, oturumler, yasiyor })
    expect(r).toMatchObject({ yazildi: true, sebep: 'kayitli-kimlik-olu', mevcut: OLU, mevcutCanli: false })
    expect(mod.oku(d)).toBe(YENI)
    expect(JSON.parse(fs.readFileSync(d, 'utf8')).onceki).toBe(OLU)
  })

  it('ters yön: canlı OPS varken yabancı bir startup (Desktop geçici worktree) dosyayı ÇALAMAZ', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: YENI, ts: 1, kaynak: 'startup' }))
    const oturumler = kayitDizini([{ sid: YENI, pid: 111 }, { sid: OLU, pid: 222 }])
    const once = fs.readFileSync(d, 'utf8')
    const r = mod.acilistaYaz({ sid: OLU, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d, oturumler, yasiyor })
    expect(r).toMatchObject({ yazildi: false, sebep: 'kayitli-kimlik-canli', mevcut: YENI, mevcutCanli: true })
    expect(fs.readFileSync(d, 'utf8')).toBe(once)
  })

  it('pencere kaydı var ama süreç ölü (çökme artığı) → ölü sayılır, aday devralır', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: OLU, ts: 1, kaynak: 'startup' }))
    const oturumler = kayitDizini([{ sid: OLU, pid: 999 }, { sid: YENI, pid: 111 }])
    expect(mod.canliMi(OLU, { dizin: oturumler, yasiyor })).toBe(false)
    expect(mod.acilistaYaz({ sid: YENI, kaynak: 'compact', cwd: pencere('ops-pencere'), dosya: d, oturumler, yasiyor }).yazildi).toBe(true)
    expect(mod.oku(d)).toBe(YENI)
  })

  it('canlılık ÖLÇÜLEMEDİ (kayıt dizini yok): "ölü" varsayılmaz, ARC-99 kuralı geçerli (startup yazar, resume/compact yazmaz)', () => {
    const d = yeni()
    const yok = path.join(kok, 'olmayan-dizin-' + ++n)
    fs.writeFileSync(d, JSON.stringify({ sid: OLU, ts: 1, kaynak: 'startup' }))
    expect(mod.canliMi(OLU, { dizin: yok })).toBeNull()
    expect(mod.acilistaYaz({ sid: YENI, kaynak: 'resume', cwd: pencere('ops-pencere'), dosya: d, oturumler: yok }).yazildi).toBe(false)
    expect(mod.oku(d)).toBe(OLU)
    expect(mod.acilistaYaz({ sid: YENI, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d, oturumler: yok }).yazildi).toBe(true)
    expect(mod.oku(d)).toBe(YENI)
  })

  it('etkileşimli olmayan süreç (claude -p / SDK) aday olsa da yazmaz; kind yok ya da interactive ise engel yok', () => {
    const d = yeni()
    const oturumler = kayitDizini([
      { sid: OLU, pid: 222, kind: 'sdk-cli' },
      { sid: YENI, pid: 111, kind: 'interactive' },
    ])
    expect(mod.etkilesimliMi(OLU, { dizin: oturumler })).toBe(false)
    expect(mod.etkilesimliMi(YENI, { dizin: oturumler })).toBe(true)
    expect(mod.etkilesimliMi(ESKI, { dizin: oturumler })).toBe(true) // kayıt yok: engellenmez
    const r = mod.acilistaYaz({ sid: OLU, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d, oturumler, yasiyor })
    expect(r).toMatchObject({ yazildi: false, sebep: 'etkilesimli-degil' })
    expect(fs.existsSync(d)).toBe(false)
  })

  it('aynı pencerenin yenilenmesi onceki zincirini silmez', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: OLU, ts: 1, kaynak: 'startup' }))
    const oturumler = kayitDizini([{ sid: YENI, pid: 111 }])
    const ortak = { cwd: pencere('ops-pencere'), dosya: d, oturumler, yasiyor }
    mod.acilistaYaz({ sid: YENI, kaynak: 'resume', ...ortak })
    mod.acilistaYaz({ sid: YENI, kaynak: 'compact', ...ortak })
    expect(JSON.parse(fs.readFileSync(d, 'utf8'))).toMatchObject({ sid: YENI, kaynak: 'compact', onceki: OLU })
  })

  it('yazma kararı tablosu (canlılıkla): canlı → hiçbiri yazmaz, ölü → hepsi yazar, ölçülemedi → eski tablo', () => {
    const k = mod.yazmaKarari
    for (const kaynak of ['startup', 'resume', 'compact', 'clear']) {
      expect(k({ mevcut: ESKI, sid: YENI, kaynak, mevcutCanli: true }).yaz, 'canli ' + kaynak).toBe(false)
      expect(k({ mevcut: ESKI, sid: YENI, kaynak, mevcutCanli: false }).yaz, 'olu ' + kaynak).toBe(true)
    }
    expect(k({ mevcut: ESKI, sid: YENI, kaynak: 'startup', mevcutCanli: null }).yaz).toBe(true)
    expect(k({ mevcut: ESKI, sid: YENI, kaynak: 'resume', mevcutCanli: null }).yaz).toBe(false)
  })

  it('argümansız CLI kimliği ve canlılığını yazar (OLU kimlik açıkça işaretlenir)', () => {
    const d = yeni()
    fs.writeFileSync(d, JSON.stringify({ sid: OLU, ts: 1, kaynak: 'startup' }))
    const oturumler = kayitDizini([{ sid: YENI, pid: 111 }])
    const bin = path.resolve(KOK, 'scripts', 'board', 'ops-oturumu.cjs')
    const r = spawnSync(process.execPath, [bin], {
      env: { ...process.env, VH_OPS_OTURUMU_DOSYASI: d, VENTHUB_SESSIONS_DIZINI: oturumler },
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain(OLU)
    expect(r.stdout).toContain('OLU')
  })

  it('session-board canlı başka kimlik varken uyarı bölümü basar (sessiz kalmaz)', () => {
    const kaynak = fs.readFileSync(path.resolve(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kaynak).toContain("opsYazma.sebep === 'kayitli-kimlik-canli'")
    expect(kaynak).toContain('--yaz')
  })
})
