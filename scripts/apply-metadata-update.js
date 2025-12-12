
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    {
        slug: 'fanlar',
        metadata: {
            display_mode: 'series',
            hero_title: 'Endüstriyel Havalandırma Çözümleri',
            hero_description: 'Yüksek performanslı, enerji verimli ve uzun ömürlü fan teknolojileri. Aksiyal, santrifüj ve jet fanlarda İtalyan mühendisliği.',
            technical_summary: '15,000+ m³/h Kapasite',
            features: [
                { icon: 'wind', title: 'Yüksek Performans', description: 'Optimize edilmiş kanat yapısı ile maksimum debi.' },
                { icon: 'zap', title: 'Enerji Verimliliği', description: 'EC motor teknolojisi ile %40\'a varan tasarruf.' }
            ]
        }
    },
    {
        slug: 'hava-perdeleri',
        metadata: {
            display_mode: 'series',
            hero_title: 'Ticari ve Endüstriyel Hava Perdeleri',
            hero_description: 'İşletmeniz için görünmez konfor bariyeri. İç ortam havasını korurken enerji tasarrufu sağlayın.',
            technical_summary: 'Görünmez Hava Bariyeri',
            features: [
                { icon: 'shield', title: 'İzolasyon', description: 'Dış ortam havasını ve tozunu etkili bir şekilde engeller.' },
                { icon: 'thermometer', title: 'İklim Koruma', description: 'Yazın serin, kışın sıcak havayı içeride tutar.' }
            ]
        }
    },
    {
        slug: 'isi-geri-kazanim-cihazlari',
        metadata: {
            display_mode: 'series',
            hero_title: 'Isı Geri Kazanım Sistemleri',
            hero_description: 'Taze hava kalitesinden ödün vermeden enerji tasarrufu yapın. %90\'a varan verimlilik.',
            technical_summary: '%90 Isı Verimliliği',
            features: [
                { icon: 'leaf', title: 'Eco-Friendly', description: 'Atık ısıyı geri kazanarak karbon ayak izini azaltır.' },
                { icon: 'activity', title: 'Hava Kalitesi', description: 'Sürekli taze hava sirkülasyonu sağlar.' }
            ]
        }
    },
    {
        slug: 'hava-temizleyiciler-anti-viral-urunler',
        metadata: {
            display_mode: 'showcase',
            hero_title: 'Profesyonel Hava Temizleme',
            hero_description: 'HEPA ve UV-C teknolojisi ile virüs, bakteri ve alerjenlerden arınmış temiz hava.',
            technical_summary: 'HEPA + UV-C Filtrasyon',
            features: [
                { icon: 'shield-check', title: 'Anti-Viral', description: 'UV-C teknolojisi ile patojenleri etkisiz hale getirir.' },
                { icon: 'sparkles', title: 'HEPA Filtre', description: '%99.97 partikül tutma kapasitesi.' }
            ]
        }
    },
    {
        slug: 'hiz-kontrolu-cihazlari',
        metadata: {
            display_mode: 'list',
            hero_title: 'Hassas Hız Kontrol Cihazları',
            hero_description: 'Fanlarınızın performansını optimize edin. Frekans invertörleri ve hız anahtarları.',
            technical_summary: 'Tam Kontrol',
            features: [
                { icon: 'settings', title: 'Hassas Ayar', description: 'İhtiyaca göre debi ve basınç kontrolü.' },
                { icon: 'cpu', title: 'Otomasyon', description: 'BMS sistemleri ile tam uyumlu entegrasyon.' }
            ]
        }
    },
    {
        slug: 'aksesuarlar',
        metadata: {
            display_mode: 'list',
            hero_title: 'HVAC Montaj Aksesuarları',
            hero_description: 'Profesyonel montaj için gerekli tüm bağlantı elemanları ve tamamlayıcı ürünler.',
            technical_summary: 'Tamamlayıcı Çözümler',
            features: [
                { icon: 'tool', title: 'Kolay Montaj', description: 'Uygulama süresini kısaltan pratik tasarımlar.' },
                { icon: 'layers', title: 'Dayanıklılık', description: 'Uzun ömürlü malzemelerden üretilmiştir.' }
            ]
        }
    },
    {
        slug: 'flexible-hava-kanallari',
        metadata: {
            display_mode: 'list',
            hero_title: 'Flexible Hava Kanalları',
            hero_description: 'Esnek, dayanıklı ve izolasyonlu hava taşıma çözümleri.',
            technical_summary: 'Esnek & Dayanıklı',
            features: [
                { icon: 'maximize', title: 'Esneklik', description: 'Dar alanlarda kolay uygulama imkanı.' },
                { icon: 'shield', title: 'İzolasyon', description: 'Isı ve ses yalıtımlı seçenekler.' }
            ]
        }
    },
    {
        slug: 'nem-alma-cihazlari',
        metadata: {
            display_mode: 'showcase',
            hero_title: 'Nem Alma Cihazları',
            hero_description: 'İdeal nem dengesi için endüstriyel ve ev tipi profesyonel çözümler.',
            technical_summary: 'Nem Kontrolü',
            features: [
                { icon: 'droplet', title: 'Nem Kontrolü', description: 'İstenmeyen nemi ve küf oluşumunu engeller.' },
                { icon: 'home', title: 'Konfor', description: 'Sağlıklı ve konforlu yaşam alanları yaratır.' }
            ]
        }
    }
];

async function apply() {
    console.log('--- Applying Category Metadata Updates ---');

    for (const update of updates) {
        console.log(`Updating ${update.slug}...`);
        const { error } = await supabase
            .from('categories')
            .update({ metadata: update.metadata })
            .eq('slug', update.slug);

        if (error) console.error(`Failed to update ${update.slug}:`, error);
        else console.log(`✓ Updated ${update.slug}`);
    }

    console.log('--- Done ---');
}

apply();
