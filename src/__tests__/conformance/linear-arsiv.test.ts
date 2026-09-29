import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-LINEAR-ARSIV-1 · kapanmış Linear kayıtları günde bir kez ARŞİVLENİR (karar 187, REC-433).
 *
 * NİÇİN: Linear ücretsiz planı 250 arşivlenmemiş kayıtta doluyor; dolunca alt kayıt açılamıyor ve
 * karar 187'nin "her PR kendi kaydını Fixes eder" düzeni durur. Arşiv sistem bakımıdır.
 *
 * ŞARTLAR: yeni depo sırrı YOK (anahtar yalnız yerel ortam) · LLM YOK · günde EN ÇOK BİR kez ·
 * GERİ ALINABİLİR, SİLME YOK (her arşivlenen kimlik günlüğe yazılır) · anahtar hiçbir çıktıya basılmaz.
 *
 * Betik `scripts/board/linear-arsiv.cjs`; tetik `.claude/hooks/session-board.cjs` (SessionStart, kopuk+gizli).
 */

interface Aday {
  id: string
  identifier: string
}
interface Sonuc {
  arsivlenen: Aday[]
  aday: number
  hata?: string
}
interface Arsiv {
  sinirTarihi: (now: string, gun?: number) => string
  listeSorgusu: (sinir: string) => { query: string; variables: { sinir: string; n: number } }
  arsivMutasyonu: (idler: string[]) => { query: string }
  parcala: <T>(liste: T[], n: number) => T[][]
  calistir: (a: { anahtar: string; now: string; kuru?: boolean; fetchFn: FetchFn }) => Promise<Sonuc>
  gunlukGerekli: (now: string, dir: string) => boolean
  gunlukBaslat: (a: { anahtar?: string; now?: string; baslat?: (b: string, args: string[]) => void; dir?: string }) => boolean
  damgaYaz: (now: string, dir: string) => void
  gunlugeYaz: (now: string, s: Sonuc, dir: string) => void
}
type FetchFn = (url: string, init: { body: string }) => Promise<{ ok: boolean; status?: number; json: () => Promise<unknown> }>

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/board/linear-arsiv.cjs')
const arsiv = require_(BETIK) as Arsiv

const NOW = '2026-09-29T12:00:00.000Z'
const uuid = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
const adaylar = (n: number): Aday[] => Array.from({ length: n }, (_, i) => ({ id: uuid(i + 1), identifier: `REC-${i + 1}` }))

/** Sahte Linear: liste sorgusuna sıradaki aday kümesini verir, mutasyonda `basarisiz` kimlikleri false döner. */
function sahteLinear(kumeler: Aday[][], basarisiz: Set<string> = new Set()) {
  const cagrilar: string[] = []
  let sira = 0
  const fetchFn: FetchFn = async (_u, init) => {
    const govde = JSON.parse(init.body) as { query: string }
    cagrilar.push(govde.query)
    if (govde.query.startsWith('mutation')) {
      const data: Record<string, { success: boolean }> = {}
      const idler = [...govde.query.matchAll(/issueArchive\(id: "([^"]+)"\)/g)].map((m) => m[1])
      idler.forEach((id, i) => {
        data['a' + i] = { success: !basarisiz.has(id) }
      })
      return { ok: true, json: async () => ({ data }) }
    }
    const nodes = kumeler[sira] ?? []
    sira += 1
    return { ok: true, json: async () => ({ data: { issues: { nodes } } }) }
  }
  return { fetchFn, cagrilar }
}

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'linear-arsiv-'))
})
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('INV-LINEAR-ARSIV-1 · sorgu ve mutasyon üretimi', () => {
  it('sınır tarihi iki gün geridedir', () => {
    expect(arsiv.sinirTarihi(NOW)).toBe('2026-09-27T12:00:00.000Z')
    expect(arsiv.sinirTarihi(NOW, 30)).toBe('2026-08-30T12:00:00.000Z')
  })

  it('liste sorgusu YALNIZ completed/canceled ve tarih sınırlı; sınır değişkenle geçer', () => {
    const s = arsiv.listeSorgusu('2026-09-27T12:00:00.000Z')
    expect(s.query).toContain('"completed","canceled"')
    expect(s.query).toContain('completedAt')
    expect(s.query).toContain('canceledAt')
    expect(s.query).not.toContain('started')
    expect(s.variables.sinir).toBe('2026-09-27T12:00:00.000Z')
  })

  it('arşiv mutasyonu kayıt başına bir takma adlı issueArchive üretir, SİLME mutasyonu üretmez', () => {
    const m = arsiv.arsivMutasyonu([uuid(1), uuid(2)]).query
    expect(m.startsWith('mutation')).toBe(true)
    expect(m).toContain('a0: issueArchive')
    expect(m).toContain('a1: issueArchive')
    expect(m.toLowerCase()).not.toContain('issuedelete')
  })

  it('UUID olmayan kimlik (enjeksiyon) reddedilir', () => {
    expect(() => arsiv.arsivMutasyonu(['x") { success } evil: issueDelete(id: "1'])).toThrow()
  })

  it('parcala listeyi sıralı parçalara böler', () => {
    expect(arsiv.parcala([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(arsiv.parcala([], 20)).toEqual([])
  })
})

describe('INV-LINEAR-ARSIV-1 · koşum', () => {
  it('anahtar yoksa hiçbir çağrı yapılmaz ve "ölçülemedi" döner', async () => {
    const { fetchFn, cagrilar } = sahteLinear([adaylar(3)])
    const s = await arsiv.calistir({ anahtar: '', now: NOW, fetchFn })
    expect(s.hata).toContain('LINEAR_API_KEY')
    expect(cagrilar).toHaveLength(0)
  })

  it('KURU koşum adayları listeler, YAZMA çağrısı yapmaz', async () => {
    const { fetchFn, cagrilar } = sahteLinear([adaylar(5)])
    const s = await arsiv.calistir({ anahtar: 'k'.repeat(20), now: NOW, kuru: true, fetchFn })
    expect(s.arsivlenen).toHaveLength(5)
    expect(cagrilar.some((q) => q.startsWith('mutation'))).toBe(false)
  })

  it('gerçek koşum 20\'lik parçalarla arşivler (45 aday = 3 mutasyon)', async () => {
    const { fetchFn, cagrilar } = sahteLinear([adaylar(45)])
    const s = await arsiv.calistir({ anahtar: 'k'.repeat(20), now: NOW, fetchFn })
    expect(s.arsivlenen).toHaveLength(45)
    expect(cagrilar.filter((q) => q.startsWith('mutation'))).toHaveLength(3)
  })

  it('başarısız arşivlenen kayıt sonuca GİRMEZ (yalnız success:true sayılır)', async () => {
    const hepsi = adaylar(4)
    const { fetchFn } = sahteLinear([hepsi], new Set([uuid(2)]))
    const s = await arsiv.calistir({ anahtar: 'k'.repeat(20), now: NOW, fetchFn })
    expect(s.arsivlenen.map((a) => a.identifier)).toEqual(['REC-1', 'REC-3', 'REC-4'])
  })

  it('aday yoksa mutasyon yapılmaz', async () => {
    const { fetchFn, cagrilar } = sahteLinear([[]])
    const s = await arsiv.calistir({ anahtar: 'k'.repeat(20), now: NOW, fetchFn })
    expect(s.arsivlenen).toHaveLength(0)
    expect(cagrilar.some((q) => q.startsWith('mutation'))).toBe(false)
  })

  it('ağ/Linear hatası çökmez, hata alanı doludur ve o ana dek arşivlenenler korunur', async () => {
    let n = 0
    const fetchFn: FetchFn = async (_u, init) => {
      const q = (JSON.parse(init.body) as { query: string }).query
      n += 1
      if (q.startsWith('mutation') && n > 2) return { ok: false, status: 500, json: async () => ({}) }
      if (q.startsWith('mutation')) return { ok: true, json: async () => ({ data: Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['a' + i, { success: true }])) }) }
      return { ok: true, json: async () => ({ data: { issues: { nodes: adaylar(45) } } }) }
    }
    const s = await arsiv.calistir({ anahtar: 'k'.repeat(20), now: NOW, fetchFn })
    expect(s.hata).toContain('HTTP 500')
    expect(s.arsivlenen).toHaveLength(20)
  })
})

describe('INV-LINEAR-ARSIV-1 · günde bir kez', () => {
  it('damga yoksa gerekli; bugünün damgası varsa gerekmez; ertesi gün yine gerekli', () => {
    expect(arsiv.gunlukGerekli(NOW, dir)).toBe(true)
    arsiv.damgaYaz(NOW, dir)
    expect(arsiv.gunlukGerekli(NOW, dir)).toBe(false)
    expect(arsiv.gunlukGerekli('2026-09-30T08:00:00.000Z', dir)).toBe(true)
  })

  it('gunlukBaslat: anahtar yoksa başlatmaz', () => {
    let sayac = 0
    expect(arsiv.gunlukBaslat({ anahtar: '', now: NOW, baslat: () => { sayac += 1 }, dir })).toBe(false)
    expect(sayac).toBe(0)
  })

  it('gunlukBaslat: bir kez başlatır, 15 dk içinde ikinci oturum yeniden başlatmaz', () => {
    const cagrilar: string[][] = []
    const baslat = (_b: string, args: string[]) => { cagrilar.push(args) }
    expect(arsiv.gunlukBaslat({ anahtar: 'k'.repeat(20), now: NOW, baslat, dir })).toBe(true)
    expect(cagrilar[0]).toEqual(['--calistir'])
    expect(arsiv.gunlukBaslat({ anahtar: 'k'.repeat(20), now: '2026-09-29T12:05:00.000Z', baslat, dir })).toBe(false)
    expect(cagrilar).toHaveLength(1)
  })

  it('kilit 15 dk sonra düşer (takılı süreç sonsuza dek engellemez)', () => {
    const baslat = () => {}
    arsiv.gunlukBaslat({ anahtar: 'k'.repeat(20), now: NOW, baslat, dir })
    expect(arsiv.gunlukBaslat({ anahtar: 'k'.repeat(20), now: '2026-09-29T12:16:00.000Z', baslat, dir })).toBe(true)
  })

  it('günlük her arşivlenen kimliği yazar (geri alınabilirlik)', () => {
    arsiv.gunlugeYaz(NOW, { arsivlenen: adaylar(2), aday: 2 }, dir)
    const satir = JSON.parse(fs.readFileSync(path.join(dir, 'gunluk.jsonl'), 'utf8').trim()) as { arsivlenen: Aday[] }
    expect(satir.arsivlenen.map((a) => a.id)).toEqual([uuid(1), uuid(2)])
  })
})

describe('INV-LINEAR-ARSIV-1 · güvenlik ve CLI', () => {
  it('CLI anahtar yokken çökmeden "OLCULEMEDI" der, çıkış 0', () => {
    const r = spawnSync(process.execPath, [BETIK], { env: { ...process.env, LINEAR_API_KEY: '', VENTHUB_LINEAR_ARSIV_DIZIN: dir }, encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('OLCULEMEDI')
  })

  it('kaynakta anahtar hiçbir console çıktısına girmez ve silme mutasyonu yoktur', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const konsolSatirlari = kaynak.split('\n').filter((s) => s.includes('console.'))
    expect(konsolSatirlari.some((s) => /anahtar/i.test(s))).toBe(false)
    expect(kaynak).not.toMatch(/issueDelete|issueArchive\([^)]*permanentlyDelete/)
  })

  it('SessionStart kancası betiği kopuk ve gizli başlatıcıyla tetikler (doğrudan spawn yok)', () => {
    const kanca = fs.readFileSync(path.join(KOK, '.claude/hooks/session-board.cjs'), 'utf8')
    expect(kanca).toContain('linear-arsiv.cjs')
    expect(kanca).toContain('gunlukBaslat')
    expect(kanca).toContain('kopukBaslat')
  })
})
