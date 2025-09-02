begin;

-- Ensure FK from venthub_order_items.order_id -> venthub_orders.id
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where table_schema='public' and table_name='venthub_order_items' and constraint_name='venthub_order_items_order_id_fkey'
  ) then
    alter table public.venthub_order_items
      add constraint venthub_order_items_order_id_fkey
      foreign key (order_id) references public.venthub_orders(id) on delete cascade;
  end if;
end$$;

-- Enable RLS on order items
alter table if exists public.venthub_order_items enable row level security;

-- Policy: a user can SELECT items of their own orders
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='venthub_order_items' and policyname='select_own_order_items'
  ) then
    create policy select_own_order_items on public.venthub_order_items
      for select
      using (exists (
        select 1 from public.venthub_orders o
        where o.id = venthub_order_items.order_id and o.user_id = auth.uid()
      ));
  end if;
end$$;

commit;

