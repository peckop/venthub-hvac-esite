/**
 * INV-ARAMA-ONHAZIRLIK-1 · arama cetveli §14 — arama penceresinin ön hazırlığı.
 *
 * Üç iddia:
 *  (a) Ön yükleme, tıklamanın indirdiği parçayla AYNI modüle bakar. Belirteç ayrışırsa ön yükleme
 *      başka bir dosyayı ısıtır, ilk tıklama yine soğuk iner ve hiçbir test bunu görmez.
 *  (b) Arama düğmelerinin iki sarmalayıcısı da (masaüstü + mobil) niyete bağlıdır.
 *  (c) Davranış: bağlantı bir kez açılır, doğru kaynağa, "anonymous" havuzuna; parça indirmesi
 *      düşerse bir sonraki niyet yeniden dener.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const kok = resolve(__dirname, '..')
const oku = (dosya: string) => readFileSync(resolve(kok, dosya), 'utf8')

const preconnect = vi.fn()
vi.mock('react-dom', () => ({ preconnect: (...a: unknown[]) => preconnect(...a) }))

vi.mock('../SearchOverlay', () => ({ default: () => null }))
vi.mock('../../lib/services/product.service', () => ({}))

describe('INV-ARAMA-ONHAZIRLIK-1 (a) aynı parça', () => {
  const hazirlik = oku('aramaOnHazirlik.ts')

  it('arama penceresi: StickyHeader ile aynı belirteç', () => {
    expect(oku('StickyHeader.tsx')).toContain("import('./SearchOverlay')")
    expect(hazirlik).toContain("import('./SearchOverlay')")
  })

  it('arama servisi: SearchOverlay içindeki geç yükleme ile aynı modül', () => {
    // SearchOverlay `../lib/services/product.service` der; hazırlık aynı dizinde (src/components)
    // durduğu için belirteç birebir aynıdır.
    expect(oku('SearchOverlay.tsx')).toContain("import('../lib/services/product.service')")
    expect(hazirlik).toContain("import('../lib/services/product.service')")
  })
})

describe('INV-ARAMA-ONHAZIRLIK-1 (b) düğmeler niyete bağlı', () => {
  it('masaüstü ve mobil arama sarmalayıcısı aramaNiyeti çağırır', () => {
    const baslik = oku('StickyHeader.tsx')
    const masaustu = baslik.split('\n').find((s) => s.includes('<NavSearchTrigger'))
    const mobil = baslik.split('\n').find((s) => s.includes("<NavActionButton ariaLabel={t('common.search')}"))
    for (const satir of [masaustu, mobil]) {
      expect(satir).toBeDefined()
      expect(satir).toContain('onPointerEnter={aramaNiyeti}')
      expect(satir).toContain('onFocus={aramaNiyeti}')
      expect(satir).toContain('onTouchStart={aramaNiyeti}')
    }
  })

  it('inmiş pencere askısız yoldan çizilir, inmemişse tembel yol kalır (K14.6)', () => {
    const baslik = oku('StickyHeader.tsx')
    expect(baslik).toContain('useSyncExternalStore(hazirPencereAbone, hazirAramaPenceresi, () => null)')
    expect(baslik).toMatch(/isSearchOverlayOpen && \(HazirAramaPenceresi \?/)
    // Tembel yol yedek olarak DURUR: ön yükleme düşerse tıklama yine pencereyi açar.
    expect(baslik).toContain('<SearchOverlay open={isSearchOverlayOpen} onClose={closeSearchOverlay} />')
  })

  it('boşta ön yükleme sayfa yüklendikten sonra kurulur', () => {
    const baslik = oku('StickyHeader.tsx')
    expect(baslik).toContain('aramaParcalariniOnYukle')
    expect(baslik).toMatch(/addEventListener\('load'/)
  })
})

describe('INV-ARAMA-ONHAZIRLIK-1 (c) davranış', () => {
  const eskiAdres = process.env.NEXT_PUBLIC_SUPABASE_URL

  beforeEach(async () => {
    vi.resetModules()
    preconnect.mockClear()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ornek.supabase.co/'
  })
  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = eskiAdres
  })

  it('bağlantı bir kez, kaynağa, anonymous havuzuna açılır', async () => {
    const { aramaNiyeti } = await import('../aramaOnHazirlik')
    aramaNiyeti()
    aramaNiyeti()
    expect(preconnect).toHaveBeenCalledTimes(1)
    expect(preconnect).toHaveBeenCalledWith('https://ornek.supabase.co', { crossOrigin: 'anonymous' })
  })

  it('adres yoksa bağlantı atlanır, hata atılmaz', async () => {
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL')
    const { aramaNiyeti } = await import('../aramaOnHazirlik')
    expect(() => aramaNiyeti()).not.toThrow()
    expect(preconnect).not.toHaveBeenCalled()
  })

  it('geçersiz adreste hata atılmaz', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'bu bir adres değil'
    const { aramaNiyeti } = await import('../aramaOnHazirlik')
    expect(() => aramaNiyeti()).not.toThrow()
    expect(preconnect).not.toHaveBeenCalled()
  })

  const bekle = () => new Promise((r) => setTimeout(r, 20))

  it('parça indirmesi düşerse bayrak geri alınır (bir sonraki niyet yeniden dener)', async () => {
    vi.doMock('../SearchOverlay', () => {
      throw new Error('ağ yok')
    })
    // Kurulum doğrulaması: sahte modül gerçekten düşüyor mu (düşmüyorsa aşağıdaki sonuç anlamsız).
    await expect(import('../SearchOverlay')).rejects.toThrow()
    const mod = await import('../aramaOnHazirlik')
    mod.aramaParcalariniOnYukle()
    expect(mod.__aramaOnHazirlikDurumu().parcalarIstendi).toBe(true)
    await bekle()
    expect(mod.__aramaOnHazirlikDurumu().parcalarIstendi).toBe(false)
    // doUnmock GERÇEK dosyaya döndürür (ağır, sonraki testi zaman aşımına sokar) — başarılı sahteyi geri kur.
    vi.doMock('../SearchOverlay', () => ({ default: () => null }))
  })

  it('pencere inince bileşen hazır olur ve aboneler haber alır (K14.6)', async () => {
    const mod = await import('../aramaOnHazirlik')
    expect(mod.hazirAramaPenceresi()).toBeNull()
    const dinleyici = vi.fn()
    const birak = mod.hazirPencereAbone(dinleyici)
    mod.aramaParcalariniOnYukle()
    await bekle()
    expect(dinleyici).toHaveBeenCalledTimes(1)
    expect(typeof mod.hazirAramaPenceresi()).toBe('function')
    birak()
  })

  it('pencere indirmesi düşerse hazır bileşen null kalır (tembel yola düşülür)', async () => {
    vi.doMock('../SearchOverlay', () => {
      throw new Error('ağ yok')
    })
    await expect(import('../SearchOverlay')).rejects.toThrow()
    const mod = await import('../aramaOnHazirlik')
    mod.aramaParcalariniOnYukle()
    await bekle()
    expect(mod.hazirAramaPenceresi()).toBeNull()
    vi.doMock('../SearchOverlay', () => ({ default: () => null }))
  })

  it('başarılı indirmeden sonra bayrak kalır (ikinci indirme başlamaz)', async () => {
    const mod = await import('../aramaOnHazirlik')
    mod.aramaParcalariniOnYukle()
    await bekle()
    expect(mod.__aramaOnHazirlikDurumu().parcalarIstendi).toBe(true)
  })
})
