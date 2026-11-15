-- URN-139 — Öneri kutusunda kategori ek toleransı ("hava perdesi" → "Hava Perdeleri")
--
-- OLGU (canlı, 2026-11-15): `get_search_suggestions('hava perdesi')` yalnız 4 ürün veriyordu, kategori satırı yoktu.
-- Kök: kategori kolu `arama_normalize(c.name) LIKE '%hava%perdesi%'` — kelimeler arası joker var ama EK TOLERANSI yok;
-- kategori adı "Hava Perdeleri" (çoğul) iken sorgu "perdesi" (iyelik) idi. Ürün kolu pgroonga gövdesiyle ek toleranslı
-- çalıştığı için tutuyordu; iki kol farklı normalleştirme kullanıyordu (cetvel K4.2 ruhu: aynı kural, iki uygulama olmaz).
--
-- ÇÖZÜM: kök (gövde) eşleşmesi. `arama_govde_kokleri` metni normalleştirir, dolgu sözcüklerini (tipi/ve/ile/type/and/with)
-- atar, çoğul/iyelik eklerini atar (Design `ekAt` kuralıyla aynı liste, ≥3 harf kök koşulu). Kategori eşleşir ⇔ sorgunun
-- HER kökü kategori adının bir kökünün başıdır. Eski alt-dize eşleşmesi KORUNUR (OR) — davranış yalnız genişler.
-- Sıra: kök kümesi aynı olan önce, sonra seviye, ad.
--
-- NE DEĞİŞMİYOR: ürün ve marka kolları, SECURITY INVOKER (K7.1), RLS, dönüş şekli.
-- Cetvel: docs/standards/arama-standard.md (K5.3 şema-nitelikli çağrı, K13.4 kontrol listesi) · Kart: URN-139 / URN-165.

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

create or replace function public.arama_govde_kokleri(p_t text)
returns text[]
language sql
immutable
set search_path to 'pg_catalog', 'public', 'extensions'
as $$
  select coalesce(array_agg(x.k order by x.ord), '{}'::text[])
  from (
    select w.ord,
           coalesce(
             (select left(w.kel, length(w.kel) - length(e.ek))
                from unnest(array['larinin','lerinin','larini','lerini','lari','leri','lar','ler',
                                  'inin','unun','nin','nun','si','su','i','u']) with ordinality as e(ek, o)
               where length(w.kel) - length(e.ek) >= 3 and w.kel like '%' || e.ek
               order by e.o
               limit 1),
             w.kel) as k
      from unnest(string_to_array(public.arama_normalize(p_t), ' ')) with ordinality as w(kel, ord)
     where w.kel <> '' and w.kel <> all (array['tipi','ve','ile','type','and','with'])
  ) x
$$;

-- K13.4 madde 2: yeni fonksiyon PUBLIC'e AÇIK doğar (pg_default_acl); önce geri al, sonra hedefli ver.
-- Fonksiyon SALT OKUMA ve saf (tablo okumaz); ziyaretçi/müşteri rolünün çağırması gerekir (dış uç SECURITY INVOKER).
revoke all on function public.arama_govde_kokleri(text) from public;
grant execute on function public.arama_govde_kokleri(text) to anon, authenticated;

create or replace function public.get_search_suggestions(p_q text, p_limit integer default 6)
returns table(type text, label text, url text, metadata jsonb)
language plpgsql
stable
set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit int;
  v_raw   text;
  v_norm  text;
  v_kok   text[];
begin
  v_limit := least(greatest(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  if v_raw = '' then return; end if;
  v_norm  := public.arama_normalize(v_raw);
  v_kok   := public.arama_govde_kokleri(v_raw);

  return query
  (
    -- Ürünler (en çok 4) — TEK gövdeden, fts_search_products ile AYNI sıra (K3.1e).
    select 'product'::text,
           p.name::text,
           (case
              when f.slug is not null and p.sku is not null then '/products/' || f.slug || '?sku=' || p.sku
              when f.slug is not null then '/products/' || f.slug
              when p.slug is not null then '/products/' || p.slug
              else '/products/' || p.id::text
            end)::text,
           jsonb_build_object(
             'sku', p.sku,
             'brand', coalesce(p.brand, ''),
             'model_code', coalesce(p.model_code, ''),
             'family_slug', f.slug)
      from public.arama_eslesen_urunler(v_raw) e
      join public.products p on p.id = e.product_id
      join public.product_search_index psi on psi.product_id = p.id
      left join public.product_families f on f.id = p.family_id and f.deleted_at is null
     where p.status = 'active' and p.deleted_at is null
     order by e.basamak,
              public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), v_raw) desc,
              ts_rank(psi.search_document, plainto_tsquery('turkish', v_raw)) desc,
              p.name
     limit least(v_limit, 4)
  )
  union all
  (
    -- Kategoriler (en çok 2) — aksan/TR körlüğü + EK TOLERANSI (URN-139): eski alt-dize eşleşmesi KORUNUR,
    -- sorgunun her kökü adın bir kökünün başıysa da eşleşir ("perdesi" ↔ "Perdeleri").
    select 'category'::text, c.name::text, ('/category/' || c.slug)::text,
           jsonb_build_object('level', c.level, 'slug', c.metadata->'slug')
      from public.categories c
     where c.is_active = true
       and (
         public.arama_normalize(c.name) like '%' || replace(v_norm,' ','%') || '%'
         or (
           cardinality(v_kok) > 0
           and not exists (
             select 1 from unnest(v_kok) q(k)
              where not exists (
                select 1 from unnest(public.arama_govde_kokleri(c.name)) n(k) where n.k like q.k || '%'
              )
           )
         )
       )
     order by (public.arama_govde_kokleri(c.name) = v_kok) desc, c.level, c.name
     limit 2
  )
  union all
  (
    select distinct on (p.brand)
           'brand'::text, p.brand::text, ('/products?brand=' || p.brand)::text, jsonb_build_object()
      from public.products p
     where p.status = 'active' and p.deleted_at is null and p.brand is not null
       and public.arama_normalize(p.brand) like '%' || replace(v_norm,' ','%') || '%'
     order by p.brand
     limit 2
  )
  limit v_limit;
end;
$function$;

-- Dış uç yetkisi değişmedi (CREATE OR REPLACE mevcut GRANT'leri korur); yine de DOĞRULANIR (K13.3).
-- GUARD (K13.2 + K13.4/9): ZİYARETÇİ rolüyle ÇAĞIRIR; boş veritabanında NOTICE ile atlar (madde 6); sayı değil içerik ölçer.
do $$
declare
  v_kat int; v_hp int; v_hp_kat int; v_eski int; v_eski_kat int; v_urun int;
begin
  if has_function_privilege('anon', 'public.arama_govde_kokleri(text)', 'execute') is not true
     or has_function_privilege('anon', 'public.get_search_suggestions(text,integer)', 'execute') is not true then
    raise exception 'ARAMA ÖNERİ GUARD: ziyaretçi (anon) öneri ya da kök fonksiyonunu ÇAĞIRAMIYOR.';
  end if;
  if (select count(*) from public.categories where is_active) = 0 then
    raise notice 'ARAMA ÖNERİ GUARD ATLANDI — categories BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  -- Saf fonksiyon davranışı (veriden bağımsız).
  if public.arama_govde_kokleri('Hava Perdesi') is distinct from array['hava','perde']::text[]
     or public.arama_govde_kokleri('Hava Perdeleri') is distinct from array['hava','perde']::text[]
     or public.arama_govde_kokleri('Kanal Tipi Fanlar') is distinct from array['kanal','fan']::text[] then
    raise exception 'ARAMA ÖNERİ GUARD: arama_govde_kokleri beklenen kökleri vermedi.';
  end if;

  set local role anon;
  -- Veri bağımlı kol: katalogda adı "Hava Perdeleri" olan aktif kategori VARSA öneri onu getirmelidir.
  select count(*) into v_hp_kat from public.categories c
   where c.is_active and public.arama_govde_kokleri(c.name) @> array['hava','perde']::text[];
  select count(*) into v_hp from public.get_search_suggestions('hava perdesi', 8) where type = 'category';
  select count(*) into v_eski_kat from public.categories c
   where c.is_active and public.arama_normalize(c.name) like '%' || 'aksiyel' || '%';
  select count(*) into v_eski from public.get_search_suggestions('aksiyel', 8) where type = 'category';
  select count(*) into v_urun from public.get_search_suggestions('jet fan', 8) where type = 'product';
  reset role;

  if v_hp_kat > 0 and v_hp = 0 then
    raise exception 'ARAMA ÖNERİ GUARD: "hava perdesi" için kategori adayı % var ama öneri kategori vermedi.', v_hp_kat;
  end if;
  if v_eski_kat > 0 and v_eski = 0 then
    raise exception 'ARAMA ÖNERİ GUARD: eski alt-dize kolu bozuldu ("aksiyel" kategori adayı % var, öneri 0).', v_eski_kat;
  end if;
  if v_urun = 0 and exists (select 1 from public.product_search_index) then
    raise exception 'ARAMA ÖNERİ GUARD: ürün kolu bozuldu ("jet fan" ürün önerisi 0).';
  end if;
end;
$$;

commit;
