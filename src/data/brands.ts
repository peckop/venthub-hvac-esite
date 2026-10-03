/**
 * Marka kataloğu — VERİ katmanı (arayüz metni DEĞİL).
 *
 * REC-98 (2026-08-31): bu dosya tek dilliydi ve `/en/brands/<slug>` sayfası ölçümde
 * Türkçe içerik gösteriyordu (canlı kanıt: hydrate sonrası 15 TR satır). Arayüz
 * çerçevesi zaten sözlükten geliyordu; Türkçe kalan şey buradaki VERİ idi.
 *
 * Neden sözlüğe taşınmadı: bunlar arayüz etiketi değil, marka kayıtları — DB'deki
 * çevirilerin `metadata->>lang` ile veri yanında taşınması gibi (CLAUDE.md kural 7),
 * çeviri de kaydın yanında durur. Sözlük yalnız ETİKETİ tutar ("Menşei", "Kuruluş").
 *
 * REC-374 (2026-09-27): LİSTE = DB'de AKTİF ÜRÜNÜ OLAN MARKALAR. Ürünsüz marka yayınlanmaz —
 * sayfası "Bu markanın ürünleri henüz katalogda değil" diyen bir marka vitrinde kusurdur.
 * Ölçüm (canlı DB, `brands` × `products.status='active'`): vortice 184, avens 106, seat 81,
 * danfoss 35, nicotra-gebhardt 35. Bu yüzden:
 *  · `casals` ÇIKTI (DB'de ürünü 0) — Casals ürünleri DB'ye girince (REC-374 1-B) GERİ EKLENİR;
 *    eski kaydın metni git geçmişinde (bu dosyanın REC-374 öncesi hâli).
 *  · `flexiva` ÇIKTI (DB'de marka olarak hiç yok).
 *  · `frekans-konvertoru` ÇIKTI (marka değil, ürün türü — Danfoss'un frekans konvertörleri).
 *  · `seat` ve `danfoss` EKLENDİ (DB'de ürünü var, listede yoktu).
 * Eski üç adres 308 ile yönlenir: src/config/markaYonlendirmeleri.mjs.
 * Kapı: INV-MARKA-KAYNAK-1 (src/data/__tests__/markaKaynagi.test.ts) — listeyi DB fikstürüne bağlar.
 * Yeni markanın metni üreticinin RESMÎ sitesinden alınır; kaynak URL kaydın üstünde yazılır,
 * doğrulanamayan alan (founded/headquarters) YAZILMAZ.
 */

/** Dile göre çözülen metin. İki dil de ZORUNLU — eksik dil sessizce Türkçe göstermesin. */
export type BrandText = { tr: string; en: string }

export interface HVACBrand {
  name: string
  slug: string
  description: BrandText
  country: BrandText
  founded?: number
  headquarters?: BrandText
  website?: string
  specialty?: BrandText
  logo?: string
}

/**
 * Dile göre metin seçer. `lang` bilinmiyorsa Türkçe (kanonik dil) döner.
 * Tek giriş noktası olması KASITLI: çağrı yerlerinde `lang === 'en' ? ... : ...`
 * dağılırsa bir yüzey unutulur ve o yüzey sessizce tek dilli kalır — REC-98 aynen buydu.
 */
export const brandText = (value: BrandText | undefined, lang: string): string => {
  if (!value) return ''
  return lang === 'en' ? value.en : value.tr
}

export const HVAC_BRANDS: HVACBrand[] = [
  {
    name: 'Vortice',
    slug: 'vortice',
    description: {
      tr: '1954 yılından bu yana havalandırma teknolojilerinde dünya lideri. İtalyan tasarımı ve ileri mühendislik çözümleriyle konut, ticari ve endüstriyel iklimlendirmede standartları belirliyor.',
      en: 'A world leader in ventilation technology since 1954. Italian design and advanced engineering set the standard across residential, commercial and industrial air treatment.'
    },
    country: { tr: 'İtalya', en: 'Italy' },
    founded: 1954,
    headquarters: { tr: 'Tribiano, Milano', en: 'Tribiano, Milan' },
    website: 'https://www.vortice.it',
    specialty: { tr: 'Aspiratörler & Isı Geri Kazanım', en: 'Extractor Fans & Heat Recovery' }
  },
  {
    name: 'Avens',
    slug: 'avens',
    description: {
      tr: 'Yüksek performanslı endüstriyel havalandırma ve klima santralleri çözümleri. Modern mühendislik yaklaşımlarıyla enerji verimliliği odaklı sistemler geliştirir.',
      en: 'High-performance industrial ventilation and air handling unit solutions. Modern engineering practice applied to energy-efficient system design.'
    },
    country: { tr: 'Türkiye', en: 'Türkiye' },
    founded: 2010,
    headquarters: { tr: 'İstanbul', en: 'Istanbul' },
    website: 'https://www.avens.com.tr',
    specialty: { tr: 'Endüstriyel Klima Santralleri', en: 'Industrial Air Handling Units' }
  },
  {
    // KAYNAK (2026-09-27): https://www.seat-ventilation.com/ (merkez adresi Verniolle, "Made in
    // France", korozif gaz ve hava tahliyesi, uygulama alanları) ·
    // https://www.seat-ventilation.com/pages/seat-ventilation-history (1968 kuruluş, Montfermeil;
    // 1988'de PP santrifüj "SEAT Series"). DB'deki marka adı "SEAT"; aile sorgusu `ilike` ile eşler.
    name: 'SEAT',
    slug: 'seat',
    description: {
      tr: '1968\'den bu yana Fransa\'da üretim yapan, korozif gaz ve hava tahliyesinde uzman fan üreticisi. Polipropilen (PP) santrifüj fanlarıyla laboratuvar, kimya ve ilaç sanayi, yüzme havuzu, atık su arıtma ve ATEX ortamlarında operatör ve personel güvenliğini koruyan uzun ömürlü çözümler sunar.',
      en: 'A French fan manufacturer specialising in the extraction of corrosive gases and air since 1968. Its polypropylene (PP) centrifugal fans provide long-lasting extraction for laboratories, the chemical and pharmaceutical industries, swimming pools, wastewater treatment and ATEX environments, keeping operators and personnel safe.'
    },
    country: { tr: 'Fransa', en: 'France' },
    founded: 1968,
    headquarters: { tr: 'Verniolle', en: 'Verniolle' },
    website: 'https://www.seat-ventilation.com',
    specialty: { tr: 'Korozyona Dayanıklı PP Fanlar', en: 'Corrosion-Resistant PP Fans' }
  },
  {
    // KAYNAK (2026-09-27): https://www.danfoss.com/en/about-danfoss/company/history/ (1933, Mads
    // Clausen, Nordborg; merkez hâlâ Nordborg'da) · https://www.danfoss.com/en/about-danfoss/our-businesses/drives/
    // ("Pioneers of VFDs since 1968", enerji tüketiminde %80'e varan azaltım) ·
    // https://www.danfoss.com/en/about-danfoss/ ("family-owned company").
    // Katalogdaki Danfoss ürünleri frekans konvertörleridir (FC 51 / FC 101 / FC 102).
    name: 'Danfoss',
    slug: 'danfoss',
    description: {
      tr: '1933\'te Danimarka\'da kurulan bir aile şirketi. Danfoss Drives 1968\'den bu yana frekans konvertörlerinin (değişken frekanslı sürücüler) öncüsüdür; motor hızını ihtiyaca göre ayarlayarak enerji tüketimini %80\'e varan oranda azaltır.',
      en: 'A family-owned company founded in Denmark in 1933. Danfoss Drives has pioneered variable-frequency drives since 1968, matching motor speed to demand to reduce energy consumption by up to 80%.'
    },
    country: { tr: 'Danimarka', en: 'Denmark' },
    founded: 1933,
    headquarters: { tr: 'Nordborg', en: 'Nordborg' },
    website: 'https://www.danfoss.com',
    specialty: { tr: 'Frekans Konvertörleri', en: 'Variable-Frequency Drives' }
  },
  {
    name: 'Nicotra Gebhardt',
    slug: 'nicotra-gebhardt',
    description: {
      tr: 'Alman mühendisliği ve İtalyan tasarımının birleşimiyle, endüstriyel santrifüj fanlarda dünyanın en geniş ve teknolojik ürün gamına sahip üreticisi.',
      en: 'German engineering combined with Italian design, offering one of the world\'s broadest and most advanced ranges of industrial centrifugal fans.'
    },
    country: { tr: 'Almanya', en: 'Germany' },
    founded: 1959,
    headquarters: { tr: 'Waldenburg', en: 'Waldenburg' },
    website: 'https://www.nicotra-gebhardt.com',
    specialty: { tr: 'Yüksek Verimli Santrifüj Fanlar', en: 'High-Efficiency Centrifugal Fans' }
  }
]

/** Ad karşılaştırması için: harf duyarsız, ayraçsız (`AVenS` = `avens`, `Nicotra Gebhardt` = `nicotra-gebhardt`). */
const markaAnahtari = (deger: string): string => deger.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * DB'deki marka ADINDAN (`product_families.brands.name`) vitrindeki marka kaydını bulur.
 *
 * NİÇİN: aile satırı marka SLUG'ını taşımaz, yalnız adını (`brand_name`) — oysa marka sayfasının
 * adresi slug ister. Eşleşme yoksa `null` döner ve çağıran bağlantıyı HİÇ çizmez: var olmayan bir
 * marka sayfasına giden bağlantı, bağlantı olmamasından kötüdür (404'e açılan iç bağlantı).
 */
export function markaBulAdla(ad: string | null | undefined): HVACBrand | null {
  if (!ad) return null
  const anahtar = markaAnahtari(ad)
  if (!anahtar) return null
  return HVAC_BRANDS.find((b) => markaAnahtari(b.name) === anahtar || markaAnahtari(b.slug) === anahtar) ?? null
}
