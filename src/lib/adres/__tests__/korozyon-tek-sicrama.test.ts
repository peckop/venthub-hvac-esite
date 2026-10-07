// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import type { AdresDili } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import { eskiAdresHaritasiUret } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { FIKSTUR_TABLOLARI, sahteDb, type SahteTablolar, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * REC-300 Faz 1-B — KOROZYON DALI ESKİ TR VE EN ADRESİ: TEK SIÇRAMA 308.
 *
 * Migration (supabase/migrations/20261005100000_…, adım 3, karar 287 = B, Recep, OPS-74) korozyon dalının
 * TR slug'ını `asit-dayanikli-fanlar` → `korozyona-ve-aside-dayanimli-fanlar`, kanonik EN slug'ını
 * `acid-resistant-fans` → `corrosion-and-acid-resistant-fans` yapar (EN de değişir: Recep, "madem türkçe
 * değişiyor", OPS aktardı 2026-10-05). Faz 1-A tetiği iki eski adresi de `url_takma_adlari`'na yazar
 * (tur=kategori, dil=tr ve dil=en). Bu test migration SONRASI durumu fikstür DB'ye uygular (kategori satırında
 * TR + EN slug + iki takma ad satırı),
 * haritayı ÜRETİCİYLE kurar ve eşleyicinin eski adresten yeni adrese TEK adımda gittiğini ölçer.
 *
 * ÖLÇMEDİĞİ: canlı DB'de tetiğin gerçekten ateşlendiği (migration adım 3'teki RAISE kapısı bunu uygulama
 * anında ölçer) ve Vercel'de middleware'in bu haritayı yayına aldığı (harita yayını ayrı iş: haritaUret).
 */
const KOROZYON_ID = '00000000-0000-4000-8000-0000000000c3'
const tohum = tohumDogrula(tohumHam)

function migrasyonSonrasiTablolar(takmaAdYaz: boolean, enTakmaAdYaz: boolean = takmaAdYaz): SahteTablolar {
  const kategoriler = FIKSTUR_TABLOLARI.categories.map((k) =>
    k.id === KOROZYON_ID
      ? {
          ...k,
          slug: 'corrosion-and-acid-resistant-fans',
          metadata: { slug: { tr: 'korozyona-ve-aside-dayanimli-fanlar', en: 'corrosion-and-acid-resistant-fans' } },
        }
      : k,
  )
  const takma = [
    ...FIKSTUR_TABLOLARI.url_takma_adlari,
    ...(takmaAdYaz
      ? [{ tur: 'kategori', dil: 'tr', eski_slug: 'asit-dayanikli-fanlar', hedef_id: KOROZYON_ID, tenant_id: VARSAYILAN_KIRACI }]
      : []),
    ...(enTakmaAdYaz
      ? [{ tur: 'kategori', dil: 'en', eski_slug: 'acid-resistant-fans', hedef_id: KOROZYON_ID, tenant_id: VARSAYILAN_KIRACI }]
      : []),
  ]
  return { ...FIKSTUR_TABLOLARI, categories: kategoriler, url_takma_adlari: takma }
}

async function haritaKur(takmaAdYaz: boolean, enTakmaAdYaz: boolean = takmaAdYaz) {
  const { istemci } = sahteDb({ tablolar: migrasyonSonrasiTablolar(takmaAdYaz, enTakmaAdYaz) })
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
    ['/en/category/asit-dayanikli-fanlar', '/en/category/fans/corrosion-and-acid-resistant-fans'], // EN önekinde TR slug: dile uygun yeni adres
    // EN eski adres (kanonik EN slug da değişti): tek seviyeli ve iki seviyeli eski şema, yeni önek + eski slug.
    ['/en/category/acid-resistant-fans', '/en/category/fans/corrosion-and-acid-resistant-fans'],
    ['/en/category/fans/acid-resistant-fans', '/en/category/fans/corrosion-and-acid-resistant-fans'],
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
    expect(esle(harita, '/en/category/fans/corrosion-and-acid-resistant-fans').sonuc).toBeNull()
  })

  it('yeni EN slug (corrosion-and-acid-resistant-fans) de eski şemadan tek hop çözülür', async () => {
    const harita = await haritaKur(true)
    expect(esle(harita, '/en/category/corrosion-and-acid-resistant-fans', 'en').sonuc).toEqual({
      hedef: '/en/category/fans/corrosion-and-acid-resistant-fans',
      durum: 308,
    })
  })

  it('dilsiz eski EN slug (acid-resistant-fans): dil tespiti gerekmeden tek 308 DEĞİLSE bile sonuç yeni EN adrese gider', async () => {
    const harita = await haritaKur(true)
    const { sonuc } = esle(harita, '/category/acid-resistant-fans', 'en')
    expect(sonuc).toEqual({ hedef: '/en/category/fans/corrosion-and-acid-resistant-fans', durum: expect.any(Number) })
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

  it('AYIRT EDİCİLİK (EN): yalnız EN takma ad yazılmazsa eski EN adres çözülmez, TR adres çözülmeye devam eder', async () => {
    const harita = await haritaKur(true, false)
    // İki seviyeli eski EN adres: takma ad yoksa eşleyici ebeveyne (fans) düşer, korozyon dalına GİTMEZ.
    expect(esle(harita, '/en/category/fans/acid-resistant-fans').sonuc?.hedef).not.toBe(
      '/en/category/fans/corrosion-and-acid-resistant-fans',
    )
    expect(esle(harita, '/en/category/acid-resistant-fans').sonuc).toBeNull()
    expect(esle(harita, '/tr/category/asit-dayanikli-fanlar').sonuc).toEqual({
      hedef: '/tr/kategori/fanlar/korozyona-ve-aside-dayanimli-fanlar',
      durum: 308,
    })
  })
})
