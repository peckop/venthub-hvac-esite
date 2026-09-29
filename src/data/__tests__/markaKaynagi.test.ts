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
 *  (d) yönlendirme tablosu: 3 eski slug × 2 dil var, hedefler listede/kategoride çözülür, tek hop
 *  (e) istisna yok: fikstürde ürünü 0 olan (ürünü görünmeyen) marka listede olamaz
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
const ESKI_SLUGLAR = ['frekans-konvertoru', 'flexiva', 'casals'] as const
const listeSluglari = () => HVAC_BRANDS.map((b) => b.slug)

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

  it('(e) ürünü görünmeyen marka listede olamaz (istisna yok)', () => {
    const urunsuz = listeSluglari().filter((s) => (DB_MARKALARI[s]?.aktifUrun ?? 0) <= 0)
    expect(urunsuz, 'ürünsüz marka sayfası "henüz katalogda değil" gösterir').toEqual([])
  })

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
      vi.doMock('../../lib/services/category.service', () => ({ getCategories: async () => [] }))
      vi.doMock('../../lib/services/family.service', () => ({ getAllFamilySlugs: async () => [] }))
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
  it('yönlendirme tablosu tam olarak 3 eski slug\'ı taşır ve hiçbiri listede değil (çakışma = sayfa erişilmez)', () => {
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
