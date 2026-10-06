// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import tohumHam from '@/data/eski-adres-tohum.json'
import type { AdresDili } from '@/utils/adresUret'

import { eskiAdresEsle } from '../eslestirici'
import { eskiAdresHaritasiUret } from '../haritaUret'
import { tohumDogrula } from '../tohum'
import { FIKSTUR_TABLOLARI, sahteDb, type SahteTablolar, VARSAYILAN_KIRACI } from './sahteDb'

/**
 * REC-300 Faz 1-B — 40 AİLE SLUG'I: ESKİ ADRES → 11 EKİM ŞEMASINDA TEK SIÇRAMA, ZİNCİR YOK.
 *
 * Soru (Recep itirazı, OPS 2026-10-05): migration eski aile adreslerini `url_takma_adlari`'na yazar (eski → BUGÜNKÜ yeni
 * adres). 11 Ekim'de adres şeması değişince TR adresler `/tr/urun/<aile>` olur. Eski adres iki sıçrama mı yapar
 * (eski → bugünkü yeni → 11 Ekim adresi)?
 *
 * ÖLÇÜM: harita üreticisi takma ad satırını "eski slug → aile KİMLİĞİ" olarak okur; son adres eşleyicide
 * `adresUret(aile, dil, true)` ile kurulur (şemanın TEK kaynağı) → eski slug'ın hangi ara adresten geçtiği harita
 * dışında hiçbir yerde yoktur. Bu dosya o hükmü, migration SONRASI durumu fikstür DB'ye uygulayarak ölçer: eski aile
 * slug'ı, tohum (Lineo çap aileleri) ve eski varyant adresleri TEK adımda son adrese gider.
 *
 * ÖLÇMEDİĞİ: canlı DB'de tetiğin ateşlendiği (migration adım 7-8 RAISE kapıları uygulama anında ölçer) ve haritanın
 * Vercel'de yayına alındığı (harita yayını ayrı iş: ALT-13 / haritaUret).
 */
const tohum = tohumDogrula(tohumHam)

const AILE = {
  lineo: { id: '00000000-0000-4000-8000-0000000000f2', eski: 'vortice-lineo-quiet', yeni: 'vortice-lineo-quiet-sessiz-kanal-fanlari' },
  dd: { id: '00000000-0000-4000-8000-0000000000f3', eski: 'nicotra-gebhardt-dd', yeni: 'nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar' },
  rect: {
    id: '00000000-0000-4000-8000-0000000000f4',
    eski: 'vortice-vort-commercial-in-line-rectangular',
    yeni: 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari',
  },
} as const

function migrasyonSonrasiTablolar(takmaAdYaz: boolean): SahteTablolar {
  const yeniler = new Map<string, string>(Object.values(AILE).map((a) => [a.id, a.yeni]))
  const aileler = FIKSTUR_TABLOLARI.product_families.map((f) => (yeniler.has(String(f.id)) ? { ...f, slug: yeniler.get(String(f.id)) } : f))
  const takma = takmaAdYaz
    ? [
        ...FIKSTUR_TABLOLARI.url_takma_adlari,
        ...Object.values(AILE).map((a) => ({
          tur: 'aile',
          dil: '*',
          eski_slug: a.eski,
          hedef_id: a.id,
          tenant_id: VARSAYILAN_KIRACI,
        })),
      ]
    : FIKSTUR_TABLOLARI.url_takma_adlari
  return { ...FIKSTUR_TABLOLARI, product_families: aileler, url_takma_adlari: takma }
}

async function haritaKur(takmaAdYaz: boolean) {
  const { istemci } = sahteDb({ tablolar: migrasyonSonrasiTablolar(takmaAdYaz) })
  return eskiAdresHaritasiUret(istemci, { kiraciId: VARSAYILAN_KIRACI, tohum, oncekiUrunSayisi: null })
}

function esle(harita: Awaited<ReturnType<typeof haritaKur>>, yol: string, dil: AdresDili = 'tr') {
  const dilTespit = vi.fn(() => dil)
  return { sonuc: eskiAdresEsle(harita, { yol, sku: null, dilTespit }), dilTespit }
}

describe('40 aile slug değişimi: eski adres → 11 Ekim adresi, TEK 308 (zincir yok)', () => {
  it.each([
    ['/tr/products/vortice-lineo-quiet', `/tr/urun/${AILE.lineo.yeni}`],
    ['/en/products/vortice-lineo-quiet', `/en/products/${AILE.lineo.yeni}`],
    ['/tr/products/nicotra-gebhardt-dd', `/tr/urun/${AILE.dd.yeni}`],
    ['/tr/products/vortice-vort-commercial-in-line-rectangular', `/tr/urun/${AILE.rect.yeni}`],
    // Bugünkü ara adres (migration sonrası, 11 Ekim ÖNCESİ): yeni slug'la eski şema yolu da tek hop
    [`/tr/products/${AILE.lineo.yeni}`, `/tr/urun/${AILE.lineo.yeni}`],
    // Tohum: Lineo çap aileleri (T162) eski adresi; tohum hedefi artık YENİ slug (URN-53), tek hop
    ['/tr/products/vortice-lineo-100-quiet', `/tr/urun/${AILE.lineo.yeni}`],
    ['/en/products/vortice-lineo-315-quiet', `/en/products/${AILE.lineo.yeni}`],
  ])('%s → %s', async (yol, hedef) => {
    const harita = await haritaKur(true)
    const { sonuc, dilTespit } = esle(harita, yol, yol.startsWith('/en') ? 'en' : 'tr')
    expect(sonuc).toEqual({ hedef, durum: 308 })
    expect(dilTespit).not.toHaveBeenCalled()
  })

  it('hedef kanoniktir: 11 Ekim adresi kendine yönlenmez (ikinci sıçrama yok)', async () => {
    const harita = await haritaKur(true)
    expect(esle(harita, `/tr/urun/${AILE.lineo.yeni}`).sonuc).toBeNull()
    expect(esle(harita, `/en/products/${AILE.lineo.yeni}`, 'en').sonuc).toBeNull()
  })

  it('AYIRT EDİCİLİK: aile takma adı yazılmazsa eski slug çözülmez (migration adım 8 bu yüzden RAISE eder)', async () => {
    const harita = await haritaKur(false)
    expect(esle(harita, '/tr/products/vortice-lineo-quiet').sonuc).toBeNull()
    expect(esle(harita, '/tr/products/nicotra-gebhardt-dd').sonuc).toBeNull()
    // Karşı yön (kanıt, kapının "her şey null" diye yeşil kalmadığı): takma adla aynı adresler çözülür.
    const takmali = await haritaKur(true)
    expect(esle(takmali, '/tr/products/vortice-lineo-quiet').sonuc).toEqual({ hedef: `/tr/urun/${AILE.lineo.yeni}`, durum: 308 })
  })

  it('URN-53: tohum Lineo çap hedefi YENİ slug; takma ad yazılmasa da çap adresi tek hop (zincir kalmaz)', async () => {
    const harita = await haritaKur(false)
    expect(esle(harita, '/tr/products/vortice-lineo-100-quiet').sonuc).toEqual({ hedef: `/tr/urun/${AILE.lineo.yeni}`, durum: 308 })
  })
})
