// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import type { AdresDili } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import { eskiAdresHaritasiUret } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { FIKSTUR_TABLOLARI, sahteDb, type SahteTablolar, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * URN-85 — SEKİZ KATEGORİNİN TR ADI DESIGN CSV'YE ÇEKİLİR: ESKİ TR ADRES → YENİ TR ADRES, TEK SIÇRAMA 308.
 *
 * Migration (supabase/migrations/20261010090000_kategori_tr_adlari_design_csv.sql) `categories.metadata.slug.tr`
 * değerini sekiz satırda değiştirir; EN kanonik `categories.slug` değişmez. Faz 1-A tetiği (`url_takma_ad_kategori`)
 * eski TR adı `url_takma_adlari`'na (tur=kategori, dil=tr, hedef=kategori kimliği) yazar. Bu test migration SONRASI
 * durumu fikstür DB'ye uygular, haritayı ÜRETİCİYLE kurar ve eşleyicinin eski adresten yeni adrese TEK adımda
 * gittiğini ölçer (emsal: korozyon-tek-sicrama.test.ts).
 *
 * KAPSAM: eşleme mekanizması. Üç kategori (kontrol-sistemleri, hava şartlandırma, tekil oda üniteleri) paylaşılan
 * fikstürden gelir; kalan beşi bu testte KÖK olarak kurulur (adres mekanizması üst kategoriden bağımsızdır; gerçek
 * dallanma canlı DB'de ölçüldü, plan §Ölçüm).
 *
 * ÖLÇMEDİĞİ: tetiğin canlıda ateşlendiği (migration guard 3 takma ad SATIRINI apply anında sayar) ve sayfa
 * katmanının (kiracı çözümü, ISR yeniden üretimi) 308 verdiği: o kanıt birleşme sonrası HTTP ölçümüyle alınır.
 */
const tohum = tohumDogrula(tohumHam)

interface Satir {
  en: string
  eski: string
  yeni: string
  /** Fikstürde var olan kategori kimliği; yoksa test kök satırı kurar. */
  id: string
  /** Yeni adresin TR yolu (ebeveyn varsa köküyle). */
  hedef: string
}

const SATIRLAR: readonly Satir[] = [
  {
    en: 'control-systems',
    eski: 'kontrol-sistemleri',
    yeni: 'kontrol-ve-suruculer',
    id: '00000000-0000-4000-8000-0000000000c9',
    hedef: '/tr/kategori/kontrol-ve-suruculer',
  },
  {
    en: 'air-treatment',
    eski: 'iklimlendirme-ve-hava-sartlandirma',
    yeni: 'hava-sartlandirma',
    id: '00000000-0000-4000-8000-0000000000cc',
    hedef: '/tr/kategori/hava-sartlandirma',
  },
  {
    en: 'single-room-hrv',
    eski: 'tekil-oda-uniteleri',
    yeni: 'tek-oda-uniteleri',
    id: '00000000-0000-4000-8000-0000000000c8',
    hedef: '/tr/kategori/isi-geri-kazanim/tek-oda-uniteleri',
  },
  {
    en: 'water-coil-duct-heaters',
    eski: 'sulu-batarya-kanal-tipi',
    yeni: 'sulu-bataryalar',
    id: '00000000-0000-4000-8000-0000000000e1',
    hedef: '/tr/kategori/sulu-bataryalar',
  },
  {
    en: 'axial-industrial-fans',
    eski: 'aksiyel-sanayi-fanlari',
    yeni: 'aksiyel-fanlar',
    id: '00000000-0000-4000-8000-0000000000e2',
    hedef: '/tr/kategori/aksiyel-fanlar',
  },
  {
    en: 'spare-parts-sensors',
    eski: 'yedek-parca-ve-sensorler',
    yeni: 'yedek-parcalar-ve-sensorler',
    id: '00000000-0000-4000-8000-0000000000e3',
    hedef: '/tr/kategori/yedek-parcalar-ve-sensorler',
  },
  {
    en: 'bathroom-toilet-fans',
    eski: 'banyo-ve-tuvalet-fanlari',
    yeni: 'banyo-tuvalet-fanlari',
    id: '00000000-0000-4000-8000-0000000000e4',
    hedef: '/tr/kategori/banyo-tuvalet-fanlari',
  },
  {
    en: 'industrial-ceiling-fans',
    eski: 'endustriyel-tavan-vantilatorleri',
    yeni: 'tavan-vantilatorleri',
    id: '00000000-0000-4000-8000-0000000000e5',
    hedef: '/tr/kategori/tavan-vantilatorleri',
  },
]

const FIKSTURDEKI_IDLER = new Set(
  FIKSTUR_TABLOLARI.categories.map((k) => (k as { id: string }).id),
)

/** Migration SONRASI tablolar: sekiz satırda metadata.slug.tr yeni ad; takma ad satırı yazıldı ya da yazılmadı. */
function migrasyonSonrasiTablolar(takmaAdYaz: boolean): SahteTablolar {
  const yenidenAdlanan = new Map(SATIRLAR.map((s) => [s.id, s]))
  const kategoriler = FIKSTUR_TABLOLARI.categories.map((k) => {
    const satir = yenidenAdlanan.get((k as { id: string }).id)
    if (!satir) return k
    const eskiMeta = (k as { metadata: { slug: { tr: string; en: string } } }).metadata
    return { ...k, metadata: { ...eskiMeta, slug: { ...eskiMeta.slug, tr: satir.yeni } } }
  })
  // Fikstürde olmayan kategoriler köktür (parent_id yok); EN kanonik slug = categories.slug.
  const eklenen = SATIRLAR.filter((s) => !FIKSTURDEKI_IDLER.has(s.id)).map((s) => ({
    id: s.id,
    slug: s.en,
    metadata: { slug: { tr: s.yeni, en: s.en } },
    parent_id: null,
    is_active: true,
    tenant_id: VARSAYILAN_KIRACI,
  }))
  const takma = [
    ...FIKSTUR_TABLOLARI.url_takma_adlari,
    ...(takmaAdYaz
      ? SATIRLAR.map((s) => ({
          tur: 'kategori',
          dil: 'tr',
          eski_slug: s.eski,
          hedef_id: s.id,
          tenant_id: VARSAYILAN_KIRACI,
        }))
      : []),
  ]
  return { ...FIKSTUR_TABLOLARI, categories: [...kategoriler, ...eklenen], url_takma_adlari: takma }
}

async function haritaKur(takmaAdYaz: boolean) {
  const { istemci } = sahteDb({ tablolar: migrasyonSonrasiTablolar(takmaAdYaz) })
  return eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
}

function esle(harita: Awaited<ReturnType<typeof haritaKur>>, yol: string, dil: AdresDili = 'tr') {
  const dilTespit = vi.fn(() => dil)
  return { sonuc: eskiAdresEsle(harita, { yol, sku: null, dilTespit }), dilTespit }
}

describe('kategori TR adları: eski TR adres → yeni TR adres, TEK 308 (sekiz kategori)', () => {
  it('fikstür sekiz ayrı kategoriyi ve sekiz ayrı eski/yeni adı taşır (test kendi girdisini korur)', () => {
    expect(new Set(SATIRLAR.map((s) => s.en)).size).toBe(8)
    expect(new Set(SATIRLAR.map((s) => s.eski)).size).toBe(8)
    expect(new Set(SATIRLAR.map((s) => s.yeni)).size).toBe(8)
    // Eski ad ile yeni ad hiçbir satırda aynı değil (aynı olsaydı yeniden adlandırma sınanmış olmazdı).
    expect(SATIRLAR.filter((s) => s.eski === s.yeni)).toEqual([])
  })

  it.each(SATIRLAR.map((s) => [s.eski, s.hedef, s.en] as const))(
    '/tr/category/%s → %s (%s), dil tespiti yok',
    async (eski, hedef) => {
      const harita = await haritaKur(true)
      const { sonuc, dilTespit } = esle(harita, `/tr/category/${eski}`)
      expect(sonuc).toEqual({ hedef, durum: 308 })
      expect(dilTespit).not.toHaveBeenCalled()
    },
  )

  it.each(SATIRLAR.map((s) => [s.eski, s.hedef] as const))(
    'dilsiz /category/%s: Türkçe slug olduğu için dil tespiti OLMADAN tek 308 → %s',
    async (eski, hedef) => {
      const harita = await haritaKur(true)
      const { sonuc, dilTespit } = esle(harita, `/category/${eski}`, 'en')
      expect(sonuc).toEqual({ hedef, durum: 308 })
      expect(dilTespit).not.toHaveBeenCalled()
    },
  )

  it.each(SATIRLAR.map((s) => [s.yeni, s.hedef] as const))(
    'yeni TR slug (%s) de eski şemadan tek hop çözülür → %s',
    async (yeni, hedef) => {
      const harita = await haritaKur(true)
      expect(esle(harita, `/tr/category/${yeni}`).sonuc).toEqual({ hedef, durum: 308 })
    },
  )

  it.each(SATIRLAR.map((s) => [s.hedef] as const))('hedef %s kanoniktir: kendine yönlenmez (zincir yok)', async (hedef) => {
    const harita = await haritaKur(true)
    expect(esle(harita, hedef).sonuc).toBeNull()
  })

  it('EN adres TR adıyla değişmez: kanonik EN slug eski şemadan da TR yeni adına gitmez', async () => {
    const harita = await haritaKur(true)
    for (const s of SATIRLAR) {
      const { sonuc } = esle(harita, `/en/category/${s.en}`, 'en')
      expect(sonuc?.hedef ?? '', `${s.en} EN adresi TR yeni adına yönlendi`).not.toContain(s.yeni)
    }
  })

  it('AYIRT EDİCİLİK: takma ad satırı yazılmazsa eski adres çözülmez (404 olurdu) — migration guard 3 bu yüzden durur', async () => {
    const harita = await haritaKur(false)
    for (const s of SATIRLAR) {
      expect(esle(harita, `/tr/category/${s.eski}`).sonuc, s.eski).toBeNull()
    }
  })

  it('AYIRT EDİCİLİK: yalnız bir kategorinin takma adı eksikse yalnız o eski adres çözülmez, kalanlar durur', async () => {
    const tablolar = migrasyonSonrasiTablolar(true)
    const eksik = SATIRLAR[3] // water-coil-duct-heaters
    const kalan = (tablolar.url_takma_adlari as Array<{ tur: string; eski_slug: string }>).filter(
      (t) => !(t.tur === 'kategori' && t.eski_slug === eksik.eski),
    )
    const { istemci } = sahteDb({ tablolar: { ...tablolar, url_takma_adlari: kalan } })
    const harita = await eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
    expect(esle(harita, `/tr/category/${eksik.eski}`).sonuc).toBeNull()
    for (const s of SATIRLAR.filter((x) => x !== eksik)) {
      expect(esle(harita, `/tr/category/${s.eski}`).sonuc, s.eski).toEqual({ hedef: s.hedef, durum: 308 })
    }
  })
})
