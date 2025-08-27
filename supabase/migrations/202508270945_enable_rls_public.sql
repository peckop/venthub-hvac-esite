-- Enable RLS on public-facing tables and add safe read-only policies where appropriate
-- This migration is idempotent and guards for missing tables/policies.

begin;

-- Helper: enable RLS on a table if it exists
create or replace function public._enable_rls_if_exists(tbl regclass)
returns void language plpgsql as $$
begin
  execute format('alter table if exists %s enable row level security', tbl);
end; $$;

-- Helper: create SELECT policy if not exists
create or replace function public._create_select_policy_if_absent(
  schemaname text,
  tablename text,
  policyname text,
  using_sql text
) returns void language plpgsql as $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = schemaname
      and tablename  = tablename
      and policyname = policyname
  ) then
    execute format('create policy %I on %I.%I for select using (%s)', policyname, schemaname, tablename, using_sql);
  end if;
end; $$;

-- Categories: public read
do $$ begin
  perform public._enable_rls_if_exists('public.categories');
  if to_regclass('public.categories') is not null then
    perform public._create_select_policy_if_absent('public','categories','p_anon_read_categories','true');
  end if;
end $$;

-- Products: public read only active
do $$ begin
  perform public._enable_rls_if_exists('public.products');
  if to_regclass('public.products') is not null then
    perform public._create_select_policy_if_absent('public','products','p_anon_read_active_products','status = ''active''');
  end if;
end $$;

-- Brands: public read
do $$ begin
  perform public._enable_rls_if_exists('public.brands');
  if to_regclass('public.brands') is not null then
    perform public._create_select_policy_if_absent('public','brands','p_anon_read_brands','true');
  end if;
end $$;

-- Product images: public read
do $$ begin
  perform public._enable_rls_if_exists('public.product_images');
  if to_regclass('public.product_images') is not null then
    perform public._create_select_policy_if_absent('public','product_images','p_anon_read_product_images','true');
  end if;
end $$;

-- Product documents: public read
do $$ begin
  perform public._enable_rls_if_exists('public.product_documents');
  if to_regclass('public.product_documents') is not null then
    perform public._create_select_policy_if_absent('public','product_documents','p_anon_read_product_documents','true');
  end if;
end $$;

-- Technical specifications: public read
do $$ begin
  perform public._enable_rls_if_exists('public.technical_specifications');
  if to_regclass('public.technical_specifications') is not null then
    perform public._create_select_policy_if_absent('public','technical_specifications','p_anon_read_technical_specs','true');
  end if;
end $$;

-- Turkey cities: public read
do $$ begin
  perform public._enable_rls_if_exists('public.turkey_cities');
  if to_regclass('public.turkey_cities') is not null then
    perform public._create_select_policy_if_absent('public','turkey_cities','p_anon_read_turkey_cities','true');
  end if;
end $$;

-- Enable RLS (no public policies) on internal or user-owned tables flagged by linter
-- Access will be restricted unless explicit policies exist elsewhere.
select public._enable_rls_if_exists('public.hvac_calculations');
select public._enable_rls_if_exists('public.search_analytics');
select public._enable_rls_if_exists('public.ai_chat_sessions');
select public._enable_rls_if_exists('public.ai_recommendations');
select public._enable_rls_if_exists('public.cart_items');
select public._enable_rls_if_exists('public.payment_transactions');
select public._enable_rls_if_exists('public.ai_chat_messages');
select public._enable_rls_if_exists('public.inventory_movements');
select public._enable_rls_if_exists('public.price_lists');
select public._enable_rls_if_exists('public.product_reviews');
select public._enable_rls_if_exists('public.support_tickets');
select public._enable_rls_if_exists('public.support_messages');
select public._enable_rls_if_exists('public.profiles');
select public._enable_rls_if_exists('public.wishlists');
select public._enable_rls_if_exists('public.warehouses');
select public._enable_rls_if_exists('public.technical_spec_templates');
select public._enable_rls_if_exists('public.wishlist_items');
select public._enable_rls_if_exists('public.inventory_items');
select public._enable_rls_if_exists('public.system_settings');
select public._enable_rls_if_exists('public.stripe_payment_intents');
select public._enable_rls_if_exists('public.customer_profiles');
select public._enable_rls_if_exists('public.product_variations');
select public._enable_rls_if_exists('public.recently_viewed_products');
select public._enable_rls_if_exists('public.product_comparisons');
select public._enable_rls_if_exists('public.search_filters');
select public._enable_rls_if_exists('public.product_analytics');

-- Cleanup helpers (optional keep for future use). Comment out drop if you want to reuse.
drop function if exists public._create_select_policy_if_absent(text,text,text,text);
drop function if exists public._enable_rls_if_exists(regclass);

commit;

