/**
 * INV-BREADCRUMB-LD-1 — Ürün detay sayfasının breadcrumb'ı MAKİNE tarafından okunabilmeli.
 *
 * NİÇİN VAR:
 * BreadcrumbList JSON-LD'sini bugüne kadar yalnız paylaşılan `Breadcrumb.tsx` bileşeni
 * basıyordu. Ürün detay sayfası (model dalı) o bileşeni kullanmıyor, breadcrumb'ını elle
 * `<nav>` olarak yazıyor. Sonuç: en çok trafik alan sayfa tipinde yapılandırılmış breadcrumb
 * verisi HİÇ yoktu — görsel breadcrumb ekranda duruyordu ve bu, makinenin onu okuyabildiği
 * anlamına gelmiyordu. `jsonld.ts`'teki "BreadcrumbList kasıtlı eklenmez" gerekçesi DOĞRU bir
 * ölçüme dayanıyordu (seri dalı gerçekten bileşeni kullanıyor) ama YANLIŞ KAPSAMA uygulanmıştı.
 *
 * BU TESTİN İDDİASI: üretilen düğümün ŞEKLİ, site genelindeki `Breadcrumb.tsx` çıktısıyla
 * aynı olmalı ve sözleşme ihlalleri sessiz geçmemeli. Sayfanın bu fonksiyonu gerçekten
 * ÇAĞIRDIĞINI bu test ölçmez — o bağlama sunucu sayfasında yapılır.
 */
import { describe, expect, it } from 'vitest'

import { assertNoUuid, buildBreadcrumbJsonLd } from '../jsonld'

const TEMEL = { lang: 'tr', baseUrl: 'https://venthub.example' }

describe('INV-BREADCRUMB-LD-1 — buildBreadcrumbJsonLd', () => {
  it('tam zinciri sırasıyla BreadcrumbList olarak üretir', () => {
    const ld = buildBreadcrumbJsonLd({
      ...TEMEL,
      steps: [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Endüstriyel Havalandırma', path: '/category/industrial-ventilation' },
        { name: 'Santrifüj | Radyal Fanlar', path: '/category/industrial-ventilation/centrifugal-fans' },
        { name: 'Nicotra ADH Serisi', path: null },
      ],
    })

    expect(ld['@type']).toBe('BreadcrumbList')
    const ogeler = ld.itemListElement as Array<Record<string, unknown>>
    expect(ogeler).toHaveLength(4)
    expect(ogeler.map((o) => o.position)).toEqual([1, 2, 3, 4])
    expect(ogeler.map((o) => o.name)).toEqual([
      'Ana Sayfa',
      'Endüstriyel Havalandırma',
      'Santrifüj | Radyal Fanlar',
      'Nicotra ADH Serisi',
    ])
  })

  it('hedefi olan her basamağa dil önekli mutlak URL yazar', () => {
    const ld = buildBreadcrumbJsonLd({
      ...TEMEL,
      lang: 'en',
      steps: [
        { name: 'Home', path: '/' },
        { name: 'Commercial Ventilation', path: '/category/commercial-ventilation' },
        { name: 'Vort Quadro', path: null },
      ],
    })
    const ogeler = ld.itemListElement as Array<Record<string, unknown>>
    expect(ogeler[0].item).toBe('https://venthub.example/en/')
    expect(ogeler[1].item).toBe('https://venthub.example/en/category/commercial-ventilation')
  })

  it('bulunulan sayfaya (son basamak) `item` YAZMAZ — Breadcrumb.tsx ile aynı şekil', () => {
    const ld = buildBreadcrumbJsonLd({
      ...TEMEL,
      steps: [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Vort Quadro', path: null },
      ],
    })
    const ogeler = ld.itemListElement as Array<Record<string, unknown>>
    expect(ogeler[1]).not.toHaveProperty('item')
    expect(ogeler[1].name).toBe('Vort Quadro')
  })

  it('kategori çözülemediğinde zincir KISALIR, kopmaz', () => {
    // PDP kategoriyi çözemezse breadcrumb "Ana Sayfa > ürün" olarak kısalıyor (mevcut davranış).
    // Bu geçerli bir zincirdir; fonksiyon onu reddetmemeli.
    const ld = buildBreadcrumbJsonLd({
      ...TEMEL,
      steps: [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Kategorisiz Ürün', path: null },
      ],
    })
    expect((ld.itemListElement as unknown[]).length).toBe(2)
  })

  it('UUID sızdırmaz', () => {
    const ld = buildBreadcrumbJsonLd({
      ...TEMEL,
      steps: [
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Fanlar', path: '/category/industrial-ventilation' },
        { name: 'Ürün', path: null },
      ],
    })
    expect(() => assertNoUuid(ld)).not.toThrow()
  })

  describe('sözleşme ihlali SESSİZ geçmez', () => {
    it('tek basamaklı zincir atar', () => {
      expect(() =>
        buildBreadcrumbJsonLd({ ...TEMEL, steps: [{ name: 'Ana Sayfa', path: '/' }] }),
      ).toThrow(/en az iki basamak/)
    })

    it('son basamağa yol verilirse atar (bulunulan sayfa kendine link veremez)', () => {
      expect(() =>
        buildBreadcrumbJsonLd({
          ...TEMEL,
          steps: [
            { name: 'Ana Sayfa', path: '/' },
            { name: 'Ürün', path: '/products/urun' },
          ],
        }),
      ).toThrow(/son basamak/)
    })

    it('adı ÇAĞIRAN çözer — fonksiyon verilen dizeyi olduğu gibi basar', () => {
      // Kural 7 sorumlulugu kontratta nerede duruyor: cagiranda. Fonksiyon sozluge bakmaz,
      // getCategoryDisplayName cagirmaz, dil cozmez — verilen gorunen adi aynen yazar.
      // Yanlis dilde ya da ham DB adi gelirse BURASI yakalamaz.
      const ld = buildBreadcrumbJsonLd({
        ...TEMEL,
        steps: [
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Kanal İçi Hayalet Fanlar', path: '/category/inline-duct-fans' },
          { name: 'Lineo 150 Quiet', path: null },
        ],
      })
      const ogeler = ld.itemListElement as Array<Record<string, unknown>>
      expect(ogeler[1].name).toBe('Kanal İçi Hayalet Fanlar')
    })

    it('boş adlı basamak atar — adsız düğüm geçerli yapılandırılmış veri değildir', () => {
      expect(() =>
        buildBreadcrumbJsonLd({
          ...TEMEL,
          steps: [
            { name: 'Ana Sayfa', path: '/' },
            { name: '   ', path: '/category/x' },
            { name: 'Ürün', path: null },
          ],
        }),
      ).toThrow(/basamak adi bos/)
    })
  })
})
