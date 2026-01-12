import { Category } from '../lib/supabase'

// Fallback metadata until DB migration is applied
// This allows us to deliver the UI immediately without blocking on SQL permissions

export const STATIC_CATEGORY_METADATA: Record<string, NonNullable<Category['metadata']>> = {
    // Main Category: Hava Perdeleri -> Showcase Mode
    'hava-perdeleri': {
        display_mode: 'showcase',
        hero_title: 'Hava Perdeleri',
        hero_description: 'İç mekan konforunu korurken enerji tasarrufu sağlayan profesyonel hava perdesi çözümleri.',
        showcase_images: [
            {
                desktop: '/images/category/hero-vortice.png',
                mobile: '/images/category/hero-vortice.png'
            }
        ],
        features: []
    },

    // Main Category: Fanlar -> Showcase Mode
    'fanlar': {
        display_mode: 'showcase',
        hero_title: 'Endüstriyel Fanlar',
        hero_description: 'Yüksek verimli, düşük gürültülü profesyonel fan çözümleri. Çatı tipi, kanal tipi, basınçlandırma ve daha fazlası.',
        features: []
    },

    // Main Category: Isı Geri Kazanım Cihazları -> Showcase Mode
    'isi-geri-kazanim-cihazlari': {
        display_mode: 'showcase',
        hero_title: 'Isı Geri Kazanım Cihazları',
        hero_description: 'Enerji tasarrufu ve temiz hava sağlayan profesyonel HRV/ERV sistemleri.',
        features: []
    },

    // Sub Category: Elektrikli Isıtıcılı -> Series Mode
    'elektrikli-isitici': {
        display_mode: 'series',
        hero_title: 'Elektrikli Isıtıcılı Seri',
        hero_description: 'Kış aylarında sıcak bir karşılama için elektrikli ısıtıcı desteği sunan profesyonel seri.',
        technical_summary: `
      <p>Elektrikli ısıtıcılı hava perdeleri, özellikle sık açılan kapılarda iç ortam sıcaklığını korumak ve ekstra ısıtma sağlamak için idealdir.</p>
      <ul>
        <li>Hızlı ısınan rezistans teknolojisi</li>
        <li>Termostat kontrollü sıcaklık ayarı</li>
        <li>Kablolu kumanda ile kolay kullanım</li>
      </ul>
    `,
        features: [
            { icon: 'sun', title: 'Sıcak Karşılama', description: 'Girişlerde konforlu bir sıcaklık bariyeri oluşturur' },
            { icon: 'zap', title: 'Yüksek Verim', description: 'Optimize edilmiş ısıtma elemanları ile maksimum performans' }
        ]
    },
    // Sub Category: Ortam Havalı -> Series Mode
    'ortam-havali': {
        display_mode: 'series',
        hero_title: 'Ortam Havalı Seri',
        hero_description: 'İzolasyon odaklı, ısıtıcısız yüksek verimli hava perdesi çözümleri.',
        technical_summary: `
      <p>Ortam havalı (ısıtıcısız) modeller, iç ve dış ortam sıcaklık farkının az olduğu yerlerde veya sadece hava, toz ve sinek izolasyonu amacıyla kullanılır.</p>
    `,
        features: [
            { icon: 'wind', title: 'Güçlü İzolasyon', description: 'Yüksek hava hızı ile tam koruma' },
            { icon: 'leaf', title: 'Enerji Dostu', description: 'Isıtma gideri olmadan maksimum tasarruf' }
        ]
    }
}

