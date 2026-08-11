-- F0 — Arşiv + kontrollü tasfiye (Kademe-2 temiz yeniden kuruluş, plan: docs/plans/kademe2-clean-rebuild-2026-08-11.md)
-- 1) Amatör-dönem ürün/sipariş verisinin TAM sadakatli anlık görüntüsü archive_pre_kademe2 şemasına alınır
--    (PostgREST bu şemayı EXPOSE ETMEZ; repo kopyası: docs/archive/db-backup-pre-kademe2/*.json).
-- 2) Satır sayısı guard'ı arşiv==canlı doğrular.
-- 3) FK sırasına uygun tasfiye: siparişler -> sepetler -> ürünler (CASCADE zinciri gerisini götürür).
-- Kullanıcı kararı (2026-08-11): test siparişleri dahil hepsi silinebilir; 388 legacy ürün tasfiye.

begin;

create schema if not exists archive_pre_kademe2;
comment on schema archive_pre_kademe2 is
  'Kademe-2 öncesi (2026-08-11) legacy ürün/sipariş anlık görüntüsü. Salt-arşiv; API''ye açık değil. Fiyat motoru çapraz-kontrolünden sonra düşürülebilir.';

create table archive_pre_kademe2.products            as select * from public.products;
create table archive_pre_kademe2.product_images      as select * from public.product_images;
create table archive_pre_kademe2.product_prices      as select * from public.product_prices;
create table archive_pre_kademe2.inventory_movements as select * from public.inventory_movements;
create table archive_pre_kademe2.venthub_orders      as select * from public.venthub_orders;
create table archive_pre_kademe2.venthub_order_items as select * from public.venthub_order_items;
create table archive_pre_kademe2.shopping_carts      as select * from public.shopping_carts;
create table archive_pre_kademe2.cart_items          as select * from public.cart_items;
create table archive_pre_kademe2.payment_transactions as select * from public.payment_transactions;
create table archive_pre_kademe2.venthub_returns     as select * from public.venthub_returns;
create table archive_pre_kademe2.project_items       as select * from public.project_items;

-- Guard: arşiv sayıları canlı sayılara eşit olmadan tasfiyeye GEÇME.
do $$
declare
  t text;
  live_n bigint;
  arch_n bigint;
begin
  foreach t in array array['products','product_images','product_prices','inventory_movements',
                           'venthub_orders','venthub_order_items','shopping_carts','cart_items',
                           'payment_transactions','venthub_returns','project_items'] loop
    execute format('select count(*) from public.%I', t) into live_n;
    execute format('select count(*) from archive_pre_kademe2.%I', t) into arch_n;
    if live_n <> arch_n then
      raise exception 'F0 arşiv guard: % tablosunda canlı(%) != arşiv(%)', t, live_n, arch_n;
    end if;
  end loop;
end $$;

-- Tasfiye (FK sırası):
-- venthub_orders silinince CASCADE: order_items, order_attachments, order_notes,
--   order_email_events, shipping_email_events, payment_transactions, venthub_returns;
--   inventory_movements.order_id -> SET NULL; wizard_selections.order_id -> SET NULL.
delete from public.venthub_orders;

-- shopping_carts silinince CASCADE: cart_items.
delete from public.shopping_carts;

-- products silinince CASCADE: product_images, product_prices, inventory_movements,
--   product_authorities, project_items, cart_items; wizard_selections.selected_product_id -> SET NULL.
--   (venthub_order_items RESTRICT engeli yukarıdaki sipariş tasfiyesiyle kalktı.)
delete from public.products;

-- Son doğrulama: canlı tablolar boş olmalı.
do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array['products','product_images','product_prices','inventory_movements',
                           'venthub_orders','venthub_order_items','shopping_carts','cart_items'] loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then
      raise exception 'F0 tasfiye guard: % tablosunda % satır kaldı', t, n;
    end if;
  end loop;
end $$;

commit;
