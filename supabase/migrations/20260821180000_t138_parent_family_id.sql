-- T138-VH — MODEL katmanı: product_families'e seri↔model bağı (ÜRÜN şeridi)
--
-- Karar: Recep onayı 2026-08-21 (OPS üzerinden) — şema (a) parent_family_id.
-- Gerekçe ÖLÇÜLDÜ (ajan-2 slug-zinciri raporu K1/K3): seri kaydı silinip seri sayfası
-- yalnız series_code'dan türetilseydi, eski seri slug'ına gelen ziyaretçi
-- products/[slug]/page.tsx zincirinde 404'e düşerdi ("seri" varlığı kodda yok).
-- parent_family_id ile SERİ SATIR OLARAK KALIR: eski slug yaşar, landing metni/SEO alanı korunur.
--
-- Model: parent_family_id IS NULL  → SERİ (landing sayfası)
--        parent_family_id NOT NULL → MODEL (vitrin kartı + ürün sayfası)
-- Bugünkü 32 satırın hepsi NULL kalır → davranış DEĞİŞMEZ (geriye dönük uyumlu).
-- Veri taşıma bu migration'da YOKTUR; ayrı betikle, dry-run + envanter + Recep GO ile yapılır
-- (scripts/db/product-data/t138-model-split.mjs, plan: docs/plans/t138-model-katmani-plani-2026-08-21.md).
--
-- Cetvel: product-schema-standard (Split-Model) · rendering-cache-standard · canonical-url-standard.

alter table public.product_families
  add column if not exists parent_family_id uuid
    references public.product_families(id) on delete restrict;

comment on column public.product_families.parent_family_id is
  'NULL = seri (landing sayfası); NOT NULL = model (kart + ürün sayfası). T138-VH, 2026-08-21.';

-- Seri sayfasının modellerini çekmek listeleme yolunun sıcak sorgusudur.
create index if not exists product_families_parent_idx
  on public.product_families (parent_family_id)
  where parent_family_id is not null;

-- Bütünlük: bir satır kendi ebeveyni olamaz (tek-seviye zincirin ilk koşulu).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_families_parent_not_self'
      and conrelid = 'public.product_families'::regclass
  ) then
    alter table public.product_families
      add constraint product_families_parent_not_self
      check (parent_family_id is null or parent_family_id <> id);
  end if;
end $$;

-- Bütünlük: hiyerarşi TEK SEVİYE (seri → model). Bir modelin altına model asılamaz;
-- yani ebeveyni olan bir satır başka satıra ebeveyn olamaz.
create or replace function public.product_families_single_level_guard()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.parent_family_id is not null then
    -- Ebeveynin kendisinin ebeveyni olmamalı (ebeveyn = seri).
    if exists (
      select 1 from public.product_families p
      where p.id = new.parent_family_id and p.parent_family_id is not null
    ) then
      raise exception 'product_families: hiyerarsi TEK SEVIYE (seri -> model); % zaten bir modeldir', new.parent_family_id;
    end if;
  else
    -- Bu satır seri olacaksa, altında model varken ebeveynli hale gelemez (ters yön TG_OP=UPDATE).
    null;
  end if;

  if tg_op = 'UPDATE' and new.parent_family_id is not null and exists (
    select 1 from public.product_families c where c.parent_family_id = new.id
  ) then
    raise exception 'product_families: % satirinin altinda model var, kendisi model yapilamaz', new.id;
  end if;

  return new;
end $$;

drop trigger if exists product_families_single_level on public.product_families;
create trigger product_families_single_level
  before insert or update of parent_family_id on public.product_families
  for each row execute function public.product_families_single_level_guard();
