import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-EDITED-2 · `edited` aynasının KARAR MANTIĞI (scripts/ci/edited-ayna.cjs).
 *
 * Tek değişmez: bir düzenleme KIRMIZI ya da BİLİNMEYEN bir durumu yeşile ÇEVİREMEZ. Atlama yalnız "aynı head SHA için
 * daha önce başlamış TAM koşu success bitti VE base dalı o koşudan sonra ilerlemedi" iken olur; geri kalan HER durum
 * (kırmızı, iptal, süren, belirsiz, ayna-yalnız, hata, taban değişmiş) tam koşuya düşer. Bu dosya o tabloyu ölçer.
 * Bağlantı (ci.yml adım adı, `if:` koşulları, sıra) ayrı: src/__tests__/conformance/ci-edited-ayna.test.ts.
 */

interface Aday {
  id: number
  status: string
  conclusion: string | null
  created_at: string
  tur: string
}
interface Modul {
  AYNA_ADIM_ADI: string
  BEKLEME_SN: number
  GUVENLIK_PAYI_SN: number
  karar: (g: { adaylar: Aday[]; tabanTarihi: string | null }) => { atla: boolean; bekle: boolean; neden: string }
  siniflandir: (isler: unknown) => string
  calistir: (g: {
    api: {
      kosular: (sha: string) => Promise<Array<Record<string, unknown>>>
      isler: (id: number) => Promise<unknown>
      tabanTarihi: (ref: string) => Promise<string | null>
    }
    sha: string
    baseRef: string
    kendiId: number
    bekle: (ms: number) => Promise<void>
    simdi: () => number
    bekleSn?: number
    aralikSn?: number
  }) => Promise<{ atla: boolean; neden: string }>
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const M = require_(path.join(KOK, 'scripts/ci/edited-ayna.cjs')) as Modul

const T0 = '2026-10-06T08:00:00Z'
const ESKI_TABAN = '2026-10-06T07:00:00Z'
const tam = (o: Partial<Aday> = {}): Aday => ({ id: 1, status: 'completed', conclusion: 'success', created_at: T0, tur: 'tam', ...o })

const jobs = (ayna?: string | null) => ({
  jobs: [{ name: 'ci', steps: [{ name: 'Checkout', conclusion: 'success' }, ...(ayna === undefined ? [] : [{ name: M.AYNA_ADIM_ADI, conclusion: ayna }])] }],
})

describe('siniflandir — koşu TAM mı, AYNA mı, BELİRSİZ mi', () => {
  it('ayna adımı hiç yok (bu değişiklikten ÖNCEKİ koşu) → tam', () => {
    expect(M.siniflandir(jobs(undefined))).toBe('tam')
  })
  it('ayna adımı skipped (edited olayı değildi) → tam', () => {
    expect(M.siniflandir(jobs('skipped'))).toBe('tam')
  })
  it('ayna adımı success (kendisi bir ayna koşusu) → ayna', () => {
    expect(M.siniflandir(jobs('success'))).toBe('ayna')
  })
  it('ayna adımı henüz sonuçsuz → belirsiz', () => {
    expect(M.siniflandir(jobs(null))).toBe('belirsiz')
  })
  it('ci işi görünmüyor ya da yanıt boş → belirsiz', () => {
    expect(M.siniflandir({ jobs: [] })).toBe('belirsiz')
    expect(M.siniflandir(null)).toBe('belirsiz')
  })
})

describe('karar — atlama YALNIZ tam yeşil + taban aynı iken', () => {
  it('tam koşu success ve base daha eski → ATLA', () => {
    const r = M.karar({ adaylar: [tam()], tabanTarihi: ESKI_TABAN })
    expect(r.atla).toBe(true)
  })
  it.each(['failure', 'cancelled', 'timed_out', 'skipped', 'neutral', null])('tam koşu sonucu %s → ATLAMA (yalnız success atlatır)', (sonuc) => {
    const r = M.karar({ adaylar: [tam({ conclusion: sonuc })], tabanTarihi: ESKI_TABAN })
    expect(r.atla).toBe(false)
    expect(r.bekle).toBe(false)
  })
  it('base dalı tam koşudan SONRA ilerlemiş → ATLAMA (taban değişti)', () => {
    const r = M.karar({ adaylar: [tam()], tabanTarihi: '2026-10-06T08:30:00Z' })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('ilerlemiş')
  })
  it('güvenlik payı: tam koşudan 120 sn önceki base commit atlatır, 119 sn öncesi atlatmaz', () => {
    const sinir = Date.parse(T0) - M.GUVENLIK_PAYI_SN * 1000
    expect(M.karar({ adaylar: [tam()], tabanTarihi: new Date(sinir).toISOString() }).atla).toBe(true)
    expect(M.karar({ adaylar: [tam()], tabanTarihi: new Date(sinir + 1000).toISOString() }).atla).toBe(false)
  })
  it('base tarihi okunamadıysa (null) → ATLAMA', () => {
    expect(M.karar({ adaylar: [tam()], tabanTarihi: null }).atla).toBe(false)
  })
  it('daha önce hiç koşu yok → ATLAMA', () => {
    expect(M.karar({ adaylar: [], tabanTarihi: ESKI_TABAN }).atla).toBe(false)
  })
  it('YALNIZ ayna koşuları var → ATLAMA (bir ayna başka bir aynayı doğrulayamaz)', () => {
    const r = M.karar({ adaylar: [tam({ tur: 'ayna', id: 7 })], tabanTarihi: ESKI_TABAN })
    expect(r.atla).toBe(false)
  })
  it('en YENİ tam koşu kırmızıysa eski yeşil tam koşu atlatmaz', () => {
    const r = M.karar({
      adaylar: [tam({ id: 1, created_at: '2026-10-06T07:50:00Z' }), tam({ id: 2, conclusion: 'failure', created_at: '2026-10-06T08:00:00Z' })],
      tabanTarihi: '2026-10-06T06:00:00Z',
    })
    expect(r.atla).toBe(false)
  })
  it('tam koşu SÜRÜYORSA bekle (atlama ve tam koşu kararı verilmez)', () => {
    const r = M.karar({ adaylar: [tam({ status: 'in_progress', conclusion: null })], tabanTarihi: ESKI_TABAN })
    expect(r).toMatchObject({ atla: false, bekle: true })
  })
  it('sınıflandırılamayan SÜREN yeni koşu varsa bekle', () => {
    const r = M.karar({ adaylar: [tam({ tur: 'belirsiz', status: 'in_progress', conclusion: null })], tabanTarihi: ESKI_TABAN })
    expect(r).toMatchObject({ atla: false, bekle: true })
  })
})

describe('calistir — akış, bekleme, hata', () => {
  const kosu = (o: Record<string, unknown> = {}) => ({ id: 1, status: 'completed', conclusion: 'success', created_at: T0, ...o })
  const kendi = { id: 99, status: 'in_progress', conclusion: null, created_at: '2026-10-06T08:10:00Z' }
  const saat = () => {
    let t = Date.parse('2026-10-06T08:10:00Z')
    return { simdi: () => t, bekle: async (ms: number) => void (t += ms) }
  }
  const api = (kosular: () => Array<Record<string, unknown>>, ayna: string | null | undefined = 'skipped') => ({
    kosular: async () => kosular(),
    isler: async () => jobs(ayna),
    tabanTarihi: async () => ESKI_TABAN,
  })

  it('yeşil tam koşu → ATLA', async () => {
    const s = saat()
    const r = await M.calistir({ api: api(() => [kendi, kosu()]), sha: 'abc', baseRef: 'master', kendiId: 99, ...s })
    expect(r.atla).toBe(true)
  })

  it('kendisinden YENİ koşular yok sayılır (yeşil görünen yeni koşu eski kodu kanıtlamaz)', async () => {
    const s = saat()
    const r = await M.calistir({
      api: api(() => [kendi, kosu({ id: 5, created_at: '2026-10-06T08:20:00Z' })]),
      sha: 'abc',
      baseRef: 'master',
      kendiId: 99,
      ...s,
    })
    expect(r.atla).toBe(false)
  })

  it('tam koşu sürerken BEKLER, bitince yeşilse ATLA', async () => {
    const s = saat()
    let sorgu = 0
    const r = await M.calistir({
      api: api(() => {
        sorgu += 1
        return [kendi, sorgu < 3 ? kosu({ status: 'in_progress', conclusion: null }) : kosu()]
      }),
      sha: 'abc',
      baseRef: 'master',
      kendiId: 99,
      aralikSn: 20,
      ...s,
    })
    expect(sorgu).toBe(3)
    expect(r.atla).toBe(true)
  })

  it('tam koşu süresi içinde BİTMEZSE tam koşuya düşer (atlamaz)', async () => {
    const s = saat()
    const r = await M.calistir({
      api: api(() => [kendi, kosu({ status: 'in_progress', conclusion: null })]),
      sha: 'abc',
      baseRef: 'master',
      kendiId: 99,
      bekleSn: 100,
      aralikSn: 20,
      ...s,
    })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('bekleme süresi')
  })

  it('tam koşu kırmızı bitince BEKLEMEZ, tam koşuya düşer', async () => {
    const s = saat()
    const r = await M.calistir({ api: api(() => [kendi, kosu({ conclusion: 'failure' })]), sha: 'abc', baseRef: 'master', kendiId: 99, ...s })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('failure')
  })

  it('API hata verirse FIRLATMAZ, tam koşuya düşer', async () => {
    const s = saat()
    const r = await M.calistir({
      api: {
        kosular: async () => {
          throw new Error('HTTP 403 actions: read yok')
        },
        isler: async () => jobs('skipped'),
        tabanTarihi: async () => ESKI_TABAN,
      },
      sha: 'abc',
      baseRef: 'master',
      kendiId: 99,
      ...s,
    })
    expect(r.atla).toBe(false)
    expect(r.neden).toContain('ölçülemedi')
  })

  it('SABOTAJ: ayna koşusu tam koşu sanılırsa (adım sonucu success) atlama olmaz', async () => {
    const s = saat()
    const r = await M.calistir({ api: api(() => [kendi, kosu()], 'success'), sha: 'abc', baseRef: 'master', kendiId: 99, ...s })
    expect(r.atla).toBe(false)
  })
})
