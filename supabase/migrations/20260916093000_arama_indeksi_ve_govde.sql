-- REC-340 Faz 1 ADIM 2 — Arama gövdesinin onarımı (KS-4 + KS-6)
--
-- Cetvel: docs/standards/arama-standard.md · Plan: docs/plans/rec340-faz1-plan-2026-09-15.md
-- Recep onayı (karar 19, 2026-09-16): "19-20-21-22 evet" = Faz 1 Adım 2-3 başla.
--
-- ⛔KURAL 13: bu dosya master'a merge edilince prod DB'ye OTOMATİK uygulanır. Merge yalnız
--   Recep'in AÇIK onayıyla yapılır; şerit kendi merge etmez.
--
-- ============================================================================================
-- NİÇİN — ölçülmüş kök sebep (2026-09-16, canlı prod, SELECT)
-- ============================================================================================
-- Canlı `fts_search_products` gövdesi yalnız şunları arıyor:
--   name · model_code · sku · brand · description_i18n->>'tr' · technical_specs::text
-- Yani ürünün AİLESİ, KATEGORİSİ, ALT KATEGORİSİ ve ADININ İNGİLİZCESİ hiç aranmıyor.
-- Ölçülen sonuç (442 ürün, 441 aktif, 0 silinmiş):
--   "jet fan"            → 0    (ürün adında 'jet' VE 'fan' birlikte geçen ürün yok)
--   "asit dayanımlı fan" → 0    (terim yalnız ALT KATEGORİ adında geçiyor)
--   "banyo"              → 4
--
-- ============================================================================================
-- ⭐PLANDAN İKİ SAPMA — ikisi de ölçümle gerekçeli, ikisi de bilinçli
-- ============================================================================================
--
-- SAPMA 1 — Gövde `products` tablosunda DEĞİL, AYRI tabloda (`product_search_index`).
--   Plan "products'a normal tsvector sütunu" diyordu. Bugün ölçülen iki yan etki bunu
--   pahalı yapıyor:
--     (a) `products_set_updated_at` BEFORE UPDATE tetiği KOŞULSUZ `updated_at := now()`
--         yazıyor → türetilmiş sütunu tazelemek ürünü "değişmiş" gösterir ve vitrin
--         önbelleğini boşuna tazeler.
--     (b) `on_products_change` AFTER INSERT/UPDATE/DELETE tetiği KOŞULSUZ
--         `handle_supabase_webhook()` çağırıyor (Vault'tan sır okur + net.http_post) →
--         442 satırlık ilk doldurma 442 webhook POST'u üretirdi.
--   Planın çözümü "toplu yazmada products webhook tetiğini atla" idi; bu her tazelemede
--   `ALTER TABLE ... DISABLE TRIGGER` yani ACCESS EXCLUSIVE kilit demek ve o kilit
--   penceresinde GERÇEK ürün değişikliklerinin webhook'u da kaybolur.
--   ⭐Ayrı tablo bu sınıfı kökten kaldırır: `products`'a HİÇ yazılmaz, dolayısıyla ne
--   webhook ne `updated_at` ne denetim izi tetiklenir. Geri alma da tek DROP.
--
-- SAPMA 2 — `fts_search_products` bu adımda yeni indekse BAĞLANIR (plan bunu Adım 4'e
--   koymuştu). Gerekçe kural 14 (tam iş): bağlanmayan bir indeks ölü koddur, dokuz vakanın
--   hiçbirini düzeltmez ve "Adım 2 bitti" beyanı ölçülemez olurdu.
--   Adım 4'e kalan: öneri kutusunun da aynı gövdeye bağlanması + istemcideki hata asimetrisi.
--
-- ============================================================================================
-- ⭐GÖVDEYE GİREN ALANLAR (SSOT — cetvel §3'e birebir taşınacak)
-- ============================================================================================
--   A ağırlığı : name · name_i18n->>'tr' · name_i18n->>'en'
--   B ağırlığı : model_code · sku · brand
--   C ağırlığı : aile adı (name, name_i18n TR/EN)
--   D ağırlığı : kategori adı · ALT KATEGORİ adı · açıklama TR/EN · technical_specs::text
--
-- ⭐ALT KATEGORİ, PLANDA YOKTU — 2026-09-16 ölçümüyle eklendi. `products` tablosunda kategori
--   bağı İKİ alanda: `category_id` (üst) VE `subcategory_id` (alt). 442 üründen 434'ü alt
--   kategorili, 18 alt kategori kullanımda. En kalabalıkları: Santrifüj/Radyal 133 ·
--   Asit Dayanımlı 80 · Kanal Tipi 43 · Banyo-Tuvalet 40 · Frekans Konvertörlü 35.
--
-- ⭐"ÜST KATEGORİ" AYRI JOIN GEREKTİRMİYOR — ölçüldü: alt kategorili 434 ürünün 434'ünde
--   `subcategory.parent_id = products.category_id`. Yani `category_id` zaten üst kategoridir;
--   planın "kategori adı + üst kategori adı" ifadesi bu veride aynı adı iki kez sayardı.
--
-- ⛔SINIR — KATEGORİ ADININ İNGİLİZCESİ VERİTABANINDA YOK (ölçüldü): `categories` tablosunda
--   `name_i18n` sütunu yok, `metadata` içinde yalnız `slug`/`description_i18n` var, EN ad
--   `translation_key` üzerinden KOD SÖZLÜĞÜNDEN (`common.categoryList.*`) çözülüyor. Bu yüzden
--   EN kullanıcı kategori adıyla arama yapamaz. Aile adının EN'i gövdede VAR (name_i18n).
--   Bu sınır cetvele yazılır; kapatılması ayrı iştir (kategori adı çevirisini DB'ye taşımak).
--
-- ============================================================================================
-- BU ADIMIN DÜZELTMEDİKLERİ (ölçüldü — Adım 3'e kalıyor, gizlenmiyor)
-- ============================================================================================
--   vaka  2 "havalandirma"          → 0 kalır (unaccent kurulu değil)
--   vaka  5 "vortis"                → 0 kalır (trigram yedeği Adım 3)
--   vaka  9 "duvar tipi aspiratör"  → 0 kalır (katı AND: 'duvar' & 'tip' & 'aspiratör' = 0)
--   vaka 10 "ISI GERI KAZANIM"      → 3 kalır (Türkçe küçültme I/ı — Adım 3)
-- Bu yüzden `BILINEN_KIRMIZI` ilanından bu adımda YALNIZ vaka 3 ve 4 düşer.
-- ⚠Kapı mandalı iki yönlü: ilanlı vaka geçmeye başlayınca kapı KIRMIZI verir ve satırı
--   sildirir. Kapı betiği ALTYAPI şeridinde (`scripts/db/checks/arama-davranisi.mjs`), o
--   yüzden satır silme notu PR açıklamasında ALTYAPI'ya bırakılır.

-- ⛔KİLİT KUYRUĞUNDA BEKLEYİP TABLOYU KİLİTLEMEK YERİNE HIZLI BAŞARISIZ OL.
-- INV-MIGRATION-3 (squawk) bu iki satırı arar ve haklı arıyor: bu dosya `products`,
-- `categories` ve `product_families` üzerine tetik ekliyor, yani ACCESS EXCLUSIVE kilit
-- istiyor. Zaman aşımı olmasaydı yoğun bir anda migration kilit kuyruğunda bekler ve o
-- süre boyunca vitrinin ürün sorgularını da durdururdu.
--
-- ⭐5 SANİYE ÖLÇÜMLE SEÇİLDİ, kopyalanmadı: en ağır ifade ilk doldurma (442 satırın gövdesi
--   + iki GIN indeksi). Canlıda `EXPLAIN ANALYZE` ile ölçüldü (2026-09-16, SELECT):
--   **170 ms**. Yani 5 sn ~29 kat pay bırakıyor; katalog on katına çıksa bile sığar.
set lock_timeout = '5s';
set statement_timeout = '5s';

begin;

-- ============================================================================================
-- 1 · YENİDEN İNDEKSLEME KUYRUĞU
-- ============================================================================================
-- Niçin kuyruk: bir kategori adı değişince o kategorinin BÜTÜN ürünleri tazelenmeli. En
-- kalabalık alt kategoride 133 ürün var; bunu tetiğin içinde satır satır yapmak yazma
-- işlemini uzatır ve kilit süresini şişirir. Tetik kuyruğa tek satır yazar, toplu tazeleme
-- pg_cron'da koşar.
create table if not exists public.search_reindex_queue (
  id          bigserial   primary key,
  kapsam      text        not null check (kapsam in ('urun', 'aile', 'kategori')),
  ref_id      uuid        not null,
  eklenme     timestamptz not null default now()
);

comment on table public.search_reindex_queue is
  'REC-340 Adim 2: arama govdesi tazeleme kuyrugu. Aile/kategori adi degisince buraya tek satir '
  'yazilir, pg_cron toplu tazeler. Urun degisikligi kuyruga GIRMEZ — tetikte aninda tazelenir.';

-- Aynı referans kuyrukta birden çok kez beklemesin (kategori adı üst üste düzeltilirse).
create unique index if not exists search_reindex_queue_tekil
  on public.search_reindex_queue (kapsam, ref_id);

-- Kuyruk iç mekanizma: kimse okumasın/yazmasın. RLS açık + politika YOK = yalnız tablo
-- sahibi ve SECURITY DEFINER fonksiyonlar erişir.
alter table public.search_reindex_queue enable row level security;

-- ============================================================================================
-- 2 · ARAMA İNDEKSİ TABLOSU
-- ============================================================================================
create table if not exists public.product_search_index (
  product_id      uuid        primary key references public.products(id) on delete cascade,
  tenant_id       uuid        not null,
  -- ILIKE ve (Adım 3'te) trigram benzerliği için ham metin. technical_specs BURAYA GİRMEZ:
  -- JSON anahtar adları ("airflow_m3h" gibi) benzerlik skorunu bozar ve indeksi şişirir.
  -- Ölçülen boyut: ortalama 307, en uzun 694 karakter.
  search_body     text        not null,
  -- Tam metin araması için ağırlıklı tsvector. Ağırlık NİÇİN: "fan" gibi tek kelimelik genel
  -- sorgu, kategori adı gövdeye girdiği için 360 ürün döndürüyor (ölçüldü; eski gövdede 157).
  -- Sayıyı kısmak yanlış olurdu — sitede 441 aktif ürünün çoğu gerçekten fan. Doğru çözüm
  -- SIRALAMA: adında geçen ürün, yalnız kategorisinde geçenden önce gelir.
  search_document tsvector    not null,
  updated_at      timestamptz not null default now()
);

comment on table public.product_search_index is
  'REC-340 Adim 2: urunun aranabilir govdesi. products tablosunda DEGIL cunku products uzerindeki '
  'on_products_change (webhook) ve products_set_updated_at tetikleri KOSULSUZ — turetilmis sutunu '
  'orada tutmak her tazelemede webhook firtinasi ve bosuna onbellek tazelemesi uretirdi.';

-- ⚠ŞEMA-NİTELİKLİ OPERATÖR SINIFI ZORUNLU: `gin_trgm_ops` **extensions** şemasında (ölçüldü:
-- pg_opclass → nspname='extensions'). Fonksiyonlarımız `SET search_path TO 'pg_catalog','public'`
-- taşıdığı için nitelenmemiş ad çalışma anında `42883` ile düşer — plan §6'daki search_path
-- tuzağı tam budur.
create index if not exists product_search_index_document_gin
  on public.product_search_index using gin (search_document);
create index if not exists product_search_index_body_trgm
  on public.product_search_index using gin (search_body extensions.gin_trgm_ops);
create index if not exists product_search_index_tenant_idx
  on public.product_search_index using btree (tenant_id);

-- Tenant izolasyonu (kural 12): okuma kendi tenant'ıyla sınırlı.
alter table public.product_search_index enable row level security;

drop policy if exists product_search_index_tenant_read on public.product_search_index;
create policy product_search_index_tenant_read
  on public.product_search_index
  for select
  using (tenant_id = (select public.jwt_tenant_id()));

-- Yazma politikası BİLİNÇLİ OLARAK YOK: bu tablo yalnız tetik ve cron tarafından,
-- SECURITY DEFINER fonksiyon üzerinden yazılır. Kullanıcı eli değmez.

-- ⚠YETKİ AÇIKÇA DARALTILIYOR — ölçüldü, varsayılmadı: `pg_default_acl` bu veritabanında
--   public şemasındaki HER yeni tabloya anon/authenticated için `arwdDxtm` (INSERT, SELECT,
--   UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER) veriyor. RLS zaten yazmayı reddederdi,
--   ama tek katmana güvenmek bu tabloda yanlış: içeriği ARAMA SONUCU, yani zehirlenirse
--   kullanıcıya yanlış ürün gösterir. İki katman (yetki + RLS) bilinçli.
revoke all on public.product_search_index from anon, authenticated;
grant select on public.product_search_index to anon, authenticated;

-- Kuyruk tamamen iç mekanizma: okuma da yazma da yok.
revoke all on public.search_reindex_queue from anon, authenticated;
revoke all on sequence public.search_reindex_queue_id_seq from anon, authenticated;

-- ============================================================================================
-- 3 · GÖVDE ÜRETİCİ / TAZELEYİCİ
-- ============================================================================================
-- ⚠SECURITY DEFINER gerekçesi: tetikten (yazan kullanıcının RLS'i altında) ve pg_cron'dan
--   (JWT yok) aynı fonksiyon koşuyor; INVOKER olsaydı cron kategori adını okuyamazdı.
-- ⛔PLAN §6'NIN RİSKİ ADIYLA KAPATILIYOR: DEFINER olduğu için RLS uygulanmaz, bu yüzden
--   tenant sınırı JOIN şartına ELLE yazılır (`... and X.tenant_id = p.tenant_id`). Bu şart
--   olmasa başka tenant'ın kategori adı ürün satırına KALICI olarak gömülürdü — geri
--   alınamayan bir sızıntı sınıfı.
create or replace function public.arama_indeksi_tazele(p_ids uuid[] default null)
returns integer
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
declare
  v_sayi integer;
begin
  insert into public.product_search_index
    (product_id, tenant_id, search_body, search_document, updated_at)
  select
    p.id,
    p.tenant_id,
    -- search_body: kimlik + açıklama (technical_specs HARİÇ, yukarıda gerekçeli)
    concat_ws(' ',
      p.name,
      p.name_i18n->>'tr',  p.name_i18n->>'en',
      p.model_code, p.sku, p.brand,
      f.name, f.name_i18n->>'tr', f.name_i18n->>'en',
      c.name, sc.name,
      p.description_i18n->>'tr', p.description_i18n->>'en'
    ),
    -- search_document: ağırlıklı. Varsayılan ts_rank dizisi {D,C,B,A}={0.1,0.2,0.4,1.0}.
      setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), '')), 'A')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        p.model_code, p.sku, p.brand), '')), 'B')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        f.name, f.name_i18n->>'tr', f.name_i18n->>'en'), '')), 'C')
   || setweight(to_tsvector('turkish', coalesce(concat_ws(' ',
        c.name, sc.name,
        p.description_i18n->>'tr', p.description_i18n->>'en',
        p.technical_specs::text), '')), 'D'),
    now()
  from public.products p
  left join public.product_families f
    on f.id = p.family_id
   and f.deleted_at is null
   and f.tenant_id = p.tenant_id          -- ⛔tenant sınırı (kural 12)
  left join public.categories c
    on c.id = p.category_id
   and c.tenant_id = p.tenant_id          -- ⛔tenant sınırı (kural 12)
  left join public.categories sc
    on sc.id = p.subcategory_id
   and sc.tenant_id = p.tenant_id         -- ⛔tenant sınırı (kural 12)
  where p_ids is null or p.id = any(p_ids)
  on conflict (product_id) do update
    set tenant_id       = excluded.tenant_id,
        search_body     = excluded.search_body,
        search_document = excluded.search_document,
        updated_at      = now();

  get diagnostics v_sayi = row_count;
  return v_sayi;
end;
$fn$;

comment on function public.arama_indeksi_tazele(uuid[]) is
  'REC-340 Adim 2: verilen urunlerin (NULL ise HEPSININ) arama govdesini yeniden uretir. '
  'SECURITY DEFINER — tenant siniri JOIN sartinda ELLE yazili (plan section 6).';

-- ============================================================================================
-- 4 · KUYRUK BOŞALTICI
-- ============================================================================================
create or replace function public.arama_kuyrugu_bosalt(p_tavan integer default 5000)
returns integer
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
declare
  v_ids   uuid[];
  v_sayi  integer := 0;
begin
  -- Kuyruktan alınan satırlar AYNI işlemde silinir; `for update skip locked` iki cron
  -- koşumunun çakışmasını engeller (pg_cron bir işi gecikirse üst üste binebilir).
  with alinan as (
    delete from public.search_reindex_queue q
     where q.id in (
       select id from public.search_reindex_queue
        order by id
        limit greatest(p_tavan, 1)
        for update skip locked
     )
    returning q.kapsam, q.ref_id
  )
  select array_agg(distinct p.id)
    into v_ids
    from alinan a
    join public.products p
      on (a.kapsam = 'urun'     and p.id             = a.ref_id)
      or (a.kapsam = 'aile'     and p.family_id      = a.ref_id)
      or (a.kapsam = 'kategori' and (p.category_id   = a.ref_id
                                  or p.subcategory_id = a.ref_id));

  if v_ids is null or cardinality(v_ids) = 0 then
    return 0;
  end if;

  v_sayi := public.arama_indeksi_tazele(v_ids);
  return v_sayi;
end;
$fn$;

comment on function public.arama_kuyrugu_bosalt(integer) is
  'REC-340 Adim 2: kuyrugu bosaltip etkilenen urunlerin arama govdesini tazeler. pg_cron kosar.';

-- ============================================================================================
-- 5 · TETİKLER
-- ============================================================================================

-- 5.1 · ÜRÜN — anında tazelenir (kuyruğa girmez, arama tazeliği gecikmesin).
-- ⚠`UPDATE OF <alan listesi>` ile sınırlı: stok/fiyat değişikliği gövdeyi etkilemez, boşuna
--   tazeleme yapılmaz. Liste gövdeye giren alanların TAM karşılığıdır.
create or replace function public.tg_arama_urun_tazele()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
begin
  perform public.arama_indeksi_tazele(array[new.id]);
  return null;  -- AFTER tetiği; dönüş değeri yok sayılır
end;
$fn$;

drop trigger if exists arama_urun_tazele on public.products;
create trigger arama_urun_tazele
  after insert or update of
    name, name_i18n, model_code, sku, brand, description_i18n, technical_specs,
    family_id, category_id, subcategory_id, status, deleted_at, tenant_id
  on public.products
  for each row
  execute function public.tg_arama_urun_tazele();

-- 5.2 · AİLE ADI — kuyruğa yazılır (bir aile çok ürün taşır).
create or replace function public.tg_arama_aile_kuyrukla()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
begin
  insert into public.search_reindex_queue (kapsam, ref_id)
  values ('aile', new.id)
  on conflict (kapsam, ref_id) do nothing;
  return null;
end;
$fn$;

drop trigger if exists arama_aile_kuyrukla on public.product_families;
create trigger arama_aile_kuyrukla
  after update of name, name_i18n on public.product_families
  for each row
  -- ⭐Koşul ŞART: bu tablo başka sebeplerle de güncelleniyor (sort_order, meta_*). Koşulsuz
  --   tetik kuyruğu boşuna doldurur ve cron her koşumda 442 satırı yeniden üretir.
  when (old.name is distinct from new.name or old.name_i18n is distinct from new.name_i18n)
  execute function public.tg_arama_aile_kuyrukla();

-- 5.3 · KATEGORİ ADI — kuyruğa yazılır (üst VE alt kategori aynı tabloda).
create or replace function public.tg_arama_kategori_kuyrukla()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public'
as $fn$
begin
  insert into public.search_reindex_queue (kapsam, ref_id)
  values ('kategori', new.id)
  on conflict (kapsam, ref_id) do nothing;
  return null;
end;
$fn$;

drop trigger if exists arama_kategori_kuyrukla on public.categories;
create trigger arama_kategori_kuyrukla
  after update of name on public.categories
  for each row
  when (old.name is distinct from new.name)
  execute function public.tg_arama_kategori_kuyrukla();

-- ============================================================================================
-- 6 · pg_cron İŞİ — kuyruğu beş dakikada bir boşaltır
-- ============================================================================================
-- pg_cron 1.6.4 KURULU (ölçüldü, pg_catalog şemasında) — `create extension` gerekmiyor.
-- Beş dakika NİÇİN: kategori adı değişimi nadir bir yönetim işlemi; ürün değişikliği zaten
-- anında tazeleniyor (5.1). Daha sık koşum boşa CPU, daha seyrek koşum aramada bayat kategori.
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('arama-kuyrugu-bosalt')
      where exists (select 1 from cron.job where jobname = 'arama-kuyrugu-bosalt');
    perform cron.schedule(
      'arama-kuyrugu-bosalt',
      '*/5 * * * *',
      $inner$ select public.arama_kuyrugu_bosalt() $inner$
    );
  else
    raise warning '[REC-340] pg_cron YOK — kuyruk otomatik bosalmayacak, aile/kategori adi '
                  'degisiklikleri aramaya YANSIMAZ. Elle: select public.arama_kuyrugu_bosalt();';
  end if;
end;
$cron$;

-- ============================================================================================
-- 7 · İLK DOLDURMA
-- ============================================================================================
-- ⭐Bu 442 satırlık yazma `products` tablosuna DOKUNMUYOR → ne webhook POST'u, ne updated_at
--   bump'ı, ne denetim izi satırı üretir. SAPMA 1'in bütün gerekçesi buydu.
select public.arama_indeksi_tazele(null::uuid[]);

-- ============================================================================================
-- 8 · ARAMA RPC'Sİ YENİ İNDEKSE BAĞLANIR
-- ============================================================================================
-- ⚠İMZA KORUNUR: `RETURNS TABLE` alanları birebir aynı (id, name, sku, brand, price, rank,
--   family_slug, cover_image_path). İstemci `product.service.ts` üzerinden bu alanları
--   okuyor; daraltma arama sonucunun ürüne gitmesini ve kapak görselini bozar.
-- ⚠`display_price(p)` KORUNUR (INV-PRICE-1) — ham `p.price` değil.
-- ⭐`deleted_at is null` EKLENDİ: `get_search_suggestions`'ta vardı, burada yoktu (KS-5).
--   Bugünkü etkisi sıfır (silinmiş ürün 0, ölçüldü); sıkı olan evren seçiliyor.
create or replace function public.fts_search_products(
  p_q       text,
  p_limit   integer default 20,
  p_filters jsonb   default '{}'::jsonb
)
returns table (
  id               uuid,
  name             text,
  sku              text,
  brand            text,
  price            numeric,
  rank             real,
  family_slug      text,
  cover_image_path text
)
language plpgsql
stable
set search_path to 'pg_catalog', 'public'
as $function$
declare
  v_limit          int;
  v_tsq            tsquery;
  v_raw            text;
  v_raw_wildcard   text;
begin
  -- ⭐TAVAN 100 → 500. Sebep ölçüm: kapı betiği `fts_search_products($1, 500, ...)` çağırıyor
  --   ama eski tavan 100 olduğu için kapı "fan" gibi geniş vakalarda GERÇEK sayıyı hiç
  --   göremiyordu — hep 100 okuyordu. Hassasiyet tavanını ölçen bir kapının kırpılmış sayı
  --   okuması, ölçütü sessizce kör eder. İstemci tarafı etkilenmez (overlay limit 20 yolluyor).
  v_limit        := least(greatest(p_limit, 1), 500);
  v_raw          := coalesce(p_q, '');
  v_raw_wildcard := replace(v_raw, ' ', '%');
  v_tsq          := plainto_tsquery('turkish', v_raw);

  return query
  select p.id, p.name, p.sku, p.brand,
         public.display_price(p) as price,          -- INV-PRICE-1: ham p.price DEĞİL
         ts_rank(psi.search_document, v_tsq) as rank,
         f.slug as family_slug,
         img.path as cover_image_path
    from public.products p
    join public.product_search_index psi
      on psi.product_id = p.id
    left join public.product_families f
      on f.id = p.family_id and f.deleted_at is null
    left join lateral (
      select pi.path from public.product_images pi
       where pi.product_id = p.id
       order by pi.sort_order
       limit 1
    ) img on true
   where (
     -- ILIKE dalı: sıra duyarlılığı Adım 3'te gevşetilecek (KS-2b). Bugün davranış korunuyor
     -- ki bu adımın etkisi YALNIZ gövde genişlemesi olsun ve ölçüm tek değişkenli kalsın.
     psi.search_body ILIKE '%' || v_raw_wildcard || '%'
     or p.technical_specs::text ILIKE '%' || v_raw || '%'
     or psi.search_document @@ v_tsq
   )
     and (
       (not (p_filters ? 'category_id'))
       or p.category_id = (p_filters->>'category_id')::uuid
       or p.subcategory_id = (p_filters->>'category_id')::uuid   -- alt kategori süzgeci de tutar
     )
     and p.status = 'active'
     and p.deleted_at is null
   order by rank desc nulls last, p.name asc
   limit v_limit;
end;
$function$;

-- ============================================================================================
-- 9 · GUARD — DAVRANIŞ ölçer, tanım metni okumaz
-- ============================================================================================
-- Plan §9: "her migration guard bloğu taşır ve guard DAVRANIŞ ölçer (tanım metni okumak
-- yetmez) — özellikle search_path tuzağı yalnız çalışma anında görüldüğü için."
do $guard$
declare
  v_aktif      integer;
  v_indeks     integer;
  v_jet_fan    integer;
  v_fan_jet    integer;
  v_asit       integer;
  v_banyo      integer;
  v_sku        integer;
  v_havaland   integer;
begin
  select count(*) into v_aktif
    from public.products where status = 'active' and deleted_at is null;

  select count(*) into v_indeks
    from public.product_search_index psi
    join public.products p on p.id = psi.product_id
   where p.status = 'active' and p.deleted_at is null;

  if v_indeks <> v_aktif then
    raise exception '[REC-340 guard] indeks EKSIK: aktif urun %, indekslenen % — ilk doldurma tamamlanmadi',
      v_aktif, v_indeks;
  end if;

  -- ⭐BOŞ VERİTABANI KOLU — bu satır GÖLGE KOŞUMUNDA doğdu (2026-09-16, yerel Postgres 17.4).
  --   Migration ilk yazımında veri olmayan bir veritabanında `"jet fan" hala 0` diyerek
  --   DÜŞÜYORDU. Prod'da sorun değildi (442 ürün var) ama sıfırdan kurulan her ortam —
  --   gölge, CI, yeni geliştirici makinesi — bu migration'da takılırdı.
  -- ⛔ATLANMIŞ İŞ YEŞİL DEĞİLDİR: atlama SESSİZ olmaz, NOTICE ile adıyla yazılır.
  if v_aktif = 0 then
    raise notice '[REC-340 guard] AKTIF URUN YOK — yapi kuruldu, DAVRANIS OLCUMU ATLANDI. '
                 'Bu kosumda arama davranisi HIC olculmedi.';
    return;
  end if;

  -- Bu adımın DÜZELTMESİ gereken vakalar (ölçülmüş beklenti: jet fan 61, fan jet 61)
  select count(*) into v_jet_fan from public.fts_search_products('jet fan', 500);
  select count(*) into v_fan_jet from public.fts_search_products('fan jet', 500);
  select count(*) into v_asit    from public.fts_search_products('asit dayanımlı fan', 500);
  select count(*) into v_banyo   from public.fts_search_products('banyo', 500);

  if v_jet_fan = 0 then
    raise exception '[REC-340 guard] "jet fan" hala 0 — govde genislemesi ETKI ETMEDI (KS-4 acik)';
  end if;
  if v_fan_jet <> v_jet_fan then
    raise exception '[REC-340 guard] "jet fan"=% ile "fan jet"=% AYNI DEGIL — kelime sirasi bagimliligi',
      v_jet_fan, v_fan_jet;
  end if;
  if v_asit = 0 then
    raise exception '[REC-340 guard] "asit dayanimli fan" hala 0 — ALT KATEGORI govdeye girmedi';
  end if;
  -- ⚠"banyo >= 10" KOLU KALDIRILDI (gölge koşumunda fark edildi): cetvel K8.3 sabit beklenen-sayı
  --   yasaklıyor — katalog şeridi ürün ekledikçe böyle bir eşik sahte kırmızı yakar. Alt kategori
  --   etkisini zaten `asit dayanımlı fan > 0` kanıtlıyor: o terim ürün adında ve açıklamasında
  --   HİÇ geçmiyor, yalnız alt kategori adında var (ölçüldü).

  -- REGRESYON: bugün kusursuz çalışan vaka bozulmamalı (plan §5, tartışmaya kapalı)
  select count(*) into v_sku from public.fts_search_products('VRT-17160', 500);
  if v_sku <> 1 then
    raise exception '[REC-340 guard] REGRESYON: "VRT-17160" % sonuc dondu, tam 1 olmali', v_sku;
  end if;

  select count(*) into v_havaland from public.fts_search_products('havalandırma', 500);
  if v_havaland = 0 then
    raise exception '[REC-340 guard] REGRESYON: "havalandirma" (noktali) 0 dondu';
  end if;

  raise notice '[REC-340 guard] GECTI — indeks % satir | jet fan % | fan jet % | asit % | banyo % | SKU % | havalandirma %',
    v_indeks, v_jet_fan, v_fan_jet, v_asit, v_banyo, v_sku, v_havaland;
end;
$guard$;

commit;
