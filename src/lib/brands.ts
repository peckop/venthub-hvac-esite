export interface HVACBrand {
  name: string
  slug: string
  description: string
  country: string
  logo?: string
}

export const HVAC_BRANDS: HVACBrand[] = [
  { name: 'AVenS', slug: 'avens', description: 'Türk premium HVAC çözümleri', country: 'TR' },
  { name: 'Vortice', slug: 'vortice', description: 'İtalyan havalandırma teknolojisi', country: 'IT' },
  { name: 'Casals', slug: 'casals', description: 'İspanyol güvenilir çözümler', country: 'ES' },
  { name: 'Nicotra Gebhardt', slug: 'nicotra-gebhardt', description: 'Alman endüstriyel teknoloji', country: 'DE' },
  { name: 'Flexiva', slug: 'flexiva', description: 'Esnek kanal sistemleri', country: 'EU' },
  { name: 'Danfoss', slug: 'danfoss', description: 'İskandinav kontrol teknolojisi', country: 'DK' },
]
