/**
 * KATEGORİ AĞACI FİKSTÜRÜ — canlı DB'den SELECT ile ölçüldü (2026-09-25, proje tnofewwkwlyjsqgwjjga,
 * salt okuma): `select c.id, c.slug, c.metadata->'slug', c.is_active, c.level, c.parent_id … from categories`.
 *
 * 31 satır: 6 aktif kök + 18 aktif dal + **7 pasif** (plan §6 satır 5c, v4 O4). ⚠Kategori rotası
 * yorumundaki "categories (30)" 2026-09-08 ölçümüdür; bugün 31.
 *   pasif kök: commercial-ventilation (ticari-havalandirma), residential-ventilation (konut-tipi-havalandirma)
 *   pasif dal, aktif üst (fans): ex-proof-atex-fans, jet-fans, parking-jet-fan         → /tr/kategori/fanlar
 *   pasif dal, pasif üst: inline-duct-fans (residential), rectangular-duct-fans (commercial) → /tr/urunler
 * Kimlikler kısaltıldı (ilk 8 hane) — çözücü kimliği yalnız üst bağlantısı için kullanır.
 * Veri değişirse (Faz 1-B ağaç göçü: 4 yeni dal, Casals) bu fikstür yeniden ölçülür.
 */
export interface FiksturKategori {
  id: string
  slug: string
  metadata: { slug: { tr: string; en: string } }
  is_active: boolean
  parent_id: string | null
}

const k = (id: string, en: string, trSlug: string, is_active: boolean, parent_id: string | null): FiksturKategori => ({
  id,
  slug: en,
  metadata: { slug: { tr: trSlug, en } },
  is_active,
  parent_id,
})

const FANS = 'c2f5d352'
const AIR_TREATMENT = '243c2aa4'
const CONTROL = '9dcf8e58'
const HRV = '1e451b88'
const ACCESSORIES = '6d3749d5'
const COMMERCIAL = 'efcf3074'
const RESIDENTIAL = '45d6e1c0'

export const KATEGORI_AGACI: readonly FiksturKategori[] = [
  // pasif (7)
  k(COMMERCIAL, 'commercial-ventilation', 'ticari-havalandirma', false, null),
  k(RESIDENTIAL, 'residential-ventilation', 'konut-tipi-havalandirma', false, null),
  k('ca8eb900', 'ex-proof-atex-fans', 'ex-proof-atex-fanlar', false, FANS),
  k('da361b26', 'inline-duct-fans', 'kanal-ici-hayalet-fanlar', false, RESIDENTIAL),
  k('bae47d92', 'jet-fans', 'otopark-jet-fanlari', false, FANS),
  k('c8d10f94', 'parking-jet-fan', 'otopark-jet-fan', false, FANS),
  k('88d9ac92', 'rectangular-duct-fans', 'dikdortgen-kanal-fanlari', false, COMMERCIAL),
  // aktif kök (6)
  k(ACCESSORIES, 'accessories', 'aksesuarlar', true, null),
  k('f4ef8c4b', 'air-curtains', 'hava-perdeleri', true, null),
  k(AIR_TREATMENT, 'air-treatment', 'iklimlendirme-ve-hava-sartlandirma', true, null),
  k(CONTROL, 'control-systems', 'kontrol-sistemleri', true, null),
  k(FANS, 'fans', 'fanlar', true, null),
  k(HRV, 'heat-recovery-vmc', 'isi-geri-kazanim', true, null),
  // aktif dal (18)
  k('98a6f650', 'acid-resistant-fans', 'asit-dayanikli-fanlar', true, FANS),
  k('9139f2f4', 'axial-industrial-fans', 'aksiyel-sanayi-fanlari', true, FANS),
  k('b6c71e46', 'bathroom-toilet-fans', 'banyo-ve-tuvalet-fanlari', true, FANS),
  k('51c2c050', 'centrifugal-fans', 'radyal-fanlar', true, FANS),
  k('8e77cfb0', 'chimney-fans', 'somine-ve-baca-fanlari', true, FANS),
  k('e225617b', 'dehumidifiers', 'nem-alma-cihazlari', true, AIR_TREATMENT),
  k('a77203a2', 'duct-fans', 'kanal-tipi-fanlar', true, FANS),
  k('93c23d30', 'ducted-central-hrv', 'kanalli-merkezi-uniteler', true, HRV),
  k('761fafa7', 'electric-duct-heaters', 'elektrikli-kanal-isiticilari', true, AIR_TREATMENT),
  k('194adcb5', 'frequency-converters', 'frekans-konvertorleri', true, CONTROL),
  k('14c8c3fe', 'industrial-ceiling-fans', 'endustriyel-tavan-vantilatorleri', true, FANS),
  k('619025cb', 'roof-fans', 'cati-tipi-fanlar', true, FANS),
  k('076c6aa8', 'shelter-ventilation', 'siginak-havalandirma', true, FANS),
  k('5e663aae', 'single-room-hrv', 'tekil-oda-uniteleri', true, HRV),
  k('9f4fc010', 'smoke-exhaust-fans', 'duman-egzoz-fanlari', true, FANS),
  k('1a87e18b', 'spare-parts-sensors', 'yedek-parca-ve-sensorler', true, ACCESSORIES),
  k('7c673ad2', 'speed-controllers', 'hiz-anahtarlari', true, CONTROL),
  k('33b74f13', 'water-coil-duct-heaters', 'sulu-batarya-kanal-tipi', true, AIR_TREATMENT),
]

/** `getCachedCategoryData`'nın eşleşme kuralı: kanonik slug, TR ya da EN görünen slug. */
export function fiksturdenSlugIle(slug: string): FiksturKategori | null {
  return (
    KATEGORI_AGACI.find((c) => c.slug === slug) ??
    KATEGORI_AGACI.find((c) => c.metadata.slug.tr === slug) ??
    KATEGORI_AGACI.find((c) => c.metadata.slug.en === slug) ??
    null
  )
}

export function fiksturdenIdIle(id: string): FiksturKategori | null {
  return KATEGORI_AGACI.find((c) => c.id === id) ?? null
}
