-- supabase/migrations/20250917_rate_limit.sql
-- Basic rate-limiting state table + helper function
-- Tracks request counts per key in a rolling window using minute buckets.

create table if not exists public.rate_limits (
  key text not null,
  bucket timestamptz not null,
  count integer not null default 0,
  constraint rate_limits_pkey primary key (key, bucket)
);

-- Optional: retention policy via trigger or a scheduled job could prune old buckets

create or replace function public.bump_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns table(allowed boolean, remaining int, reset_at timestamptz) language plpgsql as $$
declare
  now_ts timestamptz := now();
  bucket_ts timestamptz := date_trunc('minute', now_ts);
  window_start timestamptz := now_ts - make_interval(secs => p_window_seconds);
  total int := 0;
  resets_at timestamptz := bucket_ts + interval '1 minute';
begin
  -- upsert current bucket
  insert into public.rate_limits(key, bucket, count)
  values (p_key, bucket_ts, 1)
  on conflict (key, bucket) do update set count = public.rate_limits.count + 1;

  -- sum counts within window
  select coalesce(sum(count), 0) into total
  from public.rate_limits
  where key = p_key and bucket >= date_trunc('minute', window_start);

  if total <= p_limit then
    return query select true as allowed, greatest(p_limit - total, 0) as remaining, resets_at as reset_at;
  else
    return query select false as allowed, 0 as remaining, resets_at as reset_at;
  end if;
end $$;

-- Helpful index for pruning/queries
create index if not exists rate_limits_bucket_idx on public.rate_limits (bucket);
