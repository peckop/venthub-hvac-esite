import { describe, expect, it, vi } from 'vitest'

import { HVAC_BRANDS } from '@/data/brands'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { ACIKLAMA_ASGARI, ACIKLAMA_AZAMI, aciklamaKirp } from '@/lib/seo/aciklamaKirp'
import { ovguVarMi } from '@/lib/seo/ovguAyikla'
import type { DomainCategory } from '@/lib/type-converters'

import { kategoriSayfasiUstVerisi } from '../_components/kategoriSayfasi'
import { markaUstVerisi } from '../_components/markaSayfasi'

/**
 * INV-ACIKLAMA-URETEC-1 — kategori ve marka arama açıklaması ŞABLON DEĞİL, kaydın kendi metninden üretilir
 * (REC-497, GEO-SEO 2026-10-02).
 *
 * NİÇİN VAR (canlı kapı, 2026-10-02): 24 kategori sayfası "{ad} kategorisindeki en kaliteli ve ekonomik
 * havalandırma ürünlerini keşfedin" kalıbıyla, 5 marka sayfası "{ad} markasının en kaliteli … avantajlı
 * fiyatları" kalıbıyla bitiyordu. Google "aynı ya da benzer açıklama sayfayı ayırt etmez" der; üstelik
 * "en kaliteli/ekonomik/avantajlı fiyat" sitede doğrulanamayan, satış modu teklif usulü olan bir sitede fiyat
 * vaadi olan iddialardı.
 *
 * BU KAPI NE ÖLÇER: (a) iki farklı kayıt iki farklı açıklama verir (şablon geri gelemez), (b) açıklama
 * kaydın metninden türer, (c) doğrulanamayan övgü kalıbı geri gelemez, (d) uzunluk arama sonucu aralığında,
 * (e) üç sayfa metni (marka dizini, iletişim, ürün seçici) yeterince uzun.
 * ÖLÇMEDİĞİ: Google'ın sonuçta hangi metni gösterdiği (canlı kapı + GSC, yayın sonrası).
 */

vi.mock('@/lib/supabase/static', () => ({
  supabaseStaticClient: {
    from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) }),
    rpc: async () => ({ data: [] }),
  },
}))

const YASAK_OVGU = /en kaliteli|ekonomik|avantajlı|highest quality|most economical|competitive pricing/i

/** Tam tipli fikstür: kategorinin kendi açıklaması `metadata.description_i18n`'de (yoksa alan hiç yazılmaz). */
function kategori(slug: string, trMetin: string | null, enMetin: string | null): DomainCategory {
  return {
    authority_content: null,
    created_at: '2026-09-01T00:00:00.000Z',
    description: '',
    display_mode: null,
    id: `id-${slug}`,
    image_url: null,
    is_active: true,
    is_featured: null,
    level: 0,
    marketing_title: null,
    menu_label: null,
    metadata: {
      slug: { tr: slug, en: slug },
      ...(trMetin || enMetin
        ? { description_i18n: { ...(trMetin ? { tr: trMetin } : {}), ...(enMetin ? { en: enMetin } : {}) } }
        : {}),
    },
    name: slug,
    parent_id: null,
    seo_desc: null,
    seo_title: null,
    slug,
    sort_order: null,
    tenant_id: 'tenant-1',
    translation_key: null,
    updated_at: '2026-09-01T00:00:00.000Z',
  }
}

describe('marka açıklaması', () => {
  for (const lang of ['tr', 'en'] as const) {
    it(`${lang}: her marka kendi kaydından, aralıkta, benzersiz`, () => {
      const aciklamalar = HVAC_BRANDS.map((b) => ({ ad: b.name, d: String(markaUstVerisi(lang, b.slug).description) }))
      for (const { ad, d } of aciklamalar) {
        expect(d.length, `${ad}: ${d}`).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
        expect(d.length, `${ad}: ${d}`).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
        expect(d.toLowerCase(), `${ad} adı geçmeli`).toContain(ad.toLowerCase())
        expect(d, `${ad} övgü kalıbı`).not.toMatch(YASAK_OVGU)
        expect(ovguVarMi(d), `${ad} üstünlük iddiası (üretici sitesinden gelen "lider/en geniş/öncü"): ${d}`).toBe(false)
        expect(d, `${ad}: sözlük anahtarı çözülmeden açıklamaya sızmış`).not.toMatch(/brands\./)
      }
      expect(new Set(aciklamalar.map((a) => a.d)).size, 'iki marka aynı açıklamayı veremez').toBe(HVAC_BRANDS.length)
    })
  }

  // BLG-6 (10-09): marka kayıt metinlerinden üretici öz beyanları (lider/en geniş/öncü) KAYNAĞINDA kalktı; süzgeç
  // (ovguCumleleriniAt) artık veriyi değiştirmiyor, yalnız geri dönüş güvencesi. Bu iki kol kaydın kendi iddiasız
  // metninin açıklamaya olduğu gibi gittiğini ve süzgeç yedeğinin (VentHub kataloğunda…) artık devreye girmediğini kilitler.
  it('tr: kayıt metni iddiasız (Danfoss, Vortice): açıklama kaydın kendi cümlesidir, övgü ve yedek cümle yok', () => {
    const danfoss = String(markaUstVerisi('tr', 'danfoss').description)
    expect(danfoss).toContain('1933')
    expect(ovguVarMi(danfoss)).toBe(false)
    const vortice = String(markaUstVerisi('tr', 'vortice').description)
    expect(vortice.startsWith('Vortice: ')).toBe(true)
    expect(ovguVarMi(vortice)).toBe(false)
  })

  it('en: kayıt metni iddiasız (Vortice, Danfoss), ham sözlük anahtarı sızmaz', () => {
    const vortice = String(markaUstVerisi('en', 'vortice').description)
    expect(vortice.startsWith('Vortice: ')).toBe(true)
    expect(vortice).not.toMatch(/brands\./)
    expect(ovguVarMi(vortice)).toBe(false)
    const danfoss = String(markaUstVerisi('en', 'danfoss').description)
    expect(danfoss).toContain('1933')
    expect(ovguVarMi(danfoss)).toBe(false)
  })

  it('marka adı kayıt metninde yoksa başa eklenir, varsa tekrarlanmaz', () => {
    const avens = String(markaUstVerisi('tr', 'avens').description)
    expect(avens.startsWith('Avens: ')).toBe(true)
    expect(avens.match(/Avens/g)?.length).toBe(1)
  })
})

describe('kategori açıklaması', () => {
  const TR_A =
    'Havayı milin ekseni boyunca iten fanlar: yüksek debi, düşük basınç. Duvar açıklığı, depo ve atölye havalandırmasında kullanılır.'
  const TR_B =
    'Bacanın çekişini mekanik olarak destekleyen fanlar. Doğal çekişin yetmediği, dumanın içeri vurduğu şömine ve baca hatlarında çalışır.'

  it('iki farklı kategori iki farklı açıklama verir ve her biri kendi metninden türer', () => {
    const a = String(kategoriSayfasiUstVerisi('tr', kategori('aksiyel', TR_A, 'Fans that push air along the shaft.')).description)
    const b = String(kategoriSayfasiUstVerisi('tr', kategori('baca', TR_B, 'Fans that support chimney draft.')).description)
    expect(a).not.toBe(b)
    expect(a).toBe(aciklamaKirp(TR_A))
    expect(b).toBe(aciklamaKirp(TR_B))
  })

  it('dile göre doğru metin seçilir (EN sayfada Türkçe açıklama çıkmaz)', () => {
    const k = kategori('aksiyel', TR_A, 'Fans that push air along the shaft: high airflow, low pressure.')
    expect(String(kategoriSayfasiUstVerisi('en', k).description)).toBe('Fans that push air along the shaft: high airflow, low pressure.')
    expect(String(kategoriSayfasiUstVerisi('tr', k).description)).toBe(aciklamaKirp(TR_A))
  })

  it('uzun kategori metni azami uzunlukta ve yarım sözcüksüz biter', () => {
    const uzun = `Havalandırma hattında kullanılan ${'çok amaçlı fanlar kanal sistemlerinde yüksek verimle çalışır '.repeat(5)}`
    const d = String(kategoriSayfasiUstVerisi('tr', kategori('uzun', uzun, null)).description)
    expect(d.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
    expect(d).toMatch(/[.!?…]$/)
  })

  it('kendi metni olmayan kategori sözlükteki yedek cümleyi alır; övgü kalıbı yok', () => {
    for (const lang of ['tr', 'en'] as const) {
      const d = String(kategoriSayfasiUstVerisi(lang, kategori('bos', null, null)).description)
      expect(d.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
      expect(d).not.toMatch(YASAK_OVGU)
      expect(d).not.toContain('{{')
    }
  })
})

describe('sayfa açıklama metinleri (marka dizini, iletişim, ürün seçici)', () => {
  const metinler: Array<[string, string]> = [
    ['tr brands.seoDesc', tr.brands.seoDesc],
    ['en brands.seoDesc', en.brands.seoDesc],
    ['tr contactPage.subtitle', tr.contactPage.subtitle],
    ['en contactPage.subtitle', en.contactPage.subtitle],
    ['tr urunSecici.seoDescription', tr.urunSecici.seoDescription],
    ['en urunSecici.seoDescription', en.urunSecici.seoDescription],
  ]
  for (const [ad, metin] of metinler) {
    it(`${ad} arama sonucu aralığında`, () => {
      expect(metin.length).toBeGreaterThanOrEqual(ACIKLAMA_ASGARI)
      expect(metin.length).toBeLessThanOrEqual(ACIKLAMA_AZAMI)
      expect(metin).not.toMatch(YASAK_OVGU)
    })
  }
})
