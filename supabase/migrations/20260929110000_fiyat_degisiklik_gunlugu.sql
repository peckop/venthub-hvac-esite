-- REC-412 Faz 0.5 — FİYAT DEĞİŞİKLİK GÜNLÜĞÜ: vitrin fiyatını belirleyen beş tablo denetim izine girer
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec412-tek-urun-fiyat-girisi-2026-09-29.md §5b, §5c v2)
-- ═════════════════════════════════════════════════════════════════════════════
-- Recep sorusu (2026-09-29): "fiyat değişikliğinin kaydı tutuluyor mu — kim, ne zaman, eski→yeni, hangi yöntemle?"
-- Ölçüm (canlı, 2026-09-29): vitrin fiyatını gerçekten belirleyen `pricing_rule` ve `product_prices` DB düzeyinde
-- HİÇ izlenmiyor (tetik yok); istemci denetimi yazımdan SONRA ve hata yutularak çalışıyor, canlıda `pricing_rule`
-- için 0 satır. `price_lists`, `pricing_policy` (kur kilidi), `currency_rates` de aynı durumda. Bu migration mevcut
-- `denetim_izi_yaz()` (REC-292, fail-closed) tetiğini bu tablolara bağlar ve iki şey ekler:
--   (1) YÖNTEM: istemci `x-degisiklik-yontemi` (panel|liste|csv|yeniden_hesap|maliyet_yenileme|sistem) ve
--       `x-degisiklik-oturumu` (uuid) istek başlıklarını gönderir; PostgREST bunları o isteğin işleminde
--       `request.headers` ayarı olarak tetiğe görünür kılar; günlüğün `comment` alanına yazılır. Kolon YOK:
--       DELETE yük taşımaz ve iş tablolarına kolon eklemek tip dosyasını kaydırırdı. Başlıksız yazım
--       (SQL editörü, MCP, betik) zararsızdır: `yontem=BILINMIYOR` yazılır. ⚠Yöntem İSTEMCİ BEYANIDIR,
--       kanıt değil; "kim + ne zaman + eski→yeni" ise DB gerçeğidir.
--   (2) ÖZET (yalnız `product_prices`): yeniden hesap 1044 satır yazar. Granülarite BEYANDAN değil VERİDEN
--       türetilir (plan-challenger 2.1 KRİTİK): `is_derived=false` (elle ezilmiş) satır DAİMA satır bazlı
--       günlüğe girer; türetilmiş (`is_derived=true`) satırlar ifade düzeyinde TEK özet satırına iner (tenant
--       başına) ve özetin before/after alanı DEĞİŞEN satırların eski→yeni dizisidir (tavan 2000, `kirpildi`
--       bayrağı). Fiyat-otoritesi kolonlarından hiçbiri değişmediyse satır YAZILMAZ (boş yeniden hesap
--       günlüğü şişirmez). Başlık hiçbir sayım/eleme kararını etkilemez, yalnız etikettir.
--
-- KAPSAM DIŞI, ADIYLA: (a) maliyet yolu — `products.cost_in_base`/`purchase_rate_to_base` `products` UPDATE-OF
-- listesinde yok, yani maliyet yenileme bugün de günlüksüz; `product_costs` yalnız `product_costs_senkron()`
-- aynasıdır, kaynağı (`products`) zaten izlenir → ikinci tetik KOYULMAZ. Karar OPS'ta (REC-140 Faz 3 ile birlikte).
-- (b) TRUNCATE satır tetiğini ateşlemez (REC-292'deki latent boşlukla aynı).
--
-- ═════════════════════════════════════════════════════════════════════════════
-- TASARIM KARARLARI (plan-challenger raporu: docs/audits/rec412-faz05-red-team-2026-09-29.md)
-- ═════════════════════════════════════════════════════════════════════════════
-- · Başlık okuması AYRI FONKSİYON DEĞİL, tetik gövdesinde (2.3 + 2.6): ayrı `istek_yontemi()` hem `WHEN`
--   içinde EXECUTE yetkisi tuzağı hem `database.types.ts` kayması (INV-TIP-DRIFT-1) yaratırdı.
-- · `request.headers` boş dize dönebilir (canlıda ölçüldü, 2.2): `nullif(…,'')` + `pg_input_is_valid` (PG16+,
--   canlı 17.6) ile korunur; geçersiz ya da beyaz liste dışı değer → NULL → `BILINMIYOR`. Hiçbiri hata değildir.
-- · `currency_rates`: günlük TCMB INSERT'i (`source='tcmb'`, günde 2 satır) günlüğe GİRMEZ (tablonun kendisi
--   tarihçedir), ama elle kur girişi (`source<>'tcmb'`) girer (2.4); UPDATE/DELETE her zaman girer.
-- · Tetik adları `denetim_izi_*`: alfabetik olarak `on_*` webhook tetiklerinden ÖNCE (satır tetikleri için
--   denetim satırı webhook'tan önce yazılır) VE `denetim-izi-tetik-kapisi` bunları otomatik süpürür. İfade
--   düzeyi tetikler satır tetiklerinden SONRA ateşlenir (webhook'tan önce iddiası özet için YOKTUR, atomiklik
--   nedeniyle zarar da yok: biri düşerse ifade ve günlük birlikte geri alınır).
-- · Eleme/bayrak sözleşmesi `TG_ARGV` ile (kolon adı gövdeye gömülmez): `atla:<kolon>` diff'ten eler,
--   `yontem:iste` başlıksız yazımda `yontem=BILINMIYOR` etiketi ister. Mevcut altı tablonun tetikleri argümansız
--   kalır → yorum metni DEĞİŞMEZ (yalnız başlık GEÇERLİYSE `yontem=` eklenir; bugün kimse göndermiyor).
-- · Fail-closed KORUNUR: gövdelerde hata yakalayıcı YOK (REC-292 OPS H1). Günlük yazılamazsa fiyat yazımı da geri alınır.
--
-- GERİ ALMA (bu dosyanın tamamı, veri kaybı yok — yalnız günlük kaydı durur):
--   drop trigger if exists denetim_izi_pricing_rule on public.pricing_rule;
--   drop trigger if exists denetim_izi_pricing_policy on public.pricing_policy;
--   drop trigger if exists denetim_izi_price_lists on public.price_lists;
--   drop trigger if exists denetim_izi_currency_rates_ins on public.currency_rates;
--   drop trigger if exists denetim_izi_currency_rates_upd on public.currency_rates;
--   drop trigger if exists denetim_izi_product_prices_ins on public.product_prices;
--   drop trigger if exists denetim_izi_product_prices_upd on public.product_prices;
--   drop trigger if exists denetim_izi_product_prices_del on public.product_prices;
--   drop trigger if exists denetim_izi_ozet_ins on public.product_prices;
--   drop trigger if exists denetim_izi_ozet_upd on public.product_prices;
--   drop trigger if exists denetim_izi_ozet_del on public.product_prices;
--   drop function if exists public.denetim_izi_fiyat_ozet();
--   ve `denetim_izi_yaz()` 20260909071451_denetim_izi_dml_tetikleri.sql'deki gövdesine `create or replace` ile döndürülür.
--
-- Cetvel: docs/standards/migration-safety-standard.md (salt-ekleyici, biçim a) · docs/standards/denetim-izi-standard.md ·
-- CLAUDE.md kural 11 (admin işlemleri iz bırakır), 12 (tenant), 13 (merge = prod).

-- ⭐ZAMAN AŞIMLARI (INV-MIGRATION-3): beş tabloya tetik ekleniyor (SHARE ROW EXCLUSIVE); kilit beklerse vitrin
-- durmasın, migration hızlı başarısız olsun.
set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

-- ⭐KİLİTLER BAŞTA, SABİT (alfabetik) SIRADA, TEK SEFERDE: aynı anda bu tablolara yazan bir işlemle
-- ters sırada kilit alıp kilitlenmeyi (deadlock) önler (emsal: 20260923083021_url_takma_adlari.sql).
lock table public.currency_rates, public.price_lists, public.pricing_policy, public.pricing_rule,
  public.product_prices in share row exclusive mode;

-- Ön-guard: `pg_input_is_valid` (PG16+) yoksa başlık okuması güvenle yazılamaz → uygulama DURUR.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'pg_input_is_valid') then
    raise exception 'REC-412 Faz 0.5 iptal: pg_input_is_valid yok (PostgreSQL 16+ gerekir)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- denetim_izi_yaz() — İMZA AYNI (GRANT'ler korunur). Farklar: TG_ARGV sözleşmesi + başlıktan yöntem/oturum.
-- ---------------------------------------------------------------------------
create or replace function public.denetim_izi_yaz()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_eski    jsonb;
  v_yeni    jsonb;
  v_pk      text;
  v_tenant  uuid;
  v_before  jsonb;
  v_after   jsonb;
  v_anahtar text;
  v_atla    text[] := array['updated_at'];
  v_iste    boolean := false;
  v_arg     text;
  v_hdr     text;
  v_yontem  text;
  v_oturum  text;
  v_ek      text;
begin
  -- TG_ARGV sözleşmesi: `atla:<kolon>` = diff'ten ele · `yontem:iste` = başlıksızda BILINMIYOR etiketi.
  if tg_nargs > 0 then
    foreach v_arg in array tg_argv loop
      if v_arg like 'atla:%' then
        v_atla := v_atla || substr(v_arg, 6);
      elsif v_arg = 'yontem:iste' then
        v_iste := true;
      end if;
    end loop;
  end if;

  -- Başlıklar (PostgREST `request.headers`, anahtarlar küçük harf). Boş dize / geçersiz JSON / dışı değer = NULL.
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
  v_ek := case
            when v_yontem is not null then ' | yontem=' || v_yontem
            when v_iste then ' | yontem=BILINMIYOR'
            else ''
          end
       || case when v_oturum is not null then ' | oturum=' || v_oturum else '' end;

  v_eski := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_yeni := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;

  -- Satır kimliği ve tenant JSONB üzerinden okunur: olmayan alan hatası doğmaz (REC-292 notu).
  v_pk     := coalesce(v_yeni->>'id', v_eski->>'id');
  v_tenant := nullif(coalesce(v_yeni->>'tenant_id', v_eski->>'tenant_id'), '')::uuid;

  if tg_op = 'UPDATE' then
    -- NO-OP UPDATE ELEMESİ: `ON CONFLICT DO UPDATE` satır değişmese de tetiği ateşler; elenmezse tablo
    -- kendi gürültüsüyle dolar. `updated_at` her tabloda, ek elemeler `atla:` argümanıyla.
    v_before := '{}'::jsonb;
    v_after  := '{}'::jsonb;
    for v_anahtar in select jsonb_object_keys(v_yeni)
    loop
      if v_anahtar <> all (v_atla) and (v_yeni->v_anahtar) is distinct from (v_eski->v_anahtar) then
        v_before := v_before || jsonb_build_object(v_anahtar, v_eski->v_anahtar);
        v_after  := v_after  || jsonb_build_object(v_anahtar, v_yeni->v_anahtar);
      end if;
    end loop;

    -- Anlamlı değişiklik yoksa satır YAZILMAZ. Fail-open DEĞİL: yazılacak bir olgu yok.
    if v_after = '{}'::jsonb then
      return new;
    end if;
  else
    v_before := v_eski;
    v_after  := v_yeni;
  end if;

  -- ⛔Hata yakalayıcı YOK — fail-closed, kasıtlı (REC-292 OPS H1).
  if v_tenant is null then
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user
        || ' | tenant DAMGASI VARSAYILANDIR (tabloda tenant_id yok)'
        || v_ek
    );
  else
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    values (
      auth.uid(),
      tg_table_name,
      v_pk,
      tg_op,
      v_before,
      v_after,
      'REC-292 DML tetigi. actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
        || 'session_user=' || session_user
        || v_ek,
      v_tenant
    );
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

comment on function public.denetim_izi_yaz() is
  'REC-292: DML denetim izi. FAIL-CLOSED (hata yakalayici YOK, kasitli). tenant ve id JSONB uzerinden okunur. '
  'REC-412 Faz 0.5: TG_ARGV atla:<kolon> / yontem:iste; istek basligi x-degisiklik-yontemi ve '
  'x-degisiklik-oturumu comment alanina yazilir (istemci beyani). TRUNCATE bu tetigi ATESLEMEZ.';

-- ---------------------------------------------------------------------------
-- denetim_izi_fiyat_ozet() — product_prices TÜRETİLMİŞ satırları için ifade düzeyi özet (tenant başına).
-- Geçiş tablolarıyla üç ayrı tetik (INSERT/UPDATE/DELETE) çağırır: her dal yalnız KENDİ tablosuna bakar
-- (çalışmayan dal planlanmaz). UPDATE'te eski/yeni `id` ile birleştirilir — satır sırası garantisi yoktur.
-- Elle ezilmiş (is_derived=false) satırlar burada YOKTUR: onlar satır tetiğinden geçer (daima satır bazlı).
-- ---------------------------------------------------------------------------
create or replace function public.denetim_izi_fiyat_ozet()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tavan  constant int := 2000;
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

  -- Fiyat-otoritesi kolonları: ödeme tutarı `net/gross` yoksa `sale_price`/`base_price`/`discount_percentage`/
  -- `valid_*` kolonlarından da üretilir (order-validate) → hepsi değişiklik ölçütüdür (plan-challenger 2.1).
  if tg_op = 'INSERT' then
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    select auth.uid(), tg_table_name, 'OZET', tg_op, null::jsonb,
           coalesce(jsonb_agg(d.sonra order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
           'REC-412 Faz 0.5 fiyat gunlugu OZET (turetilmis satirlar). actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
             || 'session_user=' || session_user || v_ek
             || ' | satir=' || count(*) || ' | urun=' || count(distinct d.product_id)
             || case when count(*) > v_tavan then ' | kirpildi=evet' else '' end,
           d.tenant_id
      from (
        select n.tenant_id, n.product_id,
               row_number() over (partition by n.tenant_id order by n.id) as sira,
               jsonb_build_object(
                 'id', n.id, 'product_id', n.product_id, 'price_list_id', n.price_list_id,
                 'net_price', n.net_price, 'gross_price', n.gross_price, 'base_price', n.base_price,
                 'sale_price', n.sale_price, 'discount_percentage', n.discount_percentage,
                 'valid_from', n.valid_from, 'valid_until', n.valid_until,
                 'is_active', n.is_active, 'currency', n.currency, 'is_derived', n.is_derived) as sonra
          from yeni_t n
         where n.is_derived is true
      ) d
     group by d.tenant_id;

  elsif tg_op = 'UPDATE' then
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    select auth.uid(), tg_table_name, 'OZET', tg_op,
           coalesce(jsonb_agg(d.once  order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
           coalesce(jsonb_agg(d.sonra order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
           'REC-412 Faz 0.5 fiyat gunlugu OZET (turetilmis satirlar). actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
             || 'session_user=' || session_user || v_ek
             || ' | satir=' || count(*) || ' | urun=' || count(distinct d.product_id)
             || case when count(*) > v_tavan then ' | kirpildi=evet' else '' end,
           d.tenant_id
      from (
        select n.tenant_id, n.product_id,
               row_number() over (partition by n.tenant_id order by n.id) as sira,
               jsonb_build_object(
                 'id', o.id, 'product_id', o.product_id, 'price_list_id', o.price_list_id,
                 'net_price', o.net_price, 'gross_price', o.gross_price, 'base_price', o.base_price,
                 'sale_price', o.sale_price, 'discount_percentage', o.discount_percentage,
                 'valid_from', o.valid_from, 'valid_until', o.valid_until,
                 'is_active', o.is_active, 'currency', o.currency, 'is_derived', o.is_derived) as once,
               jsonb_build_object(
                 'id', n.id, 'product_id', n.product_id, 'price_list_id', n.price_list_id,
                 'net_price', n.net_price, 'gross_price', n.gross_price, 'base_price', n.base_price,
                 'sale_price', n.sale_price, 'discount_percentage', n.discount_percentage,
                 'valid_from', n.valid_from, 'valid_until', n.valid_until,
                 'is_active', n.is_active, 'currency', n.currency, 'is_derived', n.is_derived) as sonra
          from yeni_t n
          join eski_t o on o.id = n.id
         where o.is_derived is true
           and n.is_derived is true
           and (o.net_price, o.gross_price, o.base_price, o.sale_price, o.discount_percentage,
                o.valid_from, o.valid_until, o.is_active, o.currency)
               is distinct from
               (n.net_price, n.gross_price, n.base_price, n.sale_price, n.discount_percentage,
                n.valid_from, n.valid_until, n.is_active, n.currency)
      ) d
     group by d.tenant_id;

  else
    insert into public.admin_audit_log (actor, table_name, row_pk, action, before, after, comment, tenant_id)
    select auth.uid(), tg_table_name, 'OZET', tg_op,
           coalesce(jsonb_agg(d.once order by d.sira) filter (where d.sira <= v_tavan), '[]'::jsonb),
           null::jsonb,
           'REC-412 Faz 0.5 fiyat gunlugu OZET (turetilmis satirlar). actor NULL ise BILINMIYOR demektir, sistem DEMEZ. '
             || 'session_user=' || session_user || v_ek
             || ' | satir=' || count(*) || ' | urun=' || count(distinct d.product_id)
             || case when count(*) > v_tavan then ' | kirpildi=evet' else '' end,
           d.tenant_id
      from (
        select o.tenant_id, o.product_id,
               row_number() over (partition by o.tenant_id order by o.id) as sira,
               jsonb_build_object(
                 'id', o.id, 'product_id', o.product_id, 'price_list_id', o.price_list_id,
                 'net_price', o.net_price, 'gross_price', o.gross_price, 'base_price', o.base_price,
                 'sale_price', o.sale_price, 'discount_percentage', o.discount_percentage,
                 'valid_from', o.valid_from, 'valid_until', o.valid_until,
                 'is_active', o.is_active, 'currency', o.currency, 'is_derived', o.is_derived) as once
          from eski_t o
         where o.is_derived is true
      ) d
     group by d.tenant_id;
  end if;

  return null;
end;
$$;

comment on function public.denetim_izi_fiyat_ozet() is
  'REC-412 Faz 0.5: product_prices turetilmis satirlari icin ifade duzeyi ozet gunlugu (tenant basina, degisen '
  'satirlarin eski->yeni dizisi, tavan 2000). FAIL-CLOSED. Elle ezilmis satirlar satir tetigindedir.';

-- Tetik fonksiyonu: hiçbir istemci rolü doğrudan çağıramaz (yeni fonksiyona varsayılan EXECUTE verilir).
revoke all on function public.denetim_izi_fiyat_ozet() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- TETİKLER
-- ---------------------------------------------------------------------------

drop trigger if exists denetim_izi_pricing_rule on public.pricing_rule;
create trigger denetim_izi_pricing_rule
  after insert or update or delete on public.pricing_rule
  for each row execute function public.denetim_izi_yaz('yontem:iste');

drop trigger if exists denetim_izi_pricing_policy on public.pricing_policy;
create trigger denetim_izi_pricing_policy
  after insert or update or delete on public.pricing_policy
  for each row execute function public.denetim_izi_yaz('yontem:iste');

drop trigger if exists denetim_izi_price_lists on public.price_lists;
create trigger denetim_izi_price_lists
  after insert or update or delete on public.price_lists
  for each row execute function public.denetim_izi_yaz('yontem:iste');

-- currency_rates: günlük TCMB INSERT'i günlüğe girmez (tablo kendi tarihçesi); elle giriş ve her UPDATE/DELETE girer.
drop trigger if exists denetim_izi_currency_rates_ins on public.currency_rates;
create trigger denetim_izi_currency_rates_ins
  after insert on public.currency_rates
  for each row when (new.source is distinct from 'tcmb')
  execute function public.denetim_izi_yaz('yontem:iste');

drop trigger if exists denetim_izi_currency_rates_upd on public.currency_rates;
create trigger denetim_izi_currency_rates_upd
  after update or delete on public.currency_rates
  for each row execute function public.denetim_izi_yaz('yontem:iste');

-- product_prices — SATIR düzeyi: yalnız elle ezilmiş (is_derived=false) satırlar, HER yöntemde (beyan susturamaz).
-- `computed_at` her yazımda değişir → diff'ten elenir (aksi hâlde her yeniden hesap gürültü satırı üretirdi).
drop trigger if exists denetim_izi_product_prices_ins on public.product_prices;
create trigger denetim_izi_product_prices_ins
  after insert on public.product_prices
  for each row when (new.is_derived is not true)
  execute function public.denetim_izi_yaz('yontem:iste', 'atla:computed_at');

drop trigger if exists denetim_izi_product_prices_upd on public.product_prices;
create trigger denetim_izi_product_prices_upd
  after update on public.product_prices
  for each row when (old.is_derived is not true or new.is_derived is not true)
  execute function public.denetim_izi_yaz('yontem:iste', 'atla:computed_at');

drop trigger if exists denetim_izi_product_prices_del on public.product_prices;
create trigger denetim_izi_product_prices_del
  after delete on public.product_prices
  for each row when (old.is_derived is not true)
  execute function public.denetim_izi_yaz('yontem:iste', 'atla:computed_at');

-- product_prices — İFADE düzeyi özet: yalnız türetilmiş satırlar (geçiş tablosu tetikleri tek olaylı olmak zorunda).
drop trigger if exists denetim_izi_ozet_ins on public.product_prices;
create trigger denetim_izi_ozet_ins
  after insert on public.product_prices
  referencing new table as yeni_t
  for each statement execute function public.denetim_izi_fiyat_ozet();

drop trigger if exists denetim_izi_ozet_upd on public.product_prices;
create trigger denetim_izi_ozet_upd
  after update on public.product_prices
  referencing old table as eski_t new table as yeni_t
  for each statement execute function public.denetim_izi_fiyat_ozet();

drop trigger if exists denetim_izi_ozet_del on public.product_prices;
create trigger denetim_izi_ozet_del
  after delete on public.product_prices
  referencing old table as eski_t
  for each statement execute function public.denetim_izi_fiyat_ozet();

-- Son-guard: kapının aradığı tetikler gerçekten kuruldu mu (11 tetik, 5 tablo) ve fonksiyon fail-closed mı.
do $$
declare
  v_say int;
begin
  select count(*) into v_say
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and not t.tgisinternal and t.tgname like 'denetim_izi%'
     and c.relname in ('pricing_rule', 'pricing_policy', 'price_lists', 'currency_rates', 'product_prices');
  if v_say <> 11 then
    raise exception 'REC-412 Faz 0.5: beklenen 11 denetim tetigi, bulunan %', v_say;
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in ('denetim_izi_yaz', 'denetim_izi_fiyat_ozet')
       and p.prosrc ~* '\mexception\s+when\M'
  ) then
    raise exception 'REC-412 Faz 0.5: denetim fonksiyonunda hata yakalayici var (fail-closed bozuldu)';
  end if;
end $$;

commit;
