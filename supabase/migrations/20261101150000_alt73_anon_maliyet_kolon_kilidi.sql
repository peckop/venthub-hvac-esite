-- ALT-73 AŞAMA A — anon rolü products'ın MALİYET KOLONLARINI okuyamaz (karar 412 (a): canlıda bugün zarar).
-- Cetvel: docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md (§1.1, §1.2, §1.5, §2 kabul 2) ·
--         migration-safety-standard.md (Guard A/E) · db-grant-hygiene-standard.md · CLAUDE.md kural 12/13/14.
--
-- ÖLÇÜLEN DURUM (canlı DB, salt okuma, 2026-11-01; değerler hiçbir yere yazılmadı, yalnız sayı):
--   anon, public.products üzerinde tablo düzeyi SELECT'e sahipti; 7 maliyet kolonu okunabiliyordu
--   (purchase_price 442/442 dolu, cost_in_base 348 dolu). Sitenin istemci paketindeki genel anahtar yeter.
--   products hiçbir yayında (Realtime) yok. Vitrin (anon) kodu 7 kolonun HİÇBİRİNİ sorgulamıyor
--   (açık kolon listeleri, src/lib/services/product.columns.ts); Edge fonksiyonlarında adları geçmiyor.
--
-- NE YAPAR:
--   1) display_price(uuid) aşırı yüklemesi eklenir. Mevcut display_price(p products) gövdesinde YALNIZ p.id
--      kullanıyor; ama `display_price(p)` tüm-satır referansı çağıranın sorgusunda "tablonun TÜM kolonlarına
--      SELECT" ister (SECURITY DEFINER bunu çözmez) ve kolon kilidinde "permission denied" verir (plan §1.5).
--      Bu yüzden anon'un çağırdığı DÖRT fonksiyon (get_display_prices, fts_search_products, get_family_detail,
--      get_product_families_enriched) display_price(p.id) çağıracak biçimde yeniden yazılır. YALNIZ o çağrı
--      satırı değişir; gövdenin geri kalanı canlıdaki tanımla birebir aynıdır.
--      display_price(p products) DEĞİŞMEZ (service_role/Edge hesaplanan kolon olarak kullanabilir).
--   2) anon'dan products tablo düzeyi SELECT alınır; 7 hassas kolon DIŞINDAKİ her kolon için kolon düzeyi
--      SELECT verilir (kolon listesi information_schema'dan üretilir, elle yazılmaz).
--   3) Koruma bloğu (Guard E): migration KENDİ İÇİNDE anon rolüne geçip hassas kolon okumanın reddedildiğini
--      ve vitrin RPC'lerinin çalıştığını sınar; biri başarısızsa migration TAMAMEN geri döner.
--
-- NE YAPMAZ (adıyla):
--   - `authenticated` rolüne DOKUNMAZ. Kayıt açık olduğundan giriş yapmış herkes bu kolonları hâlâ okuyabilir;
--     admin ekranları (AdminDashboardPage, PricePreviewPanel, pricingAdmin/pricingMaterialize, ProductFormModal,
--     InventoryTableBody) bu kolonları authenticated ile products'tan okur/yazar. Kapanışı AŞAMA B'dir
--     (admin okuyucularının product_costs'a geçişi + authenticated kolon kilidi, ayrı PR).
--   - anon'un tablo düzeyi INSERT/UPDATE/DELETE/TRUNCATE yetkilerine dokunmaz (REC-140 kartı; yeni-site, karar 412).
--
-- ⚠ BEDELİ (adıyla): products'a bundan sonra eklenecek her YENİ kolon anon için OKUNAMAZ olur (varsayılan
--   yetki yok). Vitrin o kolonu seçerse ilk istekte 42501 (permission denied) alır — sessiz değil, yüksek sesle.
--   Yeni kolon migration'ı `grant select (<kolon>) on public.products to anon;` satırını TAŞIMALIDIR.
--   Kapı: src/__tests__/conformance/maliyet-kolon-anon-kilidi.test.ts (statik) +
--   scripts/db/checks/maliyet-kolon-nobetcisi.mjs (canlı katalog, INV-MALIYET-KOLON-2).
--
-- GERİ ALMA: scripts/db/rollback/20261101150000_alt73_anon_maliyet_kolon_kilidi_geri_al.sql
--   (otomatik uygulanmaz; tablo düzeyi SELECT'i anon'a geri verir, dört fonksiyonu eski tanıma döndürür).

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

-- ============================================================================
-- 1) display_price(uuid): tüm-satır referansı gerektirmeyen eşdeğer
-- ============================================================================
create or replace function public.display_price(p_product_id uuid)
returns numeric
language sql
stable
set search_path to 'public', 'pg_catalog'
as $function$
  select case
           when pl.user_type = 'individual' then pp.gross_price
           else pp.net_price
         end
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
   where pp.product_id = p_product_id
     and pp.is_active = true
     and pp.currency = 'TRY'
   order by (pl.user_type = public.jwt_price_segment()) desc,  -- önce kendi segmentin
            (pl.user_type = 'individual') desc,                -- sonra herkese açık liste
            pp.valid_from desc
   limit 1
$function$;

-- ============================================================================
-- 2) Anon'un çağırdığı dört fonksiyon: YALNIZ display_price(p) -> display_price(p.id)
-- ============================================================================
create or replace function public.get_display_prices(p_product_ids uuid[])
returns table(product_id uuid, display_price numeric, tax_included boolean)
language sql
stable
set search_path to 'public', 'pg_catalog'
as $function$
  select p.id,
         public.display_price(p.id),
         public.jwt_price_segment() = 'individual'
    from public.products p
   where p.id = any(coalesce(p_product_ids, array[]::uuid[]))
$function$;

create or replace function public.fts_search_products(p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb)
returns table(id uuid, name text, sku text, brand text, price numeric, rank real, family_slug text, cover_image_path text)
language plpgsql
stable
set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit int;
  v_tsq   tsquery;
begin
  -- Tavan 500: kapı betiği geniş vakalarda GERÇEK sayıyı okuyabilsin diye (istemci 20 yollar).
  v_limit := least(greatest(p_limit, 1), 500);
  v_tsq   := plainto_tsquery('turkish', coalesce(p_q,''));

  return query
  select s.id, s.name, s.sku, s.brand, s.price,
         (s.metin_rank - (s.basamak::real / 100.0::real))::real as rank,   -- anlamı eskisiyle aynı
         s.family_slug, s.cover_image_path
    from (
      select p.id, p.name, p.sku, p.brand,
             public.display_price(p.id) as price,       -- INV-PRICE-1: ham p.price DEĞİL (ALT-73: tüm-satır yerine id)
             e.basamak,
             public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), p_q) as ad_isabet,
             ts_rank(psi.search_document, v_tsq) as metin_rank,
             f.slug as family_slug,
             img.path as cover_image_path
        from public.arama_eslesen_urunler(p_q) e
        join public.products p on p.id = e.product_id
        join public.product_search_index psi on psi.product_id = p.id
        left join public.product_families f
          on f.id = p.family_id and f.deleted_at is null
        left join lateral (
          select pi.path from public.product_images pi
           where pi.product_id = p.id
           order by pi.sort_order
           limit 1
        ) img on true
       where (
           (not (p_filters ? 'category_id'))
           or p.category_id = (p_filters->>'category_id')::uuid
           or p.subcategory_id = (p_filters->>'category_id')::uuid
         )
         and p.status = 'active'
         and p.deleted_at is null
    ) s
   -- K3.1e: sıra açık sütunlarla. Öneri kutusu AYNI dört anahtarı kullanır.
   order by s.basamak asc, s.ad_isabet desc, s.metin_rank desc, s.name asc
   limit v_limit;
end;
$function$;

create or replace function public.get_family_detail(p_slug text, p_lang text default 'tr'::text)
returns jsonb
language sql
stable
set search_path to 'public'
as $function$
  with lang as (
    select case when p_lang in ('tr', 'en') then p_lang else 'tr' end as v
  )
  select jsonb_build_object(
    'family', jsonb_build_object(
      'id', f.id,
      'name', f.name,
      'slug', f.slug,
      'series_code', f.series_code,
      'description', f.description,
      'brand_name', b.name,
      'category_id', f.category_id,
      'subcategory_id', f.subcategory_id,
      'meta_title', f.meta_title,
      'meta_description', f.meta_description
    ),
    -- W4b: gösterilen fiyatların KDV semantiği (bireysel/anon = KDV dahil)
    'price_tax_included', (public.jwt_price_segment() = 'individual'),
    'variants', (
      select coalesce(jsonb_agg(v.item order by v.sku), '[]'::jsonb)
        from (
          select p.sku,
                 jsonb_build_object(
                   'id', p.id,
                   'sku', p.sku,
                   'name', p.name,
                   'slug', p.slug,
                   'model_code', p.model_code,
                   -- W4b: ham p.price DEĞİL, motor fiyatı (INV-PRICE-1); ALT-73: tüm-satır yerine id
                   'price', public.display_price(p.id),
                   'stock_qty', p.stock_qty,
                   'technical_specs', p.technical_specs,
                   -- Genel açıklama: varyantın kendi dili yoksa aile açıklamasına düşer
                   'description', coalesce(
                     p.description_i18n ->> (select v from lang),
                     f.description ->> (select v from lang)
                   ),
                   'images', (
                     select coalesce(
                       jsonb_agg(jsonb_build_object(
                         'path', pi.path, 'alt', pi.alt, 'sort_order', pi.sort_order
                       ) order by pi.sort_order),
                       '[]'::jsonb
                     )
                     from product_images pi
                     where pi.product_id = p.id
                   )
                 ) as item
            from products p
           where p.family_id = f.id
             and p.status = 'active' and p.deleted_at is null
        ) v
    )
  )
    from product_families f
    join brands b on b.id = f.brand_id
   where f.slug = p_slug and f.deleted_at is null
   limit 1  -- UNIQUE (tenant_id, slug) — global tekil değil (B15)
$function$;

create or replace function public.get_product_families_enriched(p_category_ids uuid[] default null::uuid[], p_limit integer default 24, p_offset integer default 0, p_search_query text default null::text, p_brand text default null::text)
returns table(id uuid, name text, slug text, series_code text, description jsonb, brand_name text, category_id uuid, subcategory_id uuid, cover_image_path text, variant_count bigint, min_price numeric, total_count bigint)
language sql
stable
set search_path to 'public'
as $function$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description,
           b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order,
           count(p.id) as variant_count,
           -- W4b: ham p.price DEĞİL, motor cache'inden türetilmiş vitrin fiyatı (INV-PRICE-1); ALT-73: tüm-satır yerine id
           min(public.display_price(p.id)) as min_price
      from product_families f
      join brands b on b.id = f.brand_id
      -- inner join: aktif varyantı olmayan aile listeye hiç girmez
      join products p on p.family_id = f.id
       and p.status = 'active' and p.deleted_at is null
     where f.deleted_at is null
       and (p_category_ids is null
            or f.category_id = any(p_category_ids)
            or f.subcategory_id = any(p_category_ids))
       and (p_brand is null or b.name ilike p_brand)
       and (p_search_query is null
            or f.name ilike '%' || p_search_query || '%'
            or f.series_code ilike '%' || p_search_query || '%'
            or p.sku ilike '%' || p_search_query || '%'
            or p.name ilike '%' || p_search_query || '%'
            or p.model_code ilike '%' || p_search_query || '%')
     group by f.id, f.name, f.slug, f.series_code, f.description,
              b.name, f.category_id, f.subcategory_id, f.sort_order
  )
  select fam.id, fam.name, fam.slug, fam.series_code, fam.description,
         fam.brand_name, fam.category_id, fam.subcategory_id,
         cov.path as cover_image_path,
         fam.variant_count, fam.min_price,
         count(*) over () as total_count
    from fam
    left join lateral (
      -- deterministik kapak: sku sırasına göre ilk aktif varyantın ilk görseli
      select pi.path
        from product_images pi
        join products pv on pv.id = pi.product_id
       where pv.family_id = fam.id
         and pv.status = 'active' and pv.deleted_at is null
       order by pv.sku, pi.sort_order
       limit 1
    ) cov on true
   order by fam.sort_order, fam.name
   limit least(greatest(coalesce(p_limit, 24), 1), 96)
  offset greatest(coalesce(p_offset, 0), 0)
$function$;

-- ============================================================================
-- 3) anon: tablo düzeyi SELECT kalkar, hassas OLMAYAN her kolon için kolon düzeyi SELECT verilir
-- ============================================================================
do $kilit$
declare
  v_hassas  text[] := array['purchase_price', 'purchase_currency', 'purchase_rate_to_base', 'cost_in_base',
                            'last_purchase_cost', 'last_purchase_currency', 'last_purchased_at'];
  v_var     int;
  v_izinli  text;
  v_izinli_n int;
begin
  -- Guard A (fail-closed): beklenen 7 maliyet kolonu canlıda TAM olarak var mı? Değilse varsayım yanlış, dur.
  select count(*) into v_var
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name = any(v_hassas);
  if v_var <> 7 then
    raise exception 'DURDU: products üzerinde % maliyet kolonu bulundu (beklenen 7) — plan §1.2 ile canlı ayrışmış', v_var;
  end if;

  -- supplier_name canlıda yok (ölçüldü); ileride dönerse hassas sayılır.
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'products' and column_name = 'supplier_name') then
    v_hassas := v_hassas || 'supplier_name';
  end if;

  select string_agg(format('%I', column_name), ', ' order by ordinal_position), count(*)
    into v_izinli, v_izinli_n
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name <> all(v_hassas);
  if v_izinli is null or v_izinli_n < 10 then
    raise exception 'DURDU: anon için izinli kolon listesi beklenmedik (n=%)', coalesce(v_izinli_n, 0);
  end if;

  execute 'revoke select on public.products from anon';
  execute 'grant select (' || v_izinli || ') on public.products to anon';
end
$kilit$;

-- ============================================================================
-- 4) Guard E: anon rolüyle GERÇEKTEN sına; biri patlarsa migration tamamen geri döner
-- ============================================================================
do $guard$
declare
  v_hassas text[] := array['purchase_price', 'purchase_currency', 'purchase_rate_to_base', 'cost_in_base',
                           'last_purchase_cost', 'last_purchase_currency', 'last_purchased_at'];
  v_k       text;
  v_ids     uuid[];
  v_n       int;
  v_slug    text;
  v_izinli  text;
begin
  select string_agg(format('%I', column_name), ', ' order by ordinal_position) into v_izinli
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name <> all(v_hassas);

  set local role anon;

  -- (a) hassas kolonlar: ayrıcalık yok VE fiili okuma reddedilir
  foreach v_k in array v_hassas loop
    if has_column_privilege('anon', 'public.products', v_k, 'select') then
      raise exception 'DURDU: anon % kolonunu hâlâ okuyabiliyor', v_k;
    end if;
    begin
      execute format('select %I from public.products limit 1', v_k);
      raise exception 'DURDU: anon % kolonunu FİİLEN okuyabildi', v_k;
    exception when insufficient_privilege then
      null; -- beklenen
    end;
  end loop;

  -- (b) tüm-satır referansı ve select * reddedilir (bilinçli: vitrin açık kolon listesi kullanır)
  begin
    execute 'select p.* from public.products p limit 1';
    raise exception 'DURDU: anon select * ile products okuyabildi';
  exception when insufficient_privilege then
    null;
  end;

  -- (c) vitrin açık kolon listesi (hassas olmayan tüm kolonlar) çalışır
  execute 'select ' || v_izinli || ' from public.products limit 1';

  -- (d) vitrin RPC'leri anon ile çalışır ve veri döner
  select coalesce(array_agg(id), array[]::uuid[]) into v_ids
    from (select id from public.products where status = 'active' and deleted_at is null limit 50) s;
  if array_length(v_ids, 1) is null then
    raise exception 'DURDU: anon örnek ürün göremedi (RLS ya da veri)';
  end if;
  select count(*) into v_n from public.get_display_prices(v_ids);
  if v_n <> array_length(v_ids, 1) then
    raise exception 'DURDU: get_display_prices % satır döndü (beklenen %)', v_n, array_length(v_ids, 1);
  end if;
  select count(*) into v_n from public.get_product_families_enriched(null, 24, 0, null, null);
  if v_n = 0 then
    raise exception 'DURDU: get_product_families_enriched anon ile boş döndü';
  end if;
  perform 1 from public.fts_search_products('fan', 5, '{}'::jsonb);
  select slug into v_slug from public.product_families where deleted_at is null limit 1;
  if v_slug is null or public.get_family_detail(v_slug, 'tr') is null then
    raise exception 'DURDU: get_family_detail anon ile boş döndü';
  end if;

  reset role;
end
$guard$;

-- PostgREST şema önbelleği: yeni display_price(uuid) aşırı yüklemesi ve kolon yetkileri
notify pgrst, 'reload schema';

commit;
