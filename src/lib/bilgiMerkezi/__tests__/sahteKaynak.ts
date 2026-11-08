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
    // Radyal fan mı aksiyel fan mı yazısı (BLG-3, 2026-10-11): slug'lar canlı site haritasında 200 verir
    // (migration 20261005100000 çiftleri; Vortice ailesi VORTICEL E, A-E, MP serilerini kapsar).
    ['nicotra-gebhardt-at-cift-emisli-radyal-fanlar', 'Nicotra Gebhardt AT Çift Emişli Radyal Fanlar'],
    ['nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar', 'Nicotra Gebhardt ADH Sık Kanatlı Radyal Fanlar'],
    ['nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar', 'Nicotra Gebhardt RDH Seyrek Kanatlı Radyal Fanlar'],
    ['nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar', 'Nicotra Gebhardt DD Direkt Akuple Radyal Fanlar'],
    ['vortice-aksiyel-endustriyel-fanlar', 'Vortice Aksiyel Endüstriyel Fanlar'],
    // Sessiz fan nasıl seçilir yazısı (BLG-15, 2026-10-17): aile canlı site haritasında 200 verir.
    ['vortice-lineo-quiet-sessiz-kanal-fanlari', 'Vortice Lineo Quiet Sessiz Kanal Fanları'],
    // Kanal tipi fan nedir yazısı (BLG-18, 2026-10-25): aile sayfaları canlıda 200 verir (25 Ekim ölçümü).
    ['vortice-lineo-kanal-fanlari', 'Vortice Lineo Kanal Fanları'],
    // BLG-22 (31 Ekim 2026): yuvarlak aile REC-397 ile arşivlendi; rehber aynı serinin aktif dikdörtgen ailesine bağlanır.
    ['vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari', 'Vortice VORT Commercial In-Line Dikdörtgen Kanal Fanları'],
    ['vortice-radon-serisi-kanal-fanlari', 'Vortice Radon Serisi Kanal Fanları'],
    // BLG-39 (4 Kasım 2026): kanal tipi fan rehberi beşinci aile olarak Avens dikdörtgen kanal ailesine bağlanır; ölçüm: 200, canonical kendisi, noindex yok.
    ['avens-dikdortgen-kanal-tipi-radyal-fanlar', 'AVenS Dikdörtgen Kanal Tipi Radyal Fanlar'],
    // Isı geri kazanım cihazı nedir yazısı (BLG-20, 2026-11): üç aile sayfası canlıda 200 verir (31 Ekim ölçümü).
    ['vortice-vort-hr-isi-geri-kazanim', 'Vortice VORT HR Isı Geri Kazanım'],
    ['vortice-vort-mono', 'Vortice VORT Mono'],
    ['avens-isi-geri-kazanim-cihazlari', 'AVenS Isı Geri Kazanım Cihazları'],
    // Hava perdesi nedir yazısı (BLG-28, 2026-11): iki aile sayfası canlıda 200 verir (kategori sayfasından, 1 Kasım ölçümü).
    ['vortice-ad-isiticisiz-hava-perdeleri', 'Vortice AD Isıtıcısız Hava Perdeleri'],
    ['vortice-h-ad-elektrikli-isiticili-hava-perdeleri', 'Vortice H AD Elektrikli Isıtıcılı Hava Perdeleri'],
    // Plug fan nedir yazısı (BLG-33, 2026-11): iki aile sayfası canlıda 200 verir (3 Kasım ölçümü; kategori sayfasından).
    ['casals-enkelfan-ec-plug', 'Casals ENKELFAN EC Plug Fan'],
    ['casals-kentalfan-plug', 'Casals KENTALFAN Plug Fan'],
    // Asit fanı nedir yazısı (BLG-45, 2026-11): üç aile sayfası canlıda 200 verir (kategori sayfasından, 7 Kasım ölçümü).
    ['seat-serisi', 'SEAT Storm Jet Asit Dayanımlı Fanlar'],
    ['jet-serisi', 'JET Serisi'],
    ['storm-serisi', 'STORM Serisi'],
    // Patlayıcı ortamda fan seçimi (ATEX) yazısı (BLG-51, 2026-11): Vorticent CMS ATEX aile sayfası canlıda 200 verir (8 Kasım ölçümü; ürün sayfası).
    ['vortice-vorticent-cms-atex-santrifuj-fanlar', 'Vortice Vorticent CMS ATEX Santrifüj Fanlar'],
    // BLG-54 (2026-11): aile sayfaları canlıda 200 verir (8 Kasım ölçümü; kategori sayfasından).
    ['avens-hucreli-aspiratorler-hf-fw', 'AVenS Hücreli Aspiratörler HF-FW'],
    ['avens-hucreli-aspiratorler-hf-s', 'AVenS Hücreli Aspiratörler HF-S'],
    // Çatı tipi fan nedir yazısı (BLG-49, 2026-11): Slimroof aile sayfası canlıda 200 verir (8 Kasım ölçümü; kategori sayfasından).
    ['vortice-slimroof-cati-fanlari', 'Vortice Slimroof Çatı Fanları'],
  ])
  const modeller = new Map([['VRT-65195', 'vortice-hava-perdesi']])
  const kategoriler: Record<string, { slug: string; metadata: unknown; ust: { slug: string; metadata: unknown } | null }> = {
    'air-curtains': { slug: 'air-curtains', metadata: { slug: { tr: 'hava-perdeleri', en: 'air-curtains' } }, ust: null },
    'heat-recovery-vmc': { slug: 'heat-recovery-vmc', metadata: { slug: { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' } }, ust: null },
    // Isı geri kazanım yazısı (BLG-20, 2026-10-31): alt kategoriler canlıda 200 verir, kanonik EN slug TR görünür adrese yönlenir.
    'ducted-central-hrv': {
      slug: 'ducted-central-hrv',
      metadata: { slug: { tr: 'kanalli-merkezi-uniteler', en: 'ducted-central-hrv' } },
      ust: { slug: 'heat-recovery-vmc', metadata: { slug: { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' } } },
    },
    'single-room-hrv': {
      slug: 'single-room-hrv',
      metadata: { slug: { tr: 'tek-oda-uniteleri', en: 'single-room-hrv' } },
      ust: { slug: 'heat-recovery-vmc', metadata: { slug: { tr: 'isi-geri-kazanim', en: 'heat-recovery-vmc' } } },
    },
    'frequency-converters': { slug: 'frequency-converters', metadata: { slug: { tr: 'frekans-konvertorleri', en: 'frequency-converters' } }, ust: null },
    'centrifugal-fans': {
      slug: 'centrifugal-fans',
      metadata: { slug: { tr: 'radyal-fanlar', en: 'centrifugal-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'axial-industrial-fans': {
      slug: 'axial-industrial-fans',
      metadata: { slug: { tr: 'aksiyel-fanlar', en: 'axial-industrial-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'duct-fans': {
      slug: 'duct-fans',
      metadata: { slug: { tr: 'kanal-tipi-fanlar', en: 'duct-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'smoke-exhaust-fans': {
      slug: 'smoke-exhaust-fans',
      metadata: { slug: { tr: 'duman-egzoz-fanlari', en: 'smoke-exhaust-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    // Fan çeşitleri yazısı (BLG-31, 2026-11): yedi fan alt kategorisi canlıda 200 verir (3 Kasım 2026 ölçümü, TR adresleri).
    'roof-fans': {
      slug: 'roof-fans',
      metadata: { slug: { tr: 'cati-tipi-fanlar', en: 'roof-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'bathroom-toilet-fans': {
      slug: 'bathroom-toilet-fans',
      metadata: { slug: { tr: 'banyo-tuvalet-fanlari', en: 'bathroom-toilet-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'cabinet-fans': {
      slug: 'cabinet-fans',
      metadata: { slug: { tr: 'hucreli-aspiratorler', en: 'cabinet-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'plug-fans': {
      slug: 'plug-fans',
      metadata: { slug: { tr: 'plug-fanlar', en: 'plug-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'corrosion-and-acid-resistant-fans': {
      slug: 'corrosion-and-acid-resistant-fans',
      metadata: { slug: { tr: 'korozyona-ve-aside-dayanimli-fanlar', en: 'corrosion-and-acid-resistant-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'chimney-fans': {
      slug: 'chimney-fans',
      metadata: { slug: { tr: 'somine-ve-baca-fanlari', en: 'chimney-fans' } },
      ust: { slug: 'fans', metadata: { slug: { tr: 'fanlar', en: 'fans' } } },
    },
    'industrial-ceiling-fans': {
      slug: 'industrial-ceiling-fans',
      metadata: { slug: { tr: 'tavan-vantilatorleri', en: 'industrial-ceiling-fans' } },
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
    // URN-151: görünen ad slug'dan türetilen sentetik ad; kısa metin yalnız TR'de dolu (canlıda EN çoğu kategoride boş).
    kategoriKarti: async (slug, dil) =>
      kategoriler[slug]
        ? { slug, ad: `${dil === 'en' ? 'Category' : 'Kategori'} ${slug}`, aciklama: dil === 'en' ? '' : `${slug} kategorisinin kısa metni.` }
        : null,
    ...ek,
  }
}
