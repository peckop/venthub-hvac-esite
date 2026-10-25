// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import type { AdresDili } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import { eskiAdresHaritasiUret } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { FIKSTUR_TABLOLARI, sahteDb, type SahteTablolar, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * KTL-63 · KARAR 409 — KONTROL ÜRÜNLERİ TEK ANA KATEGORİDE (Elektrik Aksesuarları).
 *
 * Migration (supabase/migrations/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql) `accessories`'i ana
 * kategori yapar, `frequency-converters` ve `speed-controllers` üstünü ona çevirir, `spare-parts-sensors`'u
 * "Sensörler ve Koruma" yapar, `control-systems`'i PASİF yapıp `accessories`'in altına koyar.
 *
 * İKİ ŞEY ÖLÇÜLÜR:
 *   A. Adres mekanizması: migration SONRASI durum fikstür DB'ye uygulanır, harita ÜRETİCİYLE kurulur; eski kök
 *      adresleri (kontrol-ve-suruculer, kontrol-sistemleri, control-systems), eski ana/alt adları (aksesuarlar,
 *      yedek-parcalar-ve-sensorler) TEK adımda yeni adrese gider. Pasif kök, üstü olmadan "tüm ürünler"e düşerdi;
 *      testin ana iddiası üstünün accessories olmasıyla bunun önlendiğidir.
 *   B. Sözleşme: sözlükteki görünen adlar migration'ın yazdığı dizelerle birebir aynı; migration silme yapmaz, EN
 *      kanonik slug'a dokunmaz, sayı kapılarını (4 aile / 37 ürün / 6 aile / 40 ürün) taşır; geri alma aynı sayıları sayar.
 *
 * ÖLÇMEDİĞİ: migration'ın canlıda çalıştığı (RAISE kapıları apply anında sayar) ve sayfa katmanının (ISR) 308 verdiği;
 * o kanıt birleşme sonrası HTTP ölçümüyle alınır.
 */
const tohum = tohumDogrula(tohumHam)

const ID = {
  accessories: '00000000-0000-4000-8000-0000000000cb',
  controlSystems: '00000000-0000-4000-8000-0000000000c9',
  speedControllers: '00000000-0000-4000-8000-0000000000ca',
  frequencyConverters: '00000000-0000-4000-8000-0000000000e6',
  sensors: '00000000-0000-4000-8000-0000000000e7',
} as const

/** Migration SONRASI kategori tabloları + takma adlar. */
function migrasyonSonrasi(): SahteTablolar {
  const kategoriler = FIKSTUR_TABLOLARI.categories.map((k) => {
    const id = (k as { id: string }).id
    const meta = (k as { metadata: { slug: { tr: string; en: string } } }).metadata
    if (id === ID.accessories) return { ...k, metadata: { ...meta, slug: { ...meta.slug, tr: 'elektrik-aksesuarlari' } } }
    // Eski kök: pasif, üstü accessories, TR slug 10 Ekim'den beri kontrol-ve-suruculer.
    if (id === ID.controlSystems) {
      return { ...k, is_active: false, parent_id: ID.accessories, metadata: { ...meta, slug: { ...meta.slug, tr: 'kontrol-ve-suruculer' } } }
    }
    if (id === ID.speedControllers) return { ...k, parent_id: ID.accessories }
    return k
  })
  const eklenen = [
    {
      id: ID.frequencyConverters,
      slug: 'frequency-converters',
      metadata: { slug: { tr: 'frekans-konvertorleri', en: 'frequency-converters' } },
      parent_id: ID.accessories,
      is_active: true,
      tenant_id: VARSAYILAN_KIRACI,
    },
    {
      id: ID.sensors,
      slug: 'spare-parts-sensors',
      metadata: { slug: { tr: 'sensorler-ve-koruma', en: 'spare-parts-sensors' } },
      parent_id: ID.accessories,
      is_active: true,
      tenant_id: VARSAYILAN_KIRACI,
    },
  ]
  const takma = [
    ...FIKSTUR_TABLOLARI.url_takma_adlari,
    // Tetik (url_takma_ad_kategori) TR slug değişince eski adı yazar: aksesuarlar, yedek-parcalar-ve-sensorler.
    { tur: 'kategori', dil: 'tr', eski_slug: 'aksesuarlar', hedef_id: ID.accessories, tenant_id: VARSAYILAN_KIRACI },
    { tur: 'kategori', dil: 'tr', eski_slug: 'yedek-parcalar-ve-sensorler', hedef_id: ID.sensors, tenant_id: VARSAYILAN_KIRACI },
    // 10 Ekim migration'ının yazdığı eski kök adı (control-systems satırına işaret eder; satır artık pasif).
    { tur: 'kategori', dil: 'tr', eski_slug: 'kontrol-sistemleri', hedef_id: ID.controlSystems, tenant_id: VARSAYILAN_KIRACI },
  ]
  return { ...FIKSTUR_TABLOLARI, categories: [...kategoriler, ...eklenen], url_takma_adlari: takma }
}

async function haritaKur() {
  const { istemci } = sahteDb({ tablolar: migrasyonSonrasi() })
  return eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
}

function esle(harita: Awaited<ReturnType<typeof haritaKur>>, yol: string, dil: AdresDili = 'tr') {
  const dilTespit = vi.fn(() => dil)
  return { sonuc: eskiAdresEsle(harita, { yol, sku: null, dilTespit }), dilTespit }
}

const ANA = '/tr/kategori/elektrik-aksesuarlari'

describe('A. adres mekanizması: eski adres → yeni adres, TEK 308', () => {
  it.each([
    ['eski ana (aksesuarlar)', '/tr/category/aksesuarlar', ANA],
    ['eski kök (kontrol-ve-suruculer, pasif, üstü accessories)', '/tr/category/kontrol-ve-suruculer', ANA],
    ['daha eski kök adı (kontrol-sistemleri)', '/tr/category/kontrol-sistemleri', ANA],
    ['eski alt (yedek-parcalar-ve-sensorler)', '/tr/category/yedek-parcalar-ve-sensorler', '/tr/kategori/sensorler-ve-koruma'],
    ['yeni ana, eski şemadan', '/tr/category/elektrik-aksesuarlari', ANA],
    ['yeni alt, eski şemadan', '/tr/category/sensorler-ve-koruma', '/tr/kategori/sensorler-ve-koruma'],
  ])('%s: %s → %s', async (_ad, yol, hedef) => {
    const harita = await haritaKur()
    const { sonuc, dilTespit } = esle(harita, yol)
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('PASİF KÖK "TÜM ÜRÜNLER"E DÜŞMEZ: eski kök adresi yeni ana kategoriye gider (üstü accessories olduğu için)', async () => {
    const harita = await haritaKur()
    for (const yol of ['/tr/category/kontrol-ve-suruculer', '/tr/category/kontrol-sistemleri', '/category/control-systems']) {
      const { sonuc } = esle(harita, yol)
      expect(sonuc, yol).not.toBeNull()
      expect(sonuc?.hedef, yol).not.toMatch(/urunler|products/)
      expect(sonuc?.hedef, yol).toContain('elektrik-aksesuarlari')
    }
  })

  it('iç içe eski adres (eski kök/alt): dalın kanonik tek segmentli adresine TEK 308', async () => {
    const harita = await haritaKur()
    for (const yol of [
      '/tr/category/kontrol-ve-suruculer/hiz-anahtarlari',
      '/tr/category/kontrol-sistemleri/frekans-konvertorleri',
      '/tr/kategori/kontrol-ve-suruculer/frekans-konvertorleri',
    ]) {
      const { sonuc } = esle(harita, yol)
      const dal = yol.endsWith('hiz-anahtarlari') ? 'hiz-anahtarlari' : 'frekans-konvertorleri'
      expect(sonuc, yol).toEqual({ hedef: `/tr/kategori/${dal}`, durum: 308 })
    }
  })

  it('hedefler kanoniktir: kendine yönlenmez (zincir yok)', async () => {
    const harita = await haritaKur()
    for (const hedef of [ANA, '/tr/kategori/sensorler-ve-koruma', '/tr/kategori/frekans-konvertorleri', '/tr/kategori/hiz-anahtarlari']) {
      expect(esle(harita, hedef).sonuc, hedef).toBeNull()
    }
  })
})

describe('B. sözleşme: sözlük adı = migration adı, silme yok, EN slug değişmez, sayı kapıları', () => {
  const KOK = process.cwd()
  const MIGRATION = readFileSync(join(KOK, 'supabase/migrations/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql'), 'utf8')
  const GERI_AL = readFileSync(join(KOK, 'scripts/db/geri-alma/20261026090000_kontrol_urunleri_elektrik_aksesuarlari_karar409.geri-al.sql'), 'utf8')
  const trListe = tr.common.categoryList as Record<string, unknown>
  const enListe = en.common.categoryList as Record<string, unknown>
  const trSub = tr.common.categoryList.sub as Record<string, string>
  const enSub = en.common.categoryList.sub as Record<string, string>

  it('TR sözlük adları migration\'ın yazdığı name ile birebir aynı', () => {
    expect(trListe.accessories).toBe('Elektrik Aksesuarları')
    expect(trSub['freq-converters']).toBe('Frekans Konvertörleri (İnvertör)')
    expect(trSub['spare-parts']).toBe('Sensörler ve Koruma')
    expect(MIGRATION).toContain("name = 'Elektrik Aksesuarları',")
    expect(MIGRATION).toContain("menu_label = 'Elektrik Aksesuarları',")
    expect(MIGRATION).toContain("name = 'Frekans Konvertörleri (İnvertör)'")
    expect(MIGRATION).toContain("name = 'Sensörler ve Koruma',")
  })

  it('EN sözlük adları karar metnindeki adlar; EN alt adı (Frequency Converters) ve hız anahtarı adı değişmez', () => {
    expect(enListe.accessories).toBe('Electrical Accessories')
    expect(enSub['spare-parts']).toBe('Sensors and Protection')
    expect(enSub['freq-converters']).toBe('Frequency Converters')
    expect(enSub['speed-controllers']).toBe('Speed Controllers')
  })

  it('TR slug\'lar migration\'da, parantezsiz; EN kanonik slug\'a (slug sütunu) dokunulmaz', () => {
    expect(MIGRATION).toContain("to_jsonb('elektrik-aksesuarlari'::text)")
    expect(MIGRATION).toContain("to_jsonb('sensorler-ve-koruma'::text)")
    expect(MIGRATION).not.toMatch(/set\s+slug\s*=/i)
    expect(MIGRATION).not.toMatch(/'\{slug,en\}'/)
    expect(MIGRATION).not.toMatch(/frekans-konvertorleri-invertor/)
  })

  it('migration SİLMEZ ve yeni kategori EKLEMEZ (taksonomi cetveli §1 ve §9)', () => {
    expect(MIGRATION).not.toMatch(/\bdelete\s+from\b/i)
    expect(MIGRATION).not.toMatch(/\binsert\s+into\s+public\.categories\b/i)
    expect(MIGRATION).not.toMatch(/\bdrop\s+/i)
  })

  it('eski kök pasifleşir ve accessories\'in altına konur; dört aile ve 37 ürün kimlikle sayılır', () => {
    expect(MIGRATION).toContain('set is_active = false, parent_id = k_acc where id = k_ctl')
    expect(MIGRATION).toMatch(/v_aile_adet <> 4 or v_adet <> 4 or v_urun_adet <> 37/)
    expect(MIGRATION).toMatch(/v_aile_adet <> 6 or v_urun_adet <> 40/)
    for (const aile of ['danfoss-vlt-micro-drive-fc-51', 'danfoss-vlt-hvac-basic-drive-fc-101', 'danfoss-vlt-hvac-drive-fc-102', 'avens-hiz-anahtarlari']) {
      expect(MIGRATION, aile).toContain(aile)
    }
  })

  it('BVU-LS ve SEAT PTC ailelerine dokunulmaz (Sensörler ve Koruma altında bugünkü yerinde; taşıma tek satır)', () => {
    expect(MIGRATION).not.toContain('avens-bvu-ls-kursun-seperator')
    expect(MIGRATION).not.toContain('seat-atex-ptc-sensoru')
  })

  it('geri alma aynı kimliklerle ve aynı sayı kapısıyla eski değerleri yazar', () => {
    for (const eski of ["'Aksesuarlar'", "'Frekans Konvertörleri'", "'Yedek Parça ve Sensörler'", "'aksesuarlar'::text", "'yedek-parcalar-ve-sensorler'::text"]) {
      expect(GERI_AL, eski).toContain(eski)
    }
    expect(GERI_AL).toMatch(/v_aile <> 4 or v_urun <> 37/)
    expect(GERI_AL).toContain('is_active = true, parent_id = null')
    for (const id of ['6d3749d5-13fa-4cb0-9467-d99586a39f89', '9dcf8e58-32bf-4828-8422-b1e2e1499abe', '194adcb5-df15-45b2-adc1-d5502012e4c1', '7c673ad2-ed6a-48b4-9aba-6930e9815636', '1a87e18b-6195-48f4-8c75-2f5f5feb137f']) {
      expect(GERI_AL, id).toContain(id)
    }
  })
})
