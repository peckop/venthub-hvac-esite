// @vitest-environment node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'

import { eskiAdresHaritasiUret, haritaDosyasiKur, oncekiUrunSayisi } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { BASKA_KIRACI, FIKSTUR_TABLOLARI, sahteDb, TAKMA_AD_ISLEVI, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * REC-300 Faz 3 m.4 — ESKİ ADRES HARİTASI ÜRETİCİSİ (plan §4.1).
 * Fikstür harita bu üreticinin çıktısıdır; elle düzenlenmez. Yeniden yazmak için:
 *   FIKSTUR_YAZ=1 npx vitest run src/lib/adres/__tests__/haritaUret.test.ts
 */
const FIKSTUR_YOLU = join(process.cwd(), 'src/lib/adres/__tests__/fikstur/eski-adres-haritasi.fikstur.json')
const SABIT_AN = new Date('2026-09-24T00:00:00.000Z')
const tohum = tohumDogrula(tohumHam)

async function uret(secenek: Parameters<typeof sahteDb>[0] = {}, onceki: number | null = null) {
  const { istemci, istekler, cagrilar } = sahteDb(secenek)
  const harita = await eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: onceki })
  return { harita, istekler, cagrilar }
}

/** Takma ad okuması: PostgREST `/rpc/url_takma_adlari_listele` (tablo `url_takma_adlari` anon'a kapalı). */
const takmaAdCagrisi = (u: URL) => u.pathname.endsWith(`/rpc/${TAKMA_AD_ISLEVI}`)

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
    expect(harita.aileSluglari['vortice-lineo-315-quiet']).toBe(harita.aileler.indexOf('vortice-lineo-quiet-sessiz-kanal-fanlari'))
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
  it('üç tablo sorgusu tenant_id=eq.<kiracı> taşır; başka kiracının satırı haritaya girmez', async () => {
    const { harita, istekler } = await uret()
    const tablo = istekler.filter((u) => !takmaAdCagrisi(u))
    // categories + product_families + products; her biri en az bir veri sayfası ve bir boş sayfa ister.
    expect(tablo.length).toBeGreaterThanOrEqual(6)
    expect(new Set(tablo.map((u) => u.pathname.split('/').pop()))).toEqual(
      new Set(['categories', 'product_families', 'products'])
    )
    for (const u of tablo) expect(u.searchParams.get('tenant_id')).toBe(`eq.${VARSAYILAN_KIRACI}`)
    expect(harita.modeller['BASKA-1']).toBeUndefined()
    expect(harita.urunSluglari['baska-kiraci-eski-urun']).toBeUndefined()
    expect(harita.kategoriSluglari['baska-kiraci-kategorisi']).toBeUndefined()
  })

  it('takma ad okuması tek yoldan: GET /rpc/url_takma_adlari_listele; kiracı parametresi YOK, tabloya doğrudan istek YOK', async () => {
    const { istekler, cagrilar } = await uret()
    const rpc = cagrilar.filter((c) => takmaAdCagrisi(c.url))
    expect(rpc.length).toBeGreaterThanOrEqual(2) // bir veri sayfası + bir boş sayfa
    for (const c of rpc) {
      expect(c.method, 'RPC GET olmalı: PostgREST GET çağrısını salt-okunur işlemde koşturur').toBe('GET')
      expect(c.url.searchParams.has('tenant_id'), 'işlev kiracıyı JWT\'den çözer, istemci kiracı göndermez').toBe(false)
      // Toplam sıra (birincil anahtarın kalanı): sayfalı okuma tekrar ve atlama üretmez.
      expect(c.url.searchParams.get('order')).toMatch(/^tur\.asc[^,]*,dil\.asc[^,]*,eski_slug\.asc[^,]*$/)
    }
    expect(
      istekler.some((u) => u.pathname.endsWith('/url_takma_adlari')),
      'tablo anon\'a kapalı: üretici onu doğrudan okumamalı'
    ).toBe(false)
  })

  it('tohum başka kiracınınsa uygulanmaz (istemci o kiracının JWT\'siyle koşar)', async () => {
    const { istemci } = sahteDb({ jwtKiraci: BASKA_KIRACI })
    const harita = await eskiAdresHaritasiUret(istemci, { kiraciId: BASKA_KIRACI, tohum, oncekiUrunSayisi: null })
    expect(harita).toMatchObject({ urunSayisi: 1, kategoriSluglari: { 'baska-kiraci-kategorisi': expect.anything() } })
    expect(harita.urunSluglari['baska-kiraci-eski-urun']).toBe('BASKA-1') // o kiracının takma adı
    expect(harita.urunSluglari['storm-14-atex-61143003']).toBeUndefined() // varsayılan kiracının hiçbir şeyi sızmaz
  })

  it('⭐işlev İSTENENDEN BAŞKA kiracının satırını döndürürse HATA (JWT kiracısı ≠ kiraciId; sessiz yanlış harita yok)', async () => {
    // Service-role / anon istemci varsayılan kiracıya çözülür; başka kiracı için harita isteniyor: tabloları o
    // kiracı için okunur ama takma adlar varsayılan kiracınındır, hedef kimlikleri hiçbirini tutmaz.
    const { istemci } = sahteDb()
    await expect(
      eskiAdresHaritasiUret(istemci, { kiraciId: BASKA_KIRACI, tohum, oncekiUrunSayisi: null })
    ).rejects.toThrow(new RegExp(`başka kiracının satırını.*${VARSAYILAN_KIRACI}.*istenen kiracı ${BASKA_KIRACI}`))
    // Ters yön: JWT başka kiracının, istenen varsayılan kiracı.
    const { istemci: tersIstemci } = sahteDb({ jwtKiraci: BASKA_KIRACI })
    await expect(
      eskiAdresHaritasiUret(tersIstemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
    ).rejects.toThrow(/başka kiracının satırını/)
  })
})

describe('eskiAdresHaritasiUret — FAIL-CLOSED (plan §4.1 Y2)', () => {
  it('DB\'ye ulaşılamazsa HATA (boş harita üretmez)', async () => {
    await expect(uret({ agHatasi: 'products' })).rejects.toThrow(/products okunamadı.*fetch failed/)
  })

  it('tablo hata dönerse HATA (ör. products için yetki hatası)', async () => {
    await expect(uret({ sunucuHatasi: 'products' })).rejects.toThrow(/products okunamadı: permission denied for table products/)
  })

  it('⭐takma ad işlevi yetki hatası dönerse HATA (42501: EXECUTE yok; boş liste gibi geçmez)', async () => {
    await expect(uret({ sunucuHatasi: TAKMA_AD_ISLEVI })).rejects.toThrow(
      /url_takma_adlari okunamadı: permission denied for function url_takma_adlari_listele/
    )
  })

  it('⭐takma ad işlevi YOKSA HATA (migration henüz uygulanmamış; PGRST202 sessizce boş liste olmaz)', async () => {
    await expect(uret({ islevYok: TAKMA_AD_ISLEVI })).rejects.toThrow(
      /url_takma_adlari okunamadı: Could not find the function public\.url_takma_adlari_listele/
    )
  })

  it('⭐takma ad işlevine ulaşılamazsa HATA (ağ yok; harita takma adsız üretilmez)', async () => {
    await expect(uret({ agHatasi: TAKMA_AD_ISLEVI })).rejects.toThrow(/url_takma_adlari okunamadı.*fetch failed/)
  })

  it('takma ad listesi BOŞSA hata DEĞİL: yeni kiracı meşrudur; yalnız takma ad kaynaklı adresler eksik kalır', async () => {
    const tablolar = { ...FIKSTUR_TABLOLARI, url_takma_adlari: [] }
    const { harita } = await uret({ tablolar })
    const { harita: tam } = await uret()
    expect(harita.urunSayisi).toBe(10)
    expect(tam.aileSluglari['seat-storm']).toBe(tam.aileler.indexOf('storm-serisi')) // takma ad: DB'den
    expect(harita.aileSluglari['seat-storm']).toBeUndefined() // takma ad yok → eski adres yok (canlı slug'lar duruyor)
    expect(harita.aileSluglari['storm-serisi']).toBeDefined()
    expect(harita.modeller['SEA-61143003']).toBeDefined()
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

  it('⭐kısmi okuma: sunucu sayfayı 2 satıra kırpsa da takma adlar (6 satır, 3 sayfa + boş sayfa) TAMAMEN okunur', async () => {
    const { harita: tam } = await uret()
    const { harita: kirpik, cagrilar } = await uret({ sunucuSayfaSiniri: 2 })
    // Kırpılmış sunucuyla okunan harita, kırpmayan sunucuyla okunanın BİREBİR aynısı: bir sayfa düşseydi fark çıkardı.
    expect(kirpik).toEqual(tam)
    expect(cagrilar.filter((c) => takmaAdCagrisi(c.url)).length).toBeGreaterThanOrEqual(4) // 3 veri + 1 boş sayfa
    // Sıralamanın EN SONUNDAKİ takma ad türü (`urun`) da okundu: döngü ilk kısa sayfada bırakılmadı.
    expect(kirpik.urunSluglari['vortice-ca-il-4020-es-rect-16076']).toBe('VRT-CA-IL-4020-ES-RECT')
    expect(kirpik.urunSluglari['vorticent-cms-atex-35-14-t4-4kw-253490106xn']).toBe('VRT-253490106XN')
  })

  it('tohum hedefi bulunamazsa HATA', async () => {
    const tablolar = {
      ...FIKSTUR_TABLOLARI,
      product_families: FIKSTUR_TABLOLARI.product_families.filter((f) => f.slug !== 'vortice-lineo-quiet-sessiz-kanal-fanlari'),
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
