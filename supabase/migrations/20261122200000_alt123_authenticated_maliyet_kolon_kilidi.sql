-- ALT-123 AŞAMA B — authenticated rolü products'ın MALİYET/TEDARİK kolonlarını okuyamaz (karar 412 (a): canlıda bugün zarar).
-- Cetvel: docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md (§1.1, §1.2, §2 kabul 3, §4 Faz 2-kod) ·
--         migration-safety-standard.md (Guard A/E) · db-grant-hygiene-standard.md · CLAUDE.md kural 12/13/14.
-- Önceki aşama: 20261101150000_alt73_anon_maliyet_kolon_kilidi.sql (anon). Bu dosya aynı kalıbın authenticated karşılığıdır.
--
-- ÖLÇÜLEN DURUM (canlı DB, salt okuma, 2026-11-22; değerler hiçbir yere yazılmadı, yalnız sayı):
--   authenticated, public.products üzerinde tablo düzeyi SELECT'e sahip; 8 maliyet/tedarik kolonu okunabiliyor.
--   Kayıt açık: giriş yapmış herhangi bir üye, satır politikası `prod_public_read_opt` (kiracı koşullu; jwt_tenant_id()
--   iddiasız oturumda varsayılan kiracıya döner) yüzünden bu kolonları tüm katalog için okuyabilir görünüyor.
--   public.product_costs (442 satır = 442 ürün, RLS: yalnız admin/super_admin SELECT) ve products→product_costs senkron
--   tetikleri HAZIR (Faz 1/2-DB). inventory_summary ve inventory_velocity (supplier_name, sermaye) product_costs'a bağlı.
--
-- KAPSAM — 8 kolon (7 maliyet + supplier_name): purchase_price, purchase_currency, purchase_rate_to_base, cost_in_base,
--   last_purchase_cost, last_purchase_currency, last_purchased_at, supplier_name.
--   ⚠SAPMA (adıyla): warehouse_location BU MİGRATION'DA KAPATILMAZ (anon'da kapalı, authenticated'da AÇIK kalır).
--   Sebep: inventory_velocity görünümü (security_invoker) ve InventoryTableBody yazımı warehouse_location'ı products'tan
--   authenticated ile okuyup yazar; kapatılırsa envanter ekranı yöneticiler için de kırılır. Depo konumu ayrı karar ve ayrı
--   iştir (plan: iç-operasyon sınıfı). low_stock_threshold/low_stock_override da kapsam dışıdır (vitrin listesinde).
--
-- NE YAPAR:
--   1) maliyet_yenile(jsonb) (INVOKER, authenticated EXECUTE) products'tan purchase_price/purchase_currency/cost_in_base/
--      purchase_rate_to_base OKUYORDU; kilitten sonra "permission denied" verirdi. Okuma product_costs'tan yapılacak
--      biçimde yeniden yazılır; YAZIM products'ta kalır (yazıcı kuralı, tetik product_costs'a taşır). Davranış ve hata
--      kodları aynıdır. INVOKER kalır: products UPDATE politikası ikinci savunma hattı olarak sürer.
--   2) authenticated'dan products tablo düzeyi SELECT alınır; 8 hassas kolon DIŞINDAKİ her kolon için kolon düzeyi
--      SELECT verilir (liste information_schema'dan üretilir, elle yazılmaz). INSERT/UPDATE/DELETE yetkilerine DOKUNULMAZ
--      (yöneticiler maliyeti products'a yazmaya devam eder; tetik product_costs'a taşır — Faz 3'e kadar).
--   3) Guard E: migration KENDİ İÇİNDE üye / moderatör / yönetici JWT claim'iyle (set local role authenticated) sınar;
--      biri başarısızsa migration TAMAMEN geri döner.
--
-- NE YAPMAZ: anon'a dokunmaz; service_role etkilenmez (kolon yetkisi kilidi onu bağlamaz); kolon silmez (Faz 3 ayrı).
--
-- ⚠ BEDELİ (adıyla): products'a bundan sonra eklenecek her YENİ kolon authenticated için OKUNAMAZ olur (varsayılan yetki
--   yok); oturumlu müşteri/yönetici sorgusu o kolonu seçerse 42501 alır — yüksek sesle. Yeni kolon migration'ı
--   `grant select (<kolon>) on public.products to anon, authenticated;` satırını TAŞIMALIDIR. Bekçi:
--   scripts/db/checks/maliyet-kolon-nobetcisi.mjs (authenticated ölçümü) + maliyet-kolon-authenticated-kilidi.test.ts.
-- ⚠ Tüm-satır referansı (`select p.*`, `display_price(p)`, `display_price_tax_included(p)` hesaplanan kolon olarak)
--   authenticated için de reddedilir (anon'da zaten öyle). Kodda ve SQL'de böyle çağıran YOK (ölçüldü 2026-11-22).
-- ⚠ ÖNKOŞUL: yönetici okuyucuları product_costs'a geçmiş kod CANLIDA olmalı (PR "okuyucu"); aksi hâlde AdminDashboard,
--   PricePreviewPanel, pricingAdmin/pricingMaterialize ve ProductFormModal products'tan maliyet okur ve 42501 alır.
--
-- GERİ ALMA: scripts/db/rollback/20261122200000_alt123_authenticated_maliyet_kolon_kilidi_geri_al.sql
--   (otomatik uygulanmaz; tablo düzeyi SELECT'i authenticated'a geri verir, maliyet_yenile'yi eski tanıma döndürür).

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- ============================================================================
-- 1) maliyet_yenile: okuma product_costs'tan, yazım products'a (davranış aynı)
-- ============================================================================
create or replace function public.maliyet_yenile(p_satirlar jsonb)
 returns integer
 language plpgsql
 security invoker
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_tavan     constant int := 5000;
  v_gelen     int;
  v_beklenen  int;
  v_say       int;
begin
  if not public.is_admin_claim() then
    raise exception 'maliyet_yenile: yalniz yonetici (JWT claim)' using errcode = '42501';
  end if;

  if p_satirlar is null or jsonb_typeof(p_satirlar) <> 'array' then
    raise exception 'maliyet_yenile: p_satirlar bir JSON dizisi olmali' using errcode = '22023';
  end if;

  v_gelen := jsonb_array_length(p_satirlar);
  if v_gelen > v_tavan then
    raise exception 'maliyet_yenile: parti siniri asildi (% > %); yarim yenileme yapilmaz', v_gelen, v_tavan
      using errcode = '54000';
  end if;

  -- Girdi doğrulaması yazımdan ÖNCE: tek bozuk eleman TÜM partiyi reddeder. NaN/Infinity açıkça elenir
  -- (`NaN >= 0` PostgreSQL'de DOĞRUDUR; kıyas tek başına yetmez — B2).
  if exists (
    select 1
      from jsonb_to_recordset(p_satirlar)
             as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
     where s.id is null
        or s.cost_in_base is null or s.cost_in_base < 0
        or s.cost_in_base = 'NaN'::numeric or s.cost_in_base = 'Infinity'::numeric
        or s.purchase_rate_to_base is null or s.purchase_rate_to_base <= 0
        or s.purchase_rate_to_base = 'NaN'::numeric or s.purchase_rate_to_base = 'Infinity'::numeric
        or s.purchase_price is null or s.purchase_currency is null
  ) then
    raise exception 'maliyet_yenile: eksik/gecersiz eleman (id, cost_in_base>=0, purchase_rate_to_base>0, purchase_price, purchase_currency zorunlu; NaN/Infinity yasak)'
      using errcode = '22023';
  end if;

  -- Aynı id iki kez: hangisinin kazanacağı belirsiz olurdu (B6) → tüm parti reddedilir.
  if (select count(distinct s.id)
        from jsonb_to_recordset(p_satirlar) as s(id uuid)) <> v_gelen then
    raise exception 'maliyet_yenile: ayni urun id birden fazla kez gonderildi (tum parti reddedildi)'
      using errcode = '22023';
  end if;

  -- Bu tenant'ta görünmeyen id: tüm parti reddedilir (RLS sessizce atlamasın → yarım yenileme olmaz).
  if exists (
    select 1
      from jsonb_to_recordset(p_satirlar) as s(id uuid)
     where not exists (
       select 1 from public.products p where p.id = s.id and p.tenant_id = public.jwt_tenant_id()
     )
  ) then
    raise exception 'maliyet_yenile: tenant disi ya da olmayan urun id (tum parti reddedildi)'
      using errcode = '22023';
  end if;

  -- Beklenen: şu an gerçekten DEĞİŞECEK satır sayısı (gelen değer sütun duyarlığına yuvarlanmış hâliyle).
  -- ALT-123: mevcut değerler products'tan DEĞİL product_costs'tan okunur (kolon yetkisi kilidi).
  select count(*) into v_beklenen
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
    join public.product_costs pc on pc.product_id = s.id and pc.tenant_id = public.jwt_tenant_id()
   where pc.cost_in_base is distinct from round(s.cost_in_base, 4)
      or pc.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6);

  update public.products p
     set cost_in_base = round(s.cost_in_base, 4),
         purchase_rate_to_base = round(s.purchase_rate_to_base, 6)
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text),
         public.product_costs pc
   where p.id = s.id
     and p.tenant_id = public.jwt_tenant_id()
     and pc.product_id = p.id
     and pc.tenant_id = p.tenant_id
     and pc.purchase_price = s.purchase_price
     and pc.purchase_currency::text = s.purchase_currency
     and (pc.cost_in_base is distinct from round(s.cost_in_base, 4)
          or pc.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6));
  get diagnostics v_say = row_count;

  -- Beklenenden az satır yazıldıysa YARIM yenileme olurdu: (a) INVOKER olduğu için `products` UPDATE politikası
  -- da uygulanır ve JWT'de admin olup profil rolü düşmüş biri sessizce 0 satıra inerdi (B1), (b) okuma ile yazma
  -- arasında bir ürünün alış fiyatı değişti (B8). İkisinde de TÜM parti geri alınır; istemci "yeniden deneyin" der.
  if v_say <> v_beklenen then
    raise exception 'maliyet_yenile: % satirdan % tanesi yazilabildi (yetki degisti ya da okumadan sonra urun fiyati degisti); tum parti geri alindi',
      v_beklenen, v_say using errcode = '40001';
  end if;

  return v_say;
end;
$function$;

-- ============================================================================
-- 2) authenticated: tablo düzeyi SELECT kalkar, hassas OLMAYAN her kolon için kolon düzeyi SELECT verilir
-- ============================================================================
do $kilit$
declare
  v_hassas   text[] := array['purchase_price', 'purchase_currency', 'purchase_rate_to_base', 'cost_in_base',
                             'last_purchase_cost', 'last_purchase_currency', 'last_purchased_at', 'supplier_name'];
  v_var      int;
  v_izinli   text;
  v_izinli_n int;
begin
  -- Guard A (fail-closed): beklenen 8 hassas kolon canlıda TAM olarak var mı? Değilse varsayım yanlış, dur.
  select count(*) into v_var
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name = any(v_hassas);
  if v_var <> 8 then
    raise exception 'DURDU: products üzerinde % hassas kolon bulundu (beklenen 8) — plan §1.2 ile canlı ayrışmış', v_var;
  end if;

  -- Guard A (2): product_costs yönetici okumasının dayanağı: her ürünün maliyet satırı var mı?
  if (select count(*) from public.products p
       where not exists (select 1 from public.product_costs pc where pc.product_id = p.id)) <> 0 then
    raise exception 'DURDU: product_costs satırı olmayan ürün var — yönetici okuması eksik veri görür';
  end if;

  select string_agg(format('%I', column_name), ', ' order by ordinal_position), count(*)
    into v_izinli, v_izinli_n
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name <> all(v_hassas);
  if v_izinli is null or v_izinli_n < 20 then
    raise exception 'DURDU: authenticated için izinli kolon listesi beklenmedik (n=%)', coalesce(v_izinli_n, 0);
  end if;

  execute 'revoke select on public.products from authenticated';
  execute 'grant select (' || v_izinli || ') on public.products to authenticated';
end
$kilit$;

-- ============================================================================
-- 3) Guard E: üye, moderatör ve yönetici JWT claim'iyle GERÇEKTEN sına; biri patlarsa migration tamamen geri döner
-- ============================================================================
do $guard$
declare
  v_hassas   text[] := array['purchase_price', 'purchase_currency', 'purchase_rate_to_base', 'cost_in_base',
                             'last_purchase_cost', 'last_purchase_currency', 'last_purchased_at', 'supplier_name'];
  v_uye      text := '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}';
  v_mod      text := '{"sub":"00000000-0000-4000-8000-0000000000c3","role":"authenticated","app_metadata":{"user_role":"moderator"}}';
  v_admin    text := '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated","app_metadata":{"user_role":"admin"}}';
  v_claim    text;
  v_k        text;
  v_n        int;
  v_toplam   int;
  v_izinli   text;
  v_ids      uuid[];
  v_json     jsonb;
begin
  -- Rol değiştirmeden ÖNCE (postgres, RLS dışı) gerçek durum ve test girdileri hazırlanır.
  select count(*) into v_toplam from public.product_costs where tenant_id = public.jwt_tenant_id();
  if v_toplam = 0 then
    raise exception 'DURDU: product_costs boş (varsayılan kiracı)';
  end if;

  select string_agg(format('%I', column_name), ', ' order by ordinal_position) into v_izinli
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products' and column_name <> all(v_hassas);

  select coalesce(array_agg(id), array[]::uuid[]) into v_ids
    from (select id from public.products where status = 'active' and deleted_at is null limit 50) s;
  if array_length(v_ids, 1) is null then
    raise exception 'DURDU: örnek aktif ürün yok';
  end if;

  -- maliyet_yenile için GERÇEKTEN DEĞİŞTİREN girdi (cost_in_base + 1): okuma yolu (product_costs), yazım yolu ve
  -- products üzerindeki tetikler (denetim özeti, product_costs senkronu) yönetici rolüyle sınanır; sonuç geri alınır.
  select jsonb_build_array(jsonb_build_object(
           'id', pc.product_id,
           'cost_in_base', pc.cost_in_base + 1,
           'purchase_rate_to_base', pc.purchase_rate_to_base,
           'purchase_price', pc.purchase_price,
           'purchase_currency', pc.purchase_currency))
    into v_json
    from public.product_costs pc
   where pc.tenant_id = public.jwt_tenant_id()
     and pc.cost_in_base is not null and pc.purchase_rate_to_base is not null and pc.purchase_rate_to_base > 0
     and pc.purchase_price is not null and pc.purchase_currency is not null
   limit 1;
  if v_json is null then
    raise exception 'DURDU: maliyet_yenile sınaması için uygun product_costs satırı yok';
  end if;

  -- (a) ÜYE ve MODERATÖR: hassas kolon okunamaz, product_costs 0 satır, vitrin okunur
  foreach v_claim in array array[v_uye, v_mod] loop
    perform set_config('request.jwt.claims', v_claim, true);
    set local role authenticated;

    foreach v_k in array v_hassas loop
      if has_column_privilege('authenticated', 'public.products', v_k, 'select') then
        raise exception 'DURDU: authenticated % kolonunu hâlâ okuyabiliyor', v_k;
      end if;
      begin
        execute format('select %I from public.products limit 1', v_k);
        raise exception 'DURDU: authenticated % kolonunu FİİLEN okuyabildi', v_k;
      exception when insufficient_privilege then
        null; -- beklenen
      end;
    end loop;

    begin
      execute 'select p.* from public.products p limit 1';
      raise exception 'DURDU: authenticated select * ile products okuyabildi';
    exception when insufficient_privilege then
      null;
    end;

    execute 'select ' || v_izinli || ' from public.products limit 1';

    select count(*) into v_n from public.product_costs;
    if v_n <> 0 then
      raise exception 'DURDU: yönetici olmayan oturum product_costs''ta % satır gördü (beklenen 0)', v_n;
    end if;

    -- vitrin RPC'leri (oturumlu müşteri yolu) çalışır
    select count(*) into v_n from public.get_display_prices(v_ids);
    if v_n <> array_length(v_ids, 1) then
      raise exception 'DURDU: get_display_prices authenticated ile % satır döndü (beklenen %)', v_n, array_length(v_ids, 1);
    end if;
    select count(*) into v_n from public.get_product_families_enriched(null, 24, 0, null, null);
    if v_n = 0 then
      raise exception 'DURDU: get_product_families_enriched authenticated ile boş döndü';
    end if;
    perform 1 from public.fts_search_products('fan', 5, '{}'::jsonb);

    reset role;
  end loop;

  -- (b) YÖNETİCİ: product_costs tam görünür; admin ekranlarının dayandığı nesneler çalışır
  perform set_config('request.jwt.claims', v_admin, true);
  set local role authenticated;

  select count(*) into v_n from public.product_costs;
  if v_n <> v_toplam then
    raise exception 'DURDU: yönetici product_costs''ta % satır gördü (beklenen %)', v_n, v_toplam;
  end if;
  perform 1 from public.admin_search_products('fan', 5, 0, null);
  perform count(*) from public.inventory_summary;
  perform count(*) from public.inventory_velocity;

  -- maliyet_yenile: okuma yolu (product_costs) ve yazım yolu çalışır; sonuç geri alınır (işlem içi alt işlem).
  begin
    v_n := public.maliyet_yenile(v_json);
    if v_n <> 1 then
      raise exception 'DURDU: maliyet_yenile % satır yazdı (beklenen 1)', v_n;
    end if;
    raise exception 'ALT123_GERI_AL';
  exception when others then
    if sqlerrm <> 'ALT123_GERI_AL' then
      raise;
    end if;
  end;

  reset role;
  perform set_config('request.jwt.claims', '', true);
end
$guard$;

-- PostgREST şema önbelleği: kolon yetkileri
notify pgrst, 'reload schema';

commit;
