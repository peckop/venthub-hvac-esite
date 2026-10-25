import { describe, expect, it } from 'vitest'

import {
  aileKategoriZinciri,
  altAgacKimlikleri,
  ataZinciri,
  ataZinciriGetir,
  cocuklarHaritasi,
  ilkAktifAta,
  ilkAktifAtaGetir,
  type ZincirDugumu,
} from '../kategoriZinciri'

/**
 * URN-144 (karar 410) — kategori ağacı üç kademe: kök → orta → yaprak. Kimlikler yalnız test verisidir.
 * Fikstür gerçek dalı taklit eder: Aksesuarlar → Elektrik Aksesuarları → Frekans Konvertörleri.
 */
const satir = (id: string, parent_id: string | null, is_active = true): ZincirDugumu => ({ id, parent_id, is_active })

const KOK = satir('accessories', null)
const ORTA = satir('control-systems', 'accessories')
const YAPRAK = satir('frequency-converters', 'control-systems')
const IKI_KADEME_KOK = satir('fans', null)
const IKI_KADEME_ALT = satir('duct-fans', 'fans')

const harita = (...s: ZincirDugumu[]) => new Map(s.map((x) => [x.id, x]))

describe('ataZinciri', () => {
  it('üç kademe: yaprağın ataları kökten başa [kök, orta]', () => {
    const z = ataZinciri('frequency-converters', harita(KOK, ORTA, YAPRAK))
    expect(z.map((x) => x.id)).toEqual(['accessories', 'control-systems'])
  })

  it('iki kademe: yalnız doğrudan üst (bugünkü davranış)', () => {
    const z = ataZinciri('duct-fans', harita(IKI_KADEME_KOK, IKI_KADEME_ALT))
    expect(z.map((x) => x.id)).toEqual(['fans'])
  })

  it('kök: ata yok', () => {
    expect(ataZinciri('accessories', harita(KOK, ORTA, YAPRAK))).toEqual([])
  })

  it('eksik üst: zincir kısalır, kırılmaz', () => {
    expect(ataZinciri('frequency-converters', harita(ORTA, YAPRAK)).map((x) => x.id)).toEqual(['control-systems'])
    expect(ataZinciri('frequency-converters', harita(YAPRAK))).toEqual([])
    expect(ataZinciri('yok', harita(KOK))).toEqual([])
  })

  it('döngü: sonsuz döngüye girmez', () => {
    const a = satir('a', 'b')
    const b = satir('b', 'a')
    expect(ataZinciri('a', harita(a, b)).map((x) => x.id)).toEqual(['b'])
    const kendi = satir('x', 'x')
    expect(ataZinciri('x', harita(kendi))).toEqual([])
  })

  it('azami derinlik zinciri keser', () => {
    const k = [satir('d', 'c'), satir('c', 'b'), satir('b', 'a'), satir('a', null)]
    expect(ataZinciri('d', harita(...k), 2).map((x) => x.id)).toEqual(['b', 'c'])
  })
})

describe('ataZinciriGetir (okuyucu enjekte)', () => {
  const okuyucu = (h: Map<string, ZincirDugumu>, sayac?: string[]) => async (id: string) => {
    sayac?.push(id)
    return h.get(id) ?? null
  }

  it('üç kademe: doğrudan üstten başlayıp kökten başa döner (başlangıç dahil)', async () => {
    const cagrilar: string[] = []
    const z = await ataZinciriGetir('control-systems', okuyucu(harita(KOK, ORTA, YAPRAK), cagrilar))
    expect(z.map((x) => x.id)).toEqual(['accessories', 'control-systems'])
    expect(cagrilar).toEqual(['control-systems', 'accessories'])
  })

  it('iki kademe: tek okuma', async () => {
    const cagrilar: string[] = []
    const z = await ataZinciriGetir('fans', okuyucu(harita(IKI_KADEME_KOK), cagrilar))
    expect(z.map((x) => x.id)).toEqual(['fans'])
    expect(cagrilar).toEqual(['fans'])
  })

  it('başlangıç yok: okuma yapılmaz; okuyucu hatası yutulmaz', async () => {
    const cagrilar: string[] = []
    expect(await ataZinciriGetir(null, okuyucu(new Map(), cagrilar))).toEqual([])
    expect(cagrilar).toEqual([])
    await expect(ataZinciriGetir('a', async () => { throw new Error('ağ yok') })).rejects.toThrow('ağ yok')
  })

  it('döngü ve eksik satır zinciri kısaltır', async () => {
    const h = harita(satir('a', 'b'), satir('b', 'a'))
    expect((await ataZinciriGetir('a', okuyucu(h))).map((x) => x.id)).toEqual(['b', 'a'])
    expect(await ataZinciriGetir('yok', okuyucu(h))).toEqual([])
  })
})

describe('altAgacKimlikleri', () => {
  it('üç kademe: kök sayfası kendisi + orta + yaprak', () => {
    const c = cocuklarHaritasi([KOK, ORTA, YAPRAK, IKI_KADEME_KOK, IKI_KADEME_ALT])
    expect(altAgacKimlikleri('accessories', c)).toEqual(['accessories', 'control-systems', 'frequency-converters'])
    expect(altAgacKimlikleri('control-systems', c)).toEqual(['control-systems', 'frequency-converters'])
    expect(altAgacKimlikleri('frequency-converters', c)).toEqual(['frequency-converters'])
  })

  it('iki kademe: kendisi + doğrudan çocuklar (bugünkü küme)', () => {
    const c = cocuklarHaritasi([IKI_KADEME_KOK, IKI_KADEME_ALT, satir('axial', 'fans')])
    expect(altAgacKimlikleri('fans', c)).toEqual(['fans', 'duct-fans', 'axial'])
  })

  it('döngü: her kimlik bir kez', () => {
    const c = cocuklarHaritasi([satir('a', 'b'), satir('b', 'a')])
    expect(altAgacKimlikleri('a', c)).toEqual(['a', 'b'])
  })
})

describe('aileKategoriZinciri (aile/model kırıntısı)', () => {
  const tum = harita(KOK, ORTA, YAPRAK, IKI_KADEME_KOK, IKI_KADEME_ALT)
  const okuyucu = (sayac: string[], h: Map<string, ZincirDugumu> = tum) => async (id: string) => {
    sayac.push(id)
    return h.get(id) ?? null
  }

  it('KARMA sütun (Aksesuarlar dalı): ana = orta, alt = yaprak → zincir KÖKÜ de içerir; yalnız eksik halka okunur', async () => {
    const okunan: string[] = []
    const z = await aileKategoriZinciri(ORTA, YAPRAK, okuyucu(okunan))
    expect(z.map((x) => x.id)).toEqual(['accessories', 'control-systems', 'frequency-converters'])
    expect(okunan).toEqual(['accessories'])
  })

  it('diğer dallar (ana = kök, alt = 1. kademe): iki kademe, HİÇ okuma yok', async () => {
    const okunan: string[] = []
    const z = await aileKategoriZinciri(IKI_KADEME_KOK, IKI_KADEME_ALT, okuyucu(okunan))
    expect(z.map((x) => x.id)).toEqual(['fans', 'duct-fans'])
    expect(okunan).toEqual([])
  })

  it('alt boş (ana kategoriye bağlı aile): yalnız ana; ana orta kademeyse kökü eklenir', async () => {
    expect((await aileKategoriZinciri(IKI_KADEME_KOK, null, okuyucu([]))).map((x) => x.id)).toEqual(['fans'])
    expect((await aileKategoriZinciri(ORTA, null, okuyucu([]))).map((x) => x.id)).toEqual(['accessories', 'control-systems'])
  })

  it('yalnız yaprak sütunda: orta ve kök ata zincirinden gelir', async () => {
    const z = await aileKategoriZinciri(null, YAPRAK, okuyucu([]))
    expect(z.map((x) => x.id)).toEqual(['accessories', 'control-systems', 'frequency-converters'])
  })

  it('aradan okunan PASİF ata atlanır; ailenin kendi (pasif bile olsa) satırları bugünkü gibi kalır', async () => {
    const pasifOrta = satir('control-systems', 'accessories', false)
    const h = harita(KOK, pasifOrta, YAPRAK)
    expect((await aileKategoriZinciri(null, YAPRAK, okuyucu([], h))).map((x) => x.id)).toEqual(['accessories', 'frequency-converters'])
    expect((await aileKategoriZinciri(pasifOrta, YAPRAK, okuyucu([], h))).map((x) => x.id)).toEqual(['accessories', 'control-systems', 'frequency-converters'])
  })

  it('kategori yok: boş; okuyucu hatası fırlar', async () => {
    expect(await aileKategoriZinciri(null, null, okuyucu([]))).toEqual([])
    await expect(aileKategoriZinciri(null, YAPRAK, async () => { throw new Error('ağ yok') })).rejects.toThrow('ağ yok')
  })
})

describe('ilkAktifAta', () => {
  it('pasif ara kademe atlanır: yaprak → ilk AKTİF ata kök', () => {
    const pasifOrta = satir('control-systems', 'accessories', false)
    expect(ilkAktifAta('frequency-converters', harita(KOK, pasifOrta, YAPRAK))?.id).toBe('accessories')
  })

  it('doğrudan üst aktifse o', () => {
    expect(ilkAktifAta('frequency-converters', harita(KOK, ORTA, YAPRAK))?.id).toBe('control-systems')
  })

  it('hepsi pasif ya da ata yok: null', () => {
    expect(ilkAktifAta('frequency-converters', harita(satir('accessories', null, false), satir('control-systems', 'accessories', false), YAPRAK))).toBeNull()
    expect(ilkAktifAta('accessories', harita(KOK))).toBeNull()
  })

  it('okuyucu eşi aynı hükmü verir', async () => {
    const h = harita(KOK, satir('control-systems', 'accessories', false), YAPRAK)
    const okuyucu = async (id: string) => h.get(id) ?? null
    expect((await ilkAktifAtaGetir('control-systems', okuyucu))?.id).toBe('accessories')
    expect(await ilkAktifAtaGetir(null, okuyucu)).toBeNull()
    expect(await ilkAktifAtaGetir('yok', okuyucu)).toBeNull()
  })
})
