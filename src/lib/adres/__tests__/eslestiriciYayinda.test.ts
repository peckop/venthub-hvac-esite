/**
 * INV-YAYINDA-MODEL-5 — eski adres eşleyicisi (middleware) ile yayındaki model listesi (URN-31).
 *
 *  - Liste İÇİ SKU'nun eski `?sku=` adresi → MODELİN adresine 308.
 *  - Liste DIŞI SKU'nun eski `?sku=` adresi → AİLE adresine 308, SORGUSUZ (middleware `url.pathname = hedef`
 *    atar; hedefte `?` olursa `%3F` olurdu — middleware.ts: `url.search = ''`).
 *  - Kanonik aile adresi + liste dışı `?sku=` kendine yönlenmez (null): model seçimi düşmesin, döngü olmasın.
 *  - Boş liste (fail-closed): hiçbir `?sku=` model adresine gitmez.
 * Adres biçiminden bağımsız: beklenen adresler `adresUret`'ten.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { yayindaListesiAyarla } from '@/config/__tests__/yayindaTestKiti'

vi.mock('@/config/yayindaModeller', async () => (await import('@/config/__tests__/yayindaTestKiti')).sahteYayindaModulu())

import { type AdresDili, adresUret } from '@/utils/adresUret'
import { modelAdresiCoz } from '@/utils/modelAdresBicimi'

import { eskiAdresEsle } from '../eslestirici'
import { fiksturHaritasi } from './fikstur'

const h = fiksturHaritasi()
const LISTEDE = 'SEA-61143003'
const LISTE_DISI = 'VRT-CA-IL-4020-ES-RECT'
const aileOf = (sku: string) => h.aileler[h.modeller[sku].aile]

const esle = (yol: string, sku: string | null, dil: AdresDili = 'tr') => eskiAdresEsle(h, { yol, sku, dilTespit: () => dil })
const modelAdresi = (sku: string, dil: AdresDili) => adresUret({ tur: 'model', aileSlug: aileOf(sku), sku }, dil, true)
const aileAdresi = (sku: string, dil: AdresDili) => adresUret({ tur: 'aile', slug: aileOf(sku) }, dil, true)
const modelSayfasiMi = (adres: string) => modelAdresiCoz(adres.split('/').pop() ?? '') !== null

beforeEach(() => yayindaListesiAyarla({ modeller: { [aileOf(LISTEDE)]: [LISTEDE] } }))

describe('ön koşul (duyarlılık)', () => {
  it('iki SKU farklı ailelerde ve liste içi için model adresi üretilir, liste dışı için üretilmez', () => {
    expect(aileOf(LISTEDE)).not.toBe(aileOf(LISTE_DISI))
    expect(modelSayfasiMi(modelAdresi(LISTEDE, 'tr'))).toBe(true)
    expect(modelSayfasiMi(modelAdresi(LISTE_DISI, 'tr'))).toBe(false)
  })
})

describe('liste İÇİ SKU → model adresine 308', () => {
  it.each([
    ['/tr/products/', 'tr'],
    ['/en/products/', 'en'],
  ] as const)('%s<aile>?sku= (harf duyarsız, %s)', (onek, dil) => {
    const yol = `${onek}${aileOf(LISTEDE)}`
    expect(esle(yol, LISTEDE.toLowerCase(), dil)).toEqual({ hedef: modelAdresi(LISTEDE, dil), durum: 308 })
    expect(esle(yol, LISTEDE, dil)?.hedef).toBe(modelAdresi(LISTEDE, dil))
  })

  it('yeni önekli aile adresi + ?sku= de modele gider (tr)', () => {
    expect(esle(`/tr/urun/${aileOf(LISTEDE)}`, LISTEDE)).toEqual({ hedef: modelAdresi(LISTEDE, 'tr'), durum: 308 })
  })

  it('eski SKU takma adı bugünkü modele çözülür', () => {
    expect(esle(`/tr/products/${aileOf(LISTEDE)}`, 'SEA-ESKI-61143003')?.hedef).toBe(modelAdresi(LISTEDE, 'tr'))
  })

  it('dilsiz eski adres: dil tespiti ile TEK 307, hedef model adresi', () => {
    expect(esle(`/products/${aileOf(LISTEDE)}`, LISTEDE, 'en')).toEqual({ hedef: modelAdresi(LISTEDE, 'en'), durum: 307 })
  })
})

describe('liste DIŞI SKU → aile adresi, SORGUSUZ', () => {
  it.each(['tr', 'en'] as const)('eski ?sku= adresi (%s)', (dil) => {
    const onek = dil === 'tr' ? '/tr/products/' : '/en/products/'
    const sonuc = esle(`${onek}${aileOf(LISTE_DISI)}`, LISTE_DISI, dil)
    // EN'de kanonik aile adresi eski önekle aynı → kendine yönlenmez (null); TR'de yeni önekli aile adresine 308.
    if (dil === 'tr') expect(sonuc).toEqual({ hedef: aileAdresi(LISTE_DISI, 'tr'), durum: 308 })
    else expect(sonuc).toBeNull()
  })

  it('hiçbir hedefte ? ya da %3F yok (middleware pathname tuzağı)', () => {
    for (const sku of [LISTEDE, LISTE_DISI, 'YOK-1', 'sea-61143003', ' SEA-61143003 ']) {
      for (const yol of [`/tr/products/${aileOf(LISTEDE)}`, `/en/products/${aileOf(LISTE_DISI)}`, `/products/${aileOf(LISTE_DISI)}`]) {
        const sonuc = esle(yol, sku, 'en')
        if (sonuc) {
          expect(sonuc.hedef).not.toContain('?')
          expect(sonuc.hedef).not.toContain('%3F')
        }
      }
    }
  })

  it('kanonik aile adresi + liste dışı ?sku= kendine yönlenmez (null)', () => {
    expect(esle(`/tr/urun/${aileOf(LISTE_DISI)}`, LISTE_DISI)).toBeNull()
    expect(esle(`/en/products/${aileOf(LISTE_DISI)}`, LISTE_DISI, 'en')).toBeNull()
  })

  it('bilinmeyen SKU yok sayılır: yol kendi başına çözülür', () => {
    expect(esle(`/tr/products/${aileOf(LISTEDE)}`, 'YOK-1')?.hedef).toBe(aileAdresi(LISTEDE, 'tr'))
  })
})

describe('eski ürün slug\'ı', () => {
  it('liste dışı SKU\'nun eski ürün slug\'ı → aile adresi (model sayfası yok)', () => {
    const sonuc = esle('/tr/products/vortice-ca-il-4020-es-rect-16076', null)
    expect(sonuc?.durum).toBe(308)
    expect(sonuc && modelSayfasiMi(sonuc.hedef)).toBe(false)
    expect(sonuc?.hedef).not.toContain('?')
  })

  it('liste içi SKU\'nun eski ürün slug\'ı → model adresi', () => {
    yayindaListesiAyarla({ modeller: { [aileOf(LISTE_DISI)]: [LISTE_DISI] } })
    expect(esle('/tr/products/vortice-ca-il-4020-es-rect-16076', null)?.hedef).toBe(modelAdresi(LISTE_DISI, 'tr'))
  })
})

describe('FAIL-CLOSED: boş liste', () => {
  it('hiçbir eski adres model adresine gitmez; hedefler sorgusuz', () => {
    yayindaListesiAyarla({})
    for (const dil of ['tr', 'en'] as const) {
      const sonuc = esle(`/${dil}/products/${aileOf(LISTEDE)}`, LISTEDE, dil)
      if (sonuc) {
        expect(modelSayfasiMi(sonuc.hedef)).toBe(false)
        expect(sonuc.hedef).not.toContain('?')
      }
    }
  })
})
