-- Dile göre kategori slug'ları (docs/plans/slug-localization-2026-08-10.md SSOT)
-- 1) 9 alt-kategoride kanonik slug TR -> EN rename
-- 2) 26 kategoriye metadata.slug = {tr, en}
-- 3) 4 bozuk/eksik translation_key onarımı
-- NOT: kod dalgası (getLocalizedCategorySlug + 301 çözümü) ile AYNI merge'de gitmelidir.

begin;

-- === 1. Kanonik rename (alt kategoriler) ===
update categories set slug = 'bathroom-toilet-fans'       where slug = 'banyo-ve-tuvalet-fanlari';
update categories set slug = 'window-fans'                where slug = 'cam-ve-pencere-tipi-fanlar';
update categories set slug = 'inline-duct-fans'           where slug = 'kanal-ici-hayalet-fanlar';
update categories set slug = 'axial-industrial-fans'      where slug = 'aksiyel-sanayi-fanlari';
update categories set slug = 'roof-fans'                  where slug = 'cati-tipi-fanlar';
update categories set slug = 'centrifugal-fans'           where slug = 'radyal-fanlar';
update categories set slug = 'shelter-ventilation'        where slug = 'siginak-havalandirma';
update categories set slug = 'rectangular-duct-fans'      where slug = 'dikdortgen-kanal-fanlari';
update categories set slug = 'circular-duct-fans'         where slug = 'yuvarlak-kanal-tipi-fanlar';
update categories set slug = 'air-conditioning-solutions' where slug = 'iklimlendirme-cozumleri';
update categories set slug = 'ex-proof-atex-fans'         where slug = 'ex-proof-atex-fanlar';

-- === 2. metadata.slug = {tr, en} (en = kanonik kolonun kopyası) ===
with slug_map(canonical, tr_slug) as (values
  -- üst kategoriler
  ('residential-ventilation',    'konut-tipi-havalandirma'),
  ('commercial-ventilation',     'ticari-havalandirma'),
  ('industrial-ventilation',     'endustriyel-havalandirma'),
  ('heat-recovery-vmc',          'isi-geri-kazanim'),
  ('air-treatment',              'hava-sartlandirma'),
  ('air-conditioning',           'iklimlendirme'),
  ('electric-heating',           'elektrikli-isitma'),
  ('hygiene-sanitizer',          'hijyen-ve-sanitasyon'),
  ('industrial-ceiling-fans',    'endustriyel-tavan-vantilatorleri'),
  ('smart-home',                 'akilli-ev'),
  ('summer-ventilation',         'yaz-havalandirmasi'),
  ('accessories-components',     'aksesuarlar'),
  -- alt kategoriler (yeni kanonik adlarıyla)
  ('bathroom-toilet-fans',       'banyo-ve-tuvalet-fanlari'),
  ('window-fans',                'cam-ve-pencere-tipi-fanlar'),
  ('inline-duct-fans',           'kanal-ici-hayalet-fanlar'),
  ('axial-industrial-fans',      'aksiyel-sanayi-fanlari'),
  ('roof-fans',                  'cati-tipi-fanlar'),
  ('centrifugal-fans',           'radyal-fanlar'),
  ('shelter-ventilation',        'siginak-havalandirma'),
  ('rectangular-duct-fans',      'dikdortgen-kanal-fanlari'),
  ('circular-duct-fans',         'yuvarlak-kanal-tipi-fanlar'),
  ('air-conditioning-solutions', 'iklimlendirme-cozumleri'),
  ('ex-proof-atex-fans',         'ex-proof-atex-fanlar'),
  ('air-curtains',               'hava-perdeleri'),
  ('dehumidifiers',              'nem-alma-cihazlari'),
  ('jet-fans',                   'otopark-jet-fanlari'),
  ('smoke-exhaust-fans',         'duman-egzoz-fanlari')
)
update categories c
set metadata = coalesce(c.metadata, '{}'::jsonb)
  || jsonb_build_object('slug', jsonb_build_object('tr', m.tr_slug, 'en', m.canonical))
from slug_map m
where c.slug = m.canonical;

-- === 3. translation_key onarımı (sözlük anahtarları kod dalgasında ekleniyor) ===
update categories set translation_key = 'sub.rect-duct'  where slug = 'rectangular-duct-fans';
update categories set translation_key = 'sub.round-duct' where slug = 'circular-duct-fans';
update categories set translation_key = 'sub.exproof'    where slug = 'ex-proof-atex-fans';
update categories set translation_key = 'sub.shelter'    where slug = 'shelter-ventilation';

commit;
