// @vitest-environment node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'

import { eskiAdresHaritasiUret, haritaDosyasiKur, oncekiUrunSayisi } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { BASKA_KIRACI, FIKSTUR_TABLOLARI, sahteDb, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * REC-300 Faz 3 m.4 — ESKİ ADRES HARİTASI ÜRETİCİSİ (plan §4.1).
 * Fikstür harita bu üreticinin çıktısıdır; elle düzenlenmez. Yeniden yazmak için:
 *   FIKSTUR_YAZ=1 npx vitest run src/lib/adres/__tests__/haritaUret.test.ts
 */
const FIKSTUR_YOLU = join(process.cwd(), 'src/lib/adres/__tests__/fikstur/eski-adres-haritasi.fikstur.json')
const SABIT_AN = new Date('2026-09-24T00:00:00.000Z')
const tohum = tohumDogrula(tohumHam)

async function uret(secenek: Parameters<typeof sahteDb>[0] = {}, onceki: number | null = null) {
  const { istemci, istekler } = sahteDb(secenek)
  const harita = await eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: onceki })
  return { harita, istekler }
}

describe('eskiAdresHaritasiUret — fikstür', () => {
  it('commit\'li fikstür harita üreticinin bugünkü çıktısıyla BİREBİR aynı (fikstür elle bozulamaz)', async () => {
    const { harita } = await uret()
    const dosya = haritaDosyasiKur({ [VARSAYILAN_KIRACI]: harita }, SABIT_AN)
    const metin = JSON.stringify(dosya, null, 2) + '\n'
    if (process.env.FIKSTUR_YAZ === '1') writeFileSync(FIKSTUR_YOLU, metin)
    expect(readFileSync(FIKSTUR_YOLU, 'utf8').replace(/\r\n/g, '\n')).toBe(metin)
  })

  it('yapısal: aile, model, ürün slug\'ı, eski SKU, kategori biçimleri', async () => {
    const { harita } = await uret()
    expect(harita.urunSayisi).toBe(10)
    expect(harita.aileler).toContain('storm-serisi')
    const storm = harita.aileler.indexOf('storm-serisi')
    expect(harita.modeller['SEA-61143003']).toEqual({ aile: storm, slug: { tr: null, en: null } })
    expect(harita.urunSluglari['storm-14-atex-61143003']).toBe('SEA-61143003')
    expect(harita.eskiSkular['SEA-ESKI-61143003']).toBe('SEA-61143003')
    expect(harita.aileSluglari['seat-storm']).toBe(storm)
    expect(harita.kategoriSluglari['fanlar'].bicim).toBe('tr')
    expect(harita.kategoriSluglari['fans'].bicim).toBe('en')
    expect(harita.kategoriSluglari['kanal-fanlari'].bicim).toBe('tr') // takma ad
  })

  it('yalnız AKTİF ürün: arşivdeki ürün haritaya girmez', async () => {
    const { harita } = await uret()
    expect(harita.modeller['SEA-61102010']).toBeUndefined()
    expect(harita.urunSluglari['storm-10-xrm-61102010']).toBeUndefined()
  })

  it('tohum: 13 dilsiz kural + 4 ölü hedef + 6 Lineo + 6 ürün haritada; ölü hedefler canlı karşılığa çözülür', async () => {
    const { harita } = await uret()
    const hrv = harita.kategoriSluglari['isi-geri-kazanim-cihazlari'].hedef
    expect('kategori' in hrv && harita.kategoriler[hrv.kategori].en).toBe('heat-recovery-vmc')
    expect(harita.kategoriSluglari['air-purifiers'].hedef).toEqual({ urunler: true })
    expect(harita.aileSluglari['vortice-lineo-315-quiet']).toBe(harita.aileler.indexOf('vortice-lineo-quiet'))
    expect(harita.urunSluglari['vortice-ca-il-8060-es-rect-16080']).toBe('VRT-CA-IL-8060-ES-RECT')
  })

  it('öncelik: canlı slug takma addan ve tohumdan önce gelir', async () => {
    const tablolar = {
      ...FIKSTUR_TABLOLARI,
      url_takma_adlari: [
        ...FIKSTUR_TABLOLARI.url_takma_adlari,
        // Canlı aile slug'ıyla çakışan eski ad (tetik bunu siler; üretici yine de canlıyı korur).
        { tur: 'aile', dil: '*', eski_slug: 'nicotra-gebhardt-dd', hedef_id: '00000000-0000-4000-8000-0000000000f1', tenant_id: VARSAYILAN_KIRACI },
      ],
    }
    const { harita } = await uret({ tablolar })
    expect(harita.aileler[harita.aileSluglari['nicotra-gebhardt-dd']]).toBe('nicotra-gebhardt-dd')
  })
})

describe('eskiAdresHaritasiUret — kiracı süzgeci (kural 12)', () => {
  it('her sorgu tenant_id=eq.<kiracı> taşır; başka kiracının satırı haritaya girmez', async () => {
    const { harita, istekler } = await uret()
    expect(istekler.length).toBeGreaterThanOrEqual(4)
    for (const u of istekler) expect(u.searchParams.get('tenant_id')).toBe(`eq.${VARSAYILAN_KIRACI}`)
    expect(harita.modeller['BASKA-1']).toBeUndefined()
    expect(harita.urunSluglari['baska-kiraci-eski-urun']).toBeUndefined()
    expect(harita.kategoriSluglari['baska-kiraci-kategorisi']).toBeUndefined()
  })

  it('tohum başka kiracınınsa uygulanmaz', async () => {
    const { istemci } = sahteDb()
    await expect(
      eskiAdresHaritasiUret(istemci, { kiraciId: BASKA_KIRACI, tohum, oncekiUrunSayisi: null })
    ).resolves.toMatchObject({ urunSayisi: 1, kategoriSluglari: { 'baska-kiraci-kategorisi': expect.anything() } })
  })
})

describe('eskiAdresHaritasiUret — FAIL-CLOSED (plan §4.1 Y2)', () => {
  it('DB\'ye ulaşılamazsa HATA (boş harita üretmez)', async () => {
    await expect(uret({ agHatasi: 'products' })).rejects.toThrow(/products okunamadı.*fetch failed/)
  })

  it('tablo hata dönerse HATA (ör. yanlış anahtarla url_takma_adlari yetkisi yok)', async () => {
    await expect(uret({ sunucuHatasi: 'url_takma_adlari' })).rejects.toThrow(/url_takma_adlari okunamadı/)
  })

  it('aktif ürün 0 ise HATA', async () => {
    await expect(uret({ tablolar: { ...FIKSTUR_TABLOLARI, products: [] } })).rejects.toThrow(/aktif ürün 0/)
  })

  it('ürün sayısı öncekinin %90\'ının altındaysa HATA; tam %90 geçer', async () => {
    // 10 aktif ürün: önceki 12 → 10 < 10.8 düşer; önceki 11 → 10 ≥ 9.9 geçer.
    await expect(uret({}, 12)).rejects.toThrow(/%90 eşiğinin altında/)
    await expect(uret({}, 11)).resolves.toBeDefined()
  })

  it('sunucu sayfayı kırpsa bile tablo TAMAMEN okunur (kısa sayfa "son" sayılmaz)', async () => {
    const { harita } = await uret({ sunucuSayfaSiniri: 3 })
    expect(harita.urunSayisi).toBe(10)
  })

  it('tohum hedefi bulunamazsa HATA', async () => {
    const tablolar = {
      ...FIKSTUR_TABLOLARI,
      product_families: FIKSTUR_TABLOLARI.product_families.filter((f) => f.slug !== 'vortice-lineo-quiet'),
      products: FIKSTUR_TABLOLARI.products.filter((p) => p.sku !== 'VRT-17160'),
    }
    await expect(uret({ tablolar })).rejects.toThrow(/tohum ailesi "vortice-lineo-100-quiet"/)
  })

  it('iki kategori aynı slug\'ı paylaşıyorsa HATA (hedef belirsiz)', async () => {
    const tablolar = {
      ...FIKSTUR_TABLOLARI,
      categories: FIKSTUR_TABLOLARI.categories.map((c) =>
        c.slug === 'air-curtains' ? { ...c, metadata: { slug: { tr: 'fanlar', en: 'air-curtains' } } } : c
      ),
    }
    await expect(uret({ tablolar })).rejects.toThrow(/"fanlar" iki kategoride/)
  })
})

describe('oncekiUrunSayisi', () => {
  it('önceki dosyadan kiracının ürün sayısını okur; yoksa null', () => {
    const dosya = { surum: 1, kiracilar: { [VARSAYILAN_KIRACI]: { urunSayisi: 442 } } }
    expect(oncekiUrunSayisi(dosya, VARSAYILAN_KIRACI)).toBe(442)
    expect(oncekiUrunSayisi(dosya, BASKA_KIRACI)).toBeNull()
    expect(oncekiUrunSayisi(null, VARSAYILAN_KIRACI)).toBeNull()
    expect(oncekiUrunSayisi({ kiracilar: { [VARSAYILAN_KIRACI]: { urunSayisi: 'x' } } }, VARSAYILAN_KIRACI)).toBeNull()
  })
})
