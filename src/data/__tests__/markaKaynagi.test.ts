/**
 * INV-MARKA-KAYNAK-1 — vitrindeki marka listesi DB'deki ürünlü markalarla aynı kalır (REC-374).
 *
 * NİÇİN (2026-09-27 ölçümü): statik `HVAC_BRANDS` altı marka yayınlıyordu, DB'de ürünü olan beş
 * markanın ikisi (seat, danfoss) listede YOKTU; listedekilerin üçü ürünsüzdü: `casals` (0 ürün,
 * canlıda "Bu markanın ürünleri henüz katalogda değil"), `flexiva` (DB'de yok), `frekans-konvertoru`
 * (marka değil, ürün türü). Liste koda gömülü, ürünler DB'de — iki kaynak arasında hiçbir kapı yoktu.
 *
 * ÖLÇÜT KAYNAĞI: `markaDbFiksturu.ts` (tarihli DB ölçümü). Bu test ağa çıkmaz; fikstürün tazeliği
 * fikstür dosyasının başlığındaki sorguyla yeniden ölçülür.
 *
 *  (a) statik slug kümesi ⊆ DB marka fikstürü
 *  (b) fikstürde aktif ürünü > 0 olan her marka statik listede
 *  (c) site haritası marka URL kümesi = liste × yayındaki diller
 *  (d) yönlendirme tablosu: kalan eski slug × 2 dil var, hedefler listede/kategoride çözülür, tek hop
 *      (OPS-51: casals ve flexiva listeye döndü → 308'leri KALKTI; yalnız frekans-konvertoru kaldı)
 *  (e) ürünsüz marka listede olmaz — TEK, KAPALI, AÇIKÇA İŞARETLİ istisna: `yakinda: true` taşıyan ve
 *      `YAKINDA_ISTISNALARI` listesindeki marka (şu an yalnız flexiva, karar 265). Genel gevşeme YOK:
 *      işaretsiz ürünsüz marka, istisna listesinde olmayan işaretli marka, ürünü olduğu hâlde hâlâ işaretli
 *      marka ve işareti silinmiş flexiva KIRMIZI verir (aşağıdaki "sabotaj" bloğu yüklemi sentetik girdiyle ölçer).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { SITE_URL } from '@/config/siteUrl'
import { eskiAdresEsle } from '@/lib/adres/eslestirici'
import { adresUret } from '@/utils/adresUret'
import { localizedHref, Routes } from '@/utils/routes'

import { k3bOku, KALDIRILAN_MARKALAR, markaHedefi, markaYonlendirmeleri } from '../../config/markaYonlendirmeleri.mjs'
import { fiksturHaritasi } from '../../lib/adres/__tests__/fikstur'
import { HVAC_BRANDS } from '../brands'
import { DB_KATEGORILERI, DB_MARKALARI, MARKA_OLCUM_TARIHI } from './markaDbFiksturu'

const KOK = process.cwd()
const DILLER = ['tr', 'en'] as const
const ESKI_SLUGLAR = ['frekans-konvertoru'] as const
const listeSluglari = () => HVAC_BRANDS.map((b) => b.slug)

/**
 * KAPALI İSTİSNA LİSTESİ (karar 265): ürünü olmadan listede durabilen markalar. Yeni marka eklemek bu listeyi
 * DEĞİŞTİRMEKTİR — yani kapının kendisinde görünür bir diff ve bilinçli karar ister; `brands.ts`'e `yakinda`
 * yazmak TEK BAŞINA yetmez.
 */
const YAKINDA_ISTISNALARI: readonly string[] = ['flexiva']

interface MarkaKaydiOzeti {
  slug: string
  yakinda?: true
}

/**
 * (e) yüklemi: `liste` markalarını DB ölçümüne (`db`) karşı süzer, ihlalleri açıklamalı döner.
 *  1. ürünsüz (aktif ürün ≤ 0, fikstürde de yok sayılır) marka `yakinda` işaretli DEĞİLSE ihlal;
 *  2. `yakinda` işaretli marka istisna listesinde DEĞİLSE ihlal;
 *  3. `yakinda` işaretli marka DB'de aktif ürün kazandıysa ihlal (işaret ürünle birlikte kalkmalı).
 */
export function urunsuzMarkaIhlalleri(
  liste: readonly MarkaKaydiOzeti[],
  db: Readonly<Record<string, { aktifUrun: number }>>,
  istisnalar: readonly string[],
): string[] {
  const ihlal: string[] = []
  for (const m of liste) {
    const aktif = db[m.slug]?.aktifUrun ?? 0
    if (aktif <= 0 && !m.yakinda) ihlal.push(`${m.slug}: ürünsüz marka işaretsiz listede ("henüz katalogda değil" sayfası)`)
    if (m.yakinda && !istisnalar.includes(m.slug)) ihlal.push(`${m.slug}: yakinda işareti istisna listesinde yok`)
    if (m.yakinda && aktif > 0) ihlal.push(`${m.slug}: DB'de ${aktif} aktif ürünü var ama hâlâ yakinda işaretli`)
  }
  return ihlal
}

describe('INV-MARKA-KAYNAK-1: marka listesi = DB\'de ürünü olan markalar', () => {
  it('fikstür tarihli ve boş değil (ölçüt körelmesin)', () => {
    expect(MARKA_OLCUM_TARIHI).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Object.keys(DB_MARKALARI).length).toBeGreaterThan(0)
    expect(HVAC_BRANDS.length).toBeGreaterThan(0)
  })

  it('(a) statik listedeki her slug DB\'de marka olarak var', () => {
    const dbdeYok = listeSluglari().filter((s) => !(s in DB_MARKALARI))
    expect(dbdeYok, `DB'de olmayan marka yayınlanıyor (fikstür ${MARKA_OLCUM_TARIHI})`).toEqual([])
  })

  it('(b) DB\'de aktif ürünü olan her marka statik listede', () => {
    const liste = new Set(listeSluglari())
    const eksik = Object.entries(DB_MARKALARI)
      .filter(([, m]) => m.aktifUrun > 0)
      .map(([s]) => s)
      .filter((s) => !liste.has(s))
    expect(eksik, 'ürünü olan marka vitrinde yok').toEqual([])
  })

  it('(e) ürünsüz marka listede olamaz — yalnız açıkça işaretli, kapalı listedeki marka (flexiva) istisnadır', () => {
    expect(urunsuzMarkaIhlalleri(HVAC_BRANDS, DB_MARKALARI, YAKINDA_ISTISNALARI)).toEqual([])
  })

  it('(e) `yakinda` işaretli markalar kümesi istisna listesiyle BİREBİR aynı (flexiva işareti silinirse/yenisi eklenirse kırmızı)', () => {
    const isaretliler = HVAC_BRANDS.filter((b) => b.yakinda).map((b) => b.slug).sort()
    expect(isaretliler).toEqual([...YAKINDA_ISTISNALARI].sort())
    // Ölçüt körelmesin: istisna gerçekten DB'de ürünsüz bir marka için var.
    for (const s of YAKINDA_ISTISNALARI) expect(DB_MARKALARI[s]?.aktifUrun, `${s} DB fikstüründe ürünsüz olmalı`).toBe(0)
  })

  it('casals ve flexiva listede, eski 308 tablosunda DEĞİL (OPS-51)', () => {
    const liste = new Set(listeSluglari())
    for (const s of ['casals', 'flexiva']) {
      expect(liste.has(s), `${s} listede yok`).toBe(true)
      expect(Object.keys(KALDIRILAN_MARKALAR), `${s} hem listede hem 308 kaynağı: sayfa erişilmez`).not.toContain(s)
    }
    expect(DB_MARKALARI.casals?.aktifUrun).toBe(53)
    expect(DB_MARKALARI.avens?.aktifUrun).toBe(53)
  })
})

describe('INV-MARKA-KAYNAK-1 (e) sabotaj: yüklem gevşemeden ayırt eder', () => {
  const db = { flexiva: { aktifUrun: 0 }, avens: { aktifUrun: 53 }, yenimarka: { aktifUrun: 0 } }
  const ist = ['flexiva']

  it('temiz durum: flexiva işaretli + ürünsüz, diğerleri ürünlü → ihlal yok', () => {
    expect(urunsuzMarkaIhlalleri([{ slug: 'flexiva', yakinda: true }, { slug: 'avens' }], db, ist)).toEqual([])
  })

  it('istisnasız ürünsüz marka eklenince KIRMIZI', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva', yakinda: true }, { slug: 'yenimarka' }], db, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/^yenimarka: ürünsüz marka işaretsiz/)
  })

  it('flexiva istisnası (yakinda işareti) silinince KIRMIZI', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva' }], db, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/^flexiva: ürünsüz marka işaretsiz/)
  })

  it('işaretli ama istisna listesinde olmayan marka KIRMIZI (yalnız `yakinda` yazmak yetmez)', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'yenimarka', yakinda: true }], db, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/istisna listesinde yok/)
  })

  it('flexiva DB\'de ürün kazanıp hâlâ işaretliyse KIRMIZI (işaret ürünle birlikte kalkmalı)', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva', yakinda: true }], { flexiva: { aktifUrun: 4 } }, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/hâlâ yakinda işaretli/)
  })

  it('fikstürde HİÇ olmayan marka ürünsüz sayılır (DB\'de yok = ürün yok)', () => {
    expect(urunsuzMarkaIhlalleri([{ slug: 'hayalet' }], {}, ist)).toHaveLength(1)
  })
})

describe('INV-MARKA-KAYNAK-1 (adlar)', () => {
  it('slug\'lar tekil ve adı DB adıyla harf-duyarsız aynı (aile sorgusu `ilike` ile eşler)', () => {
    expect(new Set(listeSluglari()).size).toBe(HVAC_BRANDS.length)
    const farkli = HVAC_BRANDS.filter((b) => DB_MARKALARI[b.slug] && DB_MARKALARI[b.slug].ad.toLowerCase() !== b.name.toLowerCase())
      .map((b) => `${b.slug}: "${b.name}" ≠ DB "${DB_MARKALARI[b.slug].ad}"`)
    expect(farkli).toEqual([])
  })
})

describe('INV-MARKA-KAYNAK-1 (c): site haritası marka kolu listeyi izler', () => {
  afterEach(() => {
    vi.doUnmock('../../config/features')
    vi.doUnmock('../../lib/supabase/static')
    vi.doUnmock('../../lib/services/category.service')
    vi.doUnmock('../../lib/services/family.service')
    vi.resetModules()
  })

  for (const enYayin of [false, true]) {
    it(`EN_YAYIN=${enYayin}: marka URL kümesi = liste × diller`, async () => {
      vi.resetModules()
      vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), EN_YAYIN: enYayin }))
      vi.doMock('../../lib/supabase/static', () => ({
        supabaseStaticClient: { rpc: async () => ({ data: [] }) },
      }))
      // Site haritası boş katalogda ÜRETİLMEZ (INV-SITEMAP-HATA-1): sahte veri tek kategori + tek aile taşır;
      // bu test yalnız MARKA satırlarını ölçer, kategori/aile satırlarını filtre dışı bırakır.
      vi.doMock('../../lib/services/category.service', () => ({
        getCategories: async () => [
          { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
        ],
      }))
      vi.doMock('../../lib/services/family.service', () => ({
        getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
        getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
      }))
      const { default: sitemap } = await import('../../app/sitemap')
      const girisler = await sitemap()
      const markaUrlleri = new Set(girisler.map((g) => g.url).filter((u) => /\/(tr|en)\/brands\//.test(u)))
      const diller = enYayin ? DILLER : (['tr'] as const)
      const beklenen = new Set(diller.flatMap((d) => listeSluglari().map((s) => `${SITE_URL}/${d}${Routes.brand(s)}`)))
      expect([...markaUrlleri].sort()).toEqual([...beklenen].sort())
    })
  }
})

describe('INV-MARKA-KAYNAK-1 (d): listeden çıkan slug\'ların 308 yönlendirmesi', () => {
  it('yönlendirme tablosu tam olarak kalan eski slug\'ları (frekans-konvertoru) taşır ve hiçbiri listede değil (çakışma = sayfa erişilmez)', () => {
    expect(Object.keys(KALDIRILAN_MARKALAR).sort()).toEqual([...ESKI_SLUGLAR].sort())
    const liste = new Set(listeSluglari())
    expect(ESKI_SLUGLAR.filter((s) => liste.has(s))).toEqual([])
  })

  for (const k3b of [false, true]) {
    describe(`ADRES_SEMASI_K3B=${k3b}`, () => {
      const kurallar = markaYonlendirmeleri(k3b)
      const kaynaklar = new Map(kurallar.map((k) => [k.source, k]))

      it('her eski slug × iki dil için kalıcı (308) kural var', () => {
        const eksik: string[] = []
        for (const s of ESKI_SLUGLAR) {
          for (const d of DILLER) {
            const k = kaynaklar.get(`/${d}/brands/${s}`)
            if (!k) eksik.push(`/${d}/brands/${s}`)
            else expect(k.permanent, `${k.source} kalıcı değil`).toBe(true)
          }
        }
        expect(eksik).toEqual([])
      })

      it(k3b ? 'bayrak AÇIK: /tr/markalar/<eski> de aynı hedefe gider' : 'bayrak KAPALI: /tr/markalar kuralı üretilmez (rota 404)', () => {
        for (const s of ESKI_SLUGLAR) {
          const k = kaynaklar.get(`/tr/markalar/${s}`)
          if (k3b) expect(k?.destination).toBe(kaynaklar.get(`/tr/brands/${s}`)?.destination)
          else expect(k).toBeUndefined()
        }
      })

      it('hedefler adresUret/Routes ile aynı ve ölçülmüş kategoriye/listeye çözülür', () => {
        for (const s of ESKI_SLUGLAR) {
          const h = KALDIRILAN_MARKALAR[s]
          for (const d of DILLER) {
            const hedef = markaHedefi(s, d, k3b)
            if (h.tur === 'liste') {
              expect(hedef).toBe(localizedHref(Routes.brands(), d))
            } else {
              expect(hedef).toBe(adresUret({ tur: 'kategori', kok: h.kok[d], dal: h.dal[d] }, d, k3b))
              const dal = DB_KATEGORILERI[h.dal.en]
              const kok = DB_KATEGORILERI[h.kok.en]
              expect(dal, `hedef kategori fikstürde yok: ${h.dal.en}`).toBeDefined()
              expect(dal.aktif && (dal.aktifUrun ?? 0) > 0, 'hedef kategori pasif ya da ürünsüz').toBe(true)
              expect(dal.slug[d]).toBe(h.dal[d])
              expect(dal.ust).toBe(h.kok.en)
              expect(kok?.aktif).toBe(true)
              expect(kok?.slug[d]).toBe(h.kok[d])
            }
          }
        }
      })

      it('tek hop: hiçbir hedef başka bir kuralın kaynağı değil', () => {
        const zincir = kurallar.filter((k) => kaynaklar.has(k.destination)).map((k) => `${k.source} → ${k.destination}`)
        expect(zincir).toEqual([])
      })

      if (k3b) {
        it('3-C eski adres eşleyicisiyle çakışmaz: kaynaklar eşleyiciye düşmez, hedefler kanonik (eşleyici null)', () => {
          // Paylaşılan eşleyici fikstürü `control-systems`'i taşıyor ama dalını taşımıyor (fikstür
          // alt kümedir). Gerçek harita DB'den üretilir; DB'de ölçülen dal (DB_KATEGORILERI) buraya
          // aynı biçimde eklenir — yoksa eşleyici bilinmeyen dalı düşürüp köke yönlendirirdi.
          const h = fiksturHaritasi()
          const kokIndeksi = h.kategoriler.findIndex((k) => k.en === 'control-systems')
          expect(kokIndeksi, 'fikstürde control-systems yok').toBeGreaterThanOrEqual(0)
          const dalOlcum = DB_KATEGORILERI['frequency-converters']
          const dalIndeksi = h.kategoriler.push({ ...dalOlcum.slug, ust: kokIndeksi, aktif: dalOlcum.aktif }) - 1
          h.kategoriSluglari[dalOlcum.slug.en] = { hedef: { kategori: dalIndeksi }, bicim: 'en' }
          h.kategoriSluglari[dalOlcum.slug.tr] = { hedef: { kategori: dalIndeksi }, bicim: 'tr' }
          const esle = (yol: string) => eskiAdresEsle(h, { yol, sku: null, dilTespit: () => 'tr' })
          const cakisan = kurallar.flatMap((k) => [k.source, k.destination]).filter((y) => esle(y) !== null)
          expect(cakisan).toEqual([])
        })
      }
    })
  }

  it('next.config bu listeyi yayındaki bayrakla kullanıyor (kopya kural yok)', () => {
    const features = readFileSync(join(KOK, 'src', 'config', 'features.ts'), 'utf8')
    expect(k3bOku(features)).toBe(ADRES_SEMASI_K3B)
    const nextConfig = readFileSync(join(KOK, 'next.config.mjs'), 'utf8')
    expect(nextConfig).toMatch(/k3bOku\(readFileSync\(new URL\('\.\/src\/config\/features\.ts'/)
    expect(nextConfig).toContain('...markaYonlendirmeleri(ADRES_SEMASI_K3B)')
    for (const s of ESKI_SLUGLAR) expect(nextConfig).not.toContain(`/brands/${s}'`)
  })

  it('k3bOku okuyamadığı biçimde ATAR (sessizce "kapalı" varsaymaz)', () => {
    expect(() => k3bOku('')).toThrow()
    expect(() => k3bOku('export const ADRES_SEMASI_K3B = process.env.X === "1"')).toThrow()
    expect(k3bOku('export const ADRES_SEMASI_K3B = true\n')).toBe(true)
  })
})
