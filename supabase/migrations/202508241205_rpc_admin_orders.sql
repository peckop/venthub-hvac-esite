-- RPC: fn_admin_get_orders ve fn_admin_update_order_status
-- Amaç: RLS etkilerinden bağımsız olarak servis rolü ile güvenilir listeleme/güncelleme

begin;

create or replace function public.fn_admin_get_orders(
  p_id text default null,
  p_conv text default null,
  p_status text default null,
  p_limit int default 10
)
returns setof venthub_orders
language sql
security definer
set search_path = public
as $$
  select *
  from venthub_orders
  where (p_id is null or id = p_id)
    and (p_conv is null or conversation_id = p_conv)
    and (p_status is null or status = p_status)
  order by created_at desc
  limit coalesce(p_limit, 10);
$$;

revoke all on function public.fn_admin_get_orders from public;
grant execute on function public.fn_admin_get_orders to service_role;

create or replace function public.fn_admin_update_order_status(
  p_id text default null,
  p_status text default null,
  p_conv text default null
)
returns venthub_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row venthub_orders;
begin
  update venthub_orders
     set status = p_status
   where (p_id is not null and id = p_id)
      or (p_id is null and p_conv is not null and conversation_id = p_conv)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.fn_admin_update_order_status from public;
grant execute on function public.fn_admin_update_order_status to service_role;

commit;
