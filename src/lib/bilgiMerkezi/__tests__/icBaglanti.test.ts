import { describe, expect, it } from 'vitest'

import { YAZILAR } from '../../../data/bilgiMerkezi/yazilar'
import { icBaglantiCoz, IcBaglantiHatasi, icBaglantilariCoz } from '../icBaglanti'
import { yaziSayfasiHazirla } from '../sayfa'
import { sahteKaynak } from './sahteKaynak'

/**
 * INV-BILGI-MERKEZI-IC-BAGLANTI-1 — `vh:<tür>/<anahtar>` sayfa üretilirken bugünkü adrese çözülür;
 * çözülemeyen kimlik ATAR (derleme durur, sessiz kırık bağlantı yok). Adres `adresUret` ile üretilir;
 * `ADRES_SEMASI_K3B` kapalıyken çıktı bugünkü `Routes` adresidir.
 */
describe('icBaglantiCoz', () => {
  const k = sahteKaynak()

  it('aile → bugünkü aile adresi (dile göre önek)', async () => {
    expect(await icBaglantiCoz('vh:aile/vortice-hava-perdesi', 'tr', k)).toBe('/tr/products/vortice-hava-perdesi')
    expect(await icBaglantiCoz('vh:aile/vortice-hava-perdesi', 'en', k)).toBe('/en/products/vortice-hava-perdesi')
  })

  it('model → aile adresi + ?sku= (anahtar küçük harfle yazılır, DB biçimine çevrilir)', async () => {
    expect(await icBaglantiCoz('vh:model/vrt-65195', 'tr', k)).toBe('/tr/products/vortice-hava-perdesi?sku=VRT-65195')
  })

  it('kategori → dile göre görünen slug (kural 7); alt kategori tek seviyeli kanonik adres', async () => {
    expect(await icBaglantiCoz('vh:kategori/air-curtains', 'tr', k)).toBe('/tr/category/hava-perdeleri')
    expect(await icBaglantiCoz('vh:kategori/air-curtains', 'en', k)).toBe('/en/category/air-curtains')
    expect(await icBaglantiCoz('vh:kategori/smoke-exhaust-fans', 'tr', k)).toBe('/tr/category/duman-egzoz-fanlari')
  })

  it('ESKİ AD: aile/kategori bugün yoksa url_takma_adlari ile YENİ adrese çözülür', async () => {
    expect(await icBaglantiCoz('vh:aile/eski-aile-adi', 'tr', k)).toBe('/tr/products/yeni-aile-adi')
    expect(await icBaglantiCoz('vh:kategori/eski-kategori', 'tr', k)).toBe('/tr/category/hava-perdeleri')
  })

  it('hesaplayıcı, marka ve sayfa kimlikleri', async () => {
    expect(await icBaglantiCoz('vh:hesaplayici/jet-fan', 'tr', k)).toBe('/tr/destek/hesaplayicilar/jet-fan')
    expect(await icBaglantiCoz('vh:marka/vortice', 'en', k)).toBe('/en/brands/vortice')
    expect(await icBaglantiCoz('vh:sayfa/iletisim', 'tr', k)).toBe('/tr/contact')
  })

  it('⛔SABOTAJ: bulunamayan her tür ATAR', async () => {
    for (const kimlik of [
      'vh:aile/olmayan-aile',
      'vh:model/yok-999',
      'vh:kategori/jet-fans', // canlıda pasif kategori → kaynak null döner
      'vh:marka/olmayan',
      'vh:hesaplayici/yok',
      'vh:sayfa/yok',
    ]) {
      await expect(icBaglantiCoz(kimlik, 'tr', k), kimlik).rejects.toBeInstanceOf(IcBaglantiHatasi)
    }
  })

  it('toplu çözümde hatalar TOPLANIR ve tek hatada hepsi görünür', async () => {
    const hata = await icBaglantilariCoz(['vh:aile/olmayan-a', 'vh:aile/vortice-vort-mono', 'vh:aile/olmayan-b'], 'tr', k).catch((e) => e)
    expect(hata).toBeInstanceOf(IcBaglantiHatasi)
    expect(String(hata.message)).toMatch(/olmayan-a[\s\S]*olmayan-b/)
  })

  it('veri kaynağı hatası YUTULMAZ ("soramadım" ≠ "bulunamadı")', async () => {
    const bozuk = sahteKaynak({ aile: async () => { throw new Error('ağ yok') } })
    await expect(icBaglantilariCoz(['vh:aile/vortice-vort-mono'], 'tr', bozuk)).rejects.toThrow(/ağ yok/)
  })
})

describe('yaziSayfasiHazirla — yazının bütün bağlantıları çözülmeden sayfa ÜRETİLMEZ', () => {
  it('bugünkü yazıların hepsi (her dilde) sahte katalogla çözülür; kartlar ada sahip', async () => {
    for (const yazi of YAZILAR) {
      for (const dil of ['tr', 'en'] as const) {
        if (!yazi.diller[dil]) continue
        const s = await yaziSayfasiHazirla(yazi, dil, sahteKaynak())
        expect(s.urunKartlari.length, `${yazi.kimlik}/${dil}`).toBe(yazi.urunler.length)
        for (const kart of s.urunKartlari) expect(kart.ad.trim()).not.toBe('')
        for (const [kimlik, href] of s.hrefler) expect(href.startsWith(`/${dil}/`), kimlik).toBe(true)
      }
    }
  })

  it('⛔SABOTAJ: yazıya kırık bağlantı konursa sayfa ATAR', async () => {
    const [ilk] = YAZILAR
    const tr = ilk.diller.tr
    if (!tr) throw new Error('fikstür: ilk yazının TR metni yok')
    const bozuk = { ...ilk, diller: { tr: { ...tr, govde: `${tr.govde}\n[kırık](vh:aile/boyle-bir-aile-yok)\n` } } }
    await expect(yaziSayfasiHazirla(bozuk, 'tr', sahteKaynak())).rejects.toBeInstanceOf(IcBaglantiHatasi)
  })

  it('⛔SABOTAJ: yazıya düz site adresi konursa sayfa ATAR (kimlik kuralı, R3)', async () => {
    const [ilk] = YAZILAR
    const tr = ilk.diller.tr
    if (!tr) throw new Error('fikstür: ilk yazının TR metni yok')
    const bozuk = { ...ilk, diller: { tr: { ...tr, govde: `${tr.govde}\n[düz](/tr/category/hava-perdeleri)\n` } } }
    await expect(yaziSayfasiHazirla(bozuk, 'tr', sahteKaynak())).rejects.toThrow(/izin listesi dışındaki/)
  })

  it('ürün kartı aile dışı kimlikle yazılırsa ATAR', async () => {
    const [ilk] = YAZILAR
    const bozuk = { ...ilk, urunler: ['vh:model/vrt-65195'] }
    await expect(yaziSayfasiHazirla(bozuk, 'tr', sahteKaynak())).rejects.toThrow(/yalnız aile/)
  })
})
