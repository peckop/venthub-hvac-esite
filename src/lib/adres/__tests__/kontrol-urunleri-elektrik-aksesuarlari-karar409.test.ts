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
 * KTL-63 · KARAR 409 (Model B) — "ELEKTRİK AKSESUARLARI" AYRI ANA KATEGORİ, "AKSESUARLAR" KALIR.
 *
 * Migration (supabase/migrations/20261025220000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql): `control-systems`
 * satırı "Elektrik Aksesuarları" olur (kimlik korunur), `spare-parts-sensors` "Sensörler ve Koruma" olur ve ona taşınır,
 * SEAT PTC ailesi ona geçer, BVU-LS Aksesuarlar kökünde kalır (alt kategorisiz).
 *
 * İKİ ŞEY ÖLÇÜLÜR:
 *   A. K3-b (bayrak AÇIK) harita mekanizması: migration SONRASI durum fikstür DB'ye uygulanır, harita ÜRETİCİYLE kurulur;
 *      eski adresler TEK adımda yeni adrese gider. (Canlı kip — bayrak kapalı — ayrı dosyada:
 *      src/lib/data/__tests__/eskiKategoriHedefiKarar409.test.ts.)
 *   B. Sözleşme: sözlükteki görünen adlar migration'ın yazdığı dizelerle birebir aynı; migration silmez/eklemez/pasifleştirmez,
 *      EN kanonik slug'a dokunmaz, sayı kapılarını taşır; geri alma aynı kimliklerle eski değerleri yazar.
 *
 * ÖLÇMEDİĞİ: migration'ın canlıda çalıştığı (RAISE kapıları apply anında sayar) ve sayfa katmanının (ISR) 308 verdiği;
 * o kanıt birleşme sonrası HTTP ölçümüyle alınır.
 */
const tohum = tohumDogrula(tohumHam)

const ID = {
  controlSystems: '00000000-0000-4000-8000-0000000000c9',
  frequencyConverters: '00000000-0000-4000-8000-0000000000e6',
  sensors: '00000000-0000-4000-8000-0000000000e7',
} as const

/** Migration SONRASI kategori tabloları + takma adlar. */
function migrasyonSonrasi(): SahteTablolar {
  const kategoriler = FIKSTUR_TABLOLARI.categories.map((k) => {
    const id = (k as { id: string }).id
    const meta = (k as { metadata: { slug: { tr: string; en: string } } }).metadata
    // Kök: kimlik aynı, TR slug yeni (fikstür 10 Ekim öncesi kesit: 'kontrol-sistemleri').
    if (id === ID.controlSystems) return { ...k, metadata: { ...meta, slug: { ...meta.slug, tr: 'elektrik-aksesuarlari' } } }
    return k
  })
  const eklenen = [
    {
      id: ID.frequencyConverters,
      slug: 'frequency-converters',
      metadata: { slug: { tr: 'frekans-konvertorleri', en: 'frequency-converters' } },
      parent_id: ID.controlSystems,
      is_active: true,
      tenant_id: VARSAYILAN_KIRACI,
    },
    {
      id: ID.sensors,
      slug: 'spare-parts-sensors',
      metadata: { slug: { tr: 'sensorler-ve-koruma', en: 'spare-parts-sensors' } },
      parent_id: ID.controlSystems,
      is_active: true,
      tenant_id: VARSAYILAN_KIRACI,
    },
  ]
  const takma = [
    ...FIKSTUR_TABLOLARI.url_takma_adlari,
    // Tetik (url_takma_ad_kategori) TR slug değişince eski adı yazar; eski adlar önceki migration'lardan kalır.
    { tur: 'kategori', dil: 'tr', eski_slug: 'kontrol-ve-suruculer', hedef_id: ID.controlSystems, tenant_id: VARSAYILAN_KIRACI },
    { tur: 'kategori', dil: 'tr', eski_slug: 'kontrol-sistemleri', hedef_id: ID.controlSystems, tenant_id: VARSAYILAN_KIRACI },
    { tur: 'kategori', dil: 'tr', eski_slug: 'yedek-parcalar-ve-sensorler', hedef_id: ID.sensors, tenant_id: VARSAYILAN_KIRACI },
    { tur: 'kategori', dil: 'tr', eski_slug: 'yedek-parca-ve-sensorler', hedef_id: ID.sensors, tenant_id: VARSAYILAN_KIRACI },
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
const SENSOR = '/tr/kategori/sensorler-ve-koruma'

describe('A. K3-b harita: eski adres → yeni adres, TEK 308', () => {
  it.each([
    ['eski kök adı (kontrol-ve-suruculer)', '/tr/category/kontrol-ve-suruculer', ANA],
    ['daha eski kök adı (kontrol-sistemleri)', '/tr/category/kontrol-sistemleri', ANA],
    ['eski alt (yedek-parcalar-ve-sensorler)', '/tr/category/yedek-parcalar-ve-sensorler', SENSOR],
    ['daha eski alt (yedek-parca-ve-sensorler)', '/tr/category/yedek-parca-ve-sensorler', SENSOR],
    ['yeni kök, eski şemadan', '/tr/category/elektrik-aksesuarlari', ANA],
    ['yeni alt, eski şemadan', '/tr/category/sensorler-ve-koruma', SENSOR],
    ['Aksesuarlar kökü DEĞİŞMEDİ, yalnız şema', '/tr/category/aksesuarlar', '/tr/kategori/aksesuarlar'],
  ])('%s: %s → %s', async (_ad, yol, hedef) => {
    const harita = await haritaKur()
    const { sonuc, dilTespit } = esle(harita, yol)
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('iç içe eski adres: dalın kanonik tek segmentli adresine TEK 308', async () => {
    const harita = await haritaKur()
    for (const [yol, dal] of [
      ['/tr/category/kontrol-ve-suruculer/frekans-konvertorleri', 'frekans-konvertorleri'],
      ['/tr/category/kontrol-sistemleri/hiz-anahtarlari', 'hiz-anahtarlari'],
      ['/tr/kategori/kontrol-ve-suruculer/sensorler-ve-koruma', 'sensorler-ve-koruma'],
    ] as const) {
      expect(esle(harita, yol).sonuc, yol).toEqual({ hedef: `/tr/kategori/${dal}`, durum: 308 })
    }
  })

  it('hedefler kanoniktir: kendine yönlenmez (zincir yok)', async () => {
    const harita = await haritaKur()
    for (const hedef of [ANA, SENSOR, '/tr/kategori/frekans-konvertorleri', '/tr/kategori/aksesuarlar']) {
      expect(esle(harita, hedef).sonuc, hedef).toBeNull()
    }
  })
})

describe('B. sözleşme: sözlük adı = migration adı; silme/ekleme/pasifleştirme yok; EN slug değişmez; sayı kapıları', () => {
  const KOK = process.cwd()
  const MIGRATION = readFileSync(join(KOK, 'supabase/migrations/20261025220000_kontrol_urunleri_elektrik_aksesuarlari_karar409.sql'), 'utf8')
  const GERI_AL = readFileSync(join(KOK, 'scripts/db/geri-alma/20261025220000_kontrol_urunleri_elektrik_aksesuarlari_karar409.geri-al.sql'), 'utf8')
  const trListe = tr.common.categoryList as Record<string, unknown>
  const trSub = tr.common.categoryList.sub as Record<string, string>
  const enListe = en.common.categoryList as Record<string, unknown>
  const enSub = en.common.categoryList.sub as Record<string, string>

  it('TR sözlük adları migration\'ın yazdığı name ile birebir aynı', () => {
    expect(trListe['control-systems']).toBe('Elektrik Aksesuarları')
    expect(trSub['spare-parts']).toBe('Sensörler ve Koruma')
    expect(trSub['freq-converters']).toBe('Frekans Konvertörleri (İnvertör)')
    expect(trListe.hrv).toBe('Isı Geri Kazanım')
    expect(trSub['ducted-central-hrv']).toBe('Kanallı Isı Geri Kazanım Cihazları')
    expect(trSub['single-room-hrv']).toBe('Oda Tipi Isı Geri Kazanım Cihazları')
    expect(trSub['water-coils']).toBe('Sulu Bataryalı Kanal Isıtıcıları')
    expect(trListe.accessories).toBe('Aksesuarlar')
    for (const ad of [
      "name = 'Elektrik Aksesuarları',",
      "menu_label = 'Elektrik Aksesuarları',",
      "name = 'Sensörler ve Koruma',",
      "name = 'Frekans Konvertörleri (İnvertör)'",
      "'Isı Geri Kazanım'",
      "'Kanallı Isı Geri Kazanım Cihazları'",
      "'Oda Tipi Isı Geri Kazanım Cihazları'",
      "'Sulu Bataryalı Kanal Isıtıcıları'",
    ]) {
      expect(MIGRATION, ad).toContain(ad)
    }
  })

  it('EN sözlük: Electrical Accessories ve Sensors and Protection; öbür EN adlar değişmedi (Menü yalnız işaretli satırlarda EN değiştirir)', () => {
    expect(enListe['control-systems']).toBe('Electrical Accessories')
    expect(enSub['spare-parts']).toBe('Sensors and Protection')
    expect(enSub['freq-converters']).toBe('Frequency Converters')
    expect(enSub['speed-controllers']).toBe('Speed Controllers')
    expect(enListe.accessories).toBe('Accessories and Components')
  })

  it('TR slug\'lar migration\'da ve parantezsiz; EN kanonik slug\'a (slug sütunu, metadata slug.en) dokunulmaz', () => {
    expect(MIGRATION).toContain("to_jsonb('elektrik-aksesuarlari'::text)")
    expect(MIGRATION).toContain("to_jsonb('sensorler-ve-koruma'::text)")
    expect(MIGRATION).not.toMatch(/set\s+slug\s*=/i)
    expect(MIGRATION).not.toMatch(/'\{slug,en\}'/)
    expect(MIGRATION).not.toMatch(/frekans-konvertorleri-invertor/)
  })

  it('migration SİLMEZ, kategori EKLEMEZ, PASİFLEŞTİRMEZ (canlı kipte pasif kategori 200+noindex çizilir)', () => {
    expect(MIGRATION).not.toMatch(/\bdelete\s+from\b/i)
    expect(MIGRATION).not.toMatch(/\binsert\s+into\s+public\.categories\b/i)
    expect(MIGRATION).not.toMatch(/\bdrop\s+/i)
    expect(MIGRATION).not.toMatch(/is_active\s*=\s*false/i)
  })

  it('SEAT PTC kök değiştirir, BVU-LS alt kategoriden çıkar; sayı kapıları migration ve geri almada', () => {
    expect(MIGRATION).toMatch(/v_aile <> 2 or v_adet <> 2 or v_urun <> 3/)
    expect(MIGRATION).toMatch(/v_aile <> 5 or v_urun <> 38/)
    expect(MIGRATION).toMatch(/v_aile <> 1 or v_urun <> 2/)
    expect(MIGRATION).toContain('update public.product_families set subcategory_id = null')
    expect(MIGRATION).toContain("slug = 'avens-bvu-ls-kursun-seperator'")
    expect(MIGRATION).toContain("slug = 'seat-atex-ptc-sensoru'")
    expect(GERI_AL).toMatch(/v_aile <> 1 or v_urun <> 1/)
    expect(GERI_AL).toMatch(/v_aile <> 1 or v_urun <> 2/)
  })

  it('metadata YOL BAZLI yazılır (jsonb_set), nesne baştan atanmaz; üst anahtar sayısı korunur (10 Ekim dersi)', () => {
    for (const metin of [MIGRATION, GERI_AL]) {
      expect(metin).not.toMatch(/metadata\s*=\s*'/)
      expect(metin).not.toMatch(/metadata\s*=\s*(jsonb_build_object|to_jsonb|'\{)/i)
      expect(metin).not.toMatch(/metadata\s*=\s*(c\.)?metadata\s*\|\|/)
    }
    expect(MIGRATION).toContain('jsonb_set(')
    expect(MIGRATION).toContain('guard 4b')
    expect(MIGRATION).toContain('jsonb_object_keys(c.metadata)')
  })

  it('SEO başlığı/açıklamada eski ad yeni adla değişir (OPS 25 Ekim); cümle yapısı aynı, yalnız ad', () => {
    for (const [eski, yeni] of [
      ['Kanallı Merkezi Üniteler', 'Kanallı Isı Geri Kazanım Cihazları'],
      ['Sulu Batarya Kanal Tipi', 'Sulu Bataryalı Kanal Isıtıcıları'],
      ['Isı Geri Kazanım (VMC)', 'Isı Geri Kazanım'],
      ['Tekil oda üniteleri', 'Oda tipi ısı geri kazanım cihazları'],
      ['kanallı merkezi üniteler', 'kanallı ısı geri kazanım cihazları'],
    ] as const) {
      expect(MIGRATION, `${eski} → ${yeni}`).toContain(`'${eski}'`)
      expect(MIGRATION, `${eski} → ${yeni}`).toContain(`'${yeni}'`)
      expect(GERI_AL, `geri: ${yeni} → ${eski}`).toContain(`'${yeni}'`)
      expect(GERI_AL, `geri: ${yeni} → ${eski}`).toContain(`'${eski}'`)
    }
    expect(MIGRATION).toContain("raise exception 'KTL-63 adım 6b")
  })

  it('geri alma eski değerleri ve aynı kimlikleri yazar', () => {
    for (const eski of [
      "'Kontrol Sistemleri'",
      "'Frekans Konvertörleri'",
      "'Yedek Parça ve Sensörler'",
      "to_jsonb('kontrol-ve-suruculer'::text)",
      "to_jsonb('yedek-parcalar-ve-sensorler'::text)",
      "'Isı Geri Kazanım (VMC)'",
      "'Kanallı Merkezi Üniteler'",
      "'Tekil Oda Üniteleri'",
      "'Sulu Batarya Kanal Tipi'",
    ]) {
      expect(GERI_AL, eski).toContain(eski)
    }
    for (const id of [
      '6d3749d5-13fa-4cb0-9467-d99586a39f89',
      '9dcf8e58-32bf-4828-8422-b1e2e1499abe',
      '194adcb5-df15-45b2-adc1-d5502012e4c1',
      '1a87e18b-6195-48f4-8c75-2f5f5feb137f',
      '55937a21-b3f4-4aea-b0c3-4a19f54d9006',
      '61a657c1-1e4e-48c9-838f-7a43c7492dd6',
    ]) {
      expect(GERI_AL, id).toContain(id)
    }
  })
})
