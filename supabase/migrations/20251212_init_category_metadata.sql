-- Migration to initialize Category Metadata for new Landing Pages
-- Resolves "hybrid" data issues by moving hardcoded content into the database.

-- 0. Create metadata column if not exists
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 1. Fanlar (Industrial Fans)
UPDATE categories 
SET metadata = '{
  "display_mode": "series",
  "hero_title": "Endüstriyel Havalandırma Çözümleri",
  "hero_description": "Yüksek performanslı, enerji verimli ve uzun ömürlü fan teknolojileri. Aksiyal, santrifüj ve jet fanlarda İtalyan mühendisliği.",
  "technical_summary": "15,000+ m³/h Kapasite",
  "features": [
    { "icon": "wind", "title": "Yüksek Performans", "description": "Optimize edilmiş kanat yapısı ile maksimum debi." },
    { "icon": "zap", "title": "Enerji Verimliliği", "description": "EC motor teknolojisi ile %40''a varan tasarruf." }
  ]
}'::jsonb
WHERE slug = 'fanlar';

-- 2. Hava Perdeleri (Air Curtains)
UPDATE categories 
SET metadata = '{
  "display_mode": "series",
  "hero_title": "Ticari ve Endüstriyel Hava Perdeleri",
  "hero_description": "İşletmeniz için görünmez konfor bariyeri. İç ortam havasını korurken enerji tasarrufu sağlayın.",
  "technical_summary": "Görünmez Hava Bariyeri",
  "features": [
    { "icon": "shield", "title": "İzolasyon", "description": "Dış ortam havasını ve tozunu etkili bir şekilde engeller." },
    { "icon": "thermometer", "title": "İklim Koruma", "description": "Yazın serin, kışın sıcak havayı içeride tutar." }
  ]
}'::jsonb
WHERE slug = 'hava-perdeleri';

-- 3. Isı Geri Kazanım (Heat Recovery)
UPDATE categories 
SET metadata = '{
  "display_mode": "series",
  "hero_title": "Isı Geri Kazanım Sistemleri",
  "hero_description": "Taze hava kalitesinden ödün vermeden enerji tasarrufu yapın. %90''a varan verimlilik.",
  "technical_summary": "%90 Isı Verimliliği",
  "features": [
    { "icon": "leaf", "title": "Eco-Friendly", "description": "Atık ısıyı geri kazanarak karbon ayak izini azaltır." },
    { "icon": "activity", "title": "Hava Kalitesi", "description": "Sürekli taze hava sirkülasyonu sağlar." }
  ]
}'::jsonb
WHERE slug = 'isi-geri-kazanim-cihazlari';

-- 4. Hava Temizleyiciler
UPDATE categories 
SET metadata = '{
  "display_mode": "showcase",
  "hero_title": "Profesyonel Hava Temizleme",
  "hero_description": "HEPA ve UV-C teknolojisi ile virüs, bakteri ve alerjenlerden arınmış temiz hava.",
  "technical_summary": "HEPA + UV-C Filtrasyon",
  "features": [
    { "icon": "shield-check", "title": "Anti-Viral", "description": "UV-C teknolojisi ile patojenleri etkisiz hale getirir." },
    { "icon": "sparkles", "title": "HEPA Filtre", "description": "%99.97 partikül tutma kapasitesi." }
  ]
}'::jsonb
WHERE slug = 'hava-temizleyiciler-anti-viral-urunler';

-- 5. Hız Kontrolü
UPDATE categories 
SET metadata = '{
  "display_mode": "list",
  "hero_title": "Hassas Hız Kontrol Cihazları",
  "hero_description": "Fanlarınızın performansını optimize edin. Frekans invertörleri ve hız anahtarları.",
  "technical_summary": "Tam Kontrol",
  "features": [
    { "icon": "settings", "title": "Hassas Ayar", "description": "İhtiyaca göre debi ve basınç kontrolü." },
    { "icon": "cpu", "title": "Otomasyon", "description": "BMS sistemleri ile tam uyumlu entegrasyon." }
  ]
}'::jsonb
WHERE slug = 'hiz-kontrolu-cihazlari';

-- 6. Aksesuarlar
UPDATE categories 
SET metadata = '{
  "display_mode": "list",
  "hero_title": "HVAC Montaj Aksesuarları",
  "hero_description": "Profesyonel montaj için gerekli tüm bağlantı elemanları ve tamamlayıcı ürünler.",
  "technical_summary": "Tamamlayıcı Çözümler",
  "features": [
    { "icon": "tool", "title": "Kolay Montaj", "description": "Uygulama süresini kısaltan pratik tasarımlar." },
    { "icon": "layers", "title": "Dayanıklılık", "description": "Uzun ömürlü malzemelerden üretilmiştir." }
  ]
}'::jsonb
WHERE slug = 'aksesuarlar';

-- 7. Flexible Kanallar
UPDATE categories 
SET metadata = '{
  "display_mode": "list",
  "hero_title": "Flexible Hava Kanalları",
  "hero_description": "Esnek, dayanıklı ve izolasyonlu hava taşıma çözümleri.",
  "technical_summary": "Esnek & Dayanıklı",
  "features": [
    { "icon": "maximize", "title": "Esneklik", "description": "Dar alanlarda kolay uygulama imkanı." },
    { "icon": "shield", "title": "İzolasyon", "description": "Isı ve ses yalıtımlı seçenekler." }
  ]
}'::jsonb
WHERE slug = 'flexible-hava-kanallari';

-- 8. Nem Alma
UPDATE categories 
SET metadata = '{
  "display_mode": "showcase",
  "hero_title": "Nem Alma Cihazları",
  "hero_description": "İdeal nem dengesi için endüstriyel ve ev tipi profesyonel çözümler.",
  "technical_summary": "Nem Kontrolü",
  "features": [
    { "icon": "droplet", "title": "Nem Kontrolü", "description": "İstenmeyen nemi ve küf oluşumunu engeller." },
    { "icon": "home", "title": "Konfor", "description": "Sağlıklı ve konforlu yaşam alanları yaratır." }
  ]
}'::jsonb
WHERE slug = 'nem-alma-cihazlari';
