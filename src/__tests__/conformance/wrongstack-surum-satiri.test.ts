// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-WRONGSTACK-SATIRI-1 · kanca satırı "bizde X, son Y" der; ölçemediğinde de konuşur.
 *
 * BAĞLAM (ARC-24, karar 257): günlük sürüm kontrolü zamanlanmış görevle kurulmadı ve kimse
 * fark etmedi (bizde 1.0.26, GitHub'da 1.0.31). Satır her mesajda görünür; son sürüm günde en
 * çok bir kez arka planda ölçülür; ağ yoksa "OLCULEMEDI" yazar, eski değeri güncel gibi göstermez.
 */

interface Olc {
  son?: string
  tarih?: string
  npm?: string
  hata?: string
}
interface Veri {
  son?: string
  tarih?: string
  npm?: string
  olculdu: string
  hata?: string
}
type Sonuc = { durum: 'yok' } | { durum: 'bozuk'; hata: string } | { durum: 'tamam'; veri: Veri }
interface Modul {
  onbellekYolu: (pano: string) => string
  surumAyir: (s: string) => number[] | null
  karsilastir: (a: string, b: string) => number | null
  kurulu: (depo: string) => { surum: string; karisik: boolean } | { hata: string }
  sonSurumuOlc: (o?: { fetchFn?: typeof fetch; zamanAsimiMs?: number }) => Promise<Olc>
  oku: (yol: string) => Sonuc
  satir: (s: Sonuc, depo: string, simdi?: number) => string
  yaz: (pano: string, o?: { fetchFn?: typeof fetch; simdi?: () => number }) => Promise<Veri>
  gerekirseTazele: (pano: string, simdi?: number) => boolean
  TAZELE_SAAT: number
  HATA_YENIDEN_SAAT: number
  BAYAT_SAAT: number
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks')
const gerek = createRequire(import.meta.url)
const ws = gerek(path.join(KANCA, 'wrongstack-satiri.cjs')) as Modul
const SAAT = 3_600_000
const SIMDI = Date.parse('2026-10-04T12:00:00Z')

const temizlenecek: string[] = []
function gecici(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-satir-'))
  temizlenecek.push(d)
  return d
}
/** Sahte depo: tools/wrongstack-mcp/package.json yazar. */
function sahteDepo(bagimliliklar: Record<string, string> | null): string {
  const d = gecici()
  if (bagimliliklar) {
    fs.mkdirSync(path.join(d, 'tools', 'wrongstack-mcp'), { recursive: true })
    fs.writeFileSync(path.join(d, 'tools', 'wrongstack-mcp', 'package.json'), JSON.stringify({ dependencies: bagimliliklar }))
  }
  return d
}
const DORT_26 = {
  '@wrongstack/sage-mcp': '1.0.26',
  '@wrongstack/kanban-mcp': '1.0.26',
  '@wrongstack/mailbox-mcp': '1.0.26',
  '@wrongstack/codebase-index-mcp': '1.0.26',
}
function tamam(son: string | undefined, saatOnce: number, ek: Partial<Veri> = {}): Sonuc {
  return {
    durum: 'tamam',
    veri: { ...(son ? { son, tarih: '2026-10-03' } : {}), olculdu: new Date(SIMDI - saatOnce * SAAT).toISOString(), ...ek },
  }
}
function sahteFetch(govde: unknown, ok = true, durum = 200): typeof fetch {
  return (async () => ({ ok, status: durum, json: async () => govde })) as unknown as typeof fetch
}
function patlayanFetch(ad = 'Error', mesaj = 'baglanti yok'): typeof fetch {
  return (async () => {
    const e = new Error(mesaj)
    e.name = ad
    throw e
  }) as unknown as typeof fetch
}

afterEach(() => {
  vi.restoreAllMocks()
  for (const d of temizlenecek.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

describe('INV-WRONGSTACK-SATIRI-1 · sürüm ayrıştırma ve karşılaştırma', () => {
  it('baştaki v atılır, üç sayı okunur', () => {
    expect(ws.surumAyir('v1.0.31')).toEqual([1, 0, 31])
    expect(ws.surumAyir('1.0.26')).toEqual([1, 0, 26])
  })

  it('çözülemeyen metin null, karşılaştırma da null (uydurma sıra yok)', () => {
    expect(ws.surumAyir('')).toBeNull()
    expect(ws.surumAyir('latest')).toBeNull()
    expect(ws.karsilastir('latest', '1.0.1')).toBeNull()
  })

  it('1.0.9 < 1.0.31: metin değil sayı karşılaştırır', () => {
    expect(ws.karsilastir('1.0.9', '1.0.31')).toBe(-1)
    expect(ws.karsilastir('1.0.31', '1.0.9')).toBe(1)
    expect(ws.karsilastir('1.2.0', '1.10.0')).toBe(-1)
    expect(ws.karsilastir('1.0.26', '1.0.26')).toBe(0)
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · bizde sürümü (package.json)', () => {
  it('dört paket aynı sürümse tek sürüm, karışık değil', () => {
    expect(ws.kurulu(sahteDepo(DORT_26))).toEqual({ surum: '1.0.26', karisik: false })
  })

  it('paketler farklıysa EN DÜŞÜĞÜ alınır ve karışık işaretlenir', () => {
    const d = sahteDepo({ ...DORT_26, '@wrongstack/sage-mcp': '1.0.29', '@wrongstack/kanban-mcp': '1.0.9' })
    expect(ws.kurulu(d)).toEqual({ surum: '1.0.9', karisik: true })
  })

  it('^ ve ~ işaretleri atılır; @wrongstack dışı bağımlılık sayılmaz', () => {
    const d = sahteDepo({ '@wrongstack/sage-mcp': '^1.0.28', baska: '0.0.1' })
    expect(ws.kurulu(d)).toEqual({ surum: '1.0.28', karisik: false })
  })

  it('dosya yok ya da bağımlılık yok: hata döner, fırlatmaz', () => {
    expect('hata' in ws.kurulu(sahteDepo(null))).toBe(true)
    expect('hata' in ws.kurulu(sahteDepo({ baska: '1.0.0' }))).toBe(true)
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · satır metni', () => {
  const depo = () => sahteDepo(DORT_26)

  it('geride: ⚠ ile başlar, iki sürümü ve kaç sürüm geride olduğunu yazar', () => {
    const s = ws.satir(tamam('1.0.31', 3), depo(), SIMDI)
    expect(s).toBe('⚠WRONGSTACK: bizde 1.0.26, son 1.0.31 (2026-10-03) · 5 surum geride')
  })

  it('eşit: ⚠ yok, "guncel" yazar', () => {
    const d = sahteDepo({ ...DORT_26, '@wrongstack/sage-mcp': '1.0.31', '@wrongstack/kanban-mcp': '1.0.31', '@wrongstack/mailbox-mcp': '1.0.31', '@wrongstack/codebase-index-mcp': '1.0.31' })
    const s = ws.satir(tamam('1.0.31', 3), d, SIMDI)
    expect(s).toBe('WRONGSTACK: bizde 1.0.31, son 1.0.31 (2026-10-03) · guncel')
  })

  it('ana ya da orta sürüm farkı: sayı uydurulmaz, "geride" der', () => {
    const s = ws.satir(tamam('1.1.0', 3), depo(), SIMDI)
    expect(s).toContain('⚠WRONGSTACK')
    expect(s).toContain(' · geride')
    expect(s).not.toContain('surum geride')
  })

  it('önbellek yok: OLCULMEDI, ⚠ ile (ölçülmedi ≠ güncel)', () => {
    expect(ws.satir({ durum: 'yok' }, depo(), SIMDI)).toBe('⚠WRONGSTACK: bizde 1.0.26, son OLCULMEDI (onbellek yok)')
  })

  it('önbellek bozuk: OLCULEMEDI ve sebep', () => {
    const s = ws.satir({ durum: 'bozuk', hata: 'Unexpected token' }, depo(), SIMDI)
    expect(s).toMatch(/^⚠WRONGSTACK: bizde 1\.0\.26, son OLCULEMEDI \(Unexpected token\)/)
  })

  it('ölçüm hatası ve eski değer yok: son OLCULEMEDI, sebep yazılı', () => {
    const s = ws.satir(tamam(undefined, 1, { hata: 'ag (baglanti yok)' }), depo(), SIMDI)
    expect(s).toBe('⚠WRONGSTACK: bizde 1.0.26, son OLCULEMEDI (ag (baglanti yok))')
  })

  it('ölçüm hatası ama eski bilinen değer var: değer gösterilir AMA hata da yanında yazılır', () => {
    const s = ws.satir(tamam('1.0.31', 1, { hata: 'GitHub 403' }), depo(), SIMDI)
    expect(s).toContain('son 1.0.31')
    expect(s).toContain('son kontrol OLCULEMEDI (GitHub 403)')
  })

  it(`önbellek ${48} saati aşarsa bayat olduğunu söyler; altında söylemez`, () => {
    expect(ws.satir(tamam('1.0.31', 60), depo(), SIMDI)).toContain('onbellek 60 saat bayat')
    expect(ws.satir(tamam('1.0.31', 47), depo(), SIMDI)).not.toContain('bayat')
  })

  it('bizde okunamıyorsa (package.json yok) satır yine konuşur', () => {
    const s = ws.satir(tamam('1.0.31', 3), sahteDepo(null), SIMDI)
    expect(s).toMatch(/^⚠WRONGSTACK: bizde OLCULEMEDI \(package\.json okunamadi/)
    expect(s).toContain('son 1.0.31')
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · ağ ölçümü', () => {
  it('başarılı: etiket ve tarih alınır, v atılır', async () => {
    const o = await ws.sonSurumuOlc({ fetchFn: sahteFetch({ tag_name: 'v1.0.31', published_at: '2026-10-03T20:55:09Z' }) })
    expect(o).toEqual({ son: '1.0.31', tarih: '2026-10-03' })
  })

  it('HTTP hatası, bozuk etiket, ağ hatası, zaman aşımı: hata döner, FIRLATMAZ', async () => {
    expect(await ws.sonSurumuOlc({ fetchFn: sahteFetch({}, false, 403) })).toEqual({ hata: 'GitHub 403' })
    expect(await ws.sonSurumuOlc({ fetchFn: sahteFetch({ tag_name: 'nightly' }) })).toEqual({ hata: 'etiket cozulemedi' })
    expect((await ws.sonSurumuOlc({ fetchFn: patlayanFetch() })).hata).toMatch(/^ag \(/)
    expect((await ws.sonSurumuOlc({ fetchFn: patlayanFetch('TimeoutError', 'asildi') })).hata).toMatch(/^zaman asimi/)
  })
})

/** GitHub ve npm adreslerine ayrı cevap veren sahte ağ. npm: null → ağ hatası, sayı → HTTP durumu. */
function ikiKaynakFetch(npm: { version: string } | null | number): typeof fetch {
  return (async (adres: string) => {
    if (String(adres).includes('api.github.com')) {
      return { ok: true, status: 200, json: async () => ({ tag_name: 'v1.0.31', published_at: '2026-10-03T20:55:09Z' }) }
    }
    if (npm === null) throw new Error('npm kapali')
    if (typeof npm === 'number') return { ok: false, status: npm, json: async () => ({}) }
    return { ok: true, status: 200, json: async () => npm }
  }) as unknown as typeof fetch
}

describe('INV-WRONGSTACK-SATIRI-1 · kurulabilir (npm) sürüm', () => {
  it('npm GitHub\'dan geriyse ölçülür ve satırda "npm\'de" olarak yazılır', async () => {
    const o = await ws.sonSurumuOlc({ fetchFn: ikiKaynakFetch({ version: '1.0.29' }) })
    expect(o).toEqual({ son: '1.0.31', tarih: '2026-10-03', npm: '1.0.29' })
    const s = ws.satir({ durum: 'tamam', veri: { ...o, olculdu: new Date(SIMDI - 3 * SAAT).toISOString() } }, sahteDepo(DORT_26), SIMDI)
    expect(s).toBe("⚠WRONGSTACK: bizde 1.0.26, son 1.0.31 (2026-10-03), npm'de 1.0.29 · 5 surum geride")
  })

  it('npm ağ hatası ya da HTTP hatası: GitHub ölçümü bozulmaz, npm alanı yok', async () => {
    expect(await ws.sonSurumuOlc({ fetchFn: ikiKaynakFetch(null) })).toEqual({ son: '1.0.31', tarih: '2026-10-03' })
    expect(await ws.sonSurumuOlc({ fetchFn: ikiKaynakFetch(503) })).toEqual({ son: '1.0.31', tarih: '2026-10-03' })
  })

  it('npm çözülemeyen sürüm dönerse yok sayılır', async () => {
    expect(await ws.sonSurumuOlc({ fetchFn: ikiKaynakFetch({ version: 'beta' }) })).toEqual({ son: '1.0.31', tarih: '2026-10-03' })
  })

  it('npm, GitHub ile aynıysa satıra yazılmaz (gürültü yok)', () => {
    const s = ws.satir(tamam('1.0.31', 3, { npm: '1.0.31' }), sahteDepo(DORT_26), SIMDI)
    expect(s).not.toContain("npm'de")
  })

  it('ağ hatasında eski npm değeri de korunur', async () => {
    const pano = gecici()
    await ws.yaz(pano, { fetchFn: ikiKaynakFetch({ version: '1.0.29' }), simdi: () => SIMDI - 30 * SAAT })
    const v = await ws.yaz(pano, { fetchFn: patlayanFetch(), simdi: () => SIMDI })
    expect(v.npm).toBe('1.0.29')
    expect(v.hata).toMatch(/^ag/)
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · önbelleğe yazma', () => {
  it('başarılı ölçüm yazılır ve geçici dosya kalmaz', async () => {
    const pano = gecici()
    const v = await ws.yaz(pano, { fetchFn: sahteFetch({ tag_name: 'v1.0.31', published_at: '2026-10-03T20:55:09Z' }), simdi: () => SIMDI })
    expect(v).toEqual({ son: '1.0.31', tarih: '2026-10-03', olculdu: new Date(SIMDI).toISOString() })
    expect(fs.readdirSync(pano).filter((a) => a.includes('.tmp'))).toEqual([])
    expect(ws.oku(ws.onbellekYolu(pano))).toEqual({ durum: 'tamam', veri: v })
  })

  it('ağ hatasında ESKİ bilinen sürüm korunur, hata eklenir, zaman yenilenir', async () => {
    const pano = gecici()
    await ws.yaz(pano, { fetchFn: sahteFetch({ tag_name: 'v1.0.30', published_at: '2026-10-01T00:00:00Z' }), simdi: () => SIMDI - 30 * SAAT })
    const v = await ws.yaz(pano, { fetchFn: patlayanFetch(), simdi: () => SIMDI })
    expect(v.son).toBe('1.0.30')
    expect(v.hata).toMatch(/^ag/)
    expect(v.olculdu).toBe(new Date(SIMDI).toISOString())
  })

  it('ağ hatası ve hiç eski değer yok: son alanı yok, hata var', async () => {
    const v = await ws.yaz(gecici(), { fetchFn: patlayanFetch(), simdi: () => SIMDI })
    expect(v.son).toBeUndefined()
    expect(v.hata).toMatch(/^ag/)
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · arka plan tazeleme (günde en çok bir ağ çağrısı)', () => {
  function kopukSahte(): ReturnType<typeof vi.fn> {
    const spy = vi.fn()
    const yol = gerek.resolve(path.resolve(process.cwd(), 'scripts', 'board', 'kopuk-baslat.cjs'))
    gerek.cache[yol] = { id: yol, filename: yol, loaded: true, exports: { kopukBaslat: spy } } as unknown as NodeJS.Module
    return spy
  }

  it('taze önbellek: başlatmaz', () => {
    const spy = kopukSahte()
    const pano = gecici()
    fs.writeFileSync(ws.onbellekYolu(pano), JSON.stringify({ son: '1.0.31', olculdu: new Date(SIMDI - 23 * SAAT).toISOString() }))
    expect(ws.gerekirseTazele(pano, SIMDI)).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })

  it('24 saati geçmiş önbellek: bir kez başlatır; kilit varken ikinci kez başlatmaz', () => {
    const spy = kopukSahte()
    const pano = gecici()
    fs.writeFileSync(ws.onbellekYolu(pano), JSON.stringify({ son: '1.0.31', olculdu: new Date(SIMDI - 25 * SAAT).toISOString() }))
    expect(ws.gerekirseTazele(pano, SIMDI)).toBe(true)
    expect(ws.gerekirseTazele(pano, SIMDI)).toBe(false)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('önbellek hiç yoksa başlatır', () => {
    const spy = kopukSahte()
    expect(ws.gerekirseTazele(gecici(), SIMDI)).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('hatalı önbellek 2 saatte yeniden denenir (24 saat beklemez), 2 saatten önce denenmez', () => {
    const spy = kopukSahte()
    const pano = gecici()
    const hatali = (saat: number) => JSON.stringify({ olculdu: new Date(SIMDI - saat * SAAT).toISOString(), hata: 'ag (x)' })
    fs.writeFileSync(ws.onbellekYolu(pano), hatali(1))
    expect(ws.gerekirseTazele(pano, SIMDI)).toBe(false)
    fs.writeFileSync(ws.onbellekYolu(pano), hatali(3))
    expect(ws.gerekirseTazele(pano, SIMDI)).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('INV-WRONGSTACK-SATIRI-1 · kanca bütünleşmesi', () => {
  it('kanca WRONGSTACK satırını basar ve çıkış 0 (önbellek yokken de bloklamaz)', () => {
    const pano = gecici()
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: '{}',
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: pano },
      timeout: 20_000,
    })
    expect(r.status).toBe(0)
    const satir = r.stdout.split('\n').find((s) => s.includes('WRONGSTACK:')) ?? ''
    expect(satir).toMatch(/^⚠WRONGSTACK: bizde \d+\.\d+\.\d+, son OLCULMEDI \(onbellek yok\)/)
  })

  it('kanca, önbellekteki sürümü satıra yansıtır', () => {
    const pano = gecici()
    fs.writeFileSync(ws.onbellekYolu(pano), JSON.stringify({ son: '99.0.0', tarih: '2030-01-01', olculdu: new Date().toISOString() }))
    const r = spawnSync(process.execPath, [path.join(KANCA, 'defter-tazelik-satiri.cjs')], {
      input: '{}',
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_BOARD_DIR: pano },
      timeout: 20_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/⚠WRONGSTACK: bizde \d+\.\d+\.\d+, son 99\.0\.0 \(2030-01-01\)/)
  })
})
