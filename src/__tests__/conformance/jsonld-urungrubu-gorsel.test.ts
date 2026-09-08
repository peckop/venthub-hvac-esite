import { describe, expect, it } from 'vitest'

import { buildProductGroupJsonLd } from '../../lib/seo/jsonld'
import type { FamilyVariant } from '../../lib/services/family.service'

/**
 * INV-URUNGRUBU-GORSEL-1 — aile sayfasının `ProductGroup` yapısal verisi, ürünün
 * görseli VARSA onu yayınlar; YOKSA alanı hiç yazmaz.
 *
 * CETVEL: `docs/standards/urun-yapisal-veri-standard.md` §2.1. Bu kapı o belgenin
 * uygulayıcısıdır; kural orada, ölçümü burada.
 *
 * NİÇİN (REC-269 bulgu 3, ölçüm 2026-09-07 canlı `venthub.com.tr`): üç aile sayfasının
 * ÜÇÜNDE de `ProductGroup.image` yoktu. Google'ın ürün zengin sonuçlarında görsel fiilen
 * zorunludur — görselsiz kayıt çoğu yüzeyde HİÇ gösterilmez. Yani sayfa yapısal veriyi
 * doğru üretiyordu ama arama sonucunda görünmeye YETMİYORDU.
 *
 * ⚖İKİ YÖNLÜ KURAL, ve ikinci yön birincisi kadar önemli:
 *   (a) görsel varsa YAZILIR — yoksa zengin sonuç kaybedilir;
 *   (b) görsel yoksa alan HİÇ YAZILMAZ — `mpn` ile aynı ilke (REC-272): eksik alan,
 *       uydurulmuş alandan iyidir. Yedek/temsili bir görsel koymak arama motoruna
 *       "o ailenin ürünü budur" diye YANLIŞ BEYAN olurdu.
 *
 * ⭐KURAL ÜÇÜNCÜ KEZ YAZILMADI: kapak kuralı ("varyant sırasına göre ilk varyantın ilk
 * görseli") zaten `family.service.ts` içinde ve RPC'de var. Builder o sırayı koruyan
 * `hasVariant` dizisinden ilk görselli düğümü seçer — kuralı KOPYALAMADAN aynı sonuç.
 * K4 kolu tam bunu ölçer: grup görseli, İLK GÖRSELLİ varyantın görseliyle aynı olmalı.
 *
 * ── KAPININ SINIRI, ADIYLA ──
 * Bu kapı BUILDER'ın sözleşmesini ölçer, CANLI SAYFAYI değil. Aynı fonksiyonun sayfada
 * çağrıldığını ve çıktının HTML'e basıldığını başka kapılar tutar. Ayrıca ölçüldü
 * (canlı, 2026-09-08): 47 ailenin 34'ü bu kuralla görsel türetir, 13'ünde hiç ürün
 * görseli YOK — o 13'ü kod değil KATALOG VERİSİ kapatır. Yani bu kapı yeşilken bile
 * 13 aile görselsiz kalır; kapı bunu kusur SAYMAZ çünkü kusur burada değil.
 */

const BASE_URL = 'https://venthub.com'
const FIYATLI_KATEGORI = { metadata: { hide_price: false } }

function varyant(overrides: Partial<FamilyVariant> = {}): FamilyVariant {
  return {
    id: 'v-1',
    sku: 'SKU-001',
    name: 'Test Varyant 100',
    slug: 'test-varyant-100',
    model_code: null,
    price: null,
    stock_qty: 0,
    technical_specs: null,
    description: null,
    images: [],
    ...overrides,
  }
}

function aile() {
  return {
    id: 'f-1',
    name: 'Test Ailesi',
    slug: 'test-ailesi',
    series_code: null,
    description: { tr: 'Aile açıklaması', en: 'Family description' },
    brand_name: 'Vortice',
    category_id: null,
    subcategory_id: null,
    meta_title: null,
    meta_description: null,
    category: null,
    subcategory: null,
  }
}

function kur(variants: FamilyVariant[]): Record<string, unknown> {
  return buildProductGroupJsonLd({
    family: aile(),
    variants,
    lang: 'tr',
    baseUrl: BASE_URL,
    mainCategory: FIYATLI_KATEGORI,
  })
}

const GORSEL_A = { path: 'aile/a.webp', alt: null, sort_order: 0 }
const GORSEL_B = { path: 'aile/b.webp', alt: null, sort_order: 0 }

describe('INV-URUNGRUBU-GORSEL-1 — ProductGroup görseli: varsa yazılır, yoksa uydurulmaz', () => {
  it('K1 (ön-koşul) — ölçtüğüm yapı gerçekten duruyor (evren boş değil)', () => {
    // Bu kol OLMADAN aşağıdaki "alan yok" sonucu, "builder hiçbir şey üretmiyor" ile
    // aynı şeye benzerdi. Önce ProductGroup'un ve varyant düğümlerinin varlığını ölçer.
    const jsonLd = kur([varyant({ images: [GORSEL_A] })])
    expect(jsonLd['@type']).toBe('ProductGroup')
    expect(Array.isArray(jsonLd.hasVariant)).toBe(true)
    expect((jsonLd.hasVariant as unknown[]).length).toBe(1)
  })

  it('K2 (kural, olumlu yön) — ürünün görseli varsa ProductGroup.image YAZILIR', () => {
    const jsonLd = kur([varyant({ images: [GORSEL_A] })])
    const varyantDugumu = (jsonLd.hasVariant as Array<Record<string, unknown>>)[0]

    expect(
      typeof jsonLd.image,
      'ProductGroup.image yazılmamış. Görselsiz ürün kaydı Google zengin sonuçlarının ' +
        'çoğu yüzeyinde HİÇ gösterilmez (REC-269 bulgu 3).',
    ).toBe('string')
    // Grup görseli, varyantın yayınlanan görseliyle AYNI olmalı: iki ayrı çözüm yolu
    // ilerde sessizce ayrışmasın.
    expect(jsonLd.image).toBe(varyantDugumu.image)
  })

  it('K3 (kural, olumsuz yön) — hiç görsel yoksa alan HİÇ YAZILMAZ (null/boş bile değil)', () => {
    const jsonLd = kur([varyant(), varyant({ id: 'v-2', sku: 'SKU-002' })])

    expect(
      Object.prototype.hasOwnProperty.call(jsonLd, 'image'),
      'Görsel yokken ProductGroup.image alanı yazılmış. Yedek/temsili görsel koymak ' +
        'arama motoruna YANLIŞ BEYANDIR — mpn ile aynı ilke (REC-272): alan hiç yazılmaz.',
    ).toBe(false)
    // `hasOwnProperty` bilerek: `undefined` atamak da JSON.stringify'da alanı düşürür
    // ama nesnede anahtar BIRAKIR ve "yazıldı mı" sorusunu bulanıklaştırır.
  })

  it('K4 (ayırt edicilik) — grup görseli İLK GÖRSELLİ varyanttan gelir, rastgele değil', () => {
    // Kapak kuralı zaten var (family.service.ts + RPC): varyant sırasına göre ilk
    // varyantın ilk görseli. Bu kol, builder'ın o sırayı bozmadığını ölçer.
    //
    // ⚠BU KOL OLMADAN K2 SAHTE YEŞİL VEREBİLİRDİ: "herhangi bir görsel" yazan bir
    // uygulama da K2'yi geçerdi. Burada ilk varyant GÖRSELSİZ, ikincisi görselli —
    // yani doğru cevap ikincinin görselidir ve "ilk varyantı al" diyen bir yazılış
    // KIRMIZI verir.
    const jsonLd = kur([
      varyant({ id: 'v-1', sku: 'SKU-001' }),
      varyant({ id: 'v-2', sku: 'SKU-002', images: [GORSEL_B] }),
      varyant({ id: 'v-3', sku: 'SKU-003', images: [GORSEL_A] }),
    ])
    const dugumler = jsonLd.hasVariant as Array<Record<string, unknown>>

    expect(dugumler[0].image, 'görselsiz varyanta görsel yazılmış').toBeUndefined()
    expect(jsonLd.image).toBe(dugumler[1].image)
    expect(jsonLd.image).not.toBe(dugumler[2].image)
  })

  it('K5 (sınır) — varyant listesi boşken de alan yazılmaz ve builder çökmez', () => {
    // Aile sayfası varyantsız kalabilir (veri geçişi, filtre). Kapı burada da tanımlı
    // davranış ister: sessizce çökmek de, boş bir görsel yazmak da kabul değil.
    const jsonLd = kur([])
    expect(jsonLd['@type']).toBe('ProductGroup')
    expect(Object.prototype.hasOwnProperty.call(jsonLd, 'image')).toBe(false)
  })
})
