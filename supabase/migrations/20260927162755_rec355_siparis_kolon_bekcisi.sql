-- ALTYAPI (REC-355 VULN-002 + kardeşleri a/b) — müşterinin sipariş verisine yazması kapanır
--
-- ══════════════════════════════════════════════════════════════════════════════
-- NİÇİN (canlı salt okuma, 2026-09-27)
-- ══════════════════════════════════════════════════════════════════════════════
-- venthub_orders: authenticated (ve anon) status/payment_status/paid_at/order_number/total_amount
-- yazabiliyordu; orders_update_policy yalnız satır sahipliğine bakıyor. Müşteri kendi siparişine
-- status='confirmed' yazınca tetik zinciri paid → paid_at → onay e-postası üretiyordu (parasız "ödendi").
-- Sıradaki order_number'ı yazmak o günün siparişlerini 23505 ile düşürüyordu (09-24 AUTH eki).
-- Kardeş (a) venthub_order_items: müşteri kendi siparişine istediği fiyatla kalem ekleyebiliyordu.
-- Kardeş (b) venthub_returns: müşteri iadeyi status='approved' + refund_amount dolu açabiliyordu.
-- Canlıda istismar izi 0 (hiç paid sipariş yok, satış kapalı). Satış açılmadan kapanmalı.
--
-- ══════════════════════════════════════════════════════════════════════════════
-- TASARIM (plan: docs/plans/rec355-vuln002-siparis-kolon-bekcisi-2026-09-27.md, v3;
--          plan-challenger iki tur)
-- ══════════════════════════════════════════════════════════════════════════════
-- B1 Kural İZİN LİSTESİ: current_user service_role/postgres/supabase_admin ya da admin claim'i
--    (is_admin_claim — tablo okumaz, 54001 döngüsü dersi) değilse istemcidir. Yasak listesi yeni bir
--    API rolünde sessizce açık kalırdı.
-- B2 Tetik fonksiyonları SECURITY INVOKER: current_user çağıranın rolünü görmeli. DEFINER bir
--    fonksiyonun içinden gelen yazmada current_user = sahip (postgres) → geçer (meşru sunucu yolu).
-- B3 Sipariş ve kalemde kolon listesi YOK: istemcinin hiçbir kolona yazması gerekmiyor (yazma yüzeyi
--    envanteri planda §2). İadede kolon listesi BİLİNÇLİ: INSERT meşru (müşteri formu), yasak olan
--    yöneticinin alanları. Sunucu damgaları istemci için EZİLİR (ret değil): form onları göndermiyor.
-- B4 REC355_BEKCI işareti: 42501 RLS WITH CHECK'te ve yetki hatasında da döner; guard bekçiyi ancak
--    bu işaretle ayırt eder.
-- B5 Tetik adları 'o'/'i' ile başlar: BEFORE tetikleri ada göre koşar → istemcinin HAM değeri görülür.
--
-- GERİ ALMA:
--   drop trigger orders_istemci_yazma_bekcisi on public.venthub_orders;
--   drop trigger order_items_istemci_yazma_bekcisi on public.venthub_order_items;
--   drop trigger iade_istemci_kayit_bekcisi on public.venthub_returns;
--   drop function public.istemci_yazma_bekcisi(); drop function public.iade_istemci_kayit_bekcisi();
--   önceki anon ACL üç tabloda da 'awdDxtm' idi:
--   grant insert, update, delete, truncate, references, trigger, maintain on <tablo> to anon;

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

-- ── 1. Genel bekçi: istemci bu tabloya hiç yazamaz ──────────────────────────────
create or replace function public.istemci_yazma_bekcisi()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin')
     and not public.is_admin_claim() then
    raise exception 'REC355_BEKCI: % tablosuna istemciden yazilamaz', tg_table_name
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.istemci_yazma_bekcisi() from public, anon, authenticated;

drop trigger if exists orders_istemci_yazma_bekcisi on public.venthub_orders;
create trigger orders_istemci_yazma_bekcisi
  before insert or update on public.venthub_orders
  for each row execute function public.istemci_yazma_bekcisi();

drop trigger if exists order_items_istemci_yazma_bekcisi on public.venthub_order_items;
create trigger order_items_istemci_yazma_bekcisi
  before insert or update on public.venthub_order_items
  for each row execute function public.istemci_yazma_bekcisi();

-- ── 2. İade bekçisi: müşteri iade AÇAR, yönetici alanlarını yazamaz ─────────────
create or replace function public.iade_istemci_kayit_bekcisi()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') or public.is_admin_claim() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    raise exception 'REC355_BEKCI: iade kaydi istemciden guncellenemez' using errcode = '42501';
  end if;

  if new.status is distinct from 'requested'
     or new.refund_amount is not null
     or new.admin_notes is not null
     or new.approved_at is not null
     or new.processed_at is not null
     or new.completed_at is not null then
    raise exception 'REC355_BEKCI: iade talebinde yonetici alani yazilamaz' using errcode = '42501';
  end if;

  new.requested_at := now();
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.iade_istemci_kayit_bekcisi() from public, anon, authenticated;

drop trigger if exists iade_istemci_kayit_bekcisi on public.venthub_returns;
create trigger iade_istemci_kayit_bekcisi
  before insert or update on public.venthub_returns
  for each row execute function public.iade_istemci_kayit_bekcisi();

-- ── 3. Derinlik: anon hiçbir yolda bu tablolara yazmıyor ────────────────────────
revoke all on public.venthub_orders from anon;
revoke all on public.venthub_order_items from anon;
revoke all on public.venthub_returns from anon;

-- ── 4. GUARD — yapısal ──────────────────────────────────────────────────────────
do $guard$
declare
  t text;
  p text;
begin
  foreach t in array array['venthub_orders', 'venthub_order_items', 'venthub_returns'] loop
    foreach p in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'] loop
      if has_table_privilege('anon', 'public.' || t, p) then
        raise exception 'REC355 GUARD: anon % yetkisi % tablosunda duruyor', p, t;
      end if;
    end loop;
    if has_any_column_privilege('anon', 'public.' || t, 'INSERT')
       or has_any_column_privilege('anon', 'public.' || t, 'UPDATE') then
      raise exception 'REC355 GUARD: anon kolon yazma yetkisi % tablosunda duruyor', t;
    end if;
  end loop;

  if (select count(*) from pg_trigger tg join pg_proc f on f.oid = tg.tgfoid
       where not tg.tgisinternal
         and tg.tgname in ('orders_istemci_yazma_bekcisi', 'order_items_istemci_yazma_bekcisi',
                           'iade_istemci_kayit_bekcisi')
         and (tg.tgtype & 2) = 2      -- BEFORE
         and (tg.tgtype & 4) = 4      -- INSERT
         and (tg.tgtype & 16) = 16    -- UPDATE
         and not f.prosecdef) <> 3 then
    raise exception 'REC355 GUARD: uc bekci tetigi BEFORE INSERT OR UPDATE + INVOKER olarak kurulmadi';
  end if;
end
$guard$;

-- ── 5. GUARD — davranış (yalnız RET kolları; hiçbiri satır değiştirmez) ─────────
-- Müşteri, kendi siparişi üzerinde: (1) sipariş UPDATE, (2) kalem INSERT, (3) onaylı iade INSERT.
-- Her kol: ön koşul (satır görünür = 1) AYRI ifade; beklenen hata YALNIZ REC355_BEKCI işaretli olan;
-- hata gelmezse ya da başka hata gelirse raise → migration bütünüyle geri alınır.
do $guard$
declare
  v_id uuid;
  v_user uuid;
  v_tenant uuid;
  v_gorunur int;
  v_msg text;
  v_kol text;
  v_hata_geldi boolean;
begin
  select o.id, o.user_id, o.tenant_id into v_id, v_user, v_tenant
    from public.venthub_orders o
   where o.user_id is not null
   order by o.created_at
   limit 1;

  if v_id is null then
    raise notice 'REC355 GUARD: user_id dolu siparis yok — davranis kollari ATLANDI (gölge/boş DB).';
    return;
  end if;

  foreach v_kol in array array['siparis_update', 'kalem_insert', 'iade_insert'] loop
    v_hata_geldi := false;
    begin
      set local role authenticated;
      perform set_config('request.jwt.claims', json_build_object(
        'role', 'authenticated',
        'sub', v_user,
        'user_role', 'user',
        'app_metadata', json_build_object('tenant_id', v_tenant, 'user_role', 'user')
      )::text, true);

      select count(*) into v_gorunur from public.venthub_orders where id = v_id;
      if v_gorunur <> 1 then
        raise exception 'REC355 GUARD ON KOSUL (%): musteri kendi siparisini goremiyor (% satir)', v_kol, v_gorunur;
      end if;

      if v_kol = 'siparis_update' then
        update public.venthub_orders set status = status where id = v_id;
      elsif v_kol = 'kalem_insert' then
        insert into public.venthub_order_items (order_id, product_name, unit_price, quantity, total_price, tenant_id)
        values (v_id, 'REC355 guard', 1, 1, 1, v_tenant);
      else
        insert into public.venthub_returns (order_id, user_id, reason, status, tenant_id)
        values (v_id, v_user, 'REC355 guard', 'approved', v_tenant);
      end if;

      raise exception 'REC355 GUARD (%): bekci ATESLENMEDI — istemci yazmasi gecti', v_kol;
    exception when insufficient_privilege then
      get stacked diagnostics v_msg = message_text;
      -- Önek eşleşmesi: guard'ın kendi mesajları 'REC355 GUARD' (boşluklu) — işareti TAŞIMAZ.
      -- İşaretsiz 42501 (RLS/yetki) burada raise; diğer her hata kodu (23502, 23503, P0001…) zaten
      -- bu yakalayıcıya girmez ve migration'ı düşürür.
      if v_msg not like 'REC355\_BEKCI:%' then
        raise exception 'REC355 GUARD (%): 42501 geldi ama bekciden DEGIL: %', v_kol, v_msg;
      end if;
      v_hata_geldi := true;
    end;
    if not v_hata_geldi then
      raise exception 'REC355 GUARD (%): beklenen ret gelmedi', v_kol;
    end if;
  end loop;
end
$guard$;

commit;
