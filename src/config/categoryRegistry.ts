/**
 * ARCHITECTURAL CATEGORY REGISTRY (SSOT)
 * 
 * This registry is now synchronized with the 12-family global standard.
 * It serves as the bridge between database slugs and UI components.
 */

export const CATEGORY_REGISTRY = {
    RESIDENTIAL: {
        slug: 'residential-ventilation',
        name: 'Konut Tipi Havalandırma',
        subs: {
            BATHROOM: 'banyo-ve-tuvalet-fanlari',
            WINDOW: 'cam-ve-pencere-tipi-fanlar',
            INLINE: 'kanal-ici-hayalet-fanlar'
        }
    },
    COMMERCIAL: {
        slug: 'commercial-ventilation',
        name: 'Ticari Havalandırma',
        subs: {
            AIR_CURTAIN: 'hava-perdeleri',
            CONDITIONING: 'iklimlendirme-cozumleri'
        }
    },
    INDUSTRIAL: {
        slug: 'industrial-ventilation',
        name: 'Endüstriyel Havalandırma',
        subs: {
            RADIAL: 'radyal-fanlar',
            ROOF: 'cati-tipi-fanlar',
            SMOKE: 'duman-egzoz-fanlari',
            JET: 'otopark-jet-fanlari',
            AXIAL: 'aksiyel-sanayi-fanlari'
        }
    },
    VMC: {
        slug: 'heat-recovery-vmc',
        name: 'Isı Geri Kazanım Üniteleri (VMC)',
        subs: {}
    },
    AIR_TREATMENT: {
        slug: 'air-treatment',
        name: 'Hava Şartlandırma',
        subs: {
            DEHUMIDIFIER: 'nem-alma-cihazlari'
        }
    },
    HYGIENE: {
        slug: 'hygiene-sanitizer',
        name: 'Hijyen ve Sanitasyon',
        subs: {}
    },
    SUMMER: {
        slug: 'summer-ventilation',
        name: 'Yaz Havalandırması',
        subs: {}
    },
    AC: {
        slug: 'air-conditioning',
        name: 'İklimlendirme (Klima)',
        subs: {}
    },
    HEATING: {
        slug: 'electric-heating',
        name: 'Elektrikli Isıtma',
        subs: {}
    },
    HVLS: {
        slug: 'industrial-ceiling-fans',
        name: 'Endüstriyel Tavan Vantilatörleri',
        subs: {}
    },
    ACCESSORIES: {
        slug: 'accessories-components',
        name: 'Aksesuarlar ve Bileşenler',
        subs: {}
    },
    SMART_HOME: {
        slug: 'smart-home',
        name: 'Akıllı Ev Sistemleri',
        subs: {}
    }
} as const;

/**
 * Helper to generate full category URL
 */
export const getCategoryUrl = (mainCatKey: keyof typeof CATEGORY_REGISTRY, subCatKey?: string) => {
    const main = CATEGORY_REGISTRY[mainCatKey];
    if (!subCatKey) return `/category/${main.slug}`;
    return `/category/${main.slug}/${subCatKey}`;
};
