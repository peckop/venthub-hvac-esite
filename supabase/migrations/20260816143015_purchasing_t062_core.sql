-- T062-VH — Satinalma modulu v1 cekirdegi (D2)
-- Cetvel: docs/standards/purchasing-standard.md v1.0 (PR #569) — §2 varlik modeli,
-- §3 durum makinesi, §4 kanit satiri, §5 maliyet ilkeleri, §6 RLS, §9 migration disiplini.
--
-- DAMGA NOTU: gercek saat 13:15'ti ama ledger'daki son uygulanmis dosya 20260816140000
-- (yuvarlak damga). Yeni dosya bayt-sirasinda uygulanmislarin ARKASINA dusmek zorunda
-- (sessiz-atlama riski); bu yuzden 143015. Ad = kimlik, sonradan degistirilemez.
--
-- KAPSAM KARARLARI (cetvel + Recep-onayli cerceve):
--   · `products.purchase_price`/`purchase_currency`/`purchase_rate_to_base`'e DOKUNULMAZ —
--     katalog liste fiyati ve fiyat motorunun canli girdisi. Gercek alis maliyeti PO
--     satirinda snapshot'lanir, urune YENI `last_purchase_*` alanlariyla yansir.
--   · Fiyat motoru koprusu v1'de KAPALI: bu dosyada refreshCostInBase/materialize
--     zincirine dokunan HICBIR SEY yok; acilis sartlari cetvel §5.4.
--   · `inventory_movements` yeni kolonlari NULLABLE + kosullu CHECK: yalniz
--     reason='purchase_receipt' satirlari zorunlulugu tasir → mevcut satirlara
--     backfill GEREKMEZ (0-siparis penceresine bile ihtiyac kalmadi).

begin;

-- ============================================================================
-- 1) suppliers — tedarikci karti
-- ============================================================================
-- Mevcut `products.supplier_name` (serbest metin) v1'de KALIR; FK gocu v2 (cetvel §12).
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  name text not null,
  tax_no text null,
  contact_name text null,
  email text null,
  phone text null,
  -- Varsayilan alis para birimi; PO acilisinda onerilir, PO kendi degerini tasir.
  currency char(3) not null default 'TRY' check (char_length(currency) = 3),
  is_active boolean not null default true,
  note text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_tenant_name_uniq unique (tenant_id, name)
);

comment on table public.suppliers is
  'Tedarikci kartlari (purchasing-standard §2). products.supplier_name serbest metni v1''de kalir; FK gocu v2.';

-- ============================================================================
-- 2) purchase_orders — PO basligi
-- ============================================================================
-- Statu sozlugu SSOT modul `src/lib/purchasing/poStatusMachine.ts` ile BIREBIR aynidir;
-- INV-PURCH-1/R1 pariteyi dogrular (T052 dersi: sozluk iki yerde ayri yasayamaz —
-- RPC kapisi CHECK'te olmayan 'paid' bekliyordu ve stok hic dusmedi).
-- `partially_received` / `received` ELLE SECILMEZ; process_goods_receipt turetir (§3.2).
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'draft' check (
    status in ('draft', 'ordered', 'partially_received', 'received', 'closed', 'cancelled')
  ),
  currency char(3) not null check (char_length(currency) = 3),
  expected_at date null,
  note text null,
  -- Kisa kapama (partially_received → closed) gerekcesi. Zorunlulugu servis katmani
  -- uygular (cetvel §3.1); DB'de kolon tasinir ki karar izlenebilir kalsin.
  close_note text null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.purchase_orders is
  'Satinalma siparisi basligi (purchasing-standard §3). Monoton durum makinesi; ara statuler process_goods_receipt tarafindan TURETILIR, elle secilemez.';

create index if not exists purchase_orders_tenant_status_idx
  on public.purchase_orders (tenant_id, status);
create index if not exists purchase_orders_supplier_idx
  on public.purchase_orders (supplier_id);

-- ============================================================================
-- 3) purchase_order_items — PO satiri (maliyet SNAPSHOT'i burada dogar)
-- ============================================================================
-- `unit_cost` + `currency` siparis aninin gercegini tasir ve orada KALIR (cetvel §5.1;
-- W2b-2 ilkesinin alis tarafi). `qty_received` turevdir: yalniz process_goods_receipt yazar.
create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  po_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty_ordered integer not null check (qty_ordered > 0),
  qty_received integer not null default 0 check (qty_received >= 0),
  unit_cost numeric not null check (unit_cost >= 0),
  currency char(3) not null check (char_length(currency) = 3),
  tax_rate numeric not null default 0 check (tax_rate >= 0 and tax_rate <= 100),
  created_at timestamptz not null default now(),
  -- Asiri kabul DB katinda da imkansiz (RPC ayrica dogrular — cift kilit).
  constraint purchase_order_items_receipt_cap check (qty_received <= qty_ordered),
  constraint purchase_order_items_po_product_uniq unique (po_id, product_id)
);

comment on table public.purchase_order_items is
  'PO satiri (purchasing-standard §5.1). unit_cost+currency siparis ani SNAPSHOT''idir; qty_received yalniz process_goods_receipt tarafindan yazilir.';

create index if not exists purchase_order_items_po_idx on public.purchase_order_items (po_id);
create index if not exists purchase_order_items_product_idx on public.purchase_order_items (product_id);

-- ============================================================================
-- 4) goods_receipts — mal kabul basligi
-- ============================================================================
-- Satir kaniti AYRI tablo degildir: kanit inventory_movements satiridir (cetvel §4).
-- (po_id, document_no) UNIQUE = idempotens birinci kilidi (ayni irsaliye iki kez islenemez).
create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  po_id uuid not null references public.purchase_orders(id) on delete restrict,
  document_no text not null check (btrim(document_no) <> ''),
  received_by uuid null,
  received_at timestamptz not null default now(),
  note text null,
  created_at timestamptz not null default now(),
  constraint goods_receipts_po_document_uniq unique (po_id, document_no)
);

comment on table public.goods_receipts is
  'Mal kabul basligi (purchasing-standard §4). Kanit satirlari inventory_movements''ta (reason=purchase_receipt, goods_receipt_id FK).';

create index if not exists goods_receipts_po_idx on public.goods_receipts (po_id);

-- ============================================================================
-- 5) inventory_movements — kanit alanlari (kosullu zorunluluk)
-- ============================================================================
alter table public.inventory_movements
  add column if not exists unit_cost numeric null,
  add column if not exists unit_cost_currency char(3) null,
  add column if not exists goods_receipt_id uuid null references public.goods_receipts(id) on delete restrict;

-- Yeni satir turu kendi zorunlulugunu tasir; mevcut satirlar (reason≠purchase_receipt)
-- etkilenmez → backfill yok. purchase_receipt HICBIR restore/iade sozlugune girmez ve
-- order_id tasimaz; process_order_stock_restore hesabi order_id kapsaminda calistigi
-- icin iki matematik kesismez (cetvel §4, olculdu).
alter table public.inventory_movements
  drop constraint if exists inventory_movements_purchase_receipt_evidence;
alter table public.inventory_movements
  add constraint inventory_movements_purchase_receipt_evidence check (
    reason <> 'purchase_receipt'
    or (
      goods_receipt_id is not null
      and unit_cost is not null and unit_cost >= 0
      and unit_cost_currency is not null
      and delta > 0
      and order_id is null
    )
  );

create index if not exists inventory_movements_goods_receipt_idx
  on public.inventory_movements (goods_receipt_id) where goods_receipt_id is not null;

-- ============================================================================
-- 6) products — son alis yansimasi (YENI alanlar; purchase_price'a dokunulmaz)
-- ============================================================================
-- Rapor/gorunurluk alanlari (cetvel §5.3). Motor zinciri bunlari OKUMAZ (v1).
-- Yalniz process_goods_receipt yazar (son kabul kazanir).
alter table public.products
  add column if not exists last_purchase_cost numeric null check (last_purchase_cost >= 0),
  add column if not exists last_purchase_currency char(3) null,
  add column if not exists last_purchased_at timestamptz null;

-- ============================================================================
-- 7) process_goods_receipt — stok girisinin TEK yazma yolu
-- ============================================================================
-- p_lines: [{"product_id": uuid, "qty": int, "unit_cost": numeric|null}, ...]
--   unit_cost verilmezse PO satiri snapshot'i kullanilir (fatura farki girilebilir).
-- YA HEPSI YA HICBIRI: tum satirlar YAZMADAN ONCE dogrulanir; tek hata tum kabulu
-- reddeder (kismi kabul, irsaliyenin kendisi kismi oldugunda p_lines ile ifade edilir).
-- Zarf kurali: cagiran `success === true` kontrol eder; HTTP 200'e guvenmek yasak (T052).
create or replace function public.process_goods_receipt(
  p_po_id uuid,
  p_document_no text,
  p_lines jsonb,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog, public'
as $fn$
declare
  v_po record;
  v_line record;
  v_poi record;
  v_receipt_id uuid;
  v_cost numeric;
  v_processed int := 0;
  v_units int := 0;
  v_total_ordered int;
  v_total_received int;
  v_new_status text;
begin
  -- Yetki kapisi: adjust_stock / process_order_stock_restore ile BIREBIR AYNI desen.
  -- user_profiles.role mesru kaynak: trg_enforce_role_change kullanicinin kendi rolunu
  -- degistirmesini engelliyor (olculdu 2026-08-15, T052 migration'indaki gerekce).
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin', 'warehouse', 'moderator')
  )) then
    raise exception 'not authorized';
  end if;

  if p_document_no is null or btrim(p_document_no) = '' then
    return jsonb_build_object('success', false, 'error', 'document_no required', 'processed_count', 0);
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    return jsonb_build_object('success', false, 'error', 'lines must be a non-empty array', 'processed_count', 0);
  end if;

  -- PO'yu kilitle: es zamanli iki kabul ayni kalan-miktari iki kez kullanamasin
  -- (restore RPC'sindeki FOR UPDATE dersi — kilitsiz hesap-idempotensi yarisa aciktir).
  select * into v_po from public.purchase_orders where id = p_po_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'PO not found', 'processed_count', 0);
  end if;

  -- Tenant kapisi (kural 12): tarayici JWT'siyle gelen cagri baska tenant'in PO'suna
  -- dokunamaz. service_role sunucu tarafidir, kapsam disidir.
  if coalesce(auth.role(), '') <> 'service_role'
     and v_po.tenant_id is distinct from public.jwt_tenant_id() then
    raise exception 'not authorized';
  end if;

  -- Durum kapisi: kabul yalniz ordered / partially_received uzerinde (cetvel §3).
  if v_po.status not in ('ordered', 'partially_received') then
    return jsonb_build_object(
      'success', false,
      'error', 'PO not receivable in status ' || v_po.status,
      'processed_count', 0
    );
  end if;

  -- ---- DOGRULAMA TURU (hicbir yazma yok) ----
  -- Ayni urun p_lines'ta iki kez gecemez: tek tek dogrulama toplami goremezdi;
  -- tavan asimini DB CHECK yakalardi ama zarif zarf yerine exception olurdu.
  if exists (
    select 1 from jsonb_array_elements(p_lines) elem
    group by elem->>'product_id' having count(*) > 1
  ) then
    return jsonb_build_object('success', false, 'error', 'duplicate product in lines', 'processed_count', 0);
  end if;

  for v_line in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'qty')::int         as qty,
      (elem->>'unit_cost')::numeric as unit_cost
    from jsonb_array_elements(p_lines) elem
  loop
    if v_line.product_id is null or v_line.qty is null or v_line.qty <= 0 then
      return jsonb_build_object('success', false, 'error', 'invalid line (product_id/qty)', 'processed_count', 0);
    end if;
    if v_line.unit_cost is not null and v_line.unit_cost < 0 then
      return jsonb_build_object('success', false, 'error', 'invalid line (negative unit_cost)', 'processed_count', 0);
    end if;

    select * into v_poi
    from public.purchase_order_items
    where po_id = p_po_id and product_id = v_line.product_id
    for update;
    if not found then
      return jsonb_build_object('success', false, 'error', 'product not on PO: ' || v_line.product_id, 'processed_count', 0);
    end if;

    -- Asiri kabul yasak (cetvel §4) — DB CHECK'i ikinci kilit, burasi anlasilir mesaj.
    if v_poi.qty_received + v_line.qty > v_poi.qty_ordered then
      return jsonb_build_object(
        'success', false,
        'error', 'over-receipt for product ' || v_line.product_id
                 || ' (received ' || v_poi.qty_received || ' + ' || v_line.qty
                 || ' > ordered ' || v_poi.qty_ordered || ')',
        'processed_count', 0
      );
    end if;
  end loop;

  -- ---- YAZMA TURU ----
  -- Idempotens birinci kilidi: ayni irsaliye no ikinci kez gelirse UNIQUE reddeder.
  begin
    insert into public.goods_receipts (tenant_id, po_id, document_no, received_by, note)
    values (v_po.tenant_id, p_po_id, btrim(p_document_no), auth.uid(), p_note)
    returning id into v_receipt_id;
  exception when unique_violation then
    return jsonb_build_object(
      'success', false,
      'error', 'document_no already processed for this PO (idempotent reject)',
      'processed_count', 0
    );
  end;

  for v_line in
    select
      (elem->>'product_id')::uuid as product_id,
      (elem->>'qty')::int         as qty,
      (elem->>'unit_cost')::numeric as unit_cost
    from jsonb_array_elements(p_lines) elem
  loop
    select * into v_poi
    from public.purchase_order_items
    where po_id = p_po_id and product_id = v_line.product_id;

    -- Fatura farki girildiyse onu, girilmediyse PO satiri snapshot'ini kullan (cetvel §5.1).
    v_cost := coalesce(v_line.unit_cost, v_poi.unit_cost);

    update public.products
      set stock_qty = coalesce(stock_qty, 0) + v_line.qty,
          last_purchase_cost = v_cost,
          last_purchase_currency = v_poi.currency,
          last_purchased_at = now()
      where id = v_line.product_id;

    -- KANIT SATIRI (cetvel §4): stok girisi ancak bu satirla var olur.
    insert into public.inventory_movements
      (product_id, delta, reason, unit_cost, unit_cost_currency, goods_receipt_id)
    values
      (v_line.product_id, v_line.qty, 'purchase_receipt', v_cost, v_poi.currency, v_receipt_id);

    update public.purchase_order_items
      set qty_received = qty_received + v_line.qty
      where id = v_poi.id;

    v_processed := v_processed + 1;
    v_units := v_units + v_line.qty;
  end loop;

  -- Statu TURETME (cetvel §3.2): elle secim yok, miktarlar soyler.
  select sum(qty_ordered), sum(qty_received)
    into v_total_ordered, v_total_received
  from public.purchase_order_items
  where po_id = p_po_id;

  v_new_status := case when v_total_received >= v_total_ordered then 'received' else 'partially_received' end;

  update public.purchase_orders
    set status = v_new_status, updated_at = now()
    where id = p_po_id;

  return jsonb_build_object(
    'success', true,
    'receipt_id', v_receipt_id,
    'processed_count', v_processed,
    'received_units', v_units,
    'po_status', v_new_status
  );
end;
$fn$;

-- Grant modeli process_order_stock_restore ile ayni: yetki karari fonksiyon ICINDEKI
-- kapida; grant tek basina yetki degildir. `anon` ACIKCA revoke edilir — `from public`
-- rol-ozel varsayilan grant'lari kaldirmaz (#559'da olculen tuzak).
revoke all on function public.process_goods_receipt(uuid, text, jsonb, text) from public;
revoke execute on function public.process_goods_receipt(uuid, text, jsonb, text) from anon;
grant execute on function public.process_goods_receipt(uuid, text, jsonb, text) to service_role, authenticated;

-- ============================================================================
-- 8) RLS — dort tablo, pricing_policy deseninin AYNISI (cetvel §6)
-- ============================================================================
-- Maliyet bilgisi hassas: okuma-yazma yalniz admin rolleri (super_admin/admin/moderator;
-- olu yazim 'superadmin' YASAK). Mal kabul RPC'si SECURITY DEFINER oldugu icin RLS'e
-- takilmaz; kendi kapisi warehouse'u da icerir. Client'tan dogrudan yazma zaten
-- INV-PURCH-1/R2 ile taranir — RLS son savunma hattidir, tek hat degil.

alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.goods_receipts enable row level security;

-- suppliers
drop policy if exists suppliers_admin_select on public.suppliers;
create policy suppliers_admin_select on public.suppliers for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists suppliers_admin_insert on public.suppliers;
create policy suppliers_admin_insert on public.suppliers for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists suppliers_admin_update on public.suppliers;
create policy suppliers_admin_update on public.suppliers for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));

-- purchase_orders
drop policy if exists purchase_orders_admin_select on public.purchase_orders;
create policy purchase_orders_admin_select on public.purchase_orders for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_orders_admin_insert on public.purchase_orders;
create policy purchase_orders_admin_insert on public.purchase_orders for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_orders_admin_update on public.purchase_orders;
create policy purchase_orders_admin_update on public.purchase_orders for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_orders_admin_delete on public.purchase_orders;
create policy purchase_orders_admin_delete on public.purchase_orders for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));

-- purchase_order_items
drop policy if exists purchase_order_items_admin_select on public.purchase_order_items;
create policy purchase_order_items_admin_select on public.purchase_order_items for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_order_items_admin_insert on public.purchase_order_items;
create policy purchase_order_items_admin_insert on public.purchase_order_items for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_order_items_admin_update on public.purchase_order_items;
create policy purchase_order_items_admin_update on public.purchase_order_items for update to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])))
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists purchase_order_items_admin_delete on public.purchase_order_items;
create policy purchase_order_items_admin_delete on public.purchase_order_items for delete to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));

-- goods_receipts — kanit basligi: admin OKUR; insert RPC uzerinden gelir (definer),
-- yine de desen butunlugu icin ayni politika seti kurulur. UPDATE/DELETE politikasi
-- BILEREK YOK: kabul basligi kanittir, degistirilmez/silinmez (RLS'te politika yoklugu
-- = o eylem kimseye acik degil; service_role zaten RLS-bypass).
drop policy if exists goods_receipts_admin_select on public.goods_receipts;
create policy goods_receipts_admin_select on public.goods_receipts for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));
drop policy if exists goods_receipts_admin_insert on public.goods_receipts;
create policy goods_receipts_admin_insert on public.goods_receipts for insert to authenticated
  with check (tenant_id = (select public.jwt_tenant_id()) and exists (
    select 1 from public.user_profiles up where up.id = (select auth.uid())
      and up.role::text = any (array['super_admin', 'admin', 'moderator'])));

commit;
