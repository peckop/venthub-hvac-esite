-- W4 · Fiyat cache anahtarı + tazelik damgası (T001-VH)
-- Cetvel: docs/standards/pricing-standard.md §8.1 (v1.1)
--
-- NEDEN (v1.1 denetim bulgusu):
--   product_prices tekil anahtarı `(product_id, price_list_id, valid_from)` idi — `currency` YOKTU.
--   Bu, aynı ürünün TRY ve EUR fiyat satırının yan yana durmasını FİZİKSEL olarak engelliyordu;
--   yani "ürün/marka bazında para birimi" gereksiniminin önündeki gerçek engel indeksti (cetvel değil).
--   Tablo şu an BOŞ (0 satır) → düzeltme bedava; cache doldurulduktan sonra göç acılı olurdu.
--
--   Ayrıca `computed_at`: cache satırının NE ZAMAN türetildiği. Kur her gün değiştiği için
--   (liste fiyatları EUR çapalı) bayat satırın tespiti bir tahmin işi olamaz — cetvel §8.1
--   tazelik sözleşmesi bu kolona dayanır.
--
-- GÜVENLİK: yalnız indeks + kolon; veri dönüşümü yok, RLS politikaları değişmiyor.

begin;

-- 1) Tazelik damgası (materialize her yazımda günceller)
alter table public.product_prices
  add column if not exists computed_at timestamptz not null default now();

comment on column public.product_prices.computed_at is
  'Bu cache satırının motor tarafından türetildiği an (cetvel §8.1 tazelik sözleşmesi).';

-- Tazelik damgası DB tarafında tutulur: uygulama katmanı unutamaz/atlayamaz.
-- (Yalnız türetilmiş satırlar için anlamlı; elle-ezme satırında da yazımın anını gösterir.)
create or replace function public.touch_product_prices_computed_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.computed_at := now();
  return new;
end $$;

drop trigger if exists trg_product_prices_computed_at on public.product_prices;
create trigger trg_product_prices_computed_at
  before insert or update on public.product_prices
  for each row execute function public.touch_product_prices_computed_at();

-- 2) Tekil anahtara currency eklenir
--    DİKKAT: `product_prices_unique` bir UNIQUE CONSTRAINT'tir; arkasındaki indeks tek başına
--    düşürülemez (`cannot drop index ... because constraint ... requires it` — 2026-08-14'te
--    prod deploy'u tam burada kırmızıya düştü, migration atomik olduğu için etkisiz geri alındı).
--    Bu yüzden önce kısıt, o yoksa serbest indeks düşürülür: iki kurulumda da çalışır.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.product_prices'::regclass
      and conname = 'product_prices_unique'
  ) then
    alter table public.product_prices drop constraint product_prices_unique;
  else
    execute 'drop index if exists public.product_prices_unique';
  end if;
end $$;

-- Yeni anahtar da KISIT olarak kurulur (eski şekliyle simetri; ON CONFLICT her iki hâlde çalışır).
alter table public.product_prices
  add constraint product_prices_unique unique (product_id, price_list_id, currency, valid_from);

comment on constraint product_prices_unique on public.product_prices is
  'Cache tekil anahtarı: (ürün, fiyat listesi, PARA BİRİMİ, geçerlilik başlangıcı) — cetvel §8.1.';

-- === Guard ===
do $$
declare idx_def text;
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'product_prices'
                   and column_name = 'computed_at') then
    raise exception 'W4 guard: product_prices.computed_at yok';
  end if;

  select indexdef into idx_def from pg_indexes
    where schemaname = 'public' and tablename = 'product_prices' and indexname = 'product_prices_unique';

  if idx_def is null then
    raise exception 'W4 guard: product_prices_unique indeksi yok';
  end if;
  if idx_def not like '%currency%' then
    raise exception 'W4 guard: tekil anahtar currency içermiyor (cetvel §8.1) — %', idx_def;
  end if;
  if idx_def not like '%UNIQUE%' then
    raise exception 'W4 guard: product_prices_unique tekil değil — %', idx_def;
  end if;
end $$;

commit;
