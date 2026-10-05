// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-SATIS-KIPI-7 — satış kipi okuması: HATA önbelleğe yazılmaz, önbellek süresi sınırlı (REC-168, plan-challenger Ç1).
 *
 * KORUDUĞU KUSUR: eskiden `dbdenOku` hatada `KAPALI` DÖNERDİ ve `unstable_cache` `revalidate`sız kurulmuştu → geçici bir
 * ağ hatası (ya da migration öncesi 404) KAPALI'yı SÜRESİZ saklardı; webhook düşerse "açık" da süresiz kalırdı.
 * Şimdi: hatada fırlatılır (önbelleğe girmez), çağıran o çağrıda KAPALI'ya düşer, `revalidate: 300`.
 *
 * NE ÖLÇMEZ: gerçek Next önbelleğinin fırlatılan çağrıyı saklamadığı (Next davranışı; burada `unstable_cache` sahte,
 * yalnız KENDİ koduzun fırlattığı ve süre verdiği ölçülür).
 */
type Kayit = { fn: () => Promise<unknown>; anahtar: string[]; secenek: { revalidate?: number; tags?: string[] } }
const kayitlar: Kayit[] = []

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>, anahtar: string[], secenek: Kayit['secenek']) => {
    kayitlar.push({ fn, anahtar, secenek })
    return fn
  },
}))

const ORJ = { ...process.env }

beforeEach(() => {
  kayitlar.length = 0
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ornek.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
  delete process.env.VERCEL_ENV
  delete process.env.SATIS_KIPI_ONIZLEME
})
afterEach(() => {
  process.env = { ...ORJ }
  vi.unstubAllGlobals()
  vi.resetModules()
})

async function yukle() {
  return import('../satisKipi')
}
const yanit = (govde: unknown, ok = true, status = 200) => ({ ok, status, json: async () => govde }) as Response

describe('INV-SATIS-KIPI-7: hata önbelleğe yazılmaz, süre sınırlı', () => {
  it('önbellek revalidate: 300 ve global + kiracı etiketleriyle kurulur', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => yanit({ acik: false, damga: null })))
    const { satisKipiOku, SATIS_KIPI_TAG, SATIS_KIPI_ONBELLEK_SN } = await yukle()
    await satisKipiOku('t1')
    expect(SATIS_KIPI_ONBELLEK_SN).toBe(300)
    expect(kayitlar).toHaveLength(1)
    expect(kayitlar[0].secenek.revalidate, 'revalidate yok: "açık" süresiz bayat kalabilir').toBe(300)
    expect(kayitlar[0].secenek.tags).toEqual([SATIS_KIPI_TAG, `${SATIS_KIPI_TAG}-t1`])
    expect(kayitlar[0].anahtar).toEqual(['satis-kipi', 't1'])
  })

  it('HTTP hatası (404/500): sarılan fonksiyon FIRLATIR (önbelleğe girmez), okuma o çağrıda KAPALI döner', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => yanit({}, false, 404)))
    const { satisKipiOku } = await yukle()
    const sonuc = await satisKipiOku('t1')
    expect(sonuc).toEqual({ acik: false, damga: null, kaynak: 'kapali-varsayilan' })
    await expect(kayitlar[0].fn(), 'hata fırlatılmadı — KAPALI önbelleğe yazılırdı').rejects.toThrow(/satis_kipi_oku 404/)
  })

  it('ağ hatası (fetch reddeder): KAPALI döner, sarılan fonksiyon fırlatır', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ağ koptu') }))
    const { satisKipiOku } = await yukle()
    expect(await satisKipiOku('t1')).toMatchObject({ acik: false, kaynak: 'kapali-varsayilan' })
    await expect(kayitlar[0].fn()).rejects.toThrow('ağ koptu')
  })

  it('geçerli {acik:true} → açık, damga taşınır', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => yanit({ acik: true, damga: '2026-09-29T12:00:00Z' })))
    const { satisKipiOku } = await yukle()
    expect(await satisKipiOku('t1')).toEqual({ acik: true, damga: '2026-09-29T12:00:00Z', kaynak: 'db' })
  })

  it.each([
    ['dize "true"', { acik: 'true' }],
    ['sayı 1', { acik: 1 }],
    ['acik yok', {}],
    ['null gövde', null],
    ['dizi', [true]],
  ])('bozuk cevap (%s) → KAPALI (bilinmemek satış açmaz)', async (_ad, govde) => {
    vi.stubGlobal('fetch', vi.fn(async () => yanit(govde)))
    const { satisKipiOku } = await yukle()
    expect((await satisKipiOku('t1')).acik).toBe(false)
  })

  it('ortam değişkeni yoksa KAPALI (ve fetch hiç çağrılmaz)', async () => {
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL')
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    const { satisKipiOku } = await yukle()
    expect((await satisKipiOku('t1')).acik).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })
})
