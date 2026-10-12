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
  yazmaKarari: (o: { mevcut: string; sid: string; kaynak?: string }) => { yaz: boolean; sebep: string }
  acilistaYaz: (o: {
    sid: string
    kaynak?: string
    cwd?: string
    agentType?: string
    dosya?: string
    simdi?: number
  }) => { yazildi: boolean; sebep: string }
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

  it('İKİ OPS ADAYI: kayıtlı kimlik varken öteki adayın resume/compact açılışı onu EZMEZ; sıfırdan açılış (startup) devralır', () => {
    const d = yeni()
    mod.acilistaYaz({ sid: YENI, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d })
    const resume = mod.acilistaYaz({ sid: ESKI, kaynak: 'resume', cwd: pencere('ops-pencere'), dosya: d })
    expect(resume.yazildi).toBe(false)
    expect(mod.oku(d)).toBe(YENI)
    const compact = mod.acilistaYaz({ sid: ESKI, kaynak: 'compact', cwd: pencere('ops-pencere'), dosya: d })
    expect(compact.yazildi).toBe(false)
    expect(mod.oku(d)).toBe(YENI)
    // kayıtlı OPS kendi resume'unda dosyayı tazeler
    expect(mod.acilistaYaz({ sid: YENI, kaynak: 'resume', cwd: pencere('ops-pencere'), dosya: d }).yazildi).toBe(true)
    // yeni bir OPS penceresi sıfırdan açılınca devralır
    expect(mod.acilistaYaz({ sid: ESKI, kaynak: 'startup', cwd: pencere('ops-pencere'), dosya: d }).yazildi).toBe(true)
    expect(mod.oku(d)).toBe(ESKI)
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
