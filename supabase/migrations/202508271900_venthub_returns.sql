-- Create venthub_returns table for returns/cancellation requests
create table if not exists public.venthub_returns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.venthub_orders(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'requested' check (status in ('requested','approved','rejected','in_transit','received','refunded','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_venthub_returns_user on public.venthub_returns(user_id);
create index if not exists idx_venthub_returns_order on public.venthub_returns(order_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_venthub_returns_updated_at on public.venthub_returns;
create trigger trg_venthub_returns_updated_at
before update on public.venthub_returns
for each row execute function public.set_updated_at();

-- RLS
alter table public.venthub_returns enable row level security;

-- Policies: user can select own returns
create policy if not exists returns_select_own
  on public.venthub_returns for select
  using (user_id = auth.uid());

-- User can insert a return only for their own order
create policy if not exists returns_insert_own_order
  on public.venthub_returns for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.venthub_orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Updates and deletes restricted to service role for now (admin/backoffice)
create policy if not exists returns_update_service
  on public.venthub_returns for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy if not exists returns_delete_service
  on public.venthub_returns for delete
  using (auth.role() = 'service_role');
