-- URN-85 · kategori slug indeksleri — GÖLGE DB SINAMASI (tek koşum, kendi kendini yoklar, işlem sonunda GERİ ALINIR).
--
-- NEREDE KOŞAR: YALNIZ `node scripts/db/golge-kur.mjs --ad <ad>` ile kurulmuş gölge veritabanında (canlıda ASLA:
-- tohum satırı yazar; işlem ROLLBACK ile biter ama canlıya yazan hiçbir şey koşmaz).
-- NASIL (gölge adı örnek):
--   docker exec -i supabase_db_venthub-hvac psql -U postgres -d golge_urn85_slug -v ON_ERROR_STOP=1 -X < scripts/db/checks/kategori-slug-tekillik-golge-sinama.sql
-- ÖN KOŞUL: 20261011100000_kategori_slug_dil_basina_tekil.sql gölgede uygulanmış olmalı (golge-kur taban tarihinden yeni
-- migration'ları kendisi uygular). Gölgede `categories` BOŞ olmalı (taban şema-yalnız); doluysa betik DURUR.
--
-- NE YAPAR: canlıyla aynı 35 satırı (kanonik, TR, üst, aktif) tohumlar, sonra 12 yazma denemesinin kabul/red sonucunu
-- sayar. Tetikler kapatılır (`session_replication_role = replica`): ölçülen YALNIZ indekstir; denetim izi/webhook/auth.uid()
-- gölge sınırları (golge-kur başlığı) sonucu bulandırmasın. Çıktı: etiket | beklenen | gözlenen | sonuç. Tek bir 'IHLAL' = indeks
-- ya da migration yanlış. Son satır özet. İşlem ROLLBACK ile biter: gölge temiz kalır, betik tekrar koşulabilir.
--
-- ÖLÇÜLDÜ (yerel PG 17.4 mini şema, 2026-10-11 — GÖLGE DEĞİL): 12 denemenin 12'si beklenen sonucu verdi. Gölgede KOŞULMADI.

begin;
set local session_replication_role = replica;

do $$
begin
  if exists (select 1 from public.categories) then
    raise exception 'URN-85 sinama: gölgede categories bos degil; baska veriyi ezmemek icin duruldu';
  end if;
  if (select count(*) from pg_indexes
       where schemaname = 'public' and tablename = 'categories'
         and indexname in ('categories_tr_slug_tenant_uq', 'categories_en_slug_tenant_uq')) <> 2 then
    raise exception 'URN-85 sinama: iki indeks yok; once 20261011100000_kategori_slug_dil_basina_tekil.sql gölgede uygulanmali';
  end if;
end $$;

insert into public.tenants (id, name) values
  ('00000000-0000-0000-0000-0000000000a1', 'urn85-a'),
  ('00000000-0000-0000-0000-0000000000a2', 'urn85-b');

insert into public.categories (name, slug, metadata, is_active, tenant_id)
select k, k, jsonb_build_object('slug', jsonb_build_object('tr', tr, 'en', k)), a, '00000000-0000-0000-0000-0000000000a1'
from (values
  ('air-curtains','hava-perdeleri',true),
  ('air-treatment','hava-sartlandirma',true),
  ('commercial-ventilation','ticari-havalandirma',false),
  ('control-systems','kontrol-ve-suruculer',true),
  ('fans','fanlar',true),
  ('heat-recovery-vmc','isi-geri-kazanim',true),
  ('residential-ventilation','konut-tipi-havalandirma',false),
  ('shelter-ventilation','siginak-havalandirma',true),
  ('accessories','aksesuarlar',true)
) as r(k, tr, a);

insert into public.categories (name, slug, metadata, is_active, parent_id, tenant_id)
select c.k, c.k, jsonb_build_object('slug', jsonb_build_object('tr', c.tr, 'en', c.k)), c.a, p.id, '00000000-0000-0000-0000-0000000000a1'
from (values
  ('axial-industrial-fans','aksiyel-fanlar',true,'fans'),
  ('bathroom-toilet-fans','banyo-tuvalet-fanlari',true,'fans'),
  ('cabinet-fans','hucreli-aspiratorler',true,'fans'),
  ('centrifugal-fans','radyal-fanlar',true,'fans'),
  ('chimney-fans','somine-ve-baca-fanlari',true,'fans'),
  ('corrosion-and-acid-resistant-fans','korozyona-ve-aside-dayanimli-fanlar',true,'fans'),
  ('dehumidifiers','nem-alma-cihazlari',true,'air-treatment'),
  ('duct-fans','kanal-tipi-fanlar',true,'fans'),
  ('ducted-central-hrv','kanalli-merkezi-uniteler',true,'heat-recovery-vmc'),
  ('electric-duct-heaters','elektrikli-kanal-isiticilari',true,'air-treatment'),
  ('electric-heated-air-curtains','elektrikli-isiticili-hava-perdeleri',true,'air-curtains'),
  ('ex-proof-atex-fans','ex-proof-atex-fanlar',false,'fans'),
  ('frequency-converters','frekans-konvertorleri',true,'control-systems'),
  ('industrial-ceiling-fans','tavan-vantilatorleri',true,'fans'),
  ('inline-duct-fans','kanal-ici-hayalet-fanlar',false,'residential-ventilation'),
  ('jet-fans','otopark-jet-fanlari',false,'fans'),
  ('parking-jet-fan','otopark-jet-fan',false,'fans'),
  ('plug-fans','plug-fanlar',true,'fans'),
  ('rectangular-duct-fans','dikdortgen-kanal-fanlari',false,'commercial-ventilation'),
  ('roof-fans','cati-tipi-fanlar',true,'fans'),
  ('single-room-hrv','tek-oda-uniteleri',true,'heat-recovery-vmc'),
  ('smoke-exhaust-fans','duman-egzoz-fanlari',true,'fans'),
  ('spare-parts-sensors','yedek-parcalar-ve-sensorler',true,'accessories'),
  ('speed-controllers','hiz-anahtarlari',true,'control-systems'),
  ('unheated-air-curtains','isiticisiz-hava-perdeleri',true,'air-curtains'),
  ('water-coil-duct-heaters','sulu-bataryalar',true,'air-treatment')
) as c(k, tr, a, pk)
join public.categories p on p.slug = c.pk;

do $$
declare
  v_adet integer;
begin
  select count(*) into v_adet from public.categories;
  if v_adet <> 35 then
    raise exception 'URN-85 sinama: tohum % satir (beklenen 35)', v_adet;
  end if;
end $$;

-- Tek deneme: komutu alt işlemde koşturur; kabul ya da kısıt adıyla red döner. Başarılı yazım işlem sonunda geri alınır.
create function pg_temp.urn85_dene(p_komut text) returns text
language plpgsql as $f$
declare
  v_kisit text;
begin
  execute p_komut;
  return 'KABUL';
exception
  when unique_violation then
    get stacked diagnostics v_kisit = constraint_name;
    return 'RED ' || v_kisit;
  when others then
    return 'HATA ' || sqlstate || ' ' || sqlerrm;
end
$f$;

with deneme (sira, etiket, beklenen, komut) as (
  values
  (1,  'T1 TR metadata ihlali',                         'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t1', 't1-yeni', '{"slug":{"tr":"hava-perdeleri","en":"t1-yeni"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (2,  'T2 admin formu: kanonik = baska TR, metadata yok', 'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t2', 'aksiyel-fanlar', '{"metric1":{"label":"","value":""}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (3,  'T3 EN ihlali',                                   'RED categories_en_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t3', 't3-yeni', '{"slug":{"tr":"t3-yeni","en":"air-curtains"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (4,  'T4 buyuk harf',                                  'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t4', 't4-yeni', '{"slug":{"tr":"Hava-Perdeleri","en":"t4-yeni"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (5,  'T5 alt kategori TR = kokun TR',                  'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, parent_id, tenant_id) select 't5', 't5-yeni', '{"slug":{"tr":"fanlar","en":"t5-yeni"}}', id, '00000000-0000-0000-0000-0000000000a1' from public.categories where slug = 'fans'$q$),
  (6,  'T6 diller arasi (indeks ENGELLEMEZ)',            'KABUL',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t6', 't6-yeni', '{"slug":{"tr":"t6-yeni-tr","en":"hava-perdeleri"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (7,  'T7 farkli kiraci, ayni TR',                      'KABUL',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t7', 't7-yeni', '{"slug":{"tr":"fanlar","en":"t7-yeni"}}', '00000000-0000-0000-0000-0000000000a2')$q$),
  (8,  'T8 UPDATE ile ihlal',                            'RED categories_tr_slug_tenant_uq',
       $q$update public.categories set metadata = jsonb_set(metadata, '{slug,tr}', '"fanlar"') where slug = 't6-yeni'$q$),
  (9,  'T9 ayni satirda TR = EN',                        'KABUL',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t9', 't9-yeni', '{"slug":{"tr":"t9-yeni","en":"t9-yeni"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (10, 'T10 pasif kategorinin adresi de korunur',        'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t10', 't10-yeni', '{"slug":{"tr":"ticari-havalandirma","en":"t10-yeni"}}', '00000000-0000-0000-0000-0000000000a1')$q$),
  (11, 'T11 kendi satirini ayni degerle guncelle',       'KABUL',
       $q$update public.categories set metadata = jsonb_set(metadata, '{slug,tr}', '"hava-perdeleri"') where slug = 'air-curtains'$q$),
  (12, 'T12 bos TR kanonige duser, baska satirin TR si', 'RED categories_tr_slug_tenant_uq',
       $q$insert into public.categories (name, slug, metadata, tenant_id) values ('t12', 'banyo-tuvalet-fanlari', '{"slug":{"tr":"","en":"t12-yeni"}}', '00000000-0000-0000-0000-0000000000a1')$q$)
),
sonuc as (
  select sira, etiket, beklenen, pg_temp.urn85_dene(komut) as gozlenen
    from deneme
)
select sira, etiket, beklenen, gozlenen,
       case when beklenen = gozlenen then 'OK' else 'IHLAL' end as sonuc
  from sonuc
union all
select 99, 'OZET', '12 OK', count(*) filter (where beklenen = gozlenen) || ' OK / ' || count(*) filter (where beklenen <> gozlenen) || ' IHLAL',
       case when count(*) filter (where beklenen <> gozlenen) = 0 then 'OK' else 'IHLAL' end
  from sonuc
order by 1;

rollback;
