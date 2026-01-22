/**
 * SINGLE SOURCE OF TRUTH FOR CATEGORY SLUGS
 * 
 * This registry mirrors the dynamic database data in the codebase.
 * It ensures that we always have compile-time access to valid category URLs.
 * 
 * Generated based on live site scrape: 2025-12-10
 */

export const CATEGORY_REGISTRY = {
    FANLAR: {
        slug: 'fanlar',
        name: 'Fanlar',
        subs: {
            // Aktif alt kategoriler (ürün barındıranlar)
            CATI_TIPI: 'cati-tipi-fanlar',
            DUMAN_EGZOZ: 'duman-egzoz-fanlari',
            DUVAR_TIPI: 'duvar-tipi-kompakt-aksiyal-fanlar',
            KANAL_TIPI: 'kanal-tipi-fanlar',
            OTOPARK_JET: 'otopark-jet-fanlari',
            ENDUSTRIYEL: 'endustriyel-fanlar',
            SIGINAK: 'siginak-havalandirma-fanlari',
            SESSIZ_KANAL: 'sessiz-kanal-tipi-fanlar',
            EC_MOTOR: 'ec-motor-fanlar' // Eski: nicotra-gebhardt-fanlar
            // Pasif (ürün yok): basinclandirma, konut-tipi, plug, santrifuj
        }
    },
    HAVA_PERDELERI: {
        slug: 'hava-perdeleri',
        name: 'Hava Perdeleri',
        subs: {
            ELEKTRIKLI: 'elektrikli-isitici',
            ORTAM_HAVALI: 'ortam-havali'
        }
    },
    ISI_GERI_KAZANIM: {
        slug: 'isi-geri-kazanim-cihazlari',
        name: 'Isı Geri Kazanım Cihazları',
        subs: {
            KONUT_TIPI: 'konut-tipi-isi-geri-kazanim',
            TICARI_TIP: 'ticari-tip-isi-geri-kazanim'
        }
    },
    HAVA_TEMIZLEYICILER: {
        slug: 'hava-temizleyiciler-anti-viral-urunler',
        name: 'Hava Temizleyiciler & Anti-Viral Ürünler',
        subs: {} // Seri adları kaldırıldı, düz liste yapısı
    },
    HIZ_KONTROL: {
        slug: 'hiz-kontrolu-cihazlari',
        name: 'Hız Kontrolü Cihazları',
        subs: {
            FREKANS_KONVERTOR: 'frekans-konvertorler' // Eski: danfoss
            // Pasif (ürün yok): hiz-anahtari
        }
    },
    AKSESUARLAR: {
        slug: 'aksesuarlar',
        name: 'Aksesuarlar',
        subs: {} // Ürünler ana kategoride, alt kategoriler kullanılmıyor
    },
    FLEXIBLE: {
        slug: 'flexible-hava-kanallari',
        name: 'Flexible Hava Kanalları',
        subs: {} // 0 subcategories in screenshot
    },
    NEM_ALMA: {
        slug: 'nem-alma-cihazlari',
        name: 'Nem Alma Cihazları',
        subs: {} // 0 subcategories in screenshot
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
