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
            BASINCLANDIRMA: 'basinclandirma-fanlari',
            CATI_TIPI: 'cati-tipi-fanlar',
            DUMAN_EGZOZ: 'duman-egzoz-fanlari',
            DUVAR_TIPI: 'duvar-tipi-kompakt-aksiyal-fanlar',
            KANAL_TIPI: 'kanal-tipi-fanlar',
            OTOPARK_JET: 'otopark-jet-fanlari',
            ENDUSTRIYEL: 'endustriyel-fanlar',
            KONUT_TIPI: 'konut-tipi-fanlar',
            PLUG: 'plug-fanlar',
            SANTRIFUJ: 'santrifuj-fanlar',
            SIGINAK: 'siginak-havalandirma-fanlari',
            SESSIZ_KANAL: 'sessiz-kanal-tipi-fanlar',
            NICOTRA: 'nicotra-gebhardt-fanlar'
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
        subs: {
            DEPURO_PRO: 'depuro-pro',
            SG_DISPENSER: 'sg-dispenser',
            UV_LOGIKA: 'uv-logika',
            VORT_SUPER_DRY: 'vort-super-dry'
        }
    },
    HIZ_KONTROL: {
        slug: 'hiz-kontrolu-cihazlari',
        name: 'Hız Kontrolü Cihazları',
        subs: {
            DANFOSS: 'danfoss',
            HIZ_ANAHTARI: 'hiz-anahtari'
        }
    },
    AKSESUARLAR: {
        slug: 'aksesuarlar',
        name: 'Aksesuarlar',
        subs: {
            ALUMINYUM_BANT: 'aluminyum-folyo-bantlar',
            BAGLANTI_KONNEKTORU: 'baglanti-konnektoru',
            GEMICI_ANEMOSTADI: 'gemici-anemostadi',
            PLASTIK_KELEPCE: 'plastik-kelepceler'
        }
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
