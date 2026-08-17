-- T052-VH ek — geri-verme defteri LEGACY 'return' hareketlerini de saymali
--
-- NIYE. #552 dusme kapisini ACTI: satista stok artik gercekten dusuyor ve her dusus
-- `inventory_movements`'a `reason='order_sale'` satiri yaziyor. Ama geri-ekleme yollarinin
-- UCU hala goc etmedi (baska seritlerde: orderStatusService → ADMIN-OPS · iyzico-refund +
-- refund-order-mock → EDGE-REFUND) ve ikisi stogu **deftere gorunmez** sekilde geri veriyor:
--   · orderStatusField yolu  → hareketi `reason='return'` ile yaziyor
--   · iyzico-refund          → hicbir hareket YAZMIYOR (yalnizca products.stock_qty PATCH)
--
-- ACIK. `process_order_stock_restore` "daha once geri verildi mi" hesabini yaparken yalniz
-- ('order_cancel','order_refund','order_expire') sebeplerine bakiyordu. Eski yolla geri
-- verilmis bir siparis icin defter "hic geri verilmemis" der ve RPC AYNI MIKTARI BIR DAHA
-- geri verir → cift geri-ekleme. Kapi kapaliyken bu tehlike yoktu (dusus de yoktu);
-- kapiyi acmak onu yaratti.
--
-- DUZELTME. `'return'` de "geri verilmis" sayilir. Genel bir yumusatma degil, ADI KONMUS
-- bir kalem: eski yolun izi. Yeni kodda `'return'` yazilmiyor; goc bitince bu satir
-- yalnizca tarihsel veriyi dogru okumaya yarar.
--
-- OLCUM (2026-08-16): siparis 0 · kalem 0 · hareket 0. Yani bugun somut bir zarar YOK —
-- ilk gercek siparis girdiginde olurdu. Bos-tablo penceresi hala aciktir, kullanildi.
--
-- Gerisi 20260815224500_stock_restore_evidence_and_reduction_gate.sql ile AYNI.

begin;

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
  -- Yetki kapisi: `public.adjust_stock` ile BIREBIR AYNI. `user_profiles.role` mesru bir
  -- kaynak: `trg_enforce_role_change` kullanicinin KENDI rolunu degistirmesini engelliyor.
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin', 'warehouse', 'moderator')
  )) then
    raise exception 'not authorized';
  end if;

  -- Yazma sebebi sozlugu DEGISMEDI: yeni kayitlar yalniz bu ucunden biriyle yazilir.
  -- `'return'` bilerek burada YOK — okumada sayilir, yazmada kabul edilmez.
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

  perform 1 from public.venthub_orders where id = v_order_uuid for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Order not found', 'restored_count', 0);
  end if;

  for v_item in
    select
      im.product_id,
      sum(case when im.reason = 'order_sale' then -im.delta else 0 end) as deducted,
      -- 'return' EKLENDI: goc etmemis yollarin izi. Bunu saymamak cift geri-ekleme demek.
      sum(case when im.reason in ('order_cancel', 'order_refund', 'order_expire', 'return')
               then im.delta else 0 end) as restored
    from public.inventory_movements im
    where im.order_id = v_order_uuid
    group by im.product_id
  loop
    v_qty := v_item.deducted - v_item.restored;
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

commit;
