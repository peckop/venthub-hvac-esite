-- URN-85 geri alma — 20261010090000_kategori_tr_adlari_design_csv.sql (yeni TR ad → eski TR ad). ELLE, tek işlem.
-- Not: tetik tersini de url_takma_adlari'na yazar; kanonik adres farklı olduğu için döngü oluşmaz.
-- Geri aldıktan sonra Design CSV ile adresler yeniden ayrışır: Pazar yayını bu migration'a bağlıdır, önce OPS'a haber ver.
begin;

update public.categories c
   set metadata = jsonb_set(c.metadata, '{slug,tr}', to_jsonb(g.eski_tr::text), false)
  from (values
    ('control-systems',         'kontrol-sistemleri',                 'kontrol-ve-suruculer'),
    ('air-treatment',           'iklimlendirme-ve-hava-sartlandirma', 'hava-sartlandirma'),
    ('water-coil-duct-heaters', 'sulu-batarya-kanal-tipi',            'sulu-bataryalar'),
    ('single-room-hrv',         'tekil-oda-uniteleri',                'tek-oda-uniteleri'),
    ('axial-industrial-fans',   'aksiyel-sanayi-fanlari',             'aksiyel-fanlar'),
    ('spare-parts-sensors',     'yedek-parca-ve-sensorler',           'yedek-parcalar-ve-sensorler'),
    ('bathroom-toilet-fans',    'banyo-ve-tuvalet-fanlari',           'banyo-tuvalet-fanlari'),
    ('industrial-ceiling-fans', 'endustriyel-tavan-vantilatorleri',   'tavan-vantilatorleri')
  ) as g(en_slug, eski_tr, yeni_tr)
 where c.slug = g.en_slug
   and c.metadata -> 'slug' ->> 'tr' = g.yeni_tr;

commit;
