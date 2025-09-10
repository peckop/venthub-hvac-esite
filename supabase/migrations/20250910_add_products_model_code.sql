begin;

-- Add model_code (MPN) to products for separating distributor model from SKU
alter table if exists public.products
  add column if not exists model_code text null;

comment on column public.products.model_code is 'Distributor/Manufacturer model code (MPN). Display on PDP as Model; fallback to SKU if null.';

commit;

