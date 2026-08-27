-- Arama önerisi UUID adresi döndürüyor — dil sapıyor, üç gereksiz yönlendirme oluyor
--
-- BULGU (REC-79, 2026-08-26, CANLI ölçüm — Playwright, prod):
-- `/tr` ana sayfada "lineo" aratılıp öneriye tıklandığında:
--
--   307  /products/eb5d1303-4767-47ac-9c24-d1e24bfe90b3
--   308  /en/products/eb5d1303-4767-47ac-9c24-d1e24bfe90b3
--   308  /en/products/vortice-lineo-100-quiet-17160
--   200  /en/products/vortice-lineo-quiet?sku=VRT-17160
--
-- Müşteri TÜRKÇE sayfadaydı ve İNGİLİZCE sayfaya düştü. İki ayrı kusur üst üste bindi:
--   (1) İSTEMCİ: adres dil öneksiz `router.push`'a veriliyordu → middleware dili sayfadan
--       değil tarayıcı `Accept-Language`'inden çözüyordu. **Bu parça PR #832'de kapandı**
--       (`localizedHref` + INV-SEARCH-ROUTE-1 kapısı). Bu migration onu TEKRARLAMAZ.
--   (2) VERİ: RPC ürünün UUID adresini döndürüyor. UUID adresi ölü değildir
--       (`getProductBySlugOrId` tanır) ama PDP'ye varana kadar ÜÇ yönlendirme gerekir.
--       Bu dosyanın konusu (2)'dir.
--
-- KARDEŞ RPC ZATEN DOĞRU: `fts_search_products` 2026-08-14'te (20260814_search_fts_family_slug)
-- tam bu sebeple aile slug'ı döndürmeye başlamıştı. `get_search_suggestions` o düzeltmeden
-- pay almadı — aynı kusur iki RPC'de yaşadı, biri onarıldı, öteki unutuldu.
--
-- ÖLÇÜLMÜŞ DURUM (canlı DB, 2026-08-26):
--   · aktif ürün                              374
--   · ailesi olmayan aktif ürün                 0   → aile yolu bugün TÜM ürünleri kapsıyor
--   · ailesi kapatılmış (deleted_at) ürün       0
--   · status='active' AMA deleted_at dolu       0   → aşağıdaki filtrenin BUGÜNKÜ etkisi SIFIR
--   · aktif kategori                           31
--   · slug != metadata.slug.tr olan kategori   31   → TR'de kategori önerisi her zaman
--                                                     kanonik (EN) slug'a gidiyor
--
-- Kategori tarafı canlıda ölçüldü:
--   /tr/category/heat-recovery-vmc  →  308  /tr/category/isi-geri-kazanim
--   /tr/category/isi-geri-kazanim   →  200
-- Yani kategori önerisi de bir atlama harcıyor. RPC hangi dilde olduğumuzu BİLMEZ ve
-- bilmemelidir; doğru çözüm slug sözlüğünü metadata'da vermek ve yerelleştirmeyi
-- istemciye bırakmaktır (`getLocalizedCategorySlug` — SearchOverlay onu zaten kullanıyor).
--
-- NE DEĞİŞİYOR
--   1. Ürün adresi UUID yerine AİLE slug'ı + `?sku=`. Ailesi olmayan ürün için ürünün kendi
--      slug'ına düşülür; slug da yoksa UUID'ye. Yani hiçbir durumda adres KAYBOLMAZ —
--      sadece bugünkü 374 üründe kısa yol seçilir.
--   2. Ürün metadata'sına `family_slug` ve `sku` eklenir. İstemcinin adresi `Routes.product()`
--      ile KENDİ kurabilmesi için; rota şeklinin tek sahibi `utils/routes.ts` olsun diye.
--   3. Kategori metadata'sına `slug` sözlüğü (`{tr,en}`) eklenir → istemci yerelleştirir.
--   4. `deleted_at IS NULL` süzgeci eklenir (ürün ve aile). BUGÜNKÜ ETKİSİ SIFIRDIR ve bu
--      ölçüldü; gerekçesi bugünkü veri değil, kuralın kendisi: yumuşak silinmiş bir ürün
--      öneride görünüp kapalı bir sayfaya götürebilir ve hiçbir kapı bunu görmez.
--
-- DÖNÜŞ TİPİ DEĞİŞMİYOR (type, label, url, metadata) — bu yüzden `create or replace`
-- yeterlidir ve `drop` gerekmez. Kardeş migration'da drop şarttı çünkü OUT parametreleri
-- değişiyordu; drop mevcut GRANT'leri de götürdüğü için orada grant'ler elle geri verilmişti.
-- Burada grant KAYBOLMAZ; yine de aşağıdaki guard `anon` yetkisini AÇIKÇA doğrular —
-- "değişmedi" varsayımı ölçüm değildir.

begin;

create or replace function public.get_search_suggestions(
  p_q text,
  p_limit integer default 6
)
returns table(type text, label text, url text, metadata jsonb)
language plpgsql
stable
set search_path to 'pg_catalog', 'public'
as $function$
DECLARE
  v_limit int;
  v_raw text;
  v_like text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');

  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_like := '%' || replace(v_raw, ' ', '%') || '%';

  RETURN QUERY
  (
    -- Ürünler (en çok 4)
    SELECT
      'product'::text AS type,
      p.name::text AS label,
      -- Aile slug'ı + varyant seçimi. PDP bir AİLE slug'ı bekler, varyant `?sku=` ile
      -- seçilir; aile yoksa ürünün kendi slug'ı, o da yoksa UUID (adres asla kaybolmaz).
      (CASE
         WHEN f.slug IS NOT NULL AND p.sku IS NOT NULL
           THEN '/products/' || f.slug || '?sku=' || p.sku
         WHEN f.slug IS NOT NULL
           THEN '/products/' || f.slug
         WHEN p.slug IS NOT NULL
           THEN '/products/' || p.slug
         ELSE '/products/' || p.id::text
       END)::text AS url,
      jsonb_build_object(
        'sku', p.sku,
        'brand', coalesce(p.brand, ''),
        'model_code', coalesce(p.model_code, ''),
        -- İstemci adresi Routes.product() ile kendi kursun diye (rota şekli SSOT'ta kalsın).
        'family_slug', f.slug
      ) AS metadata
    FROM public.products p
    LEFT JOIN public.product_families f
      ON f.id = p.family_id AND f.deleted_at IS NULL
    WHERE p.status = 'active'
      AND p.deleted_at IS NULL
      AND (
        p.name ILIKE v_like
        OR p.sku ILIKE v_like
        OR p.model_code ILIKE v_like
        OR p.brand ILIKE v_like
      )
    ORDER BY
      CASE WHEN p.name ILIKE v_raw || '%' THEN 0 ELSE 1 END,
      p.is_featured DESC NULLS LAST,
      p.name
    LIMIT LEAST(v_limit, 4)
  )
  UNION ALL
  (
    -- Kategoriler (en çok 2)
    SELECT
      'category'::text AS type,
      c.name::text AS label,
      ('/category/' || c.slug)::text AS url,
      jsonb_build_object(
        'level', c.level,
        -- Kanonik slug EN'dir; görünen URL dile göre değişir. RPC dili BİLMEZ, bu yüzden
        -- sözlüğü verir ve yerelleştirmeyi istemciye bırakır (getLocalizedCategorySlug).
        'slug', c.metadata->'slug'
      ) AS metadata
    FROM public.categories c
    WHERE c.is_active = true
      AND c.name ILIKE v_like
    ORDER BY c.level, c.name
    LIMIT 2
  )
  UNION ALL
  (
    -- Markalar (en çok 2)
    SELECT DISTINCT ON (p.brand)
      'brand'::text AS type,
      p.brand::text AS label,
      ('/products?brand=' || p.brand)::text AS url,
      jsonb_build_object() AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND p.deleted_at IS NULL
      AND p.brand IS NOT NULL
      AND p.brand ILIKE v_like
    ORDER BY p.brand
    LIMIT 2
  )
  LIMIT v_limit;
END;
$function$;

-- === Guard ===
-- Niçin: bu dosya master'a inince prod'a OTOMATİK uygulanır (kural 13). Guard, "uygulandı"
-- ile "işe yaradı" arasındaki farkı kapatır — sessiz yarım uygulama burada patlar.
do $$
declare
  src text;
  v_uuid_url int;
  v_aile_url int;
begin
  select pg_get_functiondef(p.oid) into src
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_search_suggestions';

  if src is null then
    raise exception 'guard: get_search_suggestions tanımı okunamadı';
  end if;
  if src not like '%family_slug%' then
    raise exception 'guard: get_search_suggestions family_slug döndürmüyor — öneri UUID adresine geri döndü';
  end if;
  if src not like '%p.deleted_at IS NULL%' then
    raise exception 'guard: get_search_suggestions yumuşak silinmiş ürünü süzmüyor';
  end if;

  -- Yetki: create or replace grant'i düşürmez, ama bunu VARSAYMAK ölçüm değildir.
  if not has_function_privilege('anon', 'public.get_search_suggestions(text, integer)', 'execute') then
    raise exception 'guard: anon get_search_suggestions''ı çağıramıyor — arama önerisi anonimde ölür';
  end if;

  -- DAVRANIŞ kanıtı: tanımın metnini okumak yetmez, fonksiyonu ÇAĞIRIP çıktısına bakarız.
  -- "lineo" bugün canlıda dört ürün önerisi üretiyor ve hepsinin ailesi var.
  select count(*) filter (
           where s.type = 'product'
             and s.url ~ '^/products/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         ),
         count(*) filter (where s.type = 'product'
                            and (s.metadata->>'family_slug') is not null)
    into v_uuid_url, v_aile_url
    from public.get_search_suggestions('lineo', 6) s;

  if v_uuid_url > 0 then
    raise exception 'guard: "lineo" araması hâlâ % adet UUID adresi döndürüyor', v_uuid_url;
  end if;
  if v_aile_url = 0 then
    raise exception 'guard: "lineo" araması hiç ürün önerisi üretmedi ya da family_slug boş — kanıt YOK sayılır';
  end if;
end $$;

commit;
