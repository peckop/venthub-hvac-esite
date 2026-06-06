export interface HVACBrand {
  name: string
  slug: string
  description: string
  country: string
  founded?: number
  headquarters?: string
  website?: string
  specialty?: string
  logo?: string
}

export const HVAC_BRANDS: HVACBrand[] = [
  { 
    name: 'Vortice', 
    slug: 'vortice', 
    description: '1954 yılından bu yana havalandırma teknolojilerinde dünya lideri. İtalyan tasarımı ve ileri mühendislik çözümleriyle konut, ticari ve endüstriyel iklimlendirmede standartları belirliyor.', 
    country: 'İtalya',
    founded: 1954,
    headquarters: 'Tribiano, Milan',
    website: 'https://www.vortice.it',
    specialty: 'Aspiratörler & Isı Geri Kazanım'
  },
  { 
    name: 'Avens', 
    slug: 'avens', 
    description: 'Yüksek performanslı endüstriyel havalandırma ve klima santralleri çözümleri. Modern mühendislik yaklaşımlarıyla enerji verimliliği odaklı sistemler geliştirir.', 
    country: 'Türkiye',
    founded: 2010,
    headquarters: 'İstanbul',
    website: 'https://www.avens.com.tr',
    specialty: 'Endüstriyel Klima Santralleri'
  },
  { 
    name: 'Casals', 
    slug: 'casals', 
    description: '140 yılı aşkın endüstriyel fan üretim tecrübesi. En zorlu koşullarda bile çalışan yüksek performanslı havalandırma fanları ve yangın dayanımlı çözümler.', 
    country: 'İspanya',
    founded: 1881,
    headquarters: 'Girona',
    website: 'https://www.casals.com',
    specialty: 'Endüstriyel Fan Mühendisliği'
  },
  { 
    name: 'Nicotra Gebhardt', 
    slug: 'nicotra-gebhardt', 
    description: 'Alman mühendisliği ve İtalyan tasarımının birleşimiyle, endüstriyel santrifüj fanlarda dünyanın en geniş ve teknolojik ürün gamına sahip üreticisi.', 
    country: 'Almanya',
    founded: 1959,
    headquarters: 'Waldenburg',
    website: 'https://www.nicotra-gebhardt.com',
    specialty: 'Yüksek Verimli Santrifüj Fanlar'
  },
  { 
    name: 'Flexiva', 
    slug: 'flexiva', 
    description: 'Esnek hava kanalı teknolojilerinde Türkiye\'nin global markası. Patentli sızdırmazlık teknolojileri ve kolay montaj avantajıyla havalandırma projelerinin vazgeçilmezi.', 
    country: 'Türkiye',
    founded: 2000,
    headquarters: 'İstanbul',
    website: 'https://www.flexiva.com.tr',
    specialty: 'Esnek Hava Kanalları'
  },
  {
    name: 'Frekans Konvertörü',
    slug: 'frekans-konvertoru',
    description: 'Yüksek verimli hız kontrolü',
    country: 'DK',
    specialty: 'Hız Kontrol Cihazları'
  }
]
