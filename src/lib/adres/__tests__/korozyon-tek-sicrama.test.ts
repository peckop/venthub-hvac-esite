// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import type { AdresDili } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import { eskiAdresHaritasiUret } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { FIKSTUR_TABLOLARI, sahteDb, type SahteTablolar, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * REC-300 Faz 1-B — KOROZYON DALI ESKİ TR ADRESİ: TEK SIÇRAMA 308.
 *
 * Migration (supabase/migrations/20261005100000_…, adım 3, karar 287 = B, Recep, OPS-74) korozyon dalının
 * TR slug'ını `asit-dayanikli-fanlar` → `korozyona-ve-aside-dayanimli-fanlar` yapar; kanonik EN slug
 * (`acid-resistant-fans`) sabit kalır. Faz 1-A tetiği eski TR adresi `url_takma_adlari`'na (tur=kategori, dil=tr) yazar. Bu test migration
 * SONRASI durumu fikstür DB'ye uygular (aynı iki değişiklik: kategori satırında TR slug + takma ad satırı),
 * haritayı ÜRETİCİYLE kurar ve eşleyicinin eski adresten yeni adrese TEK adımda gittiğini ölçer.
 *
 * ÖLÇMEDİĞİ: canlı DB'de tetiğin gerçekten ateşlendiği (migration adım 3'teki RAISE kapısı bunu uygulama
 * anında ölçer) ve Vercel'de middleware'in bu haritayı yayına aldığı (harita yayını ayrı iş: haritaUret).
 */
const KOROZYON_ID = '00000000-0000-4000-8000-0000000000c3'
const tohum = tohumDogrula(tohumHam)

function migrasyonSonrasiTablolar(takmaAdYaz: boolean): SahteTablolar {
  const kategoriler = FIKSTUR_TABLOLARI.categories.map((k) =>
    k.id === KOROZYON_ID
      ? { ...k, metadata: { slug: { tr: 'korozyona-ve-aside-dayanimli-fanlar', en: 'acid-resistant-fans' } } }
      : k,
  )
  const takma = takmaAdYaz
    ? [
        ...FIKSTUR_TABLOLARI.url_takma_adlari,
        { tur: 'kategori', dil: 'tr', eski_slug: 'asit-dayanikli-fanlar', hedef_id: KOROZYON_ID, tenant_id: VARSAYILAN_KIRACI },
      ]
    : FIKSTUR_TABLOLARI.url_takma_adlari
  return { ...FIKSTUR_TABLOLARI, categories: kategoriler, url_takma_adlari: takma }
}

async function haritaKur(takmaAdYaz: boolean) {
  const { istemci } = sahteDb({ tablolar: migrasyonSonrasiTablolar(takmaAdYaz) })
  return eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
}

function esle(harita: Awaited<ReturnType<typeof haritaKur>>, yol: string, dil: AdresDili = 'tr') {
  const dilTespit = vi.fn(() => dil)
  return { sonuc: eskiAdresEsle(harita, { yol, sku: null, dilTespit }), dilTespit }
}

describe('korozyon dalı: eski TR adres → yeni TR adres, TEK 308', () => {
  it.each([
    ['/tr/category/asit-dayanikli-fanlar', '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar'], // tek seviyeli eski adres
    ['/tr/category/fanlar/asit-dayanikli-fanlar', '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar'], // iki seviyeli eski adres
    ['/tr/kategori/fanlar/asit-dayanikli-fanlar', '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar'], // yeni önek, eski slug
    ['/en/category/asit-dayanikli-fanlar', '/en/category/fans/acid-resistant-fans'], // EN önekinde TR slug: dile uygun yeni adres
  ])('%s → %s', async (yol, hedef) => {
    const harita = await haritaKur(true)
    const { sonuc, dilTespit } = esle(harita, yol)
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled() // dil önekli: tek hop, dil tespiti yok
  })

  it('dilsiz eski TR adres: Türkçe slug olduğu için dil tespiti OLMADAN tek 308 (307 değil)', async () => {
    const harita = await haritaKur(true)
    const { sonuc, dilTespit } = esle(harita, '/category/asit-dayanikli-fanlar', 'en')
    expect(sonuc).toEqual({ hedef: '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar', durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('hedef kanoniktir: yeni adres kendine yönlenmez (zincir yok, ikinci sıçrama yok)', async () => {
    const harita = await haritaKur(true)
    expect(esle(harita, '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar').sonuc).toBeNull()
    expect(esle(harita, '/en/category/fans/acid-resistant-fans').sonuc).toBeNull()
  })

  it('yeni TR slug (korozyona-ve-aside-dayanimli-fanlar) de eski şemadan tek hop çözülür', async () => {
    const harita = await haritaKur(true)
    expect(esle(harita, '/tr/category/korozyona-ve-aside-dayanimli-fanlar').sonuc).toEqual({
      hedef: '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar',
      durum: 308,
    })
  })

  it('AYIRT EDİCİLİK: takma ad satırı yazılmazsa eski adres çözülmez (404 olurdu) — migration adım 3 bu yüzden RAISE eder', async () => {
    const harita = await haritaKur(false)
    expect(esle(harita, '/tr/category/asit-dayanikli-fanlar').sonuc).toBeNull()
  })
})
