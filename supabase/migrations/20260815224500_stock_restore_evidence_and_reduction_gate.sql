-- T052-VH — Satista stok DUSMUYOR, iptalde SISIYOR
-- Kaynak: docs/audits/operasyon-dongusu-denetimi-2026-08-15.md §2 (PR #550)
--
-- ARIZA (canli DB'de dogrulandi, 2026-08-15):
--   `process_order_stock_reduction`'in ilk kapisi `status IN ('paid','processing')`.
--   Ama `venthub_orders_status_check` sozlugu: pending/confirmed/processing/shipped/
--   delivered/cancelled — yani **'paid' HIC GECERLI BIR STATU DEGIL**. Basarili odemede
--   callback `status='confirmed', payment_status='paid'` yaziyor. Kapi hicbir zaman
--   acilmiyor, RPC her seferinde "Order not found or not in processed state" donuyor.
--   Callback yalnizca HTTP 200'e bakip `payment_debug.stock_processed=true` damgasi
--   basiyor → arizanin uzerine "basarili" yaziliyor. Satista stok HIC dusmuyor.
--
--   Karsi yonde UC yol kosulsuz stok geri ekliyor (dusulmus mu diye BAKMADAN):
--     · src/lib/orderStatusService.ts        — read-then-write yarisi + 'return' hareketi
--     · supabase/functions/iyzico-refund     — hareket kaydi HIC YAZMIYOR (yalniz stock_qty)
--     · release-expired-reservations         — odemesi alinmamis `pending` icin +quantity
--   Ucu de "hayali stok" uretir: hic dusulmemis miktari geri ekler.
--
-- DUZELTME SIRASI KRITIK (Recep'in talimati). ONCE geri-ekleme kaniti sarti, SONRA
-- dusme kapisi. Ters sira stogu CIFT YONLU saptirir: kapi acilir, stok dusmeye baslar,
-- ama kosulsuz geri-ekleme yollari hala acikken bir iptal iki kat geri ekler.
-- Bu dosyada 1. bolum kaniti kurar, 2. bolum kapiyi acar — ayni islemde ve bu sirada.
--
-- TASARIM KARARI: uc yolu tek tek yamamak yerine **tek kanita-bagli RPC**. Uc kopya,
-- uc ayri sapma yolu demek (ayni ders: scripts/webhook_setup.sql tek kaynaga indirilmisti).

begin;

-- ============================================================================
-- 1) ONCE: kanita bagli geri-ekleme. Yalnizca GERCEKTEN DUSULMUS olani geri verir.
-- ============================================================================
--
-- Kanit = `inventory_movements` uzerindeki `order_sale` satirlari. Siparis kalemlerinden
-- (`venthub_order_items`) DEGIL — cunku "siparis ne kadardi" ile "stoktan ne kadar
-- dusuldu" ayni sey degil ve tam bu fark hayali stogu uretiyordu.
--
-- Idempotenslik hesapla gelir, bayrakla degil: her urun icin
--   geri verilecek = (dusulen toplam) - (daha once geri verilen toplam)
-- Bu fark <= 0 ise o urun atlanir. Fonksiyon ikinci kez cagrildiginda hicbir sey yapmaz;
-- kismi geri-vermeler de kendiliginden tamamlanir. "Zaten yapildi mi" diye ayri bir bayrak
-- tutulmaz — bayrak, hareket kaydiyla ayrisabilirdi.
create or replace function public.process_order_stock_restore(
  p_order_id text,
  p_reason   text
)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog, public'
as $fn$
declare
  v_order_uuid uuid;
  v_item record;
  v_qty int;
  v_restored_count int := 0;
  v_restored_units int := 0;
begin
  -- Yetki kapisi: `public.adjust_stock` ile BIREBIR AYNI. Kasitli olarak ayni kapi —
  -- bu fonksiyon da stok yazar, farkli bir esik uygulamasi icin sebep yok.
  -- `user_profiles.role` burada mesru bir kaynak: `trg_enforce_role_change` tetigi
  -- kullanicinin KENDI rolunu degistirmesini engelliyor (yalniz super_admin degistirebilir),
  -- yani kullanici-yazabilir bir alan DEGIL. (Olculdu: 2026-08-15.)
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin', 'warehouse', 'moderator')
  )) then
    raise exception 'not authorized';
  end if;

  -- Gecerli geri-verme sebepleri. Serbest metin kabul edilmez: sebep, sonraki
  -- idempotenslik hesabinin girdisidir — sozluk disi bir deger o hesabi kor eder.
  if p_reason is null or p_reason not in ('order_cancel', 'order_refund', 'order_expire') then
    return jsonb_build_object(
      'success', false,
      'error', 'Invalid reason (expected order_cancel|order_refund|order_expire)',
      'restored_count', 0
    );
  end if;

  begin
    v_order_uuid := p_order_id::uuid;
  exception when invalid_text_representation then
    return jsonb_build_object('success', false, 'error', 'Invalid order ID format', 'restored_count', 0);
  end;

  -- Siparis satirini kilitle: iki es zamanli iptal/iade cagrisi ayni farki iki kez
  -- hesaplayip iki kez geri veremesin. Kilit YOKSA hesap-tabanli idempotenslik de
  -- yarisa aciktir (ikisi de "henuz geri verilmemis" gorur).
  perform 1 from public.venthub_orders where id = v_order_uuid for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Order not found', 'restored_count', 0);
  end if;

  for v_item in
    select
      im.product_id,
      sum(case when im.reason = 'order_sale' then -im.delta else 0 end) as deducted,
      sum(case when im.reason in ('order_cancel', 'order_refund', 'order_expire') then im.delta else 0 end) as restored
    from public.inventory_movements im
    where im.order_id = v_order_uuid
    group by im.product_id
  loop
    v_qty := v_item.deducted - v_item.restored;
    -- KANIT KAPISI: dusulmemisse geri verilecek bir sey yoktur. `pending` bir siparisin
    -- suresi doldugunda buraya duser ve HICBIR SEY yapmaz — eski davranis burada
    -- +quantity yazip hayali stok uretiyordu.
    continue when v_qty <= 0;

    update public.products
      set stock_qty = coalesce(stock_qty, 0) + v_qty
      where id = v_item.product_id;

    insert into public.inventory_movements (product_id, order_id, delta, reason)
    values (v_item.product_id, v_order_uuid, v_qty, p_reason);

    v_restored_count := v_restored_count + 1;
    v_restored_units := v_restored_units + v_qty;
  end loop;

  return jsonb_build_object(
    'success', true,
    'restored_count', v_restored_count,
    'restored_units', v_restored_units,
    'reason', p_reason,
    'order_id', p_order_id
  );
end;
$fn$;

-- `authenticated` de cagirabilir cunku admin panelindeki iptal/iade akisi tarayicidan,
-- kullanicinin kendi JWT'siyle kosuyor (src/lib/orderStatusService.ts). Yetki karari
-- fonksiyonun ICINDEKI kapida verilir — grant tek basina yetki degildir.
revoke all on function public.process_order_stock_restore(text, text) from public;
grant execute on function public.process_order_stock_restore(text, text) to service_role, authenticated;

-- ============================================================================
-- 2) SONRA: dusme kapisini gercek statu sozlugune ac.
-- ============================================================================
--
-- `'paid'` KALDIRILDI — statu sozlugunde boyle bir deger yok, `venthub_orders_status_check`
-- reddediyor. Kapida durmasi tek bir ise yariyordu: kapinin acildigi izlenimi vermeye.
-- Odeme sinyali `payment_status='paid'`, yasam dongusu sinyali `status='confirmed'`.
-- Kapi ikisini de arar: yalnizca statuye bakmak, elle 'confirmed' yapilan odenmemis bir
-- siparisin stogunu dusururdu.
--
-- Gerisi 20260524_idempotent_stock_reduction.sql ile AYNI. Tek fark disinda bir sey daha
-- degisti: yetersiz stok artik `success=false` doner. Eskiden `success:true` +
-- `failed_products:[...]` donuyordu ve callback bunu basari sayip damgayi basiyordu —
-- "kismen basarisiz" ile "basarili" ayni gorunuyordu.
create or replace function public.process_order_stock_reduction(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog, public'
as $fn$
declare
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
begin
  begin
    v_order_uuid := p_order_id::uuid;
  exception when invalid_text_representation then
    return jsonb_build_object('success', false, 'error', 'Invalid order ID format', 'processed_count', 0);
  end;

  -- Satir kilidi: ayni siparis icin ikinci webhook bu islem bitene kadar bekler.
  select exists(
    select 1 from public.venthub_orders
    where id = v_order_uuid
      and status in ('confirmed', 'processing')
      and payment_status = 'paid'
    for update
  ) into v_order_exists;

  if not v_order_exists then
    return jsonb_build_object(
      'success', false,
      'error', 'Order not found or not in a paid/processed state',
      'processed_count', 0
    );
  end if;

  -- Idempotenslik: bu siparis icin zaten `order_sale` hareketi varsa tekrar dusme.
  if exists(
    select 1 from public.inventory_movements
    where (order_id = v_order_uuid or batch_id = v_order_uuid)
      and reason = 'order_sale'
  ) then
    return jsonb_build_object(
      'success', true,
      'message', 'Stock already reduced for this order',
      'processed_count', 0,
      'order_id', p_order_id
    );
  end if;

  for v_item in
    select oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    from public.venthub_order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = v_order_uuid
  loop
    begin
      v_current_stock := coalesce(v_item.stock_qty, 0);

      if v_current_stock >= v_item.quantity then
        perform public.adjust_stock(v_item.product_id, -v_item.quantity, 'order_sale', v_order_uuid);

        -- Hareketi siparise bagla: geri-verme hesabinin KANITI bu satirdir.
        update public.inventory_movements
          set order_id = v_order_uuid
          where batch_id = v_order_uuid
            and product_id = v_item.product_id
            and order_id is null;

        v_processed_count := v_processed_count + 1;
      else
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      end if;

    exception when others then
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || sqlerrm || ')');
    end;
  end loop;

  return jsonb_build_object(
    -- Kismi basarisizlik BASARI DEGILDIR: cagiran taraf damgayi buna gore basar.
    'success', (array_length(v_failed_products, 1) is null),
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );
end;
$fn$;

commit;
