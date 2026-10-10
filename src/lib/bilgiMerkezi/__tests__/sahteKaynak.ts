import type { BilgiMerkeziKaynagi } from '../sayfa'

/**
 * Testler için sahte katalog. Gerçek kaynağın (src/lib/data/bilgiMerkeziKaynak.ts) sözleşmesini
 * taklit eder: bulunamayan nesne `null`, takma ad eski slug → bugünkü slug, pasif kategori `null`.
 */
export function sahteKaynak(ek: Partial<BilgiMerkeziKaynagi> = {}): BilgiMerkeziKaynagi {
  const aileler = new Map([
    ['vortice-hava-perdesi', 'Vortice AD Ortam Havalı Hava Perdeleri'],
    ['vortice-h-ad-elektrikli', 'Vortice H AD Elektrikli Isıtmalı Hava Perdeleri'],
    ['vortice-isi-geri-kazanim', 'Vortice VORT HR Isı Geri Kazanım'],
    ['avens-isi-geri-kazanim', 'AVenS Isı Geri Kazanım Cihazları'],
    ['vortice-vort-mono', 'Vortice VORT Mono'],
    ['yeni-aile-adi', 'Yeni Aile'],
    // Frekans konvertörü yazısı (canlı DB'de aktif, 2026-09-25 BLOG ölçümü: 2/16/17 ürün).
    // URN-53: slug'lar #1352 sonrası canlı (yazilar.ts bunları anar).
    ['danfoss-vlt-micro-drive-fc-51', 'Danfoss VLT Micro Drive FC 51'],
    ['danfoss-vlt-hvac-basic-drive-fc-101', 'Danfoss VLT HVAC Basic Drive FC 101'],
    ['danfoss-vlt-hvac-drive-fc-102', 'Danfoss VLT HVAC Drive FC 102'],
  ])
  const modeller = new Map([['VRT-65195', 'vortice-hava-perdesi']])
  const kategoriler: Record<string, { slug: string; metadata: unknown; ust: { slug: string; metadata: unknown } | null }> = {
    'air-curtains': { slug: 'air-curtains', metadata: { slug: { tr: 'hava-perdeleri', en: 'air-curtains' } }, ust: null },
    'heat-recovery-vmc': { slug: 'heat-recovery-vmc', metadata: { slug: { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' } }, ust: null },
    'frequency-converters': { slug: 'frequency-converters', metadata: { slug: { tr: 'frekans-konvertorleri', en: 'frequency-converters' } }, ust: null },
    'smoke-exhaust-fans': {
      slug: 'smoke-exhaust-fans',
      metadata: { slug: { tr: 'duman-egzoz-fanlari', en: 'smoke-exhaust-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
  }
  const takma: Record<string, string> = { 'aile:eski-aile-adi': 'yeni-aile-adi', 'kategori:eski-kategori': 'air-curtains' }

  return {
    model: async (sku) => (modeller.has(sku) ? { sku, aileSlug: modeller.get(sku) as string } : null),
    aile: async (slug) => (aileler.has(slug) ? { slug } : null),
    kategori: async (slug) => kategoriler[slug] ?? null,
    takmaAd: async (tur, slug) => takma[`${tur}:${slug}`] ?? null,
    marka: (slug) => slug === 'vortice',
    aileKarti: async (slug) => (aileler.has(slug) ? { slug, ad: aileler.get(slug) as string } : null),
    ...ek,
  }
}
