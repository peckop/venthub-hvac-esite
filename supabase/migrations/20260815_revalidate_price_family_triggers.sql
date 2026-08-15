-- Webhook tetik boşluğu: product_prices / product_families → ISR revalidate (T018-VH takibi)
-- Cetvel: product-schema-standard.md §2.2 PS-042 (fiyat/stok değişimi keşif önbelleğini
-- TETİKLEMEMELİ — cache thrashing yasak; fiyat yalnız PDP'de gösterilir, kartlarda değil)
--
-- SORUN (2026-08-14 gece ölçüldü): prod'da webhook tetikleri yalnız products/categories/
-- inventory_movements tablolarında var. Aynı gece 1044 satır product_prices yazıldı ama
-- hiçbir sayfa tazelenmedi — çünkü product_prices'ta HİÇ tetik yok. product_families'te de
-- route.ts handler'ı zaten var (bkz. src/app/api/webhook/supabase/route.ts case 4) ama onu
-- tetikleyecek DB tetiği hiç kurulmamış (ölü kod yolu).
--
-- ÇÖZÜM: prod'daki `on_products_change` / `on_categories_change` / `on_inventory_movements_change`
-- tetikleriyle BİREBİR AYNI desen (AFTER INSERT OR DELETE OR UPDATE ... FOR EACH ROW EXECUTE
-- FUNCTION handle_supabase_webhook()) — bu fonksiyon jenerik, tablo adını TG_TABLE_NAME'den
-- dinamik okuyor (hardcode YOK), route.ts tarafı `table` alanına göre dallanıyor. Bu migration
-- yalnız eksik tetikleri ekler; route.ts tarafındaki handler'lar ayrı PR'da (T018-VH) eklendi.
--
-- PS-042 KORUMASI: product_prices tetiği route.ts'te YALNIZ ilgili ürünün AİLE PDP yolunu
-- (`/tr/products/{familySlug}`, `/en/products/{familySlug}`) revalidate eder; keşif
-- (home-data/products-discovery) tag'lerine BİLİNÇLİ OLARAK dokunmaz.

begin;

-- 1) product_prices: fiyat değişince PDP tazelensin (kart/keşif etkilenmez — PS-042)
--
--    İKİ AYRI TETİK, TEK DEĞİL. Sebep ölçüldü: `materializePrices` tabloyu KOMPLE yeniden
--    yazıyor (1044 satır toplu upsert). Tek bir `after insert or delete or update` tetiği
--    satır başına webhook attığı için, fiyatların HİÇBİRİ değişmese bile her "yeniden hesapla"
--    tıklaması 1044 HTTP çağrısı üretirdi — hepsi aynı ~32 aile yolunu tazelemek için.
--    `WHEN` koşulu yalnız UPDATE'te kurulabilir (INSERT'te OLD, DELETE'te NEW yoktur), o yüzden
--    ekleme/silme ayrı tetikte kalır ve güncelleme tetiği gerçekten DEĞİŞEN satırlarla sınırlanır.
drop trigger if exists on_product_prices_change on public.product_prices;
drop trigger if exists on_product_prices_ins_del on public.product_prices;
drop trigger if exists on_product_prices_upd on public.product_prices;

create trigger on_product_prices_ins_del
  after insert or delete on public.product_prices
  for each row execute function public.handle_supabase_webhook();

create trigger on_product_prices_upd
  after update on public.product_prices
  for each row
  when (
    old.net_price   is distinct from new.net_price
    or old.gross_price is distinct from new.gross_price
    or old.is_active   is distinct from new.is_active
    or old.currency    is distinct from new.currency
  )
  execute function public.handle_supabase_webhook();

-- 2) product_families: aile verisi değişince ilgili aile tag'i + PDP tazelensin
--    (route.ts case 4 zaten var — ölü kod yolunu canlandırıyoruz)
drop trigger if exists on_product_families_change on public.product_families;
create trigger on_product_families_change
  after insert or delete or update on public.product_families
  for each row execute function public.handle_supabase_webhook();

-- === Guard ===
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_product_prices_ins_del'
      and tgrelid = 'public.product_prices'::regclass
      and not tgisinternal
  ) then
    raise exception 'Guard: on_product_prices_ins_del tetiği oluşmadı';
  end if;

  -- WHEN koşulu SESSİZCE düşerse tetik yine kurulur ama gürültü filtresi kaybolur;
  -- bu yüzden koşulun VARLIĞI ayrıca doğrulanır (tgqual dolu olmalı).
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_product_prices_upd'
      and tgrelid = 'public.product_prices'::regclass
      and not tgisinternal
      and tgqual is not null
  ) then
    raise exception 'Guard: on_product_prices_upd tetiği yok ya da WHEN koşulu boş';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_product_families_change'
      and tgrelid = 'public.product_families'::regclass
      and not tgisinternal
  ) then
    raise exception 'Guard: on_product_families_change tetiği oluşmadı';
  end if;
end $$;

commit;
