-- REC-412 Faz 0.5b — MALİYET YENİLEME GÜNLÜĞÜ: `refreshCostInBase` tek ifadeyle yazar, parti başına TEK özet satırı düşer
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec412-tek-urun-fiyat-girisi-2026-09-29.md §5d; karar 186)
-- ═════════════════════════════════════════════════════════════════════════════
-- Faz 0.5 (20260929110000) beş fiyat tablosunu denetim izine bağladı; `maliyet_yenileme` kapsam dışı bırakılmıştı:
-- `products.cost_in_base` ve `products.purchase_rate_to_base` satır tetiğinin `UPDATE OF` listesinde YOKTUR, yani
-- maliyet yenilemesi bugün günlüksüzdür. İki kolonu satır tetiğine eklemek panelden TEK tıklamada 348 satır
-- yazardı (karar 186: reddedildi, parti özeti sözleşmesine aykırı).
-- Parti özeti DB'de yalnız TEK ifadenin satırlarını toplayabilir (geçiş tabloları); mevcut istemci ise 348 ürünü ürün
-- başına AYRI PostgREST isteğiyle (20 paralel) yazıyor. Bu yüzden yazma yolu da değişir:
--   (1) `maliyet_yenile(jsonb)` RPC'si: yönetici kapılı (JWT `app_metadata`, `is_admin_claim()` — tabloya DÜŞMEZ),
--       SECURITY INVOKER (RLS korunur, yetki genişlemez), tenant filtreli, TEK UPDATE ifadesi → tüm parti ya
--       tamamen yazılır ya tamamen geri alınır (yarım yenileme yok).
--   (2) `denetim_izi_maliyet_ozet()` ifade-düzeyi tetiği (`products` üzerinde): iki kolonun değiştiği satırların
--       eski→yeni dizisini tenant başına TEK `admin_audit_log` satırına yazar (emsal: `denetim_izi_fiyat_ozet`).
--       Yöntem/oturum istek başlığından (`x-degisiklik-yontemi`, `x-degisiklik-oturumu`) — istemci BEYANIDIR.
-- Satır tetiğiyle ÇAKIŞMA yok: RPC yalnız iki maliyet kolonunu SET eder, `denetim_izi_products_upd` (UPDATE OF listesi)
-- ateşlenmez. `purchase_price`/`purchase_currency` de değişen satırlar özetten ELENİR: onları satır tetiği zaten
-- TÜM değişen kolonlarıyla (maliyet kolonları dahil) günlüğe yazar. Bilinen sınır: aynı ifadede maliyet kolonlarıyla
-- birlikte satır tetiğinin izlediği BAŞKA kolon değişirse (bugün hiçbir yolda yok) satır iki kez görünebilir.
--
-- KAPSAM DIŞI, ADIYLA: `last_purchase_cost/currency/at` (mal kabul; kaynağı `process_goods_receipt` belgesidir) ve
-- TRUNCATE (satır tetikleri ateşlemez; REC-292'deki latent boşlukla aynı).
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TASARIM KARARLARI
-- ═════════════════════════════════════════════════════════════════════════════
-- · Yönetici kapısı `is_admin_claim()`: JWT'de `user_role` / `app_metadata.user_role` okur, `user_metadata`'ya bakmaz,
--   JWT yoksa FALSE döner (profil tablosuna düşmez; kural 12). `service_role` TRUE (betikler). Moderatör YAZAMAZ:
--   maliyet yönetici alanıdır (karar 95); bugünkü `products` UPDATE politikası moderatöre de açık, bu RPC daha sıkıdır.
-- · Parti sınırı 5000 (RPC ve özet aynı): aşılırsa RPC HATA verir; yarım yenileme yapılmaz, istemci partiyi bölmez
--   (bölerse atomiklik kaybolur). Bugün 442 ürün. Özet dizisi bu sınıra kadar KIRPILMAZ.
-- · Girdi doğrulaması yazımdan ÖNCE: dizi değilse, elemanda `id`/`cost_in_base`/`purchase_rate_to_base` eksik ya da
--   `cost_in_base<0` / `purchase_rate_to_base<=0` ise, ya da `id` bu tenant'ta görünmüyorsa TÜM parti reddedilir.
-- · Fail-closed KORUNUR: tetik gövdesinde hata yakalayıcı YOK. Günlük yazılamazsa maliyet yazımı da geri alınır.
-- · İfade tetiği `products`'ın HER UPDATE ifadesinde çalışır (geçiş tablosu tetiğine sütun listesi konamaz —
--   PostgreSQL kısıtı); değişen satır yoksa hiçbir satır yazılmaz (gölgede ölçüldü: docs/audits/rec412-maliyet-golge).
--
-- GERİ ALMA (bu dosyanın tamamı, veri kaybı yok — yalnız günlük kaydı ve RPC gider):
--   ⭐SIRA: ÖNCE `refreshCostInBase` istemcisi (PR) eski ürün-başına-PATCH koduna döndürülür ve yayınlanır; SONRA
--   aşağıdakiler. Sıra ters olursa panelden maliyet yenileme "function maliyet_yenile does not exist" ile düşer.
--   drop trigger if exists denetim_izi_maliyet_ozet on public.products;
--   drop function if exists public.denetim_izi_maliyet_ozet();
--   drop function if exists public.maliyet_yenile(jsonb);
--
-- Cetvel: docs/standards/migration-safety-standard.md (salt-ekleyici, biçim a) · docs/standards/denetim-izi-standard.md ·
-- CLAUDE.md kural 11 (admin işlemleri iz bırakır), 12 (tenant, app_metadata), 13 (merge = prod).

-- ⭐ZAMAN AŞIMLARI (INV-MIGRATION-3): `products` sıcak tablo (stok/sipariş); tetik eklemek SHARE ROW EXCLUSIVE ister.
-- Kilit beklerse vitrin durmasın, migration hızlı başarısız olsun.
set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

lock table public.products in share row exclusive mode;

-- Ön-guard: başlık okuması `pg_input_is_valid` (PG16+) ister; yoksa uygulama DURUR.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'pg_input_is_valid') then
    raise exception 'REC-412 Faz 0.5b iptal: pg_input_is_valid yok (PostgreSQL 16+ gerekir)';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'is_admin_claim') then
    raise exception 'REC-412 Faz 0.5b iptal: public.is_admin_claim() yok (yonetici kapisi kurulamaz)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- maliyet_yenile(jsonb) — TEK UPDATE ifadesi; yönetici kapılı; SECURITY INVOKER (RLS korunur).
-- p_satirlar: [{"id": uuid, "cost_in_base": numeric, "purchase_rate_to_base": numeric,
--               "purchase_price": numeric, "purchase_currency": text}, ...]
--   `purchase_price`/`purchase_currency` = maliyetin HESAPLANDIĞI alış fiyatı (iyimser eşzamanlılık koruması, B8):
--   okuma ile yazma arasında ürünün fiyatı değiştiyse o satır YAZILAMAZ ve TÜM parti geri alınır.
-- Döner: gerçekten değişen satır sayısı (aynı değerli satırlar yazılmaz).
-- Değerler sütun duyarlığına YUVARLANIR (cost 4, rate 6): sütundan fazla ondalık taşıyan girdi her koşuda "değişti"
-- görünüp satırı boşuna yeniden yazmasın (B5).
-- ---------------------------------------------------------------------------
create or replace function public.maliyet_yenile(p_satirlar jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
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
  select count(*) into v_beklenen
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
    join public.products p on p.id = s.id and p.tenant_id = public.jwt_tenant_id()
   where p.cost_in_base is distinct from round(s.cost_in_base, 4)
      or p.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6);

  update public.products p
     set cost_in_base = round(s.cost_in_base, 4),
         purchase_rate_to_base = round(s.purchase_rate_to_base, 6)
    from jsonb_to_recordset(p_satirlar)
           as s(id uuid, cost_in_base numeric, purchase_rate_to_base numeric, purchase_price numeric, purchase_currency text)
   where p.id = s.id
     and p.tenant_id = public.jwt_tenant_id()
     and p.purchase_price = s.purchase_price
     and p.purchase_currency::text = s.purchase_currency
     and (p.cost_in_base is distinct from round(s.cost_in_base, 4)
          or p.purchase_rate_to_base is distinct from round(s.purchase_rate_to_base, 6));
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
$$;

comment on function public.maliyet_yenile(jsonb) is
  'REC-412 Faz 0.5b: maliyet yenilemesi (cost_in_base + purchase_rate_to_base) TEK UPDATE ifadesiyle. Yonetici kapili '
  '(is_admin_claim, JWT app_metadata), SECURITY INVOKER, tenant filtreli, en fazla 5000 satir; tek bozuk eleman tum '
  'partiyi reddeder. Gunluk: denetim_izi_maliyet_ozet (parti basina tek ozet satiri).';

-- Yeni fonksiyona varsayılan EXECUTE herkese verilir: anon ve PUBLIC kapatılır, yalnız oturum açmış roller çağırır
-- (yetki kararı fonksiyon İÇİNDE: yönetici olmayan authenticated 42501 alır). `service_role` betikler içindir
-- (`is_admin_claim()` ile aynı grant kalıbı, 20260918063600).
revoke all on function public.maliyet_yenile(jsonb) from public, anon;
grant execute on function public.maliyet_yenile(jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- denetim_izi_maliyet_ozet() — `products` maliyet kolonları için ifade-düzeyi özet (tenant başına TEK satır).
-- ---------------------------------------------------------------------------
create or replace function public.denetim_izi_maliyet_ozet()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tavan  constant int := 5000;
  v_hdr    text;
  v_yontem text;
  v_oturum text;
  v_ek     text;
begin
  v_hdr := nullif(current_setting('request.headers', true), '');
  if v_hdr is not null and pg_input_is_valid(v_hdr, 'jsonb') then
    v_yontem := (v_hdr::jsonb) ->> 'x-degisiklik-yontemi';
    v_oturum := (v_hdr::jsonb) ->> 'x-degisiklik-oturumu';
  end if;
  if v_yontem is not null
     and v_yontem not in ('panel', 'liste', 'csv', 'yeniden_hesap', 'maliyet_yenileme', 'sistem') then
    v_yontem := null;
  end if;
  if v_oturum is not null
     and v_oturum !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_oturum := null;
  end if;
  v_ek := ' | yontem=' || coalesce(v_yontem, 'BILINMIYOR')
       || case when v_oturum is not null then ' | oturum=' || v_oturum else '' end;

  -- Yalnız İKİ maliyet kolonu değişen satırlar. purchase_price/purchase_currency de değişenler satır tetiğinin
  -- (denetim_izi_products_upd) konusudur, burada ELENİR (çift kayıt olmasın).
  insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
  select auth.uid(), tg_table_name, 'OZET', 'UPDATE',
         coalesce(jsonb_agg(d.once  order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
         coalesce(jsonb_agg(d.sonra order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
         'REC-412 Faz 0.5b maliyet gunlugu OZET (cost_in_base, purchase_rate_to_base). actor NULL ise BILINMIYOR '
           || 'demektir, sistem DEMEZ. session_user=' || session_user || v_ek
           || ' | satir=' || count(*)
           || case when count(*) > v_tavan then ' | kirpildi=evet' else '' end,
         d.tenant_id
    from (
      select n.tenant_id,
             row_number() over (partition by n.tenant_id order by n.id) as sira,
             jsonb_build_object('id', o.id, 'cost_in_base', o.cost_in_base,
                                'purchase_rate_to_base', o.purchase_rate_to_base) as once,
             jsonb_build_object('id', n.id, 'cost_in_base', n.cost_in_base,
                                'purchase_rate_to_base', n.purchase_rate_to_base) as sonra
        from yeni_t n
        join eski_t o on o.id = n.id
       where (o.cost_in_base, o.purchase_rate_to_base)
             is distinct from
             (n.cost_in_base, n.purchase_rate_to_base)
         and o.purchase_price is not distinct from n.purchase_price
         and o.purchase_currency is not distinct from n.purchase_currency
    ) d
   group by d.tenant_id;

  return null;
end;
$$;

comment on function public.denetim_izi_maliyet_ozet() is
  'REC-412 Faz 0.5b: products cost_in_base/purchase_rate_to_base icin ifade duzeyi ozet gunlugu (tenant basina, '
  'eski->yeni dizisi, tavan 5000). FAIL-CLOSED. purchase_price/currency degisen satirlar satir tetigindedir.';

-- Tetik fonksiyonu: hiçbir istemci rolü doğrudan çağıramaz.
revoke all on function public.denetim_izi_maliyet_ozet() from public, anon, authenticated;

drop trigger if exists denetim_izi_maliyet_ozet on public.products;
create trigger denetim_izi_maliyet_ozet
  after update on public.products
  referencing old table as eski_t new table as yeni_t
  for each statement execute function public.denetim_izi_maliyet_ozet();

-- Son-guard: tetik kuruldu mu, fonksiyonlar fail-closed mı, RPC'yi anon çağıramıyor mu.
do $$
begin
  if not exists (
    select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
     where c.relname = 'products' and c.relnamespace = 'public'::regnamespace
       and t.tgname = 'denetim_izi_maliyet_ozet' and not t.tgisinternal
  ) then
    raise exception 'REC-412 Faz 0.5b: denetim_izi_maliyet_ozet tetigi kurulamadi';
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = 'denetim_izi_maliyet_ozet'
       and p.prosrc ~* '\mexception\s+when\M'
  ) then
    raise exception 'REC-412 Faz 0.5b: denetim_izi_maliyet_ozet icinde hata yakalayici var (fail-closed bozuldu)';
  end if;

  -- PUBLIC = ACL'de grantee 0 (`has_function_privilege('public', …)` rol adı olarak geçmez). ACL boşsa varsayılan
  -- (PUBLIC'e EXECUTE) `acldefault` ile açılır.
  if has_function_privilege('anon', 'public.maliyet_yenile(jsonb)', 'execute')
     or exists (
       select 1
         from pg_proc p,
              lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where p.oid = 'public.maliyet_yenile(jsonb)'::regprocedure
          and a.grantee = 0 and a.privilege_type = 'EXECUTE'
     ) then
    raise exception 'REC-412 Faz 0.5b: maliyet_yenile anon/PUBLIC icin EXECUTE acik';
  end if;
end $$;

commit;
