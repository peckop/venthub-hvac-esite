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
    name: 'Casals',
    slug: 'casals',
    description: {
      tr: '140 yılı aşkın endüstriyel fan üretim tecrübesi. En zorlu koşullarda bile çalışan yüksek performanslı havalandırma fanları ve yangın dayanımlı çözümler.',
      en: 'Over 140 years of industrial fan manufacturing. High-performance ventilation fans and fire-rated solutions built for the harshest conditions.'
    },
    country: { tr: 'İspanya', en: 'Spain' },
    founded: 1881,
    headquarters: { tr: 'Girona', en: 'Girona' },
    website: 'https://www.casals.com',
    specialty: { tr: 'Endüstriyel Fan Mühendisliği', en: 'Industrial Fan Engineering' }
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
  },
  {
    name: 'Flexiva',
    slug: 'flexiva',
    description: {
      tr: 'Esnek hava kanalı teknolojilerinde Türkiye\'nin global markası. Patentli sızdırmazlık teknolojileri ve kolay montaj avantajıyla havalandırma projelerinin vazgeçilmezi.',
      en: 'Türkiye\'s global brand in flexible air duct technology. Patented sealing systems and fast installation make it a staple of ventilation projects.'
    },
    country: { tr: 'Türkiye', en: 'Türkiye' },
    founded: 2000,
    headquarters: { tr: 'İstanbul', en: 'Istanbul' },
    website: 'https://www.flexiva.com.tr',
    specialty: { tr: 'Esnek Hava Kanalları', en: 'Flexible Air Ducts' }
  },
  {
    // NOT (REC-98 ölçümü): bu bir MARKA değil, ürün tipi — katalog verisinde kirlilik.
    // Kapsam dışı bırakıldı, temizliği ayrı iş; burada yalnız iki dilli hale getirildi.
    name: 'Frekans Konvertörü',
    slug: 'frekans-konvertoru',
    description: {
      tr: 'Yüksek verimli hız kontrolü',
      en: 'High-efficiency speed control'
    },
    country: { tr: 'Danimarka', en: 'Denmark' },
    specialty: { tr: 'Hız Kontrol Cihazları', en: 'Speed Control Devices' }
  }
]
